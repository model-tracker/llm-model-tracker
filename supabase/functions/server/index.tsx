import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.tsx";
import * as scrapers from "./scrapers.tsx";

const app = new Hono();

app.use('*', logger(console.log));
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

app.get("/make-server-6d10c21b/health", (c) => c.json({ status: "ok" }));

// ─── GET /models ──────────────────────────────────────────────────────────────

app.get("/make-server-6d10c21b/models", async (c) => {
  try {
    const { data, error } = await db()
      .from("llm_models")
      .select("*")
      .order("release_date", { ascending: false });

    if (error) throw error;

    // Map snake_case columns → camelCase expected by the frontend
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
    // Fallback to KV store
    const models = await kv.get("llm_models");
    const lastUpdated = await kv.get("llm_models_last_updated");
    return c.json({ models: models || [], lastUpdated: lastUpdated || null, count: models?.length || 0 });
  }
});

// ─── GET /deprecations ────────────────────────────────────────────────────────

app.get("/make-server-6d10c21b/deprecations", async (c) => {
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

app.get("/make-server-6d10c21b/alerts", async (c) => {
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

app.patch("/make-server-6d10c21b/alerts/:id/read", async (c) => {
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

// ─── POST /scrape ─────────────────────────────────────────────────────────────

app.post("/make-server-6d10c21b/scrape", async (c) => {
  try {
    await scrapers.scrapeAndStoreAllData();
    return c.json({ success: true, message: "Data refresh completed", timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("Error during manual scrape:", err);
    return c.json({ error: "Failed to refresh data", message: (err as Error).message }, 500);
  }
});

// ─── GET /scrape-status ───────────────────────────────────────────────────────

app.get("/make-server-6d10c21b/scrape-status", async (c) => {
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

initializeScheduledRefresh();

Deno.serve(app.fetch);
