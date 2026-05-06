#!/usr/bin/env node
/**
 * Manifest generator for Skill Graph (schema_version 3).
 *
 * Walks `skills/<name>/SKILL.md` (and optionally `examples/skill-template.md`),
 * applies the authored-to-generated rename map documented in
 * `docs/manifest-contract.md`, computes summary aggregates, validates the
 * result against `schemas/manifest.schema.json`, and emits the compiled
 * `skills.manifest.json`.
 *
 * Workspace mode (v3): when `.skill-graph/config.json` exists at the repo
 * root and declares `workspace.skill_roots`, the generator walks every
 * declared root instead of the default `skills/` directory. Each skill entry
 * carries a `project` field identifying which root it came from. The manifest
 * gains a top-level `workspace` block that echoes the config's projects map
 * so consumers can resolve semantic tags without re-reading the config.
 *
 * Usage:
 *   node scripts/generate-manifest.js                    # emit to stdout
 *   node scripts/generate-manifest.js --output <path>   # emit to file
 *   node scripts/generate-manifest.js --validate-only   # validate, no output
 *   node scripts/generate-manifest.js --include-template # include examples/skill-template.md
 *   node scripts/generate-manifest.js --timestamp <ISO> # fixed timestamp for reproducible builds
 *
 * Self-contained. Only uses Node built-ins — no external dependencies.
 * Exit 0 on success, 1 on validation failure.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { parseFrontmatter } = require('./lib/parse-frontmatter');

const REPO_ROOT = path.resolve(__dirname, '..');
const DEFAULT_SKILLS_DIR = path.join(REPO_ROOT, 'skills');
const TEMPLATE_PATH = path.join(REPO_ROOT, 'examples', 'skill-template.md');
const MANIFEST_SCHEMA_PATH = path.join(REPO_ROOT, 'schemas', 'manifest.schema.json');
const CONFIG_PATH = path.join(REPO_ROOT, '.skill-graph', 'config.json');

// ---------------------------------------------------------------------------
// Workspace config (optional)
//
// Shape of `.skill-graph/config.json` (v3):
//   {
//     "workspace": {
//       "skill_roots": [
//         { "path": "skills",                              "project": null },
//         { "path": "<project-a>/.skill-graph/skills",     "project": "<project-a>" }
//       ],
//       "projects": {
//         "<project-a>":  { "semantic_tags": ["ecommerce", "saas"] },
//         "<project-b>":  { "semantic_tags": ["ecommerce", "b2c"] }
//       }
//     }
//   }
// (`<project-a>` / `<project-b>` are placeholders — replace with your actual
//  project handles. Adopters declare their own; the OSS contract ships none.)
//
// When absent, the generator falls back to single-root mode with SKILLS_DIR
// and no project ownership.
// ---------------------------------------------------------------------------

function loadWorkspaceConfig() {
  if (!fs.existsSync(CONFIG_PATH)) return null;
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
    const config = JSON.parse(raw);
    if (!config || typeof config !== 'object') return null;
    if (!config.workspace || typeof config.workspace !== 'object') return null;
    return config.workspace;
  } catch (e) {
    process.stderr.write(`WARN .skill-graph/config.json: cannot parse — ${e.message}\n`);
    return null;
  }
}

/**
 * Resolve the list of skill roots to walk.
 *
 * @param {object|null} workspace - Parsed workspace config (or null for single-root mode).
 * @returns {Array<{absPath: string, project: string|null}>}
 */
