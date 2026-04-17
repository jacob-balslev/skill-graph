#!/usr/bin/env node
/**
 * Manifest generator for Skill Graph.
 *
 * Walks `skills/<name>/SKILL.md` (and optionally `examples/skill-template.md`),
 * applies the authored-to-generated rename map documented in
 * `docs/manifest-contract.md`, computes summary aggregates, validates the
 * result against `schemas/manifest.schema.json`, and emits the compiled
 * `skills.manifest.json`.
 *
 * Usage:
 *   node scripts/generate-manifest.js                    # emit to stdout
 *   node scripts/generate-manifest.js --output <path>   # emit to file
 *   node scripts/generate-manifest.js --validate-only   # validate, no output
 *   node scripts/generate-manifest.js --include-template # include examples/skill-template.md
 *
 * Self-contained. Only uses Node built-ins — no external dependencies.
 * Exit 0 on success, 1 on validation failure.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { parseFrontmatter } = require('./lib/parse-frontmatter');

const REPO_ROOT = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(REPO_ROOT, 'skills');
const TEMPLATE_PATH = path.join(REPO_ROOT, 'examples', 'skill-template.md');
const MANIFEST_SCHEMA_PATH = path.join(REPO_ROOT, 'schemas', 'manifest.schema.json');

// ---------------------------------------------------------------------------
// Rename map — implements docs/manifest-contract.md § "Top-level authored fields"
//
// Fates:
//   copy       — top-level field copied through unchanged (same key, same value)
//   grouped    — field is nested under a parent object in the manifest
//   generated  — field is computed by the generator (not from authored frontmatter)
//   skip       — field is present at manifest root level, not per-skill
// ---------------------------------------------------------------------------

/**
 * Apply the rename map to a parsed frontmatter object and a source file path,
 * returning a validated manifest skill entry.
 *
 * @param {object} fm - Parsed frontmatter (from parseFrontmatter)
 * @param {string} filePath - Absolute path to the source SKILL.md
 * @param {string} skillId - Stable ID for this skill (directory name or derived)
 * @returns {object} Manifest skill entry object
 */
