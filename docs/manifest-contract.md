# Manifest Contract

> **Scope.** This document is the authored-to-generated bridge for Skill Graph: it specifies exactly how every top-level field in a `SKILL.md` frontmatter block projects into the compiled `skills.manifest.json` that downstream tooling consumes.
>
> **Audience.** Authors of manifest generators and consumers of the manifest. If you are authoring a skill itself, read `docs/metadata-contract.md` instead — that document owns the field semantics. This document owns the transformation from authored to generated.
>
> **Authority.** `schemas/skill.schema.json` is the authored contract. `schemas/manifest.schema.json` is the generated contract. This document explains the mapping between them and may not contradict either schema.

## Related documents

- `docs/metadata-contract.md` — authoritative field semantics for the authored `SKILL.md` contract.
- `schemas/skill.schema.json` — enforceable JSON Schema for authored frontmatter.
- `schemas/manifest.schema.json` — enforceable JSON Schema for the generated manifest.
- `examples/skills.manifest.sample.json` — sample manifest showing the generated shape for the six shipped skills.

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

### Top-level authored fields (23 total)

| # | Authored field | Fate | Manifest projection |
|---|---|---|---|
| 1 | `schema_version` | **copied through unchanged** | Manifest-level `schema_version` at the root of `skills.manifest.json`; it is not a per-skill field. The authored per-skill `schema_version` and the manifest top-level `schema_version` are versioned independently — see Migration Policy. |
| 2 | `name` | **copied through unchanged**, with an additional generated alias | Manifest per-skill `name` (human-readable, identical to authored) plus a generated `id` derived from `name` for stable referencing. |
| 3 | `description` | copied through unchanged | `description` |
| 4 | `version` | copied through unchanged | `version` |
| 5 | `type` | copied through unchanged | `type` |
| 6 | `family` | copied through unchanged | `family` |
| 7 | `scope` | copied through unchanged | `scope` |
| 8 | `owner` | copied through unchanged | `owner` |
| 9 | `freshness` | **grouped under parent** (`health`) | `health.freshness` |
| 10 | `drift_check` | **grouped under parent** (`health`) | `health.drift_check` |
| 11 | `eval_status` | **grouped under parent** (`health`) | `health.eval_status` |
| 12 | `stability` | copied through unchanged (when present) | `stability` |
| 13 | `license` | copied through unchanged (when present) | `license` — Agent Skills base-standard field. Restored to flow-through on 2026-04-17 (SH-5776). |
| 14 | `compatibility` | copied through unchanged (when present) | `compatibility` — Agent Skills base-standard field. Restored to flow-through on 2026-04-17 (SH-5776). |
| 15 | `allowed-tools` | copied through unchanged (when present) | `allowed-tools` — Agent Skills base-standard field. Restored to flow-through on 2026-04-17 (SH-5776). |
| 16 | `extends` | copied through unchanged (when present) | `extends` |
| 17 | `triggers` | **grouped under parent** (`activation`) | `activation.triggers` |
| 18 | `keywords` | **grouped under parent** (`activation`) | `activation.keywords` |
| 19 | `paths` | **grouped under parent** (`activation`) | `activation.paths` |
| 20 | `route_groups` | copied through unchanged (when present) | `route_groups` — restored to flow-through on 2026-04-17 (SH-5776). |
| 21 | `relations` | copied through unchanged (when present) | `relations` — same shape, same sub-keys (`adjacent`, `boundary`, `verify_with`, `depends_on`). |
| 22 | `grounding` | **copied through unchanged** | `grounding` — same required-field set including `domain_object`, `grounding_mode`, `truth_sources`, `failure_modes`, `evidence_priority`. The authored field was renamed from `domain_frame` in schema_version 1 (SH-5779, 2026-04-16); the manifest projection has always used `grounding`. |
| 23 | `portability` | copied through unchanged (when present) | `portability` — same shape (`level`, `exports`). |

### Generated-only manifest fields

These fields exist in `skills.manifest.json` with no authored counterpart:

| Manifest field | Source |
|---|---|
| `generated_at` | Timestamp written by the manifest generator at compile time. |
| `summary.total_skills` | Count of entries in `skills[]`. |
| `summary.by_type`, `summary.by_family`, `summary.by_scope`, `summary.by_stability` | Rollup counts derived from the corresponding authored fields across all skills. |
| `skills[].id` | Stable identifier derived from `name`. Normalization rules live in the generator; `id` may be equal to `name` when no normalization is needed. |
| `skills[].path` | Repo-relative path to the source `SKILL.md` file, written by the generator when it reads the file. |
| `health.has_grounding` | Boolean flag — `true` when the authored frontmatter contains a `grounding` block, `false` otherwise. A convenience signal for consumers. |
| `health.has_relations` | Boolean flag — `true` when the authored frontmatter contains a non-empty `relations` block. |

