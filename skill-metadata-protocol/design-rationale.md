# Skill Metadata Protocol Rationale

This is the rationale and deep explanation for the Skill Metadata Protocol. For normative authoring rules, start with [`SKILL_METADATA_PROTOCOL.md`](SKILL_METADATA_PROTOCOL.md); this document explains why the protocol has this shape and how the pieces fit together.

Skill Metadata Protocol is the **skill-level contract** for AI SKILL.md. It defines the structured relevance metadata a skill should declare: activation signals, taxonomy, project/file scope, sibling-skill relations, grounding, drift checks, eval state, and portability.

Skill Graph is the **library-level system** that works with this protocol. It indexes, routes, clusters, audits, and reverifies libraries of Skill-Metadata-Protocol-enriched skills.

**Current contract: v8.** Every authored skill carries three required classification fields — `subject` (12-enum browse shelf — the competency the skill teaches), `deployment_target` (2-enum: `portable` / `project`), and `scope` (free-text PRD-style statement) — plus optional polyhierarchy (`subjects[]`, max 2), capped activation keywords (`keywords`, ≤10), and typed routing edges (`relations`). The v8 model replaces v7's `category`/`type`/`scope` triple (where 93% of skills shared `type: capability` and 67% shared `scope: portable`, leaving no useful discriminating power in the classification triple). See [`adr/0017-five-axis-classification-model.md`](../docs/adr/0017-five-axis-classification-model.md) for the five-axis design rationale (the `operation` axis defined there was retired 2026-05-27); the `subject` enum was re-axed from 9 to 12 competency shelves on 2026-06-03 — see [`adr/0020-twelve-shelf-competency-reaxis.md`](../docs/adr/0020-twelve-shelf-competency-reaxis.md).

