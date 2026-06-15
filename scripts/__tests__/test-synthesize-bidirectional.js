'use strict';

// Unit test: bidirectional eval — shared certification + conservative synthesis.
// Covers lib/audit-shared/{certification,synthesize-bidirectional}.js and the
// model-provider frontier-pair helpers.

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

console.log('2. Certification tiering');
check('legacy cross-family pair is certifying both ways', () => {
  assert.strictEqual(cert.resolveCertificationTier({ certifying: true, generatorFamily: 'opus', graderFamily: 'gpt-5.5' }).tier, 'certifying');
  assert.strictEqual(cert.resolveCertificationTier({ certifying: true, generatorFamily: 'gpt-5.5', graderFamily: 'opus' }).tier, 'certifying');
});
check('same family caps at provisional (self-preference guard)', () => {
  assert.strictEqual(cert.resolveCertificationTier({ certifying: true, generatorFamily: 'opus', graderFamily: 'sonnet' }).tier, 'provisional');
});
check('representative-generator plus frontier judge is certifying per direction', () => {
  assert.strictEqual(cert.resolveCertificationTier({ certifying: true, generatorFamily: 'representative-generator', graderFamily: 'opus' }).tier, 'certifying');
  assert.strictEqual(cert.resolveCertificationTier({ certifying: true, generatorFamily: 'representative-generator', graderFamily: 'gpt-5.5' }).tier, 'certifying');
});
check('no certifying assertion => provisional', () => {
  assert.strictEqual(cert.resolveCertificationTier({ generatorFamily: 'opus', graderFamily: 'gpt-5.5' }).tier, 'provisional');
});
check('isCrossFamily true only for different known families', () => {
  assert.strictEqual(cert.isCrossFamily('opus', 'gpt-5.5'), true);
  assert.strictEqual(cert.isCrossFamily('opus', 'sonnet'), false);
  assert.strictEqual(cert.isCrossFamily('opus', 'mystery'), false);
});

console.log('3. Unknown-verdict normalization + unknown-mode rejection');
check('unknown verdict is normalized to UNVERIFIED — never surfaced as the synthesized verdict (SH-6678)', () => {
  const r = syn.reconcile({ verdict: 'PASS' }, { verdict: 'WAT' }, { mode: 'comprehension' });
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
  assert.strictEqual(syn.normalizeKnown(syn.COMPREHENSION_RANK, 'PASS'), 'PASS');
  assert.strictEqual(syn.normalizeKnown(syn.COMPREHENSION_RANK, 'WAT'), 'UNVERIFIED');
});
check("mode:'application' is rejected (only comprehension is reconcilable)", () => {
  assert.throws(() => syn.reconcile({ verdict: 'PASS' }, { verdict: 'PASS' }, { mode: 'application' }), /unknown mode/);
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
  assert.strictEqual(syn.capAtProvisional(syn.COMPREHENSION_RANK, 'REDUNDANT'), 'REDUNDANT');
  assert.strictEqual(syn.capAtProvisional(syn.COMPREHENSION_RANK, 'PROVISIONAL'), 'PROVISIONAL');
});
check('unknown mode throws', () => {
  assert.throws(() => syn.reconcile({ verdict: 'PASS' }, { verdict: 'PASS' }, { mode: 'bogus' }), /unknown mode/);
});

console.log(`\nResults: ${passed} passed, 0 failed`);
