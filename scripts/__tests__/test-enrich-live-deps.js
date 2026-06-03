'use strict';

// Unit test: the LIVE production deps for the bidirectional ENRICH orchestrator
// (lib/audit/enrich-live-deps.js). Covers the pure seams (arg builders, claim-output
// parser, prompt assembly, proposal paths) AND a full DRY-RUN through the real
// orchestrator (runBidirectionalEnrich) in a temp dir — proving the wiring path
// (claim → propose → curate → anti-loss → keep) without dispatching any LLM or
// mutating a real SKILL.md. The live multi-model pilot verifies the actual dispatch.

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const d = require('../../lib/audit/enrich-live-deps');
const { runBidirectionalEnrich } = require('../../lib/audit/run-bidirectional-enrich');

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log(`  PASS    ${name}`);
}

console.log('1. Pure seams — claim args + parsing');
check('buildClaimArgs builds a merge claim with --json', () => {
  assert.deepStrictEqual(
    d.buildClaimArgs({ skill: 'debugging', model: 'opus' }),
    ['claim', 'debugging', '--op', 'merge', '--json', '--model', 'opus'],
  );
});
check('buildClaimArgs requires a skill', () => {
  assert.throws(() => d.buildClaimArgs({ model: 'opus' }), /skill is required/);
});
check('buildReleaseArgs defaults to completed', () => {
  assert.deepStrictEqual(d.buildReleaseArgs({ skill: 'x', model: 'opus' }), ['release', 'x', '--status', 'completed', '--model', 'opus']);
});
check('parseClaimOutput extracts run_id + audit_run_dir', () => {
  const out = '{"claimed":"k","by":"agent","op":"merge","run_id":"r1","model":"opus","audit_run_dir":".opencode/progress/skill-audits/x/runs/r1"}';
  assert.deepStrictEqual(d.parseClaimOutput(out), { run_id: 'r1', artifactsDir: '.opencode/progress/skill-audits/x/runs/r1' });
});
check('parseClaimOutput throws on a refused claim', () => {
  assert.throws(() => d.parseClaimOutput('{"claimed":false,"reason":"lane full"}'), /claim refused/);
});
check('parseClaimOutput throws on empty / non-JSON output', () => {
  assert.throws(() => d.parseClaimOutput(''), /empty claim output/);
  assert.throws(() => d.parseClaimOutput('no json here'), /no JSON object/);
});

console.log('2. Pure seams — paths + CLI routing + prompt assembly');
check('proposalPaths + mergePaths follow the enrich-pass naming', () => {
  const pp = d.proposalPaths('/run', 'debugging', 'codex-current');
  assert.strictEqual(pp.proposalPath, path.join('/run', 'debugging.codex-current.proposed-SKILL.md'));
  assert.strictEqual(pp.noveltyMemoPath, path.join('/run', 'debugging.codex-current.novelty-memo.md'));
  const mp = d.mergePaths('/run', 'debugging');
  assert.strictEqual(mp.mergedSkillPath, path.join('/run', 'debugging.merged-SKILL.md'));
  assert.strictEqual(mp.mergeLedgerPath, path.join('/run', 'debugging.merge-ledger.json'));
});
check('cliForModel routes codex-current/gpt to codex, opus to claude', () => {
  assert.strictEqual(d.cliForModel('codex-current'), 'codex');
  assert.strictEqual(d.cliForModel('gpt-5.4'), 'codex');
  assert.strictEqual(d.cliForModel('opus'), 'claude');
  assert.strictEqual(d.cliForModel('sonnet'), 'claude');
});
check('claude enrich args are write-capable (bypassPermissions)', () => {
  const a = d.buildClaudeEnrichArgs('PROMPT', { model: 'opus' });
  assert.ok(a.includes('--permission-mode'));
  assert.strictEqual(a[a.indexOf('--permission-mode') + 1], 'bypassPermissions');
  assert.ok(a.includes('-p') && a.includes('PROMPT'));
});
check('codex enrich args use workspace-write sandbox', () => {
  const a = d.buildCodexEnrichArgs('PROMPT');
  assert.ok(a.includes('workspace-write'));
  assert.ok(a.includes('--skip-git-repo-check'));
  assert.strictEqual(a[a.length - 1], 'PROMPT');
});
check('buildEnrichPrompt names the exact output paths + private-content scope via template', () => {
  const p = d.buildEnrichPrompt({ template: 'TEMPLATE', skill: 's', skillDir: '/s', model: 'opus', brief: 'B', proposalPath: '/r/p.md', noveltyMemoPath: '/r/m.md' });
  assert.ok(p.includes('TEMPLATE'));
  assert.ok(p.includes('/r/p.md') && p.includes('/r/m.md'));
  assert.ok(p.includes('Your model role: opus'));
});
check('buildCuratePrompt forbids "did not move a score" drops + names ledger path', () => {
  const p = d.buildCuratePrompt({ skill: 's', proposals: [{ model: 'opus', proposalPath: '/r/a', noveltyMemoPath: '/r/an' }], currentSkillPath: '/s/SKILL.md', mergedSkillPath: '/r/m.md', mergeLedgerPath: '/r/l.json', mergeProtocolRef: 'P' });
  assert.ok(/did not move a score/i.test(p));
  assert.ok(p.includes('/r/l.json'));
  assert.ok(p.includes('UNION'));
});

