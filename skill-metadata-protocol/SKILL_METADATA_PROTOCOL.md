# Skill Metadata Protocol

> **Work-mode rule (read FIRST).** Editing this document, the schemas it normalizes against, the audit prompts, or the audit/lint/drift scripts is **SYSTEM work**. Editing individual `SKILL.md` files to conform to this contract is **CONTENT work** that runs ONLY via `/audit:audit`, `/audit:improve`, `/audit:evaluate`, `/audit:evolve`. Do not mix them in the same task or commit. Full doctrine: [`AGENTS.md` § Work Modes — SYSTEM vs CONTENT](../AGENTS.md#work-modes--system-vs-content).

> **Spec version:** 1.6.0 (`schema_version: 8`, Skill Graph 0.5.10)
> **Currently enforced by `schemas/SKILL_METADATA_PROTOCOL_schema.json`:** v8. Per [ADR-0019](../docs/adr/0019-audit-state-sidecar-separation.md), a skill is now **two files**: `SKILL.md` frontmatter (25 agent-facing fields; `required`: `name`, `description`, `subject`, `deployment_target`, `scope`) and a sibling `audit-state.json` sidecar (28 audit/eval/provenance fields, schema `schemas/skill-audit-state.schema.json`; `required`: `schema_version`, `owner`, `freshness`, `drift_check`, `eval_artifacts`, `eval_state`, `routing_eval`). The two are joined into the compiled manifest. See [§ Schema contract](#schema-contract).
> **Single source of truth for "what is enforced today":** [`SKILL_GRAPH.md § Current State`](../SKILL_GRAPH.md#current-state--single-source-of-truth) — link there from any doc that needs the live answer; do not restate.
> **Machine-readable schema:** `schemas/SKILL_METADATA_PROTOCOL_schema.json`
> **Detailed field reference:** `skill-metadata-protocol/field-reference.md`
> **Full semantics + design rationale:** `skill-metadata-protocol/design-rationale.md`
> **v8 design rationale:** `docs/adr/0017-five-axis-classification-model.md` (operation axis retired 2026-05-27, see amendment block)
> **Prior contract:** retrievable via `git show schema-v7:schemas/SKILL_METADATA_PROTOCOL_schema.json`; not accepted by the live schema.

---

> **Author shortcut (TL;DR):** Author `subject` (primary classification, 9-value enum) + `deployment_target` (deployment targeting, 2-value enum: `portable` / `project`) + `scope` (free-text PRD-style statement of what the skill teaches and what it does not). Polyhierarchy via `subjects[]` (max 2, primary first). Activation via `keywords` / `triggers` / `examples` / `anti_examples`. Routing via `relations` (`related` / `boundary` / `verify_with` / `depends_on` / `broader` / `narrower` / `disjoint_with`). Full schema-contract explanation at the END of this doc (§ Schema contract).

---

This document is the top-level public contract for the Skill Metadata Protocol frontmatter format — the **normative spec**. It defines which fields are required, what each field means in operational terms, which fields are authored by humans vs computed by tooling, and how to migrate from older schema versions. Skill Graph is the library-level system that consumes this contract. The prose is terse and boundary-aware: every clause is a rule a consumer or author can verify against the schema and the focused Skill Graph verification tools.

**Companion docs by genre.** This contract is the *what*. The *why* — design rationale, archetype semantics, OntoClean rigidity, the Evaluation Status's orthogonality, the JSON-LD W3C mappings, and the philosophical posture behind the field choices — lives in [`skill-metadata-protocol.md`](design-rationale.md). The two docs are coordinated and grow together: a normative rule that lacks a "why" is fragile; a "why" that lacks a normative rule is vapourware. If you are authoring a SKILL.md, you read this file. If you are deciding whether to add a field to the schema, you read both.

---

## Charter — Rules & Goal

**Mission & Vision** are shared across all three layers (Skill Metadata Protocol, Skill Audit Loop, Skill Graph); the canonical statement is [`AGENTS.md § Mission and Vision`](../AGENTS.md#mission-and-vision). This section records the **Protocol layer's** own Rules and Goal, so an agent editing this contract knows what it is bound by and what it is for.

### Rules

1. **The schema is the binding machine contract.** If this prose and `schemas/SKILL_METADATA_PROTOCOL_schema.json` disagree, the schema wins and the prose is corrected — never the reverse.
2. **Every authored skill declares the two required classification axes:** `subject` (closed 9-value enum) and `deployment_target` (closed 2-value enum: `portable` / `project`).
3. **`scope` is a required free-text statement** of what the skill teaches and what it does not. It is not an enum and never carries deployment-targeting values — that role belongs to `deployment_target`.
4. **A `deployment_target: project` skill must declare a `grounding` block**, and that block names what it is grounded in via `grounding.subject_matter`.
5. **Subdivide and affiliate with the current fields:** `taxonomy_domain` (slash-delimited) subdivides a crowded `subject`; `project[]` / `repo[]` carry belonging-entity references.
6. **The canonical library is authored in the Agent-Skills-compatible nested encoding;** the normalizer reconciles the nested and flat encodings so every deterministic tool reads one logical contract.
7. **`relations.boundary: [X]` means "exclude X from co-routing when this skill wins."** Write the reason as ownership ("I own this exclusively over X"), never as deference ("use X instead").
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

Every skill is a single `SKILL.md` file with a YAML frontmatter block. The schema contract is `schemas/SKILL_METADATA_PROTOCOL_schema.json`; deterministic verification is split across focused tools. `skill-lint.js` enforces the canonical-source schema gate (valid frontmatter, validation against `schemas/SKILL_METADATA_PROTOCOL_schema.json`, identifier shape, non-empty description, parent-directory/name alignment), while `check-protocol-consistency.js`, `generate-manifest.js`, routing evals, drift checks, and export verification cover the broader protocol surface. The `generate-manifest.js` script reads frontmatter from all skill files and emits a single `skills.manifest.json`.

The contract has one runtime model: one `SKILL.md` per skill, one manifest, one lint pass. There is no closed/open split, no private control plane, and no enterprise-only fields.

### Two physical encodings, one logical contract

The field tables in this document describe the **logical contract** — the field set, types, and semantics. That logical contract has **two valid physical encodings on disk**, and the tooling normalizes both before reading:

| Encoding | Shape | Where it is used |
|---|---|---|
| **Protocol-native** | Every field a top-level YAML key; structured fields (`relations`, `drift_check`, `grounding`, …) are native YAML objects/arrays. | The shape the field tables below illustrate; produced by the authoring template. |
| **Agent-Skills-compatible** | Only `name`, `description`, `license`, `compatibility`, `allowed-tools` at top level; **all other fields nested under a `metadata:` map, with objects and arrays JSON-string-encoded** (e.g. `relations: "{\"boundary\":[…]}"`). | The shape the **entire canonical library** at `~/Development/skills/` is authored in, because that repo is also the public Agent-Skills release repo (one repo, two hats — see `AGENTS.md § Public Distribution`). |

`scripts/lib/parse-frontmatter.js::normalizeFrontmatter()` reconciles the two: it lifts `metadata.*` back to top level and `JSON.parse`s the stringified values, so `skill-lint.js`, `generate-manifest.js`, `skill-graph-route.js`, and `skill-graph-drift.js` all see the protocol-native shape regardless of which encoding the file uses. Two precedence rules apply: (1) a top-level field wins over a `metadata.*` field of the same name (the explicit author signal wins); (2) export-provenance keys (`skill_graph_source_repo`, `skill_graph_protocol`, `skill_graph_project`, `skill_graph_canonical_skill`, and the description-length book-keeping keys) are **stripped** during normalization and are not part of the contract — a consequence is that the `skill_graph_protocol` content-label is invisible to all deterministic tooling and is governed by human discipline only (see `AGENTS.md § Version Labels Are Earned, Not Bumped`). Round-tripping from the Agent-Skills shape back to protocol-native is lossy for rich types; keep the canonical source authoritative. See `docs/SKILL-MD-FORMAT-COMPATIBILITY.md`.

### One repo, two hats — the canonical library

The on-disk skill library at `~/Development/skills/` is **one physical repo wearing two hats**:

1. **Hat 1 — Canonical authoring source.** The protocol-toolchain in `skill-graph/` reads SKILL.md files from this repo (via `.skill-graph/config.json` → `skill_roots: ["../skills/skills"]`) to run lint, manifest generation, routing, drift checks, and audits. The frontmatter shape here is the **Agent-Skills-compatible nested encoding** (everything under `metadata:`) because hat 2 requires it.
2. **Hat 2 — Public Agent-Skills release.** The same repo is published to `https://github.com/jacob-balslev/skills` and indexed at `https://www.skills.sh/jacob-balslev/skills/`. The Agent-Skills format only honours `name`, `description`, `license`, `compatibility`, `allowed-tools` at the top level; everything richer must be nested under `metadata:`. The full publish protocol is in `skill-graph/AGENTS.md § Public Distribution — Canonical URL Contract`.

Authors of new skills should write the **nested encoding** so the file works under both hats simultaneously. The protocol-native flat shape is the spec's illustrative form; the on-disk reality is nested. The normalizer keeps deterministic tooling reading one logical contract from both shapes.

### Two files per skill: `SKILL.md` + `audit-state.json` (ADR-0019)

Distinct from the two *encodings* above (which are two shapes of the same frontmatter), a skill is **two files on disk**:

| File | Holds | Who reads it | Schema |
|---|---|---|---|
| **`SKILL.md`** frontmatter | The 25 agent-facing fields — what the everyday agent reads to **find, understand, and execute** the skill: `name`, `description`, `subject`/`subjects`/`taxonomy_domain`, `deployment_target`, `scope`, `grounding`, `project`, the activation surfaces (`keywords`/`triggers`/`examples`/`anti_examples`/`paths`), `relations`, the five flat Understanding fields, `stability`/`superseded_by`, `license`, `compatibility`, `allowed-tools`. `required`: `name`, `description`, `subject`, `deployment_target`, `scope`. | every consumer + the everyday agent | `schemas/SKILL_METADATA_PROTOCOL_schema.json` |
| **`audit-state.json`** (sidecar, skill-folder root) | The 28 audit/eval/provenance fields — the Skill Audit Loop's records *about* the skill: `schema_version`, `version`, `owner`, `urn`, `repo`, `freshness`, `drift_check`, the `eval_*` triple, the four Audit Status verdicts (`structural`/`truth`/`comprehension`/`application`), `comprehension_state`, `lifecycle`, `marketplace_tier`, `portability`, `runtime_telemetry`. `required`: `schema_version`, `owner`, `freshness`, `drift_check`, `eval_artifacts`, `eval_state`, `routing_eval` (`version` optional). | the audit loop (`/audit:*`) only — written by it, never read by the everyday agent | `schemas/skill-audit-state.schema.json` |

The split *is* the SYSTEM/CONTENT boundary made physical: the sidecar is audit-loop output, the frontmatter is the agent-facing contract. The compiled manifest **joins** the two (`generate-manifest.js` merges the sidecar under the frontmatter before building each entry) so the router's quality and staleness gates read the same `health`/`eval`/`lifecycle` projections as before — the SOURCE changed, the manifest SHAPE did not. Three gates that used to live in the frontmatter schema's `allOf` are now expressed where they belong post-split: `eval_state ∈ {passing, monitored} ⇒ eval_artifacts: present` stays intra-sidecar; `comprehension_state: present` (sidecar) ⇒ the five flat Understanding fields (frontmatter) and `stability: deprecated` (frontmatter) ⇒ `superseded_by` (frontmatter) are **cross-file lint checks** in `skill-lint.js`. The prior single-file contract is recoverable via `git tag schema-v8`.

### Where does my skill live? (decision tree)

Map the v8 `subject` axis to the on-disk directory under `~/Development/skills/skills/`. **Updated 2026-05-26 — F23 reorg landed; directory names now match v8 subjects 1:1.** The 47 previously-nested skills (e.g., `engineering/data/<name>/`, `agent/context/<name>/`) were flattened to `<v8-subject>/<name>/`:

| If `subject:` is… | Directory | Notes |
|---|---|---|
| `code-engineering` | `skills/code-engineering/<name>/` | Largest shelf (36 skills, 25%). Subdivide via `domain:` (frontend / backend / infrastructure / build) when >25 skills. |
| `quality-assurance` | `skills/quality-assurance/<name>/` | Audit, testing, security, performance, accessibility (27 skills, 18%). |
| `frontend-ui` | `skills/frontend-ui/<name>/` | Frontend implementation (rendering, hooks, styling, components, layout) (20 skills, 13%). Boundary with `design-craft`: pick by what the skill *teaches* — implementation patterns (rendering, state, props) → frontend-ui; design judgment (composition, hierarchy, typography) → design-craft. |
| `design-craft` | `skills/design-craft/<name>/` | Information architecture, composition, typography, UX research (20 skills, 13%). |
| `agent-ops` | `skills/agent-ops/<name>/` | Agent orchestration, skill system itself, multi-agent coordination (17 skills, 11%). |
| `product-domain` | `skills/product-domain/<name>/` | Product-shaped knowledge: e-commerce, billing, integrations, customer workflows (11 skills, 7%). |
| `meta-methods` | `skills/meta-methods/<name>/` | Cross-cutting methodology: methodical reasoning, no-cutting-corners, code-preservation (8 skills, 5%). |
| `knowledge-organization` | `skills/knowledge-organization/<name>/` | Information architecture for *the skill library itself* — head nouns, taxonomy, glossary (7 skills, 5%). |
| `data-analytics` | `skills/data-analytics/<name>/` | Quantitative analysis, modeling, statistics (3 skills, 2%). Smallest shelf — earns its own root per the v8 design even at <5 skills because category cleanliness > population threshold. |

**Naming convention.** Directory name = skill `name:` value (kebab-case, head-noun-anchored). The `skill-lint.js` parent-dir alignment check enforces this.

> **Layout history.** Pre-2026-05-26 the canonical library used a v7 6-directory layout (`agent / design / engineering / foundations / product / quality`) with v8 subjects living only in frontmatter. F23 from the 2026-05-25 audit (SH-6481) recommended flattening to v8 subject names; the codemod ran 2026-05-26 (`/tmp/migrate-skill-layout-v7-to-v8.js`, 148 git-mv operations + 1 manual move for the untracked `playing-to-win` skill). Pre-reorg paths are reachable via git history.

### Inline field comments — the authoring convention

**Every authored frontmatter field carries a YAML comment block (`#`) immediately above it.** The comment names: (a) what the field is, (b) allowed values or type, (c) when-to-use in one line. **These comments STAY in the production SKILL.md** — they are not scaffolding to strip. Cold-start agents and human authors decode the frontmatter at the point of contact, not three docs away. Co-located documentation is the discipline that prevents the "this field looks like dead code, let me propose deleting it" failure mode — fields with low corpus adoption (e.g. `eval_state: monitored` at 0%) may be forward-looking or genuinely scoped, and the comment makes that intent visible.

**Two distinct comment styles coexist in the template — they have opposite lifecycles. Do not confuse them.**

| Style | Lifecycle | Example | Purpose |
|---|---|---|---|
| **Field-purpose comment** | **STAYS in the production skill.** | `# subject: primary browse shelf — what the skill teaches.`<br>`# code-engineering / quality-assurance / frontend-ui / design-craft / agent-ops / ...` | Authoritative-by-co-location documentation of what the field is for, its allowed values, and when to pick each value. The reader does not need to open `skill-metadata-protocol/field-reference.md` to understand the frontmatter. |
| **`# TEMPLATE NOTE:` comment** | **STRIPPED on derivation.** | `# TEMPLATE NOTE: be pushy in your description — Claude tends to under-trigger skills...` | Authoring scaffolding that only lives in `examples/skill-metadata-template.md`. Derived skills MUST strip every line beginning with `# TEMPLATE NOTE:` before commit (verified with `grep -n "TEMPLATE NOTE" <derived-skill>` returning zero hits). |

**Source of truth** for the content of a field-purpose comment is `skill-metadata-protocol/field-reference.md`. The inline comment is an abridged summary (purpose + enum + when-to-use). When the comment and the reference doc disagree, the reference doc wins and the comment gets corrected. The discipline mirrors how JSDoc / TSDoc summaries point at canonical type definitions — the comment is a fast lookup, not a parallel truth.

**Worked example** — what a complete field section looks like in a derived SKILL.md:

```yaml
metadata:
  # === v8 Classification (subject + deployment_target; polyhierarchy via subjects[]) — see ADR-0017 ===

  # subject: primary browse shelf — what the skill teaches. One of nine closed values:
  # code-engineering / quality-assurance / frontend-ui / design-craft / agent-ops /
  # product-domain / knowledge-organization / meta-methods / data-analytics.
  subject: meta-methods

  # deployment_target: deployment targeting. One of two closed values:
  # portable (any project) / project (one specific project; requires a populated `grounding` block).
  deployment_target: portable

  # scope: OPTIONAL free-text PRD-style statement of what the skill teaches and what it does not.
  # Not an enum (the deployment-targeting role belongs to `deployment_target`).
  scope: "Teaches first-principles decomposition; not for routine refactors."

  # === Evaluation Status (three orthogonal axes — never collapse to boolean) ===

  # eval_artifacts: disk-truth — does an eval file exist on disk?
  # none (no intent) / planned (intent declared, no file yet) / present (file exists).
  eval_artifacts: planned

  # eval_state: runtime-truth — has the eval been run and passed?
  # unverified (no run yet) / passing (one-shot green) / monitored (cadenced green).
  # `monitored` is a forward state — advance here when continuous cadence runs.
  eval_state: unverified

  # routing_eval: routing-coverage — is the skill's activation verified by the harness?
  # absent (not verified) / present (harness `npm run routing-eval` must exit 0).
  # `skill-lint.js` does NOT check this; the standalone routing-eval gate enforces it
  # via the verify chain. (2026-05-27 H12 — earlier "gated by lint check 12" framing
  # referred to a check removed in the 2026-05-19 lint reduction.)
  routing_eval: absent
```

**The convention applies to all three named layers** of the skill system: the Skill Metadata Protocol (this contract), the Skill Graph (the library-level system), and the Skill Audit Loop (the maintenance discipline). Templates and authored skills under any of those layers carry field-purpose comments by default. The template `examples/skill-metadata-template.md` is the canonical specimen; derived skills inherit the field-purpose comments (and strip the `# TEMPLATE NOTE:` lines) per the workflow in `skill-scaffold` (`~/Development/skills/skills/agent-ops/skill-scaffold/SKILL.md`).

**Why this exists.** The 2026-05-26 cleanup session surfaced the exact failure mode this convention prevents: a cold-start agent read the schema's distribution of `eval_state` values (`unverified: 144 / passing: 7 / monitored: 0`) and proposed cutting `monitored` as "dead value" — because the field's design intent (a forward state for cadenced runs) lived only in `docs/field-rationale.md`, three reads away from where the field actually appeared. With co-located comments, that intent is visible at the point where the field is read. The cost of reading the field-purpose comment is one screenful of YAML; the cost of NOT having it is an entire session of misguided cut-proposals.

---

## Required vs Optional Fields

### Required for all skills

The v8 contract requires thirteen canonical fields, including the v8 classification fields (`subject` + `deployment_target` + `scope`). The `skill-lint.js` schema gate enforces the current schema shape; use the protocol, manifest, routing, drift, export, and eval checks for the rest of the full contract.

| Field | Type | Purpose |
|---|---|---|
| `schema_version` | integer `8` | Signals the contract version. Prior versions live in git history (see ADR 0014 — canonical-only schema files, and `git tag --list 'schema-*'`). |
| `name` | string | Stable identifier. Used for routing and `relations.*` targets. |
| `description` | string | Short description of what the skill is about. Activation signals belong to `keywords`/`triggers`/`examples`/`anti_examples`; boundary semantics belong to `relations.boundary` (⚠ name inverts mechanic — it *excludes* the listed skills when this skill wins; see § Relations § `boundary`). |
| `version` | semver string | Skill content version (e.g. `1.2.0`). Bumped by the author. |
| `subject` | enum (9 closed values) | Primary classification — what the skill teaches. One of: `code-engineering`, `quality-assurance`, `frontend-ui`, `design-craft`, `agent-ops`, `product-domain`, `knowledge-organization`, `meta-methods`, `data-analytics`. See § Classification. |
| `deployment_target` | enum (2 closed values) | Deployment targeting — where the skill applies. One of: `portable` (any project), `project` (one specific project; requires `grounding`). See § Classification. |
| `scope` | string | PRD-style free-text statement of what the skill teaches and what it does not. Not an enum. |
| `owner` | string | Team, username, or tool that is responsible for keeping this skill current. |
| `freshness` | ISO date | Date the skill body was last reviewed or updated. |
| `drift_check` | object | Contains `last_verified` (ISO date) and optional `truth_source_hashes`. |
| `eval_artifacts` | enum | One of: `none`, `planned`, `present`. |
| `eval_state` | enum | One of: `unverified`, `passing`, `monitored`. |
| `routing_eval` | enum | One of: `absent`, `present`. |

### Conditionally required

These fields are required only when a specific condition is met. The schema gate enforces `grounding`, `superseded_by`, the comprehension-evidence shape, and the `eval_state` / `eval_artifacts` coherence rule. The `keywords` rule is a routing-quality convention verified by review and routing evals rather than by schema lint, since the schema cannot reason about routability intent.

| Field | Required when | Enforced by |
|---|---|---|
| `grounding` | `deployment_target: project` | schema `allOf` |
| `superseded_by` | `stability: deprecated` | schema `allOf` |
| `mental_model` + `purpose` + `boundary` + `analogy` + `misconception`, or `concept` | `comprehension_state: present` | schema `allOf` / `anyOf` |
| `eval_artifacts: present` | `eval_state: passing` or `eval_state: monitored` | schema `allOf` |
| `keywords` | `deployment_target: project` OR `routing_bundles` is set | routing review / routing evals |

### Optional (strongly recommended)

Not schema-required, but most useful skills include these:

```yaml
stability       # experimental | stable | frozen | deprecated
license         # SPDX identifier (e.g. MIT, Apache-2.0)
keywords        # string[] — semantic phrases for discovery
triggers        # string[] — exact match activation phrases
relations       # typed edges to sibling skills
                # ⚠ relations.boundary is INVERSE to its name — it EXCLUDES the
                # listed skills from co-routing when THIS skill wins (it does
                # NOT defer to them). Write reason text as ownership
                # ("I own this exclusively over X"), never deference
                # ("use X instead"). Renamed to relations.suppresses in v8.1
                # per ADR-0018. See § Relations § `boundary` for the full
                # WARNING and rationale.
```

### Optional (enrichment)

These improve portability, discoverability, and health tracking but are not required for a valid skill.

```yaml
subjects        # string[] (max 2, primary first) — polyhierarchy when a skill genuinely spans two browse shelves. Same enum as `subject`. See § Classification.
urn             # globally unique URN
taxonomy_domain # hierarchical taxonomy sub-path (e.g. "ecommerce/integrations/shopify") — renamed from `domain` in the 2026-05-27 amendment
paths           # glob[] — code surfaces this skill governs
examples        # string[] — positive activation prompts
anti_examples   # string[] — negative activation prompts (wrong-skill training)
project         # { handle, role }[] — projects this skill belongs to (replaces the removed `workspace_tags`)
repo            # { handle, url }[] — repos this skill is anchored to
routing_bundles  # string[] — routing group memberships
portability     # { readiness, targets }
lifecycle       # { stale_after_days, review_cadence }
runtime_telemetry  # { feedback_source, metrics }
comprehension_state # absent | present
# Understanding fields (v6+, flat) — required when comprehension_state: present
mental_model    # string — primitives and their relationships
purpose         # string — the problem this concept solves
boundary        # string — what this concept is NOT (with mechanism, not just label)
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
application_verdict     # APPLICABLE | REDUNDANT | HARMFUL | MIXED | FALSE_POSITIVE | UNVERIFIED | PROVISIONAL
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
- The routing contract, not a summary. Write for the router, not for a human reader.
- Lead with a trigger clause: `"Use when…"` or `"Activates for…"`.
- Include an explicit negative boundary: `"Do NOT use for…"`.
- Keep this focused on routing. The `## Coverage` section inside the body carries the full scope detail.

**`version`**
- Semver format: `x.y.z`. Bumped when the skill's instructional content changes.
- Independent of `schema_version` — the schema version signals the contract shape; the skill version signals the content revision.

**`owner`**
- A team handle, GitHub username, or tool name (e.g. `skill-bot`).
- Consumers use this to route review requests and alert on stale skills.

### Classification

> **v8 is the canonical classification.** The schema's global `required` array mandates `subject` + `deployment_target` + `scope`; `scope` is required free text, not an enum. See [ADR 0017](../docs/adr/0017-five-axis-classification-model.md) (operation axis retired 2026-05-27 — see ADR amendment block).

Skills are classified on three required authored facets — `subject` (what is taught), `deployment_target` (where it applies), and `scope` (what is in and out) — plus typed `relations` to other skills and two activation surfaces (`keywords` for fuzzy match, `triggers`/`examples`/`anti_examples` for explicit signals). The optional `subjects[]` array (max 2 entries, primary first) covers polyhierarchy when a skill genuinely spans two browse shelves; the optional `taxonomy_domain` field (slash-delimited sub-path) provides finer-grained subdivision *within* a subject.

| Axis | Type | Required | Purpose |
|---|---|---|---|
| **`subject`** | closed 9-enum | yes | Primary classification — what the skill teaches |
| **`deployment_target`** | closed 2-enum | yes | Deployment targeting — where the skill applies |
| **`scope`** | free-text | yes | PRD-style statement of what the skill teaches and what it does not |
| **`keywords`** | ≤10 strings | recommended | Fuzzy agent activation |
| **`relations`** | typed edges | recommended | Prerequisite + clustering graph |

#### `subject` (9 closed values)

The primary browse shelf and routing seed. Balance rule: each subject holds 5–25 skills; <5 = fold or recruit, >25 = subdivide via `taxonomy_domain`.

| Value | Description |
|---|---|
| `agent-ops` | Agent orchestration, dispatch, lifecycle, multi-agent comms |
| `code-engineering` | Backend, APIs, libraries, infrastructure, runtime |
| `frontend-ui` | UI components, layout, interaction, web framework specifics |
| `design-craft` | Visual design, typography, brand, motion, design tokens |
| `data-analytics` | Data viz, analytics, observability, financial display |
| `quality-assurance` | Testing, a11y, perf, security, type-safety |
| `meta-methods` | Methodology, reasoning, verification, decision frameworks |
| `knowledge-organization` | Taxonomy, semantics, classification, glossaries, ontology |
| `product-domain` | Domain-specific (Shopify, Stripe, fulfillment, integrations) |

Live per-subject counts are in [`SKILL_GRAPH.md § Current State`](../SKILL_GRAPH.md#current-state--single-source-of-truth); do not restate inline here.

**To propose a 10th subject value**: write an ADR in `docs/adr/` with (a) ≥5 existing skills that would label primarily under it, AND (b) evidence the value doesn't fit any existing subject by the disambiguation rules. Multi-fit secondaries belong in `subjects[1]`, not in a new top-level value.

#### `deployment_target` (2 closed values)

Deployment targeting — where this skill applies.

| Value | Means |
|---|---|
| `portable` | Repo-agnostic patterns — applies to any project |
| `project` | Coupled to a specific project; requires a populated `grounding` block + `project[]` membership |

The initial 2026-05-26 v8 design carried a 3-enum `scope` (`portable` / `workspace` / `project`); the 2026-05-27 amendment removed the `workspace` value and moved deployment targeting to `deployment_target`. Workspace-grounded skills migrate to `deployment_target: project` with explicit `project[]` membership. See [ADR-0017](../docs/adr/0017-five-axis-classification-model.md) amendment block.

#### `scope` (free-text, required)

A PRD-style statement of what the skill teaches and what it does not — mirrors the body `## Coverage` + `## Do NOT Use When` sections at the frontmatter level for fast scanning. NOT an enum; required on every current skill.

#### `keywords` (≤10 capped)

Semi-controlled vocabulary for fuzzy agent activation. The cap (max 10) prevents keyword stuffing.

Required when `routing_eval: present`. Strongly recommended for any routable skill.

#### `relations` (typed edges)

The graph layer. Seven edge types — `related`, `boundary` (⚠ name inverts mechanic — *excludes* the listed skills when this skill wins, does NOT defer to them; see § Relations § `boundary`), `disjoint_with`, `verify_with`, `depends_on`, `broader`, `narrower` — cycle-checked on `depends_on` + `broader` + `narrower`. See § Relations for the full edge contract.

#### Disambiguation rules (apply in order when choosing `subject` for a new skill)

  1. *Primary surface* — what the skill is *about*, not what it *enables*.
  2. *Property vs subject* — properties (a11y, perf, security, testing, type-safety) → `quality-assurance`. How-to-build → `code-engineering` / `frontend-ui` / `design-craft` / `agent-ops`.
  3. *Multi-fit* — skills that legitimately span two shelves set `subjects: [primary, secondary]` (max 2). Secondaries widen the browse net; they do NOT change the primary. Semantic adjacencies that are NOT subject-shaped still live in `relations.related`.
  4. *`meta-methods` and `knowledge-organization` gates* — anti-junk-drawer. `meta-methods` is for methodology/reasoning; `knowledge-organization` is for taxonomy/semantics/glossary work. Don't default here when the skill is really about engineering or quality.

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
5. For `deployment_target: project` skills: `grounding.truth_sources` must be non-empty.

**Pre-1.0 stance:** The library defaults all skills to `experimental` because the protocol and skill content are under active development. Skills are promoted to `stable` only when all five criteria above are met. This is intentional — a uniform `experimental` default correctly signals that the corpus as a whole is pre-1.0 and no stability guarantees are implied. As the audit loop completes more skills, the `by_stability` distribution in the manifest will become a meaningful quality signal. (Updated 2026-05-23 — SH-6309)

### Health and Drift

**`freshness`**
- ISO date the author last **reviewed** the skill's content. This is the **reviewer's footprint**, NOT the editor's footprint.
- Set by the author when they verify the skill is still accurate. The Audit Status field [`last_changed`](#audit-status-v6-flat--written-by-the-audit-loop) records when the SKILL.md was last **edited** (loop-stamped); the two are intentionally distinct because a skill can be edited without a fresh review (e.g. a typo fix) and reviewed without an edit (the author re-read and confirmed it still holds).
- Not computed; the author sets it. It is an authored claim, not a hash.
- Cosmetic edits (typo, formatting) should NOT bump `freshness` — they bump `last_changed` only. Substantive review or content update should bump `freshness`.
- Agents reading `freshness` should interpret it as "the author asserts they reviewed this on date X," NOT as "the file was last touched on date X" — for that, read `last_changed`.

**`drift_check`**
- Object with `last_verified` (ISO date, required) and `truth_source_hashes` (optional).
- `last_verified`: when the skill was last verified against its truth sources.
- `truth_source_hashes`: a map of normalized truth-source key -> SHA-256 hex digest at the time of last verification. Keys are `path` for whole-file sources, `path#Lstart-Lend` for line ranges, and `path#anchor` for anchor-only sources. Computed by `node scripts/skill-graph-drift.js --record --apply <skill-dir>` for local truth sources. The drift sentinel (`skill-graph drift`) reports `DRIFT` when a live hash differs from the recorded hash, `BROKEN` when a local truth source file is missing, `STALE` when today exceeds `last_verified + lifecycle.stale_after_days`, `NO_BASELINE` when local truth sources are declared but no hashes are recorded, and `EXTERNAL_UNHASHED` when a URL truth source is valid but is not fetched by the zero-dependency sentinel.

**`lifecycle`**
- Optional object: `{ stale_after_days, review_cadence }`.
- `stale_after_days`: integer days after `drift_check.last_verified` at which the skill is flagged stale. Integration skills that wrap external APIs typically need shorter windows (30–90 days) than pure concept skills (180+ days).
- `review_cadence`: one of `per-commit`, `weekly`, `quarterly`, `on-truth-source-change`.

### Evaluation Status

The three Evaluation Status fields are orthogonal — they measure different dimensions.

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
- `present`: the skill has comprehension grading and must populate either the **five flat Understanding fields** (`mental_model`, `purpose`, `boundary`, `analogy`, `misconception`) OR the legacy nested `concept` block.
- The current schema's `allOf` rule enforces this via an `anyOf` clause: at least one of the two shapes must be present. When both are present, the flat fields win.

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

**`boundary`** (the Understanding field — distinct from `relations.boundary`)
- Things commonly confused with the concept but that are NOT it. Express each difference as a *mechanism* (different primitives, different purpose, different scope) — not just different names.
- Graded by the comprehension grader's `boundary` dimension (weight 1.5).
- Field-name collision with `relations.boundary` is documented but **not** intentional — both fields are renamed in v8.1 per [ADR-0018](../docs/adr/0018-relations-boundary-semantic-inversion.md) (top-level `boundary` → `concept_boundary`; `relations.boundary` → `relations.suppresses`). Until then: top-level `boundary` is a string teaching the concept's edges; `relations.boundary` is an array of skill-name exclusion targets (see § Relations § `boundary` — it excludes listed skills from co-routing when this skill wins, not defers to them).

**`analogy`**
- One-sentence analogy that preserves the core mechanism. Translate for a non-expert without breaking the structural relationship between primitives.
- Graded by the comprehension grader's `analogy` dimension (weight 0.5).

**`misconception`**
- The wrong mental model people bring and why it misleads. Authored hint to inoculate the agent against the common error trap.
- Not directly graded; complements `boundary`.

**`concept`** (DEPRECATED in v6 — accepted for v5 back-compat)
- Legacy nested teaching block with seven sub-fields: `definition`, `mental_model`, `purpose`, `boundary`, `taxonomy`, `analogy`, `misconception`.
- Remains accepted for v5/v6 skills not yet migrated. Lint emits a warning when `concept` is populated but the flat Understanding fields are absent and the current schema version is set.
- The comprehension grader reads either location; flat fields win when both are present.

**`eval_last_run`**
- Optional evidence receipt for the most recent eval run.
- Required sub-fields when present: `at` (ISO date-time) and `status` (`pass`, `fail`, or `mixed`).
- Optional sub-fields: `runner`, `model`, `receipt`, `receipt_hash`.
- Use this to support `eval_state: passing` or `eval_state: monitored` with a concrete scorecard, grader history, or CI receipt.

### Audit Status (v6+, flat — written by the audit loop)

Seven flat top-level fields that record a skill's audit fingerprint in its own frontmatter, replacing the scattered log-file model of v5 (`eval-history.jsonl`, `routing-misses.jsonl`, `.opencode/progress/skill-audit-*`, `health-ledger.jsonl`, `findings/*.md`). The Skill Audit Loop reads these directly; no log-file crawl required.

**Do not hand-author these fields.** They are stamped by `scripts/skill/skill-audit.js`, `scripts/skill/evaluate-skill.js`, and `scripts/skill-graph-drift.js` as the audit loop runs. Hand-edits will be overwritten on the next `audit` run.

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
- Enum: `APPLICABLE` | `REDUNDANT` | `HARMFUL` | `MIXED` | `FALSE_POSITIVE` | `UNVERIFIED` | `PROVISIONAL`.
- Written by the application grader on `evals/application.json`. A skill is only behaviorally certified when this is `APPLICABLE`.
- `PROVISIONAL` records a single-model self-assessment audit that found useful behavior but has not passed the independent application grader. Default `UNVERIFIED` means no application assessment has run.

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

**`examples`**
- Positive-class activation examples — realistic user prompts this skill SHOULD activate for.
- 2–5 entries recommended. Used as few-shot signal for embedding-based routers.

**`anti_examples`**
- Negative-class activation examples — realistic prompts that look related but a DIFFERENT skill should handle.
- Pair with `relations.boundary` only when the target is same-domain and this skill owns the query; otherwise use `relations.related` plus the `anti_examples` text.

**`project`** / **`repo`** (belonging-entity references — replace the removed `workspace_tags`)
- `project`: array of `{ handle, role }` objects identifying which projects this skill belongs to (`role` suggested values: `source-of-truth`, `consumer`, `mirror`).
- `repo`: array of `{ handle, url }` objects identifying which repos this skill is anchored to.
- Absent means the skill is ambient (applies across all projects).
- A workspace config at `.skill-graph/config.json` can map literal project handles to semantic tag sets.

**`routing_bundles`**
- String array of routing group memberships. Used by routers that dispatch to groups of skills rather than individual skills.

### Relations

The `relations` block contains typed edges to sibling skills. Schema validation (via `skills.manifest.json` generation and manifest:validate) catches broken targets — the manifest compiler refuses to emit a relation to a skill that does not exist. `skill-lint.js` itself does NOT walk relation targets (that check was removed in the 2026-05-19 lint reduction); rely on `npm run manifest:validate` for the relation-integrity guarantee.

```yaml
relations:
  related:        # symmetric co-read relation (skos:related). v3.1 preferred name.
  boundary:       # routing-layer score-aware exclusion guard (sg:disjointOwnership). See warning below — does NOT defer to target.
  disjoint_with:  # formal class-disjointness assertion (owl:disjointWith).
  verify_with:    # skills to co-load for verification (prov:wasInformedBy).
  depends_on:     # skills this skill requires operationally or conceptually.
  broader:        # this skill is a specialisation of the target skill (skos:broader).
  narrower:       # this skill is a generalisation of the target (skos:narrower).
```

**`related`** (preferred) / `adjacent` (deprecated alias)
- Symmetric associative relation. Use when two skills should be co-read because they cover the same surface from different angles.
- Maximum 5 entries recommended to avoid hub-and-spoke clutter.
- `adjacent` is a deprecated alias from v3.0. Use `related` in all new skills. Tooling still accepts `adjacent` for back-compat, but new authoring should not introduce it.

**`boundary`** (the routing-layer field — distinct from the top-level Understanding `boundary` field)

> **WARNING — the field name inverts the runtime mechanic.** This will be resolved in v8.1 by renaming the field to `relations.suppresses` (matching mechanic) and renaming the Understanding-`boundary` field to `concept_boundary` (resolving the name collision). See [ADR-0018](../docs/adr/0018-relations-boundary-semantic-inversion.md) for the migration plan.
>
> Until v8.1 lands:
>
> `boundary: [skill-B]` does **NOT** mean "defer to skill-B." It means "**exclude skill-B from co-routing results when this skill wins.**" The name suggests deference; the mechanic is exclusion. Always write `reason` text that reflects ownership ("I own this exclusively over skill-B"), never deference ("use skill-B instead"), because the latter will mislead the next author — skill-B is suppressed by this entry, not promoted.
>
> **Runtime semantic:** the router applies `relations.boundary[]` as `if (target.score >= declarer.score) skip target`. This means:
> - The declarer can only exclude the target when the declarer is *currently outscoring* it on the query.
> - Score ties also trigger exclusion, so authored boundaries break ties deterministically.
> - A weaker-scoring skill cannot veto a stronger-scoring one.
>
> `boundary` entries protect the declarer's routing wins, not the target's. (Source: `skill-graph/scripts/skill-graph-route.js` Stage 5.)

- Routing-layer exclusion guard. Use to assert that this skill owns a use-case exclusively and the listed skills should not co-route when this skill wins the query.
- Items may be bare skill names or `{ skill, reason }` objects. Reasons are strongly recommended and must use ownership framing ("I own this exclusively over [skill]"), not deference framing ("use [skill] instead").
- This is a Skill-Graph-specific routing predicate, not formal OWL class disjointness.
- Same-domain only: see Cross-domain doctrine below.

**Cross-domain boundary doctrine — SAME-DOMAIN ONLY.** Codified 2026-05-17 after the Tier C″ empirical sweep across 8 Wave 6 skills:

1. `boundary[]` entries should declare SAME-DOMAIN handoffs only (same `subject` AND same `taxonomy_domain` sub-tree). Example: `code-engineering/frontend` ↔ `code-engineering/frontend` is fine; `code-engineering/frontend` ↔ `design-craft/component-systems` is not.
2. Cross-subject or cross-sub-domain handoffs belong in `anti_examples` + `relations.related`, NOT in `boundary[]`. The `anti_examples` array preserves routing-visible documentation as wrong-use phrases; `relations.related` signals the semantic adjacency without invoking the score-aware exclusion mechanic.
3. Empirical justification: removing 16 cross-domain `boundary[]` entries across 8 skills caused **0 top-1 routing changes** on the 30-query baseline; only 3/30 low-confidence unmaskings of legitimate alternatives at score 3 surfaced. The cross-domain entries were performing silent low-confidence exclusion only — exactly the silent-failure risk the doctrine prevents.

Authors who introduce a cross-domain `boundary[]` entry must move it to `anti_examples` + `relations.related` instead. Lint (planned, not yet implemented) will warn on cross-domain boundary declarations.

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

Required when `deployment_target: project`. Describes where the skill's claims are anchored in a specific project.

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
- `notes`: free-text notes. No protocol length cap.

**`allowed-tools`**
- Space-separated string of tool names the skill is authorized to invoke.
- Inherited from the plain `SKILL.md` format.

---

## Authored vs Generated Fields

### Authored in `SKILL.md` (human-written)

The canonical fields in the frontmatter are authored by humans, with two exceptions: `drift_check.truth_source_hashes` is computed by the drift sentinel (`skill-graph drift --record --apply`), and the **Audit Status** fields (`last_audited`, `last_changed`, `structural_verdict`, `truth_verdict`, `comprehension_verdict`, `application_verdict`, `eval_score`, `eval_failed_ids`, `lint_verdict`, `drift_status`) are stamped automatically by the Skill Audit Loop's `audit`, `improve`, `evaluate`, and grader operations. Do not hand-author the Audit Status — those values are owned by the loop and the dedicated graders (comprehension and application).

**Human-authored fields:**

```
schema_version, name, urn, description, version, subject, subjects,
deployment_target, scope, taxonomy_domain, project, repo, owner,
freshness, drift_check, eval_artifacts, eval_state, routing_eval,
comprehension_state, eval_last_run, stability, superseded_by, license,
compatibility, allowed-tools, triggers, keywords, examples,
anti_examples, paths, routing_bundles, relations, grounding,
portability, lifecycle, runtime_telemetry,
# Understanding fields — author these when comprehension_state: present
mental_model, purpose, boundary, analogy, misconception
```

**Loop-written fields (Audit Status):**

```
# Stamped by `audit` / `improve` / `evaluate` — do not hand-author
last_audited, last_changed, structural_verdict, truth_verdict,
comprehension_verdict, application_verdict, eval_score, eval_failed_ids,
lint_verdict, drift_status
```

### Generated in `skills.manifest.json` (tooling-computed)

The manifest generator (`scripts/generate-manifest.js`) reads the authored frontmatter and emits computed fields that do not exist in the source `SKILL.md`:

- `id` — derived from the skill's path relative to `skills/` (e.g. `task-execution`, or `<project>/design-review` in a multi-root workspace).
- `path` — relative path to the `SKILL.md` file.
- `summary` — aggregate counts (`total_skills`, `by_schema_version`, `by_subject`, `by_deployment_target`, `by_stability`, `by_project`).
- `generated_at` — ISO timestamp of when the manifest was generated.
- `activation` — compiled block merging `triggers`, `keywords`, `paths`, `examples`, and `anti_examples` from frontmatter.
- `health` — compiled block merging `eval_artifacts`, `eval_state`, `routing_eval`, `comprehension_state`, `eval_last_run`, `freshness`, and `drift_check`.

The manifest schema is at `schemas/manifest.schema.json`. For the complete authored-to-generated field rename map and loss policy, see `docs/manifest-field-mapping.md`.

---

## Schema contract

> **v8 is the canonical classification.** The schema's global `required` array mandates `subject` (closed 9-enum browse shelf) + `deployment_target` (closed 2-enum `portable`/`project`) + `scope` (required free text). The prior contract (v7 — with `type`, `category`, `categories`, `primaryCategory`, `layerPrimary`, `routingRole`) lives in git history; retrieve via `git show schema-v7:schemas/SKILL_METADATA_PROTOCOL_schema.json`; it is not accepted by the live schema. Note the initial 2026-05-26 v8 design carried an `operation` axis and a closed-enum `scope` that were both reshaped by the 2026-05-27 amendment (operation retired, scope repurposed to free-text, deployment_target introduced) — see CHANGELOG and ADR-0017. See `schemas/SKILL_METADATA_PROTOCOL_schema.json` for the live contract.

| Surface | State |
|---|---|
| **This doc (skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md)** | v8 |
| **Schema file (`schemas/SKILL_METADATA_PROTOCOL_schema.json`)** | v8. Global required: `subject`, `deployment_target`, `scope`, plus identity/lifecycle/Evaluation Status fields. `scope` is required free text. No v7 fields declared. |
| **Compiled manifest (`skills.manifest.json`) summary** | v8 (`by_subject`, `by_deployment_target`, `by_schema_version`, `by_stability`, `by_project`). |
| **Audit Loop checklist (`skill-audit-loop/SKILL_AUDIT_LOOP.md` § Part 2)** | v8 |

**What this means for authors:**

- A new skill MUST declare the v8 classification fields: `subject` (9-enum) + `deployment_target` (2-enum) + `scope` (required free text). Polyhierarchy via optional `subjects[]` (max 2). See § Classification.
- Skills still carrying v7 classification fields fail lint against the live schema. Migration of those skills is **CONTENT-mode work** handled per-skill through the audit loop (`/audit:audit`, `/audit:evolve`) — see `skill-graph/AGENTS.md § Work Modes — SYSTEM vs CONTENT`. The schema's correctness is independent of how many individual skills currently comply.
- The normalizer in `scripts/lib/parse-frontmatter.js::normalizeFrontmatter()` continues to read either physical encoding (nested `metadata:` or flat).

## Design Constraints

The contract enforces the following invariants. Any change to the schema or tooling that violates these invariants is a breaking change requiring a `schema_version` bump.

1. **One file, one skill.** Each skill lives in one `SKILL.md`. No split-source format. No per-environment variants.
2. **One manifest.** All skills aggregate into one `skills.manifest.json`. No closed/open split manifest.
3. **No private-only fields.** Every field in the schema is part of the public contract. There are no fields reserved for specific organisations or runtime environments.
4. **No second runtime model.** The same frontmatter shape serves local development, CI, and federated registry export. Export to plain `SKILL.md` is a transform (`scripts/export-skill.js`), not a separate authoring format.
5. **Strict schema.** `additionalProperties: false` on both the skill and manifest schemas. Unknown fields fail lint rather than being silently ignored.
6. **Additive evolution only within a version.** New optional fields, new enum values that extend (not replace) an existing enum, and new lint warnings are non-breaking. Renamed fields, removed fields, retyped fields, tightened required-ness, and removed enum values require a `schema_version` bump.
7. **Migration tooling ships with every breaking change.** The v3 bump ships `scripts/migrate-skill-v2-to-v3.js`; the v4 bump ships `scripts/migrate-skill-v3-to-v4.js`. Future bumps follow the same pattern.

---

*See `skill-metadata-protocol/design-rationale.md` for full design rationale, overlay composition precedence, and schema versioning policy. See `skill-metadata-protocol/field-reference.md` for one section per field with examples. See `schemas/SKILL_METADATA_PROTOCOL_schema.json` for the machine-enforceable version of this contract.*
