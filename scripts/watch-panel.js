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
// The default watch mode is an OBSERVER only — it never claims, dispatches, or mutates
// anything; it just reads the heartbeat the runner writes. The explicit --review-findings
// mode still leaves the runner heartbeat untouched, but writes a separate review-state JSON
// file for human approve/disapprove decisions. Terminal/flag states: COMPLETE
// (status.complete), STALL (heartbeat `ts` frozen past --stale), DEAD (frozen AND the owned
// pid is gone — crashed/killed mid-run), and SLOW (an active agent's live elapsed exceeds
// --slow), so a hung run can never look like a live one.
//
// SLOW-vs-DEAD DISAMBIGUATION (the heartbeat + owned-PID liveness hybrid): when the heartbeat
// freezes past --stale, a ts-only check cannot tell an alive-but-blocked runner (in a long
// synchronous model dispatch) from a crashed one. So we probe the heartbeat's `pid` with
// `process.kill(pid, 0)` (the Node `kill -0` — the reliable, process-bound liveness signal, NOT
// a `ps`/`pgrep` name-scan, per .claude/rules/no-ps-for-liveness.md). Frozen + pid ALIVE ⇒ STALL
// "blocked, not dead" (recoverable); frozen + pid GONE ⇒ terminal DEAD (exit 4 — re-probed every
// tick so a hung→dead transition is caught). No new flags: `pid` comes from the heartbeat.
//
// --fail-on-stall turns a STALL into a TERMINAL FAILURE: instead of printing STALL and
// spinning forever (waiting for a heartbeat that will never come), the viewer prints a
// FAILED line and exits non-zero (3). Pass it on the Monitor/FALLBACK path so a silent
// hang surfaces as a loud, terminal failure the orchestrator acts on — the embedded-systems
// supervisor/watchdog pattern (a heartbeat plus a timeout ACTION, not just a log line).
//
// LIVE TIMER: the runner's event loop is FROZEN during a synchronous model dispatch, so its
// heartbeat (and per-agent elapsed) cannot tick mid-call. The viewer therefore EXTRAPOLATES
// elapsed from `now - status.ts` (passed to renderCollected as `nowMs`), so the header + any
// active row visibly count up even while the runner is blocked. TTY repaints smoothly each
// poll; piped/Monitor mode emits a block ONLY on a STRUCTURAL change (phase/state/reason) plus
// the terminal STALL/SLOW/COMPLETE signals. The periodic liveness tick is OFF by default —
// every piped line is a Monitor chat message, so a per-N-second timer line floods it. A human
// tailing in a plain terminal can opt back in with --tick N (N>0).
//
// Usage:
//   node scripts/watch-panel.js <status-file> [--poll SECS] [--stale SECS] [--slow SECS] [--tick SECS|0=off (default)] [--once] [--fail-on-stall]
//   node scripts/watch-panel.js <status-file> --review-findings [--findings-file JSON] [--review-file JSON] [--views-file JSON] [--filter TEXT] [--skill TEXT] [--model TEXT] [--verdict TEXT] [--group-by none|skill|model|verdict|decision] [--sort disposition-priority|original|decision-status] [--select N]
//
// Findings review is per-finding by design: every finding is approved/disapproved individually
// (keys a/d/u, mouse-click buttons, or a per-finding note via c). There is deliberately NO
// bulk-approve — the review stays loudly INCOMPLETE until every finding is decided one at a time.

const fs = require('fs');
const path = require('path');
const { renderCollected, fmtElapsed } = require('../lib/audit/panel-progress');
const {
  extractFindings,
  loadFindingsFile,
  mergeFindings,
  filterFindings,
  sortFindings,
  loadReviewState,
  writeReviewState,
  applyFindingDecision,
  decisionFor,
  nextPendingIndex,
  loadReviewViews,
  renderFindingsReview,
  normalizeGroupBy,
  normalizeSort,
  GROUP_BY,
  SORT_BY,
} = require('../lib/audit/finding-review');

const ACTIVE = new Set(['proposing', 'reviewing', 'revising']);
const VALUE_OPTIONS = new Set([
  'poll',
  'stale',
  'slow',
  'tick',
  'review-file',
  'findings-file',
  'views-file',
  'filter',
  'skill',
  'model',
  'verdict',
  'group-by',
  'sort',
  'select',
]);

