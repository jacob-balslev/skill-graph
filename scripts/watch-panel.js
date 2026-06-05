#!/usr/bin/env node
'use strict';

// ─── Canonical collected-TUI viewer for the panel-enrich loop ────────────────────
//
// Reads the heartbeat <status-file> written by `lib/audit/run-panel-enrich.js` (via
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
// the heartbeat the runner writes. Terminal states: COMPLETE (status.complete) and STALE
// (heartbeat stopped changing past --stale), so a hung run can never look like a live one.
//
// Usage:
//   node scripts/watch-panel.js <status-file> [--poll SECS] [--stale SECS] [--once]

const fs = require('fs');
const path = require('path');
const { renderCollected } = require('../lib/audit/panel-progress');

function main(argv) {
  const args = argv.slice();
  const statusFile = args.find((a) => !a.startsWith('--'));
  if (!statusFile) {
    process.stderr.write('Usage: node scripts/watch-panel.js <status-file> [--poll SECS] [--stale SECS] [--once]\n');
    process.exit(2);
  }
  const optVal = (name, def) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 && args[i + 1] ? Number(args[i + 1]) : def;
  };
  const pollMs = optVal('poll', 3) * 1000;
  const staleMs = optVal('stale', 600) * 1000; // default 10m — above the longest single dispatch
  const once = args.includes('--once');
  const tty = Boolean(process.stdout.isTTY);
  const absStatus = path.resolve(statusFile);

  let prevFrame = '';
  let lastChange = Date.now();
  let started = false;

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
    const frame = renderCollected(st).join('\n');
    if (tty) {
      process.stdout.write(`\x1b[2J\x1b[H${frame}\n`);
    } else if (frame !== prevFrame) {
      process.stdout.write(`\n${frame}\n`);
    }
    if (frame !== prevFrame) { prevFrame = frame; lastChange = Date.now(); }

    if (st.complete) {
      process.stdout.write(`${tty ? '\n' : ''}COMPLETE ${st.done}/${st.total} done, failed=${st.failed}\n`);
      return true;
    }
    if (Date.now() - lastChange >= staleMs) {
      process.stdout.write(`STALE no heartbeat change for ${Math.round((Date.now() - lastChange) / 1000)}s — check the run\n`);
      lastChange = Date.now();
    }
    return false;
  };

  if (once) { paint(); process.exit(0); }

  const timer = setInterval(() => { if (paint()) { clearInterval(timer); process.exit(0); } }, pollMs);
  if (timer.unref) timer.unref();
  paint();
}

if (require.main === module) main(process.argv.slice(2));

module.exports = { renderCollected };
