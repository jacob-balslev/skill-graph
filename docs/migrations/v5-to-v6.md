# Migration: schema_version 5 → 6

> **Status:** Active. Created 2026-05-17.
> **Additive structural change.** v6 promotes the nested `concept` block to flat top-level fields and adds the Health Block (audit-loop-written fields). The v5 nested `concept` shape remains accepted in v6 for v5 skills not yet migrated; the schema `anyOf` rule lets the comprehension-state requirement be satisfied by either shape. No values are removed, no fields are renamed, no requirements are tightened against existing v5 skills.
> **Plan:** `docs/plans/skill-audit-loop-simplification.md` (in the Development workspace) — outer frame and design rationale.
> **Tier C″ codification:** the cross-domain `relations.boundary[]` doctrine, codified after empirical 30-query baseline sweep on 2026-05-17. See § Cross-Domain Boundary Doctrine below.

## What changed

### 1. The seven-field `concept` block is flattened to top-level fields

v5's nested `concept` block:

```yaml
metadata:
  comprehension_state: present
  concept:
    definition: "..."
    mental_model: "..."
    purpose: "..."
    boundary: "..."
    taxonomy: "..."
    analogy: "..."
    misconception: "..."
```

v6's flat shape:

```yaml
comprehension_state: present
mental_model: "..."   # primitives and their relationships
purpose: "..."        # the problem this concept solves
boundary: "..."       # what this concept is NOT (mechanism, not label)
analogy: "..."        # one-sentence metaphor
misconception: "..."  # wrong mental model people bring
```

The two retired sub-fields:

| v5 sub-field | v6 home | Why retired |
|---|---|---|
| `concept.definition` | `description` | The v5 `description` is the routing contract — first-person prose explaining what the skill covers. v6 keeps it as the routing contract AND promotes it to also carry the concept definition. There is no separate "the concept *is* …" surface needed; the routing contract subsumes it. |
| `concept.taxonomy` | `category` + `relations.broader` | Taxonomy = "where does this sit relative to neighbors?" `category` answers the browse-shelf question; `relations.broader` answers the cross-skill generalization question. The two together encode what `concept.taxonomy` was for. |

The body section `## Concept Card` is also retired. The flat frontmatter fields are now the canonical location — no in-body teaching block.

**Why flat?** The nested `concept` block was an iteration, not the goal. Every other authored teaching field on a skill is flat. Nesting just one set under `concept.*` made authors learn a special access pattern, made schema readers walk an extra level, and made the comprehension grader synthesize information from two locations (the body's `## Concept Card` section AND the frontmatter `concept` object) that should have been one.

### 2. The Health Block — seven flat fields recording the audit fingerprint

v6 adds seven flat top-level fields that record a skill's audit state directly in its frontmatter, replacing the v5 model of scattered log files (`eval-history.jsonl`, `routing-misses.jsonl`, `.opencode/progress/skill-audit-*`, `health-ledger.jsonl`, `findings/*.md` — five places to know one skill's status):

```yaml
# Health Block (written by the audit loop — do not hand-author)
last_audited: 2026-05-17                       # ISO date `audit` last ran
last_changed: 2026-05-15                       # ISO date the skill was last edited
audit_verdict: PASS                            # PASS | PASS_WITH_FIXES | PARTIAL | FAIL | UNKNOWN
eval_score: 4.2                                # 0.0–5.0 latest aggregate eval grade
eval_failed_ids: []                            # failing eval IDs (empty when clean)
lint_verdict: PASS                             # PASS | FAIL | UNKNOWN
drift_status: OK                               # OK | DRIFT | BROKEN | STALE | NO_BASELINE | EXTERNAL_UNHASHED | UNKNOWN
```

**Authorship rule:** these fields are stamped by `scripts/skill/skill-audit.js`, `scripts/skill/evaluate-skill.js`, and `scripts/skill-graph-drift.js`. Do not hand-author them — the next `audit` run will overwrite hand-edits with the loop's authoritative values.

**Loop reads, log writes retire after one corpus walk.** During the v5→v6 migration window, the audit-loop scripts write to both the flat Health Block fields AND the legacy log files. After one full corpus walk, the log writes are retired and the flat fields are the single source of truth.

### 3. `comprehension_state: present` accepts either shape

The v6 schema's `allOf` rule that enforces `comprehension_state: present` was:

```json
// v5
"then": { "required": ["concept"] }
```

In v6 it becomes:

```json
// v6
"then": {
  "anyOf": [
    { "required": ["mental_model", "purpose", "boundary", "analogy", "misconception"] },
    { "required": ["concept"] }
  ]
}
```

The author can satisfy the requirement by populating the five flat fields (preferred), the nested `concept` block (v5 back-compat), or both (flat fields win when both are present).

### 4. Cross-Domain Boundary Doctrine — codified

