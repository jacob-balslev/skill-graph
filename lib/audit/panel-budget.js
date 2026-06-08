'use strict';

// ─── Panel runner: rate-limit recovery + in-skill-graph budget gate ───────────
//
// The multi-model panel (run-skill-audit-loop.js) dispatches multi-minute live model
// calls. Two failure classes were previously indistinguishable from a hard crash and
// aborted the whole run with no path back:
//
//   1. RATE LIMIT — a provider 429 / "usage limit reached" / "try again in Ns". This
//      is RECOVERABLE: the run should checkpoint what it has and raise a distinct
//      retry-after-reset error so a caller (or a loop) can wait for the window and
//      resume, instead of treating it as a fatal mandatory-model failure.
//   2. BUDGET EXHAUSTED — a model whose daily/spend budget is already spent. A
//      PRE-dispatch gate should refuse to even start the call (and again raise a
//      distinct, recoverable error), rather than burn the dispatch and fail late.
//
// This module is SELF-CONTAINED in skill-graph (no workspace budget-monitor.js
// dependency — Skill Graph SYSTEM code lives in skill-graph/). The budget gate reads a
// simple per-model exhausted-lock file under a skill-graph-local budget dir; the
// rate-limit parser is a pure text scan. Both are dependency-light and unit-testable.

const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Recoverable: a provider rate limit was hit. Distinct from a hard crash so callers
 * can branch (wait for reset, then resume) instead of aborting the whole run.
 */
class RateLimitError extends Error {
  constructor(message, { model, retryAfterMs = null, resetAt = null, checkpoint = null } = {}) {
    super(message);
    this.name = 'RateLimitError';
    this.code = 'RATE_LIMIT';
    this.recoverable = true;
    this.model = model || null;
    this.retryAfterMs = retryAfterMs;
    this.resetAt = resetAt;
    this.checkpoint = checkpoint;
  }
}

/**
 * Recoverable: a model's budget is already spent (pre-dispatch gate refused the call).
 */
class BudgetExhaustedError extends Error {
  constructor(message, { model, resetAt = null, lockPath = null } = {}) {
    super(message);
    this.name = 'BudgetExhaustedError';
    this.code = 'BUDGET_EXHAUSTED';
    this.recoverable = true;
    this.model = model || null;
    this.resetAt = resetAt;
    this.lockPath = lockPath;
  }
}

// Rate-limit signals across the CLIs/providers the panel dispatches (claude, codex,
// gemini, opencode). Matched case-insensitively against the combined dispatch text.
const RATE_LIMIT_PATTERNS = [
  /\b429\b/,
  /rate[\s_-]?limit/i,
  /rate[\s_-]?limited/i,
  /too many requests/i,
  /usage limit (?:reached|exceeded)/i,
  /quota (?:exceeded|exhausted)/i,
  /overloaded/i,
  /resource[\s_-]?exhausted/i,
  /retry[\s_-]?after/i,
];

// Reset/retry-after hints — used to estimate when to retry. Best-effort; null when absent.
const RETRY_AFTER_SECONDS = [
  /retry[\s_-]?after[:\s]+(\d+)\s*s?/i,
  /try again in\s+(\d+)\s*seconds?/i,
  /wait\s+(\d+)\s*seconds?/i,
];
const RETRY_AFTER_MINUTES = [
  /try again in\s+(\d+)\s*minutes?/i,
  /resets? in\s+(\d+)\s*minutes?/i,
];

/**
 * Scan combined dispatch text (error message + stdout + stderr + log) for a rate-limit
 * signal and, when possible, a retry-after window.
 *
 * @param {string} text
 * @returns {{ isRateLimit: boolean, retryAfterMs: (number|null), resetAt: (string|null), matched: (string|null) }}
 */
function parseRateLimit(text) {
  const s = String(text || '');
  let matched = null;
  for (const re of RATE_LIMIT_PATTERNS) {
    if (re.test(s)) { matched = re.source; break; }
  }
  if (!matched) return { isRateLimit: false, retryAfterMs: null, resetAt: null, matched: null };

  let retryAfterMs = null;
  for (const re of RETRY_AFTER_SECONDS) {
    const m = s.match(re);
    if (m) { retryAfterMs = Number(m[1]) * 1000; break; }
  }
  if (retryAfterMs == null) {
    for (const re of RETRY_AFTER_MINUTES) {
      const m = s.match(re);
      if (m) { retryAfterMs = Number(m[1]) * 60 * 1000; break; }
    }
  }
  // resetAt is intentionally NOT computed from Date.now() (the runtime bans it in scripts and
  // it would break resume); a caller that needs an absolute time stamps it from retryAfterMs.
  return { isRateLimit: true, retryAfterMs, resetAt: null, matched };
}

