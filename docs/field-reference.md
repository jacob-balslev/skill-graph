# Skill Graph Field Reference

> One section per authored field. Use this when writing or reviewing a `SKILL.md` file.
> For the "which value do I pick?" decisions, see [`docs/field-decision-guide.md`](field-decision-guide.md).
> For field groups, conditional requiredness, and schema strictness rules, see [`docs/skill-metadata-protocol.md`](skill-metadata-protocol.md).

Fields are listed in authored order — the same order they appear in [`examples/skill-metadata-template.md`](../examples/skill-metadata-template.md).

## Three docs, three genres

The field reference is split across three coordinated documents. Use whichever fits your task:

| Doc | Genre | When to read |
|---|---|---|
| [`field-reference.md`](field-reference.md) (this doc) | **Hand-curated prose reference.** Field-by-field, with worked examples, lint notes, and cross-cutting guidance. | When authoring or reviewing a SKILL.md and you want examples and "when to use" rules alongside the schema-canonical definition. |
| [`field-reference.generated.md`](field-reference.generated.md) | **Auto-generated index.** Built from `schemas/skill.schema.json` description strings by `scripts/build-field-reference.js`. Drift-free against the schema. | When you want the machine-guaranteed list of every field, every type, every pattern, every enum value. The fastest way to verify what the schema actually accepts today. |
| [`field-rationale.md`](field-rationale.md) | **Hand-authored "why this field" rationale.** Covers the ~10 fields whose meaning is non-obvious from the schema description (`scope`, `eval_artifacts`, `eval_state`, `routing_eval`, `relations.depends_on`, `relations.verify_with`, `relations.broader`, `grounding.evidence_priority`, `lifecycle.review_cadence`, `portability.readiness`). | When you understand *what* a field stores but want to know *why the field exists at all* and *what the common confusion looks like*. |

The schema is the single source of truth for shape; this doc is the source of truth for prose; `field-rationale.md` is the source of truth for design intent. Lint check C7 (in `scripts/check-protocol-consistency.js`) verifies the generated index stays in sync with the schema description strings — running `node scripts/build-field-reference.js --check` against the live schema must succeed before commit.

---

## `schema_version`

**Purpose.** Versions the contract so migration tooling can handle future schema changes deterministically.

**Rules.**
- Must be the integer `7` or the string `"7"` for all v7 skills.
- Start every new skill at the current schema version. Do not downgrade.
- The v6 → v7 bump split the single `audit_verdict` into `structural_verdict`, `truth_verdict`, `comprehension_verdict`, and `application_verdict`. Run `node scripts/migrate-skill-v6-to-v7.js` for the codemod.
- Older migration notes live in `SKILL_METADATA_PROTOCOL.md § Migration Notes`; do not restate old versions here as the current contract.

**Versioning semantics (policy).** The integer signals *breaking vs non-breaking* evolution. A minor/patch axis is intentionally not surfaced on this field; additive schema changes do not require consumers to migrate, so no version bump is emitted.

**Example.**
```yaml
schema_version: 7
```

**When to use.** Always — this is a required field.

**When NOT to use.** N/A — required.

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

**Purpose.** The routing contract. Tells a router whether this skill should activate for a given query or label. It is pushy, specific, and boundary-aware.

**Rules.**
- Lead with trigger phrases ("Use when…", "Activates for…") rather than generic summaries.
- Include an explicit negative boundary ("Do NOT use for…") so the router doesn't over-activate.
- Do not repeat the `## Coverage` section body here — that belongs inside the skill body, not in the routing contract.

**Example.**
```yaml
description: >
  Shopify integration skill for API, webhook, and sync work. Use when the
  task involves Shopify orders, products, webhooks, or the Shopify Admin API.
  Do NOT use for general e-commerce patterns not tied to Shopify.
```

**When to use.** Always — required.

**When NOT to use.** Do not expand beyond 3 sentences or copy-paste the `## Coverage` scope list here. The description and `## Coverage` are sibling layers of progressive disclosure, not duplicates.

**Verification.** `scripts/skill-lint.js` enforces the canonical-source schema gate, including required shape and non-empty description text. Description quality is verified through routing evals, review, and application verdicts rather than a deleted routing-quality lint module.

---

## `version`

**Purpose.** Tracks the semantic version of the skill content itself, independent of the schema version. Enables change tracking, relation resolution, and diff-based audit.

**Rules.**
- Must be a semver string matching `^[0-9]+\.[0-9]+\.[0-9]+$`.
- Start new skills at `1.0.0`.
- Increment the patch version for small corrections (examples, wording, typos).
- Increment the minor version when new sections or fields are added without breaking the existing shape.
- Increment the major version when content is reorganized or an archetype changes.

**Example.**
```yaml
version: 1.0.0
```

**When to use.** Always — required.

**When NOT to use.** N/A — required.

---

## `type`

**Purpose.** Defines the behavioral archetype. The archetype determines which body H2 sections are required, how the skill is loaded by a router, and which schema conditionals apply.

**Allowed values.**

| Value | Meaning |
|---|---|
| `capability` | A standalone functional skill — what the agent can do. Required sections: `## Coverage`, `## Philosophy`, `## Verification`, `## Do NOT Use When`. |
| `workflow` | A step-by-step procedural skill. Adds `## Workflow` to the required sections. |
| `router` | A skill that dispatches to other skills. Uses `## Routing Rules` instead of `## Workflow`. |
| `overlay` | A skill that extends another skill. Requires `extends` and uses `## Overlay Rules` and `## Extends`. |

**Rules.**
- Keep `type` restricted to these four values.
- Use `category` (flat bucket) or `category` (hierarchical path) for browse taxonomy, not `type`.
- `overlay` type always requires the `extends` field.

**Example.**
```yaml
type: capability
```

**When to use.** Always — required.

**When NOT to use.** Do not invent new type values. If none of the four archetypes fit, use `capability` as the closest and note the variation in the `## Coverage` section.

**Lint check.** Previously enforced by `scripts/lint/check-archetype-sections.js`; removed in commit `2bd8e64` (2026-05-19) per the audit-doctrine cleanup. Body section structure is a project-internal style preference and is no longer lint-gated. The archetype section map remains the recommended shape; authors apply judgment.

---

## `archetype`

**Purpose.** v3.1 preferred alias for `type`. Identical enum and semantics; the rename resolves sign-drift between the schema (`type`) and the doc body / ADR 0003 (which already say "archetype" everywhere) and removes a generic-name anti-pattern.

**Allowed values.** Identical to `type`: `capability`, `workflow`, `router`, `overlay`.

**Rules.**
- When both `type` and `archetype` are present, they must match. The lint will warn on mismatch.
- v3.x skills can set either form; v4 makes `archetype` canonical and removes `type`.

**Example.**
```yaml
archetype: capability
```

**When to use.** Prefer `archetype` for new skills authored against the v3.1 contract. Existing skills do not need to migrate during v3.x.

**Lint check.** Mismatch warning when both are set (planned). v4 will hard-error on `type`.

---

## `category`

**Purpose.** Flat human browse bucket for discovery and grouping. Does not imply runtime behavior or evaluation logic. Renamed from v3 `browse_category` in v4 so the public browse axis has the obvious name; the value space was then closed to a six-value enum in v5 (retained in v7) to prevent the v3-era explosion of synonymous buckets.

