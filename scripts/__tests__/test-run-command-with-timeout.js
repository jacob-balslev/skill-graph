'use strict';

// Unit tests for synchronous command execution with timeout reporting.

const assert = require('assert');
const { runCommandWithTimeoutSync } = require('../../lib/audit/run-command-with-timeout');

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log(`  PASS    ${name}`);
}

check('returns stdout for a fast command', () => {
  const r = runCommandWithTimeoutSync({
    cli: process.execPath,
    args: ['-e', 'process.stdout.write("ok")'],
    timeoutMs: 1000,
  });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.stdout, 'ok');
  assert.strictEqual(r.timedOut, false);
});

check('returns a structured timeout for a slow command', () => {
  const started = Date.now();
  const r = runCommandWithTimeoutSync({
    cli: process.execPath,
    args: ['-e', 'setTimeout(() => process.stdout.write("late"), 5000)'],
    timeoutMs: 100,
    killGraceMs: 50,
  });
  const elapsed = Date.now() - started;
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.timedOut, true);
  assert.ok(elapsed < 3000, `timeout helper returned too late (${elapsed}ms)`);
});

console.log(`\n${passed} passed`);
