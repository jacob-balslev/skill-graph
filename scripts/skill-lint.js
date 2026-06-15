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
 *   2. Frontmatter validates against schemas/SKILL_METADATA_PROTOCOL_schema.json (canonical;
 *      resolved from the package root when the caller workspace has no local
 *      schema copy)
 *   3. `name` field uses Skill Metadata Protocol identifier shape
 *   4. `description` field is non-empty
 *   5. Parent directory name equals the last `name` segment
 *   6. `subjects[0]` matches `subject` when both v8 fields are present
 *   7. The five skill-content body sections are present (`## Concept of the skill`
 *      — which must LEAD the others — `## Coverage`, `## Philosophy of the skill`,
 *      `## Verification`, `## Do NOT Use When`) — REQUIRED_SKILL_BODY_SECTIONS.
 *      Skill-content sections only; no audit/eval/provenance section is required
 *      (that state lives in the audit-state.json sidecar). Added 2026-06-08,
 *      reversing the 2026-05-19 "body structure is author judgment" stance.
 *      Since 2026-06-10 each present required section must also carry SUBSTANTIVE
 *      content (a heading over an empty body is the same defect as a missing
 *      section wearing a heading).
 *   8. `scope` is non-blank when present (the schema requires the field but,
 *      without a contract-tightening minLength, accepts an empty string — lint
 *      owns the non-blank gate, mirroring the `description` check).
 *   9. `compatibility` legacy/preferred alias pairs match when both are present
 *      (runtimes/agent_runtimes, node/node_version). The schema documents
 *      "when both are present they must match" but JSON Schema cannot express
 *      cross-field equality — lint owns it.
 *  10. Every `relations.*` target resolves to a known sibling skill in the
 *      linted roots. Relation targets are graph foreign keys; schema validation
 *      checks item shape, while lint owns target existence.
 *
 *  ADVISORY (warnings, never fail the run): keywords cap (>10 entries — the
 *      documented v8 anti-stuffing cap, deliberately not a schema maxItems);
 *      retired tokens in field-purpose comments (a comment that still TEACHES a
 *      retired field or carries a stale "pending ADR-0018" claim mis-teaches
 *      cold-start readers at the point of contact — the corpus refresh is
 *      CONTENT-mode audit-loop work; this is its deterministic detector).
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
const SCHEMA_PATH = resolveSchemaPath(REPO_ROOT, 'SKILL_METADATA_PROTOCOL_schema.json');
const WORKSPACE_CONFIG = loadWorkspaceConfig(REPO_ROOT, msg => process.stderr.write(`WARN ${msg}\n`));
const SKILL_ROOTS = resolveSkillRoots(REPO_ROOT, WORKSPACE_CONFIG);
const SKILL_SCHEMA = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
// ADR-0019 audit-state sidecar schema (sibling `audit-state.json`). Optional on
// disk (absent = unmigrated/new skill); validated + cross-checked when present.
const AUDIT_STATE_SCHEMA_PATH = resolveSchemaPath(REPO_ROOT, 'skill-audit-state.schema.json');
const AUDIT_STATE_SCHEMA = (() => {
  try { return JSON.parse(fs.readFileSync(AUDIT_STATE_SCHEMA_PATH, 'utf8')); } catch { return null; }
})();
// The five flat Understanding fields the comprehension grader reads. The
// normalizer canonicalizes the deprecated top-level `boundary` alias to
// `concept_boundary` (ADR-0018) before lint sees the frontmatter.
const UNDERSTANDING_FIELDS = ['mental_model', 'purpose', 'concept_boundary', 'analogy', 'misconception'];
const RELATION_TARGET_KEYS = [
  'adjacent',
  'related',
  'broader',
  'narrower',
  'suppresses',
  'boundary',
  'disjoint_with',
  'verify_with',
  'depends_on',
];

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
  // SKI-250: validate `uri` too — it is used by the schema and was previously
  // passing unchecked. A genuinely UNKNOWN format still returns true: per JSON
  // Schema, `format` is an annotation (not an assertion) for unrecognized
  // formats, so permissiveness there is spec-correct, not a fail-open bug.
  if (format === 'uri') {
    try { new URL(value); return true; } catch { return false; }
  }
  return true;
}

