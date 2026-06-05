'use strict';

// ─── Panel-enrich progress reporter — heartbeat status.json + pinned-header TUI ──
//
// run-panel-enrich.js is pure orchestration; THIS is its visibility layer. It exists so
// the panel loop runs VISIBLY and can NEVER "run stale in the background unnoticed" — the
// recurring failure documented in skill-audit-loop/SKILL_AUDIT_LOOP.md § "Running long
// batches in the background — heartbeat + active Monitor (not blind background tasks)".
//
// Two surfaces, both fed by the same in-memory agent state:
//
//   1. HEARTBEAT status.json — the documented contract that `scripts/watch-audit-batch.sh`
//      consumes (PROGRESS / HANG / STALE / COMPLETE). Schema is a SUPERSET of the reference
//      producer `dist/ab/comprehension-ab-driver.js writeStatus()`:
//        { ts, pid, total, done, failed, running:[{cell,elapsed_s}], complete, agents:[…] }
//      watch-audit-batch.sh reads total/done/failed/running/complete; `agents[]` is the
//      extra per-agent detail the TUI renders (the watcher ignores unknown keys).
//
//   2. PINNED-HEADER TUI — when stdout is a real TTY, a header is pinned at the top via an
//      ANSI scroll region (the proven `scripts/loop/manage-cycle.sh` pattern), one row per
//      panel agent (Opus/GPT MANDATORY, free models ADVISORY) with its live phase/state,
//      while the orchestrator's `[+Ns]` log scrolls below. When NOT a TTY the header is a
//      no-op (heartbeat + stderr only) — identical degradation contract to manage-cycle.sh,
//      so backgrounded/piped runs stay clean and the watcher still sees the heartbeat.
//
// The reporter is the injected `onProgress` sink for run-panel-enrich.js; the orchestrator
// stays pure (it only emits events). All Skill Graph code lives in skill-graph/ per the
// canonical-location rule.

const fs = require('fs');
const path = require('path');

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

function fmtElapsed(ms) {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}m${r ? ` ${r}s` : ''}`;
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
  const HEADER_PAD = 2; // title line + phase line above the per-agent rows

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
      if (a.state === 'proposing' || a.state === 'reviewing' || a.state === 'revising') {
        running.push({ cell: `${a.model}:${a.phase || 'run'}`, elapsed_s });
      }
      agentRows.push({ model: a.model, tier: a.tier, phase: a.phase, state: a.state, elapsed_s });
    }
    return {
      ts: new Date(t).toISOString(),
      pid: process.pid,
      skill,
      phase: phaseLabel,
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
  function headerRows() { return HEADER_PAD + agents.size; }

  function headerInitOnce() {
    if (!tty || headerInit) return;
    let rows = 40;
    try { rows = out.rows || 40; } catch (_) { rows = 40; }
    const h = headerRows();
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
    const t = now();
    const clip = (s) => s.slice(0, Math.max(0, cols - 1));
    out.write('\x1b7');      // save cursor
    out.write('\x1b[?25l');  // hide cursor during redraw
    // Row 1 — title + phase + elapsed.
    const title = `⟳ panel-enrich · ${skill} │ ${phaseLabel} │ ${fmtElapsed(t - t0)}`;
    out.write(`\x1b[1;1H\x1b[2K\x1b[1;36m${clip(title)}\x1b[0m`);
    // Row 2 — mandatory/advisory legend.
    const mand = mandatoryModels.length;
    const adv = advisoryModels.length;
    out.write(`\x1b[2;1H\x1b[2K\x1b[2m${clip(`${mand} MANDATORY (Opus + GPT) · ${adv} advisory (free)`)}\x1b[0m`);
    // One row per agent.
    let r = HEADER_PAD + 1;
    for (const a of agents.values()) {
      const glyph = STATE_GLYPH[a.state] || '·';
      const tierTag = a.tier === 'mandatory' ? 'MANDATORY' : 'advisory';
      const el = a.startedAt && (a.state === 'proposing' || a.state === 'reviewing' || a.state === 'revising')
        ? ` ${fmtElapsed(t - a.startedAt)}` : '';
      const ph = a.phase ? ` ${a.phase}` : '';
      const line = `  ${glyph} ${a.model} [${tierTag}]${ph} ${a.state}${el}`;
      out.write(`\x1b[${r};1H\x1b[2K${clip(line)}`);
      r += 1;
    }
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
  // watch-audit-batch.sh's `--proc` liveness check covers (documented). Between phases the
  // tick keeps `ts` fresh so a genuinely hung runner is still distinguishable from a slow one.
  function startTick(ms = 15000) {
    if (tick) return;
    tick = setInterval(() => { heartbeat(); renderHeader(); }, ms);
    if (tick.unref) tick.unref();
  }

  return { onProgress, heartbeat, startTick, teardown, snapshot: buildStatus };
}

module.exports = { createProgressReporter, fmtElapsed, STATE_GLYPH };
