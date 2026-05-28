#!/usr/bin/env node
//
// test-work-mode-separation.js — verify the work-mode-separation hook
// fires (and stays quiet) for the expected file-mix scenarios. The hook
// is intentionally fail-open (exits 0 even when the warning fires); these
// tests assert the stderr WARNING text is present or absent depending on
// the staged-file mix.
//
// Closes audit M1 (system-audit-2026-05-27): the hook is fail-open and
// therefore the only regression catcher is a test like this.

'use strict';

const path = require('path');
const { spawnSync } = require('node:child_process');

const SCRIPT = path.resolve(__dirname, '..', 'check-work-mode-separation.js');

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

function runWithFiles(filesCsv, env = {}) {
  return spawnSync('node', [SCRIPT, '--files', filesCsv], {
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
}

const WARN_NEEDLE = 'WORK-MODE SEPARATION WARNING';

// ── 1. No files → exits 0 quietly ──────────────────────────────────────
process.stdout.write('\n1. Empty file list — no warning, exit 0\n');
{
  const r = runWithFiles('');
  assert('1a. Exit 0', r.status === 0, `got ${r.status}`);
  assert('1b. No warning emitted', !r.stderr.includes(WARN_NEEDLE), `stderr was: ${r.stderr.slice(0, 200)}`);
}

// ── 2. SYSTEM-only changes → no warning ───────────────────────────────
process.stdout.write('\n2. SYSTEM-only staged paths — no warning\n');
{
  const r = runWithFiles('schemas/SKILL_METADATA_PROTOCOL_schema.json,scripts/skill-lint.js,docs/SKILL_METADATA_PROTOCOL_field-reference.md');
  assert('2a. Exit 0', r.status === 0);
  assert('2b. No warning emitted', !r.stderr.includes(WARN_NEEDLE), `stderr: ${r.stderr.slice(0, 200)}`);
}

// ── 3. CONTENT-only changes → no warning ──────────────────────────────
process.stdout.write('\n3. CONTENT-only staged paths — no warning\n');
{
  const r = runWithFiles('audits/a11y/findings.md,audits/debugging/scorecard.md,examples/audits/refactor/verdict.md');
  assert('3a. Exit 0', r.status === 0);
  assert('3b. No warning emitted', !r.stderr.includes(WARN_NEEDLE), `stderr: ${r.stderr.slice(0, 200)}`);
}

// ── 4. Mixed SYSTEM + CONTENT → warning fires, still exit 0 ───────────
process.stdout.write('\n4. Mixed SYSTEM + CONTENT — warning fires\n');
{
  const r = runWithFiles('schemas/SKILL_METADATA_PROTOCOL_schema.json,audits/a11y/findings.md');
  assert('4a. Exit 0 (fail-open)', r.status === 0, `expected 0, got ${r.status}`);
  assert('4b. Warning emitted', r.stderr.includes(WARN_NEEDLE), `stderr did not contain "${WARN_NEEDLE}":\n${r.stderr.slice(0, 400)}`);
  assert('4c. Warning lists the SYSTEM file', r.stderr.includes('schemas/SKILL_METADATA_PROTOCOL_schema.json'));
  assert('4d. Warning lists the CONTENT file', r.stderr.includes('audits/a11y/findings.md'));
}

// ── 5. AUDIT_LOOP=1 suppresses the warning even on mixed mix ─────────
process.stdout.write('\n5. AUDIT_LOOP=1 suppresses the warning on mixed paths\n');
{
  const r = runWithFiles('schemas/SKILL_METADATA_PROTOCOL_schema.json,audits/a11y/findings.md', { AUDIT_LOOP: '1' });
  assert('5a. Exit 0', r.status === 0);
  assert('5b. No warning emitted (AUDIT_LOOP=1 honored)', !r.stderr.includes(WARN_NEEDLE), `stderr: ${r.stderr.slice(0, 200)}`);
}

// ── 6. audits/prompts/** classifies as SYSTEM, not CONTENT ───────────
process.stdout.write('\n6. audits/prompts/** is SYSTEM (only per-skill <skill>/ subdirs are CONTENT)\n');
{
  // Pair audits/prompts/X with audits/a11y/Y. Prompts side should be SYSTEM,
  // and the mix should fire the warning. If prompts were misclassified as
  // CONTENT, the mix would not fire because both would be CONTENT.
  const r = runWithFiles('audits/prompts/skill-audit-loop-single-model.md,audits/a11y/findings.md');
  assert('6a. Exit 0', r.status === 0);
  assert('6b. Warning fires (prompts treated as SYSTEM)', r.stderr.includes(WARN_NEEDLE));
}

// ── 7. examples/audits/<skill>/ classifies as CONTENT, not SYSTEM ───
process.stdout.write('\n7. examples/audits/<skill>/ is CONTENT, not SYSTEM\n');
{
  // Pair examples/audits/X (CONTENT) with schemas/Y (SYSTEM). If examples/audits
  // were misclassified as SYSTEM, the mix would be SYSTEM-only and no warning.
  const r = runWithFiles('examples/audits/refactor/verdict.md,schemas/SKILL_METADATA_PROTOCOL_schema.json');
  assert('7a. Exit 0', r.status === 0);
  assert('7b. Warning fires (examples/audits/ treated as CONTENT)', r.stderr.includes(WARN_NEEDLE));
}

// ── Summary ──────────────────────────────────────────────────────────
process.stdout.write(`\nResults: ${passCount} passed, ${failCount} failed\n`);
process.exit(failCount === 0 ? 0 : 1);
