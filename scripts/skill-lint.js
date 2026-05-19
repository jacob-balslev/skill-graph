#!/usr/bin/env node
/**
 * Skill Graph lint tool — minimal external-mandate gate.
 *
 * Per the skill-audit doctrine (ADR 0011 / SYNTHESIS §6 / 2026-05-19 user
 * directive): lint exists ONLY to enforce constraints we do not control —
 * Anthropic Agent Skills marketplace format and OpenAI tool-use schema.
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
 *   2. `name` field present, string, kebab-case, ≤64 chars
 *      → Anthropic Agent Skills marketplace + OpenAI tool-use function-name cap
 *   3. `description` field present, string, non-empty, ≤1024 chars
 *      → Anthropic Agent Skills marketplace cap
 *   4. Parent directory name equals `name` field
 *      → Anthropic Agent Skills `<name>/SKILL.md` directory contract
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
const { loadWorkspaceConfig, resolveSkillRoots, workspaceRoot } = require('./lib/roots');
const { formatCodeFrame, locateYamlKey } = require('./lint/format-code-frame');

const REPO_ROOT = workspaceRoot();
const TEMPLATE_PATH = path.join(REPO_ROOT, 'examples', 'skill-metadata-template.md');
const WORKSPACE_CONFIG = loadWorkspaceConfig(REPO_ROOT, msg => process.stderr.write(`WARN ${msg}\n`));
const SKILL_ROOTS = resolveSkillRoots(REPO_ROOT, WORKSPACE_CONFIG);

// Anthropic Agent Skills marketplace caps.
const NAME_MAX_CHARS = 64;
const DESCRIPTION_MAX_CHARS = 1024;
const NAME_PATTERN = /^[a-z0-9]+(?:[-/:][a-z0-9]+)*$/;

// ---------------------------------------------------------------------------
// The 4 external-mandate checks
// ---------------------------------------------------------------------------

/**
 * Check 1 — `name` field.
 * Anthropic Agent Skills marketplace requires a non-empty kebab-case name.
 * OpenAI tool-use schema additionally caps function names at 64 chars.
 */
function checkName(fm) {
  const errors = [];
  if (!fm.name) {
    errors.push({ field: 'name', msg: '`name` field is required (Anthropic Agent Skills + OpenAI tool-use mandate)' });
    return errors;
  }
  if (typeof fm.name !== 'string') {
    errors.push({ field: 'name', msg: `\`name\` must be a string (got ${typeof fm.name})` });
    return errors;
  }
  if (fm.name.length > NAME_MAX_CHARS) {
    errors.push({ field: 'name', msg: `\`name\` length ${fm.name.length} exceeds the ${NAME_MAX_CHARS}-char cap (OpenAI tool-use function-name limit)` });
  }
  if (!NAME_PATTERN.test(fm.name)) {
    errors.push({ field: 'name', msg: `\`name\` "${fm.name}" must be lowercase kebab-case (a-z, 0-9, hyphen; "/" and ":" allowed for hierarchical/namespaced names)` });
  }
  return errors;
}

/**
 * Check 2 — `description` field.
 * Anthropic Agent Skills marketplace requires a non-empty description and
 * rejects skills with descriptions over 1024 chars.
 */
function checkDescription(fm) {
  const errors = [];
  if (!fm.description) {
    errors.push({ field: 'description', msg: '`description` field is required (Anthropic Agent Skills marketplace mandate)' });
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
  if (fm.description.length > DESCRIPTION_MAX_CHARS) {
    errors.push({ field: 'description', msg: `\`description\` length ${fm.description.length} exceeds the ${DESCRIPTION_MAX_CHARS}-char Anthropic Agent Skills marketplace cap` });
  }
  return errors;
}

/**
 * Check 3 — parent directory matches `name`.
 * Anthropic Agent Skills format requires the SKILL.md file to live at
 * `<name>/SKILL.md`. The loader resolves skills by directory name.
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
      msg: `parent directory "${parentDir}" does not match \`name\` "${fm.name}" (Anthropic Agent Skills <name>/SKILL.md directory contract)`,
    }];
  }
  return [];
}

// ---------------------------------------------------------------------------
// File discovery
// ---------------------------------------------------------------------------

function collectSkillFilesFromRoot(rootDir, depth = 0) {
  const files = [];
  if (!fs.existsSync(rootDir)) return files;
  if (depth > 3) return files;
  for (const name of fs.readdirSync(rootDir)) {
    if (name.startsWith('_') || name.startsWith('.')) continue;
    const entryPath = path.join(rootDir, name);
    if (!fs.statSync(entryPath).isDirectory()) continue;
    const skillMd = path.join(entryPath, 'SKILL.md');
    if (fs.existsSync(skillMd)) {
      files.push(skillMd);
    } else {
      files.push(...collectSkillFilesFromRoot(entryPath, depth + 1));
    }
  }
  return files;
}

function collectSkillFilesFromRoots(roots) {
  return roots.flatMap(root => collectSkillFilesFromRoot(root.absPath));
}

function collectSkillFilesFromExplicitArg(arg) {
  const abs = path.resolve(arg);
  if (!fs.existsSync(abs)) return [];
  if (fs.statSync(abs).isDirectory()) {
    const directSkillMd = path.join(abs, 'SKILL.md');
    if (fs.existsSync(directSkillMd)) return [directSkillMd];
    return collectSkillFilesFromRoot(abs);
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
    files.push(...collectSkillFilesFromRoots(SKILL_ROOTS));
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

    if (fileErrors.length === 0) {
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

  console.log(`\n${files.length} file(s) checked, ${totalErrors} error(s).`);
  process.exit(totalErrors > 0 ? 1 : 0);
}

main();
