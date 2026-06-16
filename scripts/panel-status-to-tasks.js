#!/usr/bin/env node
'use strict';

// ─── Heartbeat → native Task-panel payloads (the PRIMARY panel surface) ────────────
//
// SKILL_AUDIT_LOOP.md § "Surface ordering" makes the native Task panel (`TaskCreate` /
// `TaskUpdate` — the pinned, interactive checklist the harness paints at the bottom of the
// main conversation) the PRIMARY panel surface, NOT the statusline and NOT the scrolling
// Monitor block. But `TaskCreate`/`TaskUpdate` are AGENT tools — only the orchestrator session
// can call them; a background runner cannot. So a background loop writes its heartbeat
// `status.json` (schemas/panel-heartbeat.schema.json) and THIS script is the deterministic
// bridge: it transforms a heartbeat snapshot into the EXACT Task-panel shape the orchestrator
// applies via the Task tools — so the agent never hand-computes glyphs, it just mirrors.
//
// The documented shape (SKILL_AUDIT_LOOP.md § Surface ordering, lines 227-230):
//   • ONE in_progress HEADER task whose activeForm is the live rollup:
//       "⟳ Skill Audit Loop · <skill> · <phase> · N/M done · Q QUALITY/A advisory"
//   • One task PER PHASE (propose / cross-review / revise / curate) whose subject encodes the
//     participating models + per-model state: "propose · ✓Opus 4.8[Q] ⟳GPT-5.5[Q] ✓MiniMax M3 ·Nemotron".
//     ([Q] tags a mandatory/quality model; advisory models carry no tag. ✓ done, ⟳ active,
//      ✗ failed, · not-started — the glyph vocabulary the user's panel spec uses.)
//   • TaskUpdate flips each task's state live (pending → in_progress → completed).
// True parent/child nesting is not a Task-tool primitive, so the hierarchy is ENCODED in the
// subjects (same honest constraint the doc records), not in real nested rows.
//
// TWO MODES:
//   • default (single emission) — print the Task tree once and exit. The orchestrator reads it
//     to SEED the panel (one TaskCreate for the header + one per phase).
//   • --watch — stream a fresh Task tree (one JSON line) on every STRUCTURAL change, EVENT-DRIVEN
//     via fs.watch (FSEvents/inotify — NOT a poll loop), so the orchestrator, with this armed on
//     the `Monitor` tool, is woken per change and mirrors it with TaskUpdate. Atomic tmp+rename
//     writes (the producers use them) are survived by watching the DIRECTORY, not the file inode.
//     Exits on `complete`. A frozen heartbeat past --stale is disambiguated by the owned-PID
//     probe (kill -0, shared with watch-panel.js): pid GONE ⇒ emit a terminal failed tree + exit;
//     pid ALIVE ⇒ keep waiting silently (blocked in a long dispatch, not dead). This is the
//     heartbeat + owned-PID liveness hybrid (~/Development/.claude/rules/no-ps-for-liveness.md).
//
// OBSERVER ONLY: read-only on the heartbeat, never mutates the runner. It emits payloads; the
// agent owns the actual Task-tool calls (the only thing that can mutate the native panel).

const fs = require('fs');
const path = require('path');
const { resolveDisplayName } = require('../lib/audit-shared/model-provider');
const { agentGlyph } = require('../lib/audit/panel-progress');
const { pidAlive } = require('./watch-panel');

// The four canonical phases, in order — the per-phase task rows of the checklist.
const PHASES = [
  { key: 'propose', label: 'propose' },
  { key: 'cross-review', label: 'cross-review' },
  { key: 'revise', label: 'revise' },
  { key: 'curate', label: 'curate' },
];

// Per-model glyph for the ACTIVE phase, from the agent's live lifecycle state.
// Shared with panel-progress.js so every panel surface uses the same vocabulary:
// ✓ done · ⟳ active · ✗ failed · – skipped · · not-started.

