#!/usr/bin/env node
/**
 * Skill Graph lint tool — canonical-source schema gate.
 *
 * Per the skill-audit doctrine (ADR 0011 / SYNTHESIS §6 / 2026-05-19 user
 * directive): lint exists ONLY to enforce canonical-source constraints that
 * apply to Skill Metadata Protocol authoring. Export-specific constraints for
 * plain Agent Skills / skills.sh are enforced by the marketplace export tools,
 * not by this canonical-source linter.
 * Project-internal routing topology, eval coherence, schema parity, and other
 * infrastructure invariants belong in single-purpose tools (drift sentinel,
 * manifest validator, routing engine), NOT here.
 *
 * Quality (does this skill teach the agent its topic?) is measured by the
 * application-eval pipeline (gate 9), not by lint.
 *
 * The checks below are the entire contract:
 *
 *   1. Valid YAML frontmatter (parser invariant; every consumer needs this)
 *   2. Frontmatter validates against schemas/skill.schema.json (canonical;
 *      resolved from the package root when the caller workspace has no local
 *      schema copy)
 *   3. `name` field uses Skill Metadata Protocol identifier shape
 *   4. `description` field is non-empty
 *   5. Parent directory name equals the last `name` segment
 *   6. `subjects[0]` matches `subject` when both v8 fields are present
 *
 * Exit 0 on success, 1 on any failure.
 *
 * Usage:
 *   node scripts/skill-lint.js                       # lint all skills
 *   node scripts/skill-lint.js skills/a11y           # lint one skill by path
 *   node scripts/skill-lint.js a11y                  # lint one skill by name
 *   node scripts/skill-lint.js a11y --path ../skills/skills
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
const {
  collectSkillFilesFromRoots,
  loadWorkspaceConfig,
  packageRoot,
  resolveSchemaPath,
  resolveSkillRoots,
  workspaceRoot,
} = require('./lib/roots');
const { formatCodeFrame, locateYamlKey } = require('./lint/format-code-frame');

const REPO_ROOT = workspaceRoot();
const PACKAGE_ROOT = packageRoot();
const TEMPLATE_PATH = [
  path.join(REPO_ROOT, 'examples', 'skill-metadata-template.md'),
  path.join(PACKAGE_ROOT, 'examples', 'skill-metadata-template.md'),
].find(candidate => fs.existsSync(candidate)) || path.join(PACKAGE_ROOT, 'examples', 'skill-metadata-template.md');
const SCHEMA_PATH = resolveSchemaPath(REPO_ROOT, 'skill.schema.json');
const WORKSPACE_CONFIG = loadWorkspaceConfig(REPO_ROOT, msg => process.stderr.write(`WARN ${msg}\n`));
const SKILL_ROOTS = resolveSkillRoots(REPO_ROOT, WORKSPACE_CONFIG);
const SKILL_SCHEMA = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));

// Canonical Skill Metadata Protocol identifier shape. Plain Agent Skills export
// has a stricter hyphen-only/64-char contract; that is enforced by export tools.
const NAME_PATTERN = /^[a-z0-9]+(?:[-/:][a-z0-9]+)*$/;

// ---------------------------------------------------------------------------
// Schema validation
// ---------------------------------------------------------------------------

function valueType(value) {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  return typeof value;
}

function displayValue(value) {
  if (typeof value === 'string') return `"${value}"`;
  return JSON.stringify(value);
}

function pathToField(pointer) {
  if (!pointer || pointer === '/') return 'frontmatter';
  return pointer.replace(/^\//, '').replace(/\//g, '.');
}

function displaySchemaPath() {
  const relToWorkspace = path.relative(REPO_ROOT, SCHEMA_PATH);
  if (!relToWorkspace.startsWith('..') && !path.isAbsolute(relToWorkspace)) return relToWorkspace;
  const relToPackage = path.relative(PACKAGE_ROOT, SCHEMA_PATH);
  if (!relToPackage.startsWith('..') && !path.isAbsolute(relToPackage)) return `package:${relToPackage}`;
  return SCHEMA_PATH;
}

function sameJson(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function matchesType(value, expected) {
  const actual = valueType(value);
  if (Array.isArray(expected)) return expected.some(t => matchesType(value, t));
  if (expected === 'integer') return typeof value === 'number' && Number.isInteger(value);
  if (expected === 'number') return typeof value === 'number' && Number.isFinite(value);
  return actual === expected;
}

function validateFormat(value, format) {
  if (format === 'date') return /^\d{4}-\d{2}-\d{2}$/.test(value);
  if (format === 'date-time') return !Number.isNaN(Date.parse(value));
  return true;
}

function validatePattern(value, pattern) {
  try {
    return new RegExp(pattern).test(value);
  } catch {
    return true;
  }
}

function validateWithSchema(value, schema, pointer = '', errors = []) {
  if (!schema || typeof schema !== 'object') return errors.length === 0;
  const startErrorCount = errors.length;

  if (Array.isArray(schema.allOf)) {
    for (const subSchema of schema.allOf) validateWithSchema(value, subSchema, pointer, errors);
  }

  if (Array.isArray(schema.anyOf)) {
    const passCount = schema.anyOf.filter(subSchema => validateSilently(value, subSchema)).length;
    if (passCount === 0) {
      errors.push({
        field: pathToField(pointer),
        msg: 'schema anyOf violation: value must match at least one allowed shape',
      });
    }
  }

  if (Array.isArray(schema.oneOf)) {
    const passCount = schema.oneOf.filter(subSchema => validateSilently(value, subSchema)).length;
    if (passCount !== 1) {
      errors.push({
        field: pathToField(pointer),
        msg: `schema oneOf violation: value must match exactly one allowed shape (matched ${passCount})`,
      });
    }
  }

  if (schema.not && validateSilently(value, schema.not)) {
    errors.push({
      field: pathToField(pointer),
      msg: 'schema not violation: value matches a forbidden shape',
    });
  }

  if (schema.if && validateSilently(value, schema.if)) {
    if (schema.then) validateWithSchema(value, schema.then, pointer, errors);
  } else if (schema.else) {
    validateWithSchema(value, schema.else, pointer, errors);
  }

  if (schema.const !== undefined && !sameJson(value, schema.const)) {
    errors.push({
      field: pathToField(pointer),
      msg: `const-fail: expected ${displayValue(schema.const)} (got ${displayValue(value)})`,
    });
  }

  if (Array.isArray(schema.enum) && !schema.enum.some(item => sameJson(value, item))) {
    errors.push({
      field: pathToField(pointer),
      msg: `enum-fail: must be one of ${schema.enum.map(displayValue).join(', ')} (got ${displayValue(value)})`,
    });
  }

  if (schema.type && !matchesType(value, schema.type)) {
    errors.push({
      field: pathToField(pointer),
      msg: `type-fail: must be ${Array.isArray(schema.type) ? schema.type.join(' or ') : schema.type} (got ${valueType(value)})`,
    });
    return errors.length === startErrorCount;
  }

  if ((schema.required || schema.properties || schema.additionalProperties === false) &&
      value && typeof value === 'object' && !Array.isArray(value)) {
    if (Array.isArray(schema.required)) {
      for (const requiredField of schema.required) {
        if (!(requiredField in value)) {
          errors.push({
            field: requiredField,
            msg: `required-missing: \`${requiredField}\` is required by ${displaySchemaPath()}`,
          });
        }
      }
    }

    if (schema.properties && typeof schema.properties === 'object') {
      for (const [key, subSchema] of Object.entries(schema.properties)) {
        if (key in value) validateWithSchema(value[key], subSchema, `${pointer}/${key}`, errors);
      }
    }

    if (schema.additionalProperties === false && schema.properties) {
      const allowed = new Set(Object.keys(schema.properties));
      for (const key of Object.keys(value)) {
        if (!allowed.has(key)) {
          errors.push({
            field: key,
            msg: `additionalProperty: \`${key}\` is not declared in ${displaySchemaPath()}`,
          });
        }
      }
    }
  }

  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      errors.push({
        field: pathToField(pointer),
        msg: `minItems-fail: expected at least ${schema.minItems} item(s)`,
      });
    }
    if (schema.maxItems !== undefined && value.length > schema.maxItems) {
      errors.push({
        field: pathToField(pointer),
        msg: `maxItems-fail: expected at most ${schema.maxItems} item(s)`,
      });
    }
    if (schema.uniqueItems) {
      const seen = new Set();
      for (const item of value) {
        const key = JSON.stringify(item);
        if (seen.has(key)) {
          errors.push({
            field: pathToField(pointer),
            msg: 'uniqueItems-fail: duplicate array item',
          });
          break;
        }
        seen.add(key);
      }
    }
    if (Array.isArray(schema.prefixItems)) {
      for (let idx = 0; idx < Math.min(value.length, schema.prefixItems.length); idx++) {
        validateWithSchema(value[idx], schema.prefixItems[idx], `${pointer}/${idx}`, errors);
      }
    }
    if (schema.items && typeof schema.items === 'object') {
      for (let idx = 0; idx < value.length; idx++) {
        validateWithSchema(value[idx], schema.items, `${pointer}/${idx}`, errors);
      }
    }
  }

  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push({
        field: pathToField(pointer),
        msg: `minLength-fail: expected at least ${schema.minLength} character(s)`,
      });
    }
    if (schema.pattern && !validatePattern(value, schema.pattern)) {
      errors.push({
        field: pathToField(pointer),
        msg: `pattern-fail: value does not match /${schema.pattern}/`,
      });
    }
    if (schema.format && !validateFormat(value, schema.format)) {
      errors.push({
        field: pathToField(pointer),
        msg: `format-fail: value must be ${schema.format}`,
      });
    }
  }

  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) {
      errors.push({
        field: pathToField(pointer),
        msg: `minimum-fail: value must be >= ${schema.minimum}`,
      });
    }
    if (schema.maximum !== undefined && value > schema.maximum) {
      errors.push({
        field: pathToField(pointer),
        msg: `maximum-fail: value must be <= ${schema.maximum}`,
      });
    }
  }

  return errors.length === startErrorCount;
}

function validateSilently(value, schema) {
  const errors = [];
  validateWithSchema(value, schema, '', errors);
  return errors.length === 0;
}

function checkSchema(fm) {
  const errors = [];
  validateWithSchema(fm, SKILL_SCHEMA, '', errors);
  return errors;
}

// ---------------------------------------------------------------------------
// External-mandate checks
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

/**
 * Check 4 — v8 subject polyhierarchy invariant.
 * JSON Schema draft-2020-12 cannot express "array first item equals sibling
 * scalar" without non-portable extensions, so the canonical-source linter owns
 * this cross-field invariant.
 */
