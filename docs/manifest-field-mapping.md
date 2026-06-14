# Manifest Field Mapping

> **Scope.** This document is the authored-to-generated bridge for Skill Graph: it specifies how fields from `SKILL.md` frontmatter and the sibling `audit-state.json` sidecar project into the compiled `skills.manifest.json` that downstream tooling consumes.
>
> **Audience.** Authors of manifest generators and consumers of the manifest. If you are authoring a skill itself, read [`skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md`](../skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md) and [`skill-metadata-protocol/field-reference.md`](../skill-metadata-protocol/field-reference.md) instead. This document owns the transformation from authored to generated.
>
> **Authority.** `schemas/SKILL_METADATA_PROTOCOL_schema.json` is the authored schema. `schemas/manifest.schema.json` is the generated manifest schema. This document explains the mapping between them and may not contradict either schema.

## Related documents

- [`skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md`](../skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md) — normative public spec for the authored `SKILL.md` protocol.
- [`skill-metadata-protocol/field-reference.md`](../skill-metadata-protocol/field-reference.md) — per-field authoring reference.
- [`skill-metadata-protocol/design-rationale.md`](../skill-metadata-protocol/design-rationale.md) — rationale and deep explanation.
- [`schemas/SKILL_METADATA_PROTOCOL_schema.json`](../schemas/SKILL_METADATA_PROTOCOL_schema.json) — enforceable JSON Schema for authored frontmatter.
- [`schemas/skill-audit-state.schema.json`](../schemas/skill-audit-state.schema.json) — enforceable JSON Schema for the audit-state sidecar.
- [`schemas/manifest.schema.json`](../schemas/manifest.schema.json) — enforceable JSON Schema for the generated manifest.
- [`examples/skills.manifest.sample.json`](../examples/skills.manifest.sample.json) — sample manifest showing the generated shape for the current `skills/` library plus the template.

---

## Rename Map

> **Two-file source (ADR-0019).** Since the audit-state sidecar split, the manifest is compiled from **two** authored files joined together: `SKILL.md` frontmatter (`schemas/SKILL_METADATA_PROTOCOL_schema.json`) and the `audit-state.json` sidecar (`schemas/skill-audit-state.schema.json`). `generate-manifest.js` merges the sidecar under the frontmatter before projecting, so the manifest shape is unchanged. Where a row below says "Pass-through from authored frontmatter" for an audit/eval/provenance field (`schema_version`, `version`, `owner`, `urn`, `repo`, `freshness`, `drift_check`, the `eval_*` triple, the four verdicts, `comprehension_state`, `lifecycle`, `marketplace_tier`, `portability`, `runtime_telemetry`, `model_run_coverage`), read it as "pass-through from the joined authored source (now the sidecar)." Field placement: `benchmarks/field-relevance/field-placement.json`.

Every top-level authored field in `schemas/SKILL_METADATA_PROTOCOL_schema.json` (frontmatter) or `schemas/skill-audit-state.schema.json` (sidecar) has exactly one entry below. The entry declares one of five fates:

| Fate | Meaning |
|---|---|
| **copied through unchanged** | The field appears at the same top-level key in the manifest with the same shape. |
| **renamed but preserved** | The field appears in the manifest under a different key, with the same semantics. |
| **grouped under parent** | The field appears inside a manifest parent object (e.g. `health`, `activation`) rather than at the top level. |
| **dropped intentionally** | The field does not appear in the manifest. Loss policy explains why. |
| **generated only** | The manifest key is produced by the generator, not copied from authored frontmatter. |

### Authored and sidecar fields

