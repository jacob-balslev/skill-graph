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
check('FRONTIER_PAIR is [opus, codex-current]', () => {
  assert.deepStrictEqual(mp.FRONTIER_PAIR, ['opus', 'codex-current']);
});
check('otherFrontier swaps the pair', () => {
  assert.strictEqual(mp.otherFrontier('opus'), 'codex-current');
  assert.strictEqual(mp.otherFrontier('codex-current'), 'opus');
});
check('otherFrontier throws for a non-frontier (no silent weak pairing)', () => {
  assert.throws(() => mp.otherFrontier('sonnet'), /not a frontier/);
});

console.log('2. Cross-family certification (both directions certifying)');
check('opus⇄codex-current is cross-family certifying both ways', () => {
  assert.strictEqual(cert.resolveCertificationTier({ certifying: true, generatorFamily: 'opus', graderFamily: 'codex-current' }).tier, 'certifying');
  assert.strictEqual(cert.resolveCertificationTier({ certifying: true, generatorFamily: 'codex-current', graderFamily: 'opus' }).tier, 'certifying');
});
check('same family caps at provisional (self-preference guard)', () => {
  assert.strictEqual(cert.resolveCertificationTier({ certifying: true, generatorFamily: 'opus', graderFamily: 'sonnet' }).tier, 'provisional');
});
check('no certifying assertion => provisional', () => {
  assert.strictEqual(cert.resolveCertificationTier({ generatorFamily: 'opus', graderFamily: 'codex-current' }).tier, 'provisional');
});
check('isCrossFamily true only for different known families', () => {
  assert.strictEqual(cert.isCrossFamily('opus', 'codex-current'), true);
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
check('APPLICABLE only when BOTH agree (PROVISIONAL drags it down)', () => {
  assert.strictEqual(syn.reconcile({ verdict: 'APPLICABLE' }, { verdict: 'PROVISIONAL' }, { mode: 'application' }).verdict, 'PROVISIONAL');
});
check('unknown verdict cannot certify (floor rank)', () => {
  assert.strictEqual(syn.reconcile({ verdict: 'APPLICABLE' }, { verdict: 'WAT' }, { mode: 'application' }).verdict, 'WAT');
});

console.log('4. Conservative synthesis (comprehension) + procedural carve-out');
check('both PASS => PASS', () => {
  assert.strictEqual(syn.reconcile({ verdict: 'PASS' }, { verdict: 'PASS' }, { mode: 'comprehension' }).verdict, 'PASS');
});
check('PASS vs SHALLOW => SHALLOW', () => {
  assert.strictEqual(syn.reconcile({ verdict: 'PASS' }, { verdict: 'SHALLOW' }, { mode: 'comprehension' }).verdict, 'SHALLOW');
});
check('procedural direction defers to graded direction', () => {
  assert.strictEqual(syn.reconcile({ verdict: 'PASS' }, { verdict: 'SKIPPED_BASELINE_HIGH' }, { mode: 'comprehension' }).verdict, 'PASS');
  assert.strictEqual(syn.reconcile({ verdict: 'NA' }, { verdict: 'PROVISIONAL' }, { mode: 'comprehension' }).verdict, 'PROVISIONAL');
});
check('unknown mode throws', () => {
  assert.throws(() => syn.reconcile({ verdict: 'PASS' }, { verdict: 'PASS' }, { mode: 'bogus' }), /unknown mode/);
});

console.log(`\nResults: ${passed} passed, 0 failed`);
