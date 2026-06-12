'use strict';

// Unit test: the LIVE production deps for the bidirectional ENRICH orchestrator
// (lib/audit/skill-audit-loop-lite-deps.js). Covers the pure seams (arg builders, claim-output
// parser, prompt assembly, proposal paths) AND a full DRY-RUN through the real
// orchestrator (runSkillAuditLoopLite) in a temp dir — proving the wiring path
// (claim → propose → curate → anti-loss → keep) without dispatching any LLM or
// mutating a real SKILL.md. The live multi-model pilot verifies the actual dispatch.

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const d = require('../../lib/audit/skill-audit-loop-lite-deps');
const { runSkillAuditLoopLite } = require('../../lib/audit/run-skill-audit-loop-lite');

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log(`  PASS    ${name}`);
}

console.log('1. Pure seams — claim args + parsing');
check('buildClaimArgs defaults a per-model PROPOSE slot to the AUDIT op, not merge (SH-6687)', () => {
  assert.deepStrictEqual(
    d.buildClaimArgs({ skill: 'debugging', model: 'opus' }),
    ['claim', 'debugging', '--op', 'audit', '--json', '--model', 'opus'],
  );
});
check('buildClaimArgs honors an explicit merge op for the curator (SH-6687)', () => {
  assert.deepStrictEqual(
    d.buildClaimArgs({ skill: 'debugging', model: 'opus', op: 'merge' }),
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
  const out = '{"claimed":"k","by":"agent","op":"merge","run_id":"r1","model":"opus","audit_run_dir":"skill-graph/skill-audit-loop/progress/skill-audits/x/runs/r1"}';
  assert.deepStrictEqual(d.parseClaimOutput(out), { run_id: 'r1', artifactsDir: 'skill-graph/skill-audit-loop/progress/skill-audits/x/runs/r1' });
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
  const pp = d.proposalPaths('/run', 'debugging', 'gpt-5.5');
  assert.strictEqual(pp.proposalPath, path.join('/run', 'debugging.gpt-5.5.proposed-SKILL.md'));
  assert.strictEqual(pp.noveltyMemoPath, path.join('/run', 'debugging.gpt-5.5.novelty-memo.md'));
  const mp = d.mergePaths('/run', 'debugging');
  assert.strictEqual(mp.mergedSkillPath, path.join('/run', 'debugging.merged-SKILL.md'));
  assert.strictEqual(mp.mergeLedgerPath, path.join('/run', 'debugging.merge-ledger.json'));
});
check('cliForModel routes through the model registry', () => {
  assert.strictEqual(d.cliForModel('gpt-5.5'), 'codex');
  assert.strictEqual(d.cliForModel('gpt-5.4'), 'codex');
  assert.strictEqual(d.cliForModel('opus'), 'claude');
  assert.strictEqual(d.cliForModel('sonnet'), 'claude');
  assert.strictEqual(d.cliForModel('minimax'), 'opencode');
  assert.strictEqual(d.cliForModel('deepseek-flash'), 'opencode');
  assert.strictEqual(d.cliForModel('mimo'), 'opencode');
  assert.strictEqual(d.cliForModel('gemini'), 'gemini');
});
check('claude enrich args are write-capable (bypassPermissions)', () => {
  const a = d.buildClaudeEnrichArgs('PROMPT', { model: 'opus' });
  assert.ok(a.includes('--permission-mode'));
  assert.strictEqual(a[a.indexOf('--permission-mode') + 1], 'bypassPermissions');
  assert.ok(a.includes('-p') && a.includes('PROMPT'));
});
check('codex enrich args use workspace-write sandbox + narrow extra writable root', () => {
  const a = d.buildCodexEnrichArgs('PROMPT');
  assert.ok(a.includes('workspace-write'));
  assert.ok(a.includes('--skip-git-repo-check'));
  assert.strictEqual(a[a.length - 1], 'PROMPT');
  // No writableRoots => no -c flag.
  assert.ok(!a.includes('-c'));
  // With a writable root => an explicit sandbox_workspace_write config naming ONLY it.
  const b = d.buildCodexEnrichArgs('PROMPT', { writableRoots: ['/ws/skill-graph/skill-audit-loop/progress/skill-audits/s/runs/r1'] });
  const ci = b.indexOf('-c');
  assert.ok(ci !== -1);
  assert.match(b[ci + 1], /sandbox_workspace_write=\{writable_roots=\["\/ws\/skill-graph\/skill-audit-loop\/progress\/skill-audits\/s\/runs\/r1"\]\}/);
});
check('buildEnrichPrompt names the exact output paths + private-content scope via template', () => {
  const p = d.buildEnrichPrompt({ template: 'TEMPLATE', skill: 's', skillDir: '/s', model: 'opus', brief: 'B', proposalPath: '/r/p.md', noveltyMemoPath: '/r/m.md' });
  assert.ok(p.includes('TEMPLATE'));
  assert.ok(p.includes('/r/p.md') && p.includes('/r/m.md'));
  assert.ok(p.includes('Your model role: opus'));
});
check('buildEnrichPrompt embeds the current SKILL.md so cross-tree FS access is unnecessary', () => {
  const p = d.buildEnrichPrompt({ template: 'T', skill: 's', skillDir: '/s', model: 'gpt-5.5', brief: 'B', skillBody: '# THE SKILL BODY', proposalPath: '/r/p.md', noveltyMemoPath: '/r/m.md' });
  assert.ok(p.includes('# THE SKILL BODY'));
  assert.ok(/embedded/i.test(p));
  // No skillBody => no embedded block.
  const p2 = d.buildEnrichPrompt({ template: 'T', skill: 's', skillDir: '/s', model: 'opus', brief: 'B', proposalPath: '/r/p.md', noveltyMemoPath: '/r/m.md' });
  assert.ok(!/embedded/i.test(p2));
});
check('buildCuratePrompt forbids "did not move a score" drops + names ledger path', () => {
  const p = d.buildCuratePrompt({
    skill: 's',
    proposals: [{ model: 'opus', proposalPath: '/r/a', noveltyMemoPath: '/r/an' }],
    advisoryProposals: [{ model: 'gemini', proposalPath: '/r/g', noveltyMemoPath: '/r/gn', iterationSuggestionsPath: '/r/g.iteration-suggestions.json' }],
    currentSkillPath: '/s/SKILL.md',
    mergedSkillPath: '/r/m.md',
    mergeLedgerPath: '/r/l.json',
    mergeProtocolRef: 'P',
  });
  assert.ok(/did not move a score/i.test(p));
  assert.ok(p.includes('/r/l.json'));
  assert.ok(p.includes('/r/g.iteration-suggestions.json'));
  assert.ok(/iteration-suggestions files are first-class advisory input/i.test(p));
  assert.ok(p.includes('UNION'));
  // B7: with no verify gaps, no verification block is rendered.
  assert.ok(!/MANDATORY VERIFICATION GAPS/.test(p), 'no verify-gap block when verifyGaps empty');
});
check('B7: buildCuratePrompt renders verifyGaps in a DISTINCT block, not cross-review', () => {
  const gaps = [{ verifier: 'opus', round: 1, item: 'claim X lacks evidence', evidence: 'f.js:1', required_action: 'drop or evidence it' }];
  const p = d.buildCuratePrompt({
    skill: 's', proposals: [{ model: 'opus', proposalPath: '/r/a', noveltyMemoPath: '/r/an' }],
    crossReview: [], verifyGaps: gaps,
    currentSkillPath: '/s/SKILL.md', mergedSkillPath: '/r/m.md', mergeLedgerPath: '/r/l.json', mergeProtocolRef: 'P',
  });
  assert.ok(/MANDATORY VERIFICATION GAPS \(Phase 3.1\)/.test(p), 'verify gaps get their own labeled block');
  assert.ok(p.includes('claim X lacks evidence') && p.includes('"verifier": "opus"'), 'gap content + typed shape rendered');
  // The block is distinct from cross-review and from the merge-ledger shape line.
  const verifyIdx = p.indexOf('MANDATORY VERIFICATION GAPS');
  const crossIdx = p.indexOf('Cross-review feedback to consider');
  assert.ok(crossIdx !== -1 && verifyIdx > crossIdx, 'verify block follows the cross-review block, not merged into it');
});
check('model dispatch uses injected model cwd and scratch env, not the claim cwd/env', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'enrich-model-env-'));
  const modelCwd = path.join(tmp, 'public-skill-graph');
  const skillDir = path.join(tmp, 'skills', 'demo-skill');
  const runDir = path.join(tmp, 'skill-audit-loop', 'progress', 'skill-audits', 'demo-skill', 'runs', 'r1');
  fs.mkdirSync(modelCwd, { recursive: true });
  fs.mkdirSync(skillDir, { recursive: true });
  fs.mkdirSync(runDir, { recursive: true });
  fs.mkdirSync(path.join(tmp, 'prompts'), { recursive: true });
  fs.writeFileSync(path.join(tmp, 'prompts', 'skill-audit-loop-improve-pass.md'), '```\nENRICH TEMPLATE\n```\n');
  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), '---\nname: demo-skill\npublic: true\n---\n# Demo\n');
  const seen = [];
  const deps = d.createSkillAuditLoopLiteDeps({
    skillGraphRoot: tmp,
    workspaceRoot: tmp,
    modelCwd,
    modelEnv: { HOME: '/tmp/model-home', CODEX_HOME: '/tmp/model-home/.codex' },
    dispatch: ({ cli, args, cwd, env }) => {
      seen.push({ cli, cwd, home: env && env.HOME, codexHome: env && env.CODEX_HOME });
      const text = args.join('\n');
      const pm = text.match(/(\S+\.proposed-SKILL\.md)/);
      const nm = text.match(/(\S+\.novelty-memo\.md)/);
      if (pm) fs.writeFileSync(pm[1], '# proposal\n');
      if (nm) fs.writeFileSync(nm[1], '# memo\n');
      return '';
    },
  });
  deps.researchAndPropose({ skill: 'demo-skill', skillDir, model: 'gpt-5.5', brief: 'B', artifactsDir: runDir });
  assert.strictEqual(seen.length, 1);
  assert.strictEqual(seen[0].cli, 'codex');
  assert.strictEqual(seen[0].cwd, modelCwd);
  assert.strictEqual(seen[0].home, '/tmp/model-home');
  assert.strictEqual(seen[0].codexHome, '/tmp/model-home/.codex');
  fs.rmSync(tmp, { recursive: true, force: true });
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

  const deps = d.createSkillAuditLoopLiteDeps({ skillGraphRoot: tmp, workspaceRoot: tmp, dryRun: true });
  const result = runSkillAuditLoopLite({ skill, skillDir, cwd: tmp, deps });

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
  assert.strictEqual(result.objective, 'skill-audit-loop');
  // SH-6686: a dry-run NEVER mutates the canonical SKILL.md — applyMerge no-ops, so the
  // file is byte-identical and `applied` is false even though the decision was KEEP.
  assert.strictEqual(result.applied, false);
  assert.strictEqual(fs.readFileSync(canonical, 'utf8'), ORIGINAL, 'canonical SKILL.md unchanged in dry-run');

  fs.rmSync(tmp, { recursive: true, force: true });
});

