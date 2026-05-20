#!/usr/bin/env node
/**
 * Verify that Skill Graph skills export to plain SKILL.md frontmatter.
 *
 * This is intentionally stricter than "export script exits 0": it rebuilds the
 * exported frontmatter in memory and validates the structural shape that broad
 * SKILL.md-compatible runtimes expect at the top level.
 *
 * Usage:
 *   node scripts/verify-skill-md-export.js
 *   node scripts/verify-skill-md-export.js skills/documentation
 *   node scripts/verify-skill-md-export.js --plain marketplace/skills
 *   node scripts/verify-skill-md-export.js --json
 *
 * Self-contained. Only uses Node built-ins.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { parseFrontmatter } = require('./lib/parse-frontmatter');
const { workspaceRoot, loadWorkspaceConfig, resolveSkillRoots } = require('./lib/roots');
const { buildExportedSkill } = require('./export-skill');

const REPO_ROOT = workspaceRoot();
const WORKSPACE_CONFIG = loadWorkspaceConfig(REPO_ROOT, msg => process.stderr.write(`WARN ${msg}\n`));
const SKILL_ROOTS = resolveSkillRoots(REPO_ROOT, WORKSPACE_CONFIG);
// Primary skill root — first configured root, or local skills/ as fallback.
const DEFAULT_SKILLS_DIR = SKILL_ROOTS[0].absPath;
const TOP_LEVEL_FIELDS = new Set(['name', 'description', 'license', 'compatibility', 'metadata', 'allowed-tools']);

function repoRelative(filePath) {
  return path.relative(REPO_ROOT, filePath).split(path.sep).join('/');
}

function collectSkillFilesFromRoot(rootDir, depth = 0) {
  const files = [];
  if (!fs.existsSync(rootDir)) return files;
  if (depth > 4) return files;

  const direct = path.join(rootDir, 'SKILL.md');
  if (fs.existsSync(direct)) return [direct];

  for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue;
    files.push(...collectSkillFilesFromRoot(path.join(rootDir, entry.name), depth + 1));
  }
  return files;
}

function collectSkillFiles(inputs) {
  const files = [];
  const roots = inputs.length > 0 ? inputs : [DEFAULT_SKILLS_DIR];

  for (const input of roots) {
    const abs = path.resolve(input);
    if (!fs.existsSync(abs)) continue;
    const stat = fs.statSync(abs);
    if (stat.isFile() && path.basename(abs) === 'SKILL.md') {
      files.push(abs);
      continue;
    }
    if (!stat.isDirectory()) continue;

    files.push(...collectSkillFilesFromRoot(abs));
  }

  return files.sort((a, b) => repoRelative(a).localeCompare(repoRelative(b)));
}

function validateName(name) {
  if (typeof name !== 'string' || name.length === 0) {
    return ['name must be a non-empty string'];
  }
  if (/[/:]/.test(name)) {
    return ['name must not contain "/" or ":" in exported SKILL.md frontmatter'];
  }
  return [];
}

function validateExportedFrontmatter(fm) {
  const errors = [];

  for (const key of Object.keys(fm)) {
    if (!TOP_LEVEL_FIELDS.has(key)) {
      errors.push(`unexpected top-level field "${key}"`);
    }
  }

  errors.push(...validateName(fm.name));

  if (typeof fm.description !== 'string' || fm.description.length === 0) {
    errors.push('description must be a non-empty string');
  }

  if (fm.license !== undefined && typeof fm.license !== 'string') {
    errors.push('license must be a string when present');
  }

  if (fm.compatibility !== undefined) {
    if (typeof fm.compatibility !== 'string' || fm.compatibility.length === 0) {
      errors.push('compatibility must be a non-empty string when present');
    }
  }

  if (fm['allowed-tools'] !== undefined && typeof fm['allowed-tools'] !== 'string') {
    errors.push('allowed-tools must be a space-separated string when present');
  }

  if (fm.metadata !== undefined) {
    if (!fm.metadata || typeof fm.metadata !== 'object' || Array.isArray(fm.metadata)) {
      errors.push('metadata must be a key-value object when present');
    } else {
      for (const [key, value] of Object.entries(fm.metadata)) {
        if (key.length === 0) errors.push('metadata keys must be non-empty strings');
        if (typeof value !== 'string') errors.push(`metadata.${key} must be a string`);
      }
    }
  }

  return { errors };
}

function verifySkillFile(skillMd, options = {}) {
  const sourceText = fs.readFileSync(skillMd, 'utf8');
  const sourceFm = parseFrontmatter(sourceText);
  if (!sourceFm) {
    return {
      file: repoRelative(skillMd),
      ok: false,
      errors: ['source SKILL.md has no parseable frontmatter'],
    };
  }

  if (options.plain) {
    const validation = validateExportedFrontmatter(sourceFm);
    return {
      file: repoRelative(skillMd),
      ok: validation.errors.length === 0,
      errors: validation.errors,
    };
  }

  const exportedText = buildExportedSkill(sourceText);
  if (!exportedText) {
    return {
      file: repoRelative(skillMd),
      ok: false,
      errors: ['exported SKILL.md could not be built from source'],
    };
  }
  const exportedFm = parseFrontmatter(exportedText);
  const validation = exportedFm
    ? validateExportedFrontmatter(exportedFm)
    : { errors: ['exported SKILL.md has no parseable frontmatter'] };

  return {
    file: repoRelative(skillMd),
    ok: validation.errors.length === 0,
    errors: validation.errors,
  };
}

function printText(results) {
  for (const r of results) {
    if (r.ok) continue;
    process.stdout.write(`FAIL ${r.file}\n`);
    for (const e of r.errors) process.stdout.write(`  - ${e}\n`);
  }
  const passing = results.filter(r => r.ok).length;
  const failing = results.length - passing;
  process.stdout.write(`${results.length} skill export(s): ${passing} PASS, ${failing} FAIL.\n`);
}

function main() {
  const args = process.argv.slice(2);
  const outputJson = args.includes('--json');
  const quiet = args.includes('--quiet');
  const plain = args.includes('--plain') || args.includes('--as-is');
  const inputs = args.filter(a => !a.startsWith('--'));
  const skillFiles = collectSkillFiles(inputs);

  if (skillFiles.length === 0) {
    process.stderr.write('ERROR no SKILL.md files found to verify.\n');
    process.exit(1);
  }

  const results = skillFiles.map(skillFile => verifySkillFile(skillFile, { plain }));

  if (outputJson) {
    process.stdout.write(JSON.stringify({ results }, null, 2) + '\n');
  } else if (!quiet) {
    printText(results);
  }

  process.exit(results.some(r => !r.ok) ? 1 : 0);
}

module.exports = {
  collectSkillFiles,
  validateExportedFrontmatter,
  verifySkillFile,
};

if (require.main === module) main();
