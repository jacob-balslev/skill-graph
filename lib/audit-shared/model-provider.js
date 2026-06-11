'use strict';

// ─── Model Identity: single source of truth ──────────────────────────────────
// Model identity is resolved HERE and nowhere else. The audit loop names its two
// frontier models EXPLICITLY by their real product names — `opus` (Opus 4.8,
// Anthropic) and `gpt-5.5` (GPT-5.5, OpenAI) — and the free advisory tier by its
// real model aliases (`gemini`, `deepseek-flash`, …). There are NO invented role
// personas. The registry keeps each model's `provider` so output can print
// "Opus 4.8 (Provider: Anthropic)" / "GPT-5.5 (Provider: OpenAI)".
//
// Three resolution strategies, by provider capability:
//   1. CLI latest-alias (Claude). Pass the bare alias `opus`; the `claude` CLI
//      resolves it to the newest installed Opus
//      (`claude --help`: "Provide an alias for the latest model (e.g. 'opus')").
//      Zero-touch — a new Opus release is picked up with no edit here.
//   2. CLI current-profile (Codex/app-direct). The `gpt-5.5` alias is dispatched
//      through the Codex CLI with the model flag OMITTED, so Codex serves its own
//      current GPT (GPT-5.5 today). When a newer GPT ships, bump the display name
//      here in ONE place; the dispatch stays zero-touch.
//   3. Pinned-with-latest-pointer (Gemini, and the OpenCode GPT route which has
//      no latest-alias). The concrete id lives in `MODEL_LATEST` below and is
//      updated in ONE place — edit the constant or run
//      `node scripts/update-model-roster.js`. Not zero-touch, but single-source.
//
// `REGISTRY_VERSION` stamps eval receipts so scores from different model epochs
// are never silently compared (see § Eval receipt provenance in AGENTS.md).
const REGISTRY_VERSION = '2026-06-10';

// Latest concrete model IDs for providers WITHOUT a CLI latest-alias. This is
// the only place these versioned strings may be restated. Update here when a
// stronger model ships; everything else references these constants.
const MODEL_LATEST = {
  geminiPro: 'gemini-3.1-pro-preview',
  geminiFlash: 'gemini-3-flash-preview',
  // GPT via OpenCode/Copilot has no "current" alias, so the in-repo runner that
  // shells OpenCode for GPT needs a concrete id here. When the audit is run THROUGH
  // Codex directly, Codex serves its current model and this pin is not consulted
  // (that is the `gpt-5.5` omit-flag route).
  // These are each provider's NEWEST SERVED GPT, not the globally-newest GPT.
  // Verified 2026-06-04 (SKI-145): OpenCode (opencode.json) and github-copilot
  // both cap at gpt-5.4; GPT-5.5 is served ONLY by Codex and is reached via the
  // `gpt-5.5` alias above. Do NOT "bump" these to gpt-5.5 — that id is not
  // in the OpenCode/Copilot catalogs and would break dispatch.
  gptOpenCode: 'gpt-5.4',
  gptCopilot: 'github-copilot/gpt-5.4',
};

// OpenCode Zen concrete model ids — single update point for the free advisory
// tier. The zen catalog renames/retires free models over time, so pin them HERE
// and bump via `update-model-roster.js --set`, never hand-edit the registry
// entries below. CRITICAL: pin only models OpenCode Zen lists as FREE — newer
// MiniMax tiers (m2.7, m3) are PAID (verified 2026-06-08: opencode.ai/docs/zen
// lists MiniMax M2.5 as the free one; m2.7/m3 carry per-request cost). The dead
// `minimax-m3-free` id (model-not-found) was replaced with the free `minimax-m2.5`.
// Verify against the live catalog + the Zen free list before bumping:
// `opencode models | grep -iE 'minimax|big-pickle|free'` + https://opencode.ai/docs/zen.
// Reachable only when the OpenCode Zen provider is connected (`opencode auth login`).
const OPENCODE_LATEST = {
  minimax: 'opencode/minimax-m2.5',
  nemotron: 'opencode/nemotron-3-ultra-free',
  bigPickle: 'opencode/big-pickle',
  deepseekFlash: 'opencode/deepseek-v4-flash-free',
  mimo: 'opencode/mimo-v2.5-free',
};

// Sentinel: the backend should OMIT the model flag and let the CLI/app pick its
// own current configured model. Used by the `gpt-5.5` (Codex omit-flag) alias.
const USE_CLI_CURRENT = null;

