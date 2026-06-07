#!/usr/bin/env node
'use strict';

const assert = require('assert');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const runner = require(path.join(REPO_ROOT, 'lib', 'audit', 'evaluate-skill-codex-gpt-5.5'));

let pass = 0;

function ok(label, fn) {
  fn();
  pass += 1;
  process.stdout.write(`  PASS  ${label}\n`);
}

function getOption(argv, flag) {
  const idx = argv.indexOf(flag);
  return idx >= 0 ? argv[idx + 1] : undefined;
}

process.stdout.write('\nCodex GPT-5.5 evaluator profile\n');

ok('injects Codex backend, tools-on, single-model, and GPT-5.5 env vars', () => {
  const inv = runner.buildCodexGpt55Invocation(
    ['--comprehension', 'skills/demo/evals/comprehension.json'],
    { PATH: '/bin' },
    { nodePath: 'node-test', evaluatorPath: '/repo/evaluate-skill.js' },
  );

  assert.strictEqual(inv.command, 'node-test');
  assert.deepStrictEqual(inv.args.slice(0, 2), ['/repo/evaluate-skill.js', '--comprehension']);
  assert.strictEqual(getOption(inv.args, '--grader'), 'codex');
  assert.strictEqual(getOption(inv.args, '--generator'), 'codex');
  assert(inv.args.includes('--tools-on'));
  assert(inv.args.includes('--single-model'));

  for (const key of [
    'COMPREHENSION_GRADER_MODEL',
    'COMPREHENSION_GENERATOR_MODEL',
    'APPLICATION_GRADER_MODEL',
    'APPLICATION_GENERATOR_MODEL',
  ]) {
    assert.strictEqual(inv.env[key], 'gpt-5.5');
  }
  assert.strictEqual(inv.env.SKILL_AUDIT_PROFILE, 'codex-gpt-5.5');
});

ok('does not duplicate flags already matching the profile', () => {
  const inv = runner.buildCodexGpt55Invocation(
    ['--grader', 'codex', '--generator', 'codex', '--tools-on', '--single-model', 'evals/comprehension.json'],
    {},
    { evaluatorPath: '/repo/evaluate-skill.js' },
  );
  assert.strictEqual(inv.args.filter((a) => a === '--grader').length, 1);
  assert.strictEqual(inv.args.filter((a) => a === '--generator').length, 1);
  assert.strictEqual(inv.args.filter((a) => a === '--tools-on').length, 1);
  assert.strictEqual(inv.args.filter((a) => a === '--single-model').length, 1);
});

ok('rejects a conflicting grader backend', () => {
  assert.throws(
    () => runner.buildCodexGpt55Invocation(['--grader', 'claude', 'evals/comprehension.json']),
    /--grader must be "codex"/,
  );
});

ok('rejects certifying mode because same-family GPT evidence is provisional', () => {
  assert.throws(
    () => runner.buildCodexGpt55Invocation(['--certifying', 'evals/application.json']),
    /single-family evidence/,
  );
});

process.stdout.write(`\nResults: ${pass} passed\n`);
