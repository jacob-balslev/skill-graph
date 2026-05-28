#!/usr/bin/env node
/**
 * Test: stability promotion lint gate (check 14).
 *
 * Six test cases:
 *   1. All-pass: stability=stable + all 5 criteria met  → 0 warnings
 *   2. Criterion 1 fail: eval_state=unverified           → exactly 1 warning
 *   3. Criterion 2 fail: eval_score below threshold      → exactly 1 warning
 *   4. Criterion 3 fail: routing_eval absent             → exactly 1 warning
 *   5. Criterion 4 fail: drift_check.last_verified stale → exactly 1 warning
 *   6. Criterion 5 fail: no grounding.truth_sources      → exactly 1 warning
 *
 * All failures must be WARN level (errors array must remain empty).
 * Experimental / absent stability must produce 0 warnings (not gated).
 *
 * Exit 0 on all pass, 1 on first failure.
 */

'use strict';

const {
  checkStabilityPromotion,
  STABLE_EVAL_SCORE_THRESHOLD,
  STABLE_DRIFT_MAX_DAYS,
} = require('../lint/check-stability-promotion');

// ── Helpers ──────────────────────────────────────────────────────────────────

function fail(msg) {
  process.stderr.write(`FAIL test-stability-promotion: ${msg}\n`);
  process.exit(1);
}

function pass(msg) {
  process.stdout.write(`PASS test-stability-promotion: ${msg}\n`);
}

function assert(condition, msg) {
  if (!condition) fail(msg);
}

/**
 * Build a minimal SKILL.md source text containing a `stability:` key in the
 * frontmatter block. Used to give the locateKey helper something to parse.
 */
function buildSourceText(overrides = {}) {
  const fm = Object.assign(
    {
      stability: 'stable',
      eval_state: 'passing',
      eval_score: STABLE_EVAL_SCORE_THRESHOLD,
      routing_eval: 'present',
      scope: 'codebase',
    },
    overrides
  );

  // Minimal YAML frontmatter (values are not full-YAML-parsed here; only the
  // key locator is exercised by the test, not real parse-frontmatter).
  const lines = ['---'];
  for (const [k, v] of Object.entries(fm)) {
    if (v !== undefined && v !== null) {
      lines.push(`${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`);
    }
  }
  lines.push('---', '# Test skill body');
  return lines.join('\n');
}

/**
 * Run checkStabilityPromotion with a pre-built frontmatter object.
 * Uses a fixed reference date so drift tests are deterministic.
 */
function run(fm, today) {
  const sourceText = buildSourceText({ stability: fm.stability || 'stable' });
  return checkStabilityPromotion({ filePath: 'test/SKILL.md', sourceText, fm, today });
}

// Fixed reference date for deterministic drift tests.
const TODAY = new Date('2026-05-18T00:00:00Z');

// ISO date that is within the allowed window (45 days ago from TODAY).
const RECENT_DATE = '2026-04-03';
// ISO date that is outside the allowed window (100 days ago from TODAY).
const STALE_DATE = '2026-01-28';

// ── Shared base frontmatter (all criteria satisfied) ─────────────────────────

const BASE_FM = {
  stability: 'stable',
  eval_state: 'passing',
  eval_score: STABLE_EVAL_SCORE_THRESHOLD,
  routing_eval: 'present',
  drift_check: { last_verified: RECENT_DATE },
  scope: 'codebase',
  grounding: {
    domain_object: 'test',
    truth_sources: ['schemas/SKILL_METADATA_PROTOCOL_schema.json'],
  },
};

// ── Test 1: All criteria met — 0 warnings ────────────────────────────────────

(function testAllPass() {
  const result = run(BASE_FM, TODAY);
  assert(result.errors.length === 0, 'test1: must have no errors');
  assert(result.warnings.length === 0, `test1: all-pass should emit 0 warnings, got ${result.warnings.length}: ${result.warnings.map(w => w.message).join('; ')}`);
  pass('test1 (all criteria met) → 0 warnings');
})();

// ── Test 2: Criterion 1 fail — eval_state=unverified ─────────────────────────

(function testCriterion1Fail() {
  const fm = Object.assign({}, BASE_FM, { eval_state: 'unverified' });
  const result = run(fm, TODAY);
  assert(result.errors.length === 0, 'test2: must have no errors (WARN only)');
  assert(
    result.warnings.length === 1,
    `test2: criterion-1 fail should emit exactly 1 warning, got ${result.warnings.length}: ${result.warnings.map(w => w.message).join('; ')}`
  );
  assert(
    result.warnings[0].message.includes('criterion 1'),
    `test2: warning must reference criterion 1, got: ${result.warnings[0].message}`
  );
  assert(
    result.warnings[0].message.includes('unverified'),
    `test2: warning must mention "unverified", got: ${result.warnings[0].message}`
  );
  pass('test2 (eval_state=unverified) → 1 warning on criterion 1');
})();

// ── Test 3: Criterion 2 fail — eval_score below threshold ────────────────────

