#!/usr/bin/env node
/**
 * Check that every canonical skill uses the closed Skill Metadata Protocol
 * category enum.
 *
 * `skill-lint.js` also validates the full schema; this focused checker exists
 * for fast, category-specific diagnostics and is wired into `npm run verify`.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { parseFrontmatter, normalizeFrontmatter } = require('../lib/parse-frontmatter');
const { collectSkillFilesFromRoots, loadWorkspaceConfig, resolveSkillRoots, workspaceRoot } = require('../lib/roots');

const REPO_ROOT = workspaceRoot();
const WORKSPACE_CONFIG = loadWorkspaceConfig(REPO_ROOT, msg => process.stderr.write(`WARN ${msg}\n`));
const SKILL_ROOTS = resolveSkillRoots(REPO_ROOT, WORKSPACE_CONFIG);
const TEMPLATE_PATH = path.join(REPO_ROOT, 'examples', 'skill-metadata-template.md');
const CATEGORY_ENUM = Object.freeze(['foundations', 'engineering', 'design', 'quality', 'agent', 'product']);
const CATEGORY_SET = new Set(CATEGORY_ENUM);

function repoRelative(filePath) {
  return path.relative(REPO_ROOT, filePath).split(path.sep).join('/');
}

function collectFiles(args) {
  const includeTemplate = args.includes('--include-template');
  const explicit = args.filter(arg => !arg.startsWith('--'));
  const files = [];

  if (explicit.length > 0) {
    for (const arg of explicit) {
      const abs = path.resolve(REPO_ROOT, arg);
      if (!fs.existsSync(abs)) continue;
      if (fs.statSync(abs).isDirectory()) {
        const directSkill = path.join(abs, 'SKILL.md');
        if (fs.existsSync(directSkill)) files.push(directSkill);
        else files.push(...collectSkillFilesFromRoots([{ absPath: abs, project: null }]).map(entry => entry.filePath));
      } else {
        files.push(abs);
      }
    }
  } else {
    files.push(...collectSkillFilesFromRoots(SKILL_ROOTS).map(entry => entry.filePath));
  }

  if (includeTemplate && fs.existsSync(TEMPLATE_PATH)) files.push(TEMPLATE_PATH);
  return [...new Set(files.map(file => path.resolve(file)))].sort((a, b) => a.localeCompare(b));
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    process.stdout.write(`Usage: node scripts/lint/check-category-enum.js [--include-template] [skill-or-dir...]

Valid category values: ${CATEGORY_ENUM.join(', ')}
`);
    process.exit(0);
  }

  const files = collectFiles(args);
  if (files.length === 0) {
    process.stderr.write('FAIL category enum: no skill files found\n');
    process.exit(1);
  }

  const errors = [];
  for (const file of files) {
    const fm = normalizeFrontmatter(parseFrontmatter(fs.readFileSync(file, 'utf8')));
    if (!fm) {
      errors.push(`${repoRelative(file)}: missing or invalid frontmatter`);
      continue;
    }
    if (!CATEGORY_SET.has(fm.category)) {
      errors.push(`${repoRelative(file)}: category ${JSON.stringify(fm.category)} must be one of ${CATEGORY_ENUM.join(', ')}`);
    }
  }

  for (const error of errors) process.stderr.write(`FAIL ${error}\n`);
  if (errors.length > 0) process.exit(1);

  process.stdout.write(`OK   category enum (${files.length} file(s))\n`);
}

if (require.main === module) main();

module.exports = { CATEGORY_ENUM };
