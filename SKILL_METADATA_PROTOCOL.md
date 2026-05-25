# Skill Metadata Protocol

> **Version:** 1.4.0 (schema_version 7, Skill Graph 0.5.9)
> **Machine-readable schema:** `schemas/skill.schema.json`
> **Detailed field reference:** `docs/field-reference.md`
> **Full semantics + design rationale:** `docs/skill-metadata-protocol.md`

This document is the top-level public contract for the Skill Metadata Protocol frontmatter format — the **normative spec**. It defines which fields are required, what each field means in operational terms, which fields are authored by humans vs computed by tooling, and how to migrate from older schema versions. Skill Graph is the library-level system that consumes this contract. The prose is terse and boundary-aware: every clause is a rule a consumer or author can verify against the schema and the focused Skill Graph verification tools.

**Companion docs by genre.** This contract is the *what*. The *why* — design rationale, archetype semantics, OntoClean rigidity, the eval-health triple's orthogonality, the JSON-LD W3C mappings, and the philosophical posture behind the field choices — lives in [`skill-metadata-protocol.md`](docs/skill-metadata-protocol.md). The two docs are coordinated and grow together: a normative rule that lacks a "why" is fragile; a "why" that lacks a normative rule is vapourware. If you are authoring a SKILL.md, you read this file. If you are deciding whether to add a field to the schema, you read both.

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
5. [Design Constraints](#design-constraints)

---

## Overview

Every skill is a single `SKILL.md` file with a YAML frontmatter block. The schema contract is `schemas/skill.schema.json`; deterministic verification is split across focused tools. `skill-lint.js` enforces the canonical-source schema gate (valid frontmatter, validation against `schemas/skill.schema.json`, identifier shape, non-empty description, parent-directory/name alignment), while `check-protocol-consistency.js`, `check-category-enum.js`, `generate-manifest.js`, routing evals, drift checks, and export verification cover the broader protocol surface. The `generate-manifest.js` script reads frontmatter from all skill files and emits a single `skills.manifest.json`.

The contract has one runtime model: one `SKILL.md` per skill, one manifest, one lint pass. There is no closed/open split, no private control plane, and no enterprise-only fields.

### Two physical encodings, one logical contract

The field tables in this document describe the **logical contract** — the field set, types, and semantics. That logical contract has **two valid physical encodings on disk**, and the tooling normalizes both before reading:

| Encoding | Shape | Where it is used |
|---|---|---|
| **Protocol-native** | Every field a top-level YAML key; structured fields (`relations`, `drift_check`, `grounding`, …) are native YAML objects/arrays. | The shape the field tables below illustrate; produced by the authoring template. |
| **Agent-Skills-compatible** | Only `name`, `description`, `license`, `compatibility`, `allowed-tools` at top level; **all other fields nested under a `metadata:` map, with objects and arrays JSON-string-encoded** (e.g. `relations: "{\"boundary\":[…]}"`). | The shape the **entire canonical library** at `~/Development/skills/` is authored in, because that repo is also the public Agent-Skills release repo (one repo, two hats — see `AGENTS.md § Public Distribution`). |

`scripts/lib/parse-frontmatter.js::normalizeFrontmatter()` reconciles the two: it lifts `metadata.*` back to top level and `JSON.parse`s the stringified values, so `skill-lint.js`, `generate-manifest.js`, `skill-graph-route.js`, and `skill-graph-drift.js` all see the protocol-native shape regardless of which encoding the file uses. Two precedence rules apply: (1) a top-level field wins over a `metadata.*` field of the same name (the explicit author signal wins); (2) export-provenance keys (`skill_graph_source_repo`, `skill_graph_protocol`, `skill_graph_project`, `skill_graph_canonical_skill`, and the description-length book-keeping keys) are **stripped** during normalization and are not part of the contract — a consequence is that the `skill_graph_protocol` content-label is invisible to all deterministic tooling and is governed by human discipline only (see `AGENTS.md § Version Labels Are Earned, Not Bumped`). Round-tripping from the Agent-Skills shape back to protocol-native is lossy for rich types; keep the canonical source authoritative. See `docs/SKILL-MD-FORMAT-COMPATIBILITY.md`.

---

## Required vs Optional Fields

### Required for all skills

All thirteen fields in this group are required by the v7 schema and protocol contract. The `skill-lint.js` schema gate enforces the current schema shape; use the protocol, manifest, routing, drift, export, and eval checks for the rest of the full contract.

| Field | Type | Purpose |
|---|---|---|
| `schema_version` | integer `7` | Signals the contract version. Must be `7` for all v7 skills. Prior versions live in git history (see ADR 0014 — canonical-only schema files). |
| `name` | string | Stable identifier. Used for routing and `relations.*` targets. |
| `description` | string (≥20 chars) | Routing contract — tells the router when to activate this skill. |
| `version` | semver string | Skill content version (e.g. `1.2.0`). Bumped by the author. |
| `type` | enum | One of: `capability`, `workflow`, `router`, `overlay`. |
| `category` | enum | Browse facet — the skill's *primary* category. One of: `foundations`, `engineering`, `design`, `quality`, `agent`, `product`. v7-required; v8 deprecates this in favor of `categories: [string]` (ordered, primary first). See § Classification for the unified taxonomy, the foundations-gate, and the v7→v8 migration plan. |
| `scope` | enum | One of: `codebase`, `reference`, `portable`. |
| `owner` | string | Team, username, or tool that is responsible for keeping this skill current. |
| `freshness` | ISO date | Date the skill body was last reviewed or updated. |
| `drift_check` | object | Contains `last_verified` (ISO date) and optional `truth_source_hashes`. |
| `eval_artifacts` | enum | One of: `none`, `planned`, `present`. |
| `eval_state` | enum | One of: `unverified`, `passing`, `monitored`. |
| `routing_eval` | enum | One of: `absent`, `present`. |

### Conditionally required

These fields are required only when a specific condition is met. The first three are enforced by JSON-Schema `allOf` rules and therefore by the schema lint gate. The `keywords` rule is a routing-quality convention verified by review and routing evals rather than by schema lint, since the schema cannot reason about routability intent.

| Field | Required when | Enforced by |
|---|---|---|
| `extends` | `type: overlay` | schema `allOf` |
| `grounding` | `scope: codebase` | schema `allOf` |
| `superseded_by` | `stability: deprecated` | schema `allOf` |
| `keywords` | `scope: codebase` OR `routing_bundles` is set | routing review / routing evals |

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
categories      # string[] (v7 optional, v8 required) — ordered list, primary first, max 5. Same enum as `category`. See § Classification.
primaryCategory # string (workspace alias) — equivalent to `categories[0]`. Normalized on read; title-case workspace values map to lowercase enum.
urn             # globally unique URN
domain          # hierarchical domain path (e.g. "ecommerce/integrations/shopify")
paths           # glob[] — code surfaces this skill governs
examples        # string[] — positive activation prompts
anti_examples   # string[] — negative activation prompts (wrong-skill training)
workspace_tags    # string[] — project handles or semantic tags
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
# Health Block (v7+, flat) — written by the audit loop, not hand-authored
last_audited            # ISO date — when `audit` last ran
last_changed            # ISO date — when the SKILL.md was last edited
# v7 four-verdict Health Block (replaces the single v6 audit_verdict):
structural_verdict      # PASS | PASS_WITH_FIXES | FAIL | UNVERIFIED (form roll-up, gates 1-2, 7)
truth_verdict           # PASS | DRIFT | BROKEN | UNVERIFIED (truth roll-up, gates 3-6)
comprehension_verdict   # PASS | SHALLOW | REDUNDANT | UNVERIFIED | PROVISIONAL | SKIPPED_BASELINE_HIGH | NA
                        # (gate 8, demoted in v7 — cheap smoke test only, never alone certifying)
application_verdict     # APPLICABLE | REDUNDANT | HARMFUL | MIXED | FALSE_POSITIVE | UNVERIFIED | PROVISIONAL
                        # (gate 9, primary quality signal — a skill is only behaviorally certified
                        #  when this verdict is APPLICABLE)
eval_score              # number 0.0–5.0 — latest aggregate eval grade
eval_failed_ids         # string[] — failing eval IDs (empty when clean)
lint_verdict            # PASS | FAIL | UNKNOWN (per-script signal from skill-lint.js)
drift_status            # OK | DRIFT | BROKEN | STALE | NO_BASELINE | EXTERNAL_UNHASHED | UNKNOWN (per-script signal from skill-graph-drift.js)
# audit_verdict         # DEPRECATED in v7 — the v6 single aggregate, replaced by the four verdicts above.
                        # Pre-v7 enum: PASS | PASS_WITH_FIXES | PARTIAL | FAIL | UNKNOWN. See docs/adr/0011-split-audit-verdict-into-four-verdicts.md.
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

**`type`**
- `capability` — a skill that describes knowledge or a repeatable technique.
- `workflow` — a skill that describes a step-by-step process or procedure.
- `router` — a skill that describes routing logic (which skill to activate for which query).
- `overlay` — a skill that specialises another skill. Must have `extends: <parent-skill-name>`. Non-overlay types must NOT have `extends`.

**`scope`**
- `codebase` — repo-specific; requires the `grounding` block so consumers know which files anchor the skill's claims.
- `reference` — general-purpose reference knowledge not tied to a specific codebase.
- `portable` — cross-repo knowledge, intended for distribution via `portability.targets`.

**`category` and `categories` — one taxonomy, primacy by order**

A skill can legitimately belong to more than one shelf — `webhook-integration` is primarily `engineering` and secondarily `quality` because reliable delivery is a cross-cutting non-functional property. To model that honestly without sacrificing closed-enum browseability, the protocol distinguishes the **primary** slot from the **full set** of categories the skill covers, but they read off the same 6-value enum. There is one taxonomy, never two.

| Field | Type | Required | Meaning |
|---|---|---|---|
| `category` | single enum string | v7: yes · v8: deprecated | The skill's primary category. Equals `categories[0]` when both are present. |
| `categories` | ordered array of enum strings, min 1, max 5 | v7: optional · v8: required | First entry is the primary; remaining entries are secondaries the skill also covers. |
| `primaryCategory` | single enum string | optional alias | Workspace's parallel field name. Title-case workspace values (`Agent System`, `Technical Capability`, `Design & UX`, `Product Domain`, `Meta Method`) normalize to the lowercase enum below. |
| `layerPrimary` | string facet | optional workspace facet | Primary architectural or concern layer consumed by workspace routers/census tooling; orthogonal to the browse category. |
| `routingRole` | string facet | optional workspace facet | How a workspace router should use the skill (`primary`, `router`, `verifier`, `gate`, etc.); orthogonal to `type`. |

When both `category` and `categories` are present, `categories[0]` MUST equal `category`; the JSON Schema now enforces that prefix rule. `primaryCategory` is a typed alias accepted by the schema for workspace policy, but protocol-native skills should prefer lowercase `category` / `categories`.

`layerPrimary` and `routingRole` are workspace routing facets. They are not category aliases and do not create new browse shelves. If a task needs better activation precision, first improve `description`, `keywords`, examples, and `relations.*`; use these two facets only when a workspace router or census has a concrete consumer for them. The legacy `layer` field is not part of the v7 protocol.

A browse facet — answers the single question for the primary slot: *Where should a human browse to find this skill first?* Hierarchical taxonomy uses the optional `domain` field with slash-delimited segments; `domain` complements `categories[0]`, it does not replace it.

**The closed enum — 6 values shared by all three fields.**

  | Value | Definition | Workspace title-case alias |
  |---|---|---|
  | `foundations` | Epistemics, methodology, verification, reasoning, taxonomy, semantics — preconditions of competent agent or engineering work. Reserved category — must justify membership against the foundations gate; cannot default here. Target size 8–15 skills. | `Meta Method` (folds in) |
  | `engineering` | Building software systems: APIs, data, infra, runtime, integrations. | `Technical Capability` |
  | `design` | Visual, interaction, IA, content, motion — design as a discipline. | `Design & UX` |
  | `quality` | Cross-cutting non-functional properties: a11y, performance, security, type-safety, testing, observability. Properties of any artifact. | lowercase alias only |
  | `agent` | Agent-specific concepts: tool design, prompt design, agent state, orchestration, eval-driven dev. | `Agent System` |
  | `product` | Prioritization, scope, MVP, PRDs, customer journey, positioning. | `Product Domain` |

**Why the enum is closed at 6 values (not arbitrary).**
1. **Browseability (Miller's 7±2).** Top-level shelves serve human navigation. Six shelves stay within working-memory capacity; twelve degrade browsing to search.
2. **MECE pressure on individual values.** An open string enum invites synonym sprawl (`frontend / front-end / ui / web-ui / client-side` all naming the same shelf). Closure forces authors to pick an existing value or propose a new one via ADR — never one-off invention. Multi-assignment via `categories[]` solves the "this skill spans shelves" pressure without weakening per-value clarity.
3. **Foundations anti-junk-drawer gate.** Without closure, `foundations` becomes the default fallback for ambiguous skills. The closed enum plus disambiguation rule #4 keep `foundations` to its intended size.

**To propose a 7th value**, write an ADR in `docs/adr/` with (a) ≥10 existing skills that would label primarily under the new value, AND (b) evidence the value doesn't fit any existing category by the disambiguation rules. Without both, the proposal closes. Multi-fit secondaries belong in `categories[1..]`, not in a new top-level value.

**Disambiguation rules** (apply in order to choose the *primary* slot):
  1. *Primary surface* — what the skill is *about*, not what it *enables*.
  2. *Property vs subject* — properties (a11y, perf, security, testing, type-safety) → `quality`. How-to-build → `engineering` / `design` / `agent`.
  3. *Multi-fit* — skills that legitimately span shelves set `categories: [primary, ...secondaries]` (max 5). Secondaries widen the browse net; they do NOT change the primary. Semantic adjacencies that are NOT category-shaped still live in `relations.related`.
  4. *`foundations` gate* — anti-junk-drawer. Membership requires (a) the skill teaches an epistemic precondition AND (b) it cannot be plausibly assigned to `agent`/`engineering`/`quality`/`design`. If `foundations` exceeds 20 entries, the gate has failed and the migration is misrouted.

**Migration plan (v7 → v8).** v8 will:
- Make `categories: [string]` required (min 1, max 5).
- Deprecate the singular `category` field; normalizer treats `category: X` as `categories: [X]`.
- Drop the workspace title-case `primaryCategory` values; the workspace migrates to the lowercase enum (codemod `scripts/migrate-skill-v7-to-v8.js`, planned).
- The `primaryCategory` field NAME may remain as a back-compat alias for `categories[0]` if useful; the title-case VALUES are what's being retired.

  **Routing triple observation (Updated 2026-05-24).** The `category × type × scope` triple is documented in `AGENTS.md` as a "first-pass discriminator" that the routing layer uses before walking edges. In practice, the triple has *weak* discriminating power on the current 147-skill corpus and should be treated as a broad browse facet, not a routing workhorse. Verified distribution (2026-05-24, `skills.manifest.json` generated by `generate-manifest.js`):

  | Axis | Value | Count | Share |
  |---|---|---|---|
  | **category** | `engineering` | 59 | 40% |
  | | `quality` | 28 | 19% |
  | | `design` | 28 | 19% |
  | | `agent` | 17 | 12% |
  | | `foundations` | 14 | 10% |
  | | `product` | 1 | <1% |
  | **type** | `capability` | 136 | 93% |
  | | `workflow` | 8 | 5% |
  | | `router` | 2 | 1% |
  | | `overlay` | 1 | <1% |
  | **scope** | `portable` | 98 | 67% |
  | | `reference` | 49 | 33% |

  Because ~93% of skills share `type: capability` and ~67% share `scope: portable`, the `type × scope` pair resolves most queries to the same stratum. Category alone provides 6 buckets over 147 skills (average about 25 skills per bucket), which is a useful browse shelf but not useful routing precision. **The routing load is carried by keyword score, description match, and relation edges — not by the triple.** This is by design: `category` is a human navigation facet; `keywords`, `description`, `relations.*`, and the `domain` path field are the routing signals that actually discriminate.

  **Implication for authors:** Choose `category` based on where a human would browse to discover this skill. Do not try to game `category` for routing — it will not help. For fine-grained routing or grouping, use `keywords` (fuzzy match), `routing_bundles` (explicit group membership), and `domain` (hierarchical sub-path like `engineering/api-design`). If the routing layer needs to distinguish two skills that share a category, the description and keywords are the correct knobs to turn.

  **Implication for routing developers:** Do not rely on `category` alone as a filter. The `domain` field carries sub-path information (e.g. `engineering/api-design` vs `engineering/database`) that can provide finer discrimination than the top-level category. If the routing evaluation shows confusion between co-category skills, tightening their `description` and `keywords` — or adding a `relations.boundary` entry — is more effective than re-categorizing.

**`domain`**
- Optional slash-delimited domain path (e.g. `design/ux`, `architecture/events`).
- Renamed from v3 `category` / `category_path`; values are unchanged.
- Complements `category`. Do not use it as a second flat shelf.

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
5. For `scope: codebase` skills: `grounding.truth_sources` must be non-empty.

**Pre-1.0 stance:** The library defaults all skills to `experimental` because the protocol and skill content are under active development. Skills are promoted to `stable` only when all five criteria above are met. This is intentional — a uniform `experimental` default correctly signals that the corpus as a whole is pre-1.0 and no stability guarantees are implied. As the audit loop completes more skills, the `by_stability` distribution in the manifest will become a meaningful quality signal. (Updated 2026-05-23 — SH-6309)

### Health and Drift

**`freshness`**
- ISO date the author last **reviewed** the skill's content. This is the **reviewer's footprint**, NOT the editor's footprint.
- Set by the author when they verify the skill is still accurate. The Health Block field [`last_changed`](#health-block-v6-flat--written-by-the-audit-loop) records when the SKILL.md was last **edited** (loop-stamped); the two are intentionally distinct because a skill can be edited without a fresh review (e.g. a typo fix) and reviewed without an edit (the author re-read and confirmed it still holds).
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
- `present`: the skill has comprehension grading and must populate either the **five flat Understanding fields** (`mental_model`, `purpose`, `boundary`, `analogy`, `misconception` — preferred in v6) OR the legacy nested `concept` block (v5 back-compat).
- The v6 schema's `allOf` rule enforces this via an `anyOf` clause: at least one of the two shapes must be present. When both are present, the flat fields win.

### Understanding (v6+, flat)

Five flat top-level fields that teach the agent what the skill's subject *is*. They replace the v5 nested `concept` block (which retired the `definition` and `taxonomy` sub-fields: `definition` is now covered by `description`, `taxonomy` by `category` + `relations.broader`).

**Relationship to the body `## Concept Card` section.** The five flat frontmatter fields are the **canonical machine-readable contract** — routers, evaluators, retrieval systems, and lint tools read them directly. The body `## Concept Card` section (per the v2.2 audit prompt's 7-bold-field format: `**What it is:**`, `**Mental model:**`, `**Why it exists:**`, `**What it is NOT:**`, `**Adjacent concepts:**`, `**One-line analogy:**`, `**Common misconception:**`) remains the operational **human-readable rich-expansion form** carrying content the 5 flat fields cannot hold (e.g. "Why it exists" rationale and "Adjacent concepts" cross-links). Both forms are supported in v7. The author owns the consistency: when both are present, the body Concept Card MUST agree with the frontmatter fields. The audit prompt (`.opencode/commands/skill-audit-prompt-v2.2.md` § Step 4b) checks the body section's presence and field completeness; the schema enforces the frontmatter. Earlier protocol notes that called body Concept Card "retired in v6" reflected the migration of the *machine-readable subset* to frontmatter, not removal of the body section from authoring practice — which remains in active use across the corpus.

Required when `comprehension_state: present`. No protocol length cap on any of these — author each field as deeply as the concept requires.

**`mental_model`**
- Primitives and their relationships. Name the primitives. Name the relationships between them. Markdown permitted inside the string.
- Graded by the comprehension grader's `mental_model` dimension (weight 1.5).
- Distinct from `## Philosophy` in the body, which explains *why this skill file exists in this repo*; `mental_model` explains *what the subject is, universally*.

**`purpose`**
- What problem the concept solves AND the alternative it replaced. Concrete pain point + prior alternative.
- Graded by the comprehension grader's `purpose` dimension (weight 1.0).

**`boundary`** (the Understanding field — distinct from `relations.boundary`)
- Things commonly confused with the concept but that are NOT it. Express each difference as a *mechanism* (different primitives, different purpose, different scope) — not just different names.
- Graded by the comprehension grader's `boundary` dimension (weight 1.5).
- Field-name collision with `relations.boundary` is intentional and disambiguated by nesting depth: top-level `boundary` is a string teaching the concept's edges; `relations.boundary` is an array of skill-name exclusion targets (see § Relations § `boundary` — it excludes listed skills from co-routing when this skill wins, not defers to them).

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

### Health Block (v6+, flat — written by the audit loop)

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

**`structural_verdict`** *(v7+)*
- Form-layer verdict (gates 1–2, 7: schema lint, manifest census, concept-card shape).
- Enum: `PASS` | `PASS_WITH_FIXES` | `FAIL` | `UNVERIFIED`.
- Rolled up from `lint_verdict` by the audit loop. Only external-constraint violations (Anthropic Agent Skills marketplace shape, required-fields, valid YAML) produce `FAIL`; internal style preferences are lint warnings.

**`truth_verdict`** *(v7+)*
- Truth-layer verdict (gates 3–6: truth-source catalog, drift sentinel, test coverage, claim verification).
- Enum: `PASS` | `DRIFT` | `BROKEN` | `UNVERIFIED`.
- Rolled up from `drift_status` by the audit loop.

**`comprehension_verdict`** *(v7+)*
- Comprehension-layer verdict (gate 8, demoted in v7 to a cheap smoke test).
- Enum: `PASS` | `PROVISIONAL` | `SHALLOW` | `REDUNDANT` | `UNVERIFIED` | `SKIPPED_BASELINE_HIGH` | `NA`.
- Written by the comprehension grader. Never alone certifies a skill — `application_verdict` is the aggregate-quality field.

**`application_verdict`** *(v7+)* — **the primary quality signal**
- Application-layer verdict (gate 9: behavioral change on real artifacts).
- Enum: `APPLICABLE` | `REDUNDANT` | `HARMFUL` | `MIXED` | `FALSE_POSITIVE` | `UNVERIFIED` | `PROVISIONAL`.
- Written by the application grader on `evals/application.json`. A skill is only behaviorally certified when this is `APPLICABLE`.
- `PROVISIONAL` records a single-model dogfood audit that found useful behavior but has not passed the independent application grader. Default `UNVERIFIED` means no application assessment has run.

**`audit_verdict`** *(DEPRECATED in v7)*
- Pre-v7 single aggregate verdict, replaced by the four discrete verdicts above.
- Enum (historical): `PASS` | `PASS_WITH_FIXES` | `PARTIAL` | `FAIL` | `UNKNOWN`.
- The v7 codemod (`scripts/migrate-skill-v6-to-v7.js`) strips this field. See [ADR 0011](docs/adr/0011-split-audit-verdict-into-four-verdicts.md).

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

**`workspace_tags`**
- Literal project handles or semantic tags identifying which projects this skill is relevant to.
- Absent means the skill is ambient (applies across all projects).
- A workspace config at `.skill-graph/config.json` can map literal project handles to semantic tag sets.

**`routing_bundles`**
- String array of routing group memberships. Used by routers that dispatch to groups of skills rather than individual skills.

### Relations

The `relations` block contains typed edges to sibling skills. All targets are validated by lint — a broken target (skill that does not exist) is an error.

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

> **WARNING — the field name inverts the runtime mechanic.**
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

1. `boundary[]` entries should declare SAME-DOMAIN handoffs only (same `category` AND same `domain` sub-tree). Example: `engineering/frontend` ↔ `engineering/frontend` is fine; `engineering/frontend` ↔ `design/component-systems` is not.
2. Cross-category or cross-sub-domain handoffs belong in `anti_examples` + `relations.related`, NOT in `boundary[]`. The `anti_examples` array preserves routing-visible documentation as wrong-use phrases; `relations.related` signals the semantic adjacency without invoking the score-aware exclusion mechanic.
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

The canonical fields in the frontmatter are authored by humans, with two exceptions: `drift_check.truth_source_hashes` is computed by the drift sentinel (`skill-graph drift --record --apply`), and the v7 **Health Block** fields (`last_audited`, `last_changed`, `structural_verdict`, `truth_verdict`, `comprehension_verdict`, `application_verdict`, `eval_score`, `eval_failed_ids`, `lint_verdict`, `drift_status`) are stamped automatically by the Skill Audit Loop's `audit`, `improve`, `evaluate`, and grader operations. Do not hand-author the Health Block — those values are owned by the loop and the dedicated graders (comprehension and application). The pre-v7 `audit_verdict` field is deprecated; the codemod (`scripts/migrate-skill-v6-to-v7.js`) strips it from migrated skills.

**Human-authored fields:**

```
schema_version, name, urn, description, version, type, category,
domain, scope, owner, freshness, drift_check, eval_artifacts, eval_state,
routing_eval, comprehension_state, eval_last_run, stability,
superseded_by, license, compatibility, allowed-tools, extends, triggers,
keywords, examples, anti_examples, paths, workspace_tags, routing_bundles,
relations, grounding, portability, lifecycle, runtime_telemetry,
# Understanding (v6+) — author these when comprehension_state: present
mental_model, purpose, boundary, analogy, misconception,
# Legacy v5 — accepted for back-compat
concept
```

**Loop-written fields (v7+, Health Block):**

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
- `summary` — aggregate counts (`total_skills`, `by_type`, `by_category`, `by_scope`, `by_stability`).
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

*See `docs/skill-metadata-protocol.md` for full design rationale, overlay composition precedence, and schema versioning policy. See `docs/field-reference.md` for one section per field with examples. See `schemas/skill.schema.json` for the machine-enforceable version of this contract.*
