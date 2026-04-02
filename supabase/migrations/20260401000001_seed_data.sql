-- LLM Model Tracker – Seed Data
-- Real model data sourced April 2026 from:
--   https://platform.openai.com/docs/models
--   https://platform.claude.com/docs/en/docs/about-claude/models/overview
--   https://ai.google.dev/gemini-api/docs/models
--   https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models
--   https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html

INSERT INTO llm_models
  (id, name, provider, release_date, deprecation_date, status, context_window, max_output_tokens, input_pricing, output_pricing, capabilities, replacement_model, notes, source_url)
VALUES

-- ─── OpenAI ───────────────────────────────────────────────────────────────────
('openai-gpt-5-4-pro',     'GPT-5.4 Pro',    'OpenAI', '2026-03-05', NULL,         'active',     1050000, 128000, NULL, NULL, ARRAY['Text','Vision','Function Calling','JSON Mode','Agents'], NULL,            'Latest flagship, registration required', 'https://platform.openai.com/docs/models'),
('openai-gpt-5-4',         'GPT-5.4',        'OpenAI', '2026-03-05', '2027-09-05', 'active',     1050000, 128000, NULL, NULL, ARRAY['Text','Vision','Function Calling','JSON Mode','Agents'], NULL,            'Azure-available flagship',               'https://platform.openai.com/docs/models'),
('openai-gpt-5-4-mini',    'GPT-5.4 Mini',   'OpenAI', '2026-03-17', '2027-09-17', 'active',      400000, 128000, NULL, NULL, ARRAY['Text','Vision','Function Calling','JSON Mode'],           NULL,            'Cost-effective GPT-5.4 tier',            'https://platform.openai.com/docs/models'),
('openai-gpt-5-2',         'GPT-5.2',        'OpenAI', '2025-12-11', NULL,         'active',      400000, 128000, NULL, NULL, ARRAY['Text','Vision','Function Calling','JSON Mode','Agents'], NULL,            NULL,                                     'https://platform.openai.com/docs/models'),
('openai-gpt-5-1',         'GPT-5.1',        'OpenAI', '2025-11-13', '2027-05-15', 'active',      400000, 128000, NULL, NULL, ARRAY['Text','Vision','Function Calling','JSON Mode','Agents'], NULL,            NULL,                                     'https://platform.openai.com/docs/models'),
('openai-gpt-5',           'GPT-5',          'OpenAI', '2025-08-07', '2027-02-06', 'active',      400000, 128000, NULL, NULL, ARRAY['Text','Vision','Function Calling','JSON Mode','Agents'], NULL,            'First GPT-5 release',                    'https://platform.openai.com/docs/models'),
('openai-gpt-5-mini',      'GPT-5 Mini',     'OpenAI', '2025-08-07', '2027-02-06', 'active',      400000, 128000, NULL, NULL, ARRAY['Text','Vision','Function Calling','JSON Mode'],           NULL,            NULL,                                     'https://platform.openai.com/docs/models'),
('openai-o4-mini',         'o4-mini',        'OpenAI', '2025-04-16', '2026-10-16', 'active',      200000, 100000, NULL, NULL, ARRAY['Text','Function Calling','Agents'],                       NULL,            'Latest mini reasoning model',            'https://platform.openai.com/docs/models'),
('openai-o3-pro',          'o3-pro',         'OpenAI', '2025-06-10', '2026-12-10', 'active',      200000, 100000, '$20.00 / 1M tokens', '$80.00 / 1M tokens', ARRAY['Text','Function Calling','Agents'], NULL, 'Professional reasoning model', 'https://platform.openai.com/docs/models'),
('openai-o3',              'o3',             'OpenAI', '2025-04-16', '2026-10-16', 'active',      200000, 100000, '$10.00 / 1M tokens', '$40.00 / 1M tokens', ARRAY['Text','Function Calling','Agents'], NULL, 'Advanced reasoning',           'https://platform.openai.com/docs/models'),
('openai-gpt-4-1',         'GPT-4.1',        'OpenAI', '2025-04-14', '2026-10-14', 'active',     1047576,  32768, '$2.00 / 1M tokens', '$8.00 / 1M tokens', ARRAY['Text','Vision','Function Calling','JSON Mode'], 'gpt-5', NULL, 'https://platform.openai.com/docs/models'),
('openai-gpt-4-1-mini',    'GPT-4.1 Mini',   'OpenAI', '2025-04-14', '2026-10-14', 'active',     1047576,  32768, '$0.40 / 1M tokens', '$1.60 / 1M tokens', ARRAY['Text','Vision','Function Calling','JSON Mode'], 'gpt-5-mini', NULL, 'https://platform.openai.com/docs/models'),
('openai-o3-mini',         'o3-mini',        'OpenAI', '2025-01-31', '2026-08-02', 'active',      200000, 100000, '$1.10 / 1M tokens', '$4.40 / 1M tokens', ARRAY['Text','Function Calling','Agents'], 'o4-mini', 'Configurable reasoning effort', 'https://platform.openai.com/docs/models'),
('openai-o1',              'o1',             'OpenAI', '2024-12-17', '2026-07-15', 'active',      200000, 100000, '$15.00 / 1M tokens', '$60.00 / 1M tokens', ARRAY['Text','Function Calling','Agents'], 'o3', 'Advanced reasoning GA', 'https://platform.openai.com/docs/models'),
('openai-gpt-4o',          'GPT-4o',         'OpenAI', '2024-11-20', '2026-10-01', 'active',      128000,  16384, '$2.50 / 1M tokens', '$10.00 / 1M tokens', ARRAY['Text','Vision','Function Calling','JSON Mode'], 'gpt-5.1', 'Multimodal flagship', 'https://platform.openai.com/docs/models'),
('openai-gpt-4o-mini',     'GPT-4o Mini',    'OpenAI', '2024-07-18', '2026-10-01', 'active',      128000,  16384, '$0.15 / 1M tokens', '$0.60 / 1M tokens', ARRAY['Text','Vision','Function Calling','JSON Mode'], 'gpt-4.1-mini', 'Cost-efficient small model', 'https://platform.openai.com/docs/models'),
('openai-gpt-4-turbo',     'GPT-4 Turbo',    'OpenAI', '2024-04-09', '2025-04-09', 'deprecated',  128000,   4096, '$10.00 / 1M tokens', '$30.00 / 1M tokens', ARRAY['Text','Vision','Function Calling','JSON Mode'], 'gpt-4o', 'Replaced by GPT-4o', 'https://platform.openai.com/docs/deprecations'),
('openai-gpt-4-5',         'GPT-4.5',        'OpenAI', '2025-02-27', '2025-12-01', 'deprecated',  128000,  16384, '$75.00 / 1M tokens', '$150.00 / 1M tokens', ARRAY['Text','Vision','Function Calling','JSON Mode'], 'gpt-5', 'Replaced by GPT-5 family', 'https://platform.openai.com/docs/deprecations'),

