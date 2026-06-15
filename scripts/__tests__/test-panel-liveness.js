'use strict';

// Unit test: watch-panel.js liveness disambiguation — the heartbeat + owned-PID hybrid that
// tells an ALIVE-but-blocked runner (frozen heartbeat, pid still signalable — in a long
// synchronous dispatch) apart from a CRASHED one (frozen heartbeat, pid gone). A ts-only check
// collapses both into one ambiguous "STALL"; the no-ps-for-liveness rule forbids that. These
// assert the pure classifier + the owned-PID probe (process.kill(pid,0), the Node `kill -0`).

const assert = require('assert');
const { classifyLiveness, pidAlive } = require('../watch-panel');

let passed = 0;
function check(name, fn) { fn(); passed += 1; console.log(`  PASS    ${name}`); }

console.log('1. classifyLiveness — frozen-heartbeat disambiguation');

check('complete short-circuits to "complete" regardless of freshness/pid', () => {
  assert.strictEqual(classifyLiveness({ complete: true, frozenMs: 9e9, staleMs: 1000, pid: 123, pidAliveResult: false }).state, 'complete');
});

check('a fresh heartbeat (frozen < stale) is "live" even with no pid', () => {
  assert.strictEqual(classifyLiveness({ complete: false, frozenMs: 10, staleMs: 1000, pid: undefined, pidAliveResult: null }).state, 'live');
});

check('frozen past --stale + pid ALIVE ⇒ "hung" (blocked, not dead) and carries the pid', () => {
  const r = classifyLiveness({ complete: false, frozenMs: 2000, staleMs: 1000, pid: 4242, pidAliveResult: true });
  assert.strictEqual(r.state, 'hung');
  assert.strictEqual(r.pid, 4242);
});

check('frozen past --stale + pid GONE ⇒ terminal "dead" and carries the pid', () => {
  const r = classifyLiveness({ complete: false, frozenMs: 2000, staleMs: 1000, pid: 4242, pidAliveResult: false });
  assert.strictEqual(r.state, 'dead');
  assert.strictEqual(r.pid, 4242);
});

check('frozen past --stale with NO probeable pid ⇒ ts-only "stale" (back-compat)', () => {
  assert.strictEqual(classifyLiveness({ complete: false, frozenMs: 2000, staleMs: 1000, pid: undefined, pidAliveResult: null }).state, 'stale');
  assert.strictEqual(classifyLiveness({ complete: false, frozenMs: 2000, staleMs: 1000, pid: 0, pidAliveResult: null }).state, 'stale');
});

check('the stale boundary is inclusive (frozenMs === staleMs is already frozen)', () => {
  assert.strictEqual(classifyLiveness({ complete: false, frozenMs: 1000, staleMs: 1000, pid: 1, pidAliveResult: true }).state, 'hung');
  assert.strictEqual(classifyLiveness({ complete: false, frozenMs: 999, staleMs: 1000, pid: 1, pidAliveResult: true }).state, 'live');
});

console.log('2. pidAlive — owned-PID probe (process.kill(pid,0))');

check('our own pid is alive (true)', () => {
  assert.strictEqual(pidAlive(process.pid), true);
});

check('a non-existent pid reads dead (false)', () => {
  // Search downward from a high pid for one with no process; 0x7fffffff is above any live pid on
  // macOS/Linux dev hosts. ESRCH ⇒ false.
  assert.strictEqual(pidAlive(0x7fffffff), false);
});

check('invalid pids (non-int / <= 0) return null (not probeable)', () => {
  assert.strictEqual(pidAlive(undefined), null);
  assert.strictEqual(pidAlive(null), null);
  assert.strictEqual(pidAlive(0), null);
  assert.strictEqual(pidAlive(-1), null);
  assert.strictEqual(pidAlive(3.5), null);
});

console.log(`\n${passed} passed`);
