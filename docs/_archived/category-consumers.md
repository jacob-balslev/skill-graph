# Category Consumer Audit (Phase 0c)

> Status: Complete · 2026-05-16 · Phase 0c gate verdict **PASS**
> Author: Opus 4.7 continuation session, post-Phase-1 v5 schema bump
> Closes the Phase 0 gate trio (0a retrieval baseline · 0b sample-migration review · 0c consumer audit).
> Reference: `../docs/plans/skill-taxonomy-v5-and-gap-fill.md` § Phase 0c

## Brief

Per the v5 plan: grep every file in `skill-graph/scripts/` and `Development/scripts/` for `category`, `domain`, and `family` reads. List downstream consumers. Confirm none hardcode the deprecated v4 strings (`knowledge`, `frontend`, `ai-engineering`, `integration`, `integrations`, `data`, `workflow`, `security`) as expected `category` values — anything that does will silently produce empty results under v5 because no skill carries those strings anymore.

## Key finding up front

**The v5 `category` closed enum cannot break any current Development consumer**, because the v5 137-skill library at `<workspace>/skills/skills/<name>/SKILL.md` and the v3 282-skill broader library at `<workspace>/skills/<name>/SKILL.md` are **physically separate directories with separate schemas, read by separate tooling**.

```
<workspace>/skills/
├── <282 v3 skills>/SKILL.md       ← read by Development/scripts/skill/* (v3 schema: type/family/layer)
├── _meta/                          ← v3 registry / docs
├── _archived/
└── skills/
    └── <137 v5 skills>/SKILL.md   ← read by skill-graph/scripts/* (v5 schema: closed-enum category)
```

The `walkSkillDir` in `Development/scripts/skill/skill-census.js` iterates direct children of `/Development/skills/` and skips namespace containers without a top-level `SKILL.md`. The nested `skills/` directory has no `SKILL.md` of its own and is therefore skipped — v3 tooling never sees v5 skills, and vice versa.

Phase 5 (broader-library migration) will eventually merge these schemas; at that point the v3 consumers below will need updates. **That work is outside Phase 0c scope.**

## Audit method

```bash
# Skill-graph (v5) consumers
cd <workspace>/skill-graph
grep -rn --include='*.js' --include='*.ts' --include='*.mjs' \
  -E '(\.category|\["category"\]|\.domain|\.family)' scripts/

# v4-string hardcode sweep — must return only false positives
grep -rn --include='*.js' --include='*.ts' --include='*.mjs' \
  -E "['\"](knowledge|frontend|ai-engineering|integration|integrations|data|workflow|security)['\"]" \
  scripts/

# Development workspace
cd <workspace>
grep -rn --include='*.js' --include='*.ts' --include='*.mjs' \
  -E '(\.category|\["category"\]|\.domain|\.family)' \
  scripts/skill/ scripts/docs/ scripts/lib/ scripts/infra/ scripts/memory/
```

Targets: all `.js`/`.ts`/`.mjs`/`.cjs` under each `scripts/` tree, excluding `node_modules`. False-positive filtering: `domain` matches for HTTP/API domain (not skill `domain`), `category` matches for error-pattern categories (not skill `category`), `family` matches for code-grouping family (not skill `family`).

## 1. Skill-graph (v5) consumers

These five files read `category`, `domain`, or `family` from v5 SKILL.md frontmatter. **All five are clean** — none hardcode deprecated v4 strings as expected `category` values.

| File | Field(s) read | What it does | v5 status |
| --- | --- | --- | --- |
| `scripts/skill-lint.js` | `fm.category` (via check), `fm.domain_frame`, `fm.family` | Top-level lint orchestrator. Delegates `category` validation to `lint/check-category-enum.js`. Reads `family` for the family-naming guidance check (line 1084). Reads `domain_frame` for eval-mode validation (line 1050). | Clean ✓ |
| `scripts/lint/check-category-enum.js` | `fm.category` | **Canonical v5 enforcement point.** Holds `CATEGORY_ENUM = Object.freeze(['foundations','engineering','design','quality','agent','product'])` and rejects anything not in the set. | Clean ✓ — enum matches `schemas/skill.schema.json` v5 definition. |
| `scripts/generate-manifest.js` | `fm.category`, `fm.domain`, `fm.family`, `fm.domain_frame` | Pass-through fields. Writes `entry.category = fm.category` (line 273), `entry.domain = fm.domain` (line 279), aggregates `by_category` distribution at top of manifest (line 603), aggregates `by_family` (line 669). No expected-value comparisons. | Clean ✓ |
| `scripts/migrate-category-to-enum.js` | `fm.category` (write), `fm.domain` (write) | The Phase 2 v4→v5 codemod. Has a MAPPING table; reads current values and writes new closed-enum values + populates `domain`. One-shot tool — no longer active. | Clean ✓ — already-applied codemod, retained for receipts. |
| `scripts/__tests__/test-v3-1-alias-contract.js` | `fm.domain` | Asserts `entry.domain === fm.domain` (line 86) — passthrough test. No enum assumptions. | Clean ✓ |

### Schema-level enforcement