| # | Authored field | Fate | Manifest projection |
|---|---|---|---|
| 1 | `schema_version` | copied through unchanged | Manifest-level `schema_version` at the root; also pass-through per-skill so consumers can filter by contract version. |
| 2 | `name` | copied through unchanged, with generated alias | Per-skill `name` plus generated `id`. |
| 3 | `urn` | copied through unchanged | Optional persistent identifier. |
| 4 | `description` | copied through unchanged | `description`. |
| 5 | `version` | copied through unchanged | `version`. |
| 6 | `subject` | copied through unchanged | v8 primary classification — closed 12-value enum. See `schemas/SKILL_METADATA_PROTOCOL_schema.json § subject`. |
| 7 | `subjects` | copied through unchanged | Optional polyhierarchy — ordered array (max 2), `subjects[0]` matches `subject`. |
| 8 | `taxonomy_domain` | copied through unchanged | Optional slash-delimited sub-path within a `subject` (e.g. `backend-engineering/integrations/shopify`). Renamed from `domain`. |
| 9 | `public` | copied through unchanged | Boolean publishability gate. Drives the marketplace-export filter. Project-fit is carried by `project[]` (row 34a). |
| 10 | `scope` | copied through unchanged | Required free-text PRD-style statement in `SKILL.md`. Not an enum. |
| 11 | `owner` | copied through unchanged | `owner`. |
| 12 | `freshness` | grouped under parent | `health.freshness`. |
| 13 | `reviewed_at` | grouped under parent | `health.reviewed_at`; optional review timestamp. |
| 14 | `drift_check` | grouped under parent | `health.drift_check`. |
| 15 | `eval_artifacts` | grouped under parent | `health.eval_artifacts`; manifest schema enforces `none` / `planned` / `present`. |
| 16 | `eval_state` | grouped under parent | `health.eval_state`; manifest schema enforces `unverified` / `passing` / `monitored`. |
| 17 | `routing_eval` | grouped under parent | `health.routing_eval`; manifest schema enforces `absent` / `present`. |
| 18 | `comprehension_state` | grouped under parent | `health.comprehension_state`. |
| 19 | Legacy `concept` | copied through unchanged when present | Compatibility projection for historical generated manifests only. Current authored `SKILL.md` files use the five flat Understanding fields (`mental_model`, `purpose`, `concept_boundary`, `analogy`, `misconception`), and `skill-lint.js` enforces those fields when sidecar `comprehension_state: present`. |
| 20 | `eval_last_run` | grouped under parent | `health.eval_last_run`; preserves nested `bidirectional` receipts from the audit-state sidecar. |
| 21 | `eval` | grouped under parent | `health.eval`; nested compatibility form for the Evaluation Status fields. |
| 22 | `stability` | copied through unchanged | `stability`. |
| 22a | `project_adoption_stage` | copied through unchanged | Project-local pattern lifecycle (`legacy`, `current-standard`, `experimental-migration`, `deprecated`). Distinct from document `stability`. |
| 23 | `superseded_by` | copied through unchanged | `superseded_by`. |
| 24 | `license` | copied through unchanged | `license`. |
| 25 | `compatibility` | copied through as canonical keys | `compatibility`; historical `runtimes` / `node` read aliases normalize to `agent_runtimes` / `node_version` before manifest emission. |
| 26 | `allowed-tools` | copied through unchanged | `allowed-tools`. |
| 27 | `allowed_tools` | copied through unchanged | `allowed_tools`; reader compatibility key. Current authored `SKILL.md` files use `allowed-tools`. |
| 29 | `triggers` | grouped under parent | `activation.triggers`. |
| 30 | `keywords` | grouped under parent | `activation.keywords`. |
| 31 | `examples` | grouped under parent | `activation.examples`. |
| 32 | `anti_examples` | grouped under parent | `activation.anti_examples`. |
| 33 | `paths` | grouped under parent | `activation.paths`. |
| 33b | `dependencies` | grouped under parent | `activation.dependencies` (added 2026-06-10 — codebase-fingerprint signal: packages a target repo must use for this skill to be relevant; distinct from `relations.depends_on` and `compatibility`). |
| 33c | `codebase_layer` | grouped under parent | `activation.codebase_layer` — architectural/system layer activation signal. |
| 33d | `applicable_tasks` | grouped under parent | `activation.applicable_tasks` — deterministic task-intent activation signal. |
| 33e | `environment` | grouped under parent | `activation.environment` — target environment/runtime activation signal. |
| 33f | `internal_tools` | grouped under parent | `activation.internal_tools` — team/private-tool activation signal, distinct from public package `dependencies`. |
| 34a | `project` | copied through unchanged | Belonging-entity references for project-anchored skills. Array of `{handle, role}`. Replaces `workspace_tags`. |
| 34b | `repo` | copied through unchanged | Repo-level belonging-entity references. Array of `{handle, url}`. |
| 36 | `relations` | copied through as canonical keys | `relations`. Historical `adjacent` / `boundary` read aliases normalize to `related` / `suppresses` before manifest emission. Includes the seven edge keys AND the optional non-edge `relations.io_contract` (`{inputs, outputs}` of abstract artifact-type tokens — SKI-52). The manifest copies `io_contract` through verbatim; the derived `depends_on` edges and broken-chain/cycle findings are NOT projected into the manifest — they are computed at graph-build time and surfaced under `io_composition` in `scripts/discovery/skill-graph.json` (the consumer-side graph), not in `skills.manifest.json`. |
| 37 | `grounding` | copied through unchanged | `grounding`. |
| 38 | `portability` | copied through unchanged | `portability`. |
| 39 | `lifecycle` | grouped under parent | `health.lifecycle`. |
| 40 | `runtime_telemetry` | grouped under parent | `health.runtime_telemetry`. |
| 40b | `model_run_coverage` | grouped under parent | `health.model_run_coverage`. Per-model audit-loop participation matrix; coverage evidence, not a quality verdict. |
| 41 | `last_audited` | grouped under parent | `health.last_audited`. Date the `audit` command last ran. Joined from `audit-state.json`. |
| 42 | `last_changed` | grouped under parent | `health.last_changed`. Date the SKILL.md content last changed. Joined from `audit-state.json`. |
| 43a | `structural_verdict` | grouped under parent | `health.structural_verdict`. Form-layer verdict from gates 1–2 and 7. Enum: `PASS`, `PASS_WITH_FIXES`, `FAIL`, `UNVERIFIED`. Joined from `audit-state.json`. |
| 43b | `truth_verdict` | grouped under parent | `health.truth_verdict`. Truth-layer verdict from gates 3–6. Enum: `PASS`, `DRIFT`, `BROKEN`, `UNVERIFIED`. Joined from `audit-state.json`. |
| 43c | `comprehension_verdict` | grouped under parent | `health.comprehension_verdict`. Concept-understanding verdict from gate 8. Enum: `PASS`, `SHALLOW`, `REDUNDANT`, `UNVERIFIED`, `PROVISIONAL`, `SKIPPED_BASELINE_HIGH`, `NA`. Joined from `audit-state.json`. |
| 43d | `application_verdict` | grouped under parent | `health.application_verdict`. Application-layer verdict from gate 9 and the primary quality signal. Enum: `APPLICABLE`, `PROVISIONAL`, `NOT_DISCRIMINATED_CEILING`, `EQUIVALENT_ON_FRONTIER`, `REDUNDANT`, `HARMFUL`, `MIXED`, `FALSE_POSITIVE`, `UNVERIFIED`. Joined from `audit-state.json`. |
| 43e | `audit_verdict` | grouped under parent | `health.audit_verdict`. Compatibility read key retained by the manifest schema; current skill packages use the four verdict fields above. |
| 44 | `eval_score` | grouped under parent | `health.eval_score`. Latest aggregate eval grade (0.0–5.0). Joined from `audit-state.json`. |
| 45 | `eval_failed_ids` | grouped under parent | `health.eval_failed_ids`. Eval IDs that failed in the most recent run. Joined from `audit-state.json`. |
| 46 | `lint_verdict` | grouped under parent | `health.lint_verdict`. Result of the most recent lint pass (`PASS`, `FAIL`, `UNKNOWN`). Joined from `audit-state.json`. |
| 47 | `drift_status` | grouped under parent | `health.drift_status`. Current truth-source drift status sentinel. Joined from `audit-state.json`. |
### Generated-only manifest fields

