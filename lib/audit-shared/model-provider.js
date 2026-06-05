'use strict';

// ─── Model Identity: single source of truth ──────────────────────────────────
// Model identity is resolved HERE and nowhere else. Durable code and docs name
// ROLES (`strongest-reasoning-grader`, `representative-generator`,
// `codex-current`) or family ALIASES (`opus`, `sonnet`, `haiku`) — never dated
// release IDs. A stale alias resolving to an older concrete model is a SYSTEM
// bug, not a reason to run the older model. See workspace `AGENTS.md` §
// "Model Identity Discipline" and `skill-graph/AGENTS.md` §
// "Skill Audit Loop Model Policy".
//
// Three resolution strategies, by provider capability:
//   1. CLI latest-alias (Claude). Pass the bare alias `opus`/`sonnet`/`haiku`;
//      the `claude` CLI resolves it to the newest installed model
//      (`claude --help`: "Provide an alias for the latest model (e.g. 'opus')").
//      Zero-touch — a new Opus release is picked up with no edit here.
//   2. CLI current-profile (Codex/app-direct). When the audit is run THROUGH
//      Codex or another GPT app, that app serves its own current model. The
//      `codex-current` role names this: "use whatever the GPT app currently
//      serves." Zero-touch on that route.
//   3. Pinned-with-latest-pointer (Gemini, and the OpenCode GPT route which has
//      no latest-alias). The concrete id lives in `MODEL_LATEST` below and is
//      updated in ONE place — edit the constant or run
//      `node scripts/update-model-roster.js`. Not zero-touch, but single-source.
//
// `REGISTRY_VERSION` stamps eval receipts so scores from different model epochs
// are never silently compared (see § Eval receipt provenance in AGENTS.md).
const REGISTRY_VERSION = '2026-06-04';

// Latest concrete model IDs for providers WITHOUT a CLI latest-alias. This is
// the only place these versioned strings may be restated. Update here when a
// stronger model ships; everything else references these constants.
const MODEL_LATEST = {
  geminiPro: 'gemini-3.1-pro-preview',
  geminiFlash: 'gemini-3-flash-preview',
  // GPT via OpenCode/Copilot has no "current" alias, so the in-repo runner that
  // shells OpenCode for GPT needs a concrete id here. When the user instead runs
  // the audit THROUGH Codex directly, Codex serves its current model and this pin
  // is not consulted (that is the `codex-current` zero-touch route).
  // These are each provider's NEWEST SERVED GPT, not the globally-newest GPT.
  // Verified 2026-06-04 (SKI-145): OpenCode (opencode.json) and github-copilot
  // both cap at gpt-5.4; gpt-5.5 is served ONLY by Codex and is reached via the
  // `codex-current` role above. Do NOT "bump" these to gpt-5.5 — that id is not
  // in the OpenCode/Copilot catalogs and would break dispatch.
  gptOpenCode: 'gpt-5.4',
  gptCopilot: 'github-copilot/gpt-5.4',
};

// OpenCode Zen concrete model ids — single update point for the free advisory
// tier. The zen catalog renames/retires free models over time (e.g.
// minimax-m2.5-free → minimax-m3-free), so pin them HERE and bump via
// `update-model-roster.js --set`, never hand-edit the registry entries below.
// Verify against the live catalog: `opencode models | grep -iE 'free'`.
// Reachable only when the OpenCode Zen provider is connected (`opencode auth login`).
const OPENCODE_LATEST = {
  minimax: 'opencode/minimax-m3-free',
  nemotron: 'opencode/nemotron-3-ultra-free',
  bigPickle: 'opencode/big-pickle',
  deepseekFlash: 'opencode/deepseek-v4-flash-free',
  mimo: 'opencode/mimo-v2.5-free',
};

// Sentinel: the backend should OMIT the model flag and let the CLI/app pick its
// own current configured model. Used by the `codex-current` role.
const USE_CLI_CURRENT = null;