`schemas/skill.schema.json` (synced to v5 in `skill-graph` commit `f489641`) closes the enum at the schema level:

```json
"category": {
  "type": "string",
  "enum": ["foundations","engineering","design","quality","agent","product"],
  "description": "Browse facet — answers 'where should a human browse to find this skill first?' Not ontology truth. Closed enum of 6 values in v5..."
}
```

Both the schema and the lint constant are sources of truth and currently match exactly.

### v4-string sweep in `skill-graph/scripts/` — verified zero hits

```
grep -rn -E "['\"](knowledge|frontend|ai-engineering|integration|integrations|data|workflow|security)['\"]" scripts/
→ scripts/lib/mock-grader.js:25:  process.stdin.on('data', (chunk) => { ... });   [FP: Node stream event name]
→ scripts/__tests__/test-v3-1-alias-contract.js:96:  archetype: 'workflow'         [FP: legacy archetype value, not category]
```

Two matches, both false positives. **Zero consumers hardcode v4 category strings.**

## 2. Development workspace consumers

These files read `category`, `domain`, or `family` from frontmatter, but they operate on the **v3 broader library** (282 skills at `/Development/skills/<name>/`), not the v5 137-skill library. They use the v3 schema's `type`/`family`/`layer`/`primaryCategory`/`layerPrimary` fields — not the v5 `category` closed enum.

