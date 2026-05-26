# Skill Graph Field Reference (Generated)

> **Generated from** `schemas/skill.schema.json` by `scripts/build-field-reference.js`.
> **Do not edit by hand.** The canonical prose reference is [`docs/field-reference.md`](field-reference.md).
> **Predicate glossary:** [`docs/glossary.md`](glossary.md).
> **JSON-LD @context:** [`schemas/skill.context.jsonld`](../schemas/skill.context.jsonld).

Schema version: **unknown** · Field count: **64** · Required: **13**

---

### `schema_version` *(required)*

**Type:** multiple — see schema

Major contract shape version. Integer for v6+; string '7'/'8' tolerated for back-compat with hand-rolled YAML. Bumps when shape changes break consumers. v7 splits the single `audit_verdict` field from v6 into four discrete verdicts (`structural_verdict`, `truth_verdict`, `comprehension_verdict`, `application_verdict`) so the Health Block can carry independent verdicts for each layer of the skill-audit loop instead of compressing form, truth, comprehension, and behavior into one PASS/FAIL signal. v8 introduces the 5-axis classification model (subject/operation/scope/keywords/relations) and renames `category` → `subject`, `type` → `operation`, `scope: codebase` → `scope: project`, `scope: reference` → `scope: workspace`. The schema now globally requires the v8 axes (subject + operation); the v7 fields (type, category) remain defined as optional properties for back-compat with skills that still carry them, but are no longer required. Migration of any individual skill that still lacks v8 axes is a CONTENT-mode concern handled per-skill through the audit loop. See docs/adr/0011-split-audit-verdict-into-four-verdicts.md (v6→v7) and docs/adr/0017-five-axis-classification-model.md (v7→v8).

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

Optional globally-unique persistent identifier in the `urn:skill:<repo>:<skill-name>` form (RFC 8141). Consumers treat the URN as the stable identity across repos and federated registries; `name` is the display-layer handle. The `<skill-name>` segment MUST equal the `name` field.

**Pattern:** `^urn:skill:[a-z0-9][a-z0-9-]*:[a-z0-9][a-z0-9-/:]*$`