function usage() {
  return 'Usage: node scripts/watch-panel.js <status-file> [--poll SECS] [--stale SECS] [--slow SECS] [--tick SECS|0=off (default)] [--once] [--fail-on-stall] [--review-findings [--findings-file JSON] [--review-file JSON] [--views-file JSON] [--filter TEXT] [--skill TEXT] [--model TEXT] [--verdict TEXT] [--group-by none|skill|model|verdict|decision] [--sort disposition-priority|original|decision-status] [--select N]]\n';
}

function parseArgs(argv) {
  const flags = new Set();
  const values = {};
  const positionals = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      positionals.push(arg);
      continue;
    }
    const eq = arg.indexOf('=');
    if (eq > 2) {
      const name = arg.slice(2, eq);
      flags.add(name);
      values[name] = arg.slice(eq + 1);
      continue;
    }
    const name = arg.slice(2);
    flags.add(name);
    if (VALUE_OPTIONS.has(name)) {
      values[name] = argv[i + 1];
      i += 1;
    }
  }
  return { flags, values, positionals };
}

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (_) { return null; }
}

// ─── Owned-PID liveness probe (the reliable signal — NOT a name-scan) ──────────────
//
// The heartbeat carries the producer's `pid` (panel-heartbeat.schema.json: "for liveness
// checks by the watch wrappers"). We probe THAT specific pid with signal 0 — the Node
// equivalent of `kill -0 <pid>` — which is true iff that exact process exists and is
// signalable. This is the liveness signal `.claude/rules/no-ps-for-liveness.md` mandates:
// never infer liveness from a `ps`/`pgrep` NAME-SCAN (a name-scan false-negatives under
// sandbox/namespace isolation, so "not found" never means "dead").
//
// Returns: true (alive — signalable, OR EPERM = alive but owned by another user/namespace),
//          false (ESRCH = no such process → dead), null (no probeable pid).
//
// PID-reuse caveat (gaborcsardi 2024): across a long wait the OS can recycle a dead pid to a
// new process, so a confirmed-dead runner could read "alive" again. Here that is benign — the
// heartbeat `ts` freshness is the trust anchor; the pid probe only DISAMBIGUATES a frozen
// heartbeat (alive-blocked vs crashed). A false "alive" degrades to the old ts-only STALL
// behavior, never to a dangerous false-healthy. Start-time fingerprinting would close it but
// is not worth the cross-platform `ps` parsing for a 45-minute disambiguation window.
function pidAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return null;
  try { process.kill(pid, 0); return true; }
  catch (e) { return e.code === 'EPERM' ? true : false; }
}

// Pure liveness classifier: given heartbeat freshness + the owned-PID probe result, decide which
// state the watcher is in. Distinguishing 'hung' (heartbeat frozen but the runner pid is ALIVE —
// blocked in a long synchronous model dispatch, will resume) from 'dead' (frozen AND the pid is
// GONE — crashed/killed without flushing its terminal heartbeat) is the whole point: a ts-only
// check or a name-scan collapses both into one ambiguous "STALL", which is the slow-vs-dead
// ambiguity the no-ps-for-liveness rule exists to kill. 'stale' = frozen with no pid to probe
// (back-compat, ts-only). 'live'/'complete' are the non-frozen states.
function classifyLiveness({ complete, frozenMs, staleMs, pid, pidAliveResult }) {
  if (complete) return { state: 'complete' };
  if (!(frozenMs >= staleMs)) return { state: 'live' };
  if (Number.isInteger(pid) && pid > 0) {
    if (pidAliveResult === false) return { state: 'dead', pid };
    if (pidAliveResult === true) return { state: 'hung', pid };
  }
  return { state: 'stale' };
}

