#!/usr/bin/env node
/**
 * Skill Graph lint tool — minimal canonical-source gate.
 *
 * Per the skill-audit doctrine (ADR 0011 / SYNTHESIS §6 / 2026-05-19 user
 * directive): lint exists ONLY to enforce canonical-source constraints that
 * apply to Skill Metadata Protocol authoring. Export-specific constraints for
 * plain Agent Skills / skills.sh are enforced by the marketplace export tools,
 * not by this canonical-source linter.
 * Project-internal schema fields, routing topology, eval coherence, schema
 * parity, and other infrastructure invariants belong in single-purpose
 * tools (drift sentinel, manifest validator, routing engine), NOT here.
 *
 * Quality (does this skill teach the agent its topic?) is measured by the
 * application-eval pipeline (gate 9), not by lint.
 *
 * The four checks below are the entire contract:
 *
 *   1. Valid YAML frontmatter (parser invariant; every consumer needs this)
 *   2. `name` field present, string, Skill Metadata Protocol identifier shape
 *   3. `description` field present, string, non-empty
 *   4. Parent directory name equals the last `name` segment
 *
 * Exit 0 on success, 1 on any failure.
 *
 * Usage:
 *   node scripts/skill-lint.js                       # lint all skills
 *   node scripts/skill-lint.js skills/a11y           # lint one skill
 *   node scripts/skill-lint.js --include-template    # also lint the example template
 *   node scripts/skill-lint.js --no-color            # plain output for CI
 *
 * Removed 2026-05-19 (one commit per the user's "remove all non-mandatory"
 * directive). Prior implementation had 14 additional check functions plus
 * 6 per-check modules totaling ~1,250 lines. See `chore(lint): reduce
 * skill-lint to external-mandate-only` in git log for the full removal
 * inventory.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { parseFrontmatter, normalizeFrontmatter } = require('./lib/parse-frontmatter');
const { collectSkillFilesFromRoots, loadWorkspaceConfig, resolveSkillRoots, workspaceRoot } = require('./lib/roots');
const { formatCodeFrame, locateYamlKey } = require('./lint/format-code-frame');

const REPO_ROOT = workspaceRoot();
const TEMPLATE_PATH = path.join(REPO_ROOT, 'examples', 'skill-metadata-template.md');
const WORKSPACE_CONFIG = loadWorkspaceConfig(REPO_ROOT, msg => process.stderr.write(`WARN ${msg}\n`));
const SKILL_ROOTS = resolveSkillRoots(REPO_ROOT, WORKSPACE_CONFIG);

// Canonical Skill Metadata Protocol identifier shape. Plain Agent Skills export
// has a stricter hyphen-only/64-char contract; that is enforced by export tools.
const NAME_PATTERN = /^[a-z0-9]+(?:[-/:][a-z0-9]+)*$/;

// ---------------------------------------------------------------------------
// The 4 external-mandate checks
// ---------------------------------------------------------------------------

/**
 * Check 1 — `name` field.
 * Canonical Skill Metadata Protocol allows `/` and `:` for namespaced names;
 * export normalizes those to plain Agent Skills-compatible names.
 */
function checkName(fm) {
  const errors = [];
  if (!fm.name) {
    errors.push({ field: 'name', msg: '`name` field is required' });
    return errors;
  }
  if (typeof fm.name !== 'string') {
    errors.push({ field: 'name', msg: `\`name\` must be a string (got ${typeof fm.name})` });
    return errors;
  }
  if (!NAME_PATTERN.test(fm.name)) {
    errors.push({ field: 'name', msg: `\`name\` "${fm.name}" must be lowercase Skill Metadata Protocol identifier syntax (a-z, 0-9, hyphen, plus optional "/" and ":" namespace separators)` });
  }
  return errors;
}

/**
 * Check 2 — `description` field.
 * Canonical source descriptions can be as rich as needed. Export-specific
 * description caps are handled by export description overrides.
 */
function checkDescription(fm) {
  const errors = [];
  if (!fm.description) {
    errors.push({ field: 'description', msg: '`description` field is required' });
    return errors;
  }
  if (typeof fm.description !== 'string') {
    errors.push({ field: 'description', msg: `\`description\` must be a string (got ${typeof fm.description})` });
    return errors;
  }
  const desc = fm.description.trim();
  if (desc.length === 0) {
    errors.push({ field: 'description', msg: '`description` must be non-empty' });
    return errors;
  }
  return errors;
}