console.log('5. Claim ops — per-model PROPOSE = audit, curator = merge, distinct owners (SH-6687)');
check('claimSlot claims --op audit per model; curate claims --op merge with a distinct AGENT_ID', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'enrich-claim-'));
  const skill = 'demo-skill';
  const skillDir = path.join(tmp, 'skills', skill);
  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), '---\nname: demo-skill\npublic: true\n---\n# Demo\n');
  // The live researchAndPropose loads the enrich-pass template from <root>/prompts/.
  fs.mkdirSync(path.join(tmp, 'prompts'), { recursive: true });
  fs.writeFileSync(path.join(tmp, 'prompts', 'skill-audit-loop-improve-pass.md'), '```\nENRICH TEMPLATE\n```\n');

  const claims = [];
  const releases = [];
  // Stub dispatch: emulate the claim CLI + the model writing its artifacts (parsed
  // from the prompt) so the live (non-dry) path completes without any real CLI.
  function stubDispatch({ cli, args, env }) {
    const isClaimScript = cli === 'node' && args.some((a) => /skill-audit-claim/.test(a));
    if (isClaimScript && args.includes('claim')) {
      const op = args[args.indexOf('--op') + 1];
      claims.push({ op, agentId: env.AGENT_ID, model: env.MODEL });
      const runDir = path.join('skill-graph', 'skill-audit-loop', 'progress', 'skill-audits', skill, 'runs', `${op}-${env.MODEL || 'x'}`);
      fs.mkdirSync(path.join(tmp, runDir), { recursive: true });
      return JSON.stringify({ claimed: 'k', run_id: `r-${op}`, audit_run_dir: runDir });
    }
    if (isClaimScript && args.includes('release')) { releases.push({ agentId: env.AGENT_ID }); return 'RELEASED'; }
    // A model dispatch (claude/codex): write whatever artifact paths the prompt names.
    const text = args.join('\n');
    for (const re of [/(\S+\.proposed-SKILL\.md)/, /(\S+\.novelty-memo\.md)/, /(\S+\.merged-SKILL\.md)/]) {
      const m = text.match(re); if (m) { fs.mkdirSync(path.dirname(m[1]), { recursive: true }); fs.writeFileSync(m[1], '# stub\n'); }
    }
    const lm = text.match(/(\S+\.merge-ledger\.json)/);
    if (lm) { fs.mkdirSync(path.dirname(lm[1]), { recursive: true }); fs.writeFileSync(lm[1], JSON.stringify({ curator: 'opus', contributions: [{ id: 1, surfaced_by: 'opus', disposition: 'kept' }] })); }
    return '';
  }

  // SKI-230: inject a fixed runToken so the run-scoped AGENT_IDs are deterministic in-test.
  const deps = d.createSkillAuditLoopLiteDeps({ skillGraphRoot: tmp, workspaceRoot: tmp, dryRun: false, dispatch: stubDispatch, runToken: 'TEST' });
  const s1 = deps.claimSlot({ skill, model: 'opus' });
  deps.researchAndPropose({ skill, skillDir, model: 'opus', brief: 'B', artifactsDir: s1.artifactsDir });
  deps.releaseSlot({ skill, model: 'opus', status: 'completed' });
  const s2 = deps.claimSlot({ skill, model: 'gpt-5.5' });
  deps.researchAndPropose({ skill, skillDir, model: 'gpt-5.5', brief: 'B', artifactsDir: s2.artifactsDir });
  deps.releaseSlot({ skill, model: 'gpt-5.5', status: 'completed' });
  const merge = deps.curate({ skill, skillDir, proposals: [{ model: 'opus', proposalPath: path.join(s1.artifactsDir, `${skill}.opus.proposed-SKILL.md`), noveltyMemoPath: 'n' }], currentSkillPath: path.join(skillDir, 'SKILL.md') });

  // The two per-model PROPOSE slots claimed AUDIT (not merge); the curator claimed MERGE.
  const proposeClaims = claims.filter((c) => c.op === 'audit');
  const mergeClaims = claims.filter((c) => c.op === 'merge');
  assert.strictEqual(proposeClaims.length, 2, 'two per-model audit claims');
  assert.deepStrictEqual(proposeClaims.map((c) => c.model).sort(), ['gpt-5.5', 'opus']);
  assert.strictEqual(mergeClaims.length, 1, 'one curator merge claim');
  // SKI-230: the per-model + curator owners are RUN-SCOPED (suffixed with the runToken) so a
  // killed run's orphaned slot cannot block a later run via the one-skill-per-agent guard.
  assert.strictEqual(mergeClaims[0].agentId, 'skill-audit-loop-curator-TEST');
  assert.deepStrictEqual(proposeClaims.map((c) => c.agentId).sort(), ['curate-gpt-5.5-TEST', 'curate-opus-TEST'],
    'per-model PROPOSE owners are run-scoped (curate-<model>-<runToken>)');
  assert.ok(!proposeClaims.some((c) => c.agentId.startsWith('skill-audit-loop-curator')), 'propose slots are not the curator owner');
  // The curator lock was released (finally block) under the SAME run-scoped owner.
  assert.ok(releases.some((r) => r.agentId === 'skill-audit-loop-curator-TEST'), 'curator lock released under its run-scoped owner');
  assert.ok(fs.existsSync(merge.mergeLedgerPath));

  fs.rmSync(tmp, { recursive: true, force: true });
});

