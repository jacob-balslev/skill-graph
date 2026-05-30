#!/usr/bin/env node
/**
 * Tests for the application_verdict write-back in evaluate-skill.js (SH-6302).
 *
 * Verifies:
 *   1. normalizeApplicationVerdict() maps lowercase→UPPERCASE and validates enum
 *   2. updateEvalLastRunBlock() correctly inserts/replaces a YAML block
 *   3. stampApplicationVerdict() end-to-end: writes to a real (temp) SKILL.md
 *   4. Schema-enum assertion: no mis-cased/invalid verdict can be stamped
 *
 * Uses only Node built-ins. No live LLM calls — pure function tests.
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const {
  APPLICATION_VERDICT_ENUM,
  normalizeApplicationVerdict,
  updateEvalLastRunBlock,
  stampApplicationVerdict,
} = require(path.join(REPO_ROOT, 'lib', 'audit', 'evaluate-skill'));

let passCount = 0;
let failCount = 0;

function assert(condition, message, details = '') {
  if (condition) {
    passCount++;
    process.stdout.write(`  PASS  ${message}\n`);
  } else {
    failCount++;
    process.stderr.write(`  FAIL  ${message}\n`);
    if (details) process.stderr.write(`        ${details}\n`);
  }
}

// ── 1. Schema-enum completeness ────────────────────────────────────────────

process.stdout.write('\n1. APPLICATION_VERDICT_ENUM contract\n');

assert(
  Array.isArray(APPLICATION_VERDICT_ENUM),
  'APPLICATION_VERDICT_ENUM is an array',
);

const EXPECTED_ENUM = ['APPLICABLE', 'REDUNDANT', 'HARMFUL', 'MIXED', 'FALSE_POSITIVE', 'UNVERIFIED'];
assert(
  EXPECTED_ENUM.every((v) => APPLICATION_VERDICT_ENUM.includes(v)),
  'Enum contains all six schema values',
  `Missing: ${EXPECTED_ENUM.filter((v) => !APPLICATION_VERDICT_ENUM.includes(v)).join(', ')}`,
);

assert(
  APPLICATION_VERDICT_ENUM.every((v) => v === v.toUpperCase()),
  'All enum values are UPPERCASE (schema requirement)',
  `Lowercase found: ${APPLICATION_VERDICT_ENUM.filter((v) => v !== v.toUpperCase()).join(', ')}`,
);

// ── 2. normalizeApplicationVerdict — casing and enum validation ────────────

process.stdout.write('\n2. normalizeApplicationVerdict()\n');

// Lowercase → UPPERCASE mapping (from application-eval.js output)
const LOWERCASE_CASES = [
  ['applicable', 'APPLICABLE'],
  ['redundant', 'REDUNDANT'],
  ['harmful', 'HARMFUL'],
  ['mixed', 'MIXED'],
  ['false_positive', 'FALSE_POSITIVE'],
];
for (const [raw, expected] of LOWERCASE_CASES) {
  const got = normalizeApplicationVerdict(raw);
  assert(
    got === expected,
    `normalizeApplicationVerdict("${raw}") === "${expected}"`,
    `Got: "${got}"`,
  );
}

// UPPERCASE passthrough
assert(
  normalizeApplicationVerdict('APPLICABLE') === 'APPLICABLE',
  'Passthrough: APPLICABLE → APPLICABLE',
);

// Invalid / absent → UNVERIFIED (never stamp garbage)
const INVALID_INPUTS = [undefined, null, '', 'UNKNOWN', 'pass', 'fail', 123];
for (const input of INVALID_INPUTS) {
  const got = normalizeApplicationVerdict(input);
  assert(
    got === 'UNVERIFIED',
    `Invalid input ${JSON.stringify(input)} → UNVERIFIED`,
    `Got: "${got}"`,
  );
}

// Schema-enum assertion: every value output by normalizeApplicationVerdict must be in the enum
const testInputs = [...LOWERCASE_CASES.map((p) => p[0]), 'APPLICABLE', undefined, null, ''];
for (const inp of testInputs) {
  const result = normalizeApplicationVerdict(inp);
  assert(
    APPLICATION_VERDICT_ENUM.includes(result),
    `normalizeApplicationVerdict output "${result}" is in schema enum`,
  );
}

// ── 3. updateEvalLastRunBlock — YAML block insertion and replacement ────────

process.stdout.write('\n3. updateEvalLastRunBlock()\n');

const RECEIPT = {
  at: '2026-05-22T10:00:00.000Z',
  status: 'pass',
  runner: 'node skill-graph/lib/audit/evaluate-skill.js --mode application',
};

// 3a. Insert into frontmatter that has no eval_last_run
const CONTENT_WITHOUT = `---
name: test-skill
description: A test skill.
application_verdict: UNVERIFIED
---
# Test Skill
`;
const updated3a = updateEvalLastRunBlock(CONTENT_WITHOUT, RECEIPT);
assert(
  updated3a.includes('eval_last_run:'),
  '3a. eval_last_run block inserted when absent',
);
assert(
  updated3a.includes(`  at: "${RECEIPT.at}"`),
  '3a. at field is present',
);
assert(
  updated3a.includes(`  status: ${RECEIPT.status}`),
  '3a. status field is present',
);
assert(
  updated3a.includes('  runner: "node skill-graph/lib/audit/evaluate-skill.js --mode application"'),
  '3a. runner field is present',
);

// 3b. Replace existing eval_last_run block
const CONTENT_WITH = `---
name: test-skill
description: A test skill.
application_verdict: REDUNDANT
eval_last_run:
  at: "2025-01-01T00:00:00.000Z"
  status: fail
  runner: "old-runner"
---
# Test Skill
`;
const RECEIPT2 = { at: '2026-05-22T10:00:00.000Z', status: 'pass', runner: 'new-runner' };
const updated3b = updateEvalLastRunBlock(CONTENT_WITH, RECEIPT2);
assert(
  !updated3b.includes('old-runner'),
  '3b. Old runner is replaced',
);
assert(
  updated3b.includes('new-runner'),
  '3b. New runner is present',
);
assert(
  !updated3b.includes('2025-01-01'),
  '3b. Old timestamp is replaced',
);
assert(
  updated3b.includes(RECEIPT2.at),
  '3b. New timestamp is present',
);

// 3c. Block inserted before relations: when present
const CONTENT_WITH_REL = `---
name: test-skill
description: A test skill.
application_verdict: UNVERIFIED
relations:
  adjacent:
    - other-skill
---
# Test Skill
`;
const updated3c = updateEvalLastRunBlock(CONTENT_WITH_REL, RECEIPT);
const evalLastRunPos = updated3c.indexOf('eval_last_run:');
const relationsPos = updated3c.indexOf('\nrelations:');
assert(
  evalLastRunPos !== -1 && relationsPos !== -1 && evalLastRunPos < relationsPos,
  '3c. eval_last_run is inserted before relations: block',
  `eval_last_run at ${evalLastRunPos}, relations at ${relationsPos}`,
);

// 3d. Content without frontmatter is returned unchanged
const NO_FM = '# Just a body, no frontmatter\n';
const updated3d = updateEvalLastRunBlock(NO_FM, RECEIPT);
assert(
  updated3d === NO_FM,
  '3d. Content without frontmatter is unchanged',
);

// ── 4. stampApplicationVerdict — end-to-end on a real temp file ───────────

process.stdout.write('\n4. stampApplicationVerdict() end-to-end\n');

// Create a temp skill directory with a SKILL.md and an application eval file.
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sg-test-'));
const evalsDir = path.join(tmpDir, 'evals');
fs.mkdirSync(evalsDir, { recursive: true });

const SKILL_MD_CONTENT = `---
schema_version: 7
name: test-skill
description: A test skill for unit testing.
application_verdict: UNVERIFIED
---
# Test Skill

Test body.
`;
const skillMdPath = path.join(tmpDir, 'SKILL.md');
fs.writeFileSync(skillMdPath, SKILL_MD_CONTENT);

const evalFilePath = path.join(evalsDir, 'application.json');
fs.writeFileSync(evalFilePath, JSON.stringify({ skill: 'test-skill', cases: [] }));

// 4a. Non-dry-run stamps the verdict. APPLICABLE survives ONLY from a
// cross-family certifying run (SH-6624) — so this fixture declares
// certification_tier: 'certifying'. A run without it caps APPLICABLE→PROVISIONAL
// (covered in test-application-trials-and-certification.js).
const fakeResult = {
  dryRun: false,
  aggregate_verdict: 'applicable',
  certification_tier: 'certifying',
  total: 3,
  errors: 0,
};
stampApplicationVerdict(evalFilePath, fakeResult, false);

const afterStamp = fs.readFileSync(skillMdPath, 'utf8');
assert(
  afterStamp.includes('application_verdict: APPLICABLE'),
  '4a. application_verdict stamped as APPLICABLE (UPPERCASE)',
  `Content: ${afterStamp.slice(0, 300)}`,
);
assert(
  afterStamp.includes('eval_last_run:'),
  '4a. eval_last_run block inserted',
);
assert(
  afterStamp.includes('  status: pass'),
  '4a. eval_last_run.status: pass for APPLICABLE',
);

// 4b. Dry-run does NOT modify the file
fs.writeFileSync(skillMdPath, SKILL_MD_CONTENT); // reset
stampApplicationVerdict(evalFilePath, fakeResult, true);
const afterDryRun = fs.readFileSync(skillMdPath, 'utf8');
assert(
  afterDryRun === SKILL_MD_CONTENT,
  '4b. Dry-run does not modify SKILL.md',
);

// 4c. dryRun flag on result prevents write
fs.writeFileSync(skillMdPath, SKILL_MD_CONTENT); // reset
stampApplicationVerdict(evalFilePath, { dryRun: true, aggregate_verdict: 'applicable' }, false);
const afterResultDryRun = fs.readFileSync(skillMdPath, 'utf8');
assert(
  afterResultDryRun === SKILL_MD_CONTENT,
  '4c. applicationResult.dryRun prevents write',
);

// 4d. All-errored run does NOT stamp
fs.writeFileSync(skillMdPath, SKILL_MD_CONTENT); // reset
stampApplicationVerdict(evalFilePath, { dryRun: false, aggregate_verdict: 'applicable', total: 3, errors: 3 }, false);
const afterAllErrors = fs.readFileSync(skillMdPath, 'utf8');
assert(
  afterAllErrors === SKILL_MD_CONTENT,
  '4d. All-errored run does not stamp (run is incomplete)',
);

// 4e. null result does not crash
try {
  stampApplicationVerdict(evalFilePath, null, false);
  assert(true, '4e. null result does not throw');
} catch (err) {
  assert(false, '4e. null result should not throw', err.message);
}

// 4f. Harmful verdict gets status: fail
fs.writeFileSync(skillMdPath, SKILL_MD_CONTENT); // reset
stampApplicationVerdict(evalFilePath, { dryRun: false, aggregate_verdict: 'harmful', total: 3, errors: 0 }, false);
const afterHarmful = fs.readFileSync(skillMdPath, 'utf8');
assert(
  afterHarmful.includes('application_verdict: HARMFUL'),
  '4f. harmful → HARMFUL stamped',
);
assert(
  afterHarmful.includes('  status: fail'),
  '4f. HARMFUL gets status: fail',
);

// 4g. Mixed verdict gets status: mixed
fs.writeFileSync(skillMdPath, SKILL_MD_CONTENT); // reset
stampApplicationVerdict(evalFilePath, { dryRun: false, aggregate_verdict: 'mixed', total: 3, errors: 0 }, false);
const afterMixed = fs.readFileSync(skillMdPath, 'utf8');
assert(
  afterMixed.includes('application_verdict: MIXED'),
  '4g. mixed → MIXED stamped',
);
assert(
  afterMixed.includes('  status: mixed'),
  '4g. MIXED gets status: mixed',
);

// Cleanup
fs.rmSync(tmpDir, { recursive: true });

// ── 5. Canonical Health Block format: application_verdict nested under metadata: ──
//
// This is the KNOWN BUG from SH-6302: real canonical skills store verdicts
// indented under a `metadata:` YAML block (not at the top level). The prior
// fix to updateFrontmatterField() must handle this without leaving the old
// indented value intact and appending a duplicate top-level field.

process.stdout.write('\n5. Canonical metadata-block format (SH-6302 regression)\n');

const tmpDir5 = fs.mkdtempSync(path.join(os.tmpdir(), 'sg-test5-'));
const evalsDir5 = path.join(tmpDir5, 'evals');
fs.mkdirSync(evalsDir5, { recursive: true });

// This is the real canonical format used by skills in ~/Development/skills/skills/
const SKILL_MD_METADATA_NESTED = `---
name: test-skill-canonical
description: A canonical skill with metadata block.
metadata:
  schema_version: 7
  type: capability
  category: engineering
  structural_verdict: UNVERIFIED
  truth_verdict: UNVERIFIED
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
---
# Test Skill (Canonical Format)

Body.
`;

const skillMd5 = path.join(tmpDir5, 'SKILL.md');
const evalFile5 = path.join(evalsDir5, 'application.json');
fs.writeFileSync(skillMd5, SKILL_MD_METADATA_NESTED);
fs.writeFileSync(evalFile5, JSON.stringify({ skill: 'test-skill-canonical', cases: [] }));

stampApplicationVerdict(evalFile5, {
  dryRun: false,
  aggregate_verdict: 'applicable',
  certification_tier: 'certifying', // APPLICABLE requires a cross-family certifying run (SH-6624)
  total: 3,
  errors: 0,
}, false);

const after5 = fs.readFileSync(skillMd5, 'utf8');

// The indented field must be replaced in-place (not duplicated at top level)
const lines5 = after5.split('\n');
const verdictLines5 = lines5.filter((l) => l.includes('application_verdict'));

assert(
  verdictLines5.length === 1,
  '5a. Exactly one application_verdict line (no duplicate top-level field)',
  `Found ${verdictLines5.length} lines: ${JSON.stringify(verdictLines5)}`,
);

assert(
  verdictLines5[0] === '  application_verdict: APPLICABLE',
  '5b. Indented field stamped with correct indent and APPLICABLE',
  `Got: ${JSON.stringify(verdictLines5[0])}`,
);

assert(
  !after5.includes('application_verdict: UNVERIFIED'),
  '5c. Old UNVERIFIED value is gone',
);

assert(
  after5.includes('eval_last_run:'),
  '5d. eval_last_run block inserted into metadata-format skill',
);

// Verify that the other verdict fields under metadata: are untouched
assert(
  after5.includes('  structural_verdict: UNVERIFIED'),
  '5e. structural_verdict under metadata: is untouched',
);
assert(
  after5.includes('  truth_verdict: UNVERIFIED'),
  '5f. truth_verdict under metadata: is untouched',
);
assert(
  after5.includes('  comprehension_verdict: UNVERIFIED'),
  '5g. comprehension_verdict under metadata: is untouched',
);

fs.rmSync(tmpDir5, { recursive: true });

// ── Summary ────────────────────────────────────────────────────────────────

process.stdout.write(`\nResults: ${passCount} passed, ${failCount} failed\n`);

if (failCount > 0) {
  process.exit(1);
}
