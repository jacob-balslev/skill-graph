'use strict';

// Unit test: SH-6680 — capture codex's resolved model from `codex exec` output.
//
// `codex-current` omits the -m flag, so resolveModelExecutor returns model:null and
// the bidirectional receipt would carry the `latest-alias-unresolved` sentinel (which
// caps the run to PROVISIONAL). codex exec's default output header names the model it
// actually used (`model: gpt-5.5`); we parse it from the real run output so the receipt
// can report the resolved id. This test covers the pure parser + the per-direction
// capture lifecycle (the live shell-out is exercised by the integration pilot).

const assert = require('assert');
const ev = require('../../lib/audit/evaluate-skill');

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log(`  PASS    ${name}`);
}

// A realistic codex exec default-output header (verified shape, 2026-06-03).
const CODEX_HEADER = [
  'Reading additional input from stdin...',
  'OpenAI Codex v0.130.0',
  '--------',
  'workdir: /private/tmp',
  'model: gpt-5.5',
  'provider: openai',
  'approval: never',
  'sandbox: read-only',
  '--------',
  'user',
  'reply with the single word: ok',
  'codex',
  'ok',
].join('\n');

console.log('1. extractCodexModel (pure parser)');
check('parses the model id from a real codex header', () => {
  assert.strictEqual(ev.extractCodexModel(CODEX_HEADER), 'gpt-5.5');
});
check('parses a pinned/dotted/sub-path model id', () => {
  assert.strictEqual(ev.extractCodexModel('model: gpt-5.5-codex\n'), 'gpt-5.5-codex');
  assert.strictEqual(ev.extractCodexModel('--------\nmodel: openai/gpt-5.5\n--------'), 'openai/gpt-5.5');
});
check('returns null when no header model line is present', () => {
  assert.strictEqual(ev.extractCodexModel('just some agent text without a header'), null);
  assert.strictEqual(ev.extractCodexModel(''), null);
  assert.strictEqual(ev.extractCodexModel(null), null);
  assert.strictEqual(ev.extractCodexModel(undefined), null);
});
check('does not match an indented "model:" inside agent prose', () => {
  // A response that mentions "model:" mid-line (not column 0) must not be captured.
  assert.strictEqual(ev.extractCodexModel('the answer is: model: foo is wrong'), null);
  assert.strictEqual(ev.extractCodexModel('  model: not-a-header'), null);
});
check('picks the FIRST (header) model line, not a later one', () => {
  const s = 'model: gpt-5.5\n...\nmodel: something-later\n';
  assert.strictEqual(ev.extractCodexModel(s), 'gpt-5.5');
});

console.log('2. Per-direction capture lifecycle');
check('reset clears, record sets, getter reads', () => {
  ev.resetCodexModelCapture();
  assert.strictEqual(ev.getResolvedCodexModel(), null);
  ev.recordCodexModelFromOutput(CODEX_HEADER);
  assert.strictEqual(ev.getResolvedCodexModel(), 'gpt-5.5');
  // A subsequent output without a header must NOT clobber the captured value.
  ev.recordCodexModelFromOutput('no header here');
  assert.strictEqual(ev.getResolvedCodexModel(), 'gpt-5.5');
  // Reset clears it again (per-direction isolation).
  ev.resetCodexModelCapture();
  assert.strictEqual(ev.getResolvedCodexModel(), null);
});
check('recordCodexModelFromOutput returns the stdout unchanged (passthrough)', () => {
  ev.resetCodexModelCapture();
  assert.strictEqual(ev.recordCodexModelFromOutput(CODEX_HEADER), CODEX_HEADER);
  assert.strictEqual(ev.recordCodexModelFromOutput('x'), 'x');
});

console.log(`\nResults: ${passed} passed, 0 failed`);
