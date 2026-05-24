#!/usr/bin/env node
/**
 * WARN-only stability promotion check.
 *
 * This helper is intentionally separate from `skill-lint.js`: stability is a
 * Skill Graph quality posture, not an external marketplace mandate. Callers can
 * use it when they want advisory warnings for premature `stability: stable`.
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

  if (fm.scope === 'codebase' && !hasTruthSources(fm)) {
    warnings.push(warning('stability: stable criterion 5 failed: codebase skills require non-empty grounding.truth_sources'));
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
  process.exit(0);
}
