#!/usr/bin/env node
'use strict';

// ─── Canonical collected-TUI viewer for the skill-audit-loop loop ────────────────────
//
// Reads the heartbeat <status-file> written by `lib/audit/run-skill-audit-loop.js` (via
// `lib/audit/panel-progress.js`) and renders the COLLECTED multi-agent view — every panel
// agent (Opus/GPT MANDATORY, free advisory) with its live phase/state — using the SAME
// canonical renderer the live TTY header uses (`renderCollected`). One rendering, one
// source of truth, version-controlled in skill-graph/.
//
// Two modes (auto-detected), so the collected view is watchable everywhere:
//   • TTY      → full-screen live refresh (the collected TUI).
//   • piped    → print a collected block whenever the view changes (watchable in-session,
//                e.g. as a Claude Code background task / Monitor, without ANSI cursor magic).
//
// It is an OBSERVER only — it never claims, dispatches, or mutates anything; it just reads
// the heartbeat the runner writes. Terminal/flag states: COMPLETE (status.complete), STALL
// (heartbeat `ts` frozen past --stale → runner hung/dead), and SLOW (an active agent's live
// elapsed exceeds --slow), so a hung run can never look like a live one.
//
// LIVE TIMER: the runner's event loop is FROZEN during a synchronous model dispatch, so its
// heartbeat (and per-agent elapsed) cannot tick mid-call. The viewer therefore EXTRAPOLATES
// elapsed from `now - status.ts` (passed to renderCollected as `nowMs`), so the header + any
// active row visibly count up even while the runner is blocked. TTY repaints smoothly each
// poll; piped/Monitor mode emits a block only on a STRUCTURAL change (phase/state/reason) plus
// a periodic liveness tick — never per-second (which would trip the Monitor's flood guard).
//
// Usage:
//   node scripts/watch-panel.js <status-file> [--poll SECS] [--stale SECS] [--slow SECS] [--tick SECS] [--once]

const fs = require('fs');
const path = require('path');
const { renderCollected, fmtElapsed } = require('../lib/audit/panel-progress');

const ACTIVE = new Set(['proposing', 'reviewing', 'revising']);

function main(argv) {
  const args = argv.slice();
  const statusFile = args.find((a) => !a.startsWith('--'));
  if (!statusFile) {
    process.stderr.write('Usage: node scripts/watch-panel.js <status-file> [--poll SECS] [--stale SECS] [--slow SECS] [--tick SECS] [--once]\n');
    process.exit(2);
  }
  const optVal = (name, def) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 && args[i + 1] ? Number(args[i + 1]) : def;
  };
  const pollMs = optVal('poll', 1) * 1000;   // 1s → smooth live timer on a TTY
  const staleMs = optVal('stale', 900) * 1000; // ts frozen > 15m ⇒ hang (above the longest dispatch)
  const slowMs = optVal('slow', 600) * 1000;   // active agent > 10m ⇒ SLOW flag
  const tickMs = optVal('tick', 20) * 1000;    // piped liveness cadence (no per-second spam)
  const once = args.includes('--once');
  const tty = Boolean(process.stdout.isTTY);
  const absStatus = path.resolve(statusFile);

  let prevStructural = '';
  let started = false;
  let lastTs = null;
  let lastTsWall = Date.now();
  let staleFlagged = false;
  let lastTick = Date.now();
  const slowFlagged = new Set(); // `${model}:${phase}` episodes already flagged

  const read = () => {
    try { return JSON.parse(fs.readFileSync(absStatus, 'utf8')); } catch (_) { return null; }
  };

  const paint = () => {
    const st = read();
    if (!st) {
      if (!started && !tty) process.stdout.write(`(waiting for heartbeat at ${absStatus})\n`);
      return false;
    }
    started = true;
    const now = Date.now();
    const tsMs = st.ts ? Date.parse(st.ts) : NaN;
    // Structural frame = snapshot (no live timer) → only changes on a real phase/state/reason
    // transition; used to decide when the piped surface should emit a fresh block.
    const structural = renderCollected(st).join('\n');
    // Live frame = with the extrapolated counting timer (TTY + on-change blocks).
    const live = renderCollected(st, { nowMs: now }).join('\n');

    if (tty) {
      process.stdout.write(`\x1b[2J\x1b[H${live}\n`);
    } else if (structural !== prevStructural) {
      process.stdout.write(`\n${live}\n`);
      lastTick = now;
    } else if (!st.complete && now - lastTick >= tickMs) {
      // periodic liveness so the timer is visibly advancing without per-second spam
      const activeBits = (st.agents || []).filter((a) => ACTIVE.has(a.state)).map((a) => {
        const el = (a.elapsed_s || 0) * 1000 + (Number.isNaN(tsMs) ? 0 : Math.max(0, now - tsMs));
        return `${a.model} ${a.phase || ''} ${fmtElapsed(el)}`;
      });
      const gEl = (st.elapsed_s != null ? st.elapsed_s * 1000 : 0) + (Number.isNaN(tsMs) ? 0 : Math.max(0, now - tsMs));
      process.stdout.write(`  ⟳ ${st.skill} · ${st.phase} · ${fmtElapsed(gEl)}${activeBits.length ? ` · active: ${activeBits.join(', ')}` : ''}\n`);
      lastTick = now;
    }
    if (structural !== prevStructural) prevStructural = structural;

    // Stall: the runner stopped writing heartbeats (ts frozen). A blocking dispatch freezes ts
    // normally, so only flag past --stale, and only once per episode.
    if (st.ts !== lastTs) { lastTs = st.ts; lastTsWall = now; staleFlagged = false; }
    else if (!st.complete && now - lastTsWall >= staleMs && !staleFlagged) {
      process.stdout.write(`STALL: no heartbeat for ${Math.round((now - lastTsWall) / 1000)}s — runner frozen/dead, check it\n`);
      staleFlagged = true;
    }

    // SLOW: an active agent has been running longer than --slow (one flag per agent-episode).
    for (const a of (st.agents || [])) {
      const key = `${a.model}:${a.phase}`;
      if (ACTIVE.has(a.state)) {
        const el = (a.elapsed_s || 0) * 1000 + (Number.isNaN(tsMs) ? 0 : Math.max(0, now - tsMs));
        if (el >= slowMs && !slowFlagged.has(key)) {
          process.stdout.write(`SLOW: ${a.model} in ${a.phase} for ${fmtElapsed(el)} — watch for a stall\n`);
          slowFlagged.add(key);
        }
      } else {
        slowFlagged.delete(key); // episode ended; allow a future SLOW for the same cell
      }
    }

    if (st.complete) {
      process.stdout.write(`${tty ? '\n' : ''}COMPLETE ${st.done}/${st.total} done, failed=${st.failed}\n`);
      return true;
    }
    return false;
  };

  if (once) { paint(); process.exit(0); }

  // NOTE: do NOT unref() this interval — it is the only handle keeping the viewer alive;
  // unref'ing it makes node exit immediately after the first paint. The viewer runs until
  // COMPLETE (paint() returns true) or the harness/Monitor times out.
  const timer = setInterval(() => { if (paint()) { clearInterval(timer); process.exit(0); } }, pollMs);
  paint();
}

if (require.main === module) main(process.argv.slice(2));

module.exports = { renderCollected };
