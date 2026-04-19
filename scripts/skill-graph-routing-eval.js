#!/usr/bin/env node
/**
 * skill-graph routing-eval — the harness that makes `routing_eval: present` honest.
 *
 * For each skill in the compiled manifest:
 *   1. Run every `activation.examples[]` entry through skill-graph-route →
 *      the top-1 winner MUST be this skill. Else: positive-class FAIL.
 *   2. Run every `activation.anti_examples[]` entry through skill-graph-route →
 *      the top-1 winner MUST NOT be this skill, AND (if non-null) MUST be
 *      named in this skill's `relations.boundary[]`. Else: negative-class FAIL.
 *      A null winner is COVERAGE_GAP (informational, not a FAIL — the anti-
 *      example correctly avoids this skill but nothing else absorbs it).
 *   3. Emit a per-skill verdict + per-case evidence block.
 *
 * This script is the rent-proof for L1's `examples`, `anti_examples`, and
 * `relations.boundary.{skill, reason}` fields. Until this script runs,
 * `routing_eval: present` is a self-assertion a human reviewer cannot check.
 *
 * Usage:
 *   node scripts/skill-graph-routing-eval.js                           # all skills, text summary
 *   node scripts/skill-graph-routing-eval.js --json                    # structured JSON
 *   node scripts/skill-graph-routing-eval.js --skill debugging         # one skill
 *   node scripts/skill-graph-routing-eval.js --quiet                   # exit-code only (CI)
 *   node scripts/skill-graph-routing-eval.js --manifest PATH           # custom manifest
 *   node scripts/skill-graph-routing-eval.js --only-asserted           # only skills with
 *                                                                        routing_eval: present
 *
 * Self-contained. Only uses Node built-ins — no external dependencies.
 * Exit 0 when every evaluated skill passes (or has no cases); exit 1 on
 * any per-skill FAIL.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { routeSkills } = require('./skill-graph-route');

const REPO_ROOT = path.resolve(__dirname, '..');
const DEFAULT_MANIFEST = path.join(REPO_ROOT, 'skills.manifest.json');
const SAMPLE_MANIFEST = path.join(REPO_ROOT, 'examples', 'skills.manifest.sample.json');

// ---------------------------------------------------------------------------
// Case evaluators
// ---------------------------------------------------------------------------

/**
 * Evaluate one positive-class prompt: the top-1 winner MUST equal `expectedSkill`.
 *
 * Returns { kind: 'positive', prompt, verdict, actual, reason }.
 */
function evaluatePositive(manifest, expectedSkill, prompt, todayISO) {
  const result = routeSkills(manifest, {
    query: prompt,
    project: null,
    maxResults: 1,
    minEvalState: 'unverified',
    pathArg: null,
    todayISO,
  });
  const winner = (result.selected[0] && result.selected[0].skill.name) || null;

  if (winner === expectedSkill) {
    return {
      kind: 'positive',
      prompt,
      verdict: 'PASS',
      actual: winner,
      reason: `top-1 winner resolved to ${expectedSkill}`,
    };
  }

  // Gather exclusion detail to explain the miss.
  const excludedByBoundary = result.excluded
    .filter(e => e.role === 'boundary_excluded' && e.skill.name === expectedSkill)
    .map(e => e.reason);

  return {
    kind: 'positive',
    prompt,
    verdict: 'FAIL',
    actual: winner,
    reason: excludedByBoundary.length > 0
      ? `expected ${expectedSkill} but was boundary-excluded (${excludedByBoundary[0]})`
      : `expected ${expectedSkill}, got ${winner === null ? 'no winner' : winner}`,
  };
}

/**
 * Evaluate one negative-class prompt: the winner MUST NOT equal `excludedSkill`,
 * AND if non-null MUST appear in `excludedSkill`'s relations.boundary[].
 *
 * Returns { kind: 'negative', prompt, verdict, actual, reason }.
 *
 * A null winner is treated as COVERAGE_GAP (informational). Rationale: the
 * anti-example correctly avoided the skill under test, which is the primary
 * contract. A null winner means no OTHER skill absorbed the prompt either —
 * that is a routing coverage gap worth surfacing, but it is not a harness
 * regression for this skill.
 */
function evaluateNegative(manifest, excludedSkill, prompt, boundaryTargets, todayISO) {
  const result = routeSkills(manifest, {
    query: prompt,
    project: null,
    maxResults: 1,
    minEvalState: 'unverified',
    pathArg: null,
    todayISO,
  });
  const winner = (result.selected[0] && result.selected[0].skill.name) || null;

  if (winner === excludedSkill) {
    return {
      kind: 'negative',
      prompt,
      verdict: 'FAIL',
      actual: winner,
      reason: `anti_example routed back to ${excludedSkill} — hard-negative regression`,
    };
  }

  if (winner === null) {
    return {
      kind: 'negative',
      prompt,
      verdict: 'COVERAGE_GAP',
      actual: null,
      reason: `no skill absorbed this anti_example — consider a boundary target the router can resolve (${excludedSkill}.relations.boundary: [${boundaryTargets.join(', ') || 'empty'}])`,
    };
  }

  if (boundaryTargets.includes(winner)) {
    return {
      kind: 'negative',
      prompt,
      verdict: 'PASS',
      actual: winner,
      reason: `routed to ${winner}, named in ${excludedSkill}.relations.boundary`,
    };
  }

  return {
    kind: 'negative',
    prompt,
    verdict: 'FAIL',
    actual: winner,
    reason: `routed to ${winner}, which is not in ${excludedSkill}.relations.boundary (${boundaryTargets.join(', ') || 'empty'}) — either the anti_example should be removed or boundary should name ${winner}`,
  };
}