These fields exist in `skills.manifest.json` with no authored counterpart:

| Manifest field | Source |
|---|---|
| `generated_at` | Timestamp written by the manifest generator at compile time. |
| `skill_root` | **SKI-370.** The skill-library root, as a POSIX path relative to the stable manifest path base (the skill-graph repository root). Derived from the common ancestor of the resolved skill files (NOT the cwd-dependent discovery root), so it is cwd-invariant. Every `skills[].path` is anchored to the same base, making the whole manifest reproducible regardless of generation cwd. Optional/additive — a manifest generated before SKI-370 omits it; consumers fall back to origin-probing. Single skill-root today; multi-root will generalize to per-entry roots. |
| `workspace` | Echoed from `.skill-graph/config.json` when present — emits `skill_roots` and `projects` so consumers can resolve semantic tags without re-reading the config. New in v3. |
| `summary.total_skills` | Count of entries in `skills[]`. |
| `summary.by_subject`, `summary.by_public`, `summary.by_schema_version`, `summary.by_stability`, `summary.by_project` | Rollup counts derived from the corresponding authored fields across all skills. `by_project` is only present when workspace mode is active. |
| `skills[].id` | Stable identifier derived from `name`. Normalization rules live in the generator; `id` may be equal to `name` when no normalization is needed. |
| `skills[].path` | POSIX path to the source `SKILL.md` file, **anchored to a stable, cwd-independent base — the skill-graph repository root** (`packageRoot()`), NOT `process.cwd()` (SKI-370). This makes the value byte-identical whether the generator runs from `~/Development` or `~/Development/skill-graph`. Resolve a source file as `resolve(<skill-graph-root>, path)`; the `skill_root` header documents the library subtree under that same base. |
| `skills[].project` | Literal handle of the project root this skill was loaded from. Absent for skills loaded from a shared root without a project owner. New in v3. |
| `health.has_grounding` | Boolean flag — `true` when the authored frontmatter contains a `grounding` block, `false` otherwise. A convenience signal for consumers. |
| `health.has_relations` | Boolean flag — `true` when the authored frontmatter contains a non-empty `relations` block. |
| `health.drift_detected` | Boolean flag computed by the generator when `drift_check.truth_source_hashes` is present: `true` when any live truth source SHA-256 differs from the stored hash. Absent when no hashes are recorded. New in v3. |

