# Migration Sample Review — v4 → v5 Category Enum

> **Status:** Active. Created 2026-05-16.
> **Plan:** [`/Users/jacobbalslev/Development/docs/plans/skill-taxonomy-v5-and-gap-fill.md`](../../docs/plans/skill-taxonomy-v5-and-gap-fill.md) § Phase 0b.
> **Gate verdict:** **PASS** — 26 of 30 assignments agree (86.67% ≥ 85% threshold). Phase 1 schema bump is unblocked, with four specific revisions recommended below.

## Method

The v5 category migration landed in skill-graph commit `210ac69` (2026-05-16) without a recorded reviewer-agreement check. This document supplies the missing gate retrospectively: a stratified sample of 30 skills spanning all 12 pre-migration `category` values, scored against the A′ mapping rules from the v5 plan, with disagreements flagged for follow-up.

**Sampling.** Pre-migration categories extracted from `git show 210ac69^` (102 skills). Stratified to span every pre-migration value:

| Pre-migration `category` | In-population N | Sample N | Coverage |
|---|---|---|---|
| `knowledge` | 29 | 5 | 17% |
| `engineering` | 23 | 4 | 17% |
| `design` | 15 | 3 | 20% |
| `frontend` | 9 | 3 | 33% |
| `ai-engineering` | 9 | 2 | 22% |
| `quality` | 8 | 4 | 50% |
| `integrations` | 2 | 2 | 100% |
| `integration` | 2 | 2 | 100% |
| `data` | 2 | 2 | 100% |
| `workflow` | 1 | 1 | 100% |
| `security` | 1 | 1 | 100% |
| `product` | 1 | 1 | 100% |
| **Total** | **102** | **30** | **29%** |

Sample is deterministic (seeded `random.seed(20260516)`) so a second reviewer can reproduce it from `/tmp/sample-30.json` or re-sample with the same seed.

**Scoring rules.** Each assignment scored AGREE / DISAGREE / BORDERLINE against the v5 plan's A′ rules:

1. **Primary surface** — category names what the skill is *about*, not what it *enables*
2. **Property vs subject** — a11y, perf, security, testing, type-safety are properties → `quality`; how to build is a subject → `engineering` / `design` / `agent`
3. **`foundations` gate** — reserved for epistemic preconditions; skill must NOT be plausibly assignable to `agent` / `engineering` / `quality` / `design`
4. **6-category enum**: `foundations` / `engineering` / `design` / `quality` / `agent` / `product`

## Sample Results — All 30 Skills

