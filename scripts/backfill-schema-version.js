#!/usr/bin/env node
/**
 * backfill-schema-version.js — ensure every SKILL.md declares `schema_version`
 *
 * Walks a skill tree and reports any SKILL.md that is missing the
 * `schema_version` key in its YAML frontmatter. Optionally writes the
 * current version into missing files.
 *
 * This script exists because the v3 schema requires `schema_version`, but
 * libraries that existed before v3 (or that drift over time) may have
 * SKILL.md files missing the field. Audit reports need a deterministic
 * way to measure the gap and a safe way to close it.
 *
 * Usage:
 *   node scripts/backfill-schema-version.js                     # dry-run, default roots
 *   node scripts/backfill-schema-version.js --write             # apply changes
 *   node scripts/backfill-schema-version.js --root <dir>        # custom root
 *   node scripts/backfill-schema-version.js --version 3         # override version value
 *   node scripts/backfill-schema-version.js --report report.md  # write a markdown report
 *
 * Default roots (in order, first existing wins):
 *   - ./skills
 *   - ./Skill Graph/skills
 *
 * Multi-root workspaces should pass `--root <dir>` per project root, or use
 * `.skill-graph/config.json` (consumed by `scripts/generate-manifest.js`).
 *
 * No external dependencies.
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_ROOTS = [
  'skills',
  'Skill Graph/skills'
];

const DEFAULT_VERSION = 3;

function parseArgs(argv) {
  const args = {
    write: false,
    roots: [],
    version: DEFAULT_VERSION,
    report: null
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--write') args.write = true;
    else if (a === '--root') args.roots.push(path.resolve(argv[++i]));
    else if (a === '--version') args.version = parseInt(argv[++i], 10);
    else if (a === '--report') args.report = path.resolve(argv[++i]);
    else if (a === '--help' || a === '-h') {
      console.log('Usage: backfill-schema-version.js [--write] [--root <dir>]... [--version N] [--report <path>]');
      process.exit(0);
    } else {
      console.error(`Unknown arg: ${a}`);
      process.exit(2);
    }
  }
  return args;
}

function resolveRoots(customRoots) {
  if (customRoots.length) return customRoots;
  const cwd = process.cwd();
  const resolved = [];
  for (const candidate of DEFAULT_ROOTS) {
    const full = path.resolve(cwd, candidate);
    if (fs.existsSync(full) && fs.statSync(full).isDirectory()) {
      resolved.push(full);
    }
  }
  return resolved;
}

function walkSkillFiles(root) {
  const out = [];
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
    catch { continue; }
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (ent.name === 'node_modules' || ent.name.startsWith('.git')) continue;
        stack.push(full);
      } else if (ent.isFile() && ent.name === 'SKILL.md') {
        out.push(full);
      }
    }
  }
  return out.sort();
}

function parseFrontmatter(content) {
  if (!content.startsWith('---\n')) return { start: -1, end: -1, lines: [] };
  const rest = content.slice(4);
  const endIdx = rest.indexOf('\n---\n');
  if (endIdx === -1) return { start: -1, end: -1, lines: [] };
  const fm = rest.slice(0, endIdx);
  return { start: 4, end: 4 + endIdx + 5, lines: fm.split('\n') };
}

function hasSchemaVersion(lines) {
  return lines.some(l => /^schema_version\s*:/.test(l));
}

function insertSchemaVersion(content, version) {
  if (!content.startsWith('---\n')) {
    return `---\nschema_version: ${version}\n---\n\n${content}`;
  }
  // insert as first frontmatter line
  return content.replace(/^---\n/, `---\nschema_version: ${version}\n`);
}

function formatReport(results, version) {
  const missing = results.filter(r => !r.hasSchemaVersion);
  const present = results.filter(r => r.hasSchemaVersion);
  const lines = [
    '# schema_version Backfill Report',
    '',
    `Generated: ${new Date().toISOString()}`,
    `Target version: ${version}`,
    '',
    `## Summary`,
    '',
    `- Total SKILL.md files scanned: **${results.length}**`,
    `- With \`schema_version\` already: **${present.length}**`,
    `- Missing \`schema_version\`: **${missing.length}**`,
    `- Coverage: **${results.length ? Math.round((present.length / results.length) * 100) : 0}%**`,
    '',
    `## Missing (would add \`schema_version: ${version}\`)`,
    ''
  ];
  if (missing.length === 0) {
    lines.push('_None — every SKILL.md declares schema_version._');
  } else {
    for (const r of missing) lines.push(`- ${r.path}`);
  }
  return lines.join('\n') + '\n';
}

function main() {
  const args = parseArgs(process.argv);
  const roots = resolveRoots(args.roots);
  if (roots.length === 0) {
    console.error('No skill roots found. Pass --root <dir> or run from a directory containing one of:', DEFAULT_ROOTS.join(', '));
    process.exit(2);
  }

  console.log(`[backfill] Mode: ${args.write ? 'WRITE' : 'DRY-RUN'}  Version: ${args.version}`);
  console.log(`[backfill] Scanning roots:`);
  for (const r of roots) console.log(`  - ${r}`);

  const results = [];
  for (const root of roots) {
    const files = walkSkillFiles(root);
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const fm = parseFrontmatter(content);
      const has = fm.lines.length > 0 && hasSchemaVersion(fm.lines);
      results.push({ path: path.relative(process.cwd(), file), hasSchemaVersion: has, absPath: file });

      if (!has && args.write) {
        const updated = insertSchemaVersion(content, args.version);
        fs.writeFileSync(file, updated, 'utf8');
      }
    }
  }

  const missing = results.filter(r => !r.hasSchemaVersion);
  const present = results.filter(r => r.hasSchemaVersion);

  console.log(`[backfill] Scanned: ${results.length}  With schema_version: ${present.length}  Missing: ${missing.length}`);

  if (missing.length) {
    const display = missing.slice(0, 20);
    console.log(`[backfill] ${args.write ? 'Updated' : 'Would update'} ${missing.length} files:`);
    for (const r of display) console.log(`  - ${r.path}`);
    if (missing.length > display.length) console.log(`  ... (${missing.length - display.length} more)`);
  }

  if (args.report) {
    fs.writeFileSync(args.report, formatReport(results, args.version), 'utf8');
    console.log(`[backfill] Wrote report to ${args.report}`);
  }

  if (!args.write && missing.length > 0) {
    console.log(`[backfill] Dry-run only. Re-run with --write to apply.`);
    process.exit(0); // dry-run is always success-exit
  }
}

main();
