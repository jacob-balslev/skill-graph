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
 *   4. Eval artifact coherence check (eval_status: evals requires at
 *      least one eval file targeting the skill)
 *   5. scope: operational → require grounding (conditional from schema)
 *   6. Cross-schema parity (runs once): every property and required field
 *      of skill.schema.json#grounding must be representable in
 *      manifest.schema.json#grounding, and the documented loss-policy
 *      fields (route_groups, license, compatibility, allowed-tools) must
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
 *
 * Self-contained. Only uses Node built-ins — no external dependencies.
 * Exit 0 on success, 1 on any failure.
 *
 * Usage:
 *   node scripts/skill-lint.js                       # lint all skills
 *   node scripts/skill-lint.js skills/a11y           # lint one skill
 *   node scripts/skill-lint.js --include-template    # also lint the example template
 *   node scripts/skill-lint.js --skip-generator-parity  # skip check 8
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { parseFrontmatter } = require('./lib/parse-frontmatter');

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
const AUTHORED_FIELDS_MUST_FLOW = [
  'route_groups',
  'license',
  'compatibility',
  'allowed-tools',
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
      // schema_version uses oneOf — accept any match
      const anyMatch = spec.oneOf.some(variant => {
        if (variant.const !== undefined && value === variant.const) return true;
        if (variant.type === 'integer' && Number.isInteger(value)) return true;
        if (variant.type === 'string' && typeof value === 'string' && (!variant.pattern || new RegExp(variant.pattern).test(value))) return true;
        return false;
      });
      if (!anyMatch) errors.push(`${key}: value does not match any oneOf variant`);
    }
  }

  for (const [key, value] of Object.entries(fm)) {
    if (props[key]) checkField(key, value, props[key]);
  }

  // Conditional rules from allOf
  if (fm.type === 'overlay' && !fm.extends) {
    errors.push(`type: overlay requires extends field`);
  }
  if (fm.scope === 'operational' && !fm.grounding) {
    errors.push(`scope: operational requires grounding field`);
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
  for (const kind of ['adjacent', 'boundary', 'verify_with', 'depends_on']) {
    const targets = rel[kind] || [];
    for (const t of targets) {
      if (!knownSkillNames.has(t)) {
        errors.push(`relations.${kind}: "${t}" does not match any known skill in ${SKILLS_DIR}`);
      }
    }
  }
  return errors;
}

function checkEvalCoherence(filePath, fm) {
  if (fm.eval_status !== 'evals') return [];
  if (!fs.existsSync(EVALS_DIR)) {
    return [`eval_status: evals declared but ${EVALS_DIR} does not exist`];
  }
  const evalFiles = fs.readdirSync(EVALS_DIR).filter(f => f.endsWith('.json'));
  for (const evalFile of evalFiles) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(EVALS_DIR, evalFile), 'utf8'));
      if (data.skill_name === fm.name) return [];
    } catch (e) {
      // ignore malformed eval files here; they are out of scope for this check
    }
  }
  return [`eval_status: evals declared but no file in ${EVALS_DIR} has skill_name: "${fm.name}"`];
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

  if (files.length === 0) {
    console.error('No skill files found to lint.');
    process.exit(1);
  }

  // Cross-schema parity: frontmatter → manifest. Runs once per invocation.
  // Fails the lint early if either schema has drifted from the authored-to-
  // generated mapping in docs/metadata-contract.md.
  const parityErrors = checkSchemaParity(schema, manifestSchema);
  if (parityErrors.length > 0) {
    console.error('FAIL schemas/ (cross-schema parity)');
    for (const e of parityErrors) console.error(`     - ${e}`);
  } else {
    console.log('OK   schemas/ (cross-schema parity)');
  }

  // Sample manifest conformance. Validates each skill entry in
  // examples/skills.manifest.sample.json against manifest.schema.json#skills.items.
  const sampleErrors = checkSampleManifest(manifestSchema);
  if (sampleErrors.length > 0) {
    console.error('FAIL examples/skills.manifest.sample.json');
    for (const e of sampleErrors) console.error(`     - ${e}`);
  } else {
    console.log('OK   examples/skills.manifest.sample.json');
  }

  // Generator parity: re-run the manifest generator and verify the output
  // matches examples/skills.manifest.sample.json (ignoring generated_at).
  // This ensures the sample is always kept in sync with the generator —
  // a hand-edited sample will fail this check. Skippable via --skip-generator-parity.
  let generatorParityErrors = [];
  if (!skipGeneratorParity) {
    generatorParityErrors = checkGeneratorParity();
    if (generatorParityErrors.length > 0) {
      console.error('FAIL examples/skills.manifest.sample.json (generator parity)');
      for (const e of generatorParityErrors) console.error(`     - ${e}`);
    } else {
      console.log('OK   examples/skills.manifest.sample.json (generator parity)');
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
  for (const file of files) {
    const relPath = path.relative(REPO_ROOT, file);
    const text = fs.readFileSync(file, 'utf8');
    const fm = parseFrontmatter(text);
    if (!fm) {
      console.error(`FAIL ${relPath}: no frontmatter found`);
      totalErrors++;
      continue;
    }
    // Deprecation warning: skills authored with the old domain_frame field name
    // (schema_version: 1 compatibility window) are warned here. For schema_version: 2
    // (when released), domain_frame will be a hard error (rejected by the schema).
    // See docs/manifest-contract.md § Migration Note — domain_frame → grounding.
    if (fm.domain_frame) {
      console.warn(`WARN ${relPath}: "domain_frame" is deprecated — rename to "grounding" (schema_version: 2 will reject this field)`);
    }

    const errors = [
      ...validateAgainstSchema(fm, schema),
      ...checkParentDirMatchesName(file, fm),
      ...checkRelationTargets(fm, knownSkillNames),
      ...checkEvalCoherence(file, fm),
    ];
    if (errors.length === 0) {
      console.log(`OK   ${relPath}`);
    } else {
      console.error(`FAIL ${relPath}`);
      for (const e of errors) console.error(`     - ${e}`);
      totalErrors += errors.length;
    }
  }

  console.log(`\n${files.length} file(s) checked, ${totalErrors} error(s).`);
  process.exit(totalErrors > 0 ? 1 : 0);
}

main();