-- ─── Anthropic ────────────────────────────────────────────────────────────────
('anthropic-claude-opus-4-6',    'Claude Opus 4.6',       'Anthropic', '2026-03-01', NULL,         'active',  1000000, 128000, '$5.00 / 1M tokens',  '$25.00 / 1M tokens', ARRAY['Text','Vision','Function Calling','Agents'],                'NULL', 'Most intelligent model; extended thinking', 'https://platform.claude.com/docs/en/docs/about-claude/models/overview'),
('anthropic-claude-sonnet-4-6',  'Claude Sonnet 4.6',     'Anthropic', '2026-03-01', NULL,         'active',  1000000,  64000, '$3.00 / 1M tokens',  '$15.00 / 1M tokens', ARRAY['Text','Vision','Function Calling','Agents'],                 NULL,   'Best speed/intelligence balance',           'https://platform.claude.com/docs/en/docs/about-claude/models/overview'),
('anthropic-claude-haiku-4-5',   'Claude Haiku 4.5',      'Anthropic', '2025-10-01', NULL,         'active',   200000,  64000, '$1.00 / 1M tokens',  '$5.00 / 1M tokens',  ARRAY['Text','Vision','Function Calling'],                          NULL,   'Fastest model, near-frontier intelligence', 'https://platform.claude.com/docs/en/docs/about-claude/models/overview'),
('anthropic-claude-opus-4-5',    'Claude Opus 4.5',       'Anthropic', '2025-11-01', NULL,         'active',   200000,  64000, '$5.00 / 1M tokens',  '$25.00 / 1M tokens', ARRAY['Text','Vision','Function Calling','Agents'],                 NULL,   NULL,                                        'https://platform.claude.com/docs/en/docs/about-claude/models/overview'),
('anthropic-claude-sonnet-4-5',  'Claude Sonnet 4.5',     'Anthropic', '2025-09-29', NULL,         'active',   200000,  64000, '$3.00 / 1M tokens',  '$15.00 / 1M tokens', ARRAY['Text','Vision','Function Calling','Agents'],                 NULL,   NULL,                                        'https://platform.claude.com/docs/en/docs/about-claude/models/overview'),
('anthropic-claude-opus-4-1',    'Claude Opus 4.1',       'Anthropic', '2025-08-05', NULL,         'active',   200000,  32000, '$15.00 / 1M tokens', '$75.00 / 1M tokens', ARRAY['Text','Vision','Function Calling','Agents'],                 NULL,   NULL,                                        'https://platform.claude.com/docs/en/docs/about-claude/models/overview'),
('anthropic-claude-sonnet-4',    'Claude Sonnet 4',       'Anthropic', '2025-05-14', NULL,         'active',   200000,  64000, '$3.00 / 1M tokens',  '$15.00 / 1M tokens', ARRAY['Text','Vision','Function Calling','Agents'],                 NULL,   NULL,                                        'https://platform.claude.com/docs/en/docs/about-claude/models/overview'),
('anthropic-claude-opus-4',      'Claude Opus 4',         'Anthropic', '2025-05-14', NULL,         'active',   200000,  32000, '$15.00 / 1M tokens', '$75.00 / 1M tokens', ARRAY['Text','Vision','Function Calling','Agents'],                 NULL,   NULL,                                        'https://platform.claude.com/docs/en/docs/about-claude/models/overview'),
('anthropic-claude-3-5-haiku',   'Claude 3.5 Haiku',      'Anthropic', '2024-11-05', NULL,         'active',   200000,   8192, '$0.80 / 1M tokens',  '$4.00 / 1M tokens',  ARRAY['Text','Vision','Function Calling','JSON Mode'],              NULL,   'Fastest, most compact Claude 3.5 model',    'https://platform.claude.com/docs/en/docs/about-claude/models/overview'),
('anthropic-claude-3-5-sonnet',  'Claude 3.5 Sonnet',     'Anthropic', '2024-10-22', NULL,         'active',   200000,   8192, '$3.00 / 1M tokens',  '$15.00 / 1M tokens', ARRAY['Text','Vision','Function Calling','Agents'],                 NULL,   NULL,                                        'https://platform.claude.com/docs/en/docs/about-claude/models/overview'),
('anthropic-claude-3-haiku',     'Claude 3 Haiku',        'Anthropic', '2024-03-07', '2026-04-19', 'active',   200000,   4096, '$0.25 / 1M tokens',  '$1.25 / 1M tokens',  ARRAY['Text','Vision','Function Calling'],                          'claude-haiku-4-5', 'RETIRING Apr 19 2026 – migrate to Haiku 4.5', 'https://platform.claude.com/docs/en/docs/about-claude/models/overview'),
('anthropic-claude-3-opus',      'Claude 3 Opus',         'Anthropic', '2024-03-04', NULL,         'deprecated', 200000, 4096, '$15.00 / 1M tokens', '$75.00 / 1M tokens', ARRAY['Text','Vision','Function Calling'],                          'claude-opus-4-6', 'Replaced by Claude 4 series',            'https://platform.claude.com/docs/en/docs/about-claude/models/overview'),