**Rules.**
- **Required since schema_version 5** (retained in v7). Present in `required: [...]` of `schemas/skill.schema.json`. A v5+ skill without `category` fails schema validation.
- **Closed enum of six values** as of schema_version 5: `foundations` \| `engineering` \| `design` \| `quality` \| `agent` \| `product`. Any other value is rejected at the schema level AND at the lint level by `scripts/lint/check-category-enum.js`. (Pre-v5 open-ended values like `knowledge`, `frontend`, `integrations`, `security` were migrated to the six-value enum.)
- For cross-cutting category fit, list secondary browse homes in `categories[1..]` (v7 optional, v8 planned required) or `secondary_categories` when the only need is marketplace cross-listing. Use `relations.related` for neighboring skills, not category membership.
- For hierarchical taxonomy (`engineering/integrations/shopify`), use the optional `domain` field; `category` is flat on purpose and complements `domain` rather than substituting for it.

**The six values and what they cover.**

| Value | Use for |
|---|---|
| `foundations` | Epistemics, grounding, verification, context engineering, reasoning — preconditions of competent agent or engineering work. Reserved; must clear the foundations gate (target 8–15 skills). |
| `engineering` | Building software systems: APIs, data, infra, runtime, integrations. |
| `design` | Visual, interaction, IA, content, motion — design as a discipline. |
| `quality` | Cross-cutting non-functional properties: a11y, performance, security, type-safety, testing, observability. Properties of any artifact. |
| `agent` | Agent-specific concepts: tool design, prompt design, agent state, orchestration, eval-driven dev. |
| `product` | Prioritization, scope, MVP, PRDs, customer journey, positioning. |

**Disambiguation rules** (apply in order; full text in `SKILL_METADATA_PROTOCOL.md § Classification`):

1. *Primary surface* — what the skill is *about*, not what it *enables*.
2. *Property vs subject* — properties (a11y, perf, security, testing, type-safety) → `quality`. How-to-build → `engineering` / `design` / `agent`.
3. *Cross-pollination* — multi-fit skills list secondary browse homes via `categories[1..]` or marketplace-only `secondary_categories`. Never via the singular `category` field itself.
4. *`foundations` gate* — anti-junk-drawer. Membership requires (a) the skill teaches an epistemic precondition AND (b) it cannot be plausibly assigned to `agent`/`engineering`/`quality`/`design`.

**Example.**
```yaml
category: engineering
```

**When to use.** Always. `category` is required and exactly one of the six enum values must be picked, even if the choice is awkward — pick the closest fit and disambiguate via `domain`, `categories[1..]`, `secondary_categories`, or `relations.related` depending on whether the ambiguity is taxonomic, marketplace-facing, or skill-to-skill neighborhood.

**When NOT to use.** Do not use `category` for behavioral control; that is `type`'s job. Do not use it for activation-bundle membership; that is `routing_bundles`. Do not use it for hierarchical placement; that is `domain`. Do not invent values outside the six-value enum.

**Migration from v3.** The field name changed from `browse_category` to `category` in v4 (values then still unconstrained). Run `node scripts/migrate-skill-v3-to-v4.js` for the automatic rename.

**Migration from v4.** The closed six-value enum was introduced in v5 and retained in v6/v7. Skills carrying pre-v5 open-ended values (`knowledge`, `frontend`, `integrations`, `security`, `dev`, etc.) must be remapped to the enum — both the mapping table and the codemod live in git history (per ADR 0014).

---

## `categories`

**Purpose.** Ordered category array for skills that need a primary browse home plus secondary browse homes. The first entry is the primary and must match `category`.

**Rules.**
- Optional in v7; planned required in v8.
- Min 1, max 5, unique items.
- Every item must use the same six-value enum as `category`: `foundations` | `engineering` | `design` | `quality` | `agent` | `product`.
- When `category` is present, `categories[0]` must equal `category`; this is enforced in the v7 schema.

**Example.**
```yaml
category: engineering
categories: [engineering, quality]
```

**When to use.** Use when the skill genuinely belongs in more than one browse shelf. Keep the first value aligned with the main audience.

**When NOT to use.** Do not use this as a tag bag. Use `relations.related` for skill neighbors, `workspace_tags` for project relevance, and `routing_bundles` for activation bundles.

---

## `primaryCategory`

**Purpose.** Optional workspace alias for the primary browse home. Lowercase protocol values are accepted directly; title-case workspace labels normalize to protocol categories in local policy tooling.

**Rules.**
- Optional in the protocol.
- Allowed lowercase values match `category`.
- Allowed title-case aliases are `Meta Method`, `Technical Capability`, `Design & UX`, `Agent System`, and `Product Domain`.
- Prefer `category` / `categories` in protocol-native authoring.

**Example.**
```yaml
category: agent
primaryCategory: Agent System
```

**When to use.** Use only when a workspace's browse UI or census tooling still depends on the title-case alias.

**When NOT to use.** Do not use `primaryCategory` as a substitute for a missing `category`; v7 requires `category`.

---

## `layerPrimary`

**Purpose.** Workspace routing facet for the primary architectural or concern layer, such as `meta`, `architecture`, `integration`, `operations`, `display`, `quality`, `data`, `logic`, `security`, or `business`.

**Rules.**
- Optional in the portable protocol.
- Lowercase kebab-case only.
- Orthogonal to `category`: `category` is the human browse shelf; `layerPrimary` is a workspace routing/census facet.
- Do not use the deprecated `layer` field. If a skill has both, migrate the value into `layerPrimary` and remove `layer`.

**Example.**
```yaml
layerPrimary: integration
```

**When to use.** Use when a workspace router, census, or dashboard explicitly consumes architectural-layer facets.

**When NOT to use.** Do not add it to public starter skills solely because `category` feels broad. Use `domain`, `keywords`, or `relations` for ordinary discovery precision.

---

## `routingRole`

**Purpose.** Workspace routing facet describing how a router should use the skill, for example `primary`, `router`, `verifier`, or `gate`.

**Rules.**
- Optional in the portable protocol.
- Lowercase kebab-case only.
- Orthogonal to `type`: `type` says what kind of skill this is; `routingRole` says how the workspace router should treat it during selection.
- Use concrete router behavior words, not vague quality labels.

**Example.**
```yaml
routingRole: verifier
```

**When to use.** Use when a workspace has explicit routing lanes or verification co-load roles.

**When NOT to use.** Do not use it to compensate for a weak `description`, missing `keywords`, or unclear `relations`; those remain the primary routing signals.

---

## `secondary_categories`

**Purpose.** Additive cross-listing tags for marketplace collections. Primary `category` is MECE and decides folder placement; `secondary_categories` lets a skill that genuinely serves two audiences (e.g., `playwright-cli` is primarily `quality` but also relevant to `engineering`) appear in additional marketplace collections without affecting filesystem layout.

**Rules.**

- Optional. Omit if the primary `category` is sufficient.
- Drawn from the same closed 6-enum as `category` (`foundations` | `engineering` | `design` | `quality` | `agent` | `product`).
- Max 2 entries to prevent dilution.
- MUST NOT include the primary `category` value.

**Example.**

```yaml
category: quality
secondary_categories: [engineering]
```

