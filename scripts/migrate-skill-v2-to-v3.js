#!/usr/bin/env node
/**
 * Skill Graph codemod: schema_version 2 → 3.
 *
 * Transforms a SKILL.md (or a directory of skill directories) from the v2
 * frontmatter contract to the v3 contract. v3 introduces a small number of
 * breaking shape changes and one rename; all new v3 fields are optional and
 * are intentionally NOT inserted by this codemod — authors opt into them
 * individually when the added metadata is real.
 *
 * Transformations:
 *
 *   1. schema_version: 2       → schema_version: 3
 *   2. family: <value>         → browse_category: <value>       (rename)
 *   3. drift_check: "YYYY-..." → drift_check:                   (date → object)
 *                                   last_verified: "YYYY-..."
 *   4. compatibility: "<text>" → compatibility:                 (string → object)
 *                                   notes: "<text>"
 *
 * What this codemod does NOT do:
 *   - Does not insert `project_tags`, `category`, `runtime_telemetry`,
 *     `lifecycle`, or `truth_source_hashes`. These are opt-in in v3; adding
 *     stub values would inflate the frontmatter and create fake metadata.
 *   - Does not convert `relations.boundary` or `relations.depends_on` items
 *     to the `{skill, reason}` / `{skill, min_version}` object form. The
 *     bare-string form is still valid in v3; upgrade item-by-item when the
 *     reason or min_version is real.
 *   - Does not attempt to parse freeform `compatibility` strings into
 *     `runtimes` / `node`. The string is moved verbatim into `notes`; the
 *     author upgrades to structured fields manually.
 *
 * Line-based transformation: preserves comments, quoting style, and
 * indentation as authored. If a skill uses non-standard YAML (multi-line
 * strings, anchors, flow sequences) and a transformation cannot be applied
 * safely, the codemod reports the file as "needs manual migration" without
 * corrupting it.
 *
 * Usage:
 *   node scripts/migrate-skill-v2-to-v3.js <path>               # migrate one file or dir
 *   node scripts/migrate-skill-v2-to-v3.js skills/              # migrate every skill
 *   node scripts/migrate-skill-v2-to-v3.js --dry-run <path>     # show diffs, do not write
 *   node scripts/migrate-skill-v2-to-v3.js --include-template   # also migrate examples/skill-template.md
 *
 * Self-contained. Only uses Node built-ins — no external dependencies.
 * Exit 0 on success, 1 if any file needed manual migration or failed to parse.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(REPO_ROOT, 'skills');
const TEMPLATE_PATH = path.join(REPO_ROOT, 'examples', 'skill-template.md');

// ---------------------------------------------------------------------------
// Frontmatter extraction — line-level so we can preserve the body verbatim.
// ---------------------------------------------------------------------------

/**
 * Split a Markdown document into (frontmatterLines, bodyText). Returns null
 * if no frontmatter block is found.
 */
function splitFrontmatter(text) {
  const lines = text.split('\n');
  if (lines[0] !== '---') return null;
  let closeIdx = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') { closeIdx = i; break; }
  }
  if (closeIdx === -1) return null;
  const frontmatter = lines.slice(1, closeIdx);
  const body = lines.slice(closeIdx + 1).join('\n');
  return { frontmatter, body };
}

/**
 * Rejoin frontmatter lines + body into a full document.
 */
function joinDocument(frontmatter, body) {
  return '---\n' + frontmatter.join('\n') + '\n---\n' + body;
}

// ---------------------------------------------------------------------------
// Transformations
//
// Each transformation returns:
//   { changed: boolean, lines: string[], note?: string, error?: string }
//
// On error, the caller aborts the migration for that file and reports manually.
// ---------------------------------------------------------------------------

/**
 * T1: schema_version 2 → 3.
 */