> **Reading an older skill?** Historical migration notes for context:
> - **`subject` re-axis (2026-06-03)** — the `subject` enum was re-derived from 9 to 12 competency shelves (an enum-value change, not a `schema_version` bump). `code-engineering` split into `backend-engineering` + `software-architecture` + `data-engineering`; `frontend-ui` → `frontend-engineering` (design members moved to `design`); `design-craft` → `design`; `meta-methods` split into `reasoning-strategy` + `software-engineering-method`; `agent-ops` split into `agent-ops` (runtime) + `ai-engineering` (features); `data-analytics` retired; `product-domain` shrunk to genuine verticals. A skill authored before this carried one of the old 9 values; the corpus was migrated per the reviewed mapping. See [`adr/0020-twelve-shelf-competency-reaxis.md`](../docs/adr/0020-twelve-shelf-competency-reaxis.md).
> - **v7 → v8 (clean cut on 2026-05-27)** — replaced v7's `category` / `type` / `scope` triple with `subject` (closed 9-enum) + `deployment_target` (closed 2-enum: `portable` / `project`) + required free-text `scope`. Repurposed `scope` as a PRD-style statement (the `workspace` enum value was removed; the briefly-introduced `operation` axis was retired in the same release). Added polyhierarchy via `subjects[]` (max 2), optional `taxonomy_domain`, `project[]`/`repo[]` belonging-entity references, and `grounding.subject_matter` (renamed from `domain_object`). Capped `keywords` at 10. The v7 classification fields (`type`, `category`, `categories`, `primaryCategory`, `layerPrimary`, `routingRole`) and the v7 scope values (`codebase`, `reference`) are not declared in the live schema. The prior contract is retrievable via `git show schema-v7:schemas/SKILL_METADATA_PROTOCOL_schema.json` and is not accepted by the live schema. Per [`AGENTS.md § Major Version Is a Clean Cut`](../AGENTS.md), the live tree describes v8 only; legacy skills carrying v7 fields are migrated per-skill through `/audit:*` (CONTENT-mode work).
> - **v6 → v7** — splits the single v6 `audit_verdict` field into four discrete Audit Status verdicts (`structural_verdict`, `truth_verdict`, `comprehension_verdict`, `application_verdict`) so the audit fingerprint carries independent verdicts for each layer (form, truth, comprehension, behavior) instead of compressing them into one PASS/FAIL signal. `application_verdict` is the new primary quality signal — a skill is only behaviorally certified when this verdict is `APPLICABLE`. See [`adr/0011-split-audit-verdict-into-four-verdicts.md`](../docs/adr/0011-split-audit-verdict-into-four-verdicts.md). (The standalone `migrations/v6-to-v7.md` procedure was retired by [ADR 0014](../docs/adr/0014-canonical-only-schema-files.md); the narrative now lives in git history + ADR 0011.)
> - **v5 → v6** — flattens the `concept` block to top-level `mental_model`, `purpose`, `boundary`, `analogy`, `misconception`; adds the Health block (`last_audited`, `last_changed`, `audit_verdict` *[deprecated in v7]*, `eval_score`, `eval_failed_ids`, `lint_verdict`, `drift_status`) so a skill's audit fingerprint lives in frontmatter in that historical contract. Legacy `concept` block remains accepted for v5 skills not yet migrated. The standalone migration procedure was retired by ADR 0014; retrieve it through git history if needed.
> - **v4 → v5** — closes the `category` field to a 6-value enum
> - [v2 → v3](../docs/manifest-field-mapping.md#migration-note--v2--v3-v040) — `drift_check` scalar → object, `compatibility` scalar → object, `family` → `category`, new optional fields
> - [v1 → v2](../docs/manifest-field-mapping.md#migration-note--v1--v2-2026-04-17-sh-5784) — `scope` enum rename, `eval_status` split into three fields, `route_bundles` → `routing_bundles`
> - Historical codemods (`scripts/migrate-skill-vN-to-vM.js`) ran once per bump and were retired by ADR 0014. Recover a prior codemod through git history only when investigating old data; do not reintroduce per-version migrators to the live tree.

## Related Documents

| Document | Purpose |
|---|---|
| [`skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md`](SKILL_METADATA_PROTOCOL.md) | Normative public spec: required fields, semantic rules, authored vs generated fields, migration notes |
| `skill-metadata-protocol/design-rationale.md` (this file) | Rationale and deep explanation: body structure, requiredness groups, schema strictness rules, design tradeoffs |
| `skill-metadata-protocol/field-reference.md` | One section per authored field — purpose, rules, examples, when to use |
| `skill-metadata-protocol/field-decision-guide.md` | Decision tables for `scope`, `relations.*`, and the Evaluation Status fields (`eval_artifacts`, `eval_state`, `routing_eval`) / `portability` |
| `docs/concept-map.md` | Teaching map — 36 authored fields grouped by conceptual role; drift log vs earlier framings |
| `docs/manifest-field-mapping.md` | Authored-to-generated bridge: rename map, loss policy, worked example |
| `docs/adr/` | Architecture decision records — 0001 predicate set, 0002 JSON-LD @context, 0003 OntoClean rigidity tags, 0004 persistent identifiers |
| `schemas/skill.context.jsonld` | JSON-LD @context mapping every authored field to W3C vocabularies (SKOS, Dublin Core, PROV-O) |
| `schemas/vocabulary/` | Controlled vocabularies for `keywords` (canonical + synonyms) and `project` handles — advisory, surfaced as lint warnings |

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
| `schema_version`, `version`, `subject`, `deployment_target`, `scope`, `owner`, `freshness`, `drift_check`, `eval_artifacts`, `eval_state`, `routing_eval` | Skill Metadata Protocol extension | Required by the protocol; additive to the base |
| `relations`, `grounding`, `portability`, `triggers`, `keywords`, `examples`, `anti_examples`, `paths`, `project`, `repo`, `subjects`, `taxonomy_domain`, `routing_bundles`, `lifecycle`, `runtime_telemetry`, `stability`, `superseded_by` | Skill Metadata Protocol extension | Optional protocol enrichments; additive to the base |

A Skill-Metadata-Protocol-enriched `SKILL.md` is **not** a valid SKILL.md file as authored, because the protocol requires fields the base standard does not define. An export transform can produce an SKILL.md-valid file by moving every protocol extension field under the standard `metadata:` key. The transform is implemented as `scripts/export-skill.js`.

## Body Structure

Every skill body follows the section structure demonstrated by [`examples/skill-metadata-template.md`](../examples/skill-metadata-template.md), the canonical authoring specimen. At minimum a skill carries `## Coverage` (the scope map), `## Philosophy of the skill` (the methodological stance), `## Verification` (how to confirm the skill was applied correctly), and `## Do NOT Use When` (the negative boundary). `## Key Files` is recommended for skills that reference concrete repo files — prefer file paths with line ranges (`src/foo.ts:45-120`) over bare paths when the skill depends on a specific function or section. `## References` is recommended for skills that point at external reading.

### Relationship to wider skill-authoring doctrine

This minimum is Skill Metadata Protocol's own. When the protocol is adopted into a monorepo that already has a canonical authoring standard (e.g., a `canonical-standard` or `skill-scaffold` skill), the adopter's standard may impose additional required sections or stricter content rules on top of it. Skill Metadata Protocol does not replace such a standard — it provides the portable subset that every skill must satisfy regardless of which adopter's fuller doctrine also applies. If you are adopting Skill Graph into a repo with a `canonical-standard` skill, reference that skill's section canon instead of republishing a narrower one in your own repo docs.

## Requiredness Groups

These groups are documentation categories only. They do not require nested YAML.

### Required for all skills

```yaml
schema_version
name
description
version
subject
deployment_target
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
| `deployment_target: project` | `grounding` (schema-enforced) |
| Routable skills (label or language activation) | `keywords`; `triggers` and `paths` when routing explicitly depends on them |

### Optional enrichments

These improve portability, discoverability, and health tracking, but are not required for a valid Skill Metadata Protocol skill.

```yaml
paths
project
repo
taxonomy_domain
subjects
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
2. Keep the H2 structure demonstrated by the template (see **Body Structure** above).
3. Replace example values only with equally real, context-correct values.
4. Remove sections that are conditionally irrelevant rather than keeping them with fake content.
5. Leave `> **TEMPLATE NOTE:**` blockquotes and `# TEMPLATE NOTE:` YAML comments out of the new skill — they are authoring scaffolding, not skill content.

### Title casing convention

The H1 title at the top of each SKILL.md body is Title Case — every significant word capitalized — and it is the human-readable expansion of `name:`, not a duplicate. Single-word skills (`debugging` → `# Debugging`) capitalize the single word. Abbreviations and identifier-style names expand to their human form (`a11y` → `# Accessibility`, `graph-audit` → `# Graph Audit`). The `name:` field stays lowercase and hyphenated; the H1 is never used as a graph identifier.

### Description opener convention

Every `description:` field leads with a trigger clause — `"Use when …"` or an equivalent imperative — and names at least one explicit negative boundary with `"Do NOT use for …"`. Do not lead with the skill's own name as a noun (`"Debugging skill for …"`); the router already knows the name from the `name:` field, so the opener should spend its budget on when the skill activates, not on self-reference. A good opener names (a) the triggering situation, (b) the scope the skill covers, and (c) at least one concrete case where a different skill is correct instead.

## Anatomy

> **The question this diagram answers:** "What are the parts of a SKILL.md?"

Every Skill Graph SKILL.md is the same shape: a YAML frontmatter, a Markdown body, and — only in the canonical template specimen — a teaching layer that is stripped when the template is adapted. The field-level detail lives in the table below the diagram and in [`skill-metadata-protocol/field-reference.md`](field-reference.md); the body section structure lives in the [Body Structure](#body-structure) section above. This diagram shows only the compositional shape.

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

The YAML frontmatter uses the current v8 schema, including the flat Understanding fields, the four-verdict Audit Status, and the two publication-facet fields (`secondary_categories`, `marketplace_tier`) added in the May 2026 skill-org reorganization. The schema is the authoritative source for types and requiredness (`schemas/SKILL_METADATA_PROTOCOL_schema.json`); the canonical per-field reference is [`skill-metadata-protocol/field-reference.md`](field-reference.md). The table below is a navigable index. `always` = required by the base schema; `if <condition>` = conditionally required; blank = optional enrichment.

**v6 simplification (2026-05-17).** v6 flattens the seven-field `concept` block to top-level so the Understanding fields read like every other field in the Protocol. It also adds the first flat **Audit Status** so a skill's audit fingerprint lives in its own frontmatter instead of scattered across `eval-history.jsonl`, `health-ledger.jsonl`, and `.opencode/progress/skill-audit-*`. **v7 split (2026-05-19).** v7 replaces the single aggregate `audit_verdict` with four verdicts: `structural_verdict`, `truth_verdict`, `comprehension_verdict`, and `application_verdict`. The Skill Audit Loop reads these Audit Status fields directly; no log-file crawl required.

| Group | Field | Required? | Shape |
|---|---|---|---|
| **Identity** | [`name`](field-reference.md#name) | always | string |
| | [`urn`](field-reference.md#urn) | | persistent `urn:skill:<repo>:<skill-name>` identifier |
| | [`description`](field-reference.md#description) | always | string |
| | [`version`](field-reference.md#version) | always | semver string |
| | [`owner`](field-reference.md#owner) | always | string |
| **Classification** | [`schema_version`](field-reference.md#schema_version) | always | integer `8` |
| | [`subject`](field-reference.md#subject) | always | closed 12-value enum — primary classification |
| | [`subjects`](field-reference.md#subjects) | | ordered polyhierarchy array; first item matches `subject` (max 2) |
| | [`deployment_target`](field-reference.md#deployment_target) | always | `portable` \| `project` |
| | [`scope`](field-reference.md#scope) | always | free-text PRD-style statement |
| | [`taxonomy_domain`](field-reference.md#taxonomy_domain) | | hierarchical path subdividing `subject` |
| | [`stability`](field-reference.md#stability) | | `experimental` \| `stable` \| `deprecated` |
| | [`superseded_by`](field-reference.md#superseded_by) | if `stability: deprecated` | skill name |
| | [`marketplace_tier`](field-reference.md#marketplace_tier) | | `S` \| `A` \| `B` \| `C` (omit for unpublished; sourced from publication-priority docs) |
| **Health & Drift** | [`freshness`](field-reference.md#freshness) | always | ISO date |
| | [`drift_check`](field-reference.md#drift_check) | always | `{ last_verified, truth_source_hashes? }` |
| | [`lifecycle`](field-reference.md#lifecycle) | | `{ stale_after_days, review_cadence }` |
| | [`runtime_telemetry`](field-reference.md#runtime_telemetry) | | `{ feedback_source, metrics }` |
| **Audit Status** (v7+, flat) | [`last_audited`](field-reference.md#last_audited) | | ISO date |
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
| **Evaluation Status** (orthogonal triple) | [`eval_artifacts`](field-reference.md#eval_artifacts) | always | `present` \| `planned` \| `none` |
| | [`eval_state`](field-reference.md#eval_state) | always | `unverified` \| `passing` \| `monitored` |
| | [`routing_eval`](field-reference.md#routing_eval) | always | `present` \| `absent` |
| | [`comprehension_state`](field-reference.md#comprehension_state) | | `present` \| `absent` |
| **Understanding** (v6+, flat) | [`mental_model`](field-reference.md#mental_model) | if `comprehension_state: present` | string |
| | [`purpose`](field-reference.md#purpose) | if `comprehension_state: present` | string |
| | [`boundary`](field-reference.md#boundary) | if `comprehension_state: present` | string |
| | [`analogy`](field-reference.md#analogy) | if `comprehension_state: present` | string |
| | [`misconception`](field-reference.md#misconception) | if `comprehension_state: present` | string |
| | [`eval_last_run`](field-reference.md#eval_last_run) | | `{ at, status, runner?, model?, receipt?, receipt_hash? }` |
| **Activation & Routing** | [`keywords`](field-reference.md#keywords) | if routable | string[] |
| | [`triggers`](field-reference.md#triggers) | | string[] |
| | [`paths`](field-reference.md#paths) | | glob[] |
| | [`examples`](field-reference.md#examples) | | string[] (positive prompts) |
| | [`anti_examples`](field-reference.md#anti_examples) | | string[] (negative prompts) |
| | [`project`](field-reference.md#project) | | { handle, role }[] (replaces `workspace_tags`) |
| | `routing_bundles` _(retired SKI-286 — 0 acting consumer; see manifest-field-mapping.md)_ | | string[] |
| **Relations** | [`relations`](field-reference.md#relations) | | `{ adjacent, related, broader, narrower, boundary, disjoint_with, verify_with, depends_on }` |
| **Grounding** | [`grounding`](field-reference.md#grounding) | if `deployment_target: project` | `{ subject_matter, grounding_mode, truth_sources, failure_modes, evidence_priority }` |
| **Portability & Standards** | [`portability`](field-reference.md#portability) | | `{ readiness, targets }` |
| | [`license`](field-reference.md#license) | | SPDX identifier |
| | [`compatibility`](field-reference.md#compatibility) | | `{ runtimes?, node?, notes? }` |
| | [`allowed-tools`](field-reference.md#allowed-tools) | | space-separated string |

**Conditional requiredness in one line:** `grounding` when `deployment_target: project`, `superseded_by` when `stability: deprecated`, Understanding fields or `concept` when `comprehension_state: present`, and `eval_artifacts: present` when `eval_state` is `passing` or `monitored`. The schema enforces those rules via `allOf` / `anyOf`. `keywords` are recommended for routable skills and reviewed by routing review / routing evals, but they are not a required-field rule. For the decision tables that help you choose between `portable` / `project`, see [`skill-metadata-protocol/field-decision-guide.md`](field-decision-guide.md).

## Why the Evaluation Status is orthogonal (ADR 0001 + ADR 0006)

`eval_artifacts`, `eval_state`, and `routing_eval` are three fields that look like they could be one. They are deliberately separate because they answer three orthogonal questions about a skill's Evaluation Status:

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

The "honesty over green checkmarks" rule (documented at `skill-metadata-protocol/field-reference.md § routing_eval`) governs the `routing_eval` flip specifically: an author cannot claim `routing_eval: present` until `node scripts/skill-graph-routing-eval.js --skill <name>` returns verdict PASS. The OSS starter library currently sits at all-8-`present` (verified by `node scripts/skill-graph-routing-eval.js --only-asserted`).

For the field-by-field rationale and worked-example confusion-cases, see [`docs/field-rationale.md`](../docs/field-rationale.md).

## How JSON-LD context maps fields to W3C terms (ADR 0002)

Skill Metadata Protocol ships an optional JSON-LD `@context` at `schemas/skill.context.jsonld` that projects every authored field onto a W3C standard vocabulary term. This is the FAIR Interoperability layer (Wilkinson et al. 2016, DOI:10.1038/sdata.2016.18): a protocol-enriched skill loaded into a knowledge-graph consumer that already understands SKOS, PROV-O, OWL, or Dublin Core gets RDF-projectable semantics with no Skill-Metadata-Protocol-specific code.

The context is the source of truth for cross-vocabulary mapping. The most consequential mappings:

| Authored field | W3C term | Vocabulary | Why this term |
|---|---|---|---|
| `name` | `dcterms:identifier` | Dublin Core | Stable display-layer skill identity |
| `description` | `dcterms:description` | Dublin Core | Free-text subject summary |
| `version` | `dcterms:hasVersion` | Dublin Core | Skill content version (semver) |
| `freshness` | `dcterms:modified` | Dublin Core (xsd:date) | Author's claim of last-meaningful-review date |
| `taxonomy_domain` | `skos:broader` | SKOS | Hierarchical sub-path within a subject projects to a skos:broader chain |
| `relations.related` / `adjacent` | `skos:related` | SKOS | Symmetric associative relation between concepts |
| `relations.broader` | `skos:broader` | SKOS | Cross-skill generalisation (target is more general) |
| `relations.narrower` | `skos:narrower` | SKOS | Cross-skill specialisation (target is more specific) |
| `relations.boundary` | `sg:disjointOwnership` | Skill-Graph custom | Routing-layer asymmetric exclusion — intentionally weaker than OWL class-disjointness (per ADR 0006) |
| `relations.disjoint_with` | `owl:disjointWith` | OWL | Formal class-theoretic disjointness — distinct from `boundary` (per ADR 0006) |
| `relations.verify_with` | `prov:wasInformedBy` | PROV-O | Verifier skill informs this skill's claims |
| `relations.depends_on` | `dcterms:requires` | Dublin Core | Operational prerequisite |
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
- If you touched `skill-metadata-protocol/design-rationale.md` or `schemas/SKILL_METADATA_PROTOCOL_schema.json`, also update the other side so they remain in lockstep. Skill Metadata Protocol is the source of truth for semantics; the schema is the source of truth for machine enforcement. Drift between them is a bug.

## Relationship to Audit Tooling

Skill Metadata Protocol is designed to work with:

1. `skill-audit-loop/SKILL_AUDIT_LOOP.md` § Part 2
2. `skill-audit-loop/SKILL_AUDIT_LOOP.md`

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

The 40 top-level authored fields are listed in `schemas/SKILL_METADATA_PROTOCOL_schema.json`; aliases are included there so consumers can validate duplicate declarations consistently.

For the purpose, rules, and examples for each field, see `skill-metadata-protocol/field-reference.md`.

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

Skill Graph uses a single integer `schema_version` to signal authored skill contract evolution. Current authored skill version: **8** (bumped from 7 when `subject` + `deployment_target` replaced the v7 `type` / `category` / `scope` triple; the briefly-introduced v8 `operation` axis was further retired 2026-05-27, and `scope` was repurposed to required free text). The prior contract lives in git history; retrieve via `git show schema-v7:schemas/SKILL_METADATA_PROTOCOL_schema.json`. The five policy points together define when `schema_version` bumps, what consumers should expect, and where migration tooling lives:

1. **Breaking changes bump `schema_version`.** Renamed fields, removed fields, retyped fields, removed enum values, or tightened required-ness constraints bump the integer. Consumers must migrate or pin.
2. **Additive changes do not bump.** New optional fields, new enum values that extend (not replace) an enum, and new warning-only companion checks do not bump the version. Consumers on the prior minor release continue to pass.
3. **Validate against the canonical schema.** Per [ADR-0014](../docs/adr/0014-canonical-only-schema-files.md), `schemas/SKILL_METADATA_PROTOCOL_schema.json` and `schemas/manifest.schema.json` are the only schema files on disk — they track the current contract (`schema_version: 8` today; `7` is rejected by the live schema). Prior contract versions live in git history; consumers that need to pin against a historical version resolve via `git show <commit>:schemas/SKILL_METADATA_PROTOCOL_schema.json` or a `git tag schema-vN` if one exists.
4. **Manifest schema-file version and manifest root `schema_version` are separate surfaces.** The current manifest schema tracks v8 skill entries, but generated manifests still emit root field value `4` because earlier manifest changes were additive for consumers. `schemas/manifest.schema.json` validates that back-compatible root value explicitly.
5. **One-version-overlap deprecation is preferred.** Companion checks emit warnings (not errors) during migration windows where a deprecated shape can still be interpreted safely. Authors get a warning window to migrate. Hard-error enum/shape changes are rejected by `additionalProperties: false` + type constraints in the schema itself, with migration docs pointing at the rename.
6. **Migration tooling runs once per bump, then retires.** Per ADR-0014, line-based codemods (`scripts/migrate-skill-vN-to-vM.js`) walk the corpus once, then are deleted alongside their pinned-schema targets. The migration narrative for any historical bump lives in git log + the corresponding ADR; the codemod itself is not retained on disk.

For the concrete v2→v3 mapping tables, see `docs/manifest-field-mapping.md § Migration Note — schema_version 2 → 3`. For the v1→v2 tables (historical), see the same document. For field-level before/after pairs, see `skill-metadata-protocol/field-decision-guide.md`.

### Audit Status versioning (SH-6123)

**Audit Status fields are v6+.** The flat Health fields were introduced in v6 (`last_audited`, `last_changed`, `audit_verdict`, `eval_score`, `eval_failed_ids`, `lint_verdict`, `drift_status`) and expanded in v7 to split the single aggregate `audit_verdict` into four discrete verdicts (`structural_verdict`, `truth_verdict`, `comprehension_verdict`, `application_verdict`). Per ADR-0014, the canonical `schemas/SKILL_METADATA_PROTOCOL_schema.json` validates the v8 contract; prior contract versions (v5/v6/v7) live in git history. The historical compatibility points (for readers cross-checking older skills):

- v5 used `additionalProperties: false` and did not define Audit Status properties.
- v6 defined the seven-field aggregate Audit Status but did not include the four discrete verdicts.
- v7 introduced the four-verdict Audit Status (`structural_verdict`, `truth_verdict`, `comprehension_verdict`, `application_verdict`). Skills on v5/v6 frontmatter that contain these Audit Status fields are mid-migration: either bump them to the current contract (per-version codemods ran once and retired per ADR-0014; for a stuck skill use `git show <retire-commit>:scripts/migrate-skill-v6-to-v7.js` to recover the codemod) or strip the incompatible fields.

**Policy:** If the Skill Audit Loop walker stamps Audit Status fields onto a skill whose frontmatter declares a `schema_version` integer below 7 (v6 had a single aggregate `audit_verdict`, not the four-verdict block), the walker has written to the wrong schema tier. Correct the skill by migrating it to the current contract through the audit loop (per-version codemods retired alongside the pinned schemas per ADR-0014; the v5→v6, v6→v7, and v7→v8 transformations are documented in git history + the corresponding ADRs) rather than adding an exception to the schema. Audit Status fields are a v6+ contract; the four-verdict shape was introduced in v7.

**v7 doctrine: form gates are demoted.** In v7, `structural_verdict: FAIL` is reserved for external-constraint violations only (Anthropic Agent Skills marketplace shape, required-fields, valid YAML). Internal style preferences (title length below the external limit, body section preferences, naming conventions beyond what the marketplace enforces) emit lint warnings but do not produce `FAIL`. See [ADR 0011](../docs/adr/0011-split-audit-verdict-into-four-verdicts.md) Change 2.

## Stability Promotion Criteria (SH-6109)

`stability: stable` signals that a skill's content is settled and suitable for production dependence. The promotion criteria below are checked at **WARN level** (never ERROR) by `scripts/lint/check-stability-promotion.js`, exposed as `npm run stability:check` and wired into `npm run verify`. Run history: added as a `skill-lint.js` check in `7e0306d`, removed from `skill-lint.js` in `2bd8e64` (2026-05-19) when the lint surface narrowed to canonical-source mandates, library kept in place by `92978fb` (2026-05-20), CLI entrypoint + verify wiring added 2026-05-24. The script is intentionally separate from `skill-lint.js` because `stability` is a Skill Graph quality posture, not a schema or external-format requirement. Final promotion remains author judgment, audited by the Audit Status fields and the application-eval pipeline (gate 9); the gate just surfaces a warning when a skill claims `stability: stable` without meeting the five criteria.

A skill qualifies for `stability: stable` when it meets all five of the following:

| # | Criterion | Field(s) | Pass condition |
|---|---|---|---|
| 1 | Eval has been run | `eval_state` | Value is `passing` or `monitored` (not `unverified` or absent) |
| 2 | Eval score meets quality bar | `eval_score` | ≥ 4.0 on the 0.0–5.0 audit scale (≡ 80%) |
| 3 | Routing coverage evaluated | `routing_eval` | Value is `present` with a passing `skill-graph-routing-eval.js` receipt |
| 4 | Drift verified recently | `drift_check.last_verified` | ISO 8601 date within the last 90 days |
| 5 | Truth sources declared | `grounding.truth_sources` | Non-empty array; exempt when `deployment_target: portable` |

**Severity:** All findings from this check are warnings, not errors. This prevents 141 currently-experimental skills from breaking the lint run if any author prematurely sets `stability: stable`.

**When criterion 5 is exempt:** Skills with `deployment_target: portable` have no codebase tie-in by definition. They are exempt from criterion 5 because `grounding.truth_sources` is not meaningful for portable skills.

**To promote a skill:** Satisfy each criterion, then change `stability: experimental` to `stability: stable`. The lint run will emit no stability-promotion warnings once all five criteria are met.

**Implementation:** `scripts/lint/check-stability-promotion.js` (library + CLI), wired as `npm run stability:check` inside `npm run verify`. Tests: `scripts/__tests__/test-stability-promotion.js` (8 cases). Final promotion is author judgment, audited by reading the Audit Status fields directly; the gate surfaces premature-stable claims rather than blocking them.
