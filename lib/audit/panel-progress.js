'use strict';

// ─── Panel-enrich progress reporter — heartbeat status.json + collected TUI ──────
//
// run-panel-enrich.js is pure orchestration; THIS is its CANONICAL, version-controlled
// visibility layer (in skill-graph/, never harness improvisation). It exists so the panel
// loop runs VISIBLY as a COLLECTED multi-agent view — every agent (Opus/GPT MANDATORY,
// free advisory) shown together with its live phase/state — and can NEVER "run stale in
// the background unnoticed" (the failure documented in SKILL_AUDIT_LOOP.md § "Running long
// batches in the background — heartbeat + active Monitor").
//
// Three surfaces, ONE rendering (`renderCollected`), so the collected view is identical
// everywhere and lives in one place:
//
//   1. HEARTBEAT status.json — the `scripts/watch-audit-batch.sh` contract, a SUPERSET of
//      the reference producer `dist/ab/comprehension-ab-driver.js writeStatus()`:
//        { ts, pid, skill, phase, elapsed_s, total, done, failed, running:[{cell,elapsed_s}],
//          complete, agents:[{model,tier,phase,state,elapsed_s}] }
//      watch-audit-batch.sh reads total/done/failed/running/complete; `agents[]` + the
//      collected renderer are what the viewer (scripts/watch-panel.js) paints.
//   2. PINNED-HEADER TUI (TTY) — `renderCollected()` painted at the top via an ANSI scroll
//      region (the proven `scripts/loop/manage-cycle.sh` pattern); the [+Ns] log scrolls
//      below. No-op when stdout is not a TTY (heartbeat only) — same degradation as
//      manage-cycle.sh, so piped/background runs stay clean and the watcher still works.
//   3. VIEWER — `scripts/watch-panel.js` reads the heartbeat and renders `renderCollected()`
//      live (TTY) or as a collected block per change (piped / in-session). Same renderer.
//
// The reporter is the injected `onProgress` sink for run-panel-enrich.js; the orchestrator
// stays pure (it only emits events).

const fs = require('fs');
const path = require('path');
// Human-facing output names models by full display name (Opus 4.8, GPT-5.5, Gemini 3.1 Pro,
// …), never the bare dispatch alias — per AGENTS.md § Model Identity Discipline. resolveDisplayName
// is pure (a map lookup), so renderCollected() stays I/O-free.
const { resolveDisplayName } = require('../audit-shared/model-provider');

// Per-agent lifecycle states (drive the row glyph + label).
const STATE_GLYPH = {
  queued: '◦',
  proposing: '⏳',
  proposed: '✓',
  reviewing: '⏳',
  revising: '⏳',
  revised: '✓',
  done: '✓',
  failed: '✗',
  skipped: '–',
};

const ACTIVE_STATES = new Set(['proposing', 'reviewing', 'revising']);

