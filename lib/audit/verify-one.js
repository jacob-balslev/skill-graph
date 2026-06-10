#!/usr/bin/env node
'use strict';

// ─── Per-model VERIFY primitive (Phase 3.1, for in-session Agent-tool dispatch) ──────────
//
// Dispatches ONE mandatory frontier model's Phase-3.1 verify pass over the curated merge:
// own-contribution coverage, advisory-disposition honesty, and reproduced evidence on
// load-bearing claims (prompts/skill-audit-loop-verify-pass.md). This is the unit a Claude
// Code Agent-tool subagent runs — the in-session counterpart of the runner's phase 3.1
// (run-skill-audit-loop.js), added 2026-06-10T when a live test run confirmed the phase
// existed in the doctrine (SKILL_AUDIT_LOOP.md § Phase 3.1) but not in the toolkit.
// REUSES the tested live deps (`skill-audit-loop-live-deps.js` → `verifyMerge`).
//
// Like the sibling primitives, it deliberately does NOT use the claim system: the caller
// passes an explicit --out dir, so concurrent in-session subagents never collide.
//
// Usage:
//   node lib/audit/verify-one.js --model <alias> --skill <slug> --cwd <skill-graph-root> \
//     --out <dir> --merged <merged-SKILL.md> --ledger <merge-ledger> \
//     [--own-proposal <path>] [--round <n>] [--status-file <heartbeat.json>] [--timeout <ms>]
//
// Writes an authoritative result.verify-r<round>.json:
//   { model, ok, approved, gaps[], parse_ok, error? }. approved is true ONLY with zero gaps.

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
  const skill = args.skill;
  const model = args.model;
  const cwd = path.resolve(args.cwd || process.cwd());
  const outDir = args.out && path.resolve(args.out);
  const round = Number(args.round || 1);
  const mergedPath = args.merged && path.resolve(args.merged);
  const ledgerPath = args.ledger && path.resolve(args.ledger);
  const ownProposalPath = args['own-proposal'] && path.resolve(args['own-proposal']);
  const statusFile = args['status-file'] && path.resolve(args['status-file']);
  if (!model || !skill || !outDir || !mergedPath) {
    process.stderr.write('Usage: node lib/audit/verify-one.js --model <alias> --skill <slug> --cwd <root> --out <dir> --merged <merged-SKILL.md> --ledger <merge-ledger> [--own-proposal <path>] [--round <n>] [--status-file <f>]\n');
    process.exit(2);
  }
  fs.mkdirSync(outDir, { recursive: true });

  // Match the sibling primitives: bound the dispatch BELOW the wrapper's 10-min Bash window.
  const timeoutMs = Number(args.timeout || 9 * 60 * 1000);

  const resultPath = path.join(outDir, `result.verify-r${round}.json`);
  const finish = (obj, code) => {
    const out = { model, tier: 'mandatory', round, ts: new Date().toISOString(), ...obj };
    try { fs.writeFileSync(resultPath, `${JSON.stringify(out, null, 2)}\n`); } catch (_) { /* best-effort */ }
    if (statusFile) updateCellStatus(statusFile, { skill, model, tier: 'mandatory', phase: `verify-r${round}`, state: obj.ok ? 'done' : 'failed' });
    console.log(JSON.stringify(out));
    process.exit(code);
  };

  if (statusFile) updateCellStatus(statusFile, { skill, model, tier: 'mandatory', phase: `verify-r${round}`, state: 'running' });

  const { createSkillAuditLoopDeps } = require('./skill-audit-loop-live-deps');
  const deps = createSkillAuditLoopDeps({ skillGraphRoot: cwd, dryRun: Boolean(args['dry-run']), advisoryTimeoutMs: timeoutMs });

  let res;
  try {
    res = deps.verifyMerge({
      skill,
      verifierModel: model,
      mergedSkillPath: mergedPath,
      mergeLedgerPath: ledgerPath,
      ownProposalPath,
      artifactsDir: outDir,
      round,
    });
  } catch (err) {
    finish({ ok: false, error: err.message, approved: false, gaps: [] }, 1);
  }
  if (!res || res.ok === false) {
    finish({ ok: false, error: (res && res.error) || 'verify produced no result', approved: false, gaps: [] }, 1);
  }
  finish({ ok: true, approved: res.approved === true, gaps: res.gaps || [], parse_ok: res.parse_ok !== false }, 0);
}

main(process.argv.slice(2));
