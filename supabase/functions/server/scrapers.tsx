// LLM Model Tracker – Data service
// Maintains curated model data sourced from official provider documentation.
// Writes to both the Supabase relational tables (llm_models, llm_deprecations,
// llm_alerts) and the KV store for backward compatibility.
//
// Sources (April 2026):
//   https://platform.openai.com/docs/models
//   https://platform.openai.com/docs/deprecations
//   https://platform.claude.com/docs/en/docs/about-claude/models/overview
//   https://ai.google.dev/gemini-api/docs/models
//   https://ai.google.dev/gemini-api/docs/changelog
//   https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models
//   https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/model-retirements
//   https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html
//   https://docs.x.ai/docs

import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ModelData {
  id: string;
  name: string;
  provider: string;
  releaseDate: string;
  deprecationDate?: string;
  status: 'active' | 'deprecated' | 'upcoming';
  contextWindow?: number;
  maxOutputTokens?: number;
  inputPricing?: string;
  outputPricing?: string;
  capabilities: string[];
  replacementModel?: string;
  notes?: string;
  lastUpdated: string;
  sourceUrl: string;
  daysUntilDeprecation?: number;
}

interface DeprecationInfo {
  id: string;
  modelId?: string;
  modelName: string;
  provider: string;
  deprecationDate: string;
  replacementModel?: string;
  reason?: string;
  daysUntilDeprecation?: number;
}

interface Alert {
  id: string;
  type: 'deprecation' | 'new_model' | 'update';
  severity: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  modelId?: string;
  provider: string;
  createdAt: string;
  read: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysUntil(dateStr?: string): number | undefined {
  if (!dateStr) return undefined;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

function supabase() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

const NOW = new Date().toISOString();

// ─── Live API fetchers ────────────────────────────────────────────────────────

// Infer capabilities from model id/name
function inferCapabilities(id: string, name: string): string[] {
  const s = (id + ' ' + name).toLowerCase();
  const caps: string[] = ['Text'];
  if (s.includes('vision') || s.includes('vl') || s.includes('gemini') || s.includes('gpt-4') || s.includes('claude') || s.includes('grok')) caps.push('Vision');
  if (!s.includes('whisper') && !s.includes('tts') && !s.includes('dall') && !s.includes('embed')) caps.push('Function Calling');
  if (s.includes('agent') || s.includes('o1') || s.includes('o3') || s.includes('o4') || s.includes('gemini') || s.includes('claude')) caps.push('Agents');
  return [...new Set(caps)];
}

// Fetch live models from OpenAI API
async function fetchOpenAIModels(): Promise<Omit<ModelData, 'lastUpdated' | 'daysUntilDeprecation'>[]> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) { console.warn('OPENAI_API_KEY not set, skipping live fetch'); return []; }

  const res = await fetch('https://api.openai.com/v1/models', {
    headers: { 'Authorization': `Bearer ${apiKey}` },
  });
  if (!res.ok) { console.error('OpenAI API error:', res.status); return []; }

  const { data } = await res.json() as { data: { id: string; created: number; owned_by: string }[] };

  // Filter to user-facing chat/completion models only
  const keep = /^(gpt|o1|o3|o4|chatgpt)/;
  const skip = /instruct|vision-preview|0301|0314|0613|0125|research|realtime|audio|search|tts|whisper|dall|embed|moderat/;

  return data
    .filter(m => keep.test(m.id) && !skip.test(m.id))
    .map(m => {
      const releaseDate = new Date(m.created * 1000).toISOString().split('T')[0];
      return {
        id: `openai-${m.id.replace(/[^a-z0-9]/g, '-')}`,
        name: m.id,
        provider: 'OpenAI',
        releaseDate,
        status: 'active' as const,
        capabilities: inferCapabilities(m.id, m.id),
        sourceUrl: 'https://platform.openai.com/docs/models',
      };
    });
}

// Fetch live models from Anthropic API
async function fetchAnthropicModels(): Promise<Omit<ModelData, 'lastUpdated' | 'daysUntilDeprecation'>[]> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) { console.warn('ANTHROPIC_API_KEY not set, skipping live fetch'); return []; }

  const res = await fetch('https://api.anthropic.com/v1/models', {
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
  });
  if (!res.ok) { console.error('Anthropic API error:', res.status); return []; }

  const { data } = await res.json() as { data: { id: string; display_name: string; created_at: string }[] };

  return data.map(m => ({
    id: `anthropic-${m.id.replace(/[^a-z0-9]/g, '-')}`,
    name: m.display_name,
    provider: 'Anthropic',
    releaseDate: m.created_at.split('T')[0],
    status: 'active' as const,
    capabilities: inferCapabilities(m.id, m.display_name),
    sourceUrl: 'https://docs.anthropic.com/en/docs/about-claude/models/overview',
  }));
}

