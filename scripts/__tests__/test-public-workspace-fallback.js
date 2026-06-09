'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const p = require('../../lib/audit/public-workspace-fallback');

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log(`  PASS    ${name}`);
}

console.log('1. public workspace fallback');
check('copies skill-graph plus skills/skills and excludes private/volatile trees', () => {
  const ws = fs.mkdtempSync(path.join(os.tmpdir(), 'public-ws-src-'));
  const sg = path.join(ws, 'skill-graph');
  const skills = path.join(ws, 'skills');
  fs.mkdirSync(path.join(sg, 'lib', 'audit'), { recursive: true });
  fs.mkdirSync(path.join(sg, '.git'), { recursive: true });
  fs.mkdirSync(path.join(sg, 'skill-audit-loop', 'progress', 'skill-audits', 'x'), { recursive: true });
  fs.mkdirSync(path.join(skills, 'skills', 'quality-assurance', 'a11y'), { recursive: true });
  fs.mkdirSync(path.join(ws, 'sales-hub'), { recursive: true });
  fs.writeFileSync(path.join(sg, 'lib', 'audit', 'runner.js'), 'public');
  fs.writeFileSync(path.join(sg, '.git', 'config'), 'private-git');
  fs.writeFileSync(path.join(sg, 'skill-audit-loop', 'progress', 'skill-audits', 'x', 'old.md'), 'old');
  fs.writeFileSync(path.join(skills, 'skills', 'quality-assurance', 'a11y', 'SKILL.md'), '# A11y');
  fs.writeFileSync(path.join(ws, 'sales-hub', 'secret.txt'), 'private');

  const prepared = p.preparePublicWorkspace({ enabled: true, skillGraphRoot: sg, workspaceRoot: ws, tmpDir: os.tmpdir() });
  assert.strictEqual(prepared.active, true);
  assert.ok(fs.existsSync(path.join(prepared.skillGraphRoot, 'lib', 'audit', 'runner.js')));
  assert.ok(!fs.existsSync(path.join(prepared.skillGraphRoot, '.git', 'config')), '.git is excluded');
  assert.ok(!fs.existsSync(path.join(prepared.skillGraphRoot, 'skill-audit-loop', 'progress', 'skill-audits', 'x', 'old.md')), 'old progress is excluded');
  assert.ok(fs.existsSync(path.join(prepared.skillGraphRoot, 'skill-audit-loop', 'progress', 'skill-audits')), 'fresh progress root exists');
  assert.ok(fs.existsSync(path.join(prepared.skillsRoot, 'skills', 'quality-assurance', 'a11y', 'SKILL.md')));
  assert.ok(!fs.existsSync(path.join(prepared.root, 'sales-hub', 'secret.txt')), 'private sibling is not copied');
  assert.strictEqual(
    prepared.mapSkillDir(path.join(skills, 'skills', 'quality-assurance', 'a11y')),
    path.join(prepared.skillsRoot, 'skills', 'quality-assurance', 'a11y'),
  );
  prepared.cleanup();
  fs.rmSync(ws, { recursive: true, force: true });
});

check('disabled mode is inert', () => {
  const prepared = p.preparePublicWorkspace({ enabled: false });
  assert.strictEqual(prepared.active, false);
  prepared.cleanup();
});

console.log(`\nResults: ${passed} passed, 0 failed`);
