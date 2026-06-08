'use strict';

// Unit tests for skill-audit-loop-live-deps.js — pure seams + dry-run wiring. No real CLI.

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const live = require('../../lib/audit/skill-audit-loop-live-deps');

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
  const deps = live.createSkillAuditLoopDeps({ skillGraphRoot: root, dryRun: true });
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
  const deps = live.createSkillAuditLoopDeps({ skillGraphRoot: root, dryRun: true });
  const cr = deps.crossReview({ skill: 's', reviewerModel: 'minimax', reviewerTier: 'advisory', ownProposalPath: '/x', otherProposals: [], round: 1 });
  assert.deepStrictEqual(cr, { ok: true, feedback: [] });
  const slot = deps.claimAdvisorySlot({ skill: 's', model: 'minimax' });
  const p = deps.researchAndProposeAdvisory({ skill: 's', skillDir: path.join(root, 'skills', 's'), model: 'minimax', brief: 'b', artifactsDir: slot.artifactsDir });
  const rv = deps.reviseProposal({ skill: 's', skillDir: path.join(root, 'skills', 's'), reviserModel: 'minimax', reviserTier: 'advisory', ownProposalPath: p.proposalPath, feedbackForMe: [], round: 1 });
  assert.strictEqual(rv.changed, false);
  fs.rmSync(root, { recursive: true, force: true });
});
check('exposes the full panel deps interface', () => {
  const deps = live.createSkillAuditLoopDeps({ skillGraphRoot: os.tmpdir(), dryRun: true });
  for (const fn of ['buildResearchBrief', 'claimSlot', 'releaseSlot', 'researchAndPropose', 'curate', 'prepareEnrichedEval', 'applyMerge', 'evalArtifactExists', 'hashProposal', 'claimAdvisorySlot', 'researchAndProposeAdvisory', 'crossReview', 'reviseProposal']) {
    assert.strictEqual(typeof deps[fn], 'function', `deps.${fn} is a function`);
  }
});

console.log('4. text-capture revise (sandboxed advisory) — capture stdout, write proposal, hash-changed');
check('sandboxed reviser captures the emitted document (preamble stripped) and reports changed', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'panel-revise-'));
  fs.mkdirSync(path.join(root, 'prompts'), { recursive: true });
  fs.writeFileSync(path.join(root, 'prompts', 'skill-audit-loop-revise-pass.md'), '# revise template stub\n');
  const skillDir = path.join(root, 'skills', 's');
  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), '---\nname: s\n---\n# s\nbody\n');
  const runDir = path.join(root, '.opencode', 'progress', 'agenttool', 's', 'minimax');
  fs.mkdirSync(runDir, { recursive: true });
  const ownProposalPath = path.join(runDir, 's.minimax.proposed-SKILL.md');
  fs.writeFileSync(ownProposalPath, '---\nname: s\n---\n# s\nOLD proposal\n');
  const revisedDoc = `---\nname: s\nschema_version: 8\n---\n# s — revised\n\n${'## Section\n\nEnriched content here. '.repeat(40)}`;
  let dispatchedMode = null;
  const deps = live.createSkillAuditLoopDeps({
    skillGraphRoot: root,
    advisoryDispatch: ({ mode }) => { dispatchedMode = mode; return { ok: true, stdout: `Here is the revised skill:\n\n${revisedDoc}`, stderr: '' }; },
  });
  const before = deps.hashProposal(ownProposalPath);
  const rv = deps.reviseProposal({ skill: 's', skillDir, reviserModel: 'minimax', reviserTier: 'advisory', ownProposalPath, feedbackForMe: [{ items: [{ kind: 'missing', note: 'x' }] }], round: 2, artifactsDir: runDir });
  assert.strictEqual(rv.ok, true);
  assert.strictEqual(dispatchedMode, 'text', 'sandboxed revise dispatched in TEXT mode (not write)');
  assert.strictEqual(rv.changed, true, 'reports changed via hash');
  const written = fs.readFileSync(ownProposalPath, 'utf8');
  assert.ok(written.startsWith('---\nname: s'), 'captured document written with preamble stripped');
  assert.ok(!/Here is the revised skill/.test(written), 'the "Here is…" preamble is NOT in the proposal');
  assert.notStrictEqual(deps.hashProposal(ownProposalPath), before, 'hash moved');
  fs.rmSync(root, { recursive: true, force: true });
});
check('sandboxed reviser that emits no usable document leaves the proposal byte-identical', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'panel-revise-'));
  fs.mkdirSync(path.join(root, 'prompts'), { recursive: true });
  fs.writeFileSync(path.join(root, 'prompts', 'skill-audit-loop-revise-pass.md'), '# revise template stub\n');
  const skillDir = path.join(root, 'skills', 's');
  fs.mkdirSync(skillDir, { recursive: true });
  const runDir = path.join(root, '.opencode', 'progress', 'agenttool', 's', 'minimax');
  fs.mkdirSync(runDir, { recursive: true });
  const ownProposalPath = path.join(runDir, 's.minimax.proposed-SKILL.md');
  fs.writeFileSync(ownProposalPath, '---\nname: s\n---\n# s\nKEPT\n');
  const before = fs.readFileSync(ownProposalPath, 'utf8');
  const deps = live.createSkillAuditLoopDeps({
    skillGraphRoot: root,
    advisoryDispatch: () => ({ ok: true, stdout: 'I think this looks good, no changes needed.', stderr: '' }),
  });
  const rv = deps.reviseProposal({ skill: 's', skillDir, reviserModel: 'minimax', reviserTier: 'advisory', ownProposalPath, feedbackForMe: [{ items: [{ kind: 'keep' }] }], round: 2, artifactsDir: runDir });
  assert.strictEqual(rv.changed, false, 'no usable document => unchanged');
  assert.strictEqual(fs.readFileSync(ownProposalPath, 'utf8'), before, 'proposal byte-identical');
  fs.rmSync(root, { recursive: true, force: true });
});

console.log('SKI-251. looksLikeSkillDoc — write-path acceptance requires a real SKILL.md identity');
check('a real SKILL.md (frontmatter + non-empty name) is accepted', () => {
  const doc = `---\nname: my-skill\ndescription: does a thing\n---\n# My Skill\n${'x'.repeat(500)}`;
  assert.strictEqual(live.looksLikeSkillDoc(doc), true);
});
check('a plan wrapped in stray frontmatter (no name) is REJECTED (SKI-251 hole closed)', () => {
  const doc = `---\nstatus: draft\nnotes: here is my plan\n---\n${'I will analyze then act. '.repeat(40)}`;
  assert.strictEqual(live.looksLikeSkillDoc(doc), false);
});
check('frontmatter with an empty name is rejected', () => {
  const doc = `---\nname:   \ndescription: x\n---\n# Body\n${'x'.repeat(500)}`;
  assert.strictEqual(live.looksLikeSkillDoc(doc), false);
});
check('a substantial no-frontmatter doc still passes via the heading fallback', () => {
  const doc = `# A\n## B\n### C\n#### D\n## E\n${'y'.repeat(2000)}`;
  assert.strictEqual(live.looksLikeSkillDoc(doc), true);
});
check('a short prose plan passes neither path', () => {
  assert.strictEqual(live.looksLikeSkillDoc('Here is my plan: do X then Y.'), false);
});

console.log(`\nResults: ${passed} passed, 0 failed`);