console.log('6. applyMerge atomicity (B1) — merged bytes land via rename, no orphan temp');
check('applyMerge writes merged content via .tmp+rename and leaves no .tmp behind', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'enrich-apply-'));
  const skill = 'demo-skill';
  const skillDir = path.join(tmp, 'skills', skill);
  fs.mkdirSync(skillDir, { recursive: true });
  const canonical = path.join(skillDir, 'SKILL.md');
  fs.writeFileSync(canonical, '---\nname: demo-skill\n---\n# Demo\nORIGINAL body.\n');
  const merged = path.join(tmp, 'merged-SKILL.md');
  const MERGED = '---\nname: demo-skill\npublic: true\n---\n# Demo\nMERGED enriched body.\n';
  fs.writeFileSync(merged, MERGED);

  const deps = d.createSkillAuditLoopLiteDeps({ skillGraphRoot: tmp, workspaceRoot: tmp, dryRun: false, dispatch: () => '' });
  const res = deps.applyMerge({ skill, skillDir, mergedSkillPath: merged });

  // The merged bytes are now the canonical content.
  assert.strictEqual(res.applied, canonical, 'applyMerge reports the canonical path');
  assert.strictEqual(fs.readFileSync(canonical, 'utf8'), MERGED, 'canonical replaced with merged bytes');
  // No orphan temp file is left in the skill dir (atomic rename consumed it).
  assert.ok(!fs.existsSync(`${canonical}.tmp`), 'no orphan SKILL.md.tmp remains');
  assert.deepStrictEqual(
    fs.readdirSync(skillDir).filter((f) => f.endsWith('.tmp')),
    [],
    'no .tmp siblings remain in the skill dir',
  );
  // The atomic-write source (merged) is untouched — applyMerge copies, never moves it.
  assert.strictEqual(fs.readFileSync(merged, 'utf8'), MERGED, 'merged source preserved');

  fs.rmSync(tmp, { recursive: true, force: true });
});

console.log(`\nResults: ${passed} passed, 0 failed`);
