# Skill Graph Field Reference

> One section per current skill-package field. Use this when writing or reviewing `SKILL.md` plus `audit-state.json`.
> For the "which value do I pick?" decisions, see [`skill-metadata-protocol/field-decision-guide.md`](field-decision-guide.md).
> For field groups, conditional requiredness, and schema strictness rules, see [`skill-metadata-protocol/design-rationale.md`](design-rationale.md).

Fields are listed in authored order — the same order they appear in [`examples/skill-metadata-template.md`](../examples/skill-metadata-template.md).

## Three docs, three genres

The field reference is split across three coordinated documents. Use whichever fits your task:

| Doc | Genre | When to read |
|---|---|---|
| [`SKILL_METADATA_PROTOCOL_field-reference.md`](field-reference.md) (this doc) | **Hand-curated prose reference.** Field-by-field, with worked examples, lint notes, and cross-cutting guidance. | When authoring or reviewing a skill package and you want examples and "when to use" rules alongside the schema-canonical definition. |
| [`SKILL_METADATA_PROTOCOL_field-reference.generated.md`](field-reference.generated.md) | **Auto-generated index.** Built from `schemas/SKILL_METADATA_PROTOCOL_schema.json` description strings by `scripts/build-field-reference.js`. Drift-free against the schema. | When you want the machine-guaranteed list of every field, every type, every pattern, every enum value. The fastest way to verify what the schema actually accepts today. |
| [`field-rationale.md`](../docs/field-rationale.md) | **Hand-authored "why this field" rationale.** Covers the ~10 fields whose meaning is non-obvious from the schema description (`scope`, `eval_artifacts`, `eval_state`, `routing_eval`, `relations.depends_on`, `relations.verify_with`, `relations.broader`, `grounding.evidence_priority`, `lifecycle.review_cadence`, `portability.readiness`). | When you understand *what* a field stores but want to know *why the field exists at all* and *what the common confusion looks like*. |

The schema is the single source of truth for shape; this doc is the source of truth for prose; `field-rationale.md` is the source of truth for design intent. Lint check C7 (in `scripts/check-protocol-consistency.js`) verifies the generated index stays in sync with the schema description strings — running `node scripts/build-field-reference.js --check` against the live schema must succeed before commit.

---

## `schema_version`

**Purpose.** Versions the contract so migration tooling can handle future schema changes deterministically.

**Rules.**
- Must be the integer `8` or the string `"8"` for current skills.
- Start every new skill at the current schema version. Do not downgrade.
- Historical contract shapes live in ADRs, CHANGELOG, and git history; this file describes the current authoring contract.

**Versioning semantics (policy).** The integer signals *breaking vs non-breaking* evolution. A minor/patch axis is intentionally not surfaced on this field; additive schema changes do not require consumers to migrate, so no version bump is emitted.

**Example.**
```yaml
schema_version: 8
```

**When to use.** Always — this is a required field.

**When NOT to use.** N/A — required.

---

## `skill_graph_protocol`

**Purpose.** Optional sidecar (`audit-state.json`) content-label claim — the protocol version whose **substantive content bar** the skill has actually earned, as distinct from `schema_version` (the mechanical shape integer a codemod can bump). The pair makes the "Version Labels Are Earned, Not Bumped" doctrine (`AGENTS.md`) deterministically checkable: a skill whose `schema_version` is ahead of its content label is honestly recording "shape migrated, content not yet."

**Rules.**
- Format: `Skill Metadata Protocol v<N>` (pattern-validated). Example: `Skill Metadata Protocol v8`.
- Written by the audit loop when a content migration completes — the version's semantic content (classification, free-text `scope`, Understanding fields, gradeable eval artifacts, audited verdicts) must be present and reviewed before the label advances.
- **Never advanced by find-replace / codemod.** A bulk label bump with no content change is fake conformance.
- A label *behind* `schema_version` is honest drift, not an error — fix it by doing the content migration through `/audit:*`, then advancing the label.
- History: this token previously existed only as export-provenance frontmatter that `normalizeFrontmatter()` strips (leaving the doctrine governed by human discipline alone); it became a first-class sidecar field on 2026-06-10 so audit-loop and status tooling can read it. The export pipeline may still emit its own provenance copy in exported frontmatter; the sidecar value is the checkable source.

**Example.**
```json
{ "schema_version": 8, "skill_graph_protocol": "Skill Metadata Protocol v8" }
```

**When to use.** Stamp (via the audit loop) whenever a skill completes the content migration for a protocol version.

**When NOT to use.** Never hand-author it to "catch a skill up" — that is the exact doc-lie the field exists to prevent.

---

## `urn`

**Purpose.** Globally-unique persistent identifier for the skill. Unlocks FAIR Findability (Wilkinson et al. 2016) across repos and federated registries. `name` is the display-layer handle; `urn` is the stable identity consumers should cite. See ADR 0004 for the full rationale.

**Rules.**
- Optional in v4.
- Format: `urn:skill:<repo-slug>:<skill-name>`.
- `<repo-slug>` is the publishing repo's canonical short handle — lowercase, hyphen-separated, `[a-z0-9-]+` (e.g. `skill-graph`, or your own repo's short name).
- `<skill-name>` MUST equal the `name` field exactly.
- Must be globally unique across all federated repos — the URN is the primary key a registry uses to resolve skills.
- Pattern: `^urn:skill:[a-z0-9][a-z0-9-]*:[a-z0-9][a-z0-9-/:]*$`.

**Example.**
```yaml
name: knowledge-graph
urn: urn:skill:skill-graph:knowledge-graph
```

**When to use.** Populate on every new skill and on every skill edited after 2026-04-20. Required when the skill is published to a federated registry. Recommended universally because it is cheap to add and free to have.

**When NOT to use.** Skills that are strictly internal and will never leave the authoring repo MAY omit the field in v3. They cannot omit it in v4.

**JSON-LD mapping.** `urn` maps to `@id` in `schemas/skill.context.jsonld`. When the skill is projected to RDF, the URN becomes the subject of every triple derived from the skill's frontmatter.

**References.** RFC 8141 (URN Syntax), ADR 0004.

---

## `name`

**Purpose.** Stable skill identifier used for routing, `relations.*` targets, and filesystem layout. This is the handle other skills point at in their `relations` blocks.

**Rules.**
- Must match `^[a-z0-9][a-z0-9-/:]*$` — lowercase alphanumerics, hyphens, forward slashes, and colons only.
- Must start with a letter or digit.
- Should match the parent directory name so Agent-Skills export can use the directory as the canonical identifier.
- Forward slashes (`/`) and colons (`:`) are allowed in Skill Graph names but are normalized to hyphens during Agent-Skills export.

**Example.**
```yaml
name: shopify
```

**When to use.** Always — required.

**When NOT to use.** N/A — required.

---

## `description`

**Purpose.** A short description of what the skill is about. Identifies the subject; does not prescribe activation.

Activation, trigger, and exclusion semantics belong to the dedicated fields built for them:

| Concern | Field |
|---|---|
| Semantic activation tokens | `keywords` |
| Exact phrase / label triggers | `triggers` |
| Realistic prompts the skill should activate for | `examples` |
| Near-miss prompts that should activate a different skill | `anti_examples` |
| File-surface activation | `paths` |
| Routing-layer exclusion edges to other skills | `relations.suppresses` |
| Project-affiliation filter | `project` |

**Rules.**
- Describe what the skill is about. Keep it short and topical.
- Do not pack routing prescriptions ("Use when…", "Do NOT use for…") into this field — those duplicate `examples` / `anti_examples` / `relations.suppresses` in a less machine-readable form.
- Do not repeat the `## Coverage` section body here.

**Example.**
```yaml
description: "Shopify integration patterns covering the Admin API, webhook handling, and inventory sync."
```

**When to use.** Always — required.

**When NOT to use.** N/A — required. Keep it short.

**Verification.** `scripts/skill-lint.js` enforces the schema gate (required shape, non-empty text, no length cap). Activation quality is verified through routing evals on `examples` + `anti_examples` via `scripts/skill-graph-routing-eval.js`, not through inspection of `description` text.

---

## `version`

**Purpose.** Tracks the semantic version of the skill content itself, independent of the schema version. Enables change tracking, relation resolution, and diff-based audit.

**Rules.**
- Must be a semver string matching `^[0-9]+\.[0-9]+\.[0-9]+$`.
- Start new skills at `1.0.0`.
- Increment the patch version for small corrections (examples, wording, typos).
- Increment the minor version when new sections or fields are added without breaking the existing shape.
- Increment the major version when content is reorganized in a way that breaks the existing shape, or the skill's classification (`subject` / `public`) changes.

**Example.**
```yaml
version: 1.0.0
```

**When to use.** Always — required.

**When NOT to use.** N/A — required.

---

## `subject`

**Purpose.** Primary classification — what the skill teaches. Closed 12-value enum. The v8 classification's main axis; routers and browse UIs key off it first.

**Rules.**
- **Required.** Every skill must declare a `subject`.
- **Closed 12-value enum** (the competency the skill teaches), in 3 bands: `backend-engineering` \| `frontend-engineering` \| `software-architecture` \| `data-engineering` \| `agent-ops` \| `ai-engineering` \| `quality-assurance` \| `design` \| `reasoning-strategy` \| `software-engineering-method` \| `knowledge-organization` \| `product-domain`.
- **Balance rule:** each subject must hold 5–25 skills. <5 = fold or recruit; >25 = subdivide via `taxonomy_domain` slash-path.
- For polyhierarchy (skills that legitimately span two subjects), use `subjects[]` array (primary first, optional secondary).

**Example.**
```yaml
subject: backend-engineering
```

**When to use.** Always. Pick the single best primary; cross-cutting fit goes into `subjects[1]` (max 1 secondary).