-- ─── Google Gemini ────────────────────────────────────────────────────────────
('google-gemini-3-1-flash-live', 'Gemini 3.1 Flash Live Preview', 'Google', '2026-03-26', NULL,         'active',  1000000,  8192, NULL, NULL, ARRAY['Text','Vision','Agents'],                                     NULL, 'Real-time voice/video agents',       'https://ai.google.dev/gemini-api/docs/models'),
('google-gemini-3-1-flash-lite', 'Gemini 3.1 Flash-Lite Preview', 'Google', '2026-03-03', NULL,         'active',  1000000,  8192, NULL, NULL, ARRAY['Text','Vision','Function Calling','JSON Mode'],               NULL, 'Cost-effective frontier performance', 'https://ai.google.dev/gemini-api/docs/models'),
('google-gemini-3-1-pro',        'Gemini 3.1 Pro Preview',        'Google', '2026-02-19', NULL,         'active',  1000000,  8192, NULL, NULL, ARRAY['Text','Vision','Function Calling','JSON Mode','Agents'],      NULL, 'Advanced reasoning & agentic tasks', 'https://ai.google.dev/gemini-api/docs/models'),
('google-gemini-2-5-pro',        'Gemini 2.5 Pro',                'Google', '2025-12-01', NULL,         'active',  1000000,  8192, '$1.25 / 1M tokens', '$5.00 / 1M tokens', ARRAY['Text','Vision','Function Calling','JSON Mode','Agents'], NULL, 'Complex tasks, deep reasoning',      'https://ai.google.dev/gemini-api/docs/models'),
('google-gemini-2-5-flash',      'Gemini 2.5 Flash',              'Google', '2025-09-01', NULL,         'active',  1000000,  8192, '$0.30 / 1M tokens', '$1.20 / 1M tokens', ARRAY['Text','Vision','Function Calling','JSON Mode'],          NULL, 'Best price-performance',             'https://ai.google.dev/gemini-api/docs/models'),
('google-gemini-2-5-flash-lite', 'Gemini 2.5 Flash-Lite',         'Google', '2025-09-01', NULL,         'active',  1000000,  8192, '$0.10 / 1M tokens', '$0.40 / 1M tokens', ARRAY['Text','Vision','Function Calling'],                      NULL, 'Fastest, most budget-friendly',      'https://ai.google.dev/gemini-api/docs/models'),
('google-gemini-2-0-flash',      'Gemini 2.0 Flash',              'Google', '2025-02-05', '2026-06-01', 'active',  1000000,  8192, '$0.10 / 1M tokens', '$0.40 / 1M tokens', ARRAY['Text','Vision','Function Calling','JSON Mode'],          'gemini-2-5-flash', 'Retiring Jun 1 2026', 'https://ai.google.dev/gemini-api/docs/changelog'),
('google-gemini-1-5-pro',        'Gemini 1.5 Pro',                'Google', '2024-02-15', NULL,         'active',  2000000,  8192, '$1.25 / 1M tokens', '$5.00 / 1M tokens', ARRAY['Text','Vision','Function Calling','JSON Mode'],          NULL, '2M token context window',            'https://ai.google.dev/gemini-api/docs/models'),
('google-gemini-1-5-flash',      'Gemini 1.5 Flash',              'Google', '2024-05-14', NULL,         'active',  1000000,  8192, '$0.075 / 1M tokens','$0.30 / 1M tokens', ARRAY['Text','Vision','Function Calling'],                      NULL, 'Speed optimized',                    'https://ai.google.dev/gemini-api/docs/models'),
('google-gemini-3-pro-preview',  'Gemini 3 Pro Preview',          'Google', '2026-01-15', '2026-03-09', 'deprecated', 1000000, 8192, NULL, NULL, ARRAY['Text','Vision','Function Calling','Agents'],             'gemini-3-1-pro', 'Shutdown Mar 9 2026',  'https://ai.google.dev/gemini-api/docs/changelog'),

