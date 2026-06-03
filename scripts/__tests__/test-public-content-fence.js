'use strict';

// Unit test: SH-6681 — public-content boundary path guard (lib/audit/public-content-fence.js).
// The private-content boundary is HARD; this guard makes the enrich/eval code REFUSE any
// path outside the public roots (skill-graph repo + skills tree) before a shell-out.

const assert = require('assert');
const path = require('path');
const f = require('../../lib/audit/public-content-fence');

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log(`  PASS    ${name}`);
}

const SG = path.resolve('/ws/skill-graph');
const SKILLS = path.resolve('/ws/skills');
const roots = [SG, SKILLS];

console.log('1. isWithinPublicScope — accept public, reject private');
check('accepts a path under the skill-graph repo', () => {
  assert.strictEqual(f.isWithinPublicScope('/ws/skill-graph/lib/audit/x.js', { roots }), true);
  assert.strictEqual(f.isWithinPublicScope(SG, { roots }), true); // the root itself
});
check('accepts a path under the skills tree', () => {
  assert.strictEqual(f.isWithinPublicScope('/ws/skills/skills/debugging/SKILL.md', { roots }), true);
});
check('rejects a path outside both roots', () => {
  assert.strictEqual(f.isWithinPublicScope('/ws/other/file', { roots }), false);
  assert.strictEqual(f.isWithinPublicScope('/etc/passwd', { roots }), false);
});
check('rejects a path-traversal escape to a sibling private repo', () => {
  assert.strictEqual(f.isWithinPublicScope('/ws/skill-graph/../sales-hub/secret.ts', { roots }), false);
});
check('rejects any path crossing a private segment, even under a public root', () => {
  assert.strictEqual(f.isWithinPublicScope('/ws/skill-graph/sales-hub/x', { roots }), false);
  assert.strictEqual(f.isWithinPublicScope('/ws/skills/printify/keys', { roots }), false);
});
check('does NOT treat a sibling prefix as in-scope (skill-graph-private)', () => {
  assert.strictEqual(f.isWithinPublicScope('/ws/skill-graph-private/x', { roots }), false);
});
check('rejects non-string / empty input', () => {
  assert.strictEqual(f.isWithinPublicScope('', { roots }), false);
  assert.strictEqual(f.isWithinPublicScope(null, { roots }), false);
});
check('throws when no roots are provided', () => {
  assert.throws(() => f.isWithinPublicScope('/x', { roots: [] }), /at least one public root/);
});

console.log('2. assertPublicScope — throws on private, returns resolved on public');
check('returns the resolved path for an in-scope target', () => {
  assert.strictEqual(f.assertPublicScope('/ws/skills/a/SKILL.md', { roots }), path.resolve('/ws/skills/a/SKILL.md'));
});
check('throws with a clear message for an out-of-scope target', () => {
  assert.throws(() => f.assertPublicScope('/ws/sales-hub/x', { roots, label: 'enrich skillDir' }),
    /refused a path outside the public scope.*enrich skillDir/s);
});

console.log('3. defaultPublicRoots');
check('derives [skillGraphRoot, <ws>/skills, <ws>/.opencode/progress/skill-audits]', () => {
  const r = f.defaultPublicRoots({ skillGraphRoot: '/ws/skill-graph' });
  assert.deepStrictEqual(r, [
    path.resolve('/ws/skill-graph'),
    path.resolve('/ws/skills'),
    path.resolve('/ws/.opencode/progress/skill-audits'),
  ]);
});
check('honors explicit skillsRoot + workspaceRoot', () => {
  const r = f.defaultPublicRoots({ skillGraphRoot: '/a/sg', workspaceRoot: '/a', skillsRoot: '/a/custom-skills' });
  assert.deepStrictEqual(r, [path.resolve('/a/sg'), path.resolve('/a/custom-skills'), path.resolve('/a/.opencode/progress/skill-audits')]);
});
check('the audit-artifacts root is IN scope; a sibling private tree is NOT', () => {
  const roots = f.defaultPublicRoots({ skillGraphRoot: '/ws/skill-graph' });
  // A claim run dir under the workspace audit-artifacts root is allowed.
  assert.strictEqual(f.isWithinPublicScope('/ws/.opencode/progress/skill-audits/cognitive-load-theory/runs/r1/x.md', { roots }), true);
  // The workspace itself / a sibling private repo is still refused.
  assert.strictEqual(f.isWithinPublicScope('/ws/sales-hub/secret.ts', { roots }), false);
  assert.strictEqual(f.isWithinPublicScope('/ws/.opencode/other/thing', { roots }), false);
});
check('requires skillGraphRoot', () => {
  assert.throws(() => f.defaultPublicRoots({}), /skillGraphRoot is required/);
});

console.log(`\nResults: ${passed} passed, 0 failed`);