function renderReviewFrame({ absStatus, absFindingsFile, reviewState, selectedIndex, filters, groupBy, sortBy, viewName, reviewFile }) {
  const status = readJson(absStatus) || {};
  // The heartbeat carries findings[] inline (the runner emits them live during a run); the optional
  // --findings-file is read by loadFindingsFile, which sniffs JSON (merge-ledger.json) vs markdown
  // (single-model merge-ledger.md) so both ledger formats are viewer-readable.
  const fileFindings = absFindingsFile ? loadFindingsFile(absFindingsFile) : [];
  const allFindings = mergeFindings(
    extractFindings(status),
    fileFindings,
  );
  // Filter, then sort. The sorted array is the single ordered list everything downstream keys off —
  // the rendered table, the selection index, the mouse hit-targets, and next/prev-pending navigation.
  const visibleFindings = sortFindings(filterFindings(allFindings, filters), sortBy, reviewState);
  const nextSelected = visibleFindings.length
    ? Math.min(Math.max(0, selectedIndex), visibleFindings.length - 1)
    : 0;
  const frame = renderFindingsReview(visibleFindings, reviewState, {
    selectedIndex: nextSelected,
    width: process.stdout.columns || 100,
    totalFindings: allFindings.length,
    filters,
    groupBy,
    sort: sortBy,
    viewName,
    reviewFile,
  });
  return { frame, visibleFindings, selectedIndex: nextSelected };
}

