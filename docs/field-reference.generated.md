# Skill Graph Field Reference (Generated)

> **Generated from** `schemas/skill.v3.schema.json` on 2026-04-20 by `scripts/gen-field-reference.js`.
> **Do not edit by hand.** The canonical prose reference is [`docs/field-reference.md`](field-reference.md).
> **Predicate glossary:** [`docs/glossary.md`](glossary.md).
> **JSON-LD @context:** [`schemas/skill.context.jsonld`](../schemas/skill.context.jsonld).

Schema version: **3** · Field count: **33** · Required: **13**

---

### `schema_version` *(required)*

**Type:** multiple — see schema

_No description in schema._

**Full reference:** [`docs/field-reference.md#schema_version`](field-reference.md#schema_version)

---

### `name` *(required)*

**Type:** string

_No description in schema._

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

_No description in schema._

**Min length:** 20

**Full reference:** [`docs/field-reference.md#description`](field-reference.md#description)

---

### `version` *(required)*

**Type:** string

_No description in schema._

**Pattern:** `^[0-9]+\.[0-9]+\.[0-9]+$`

**Full reference:** [`docs/field-reference.md#version`](field-reference.md#version)

---

### `type` *(required)*

**Type:** `capability` | `workflow` | `router` | `overlay`

_No description in schema._

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

_No description in schema._

**Full reference:** [`docs/field-reference.md#scope`](field-reference.md#scope)

---

### `owner` *(required)*

**Type:** string

_No description in schema._

**Full reference:** [`docs/field-reference.md#owner`](field-reference.md#owner)

---

### `freshness` *(required)*

**Type:** string

_No description in schema._

**Format:** date

**Full reference:** [`docs/field-reference.md#freshness`](field-reference.md#freshness)

---

### `drift_check` *(required)*

**Type:** object

_No description in schema._

**Sub-fields:**

- `last_verified` *required* — ISO date of the last verification against truth sources.
- `truth_source_hashes` *optional* — Map of truth source file path → SHA-256 hex digest at the time of last verification.

**Full reference:** [`docs/field-reference.md#drift_check`](field-reference.md#drift_check)

---

### `eval_artifacts` *(required)*

**Type:** `none` | `planned` | `present`

_No description in schema._

**Full reference:** [`docs/field-reference.md#eval_artifacts`](field-reference.md#eval_artifacts)

---

### `eval_state` *(required)*

**Type:** `unverified` | `passing` | `monitored`

_No description in schema._

**Full reference:** [`docs/field-reference.md#eval_state`](field-reference.md#eval_state)

---

### `routing_eval` *(required)*

**Type:** `absent` | `present`

_No description in schema._

**Full reference:** [`docs/field-reference.md#routing_eval`](field-reference.md#routing_eval)

---

### `stability` *(optional)*

**Type:** `experimental` | `stable` | `frozen` | `deprecated`

_No description in schema._

**Full reference:** [`docs/field-reference.md#stability`](field-reference.md#stability)

---

### `superseded_by` *(optional)*

**Type:** string

Name of the skill that replaces this one. Required when `stability: deprecated` — enforced by the allOf rule so every deprecated skill names its successor and consumers can follow the chain automatically. Omit on non-deprecated skills.

**Full reference:** [`docs/field-reference.md#superseded_by`](field-reference.md#superseded_by)

---

### `license` *(optional)*

**Type:** string

_No description in schema._

**Full reference:** [`docs/field-reference.md#license`](field-reference.md#license)

---

### `compatibility` *(optional)*

**Type:** object

_No description in schema._

**Sub-fields:**

- `runtimes` *optional* — Target agent runtimes with optional version constraints (e.
- `node` *optional* — Node.
- `notes` *optional* — Free-text additional compatibility notes.

**Full reference:** [`docs/field-reference.md#compatibility`](field-reference.md#compatibility)

---

### `allowed-tools` *(optional)*

**Type:** string

_No description in schema._

**Full reference:** [`docs/field-reference.md#allowed-tools`](field-reference.md#allowed-tools)

---

### `extends` *(optional)*

**Type:** string

_No description in schema._

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

_No description in schema._

**Full reference:** [`docs/field-reference.md#routing_groups`](field-reference.md#routing_groups)

---

### `relations` *(optional)*

**Type:** object

Typed edges to sibling skills. Lint verifies every target exists. Predicate-to-W3C-vocabulary mapping is provided via schemas/skill.context.jsonld (JSON-LD @context). See docs/adr/0001-predicate-set.md for the v3.1 additive evolution (related/disjoint_with/broader/narrower) and the deprecation plan for adjacent/boundary.

**Sub-fields:**

- `adjacent` *optional* — DEPRECATED ALIAS of `related` (v3.
- `related` *optional* — v3.
- `boundary` *optional* — DEPRECATED ALIAS of `disjoint_with` (v3.
- `disjoint_with` *optional* — v3.
- `broader` *optional* — v3.
- `narrower` *optional* — v3.
- `verify_with` *optional* — Skills to co-load for verification.
- `depends_on` *optional* — Skills this skill requires conceptually or operationally.

**Full reference:** [`docs/field-reference.md#relations`](field-reference.md#relations)

---

### `grounding` *(optional)*

**Type:** object

_No description in schema._

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

_No description in schema._

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
