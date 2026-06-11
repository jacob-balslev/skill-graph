#!/usr/bin/env node
/**
 * Tests for scripts/check-application-evals.js — the standalone structural
 * conformance validator for evals/application.json (SKI-51).
 *
 * Verifies validateApplicationEval() against the schema-mirrored contract:
 *   1. A fully-conformant ≥5-case suite with a red herring → zero findings.
 *   2. mode discriminator: a comprehension-shaped (evals[]) file is caught.
 *   3. Missing required top-level / per-case fields → CRITICAL findings.
 *   4. Below-floor case count → MEDIUM (CONTENT-migration debt tier).
 *   5. Duplicate case ids → CRITICAL.
 *   6. Invalid criticality enum / non-boolean red_herring → HIGH.
 *   7. Empty expectation-array entries → HIGH.
 *   8. No red-herring case → HIGH (certification-blocking boundary gap).
 *
 * Uses only Node built-ins. Pure function tests — no filesystem walk, no LLM.
 */

'use strict';

const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const { validateApplicationEval, CASE_FLOOR } = require(path.join(REPO_ROOT, 'scripts', 'check-application-evals'));

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

function codes(findings) {
  return findings.map((f) => f.code);
}

function makeCase(id, overrides = {}) {
  return {
    id,
    scenario_type: 'demo-scenario',
    criticality: 'normal',
    red_herring: false,
    scenario: 'A concrete situation the candidate is shown.',
    context: 'Production, at scale, with constraints.',
    question: 'What should the agent do?',
    expected_flags: ['Flags the real issue.'],
    expected_fix_hints: ['Recommends the mechanism-level fix.'],
    absent_signals: ['Does not over-claim.'],
    ...overrides,
  };
}

function makeSuite(cases, top = {}) {
  return {
    skill_name: 'demo-skill',
    subject: 'a demonstrable capability',
    mode: 'application',
    schema_version: 1,
    cases,
    ...top,
  };
}

const REL = 'skills/demo-skill/evals/application.json';

// ── 1. Fully-conformant suite ──────────────────────────────────────────────
process.stdout.write('\n1. Conformant ≥5-case suite with a red herring\n');
{
  const cases = [makeCase(1), makeCase(2), makeCase(3), makeCase(4), makeCase(5, { red_herring: true })];
  const findings = validateApplicationEval(REL, makeSuite(cases));
  assert(findings.length === 0, 'a fully-conformant suite yields zero findings', JSON.stringify(codes(findings)));
  assert(CASE_FLOOR === 5, 'CASE_FLOOR mirrors the schema minItems (5)');
}

// ── 2. mode discriminator ──────────────────────────────────────────────────
process.stdout.write('\n2. mode discriminator catches a comprehension-shaped file\n');
{
  // A comprehension file has evals[] and mode != application.
  const comprehensionShaped = { skill_name: 'demo-skill', subject: 's', mode: 'comprehension', evals: [] };
  const findings = validateApplicationEval(REL, comprehensionShaped);
  assert(codes(findings).includes('bad-mode'), 'mode "comprehension" → bad-mode finding');
  assert(codes(findings).includes('missing-top-field'), 'a comprehension file is missing cases[] → missing-top-field');
}

// ── 3. Missing required fields ──────────────────────────────────────────────
process.stdout.write('\n3. Missing required fields\n');
{
  const findingsTop = validateApplicationEval(REL, { mode: 'application', cases: [makeCase(1)] });
  assert(codes(findingsTop).filter((c) => c === 'missing-top-field').length === 2, 'missing skill_name + subject → 2 missing-top-field findings');

  const badCase = makeCase(1);
  delete badCase.expected_flags;
  delete badCase.absent_signals;
  const fiveCases = [badCase, makeCase(2), makeCase(3), makeCase(4), makeCase(5, { red_herring: true })];
  const findingsCase = validateApplicationEval(REL, makeSuite(fiveCases));
  const missCase = findingsCase.filter((f) => f.code === 'missing-case-field');
  assert(missCase.length === 2, 'a case missing expected_flags + absent_signals → 2 missing-case-field findings', JSON.stringify(codes(findingsCase)));
  assert(missCase.every((f) => f.severity === 'CRITICAL'), 'missing-case-field is CRITICAL');
}

// ── 4. Below-floor → MEDIUM (migration-debt tier) ──────────────────────────
process.stdout.write('\n4. Below-floor case count\n');
{
  const findings = validateApplicationEval(REL, makeSuite([makeCase(1), makeCase(2, { red_herring: true })]));
  const floor = findings.find((f) => f.code === 'below-case-floor');
  assert(Boolean(floor), 'a 2-case suite → below-case-floor finding');
  assert(floor && floor.severity === 'MEDIUM', 'below-case-floor is MEDIUM (CONTENT-migration debt, not a hard break)');
}

// ── 5. Duplicate ids ────────────────────────────────────────────────────────
process.stdout.write('\n5. Duplicate case ids\n');
{
  const cases = [makeCase(1), makeCase(1), makeCase(3), makeCase(4), makeCase(5, { red_herring: true })];
  const findings = validateApplicationEval(REL, makeSuite(cases));
  const dup = findings.find((f) => f.code === 'duplicate-case-id');
  assert(Boolean(dup), 'a repeated id → duplicate-case-id finding');
  assert(dup && dup.severity === 'CRITICAL', 'duplicate-case-id is CRITICAL (--case filter would be ambiguous)');
}

// ── 6. Bad enum / type ──────────────────────────────────────────────────────
process.stdout.write('\n6. Invalid criticality enum and non-boolean red_herring\n');
{
  const cases = [
    makeCase(1, { criticality: 'medium' }),       // comprehension uses 'medium'; application does not
    makeCase(2, { red_herring: 'yes' }),
    makeCase(3),
    makeCase(4),
    makeCase(5, { red_herring: true }),
  ];
  const findings = validateApplicationEval(REL, makeSuite(cases));
  assert(codes(findings).includes('bad-criticality'), 'criticality "medium" → bad-criticality (application enum is critical/high/normal/low)');
  assert(codes(findings).includes('bad-red-herring'), 'red_herring "yes" → bad-red-herring');
}

// ── 7. Empty expectation entries ────────────────────────────────────────────
process.stdout.write('\n7. Empty expectation-array entries\n');
{
  const cases = [
    makeCase(1, { expected_flags: ['', 'real flag'] }),
    makeCase(2),
    makeCase(3),
    makeCase(4),
    makeCase(5, { red_herring: true }),
  ];
  const findings = validateApplicationEval(REL, makeSuite(cases));
  assert(codes(findings).includes('empty-expectation-entry'), 'an empty string in expected_flags → empty-expectation-entry');
}

// ── 8. No red herring → HIGH certification blocker ──────────────────────────
process.stdout.write('\n8. No red-herring case\n');
{
  const cases = [makeCase(1), makeCase(2), makeCase(3), makeCase(4), makeCase(5)];
  const findings = validateApplicationEval(REL, makeSuite(cases));
  const rh = findings.find((f) => f.code === 'no-red-herring');
  assert(Boolean(rh), 'an all-real suite → no-red-herring finding');
  assert(rh && rh.severity === 'HIGH', 'no-red-herring is HIGH (boundary behavior must be tested before certification)');
}

// ── Summary ─────────────────────────────────────────────────────────────────
process.stdout.write(`\nResults: ${passCount} passed, ${failCount} failed\n`);
process.exit(failCount === 0 ? 0 : 1);