// Fetch live models from Google Gemini API
async function fetchGeminiModels(): Promise<Omit<ModelData, 'lastUpdated' | 'daysUntilDeprecation'>[]> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) { console.warn('GEMINI_API_KEY not set, skipping live fetch'); return []; }

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  if (!res.ok) { console.error('Gemini API error:', res.status); return []; }

  const { models } = await res.json() as {
    models: {
      name: string;
      displayName: string;
      description?: string;
      inputTokenLimit?: number;
      outputTokenLimit?: number;
    }[]
  };

  const keep = /gemini/;
  const skip = /embedding|retrieval|aqa|legacy/;

  return models
    .filter(m => keep.test(m.name) && !skip.test(m.name))
    .map(m => {
      const shortId = m.name.replace('models/', '');
      return {
        id: `google-${shortId.replace(/[^a-z0-9]/g, '-')}`,
        name: m.displayName,
        provider: 'Google',
        releaseDate: '2024-01-01', // Gemini API doesn't expose release dates
        status: 'active' as const,
        contextWindow: m.inputTokenLimit,
        maxOutputTokens: m.outputTokenLimit,
        capabilities: inferCapabilities(shortId, m.displayName),
        sourceUrl: 'https://ai.google.dev/gemini-api/docs/models',
      };
    });
}

// ─── Curated model catalogue (used as base + fallback) ────────────────────────

