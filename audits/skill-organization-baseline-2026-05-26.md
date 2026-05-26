# Skill Organization Baseline — 2026-05-26

> Pre-loop scorecard for the Karpathy-style auto-improve loop applied to skill
> organization. Defined BEFORE any file is touched per the Shopify ThemeRunner
> rule ("define the metric before the agent touches a file; verify the metric
> cannot be gamed").
>
> Source plan: `docs/plans/skill-organization-karpathy-loop-2026-05-26.md`
> Frozen anchor: `evals/retrieval-baseline-frozen-2026-05-26.json` (64 queries)
> Live corpus: 153 active SKILL.md files (verified `find skills/skills -name SKILL.md | wc -l`)

---

## Why this baseline exists

The loop walks all 153 skills, edits descriptions per the 250-char silent cap
(claude-code #40121), and reverts edits that regress the score. Anti-overfit
guards (frozen + rotating 80/20 eval split, edit-count time-box, corpus-mean
regression check) require a snapshot of the scalar metric BEFORE the loop
starts. This file is that snapshot.

Re-run after Phase 2 sweep to compare. **If any dimension regresses corpus-wide
while improving on edited skills, the loop is overfitting — STOP.**

---

## The 7-dimension Organization Score

A skill's `organization_score` is the weighted average of seven dimensions.
Dimension 1 is a binary pre-gate; failing it means the skill is uncertifiable
and gets `null` for the rest.

| # | Dimension | Weight | Source script | Floor / Ceiling |
|---|---|---|---|---|
| 1 | **Triggerability** | gate | `check-triggerability.js` | binary: ≥1 of N positive examples must land top-1 |
| 2 | **Routing precision** (R@1 / R@3) | 35% | `skill-graph-routing-eval.js` | mean R@1 across skill's frozen-baseline appearances |
| 3 | **Boundary precision** | 20% | `skill-graph-routing-eval.js` (negative mode) + `skill-overlap.js` | mean pass on declared anti-examples |
| 4 | **Description density (250-char window)** | 15% | `check-description-density.js` | composite 0-100 (positive trigger / negative boundary / keywords in window / gerund / full visibility) |
| 5 | **Relation validity** | 10% | `check-protocol-consistency.js` (relations targets resolve) | 100% relations resolve = 100; per-broken target -10 |
| 6 | **Subject/operation consistency** | 10% | `check-subject-operation.js` | enum-valid + claim-supported = 100; per finding -25 |
| 7 | **Grounding coverage** | 10% | `skill-graph-drift.js` (deferred) | binary: grounding present for `scope: project`; freshness ≤ 90d |

The weights were chosen to match SOTA literature (SkillRouter arxiv 2603.22455
puts routing precision at the top; SkillReducer arxiv 2603.29919 anchors the
triggerability gate; claude-code #40121 anchors the 250-char dimension).

---

## Baseline measurements (2026-05-26)

### Dimension 1 — Triggerability (binary gate)

Source: `audits/baseline-2026-05-26/triggerability.json`
Method: per skill, take up to 3 examples from `activation.examples`, run each
through `routeSkills()`, require ≥1 to land top-1.

| Outcome | Count | % of corpus |
|---|---|---|
| **PASS** (≥1 example routes top-1) | 121 | 78.6% |
| **FAIL** (0 of N examples route top-1) | 17 | 11.0% |
| **UNKNOWN** (no `activation.examples` authored) | 17 | 11.0% |

- **Fail rate among scored:** 17 / 138 = **12.3%** — almost exactly the SkillReducer
  empirical finding (10.7%). Validates the SOTA prediction.
- **17 UNKNOWN skills** cannot be scored on this dimension until they author
  positive examples. These are the next round of `activation.examples` authoring
  work — they go in the uncertifiable bucket for now, NOT scored as PASS or FAIL.

### Dimension 2 — Routing precision (against frozen baseline)

Source: `audits/baseline-2026-05-26/routing-eval-frozen.json`
Method: `skill-graph-routing-eval.js --baseline evals/retrieval-baseline-frozen-2026-05-26.json`

| Metric | Value | Notes |
|---|---|---|
| Total queries | 64 | stratified across agent/engineering/quality/design/foundations |
| **Recall@1** | **78.13%** (50/64) | 14 misses — substantial drop from the 96.9% documented in `docs/ROUTING-METRICS.md` (2026-05-24) |
| **Recall@3** | **89.06%** (57/64) | 7 queries don't even reach top-3 |
| `routing_eval: present` coverage | 10 / 155 | only 6.5% of skills are eligible to declare the marker |

**Finding (load-bearing):** The documented baseline in `docs/ROUTING-METRICS.md`
(R@1 = 96.9%, R@3 = 100%) does NOT match today's measurement. Either the
2026-05-24 measurement was inflated, or the manifest/router/corpus regressed
between 2026-05-24 and 2026-05-26. This is itself a finding for Phase 4 doc
updates — `ROUTING-METRICS.md` § Baseline Results needs reconciliation.

### Dimension 3 — Boundary precision

Source: `audits/baseline-2026-05-26/overlap.txt` + `routing-eval-frozen.json`
negative-case section.

- `skill-overlap.js`: **0 hard errors** (no duplicate triggers; no duplicate
  path globs); 31 informational items (shared keywords — expected graph
  density, not blocking).
- Negative-case routing: from the per-skill activation suite, the 10
  `routing_eval: present` skills pass all their anti-examples (27 negatives,
  0 self-hits, 0 off-boundary hits). The other 145 skills are not yet
  measured because they don't declare `routing_eval: present`.

### Dimension 4 — Description density (250-char window)

Source: `audits/baseline-2026-05-26/description-density.json`
Method: per skill, score the first 250 chars of `description:` for positive
trigger / negative boundary / keywords / gerund-form name / full visibility.

| Metric | Value | Implication |
|---|---|---|
| Skills scored | 153 | full corpus |
| **Mean density score (0-100)** | **31.7** | half the corpus is below 32/100 — the silent 250-char cap is the highest-leverage routing constraint |
| Skills with `description ≤ 250` (full visibility) | 1 | 99.3% of descriptions have invisible characters past the cap |
| Skills missing positive trigger in first 250 chars | 9 | smallest gap — most have "Use when" somewhere visible |
| **Skills missing negative boundary in first 250 chars** | **117 (76%)** | the largest single failure mode — "Do NOT use" lands past char 250 on 3 of 4 skills |
| Skills with high-signal phrase landing past char 250 | 115 (75%) | invisible routing signal: phrases that the agent never sees during auto-invocation |

**Finding:** the mean density of 31.7 confirms that the silent 250-char cap
(claude-code #40121) is the largest correctable issue across the corpus. Phase 2
of this loop targets exactly this dimension.

### Dimension 5 — Relation validity

Source: `audits/baseline-2026-05-26/protocol-consistency.txt`

- `check-protocol-consistency.js`: **PASS, 0 warnings.** All `relations.*`
  targets resolve to existing skills. No dangling pointers.
- Baseline: 100% relation validity. Phase 2 must not regress this.

### Dimension 6 — Subject/operation consistency

Source: `audits/baseline-2026-05-26/subject-operation.json`
Method: validate v8 5-axis enums + sanity-check declared `operation` against
body linguistic markers.

| Finding | Count |
|---|---|
| Enum violations (subject / operation / scope) | **3** |
| Operation claim mismatches (declared op differs from body's strongest marker) | **51** (33% of corpus) |

**Enum violations (all 3):**
- `first-principles-thinking` — subject and operation both null
- `inversion` — subject and operation both null
- `second-order-thinking` — subject and operation both null

These three skills were authored without v8 axes. They'll fail v7-sunset
schema lint when it lands. Migration required before Phase 2 touches them.

**Subject distribution vs balance band (5-25):**

| Subject | Count | Status |
|---|---|---|
| `code-engineering` | 35 | OVER (subdivide via `domain:`) |
| `quality-assurance` | 27 | OVER (subdivide via `domain:`) |
| `design-craft` | 20 | OK |
| `frontend-ui` | 20 | OK |
| `agent-ops` | 17 | OK |
| `meta-methods` | 11 | OK |
| `product-domain` | 10 | OK |
| `knowledge-organization` | 7 | OK |
| `data-analytics` | 3 | UNDER (per ADR-0017: cleanly fits 3, kept at small size) |

**Operation distribution vs ADR-0017 prediction:**

| Operation | Actual % | ADR predicted | Status |
|---|---|---|---|
| `know` | 66.0% | 35-45% | OVER (some skills likely misclassified as `know`) |
| `do` | 32.0% | 25-35% | OK |
| `decide` | 1.3% | 20-30% | UNDER (the 51 op-claim mismatches likely include real `decide` skills mislabeled `know`) |
| `modify` | 0.7% | 1-3% | UNDER (only 1 skill — overlay archetype barely populated) |

**Finding:** The 51 op-claim mismatches + the under-population of `decide` are
the same finding seen two ways — the codemod default-mapped ambiguous `type:
capability` skills to `know`, but the body content suggests `decide` for a
substantial fraction. The discriminating axis collapsed during migration.

### Dimension 7 — Grounding coverage

**Deferred to Phase 2.** `skill-graph-drift.js` runs already but its output
needs to be projected onto the 7-dim score format. For the baseline, grounding
is recorded as "not yet measured" — all 153 skills get `null` for this
dimension in the per-skill `organization-score.json`.

---

## Aggregate corpus-level score

Pending Phase 1 aggregation script: per-skill JSON outputs (`description-density.json`,
`triggerability.json`, `subject-operation.json`, `routing-eval-frozen.json`) are
all under `audits/baseline-2026-05-26/`. The aggregation step (per-skill
`organization-score.json` with the 7-dim composite) is the first step of Phase 2.

Headline corpus-level signal from this baseline:

- **76% of skills have invisible routing signal past the 250-char cap.** The
  largest single opportunity.
- **12.3% of skills don't fire on their own positive examples.** A second
  invisible-routing class — SkillReducer's empirical finding holds here.
- **78% R@1 (not 97%)** — documented routing baseline is stale.
- **33% of operation labels mismatch the body content.** Discriminating axis
  collapse from the v7→v8 codemod's default mapping.
- **100% relation validity / 0 schema errors** — Integrity Gate is structurally
  clean. Phase 2 must not regress this.

---

## How to re-run this baseline

```bash
cd ~/Development/skill-graph
mkdir -p audits/baseline-NEW-DATE
cp evals/retrieval-baseline-v2.json evals/retrieval-baseline-frozen-NEW-DATE.json

node scripts/check-description-density.js --json > audits/baseline-NEW-DATE/description-density.json
node scripts/check-triggerability.js --json    > audits/baseline-NEW-DATE/triggerability.json
node scripts/check-subject-operation.js --json > audits/baseline-NEW-DATE/subject-operation.json
node scripts/skill-graph-routing-eval.js --baseline evals/retrieval-baseline-frozen-NEW-DATE.json --json \
  > audits/baseline-NEW-DATE/routing-eval-frozen.json
node scripts/skill-overlap.js                  > audits/baseline-NEW-DATE/overlap.txt
node scripts/check-protocol-consistency.js     > audits/baseline-NEW-DATE/protocol-consistency.txt
```

Then write a new baseline markdown with the same headline metrics and compare
to this file's tables.

---

## Hard guard rules in effect

Per the plan (`docs/plans/skill-organization-karpathy-loop-2026-05-26.md` §
Anti-overfit guards):

1. **Frozen eval first.** `evals/retrieval-baseline-frozen-2026-05-26.json`
   is the anchor — do NOT modify it during the loop.
2. **80/20 split per Phase 2 micro-eval.** 80% frozen, 20% rotating
   (`retrieval-baseline-rotating-v2.json`, regenerated each Phase 3 review).
3. **Per-skill edit-count cap = 5.** After 5 stale attempts, park for human
   review.
4. **Corpus-mean regression check between every 20-skill batch.** If R@1
   drops > 0.5pp from this baseline, STOP.

---

## Next step

Mark Task 6 complete, advance to Phase 2: per-skill description-only sweep
across all 153 skills in Health Block priority order. See plan § "Phase 2
description sweep" for the loop shape and stop conditions.
