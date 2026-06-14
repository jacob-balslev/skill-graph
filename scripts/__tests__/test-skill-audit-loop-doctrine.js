'use strict';

// Unit tests that active docs and prompts keep the current Skill Audit Loop
// doctrine instead of reverting to retired lifecycle or verdict wording.

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..', '..');
const workspace = path.resolve(repo, '..');
const lifecycle = 'Read → Verify → Evaluate → Research → Improve → Use → Evaluate → Grade';

const activeDocs = [
  path.join(repo, 'skill-audit-loop/SKILL_AUDIT_LOOP.md'),
  path.join(repo, 'skill-audit-loop/README.md'),
  path.join(repo, 'docs/skill-audit-loop-executable-map.md'),
  path.join(repo, 'AGENTS.md'),
  path.join(repo, 'README.md'),
  path.join(repo, 'commands/audit/audit.md'),
  path.join(repo, 'commands/audit/improve.md'),
  path.join(repo, 'commands/audit/evolve.md'),
  path.join(repo, 'prompts/skill-audit-loop-single-model.md'),
  path.join(repo, 'prompts/skill-audit-loop-minimal-iteration.md'),
  path.join(repo, 'prompts/skill-audit-loop-batch-worker-v4.md'),
  path.join(repo, 'prompts/skill-audit-loop-codex-autonomous-v5.md'),
  path.join(workspace, 'SKILL-SYSTEM-CHEAT-SHEET.md'),
  path.join(workspace, 'docs/reference/skill-audit-pipeline.md'),
  path.join(workspace, '.claude/commands/audit/audit.md'),
  path.join(workspace, '.claude/commands/audit/improve.md'),
  path.join(workspace, '.claude/commands/audit/evolve.md'),
  path.join(workspace, '.opencode/commands/skill-audit-loop.md'),
  path.join(workspace, '.opencode/commands/audit-skill.md'),
].filter((p) => fs.existsSync(p));

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log(`  PASS    ${name}`);
}

check('canonical docs name the eight-step Skill Audit Loop lifecycle', () => {
  for (const rel of [
    'skill-audit-loop/SKILL_AUDIT_LOOP.md',
    'skill-audit-loop/README.md',
    'docs/skill-audit-loop-executable-map.md',
    'AGENTS.md',
    'README.md',
  ]) {
    const file = path.join(repo, rel);
    assert.ok(read(file).includes(lifecycle), `${rel} must include ${lifecycle}`);
  }
});

check('active docs no longer teach the old read-fix-test-next lifecycle', () => {
  const stale = /read\s*→\s*fix\s*→\s*test\s*→\s*next/i;
  for (const file of activeDocs) {
    assert.ok(!stale.test(read(file)), `${path.relative(workspace, file)} still uses old lifecycle wording`);
  }
});

check('audit --graded is report-only for behavior verdicts', () => {
  const stalePatterns = [
    /\+ `comprehension_verdict`, `application_verdict`/,
    /with `--graded`, also behavior verdicts/i,
    /audit --graded[\s\S]{0,120}(writes?|stamps?)[\s\S]{0,80}(?:also|\+)[\s\S]{0,80}(comprehension_verdict|application_verdict)/i,
    /only `--graded`[\s\S]{0,80}(comprehension_verdict|application_verdict)/i,
  ];
  for (const file of activeDocs) {
    const text = read(file);
    for (const pattern of stalePatterns) {
      assert.ok(!pattern.test(text), `${path.relative(workspace, file)} still claims audit --graded writes behavior`);
    }
  }
});

check('runner prompts do not self-stamp behavior verdicts', () => {
  const stalePatterns = [
    /--comprehension PROVISIONAL --application PROVISIONAL/,
    /comprehension_verdict[`:]?\s*PROVISIONAL when .*self-assessment/i,
    /application_verdict[`:]?\s*PROVISIONAL when .*self-assessment/i,
    /record PROVISIONAL[\s\S]{0,120}self-assessment/i,
  ];
  for (const file of activeDocs.filter((p) => p.includes('/prompts/') || p.includes('/commands/audit/'))) {
    const text = read(file);
    for (const pattern of stalePatterns) {
      assert.ok(!pattern.test(text), `${path.relative(workspace, file)} still permits self-stamped behavior verdicts`);
    }
  }
});

check('improve keep-or-revert rejects non-lift stripping', () => {
  const stalePatterns = [
    /A change that does not move the eval score is reverted/i,
    /if `eval_score` did not improve/i,
    /did not improve[\s\S]{0,80}revert/i,
    /does not improve[\s\S]{0,80}revert/i,
  ];
  for (const file of activeDocs) {
    const text = read(file);
    for (const pattern of stalePatterns) {
      assert.ok(!pattern.test(text), `${path.relative(workspace, file)} still treats non-lift as revert`);
    }
  }
});

console.log(`\nResults: ${passed} passed, 0 failed`);