function buildCuratedModels(): Omit<ModelData, 'lastUpdated' | 'daysUntilDeprecation'>[] {
  const models: Omit<ModelData, 'lastUpdated' | 'daysUntilDeprecation'>[] = [

    // OpenAI
    { id: 'openai-gpt-5-4-pro',   name: 'GPT-5.4 Pro',   provider: 'OpenAI', releaseDate: '2026-03-05', status: 'active',     contextWindow: 1_050_000, maxOutputTokens: 128_000, capabilities: ['Text','Vision','Function Calling','JSON Mode','Agents'], notes: 'Latest flagship – registration required', sourceUrl: 'https://platform.openai.com/docs/models' },
    { id: 'openai-gpt-5-4-mini',  name: 'GPT-5.4 Mini',  provider: 'OpenAI', releaseDate: '2026-03-17', deprecationDate: '2027-09-17', status: 'active', contextWindow: 400_000, maxOutputTokens: 128_000, capabilities: ['Text','Vision','Function Calling','JSON Mode'], sourceUrl: 'https://platform.openai.com/docs/models' },
    { id: 'openai-gpt-5-2',       name: 'GPT-5.2',       provider: 'OpenAI', releaseDate: '2025-12-11', deprecationDate: '2027-05-12', status: 'active', contextWindow: 400_000, maxOutputTokens: 128_000, capabilities: ['Text','Vision','Function Calling','JSON Mode','Agents'], sourceUrl: 'https://platform.openai.com/docs/models' },
    { id: 'openai-gpt-5-1',       name: 'GPT-5.1',       provider: 'OpenAI', releaseDate: '2025-11-13', deprecationDate: '2027-05-15', status: 'active', contextWindow: 400_000, maxOutputTokens: 128_000, capabilities: ['Text','Vision','Function Calling','JSON Mode','Agents'], sourceUrl: 'https://platform.openai.com/docs/models' },
    { id: 'openai-gpt-5',         name: 'GPT-5',         provider: 'OpenAI', releaseDate: '2025-08-07', deprecationDate: '2027-02-06', status: 'active', contextWindow: 400_000, maxOutputTokens: 128_000, capabilities: ['Text','Vision','Function Calling','JSON Mode','Agents'], notes: 'First GPT-5 release', sourceUrl: 'https://platform.openai.com/docs/models' },
    { id: 'openai-o4-mini',       name: 'o4-mini',       provider: 'OpenAI', releaseDate: '2025-04-16', deprecationDate: '2026-10-16', status: 'active', contextWindow: 200_000, maxOutputTokens: 100_000, inputPricing: '$1.10 / 1M tokens', outputPricing: '$4.40 / 1M tokens', capabilities: ['Text','Function Calling','Agents'], notes: 'Latest mini reasoning', sourceUrl: 'https://platform.openai.com/docs/models' },
    { id: 'openai-o3-pro',        name: 'o3-pro',        provider: 'OpenAI', releaseDate: '2025-06-10', deprecationDate: '2026-12-10', status: 'active', contextWindow: 200_000, maxOutputTokens: 100_000, inputPricing: '$20.00 / 1M tokens', outputPricing: '$80.00 / 1M tokens', capabilities: ['Text','Function Calling','Agents'], sourceUrl: 'https://platform.openai.com/docs/models' },
    { id: 'openai-o3',            name: 'o3',            provider: 'OpenAI', releaseDate: '2025-04-16', deprecationDate: '2026-10-16', status: 'active', contextWindow: 200_000, maxOutputTokens: 100_000, inputPricing: '$10.00 / 1M tokens', outputPricing: '$40.00 / 1M tokens', capabilities: ['Text','Function Calling','Agents'], sourceUrl: 'https://platform.openai.com/docs/models' },
    { id: 'openai-gpt-4-1',       name: 'GPT-4.1',       provider: 'OpenAI', releaseDate: '2025-04-14', deprecationDate: '2026-10-14', status: 'active', contextWindow: 1_047_576, maxOutputTokens: 32_768, inputPricing: '$2.00 / 1M tokens', outputPricing: '$8.00 / 1M tokens', capabilities: ['Text','Vision','Function Calling','JSON Mode'], replacementModel: 'GPT-5', sourceUrl: 'https://platform.openai.com/docs/models' },
    { id: 'openai-gpt-4-1-mini',  name: 'GPT-4.1 Mini',  provider: 'OpenAI', releaseDate: '2025-04-14', deprecationDate: '2026-10-14', status: 'active', contextWindow: 1_047_576, maxOutputTokens: 32_768, inputPricing: '$0.40 / 1M tokens', outputPricing: '$1.60 / 1M tokens', capabilities: ['Text','Vision','Function Calling','JSON Mode'], replacementModel: 'GPT-5 Mini', sourceUrl: 'https://platform.openai.com/docs/models' },
    { id: 'openai-o3-mini',       name: 'o3-mini',       provider: 'OpenAI', releaseDate: '2025-01-31', deprecationDate: '2026-08-02', status: 'active', contextWindow: 200_000, maxOutputTokens: 100_000, inputPricing: '$1.10 / 1M tokens', outputPricing: '$4.40 / 1M tokens', capabilities: ['Text','Function Calling','Agents'], replacementModel: 'o4-mini', sourceUrl: 'https://platform.openai.com/docs/models' },
    { id: 'openai-o1',            name: 'o1',            provider: 'OpenAI', releaseDate: '2024-12-17', deprecationDate: '2026-07-15', status: 'active', contextWindow: 200_000, maxOutputTokens: 100_000, inputPricing: '$15.00 / 1M tokens', outputPricing: '$60.00 / 1M tokens', capabilities: ['Text','Function Calling','Agents'], replacementModel: 'o3', sourceUrl: 'https://platform.openai.com/docs/models' },
    { id: 'openai-gpt-4o',        name: 'GPT-4o',        provider: 'OpenAI', releaseDate: '2024-11-20', deprecationDate: '2026-10-01', status: 'active', contextWindow: 128_000, maxOutputTokens: 16_384, inputPricing: '$2.50 / 1M tokens', outputPricing: '$10.00 / 1M tokens', capabilities: ['Text','Vision','Function Calling','JSON Mode'], replacementModel: 'GPT-5.1', sourceUrl: 'https://platform.openai.com/docs/models' },
    { id: 'openai-gpt-4o-mini',   name: 'GPT-4o Mini',   provider: 'OpenAI', releaseDate: '2024-07-18', deprecationDate: '2026-10-01', status: 'active', contextWindow: 128_000, maxOutputTokens: 16_384, inputPricing: '$0.15 / 1M tokens', outputPricing: '$0.60 / 1M tokens', capabilities: ['Text','Vision','Function Calling','JSON Mode'], replacementModel: 'GPT-4.1 Mini', sourceUrl: 'https://platform.openai.com/docs/models' },
    { id: 'openai-gpt-4-turbo',   name: 'GPT-4 Turbo',   provider: 'OpenAI', releaseDate: '2024-04-09', deprecationDate: '2025-04-09', status: 'deprecated', contextWindow: 128_000, maxOutputTokens: 4_096, inputPricing: '$10.00 / 1M tokens', outputPricing: '$30.00 / 1M tokens', capabilities: ['Text','Vision','Function Calling','JSON Mode'], replacementModel: 'GPT-4o', sourceUrl: 'https://platform.openai.com/docs/deprecations' },
    { id: 'openai-gpt-4-5',       name: 'GPT-4.5',       provider: 'OpenAI', releaseDate: '2025-02-27', deprecationDate: '2025-12-01', status: 'deprecated', contextWindow: 128_000, maxOutputTokens: 16_384, inputPricing: '$75.00 / 1M tokens', outputPricing: '$150.00 / 1M tokens', capabilities: ['Text','Vision','Function Calling','JSON Mode'], replacementModel: 'GPT-5', notes: 'Replaced by GPT-5 family', sourceUrl: 'https://platform.openai.com/docs/deprecations' },

    // Anthropic
    { id: 'anthropic-claude-opus-4-6',   name: 'Claude Opus 4.6',   provider: 'Anthropic', releaseDate: '2026-03-01', status: 'active', contextWindow: 1_000_000, maxOutputTokens: 128_000, inputPricing: '$5.00 / 1M tokens', outputPricing: '$25.00 / 1M tokens', capabilities: ['Text','Vision','Function Calling','Agents'], notes: 'Extended + adaptive thinking', sourceUrl: 'https://platform.claude.com/docs/en/docs/about-claude/models/overview' },
    { id: 'anthropic-claude-sonnet-4-6', name: 'Claude Sonnet 4.6', provider: 'Anthropic', releaseDate: '2026-03-01', status: 'active', contextWindow: 1_000_000, maxOutputTokens: 64_000, inputPricing: '$3.00 / 1M tokens', outputPricing: '$15.00 / 1M tokens', capabilities: ['Text','Vision','Function Calling','Agents'], notes: 'Best speed/intelligence balance', sourceUrl: 'https://platform.claude.com/docs/en/docs/about-claude/models/overview' },
    { id: 'anthropic-claude-haiku-4-5',  name: 'Claude Haiku 4.5',  provider: 'Anthropic', releaseDate: '2025-10-01', status: 'active', contextWindow: 200_000, maxOutputTokens: 64_000, inputPricing: '$1.00 / 1M tokens', outputPricing: '$5.00 / 1M tokens', capabilities: ['Text','Vision','Function Calling'], sourceUrl: 'https://platform.claude.com/docs/en/docs/about-claude/models/overview' },
    { id: 'anthropic-claude-opus-4-5',   name: 'Claude Opus 4.5',   provider: 'Anthropic', releaseDate: '2025-11-01', status: 'active', contextWindow: 200_000, maxOutputTokens: 64_000, inputPricing: '$5.00 / 1M tokens', outputPricing: '$25.00 / 1M tokens', capabilities: ['Text','Vision','Function Calling','Agents'], sourceUrl: 'https://platform.claude.com/docs/en/docs/about-claude/models/overview' },
    { id: 'anthropic-claude-sonnet-4-5', name: 'Claude Sonnet 4.5', provider: 'Anthropic', releaseDate: '2025-09-29', status: 'active', contextWindow: 200_000, maxOutputTokens: 64_000, inputPricing: '$3.00 / 1M tokens', outputPricing: '$15.00 / 1M tokens', capabilities: ['Text','Vision','Function Calling','Agents'], sourceUrl: 'https://platform.claude.com/docs/en/docs/about-claude/models/overview' },
    { id: 'anthropic-claude-sonnet-4',   name: 'Claude Sonnet 4',   provider: 'Anthropic', releaseDate: '2025-05-14', status: 'active', contextWindow: 200_000, maxOutputTokens: 64_000, inputPricing: '$3.00 / 1M tokens', outputPricing: '$15.00 / 1M tokens', capabilities: ['Text','Vision','Function Calling','Agents'], sourceUrl: 'https://platform.claude.com/docs/en/docs/about-claude/models/overview' },
    { id: 'anthropic-claude-3-5-haiku',  name: 'Claude 3.5 Haiku',  provider: 'Anthropic', releaseDate: '2024-11-05', status: 'active', contextWindow: 200_000, maxOutputTokens: 8_192, inputPricing: '$0.80 / 1M tokens', outputPricing: '$4.00 / 1M tokens', capabilities: ['Text','Vision','Function Calling','JSON Mode'], notes: 'Fastest, most compact Claude 3.5 model', sourceUrl: 'https://platform.claude.com/docs/en/docs/about-claude/models/overview' },
    { id: 'anthropic-claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', releaseDate: '2024-10-22', status: 'active', contextWindow: 200_000, maxOutputTokens: 8_192, inputPricing: '$3.00 / 1M tokens', outputPricing: '$15.00 / 1M tokens', capabilities: ['Text','Vision','Function Calling','Agents'], sourceUrl: 'https://platform.claude.com/docs/en/docs/about-claude/models/overview' },
    { id: 'anthropic-claude-3-haiku',    name: 'Claude 3 Haiku',    provider: 'Anthropic', releaseDate: '2024-03-07', deprecationDate: '2026-04-19', status: 'active', contextWindow: 200_000, maxOutputTokens: 4_096, inputPricing: '$0.25 / 1M tokens', outputPricing: '$1.25 / 1M tokens', capabilities: ['Text','Vision','Function Calling'], replacementModel: 'Claude Haiku 4.5', notes: 'RETIRING Apr 19 2026', sourceUrl: 'https://platform.claude.com/docs/en/docs/about-claude/models/overview' },
    { id: 'anthropic-claude-3-opus',     name: 'Claude 3 Opus',     provider: 'Anthropic', releaseDate: '2024-03-04', status: 'deprecated', contextWindow: 200_000, maxOutputTokens: 4_096, inputPricing: '$15.00 / 1M tokens', outputPricing: '$75.00 / 1M tokens', capabilities: ['Text','Vision','Function Calling'], replacementModel: 'Claude Opus 4.6', sourceUrl: 'https://platform.claude.com/docs/en/docs/about-claude/models/overview' },

    // Google Gemini
    { id: 'google-gemini-3-1-flash-live', name: 'Gemini 3.1 Flash Live Preview', provider: 'Google', releaseDate: '2026-03-26', status: 'active', contextWindow: 1_000_000, maxOutputTokens: 8_192, capabilities: ['Text','Vision','Agents'], notes: 'Real-time voice/video', sourceUrl: 'https://ai.google.dev/gemini-api/docs/models' },
    { id: 'google-gemini-3-1-flash-lite', name: 'Gemini 3.1 Flash-Lite Preview', provider: 'Google', releaseDate: '2026-03-03', status: 'active', contextWindow: 1_000_000, maxOutputTokens: 8_192, capabilities: ['Text','Vision','Function Calling','JSON Mode'], sourceUrl: 'https://ai.google.dev/gemini-api/docs/models' },
    { id: 'google-gemini-3-1-pro',        name: 'Gemini 3.1 Pro Preview',        provider: 'Google', releaseDate: '2026-02-19', status: 'active', contextWindow: 1_000_000, maxOutputTokens: 8_192, capabilities: ['Text','Vision','Function Calling','JSON Mode','Agents'], notes: 'Advanced reasoning & agentic', sourceUrl: 'https://ai.google.dev/gemini-api/docs/models' },
    { id: 'google-gemini-2-5-pro',        name: 'Gemini 2.5 Pro',                provider: 'Google', releaseDate: '2025-12-01', status: 'active', contextWindow: 1_000_000, maxOutputTokens: 8_192, inputPricing: '$1.25 / 1M tokens', outputPricing: '$5.00 / 1M tokens', capabilities: ['Text','Vision','Function Calling','JSON Mode','Agents'], notes: 'Deep reasoning, complex tasks', sourceUrl: 'https://ai.google.dev/gemini-api/docs/models' },
    { id: 'google-gemini-2-5-flash',      name: 'Gemini 2.5 Flash',              provider: 'Google', releaseDate: '2025-09-01', status: 'active', contextWindow: 1_000_000, maxOutputTokens: 8_192, inputPricing: '$0.30 / 1M tokens', outputPricing: '$1.20 / 1M tokens', capabilities: ['Text','Vision','Function Calling','JSON Mode'], notes: 'Best price-performance', sourceUrl: 'https://ai.google.dev/gemini-api/docs/models' },
    { id: 'google-gemini-2-5-flash-lite', name: 'Gemini 2.5 Flash-Lite',         provider: 'Google', releaseDate: '2025-09-01', status: 'active', contextWindow: 1_000_000, maxOutputTokens: 8_192, inputPricing: '$0.10 / 1M tokens', outputPricing: '$0.40 / 1M tokens', capabilities: ['Text','Vision','Function Calling'], notes: 'Fastest, most budget-friendly', sourceUrl: 'https://ai.google.dev/gemini-api/docs/models' },
    { id: 'google-gemini-2-0-flash',      name: 'Gemini 2.0 Flash',              provider: 'Google', releaseDate: '2025-02-05', deprecationDate: '2026-06-01', status: 'active', contextWindow: 1_000_000, maxOutputTokens: 8_192, inputPricing: '$0.10 / 1M tokens', outputPricing: '$0.40 / 1M tokens', capabilities: ['Text','Vision','Function Calling','JSON Mode'], replacementModel: 'Gemini 2.5 Flash', notes: 'Retiring Jun 1 2026', sourceUrl: 'https://ai.google.dev/gemini-api/docs/changelog' },
    { id: 'google-gemini-1-5-pro',        name: 'Gemini 1.5 Pro',                provider: 'Google', releaseDate: '2024-02-15', status: 'active', contextWindow: 2_000_000, maxOutputTokens: 8_192, inputPricing: '$1.25 / 1M tokens', outputPricing: '$5.00 / 1M tokens', capabilities: ['Text','Vision','Function Calling','JSON Mode'], notes: '2M token context', sourceUrl: 'https://ai.google.dev/gemini-api/docs/models' },
    { id: 'google-gemini-1-5-flash',      name: 'Gemini 1.5 Flash',              provider: 'Google', releaseDate: '2024-05-14', status: 'active', contextWindow: 1_000_000, maxOutputTokens: 8_192, inputPricing: '$0.075 / 1M tokens', outputPricing: '$0.30 / 1M tokens', capabilities: ['Text','Vision','Function Calling'], sourceUrl: 'https://ai.google.dev/gemini-api/docs/models' },
    { id: 'google-gemini-3-pro-preview',  name: 'Gemini 3 Pro Preview',          provider: 'Google', releaseDate: '2026-01-15', deprecationDate: '2026-03-09', status: 'deprecated', contextWindow: 1_000_000, maxOutputTokens: 8_192, capabilities: ['Text','Vision','Function Calling','Agents'], replacementModel: 'Gemini 3.1 Pro Preview', notes: 'Shutdown Mar 9 2026', sourceUrl: 'https://ai.google.dev/gemini-api/docs/changelog' },

    // Azure OpenAI
    { id: 'azure-gpt-5-4',     name: 'GPT-5.4 (Azure)',    provider: 'Azure OpenAI', releaseDate: '2026-03-05', deprecationDate: '2027-09-05', status: 'active', contextWindow: 1_050_000, maxOutputTokens: 128_000, capabilities: ['Text','Vision','Function Calling','JSON Mode','Agents'], sourceUrl: 'https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models' },
    { id: 'azure-gpt-5-1',     name: 'GPT-5.1 (Azure)',    provider: 'Azure OpenAI', releaseDate: '2025-11-13', deprecationDate: '2027-05-15', status: 'active', contextWindow: 400_000, maxOutputTokens: 128_000, capabilities: ['Text','Vision','Function Calling','JSON Mode','Agents'], sourceUrl: 'https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models' },
    { id: 'azure-gpt-4-1',     name: 'GPT-4.1 (Azure)',    provider: 'Azure OpenAI', releaseDate: '2025-04-14', deprecationDate: '2026-10-14', status: 'active', contextWindow: 1_047_576, maxOutputTokens: 32_768, capabilities: ['Text','Vision','Function Calling','JSON Mode'], replacementModel: 'GPT-5', sourceUrl: 'https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/model-retirements' },
    { id: 'azure-o4-mini',     name: 'o4-mini (Azure)',     provider: 'Azure OpenAI', releaseDate: '2025-04-16', deprecationDate: '2026-10-16', status: 'active', contextWindow: 200_000, maxOutputTokens: 100_000, capabilities: ['Text','Function Calling','Agents'], sourceUrl: 'https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models' },
    { id: 'azure-o3',          name: 'o3 (Azure)',          provider: 'Azure OpenAI', releaseDate: '2025-04-16', deprecationDate: '2026-10-16', status: 'active', contextWindow: 200_000, maxOutputTokens: 100_000, capabilities: ['Text','Function Calling','Agents'], sourceUrl: 'https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models' },
    { id: 'azure-gpt-4o',      name: 'GPT-4o (Azure)',      provider: 'Azure OpenAI', releaseDate: '2024-11-20', deprecationDate: '2026-10-01', status: 'active', contextWindow: 128_000, maxOutputTokens: 16_384, capabilities: ['Text','Vision','Function Calling','JSON Mode'], replacementModel: 'GPT-5.1', notes: 'Standard deployment retiring Mar 31 2026', sourceUrl: 'https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/model-retirements' },
    { id: 'azure-gpt-4o-mini', name: 'GPT-4o Mini (Azure)', provider: 'Azure OpenAI', releaseDate: '2024-07-18', deprecationDate: '2026-10-01', status: 'active', contextWindow: 128_000, maxOutputTokens: 16_384, capabilities: ['Text','Vision','Function Calling','JSON Mode'], replacementModel: 'GPT-4.1 Mini', sourceUrl: 'https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/model-retirements' },

    // Amazon Bedrock
    { id: 'bedrock-claude-opus-4-6',   name: 'Claude Opus 4.6 (Bedrock)',   provider: 'Amazon Bedrock', releaseDate: '2026-03-01', status: 'active', contextWindow: 1_000_000, maxOutputTokens: 128_000, inputPricing: '$5.00 / 1M tokens', outputPricing: '$25.00 / 1M tokens', capabilities: ['Text','Vision','Function Calling','Agents'], notes: 'anthropic.claude-opus-4-6-v1', sourceUrl: 'https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html' },
    { id: 'bedrock-claude-sonnet-4-6', name: 'Claude Sonnet 4.6 (Bedrock)', provider: 'Amazon Bedrock', releaseDate: '2026-03-01', status: 'active', contextWindow: 1_000_000, maxOutputTokens: 64_000, inputPricing: '$3.00 / 1M tokens', outputPricing: '$15.00 / 1M tokens', capabilities: ['Text','Vision','Function Calling','Agents'], notes: 'anthropic.claude-sonnet-4-6', sourceUrl: 'https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html' },
    { id: 'bedrock-claude-haiku-4-5',  name: 'Claude Haiku 4.5 (Bedrock)',  provider: 'Amazon Bedrock', releaseDate: '2025-10-01', status: 'active', contextWindow: 200_000, maxOutputTokens: 64_000, inputPricing: '$1.00 / 1M tokens', outputPricing: '$5.00 / 1M tokens', capabilities: ['Text','Vision','Function Calling'], notes: 'anthropic.claude-haiku-4-5-20251001-v1:0', sourceUrl: 'https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html' },
    { id: 'bedrock-nova-premier',      name: 'Amazon Nova Premier',         provider: 'Amazon Bedrock', releaseDate: '2025-04-01', status: 'active', contextWindow: 300_000, maxOutputTokens: 5_120, inputPricing: '$0.25 / 1M tokens', outputPricing: '$1.00 / 1M tokens', capabilities: ['Text','Vision','Agents'], notes: 'amazon.nova-premier-v1:0', sourceUrl: 'https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html' },
    { id: 'bedrock-nova-pro',          name: 'Amazon Nova Pro',             provider: 'Amazon Bedrock', releaseDate: '2024-12-03', status: 'active', contextWindow: 300_000, maxOutputTokens: 5_120, inputPricing: '$0.80 / 1M tokens', outputPricing: '$3.20 / 1M tokens', capabilities: ['Text','Vision','Agents'], notes: 'amazon.nova-pro-v1:0; video+image', sourceUrl: 'https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html' },
    { id: 'bedrock-nova-lite',         name: 'Amazon Nova Lite',            provider: 'Amazon Bedrock', releaseDate: '2024-12-03', status: 'active', contextWindow: 300_000, maxOutputTokens: 5_120, inputPricing: '$0.06 / 1M tokens', outputPricing: '$0.24 / 1M tokens', capabilities: ['Text','Vision'], notes: 'amazon.nova-lite-v1:0', sourceUrl: 'https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html' },
    { id: 'bedrock-llama4-maverick',   name: 'Llama 4 Maverick 17B',        provider: 'Amazon Bedrock', releaseDate: '2025-04-05', status: 'active', contextWindow: 524_288, maxOutputTokens: 8_192, inputPricing: '$0.20 / 1M tokens', outputPricing: '$0.60 / 1M tokens', capabilities: ['Text','Vision'], notes: 'meta.llama4-maverick-17b-instruct-v1:0', sourceUrl: 'https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html' },

    // xAI
    { id: 'xai-grok-3',             name: 'Grok 3',           provider: 'xAI', releaseDate: '2025-02-17', status: 'active', contextWindow: 131_072, maxOutputTokens: 32_768, inputPricing: '$3.00 / 1M tokens', outputPricing: '$15.00 / 1M tokens', capabilities: ['Text','Vision','Function Calling','Agents'], notes: 'Real-time X knowledge', sourceUrl: 'https://docs.x.ai/docs' },
    { id: 'xai-grok-3-mini',        name: 'Grok 3 Mini',      provider: 'xAI', releaseDate: '2025-02-17', status: 'active', contextWindow: 131_072, maxOutputTokens: 32_768, inputPricing: '$0.30 / 1M tokens', outputPricing: '$0.50 / 1M tokens', capabilities: ['Text','Function Calling'], sourceUrl: 'https://docs.x.ai/docs' },
    { id: 'xai-grok-2-vision-1212', name: 'Grok 2 Vision',    provider: 'xAI', releaseDate: '2024-12-12', status: 'active', contextWindow: 32_768, maxOutputTokens: 16_384, inputPricing: '$2.00 / 1M tokens', outputPricing: '$10.00 / 1M tokens', capabilities: ['Text','Vision'], sourceUrl: 'https://docs.x.ai/docs' },
    { id: 'xai-grok-2-1212',        name: 'Grok 2 (1212)',    provider: 'xAI', releaseDate: '2024-12-12', status: 'active', contextWindow: 131_072, maxOutputTokens: 32_768, inputPricing: '$2.00 / 1M tokens', outputPricing: '$10.00 / 1M tokens', capabilities: ['Text','Vision','Function Calling'], sourceUrl: 'https://docs.x.ai/docs' },
  ];

  return models.map(m => ({
    ...m,
    lastUpdated: NOW,
    daysUntilDeprecation: daysUntil(m.deprecationDate),
  }));
}

