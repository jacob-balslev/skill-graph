# SH-6624 Phase 0 — Application-Grader-Design Pilot: Results & Fork Resolution (2026-05-30)

> Type: Research (one-shot empirical pilot). SYSTEM mode.
> Resolves the grader-design fork in `docs/plans` (SH-6624 Phase 0): which application-grader design earns `application_verdict`.
> Harness (throwaway, gitignored): `dist/ab/phase0-grader-pilot.js`. Raw data: `dist/ab/phase0-results.jsonl`.

## Method

For each of 3 cases from `examples/evals/application.sample.json` (1 real-critical, 1 real-high, 1 red-herring) × **5 trials**, the harness generated baseline + with-skill responses **once per (case, trial)** (generator = `sonnet`, the average-agent SUBJECT), then graded those **same** responses with three designs (grader = `sonnet`):

- **A — pointwise + 0/1/2 numeric** (the deployed `application-grader-prompt.md`)
- **hybrid — pointwise + binary checklist** (literature-optimal candidate; new pilot prompt)
- **B — comparative + binary checklist** (`application-comparative-grader-prompt.md`; one judge sees BOTH runs), graded in **both presentation orders** to measure position bias

Grading the same responses three ways isolates the grader-design effect; repeating across trials measures stability. 15 units, 8 model calls each = 120 calls, 0 errored.

## Results

| Design | Mean per-case verdict consistency (across 5 trials) | Red-herring false-positive rate | Position-flip rate (verdict changes with presentation order) |
|---|---|---|---|
| **A — pointwise numeric** | **1.0** (perfectly stable) | 0/5 | **N/A** — pointwise has no order by construction |
| **hybrid — pointwise checklist** | **1.0** (perfectly stable) | 0/5 | **N/A** — pointwise has no order by construction |
| **B — comparative checklist** | 1.0 *within* a fixed order | 0/5 | **15/15 = 100%** — every unit's verdict flipped with order |

**The decisive finding — B's position bias is total.** On every case, every trial, the comparative grader's verdict was determined by which response was shown first, NOT by the actual behavior delta. Concrete (case 1, all 5 trials): `baseline_first` order → `redundant`; `with_first` order → `applicable`. The grader rates the skill as helpful or useless purely by presentation order. A and hybrid produced identical, stable verdicts regardless (they grade each run independently — there is no order to bias).

Caveat noted honestly: the fixture is **too easy to discriminate A vs hybrid** — all real cases came back `redundant` and every design was deterministic across trials, so this pilot cannot measure the literature's claimed lower-variance edge of the checklist over the numeric scale. That sub-question needs a harder fixture (a skill that genuinely changes behavior). Also the grader was `sonnet` (a `no-lesser-models` shortcut for the pilot — see SH-6641); this measures **stability/bias**, which is valid because all three designs used the same grader, but NOT verdict **correctness**.

## Fork resolution (the decision)

1. **REJECT the comparative/pairwise design (B).** Measured 100% position-flip rate — the verdict is an artifact of presentation order. This is the position bias the literature predicted (Zheng et al. 2024; "Pairwise or Pointwise?" arXiv 2504.14716), here at maximal severity. Order-balancing (averaging both orders) would only average `applicable`+`redundant` into noise — it does not rescue the design.
2. **KEEP the pointwise protocol.** Both pointwise designs (A, hybrid) are stable and position-bias-free **by construction**. The deployed runner (`lib/audit/application-eval.js`) already uses pointwise-numeric (A) — validated bias-free here, no change required.
3. **The numeric (A) → checklist (hybrid) upgrade is DEFERRED, not adopted.** The literature favors binary checklists (CheckEval, FLASK) for lower variance + higher human agreement, but this fixture did not discriminate them (both 1.0). Adopting hybrid is an optional future enhancement to validate on a harder, behavior-changing fixture — not a forced change justified by this evidence.

## Consequences for related tasks

- **SH-6630 (judge position-bias / order-randomization): now N/A for the deployed design.** Order-randomization was only required if we adopted the pairwise design — which this pilot rejects. Pointwise grading has no position bias by construction, so SH-6630's mitigation is unnecessary for the shipped path. Recommend closing SH-6630 as resolved-by-design (the pilot chose the protocol that removes the bias rather than mitigating it).
- **SH-6624:** the grader-design fork is resolved (pointwise, reject pairwise). The runner's certification tier + trials loop (Phase 2, committed) stay as-is. Phase 4 (real-model application run) was proven separately on the `okrs` skill the same day.

## Research basis (verified, from the plan)

Position bias is real and severe in pairwise LLM judging (10–15pp typical, up to first-slot dominance); pointwise is robust by construction (arXiv 2306.05685, 2406.07791, 2504.14716). Binary checklists beat Likert on agreement/variance (CheckEval arXiv 2403.18771; FLASK) — the basis for keeping hybrid as a deferred enhancement rather than discarding it.