**Subject definitions** (band A — engineering; band B — AI-agentic; band C — cross-cutting craft).
- `backend-engineering` — server-side construction: APIs, async/jobs, runtime, protocols, integration-as-code.
- `frontend-engineering` — client/UI construction in a web framework: components, rendering, state, hooks, routing.
- `software-architecture` — system shape before code: boundaries, contracts, ADRs, tech selection, event/domain + conceptual/ER/state modeling.
- `data-engineering` — data tier: schema/migration, indexing, replication, sharding, transactions, query/connection tuning.
- `agent-ops` — the agent *runtime*: loops, context windows, skill infrastructure, dispatch, tool-call protocol, monitoring.
- `ai-engineering` — LLM *features in a product*: prompt design, evals, generative UI, guardrails, tool-use strategy, summarization.
- `quality-assurance` — verifying *properties*: testing, a11y, perf, security, type-safety, code review.
- `design` — human-facing design craft: visual systems, typography, interaction, UX, design research, content/microcopy.
- `reasoning-strategy` — generic thinking + business/market strategy: decision quality, mental models, competitive strategy, negotiation.
- `software-engineering-method` — engineering process discipline: spec/test-driven dev, debugging method, prioritization, refactor, version-control, doc discipline.
- `knowledge-organization` — structuring meaning: taxonomy, ontology, semantics, classification, linguistics, knowledge/concept modeling.
- `product-domain` — genuine external product/market verticals: ecommerce platforms, marketplaces, fulfillment, vendor playbooks.

See `docs/adr/0020-twelve-shelf-competency-reaxis.md` for the current shelf rationale.

---

## `subjects`

**Purpose.** Ordered subject array for polyhierarchy — when a skill genuinely spans two browse shelves. Cap of 2 enforces that polyhierarchy is the exception, not the default.

**Rules.**
- Optional. When present, `subjects[0]` MUST equal `subject`.
- Max 2 entries.
- Drawn from the same closed 12-enum as `subject` (see ADR-0020).
- Use when a skill genuinely teaches a primary subject AND meaningfully covers a secondary. Example: `webhook-integration` is primarily `backend-engineering` and secondarily `product-domain`; `information-architecture` is primarily `design` and secondarily `knowledge-organization`.
- Do NOT use for semantic adjacency that isn't shelf-level — `relations.related` covers that.

**Example.**
```yaml
subject: backend-engineering
subjects: [backend-engineering, product-domain]
```

**When NOT to use.** Skills that fit one subject cleanly. Adding a forced secondary dilutes the polyhierarchy signal.

---

## `taxonomy_domain`

**Purpose.** Hierarchical taxonomy sub-path as slash-delimited segments. Complements `subject`: the flat browse shelf and the slash-delimited tree path answer different questions. A UI or docs site uses `taxonomy_domain` to render a folder tree; a filter UI uses `subject` for quick grouping.

**Rename.** Renamed from `domain` to disambiguate from `grounding.subject_matter` (the grounding-block free-text label) and from cross-taxonomy routing doctrine prose. The taxonomic role is preserved; the word `domain` survives in the field name to signal "this is the taxonomic axis." See the ADR-0017 amendment of 2026-05-27.

**Rules.**
- Optional.
- Lowercase alphanumeric segments separated by `/` (for example, `ecommerce/integrations/shopify`).
- Must match pattern `^[a-z0-9][a-z0-9-]*(/[a-z0-9][a-z0-9-]*)*$`.
- Do not use absolute paths, leading `/`, trailing `/`, `.`, or `..`.
- One skill, one path. Use `subjects[]` (max 2) or `relations.related` for a secondary access path.

**Example.**
```yaml
taxonomy_domain: ecommerce/integrations/shopify
```

**When to use.** When a `subject` holds many skills (>25 per the balance rule) and a slash-delimited subdivision helps readers find related skills.

**When NOT to use.** Small subjects where the flat shelf is sufficient. Skills where categorization is genuinely ambiguous should use `subjects[]` (a second browse shelf, max 2) or `relations.related` instead.

---

## `scope`

**Purpose.** PRD-style free-text statement of what this skill teaches and what it does not. Mirrors the body `## Coverage` plus `## Do NOT Use When` sections at the frontmatter level for fast scanning.

**Rules.**
- Required. String. No enum constraint.
- One paragraph or two. Author what the skill teaches and what it explicitly does not teach.
- Do not duplicate `description` (the topical summary) or `## Coverage` (the bulleted scope map). `scope:` is the at-a-glance complement — a reader scanning frontmatter sees what's in/out without opening the body.

**Example.**
```yaml
scope: "Controlled classification systems with explicit retrieval-task analysis. Covers SKOS broader/narrower, facets, and the substitution test. Out: formal OWL axioms and reasoning constraints — use `ontology-modeling` for that."
```

**When to use.** Always. Make the statement short enough to scan but concrete enough to name what the skill does and does not teach.

**When NOT to use.** N/A under the current schema — required. For trivial skills, keep the statement concise.

---

## `public`

**Purpose.** Publishability gate — is this skill safe for public release to the skills.sh marketplace? It is the single switch the marketplace exporter (`scripts/export-marketplace-skills.js`) filters on, and the machine enforcement of the HARD private-content boundary.

**Allowed values.** A boolean.

| Value | Meaning |
|---|---|
| `true` | Publishable — carries no private API keys, personal data, customer data, or internal-only operational doctrine. Exported to the marketplace. |
| `false` | Private — carries private/secret/personal/customer/internal data. NEVER exported. |

**Rules.**
- **Required.** Every skill must declare a boolean `public`.
- The marketplace export is **fail-safe**: only `public: true` (and not repo-grounding-excluded) skills are exported; `public: false` and a missing flag both stay private.
- `public` does NOT trigger the `grounding` requirement — that is keyed off `project[]` presence (see `grounding`).

**Example.**
```yaml
public: false
project:
  - handle: skill-graph
    role: source-of-truth
grounding:
  subject_matter: "…"
```

**When to use.** Always — required.

**When NOT to use.** Never omit it. When unsure, author `public: false` (fail-safe) until the audit loop confirms the skill is leak-free.

---

## `project`

**Purpose.** Projects this skill is linked to. Each entry is an object with a kebab-case `handle` and a free-text `role`. Replaces the v8 `workspace_tags` field and makes project belonging-entity identity a first-class queryable axis. The router's project-fit check reads this array directly.

**Rules.**
- Optional.
- Array of objects. Each object has a required `handle` (kebab-case, matches `^[a-z0-9][a-z0-9-]*$`) and optional `role` (free-text).
- Suggested `role` values: `source-of-truth`, `consumer`, `mirror`.
- Absent = ambient / cross-project. The router treats such skills as applying to any project query.

**Example.**
```yaml
project:
  - handle: skill-graph
    role: source-of-truth
  - handle: jobsogning
    role: consumer
```

**When to use.** When the skill is meaningfully coupled to one or more projects. Required in practice when the skill is project-anchored (the `project[]` array names *which* projects it belongs to).

**When NOT to use.** Truly ambient skills with no project affiliation.

---

## `repo`

**Purpose.** Repos this skill is linked to. Each entry is an object with a kebab-case `handle` and a canonical `url`. Plural even though most skills today have one source repo, so federation is structurally ready without a future schema bump. Replaces the implicit identity encoded in URN compounds (`urn:skill:<repo-slug>:<name>`) and the stripped `skill_graph_source_repo` export-provenance keys.

**Rules.**
- Optional.
- Array of objects. Each object has a required `handle` (kebab-case) and optional `url` (canonical repository URL).
- Most skills will list one entry. Multi-entry arrays support federation/mirror scenarios.

**Example.**
```yaml
repo:
  - handle: skill-graph
    url: https://github.com/jacob-balslev/skill-graph
```

**When to use.** When the skill is sourced from a specific repo. Optional but recommended when it makes belonging-entity identity queryable instead of buried in the URN.

**When NOT to use.** Truly ambient skills with no source repo (rare).

---

## `owner`

**Purpose.** Records who is responsible for keeping the skill current. Enables audit tooling to surface orphaned or unmaintained skills.

**Rules.**
- Free-form string — no enum is enforced.
- Use a stable identifier: a GitHub handle, a team name, or `maintainer` for shared ownership.
- For open-source skills with no single owner, use `community`.

**Example.**
```yaml
owner: maintainer
```

**When to use.** Always — required.

**When NOT to use.** Do not omit or use a placeholder like `TBD`. An unknown owner is still a real state — record the team that accepted the skill.

---

## `freshness`

**Purpose.** Records when the author last **reviewed** the skill's content for accuracy. This is the **reviewer's footprint**, NOT the editor's footprint — the Audit Status field [`last_changed`](#last_changed) is loop-stamped on every SKILL.md edit and serves the editor-footprint role. The two are intentionally distinct: a skill can be edited without a fresh review (cosmetic fix) or reviewed without an edit (the author re-read and confirmed it still holds).

Drives staleness detection in audit tooling.

**Rules.**
- ISO 8601 date string (`YYYY-MM-DD`).
- Bump this field when the author **reviews the content for accuracy** — including substantive revisions, but also a pure re-review that confirms the skill still holds.
- Cosmetic edits (typos, formatting) should NOT bump `freshness` — they affect `last_changed` only. The distinction is "did the author re-verify accuracy?" — typos do not require re-verification.
- A `freshness` date more than 90 days old is a signal for re-review.
- **Interpretation for agents:** `freshness` is the author's "I reviewed this on X" claim. For "when was the file last touched," read `last_changed`. For "when did the audit loop last run," read `last_audited`.

**Example.**
```yaml
freshness: "2026-04-15"
```

**When to use.** Always — required.

**When NOT to use.** N/A — required. If you are unsure of the last review date, set it to the current date as an explicit "reviewed now" assertion.

---

## `reviewed_at`

**Purpose.** v3.1 preferred alias for `freshness`. Identical semantics; the rename uses the project's own `_at` date-field convention (per the `linguistics` skill) and removes the metaphorical phrasing ("freshness" is a property of food).

**Rules.**
- ISO 8601 date string (`YYYY-MM-DD`).
- When both `freshness` and `reviewed_at` are present, they must match.
- v3.x skills can set either; v4 makes `reviewed_at` canonical and removes `freshness`. ADR 0005 proposes a further consolidation with `drift_check.last_verified` in v4.

**Example.**
```yaml
reviewed_at: "2026-05-12"
```

---

## `drift_check`

**Purpose.** Records when the skill was last verified against its truth sources (code, docs, external specs) AND stores content hashes of those truth sources at the time of verification. The stored hashes turn `drift_check` from a self-asserted date into evidence the drift sentinel can verify. Distinct from `freshness` — a skill can be editorially fresh but technically drifted.