**When to use.** When a skill is genuinely useful in more than one browse bucket and you want it to surface in additional marketplace collections.

**When NOT to use.** Do not stuff this field as a dumping ground for tags. Use `workspace_tags` or `routing_bundles` for non-marketplace classification.

---

## `subject`

> Introduced in v8 (compatibility-mode landing). Required when `schema_version: 8`; optional/absent on v7 skills during the migration window.

**Purpose.** v8 primary classification — what the skill teaches. Closed 9-value enum, replacing v7's combined `category` + `categories[0]` + `primaryCategory` fields. Driven by the v7→v8 restructure plan (compatibility-mode landing) and informed by the 2026-05-25 Phase 1 audit which found `category` overcrowded (engineering=40%) and the workspace-alias fields (`primaryCategory`/`layerPrimary`/`routingRole`) <1.5% adopted.

**Rules.**
- **Required when `schema_version: 8`.** Optional/absent on v7 skills during the migration window.
- **Closed 9-value enum:** `agent-ops` \| `code-engineering` \| `frontend-ui` \| `design-craft` \| `data-analytics` \| `quality-assurance` \| `meta-methods` \| `knowledge-organization` \| `product-domain`.
- **Balance rule:** each subject must hold 5–25 skills. <5 = fold or recruit; >25 = subdivide via `domain` slash-path. Replaces v7's `foundations`-only gate.
- v7→v8 mapping is NOT 1:1. v7 `engineering` may map to `code-engineering`, `frontend-ui`, or `data-analytics` depending on content; the codemod proposes mappings for review.
- For polyhierarchy (skills that legitimately span two subjects), use `subjects[]` array (primary first, optional secondary).

**Example.**
```yaml
subject: code-engineering
```

**When to use.** Always on v8 skills. Pick the single best primary; cross-cutting fit goes into `subjects[1]` (max 1 secondary).

**Subject definitions.**
- `agent-ops` — agent orchestration, dispatch, lifecycle, multi-agent comms.
- `code-engineering` — backend, APIs, libraries, infrastructure, runtime.
- `frontend-ui` — UI components, layout, interaction, web framework specifics.
- `design-craft` — visual design, typography, brand, motion, design tokens.
- `data-analytics` — data viz, analytics, observability, financial display.
- `quality-assurance` — testing, a11y, perf, security, type-safety.
- `meta-methods` — methodology, reasoning, verification, decision frameworks.
- `knowledge-organization` — taxonomy, semantics, classification, glossaries, ontology.
- `product-domain` — domain-specific (Shopify, Stripe, fulfillment, integrations).

See `docs/adr/0017-five-axis-classification-model.md` for rationale and the v7→v8 mapping codemod design.

---

## `subjects`

> Introduced in v8. Optional polyhierarchy companion to `subject`.

**Purpose.** Ordered subject array for v8 polyhierarchy — when a skill genuinely spans two browse shelves. Tighter than v7's `categories[]` (max 5) to enforce that polyhierarchy is the exception, not the default.

