# Routing Harness — Follow-up Sprint Plan

> **Status.** Planned. Depends on the harness + lint gate + diagram shipped in the `[Unreleased]` changelog block.
> **Created.** 2026-04-19 — written at the end of the harness sprint based on the empirical library-wide run.
> **Subject.** Close the 87.5 % of failures traceable to four L4 changes in `scripts/skill-graph-route.js`, plus 4 targeted L5 authoring fixes.

---

## Why this plan exists

The harness sprint made `routing_eval: present` executable. The first library-wide run produced 0/9 starters passing — not because the authored `examples` / `anti_examples` / `boundary` fields are wrong, but because the router's scoring function has four independent bugs that cumulatively mask every positive-class assertion and several hard-negative assertions. The harness correctly surfaced them; this plan enumerates the fixes by root cause, not by symptom.

The core finding of the post-sprint diagnostic: **one file — `scripts/skill-graph-route.js` — owns 28 of 32 failures. Four targeted edits (~53 lines total) resolve the scoring-driven class entirely. The remaining 4 failures are genuine authoring work in 3–5 SKILL.md files.**

No schema change. No parser change (already fixed this sprint). No new skills required to get ≥8/9 starters passing.

---

## Part 1 — Failure-mode taxonomy

Eight distinct root causes surfaced during the diagnostic. M8 was resolved in the harness sprint; M1–M7 remain.

| ID | Mode | Mechanical description | Layer | File:line |
|---|---|---|---|---|
| **M1** | Stopword contamination | Query tokens `"this" / "to" / "my" / "it" / "is" / "can"` exact-match keyword phrases containing them (`"doc this"` → `["doc","this"]` → `"this"` in query → +3). English stopwords drive false positives across the library. | **L4** | `scripts/skill-graph-route.js:51-56` (tokenize), `:89-105` (exact-match in scoreSkill) |
| **M2** | Keyword-bag dominance | Scoring rewards *count of matching keyword phrases*, not *uniqueness of matched content tokens*. A skill with 6 phrases containing token `"skill"` beats a skill with 2 phrases but more precise content — even when the query is ambiguous. | **L4** | `scripts/skill-graph-route.js:89-96` |
| **M3** | Boundary-exclusion over-trigger | `relations.boundary[T]` on skill `S` removes `T` from selection whenever `S` is a top match, regardless of whether `T` outscored `S`. Stage 5 applies exclusion unconditionally. | **L4** | `scripts/skill-graph-route.js:336-357` |
| **M4** | Scope/type tiebreakers absent | The doctrine in `skills/skill-router/SKILL.md § Scope tiebreaker` and `§ Type tiebreaker` (codebase > reference > portable; workflow > capability > router > overlay) is not implemented. Sort falls back to alphabetical name. | **L4** | `scripts/skill-graph-route.js:270` |
| **M5** | Hard-negative anti_example uses self-vocabulary | Author wrote an anti_example whose strongest discriminators are *this skill's own keywords*. The router has no way to route away — it chose correctly given the signal. Fix is to rewrite the anti_example in the TARGET skill's vocabulary. | **L5** | 1 case: `skills/skill-router/SKILL.md` anti_example #3 |
| **M6** | Boundary list incomplete vs anti_examples | Anti_example redirects to skill `T` (declared by the inline author comment), but `relations.boundary[]` does not name `T`. | **L5 + L7** | 3 cases: `debugging`, `lint-overlay`, `skill-template` |
| **M7** | Anti_example references non-existent skill | `a11y`'s anti `"pick an accessible brand color palette"` intends to redirect to a `visual-design` skill that doesn't exist. Harness reports COVERAGE_GAP (informational — anti_example did its job). | **L5** | 1 case: `skills/a11y/SKILL.md` |
| ~~**M8**~~ | ~~Parser pollution~~ | ~~Inline YAML `# comment` tails landed in stored string values.~~ | ~~**L3**~~ | ✅ **Resolved** in harness sprint via `stripInlineComment()` in `parse-frontmatter.js` |

---

## Part 2 — Layer attribution