function fmtElapsed(ms) {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}m${r ? ` ${r}s` : ''}`;
}

/**
 * THE canonical collected-view renderer. Takes a heartbeat status snapshot (the shape
 * `buildStatus()` writes / the viewer reads from disk) and returns the collected multi-agent
 * view as an array of plain-text lines: a summary header + one tree row per agent. Pure
 * (no I/O, no ANSI) so it can paint a TTY header, a piped block, or a viewer frame
 * identically. This is the single source of truth for what the collected TUI looks like.
 *
 * @param {object} status  heartbeat status object ({skill,phase,elapsed_s,done,total,failed,agents[]}).
 * @returns {string[]}
 */
function renderCollected(status) {
  const s = status || {};
  const agents = Array.isArray(s.agents) ? s.agents : [];
  const done = s.done || 0;
  const total = s.total != null ? s.total : agents.length;
  const failed = s.failed || 0;
  const mand = agents.filter((a) => a.tier === 'mandatory').length;
  const adv = agents.length - mand;
  const lines = [];
  lines.push(
    `⟳ Skill Audit Loop · ${s.skill || '?'} │ ${s.phase || 'starting'} │ ${done}/${total} done`
    + (failed ? ` · ${failed} failed` : '')
    + (s.elapsed_s != null ? ` │ ${fmtElapsed(s.elapsed_s * 1000)}` : '')
    + (s.complete ? ' │ DONE' : ''),
  );
  lines.push(`${mand} MANDATORY (Opus + GPT) · ${adv} advisory (free)`);
  agents.forEach((a, i) => {
    const branch = i === agents.length - 1 ? '└' : '├';
    const glyph = STATE_GLYPH[a.state] || '·';
    const tier = a.tier === 'mandatory' ? 'MANDATORY' : 'advisory';
    const ph = a.phase ? ` ${a.phase}` : '';
    const el = (a.elapsed_s && ACTIVE_STATES.has(a.state)) ? ` ${fmtElapsed(a.elapsed_s * 1000)}` : '';
    lines.push(`${branch} ${glyph} ${resolveDisplayName(a.model)} [${tier}]${ph} · ${a.state}${el}`);
  });
  return lines;
}

/**
 * Build a progress reporter for one panel-enrich run.
 *
 * @param {object}   opts
 * @param {string}   opts.skill
 * @param {string[]} opts.mandatoryModels   the two frontier aliases (MANDATORY).
 * @param {string[]} opts.advisoryModels    advisory aliases (best-effort).
 * @param {string}   [opts.statusFile]      heartbeat path; if omitted, no heartbeat is written.
 * @param {boolean}  [opts.tty]             render the pinned header (default: process.stdout.isTTY).
 * @param {Function} [opts.now]             clock injection for tests (() => ms).
 * @param {NodeJS.WriteStream} [opts.out]   TTY target (default process.stdout).
 * @returns {{ onProgress:Function, heartbeat:Function, startTick:Function, teardown:Function, snapshot:Function }}
 */
function createProgressReporter(opts = {}) {
  const {
    skill,
    mandatoryModels = [],
    advisoryModels = [],
    statusFile = null,
    now = () => Date.now(),
    out = process.stdout,
  } = opts;
  const tty = opts.tty === undefined ? Boolean(out && out.isTTY) : Boolean(opts.tty);

  const t0 = now();
  // Ordered agent roster: mandatory rows first, then advisory.
  const agents = new Map();
  for (const m of mandatoryModels) agents.set(m, { model: m, tier: 'mandatory', phase: null, state: 'queued', startedAt: null });
  for (const m of advisoryModels) agents.set(m, { model: m, tier: 'advisory', phase: null, state: 'queued', startedAt: null });

  let phaseLabel = 'starting';
  let complete = false;
  let tick = null;
  let headerInit = false;
  const HEADER_ROWS = () => 2 + agents.size; // renderCollected: 2 summary lines + 1 per agent

  // ── heartbeat status.json (the documented watch-audit-batch.sh contract) ──
  function buildStatus() {
    const t = now();
    const running = [];
    const agentRows = [];
    let done = 0;
    let failed = 0;
    for (const a of agents.values()) {
      const elapsed_s = a.startedAt ? Math.round((t - a.startedAt) / 1000) : 0;
      if (a.state === 'proposed' || a.state === 'revised' || a.state === 'done') done += 1;
      if (a.state === 'failed') failed += 1;
      if (ACTIVE_STATES.has(a.state)) running.push({ cell: `${a.model}:${a.phase || 'run'}`, elapsed_s });
      agentRows.push({ model: a.model, tier: a.tier, phase: a.phase, state: a.state, elapsed_s });
    }
    return {
      ts: new Date(t).toISOString(),
      pid: process.pid,
      skill,
      phase: phaseLabel,
      elapsed_s: Math.round((t - t0) / 1000),
      total: agents.size,
      done,
      failed,
      running,
      complete,
      agents: agentRows,
    };
  }

  function heartbeat() {
    if (!statusFile) return;
    try {
      fs.mkdirSync(path.dirname(statusFile), { recursive: true });
      fs.writeFileSync(statusFile, `${JSON.stringify(buildStatus(), null, 2)}\n`);
    } catch (_) { /* heartbeat is best-effort; never crash the run on a status-write failure */ }
  }

  // ── pinned-header TUI (manage-cycle.sh scroll-region pattern; TTY-only) ──
  function headerInitOnce() {
    if (!tty || headerInit) return;
    let rows = 40;
    try { rows = out.rows || 40; } catch (_) { rows = 40; }
    const h = HEADER_ROWS();
    out.write('\x1b[2J'); // clear screen
    out.write(`\x1b[${h + 1};${rows}r`); // scroll region BELOW the header
    out.write(`\x1b[${h + 1};1H`); // park cursor inside the scroll region
    headerInit = true;
  }

  function renderHeader() {
    if (!tty) return;
    headerInitOnce();
    let cols = 80;
    try { cols = out.cols || 80; } catch (_) { cols = 80; }
    const clip = (s) => s.slice(0, Math.max(0, cols - 1));
    const lines = renderCollected(buildStatus());
    out.write('\x1b7');      // save cursor
    out.write('\x1b[?25l');  // hide cursor during redraw
    lines.forEach((ln, idx) => {
      const color = idx === 0 ? '\x1b[1;36m' : idx === 1 ? '\x1b[2m' : '';
      out.write(`\x1b[${idx + 1};1H\x1b[2K${color}${clip(ln)}\x1b[0m`);
    });
    out.write('\x1b[?25h'); // show cursor
    out.write('\x1b8');     // restore cursor (back into the scroll region)
  }

  function teardown() {
    complete = true;
    heartbeat();
    if (tick) { clearInterval(tick); tick = null; }
    if (tty && headerInit) {
      out.write('\x1b[r');    // reset scroll region to the full screen
      out.write('\x1b[?25h'); // ensure cursor visible
      out.write('\n');
    }
  }

  // ── the event sink injected into the orchestrator ──
  // evt forms:
  //   { kind:'phase', phase:'<label>' }                          — phase transition (curate/eval/apply/etc.)
  //   { kind:'agent', model, phase:'propose'|'review'|'revise', state:'start'|'done'|'fail'|'skip' }
  function onProgress(evt) {
    if (!evt) return;
    if (evt.kind === 'phase') {
      if (evt.phase) phaseLabel = evt.phase;
    } else if (evt.kind === 'agent' && evt.model) {
      let a = agents.get(evt.model);
      if (!a) { a = { model: evt.model, tier: evt.tier || 'advisory', phase: null, state: 'queued', startedAt: null }; agents.set(evt.model, a); }
      a.phase = evt.phase || a.phase;
      if (evt.state === 'start') {
        a.startedAt = now();
        a.state = evt.phase === 'propose' ? 'proposing' : evt.phase === 'review' ? 'reviewing' : evt.phase === 'revise' ? 'revising' : 'proposing';
      } else if (evt.state === 'done') {
        a.state = evt.phase === 'propose' ? 'proposed' : evt.phase === 'revise' ? 'revised' : 'done';
        a.startedAt = null;
      } else if (evt.state === 'fail') {
        a.state = 'failed';
        a.startedAt = null;
      } else if (evt.state === 'skip') {
        a.state = 'skipped';
        a.startedAt = null;
      }
    }
    heartbeat();
    renderHeader();
  }

  // Periodic heartbeat tick. NOTE: during a synchronous blocking dispatch the event loop is
  // frozen, so this interval cannot fire mid-call — that gap is exactly what
  // watch-audit-batch.sh's `--proc` liveness check (and the viewer's stale detection) cover.
  function startTick(ms = 15000) {
    if (tick) return;
    tick = setInterval(() => { heartbeat(); renderHeader(); }, ms);
    if (tick.unref) tick.unref();
  }

  return { onProgress, heartbeat, startTick, teardown, snapshot: buildStatus };
}

module.exports = { createProgressReporter, renderCollected, fmtElapsed, STATE_GLYPH };