-- ─── Azure OpenAI ─────────────────────────────────────────────────────────────
('azure-gpt-5-4',      'GPT-5.4 (Azure)',     'Azure OpenAI', '2026-03-05', '2027-09-05', 'active', 1050000, 128000, 'Azure pricing', 'Azure pricing', ARRAY['Text','Vision','Function Calling','JSON Mode','Agents'], NULL, 'Latest Azure flagship', 'https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models'),
('azure-gpt-5-1',      'GPT-5.1 (Azure)',     'Azure OpenAI', '2025-11-13', '2027-05-15', 'active',  400000, 128000, 'Azure pricing', 'Azure pricing', ARRAY['Text','Vision','Function Calling','JSON Mode','Agents'], NULL, NULL, 'https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models'),
('azure-gpt-4-1',      'GPT-4.1 (Azure)',     'Azure OpenAI', '2025-04-14', '2026-10-14', 'active', 1047576,  32768, 'Azure pricing', 'Azure pricing', ARRAY['Text','Vision','Function Calling','JSON Mode'], 'gpt-5', NULL, 'https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models'),
('azure-o4-mini',      'o4-mini (Azure)',      'Azure OpenAI', '2025-04-16', '2026-10-16', 'active',  200000, 100000, 'Azure pricing', 'Azure pricing', ARRAY['Text','Function Calling','Agents'], NULL, 'Reasoning model on Azure', 'https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models'),
('azure-o3',           'o3 (Azure)',           'Azure OpenAI', '2025-04-16', '2026-10-16', 'active',  200000, 100000, 'Azure pricing', 'Azure pricing', ARRAY['Text','Function Calling','Agents'], NULL, NULL, 'https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models'),
('azure-gpt-4o',       'GPT-4o (Azure)',       'Azure OpenAI', '2024-11-20', '2026-10-01', 'active',  128000,  16384, 'Azure pricing', 'Azure pricing', ARRAY['Text','Vision','Function Calling','JSON Mode'], 'gpt-5.1', NULL, 'https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models'),
('azure-gpt-4o-mini',  'GPT-4o Mini (Azure)',  'Azure OpenAI', '2024-07-18', '2026-10-01', 'active',  128000,  16384, 'Azure pricing', 'Azure pricing', ARRAY['Text','Vision','Function Calling','JSON Mode'], 'gpt-4.1-mini', 'Standard: retiring Mar 31 2026', 'https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/model-retirements'),

