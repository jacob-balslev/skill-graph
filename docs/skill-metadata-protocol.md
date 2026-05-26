# Skill Metadata Protocol Rationale

This is the rationale and deep explanation for the Skill Metadata Protocol. For normative authoring rules, start with [`SKILL_METADATA_PROTOCOL.md`](../SKILL_METADATA_PROTOCOL.md) (in this repo's root); this document explains why the protocol has this shape and how the pieces fit together.

Skill Metadata Protocol is the **skill-level contract** for AI SKILL.md. It defines the structured relevance metadata a skill should declare: activation signals, taxonomy, project/file scope, sibling-skill relations, grounding, drift checks, eval state, and portability.

Skill Graph is the **library-level system** that works with this protocol. It indexes, routes, clusters, audits, and reverifies libraries of Skill-Metadata-Protocol-enriched skills.

**Current contract: v8 — the 5-axis classification model.** Every authored skill is classified on five orthogonal axes — `subject` (9-enum browse shelf), `operation` (4-enum Bloom-grounded cognitive operation), `scope` (3-enum deployment targeting), `keywords` (≤10 fuzzy activation phrases), and `relations` (typed edges to sibling skills). The v8 model replaces v7's `category`/`type`/`scope` triple (where 93% of skills shared `type: capability` and 67% shared `scope: portable`, leaving no useful discriminating power in the classification triple). See [`adr/0017-five-axis-classification-model.md`](adr/0017-five-axis-classification-model.md) for the design rationale and the verified post-migration distribution.

> **Migrating from an older schema?** Jump straight to the migration notes:
> - **v7 → v8** — adopts the 5-axis classification model. Renames `category` → `subject`/`subjects[]` (now 9-enum: code-engineering, quality-assurance, frontend-ui, design-craft, agent-ops, product-domain, knowledge-organization, meta-methods, data-analytics), renames `type` → `operation` (now 4-enum: know/do/decide/modify, Bloom-grounded), renames `scope: codebase` → `project` and `scope: reference` → `workspace` (with v7 enum values kept as back-compat aliases). Caps `keywords` at 10 (truncated during migration to prevent keyword stuffing). **The v7→v8 phase ended 2026-05-26.** The schema's global `required` array now mandates the v8 axes (`subject` + `operation` + `scope`); the v7 fields (`type`, `category`, `categories`, `primaryCategory`, `layerPrimary`, `routingRole`) are DEPRECATED — schema currently still accepts them as optional properties to avoid breaking the corpus while CONTENT-mode migration drains (tracked in SH-6557). **New skills author the v8 axes only — do NOT author v7 fields.** See [`SKILL_METADATA_PROTOCOL.md` § Schema contract](../SKILL_METADATA_PROTOCOL.md#schema-contract-v7v8-phase-ended-2026-05-26) for the authoritative explanation, [`adr/0017-five-axis-classification-model.md`](adr/0017-five-axis-classification-model.md), and `scripts/migrate-skill-v7-to-v8.js` for legacy skills that need migration.
> - **v6 → v7** — splits the single v6 `audit_verdict` field into four discrete Health Block verdicts (`structural_verdict`, `truth_verdict`, `comprehension_verdict`, `application_verdict`) so the audit fingerprint carries independent verdicts for each layer (form, truth, comprehension, behavior) instead of compressing them into one PASS/FAIL signal. `application_verdict` is the new primary quality signal — a skill is only behaviorally certified when this verdict is `APPLICABLE`. See [`adr/0011-split-audit-verdict-into-four-verdicts.md`](adr/0011-split-audit-verdict-into-four-verdicts.md). (The standalone `migrations/v6-to-v7.md` procedure was retired by [ADR 0014](adr/0014-canonical-only-schema-files.md); the narrative now lives in git history + ADR 0011.)
> - **v5 → v6** — flattens the `concept` block to top-level `mental_model`, `purpose`, `boundary`, `analogy`, `misconception`; adds the Health block (`last_audited`, `last_changed`, `audit_verdict` *[deprecated in v7]*, `eval_score`, `eval_failed_ids`, `lint_verdict`, `drift_status`) so a skill's audit fingerprint lives in its own frontmatter. Legacy `concept` block remains accepted for v5 skills not yet migrated. See `migrations/v5-to-v6.md`.
> - **v4 → v5** — closes the `category` field to a 6-value enum
> - [v2 → v3](manifest-field-mapping.md#migration-note--v2--v3-v040) — `drift_check` scalar → object, `compatibility` scalar → object, `family` → `category`, new optional fields
> - [v1 → v2](manifest-field-mapping.md#migration-note--v1--v2-2026-04-17-sh-5784) — `scope` enum rename, `eval_status` split into three fields, `route_bundles` → `routing_bundles`
> - Codemod: `scripts/migrate-skill-v6-to-v7.js` splits the v6 `audit_verdict` into the four v7 verdicts. `scripts/migrate-skill-v5-to-v6.js` (backfill mode) populates the v6 flat fields from the legacy `concept` block. Older migrators (`migrate-skill-v2-to-v3.js`, `migrate-skill-v3-to-v4.js`) remain for skills lagging multiple versions.

## Related Documents

| Document | Purpose |
|---|---|
| [`SKILL_METADATA_PROTOCOL.md`](../SKILL_METADATA_PROTOCOL.md) | Normative public spec: required fields, semantic rules, authored vs generated fields, migration notes |
| `docs/skill-metadata-protocol.md` (this file) | Rationale and deep explanation: archetype map, requiredness groups, schema strictness rules, design tradeoffs |
| `docs/field-reference.md` | One section per authored field — purpose, rules, examples, when to use |
| `docs/field-decision-guide.md` | Decision tables for `scope`, `relations.*`, and the eval-health fields (`eval_artifacts`, `eval_state`, `routing_eval`) / `portability` |
| `docs/concept-map.md` | Teaching map — 36 authored fields grouped by conceptual role; drift log vs earlier framings |
| `docs/manifest-field-mapping.md` | Authored-to-generated bridge: rename map, loss policy, worked example |
| `docs/adr/` | Architecture decision records — 0001 predicate set, 0002 JSON-LD @context, 0003 OntoClean rigidity tags, 0004 persistent identifiers |
| `schemas/skill.context.jsonld` | JSON-LD @context mapping every authored field to W3C vocabularies (SKOS, Dublin Core, PROV-O) |
| `schemas/vocabulary/` | Controlled vocabularies for `keywords` (canonical + synonyms) and `workspace_tags` (literal handles + semantic tags) — advisory, surfaced as lint warnings |

## Design Principles

This document is the public source of truth for the Skill Metadata Protocol frontmatter format. Every design decision is in service of a benefit a working developer feels:

- **Keeps a flat author-facing frontmatter format** → you can author skills in plain YAML — no nested syntax to remember, no DSL to learn
- **Keeps one `SKILL.md` file per skill** → a skill's everything-you-need-to-know lives at one path; no parallel sidecar files to keep in sync
- **Keeps one generated manifest downstream** → consumers read a single deterministic artifact; the manifest is content-addressable and CI-verifiable
- **Tightens field semantics** → lint catches you when `relations.depends_on` points at a skill that doesn't exist, instead of silently breaking the router at runtime
- **Adds a small number of high-value fields beyond the SKILL.md base** → typed relations, drift detection, and project scoping become declarative metadata rather than tribal knowledge
- **Stays additive to the SKILL.md standard so every protocol-enriched skill can be transformed back to the base shape** → adopting the protocol does not trap you; the export transform at `scripts/export-skill.js` produces a valid SKILL.md file

### What kind of graph is this?

**In plain English:** Skill Metadata Protocol lets one skill say *"I depend on that one, verify me with this one, and stop routing users here when they really mean that other one."* The relation predicates (`depends_on`, `verify_with`, `boundary`, `adjacent`, `related`, `broader`, `narrower`, `disjoint_with`) are the typed edges that Skill Graph can use to turn a skill collection into a graph an agent can reason over.

Skill Graph is a **property graph with a controlled-vocabulary set of typed predicates**, not an RDF knowledge graph. Nodes are skills; edges are keys inside `relations.*`; node attributes are the 36 canonical authored frontmatter fields. The JSON-LD `@context` at `schemas/skill.context.jsonld` projects the property graph into SKOS / Dublin Core Terms / PROV-O triples for consumers that want RDF semantics, but authoring stays in flat YAML.

Skill Graph does **not** promise:

- Automated inference (no OWL reasoner runs against the graph)
- Open-world consistency checking (the schema closes it via `additionalProperties: false`)
- SPARQL queryability as the primary interface (get that by applying the JSON-LD `@context` first)

What it does promise: deterministic lint, manifest generation, relation-aware routing, drift detection against content-addressable truth sources, and portable export to SKILL.md.

### Drift-check hash semantics

`drift_check.truth_source_hashes` maps each normalized truth-source key to the **SHA-256 hex digest** at the time of last verification. String truth sources hash the whole local file under `path`; object truth sources can narrow the hash to `path#Lstart-Lend` for a line range or `path#anchor` for a Markdown heading slug / literal-text anchor. Local file content is normalized to LF before hashing so CRLF-only edits do not create false drift. The drift sentinel (`scripts/skill-graph-drift.js`) reports `DRIFT` when the live hash differs from the recorded hash, `BROKEN` when a declared local truth source is missing from disk, `STALE` when `today - drift_check.last_verified > lifecycle.stale_after_days`, `NO_BASELINE` when local truth sources are declared but no hashes are recorded, and `EXTERNAL_UNHASHED` when a URL truth source is a valid reference but is not fetched by the zero-dependency sentinel. To add a local-file baseline: `node scripts/skill-graph-drift.js --record --apply <skill-path>`.

### Overlay composition precedence

When `type: overlay` and `extends: <parent-skill>`, the overlay's authored fields **override** the parent's fields on a per-field basis. There is no field-level merge — a field present on the overlay replaces the same field on the parent entirely. The overlay body sections (`## Coverage`, `## Overlay Rules`, `## Extends`, `## Do NOT Use When`) stand on their own and do not inherit prose from the parent. This mirrors OntoClean specialisation: the overlay is anti-rigid (-R) and existentially dependent (+D) on the parent, but the overlay's *content* is authoritative within its own SKILL.md (ADR 0003). Consumers resolving an overlay at routing time:

1. Load the overlay's frontmatter as the effective skill metadata.
2. Treat the parent's metadata as context — available for reference but not merged.
3. Apply the overlay's `## Overlay Rules` as modifications to the parent's behaviour, scoped to the overlay's `## Coverage`.

If an overlay needs to *add* rather than *replace* a field's value (e.g. add keywords), author the full intended set in the overlay — the schema does not offer additive inheritance. Future work under ADR 0001 may introduce explicit merge strategies; today the rule is overlay-wins-per-field.

## Relationship to the SKILL.md Standard

> **This added structure is the price of making skills verifiable and system-aware once descriptions alone stop being enough.** If your library is small enough that descriptions and keywords are sufficient, stay on plain SKILL.md — Skill Metadata Protocol's additional fields are overhead without payoff until the implicit graph appears.

Skill Metadata Protocol extends the [SKILL.md](https://agentskills.io/specification) open standard with a richer authoring contract. The base standard requires two frontmatter fields (`name` and `description`) and defines four optional fields (`license`, `compatibility`, `metadata`, `allowed-tools`). The protocol keeps the two required base fields and three of the four optional base fields (`license`, `compatibility`, `allowed-tools`) as top-level fields — though `compatibility` is tightened from a free-text string to a structured object, and `name` allows `/` and `:` for namespacing. It does not use the base `metadata` field; protocol extensions are promoted to additional named top-level fields instead.

A Skill-Metadata-Protocol-enriched `SKILL.md` is *not* automatically a valid SKILL.md file: the `compatibility` shape and `name` pattern diverge. The export transform at `scripts/export-skill.js` produces a `SKILL.skill-md.md` that is valid against the base standard — flattening `compatibility` to a string and nesting protocol extension fields under the base `metadata:` key. Round-trip parity is via the export transform, not via direct schema compatibility.

| Field | Source | Skill Metadata Protocol treatment |
|---|---|---|
| `name` | SKILL.md required | Kept as required; the protocol tightens the character pattern |
| `description` | SKILL.md required | Kept as required; scoped to routing |
| `license` | SKILL.md optional | Kept top-level; strongly recommended for shared skills |
| `compatibility` | SKILL.md optional | Kept top-level; optional |
| `allowed-tools` | SKILL.md optional | Kept top-level as a space-separated string |
| `metadata` | SKILL.md optional | Not used at the top level; the protocol promotes extensions to named fields |
| `schema_version`, `version`, `type`, `category`, `scope`, `owner`, `freshness`, `drift_check`, `eval_artifacts`, `eval_state`, `routing_eval` | Skill Metadata Protocol extension | Required by the protocol; additive to the base |
| `relations`, `grounding`, `portability`, `triggers`, `keywords`, `examples`, `anti_examples`, `paths`, `workspace_tags`, `domain`, `routing_bundles`, `lifecycle`, `runtime_telemetry`, `extends`, `stability`, `superseded_by` | Skill Metadata Protocol extension | Optional protocol enrichments; additive to the base |

A Skill-Metadata-Protocol-enriched `SKILL.md` is **not** a valid SKILL.md file as authored, because the protocol requires fields the base standard does not define. An export transform can produce an SKILL.md-valid file by moving every protocol extension field under the standard `metadata:` key. The transform is implemented as `scripts/export-skill.js`.

## Archetype Section Map

Each skill archetype expects a specific set of body H2 sections. These are the minimum required sections per archetype. Additional sections are allowed when they earn their line count.

| Archetype | Required H2 sections | Example for a real project |
|---|---|---|
| `capability` | `## Coverage`, `## Philosophy of the skill`, `## Verification`, `## Do NOT Use When` | [`markdown-post-frontmatter-validation`](../examples/projects/markdown-static-site/skills/markdown-post-frontmatter-validation/SKILL.md) — codebase-grounded with full `grounding` block |
| `workflow` | `## Coverage`, `## Philosophy of the skill`, `## Workflow`, `## Verification`, `## Do NOT Use When` | [`migrate-posts-to-v2-frontmatter`](../examples/projects/markdown-static-site/skills/migrate-posts-to-v2-frontmatter/SKILL.md) — codebase-grounded; demonstrates the four-phase add-required-field workflow with dry-run gate |
| `router` | `## Coverage`, `## Routing Rules`, `## Do NOT Use When` | [`content-source-router`](../examples/projects/markdown-static-site/skills/content-source-router/SKILL.md) — dispatches between local markdown / MDX / CMS-synced sources by file extension or content-path prefix |
| `overlay` | `## Coverage`, `## Overlay Rules`, `## Extends` (name of the base skill), `## Do NOT Use When` | [`lint-overlay`](https://github.com/jacob-balslev/skills/blob/main/skills/lint-overlay/SKILL.md) extends [`testing-strategy`](https://github.com/jacob-balslev/skills/blob/main/skills/testing-strategy/SKILL.md) — adds lint-specific gate placement on top of the base verification framework |

`## Key Files` is recommended for skills that reference concrete repo files. Prefer file paths with line ranges (`src/foo.ts:45-120`) over bare paths when the skill depends on a specific function or section. `## References` is recommended for skills that point at external reading.

### Relationship to wider skill-authoring doctrine

This archetype map is Skill Metadata Protocol's own minimum. When the protocol is adopted into a monorepo that already has a canonical authoring standard (e.g., a `canonical-standard` or `skill-scaffold` skill), the adopter's standard may impose additional required sections or stricter content rules on top of this map. Skill Metadata Protocol does not replace such a standard — it provides the portable subset that every skill must satisfy regardless of which adopter's fuller doctrine also applies. If you are adopting Skill Graph into a repo with a `canonical-standard` skill, reference that skill's archetype canon instead of republishing a narrower one in your own repo docs.

## Requiredness Groups

These groups are documentation categories only. They do not require nested YAML.

### Required for all skills

```yaml
schema_version
name
description
version
type
category
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

These improve portability, discoverability, and health tracking, but are not required for a valid Skill Metadata Protocol skill.

```yaml
paths
workspace_tags
categories
primaryCategory
compatibility
allowed-tools
routing_bundles
portability
lifecycle
runtime_telemetry
```

## Template and Teaching Layer Discipline

Skill Metadata Protocol is the canonical contract, not the canonical template. The contract is the schema-backed set of fields, requiredness rules, relation semantics, grounding rules, and validation expectations. [`examples/skill-metadata-template.md`](../examples/skill-metadata-template.md) is a teaching artifact that demonstrates the contract for authors. A team can maintain its own stricter template as long as the resulting `SKILL.md` files still validate against the protocol.

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

### Title casing convention

The H1 title at the top of each SKILL.md body is Title Case — every significant word capitalized — and it is the human-readable expansion of `name:`, not a duplicate. Single-word skills (`debugging` → `# Debugging`) capitalize the single word. Abbreviations and identifier-style names expand to their human form (`a11y` → `# Accessibility`, `graph-audit` → `# Graph Audit`). The `name:` field stays lowercase and hyphenated; the H1 is never used as a graph identifier.

### Description opener convention

Every `description:` field leads with a trigger clause — `"Use when …"` or an equivalent imperative — and names at least one explicit negative boundary with `"Do NOT use for …"`. Do not lead with the skill's own name as a noun (`"Debugging skill for …"`); the router already knows the name from the `name:` field, so the opener should spend its budget on when the skill activates, not on self-reference. A good opener names (a) the triggering situation, (b) the scope the skill covers, and (c) at least one concrete case where a different skill is correct instead.

## Anatomy

> **The question this diagram answers:** "What are the parts of a SKILL.md?"

Every Skill Graph SKILL.md is the same shape: a YAML frontmatter, a Markdown body, and — only in the canonical template specimen — a teaching layer that is stripped when the template is adapted. The field-level detail lives in the table below the diagram and in [`docs/field-reference.md`](field-reference.md); the archetype → required-section mapping lives in the [Archetype Section Map](#archetype-section-map) above. This diagram shows only the compositional shape.

```mermaid
flowchart LR
  Skill(["<b>SKILL.md</b>"])
  FM["<b>YAML Frontmatter</b><br/>33 named fields · machine-validated"]
  Body["<b>Markdown Body</b><br/>H2 sections depend on <code>type</code>"]
  Teach["<b>Teaching Layer</b><br/>TEMPLATE NOTE scaffolding<br/>template specimen only"]

  Skill --> FM
  Skill --> Body
  Skill -.->|optional| Teach

  classDef file fill:#dbeafe,stroke:#2563eb,color:#1e3a8a,font-weight:bold
  classDef layer fill:#ecfdf5,stroke:#047857,color:#064e3b
  classDef optional fill:#fef3c7,stroke:#d97706,color:#78350f,stroke-dasharray:4 2
  class Skill file
  class FM,Body layer
  class Teach optional
```

<!-- Rendered copy for non-Mermaid viewers. Regenerate via: npx @mermaid-js/mermaid-cli -i <source> -o docs/images/skill-anatomy.png -->
<img src="./images/skill-anatomy.png" alt="Skill anatomy — SKILL.md decomposes into YAML Frontmatter plus Markdown Body, with an optional Teaching Layer that only exists in the canonical template specimen" width="720" />

**Legend.** Blue = the file. Green = a required layer. Yellow dashed = an optional / specimen-only layer.

### Authored fields, grouped by purpose

The YAML frontmatter uses the current v7 schema, including compatibility aliases that remain accepted for migration, the flat Understanding fields added in v6, the four-verdict Health Block added in v7, and the two publication-facet fields (`secondary_categories`, `marketplace_tier`) added in the May 2026 skill-org reorganization. The schema is the authoritative source for types and requiredness (`schemas/skill.schema.json`); the canonical per-field reference is [`docs/field-reference.md`](field-reference.md). The table below is a navigable index. `always` = required by the base schema; `if <condition>` = conditionally required; blank = optional enrichment.

**v6 simplification (2026-05-17).** v6 flattens the seven-field `concept` block to top-level so the Understanding fields read like every other field in the Protocol. It also adds the first flat **Health Block** so a skill's audit fingerprint lives in its own frontmatter instead of scattered across `eval-history.jsonl`, `health-ledger.jsonl`, and `.opencode/progress/skill-audit-*`. **v7 split (2026-05-19).** v7 replaces the single aggregate `audit_verdict` with four verdicts: `structural_verdict`, `truth_verdict`, `comprehension_verdict`, and `application_verdict`. The Skill Audit Loop reads these Health Block fields directly; no log-file crawl required.

| Group | Field | Required? | Shape |
|---|---|---|---|
| **Identity** | [`name`](field-reference.md#name) | always | string |
| | [`urn`](field-reference.md#urn) | | persistent `urn:skill:<repo>:<skill-name>` identifier |
| | [`description`](field-reference.md#description) | always | string |
| | [`version`](field-reference.md#version) | always | semver string |
| | [`owner`](field-reference.md#owner) | always | string |
| **Classification** | [`schema_version`](field-reference.md#schema_version) | always | integer `7` |
| | [`type`](field-reference.md#type) | always | `capability` \| `workflow` \| `router` \| `overlay` |
| | [`scope`](field-reference.md#scope) | always | `codebase` \| `reference` \| `portable` |
| | [`category`](field-reference.md#category) | always | string |
| | [`categories`](field-reference.md#categories) | | ordered category array; first item matches `category` |
| | [`primaryCategory`](field-reference.md#primaryCategory) | | workspace alias for the primary category |
| | [`layerPrimary`](field-reference.md#layerPrimary) | | workspace routing/census layer facet |
| | [`routingRole`](field-reference.md#routingRole) | | workspace routing role facet |
| | [`domain`](field-reference.md#domain) | | hierarchical path |
| | [`secondary_categories`](field-reference.md#secondary_categories) | | string[] (max 2, drawn from the `category` enum; for marketplace cross-listing only — does not affect filesystem placement) |
| | [`stability`](field-reference.md#stability) | | `experimental` \| `stable` \| `deprecated` |
| | [`superseded_by`](field-reference.md#superseded_by) | if `stability: deprecated` | skill name |
| | [`marketplace_tier`](field-reference.md#marketplace_tier) | | `S` \| `A` \| `B` \| `C` (omit for unpublished; sourced from publication-priority docs) |
| **Health & Drift** | [`freshness`](field-reference.md#freshness) | always | ISO date |
| | [`drift_check`](field-reference.md#drift_check) | always | `{ last_verified, truth_source_hashes? }` |
| | [`lifecycle`](field-reference.md#lifecycle) | | `{ stale_after_days, review_cadence }` |
| | [`runtime_telemetry`](field-reference.md#runtime_telemetry) | | `{ feedback_source, metrics }` |
| **Health Block** (v7+, flat) | [`last_audited`](field-reference.md#last_audited) | | ISO date |
| | [`last_changed`](field-reference.md#last_changed) | | ISO date |
| | [`structural_verdict`](field-reference.md#structural_verdict) | | `PASS` \| `PASS_WITH_FIXES` \| `FAIL` \| `UNVERIFIED` (v7+; form gate roll-up) |
| | [`truth_verdict`](field-reference.md#truth_verdict) | | `PASS` \| `DRIFT` \| `BROKEN` \| `UNVERIFIED` (v7+; truth-source roll-up) |
| | [`comprehension_verdict`](field-reference.md#comprehension_verdict) | | `PASS` \| `PROVISIONAL` \| `SHALLOW` \| `REDUNDANT` \| `UNVERIFIED` \| `SKIPPED_BASELINE_HIGH` \| `NA` (v7+; gate 8, demoted) |
| | [`application_verdict`](field-reference.md#application_verdict) | | `APPLICABLE` \| `REDUNDANT` \| `HARMFUL` \| `MIXED` \| `FALSE_POSITIVE` \| `UNVERIFIED` \| `PROVISIONAL` (v7+; **primary quality signal**) |
| | [`eval_score`](field-reference.md#eval_score) | | number 0.0–5.0 |
| | [`eval_failed_ids`](field-reference.md#eval_failed_ids) | | string[] |
| | [`lint_verdict`](field-reference.md#lint_verdict) | | `PASS` \| `FAIL` \| `UNKNOWN` (per-script signal — `skill-lint.js`) |
| | [`drift_status`](field-reference.md#drift_status) | | `OK` \| `DRIFT` \| `BROKEN` \| `STALE` \| `NO_BASELINE` \| `EXTERNAL_UNHASHED` \| `UNKNOWN` (per-script signal — `skill-graph-drift.js`) |
| | [`audit_verdict`](field-reference.md#audit_verdict-deprecated) | | **DEPRECATED in v7** — `PASS` \| `PASS_WITH_FIXES` \| `PARTIAL` \| `FAIL` \| `UNKNOWN` (pre-v7 single aggregate; replaced by the four verdicts above) |
| **Eval Health** (orthogonal triple) | [`eval_artifacts`](field-reference.md#eval_artifacts) | always | `present` \| `planned` \| `none` |
| | [`eval_state`](field-reference.md#eval_state) | always | `unverified` \| `passing` \| `monitored` |
| | [`routing_eval`](field-reference.md#routing_eval) | always | `present` \| `absent` |
| | [`comprehension_state`](field-reference.md#comprehension_state) | | `present` \| `absent` |
| **Understanding** (v6+, flat) | [`mental_model`](field-reference.md#mental_model) | if `comprehension_state: present` | string |
| | [`purpose`](field-reference.md#purpose) | if `comprehension_state: present` | string |
| | [`boundary`](field-reference.md#boundary) | if `comprehension_state: present` | string |
| | [`analogy`](field-reference.md#analogy) | if `comprehension_state: present` | string |
| | [`misconception`](field-reference.md#misconception) | if `comprehension_state: present` | string |
| | [`concept`](field-reference.md#concept) | DEPRECATED in v6 | `{ definition, mental_model, purpose, boundary, taxonomy, analogy, misconception }` — legacy v5 shape, accepted for back-compat |
| | [`eval_last_run`](field-reference.md#eval_last_run) | | `{ at, status, runner?, model?, receipt?, receipt_hash? }` |
| **Activation & Routing** | [`keywords`](field-reference.md#keywords) | if routable | string[] |
| | [`triggers`](field-reference.md#triggers) | | string[] |
| | [`paths`](field-reference.md#paths) | | glob[] |
| | [`examples`](field-reference.md#examples) | | string[] (positive prompts) |
| | [`anti_examples`](field-reference.md#anti_examples) | | string[] (negative prompts) |
| | [`workspace_tags`](field-reference.md#workspace_tags) | | string[] |
| | [`routing_bundles`](field-reference.md#routing_bundles) | | string[] |
| **Relations** | [`relations`](field-reference.md#relations) | | `{ adjacent, related, broader, narrower, boundary, disjoint_with, verify_with, depends_on }` |
| **Grounding** | [`grounding`](field-reference.md#grounding) | if `scope: codebase` | `{ domain_object, grounding_mode, truth_sources, failure_modes, evidence_priority }` |
| **Portability & Standards** | [`portability`](field-reference.md#portability) | | `{ readiness, targets }` |
| | [`license`](field-reference.md#license) | | SPDX identifier |
| | [`compatibility`](field-reference.md#compatibility) | | `{ runtimes?, node?, notes? }` |
| | [`allowed-tools`](field-reference.md#allowed-tools) | | space-separated string |
| | [`extends`](field-reference.md#extends) | if `type: overlay` | skill name |

**Conditional requiredness in one line:** `keywords` when the skill is routable, `extends` when `type: overlay`, `grounding` when `scope: codebase`, `superseded_by` when `stability: deprecated`. The schema enforces the latter three via `allOf`; lint enforces the `keywords` routability rule. For the decision tables that help you choose between `capability` / `workflow` / `router` / `overlay` or between `codebase` / `reference` / `portable`, see [`docs/field-decision-guide.md`](field-decision-guide.md).

## Why archetypes are rigid vs anti-rigid (OntoClean per ADR 0003)

The four `type` values — `capability`, `workflow`, `router`, `overlay` — are not interchangeable buckets. They partition the skill space along the OntoClean rigidity axis (Guarino & Welty 2002), which is why ADR 0003 tags each archetype as either RIGID, ANTI-RIGID, or DEPENDENT.

| Archetype | Rigidity tag | What it means |
|---|---|---|
| `capability` | **Rigid** | A capability skill's identity is intrinsic. "Web accessibility (a11y)" is a stable concept; an entity that is a `capability` cannot stop being a `capability` without ceasing to exist as the same skill. |
| `workflow` | **Rigid** | Same as capability — a workflow's identity is the procedure it teaches. "Code review" stops being "code review" only by being deleted, not by changing type. |
| `router` | **Rigid** | A router's identity is its dispatch role; replacing the dispatch logic produces a different router skill, not the same router doing something else. |
| `overlay` | **Anti-rigid + Dependent** | An overlay's identity is INHERITED from the parent it `extends`. Without the parent, the overlay does not have a coherent identity on its own. The overlay is a specialisation, not a standalone skill. |

**Operationally, this is why changing a skill's `type` is not a harmless refactor**: it changes how downstream routers, eval graders, and reviewers interpret the skill. A type-change cascades into different routing behaviour, different eval interpretation, and different relation semantics — none of which surface as a syntax error, all of which produce subtly wrong agent behaviour.

The practical consequence is in **migration**: a rigid type cannot change at runtime without invalidating consumer assumptions. If a skill that consumers use as a `capability` is silently switched to `router`, the consumer's keyword scoring, eval interpretation, and routing-eval contract all break. Type changes therefore require a `superseded_by` chain — the old skill becomes `stability: deprecated` and a new skill takes the new type. Rigidity is the invariant that makes this discipline trustworthy.

The anti-rigid `overlay` is treated specially by the lint:

- An overlay must declare `extends: <parent-skill-name>`.
- The overlay's `## Coverage` should reference parent concepts (heuristic; OntoClean review, ADR 0003).
- The overlay must NOT declare its own `relations.broader` or `relations.narrower` — those flow through `extends`.
- Deleting the parent invalidates every overlay that extended it; audit/protocol review must surface the dangling reference.

For cross-skill generalisation that is NOT existential dependency (i.e., the child is a coherent standalone skill that just happens to specialise a parent concept), use `relations.broader` instead of `extends`. `react-best-practices` has `broader: [frontend]` because react-best-practices remains coherent even if `frontend` were deleted; it is RIGID. The `extends`-vs-`broader` decision is the OntoClean test in everyday authoring.

**Read this when:** deciding `type:` for a new skill, deciding `extends:` vs `relations.broader:`, or judging whether a refactor that changes a skill's type is safe.

## Why the eval-health triple is orthogonal (ADR 0001 + ADR 0006)

`eval_artifacts`, `eval_state`, and `routing_eval` are three fields that look like they could be one. They are deliberately separate because they answer three orthogonal questions about a skill's eval health:

| Question | Field | Values |
|---|---|---|
| Are eval files on disk? | `eval_artifacts` | `none` / `planned` / `present` |
| What does the eval say about content quality? | `eval_state` | `unverified` / `passing` / `monitored` |
| Is routing / trigger coverage explicitly evaluated? | `routing_eval` | `absent` / `present` |

Each axis has consumer-visible meaning. A consumer deciding whether to load a skill into an agent context can read all three and make a graded decision: high-quality content + verified routing > unverified content + verified routing > unverified content + absent routing. Conflating them would force the consumer to guess.

The orthogonality also expresses real states cleanly:

- `eval_artifacts: planned + eval_state: unverified` — the author intends to ship evals but hasn't yet; planned-staleness review should surface when this sits too long.
- `eval_artifacts: present + eval_state: passing + routing_eval: absent` — content quality is verified but the router has never been tested against this skill's `examples[]`. Common during the early life of a skill.
- `eval_artifacts: present + eval_state: monitored + routing_eval: present` — fully verified along all three axes; the harness runs on a cadence and routing coverage is part of the eval set. The aspirational state.

Note the asymmetry: `routing_eval` is binary (`absent` / `present`) because the harness either agrees or it doesn't — there is no "monitored routing eval" because the routing harness provides the concrete pass/fail receipt. `eval_state` is ternary because content evals can run once (`passing`) or repeatedly (`monitored`), and the difference is consumer-visible.

The "honesty over green checkmarks" rule (documented at `docs/field-reference.md § routing_eval`) governs the `routing_eval` flip specifically: an author cannot claim `routing_eval: present` until `node scripts/skill-graph-routing-eval.js --skill <name>` returns verdict PASS. The OSS starter library currently sits at all-8-`present` (verified by `node scripts/skill-graph-routing-eval.js --only-asserted`).

For the field-by-field rationale and worked-example confusion-cases, see [`docs/field-rationale.md`](field-rationale.md).

## How JSON-LD context maps fields to W3C terms (ADR 0002)

Skill Metadata Protocol ships an optional JSON-LD `@context` at `schemas/skill.context.jsonld` that projects every authored field onto a W3C standard vocabulary term. This is the FAIR Interoperability layer (Wilkinson et al. 2016, DOI:10.1038/sdata.2016.18): a protocol-enriched skill loaded into a knowledge-graph consumer that already understands SKOS, PROV-O, OWL, or Dublin Core gets RDF-projectable semantics with no Skill-Metadata-Protocol-specific code.

The context is the source of truth for cross-vocabulary mapping. The most consequential mappings:

| Authored field | W3C term | Vocabulary | Why this term |
|---|---|---|---|
| `name` | `dcterms:identifier` | Dublin Core | Stable display-layer skill identity |
| `description` | `dcterms:description` | Dublin Core | Free-text subject summary |
| `version` | `dcterms:hasVersion` | Dublin Core | Skill content version (semver) |
| `freshness` | `dcterms:modified` | Dublin Core (xsd:date) | Author's claim of last-meaningful-review date |
| `category` | `skos:broader` | SKOS | Hierarchical category path projects to a skos:broader chain |
| `relations.related` / `adjacent` | `skos:related` | SKOS | Symmetric associative relation between concepts |
| `relations.broader` | `skos:broader` | SKOS | Cross-skill generalisation (target is more general) |
| `relations.narrower` | `skos:narrower` | SKOS | Cross-skill specialisation (target is more specific) |
| `relations.boundary` | `sg:disjointOwnership` | Skill-Graph custom | Routing-layer asymmetric handoff — intentionally weaker than OWL class-disjointness (per ADR 0006) |
| `relations.disjoint_with` | `owl:disjointWith` | OWL | Formal class-theoretic disjointness — distinct from `boundary` (per ADR 0006) |
| `relations.verify_with` | `prov:wasInformedBy` | PROV-O | Verifier skill informs this skill's claims |
| `relations.depends_on` | `dcterms:requires` | Dublin Core | Operational prerequisite |
| `extends` | `prov:wasDerivedFrom` | PROV-O | Overlay derivation relation |
| `grounding.truth_sources` | `dcterms:source` | Dublin Core | Source resources from which claims are derived |
| `urn` | `@id` | RFC 8141 + JSON-LD | Globally-unique persistent identifier |

The `boundary` vs `disjoint_with` split is the most semantically subtle entry. Per ADR 0006, `boundary` operates at the **routing layer** (the router uses it as a score-aware exclusion guard when the declaring skill wins or ties — asymmetric, directional) while `disjoint_with` operates at the **ontology layer** (formal class-disjointness — symmetric, reflexive). They are NOT aliases. Treating them as aliases — which ADR 0001 originally proposed — would force consumers to reason about routing claims as if they were ontological claims, which is unsound.

The `@context` also declares the `owl` namespace (since the v1.1.0 update) so the `disjoint_with` mapping resolves cleanly. The `_adr_anchors` block in the context file explicitly cross-references ADRs 0001, 0002, and 0006 so future maintainers see the reasoning for the split mapping in-tree, not only in commit history.

**Coverage policy:** ADR 0002 requires that every top-level authored field appears in `schemas/skill.context.jsonld`. Protocol consistency check C8 enforces this automatically, including declared JSON-LD namespace prefixes. When adding a top-level schema field, update the context mapping in the same change.

**Read this when:** adding a new top-level field, adding a new `relations.*` predicate, or considering whether to map an existing field to a different W3C term.

## Schema Strictness

The Skill Metadata Protocol schemas are intentionally strict.

- Unknown top-level fields fail validation rather than being silently accepted.
- Field names must not rely on undocumented aliases.
- New public fields must be added by updating both the docs and the schemas.
- If you touched `docs/skill-metadata-protocol.md` or `schemas/skill.schema.json`, also update the other side so they remain in lockstep. Skill Metadata Protocol is the source of truth for semantics; the schema is the source of truth for machine enforcement. Drift between them is a bug.

## Relationship to Audit Tooling

Skill Metadata Protocol is designed to work with:

1. `SKILL_AUDIT_LOOP.md` § Part 2
2. `SKILL_AUDIT_LOOP.md`

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

The 40 top-level authored fields are listed in `schemas/skill.schema.json`; aliases are included there so consumers can validate duplicate declarations consistently.

For the purpose, rules, and examples for each field, see `docs/field-reference.md`.

### Generated in `skills.manifest.json`

- normalized category rollups
- health flags
- eval counts
- missing coverage flags
- mirror status
- compiled activation tables
- generated docs ownership

See `docs/manifest-field-mapping.md` for the full rename map, loss policy, migration policy, and a worked example showing the authored-to-generated projection field by field.

## Schema Versioning Policy

Skill Graph uses a single integer `schema_version` to signal authored skill contract evolution. Current authored skill version: **8** (bumped from 7 when the 5-axis classification model — `subject` / `operation` / `scope` plus `keywords` and `relations` — replaced the v7 `type` / `category` axes; the v7→v8 phase ended 2026-05-26 and v7 classification fields are now deprecated back-compat reads). The five policy points together define when `schema_version` bumps, what consumers should expect, and where migration tooling lives:

1. **Breaking changes bump `schema_version`.** Renamed fields, removed fields, retyped fields, removed enum values, or tightened required-ness constraints bump the integer. Consumers must migrate or pin.
2. **Additive changes do not bump.** New optional fields, new enum values that extend (not replace) an enum, and new warning-only companion checks do not bump the version. Consumers on the prior minor release continue to pass.
3. **Validate against the canonical schema.** Per [ADR-0014](adr/0014-canonical-only-schema-files.md), `schemas/skill.schema.json` and `schemas/manifest.schema.json` are the only schema files on disk — they track the current contract (`schema_version: 8` today; `7` validates as a deprecated back-compat read). Prior contract versions live in git history; consumers that need to pin against a historical version resolve via `git show <commit>:schemas/skill.schema.json` or a `git tag schema-vN` if one exists.
4. **Manifest schema-file version and manifest root `schema_version` are separate surfaces.** The current manifest schema file is v7, but generated manifests still emit root field value `4` because v5-v7 manifest changes were additive for consumers. `schemas/manifest.schema.json` validates that back-compatible root value explicitly.
5. **One-version-overlap deprecation is preferred.** Companion checks emit warnings (not errors) during migration windows where a deprecated shape can still be interpreted safely. Authors get a warning window to migrate. Hard-error enum/shape changes are rejected by `additionalProperties: false` + type constraints in the schema itself, with migration docs pointing at the rename.
6. **Migration tooling runs once per bump, then retires.** Per ADR-0014, line-based codemods (`scripts/migrate-skill-vN-to-vM.js`) walk the corpus once, then are deleted alongside their pinned-schema targets. The migration narrative for any historical bump lives in git log + the corresponding ADR; the codemod itself is not retained on disk.

For the concrete v2→v3 mapping tables, see `docs/manifest-field-mapping.md § Migration Note — schema_version 2 → 3`. For the v1→v2 tables (historical), see the same document. For field-level before/after pairs, see `docs/field-decision-guide.md`.

### Health Block versioning (SH-6123)

**Health Block fields are v6+.** The flat Health fields were introduced in v6 (`last_audited`, `last_changed`, `audit_verdict`, `eval_score`, `eval_failed_ids`, `lint_verdict`, `drift_status`) and expanded in v7 to split the single aggregate `audit_verdict` into four discrete verdicts (`structural_verdict`, `truth_verdict`, `comprehension_verdict`, `application_verdict`). Per ADR-0014, the canonical `schemas/skill.schema.json` validates the v7 contract; prior contract versions (v5/v6) live in git history. The historical compatibility points (for readers cross-checking older skills):

- v5 used `additionalProperties: false` and did not define Health Block properties.
- v6 defined the seven-field aggregate Health Block but did not include the four v7 verdicts.
- v7 defines the four-verdict Health Block (`structural_verdict`, `truth_verdict`, `comprehension_verdict`, `application_verdict`). Skills on v5/v6 frontmatter that contain v7 Health Block fields are mid-migration: either bump them to v7 (the corresponding codemod ran once and retired per ADR-0014; for a stuck skill use `git show <retire-commit>:scripts/migrate-skill-v6-to-v7.js` to recover the codemod) or strip the incompatible fields.

**Policy:** If the Skill Audit Loop walker stamps Health Block fields onto a skill whose frontmatter declares a `schema_version` integer below 7 (v6 had a single aggregate `audit_verdict`, not the four-verdict block), the walker has written to the wrong schema tier. Correct the skill by migrating it to the current contract through the audit loop (per-version codemods retired alongside the pinned schemas per ADR-0014; the v5→v6, v6→v7, and v7→v8 transformations are documented in git history + the corresponding ADRs) rather than adding an exception to the schema. Health Block fields are not universally applicable across schema versions; they are a v6+ contract, the four-verdict shape is v7+, and the 5-axis classification is v8+.

**v7 doctrine: form gates are demoted.** In v7, `structural_verdict: FAIL` is reserved for external-constraint violations only (Anthropic Agent Skills marketplace shape, required-fields, valid YAML). Internal style preferences (title length below the external limit, body section preferences, naming conventions beyond what the marketplace enforces) emit lint warnings but do not produce `FAIL`. See [ADR 0011](adr/0011-split-audit-verdict-into-four-verdicts.md) Change 2.

## Stability Promotion Criteria (SH-6109)

`stability: stable` signals that a skill's content is settled and suitable for production dependence. The promotion criteria below are checked at **WARN level** (never ERROR) by `scripts/lint/check-stability-promotion.js`, exposed as `npm run stability:check` and wired into `npm run verify`. Run history: added as a `skill-lint.js` check in `7e0306d`, removed from `skill-lint.js` in `2bd8e64` (2026-05-19) when the lint surface narrowed to canonical-source mandates, library kept in place by `92978fb` (2026-05-20), CLI entrypoint + verify wiring added 2026-05-24. The script is intentionally separate from `skill-lint.js` because `stability` is a Skill Graph quality posture, not a schema or external-format requirement. Final promotion remains author judgment, audited by the Health Block fields and the application-eval pipeline (gate 9); the gate just surfaces a warning when a skill claims `stability: stable` without meeting the five criteria.

A skill qualifies for `stability: stable` when it meets all five of the following:

| # | Criterion | Field(s) | Pass condition |
|---|---|---|---|
| 1 | Eval has been run | `eval_state` | Value is `passing` or `monitored` (not `unverified` or absent) |
| 2 | Eval score meets quality bar | `eval_score` | ≥ 4.0 on the 0.0–5.0 audit scale (≡ 80%) |
| 3 | Routing coverage evaluated | `routing_eval` | Value is `present` with a passing `skill-graph-routing-eval.js` receipt |
| 4 | Drift verified recently | `drift_check.last_verified` | ISO 8601 date within the last 90 days |
| 5 | Truth sources declared | `grounding.truth_sources` | Non-empty array; exempt when `scope: portable` |

**Severity:** All findings from this check are warnings, not errors. This prevents 141 currently-experimental skills from breaking the lint run if any author prematurely sets `stability: stable`.

**When criterion 5 is exempt:** Skills with `scope: portable` have no codebase tie-in by definition. They are exempt from criterion 5 because `grounding.truth_sources` is not meaningful for portable skills.

**To promote a skill:** Satisfy each criterion, then change `stability: experimental` to `stability: stable`. The lint run will emit no stability-promotion warnings once all five criteria are met.

**Implementation:** `scripts/lint/check-stability-promotion.js` (library + CLI), wired as `npm run stability:check` inside `npm run verify`. Tests: `scripts/__tests__/test-stability-promotion.js` (8 cases). Final promotion is author judgment, audited by reading the Health Block fields directly; the gate surfaces premature-stable claims rather than blocking them.
