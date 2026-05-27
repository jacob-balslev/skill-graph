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
 *   node scripts/skill-graph-routing-eval.js --confusion-matrix         # expected vs actual
 *   node scripts/skill-graph-routing-eval.js --baseline PATH           # run stratified baseline
 *                                                                        and report Recall@1/3 +
 *                                                                        routing_eval coverage
 *
 * Self-contained. Only uses Node built-ins — no external dependencies.
 * Exit 0 when every evaluated skill passes (or has no cases); exit 1 on
 * any per-skill FAIL.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { routeSkills } = require('./skill-graph-route');
const { packageRoot, workspaceRoot } = require('./lib/roots');

const REPO_ROOT = workspaceRoot();
const PACKAGE_ROOT = packageRoot();
const DEFAULT_MANIFEST = path.join(REPO_ROOT, 'skills.manifest.json');
const SAMPLE_MANIFEST = path.join(REPO_ROOT, 'examples', 'skills.manifest.sample.json');
const PACKAGE_SAMPLE_MANIFEST = path.join(PACKAGE_ROOT, 'examples', 'skills.manifest.sample.json');
const CLI_FRESH_MANIFEST = path.join(REPO_ROOT, '.skill-graph', '_routing-eval-cli.manifest.json');

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

function buildConfusionMatrix(reports) {
  const positive = {};
  const negative = {
    total: 0,
    pass_boundary_target: 0,
    coverage_gap: 0,
    self_hit: 0,
    off_boundary_hit: 0,
  };

  for (const report of reports) {
    for (const c of report.cases) {
      if (c.kind === 'positive') {
        const expected = report.skill;
        const actual = c.actual || 'NO_WINNER';
        if (!positive[expected]) positive[expected] = {};
        positive[expected][actual] = (positive[expected][actual] || 0) + 1;
        continue;
      }

      negative.total++;
      if (c.actual === null) negative.coverage_gap++;
      else if (c.actual === report.skill) negative.self_hit++;
      else if (c.verdict === 'PASS') negative.pass_boundary_target++;
      else negative.off_boundary_hit++;
    }
  }

  return { positive, negative };
}

function renderConfusionMatrix(matrix) {
  const lines = [];
  lines.push('');
  lines.push('POSITIVE-CASE CONFUSION MATRIX');
  lines.push('Expected skill'.padEnd(28) + 'Actual winner'.padEnd(28) + 'Cases');
  lines.push('-'.repeat(61));

  const rows = [];
  for (const expected of Object.keys(matrix.positive).sort()) {
    for (const actual of Object.keys(matrix.positive[expected]).sort()) {
      rows.push({ expected, actual, count: matrix.positive[expected][actual] });
    }
  }

  if (rows.length === 0) {
    lines.push('(no positive examples evaluated)');
  } else {
    for (const row of rows) {
      lines.push(row.expected.padEnd(28) + row.actual.padEnd(28) + String(row.count));
    }
  }

  lines.push('');
  lines.push('NEGATIVE-CASE SUMMARY');
  lines.push(`  total: ${matrix.negative.total}`);
  lines.push(`  pass_boundary_target: ${matrix.negative.pass_boundary_target}`);
  lines.push(`  coverage_gap: ${matrix.negative.coverage_gap}`);
  lines.push(`  self_hit: ${matrix.negative.self_hit}`);
  lines.push(`  off_boundary_hit: ${matrix.negative.off_boundary_hit}`);
  return lines.join('\n');
}

function truncate(s, n) {
  return s.length <= n ? s : s.slice(0, n - 1) + '\u2026';
}

// ---------------------------------------------------------------------------
// Retrieval Baseline \u2014 Recall@1 / Recall@3 / Coverage
// ---------------------------------------------------------------------------

/**
 * Evaluate a stratified retrieval baseline JSON file against the manifest.
 *
 * Baseline format (evals/retrieval-baseline-*.json):
 *   { queries: [ { id, query, expected_skills: [string], category, rationale } ] }
 *
 * Returns a BaselineResult:
 *   {
 *     total: number,
 *     recall_at_1: number,          // fraction [0..1]
 *     recall_at_3: number,          // fraction [0..1]
 *     coverage_present: number,     // skills with routing_eval: present
 *     coverage_total: number,       // total skills in manifest
 *     cases: [ { id, query, expected, top1, top3, hit_at_1, hit_at_3, category } ]
 *   }
 */
