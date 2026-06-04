#!/usr/bin/env node
/**
 * WARN-only stability promotion check.
 *
 * This helper is intentionally separate from `skill-lint.js`: stability is a
 * Skill Graph quality posture, not an external marketplace mandate. Callers can
 * use it when they want advisory warnings for premature `stability: stable`.
 *
 * ADVISORY exit semantics (audit H1, 2026-05-27):
 *   - Default invocation exits 0 even when warnings are emitted; warnings
 *     print to stderr and a `WARN` summary line goes to stdout.
 *   - `--strict` flips the contract: exit 1 if any warning is emitted.
 *   - The `stability:check` step in `npm run verify` runs with the default
 *     (advisory) semantics. Use `--strict` only when you intend to block
 *     a release / PR on stability-promotion warnings.
 *   - When invoked through `npm run verify`, callers should treat any
 *     `WARN stability promotion: N warning(s)` line in CI output as a
 *     follow-up signal, not a gate failure.
 *
 * Why advisory by default: the warnings flag `stability: stable` claims
 * that lack the matching eval_state / eval_score / routing_eval evidence.
 * That is CONTENT-debt (drained per-skill via the audit loop), not a
 * SYSTEM bug that should block every commit on every other skill.
 */

'use strict';

const STABLE_EVAL_SCORE_THRESHOLD = 4.0;
const STABLE_DRIFT_MAX_DAYS = 90;

function warning(message) {
  return { severity: 'warning', message };
}

function daysBetween(startDate, endDate) {
  const msPerDay = 24 * 60 * 60 * 1000;
  const start = Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
  const end = Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate());
  return Math.floor((end - start) / msPerDay);
}

function parseIsoDate(value) {
  if (typeof value !== 'string') return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function hasTruthSources(fm) {
  return Boolean(
    fm &&
    fm.grounding &&
    Array.isArray(fm.grounding.truth_sources) &&
    fm.grounding.truth_sources.length > 0
  );
}

function checkStabilityPromotion({ fm, today = new Date() } = {}) {
  const errors = [];
  const warnings = [];

  if (!fm || fm.stability !== 'stable') {
    return { errors, warnings };
  }

  if (fm.eval_state !== 'passing' && fm.eval_state !== 'monitored') {
    warnings.push(warning(`stability: stable criterion 1 failed: eval_state is ${JSON.stringify(fm.eval_state)}`));
  }

  if (typeof fm.eval_score !== 'number' || fm.eval_score < STABLE_EVAL_SCORE_THRESHOLD) {
    warnings.push(warning(`stability: stable criterion 2 failed: eval_score is ${JSON.stringify(fm.eval_score)}; expected >= ${STABLE_EVAL_SCORE_THRESHOLD}`));
  }

  if (fm.routing_eval !== 'present') {
    warnings.push(warning(`stability: stable criterion 3 failed: routing_eval is ${JSON.stringify(fm.routing_eval)}; expected "present"`));
  }

  const verifiedAt = parseIsoDate(fm.drift_check && fm.drift_check.last_verified);
  if (!verifiedAt) {
    warnings.push(warning('stability: stable criterion 4 failed: drift_check.last_verified is missing or invalid'));
  } else {
    const ageDays = daysBetween(verifiedAt, today);
    if (ageDays > STABLE_DRIFT_MAX_DAYS) {
      warnings.push(warning(`stability: stable criterion 4 failed: drift_check.last_verified is ${ageDays} days ago; expected <= ${STABLE_DRIFT_MAX_DAYS}`));
    }
  }

  // v8: the old scope: 'codebase' was replaced by deployment_target: 'project'.
  // Check both for back-compat with legacy skills not yet migrated through the audit loop.
  const isProjectScoped =
    fm.deployment_target === 'project' ||
    fm.scope === 'codebase' ||
    (fm.grounding && fm.grounding.grounding_mode === 'repo_specific');
  if (isProjectScoped && !hasTruthSources(fm)) {
    warnings.push(warning('stability: stable criterion 5 failed: project-scoped skills require non-empty grounding.truth_sources'));
  }

  return { errors, warnings };
}

module.exports = {
  checkStabilityPromotion,
  STABLE_EVAL_SCORE_THRESHOLD,
  STABLE_DRIFT_MAX_DAYS,
};

if (require.main === module) {
  const path = require('path');
  const { parseFrontmatter } = require('../lib/parse-frontmatter');
  const { collectSkillFiles } = require('../../lib/audit/roots');

  const files = collectSkillFiles();
  const today = new Date();
  let skillsChecked = 0;
  let warningCount = 0;

  for (const entry of files) {
    const fm = parseFrontmatter(require('fs').readFileSync(entry.filePath, 'utf8'));
    if (!fm) continue;
    skillsChecked += 1;
    const { warnings } = checkStabilityPromotion({ fm, today });
    if (warnings.length === 0) continue;
    const rel = path.relative(process.cwd(), entry.filePath);
    for (const w of warnings) {
      process.stderr.write(`WARN ${rel}: ${w.message}\n`);
      warningCount += 1;
    }
  }

  const label = warningCount === 0 ? 'OK  ' : 'WARN';
  process.stdout.write(`${label} stability promotion: ${skillsChecked} skill(s) checked; ${warningCount} warning(s).\n`);

  // `--strict` flips advisory semantics: exit 1 when any warning fires.
  // The default invocation (no `--strict`) keeps the prior advisory
  // contract — exit 0 even with warnings — because the warnings flag
  // CONTENT debt that is drained per-skill via the audit loop, not a
  // SYSTEM bug that should block every commit. See header doc + audit H1.
  const strict = process.argv.includes('--strict');
  if (strict && warningCount > 0) {
    process.exit(1);
  }
  process.exit(0);
}