---

## Loss Policy

**Current state (2026-04-17, post-SH-5776):** no authored top-level fields are dropped during manifest generation. Every field in `schemas/skill.schema.json` has a manifest projection in `schemas/manifest.schema.json`. This parity is enforced by `scripts/skill-lint.js` — CI fails if `manifest.schema.json` drops a field declared in the authored contract without a matching entry in this document's loss policy.

### Previously dropped, now restored

Four Agent-Skills base-standard fields and one Skill Graph classification field were previously treated as authored-only and dropped during manifest generation. SH-5776 (commit `8791558`, 2026-04-17) restored all five to flow-through.

| Field | Prior fate | Reason for restoration |
|---|---|---|
| `license` | Dropped as "per-repo, not per-skill" | Agent Skills compatibility. Downstream runtimes that consume the manifest need the license metadata to decide whether they may execute a skill. Per-skill overrides are legitimate when a repo mixes skills under different licenses. |
| `compatibility` | Dropped as "belongs in a separate spec" | Agent Skills compatibility. The compatibility string declares runtime or environment requirements (e.g. `Markdown, YAML, JSON Schema` or `Python 3.11+`). Consumers route based on this. Without flow-through, consumers would have to re-parse the authored source. |
| `allowed-tools` | Dropped as "a runtime concern, not metadata" | Agent Skills compatibility. The base standard defines `allowed-tools` as a frontmatter field that sandboxes tool use. The manifest is the canonical feed for runtime consumers; stripping `allowed-tools` would force consumers back to the authored file, defeating the purpose of compiling a manifest. |
| `route_groups` | Dropped as "superseded by `relations`" | Relations and route groups encode different semantics. `relations` declares per-skill adjacencies; `route_groups` declares a classification tag (e.g. `quality`, `security`) that a routing layer can use to pick a skill family. They are complementary, not overlapping, and the router layer needs both. |
| `domain_object` (inside `grounding`) | Dropped from the required-field set during an earlier schema tightening | Grounded skills anchor to a specific domain object (e.g. "Shopify order reconciliation," "Skill authoring for the Skill Graph frontmatter contract"). Consumers use `domain_object` to decide whether a skill matches a task's subject. Dropping it left grounded skills ungrounded to consumers. SH-5776 restored it as a required sub-field. |

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
| Authored schema version | Per-skill frontmatter `schema_version` field | Version of the `skill.schema.json` contract the skill was authored against. Currently `1` for all skills. |
| Manifest schema version | Manifest root `schema_version` field | Version of the `manifest.schema.json` contract the manifest was generated against. Currently `1`. |

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

The authored frontmatter field `domain_frame` has been renamed to `grounding`. Simultaneously, the sub-field `evaluation_mode` (inside the grounding block) has been renamed to `grounding_mode` — this sub-field describes the evidence source for a skill's claims (repo-specific, universal, or hybrid), not an execution mode, so the new name better expresses its intent. Both renames are at schema_version 1 — the `schema_version` integer is unchanged. The generated manifest projection has always used `grounding` as the key, so manifests generated before this change are unaffected at the manifest level; only the authored `SKILL.md` frontmatter format changed. Skills authored before this change that still use `domain_frame` will receive a deprecation warning from `scripts/skill-lint.js`. A future `schema_version: 2` will reject `domain_frame` with a hard lint error. Authors should rename `domain_frame:` → `grounding:` and `evaluation_mode:` → `grounding_mode:` in their skill frontmatter during the current release window. The generated `health.has_domain_frame` manifest flag has been renamed to `health.has_grounding` in the same change.

---

## Worked Example

The `skill-template` starter (`examples/skill-template.md`) is the canonical worked example because it exercises the widest set of fields — it is the only starter that populates `grounding`, `license`, `compatibility`, `allowed-tools`, and `portability` together with activation, relations, and all governance fields.

### Authored frontmatter (abridged to fields that transform)

```yaml
---
schema_version: 1
name: skill-template
description: "Authoring template for new Skill Graph skills. ..."
version: 1.0.0
type: capability
family: knowledge
scope: reference
owner: maintainer
freshness: "2026-04-16"
drift_check: "2026-04-16"
eval_status: pending
stability: stable
license: MIT
compatibility: "Markdown, YAML, JSON Schema"
allowed-tools: "Read Grep"
keywords:
  - skill authoring
  - skill template
triggers:
  - skill-template
paths:
  - examples/skill-template.md
  - skills/**/SKILL.md
relations:
  adjacent: [documentation]
  boundary: [refactor]
  verify_with: [documentation]
grounding:
  domain_object: Skill authoring for the Skill Graph frontmatter contract
  grounding_mode: repo_specific
  truth_sources:
    - docs/metadata-contract.md
    - schemas/skill.schema.json
  failure_modes:
    - placeholder_sludge
    - cargo_cult_meta_sections
  evidence_priority: repo_code_first
portability:
  level: high
  exports: [agent-skills, cursor, windsurf, copilot]
---
```

