#!/usr/bin/env node
'use strict';

// ─── Per-model CROSS-REVIEW primitive (for in-session Agent-tool dispatch) ───────────────
//
// Dispatches ONE model's Phase-2 cross-review pass: the model reviews every OTHER alive
// proposal in the panel and emits keep/wrong/missing feedback. This is the unit a Claude Code
// Agent-tool subagent runs, so every reviewer shows as its own row in the native subagent
// panel (↑/↓ · Enter to view) — the in-session counterpart to the synchronous
// `run-skill-audit-loop.js` orchestrator (a Node CLI cannot call the Agent tool; only the session
// can). It REUSES the tested live deps (`skill-audit-loop-live-deps.js` → `crossReview`).
//
// Like `propose-one.js`, it deliberately does NOT use the claim system: the caller passes an
// explicit --out dir, so concurrent in-session subagents never collide on a shared run-dir.
//
// Usage:
//   node lib/audit/cross-review-one.js --model <alias> --tier mandatory|advisory \
//     --skill <slug> --cwd <skill-graph-root> --out <dir> --round <n> --panel <panel.json>
//
// --panel is a JSON file: an array of ALL alive proposals
//   [{ model, tier, proposalPath, noveltyMemoPath }]. This primitive reviews every entry whose
//   `model` !== --model. The reviewer's own proposal is the entry matching --model.
//
// Writes an authoritative result.review-r<round>.json: { model, tier, round, ok, feedback[], error? }.
// feedback[] = [{ reviewerModel, reviewerTier, targetModel, round, items[] }].

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
  const tier = args.tier === 'mandatory' ? 'mandatory' : 'advisory';
  const cwd = path.resolve(args.cwd || process.cwd());
  const outDir = args.out && path.resolve(args.out);
  const round = Number(args.round || 1);
  const panelPath = args.panel && path.resolve(args.panel);
  if (!model || !skill || !outDir || !panelPath) {
    process.stderr.write('Usage: node lib/audit/cross-review-one.js --model <alias> --tier <t> --skill <slug> --cwd <root> --out <dir> --round <n> --panel <panel.json>\n');
    process.exit(2);
  }
  fs.mkdirSync(outDir, { recursive: true });

  // Match propose-one.js: bound the dispatch BELOW the wrapper's 10-min Bash window so a slow
  // model self-terminates and we write a clean result before the wrapper's window closes.
  const timeoutMs = Number(args.timeout || 9 * 60 * 1000);

  // Optional in-session heartbeat (2026-06-10T) — see panel-status-file.js.
  const statusFile = args['status-file'] && path.resolve(args['status-file']);
  const resultPath = path.join(outDir, `result.review-r${round}.json`);
  const finish = (obj, code) => {
    const out = { model, tier, round, ts: new Date().toISOString(), ...obj };
    try { fs.writeFileSync(resultPath, `${JSON.stringify(out, null, 2)}\n`); } catch (_) { /* best-effort */ }
    if (statusFile) updateCellStatus(statusFile, { skill, model, tier, phase: `review-r${round}`, state: obj.ok ? 'done' : 'failed' });
    console.log(JSON.stringify(out));
    process.exit(code);
  };
  if (statusFile) updateCellStatus(statusFile, { skill, model, tier, phase: `review-r${round}`, state: 'running' });

  let panel;
  try { panel = JSON.parse(fs.readFileSync(panelPath, 'utf8')); } catch (e) {
    finish({ ok: false, error: `could not read --panel ${panelPath}: ${e.message}`, feedback: [] }, 1);
  }
  if (!Array.isArray(panel)) finish({ ok: false, error: '--panel must be a JSON array of proposals', feedback: [] }, 1);

  const own = panel.find((p) => p && p.model === model);
  const others = panel.filter((p) => p && p.model !== model);
  if (!own || !own.proposalPath) finish({ ok: false, error: `reviewer ${model} has no proposal in --panel`, feedback: [] }, 1);
  if (others.length === 0) finish({ ok: true, feedback: [], note: 'no other proposals to review' }, 0);

  const { createSkillAuditLoopDeps } = require('./skill-audit-loop-live-deps');
  const deps = createSkillAuditLoopDeps({ skillGraphRoot: cwd, dryRun: Boolean(args['dry-run']), advisoryTimeoutMs: timeoutMs });

  let res;
  try {
    res = deps.crossReview({
      skill,
      reviewerModel: model,
      reviewerTier: tier,
      ownProposalPath: own.proposalPath,
      otherProposals: others.map((o) => ({ model: o.model, proposalPath: o.proposalPath, noveltyMemoPath: o.noveltyMemoPath, tier: o.tier })),
      round,
      artifactsDir: outDir,
    });
  } catch (err) {
    finish({ ok: false, error: err.message, feedback: [] }, 1);
  }
  if (!res || res.ok === false) {
    finish({ ok: false, error: (res && res.error) || 'cross-review produced no feedback', feedback: [] }, 1);
  }
  const feedback = Array.isArray(res.feedback) ? res.feedback : [];
  // parse_ok:false + empty feedback = the reviewer's JSON block was malformed and dropped;
  // parse_ok:true + empty feedback = an honest "nothing to add". Without the flag the two
  // are indistinguishable downstream (2026-06-10T live finding: two reviewers' empty rounds
  // could not be told apart from drops).
  finish({ ok: true, feedback, parse_ok: res.parse_ok !== false, reviewed: others.map((o) => o.model) }, 0);
}

main(process.argv.slice(2));