---

## Loss Policy

**Current state:** no authored top-level fields are dropped during manifest generation. Every field in `schemas/SKILL_METADATA_PROTOCOL_schema.json` has a manifest projection in `schemas/manifest.schema.json`. This parity is enforced by `scripts/check-protocol-consistency.js` (C2 check) — CI fails if `manifest.schema.json` drops a field declared in the authored contract without a matching entry in this document's loss policy.

Audit/eval/provenance fields are joined from the sibling `audit-state.json` sidecar into `health.*` in the manifest. The manifest schema still exposes a small number of reader-compatibility keys so old manifests can be parsed, but current skill packages author the flat `SKILL.md` + sidecar contract described above.

### Previously dropped, now restored

Four Agent-Skills base-standard fields and one Skill Graph classification field were previously treated as authored-only and dropped during manifest generation. SH-5776 (commit `8791558`, 2026-04-17) restored all five to flow-through.

| Field | Prior fate | Reason for restoration |
|---|---|---|
| `license` | Dropped as "per-repo, not per-skill" | SKILL.md compatibility. Downstream runtimes that consume the manifest need the license metadata to decide whether they may execute a skill. Per-skill overrides are legitimate when a repo mixes skills under different licenses. |
| `compatibility` | Dropped as "belongs in a separate spec" | SKILL.md compatibility. The compatibility string declares runtime or environment requirements (e.g. `Markdown, YAML, JSON Schema` or `Python 3.11+`). Consumers route based on this. Without flow-through, consumers would have to re-parse the authored source. |
| `allowed-tools` | Dropped as "a runtime concern, not metadata" | SKILL.md compatibility. The base standard defines `allowed-tools` as a frontmatter field that sandboxes tool use. The manifest is the canonical feed for runtime consumers; stripping `allowed-tools` would force consumers back to the authored file, defeating the purpose of compiling a manifest. |
| `subject_matter` (inside `grounding`, previously named `domain_object`) | Dropped from the required-field set during an earlier schema tightening | Grounded skills anchor to a specific subject (e.g. "Shopify order reconciliation," "Skill authoring for the Skill Metadata Protocol frontmatter"). Consumers use `subject_matter` to decide whether a skill matches a task's subject. Dropping it left grounded skills ungrounded to consumers. SH-5776 restored it as a required sub-field; v8 renamed the sub-field from `domain_object` to `subject_matter`. |

### Current dropped-field list

| Field | Reason for drop | Recovery path (if ever needed) |
|---|---|---|
| *(none as of 2026-04-17)* | — | — |

If a future change drops a field, the drop must be documented in this section with three pieces of information: (1) why the field is dropped, (2) which tool or transform could reconstruct it if a consumer later needs it, and (3) the ticket or commit that authorized the drop. `scripts/check-protocol-consistency.js` checks that every field declared in `schemas/SKILL_METADATA_PROTOCOL_schema.json` either appears in `schemas/manifest.schema.json` or has a row in this table.

### Loss-policy parity rule

The contract between authored and generated schemas is intentionally symmetric:

- Every field in `schemas/SKILL_METADATA_PROTOCOL_schema.json` must either appear in `schemas/manifest.schema.json` or appear in the current dropped-field list above.
- Every field in `schemas/manifest.schema.json` must either have an authored source in the rename map above or be declared in "Generated-only manifest fields."
- `scripts/check-protocol-consistency.js` enforces both directions. CI fails if either side drifts.

This parity is what lets downstream consumers trust the manifest as the complete projection of the authored frontmatter. Without it, a consumer reading only the manifest would have to re-parse the authored source to recover dropped fields, defeating the entire point of compiling a manifest.