function validatePattern(value, pattern) {
  try {
    return new RegExp(pattern).test(value);
  } catch (err) {
    // SKI-250: an invalid regex in the SCHEMA is an authoring bug, not a reason
    // to silently pass the value. Surface it loudly and fail closed so the bad
    // pattern is caught instead of letting every value through unchecked.
    console.warn(`[skill-lint] invalid schema pattern ${JSON.stringify(pattern)}: ${err.message} — failing closed`);
    return false;
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

  // JSON Schema semantics (SKI-248): `else` applies ONLY when `if` is present
  // AND its condition fails. The previous flat `else if (schema.else)` fired the
  // else branch whenever `if` was absent, mis-applying else-only rules to every
  // value. Wrap both branches in an outer `if (schema.if)` so neither then nor
  // else runs when no `if` precondition is declared.
  if (schema.if) {
    if (validateSilently(value, schema.if)) {
      if (schema.then) validateWithSchema(value, schema.then, pointer, errors);
    } else if (schema.else) {
      validateWithSchema(value, schema.else, pointer, errors);
    }
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
      // v8 classification fields. When one is missing, surface the error with
      // a named label rather than the raw schema-validation pointer, so authors
      // immediately know it is a v8 conformance issue rather than a generic
      // "missing property" — the cause of the "I don't understand which check
      // fired" friction audit M3 named.
      const V8_CLASSIFICATION_FIELDS = new Set(['subject', 'public', 'scope']);
      for (const requiredField of schema.required) {
        if (!(requiredField in value)) {
          const isV8ClassificationField = V8_CLASSIFICATION_FIELDS.has(requiredField);
          errors.push({
            field: requiredField,
            msg: isV8ClassificationField
              ? `v8 classification field missing: \`${requiredField}\` is required by the v8 contract. Add it via the field-purpose comment template in examples/skill-metadata-template.md.`
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
 * Check 8 — `scope` field non-blank.
 * The schema requires `scope` but accepts an empty string (adding minLength
 * would be a contract tightening per Design Constraint 6), so lint owns the
 * non-blank gate, mirroring checkDescription. Presence and type errors are
 * checkSchema's job — this only catches present-but-blank.
 */
function checkScope(fm) {
  if (typeof fm.scope !== 'string') return []; // checkSchema owns presence + type
  if (fm.scope.trim().length === 0) {
    return [{ field: 'scope', msg: '`scope` must be non-empty — a PRD-style statement of what the skill teaches and what it does not (SKILL_METADATA_PROTOCOL.md § scope)' }];
  }
  return [];
}

/**
 * Check 9 — compatibility alias-pair equality.
 * The schema documents "when both are present they must match" for the
 * legacy/preferred alias pairs (runtimes/agent_runtimes, node/node_version)
 * but JSON Schema cannot express cross-field equality — lint owns it.
 */
function checkCompatibilityAliasEquality(fm) {
  const errors = [];
  const compat = fm && fm.compatibility;
  if (!compat || typeof compat !== 'object' || Array.isArray(compat)) return errors;
  const pairs = [
    ['runtimes', 'agent_runtimes'],
    ['node', 'node_version'],
  ];
  for (const [legacy, preferred] of pairs) {
    if (compat[legacy] === undefined || compat[preferred] === undefined) continue;
    if (JSON.stringify(compat[legacy]) !== JSON.stringify(compat[preferred])) {
      errors.push({
        field: `compatibility.${preferred}`,
        msg: `\`compatibility.${legacy}\` and \`compatibility.${preferred}\` are both present but differ — the alias pair must match (schemas/SKILL_METADATA_PROTOCOL_schema.json § compatibility). Author one of them, or make them identical.`,
      });
    }
  }
  return errors;
}

/**
 * Advisory — keywords cap (>10).
 * The documented v8 cap is max 10 (SKILL_METADATA_PROTOCOL.md § keywords,
 * anti-stuffing). The schema deliberately carries no maxItems (a tightening of
 * the published contract per Design Constraint 6), so lint owns the cap as an
 * ADVISORY warning. Keyword overlap ACROSS skills is recall, never a defect —
 * this warns only on per-skill stuffing past the documented cap.
 */
function checkKeywordsCap(fm) {
  if (!Array.isArray(fm.keywords) || fm.keywords.length <= 10) return [];
  return [{
    field: 'keywords',
    severity: 'warn',
    msg: `\`keywords\` has ${fm.keywords.length} entries — the documented v8 cap is 10 (anti-stuffing; SKILL_METADATA_PROTOCOL.md § keywords). Keep the highest-signal phrases; move prompt-shaped phrases to examples[].`,
  }];
}

/**
 * Advisory — retired tokens in field-purpose comments.
 * Field-purpose comments STAY in production skills (SKILL_METADATA_PROTOCOL.md
 * § Inline field comments), so a comment that still TEACHES a retired field —
 * or carries a stale "pending ADR-0018" claim for a rename that landed —
 * actively mis-teaches every cold-start reader at the point of contact. The
 * corpus refresh itself is CONTENT-mode audit-loop work; this warning is its
 * deterministic detector. Patterns are scoped to comment lines that DEFINE the
 * retired field (`# <field>:`) so historical mentions ("replaced the retired
 * deployment_target enum") do not false-positive.
 */
const RETIRED_COMMENT_TOKENS = [
  { pattern: /^#\s*deployment_target\s*:/, label: '`deployment_target` (retired — replaced by the boolean `public` gate; ADR-0017 amendment)' },
  { pattern: /^#\s*workspace_tags\s*:/, label: '`workspace_tags` (removed — replaced by `project[]`)' },
  { pattern: /^#\s*eval_status\s*:/, label: '`eval_status` (retired — replaced by the Evaluation Status triple)' },
  { pattern: /^#\s*operation\s*:/, label: '`operation` (retired 2026-05-27; ADR-0017 amendment)' },
  { pattern: /pending ADR-0018/, label: '"pending ADR-0018" (stale — the ADR-0018 renames LANDED; `relations.suppresses` and `concept_boundary` are canonical)' },
];

function checkRetiredTokensInComments(sourceText) {
  const warnings = [];
  if (typeof sourceText !== 'string' || !sourceText.startsWith('---\n')) return warnings;
  const lines = sourceText.split('\n');
  const fmEnd = lines.indexOf('---', 1);
  if (fmEnd < 0) return warnings;
  const found = new Map();
  for (let i = 1; i < fmEnd; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed.startsWith('#')) continue;
    for (const { pattern, label } of RETIRED_COMMENT_TOKENS) {
      if (pattern.test(trimmed) && !found.has(label)) found.set(label, i + 1);
    }
  }
  for (const [label, line] of found) {
    warnings.push({
      field: 'frontmatter',
      severity: 'warn',
      msg: `field-purpose comment (line ${line}) teaches a retired contract: ${label}. Stale comments mis-teach at the point of contact — refresh from skill-metadata-protocol/field-reference.md on the next /audit:improve pass.`,
    });
  }
  return warnings;
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
 * Check 5b — relations.suppresses reason-text orientation (audit M4, advisory).
 *
 * skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md § Relations says this
 * predicate is an ownership exclusion ("exclude them when I win") and
 * recommends ownership reason-text ("I own X over them"), not deference
 * ("use that-skill for X"). Authors who write the inverted phrasing produce
 * semantically wrong relations that still validate.
 *
 * This check inspects each `relations.suppresses[].reason` string (or legacy
 * `boundary[].reason`) for deference phrases and warns when found. The advisory warning lets the
 * author rephrase before the inverted reason ships.
 */
function checkBoundaryReasonText(fm) {
  const warnings = [];
  if (!fm || typeof fm !== 'object' || !fm.relations) return warnings;
  // `suppresses` is the canonical routing-exclusion edge (ADR-0018); fall back
  // to the deprecated `boundary` alias for unmigrated skills.
  const boundary = Array.isArray(fm.relations.suppresses)
    ? fm.relations.suppresses
    : fm.relations.boundary;
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
          field: 'relations.suppresses',
          severity: 'warn',
          msg: `suppresses reason reads as deference ("${reason.slice(0, 80)}${reason.length > 80 ? '…' : ''}") — recommend ownership phrasing ("I own X over ${edge.skill || 'the listed skill'}"). The suppresses mechanic excludes the listed skill from co-routing when this skill wins; deference wording inverts the intent. See skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md § Relations § suppresses.`,
        });
        break;
      }
    }
  }

  return warnings;
}

/**
 * Check 5c — cross-domain relations.suppresses (advisory).
 *
 * Per skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md § Relations: a suppresses edge is a
 * SAME-DOMAIN routing-exclusion guard — when THIS skill wins a query the listed
 * sibling is suppressed from co-routing, which only makes sense between skills
 * that compete on the same browse shelf (same `subject`). A suppresses edge pointing at
 * a DIFFERENT subject is almost always a mis-modeled cross-domain distinction
 * that belongs in `anti_examples` + `relations.related`, not as an exclusion
 * guard. Warns when the target's subject is known and differs from this skill's
 * subject; when the target is outside the linted roots its subject is unknown
 * and the edge is skipped. Requires the corpus subject registry built in main().
 */
function checkCrossDomainBoundary(fm, subjectRegistry) {
  const warnings = [];
  if (!fm || typeof fm !== 'object' || !fm.relations) return warnings;
  if (!subjectRegistry || typeof subjectRegistry.get !== 'function') return warnings;
  // `suppresses` is the canonical routing-exclusion edge (ADR-0018); fall back
  // to the deprecated `boundary` alias for unmigrated skills.
  const boundary = Array.isArray(fm.relations.suppresses)
    ? fm.relations.suppresses
    : fm.relations.boundary;
  if (!Array.isArray(boundary)) return warnings;
  const sourceSubject = typeof fm.subject === 'string' ? fm.subject : null;
  if (!sourceSubject) return warnings;

  for (const edge of boundary) {
    const target = typeof edge === 'string'
      ? edge
      : (edge && typeof edge === 'object' ? edge.skill : null);
    if (typeof target !== 'string' || !target) continue;
    const targetName = target.split(/[/:]/).pop();
    const targetSubject = subjectRegistry.get(target) || subjectRegistry.get(targetName);
    if (!targetSubject) continue; // target outside linted roots — cannot judge domain
    if (targetSubject !== sourceSubject) {
      warnings.push({
        field: 'relations.suppresses',
        severity: 'warn',
        msg: `cross-domain suppresses: "${targetName}" is in subject "${targetSubject}", but a suppresses edge is a SAME-DOMAIN routing-exclusion guard (this skill's subject is "${sourceSubject}"). A cross-domain distinction belongs in anti_examples + relations.related, not a suppression edge. See skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md § Relations.`,
      });
    }
  }
  return warnings;
}

function relationTargetName(edge) {
  if (typeof edge === 'string') return edge;
  if (edge && typeof edge === 'object' && typeof edge.skill === 'string') return edge.skill;
  return null;
}

/**
 * Check 10 — relation target existence.
 *
 * JSON Schema validates relation item shape but cannot know which sibling
 * skills exist in the caller's library. The linter owns that graph-health
 * invariant: every named relation target must resolve by full skill name or by
 * the final local name segment in the linted roots.
 */
function checkRelationTargetsExist(fm, subjectRegistry) {
  const errors = [];
  if (!fm || typeof fm !== 'object' || !fm.relations || typeof fm.relations !== 'object') return errors;
  if (!subjectRegistry || typeof subjectRegistry.has !== 'function') return errors;

  for (const kind of RELATION_TARGET_KEYS) {
    const edges = fm.relations[kind];
    if (!Array.isArray(edges)) continue;
    for (const edge of edges) {
      const target = relationTargetName(edge);
      if (typeof target !== 'string' || target.trim() === '') continue;
      const normalized = target.trim();
      const localName = normalized.split(/[/:]/).pop();
      if (subjectRegistry.has(normalized) || subjectRegistry.has(localName)) continue;
      errors.push({
        field: `relations.${kind}`,
        msg: `relations.${kind}: "${normalized}" does not match any known skill in the linted roots. Add the missing skill, correct the target name, or include the root that contains the target.`,
      });
    }
  }

  return errors;
}

/**
 * Check 5 — field-purpose comment presence (audit H8, advisory).
 *
 * skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md § Inline field comments mandates that every
 * authored frontmatter field carries a YAML `#` comment block immediately
 * above it (purpose + allowed values + when-to-use). The convention prevents
 * the "this field looks like dead code, let me delete it" failure mode and
 * keeps cold-start agents from needing to open skill-metadata-protocol/field-reference.md at
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
      msg: `${uncommentedFields} top-level field(s) missing field-purpose comment (skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md § Inline field comments). Run \`node scripts/backfill-field-purpose-comments.js\` to add.`,
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
      parsed.strict = true; // retained for CLI compatibility; advisory warnings do not fail the run.
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

// Build a name -> subject map across the given roots, consumed by Check 5c
// (cross-domain boundary) to resolve each boundary target's subject. Built once
// per run from the same roots being linted; targets outside these roots resolve
// to undefined and are skipped by the check.
function buildSubjectRegistry(roots) {
  const registry = new Map();
  for (const entry of collectSkillFilesFromRoots(roots)) {
    let fm;
    try {
      fm = normalizeFrontmatter(parseFrontmatter(fs.readFileSync(entry.filePath, 'utf8')));
    } catch { continue; }
    if (fm && typeof fm.name === 'string' && typeof fm.subject === 'string') {
      registry.set(fm.name, fm.subject);
      registry.set(fm.name.split(/[/:]/).pop(), fm.subject);
    }
  }
  return registry;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

// ADR-0019 cross-file checks. The audit-state.json sidecar is optional on disk
// (absent = unmigrated or brand-new skill — not an error). When present:
//   1. validate it against schemas/skill-audit-state.schema.json;
//   2. enforce the cross-file gate that used to live in the frontmatter schema's
//      allOf but is now cross-file: comprehension_state: present (sidecar) ⇒ the
//      five flat Understanding fields (frontmatter).
// The eval_state ⇒ eval_artifacts gate stays intra-sidecar (step 1 catches it);
// the stability ⇒ superseded_by gate stays intra-frontmatter (checkSchema catches it).
function checkAuditStateSidecar(file, fm) {
  const errors = [];
  const sidecarPath = path.join(path.dirname(file), 'audit-state.json');
  if (!fs.existsSync(sidecarPath)) return errors; // optional — unmigrated/new skill
  let sidecar;
  try {
    sidecar = JSON.parse(fs.readFileSync(sidecarPath, 'utf8'));
  } catch (e) {
    return [{ field: 'audit-state.json', msg: `audit-state.json is not valid JSON — ${e.message}` }];
  }
  if (AUDIT_STATE_SCHEMA) {
    const schemaErrors = [];
    validateWithSchema(sidecar, AUDIT_STATE_SCHEMA, '', schemaErrors);
    for (const se of schemaErrors) {
      errors.push({ field: `audit-state.json:${se.field || 'sidecar'}`, msg: se.msg });
    }
  }
  if (sidecar && sidecar.comprehension_state === 'present') {
    const missing = UNDERSTANDING_FIELDS.filter(f => fm[f] === undefined || fm[f] === null || fm[f] === '');
    if (missing.length > 0) {
      errors.push({
        field: 'comprehension_state',
        msg: `audit-state.json declares comprehension_state: present, but SKILL.md frontmatter is missing required Understanding field(s): ${missing.join(', ')} (ADR-0019 cross-file gate).`,
      });
    }
  }
  return errors;
}

const AUDIT_STATUS_VERDICT_FIELDS = [
  'structural_verdict',
  'truth_verdict',
  'comprehension_verdict',
];

function checkAuditStatusCoverage(file) {
  const warnings = [];
  const sidecarPath = path.join(path.dirname(file), 'audit-state.json');
  if (!fs.existsSync(sidecarPath)) return warnings;
  let sidecar;
  try {
    sidecar = JSON.parse(fs.readFileSync(sidecarPath, 'utf8'));
  } catch (_) {
    return warnings; // JSON validity is already reported by checkAuditStateSidecar.
  }
  const missing = AUDIT_STATUS_VERDICT_FIELDS.filter(field => sidecar[field] === undefined);
  if (missing.length > 0) {
    warnings.push({
      field: 'audit-state.json',
      msg: `audit-state.json is missing Audit Status verdict field(s): ${missing.join(', ')}. This is report-only migration debt: run the Skill Audit Loop to stamp honest verdicts, do not hand-author them.`,
    });
  }
  return warnings;
}

// The skill-CONTENT body sections every skill must carry. This closes the
// long-standing loophole where body-section structure was "author judgment, not
// lint-enforced" (2026-05-19) — a skill could silently omit its behavior-change
// surfaces (## Verification, ## Do NOT Use When). Per the 2026-06-08 user
// directive, lint now REQUIRES every skill-content section and requires NO
// audit/eval/provenance section (those live in the audit-state.json sidecar).
// `## Concept of the skill` must lead (line <= 100) — it is what the agent reads first.
// `## Concept of the skill` must LEAD (be the first of the required sections);
// the other four have no ordering constraint. Position is measured by section
// order, not absolute file line, so a skill with rich frontmatter is not
// penalised.
const REQUIRED_SKILL_BODY_SECTIONS = [
  { heading: 'Concept of the skill', leads: true },
  { heading: 'Coverage' },
  { heading: 'Philosophy of the skill' },
  { heading: 'Verification' },
  { heading: 'Do NOT Use When' },
];

function checkRequiredBodySections(text) {
  const errors = [];
  const lines = text.split('\n');
  const headingLine = new Map();
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^##\s+(.+?)\s*$/);
    if (m && !headingLine.has(m[1])) headingLine.set(m[1], i + 1);
  }
  for (const sec of REQUIRED_SKILL_BODY_SECTIONS) {
    if (!headingLine.has(sec.heading)) {
      errors.push({
        field: `## ${sec.heading}`,
        msg: `required skill-content body section missing: \`## ${sec.heading}\`. Every skill must carry the five skill-content sections (Concept of the skill, Coverage, Philosophy of the skill, Verification, Do NOT Use When). Audit/eval/provenance sections are NOT required here — they live in audit-state.json.`,
      });
    }
  }
  // Non-emptiness (2026-06-10): a present required heading with no substantive
  // content under it is the same defect as a missing section wearing a heading.
  // Live specimen that motivated the check: a `## Concept of the skill` whose
  // entire body was a stray `|` (block-scalar paste artifact) — it passed the
  // presence gate while teaching nothing. "Substantive" = at least one content
  // line with two or more consecutive word characters before the next heading.
  const allHeadingIdx = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^#{1,6}\s/.test(lines[i])) allHeadingIdx.push(i);
  }
  for (const sec of REQUIRED_SKILL_BODY_SECTIONS) {
    const ln = headingLine.get(sec.heading);
    if (ln === undefined) continue; // missing — already errored above
    const startIdx = ln - 1; // headingLine is 1-based
    const nextHeadingIdx = allHeadingIdx.find(idx => idx > startIdx);
    const content = lines.slice(startIdx + 1, nextHeadingIdx === undefined ? lines.length : nextHeadingIdx);
    const substantive = content.some(line => /\w{2,}/.test(line));
    if (!substantive) {
      errors.push({
        field: `## ${sec.heading}`,
        msg: `required skill-content section \`## ${sec.heading}\` is present but EMPTY — a heading with no substantive content under it teaches nothing. Author the section (CONTENT-mode work via /audit:improve when fixing an existing skill).`,
      });
    }
  }
  // `## Concept of the skill` must lead: appear before every other present
  // required section.
  const conceptLn = headingLine.get('Concept of the skill');
  if (conceptLn !== undefined) {
    for (const sec of REQUIRED_SKILL_BODY_SECTIONS) {
      if (sec.heading === 'Concept of the skill') continue;
      const ln = headingLine.get(sec.heading);
      if (ln !== undefined && ln < conceptLn) {
        errors.push({
          field: '## Concept of the skill',
          msg: `\`## Concept of the skill\` must lead the skill-content sections, but \`## ${sec.heading}\` (line ${ln}) precedes it (line ${conceptLn}). Place Concept of the skill first, immediately after the title.`,
        });
        break;
      }
    }
  }
  return errors;
}

function lintFile(file, subjectRegistry) {
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
    ...checkScope(fm),
    ...checkParentDirMatchesName(file, fm),
    ...checkSubjectsPrimaryMatchesSubject(fm),
    ...checkCompatibilityAliasEquality(fm),
    ...checkAuditStateSidecar(file, fm),
    ...checkRequiredBodySections(text),
    ...checkRelationTargetsExist(fm, subjectRegistry),
  ];
  const warnings = [
    ...checkFieldPurposeComments(text),
    ...checkBoundaryReasonText(fm),
    ...checkCrossDomainBoundary(fm, subjectRegistry),
    ...checkKeywordsCap(fm),
    ...checkRetiredTokensInComments(text),
    ...checkAuditStatusCoverage(file),
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

  // Built once from the same roots being linted; threaded into each lintFile so
  // Check 5c can resolve boundary targets' subjects without re-walking per file.
  const subjectRegistry = buildSubjectRegistry(rootsForArgs(parsed));
  const results = files.map(file => lintFile(file, subjectRegistry));
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
