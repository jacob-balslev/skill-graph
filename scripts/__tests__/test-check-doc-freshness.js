#!/usr/bin/env node

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const checker = require(path.join(REPO_ROOT, 'scripts', 'check-doc-freshness.js'));

let passCount = 0;
let failCount = 0;

function assert(label, condition, details = '') {
  if (condition) {
    passCount++;
    process.stdout.write(`  PASS  ${label}\n`);
  } else {
    failCount++;
    process.stderr.write(`  FAIL  ${label}\n`);
    if (details) process.stderr.write(`        ${details}\n`);
  }
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-graph-doc-freshness-'));

try {
  writeFile(path.join(tmpRoot, 'package.json'), JSON.stringify({
    scripts: {
      'docs:ok': 'node scripts/existing.js',
    },
  }, null, 2));
  writeFile(path.join(tmpRoot, 'bin', 'skill-graph.js'), `
const COMMANDS = {
  lint: { script: 'scripts/lint.js' },
  'doc': { script: 'scripts/check-doc-freshness.js' },
  'evaluate:gpt-5.5': { script: 'scripts/evaluate-gpt-5-5.js' },
};
`);
  writeFile(path.join(tmpRoot, 'scripts', 'existing.js'), 'process.exit(0);\n');
  writeFile(path.join(tmpRoot, 'scripts', 'evaluate-gpt-5-5.js'), 'process.exit(0);\n');
  writeFile(path.join(tmpRoot, 'docs', 'guide.md'), `# Guide

Run \`node scripts/existing.js\` and \`npm run docs:ok\`.
Run \`node scripts/missing.js\`.
Run \`npm run missing\`.
Run \`skill-graph evaluate:gpt-5.5\`.
Run \`skill-graph missing\`.
Do not check placeholders like \`skills/<name>/SKILL.md\` or \`scripts/<name>.js\`.
Use the legacy runner for active work.
The retired path \`scripts/retired.js\` is recoverable from git history.
Use example project path \`lib/content/schema.ts\` when adapting the sample.
Documentation may mention TODO placeholders when describing audit behavior.
TODO: resolve this active marker.

## Misc

This paragraph is intentionally long so the doc freshness checker can flag a rewrite question that preserves content instead of deleting it. It keeps going with enough words to cross the configured test threshold while staying harmless and deterministic for the unit test fixture.
`);

  process.stdout.write('\ncheck-doc-freshness.js\n');
  const result = checker.scanWorkspace(tmpRoot, {
    maxParagraphWords: 20,
    maxParagraphChars: 400,
  });
  const allKinds = result.findings.map((f) => f.kind);

  assert('scans one active doc', result.files_scanned === 1, `got ${result.files_scanned}`);
  assert('reports missing node script', allKinds.includes('missing-node-script'), allKinds.join(', '));
  assert('reports missing package script', allKinds.includes('missing-package-script'), allKinds.join(', '));
  assert('reports missing CLI command', allKinds.includes('missing-skill-graph-command'), allKinds.join(', '));
  assert('reports legacy-language question', allKinds.includes('legacy-language'), allKinds.join(', '));
  assert('reports actionable open marker', allKinds.includes('open-marker'), allKinds.join(', '));
  assert('reports vague taxonomy heading', allKinds.includes('vague-taxonomy-heading'), allKinds.join(', '));
  assert('reports long paragraph question', allKinds.includes('long-paragraph'), allKinds.join(', '));
  assert('ignores placeholder paths', !result.findings.some((f) => String(f.target || '').includes('<name>')));
  assert('accepts dotted skill-graph commands', !result.findings.some((f) => String(f.target || '').includes('evaluate:gpt-5.5')));
  assert('ignores historical missing paths with recovery context', !result.findings.some((f) => String(f.target || '').includes('retired.js')));
  assert('ignores example project paths', !result.findings.some((f) => String(f.target || '').includes('lib/content/schema.ts')));
  assert('does not flag descriptive TODO prose', !result.findings.some((f) => f.snippet && f.snippet.includes('TODO placeholders')));

  const cli = spawnSync('node', [path.join(REPO_ROOT, 'scripts', 'check-doc-freshness.js'), '--root', tmpRoot, '--strict', '--quiet'], {
    encoding: 'utf8',
  });
  assert('strict CLI exits 1 on error findings', cli.status === 1, `status=${cli.status} output=${cli.stdout}${cli.stderr}`);
  assert('quiet CLI prints summary', cli.stdout.includes('doc freshness:'), cli.stdout);
} finally {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
}

process.stdout.write(`\nResults: ${passCount} passed, ${failCount} failed\n`);
process.exit(failCount === 0 ? 0 : 1);
