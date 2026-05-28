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
      // v8 classification (subject + scope). When one of these required axes is
      // missing, surface the error with a named-axis label rather than the raw
      // schema-validation pointer, so authors immediately know it is a v8
      // conformance issue rather than a generic "missing property" — the cause
      // of the "I don't understand which check fired" friction audit M3 named.
      const V8_AXES = new Set(['subject', 'scope']);
      for (const requiredField of schema.required) {
        if (!(requiredField in value)) {
          const isV8Axis = V8_AXES.has(requiredField);
          errors.push({
            field: requiredField,
            msg: isV8Axis
              ? `v8 axis missing: \`${requiredField}\` is a required v8 classification axis. Add it via the field-purpose comment template in examples/skill-metadata-template.md.`
              : `required-missing: \`${requiredField}\` is required by ${displaySchemaPath()}`,
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

/**
 * Check 5b — relations.boundary reason-text orientation (audit M4, advisory).
 *
 * SKILL_METADATA_PROTOCOL.md § Relations § boundary carries a WARNING that
 * the field NAME reads "defer to them" but the MECHANIC is "exclude them
 * when I win" — and recommends ownership reason-text ("I own X over them"),
 * not deference ("use that-skill for X"). Authors who write the inverted
 * phrasing produce semantically wrong relations that still validate.
 *
 * This check inspects each `relations.boundary[].reason` string for
 * deference phrases and warns when found. The advisory warning lets the
 * author rephrase before the inverted reason ships.
 */
function checkBoundaryReasonText(fm) {
  const warnings = [];
  if (!fm || typeof fm !== 'object' || !fm.relations) return warnings;
  const boundary = fm.relations.boundary;
  if (!Array.isArray(boundary)) return warnings;

  // Deference phrases that imply "use that-skill for X" semantics. The
  // mechanic is the opposite — boundary EXCLUDES the listed skills from
  // co-routing when THIS skill wins — so deference wording inverts intent.
  const INVERTED_PATTERNS = [
    /\buse\s+\S+\s+(instead|for)\b/i,
    /\bdefer to\b/i,
    /\bowned by\b/i,
    /\bthat-skill (owns|handles|covers)\b/i,
  ];

  for (const edge of boundary) {
    if (!edge || typeof edge !== 'object') continue;
    const reason = edge.reason;
    if (typeof reason !== 'string') continue;
    for (const pattern of INVERTED_PATTERNS) {
      if (pattern.test(reason)) {
        warnings.push({
          field: 'relations.boundary',
          severity: 'warn',
          msg: `boundary reason reads as deference ("${reason.slice(0, 80)}${reason.length > 80 ? '…' : ''}") — recommend ownership phrasing ("I own X over ${edge.skill || 'the listed skill'}"). The boundary mechanic excludes the listed skill from co-routing when this skill wins; deference wording inverts the intent. See SKILL_METADATA_PROTOCOL.md § Relations § boundary WARNING.`,
        });
        break;
      }
    }
  }

  return warnings;
}

/**
 * Check 5 — field-purpose comment presence (audit H8, advisory).
 *
 * SKILL_METADATA_PROTOCOL.md § Inline field comments mandates that every
 * authored frontmatter field carries a YAML `#` comment block immediately
 * above it (purpose + allowed values + when-to-use). The convention prevents
 * the "this field looks like dead code, let me delete it" failure mode and
 * keeps cold-start agents from needing to open docs/field-reference.md at
 * the point of contact.
 *
 * Until backfill-field-purpose-comments.js has run corpus-wide, almost no
 * skill carries these comments (survey 2026-05-27: 0/154 fully commented,
 * 152/154 with no comments at all). To avoid breaking the verify chain on
 * a CONTENT migration that has not yet drained, the check emits warnings
 * (severity: 'warn'), not errors. The `--strict` flag exists but is
 * advisory until the corpus catches up.
 */
function checkFieldPurposeComments(sourceText) {
  const warnings = [];
  if (typeof sourceText !== 'string') return warnings;
  if (!sourceText.startsWith('---\n')) return warnings;

  const lines = sourceText.split('\n');
  const fmEnd = lines.indexOf('---', 1);
  if (fmEnd < 0) return warnings;

  const fmLines = lines.slice(1, fmEnd);
  const TOP_LEVEL_FIELD = /^([a-zA-Z_][a-zA-Z0-9_]*):/;

  // Skip the first authored field — there is no line above it inside the
  // frontmatter block. The convention's "comment immediately above each field"
  // shape can't apply to the first field without leaving a comment outside
  // the frontmatter block, which is not the convention.
  let seenFirstField = false;
  let uncommentedFields = 0;
  for (let i = 0; i < fmLines.length; i++) {
    const line = fmLines[i];
    const fieldMatch = line.match(TOP_LEVEL_FIELD);
    if (!fieldMatch) continue;
    if (!seenFirstField) { seenFirstField = true; continue; }

    // Walk back through blank lines and comment lines to find the most
    // recent non-blank line. A comment block can be 1-4 lines tall.
    let hasComment = false;
    for (let j = i - 1; j >= 0; j--) {
      const prev = fmLines[j].trim();
      if (prev === '') continue;
      if (prev.startsWith('#')) { hasComment = true; break; }
      break;
    }
    if (!hasComment) uncommentedFields++;
  }

  if (uncommentedFields > 0) {
    warnings.push({
      field: 'frontmatter',
      severity: 'warn',
      msg: `${uncommentedFields} top-level field(s) missing field-purpose comment (SKILL_METADATA_PROTOCOL.md § Inline field comments). Run \`node scripts/backfill-field-purpose-comments.js\` to add.`,
    });
  }

  return warnings;
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
  const warnings = [
    ...checkFieldPurposeComments(text),
    ...checkBoundaryReasonText(fm),
  ];

  return {
    file: relPath,
    ok: errors.length === 0,
    sourceText: text,
    errors,
    warnings,
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
  const totalWarnings = results.reduce((sum, result) => sum + (result.warnings ? result.warnings.length : 0), 0);

  if (parsed.jsonOut) {
    process.stdout.write(JSON.stringify({
      files_checked: results.length,
      errors: totalErrors,
      warnings: totalWarnings,
      results: results.map(({ sourceText, ...result }) => result),
    }, null, 2) + '\n');
  } else {
    for (const result of results) {
      const hasErrors = result.errors.length > 0;
      const hasWarnings = result.warnings && result.warnings.length > 0;
      if (!hasErrors && !hasWarnings) {
        console.log(`OK   ${result.file}`);
        continue;
      }
      console.error(`${hasErrors ? 'FAIL' : 'WARN'} ${result.file}`);
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
      for (const w of (result.warnings || [])) {
        const lookupField = w.field === 'frontmatter' ? w.field : (w.field || 'frontmatter').split('.')[0];
        const loc = locateYamlKey(result.sourceText, lookupField) || { line: 1, column: 1 };
        process.stderr.write(formatCodeFrame({
          filePath: result.file,
          line: loc.line,
          column: loc.column,
          message: w.msg,
          sourceText: result.sourceText,
          severity: 'warn',
          noColor: parsed.noColor,
        }));
      }
    }
    console.log(`\n${files.length} file(s) checked, ${totalErrors} error(s), ${totalWarnings} warning(s).`);
  }
  // Warnings never fail exit unless `--strict` is set (advisory by default —
  // the field-purpose-comment check would otherwise break the verify chain on
  // 152/154 skills that pre-date the backfill).
  const strictWarnsFail = parsed.strict && totalWarnings > 0;
  process.exit(totalErrors > 0 || strictWarnsFail ? 1 : 0);
}

main();