(function testCriterion2Fail() {
  const fm = Object.assign({}, BASE_FM, { eval_score: 3.5 });
  const result = run(fm, TODAY);
  assert(result.errors.length === 0, 'test3: must have no errors (WARN only)');
  assert(
    result.warnings.length === 1,
    `test3: criterion-2 fail should emit exactly 1 warning, got ${result.warnings.length}: ${result.warnings.map(w => w.message).join('; ')}`
  );
  assert(
    result.warnings[0].message.includes('criterion 2'),
    `test3: warning must reference criterion 2, got: ${result.warnings[0].message}`
  );
  assert(
    result.warnings[0].message.includes('3.5'),
    `test3: warning must mention the failing score, got: ${result.warnings[0].message}`
  );
  pass('test3 (eval_score=3.5 < 4.0) → 1 warning on criterion 2');
})();

// ── Test 4: Criterion 3 fail — routing_eval absent ───────────────────────────

(function testCriterion3Fail() {
  const fm = Object.assign({}, BASE_FM, { routing_eval: 'absent' });
  const result = run(fm, TODAY);
  assert(result.errors.length === 0, 'test4: must have no errors (WARN only)');
  assert(
    result.warnings.length === 1,
    `test4: criterion-3 fail should emit exactly 1 warning, got ${result.warnings.length}: ${result.warnings.map(w => w.message).join('; ')}`
  );
  assert(
    result.warnings[0].message.includes('criterion 3'),
    `test4: warning must reference criterion 3, got: ${result.warnings[0].message}`
  );
  assert(
    result.warnings[0].message.includes('routing_eval'),
    `test4: warning must mention routing_eval, got: ${result.warnings[0].message}`
  );
  pass('test4 (routing_eval=absent) → 1 warning on criterion 3');
})();

// ── Test 5: Criterion 4 fail — drift_check.last_verified stale ───────────────

(function testCriterion4Fail() {
  const fm = Object.assign({}, BASE_FM, { drift_check: { last_verified: STALE_DATE } });
  const result = run(fm, TODAY);
  assert(result.errors.length === 0, 'test5: must have no errors (WARN only)');
  assert(
    result.warnings.length === 1,
    `test5: criterion-4 fail should emit exactly 1 warning, got ${result.warnings.length}: ${result.warnings.map(w => w.message).join('; ')}`
  );
  assert(
    result.warnings[0].message.includes('criterion 4'),
    `test5: warning must reference criterion 4, got: ${result.warnings[0].message}`
  );
  assert(
    result.warnings[0].message.includes('days ago'),
    `test5: warning must mention days-ago age, got: ${result.warnings[0].message}`
  );
  pass('test5 (drift_check.last_verified=stale) → 1 warning on criterion 4');
})();

// ── Test 6: Criterion 5 fail — no grounding.truth_sources (codebase scope) ───

(function testCriterion5Fail() {
  const fm = Object.assign({}, BASE_FM, {
    scope: 'codebase',
    grounding: { domain_object: 'test', truth_sources: [] },
  });
  const result = run(fm, TODAY);
  assert(result.errors.length === 0, 'test6: must have no errors (WARN only)');
  assert(
    result.warnings.length === 1,
    `test6: criterion-5 fail should emit exactly 1 warning, got ${result.warnings.length}: ${result.warnings.map(w => w.message).join('; ')}`
  );
  assert(
    result.warnings[0].message.includes('criterion 5'),
    `test6: warning must reference criterion 5, got: ${result.warnings[0].message}`
  );
  assert(
    result.warnings[0].message.includes('truth_sources'),
    `test6: warning must mention truth_sources, got: ${result.warnings[0].message}`
  );
  pass('test6 (grounding.truth_sources empty, scope=codebase) → 1 warning on criterion 5');
})();

// ── Bonus: experimental stability must produce 0 warnings ─────────────────────

(function testExperimentalSkipped() {
  const fm = Object.assign({}, BASE_FM, { stability: 'experimental' });
  const result = run(fm, TODAY);
  assert(result.errors.length === 0, 'bonus: must have no errors');
  assert(result.warnings.length === 0, `bonus: experimental stability must not trigger the gate, got ${result.warnings.length} warnings`);
  pass('bonus (stability=experimental) → gate skipped, 0 warnings');
})();

// ── Bonus: portable scope is exempt from criterion 5 ─────────────────────────

(function testPortableScopeExempt() {
  const fm = Object.assign({}, BASE_FM, {
    scope: 'portable',
    grounding: undefined, // no grounding at all — still exempt
  });
  const result = run(fm, TODAY);
  // Portable has no grounding required, so criterion 5 should NOT fire.
  // Other criteria still apply; count only criterion-5 warnings.
  const criterion5Warnings = result.warnings.filter(w => w.message.includes('criterion 5'));
  assert(criterion5Warnings.length === 0, `bonus portable: portable scope must be exempt from criterion 5, got: ${criterion5Warnings.map(w => w.message).join('; ')}`);
  pass('bonus (scope=portable) → criterion 5 skipped');
})();

process.stdout.write('All stability-promotion tests passed.\n');