function buildSkillEntry(fm, filePath, skillId) {
  const entry = {};

  // --- Generated fields ---
  // id: stable reference identifier (directory name or name-slugified)
  entry.id = skillId;

  // path: repo-relative path to source file
  entry.path = path.relative(REPO_ROOT, filePath);

  // --- Copied-through fields (required) ---
  entry.name = fm.name;
  entry.description = fm.description;
  entry.version = fm.version;
  entry.type = fm.type;
  entry.family = fm.family;
  entry.scope = fm.scope;
  entry.owner = fm.owner;

  // --- Copied-through fields (optional) ---
  if (fm.stability !== undefined && fm.stability !== null) {
    entry.stability = fm.stability;
  }
  if (fm.extends !== undefined && fm.extends !== null) {
    entry.extends = fm.extends;
  }
  if (fm.license !== undefined && fm.license !== null) {
    entry.license = fm.license;
  }
  if (fm.compatibility !== undefined && fm.compatibility !== null) {
    entry.compatibility = fm.compatibility;
  }
  if (fm['allowed-tools'] !== undefined && fm['allowed-tools'] !== null) {
    entry['allowed-tools'] = fm['allowed-tools'];
  }
  if (fm.routing_groups !== undefined && fm.routing_groups !== null) {
    entry.routing_groups = fm.routing_groups;
  }

  // --- Grouped: activation (triggers + keywords + paths) ---
  const activation = {};
  if (Array.isArray(fm.triggers) && fm.triggers.length > 0) {
    activation.triggers = fm.triggers;
  }
  if (Array.isArray(fm.keywords) && fm.keywords.length > 0) {
    activation.keywords = fm.keywords;
  }
  if (Array.isArray(fm.paths) && fm.paths.length > 0) {
    activation.paths = fm.paths;
  }
  if (Object.keys(activation).length > 0) {
    entry.activation = activation;
  }

  // --- Copied-through: relations ---
  if (fm.relations !== null && fm.relations !== undefined && typeof fm.relations === 'object') {
    const rel = {};
    for (const kind of ['adjacent', 'boundary', 'verify_with', 'depends_on']) {
      if (Array.isArray(fm.relations[kind]) && fm.relations[kind].length > 0) {
        rel[kind] = fm.relations[kind];
      }
    }
    if (Object.keys(rel).length > 0) {
      entry.relations = rel;
    }
  }

  // --- Copied-through: grounding (renamed from domain_frame in SH-5779) ---
  if (fm.grounding !== null && fm.grounding !== undefined && typeof fm.grounding === 'object') {
    entry.grounding = fm.grounding;
  }
  // Legacy: support domain_frame during the compatibility window (schema_version 1)
  // domain_frame is deprecated; grounding is the canonical field.
  // The generator reads domain_frame as a fallback but the output key is always grounding.
  if (!entry.grounding && fm.domain_frame !== null && fm.domain_frame !== undefined && typeof fm.domain_frame === 'object') {
    entry.grounding = fm.domain_frame;
  }

  // --- Copied-through: portability ---
  if (fm.portability !== null && fm.portability !== undefined && typeof fm.portability === 'object') {
    entry.portability = fm.portability;
  }

  // --- Grouped: health (eval_artifacts + eval_state + routing_eval + freshness + drift_check + generated booleans) ---
  // schema_version 2 (SH-5784): the old `eval_status` enum was split into three
  // orthogonal sub-fields so that artifact state, runtime state, and routing
  // coverage are each their own axis. All three flow through into `health`.
  const health = {};
  if (fm.eval_artifacts !== undefined && fm.eval_artifacts !== null) {
    health.eval_artifacts = fm.eval_artifacts;
  }
  if (fm.eval_state !== undefined && fm.eval_state !== null) {
    health.eval_state = fm.eval_state;
  }
  if (fm.routing_eval !== undefined && fm.routing_eval !== null) {
    health.routing_eval = fm.routing_eval;
  }
  if (fm.freshness !== undefined && fm.freshness !== null) {
    health.freshness = fm.freshness;
  }
  if (fm.drift_check !== undefined && fm.drift_check !== null) {
    health.drift_check = fm.drift_check;
  }
  // Generated: has_grounding — true when authored frontmatter contains a grounding block
  health.has_grounding = (entry.grounding !== undefined && entry.grounding !== null);
  // Generated: has_relations — true when authored frontmatter contains a non-empty relations block
  health.has_relations = (entry.relations !== undefined && Object.keys(entry.relations).length > 0);

  entry.health = health;

  return entry;
}

/**
 * Sort an object's keys deterministically (alphabetically).
 * Arrays are preserved as-is (element order is authored order).
 *
 * @param {*} value - Any JSON-serializable value
 * @returns {*} Same value with all object keys sorted
 */
function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value !== null && typeof value === 'object') {
    const sorted = {};
    for (const key of Object.keys(value).sort()) {
      sorted[key] = sortKeys(value[key]);
    }
    return sorted;
  }
  return value;
}

/**
 * Minimal JSON Schema validator covering the manifest schema shape.
 * Validates type, required fields, enum, format (date, date-time), pattern,
 * additionalProperties, and oneOf.
 *
 * Returns an array of error strings (empty = valid).
 *
 * @param {*} value - Value to validate
 * @param {object} schema - JSON Schema object
 * @param {string} [path=''] - JSON path prefix for error messages
 * @returns {string[]}
 */
