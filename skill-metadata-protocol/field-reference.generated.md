# Skill Graph Field Reference (Generated)

> **Generated from** `schemas/SKILL_METADATA_PROTOCOL_schema.json` (frontmatter) and
> `schemas/skill-audit-state.schema.json` (audit-state sidecar) by `scripts/build-field-reference.js`.
> **Do not edit by hand.** The canonical prose reference is [`skill-metadata-protocol/field-reference.md`](field-reference.md).
> **Predicate glossary:** [`docs/glossary.md`](../docs/glossary.md).
> **JSON-LD @context:** [`schemas/skill.context.jsonld`](../schemas/skill.context.jsonld) (frontmatter fields only — the sidecar is not exported/RDF'd).
> **Two-file split:** per [ADR-0019](../docs/adr/0019-audit-state-sidecar-separation.md), agent-facing fields live in `SKILL.md` frontmatter; audit/eval/provenance fields live in the `audit-state.json` sidecar.

Schema version: **8** · Total fields: **56**

---

## Frontmatter fields (`SKILL.md`)

> Source schema: `schemas/SKILL_METADATA_PROTOCOL_schema.json`. Field count: **27** · Required: **5**.

---

### `name` *(required)*

**Type:** string

Stable display-layer skill identifier. Lowercase kebab-case; allows `/` and `:` for hierarchical/namespaced names. Must equal the parent directory name (skills/<name>/SKILL.md). The URN at `urn` is the long-term globally-unique identifier; `name` is the local handle.

**Pattern:** `^[a-z0-9][a-z0-9-/:]*$`

**Full reference:** [`skill-metadata-protocol/field-reference.md#name`](field-reference.md#name)

---

### `description` *(required)*

**Type:** string

A short description of what the skill is about. Activation, trigger, and exclusion semantics belong to the dedicated fields built for them: `keywords` and `triggers` for activation signals, `examples` and `anti_examples` for prompt-level coverage, and `relations.suppresses` for routing-layer exclusion edges. Keep `description` descriptive, not prescriptive. No protocol length cap.

**Full reference:** [`skill-metadata-protocol/field-reference.md#description`](field-reference.md#description)

---

### `taxonomy_domain` *(optional)*

**Type:** string

Hierarchical taxonomy sub-path using slash-delimited segments (e.g., `ecommerce/integrations/shopify`). Complements `subject`: the flat browse shelf (`subject`) and the slash-delimited taxonomy tree answer different questions. Use `taxonomy_domain` to subdivide a subject that holds many skills (the >25 rule per `subject`'s balance constraint). Renamed from `domain` to disambiguate from `grounding.subject_matter` (the grounding-block free-text label) and from cross-taxonomy routing doctrine prose. See the ADR-0017 amendment of 2026-05-27.

**Pattern:** `^[a-z0-9][a-z0-9-]*(/[a-z0-9][a-z0-9-]*)*$`

**Full reference:** [`skill-metadata-protocol/field-reference.md#taxonomy_domain`](field-reference.md#taxonomy_domain)

---

### `subject` *(required)*

**Type:** `backend-engineering` | `frontend-engineering` | `software-architecture` | `data-engineering` | `agent-ops` | `ai-engineering` | `quality-assurance` | `design` | `reasoning-strategy` | `software-engineering-method` | `knowledge-organization` | `product-domain`

Primary classification — the competency the skill teaches ("what does this teach you to do?"). Closed 12-value enum in 3 navigational bands: software & web engineering (backend-engineering, frontend-engineering, software-architecture, data-engineering); AI-agentic (agent-ops, ai-engineering); cross-cutting craft (quality-assurance, design, reasoning-strategy, software-engineering-method, knowledge-organization, product-domain). Balance rule: each subject must hold 5-25 skills. <5 = fold or recruit; >25 = subdivide via `taxonomy_domain` slash-path. See docs/adr/0020-twelve-shelf-competency-reaxis.md for the current shelf rationale.

**Full reference:** [`skill-metadata-protocol/field-reference.md#subject`](field-reference.md#subject)

---

### `subjects` *(optional)*

**Type:** array of string

Ordered subject array for polyhierarchy. First entry is the primary and must match `subject`; second entry (optional) is a secondary subject for skills that genuinely span shelves (e.g. `webhook-integration` is primarily `backend-engineering` and secondarily `product-domain`; `information-architecture` is primarily `design` and secondarily `knowledge-organization`). Max 2 entries to keep polyhierarchy the exception, not the default. Drawn from the same closed 12-enum as `subject`.

**Full reference:** [`skill-metadata-protocol/field-reference.md#subjects`](field-reference.md#subjects)

---

### `scope` *(required)*

**Type:** string

PRD-style free-text scope statement — what this skill teaches and what it does not. Mirrors the body `## Coverage` plus `## Do NOT Use When` sections at the frontmatter level for fast scanning. Required. NOT an enum: publishability moved to the boolean `public` gate, project anchoring moved to `project[]`, and the old `workspace` scope enum value was removed. See the ADR-0017 amendment of 2026-05-27.

**Full reference:** [`skill-metadata-protocol/field-reference.md#scope`](field-reference.md#scope)

---

### `public` *(required)*

**Type:** boolean

Publishability gate — is this skill safe for public release to the skills.sh marketplace? `true` (publishable: carries no private data — repo-agnostic patterns, public-repo grounding, or otherwise leak-free), `false` (private: carries private API keys, personal data, customer data, bank/financial data, or internal-only operational doctrine and must NEVER be published). This is the SINGLE switch that drives the marketplace-export filter (`export-marketplace-skills.js` excludes `public: false`) and enforces the HARD private-content boundary (see `~/.claude-profiles/.../memory/skill-graph-private-content-boundary`). Replaces the v8 `deployment_target` enum: publishability — not deployment location — is what the export gate actually needs; project-grounding is carried separately by `grounding` + `project[]`. Migration alias: `deployment_target: portable` → `public: true`, `deployment_target: project` → `public: false` (the conservative default — a project-grounded skill is assumed private until the audit loop confirms otherwise). See the ADR-0017 amendment.

**Full reference:** [`skill-metadata-protocol/field-reference.md#public`](field-reference.md#public)

---

### `project` *(optional)*

**Type:** array of object

Projects this skill is linked to. Each entry has a kebab-case `handle` and a free-text `role` (suggested values: `source-of-truth`, `consumer`, `mirror`). Optional; absent = ambient / cross-project. Replaces the v8 `workspace_tags` field and makes project belonging-entity identity a first-class queryable axis. See the ADR-0017 amendment of 2026-05-27.

**Item shape (object form):**

- `handle` *required* — Kebab-case project handle (e.
- `role` *optional* — Free-text role of this skill within the project.

**Full reference:** [`skill-metadata-protocol/field-reference.md#project`](field-reference.md#project)

---

### `mental_model` *(optional)*

**Type:** string

Primitives and their relationships. Name primitives and the relationships between them. Markdown permitted. Author with the depth the concept needs — no protocol length cap. Authored input read by the comprehension grader's `mental_model` dimension (weight 1.5). Replaces nested `concept.mental_model` in v6 — see the v5-to-v6 migration note.

**Full reference:** [`skill-metadata-protocol/field-reference.md#mental_model`](field-reference.md#mental_model)

---

### `purpose` *(optional)*

**Type:** string

What problem the concept solves and the alternative it replaced. Concrete pain point + prior alternative. No length cap. Authored input read by the comprehension grader's `purpose` dimension (weight 1.0). Replaces nested `concept.purpose` in v6.

**Full reference:** [`skill-metadata-protocol/field-reference.md#purpose`](field-reference.md#purpose)

---

### `concept_boundary` *(optional)*

**Type:** string

Things commonly confused with the concept but that are NOT it. Express each difference as a mechanism (different primitives, purpose, or scope) — not just different names. No length cap. Authored input read by the comprehension grader's boundary dimension (weight 1.5). Canonical name as of ADR-0018, which renamed the top-level Understanding field from `boundary` to `concept_boundary` so the token no longer collides with the routing-layer `relations.suppresses` (formerly `relations.boundary`). New skills author `concept_boundary`.

**Full reference:** [`skill-metadata-protocol/field-reference.md#concept_boundary`](field-reference.md#concept_boundary)

---

### `boundary` *(optional)*

**Type:** string

DEPRECATED alias of `concept_boundary` (renamed per ADR-0018 to remove the token collision with the routing edge `relations.suppresses` / legacy `relations.boundary`). Retained ONLY for skills not yet migrated; the normalizer presents it as `concept_boundary` and `concept_boundary` wins when both are present. New skills MUST author `concept_boundary`. Structural removal of this alias is CONTENT-mode work the audit loop drains per-skill.

**Full reference:** [`skill-metadata-protocol/field-reference.md#boundary`](field-reference.md#boundary)

---

### `analogy` *(optional)*

**Type:** string

Analogy that preserves the core mechanism. Translates the concept for a non-expert without breaking the structural relationship between primitives. No length cap. Authored input read by the comprehension grader's `analogy` dimension (weight 0.5). Replaces nested `concept.analogy` in v6.

**Full reference:** [`skill-metadata-protocol/field-reference.md#analogy`](field-reference.md#analogy)

---

### `misconception` *(optional)*

**Type:** string

The wrong mental model people bring and why it misleads. Authored hint to inoculate the agent against the common error trap. No length cap. Not directly graded; complements `boundary`. Replaces nested `concept.misconception` in v6.

**Full reference:** [`skill-metadata-protocol/field-reference.md#misconception`](field-reference.md#misconception)

---

### `stability` *(optional)*

**Type:** `experimental` | `stable` | `frozen` | `deprecated`

Lifecycle posture for consumers. `experimental` (subject to change), `stable` (production-ready), `frozen` (no further changes expected), `deprecated` (use `superseded_by` to name the replacement). Drives consumer pinning decisions.

**Full reference:** [`skill-metadata-protocol/field-reference.md#stability`](field-reference.md#stability)

---

### `superseded_by` *(optional)*

**Type:** string

Name of the skill that replaces this one. Required when `stability: deprecated` — enforced by the allOf rule so every deprecated skill names its successor and consumers can follow the chain automatically. Omit on non-deprecated skills.

**Full reference:** [`skill-metadata-protocol/field-reference.md#superseded_by`](field-reference.md#superseded_by)

---

### `license` *(optional)*

**Type:** string

SPDX license identifier (e.g., `MIT`, `Apache-2.0`, `CC-BY-4.0`). Resolved against the SPDX license list (ISO/IEC 5962:2021). Required for skills shipped externally; optional for codebase-internal skills.

**Full reference:** [`skill-metadata-protocol/field-reference.md#license`](field-reference.md#license)

---

### `compatibility` *(optional)*

**Type:** object

Cross-runtime compatibility envelope. `runtimes` lists target agent runtimes with version constraints; `node` is the Node.js version requirement; `notes` is free-text overflow. Distinct from `relations.depends_on` (sibling skill dependency).

**Sub-fields:**

- `runtimes` *optional* — Target agent runtimes with optional version constraints (e.
- `agent_runtimes` *optional* — Target agent runtimes (v3.
- `node` *optional* — Node.
- `node_version` *optional* — Node.
- `notes` *optional* — Free-text additional compatibility notes.

**Full reference:** [`skill-metadata-protocol/field-reference.md#compatibility`](field-reference.md#compatibility)

---

### `allowed-tools` *(optional)*

**Type:** string

Optional space-separated whitelist of tools the skill is permitted to use (e.g., `Read Edit Bash`). Honoured by harnesses that gate tool calls per skill. Kebab-case spelling matches the common SKILL.md field name and Claude Code's `--allowed-tools` CLI flag. The canonical key is `allowed-tools` (kebab-case); `allowed_tools` (snake_case) is only a tolerated read alias the normalizer accepts — author the kebab form. The export transform writes the kebab-case form for SKILL.md consumers.

**Full reference:** [`skill-metadata-protocol/field-reference.md#allowed-tools`](field-reference.md#allowed-tools)

---

### `triggers` *(optional)*

**Type:** array of string

Exact phrase or label triggers that activate this skill. For semantic phrases use `keywords`; for example user prompts use `examples`.

**Full reference:** [`skill-metadata-protocol/field-reference.md#triggers`](field-reference.md#triggers)

---

### `keywords` *(optional)*

**Type:** array of string

Semantic keywords for discovery and fuzzy matching. Complements `triggers` (exact) and `examples` (full prompts).

**Full reference:** [`skill-metadata-protocol/field-reference.md#keywords`](field-reference.md#keywords)

---

### `examples` *(optional)*

**Type:** array of string

Positive-class activation examples — realistic user prompts the skill SHOULD activate for. 2–5 entries recommended. Improves recall for embedding-based routers (SkillRouter-style few-shot retrieval) that find `keywords` alone insufficient at library scale. Groups under `activation.examples` in the manifest.

**Full reference:** [`skill-metadata-protocol/field-reference.md#examples`](field-reference.md#examples)

---

### `anti_examples` *(optional)*

**Type:** array of string

Negative-class activation examples — realistic user prompts that look topically related but a DIFFERENT skill should handle. Used as hard-negative training signal. Pair with `relations.suppresses` to name the skill that should activate instead; legacy `relations.boundary` is read only for unmigrated skills. Groups under `activation.anti_examples` in the manifest.

**Full reference:** [`skill-metadata-protocol/field-reference.md#anti_examples`](field-reference.md#anti_examples)

---

### `paths` *(optional)*

**Type:** array of string

Glob patterns that identify code surfaces this skill governs. Patterns prefixed with `!` are negations (gitignore-style). Negations only subtract from prior includes; a pattern list consisting only of negations matches nothing and is rejected by lint.

**Full reference:** [`skill-metadata-protocol/field-reference.md#paths`](field-reference.md#paths)

---

### `dependencies` *(optional)*

**Type:** array of string

Package/tool/framework names a codebase must use for this skill to be relevant (e.g. `next`, `tailwindcss`, `stripe`, `playwright`, `@anthropic-ai/sdk`). A codebase-relevance activation signal: detectors match a repo's manifest dependencies (package.json, requirements.txt, etc.) against this list to select skills for that codebase. Use the package's canonical registry name. Distinct from `relations.depends_on` (skill-to-skill composition — names sibling SKILLs, not packages) and from `compatibility` (the runtime envelope the SKILL itself needs — agent runtimes + Node version). Optional; absent = the skill's relevance is not keyed to any package. Added 2026-06-10 per owner directive (codebase-fingerprint signal).

**Full reference:** [`skill-metadata-protocol/field-reference.md#dependencies`](field-reference.md#dependencies)

---

### `relations` *(optional)*

**Type:** object

Typed edges to sibling skills. Lint verifies every target exists. Predicate-to-W3C-vocabulary mapping is provided via schemas/skill.context.jsonld (JSON-LD @context). `suppresses` is the routing-layer asymmetric exclusion edge (renamed from the deprecated `boundary` alias per ADR-0018); `disjoint_with` is the optional OWL class-disjointness predicate — they are distinct, not aliases.

**Sub-fields:**

- `adjacent` *optional* — Legacy alias of `related` (skos:related).
- `related` *optional* — Symmetric associative relation (skos:related).
- `suppresses` *optional* — Score-aware routing exclusion edge — directional.
- `boundary` *optional* — DEPRECATED alias of `suppresses` (renamed per ADR-0018 — the name `boundary` read as deference but the mechanic is exclusion).
- `disjoint_with` *optional* — Optional OWL class-disjointness assertion.
- `broader` *optional* — Cross-skill generalisation (skos:broader).
- `narrower` *optional* — Cross-skill specialisation (skos:narrower).
- `verify_with` *optional* — Skills to co-load for verification.
- `depends_on` *optional* — Skills this skill requires conceptually or operationally.
- `io_contract` *optional* — OPTIONAL machine-checkable composition contract.

**Full reference:** [`skill-metadata-protocol/field-reference.md#relations`](field-reference.md#relations)

---

### `grounding` *(optional)*

**Type:** object

Records what the skill is grounded against — the truth sources, the grounding mode, and the failure modes when the truth drifts. Required when the skill makes claims about specific code or external systems. Optional for purely conceptual skills.

**Sub-fields:**

- `subject_matter` *required* — Free-text label naming what the skill is grounded in (e.
- `grounding_mode` *required* (`repo_specific` | `universal` | `hybrid`) — Whether the skill's claims are repo-specific, universal, or a hybrid.
- `truth_sources` *required* — Files, docs, or URLs that ground the skill's claims.
- `failure_modes` *required*
- `evidence_priority` *required* (`repo_code_first` | `general_knowledge_first` | `equal`)

**Full reference:** [`skill-metadata-protocol/field-reference.md#grounding`](field-reference.md#grounding)

---

## Audit-state sidecar fields (`audit-state.json`)

> Source schema: `schemas/skill-audit-state.schema.json`. Field count: **29** · Required: **7**.

---

### `schema_version` *(required)*

**Type:** multiple — see schema

Major contract shape version. Integer 8 is the only accepted current value. v7 is a prior contract shape retrievable from git history, not an accepted live-schema value. Bumps when shape changes break consumers. Moved from SKILL.md frontmatter to this sidecar in the audit-state split (ADR-0019): which contract a skill conforms to is a system/audit concern, not part of the public Agent-Skills frontmatter. Prior versions live in git history — see `git tag --list 'schema-*'`.

**Full reference:** [`skill-metadata-protocol/field-reference.md#schema_version`](field-reference.md#schema_version)

---

### `version` *(optional)*

**Type:** string

Skill content version (semver). Bumps when the SKILL.md body or contract changes meaningfully. Distinct from `schema_version` (the contract shape). Used by `relations.depends_on` for `min_version` constraints. Governance/provenance — moved to the sidecar in ADR-0019. Optional in the sidecar (the only currently-required audit field NOT carried into the sidecar `required` set).

**Pattern:** `^[0-9]+\.[0-9]+\.[0-9]+$`

**Full reference:** [`skill-metadata-protocol/field-reference.md#version`](field-reference.md#version)

---

### `skill_graph_protocol` *(optional)*

**Type:** string

Optional content-label claim — the protocol version whose SUBSTANTIVE content bar this skill's body and metadata have actually earned (e.g. `Skill Metadata Protocol v8`). Distinct from `schema_version` (the mechanical shape integer a codemod can bump): the content label is earned only when the version's semantic content — classification, free-text scope, Understanding fields, gradeable eval artifacts, audited verdicts — is present and reviewed per `AGENTS.md § Version Labels Are Earned, Not Bumped`. History: this token previously existed ONLY as export-provenance frontmatter that `parse-frontmatter.js::normalizeFrontmatter()` strips, leaving the doctrine governed by human discipline alone; making it a first-class sidecar field (2026-06-10) gives the earned-not-bumped rule a deterministic, schema-validated surface the audit loop and status tooling can read. Written by the audit loop when a content migration completes — never advanced by find-replace.

**Pattern:** `^Skill Metadata Protocol v[0-9]+(\.[0-9]+)*$`

**Full reference:** [`skill-metadata-protocol/field-reference.md#skill_graph_protocol`](field-reference.md#skill_graph_protocol)

---

### `urn` *(optional)*

**Type:** string

Optional globally-unique persistent identifier in the `urn:skill:<repo>:<skill-name>` form (RFC 8141). Consumers treat the URN as the stable identity across repos and federated registries; the frontmatter `name` is the display-layer handle. The `<skill-name>` segment MUST equal the frontmatter `name` field. Registry identity / provenance — moved to the sidecar in ADR-0019 (0 acting consumer today).

**Pattern:** `^urn:skill:[a-z0-9][a-z0-9-]*:[a-z0-9][a-z0-9-/:]*$`

**Full reference:** [`skill-metadata-protocol/field-reference.md#urn`](field-reference.md#urn)

---

### `owner` *(required)*

**Type:** string

Maintainer or team accountable for keeping this skill correct. Free-form string; conventional values: `skill-graph-maintainer`, GitHub team handles, individual usernames. Used by drift-check workflows to route review requests. Maintenance accountability is a human-curator/audit concern, not agent-facing — moved to the sidecar in ADR-0019.

**Full reference:** [`skill-metadata-protocol/field-reference.md#owner`](field-reference.md#owner)

---

### `repo` *(optional)*

**Type:** array of object

Repos this skill is linked to. Each entry has a kebab-case `handle` and a canonical `url`. Optional; plural even though most skills today have one source repo, so federation is structurally ready without a future schema bump. Belonging-entity / provenance reference — moved to the sidecar in ADR-0019.

**Item shape (object form):**

- `handle` *required* — Kebab-case repo handle (e.
- `url` *optional* — Canonical repository URL.

**Full reference:** [`skill-metadata-protocol/field-reference.md#repo`](field-reference.md#repo)

---

### `freshness` *(required)*

**Type:** string

ISO date (YYYY-MM-DD) of the last meaningful content review. The author's claim that the skill was current as of this date. Complemented by `drift_check.truth_source_hashes` for grounded skills. `reviewed_at` is the supported alias. Audit freshness timestamp — moved to the sidecar in ADR-0019.

**Format:** date

**Full reference:** [`skill-metadata-protocol/field-reference.md#freshness`](field-reference.md#freshness)

---

### `reviewed_at` *(optional)*

**Type:** string

ISO date (YYYY-MM-DD) of the last meaningful content review (v3.1 preferred alias for `freshness`). When both are present they must match.

**Format:** date

**Full reference:** [`skill-metadata-protocol/field-reference.md#reviewed_at`](field-reference.md#reviewed_at)

---

### `drift_check` *(required)*

**Type:** object

Drift-detection record for grounded skills. `last_verified` is the author's claim; `truth_source_hashes` is content-addressable evidence keyed by each normalized frontmatter `grounding.truth_sources` entry. Whole-file sources hash normalized file content; line-range sources hash only the cited slice; anchor-only sources hash the resolved Markdown section or literal text. The combination lets `scripts/skill-graph-drift.js` detect when underlying truth has changed without an accompanying review. Audit machinery — moved to the sidecar in ADR-0019 (grounding stays frontmatter; only the hashes move).

**Sub-fields:**

- `last_verified` *required* — ISO date of the last verification against truth sources.
- `verified_at` *optional* — ISO date of the last verification against truth sources (v3.
- `truth_source_hashes` *optional* — Map of normalized truth source key to SHA-256 hex digest at the time of last verification.

**Full reference:** [`skill-metadata-protocol/field-reference.md#drift_check`](field-reference.md#drift_check)

---

### `eval_artifacts` *(required)*

**Type:** `none` | `planned` | `present`

Are eval artifacts present on disk for this skill? `none` (no evals planned), `planned` (eval intent declared but not yet shipped), `present` (eval JSON exists at `evals/<skill>.json` or similar). The `present` claim requires a real artifact and audit/eval receipt.

**Full reference:** [`skill-metadata-protocol/field-reference.md#eval_artifacts`](field-reference.md#eval_artifacts)

---

### `eval_state` *(required)*

**Type:** `unverified` | `passing` | `monitored`

What does the eval say about content quality? `unverified` (no eval has run), `passing` (last run passed), `monitored` (eval runs on a cadence and is currently passing). Independent of `routing_eval` (the routing-coverage axis). Use to express content-level quality grading orthogonal to routing coverage.

**Full reference:** [`skill-metadata-protocol/field-reference.md#eval_state`](field-reference.md#eval_state)

---

### `routing_eval` *(required)*

**Type:** `absent` | `present`

Is routing / trigger coverage explicitly evaluated? `absent` (router behaviour is not part of the eval set), `present` (the skill's frontmatter `examples[]` and `anti_examples[]` pass `scripts/skill-graph-routing-eval.js`). Honesty over green checkmarks — flip to `present` only after the harness PASSes. The nested `eval.routing_coverage` is the v3.1 preferred alias.

**Full reference:** [`skill-metadata-protocol/field-reference.md#routing_eval`](field-reference.md#routing_eval)

---

### `last_audited` *(optional)*

**Type:** string

ISO date (YYYY-MM-DD) the `audit` command last ran against this skill. Written by `scripts/skill/skill-audit.js`. Independent of `freshness` (which is the author's claim of content-level review) and `drift_check.last_verified` (which is the truth-source verification). Loop priority uses `last_audited` to pick the stalest skill.

**Format:** date

**Full reference:** [`skill-metadata-protocol/field-reference.md#last_audited`](field-reference.md#last_audited)

---

### `last_changed` *(optional)*

**Type:** string

ISO date (YYYY-MM-DD) the SKILL.md body or frontmatter was last edited. Written automatically by `improve` operations. Distinct from `freshness` (review claim) — `last_changed` is the editor's footprint, `freshness` is the reviewer's footprint.

**Format:** date

**Full reference:** [`skill-metadata-protocol/field-reference.md#last_changed`](field-reference.md#last_changed)

---

### `structural_verdict` *(optional)*

**Type:** `PASS` | `PASS_WITH_FIXES` | `FAIL` | `UNVERIFIED`

Structural-layer verdict produced by gates 1–2 and 7 of the skill-audit loop (schema lint, manifest census, concept-card shape). `PASS` (clean), `PASS_WITH_FIXES` (warnings present but no errors), `FAIL` (lint or schema errors), `UNVERIFIED` (no structural audit has run yet). Independent of `lint_verdict` (per-script signal); this is the audit-loop roll-up. See docs/adr/0011-split-audit-verdict-into-four-verdicts.md.

**Full reference:** [`skill-metadata-protocol/field-reference.md#structural_verdict`](field-reference.md#structural_verdict)

---

### `truth_verdict` *(optional)*

**Type:** `PASS` | `DRIFT` | `BROKEN` | `UNVERIFIED`

Truth-layer verdict produced by gates 3–6 of the skill-audit loop (truth-source catalog, drift sentinel, test coverage, claim verification). `PASS` (truth sources align with declared `last_verified` and hashes), `DRIFT` (truth sources changed since last_verified), `BROKEN` (declared truth sources missing or unreadable), `UNVERIFIED` (no truth audit has run yet). Independent of `drift_status` (per-script signal); this is the audit-loop roll-up. See docs/adr/0011-split-audit-verdict-into-four-verdicts.md.

**Full reference:** [`skill-metadata-protocol/field-reference.md#truth_verdict`](field-reference.md#truth_verdict)

---

### `comprehension_verdict` *(optional)*

**Type:** `PASS` | `SHALLOW` | `REDUNDANT` | `UNVERIFIED` | `PROVISIONAL` | `SKIPPED_BASELINE_HIGH` | `NA`

Comprehension-layer verdict produced by gate 8 (the comprehension grader on `evals/comprehension.json`). `PASS` (with-skill answers measurably deeper than baseline; dual-run grader earned), `PROVISIONAL` (a single competent model ran the comprehension assessment and recorded a real result — lower confidence than `PASS` because not yet confirmed by the independent dual-run grader, but distinct from `UNVERIFIED` which means no assessment has run), `SHALLOW` (skill recites the concept but does not deepen agent understanding), `REDUNDANT` (baseline already saturated — skill adds no comprehension lift on this concept), `SKIPPED_BASELINE_HIGH` (early-skip — `avg_primary_baseline >= 1.0` after the first 2 evals so the dual-run was aborted), `NA` (skill carries no `evals/comprehension.json`), `UNVERIFIED` (initial state before any grader run). Confidence hierarchy: `PASS (grader) > PROVISIONAL (single model) > UNVERIFIED (none)`. Comprehension never alone certifies a skill as useful — `application_verdict` is the aggregate-quality field. See docs/adr/0011-split-audit-verdict-into-four-verdicts.md and .claude/rules/version-schema-contract.md § 5.

**Full reference:** [`skill-metadata-protocol/field-reference.md#comprehension_verdict`](field-reference.md#comprehension_verdict)

---

### `application_verdict` *(optional)*

**Type:** `APPLICABLE` | `REDUNDANT` | `NOT_DISCRIMINATED_CEILING` | `EQUIVALENT_ON_FRONTIER` | `HARMFUL` | `MIXED` | `FALSE_POSITIVE` | `UNVERIFIED` | `PROVISIONAL`

Application-layer verdict produced by gate 9 (the application grader on `evals/application.json`). `APPLICABLE` (loading the skill changes agent behavior on real artifacts in the expected direction — flags, fixes, generative trajectory), `NOT_DISCRIMINATED_CEILING` (baseline saturated on the real cases, so the eval had no measurement headroom; inconclusive, not a deprecation signal), `EQUIVALENT_ON_FRONTIER` (baseline had measurement headroom but the skill produced no marginal lift for the measured frontier model on this case set), `REDUNDANT` (legacy no-delta bucket retained for old receipts; new runner output should prefer the two scoped no-lift values), `HARMFUL` (negative delta — agent makes worse decisions with the skill loaded; SkillsBench arXiv 2602.12670 found 19% of evaluated skills exhibit this), `MIXED` (delta varies across cases — some applicable, some equivalent, or false-positive), `FALSE_POSITIVE` (skill over-triggers — applies on cases where its expertise does not apply), `UNVERIFIED` (no application assessment has run), `PROVISIONAL` (single-model self-assessment audit found useful behavior but the independent application grader has not confirmed it). This is the aggregate-quality field: a skill is only behaviorally certified when this verdict is `APPLICABLE`. See docs/adr/0011-split-audit-verdict-into-four-verdicts.md.

**Full reference:** [`skill-metadata-protocol/field-reference.md#application_verdict`](field-reference.md#application_verdict)

---

### `lint_verdict` *(optional)*

**Type:** `PASS` | `FAIL` | `UNKNOWN`

Result of the most recent canonical-source schema lint pass against this skill (`scripts/skill-lint.js`). The current lint gate checks valid frontmatter, validation against `schemas/SKILL_METADATA_PROTOCOL_schema.json` (and this sidecar schema), identifier shape, non-empty description, and parent-directory/name alignment. Relation targets, routing quality, drift, export, and eval checks are separate tools. `PASS` means zero lint errors. `UNKNOWN` is the initial state.

**Full reference:** [`skill-metadata-protocol/field-reference.md#lint_verdict`](field-reference.md#lint_verdict)

---

### `drift_status` *(optional)*

**Type:** `OK` | `DRIFT` | `BROKEN` | `STALE` | `NO_BASELINE` | `EXTERNAL_UNHASHED` | `UNKNOWN`

Current truth-source drift status, mirroring the `scripts/skill-graph-drift.js` sentinel verdicts. `OK` (live hashes match recorded), `DRIFT` (mismatch), `BROKEN` (declared truth source missing), `STALE` (older than `lifecycle.stale_after_days`), `NO_BASELINE` (local truth sources declared but no hashes recorded), `EXTERNAL_UNHASHED` (URL truth sources not fetched), `UNKNOWN` (no drift check has run). Written by the drift sentinel; read by the loop to prioritise re-grounding work.

**Full reference:** [`skill-metadata-protocol/field-reference.md#drift_status`](field-reference.md#drift_status)

---

### `eval_score` *(optional)*

**Type:** number

Latest aggregate eval grade on a 0.0–5.0 scale, written by `scripts/skill/evaluate-skill.js`. Replaces the read-the-log dance for knowing how this skill scored. When `evals/comprehension.json` exists, the comprehension grader's score lands here; otherwise the standard eval-suite score. Use `eval_failed_ids` to inspect the failing cases.

**Full reference:** [`skill-metadata-protocol/field-reference.md#eval_score`](field-reference.md#eval_score)

---

### `eval_failed_ids` *(optional)*

**Type:** array of string

Eval IDs that failed in the most recent run. Empty array when clean. Populated alongside `eval_score` by the eval runner. Surfaces failures without forcing readers to crawl `eval-history.jsonl`.

**Full reference:** [`skill-metadata-protocol/field-reference.md#eval_failed_ids`](field-reference.md#eval_failed_ids)

---

### `eval_last_run` *(optional)*

**Type:** object

Optional receipt for the most recent eval run. Complements `eval_state` so `passing` and `monitored` claims can point at evidence instead of remaining self-attested.

**Sub-fields:**

- `at` *required* — Timestamp for the eval run that supports the current eval_state claim.
- `status` *required* (`pass` | `fail` | `mixed`)
- `runner` *optional* — Eval runner or command used, e.
- `model` *optional* — Optional grader/model identifier when an LLM grader was used.
- `receipt` *optional* — Path or URL to the eval receipt, scorecard, grader history, or CI run.
- `receipt_hash` *optional* — Optional SHA-256 digest of the receipt artifact.
- `bidirectional` *optional* — Eval provenance from lib/audit/run-bidirectional-eval.

**Full reference:** [`skill-metadata-protocol/field-reference.md#eval_last_run`](field-reference.md#eval_last_run)

---

### `eval` *(optional)*

**Type:** object

Nested Evaluation Status record (v3.1 preferred alias for the sibling fields `eval_artifacts` / `eval_state` / `routing_eval`). When both the top-level and nested forms are present they must match.

**Sub-fields:**

- `artifacts` *optional* (`none` | `planned` | `present`) — Are eval artifacts present on disk for this skill? Mirrors top-level `eval_artifacts`.
- `content_state` *optional* (`unverified` | `passing` | `monitored`) — What does the eval say about content quality? Mirrors top-level `eval_state`.
- `routing_coverage` *optional* (`absent` | `present`) — Is routing / trigger coverage explicitly evaluated? Mirrors top-level `routing_eval`.
- `comprehension_state` *optional* (`absent` | `present`) — Mirrors top-level `comprehension_state`.

**Full reference:** [`skill-metadata-protocol/field-reference.md#eval`](field-reference.md#eval)

---

### `comprehension_state` *(optional)*

**Type:** `absent` | `present`

Does this skill carry a comprehension eval (typically `evals/comprehension.json`) and the Understanding fields authored for the comprehension grader? `absent` (no comprehension grading), `present` (comprehension evals exist; the five flat Understanding fields `mental_model`, `purpose`, `boundary`, `analogy`, `misconception` in SKILL.md frontmatter are required by the cross-file lint check in scripts/skill-lint.js). The gate that ties this flag to the Understanding fields is CROSS-FILE (sidecar flag ⇒ frontmatter prose) and so lives in skill-lint.js, not in this schema's allOf. Authored-vs-measured boundary: the Understanding fields are AUTHORED CONTENT — the comprehension grader's INPUT, never the measurement itself. The measurement is the eval artifact (`comprehension.json`) plus the `comprehension_verdict` it produces. Independent of `routing_eval` (router-level) and `eval_state` (content-level). The nested `eval.comprehension_state` is the v3.1 preferred alias.

**Full reference:** [`skill-metadata-protocol/field-reference.md#comprehension_state`](field-reference.md#comprehension_state)

---

### `marketplace_tier` *(optional)*

**Type:** `S` | `A` | `B` | `C`

Publication priority for the public marketplace at `github.com/jacob-balslev/skills` / `skills.sh`. `S` = featured (top-of-README, individual hero copy). `A` = high-demand (named in collection tables). `B` = standard utility (included in collection tables). `C` = niche (collapsed 'More' section). Omit entirely for skills that should not be published. Sourced from `marketplace-publication-priority-*.md` and authored per skill. Lint validates the enum; consumers (export-marketplace-skills.js, generate-marketplace-readmes.js) filter and group on this field. Distribution-internal — a marketplace consumer reads it at publish time, not the everyday agent; moved to the sidecar in ADR-0019.

**Full reference:** [`skill-metadata-protocol/field-reference.md#marketplace_tier`](field-reference.md#marketplace_tier)

---

### `portability` *(optional)*

**Type:** object

Portability execution signal. `readiness` declares whether portability is only declared (`declared`), covered by export tooling (`scripted`), or verified with a target-runtime receipt (`verified`). `targets` lists supported export destinations, currently `skill-md`. Manifest-only pass-through, not agent-read — moved to the sidecar in ADR-0019.

**Sub-fields:**

- `readiness` *required* (`declared` | `scripted` | `verified`)
- `targets` *required* — Supported export destinations.
- `export_targets` *optional* — Supported export destinations (v3.

**Full reference:** [`skill-metadata-protocol/field-reference.md#portability`](field-reference.md#portability)

---

### `lifecycle` *(optional)*

**Type:** object

Per-skill maintenance policy consumed by the drift sentinel. Audit/freshness scheduling — moved to the sidecar in ADR-0019. NOTE: `stale_after_days` feeds the router staleness gate; the manifest-join carries it into the manifest so the gate keeps working with the field living in the sidecar.

**Sub-fields:**

- `stale_after_days` *optional* — Days after `drift_check.
- `review_cadence` *optional* (`per-commit` | `weekly` | `quarterly` | `on-truth-source-change`) — How frequently the skill should be re-verified.

**Full reference:** [`skill-metadata-protocol/field-reference.md#lifecycle`](field-reference.md#lifecycle)

---

### `runtime_telemetry` *(optional)*

**Type:** object

Optional pointer to a real-world success/failure feed. Consumers may use telemetry to corroborate or override `eval_state`. Runtime-feedback that corroborates audit verdicts — moved to the sidecar in ADR-0019.

**Sub-fields:**

- `feedback_source` *required* — Path or URL to a JSONL of run receipts.
- `last_updated` *optional*
- `metrics` *optional*

**Full reference:** [`skill-metadata-protocol/field-reference.md#runtime_telemetry`](field-reference.md#runtime_telemetry)

---