**Rules.**
- Optional. When present, `subjects[0]` MUST equal `subject` (mirrors v7's `category`/`categories[0]` prefix rule).
- Max 2 entries.
- Drawn from the same closed 9-enum as `subject`.
- Use when a skill genuinely teaches a primary subject AND meaningfully covers a secondary. Example: `webhook-integration` is primarily `code-engineering` and secondarily `quality-assurance` because reliable delivery is a quality property.
- Do NOT use for semantic adjacency that isn't shelf-level — `relations.related` covers that.

**Example.**
```yaml
subject: code-engineering
subjects: [code-engineering, quality-assurance]
```

**When NOT to use.** Skills that fit one subject cleanly. Adding a forced secondary dilutes the polyhierarchy signal.

---

## `operation`

> Introduced in v8. Required when `schema_version: 8`; optional/absent on v7 skills during the migration window.

**Purpose.** v8 cognitive operation classifier — what kind of cognitive operation loading this skill enables. Bloom-grounded. Replaces v7's `type` (which is 93% `capability` and provides almost no discriminating power per the 2026-05-25 audit).

**Rules.**
- **Required when `schema_version: 8`.** Optional/absent on v7 skills during the migration window.
- **Closed 4-value enum:**
  - `know` — declarative knowledge: concepts, vocabulary, reference material. (Bloom: Remember/Understand)
  - `do` — procedural knowledge: step-by-step execution of a task. (Bloom: Apply)
  - `decide` — routing/judgment: choosing between options, dispatching other skills. (Bloom: Analyze/Evaluate)
  - `modify` — context injection: shapes how other skills execute without executing itself. (corresponds to v7's `overlay` archetype but framed as an operation, not a kind of file)

**v7→v8 mapping** (codemod heuristic, HITL for ambiguous):
- `type: capability` → `operation: know` or `operation: do` (heuristic based on workflow-keyword presence)
- `type: workflow` → `operation: do`
- `type: router` → `operation: decide`
- `type: overlay` → `operation: modify`

**Predicted v8 distribution** (per GPT-5.5 critique 2026-05-25): know 35–45%, do 25–35%, decide 20–30%, modify 1–3%. Significant improvement over v7's 93% `type: capability` concentration.

**Example.**
```yaml
operation: do
```

**When to use.** Always on v8 skills. The choice should reflect what an agent will primarily DO with the skill loaded — recall facts (`know`), execute a sequence (`do`), make a routing decision (`decide`), or modify another skill's context (`modify`).

See `docs/adr/0017-five-axis-classification-model.md` for the rationale and codemod design.

---

## `domain`

**Purpose.** Hierarchical domain path as slash-delimited segments. Complements `category`: flat bucket and tree path answer different questions. A UI or docs site uses `domain` to render a folder tree; a filter UI uses `category` for quick grouping.

**Rules.**
- Optional.
- Lowercase alphanumeric segments separated by `/` (for example, `ecommerce/integrations/shopify`).
- Must match pattern `^[a-z0-9][a-z0-9-]*(/[a-z0-9][a-z0-9-]*)*$`.
- Do not use absolute paths, leading `/`, trailing `/`, `.`, or `..`.
- One skill, one path. Use `workspace_tags` or `routing_bundles` for secondary flat grouping.

**Example.**
```yaml
domain: ecommerce/integrations/shopify
```

**When to use.** When the skill library is large enough that a tree structure helps readers find related skills. A library with fewer than 20 skills rarely benefits.

**When NOT to use.** Small skill libraries where `category` alone is sufficient. Skills where categorization is genuinely ambiguous should use `workspace_tags` or `routing_bundles` to attach flat semantic tags instead.

---

## `scope`

**Purpose.** Indicates locality and usage mode. Tells the router and auditor whether the skill is fully portable, a documentation reference, or grounded in a specific codebase.

**Allowed values.**

| Value | Meaning | Requires `grounding`? |
|---|---|---|
| `portable` | Fully portable, no repo-specific claims | No |
| `reference` | Documentation-style skill grounded in protocol documents | No |
| `codebase` | Grounded in a specific codebase or deployment | **Yes** (schema-enforced) |

**Rules.**
- `scope: codebase` triggers a schema `allOf` rule that requires the `grounding` block. Lint fails without it.
- Do not use `overlay` as a scope value — use `type: overlay` and `extends` instead.
- Choose `portable` for starter skills and broadly reusable skills.
- The v1 names `generic` and `operational` were renamed in schema_version 2: `generic` → `portable` (the intent is "works anywhere"), and `operational` → `codebase` (the intent is "grounded in *this* codebase"). The v1 names are hard errors under the v2 schema.

**Example.**
```yaml
scope: codebase
```

**When to use.** Always — required.

**When NOT to use.** Do not use `codebase` for skills that make no concrete repo claims — use `portable` instead.

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

**Purpose.** Records when the author last **reviewed** the skill's content for accuracy. This is the **reviewer's footprint**, NOT the editor's footprint — the Health Block field [`last_changed`](#last_changed) is loop-stamped on every SKILL.md edit and serves the editor-footprint role. The two are intentionally distinct: a skill can be edited without a fresh review (cosmetic fix) or reviewed without an edit (the author re-read and confirmed it still holds).

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

**Shape change in v3.** The v2 field was a date string. The v3 field is an object with a required `last_verified` date and an optional `truth_source_hashes` map. The v2 scalar form is rejected as a type error under v3; run `node scripts/migrate-skill-v2-to-v3.js` for an automatic upgrade.

**Rules.**
- Object with one required sub-field and one optional sub-field.
- `last_verified`: ISO 8601 date string (`YYYY-MM-DD`).
- `truth_source_hashes`: optional map of normalized truth-source key -> SHA-256 hex digest.
- Keys must match the normalized form produced from `grounding.truth_sources`: `path` for whole-file sources, `path#Lstart-Lend` for line ranges, and `path#anchor` for anchor-only sources. The drift sentinel (`scripts/skill-graph-drift.js`) reports DRIFT when any live hash differs from the recorded hash, BROKEN when a local truth source is missing, STALE when the lifecycle window is exceeded, NO_BASELINE when `truth_source_hashes` is absent but local truth sources are declared, and EXTERNAL_UNHASHED when a URL truth source is valid but not fetched by the zero-dependency sentinel.
- For `scope: portable` skills with no external truth sources, `drift_check.last_verified` equals `freshness` and `truth_source_hashes` is omitted.
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

**Migration from v2.** v2 used a single date string: `drift_check: "2026-04-15"`. v3 requires an object: `drift_check:\n  last_verified: "2026-04-15"`. The codemod handles this transformation automatically.

---

## `last_audited`

**Purpose.** ISO date of the most recent audit run that produced a recorded verdict for this skill. Introduced with the v6 Health Block and retained in v7 — a flat set of top-level fields that surface audit state without requiring readers to parse nested audit artifact files.

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

**Purpose.** ISO date of the last meaningful content change to the SKILL.md. Distinct from `freshness` (editorial review date) and `last_audited` (audit run date). Introduced with the v6 Health Block and retained in v7.

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

**Purpose.** Form-layer verdict produced by gates 1–2 and 7 of the skill-audit loop (schema lint, manifest census, concept-card shape). Part of the v7 Health Block. Replaces the structural slice of the v6 `audit_verdict` aggregate.

**Allowed values.**

| Value | Meaning |
|---|---|
| `PASS` | Form gates passed cleanly |
| `PASS_WITH_FIXES` | Form gates passed with warnings (not errors) |
| `FAIL` | One or more form gates produced errors that block external-constraint compliance (Anthropic Agent Skills marketplace, OpenAI tool-use API) |
| `UNVERIFIED` | No structural audit has run since the v7 schema bump |

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

**Purpose.** Truth-layer verdict produced by gates 3–6 of the skill-audit loop (truth-source catalog, drift sentinel, test coverage, claim verification). Part of the v7 Health Block. Replaces the truth slice of the v6 `audit_verdict` aggregate.

**Allowed values.**

| Value | Meaning |
|---|---|
| `PASS` | Truth sources align with declared `last_verified` and recorded hashes |
| `DRIFT` | Truth sources changed since `last_verified` |
| `BROKEN` | Declared truth sources missing or unreadable |
| `UNVERIFIED` | No truth audit has run since the v7 schema bump |

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

**Purpose.** Comprehension-layer verdict produced by gate 8 (the comprehension grader on `evals/comprehension.json`). Part of the v7 Health Block. Demoted in v7: never alone certifies a skill as useful.

**Allowed values.**

| Value | Meaning |
|---|---|
| `PASS` | Loading the skill produces a measurable comprehension delta on the comprehension scenarios |
| `PROVISIONAL` | A single competent model ran the comprehension assessment; useful evidence, but lower confidence than the independent dual-run grader |
| `SHALLOW` | The skill recites the concept but does not deepen agent understanding |
| `REDUNDANT` | Baseline already saturated — the foundation model already knows the concept from training |
| `SKIPPED_BASELINE_HIGH` | Early-skip: `avg_primary_baseline >= 1.0` after the first 2 evals, so the dual-run was aborted (v7 demotion behaviour) |
| `NA` | The skill has no `evals/comprehension.json` |
| `UNVERIFIED` | Initial state before any grader run |

**Rules.**
- Optional. Defaults to `UNVERIFIED` when absent.
- Written by the comprehension grader or a documented single-model self-assessment audit; do not hand-author without evidence.
- Demoted in v7: the comprehension grader runs on a cheap model (Haiku 4.5 / Gemini Flash) and exits early when baseline is already high. See ADR 0011 Change 3.
- This verdict is advisory. It never alone determines a skill's usefulness — that authority lives on `application_verdict`.

**Example.**
```yaml
comprehension_verdict: SKIPPED_BASELINE_HIGH
```

---

## `application_verdict`

**Purpose.** Application-layer verdict produced by gate 9 (the application grader on `evals/application.json`). Part of the v7 Health Block. The **primary quality signal** in v7 — a skill is only behaviorally certified when this is `APPLICABLE`.

**Allowed values.**

| Value | Meaning |
|---|---|
| `APPLICABLE` | Loading the skill changes agent behavior on real artifacts in the expected direction — correct flags, correct fixes, correct generative trajectory |
| `REDUNDANT` | No behavioral delta — the agent behaves identically with or without the skill loaded |
| `HARMFUL` | Negative delta — the agent makes worse decisions with the skill loaded. SkillsBench (arXiv 2602.12670) found 19% of evaluated skills exhibit this; the v7 schema makes this verdict surfaceable |
| `MIXED` | Verdict varies across cases — some applicable, some redundant or false-positive |
| `FALSE_POSITIVE` | The skill over-triggers — applies on cases where its expertise does not apply |
| `UNVERIFIED` | Default for the v6→v7 corpus migration — no application audit has run on this skill yet |
| `PROVISIONAL` | single-model self-assessment audit found useful behavior but the independent application grader has not confirmed it |

**Rules.**
- Optional. Defaults to `UNVERIFIED` when absent.
- Written by the application grader (`scripts/skill/evaluate-skill.js --application` → ported to `skill-graph/lib/audit/evaluate-skill.js` per ADR 0011); do not hand-author.
- Cases authored in `evals/application.json` must come from external anchors (real PR diffs, real agent failures, real audit findings) — never auto-generated from the skill body. Per the SYNTHESIS roundtable (2026-05-19), auto-generation creates a closed-loop synthetic-eval lie.
- `application_verdict == APPLICABLE` is the **only** verdict that certifies a skill is useful. The other three verdicts (`structural`, `truth`, `comprehension`) are necessary infrastructure but not sufficient.

**Example.**
```yaml
application_verdict: APPLICABLE
```

---

## `audit_verdict` *(deprecated)*

**Purpose.** DEPRECATED in v7. Pre-v7 single aggregate verdict. Replaced by four discrete verdicts (`structural_verdict`, `truth_verdict`, `comprehension_verdict`, `application_verdict`). See [ADR 0011](adr/0011-split-audit-verdict-into-four-verdicts.md).

**Why deprecated.** The single field compressed four independent layers — form, truth, comprehension, behavior — into one PASS/FAIL signal that masqueraded as a quality verdict. A skill could be lint-clean (`audit_verdict: PASS`) while being behaviorally redundant or harmful, and the reader had no way to tell. The four-verdict split lets each layer surface independently. See ADR 0014 (canonical-only schema files); the migration procedure lives in git history.

**Read behavior post-v7.** Tools that read `audit_verdict` for back-compat on unmigrated v6 skills can continue to do so, but the canonical Health Block surface is the four discrete verdicts. The codemod at `scripts/migrate-skill-v6-to-v7.js` strips `audit_verdict` from migrated skills.

**Pre-v7 allowed values (historical).** `PASS` | `PASS_WITH_FIXES` | `PARTIAL` | `FAIL` | `UNKNOWN`.

---

## `eval_score`

**Purpose.** Numeric score from the most recent eval run, on the 0.0–5.0 scale used by `scripts/skill-audit.js`. Introduced with the v6 Health Block and retained in v7.

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

**Purpose.** List of eval case IDs that failed in the most recent eval run. Introduced with the v6 Health Block and retained in v7. Enables fast lookup of which specific cases a skill is failing without opening the full scorecard.

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

**Purpose.** The verdict from the most recent lint run against this skill. Introduced with the v6 Health Block and retained in v7 as the per-script signal that can roll up into `structural_verdict`.

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

**Purpose.** The result of the most recent drift check for this skill. Introduced with the v6 Health Block and retained in v7 as the per-script signal that can roll up into `truth_verdict`.

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

**Enforcement.** `routing_eval: present` is a verifiable claim. The harness at `scripts/skill-graph-routing-eval.js` runs every `examples[]` entry through `skill-graph-route.js` and asserts the skill wins; runs every `anti_examples[]` entry and asserts the winner is NOT this skill AND (if non-null) is named in `relations.boundary[]`. A skill that declares `present` must satisfy two harness gates:

1. Both `examples` and `anti_examples` are populated — the harness needs prompts to evaluate.
2. Running `node scripts/skill-graph-routing-eval.js --skill <name>` returns verdict `PASS` for the skill.

A skill whose harness run contains any `FAIL` case cannot honestly claim `present`; the routing-eval output surfaces each failing prompt with the router's actual decision. A `COVERAGE_GAP` verdict (the anti-example correctly avoids this skill but no other skill absorbs it) is informational and does not block `present` — the anti-example did its job; the coverage-gap signal is for the next authoring iteration. Prefer `absent` until the harness agrees — honesty over green checkmarks.

**Current status of the starter library.** As of the `[Unreleased]` entry, all eight starters declare `routing_eval: present` and pass the harness 8-of-8 (verified by `node scripts/skill-graph-routing-eval.js --only-asserted`). Each starter's `examples[]` activate the skill correctly and each `anti_examples[]` route to the appropriate boundary owner. The route flips `present` were earned by tightening keywords, splitting `examples` from `anti_examples`, and populating `relations.boundary[]` with explicit handoff targets. New skills should default to `absent` until the harness agrees — honesty over green checkmarks remains the rule.

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
| `present` | A comprehension eval exists and the `concept` block is required |

**Rules.**
- Optional in v3. Omitted means `absent`.
- Independent of `routing_eval` and `eval_state`.
- `present` requires the top-level `concept` block by schema rule.

**Example.**
```yaml
comprehension_state: present
```

**When to use.** Use `present` only when the skill has a real comprehension eval and a filled concept teaching block.

**When NOT to use.** Do not set `present` for skills that only have routing examples or general eval artifacts.

---

## `concept`

**Purpose.** Seven-field teaching block for the skill's subject. It gives graders and agents a direct concept model: what the subject is, how to think about it, why it exists, what it is not, where it sits near other concepts, a useful analogy, and the common misconception to avoid.

**Rules.**
- Required when `comprehension_state: present`.
- Object with required `definition`, `mental_model`, `purpose`, `boundary`, `taxonomy`, `analogy`, and `misconception`.
- Keep this about the universal subject. The body `## Philosophy` explains why this skill exists in this repo.

**Example.**
```yaml
concept:
  definition: "Relational mapping is the practice of translating domain relationships into durable data structures."
  mental_model: "Start from entities, cardinality, optionality, ownership, and lifecycle."
  purpose: "It prevents persistence shape from smuggling in a false domain model."
  boundary: "It is not database tuning, UI information architecture, or API envelope design."
  taxonomy: "Prerequisite to data-modeling; adjacent to bounded-context-mapping."
  analogy: "Like drawing load-bearing walls before choosing interior paint."
  misconception: "A table diagram is not a domain model unless the relationships have domain meaning."
```

**When to use.** Skills whose subject needs concept transfer, not just procedural steps.

**When NOT to use.** Pure execution wrappers where the body already contains all needed operational instruction and no concept grader exists.

---

## `mental_model`

**Purpose.** v6 flat form of `concept.mental_model`. The primitives, metaphors, or operative principles an agent needs to reason about this subject. Describes *how* to think about the subject — the reasoning substrate, not a procedure.

**Rules.**
- Optional. String.
- Required when `comprehension_state: present` and using the v6 flat form (instead of nested `concept` block).
- Must be distinct from `purpose` (which covers *why* the concept exists) and `boundary` (which covers *what it is not*).

**Example.**
```yaml
mental_model: "Start from entities, cardinality, optionality, ownership, and lifecycle."
```

**See also.** `concept` (v5 nested block), `purpose`, `boundary`.

---

## `purpose`

**Purpose.** v6 flat form of `concept.purpose`. The problem this concept solves and what it replaced or improved upon. Answers "why does this concept exist?"

**Rules.**
- Optional. String.
- Required when `comprehension_state: present` and using the v6 flat form.

**Example.**
```yaml
purpose: "It prevents persistence shape from smuggling in a false domain model."
```

---

## `boundary`

**Purpose.** v6 flat form of `concept.boundary`. An explicit statement of what the concept is **not** — adjacent concepts the agent might confuse it with.

**Rules.**
- Optional. String.
- Required when `comprehension_state: present` and using the v6 flat form.
- This field is the primary grader input for the C4 rubric dimension (adjacent-concept discrimination). Weight 1.5 in the schema — second highest.

**Example.**
```yaml
boundary: "It is not database tuning, UI information architecture, or API envelope design."
```

---

## `analogy`

**Purpose.** v6 flat form of `concept.analogy`. A single structural analogy that helps an agent grasp the concept's shape. Graded on both correct application AND correct identification of the analogy's limits (C6 rubric).

**Rules.**
- Optional. String.
- Required when `comprehension_state: present` and using the v6 flat form.
- Weight 0.5 in the schema — the lowest of the concept-block fields. Analogy is a teaching aid, not a load-bearing primitive.

**Example.**
```yaml
analogy: "Like drawing load-bearing walls before choosing interior paint."
```

---

## `misconception`

**Purpose.** v6 flat form of `concept.misconception`. The single most common wrong belief about the concept that agents and practitioners hold. Graded on whether the agent corrects it unprompted when the misconception is embedded in a probe (C7 rubric).

**Rules.**
- Optional. String.
- Required when `comprehension_state: present` and using the v6 flat form.
- Complements `boundary`: `boundary` describes adjacent concepts; `misconception` describes wrong beliefs *about this concept itself*.
- Not directly weighted in the schema; complements `boundary` (weight 1.5).

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
- Do not set `eval_state: passing` solely because this object exists; the run still needs to satisfy the skill's eval contract.

**Example.**
```yaml
eval_last_run:
  at: "2026-05-12T09:30:00Z"
  status: pass
  runner: "node scripts/skill-audit.js --graded"
  receipt: "examples/audits/documentation/scorecard.md"
```

**When to use.** When a skill's eval has actually run and there is a scorecard, grader history, CI run, or other receipt worth preserving.

**When NOT to use.** Brand-new skills with `eval_state: unverified`, or skills whose last run cannot be traced to an artifact.

---

## `eval`

**Purpose.** v3.1 preferred nested form for the eval-health triple (`eval_artifacts` + `eval_state` + `routing_eval`). Aligns with the sibling-object pattern of `drift_check`, `grounding`, `lifecycle`, `portability`. Also resolves the head-first compound ambiguity of `routing_eval` (renamed to `routing_coverage`) and disambiguates `eval_state` from `routing_coverage` (renamed to `content_state`).

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

**Pre-1.0 stance.** The library defaults all skills to `experimental` because the protocol and skill content are under active development. A near-uniform `experimental` distribution is intentional — it signals that the corpus as a whole is pre-1.0 and no stability guarantees are implied. Do not interpret a uniformly experimental corpus as an unmaintained field; it reflects a deliberate stance. Skills are promoted to `stable` only when all promotion criteria below are met. See `SKILL_METADATA_PROTOCOL.md § stability` for the normative spec.

**Promotion to `stable` — minimum criteria:**
1. `eval_state: passing` or `eval_state: monitored` — evals have been run and pass.
2. `eval_score >= 4.0` — grader score meets the quality bar.
3. `routing_eval: present` — the skill has been verified in a routing eval.
4. `drift_check.last_verified` within 90 days — skill has been recently verified against truth sources.
5. For `scope: codebase` skills: `grounding.truth_sources` must be non-empty.

**Example.**
```yaml
stability: stable
```

**When to use.** For any skill intended to be used by others. Omit only if the skill is a draft that will be revised immediately.

**When NOT to use.** Do not use `frozen` for skills that might still need maintenance — `stable` is the correct choice for mature, actively-owned skills. Do not promote to `stable` without meeting all five promotion criteria above.

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
- **Required when `stability: deprecated`** — enforced by the `allOf` rule in `skill.schema.json`. A deprecated skill without `superseded_by` fails schema validation.
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
- Pair with `relations.boundary` — every `anti_examples` entry should correspond to a concrete other skill the router should route to. Name that skill in `relations.boundary` with an object-form `{skill, reason}` explaining why it owns that territory.
- Do not dump generic off-topic prompts here — this is not a blocklist. Use it only for near-misses the router keeps getting wrong.
- Groups under `activation.anti_examples` in the manifest projection.

**Example.**
```yaml
anti_examples:
  - "refactor this function to be more testable"     # → refactor skill, not this one
  - "why is my test failing after the refactor?"     # → debugging skill
relations:
  boundary:
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

**Shape in the logical contract.** Protocol-native frontmatter uses a structured object so consumers can parse `runtimes` and `node` without heuristics. The Agent-Skills-compatible physical encoding keeps `compatibility` as a top-level base-field string; `normalizeFrontmatter()` preserves that scalar while lifting the rest of `metadata:` back into protocol shape.

**Rules.**
- Object with up to three optional sub-fields.
- Omit the field entirely when the skill is fully generic with no environment requirements.
- `runtimes`: array of strings naming target agent runtimes with optional version constraints (e.g., `claude-code>=2.0`, `cursor>=0.40`). Use short stable identifiers.
- `node`: Node.js version constraint as a string (e.g., `>=18`).
- `notes`: free-text supplement, capped at 500 characters.

**Sub-fields.**

| Sub-field | Type | Meaning |
|---|---|---|
| `runtimes` | string[] | Target agent runtimes with optional version constraints |
| `node` | string | Node.js version constraint |
| `notes` | string (≤500 chars) | Free-text supplement |

**Example.**
```yaml
compatibility:
  runtimes:
    - claude-code>=2.0
    - cursor>=0.40
  node: ">=18"
  notes: Requires PostgreSQL 15+ when using the `neon` adapter.
```

**When to use.** When the skill's instructions require a specific runtime, CLI tool, or package version that is not universally available.

**When NOT to use.** Generic skills with no runtime dependencies — omit the field rather than setting it to an empty object.

**Migration from v2.** In protocol-native source, the codemod (`scripts/migrate-skill-v2-to-v3.js`) transforms `compatibility: "<text>"` to `compatibility:\n  notes: "<text>"`. In Agent-Skills-compatible source, the scalar top-level base field is valid physical encoding; do not warn on it solely because the logical protocol-native shape is object-based.

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

## `allowed_tools`

**Purpose.** v3.1 preferred snake_case alias for `allowed-tools`. The kebab-case form is the only field in a snake_case schema; the alias removes that inconsistency on the authoring side. The export transform still writes the kebab-case form for SKILL.md consumers.

**Rules.**
- Space-separated string (same as `allowed-tools`).
- When both forms are present, they must match.
- v3.x skills can set either; v4 makes `allowed_tools` canonical for authoring. The export transform continues to write `allowed-tools` (kebab) for SKILL.md compatibility.

**Example.**
```yaml
allowed_tools: Read Grep Bash
```

---

## `extends`

**Purpose.** Explicitly states which base skill an overlay extends. Required for all `type: overlay` skills.

**Rules.**
- Must be the `name` value of an existing skill in the library.
- Relation-target existence is verified by graph/manifest review and routing audits, not by `scripts/skill-lint.js`.
- Only valid when `type: overlay`. Setting `extends` on a non-overlay skill is an error.

**Example.**
```yaml
type: overlay
extends: shopify
```

**When to use.** When and only when `type: overlay`. The overlay inherits and specializes the base skill's content.

**When NOT to use.** Non-overlay skills. Do not use `extends` to express a dependency — use `relations.depends_on` for that.

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

**When to use.** Required for all routable skills. Omit only for internal helper skills that are never activated by user language.

**When NOT to use.** Keywords are not tags for browse taxonomy — that is `category` / `category`'s job. Do not add every possible synonym; keep to the 3–8 most likely search terms.

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

**When to use.** For `scope: codebase` skills that govern specific files or directories. Omit for portable or reference skills.

**When NOT to use.** Generic skills with no specific file surfaces. Do not add paths as aspirational documentation — only add paths the skill actively covers.

---

## `workspace_tags`

**Purpose.** Declares which projects a skill is relevant to in a multi-project workspace. A skill without `workspace_tags` is ambient — it applies to every project. A skill with tags is filtered in or out by the router based on the active project.

**Taxonomy note.** `workspace_tags` answers "which of my projects is this skill relevant to?" `category` answers "where does this belong in a browse tree?" `routing_bundles` answers "which batch-activation group is this in?" Three fields, three different jobs, no overlap.

**Rules.**
- Optional array of lowercase kebab-case tokens.
- Each tag is either a literal project handle (whatever kebab-case name you give a project in your workspace config) or a semantic tag that multiple projects share (e.g., `ecommerce`, `saas`, `b2b`).
- The workspace config at `.skill-graph/config.json` maps literal project handles to `semantic_tags`. A skill tagged with a semantic tag matches every project whose config expands to include that tag.
- Absent `workspace_tags` means the skill is ambient — applies to every project. This is the default; use it for cross-cutting skills like GDPR, a11y, or test-driven-development.

**Example.**
```yaml
# One specific project only — literal targeting
workspace_tags: [<project-a>]

# Cross-ecommerce — every project whose workspace config maps to `ecommerce`
workspace_tags: [ecommerce]

# Literal + semantic — precise match on <project-a>, semantic match on any ecommerce project
workspace_tags: [<project-a>, ecommerce]
```

**Workspace config resolution.**

```json
// .skill-graph/config.json
{
  "workspace": {
    "projects": {
      "<project-a>":  { "semantic_tags": ["ecommerce", "saas"] },
      "<project-b>":  { "semantic_tags": ["ecommerce", "b2c"] }
    }
  }
}
```

A skill tagged `[ecommerce]` matches both projects. A skill tagged `[<project-a>]` only matches the first. A skill tagged `[saas]` only matches whichever projects' configs map to that semantic tag (the first, in this example).

**When to use.** When the workspace has more than one project and a skill's scope is clearly bound to a subset. Tag with semantic tags whenever possible — literal project handles couple the skill to a project name that may change.

**When NOT to use.** Single-project workspaces — omit the field. Cross-cutting skills that apply everywhere — omit the field. Do not use it as a substitute for `category` or `routing_bundles`; they answer different questions.

---

## `routing_bundles`

**Purpose.** Named routing group membership for batch activation and browse classification. Allows a router to load all skills in a group with a single label.

**Taxonomy note.** A routing group is a *classification tag* a router can consult to select a family of skills (e.g., `quality`, `security`, `integrations`). It is not a URL route, not an execution graph, and not a permission scope. The field was renamed from `route_bundles` in schema_version 2 (SH-5784) because the old name invited confusion with URL routing; the semantics did not change.

**Rules.**
- Array of strings.
- Group names are library-defined — establish a consistent vocabulary and document it in the library's README.
- A skill can belong to multiple routing groups.
- Use established groups before inventing new ones. Today's canonical group in this repo is `quality` (used by `testing-strategy`). Propose new groups in a PR before adopting them.

**Example.**
```yaml
routing_bundles:
  - integrations
  - quality
```

**When to use.** When the skill belongs to a logical activation group (e.g., all `integrations` skills load together during an integration task, all `quality` skills load together during an audit).

**When NOT to use.** Skills that should only activate individually. Do not add routing groups speculatively — add them when a real routing pattern requires them.

**Migration from v1.** The v1 field name `route_bundles` is a hard error under the v2 schema. Rename the field to `routing_bundles`; values are unchanged.

**Verification.** Keep `routing_bundles` and `keywords` coherent through manifest review and routing evals. The former `check-routing-quality.js` lint module is no longer part of the canonical-source linter.

---

## `relations`

**Purpose.** Graph semantics between skills. Each key in the `relations` object describes a different type of relationship. Together they form the edges of the skill graph.

**Rules.**
- Object with up to seven optional keys: `related` (preferred) / `adjacent` (deprecated alias), `broader`, `narrower`, `boundary`, `disjoint_with`, `verify_with`, `depends_on`.
- Every target must be the `name` of an existing skill. Use graph/manifest review and routing audits to catch dangling targets across all seven keys; `scripts/skill-lint.js` validates schema shape, not graph existence.
- Relations are directional from the skill that declares them (A `depends_on` B means A depends on B, not the reverse). `related` is symmetric by SKOS convention; `boundary` is asymmetric (A `boundary: B` does not imply B `boundary: A`).

**Allowed keys.**

| Key | Meaning | Item shape | W3C mapping |
|---|---|---|---|
| `related` *(v3.1 preferred)* | Related skills for discoverability and recommended co-reading. Symmetric; no dependency implied. | string | `skos:related` |
| `adjacent` *(deprecated alias of `related`)* | v3.0 name; still valid in v3.x. Lint warns. Removed in v4. | string | `skos:related` |
| `broader` *(v3.1)* | Cross-skill generalisation — target is more general than this skill. Triggers Stage 4b parent recall in `scripts/skill-graph-route.js`. | string | `skos:broader` |
| `narrower` *(v3.1)* | Cross-skill specialisation — target is more specific than this skill. Inverse of `broader`; not used to drive co-load (a parent match should not pull in arbitrary children). | string | `skos:narrower` |
| `boundary` *(canonical, ADR 0006)* | Routing-layer score-aware exclusion guard — skills this skill suppresses from co-routing when this skill wins or ties. Not a defer-to-target pointer. | string OR `{skill, reason}` | `sg:disjointOwnership` |
| `disjoint_with` *(v3.1, separate orthogonal relation per ADR 0006)* | Optional formal OWL class-disjointness assertion. Use only when authors genuinely want to claim that no entity can simultaneously be an instance of both classes. Rare; most authors only need `boundary`. | string OR `{skill, reason}` | `owl:disjointWith` |
| `verify_with` | Skills that should be co-loaded for verification or that provide cross-checks | string | `prov:wasInformedBy` |
| `depends_on` | Explicit dependency — this skill requires the target conceptually or operationally | string OR `{skill, min_version}` | `dcterms:requires` |

**Boundary vs disjoint_with — the ADR 0006 split.** ADR 0001 originally proposed renaming `boundary` to `disjoint_with` and treating them as aliases. ADR 0006 reverses that: the two predicates operate at different semantic layers and the schema keeps them distinct.

- `boundary` is a **routing-layer exclusion guard**. When skill A wins a query, skills listed in A's `boundary[]` are excluded from co-routing results (if A outscores them). The field name implies "defer to B" but the mechanic is "exclude B when A wins" — write reason text that reflects ownership ("I own this exclusively over B"), not deference ("use B instead"). Asymmetric; `reason` is strongly recommended; the canonical name for the everyday use case. See the WARNING callout in `SKILL_METADATA_PROTOCOL.md § Relations § boundary`.
- `disjoint_with` is a **formal class-theory** claim. A and B name disjoint conceptual classes; no entity can simultaneously be an instance of both. Maps to OWL `owl:disjointWith` for RDF consumers that reason about class membership. Rare in practice — most skill libraries never need this.

If you are unsure which to use, you want `boundary`. Use `disjoint_with` only when you have an explicit reason to make a formal ontological claim that survives the JSON-LD projection into OWL.

**Glossary.** See `docs/glossary.md § Relation predicates` for the formal definitions of each predicate, including the OntoClean rigidity tags for `extends` (which lives outside `relations` but participates in the same semantic space). The JSON-LD `@context` at `schemas/skill.context.jsonld` projects these predicates to their W3C equivalents for RDF consumers.

**Item shapes in v3.** `boundary`, `disjoint_with`, and `depends_on` accept both the bare-string form (v2-compatible) and the enriched object form (v3 addition). The bare form remains valid — upgrade item-by-item when a reason or version constraint is real.

- `boundary` and `disjoint_with` objects carry a `reason` string. The reason is what makes the relation self-documenting: `"fulfillment owns order state transitions; this skill only reads them"` beats `"fulfillment"` alone.
- `depends_on` objects carry a `min_version` semver constraint. Useful when a skill depends on a specific version of another skill's contract.
- `related`, `broader`, `narrower`, `verify_with` are bare-string only — they carry no additional metadata.

**When to use `broader` vs `extends`.** `extends` is overlay-only (`type: overlay`) and forms a single-parent existential-dependency chain (child ceases to have meaning without parent; ADR 0003). `broader` is cross-skill generalisation that does NOT imply existential dependency or overlay semantics — use it when the target is a more general concept but this skill has its own standalone identity. Example: `react-best-practices` has `broader: [frontend]` because it specialises frontend knowledge, but React-best-practices remains a coherent skill even if the `frontend` skill were deleted.

**Example (v3.1, SKOS-aligned preferred names + ADR 0006 boundary canonical).**
```yaml
relations:
  related:
    - webhook-integration
  broader:
    - integration
  boundary:
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
```

**Example (back-compat — `adjacent` still validates with a deprecation warning).**
```yaml
relations:
  adjacent:                                   # warns: rename to `related`
    - webhook-integration
  boundary:                                   # canonical (no warning per ADR 0006)
    - skill: fulfillment
      reason: "fulfillment owns order state transitions; this skill only reads them"
  verify_with:
    - test-coverage
  depends_on:
    - api-key-management
```

**Example (rare — formal OWL class-disjointness assertion).**
```yaml
relations:
  boundary:                                   # routing-layer (everyday)
    - skill: error-tracking
      reason: "error-tracking owns observability surface; this skill is for prevention"
  disjoint_with:                              # formal class-theory (rare)
    - skill: physical-security
      reason: "Physical-security and information-security are disjoint conceptual classes by design"
```

**When to use.** Populate `related` and `boundary` for any skill that has clearly related or clearly excluded neighbours. Populate `broader` when the target is a more general standalone skill (router uses this for parent recall). Populate `depends_on` when the skill cannot function without another skill's concepts. Populate `verify_with` when a co-loaded skill improves verification quality. Populate `disjoint_with` only for explicit OWL-class-disjointness needs.

**When to use object form.** Use `{skill, reason}` whenever a `boundary` or `disjoint_with` entry's rationale isn't obvious from the skill name alone. Use `{skill, min_version}` when a dependency's contract has versioned — without the constraint, a future update to the target skill can silently break this skill's claims.

**When NOT to use.** Do not use `related` as a dumping ground for loosely related skills — keep it to the 2–4 most meaningful connections. Do not declare the same target under both `adjacent` and `related` (lint warns). Do not fabricate `min_version` values — if you don't know the constraint, omit it. Do not use `disjoint_with` as a more emphatic `boundary`; the OWL semantics are real and reaching for them changes how RDF consumers reason about your skill graph.

---

## `grounding`

**Purpose.** Declares what the skill governs in the real world or codebase, and provides evidence anchors for repo-grounded verification. Required for `scope: codebase` skills.

**Rules.**
- Object with five required sub-fields: `domain_object`, `grounding_mode`, `truth_sources`, `failure_modes`, `evidence_priority`.
- Omit entirely for `scope: portable` and `scope: reference` skills.
- `grounding_mode` must be one of `repo_specific`, `universal`, or `hybrid`.
- `evidence_priority` must be one of `repo_code_first`, `general_knowledge_first`, or `equal`.

**Sub-fields.**

| Sub-field | Type | Meaning |
|---|---|---|
| `domain_object` | string | The real-world or codebase entity this skill governs (e.g., "Shopify integration behavior") |
| `grounding_mode` | enum | How the skill is grounded: `repo_specific` (one codebase), `universal` (language/framework), `hybrid` (both) |
| `truth_sources` | string[] or object[] | Files, docs, URLs, or anchored source slices that are the ground truth for the skill's claims |
| `failure_modes` | string[] | Known ways the skill can produce incorrect guidance if applied incorrectly |
| `evidence_priority` | enum | Whether to trust repo code or general knowledge first when they conflict |

**Example.**
```yaml
grounding:
  domain_object: Shopify integration behavior
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
- String entries remain valid for v3 compatibility and mean "hash/review the whole resource."
- Object entries are preferred for repo-backed skills: `path` is required; `line_range`, `anchor`, and `note` are optional.
- `line_range` hashes only the inclusive source slice after normalizing line endings to LF.
- `anchor` is checked by lint as either a Markdown heading slug or literal text in the file.
- `drift_check.truth_source_hashes` uses the normalized key: `path` for whole-file sources, `path#Lstart-Lend` for line ranges, and `path#anchor` for anchor-only sources.

**When to use.** Required for `scope: codebase`. Strongly recommended for any skill that makes concrete implementation claims, even if `scope` is `portable`.

**When NOT to use.** Portable skills with no specific codebase claims. Omit the entire block rather than populating it with placeholder values.

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

**Purpose.** Pointer to a real-world success/failure feed for this skill. Consumers may use telemetry to corroborate or override the authored `eval_state`. New in v3.

**Why it exists.** `eval_state` is self-reported — an author claims a skill's evals are passing. `runtime_telemetry` is external-reported — a feedback pipeline records actual success/failure rates from agents that ran the skill. Together they close the loop from "did the author claim this works?" to "does this actually work in the field?"

**Rules.**
- Optional object.
- `feedback_source` is required when the block is present. It is a path or URL to a JSONL of run receipts. Each receipt is expected to carry at minimum `{ timestamp, skill, outcome }`.
- `last_updated` records when the block's `metrics` were last refreshed.
- `metrics` is optional summary statistics derived from the feedback source. Consumers may read this pre-computed summary instead of re-parsing the JSONL.

**Sub-fields.**

| Sub-field | Type | Meaning |
|---|---|---|
| `feedback_source` | string | Path or URL to a JSONL of run receipts (required) |
| `last_updated` | string (date) | ISO date of the most recent metrics refresh |
| `metrics.sample_size` | integer (≥0) | Number of recorded runs used for the summary |
| `metrics.success_rate` | number (0–1) | Fraction of runs with a positive outcome |

**Example.**
```yaml
runtime_telemetry:
  feedback_source: "telemetry/skills/shopify.jsonl"
  last_updated: "2026-04-15"
  metrics:
    sample_size: 142
    success_rate: 0.87
```

**When to use.** When a telemetry pipeline actually exists for this skill and produces receipts the router or auditor can consume.

**When NOT to use.** Speculative feedback-source paths that do not yet exist. An empty `feedback_source` is worse than an absent block — it promises data that isn't there.
