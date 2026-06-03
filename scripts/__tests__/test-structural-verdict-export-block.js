#!/usr/bin/env node
/**
 * Tests for the structural_verdict: FAIL export block (SH-6280).
 *
 * Verifies that collectCanonicalSkills() refuses to export a skill whose
 * frontmatter declares structural_verdict: FAIL, and that skills with
 * structural_verdict: PASS, PASS_WITH_FIXES, or absent (UNVERIFIED) are
 * not blocked.
 *
 * These tests are self-contained and do not require the full canonical
 * skills library to be present.
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { collectCanonicalSkills } = require('../export-marketplace-skills');

function fail(msg) {
  process.stderr.write(`FAIL test-structural-verdict-export-block: ${msg}\n`);
  process.exit(1);
}

function assert(condition, msg) {
  if (!condition) fail(msg);
}

// ─── Helper: create a temp directory with a single portable skill ─────────────

function makeTmpSkillDir(skillName, extraFrontmatter = '') {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sg-sv-test-'));
  const skillDir = path.join(tmpDir, skillName);
  fs.mkdirSync(skillDir);

  const fm = [
    '---',
    'schema_version: 8',
    `name: ${skillName}`,
    `description: "Portable test skill ${skillName}."`,
    'version: 1.0.0',
    'subject: backend-engineering',
    'deployment_target: portable',
    'scope: "Portable test fixture for structural_verdict export blocking."',
    'owner: test-suite',
    'freshness: "2026-05-28"',
    'drift_check:',
    '  last_verified: "2026-05-28"',
    'eval_artifacts: none',
    'eval_state: unverified',
    'routing_eval: absent',
    ...(extraFrontmatter ? [extraFrontmatter] : []),
    '---',
    '',
    '# Test skill body',
  ].join('\n');

  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), fm);
  return tmpDir;
}

// ─── Test 1: structural_verdict: FAIL blocks export ─────────────────────────

const failDir = makeTmpSkillDir('test-fail-skill', 'structural_verdict: FAIL');
try {
  let blocked = false;
  let blockMessage = '';
  try {
    collectCanonicalSkills(failDir);
  } catch (err) {
    blocked = true;
    blockMessage = err.message;
  }
  assert(blocked, 'collectCanonicalSkills should throw for structural_verdict: FAIL');
  assert(
    blockMessage.includes('Export blocked'),
    `error message should have "Export blocked" prefix — got: ${blockMessage}`
  );
  assert(
    blockMessage.includes('structural_verdict: FAIL'),
    `error message should mention structural_verdict: FAIL — got: ${blockMessage}`
  );
  assert(
    blockMessage.includes('test-fail-skill'),
    `error message should name the failing skill — got: ${blockMessage}`
  );
  assert(
    blockMessage.includes('external mandates'),
    `error message should explain what mandates failed — got: ${blockMessage}`
  );
} finally {
  fs.rmSync(failDir, { recursive: true, force: true });
}

// ─── Test 2: structural_verdict: PASS does NOT block export ─────────────────

const passDir = makeTmpSkillDir('test-pass-skill', 'structural_verdict: PASS');
try {
  let failBlocked = false;
  try {
    collectCanonicalSkills(passDir);
  } catch (err) {
    if (err.message.includes('structural_verdict: FAIL')) {
      failBlocked = true;
    }
    // Other errors (e.g. workspace config guard) are not this test's concern.
  }
  assert(!failBlocked, 'collectCanonicalSkills should NOT block structural_verdict: PASS');
} finally {
  fs.rmSync(passDir, { recursive: true, force: true });
}

// ─── Test 3: structural_verdict: PASS_WITH_FIXES does NOT block export ───────

const passFixDir = makeTmpSkillDir('test-pass-fix-skill', 'structural_verdict: PASS_WITH_FIXES');
try {
  let failBlocked = false;
  try {
    collectCanonicalSkills(passFixDir);
  } catch (err) {
    if (err.message.includes('structural_verdict: FAIL')) {
      failBlocked = true;
    }
  }
  assert(!failBlocked, 'collectCanonicalSkills should NOT block structural_verdict: PASS_WITH_FIXES');
} finally {
  fs.rmSync(passFixDir, { recursive: true, force: true });
}

// ─── Test 4: absent structural_verdict (UNVERIFIED) does NOT block export ────
// This is the important case: today the corpus is uniformly UNVERIFIED.
// The block must be inert when the field is absent.

const unverifiedDir = makeTmpSkillDir('test-unverified-skill'); // no structural_verdict field
try {
  let failBlocked = false;
  try {
    collectCanonicalSkills(unverifiedDir);
  } catch (err) {
    if (err.message.includes('structural_verdict: FAIL')) {
      failBlocked = true;
    }
  }
  assert(!failBlocked, 'collectCanonicalSkills should NOT block a skill with no structural_verdict (UNVERIFIED)');
} finally {
  fs.rmSync(unverifiedDir, { recursive: true, force: true });
}

// ─── Test 5: real corpus is not blocked (all UNVERIFIED today) ───────────────
// Verify the block is inert on the actual skill library. Skip gracefully if
// the library is not present (CI without the sibling skills repo).
const { workspaceRoot, loadWorkspaceConfig, resolveSkillRoots } = require('../lib/roots');
const _root = workspaceRoot();
const _skillRoots = resolveSkillRoots(_root, loadWorkspaceConfig(_root));
const _sourceDir = _skillRoots[0] && _skillRoots[0].absPath;

if (!_sourceDir || !fs.existsSync(_sourceDir)) {
  process.stdout.write(
    `SKIP test-structural-verdict-export-block (real corpus test): canonical skills library not found at ${_sourceDir || '(no path resolved)'} — skipping real-corpus check\n`
  );
} else {
  let realCorpusBlocked = false;
  let realCorpusBlockMessage = '';
  try {
    collectCanonicalSkills(); // uses DEFAULT_SOURCE_DIR
  } catch (err) {
    if (err.message.includes('structural_verdict: FAIL')) {
      realCorpusBlocked = true;
      realCorpusBlockMessage = err.message;
    }
    // Other errors (e.g. description length) are not this test's concern.
  }
  assert(
    !realCorpusBlocked,
    `structural_verdict block must be inert on the current corpus (all UNVERIFIED) — got: ${realCorpusBlockMessage}`
  );
}

process.stdout.write('PASS test-structural-verdict-export-block: structural_verdict: FAIL export block verified\n');