-- ─── Amazon Bedrock ───────────────────────────────────────────────────────────
('bedrock-claude-opus-4-6',   'Claude Opus 4.6 (Bedrock)',   'Amazon Bedrock', '2026-03-01', NULL, 'active', 1000000, 128000, '$5.00 / 1M tokens',  '$25.00 / 1M tokens', ARRAY['Text','Vision','Function Calling','Agents'], NULL, 'anthropic.claude-opus-4-6-v1',           'https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html'),
('bedrock-claude-sonnet-4-6', 'Claude Sonnet 4.6 (Bedrock)', 'Amazon Bedrock', '2026-03-01', NULL, 'active', 1000000,  64000, '$3.00 / 1M tokens',  '$15.00 / 1M tokens', ARRAY['Text','Vision','Function Calling','Agents'], NULL, 'anthropic.claude-sonnet-4-6',            'https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html'),
('bedrock-claude-haiku-4-5',  'Claude Haiku 4.5 (Bedrock)',  'Amazon Bedrock', '2025-10-01', NULL, 'active',  200000,  64000, '$1.00 / 1M tokens',  '$5.00 / 1M tokens',  ARRAY['Text','Vision','Function Calling'],          NULL, 'anthropic.claude-haiku-4-5-20251001-v1:0','https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html'),
('bedrock-nova-premier',      'Amazon Nova Premier',         'Amazon Bedrock', '2025-04-01', NULL, 'active',  300000,   5120, '$0.25 / 1M tokens',  '$1.00 / 1M tokens',  ARRAY['Text','Vision','Function Calling','Agents'], NULL, 'amazon.nova-premier-v1:0; multimodal',   'https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html'),
('bedrock-nova-pro',          'Amazon Nova Pro',             'Amazon Bedrock', '2024-12-03', NULL, 'active',  300000,   5120, '$0.80 / 1M tokens',  '$3.20 / 1M tokens',  ARRAY['Text','Vision','Agents'],                    NULL, 'amazon.nova-pro-v1:0; video+image input',     'https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html'),
('bedrock-nova-lite',         'Amazon Nova Lite',            'Amazon Bedrock', '2024-12-03', NULL, 'active',  300000,   5120, '$0.06 / 1M tokens',  '$0.24 / 1M tokens',  ARRAY['Text','Vision'],                             NULL, 'amazon.nova-lite-v1:0',                  'https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html'),
('bedrock-llama4-maverick',   'Llama 4 Maverick 17B',        'Amazon Bedrock', '2025-04-05', NULL, 'active',  524288,   8192, '$0.20 / 1M tokens',  '$0.60 / 1M tokens', ARRAY['Text','Vision'],                             NULL, 'meta.llama4-maverick-17b-instruct-v1:0', 'https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html'),