**Rules.**
- Object with one required sub-field and one optional sub-field.
- `last_verified`: ISO 8601 date string (`YYYY-MM-DD`).
- `truth_source_hashes`: optional map of normalized truth-source key -> SHA-256 hex digest.
- Keys must match the normalized form produced from `grounding.truth_sources`: `path` for whole-file sources, `path#Lstart-Lend` for line ranges, and `path#anchor` for anchor-only sources. The drift sentinel (`scripts/skill-graph-drift.js`) reports DRIFT when any live hash differs from the recorded hash, BROKEN when a local truth source is missing, STALE when the lifecycle window is exceeded, NO_BASELINE when `truth_source_hashes` is absent but local truth sources are declared, and EXTERNAL_UNHASHED when a URL truth source is valid but was not fetched on this run (URL fetching is opt-in via `--fetch-external`, curl-backed; the default run stays network-free).
- For ambient skills (no `project[]`) with no external truth sources, `drift_check.last_verified` equals `freshness` and `truth_source_hashes` is omitted.
- Record hashes with `node scripts/skill-graph-drift.js --record --apply <skill-path>`; preview without `--apply`.
- A `drift_check.last_verified` date significantly older than `freshness` is a warning sign that editorial updates have outpaced verification.

**Sub-fields.**

| Sub-field | Type | Meaning |
|---|---|---|
| `last_verified` | string (date) | ISO date of the most recent verification against truth sources |
| `truth_source_hashes` | object (string -> string) | Map of normalized truth-source key -> SHA-256 hex digest at the time of verification |

**Example.**
```yaml
drift_check:
  last_verified: "2026-04-17"
  truth_source_hashes:
    "src/integrations/shopify/client.ts": "c2a4b1e0...64-char-hex..."
    "src/integrations/shopify/webhooks.ts#L40-L96": "7f81a3d2...64-char-hex..."
```

**When to use.** Always — required.

**When NOT to use.** Do not fabricate hashes. If you cannot compute them with the drift tool, omit `truth_source_hashes` and accept a NO_BASELINE state until you can run the tool. URL truth sources are valid grounding references, but the built-in drift sentinel reports them as EXTERNAL_UNHASHED unless a separate fetch-and-hash workflow records evidence.

---

## `last_audited`

**Purpose.** ISO date of the most recent audit run that produced a recorded verdict for this skill.

**Rules.**
- Optional. ISO 8601 date string (`YYYY-MM-DD`).
- Set by the audit loop when it writes its verdict. Do not hand-author; let the audit tool write it.
- If absent, the skill has no recorded audit history.

**Example.**
```yaml
last_audited: "2026-05-16"
```

**When to use.** Set by `skill-audit.js` or the audit-loop pipeline. Authors do not need to set this manually.

**When NOT to use.** Do not fabricate or manually back-date. An absent field is more accurate than a guessed date.

---

## `last_changed`

**Purpose.** ISO date of the last meaningful content change to the SKILL.md. Distinct from `freshness` (editorial review date) and `last_audited` (audit run date).

**Rules.**
- Optional. ISO 8601 date string (`YYYY-MM-DD`).
- Updated when the skill body or frontmatter receives a substantive edit.
- Used by the drift sentinel to determine whether a post-audit change has invalidated the recorded layer verdicts.

**Example.**
```yaml
last_changed: "2026-05-14"
```

---

## `structural_verdict`

**Purpose.** Form-layer verdict produced by gates 1–2 and 7 of the skill-audit loop (schema lint, manifest census, concept-section shape).

**Allowed values.**

| Value | Meaning |
|---|---|
| `PASS` | Form gates passed cleanly |
| `PASS_WITH_FIXES` | Form gates passed with warnings (not errors) |
| `FAIL` | One or more form gates produced errors that block external-constraint compliance (Anthropic Agent Skills marketplace, OpenAI tool-use API) |
| `UNVERIFIED` | No structural audit has run for this skill yet |

**Rules.**
- Optional. Defaults to `UNVERIFIED` when absent.
- Written by the audit loop (`scripts/skill/skill-evolution-loop.js`); do not hand-author.
- Per ADR 0011: only external-constraint violations produce `FAIL`. Internal style preferences (title length below external limit, body section preferences, naming conventions beyond what the marketplace enforces) are warnings, not failures.

**Example.**
```yaml
structural_verdict: PASS
```

---

## `truth_verdict`

**Purpose.** Truth-layer verdict produced by gates 3–6 of the skill-audit loop (truth-source catalog, drift sentinel, test coverage, claim verification).

**Allowed values.**

| Value | Meaning |
|---|---|
| `PASS` | Truth sources align with declared `last_verified` and recorded hashes |
| `DRIFT` | Truth sources changed since `last_verified` |
| `BROKEN` | Declared truth sources missing or unreadable |
| `UNVERIFIED` | No truth audit has run for this skill yet |

**Rules.**
- Optional. Defaults to `UNVERIFIED` when absent.
- Written by the audit loop; do not hand-author.
- Independent of `drift_status` — that field is the per-script signal from `scripts/skill-graph-drift.js`. `truth_verdict` is the audit-loop roll-up.

**Example.**
```yaml
truth_verdict: PASS
```

---

## `comprehension_verdict`

**Purpose.** Comprehension-layer verdict produced by gate 8 (the comprehension grader on `evals/comprehension.json`). Never alone certifies a skill as useful.

**Allowed values.**

| Value | Meaning |
|---|---|
| `PASS` | Loading the skill produces a measurable comprehension delta on the comprehension scenarios |
| `PROVISIONAL` | A single competent model ran the comprehension assessment; useful evidence, but lower confidence than the independent dual-run grader |
| `SHALLOW` | The skill recites the concept but does not deepen agent understanding |
| `REDUNDANT` | Baseline already saturated — the foundation model already knows the concept from training |
| `SKIPPED_BASELINE_HIGH` | Early-skip: `avg_primary_baseline >= 1.0` after the first 2 evals, so the dual-run was aborted |
| `NA` | The skill has no `evals/comprehension.json` |
| `UNVERIFIED` | Initial state before any grader run |

**Rules.**
- Optional. Defaults to `UNVERIFIED` when absent.
- Written by the comprehension grader or a documented single-model self-assessment audit; do not hand-author without evidence.
- The comprehension grader runs on a cheap model (Haiku 4.5 / Gemini Flash) and may exit early when baseline is already high. See ADR 0011 Change 3.
- This verdict is the behavior-gate quality signal (gate 8).

**Example.**
```yaml
comprehension_verdict: SKIPPED_BASELINE_HIGH
```

---

## `application_verdict`

**REMOVED — inert legacy field.** The application (behavior-change / APPLICABLE) verdict was **removed entirely on 2026-06-15** (see CHANGELOG). It produced 0 APPLICABLE corpus-wide and falsely stamped HARMFUL/REDUNDANT/MIXED on good skills (the test was not discriminating). The field remains DEFINED-but-inert in `schemas/skill-audit-state.schema.json` only so existing `audit-state.json` sidecars validate; it is no longer produced, read, or gated. `comprehension_verdict` is now the behavior-gate quality signal. Recover the prior field semantics from git history if needed.

---

## `eval_score`

**Purpose.** Numeric score from the most recent eval run, on the 0.0–5.0 scale used by the audit loop.

**Rules.**
- Optional. Float, range 0.0–5.0.
- Written by the graded audit; do not hand-author.
- Corresponds to the weighted average of dimension scores in the audit scorecard.

**Example.**
```yaml
eval_score: 4.2
```

---

## `eval_failed_ids`

**Purpose.** List of eval case IDs that failed in the most recent eval run. Enables fast lookup of which specific cases a skill is failing without opening the full scorecard.

**Rules.**
- Optional. Array of strings (eval case ID strings, matching `id` fields in the eval JSON).
- Empty array means all cases passed; absent means no eval has been run.
- Written by the graded audit; do not hand-author.

**Example.**
```yaml
eval_failed_ids: ["case-03", "case-07"]
```

---

## `lint_verdict`

**Purpose.** The verdict from the most recent lint run against this skill; the per-script signal can roll up into `structural_verdict`.

**Allowed values.**

| Value | Meaning |
|---|---|
| `PASS` | Canonical-source schema lint gate passed |
| `FAIL` | One or more canonical-source schema lint checks failed |
| `UNKNOWN` | No lint has been run or result is unavailable |

**Rules.**
- Optional. Defaults to `UNKNOWN` when absent.
- Written by `scripts/skill-lint.js` or the audit loop's canonical-source schema lint phase.

**Example.**
```yaml
lint_verdict: PASS
```

---

## `drift_status`

**Purpose.** The result of the most recent drift check for this skill; the per-script signal can roll up into `truth_verdict`.

**Allowed values.**

| Value | Meaning |
|---|---|
| `OK` | All truth source hashes match |
| `DRIFT` | At least one local truth source hash differs from the recorded baseline |
| `BROKEN` | At least one local truth source file is missing |
| `STALE` | The `last_verified` date exceeds the lifecycle window |
| `NO_BASELINE` | Local truth sources declared but no hashes recorded |
| `EXTERNAL_UNHASHED` | URL truth source present but not fetched and hashed |
| `UNKNOWN` | No drift check has been run |

**Rules.**
- Optional. Written by `scripts/skill-graph-drift.js`.
- Do not hand-author; let the drift tool write it.

**Example.**
```yaml
drift_status: OK
```

---

## `eval_artifacts`

**Purpose.** Declares the presence of eval artifact files for this skill. This is the "does an eval file exist on disk?" axis — independent of whether the eval has ever been run or is routed anywhere.

**Allowed values.**

| Value | Meaning | Artifact expectation |
|---|---|---|
| `none` | No eval work started or planned | No eval artifact expected |
| `planned` | Eval work intended but not yet authored | No eval artifact yet — temporary state |
| `present` | One or more eval files exist on disk | Verify with the eval/audit tooling and a concrete artifact path |

**Rules.**
- `present` requires a real eval artifact. Do not set it without a file and receipt.
- `planned` is a temporary state — move to `present` once artifacts ship.
- `none` is reserved for skills where evals are genuinely not part of the plan (rare).

**Example.**
```yaml
eval_artifacts: present
```

**When to use.** Always — required.

**When NOT to use.** N/A — required. Do not inflate (`present` without a real file).