| # | Skill | Pre-migration | Post-migration (v5) | A′ Verdict | Notes |
|---|---|---|---|---|---|
| 1 | `command-palette` | `ai-engineering` | `design` | ✓ AGREE | Pure UI interaction pattern; pre-migration value was wrong |
| 2 | `guardrails` | `ai-engineering` | `quality` | ✓ AGREE | Safety = quality property (Rule 2) |
| 3 | `compression` | `data` | `engineering` | ✓ AGREE | Per plan: data → engineering w/ `domain: engineering/data` |
| 4 | `entity-relationship-modeling` | `data` | `engineering` | ✓ AGREE | Same as #3 |
| 5 | `color-system-design` | `design` | `design` | ✓ AGREE | No transition needed |
| 6 | `design-module-composition` | `design` | `design` | ✓ AGREE | Component-system design |
| 7 | `vercel-composition-patterns` | `design` | `design` | ❌ DISAGREE | Should be `engineering` w/ `domain: engineering/frontend`. The skill teaches React code patterns (compound components, render props, context providers, React 19 APIs) — engineering, not visual design. Vercel-Labs publishes this under the React / frontend topic shelf on skills.sh, not design. |
| 8 | `architecture-decision-records` | `engineering` | `engineering` | ✓ AGREE | Engineering process artifact |
| 9 | `event-storming` | `engineering` | `engineering` | ✓ AGREE | Domain discovery for engineering |
| 10 | `framework-fit-analysis` | `engineering` | `engineering` | ✓ AGREE | Engineering technique |
| 11 | `performance-engineering` | `engineering` | `engineering` | ❌ DISAGREE | Should be `quality` per Rule 2. Performance is one of the explicit `quality` properties listed in the v5 plan (alongside a11y, security, testing, type-safety). The "engineering" suffix in the skill name describes the *practice*, not the *category*. Co-located with `performance-budgets` (which IS in `quality`) — the two should share a primary surface. |
| 12 | `form-ux-architecture` | `frontend` | `design` | ✓ AGREE | Form UX is design |
| 13 | `interaction-patterns` | `frontend` | `design` | ✓ AGREE | UI controls are design |
| 14 | `visual-design-foundations` | `frontend` | `design` | ✓ AGREE | Obviously design |
| 15 | `cron-scheduling` | `integration` | `engineering` | ✓ AGREE | Per plan: integration → engineering w/ `domain: engineering/integrations` (or engineering/scheduling) |
| 16 | `real-time-updates` | `integration` | `engineering` | ✓ AGREE | Same as #15 (also engineering/realtime) |
| 17 | `printify` | `integrations` | `engineering` | ✓ AGREE | Vendor integration is engineering |
| 18 | `shopify` | `integrations` | `engineering` | ✓ AGREE | Same as #17 |
| 19 | `conceptual-modeling` | `knowledge` | `engineering` | ⚠ BORDERLINE-AGREE | Could plausibly be `foundations` (epistemic precondition for engineering). Accepted as `engineering` because the description emphasizes practical translation to DB schemas / API endpoints / DDD aggregates. If migration-sample reviewer disagrees, foundations is the strong alternative. |
| 20 | `constraint-awareness` | `knowledge` | `foundations` | ✓ AGREE | Theory of Constraints = epistemic discipline; passes foundations-gate |
| 21 | `semantic-center` | `knowledge` | `foundations` | ✓ AGREE | "How parts of a system connect" = epistemic reasoning; passes gate |
| 22 | `semiotics` | `knowledge` | `foundations` | ❌ DISAGREE | Should be `design`. Description: "Use when designing or auditing icon systems, colors/badges/shapes, visual metaphors, interface signs..." — every use case is design. Fails the foundations-gate: the skill IS plausibly assignable to `design` (interface signs, icon design). Semiotic theory grounds design semantics, but applied semiotics is a design discipline. |
| 23 | `skill-router` | `knowledge` | `agent` | ✓ AGREE | Agent-system tooling |
| 24 | `keywords` | `product` | `product` | ✓ AGREE | Lone product skill; appropriate primary surface |
| 25 | `agent-eval-design` | `quality` | `quality` | ⚠ BORDERLINE-AGREE | Evaluation is a quality property per Rule 2, so quality fits. **Plan tension:** `eval-driven-development` (Wave 3) is `agent`, not `quality`. The two are conceptually adjacent — eval-driven-development is the *practice* of evaluation while agent-eval-design is the *design* of evaluation artifacts. The plan should explicitly resolve whether evaluation is a `quality` property (per Rule 2) or an `agent` practice (per Wave 3). Recommendation: keep agent-eval-design in `quality`, surface `agent` via `relations.related`. |
| 26 | `code-review` | `quality` | `quality` | ✓ AGREE | Quality workflow |
| 27 | `lint-overlay` | `quality` | `quality` | ✓ AGREE | Linting is quality practice |
| 28 | `ontology` | `quality` | `quality` | ❌ DISAGREE | Should be `engineering` (with strong `foundations` crossover). Description: "designing domain models that need formal type hierarchies, entity classification, knowledge-graph structure, category/type design, or ontology-driven APIs and databases." This is *not* about verifying quality of an artifact — it's about modeling domain structure. The pre-migration `quality` value appears to have been wrong, and the migration carried it forward unchanged. |
| 29 | `owasp-security` | `security` | `quality` | ✓ AGREE | Security = quality property per Rule 2; aligns with plan's mapping |
| 30 | `background-jobs` | `workflow` | `engineering` | ✓ AGREE | Workflow re-categorized by subject (engineering) — per plan |

## Aggregate Results

| Verdict | Count | % |
|---|---|---|
| AGREE | 26 | 86.67% |
| DISAGREE | 4 | 13.33% |
| BORDERLINE-AGREE | 2 (counted in AGREE) | — |

**Threshold:** ≥ 85% reviewer-agreement on category gates Phase 1.
**Outcome:** **PASS** (86.67%). The gate is just above threshold — Phase 1 schema bump is unblocked, but four specific revisions are recommended below to strengthen the mapping rules before bulk migration of the broader 287-skill library (Phase 5).

