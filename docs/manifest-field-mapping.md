# Manifest Field Mapping

> **Scope.** This document is the authored-to-generated bridge for Skill Graph: it specifies exactly how every top-level field in a `SKILL.md` frontmatter block projects into the compiled `skills.manifest.json` that downstream tooling consumes.
>
> **Audience.** Authors of manifest generators and consumers of the manifest. If you are authoring a skill itself, read [`SKILL_METADATA_PROTOCOL.md`](https://github.com/jacob-balslev/skill-metadata-protocol) and [`docs/field-reference.md`](field-reference.md) instead. This document owns the transformation from authored to generated.
>
> **Authority.** `schemas/skill.schema.json` is the authored schema. `schemas/manifest.schema.json` is the generated manifest schema. This document explains the mapping between them and may not contradict either schema.

## Related documents

- [`SKILL_METADATA_PROTOCOL.md`](https://github.com/jacob-balslev/skill-metadata-protocol) — normative public spec for the authored `SKILL.md` protocol.
- [`docs/field-reference.md`](field-reference.md) — per-field authoring reference.
- [`docs/skill-metadata-protocol.md`](skill-metadata-protocol.md) — rationale and deep explanation.
- [`schemas/skill.schema.json`](../schemas/skill.schema.json) — enforceable JSON Schema for authored frontmatter.
- [`schemas/manifest.schema.json`](../schemas/manifest.schema.json) — enforceable JSON Schema for the generated manifest.
- [`examples/skills.manifest.sample.json`](../examples/skills.manifest.sample.json) — sample manifest showing the generated shape for the current `skills/` library plus the template.

---

## Rename Map

Every top-level authored field in `schemas/skill.schema.json` has exactly one entry below. The entry declares one of five fates:

| Fate | Meaning |
|---|---|
| **copied through unchanged** | The field appears at the same top-level key in the manifest with the same shape. |
| **renamed but preserved** | The field appears in the manifest under a different key, with the same semantics. |
| **grouped under parent** | The field appears inside a manifest parent object (e.g. `health`, `activation`) rather than at the top level. |
| **dropped intentionally** | The field does not appear in the manifest. Loss policy explains why. |
| **generated only** | The manifest key is produced by the generator, not copied from authored frontmatter. |

### Top-level authored fields (v4 canonical fields plus compatibility aliases)

| # | Authored field | Fate | Manifest projection |
|---|---|---|---|
| 1 | `schema_version` | copied through unchanged | Manifest-level `schema_version` at the root; not repeated per skill. |
| 2 | `name` | copied through unchanged, with generated alias | Per-skill `name` plus generated `id`. |
| 3 | `urn` | copied through unchanged | Optional persistent identifier. |
| 4 | `description` | copied through unchanged | `description`. |
| 5 | `version` | copied through unchanged | `version`. |
| 6 | `type` | copied through unchanged | `type`. |
| 7 | `archetype` | copied through unchanged | Compatibility alias for `type`; duplicate declarations must match. |
| 8 | `category` | copied through unchanged | Flat browse shelf. v4 rename of v3 `browse_category`. |
| 9 | `domain` | copied through unchanged | Optional slash-delimited domain path. v4 rename of v3 `category` / `category_path`. |
| 10 | `scope` | copied through unchanged | `scope`. |
| 11 | `owner` | copied through unchanged | `owner`. |
| 12 | `freshness` | grouped under parent | `health.freshness`. |
| 13 | `reviewed_at` | grouped under parent | `health.reviewed_at`; compatibility alias for `freshness`. |
| 14 | `drift_check` | grouped under parent | `health.drift_check`. |
| 15 | `eval_artifacts` | grouped under parent | `health.eval_artifacts`. |
| 16 | `eval_state` | grouped under parent | `health.eval_state`. |
| 17 | `routing_eval` | grouped under parent | `health.routing_eval`. |
| 18 | `comprehension_state` | grouped under parent | `health.comprehension_state`. |
| 19 | `concept` | copied through unchanged | `concept`; required when `comprehension_state: present`. |
| 20 | `eval_last_run` | grouped under parent | `health.eval_last_run`. |
| 21 | `eval` | grouped under parent | `health.eval`; nested compatibility form for the eval-health fields. |
| 22 | `stability` | copied through unchanged | `stability`. |
| 23 | `superseded_by` | copied through unchanged | `superseded_by`. |
| 24 | `license` | copied through unchanged | `license`. |
| 25 | `compatibility` | copied through unchanged | `compatibility`. |
| 26 | `allowed-tools` | copied through unchanged | `allowed-tools`. |
| 27 | `allowed_tools` | copied through unchanged | `allowed_tools`; compatibility alias for `allowed-tools`. |
| 28 | `extends` | copied through unchanged | `extends`. |
| 29 | `triggers` | grouped under parent | `activation.triggers`. |
| 30 | `keywords` | grouped under parent | `activation.keywords`. |
| 31 | `examples` | grouped under parent | `activation.examples`. |
| 32 | `anti_examples` | grouped under parent | `activation.anti_examples`. |
| 33 | `paths` | grouped under parent | `activation.paths`. |
| 34 | `workspace_tags` | copied through unchanged | Authored workspace/project relevance tags. v4 rename of v3 `project_tags`. |
| 35 | `routing_bundles` | copied through unchanged | Activation-bundle tags. v4 rename of v3 `routing_groups`. |
| 36 | `relations` | copied through unchanged | `relations`. |
| 37 | `grounding` | copied through unchanged | `grounding`. |
| 38 | `portability` | copied through unchanged | `portability`. |
| 39 | `lifecycle` | grouped under parent | `health.lifecycle`. |
| 40 | `runtime_telemetry` | grouped under parent | `health.runtime_telemetry`. |
| 41 | `last_audited` | grouped under parent | `health.last_audited`. v6 Health Block field — ISO date the `audit` command last ran. Pass-through from authored frontmatter. |
| 42 | `last_changed` | grouped under parent | `health.last_changed`. v6 Health Block field — ISO date the SKILL.md was last edited. Pass-through from authored frontmatter. |
| 43a | `structural_verdict` | grouped under parent | `health.structural_verdict`. **v7+** Health Block field — form-layer verdict from gates 1–2, 7. Enum: `PASS`, `PASS_WITH_FIXES`, `FAIL`, `UNVERIFIED`. Replaces the structural slice of v6 `audit_verdict`. Pass-through from authored frontmatter. |
| 43b | `truth_verdict` | grouped under parent | `health.truth_verdict`. **v7+** Health Block field — truth-layer verdict from gates 3–6. Enum: `PASS`, `DRIFT`, `BROKEN`, `UNVERIFIED`. Pass-through from authored frontmatter. |
| 43c | `comprehension_verdict` | grouped under parent | `health.comprehension_verdict`. **v7+** Health Block field — comprehension-layer verdict from gate 8 (demoted in v7). Enum: `PASS`, `SHALLOW`, `REDUNDANT`, `UNVERIFIED`, `SKIPPED_BASELINE_HIGH`, `NA`. Pass-through from authored frontmatter. |
| 43d | `application_verdict` | grouped under parent | `health.application_verdict`. **v7+** Health Block field — application-layer verdict from gate 9 (primary quality signal). Enum: `APPLICABLE`, `REDUNDANT`, `HARMFUL`, `MIXED`, `FALSE_POSITIVE`, `UNVERIFIED`. Pass-through from authored frontmatter. |
| 43e | `audit_verdict` *(deprecated in v7)* | grouped under parent | `health.audit_verdict`. v6 Health Block field — aggregate verdict (`PASS`, `PASS_WITH_FIXES`, `PARTIAL`, `FAIL`, `UNKNOWN`). DEPRECATED in v7; replaced by the four discrete verdicts above. Kept in the manifest schema for back-compat reads of unmigrated v6 manifests. See [ADR 0011](adr/0011-split-audit-verdict-into-four-verdicts.md). |
| 44 | `eval_score` | grouped under parent | `health.eval_score`. v6 Health Block field — latest aggregate eval grade (0.0–5.0). Pass-through from authored frontmatter. |
| 45 | `eval_failed_ids` | grouped under parent | `health.eval_failed_ids`. v6 Health Block field — eval IDs that failed in the most recent run. Pass-through from authored frontmatter. |
| 46 | `lint_verdict` | grouped under parent | `health.lint_verdict`. v6 Health Block field — result of the most recent lint pass (`PASS`, `FAIL`, `UNKNOWN`). Pass-through from authored frontmatter. |
| 47 | `drift_status` | grouped under parent | `health.drift_status`. v6 Health Block field — current truth-source drift status sentinel. Pass-through from authored frontmatter. |
### Generated-only manifest fields

These fields exist in `skills.manifest.json` with no authored counterpart:

| Manifest field | Source |
|---|---|
| `generated_at` | Timestamp written by the manifest generator at compile time. |
| `workspace` | Echoed from `.skill-graph/config.json` when present — emits `skill_roots` and `projects` so consumers can resolve semantic tags without re-reading the config. New in v3. |
| `summary.total_skills` | Count of entries in `skills[]`. |
| `summary.by_type`, `summary.by_category`, `summary.by_scope`, `summary.by_stability`, `summary.by_project` | Rollup counts derived from the corresponding authored fields across all skills. `by_category` replaces v2's `by_family`; `by_project` is new in v3 and only present when workspace mode is active. |
| `skills[].id` | Stable identifier derived from `name`. Normalization rules live in the generator; `id` may be equal to `name` when no normalization is needed. |
| `skills[].path` | Repo-relative path to the source `SKILL.md` file, written by the generator when it reads the file. |
| `skills[].project` | Literal handle of the project root this skill was loaded from. Absent for skills loaded from a shared root without a project owner. New in v3. |
| `health.has_grounding` | Boolean flag — `true` when the authored frontmatter contains a `grounding` block, `false` otherwise. A convenience signal for consumers. |
| `health.has_relations` | Boolean flag — `true` when the authored frontmatter contains a non-empty `relations` block. |
| `health.drift_detected` | Boolean flag computed by the generator when `drift_check.truth_source_hashes` is present: `true` when any live truth source SHA-256 differs from the stored hash. Absent when no hashes are recorded. New in v3. |

---

## Loss Policy

**Current state (2026-05-18, post-SH-6131):** no authored top-level fields are dropped during manifest generation. Every field in `schemas/skill.schema.json` has a manifest projection in `schemas/manifest.schema.json`. This parity is enforced by `scripts/check-protocol-consistency.js` (C2 check) — CI fails if `manifest.schema.json` drops a field declared in the authored contract without a matching entry in this document's loss policy.

The v6 Health Block fields (`last_audited`, `last_changed`, `audit_verdict`, `eval_score`, `eval_failed_ids`, `lint_verdict`, `drift_status`) were added to the authored schema in commit `ecaf001` (v6 Health Block addition) but were not registered in the manifest schema or this mapping document until SH-6131 (2026-05-18). They are now flow-through fields grouped under `health.*` in the manifest, matching the pattern of other governance fields (`freshness`, `drift_check`, `eval_artifacts`, etc.).

**v7 update (2026-05-19):** the single v6 `audit_verdict` is split into four discrete verdicts (`structural_verdict`, `truth_verdict`, `comprehension_verdict`, `application_verdict`). All four flow through `health.*` in the manifest. The legacy `health.audit_verdict` field is retained as optional for back-compat reads of unmigrated v6 manifests. See [ADR 0011](adr/0011-split-audit-verdict-into-four-verdicts.md) and [`migrations/v6-to-v7.md`](migrations/v6-to-v7.md).

### Previously dropped, now restored

Four Agent-Skills base-standard fields and one Skill Graph classification field were previously treated as authored-only and dropped during manifest generation. SH-5776 (commit `8791558`, 2026-04-17) restored all five to flow-through.

| Field | Prior fate | Reason for restoration |
|---|---|---|
| `license` | Dropped as "per-repo, not per-skill" | SKILL.md compatibility. Downstream runtimes that consume the manifest need the license metadata to decide whether they may execute a skill. Per-skill overrides are legitimate when a repo mixes skills under different licenses. |
| `compatibility` | Dropped as "belongs in a separate spec" | SKILL.md compatibility. The compatibility string declares runtime or environment requirements (e.g. `Markdown, YAML, JSON Schema` or `Python 3.11+`). Consumers route based on this. Without flow-through, consumers would have to re-parse the authored source. |
| `allowed-tools` | Dropped as "a runtime concern, not metadata" | SKILL.md compatibility. The base standard defines `allowed-tools` as a frontmatter field that sandboxes tool use. The manifest is the canonical feed for runtime consumers; stripping `allowed-tools` would force consumers back to the authored file, defeating the purpose of compiling a manifest. |
| `routing_bundles` (v1 name: `route_groups`) | Dropped as "superseded by `relations`" | Relations and routing groups encode different semantics. `relations` declares per-skill adjacencies; `routing_bundles` declares a classification tag (e.g. `quality`, `security`) that a routing layer can use to pick a skill family. They are complementary, not overlapping, and the router layer needs both. Field renamed to `routing_groups` in schema_version 2 (SH-5784), then to `routing_bundles` in schema_version 4. |
| `domain_object` (inside `grounding`) | Dropped from the required-field set during an earlier schema tightening | Grounded skills anchor to a specific domain object (e.g. "Shopify order reconciliation," "Skill authoring for the Skill Metadata Protocol frontmatter"). Consumers use `domain_object` to decide whether a skill matches a task's subject. Dropping it left grounded skills ungrounded to consumers. SH-5776 restored it as a required sub-field. |

### Current dropped-field list

| Field | Reason for drop | Recovery path (if ever needed) |
|---|---|---|
| *(none as of 2026-04-17)* | — | — |

If a future change drops a field, the drop must be documented in this section with three pieces of information: (1) why the field is dropped, (2) which tool or transform could reconstruct it if a consumer later needs it, and (3) the ticket or commit that authorized the drop. `scripts/skill-lint.js` checks that every field declared in `schemas/skill.schema.json` either appears in `schemas/manifest.schema.json` or has a row in this table.

### Loss-policy parity rule

The contract between authored and generated schemas is intentionally symmetric:

- Every field in `schemas/skill.schema.json` must either appear in `schemas/manifest.schema.json` or appear in the current dropped-field list above.
- Every field in `schemas/manifest.schema.json` must either have an authored source in the rename map above or be declared in "Generated-only manifest fields."
- `scripts/skill-lint.js` enforces both directions. CI fails if either side drifts.

This parity is what lets downstream consumers trust the manifest as the complete projection of the authored frontmatter. Without it, a consumer reading only the manifest would have to re-parse the authored source to recover dropped fields, defeating the entire point of compiling a manifest.

---

## Migration Policy

The manifest schema evolves independently of the authored skill schema. Both use semver but track different contracts.

### Version surfaces

Three versions coexist in a manifest ecosystem:

| Version | Lives in | Meaning |
|---|---|---|
| Authored skill `version` | Per-skill frontmatter `version` field | Version of the skill's content (e.g. `1.2.0` means the skill has been iterated twice since its initial publish). |
| Authored skill schema version | Per-skill frontmatter `schema_version` field | Version of the `skill.schema.json` contract the skill was authored against. The active value is `6` (skill schema, advanced through v5 to v6 marketplace fields). |
| Manifest schema version | Manifest root `schema_version` field | Version of the `manifest.schema.json` contract the manifest was generated against. `scripts/generate-manifest.js` emits `4` today, but the manifest schema contract itself has advanced to v6 (`schemas/manifest.v6.schema.json` adds Health Block fields such as `audit_verdict` alongside the skill-schema v5→v6 bump). The emitter has not yet been raised to v6; generated v4 manifests still validate because the v5/v6 schema changes were additive. |

### When to bump `schema_version`

The manifest `schema_version` follows semver on the consumer contract:

| Change type | Semver bump | Example |
|---|---|---|
| New optional field added to manifest | patch | Adding an optional `health.last_audit_run` timestamp. |
| Existing field becomes optional (was required) | minor | Relaxing `owner` to optional for skills without a declared owner. |
| Existing optional field becomes required | **major** | Requiring `portability` on every skill. |
| Field renamed or removed | **major** | Renaming `grounding` back to `domain_frame`, renaming `grounding_mode` back to `evaluation_mode`, or dropping `allowed-tools`. |
| Field shape changed (e.g. string → object) | **major** | Changing `allowed-tools` from a space-separated string to an array. |

A major bump of the manifest `schema_version` does not force a major bump of the authored `skill.schema.json` — the two contracts evolve independently.

### How consumers handle version mismatches

Consumers that read `skills.manifest.json` should:

1. Read the root `schema_version` first.
2. If the version is higher than the consumer was built against, fall back to field-by-field introspection — new optional fields may be present that the consumer does not recognize, and unrecognized fields should be ignored rather than failing validation.
3. If the version is lower than the consumer was built against, the consumer may require a regeneration of the manifest against the newer schema. The generator is the source of truth for producing up-to-date manifests.
4. If a major version mismatch exists in either direction, the consumer should fail loudly rather than silently degrade — silent degradation masks schema drift.

### Migration path for major changes

When a major manifest schema change ships:

1. The new schema is published with its new `schema_version`.
2. `scripts/skill-lint.js` is updated to enforce the new contract.
3. A migration note lands in this document under a dated heading describing what changed and how consumers should adapt.
4. The old schema file remains accessible by version for consumers pinning to the old contract during their migration window.

### Migration Note — `domain_frame` → `grounding` and `evaluation_mode` → `grounding_mode` (2026-04-16, SH-5779)

The authored frontmatter field `domain_frame` has been renamed to `grounding`. Simultaneously, the sub-field `evaluation_mode` (inside the grounding block) has been renamed to `grounding_mode` — this sub-field describes the evidence source for a skill's claims (repo-specific, universal, or hybrid), not an execution mode, so the new name better expresses its intent. Both renames shipped under schema_version 1. The generated manifest projection has always used `grounding` as the key, so manifests generated before this change are unaffected at the manifest level; only the authored `SKILL.md` frontmatter format changed. `domain_frame` is rejected as an unknown field under the v2 schema via `additionalProperties: false`; authors should rename `domain_frame:` → `grounding:` and `evaluation_mode:` → `grounding_mode:` in their skill frontmatter. The generated `health.has_domain_frame` manifest flag has been renamed to `health.has_grounding` in the same change.

### Migration Note — v1 → v2 (2026-04-17, SH-5784)

Schema_version 2 is a breaking bump. Four coordinated renames ship together. The v1 field names are hard errors under the v2 schema (the schema's `additionalProperties: false` rejects them), and the old `scope` enum values are not in the v2 enum. Authors must migrate all four changes in one pass.

**1. `eval_status` (single overloaded enum) split into three orthogonal fields.**

The v1 `eval_status` compressed three orthogonal concerns — artifact state, runtime state, and routing coverage — into a single ordinal. Each axis now has its own field.

| v1 `eval_status` | v2 `eval_artifacts` | v2 `eval_state` | v2 `routing_eval` |
|---|---|---|---|
| `none` | `none` | `unverified` | `absent` |
| `pending` | `planned` | `unverified` | `absent` |
| `evals` | `present` | `passing` | `absent` |
| `passing` | `present` | `passing` | `absent` |
| `active` | `present` | `monitored` | `absent` |
| `evals+trigger` | `present` | `passing` | `present` |

All three v2 fields are required. The lint script verifies that `eval_artifacts: present` is backed by a real artifact under `examples/evals/` (the v1 `eval_status: evals` check moved to this field).

**2. `portability.level` → `portability.readiness` and `portability.exports` → `portability.targets`.**

`level` was an ordinal rating (`high`/`medium`/`low`) with no operational meaning. `readiness` is an operational axis that says something concrete about what is true of the skill today.

| v1 `portability.level` | v2 `portability.readiness` |
|---|---|
| `high` | `scripted` (if an export script covers at least one target) else `declared` |
| `medium` | `scripted` (if an export script covers at least one target) else `declared` |
| `low` | `declared` |

`portability.exports` was renamed to `portability.targets`. Values are unchanged. New `readiness` enum: `declared` (metadata claim only), `scripted` (export tooling exists), `verified` (tooling exists AND output has been verified with a receipt).

**3. `scope` values renamed.**

| v1 `scope` | v2 `scope` | Intent |
|---|---|---|
| `generic` | `portable` | The skill works in any codebase |
| `operational` | `codebase` | The skill is grounded in *this* codebase |
| `reference` | `reference` (unchanged) | Documentation-style skill |

The v1 names (`generic`, `operational`) are rejected as out-of-enum by the v2 schema.

**4. `route_groups` -> `routing_groups`.**

The field name was misleading — it suggested URL routing. The semantics are unchanged: a classification tag (e.g. `quality`, `security`) a routing layer can consult to pick a skill family. `routing_groups` made the intent explicit in v2; v4 later renamed the field to `routing_bundles`.

**Consumer impact.** The manifest projection shape changed in lockstep. Consumers that pin to v1 must regenerate against v2 or fall back to field-by-field introspection. The three health fields (`eval_artifacts`, `eval_state`, `routing_eval`) all appear under `health.*` in the manifest, parallel to the v1 `health.eval_status`.

### Migration Note — v2 → v3 (v0.4.0)

Schema_version 3 is a breaking bump. Four coordinated shape changes and one rename ship together, plus four new optional fields. The v2 field names are hard errors under the v3 schema (the schema's `additionalProperties: false` rejects them) and the old scalar shapes are rejected by the type constraints. Authors must migrate in one pass via `node scripts/migrate-skill-v2-to-v3.js`.

**1. `family` -> `browse_category` (rename; values unchanged).**

The v2 name invited misuse as a routing signal. The v3 name makes the browse-taxonomy intent explicit. Routing batch-activation remains `routing_groups`; hierarchical placement is the new optional `category` field.

**2. `drift_check` shape: date string → object.**

| v2 | v3 |
|---|---|
| `drift_check: "2026-04-15"` | `drift_check:`<br>`  last_verified: "2026-04-15"` |
| (no evidence) | `  truth_source_hashes:`<br>`    "src/foo.ts": "c2a4...64-char-hex..."`<br>`    "src/foo.ts#L10-L40": "9d21...64-char-hex..."` |

The new `truth_source_hashes` map is optional but strongly recommended - it turns `drift_check` from a self-asserted date into evidence the drift sentinel (`scripts/skill-graph-drift.js`) verifies. Keys are normalized from `grounding.truth_sources`: `path`, `path#Lstart-Lend`, or `path#anchor`. Record hashes with `node scripts/skill-graph-drift.js --record --apply <skill-path>`.

**3. `compatibility` shape: free-text string → object.**

| v2 | v3 |
|---|---|
| `compatibility: "Node.js 18+, Git"` | `compatibility:`<br>`  notes: "Node.js 18+, Git"` |
| — | `compatibility:`<br>`  runtimes: [claude-code>=2.0]`<br>`  node: ">=18"` |

The codemod drops the v2 string into `notes` unchanged. Authors upgrade to `runtimes` / `node` manually when the structured form is more accurate.

**4. `relations.boundary` and `relations.depends_on` item shape: string → `string | object`.**

v3 adds an object-item form to both:

```yaml
relations:
  boundary:
    - skill: fulfillment
      reason: "fulfillment owns order state transitions"
  depends_on:
    - skill: api-key-management
      min_version: "1.2.0"
```

The bare-string form remains valid (`- fulfillment`). The object form is opt-in per item. Not a breaking change for authors who keep bare strings; consumers must handle both shapes.

**5. New optional fields:** `category`, `project_tags`, `lifecycle`, `runtime_telemetry`. None are required. Omit them on existing skills until the added metadata is real.

**6. Workspace mode (new):** the generator now reads `.skill-graph/config.json` at the repo root. When `workspace.skill_roots` is declared, the generator walks every root, stamps each skill entry with a `project` field, and emits a top-level `workspace` block in the manifest echoing the config. Single-root mode (default `skills/`) continues to work unchanged.

**Summary table.**

| v2 field | v3 field | Type change |
|---|---|---|
| `family: <value>` | `browse_category: <value>` | rename only |
| `drift_check: "2026-04-15"` | `drift_check: { last_verified: "2026-04-15" }` | scalar → object |
| `compatibility: "<text>"` | `compatibility: { notes: "<text>" }` | scalar → object |
| `relations.boundary: [str]` | `relations.boundary: [str | {skill, reason}]` | extended (back-compat) |
| `relations.depends_on: [str]` | `relations.depends_on: [str | {skill, min_version}]` | extended (back-compat) |

**Consumer impact.** The manifest projection shape changed in lockstep. `health.drift_check` is now always an object; `compatibility` is always an object; `browse_category` replaces `family` at every reference (including `summary.by_browse_category` vs v2's `summary.by_family`). Consumers pinned to v2 must regenerate against v3 or continue using `schemas/manifest.v2.schema.json`.

---

## Worked Example

The `skill-metadata-template` starter (`examples/skill-metadata-template.md`) is the canonical worked example because it exercises the widest set of fields — it is the only starter that populates `grounding`, `license`, `compatibility`, `allowed-tools`, and `portability` together with activation, relations, and all governance fields.

### Authored frontmatter (abridged to fields that transform)

```yaml
---
schema_version: 7
name: skill-metadata-template
description: "Authoring template for new Skill Metadata Protocol skills. ..."
version: 1.0.0
type: capability
category: knowledge
domain: skill-system/authoring
scope: reference
owner: maintainer
freshness: "2026-04-17"
drift_check:
  last_verified: "2026-04-17"
eval_artifacts: planned
eval_state: unverified
routing_eval: absent
stability: stable
license: MIT
compatibility:
  notes: Markdown, YAML, JSON Schema
allowed-tools: "Read Grep"
keywords:
  - skill authoring
  - skill template
triggers:
  - skill-metadata-template
paths:
  - examples/skill-metadata-template.md
  - skills/**/SKILL.md
relations:
  adjacent: [documentation]
  boundary:
    - skill: refactor
      reason: "refactor is behavior-preserving code modification, not skill authoring"
  verify_with: [documentation]
grounding:
  domain_object: Skill authoring for the Skill Metadata Protocol frontmatter
  grounding_mode: repo_specific
  truth_sources:
    - docs/skill-metadata-protocol.md
    - schemas/skill.schema.json
  failure_modes:
    - placeholder_sludge
    - cargo_cult_meta_sections
  evidence_priority: repo_code_first
portability:
  readiness: scripted
  targets: [skill-md]
lifecycle:
  stale_after_days: 180
  review_cadence: quarterly
---
```

### Manifest projection

```json
{
  "id": "skill-metadata-template",
  "path": "examples/skill-metadata-template.md",
  "name": "skill-metadata-template",
  "description": "Authoring template for new Skill Metadata Protocol skills. ...",
  "version": "1.0.0",
  "type": "capability",
  "category": "knowledge",
  "domain": "skill-system/authoring",
  "scope": "reference",
  "owner": "maintainer",
  "stability": "stable",
  "license": "MIT",
  "compatibility": { "notes": "Markdown, YAML, JSON Schema" },
  "allowed-tools": "Read Grep",
  "activation": {
    "triggers": ["skill-metadata-template"],
    "keywords": ["skill authoring", "skill template"],
    "paths": ["examples/skill-metadata-template.md", "skills/**/SKILL.md"]
  },
  "relations": {
    "adjacent": ["documentation"],
    "boundary": [
      { "skill": "refactor", "reason": "refactor is behavior-preserving code modification, not skill authoring" }
    ],
    "verify_with": ["documentation"]
  },
  "grounding": {
    "domain_object": "Skill authoring for the Skill Metadata Protocol frontmatter",
    "grounding_mode": "repo_specific",
    "truth_sources": [
      "docs/skill-metadata-protocol.md",
      "schemas/skill.schema.json"
    ],
    "failure_modes": ["placeholder_sludge", "cargo_cult_meta_sections"],
    "evidence_priority": "repo_code_first"
  },
  "portability": {
    "readiness": "scripted",
    "targets": ["skill-md"]
  },
  "health": {
    "eval_artifacts": "planned",
    "eval_state": "unverified",
    "routing_eval": "absent",
    "freshness": "2026-04-17",
    "drift_check": { "last_verified": "2026-04-17" },
    "lifecycle": { "stale_after_days": 180, "review_cadence": "quarterly" },
    "has_grounding": true,
    "has_relations": true
  }
}
```

### Annotated transformations

Each arrow corresponds to one row of the rename map.

- `name` → `id` **and** `name` — the generator writes both. `id` is the stable reference used by other manifest entries (e.g. `relations.adjacent: ["documentation"]` refers to the `id` of another skill). `name` remains human-readable for display.
- `name` → `path` — the generator records the source file path; this is the only way a consumer can trace a manifest entry back to its authored source without re-scanning the repo.
- `description`, `version`, `type`, `category`, `scope`, `owner`, `stability` — straight copies, same keys, same shape. (v2 `family` was renamed to `browse_category` in v3, then to `category` in v4 — see § Migration Note — v2 → v3.)
- `license`, `compatibility`, `allowed-tools` — straight copies (post-SH-5776). The three SKILL.md base-standard optional fields flow through unchanged; a consumer that only speaks SKILL.md sees them at the expected keys.
- `triggers`, `keywords`, `paths` → `activation.triggers`, `activation.keywords`, `activation.paths` — three sibling authored fields are grouped under a single `activation` object. This matches the semantic: they are all activation signals. The grouping is a presentation choice, not a loss.
- `relations` → `relations` — copied through with the full sub-key set (`adjacent`, `related`, `broader`, `narrower`, `boundary`, `disjoint_with`, `verify_with`, `depends_on`). Same shape on both sides.
- `grounding` → `grounding` — copied through unchanged. The authored field was renamed from `domain_frame` to `grounding` in SH-5779 (2026-04-16), aligning the authored field name with its long-standing manifest projection key. The internal sub-field `evaluation_mode` was renamed to `grounding_mode` in the same change — the field describes the evidence source, not the execution mode.
- `portability` → `portability` — copied through with the v2 sub-key set (`readiness`, `targets`). Renamed from v1 (`level`, `exports`) in SH-5784.
- `freshness`, `drift_check`, `eval_artifacts`, `eval_state`, `routing_eval` → `health.freshness`, `health.drift_check`, `health.eval_artifacts`, `health.eval_state`, `health.routing_eval` — five sibling governance fields are grouped under a single `health` object. The three eval-health fields replaced the v1 `health.eval_status` in SH-5784. `has_grounding` and `has_relations` are generated boolean flags that summarize presence of the corresponding authored blocks, so a consumer can filter on "grounded skills" without re-parsing the full `grounding` object.

### What is deliberately absent from the projection

`schema_version` appears only at the manifest root (as `4` in the current manifest), not inside each skill entry — manifest-level schema versioning tracks the manifest contract, and per-skill `schema_version` from the authored frontmatter is absorbed into that root value. If a future manifest supports multiple authored schema versions simultaneously, `skills[].schema_version` would become a flow-through field; today it is not, because every skill in a given manifest is bound to a single authored schema version by assumption.

---

## Verification

After a generator change or a schema change, verify:

- [ ] Every top-level field in `schemas/skill.schema.json` appears in either the rename map above or the current dropped-field list.
- [ ] Every field in `schemas/manifest.schema.json` appears in either the rename map or the "Generated-only manifest fields" list.
- [ ] The worked example's JSON projection can be regenerated from its YAML frontmatter by applying only the transforms declared in the rename map.
- [ ] `node scripts/skill-lint.js --include-template` exits 0 on the shipped template.
- [ ] `examples/skills.manifest.sample.json` still matches the projection rules when regenerated from the current `skills/` library plus the template.