// ---------------------------------------------------------------------------
// Per-skill run
// ---------------------------------------------------------------------------

/**
 * Run every positive and negative case for one skill in the manifest.
 * Returns { skill, verdict, cases, counts }.
 *
 * verdict = PASS iff every case is PASS or COVERAGE_GAP (no FAILs).
 * verdict = NO_CASES when the skill has no examples[] and no anti_examples[].
 */
function evaluateSkill(manifest, skillEntry, todayISO) {
  const name = skillEntry.name;
  const activation = skillEntry.activation || {};
  const examples = Array.isArray(activation.examples) ? activation.examples : [];
  const antiExamples = Array.isArray(activation.anti_examples) ? activation.anti_examples : [];

  const boundaryTargets = extractBoundaryTargets(skillEntry);

  const cases = [];
  for (const p of examples) {
    cases.push(evaluatePositive(manifest, name, p, todayISO));
  }
  for (const a of antiExamples) {
    cases.push(evaluateNegative(manifest, name, a, boundaryTargets, todayISO));
  }

  const counts = { PASS: 0, FAIL: 0, COVERAGE_GAP: 0 };
  for (const c of cases) counts[c.verdict]++;

  const routingEvalDeclared = (skillEntry.health && skillEntry.health.routing_eval) || 'absent';
  let verdict;
  if (cases.length === 0) {
    verdict = 'NO_CASES';
  } else if (counts.FAIL > 0) {
    verdict = 'FAIL';
  } else {
    verdict = 'PASS';
  }

  return {
    skill: name,
    routing_eval_declared: routingEvalDeclared,
    verdict,
    counts,
    case_count: cases.length,
    cases,
  };
}

/** Extract boundary skill names, handling v3 `{skill, reason}` objects and v2 bare strings. */
function extractBoundaryTargets(skillEntry) {
  const b = (skillEntry.relations && skillEntry.relations.boundary) || [];
  const out = [];
  for (const item of b) {
    if (typeof item === 'string') out.push(item);
    else if (item && typeof item.skill === 'string') out.push(item.skill);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

function renderText(reports) {
  const lines = [];
  for (const r of reports) {
    if (r.verdict === 'NO_CASES') {
      lines.push(`SKIP   ${r.skill} — no examples / anti_examples declared`);
      continue;
    }
    const tag = r.verdict === 'PASS' ? 'PASS' : 'FAIL';
    const gap = r.counts.COVERAGE_GAP > 0 ? ` (${r.counts.COVERAGE_GAP} coverage-gap)` : '';
    lines.push(
      `${tag.padEnd(6)} ${r.skill.padEnd(22)} ` +
      `${r.counts.PASS}/${r.case_count} cases pass${gap}   ` +
      `[declared routing_eval: ${r.routing_eval_declared}]`
    );
    for (const c of r.cases) {
      if (c.verdict === 'PASS') continue;
      const mark = c.verdict === 'FAIL' ? '  x' : '  !';
      lines.push(`${mark} [${c.kind}] "${truncate(c.prompt, 72)}"`);
      lines.push(`       ${c.reason}`);
    }
  }

  const total = reports.length;
  const passing = reports.filter(r => r.verdict === 'PASS').length;
  const failing = reports.filter(r => r.verdict === 'FAIL').length;
  const skipped = reports.filter(r => r.verdict === 'NO_CASES').length;
  lines.push('');
  lines.push(`${total} skill(s): ${passing} PASS, ${failing} FAIL, ${skipped} SKIP.`);
  return lines.join('\n');
}

function truncate(s, n) {
  return s.length <= n ? s : s.slice(0, n - 1) + '\u2026';
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function argValue(args, flag) {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : null;
}

function main() {
  const args = process.argv.slice(2);
  const outputJson = args.includes('--json');
  const quiet = args.includes('--quiet');
  const onlyAsserted = args.includes('--only-asserted');
  const skillFilter = argValue(args, '--skill');
  const manifestArg = argValue(args, '--manifest');

  const manifestPath = manifestArg
    ? path.resolve(manifestArg)
    : (fs.existsSync(DEFAULT_MANIFEST) ? DEFAULT_MANIFEST : SAMPLE_MANIFEST);

  if (!fs.existsSync(manifestPath)) {
    console.error(`ERROR manifest not found: ${manifestPath}`);
    console.error('Run `node scripts/generate-manifest.js --output skills.manifest.json` first, or pass --manifest <path>.');
    process.exit(1);
  }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (e) {
    console.error(`ERROR cannot parse manifest: ${e.message}`);
    process.exit(1);
  }

  const todayISO = new Date().toISOString().slice(0, 10);
  const skills = Array.isArray(manifest.skills) ? manifest.skills : [];
  let target = skills;
  if (skillFilter) target = target.filter(s => s.name === skillFilter);
  if (onlyAsserted) target = target.filter(s => s.health && s.health.routing_eval === 'present');

  if (skillFilter && target.length === 0) {
    console.error(`ERROR skill "${skillFilter}" not found in manifest`);
    process.exit(1);
  }

  const reports = target.map(s => evaluateSkill(manifest, s, todayISO));

  if (outputJson) {
    process.stdout.write(JSON.stringify({ reports }, null, 2) + '\n');
  } else if (!quiet) {
    process.stdout.write(renderText(reports) + '\n');
  }

  const anyFail = reports.some(r => r.verdict === 'FAIL');
  process.exit(anyFail ? 1 : 0);
}

// Allow require() for programmatic use by scripts/lint/check-routing-eval.js.
module.exports = { evaluateSkill, evaluatePositive, evaluateNegative, extractBoundaryTargets };

if (require.main === module) main();