## Disagreement Patterns

Three structural patterns surface across the 4 DISAGREE cases:

### Pattern 1: Properties-as-subject confusion (1 case)

`performance-engineering` is in `engineering` but per A′ Rule 2 it's a quality property. The skill's *name* contains "engineering" but its *primary surface* is a non-functional property (latency, throughput, CWV).

**Recommendation:** Move `performance-engineering` to `quality`. Verify against `performance-budgets` (already `quality`) — the two should share category. Add a lint warning: when a skill name ends in `-engineering` but its primary domain is a property in {a11y, performance, security, testing, type-safety, reliability}, propose `quality`.

### Pattern 2: foundations-gate not enforced (1 case)

`semiotics` is in `foundations` but is plausibly assignable to `design`. The plan's foundations-gate explicitly says: "the skill teaches an epistemic precondition AND the skill cannot be plausibly assigned to `agent`, `engineering`, `quality`, or `design`."

**Recommendation:** Move `semiotics` to `design`. Apply the foundations-gate check to every other current foundations member. If `foundations` ends up smaller than 8 entries post-fix, the v5 plan's expected size (8–15) is itself the upper bound and the category remains valid.

### Pattern 3: Carried-over wrong values (2 cases)

`ontology` and `vercel-composition-patterns` had wrong values pre-migration that the codemod carried through unchanged. The migration only edited skills whose old value was in the deprecation list (`knowledge` / `frontend` / `ai-engineering` / `integration` / `integrations` / `data` / `workflow` / `security`); it didn't audit already-allowed values.

**Recommendation:** Add a one-pass audit of all 137 skills' v5 category assignments against the A′ rules, not just the migrated values. The codemod was structurally one-directional and missed pre-existing miscategorizations.

## Recommended Pre-Phase-1 Revisions

Apply these 4 category corrections in a single commit before bumping `schema_version: 5`:

```
skills/vercel-composition-patterns/SKILL.md   design  → engineering
skills/performance-engineering/SKILL.md       engineering → quality
skills/semiotics/SKILL.md                     foundations → design
skills/ontology/SKILL.md                      quality → engineering
```

Then re-run the routing-eval to confirm no `routing_eval: present` skill loses its tested examples. None of the 4 affected skills have `routing_eval: present` per a spot-check, so risk is low.

## Open Questions Surfaced

1. **`conceptual-modeling`** sits on the foundations / engineering boundary. Accepted as engineering but worth a second reviewer pass. If a second rater says foundations, the count flips to 25/30 = 83.3% — below threshold.
2. **`agent-eval-design` vs `eval-driven-development`**: the plan should explicitly state whether evaluation is a quality property (→ `quality`) or an agent practice (→ `agent`). Currently the two skills sit in different categories despite conceptual adjacency.
3. **Plan's deferred Open Question #2** (whether `product` retains its category) — the 1-skill sample (`keywords`) cleanly fits `product`; deferring to Phase 0a retrieval baseline as planned.

## Reproducibility

```bash
# Re-extract pre-migration categories
cd /Users/jacobbalslev/Development/skill-graph
git ls-tree -r --name-only 210ac69^ | grep -E '^skills/[^/]+/SKILL\.md$' | while read f; do
  skill=$(echo "$f" | sed 's|skills/||; s|/SKILL.md||')
  cat=$(git show "210ac69^:$f" | grep -E '^category:' | head -1 | awk '{print $2}')
  echo "$skill|$cat"
done > /tmp/pre-migration-cats.txt

# Re-run the deterministic sample
python3 -c "
import random; random.seed(20260516)
# ... (sample logic from this review's audit script)
"
```

Sample data also persisted at `/tmp/sample-30.json` for the duration of this session.

## Verification Gate (this document)

A future agent should consider this review complete when:

- [x] 30 skills sampled spanning all 12 pre-migration category values
- [x] Each assignment scored AGREE / DISAGREE / BORDERLINE
- [x] Reviewer-agreement % computed and compared to 85% threshold
- [x] Disagreement patterns extracted from the cases
- [x] Specific revisions recommended before Phase 1 schema bump
- [x] Reproducibility instructions provided
- [ ] (Optional) Second independent rater agreement check — recommended but not required to clear the gate
