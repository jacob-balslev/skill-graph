#!/usr/bin/env node
/**
 * Stability promotion gate for SKILL.md files (lint check 14).
 *
 * **S1 — stability: stable requires promotion criteria (WARN)**
 *   A skill that declares `stability: stable` is claiming its content is
 *   settled and suitable for production dependence. This check enforces that
 *   the claim is backed by evidence across five independently-checked criteria.
 *
 *   All failures are WARN level — never ERROR. Setting `stability: stable`
 *   does not break builds; it triggers an audit trail so authors know which
 *   criteria remain unmet. This design choice is intentional: 141 skills are
 *   currently `experimental`. If violations were errors, a single `stable`
 *   claim on an unready skill would block the entire lint run for that skill.
 *   Warnings surface the gap without creating a false blocker.
 *
 *   The five promotion criteria (all checked independently — no short-circuit):
 *
 *     1. `eval_state` ≠ `unverified` — evals have been run at least once.
 *        `passing` or `monitored` both satisfy this criterion.
 *
 *     2. `eval_score` ≥ 4.0 (80% of the 0.0–5.0 audit scale) — the most
 *        recent graded audit score meets the quality bar. Absent `eval_score`
 *        fails this criterion because an unscored skill has no evidence of
 *        quality.
 *
 *     3. `routing_eval: present` — routing coverage is explicitly evaluated.
 *        A stable skill must prove it activates correctly, not just claim it
 *        does.
 *
 *     4. `drift_check.last_verified` within the last 90 days — the skill has
 *        been actively maintained. A last_verified date older than 90 days
 *        indicates the content may have drifted from its truth sources.
 *
 *     5. `grounding.truth_sources` populated (for `scope: codebase` and
 *        `scope: reference` skills) OR `scope: portable` (general skills with
 *        no codebase tie-in are exempt from this criterion). A stable
 *        codebase/reference skill must declare what it is grounded in.
 *
 * @module lint/check-stability-promotion
 */

'use strict';

/**
 * Minimum eval score to qualify for stable promotion.
 * Maps to 80% of the 0.0–5.0 audit scale used by scripts/skill-audit.js.
 */
const STABLE_EVAL_SCORE_THRESHOLD = 4.0;

/**
 * Maximum age in days for drift_check.last_verified before a stable skill
 * is considered potentially drifted.
 */
const STABLE_DRIFT_MAX_DAYS = 90;

/**
 * Scope values that require grounding.truth_sources to be populated.
 * portable-scope skills are exempt (criterion 5 does not apply).
 */
const GROUNDING_REQUIRED_SCOPES = ['codebase', 'reference'];

/**
 * Run the stability-promotion check on one SKILL.md file.
 *
 * Only fires when `stability === "stable"`. When the skill is experimental
 * or deprecated, or when `stability` is absent, this function returns early
 * with empty arrays.
 *
 * All findings are WARN level. The caller is responsible for routing them
 * into the warning track rather than the error track.
 *
 * @param {object} opts
 * @param {string}  opts.filePath    - Path to the file (used in messages only).
 * @param {string}  opts.sourceText  - Full file content.
 * @param {object}  opts.fm          - Parsed frontmatter object.
 * @param {Date}    [opts.today]     - Reference date for age checks (injectable
 *                                     for tests; defaults to new Date()).
 *
 * @returns {{
 *   errors:   Array<{message: string, line: number, column: number, help: string}>,
 *   warnings: Array<{message: string, line: number, column: number, help: string}>
 * }}
 */