**Migration from v1.** The v1 `eval_status` enum mixed three orthogonal concerns; this field is the "artifact state" axis. See `docs/manifest-field-mapping.md § Migration Note — v1 → v2` for the full mapping (e.g. `eval_status: evals` → `eval_artifacts: present, eval_state: passing, routing_eval: absent`).

---

## `eval_state`

**Purpose.** Declares the current runtime verification state of the skill's evals. This is the "have the evals been run and passed recently?" axis — independent of whether the artifact file exists.

**Allowed values.**

| Value | Meaning |
|---|---|
| `unverified` | No passing run has been recorded for these evals |
| `passing` | A recent run exists and was green |
| `monitored` | Actively run in a live toolchain, continuously verified |

**Rules.**
- `passing` requires a concrete verification receipt (test output, CI run, or similar evidence).
- `monitored` requires a live toolchain that re-runs the evals on some cadence.
- Do not use `passing` without a recorded run — use `unverified` when the artifacts exist but have not been exercised.

**Example.**
```yaml
eval_state: passing
```

**When to use.** Always — required.

**When NOT to use.** N/A — required.

---

## `routing_eval`

**Purpose.** Declares whether routing / trigger coverage is explicitly evaluated for this skill. This is the "are we checking that the skill activates on the right prompts?" axis — independent of the content-level eval state captured by `eval_state`.

**Allowed values.**

| Value | Meaning |
|---|---|
| `absent` | Routing / trigger coverage is not evaluated for this skill |
| `present` | Routing / trigger coverage is part of the eval set |

**Rules.**
- `present` implies the eval artifacts include routing or trigger assertions, not just content quality.
- Most starter skills default to `absent` — routing coverage is a deeper authoring step.

**Enforcement.** `routing_eval: present` is a verifiable claim. The harness at `scripts/skill-graph-routing-eval.js` runs every `examples[]` entry through `skill-graph-route.js` and asserts the skill wins; runs every `anti_examples[]` entry and asserts the winner is NOT this skill AND (if non-null) is named in `relations.suppresses[]`. A skill that declares `present` must satisfy two harness gates:

1. Both `examples` and `anti_examples` are populated — the harness needs prompts to evaluate.
2. Running `node scripts/skill-graph-routing-eval.js --skill <name>` returns verdict `PASS` for the skill.

A skill whose harness run contains any `FAIL` case cannot honestly claim `present`; the routing-eval output surfaces each failing prompt with the router's actual decision. A `COVERAGE_GAP` verdict (the anti-example correctly avoids this skill but no other skill absorbs it) is informational and does not block `present` — the anti-example did its job; the coverage-gap signal is for the next authoring iteration. Prefer `absent` until the harness agrees — honesty over green checkmarks.

**Current status.** New skills should default to `absent` until the harness agrees. A `present` value is earned by tightening keywords, splitting `examples` from `anti_examples`, and populating `relations.suppresses[]` with explicit same-domain exclusion targets.

**Example (preferred — production starters).**
```yaml
routing_eval: present
```

**Example (acceptable for new authoring — flip to `present` once the harness passes).**
```yaml
routing_eval: absent
```

**When to use.** Always — required.

**When NOT to use.** N/A — required. Do not inflate (`present` without a routing harness that returns verdict PASS for the skill).

---

## `comprehension_state`

**Purpose.** Declares whether the skill carries a concept-comprehension grading surface in addition to routing and content evals.

**Allowed values.**

| Value | Meaning |
|---|---|
| `absent` | No comprehension grading is declared |
| `present` | A comprehension eval exists and the five flat Understanding fields are required |

**Rules.**
- Optional in v3. Omitted means `absent`.
- Independent of `routing_eval` and `eval_state`.
- `present` requires the five flat Understanding fields (`mental_model`, `purpose`, `concept_boundary`, `analogy`, `misconception`) by schema rule.

**Example.**
```yaml
comprehension_state: present
```

**When to use.** Use `present` only when the skill has a real comprehension eval and a filled concept teaching block.

**When NOT to use.** Do not set `present` for skills that only have routing examples or general eval artifacts.

---

## `mental_model`

**Purpose.** The primitives, metaphors, or operative principles an agent needs to reason about this subject. Describes *how* to think about the subject — the reasoning substrate, not a procedure.

**Rules.**
- Optional. String.
- Required when `comprehension_state: present`.
- Must be distinct from `purpose` (which covers *why* the concept exists) and `concept_boundary` (which covers *what it is not*).

**Example.**
```yaml
mental_model: "Start from entities, cardinality, optionality, ownership, and lifecycle."
```

**See also.** `purpose`, `concept_boundary`.

---

## `purpose`

**Purpose.** The problem this concept solves and what it replaced or improved upon. Answers "why does this concept exist?"

**Rules.**
- Optional. String.
- Required when `comprehension_state: present`.

**Example.**
```yaml
purpose: "It prevents persistence shape from smuggling in a false domain model."
```

---

## `concept_boundary`

**Purpose.** An explicit statement of what the concept is **not** — adjacent concepts the agent might confuse it with. This is the Understanding field, distinct from the routing edge `relations.suppresses`.

**Rules.**
- Optional. String.
- Required when `comprehension_state: present`.
- This field is the primary grader input for the boundary rubric dimension (adjacent-concept discrimination). Weight 1.5 in the schema — second highest.
- Express each difference as a *mechanism* (different primitives, purpose, or scope), not just a different name.

**Example.**
```yaml
concept_boundary: "It is not database tuning, UI information architecture, or API envelope design."
```

---

## `analogy`

**Purpose.** A single structural analogy that helps an agent grasp the concept's shape. Graded on both correct application AND correct identification of the analogy's limits.

**Rules.**
- Optional. String.
- Required when `comprehension_state: present`.
- Weight 0.5 in the schema — the lowest of the concept-block fields. Analogy is a teaching aid, not a load-bearing primitive.

**Example.**
```yaml
analogy: "Like drawing load-bearing walls before choosing interior paint."
```

---

## `misconception`

**Purpose.** The single most common wrong belief about the concept that agents and practitioners hold. Graded on whether the agent corrects it unprompted when the misconception is embedded in a probe.

**Rules.**
- Optional. String.
- Required when `comprehension_state: present`.
- Complements `concept_boundary`: `concept_boundary` describes adjacent concepts; `misconception` describes wrong beliefs *about this concept itself*.
- Not directly weighted in the schema; complements `concept_boundary` (weight 1.5).

**Example.**
```yaml
misconception: "A table diagram is not a domain model unless the relationships have domain meaning."
```

---

## `eval_last_run`

**Purpose.** Optional receipt for the most recent eval run. It turns `eval_state: passing` or `eval_state: monitored` from a self-attested label into a pointer to evidence.

**Rules.**
- Optional in v3.1.
- Object with required `at` and `status`.
- `at` is an ISO date-time for the run that supports the current eval claim.
- `status` is one of `pass`, `fail`, or `mixed`.
- `runner`, `model`, `receipt`, and `receipt_hash` are optional evidence details.
- `bidirectional` is optional Skill Audit Loop evidence from `lib/audit/run-bidirectional-eval.js`: frontier pair, measured generator, reconciliation mode, certification/parity flags, per-direction verdicts, execution profile, and optional merge-ledger reference.
- Do not set `eval_state: passing` solely because this object exists; the run still needs to satisfy the skill's eval contract.

**Example.**
```yaml
eval_last_run:
  at: "2026-05-12T09:30:00Z"
  status: pass
  runner: "node scripts/skill-audit.js --graded"
  receipt: "examples/audits/documentation/scorecard.md"
  bidirectional:
    frontier_pair: ["opus", "gpt-5.5"]
    measured_generator: "representative-generator"
    reconciliation: "conservative"
    parity_ok: true
```

**When to use.** When a skill's eval has actually run and there is a scorecard, grader history, CI run, or other receipt worth preserving.

**When NOT to use.** Brand-new skills with `eval_state: unverified`, or skills whose last run cannot be traced to an artifact.

---

## `eval`

**Purpose.** v3.1 preferred nested form for the Evaluation Status (`eval_artifacts` + `eval_state` + `routing_eval`). Aligns with the sibling-object pattern of `drift_check`, `grounding`, `lifecycle`, `portability`. Also resolves the head-first compound ambiguity of `routing_eval` (renamed to `routing_coverage`) and disambiguates `eval_state` from `routing_coverage` (renamed to `content_state`).

**Shape.**
```yaml
eval:
  artifacts: present       # mirrors eval_artifacts — none | planned | present
  content_state: passing   # mirrors eval_state    — unverified | passing | monitored
  routing_coverage: present  # mirrors routing_eval — absent | present
```

**Rules.**
- Optional in v3.1 (the top-level triple is still the source of truth during v3.x).
- When both the nested `eval.*` fields and the top-level fields are present, they must match.
- v4 makes `eval` canonical and removes the top-level triple.

**When to use.** Prefer for new skills authored against v3.1. Setting both shapes is allowed but redundant.

---

## `stability`

**Purpose.** Communicates how mature and reliable the skill is. Helps consumers decide whether to depend on the skill in production workflows.

**Allowed values.**

| Value | Meaning |
|---|---|
| `experimental` | Under active development; API or content may change without notice |
| `stable` | Content is settled and expected to change only via versioned updates |
| `frozen` | No further changes planned; archived as-is |
| `deprecated` | Superseded by another skill; consumers should migrate |

**Rules.**
- Strongly recommended even though not schema-required.
- Omit only for skills where stability is genuinely unknown at authoring time (migrate to a real value quickly).
- A deprecated skill should add a note in `## Coverage` pointing to the replacement.

**Pre-1.0 stance.** The library defaults all skills to `experimental` because the protocol and skill content are under active development. A near-uniform `experimental` distribution is intentional — it signals that the corpus as a whole is pre-1.0 and no stability guarantees are implied. Do not interpret a uniformly experimental corpus as an unmaintained field; it reflects a deliberate stance. Skills are promoted to `stable` only when all promotion criteria below are met. See `skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md § stability` for the normative spec.

**Promotion to `stable` — minimum criteria:**
1. `eval_state: passing` or `eval_state: monitored` — evals have been run and pass.
2. `eval_score >= 4.0` — grader score meets the quality bar.
3. `routing_eval: present` — the skill has been verified in a routing eval.
4. `drift_check.last_verified` within 90 days — skill has been recently verified against truth sources.
5. For project-anchored (non-empty `project[]`) skills: `grounding.truth_sources` must be non-empty.

