# Migration: schema_version 4 → 5

> **Status:** Active. Created 2026-05-16.
> **Breaking change.** Closing the open-ended `category` field to a 6-value enum and removing 7 deprecated values is breaking. All skills must bump `schema_version` from `"4"` to `"5"`.
> **Plan:** `docs/plans/skill-taxonomy-v5-and-gap-fill.md` (in the Development workspace).
> **Phase 0b gate:** PASS — 26/30 = 86.67% reviewer-agreement on category. See [`skill-graph/docs/migration-sample-review.md`](../../../skill-graph/docs/migration-sample-review.md).

## What changed

### 1. `category` is now a closed enum of 6 values

| Removed (v4) | Replaced by (v5) | Notes |
|---|---|---|
| `knowledge` | split by inspection — `foundations` (epistemics) / `engineering` (modeling) / `design` (design concepts) / `agent` (eval/grounding) | `knowledge` was the bucket-of-last-resort and dissolves |
| `frontend` | `engineering` w/ `domain: engineering/frontend` OR `design` (when primary surface is visual/UX) | judgment per A′ Rule 1 (primary surface) |
| `ai-engineering` | `agent` | the v5 name for AI/agent skills |
| `integration` | `engineering` w/ `domain: engineering/integrations` | naming-drift dedup |
| `integrations` | `engineering` w/ `domain: engineering/integrations` | naming-drift dedup |
| `data` | `engineering` w/ `domain: engineering/data` | |
| `workflow` | re-categorize by *subject* (`type: workflow` already carries method) | e.g. `background-jobs` → `engineering` |
| `security` | `quality` | security is a quality property (A′ Rule 2) |
| `engineering` | `engineering` (unchanged) | populate `domain` where missing |
| `design` | `design` (unchanged) | |
| `quality` | `quality` (unchanged) | promoted to 6th category — see Reconciliation Gate 2 in v5 plan |
| `product` | `product` (unchanged) | |

**New canonical enum (v5):** `foundations | engineering | design | quality | agent | product`

The schema-level `enum` constraint is enforced in `schemas/skill.v5.schema.json`. Lint rejects any other value.

### 2. `foundations` is the new browse home for epistemic preconditions

`foundations` covers skills that teach how to think, how to ground, how to verify, how to learn — epistemic preconditions of being a competent agent or engineer. Examples: `epistemic-grounding`, `constraint-awareness`, `mental-models`, `semantic-center`, `reasoning`.

**Foundations-gate anti-junk-drawer rule:**

> Membership in `foundations` requires (a) the skill teaches an epistemic precondition AND (b) the skill cannot be plausibly assigned to `agent`, `engineering`, `quality`, or `design`. If the skill could plausibly fit another category, it goes there instead.

Expected `foundations` size: 8–15 skills. If `foundations` exceeds 20 entries, the gate has failed and the migration is misrouted.

`foundations` replaces the prior plan's `Meta Method` category — same conceptual slot, different name. See `docs/plans/skill-taxonomy-v5-and-gap-fill.md` § Reconciliation Gate 1.

### 3. `quality` is promoted from facet to 6th category

The prior plan (`docs/plans/skill-taxonomy-architecture.md`, 2026-04-03) treated quality as a `layerPrimary` facet. v5 promotes it to a 6th category because Phase 0a retrieval baseline showed quality-shaped queries (OWASP, Core Web Vitals, accessibility, mocking-strategy) routed poorly without quality-shaped homes.

**A′ Rule 2 — Property vs subject:**

> Properties of any artifact (a11y, perf, security, testing, type-safety, observability) → `quality`. How to build → `engineering` / `design` / `agent`.

If a skill's primary surface is a non-functional property of an artifact, it belongs in `quality`. If it's about *building* something, it belongs in the subject category (engineering/design/agent).

### 4. Naming convention shifts to head-noun glossary + allowed_exceptions registry

The prior "two-anchor compound" naming rule and the banned-verb-prefix lint are replaced by:

1. **Head-noun glossary** at `docs/head-noun-glossary.md` — each skill name must end with a head noun from this glossary (e.g. `architecture`, `design`, `system`, `flow`, `model`, `pattern`, `boundary`, `protocol`).
2. **Optional modifiers** — pattern: `<modifier>-<head-noun>` or `<modifier>-<modifier>-<head-noun>` (max 2 modifiers).
3. **`allowed_exceptions` registry** at `docs/name-exceptions.yaml` — established industry term-of-art exceptions with a citation per entry (e.g. `code-review`, `design-review`, `event-storming`).
4. **Lint** in `scripts/skill-lint.js` checks head-noun + modifier-count + registry fallback.

### 5. Concept-shape adoption rule is evidence-based

`comprehension_state: present` requires **all four** conditions:

1. `scope` ∈ {`portable`, `reference`}
2. `type` = `capability`
3. `grounding.external_sources` cites ≥2 non-repo references (spec, canonical book, vendor doc with industry adoption, peer-reviewed paper). Single-vendor-feature anchors do not count as two sources.
4. The `concept` block (definition / mental_model / purpose / boundary / taxonomy / analogy / misconception) can be written *without any repo-specific noun* — no Sales Hub, no Shopify, no orchestrator-ui, no internal file paths.

