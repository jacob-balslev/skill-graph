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

const EXPECTED_ENUM = [
  'APPLICABLE',
  'REDUNDANT',
  'NOT_DISCRIMINATED_CEILING',
  'EQUIVALENT_ON_FRONTIER',
  'HARMFUL',
  'MIXED',
  'FALSE_POSITIVE',
  'UNVERIFIED',
  'PROVISIONAL',
];
assert(
  EXPECTED_ENUM.every((v) => APPLICATION_VERDICT_ENUM.includes(v)),
  'Enum contains all schema values',
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
  ['not_discriminated_ceiling', 'NOT_DISCRIMINATED_CEILING'],
  ['equivalent_on_frontier', 'EQUIVALENT_ON_FRONTIER'],
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
  receipt: 'skill-graph/audits/test-skill/application-receipt.json',
  receipt_hash: 'a'.repeat(64),
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
assert(
  updated3a.includes('  receipt: "skill-graph/audits/test-skill/application-receipt.json"'),
  '3a. receipt field is present',
);
assert(
  updated3a.includes(`  receipt_hash: "${'a'.repeat(64)}"`),
  '3a. receipt_hash field is present',
);
assert(
  !updated3a.includes('  artifact:'),
  '3a. legacy artifact field is not written',
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
// cross-family certifying run with calibrated grading evidence and red-herring
// coverage — so this fixture declares all three evidence fields. Runs without
// them cap APPLICABLE→PROVISIONAL (covered in test-application-trials-and-certification.js).
const fakeResult = {
  dryRun: false,
  aggregate_verdict: 'applicable',
  certification_tier: 'certifying',
  calibrated: true,
  red_herring_cases_total: 1,
  skillName: 'test-skill',
  resolved_generator_model: 'claude-opus-4-8-20260601',
  resolved_grader_model: 'gpt-5.5-20260601',
  total: 3,
  errors: 0,
};
// ADR-0019: the verdict + eval_last_run land in the audit-state.json SIDECAR,
// not the SKILL.md frontmatter. The SKILL.md is left untouched.
const sidecarPath = path.join(tmpDir, 'audit-state.json');
const readSidecar = () => (fs.existsSync(sidecarPath) ? JSON.parse(fs.readFileSync(sidecarPath, 'utf8')) : null);
const resetState = () => { fs.writeFileSync(skillMdPath, SKILL_MD_CONTENT); if (fs.existsSync(sidecarPath)) fs.rmSync(sidecarPath); };
function writeApplicationReceipt(dir, result, skillName = 'test-skill') {
  const receiptPath = path.join(dir, `receipt-${Math.random().toString(16).slice(2)}.json`);
  fs.writeFileSync(receiptPath, JSON.stringify({ mode: 'application', skillName, ...result }, null, 2));
  return receiptPath;
}

stampApplicationVerdict(evalFilePath, fakeResult, false, { artifactPath: writeApplicationReceipt(tmpDir, fakeResult) });

const sc4a = readSidecar();
assert(
  sc4a && sc4a.application_verdict === 'APPLICABLE',
  '4a. application_verdict stamped as APPLICABLE (UPPERCASE) in the sidecar',
  `sidecar: ${JSON.stringify(sc4a)}`,
);
assert(
  sc4a && sc4a.eval_last_run && typeof sc4a.eval_last_run === 'object',
  '4a. eval_last_run block written to the sidecar',
);
assert(
  sc4a && sc4a.eval_last_run && sc4a.eval_last_run.status === 'pass',
  '4a. eval_last_run.status: pass for APPLICABLE',
);
assert(
  sc4a && sc4a.eval_last_run && typeof sc4a.eval_last_run.receipt === 'string' && /^[a-f0-9]{64}$/.test(sc4a.eval_last_run.receipt_hash || ''),
  '4a. eval_last_run carries receipt path + sha256 hash',
  `eval_last_run: ${JSON.stringify(sc4a && sc4a.eval_last_run)}`,
);
assert(
  fs.readFileSync(skillMdPath, 'utf8') === SKILL_MD_CONTENT,
  '4a. SKILL.md frontmatter is left untouched (sidecar owns the verdict)',
);

// 4b. Dry-run does NOT write the sidecar
resetState();
stampApplicationVerdict(evalFilePath, fakeResult, true);
assert(
  readSidecar() === null && fs.readFileSync(skillMdPath, 'utf8') === SKILL_MD_CONTENT,
  '4b. Dry-run writes neither sidecar nor SKILL.md',
);

// 4c. dryRun flag on result prevents write
resetState();
stampApplicationVerdict(evalFilePath, { dryRun: true, aggregate_verdict: 'applicable' }, false);
assert(
  readSidecar() === null,
  '4c. applicationResult.dryRun prevents sidecar write',
);

// 4d. All-errored run does NOT stamp
resetState();
stampApplicationVerdict(evalFilePath, { dryRun: false, aggregate_verdict: 'applicable', total: 3, errors: 3 }, false);
assert(
  readSidecar() === null,
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
resetState();
{
  const result = { dryRun: false, aggregate_verdict: 'harmful', skillName: 'test-skill', total: 3, errors: 0 };
  stampApplicationVerdict(evalFilePath, result, false, { artifactPath: writeApplicationReceipt(tmpDir, result) });
}
const sc4f = readSidecar();
assert(
  sc4f && sc4f.application_verdict === 'HARMFUL',
  '4f. harmful → HARMFUL stamped in sidecar',
);
assert(
  sc4f && sc4f.eval_last_run && sc4f.eval_last_run.status === 'fail',
  '4f. HARMFUL gets eval_last_run.status: fail',
);

// 4g. Mixed verdict gets status: mixed
resetState();
{
  const result = { dryRun: false, aggregate_verdict: 'mixed', skillName: 'test-skill', total: 3, errors: 0 };
  stampApplicationVerdict(evalFilePath, result, false, { artifactPath: writeApplicationReceipt(tmpDir, result) });
}
const sc4g = readSidecar();
assert(
  sc4g && sc4g.application_verdict === 'MIXED',
  '4g. mixed → MIXED stamped in sidecar',
);
assert(
  sc4g && sc4g.eval_last_run && sc4g.eval_last_run.status === 'mixed',
  '4g. MIXED gets eval_last_run.status: mixed',
);

// 4h. Real write-back without a durable receipt is refused.
resetState();
stampApplicationVerdict(evalFilePath, { dryRun: false, aggregate_verdict: 'harmful', skillName: 'test-skill', total: 3, errors: 0 }, false);
assert(
  readSidecar() === null,
  '4h. write-back without artifactPath refuses to stamp',
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

{
  const result = {
    dryRun: false,
    aggregate_verdict: 'applicable',
    certification_tier: 'certifying',
    calibrated: true,
    red_herring_cases_total: 1,
    skillName: 'test-skill-canonical',
    resolved_generator_model: 'claude-opus-4-8-20260601',
    resolved_grader_model: 'gpt-5.5-20260601',
    total: 3,
    errors: 0,
  };
  stampApplicationVerdict(evalFile5, result, false, { artifactPath: writeApplicationReceipt(tmpDir5, result, 'test-skill-canonical') });
}

// ADR-0019: the verdict lands in the sidecar; the SKILL.md frontmatter (even
// the nested metadata: format) is left entirely untouched. The SH-6302
// frontmatter-mutation bug (duplicate/indented top-level field) is moot —
// verdicts no longer live in frontmatter, so there is nothing to mutate there.
const after5 = fs.readFileSync(skillMd5, 'utf8');
const sc5 = JSON.parse(fs.readFileSync(path.join(tmpDir5, 'audit-state.json'), 'utf8'));

assert(
  sc5.application_verdict === 'APPLICABLE',
  '5a. application_verdict stamped APPLICABLE in the sidecar (metadata-format skill)',
  `sidecar: ${JSON.stringify(sc5)}`,
);
assert(
  sc5.eval_last_run && typeof sc5.eval_last_run === 'object',
  '5b. eval_last_run written to the sidecar',
);
assert(
  after5 === SKILL_MD_METADATA_NESTED,
  '5c. SKILL.md frontmatter is byte-for-byte untouched (no mutation of the metadata: block)',
  `after: ${after5.slice(0, 200)}`,
);
// The frontmatter metadata: verdicts remain UNVERIFIED (untouched) — the manifest
// join, not a frontmatter write, is what surfaces the sidecar verdict to consumers.
assert(
  after5.includes('  application_verdict: UNVERIFIED'),
  '5d. frontmatter metadata: application_verdict is untouched (still UNVERIFIED)',
);
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