**Example.**
```yaml
stability: stable
```

**When to use.** For any skill intended to be used by others. Omit only if the skill is a draft that will be revised immediately.

**When NOT to use.** Do not use `frozen` for skills that might still need maintenance — `stable` is the correct choice for mature, actively-owned skills. Do not promote to `stable` without meeting all five promotion criteria above.

---

## `project_adoption_stage`

**Purpose.** Categorizes a skill's status within the local project context. Helps teams understand which patterns are active standards versus legacy or experimental migrations. Added 2026-06-12.

**Allowed values.**

| Value | Meaning |
|---|---|
| `legacy` | Old patterns being phased out |
| `current-standard` | Active, recommended patterns |
| `experimental-migration` | New patterns under test |
| `deprecated` | Do not use |

**Rules.**
- Optional string enum.
- Projects into the manifest under `skill.project_adoption_stage`.

**Example.**
```yaml
project_adoption_stage: current-standard
```

**When to use.** For project-anchored skills where communicating the adoption lifecycle of the pattern is important for the team.

---

## `marketplace_tier`

**Purpose.** Publication priority for the public marketplace at `github.com/jacob-balslev/skills` / `skills.sh`. Drives which collection table or hero block a skill appears in. Omit entirely for skills that should not be published.

**Rules.**

- Optional. Omit on skills that are not publication candidates (the export pipeline filters those out).
- Closed enum: `S` | `A` | `B` | `C`.
- `S` — featured (top-of-README, individual hero copy).
- `A` — high-demand (named in collection tables).
- `B` — standard utility (included in collection tables).
- `C` — niche (collapsed "More" section).

**Example.**

```yaml
marketplace_tier: A
```

**When to use.** When you intend a skill to appear in the public marketplace and want explicit control over its placement. Sourced from `marketplace-publication-priority-*.md` and authored per skill.

**When NOT to use.** For repo-internal skills, sales-hub-private skills, or skills with PII bindings. Omit and they will not be published.

**Consumers.** `scripts/export-marketplace-skills.js` and `scripts/generate-marketplace-readmes.js` filter and group on this field.

---

## `superseded_by`

**Purpose.** Names the skill that replaces this one when `stability: deprecated`. Consumers and routers use this to follow a deprecation chain automatically instead of reading the body prose.

**Rules.**
- Optional for non-deprecated skills.
- **Required when `stability: deprecated`** — enforced by the `allOf` rule in `SKILL_METADATA_PROTOCOL_schema.json`. A deprecated skill without `superseded_by` fails schema validation.
- The value must be the `name` of an existing skill in the library. (Target-existence check follows the `relations.*` enforcement pattern and is expected to land in a future lint iteration.)
- Write a brief pointer in `## Coverage` as well so human readers see the migration path without re-parsing frontmatter.

**Example.**
```yaml
stability: deprecated
superseded_by: new-skill-name
```

**When to use.** On every skill entering the `deprecated` state, in the same commit that sets `stability: deprecated`.

**When NOT to use.** Non-deprecated skills. Do not declare a speculative replacement ahead of the deprecation event — it misleads routers.

**Migration from v2.** Added in v0.5.0 (additive — not a schema bump). Prior deprecated skills must retroactively populate `superseded_by` when they next get edited.

---

## `examples`

**Purpose.** Positive-class activation examples — a short list of realistic user prompts the skill SHOULD activate for. Complements `keywords` (semantic tokens) and `triggers` (exact labels) by giving routers full-prompt, few-shot retrieval targets.

**Rules.**
- Optional array of strings.
- 2–5 entries is the sweet spot. Fewer than 2 gives the router no discrimination signal; more than 5 dilutes the vector-search centroid.
- Write the examples in the user's voice — the prompt they would actually type — not in imperative abstract form.
- Each example should be a self-contained prompt, not a fragment (router embeddings cover the full string).
- The reference router gives an exact-match boost when the current query matches an authored example; semantic recall still belongs in `keywords`.
- Groups under `activation.examples` in the manifest projection.

**Example.**
```yaml
examples:
  - "how do I validate a webhook signature from Shopify?"
  - "the HMAC check is failing for a real payload — what's wrong?"
  - "add Stripe webhook signature verification to this route"
```

**When to use.** Any skill that relies on natural-language routing at query time — the router cannot see the skill body, only the metadata. Routable skills without `examples` under-trigger at library scale (see SkillRouter paper, `.artifacts/audit-brief.md` for references).

**When NOT to use.** Internal helper skills activated only by label or path. Overlay skills that inherit their parent's activation.

**Migration from v2.** Added in v0.5.0 (additive — not a schema bump).

---

## `anti_examples`

**Purpose.** Negative-class activation examples — user prompts that look topically related to this skill but should activate a DIFFERENT skill instead. Used as hard-negative training signal by embedding routers to sharpen boundary discrimination.

**Rules.**
- Optional array of strings.
- Pair with `relations.suppresses` — every `anti_examples` entry should correspond to a concrete other skill the router should route to. Name that skill in `relations.suppresses` with an object-form `{skill, reason}` explaining why this skill owns its territory over that target.
- Do not dump generic off-topic prompts here — this is not a blocklist. Use it only for near-misses the router keeps getting wrong.
- The reference router gives an exact-match penalty when the current query matches an authored anti-example, so the declaring skill cannot win that known negative case.
- Groups under `activation.anti_examples` in the manifest projection.

**Example.**
```yaml
anti_examples:
  - "refactor this function to be more testable"     # → refactor skill, not this one
  - "why is my test failing after the refactor?"     # → debugging skill
relations:
  suppresses:
    - skill: refactor
      reason: "refactor covers behavior-preserving code modification; this skill is test-strategy planning"
    - skill: debugging
      reason: "chasing a failure is debugging; planning is strategy"
```

**When to use.** When the skill has documented confusables (near-miss activations) that the routing layer has gotten wrong. Write the anti-example list after you have seen the router misfire, not before — authoring anti-examples without real router data is speculative.

**When NOT to use.** Skills with no close-neighbor confusables. Skills that are activated only by exact label or path (routing is deterministic, not embedding-based).

**Migration from v2.** Added in v0.5.0 (additive — not a schema bump).

---

## `license`

**Purpose.** Declares the distribution license for the skill content. Required for any skill intended for public or cross-team sharing.

**Rules.**
- Free-form string — use a standard SPDX identifier where possible (`MIT`, `Apache-2.0`, `CC-BY-4.0`).
- Strongly recommended for all skills, even if the repo already has a top-level LICENSE file.
- Omit only for internal skills that are explicitly not intended for redistribution.

**Example.**
```yaml
license: MIT
```

**When to use.** Whenever a skill might be shared outside the immediate team or repo.

**When NOT to use.** Internal-only skills where no redistribution is expected — but prefer to include it even then, for clarity.

---

## `compatibility`

**Purpose.** Declares environment requirements for skills that have specific runtime needs — target agent runtimes, Node.js version, and free-text notes for anything else.

**Shape in the logical contract.** Protocol-native frontmatter uses a structured object so consumers can parse `agent_runtimes` and `node_version` without heuristics. The Agent-Skills-compatible physical encoding keeps `compatibility` as a top-level base-field string; `normalizeFrontmatter()` preserves that scalar while lifting the rest of `metadata:` back into protocol shape.

**Rules.**
- Object with up to three optional sub-fields.
- Omit the field entirely when the skill is fully generic with no environment requirements.
- `agent_runtimes`: array of strings naming target agent runtimes with optional version constraints (e.g., `claude-code>=2.0`, `cursor>=0.40`). Use short stable identifiers.
- `node_version`: Node.js version constraint as a string (e.g., `>=18`).
- `notes`: free-text supplement, capped at 500 characters.

**Sub-fields.**

| Sub-field | Type | Meaning |
|---|---|---|
| `agent_runtimes` | string[] | Target agent runtimes with optional version constraints |
| `node_version` | string | Node.js version constraint |
| `notes` | string (≤500 chars) | Free-text supplement |

**Example.**
```yaml
compatibility:
  agent_runtimes:
    - claude-code>=2.0
    - cursor>=0.40
  node_version: ">=18"
  notes: Requires PostgreSQL 15+ when using the `neon` adapter.
```

**When to use.** When the skill's instructions require a specific runtime, CLI tool, or package version that is not universally available.

**When NOT to use.** Generic skills with no runtime dependencies — omit the field rather than setting it to an empty object.

**Migration from v2.** In protocol-native source, the v2 scalar `compatibility: "<text>"` becomes `compatibility:\n  notes: "<text>"`. The historical codemod that performed this conversion was retired by ADR 0014 and is recoverable from git history. In Agent-Skills-compatible source, the scalar top-level base field is valid physical encoding; do not warn on it solely because the logical protocol-native shape is object-based.

---

## `allowed-tools`

**Purpose.** Names the pre-approved tools a skill is permitted to invoke when loaded into an agent runtime that honors the declaration.

**Rules.**
- Space-separated string — not an array. The string form is required for Agent-Skills-compatible export.
- Use the tool names as defined by the target agent runtime (e.g., `Read`, `Grep`, `Bash` for Claude Code).
- This is experimental per the SKILL.md spec — support varies across agent implementations.
- Skill Graph validates the shape but does not enforce the allowlist at runtime.

**Example.**
```yaml
allowed-tools: Read Grep Bash
```

**When to use.** When deploying to a runtime that enforces tool allowlists and you want to declare the minimum required set.

**When NOT to use.** Skills where all tools are permitted (omit the field) or where the deployment runtime does not read this field.

---

## `triggers`

**Purpose.** Explicit phrase or label triggers that activate this skill. Complements `keywords` for skills that respond to exact phrases rather than semantic matching.

**Rules.**
- Array of strings.
- Use for exact activation phrases that the routing layer should match literally (e.g., skill IDs, CLI flags, label strings).
- Prefer `keywords` for semantic matching; use `triggers` for exact-match activation.

**Example.**
```yaml
triggers:
  - shopify-skill
  - use-shopify
```

**When to use.** When the skill has known exact trigger phrases (CLI commands, label names, template strings) that should reliably activate it.

