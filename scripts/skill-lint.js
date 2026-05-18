#!/usr/bin/env node
/**
 * Skill Graph lint tool.
 *
 * Validates every `skills/<name>/SKILL.md` (and optionally
 * `examples/skill-metadata-template.md`) against the frontmatter schema. Runs:
 *
 *   1. Schema validation against `schemas/skill.schema.json`
 *   2. Parent-directory-matches-name check (SKILL.md compatibility)
 *   3. Relation target existence check (adjacent, boundary, verify_with,
 *      depends_on targets must be real sibling skills in the repo)
 *   4. Eval artifact coherence check (eval_artifacts: present requires at
 *      least one eval file targeting the skill)
 *   5. scope: codebase → require grounding (conditional from schema)
 *   6. Cross-schema parity (runs once): every property and required field
 *      of skill.schema.json#grounding must be representable in
 *      manifest.schema.json#grounding, and the documented loss-policy
 *      fields (routing_bundles, license, compatibility, allowed-tools) must
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
 *      for scope: codebase or routing_bundles-having skills; warns when
 *      description text appears verbatim in ## Coverage.
 *      See scripts/lint/check-routing-quality.js.
 *  12. Routing-eval integrity (runs per file): errors when routing_eval:
 *      present but examples / anti_examples are empty, OR when the routing
 *      harness (scripts/skill-graph-routing-eval.js) reports any FAIL case
 *      for the skill. Turns the `present` assertion into a verifiable
 *      claim — a skill can only ship `present` when every positive example
 *      routes to itself and every anti_example routes away (ideally to a
 *      skill named in its relations.boundary[]).
 *      See scripts/lint/check-routing-eval.js.
 *  13. Category-enum enforcement (runs per file): errors when `category` is
 *      set to a value not in the 6-value canonical enum (foundations,
 *      engineering, design, quality, agent, product). Redundant-but-correct
 *      second layer on top of the schema enum — provides a more descriptive
 *      error message with the authoritative definitions inline.
 *      See scripts/lint/check-category-enum.js.
 *  14. Stability promotion gate (runs per file): warns when a skill declares
 *      `stability: stable` without meeting all five promotion criteria:
 *      (1) eval_state ≠ unverified, (2) eval_score ≥ 4.0, (3) routing_eval:
 *      present, (4) drift_check.last_verified within 90 days, (5)
 *      grounding.truth_sources populated (codebase/reference scope) or scope
 *      is portable (exempt). All criteria are checked independently — no
 *      short-circuit. WARN level only — never ERRORs.
 *      See scripts/lint/check-stability-promotion.js.
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
 *   node scripts/skill-lint.js --relation-hygiene  # include broad relation-graph hygiene warnings
 *   node scripts/skill-lint.js --strict              # promote warnings to errors
 *   node scripts/skill-lint.js --no-color            # plain output for CI
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { parseFrontmatter, normalizeFrontmatter } = require('./lib/parse-frontmatter');
const { checkAliasParity } = require('./lib/alias-contract');
const { loadWorkspaceConfig, resolveSchemaPath, resolveSkillRoots, resolveTruthSourcePath, workspaceRoot } = require('./lib/roots');
const { formatCodeFrame, locateYamlKey, locateH2Section } = require('./lint/format-code-frame');
const { checkArchetypeSections } = require('./lint/check-archetype-sections');
const { checkRoutingQuality } = require('./lint/check-routing-quality');
const { checkRoutingEval } = require('./lint/check-routing-eval');
const { checkCategoryEnum } = require('./lint/check-category-enum');
const { checkStabilityPromotion } = require('./lint/check-stability-promotion');

const REPO_ROOT = workspaceRoot();
const TEMPLATE_PATH = path.join(REPO_ROOT, 'examples', 'skill-metadata-template.md');
const SCHEMA_PATH = resolveSchemaPath(REPO_ROOT, 'skill.schema.json');
const MANIFEST_SCHEMA_PATH = resolveSchemaPath(REPO_ROOT, 'manifest.schema.json');
const SAMPLE_MANIFEST_PATH = path.join(REPO_ROOT, 'examples', 'skills.manifest.sample.json');
const EVALS_DIR = path.join(REPO_ROOT, 'examples', 'evals');
const WORKSPACE_CONFIG = loadWorkspaceConfig(REPO_ROOT, msg => process.stderr.write(`WARN ${msg}\n`));
const SKILL_ROOTS = resolveSkillRoots(REPO_ROOT, WORKSPACE_CONFIG);
const SKILL_ROOT_LABEL = SKILL_ROOTS
  .map(root => path.relative(REPO_ROOT, root.absPath).split(path.sep).join('/') || '.')
  .join(', ');

// Explicit "loss policy" list. Each entry is an authored top-level field in
// skill.schema.json that must have a representation in the manifest skill-item
// schema. If a future edit deletes one of these without documenting it in
// docs/skill-metadata-protocol.md or docs/manifest-field-mapping.md, lint fails loudly.
//
// This closes the regression window that shipped SH-5776: the original
// manifest.schema.json silently dropped domain_object, routing_bundles, license,
// compatibility, and allowed-tools. Adding a field here is cheap and makes
// the mapping auditable without a separate contract doc.
//
// Updated for schema_version 4: `browse_category` became `category`,
// `category` became `domain`, `project_tags` became `workspace_tags`, and
// `routing_groups` became `routing_bundles`. `lifecycle` and `runtime_telemetry` project
// under `health.*` — see AUTHORED_FIELDS_MUST_FLOW_HEALTH below for the
// parallel parity guard.
const AUTHORED_FIELDS_MUST_FLOW = [
  'urn',
  'archetype',
  'domain',
  'routing_bundles',
  'license',
  'compatibility',
  'allowed-tools',
  'allowed_tools',
  'category',
  'workspace_tags',
  'concept',
  'superseded_by',
];

// v0.5.0: separate parity guard for authored fields that the manifest
// groups under the `health.*` parent object. Closes the symmetric gap
// discovered by the doctrine-grounded audit: the prior comment on
// AUTHORED_FIELDS_MUST_FLOW claimed `lifecycle` and `runtime_telemetry`
// were covered, but they are not top-level manifest fields — they
// project into `health.lifecycle` and `health.runtime_telemetry` per
// docs/manifest-field-mapping.md § rename-map rows 28–29.
const AUTHORED_FIELDS_MUST_FLOW_HEALTH = [
  'freshness',
  'drift_check',
  'eval_artifacts',
  'eval_state',
  'routing_eval',
  'comprehension_state',
  'eval_last_run',
  'eval',
  'reviewed_at',
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
  if (fm.stability === 'deprecated' && !fm.superseded_by) {
    errors.push(`stability: deprecated requires superseded_by field`);
  }
  if (fm.comprehension_state === 'present' && !fm.concept) {
    errors.push(`comprehension_state: present requires concept field`);
  }

  return errors;
}

function checkParentDirMatchesName(filePath, fm) {
  // Only applies to <skill-root>/<name>/SKILL.md, not the example template.
  if (path.basename(filePath) !== 'SKILL.md') return [];
  const parentDir = path.basename(path.dirname(filePath));
  if (parentDir !== fm.name) {
    return [`parent directory "${parentDir}" does not match name "${fm.name}" (SKILL.md compatibility rule)`];
  }
  return [];
}

function checkRelationTargets(fm, knownSkillNames) {
  const errors = [];
  const rel = fm.relations || {};

  // v3: relations.boundary, relations.disjoint_with, and relations.depends_on
  // items may be `{skill, reason}` or `{skill, min_version}` objects. Extract
  // the skill name from either shape.
  function targetName(t) {
    if (typeof t === 'string') return t;
    if (t && typeof t === 'object' && typeof t.skill === 'string') return t.skill;
    return null;
  }

  // Predicate set per ADR 0001 (v3.1 SKOS additions: related/broader/narrower)
  // and ADR 0006 (boundary stays canonical for routing-layer handoff;
  // disjoint_with is a separate orthogonal relation for formal OWL
  // class-disjointness — both targets must exist as known skills).
  const predicateKinds = [
    // v3.1 SKOS additions (preferred names; ADR 0001 Decisions #1 + #3)
    'related', 'broader', 'narrower',
    // v3.0 stable + canonical (ADR 0006: boundary stays canonical)
    'adjacent', 'boundary', 'verify_with', 'depends_on',
    // v3.1 separate orthogonal relation per ADR 0006 Option B
    'disjoint_with',
  ];

  for (const kind of predicateKinds) {
    const targets = rel[kind] || [];
    for (const t of targets) {
      const name = targetName(t);
      if (name === null) {
        errors.push(`relations.${kind}: item is not a string or object with "skill" property — got ${JSON.stringify(t)}`);
        continue;
      }
      if (!knownSkillNames.has(name)) {
        errors.push(`relations.${kind}: "${name}" does not match any known skill in configured roots (${SKILL_ROOT_LABEL})`);
      }
    }
  }
  return errors;
}

/**
 * Detect double-declarations across deprecated/preferred predicate aliases.
 * Per ADR 0001, `adjacent` is a deprecated alias for `related`. Authors who
 * declare the same target under both names are duplicating intent; the manifest
 * will emit both keys and downstream consumers will see the relation twice.
 *
 * Per ADR 0006, `boundary` and `disjoint_with` are NOT aliases (they have
 * distinct semantics — routing-layer vs formal OWL class-disjointness), so
 * declaring the same target under both is legitimate and is NOT flagged.
 *
 * Returns warning records (not errors).
 */