// ─── Merge live API data with curated catalogue ───────────────────────────────
// Live API models take precedence (they're always current).
// Curated models fill gaps: providers with no public API (Azure, xAI, Bedrock)
// plus enriched metadata (pricing, deprecation dates, replacement models) that
// the live APIs don't expose.

async function buildModels(): Promise<ModelData[]> {
  const [openaiLive, anthropicLive, geminiLive] = await Promise.allSettled([
    fetchOpenAIModels(),
    fetchAnthropicModels(),
    fetchGeminiModels(),
  ]);

  const liveModels: Omit<ModelData, 'lastUpdated' | 'daysUntilDeprecation'>[] = [
    ...(openaiLive.status === 'fulfilled' ? openaiLive.value : []),
    ...(anthropicLive.status === 'fulfilled' ? anthropicLive.value : []),
    ...(geminiLive.status === 'fulfilled' ? geminiLive.value : []),
  ];

  const curated = buildCuratedModels();

  // Build a map of curated models by id for enrichment lookup
  const curatedById = new Map(curated.map(m => [m.id, m]));
  // Build a map from live models for deduplication
  const liveById = new Map(liveModels.map(m => [m.id, m]));

  // Enrich live models with curated metadata (pricing, deprecation, replacement)
  const enrichedLive = liveModels.map(live => {
    const extra = curatedById.get(live.id);
    if (!extra) return live;
    return {
      ...live,
      // Keep live name/capabilities but layer in curated enrichment fields
      deprecationDate: extra.deprecationDate ?? live.deprecationDate,
      replacementModel: extra.replacementModel ?? live.replacementModel,
      inputPricing: extra.inputPricing ?? live.inputPricing,
      outputPricing: extra.outputPricing ?? live.outputPricing,
      contextWindow: live.contextWindow ?? extra.contextWindow,
      maxOutputTokens: live.maxOutputTokens ?? extra.maxOutputTokens,
      notes: extra.notes ?? live.notes,
      status: extra.status,
    };
  });

  // Add curated-only models (Azure, xAI, Bedrock, plus any not yet in live API)
  const curatedOnly = curated.filter(m => !liveById.has(m.id));

  const all = [...enrichedLive, ...curatedOnly];

  return all.map(m => ({
    ...m,
    lastUpdated: NOW,
    daysUntilDeprecation: daysUntil(m.deprecationDate),
  }));
}

