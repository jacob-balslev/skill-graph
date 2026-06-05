'use strict';

// Unit tests for panel-enrich-live-deps.js — pure seams + dry-run wiring. No real CLI.

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const live = require('../../lib/audit/panel-enrich-live-deps');

let passed = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS    ${name}`); passed += 1; }
  catch (e) { console.log(`  FAIL    ${name}\n          ${e.message}`); throw e; }
}

console.log('1. parseLastJsonBlock');
check('extracts the LAST fenced json block', () => {
  const txt = 'noise\n```json\n{"a":1}\n```\nmore\n```json\n{"reviews":[{"targetModel":"opus","items":[]}]}\n```\n';
  const r = live.parseLastJsonBlock(txt);
  assert.deepStrictEqual(r, { reviews: [{ targetModel: 'opus', items: [] }] });
});
check('falls back to the last bare object when no fence', () => {
  assert.deepStrictEqual(live.parseLastJsonBlock('text {"changed":true}'), { changed: true });
});
check('returns null on unparseable', () => { assert.strictEqual(live.parseLastJsonBlock('no json here'), null); });

console.log('2. resolveBackend');
check('advisory opencode + gemini backends resolve', () => {
  assert.strictEqual(live.resolveBackend('minimax').backend, 'opencode');
  assert.strictEqual(live.resolveBackend('gemini').backend, 'gemini');
});

console.log('3. dry-run deps — offline, deterministic, write-to-path');
check('advisory propose writes a non-empty proposal file (dry-run)', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'panel-live-'));
  const deps = live.createPanelEnrichDeps({ skillGraphRoot: root, dryRun: true });
  const slot = deps.claimAdvisorySlot({ skill: 's', model: 'minimax' });
  assert.strictEqual(slot.ok, true);
  const r = deps.researchAndProposeAdvisory({ skill: 's', skillDir: path.join(root, 'skills', 's'), model: 'minimax', brief: 'b', artifactsDir: slot.artifactsDir });
  assert.strictEqual(r.ok, true);
  assert.ok(fs.existsSync(r.proposalPath) && fs.statSync(r.proposalPath).size > 0, 'proposal written non-empty');
  // hashProposal is stable
  assert.strictEqual(deps.hashProposal(r.proposalPath), deps.hashProposal(r.proposalPath));
  fs.rmSync(root, { recursive: true, force: true });
});
check('dry-run crossReview returns empty feedback; revise reports no change', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'panel-live-'));
  const deps = live.createPanelEnrichDeps({ skillGraphRoot: root, dryRun: true });
  const cr = deps.crossReview({ skill: 's', reviewerModel: 'minimax', reviewerTier: 'advisory', ownProposalPath: '/x', otherProposals: [], round: 1 });
  assert.deepStrictEqual(cr, { ok: true, feedback: [] });
  const slot = deps.claimAdvisorySlot({ skill: 's', model: 'minimax' });
  const p = deps.researchAndProposeAdvisory({ skill: 's', skillDir: path.join(root, 'skills', 's'), model: 'minimax', brief: 'b', artifactsDir: slot.artifactsDir });
  const rv = deps.reviseProposal({ skill: 's', skillDir: path.join(root, 'skills', 's'), reviserModel: 'minimax', reviserTier: 'advisory', ownProposalPath: p.proposalPath, feedbackForMe: [], round: 1 });
  assert.strictEqual(rv.changed, false);
  fs.rmSync(root, { recursive: true, force: true });
});
check('exposes the full panel deps interface', () => {
  const deps = live.createPanelEnrichDeps({ skillGraphRoot: os.tmpdir(), dryRun: true });
  for (const fn of ['buildResearchBrief', 'claimSlot', 'releaseSlot', 'researchAndPropose', 'curate', 'prepareEnrichedEval', 'applyMerge', 'evalArtifactExists', 'hashProposal', 'claimAdvisorySlot', 'researchAndProposeAdvisory', 'crossReview', 'reviseProposal']) {
    assert.strictEqual(typeof deps[fn], 'function', `deps.${fn} is a function`);
  }
});

console.log(`\nResults: ${passed} passed, 0 failed`);
