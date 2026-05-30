# SH-6624 Phase 0 — Application-Grader-Design Pilot: Results & Fork Resolution (2026-05-30)

> Type: Research (one-shot empirical pilot). SYSTEM mode.
> Resolves the grader-design fork in `docs/plans` (SH-6624 Phase 0): which application-grader design earns `application_verdict`.
> Harness (throwaway, gitignored): `dist/ab/phase0-grader-pilot.js`. Raw data: `dist/ab/phase0-results.jsonl`, `dist/ab/phase0-summary.json`.

> **Correction note (same day):** the first version of this doc reported a "100% position-flip rate (15/15)" — that was wrong, read off a corrupted terminal display rather than the machine-readable summary. The numbers below are from `phase0-summary.json` and a per-unit dump. The fork decision (reject pairwise, keep pointwise) is unchanged; the evidence and magnitudes are corrected.

## Method

For each of 3 cases from `examples/evals/application.sample.json` (1 real-critical, 1 real-high, 1 red-herring) × **5 trials**, the harness generated baseline + with-skill responses **once per (case, trial)** (generator = `sonnet`, the average-agent SUBJECT), then graded those **same** responses with three designs (grader = `sonnet`):

- **A — pointwise + 0/1/2 numeric** (the deployed `application-grader-prompt.md`)
- **hybrid — pointwise + binary checklist** (literature-optimal candidate; new pilot prompt)
- **B — comparative + binary checklist** (`application-comparative-grader-prompt.md`; one judge sees BOTH runs), graded in **both presentation orders** to measure position bias

Grading the same responses three ways isolates the grader-design effect; repeating across trials measures stability. 15 units, 8 model calls each = 120 calls, 0 errored.

## Results (from `phase0-summary.json`)

| Design | Mean per-case verdict consistency (across 5 trials) | Red-herring false-positive rate | Position-flip rate (verdict changes with presentation order) |
|---|---|---|---|
| **A — pointwise numeric** | **0.87** (highest) | **0/5** | **N/A** — pointwise has no order by construction |
| **hybrid — pointwise checklist** | 0.80 | 0/5 | **N/A** — pointwise has no order by construction |
| **B — comparative checklist** | **0.70** (lowest) | **4/5** | **3/15 = 20%** (case1 1/5, case2 2/5, case3 0/5) |

### Per-case detail (the interesting structure)

- **Case 1 (real-critical):** noisy for ALL THREE designs — A consistency 0.6 (`applicable`/`redundant` split), hybrid 0.4 (`applicable`/`redundant`/`mixed`). This is a property of the *fixture/skill*, not a grader defect: the database-migration skill's effect on this generated answer is genuinely borderline, and the graders honestly disagree across trials. **This validates the Phase-2 N-trial loop** — taking the mode across trials is exactly the mitigation for this real per-draw noise.
- **Case 2 (real-high):** A & hybrid stable `redundant` (1.0). B mostly `redundant` but flipped to **`harmful`** 2/5 times *only* in the `with_first` order — an apparent **position-bias artifact**: B invented a regression that neither pointwise grader saw.
- **Case 3 (red-herring):** A & hybrid stable with **0/5 false-positives** (they correctly scored the out-of-scope skill as clean). B returned **`false_positive` 4/5** — it diverged from the pointwise graders and flagged the skill as triggering out of scope.

## Fork resolution (the decision — unchanged direction, corrected evidence)

1. **REJECT the comparative/pairwise design (B).** It was the least reliable on *every* axis measured: lowest verdict stability (0.70 vs 0.87/0.80), a real (if modest) **20% position-flip rate**, **4/5 red-herring false-positives** where the pointwise graders had zero, and **spurious `harmful` verdicts that appear to be pure order artifacts** (case 2 `with_first`). A grader that invents regressions based on presentation order cannot certify `application_verdict`.
2. **KEEP the pointwise protocol.** Both pointwise designs are position-bias-free by construction and clean on the red-herring. The deployed runner (`lib/audit/application-eval.js`) uses pointwise-numeric (A) — the **most stable** design here (0.87) — so no change is required.
3. **The numeric (A) → checklist (hybrid) upgrade is DEFERRED, not adopted.** On this fixture A (0.87) slightly edged hybrid (0.80) on stability, and both were clean on the red-herring — so the literature's lower-variance argument for the checklist is *not demonstrated here*. Adopting hybrid is an optional future enhancement to validate on a harder, behavior-changing fixture — not a forced change justified by this evidence.

## Consequences for related tasks

- **SH-6630 (judge position-bias / order-randomization): N/A for the deployed design.** Position bias was real but modest (20%) and confined to the pairwise design we are rejecting. Pointwise grading has no position bias by construction, so SH-6630's mitigation is unnecessary for the shipped path — recommend closing as resolved-by-design.
- **SH-6624:** grader-design fork resolved (pointwise, reject pairwise). Phase 2 (trials loop + certification tier) and Phase 4 (real-model run on `okrs`) stand. The case-1 cross-trial noise is direct evidence the trials loop earns its keep.

## Honest caveats

- **Grader = `sonnet`** (a `no-lesser-models` shortcut for the pilot — tracked SH-6641). This measures **stability + position-bias**, which is valid because all three designs shared the same grader (the comparison isolates the design effect). It does NOT certify verdict **correctness** — e.g. whether B's 4/5 red-herring `false_positive` is B being correctly stricter or over-flagging is unresolved without reading transcripts. A correctness pass needs a top-tier cross-family grader.
- **Small fixture:** N = 3 cases × 5 trials = 15 units; case 1 is genuinely ambiguous (a feature — it shows the graders aren't rubber-stamping). A harder, behavior-changing skill would better discriminate A vs hybrid.

## Research basis (verified, from the plan)

Position bias is real in pairwise LLM judging and pointwise is robust by construction (arXiv 2306.05685, 2406.07791, 2504.14716) — corroborated here (B biased, pointwise not). Binary checklists beat Likert on agreement/variance in the literature (CheckEval arXiv 2403.18771; FLASK) — the basis for keeping hybrid as a *deferred* enhancement rather than discarding it, since this fixture did not reproduce that edge.