function buildDeprecations(models: ModelData[]): DeprecationInfo[] {
  return models
    .filter(m => m.deprecationDate && m.status !== 'deprecated')
    .map(m => ({
      id: `dep-${m.id}`,
      modelId: m.id,
      modelName: m.name,
      provider: m.provider,
      deprecationDate: m.deprecationDate!,
      replacementModel: m.replacementModel,
      reason: m.notes,
      daysUntilDeprecation: m.daysUntilDeprecation,
    }))
    .sort((a, b) => (a.daysUntilDeprecation ?? 9999) - (b.daysUntilDeprecation ?? 9999));
}

function generateAlerts(models: ModelData[], deprecations: DeprecationInfo[]): Alert[] {
  const alerts: Alert[] = [];
  const thirtyDaysAgo = Date.now() - 30 * 86_400_000;

  for (const model of models) {
    if (new Date(model.releaseDate).getTime() > thirtyDaysAgo) {
      alerts.push({
        id: `alert-new-${model.id}`,
        type: 'new_model',
        severity: 'low',
        title: `New Model: ${model.name}`,
        message: `${model.provider} released ${model.name} on ${model.releaseDate}`,
        modelId: model.id,
        provider: model.provider,
        createdAt: NOW,
        read: false,
      });
    }
  }

  for (const dep of deprecations) {
    if (dep.daysUntilDeprecation !== undefined && dep.daysUntilDeprecation > 0 && dep.daysUntilDeprecation <= 90) {
      const severity: Alert['severity'] =
        dep.daysUntilDeprecation <= 30 ? 'high' :
        dep.daysUntilDeprecation <= 60 ? 'medium' : 'low';
      alerts.push({
        id: `alert-dep-${dep.id}`,
        type: 'deprecation',
        severity,
        title: `Deprecation Warning: ${dep.modelName}`,
        message: `${dep.modelName} will be deprecated in ${dep.daysUntilDeprecation} days.${dep.replacementModel ? ` Migrate to ${dep.replacementModel}.` : ''}`,
        modelId: dep.modelId,
        provider: dep.provider,
        createdAt: NOW,
        read: false,
      });
    }
  }

  return alerts;
}