**When NOT to use.** Generic concepts best expressed as `keywords`. If the phrase is conceptual rather than exact, put it in `keywords`.

---

## `keywords`

**Purpose.** Semantic keywords for discovery, search indexing, and activation routing. The primary signal for routers that use vector search or fuzzy matching.

**Rules.**
- Array of strings.
- Include topic synonyms, related concepts, and the primary use-case phrases a user would naturally type.
- Do not duplicate `name` in keywords unless it is also a common search phrase.
- Ordered from most specific to most general.

**Example.**
```yaml
keywords:
  - shopify
  - shopify api
  - shopify webhook
  - e-commerce integration
```

**When to use.** Recommended for routable skills. Use up to 10 phrases a user would naturally type when asking for this skill's domain.

**When NOT to use.** Keywords are not tags for browse taxonomy — that is `subject` and `taxonomy_domain`'s job. Do not add every possible synonym; keep to the most likely search terms.

**Verification.** Routers and routing-eval cases expose missing keyword coverage. The canonical linter no longer carries the removed routing-quality check module.

---

## `paths`

**Purpose.** Filesystem glob patterns that identify the code surfaces this skill governs. Enables file-surface activation and diff-aware routing.

**Rules.**
- Array of glob strings.
- Use `**` for recursive matching within a directory.
- Paths are relative to the repo root where the skill is deployed.
- A skill activated by file path will load automatically when an agent edits a matching file.

**Example.**
```yaml
paths:
  - src/integrations/shopify/**
  - src/webhooks/shopify.ts
```

**When to use.** For project-anchored skills that govern specific files or directories. Omit for ambient, project-agnostic skills.

**When NOT to use.** Generic skills with no specific file surfaces. Do not add paths as aspirational documentation — only add paths the skill actively covers.

---

## `dependencies`

**Purpose.** Package/tool/framework names a codebase must use for this skill to be relevant. The codebase-fingerprint activation signal: a detector matches a repo's manifest dependencies (`package.json`, `requirements.txt`, `Cargo.toml`, …) against this list to select the skills that apply to that codebase. Added 2026-06-10 per owner directive.

**Rules.**
- Array of strings; each entry is the package's canonical registry name (npm name, PyPI name, etc.) — e.g. `next`, `tailwindcss`, `stripe`, `playwright`, `@anthropic-ai/sdk`.
- Unique entries; schema pattern `^[a-z0-9@][a-zA-Z0-9@/._-]*$`.
- Name the packages whose *presence makes the skill applicable*, not every package the skill happens to mention.
- Optional; absent = the skill's relevance is not keyed to any package.
- Projects into the manifest under `activation.dependencies`.

**Boundary — three dependency-shaped fields, three different questions.**

| Field | Names | Question it answers |
|---|---|---|
| `dependencies` | external packages | "Does the TARGET CODEBASE use the stack this skill teaches?" |
| `relations.depends_on` | sibling skills | "Which other SKILLs must be in scope for this skill to compose?" |
| `compatibility` | agent runtimes + Node version | "What runtime does the SKILL itself need to execute?" |

**Example.**
```yaml
dependencies:
  - next
  - tailwindcss
```

**When to use.** Skills teaching a framework, library, platform SDK, or tool whose presence in the target repo is the relevance signal.

**When NOT to use.** Concept/method skills (taxonomy design, debugging method) whose relevance is stack-independent.

---

## `codebase_layer`

**Purpose.** Classifies which layer of the application architecture the skill applies to. Helps agents and developers find skills relevant to a specific part of the stack. Added 2026-06-12.

**Rules.**
- Array of strings. Optional.
- Free-text, but common values include `api`, `ui`, `database`, `infrastructure`, `tests`.
- Projects into the manifest under `activation.codebase_layer`.

**Example.**
```yaml
codebase_layer:
  - api
  - database
```

---

## `applicable_tasks`

**Purpose.** The concrete types of tasks the skill is meant to assist with. Added 2026-06-12.

**Rules.**
- Array of strings. Optional.
- Free-text, but common values include `debugging`, `refactoring`, `code-generation`, `code-review`.
- Projects into the manifest under `activation.applicable_tasks`.

**Example.**
```yaml
applicable_tasks:
  - code-generation
  - debugging
```

---

## `environment`

**Purpose.** Target execution environment constraints. Helps distinguish between frontend, backend, or specific OS patterns. Added 2026-06-12.

**Rules.**
- Array of strings. Optional.
- Free-text, but common values include `browser`, `node`, `edge`, `ios`, `android`.
- Projects into the manifest under `activation.environment`.

**Example.**
```yaml
environment:
  - browser
  - edge
```

---

## `internal_tools`

**Purpose.** Private, company-specific or team-specific tools required for the skill to be relevant. Added 2026-06-12.

**Rules.**
- Array of strings. Optional.
- Distinct from `dependencies` which target public registry packages.
- Projects into the manifest under `activation.internal_tools`.

**Example.**
```yaml
internal_tools:
  - acme-deploy-cli
```

---

<!-- workspace_tags REMOVED (see ADR-0017 amendment, 2026-05-27).
     Use `project` (array of {handle, role}) for project belonging-entity identity.
     The former workspace_tags field + workspace.projects semantic-tag mapping were
     removed because the field had 0% corpus adoption and the semantic-tag
     expansion never surfaced a routing-quality benefit. See § project above. -->

---

## Claude Code runtime fields: `context` and `disallowed-tools`

These are **Claude Code native frontmatter fields**, not Skill Graph protocol fields. They are not defined in the Skill Metadata Protocol schema and carry no Skill Graph routing or audit semantics. However, they are valid to author in a `SKILL.md` for skills that run inside Claude Code — particularly **autonomous audit-runner skills** that must suppress interactive tool calls when operating in a non-interactive context.

### `context: fork`

**Purpose.** Instructs Claude Code to run this skill in an isolated subagent context (a forked process) rather than inline in the current session. The forked context cannot call back into the parent session and cannot use interactive tools such as `AskUserQuestion`.

**When to use.** Author `context: fork` on any skill that is designed to be invoked as an autonomous runner — for example, a skill that orchestrates the Skill Audit Loop in batch mode, where user interaction is explicitly undesirable. It prevents the runner from blocking on `AskUserQuestion` prompts that would never be answered in a headless or scripted context.

**Rules.**
- This is a Claude Code runtime control, not a Skill Graph routing or classification field. Routers, manifest generators, and lint scripts ignore it.
- Only author on project-anchored skills where the project's runner infrastructure explicitly invokes the skill in an autonomous (non-interactive) mode.
- Do not author on project-agnostic skills or skills invoked interactively.

**Example.**
```yaml
name: skill-audit-runner
description: Autonomous audit-loop runner for the Skill Audit Loop batch pipeline.
subject: agent-ops
public: false
scope: Orchestrates per-skill audit passes in autonomous batch mode without user interaction.
context: fork
disallowed-tools: AskUserQuestion
```

### `disallowed-tools`

**Purpose.** Space-separated list of tool names that Claude Code must not invoke when running this skill. The value is honoured by Claude Code's tool-gating layer.

**When to use.** Pair with `context: fork` on autonomous runner skills to explicitly block `AskUserQuestion`. The Skill Audit Loop already passes `--disallowed-tools` at the CLI level when running eval sub-calls (see `lib/audit/evaluate-skill.js` — the `runPromptWithCli` helper adds `--disallowed-tools Read,Edit,Write,Bash,…` when `allowTools` is false), so `disallowed-tools` in a skill's frontmatter is the declarative, skill-level equivalent of that runtime flag.

**Rules.**
- Space-separated tool names (matches the Claude Code CLI `--disallowed-tools` flag format, not comma-separated).
- `AskUserQuestion` is the canonical value for autonomous-runner skills.
- You may list multiple tools: `disallowed-tools: AskUserQuestion Edit Write`.
- This field is distinct from `allowed-tools` (which is a Skill Graph protocol field that also surfaces as a top-level SKILL.md field). `disallowed-tools` is a denylist; `allowed-tools` is an allowlist. Do not confuse them.

**Real usage in this codebase.** `lib/audit/evaluate-skill.js::runPromptWithCli` (line 652) applies `--disallowed-tools Read,Edit,Write,Bash,Glob,Grep,Agent,WebSearch,WebFetch,NotebookEdit` for the eval sub-calls. `lib/audit/eval-execution-profile.js` (line 108) carries the same list. These are the runtime references; `disallowed-tools` in a skill's frontmatter is the static declaration of the same intent at authoring time.

**When NOT to use.** Do not author on interactively-used skills. Any skill where the user may need to answer a clarifying question should not suppress `AskUserQuestion`.

---

## `relations`

**Purpose.** Graph semantics between skills. Each key in the `relations` object describes a different type of relationship. Together they form the edges of the skill graph.

**Rules.**
- Object with seven optional edge keys: `related`, `broader`, `narrower`, `suppresses`, `disjoint_with`, `verify_with`, `depends_on` — plus one optional non-edge composition key, `io_contract` (see below).
- Every edge target must be the `name` of an existing skill. Use graph/manifest review and routing audits to catch dangling targets across all seven edge keys (`io_contract` is a non-edge composition key, not a graph target); `scripts/skill-lint.js` validates schema shape, not graph existence.
- Relations are directional from the skill that declares them (A `depends_on` B means A depends on B, not the reverse). `related` is symmetric by SKOS convention; `suppresses` is asymmetric (A `suppresses: B` does not imply B `suppresses: A`).

**Allowed keys.**

| Key | Meaning | Item shape | W3C mapping |
|---|---|---|---|
| `related` | Related skills for discoverability and recommended co-reading. Symmetric; no dependency implied. | string | `skos:related` |
| `broader` | Cross-skill generalisation — target is more general than this skill. Triggers Stage 4b parent recall in `scripts/skill-graph-route.js`. | string | `skos:broader` |
| `narrower` | Cross-skill specialisation — target is more specific than this skill. Inverse of `broader`; not used to drive co-load (a parent match should not pull in arbitrary children). | string | `skos:narrower` |
| `suppresses` | Routing-layer score-aware exclusion guard — skills this skill suppresses from co-routing when this skill wins or ties. Not a defer-to-target pointer. | string OR `{skill, reason}` | `sg:disjointOwnership` |
| `disjoint_with` | Optional formal OWL class-disjointness assertion. Use only when authors genuinely want to claim that no entity can simultaneously be an instance of both classes. Rare; most authors only need `suppresses`. | string OR `{skill, reason}` | `owl:disjointWith` |
| `verify_with` | Skills that should be co-loaded for verification or that provide cross-checks | string | `prov:wasInformedBy` |
| `depends_on` | Explicit dependency — this skill requires the target conceptually or operationally | string OR `{skill, min_version}` | `dcterms:requires` |
| `io_contract` *(optional, non-edge)* | Machine-checkable composition contract — abstract artifact TYPES this skill consumes/produces. The builder derives `depends_on` edges from output→input compatibility (no LLM). | `{inputs: [token], outputs: [token]}` | — |

