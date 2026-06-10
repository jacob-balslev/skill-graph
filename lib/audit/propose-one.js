#!/usr/bin/env node
'use strict';

// ─── Per-model ENRICH propose primitive (for in-session Agent-tool panel dispatch) ──────
//
// Dispatches ONE model's enrich propose pass and writes its proposal to a given out dir.
// This is the unit the IN-SESSION panel runs INSIDE each Claude Code Agent-tool subagent, so
// every panel model shows as its own row in the native subagent panel (↑/↓ · Enter to view) —
// the dispatch mechanism the standalone `run-skill-audit-loop.js` could never reach (a Node CLI
// cannot call the Agent tool; only the session can). It REUSES the tested live deps
// (`skill-audit-loop-live-deps.js`) — no re-implementation of research/propose/write/verify.
//
// It deliberately does NOT use the claim system: the caller passes an explicit --out dir, so
// concurrent in-session subagents never collide on a shared run-dir/ledger (the run-dir
// mislabel + claim contention seen in the standalone tmux run).
//
// Usage:
//   node lib/audit/propose-one.js --model <alias> --tier mandatory|advisory \
//     --skill <slug> --skill-dir <dir> --cwd <skill-graph-root> --out <dir> [--dry-run]
//
// Prints one line of JSON: { model, tier, proposalPath, noveltyMemoPath, ok, bytes }.

const fs = require('fs');
const path = require('path');
const { updateCellStatus } = require('./panel-status-file');

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const t = argv[i];
    if (!t.startsWith('--')) continue;
    const key = t.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) { args[key] = true; } else { args[key] = next; i += 1; }
  }
  return args;
}

function main(argv) {
  const args = parseArgs(argv);
  const skillDir = args['skill-dir'] && path.resolve(args['skill-dir']);
  const skill = args.skill || (skillDir ? path.basename(skillDir) : null);
  const model = args.model;
  const tier = args.tier === 'mandatory' ? 'mandatory' : 'advisory';
  const cwd = path.resolve(args.cwd || process.cwd());
  const outDir = args.out && path.resolve(args.out);
  if (!model || !skill || !skillDir || !outDir) {
    process.stderr.write('Usage: node lib/audit/propose-one.js --model <alias> --tier mandatory|advisory --skill <slug> --skill-dir <dir> --cwd <root> --out <dir>\n');
    process.exit(2);
  }
  fs.mkdirSync(outDir, { recursive: true });

  // Bound the dispatch BELOW the caller's wrapper window. A Claude Code Agent-tool subagent's
  // Bash tool caps at 10 min (600000ms); the live-deps default advisory timeout is 20 min — so a
  // slow model outran the subagent's Bash call, the wrapper died, and the proposal was lost (the
  // MiniMax failure, 2026-06-05). Default to 9 min so the dispatch self-terminates and we write a
  // clean result BEFORE the wrapper's Bash window closes. Override with --timeout <ms>.
  const timeoutMs = Number(args.timeout || 9 * 60 * 1000);

  // Authoritative per-model outcome ON DISK — the orchestrator reads THIS, never the wrapper
  // subagent's (unreliable) text report (subagents reported "still running" while the file existed,
  // and "Monitor armed" while exiting). One source of truth per model.
  // Optional in-session heartbeat (2026-06-10T): --status-file <shared heartbeat.json> lets
  // watch-panel.js observe in-session Agent-tool runs the same way it observes the runner.
  const statusFile = args['status-file'] && path.resolve(args['status-file']);
  const resultPath = path.join(outDir, 'result.json');
  const finish = (obj, code) => {
    const out = { model, tier, ts: new Date().toISOString(), ...obj };
    try { fs.writeFileSync(resultPath, `${JSON.stringify(out, null, 2)}\n`); } catch (_) { /* best-effort */ }
    if (statusFile) updateCellStatus(statusFile, { skill, model, tier, phase: 'propose', state: obj.ok ? 'done' : 'failed' });
    console.log(JSON.stringify(out));
    process.exit(code);
  };
  if (statusFile) updateCellStatus(statusFile, { skill, model, tier, phase: 'propose', state: 'running' });

  const { createSkillAuditLoopDeps } = require('./skill-audit-loop-live-deps');
  const deps = createSkillAuditLoopDeps({ skillGraphRoot: cwd, dryRun: Boolean(args['dry-run']), advisoryTimeoutMs: timeoutMs });
  const brief = deps.buildResearchBrief(skillDir, skill) || '';

  // Frontier (mandatory) reuses base.researchAndPropose; advisory uses researchAndProposeAdvisory.
  // Both write a proposal file into artifactsDir and return { proposalPath, noveltyMemoPath?, ok? }.
  const dispatch = tier === 'mandatory' ? deps.researchAndPropose : deps.researchAndProposeAdvisory;
  let p;
  try {
    p = dispatch({ skill, skillDir, model, brief, artifactsDir: outDir });
  } catch (err) {
    finish({ ok: false, error: err.message }, 1);
  }
  if (!p || p.ok === false || !p.proposalPath) {
    finish({ ok: false, error: (p && p.error) || 'no proposal produced' }, 1);
  }
  let bytes = 0;
  try { bytes = fs.statSync(p.proposalPath).size; } catch (_) { bytes = 0; }
  finish({ ok: bytes > 0, bytes, via: p.via || null, proposalPath: p.proposalPath, noveltyMemoPath: p.noveltyMemoPath || null }, bytes > 0 ? 0 : 1);
}

main(process.argv.slice(2));
