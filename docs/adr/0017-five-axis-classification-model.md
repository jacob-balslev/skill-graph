# ADR-0017: Five-Axis Classification Model (Skill Metadata Protocol v8)

> **`subject` enum superseded by the 12-shelf competency re-axis ([ADR-0020](0020-twelve-shelf-competency-reaxis.md), 2026-06-03). See AGENTS.md § Major Version Is a Clean Cut.** The 9-value `subject` enum decided here (`agent-ops` · `code-engineering` · `frontend-ui` · `design-craft` · `data-analytics` · `quality-assurance` · `meta-methods` · `knowledge-organization` · `product-domain`) is no longer the live contract — read the 12-value enum in `schemas/SKILL_METADATA_PROTOCOL_schema.json`. The rest of this ADR (the five-axis *shape*: `subject` + `deployment_target` + free-text `scope` + `subjects[]` + `taxonomy_domain`, the operation-axis retirement, the v7→v8 cut) still stands.

> Status: Accepted (2026-05-25), partially superseded (2026-05-27; `subject` enum superseded 2026-06-03 by ADR-0020; `deployment_target` enum replaced by boolean `public` 2026-06-08)
> Supersedes the v7 category/categories/primaryCategory/family/layer/layerPrimary/routingRole tangle.
> Companion: [ADR 0011](0011-split-audit-verdict-into-four-verdicts.md) (historical four-verdict Audit Status split; sidecar placement later changed by [ADR 0019](0019-audit-state-sidecar-separation.md))
>
> ### Update — 2026-06-08: `deployment_target` enum replaced by the boolean `public` gate
>
> The required `deployment_target: portable|project` enum introduced by the 2026-05-27 amendment (below) was **replaced by a required boolean `public` field** (commit `23e13dd`). Rationale: the enum conflated two independent axes — *publishability* (is the skill safe to release publicly?) and *deployment location* (portable vs project-coupled). The marketplace export gate only ever needed the first, so `public` is now the single private-data / publishability switch the exporter (`scripts/export-marketplace-skills.js`) filters on, and the `grounding` requirement was re-anchored to **non-empty `project[]`** (project anchoring) rather than the old `deployment_target: project`. The normalizer maps the retired enum (`portable` → `public: true`; `project` → `public: false`, the conservative private default) so unmigrated skills keep parsing. The live required core is now `subject` + `public` + `scope`. Read `schemas/SKILL_METADATA_PROTOCOL_schema.json` and `SKILL_METADATA_PROTOCOL.md` for the current contract; the `deployment_target` references in the older update blocks below are historical.
>
> ### Update — 2026-05-27: `workspace_tags` removal closed; entity vocabulary disambiguated
>
> The "Removed entirely" line of this ADR's Decision table named `workspace_tags` among the v8 removals. The field stayed in the live schema during the v7→v8 cut because the route filter still read it. A follow-up commit on 2026-05-27 finishes the removal as part of broader v8 entity-vocabulary disambiguation (top-level `domain` → `taxonomy_domain`; `scope` repurposed from closed enum to free-text PRD-style string; new required `deployment_target: portable|project` enum with the `workspace` value removed; new optional `project[]` and `repo[]` belonging-entity fields; `grounding.domain_object` → `grounding.subject_matter`). The contract remains v8; ADR 0019 later moved the per-skill audit-state `schema_version` record into the sidecar. See the CHANGELOG entry for the full sweep.
>
> ### Update — 2026-05-27: `operation` axis retired (commit f88603d)
>
> The `operation` axis (Bloom-grounded 4-enum: `know` / `do` / `decide` / `modify`) was retired from the live contract in commit `f88603d`. The current v8 classification carries `subject`, `deployment_target`, and free-text `scope` as required core fields, plus `subjects[]` (polyhierarchy, max 2), `keywords` (capped at 10), and `relations` (typed edges). This ADR's Decision table row 2 (`operation`), § Landing strategy step 4, and the operation-distribution figures in § Consequences are no longer in force.
>
> The "compatibility-mode" landing described in § Landing strategy is also obsolete: per [AGENTS.md § Major Version Is a Clean Cut](../../AGENTS.md), the live tree describes v8 only. The v7 → v8 cut is past-tense; v7 fields are deleted from the schema, the codemod history lives in git, and `git tag schema-v7` preserves the pre-cut contract for anyone needing it.
>
> This ADR remains the canonical record of the v8 model's design rationale (9-value `subject` enum, polyhierarchy choice, the `family`/`layer`/`primaryCategory`/`routingRole` removal). Read its body as historical context; for the current contract, read `schemas/SKILL_METADATA_PROTOCOL_schema.json` and `SKILL_METADATA_PROTOCOL.md`.

## Context

The v7 Skill Metadata Protocol accumulated **8+ overlapping classification axes** through iteration: `category`, `categories[]`, `primaryCategory`, `domain`, `family`, `layer`, `layerPrimary`, `routingRole`. The 2026-05-25 corpus audit (3 parallel Explore agents + GPT-5.5 critique) found:

