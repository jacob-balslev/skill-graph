#!/usr/bin/env node
/**
 * Skill Graph codemod: schema_version 3 -> 4.
 *
 * Transforms a SKILL.md file, a skill directory, or a directory of skills from
 * the v3 frontmatter shape to the v4 naming contract.
 *
 * Transformations:
 *
 *   1. schema_version: 3              -> schema_version: 4
 *   2. skill.v3.schema.json           -> skill.v4.schema.json
 *   3. browse_category: <value>       -> category: <value>
 *   4. category: <path>               -> domain: <path>
 *   5. category_path: <path>          -> domain: <path>
 *   6. project_tags: [...]            -> workspace_tags: [...]
 *   7. routing_groups: [...]          -> routing_bundles: [...]
 *
 * What this codemod does NOT do:
 *   - Does not author a workspace config. Workspace/project ownership is
 *     generated from `.skill-graph/config.json`, not written into portable
 *     SKILL.md files.
 *   - Does not infer missing domain paths. If a v3 skill had only
 *     browse_category, v4 keeps only category.
 *
 * Line-based transformation: preserves comments, quoting style, and
 * indentation as authored. It only rewrites top-level frontmatter keys.
 *
 * Usage:
 *   node scripts/migrate-skill-v3-to-v4.js <path>
 *   node scripts/migrate-skill-v3-to-v4.js skills/
 *   node scripts/migrate-skill-v3-to-v4.js --dry-run <path>
 *   node scripts/migrate-skill-v3-to-v4.js --include-template <path>
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { workspaceRoot } = require('./lib/roots');

const REPO_ROOT = workspaceRoot();
const TEMPLATE_PATH = path.join(REPO_ROOT, 'examples', 'skill-metadata-template.md');

function splitFrontmatter(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  if (lines[0] !== '---') return null;
  let closeIdx = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') { closeIdx = i; break; }
  }
  if (closeIdx === -1) return null;
  return { lines, closeIdx };
}

function migrateLine(line) {
  if (line.includes('https://skillgraph.dev/schemas/skill.v3.schema.json')) {
    return line.replace('https://skillgraph.dev/schemas/skill.v3.schema.json', 'https://skillgraph.dev/schemas/skill.v4.schema.json');
  }
  let m = line.match(/^(\s*)schema_version(\s*:\s*)(["']?)3\3(\s*(?:#.*)?)$/);
  if (m) return `${m[1]}schema_version${m[2]}${m[3]}4${m[3]}${m[4]}`;

  m = line.match(/^(\s*)browse_category(\s*:.*)$/);
  if (m) return `${m[1]}category${m[2]}`;

  m = line.match(/^(\s*)category_path(\s*:.*)$/);
  if (m) return `${m[1]}domain${m[2]}`;

  m = line.match(/^(\s*)category(\s*:.*)$/);
  if (m) return `${m[1]}domain${m[2]}`;

  m = line.match(/^(\s*)project_tags(\s*:.*)$/);
  if (m) return `${m[1]}workspace_tags${m[2]}`;

  m = line.match(/^(\s*)routing_groups(\s*:.*)$/);
  if (m) return `${m[1]}routing_bundles${m[2]}`;

  return line;
}

function migrateFile(filePath) {
  const oldText = fs.readFileSync(filePath, 'utf8');
  const split = splitFrontmatter(oldText);
  if (!split) return { changed: false, newText: oldText, error: 'no frontmatter block found' };

  const lines = split.lines.slice();
  let changed = false;
  for (let i = 1; i < split.closeIdx; i++) {
    const next = migrateLine(lines[i]);
    if (next !== lines[i]) {
      lines[i] = next;
      changed = true;
    }
  }
  return { changed, newText: lines.join('\n'), error: null };
}

function collectSkillFiles(targetPath, out = []) {
  if (!fs.existsSync(targetPath)) return out;
  const stat = fs.statSync(targetPath);
  if (stat.isFile()) {
    if (path.basename(targetPath) === 'SKILL.md' || targetPath.endsWith('.md')) out.push(targetPath);
    return out;
  }
  const directSkill = path.join(targetPath, 'SKILL.md');
  if (fs.existsSync(directSkill)) out.push(directSkill);
  for (const entry of fs.readdirSync(targetPath, { withFileTypes: true })) {
    if (entry.isDirectory()) collectSkillFiles(path.join(targetPath, entry.name), out);
  }
  return [...new Set(out)];
}

function parseArgs(argv) {
  return {
    dryRun: argv.includes('--dry-run'),
    includeTemplate: argv.includes('--include-template'),
    targets: argv.filter(a => !a.startsWith('--')),
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const targetArgs = args.targets.length > 0 ? args.targets : ['skills'];
  const targets = [];
  for (const target of targetArgs) {
    targets.push(...collectSkillFiles(path.resolve(REPO_ROOT, target)));
  }
  if (args.includeTemplate) targets.push(TEMPLATE_PATH);

  let changed = 0;
  let failed = 0;
  for (const filePath of [...new Set(targets)]) {
    const rel = path.relative(REPO_ROOT, filePath).split(path.sep).join('/');
    const result = migrateFile(filePath);
    if (result.error) {
      console.error(`FAIL  ${rel}: ${result.error}`);
      failed++;
      continue;
    }
    if (!result.changed) {
      console.log(`SKIP  ${rel} (already v4 or nothing to migrate)`);
      continue;
    }
    changed++;
    if (args.dryRun) {
      console.log(`WOULD ${rel}`);
    } else {
      fs.writeFileSync(filePath, result.newText, 'utf8');
      console.log(`OK    ${rel}`);
    }
  }

  console.log(`${args.dryRun ? 'Would migrate' : 'Migrated'} ${changed} file(s); ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

if (require.main === module) main();

module.exports = { migrateFile, migrateLine };