`relations.boundary[]` is a Skill-Graph-specific routing-layer predicate, NOT formal class disjointness. Its runtime semantic was discovered empirically during the Wave 6 routing-tuning work and is codified in v6:

**Runtime mechanic:** `if (target.score >= declarer.score) skip target` — the declarer can exclude the target *only when the declarer is currently outscoring it on the query*. This INVERTS the surface reading "I am NOT B; defer to B" — boundary entries protect the declarer's wins, not the target's wins. Source: `skill-graph/scripts/skill-graph-route.js:548`.

**Doctrine — SAME-DOMAIN ONLY:**

1. `boundary[]` entries should declare same-domain handoffs only (same `category` AND same `domain` sub-tree). Example: `engineering/frontend` ↔ `engineering/frontend` is fine.
2. Cross-category or cross-sub-domain handoffs belong in `anti_examples` + `relations.related`, NOT in `boundary[]`. The `anti_examples` array preserves routing-visible documentation as wrong-use phrases; `relations.related` signals the semantic adjacency without invoking the score-aware exclusion mechanic.
3. Empirical justification (Tier C″ sweep, 2026-05-17): removing 16 cross-domain `boundary[]` entries across 8 Wave 6 skills caused **0 top-1 routing changes** on the 30-query baseline; only 3/30 low-confidence unmaskings of legitimate alternatives at score 3 surfaced. The cross-domain entries were performing silent low-confidence exclusion only — exactly the silent-failure risk the doctrine prevents.

**Author rule:** if you would write a `boundary[]` entry whose target lives in a different `category` or different `domain` sub-tree than the declarer, move the entry to `anti_examples` (wrong-use phrase, routing-visible) + `relations.related` (semantic adjacency signal). Lint (planned, not yet implemented) will warn on cross-domain boundary declarations.

## Migration procedure for skill authors

For every SKILL.md with `comprehension_state: present`:

### Required edits

1. Change the schema_version field:

   ```yaml
   # Before (v5)
   metadata:
     schema_version: "5"

   # After (v6)
   metadata:
     schema_version: "6"
   ```

2. Populate the five flat Understanding fields with real content (not pipe-empty placeholders):

   ```yaml
   # Before (v5 — nested with placeholders)
   metadata:
     concept:
       definition: "<populated text>"
       mental_model: "|"   # placeholder — fails comprehension grader
       purpose: "|"
       boundary: "|"
       taxonomy: "|"
       analogy: "|"
       misconception: "|"

   # After (v6 — flat with real content)
   mental_model: "Skill metadata defines the routing contract, classification, health state, and grounding evidence each SKILL.md carries. The schema validator checks the shape; the lint pass checks the semantics; the manifest generator emits the consumer-readable aggregate."
   purpose: "Without machine-readable metadata, agents cannot route to the right skill, verify a skill's claims against repo truth, or detect when a skill goes stale. The Protocol replaces the prior model of in-prose-only skills with structured signals every consumer can parse."
   boundary: "The Protocol is NOT a content authoring style guide (use the skill-scaffold archetype contract for that). It is also NOT a routing algorithm (use skill-graph-route.js for that). The Protocol defines what every skill MUST declare; the algorithm decides which skill activates."
   analogy: "The Protocol is to skills what package.json is to npm packages: a structured manifest every consumer reads to know what the artifact claims to do, how to verify it, and how to depend on it."
   misconception: "Authors often think the Protocol is bureaucratic overhead. The reality is the opposite: without the Protocol's structured fields, agents must scan free-form prose to make routing decisions — costing tokens and producing inconsistent results. The Protocol is a compression scheme for relevance."
   ```

3. (Optional) Remove the nested `concept` block once the flat fields are populated. The schema accepts both during migration; removing `concept` removes a deprecated indirection.

### Conditional edits

| If your skill has... | Then... |
|---|---|
| `comprehension_state: present` AND nested `concept` with pipe-empty (`"\|"`) placeholders | Populate the five flat fields with real content. Pipe-empty placeholders fail the comprehension grader. |
| `comprehension_state: present` AND fully-populated nested `concept` | Optional: migrate to flat fields for v6 alignment. Both shapes validate against the v6 schema during the migration window. |
| `relations.boundary[]` entries pointing to skills in a *different* `category` or `domain` sub-tree | Move those entries to `anti_examples` (wrong-use phrase, routing-visible) + `relations.related` (semantic adjacency signal). |
| No comprehension grading declared (`comprehension_state: absent` or omitted) | Bump `schema_version` to 6 and skip the Understanding-fields edit — they're not required without `comprehension_state: present`. |

### Codemod available

