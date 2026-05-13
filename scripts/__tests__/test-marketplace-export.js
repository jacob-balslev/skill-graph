#!/usr/bin/env node
/**
 * Regression tests for marketplace export generation and gates.
 */

'use strict';

const path = require('path');
const {
  EXPORT_DESCRIPTION_OVERRIDES,
  MARKETPLACE_DESCRIPTION_LIMIT,
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
assert(
  exportedA11yFm.metadata.skill_graph_canonical_skill === 'skills/a11y/SKILL.md',
  'marketplace export should preserve canonical source path'
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