| Layer | File(s) | Modes | FAIL cases | % of total |
|---|---|---|---|---|
| **L4 Consumer** | `scripts/skill-graph-route.js` | M1, M2, M3, M4 | 17 positive + 5 hard-negative + 6 wrong-boundary = **28 of 32** | **87.5 %** |
| **L5 Specimen** | `skills/*/SKILL.md` (`relations.boundary`, `anti_examples`) | M5, M6, M7 | 1 hard-negative + 3 wrong-boundary + 1 coverage-gap = **5 of 32** | **15.6 %** |
| **L7 Graph** | cross-skill `relations.boundary` topology | M6 (secondary) | 0 standalone | 0 % |

Percentages overlap because some cases have primary M3 + secondary M1/M2.

---

## Part 3 — Priority-ordered execution

### Priority 1 — Four L4 changes (unblocks 28/32 failures)

Target file: `scripts/skill-graph-route.js`. Total diff: ~53 lines.

#### P1.1 — `tokenize()` stopword filter (M1)

Lines 51–56. Apply to both query tokenization AND keyword tokenization so both sides of the comparison drop stopwords equally.

**Recommended stopword list** (English function words, ~45 entries):
```
a, an, the, this, that, these, those,
to, of, in, on, at, by, for, with, from, as, if,
is, are, was, were, be, been, being,
it, its, my, our, your, their, his, her,
do, does, did, can, could, may, might, should, would,
have, has, had,
how, when, where, what, why, who, which,
and, or, not, but, so, then
```

Also enforce `minTokenLength >= 3` on the keyword side (after stopword removal) so that `"a11y"` still tokenizes to `["a11y"]` but `"to"` / `"it"` never enter scoring.

**Expected effect:** 17 positive misses + 5 hard-negatives recover (22 of 32 failures).

#### P1.2 — Per-token deduplication in `scoreSkill()` (M2)

Lines 70–119. Instead of `+3 per matching keyword phrase`, credit each query token at most once per skill (pick the highest-specificity keyword phrase that matched). Prevents keyword-bag stuffing.

Pseudocode:
```js
function scoreSkill(skill, queryTokens, pathArg) {
  const matchedTokens = new Set();         // per-skill dedup
  let score = 0;
  const reasons = [];

  for (const keyword of keywords) {
    const kwTokens = tokenize(keyword).filter(t => !STOPWORDS.has(t) && t.length >= 3);
    for (const kw of kwTokens) {
      if (queryTokens.includes(kw) && !matchedTokens.has(kw)) {
        matchedTokens.add(kw);
        score += 3;
        reasons.push(`keyword:${keyword}`);
        break;                             // one credit per keyword
      }
    }
  }
  // ... triggers + paths paths unchanged
}
```

**Expected effect:** resolves `skill-template` vs `skill-router` (`"skill"` token shared across many phrases) and `graph-audit` hard-negative (`"graph"` / `"audit"` repeated).

#### P1.3 — Score-aware boundary exclusion (M3)

Lines 336–357. Only apply boundary exclusion when the declaring skill `S` outscored `T` in stage 1. Otherwise, `T` stays in selection and gets an annotation that `S` thought it didn't own the prompt.

Pseudocode:
```js
for (const declaring of topMatches.concat(coLoaded)) {
  for (const b of (declaring.skill.relations?.boundary || [])) {
    const bName = relItemName(b);
    if (!bName || !selectedNames.has(bName)) continue;
    const bScored = scored.find(e => e.skill.name === bName);
    if (bScored && bScored.score > declaring.score) continue;  // loser doesn't exclude winner
    // ... existing exclusion logic
  }
}
```

**Expected effect:** graph-audit's positive case `"check that every scope: codebase skill …"` recovers (skill-router scored +18 but graph-audit would have won as direct match before boundary kicked in).

#### P1.4 — Sort comparator tiebreakers (M4)

Line 270. Extend the comparator with scope + type doctrine documented in `skills/skill-router/SKILL.md § Scope tiebreaker` and `§ Type tiebreaker`.

```js
const SCOPE_RANK = { codebase: 0, reference: 1, portable: 2 };
const TYPE_RANK = { workflow: 0, capability: 1, router: 2, overlay: 3 };

scored.sort((a, b) =>
  (b.score - a.score) ||
  (SCOPE_RANK[a.skill.scope] - SCOPE_RANK[b.skill.scope]) ||
  (TYPE_RANK[a.skill.type] - TYPE_RANK[b.skill.type]) ||
  a.skill.name.localeCompare(b.skill.name)
);
```