### Manifest projection

```json
{
  "id": "skill-template",
  "path": "examples/skill-template.md",
  "name": "skill-template",
  "description": "Authoring template for new Skill Graph skills. ...",
  "version": "1.0.0",
  "type": "capability",
  "family": "knowledge",
  "scope": "reference",
  "owner": "maintainer",
  "stability": "stable",
  "license": "MIT",
  "compatibility": "Markdown, YAML, JSON Schema",
  "allowed-tools": "Read Grep",
  "activation": {
    "triggers": ["skill-template"],
    "keywords": ["skill authoring", "skill template"],
    "paths": ["examples/skill-template.md", "skills/**/SKILL.md"]
  },
  "relations": {
    "adjacent": ["documentation"],
    "boundary": ["refactor"],
    "verify_with": ["documentation"]
  },
  "grounding": {
    "domain_object": "Skill authoring for the Skill Graph frontmatter contract",
    "grounding_mode": "repo_specific",
    "truth_sources": [
      "docs/metadata-contract.md",
      "schemas/skill.schema.json"
    ],
    "failure_modes": ["placeholder_sludge", "cargo_cult_meta_sections"],
    "evidence_priority": "repo_code_first"
  },
  "portability": {
    "level": "high",
    "exports": ["agent-skills", "cursor", "windsurf", "copilot"]
  },
  "health": {
    "eval_status": "pending",
    "freshness": "2026-04-16",
    "drift_check": "2026-04-16",
    "has_grounding": true,
    "has_relations": true
  }
}
```

### Annotated transformations

Each arrow corresponds to one row of the rename map.

- `name` → `id` **and** `name` — the generator writes both. `id` is the stable reference used by other manifest entries (e.g. `relations.adjacent: ["documentation"]` refers to the `id` of another skill). `name` remains human-readable for display.
- `name` → `path` — the generator records the source file path; this is the only way a consumer can trace a manifest entry back to its authored source without re-scanning the repo.
- `description`, `version`, `type`, `family`, `scope`, `owner`, `stability` — straight copies, same keys, same shape.
- `license`, `compatibility`, `allowed-tools` — straight copies (post-SH-5776). The three Agent Skills base-standard optional fields flow through unchanged; a consumer that only speaks Agent Skills sees them at the expected keys.
- `triggers`, `keywords`, `paths` → `activation.triggers`, `activation.keywords`, `activation.paths` — three sibling authored fields are grouped under a single `activation` object. This matches the semantic: they are all activation signals. The grouping is a presentation choice, not a loss.
- `relations` → `relations` — copied through with the full sub-key set (`adjacent`, `boundary`, `verify_with`, `depends_on`). Same shape on both sides.
- `grounding` → `grounding` — copied through unchanged. The authored field was renamed from `domain_frame` to `grounding` in SH-5779 (2026-04-16), aligning the authored field name with its long-standing manifest projection key. The internal sub-field `evaluation_mode` was renamed to `grounding_mode` in the same change — the field describes the evidence source, not the execution mode.
- `portability` → `portability` — copied through with the full sub-key set (`level`, `exports`).
- `freshness`, `drift_check`, `eval_status` → `health.freshness`, `health.drift_check`, `health.eval_status` — three sibling governance fields are grouped under a single `health` object. `has_grounding` and `has_relations` are generated boolean flags that summarize presence of the corresponding authored blocks, so a consumer can filter on "grounded skills" without re-parsing the full `grounding` object.

### What is deliberately absent from the projection

`schema_version` appears only at the manifest root (as `1`), not inside each skill entry — manifest-level schema versioning tracks the manifest contract, and per-skill `schema_version: 1` from the authored frontmatter is absorbed into that root value. If a future manifest supports multiple authored schema versions simultaneously, `skills[].schema_version` would become a flow-through field; today it is not, because every skill in a given manifest is bound to a single authored schema version by assumption.

---

## Verification

After a generator change or a schema change, verify:

- [ ] Every top-level field in `schemas/skill.schema.json` appears in either the rename map above or the current dropped-field list.
- [ ] Every field in `schemas/manifest.schema.json` appears in either the rename map or the "Generated-only manifest fields" list.
- [ ] The worked example's JSON projection can be regenerated from its YAML frontmatter by applying only the transforms declared in the rename map.
- [ ] `node scripts/skill-lint.js --include-template` exits 0 on the shipped template.
- [ ] `examples/skills.manifest.sample.json` still matches the projection rules when regenerated from the five starters plus the template.
