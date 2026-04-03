import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.tsx";
import * as scrapers from "./scrapers.tsx";

const app = new Hono().basePath("/server");

app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// ─── Supabase client (service role) ──────────────────────────────────────────

function db() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

// Helper: compute days until deprecation from a date string
function daysUntil(dateStr?: string | null): number | undefined {
  if (!dateStr) return undefined;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

// ─── Health ───────────────────────────────────────────────────────────────────

app.get("/health", (c) => c.json({ status: "ok" }));

// ─── GET /models ──────────────────────────────────────────────────────────────

app.get("/models", async (c) => {
  try {
    const { data, error } = await db()
      .from("llm_models")
      .select("*")
      .order("release_date", { ascending: false });

    if (error) throw error;

    const models = (data ?? []).map((row: any) => ({
      id: row.id,
      name: row.name,
      provider: row.provider,
      releaseDate: row.release_date,
      deprecationDate: row.deprecation_date ?? undefined,
      status: row.status,
      contextWindow: row.context_window ?? undefined,
      maxOutputTokens: row.max_output_tokens ?? undefined,
      inputPricing: row.input_pricing ?? undefined,
      outputPricing: row.output_pricing ?? undefined,
      capabilities: row.capabilities ?? [],
      replacementModel: row.replacement_model ?? undefined,
      notes: row.notes ?? undefined,
      sourceUrl: row.source_url,
      lastUpdated: row.last_updated,
      daysUntilDeprecation: daysUntil(row.deprecation_date),
    }));

    const lastUpdated = models.length > 0
      ? models.reduce((max: string, m: any) => m.lastUpdated > max ? m.lastUpdated : max, models[0].lastUpdated)
      : null;

    return c.json({ models, lastUpdated, count: models.length });
  } catch (err) {
    console.error("Error fetching models from DB:", err);
    const models = await kv.get("llm_models");
    const lastUpdated = await kv.get("llm_models_last_updated");
    return c.json({ models: models || [], lastUpdated: lastUpdated || null, count: models?.length || 0 });
  }
});

// ─── GET /deprecations ────────────────────────────────────────────────────────

app.get("/deprecations", async (c) => {
  try {
    const { data, error } = await db()
      .from("llm_deprecations")
      .select("*")
      .order("deprecation_date", { ascending: true });

    if (error) throw error;

    const deprecations = (data ?? []).map((row: any) => ({
      id: row.id,
      modelId: row.model_id ?? undefined,
      modelName: row.model_name,
      provider: row.provider,
      deprecationDate: row.deprecation_date,
      replacementModel: row.replacement_model ?? undefined,
      reason: row.reason ?? undefined,
      daysUntilDeprecation: daysUntil(row.deprecation_date),
    }));

    return c.json({ deprecations, lastUpdated: new Date().toISOString(), count: deprecations.length });
  } catch (err) {
    console.error("Error fetching deprecations from DB:", err);
    const deprecations = await kv.get("llm_deprecations");
    const lastUpdated = await kv.get("llm_deprecations_last_updated");
    return c.json({ deprecations: deprecations || [], lastUpdated: lastUpdated || null, count: deprecations?.length || 0 });
  }
});

// ─── GET /alerts ──────────────────────────────────────────────────────────────

app.get("/alerts", async (c) => {
  try {
    const { data, error } = await db()
      .from("llm_alerts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const alerts = (data ?? []).map((row: any) => ({
      id: row.id,
      type: row.type,
      severity: row.severity,
      title: row.title,
      message: row.message,
      modelId: row.model_id ?? undefined,
      provider: row.provider,
      read: row.read,
      createdAt: row.created_at,
    }));

    return c.json({ alerts, count: alerts.length });
  } catch (err) {
    console.error("Error fetching alerts from DB:", err);
    const alerts = await kv.get("llm_alerts");
    return c.json({ alerts: alerts || [], count: alerts?.length || 0 });
  }
});

// ─── PATCH /alerts/:id/read ───────────────────────────────────────────────────

app.patch("/alerts/:id/read", async (c) => {
  const id = c.req.param("id");
  try {
    const { error } = await db()
      .from("llm_alerts")
      .update({ read: true })
      .eq("id", id);
    if (error) throw error;
    return c.json({ success: true });
  } catch (err) {
    console.error("Error marking alert as read:", err);
    return c.json({ error: "Failed to update alert" }, 500);
  }
});

// ─── POST /subscribe ─────────────────────────────────────────────────────────

app.post("/subscribe", async (c) => {
  try {
    const { email, alertNewModels, alert60Days, alert7Days } = await c.req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return c.json({ error: "Invalid email address" }, 400);
    }
    const { error } = await db()
      .from("email_subscribers")
      .upsert({
        email,
        alert_new_models: alertNewModels ?? true,
        alert_60_days: alert60Days ?? true,
        alert_7_days: alert7Days ?? true,
      }, { onConflict: "email" });
    if (error) throw error;
    return c.json({ success: true });
  } catch (err) {
    console.error("Error subscribing:", err);
    return c.json({ error: "Failed to subscribe" }, 500);
  }
});