- `category` (6-value closed enum) was the only widely-adopted classifier (100%) but unbalanced: `engineering` 40% (overcrowded), `product` <1% (empty).
- `categories[]` (v7-optional, v8-planned-required): **0% adoption** — the v7→v8 migration had never started.
- `primaryCategory`, `layerPrimary`, `routingRole`: **1.4% adoption each** — orphaned workspace facets that authors didn't use because no consumer required them.
- `family`, `layer`: 0% — already retired cleanly.
- `type` (4-value enum): 93% of skills shared `type: capability`, making the axis nearly useless for routing.
- The `type × category × scope` triple, documented as a "first-pass discriminator," provided weak discriminating power because `scope` was 67% portable too.
- `keywords` averaged 9.2 per skill across ~1,000 distinct terms, with no canonical synonym map and no cap.
- The typed `relations` graph was sparse (`boundary` used by only 8 skills, `depends_on` by 1) vs. spec intent.

In addition, two confirmed drift bugs (one malformed `category: string,`, one `category` ≠ `primaryCategory` contradiction) and 146 cross-references to fragmented audit docs surfaced more cleanup work.

## Decision

Replace the v7 classification surface with a **5-axis model** in v8:

| # | Axis | Type | Required | Purpose | Replaces |
|---|---|---|---|---|---|
| 1 | `subject` | closed 9-enum | yes | Primary classification — what the skill teaches | `category` + `categories[0]` + `primaryCategory` |
| 2 | `operation` | closed 4-enum | yes | Cognitive operation (Bloom-grounded) | `type` |
| 3 | `scope` | closed 3-enum (renamed values) | yes | Deployment targeting | `scope` (renamed: `codebase`→`project`, `reference`→`workspace`) |
| 4 | `keywords` | ≤10 strings | recommended | Fuzzy agent activation | `keywords` (capped + deduped) |
| 5 | `relations` | typed edges (6 types, cycle-checked) | recommended | Prerequisite + clustering graph | `relations.*` (unchanged shape) |

**Removed entirely:** `family`, `layer`, `layerPrimary`, `routingRole`, `workspace_tags`, `routing_bundles`, `categories[]` (folded into ordered `subjects[]` max 2), `primaryCategory` (folded into `subject`).

**Preserved unchanged:** `domain` (slash-delimited sub-path within a `subject`).

