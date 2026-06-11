'use strict';

// Unit test: two-frontier bidirectional eval — shared certification + conservative
// synthesis (Opus 4.8 ⇄ GPT-5.5). Covers lib/audit-shared/{certification,
// synthesize-bidirectional}.js and the model-provider frontier-pair helpers.

const assert = require('assert');
const cert = require('../../lib/audit-shared/certification');
const syn = require('../../lib/audit-shared/synthesize-bidirectional');
const mp = require('../../lib/audit-shared/model-provider');

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log(`  PASS    ${name}`);
}

console.log('1. Frontier pair + other-frontier swap');
check('FRONTIER_PAIR is [opus, gpt-5.5]', () => {
  assert.deepStrictEqual(mp.FRONTIER_PAIR, ['opus', 'gpt-5.5']);
});
check('otherFrontier swaps the pair', () => {
  assert.strictEqual(mp.otherFrontier('opus'), 'gpt-5.5');
  assert.strictEqual(mp.otherFrontier('gpt-5.5'), 'opus');
});
check('otherFrontier throws for a non-frontier (no silent weak pairing)', () => {
  assert.throws(() => mp.otherFrontier('sonnet'), /not a frontier/);
});

console.log('2. Cross-family certification (both directions certifying)');
check('opus⇄gpt-5.5 is cross-family certifying both ways', () => {
  assert.strictEqual(cert.resolveCertificationTier({ certifying: true, generatorFamily: 'opus', graderFamily: 'gpt-5.5' }).tier, 'certifying');
  assert.strictEqual(cert.resolveCertificationTier({ certifying: true, generatorFamily: 'gpt-5.5', graderFamily: 'opus' }).tier, 'certifying');
});
check('same family caps at provisional (self-preference guard)', () => {
  assert.strictEqual(cert.resolveCertificationTier({ certifying: true, generatorFamily: 'opus', graderFamily: 'sonnet' }).tier, 'provisional');
});
check('no certifying assertion => provisional', () => {
  assert.strictEqual(cert.resolveCertificationTier({ generatorFamily: 'opus', graderFamily: 'gpt-5.5' }).tier, 'provisional');
});
check('isCrossFamily true only for different known families', () => {
  assert.strictEqual(cert.isCrossFamily('opus', 'gpt-5.5'), true);
  assert.strictEqual(cert.isCrossFamily('opus', 'sonnet'), false);
  assert.strictEqual(cert.isCrossFamily('opus', 'mystery'), false);
});

console.log('3. Conservative synthesis (application)');
check('both APPLICABLE => APPLICABLE, agreement true', () => {
  const r = syn.reconcile({ verdict: 'APPLICABLE' }, { verdict: 'APPLICABLE' }, { mode: 'application' });
  assert.strictEqual(r.verdict, 'APPLICABLE');
  assert.strictEqual(r.agreement, true);
  assert.strictEqual(r.reconciliation, 'conservative');
});
check('APPLICABLE vs MIXED => MIXED (lower wins), agreement false', () => {
  const r = syn.reconcile({ verdict: 'APPLICABLE' }, { verdict: 'MIXED' }, { mode: 'application' });
  assert.strictEqual(r.verdict, 'MIXED');
  assert.strictEqual(r.agreement, false);
});
check('APPLICABLE vs HARMFUL => HARMFUL (most skeptical)', () => {
  assert.strictEqual(syn.reconcile({ verdict: 'APPLICABLE' }, { verdict: 'HARMFUL' }, { mode: 'application' }).verdict, 'HARMFUL');
});
check('APPLICABLE vs no-lift verdict preserves scoped no-lift category', () => {
  assert.strictEqual(syn.reconcile({ verdict: 'APPLICABLE' }, { verdict: 'NOT_DISCRIMINATED_CEILING' }, { mode: 'application' }).verdict, 'NOT_DISCRIMINATED_CEILING');
  assert.strictEqual(syn.reconcile({ verdict: 'APPLICABLE' }, { verdict: 'EQUIVALENT_ON_FRONTIER' }, { mode: 'application' }).verdict, 'EQUIVALENT_ON_FRONTIER');
});
check('APPLICABLE only when BOTH agree (PROVISIONAL drags it down)', () => {
  assert.strictEqual(syn.reconcile({ verdict: 'APPLICABLE' }, { verdict: 'PROVISIONAL' }, { mode: 'application' }).verdict, 'PROVISIONAL');
});
check('unknown verdict is normalized to UNVERIFIED — never surfaced as the synthesized verdict (SH-6678)', () => {
  const r = syn.reconcile({ verdict: 'APPLICABLE' }, { verdict: 'WAT' }, { mode: 'application' });
  // The invalid "WAT" must NOT become the synthesized verdict; it floors to UNVERIFIED,
  // which (conservatively) caps the whole reconciliation at UNVERIFIED.
  assert.strictEqual(r.verdict, 'UNVERIFIED');
  assert.strictEqual(r.agreement, false);
  assert.match(r.note, /normalized to UNVERIFIED/);
  assert.match(r.note, /codex="WAT"/);
});
check('unknown verdict on BOTH directions floors to UNVERIFIED, agreement false (SH-6678)', () => {
  const r = syn.reconcile({ verdict: 'BOGUS' }, { verdict: 'WAT' }, { mode: 'comprehension' });
  assert.strictEqual(r.verdict, 'UNVERIFIED');
  assert.strictEqual(r.agreement, false);
});
check('normalizeKnown leaves real verdicts untouched, floors unknowns', () => {
  assert.strictEqual(syn.normalizeKnown(syn.APPLICATION_RANK, 'APPLICABLE'), 'APPLICABLE');
  assert.strictEqual(syn.normalizeKnown(syn.APPLICATION_RANK, 'WAT'), 'UNVERIFIED');
});