// ─── Infra-error classification (shared by both loop runners) ─────────────────
//
// A live model dispatch can fail three ways the runner must treat differently:
//   • TRANSIENT  — timeout / rate-limit / econnreset / an unknown blip → retry with backoff.
//   • STRUCTURAL — worktree / "session not found" incompatibility → a retry cannot fix it.
//   • UNAVAILABLE — model or CLI not found (ENOENT / command failed) → switch model or abort.
// This is the single owner of the classification: run-skill-improvement-loop.js and
// run-skill-audit-loop.js both import it, so the TRANSIENT/STRUCTURAL/UNAVAILABLE buckets
// never drift between the two loops. Unknown errors default to TRANSIENT (retryable) so a
// novel blip on a single cell does not collapse the run before a retry is even attempted.
const INFRA_ERROR_CLASS = {
  TRANSIENT: 'transient',
  STRUCTURAL: 'structural',
  UNAVAILABLE: 'unavailable',
};

/**
 * Classify a dispatch error (or its message string) into an INFRA_ERROR_CLASS bucket.
 * Accepts an Error or a bare string (`error.message || error`), case-insensitive match.
 *
 * @param {Error|string} error
 * @returns {string} one of INFRA_ERROR_CLASS.*
 */
function classifyInfraError(error) {
  const msg = String((error && error.message) || error).toLowerCase();
  if (msg.includes('session not found') || msg.includes('worktree')) return INFRA_ERROR_CLASS.STRUCTURAL;
  if (msg.includes('rate limit') || msg.includes('timeout') || msg.includes('econnreset')) return INFRA_ERROR_CLASS.TRANSIENT;
  if (msg.includes('not found') || msg.includes('enoent') || msg.includes('command failed')) return INFRA_ERROR_CLASS.UNAVAILABLE;
  return INFRA_ERROR_CLASS.TRANSIENT; // default to transient (retryable)
}

/**
 * Default skill-graph-local budget dir. Env `SKILL_AUDIT_BUDGET_DIR` overrides; otherwise
 * a stable per-user temp dir (kept out of the public repo tree — never committed).
 */
function defaultBudgetDir() {
  return process.env.SKILL_AUDIT_BUDGET_DIR || path.join(os.tmpdir(), 'skill-audit-budget');
}

/**
 * Per-model exhausted-lock path. Mirrors the workspace `exhausted-<model>.lock` convention
 * but lives in a skill-graph-local dir (no workspace dependency). The model alias is
 * filename-sanitized so `codex-current` / `gemini-flash` map to safe names.
 */
function exhaustedLockPath(model, budgetDir = defaultBudgetDir()) {
  const safe = String(model || 'unknown').replace(/[^a-zA-Z0-9._-]/g, '_');
  return path.join(budgetDir, `exhausted-${safe}.lock`);
}

/**
 * Pre-dispatch budget gate. Throws BudgetExhaustedError when the per-model exhausted-lock
 * exists. fs is injectable for unit tests; defaults to the real fs.
 *
 * @param {object}  opts
 * @param {string}  opts.model
 * @param {string} [opts.budgetDir]  default defaultBudgetDir().
 * @param {object} [opts.fsImpl=fs]  injectable fs (existsSync + readFileSync).
 * @throws {BudgetExhaustedError}
 */
function assertBudgetAvailable({ model, budgetDir = defaultBudgetDir(), fsImpl = fs } = {}) {
  const lockPath = exhaustedLockPath(model, budgetDir);
  let exists = false;
  try { exists = fsImpl.existsSync(lockPath); } catch (_) { exists = false; }
  if (!exists) return;
  let resetAt = null;
  try {
    const raw = fsImpl.readFileSync(lockPath, 'utf8');
    const parsed = JSON.parse(raw);
    resetAt = parsed && parsed.resetAt ? parsed.resetAt : null;
  } catch (_) { /* lock present but unparseable — still a hard gate */ }
  throw new BudgetExhaustedError(
    `budget exhausted for ${model}: ${lockPath} present`
    + (resetAt ? ` (resets ${resetAt})` : '')
    + '. The pre-dispatch budget gate refused the call — clear the lock or wait for the budget window.',
    { model, resetAt, lockPath },
  );
}

module.exports = {
  RateLimitError,
  BudgetExhaustedError,
  parseRateLimit,
  defaultBudgetDir,
  exhaustedLockPath,
  assertBudgetAvailable,
  RATE_LIMIT_PATTERNS,
  INFRA_ERROR_CLASS,
  classifyInfraError,
};
