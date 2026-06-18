#!/usr/bin/env node
'use strict';

// Synchronous wrapper around a subprocess with an explicit process-group timeout.
// This exists because spawnSync/execFileSync timeouts can return late when a CLI
// leaves descendants holding stdout/stderr open. The panel runner needs each model
// cell to end with an explicit result, so this helper kills the whole process group.

const { spawn, spawnSync } = require('child_process');
const fs = require('fs');

const DEFAULT_KILL_GRACE_MS = 2000;
const DEFAULT_HELPER_GRACE_MS = 10000;
const DEFAULT_MAX_BUFFER = 32 * 1024 * 1024;
const DEFAULT_HEARTBEAT_THROTTLE_MS = 1000;

function normalizePayload(payload) {
  return {
    cli: payload.cli,
    args: Array.isArray(payload.args) ? payload.args : [],
    cwd: payload.cwd || process.cwd(),
    env: payload.env || process.env,
    timeoutMs: Number(payload.timeoutMs || 0),
    killGraceMs: Number(payload.killGraceMs || DEFAULT_KILL_GRACE_MS),
    maxBuffer: Number(payload.maxBuffer || DEFAULT_MAX_BUFFER),
    // Optional liveness signal. When set, the async --child wrapper writes a small
    // {ts, pid, stdout_bytes, stderr_bytes} JSON to this path each time the spawned CLI
    // emits a chunk (throttled). This is the ONLY way to surface mid-run liveness for a
    // long dispatch: the SYNCHRONOUS caller (runCommandWithTimeoutSync via spawnSync) is
    // blocked for the whole run and cannot tick a heartbeat itself, but the child it spawns
    // IS async and sees each chunk. A watcher (panel-liveness) reads this file's `ts` to tell
    // an alive-but-working dispatch (ts advancing) from a genuinely dead one (ts frozen +
    // owned PID gone). Chunks only flow during the run when the CLI streams — e.g. claude
    // `--output-format stream-json`; a buffered text dispatch ticks only at the end.
    heartbeatFile: payload.heartbeatFile || null,
    heartbeatThrottleMs: Number(payload.heartbeatThrottleMs || DEFAULT_HEARTBEAT_THROTTLE_MS),
  };
}

function killChild(child, signal) {
  if (!child || !child.pid) return;
  try {
    if (process.platform !== 'win32') process.kill(-child.pid, signal);
    else child.kill(signal);
  } catch (_) {
    try { child.kill(signal); } catch (_) { /* best-effort */ }
  }
}

