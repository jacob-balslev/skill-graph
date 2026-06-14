'use strict';

// Unit test: the eval baseline-arm answer-key fence (plan E).
//
// Covers (1) the pure fence predicate/assertion (lib/audit/baseline-fence.js) and
// (2) the prepareCandidateEval baseline-twin production (lib/audit/skill-audit-loop-lite-deps.js):
// the baseline arm must run in a working dir that does NOT contain the candidate
// SKILL.md, while research tools stay ON. The fence is enforced ONLY when tools are
// ON (a tools-OFF baseline has no filesystem access — vacuously safe).

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  candidateSkillPath,
  candidateInsideWorkspace,
  assertBaselineSkillAbsent,
} = require('../../lib/audit/baseline-fence');
const d = require('../../lib/audit/skill-audit-loop-lite-deps');

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log(`  PASS    ${name}`);
}

console.log('1. Pure predicate — candidateInsideWorkspace');
check('candidate SKILL.md inside the workspace subtree is detected', () => {
  const ws = '/repo';
  assert.strictEqual(candidateInsideWorkspace(ws, '/repo/skills/foo'), true);
  assert.strictEqual(candidateInsideWorkspace(ws, '/repo'), true); // <ws>/SKILL.md
});
check('candidate in a sibling / temp dir is NOT inside the workspace', () => {
  assert.strictEqual(candidateInsideWorkspace('/repo', '/other/skills/foo'), false);
  assert.strictEqual(candidateInsideWorkspace('/repo', '/tmp/curated-x/foo'), false);
});
check('candidateSkillPath resolves <skillDir>/SKILL.md', () => {
  assert.strictEqual(candidateSkillPath('/a/b'), path.resolve('/a/b/SKILL.md'));
});

console.log('2. Assertion — enforced only when tools are ON');
check('tools-OFF baseline never throws (no filesystem access)', () => {
  assert.doesNotThrow(() => assertBaselineSkillAbsent({
    baselineWorkspace: '/repo', skillDir: '/repo/skills/foo', skillName: 'foo', allowTools: false,
  }));
});
check('tools-ON baseline throws when the candidate is reachable', () => {
  assert.throws(
    () => assertBaselineSkillAbsent({
      baselineWorkspace: '/repo', skillDir: '/repo/skills/foo', skillName: 'foo', allowTools: true,
    }),
    /Baseline eval-arm fence violated/,
  );
});
check('tools-ON baseline passes when the candidate is fenced out (sibling/temp dir)', () => {
  assert.doesNotThrow(() => assertBaselineSkillAbsent({
    baselineWorkspace: '/repo', skillDir: '/tmp/curated-x/foo', skillName: 'foo', allowTools: true,
  }));
});

console.log('3. prepareCandidateEval — produces a skill-ABSENT baseline twin');
check('baselineEvalSkillDir exists, lacks SKILL.md; evalSkillDir has the curated SKILL.md', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fence-prep-'));
  const skill = 'demo-skill';
  const skillDir = path.join(tmp, 'skills', skill);
  fs.mkdirSync(path.join(skillDir, 'references'), { recursive: true });
  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), '---\nname: demo-skill\n---\n# Demo (canonical)\n');
  fs.writeFileSync(path.join(skillDir, 'references', 'note.md'), 'research material\n');
  const mergedSkillPath = path.join(tmp, 'demo-skill.merged-SKILL.md');
  fs.writeFileSync(mergedSkillPath, '---\nname: demo-skill\n---\n# Demo (CURATED)\n');

  const deps = d.createSkillAuditLoopLiteDeps({ skillGraphRoot: tmp, workspaceRoot: tmp, dryRun: true });
  const prepared = deps.prepareCandidateEval({ skill, skillDir, mergedSkillPath });

  // with-skill arm dir has the curated SKILL.md
  assert.ok(fs.existsSync(prepared.evalSkillDir), 'evalSkillDir exists');
  assert.ok(fs.existsSync(path.join(prepared.evalSkillDir, 'SKILL.md')), 'evalSkillDir has SKILL.md');
  assert.match(fs.readFileSync(path.join(prepared.evalSkillDir, 'SKILL.md'), 'utf8'), /CURATED/);

  // baseline arm dir EXISTS, keeps research material, but has NO SKILL.md (the answer key)
  assert.ok(prepared.baselineEvalSkillDir, 'baselineEvalSkillDir returned');
  assert.ok(fs.existsSync(prepared.baselineEvalSkillDir), 'baselineEvalSkillDir exists');
  assert.ok(!fs.existsSync(path.join(prepared.baselineEvalSkillDir, 'SKILL.md')), 'baseline dir has NO SKILL.md');
  assert.ok(fs.existsSync(path.join(prepared.baselineEvalSkillDir, 'references', 'note.md')), 'baseline dir keeps research material');

  prepared.cleanup();
  assert.ok(!fs.existsSync(prepared.evalSkillDir), 'cleanup removes the temp root');
  fs.rmSync(tmp, { recursive: true, force: true });
});

console.log(`\n${passed} passed`);
