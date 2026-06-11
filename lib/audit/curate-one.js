#!/usr/bin/env node
'use strict';

// ─── Frontier CURATE primitive (for in-session Agent-tool dispatch) ──────────────────────
//
// Dispatches the Phase-3 synthesis: ONE frontier curator (default Opus) union-merges the
// MANDATORY proposals under STRICT anti-loss + mandatory-coverage, folding in advisory content
// where it adds value, and WRITES the merged enriched SKILL.md + a merge-ledger to a verified
// path. This is the unit a Claude Code Agent-tool subagent runs, so the curator shows as its
// own panel row. REUSES the tested live deps (`skill-audit-loop-live-deps.js` → `curate`, which
// holds the single `--merge` lock and dispatches the frontier curator) and validates the
// returned ledger with the SAME guards the synchronous orchestrator uses
// (`validateAntiLoss` + `validateMandatoryCoverage`).
//
// Usage:
//   node lib/audit/curate-one.js --skill <slug> --skill-dir <dir> --cwd <skill-graph-root> \
//     --out <dir> --proposals <mandatory.json> [--advisory <advisory.json>] \
//     --current-skill <path> --mandatory-models <m1,m2> [--curator <model>]
//
// --proposals / --advisory are JSON files: arrays of proposal refs
//   [{ model, tier, proposalPath, noveltyMemoPath }]. STRICT anti-loss applies to --proposals;
//   --advisory is discretionary (the frontier curator decides; advisory never auto-merges).
//
// Writes an authoritative result.curate.json: { ok, mergedSkillPath, mergeLedgerPath, antiLoss,
//   coverage, error? }. ok is true ONLY when the ledger passes BOTH anti-loss and coverage.

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

function readJsonArray(p, label) {
  if (!p) return [];
  const abs = path.resolve(p);
  if (!fs.existsSync(abs)) return [];
  const v = JSON.parse(fs.readFileSync(abs, 'utf8'));
  if (!Array.isArray(v)) throw new Error(`--${label} must be a JSON array (${abs})`);
  return v;
}

function main(argv) {
  const args = parseArgs(argv);
  const skill = args.skill;
  const skillDir = args['skill-dir'] && path.resolve(args['skill-dir']);
  const cwd = path.resolve(args.cwd || process.cwd());
  const outDir = args.out && path.resolve(args.out);
  const currentSkillPath = args['current-skill'] && path.resolve(args['current-skill']);
  const curatorModel = typeof args.curator === 'string' ? args.curator : 'opus';
  const mandatoryModels = String(args['mandatory-models'] || 'opus,gpt-5.5')
    .split(',').map((s) => s.trim()).filter(Boolean);
  if (!skill || !skillDir || !outDir || !args.proposals) {
    process.stderr.write('Usage: node lib/audit/curate-one.js --skill <slug> --skill-dir <dir> --cwd <root> --out <dir> --proposals <mandatory.json> [--advisory <advisory.json>] --current-skill <path> --mandatory-models <m1,m2>\n');
    process.exit(2);
  }
  fs.mkdirSync(outDir, { recursive: true });

  // Optional in-session heartbeat (2026-06-10T) — see panel-status-file.js.
  const statusFile = args['status-file'] && path.resolve(args['status-file']);
  const resultPath = path.join(outDir, 'result.curate.json');
  const finish = (obj, code) => {
    const out = { skill, curator: curatorModel, ts: new Date().toISOString(), ...obj };
    try { fs.writeFileSync(resultPath, `${JSON.stringify(out, null, 2)}\n`); } catch (_) { /* best-effort */ }
    if (statusFile) updateCellStatus(statusFile, { skill, model: curatorModel, tier: 'mandatory', phase: 'curate', state: obj.ok ? 'done' : 'failed' });
    console.log(JSON.stringify(out));
    process.exit(code);
  };
  if (statusFile) updateCellStatus(statusFile, { skill, model: curatorModel, tier: 'mandatory', phase: 'curate', state: 'running' });

  let proposals; let advisoryProposals;
  try {
    proposals = readJsonArray(args.proposals, 'proposals');
    advisoryProposals = readJsonArray(args.advisory, 'advisory');
  } catch (e) { finish({ ok: false, error: e.message }, 1); }
  if (!proposals.length) finish({ ok: false, error: 'no mandatory proposals supplied' }, 1);

  const { createSkillAuditLoopDeps } = require('./skill-audit-loop-live-deps');
  const { validateAntiLoss } = require('./run-skill-audit-loop-lite');
  const { validateMandatoryCoverage } = require('./run-skill-audit-loop');
  const deps = createSkillAuditLoopDeps({ skillGraphRoot: cwd, dryRun: Boolean(args['dry-run']), curatorModel });

  let merge;
  try {
    // base.curate destructures { skill, skillDir, proposals, currentSkillPath }; advisory/cross-
    // review are accepted (and ignored by the current curate impl) but passed for forward-compat.
    merge = deps.curate({
      skill,
      skillDir,
      proposals,
      advisoryProposals,
      currentSkillPath,
    });
  } catch (err) {
    finish({ ok: false, error: err.message }, 1);
  }
  if (!merge || !merge.mergedSkillPath || !merge.mergeLedger) {
    finish({ ok: false, error: 'curate returned no merged skill / ledger' }, 1);
  }

  // SAME guards as run-skill-audit-loop.js Phase 3 — a violation is a hard failure (the curator
  // silently lost a frontier contribution); surface it, do not apply.
  const antiLoss = validateAntiLoss(merge.mergeLedger);
  const mandatoryFinal = proposals.map((p) => ({ model: p.model, tier: 'mandatory', alive: true }));
  const coverage = validateMandatoryCoverage(merge.mergeLedger, mandatoryFinal, mandatoryModels);

  const ok = antiLoss.ok && coverage.ok;
  finish({
    ok,
    mergedSkillPath: merge.mergedSkillPath,
    mergeLedgerPath: merge.mergeLedgerPath || null,
    antiLoss: { ok: antiLoss.ok, violations: antiLoss.violations || [] },
    coverage: { ok: coverage.ok, violations: coverage.violations || [], covered: coverage.covered || [] },
    error: ok ? undefined : 'ledger failed anti-loss and/or mandatory-coverage (see fields)',
  }, ok ? 0 : 1);
}

main(process.argv.slice(2));