/**
 * Check 3 — parent directory matches `name`.
 * Skill Metadata Protocol expects the skill directory to match the final
 * segment of the local skill name.
 */
function checkParentDirMatchesName(filePath, fm) {
  if (path.basename(filePath) !== 'SKILL.md') return [];
  if (!fm.name || typeof fm.name !== 'string') return []; // checkName surfaces the upstream issue
  const parentDir = path.basename(path.dirname(filePath));
  // The example template lives at `examples/skill-metadata-template.md` and is
  // not in a `<name>/` directory — skip it.
  if (filePath.includes('skill-metadata-template')) return [];
  // For hierarchical/namespaced names (with `/` or `:`), match the last segment.
  const lastSegment = fm.name.split(/[/:]/).pop();
  if (parentDir !== lastSegment) {
    return [{
      field: 'name',
      msg: `parent directory "${parentDir}" does not match final \`name\` segment "${lastSegment}"`,
    }];
  }
  return [];
}

// ---------------------------------------------------------------------------
// File discovery
// ---------------------------------------------------------------------------

function collectSkillFilesFromExplicitArg(arg) {
  const abs = path.resolve(arg);
  if (!fs.existsSync(abs)) return [];
  if (fs.statSync(abs).isDirectory()) {
    const directSkillMd = path.join(abs, 'SKILL.md');
    if (fs.existsSync(directSkillMd)) return [directSkillMd];
    return collectSkillFilesFromRoots([{ absPath: abs, project: null }]).map(entry => entry.filePath);
  }
  if (abs.endsWith('SKILL.md') || abs.endsWith('.md')) return [abs];
  return [];
}

function collectSkillFiles(args) {
  const includeTemplate = args.includes('--include-template');
  const explicit = args.filter(a => !a.startsWith('--'));
  const files = [];
  if (explicit.length > 0) {
    for (const arg of explicit) {
      files.push(...collectSkillFilesFromExplicitArg(arg));
    }
  } else {
    files.push(...collectSkillFilesFromRoots(SKILL_ROOTS).map(entry => entry.filePath));
  }
  if (includeTemplate && fs.existsSync(TEMPLATE_PATH)) files.push(TEMPLATE_PATH);
  return files;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2);
  const noColor = args.includes('--no-color');
  const jsonOut = args.includes('--json');
  const files = collectSkillFiles(args);

  if (files.length === 0) {
    console.error('No skill files found to lint.');
    process.exit(1);
  }

  let totalErrors = 0;

  for (const file of files) {
    const relPath = path.relative(REPO_ROOT, file);
    const text = fs.readFileSync(file, 'utf8');
    const fm = normalizeFrontmatter(parseFrontmatter(text));

    if (!fm) {
      console.error(`FAIL ${relPath}: YAML frontmatter failed to parse`);
      totalErrors++;
      continue;
    }

    const fileErrors = [
      ...checkName(fm),
      ...checkDescription(fm),
      ...checkParentDirMatchesName(file, fm),
    ];

    if (jsonOut) {
      // Render after all files are checked.
    } else if (fileErrors.length === 0) {
      console.log(`OK   ${relPath}`);
    } else {
      console.error(`FAIL ${relPath}`);
      for (const e of fileErrors) {
        const loc = locateYamlKey(text, e.field) || { line: 1, column: 1 };
        process.stderr.write(formatCodeFrame({
          filePath: relPath,
          line: loc.line,
          column: loc.column,
          message: e.msg,
          sourceText: text,
          severity: 'error',
          noColor,
        }));
        totalErrors++;
      }
    }
  }

  if (jsonOut) {
    const results = files.map(file => {
      const relPath = path.relative(REPO_ROOT, file);
      const text = fs.readFileSync(file, 'utf8');
      const fm = normalizeFrontmatter(parseFrontmatter(text));
      const errors = fm ? [
        ...checkName(fm),
        ...checkDescription(fm),
        ...checkParentDirMatchesName(file, fm),
      ] : [{ field: 'frontmatter', msg: 'YAML frontmatter failed to parse' }];
      return { file: relPath, ok: errors.length === 0, errors };
    });
    process.stdout.write(JSON.stringify({ files_checked: files.length, errors: totalErrors, results }, null, 2) + '\n');
  } else {
    console.log(`\n${files.length} file(s) checked, ${totalErrors} error(s).`);
  }
  process.exit(totalErrors > 0 ? 1 : 0);
}

main();