```bash
# 1. Bulk-bump schema_version in all SKILL.md files
cd /Users/jacobbalslev/Development/skills
find skills -name SKILL.md -exec sed -i '' 's/schema_version: "5"/schema_version: "6"/g' {} +

# 2. (Planned) Backfill the flat Understanding fields from the nested concept block
node scripts/migrate-skill-v5-to-v6.js --backfill --dry-run
# Review the diff, then:
node scripts/migrate-skill-v5-to-v6.js --backfill --apply

# 3. Verify lint baseline against the new schema
cd /Users/jacobbalslev/Development/skill-graph
SKILL_GRAPH_WORKSPACE=/Users/jacobbalslev/Development/skills node scripts/skill-lint.js
```

The `--backfill` codemod is the v6 equivalent of the v3→v4 migrate script. It reads the nested `concept` sub-fields and writes them to the flat top-level fields. Where sub-fields are pipe-empty placeholders, the codemod leaves the flat field unpopulated for human authorship (the comprehension grader will then surface the gap on the next eval run).

## Backward compatibility

| Direction | Compatible? | Note |
|---|---|---|
| v5 tool reads v6 SKILL.md | ⚠ Partial | v5 schema's `additionalProperties: false` rejects the new flat fields (`mental_model`, `purpose`, `boundary`, `analogy`, `misconception`, `last_audited`, `last_changed`, `audit_verdict`, `eval_score`, `eval_failed_ids`, `lint_verdict`, `drift_status`). Use `normalizeFrontmatter()` from `skill-graph/scripts/lib/parse-frontmatter.js` for forward-compat reads. |
| v6 tool reads v5 SKILL.md | ✓ via `anyOf` | The v6 schema's `comprehension_state: present` allOf rule accepts either shape (nested `concept` OR flat Understanding fields), so v5 skills with populated `concept` blocks pass v6 validation unchanged. |
| Mixed v5 / v6 corpus | ✓ During migration | The `anyOf` rule and the deprecated-but-accepted `concept` field allow a corpus to migrate one skill at a time. Author convention: bump `schema_version` to `6` only after the flat Understanding fields are populated. |

**Recommendation:** apply the migration in batches grouped by `comprehension_state` value. Skills with `comprehension_state: absent` (no Understanding fields needed) can be bumped to v6 in a single sweep; skills with `comprehension_state: present` need per-skill authoring of the flat fields and should land in smaller PRs.

## Verification checklist

After running the v5→v6 migration:

- [ ] Every SKILL.md has `schema_version: "6"`
- [ ] Every skill with `comprehension_state: present` has either the five flat Understanding fields OR the nested `concept` block (verified by v6 schema validation)
- [ ] Every skill with `comprehension_state: present` and populated flat fields has no pipe-empty (`"|"`) placeholder strings
- [ ] No `relations.boundary[]` entries point to skills in a different `category` or `domain` sub-tree (cross-domain entries moved to `anti_examples` + `relations.related`)
- [ ] `node scripts/skill-lint.js` baseline unchanged (no new errors from migration)
- [ ] `node scripts/generate-manifest.js --output skills.manifest.json` succeeds
- [ ] Health Block fields are present on at least the skills that have been through one `audit` cycle since the v6 bump (initial state: all `UNKNOWN`; populated by the first audit walk)
- [ ] Sample retrieval-eval queries route the same or better post-migration

## Rollback procedure

If verification fails:

```bash
cd /Users/jacobbalslev/Development/skills
find skills -name SKILL.md -exec sed -i '' 's/schema_version: "6"/schema_version: "5"/g' {} +
```

The flat Understanding fields and Health Block fields are not removed by the rollback — they remain in the YAML but are rejected by v5 schema validation (which has `additionalProperties: false`). To fully roll back, either:

1. Use `normalizeFrontmatter()` to strip unknown fields during the rollback sweep, OR
2. Manually delete the flat Understanding fields and Health Block from each affected skill.

Recommended: do not roll back — instead, identify the failing skills, fix the v6 authoring, and re-verify. The migration is additive; a partial v6 corpus is structurally safe (it just means some skills don't yet have flat Understanding fields populated).

## Related artifacts

- `schemas/skill.v6.schema.json` — JSON schema with flat Understanding fields and Health Block
- `SKILL_METADATA_PROTOCOL.md` — v6 protocol contract (flat fields, Health Block, boundary doctrine)
- `docs/skill-metadata-protocol.md` — v6 design rationale and field-count table
- `Development/docs/plans/skill-audit-loop-simplification.md` — outer plan that motivated the v6 simplification (collapse 13 audit commands to 4 operations, eliminate scattered log files via flat Health Block)
- `Development/docs/plans/skills-sh-marketshare-strategy.md` § Tier C″ — empirical sweep of 16 cross-domain `boundary[]` entries across 8 Wave 6 skills, confirming the SAME-DOMAIN doctrine
- `skill-graph/scripts/skill-graph-route.js:548` — runtime source for the score-aware boundary exclusion mechanic
