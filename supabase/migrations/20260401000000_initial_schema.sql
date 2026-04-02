-- LLM Model Tracker – Initial Schema
-- Run this in your Supabase SQL editor or via `supabase db push`

-- ─────────────────────────────────────────────
-- 1. llm_models
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS llm_models (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  provider          TEXT NOT NULL,
  release_date      DATE NOT NULL,
  deprecation_date  DATE,
  status            TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'deprecated', 'upcoming')),
  context_window    INTEGER,
  max_output_tokens INTEGER,
  input_pricing     TEXT,
  output_pricing    TEXT,
  capabilities      TEXT[]        NOT NULL DEFAULT '{}',
  replacement_model TEXT,
  notes             TEXT,
  source_url        TEXT,
  last_updated      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 2. llm_deprecations
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS llm_deprecations (
  id                TEXT PRIMARY KEY,
  model_id          TEXT REFERENCES llm_models(id) ON DELETE SET NULL,
  model_name        TEXT NOT NULL,
  provider          TEXT NOT NULL,
  deprecation_date  DATE NOT NULL,
  replacement_model TEXT,
  reason            TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 3. llm_alerts
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS llm_alerts (
  id         TEXT PRIMARY KEY,
  type       TEXT NOT NULL CHECK (type IN ('deprecation', 'new_model', 'update')),
  severity   TEXT NOT NULL CHECK (severity IN ('high', 'medium', 'low')),
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  model_id   TEXT,
  provider   TEXT NOT NULL,
  read       BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 4. Row Level Security
-- ─────────────────────────────────────────────
ALTER TABLE llm_models       ENABLE ROW LEVEL SECURITY;
ALTER TABLE llm_deprecations ENABLE ROW LEVEL SECURITY;
ALTER TABLE llm_alerts       ENABLE ROW LEVEL SECURITY;

-- Public (anon) can read everything
CREATE POLICY "public_read_models"
  ON llm_models FOR SELECT USING (TRUE);

CREATE POLICY "public_read_deprecations"
  ON llm_deprecations FOR SELECT USING (TRUE);

CREATE POLICY "public_read_alerts"
  ON llm_alerts FOR SELECT USING (TRUE);

-- Service role (edge functions) has full access
CREATE POLICY "service_role_all_models"
  ON llm_models FOR ALL
  USING      (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "service_role_all_deprecations"
  ON llm_deprecations FOR ALL
  USING      (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "service_role_all_alerts"
  ON llm_alerts FOR ALL
  USING      (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ─────────────────────────────────────────────
-- 5. Helpful indexes
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_llm_models_provider        ON llm_models(provider);
CREATE INDEX IF NOT EXISTS idx_llm_models_status          ON llm_models(status);
CREATE INDEX IF NOT EXISTS idx_llm_models_deprecation     ON llm_models(deprecation_date) WHERE deprecation_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_llm_deprecations_provider  ON llm_deprecations(provider);
CREATE INDEX IF NOT EXISTS idx_llm_alerts_provider        ON llm_alerts(provider);
CREATE INDEX IF NOT EXISTS idx_llm_alerts_read            ON llm_alerts(read);
