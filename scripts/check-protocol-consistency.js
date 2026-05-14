#!/usr/bin/env node
/**
 * Protocol consistency checker for Skill Graph.
 *
 * Runs 8 machine-detectable checks across the repo's protocol artifacts.
 * These checks are complementary to skill-lint.js, which validates per-skill
 * schema correctness. This script validates cross-artifact consistency:
 * does the field reference doc match the schema? Does the manifest field mapping
 * accurately describe what the generator does? Is the sample manifest correct?
 *
 * The 8 checks:
 *   C1 -- Field-set parity: docs/field-reference.md section headers vs
 *         schemas/skill.schema.json top-level properties.
 *   C2 -- Authored-to-generated parity: every skill.schema.json property either
 *         appears in manifest.schema.json (possibly grouped) or is listed as
 *         intentional loss in docs/manifest-field-mapping.md.
 *   C3 -- Artifact-root convention: detect when a shipped audit example (one that
 *         exists under examples/audits/) is referenced by a bare "audits/<skill>/"
 *         path in docs, conflicting with the canonical "examples/audits/<skill>/"
 *         root. Warns on conflicts; the two-tier consumer convention itself is
 *         intentional and is not flagged.
 *   C4 -- Sample manifest correctness: examples/skills.manifest.sample.json
 *         validates against schemas/manifest.schema.json AND summary.total_skills
 *         equals skills.length.
 *   C5 -- Example truth invariants:
 *         C5a: No worked scorecard claims 'exports cleanly to all' when portability
 *              targets are still aspirational (without a qualifying phrase).
 *         C5b: No eval artifact uses "eval_status" as a JSON key (deprecated v1
 *              field; post-SH-5784 use eval_artifacts, eval_state, routing_eval).
 *         C5c: Scorecard portability rows must not use v1 sub-field names
 *              ("level" or "exports") -- use v2 names "readiness" and "targets".
 *   C6 -- Versioned schema parity: schemas/skill.v2.schema.json and
 *         schemas/manifest.v2.schema.json must be content-identical to the
 *         unversioned schemas/skill.schema.json and schemas/manifest.schema.json,
 *         modulo $id and title. Drift between them breaks the pinning promise
 *         documented in docs/skill-metadata-protocol.md § Schema Versioning Policy.
 *   C7 -- Generated field-reference parity: docs/field-reference.generated.md
 *         must match live regeneration from the current pinned skill schema.
 *   C8 -- JSON-LD context coverage: every top-level authored schema field must
 *         appear in schemas/skill.context.jsonld and every compact IRI prefix
 *         used there must be declared.
 *
 * Usage:
 *   node scripts/check-protocol-consistency.js
 *   node scripts/check-protocol-consistency.js --verbose
 *
 * Self-contained. Only uses Node built-ins -- no external dependencies.
 * Exit 0 on success, 1 on any check failure.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { parseFrontmatter } = require('./lib/parse-frontmatter');

const REPO_ROOT = path.resolve(__dirname, '..');
const VERBOSE = process.argv.includes('--verbose');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    return null;
  }
}

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return null;
  }
}

/** Extract all ## heading texts from a Markdown document. */
function extractH2Headings(text) {
  const headings = [];
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^##\s+(.+)$/);
    if (m) headings.push(m[1].trim());
  }
  return headings;
}

/** Collect all .md files recursively under a directory. */
function collectMdFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results.push(...collectMdFiles(full));
    } else if (entry.endsWith('.md')) {
      results.push(full);
    }
  }
  return results;
}

