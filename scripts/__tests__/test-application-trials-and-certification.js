#!/usr/bin/env node
/**
 * Tests for the application-eval trials loop + certification tier (SH-6624 Phase 2).
 *
 * Verifies, with NO live LLM calls (the generator + grader are mocked via the
 * dependency-injection contract):
 *   1. modelFamily() maps aliases to vendor families and returns null for unknowns
 *   2. resolveCertificationTier() — provisional by default; certifying ONLY when
 *      attested AND declared families differ; same-family / undeclared → provisional
 *   3. aggregateTrialVerdicts() — modal verdict, consistency fraction, stability flag,
 *      tie-break by run order, single-trial edge case
 *   4. aggregateTrialGrades() — mean axis scores + majority-passed
 *   5. runApplicationEval() end-to-end with mocked deps: N trials per case, modal
 *      per-case verdict, verdict_consistency, red-herring NO false-positive,
 *      history records carry trial_index/trials_total/certification_tier,
 *      default certification_tier === 'provisional', dry-run accounting scales by trials
 *   6. The PROVISIONAL cap in stampApplicationVerdict honors certification_tier:
 *      APPLICABLE survives only from a certifying run; provisional/absent → PROVISIONAL
 *
 * Uses only Node built-ins.
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

// Redirect the application history log to a temp file BEFORE requiring the
// runner — APPLICATION_HISTORY_LOG is resolved at module load (log-paths.js
// reads SKILL_GRAPH_APP_HISTORY). This keeps the test from polluting real logs.
const TMP_LOG_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'sg-applog-'));
process.env.SKILL_GRAPH_APP_HISTORY = path.join(TMP_LOG_DIR, 'application-history.jsonl');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const {
  modelFamily,
  resolveCertificationTier,
  aggregateTrialVerdicts,
  aggregateTrialGrades,
  runApplicationEval,
  computeApplicationPerCaseVerdict,
  computeApplicationAggregateVerdict,
  isBaselineSaturated,
  APPLICATION_VERDICT_CONSISTENCY_THRESHOLD,
} = require(path.join(REPO_ROOT, 'lib', 'audit', 'application-eval'));
const { stampApplicationVerdict } = require(path.join(REPO_ROOT, 'lib', 'audit', 'evaluate-skill'));
const { isLesserQualityGraderModel, assertTopTierGraderModel } = require(path.join(REPO_ROOT, 'lib', 'audit-shared', 'certification'));

let passCount = 0;
let failCount = 0;

function assert(condition, message, details = '') {
  if (condition) {
    passCount++;
    process.stdout.write(`  PASS  ${message}\n`);
  } else {
    failCount++;
    process.stderr.write(`  FAIL  ${message}\n`);
    if (details) process.stderr.write(`        ${details}\n`);
  }
}

// ── 1. modelFamily() ────────────────────────────────────────────────────────

process.stdout.write('\n1. modelFamily()\n');

const FAMILY_CASES = [
  ['opus', 'anthropic'],
  ['claude-opus-4-8', 'anthropic'],
  ['sonnet', 'anthropic'],
  ['haiku-4-5', 'anthropic'],
  ['gpt-5.4', 'openai'],
  ['codex', 'openai'],
  ['gemini-3-pro', 'google'],
  ['gemini-flash', 'google'],
  ['minimax', 'minimax'],
  ['nemotron', 'nvidia'],
  ['anthropic', 'anthropic'],
  ['openai', 'openai'],
];
for (const [alias, expected] of FAMILY_CASES) {
  assert(modelFamily(alias) === expected, `modelFamily("${alias}") === "${expected}"`, `Got: ${modelFamily(alias)}`);
}
for (const bad of [undefined, null, '', 'some-unknown-model', 123]) {
  assert(modelFamily(bad) === null, `modelFamily(${JSON.stringify(bad)}) === null`, `Got: ${modelFamily(bad)}`);
}

// ── 2. resolveCertificationTier() ─────────────────────────────────────────────

process.stdout.write('\n2. resolveCertificationTier()\n');

assert(
  resolveCertificationTier({}).tier === 'provisional',
  '2a. default (no attestation) → provisional',
);
assert(
  resolveCertificationTier({ certifying: true }).tier === 'provisional',
  '2b. attested but undeclared families → provisional (cannot confirm cross-family)',
);
assert(
  resolveCertificationTier({ certifying: true, generatorFamily: 'opus', graderFamily: 'sonnet' }).tier === 'provisional',
  '2c. same-family (anthropic→anthropic) → provisional (self-preference risk)',
);
const crossTier = resolveCertificationTier({ certifying: true, generatorFamily: 'opus', graderFamily: 'gpt-5.4' });
assert(
  crossTier.tier === 'certifying',
  '2d. cross-family attested (anthropic→openai) → certifying',
);
assert(
  crossTier.generator_family === 'anthropic' && crossTier.grader_family === 'openai',
  '2e. certifying tier records the resolved families',
  JSON.stringify(crossTier),
);
assert(
  resolveCertificationTier({ certifying: false, generatorFamily: 'opus', graderFamily: 'gpt-5.4' }).tier === 'provisional',
  '2f. cross-family but NOT attested → provisional (attestation is required)',
);

// ── 3. aggregateTrialVerdicts() ───────────────────────────────────────────────

process.stdout.write('\n3. aggregateTrialVerdicts()\n');

const agg1 = aggregateTrialVerdicts(['applicable', 'applicable', 'redundant']);
assert(agg1.case_verdict === 'applicable', '3a. modal verdict wins (2 applicable > 1 redundant)');
assert(agg1.verdict_consistency === 0.6667, '3a. consistency = 2/3 = 0.6667', JSON.stringify(agg1));
assert(agg1.verdict_stable === true, `3a. stable at consistency ≥ ${APPLICATION_VERDICT_CONSISTENCY_THRESHOLD}`);

const agg2 = aggregateTrialVerdicts(['applicable', 'redundant', 'mixed']);
assert(agg2.verdict_consistency === 0.3333, '3b. three-way split → consistency 0.3333');
assert(agg2.verdict_stable === false, '3b. three-way split is UNSTABLE');

const agg3 = aggregateTrialVerdicts(['redundant', 'applicable']);
assert(agg3.case_verdict === 'redundant', '3c. tie broken by run order (redundant seen first)', JSON.stringify(agg3));

const agg4 = aggregateTrialVerdicts(['applicable']);
assert(agg4.case_verdict === 'applicable' && agg4.verdict_consistency === 1 && agg4.verdict_stable === true, '3d. single trial → consistency 1, stable');

const agg5 = aggregateTrialVerdicts([]);
assert(agg5.case_verdict === 'redundant' && agg5.trials === 0, '3e. empty trial set → safe default (redundant, 0 trials)');

// ── 4. aggregateTrialGrades() ─────────────────────────────────────────────────

process.stdout.write('\n4. aggregateTrialGrades()\n');

const grades = [
  { primary_axis: 'flag_correctness', axis_scores: { flag_correctness: 90, fix_correctness: 90, false_positive_avoidance: 90, primary_signal_clarity: 50 }, raw_score: 320, max_raw_score: 400, weighted_score: 0.8, passed: true },
  { primary_axis: 'flag_correctness', axis_scores: { flag_correctness: 50, fix_correctness: 50, false_positive_avoidance: 90, primary_signal_clarity: 50 }, raw_score: 240, max_raw_score: 400, weighted_score: 0.5, passed: false },
];
const meanGrade = aggregateTrialGrades(grades);
assert(meanGrade.axis_scores.flag_correctness === 70, '4a. mean flag_correctness = (90+50)/2 = 70', JSON.stringify(meanGrade.axis_scores));
assert(meanGrade.weighted_score === 0.65, '4b. mean weighted_score = (0.8+0.5)/2 = 0.65');
assert(meanGrade.primary_axis_score === 70, '4c. primary_axis_score follows the mean');
assert(meanGrade.passed === false, '4d. majority-passed is false (1 of 2 passed is not a majority)');
assert(aggregateTrialGrades([]) === null, '4e. empty grades → null');

process.stdout.write('\n4b. ceiling-aware no-lift verdicts\n');
const saturatedBaseline = {
  axis_scores: { flag_correctness: 95, fix_correctness: 95, false_positive_avoidance: 95, primary_signal_clarity: 95 },
  weighted_score: 1,
};
const unsaturatedBaseline = {
  axis_scores: { flag_correctness: 60, fix_correctness: 60, false_positive_avoidance: 95, primary_signal_clarity: 60 },
  weighted_score: 0.625,
};
assert(isBaselineSaturated({ baseline: saturatedBaseline, redHerring: false }) === true, '4b-a. all-axes ≥90 real baseline is saturated');
assert(isBaselineSaturated({ baseline: unsaturatedBaseline, redHerring: false }) === false, '4b-b. baseline below the saturation band is not saturated');
assert(
  computeApplicationPerCaseVerdict({ baseline: saturatedBaseline, withSkill: saturatedBaseline, redHerring: false }) === 'not_discriminated_ceiling',
  '4b-c. no-lift at saturated baseline → not_discriminated_ceiling',
);
assert(
  computeApplicationPerCaseVerdict({ baseline: unsaturatedBaseline, withSkill: unsaturatedBaseline, redHerring: false }) === 'equivalent_on_frontier',
  '4b-d. no-lift with headroom → equivalent_on_frontier',
);
assert(
  computeApplicationAggregateVerdict([{ case_verdict: 'not_discriminated_ceiling', red_herring: false }, { case_verdict: 'not_discriminated_ceiling', red_herring: false }]) === 'not_discriminated_ceiling',
  '4b-e. aggregate preserves majority ceiling-inconclusive verdict',
);
assert(
  computeApplicationAggregateVerdict([{ case_verdict: 'equivalent_on_frontier', red_herring: false }, { case_verdict: 'equivalent_on_frontier', red_herring: false }]) === 'equivalent_on_frontier',
  '4b-f. aggregate preserves majority frontier-equivalent verdict',
);

// ── 5. runApplicationEval() end-to-end with mocked deps ───────────────────────

process.stdout.write('\n5. runApplicationEval() with mocked generator + grader\n');

// Build a temp skill with one real case + one red-herring case.
const tmpSkillDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sg-appskill-'));
const tmpEvalsDir = path.join(tmpSkillDir, 'evals');
fs.mkdirSync(tmpEvalsDir, { recursive: true });
fs.writeFileSync(path.join(tmpSkillDir, 'SKILL.md'), `---
name: temp-app-skill
description: A temp skill for the trials-loop end-to-end test.
---
# Temp App Skill

Always use an expand/contract migration for live tables.
`);

const evalDoc = {
  skill_name: 'temp-app-skill',
  subject: 'safe migrations',
  mode: 'application',
  cases: [
    {
      id: 1,
      scenario_type: 'live-schema-change',
      criticality: 'critical',
      red_herring: false,
      scenario: 'ALTER TABLE orders ADD COLUMN ... on a 40M-row table in production.',
      context: 'Production, high write volume.',
      question: 'What should we watch out for here?',
      expected_flags: ['blocking ALTER on a large table locks writes'],
      expected_fix_hints: ['use an expand/contract sequence'],
      absent_signals: ['claiming the change is instant/free'],
    },
    {
      id: 2,
      scenario_type: 'frontend-perf-red-herring',
      criticality: 'normal',
      red_herring: true,
      scenario: 'A React list re-renders on every keystroke.',
      context: 'Client-side only; no database involved.',
      question: 'What should we watch out for here?',
      expected_flags: ['unmemoized list re-render'],
      expected_fix_hints: ['memoize the row component'],
      absent_signals: ['recommending a database migration strategy'],
    },
  ],
};
const evalPath = path.join(tmpEvalsDir, 'application.json');
fs.writeFileSync(evalPath, JSON.stringify(evalDoc, null, 2));

// Mock generator: return distinguishable text so the blind pairwise grader can
// prefer the anonymous response that contains the skill-driven behavior without
// seeing runner labels.
let generatorCalls = 0;
function mockGetEvalResponse(prompt) {
  generatorCalls += 1;
  return /<skill name=/.test(prompt)
    ? 'WITH_SKILL: use an expand/contract migration and avoid blocking writes.'
    : 'BASELINE: apply the change directly.';
}

// Mock grader: reads the run type + red-herring flag out of the grader prompt
// (which the runner builds via buildApplicationGraderPrompt) and returns a fixed
// grade. Real case: with-skill surfaces the issue (flag 0→2). Red-herring: both
// runs keep false_positive_avoidance high (skill must NOT trigger). Scores are on
// the 0–100 axis scale (flag 10→95 with skill on the real case).
let graderCalls = 0;
function mockRunGraderPrompt(prompt) {
  graderCalls += 1;
  if (/Pairwise grading task/.test(prompt)) {
    const redHerring = /Red herring: true/.test(prompt);
    if (redHerring) {
      return JSON.stringify({
        preferred: 'tie',
        confidence: 2,
        with_skill_delta: 'neutral',
        application_verdict: 'EQUIVALENT_ON_FRONTIER',
        criteria_results: [],
        rollup: { gained: 0, lost: 0, already: 1, harm: 0, total: 1 },
        comparative_reasoning: 'Both anonymous responses avoid the migration false-positive on the red herring.',
      });
    }
    const responseAMatch = prompt.match(/## Response A\s*\n\s*([\s\S]*?)\n\s*## Response B/);
    const responseA = responseAMatch ? responseAMatch[1] : '';
    const aIsWithSkill = /WITH_SKILL/.test(responseA);
    return JSON.stringify({
      preferred: aIsWithSkill ? 'A' : 'B',
      confidence: 3,
      with_skill_delta: 'neutral',
      application_verdict: 'APPLICABLE',
      criteria_results: [],
      rollup: { gained: 1, lost: 0, already: 0, harm: 0, total: 1 },
      comparative_reasoning: 'The anonymous response containing expand/contract is materially better.',
    });
  }
  const withSkill = /Run type: with_skill/.test(prompt);
  const redHerring = /Red herring: true/.test(prompt);
  let scores;
  if (redHerring) {
    scores = { flag_correctness: 50, fix_correctness: 50, false_positive_avoidance: 95, primary_signal_clarity: 50 };
  } else if (withSkill) {
    scores = { flag_correctness: 95, fix_correctness: 95, false_positive_avoidance: 95, primary_signal_clarity: 95 };
  } else {
    scores = { flag_correctness: 10, fix_correctness: 10, false_positive_avoidance: 95, primary_signal_clarity: 50 };
  }
  return JSON.stringify({ axis_scores: scores });
}

const TRIALS = 3;
const summary = runApplicationEval(evalPath, {
  trials: TRIALS,
  deps: {
    getEvalResponse: mockGetEvalResponse,
    runGraderPrompt: mockRunGraderPrompt,
  },
});

assert(summary.trials === TRIALS, `5a. summary.trials === ${TRIALS}`, `Got: ${summary.trials}`);
assert(summary.certification_tier === 'provisional', '5b. default certification_tier === provisional (no attestation passed)');
assert(summary.completed === 2 && summary.errors === 0, '5c. both cases completed, no errors', JSON.stringify({ completed: summary.completed, errors: summary.errors }));

// Each case: 2 generated runs × TRIALS, plus 2 pointwise grader calls and
// 1 blind pairwise grader call per trial.
assert(generatorCalls === 2 * 2 * TRIALS, `5d. generator invoked cases×2×trials = ${2 * 2 * TRIALS} times`, `Got: ${generatorCalls}`);
assert(graderCalls === (2 * 2 * TRIALS) + (2 * TRIALS), `5e. grader invoked pointwise + pairwise calls = ${(2 * 2 * TRIALS) + (2 * TRIALS)} times`, `Got: ${graderCalls}`);

const realCase = summary.results.find((r) => r.id === 1);
const redHerringCase = summary.results.find((r) => r.id === 2);
assert(realCase.case_verdict === 'applicable', '5f. real case verdict = applicable (flag 10→95 with skill)', JSON.stringify(realCase.case_verdict));
assert(realCase.verdict_consistency === 1 && realCase.verdict_stable === true, '5g. deterministic mock → consistency 1.0, stable');
assert(realCase.trials_total === TRIALS, '5h. per-case trials_total recorded');
assert(realCase.trial_verdicts.length === TRIALS, '5i. one trial verdict per trial recorded', JSON.stringify(realCase.trial_verdicts));

assert(redHerringCase.case_verdict !== 'false_positive', '5j. red-herring case does NOT false-positive (skill stays silent)', JSON.stringify(redHerringCase.case_verdict));
assert(summary.red_herring_false_positive === 0, '5k. zero red-herring false positives in the rollup');
assert(summary.aggregate_verdict === 'applicable', '5l. aggregate verdict = applicable (real case applicable + clean red herring)');
assert(summary.mean_verdict_consistency === 1, '5m. mean verdict consistency = 1.0 across the deterministic run');
assert(summary.grading_mode === 'pairwise', '5m-2. default grading_mode is pairwise');

// History log: one record per run per trial per case = 2 runs × TRIALS × 2 cases.
const logLines = fs.readFileSync(process.env.SKILL_GRAPH_APP_HISTORY, 'utf8').trim().split('\n').filter(Boolean);
assert(logLines.length === 2 * TRIALS * 2, `5n. history wrote runs×trials×cases = ${2 * TRIALS * 2} records`, `Got: ${logLines.length}`);
const sampleRecord = JSON.parse(logLines[0]);
assert(
  typeof sampleRecord.trial_index === 'number' && sampleRecord.trials_total === TRIALS && sampleRecord.certification_tier === 'provisional' && typeof sampleRecord.trial_verdict === 'string',
  '5o. history record carries trial_index, trials_total, certification_tier, trial_verdict',
  JSON.stringify(sampleRecord),
);

// 5p. Dry-run accounting scales by trials.
const dry = runApplicationEval(evalPath, {
  trials: 4,
  dryRun: true,
  deps: { getEvalResponse: mockGetEvalResponse, runGraderPrompt: mockRunGraderPrompt },
});
assert(dry.dryRun === true && dry.planned_generator_calls === 2 * 2 * 4, '5p. dry-run planned_generator_calls = cases×2×trials', JSON.stringify(dry.planned_generator_calls));
assert(dry.trials === 4 && dry.certification_tier === 'provisional', '5q. dry-run reports trials + certification_tier');
assert(dry.planned_pairwise_grader_calls === 2 * 4, '5q-2. dry-run reports pairwise grader calls separately');
assert(dry.planned_history_records === 2 * 2 * 4, '5q-3. dry-run history records count pointwise run records, not pairwise calls');

// 5r. A certifying run is reachable end-to-end and tier propagates to the summary.
const certifyingSummary = runApplicationEval(evalPath, {
  trials: 1,
  certifying: true,
  generatorFamily: 'opus',
  graderFamily: 'gpt-5.4',
  deps: { getEvalResponse: mockGetEvalResponse, runGraderPrompt: mockRunGraderPrompt },
});
assert(certifyingSummary.certification_tier === 'certifying', '5r. attested cross-family run → summary.certification_tier = certifying');

// ── 6. stampApplicationVerdict honors certification_tier (the PROVISIONAL cap) ──

process.stdout.write('\n6. stampApplicationVerdict() PROVISIONAL cap by tier\n');

const tmpStampDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sg-stamp-'));
fs.mkdirSync(path.join(tmpStampDir, 'evals'), { recursive: true });
const STAMP_SKILL = `---
name: stamp-skill
description: A skill for the cap test.
application_verdict: UNVERIFIED
---
# Stamp Skill
`;
const stampSkillMd = path.join(tmpStampDir, 'SKILL.md');
const stampEval = path.join(tmpStampDir, 'evals', 'application.json');
fs.writeFileSync(stampEval, JSON.stringify({ skill: 'stamp-skill', cases: [] }));

function readVerdict(file) {
  // ADR-0019: application_verdict lives in the audit-state.json sidecar, not
  // the SKILL.md frontmatter. Each stamp overwrites the field (merge), so no
  // per-test sidecar cleanup is needed.
  const sidecarPath = path.join(path.dirname(file), 'audit-state.json');
  if (!fs.existsSync(sidecarPath)) return null;
  try { return JSON.parse(fs.readFileSync(sidecarPath, 'utf8')).application_verdict || null; }
  catch { return null; }
}

function writeApplicationReceipt(dir, result) {
  const receiptPath = path.join(dir, `receipt-${Math.random().toString(16).slice(2)}.json`);
  if (!result.skillName) result.skillName = 'stamp-skill';
  fs.writeFileSync(receiptPath, JSON.stringify({ mode: 'application', skillName: 'stamp-skill', ...result }, null, 2));
  return receiptPath;
}

// 6a. No certification_tier + APPLICABLE → capped to PROVISIONAL.
fs.writeFileSync(stampSkillMd, STAMP_SKILL);
{
  const result = { dryRun: false, aggregate_verdict: 'applicable', total: 2, errors: 0 };
  stampApplicationVerdict(stampEval, result, false, { artifactPath: writeApplicationReceipt(tmpStampDir, result) });
}
assert(readVerdict(stampSkillMd) === 'PROVISIONAL', '6a. applicable + no tier → PROVISIONAL (provisional is the safe default)', `Got: ${readVerdict(stampSkillMd)}`);

// 6b. certification_tier: provisional + APPLICABLE → PROVISIONAL.
fs.writeFileSync(stampSkillMd, STAMP_SKILL);
{
  const result = { dryRun: false, aggregate_verdict: 'applicable', certification_tier: 'provisional', total: 2, errors: 0 };
  stampApplicationVerdict(stampEval, result, false, { artifactPath: writeApplicationReceipt(tmpStampDir, result) });
}
assert(readVerdict(stampSkillMd) === 'PROVISIONAL', '6b. applicable + provisional tier → PROVISIONAL');

// 6c. certification_tier: certifying + APPLICABLE → APPLICABLE survives.
fs.writeFileSync(stampSkillMd, STAMP_SKILL);
{
  const result = {
    dryRun: false,
    aggregate_verdict: 'applicable',
    certification_tier: 'certifying',
    total: 2,
    errors: 0,
    resolved_generator_model: 'claude-opus-4-8-20260601',
    resolved_grader_model: 'gpt-5.5-20260601',
  };
  stampApplicationVerdict(stampEval, result, false, { artifactPath: writeApplicationReceipt(tmpStampDir, result) });
}
assert(readVerdict(stampSkillMd) === 'APPLICABLE', '6c. applicable + certifying tier → APPLICABLE survives');

// 6c-2. certifying tier but unresolved model aliases still cap to PROVISIONAL.
fs.writeFileSync(stampSkillMd, STAMP_SKILL);
{
  const result = {
    dryRun: false,
    aggregate_verdict: 'applicable',
    certification_tier: 'certifying',
    total: 2,
    errors: 0,
    resolved_generator_model: 'latest-alias-unresolved',
    resolved_grader_model: 'gpt-5.5-20260601',
  };
  stampApplicationVerdict(stampEval, result, false, { artifactPath: writeApplicationReceipt(tmpStampDir, result) });
}
assert(readVerdict(stampSkillMd) === 'PROVISIONAL', '6c-2. certifying + unresolved model id → PROVISIONAL');

// 6d. certifying tier but --single-model forces PROVISIONAL.
fs.writeFileSync(stampSkillMd, STAMP_SKILL);
{
  const result = {
    dryRun: false,
    aggregate_verdict: 'applicable',
    certification_tier: 'certifying',
    total: 2,
    errors: 0,
    resolved_generator_model: 'claude-opus-4-8-20260601',
    resolved_grader_model: 'gpt-5.5-20260601',
  };
  stampApplicationVerdict(stampEval, result, false, { singleModel: true, artifactPath: writeApplicationReceipt(tmpStampDir, result) });
}
assert(readVerdict(stampSkillMd) === 'PROVISIONAL', '6d. certifying + --single-model → PROVISIONAL (explicit single-model override)');

// 6e. Non-APPLICABLE verdicts are unaffected by tier (HARMFUL stays HARMFUL).
fs.writeFileSync(stampSkillMd, STAMP_SKILL);
{
  const result = { dryRun: false, aggregate_verdict: 'harmful', total: 2, errors: 0 };
  stampApplicationVerdict(stampEval, result, false, { artifactPath: writeApplicationReceipt(tmpStampDir, result) });
}
assert(readVerdict(stampSkillMd) === 'HARMFUL', '6e. harmful is unaffected by certification_tier');

// ── 7. Top-tier grader allowlist (SH-6626) ────────────────────────────────────
// A quality JUDGE may never be a lesser tier; the grader-model env override must fail
// closed. The generator (measured agent) is NOT covered by this guard.
for (const top of ['opus', 'codex-current', 'gpt-5.4', 'gemini', 'strongest-reasoning-grader']) {
  assert(isLesserQualityGraderModel(top) === false, `7. top-tier judge accepted: ${top}`);
  assert(assertTopTierGraderModel(top) === top, `7. assertTopTierGraderModel passes through: ${top}`);
}
for (const weak of ['haiku', 'sonnet', 'claude-haiku-4-5', 'sonnet-4-6', 'gemini-3-flash-preview', 'minimax', 'nemotron']) {
  assert(isLesserQualityGraderModel(weak) === true, `7. lesser tier flagged: ${weak}`);
  let threw = false;
  try { assertTopTierGraderModel(weak, { source: 'COMPREHENSION_GRADER_MODEL' }); } catch (e) { threw = /lesser-tier/.test(e.message); }
  assert(threw, `7. assertTopTierGraderModel fails closed on: ${weak}`);
}
assert(isLesserQualityGraderModel('') === false && isLesserQualityGraderModel(null) === false, '7. empty/null is not flagged (caller handles unset)');

// ── Cleanup ──────────────────────────────────────────────────────────────────

fs.rmSync(tmpSkillDir, { recursive: true });
fs.rmSync(tmpStampDir, { recursive: true });
fs.rmSync(TMP_LOG_DIR, { recursive: true });

process.stdout.write(`\nResults: ${passCount} passed, ${failCount} failed\n`);
if (failCount > 0) process.exit(1);