function checkSubjectsPrimaryMatchesSubject(fm) {
  if (!fm || typeof fm.subject !== 'string') return [];
  if (!Array.isArray(fm.subjects) || fm.subjects.length === 0) return [];
  if (fm.subjects[0] === fm.subject) return [];
  return [{
    field: 'subjects',
    msg: `\`subjects[0]\` must match \`subject\` (expected "${fm.subject}", got "${fm.subjects[0]}")`,
  }];
}

// ---------------------------------------------------------------------------
// File discovery
// ---------------------------------------------------------------------------

function parseArgs(args) {
  const parsed = {
    includeTemplate: false,
    noColor: false,
    jsonOut: false,
    strict: false,
    rootArgs: [],
    explicit: [],
  };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--include-template') {
      parsed.includeTemplate = true;
    } else if (a === '--no-color') {
      parsed.noColor = true;
    } else if (a === '--json') {
      parsed.jsonOut = true;
    } else if (a === '--strict') {
      parsed.strict = true; // retained for CLI compatibility; no warnings exist today.
    } else if (a === '--path') {
      if (args[i + 1]) parsed.rootArgs.push(args[++i]);
    } else if (a.startsWith('--path=')) {
      parsed.rootArgs.push(a.slice('--path='.length));
    } else if (a.startsWith('--')) {
      // Unknown flags are ignored for back-compat with older audit callers.
    } else {
      parsed.explicit.push(a);
    }
  }

  return parsed;
}