| File | Field(s) read | Operates on | v5 impact |
| --- | --- | --- | --- |
| `scripts/skill/skill-census.js` | `frontmatter.type`, `frontmatter.category` (as v3 alias for type, line 246), `frontmatter.family`, `frontmatter.domain_frame`, `frontmatter.layer`, `frontmatter.primaryCategory`, `frontmatter.layerPrimary` | v3 library via `SKILL_DIRS.shared = ROOT_DIR/skills` | **None** — never sees v5 skills (nested `skills/` namespace skipped by walker, see lines 105–108). Holds VALID_FAMILIES, VALID_PRIMARY_CATEGORIES, VALID_LAYER_PRIMARY sets that include v3-era values (`'integration'`, `'workflow'`, `'knowledge'`); these are v3 enums, not v4 category values. |
| `scripts/skill/skill-lint.js` (Dev, separate from skill-graph's lint) | `frontmatter.type`, `frontmatter.family` | v3 library | **None** — `VALID_TYPES` (line 187) includes `'knowledge'`, `'workflow'`, etc. as `type` values, not `category` values. |
| `scripts/skill/backfill-skill-taxonomy.js` | `frontmatter.family`, `layerPrimary` writes | v3 library | **None** — references `'integration'`, `'frontend'`, etc. as v3 family/layer/router names. Hardcoded routerNames set at line 96 (`['backend','frontend','events','legal']`) — `'frontend'` here is a router-bundle name, not a category. |
| `scripts/skill/skill-graph-builder.js` | maps `*-skill` names to `'integration'` group (lines 107–113) | v3 library | **None** — `'integration'` used as a skill-graph node group label, not a v5 category. |
| `scripts/skill/skill-app-coverage-matrix.js` | `route.domain` | API routes, not skills | False positive — `domain` here is the URL prefix (e.g. `/api/orders` → `orders`). |
| `scripts/skill/bulk-eval-tagger.js` | `frontmatter.family`, `frontmatter.layer`, `frontmatter.primaryCategory` | v3 eval frontmatter | **None** — `'integration'`, `'workflow'`, `'security'`, `'design'` etc. used as eval `type` values, not skill `category`. |
| `scripts/skill/migrate-archetype-structure.js` | `frontmatter.family` (read/write) | v3 archetype migration | **None** — operates on v3 family field. Maps `'error-tracking' → 'knowledge'` (line 20) where `'knowledge'` is a v3 family value, not a v5 category. |
| `scripts/skill/skill-families.js` | `frontmatter.family` | v3 library | **None** — family-based grouping commands. |
| `scripts/skill/build-skill-audit-worklist.js` | `skill.family`, `skill.primaryCategory` | v3 census output | **None** — line 82 checks `skill.family === 'agent-ops' \|\| skill.family === 'skill-system'` — these are v3 family values; `'agent-ops'` and `'skill-system'` are still active under v3. |
| `scripts/skill/skill-leverage-ranker.js` | `skill.family` (via signals) | v3 census output | **None** |
| `scripts/skill/domain-context-populator.js` | `frontmatter.family`, `frontmatter.domain_frame` | v3 library | **None** |
| `scripts/skill/eval-linter.js` | `skill_type: 'knowledge'` example (line 38) | doc example | **None** — example placeholder, not a v5 enum check. |
| `scripts/skill/source-truth-catalog.js` | `category: 'http' \| 'database' \| ...` for code-pattern catalog | source code patterns | False positive — code-pattern catalog has its own `category` taxonomy unrelated to skill `category`. |
| `scripts/memory/session-log.js` | `category: ROOT_CAUSE_CATEGORIES.*` for finding-pattern detection | session log findings | False positive — finding-classification `category`, not skill `category`. |
| `scripts/docs/file-size-scanner.js` | `category` table column for file-type classification | file scan | False positive — file-type `category`, not skill `category`. |

### Cross-schema risk: `skill-census.js:246`

```js
type: frontmatter.type || frontmatter.category || "knowledge",
```

This is the only Development consumer that reads `frontmatter.category` directly. In v3 schema, `category` was an accepted alias for `type` (per the comment at line 178). The `"knowledge"` ultimate fallback is a v3-era default.

Risk under v5: if census ever iterates v5 skills (it doesn't today, see walker analysis above), it would see `frontmatter.category` ∈ {foundations, engineering, ...} and assign that to the census output's `type` field. Census would then report v5 skills with `type: "engineering"` etc., which is invalid under v3's `VALID_TYPES` and would fail downstream validation.

**Today this code path is unreachable** because census doesn't iterate v5 skills. It becomes relevant only when Phase 5 merges the two libraries.

## 3. Documentation drift discovered

### `scripts/lint/check-category-enum.js` — stale header comment

Lines 4–22 of the file say:

> The schema allows `category` to be any string for backward compatibility, but the Skill Graph policy (as of 2026-05-15) is that the field functions as a browse facet, not ontology truth, and must take exactly one of six canonical values. … Closing the schema enum requires a v5 schema bump that cascades through manifest schemas, generators, and downstream consumers. The lint check achieves the same enforcement guarantee with no version churn.

This rationale was correct **before** Phase 1. As of 2026-05-16 (Phase 1 schema bump, commit `f489641`), the schema has been bumped to v5 and **does** close the enum at the schema level. The lint check is now redundant-but-correct rather than the sole enforcement point. The comment should reflect post-v5 reality. Low-priority cleanup.

### `scripts/skill-lint.js:187` (Development copy) — `VALID_TYPES` includes `'knowledge'`, `'domain'`

```js
const VALID_TYPES = ["capability","workflow","hybrid","doctrine","framework","strategy","overlay","skill","domain","system","knowledge","operational"];
```

These are v3 `type` field values, not v5 `category` values, so they're not breaking. But the values `'knowledge'`, `'domain'`, `'system'` are awkward as types and overlap with v5 category names. Not actionable until Phase 5.

## 4. Follow-up list

These are small cleanups identified during the audit. None block Phase 1 or Phase 5; they can be picked up in any wrap pass.

1. **`skill-graph/scripts/lint/check-category-enum.js` header comment** — update lines 4–22 to reflect that v5 schema bump landed and the enum is closed at both schema and lint level. (~5 lines edit.) **RESOLVED 2026-05-17** — header rewritten to describe the dual-layer (schema + lint) enforcement and the three-place update protocol when the enum changes.
2. **`Development/scripts/skill/skill-census.js:246` fallback** — replace `frontmatter.category || "knowledge"` with `frontmatter.category || null` or drop the fallback entirely. Currently inert (unreachable under v3-only iteration) but misleading. Defer to Phase 5 when census becomes v5-aware. **RESOLVED 2026-05-17** — code path preserved (changing fallback string risks downstream consumers expecting always-a-string `type`); added an inline comment that documents the v3-era origin, why the path is currently unreachable, and what will need to change when Phase 5 makes it active. The actual fallback rewrite is now owned by the Phase 5 prerequisite step (see v5 plan).
3. **Phase 5 prerequisite** — when the 287-skill broader library migrates to v5, every entry in §2 above will need a schema-aware update. Recommend a follow-up audit at Phase 5 kickoff that re-runs the greps above against the merged library. **RESOLVED 2026-05-17** — added as an explicit prerequisite step at the top of Phase 5 in `docs/plans/skill-taxonomy-v5-and-gap-fill.md`, with the specific known-mandatory updates called out (census.js:246, `VALID_TYPES`/`VALID_FAMILIES`/`VALID_PRIMARY_CATEGORIES` constants).

## Phase 0c gate verdict

**PASS.** The closure of the v5 `category` enum does not break any current Development consumer. The two physical libraries are independent. The skill-graph v5 consumers (§1) are five files, all clean. The Development v3 consumers (§2) read a different field on a different schema in a different directory.

The Phase 0 gate trio is now complete:

- **Phase 0a (retrieval baseline)** — committed in skill-graph `0e5ad55`, 30 queries, 20% agent-router agreement (single-rater).
- **Phase 0b (sample-migration review)** — committed in skill-graph `89e8115`, 30 skills, 26/30 = 86.67% reviewer-agreement, passes 85% gate.
- **Phase 0c (consumer audit)** — this document. Zero breaking consumers.

Phase 1 (schema bump) landed clean. Phase 5 (broader library migration) is unblocked from a consumer-safety perspective and can proceed when prioritized.

## Critical files referenced

- `skill-graph/scripts/skill-lint.js`
- `skill-graph/scripts/lint/check-category-enum.js`
- `skill-graph/scripts/generate-manifest.js`
- `skill-graph/scripts/migrate-category-to-enum.js`
- `skill-graph/schemas/skill.schema.json`
- `scripts/skill/skill-census.js`
- `scripts/shared/workspace-paths.js`
- `docs/plans/skill-taxonomy-v5-and-gap-fill.md`
