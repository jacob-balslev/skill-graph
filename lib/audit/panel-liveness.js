'use strict';

// Owned-PID liveness probe: the heartbeat carries the producer's pid, and the
// watcher probes that exact process with signal 0. This must remain a kill -0
// style probe, never a ps/pgrep name scan.
function pidAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return null;
  try { process.kill(pid, 0); return true; }
  catch (e) { return e.code === 'EPERM' ? true : false; }
}

// Pure liveness classifier. A frozen heartbeat plus an alive owned pid is a
// blocked/hung runner; a frozen heartbeat plus a gone pid is terminal dead.
function classifyLiveness({ complete, frozenMs, staleMs, pid, pidAliveResult }) {
  if (complete) return { state: 'complete' };
  if (!(frozenMs >= staleMs)) return { state: 'live' };
  if (Number.isInteger(pid) && pid > 0) {
    if (pidAliveResult === false) return { state: 'dead', pid };
    if (pidAliveResult === true) return { state: 'hung', pid };
  }
  return { state: 'stale' };
}

module.exports = { classifyLiveness, pidAlive };