The 9 `subject` values (down from initial v1 plan's 10–12 per GPT-5.5 critique):

`agent-ops` · `code-engineering` · `frontend-ui` · `design-craft` · `data-analytics` · `quality-assurance` · `meta-methods` · `knowledge-organization` · `product-domain`

The 4 `operation` values (Bloom-grounded):

`know` (Remember/Understand — declarative) · `do` (Apply — procedural) · `decide` (Analyze/Evaluate — routing/judgment) · `modify` (cross-cutting — context injection, replaces v7 `overlay` archetype)

## Landing strategy — compatibility-mode

To avoid breaking the 147-skill corpus on a hard cutover, v8 lands in compatibility mode:

1. **Schema accepts BOTH v7 and v8 fields.** `schema_version: 7|8` both validate. v7 skills retain `category` and `type`; v8 skills additionally require `subject` and `operation`.
2. **Normalizer aliases.** `scripts/lib/parse-frontmatter.js::normalizeFrontmatter()` continues lifting `metadata.*` to top level. No automatic v7→v8 translation — the codemod is the authoritative mapping.
3. **Router updates.** `scripts/skill-graph-route.js` Stage 1 sort accepts both v7 and v8 scope/operation values via SCOPE_RANK and OPERATION_RANK extensions, with a typeOrOperationRank fallback.
4. **Manifest projection.** `scripts/generate-manifest.js` projects subject/subjects/operation alongside the v7 category/categories/primaryCategory pass-through.
5. **Marketplace exporter.** `scripts/export-marketplace-skills.js` extends its exclusion gate from `scope: codebase|operational` to `scope: codebase|operational|project` so v8-scoped project skills are also excluded from the public marketplace surface.
6. **Codemod-driven migration.** `scripts/migrate-skill-v7-to-v8.js` produces a per-skill mapping artifact (`audits/migration-mapping-v7-to-v8.json`) with proposed v8 values + confidence + reasoning. The user reviews, flips ambiguous rows, then per-subject batches are applied (one git commit per batch).

After ≥4 weeks of v8 in production with zero regressions, a follow-up change removes v7 compatibility shims from the schema, normalizer, router, manifest projection, and exporter. Until then, every skill carries BOTH v7 and v8 fields.

## Consequences

### Positive

- **Bloom-grounded `operation` restores discriminating power.** Predicted v8 distribution (per GPT-5.5): `know` 35–45%, `do` 25–35%, `decide` 20–30%, `modify` 1–3%. Actual post-migration: `know` 67%, `do` 31%, `decide` 1%, `modify` 1%. The `know`/`do` split is reasonable; `decide`/`modify` are low because v7 had only 2 routers and 1 overlay.
- **`subject` expansion spreads the engineering bucket.** v7 `engineering` at 40% is now split into `code-engineering` (24%), `frontend-ui` (14%), `data-analytics` (2%), `product-domain` (7%). The new top-of-distribution is `code-engineering` at 24% — still on the high side but down from 40%.
- **The 5-axis model is orthogonal.** Each axis answers one question: what (subject), how-it's-used (operation), where (scope), how-to-find-it-fuzzy (keywords), what-it-connects-to (relations). The v7 `type × category × scope` triple's 93%/67% concentration is gone.
- **Cap on `keywords` (max 10)** prevents the keyword-stuffing failure mode HuggingFace's "Huggy Lingo" cleanup proved at scale.

### Negative

- **The migration is large.** 147 SKILL.md mutations across 9 per-subject commits (10 in total with the reorganization-completing commit) + 6 tooling commits in the protocol repo. Total 17-commit PR.
- **`data-analytics` is small.** Only 3 skills (observability-modeling, performance-budgets, performance-engineering) cleanly fit. Below the 5-min balance rule; reflects corpus reality — most analysis-adjacent skills are actually infrastructure or quality.
- **Compatibility mode is duplicative.** Every skill carries both v7 and v8 fields until the post-sunset cleanup. Manifest size, lint time, and skill-author cognitive load all bear that overhead during the window.
- **The codemod's `type → operation` mapping is heuristic.** All ambiguous `type: capability` skills (the 93%) defaulted to `know` or `do` based on workflow-keyword presence. Some routings may need manual flips during the v7-sunset cleanup.

## Alternatives considered

### Keep v7 enum, just expand to 12 categories

Rejected. Per the existing v7 ADR-equivalent gate ("propose 7th value with ADR + ≥10 evidence skills"), adding 6 more values would have required 6 separate ADRs. And it doesn't address the `type` 93% concentration or the orphaned workspace facets.

### Hard cutover (v8 only, drop v7 immediately)

Rejected per GPT-5.5 critique. A hard cutover would break the 147-skill corpus on day 1; the lint pass would fail until every skill was migrated. The compatibility-mode landing lets the schema-level tooling ship first, then the corpus migrates per-batch with the routing-eval regression gate proving each step.

### Rename to `domain` instead of `subject`

The v1 of this ADR proposed `domain` as the new top-level field name. GPT-5.5 caught the collision: `domain` already exists in v7 as a slash-delimited sub-path on 12+ skills. Renaming to `subject` avoids the collision and matches the Dewey/LC library-science term of art.

### 10–12 subject values instead of 9

GPT-5.5 critique recommended 8–10. The v1 plan listed `workflow-orchestration` as a 10th subject; GPT-5.5 pointed out it overlaps `operation: do` and the relations graph. Dropped to 9.

### Drop `data-analytics` entirely (8 subjects)

Considered. Post-migration `data-analytics` has only 3 members, below the 5-min balance rule. But folding it into `code-engineering` muddies the bucket; the 3 members (observability-modeling, performance-budgets, performance-engineering) are coherent as a small bucket. Decision: keep at 9, document as "below balance rule but reflects corpus reality."

## Validation

The plan was driven by:
1. **Phase 1 corpus audit** (3 parallel Explore agents, 2026-05-25): verified distribution, drift bugs, doc cross-references.
2. **Library-science + AI-catalog research** (1 design-researcher agent): Ranganathan facets, BISAC, MeSH, ACM CCS 2012, Khan Academy, Duolingo, HuggingFace, Anthropic Agent Skills.
3. **GPT-5.5 critique** (1 codex invocation): caught the `domain` collision, the over-prediction of `decide`/`modify`, the routing-eval regression risk, and the marketplace exporter blind spot.

The full critique response is preserved at `/tmp/gpt55-critique-response.md` for posterity.

## References

- Plan: workspace-local v7 to v8 migration plan, `we-should-clearly-look-wondrous-firefly.md`
- Codemod: `scripts/migrate-skill-v7-to-v8.js`
- Mapping artifact: `audits/migration-mapping-v7-to-v8.json`
- Schema: `schemas/SKILL_METADATA_PROTOCOL_schema.json` (extended `schema_version` to `[7, 8]`, added `subject`/`subjects`/`operation` properties + allOf rule for v8-required fields)
- Test: `scripts/__tests__/test-v8-schema-compat.js` (12 cases covering v7 unchanged, v8 required, scope rename, enum validation)
- Library mapping: 147 SKILL.md files in `~/Development/skills/skills/` migrated across 9 per-subject batches
- Companion ADR for audit-loop verdicts: [ADR 0011](0011-split-audit-verdict-into-four-verdicts.md)