**Expected effect:** not blocking harness FAILs today (score differences are large, not ties), but prevents future tie-driven regressions and aligns implementation with documented doctrine.

---

### Priority 2 — L5 authoring fixes (resolves residual 4 cases)

#### P2.1 — M6 boundary extensions (3 one-line edits)

| File | Add to `relations.boundary` |
|---|---|
| `skills/debugging/SKILL.md` | `{skill: testing-strategy, reason: "testing-strategy plans coverage; debugging chases a specific failure"}` |
| `skills/lint-overlay/SKILL.md` | `{skill: testing-strategy, reason: "base testing-strategy owns unit-vs-integration selection; this overlay adds lint-specific gate placement"}` |
| `skills/skill-template/SKILL.md` | `{skill: skill-router, reason: "skill-router dispatches to existing skills; this template authors new ones"}` |

#### P2.2 — M5 anti_example rewrite (1 file)

`skills/skill-router/SKILL.md` anti_examples — replace:
```yaml
- "the router activated the wrong skill once — debug it"
```
with something using debugging's own vocabulary:
```yaml
- "reproduce this routing mis-dispatch from production logs"
```
This matches debugging's `"reproduce failure"`, `"it broke in production"` keywords while keeping the anti-ownership intent (not-the-router's-problem).

#### P2.3 — M7 triage decision (not code)

`skills/a11y/SKILL.md` anti `"pick an accessible brand color palette"`. Three options:

1. **Remove the anti_example** — accepts that a11y has no color-palette confusable in the starter library. Simplest, maintains routing_eval cleanliness.
2. **Rewrite to an existing-skill confusable** — e.g. swap for `"choose a readable typeface for body copy"` (absorbable by `documentation` via `"tutorial"` / `"guide"` keywords once M1/M2 land).
3. **Ship a `visual-design` starter skill** — turns the COVERAGE_GAP into a legitimate route and unlocks future visual-design skills.

**Recommendation: option 1.** COVERAGE_GAP is informational; the anti_example already did its primary job (it does NOT route back to a11y).

---

## Part 4 — Verification plan

After each priority lands:

1. **Unit-like:** run `node scripts/skill-graph-route.js <query>` against each `examples/evals/skill-router.routing.json` case — every `expected_winner` must match.
2. **Harness:** `node scripts/skill-graph-routing-eval.js --manifest examples/skills.manifest.sample.json`.
   - **After Priority 1:** expect ≥5/9 starters PASS.
   - **After Priority 2:** expect ≥8/9 starters PASS (a11y stays `absent` if option 1 chosen, still).
3. **Lint:** `node scripts/skill-lint.js --strict --include-template` — 0 errors, 0 warnings.
4. **Contract:** `node scripts/check-contract-consistency.js` — C1–C6 all OK.
5. **Flip:** starters whose harness reports PASS get `routing_eval: absent → present`. Lint check 12 gates the flip per skill.
6. **Regenerate:** `examples/skills.manifest.sample.json` with the `--include-template --timestamp 1970-01-01T00:00:00Z` flags; generator parity (lint check 8) confirms no drift.

---

## Part 5 — Out of scope

| Concern | Why out of scope |
|---|---|
| **L1 Schema** | Every field needed exists (`examples`, `anti_examples`, `relations.boundary.{skill,reason}`, `routing_eval`). No additions. |
| **Parser (`parse-frontmatter.js`)** | M8 resolved in harness sprint. |
| **Lint gate (`check-routing-eval.js`)** | Already enforces `present` correctly. No changes needed. |
| **Diagram** | `docs/ARCHITECTURE.md § Routing harness` already accurate — fixing M1–M4 changes router behavior, not harness decision path. |
| **`routing_eval.json`-style fixtures** | `examples/evals/skill-router.routing.json` remains the reference for scope/type tiebreaker assertions. No new fixture format. |

---

## Summary

Four edits to one file close 28 of 32 failures. Four targeted edits across four other files close the rest. No schema work, no parser work, no new skills required. After this plan executes, `routing_eval: present` is earned by most of the library's starters and the assertion ships backed by per-prompt evidence that lint check 12 gates.