console.log('3. resolveWorkspaceRoot');
check('defaults to the parent of skillGraphRoot, honors override', () => {
  assert.strictEqual(d.resolveWorkspaceRoot({ skillGraphRoot: '/a/b/skill-graph' }), path.resolve('/a/b'));
  assert.strictEqual(d.resolveWorkspaceRoot({ workspaceRoot: '/custom' }), path.resolve('/custom'));
});

console.log('4. DRY-RUN — full orchestrator wiring path offline (no LLM, no real SKILL.md)');
check('dry-run runs claim → propose(both) → curate → anti-loss → keep', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'enrich-dry-'));
  const skill = 'demo-skill';
  const skillDir = path.join(tmp, 'skills', skill);
  fs.mkdirSync(skillDir, { recursive: true });
  const canonical = path.join(skillDir, 'SKILL.md');
  const ORIGINAL = '---\nname: demo-skill\n---\n# Demo\nBody.\n';
  fs.writeFileSync(canonical, ORIGINAL);

  const deps = d.createLiveEnrichDeps({ skillGraphRoot: tmp, workspaceRoot: tmp, dryRun: true });
  const result = runBidirectionalEnrich({ skill, skillDir, cwd: tmp, deps });

  // Both frontier models produced a proposal.
  assert.strictEqual(result.proposals.length, 2);
  for (const p of result.proposals) {
    assert.ok(fs.existsSync(p.proposalPath), `proposal exists: ${p.proposalPath}`);
    assert.ok(fs.existsSync(p.noveltyMemoPath), `novelty memo exists: ${p.noveltyMemoPath}`);
  }
  // Curator produced a merged skill + an anti-loss-clean ledger (both contributions kept).
  assert.ok(fs.existsSync(result.merge.mergedSkillPath));
  assert.ok(fs.existsSync(result.merge.mergeLedgerPath));
  assert.strictEqual(result.merge.anti_loss.ok, true);
  assert.strictEqual(result.merge.anti_loss.kept, 2);
  // No eval runner injected in dry-run ⇒ keep, eval deferred.
  assert.strictEqual(result.eval, null);
  assert.strictEqual(result.keep_or_revert.keep, true);
  assert.strictEqual(result.objective, 'enrich');
  // SH-6686: a dry-run NEVER mutates the canonical SKILL.md — applyMerge no-ops, so the
  // file is byte-identical and `applied` is false even though the decision was KEEP.
  assert.strictEqual(result.applied, false);
  assert.strictEqual(fs.readFileSync(canonical, 'utf8'), ORIGINAL, 'canonical SKILL.md unchanged in dry-run');

  fs.rmSync(tmp, { recursive: true, force: true });
});

console.log(`\nResults: ${passed} passed, 0 failed`);
