# Field-Relevance Benchmark

Measures the empirical relevance of each Skill Metadata Protocol field — which fields earn
their place in the contract — so keep/drop/consolidate/add decisions are evidence-backed
instead of opinion-driven.

## Read in this order

1. **`CONCEPTUAL-MODEL.md`** — the conceptual foundation. Two corrections that define the
   whole approach: (1) population is NOT a relevance signal (self-authored corpus); (2) rate
   the orthogonal *dimensions* a skill has (15, v2), not the 56 fields against each other.
   Surfaces the Philosophy (candidate field, gated on a named consumer) and Comprehension
   (description-level conflation with the eval) findings. Reviewed by GPT-5.5; both softened.
2. **`../../docs/proposals/skill-dimensional-coverage.md`** — the two structural findings filed
   as a SYSTEM proposal (a `philosophy` field; Comprehension prose/eval separation). PROPOSED,
   not decided.
3. **The plan** — `~/Development/docs/plans/field-relevance-benchmark-2026-05-31.md` — the
   phased methodology (P0–P5: deterministic free screens → controlled ablation → behavior A/B
   → scorecard). Designed by Opus, adversarially reviewed by GPT-5.5.
4. **`p05-findings.md`** + **`p05-inventory.json`** — Phase 0.5 corpus inventory (population
   *context only*, never a relevance verdict).

## Tooling

| File | What it does |
|---|---|
| `inventory.js` | P0.5 — parses all canonical SKILL.md via `normalizeFrontmatter`, reports per-field population/distinct/state. `node benchmarks/field-relevance/inventory.js [--json]` |
| `p05-inventory.json` | generated inventory output (regenerate with `inventory.js --json`) |

## The verdict rule (adoption-independent)

A field/dimension is **LOAD-BEARING** iff a controlled value-change moves a consumer outcome
(routing / behavior / gate) in the expected direction, **or** it gates a pipeline decision.
**DECORATIVE** = parses but no consumer reads the value and corruption changes nothing.
**DEAD** = no consumer + no counterfactual effect + redundant concept. **Population is never
an input.** Every verdict names the consumer path it holds for.

## Status

- [x] P0.5 — corpus inventory (done)
- [ ] P0 — field→dimension map + path-a decision
- [ ] P1 — deterministic free screens (consumer-grep, leave-one-out replay, gate-flip)
- [ ] P2–P5 — baseline expansion, controlled ablation, behavior A/B, redundancy, scorecard
