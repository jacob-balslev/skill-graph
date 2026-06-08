#!/usr/bin/env node
/**
 * Regression tests for export, frontmatter parsing, drift URL handling, and
 * schema-validation lint enforcement.
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { buildExportedSkill, extractBody, normalizeExportName } = require('../export-skill');
const { parseFrontmatter } = require('../lib/parse-frontmatter');
const { sha256TruthSource } = require('../skill-graph-drift');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

function fail(msg) {
  process.stderr.write(`FAIL test-export-parser-drift: ${msg}\n`);
  process.exit(1);
}

function assert(condition, msg) {
  if (!condition) fail(msg);
}

function assertIncludes(value, expected, msg) {
  if (!String(value).includes(expected)) {
    fail(`${msg}; expected ${JSON.stringify(expected)} in ${JSON.stringify(String(value).slice(0, 500))}`);
  }
}

const crlfSkill = [
  '---',
  'schema_version: 4',
  'name: org/foo:bar',
  'description: "Use when testing export behavior. Do NOT use for production docs."',
  'version: 1.0.0',
  'type: capability',
  'category: quality',
  'scope: portable',
  'owner: test',
  'freshness: "2026-05-13"',
  'drift_check:',
  '  last_verified: "2026-05-13"',
  'eval_artifacts: none',
  'eval_state: unverified',
  'routing_eval: absent',
  'workspace_tags: [ecommerce, shopify]',
  'grounding:',
  '  truth_sources:',
  '    - path: docs/SKILL_METADATA_PROTOCOL_field-reference.md',
  '      line_range: { start: 1, end: 3 }',
  '---',
  '# Body',
  '',
  'Body survives CRLF export.',
  '',
].join('\r\n');

assert(extractBody(crlfSkill).startsWith('# Body'), 'extractBody should preserve CRLF bodies');

const exported = buildExportedSkill(crlfSkill);
assert(exported, 'buildExportedSkill should return output for parseable input');
assertIncludes(exported, 'name: org-foo-bar', 'export should normalize namespaced Skill Graph names');
assertIncludes(exported, '# Body', 'export should include source body');
assert(normalizeExportName('org/foo:bar') === 'org-foo-bar', 'normalizeExportName should replace / and : with hyphens');

const parsed = parseFrontmatter(crlfSkill);
assert(Array.isArray(parsed.workspace_tags), 'inline arrays should parse as arrays');
assert(parsed.workspace_tags[0] === 'ecommerce', 'inline array values should parse as scalars');
assert(
  parsed.grounding.truth_sources[0].line_range &&
  parsed.grounding.truth_sources[0].line_range.start === 1 &&
  parsed.grounding.truth_sources[0].line_range.end === 3,
  'inline maps should parse as objects'
);

const parsedSequenceObject = parseFrontmatter([
  '---',
  'relations:',
  '  boundary:',
  '    - { skill: debugging, reason: "runtime failure" }',
  '---',
  '',
].join('\n'));
assert(
  parsedSequenceObject.relations.boundary[0].skill === 'debugging',
  'inline object sequence items should parse as objects'
);

const remoteHash = sha256TruthSource('https://example.com/spec');
assert(remoteHash.external, 'remote truth sources should be marked external');
assert(remoteHash.hash === null, 'remote truth sources should not be locally hashed');

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-graph-lint-'));
try {
  const skillDir = path.join(tempRoot, 'deprecated-missing');
  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), [
    '---',
    'schema_version: 7',
    'name: deprecated-missing',
    'description: "Use when testing conditional lint enforcement. Do NOT use for real skills."',
    'version: 1.0.0',
    'type: capability',
    'category: quality',
    'scope: portable',
    'owner: test',
    'freshness: "2026-05-13"',
    'drift_check:',
    '  last_verified: "2026-05-13"',
    'eval_artifacts: none',
    'eval_state: unverified',
    'routing_eval: absent',
    'stability: deprecated',
    '---',
    '# Deprecated Missing',
    '',
    '## Coverage',
    'Enough text to avoid section-empty warnings while testing conditionals.',
    '',
    '## Philosophy',
    'Enough text to avoid section-empty warnings while testing conditionals.',
    '',
    '## Verification',
    'Enough text to avoid section-empty warnings while testing conditionals.',
    '',
    '## Do NOT Use When',
    'Enough text to avoid section-empty warnings while testing conditionals.',
    '',
  ].join('\n'), 'utf8');

  const result = spawnSync(
    process.execPath,
    [path.join(REPO_ROOT, 'scripts', 'skill-lint.js'), skillDir, '--no-color', '--skip-generator-parity'],
    { cwd: REPO_ROOT, encoding: 'utf8' }
  );
  const output = `${result.stdout}\n${result.stderr}`;
  assert(result.status !== 0, 'schema lint should fail deprecated skills that omit superseded_by');
  assertIncludes(output, 'superseded_by', 'lint should report the missing schema-conditional successor field');
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

// SKI-257: stripInlineComment must NOT treat a ` #` inside a flow collection or a quoted
// substring as a line comment — the old `/\s+#/` ignored bracket depth + quotes and truncated
// the whole structure (silent data loss). Plain-scalar + trailing-comment stripping stays
// YAML-correct.
{
  const fm = (line) => parseFrontmatter(`---\n${line}\n---\n`);
  const eq = (actual, expected, msg) => assert(
    JSON.stringify(actual) === JSON.stringify(expected),
    `${msg}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
  );

  // The catastrophic cases the old heuristic destroyed:
  eq(fm('keywords: [alpha, beta #gamma, delta]').keywords, ['alpha', 'beta', 'delta'],
    'flow array with an inline # keeps its structure + trailing element (no truncation)');
  eq(fm('rel: ["x # y", z]').rel, ['x # y', 'z'],
    'a # inside a quoted array element is preserved as data');
  eq(fm('k: [issue #42, bug #7]').k, ['issue', 'bug'],
    'flow array elements with # are not collapsed to a truncated string');
  eq(fm('obj: {a: 1, b: 2} # c').obj, { a: 1, b: 2 },
    'a flow object is parsed whole; only the trailing comment is stripped');

  // Plain-scalar + trailing-comment behavior stays YAML-correct (regression guard):
  eq(fm('key: value # comment').key, 'value', 'plain-scalar trailing comment still stripped');
  eq(fm('key: C# is a language').key, 'C# is a language', 'a # with no preceding space stays data');
  eq(fm('arr: [a, b] # trailing').arr, ['a', 'b'], 'trailing comment after a flow array stripped');
}

process.stdout.write('PASS test-export-parser-drift: export/parser/drift/lint edge cases covered\n');
