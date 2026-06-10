#!/usr/bin/env node
/**
 * Manifest generator for Skill Graph (manifest envelope schema_version 4;
 * consumes v8 SKILL.md frontmatter).
 *
 * Walks `skills/<name>/SKILL.md` (and optionally `examples/skill-metadata-template.md`),
 * applies the authored-to-generated rename map documented in
 * `docs/manifest-field-mapping.md`, computes summary aggregates, validates the
 * result against `schemas/manifest.schema.json`, and emits the compiled
 * `skills.manifest.json`.
 *
 * Path-base contract (SKI-370): every `skills[].path` value (and the
 * `skill_root` header) is a POSIX path relative to a STABLE, cwd-independent
 * anchor — the skill-graph repository root (`packageRoot()`), NOT
 * `process.cwd()`. This makes the emitted manifest byte-identical regardless of
 * whether the generator runs from `~/Development` or `~/Development/skill-graph`
 * (the prior `process.cwd()` anchor flipped paths between `skills/skills/...`
 * and `../skills/skills/...`, which silently emptied the audit worklist — the
 * 2026-06-10 incident). The `skill_root` header documents the primary skill
 * library root relative to that same base.
 *
 * Multi-root mode: when `.skill-graph/config.json` exists at the repo root and
 * declares `skill_roots` (a top-level array of strings or `{path, project}`
 * objects), the generator walks every declared root instead of the default
 * `skills/` directory. The v8 `workspace.*` config wrapper and the emitted
 * top-level `workspace` manifest block were both removed;
 * per-skill belonging-entity identity now lives in the authored `project[]`
 * and `repo[]` arrays.
 *
 * Usage:
 *   node scripts/generate-manifest.js                    # emit to stdout
 *   node scripts/generate-manifest.js --output <path>   # emit to file
 *   node scripts/generate-manifest.js --validate-only   # validate, no output
 *   node scripts/generate-manifest.js --include-template # include examples/skill-metadata-template.md
 *   node scripts/generate-manifest.js --timestamp <ISO> # fixed timestamp for reproducible builds
 *
 * Self-contained. Only uses Node built-ins — no external dependencies.
 * Exit 0 on success, 1 on validation failure.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { parseFrontmatter, normalizeFrontmatter } = require('./lib/parse-frontmatter');
const { checkAliasParity } = require('./lib/alias-contract');
const { collectSkillFilesFromRoots, resolveSchemaPath, workspaceRoot, packageRoot } = require('./lib/roots');
// ADR-0019: the audit-state sidecar join helper (canonical home).
const { readSidecar: loadAuditStateSidecar, joinSidecar } = require('./lib/audit-state-sidecar');

const REPO_ROOT = workspaceRoot();
const DEFAULT_SKILLS_DIR = path.join(REPO_ROOT, 'skills');
const TEMPLATE_PATH = path.join(REPO_ROOT, 'examples', 'skill-metadata-template.md');
const MANIFEST_SCHEMA_PATH = resolveSchemaPath(REPO_ROOT, 'manifest.schema.json');
const CONFIG_PATH = path.join(REPO_ROOT, '.skill-graph', 'config.json');

// SKI-370: anchor every emitted path to a STABLE, cwd-independent base — the
// skill-graph repository root — so the manifest is reproducible regardless of
// the generation cwd. `REPO_ROOT` (= workspaceRoot() = cwd) is still used for
// READING (config, schema, skill discovery); only the EMITTED path values are
// re-anchored here. See the file header § Path-base contract.
const MANIFEST_PATH_BASE = packageRoot();

function repoRelative(filePath) {
  return path.relative(MANIFEST_PATH_BASE, filePath).split(path.sep).join('/');
}

// ---------------------------------------------------------------------------
// Workspace config (optional)
//
// Shape of `.skill-graph/config.json`:
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

function loadRootsConfig() {
  if (!fs.existsSync(CONFIG_PATH)) return null;
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
    const config = JSON.parse(raw);
    if (!config || typeof config !== 'object') return null;
    // skill_roots lives at the top level. The v8 `workspace.skill_roots`
    // wrapper was removed (`workspace` vocabulary retirement).
    if (!Array.isArray(config.skill_roots)) return null;
    return { skill_roots: config.skill_roots };
  } catch (e) {
    process.stderr.write(`WARN .skill-graph/config.json: cannot parse — ${e.message}\n`);
    return null;
  }
}

/**
 * Resolve the list of skill roots to walk.
 *
 * @param {object|null} config - Parsed roots config (or null for single-root mode).
 * @returns {Array<{absPath: string, project: string|null}>}
 */
