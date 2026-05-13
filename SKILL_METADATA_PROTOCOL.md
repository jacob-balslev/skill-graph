# Skill Metadata Protocol

> **Version:** 1.0.0 (schema_version 3, Skill Graph 0.4.x)
> **Machine-readable schema:** `schemas/skill.v3.schema.json`
> **Detailed field reference:** `docs/field-reference.md`
> **Full semantics + design rationale:** `docs/skill-metadata-protocol.md`

This document is the top-level public contract for the Skill Metadata Protocol frontmatter format — the **normative spec**. It defines which fields are required, what each field means in operational terms, which fields are authored by humans vs computed by tooling, and how to migrate from older schema versions. Skill Graph is the library-level system that consumes this contract. The prose is terse and boundary-aware: every clause is a rule a consumer or author can verify against the schema and against `scripts/skill-lint.js`.

**Companion docs by genre.** This contract is the *what*. The *why* — design rationale, archetype semantics, OntoClean rigidity, the eval-health triple's orthogonality, the JSON-LD W3C mappings, and the philosophical posture behind the field choices — lives in [`docs/skill-metadata-protocol.md`](docs/skill-metadata-protocol.md). The two docs are coordinated and grow together: a normative rule that lacks a "why" is fragile; a "why" that lacks a normative rule is vapourware. If you are authoring a SKILL.md, you read this file. If you are deciding whether to add a field to the schema, you read both.

---

## Contents