// GPT routing has two valid CLI routes in this repo:
// - OpenCode/Copilot: richer access, costs premium requests (use `copilot` alias)
// - Codex/OpenAI: native OpenAI CLI, separate budget surface, sandboxed
// Policy (2026-04-01): default to Codex/OpenAI to preserve Copilot premium requests.
// Use `copilot` or `copilot-gpt-5.4` aliases to explicitly route through Copilot.
// For QUALITY work prefer the `gpt-5.5` alias (Codex omit-flag route) so a new GPT
// release is served automatically on the Codex/app-direct route.
const DEFAULT_GPT_54_ALIAS = 'gpt-5.4';
const DEFAULT_GPT_54_MODEL_ID = MODEL_LATEST.gptOpenCode;
const COPILOT_GPT_54_MODEL_ID = MODEL_LATEST.gptCopilot;
const OPENAI_GPT_54_MODEL_ID = MODEL_LATEST.gptOpenCode;

const MODEL_REGISTRY = {
  // ── The two frontier models of the audit loop, named explicitly. ──
  // Generation AND grading draw from these two, swapped so the generator is never
  // the same model as the grader (cross-family — no self-preference, no weak model).
  opus: {
    alias: 'opus',
    backend: 'claude',
    modelId: 'opus',
    provider: 'anthropic',
    description: 'Opus 4.8 (Anthropic) — frontier; the claude CLI alias resolves the newest Opus',
  },
  'gpt-5.5': {
    alias: 'gpt-5.5',
    backend: 'codex',
    modelId: USE_CLI_CURRENT,
    provider: 'openai',
    description: 'GPT-5.5 (OpenAI) — frontier; dispatched through Codex with the model flag omitted so Codex serves its current GPT',
  },
  // ── Other Claude family aliases — bare alias = newest installed model. ──
  // (sonnet/haiku are NOT used by the audit loop — frontier-only generation+grading —
  // but stay defined because run-layout.js tiering + the workspace router reference them.)
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
    description: 'MiniMax M2.5 free (OpenCode Zen)',
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
  // `gpt-5.5` alias (Codex omit-flag route) over these pinned aliases.
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
const FRONTIER_PAIR = ['opus', 'gpt-5.5'];

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

// Haiku is NEVER permitted ANYWHERE in the Skill Audit Loop — not as a mandatory
// participant, not as an advisory participant, and not as the in-session dispatch
// wrapper that drives the per-model primitives. It is too weak for quality work AND
// too weak to reliably orchestrate a primitive; its appearance (even as a cheap
// wrapper) misrepresents the loop. Per `~/Development/.claude/rules/no-lesser-models-for-quality.md`
// (user directive 2026-06-11: "haiku should NOT be allowed in Skill Audit Loop").
// NOTE: gemini-flash is intentionally NOT banned — it is an approved ADVISORY model
// (informs/adds breadth, never decides). The wrapper, however, must be 'sonnet' or a
// native frontier; gemini-flash is never a wrapper.
const PANEL_BANNED_MODELS = new Set(['haiku']);
const PANEL_BANNED_WRAPPERS = new Set(['haiku', 'gemini-flash']);

// Fail-closed guard on the panel roster + dispatch wrapper. Mandatory participants
// MUST be the two frontier models; no participant or wrapper may be a banned model.
// Throws BEFORE any paid dispatch so a misconfigured run never reaches a model call.
function assertPanelRoster({ mandatory = [], advisory = [], wrapper = null } = {}) {
  const violations = [];
  for (const m of mandatory) {
    if (PANEL_BANNED_MODELS.has(m)) violations.push(`mandatory '${m}' is a lesser model — banned from the Skill Audit Loop`);
    else if (!FRONTIER_PAIR.includes(m)) violations.push(`mandatory '${m}' is not a frontier model (expected ${FRONTIER_PAIR.join(' / ')})`);
  }
  for (const a of advisory) {
    if (PANEL_BANNED_MODELS.has(a)) violations.push(`advisory '${a}' is a lesser model — banned from the Skill Audit Loop`);
  }
  if (wrapper && PANEL_BANNED_WRAPPERS.has(wrapper)) {
    violations.push(`dispatch wrapper '${wrapper}' is too weak — the in-session wrapper must be 'sonnet' or the native frontier, NEVER haiku/gemini-flash`);
  }
  if (violations.length) {
    throw new Error(
      `assertPanelRoster: ${violations.join('; ')}. `
      + 'no-lesser-models-for-quality: the audit loop runs on the two frontier models '
      + `(${FRONTIER_PAIR.join(' / ')}) plus the free advisory tier; Haiku is never permitted.`,
    );
  }
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
// `nemotron` (OpenCode Zen nemotron-3-ultra-free) is DROPPED from the auto-dispatch set
// (SKI-210): in the 2026-06-06 eval-driven-development panel run it failed or no-op'd nearly
// every dispatch (cross-review failed twice + returned empty once; revise produced no usable
// document any round) — the free-tier model web-search-loops past the dispatch timeout, so it
// holds a full ~9-min slot to contribute nothing. Its descriptor + display name stay in the
// registry so it still resolves if invoked explicitly; re-add it here once it dispatches
// reliably. Advisory failures are non-blocking, so the panel is unaffected by the removal.
// `big-pickle` (OpenCode Zen big-pickle) is also DROPPED from auto-dispatch (2026-06-09):
// live component-architecture panel + direct 60s probes produced no stdout while OpenCode logs
// showed HTTP 429 / FreeUsageLimitError with retry-after windows above 20,000 seconds. The
// orphaned `opencode run --model opencode/big-pickle` process risk also makes it unsafe as a
// default synchronous advisor. Keep the descriptor for explicit post-reset probes; do not put it
// back in ADVISORY_MODELS until tiny prompts return promptly and the provider is not rate-limited.
//
// ALWAYS-ON / OPT-OUT (`--no-advisory`): the panel wants maximum free-advisory participation
// (breadth/novelty for zero quality risk — a frontier always grades, advisory never certifies).
// An advisory model is NEVER silently dropped on an unmet CLI auth; the auth preflight
// (lib/audit/advisory-preflight.js, run from the panel's live deps) emits a LOUD, actionable
// warning so the operator can recover the free advisor (F5).
// `minimax` (MiniMax M3) is DROPPED from auto-dispatch (2026-06-10T03:55Z): in the live
// content-monitor in-session panel run its text-capture propose produced non-document output
// twice (625 b / 881 b, reason=no-document, including the built-in retry) — the same delivery
// failure recorded for MiniMax on 2026-06-05 in propose-one.js. The descriptor + display name
// stay in the registry so it still resolves when invoked explicitly; re-add it here once it
// reliably emits a complete SKILL.md document via text-capture. Advisory failures are
// non-blocking, so the panel is unaffected by the removal.
const ADVISORY_MODELS = ['gemini', 'deepseek-flash', 'mimo', 'gemini-flash'];

// Human-readable model names for OUTPUT/display surfaces (audit receipts,
// scorecards, board minutes, reports). The CLI-resolving aliases (opus / gpt-5.5)
// carry a display PIN bumped via update-model-roster.js when a new model ships.
const DISPLAY_NAMES = {
  opus: 'Opus 4.8',
  sonnet: 'Sonnet 4.6',
  haiku: 'Haiku 4.5',
  'gpt-5.5': 'GPT-5.5',
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

// Human-readable provider names per alias, for output surfaces that show provenance
// (e.g. "GPT-5.5 (Provider: OpenAI)"). Resolved from the registry `provider` field.
const PROVIDER_DISPLAY = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  google: 'Google',
  'github-copilot': 'GitHub Copilot',
  opencode: 'OpenCode Zen',
};

// Resolve an alias to its human display name for output. Falls back to the
// concrete modelId, then the raw token.
function resolveDisplayName(alias) {
  if (alias == null) return String(alias);
  if (DISPLAY_NAMES[alias]) return DISPLAY_NAMES[alias];
  const d = MODEL_REGISTRY[alias];
  if (d && d.modelId) return d.modelId;
  return String(alias);
}

// Resolve an alias to its display provider name (e.g. 'opus' -> 'Anthropic'),
// or null when the provider is unknown.
function resolveProviderName(alias) {
  const d = MODEL_REGISTRY[alias];
  const key = d && d.provider;
  return key ? (PROVIDER_DISPLAY[key] || key) : null;
}

// Full output label including provider, e.g. "Opus 4.8 (Provider: Anthropic)".
// Use everywhere a model is shown to a human with its provenance.
function resolveModelLabel(alias) {
  const name = resolveDisplayName(alias);
  const provider = resolveProviderName(alias);
  return provider ? `${name} (Provider: ${provider})` : name;
}

module.exports = {
  REGISTRY_VERSION,
  MODEL_LATEST,
  OPENCODE_LATEST,
  ADVISORY_MODELS,
  DISPLAY_NAMES,
  PROVIDER_DISPLAY,
  resolveDisplayName,
  resolveProviderName,
  resolveModelLabel,
  FRONTIER_PAIR,
  otherFrontier,
  PANEL_BANNED_MODELS,
  PANEL_BANNED_WRAPPERS,
  assertPanelRoster,
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