function runChild(payload) {
  const opts = normalizePayload(payload);
  const startedAt = new Date().toISOString();
  const startedHr = process.hrtime.bigint();
  const finishPayload = (fields) => {
    const endedAt = new Date().toISOString();
    return {
      ...fields,
      started_at: startedAt,
      ended_at: endedAt,
      duration_ms: Number((process.hrtime.bigint() - startedHr) / 1_000_000n),
    };
  };
  if (!opts.cli) {
    process.stdout.write(`${JSON.stringify(finishPayload({ ok: false, error: 'missing cli', status: null, signal: null, stdout: '', stderr: '', timedOut: false, exceededBuffer: false }))}\n`);
    return;
  }

  let stdout = '';
  let stderr = '';
  let timedOut = false;
  let exceededBuffer = false;
  let settled = false;

  const child = spawn(opts.cli, opts.args, {
    cwd: opts.cwd,
    env: opts.env,
    detached: process.platform !== 'win32',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  // Liveness heartbeat (see normalizePayload.heartbeatFile). Throttled via the monotonic
  // hrtime clock — Date.now()/Math.random() are banned in audit scripts (they break resume),
  // and new Date() is reserved for the human-readable `ts` only (matching this file's style).
  let lastHeartbeatHr = 0n;
  const heartbeatThrottleNs = BigInt(Math.max(0, opts.heartbeatThrottleMs)) * 1_000_000n;
  const writeHeartbeat = (force) => {
    if (!opts.heartbeatFile) return;
    const nowHr = process.hrtime.bigint();
    if (!force && lastHeartbeatHr !== 0n && (nowHr - lastHeartbeatHr) < heartbeatThrottleNs) return;
    lastHeartbeatHr = nowHr;
    try {
      fs.writeFileSync(opts.heartbeatFile, `${JSON.stringify({
        ts: new Date().toISOString(),
        pid: child.pid || null,
        stdout_bytes: stdout.length,
        stderr_bytes: stderr.length,
      })}\n`);
    } catch (_) { /* best-effort — a missing heartbeat must never break the dispatch */ }
  };
  writeHeartbeat(true); // initial tick: "child spawned, work started"

  const timeout = opts.timeoutMs > 0
    ? setTimeout(() => {
      timedOut = true;
      killChild(child, 'SIGTERM');
      setTimeout(() => killChild(child, 'SIGKILL'), opts.killGraceMs).unref();
    }, opts.timeoutMs)
    : null;
  if (timeout) timeout.unref();

  const terminateFromSignal = (signal) => {
    if (settled) return;
    stderr += `\n[run-command-with-timeout] received ${signal}; terminating process group\n`;
    killChild(child, 'SIGTERM');
    setTimeout(() => killChild(child, 'SIGKILL'), opts.killGraceMs).unref();
  };
  const onSigint = () => terminateFromSignal('SIGINT');
  const onSigterm = () => terminateFromSignal('SIGTERM');
  const onSighup = () => terminateFromSignal('SIGHUP');
  process.once('SIGINT', onSigint);
  process.once('SIGTERM', onSigterm);
  process.once('SIGHUP', onSighup);

  const append = (streamName, chunk) => {
    const text = String(chunk || '');
    if (streamName === 'stdout') stdout += text;
    else stderr += text;
    writeHeartbeat(false); // a chunk arrived → the dispatch is alive and working
    if (stdout.length + stderr.length > opts.maxBuffer && !exceededBuffer) {
      exceededBuffer = true;
      stderr += `\n[run-command-with-timeout] output exceeded ${opts.maxBuffer} bytes; terminating process group\n`;
      killChild(child, 'SIGTERM');
      setTimeout(() => killChild(child, 'SIGKILL'), opts.killGraceMs).unref();
    }
  };

  child.stdout.on('data', (chunk) => append('stdout', chunk));
  child.stderr.on('data', (chunk) => append('stderr', chunk));

  child.on('error', (error) => {
    if (settled) return;
    settled = true;
    if (timeout) clearTimeout(timeout);
    process.removeListener('SIGINT', onSigint);
    process.removeListener('SIGTERM', onSigterm);
    process.removeListener('SIGHUP', onSighup);
    process.stdout.write(`${JSON.stringify(finishPayload({ ok: false, error: error.message, status: null, signal: null, stdout, stderr, timedOut, exceededBuffer }))}\n`);
  });

  child.on('close', (status, signal) => {
    if (settled) return;
    settled = true;
    writeHeartbeat(true); // final tick: "child closed" (ts stops advancing after this)
    if (timeout) clearTimeout(timeout);
    process.removeListener('SIGINT', onSigint);
    process.removeListener('SIGTERM', onSigterm);
    process.removeListener('SIGHUP', onSighup);
    process.stdout.write(`${JSON.stringify(finishPayload({ ok: status === 0 && !timedOut && !exceededBuffer, error: null, status, signal, stdout, stderr, timedOut, exceededBuffer }))}\n`);
  });
}

function runCommandWithTimeoutSync(payload) {
  const opts = normalizePayload(payload);
  const startedAt = new Date().toISOString();
  const startedHr = process.hrtime.bigint();
  const finishPayload = (fields) => {
    const endedAt = new Date().toISOString();
    return {
      ...fields,
      started_at: fields.started_at || startedAt,
      ended_at: fields.ended_at || endedAt,
      duration_ms: fields.duration_ms !== undefined
        ? fields.duration_ms
        : Number((process.hrtime.bigint() - startedHr) / 1_000_000n),
    };
  };
  const helperTimeout = opts.timeoutMs > 0 ? opts.timeoutMs + opts.killGraceMs + DEFAULT_HELPER_GRACE_MS : 0;
  const result = spawnSync(process.execPath, [__filename, '--child'], {
    input: JSON.stringify(opts),
    encoding: 'utf8',
    maxBuffer: opts.maxBuffer + 1024 * 1024,
    timeout: helperTimeout || undefined,
  });

  if (result.error) {
    return finishPayload({
      ok: false,
      error: result.error.message,
      status: result.status,
      signal: result.signal,
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      timedOut: result.error.code === 'ETIMEDOUT',
      exceededBuffer: false,
    });
  }

  try {
    return finishPayload(JSON.parse(String(result.stdout || '').trim()));
  } catch (error) {
    return finishPayload({
      ok: false,
      error: `timeout helper returned invalid JSON: ${error.message}`,
      status: result.status,
      signal: result.signal,
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      timedOut: false,
      exceededBuffer: false,
    });
  }
}

function readStdin() {
  return new Promise((resolve) => {
    let text = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { text += chunk; });
    process.stdin.on('end', () => resolve(text));
  });
}

async function main() {
  if (process.argv[2] !== '--child') return;
  let payload;
  try { payload = JSON.parse(await readStdin() || '{}'); }
  catch (error) {
    process.stdout.write(`${JSON.stringify({ ok: false, error: `invalid payload JSON: ${error.message}`, status: null, signal: null, stdout: '', stderr: '', timedOut: false, exceededBuffer: false })}\n`);
    return;
  }
  runChild(payload);
}

if (require.main === module) {
  main().catch((error) => {
    process.stdout.write(`${JSON.stringify({ ok: false, error: error.message, status: null, signal: null, stdout: '', stderr: '', timedOut: false, exceededBuffer: false })}\n`);
  });
}

module.exports = { runCommandWithTimeoutSync };