function validate(value, schema, pointer) {
  if (pointer === undefined) pointer = '#';
  const errors = [];

  if (!schema || typeof schema !== 'object') return errors;

  // type check
  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    // JSON Schema distinguishes "integer" from "number". JavaScript typeof returns
    // "number" for both, so we handle "integer" as a special case.
    const matchesType = (t) => {
      if (t === 'null') return value === null;
      if (t === 'array') return Array.isArray(value);
      if (t === 'integer') return typeof value === 'number' && Number.isInteger(value);
      if (t === 'number') return typeof value === 'number';
      if (t === 'object') return typeof value === 'object' && value !== null && !Array.isArray(value);
      return typeof value === t;
    };
    if (!types.some(matchesType)) {
      const actualType =
        value === null ? 'null' :
        Array.isArray(value) ? 'array' :
        typeof value;
      errors.push(`${pointer}: expected type ${schema.type}, got ${actualType}`);
      return errors; // skip further checks if type is wrong
    }
  }

  // const
  if (schema.const !== undefined && value !== schema.const) {
    errors.push(`${pointer}: expected const ${JSON.stringify(schema.const)}, got ${JSON.stringify(value)}`);
  }

  // enum
  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${pointer}: value ${JSON.stringify(value)} not in enum [${schema.enum.map(e => JSON.stringify(e)).join(', ')}]`);
  }

  // pattern
  if (schema.pattern && typeof value === 'string') {
    if (!new RegExp(schema.pattern).test(value)) {
      errors.push(`${pointer}: "${value}" does not match pattern ${schema.pattern}`);
    }
  }

  // format — date and date-time
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

  // minimum
  if (schema.minimum !== undefined && typeof value === 'number' && value < schema.minimum) {
    errors.push(`${pointer}: ${value} < minimum ${schema.minimum}`);
  }

  // oneOf
  if (schema.oneOf) {
    const matchCount = schema.oneOf.filter(sub => validate(value, sub, pointer + '/oneOf').length === 0).length;
    if (matchCount !== 1) {
      errors.push(`${pointer}: value does not match exactly one of the oneOf variants (matched ${matchCount})`);
    }
  }

  // object validations
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
        const subErrors = validate(subValue, props[key], `${pointer}/${key}`);
        errors.push(...subErrors);
      } else if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
        const subErrors = validate(subValue, schema.additionalProperties, `${pointer}/${key}`);
        errors.push(...subErrors);
      }
    }
  }

  // array validations
  if (Array.isArray(value)) {
    if (schema.items) {
      for (let i = 0; i < value.length; i++) {
        const subErrors = validate(value[i], schema.items, `${pointer}/${i}`);
        errors.push(...subErrors);
      }
    }
    if (schema.minimum !== undefined && value.length < schema.minimum) {
      errors.push(`${pointer}: array length ${value.length} < minimum ${schema.minimum}`);
    }
  }

  return errors;
}

/**
 * Collect skill source files to process.
 *
 * Always includes `skills/<name>/SKILL.md` for every subdirectory that has one.
 * When --include-template is passed, also includes `examples/skill-template.md`.
 *
 * @param {string[]} args - Process argv (already sliced past node + script)
 * @returns {Array<{filePath: string, skillId: string}>}
 */
function collectSources(args) {
  const includeTemplate = args.includes('--include-template');
  const sources = [];

  if (fs.existsSync(SKILLS_DIR)) {
    // Sort directory names for deterministic output
    const dirs = fs.readdirSync(SKILLS_DIR).sort();
    for (const name of dirs) {
      const skillMd = path.join(SKILLS_DIR, name, 'SKILL.md');
      if (fs.existsSync(skillMd)) {
        sources.push({ filePath: skillMd, skillId: name });
      }
    }
  }

  if (includeTemplate && fs.existsSync(TEMPLATE_PATH)) {
    // Template id is derived from its name field (which should be "skill-template")
    const text = fs.readFileSync(TEMPLATE_PATH, 'utf8');
    const fm = parseFrontmatter(text);
    const id = (fm && fm.name) ? fm.name : 'skill-template';
    sources.push({ filePath: TEMPLATE_PATH, skillId: id });
  }

  return sources;
}

/**
 * Compute summary aggregates over the skills array.
 *
 * @param {object[]} skills - Array of manifest skill entries
 * @returns {object} Summary object with total_skills, by_type, by_family, by_scope, by_stability
 */
function computeSummary(skills) {
  const by_type = {};
  const by_family = {};
  const by_scope = {};
  const by_stability = {};

  for (const skill of skills) {
    if (skill.type) by_type[skill.type] = (by_type[skill.type] || 0) + 1;
    if (skill.family) by_family[skill.family] = (by_family[skill.family] || 0) + 1;
    if (skill.scope) by_scope[skill.scope] = (by_scope[skill.scope] || 0) + 1;
    if (skill.stability) by_stability[skill.stability] = (by_stability[skill.stability] || 0) + 1;
  }

  const summary = { total_skills: skills.length };
  if (Object.keys(by_type).length > 0) summary.by_type = sortKeys(by_type);
  if (Object.keys(by_family).length > 0) summary.by_family = sortKeys(by_family);
  if (Object.keys(by_scope).length > 0) summary.by_scope = sortKeys(by_scope);
  if (Object.keys(by_stability).length > 0) summary.by_stability = sortKeys(by_stability);

  return summary;
}

function main() {
  const args = process.argv.slice(2);
  const validateOnly = args.includes('--validate-only');
  const outputPath = (() => {
    const idx = args.indexOf('--output');
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
  })();
  // --timestamp <ISO8601> overrides the generated_at field for reproducible builds.
  // Useful for generating the sample manifest with a stable timestamp.
  const fixedTimestamp = (() => {
    const idx = args.indexOf('--timestamp');
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
  })();

  // Load manifest schema for validation
  let manifestSchema;
  try {
    manifestSchema = JSON.parse(fs.readFileSync(MANIFEST_SCHEMA_PATH, 'utf8'));
  } catch (e) {
    console.error(`Error reading manifest schema: ${e.message}`);
    process.exit(1);
  }

  // Collect source files
  const sources = collectSources(args);
  if (sources.length === 0) {
    console.error('No skill files found to process. Check that skills/ directory exists and contains SKILL.md files.');
    process.exit(1);
  }

  // Build skill entries
  const skillEntries = [];
  const errors = [];

  for (const { filePath, skillId } of sources) {
    const relPath = path.relative(REPO_ROOT, filePath);
    let text;
    try {
      text = fs.readFileSync(filePath, 'utf8');
    } catch (e) {
      errors.push(`${relPath}: cannot read file — ${e.message}`);
      continue;
    }

    const fm = parseFrontmatter(text);
    if (!fm) {
      errors.push(`${relPath}: no frontmatter found`);
      continue;
    }

    // Warn about deprecated field names. The schema will reject them via
    // additionalProperties: false at the lint step, but a warning from the
    // generator is friendlier for authors running the generator directly.
    if (fm.domain_frame) {
      process.stderr.write(`WARN ${relPath}: "domain_frame" is deprecated — rename to "grounding"\n`);
    }
    if (fm.eval_status) {
      process.stderr.write(`WARN ${relPath}: "eval_status" is deprecated — split into "eval_artifacts", "eval_state", and "routing_eval"\n`);
    }
    if (fm.route_groups) {
      process.stderr.write(`WARN ${relPath}: "route_groups" is deprecated — rename to "routing_groups"\n`);
    }
    if (fm.portability && typeof fm.portability === 'object') {
      if (fm.portability.level) {
        process.stderr.write(`WARN ${relPath}: "portability.level" is deprecated — rename to "portability.readiness"\n`);
      }
      if (fm.portability.exports) {
        process.stderr.write(`WARN ${relPath}: "portability.exports" is deprecated — rename to "portability.targets"\n`);
      }
    }

    let entry;
    try {
      entry = buildSkillEntry(fm, filePath, skillId);
    } catch (e) {
      errors.push(`${relPath}: failed to build manifest entry — ${e.message}`);
      continue;
    }

    skillEntries.push(entry);
  }

  if (errors.length > 0) {
    for (const e of errors) console.error(`ERROR ${e}`);
    process.exit(1);
  }

  // Sort entries alphabetically by id for deterministic output
  skillEntries.sort((a, b) => a.id.localeCompare(b.id));

  // Sort keys within each entry deterministically
  const sortedEntries = skillEntries.map(sortKeys);

  // Build the manifest object.
  // schema_version 2 (SH-5784) — breaking change: `scope` enum renames
  // (generic→portable, operational→codebase), `eval_status` split into three
  // fields, `portability.level`→`readiness`, `portability.exports`→`targets`,
  // `route_groups`→`routing_groups`.
  const manifest = {
    schema_version: 2,
    generated_at: fixedTimestamp || new Date().toISOString(),
    summary: computeSummary(skillEntries),
    skills: sortedEntries,
  };

  // Sort top-level manifest keys
  const sortedManifest = sortKeys(manifest);

  // Validate against manifest schema
  const validationErrors = validate(sortedManifest, manifestSchema);
  if (validationErrors.length > 0) {
    console.error('FAIL manifest validation:');
    for (const e of validationErrors) console.error(`  - ${e}`);
    process.exit(1);
  }

  if (validateOnly) {
    console.log(`OK   manifest valid (${skillEntries.length} skill(s))`);
    process.exit(0);
  }

  const json = JSON.stringify(sortedManifest, null, 2) + '\n';

  if (outputPath) {
    fs.writeFileSync(outputPath, json, 'utf8');
    console.error(`OK   manifest written to ${outputPath} (${skillEntries.length} skill(s))`);
  } else {
    process.stdout.write(json);
  }

  process.exit(0);
}

main();