// GPT routing has two valid CLI routes in this repo:
// - OpenCode/Copilot: richer access, costs premium requests (use `copilot` alias)
// - Codex/OpenAI: native OpenAI CLI, separate budget surface, sandboxed
// Policy (2026-04-01): default to Codex/OpenAI to preserve Copilot premium requests.
// Use `copilot` or `copilot-gpt-5.4` aliases to explicitly route through Copilot.
// For QUALITY work prefer the `codex-current` role so a new GPT release is used
// automatically on the Codex/app-direct route (no version pin to update).
const DEFAULT_GPT_54_ALIAS = 'gpt-5.4';
const DEFAULT_GPT_54_MODEL_ID = MODEL_LATEST.gptOpenCode;
const COPILOT_GPT_54_MODEL_ID = MODEL_LATEST.gptCopilot;
const OPENAI_GPT_54_MODEL_ID = MODEL_LATEST.gptOpenCode;

const MODEL_REGISTRY = {
  // ── Role aliases (prefer these in durable contracts; they track "latest"). ──
  'strongest-reasoning-grader': {
    alias: 'strongest-reasoning-grader',
    backend: 'claude',
    modelId: 'opus',
    provider: 'anthropic',
    description: 'Quality judge — newest Opus (resolved by the claude CLI alias)',
    role: 'grader',
  },
  'representative-generator': {
    alias: 'representative-generator',
    backend: 'claude',
    modelId: 'sonnet',
    provider: 'anthropic',
    description: 'Measured average agent — newest Sonnet (resolved by the claude CLI alias)',
    role: 'generator',
  },
  'codex-current': {
    alias: 'codex-current',
    backend: 'codex',
    modelId: USE_CLI_CURRENT,
    provider: 'openai',
    description: 'Newest GPT the Codex/GPT app currently serves (model flag omitted)',
    role: 'grader',
  },
  // ── Claude family aliases — bare alias = newest installed model. ──
  opus: {
    alias: 'opus',
    backend: 'claude',
    modelId: 'opus',
    provider: 'anthropic',
    description: 'Claude Opus — newest, resolved by the claude CLI alias',
  },
  sonnet: {
    alias: 'sonnet',
    backend: 'claude',
    modelId: 'sonnet',
    provider: 'anthropic',
    description: 'Claude Sonnet — newest, resolved by the claude CLI alias',
  },
  haiku: {
    alias: 'haiku',
    backend: 'claude',
    modelId: 'haiku',
    provider: 'anthropic',
    description: 'Claude Haiku — newest, resolved by the claude CLI alias',
  },
  // ── OpenCode Zen free advisory tier (concrete ids pinned in OPENCODE_LATEST). ──
  minimax: {
    alias: 'minimax',
    backend: 'opencode',
    modelId: OPENCODE_LATEST.minimax,
    provider: 'opencode',
    description: 'MiniMax M3 free (OpenCode Zen)',
  },
  nemotron: {
    alias: 'nemotron',
    backend: 'opencode',
    modelId: OPENCODE_LATEST.nemotron,
    provider: 'opencode',
    description: 'Nemotron 3 Super free (OpenCode Zen)',
  },
  'big-pickle': {
    alias: 'big-pickle',
    backend: 'opencode',
    modelId: OPENCODE_LATEST.bigPickle,
    provider: 'opencode',
    description: 'Big Pickle free (OpenCode Zen)',
  },
  'deepseek-flash': {
    alias: 'deepseek-flash',
    backend: 'opencode',
    modelId: OPENCODE_LATEST.deepseekFlash,
    provider: 'opencode',
    description: 'DeepSeek V4 Flash free (OpenCode Zen)',
  },
  mimo: {
    alias: 'mimo',
    backend: 'opencode',
    modelId: OPENCODE_LATEST.mimo,
    provider: 'opencode',
    description: 'MiMo V2.5 free (OpenCode Zen)',
  },
  gemini: {
    alias: 'gemini',
    backend: 'gemini',
    modelId: MODEL_LATEST.geminiPro,
    provider: 'google',
    description: 'Gemini Pro (latest pinned in MODEL_LATEST.geminiPro)',
  },
  'gemini-pro': {
    alias: 'gemini-pro',
    backend: 'gemini',
    modelId: MODEL_LATEST.geminiPro,
    provider: 'google',
    description: 'Gemini Pro (latest pinned in MODEL_LATEST.geminiPro)',
  },
  'gemini-flash': {
    alias: 'gemini-flash',
    backend: 'gemini',
    modelId: MODEL_LATEST.geminiFlash,
    provider: 'google',
    description: 'Gemini Flash (latest pinned in MODEL_LATEST.geminiFlash)',
  },
  // Explicit GPT version aliases (single-source pin via MODEL_LATEST). For
  // quality work that should track the newest GPT automatically, prefer the
  // `codex-current` role over these pinned aliases.
  'gpt-5.4': {
    alias: 'gpt-5.4',
    backend: 'codex',
    modelId: MODEL_LATEST.gptOpenCode,
    provider: 'openai',
    description: 'GPT via Codex/OpenAI (single-source pin in MODEL_LATEST.gptOpenCode; default policy route)',
  },
  gpt54: {
    alias: 'gpt54',
    backend: 'codex',
    modelId: MODEL_LATEST.gptOpenCode,
    provider: 'openai',
    description: 'GPT via Codex/OpenAI (single-source pin in MODEL_LATEST.gptOpenCode; default policy route)',
  },
  'openai-gpt-5.4': {
    alias: 'openai-gpt-5.4',
    backend: 'codex',
    modelId: MODEL_LATEST.gptOpenCode,
    provider: 'openai',
    description: 'GPT via Codex/OpenAI (single-source pin in MODEL_LATEST.gptOpenCode)',
  },
  copilot: {
    alias: 'copilot',
    backend: 'opencode',
    modelId: MODEL_LATEST.gptCopilot,
    provider: 'github-copilot',
    description: 'GPT via OpenCode/Copilot (single-source pin in MODEL_LATEST.gptCopilot)',
  },
  'copilot-gpt-5.4': {
    alias: 'copilot-gpt-5.4',
    backend: 'opencode',
    modelId: MODEL_LATEST.gptCopilot,
    provider: 'github-copilot',
    description: 'GPT via OpenCode/Copilot (single-source pin in MODEL_LATEST.gptCopilot)',
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

// The two frontier models used as the bidirectional eval pair (Opus 4.8 ⇄ GPT-5.5).
// Each is its company's most advanced public thinking model; different vendor
// families means neither grades its own output (no self-preference bias). The
// audit loop generates AND grades with these, swapping roles across the two
// directions. See lib/audit-shared/synthesize-bidirectional.js and
// skill-graph/AGENTS.md § "Skill Audit Loop Model Policy".
const FRONTIER_PAIR = ['opus', 'codex-current'];

// Given one frontier alias, return the OTHER frontier (for swapping generator and
// grader between the two bidirectional directions). Throws for a non-frontier
// token so a caller can never silently pair a frontier model with a weak one.
function otherFrontier(alias) {
  const i = FRONTIER_PAIR.indexOf(alias);
  if (i === -1) {
    throw new Error(`otherFrontier: '${alias}' is not a frontier eval model (expected one of ${FRONTIER_PAIR.join(', ')})`);
  }
  return FRONTIER_PAIR[1 - i];
}

// ── Receipt model resolution (SKI-41) ───────────────────────────────────────
// The bare claude-family aliases (`opus` / `sonnet` / `haiku`) pass straight
// through to the claude CLI, which resolves each to the NEWEST installed model of
// that family (opus -> latest Opus). They are NOT concrete generation ids: a
// receipt recording grader_model:"opus" cannot distinguish Opus 4.8 from 4.9, and
// REGISTRY_VERSION only changes on a registry EDIT, never on CLI resolution. The
// same is true of USE_CLI_CURRENT (codex app-current). A receipt must therefore
// record either a probed/captured concrete id OR the honest sentinel below, so a
// strict cross-date score comparison is blocked rather than silently wrong.
const LATEST_RESOLVING_ALIASES = new Set(['opus', 'sonnet', 'haiku']);
const LATEST_ALIAS_SENTINEL = 'latest-alias-unresolved';

/**
 * Does this resolved model id resolve to "whatever is newest" at run time rather
 * than pinning a concrete generation? True for null (USE_CLI_CURRENT / codex
 * omit-flag) and for the bare claude-family aliases.
 * @param {string|null|undefined} model - the `.model` field from resolveModelExecutor
 * @returns {boolean}
 */
function isLatestResolvingModel(model) {
  if (model == null) return true; // USE_CLI_CURRENT / codex omit-flag
  return LATEST_RESOLVING_ALIASES.has(String(model).trim().toLowerCase());
}

// ─── Audit / board tiers ──────────────────────────────────────────────────────
// The certifying CORE of the Skill Audit Loop is the two-frontier pair (Opus 4.8 ⇄
// GPT-5.5) = FRONTIER_PAIR above. ADVISORY_MODELS is the advisory tier: breadth /
// novelty only. An advisory model may be MEASURED as a generator (graded by a core
// frontier — measurement, not quality-judging, so no-lesser-models is honored) or
// surface candidate findings, but it NEVER sets a certifying verdict. Same split as
// the /boardmeeting quality-vs-advisory tiers.
const ADVISORY_MODELS = ['gemini', 'minimax', 'nemotron', 'big-pickle', 'deepseek-flash', 'mimo', 'gemini-flash'];

// Human-readable model names for OUTPUT/display surfaces ONLY (audit receipts,
// scorecards, board minutes, reports). NOT for prompts/ or lib/audit/graders/ — the
// version-ban gate (check-no-restated-model-versions.js) scans those, and the alias
// there is what makes the newest model auto-resolve (zero-touch). The CLI-resolving
// aliases (opus/sonnet/haiku/codex-current) carry a display PIN bumped via
// update-model-roster.js when a new model ships; this file is exempt from the gate.
const DISPLAY_NAMES = {
  opus: 'Opus 4.8',
  'strongest-reasoning-grader': 'Opus 4.8',
  sonnet: 'Sonnet 4.6',
  'representative-generator': 'Sonnet 4.6',
  haiku: 'Haiku 4.5',
  'codex-current': 'GPT-5.5',
  codex: 'GPT-5.3 Codex',
  'codex-spark': 'GPT-5.3 Codex Spark',
  'gpt-5.4': 'GPT-5.4',
  gpt54: 'GPT-5.4',
  'openai-gpt-5.4': 'GPT-5.4',
  copilot: 'GPT-5.4 (Copilot)',
  'copilot-gpt-5.4': 'GPT-5.4 (Copilot)',
  gemini: 'Gemini 3.1 Pro',
  'gemini-pro': 'Gemini 3.1 Pro',
  'gemini-flash': 'Gemini 3 Flash',
  minimax: 'MiniMax M3',
  nemotron: 'Nemotron 3 Ultra',
  'big-pickle': 'Big Pickle',
  'deepseek-flash': 'DeepSeek V4 Flash',
  mimo: 'MiMo V2.5',
};

// Resolve an alias/role to its human display name for output. Falls back to the
// concrete modelId, then the raw token. Use everywhere a model is shown to a human
// — never print the bare alias ('strongest-reasoning-grader') in output.
function resolveDisplayName(alias) {
  if (alias == null) return String(alias);
  if (DISPLAY_NAMES[alias]) return DISPLAY_NAMES[alias];
  const d = MODEL_REGISTRY[alias];
  if (d && d.modelId) return d.modelId;
  return String(alias);
}

module.exports = {
  REGISTRY_VERSION,
  MODEL_LATEST,
  OPENCODE_LATEST,
  ADVISORY_MODELS,
  DISPLAY_NAMES,
  resolveDisplayName,
  FRONTIER_PAIR,
  otherFrontier,
  USE_CLI_CURRENT,
  LATEST_RESOLVING_ALIASES,
  LATEST_ALIAS_SENTINEL,
  isLatestResolvingModel,
  DEFAULT_GPT_54_ALIAS,
  DEFAULT_GPT_54_MODEL_ID,
  COPILOT_GPT_54_MODEL_ID,
  OPENAI_GPT_54_MODEL_ID,
  MODEL_REGISTRY,
  normalizeOpenCodeModelId,
  resolveModelDescriptor,
};