function rootsForArgs(parsed) {
  if (!parsed.rootArgs.length) return SKILL_ROOTS;
  return parsed.rootArgs.map(rootArg => ({
    absPath: path.resolve(rootArg),
    project: null,
  }));
}

function skillNameMatches(fm, filePath, target) {
  const normalized = String(target || '').trim();
  if (!normalized) return false;
  const parentDir = path.basename(path.dirname(filePath));
  if (parentDir === normalized) return true;
  if (!fm || typeof fm.name !== 'string') return false;
  if (fm.name === normalized) return true;
  return fm.name.split(/[/:]/).pop() === normalized;
}

function collectSkillFilesByName(skillName, roots) {
  const matches = [];
  for (const entry of collectSkillFilesFromRoots(roots)) {
    const text = fs.readFileSync(entry.filePath, 'utf8');
    const fm = normalizeFrontmatter(parseFrontmatter(text));
    if (skillNameMatches(fm, entry.filePath, skillName)) matches.push(entry.filePath);
  }
  return matches;
}

function collectSkillFilesFromExplicitArg(arg, roots) {
  const abs = path.resolve(arg);
  if (fs.existsSync(abs)) {
    if (fs.statSync(abs).isDirectory()) {
      const directSkillMd = path.join(abs, 'SKILL.md');
      if (fs.existsSync(directSkillMd)) return [directSkillMd];
      return collectSkillFilesFromRoots([{ absPath: abs, project: null }]).map(entry => entry.filePath);
    }
    if (abs.endsWith('SKILL.md') || abs.endsWith('.md')) return [abs];
  }
  return collectSkillFilesByName(arg, roots);
}

