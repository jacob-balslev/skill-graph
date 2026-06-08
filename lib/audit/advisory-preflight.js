'use strict';

// ─── Advisory auth preflight — maximize free-advisory participation ───────────
//
// The advisory tier (free models — Gemini, the OpenCode Zen tier) is OPT-OUT
// (`--no-advisory`): the panel WANTS as many free advisors as possible, because they
// add breadth/novelty for zero quality risk (a frontier always grades; advisory never
// certifies). The recurring failure was the opposite of dropping them on purpose: a free
// model whose CLI was simply not logged in would fail SILENTLY at dispatch and be
// quietly skipped, so the operator never learned a trivially-fixable auth gap had
// shrunk the panel.
//
// This preflight checks each advisory model's CLI auth BEFORE the run and emits a LOUD,
// actionable warning ("model X unavailable — run `gemini /auth` / `opencode auth login`")
// for any that are not ready. It NEVER removes a model from the advisory set — an unmet
// auth is surfaced for the operator to fix, never silently dropped. (If the model is still
// unauthed at dispatch it fails best-effort as before, now with a recorded failure_reason.)

// Per-backend auth-fix hint shown in the loud warning.
const AUTH_HINT = {
  gemini: 'run `gemini` once and complete `/auth` (or set GEMINI_API_KEY)',
  opencode: 'run `opencode auth login` and select the provider',
  claude: 'run `claude` once to authenticate (or check ANTHROPIC_API_KEY)',
  codex: 'run `codex` once to authenticate the GPT provider',
};

/**
 * Run the advisory auth preflight.
 *
 * @param {object}   opts
 * @param {string[]} opts.models                 advisory model aliases (the FULL set; never filtered).
 * @param {Function} opts.resolveBackend         (model) => { backend } — maps an alias to its CLI.
 * @param {Function} opts.probe                  (backend) => { authed: boolean, detail?: string } —
 *                                               injectable so tests don't spawn CLIs. A throwing or
 *                                               undefined-returning probe is treated as NOT authed
 *                                               (fail-loud, never fail-silent).
 * @param {Function} [opts.log=console.warn]     loud-warning sink.
 * @returns {{ models: string[], warnings: Array<{model, backend, hint, detail}>, ready: string[] }}
 *          `models` is returned UNCHANGED (no model is ever dropped here).
 */
function advisoryAuthPreflight({ models = [], resolveBackend, probe, log = console.warn } = {}) {
  const warnings = [];
  const ready = [];
  // De-dupe probes per backend (many advisory aliases share one CLI, e.g. opencode).
  const backendResult = new Map();

  for (const model of models) {
    let backend = 'claude';
    try { backend = (resolveBackend && resolveBackend(model).backend) || 'claude'; } catch (_) { backend = 'claude'; }

    if (!backendResult.has(backend)) {
      let res;
      try { res = probe ? probe(backend) : { authed: true }; } catch (e) { res = { authed: false, detail: e && e.message }; }
      if (!res || typeof res.authed !== 'boolean') res = { authed: false, detail: 'probe returned no verdict' };
      backendResult.set(backend, res);
    }
    const res = backendResult.get(backend);

    if (res.authed) {
      ready.push(model);
    } else {
      const hint = AUTH_HINT[backend] || `authenticate the ${backend} CLI`;
      warnings.push({ model, backend, hint, detail: res.detail || null });
      // LOUD, actionable, and NON-fatal — the model stays in the advisory set.
      log(
        `⚠️  ADVISORY AUTH: ${model} (${backend} CLI) is not authenticated — ${hint}. `
        + 'It stays in the advisory set (never silently dropped); fix the auth to recover this free advisor.'
        + (res.detail ? ` [${res.detail}]` : ''),
      );
    }
  }

  return { models: models.slice(), warnings, ready };
}

module.exports = { advisoryAuthPreflight, AUTH_HINT };