**Full reference:** [`docs/field-reference.md#urn`](field-reference.md#urn)

---

### `description` *(required)*

**Type:** string

The routing contract: tells a router whether this skill should activate for a given query. Pushy, specific, boundary-aware. Should include an explicit negative boundary so the router does not over-activate. No protocol length cap.

**Full reference:** [`docs/field-reference.md#description`](field-reference.md#description)

---

### `version` *(required)*

**Type:** string

Skill content version (semver). Bumps when the SKILL.md body or contract changes meaningfully. Distinct from `schema_version` (the contract shape). Used by `relations.depends_on` for `min_version` constraints.

**Pattern:** `^[0-9]+\.[0-9]+\.[0-9]+$`

**Full reference:** [`docs/field-reference.md#version`](field-reference.md#version)

---

### `type` *(optional)*

**Type:** `capability` | `workflow` | `router` | `overlay`

Archetype classifier — what kind of skill this is. `capability` (knows how to do something), `workflow` (orchestrates a sequence), `router` (dispatches to other skills), `overlay` (specialises a parent via `extends`). `archetype` is the supported alias.

**Full reference:** [`docs/field-reference.md#type`](field-reference.md#type)

---

### `archetype` *(optional)*

**Type:** `capability` | `workflow` | `router` | `overlay`

Archetype classifier (v3.1 preferred alias for `type`). When both are present they must match.

**Full reference:** [`docs/field-reference.md#archetype`](field-reference.md#archetype)

---

### `category` *(optional)*

**Type:** `foundations` | `engineering` | `design` | `quality` | `agent` | `product`

Browse facet — answers 'where should a human browse to find this skill first?' Not ontology truth. Closed enum of 6 values in v5: foundations | engineering | design | quality | agent | product. Cross-cutting category membership lives in `categories[1..]` (v7 optional, v8 planned required) or `secondary_categories` for marketplace cross-listing; skill-to-skill neighborhood lives in `relations.related`. For hierarchical sub-domain use `domain`. `foundations` is gated — see SKILL_METADATA_PROTOCOL.md § Classification.

**Full reference:** [`docs/field-reference.md#category`](field-reference.md#category)

---

### `domain` *(optional)*

**Type:** string

Hierarchical domain path using slash-delimited segments (e.g., `ecommerce/integrations/shopify`). Complements `category`; the flat browse shelf and the domain tree answer different questions.

**Pattern:** `^[a-z0-9][a-z0-9-]*(/[a-z0-9][a-z0-9-]*)*$`

**Full reference:** [`docs/field-reference.md#domain`](field-reference.md#domain)

---

### `secondary_categories` *(optional)*

**Type:** array of string

Additive tags for cross-listing in marketplace collections. Primary `category` is MECE and decides folder placement; `secondary_categories` lets a skill that genuinely serves two audiences (e.g., `playwright-cli` is primarily `quality` but also relevant to `engineering`) appear in additional marketplace collections without affecting filesystem layout. Max 2 entries to prevent dilution. Drawn from the same closed 6-enum as `category`; MUST NOT include the primary `category` value.

**Full reference:** [`docs/field-reference.md#secondary_categories`](field-reference.md#secondary_categories)

---

### `categories` *(optional)*

**Type:** array of string

Ordered category array. First entry is the primary and must match `category`; remaining entries are secondary browse homes the skill also covers. Max 5, drawn from the same closed enum as `category`.

**Full reference:** [`docs/field-reference.md#categories`](field-reference.md#categories)

---

### `subject` *(required)*

**Type:** `agent-ops` | `code-engineering` | `frontend-ui` | `design-craft` | `data-analytics` | `quality-assurance` | `meta-methods` | `knowledge-organization` | `product-domain`

v8 primary classification — what the skill teaches. Closed 9-value enum (down from v1 plan's 10-12 per GPT-5.5 critique). Replaces v7's `category` + `categories[0]` + `primaryCategory`. Balance rule: each subject must hold 5-25 skills. <5 = fold or recruit; >25 = subdivide via `domain` slash-path. v7→v8 mapping is NOT 1:1 (e.g. v7 `engineering` may map to `code-engineering`, `frontend-ui`, or `data-analytics` depending on content); the codemod proposes mappings for review. During the v7→v8 migration window, v7 skills retain `category` and skip `subject`; v8 skills require `subject`. See docs/adr/0017-five-axis-classification-model.md.

**Full reference:** [`docs/field-reference.md#subject`](field-reference.md#subject)

---

### `subjects` *(optional)*

**Type:** array of string

Ordered subject array (v8 polyhierarchy). First entry is the primary and must match `subject`; second entry (optional) is a secondary subject for skills that genuinely span shelves (e.g. `webhook-integration` is primarily `code-engineering` and secondarily `quality-assurance`). Max 2 entries — narrower than v7's `categories` max of 5 to enforce that polyhierarchy is the exception, not the default. Drawn from the same closed 9-enum as `subject`.

**Full reference:** [`docs/field-reference.md#subjects`](field-reference.md#subjects)

---

### `operation` *(required)*

**Type:** `know` | `do` | `decide` | `modify`

v8 cognitive operation classifier — what kind of cognitive operation loading this skill enables. Bloom-grounded. `know` = declarative knowledge (concepts, vocabulary, reference material — Bloom: Remember/Understand). `do` = procedural knowledge (step-by-step execution — Bloom: Apply). `decide` = routing/judgment (choosing between options, dispatching other skills — Bloom: Analyze/Evaluate). `modify` = context injection (shapes how other skills execute without executing itself — corresponds to v7's `overlay` archetype but framed as an operation, not a kind of file). Replaces v7's `type` (which is 93% `capability` and provides almost no discriminating power). v7→v8 mapping: `capability` → `know` or `do` (codemod heuristic via workflow-keyword presence; HITL for ambiguous); `workflow` → `do`; `router` → `decide`; `overlay` → `modify`. Predicted v8 distribution per GPT-5.5: know 35-45%, do 25-35%, decide 20-30%, modify 1-3%. See docs/adr/0017-five-axis-classification-model.md.

**Full reference:** [`docs/field-reference.md#operation`](field-reference.md#operation)

---

### `primaryCategory` *(optional)*

**Type:** `foundations` | `engineering` | `design` | `quality` | `agent` | `product` | `Meta Method` | `Technical Capability` | `Design & UX` | `Agent System` | `Product Domain`

Workspace alias for the primary browse home. Lowercase protocol values are accepted directly; title-case workspace labels normalize to `category` (`Meta Method` → `foundations`, `Technical Capability` → `engineering`, `Design & UX` → `design`, `Agent System` → `agent`, `Product Domain` → `product`). Optional in the protocol, required only by workspace policy when that repo opts in.

**Full reference:** [`docs/field-reference.md#primaryCategory`](field-reference.md#primaryCategory)

---

### `layerPrimary` *(optional)*

**Type:** string

Workspace routing facet for the primary architectural or concern layer (`meta`, `architecture`, `integration`, `operations`, `display`, `quality`, etc.). Orthogonal to `category`: use `category` for the human browse shelf and `layerPrimary` only when a workspace router or census explicitly consumes layer facets. The legacy `layer` field is not part of the v7 protocol.

**Pattern:** `^[a-z0-9][a-z0-9-]*$`

**Full reference:** [`docs/field-reference.md#layerPrimary`](field-reference.md#layerPrimary)

---

### `routingRole` *(optional)*

**Type:** string

Workspace routing facet describing how the skill participates in selection (`primary`, `router`, `verifier`, `gate`, etc.). Orthogonal to `type`: `type` says what kind of skill this is, while `routingRole` says how a workspace router should use it. Optional in portable protocol authoring.

**Pattern:** `^[a-z0-9][a-z0-9-]*$`

**Full reference:** [`docs/field-reference.md#routingRole`](field-reference.md#routingRole)

---

### `scope` *(required)*

**Type:** `codebase` | `reference` | `portable` | `project` | `workspace`

Where this skill applies. v7 values: `codebase` (coupled to a specific repo's code/conventions), `reference` (pure knowledge, no repo coupling), `portable` (repo-agnostic patterns). v8 values: `project` (replaces `codebase` — matches monorepo reality better), `workspace` (replaces `reference` — matches actual usage in multi-repo workspaces), `portable` (unchanged). During the v7→v8 migration window, all five values validate; v7 skills keep their old values until the codemod runs. Drives multi-project overlay decisions and informs the router's project-fit check.

**Full reference:** [`docs/field-reference.md#scope`](field-reference.md#scope)

---

### `owner` *(required)*

**Type:** string

Maintainer or team accountable for keeping this skill correct. Free-form string; conventional values: `skill-graph-maintainer`, GitHub team handles, individual usernames. Used by drift-check workflows to route review requests.

**Full reference:** [`docs/field-reference.md#owner`](field-reference.md#owner)

---

### `freshness` *(required)*

**Type:** string

ISO date (YYYY-MM-DD) of the last meaningful content review. The author's claim that the skill was current as of this date. Complemented by `drift_check.truth_source_hashes` for grounded skills. `reviewed_at` is the supported alias.

**Format:** date

**Full reference:** [`docs/field-reference.md#freshness`](field-reference.md#freshness)

---

### `reviewed_at` *(optional)*

**Type:** string

ISO date (YYYY-MM-DD) of the last meaningful content review (v3.1 preferred alias for `freshness`). When both are present they must match.

**Format:** date

**Full reference:** [`docs/field-reference.md#reviewed_at`](field-reference.md#reviewed_at)

---

### `drift_check` *(required)*

**Type:** object

Drift-detection record for grounded skills. `last_verified` is the author's claim; `truth_source_hashes` is content-addressable evidence keyed by each normalized `grounding.truth_sources` entry. Whole-file sources hash normalized file content; line-range sources hash only the cited slice; anchor-only sources hash the resolved Markdown section or literal text. The combination lets `scripts/skill-graph-drift.js` detect when underlying truth has changed without an accompanying review.

**Sub-fields:**

- `last_verified` *required* — ISO date of the last verification against truth sources.
- `verified_at` *optional* — ISO date of the last verification against truth sources (v3.
- `truth_source_hashes` *optional* — Map of normalized truth source key to SHA-256 hex digest at the time of last verification.

**Full reference:** [`docs/field-reference.md#drift_check`](field-reference.md#drift_check)

---

### `eval_artifacts` *(required)*

**Type:** `none` | `planned` | `present`

Are eval artifacts present on disk for this skill? `none` (no evals planned), `planned` (eval intent declared but not yet shipped), `present` (eval JSON exists at `evals/<skill>.json` or similar). The `present` claim requires a real artifact and audit/eval receipt.

**Full reference:** [`docs/field-reference.md#eval_artifacts`](field-reference.md#eval_artifacts)

---

### `eval_state` *(required)*

**Type:** `unverified` | `passing` | `monitored`

What does the eval say about content quality? `unverified` (no eval has run), `passing` (last run passed), `monitored` (eval runs on a cadence and is currently passing). Independent of `routing_eval` (the routing-coverage axis). Use to express content-level quality grading orthogonal to routing coverage.

**Full reference:** [`docs/field-reference.md#eval_state`](field-reference.md#eval_state)

---

### `routing_eval` *(required)*

**Type:** `absent` | `present`

Is routing / trigger coverage explicitly evaluated? `absent` (router behaviour is not part of the eval set), `present` (the skill's `examples[]` and `anti_examples[]` pass `scripts/skill-graph-routing-eval.js`). Honesty over green checkmarks — flip to `present` only after the harness PASSes. The nested `eval.routing_coverage` is the v3.1 preferred alias.

**Full reference:** [`docs/field-reference.md#routing_eval`](field-reference.md#routing_eval)

---

### `last_audited` *(optional)*

**Type:** string

ISO date (YYYY-MM-DD) the `audit` command last ran against this skill. Written by `scripts/skill/skill-audit.js`. Independent of `freshness` (which is the author's claim of content-level review) and `drift_check.last_verified` (which is the truth-source verification). Loop priority uses `last_audited` to pick the stalest skill.

**Format:** date

**Full reference:** [`docs/field-reference.md#last_audited`](field-reference.md#last_audited)

---

### `last_changed` *(optional)*

**Type:** string

ISO date (YYYY-MM-DD) the SKILL.md body or frontmatter was last edited. Written automatically by `improve` operations. Distinct from `freshness` (review claim) — `last_changed` is the editor's footprint, `freshness` is the reviewer's footprint.

**Format:** date

**Full reference:** [`docs/field-reference.md#last_changed`](field-reference.md#last_changed)

---

### `structural_verdict` *(optional)*

**Type:** `PASS` | `PASS_WITH_FIXES` | `FAIL` | `UNVERIFIED`

Structural-layer verdict produced by gates 1–2 and 7 of the skill-audit loop (schema lint, manifest census, concept-card shape). `PASS` (clean), `PASS_WITH_FIXES` (warnings present but no errors), `FAIL` (lint or schema errors), `UNVERIFIED` (no structural audit has run since the v7 schema bump). Replaces the structural slice of the v6 `audit_verdict` aggregate. Independent of `lint_verdict` (per-script signal); this is the audit-loop roll-up. See docs/adr/0011-split-audit-verdict-into-four-verdicts.md.

**Full reference:** [`docs/field-reference.md#structural_verdict`](field-reference.md#structural_verdict)

---

### `truth_verdict` *(optional)*

**Type:** `PASS` | `DRIFT` | `BROKEN` | `UNVERIFIED`

Truth-layer verdict produced by gates 3–6 of the skill-audit loop (truth-source catalog, drift sentinel, test coverage, claim verification). `PASS` (truth sources align with declared `last_verified` and hashes), `DRIFT` (truth sources changed since last_verified), `BROKEN` (declared truth sources missing or unreadable), `UNVERIFIED` (no truth audit has run since the v7 schema bump). Replaces the truth slice of the v6 `audit_verdict` aggregate. Independent of `drift_status` (per-script signal); this is the audit-loop roll-up. See docs/adr/0011-split-audit-verdict-into-four-verdicts.md.

**Full reference:** [`docs/field-reference.md#truth_verdict`](field-reference.md#truth_verdict)

---

### `comprehension_verdict` *(optional)*

**Type:** `PASS` | `SHALLOW` | `REDUNDANT` | `UNVERIFIED` | `PROVISIONAL` | `SKIPPED_BASELINE_HIGH` | `NA`

Comprehension-layer verdict produced by gate 8 (the comprehension grader on `evals/comprehension.json`). `PASS` (with-skill answers measurably deeper than baseline; dual-run grader earned), `PROVISIONAL` (a single competent model ran the comprehension assessment and recorded a real result — lower confidence than `PASS` because not yet confirmed by the independent dual-run grader, but distinct from `UNVERIFIED` which means no assessment has run), `SHALLOW` (skill recites the concept but does not deepen agent understanding), `REDUNDANT` (baseline already saturated — skill adds no comprehension lift on this concept), `SKIPPED_BASELINE_HIGH` (early-skip — `avg_primary_baseline >= 1.0` after the first 2 evals so the dual-run was aborted; v7 demotion behavior), `NA` (skill carries no `evals/comprehension.json`), `UNVERIFIED` (initial state before any grader run since the v7 schema bump). Confidence hierarchy: `PASS (grader) > PROVISIONAL (single model) > UNVERIFIED (none)`. Demoted in v7: never alone certifies a skill as useful — `application_verdict` is the aggregate-quality field. See docs/adr/0011-split-audit-verdict-into-four-verdicts.md and .claude/rules/version-schema-contract.md § 5.

**Full reference:** [`docs/field-reference.md#comprehension_verdict`](field-reference.md#comprehension_verdict)

---

### `application_verdict` *(optional)*

**Type:** `APPLICABLE` | `REDUNDANT` | `HARMFUL` | `MIXED` | `FALSE_POSITIVE` | `UNVERIFIED` | `PROVISIONAL`

Application-layer verdict produced by gate 9 (the application grader on `evals/application.json`). `APPLICABLE` (loading the skill changes agent behavior on real artifacts in the expected direction — flags, fixes, generative trajectory), `REDUNDANT` (no behavioral delta — agent behaves the same with or without the skill loaded), `HARMFUL` (negative delta — agent makes worse decisions with the skill loaded; SkillsBench arXiv 2602.12670 found 19% of evaluated skills exhibit this), `MIXED` (delta varies across cases — some applicable, some redundant or false-positive), `FALSE_POSITIVE` (skill over-triggers — applies on cases where its expertise does not apply), `UNVERIFIED` (no application assessment has run), `PROVISIONAL` (single-model self-assessment audit found useful behavior but the independent application grader has not confirmed it). The aggregate-quality field in v7: a skill is only behaviorally certified when this verdict is `APPLICABLE`. See docs/adr/0011-split-audit-verdict-into-four-verdicts.md.

**Full reference:** [`docs/field-reference.md#application_verdict`](field-reference.md#application_verdict)

---

### `eval_score` *(optional)*

**Type:** number

Latest aggregate eval grade on a 0.0–5.0 scale, written by `scripts/skill/evaluate-skill.js`. Replaces the read-the-log dance for knowing how this skill scored. When `evals/comprehension.json` exists, the comprehension grader's score lands here; otherwise the standard eval-suite score. Use `eval_failed_ids` to inspect the failing cases.

**Full reference:** [`docs/field-reference.md#eval_score`](field-reference.md#eval_score)

---

### `eval_failed_ids` *(optional)*

**Type:** array of string

Eval IDs that failed in the most recent run. Empty array when clean. Populated alongside `eval_score` by the eval runner. Surfaces failures without forcing readers to crawl `eval-history.jsonl`.

**Full reference:** [`docs/field-reference.md#eval_failed_ids`](field-reference.md#eval_failed_ids)

---

### `lint_verdict` *(optional)*

**Type:** `PASS` | `FAIL` | `UNKNOWN`

Result of the most recent canonical-source schema lint pass against this skill (`scripts/skill-lint.js`). The current lint gate checks valid frontmatter, validation against `schemas/skill.schema.json`, identifier shape, non-empty description, and parent-directory/name alignment. Relation targets, routing quality, drift, export, and eval checks are separate tools. `PASS` means zero lint errors. `UNKNOWN` is the initial state.

**Full reference:** [`docs/field-reference.md#lint_verdict`](field-reference.md#lint_verdict)

---

### `drift_status` *(optional)*

**Type:** `OK` | `DRIFT` | `BROKEN` | `STALE` | `NO_BASELINE` | `EXTERNAL_UNHASHED` | `UNKNOWN`

Current truth-source drift status, mirroring the `scripts/skill-graph-drift.js` sentinel verdicts. `OK` (live hashes match recorded), `DRIFT` (mismatch), `BROKEN` (declared truth source missing), `STALE` (older than `lifecycle.stale_after_days`), `NO_BASELINE` (local truth sources declared but no hashes recorded), `EXTERNAL_UNHASHED` (URL truth sources not fetched), `UNKNOWN` (no drift check has run). Written by the drift sentinel; read by the loop to prioritise re-grounding work.

**Full reference:** [`docs/field-reference.md#drift_status`](field-reference.md#drift_status)

---

### `comprehension_state` *(optional)*

**Type:** `absent` | `present`

Does this skill carry a comprehension eval (typically `evals/comprehension.json`) and the Understanding fields authored for the comprehension grader? `absent` (no comprehension grading), `present` (comprehension evals exist; the five flat Understanding fields `mental_model`, `purpose`, `boundary`, `analogy`, `misconception` are required by the allOf rule, OR the legacy `concept` block satisfies the requirement for v5 skills not yet migrated). Independent of `routing_eval` (router-level) and `eval_state` (content-level). The nested `eval.comprehension_state` is the v3.1 preferred alias.

**Full reference:** [`docs/field-reference.md#comprehension_state`](field-reference.md#comprehension_state)

---

### `concept` *(optional)*

**Type:** object

DEPRECATED in v6: the seven sub-fields below are promoted to flat top-level fields (`mental_model`, `purpose`, `boundary`, `analogy`, `misconception`; `definition` is covered by `description`; `taxonomy` is covered by `category` + `relations.broader`). The nested block is retained for v5 backwards-compatibility but new skills should populate the flat fields instead. The comprehension grader reads either location; when both are present, the flat fields win.

**Sub-fields:**

- `definition` *required* — What the concept IS.
- `mental_model` *required* — Primitives and their relationships.
- `purpose` *required* — What problem the concept solves and the alternative it replaced.
- `boundary` *required* — Things commonly confused with the concept but that are NOT it.
- `taxonomy` *required* — Nearby concepts with their relationship type (subset / alternative / prerequisite / composition / specialization).
- `analogy` *required* — Analogy that preserves the core mechanism.
- `misconception` *required* — The wrong mental model people bring and why it misleads.

**Full reference:** [`docs/field-reference.md#concept`](field-reference.md#concept)

---

### `mental_model` *(optional)*

**Type:** string

Primitives and their relationships. Name primitives and the relationships between them. Markdown permitted. Author with the depth the concept needs — no protocol length cap. Graded by the comprehension grader's `mental_model` dimension (weight 1.5). Replaces nested `concept.mental_model` in v6 — see the v5-to-v6 migration note.

**Full reference:** [`docs/field-reference.md#mental_model`](field-reference.md#mental_model)

---

### `purpose` *(optional)*

**Type:** string

What problem the concept solves and the alternative it replaced. Concrete pain point + prior alternative. No length cap. Graded by the comprehension grader's `purpose` dimension (weight 1.0). Replaces nested `concept.purpose` in v6.

**Full reference:** [`docs/field-reference.md#purpose`](field-reference.md#purpose)

---

### `boundary` *(optional)*

**Type:** string

Things commonly confused with the concept but that are NOT it. Express each difference as a mechanism (different primitives, purpose, or scope) — not just different names. No length cap. Graded by the comprehension grader's `boundary` dimension (weight 1.5). Replaces nested `concept.boundary` in v6. Distinct from `relations.boundary` (routing-layer handoff).

**Full reference:** [`docs/field-reference.md#boundary`](field-reference.md#boundary)

---

### `analogy` *(optional)*

**Type:** string

Analogy that preserves the core mechanism. Translates the concept for a non-expert without breaking the structural relationship between primitives. No length cap. Graded by the comprehension grader's `analogy` dimension (weight 0.5). Replaces nested `concept.analogy` in v6.

**Full reference:** [`docs/field-reference.md#analogy`](field-reference.md#analogy)

---

### `misconception` *(optional)*

**Type:** string

The wrong mental model people bring and why it misleads. Authored hint to inoculate the agent against the common error trap. No length cap. Not directly graded; complements `boundary`. Replaces nested `concept.misconception` in v6.

**Full reference:** [`docs/field-reference.md#misconception`](field-reference.md#misconception)

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

**Full reference:** [`docs/field-reference.md#eval_last_run`](field-reference.md#eval_last_run)

---

### `eval` *(optional)*

**Type:** object

Nested eval-health record (v3.1 preferred alias for the sibling triple `eval_artifacts` / `eval_state` / `routing_eval`). When both the top-level and nested forms are present they must match.

**Sub-fields:**

- `artifacts` *optional* (`none` | `planned` | `present`) — Are eval artifacts present on disk for this skill? Mirrors top-level `eval_artifacts`.
- `content_state` *optional* (`unverified` | `passing` | `monitored`) — What does the eval say about content quality? Mirrors top-level `eval_state`.
- `routing_coverage` *optional* (`absent` | `present`) — Is routing / trigger coverage explicitly evaluated? Mirrors top-level `routing_eval`.
- `comprehension_state` *optional* (`absent` | `present`) — Mirrors top-level `comprehension_state`.

**Full reference:** [`docs/field-reference.md#eval`](field-reference.md#eval)

---

### `stability` *(optional)*

**Type:** `experimental` | `stable` | `frozen` | `deprecated`

Lifecycle posture for consumers. `experimental` (subject to change), `stable` (production-ready), `frozen` (no further changes expected), `deprecated` (use `superseded_by` to name the replacement). Drives consumer pinning decisions.

**Full reference:** [`docs/field-reference.md#stability`](field-reference.md#stability)

---

### `marketplace_tier` *(optional)*

**Type:** `S` | `A` | `B` | `C`

Publication priority for the public marketplace at `github.com/jacob-balslev/skills` / `skills.sh`. `S` = featured (top-of-README, individual hero copy). `A` = high-demand (named in collection tables). `B` = standard utility (included in collection tables). `C` = niche (collapsed 'More' section). Omit entirely for skills that should not be published. Sourced from `marketplace-publication-priority-*.md` and authored per skill. Lint validates the enum; consumers (export-marketplace-skills.js, generate-marketplace-readmes.js) filter and group on this field.

**Full reference:** [`docs/field-reference.md#marketplace_tier`](field-reference.md#marketplace_tier)

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
- `agent_runtimes` *optional* — Target agent runtimes (v3.
- `node` *optional* — Node.
- `node_version` *optional* — Node.
- `notes` *optional* — Free-text additional compatibility notes.

**Full reference:** [`docs/field-reference.md#compatibility`](field-reference.md#compatibility)

---

### `allowed-tools` *(optional)*

**Type:** string

Optional space-separated whitelist of tools the skill is permitted to use (e.g., `Read Edit Bash`). Honoured by harnesses that gate tool calls per skill. Kebab-case spelling matches the common SKILL.md field name and Claude Code's `--allowed-tools` CLI flag. `allowed_tools` (snake_case) is the v3.1 preferred protocol alias; the export transform writes the kebab-case form for SKILL.md consumers.

**Full reference:** [`docs/field-reference.md#allowed-tools`](field-reference.md#allowed-tools)

---

### `allowed_tools` *(optional)*

**Type:** string

Space-separated whitelist of tools (v3.1 preferred snake_case alias for `allowed-tools`). When both are present they must match. The SKILL.md export transform rewrites this to the kebab-case form.

**Full reference:** [`docs/field-reference.md#allowed_tools`](field-reference.md#allowed_tools)

---

### `extends` *(optional)*

**Type:** string

Overlay parent skill name. Only valid when `type: overlay`. The overlay specialises the parent and ceases to have meaning without it; its identity is INHERITED from the parent, not REPLACED. For non-existential cross-skill generalisation, use `relations.broader` instead.

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

### `workspace_tags` *(optional)*

**Type:** array of string

Literal workspace/project handles or semantic tags identifying which workspaces this skill is relevant to. Absent = ambient / cross-project. A workspace config at `.skill-graph/config.json` may map literal project handles to semantic tag sets so one skill tag matches many projects. Do not confuse this authored relevance field with generated manifest `project` ownership.

**Full reference:** [`docs/field-reference.md#workspace_tags`](field-reference.md#workspace_tags)

---

### `routing_bundles` *(optional)*

**Type:** array of string

Tags that group skills into activation bundles (e.g., `frontend`, `data-pipeline`). Routers use these for batch retrieval: when a query matches a routing bundle, all skills tagged with that bundle become candidates. Distinct from `category` (single-value human shelf) and `domain` (hierarchical taxonomy path).

**Full reference:** [`docs/field-reference.md#routing_bundles`](field-reference.md#routing_bundles)

---

### `relations` *(optional)*

**Type:** object

Typed edges to sibling skills. Lint verifies every target exists. Predicate-to-W3C-vocabulary mapping is provided via schemas/skill.context.jsonld (JSON-LD @context). `boundary` is routing-layer asymmetric handoff; `disjoint_with` is the optional OWL class-disjointness predicate — they are distinct, not aliases.

**Sub-fields:**

- `adjacent` *optional* — DEPRECATED ALIAS of `related`.
- `related` *optional* — Symmetric associative relation (skos:related).
- `boundary` *optional* — Score-aware routing exclusion edge — directional.
- `disjoint_with` *optional* — Optional OWL class-disjointness assertion.
- `broader` *optional* — Cross-skill generalisation (skos:broader).
- `narrower` *optional* — Cross-skill specialisation (skos:narrower).
- `verify_with` *optional* — Skills to co-load for verification.
- `depends_on` *optional* — Skills this skill requires conceptually or operationally.

**Full reference:** [`docs/field-reference.md#relations`](field-reference.md#relations)

---

### `grounding` *(optional)*

**Type:** object

Records what the skill is grounded against — the truth sources, the grounding mode, and the failure modes when the truth drifts. Required when the skill makes claims about specific code or external systems. Optional for purely conceptual skills.

**Sub-fields:**

- `domain_object` *required* — What the skill is about (e.
- `subject` *optional* — What the skill is about (v3.
- `grounding_mode` *required* (`repo_specific` | `universal` | `hybrid`) — Whether the skill's claims are repo-specific, universal, or a hybrid.
- `claim_scope` *optional* (`repo_specific` | `universal` | `hybrid`) — Whether the skill's claims are repo-specific, universal, or a hybrid (v3.
- `truth_sources` *required* — Files, docs, or URLs that ground the skill's claims.
- `failure_modes` *required*
- `evidence_priority` *required* (`repo_code_first` | `general_knowledge_first` | `equal`)

**Full reference:** [`docs/field-reference.md#grounding`](field-reference.md#grounding)

---

### `portability` *(optional)*

**Type:** object

Portability execution signal. `readiness` declares whether portability is only declared (`declared`), covered by export tooling (`scripted`), or verified with a target-runtime receipt (`verified`). `targets` lists supported export destinations, currently `skill-md`.

**Sub-fields:**

- `readiness` *required* (`declared` | `scripted` | `verified`)
- `targets` *required* — Supported export destinations.
- `export_targets` *optional* — Supported export destinations (v3.

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
