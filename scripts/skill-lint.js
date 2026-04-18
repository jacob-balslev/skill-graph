#!/usr/bin/env node
/**
 * Skill Graph lint tool.
 *
 * Validates every `skills/<name>/SKILL.md` (and optionally
 * `examples/skill-template.md`) against the frontmatter contract. Runs:
 *
 *   1. Schema validation against `schemas/skill.schema.json`
 *   2. Parent-directory-matches-name check (Agent Skills compatibility)
 *   3. Relation target existence check (adjacent, boundary, verify_with,
 *      depends_on targets must be real sibling skills in the repo)
 *   4. Eval artifact coherence check (eval_artifacts: present requires at
 *      least one eval file targeting the skill)
 *   5. scope: codebase → require grounding (conditional from schema)
 *   6. Cross-schema parity (runs once): every property and required field
 *      of skill.schema.json#grounding must be representable in
 *      manifest.schema.json#grounding, and the documented loss-policy
 *      fields (routing_groups, license, compatibility, allowed-tools) must
 *      exist as top-level manifest skill-item properties. Prevents the
 *      SH-5776 regression where the manifest silently dropped
 *      domain_object and four optional top-level fields.
 *   7. Sample manifest conformance (runs once): every skill entry in
 *      examples/skills.manifest.sample.json validates against
 *      manifest.schema.json#skills.items, so the hand-written sample
 *      cannot drift out of step with the schema.
 *   8. Generator parity (runs once): re-runs scripts/generate-manifest.js
 *      and compares its output (minus generated_at) against
 *      examples/skills.manifest.sample.json (also minus generated_at).
 *      Fails if the sample is out of step with the generator. This locks
 *      the sample as generator-produced output — not hand-maintained.
 *      Skipped when --skip-generator-parity is passed (useful during
 *      initial setup before the sample has been regenerated).
 *   9. schema_version 2 migration (runs per file): WARN on the v1 field
 *      names eval_status, portability.level, portability.exports, and
 *      route_groups during the migration window. The old enum values for
 *      `scope` (generic, operational) are hard errors already — the schema
 *      enum only lists the v2 values (portable, codebase, reference).
 *  10. Archetype-aware section validator (runs per file): errors on missing
 *      required H2 sections per archetype (capability, workflow, router,
 *      overlay); warns on sections that exist but are empty (< 50 non-
 *      whitespace characters). See scripts/lint/check-archetype-sections.js.
 *  11. Routing quality — narrow (runs per file): errors when keywords: []
 *      for scope: codebase or routing_groups-having skills; warns when
 *      description text appears verbatim in ## Coverage.
 *      See scripts/lint/check-routing-quality.js.
 *
 * Error output uses file:line:column + 5-line code frame + caret + help
 * line for actionable diagnostics. Use --no-color for plain CI output.
 *
 * Self-contained. Only uses Node built-ins — no external dependencies.
 * Exit 0 on success, 1 on any failure.
 *
 * Usage:
 *   node scripts/skill-lint.js                       # lint all skills
 *   node scripts/skill-lint.js skills/a11y           # lint one skill
 *   node scripts/skill-lint.js --include-template    # also lint the example template
 *   node scripts/skill-lint.js --skip-generator-parity  # skip check 8
 *   node scripts/skill-lint.js --strict              # promote warnings to errors
 *   node scripts/skill-lint.js --no-color            # plain output for CI
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { parseFrontmatter } = require('./lib/parse-frontmatter');
const { formatCodeFrame, locateYamlKey, locateH2Section } = require('./lint/format-code-frame');
const { checkArchetypeSections } = require('./lint/check-archetype-sections');
const { checkRoutingQuality } = require('./lint/check-routing-quality');

const REPO_ROOT = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(REPO_ROOT, 'skills');
const TEMPLATE_PATH = path.join(REPO_ROOT, 'examples', 'skill-template.md');
const SCHEMA_PATH = path.join(REPO_ROOT, 'schemas', 'skill.schema.json');
const MANIFEST_SCHEMA_PATH = path.join(REPO_ROOT, 'schemas', 'manifest.schema.json');
const SAMPLE_MANIFEST_PATH = path.join(REPO_ROOT, 'examples', 'skills.manifest.sample.json');
const EVALS_DIR = path.join(REPO_ROOT, 'examples', 'evals');

// Explicit "loss policy" list. Each entry is an authored top-level field in
// skill.schema.json that must have a representation in the manifest skill-item
// schema. If a future edit deletes one of these without documenting it in
// docs/metadata-contract.md or docs/manifest-contract.md, lint fails loudly.
//
// This closes the regression window that shipped SH-5776: the original
// manifest.schema.json silently dropped domain_object, route_groups, license,
// compatibility, and allowed-tools. Adding a field here is cheap and makes
// the mapping auditable without a separate contract doc.
//
// Updated for schema_version 3: `family` renamed to `browse_category`; the
// new optional v3 fields `project_tags` and `category` flow through as
// top-level manifest properties. `lifecycle` and `runtime_telemetry` project
// under `health.*` — see AUTHORED_FIELDS_MUST_FLOW_HEALTH below for the
// parallel parity guard.
const AUTHORED_FIELDS_MUST_FLOW = [
  'routing_groups',
  'license',
  'compatibility',
  'allowed-tools',
  'browse_category',
  'project_tags',
  'category',
  'superseded_by',
];

// v0.5.0: separate parity guard for authored fields that the manifest
// groups under the `health.*` parent object. Closes the symmetric gap
// discovered by the doctrine-grounded audit: the prior comment on
// AUTHORED_FIELDS_MUST_FLOW claimed `lifecycle` and `runtime_telemetry`
// were covered, but they are not top-level manifest fields — they
// project into `health.lifecycle` and `health.runtime_telemetry` per
// docs/manifest-contract.md § rename-map rows 28–29.
const AUTHORED_FIELDS_MUST_FLOW_HEALTH = [
  'freshness',
  'drift_check',
  'eval_artifacts',
  'eval_state',
  'routing_eval',
  'lifecycle',
  'runtime_telemetry',
];

// Deprecated field names from prior schema versions. Authors using these
// fields receive a WARN from the lint script during the migration window.
// Hard-error enum/shape changes (scope values, drift_check scalar form,
// compatibility scalar form) are rejected by the schema via
// additionalProperties: false and type: object; the warnings below point
// to the rename so the schema error is actionable.
const DEPRECATED_V1_FIELDS = [
  'eval_status',
  'route_groups',
  'domain_frame',
  'family',
];

function loadSchema() {
  return JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
}

function loadManifestSchema() {
  return JSON.parse(fs.readFileSync(MANIFEST_SCHEMA_PATH, 'utf8'));
}

// Frontmatter → manifest parity check. Runs once per lint invocation, not
// per file. Guarantees:
//   1. Every property of skill.schema.json#grounding is representable in
//      manifest.schema.json#skills.items.properties.grounding (prevents the
//      original SH-5776 bug where domain_object was silently dropped).
//   2. Every field in grounding.required is also required in manifest grounding.
//   3. The documented loss-policy fields (AUTHORED_FIELDS_MUST_FLOW) exist
//      as top-level properties on the manifest skill-item schema.
function checkSchemaParity(skillSchema, manifestSchema) {
  const errors = [];

  const groundingSchema = skillSchema.properties && skillSchema.properties.grounding;
  const skillItem = manifestSchema.properties
    && manifestSchema.properties.skills
    && manifestSchema.properties.skills.items;
  const grounding = skillItem && skillItem.properties && skillItem.properties.grounding;

  if (!groundingSchema) {
    errors.push('skill.schema.json: missing properties.grounding (cannot run parity check)');
    return errors;
  }
  if (!grounding) {
    errors.push('manifest.schema.json: missing properties.skills.items.properties.grounding');
    return errors;
  }

  const dfProps = Object.keys(groundingSchema.properties || {});
  const gProps = Object.keys(grounding.properties || {});
  for (const prop of dfProps) {
    if (!gProps.includes(prop)) {
      errors.push(`parity: skill.schema.json#grounding.${prop} is not representable in manifest.schema.json#grounding.properties`);
    }
  }

  const dfRequired = groundingSchema.required || [];
  const gRequired = grounding.required || [];
  for (const req of dfRequired) {
    if (!gRequired.includes(req)) {
      errors.push(`parity: skill.schema.json#grounding.required contains "${req}" but manifest.schema.json#grounding.required does not`);
    }
  }

  const itemProps = Object.keys((skillItem && skillItem.properties) || {});
  for (const f of AUTHORED_FIELDS_MUST_FLOW) {
    if (!itemProps.includes(f)) {
      errors.push(`loss-policy: authored field "${f}" is listed in AUTHORED_FIELDS_MUST_FLOW but manifest.schema.json has no property for it on skills.items`);
    }
  }

  // v0.5.0: verify health-nested authored fields. These project under
  // skills.items.properties.health.properties.* in the manifest.
  const healthSchema = skillItem && skillItem.properties && skillItem.properties.health;
  const healthProps = Object.keys((healthSchema && healthSchema.properties) || {});
  for (const f of AUTHORED_FIELDS_MUST_FLOW_HEALTH) {
    if (!healthProps.includes(f)) {
      errors.push(`loss-policy: authored field "${f}" is listed in AUTHORED_FIELDS_MUST_FLOW_HEALTH but manifest.schema.json has no property for it on skills.items.health`);
    }
  }

  return errors;
}

// Minimal schema validator covering the subset used by skill.schema.json:
// required fields, type checks, enum constraints, pattern constraints,
// and the two conditional rules (overlay → extends, operational → grounding).
function validateAgainstSchema(fm, schema) {
  const errors = [];
  const props = schema.properties || {};

  for (const req of schema.required || []) {
    if (!(req in fm)) errors.push(`missing required field: ${req}`);
  }
  for (const key of Object.keys(fm)) {
    if (!(key in props)) errors.push(`unknown field: ${key}`);
  }

  function checkField(key, value, spec) {
    if (value === null || value === undefined) return;
    if (spec.enum && !spec.enum.includes(value)) {
      errors.push(`${key}: value ${JSON.stringify(value)} not in enum ${JSON.stringify(spec.enum)}`);
    }
    if (spec.pattern && typeof value === 'string' && !new RegExp(spec.pattern).test(value)) {
      errors.push(`${key}: value "${value}" does not match pattern ${spec.pattern}`);
    }
    if (spec.minLength && typeof value === 'string' && value.length < spec.minLength) {
      errors.push(`${key}: length ${value.length} < minLength ${spec.minLength}`);
    }
    if (spec.type === 'array' && !Array.isArray(value)) {
      errors.push(`${key}: expected array, got ${typeof value}`);
    }
    if (spec.type === 'object' && typeof value === 'object' && !Array.isArray(value)) {
      if (spec.required) {
        for (const r of spec.required) {
          if (!(r in (value || {}))) errors.push(`${key}.${r}: missing required sub-field`);
        }
      }
      if (spec.properties) {
        for (const sk of Object.keys(value || {})) {
          if (!(sk in spec.properties)) errors.push(`${key}.${sk}: unknown sub-field`);
        }
      }
    }
    if (spec.oneOf) {
      // schema_version uses oneOf — accept any match.
      // BUG FIX (v0.5.0): when a variant declares `const`, the value MUST equal
      // that const. The prior implementation fell through to the type-only check
      // on non-matching const, allowing any integer to pass `{type: integer, const: 3}`.
      const anyMatch = spec.oneOf.some(variant => {
        if (variant.const !== undefined) {
          // Variant is a const literal — value must equal it exactly (after type coercion for
          // the common "3 vs '3'" case used by schema_version).
          return value === variant.const;
        }
        if (variant.type === 'integer' && Number.isInteger(value)) return true;
        if (variant.type === 'string' && typeof value === 'string' && (!variant.pattern || new RegExp(variant.pattern).test(value))) return true;
        return false;
      });
      if (!anyMatch) errors.push(`${key}: value ${JSON.stringify(value)} does not match any oneOf variant`);
    }
  }

  for (const [key, value] of Object.entries(fm)) {
    if (props[key]) checkField(key, value, props[key]);
  }

  // Conditional rules from allOf
  if (fm.type === 'overlay' && !fm.extends) {
    errors.push(`type: overlay requires extends field`);
  }
  // v0.5.0: enforce the reverse — extends is overlay-only. The schema documents
  // this rule in docs/field-reference.md:492-509 but earlier versions only
  // enforced the forward direction (overlay → requires extends), silently
  // allowing extends on non-overlay skills.
  if (fm.type && fm.type !== 'overlay' && fm.extends) {
    errors.push(`extends is only valid on type: overlay (got type: ${JSON.stringify(fm.type)})`);
  }
  if (fm.scope === 'codebase' && !fm.grounding) {
    errors.push(`scope: codebase requires grounding field`);
  }

  return errors;
}

function checkParentDirMatchesName(filePath, fm) {
  // Only applies to skills/<name>/SKILL.md, not the example template
  if (!filePath.startsWith(SKILLS_DIR)) return [];
  const parentDir = path.basename(path.dirname(filePath));
  if (parentDir !== fm.name) {
    return [`parent directory "${parentDir}" does not match name "${fm.name}" (Agent Skills compatibility rule)`];
  }
  return [];
}

function checkRelationTargets(fm, knownSkillNames) {
  const errors = [];
  const rel = fm.relations || {};

  // v3: relations.boundary and relations.depends_on items may be
  // `{skill, reason}` or `{skill, min_version}` objects. Extract the
  // skill name from either shape.
  function targetName(t) {
    if (typeof t === 'string') return t;
    if (t && typeof t === 'object' && typeof t.skill === 'string') return t.skill;
    return null;
  }

  for (const kind of ['adjacent', 'boundary', 'verify_with', 'depends_on']) {
    const targets = rel[kind] || [];
    for (const t of targets) {
      const name = targetName(t);
      if (name === null) {
        errors.push(`relations.${kind}: item is not a string or object with "skill" property — got ${JSON.stringify(t)}`);
        continue;
      }
      if (!knownSkillNames.has(name)) {
        errors.push(`relations.${kind}: "${name}" does not match any known skill in ${SKILLS_DIR}`);
      }
    }
  }
  return errors;
}

function checkEvalCoherence(filePath, fm) {
  // eval_artifacts: present requires a real eval artifact.
  // Only `present` demands an artifact on disk — `planned` and `none` do not.
  const results = { errors: [], warnings: [] };

  // v0.5.0 (from doctrine-grounded audit): guard against the
  // `eval_artifacts: planned` staleness exploit. If a skill has been in
  // `planned` state longer than its lifecycle.stale_after_days (default 180),
  // emit a warning so the state doesn't sit there indefinitely.
  if (fm.eval_artifacts === 'planned' && fm.freshness) {
    const freshnessDate = new Date(fm.freshness);
    if (!Number.isNaN(freshnessDate.getTime())) {
      const daysOld = (Date.now() - freshnessDate.getTime()) / (24 * 60 * 60 * 1000);
      const threshold = (fm.lifecycle && fm.lifecycle.stale_after_days) || 180;
      if (daysOld > threshold) {
        results.warnings.push(`eval_artifacts: planned has been set for ${Math.round(daysOld)} days (threshold: ${threshold}). Either ship an eval artifact and move to "present", or move to "none" if evals are genuinely not planned.`);
      }
    }
  }

  if (fm.eval_artifacts !== 'present') return results;
  if (!fs.existsSync(EVALS_DIR)) {
    results.errors.push(`eval_artifacts: present declared but ${EVALS_DIR} does not exist`);
    return results;
  }
  const evalFiles = fs.readdirSync(EVALS_DIR).filter(f => f.endsWith('.json'));
  for (const evalFile of evalFiles) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(EVALS_DIR, evalFile), 'utf8'));
      if (data.skill_name === fm.name) return results;
    } catch (e) {
      // ignore malformed eval files here; they are out of scope for this check
    }
  }
  results.errors.push(`eval_artifacts: present declared but no file in ${EVALS_DIR} has skill_name: "${fm.name}"`);
  return results;
}

// v0.5.0: guard against `paths` that consist only of negation patterns.
// Such a list matches nothing (negations only subtract from prior includes).
// This is a dead-routing trap per the Gemini audit finding.
function checkPathsNegation(fm) {
  const paths = fm.paths;
  if (!Array.isArray(paths) || paths.length === 0) return [];
  const allNegation = paths.every(p => typeof p === 'string' && p.startsWith('!'));
  if (allNegation) {
    return [`paths: list consists only of negation patterns (starting with "!") — this matches nothing. Include at least one positive pattern.`];
  }
  return [];
}

// Validate every skill entry in examples/skills.manifest.sample.json against
// the manifest skill-item schema. Uses the same minimal validator as the
// SKILL.md frontmatter check, applied to each array element. Prevents the
// sample manifest from drifting out of step with the manifest schema (which
// was one of the SH-5776 acceptance criteria).
function checkSampleManifest(manifestSchema) {
  if (!fs.existsSync(SAMPLE_MANIFEST_PATH)) return [];
  let sample;
  try {
    sample = JSON.parse(fs.readFileSync(SAMPLE_MANIFEST_PATH, 'utf8'));
  } catch (e) {
    return [`sample manifest parse error: ${e.message}`];
  }
  const itemSchema = manifestSchema.properties
    && manifestSchema.properties.skills
    && manifestSchema.properties.skills.items;
  if (!itemSchema) {
    return ['manifest.schema.json: missing properties.skills.items (cannot validate sample)'];
  }
  const errors = [];
  const skills = Array.isArray(sample.skills) ? sample.skills : [];
  for (let i = 0; i < skills.length; i++) {
    const skill = skills[i];
    const label = skill && skill.id ? skill.id : `[${i}]`;
    const skillErrors = validateAgainstSchema(skill, itemSchema);
    for (const e of skillErrors) errors.push(`skills[${label}]: ${e}`);
  }
  return errors;
}

// Generator parity check (check 8).
//
// Runs `node scripts/generate-manifest.js --include-template` and compares the
// result against `examples/skills.manifest.sample.json`. Both manifests are
// normalized (generated_at removed, keys sorted) before comparison so that
// the live timestamp in the generator output does not cause spurious failures.
//
// Returns an array of error strings (empty = parity holds).
//
// Why include-template? The sample manifest was generated with --include-template
// so the skill-template entry is part of the canonical sample. The parity check
// must use the same flags that were used to generate the sample, otherwise the
// skill count will always differ.
function checkGeneratorParity() {
  if (!fs.existsSync(SAMPLE_MANIFEST_PATH)) {
    return ['generator parity: examples/skills.manifest.sample.json does not exist (run node scripts/generate-manifest.js --include-template --output examples/skills.manifest.sample.json)'];
  }

  const generatorScript = path.join(__dirname, 'generate-manifest.js');
  if (!fs.existsSync(generatorScript)) {
    return ['generator parity: scripts/generate-manifest.js does not exist'];
  }

  let generatedJson;
  try {
    generatedJson = execFileSync(
      process.execPath,
      [generatorScript, '--include-template', '--timestamp', '1970-01-01T00:00:00Z'],
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    );
  } catch (e) {
    return [`generator parity: generate-manifest.js failed — ${e.stderr || e.message}`];
  }

  let generated;
  try {
    generated = JSON.parse(generatedJson);
  } catch (e) {
    return [`generator parity: failed to parse generator output — ${e.message}`];
  }

  let sample;
  try {
    sample = JSON.parse(fs.readFileSync(SAMPLE_MANIFEST_PATH, 'utf8'));
  } catch (e) {
    return [`generator parity: failed to parse sample manifest — ${e.message}`];
  }

  // Normalize both manifests: remove generated_at (changes on every run),
  // then sort all object keys recursively for stable JSON.stringify comparison.
  //
  // Note: JSON.stringify(obj, keyArray) filters keys at all levels, not just
  // the top level — do NOT use that pattern for recursive key sorting. Instead,
  // use a recursive sortKeys pass that visits every nested object.
  function sortKeys(value) {
    if (Array.isArray(value)) return value.map(sortKeys);
    if (value !== null && typeof value === 'object') {
      const sorted = {};
      for (const key of Object.keys(value).sort()) sorted[key] = sortKeys(value[key]);
      return sorted;
    }
    return value;
  }

  function normalize(manifest) {
    const m = Object.assign({}, manifest);
    delete m.generated_at;
    return sortKeys(m);
  }

  const normalizedGenerated = JSON.stringify(normalize(generated), null, 2);
  const normalizedSample = JSON.stringify(normalize(sample), null, 2);

  if (normalizedGenerated !== normalizedSample) {
    // Produce a line-level diff summary: find first diverging line
    const genLines = normalizedGenerated.split('\n');
    const sampleLines = normalizedSample.split('\n');
    const maxLen = Math.max(genLines.length, sampleLines.length);
    let firstDiffLine = -1;
    for (let i = 0; i < maxLen; i++) {
      if (genLines[i] !== sampleLines[i]) { firstDiffLine = i + 1; break; }
    }
    const hint = firstDiffLine > 0
      ? ` (first difference at normalized line ${firstDiffLine}: sample has "${sampleLines[firstDiffLine - 1]}", generator produces "${genLines[firstDiffLine - 1]}")`
      : '';
    return [
      `generator parity: examples/skills.manifest.sample.json is out of step with generator output${hint}`,
      'generator parity: run `node scripts/generate-manifest.js --include-template --timestamp <ISO> --output examples/skills.manifest.sample.json` to regenerate',
    ];
  }

  return [];
}

function collectSkillFiles(args) {
  const files = [];
  const includeTemplate = args.includes('--include-template');
  const explicit = args.filter(a => !a.startsWith('--'));

  if (explicit.length > 0) {
    for (const arg of explicit) {
      const abs = path.resolve(arg);
      if (fs.statSync(abs).isDirectory()) {
        const skillMd = path.join(abs, 'SKILL.md');
        if (fs.existsSync(skillMd)) files.push(skillMd);
      } else if (abs.endsWith('SKILL.md') || abs.endsWith('.md')) {
        files.push(abs);
      }
    }
  } else {
    if (fs.existsSync(SKILLS_DIR)) {
      for (const name of fs.readdirSync(SKILLS_DIR)) {
        const skillMd = path.join(SKILLS_DIR, name, 'SKILL.md');
        if (fs.existsSync(skillMd)) files.push(skillMd);
      }
    }
    if (includeTemplate && fs.existsSync(TEMPLATE_PATH)) files.push(TEMPLATE_PATH);
  }

  return files;
}

function main() {
  const args = process.argv.slice(2);
  const schema = loadSchema();
  const manifestSchema = loadManifestSchema();
  const files = collectSkillFiles(args);
  const skipGeneratorParity = args.includes('--skip-generator-parity');
  // --strict: promote warnings to errors so CI can enforce a zero-warning bar.
  const strict = args.includes('--strict');
  // --no-color: suppress ANSI escape codes (useful in CI environments).
  const noColor = args.includes('--no-color');

  if (files.length === 0) {
    console.error('No skill files found to lint.');
    process.exit(1);
  }

  // Cross-schema parity: frontmatter → manifest. Runs once per invocation.
  // Fails the lint early if either schema has drifted from the authored-to-
  // generated mapping in docs/metadata-contract.md.
  //
  // Tier label legend (see docs/ARCHITECTURE.md):
  //   [T1]      Tier 1 — binding contract (schemas/)
  //   [T1↔T3]   Tier 1 ↔ Tier 3 parity check (authored schema ↔ manifest schema)
  //   [T3↔T5]   Tier 3 ↔ Tier 5 parity check (generator output ↔ sample manifest)
  //   [T5]      Tier 5 — specimen (starter skill or template)
  //   [T5 sample] Tier 5 specimen — the sample manifest
  const parityErrors = checkSchemaParity(schema, manifestSchema);
  if (parityErrors.length > 0) {
    console.error('FAIL [T1↔T3]     schemas/ (cross-schema parity)');
    for (const e of parityErrors) console.error(`     - ${e}`);
  } else {
    console.log('OK   [T1↔T3]     schemas/ (cross-schema parity)');
  }

  // Sample manifest conformance. Validates each skill entry in
  // examples/skills.manifest.sample.json against manifest.schema.json#skills.items.
  const sampleErrors = checkSampleManifest(manifestSchema);
  if (sampleErrors.length > 0) {
    console.error('FAIL [T5 sample] examples/skills.manifest.sample.json');
    for (const e of sampleErrors) console.error(`     - ${e}`);
  } else {
    console.log('OK   [T5 sample] examples/skills.manifest.sample.json');
  }

  // Generator parity: re-run the manifest generator and verify the output
  // matches examples/skills.manifest.sample.json (ignoring generated_at).
  // This ensures the sample is always kept in sync with the generator —
  // a hand-edited sample will fail this check. Skippable via --skip-generator-parity.
  let generatorParityErrors = [];
  if (!skipGeneratorParity) {
    generatorParityErrors = checkGeneratorParity();
    if (generatorParityErrors.length > 0) {
      console.error('FAIL [T3↔T5]     examples/skills.manifest.sample.json (generator parity)');
      for (const e of generatorParityErrors) console.error(`     - ${e}`);
    } else {
      console.log('OK   [T3↔T5]     examples/skills.manifest.sample.json (generator parity)');
    }
  }

  // Build the known-skill set from skills/ for relation target checks
  const knownSkillNames = new Set();
  if (fs.existsSync(SKILLS_DIR)) {
    for (const name of fs.readdirSync(SKILLS_DIR)) {
      const skillMd = path.join(SKILLS_DIR, name, 'SKILL.md');
      if (fs.existsSync(skillMd)) {
        const fm = parseFrontmatter(fs.readFileSync(skillMd, 'utf8'));
        if (fm && fm.name) knownSkillNames.add(fm.name);
      }
    }
  }

  let totalErrors = parityErrors.length + sampleErrors.length + generatorParityErrors.length;
  let totalWarnings = 0;

  for (const file of files) {
    const relPath = path.relative(REPO_ROOT, file);
    const text = fs.readFileSync(file, 'utf8');
    const fm = parseFrontmatter(text);
    if (!fm) {
      console.error(`FAIL ${relPath}: no frontmatter found`);
      totalErrors++;
      continue;
    }

    // ----------------------------------------------------------------
    // Migration warnings (v1 → v2 field renames). These emit WARN lines
    // above the per-file OK/FAIL summary so authors see them even when the
    // file otherwise passes.
    // ----------------------------------------------------------------

    // Migration warnings for v1 → v2 field renames.
    if (fm.domain_frame) {
      emitWarning(relPath, text, 'domain_frame', '"domain_frame" is deprecated — rename to "grounding"', {
        help: 'Rename "domain_frame:" to "grounding:". See docs/manifest-contract.md § Migration Note — v1 → v2.',
        noColor,
      });
    }
    if (fm.eval_status) {
      emitWarning(relPath, text, 'eval_status', '"eval_status" is deprecated — split into "eval_artifacts", "eval_state", and "routing_eval"', {
        help: 'See docs/manifest-contract.md § Migration Note — v1 → v2.',
        noColor,
      });
    }
    if (fm.route_groups) {
      emitWarning(relPath, text, 'route_groups', '"route_groups" is deprecated — rename to "routing_groups"', {
        help: 'Rename "route_groups:" to "routing_groups:". Values are unchanged.',
        noColor,
      });
    }
    if (fm.portability && typeof fm.portability === 'object') {
      if (fm.portability.level) {
        emitWarning(relPath, text, 'level', '"portability.level" is deprecated — rename to "portability.readiness"', {
          help: 'See docs/field-reference.md § portability.',
          noColor,
        });
      }
      if (fm.portability.exports) {
        emitWarning(relPath, text, 'exports', '"portability.exports" is deprecated — rename to "portability.targets"', {
          help: 'See docs/field-reference.md § portability.',
          noColor,
        });
      }
    }

    // Migration warnings for v2 → v3 field changes.
    if (fm.family) {
      emitWarning(relPath, text, 'family', '"family" is deprecated in v3 — rename to "browse_category"', {
        help: 'Run `node scripts/migrate-skill-v2-to-v3.js <skill>` to apply. See docs/manifest-contract.md § Migration Note — v2 → v3.',
        noColor,
      });
    }
    if (typeof fm.drift_check === 'string') {
      emitWarning(relPath, text, 'drift_check', 'scalar "drift_check" is deprecated in v3 — use an object with "last_verified"', {
        help: 'Run `node scripts/migrate-skill-v2-to-v3.js <skill>` to apply. See docs/field-reference.md § drift_check.',
        noColor,
      });
    }
    if (typeof fm.compatibility === 'string') {
      emitWarning(relPath, text, 'compatibility', 'scalar "compatibility" is deprecated in v3 — use an object with "runtimes"/"node"/"notes"', {
        help: 'Run `node scripts/migrate-skill-v2-to-v3.js <skill>` to apply. See docs/field-reference.md § compatibility.',
        noColor,
      });
    }

    // ----------------------------------------------------------------
    // Collect errors from all per-file checks.
    // ----------------------------------------------------------------
    const evalResult = checkEvalCoherence(file, fm);
    const rawErrors = [
      ...validateAgainstSchema(fm, schema),
      ...checkParentDirMatchesName(file, fm),
      ...checkRelationTargets(fm, knownSkillNames),
      ...evalResult.errors,
      ...checkPathsNegation(fm),
    ];
    const rawWarnings = [
      ...evalResult.warnings,
    ];

    // Archetype-aware section check (check 10).
    const archetypeResult = checkArchetypeSections({ filePath: relPath, sourceText: text, fm });

    // Routing quality check (check 11).
    const routingResult = checkRoutingQuality({ filePath: relPath, sourceText: text, fm });

    // Promote warnings to errors when --strict is active.
    const fileErrors = [
      ...rawErrors.map(msg => ({ msg, line: null, column: null, help: null })),
      ...archetypeResult.errors.map(e => ({ msg: e.message, line: e.line, column: e.column, help: e.help })),
      ...routingResult.errors.map(e => ({ msg: e.message, line: e.line, column: e.column, help: e.help })),
      ...(strict ? [
        ...rawWarnings.map(msg => ({ msg: `[promoted from warn] ${msg}`, line: null, column: null, help: null })),
        ...archetypeResult.warnings.map(w => ({ msg: `[promoted from warn] ${w.message}`, line: w.line, column: w.column, help: w.help })),
        ...routingResult.warnings.map(w => ({ msg: `[promoted from warn] ${w.message}`, line: w.line, column: w.column, help: w.help })),
      ] : []),
    ];

    const fileWarnings = strict ? [] : [
      ...rawWarnings.map(msg => ({ message: msg, line: null, column: null, help: null })),
      ...archetypeResult.warnings,
      ...routingResult.warnings,
    ];

    // Tier label per file: template + starter skills are all Tier 5 specimens.
    const tierLabel = '[T5]        ';
    if (fileErrors.length === 0 && fileWarnings.length === 0) {
      console.log(`OK   ${tierLabel}${relPath}`);
    } else if (fileErrors.length === 0) {
      // Only warnings — file passes but annotate with WARN prefix.
      console.log(`OK   ${tierLabel}${relPath} (${fileWarnings.length} warning(s))`);
    } else {
      console.error(`FAIL ${tierLabel}${relPath}`);
    }

    // Print errors with code frames.
    for (const e of fileErrors) {
      if (e.line != null) {
        process.stderr.write(formatCodeFrame({
          filePath: relPath,
          line: e.line,
          column: e.column || 1,
          message: e.msg,
          help: e.help,
          sourceText: text,
          severity: 'error',
          noColor,
        }));
      } else {
        // Legacy plain-string errors from schema/relation checks. Locate the
        // field name in frontmatter for a better-than-nothing code frame.
        const fieldMatch = e.msg.match(/^([a-zA-Z_][a-zA-Z0-9_.[\]-]*):/);
        const fieldKey = fieldMatch ? fieldMatch[1].split('.')[0] : null;
        const loc = fieldKey ? locateYamlKey(text, fieldKey) : { line: 1, column: 1 };
        process.stderr.write(formatCodeFrame({
          filePath: relPath,
          line: loc.line,
          column: loc.column,
          message: e.msg,
          sourceText: text,
          severity: 'error',
          noColor,
        }));
      }
      totalErrors++;
    }

    // Print warnings with code frames.
    for (const w of fileWarnings) {
      process.stderr.write(formatCodeFrame({
        filePath: relPath,
        line: w.line,
        column: w.column || 1,
        message: w.message,
        help: w.help,
        sourceText: text,
        severity: 'warn',
        noColor,
      }));
      totalWarnings++;
    }
  }

  const warnSuffix = totalWarnings > 0 ? `, ${totalWarnings} warning(s)` : '';
  const strictNote = strict && totalWarnings === 0 ? '' : strict ? ' (--strict: warnings promoted to errors)' : '';
  console.log(`\n${files.length} file(s) checked, ${totalErrors} error(s)${warnSuffix}.${strictNote}`);
  process.exit(totalErrors > 0 ? 1 : 0);
}

/**
 * Emit a migration-warning line with a code frame, located at the given YAML
 * key in the frontmatter.
 *
 * @param {string} relPath  - File path relative to repo root.
 * @param {string} text     - Full file text.
 * @param {string} key      - YAML key to locate (for the frame position).
 * @param {string} message  - Warning message.
 * @param {object} [opts]   - Optional: { help, noColor }.
 */
function emitWarning(relPath, text, key, message, opts = {}) {
  const loc = locateYamlKey(text, key) || { line: 1, column: 1 };
  process.stderr.write(formatCodeFrame({
    filePath: relPath,
    line: loc.line,
    column: loc.column,
    message,
    help: opts.help,
    sourceText: text,
    severity: 'warn',
    noColor: opts.noColor || false,
  }));
}

main();
