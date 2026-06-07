#!/usr/bin/env node
'use strict';

// ─── Per-model REVISE primitive (for in-session Agent-tool dispatch) ─────────────────────
//
// Dispatches ONE model's Phase-2 revise pass: the model revises its OWN proposal in light of
// the cross-review feedback addressed to it, WRITING the revised proposal back to its path
// (write-to-path delivery — never stdout-extracted). The orchestrator reads the returned
// content hash to decide convergence (HASH-AUTHORITATIVE: changed iff the hash differs). This
// is the unit a Claude Code Agent-tool subagent runs, so every reviser shows as its own panel
// row. REUSES the tested live deps (`skill-audit-loop-live-deps.js` → `reviseProposal`).
//
// Like `propose-one.js`, no claim system: the caller passes an explicit --out dir.
//
// Usage:
//   node lib/audit/revise-one.js --model <alias> --tier mandatory|advisory \
//     --skill <slug> --skill-dir <dir> --cwd <skill-graph-root> --out <dir> --round <n> \
//     --own-proposal <path> --feedback <feedback.json>
//
// --feedback is a JSON file: an array of feedback records addressed to THIS model
//   [{ reviewerModel, reviewerTier, targetModel, round, items[] }]. An empty array (or a
//   missing file) means no feedback → no change (the dep returns changed:false).
//
// Writes an authoritative result.revise-r<round>.json: { model, tier, round, ok, proposalPath,
//   contentHash, changed, error? }.

const fs = require('fs');
const path = require('path');

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
  const skillDir = args['skill-dir'] && path.resolve(args['skill-dir']);
  const model = args.model;
  const tier = args.tier === 'mandatory' ? 'mandatory' : 'advisory';
  const cwd = path.resolve(args.cwd || process.cwd());
  const outDir = args.out && path.resolve(args.out);
  const round = Number(args.round || 1);
  const ownProposalPath = args['own-proposal'] && path.resolve(args['own-proposal']);
  const feedbackPath = args.feedback && path.resolve(args.feedback);
  if (!model || !skill || !skillDir || !outDir || !ownProposalPath) {
    process.stderr.write('Usage: node lib/audit/revise-one.js --model <alias> --tier <t> --skill <slug> --skill-dir <dir> --cwd <root> --out <dir> --round <n> --own-proposal <path> --feedback <feedback.json>\n');
    process.exit(2);
  }
  fs.mkdirSync(outDir, { recursive: true });

  const timeoutMs = Number(args.timeout || 9 * 60 * 1000);

  const resultPath = path.join(outDir, `result.revise-r${round}.json`);
  const finish = (obj, code) => {
    const out = { model, tier, round, ts: new Date().toISOString(), ...obj };
    try { fs.writeFileSync(resultPath, `${JSON.stringify(out, null, 2)}\n`); } catch (_) { /* best-effort */ }
    console.log(JSON.stringify(out));
    process.exit(code);
  };

  let feedbackForMe = [];
  if (feedbackPath && fs.existsSync(feedbackPath)) {
    try { feedbackForMe = JSON.parse(fs.readFileSync(feedbackPath, 'utf8')); } catch (e) {
      finish({ ok: false, error: `could not read --feedback ${feedbackPath}: ${e.message}` }, 1);
    }
  }
  if (!Array.isArray(feedbackForMe)) feedbackForMe = [];

  const { createSkillAuditLoopDeps } = require('./skill-audit-loop-live-deps');
  const deps = createSkillAuditLoopDeps({ skillGraphRoot: cwd, dryRun: Boolean(args['dry-run']), advisoryTimeoutMs: timeoutMs });

  let res;
  try {
    res = deps.reviseProposal({
      skill,
      skillDir,
      reviserModel: model,
      reviserTier: tier,
      ownProposalPath,
      feedbackForMe,
      round,
      artifactsDir: outDir,
    });
  } catch (err) {
    finish({ ok: false, error: err.message }, 1);
  }
  if (!res || res.ok === false) {
    finish({ ok: false, error: (res && res.error) || 'revise failed' }, 1);
  }
  finish({
    ok: true,
    proposalPath: res.proposalPath || ownProposalPath,
    contentHash: res.contentHash || null,
    changed: Boolean(res.changed),
    feedbackCount: feedbackForMe.length,
  }, 0);
}

main(process.argv.slice(2));
