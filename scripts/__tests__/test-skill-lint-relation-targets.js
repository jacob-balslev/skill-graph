#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

function writeSkill(root, name, relationYaml = '') {
  const dir = path.join(root, name);
  fs.mkdirSync(dir, { recursive: true });
  const relations = relationYaml
    ? `# relations: typed graph edges to sibling skills.\nrelations:\n${relationYaml}`
    : '';
  fs.writeFileSync(path.join(dir, 'SKILL.md'), `---
# name: stable skill identifier.
name: ${name}
# description: routing-facing summary.
description: "Use as a lint relation-target test fixture. Do NOT use as a production skill."
# subject: primary browse shelf.
subject: backend-engineering
# public: publishability gate.
public: true
# scope: what this fixture teaches and excludes.
scope: "Fixture for relation-target lint checks. Out: production guidance."
${relations}---

# ${name}

## Concept of the skill

This fixture exists so relation-target lint behavior can be tested.

## Coverage

It covers only the linter relation-target check.

## Philosophy of the skill

The linter should treat relation targets like graph foreign keys.

## Verification

Run the relation-target linter regression test.

## Do NOT Use When

Do not use this fixture for production skill guidance.
`);
}

function runLint(root) {
  return spawnSync('node', [
    path.join(REPO_ROOT, 'scripts', 'skill-lint.js'),
    '--path',
    root,
    '--json',
    '--no-color',
  ], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  });
}

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-lint-relation-targets-'));

writeSkill(root, 'source-skill', '  related:\n    - target-skill\n');
writeSkill(root, 'target-skill');

let result = runLint(root);
assert.strictEqual(result.status, 0, result.stderr || result.stdout);
let parsed = JSON.parse(result.stdout);
assert.strictEqual(parsed.errors, 0, result.stdout);

writeSkill(root, 'broken-skill', '  depends_on:\n    - skill: missing-skill\n      min_version: "1.0.0"\n');

result = runLint(root);
assert.notStrictEqual(result.status, 0, 'missing relation target should fail lint');
parsed = JSON.parse(result.stdout);
const messages = parsed.results.flatMap(file => file.errors.map(error => error.msg));
assert(
  messages.some(message => message.includes('relations.depends_on') && message.includes('"missing-skill"') && message.includes('does not match any known skill')),
  `expected missing-target diagnostic, got: ${messages.join('; ')}`,
);

console.log('PASS test-skill-lint-relation-targets: relation targets resolve or fail deterministically');