console.log('4. Conservative synthesis (comprehension) + procedural carve-out');
check('both PASS => PASS', () => {
  assert.strictEqual(syn.reconcile({ verdict: 'PASS' }, { verdict: 'PASS' }, { mode: 'comprehension' }).verdict, 'PASS');
});
check('PASS vs SHALLOW => SHALLOW', () => {
  assert.strictEqual(syn.reconcile({ verdict: 'PASS' }, { verdict: 'SHALLOW' }, { mode: 'comprehension' }).verdict, 'SHALLOW');
});
check('one procedural direction caps the lone graded direction at PROVISIONAL — PASS requires both (SH-6679)', () => {
  // A graded PASS opposite a procedural direction may NOT certify alone — caps to PROVISIONAL.
  const r = syn.reconcile({ verdict: 'PASS' }, { verdict: 'SKIPPED_BASELINE_HIGH' }, { mode: 'comprehension' });
  assert.strictEqual(r.verdict, 'PROVISIONAL');
  assert.strictEqual(r.agreement, false);
  assert.match(r.note, /capped at PROVISIONAL/);
});
check('procedural cap does not inflate a genuine negative (SH-6679)', () => {
  // A lone SHALLOW opposite a procedural direction stays SHALLOW (cap blocks certification, never inflates).
  assert.strictEqual(syn.reconcile({ verdict: 'NA' }, { verdict: 'SHALLOW' }, { mode: 'comprehension' }).verdict, 'SHALLOW');
  // A lone PROVISIONAL stays PROVISIONAL.
  assert.strictEqual(syn.reconcile({ verdict: 'NA' }, { verdict: 'PROVISIONAL' }, { mode: 'comprehension' }).verdict, 'PROVISIONAL');
});
check('both procedural — no graded signal either way (SH-6679)', () => {
  const r = syn.reconcile({ verdict: 'NA' }, { verdict: 'NA' }, { mode: 'comprehension' });
  assert.strictEqual(r.verdict, 'NA');
  assert.strictEqual(r.agreement, true);
});
check('capAtProvisional caps PASS, keeps negatives', () => {
  assert.strictEqual(syn.capAtProvisional(syn.COMPREHENSION_RANK, 'PASS'), 'PROVISIONAL');
  assert.strictEqual(syn.capAtProvisional(syn.COMPREHENSION_RANK, 'SHALLOW'), 'SHALLOW');
  assert.strictEqual(syn.capAtProvisional(syn.APPLICATION_RANK, 'APPLICABLE'), 'PROVISIONAL');
  assert.strictEqual(syn.capAtProvisional(syn.APPLICATION_RANK, 'NOT_DISCRIMINATED_CEILING'), 'NOT_DISCRIMINATED_CEILING');
  assert.strictEqual(syn.capAtProvisional(syn.APPLICATION_RANK, 'EQUIVALENT_ON_FRONTIER'), 'EQUIVALENT_ON_FRONTIER');
});
check('unknown mode throws', () => {
  assert.throws(() => syn.reconcile({ verdict: 'PASS' }, { verdict: 'PASS' }, { mode: 'bogus' }), /unknown mode/);
});

console.log(`\nResults: ${passed} passed, 0 failed`);