// Map the whole-run phase label (free text: 'propose (advisory)', 'review', 'dispatch',
// 'curate', 'complete', …) to an index into PHASES, so phases BEFORE it render completed, the
// one AT it renders in_progress, and phases AFTER it render pending. `complete` ⇒ all done.
function currentPhaseIndex(phaseLabel, complete) {
  if (complete) return PHASES.length;
  const p = String(phaseLabel || '').toLowerCase();
  if (/curat/.test(p)) return 3;
  if (/revis/.test(p)) return 2;
  if (/review|cross/.test(p)) return 1;
  return 0; // propose / dispatch / start / unknown all map to the first phase
}

function phaseState(i, currentIdx, complete) {
  if (complete || i < currentIdx) return 'completed';
  if (i === currentIdx) return 'in_progress';
  return 'pending';
}

// One model token: "<glyph><DisplayName>[Q]?" — [Q] only on a mandatory/quality model.
function modelToken(agent, glyph) {
  const tag = (agent.tier === 'mandatory' || agent.tier === 'quality') ? '[Q]' : '';
  return `${glyph}${resolveDisplayName(agent.model)}${tag}`;
}

function phaseSubject(label, agents, i, currentIdx, complete) {
  const tokens = agents.map((a) => {
    let glyph;
    if (complete || i < currentIdx) {
      // A past/completed phase: the run advanced, so participants finished it — show ✓, but keep a
      // terminal-failed agent's ✗/– honest (failures persist in the snapshot's agents[]).
      const terminalGlyph = agentGlyph(a.state);
      glyph = (terminalGlyph === '✗' || terminalGlyph === '–') ? terminalGlyph : '✓';
    } else if (i === currentIdx) {
      glyph = agentGlyph(a.state); // the active phase: live per-model state
    } else {
      glyph = '·'; // a future phase: not started
    }
    return modelToken(a, glyph);
  });
  return tokens.length ? `${label} · ${tokens.join(' ')}` : label;
}

/**
 * Transform a heartbeat status snapshot into the native Task-panel tree the orchestrator applies.
 * Pure (no I/O). Returns { header:{subject,activeForm,state}, phases:[{key,subject,state}], complete }.
 *
 * @param {object} status  heartbeat object (schemas/panel-heartbeat.schema.json).
 */
function buildTaskTree(status) {
  const s = status || {};
  const agents = Array.isArray(s.agents) ? s.agents : [];
  const complete = Boolean(s.complete);
  const done = s.done || 0;
  const total = s.total != null ? s.total : agents.length;
  const failed = s.failed || 0;
  const qCount = agents.filter((a) => a && (a.tier === 'mandatory' || a.tier === 'quality')).length;
  const aCount = agents.filter((a) => a && a.tier === 'advisory').length;
  const currentIdx = currentPhaseIndex(s.phase, complete);

  const headerGlyph = complete ? '✓' : '⟳';
  const headerPhase = complete ? 'complete' : (s.phase || 'starting');
  const activeForm = `${headerGlyph} Skill Audit Loop · ${s.skill || '?'} · ${headerPhase} · ${done}/${total} done`
    + (failed ? ` · ${failed} failed` : '')
    + ` · ${qCount} QUALITY/${aCount} advisory`;

  return {
    header: { subject: 'Skill Audit Loop', activeForm, state: complete ? 'completed' : 'in_progress' },
    phases: PHASES.map((p, i) => ({
      key: p.key,
      subject: phaseSubject(p.label, agents, i, currentIdx, complete),
      state: phaseState(i, currentIdx, complete),
    })),
    complete,
  };
}

// Structural signature — emit a new Task tree ONLY when one of these changes (so a --watch stream
// is one event per real state change, not per heartbeat tick). The live elapsed timer is
// deliberately excluded: it changes every tick and would flood the Monitor / Task panel.
function treeSignature(tree) {
  return JSON.stringify({
    h: `${tree.header.activeForm}|${tree.header.state}`,
    p: tree.phases.map((x) => `${x.key}:${x.state}:${x.subject}`),
    c: tree.complete,
  });
}

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (_) { return null; }
}

function emit(tree) { process.stdout.write(`${JSON.stringify(tree)}\n`); }

