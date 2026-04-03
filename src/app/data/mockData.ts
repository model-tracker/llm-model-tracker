// Real LLM model data – sourced April 2026
// Sources:
//   https://platform.openai.com/docs/models
//   https://platform.openai.com/docs/deprecations
//   https://platform.claude.com/docs/en/docs/about-claude/models/overview
//   https://ai.google.dev/gemini-api/docs/models
//   https://ai.google.dev/gemini-api/docs/changelog
//   https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models
//   https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/model-retirements
//   https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html
//   https://docs.x.ai/docs

export interface LLMModel {
  id: string;
  name: string;
  provider: 'OpenAI' | 'Anthropic' | 'Google' | 'Azure OpenAI' | 'xAI' | 'Amazon Bedrock';
  status: 'Active' | 'Deprecated' | 'Upcoming';
  releaseDate: string;
  deprecationDate?: string;
  replacementModel?: string;
  capabilities: ('Text' | 'Vision' | 'Agents' | 'Function Calling' | 'JSON Mode')[];
  contextWindow?: number;
  maxOutputTokens?: number;
  inputPricing?: string;
  outputPricing?: string;
  notes?: string;
  daysUntilDeprecation?: number;
  sourceUrl?: string;
}

function daysUntil(dateStr?: string): number | undefined {
  if (!dateStr) return undefined;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

const raw: Omit<LLMModel, 'daysUntilDeprecation'>[] = [

  // ─── OpenAI ──────────────────────────────────────────────────────────────────

  {
    id: 'openai-gpt-5-4-pro',
    name: 'GPT-5.4 Pro',
    provider: 'OpenAI',
    status: 'Active',
    releaseDate: '2026-03-05',
    capabilities: ['Text', 'Vision', 'Function Calling', 'JSON Mode', 'Agents'],
    contextWindow: 1_050_000,
    maxOutputTokens: 128_000,
    notes: 'Latest flagship – registration required',
  },
  {
    id: 'openai-gpt-5-4-mini',
    name: 'GPT-5.4 Mini',
    provider: 'OpenAI',
    status: 'Active',
    releaseDate: '2026-03-17',
    deprecationDate: '2027-09-17',
    capabilities: ['Text', 'Vision', 'Function Calling', 'JSON Mode'],
    contextWindow: 400_000,
    maxOutputTokens: 128_000,
  },
  {
    id: 'openai-gpt-5-2',
    name: 'GPT-5.2',
    provider: 'OpenAI',
    status: 'Active',
    releaseDate: '2025-12-11',
    deprecationDate: '2027-05-12',
    capabilities: ['Text', 'Vision', 'Function Calling', 'JSON Mode', 'Agents'],
    contextWindow: 400_000,
    maxOutputTokens: 128_000,
  },
  {
    id: 'openai-gpt-5-1',
    name: 'GPT-5.1',
    provider: 'OpenAI',
    status: 'Active',
    releaseDate: '2025-11-13',
    deprecationDate: '2027-05-15',
    capabilities: ['Text', 'Vision', 'Function Calling', 'JSON Mode', 'Agents'],
    contextWindow: 400_000,
    maxOutputTokens: 128_000,
  },
  {
    id: 'openai-gpt-5',
    name: 'GPT-5',
    provider: 'OpenAI',
    status: 'Active',
    releaseDate: '2025-08-07',
    deprecationDate: '2027-02-06',
    capabilities: ['Text', 'Vision', 'Function Calling', 'JSON Mode', 'Agents'],
    contextWindow: 400_000,
    maxOutputTokens: 128_000,
    notes: 'First GPT-5 release',
  },
  {
    id: 'openai-o4-mini',
    name: 'o4-mini',
    provider: 'OpenAI',
    status: 'Active',
    releaseDate: '2025-04-16',
    deprecationDate: '2026-10-16',
    capabilities: ['Text', 'Function Calling', 'Agents'],
    contextWindow: 200_000,
    maxOutputTokens: 100_000,
    inputPricing: '$1.10 / 1M tokens',
    outputPricing: '$4.40 / 1M tokens',
    notes: 'Latest mini reasoning model',
  },
  {
    id: 'openai-o3-pro',
    name: 'o3-pro',
    provider: 'OpenAI',
    status: 'Active',
    releaseDate: '2025-06-10',
    deprecationDate: '2026-12-10',
    capabilities: ['Text', 'Function Calling', 'Agents'],
    contextWindow: 200_000,
    maxOutputTokens: 100_000,
    inputPricing: '$20.00 / 1M tokens',
    outputPricing: '$80.00 / 1M tokens',
    notes: 'Professional reasoning model',
  },
  {
    id: 'openai-o3',
    name: 'o3',
    provider: 'OpenAI',
    status: 'Active',
    releaseDate: '2025-04-16',
    deprecationDate: '2026-10-16',
    capabilities: ['Text', 'Function Calling', 'Agents'],
    contextWindow: 200_000,
    maxOutputTokens: 100_000,
    inputPricing: '$10.00 / 1M tokens',
    outputPricing: '$40.00 / 1M tokens',
    notes: 'Advanced reasoning GA',
  },
  {
    id: 'openai-gpt-4-1',
    name: 'GPT-4.1',
    provider: 'OpenAI',
    status: 'Active',
    releaseDate: '2025-04-14',
    deprecationDate: '2026-10-14',
    replacementModel: 'GPT-5',
    capabilities: ['Text', 'Vision', 'Function Calling', 'JSON Mode'],
    contextWindow: 1_047_576,
    maxOutputTokens: 32_768,
    inputPricing: '$2.00 / 1M tokens',
    outputPricing: '$8.00 / 1M tokens',
  },
  {
    id: 'openai-gpt-4-1-mini',
    name: 'GPT-4.1 Mini',
    provider: 'OpenAI',
    status: 'Active',
    releaseDate: '2025-04-14',
    deprecationDate: '2026-10-14',
    replacementModel: 'GPT-5 Mini',
    capabilities: ['Text', 'Vision', 'Function Calling', 'JSON Mode'],
    contextWindow: 1_047_576,
    maxOutputTokens: 32_768,
    inputPricing: '$0.40 / 1M tokens',
    outputPricing: '$1.60 / 1M tokens',
  },
  {
    id: 'openai-o3-mini',
    name: 'o3-mini',
    provider: 'OpenAI',
    status: 'Active',
    releaseDate: '2025-01-31',
    deprecationDate: '2026-08-02',
    replacementModel: 'o4-mini',
    capabilities: ['Text', 'Function Calling', 'Agents'],
    contextWindow: 200_000,
    maxOutputTokens: 100_000,
    inputPricing: '$1.10 / 1M tokens',
    outputPricing: '$4.40 / 1M tokens',
  },
  {
    id: 'openai-o1',
    name: 'o1',
    provider: 'OpenAI',
    status: 'Active',
    releaseDate: '2024-12-17',
    deprecationDate: '2026-07-15',
    replacementModel: 'o3',
    capabilities: ['Text', 'Function Calling', 'Agents'],
    contextWindow: 200_000,
    maxOutputTokens: 100_000,
    inputPricing: '$15.00 / 1M tokens',
    outputPricing: '$60.00 / 1M tokens',
  },
  {
    id: 'openai-gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    status: 'Active',
    releaseDate: '2024-11-20',
    deprecationDate: '2026-10-01',
    replacementModel: 'GPT-5.1',
    capabilities: ['Text', 'Vision', 'Function Calling', 'JSON Mode'],
    contextWindow: 128_000,
    maxOutputTokens: 16_384,
    inputPricing: '$2.50 / 1M tokens',
    outputPricing: '$10.00 / 1M tokens',
  },
  {
    id: 'openai-gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    status: 'Active',
    releaseDate: '2024-07-18',
    deprecationDate: '2026-10-01',
    replacementModel: 'GPT-4.1 Mini',
    capabilities: ['Text', 'Vision', 'Function Calling', 'JSON Mode'],
    contextWindow: 128_000,
    maxOutputTokens: 16_384,
    inputPricing: '$0.15 / 1M tokens',
    outputPricing: '$0.60 / 1M tokens',
  },
  {
    id: 'openai-gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    status: 'Deprecated',
    releaseDate: '2024-04-09',
    deprecationDate: '2025-04-09',
    replacementModel: 'GPT-4o',
    capabilities: ['Text', 'Vision', 'Function Calling', 'JSON Mode'],
    contextWindow: 128_000,
    maxOutputTokens: 4_096,
    inputPricing: '$10.00 / 1M tokens',
    outputPricing: '$30.00 / 1M tokens',
  },
  {
    id: 'openai-gpt-4-5',
    name: 'GPT-4.5',
    provider: 'OpenAI',
    status: 'Deprecated',
    releaseDate: '2025-02-27',
    deprecationDate: '2025-12-01',
    replacementModel: 'GPT-5',
    capabilities: ['Text', 'Vision', 'Function Calling', 'JSON Mode'],
    contextWindow: 128_000,
    maxOutputTokens: 16_384,
    inputPricing: '$75.00 / 1M tokens',
    outputPricing: '$150.00 / 1M tokens',
    notes: 'Replaced by GPT-5 family',
  },

  // ─── Anthropic ───────────────────────────────────────────────────────────────

  {
    id: 'anthropic-claude-opus-4-6',
    name: 'Claude Opus 4.6',
    provider: 'Anthropic',
    status: 'Active',
    releaseDate: '2026-03-01',
    capabilities: ['Text', 'Vision', 'Function Calling', 'Agents'],
    contextWindow: 1_000_000,
    maxOutputTokens: 128_000,
    inputPricing: '$5.00 / 1M tokens',
    outputPricing: '$25.00 / 1M tokens',
    notes: 'Most intelligent; extended & adaptive thinking',
  },
  {
    id: 'anthropic-claude-sonnet-4-6',
    name: 'Claude Sonnet 4.6',
    provider: 'Anthropic',
    status: 'Active',
    releaseDate: '2026-03-01',
    capabilities: ['Text', 'Vision', 'Function Calling', 'Agents'],
    contextWindow: 1_000_000,
    maxOutputTokens: 64_000,
    inputPricing: '$3.00 / 1M tokens',
    outputPricing: '$15.00 / 1M tokens',
    notes: 'Best speed & intelligence balance',
  },
  {
    id: 'anthropic-claude-haiku-4-5',
    name: 'Claude Haiku 4.5',
    provider: 'Anthropic',
    status: 'Active',
    releaseDate: '2025-10-01',
    capabilities: ['Text', 'Vision', 'Function Calling'],
    contextWindow: 200_000,
    maxOutputTokens: 64_000,
    inputPricing: '$1.00 / 1M tokens',
    outputPricing: '$5.00 / 1M tokens',
    notes: 'Fastest model with near-frontier intelligence',
  },
  {
    id: 'anthropic-claude-opus-4-5',
    name: 'Claude Opus 4.5',
    provider: 'Anthropic',
    status: 'Active',
    releaseDate: '2025-11-01',
    capabilities: ['Text', 'Vision', 'Function Calling', 'Agents'],
    contextWindow: 200_000,
    maxOutputTokens: 64_000,
    inputPricing: '$5.00 / 1M tokens',
    outputPricing: '$25.00 / 1M tokens',
  },
  {
    id: 'anthropic-claude-sonnet-4-5',
    name: 'Claude Sonnet 4.5',
    provider: 'Anthropic',
    status: 'Active',
    releaseDate: '2025-09-29',
    capabilities: ['Text', 'Vision', 'Function Calling', 'Agents'],
    contextWindow: 200_000,
    maxOutputTokens: 64_000,
    inputPricing: '$3.00 / 1M tokens',
    outputPricing: '$15.00 / 1M tokens',
  },
  {
    id: 'anthropic-claude-sonnet-4',
    name: 'Claude Sonnet 4',
    provider: 'Anthropic',
    status: 'Active',
    releaseDate: '2025-05-14',
    capabilities: ['Text', 'Vision', 'Function Calling', 'Agents'],
    contextWindow: 200_000,
    maxOutputTokens: 64_000,
    inputPricing: '$3.00 / 1M tokens',
    outputPricing: '$15.00 / 1M tokens',
  },
  {
    id: 'anthropic-claude-3-5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    status: 'Active',
    releaseDate: '2024-11-05',
    capabilities: ['Text', 'Vision', 'Function Calling', 'JSON Mode'],
    contextWindow: 200_000,
    maxOutputTokens: 8_192,
    inputPricing: '$0.80 / 1M tokens',
    outputPricing: '$4.00 / 1M tokens',
    notes: 'Fastest, most compact Claude 3.5 model',
  },
  {
    id: 'anthropic-claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    status: 'Active',
    releaseDate: '2024-10-22',
    capabilities: ['Text', 'Vision', 'Function Calling', 'Agents'],
    contextWindow: 200_000,
    maxOutputTokens: 8_192,
    inputPricing: '$3.00 / 1M tokens',
    outputPricing: '$15.00 / 1M tokens',
  },
  {
    id: 'anthropic-claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    status: 'Active',
    releaseDate: '2024-03-07',
    deprecationDate: '2026-04-19',
    replacementModel: 'Claude Haiku 4.5',
    capabilities: ['Text', 'Vision', 'Function Calling'],
    contextWindow: 200_000,
    maxOutputTokens: 4_096,
    inputPricing: '$0.25 / 1M tokens',
    outputPricing: '$1.25 / 1M tokens',
    notes: 'RETIRING Apr 19 2026 – migrate to Claude Haiku 4.5',
  },
  {
    id: 'anthropic-claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    status: 'Deprecated',
    releaseDate: '2024-03-04',
    replacementModel: 'Claude Opus 4.6',
    capabilities: ['Text', 'Vision', 'Function Calling'],
    contextWindow: 200_000,
    maxOutputTokens: 4_096,
    inputPricing: '$15.00 / 1M tokens',
    outputPricing: '$75.00 / 1M tokens',
  },

  // ─── Google Gemini ────────────────────────────────────────────────────────────

  {
    id: 'google-gemini-3-1-flash-live',
    name: 'Gemini 3.1 Flash Live Preview',
    provider: 'Google',
    status: 'Active',
    releaseDate: '2026-03-26',
    capabilities: ['Text', 'Vision', 'Agents'],
    contextWindow: 1_000_000,
    maxOutputTokens: 8_192,
    notes: 'Real-time voice/video agents',
  },
  {
    id: 'google-gemini-3-1-flash-lite',
    name: 'Gemini 3.1 Flash-Lite Preview',
    provider: 'Google',
    status: 'Active',
    releaseDate: '2026-03-03',
    capabilities: ['Text', 'Vision', 'Function Calling', 'JSON Mode'],
    contextWindow: 1_000_000,
    maxOutputTokens: 8_192,
  },
  {
    id: 'google-gemini-3-1-pro',
    name: 'Gemini 3.1 Pro Preview',
    provider: 'Google',
    status: 'Active',
    releaseDate: '2026-02-19',
    capabilities: ['Text', 'Vision', 'Function Calling', 'JSON Mode', 'Agents'],
    contextWindow: 1_000_000,
    maxOutputTokens: 8_192,
    notes: 'Advanced reasoning & agentic capabilities',
  },
  {
    id: 'google-gemini-2-5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    status: 'Active',
    releaseDate: '2025-12-01',
    capabilities: ['Text', 'Vision', 'Function Calling', 'JSON Mode', 'Agents'],
    contextWindow: 1_000_000,
    maxOutputTokens: 8_192,
    inputPricing: '$1.25 / 1M tokens',
    outputPricing: '$5.00 / 1M tokens',
    notes: 'Most advanced for complex tasks; deep reasoning',
  },
  {
    id: 'google-gemini-2-5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    status: 'Active',
    releaseDate: '2025-09-01',
    capabilities: ['Text', 'Vision', 'Function Calling', 'JSON Mode'],
    contextWindow: 1_000_000,
    maxOutputTokens: 8_192,
    inputPricing: '$0.30 / 1M tokens',
    outputPricing: '$1.20 / 1M tokens',
    notes: 'Best price-performance for reasoning',
  },
  {
    id: 'google-gemini-2-5-flash-lite',
    name: 'Gemini 2.5 Flash-Lite',
    provider: 'Google',
    status: 'Active',
    releaseDate: '2025-09-01',
    capabilities: ['Text', 'Vision', 'Function Calling'],
    contextWindow: 1_000_000,
    maxOutputTokens: 8_192,
    inputPricing: '$0.10 / 1M tokens',
    outputPricing: '$0.40 / 1M tokens',
    notes: 'Fastest, most budget-friendly multimodal',
  },
  {
    id: 'google-gemini-2-0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    status: 'Active',
    releaseDate: '2025-02-05',
    deprecationDate: '2026-06-01',
    replacementModel: 'Gemini 2.5 Flash',
    capabilities: ['Text', 'Vision', 'Function Calling', 'JSON Mode'],
    contextWindow: 1_000_000,
    maxOutputTokens: 8_192,
    inputPricing: '$0.10 / 1M tokens',
    outputPricing: '$0.40 / 1M tokens',
    notes: 'Retiring Jun 1 2026',
  },
  {
    id: 'google-gemini-1-5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    status: 'Active',
    releaseDate: '2024-02-15',
    capabilities: ['Text', 'Vision', 'Function Calling', 'JSON Mode'],
    contextWindow: 2_000_000,
    maxOutputTokens: 8_192,
    inputPricing: '$1.25 / 1M tokens',
    outputPricing: '$5.00 / 1M tokens',
    notes: '2M token context window',
  },
  {
    id: 'google-gemini-1-5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    status: 'Active',
    releaseDate: '2024-05-14',
    capabilities: ['Text', 'Vision', 'Function Calling'],
    contextWindow: 1_000_000,
    maxOutputTokens: 8_192,
    inputPricing: '$0.075 / 1M tokens',
    outputPricing: '$0.30 / 1M tokens',
  },
  {
    id: 'google-gemini-3-pro-preview',
    name: 'Gemini 3 Pro Preview',
    provider: 'Google',
    status: 'Deprecated',
    releaseDate: '2026-01-15',
    deprecationDate: '2026-03-09',
    replacementModel: 'Gemini 3.1 Pro Preview',
    capabilities: ['Text', 'Vision', 'Function Calling', 'Agents'],
    notes: 'Shutdown Mar 9 2026',
  },

  // ─── Azure OpenAI ─────────────────────────────────────────────────────────────

  {
    id: 'azure-gpt-5-4',
    name: 'GPT-5.4 (Azure)',
    provider: 'Azure OpenAI',
    status: 'Active',
    releaseDate: '2026-03-05',
    deprecationDate: '2027-09-05',
    capabilities: ['Text', 'Vision', 'Function Calling', 'JSON Mode', 'Agents'],
    contextWindow: 1_050_000,
    maxOutputTokens: 128_000,
  },
  {
    id: 'azure-gpt-5-1',
    name: 'GPT-5.1 (Azure)',
    provider: 'Azure OpenAI',
    status: 'Active',
    releaseDate: '2025-11-13',
    deprecationDate: '2027-05-15',
    capabilities: ['Text', 'Vision', 'Function Calling', 'JSON Mode', 'Agents'],
    contextWindow: 400_000,
    maxOutputTokens: 128_000,
  },
  {
    id: 'azure-gpt-4-1',
    name: 'GPT-4.1 (Azure)',
    provider: 'Azure OpenAI',
    status: 'Active',
    releaseDate: '2025-04-14',
    deprecationDate: '2026-10-14',
    replacementModel: 'GPT-5',
    capabilities: ['Text', 'Vision', 'Function Calling', 'JSON Mode'],
    contextWindow: 1_047_576,
    maxOutputTokens: 32_768,
  },
  {
    id: 'azure-o4-mini',
    name: 'o4-mini (Azure)',
    provider: 'Azure OpenAI',
    status: 'Active',
    releaseDate: '2025-04-16',
    deprecationDate: '2026-10-16',
    capabilities: ['Text', 'Function Calling', 'Agents'],
    contextWindow: 200_000,
    maxOutputTokens: 100_000,
  },
  {
    id: 'azure-o3',
    name: 'o3 (Azure)',
    provider: 'Azure OpenAI',
    status: 'Active',
    releaseDate: '2025-04-16',
    deprecationDate: '2026-10-16',
    capabilities: ['Text', 'Function Calling', 'Agents'],
    contextWindow: 200_000,
    maxOutputTokens: 100_000,
  },
  {
    id: 'azure-gpt-4o',
    name: 'GPT-4o (Azure)',
    provider: 'Azure OpenAI',
    status: 'Active',
    releaseDate: '2024-11-20',
    deprecationDate: '2026-10-01',
    replacementModel: 'GPT-5.1',
    capabilities: ['Text', 'Vision', 'Function Calling', 'JSON Mode'],
    contextWindow: 128_000,
    maxOutputTokens: 16_384,
    notes: 'Standard deployment retiring Mar 31 2026',
  },
  {
    id: 'azure-gpt-4o-mini',
    name: 'GPT-4o Mini (Azure)',
    provider: 'Azure OpenAI',
    status: 'Active',
    releaseDate: '2024-07-18',
    deprecationDate: '2026-10-01',
    replacementModel: 'GPT-4.1 Mini',
    capabilities: ['Text', 'Vision', 'Function Calling', 'JSON Mode'],
    contextWindow: 128_000,
    maxOutputTokens: 16_384,
  },

  // ─── Amazon Bedrock ───────────────────────────────────────────────────────────

  {
    id: 'bedrock-claude-opus-4-6',
    name: 'Claude Opus 4.6 (Bedrock)',
    provider: 'Amazon Bedrock',
    status: 'Active',
    releaseDate: '2026-03-01',
    capabilities: ['Text', 'Vision', 'Function Calling', 'Agents'],
    contextWindow: 1_000_000,
    maxOutputTokens: 128_000,
    inputPricing: '$5.00 / 1M tokens',
    outputPricing: '$25.00 / 1M tokens',
    notes: 'ID: anthropic.claude-opus-4-6-v1',
  },
  {
    id: 'bedrock-claude-sonnet-4-6',
    name: 'Claude Sonnet 4.6 (Bedrock)',
    provider: 'Amazon Bedrock',
    status: 'Active',
    releaseDate: '2026-03-01',
    capabilities: ['Text', 'Vision', 'Function Calling', 'Agents'],
    contextWindow: 1_000_000,
    maxOutputTokens: 64_000,
    inputPricing: '$3.00 / 1M tokens',
    outputPricing: '$15.00 / 1M tokens',
    notes: 'ID: anthropic.claude-sonnet-4-6',
  },
  {
    id: 'bedrock-claude-haiku-4-5',
    name: 'Claude Haiku 4.5 (Bedrock)',
    provider: 'Amazon Bedrock',
    status: 'Active',
    releaseDate: '2025-10-01',
    capabilities: ['Text', 'Vision', 'Function Calling'],
    contextWindow: 200_000,
    maxOutputTokens: 64_000,
    inputPricing: '$1.00 / 1M tokens',
    outputPricing: '$5.00 / 1M tokens',
    notes: 'ID: anthropic.claude-haiku-4-5-20251001-v1:0',
  },
  {
    id: 'bedrock-nova-premier',
    name: 'Amazon Nova Premier',
    provider: 'Amazon Bedrock',
    status: 'Active',
    releaseDate: '2025-04-01',
    capabilities: ['Text', 'Vision', 'Agents'],
    contextWindow: 300_000,
    maxOutputTokens: 5_120,
    inputPricing: '$0.25 / 1M tokens',
    outputPricing: '$1.00 / 1M tokens',
    notes: 'ID: amazon.nova-premier-v1:0',
  },
  {
    id: 'bedrock-nova-pro',
    name: 'Amazon Nova Pro',
    provider: 'Amazon Bedrock',
    status: 'Active',
    releaseDate: '2024-12-03',
    capabilities: ['Text', 'Vision', 'Agents'],
    contextWindow: 300_000,
    maxOutputTokens: 5_120,
    inputPricing: '$0.80 / 1M tokens',
    outputPricing: '$3.20 / 1M tokens',
    notes: 'ID: amazon.nova-pro-v1:0; video+image input',
  },
  {
    id: 'bedrock-nova-lite',
    name: 'Amazon Nova Lite',
    provider: 'Amazon Bedrock',
    status: 'Active',
    releaseDate: '2024-12-03',
    capabilities: ['Text', 'Vision'],
    contextWindow: 300_000,
    maxOutputTokens: 5_120,
    inputPricing: '$0.06 / 1M tokens',
    outputPricing: '$0.24 / 1M tokens',
    notes: 'ID: amazon.nova-lite-v1:0',
  },
  {
    id: 'bedrock-llama4-maverick',
    name: 'Llama 4 Maverick 17B',
    provider: 'Amazon Bedrock',
    status: 'Active',
    releaseDate: '2025-04-05',
    capabilities: ['Text', 'Vision'],
    contextWindow: 524_288,
    maxOutputTokens: 8_192,
    inputPricing: '$0.20 / 1M tokens',
    outputPricing: '$0.60 / 1M tokens',
    notes: 'ID: meta.llama4-maverick-17b-instruct-v1:0',
  },

  // ─── xAI ──────────────────────────────────────────────────────────────────────

  {
    id: 'xai-grok-3',
    name: 'Grok 3',
    provider: 'xAI',
    status: 'Active',
    releaseDate: '2025-02-17',
    capabilities: ['Text', 'Vision', 'Function Calling', 'Agents'],
    contextWindow: 131_072,
    maxOutputTokens: 32_768,
    inputPricing: '$3.00 / 1M tokens',
    outputPricing: '$15.00 / 1M tokens',
    notes: 'Real-time X knowledge; agentic capabilities',
  },
  {
    id: 'xai-grok-3-mini',
    name: 'Grok 3 Mini',
    provider: 'xAI',
    status: 'Active',
    releaseDate: '2025-02-17',
    capabilities: ['Text', 'Function Calling'],
    contextWindow: 131_072,
    maxOutputTokens: 32_768,
    inputPricing: '$0.30 / 1M tokens',
    outputPricing: '$0.50 / 1M tokens',
  },
  {
    id: 'xai-grok-2-vision-1212',
    name: 'Grok 2 Vision (1212)',
    provider: 'xAI',
    status: 'Active',
    releaseDate: '2024-12-12',
    capabilities: ['Text', 'Vision'],
    contextWindow: 32_768,
    maxOutputTokens: 16_384,
    inputPricing: '$2.00 / 1M tokens',
    outputPricing: '$10.00 / 1M tokens',
  },
  {
    id: 'xai-grok-2-1212',
    name: 'Grok 2 (1212)',
    provider: 'xAI',
    status: 'Active',
    releaseDate: '2024-12-12',
    capabilities: ['Text', 'Vision', 'Function Calling'],
    contextWindow: 131_072,
    maxOutputTokens: 32_768,
    inputPricing: '$2.00 / 1M tokens',
    outputPricing: '$10.00 / 1M tokens',
  },
];

export const llmModels: LLMModel[] = raw.map(m => ({
  ...m,
  daysUntilDeprecation: daysUntil(m.deprecationDate),
}));

// ─── Provider summaries ──────────────────────────────────────────────────────

export interface ProviderInfo {
  id: string;
  name: string;
  logo: string;
  activeModels: number;
  deprecatedModels: number;
  upcomingModels: number;
}

export const providers: ProviderInfo[] = [
  { id: 'openai',  name: 'OpenAI',         logo: '🤖', activeModels: llmModels.filter(m => m.provider === 'OpenAI'         && m.status === 'Active').length,     deprecatedModels: llmModels.filter(m => m.provider === 'OpenAI'         && m.status === 'Deprecated').length, upcomingModels: llmModels.filter(m => m.provider === 'OpenAI'         && m.status === 'Upcoming').length },
  { id: 'anthropic', name: 'Anthropic',    logo: '🧠', activeModels: llmModels.filter(m => m.provider === 'Anthropic'      && m.status === 'Active').length,     deprecatedModels: llmModels.filter(m => m.provider === 'Anthropic'      && m.status === 'Deprecated').length, upcomingModels: llmModels.filter(m => m.provider === 'Anthropic'      && m.status === 'Upcoming').length },
  { id: 'google',  name: 'Google Gemini',  logo: '✨', activeModels: llmModels.filter(m => m.provider === 'Google'         && m.status === 'Active').length,     deprecatedModels: llmModels.filter(m => m.provider === 'Google'         && m.status === 'Deprecated').length, upcomingModels: llmModels.filter(m => m.provider === 'Google'         && m.status === 'Upcoming').length },
  { id: 'azure',   name: 'Azure OpenAI',   logo: '☁️', activeModels: llmModels.filter(m => m.provider === 'Azure OpenAI'   && m.status === 'Active').length,     deprecatedModels: llmModels.filter(m => m.provider === 'Azure OpenAI'   && m.status === 'Deprecated').length, upcomingModels: llmModels.filter(m => m.provider === 'Azure OpenAI'   && m.status === 'Upcoming').length },
  { id: 'xai',     name: 'xAI',            logo: '⚡', activeModels: llmModels.filter(m => m.provider === 'xAI'            && m.status === 'Active').length,     deprecatedModels: llmModels.filter(m => m.provider === 'xAI'            && m.status === 'Deprecated').length, upcomingModels: llmModels.filter(m => m.provider === 'xAI'            && m.status === 'Upcoming').length },
  { id: 'bedrock', name: 'Amazon Bedrock', logo: '📦', activeModels: llmModels.filter(m => m.provider === 'Amazon Bedrock' && m.status === 'Active').length,     deprecatedModels: llmModels.filter(m => m.provider === 'Amazon Bedrock' && m.status === 'Deprecated').length, upcomingModels: llmModels.filter(m => m.provider === 'Amazon Bedrock' && m.status === 'Upcoming').length },
];

// ─── Chart helpers ────────────────────────────────────────────────────────────

export interface ModelReleaseData {
  id: string;
  month: string;
  count: number;
}

export interface ProviderActivityData {
  id: string;
  provider: string;
  models: number;
}

export const modelReleasesOverTime: ModelReleaseData[] = (() => {
  const counts: Record<string, number> = {};
  llmModels.forEach(m => {
    const d = new Date(m.releaseDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    counts[key] = (counts[key] || 0) + 1;
  });
  const result: ModelReleaseData[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    result.push({ id: key, month: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }), count: counts[key] || 0 });
  }
  return result;
})();

export const providerActivity: ProviderActivityData[] = providers
  .filter(p => p.activeModels > 0)
  .map(p => ({ id: p.id, provider: p.name, models: p.activeModels }));
