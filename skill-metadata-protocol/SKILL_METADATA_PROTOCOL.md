# Skill Metadata Protocol

> **Work-mode rule (read FIRST).** Editing this document, the schemas it normalizes against, the audit prompts, or the audit/lint/drift scripts is **SYSTEM work**. Editing individual `SKILL.md` files to conform to this contract is **CONTENT work** that runs ONLY via `/audit:audit`, `/audit:improve`, `/audit:evaluate`, `/audit:evolve`. Do not mix them in the same task or commit. Full doctrine: [`AGENTS.md` § Work Modes — SYSTEM vs CONTENT](../AGENTS.md#work-modes--system-vs-content).

> **Spec version:** 1.6.0 (`schema_version: 8`, Skill Graph 0.5.10)
> **Currently enforced by `schemas/SKILL_METADATA_PROTOCOL_schema.json`:** v8.
>
> Per [ADR-0019](../docs/adr/0019-audit-state-sidecar-separation.md), a skill is now **two files** joined into the compiled manifest:
>
> | File | Owns | Required fields |
> |---|---|---|
> | `SKILL.md` | Agent-facing routing and teaching content | `name`, `description`, `subject`, `public`, `scope` |
> | `audit-state.json` | Audit/eval/provenance state | `schema_version`, `owner`, `freshness`, `drift_check`, `eval_artifacts`, `eval_state`, `routing_eval` |
>
> See [§ Schema contract](#schema-contract) for the full field list and sidecar schema (`schemas/skill-audit-state.schema.json`).
> **Single source of truth for "what is enforced today":** [`SKILL_GRAPH.md § Current State`](../SKILL_GRAPH.md#current-state--single-source-of-truth) — link there from any doc that needs the live answer; do not restate.
> **Machine-readable schema:** `schemas/SKILL_METADATA_PROTOCOL_schema.json`
> **Detailed field reference:** `skill-metadata-protocol/field-reference.md`
> **Full semantics + design rationale:** `skill-metadata-protocol/design-rationale.md`
> **v8 design rationale:** `docs/adr/0017-five-axis-classification-model.md` (operation axis retired 2026-05-27, see amendment block)
> **Prior contract:** retrievable via `git show schema-v7:schemas/SKILL_METADATA_PROTOCOL_schema.json`; not accepted by the live schema.

---

> **Author shortcut (TL;DR):**
>
> | Step | Field group | Write |
> |---|---|---|
> | 1 | Required classification | `subject` (12-value enum), `public` (boolean — publishability/private-data gate), and free-text `scope` |
> | 2 | Optional polyhierarchy | `subjects[]` when a skill genuinely spans two browse shelves, primary first, max 2 |
> | 3 | Activation | `keywords`, `triggers`, `examples`, and `anti_examples` |
> | 4 | Routing graph | `relations.related`, `boundary`, `verify_with`, `depends_on`, `broader`, `narrower`, and `disjoint_with` |
>
> Full schema-contract explanation is at the end of this doc: [§ Schema contract](#schema-contract).

---

This document is the top-level public contract for the two-file Skill Metadata Protocol shape — the **normative spec**. It defines which fields are required in `SKILL.md` and `audit-state.json`, what each field means in operational terms, which fields are authored by humans vs computed by tooling, and how to migrate from older schema versions. Skill Graph is the library-level system that consumes this contract. The prose is terse and boundary-aware: every clause is a rule a consumer or author can verify against the schema and the focused Skill Graph verification tools.

**Companion docs by genre.** This contract is the *what*. The *why* — design rationale, archetype semantics, OntoClean rigidity, the Evaluation Status's orthogonality, the JSON-LD W3C mappings, and the philosophical posture behind the field choices — lives in [`skill-metadata-protocol.md`](design-rationale.md). The two docs are coordinated and grow together: a normative rule that lacks a "why" is fragile; a "why" that lacks a normative rule is vapourware. If you are authoring a SKILL.md, you read this file. If you are deciding whether to add a field to the schema, you read both.

---

## Charter — Rules & Goal

**Mission & Vision** are shared across all three layers (Skill Metadata Protocol, Skill Audit Loop, Skill Graph); the canonical statement is [`AGENTS.md § Mission and Vision`](../AGENTS.md#mission-and-vision). This section records the **Protocol layer's** own Rules and Goal, so an agent editing this contract knows what it is bound by and what it is for.

### Rules

1. **The schema is the binding machine contract.** If this prose and `schemas/SKILL_METADATA_PROTOCOL_schema.json` disagree, the schema wins and the prose is corrected — never the reverse.
2. **Every authored skill declares the two required classification axes:** `subject` (closed 12-value enum) and `public` (boolean — the publishability / private-data gate: `true` = safe for the public skills.sh release, `false` = carries private API keys / personal / customer / internal-operational data and must not be published).
3. **`scope` is a required free-text statement** of what the skill teaches and what it does not. It is not an enum and never carries publishability values — that role belongs to `public`.
4. **A project-anchored skill (non-empty `project[]`) must declare a `grounding` block**, and that block names what it is grounded in via `grounding.subject_matter`. (Publishability — `public` — is an independent axis: a skill is private because it carries private data, not because it is project-coupled.)
5. **Subdivide and affiliate with the current fields:** `taxonomy_domain` (slash-delimited) subdivides a crowded `subject`; `project[]` (frontmatter) and `repo[]` (sidecar-owned per ADR-0019) carry belonging-entity references (and `project[]` presence is what triggers the `grounding` requirement).
6. **The canonical library is authored in the Agent-Skills-compatible nested `metadata:` encoding;** the protocol also documents the flat encoding for direct adopters, and the normalizer reads both shapes so every deterministic tool sees one logical contract while the corpus migrates field names.
7. **`relations.suppresses: [X]` means "exclude X from co-routing when this skill wins."** Write the reason as ownership ("I own this exclusively over X"), never as deference ("use X instead"). Legacy `relations.boundary` means the same thing and is accepted only for unmigrated skills.
8. **Version labels are earned by content, never bumped for convenience.** Advancing `schema_version` (or any `vN`) without doing the migration that version represents is fake conformance.
9. **Audit Status fields are owned by the audit and evaluation tooling.** Never hand-stamp `application_verdict: APPLICABLE` (or any proof field) without an eval receipt.
10. **Public exports must not leak repo-private paths, project secrets, PII, or internal-only doctrine.**

### Goal

Be the default open-source structure for project-relevant AI-agent skills: simple enough to author, strict enough to validate, and expressive enough to make a `SKILL.md` useful for a real codebase instead of a generic prompt snippet. Near-term: keep this doc, `schemas/SKILL_METADATA_PROTOCOL_schema.json`, `schemas/manifest.schema.json`, and `skill-metadata-protocol/field-reference.md` in exact agreement, and keep the public skill shape Agent-Skills-compatible while preserving the richer local metadata that routing and audit depend on.

---

## Contents

0. [Charter — Rules & Goal](#charter--rules--goal)
1. [Overview](#overview)
2. [Required vs Optional Fields](#required-vs-optional-fields)
3. [Semantic Rules by Field Group](#semantic-rules-by-field-group)
   - [Identity](#identity)
   - [Classification](#classification)
   - [Health and Drift](#health-and-drift)
   - [Evaluation Status](#evaluation-status)
   - [Activation and Routing](#activation-and-routing)
   - [Relations](#relations)
   - [Grounding](#grounding)
   - [Portability and Standards](#portability-and-standards)
4. [Authored vs Generated Fields](#authored-vs-generated-fields)
5. [Design Constraints](#design-constraints)

---

## Overview

Every skill is a `SKILL.md` file with YAML frontmatter plus a sibling `audit-state.json` sidecar. The frontmatter schema contract is `schemas/SKILL_METADATA_PROTOCOL_schema.json`; the sidecar schema contract is `schemas/skill-audit-state.schema.json`; deterministic verification is split across focused tools. `skill-lint.js` enforces the canonical-source schema gate (valid frontmatter, valid sidecar, identifier shape, non-empty description, parent-directory/name alignment, and cross-file checks), while `check-protocol-consistency.js`, `generate-manifest.js`, routing evals, drift checks, and export verification cover the broader protocol surface. The `generate-manifest.js` script joins frontmatter and sidecars from all skill files and emits a single `skills.manifest.json`.

The contract has one runtime model: one `SKILL.md` per skill, one manifest, one lint pass. There is no closed/open split, no private control plane, and no enterprise-only fields.

### Two physical encodings, one logical contract

The field tables in this document describe the **logical contract** — the field set, types, and semantics. That logical contract has **two valid physical encodings on disk**, and the tooling normalizes both before reading:

| Encoding | Shape | Where it is used |
|---|---|---|
| **Protocol-native (flat) — AUTHORED** | Every agent-facing field is a top-level YAML key in `SKILL.md`; structured frontmatter fields (`relations`, `grounding`, …) are native YAML objects/arrays. Audit/eval/provenance fields live in `audit-state.json`. | **The authored canonical source shape** — what authors write and what the field tables below illustrate; produced by the authoring template. |
| **Agent-Skills-compatible (nested) — GENERATED** | Only `name`, `description`, `license`, `compatibility`, `allowed-tools` at top level; **all other fields nested under a `metadata:` map, with objects and arrays JSON-string-encoded** (e.g. `relations: "{\"suppresses\":[…]}"`). | **A build artifact**, not an authoring shape: the exporter (`scripts/export-marketplace-skills.js` → `export-skill.js`) *generates* it from the flat source for the public Agent-Skills release (one repo, two hats — see `AGENTS.md § Public Distribution`). |

`scripts/lib/parse-frontmatter.js::normalizeFrontmatter()` reads both: it lifts any `metadata.*` back to top level and `JSON.parse`s stringified values, so `skill-lint.js`, `generate-manifest.js`, `skill-graph-route.js`, and `skill-graph-drift.js` all see the protocol-native shape regardless of which encoding a file currently uses (the corpus is mid-migration from nested to flat — that migration is CONTENT-mode backlog the audit loop drains, never a defect in the contract). Two precedence rules apply: (1) a top-level field wins over a `metadata.*` field of the same name (the explicit author signal wins); (2) export-provenance keys (`skill_graph_source_repo`, `skill_graph_protocol`, `skill_graph_project`, `skill_graph_canonical_skill`, and the description-length book-keeping keys) are **stripped** during normalization and are not part of the contract — a consequence is that the `skill_graph_protocol` content-label is invisible to all deterministic tooling and is governed by human discipline only (see `AGENTS.md § Version Labels Are Earned, Not Bumped`). The nested encoding is a generated export, not a round-trip source; keep the flat canonical source authoritative. See `docs/SKILL-MD-FORMAT-COMPATIBILITY.md`.

### One repo, two hats — the canonical library

The on-disk skill library at `~/Development/skills/` is **one physical repo wearing two hats**:

1. **Hat 1 — Canonical authoring source.** The protocol-toolchain in `skill-graph/` reads SKILL.md files from this repo (via `.skill-graph/config.json` → `skill_roots: ["../skills/skills"]`) to run lint, manifest generation, routing, drift checks, and audits. The authored shape here is the **flat protocol-native encoding** (every field a top-level key); the normalizer also accepts the legacy nested shape while the corpus finishes migrating flat.
2. **Hat 2 — Public Agent-Skills release.** The same repo is published to `https://github.com/jacob-balslev/skills` and indexed at `https://www.skills.sh/jacob-balslev/skills/`. The Agent-Skills format only honours `name`, `description`, `license`, `compatibility`, `allowed-tools` at the top level; everything richer must be nested under `metadata:`. The exporter **generates** that nested form from the flat source during the release sync — authors never hand-write it. The full publish protocol is in `skill-graph/AGENTS.md § Public Distribution — Canonical URL Contract`.

Authors of new skills write the **flat protocol-native encoding** (the template's shape); the exporter produces the nested Agent-Skills form for hat 2 at release time. The normalizer keeps deterministic tooling reading one logical contract from both shapes during the flat migration.

### Two files per skill: `SKILL.md` + `audit-state.json` (ADR-0019)

Distinct from the two *encodings* above (which are two shapes of the same frontmatter), a skill is **two files on disk**:

| File | Holds | Who reads it | Schema |
|---|---|---|---|
| **`SKILL.md`** frontmatter | The 25 agent-facing fields — what the everyday agent reads to **find, understand, and execute** the skill: `name`, `description`, `subject`/`subjects`/`taxonomy_domain`, `public`, `scope`, `grounding`, `project`, the activation surfaces (`keywords`/`triggers`/`examples`/`anti_examples`/`paths`), `relations`, the five flat Understanding fields, `stability`/`superseded_by`, `license`, `compatibility`, `allowed-tools`. `required`: `name`, `description`, `subject`, `public`, `scope`. | every consumer + the everyday agent | `schemas/SKILL_METADATA_PROTOCOL_schema.json` |
| **`audit-state.json`** (sidecar, skill-folder root) | The 30 audit/eval/provenance fields — the Skill Audit Loop's records *about* the skill: `schema_version`, `version`, `owner`, `urn`, `repo`, `freshness`, `drift_check`, the `eval_*` triple, the four Audit Status verdicts (`structural`/`truth`/`comprehension`/`application`), `comprehension_state`, `lifecycle`, `marketplace_tier`, `portability`, `runtime_telemetry`, `skill_graph_protocol`, `model_run_coverage`. `required`: `schema_version`, `owner`, `freshness`, `drift_check`, `eval_artifacts`, `eval_state`, `routing_eval` (`version` optional). | the audit loop (`/audit:*`) only — written by it, never read by the everyday agent | `schemas/skill-audit-state.schema.json` |

The split *is* the SYSTEM/CONTENT boundary made physical: the sidecar is audit-loop output, the frontmatter is the agent-facing contract. The compiled manifest **joins** the two (`generate-manifest.js` merges the sidecar under the frontmatter before building each entry) so the router's quality and staleness gates read the same `health`/`eval`/`lifecycle` projections as before — the SOURCE changed, the manifest SHAPE did not. Three gates that used to live in the frontmatter schema's `allOf` are now expressed where they belong post-split: `eval_state ∈ {passing, monitored} ⇒ eval_artifacts: present` stays intra-sidecar; `comprehension_state: present` (sidecar) ⇒ the five flat Understanding fields (frontmatter) and `stability: deprecated` (frontmatter) ⇒ `superseded_by` (frontmatter) are **cross-file lint checks** in `skill-lint.js`. The prior single-file contract is recoverable via `git tag schema-v8`.

### Where does my skill live? (decision tree)

Map the v8 `subject` axis to the on-disk directory under `~/Development/skills/skills/`. **Updated 2026-05-26 — F23 reorg landed; directory names now match v8 subjects 1:1.** The 47 previously-nested skills (e.g., `engineering/data/<name>/`, `agent/context/<name>/`) were flattened to `<v8-subject>/<name>/`:

| If `subject:` is… | Directory | Band / Notes |
|---|---|---|
| `backend-engineering` | `skills/backend-engineering/<name>/` | Band A. Server-side construction: APIs, async/jobs, runtime, protocols, integration-as-code. |
| `frontend-engineering` | `skills/frontend-engineering/<name>/` | Band A. Client/UI construction in a web framework: components, rendering, state, hooks, routing. Boundary with `design`: implementation (rendering, state, hooks) → here; design judgment (composition, hierarchy, typography) → `design`. |
| `software-architecture` | `skills/software-architecture/<name>/` | Band A. Shape before code: boundaries, contracts, ADRs, tech selection, event/domain + conceptual/ER/state modeling. |
| `data-engineering` | `skills/data-engineering/<name>/` | Band A. Data tier: schema/migration, indexing, replication, sharding, transactions, query/connection tuning. |
| `agent-ops` | `skills/agent-ops/<name>/` | Band B. The agent *runtime*: loops, context windows, skill infrastructure, dispatch, tool-call protocol, monitoring. |
| `ai-engineering` | `skills/ai-engineering/<name>/` | Band B. LLM *features in a product*: prompt design, evals, generative UI, guardrails, tool-use strategy, summarization. |
| `quality-assurance` | `skills/quality-assurance/<name>/` | Band C. Verifying *properties*: testing, a11y, performance, security, type-safety, code review. |
| `design` | `skills/design/<name>/` | Band C. Human-facing design craft: visual systems, typography, interaction, UX, design research, content/microcopy. |
| `reasoning-strategy` | `skills/reasoning-strategy/<name>/` | Band C. Generic thinking + business/market strategy: decision quality, mental models, competitive strategy, negotiation. |
| `software-engineering-method` | `skills/software-engineering-method/<name>/` | Band C. Engineering process discipline: spec/test-driven dev, debugging method, prioritization, refactor, version-control, doc discipline. |
| `knowledge-organization` | `skills/knowledge-organization/<name>/` | Band C. Structuring meaning: taxonomy, ontology, semantics, classification, linguistics, knowledge/concept modeling. |
| `product-domain` | `skills/product-domain/<name>/` | Band C. Genuine external product/market verticals: ecommerce platforms, marketplaces, fulfillment, vendor playbooks. Floor-exception (3) per ADR-0020 — recruit to ≥5 or fold. |

Live per-subject counts: [`SKILL_GRAPH.md § Current State`](../SKILL_GRAPH.md#current-state--single-source-of-truth) (never restated inline). The 12-shelf set is [ADR-0020](../docs/adr/0020-twelve-shelf-competency-reaxis.md).

**Naming convention.** Directory name = skill `name:` value (kebab-case, head-noun-anchored). The `skill-lint.js` parent-dir alignment check enforces this. The directory always mirrors `subject` 1:1 — a `subject` change is also a `git mv` of the folder.

> **Layout history.** Pre-2026-05-26 the canonical library used a v7 6-directory layout (`agent / design / engineering / foundations / product / quality`) with v8 subjects living only in frontmatter. F23 from the 2026-05-25 audit (SH-6481) recommended flattening to v8 subject names; the codemod ran 2026-05-26 (`/tmp/migrate-skill-layout-v7-to-v8.js`, 148 git-mv operations + 1 manual move for the untracked `playing-to-win` skill). Pre-reorg paths are reachable via git history.

### Inline field comments — the authoring convention

**Every authored frontmatter field carries a YAML comment block (`#`) immediately above it.** The comment names: (a) what the field is, (b) allowed values or type, (c) when-to-use in one line. **These comments STAY in the production SKILL.md** — they are not scaffolding to strip. Cold-start agents and human authors decode the frontmatter at the point of contact, not three docs away. Co-located documentation is the discipline that prevents the "this field looks like dead code, let me propose deleting it" failure mode — fields with low corpus adoption (e.g. `eval_state: monitored` at 0%) may be forward-looking or genuinely scoped, and the comment makes that intent visible.

**Two distinct comment styles coexist in the template — they have opposite lifecycles. Do not confuse them.**

| Style | Lifecycle | Example | Purpose |
|---|---|---|---|
| **Field-purpose comment** | **STAYS in the production skill.** | `# subject: primary browse shelf — the competency the skill teaches.`<br>`# backend-engineering / frontend-engineering / software-architecture / data-engineering / agent-ops / ai-engineering / ...` | Authoritative-by-co-location documentation of what the field is for, its allowed values, and when to pick each value. The reader does not need to open `skill-metadata-protocol/field-reference.md` to understand the frontmatter. |
| **`# TEMPLATE NOTE:` comment** | **STRIPPED on derivation.** | `# TEMPLATE NOTE: be pushy in your description — Claude tends to under-trigger skills...` | Authoring scaffolding that only lives in `examples/skill-metadata-template.md`. Derived skills MUST strip every line beginning with `# TEMPLATE NOTE:` before commit (verified with `grep -n "TEMPLATE NOTE" <derived-skill>` returning zero hits). |

**Source of truth** for the content of a field-purpose comment is `skill-metadata-protocol/field-reference.md`. The inline comment is an abridged summary (purpose + enum + when-to-use). When the comment and the reference doc disagree, the reference doc wins and the comment gets corrected. The discipline mirrors how JSDoc / TSDoc summaries point at canonical type definitions — the comment is a fast lookup, not a parallel truth.

**Worked example** — what a complete field section looks like in a derived SKILL.md:

```yaml
# === Classification (subject + public; polyhierarchy via subjects[]) — see ADR-0020 ===

# subject: primary browse shelf — the competency the skill teaches. One of twelve closed values:
# backend-engineering / frontend-engineering / software-architecture / data-engineering /
# agent-ops / ai-engineering / quality-assurance / design / reasoning-strategy /
# software-engineering-method / knowledge-organization / product-domain.
subject: reasoning-strategy

# public: publishability / private-data gate (boolean). true = safe for the public skills.sh
# release; false = carries private API keys / personal / customer / internal-operational data
# and must NOT be published. Project anchoring (and the grounding requirement) is a separate
# axis carried by project[] — not by this field.
public: true

# scope: required free-text PRD-style statement of what the skill teaches and what it does not.
# Not an enum (the publishability role belongs to `public`).
scope: "Teaches first-principles decomposition; not for routine refactors."

# keywords: semantic phrases for fuzzy router activation. v8 cap: max 10.
keywords:
  - first principles
  - root assumption
  - decomposition
```

**The convention applies to `SKILL.md` frontmatter fields** across all three named layers of the skill system: the Skill Metadata Protocol (this contract), the Skill Graph (the library-level system), and the Skill Audit Loop (the maintenance discipline). JSON sidecars cannot carry comments, so sidecar field purpose lives in `field-reference.md` and the sidecar schema. Templates and authored skills under any of those layers carry field-purpose comments by default. The template `examples/skill-metadata-template.md` is the canonical specimen; derived skills inherit the field-purpose comments (and strip the `# TEMPLATE NOTE:` lines) per the workflow in `skill-scaffold` (`~/Development/skills/skills/agent-ops/skill-scaffold/SKILL.md`).

**Why this exists.** The 2026-05-26 cleanup session surfaced the exact failure mode this convention prevents: a cold-start agent read the schema's distribution of `eval_state` values (`unverified: 144 / passing: 7 / monitored: 0`) and proposed cutting `monitored` as "dead value" — because the field's design intent (a forward state for cadenced runs) lived only in `docs/field-rationale.md`, three reads away from where the field actually appeared. With co-located comments, that intent is visible at the point where the field is read. The cost of reading the field-purpose comment is one screenful of YAML; the cost of NOT having it is an entire session of misguided cut-proposals.

---

## Required vs Optional Fields

### Required for all skills

The v8 contract is split across two files. `SKILL.md` frontmatter requires five agent-facing fields. The sibling `audit-state.json` sidecar requires seven audit/eval/provenance fields. `skill-lint.js` validates both files and runs the cross-file checks that neither JSON Schema can express alone.

Required in `SKILL.md` frontmatter:

| Field | Type | Purpose |
|---|---|---|
| `name` | string | Stable identifier. Used for routing and `relations.*` targets. |
| `description` | string | Short description of what the skill is about. Activation signals belong to `keywords`/`triggers`/`examples`/`anti_examples`; exclusion semantics belong to `relations.suppresses` (legacy `relations.boundary` is a deprecated alias; see § Relations § `suppresses`). |
| `subject` | enum (12 closed values) | Primary classification — the competency the skill teaches. One of: `backend-engineering`, `frontend-engineering`, `software-architecture`, `data-engineering`, `agent-ops`, `ai-engineering`, `quality-assurance`, `design`, `reasoning-strategy`, `software-engineering-method`, `knowledge-organization`, `product-domain`. See § Classification. |
| `public` | boolean | Publishability / private-data gate. `true` = safe for the public skills.sh release; `false` = carries private API keys / personal / customer / internal-operational data and must not be published. The single switch the marketplace exporter filters on. Project anchoring is a separate axis (`project[]`). See § Classification. |
| `scope` | string | PRD-style free-text statement of what the skill teaches and what it does not. Not an enum. |

Required in `audit-state.json`:

| Field | Type | Purpose |
|---|---|---|
| `schema_version` | integer `8` | Signals the current sidecar/schema contract. Prior versions live in git history (see ADR 0014 — canonical-only schema files, and `git tag --list 'schema-*'`). |
| `owner` | string | Team, username, or tool that is responsible for keeping this skill current. |
| `freshness` | ISO date | Date the skill body was last reviewed or updated. |
| `drift_check` | object | Contains `last_verified` (ISO date) and optional `truth_source_hashes`. |
| `eval_artifacts` | enum | One of: `none`, `planned`, `present`. |
| `eval_state` | enum | One of: `unverified`, `passing`, `monitored`. |
| `routing_eval` | enum | One of: `absent`, `present`. |

### Conditionally required

These fields are required only when a specific condition is met. The frontmatter schema enforces `grounding`; the sidecar schema enforces the `eval_state` / `eval_artifacts` coherence rule; `skill-lint.js` enforces cross-file conditions such as `comprehension_state` requiring Understanding prose. `keywords` are recommended activation evidence for routable skills, but they are not a required-field rule.

| Field | Required when | Enforced by |
|---|---|---|
| `grounding` | non-empty `project[]` (project-anchored) | frontmatter schema `allOf` |
| `superseded_by` | `stability: deprecated` | cross-file lint / frontmatter lint |
| `mental_model` + `purpose` + `concept_boundary` + `analogy` + `misconception` | `comprehension_state: present` in `audit-state.json` | cross-file lint |
| `eval_artifacts: present` | `eval_state: passing` or `eval_state: monitored` | sidecar schema `allOf` |

### Optional (strongly recommended)

Not schema-required, but most useful skills include these:

```yaml
stability       # experimental | stable | frozen | deprecated
license         # SPDX identifier (e.g. MIT, Apache-2.0)
keywords        # string[] — recommended semantic phrases for discovery; max 10
triggers        # string[] — exact match activation phrases
relations       # typed edges to sibling skills
                # relations.suppresses EXCLUDES the listed skills from co-routing
                # when THIS skill wins (it does NOT defer to them). Write reason
                # text as ownership ("I own this exclusively over X"), never
                # deference ("use X instead"). relations.boundary is the deprecated
                # alias the router falls back to. See § Relations § `suppresses`
                # for the full warning and rationale.
```

### Optional (enrichment)

These improve portability, discoverability, and health tracking but are not required for a valid skill.

```yaml
subjects        # string[] (max 2, primary first) — polyhierarchy when a skill genuinely spans two browse shelves. Same enum as `subject`. See § Classification.
urn             # globally unique URN
taxonomy_domain # hierarchical taxonomy sub-path (e.g. "ecommerce/integrations/shopify") — renamed from `domain` in the 2026-05-27 amendment
paths           # glob[] — code surfaces this skill governs
dependencies    # string[] — packages a codebase must use for this skill to be
                # relevant (codebase-fingerprint signal; e.g. next, tailwindcss).
                # NOT relations.depends_on (skill-to-skill) and NOT compatibility
                # (the skill's own runtime envelope).
examples        # string[] — positive activation prompts
anti_examples   # string[] — negative activation prompts (wrong-skill training)
project         # { handle, role }[] — projects this skill belongs to (replaces the removed `workspace_tags`)
                # NOTE: the companion `repo` ({ handle, url }[]) is SIDECAR-owned (audit-state.json, ADR-0019), not frontmatter
portability     # { readiness, targets }
lifecycle       # { stale_after_days, review_cadence }
runtime_telemetry  # { feedback_source, metrics }
model_run_coverage # per-model audit-loop participation matrix; coverage evidence, not a verdict
comprehension_state # absent | present
# Understanding fields (v6+, flat) — required when comprehension_state: present
mental_model    # string — primitives and their relationships
purpose         # string — the problem this concept solves
concept_boundary # string — what this concept is NOT (with mechanism, not just label).
                # Canonical name (ADR-0018); top-level `boundary` is the deprecated
                # alias the normalizer maps to `concept_boundary`.
analogy         # string — one-sentence metaphor preserving the core mechanism
misconception   # string — the wrong mental model people bring
concept         # DEPRECATED in v6 — legacy v5 nested block; back-compat only
# Audit Status (flat) — written by the audit loop, not hand-authored
last_audited            # ISO date — when `audit` last ran
last_changed            # ISO date — when the SKILL.md was last edited
# Four-verdict Audit Status:
structural_verdict      # PASS | PASS_WITH_FIXES | FAIL | UNVERIFIED (form roll-up, gates 1-2, 7)
truth_verdict           # PASS | DRIFT | BROKEN | UNVERIFIED (truth roll-up, gates 3-6)
comprehension_verdict   # PASS | SHALLOW | REDUNDANT | UNVERIFIED | PROVISIONAL | SKIPPED_BASELINE_HIGH | NA
                        # (gate 8 — cheap smoke test only, never alone certifying)
application_verdict     # APPLICABLE | PROVISIONAL | NOT_DISCRIMINATED_CEILING |
                        # EQUIVALENT_ON_FRONTIER | REDUNDANT | HARMFUL | MIXED |
                        # FALSE_POSITIVE | UNVERIFIED
                        # (gate 9, primary quality signal — a skill is only behaviorally certified
                        #  when this verdict is APPLICABLE)
eval_score              # number 0.0–5.0 — latest aggregate eval grade
eval_failed_ids         # string[] — failing eval IDs (empty when clean)
lint_verdict            # PASS | FAIL | UNKNOWN (per-script signal from skill-lint.js)
drift_status            # OK | DRIFT | BROKEN | STALE | NO_BASELINE | EXTERNAL_UNHASHED | UNKNOWN (per-script signal from skill-graph-drift.js)
eval_last_run   # { at, status, runner?, model?, receipt?, receipt_hash? }
compatibility   # protocol-native: { runtimes, node, notes }; Agent-Skills-compatible physical encoding may keep the base-field string
allowed-tools   # space-separated tool allowlist
```

---

## Semantic Rules by Field Group

### Identity

**`name`**
- Pattern: `^[a-z0-9][a-z0-9-/:]*$` — lowercase alphanumerics, hyphens, forward slashes, and colons.
- Must match the parent directory name when possible so plain `SKILL.md` export can use the directory as the canonical identifier.
- Other skills reference this skill using the `name` value in their `relations.*` arrays.

**`description`**
- An about-statement, not a routing contract (doctrinal change 2026-05-27, commit `f88603d`, per owner feedback). Keep it short and topical: what the skill is about.
- Activation, trigger, and exclusion semantics belong to the dedicated fields built for them: `keywords`/`triggers` for activation signals, `examples`/`anti_examples` for prompt-level coverage, `relations.suppresses` for routing-layer exclusion edges.
- The `## Coverage` section inside the body carries the full scope detail; the frontmatter `scope` field carries the PRD-style teaches/does-not statement.
- Corpus note: many skills still carry the pre-2026-05-27 `"Use when… Do NOT use for…"` routing-contract shape — that is CONTENT-mode migration backlog the audit loop drains per-skill, not current authoring guidance.

**`version`**
- Semver format: `x.y.z`. Bumped when the skill's instructional content changes.
- Independent of `schema_version` — the schema version signals the contract shape; the skill version signals the content revision.

**`owner`**
- A team handle, GitHub username, or tool name (e.g. `skill-bot`).
- Consumers use this to route review requests and alert on stale skills.

### Classification

> **v8 is the canonical classification.** The schema's global `required` array mandates `subject` + `public` + `scope`; `scope` is required free text, not an enum. See [ADR 0017](../docs/adr/0017-five-axis-classification-model.md) (operation axis retired 2026-05-27; `deployment_target` enum replaced by the boolean `public` gate — see ADR amendment block).

Skills are classified on three required authored facets — `subject` (what is taught), `public` (is it safe to publish), and `scope` (what is in and out) — plus typed `relations` to other skills and two activation surfaces (`keywords` for fuzzy match, `triggers`/`examples`/`anti_examples` for explicit signals). The optional `subjects[]` array (max 2 entries, primary first) covers polyhierarchy when a skill genuinely spans two browse shelves; the optional `taxonomy_domain` field (slash-delimited sub-path) provides finer-grained subdivision *within* a subject. Project anchoring (and the `grounding` requirement) is carried independently by `project[]`.

| Axis | Type | Required | Purpose |
|---|---|---|---|
| **`subject`** | closed 12-enum | yes | Primary classification — the competency the skill teaches |
| **`public`** | boolean | yes | Publishability / private-data gate — is the skill safe for the public release |
| **`scope`** | free-text | yes | PRD-style statement of what the skill teaches and what it does not |
| **`keywords`** | ≤10 strings | recommended | Fuzzy agent activation |
| **`relations`** | typed edges | recommended | Prerequisite + clustering graph |

#### `subject` (12 closed values)

The primary browse shelf and routing seed — the competency the skill teaches ("what does this teach you to do?"). Closed 12-value enum in 3 navigational bands (see [ADR-0020](../docs/adr/0020-twelve-shelf-competency-reaxis.md)). Balance rule: each subject holds 5–25 skills; <5 = fold or recruit, >25 = subdivide via `taxonomy_domain`.

| Value | Teaches | Does NOT hold |
|---|---|---|
| `backend-engineering` | Server-side construction: APIs, async/jobs, runtime, protocols, integration-as-code | Backend *properties* (perf/security → `quality-assurance`); shape-before-code (→ `software-architecture`); render-coupled server code (→ `frontend-engineering`) |
| `frontend-engineering` | Client/UI construction in a web framework: components, rendering, state, hooks, routing, streaming UI | Visual/UX design (→ `design`); a11y/perf *as a property* (→ `quality-assurance`) |
| `software-architecture` | System shape before code: boundaries, contracts, ADRs, tech selection, event/domain + conceptual/ER/state modeling | Implementing the chosen store/API (→ `backend-engineering`); modeling *of meaning/vocabulary* (→ `knowledge-organization`) |
| `data-engineering` | Data tier: persistence schema/migration, indexing, replication, sharding, transactions, query/connection tuning | Data viz/analytics readout; architectural boundary modeling (→ `software-architecture`) |
| `agent-ops` | Building/operating the agent **runtime**: loops, context windows, skill infrastructure, dispatch, tool-call protocol, monitoring | An LLM **product feature** (→ `ai-engineering`); generic reasoning (→ `reasoning-strategy`) |
| `ai-engineering` | Building **AI/LLM features into a product**: prompt design, evals, generative UI, AI safety/guardrails, tool-use strategy, summarization | Operating the agent harness (→ `agent-ops`); deterministic testing (→ `quality-assurance`) |
| `quality-assurance` | Verifying *properties* of a system: testing, a11y, performance, security, type-safety, code review | How to *build* the thing (→ engineering shelves); how to *reason* (→ `reasoning-strategy`) |
| `design` | Human-facing design craft: visual systems, typography, interaction, UX, design research, content/microcopy | Front-end *implementation* of a design (→ `frontend-engineering`); information *taxonomy/semantics* (→ `knowledge-organization`) |
| `reasoning-strategy` | Generic thinking + business/market strategy applied to any problem: decision quality, mental models, competitive strategy, negotiation | Engineering process method (→ `software-engineering-method`); classifying/naming knowledge (→ `knowledge-organization`) |
| `software-engineering-method` | Process discipline for doing engineering well: spec/test-driven dev, debugging method, prioritization, refactor, version-control, doc discipline | Generic decision frameworks (→ `reasoning-strategy`); a testing *technique* (→ `quality-assurance`) |
| `knowledge-organization` | Structuring meaning: taxonomy, ontology, semantics, classification, linguistics, knowledge/concept modeling | Data *schema* modeling (→ `data-engineering`); *system* boundary modeling (→ `software-architecture`) |
| `product-domain` | Genuine external product/market verticals: ecommerce platforms, marketplaces, fulfillment, vendor-specific integration playbooks | Engineering primitives dressed as "product" (→ `backend-engineering`/`software-architecture`) |

Live per-subject counts are in [`SKILL_GRAPH.md § Current State`](../SKILL_GRAPH.md#current-state--single-source-of-truth); do not restate inline here.

**To propose a 13th subject value**: write an ADR in `docs/adr/` with (a) ≥5 existing skills that would label primarily under it, AND (b) evidence the value doesn't fit any existing subject by the disambiguation rules. Multi-fit secondaries belong in `subjects[1]`, not in a new top-level value.

#### `public` (boolean)

Publishability / private-data gate — is this skill safe for the public skills.sh release?

| Value | Means |
|---|---|
| `true` | Safe to publish — carries no private API keys / personal / customer / internal-operational data. Exported to the public marketplace. |
| `false` | Private — carries private data and must NOT be published. The fail-safe default when unsure. |

`public` is the single switch the marketplace exporter (`scripts/export-marketplace-skills.js`) filters on (fail-safe: only `public: true` is exported; `false` and a missing flag both stay private). It does NOT trigger the `grounding` requirement — that is keyed off `project[]` presence. Replaces the prior `deployment_target` enum (`portable` / `project`): publishability, not deployment location, is what the export gate actually needs. The normalizer maps the retired enum (`deployment_target: portable` → `public: true`; `deployment_target: project` → `public: false`, the conservative default) so unmigrated skills keep parsing. (Earlier v8 history: the 2026-05-26 design carried a 3-enum `scope` with a `workspace` value, removed by the 2026-05-27 amendment; project anchoring is now carried by `project[]`. See [ADR-0017](../docs/adr/0017-five-axis-classification-model.md) amendment block.)

#### `scope` (free-text, required)

A PRD-style statement of what the skill teaches and what it does not — mirrors the body `## Coverage` + `## Do NOT Use When` sections at the frontmatter level for fast scanning. NOT an enum; required on every current skill.

#### `keywords` (≤10 capped)

Semi-controlled vocabulary for fuzzy agent activation. The cap (max 10) prevents keyword stuffing.

Required when `routing_eval: present`. Strongly recommended for any routable skill.

#### `relations` (typed edges)

The graph layer. Seven edge types — `related`, `suppresses` (excludes the listed skills when this skill wins, does NOT defer to them; see § Relations § `suppresses`), `disjoint_with`, `verify_with`, `depends_on`, `broader`, `narrower` — cycle-checked on `depends_on` + `broader` + `narrower`. The legacy alias `boundary` is accepted only for unmigrated skills. See § Relations for the full edge contract.

#### Disambiguation rules (apply in order when choosing `subject` for a new skill)

  1. *Primary surface, not enablement* — classify by what the skill is *about*, never what it *enables*.
  2. *Property vs construction vs shape* — a property to *verify* (a11y, perf, security, testing, type-safety) → `quality-assurance`; how to *construct* the artifact → `backend-engineering` / `frontend-engineering` / `data-engineering` / `design` / `ai-engineering` / `agent-ops`; which *shape* to choose before building (boundaries, contracts, ADRs, tech selection) → `software-architecture`.
  3. *Runtime vs feature (the AI split)* — operating the agent harness → `agent-ops`; building an LLM capability into a product → `ai-engineering`. Tie-break: "would this exist with no product UI?" yes → `agent-ops`.
  4. *Build-method vs generic-reasoning* — engineering process discipline (spec/test-driven, debugging, refactor, prioritization-of-engineering, doc discipline) → `software-engineering-method`; an any-domain thinking/decision/business framework → `reasoning-strategy`.
  5. *Meaning vs data vs system (the modeling triage)* — structuring vocabulary/meaning (ontology, taxonomy, semantics) → `knowledge-organization`; structuring stored data (schema, ER-for-persistence, migrations) → `data-engineering`; structuring system boundaries/contracts (DDD, event/domain modeling) → `software-architecture`.
  6. *Design-craft vs front-end-impl* — visual/UX/interaction/research/content → `design`; turning a design into framework code (components, hooks, rendering) → `frontend-engineering`.
  7. *`product-domain` gate (anti-sink)* — only genuine *external* product/market verticals (named platforms, marketplaces, fulfillment) land here. An engineering primitive is never `product-domain` just because a product uses it.
  8. *meta gates (anti-junk-drawer)* — don't default to `reasoning-strategy`, `software-engineering-method`, or `knowledge-organization` when the skill is really about building or verifying something concrete.
  9. *Multi-fit* — skills that legitimately span two shelves set `subjects: [primary, secondary]` (max 2). The secondary widens the browse net; it does NOT change the primary or the on-disk folder. Semantic adjacencies that are NOT subject-shaped still live in `relations.related`.

**`taxonomy_domain`** (renamed from `domain` in the 2026-05-27 amendment to disambiguate from `grounding.subject_matter` and cross-taxonomy routing prose)
- Optional slash-delimited taxonomy sub-path (e.g. `engineering/api-design`, `frontend/state`).
- Subdivides a `subject` into finer-grained groups. Multiple skills sharing a `taxonomy_domain` form a natural cluster.
- Do not use as a substitute for `subject`; do not invent new top-level subjects via the slash path.

**`stability`**
- `experimental` — may change without notice; use with caution. Default for all new skills.
- `stable` — follows semver; breaking changes bump `schema_version` or `version`. See promotion criteria below.
- `frozen` — no longer evolving; pinned for historical reference.
- `deprecated` — replaced by another skill; `superseded_by` is required when this value is set.

**Promotion to `stable` — minimum criteria (enforced warn-only by `scripts/lint/check-stability-promotion.js`):**
1. `eval_state: passing` or `eval_state: monitored` — evals have been run and pass.
2. `eval_score >= 4.0` — grader score meets the quality bar.
3. `routing_eval: present` — the skill has been verified in a routing eval.
4. `drift_check.last_verified` within 90 days — skill has been recently verified against truth sources.
5. For project-anchored skills (non-empty `project[]`): `grounding.truth_sources` must be non-empty.

**Pre-1.0 stance:** The library defaults all skills to `experimental` because the protocol and skill content are under active development. Skills are promoted to `stable` only when all five criteria above are met. This is intentional — a uniform `experimental` default correctly signals that the corpus as a whole is pre-1.0 and no stability guarantees are implied. As the audit loop completes more skills, the `by_stability` distribution in the manifest will become a meaningful quality signal. (Updated 2026-05-23 — SH-6309)

### Health and Drift

**`freshness`** (in `audit-state.json`)
- ISO date the author last **reviewed** the skill's content. This is the **reviewer's footprint**, NOT the editor's footprint.
- Set by the author when they verify the skill is still accurate. The Audit Status field `last_changed` records when the SKILL.md was last **edited** (loop-stamped); the two are intentionally distinct because a skill can be edited without a fresh review (e.g. a typo fix) and reviewed without an edit (the author re-read and confirmed it still holds).
- Not computed; the author sets it. It is an authored claim, not a hash.
- Cosmetic edits (typo, formatting) should NOT bump `freshness` — they bump `last_changed` only. Substantive review or content update should bump `freshness`.
- Agents reading `freshness` should interpret it as "the author asserts they reviewed this on date X," NOT as "the file was last touched on date X" — for that, read `last_changed`.

**`drift_check`** (in `audit-state.json`)
- Object with `last_verified` (ISO date, required) and `truth_source_hashes` (optional).
- `last_verified`: when the skill was last verified against its truth sources.
- `truth_source_hashes`: a map of normalized truth-source key -> SHA-256 hex digest at the time of last verification. Keys are `path` for whole-file sources, `path#Lstart-Lend` for line ranges, and `path#anchor` for anchor-only sources. Computed by `node scripts/skill-graph-drift.js --record --apply <skill-dir>` for local truth sources. The drift sentinel (`skill-graph drift`) reports `DRIFT` when a live hash differs from the recorded hash, `BROKEN` when a local truth source file is missing, `STALE` when today exceeds `last_verified + lifecycle.stale_after_days`, `NO_BASELINE` when local truth sources are declared but no hashes are recorded, and `EXTERNAL_UNHASHED` when a URL truth source is valid but was not fetched on this run. URL fetching is **opt-in**, not impossible: `node scripts/skill-graph-drift.js --fetch-external <skill-dir>` (curl-backed) fetches and hashes URL truth sources, so portable skills grounded entirely on external specs can record and verify URL baselines too — the default run stays network-free and reports `EXTERNAL_UNHASHED` as informational.

**`lifecycle`**
- Optional object: `{ stale_after_days, review_cadence }`.
- `stale_after_days`: integer days after `drift_check.last_verified` at which the skill is flagged stale. Integration skills that wrap external APIs typically need shorter windows (30–90 days) than pure concept skills (180+ days).
- `review_cadence`: one of `per-commit`, `weekly`, `quarterly`, `on-truth-source-change`.

### Evaluation Status

The three Evaluation Status fields are orthogonal — they measure different dimensions.

**`eval_artifacts`** (in `audit-state.json`) — Does an evaluation artifact exist?
- `none`: no evals defined.
- `planned`: evals are planned but not yet written.
- `present`: at least one eval file exists.

**`eval_state`** (in `audit-state.json`) — What is the current evaluation result?
- `unverified`: evals exist but have not been run against a grader.
- `passing`: evals have been run and pass.
- `monitored`: evals are integrated into CI and are tracked.

**`routing_eval`** (in `audit-state.json`) — Does a routing-specific eval exist?
- `absent`: no routing eval.
- `present`: a routing eval exists (typically `evals/routing.json` or similar).

**`comprehension_state`** (in `audit-state.json`)
- Optional comprehension-grading axis.
- `absent` or omitted: no comprehension grading is declared.
- `present`: the skill has comprehension grading and must populate either the **five flat Understanding fields** (`mental_model`, `purpose`, `concept_boundary`, `analogy`, `misconception`) OR the legacy nested `concept` block.
- `skill-lint.js` enforces this as a cross-file rule: the sidecar flag requires the frontmatter Understanding fields. The flat fields are canonical; the legacy nested `concept` block is retired from the current frontmatter contract.

### Understanding (v6+, flat)

Five flat top-level fields that teach the agent what the skill's subject *is*. They replace the v5 nested `concept` block (whose `definition` and `taxonomy` sub-fields are now covered by `description` and `relations.broader`).

**Relationship to the body `## Concept of the skill` section.** The five flat frontmatter fields are the **canonical machine-readable contract** — routers, evaluators, retrieval systems, and lint tools read them directly. The body `## Concept of the skill` section (renamed 2026-05-26 from `## Concept Card`; per the per-skill audit contract's 7-bold-field format: `**What it is:**`, `**Mental model:**`, `**Why it exists:**`, `**What it is NOT:**`, `**Adjacent concepts:**`, `**One-line analogy:**`, `**Common misconception:**`) remains the operational **human-readable rich-expansion form** carrying content the 5 flat fields cannot hold (e.g. "Why it exists" rationale and "Adjacent concepts" cross-links). Both forms are supported in v7. The author owns the consistency: when both are present, the body `## Concept of the skill` MUST agree with the frontmatter fields. The audit contract (`skill-graph/skill-audit-loop/SKILL_AUDIT_LOOP.md#part-3--per-skill-audit-runbook` § Step 4b) checks the body section's presence and field completeness; the schema enforces the frontmatter. Earlier protocol notes that called the body section "retired in v6" reflected the migration of the *machine-readable subset* to frontmatter, not removal of the body section from authoring practice — which remains in active use across the corpus. Skills still carrying the legacy `## Concept Card` heading are CONTENT-mode migration work routed through the audit loop.

Required when `comprehension_state: present`. No protocol length cap on any of these — author each field as deeply as the concept requires.

**`mental_model`**
- Primitives and their relationships. Name the primitives. Name the relationships between them. Markdown permitted inside the string.
- Graded by the comprehension grader's `mental_model` dimension (weight 1.5).
- Distinct from `## Philosophy of the skill` in the body (renamed 2026-05-26 from `## Philosophy`), which explains *the philosophy behind the skill* — the underlying methodological stance, principles, or opinionated worldview the skill embodies. `mental_model` explains *what the subject is, universally*; `## Philosophy of the skill` explains *the philosophical foundation the skill is built on*. The two answer different questions and must not duplicate each other. (Updated 2026-05-26 — renamed `## Concept Card` → `## Concept of the skill` and `## Philosophy` → `## Philosophy of the skill`; earlier framing "why this skill file exists in this repo" was redundant with `## Concept of the skill`'s `**Why it exists:**` field.)

**`purpose`**
- What problem the concept solves AND the alternative it replaced. Concrete pain point + prior alternative.
- Graded by the comprehension grader's `purpose` dimension (weight 1.0).

**`concept_boundary`** (the Understanding field — distinct from the routing edge `relations.suppresses`/`relations.boundary`)
- Things commonly confused with the concept but that are NOT it. Express each difference as a *mechanism* (different primitives, different purpose, different scope) — not just different names.
- Graded by the comprehension grader's `boundary` dimension (weight 1.5). (The grader *dimension* is still named `boundary`; the authored *field* is `concept_boundary`.)
- The original field-name collision with the routing edge `relations.boundary` was resolved by [ADR-0018](../docs/adr/0018-relations-boundary-semantic-inversion.md), and the SYSTEM half has **landed**: the schema's canonical Understanding field is `concept_boundary` (top-level `boundary` is the DEPRECATED alias), `skill-lint.js` requires `concept_boundary`, and `parse-frontmatter.js` normalizes the deprecated top-level `boundary` → `concept_boundary` before lint/preflight see the frontmatter. The companion routing rename `relations.boundary` → `relations.suppresses` likewise landed (router reads `suppresses` first). New skills author `concept_boundary` (the teaching string) and `relations.suppresses` (the skill-name exclusion array — it excludes listed skills from co-routing when this skill wins, not defers to them; see § Relations § `suppresses`). The CONTENT half — renaming both in unmigrated corpus skills — drains through the audit loop per-skill.

**`analogy`**
- One-sentence analogy that preserves the core mechanism. Translate for a non-expert without breaking the structural relationship between primitives.
- Graded by the comprehension grader's `analogy` dimension (weight 0.5).

**`misconception`**
- The wrong mental model people bring and why it misleads. Authored hint to inoculate the agent against the common error trap.
- Not directly graded; complements `concept_boundary`.

**`concept`** (DEPRECATED in v6 — accepted for v5 back-compat)
- Legacy nested teaching block with seven sub-fields: `definition`, `mental_model`, `purpose`, `boundary`, `taxonomy`, `analogy`, `misconception`.
- Remains accepted for v5/v6 skills not yet migrated. Lint emits a warning when `concept` is populated but the flat Understanding fields are absent and the current schema version is set.
- The comprehension grader reads either location; flat fields win when both are present.

**`eval_last_run`**
- Optional evidence receipt for the most recent eval run.
- Required sub-fields when present: `at` (ISO date-time) and `status` (`pass`, `fail`, or `mixed`).
- Optional sub-fields: `runner`, `model`, `receipt`, `receipt_hash`.
- Use this to support `eval_state: passing` or `eval_state: monitored` with a concrete scorecard, grader history, or CI receipt.

### Audit Status (v6+, flat — written by the audit loop into `audit-state.json`)

Seven flat top-level fields that record a skill's audit fingerprint in its sibling `audit-state.json` sidecar, replacing the scattered log-file model of v5 (`eval-history.jsonl`, `routing-misses.jsonl`, `.opencode/progress/skill-audit-*`, `health-ledger.jsonl`, `findings/*.md`). The Skill Audit Loop reads these directly; no log-file crawl required.

**Do not hand-author these fields.** They are stamped by `lib/audit/skill-audit.js`, `lib/audit/evaluate-skill.js`, and `scripts/skill-graph-drift.js` as the audit loop runs. Hand-edits will be overwritten on the next `audit` run.

**`last_audited`**
- ISO date (YYYY-MM-DD) the `audit` command last ran against this skill.
- Loop priority uses this to pick the stalest skill next.
- Distinct from `freshness` (the author's claim of content-level review) and `drift_check.last_verified` (the truth-source verification timestamp).

**`last_changed`**
- ISO date (YYYY-MM-DD) the SKILL.md body or frontmatter was last edited.
- Written automatically by `improve` operations.
- Distinct from `freshness` (review claim) — `last_changed` is the editor's footprint, `freshness` is the reviewer's footprint.

**`structural_verdict`**
- Form-layer verdict (gates 1–2, 7: schema lint, manifest census, concept-card shape).
- Enum: `PASS` | `PASS_WITH_FIXES` | `FAIL` | `UNVERIFIED`.
- Rolled up from `lint_verdict` by the audit loop. Only external-constraint violations (Anthropic Agent Skills marketplace shape, required-fields, valid YAML) produce `FAIL`; internal style preferences are lint warnings.

**`truth_verdict`**
- Truth-layer verdict (gates 3–6: truth-source catalog, drift sentinel, test coverage, claim verification).
- Enum: `PASS` | `DRIFT` | `BROKEN` | `UNVERIFIED`.
- Rolled up from `drift_status` by the audit loop.

**`comprehension_verdict`**
- Comprehension-layer verdict (gate 8 — a cheap smoke test).
- Enum: `PASS` | `PROVISIONAL` | `SHALLOW` | `REDUNDANT` | `UNVERIFIED` | `SKIPPED_BASELINE_HIGH` | `NA`.
- Written by the comprehension grader. Never alone certifies a skill — `application_verdict` is the aggregate-quality field.

**`application_verdict`** — **the primary quality signal**
- Application-layer verdict (gate 9: behavioral change on real artifacts).
- Enum: `APPLICABLE` | `PROVISIONAL` | `NOT_DISCRIMINATED_CEILING` | `EQUIVALENT_ON_FRONTIER` | `REDUNDANT` | `HARMFUL` | `MIXED` | `FALSE_POSITIVE` | `UNVERIFIED`.
- Written by the application grader on `evals/application.json`. A skill is only behaviorally certified when this is `APPLICABLE`.
- `PROVISIONAL` records a lower-confidence evaluation receipt that found useful behavior but has not passed the independent application grader. `NOT_DISCRIMINATED_CEILING` means baseline saturation made the eval inconclusive; `EQUIVALENT_ON_FRONTIER` means no marginal lift for the measured frontier model on that case set. Default `UNVERIFIED` means no application assessment has run.

**`eval_score`**
- Latest aggregate eval grade on a 0.0–5.0 scale.
- Written by `scripts/skill/evaluate-skill.js`.
- When `evals/comprehension.json` exists, the comprehension grader's score lands here; otherwise the standard eval-suite score.

**`eval_failed_ids`**
- String array of eval IDs that failed in the most recent run. Empty array when clean.
- Populated alongside `eval_score` by the eval runner.

**`lint_verdict`**
- Result of the most recent deterministic-lint pass.
- Enum: `PASS` | `FAIL` | `UNKNOWN`.
- `PASS` means zero lint errors; warnings do not flip the verdict.

**`drift_status`**
- Current truth-source drift status, mirroring `scripts/skill-graph-drift.js` sentinel verdicts.
- Enum: `OK` | `DRIFT` | `BROKEN` | `STALE` | `NO_BASELINE` | `EXTERNAL_UNHASHED` | `UNKNOWN`.
- Written by the drift sentinel; read by the loop to prioritise re-grounding work.

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

**`dependencies`** (added 2026-06-10)
- Package/tool/framework names a codebase must use for this skill to be relevant — the codebase-fingerprint activation signal (e.g. `next`, `tailwindcss`, `stripe`, `@anthropic-ai/sdk`). Detectors match a repo's manifest dependencies (`package.json`, `requirements.txt`, …) against this list to select skills for that codebase.
- Canonical registry names, unique, optional. Name only the packages whose *presence makes the skill applicable*.
- Distinct from `relations.depends_on` (skill-to-skill composition) and `compatibility` (the runtime envelope the skill itself needs). Full boundary table: `field-reference.md` § `dependencies`.
- Projects into the manifest under `activation.dependencies`.

**`examples`**
- Positive-class activation examples — realistic user prompts this skill SHOULD activate for.
- 2–5 entries recommended. Used as few-shot signal for embedding-based routers.

**`anti_examples`**
- Negative-class activation examples — realistic prompts that look related but a DIFFERENT skill should handle.
- Pair with `relations.suppresses` only when the target is same-domain and this skill owns the query; otherwise use `relations.related` plus the `anti_examples` text. Legacy `relations.boundary` is accepted for unmigrated skills only.

**`project`** (belonging-entity reference — replaces the removed `workspace_tags`)
- `project`: array of `{ handle, role }` objects identifying which projects this skill belongs to (`role` suggested values: `source-of-truth`, `consumer`, `mirror`). Frontmatter-owned; non-empty `project[]` is what triggers the `grounding` requirement.
- The companion `repo` field (array of `{ handle, url }` repo references) is **sidecar-owned, not frontmatter** — it moved to `audit-state.json` in the ADR-0019 split as a belonging-entity/provenance reference; the frontmatter schema rejects it via `additionalProperties: false`. See `schemas/skill-audit-state.schema.json`.
- Absent means the skill is ambient (applies across all projects).
- A workspace config at `.skill-graph/config.json` can map literal project handles to semantic tag sets.

> **Retired:** the per-skill `routing_bundles` field was removed in SKI-286 (2026-06-07) — it accumulated zero acting consumer (the router scores on `keywords`/`triggers`/`relations`; the manifest only copied it through). Library-level activation bundles are served by the skill-injector routing config (`bundles` / `bundleTypes`), not per-skill frontmatter. The prior contract is recoverable from git history.

### Relations

The `relations` block contains typed edges to sibling skills. JSON Schema validates each relation item's shape; `skill-lint.js` verifies that every named target resolves to a real skill in the linted roots. Manifest generation copies valid relation fields through to the compiled manifest and `manifest:validate` checks the compiled manifest shape.

```yaml
relations:
  related:        # symmetric co-read relation (skos:related). v3.1 preferred name.
  suppresses:     # routing-layer score-aware exclusion guard (sg:disjointOwnership). Canonical name (ADR-0018) — excludes the listed skills when this skill wins; does NOT defer to them.
  boundary:       # DEPRECATED alias of `suppresses` (ADR-0018). Router reads `suppresses` first, falls back to `boundary`. Retained for unmigrated skills.
  disjoint_with:  # formal class-disjointness assertion (owl:disjointWith).
  verify_with:    # skills to co-load for verification (prov:wasInformedBy).
  depends_on:     # skills this skill requires operationally or conceptually.
  broader:        # this skill is a specialisation of the target skill (skos:broader).
  narrower:       # this skill is a generalisation of the target (skos:narrower).
  io_contract:    # OPTIONAL composition contract — abstract artifact TYPES consumed/produced.
    inputs:       #   kebab-case type tokens this skill consumes (NOT file paths).
    outputs:      #   kebab-case type tokens this skill produces.
```

**`related`** (preferred) / `adjacent` (deprecated alias)
- Symmetric associative relation. Use when two skills should be co-read because they cover the same surface from different angles.
- Maximum 5 entries recommended to avoid hub-and-spoke clutter.
- `adjacent` is a deprecated alias from v3.0. Use `related` in all new skills. Tooling still accepts `adjacent` for back-compat, but new authoring should not introduce it.

**`suppresses`** (preferred) / `boundary` (deprecated alias) — the routing-layer field, distinct from the top-level Understanding `boundary` field

> **The verb matches the mechanic.** Per [ADR-0018](../docs/adr/0018-relations-boundary-semantic-inversion.md), the routing-exclusion edge was renamed `boundary` → `suppresses` because the old name read as deference while the runtime mechanic is exclusion. **The SYSTEM half landed** (2026-06-07): the schema accepts `relations.suppresses`, the router/manifest/exporter/lint read `suppresses` first and fall back to the deprecated `boundary` alias, and the JSON-LD context maps both to `sg:disjointOwnership`. The CONTENT half — renaming the alias in the ~113 corpus skills still carrying `boundary` — drains through the audit loop per-skill (a CONTENT-mode task tracks it). **Removal condition (measurable, for every deprecated/legacy alias the schema still accepts):** when an alias's corpus usage reaches 0, one SYSTEM commit deletes it from the schema — live per-alias usage counts are in [`docs/status.generated.md § Deprecated-alias drain`](../docs/status.generated.md); the drain is never an open-ended "compatibility window." The companion Understanding-field rename `boundary` → `concept_boundary` **also landed** (SYSTEM half): the schema's canonical Understanding field is `concept_boundary` with top-level `boundary` retained only as the DEPRECATED alias, `skill-lint.js` requires `concept_boundary`, and `parse-frontmatter.js` normalizes the deprecated top-level `boundary` → `concept_boundary`. Its CONTENT half — the corpus rename — drains through the same per-skill audit loop.
>
> New skills MUST author `relations.suppresses`. `suppresses: [skill-B]` means "**exclude skill-B from co-routing results when this skill wins.**" Always write `reason` text that reflects ownership ("I own this exclusively over skill-B"), never deference ("use skill-B instead"), because the latter will mislead the next author — skill-B is suppressed by this entry, not promoted.
>
> **Runtime semantic:** the router applies the edge (`relations.suppresses[]`, or `relations.boundary[]` for unmigrated skills) as `if (target.score >= declarer.score) skip target`. This means:
> - The declarer can only exclude the target when the declarer is *currently outscoring* it on the query.
> - Score ties also trigger exclusion, so authored exclusions break ties deterministically.
> - A weaker-scoring skill cannot veto a stronger-scoring one.
>
> These entries protect the declarer's routing wins, not the target's. (Source: `skill-graph/scripts/skill-graph-route.js` Stage 3.)

- Routing-layer exclusion guard. Use to assert that this skill owns a use-case exclusively and the listed skills should not co-route when this skill wins the query.
- Items may be bare skill names or `{ skill, reason }` objects. Reasons are strongly recommended and must use ownership framing ("I own this exclusively over [skill]"), not deference framing ("use [skill] instead").
- This is a Skill-Graph-specific routing predicate, not formal OWL class disjointness.
- Same-domain only: see Cross-domain suppression doctrine below.

**Cross-domain suppression doctrine — SAME-DOMAIN ONLY.** Codified 2026-05-17 after the Tier C″ empirical sweep across 8 Wave 6 skills:

1. `suppresses[]` entries should declare SAME-DOMAIN routing exclusions only (same `subject` AND same `taxonomy_domain` sub-tree). Example: `frontend-engineering/rendering` ↔ `frontend-engineering/rendering` is fine; `frontend-engineering/rendering` ↔ `design/component-systems` is not.
2. Cross-subject or cross-sub-domain routing distinctions belong in `anti_examples` + `relations.related`, NOT in `suppresses[]`. The `anti_examples` array preserves routing-visible documentation as wrong-use phrases; `relations.related` signals the semantic adjacency without invoking the score-aware exclusion mechanic.
3. Empirical justification: removing 16 cross-domain legacy `boundary[]` entries across 8 skills caused **0 top-1 routing changes** on the 30-query baseline; only 3/30 low-confidence unmaskings of legitimate alternatives at score 3 surfaced. The cross-domain entries were performing silent low-confidence exclusion only — exactly the silent-failure risk the doctrine prevents.

Authors who introduce a cross-domain `suppresses[]` entry must move it to `anti_examples` + `relations.related` instead. `scripts/skill-lint.js` warns (advisory) on cross-**subject** suppression declarations — it resolves each `suppresses[]` target, or legacy `boundary[]` target, against the corpus and flags any whose subject differs from the source skill's. (It checks the `subject` axis, the high-value case; cross-`taxonomy_domain`-within-subject is not yet flagged.) The warning is advisory, not a build failure; the audit loop drains existing cross-subject suppression backlog per-skill (move to `anti_examples` + `relations.related`).

**`disjoint_with`**
- Formal class-disjointness assertion. Use only when the two skill concepts are genuinely disjoint in the ontology sense.
- Items may be bare skill names or `{ skill, reason }` objects.
- Do not use it as a replacement for routing-layer `suppresses`.

**`verify_with`**
- Skills to co-load when verifying claims in this skill. Maps to `prov:wasInformedBy`.
- Keep to 1–3 high-signal verifiers.

**`depends_on`**
- Skills this skill requires. Items may be bare skill names or `{ skill, min_version }` objects for version-constrained dependencies.

**`broader` / `narrower`**
- Cross-skill generalisation/specialisation edges (SKOS). Use `broader` when this skill is a specialisation of another skill that is not its overlay parent. `narrower` is the inverse; tooling can infer it from other skills' `broader` edges.

**`io_contract`** (optional, non-edge — deterministic composition; SKI-52)
- Not an edge to a named skill. It declares the abstract artifact **types** this skill consumes (`inputs`) and produces (`outputs`), so the tooling can *derive* `depends_on` edges from output→input compatibility without an LLM — the machine-checkable composition pattern of Graph of Skills (arXiv 2604.05333) and SkillNet (arXiv 2603.04448).
- `inputs[]` and `outputs[]` are **kebab-case abstract artifact-type tokens** (`skill-md`, `audit-findings`, `manifest`, `routing-config`, …), never concrete file paths. Composition holds when one skill's output token equals another's input token.
- The builder (`scripts/skill/skill-graph-builder.js`) emits a derived edge **consumer→producer** when `producer.outputs ∩ consumer.inputs ≠ ∅`; the result lands under `io_composition` in `scripts/discovery/skill-graph.json`.
- `node scripts/skill/check-io-composition.js` (`npm run check:io-composition`) gates two failures: **broken chains** — an authored `depends_on` target whose outputs satisfy none of the dependent's declared `inputs` — and **cycles** (Tarjan SCC on the depends_on subgraph). Exit 1 on either.
- Fully optional and forces no corpus migration: a skill without `io_contract` contributes no derived edges and is never flagged.

### Grounding

Required when the skill is project-anchored (non-empty `project[]`). Describes where the skill's claims are anchored in a specific project.

```yaml
grounding:
  subject_matter: string        # What the skill is grounded in (e.g. "Shopify order sync")
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
- `targets`: array of export targets. Only `skill-md` is valid today.

**`urn`**
- Optional; **sidecar-owned** (`audit-state.json`) since the ADR-0019 split — registry identity is a provenance concern, not agent-facing frontmatter. See `schemas/skill-audit-state.schema.json`.
- Format: `urn:skill:<repo-slug>:<skill-name>`. Example: `urn:skill:skill-graph:debugging`.
- The `<skill-name>` segment must equal the frontmatter `name` field exactly.
- Consumers treat the URN as the stable identity across repos and federated registries; the frontmatter `name` is the display-layer handle.

**`license`**
- SPDX identifier (e.g. `MIT`, `Apache-2.0`).
- Strongly recommended for any skill intended for distribution.

**`compatibility`**
- Object: `{ runtimes?, node?, notes? }`.
- `runtimes`: array of target agent runtimes with optional version constraints (e.g. `claude-code>=2.0`).
- `node`: Node.js version constraint (e.g. `>=18`).
- `notes`: free-text notes. No protocol length cap.

**`allowed-tools`**
- Space-separated string of tool names the skill is authorized to invoke.
- Inherited from the plain `SKILL.md` format.

---

## Authored vs Generated Fields

### Authored vs loop-written source files

`SKILL.md` frontmatter is human-authored agent-facing content. `audit-state.json` is audit-loop-owned state. The manifest compiler joins the two before projecting health/eval/lifecycle blocks.

**Human-authored `SKILL.md` frontmatter fields:**

```
name, description, subject, subjects, public, scope,
taxonomy_domain, project, stability, superseded_by, license,
compatibility, allowed-tools, triggers, keywords, examples,
anti_examples, paths, relations, grounding,
# Understanding fields — author these when comprehension_state: present
mental_model, purpose, concept_boundary, analogy, misconception
```

**Loop-owned `audit-state.json` fields:**

```
schema_version, version, owner, urn, repo, freshness, reviewed_at,
drift_check, eval_artifacts, eval_state, routing_eval, eval_last_run,
eval, comprehension_state, lifecycle, marketplace_tier, portability,
runtime_telemetry, model_run_coverage,
# Audit Status stamped by `audit` / `improve` / `evaluate`
last_audited, last_changed, structural_verdict, truth_verdict,
comprehension_verdict, application_verdict, eval_score, eval_failed_ids,
lint_verdict, drift_status
```

### Generated in `skills.manifest.json` (tooling-computed)

The manifest generator (`scripts/generate-manifest.js`) reads the authored frontmatter and emits computed fields that do not exist in the source `SKILL.md`:

- `id` — derived from the skill's path relative to `skills/` (e.g. `task-execution`, or `<project>/design-review` in a multi-root workspace).
- `path` — relative path to the `SKILL.md` file.
- `summary` — aggregate counts (`total_skills`, `by_schema_version`, `by_subject`, `by_public`, `by_stability`, `by_project`).
- `generated_at` — ISO timestamp of when the manifest was generated.
- `activation` — compiled block merging `triggers`, `keywords`, `paths`, `examples`, and `anti_examples` from frontmatter.
- `health` — compiled block merging `eval_artifacts`, `eval_state`, `routing_eval`, `comprehension_state`, `eval_last_run`, `freshness`, `drift_check`, and `model_run_coverage`.

The manifest schema is at `schemas/manifest.schema.json`. For the complete authored-to-generated field rename map and loss policy, see `docs/manifest-field-mapping.md`.

---

## Schema contract

> **v8 is the canonical classification.** The schema's global `required` array mandates `subject` (closed 12-enum browse shelf — competency the skill teaches; see ADR-0020) + `public` (boolean publishability / private-data gate) + `scope` (required free text). The prior contract (v7 — with `type`, `category`, `categories`, `primaryCategory`, `layerPrimary`, `routingRole`) lives in git history; retrieve via `git show schema-v7:schemas/SKILL_METADATA_PROTOCOL_schema.json`; it is not accepted by the live schema. Note the initial 2026-05-26 v8 design carried an `operation` axis and a closed-enum `scope` (both reshaped by the 2026-05-27 amendment: operation retired, scope repurposed to free-text) and a `deployment_target` enum (later replaced by the boolean `public` gate) — see CHANGELOG and ADR-0017. See `schemas/SKILL_METADATA_PROTOCOL_schema.json` for the live contract.

| Surface | State |
|---|---|
| **This doc (skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md)** | v8 |
| **Schema file (`schemas/SKILL_METADATA_PROTOCOL_schema.json`)** | v8. Global required: `subject`, `public`, `scope`, plus identity/lifecycle/Evaluation Status fields. `scope` is required free text. No v7 fields declared. |
| **Compiled manifest (`skills.manifest.json`) summary** | v8 (`by_subject`, `by_public`, `by_schema_version`, `by_stability`, `by_project`). |
| **Audit Loop checklist (`skill-audit-loop/SKILL_AUDIT_LOOP.md` § Part 2)** | v8 |

**What this means for authors:**

- A new skill MUST declare the v8 classification fields: `subject` (12-enum) + `public` (boolean) + `scope` (required free text). Polyhierarchy via optional `subjects[]` (max 2). See § Classification.
- Skills still carrying v7 classification fields fail lint against the live schema. Migration of those skills is **CONTENT-mode work** handled per-skill through the audit loop (`/audit:audit`, `/audit:evolve`) — see `skill-graph/AGENTS.md § Work Modes — SYSTEM vs CONTENT`. The schema's correctness is independent of how many individual skills currently comply.
- The normalizer in `scripts/lib/parse-frontmatter.js::normalizeFrontmatter()` continues to read either physical encoding (nested `metadata:` or flat).

## Design Constraints

The contract enforces the following invariants. Any change to the schema or tooling that violates these invariants is a breaking change requiring a `schema_version` bump.

1. **Two files, one skill (ADR-0019).** Each skill is one `SKILL.md` (agent-facing frontmatter + body) plus one sibling `audit-state.json` sidecar (audit/eval/provenance state), joined by the manifest compiler. No other split-source format. No per-environment variants.
2. **One manifest.** All skills aggregate into one `skills.manifest.json`. No closed/open split manifest.
3. **No private-only fields.** Every field in the schema is part of the public contract. There are no fields reserved for specific organisations or runtime environments.
4. **No second runtime model.** The same frontmatter shape serves local development, CI, and federated registry export. Export to plain `SKILL.md` is a transform (`scripts/export-skill.js`), not a separate authoring format.
5. **Strict schema.** `additionalProperties: false` on both the skill and manifest schemas. Unknown fields fail lint rather than being silently ignored.
6. **Additive evolution only within a version.** New optional fields, new enum values that extend (not replace) an existing enum, and new lint warnings are non-breaking. Renamed fields, removed fields, retyped fields, tightened required-ness, and removed enum values require a `schema_version` bump.
7. **Migration tooling accompanies every breaking change — and is then retired.** Per [ADR-0014](../docs/adr/0014-canonical-only-schema-files.md) and `AGENTS.md § Major Version Is a Clean Cut`, a version-bump codemod runs once against the corpus and is deleted to git history; codemods are never kept on disk as permanent tooling. The version-agnostic shape normalizer (`scripts/normalize-skill-field-shape.js`, Decision B 2026-05-31) is the only standing migration infrastructure.

---

*See `skill-metadata-protocol/design-rationale.md` for full design rationale, overlay composition precedence, and schema versioning policy. See `skill-metadata-protocol/field-reference.md` for one section per field with examples. See `schemas/SKILL_METADATA_PROTOCOL_schema.json` for the machine-enforceable version of this contract.*