// ─── DELETE /unsubscribe/:email ───────────────────────────────────────────────

app.delete("/unsubscribe/:email", async (c) => {
  const email = c.req.param("email");
  try {
    const { error } = await db()
      .from("email_subscribers")
      .delete()
      .eq("email", email);
    if (error) throw error;
    return c.json({ success: true });
  } catch (err) {
    console.error("Error unsubscribing:", err);
    return c.json({ error: "Failed to unsubscribe" }, 500);
  }
});

// ─── POST /send-alerts ───────────────────────────────────────────────────────

app.post("/send-alerts", async (c) => {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) return c.json({ error: "RESEND_API_KEY not set" }, 500);

  try {
    const database = db();

    // Fetch subscribers and alerts
    const [{ data: subscribers }, { data: alerts }] = await Promise.all([
      database.from("email_subscribers").select("*"),
      database.from("llm_alerts").select("*"),
    ]);

    if (!subscribers?.length || !alerts?.length) {
      return c.json({ success: true, message: "No subscribers or alerts", sent: 0 });
    }

    let sent = 0;

    for (const sub of subscribers) {
      // Filter alerts based on subscriber preferences
      const relevantAlerts = alerts.filter((alert: any) => {
        if (alert.type === "new_model" && sub.alert_new_models) return true;
        if (alert.type === "deprecation") {
          const days = alert.message.match(/in (\d+) days/)?.[1];
          const d = days ? parseInt(days) : 999;
          if (sub.alert_7_days && d <= 7) return true;
          if (sub.alert_60_days && d <= 30) return true;
        }
        return false;
      });

      for (const alert of relevantAlerts) {
        // Check if already sent
        const { data: already } = await database
          .from("email_send_log")
          .select("id")
          .eq("subscriber_email", sub.email)
          .eq("alert_id", alert.id)
          .maybeSingle();

        if (already) continue;

        // Send email via Resend
        const subject = alert.type === "new_model"
          ? `New LLM Model: ${alert.title.replace("New Model: ", "")}`
          : `⚠️ ${alert.title}`;

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "LLM Tracker <onboarding@resend.dev>",
            to: sub.email,
            subject,
            html: `
              <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
                <h2 style="color:#1e293b">${alert.title}</h2>
                <p style="color:#475569;font-size:16px">${alert.message}</p>
                <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
                <a href="https://llm-model-tracker.vercel.app" style="background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
                  View Dashboard
                </a>
                <p style="color:#94a3b8;font-size:12px;margin-top:24px">
                  You're receiving this because you subscribed to LLM Model Tracker alerts.<br/>
                  <a href="https://ltnhsozxtypuriuclysc.supabase.co/functions/v1/server/unsubscribe/${sub.email}" style="color:#94a3b8">Unsubscribe</a>
                </p>
              </div>
            `,
          }),
        });

        if (res.ok) {
          await database.from("email_send_log").insert({
            subscriber_email: sub.email,
            alert_id: alert.id,
          });
          sent++;
        } else {
          console.error("Resend error:", await res.text());
        }
      }
    }

    return c.json({ success: true, sent });
  } catch (err) {
    console.error("Error sending alerts:", err);
    return c.json({ error: "Failed to send alerts", message: (err as Error).message }, 500);
  }
});

// ─── POST /scrape ─────────────────────────────────────────────────────────────

app.post("/scrape", async (c) => {
  try {
    await scrapers.scrapeAndStoreAllData();
    return c.json({ success: true, message: "Data refresh completed", timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("Error during manual scrape:", err);
    return c.json({ error: "Failed to refresh data", message: (err as Error).message }, 500);
  }
});

// ─── GET /scrape-status ───────────────────────────────────────────────────────

app.get("/scrape-status", async (c) => {
  try {
    const status = await kv.get("scrape_status");
    return c.json(status || { lastRun: null, status: "not_started" });
  } catch (err) {
    return c.json({ error: "Failed to fetch status" }, 500);
  }
});

// ─── Scheduled refresh (3× daily: 09:00, 14:00, 18:00 UTC) ──────────────────

async function initializeScheduledRefresh() {
  console.log("Running initial data refresh on startup...");
  try {
    await scrapers.scrapeAndStoreAllData();
    console.log("Initial refresh completed.");
  } catch (err) {
    console.error("Initial refresh failed:", err);
  }

  setInterval(async () => {
    const h = new Date().getUTCHours();
    const m = new Date().getUTCMinutes();
    if ((h === 9 || h === 14 || h === 18) && m === 0) {
      console.log(`Scheduled refresh at ${new Date().toISOString()}`);
      try {
        await scrapers.scrapeAndStoreAllData();
      } catch (err) {
        console.error("Scheduled refresh failed:", err);
      }
    }
  }, 60_000);
}

Deno.serve((req) => app.fetch(req));

initializeScheduledRefresh();