function evaluateBaseline(manifest, baselinePath, todayISO) {
  let baseline;
  try {
    baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
  } catch (e) {
    throw new Error(`Cannot parse baseline file at ${baselinePath}: ${e.message}`);
  }

  const queries = Array.isArray(baseline.queries) ? baseline.queries : [];
  if (queries.length === 0) {
    throw new Error(`Baseline file has no queries array or it is empty: ${baselinePath}`);
  }

  const skills = Array.isArray(manifest.skills) ? manifest.skills : [];
  const coveragePresent = skills.filter(s => s.health && s.health.routing_eval === 'present').length;
  const coverageTotal = skills.length;

  const cases = [];
  let hitsAt1 = 0;
  let hitsAt3 = 0;

  for (const entry of queries) {
    const id = entry.id || '?';
    const query = entry.query || '';
    const expected = Array.isArray(entry.expected_skills) ? entry.expected_skills : [];
    const category = entry.category || 'unknown';

    const result = routeSkills(manifest, {
      query,
      project: null,
      maxResults: 3,
      minEvalState: 'unverified',
      pathArg: null,
      todayISO,
    });

    const top3 = result.selected.slice(0, 3).map(s => s.skill.name);
    const top1 = top3[0] || null;

    // A "hit" is when any expected skill appears in the top-1 or top-3 position.
    const hitAt1 = expected.some(e => e === top1);
    const hitAt3 = expected.some(e => top3.includes(e));

    if (hitAt1) hitsAt1++;
    if (hitAt3) hitsAt3++;

    cases.push({ id, query, expected, top1, top3, hit_at_1: hitAt1, hit_at_3: hitAt3, category });
  }

  const total = queries.length;
  return {
    total,
    recall_at_1: total > 0 ? hitsAt1 / total : 0,
    recall_at_3: total > 0 ? hitsAt3 / total : 0,
    coverage_present: coveragePresent,
    coverage_total: coverageTotal,
    cases,
  };
}