function checkRelationDoubleDeclarations(fm) {
  const warnings = [];
  const rel = fm.relations || {};

  function targetName(t) {
    if (typeof t === 'string') return t;
    if (t && typeof t === 'object' && typeof t.skill === 'string') return t.skill;
    return null;
  }

  function targetSet(arr) {
    if (!Array.isArray(arr)) return new Set();
    const out = new Set();
    for (const t of arr) {
      const n = targetName(t);
      if (n) out.add(n);
    }
    return out;
  }

  // adjacent (deprecated) vs related (preferred) — same SKOS mapping per ADR 0001
  const adjacentTargets = targetSet(rel.adjacent);
  const relatedTargets = targetSet(rel.related);
  for (const name of adjacentTargets) {
    if (relatedTargets.has(name)) {
      warnings.push({
        message: `relations: "${name}" appears in both "adjacent" (deprecated) and "related" (preferred) — drop the "adjacent" entry to avoid double-counting in the manifest. See ADR 0001.`,
      });
    }
  }

  return warnings;
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

// A1 + A2: relation graph semantics.
//
// Validates the adjacency/boundary graph across every authored skill.
// Two invariants are checked:
//
//  1. Adjacency symmetry (WARNING). `adjacent` models "siblings often used
//     together" — a symmetric relationship. If A says B is adjacent but B
//     does not name A, either one author forgot the return edge or adjacency
//     is being used directionally (which the contract does not endorse).
//     Warning — not error — because historical skills may have drifted and
//     fixing the reciprocal is a one-line author change.
//
//  2. adjacent ↔ boundary contradiction (ERROR). `boundary` is negative
//     routing ("hand off, do NOT activate"). If A lists B as adjacent and B
//     lists A as boundary (or vice versa), the two authors disagree on
//     whether the skills belong together. This is a real contract
//     violation and will mis-route prompts. Errors so CI fails.
//
// Polymorphism: v3 `boundary` items are `{skill, reason}` objects;
// `adjacent` items are plain strings. The `rel()` helper extracts the skill
// name from either shape (same logic as checkRelationTargets above).
function checkRelationSemantics(fm, knownFrontmatters) {
  const results = { errors: [], warnings: [] };
  if (!fm || !fm.name || !fm.relations) return results;

  function rel(kind, targets) {
    const out = [];
    for (const t of targets || []) {
      if (typeof t === 'string') out.push(t);
      else if (t && typeof t === 'object' && typeof t.skill === 'string') out.push(t.skill);
    }
    return out;
  }

  const selfName = fm.name;
  const myAdjacent = rel('adjacent', fm.relations.adjacent);
  const myBoundary = rel('boundary', fm.relations.boundary);

  for (const target of myAdjacent) {
    const peer = knownFrontmatters.get(target);
    if (!peer || !peer.relations) continue;

    const peerAdjacent = rel('adjacent', peer.relations.adjacent);
    const peerRelatedPreferred = rel('related', peer.relations.related);
    const peerRelated = [...new Set([...peerAdjacent, ...peerRelatedPreferred])];
    const peerBoundary = rel('boundary', peer.relations.boundary);

    // ERROR: adjacent ↔ boundary contradiction.
    if (peerBoundary.includes(selfName)) {
      results.errors.push(
        `relations: this skill lists "${target}" as adjacent, but "${target}" lists this skill as boundary — adjacency/boundary contradiction (routing will mis-fire). Either remove from my adjacent or remove from ${target}.boundary.`
      );
      continue; // contradiction supersedes the asymmetry warning
    }

    // WARNING: adjacency asymmetry (reciprocal edge missing).
    if (!peerRelated.includes(selfName)) {
      results.warnings.push(
        `relations.adjacent: "${target}" does not reciprocate adjacency — adjacency is symmetric ("often used together"). Either add "${selfName}" to ${target}.relations.adjacent, or promote one side to relations.verify_with / relations.depends_on if the link is directional.`
      );
    }
  }

  // Also catch the mirror case: I list X as boundary while X lists me as adjacent.
  // Covers asymmetric authoring where the contradiction lives on the boundary side.
  for (const target of myBoundary) {
    const peer = knownFrontmatters.get(target);
    if (!peer || !peer.relations) continue;
    const peerAdjacent = rel('adjacent', peer.relations.adjacent);
    if (peerAdjacent.includes(selfName)) {
      results.errors.push(
        `relations: this skill lists "${target}" as boundary, but "${target}" lists this skill as adjacent — adjacency/boundary contradiction (routing will mis-fire). Either remove "${target}" from my boundary or remove "${selfName}" from ${target}.adjacent.`
      );
    }
  }

  return results;
}

// D2: truth-source range validator.
//
// Scans every eval artifact under examples/evals/ and validates each
// `truth_sources` reference: the referenced file exists AND the end line is
// within file bounds. Catches the silent-drift class where SKILL.md gets
// rewritten but truth_sources still cite the old line ranges, leading
// graders to read the wrong content.
//
// Reference formats:
//   `path`                   — whole-file reference
//   `path:start-end`         — line range (or `path:line` for a single line)
//   `path#anchor`            — heading anchor; the file must contain a heading
//                              whose slug equals `anchor`. Anchors are
//                              drift-resistant: renaming a section requires
//                              updating the anchor, which the linter catches,
//                              whereas editing section content around fixed
//                              line numbers silently drifts. Use anchor form
//                              alongside a line range for defense in depth.
// Malformed references are surfaced as errors (the grader has nothing to do
// with a broken pointer).
//
// Runs once per invocation, not per file. Returns plain error strings.
const TRUTH_SOURCE_RE = /^([^:#]+)(?:(?::(\d+)(?:-(\d+))?)|(?:#([a-z0-9][a-z0-9-]*)))?$/;

// Slugify a heading the same way common markdown renderers do: strip leading
// `#` markers, lowercase, replace non-alphanumerics with hyphens, collapse
// consecutive hyphens, trim leading/trailing hyphens.
function slugifyHeading(headingText) {
  return headingText
    .replace(/^#+\s*/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Extract the set of heading anchors present in a markdown file. Cached per
// file path to avoid repeated re-parsing when many evals cite the same file.
const headingAnchorsCache = new Map();
function getHeadingAnchors(absPath) {
  if (headingAnchorsCache.has(absPath)) return headingAnchorsCache.get(absPath);
  const content = fs.readFileSync(absPath, 'utf8');
  const anchors = new Set();
  const lines = content.split('\n');
  let inCodeFence = false;
  for (const line of lines) {
    if (/^```/.test(line)) { inCodeFence = !inCodeFence; continue; }
    if (inCodeFence) continue;
    const m = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (m) anchors.add(slugifyHeading(m[2]));
  }
  headingAnchorsCache.set(absPath, anchors);
  return anchors;
}

function checkEvalTruthSourceRanges() {
  const errors = [];
  if (!fs.existsSync(EVALS_DIR)) return errors;

  const evalFiles = fs.readdirSync(EVALS_DIR).filter(f => f.endsWith('.json')).sort();
  const lineCountCache = new Map();

  for (const evalFile of evalFiles) {
    const evalPath = path.join(EVALS_DIR, evalFile);
    let data;
    try {
      data = JSON.parse(fs.readFileSync(evalPath, 'utf8'));
    } catch (e) {
      // Malformed JSON files surface elsewhere; skip here rather than double-report.
      continue;
    }
    const cases = Array.isArray(data.evals) ? data.evals : [];
    for (const c of cases) {
      const refs = Array.isArray(c.truth_sources) ? c.truth_sources : [];
      for (const raw of refs) {
        const s = String(raw);
        const m = s.match(TRUTH_SOURCE_RE);
        if (!m) {
          errors.push(`examples/evals/${evalFile} eval id=${c.id}: truth_source "${s}" is malformed — expected "path", "path:start-end", or "path#anchor"`);
          continue;
        }
        const [, relPath, start, end, anchor] = m;
        const abs = resolveTruthSourcePath(relPath, REPO_ROOT, SKILL_ROOTS);
        if (!fs.existsSync(abs)) {
          errors.push(`examples/evals/${evalFile} eval id=${c.id}: truth_source "${s}" — file ${relPath} does not exist`);
          continue;
        }

        if (anchor) {
          const anchors = getHeadingAnchors(abs);
          if (!anchors.has(anchor)) {
            errors.push(`examples/evals/${evalFile} eval id=${c.id}: truth_source "${s}" — no heading in ${relPath} slugifies to "${anchor}" (known anchors: ${[...anchors].slice(0, 8).join(', ')}${anchors.size > 8 ? ', ...' : ''})`);
          }
          continue;
        }

        // Line-range bounds check intentionally removed: it measured file
        // shape (does line N exist), not skill quality (does this eval test
        // the skill's concepts well). When skill bodies are edited — the
        // normal mode for improving a skill — line ranges drift and the lint
        // fires false alarms unrelated to whether the truth source is real
        // or whether the eval is meaningful. The file-existence check above
        // (line ~613) still catches genuine dead citations.
      }
    }
  }
  return errors;
}

function isRemoteTruthSourcePath(value) {
  return /^https?:\/\//i.test(String(value));
}

function validateLocalTruthSourcePointer({ owner, source, relPath, lineRange, anchor }) {
  const errors = [];
  if (isRemoteTruthSourcePath(relPath)) {
    if (lineRange) errors.push(`${owner}: truth_sources ${source}: line_range is only supported for local file paths`);
    return errors;
  }

  const abs = resolveTruthSourcePath(relPath, REPO_ROOT, SKILL_ROOTS);
  if (!fs.existsSync(abs)) {
    errors.push(`${owner}: truth_sources ${source}: file ${relPath} does not exist`);
    return errors;
  }

  const text = fs.readFileSync(abs, 'utf8');
  const lines = text.split(/\r?\n/);
  if (lineRange) {
    const start = lineRange.start;
    const end = lineRange.end || start;
    if (!Number.isInteger(start) || start < 1) {
      errors.push(`${owner}: truth_sources ${source}: line_range.start must be an integer >= 1`);
    } else if (!Number.isInteger(end) || end < start) {
      errors.push(`${owner}: truth_sources ${source}: line_range.end must be an integer >= line_range.start`);
    } else if (end > lines.length) {
      errors.push(`${owner}: truth_sources ${source}: line_range.end ${end} out of range (${relPath} has ${lines.length} lines)`);
    }
  }
  if (anchor) {
    const anchors = getHeadingAnchors(abs);
    if (!anchors.has(anchor) && !text.includes(anchor)) {
      errors.push(`${owner}: truth_sources ${source}: anchor "${anchor}" is neither a heading slug nor literal text in ${relPath}`);
    }
  }
  return errors;
}

function checkGroundingTruthSources(fm) {
  const errors = [];
  const grounding = fm && fm.grounding;
  if (!grounding || !Array.isArray(grounding.truth_sources)) return errors;

  for (const raw of grounding.truth_sources) {
    if (typeof raw === 'string') {
      if (raw.trim().length === 0) {
        errors.push(`${fm.name}: grounding.truth_sources contains an empty string`);
        continue;
      }
      errors.push(...validateLocalTruthSourcePointer({
        owner: fm.name,
        source: JSON.stringify(raw),
        relPath: raw,
        lineRange: null,
        anchor: null,
      }));
      continue;
    }

    if (!raw || typeof raw !== 'object' || typeof raw.path !== 'string' || raw.path.trim().length === 0) {
      errors.push(`${fm.name}: grounding.truth_sources entries must be strings or objects with a non-empty path`);
      continue;
    }
    const lineRange = raw.line_range === undefined ? null : raw.line_range;
    const anchor = typeof raw.anchor === 'string' && raw.anchor.length > 0 ? raw.anchor : null;
    errors.push(...validateLocalTruthSourcePointer({
      owner: fm.name,
      source: JSON.stringify(raw),
      relPath: raw.path,
      lineRange,
      anchor,
    }));
  }

  return errors;
}

// H3: description sentence-count check.
//
// The routing contract in `docs/skill-metadata-protocol.md § Semantic layer discipline`
// caps descriptions at ≤3 sentences — descriptions longer than that drift from
// pure routing signal into scope-map restatement. Counts sentence terminators
// (`.`, `!`, `?`) followed by whitespace or end-of-string; ignores trailing
// punctuation. Warning severity because the "rule" is a style convention, not
// a contract failure.
function checkDescriptionLength(fm) {
  const warnings = [];
  const desc = fm && fm.description;
  if (typeof desc !== 'string' || desc.trim().length === 0) return warnings;

  // Split on sentence boundaries. A sentence terminator is one of . ! ? followed
  // by whitespace-or-end-of-string. Strip trailing terminator on the last segment.
  const parts = desc
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  const sentenceCount = parts.length;
  if (sentenceCount > 3) {
    warnings.push(`description: ${sentenceCount} sentences exceeds the ≤3 sentence routing-contract cap. Move scope detail into ## Coverage; keep description a pure "use when / covers / do NOT use" signal.`);
  }
  return warnings;
}

// v0.5.0: guard against `paths` that consist only of negation patterns.
// Such a list matches nothing (negations only subtract from prior includes).
// This is a dead-routing trap found during audit review.
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
// so the skill-metadata-template entry is part of the canonical sample. The parity check
// must use the same flags that were used to generate the sample, otherwise the
// skill count will always differ.
function checkGeneratorParity() {
  if (!fs.existsSync(SAMPLE_MANIFEST_PATH)) {
    return [];
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

function collectSkillFilesFromRoot(rootDir, depth = 0) {
  const files = [];
  if (!fs.existsSync(rootDir)) return files;
  // Recurse up to 3 levels deep (root → category → optional domain → skill).
  // Stops descending once a SKILL.md is found in a directory.
  if (depth > 3) return files;
  for (const name of fs.readdirSync(rootDir)) {
    if (name.startsWith('_') || name.startsWith('.')) continue;
    const entryPath = path.join(rootDir, name);
    if (!fs.statSync(entryPath).isDirectory()) continue;
    const skillMd = path.join(entryPath, 'SKILL.md');
    if (fs.existsSync(skillMd)) {
      files.push(skillMd);
    } else {
      // Not a skill folder — recurse into it as a category/domain container.
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

function main() {
  const args = process.argv.slice(2);
  const schema = loadSchema();
  const manifestSchema = loadManifestSchema();
  const files = collectSkillFiles(args);
  const skipGeneratorParity = args.includes('--skip-generator-parity');
  const relationHygiene = args.includes('--relation-hygiene');
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
  // generated mapping in docs/skill-metadata-protocol.md.
  //
  // Tier label legend (see SKILL_GRAPH.md):
  //   [T1]      Tier 1 — binding schema (schemas/)
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
  const hasSampleManifest = fs.existsSync(SAMPLE_MANIFEST_PATH);
  const sampleErrors = checkSampleManifest(manifestSchema);
  if (sampleErrors.length > 0) {
    console.error('FAIL [T5 sample] examples/skills.manifest.sample.json');
    for (const e of sampleErrors) console.error(`     - ${e}`);
  } else if (hasSampleManifest) {
    console.log('OK   [T5 sample] examples/skills.manifest.sample.json');
  } else {
    console.log('SKIP [T5 sample] examples/skills.manifest.sample.json (not present in workspace)');
  }

  // Generator parity: re-run the manifest generator and verify the output
  // matches examples/skills.manifest.sample.json (ignoring generated_at).
  // This ensures the sample is always kept in sync with the generator —
  // a hand-edited sample will fail this check. Skippable via --skip-generator-parity.
  let generatorParityErrors = [];
  if (!skipGeneratorParity) {
    if (!hasSampleManifest) {
      console.log('SKIP [T3↔T5]     examples/skills.manifest.sample.json (not present in workspace)');
    } else {
    generatorParityErrors = checkGeneratorParity();
    if (generatorParityErrors.length > 0) {
      console.error('FAIL [T3↔T5]     examples/skills.manifest.sample.json (generator parity)');
      for (const e of generatorParityErrors) console.error(`     - ${e}`);
    } else {
      console.log('OK   [T3↔T5]     examples/skills.manifest.sample.json (generator parity)');
    }
  }

  }

  // Build the known-skill set (names) + frontmatter map (for relation
  // semantic checks that need to look across sibling skills' relation blocks).
  const knownSkillNames = new Set();
  const knownFrontmatters = new Map();
  const knownFiles = new Set([...collectSkillFilesFromRoots(SKILL_ROOTS), ...files]);
  for (const skillMd of knownFiles) {
    if (fs.existsSync(skillMd)) {
      const fm = normalizeFrontmatter(parseFrontmatter(fs.readFileSync(skillMd, 'utf8')));
      if (fm && fm.name) {
        knownSkillNames.add(fm.name);
        knownFrontmatters.set(fm.name, fm);
      }
    }
  }

  // Truth-source range validator (D2): runs once over every eval file and
  // reports broken `truth_sources` references before any per-file work. The
  // result is a flat error list tied to a synthetic "[truth-sources]" label
  // in the summary so authors see it prominently even on mass runs.
  const truthSourceErrors = checkEvalTruthSourceRanges();
  if (truthSourceErrors.length > 0) {
    console.error('FAIL [T5 evals]  examples/evals/ (truth_source ranges)');
    for (const e of truthSourceErrors) console.error(`     - ${e}`);
  } else if (fs.existsSync(EVALS_DIR)) {
    console.log('OK   [T5 evals]  examples/evals/ (truth_source ranges)');
  } else {
    console.log('SKIP [T5 evals]  examples/evals/ (not present in workspace)');
  }

  let totalErrors = parityErrors.length + sampleErrors.length + generatorParityErrors.length + truthSourceErrors.length;
  let totalWarnings = 0;

  for (const file of files) {
    const relPath = path.relative(REPO_ROOT, file);
    const text = fs.readFileSync(file, 'utf8');
    const fm = normalizeFrontmatter(parseFrontmatter(text));
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
        help: 'Rename "domain_frame:" to "grounding:". See docs/manifest-field-mapping.md § Migration Note — v1 → v2.',
        noColor,
      });
    }
    if (fm.eval_status) {
      emitWarning(relPath, text, 'eval_status', '"eval_status" is deprecated — split into "eval_artifacts", "eval_state", and "routing_eval"', {
        help: 'See docs/manifest-field-mapping.md § Migration Note — v1 → v2.',
        noColor,
      });
    }
    if (fm.route_groups) {
      emitWarning(relPath, text, 'route_groups', '"route_groups" is deprecated — rename to "routing_bundles"', {
        help: 'Rename "route_groups:" to "routing_bundles:". Values are unchanged.',
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
      emitWarning(relPath, text, 'family', '"family" is deprecated in v3 — rename to "browse_category" before migrating to v4 "category"', {
        help: 'Run `node scripts/migrate-skill-v2-to-v3.js <skill>` to apply. See docs/manifest-field-mapping.md § Migration Note — v2 → v3.',
        noColor,
      });
    }
    // Migration warnings for v3 → v4 field changes.
    if (fm.browse_category) {
      emitWarning(relPath, text, 'browse_category', '"browse_category" is deprecated in v4 — rename to "category"', {
        help: 'Run `node scripts/migrate-skill-v3-to-v4.js <skill>` to apply.',
        noColor,
      });
    }
    if (fm.project_tags) {
      emitWarning(relPath, text, 'project_tags', '"project_tags" is deprecated in v4 — rename to "workspace_tags"', {
        help: 'Run `node scripts/migrate-skill-v3-to-v4.js <skill>` to apply.',
        noColor,
      });
    }
    if (fm.routing_groups) {
      emitWarning(relPath, text, 'routing_groups', '"routing_groups" is deprecated in v4 — rename to "routing_bundles"', {
        help: 'Run `node scripts/migrate-skill-v3-to-v4.js <skill>` to apply.',
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

    // Migration warnings for v3.0 → v3.1 predicate rename (SKOS alignment, ADR 0001 Decision #1).
    // `adjacent` remains valid through v3.x but will be removed in v4 in favor of `related`.
    //
    // Note: ADR 0006 reverted the parallel `boundary -> disjoint_with` rename. `boundary` stays
    // canonical for routing-layer asymmetric handoff; `disjoint_with` is a separate orthogonal
    // relation for formal OWL class-disjointness. No deprecation warning is emitted on
    // `boundary` because it is not deprecated.
    if (relationHygiene && fm.relations && typeof fm.relations === 'object') {
      if (Array.isArray(fm.relations.adjacent) && fm.relations.adjacent.length > 0) {
        emitWarning(relPath, text, 'adjacent', '"relations.adjacent" is deprecated in v3.1 — rename to "relations.related" (SKOS-aligned)', {
          help: 'See docs/adr/0001-predicate-set.md. Removal target: v4. Both names validate through v3.x.',
          noColor,
        });
      }
    }

    // Double-declaration detection across deprecated/preferred alias pairs (ADR 0001 Decision #1).
    // Authors who write the same target under both `adjacent` and `related` produce duplicate
    // entries in the manifest; lint nudges them to drop the deprecated entry.
    if (relationHygiene && fm.relations && typeof fm.relations === 'object') {
      const doubles = checkRelationDoubleDeclarations(fm);
      for (const w of doubles) {
        emitWarning(relPath, text, 'relations', w.message, {
          help: 'Drop the deprecated entry; the preferred name carries the same SKOS mapping.',
          noColor,
        });
      }
    }

    // ----------------------------------------------------------------
    // Collect errors from all per-file checks.
    // ----------------------------------------------------------------
    const evalResult = checkEvalCoherence(file, fm);
    const relationSemanticsResult = checkRelationSemantics(fm, knownFrontmatters);
    const rawErrors = [
      ...validateAgainstSchema(fm, schema),
      ...checkAliasParity(fm),
      ...checkParentDirMatchesName(file, fm),
      ...checkRelationTargets(fm, knownSkillNames),
      ...evalResult.errors,
      ...relationSemanticsResult.errors,
      ...checkGroundingTruthSources(fm),
      ...checkPathsNegation(fm),
    ];
    const rawWarnings = [
      ...evalResult.warnings,
      ...(relationHygiene ? relationSemanticsResult.warnings : []),
      ...checkDescriptionLength(fm),
    ];

    // Archetype-aware section check (check 10).
    const archetypeResult = checkArchetypeSections({ filePath: relPath, sourceText: text, fm });

    // Routing quality check (check 11).
    const routingResult = checkRoutingQuality({ filePath: relPath, sourceText: text, fm });

    // Routing-eval check (check 12). Only fires when routing_eval: present.
    const routingEvalResult = checkRoutingEval({ filePath: relPath, sourceText: text, fm });

    // Category-enum check (check 13). Enforces the 6-value canonical category set.
    const categoryEnumResult = checkCategoryEnum({ filePath: relPath, sourceText: text, fm });

    // Stability promotion gate (check 14). Warns when stability: stable is
    // declared without meeting all five promotion criteria. WARN level only —
    // never contributes to fileErrors.
    const stabilityPromotionResult = checkStabilityPromotion({ filePath: relPath, sourceText: text, fm });

    // Promote warnings to errors when --strict is active.
    const fileErrors = [
      ...rawErrors.map(msg => ({ msg, line: null, column: null, help: null })),
      ...archetypeResult.errors.map(e => ({ msg: e.message, line: e.line, column: e.column, help: e.help })),
      ...routingResult.errors.map(e => ({ msg: e.message, line: e.line, column: e.column, help: e.help })),
      ...routingEvalResult.errors.map(e => ({ msg: e.message, line: e.line, column: e.column, help: e.help })),
      ...categoryEnumResult.errors.map(e => ({ msg: e.message, line: e.line, column: e.column, help: e.help })),
      ...(strict ? [
        ...rawWarnings.map(msg => ({ msg: `[promoted from warn] ${msg}`, line: null, column: null, help: null })),
        ...archetypeResult.warnings.map(w => ({ msg: `[promoted from warn] ${w.message}`, line: w.line, column: w.column, help: w.help })),
        ...routingResult.warnings.map(w => ({ msg: `[promoted from warn] ${w.message}`, line: w.line, column: w.column, help: w.help })),
        ...stabilityPromotionResult.warnings.map(w => ({ msg: `[promoted from warn] ${w.message}`, line: w.line, column: w.column, help: w.help })),
      ] : []),
    ];

    const fileWarnings = strict ? [] : [
      ...rawWarnings.map(msg => ({ message: msg, line: null, column: null, help: null })),
      ...archetypeResult.warnings,
      ...routingResult.warnings,
      ...stabilityPromotionResult.warnings,
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