function transformSchemaVersion(lines) {
  const out = [];
  let changed = false;
  for (const line of lines) {
    const m = line.match(/^(\s*)schema_version\s*:\s*("?)(\d+)("?)\s*(#.*)?$/);
    if (m && m[3] === '2') {
      out.push(`${m[1]}schema_version: 3${m[5] ? ' ' + m[5] : ''}`);
      changed = true;
    } else {
      out.push(line);
    }
  }
  return { changed, lines: out };
}

/**
 * T2: family → browse_category (simple rename; value unchanged).
 */
function transformFamilyRename(lines) {
  const out = [];
  let changed = false;
  for (const line of lines) {
    const m = line.match(/^(\s*)family(\s*:\s*)(.*)$/);
    if (m && !/browse_category/.test(line)) {
      out.push(`${m[1]}browse_category${m[2]}${m[3]}`);
      changed = true;
    } else {
      out.push(line);
    }
  }
  return { changed, lines: out };
}

/**
 * T3: drift_check: "date" → drift_check:\n  last_verified: "date".
 *
 * Only transforms when drift_check is a scalar on a single line. If the
 * value is already an object block (no scalar on the key line), no change.
 */
function transformDriftCheck(lines) {
  const out = [];
  let changed = false;
  let error = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(/^(\s*)drift_check\s*:\s*(.*?)(\s*#.*)?$/);
    if (!m) { out.push(line); continue; }

    const indent = m[1];
    const value = (m[2] || '').trim();
    const trailingComment = m[3] || '';

    // Already an object (no scalar on the same line) — skip.
    if (value === '') { out.push(line); continue; }

    // Extract the ISO date regardless of quoting style.
    const dateMatch = value.match(/^"(\d{4}-\d{2}-\d{2})"$|^'(\d{4}-\d{2}-\d{2})'$|^(\d{4}-\d{2}-\d{2})$/);
    if (!dateMatch) {
      error = `drift_check value is not an ISO date on a single line — manual migration required. Line: ${line.trim()}`;
      out.push(line);
      continue;
    }
    const date = dateMatch[1] || dateMatch[2] || dateMatch[3];

    out.push(`${indent}drift_check:${trailingComment ? ' ' + trailingComment : ''}`);
    out.push(`${indent}  last_verified: "${date}"`);
    changed = true;
  }

  return { changed, lines: out, error };
}

/**
 * T4: compatibility: "string" → compatibility:\n  notes: "string".
 *
 * Only transforms when compatibility is a scalar string on a single line.
 */
function transformCompatibility(lines) {
  const out = [];
  let changed = false;
  let error = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(/^(\s*)compatibility\s*:\s*(.*?)(\s*#.*)?$/);
    if (!m) { out.push(line); continue; }

    const indent = m[1];
    const value = (m[2] || '').trim();
    const trailingComment = m[3] || '';

    // Already an object (no scalar on the same line) — skip.
    if (value === '') { out.push(line); continue; }

    // Extract the string value regardless of quoting style.
    let stringValue;
    if (/^".*"$/.test(value)) {
      stringValue = value.slice(1, -1);
    } else if (/^'.*'$/.test(value)) {
      stringValue = value.slice(1, -1);
    } else {
      stringValue = value;
    }

    // Escape any embedded double quotes for safe YAML double-quoted re-emit.
    const escaped = stringValue.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

    out.push(`${indent}compatibility:${trailingComment ? ' ' + trailingComment : ''}`);
    out.push(`${indent}  notes: "${escaped}"`);
    changed = true;
  }

  return { changed, lines: out, error };
}

// ---------------------------------------------------------------------------
// Per-file migration pipeline.
// ---------------------------------------------------------------------------

/**
 * Apply the full v2 → v3 transformation pipeline to a single SKILL.md file.
 *
 * @returns {object} { changed, newText, note, error }
 */
function migrateFile(text) {
  const split = splitFrontmatter(text);
  if (!split) return { changed: false, newText: text, error: 'no frontmatter block found' };

  let lines = split.frontmatter;
  let anyChanged = false;
  const errors = [];

  const pipeline = [
    { name: 'schema_version', fn: transformSchemaVersion },
    { name: 'family',         fn: transformFamilyRename },
    { name: 'drift_check',    fn: transformDriftCheck },
    { name: 'compatibility',  fn: transformCompatibility },
  ];

  for (const step of pipeline) {
    const result = step.fn(lines);
    if (result.error) errors.push(`${step.name}: ${result.error}`);
    if (result.changed) anyChanged = true;
    lines = result.lines;
  }

  const newText = joinDocument(lines, split.body);
  return {
    changed: anyChanged,
    newText,
    error: errors.length > 0 ? errors.join('; ') : null,
  };
}

// ---------------------------------------------------------------------------
// CLI entry.
// ---------------------------------------------------------------------------

function collectTargets(args) {
  const includeTemplate = args.includes('--include-template');
  const explicit = args.filter(a => !a.startsWith('--'));
  const targets = [];

  if (explicit.length === 0) {
    if (fs.existsSync(SKILLS_DIR)) {
      for (const name of fs.readdirSync(SKILLS_DIR).sort()) {
        const skillMd = path.join(SKILLS_DIR, name, 'SKILL.md');
        if (fs.existsSync(skillMd)) targets.push(skillMd);
      }
    }
    if (includeTemplate && fs.existsSync(TEMPLATE_PATH)) targets.push(TEMPLATE_PATH);
    return targets;
  }

  for (const arg of explicit) {
    const abs = path.resolve(arg);
    if (!fs.existsSync(abs)) {
      console.error(`ERROR ${arg}: path does not exist`);
      process.exit(1);
    }
    const stat = fs.statSync(abs);
    if (stat.isDirectory()) {
      // Directory: if it contains SKILL.md, migrate that; otherwise walk for skill dirs.
      const skillMd = path.join(abs, 'SKILL.md');
      if (fs.existsSync(skillMd)) {
        targets.push(skillMd);
      } else {
        for (const name of fs.readdirSync(abs).sort()) {
          const nested = path.join(abs, name, 'SKILL.md');
          if (fs.existsSync(nested)) targets.push(nested);
        }
      }
    } else if (abs.endsWith('.md')) {
      targets.push(abs);
    }
  }

  return targets;
}

/**
 * Produce a simple unified-ish diff summary (line-granular) for --dry-run.
 */
function diffSummary(oldText, newText) {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const diffs = [];
  // Use a cheap line-by-line comparison; sufficient for frontmatter diffs.
  const maxLen = Math.max(oldLines.length, newLines.length);
  for (let i = 0; i < maxLen; i++) {
    if (oldLines[i] !== newLines[i]) {
      if (oldLines[i] !== undefined) diffs.push(`  - ${oldLines[i]}`);
      if (newLines[i] !== undefined) diffs.push(`  + ${newLines[i]}`);
    }
  }
  return diffs.join('\n');
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const targets = collectTargets(args);

  if (targets.length === 0) {
    console.error('No SKILL.md files found to migrate.');
    process.exit(1);
  }

  let changedCount = 0;
  let errorCount = 0;

  for (const filePath of targets) {
    const rel = path.relative(REPO_ROOT, filePath);
    let text;
    try {
      text = fs.readFileSync(filePath, 'utf8');
    } catch (e) {
      console.error(`ERROR ${rel}: cannot read — ${e.message}`);
      errorCount++;
      continue;
    }

    const result = migrateFile(text);

    if (result.error) {
      console.error(`MANUAL ${rel}: ${result.error}`);
      errorCount++;
      continue;
    }

    if (!result.changed) {
      console.log(`SKIP  ${rel} (already v3 or nothing to migrate)`);
      continue;
    }

    if (dryRun) {
      console.log(`DIFF  ${rel}`);
      console.log(diffSummary(text, result.newText));
    } else {
      fs.writeFileSync(filePath, result.newText, 'utf8');
      console.log(`OK    ${rel}`);
    }
    changedCount++;
  }

  const verb = dryRun ? 'would migrate' : 'migrated';
  console.log(`\n${targets.length} file(s) processed, ${changedCount} ${verb}, ${errorCount} needing manual attention.`);
  process.exit(errorCount > 0 ? 1 : 0);
}

main();