function renderBaselineResult(result, verbose) {
  const lines = [];
  const pct = v => `${(v * 100).toFixed(1)}%`;

  lines.push('');
  lines.push('RETRIEVAL BASELINE RESULTS');
  lines.push(`  Queries evaluated : ${result.total}`);
  lines.push(`  Recall@1          : ${pct(result.recall_at_1)}  (${result.cases.filter(c => c.hit_at_1).length}/${result.total})`);
  lines.push(`  Recall@3          : ${pct(result.recall_at_3)}  (${result.cases.filter(c => c.hit_at_3).length}/${result.total})`);
  lines.push(`  Coverage          : ${result.coverage_present}/${result.coverage_total} skills carry routing_eval: present`);

  if (verbose) {
    lines.push('');
    lines.push('  MISSES (not in top-3):');
    const misses = result.cases.filter(c => !c.hit_at_3);
    if (misses.length === 0) {
      lines.push('  (none \u2014 all queries hit within top-3)');
    } else {
      for (const c of misses) {
        lines.push(`    MISS [${c.category}] ${c.id}`);
        lines.push(`         Q: "${truncate(c.query, 80)}"`);
        lines.push(`         expected: ${c.expected.join(', ')} | top-1: ${c.top1 || 'null'} | top-3: ${c.top3.join(', ') || 'none'}`);
      }
    }
    lines.push('');
    lines.push('  HITS@1-only (in top-3 but not top-1):');
    const at3only = result.cases.filter(c => !c.hit_at_1 && c.hit_at_3);
    if (at3only.length === 0) {
      lines.push('  (none)');
    } else {
      for (const c of at3only) {
        lines.push(`    @3 [${c.category}] ${c.id}: expected ${c.expected.join(', ')} | top-1: ${c.top1}`);
      }
    }
  }

  return lines.join('\n');
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
  const confusionMatrix = args.includes('--confusion-matrix');
  const skillFilter = argValue(args, '--skill');
  const manifestArg = argValue(args, '--manifest');
  const baselineArg = argValue(args, '--baseline');

  let manifestPath;
  if (manifestArg) {
    manifestPath = path.resolve(manifestArg);
    if (!fs.existsSync(manifestPath)) {
      console.error(`ERROR manifest not found: ${manifestPath}`);
      process.exit(1);
    }
  } else {
    // No --manifest: regenerate fresh to avoid stale-manifest false-fails.
    // The committed/local skills.manifest.json is gitignored and drifts between
    // runs; reading it here used to yield confusing 9/9 routing failures that
    // were purely staleness, not real regressions. (Audit B5, 2026-05-27.)
    //
    // generate-manifest exits non-zero on schema-validation warnings (e.g., a
    // v8 skill missing legacy v7 `category` / `type`), but it STILL writes the
    // output file. The eval doesn't need those v7 fields, so we prefer the
    // freshly-written output to the stale on-disk manifest even when the
    // generator's validation flagged warnings. Only fall back if the generator
    // produced no file at all.
    const generator = path.join(REPO_ROOT, 'scripts', 'generate-manifest.js');
    if (fs.existsSync(generator)) {
      fs.mkdirSync(path.dirname(CLI_FRESH_MANIFEST), { recursive: true });
      try {
        execFileSync(process.execPath, [generator, '--output', CLI_FRESH_MANIFEST], { stdio: 'pipe' });
      } catch {
        // Validation warning is fine if the file got written; surface a
        // single-line note so operators see the warning without false-failing.
        if (fs.existsSync(CLI_FRESH_MANIFEST)) {
          console.error('WARN auto-generate emitted manifest validation warnings (CONTENT-debt expected during v7→v8); proceeding with the generated manifest');
        }
      }
      if (fs.existsSync(CLI_FRESH_MANIFEST)) {
        manifestPath = CLI_FRESH_MANIFEST;
      } else {
        console.error('WARN auto-generate failed to produce a manifest; falling back to existing manifest');
        manifestPath = fs.existsSync(DEFAULT_MANIFEST)
          ? DEFAULT_MANIFEST
          : (fs.existsSync(SAMPLE_MANIFEST) ? SAMPLE_MANIFEST : PACKAGE_SAMPLE_MANIFEST);
      }
    } else {
      manifestPath = fs.existsSync(SAMPLE_MANIFEST) ? SAMPLE_MANIFEST : PACKAGE_SAMPLE_MANIFEST;
    }
    if (!fs.existsSync(manifestPath)) {
      console.error(`ERROR manifest not found: ${manifestPath}`);
      console.error('Pass --manifest <path> or run from a Skill Graph checkout.');
      process.exit(1);
    }
  }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (e) {
    console.error(`ERROR cannot parse manifest: ${e.message}`);
    process.exit(1);
  }

  const todayISO = new Date().toISOString().slice(0, 10);

  // --baseline mode: run stratified retrieval baseline and report Recall@1/3 + coverage.
  // This runs in addition to the per-skill activation eval, not instead of it.
  let baselineResult = null;
  if (baselineArg) {
    const baselinePath = path.resolve(baselineArg);
    if (!fs.existsSync(baselinePath)) {
      console.error(`ERROR baseline not found: ${baselinePath}`);
      process.exit(1);
    }
    try {
      baselineResult = evaluateBaseline(manifest, baselinePath, todayISO);
    } catch (e) {
      console.error(`ERROR evaluating baseline: ${e.message}`);
      process.exit(1);
    }
  }

  const skills = Array.isArray(manifest.skills) ? manifest.skills : [];
  let target = skills;
  if (skillFilter) target = target.filter(s => s.name === skillFilter);
  if (onlyAsserted) target = target.filter(s => s.health && s.health.routing_eval === 'present');

  if (skillFilter && target.length === 0) {
    console.error(`ERROR skill "${skillFilter}" not found in manifest`);
    process.exit(1);
  }

  const reports = target.map(s => evaluateSkill(manifest, s, todayISO));
  const matrix = confusionMatrix ? buildConfusionMatrix(reports) : null;

  // Coverage summary (always computed; printed unless --quiet).
  const coveragePresent = skills.filter(s => s.health && s.health.routing_eval === 'present').length;
  const coverageTotal = skills.length;

  if (outputJson) {
    const output = matrix ? { reports, confusion_matrix: matrix } : { reports };
    if (baselineResult) output.baseline = baselineResult;
    output.coverage = { present: coveragePresent, total: coverageTotal };
    process.stdout.write(JSON.stringify(output, null, 2) + '\n');
  } else if (!quiet) {
    let text = confusionMatrix
      ? renderText(reports) + renderConfusionMatrix(matrix)
      : renderText(reports);
    // Append coverage line after the skill summary.
    text += `\nCoverage: ${coveragePresent}/${coverageTotal} skills carry routing_eval: present`;
    if (baselineResult) {
      text += renderBaselineResult(baselineResult, /* verbose */ true);
    }
    process.stdout.write(text + '\n');
  }

  const anyFail = reports.some(r => r.verdict === 'FAIL');
  process.exit(anyFail ? 1 : 0);
}

// Allow require() for programmatic use by scripts/lint/check-routing-eval.js.
module.exports = {
  buildConfusionMatrix,
  evaluateSkill,
  evaluatePositive,
  evaluateNegative,
  extractBoundaryTargets,
  renderConfusionMatrix,
  evaluateBaseline,
  renderBaselineResult,
};

if (require.main === module) main();