function resolveSkillRoots(workspace) {
  if (!workspace || !Array.isArray(workspace.skill_roots) || workspace.skill_roots.length === 0) {
    return [{ absPath: DEFAULT_SKILLS_DIR, project: null }];
  }
  return workspace.skill_roots
    .map(entry => {
      if (typeof entry === 'string') {
        return { absPath: path.resolve(REPO_ROOT, entry), project: null };
      }
      if (entry && typeof entry === 'object' && typeof entry.path === 'string') {
        return {
          absPath: path.resolve(REPO_ROOT, entry.path),
          project: (typeof entry.project === 'string' && entry.project.length > 0) ? entry.project : null,
        };
      }
      return null;
    })
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Truth source hashing (drift detection)
// ---------------------------------------------------------------------------

/**
 * Compute SHA-256 hex digest for a file. Returns null if the file does not
 * exist or cannot be read. Paths in `grounding.truth_sources` are resolved
 * relative to REPO_ROOT.
 */
function sha256File(relPath) {
  try {
    const abs = path.resolve(REPO_ROOT, relPath);
    if (!fs.existsSync(abs)) return null;
    const buf = fs.readFileSync(abs);
    return crypto.createHash('sha256').update(buf).digest('hex');
  } catch (e) {
    return null;
  }
}

/**
 * Compare a skill's recorded `drift_check.truth_source_hashes` against the
 * live file hashes. Returns true when any recorded hash differs from the
 * current file hash, false otherwise. Returns null (unknown) when no hashes
 * are recorded or no truth_sources are declared.
 */
function detectDrift(fm) {
  const recordedHashes = fm.drift_check && fm.drift_check.truth_source_hashes;
  const truthSources = fm.grounding && fm.grounding.truth_sources;
  if (!recordedHashes || typeof recordedHashes !== 'object') return null;
  if (!Array.isArray(truthSources) || truthSources.length === 0) return null;

  for (const src of truthSources) {
    const recorded = recordedHashes[src];
    if (!recorded) continue;
    const live = sha256File(src);
    if (live === null) return true; // truth source vanished
    if (live !== recorded) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Rename map — implements docs/manifest-contract.md § "Top-level authored fields"
// ---------------------------------------------------------------------------

/**
 * Apply the rename map to a parsed frontmatter object and a source file path,
 * returning a validated manifest skill entry.
 *
 * @param {object} fm - Parsed frontmatter (from parseFrontmatter)
 * @param {string} filePath - Absolute path to the source SKILL.md
 * @param {string} skillId - Stable ID for this skill (directory name or derived)
 * @param {string|null} project - Project handle for multi-root mode, or null for shared.
 * @returns {object} Manifest skill entry object
 */
function buildSkillEntry(fm, filePath, skillId, project) {
  const entry = {};

  // --- Generated fields ---
  entry.id = skillId;
  entry.path = path.relative(REPO_ROOT, filePath);
  if (project) entry.project = project;

  // --- Copied-through required fields ---
  entry.name = fm.name;
  entry.description = fm.description;
  entry.version = fm.version;
  entry.type = fm.type;
  entry.browse_category = fm.browse_category;
  entry.scope = fm.scope;
  entry.owner = fm.owner;

  // --- Copied-through optional fields ---
  if (fm.category !== undefined && fm.category !== null) {
    entry.category = fm.category;
  }
  if (fm.stability !== undefined && fm.stability !== null) {
    entry.stability = fm.stability;
  }
  if (fm.superseded_by !== undefined && fm.superseded_by !== null) {
    entry.superseded_by = fm.superseded_by;
  }
  if (fm.extends !== undefined && fm.extends !== null) {
    entry.extends = fm.extends;
  }
  if (fm.license !== undefined && fm.license !== null) {
    entry.license = fm.license;
  }
  if (fm.compatibility !== undefined && fm.compatibility !== null && typeof fm.compatibility === 'object') {
    entry.compatibility = fm.compatibility;
  }
  if (fm['allowed-tools'] !== undefined && fm['allowed-tools'] !== null) {
    entry['allowed-tools'] = fm['allowed-tools'];
  }
  if (fm.routing_groups !== undefined && fm.routing_groups !== null) {
    entry.routing_groups = fm.routing_groups;
  }
  if (Array.isArray(fm.project_tags) && fm.project_tags.length > 0) {
    entry.project_tags = fm.project_tags;
  }

  // --- Grouped: activation (triggers + keywords + paths + examples + anti_examples) ---
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
  if (Array.isArray(fm.examples) && fm.examples.length > 0) {
    activation.examples = fm.examples;
  }
  if (Array.isArray(fm.anti_examples) && fm.anti_examples.length > 0) {
    activation.anti_examples = fm.anti_examples;
  }
  if (Object.keys(activation).length > 0) {
    entry.activation = activation;
  }

  // --- Copied-through: relations (with v3 union-type items preserved as-is) ---
  // Predicate set per ADR 0001 (v3.1 SKOS additions: related/broader/narrower) and ADR 0006
  // (boundary stays canonical for routing-layer handoff; disjoint_with is a separate orthogonal
  // relation for formal OWL class-disjointness). All seven keys flow through to the manifest;
  // back-compat is preserved by keeping `adjacent` valid as an alias for `related`.
  if (fm.relations !== null && fm.relations !== undefined && typeof fm.relations === 'object') {
    const rel = {};
    for (const kind of [
      // v3.1 SKOS additions (preferred names; ADR 0001 Decisions #1 + #3)
      'related', 'broader', 'narrower',
      // v3.0 stable + canonical (ADR 0006: boundary stays canonical)
      'adjacent', 'boundary', 'verify_with', 'depends_on',
      // v3.1 separate orthogonal relation per ADR 0006 Option B
      'disjoint_with',
    ]) {
      if (Array.isArray(fm.relations[kind]) && fm.relations[kind].length > 0) {
        rel[kind] = fm.relations[kind];
      }
    }
    if (Object.keys(rel).length > 0) {
      entry.relations = rel;
    }
  }

  // --- Copied-through: grounding ---
  if (fm.grounding !== null && fm.grounding !== undefined && typeof fm.grounding === 'object') {
    entry.grounding = fm.grounding;
  }

  // --- Copied-through: portability ---
  if (fm.portability !== null && fm.portability !== undefined && typeof fm.portability === 'object') {
    entry.portability = fm.portability;
  }

  // --- Grouped: health (eval triple + freshness + drift_check + lifecycle + telemetry + generated booleans) ---
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
  if (fm.drift_check !== undefined && fm.drift_check !== null && typeof fm.drift_check === 'object') {
    health.drift_check = fm.drift_check;
  }
  if (fm.lifecycle !== undefined && fm.lifecycle !== null && typeof fm.lifecycle === 'object') {
    health.lifecycle = fm.lifecycle;
  }
  if (fm.runtime_telemetry !== undefined && fm.runtime_telemetry !== null && typeof fm.runtime_telemetry === 'object') {
    health.runtime_telemetry = fm.runtime_telemetry;
  }
  health.has_grounding = (entry.grounding !== undefined && entry.grounding !== null);
  health.has_relations = (entry.relations !== undefined && Object.keys(entry.relations).length > 0);

  // Drift detection (generated): compare truth_source_hashes against live files.
  const drift = detectDrift(fm);
  if (drift !== null) {
    health.drift_detected = drift;
  }

  entry.health = health;

  return entry;
}

/**
 * Sort an object's keys deterministically (alphabetically).
 * Arrays are preserved as-is (element order is authored order).
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
 */
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
      const actualType =
        value === null ? 'null' :
        Array.isArray(value) ? 'array' :
        typeof value;
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
  if (schema.maximum !== undefined && typeof value === 'number' && value > schema.maximum) {
    errors.push(`${pointer}: ${value} > maximum ${schema.maximum}`);
  }

  if (schema.maxLength !== undefined && typeof value === 'string' && value.length > schema.maxLength) {
    errors.push(`${pointer}: length ${value.length} > maxLength ${schema.maxLength}`);
  }

  if (schema.oneOf) {
    const matchCount = schema.oneOf.filter(sub => validate(value, sub, pointer + '/oneOf').length === 0).length;
    if (matchCount !== 1) {
      errors.push(`${pointer}: value does not match exactly one of the oneOf variants (matched ${matchCount})`);
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
        const subErrors = validate(subValue, props[key], `${pointer}/${key}`);
        errors.push(...subErrors);
      } else if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
        const subErrors = validate(subValue, schema.additionalProperties, `${pointer}/${key}`);
        errors.push(...subErrors);
      }
    }
  }

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
 * Walks every resolved skill root. When --include-template is passed, also
 * includes `examples/skill-template.md` (marked as project=null).
 */
function collectSources(args, skillRoots) {
  const includeTemplate = args.includes('--include-template');
  const sources = [];
  const seen = new Set();

  for (const { absPath, project } of skillRoots) {
    if (!fs.existsSync(absPath)) continue;
    const stat = fs.statSync(absPath);
    if (!stat.isDirectory()) continue;

    // Sort for deterministic output.
    for (const name of fs.readdirSync(absPath).sort()) {
      const skillMd = path.join(absPath, name, 'SKILL.md');
      if (fs.existsSync(skillMd) && !seen.has(skillMd)) {
        sources.push({ filePath: skillMd, skillId: name, project });
        seen.add(skillMd);
      }
    }
  }

  if (includeTemplate && fs.existsSync(TEMPLATE_PATH) && !seen.has(TEMPLATE_PATH)) {
    const text = fs.readFileSync(TEMPLATE_PATH, 'utf8');
    const fm = parseFrontmatter(text);
    const id = (fm && fm.name) ? fm.name : 'skill-template';
    sources.push({ filePath: TEMPLATE_PATH, skillId: id, project: null });
    seen.add(TEMPLATE_PATH);
  }

  return sources;
}

/**
 * Compute summary aggregates over the skills array.
 */
function computeSummary(skills) {
  const by_type = {};
  const by_browse_category = {};
  const by_scope = {};
  const by_stability = {};
  const by_project = {};

  for (const skill of skills) {
    if (skill.type) by_type[skill.type] = (by_type[skill.type] || 0) + 1;
    if (skill.browse_category) by_browse_category[skill.browse_category] = (by_browse_category[skill.browse_category] || 0) + 1;
    if (skill.scope) by_scope[skill.scope] = (by_scope[skill.scope] || 0) + 1;
    if (skill.stability) by_stability[skill.stability] = (by_stability[skill.stability] || 0) + 1;
    if (skill.project) by_project[skill.project] = (by_project[skill.project] || 0) + 1;
  }

  const summary = { total_skills: skills.length };
  if (Object.keys(by_type).length > 0) summary.by_type = sortKeys(by_type);
  if (Object.keys(by_browse_category).length > 0) summary.by_browse_category = sortKeys(by_browse_category);
  if (Object.keys(by_scope).length > 0) summary.by_scope = sortKeys(by_scope);
  if (Object.keys(by_stability).length > 0) summary.by_stability = sortKeys(by_stability);
  if (Object.keys(by_project).length > 0) summary.by_project = sortKeys(by_project);

  return summary;
}

function main() {
  const args = process.argv.slice(2);
  const validateOnly = args.includes('--validate-only');
  const outputPath = (() => {
    const idx = args.indexOf('--output');
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
  })();
  const fixedTimestamp = (() => {
    const idx = args.indexOf('--timestamp');
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
  })();

  let manifestSchema;
  try {
    manifestSchema = JSON.parse(fs.readFileSync(MANIFEST_SCHEMA_PATH, 'utf8'));
  } catch (e) {
    console.error(`Error reading manifest schema: ${e.message}`);
    process.exit(1);
  }

  // Resolve workspace (multi-root or single-root).
  const workspace = loadWorkspaceConfig();
  const skillRoots = resolveSkillRoots(workspace);

  const sources = collectSources(args, skillRoots);
  if (sources.length === 0) {
    console.error('No skill files found. Check that the configured skill root(s) exist and contain SKILL.md files.');
    process.exit(1);
  }

  const skillEntries = [];
  const errors = [];

  for (const { filePath, skillId, project } of sources) {
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

    // v2 deprecation warnings — emitted during the v2 → v3 overlap window.
    if (fm.family) {
      process.stderr.write(`WARN ${relPath}: "family" is deprecated — rename to "browse_category"\n`);
    }
    if (fm.domain_frame) {
      process.stderr.write(`WARN ${relPath}: "domain_frame" is deprecated — rename to "grounding"\n`);
    }
    if (fm.eval_status) {
      process.stderr.write(`WARN ${relPath}: "eval_status" is deprecated — split into "eval_artifacts", "eval_state", and "routing_eval"\n`);
    }
    if (fm.route_groups) {
      process.stderr.write(`WARN ${relPath}: "route_groups" is deprecated — rename to "routing_groups"\n`);
    }
    if (typeof fm.drift_check === 'string') {
      process.stderr.write(`WARN ${relPath}: scalar "drift_check" is deprecated in v3 — use an object with "last_verified" (run scripts/migrate-skill-v2-to-v3.js)\n`);
    }
    if (typeof fm.compatibility === 'string') {
      process.stderr.write(`WARN ${relPath}: scalar "compatibility" is deprecated in v3 — use an object with "runtimes"/"node"/"notes" (run scripts/migrate-skill-v2-to-v3.js)\n`);
    }

    let entry;
    try {
      entry = buildSkillEntry(fm, filePath, skillId, project);
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

  skillEntries.sort((a, b) => a.id.localeCompare(b.id));
  const sortedEntries = skillEntries.map(sortKeys);

  // Build the manifest object.
  const manifest = {
    schema_version: 3,
    generated_at: fixedTimestamp || new Date().toISOString(),
    summary: computeSummary(skillEntries),
    skills: sortedEntries,
  };

  // Emit workspace metadata block when a config is in effect.
  if (workspace) {
    const workspaceBlock = {};
    if (Array.isArray(workspace.skill_roots)) {
      workspaceBlock.skill_roots = workspace.skill_roots.map(e => typeof e === 'string' ? e : e.path);
    }
    if (workspace.projects && typeof workspace.projects === 'object') {
      workspaceBlock.projects = workspace.projects;
    }
    if (Object.keys(workspaceBlock).length > 0) {
      manifest.workspace = workspaceBlock;
    }
  }

  const sortedManifest = sortKeys(manifest);

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

if (require.main === module) {
  main();
} else {
  // Expose internals for testing without changing the CLI behaviour.
  // The CLI still runs `main()` when invoked directly via `node generate-manifest.js`.
  module.exports = {
    buildSkillEntry,
    sortKeys,
    validate,
    detectDrift,
    sha256File,
    computeSummary,
  };
}
