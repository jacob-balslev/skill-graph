#!/usr/bin/env node
/**
 * Regression tests for marketplace export generation and gates.
 *
 * These tests require the canonical skills library (a sibling repo at
 * ../skills/skills or configured via .skill-graph/config.json). In CI
 * environments where only the skill-graph tooling repo is checked out,
 * the tests skip gracefully rather than failing.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { workspaceRoot, loadWorkspaceConfig, resolveSkillRoots } = require('../lib/roots');
const {
  EXPORT_DESCRIPTION_OVERRIDES,
  MARKETPLACE_DESCRIPTION_LIMIT,
  SKILL_GRAPH_PROTOCOL,
  buildMarketplaceSkillText,
  collectCanonicalSkills,
  exportDescriptionForSkill,
  rewriteLocalMarkdownLinksToCanonicalRepo,
  scanPrivacyText,
} = require('../export-marketplace-skills');
const { parseFrontmatter } = require('../lib/parse-frontmatter');
const { validateExportedFrontmatter } = require('../verify-skill-md-export');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

function fail(msg) {
  process.stderr.write(`FAIL test-marketplace-export: ${msg}\n`);
  process.exit(1);
}

function assert(condition, msg) {
  if (!condition) fail(msg);
}

// Skip gracefully when the canonical skills library is not present (e.g. CI
// environments that only check out the skill-graph tooling repo).
const _root = workspaceRoot();
const _skillRoots = resolveSkillRoots(_root, loadWorkspaceConfig(_root));
const _sourceDir = _skillRoots[0] && _skillRoots[0].absPath;
if (!_sourceDir || !fs.existsSync(_sourceDir)) {
  process.stdout.write(
    `SKIP test-marketplace-export: canonical skills library not found at ${_sourceDir || '(no path resolved)'} — skipping\n`
  );
  process.exit(0);
}

const skills = collectCanonicalSkills();
assert(skills.length > 0, 'canonical skills should be discovered');

const longDescriptions = [];
for (const skill of skills) {
  const sourceLength = String(skill.fm.description || '').length;
  const exportDescription = exportDescriptionForSkill(skill);
  assert(
    exportDescription.description.length <= MARKETPLACE_DESCRIPTION_LIMIT,
    `${skill.fm.name} export description exceeds marketplace limit`
  );
  if (sourceLength > MARKETPLACE_DESCRIPTION_LIMIT) {
    longDescriptions.push(skill.fm.name);
    assert(
      EXPORT_DESCRIPTION_OVERRIDES[skill.fm.name],
      `${skill.fm.name} needs an explicit export description override`
    );
  }
}

const overrideNames = Object.keys(EXPORT_DESCRIPTION_OVERRIDES).sort();
assert(
  JSON.stringify(overrideNames) === JSON.stringify(longDescriptions.sort()),
  'description overrides should exist only for over-limit canonical descriptions'
);

const a11y = skills.find(skill => skill.fm.name === 'a11y');
assert(a11y, 'a11y fixture skill should exist');
const exportedA11y = buildMarketplaceSkillText(a11y);
const exportedA11yFm = parseFrontmatter(exportedA11y);
assert(exportedA11yFm, 'marketplace export should have frontmatter');
const shape = validateExportedFrontmatter(exportedA11yFm);
assert(shape.errors.length === 0, `marketplace export should be plain SKILL.md shape: ${shape.errors.join('; ')}`);
// After the M1 category restructure, a11y lives at skills/quality/a11y/SKILL.md
// in the sibling skills repo. Derive the expected path from the resolved source
// rather than hardcoding it, so the assertion stays correct if the skill moves again.
const _expectedCanonicalSkill = a11y.canonicalSkillPath;
assert(
  exportedA11yFm.metadata.skill_graph_canonical_skill === _expectedCanonicalSkill,
  `marketplace export should preserve canonical source path (expected: ${_expectedCanonicalSkill})`
);
assert(
  exportedA11yFm.metadata.skill_graph_protocol === SKILL_GRAPH_PROTOCOL &&
    SKILL_GRAPH_PROTOCOL === 'Skill Metadata Protocol v4',
  'marketplace export should preserve current Skill Metadata Protocol provenance'
);
assert(
  exportedA11y.includes('https://github.com/jacob-balslev/skill-graph/blob/main/examples/evals/a11y.json'),
  'marketplace export should rewrite repo-local links to canonical GitHub URLs'
);

const rewritten = rewriteLocalMarkdownLinksToCanonicalRepo(
  'See [eval](../../examples/evals/a11y.json) and [external](https://example.com).',
  'skills/a11y/SKILL.md'
);
assert(
  rewritten.includes('https://github.com/jacob-balslev/skill-graph/blob/main/examples/evals/a11y.json'),
  'relative links should be rewritten to canonical GitHub URLs'
);
assert(rewritten.includes('[external](https://example.com)'), 'external links should be preserved');

const fakeSecret = 'sk-' + 'A'.repeat(24);
const fakeLeak = `C:\\Users\\Example\\secret.txt\nperson@example.com\n${fakeSecret}`;
const findings = scanPrivacyText(fakeLeak, path.join(REPO_ROOT, 'marketplace', 'skills', 'fake', 'SKILL.md'));
assert(findings.length >= 3, 'privacy scan should detect paths, email addresses, and token-like values');

process.stdout.write('PASS test-marketplace-export: marketplace export gates covered\n');