---

## Migration Policy

The manifest schema evolves independently of the authored skill schema. Both use semver but track different contracts.

### Version surfaces

Three versions coexist in a manifest ecosystem:

| Version | Lives in | Meaning |
|---|---|---|
| Authored skill `version` | Per-skill sidecar `version` field | Version of the skill's content (e.g. `1.2.0` means the skill has been iterated twice since its initial publish). |
| Authored skill schema version | Per-skill sidecar `schema_version` field | Version of the Skill Metadata Protocol contract the skill is audited against. The active value is `8`; the frontmatter schema and sidecar schema together define the contract. |
| Manifest schema version | Manifest root `schema_version` field | Version of the compiled manifest root contract. `scripts/generate-manifest.js` emits `4` today and `schemas/manifest.schema.json` intentionally validates that value with `schema_version.const: 4`; the manifest schema file itself is v7 because the field set has advanced additively through v5-v7 without forcing a root-version bump for consumers. |

### When to bump `schema_version`

The manifest `schema_version` follows semver on the consumer contract:

| Change type | Semver bump | Example |
|---|---|---|
| New optional field added to manifest | patch | Adding an optional `health.last_audit_run` timestamp. |
| Existing field becomes optional (was required) | minor | Relaxing `owner` to optional for skills without a declared owner. |
| Existing optional field becomes required | **major** | Requiring `portability` on every skill. |
| Field renamed or removed | **major** | Renaming `grounding` back to `domain_frame`, renaming `grounding_mode` back to `evaluation_mode`, or dropping `allowed-tools`. |
| Field shape changed (e.g. string → object) | **major** | Changing `allowed-tools` from a space-separated string to an array. |

A major bump of the manifest `schema_version` does not force a major bump of the authored `SKILL_METADATA_PROTOCOL_schema.json` — the two contracts evolve independently.

### How consumers handle version mismatches

Consumers that read `skills.manifest.json` should:

1. Read the root `schema_version` first.
2. If the version is higher than the consumer was built against, fall back to field-by-field introspection — new optional fields may be present that the consumer does not recognize, and unrecognized fields should be ignored rather than failing validation.
3. If the version is lower than the consumer was built against, the consumer may require a regeneration of the manifest against the newer schema. The generator is the source of truth for producing up-to-date manifests.
4. If a major version mismatch exists in either direction, the consumer should fail loudly rather than silently degrade — silent degradation masks schema drift.

### Migration path for major changes

When a major manifest schema change ships:

1. The new schema is published with its new `schema_version`.
2. The schema/protocol verification tools are updated to enforce the new contract.
3. A CHANGELOG entry and, when warranted, an ADR describe what changed and how consumers should adapt.
4. The prior contract remains recoverable from git history or a schema tag for consumers that need to audit the transition.

### Historical Migrations

This file documents the current authored-to-generated projection only. Historical migration detail lives in CHANGELOG entries, ADRs, and git history so this live mapping does not double as an old-contract manual.

---

## Worked Example

The `skill-metadata-template` starter (`examples/skill-metadata-template.md`) is the canonical worked example because it exercises the widest set of fields — it is the only starter that populates `grounding`, `license`, `compatibility`, `allowed-tools`, and `portability` together with activation, relations, and all governance fields.

### `SKILL.md` frontmatter (abridged to fields that transform)

```yaml
---
name: skill-metadata-template
description: "Authoring template for new Skill Metadata Protocol skills. ..."
subject: knowledge-organization
public: false
taxonomy_domain: skill-system/authoring
scope: "Covers authoring a new Skill Metadata Protocol SKILL.md from scratch; does not cover the audit loop or manifest generation."
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
  related: [documentation]
  suppresses:
    - skill: refactor
      reason: "refactor is behavior-preserving code modification, not skill authoring"
  verify_with: [documentation]
project:
  - handle: skill-graph
    role: source-of-truth
grounding:
  subject_matter: Skill authoring for the Skill Metadata Protocol frontmatter
  grounding_mode: repo_specific
  truth_sources:
    - skill-metadata-protocol/design-rationale.md
    - schemas/SKILL_METADATA_PROTOCOL_schema.json
  failure_modes:
    - placeholder_sludge
    - cargo_cult_meta_sections
  evidence_priority: repo_code_first
portability:
  readiness: scripted
  targets: [skill-md]
---
```

### `audit-state.json` sidecar (abridged to fields that transform)

