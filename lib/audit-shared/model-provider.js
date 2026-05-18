'use strict';

// GPT-5.4 has two valid routes in this repo:
// - OpenCode/Copilot: richer access, costs premium requests (use `copilot` alias)
// - Codex/OpenAI: native OpenAI CLI, separate budget surface, sandboxed (DEFAULT)
// Policy (2026-04-01): default to Codex/OpenAI to preserve Copilot premium requests.
// Use `copilot` or `copilot-gpt-5.4` aliases to explicitly route through Copilot.
const DEFAULT_GPT_54_ALIAS = 'gpt-5.4';
const DEFAULT_GPT_54_MODEL_ID = 'gpt-5.4';
const COPILOT_GPT_54_MODEL_ID = 'github-copilot/gpt-5.4';
const OPENAI_GPT_54_MODEL_ID = 'gpt-5.4';

const MODEL_REGISTRY = {
  opus: {
    alias: 'opus',
    backend: 'claude',
    modelId: 'claude-opus-4-6',
    provider: 'anthropic',
    description: 'Claude Opus 4.6',
  },
  sonnet: {
    alias: 'sonnet',
    backend: 'claude',
    modelId: 'claude-sonnet-4-6',
    provider: 'anthropic',
    description: 'Claude Sonnet 4.6',
  },
  haiku: {
    alias: 'haiku',
    backend: 'claude',
    modelId: 'claude-haiku-4-5-20251001',
    provider: 'anthropic',
    description: 'Claude Haiku 4.5',
  },
  minimax: {
    alias: 'minimax',
    backend: 'opencode',
    modelId: 'opencode/minimax-m2.5-free',
    provider: 'opencode',
    description: 'MiniMax M2.5 free',
  },
  nemotron: {
    alias: 'nemotron',
    backend: 'opencode',
    modelId: 'opencode/nemotron-3-super-free',
    provider: 'opencode',
    description: 'Nemotron 3 Super free',
  },
  gemini: {
    alias: 'gemini',
    backend: 'gemini',
    modelId: 'gemini-3.1-pro-preview',
    provider: 'google',
    description: 'Gemini 3.1 Pro preview',
  },
  'gemini-pro': {
    alias: 'gemini-pro',
    backend: 'gemini',
    modelId: 'gemini-3.1-pro-preview',
    provider: 'google',
    description: 'Gemini 3.1 Pro preview',
  },
  'gemini-flash': {
    alias: 'gemini-flash',
    backend: 'gemini',
    modelId: 'gemini-3-flash-preview',
    provider: 'google',
    description: 'Gemini 3 Flash preview',
  },
  'gpt-5.4': {
    alias: 'gpt-5.4',
    backend: 'codex',
    modelId: 'gpt-5.4',
    provider: 'openai',
    description: 'GPT-5.4 via Codex/OpenAI (default policy route)',
  },
  gpt54: {
    alias: 'gpt54',
    backend: 'codex',
    modelId: 'gpt-5.4',
    provider: 'openai',
    description: 'GPT-5.4 via Codex/OpenAI (default policy route)',
  },
  'openai-gpt-5.4': {
    alias: 'openai-gpt-5.4',
    backend: 'codex',
    modelId: 'gpt-5.4',
    provider: 'openai',
    description: 'GPT-5.4 via Codex/OpenAI',
  },
  copilot: {
    alias: 'copilot',
    backend: 'opencode',
    modelId: 'github-copilot/gpt-5.4',
    provider: 'github-copilot',
    description: 'GPT-5.4 via OpenCode/Copilot',
  },
  'copilot-gpt-5.4': {
    alias: 'copilot-gpt-5.4',
    backend: 'opencode',
    modelId: 'github-copilot/gpt-5.4',
    provider: 'github-copilot',
    description: 'GPT-5.4 via OpenCode/Copilot',
  },
  codex: {
    alias: 'codex',
    backend: 'codex',
    modelId: 'gpt-5.3-codex',
    provider: 'openai',
    description: 'GPT-5.3 Codex CLI',
  },
  'codex-spark': {
    alias: 'codex-spark',
    backend: 'codex',
    modelId: 'gpt-5.3-codex-spark',
    provider: 'openai',
    description: 'GPT-5.3 Codex Spark — fast, separate usage pool',
  },
};

function normalizeOpenCodeModelId(modelId) {
  if (modelId === 'copilot/gpt-5.4') return 'github-copilot/gpt-5.4';
  return modelId;
}

function inferBackend(modelId) {
  if (/^gemini-/.test(modelId)) return 'gemini';
  if (/^claude-/.test(modelId)) return 'claude';
  if (/^github-copilot\//.test(modelId)) return 'opencode';
  if (/gpt-5\.4/i.test(modelId)) return 'codex';
  if (/codex/i.test(modelId)) return 'codex';
  if (/^(opencode)\//.test(modelId)) return 'opencode';
  return 'opencode';
}

function inferProvider(modelId, backend) {
  if (backend === 'gemini') return 'google';
  if (backend === 'claude') return 'anthropic';
  if (backend === 'codex') return 'openai';
  if (/^github-copilot\//.test(modelId)) return 'github-copilot';
  if (/^openai\//.test(modelId)) return 'openai';
  if (/^opencode\//.test(modelId)) return 'opencode';
  return backend;
}

function resolveModelDescriptor(token, options = {}) {
  const rawToken = token || options.defaultToken || DEFAULT_GPT_54_ALIAS;
  const direct = MODEL_REGISTRY[rawToken];
  if (direct) return { ...direct };

  const normalizedModelId = normalizeOpenCodeModelId(rawToken);
  const backend = inferBackend(normalizedModelId);
  return {
    alias: rawToken,
    backend,
    modelId: normalizedModelId,
    provider: inferProvider(normalizedModelId, backend),
    description: 'custom',
  };
}

module.exports = {
  DEFAULT_GPT_54_ALIAS,
  DEFAULT_GPT_54_MODEL_ID,
  OPENAI_GPT_54_MODEL_ID,
  MODEL_REGISTRY,
  normalizeOpenCodeModelId,
  resolveModelDescriptor,
};