function collectSkillFiles(parsed) {
  const roots = rootsForArgs(parsed);
  const files = [];
  if (parsed.explicit.length > 0) {
    for (const arg of parsed.explicit) {
      files.push(...collectSkillFilesFromExplicitArg(arg, roots));
    }
  } else {
    files.push(...collectSkillFilesFromRoots(roots).map(entry => entry.filePath));
  }
  if (parsed.includeTemplate && fs.existsSync(TEMPLATE_PATH)) files.push(TEMPLATE_PATH);
  return [...new Set(files.map(file => path.resolve(file)))];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function lintFile(file) {
  const relPath = path.relative(REPO_ROOT, file);
  const text = fs.readFileSync(file, 'utf8');
  const fm = normalizeFrontmatter(parseFrontmatter(text));

  if (!fm) {
    return {
      file: relPath,
      ok: false,
      sourceText: text,
      errors: [{ field: 'frontmatter', msg: 'YAML frontmatter failed to parse' }],
    };
  }

  const errors = [
    ...checkSchema(fm),
    ...checkName(fm),
    ...checkDescription(fm),
    ...checkParentDirMatchesName(file, fm),
    ...checkSubjectsPrimaryMatchesSubject(fm),
  ];

  return {
    file: relPath,
    ok: errors.length === 0,
    sourceText: text,
    errors,
  };
}

function main() {
  const parsed = parseArgs(process.argv.slice(2));
  const files = collectSkillFiles(parsed);

  if (files.length === 0) {
    console.error('No skill files found to lint.');
    process.exit(1);
  }

  const results = files.map(lintFile);
  const totalErrors = results.reduce((sum, result) => sum + result.errors.length, 0);

  if (parsed.jsonOut) {
    process.stdout.write(JSON.stringify({
      files_checked: results.length,
      errors: totalErrors,
      results: results.map(({ sourceText, ...result }) => result),
    }, null, 2) + '\n');
  } else {
    for (const result of results) {
      if (result.errors.length === 0) {
        console.log(`OK   ${result.file}`);
        continue;
      }
      console.error(`FAIL ${result.file}`);
      for (const e of result.errors) {
        const lookupField = e.field === 'frontmatter' ? e.field : e.field.split('.')[0];
        const loc = locateYamlKey(result.sourceText, lookupField) || { line: 1, column: 1 };
        process.stderr.write(formatCodeFrame({
          filePath: result.file,
          line: loc.line,
          column: loc.column,
          message: e.msg,
          sourceText: result.sourceText,
          severity: 'error',
          noColor: parsed.noColor,
        }));
      }
    }
    console.log(`\n${files.length} file(s) checked, ${totalErrors} error(s).`);
  }
  process.exit(totalErrors > 0 ? 1 : 0);
}

main();
