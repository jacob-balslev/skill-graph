# Skill Graph Metadata Contract

## Related Documents

| Document | Purpose |
|---|---|
| `docs/metadata-contract.md` (this file) | Overview, archetype map, requiredness groups, schema strictness rules |
| `docs/field-reference.md` | One section per authored field — purpose, rules, examples, when to use |
| `docs/field-decision-guide.md` | Decision tables for `scope`, `relations.*`, and the eval-health fields (`eval_artifacts`, `eval_state`, `routing_eval`) / `portability` |
| `docs/manifest-contract.md` | Authored-to-generated bridge: rename map, loss policy, worked example |

## Design Principles

This contract is the public source of truth for the Skill Graph frontmatter format.

It:
- keeps a flat author-facing frontmatter format
- keeps one `SKILL.md` file per skill
- keeps one generated manifest downstream
- tightens field semantics
- adds a small number of high-value fields beyond the Agent Skills base
- stays additive to the Agent Skills standard so every Skill Graph skill can be transformed back to the base shape

## Relationship to the Agent Skills Standard

Skill Graph is a graph-aware superset of the [Agent Skills](https://agentskills.io/specification) open standard. The base standard requires two frontmatter fields (`name` and `description`) and defines four optional fields (`license`, `compatibility`, `metadata`, `allowed-tools`). Skill Graph keeps the two required base fields and three of the four optional base fields (`license`, `compatibility`, `allowed-tools`) as top-level Skill Graph fields. It does not use the base `metadata` field; Skill Graph promotes its own extensions to additional named top-level fields instead.

| Field | Source | Skill Graph treatment |
|---|---|---|
| `name` | Agent Skills required | Kept as required; Skill Graph tightens the character pattern |
| `description` | Agent Skills required | Kept as required; scoped to routing |
| `license` | Agent Skills optional | Kept top-level; strongly recommended for shared skills |
| `compatibility` | Agent Skills optional | Kept top-level; optional |
| `allowed-tools` | Agent Skills optional | Kept top-level as a space-separated string |
| `metadata` | Agent Skills optional | Not used at the top level; Skill Graph promotes extensions to named fields |
| `schema_version`, `version`, `type`, `family`, `scope`, `owner`, `freshness`, `drift_check`, `eval_artifacts`, `eval_state`, `routing_eval` | Skill Graph extension | Required for Skill Graph; additive to the base |
| `relations`, `grounding`, `portability`, `triggers`, `keywords`, `paths`, `routing_groups`, `extends`, `stability` | Skill Graph extension | Optional in Skill Graph; additive to the base |

A Skill Graph `SKILL.md` is **not** a valid Agent Skills file as authored, because Skill Graph requires fields the base standard does not define. An export transform can produce an Agent-Skills-valid file by moving every Skill Graph extension field under the standard `metadata:` key. The transform is implemented as `scripts/export-skill.js`.

## Archetype Section Map

Each skill archetype expects a specific set of body H2 sections. These are the minimum required sections per archetype. Additional sections are allowed when they earn their line count.

| Archetype | Required H2 sections |
|---|---|
| `capability` | `## Coverage`, `## Philosophy`, `## Verification`, `## Do NOT Use When` |
| `workflow` | `## Coverage`, `## Philosophy`, `## Workflow`, `## Verification`, `## Do NOT Use When` |
| `router` | `## Coverage`, `## Routing Rules`, `## Do NOT Use When` |
| `overlay` | `## Coverage`, `## Overlay Rules`, `## Extends` (name of the base skill), `## Do NOT Use When` |

`## Key Files` is recommended for skills that reference concrete repo files. `## References` is recommended for skills that point at external reading.

## Requiredness Groups

These groups are documentation categories only. They do not require nested YAML.

### Required for all skills

```yaml
schema_version
name
description
version
type
family
scope
owner
freshness
drift_check
eval_artifacts
eval_state
routing_eval
```

### Strongly recommended

Not schema-required, but most useful skills include these:

```yaml
stability
license
relations
keywords
triggers
```

### Required for specific skill classes

| Condition | Required field(s) |
|---|---|
| `type: overlay` | `extends` |
| `scope: codebase` | `grounding` (schema-enforced) |
| Routable skills (label or language activation) | `keywords`; `triggers` and `paths` when routing explicitly depends on them |

### Optional enrichments

These improve portability or discoverability, but are not required for a valid v1 skill.

```yaml
paths
compatibility
allowed-tools
routing_groups
portability
```

## Template and Teaching Layer Discipline

### Semantic layer discipline

Two fields look similar but serve opposite layers — sibling levels of progressive disclosure, not duplicates:

| Element | Layer | Purpose | Length |
|---|---|---|---|
| `description:` (frontmatter) | **Routing contract** | Tells the router "should this skill activate?" | ≤ 3 sentences |
| `## Coverage` (body section) | **Scope map** | Tells the reader, once the skill is loaded, what topics the skill covers | Bulleted topic list, ≥ 4 items for non-trivial skills |

If `description:` is bloated with scope detail, it will conflict with `## Coverage`. If `## Coverage` restates the description in one line, it has collapsed into the routing layer. Restore each to its proper layer when this happens.

### Teaching layer delivery mechanisms

Meta-commentary aimed at the template reader must never live in an H2 header slot. AI agents adapting a template copy its H2 structure verbatim. That means meta sections like `## How To Read This Template` get cargo-culted into every new skill. The correct delivery mechanisms are:

- **`> **TEMPLATE NOTE:**` blockquotes** for body-level meta guidance (structurally distinct from H2 headers)
- **`# TEMPLATE NOTE:` inline YAML comments** for field-level meta guidance (disappears when an author tightens their frontmatter)
- **Never** put meta-commentary in an H2/H3 section header

### When adapting the example template

1. Restore `description:` to routing-only if it has drifted into scope description.
2. Keep the H2 structure that matches the skill archetype (see **Archetype section map** above).
3. Replace example values only with equally real, context-correct values.
4. Remove sections that are conditionally irrelevant rather than keeping them with fake content.
5. Leave `> **TEMPLATE NOTE:**` blockquotes and `# TEMPLATE NOTE:` YAML comments out of the new skill — they are authoring scaffolding, not skill content.

## Schema Strictness

The v1 OSS schemas are intentionally strict.

- Unknown top-level fields fail validation rather than being silently accepted.
- Field names must not rely on undocumented aliases.
- New public fields must be added by updating both the docs and the schemas.
- If you touched `docs/metadata-contract.md` or `schemas/skill.schema.json`, also update the other side so they remain in lockstep. The metadata contract is the source of truth for semantics; the schema is the source of truth for machine enforcement. Drift between them is a bug.

## Relationship to Audit Tooling

This contract is designed to work with:

1. `docs/single-skill-audit-checklist.md`
2. `docs/library-audit-workflow.md`

The metadata must support three things cleanly:

- activation
- relation-aware retrieval
- deterministic auditing

## Non-Goals

This contract does not introduce:
- open-core vs closed-core runtime layers
- nested metadata requirements for authoring
- enterprise-only fields
- a second skill format
- a marketplace-specific packaging system

It also does not require a full private control plane. The OSS contract keeps only the metadata needed for a portable, graph-aware, lintable system.

## Authored vs Generated Fields

### Authored in `SKILL.md`

The 25 authored fields (in schema order): `schema_version`, `name`, `description`, `version`, `type`, `family`, `scope`, `owner`, `freshness`, `drift_check`, `eval_artifacts`, `eval_state`, `routing_eval`, `stability`, `license`, `compatibility`, `allowed-tools`, `extends`, `triggers`, `keywords`, `paths`, `routing_groups`, `relations`, `grounding`, `portability`.

For the purpose, rules, and examples for each field, see `docs/field-reference.md`.

### Generated in `skills.manifest.json`

- normalized category rollups
- health flags
- eval counts
- missing coverage flags
- mirror status
- compiled activation tables
- generated docs ownership

See `docs/manifest-contract.md` for the full rename map, loss policy, migration policy, and a worked example showing the authored-to-generated projection field by field.

## Schema Versioning Policy

Skill Graph uses a single integer `schema_version` to signal contract evolution. Current version: **2** (bumped from 1 in SH-5784). The policy five policy points together define when `schema_version` bumps, what consumers should expect, and where migration tooling lives:

1. **Breaking changes bump `schema_version`.** Renamed fields, removed fields, retyped fields, removed enum values, or tightened required-ness constraints bump the integer. Consumers must migrate or pin.
2. **Additive changes do not bump.** New optional fields, new enum values that extend (not replace) an enum, and new checks in `scripts/skill-lint.js` that only affect warnings do not bump the version. Consumers on the prior minor release continue to pass.
3. **Validate against the matching schema.** `schemas/skill.schema.json` and `schemas/manifest.schema.json` track the latest contract (v2 today). Pinned copies ship alongside them as `schemas/skill.v2.schema.json` and `schemas/manifest.v2.schema.json` — content-identical to the unversioned files except for `$id` and `title`. Consumers that want stability across a future v3 bump should validate against the versioned files; consumers that want to automatically follow the latest contract should validate against the unversioned files. When v3 is in flight, `schemas/skill.v3.schema.json` + `schemas/manifest.v3.schema.json` will ship in the same PR; the unversioned files will then track v3 and the v2 files will remain frozen at their current content.
4. **One-version-overlap deprecation is preferred.** When v3 ships, `scripts/skill-lint.js` emits warnings (not errors) for v2-specific patterns for one minor release. Authors get a warning window to migrate. The rule that applies today — SH-5784's deprecation warnings for v1 field names during the v2 window — is the canonical pattern.
5. **Migration tooling ships with the bump.** The first real v3 bump will ship a `scripts/migrate-skill-v2-to-v3.js` codemod in the same PR. No migration framework is built ahead of the first real need — the SH-5784 v1→v2 bump was handled as a coordinated one-shot rewrite of in-repo starters (no external consumers yet).

For the concrete v1→v2 mapping tables, see `docs/manifest-contract.md § Migration Note — schema_version 1 → 2 (SH-5784)`. For field-level before/after pairs, see `docs/field-decision-guide.md`.