1. [Overview](#overview)
2. [Required vs Optional Fields](#required-vs-optional-fields)
3. [Semantic Rules by Field Group](#semantic-rules-by-field-group)
   - [Identity](#identity)
   - [Classification](#classification)
   - [Health and Drift](#health-and-drift)
   - [Eval Health](#eval-health)
   - [Activation and Routing](#activation-and-routing)
   - [Relations](#relations)
   - [Grounding](#grounding)
   - [Portability and Standards](#portability-and-standards)
4. [Authored vs Generated Fields](#authored-vs-generated-fields)
5. [Migration Notes](#migration-notes)
6. [Design Constraints](#design-constraints)

---

## Overview

Every skill is a single `SKILL.md` file with a YAML frontmatter block. The frontmatter is validated by `skill-lint.js` against `schemas/skill.v3.schema.json`. The `generate-manifest.js` script reads frontmatter from all skill files and emits a single `skills.manifest.json`.

The contract has one runtime model: one `SKILL.md` per skill, one manifest, one lint pass. There is no closed/open split, no private control plane, and no enterprise-only fields.

---

## Required vs Optional Fields

### Required for all skills

All thirteen fields in this group are required. A skill missing any of them fails lint with an error.

| Field | Type | Purpose |
|---|---|---|
| `schema_version` | integer `3` | Signals the contract version. Must be `3` for all v3 skills. |
| `name` | string | Stable identifier. Used for routing and `relations.*` targets. |
| `description` | string (≥20 chars) | Routing contract — tells the router when to activate this skill. |
| `version` | semver string | Skill content version (e.g. `1.2.0`). Bumped by the author. |
| `type` | enum | One of: `capability`, `workflow`, `router`, `overlay`. |
| `browse_category` | string | Flat human browse bucket (e.g. `knowledge`, `engineering`, `quality`). |
| `scope` | enum | One of: `codebase`, `reference`, `portable`. |
| `owner` | string | Team, username, or tool that is responsible for keeping this skill current. |
| `freshness` | ISO date | Date the skill body was last reviewed or updated. |
| `drift_check` | object | Contains `last_verified` (ISO date) and optional `truth_source_hashes`. |
| `eval_artifacts` | enum | One of: `none`, `planned`, `present`. |
| `eval_state` | enum | One of: `unverified`, `passing`, `monitored`. |
| `routing_eval` | enum | One of: `absent`, `present`. |

### Conditionally required

These fields are required only when a specific condition is met. The first three are enforced by JSON-Schema `allOf` rules; the `keywords` rule is enforced by `scripts/skill-lint.js` (lint check R1) rather than the schema, since the schema cannot reason about routability intent.

| Field | Required when | Enforced by |
|---|---|---|
| `extends` | `type: overlay` | schema `allOf` |
| `grounding` | `scope: codebase` | schema `allOf` |
| `superseded_by` | `stability: deprecated` | schema `allOf` |
| `keywords` | `scope: codebase` OR `routing_groups` is set | `scripts/skill-lint.js` (lint check R1) |

### Optional (strongly recommended)

Not schema-required, but most useful skills include these:

```yaml
stability       # experimental | stable | frozen | deprecated
license         # SPDX identifier (e.g. MIT, Apache-2.0)
keywords        # string[] — semantic phrases for discovery
triggers        # string[] — exact match activation phrases
relations       # typed edges to sibling skills
```

### Optional (enrichment)

These improve portability, discoverability, and health tracking but are not required for a valid skill.

```yaml
urn             # globally unique URN — optional in v3, required in v4
category        # hierarchical browse path (e.g. "ecommerce/integrations/shopify")
paths           # glob[] — code surfaces this skill governs
examples        # string[] — positive activation prompts
anti_examples   # string[] — negative activation prompts (wrong-skill training)
project_tags    # string[] — project handles or semantic tags
routing_groups  # string[] — routing group memberships
portability     # { readiness, targets }
lifecycle       # { stale_after_days, review_cadence }
runtime_telemetry  # { feedback_source, metrics }
comprehension_state # absent | present
concept        # seven-field concept teaching block, required when comprehension_state: present
eval_last_run  # { at, status, runner?, model?, receipt?, receipt_hash? }
compatibility   # { runtimes, node, notes }
allowed-tools   # space-separated tool allowlist
```

---

## Semantic Rules by Field Group

### Identity

**`name`**
- Pattern: `^[a-z0-9][a-z0-9-/:]*$` — lowercase alphanumerics, hyphens, forward slashes, and colons.
- Must match the parent directory name when possible so Agent Skills export can use the directory as the canonical identifier.
- Other skills reference this skill using the `name` value in their `relations.*` arrays.

**`description`**
- The routing contract, not a summary. Write for the router, not for a human reader.
- Lead with a trigger clause: `"Use when…"` or `"Activates for…"`.
- Include an explicit negative boundary: `"Do NOT use for…"`.
- Maximum 3 sentences. The `## Coverage` section inside the body carries the full scope detail.

**`version`**
- Semver format: `x.y.z`. Bumped when the skill's instructional content changes.
- Independent of `schema_version` — the schema version signals the contract shape; the skill version signals the content revision.

**`owner`**
- A team handle, GitHub username, or tool name (e.g. `skill-bot`).
- Consumers use this to route review requests and alert on stale skills.

### Classification

**`type`**
- `capability` — a skill that describes knowledge or a repeatable technique.
- `workflow` — a skill that describes a step-by-step process or procedure.
- `router` — a skill that describes routing logic (which skill to activate for which query).
- `overlay` — a skill that specialises another skill. Must have `extends: <parent-skill-name>`. Non-overlay types must NOT have `extends`.

**`scope`**
- `codebase` — repo-specific; requires the `grounding` block so consumers know which files anchor the skill's claims.
- `reference` — general-purpose reference knowledge not tied to a specific codebase.
- `portable` — cross-repo knowledge, intended for distribution via `portability.targets`.

**`browse_category`**
- A flat string used for human browsing (e.g. sidebar navigation in a skill library UI).
- Renamed from `family` in v2; use `browse_category` in all v3 skills.
- For hierarchical taxonomy, use the optional `category` field with slash-delimited segments.

**`stability`**
- `experimental` — may change without notice; use with caution.
- `stable` — follows semver; breaking changes bump `schema_version` or `version`.
- `frozen` — no longer evolving; pinned for historical reference.
- `deprecated` — replaced by another skill; `superseded_by` is required when this value is set.

### Health and Drift

**`freshness`**
- ISO date of the last review or content update.
- Not computed; the author sets it. It is an authored claim, not a hash.

**`drift_check`**
- Object with `last_verified` (ISO date, required) and `truth_source_hashes` (optional).
- `last_verified`: when the skill was last verified against its truth sources.
- `truth_source_hashes`: a map of normalized truth-source key -> SHA-256 hex digest at the time of last verification. Keys are `path` for whole-file sources, `path#Lstart-Lend` for line ranges, and `path#anchor` for anchor-only sources. Computed by `node scripts/skill-graph-drift.js --record --apply <skill-dir>`. The drift sentinel (`skill-graph drift`) reports `DRIFT` when a live hash differs from the recorded hash, `BROKEN` when a truth source file is missing, `STALE` when today exceeds `last_verified + lifecycle.stale_after_days`, and `NO_BASELINE` when truth sources are declared but no hashes are recorded.

**`lifecycle`**
- Optional object: `{ stale_after_days, review_cadence }`.
- `stale_after_days`: integer days after `drift_check.last_verified` at which the skill is flagged stale. Integration skills that wrap external APIs typically need shorter windows (30–90 days) than pure concept skills (180+ days).
- `review_cadence`: one of `per-commit`, `weekly`, `quarterly`, `on-truth-source-change`.

### Eval Health

The three eval-health fields are orthogonal — they measure different dimensions.

**`eval_artifacts`** — Does an evaluation artifact exist?
- `none`: no evals defined.
- `planned`: evals are planned but not yet written.
- `present`: at least one eval file exists.

**`eval_state`** — What is the current evaluation result?
- `unverified`: evals exist but have not been run against a grader.
- `passing`: evals have been run and pass.
- `monitored`: evals are integrated into CI and are tracked.

**`routing_eval`** — Does a routing-specific eval exist?
- `absent`: no routing eval.
- `present`: a routing eval exists (typically `evals/routing.json` or similar).

**`comprehension_state`**
- Optional comprehension-grading axis.
- `absent` or omitted: no comprehension grading is declared.
- `present`: the skill has comprehension grading and must include `concept`.

**`concept`**
- Seven-field concept teaching block required when `comprehension_state: present`.
- Required sub-fields: `definition`, `mental_model`, `purpose`, `boundary`, `taxonomy`, `analogy`, `misconception`.
- Use it for universal subject comprehension; keep repo-specific procedure in the body.

**`eval_last_run`**
- Optional evidence receipt for the most recent eval run.
- Required sub-fields when present: `at` (ISO date-time) and `status` (`pass`, `fail`, or `mixed`).
- Optional sub-fields: `runner`, `model`, `receipt`, `receipt_hash`.
- Use this to support `eval_state: passing` or `eval_state: monitored` with a concrete scorecard, grader history, or CI receipt.

### Activation and Routing

**`keywords`**
- Semantic phrases used by fuzzy/embedding-based routers.
- Required when `routing_eval: present` — if you assert that routing evals pass, the skill must declare what it should activate on.

**`triggers`**
- Exact match strings. A router that supports exact triggers activates this skill when the user input exactly matches one of these strings.
- Complement `keywords` (semantic) and `examples` (full prompts).

**`paths`**
- Glob patterns identifying the code surfaces this skill governs.
- Patterns prefixed with `!` are negations (gitignore-style).
- A list consisting only of negations matches nothing and is rejected by lint.

**`examples`**
- Positive-class activation examples — realistic user prompts this skill SHOULD activate for.
- 2–5 entries recommended. Used as few-shot signal for embedding-based routers.

**`anti_examples`**
- Negative-class activation examples — realistic prompts that look related but a DIFFERENT skill should handle.
- Pair with `relations.disjoint_with` to name the skill that should activate instead.

**`project_tags`**
- Literal project handles or semantic tags identifying which projects this skill is relevant to.
- Absent means the skill is ambient (applies across all projects).
- A workspace config at `.skill-graph/config.json` can map literal project handles to semantic tag sets.

**`routing_groups`**
- String array of routing group memberships. Used by routers that dispatch to groups of skills rather than individual skills.

### Relations

The `relations` block contains typed edges to sibling skills. All targets are validated by lint — a broken target (skill that does not exist) is an error.

```yaml
relations:
  related:        # symmetric co-read relation (skos:related). v3.1 preferred name.
  boundary:       # routing-layer anti-ownership handoff (sg:disjointOwnership).
  disjoint_with:  # formal class-disjointness assertion (owl:disjointWith).
  verify_with:    # skills to co-load for verification (prov:wasInformedBy).
  depends_on:     # skills this skill requires operationally or conceptually.
  broader:        # this skill is a specialisation of the target skill (skos:broader).
  narrower:       # this skill is a generalisation of the target (skos:narrower).
```

**`related`** (preferred) / `adjacent` (deprecated alias)
- Symmetric associative relation. Use when two skills should be co-read because they cover the same surface from different angles.
- Maximum 5 entries recommended to avoid hub-and-spoke clutter.
- `adjacent` is a deprecated alias from v3.0. Use `related` in all new skills. Lint emits a warning on `adjacent`.

**`boundary`**
- Routing-layer anti-ownership handoff. Use to make explicit that this skill does NOT own the target concern and should hand near-miss prompts to another skill.
- Items may be bare skill names or `{ skill, reason }` objects. Reasons are strongly recommended.
- This is a Skill-Graph-specific routing predicate, not formal OWL class disjointness.

**`disjoint_with`**
- Formal class-disjointness assertion. Use only when the two skill concepts are genuinely disjoint in the ontology sense.
- Items may be bare skill names or `{ skill, reason }` objects.
- Do not use it as a replacement for routing-layer `boundary`.

**`verify_with`**
- Skills to co-load when verifying claims in this skill. Maps to `prov:wasInformedBy`.
- Keep to 1–3 high-signal verifiers.

**`depends_on`**
- Skills this skill requires. Items may be bare skill names or `{ skill, min_version }` objects for version-constrained dependencies.

**`broader` / `narrower`**
- Cross-skill generalisation/specialisation edges (SKOS). Use `broader` when this skill is a specialisation of another skill that is not its overlay parent. `narrower` is the inverse; tooling can infer it from other skills' `broader` edges.

### Grounding

Required when `scope: codebase`. Describes where the skill's claims are anchored in the codebase.

```yaml
grounding:
  domain_object: string         # What the skill is about (e.g. "Shopify order sync")
  grounding_mode: repo_specific | universal | hybrid
  truth_sources:                # Files whose content the skill depends on
    - path: src/path/to/file.ts
      line_range: { start: 10, end: 80 }
      note: "Primary implementation surface"
  failure_modes:                # What goes wrong when the skill is applied incorrectly
    - "Misapplied to a different integration"
  evidence_priority: repo_code_first | general_knowledge_first | equal
```

- `grounding_mode: repo_specific` — the skill's claims are only valid in this repo.
- `grounding_mode: universal` — the skill's claims are general and not repo-specific.
- `grounding_mode: hybrid` — some claims are repo-specific, some are general.
- `evidence_priority` — tells consumers how to resolve conflicts between the skill body and external knowledge.

`truth_sources` accepts legacy string entries for whole resources and object entries with `path`, optional `line_range`, optional `anchor`, and optional `note`. Object entries are preferred for repo-backed claims because the drift sentinel can hash the exact source slice.

### Portability and Standards

**`portability`**
- Declares the skill's export readiness.
- `readiness`: `declared` (intent only), `scripted` (a transform exists), or `verified` (the export has been tested).
- `targets`: array of export targets. Only `agent-skills` is valid today.

**`urn`**
- Optional in v3; required in v4.
- Format: `urn:skill:<repo-slug>:<skill-name>`. Example: `urn:skill:skill-graph:debugging`.
- The `<skill-name>` segment must equal the `name` field exactly.
- Consumers treat the URN as the stable identity across repos and federated registries.

**`license`**
- SPDX identifier (e.g. `MIT`, `Apache-2.0`).
- Strongly recommended for any skill intended for distribution.

**`compatibility`**
- Object: `{ runtimes?, node?, notes? }`.
- `runtimes`: array of target agent runtimes with optional version constraints (e.g. `claude-code>=2.0`).
- `node`: Node.js version constraint (e.g. `>=18`).
- `notes`: free-text notes, maximum 500 characters.

**`allowed-tools`**
- Space-separated string of tool names the skill is authorized to invoke.
- Inherited from the Agent Skills base standard.

---

## Authored vs Generated Fields

### Authored in `SKILL.md` (human-written)

All 36 canonical fields in the frontmatter are authored. No field is computed during the lint or manifest generation steps and written back into the source file, with one exception: `drift_check.truth_source_hashes` is computed and written by the drift sentinel when you run `skill-graph drift --record --apply`.

```
schema_version, name, urn, description, version, type, browse_category,
category, scope, owner, freshness, drift_check, eval_artifacts, eval_state,
routing_eval, comprehension_state, concept, eval_last_run, stability,
superseded_by, license, compatibility, allowed-tools, extends, triggers,
keywords, examples, anti_examples, paths, project_tags, routing_groups,
relations, grounding, portability, lifecycle, runtime_telemetry
```

### Generated in `skills.manifest.json` (tooling-computed)

The manifest generator (`scripts/generate-manifest.js`) reads the authored frontmatter and emits computed fields that do not exist in the source `SKILL.md`:

- `id` — derived from the skill's path relative to `skills/` (e.g. `task-execution`, or `<project>/design-review` in a multi-root workspace).
- `path` — relative path to the `SKILL.md` file.
- `summary` — aggregate counts (`total_skills`, `by_type`, `by_browse_category`, `by_scope`, `by_stability`).
- `generated_at` — ISO timestamp of when the manifest was generated.
- `activation` — compiled block merging `triggers`, `keywords`, `paths`, `examples`, and `anti_examples` from frontmatter.
- `health` — compiled block merging `eval_artifacts`, `eval_state`, `routing_eval`, `comprehension_state`, `eval_last_run`, `freshness`, and `drift_check`.

The manifest schema is at `schemas/manifest.schema.json`. For the complete authored-to-generated field rename map and loss policy, see `docs/manifest-field-mapping.md`.

### Normalized during manifest generation

Some legacy scope and type values are normalized by the manifest generator to the schema-valid enum. The normalization is deterministic and logged:

| Legacy value | Normalized to | Reason |
|---|---|---|
| `operational` (scope) | `codebase` | Operational = repo-specific |
| `overlay` (scope) | `portable` | Overlay skills are cross-repo |
| `generic` (scope) | `portable` | Generic = cross-repo applicable |
| `doctrine` (type) | `capability` | A doctrine skill is a capability |
| `domain` (type) | `capability` | Domain knowledge is a capability |
| `framework` (type) | `workflow` | Frameworks describe workflows |
| `feedback` (type) | `overlay` | Feedback modifies other skills |

---

## Migration Notes

### v2 → v3 (current)

Run the codemod to migrate in place: `node scripts/migrate-skill-v2-to-v3.js`

| What changed | v2 form | v3 form |
|---|---|---|
| `drift_check` shape | scalar ISO date string | object `{ last_verified, truth_source_hashes? }` |
| `compatibility` shape | free-text string | object `{ runtimes?, node?, notes? }` |
| `family` field name | `family: engineering` | `browse_category: engineering` |
| New optional fields | (none) | `category`, `project_tags`, `lifecycle`, `runtime_telemetry` |
| Relation predicate names | `adjacent` (canonical) | `related` (preferred); `adjacent` valid with lint warning, removal target v4. `boundary` stays canonical for routing-layer asymmetric handoff (per ADR 0006); `disjoint_with` is a separate orthogonal relation for formal OWL class-disjointness, not an alias for `boundary`. `broader` and `narrower` added in v3.1. |

Skills that remain on v2 forms will pass lint as warnings (not errors) during the v3 window. Warnings become errors in v4.

### v1 → v2 (historical)

| What changed | v1 form | v2 form |
|---|---|---|
| `scope` enum | `generic` → `portable`, `operational` → `codebase` | New enum values |
| Eval health | single `eval_status` field | Three orthogonal fields: `eval_artifacts`, `eval_state`, `routing_eval` |
| `portability` shape | `portability.level`, `portability.exports` | `portability.readiness`, `portability.targets` |
| Route groups | `route_groups` | `routing_groups` |

### v3.1 — preferred field-name aliases (additive)

v3.1 adds a set of optional aliases to the schema. Both the original and the alias names validate during v3.x; lint emits a warning when the legacy name is used. The aliases become canonical in v4 and the legacy names are removed there. No existing v3.0 skill is invalidated; authors who want to preview the v4 shape can switch incrementally.

| Legacy name (v3.0) | Preferred alias (v3.1 → v4) | Reason |
|---|---|---|
| `type` | `archetype` | The rationale doc, ADR 0003, and every body section already say "archetype"; the schema's `type` was sign-drift. Plus `type` is a generic-name anti-pattern. |
| `category` | `category_path` | Polysemy with `browse_category` — `category_path` signals slash-delimited hierarchy explicitly. |
| `freshness` | `reviewed_at` | "Freshness" is metaphorical; `reviewed_at` uses the project's own `_at` date-field convention. |
| `allowed-tools` | `allowed_tools` | Only kebab-case field in a snake_case schema. The export transform still writes the kebab-case form for Agent Skills consumers. |
| `eval_artifacts` + `eval_state` + `routing_eval` (top-level triple) | `eval: { artifacts, content_state, routing_coverage }` (nested object) | Aligns with the sibling-object pattern of `drift_check`, `grounding`, `lifecycle`, `portability`. Also resolves `routing_eval`'s head-first compound ambiguity by renaming to `routing_coverage`. |
| `grounding.domain_object` | `grounding.subject` | "domain_object" is DDD jargon; `subject` is the natural English word for what the skill is about. |
| `grounding.grounding_mode` | `grounding.claim_scope` | "mode" is generic; `claim_scope` names the actual semantic axis. |
| `compatibility.node` | `compatibility.node_version` | In a skill-graph repo, bare `node` reads as graph-node. |
| `compatibility.runtimes` | `compatibility.agent_runtimes` | Disambiguates from Node runtime, container runtime, etc. |
| `portability.targets` | `portability.export_targets` | Bare `targets` is generic; `export_targets` names the actual operation. |
| `drift_check.last_verified` | `drift_check.verified_at` | Follows the project's own `_at` convention for date fields. |

When both forms are present, the values must match. The manifest generator passes both through; consumers should prefer the v3.1 alias.

### Planned for v4

v4 is the next breaking-change horizon. No v4 changes are in scope for v3 skills today, but these are planned:

- `urn` becomes required (ADR 0004).
- `adjacent` is removed; use `related` instead. `boundary` remains canonical for routing-layer handoff (ADR 0006).
- `freshness` / `drift_check.last_verified` may consolidate (ADR 0005).
- All v3.1 aliases above become canonical; the legacy names are removed.

---

## Design Constraints

The v1 contract enforces the following invariants. Any change to the schema or tooling that violates these invariants is a breaking change requiring a `schema_version` bump.

1. **One file, one skill.** Each skill lives in one `SKILL.md`. No split-source format. No per-environment variants.
2. **One manifest.** All skills aggregate into one `skills.manifest.json`. No closed/open split manifest.
3. **No private-only fields.** Every field in the schema is part of the public contract. There are no fields reserved for specific organisations or runtime environments.
4. **No second runtime model.** The same frontmatter shape serves local development, CI, and federated registry export. Export to the Agent Skills base standard is a transform (`scripts/export-skill.js`), not a separate authoring format.
5. **Strict schema.** `additionalProperties: false` on both the skill and manifest schemas. Unknown fields fail lint rather than being silently ignored.
6. **Additive evolution only within a version.** New optional fields, new enum values that extend (not replace) an existing enum, and new lint warnings are non-breaking. Renamed fields, removed fields, retyped fields, tightened required-ness, and removed enum values require a `schema_version` bump.
7. **Migration tooling ships with every breaking change.** The v3 bump ships `scripts/migrate-skill-v2-to-v3.js`. Future bumps follow the same pattern.

---

*See `docs/skill-metadata-protocol.md` for full design rationale, overlay composition precedence, and schema versioning policy. See `docs/field-reference.md` for one section per field with examples. See `schemas/skill.v3.schema.json` for the machine-enforceable version of this contract.*
