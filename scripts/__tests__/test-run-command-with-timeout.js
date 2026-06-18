'use strict';

// Unit tests for synchronous command execution with timeout reporting.

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
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

check('writes a liveness heartbeat as the child streams chunks', () => {
  const hb = path.join(os.tmpdir(), `hb-test-${process.pid}-${passed}.json`);
  // child emits 3 chunks ~150ms apart then exits 0 — a streaming dispatch
  const r = runCommandWithTimeoutSync({
    cli: process.execPath,
    args: ['-e', 'let n=0;const t=setInterval(()=>{process.stdout.write("chunk"+n+"\\n");if(++n>=3)clearInterval(t);},150);setTimeout(()=>process.exit(0),600);'],
    timeoutMs: 10000,
    heartbeatFile: hb,
    heartbeatThrottleMs: 10,
  });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.stdout, 'chunk0\nchunk1\nchunk2\n');
  const beat = JSON.parse(fs.readFileSync(hb, 'utf8'));
  assert.ok(beat.ts, 'heartbeat has a ts');
  assert.ok(beat.pid, 'heartbeat has the child pid');
  assert.ok(beat.stdout_bytes > 0, 'heartbeat recorded streamed bytes');
  fs.unlinkSync(hb);
});

check('omitting heartbeatFile is a no-op (backward compatible)', () => {
  const r = runCommandWithTimeoutSync({
    cli: process.execPath,
    args: ['-e', 'process.stdout.write("ok")'],
    timeoutMs: 1000,
  });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.stdout, 'ok');
});

console.log(`\n${passed} passed`);