function runFindingsReview({
  absStatus,
  absFindingsFile,
  reviewFile,
  filters,
  groupBy: initialGroupBy,
  sortBy: initialSortBy,
  views,
  pollMs,
  once,
  selectedIndex: initialSelectedIndex,
}) {
  const source = { status_file: absStatus };
  if (absFindingsFile) source.findings_file = absFindingsFile;
  let reviewState = loadReviewState(reviewFile, source);
  reviewState.source = { ...source, ...(reviewState.source || {}) };
  let selectedIndex = Math.max(0, initialSelectedIndex || 0);
  let groupBy = normalizeGroupBy(initialGroupBy);
  let sortBy = normalizeSort(initialSortBy);
  const savedViews = Array.isArray(views) ? views : [];
  let viewIndex = -1;        // -1 = no saved view active yet (CLI filters/sort in effect)
  let viewName = null;
  let activeFilters = { ...(filters || {}) };
  let inputMode = false;     // true while typing a per-finding note (the `c` key)
  let inputBuffer = '';
  let current = null;
  const interactive = Boolean(process.stdout.isTTY && process.stdin.isTTY) && !once;

  const paint = () => {
    current = renderReviewFrame({
      absStatus,
      absFindingsFile,
      reviewState,
      selectedIndex,
      filters: activeFilters,
      groupBy,
      sortBy,
      viewName,
      reviewFile,
    });
    selectedIndex = current.selectedIndex;
    let body = current.frame.lines.join('\n');
    if (inputMode) {
      const finding = current.visibleFindings[selectedIndex];
      const label = finding ? `#${selectedIndex + 1} (${finding.id})` : '(no finding)';
      body += `\n\nNote for ${label} — type, Enter to save, Esc to cancel, Backspace to edit:\n> ${inputBuffer}█`;
    }
    if (interactive) process.stdout.write(`\x1b[2J\x1b[H${body}\n`);
    else process.stdout.write(`${body}\n`);
    return current;
  };

  if (!interactive) {
    paint();
    return;
  }

  let done = false;
  let jumpBuffer = '';
  let jumpTimer = null;
  const timer = setInterval(paint, pollMs);

  const cleanup = (code = 0) => {
    if (done) return;
    done = true;
    clearInterval(timer);
    if (jumpTimer) clearTimeout(jumpTimer);
    process.stdout.write('\x1b[?1000l\x1b[?1006l\x1b[?25h\n');
    if (process.stdin.setRawMode) process.stdin.setRawMode(false);
    process.stdin.pause();
    process.exit(code);
  };

  const persistDecision = (decision, targetIndex = selectedIndex, targetFindingId = null) => {
    const finding = current && current.visibleFindings[targetIndex];
    const findingId = targetFindingId || (finding && finding.id);
    if (!findingId) return;
    selectedIndex = targetIndex;
    reviewState = applyFindingDecision(reviewState, findingId, decision);
    reviewState.source = { ...source, ...(reviewState.source || {}) };
    try {
      writeReviewState(reviewFile, reviewState);
    } catch (err) {
      process.stdout.write(`\nERROR: could not write findings review file: ${err.message}\n`);
    }
    paint();
  };

  const jumpTo = (digit) => {
    jumpBuffer += digit;
    const target = Number(jumpBuffer);
    if (Number.isFinite(target) && target > 0 && current && current.visibleFindings.length) {
      selectedIndex = Math.min(target - 1, current.visibleFindings.length - 1);
      paint();
    }
    if (jumpTimer) clearTimeout(jumpTimer);
    jumpTimer = setTimeout(() => { jumpBuffer = ''; }, 900);
    if (jumpTimer.unref) jumpTimer.unref();
  };

  const cycleGroupBy = () => {
    const currentIndex = GROUP_BY.indexOf(groupBy);
    groupBy = GROUP_BY[(currentIndex + 1) % GROUP_BY.length];
    paint();
  };

  const cycleSort = () => {
    const currentIndex = SORT_BY.indexOf(sortBy);
    sortBy = SORT_BY[(currentIndex + 1) % SORT_BY.length];
    paint();
  };

  // Cycle through the saved review views (gh-dash-style presets). Each applies its own filter set,
  // grouping, and sort. Selection resets to the top so the reviewer starts at the first item of the
  // new view. No view performs any decision — views only change WHICH findings are shown and ordered.
  const cycleView = () => {
    if (!savedViews.length) return;
    viewIndex = (viewIndex + 1) % savedViews.length;
    const v = savedViews[viewIndex];
    activeFilters = { text: v.filter || null, skill: v.skill || null, model: v.model || null, verdict: v.verdict || null };
    if (v.group_by) groupBy = normalizeGroupBy(v.group_by);
    if (v.sort) sortBy = normalizeSort(v.sort);
    viewName = v.name;
    selectedIndex = 0;
    paint();
  };

  // Jump to the next (dir>0) / previous (dir<0) finding still pending. Anti-exploit navigation:
  // walks every undecided finding so none is silently skipped — but each is still decided one at a time.
  const gotoPending = (dir) => {
    const list = current && current.visibleFindings;
    if (!list || !list.length) return;
    const idx = nextPendingIndex(list, reviewState, selectedIndex, dir);
    if (idx >= 0) { selectedIndex = idx; paint(); }
  };

  // Commit (or clear) the per-finding note typed in input mode. Preserves the finding's existing
  // decision — a note attaches to whatever approve/disapprove/pending state the finding already has.
  const commitNote = () => {
    const finding = current && current.visibleFindings[selectedIndex];
    const findingId = finding && finding.id;
    const note = inputBuffer;
    inputMode = false;
    inputBuffer = '';
    if (findingId) {
      const decision = decisionFor(finding, reviewState);
      reviewState = applyFindingDecision(reviewState, findingId, decision, undefined, note);
      reviewState.source = { ...source, ...(reviewState.source || {}) };
      try {
        writeReviewState(reviewFile, reviewState);
      } catch (err) {
        process.stdout.write(`\nERROR: could not write findings review file: ${err.message}\n`);
      }
    }
    paint();
  };

  // While in note-input mode, all keystrokes feed the note buffer (Enter saves, Esc cancels,
  // Backspace edits) — they do NOT trigger decision/navigation keys.
  const handleInput = (text) => {
    if (text.includes('\u0003')) { cleanup(130); return; }
    for (const ch of text) {
      if (ch === '\r' || ch === '\n') { commitNote(); return; }
      if (ch === '\x1b') { inputMode = false; inputBuffer = ''; paint(); return; }
      if (ch === '\x7f' || ch === '\b') { inputBuffer = inputBuffer.slice(0, -1); continue; }
      if (ch >= ' ') inputBuffer += ch;
    }
    paint();
  };

  const handleMouse = (text) => {
    const re = /\x1b\[<(\d+);(\d+);(\d+)([Mm])/g;
    let matched = false;
    let match = null;
    while ((match = re.exec(text))) {
      if (match[4] !== 'M') continue;
      const col = Number(match[2]);
      const row = Number(match[3]);
      const target = current && current.frame.hitTargets.find((hit) => (
        hit.row === row && col >= hit.colStart && col <= hit.colEnd
      ));
      if (!target) continue;
      matched = true;
      persistDecision(target.action, target.index, target.findingId);
    }
    return matched;
  };

  const onData = (chunk) => {
    const text = chunk.toString('utf8');
    // Note-input mode owns all keystrokes until the note is saved/cancelled.
    if (inputMode) { handleInput(text); return; }
    if (text.includes('\u0003')) cleanup(130);
    handleMouse(text);
    const keyText = text.replace(/\x1b\[<(\d+);(\d+);(\d+)([Mm])/g, '');
    if (keyText.includes('\x1b[A') || keyText.includes('k')) {
      selectedIndex = Math.max(0, selectedIndex - 1);
      paint();
    }
    if (keyText.includes('\x1b[B') || keyText.includes('j')) {
      const max = current && current.visibleFindings.length ? current.visibleFindings.length - 1 : 0;
      selectedIndex = Math.min(max, selectedIndex + 1);
      paint();
    }
    for (const ch of keyText) {
      if (ch === 'q') cleanup(0);
      else if (ch === 'a') persistDecision('approved');
      else if (ch === 'd') persistDecision('disapproved');
      else if (ch === 'u') persistDecision('pending');
      else if (ch === 'n') gotoPending(1);
      else if (ch === 'N') gotoPending(-1);
      else if (ch === 'c') { inputMode = true; inputBuffer = ''; paint(); }
      else if (ch === 'v') cycleView();
      else if (ch === 's') cycleSort();
      else if (ch === 'g') cycleGroupBy();
      else if (/[0-9]/.test(ch)) jumpTo(ch);
    }
  };

  process.stdout.write('\x1b[?1000h\x1b[?1006h\x1b[?25l');
  if (process.stdin.setRawMode) process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on('data', onData);
  process.once('SIGINT', () => cleanup(130));
  paint();
}

function main(argv) {
  const parsed = parseArgs(argv.slice());
  const statusFile = parsed.positionals[0];
  if (!statusFile) {
    process.stderr.write(usage());
    process.exit(2);
  }
  const optVal = (name, def) => {
    if (!Object.prototype.hasOwnProperty.call(parsed.values, name)) return def;
    const n = Number(parsed.values[name]);
    return Number.isFinite(n) ? n : def;
  };
  const pollMs = optVal('poll', 1) * 1000;   // 1s → smooth live timer on a TTY
  // ts frozen > 45m ⇒ hang. MUST exceed the longest SINGLE blocking dispatch, because the
  // synchronous model-call dispatch cannot tick the heartbeat mid-call: a frontier call runs up to
  // SKILL_AUDIT_CLI_TIMEOUT_MS (30m, skill-audit-loop-lite-deps.js) and an advisory call up to
  // advisoryTimeoutMs (20m). The prior 900s (15m) default was BELOW those, so a healthy-but-quiet
  // long call tripped a FALSE stall (the 2026-06-10 deepseek-flash false-abort: the drain was alive,
  // blocked in a 20m advisory call). 2700s matches the driver's own bridge (run-panel-loop.sh --stale
  // 2700) and leaves margin over the 30m ceiling. A genuinely hung advisory is dropped by the engine
  // at its own 20m timeout (the run then resumes heartbeating) — long before this watchdog fires.
  const staleMs = optVal('stale', 2700) * 1000;
  const slowMs = optVal('slow', 600) * 1000;   // active agent > 10m ⇒ SLOW flag
  // Periodic piped "liveness tick" is OFF by default: on a Claude Code Monitor every emitted
  // line becomes a chat message, so a per-N-second timer line floods the conversation. Opt in
  // with --tick N (N>0) for a human tailing in a plain terminal who wants a visible countdown.
  const tickRaw = optVal('tick', 0);
  const tickMs = tickRaw > 0 ? tickRaw * 1000 : 0; // 0 ⇒ disabled (structural + STALL/SLOW/COMPLETE only)
  const once = parsed.flags.has('once');
  // --fail-on-stall: on a STALL (heartbeat ts frozen past --stale and not complete), exit
  // non-zero (3) with a FAILED line instead of spinning forever. Turns a silent hang into a
  // terminal failure a Monitor/orchestrator can act on. Default off (back-compat).
  const failOnStall = parsed.flags.has('fail-on-stall');
  const tty = Boolean(process.stdout.isTTY);
  const absStatus = path.resolve(statusFile);

  if (parsed.flags.has('review-findings')) {
    const absFindingsFile = parsed.values['findings-file'] ? path.resolve(parsed.values['findings-file']) : null;
    const reviewFile = parsed.values['review-file']
      ? path.resolve(parsed.values['review-file'])
      : `${absStatus}.findings-review.json`;
    // Saved views: explicit --views-file, else the repo default at skill-audit-loop/review-views.json.
    // loadReviewViews falls back to the built-in default list when the file is missing/unreadable.
    const viewsFile = parsed.values['views-file']
      ? path.resolve(parsed.values['views-file'])
      : path.join(__dirname, '..', 'skill-audit-loop', 'review-views.json');
    runFindingsReview({
      absStatus,
      absFindingsFile,
      reviewFile,
      filters: {
        text: parsed.values.filter || null,
        skill: parsed.values.skill || null,
        model: parsed.values.model || null,
        verdict: parsed.values.verdict || null,
      },
      groupBy: parsed.values['group-by'] || 'none',
      sortBy: parsed.values.sort || 'disposition-priority',
      views: loadReviewViews(viewsFile),
      pollMs,
      once,
      selectedIndex: Math.max(0, (Number(parsed.values.select) || 1) - 1),
    });
    return;
  }

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
    } else if (tickMs > 0 && !st.complete && now - lastTick >= tickMs) {
      // periodic liveness so the timer is visibly advancing (opt-in via --tick N; OFF by default
      // so a Monitor surface only ever sees structural + STALL/SLOW/COMPLETE events)
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
    // normally, so only flag past --stale. We then probe the OWNED pid (kill -0 via pidAlive) to
    // distinguish a runner that is ALIVE-but-blocked from one that has CRASHED — a ts-only check
    // cannot tell them apart, which is the slow-vs-dead ambiguity (no-ps-for-liveness rule).
    if (st.ts !== lastTs) { lastTs = st.ts; lastTsWall = now; staleFlagged = false; }
    else if (!st.complete && now - lastTsWall >= staleMs) {
      const secs = Math.round((now - lastTsWall) / 1000);
      const live = classifyLiveness({
        complete: false, frozenMs: now - lastTsWall, staleMs,
        pid: st.pid, pidAliveResult: pidAlive(st.pid),
      });
      // CONFIRMED DEAD is terminal on EVERY tick (not gated by --fail-on-stall, not deduped):
      // the owned pid is gone and no terminal heartbeat was flushed → crashed/killed mid-run, not
      // coming back. Re-probing each tick also catches a hung→dead transition. Exit 4 distinguishes
      // a watchdog-confirmed DEATH from the runner's own exits (0 keep / 2 revert / 1 error) and
      // from the ts-only watchdog stall (exit 3).
      if (live.state === 'dead') {
        process.stdout.write(`DEAD: runner pid ${live.pid} is gone and never flushed a terminal heartbeat (frozen ${secs}s) — crashed or killed mid-run, not coming back\n`);
        process.stdout.write(`FAILED: skill-audit-loop runner pid ${live.pid} dead (heartbeat frozen ${secs}s, exceeded --stale ${Math.round(staleMs / 1000)}s)\n`);
        process.exit(4);
      }
      if (!staleFlagged) {
        // 'hung' = pid ALIVE but heartbeat frozen (blocked in a long synchronous dispatch — may
        // resume); 'stale' = no pid to probe (ts-only, back-compat). Name the pid + aliveness so
        // the operator knows it is a slow call, not a crash.
        const note = live.state === 'hung' ? ` (runner pid ${live.pid} ALIVE — blocked in a long dispatch, not dead)` : '';
        const why = live.state === 'hung'
          ? 'runner alive but not ticking (likely a long synchronous model dispatch)'
          : 'runner frozen/dead, check it';
        process.stdout.write(`STALL: no heartbeat for ${secs}s${note} — ${why}\n`);
        staleFlagged = true;
        if (failOnStall) {
          // Terminal failure: past --stale (45m default > the 30m max single dispatch), so even an
          // alive-but-blocked runner is genuinely stuck. Make it loud and non-zero so a
          // Monitor/orchestrator stops waiting and acts. Exit 3 = watchdog stall (cf. exit 4 DEAD).
          process.stdout.write(`FAILED: skill-audit-loop stalled — no heartbeat for ${secs}s (exceeded --stale ${Math.round(staleMs / 1000)}s)${note}\n`);
          process.exit(3);
        }
      }
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

module.exports = { renderCollected, classifyLiveness, pidAlive };