**`io_contract` — deterministic composition (SKI-52).** `io_contract` is not an edge to another skill; it is a typed I/O declaration the tooling uses to *derive* `depends_on` edges and validate composition without an LLM, the way Graph of Skills (arXiv 2604.05333) and SkillNet (arXiv 2603.04448) build dependency graphs.

- `inputs[]` / `outputs[]` are **kebab-case abstract artifact-type tokens** (e.g. `skill-md`, `audit-findings`, `manifest`, `routing-config`), NOT file paths. A token names a *kind* of artifact, so two skills compose iff one's output token matches the other's input token.
- The builder (`scripts/skill/skill-graph-builder.js`) emits a derived edge consumer→producer when `producer.outputs ∩ consumer.inputs ≠ ∅`, surfaced under `io_composition` in `scripts/discovery/skill-graph.json`.
- `node scripts/skill/check-io-composition.js` (`npm run check:io-composition`) flags two failures: **broken chains** (an authored `depends_on` target whose outputs satisfy none of the dependent's inputs) and **cycles** (Tarjan SCC on the depends_on subgraph). Exit 1 on either.
- The field is fully optional and forces no corpus migration: a skill without `io_contract` contributes no derived edges and is never flagged.

**Suppresses vs disjoint_with.** The two predicates operate at different semantic layers and the schema keeps them distinct.

- `suppresses` is a **routing-layer exclusion guard**. When skill A wins a query, skills listed in A's `suppresses[]` are excluded from co-routing results (if A outscores them). The mechanic is "exclude B when A wins" — write reason text that reflects ownership ("I own this exclusively over B"), not deference ("use B instead"). Asymmetric; `reason` is strongly recommended. See `skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md § Relations § suppresses`.
- `disjoint_with` is a **formal class-theory** claim. A and B name disjoint conceptual classes; no entity can simultaneously be an instance of both. Maps to OWL `owl:disjointWith` for RDF consumers that reason about class membership. Rare in practice — most skill libraries never need this.

If you are unsure which to use, you want `suppresses`. Use `disjoint_with` only when you have an explicit reason to make a formal ontological claim that survives the JSON-LD projection into OWL.

**Glossary.** See `docs/glossary.md § Relation predicates` for the formal definitions of each predicate. The JSON-LD `@context` at `schemas/skill.context.jsonld` projects these predicates to their W3C equivalents for RDF consumers.

**Item shapes.** `suppresses`, `disjoint_with`, and `depends_on` accept both the bare-string form and the enriched object form. The bare form remains valid — upgrade item-by-item when a reason or version constraint is real.

- `suppresses` and `disjoint_with` objects carry a `reason` string. The reason is what makes the relation self-documenting: `"fulfillment owns order state transitions; this skill only reads them"` beats `"fulfillment"` alone.
- `depends_on` objects carry a `min_version` semver constraint. Useful when a skill depends on a specific version of another skill's contract.
- `related`, `broader`, `narrower`, `verify_with` are bare-string only — they carry no additional metadata.

**When to use `broader`.** `broader` is cross-skill generalisation — use it when the target is a more general concept but this skill has its own standalone identity. Example: `react-best-practices` has `broader: [frontend]` because it specialises frontend knowledge, but `react-best-practices` remains a coherent skill even if the `frontend` skill were deleted.

**Example.**
```yaml
relations:
  related:
    - webhook-integration
  broader:
    - integration
  suppresses:
    - skill: fulfillment
      reason: "fulfillment owns order state transitions; this skill only reads them"
    - skill: shipping
      reason: "shipping is covered by the shipping-integration skill"
  verify_with:
    - test-coverage
  depends_on:
    - skill: api-key-management
      min_version: "1.2.0"
    - testing-strategy
  io_contract:
    inputs:
      - api-credentials
    outputs:
      - webhook-subscription
```
**Example (rare — formal OWL class-disjointness assertion).**
```yaml
relations:
  suppresses:                                 # routing-layer (everyday)
    - skill: error-tracking
      reason: "error-tracking owns observability surface; this skill is for prevention"
  disjoint_with:                              # formal class-theory (rare)
    - skill: physical-security
      reason: "Physical-security and information-security are disjoint conceptual classes by design"
```

**When to use.** Populate `related` and `suppresses` for any skill that has clearly related or clearly excluded neighbours. Populate `broader` when the target is a more general standalone skill (router uses this for parent recall). Populate `depends_on` when the skill cannot function without another skill's concepts. Populate `verify_with` when a co-loaded skill improves verification quality. Populate `disjoint_with` only for explicit OWL-class-disjointness needs.

**When to use object form.** Use `{skill, reason}` whenever a `suppresses` or `disjoint_with` entry's rationale isn't obvious from the skill name alone. Use `{skill, min_version}` when a dependency's contract has versioned — without the constraint, a future update to the target skill can silently break this skill's claims.

**When NOT to use.** Do not use `related` as a dumping ground for loosely related skills — keep it to the 2–4 most meaningful connections. Do not fabricate `min_version` values — if you don't know the constraint, omit it. Do not use `disjoint_with` as a more emphatic `suppresses`; the OWL semantics are real and reaching for them changes how RDF consumers reason about your skill graph.

---

## `grounding`

**Purpose.** Declares what the skill governs in the real world or codebase, and provides evidence anchors for repo-grounded verification. Required for project-anchored (non-empty `project[]`) skills.

**Rules.**
- Object with five required sub-fields: `subject_matter`, `grounding_mode`, `truth_sources`, `failure_modes`, `evidence_priority`.
- Omit entirely for ambient, project-agnostic skills unless you want to ground the skill in external specs; then keep `grounding_mode: universal`.
- `grounding_mode` must be one of `repo_specific`, `universal`, or `hybrid`.
- `evidence_priority` must be one of `repo_code_first`, `general_knowledge_first`, or `equal`.

**Sub-fields.**

| Sub-field | Type | Meaning |
|---|---|---|
| `subject_matter` | string | The real-world or codebase entity this skill governs (e.g., "Shopify integration behavior"). Renamed from v8 `domain_object`. |
| `grounding_mode` | enum | How the skill is grounded: `repo_specific` (one codebase), `universal` (language/framework), `hybrid` (both) |
| `truth_sources` | string[] or object[] | Files, docs, URLs, or anchored source slices that are the ground truth for the skill's claims |
| `failure_modes` | string[] | Known ways the skill can produce incorrect guidance if applied incorrectly |
| `evidence_priority` | enum | Whether to trust repo code or general knowledge first when they conflict |

**Example.**
```yaml
grounding:
  subject_matter: Shopify integration behavior
  grounding_mode: repo_specific
  truth_sources:
    - path: src/integrations/shopify/client.ts
      line_range: { start: 42, end: 118 }
      note: "Admin API client behavior"
    - path: src/integrations/shopify/webhooks.ts
      anchor: webhook-signature-verification
  failure_modes:
    - webhook_signature_bypass
    - stale_cursor_pagination
  evidence_priority: repo_code_first
```

**Truth source forms.**
- String entries mean "hash/review the whole resource."
- Object entries are preferred for repo-backed skills: `path` is required; `line_range`, `anchor`, and `note` are optional.
- `line_range` hashes only the inclusive source slice after normalizing line endings to LF.
- `anchor` is checked by lint as either a Markdown heading slug or literal text in the file.
- `drift_check.truth_source_hashes` uses the normalized key: `path` for whole-file sources, `path#Lstart-Lend` for line ranges, and `path#anchor` for anchor-only sources.

**When to use.** Required for project-anchored skills. Strongly recommended for any skill that makes concrete implementation claims, even if the skill is project-agnostic.

**When NOT to use.** Project-agnostic skills with no specific codebase claims. Omit the entire block rather than populating it with placeholder values.

---

## `portability`

**Purpose.** Declares which agent runtimes the skill can be exported to, and an operational rating of how ready the skill is for export.

**Rules.**
- Object with two required sub-fields: `readiness` and `targets`.
- `readiness` must be `declared`, `scripted`, or `verified`. This is an operational axis, not an ordinal rating — each value says something concrete about what is true of the skill today.
- `targets` is an array constrained to `["skill-md"]`.
- `skill-md` in `targets` means the skill can be transformed to a valid SKILL.md file via `scripts/export-skill.js`.
- Other runtimes — `cursor`, `windsurf`, `copilot`, `agents-md` — were removed from the enum in 0.3.0. They previously described compatibility goals, but without a working transform they violated the `additionalProperties: false` strictness rule. Re-add via a new RFC and the same PR that ships the transform.

**Sub-fields.**

| Sub-field | Type | Meaning |
|---|---|---|
| `readiness` | `declared` \| `scripted` \| `verified` | Operational export readiness — see values table below |
| `targets` | string[] | Destination runtimes the skill is declared portable to |

**`readiness` values.**

| Value | Meaning | What must be true |
|---|---|---|
| `declared` | Portability is asserted in metadata only | The author claims the skill is portable to the listed targets; no export tooling has been run |
| `scripted` | Export tooling exists for at least one target | A script (e.g., `scripts/export-skill.js`) can transform this skill to a listed target |
| `verified` | Export tooling exists AND the exported output has been verified | A receipt artifact (test run, import check) proves the exported skill works in the target runtime |

**Example.**
```yaml
portability:
  readiness: scripted
  targets:
    - skill-md
```

**When to use.** When the skill is intended for distribution via the SKILL.md transform, and you want to declare its portability explicitly.

**When NOT to use.** Internal-only skills that will never be exported. Omit the field rather than setting `readiness: declared` with an empty `targets` array.

**Migration from v1.** The v1 sub-fields `portability.level` (values `high`/`medium`/`low`) and `portability.exports` were renamed in schema_version 2 (SH-5784). Map `high` → `scripted` when an export script exists for a listed target, else `declared`. Map `medium` → `scripted` similarly. Map `low` → `declared`. Rename `portability.exports` → `portability.targets`; values are unchanged.

---

## `lifecycle`

**Purpose.** Per-skill maintenance policy consumed by the drift sentinel (`scripts/skill-graph-drift.js`). Declares how often the skill should be re-verified and after how many days it is considered stale. New in v3.

**Why it exists.** Integration skills rot faster than pure concept skills. A Shopify API skill might need quarterly review; a testing-strategy skill might be stable for years. A single global staleness threshold misrepresents both. `lifecycle.stale_after_days` lets each skill declare its own decay rate.

**Rules.**
- Optional object with two optional sub-fields.
- `stale_after_days`: positive integer. The drift sentinel flags the skill as STALE when `today - drift_check.last_verified > stale_after_days`.
- `review_cadence`: enum hint for scheduled drift checks. The value does not affect schema validation; it signals to tooling when the skill wants to be re-verified.

**Sub-fields.**

| Sub-field | Type | Meaning |
|---|---|---|
| `stale_after_days` | integer (≥1) | Days after `drift_check.last_verified` at which the skill is flagged stale |
| `review_cadence` | enum | `per-commit` \| `weekly` \| `quarterly` \| `on-truth-source-change` |

**Example.**
```yaml
lifecycle:
  stale_after_days: 90
  review_cadence: quarterly
```

**When to use.** Any skill that makes concrete claims about external systems, APIs, or code that changes independently of the skill content.

**When NOT to use.** Purely conceptual skills where staleness is not a meaningful concept. In that case, omit the whole block rather than setting `stale_after_days` to an absurdly high value.

---

## `runtime_telemetry`

**Purpose.** Pointer to real-world success/failure feedback and audit/eval agent-run receipts for this skill. Consumers may use feedback telemetry to corroborate or override the authored `eval_state`; operators use agent-run receipts to compare duration, token usage, delivery status, and SKILL.md line delta across mandatory and advisory agents. New in v3, extended in v8 for loop-run observability.

**Why it exists.** `eval_state` is self-reported — an author claims a skill's evals are passing. `runtime_telemetry` is external-reported or loop-reported — a feedback pipeline records actual success/failure rates from agents that ran the skill, and the Skill Audit Loop records what each model spent and changed while evaluating or iterating the skill. Together they close the loop from "did the author claim this works?" to "does this actually work, and which agents are producing useful work at acceptable cost?"

**Rules.**
- Optional object.
- `feedback_source` is required when the block is present for backward compatibility. It is a path or URL to a JSONL of run receipts or field-feedback records. Each receipt is expected to carry at minimum `{ timestamp, skill }` plus `outcome` or `status`.
- `run_receipts_source` names the audit/eval agent-run receipt feed. The canonical adjacent file is `agent-telemetry.jsonl` beside the skill's `SKILL.md`.
- Agent-run receipt lines carry `schema_version`, `timestamp`, `skill`, `operation`, `phase`, `agent`, `model`, `backend`, `tier`, `status`, `ok`, `started_at`, `ended_at`, `duration_ms`, `tokens`, `line_delta`, and artifact/receipt paths. Token counts are recorded only when the backend exposes them; unavailable counts stay `null`, never estimated.
- `last_updated` records when the block's `metrics` were last refreshed.
- `last_run` is a small summary of the latest agent-run receipt. The JSONL remains the durable evidence.
- `metrics` is optional summary statistics derived from the feedback or run-receipt source. Consumers may read this pre-computed summary instead of re-parsing the JSONL.

**Audit-loop writer responsibilities.**
- Evaluation generators and graders append one receipt per model call so a behavior verdict can be read beside the time and token cost of earning it.
- Iteration agents append one receipt per propose, suggestion, review, revise, curate, and verify action so the merge ledger can be compared against each agent's actual delivery.
- Phases that edit or propose `SKILL.md` content record `line_delta`; phases that only judge or suggest record `line_delta: null`. Do not invent a line delta for feedback-only work.
- A failed or malformed agent action still writes a receipt with `ok: false`, `status: "failed"`, and the failure reason. Missing receipts are treated as missing evidence, not success.
- Do not estimate tokens from text length. The only honest states are concrete backend usage values or `null` values with `source: "unavailable"`.

**Sub-fields.**

| Sub-field | Type | Meaning |
|---|---|---|
| `feedback_source` | string | Backward-compatible path or URL to a JSONL of feedback or run receipts (required when block is present) |
| `run_receipts_source` | string | Path or URL to audit/eval agent-run receipts; normally sibling `agent-telemetry.jsonl` |
| `last_updated` | string (date) | ISO date of the most recent metrics refresh |
| `last_run` | object | Latest agent-run receipt summary: operation, phase, agent, status, duration, tokens, line delta, receipt |
| `metrics.sample_size` | integer (≥0) | Number of recorded runs used for the summary |
| `metrics.success_rate` | number (0–1) | Fraction of runs with a positive outcome |
| `metrics.agent_run_count` | integer (≥0) | Count of agent-run receipts in `run_receipts_source` |
| `metrics.total_duration_ms` | number (≥0) | Sum of recorded agent-run durations |
| `metrics.total_tokens` | number or null | Sum of concrete total-token counts where exposed by a backend; null when none were exposed |
| `metrics.tokens_observed_count` | integer (≥0) | Count of receipts with concrete token totals |

**Example.**
```yaml
runtime_telemetry:
  feedback_source: "agent-telemetry.jsonl"
  run_receipts_source: "agent-telemetry.jsonl"
  last_updated: "2026-04-15"
  last_run:
    at: "2026-04-15T12:00:00.000Z"
    operation: "panel"
    phase: "propose"
    agent: "gemini"
    status: "completed"
    duration_ms: 84231
    tokens:
      input_tokens: null
      output_tokens: null
      total_tokens: null
      source: "unavailable"
    line_delta:
      before_lines: 120
      after_lines: 148
      added_lines: 35
      removed_lines: 7
      net_lines: 28
      algorithm: "lcs"
    receipt: "agent-telemetry.jsonl"
  metrics:
    agent_run_count: 9
    total_duration_ms: 912403
    total_tokens: null
    tokens_observed_count: 0
```

**When to use.** When a telemetry pipeline actually exists for this skill, or when `/audit:*` / evaluation tooling has appended real agent-run receipts beside the skill.

**When NOT to use.** Speculative feedback-source paths that do not yet exist. An empty `feedback_source` or `run_receipts_source` is worse than an absent block — it promises data that isn't there.

---

## `model_run_coverage`

**Purpose.** Records which model aliases have participated in the Skill Audit Loop for this skill, which operation they ran, which phase they reached, and where the receipt or failure evidence lives. This field lives in `audit-state.json`, not in `SKILL.md` frontmatter.

**Why it exists.** Protocol conformance and model coverage are different facts. A skill can have earned the latest Skill Metadata Protocol content label while still lacking advisory-model passes; a free advisory model can fail on a phase without changing the skill's quality verdict. `model_run_coverage` lets corpus tooling answer questions such as "which UX skills have seen `gemini-flash`?" or "which business-strategy skills still need the advisory tier?" without scraping panel logs.

**Rules.**
- Optional object written by the audit loop. Do not hand-author it to imply a model ran.
- Keys under `models` are stable model aliases from `lib/audit-shared/model-provider.js`, such as `opus`, `codex-current`, `gemini`, `deepseek-flash`, or `mimo`.
- The field records participation and failure evidence only. It does not replace `structural_verdict`, `truth_verdict`, `comprehension_verdict`, `application_verdict`, or `eval_last_run`.
- Advisory-tier records can be `completed`, `degraded`, `failed`, or `skipped`; they never certify `application_verdict: APPLICABLE`.
- `registry_version` records the model-registry epoch so aliases can be compared honestly across model-roster updates.

**Sub-fields.**

| Sub-field | Type | Meaning |
|---|---|---|
| `schema_version` | integer | Shape version for the coverage sub-record. Currently `1`. |
| `updated_at` | string (date-time) | Timestamp when the matrix was last updated. |
| `registry_version` | string | Model registry epoch used for this coverage update. |
| `models.<alias>.provider` | string | Provider family resolved from the model registry. |
| `models.<alias>.backend` | string | CLI/backend used for that alias. |
| `models.<alias>.tier` | enum | `mandatory`, `advisory`, or `orchestrator`. |
| `models.<alias>.operations.<operation>.status` | enum | `completed`, `degraded`, `failed`, `skipped`, or `blocked`. |
| `models.<alias>.operations.<operation>.phase_status` | object | Per-phase status for budget, claim, propose, cross-review, revise, curate, verify, evaluate, apply, and record. |
| `models.<alias>.operations.<operation>.receipt` | string | Path or URL to the merge ledger, eval receipt, run root, or other evidence. |

**Example.**
```json
{
  "model_run_coverage": {
    "schema_version": 1,
    "updated_at": "2026-06-11T12:00:00.000Z",
    "registry_version": "2026-06-11",
    "models": {
      "opus": {
        "model": "opus",
        "provider": "anthropic",
        "backend": "claude",
        "tier": "mandatory",
        "operations": {
          "panel": {
            "at": "2026-06-11T12:00:00.000Z",
            "operation": "panel",
            "eval_mode": "application",
            "tier": "mandatory",
            "status": "completed",
            "registry_version": "2026-06-11",
            "phase_status": {
              "propose": "completed",
              "cross_review": "completed",
              "revise": "completed",
              "curate": "completed",
              "verify": "completed",
              "evaluate": "completed",
              "apply": "completed",
              "record": "completed"
            },
            "certifying": true,
            "receipt": "skill-audit-loop/progress/skill-audits/demo/merge-ledger.json"
          }
        }
      }
    }
  }
}
```

**When to use.** Read it when choosing the next model pass to run, debugging why a specific model failed on a skill, or reporting corpus coverage by model alias and subject area.

**When NOT to use.** Do not use it as the quality signal. Quality remains the four verdict fields plus their receipts; model participation is evidence about what has been tried, not proof that the skill is good.