function resolveSkillRoots(config) {
  if (!config || !Array.isArray(config.skill_roots) || config.skill_roots.length === 0) {
    return [{ absPath: DEFAULT_SKILLS_DIR, project: null }];
  }
  return config.skill_roots
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
 * Normalize legacy string truth sources and v3.1 anchored object truth sources
 * into a stable key. The key is also the key used in
 * drift_check.truth_source_hashes.
 */
function normalizeTruthSource(src) {
  if (typeof src === 'string') {
    return { key: src, path: src, lineRange: null, anchor: null };
  }
  if (src && typeof src === 'object' && typeof src.path === 'string') {
    const lineRange = src.line_range && typeof src.line_range === 'object'
      ? {
          start: Number.isInteger(src.line_range.start) ? src.line_range.start : null,
          end: Number.isInteger(src.line_range.end) ? src.line_range.end : null,
        }
      : null;
    const anchor = typeof src.anchor === 'string' && src.anchor.length > 0 ? src.anchor : null;
    let key = src.path;
    if (lineRange && lineRange.start) {
      key += `#L${lineRange.start}-L${lineRange.end || lineRange.start}`;
    } else if (anchor) {
      key += `#${anchor}`;
    }
    return { key, path: src.path, lineRange, anchor };
  }
  return { key: String(src), path: null, lineRange: null, anchor: null };
}

function slugifyHeading(headingText) {
  return headingText
    .replace(/^#+\s*/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function isRemoteTruthSourcePath(value) {
  return /^https?:\/\//i.test(String(value));
}

function sectionForHeadingAnchor(text, anchor) {
  const lines = text.split('\n');
  let start = -1;
  let level = null;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(#{1,6})\s+(.+?)\s*$/);
    if (m && slugifyHeading(m[2]) === anchor) {
      start = i;
      level = m[1].length;
      break;
    }
  }
  if (start === -1) return null;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    const m = lines[i].match(/^(#{1,6})\s+/);
    if (m && m[1].length <= level) {
      end = i;
      break;
    }
  }
  return lines.slice(start, end).join('\n');
}

/**
 * Compute SHA-256 hex digest for a truth source. Legacy string entries hash the
 * normalized whole file. Object entries with `line_range` hash only that
 * inclusive line range, normalized to LF, which avoids CRLF-only drift.
 */
function sha256TruthSource(src) {
  const normalized = normalizeTruthSource(src);
  if (!normalized.path) return null;
  if (isRemoteTruthSourcePath(normalized.path)) return undefined;
  try {
    const abs = path.resolve(REPO_ROOT, normalized.path);
    if (!fs.existsSync(abs)) return null;
    const text = fs.readFileSync(abs, 'utf8').replace(/\r\n?/g, '\n');
    let content = text;
    if (normalized.lineRange && normalized.lineRange.start) {
      const lines = text.split('\n');
      const start = normalized.lineRange.start;
      const end = normalized.lineRange.end || start;
      if (start < 1 || end < start || end > lines.length) return null;
      content = lines.slice(start - 1, end).join('\n');
    } else if (normalized.anchor) {
      const section = sectionForHeadingAnchor(text, normalized.anchor);
      if (section !== null) content = section;
    }
    if (normalized.anchor && !text.includes(normalized.anchor) && sectionForHeadingAnchor(text, normalized.anchor) === null) return null;
    return crypto.createHash('sha256').update(content).digest('hex');
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
    const normalized = normalizeTruthSource(src);
    const recorded = recordedHashes[normalized.key];
    if (!recorded) continue;
    const live = sha256TruthSource(src);
    if (live === undefined) continue; // URL truth source: valid but not hashable locally.
    if (live === null) return true; // truth source vanished
    if (live !== recorded) return true;
  }
  return false;
}

// Audit-state sidecar join (ADR-0019): `loadAuditStateSidecar` (= readSidecar)
// and `joinSidecar` are imported from scripts/lib/audit-state-sidecar.js above.
// The manifest join reads the sidecar and merges it UNDER the frontmatter so
// buildSkillEntry sees the same combined shape it read from single-file
// frontmatter pre-split — health/eval/lifecycle/concept projections stay
// byte-identical. Missing sidecar => no-op merge => unmigrated/new skill behaves
// exactly as before. See docs/adr/0019-audit-state-sidecar-separation.md.

// ---------------------------------------------------------------------------
// Rename map — implements docs/manifest-field-mapping.md § "Top-level authored fields"
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
function buildSkillEntry(fm, filePath, skillId, _projectFromRoot) {
  const aliasErrors = checkAliasParity(fm);
  if (aliasErrors.length > 0) {
    throw new Error(`alias contract violation: ${aliasErrors.join('; ')}`);
  }

  const entry = {};

  // --- Generated fields ---
  entry.id = skillId;
  entry.path = repoRelative(filePath);
  // the legacy `entry.project = <string-from-config>` assignment is removed
  //. Project belonging-entity identity is the authored `project[]`
  // array (object-shape with `handle` + `role`). The `_projectFromRoot` parameter
  // is preserved for back-compat in the function signature; new callers can
  // pass null. See § Copied-through optional fields below.

  // --- Copied-through required fields ---
  entry.name = fm.name;
  if (fm.urn !== undefined && fm.urn !== null) {
    entry.urn = fm.urn;
  }
  // Pass-through schema_version so consumers can distinguish current v8 skills
  // from invalid or historical fixtures without re-reading every SKILL.md.
  if (fm.schema_version !== undefined && fm.schema_version !== null) {
    entry.schema_version = fm.schema_version;
  }
  entry.description = fm.description;
  entry.version = fm.version;
  // Classification: subject + public + scope are required; subjects[] is optional polyhierarchy.
  // `public` (boolean publishability gate) replaced the deployment_target enum — see the ADR-0017 amendment.
  entry.subject = fm.subject;
  if (Array.isArray(fm.subjects) && fm.subjects.length > 0) {
    entry.subjects = fm.subjects;
  }
  entry.public = fm.public;
  if (fm.scope !== undefined && fm.scope !== null) {
    entry.scope = fm.scope; // required free-text PRD content
  }
  entry.owner = fm.owner;

  // --- Copied-through optional fields ---
  if (fm.taxonomy_domain !== undefined && fm.taxonomy_domain !== null) {
    entry.taxonomy_domain = fm.taxonomy_domain;
  }
  if (Array.isArray(fm.project) && fm.project.length > 0) {
    entry.project = fm.project;
  }
  if (Array.isArray(fm.repo) && fm.repo.length > 0) {
    entry.repo = fm.repo;
  }
  if (fm.marketplace_tier !== undefined && fm.marketplace_tier !== null) {
    entry.marketplace_tier = fm.marketplace_tier;
  }
  if (fm.stability !== undefined && fm.stability !== null) {
    entry.stability = fm.stability;
  }
  if (fm.superseded_by !== undefined && fm.superseded_by !== null) {
    entry.superseded_by = fm.superseded_by;
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
  if (fm.allowed_tools !== undefined && fm.allowed_tools !== null) {
    entry.allowed_tools = fm.allowed_tools;
  }
  // routing_bundles removed (SKI-286): authored-but-inert per-skill field with 0
  // acting consumer. Library-level activation bundles live in the skill-injector
  // routing config (`bundles` / `bundleTypes`), not in per-skill frontmatter.
  // workspace_tags removed. Use `project[]` for project-affiliation routing.

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
  // (boundary stays canonical for routing-layer exclusion; disjoint_with is a separate orthogonal
  // relation for formal OWL class-disjointness). All seven keys flow through to the manifest;
  // back-compat is preserved by keeping `adjacent` valid as an alias for `related`.
  if (fm.relations !== null && fm.relations !== undefined && typeof fm.relations === 'object') {
    const rel = {};
    for (const kind of [
      // v3.1 SKOS additions (preferred names; ADR 0001 Decisions #1 + #3)
      'related', 'broader', 'narrower',
      // v3.0 stable + canonical. `suppresses` is the canonical routing-exclusion
      // edge (ADR-0018); `boundary` is its retained deprecated alias.
      'adjacent', 'suppresses', 'boundary', 'verify_with', 'depends_on',
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

  // --- Copied-through: concept teaching block ---
  if (fm.concept !== null && fm.concept !== undefined && typeof fm.concept === 'object') {
    entry.concept = fm.concept;
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
  if (fm.comprehension_state !== undefined && fm.comprehension_state !== null) {
    health.comprehension_state = fm.comprehension_state;
  }
  if (fm.eval_last_run !== undefined && fm.eval_last_run !== null && typeof fm.eval_last_run === 'object') {
    health.eval_last_run = fm.eval_last_run;
  }
  if (fm.eval !== undefined && fm.eval !== null && typeof fm.eval === 'object') {
    health.eval = fm.eval;
  }
  if (fm.freshness !== undefined && fm.freshness !== null) {
    health.freshness = fm.freshness;
  }
  if (fm.reviewed_at !== undefined && fm.reviewed_at !== null) {
    health.reviewed_at = fm.reviewed_at;
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
  // Audit Status fields are joined into the generated manifest's health object
  // from normalized audit state. `audit_verdict` is the DEPRECATED v6 single-aggregate field
  // (replaced by the four discrete verdicts above in v7 per ADR-0011) — kept
  // here for back-compat reads of skills that haven't been run through the
  // v6→v7 codemod yet. Schema-level removal is tracked in SH-6557; this entry
  // retires when that ticket lands. See lib/audit/skill-status.js:38-46.
  for (const field of [
    'last_audited',
    'last_changed',
    'structural_verdict',
    'truth_verdict',
    'comprehension_verdict',
    'application_verdict',
    'audit_verdict',
    'eval_score',
    'eval_failed_ids',
    'lint_verdict',
    'drift_status',
  ]) {
    if (fm[field] !== undefined && fm[field] !== null) health[field] = fm[field];
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
 * includes `examples/skill-metadata-template.md` (marked as project=null).
 */
function collectSources(args, skillRoots) {
  const includeTemplate = args.includes('--include-template');
  const sources = [];
  const seen = new Set();

  for (const source of collectSkillFilesFromRoots(skillRoots)) {
    if (!seen.has(source.filePath)) {
      const text = fs.readFileSync(source.filePath, 'utf8');
      const fm = normalizeFrontmatter(parseFrontmatter(text));
      sources.push({ filePath: source.filePath, skillId: fm?.name || path.basename(path.dirname(source.filePath)), project: source.project });
      seen.add(source.filePath);
    }
  }

  if (includeTemplate && fs.existsSync(TEMPLATE_PATH) && !seen.has(TEMPLATE_PATH)) {
    const text = fs.readFileSync(TEMPLATE_PATH, 'utf8');
    const fm = normalizeFrontmatter(parseFrontmatter(text));
    const id = (fm && fm.name) ? fm.name : 'skill-metadata-template';
    sources.push({ filePath: TEMPLATE_PATH, skillId: id, project: null });
    seen.add(TEMPLATE_PATH);
  }

  return sources;
}

// PASS sets for cumulative-gate classification per ADR-0011 § Addendum 2026-05-27.
// Must stay aligned with lib/audit/skill-status.js::STRUCTURAL_PASS_VALUES.
const STRUCTURAL_PASS_SET = new Set(['PASS', 'PASS_WITH_FIXES']);
const TRUTH_PASS_SET = new Set(['PASS']);

// Derive the cumulative-gate audit state for one manifest entry.
// Buckets a skill into exactly one of: not_admitted / admitted_unassessed /
// assessed_provisional / assessed_graded.
// See docs/verdict-semantics.md for the canonical eligibility-vs-assessment doctrine.
function deriveAuditState(skill) {
  const health = skill && skill.health ? skill.health : {};
  const admitted = STRUCTURAL_PASS_SET.has(health.structural_verdict)
    && TRUTH_PASS_SET.has(health.truth_verdict);
  if (!admitted) return 'not_admitted';
  const av = health.application_verdict;
  if (!av || av === 'UNVERIFIED') return 'admitted_unassessed';
  if (av === 'PROVISIONAL') return 'assessed_provisional';
  return 'assessed_graded';
}

/**
 * Compute summary aggregates over the skills array.
 *
 * facets: `by_subject` (classification), `by_public` (publishability gate, true/false),
 * `by_stability` (lifecycle posture), `by_project` (project belonging-entity bucketed by handle).
 *
 * `by_schema_version` lets consumers count migration progress directly from the
 * manifest. Missing schema_version buckets under 'unknown'.
 *
 * Per ADR-0011 § Addendum 2026-05-27, the four per-verdict facets plus the
 * cumulative `by_audit_state` make eligibility-vs-assessment-vs-certification
 * legible from the manifest without consumers having to re-derive it. The
 * `harmful_skill_count` convenience field surfaces the SkillsBench-19% case
 * (skills that make agents worse) without grepping facet keys.
 */
function computeSummary(skills) {
  const by_schema_version = {};
  const by_subject = {};
  const by_public = {};
  const by_stability = {};
  const by_project = {};
  const by_structural_verdict = {};
  const by_truth_verdict = {};
  const by_comprehension_verdict = {};
  const by_application_verdict = {};
  const by_audit_state = {};
  let harmful_skill_count = 0;

  for (const skill of skills) {
    const ver = skill.schema_version === undefined || skill.schema_version === null
      ? 'unknown'
      : String(skill.schema_version);
    by_schema_version[ver] = (by_schema_version[ver] || 0) + 1;

    if (skill.subject) by_subject[skill.subject] = (by_subject[skill.subject] || 0) + 1;
    if (typeof skill.public === 'boolean') {
      const key = skill.public ? 'true' : 'false';
      by_public[key] = (by_public[key] || 0) + 1;
    }
    if (skill.stability) by_stability[skill.stability] = (by_stability[skill.stability] || 0) + 1;
    // project is an array of objects with `handle`. Bucket by each handle.
    if (Array.isArray(skill.project)) {
      for (const entry of skill.project) {
        const handle = entry && typeof entry.handle === 'string' ? entry.handle : null;
        if (handle) by_project[handle] = (by_project[handle] || 0) + 1;
      }
    }

    // Verdict facets per ADR-0011. Missing values bucket as 'UNVERIFIED' for the
    // four-verdict shape; that's the honest default for unaudited skills per
    // docs/verdict-semantics.md.
    const h = skill.health || {};
    const sv = h.structural_verdict || 'UNVERIFIED';
    const tv = h.truth_verdict || 'UNVERIFIED';
    const cv = h.comprehension_verdict || 'UNVERIFIED';
    const av = h.application_verdict || 'UNVERIFIED';
    by_structural_verdict[sv] = (by_structural_verdict[sv] || 0) + 1;
    by_truth_verdict[tv] = (by_truth_verdict[tv] || 0) + 1;
    by_comprehension_verdict[cv] = (by_comprehension_verdict[cv] || 0) + 1;
    by_application_verdict[av] = (by_application_verdict[av] || 0) + 1;

    if (av === 'HARMFUL') harmful_skill_count += 1;

    const state = deriveAuditState(skill);
    by_audit_state[state] = (by_audit_state[state] || 0) + 1;
  }

  const summary = { total_skills: skills.length };
  if (Object.keys(by_schema_version).length > 0) summary.by_schema_version = sortKeys(by_schema_version);
  if (Object.keys(by_subject).length > 0) summary.by_subject = sortKeys(by_subject);
  if (Object.keys(by_public).length > 0) summary.by_public = sortKeys(by_public);
  if (Object.keys(by_stability).length > 0) summary.by_stability = sortKeys(by_stability);
  if (Object.keys(by_project).length > 0) summary.by_project = sortKeys(by_project);
  if (Object.keys(by_structural_verdict).length > 0) summary.by_structural_verdict = sortKeys(by_structural_verdict);
  if (Object.keys(by_truth_verdict).length > 0) summary.by_truth_verdict = sortKeys(by_truth_verdict);
  if (Object.keys(by_comprehension_verdict).length > 0) summary.by_comprehension_verdict = sortKeys(by_comprehension_verdict);
  if (Object.keys(by_application_verdict).length > 0) summary.by_application_verdict = sortKeys(by_application_verdict);
  if (Object.keys(by_audit_state).length > 0) summary.by_audit_state = sortKeys(by_audit_state);
  summary.harmful_skill_count = harmful_skill_count;

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

  // Resolve roots config (multi-root or single-root).
  const rootsConfig = loadRootsConfig();
  const skillRoots = resolveSkillRoots(rootsConfig);

  const sources = collectSources(args, skillRoots);
  if (sources.length === 0) {
    console.error('No skill files found. Check that the configured skill root(s) exist and contain SKILL.md files.');
    process.exit(1);
  }

  const skillEntries = [];
  const errors = [];

  for (const { filePath, skillId, project } of sources) {
    const relPath = repoRelative(filePath);
    let text;
    try {
      text = fs.readFileSync(filePath, 'utf8');
    } catch (e) {
      errors.push(`${relPath}: cannot read file — ${e.message}`);
      continue;
    }

    const rawFrontmatter = parseFrontmatter(text);
    const usesAgentSkillsEncoding =
      rawFrontmatter &&
      rawFrontmatter.metadata &&
      typeof rawFrontmatter.metadata === 'object' &&
      !Array.isArray(rawFrontmatter.metadata);
    const fm = normalizeFrontmatter(rawFrontmatter);
    if (!fm) {
      errors.push(`${relPath}: no frontmatter found`);
      continue;
    }

    // Legacy deprecation warnings.
    if (fm.family) {
      process.stderr.write(`WARN ${relPath}: "family" is deprecated — rename to "category"\n`);
    }
    if (fm.domain_frame) {
      process.stderr.write(`WARN ${relPath}: "domain_frame" is deprecated — rename to "grounding"\n`);
    }
    if (fm.eval_status) {
      process.stderr.write(`WARN ${relPath}: "eval_status" is deprecated — split into "eval_artifacts", "eval_state", and "routing_eval"\n`);
    }
    if (typeof fm.drift_check === 'string') {
      process.stderr.write(`WARN ${relPath}: scalar "drift_check" is deprecated in v3 — migrate to an object with "last_verified"\n`);
    }
    if (typeof fm.compatibility === 'string' && !usesAgentSkillsEncoding) {
      process.stderr.write(`WARN ${relPath}: scalar "compatibility" is deprecated in v3 — migrate to an object with "runtimes"/"node"/"notes"\n`);
    }

    // Join the audit-state sidecar (ADR-0019) UNDER the frontmatter so the
    // manifest entry is built from the same combined shape as pre-split.
    const fmJoined = joinSidecar(fm, loadAuditStateSidecar(filePath));

    let entry;
    try {
      entry = buildSkillEntry(fmJoined, filePath, skillId, project);
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

  // SKI-370: document the skill-library root relative to the stable path base
  // (MANIFEST_PATH_BASE = skill-graph repo root). Every `skills[].path` is
  // anchored to that same base, so a consumer resolves a skill file as
  // `resolve(<skill-graph-root>, entry.path)` and the skills subtree as
  // `resolve(<skill-graph-root>, skill_root)`. Derive it from the COMMON
  // ANCESTOR of the resolved skill files (NOT from the cwd-dependent discovery
  // root) so the header is itself cwd-invariant — the template specimen
  // (skill-graph/examples/…) is excluded so it never collapses the prefix to
  // the repo root. Single-root today; multi-root generalizes to per-entry roots.
  const librarySkillDirs = sources
    .filter(({ filePath }) => path.resolve(filePath) !== path.resolve(TEMPLATE_PATH))
    .map(({ filePath }) => path.dirname(path.resolve(filePath)));
  const commonAncestor = librarySkillDirs.length > 0
    ? librarySkillDirs.reduce((acc, dir) => {
        if (acc === null) return dir;
        const a = acc.split(path.sep);
        const b = dir.split(path.sep);
        const out = [];
        for (let i = 0; i < Math.min(a.length, b.length); i += 1) {
          if (a[i] !== b[i]) break;
          out.push(a[i]);
        }
        return out.join(path.sep);
      }, null)
    : null;
  const primarySkillRoot = commonAncestor
    ? path.relative(MANIFEST_PATH_BASE, commonAncestor).split(path.sep).join('/')
    : null;

  // Build the manifest object.
  const manifest = {
    schema_version: 4,
    generated_at: fixedTimestamp || new Date().toISOString(),
    skill_root: primarySkillRoot,
    summary: computeSummary(skillEntries),
    skills: sortedEntries,
  };

  // the top-level `workspace` manifest block is removed.
  // Roots config is internal to the build pipeline; skill belonging-entity
  // identity lives in per-skill `project[]` and `repo[]` arrays.

  const sortedManifest = sortKeys(manifest);

  const validationErrors = validate(sortedManifest, manifestSchema);
  if (validationErrors.length > 0) {
    if (outputPath) {
      fs.writeFileSync(outputPath, JSON.stringify(sortedManifest, null, 2) + '\n', 'utf8');
    }
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
    process.exit(0);
  } else {
    // Wait for stdout to drain before exiting. Without this callback, process.exit()
    // can terminate before the pipe buffer flushes when the manifest exceeds the OS
    // pipe-buffer size (64 KB on macOS), causing silent truncation when the script
    // is invoked via execFileSync/spawnSync (the harness used by skill-lint's
    // generator-parity check). See `scripts/skill-lint.js` § "Generator parity".
    process.stdout.write(json, () => process.exit(0));
  }
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
    normalizeTruthSource,
    sha256TruthSource,
    computeSummary,
  };
}
