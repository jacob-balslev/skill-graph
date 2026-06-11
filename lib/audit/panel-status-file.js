'use strict';

// ─── In-session panel heartbeat (2026-06-10T) ─────────────────────────────────
//
// The monolithic runner (run-skill-audit-loop.js) emits a heartbeat status.json via
// panel-progress.js — but the IN-SESSION Agent-tool dispatch path (propose-one /
// cross-review-one / revise-one / curate-one / verify-one, each run inside its own
// subagent) had NO heartbeat: a hung CLI inside a cell was invisible until the cell's
// self-timeout, and watch-panel.js had nothing to read. This helper closes that gap:
// every primitive, when given --status-file, upserts its own agents[] entry into ONE
// shared heartbeat file in the same shape panel-progress.js writes — so the canonical
// viewer (scripts/watch-panel.js) and the event watcher (scripts/watch-audit-batch.sh)
// work identically for in-session runs.
//
// Concurrency: cells run as parallel processes, so the update is read-merge-write with
// an atomic tmp+rename. A lost update between two simultaneous writers degrades one
// tick (the next state change rewrites it) — acceptable for a heartbeat; never for
// results (those live in each cell's own result.json, the authoritative record).

const fs = require('fs');
const path = require('path');

/**
 * Upsert one cell's live state into the shared heartbeat status file.
 * Shape matches the panel-progress.js contract:
 *   { ts, pid, skill, phase, total, done, failed, running[], complete, agents[] }.
 *
 * @param {string} statusFile  absolute path to the shared heartbeat JSON.
 * @param {object} cell        { skill, model, tier, phase, state } — state is
 *                             'running' | 'done' | 'failed'.
 */
function updateCellStatus(statusFile, { skill, model, tier, phase, state } = {}) {
  if (!statusFile || !model) return;
  try {
    let status = null;
    try { status = JSON.parse(fs.readFileSync(statusFile, 'utf8')); } catch (_) { status = null; }
    if (!status || typeof status !== 'object') {
      status = { ts: null, pid: process.pid, skill: skill || null, phase: null, total: 0, done: 0, failed: 0, running: [], complete: false, agents: [] };
    }
    if (!Array.isArray(status.agents)) status.agents = [];
    const idx = status.agents.findIndex((a) => a && a.model === model);
    const entry = { model, tier: tier || 'advisory', phase: phase || null, state: state || 'running', t: new Date().toISOString() };
    if (idx >= 0) status.agents[idx] = { ...status.agents[idx], ...entry };
    else status.agents.push(entry);
    status.ts = new Date().toISOString();
    status.skill = status.skill || skill || null;
    status.phase = phase || status.phase;
    status.total = status.agents.length;
    status.done = status.agents.filter((a) => a.state === 'done').length;
    status.failed = status.agents.filter((a) => a.state === 'failed').length;
    status.running = status.agents.filter((a) => a.state === 'running').map((a) => ({ cell: `${a.model}:${a.phase}`, elapsed_s: null }));
    const tmp = `${statusFile}.tmp-${process.pid}`;
    fs.mkdirSync(path.dirname(statusFile), { recursive: true });
    fs.writeFileSync(tmp, `${JSON.stringify(status, null, 2)}\n`);
    fs.renameSync(tmp, statusFile);
  } catch (_) { /* heartbeat is best-effort; results are the authoritative record */ }
}

/**
 * Write a whole-run heartbeat status.json in the SAME shape panel-progress.js emits, for the
 * NON-panel runners (evaluate-skill, batch-eval, the evolve engine) that are not multi-agent
 * cells but still want scripts/watch-panel.js / scripts/watch-audit-batch.sh to observe them
 * (D5). Atomic tmp+rename; best-effort (never crashes the run on a write failure).
 *
 * Shape: { ts, pid, skill, phase, total, done, failed, running[], complete, agents[] } —
 * the watch-audit-batch.sh contract. For a runner that loops over items, pass `agents` as the
 * per-item rows ({ model, tier, phase, state, elapsed_s }) and `total/done/failed` as the
 * running counts; for a single-skill runner one agent row is enough.
 *
 * @param {string} statusFile  absolute path to the heartbeat JSON (no-op when falsy).
 * @param {object} fields      { skill, phase, total, done, failed, complete, agents }.
 */
function writeRunnerHeartbeat(statusFile, { skill, phase, total, done, failed, complete, agents } = {}) {
  if (!statusFile) return;
  try {
    const rows = Array.isArray(agents) ? agents : [];
    const status = {
      ts: new Date().toISOString(),
      pid: process.pid,
      skill: skill || null,
      phase: phase || null,
      total: Number.isFinite(total) ? total : rows.length,
      done: Number.isFinite(done) ? done : rows.filter((a) => a && a.state === 'done').length,
      failed: Number.isFinite(failed) ? failed : rows.filter((a) => a && a.state === 'failed').length,
      running: rows.filter((a) => a && a.state === 'running')
        .map((a) => ({ cell: `${a.model}:${a.phase || 'run'}`, elapsed_s: a.elapsed_s || null })),
      complete: complete === true,
      agents: rows,
    };
    const tmp = `${statusFile}.tmp-${process.pid}`;
    fs.mkdirSync(path.dirname(statusFile), { recursive: true });
    fs.writeFileSync(tmp, `${JSON.stringify(status, null, 2)}\n`);
    fs.renameSync(tmp, statusFile);
  } catch (_) { /* heartbeat is best-effort; results are the authoritative record */ }
}

module.exports = { updateCellStatus, writeRunnerHeartbeat };