// ─── Supabase table writes ────────────────────────────────────────────────────

async function upsertToTables(
  models: ModelData[],
  deprecations: DeprecationInfo[],
  alerts: Alert[],
): Promise<void> {
  const db = supabase();

  // Upsert models
  const modelRows = models.map(m => ({
    id: m.id,
    name: m.name,
    provider: m.provider,
    release_date: m.releaseDate,
    deprecation_date: m.deprecationDate ?? null,
    status: m.status,
    context_window: m.contextWindow ?? null,
    max_output_tokens: m.maxOutputTokens ?? null,
    input_pricing: m.inputPricing ?? null,
    output_pricing: m.outputPricing ?? null,
    capabilities: m.capabilities,
    replacement_model: m.replacementModel ?? null,
    notes: m.notes ?? null,
    source_url: m.sourceUrl,
    last_updated: m.lastUpdated,
  }));

  const { error: modelsErr } = await db
    .from('llm_models')
    .upsert(modelRows, { onConflict: 'id' });
  if (modelsErr) console.error('Error upserting models:', modelsErr.message);

  // Upsert deprecations
  const depRows = deprecations.map(d => ({
    id: d.id,
    model_id: d.modelId ?? null,
    model_name: d.modelName,
    provider: d.provider,
    deprecation_date: d.deprecationDate,
    replacement_model: d.replacementModel ?? null,
    reason: d.reason ?? null,
  }));

  const { error: depErr } = await db
    .from('llm_deprecations')
    .upsert(depRows, { onConflict: 'id' });
  if (depErr) console.error('Error upserting deprecations:', depErr.message);

  // Replace alerts
  await db.from('llm_alerts').delete().neq('id', '__placeholder__');
  const alertRows = alerts.map(a => ({
    id: a.id,
    type: a.type,
    severity: a.severity,
    title: a.title,
    message: a.message,
    model_id: a.modelId ?? null,
    provider: a.provider,
    read: a.read,
    created_at: a.createdAt,
  }));
  const { error: alertErr } = await db
    .from('llm_alerts')
    .insert(alertRows);
  if (alertErr) console.error('Error inserting alerts:', alertErr.message);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function scrapeAndStoreAllData(): Promise<void> {
  console.log('=== Starting data refresh ===');
  const start = Date.now();

  try { await kv.set('scrape_status', { status: 'running', startedAt: NOW }); } catch (_) { /* KV unavailable */ }

  try {
    const models = await buildModels();
    const deprecations = buildDeprecations(models);
    const alerts = generateAlerts(models, deprecations);

    // Write to relational tables
    await upsertToTables(models, deprecations, alerts);

    // Also write to KV for backward compatibility (best-effort)
    try {
      await Promise.all([
        kv.set('llm_models', models),
        kv.set('llm_models_last_updated', NOW),
        kv.set('llm_deprecations', deprecations),
        kv.set('llm_deprecations_last_updated', NOW),
        kv.set('llm_alerts', alerts),
      ]);
    } catch (_) { /* KV unavailable, skip */ }

    const duration = ((Date.now() - start) / 1000).toFixed(2);
    try {
      await kv.set('scrape_status', {
        status: 'completed',
        lastRun: NOW,
        duration: `${duration}s`,
        modelsCount: models.length,
        deprecationsCount: deprecations.length,
        alertsCount: alerts.length,
      });
    } catch (_) { /* KV unavailable, skip */ }

    console.log(`=== Refresh done in ${duration}s — ${models.length} models, ${deprecations.length} upcoming deprecations, ${alerts.length} alerts ===`);
  } catch (err) {
    console.error('Data refresh failed:', err);
    try { await kv.set('scrape_status', { status: 'failed', lastRun: NOW, error: (err as Error).message }); } catch (_) { /* KV unavailable */ }
    throw err;
  }
}