-- ─── xAI ──────────────────────────────────────────────────────────────────────
('xai-grok-3',            'Grok 3',             'xAI', '2025-02-17', NULL, 'active', 131072, 32768, '$3.00 / 1M tokens',  '$15.00 / 1M tokens', ARRAY['Text','Vision','Function Calling','Agents'],  NULL, 'xAI flagship with real-time X knowledge', 'https://docs.x.ai/docs'),
('xai-grok-3-mini',       'Grok 3 Mini',        'xAI', '2025-02-17', NULL, 'active', 131072, 32768, '$0.30 / 1M tokens',  '$0.50 / 1M tokens',  ARRAY['Text','Function Calling'],                     NULL, 'Fast, lightweight Grok 3',                'https://docs.x.ai/docs'),
('xai-grok-2-vision-1212','Grok 2 Vision',       'xAI', '2024-12-12', NULL, 'active',  32768, 16384, '$2.00 / 1M tokens',  '$10.00 / 1M tokens', ARRAY['Text','Vision'],                               NULL, 'Multimodal understanding',                'https://docs.x.ai/docs'),
('xai-grok-2-1212',       'Grok 2 (1212)',       'xAI', '2024-12-12', NULL, 'active', 131072, 32768, '$2.00 / 1M tokens',  '$10.00 / 1M tokens', ARRAY['Text','Vision','Function Calling'],             NULL, 'Real-time X knowledge, Dec 2024 snapshot','https://docs.x.ai/docs')

ON CONFLICT (id) DO UPDATE SET
  name              = EXCLUDED.name,
  provider          = EXCLUDED.provider,
  release_date      = EXCLUDED.release_date,
  deprecation_date  = EXCLUDED.deprecation_date,
  status            = EXCLUDED.status,
  context_window    = EXCLUDED.context_window,
  max_output_tokens = EXCLUDED.max_output_tokens,
  input_pricing     = EXCLUDED.input_pricing,
  output_pricing    = EXCLUDED.output_pricing,
  capabilities      = EXCLUDED.capabilities,
  replacement_model = EXCLUDED.replacement_model,
  notes             = EXCLUDED.notes,
  source_url        = EXCLUDED.source_url,
  last_updated      = NOW();

-- ─────────────────────────────────────────────
-- Deprecation records (upcoming/active warnings)
-- ─────────────────────────────────────────────
INSERT INTO llm_deprecations (id, model_id, model_name, provider, deprecation_date, replacement_model, reason)
VALUES
  ('dep-claude-3-haiku',    'anthropic-claude-3-haiku',   'Claude 3 Haiku',        'Anthropic',    '2026-04-19', 'claude-haiku-4-5', 'Replaced by Claude Haiku 4.5'),
  ('dep-gemini-2-0-flash',  'google-gemini-2-0-flash',    'Gemini 2.0 Flash',      'Google',       '2026-06-01', 'gemini-2-5-flash', 'Superseded by Gemini 2.5 Flash'),
  ('dep-azure-gpt-4o',      'azure-gpt-4o',               'GPT-4o (Azure)',         'Azure OpenAI', '2026-10-01', 'gpt-5.1',          'Replaced by GPT-5.1 on Azure'),
  ('dep-azure-gpt-4o-mini', 'azure-gpt-4o-mini',          'GPT-4o Mini (Azure)',    'Azure OpenAI', '2026-10-01', 'gpt-4.1-mini',     'Replaced by GPT-4.1 Mini on Azure'),
  ('dep-openai-gpt-4o',     'openai-gpt-4o',              'GPT-4o',                 'OpenAI',       '2026-10-01', 'gpt-5.1',          'Superseded by GPT-5 series'),
  ('dep-openai-o1',         'openai-o1',                  'o1',                     'OpenAI',       '2026-07-15', 'o3',               'Replaced by o3'),
  ('dep-openai-o3-mini',    'openai-o3-mini',             'o3-mini',                'OpenAI',       '2026-08-02', 'o4-mini',          'Replaced by o4-mini'),
  ('dep-openai-gpt-4-1',    'openai-gpt-4-1',             'GPT-4.1',                'OpenAI',       '2026-10-14', 'gpt-5',            'Superseded by GPT-5 series')
ON CONFLICT (id) DO UPDATE SET
  deprecation_date  = EXCLUDED.deprecation_date,
  replacement_model = EXCLUDED.replacement_model,
  reason            = EXCLUDED.reason;