/** Minimal JSON Schema validator -- reused from generate-manifest.js. */
function validate(value, schema, pointer) {
  if (pointer === undefined) pointer = '#';
  const errors = [];
  if (!schema || typeof schema !== 'object') return errors;

  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    const matchesType = (t) => {
      if (t === 'null') return value === null;
      if (t === 'array') return Array.isArray(value);
      if (t === 'integer') return typeof value === 'number' && Number.isInteger(value);
      if (t === 'number') return typeof value === 'number';
      if (t === 'object') return typeof value === 'object' && value !== null && !Array.isArray(value);
      return typeof value === t;
    };
    if (!types.some(matchesType)) {
      const actualType = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
      errors.push(`${pointer}: expected type ${schema.type}, got ${actualType}`);
      return errors;
    }
  }

  if (schema.const !== undefined && value !== schema.const) {
    errors.push(`${pointer}: expected const ${JSON.stringify(schema.const)}, got ${JSON.stringify(value)}`);
  }

  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${pointer}: value ${JSON.stringify(value)} not in enum [${schema.enum.map(e => JSON.stringify(e)).join(', ')}]`);
  }

  if (schema.pattern && typeof value === 'string') {
    if (!new RegExp(schema.pattern).test(value)) {
      errors.push(`${pointer}: "${value}" does not match pattern ${schema.pattern}`);
    }
  }

  if (schema.format === 'date' && typeof value === 'string') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      errors.push(`${pointer}: "${value}" is not a valid date (expected YYYY-MM-DD)`);
    }
  }
  if (schema.format === 'date-time' && typeof value === 'string') {
    if (isNaN(Date.parse(value))) {
      errors.push(`${pointer}: "${value}" is not a valid date-time`);
    }
  }

  if (schema.minimum !== undefined && typeof value === 'number' && value < schema.minimum) {
    errors.push(`${pointer}: ${value} < minimum ${schema.minimum}`);
  }

  if (schema.oneOf) {
    const matchCount = schema.oneOf.filter(sub => validate(value, sub, pointer + '/oneOf').length === 0).length;
    if (matchCount !== 1) {
      errors.push(`${pointer}: does not match exactly one of the oneOf variants (matched ${matchCount})`);
    }
  }

  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const props = schema.properties || {};
    const required = schema.required || [];
    for (const req of required) {
      if (!(req in value)) {
        errors.push(`${pointer}/${req}: missing required field`);
      }
    }
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!(key in props)) {
          errors.push(`${pointer}/${key}: additional property not allowed`);
        }
      }
    }
    for (const [key, subValue] of Object.entries(value)) {
      if (props[key]) {
        errors.push(...validate(subValue, props[key], `${pointer}/${key}`));
      } else if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
        errors.push(...validate(subValue, schema.additionalProperties, `${pointer}/${key}`));
      }
    }
  }

  if (Array.isArray(value)) {
    if (schema.items) {
      for (let i = 0; i < value.length; i++) {
        errors.push(...validate(value[i], schema.items, `${pointer}/${i}`));
      }
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Check C1 -- Field-set parity
//
// The ## headings in docs/field-reference.md are the authoritative list of
// authored fields. The top-level properties of schemas/skill.schema.json are
// the schema's field list. Both sets must be identical.
// ---------------------------------------------------------------------------

function checkC1FieldSetParity() {
  const errors = [];
  const refPath = path.join(REPO_ROOT, 'docs', 'field-reference.md');
  const schemaPath = path.join(REPO_ROOT, 'schemas', 'skill.schema.json');

  const refText = readText(refPath);
  if (!refText) {
    errors.push('C1 [docs/field-reference.md]: cannot read file -- field-set parity check skipped');
    return errors;
  }

  const schema = readJson(schemaPath);
  if (!schema || !schema.properties) {
    errors.push('C1 [schemas/skill.schema.json]: cannot read schema or no "properties" key -- field-set parity check skipped');
    return errors;
  }

  // Extract ## heading backtick-wrapped field names like ## `schema_version`
  const headings = extractH2Headings(refText);
  const docFields = new Set();
  for (const h of headings) {
    const m = h.match(/^`([^`]+)`$/);
    if (m) docFields.add(m[1]);
  }

  const schemaFields = new Set(Object.keys(schema.properties));

  const inSchemaNotDoc = [...schemaFields].filter(f => !docFields.has(f));
  const inDocNotSchema = [...docFields].filter(f => !schemaFields.has(f));

  if (inSchemaNotDoc.length > 0) {
    errors.push(
      `C1 [docs/field-reference.md vs schemas/skill.schema.json]: ` +
      `${inSchemaNotDoc.length} schema field(s) not documented in field-reference.md: ` +
      inSchemaNotDoc.map(f => `"${f}"`).join(', ')
    );
  }
  if (inDocNotSchema.length > 0) {
    errors.push(
      `C1 [docs/field-reference.md vs schemas/skill.schema.json]: ` +
      `${inDocNotSchema.length} field(s) documented in field-reference.md but absent from schema: ` +
      inDocNotSchema.map(f => `"${f}"`).join(', ')
    );
  }

  if (VERBOSE && errors.length === 0) {
    console.log(`  C1: OK -- ${docFields.size} fields documented, ${schemaFields.size} in schema, sets match`);
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Check C2 -- Authored-to-generated parity
//
// Every property in schemas/skill.schema.json must either:
//   (a) appear in schemas/manifest.schema.json (at top level or grouped under
//       a parent like `activation`, `health`), OR
//   (b) appear in the rename map table in docs/manifest-field-mapping.md, OR
//   (c) be listed as intentional loss in the dropped-field list of
//       docs/manifest-field-mapping.md.
//
// The rename map is parsed from the "Top-level authored fields" table.
// ---------------------------------------------------------------------------

function checkC2AuthoredToGeneratedParity() {
  const errors = [];
  const skillSchemaPath = path.join(REPO_ROOT, 'schemas', 'skill.schema.json');
  const manifestSchemaPath = path.join(REPO_ROOT, 'schemas', 'manifest.schema.json');
  const mappingPath = path.join(REPO_ROOT, 'docs', 'manifest-field-mapping.md');

  const skillSchema = readJson(skillSchemaPath);
  if (!skillSchema || !skillSchema.properties) {
    errors.push('C2 [schemas/skill.schema.json]: cannot read schema -- authored-to-generated parity check skipped');
    return errors;
  }

  const manifestSchema = readJson(manifestSchemaPath);
  if (!manifestSchema) {
    errors.push('C2 [schemas/manifest.schema.json]: cannot read schema -- authored-to-generated parity check skipped');
    return errors;
  }

  const mappingText = readText(mappingPath);
  if (!mappingText) {
    errors.push('C2 [docs/manifest-field-mapping.md]: cannot read file -- authored-to-generated parity check skipped');
    return errors;
  }

  // Build the set of manifest field names -- top-level and grouped under skill items
  const manifestFieldNames = new Set();

  // From manifest schema skill item properties
  const skillItemSchema =
    manifestSchema.properties &&
    manifestSchema.properties.skills &&
    manifestSchema.properties.skills.items;
  if (skillItemSchema && skillItemSchema.properties) {
    for (const k of Object.keys(skillItemSchema.properties)) {
      manifestFieldNames.add(k);
      // Also collect sub-properties of grouped objects (activation, health, etc.)
      const sub = skillItemSchema.properties[k];
      if (sub && sub.properties) {
        for (const sk of Object.keys(sub.properties)) {
          manifestFieldNames.add(sk);
        }
      }
    }
  }

  // Parse the rename map table from manifest-field-mapping.md.
  // Table rows look like: | N | `authored_field` | fate | manifest projection |
  const renameMapFields = new Set();
  const droppedFields = new Set();

  let inRenameMap = false;
  let inDroppedList = false;
  for (const line of mappingText.split('\n')) {
    if (/^##+ Top-level authored fields/.test(line)) {
      inRenameMap = true;
      inDroppedList = false;
      continue;
    }
    if (/^##+ (Generated-only|Loss Policy|Migration|Worked Example|Verification)/.test(line)) {
      inRenameMap = false;
    }
    if (/Current dropped-field list/.test(line)) {
      inDroppedList = true;
      continue;
    }
    if (inDroppedList && /^###/.test(line)) {
      inDroppedList = false;
    }

    if (inRenameMap && line.startsWith('|')) {
      // Column 2 (index 2 after splitting on '|') holds the authored field name
      const cols = line.split('|').map(c => c.trim());
      if (cols.length >= 3) {
        const cell = cols[2];
        const m = cell.match(/^`([^`]+)`/);
        if (m) renameMapFields.add(m[1]);
      }
    }
    if (inDroppedList && line.startsWith('|')) {
      const cols = line.split('|').map(c => c.trim());
      if (cols.length >= 2) {
        const cell = cols[1];
        const m = cell.match(/^`([^`]+)`/);
        if (m && m[1] !== 'Field') droppedFields.add(m[1]);
      }
    }
  }

  // For each authored field, verify coverage
  const authored = Object.keys(skillSchema.properties);
  const uncovered = [];
  for (const field of authored) {
    const inManifest = manifestFieldNames.has(field);
    const inRenameMapTable = renameMapFields.has(field);
    const inDropped = droppedFields.has(field);
    if (!inManifest && !inRenameMapTable && !inDropped) {
      uncovered.push(field);
    }
  }

  if (uncovered.length > 0) {
    errors.push(
      `C2 [schemas/skill.schema.json -> schemas/manifest.schema.json]: ` +
      `${uncovered.length} authored field(s) not covered by manifest schema, rename map, or loss policy: ` +
      uncovered.map(f => `"${f}"`).join(', ')
    );
  }

  if (VERBOSE && errors.length === 0) {
    console.log(
      `  C2: OK -- ${authored.length} authored fields, all covered ` +
      `(${manifestFieldNames.size} in manifest, ${renameMapFields.size} in rename map, ${droppedFields.size} dropped)`
    );
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Check C3 -- Artifact-root convention
//
// Skill Graph uses a two-tier artifact root convention (documented in
// SKILL_AUDIT_LOOP.md after commit 873c463):
//   - examples/audits/<skill>/ -- shipped, curated worked examples in this repo
//   - audits/<skill>/          -- downstream consumer output (adopters' own repos)
//
// A conflict occurs when a doc describes a SHIPPED EXAMPLE living at the bare
// "audits/<skill>/" root instead of "examples/audits/<skill>/".
//
// We detect this by finding docs that reference a bare "audits/<skill>/" path
// for a skill that is known to have a shipped example under examples/audits/.
// The bare-path convention for consumer output is intentional and is NOT flagged.
//
// Excluded: docs/plans/ (describes script behavior, uses consumer paths by design)
//           Lines that explicitly document the two-tier convention
//           Fenced code blocks
//
// This is a WARN-level check -- it does not cause exit(1) by itself.
// ---------------------------------------------------------------------------

function checkC3ArtifactRootConvention() {
  const warnings = [];

  // Discover which skill names have shipped audit examples
  const examplesAuditsDir = path.join(REPO_ROOT, 'examples', 'audits');
  const shippedAuditSkills = new Set();
  if (fs.existsSync(examplesAuditsDir)) {
    for (const entry of fs.readdirSync(examplesAuditsDir)) {
      const stat = fs.statSync(path.join(examplesAuditsDir, entry));
      if (stat.isDirectory()) shippedAuditSkills.add(entry);
    }
  }

  if (shippedAuditSkills.size === 0) {
    if (VERBOSE) console.log('  C3: OK -- no shipped audit examples found in examples/audits/');
    return warnings;
  }

  // Scan docs/ but exclude plans/ (those describe consumer script output paths)
  const docsDir = path.join(REPO_ROOT, 'docs');
  const mdFiles = collectMdFiles(docsDir).filter(f => {
    const rel = path.relative(docsDir, f);
    return !rel.startsWith('plans' + path.sep);
  });

  for (const filePath of mdFiles) {
    const text = readText(filePath);
    if (!text) continue;
    const rel = path.relative(REPO_ROOT, filePath);

    const lines = text.split('\n');
    let inFencedBlock = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.trim().startsWith('```')) {
        inFencedBlock = !inFencedBlock;
        continue;
      }
      if (inFencedBlock) continue;

      // Skip lines that explicitly document the two-tier convention
      if (/two-tier|downstream consumer|adopter/i.test(line)) continue;

      // Flag: bare "audits/<shipped-skill>/" not preceded by "examples/"
      for (const skill of shippedAuditSkills) {
        // Negative lookbehind: not preceded by "examples/"
        const barePattern = new RegExp(`(?<!examples/)audits/${skill}/`);
        if (barePattern.test(line)) {
          warnings.push(
            `C3 [${rel}:${i + 1}]: shipped audit example for skill "${skill}" referenced ` +
            `as bare "audits/${skill}/" -- canonical shipped location is ` +
            `"examples/audits/${skill}/". Line: ${line.trim().slice(0, 100)}`
          );
        }
      }
    }
  }

  if (VERBOSE && warnings.length === 0) {
    console.log('  C3: OK -- no artifact-root conflicts found for shipped examples in docs/');
  }

  return warnings;
}

// ---------------------------------------------------------------------------
// Check C4 -- Sample manifest correctness
//
// examples/skills.manifest.sample.json must:
//   (a) validate against schemas/manifest.schema.json
//   (b) have summary.total_skills === skills.length
// ---------------------------------------------------------------------------

function checkC4SampleManifestCorrectness() {
  const errors = [];
  const samplePath = path.join(REPO_ROOT, 'examples', 'skills.manifest.sample.json');
  const schemaPath = path.join(REPO_ROOT, 'schemas', 'manifest.schema.json');

  const sample = readJson(samplePath);
  if (!sample) {
    errors.push('C4 [examples/skills.manifest.sample.json]: cannot read file -- sample manifest correctness check skipped');
    return errors;
  }

  const schema = readJson(schemaPath);
  if (!schema) {
    errors.push('C4 [schemas/manifest.schema.json]: cannot read schema -- sample manifest correctness check skipped');
    return errors;
  }

  // (a) Validate against schema
  const validationErrors = validate(sample, schema);
  for (const e of validationErrors) {
    errors.push(`C4 [examples/skills.manifest.sample.json]: schema validation failed -- ${e}`);
  }

  // (b) summary.total_skills === skills.length
  if (typeof sample.summary === 'object' && sample.summary !== null && Array.isArray(sample.skills)) {
    const declared = sample.summary.total_skills;
    const actual = sample.skills.length;
    if (declared !== actual) {
      errors.push(
        `C4 [examples/skills.manifest.sample.json]: ` +
        `summary.total_skills (${declared}) does not equal skills.length (${actual})`
      );
    }
  } else {
    if (!Array.isArray(sample.skills)) {
      errors.push('C4 [examples/skills.manifest.sample.json]: missing or non-array "skills" field');
    }
    if (typeof sample.summary !== 'object' || sample.summary === null) {
      errors.push('C4 [examples/skills.manifest.sample.json]: missing or non-object "summary" field');
    }
  }

  if (VERBOSE && errors.length === 0) {
    console.log(
      `  C4: OK -- sample manifest validates against schema; ` +
      `total_skills=${sample.summary.total_skills} matches skills.length=${sample.skills.length}`
    );
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Check C5 -- Example truth invariants
//
// C5a: No worked scorecard claims "exports cleanly to all" without qualifying
//      that some portability targets are still aspirational. The pre-873c463
//      scorecard said "exports cleanly to all four" (unqualified). The repair
//      added a qualifier. We flag any scorecard that restores the bare form.
//
// C5b: No eval artifact uses "eval_status" as a JSON metadata key. This is the
//      deprecated v1 field; post-SH-5784 the correct keys are eval_artifacts,
//      eval_state, and routing_eval. We check JSON object keys -- not prompt text
//      (prompt text may discuss the old field name for educational purposes).
//
// C5c: Scorecard portability rows must not use v1 sub-field names ("level" or
//      "exports") -- use v2 names "readiness" and "targets" instead.
// ---------------------------------------------------------------------------

function checkC5ExampleTruthInvariants() {
  const errors = [];
  const auditsDir = path.join(REPO_ROOT, 'examples', 'audits');
  const evalsDir = path.join(REPO_ROOT, 'examples', 'evals');

  // C5a + C5c -- Scorecard checks
  const scorecardFiles = collectMdFiles(auditsDir).filter(f => f.endsWith('scorecard.md'));
  for (const filePath of scorecardFiles) {
    const text = readText(filePath);
    if (!text) continue;
    const rel = path.relative(REPO_ROOT, filePath);

    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // C5a: "exports cleanly to all" without aspirational qualifier nearby
      if (/exports cleanly to all/i.test(line)) {
        const window = lines.slice(Math.max(0, i - 1), i + 3).join(' ');
        if (!/aspirational|still planned|not yet|pending/i.test(window)) {
          errors.push(
            `C5a [${rel}:${i + 1}]: scorecard claims "exports cleanly to all" without qualifying ` +
            `that some portability targets are still aspirational. ` +
            `Add a qualifier (e.g. "cursor, windsurf, and copilot are still aspirational"). ` +
            `Line: ${line.trim().slice(0, 100)}`
          );
        }
      }

      // C5c: v1 portability sub-field names
      if (/portability\.level|portability\.exports|\blevel:\s*(high|medium|low)\b/i.test(line)) {
        errors.push(
          `C5c [${rel}:${i + 1}]: scorecard uses v1 portability field names ` +
          `("level" or "exports") -- use schema_version 2 names "readiness" and "targets". ` +
          `Line: ${line.trim().slice(0, 100)}`
        );
      }
    }
  }

  // C5b -- Eval artifact JSON key checks
  const evalFiles = [];
  if (fs.existsSync(evalsDir)) {
    for (const entry of fs.readdirSync(evalsDir)) {
      if (entry.endsWith('.json')) {
        evalFiles.push(path.join(evalsDir, entry));
      }
    }
  }

  for (const filePath of evalFiles) {
    const text = readText(filePath);
    if (!text) continue;
    const rel = path.relative(REPO_ROOT, filePath);

    // Parse JSON and inspect object keys recursively.
    // We check keys, not string values -- prompt text may reference "eval_status"
    // as an educational or historical reference, which is intentional.
    let evalData;
    try {
      evalData = JSON.parse(text);
    } catch (e) {
      errors.push(`C5b [${rel}]: cannot parse JSON -- ${e.message}`);
      continue;
    }

    function findDeprecatedKey(obj, jsonPath) {
      if (Array.isArray(obj)) {
        for (let idx = 0; idx < obj.length; idx++) {
          findDeprecatedKey(obj[idx], `${jsonPath}[${idx}]`);
        }
      } else if (obj !== null && typeof obj === 'object') {
        for (const key of Object.keys(obj)) {
          if (key === 'eval_status') {
            errors.push(
              `C5b [${rel}]: eval artifact metadata uses deprecated v1 JSON key "eval_status" ` +
              `at ${jsonPath}.${key}. ` +
              `Post-SH-5784, use "eval_artifacts", "eval_state", and "routing_eval" instead.`
            );
          } else {
            findDeprecatedKey(obj[key], `${jsonPath}.${key}`);
          }
        }
      }
    }
    findDeprecatedKey(evalData, '$');
  }

  if (VERBOSE && errors.length === 0) {
    console.log(
      `  C5: OK -- ${scorecardFiles.length} scorecard(s), ${evalFiles.length} eval file(s) ` +
      `pass all example truth invariants`
    );
  }

  return errors;
}

// ---------------------------------------------------------------------------
// C6 -- Versioned schema parity (version-aware)
// ---------------------------------------------------------------------------

/**
 * Resolve the current schema version from the unversioned skill schema.
 * Looks at the `schema_version.const` variant in the oneOf or at the top-level
 * const. Returns a number (e.g. 2, 3) or null if it cannot be determined.
 */
function resolveCurrentSchemaVersion(skillSchema) {
  const sv = skillSchema && skillSchema.properties && skillSchema.properties.schema_version;
  if (!sv) return null;
  if (Number.isInteger(sv.const)) return sv.const;
  if (Array.isArray(sv.oneOf)) {
    for (const variant of sv.oneOf) {
      if (Number.isInteger(variant.const)) return variant.const;
      if (typeof variant.const === 'string' && /^\d+$/.test(variant.const)) return parseInt(variant.const, 10);
    }
  }
  return null;
}

/**
 * Check C6 — schema parity across the authored / generated / pinned files.
 *
 * The invariants:
 *   (a) The unversioned schemas (`skill.schema.json`, `manifest.schema.json`)
 *       must be content-identical to the pinned copy of the current version
 *       (`skill.v{N}.schema.json`, `manifest.v{N}.schema.json`), modulo
 *       `$id` and `title`.
 *   (b) All prior pinned versions (v2 when v3 is current, etc.) are treated
 *       as FROZEN: they must still exist and be readable, but they are NOT
 *       checked against the unversioned files. Freezing them is the whole
 *       point of pinning.
 *
 * Returns a list of error strings. Empty array means pass.
 */
function checkC6VersionedSchemaParity() {
  const errors = [];

  const skillUnversioned = readJson(path.join(REPO_ROOT, 'schemas/skill.schema.json'));
  const manifestUnversioned = readJson(path.join(REPO_ROOT, 'schemas/manifest.schema.json'));
  if (!skillUnversioned) { errors.push('schemas/skill.schema.json: missing or unreadable'); return errors; }
  if (!manifestUnversioned) { errors.push('schemas/manifest.schema.json: missing or unreadable'); return errors; }

  const current = resolveCurrentSchemaVersion(skillUnversioned);
  if (!current) {
    errors.push('schemas/skill.schema.json: cannot determine current schema_version for parity check');
    return errors;
  }

  // (a) Current-version pinned copies must match the unversioned files.
  const currentPairs = [
    { unversioned: 'schemas/skill.schema.json',    versioned: `schemas/skill.v${current}.schema.json`,    data: skillUnversioned },
    { unversioned: 'schemas/manifest.schema.json', versioned: `schemas/manifest.v${current}.schema.json`, data: manifestUnversioned },
  ];

  const stripped = (obj) => {
    const copy = JSON.parse(JSON.stringify(obj));
    delete copy.$id;
    delete copy.title;
    return copy;
  };

  for (const { unversioned, versioned, data } of currentPairs) {
    const v = readJson(path.join(REPO_ROOT, versioned));
    if (!v) { errors.push(`${versioned}: missing — pinned copy of current schema version ${current} must exist`); continue; }
    const uStr = JSON.stringify(stripped(data));
    const vStr = JSON.stringify(stripped(v));
    if (uStr !== vStr) {
      errors.push(`${versioned} is out of sync with ${unversioned} (content differs modulo $id/title). After editing the unversioned schema, copy it to the versioned file and keep the v${current} $id/title.`);
    }
    if (VERBOSE && uStr === vStr) console.log(`  ${versioned}: tracks ${unversioned}`);
  }

  // (b) Prior-version pinned copies must exist but are not parity-checked.
  for (let v = 2; v < current; v++) {
    for (const kind of ['skill', 'manifest']) {
      const frozenPath = `schemas/${kind}.v${v}.schema.json`;
      if (!fs.existsSync(path.join(REPO_ROOT, frozenPath))) {
        errors.push(`${frozenPath}: missing — frozen prior-version schema must remain in the repo for consumers pinned to v${v}`);
      } else if (VERBOSE) {
        console.log(`  ${frozenPath}: frozen (parity not checked)`);
      }
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// C7 -- Generated field-reference parity
// ---------------------------------------------------------------------------

/**
 * Check C7 — `docs/field-reference.generated.md` must match live regeneration
 * from the current pinned schema description strings via
 * `scripts/build-field-reference.js`.
 *
 * Invariant: the generated index is a deterministic projection of the schema's
 * description fields. If the schema changes (a description is added, edited, or
 * a new field is introduced) without regenerating the index, the docs drift
 * silently. C7 closes this loop.
 *
 * Implementation strategy: spawn `node scripts/build-field-reference.js --check`
 * which performs the regeneration in-memory and exits non-zero when the live
 * file differs from regenerated output. C7 surfaces that exit signal as a
 * structured protocol-consistency error.
 *
 * Returns a list of error strings. Empty array means pass.
 */
function checkC7GeneratedFieldReferenceParity() {
  const errors = [];
  const builderPath = path.join(REPO_ROOT, 'scripts', 'build-field-reference.js');
  const generatedPath = path.join(REPO_ROOT, 'docs', 'field-reference.generated.md');

  if (!fs.existsSync(builderPath)) {
    errors.push('scripts/build-field-reference.js: missing — required to regenerate docs/field-reference.generated.md');
    return errors;
  }
  if (!fs.existsSync(generatedPath)) {
    errors.push('docs/field-reference.generated.md: missing — run `node scripts/build-field-reference.js` to generate');
    return errors;
  }

  const result = require('child_process').spawnSync(
    process.execPath,
    [builderPath, '--check'],
    { cwd: REPO_ROOT, encoding: 'utf8' }
  );

  if (result.error) {
    errors.push(`C7 [docs/field-reference.generated.md]: cannot invoke build-field-reference.js — ${result.error.message}`);
    return errors;
  }

  if (result.status !== 0) {
    errors.push(
      `docs/field-reference.generated.md is out of step with the current skill schema description strings. ` +
      `Run \`node scripts/build-field-reference.js\` to regenerate, then commit the result alongside any schema description edits.`
    );
    if (VERBOSE && result.stderr) {
      console.error(result.stderr.trim());
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// C8 -- JSON-LD context coverage
// ---------------------------------------------------------------------------

/**
 * Check C8 - `schemas/skill.context.jsonld` must cover every top-level
 * authored field in `schemas/skill.schema.json`.
 *
 * ADR 0002 makes the JSON-LD context the FAIR interoperability bridge. If a
 * new top-level schema field is added without a context term, RDF consumers
 * silently lose that field. This check turns the prior hand-review rule into a
 * deterministic cross-artifact gate.
 *
 * It also validates compact IRI prefixes used by context mappings. For example,
 * `"keywords": "dcat:keyword"` requires a top-level `"dcat": "..."` namespace
 * declaration in the same `@context` object.
 */
function checkC8JsonLdContextCoverage() {
  const errors = [];
  const schemaPath = path.join(REPO_ROOT, 'schemas', 'skill.schema.json');
  const contextPath = path.join(REPO_ROOT, 'schemas', 'skill.context.jsonld');

  const schema = readJson(schemaPath);
  if (!schema || !schema.properties) {
    errors.push('C8 [schemas/skill.schema.json]: cannot read schema -- JSON-LD context coverage check skipped');
    return errors;
  }

  const contextDoc = readJson(contextPath);
  const context = contextDoc && contextDoc['@context'];
  if (!context || typeof context !== 'object' || Array.isArray(context)) {
    errors.push('C8 [schemas/skill.context.jsonld]: missing or invalid @context object');
    return errors;
  }

  const schemaFields = Object.keys(schema.properties);
  const contextKeys = new Set(Object.keys(context));
  const missing = schemaFields.filter(field => !contextKeys.has(field));

  if (missing.length > 0) {
    errors.push(
      `C8 [schemas/skill.context.jsonld]: ${missing.length} top-level schema field(s) missing from @context: ` +
      missing.map(f => `"${f}"`).join(', ')
    );
  }

  const declaredPrefixes = new Set();
  for (const [key, value] of Object.entries(context)) {
    if (typeof value === 'string' && /^https?:\/\//.test(value)) {
      declaredPrefixes.add(key);
    }
  }

  const prefixUses = [];
  function collectCompactIris(value, jsonPath) {
    if (typeof value === 'string') {
      const m = value.match(/^([A-Za-z][A-Za-z0-9_-]*):[^/]/);
      if (m) prefixUses.push({ prefix: m[1], value, jsonPath });
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item, idx) => collectCompactIris(item, `${jsonPath}[${idx}]`));
      return;
    }
    if (value && typeof value === 'object') {
      for (const [key, subValue] of Object.entries(value)) {
        if (key.startsWith('_')) continue;
        collectCompactIris(subValue, `${jsonPath}.${key}`);
      }
    }
  }

  for (const [key, value] of Object.entries(context)) {
    if (declaredPrefixes.has(key)) continue;
    collectCompactIris(value, `@context.${key}`);
  }

  for (const use of prefixUses) {
    if (!declaredPrefixes.has(use.prefix)) {
      errors.push(
        `C8 [schemas/skill.context.jsonld]: ${use.jsonPath} uses compact IRI ` +
        `"${use.value}" but prefix "${use.prefix}" is not declared in @context`
      );
    }
  }

  if (VERBOSE && errors.length === 0) {
    console.log(
      `  C8: OK -- ${schemaFields.length} top-level schema fields covered; ` +
      `${declaredPrefixes.size} namespace prefix(es) declared`
    );
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log('Running protocol consistency checks...\n');

  const allErrors = [];
  const allWarnings = [];

  // C1
  process.stdout.write('C1 Field-set parity... ');
  const c1 = checkC1FieldSetParity();
  if (c1.length === 0) console.log('OK');
  else { console.log('FAIL'); for (const e of c1) { console.error(`  ERROR ${e}`); } }
  allErrors.push(...c1);

  // C2
  process.stdout.write('C2 Authored-to-generated parity... ');
  const c2 = checkC2AuthoredToGeneratedParity();
  if (c2.length === 0) console.log('OK');
  else { console.log('FAIL'); for (const e of c2) { console.error(`  ERROR ${e}`); } }
  allErrors.push(...c2);

  // C3 (warnings -- does not affect exit code)
  process.stdout.write('C3 Artifact-root convention... ');
  const c3 = checkC3ArtifactRootConvention();
  if (c3.length === 0) console.log('OK');
  else {
    console.log(`WARN (${c3.length})`);
    for (const w of c3) { console.warn(`  WARN  ${w}`); }
  }
  allWarnings.push(...c3);

  // C4
  process.stdout.write('C4 Sample manifest correctness... ');
  const c4 = checkC4SampleManifestCorrectness();
  if (c4.length === 0) console.log('OK');
  else { console.log('FAIL'); for (const e of c4) { console.error(`  ERROR ${e}`); } }
  allErrors.push(...c4);

  // C5
  process.stdout.write('C5 Example truth invariants... ');
  const c5 = checkC5ExampleTruthInvariants();
  if (c5.length === 0) console.log('OK');
  else { console.log('FAIL'); for (const e of c5) { console.error(`  ERROR ${e}`); } }
  allErrors.push(...c5);

  // C6
  process.stdout.write('C6 Versioned schema parity... ');
  const c6 = checkC6VersionedSchemaParity();
  if (c6.length === 0) console.log('OK');
  else { console.log('FAIL'); for (const e of c6) { console.error(`  ERROR ${e}`); } }
  allErrors.push(...c6);

  // C7
  process.stdout.write('C7 Generated field-reference parity... ');
  const c7 = checkC7GeneratedFieldReferenceParity();
  if (c7.length === 0) console.log('OK');
  else { console.log('FAIL'); for (const e of c7) { console.error(`  ERROR ${e}`); } }
  allErrors.push(...c7);

  // C8
  process.stdout.write('C8 JSON-LD context coverage... ');
  const c8 = checkC8JsonLdContextCoverage();
  if (c8.length === 0) console.log('OK');
  else { console.log('FAIL'); for (const e of c8) { console.error(`  ERROR ${e}`); } }
  allErrors.push(...c8);

  console.log('');

  if (allErrors.length > 0) {
    console.error(`FAIL: ${allErrors.length} error(s) found. ${allWarnings.length} warning(s).`);
    process.exit(1);
  } else {
    console.log(`PASS: all protocol consistency checks passed. ${allWarnings.length} warning(s).`);
    process.exit(0);
  }
}

main();