```json
{
  "schema_version": 8,
  "version": "1.0.0",
  "owner": "maintainer",
  "freshness": "2026-04-17",
  "drift_check": {
    "last_verified": "2026-04-17"
  },
  "eval_artifacts": "planned",
  "eval_state": "unverified",
  "routing_eval": "absent",
  "comprehension_state": "present",
  "lifecycle": {
    "stale_after_days": 180,
    "review_cadence": "quarterly"
  }
}
```

### Manifest projection

```json
{
  "id": "skill-metadata-template",
  "path": "examples/skill-metadata-template.md",
  "name": "skill-metadata-template",
  "description": "Authoring template for new Skill Metadata Protocol skills. ...",
  "version": "1.0.0",
  "subject": "knowledge-organization",
  "public": false,
  "taxonomy_domain": "skill-system/authoring",
  "scope": "Covers authoring a new Skill Metadata Protocol SKILL.md from scratch; does not cover the audit loop or manifest generation.",
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
    "related": ["documentation"],
    "suppresses": [
      { "skill": "refactor", "reason": "refactor is behavior-preserving code modification, not skill authoring" }
    ],
    "verify_with": ["documentation"]
  },
  "project": [{ "handle": "skill-graph", "role": "source-of-truth" }],
  "grounding": {
    "subject_matter": "Skill authoring for the Skill Metadata Protocol frontmatter",
    "grounding_mode": "repo_specific",
    "truth_sources": [
      "skill-metadata-protocol/design-rationale.md",
      "schemas/SKILL_METADATA_PROTOCOL_schema.json"
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

- `name` → `id` **and** `name` — the generator writes both. `id` is the stable reference used by other manifest entries (e.g. `relations.related: ["documentation"]` refers to the `id` of another skill). `name` remains human-readable for display.
- `name` → `path` — the generator records the source file path; this is the only way a consumer can trace a manifest entry back to its authored source without re-scanning the repo.
- `description`, `subject`, `public`, `scope`, and `stability` come from `SKILL.md`; `version` and `owner` come from `audit-state.json`. The joined manifest entry preserves them at the top level. `subject` is enum-checked in the manifest (closed 12-value enum); `public` is type-checked (boolean); `scope` is free-text, passed through unchanged.
- `license`, `compatibility`, `allowed-tools` — base-standard optional fields. `license` and `allowed-tools` flow through at their authored keys; `compatibility` emits only canonical `agent_runtimes`, `node_version`, and `notes`.
- `triggers`, `keywords`, `paths`, `dependencies`, `codebase_layer`, `applicable_tasks`, `environment`, and `internal_tools` → `activation.*` — sibling authored fields are grouped under a single `activation` object. This matches the semantic: they are all activation signals. The grouping is a presentation choice, not a loss.
- `relations` → `relations` — copied through with the current sub-key set (`related`, `broader`, `narrower`, `suppresses`, `disjoint_with`, `verify_with`, `depends_on`). Same shape on both sides.
- `grounding` → `grounding` — copied through unchanged, including `grounding.subject_matter`, `grounding.grounding_mode`, `grounding.truth_sources`, `grounding.failure_modes`, and `grounding.evidence_priority`.
- `portability` → `portability` — copied through with `readiness` and `targets`.
- `freshness`, `drift_check`, `eval_artifacts`, `eval_state`, `routing_eval`, and `lifecycle` come from `audit-state.json` and project to `health.*`. `has_grounding` and `has_relations` are generated boolean flags that summarize presence of the corresponding authored blocks, so a consumer can filter on "grounded skills" without re-parsing the full `grounding` object.

### What is deliberately absent from the projection

There are two schema-version surfaces. The manifest root `schema_version` (currently `4`) tracks the compiled manifest contract. Each `skills[]` entry also carries the joined per-skill `schema_version` from `audit-state.json`, so consumers can distinguish manifest-shape versioning from the skill contract version that the audit loop verified.

---

## Verification

After a generator change or a schema change, verify:

- [ ] Every top-level field in `schemas/SKILL_METADATA_PROTOCOL_schema.json` appears in either the rename map above or the current dropped-field list.
- [ ] Every field in `schemas/manifest.schema.json` appears in either the rename map or the "Generated-only manifest fields" list.
- [ ] The worked example's JSON projection can be regenerated from its YAML frontmatter by applying only the transforms declared in the rename map.
- [ ] `node scripts/skill-lint.js examples/skill-metadata-template.md` exits 0 on the shipped template.
- [ ] `examples/skills.manifest.sample.json` still matches the projection rules when regenerated from the current `skills/` library plus the template.
