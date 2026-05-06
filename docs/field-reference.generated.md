# Skill Graph Field Reference (Generated)

> **Generated from** `schemas/skill.v3.schema.json` on 2026-05-06 by `scripts/build-field-reference.js`.
> **Do not edit by hand.** The canonical prose reference is [`docs/field-reference.md`](field-reference.md).
> **Predicate glossary:** [`docs/glossary.md`](glossary.md).
> **JSON-LD @context:** [`schemas/skill.context.jsonld`](../schemas/skill.context.jsonld).

Schema version: **3** · Field count: **33** · Required: **13**

---

### `schema_version` *(required)*

**Type:** multiple — see schema

Major contract shape version. Integer for v3+; string '3' tolerated for back-compat with hand-rolled YAML. Bumps when shape changes break consumers (additive minor changes do not bump). v4 is the next breaking-change horizon — see CHANGELOG.md and docs/metadata-contract.md § Schema Versioning Policy.

**Full reference:** [`docs/field-reference.md#schema_version`](field-reference.md#schema_version)

---

### `name` *(required)*

**Type:** string

Stable display-layer skill identifier. Lowercase kebab-case; allows `/` and `:` for hierarchical/namespaced names. Must equal the parent directory name (skills/<name>/SKILL.md). The URN at `urn` is the long-term globally-unique identifier; `name` is the local handle.

**Pattern:** `^[a-z0-9][a-z0-9-/:]*$`

**Full reference:** [`docs/field-reference.md#name`](field-reference.md#name)

---

### `urn` *(optional)*

**Type:** string

Optional globally-unique persistent identifier in the `urn:skill:<repo>:<skill-name>` form (RFC 8141). Unlocks FAIR Findability across repos and federated skill registries. Consumers treat the URN as the stable identity; `name` is the display-layer handle. The `<skill-name>` segment MUST equal the `name` field. Optional in v3; target-required in v4 (ADR 0004).

**Pattern:** `^urn:skill:[a-z0-9][a-z0-9-]*:[a-z0-9][a-z0-9-/:]*$`

**Full reference:** [`docs/field-reference.md#urn`](field-reference.md#urn)

---

### `description` *(required)*

**Type:** string

The routing contract — tells a router whether this skill should activate for a given query. Pushy, specific, boundary-aware. Should include an explicit negative boundary ("Do NOT use for…") so the router doesn't over-activate. Min 20 characters.

**Min length:** 20

**Full reference:** [`docs/field-reference.md#description`](field-reference.md#description)

---

### `version` *(required)*

**Type:** string

Skill content version (semver). Bumps when the SKILL.md body or contract changes meaningfully. Distinct from `schema_version` (the contract shape). Used by `relations.depends_on` for `min_version` constraints.

**Pattern:** `^[0-9]+\.[0-9]+\.[0-9]+$`

**Full reference:** [`docs/field-reference.md#version`](field-reference.md#version)

---

### `type` *(required)*

**Type:** `capability` | `workflow` | `router` | `overlay`

Archetype classifier — what kind of skill this is. `capability` (knows how to do something), `workflow` (orchestrates a sequence), `router` (dispatches to other skills), `overlay` (specialises a parent via `extends`). OntoClean rigidity tags per ADR 0003.

**Full reference:** [`docs/field-reference.md#type`](field-reference.md#type)

---

### `browse_category` *(required)*

**Type:** string

Flat human browse bucket (e.g., knowledge, engineering, quality). Renamed from v2 `family`. For hierarchical taxonomy use `category` instead.

**Full reference:** [`docs/field-reference.md#browse_category`](field-reference.md#browse_category)

---

### `category` *(optional)*

**Type:** string

Hierarchical browse path using slash-delimited segments (e.g., `ecommerce/integrations/shopify`). Complements `browse_category`; flat vs tree answer different questions.

**Pattern:** `^[a-z0-9][a-z0-9-]*(/[a-z0-9][a-z0-9-]*)*$`

**Full reference:** [`docs/field-reference.md#category`](field-reference.md#category)

---

### `scope` *(required)*

**Type:** `codebase` | `reference` | `portable`

Where this skill applies. `codebase` — coupled to a specific repo's code/conventions; `reference` — pure knowledge (no repo coupling); `portable` — repo-agnostic patterns. Drives multi-project overlay decisions and informs the router's project-fit check.

**Full reference:** [`docs/field-reference.md#scope`](field-reference.md#scope)

---

### `owner` *(required)*

**Type:** string

Maintainer or team accountable for keeping this skill correct. Free-form string; conventional values: `skill-graph-maintainer`, GitHub team handles, individual usernames. Used by drift-check workflows to route review requests.

**Full reference:** [`docs/field-reference.md#owner`](field-reference.md#owner)

---

### `freshness` *(required)*

**Type:** string

ISO date (YYYY-MM-DD) of the last meaningful content review. The author's claim that the skill was current as of this date. Complemented by `drift_check.truth_source_hashes` for grounded skills. ADR 0005 documents the freshness consolidation policy.

**Format:** date

**Full reference:** [`docs/field-reference.md#freshness`](field-reference.md#freshness)

---

### `drift_check` *(required)*

**Type:** object

Drift-detection record for grounded skills. `last_verified` is the author's claim; `truth_source_hashes` is content-addressable evidence (SHA-256 per truth source file). The combination lets `scripts/skill-graph-drift.js` detect when underlying truth has changed without an accompanying review.

**Sub-fields:**

- `last_verified` *required* — ISO date of the last verification against truth sources.
- `truth_source_hashes` *optional* — Map of truth source file path → SHA-256 hex digest at the time of last verification.

**Full reference:** [`docs/field-reference.md#drift_check`](field-reference.md#drift_check)

---

### `eval_artifacts` *(required)*

**Type:** `none` | `planned` | `present`

Are eval artifacts present on disk for this skill? `none` (no evals planned), `planned` (eval intent declared but not yet shipped), `present` (eval JSON exists at `evals/<skill>.json` or similar). Lint enforces the `present` claim by requiring a real file. The `planned` state has a staleness guard — see lint check 6.

**Full reference:** [`docs/field-reference.md#eval_artifacts`](field-reference.md#eval_artifacts)

---

### `eval_state` *(required)*

**Type:** `unverified` | `passing` | `monitored`

What does the eval say about content quality? `unverified` (no eval has run), `passing` (last run passed), `monitored` (eval runs on a cadence and is currently passing). Independent of `routing_eval` (the routing-coverage axis). Use to express content-level quality grading orthogonal to routing coverage.

**Full reference:** [`docs/field-reference.md#eval_state`](field-reference.md#eval_state)

---

### `routing_eval` *(required)*

**Type:** `absent` | `present`

Is routing / trigger coverage explicitly evaluated? `absent` (router behaviour is not part of the eval set), `present` (the skill's `examples[]` and `anti_examples[]` pass `scripts/skill-graph-routing-eval.js`). When `present`, lint check 12 requires the harness to agree. Honesty over green checkmarks — flip to `present` only after the harness PASSes.

**Full reference:** [`docs/field-reference.md#routing_eval`](field-reference.md#routing_eval)

---

### `stability` *(optional)*

**Type:** `experimental` | `stable` | `frozen` | `deprecated`

Lifecycle posture for consumers. `experimental` (subject to change), `stable` (production-ready), `frozen` (no further changes expected), `deprecated` (use `superseded_by` to name the replacement). Drives consumer pinning decisions and ADR 0001 deprecation flow.

**Full reference:** [`docs/field-reference.md#stability`](field-reference.md#stability)

---

### `superseded_by` *(optional)*

**Type:** string

Name of the skill that replaces this one. Required when `stability: deprecated` — enforced by the allOf rule so every deprecated skill names its successor and consumers can follow the chain automatically. Omit on non-deprecated skills.

**Full reference:** [`docs/field-reference.md#superseded_by`](field-reference.md#superseded_by)

---

### `license` *(optional)*

**Type:** string

SPDX license identifier (e.g., `MIT`, `Apache-2.0`, `CC-BY-4.0`). Resolved against the SPDX license list (ISO/IEC 5962:2021). Required for skills shipped externally; optional for codebase-internal skills.

**Full reference:** [`docs/field-reference.md#license`](field-reference.md#license)

---

### `compatibility` *(optional)*

**Type:** object

Cross-runtime compatibility envelope. `runtimes` lists target agent runtimes with version constraints; `node` is the Node.js version requirement; `notes` is free-text overflow. Distinct from `extends` (overlay parent) and `relations.depends_on` (sibling skill dependency).

**Sub-fields:**

- `runtimes` *optional* — Target agent runtimes with optional version constraints (e.
- `node` *optional* — Node.
- `notes` *optional* — Free-text additional compatibility notes.

**Full reference:** [`docs/field-reference.md#compatibility`](field-reference.md#compatibility)

---

### `allowed-tools` *(optional)*

**Type:** string

Optional comma-separated whitelist of tools the skill is permitted to use (e.g., `Read,Edit,Bash`). Honoured by harnesses that gate tool calls per skill. Conventional spelling matches Claude Code's `--allowed-tools` CLI flag.

**Full reference:** [`docs/field-reference.md#allowed-tools`](field-reference.md#allowed-tools)

---

### `extends` *(optional)*

**Type:** string

Overlay parent skill name. Only valid when `type: overlay`. Establishes a single-parent existential-dependency chain — the overlay specialises the parent and ceases to have meaning without it. Per ADR 0003 (OntoClean rigidity), the overlay's identity is INHERITED, not REPLACED. For non-existential cross-skill generalisation, use `relations.broader` instead.

**Full reference:** [`docs/field-reference.md#extends`](field-reference.md#extends)

---

### `triggers` *(optional)*

**Type:** array of string

Exact phrase or label triggers that activate this skill. For semantic phrases use `keywords`; for example user prompts use `examples`.

**Full reference:** [`docs/field-reference.md#triggers`](field-reference.md#triggers)

---

### `keywords` *(optional)*

**Type:** array of string

Semantic keywords for discovery and fuzzy matching. Complements `triggers` (exact) and `examples` (full prompts).

**Full reference:** [`docs/field-reference.md#keywords`](field-reference.md#keywords)

---

### `examples` *(optional)*

**Type:** array of string

Positive-class activation examples — realistic user prompts the skill SHOULD activate for. 2–5 entries recommended. Improves recall for embedding-based routers (SkillRouter-style few-shot retrieval) that find `keywords` alone insufficient at library scale. Groups under `activation.examples` in the manifest.

**Full reference:** [`docs/field-reference.md#examples`](field-reference.md#examples)

---

### `anti_examples` *(optional)*

**Type:** array of string

Negative-class activation examples — realistic user prompts that look topically related but a DIFFERENT skill should handle. Used as hard-negative training signal. Pair with `relations.boundary` to name the skill that should activate instead. Groups under `activation.anti_examples` in the manifest.

**Full reference:** [`docs/field-reference.md#anti_examples`](field-reference.md#anti_examples)

---

### `paths` *(optional)*

**Type:** array of string

Glob patterns that identify code surfaces this skill governs. Patterns prefixed with `!` are negations (gitignore-style). Negations only subtract from prior includes; a pattern list consisting only of negations matches nothing and is rejected by lint.

**Full reference:** [`docs/field-reference.md#paths`](field-reference.md#paths)

---

### `project_tags` *(optional)*

**Type:** array of string

Literal project handles or semantic tags identifying which projects this skill is relevant to. Absent = ambient / cross-project. A workspace config at `.skill-graph/config.json` may map literal project handles to semantic tag sets so one skill tag matches many projects.

**Full reference:** [`docs/field-reference.md#project_tags`](field-reference.md#project_tags)

---

### `routing_groups` *(optional)*

**Type:** array of string

Tags that group skills for activation routing (e.g., `frontend`, `data-pipeline`). Routers use these for batch retrieval — when a query matches a routing group, all skills tagged with that group become candidates. Distinct from `browse_category` (single-value human bucket) and `category` (hierarchical taxonomy path).

**Full reference:** [`docs/field-reference.md#routing_groups`](field-reference.md#routing_groups)

---

### `relations` *(optional)*

**Type:** object

Typed edges to sibling skills. Lint verifies every target exists. Predicate-to-W3C-vocabulary mapping is provided via schemas/skill.context.jsonld (JSON-LD @context). See docs/adr/0001-predicate-set.md for the v3.1 SKOS additions (related/broader/narrower) and ADR 0006 for the `boundary` / `disjoint_with` semantic split (boundary = routing-layer asymmetric handoff; disjoint_with = optional OWL class-disjointness).

**Sub-fields:**

- `adjacent` *optional* — DEPRECATED ALIAS of `related` (v3.
- `related` *optional* — v3.
- `boundary` *optional* — Anti-ownership / routing handoff edge — directional.
- `disjoint_with` *optional* — Optional OWL-style class-disjointness assertion.
- `broader` *optional* — v3.
- `narrower` *optional* — v3.
- `verify_with` *optional* — Skills to co-load for verification.
- `depends_on` *optional* — Skills this skill requires conceptually or operationally.

**Full reference:** [`docs/field-reference.md#relations`](field-reference.md#relations)

---

### `grounding` *(optional)*

**Type:** object

Records what the skill is grounded against — the truth sources, the grounding mode, and the failure modes when the truth drifts. Required when the skill makes claims about specific code or external systems. Optional for purely conceptual skills.

**Sub-fields:**

- `domain_object` *required*
- `grounding_mode` *required* (`repo_specific` | `universal` | `hybrid`)
- `truth_sources` *required*
- `failure_modes` *required*
- `evidence_priority` *required* (`repo_code_first` | `general_knowledge_first` | `equal`)

**Full reference:** [`docs/field-reference.md#grounding`](field-reference.md#grounding)

---

### `portability` *(optional)*

**Type:** object

Adopter-readiness signal. `readiness` declares how transferable the skill is between projects (`portable`, `requires-adaptation`, `repo-specific`). `targets` lists the runtime/CLI environments the skill has been validated against. Drives the multi-project overlay decision tree.

**Sub-fields:**

- `readiness` *required* (`declared` | `scripted` | `verified`)
- `targets` *required*

**Full reference:** [`docs/field-reference.md#portability`](field-reference.md#portability)

---

### `lifecycle` *(optional)*

**Type:** object

Per-skill maintenance policy consumed by the drift sentinel.

**Sub-fields:**

- `stale_after_days` *optional* — Days after `drift_check.
- `review_cadence` *optional* (`per-commit` | `weekly` | `quarterly` | `on-truth-source-change`) — How frequently the skill should be re-verified.

**Full reference:** [`docs/field-reference.md#lifecycle`](field-reference.md#lifecycle)

---

### `runtime_telemetry` *(optional)*

**Type:** object

Optional pointer to a real-world success/failure feed. Consumers may use telemetry to corroborate or override `eval_state`.

**Sub-fields:**

- `feedback_source` *required* — Path or URL to a JSONL of run receipts.
- `last_updated` *optional*
- `metrics` *optional*

**Full reference:** [`docs/field-reference.md#runtime_telemetry`](field-reference.md#runtime_telemetry)

---