Lint emits a warning if `comprehension_state: present` is set but condition #3 or #4 fails. Stronger than the prior "social recognition" framing.

### 6. `category` is framed as a browse facet, not ontology truth

The v5 protocol doc explicitly states:

> `category` answers one question only: *Where should a human browse to find this skill first?* It is a browse facet, not an ontological claim. Cross-cutting truth lives in `relations.related`.

Skills that genuinely cross-cut (e.g., `command-palette` is a `design` skill that's used by agents) get a single primary category plus secondary categories via `relations.related` (max 5).

## Migration procedure for skill authors

For every SKILL.md you maintain:

### Required edit

Change the schema_version field:

```yaml
# Before (v4)
metadata:
  schema_version: "4"

# After (v5)
metadata:
  schema_version: "5"
```

### Conditional edits

| If your skill has... | Then... |
|---|---|
| `category: knowledge` | Re-route per the table above (most go to `foundations` or `engineering`) |
| `category: frontend` | Re-route to `engineering` (with `domain: engineering/frontend`) or `design` (if visual/UX primary surface) |
| `category: ai-engineering` | Re-route to `agent` |
| `category: integration` / `integrations` | Re-route to `engineering` (with `domain: engineering/integrations`) |
| `category: data` | Re-route to `engineering` (with `domain: engineering/data`) |
| `category: workflow` | Re-route by subject — e.g. `background-jobs` → `engineering` |
| `category: security` | Re-route to `quality` |
| `category: foundations` | Verify foundations-gate: can this plausibly be `agent`/`engineering`/`quality`/`design`? If yes, move there. |
| `comprehension_state: present` set | Verify `grounding.external_sources` has ≥2 non-repo entries AND concept block contains no repo-specific nouns |
| Skill name violates head-noun pattern | Either rename to match head-noun-glossary OR add to `docs/name-exceptions.yaml` with citation |

### Codemod available

```bash
# Bulk-bump schema_version in all SKILL.md files
cd /Users/jacobbalslev/Development/skills
find skills -name SKILL.md -exec sed -i '' 's/schema_version: "4"/schema_version: "5"/g' {} +

# Verify lint baseline
cd /Users/jacobbalslev/Development/skill-graph
SKILL_GRAPH_WORKSPACE=/Users/jacobbalslev/Development/skills node scripts/skill-lint.js
```

The v5 category enum is already applied across the 137 live skills (skill-graph commit `210ac69`, 2026-05-16). The codemod above is the final schema_version bump.

## Backward compatibility

| Direction | Compatible? | Note |
|---|---|---|
| v4 tool reads v5 SKILL.md | ⚠ Partial | v4 tool will read the file but may not enforce v5 enum / foundations-gate / concept-shape rules. Old lint warnings will surface incorrectly. |
| v5 tool reads v4 SKILL.md | ✓ via `normalizeFrontmatter()` | The skill-graph repo's `scripts/lib/parse-frontmatter.js` already normalizes marketplace-shape and pre-v5 shapes for forward-compat reads. |
| Mixed v4 / v5 corpus | ❌ Not supported | Either everything is v5 or everything is v4. Mixing causes lint failures and routing inconsistencies. |

**Recommendation:** apply the codemod in a single commit. Do not ship a partial-v5 corpus.

## Verification checklist

After running the v4→v5 codemod:

- [ ] Every SKILL.md has `schema_version: "5"`
- [ ] Every `category` value is one of `foundations | engineering | design | quality | agent | product`
- [ ] `foundations` contains 8–15 skills (gate-pass)
- [ ] `node scripts/skill-lint.js` baseline unchanged (no new errors from migration)
- [ ] `node scripts/generate-manifest.js --output skills.manifest.json` succeeds
- [ ] `by_category` in manifest shows exactly 6 keys
- [ ] Sample retrieval-eval queries route the same or better post-migration

## Rollback procedure

If verification fails:

```bash
cd /Users/jacobbalslev/Development/skills
find skills -name SKILL.md -exec sed -i '' 's/schema_version: "5"/schema_version: "4"/g' {} +
```

Then revert any `category` enum changes via `git checkout`. The v5 protocol doc and schema file can remain — they're additive references, not active constraints, until skills carry `schema_version: "5"`.

## Related artifacts

- `schemas/skill.v5.schema.json` — JSON schema with closed `category` enum
- `SKILL_METADATA_PROTOCOL.md` — v5 protocol contract (browse-facet framing, foundations-gate, evidence-based concept-shape)
- `docs/head-noun-glossary.md` — canonical head-noun list for skill names
- `docs/name-exceptions.yaml` — established industry term-of-art exceptions
- `skill-graph/docs/migration-sample-review.md` — Phase 0b reviewer-agreement check (86.67% pass)
- `docs/plans/skill-taxonomy-v5-and-gap-fill.md` (in Development workspace) — full v5 plan with reconciliation decisions