// A terminal failed tree (header glyph ✗) for the DEAD case, so the panel ends loud, not stuck.
function failedTree(lastTree) {
  const t = lastTree || buildTaskTree({});
  return {
    header: { subject: 'Skill Audit Loop', activeForm: t.header.activeForm.replace(/^[⟳✓]/, '✗') + ' · RUNNER DEAD', state: 'completed' },
    phases: t.phases,
    complete: true,
  };
}

function parseArgs(argv) {
  const positionals = [];
  const opts = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (!a.startsWith('--')) { positionals.push(a); continue; }
    const name = a.slice(2);
    if (name === 'watch') { opts.watch = true; continue; }
    opts[name] = argv[i + 1]; i += 1;
  }
  return { positionals, opts };
}

function main(argv) {
  const { positionals, opts } = parseArgs(argv);
  const file = positionals[0];
  if (!file) {
    process.stderr.write('Usage: node scripts/panel-status-to-tasks.js <heartbeat.json> [--watch] [--stale SECS] [--poll SECS]\n');
    process.exit(2);
  }
  const abs = path.resolve(file);
  const staleMs = (Number(opts.stale) > 0 ? Number(opts.stale) : 2700) * 1000;

  // Single emission (default): print the Task tree once so the orchestrator can SEED the panel.
  if (!opts.watch) {
    emit(buildTaskTree(readJson(abs) || {}));
    process.exit(0);
  }

  // --watch: event-driven stream. fs.watch on the DIRECTORY (survives the producer's atomic
  // tmp+rename, which would orphan a file-inode watch), coalesced, with an owned-PID liveness
  // guard so a dead runner ends the stream instead of leaving the panel mid-flight forever.
  const dir = path.dirname(abs);
  const base = path.basename(abs);
  let lastSig = '';
  let lastTree = null;
  let lastChangeWall = Date.now();
  let coalesce = null;

  const tick = () => {
    const hb = readJson(abs);
    if (hb) {
      const tree = buildTaskTree(hb);
      const sig = treeSignature(tree);
      if (sig !== lastSig) {
        lastSig = sig;
        lastTree = tree;
        lastChangeWall = Date.now();
        emit(tree);
      }
      if (tree.complete) process.exit(0);
    }
    // Liveness: a frozen heartbeat past --stale is alive-blocked OR dead — probe the owned pid.
    if (Date.now() - lastChangeWall >= staleMs) {
      const alive = hb && pidAlive(hb.pid);
      if (hb && hb.pid && alive === false) { emit(failedTree(lastTree)); process.exit(4); }
      // pid alive (blocked) or no pid to probe → keep waiting silently; reset the window so we
      // re-probe each --stale interval rather than spinning.
      lastChangeWall = Date.now();
    }
  };

  const schedule = () => {
    if (coalesce) return; // coalesce a rename+change burst into one tick
    coalesce = setTimeout(() => { coalesce = null; tick(); }, 150);
    if (coalesce.unref) coalesce.unref();
  };

  emit(buildTaskTree(readJson(abs) || {})); // seed emission
  lastSig = treeSignature(buildTaskTree(readJson(abs) || {}));
  lastTree = buildTaskTree(readJson(abs) || {});

  try {
    const watcher = fs.watch(dir, (_event, fname) => { if (!fname || fname === base) schedule(); });
    watcher.on('error', () => {}); // fall through to the stale-guard timer below
  } catch (_) { /* fs.watch unsupported on this fs → rely on the stale-guard interval */ }

  // A slow safety interval (NOT the primary signal — fs.watch is) so the liveness/stale guard
  // still fires on a filesystem where fs.watch is flaky, and so `complete` is never missed.
  const guard = setInterval(tick, (Number(opts.poll) > 0 ? Number(opts.poll) : 15) * 1000);
  // Do NOT unref `guard`: it is the handle that keeps the watcher process alive until `complete`.
  void guard;
}

if (require.main === module) main(process.argv.slice(2));

module.exports = { buildTaskTree, treeSignature, agentGlyph, currentPhaseIndex, phaseState, PHASES };