function checkStabilityPromotion(opts) {
  const { sourceText, fm } = opts;
  const today = opts.today || new Date();
  const warnings = [];

  if (!fm || fm.stability !== 'stable') return { errors: [], warnings };

  // Locate the `stability` key in the frontmatter for code-frame anchoring.
  const keyLine = locateKey(sourceText, 'stability') || { line: 1, column: 1 };

  // ── Criterion 1: eval_state ≠ "unverified" ─────────────────────────────────
  // eval_state must be "passing" or "monitored" to qualify.
  const evalState = fm.eval_state || (fm.eval && fm.eval.content_state);
  if (!evalState || evalState === 'unverified') {
    warnings.push({
      message: `stability: stable — criterion 1 unmet: eval_state is "${evalState || 'absent'}" (must be "passing" or "monitored")`,
      line: keyLine.line,
      column: keyLine.column,
      help: 'Run the eval suite, verify results, and set eval_state to "passing" or "monitored". See docs/field-reference.md § eval_state.',
    });
  }

  // ── Criterion 2: eval_score ≥ 4.0 ──────────────────────────────────────────
  // The 0.0–5.0 audit score; absent or below threshold fails.
  const evalScore = fm.eval_score;
  if (typeof evalScore !== 'number') {
    warnings.push({
      message: `stability: stable — criterion 2 unmet: eval_score is absent (must be ≥ ${STABLE_EVAL_SCORE_THRESHOLD} on the 0.0–5.0 scale)`,
      line: keyLine.line,
      column: keyLine.column,
      help: 'Run `node scripts/skill-audit.js` to produce a graded score and record it in eval_score. See docs/field-reference.md § eval_score.',
    });
  } else if (evalScore < STABLE_EVAL_SCORE_THRESHOLD) {
    warnings.push({
      message: `stability: stable — criterion 2 unmet: eval_score ${evalScore} < ${STABLE_EVAL_SCORE_THRESHOLD} (80% threshold on the 0.0–5.0 scale)`,
      line: keyLine.line,
      column: keyLine.column,
      help: `Improve the skill until eval_score reaches ${STABLE_EVAL_SCORE_THRESHOLD}. Run \`node scripts/skill-audit.js\` to grade. See docs/field-reference.md § eval_score.`,
    });
  }

  // ── Criterion 3: routing_eval: present ─────────────────────────────────────
  const routingEval = fm.routing_eval || (fm.eval && fm.eval.routing_coverage);
  if (routingEval !== 'present') {
    warnings.push({
      message: `stability: stable — criterion 3 unmet: routing_eval is "${routingEval || 'absent'}" (must be "present")`,
      line: keyLine.line,
      column: keyLine.column,
      help: 'Populate examples[] and anti_examples[], then verify with `node scripts/skill-graph-routing-eval.js`. Set routing_eval to "present" once the harness passes. See docs/field-reference.md § routing_eval.',
    });
  }

  // ── Criterion 4: drift_check.last_verified within 90 days ──────────────────
  const lastVerified = fm.drift_check && fm.drift_check.last_verified;
  if (!lastVerified) {
    warnings.push({
      message: `stability: stable — criterion 4 unmet: drift_check.last_verified is absent (must be within last ${STABLE_DRIFT_MAX_DAYS} days)`,
      line: keyLine.line,
      column: keyLine.column,
      help: `Set a drift baseline and verify: \`node scripts/skill-graph-drift.js --record --apply <skill-path>\`. See docs/field-reference.md § drift_check.`,
    });
  } else {
    const verifiedDate = new Date(lastVerified);
    if (Number.isNaN(verifiedDate.getTime())) {
      warnings.push({
        message: `stability: stable — criterion 4 unmet: drift_check.last_verified "${lastVerified}" is not a valid ISO 8601 date`,
        line: keyLine.line,
        column: keyLine.column,
        help: 'Use ISO 8601 format (YYYY-MM-DD). See docs/field-reference.md § drift_check.',
      });
    } else {
      const daysOld = (today.getTime() - verifiedDate.getTime()) / (24 * 60 * 60 * 1000);
      if (daysOld > STABLE_DRIFT_MAX_DAYS) {
        warnings.push({
          message: `stability: stable — criterion 4 unmet: drift_check.last_verified is ${Math.round(daysOld)} days ago (limit: ${STABLE_DRIFT_MAX_DAYS} days)`,
          line: keyLine.line,
          column: keyLine.column,
          help: `Re-verify against truth sources and update drift_check.last_verified: \`node scripts/skill-graph-drift.js --record --apply <skill-path>\`.`,
        });
      }
    }
  }

  // ── Criterion 5: grounding.truth_sources populated (codebase/reference) ────
  // portable-scope skills are exempt — they have no codebase tie-in.
  const scope = fm.scope;
  if (GROUNDING_REQUIRED_SCOPES.includes(scope)) {
    const truthSources =
      fm.grounding && Array.isArray(fm.grounding.truth_sources)
        ? fm.grounding.truth_sources
        : [];
    if (truthSources.length === 0) {
      warnings.push({
        message: `stability: stable — criterion 5 unmet: grounding.truth_sources is absent or empty (required for scope: ${scope})`,
        line: keyLine.line,
        column: keyLine.column,
        help: 'Declare at least one truth source in grounding.truth_sources. See docs/field-reference.md § grounding and docs/skill-metadata-protocol.md § Stability Promotion Criteria.',
      });
    }
  }
  // portable-scope skills are implicitly exempt (criterion 5 does not apply).

  return { errors: [], warnings };
}

/**
 * Locate a YAML key in the frontmatter block and return its { line, column }.
 * Mirrors the pattern used in check-routing-eval.js.
 *
 * @param {string} sourceText - Full file content.
 * @param {string} key        - YAML key name to locate.
 * @returns {{ line: number, column: number } | null}
 */
function locateKey(sourceText, key) {
  const lines = sourceText.split('\n');
  let dashCount = 0;
  let inside = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      dashCount++;
      if (dashCount === 1) { inside = true; continue; }
      if (dashCount === 2) break;
    }
    if (!inside) continue;
    const m = lines[i].match(new RegExp(`^(\\s*)${key}\\s*:`));
    if (m) return { line: i + 1, column: m[1].length + 1 };
  }
  return null;
}

module.exports = {
  checkStabilityPromotion,
  STABLE_EVAL_SCORE_THRESHOLD,
  STABLE_DRIFT_MAX_DAYS,
  GROUNDING_REQUIRED_SCOPES,
};
