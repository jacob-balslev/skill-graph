# Model Contribution Benchmarks for Multi-Model Skill Audits

> Type: Reference (measurement spec)
> Status: v1 (2026-05-24). Companion to [skill-audit-multimodel-merge-v2.md](./skill-audit-multimodel-merge-v2.md).
> Source: 2026-05-24 roundtable at `/Users/jacobbalslev/Development/.roundtable/skill-audit-2026-05-24/` (responses from GPT-5.5 and Gemini 3.1 Pro), plus `research-2026-state-of-art.md` (14 sources, 2024-2026).

## Purpose

Two questions this spec answers:

1. **Per session: how did each model contribute?** Concrete numbers, not prose. Drives the curator-rotation decision, surfaces silent-collapse failures, gives Jacob a leaderboard.
2. **Across sessions: is v2 actually better than v1?** Oracle benchmark with seeded findings. Pre-registered win condition.

Per GPT-5.5's 2026-05-24 §Q5, the benchmark must use held-out sessions, randomized order, and ≥ 2 runs per model. Replaying the 05-19 brief alone is insufficient (the convener and respondents are now contaminated by the known result).

## Per-session metrics (compute every roundtable)

Emitted to `<session>/benchmark-summary.json` at end of session by the curator. All fields derive from the merge ledger v2 (`skill-audit-multimodel-merge-v2.md` §5).

### A. Per-model scorecard

| Field | How computed | Why it matters |
|---|---|---|
| `marginal_findings` | count of merge-ledger rows with `surfaced_by = M` AND `novelty_class != brief-anchored` | Distinct signal contributed (not just rubric-filling). |
| `corroborated_findings` | count of rows with `M ∈ corroborated_by` | Reliability signal: M independently reached a finding others also reached. |
| `accepted_findings` | count of rows with `M ∈ accepted_by` AND `M ∉ surfaced_by ∪ corroborated_by` | Curator labor: M's proposal mentioned the finding but did not originate it. |
| `impact_weighted_score` | Σ (impact × marginality) per §7 of v2 | Per-model attribution share. |
| `share_pct` | impact_weighted_score / Σ all-model scores | Reported leaderboard number. |
| `brief_dissent_filed` | bool | Did M file evidence-backed dissent per the novelty memo template? |
| `brief_dissent_accepted` | bool | Did the curator merge M's brief-dissent claim? |
| `format_loss_count` | count of rows tagged `format_loss = true` for M | "How often did M's signal need the novelty memo because the structured rubric hid it?" Diagnoses too-tight prompts. |
| `cost_usd` | sum of token cost across M's audit calls | For cost-per-novel-finding. |
| `cost_per_marginal_finding` | `cost_usd / marginal_findings` | Efficiency. Models with `marginal_findings = 0` report N/A, not infinity. |
| `tool_calls_logged` | from trajectory.jsonl if present | For trajectory-eval. |

### B. Per-session diagnostics

| Field | How computed | Threshold |
|---|---|---|
| `panel_size` | number of distinct auditor model_ids | (no threshold) |
| `effective_rank` | from per-finding embedding cosine across models, per arXiv 2604.03809 | alert if `< panel_size × 0.75` (collapse) |
| `krippendorff_alpha` | over per-model verdict scores on shared structured dimensions | flag `< 0.5` (panel disagreement); `≥ 0.8` strong agreement |
| `same_family_curator_share` | proportion of `surfaced_by` rows promoted by a curator of the same model family | flag `> 0.5` (family bias risk) |
| `silent_rejection_rate` | rows with `kept = false` AND `reason = "out-of-scope"` divided by total rejected rows | high values suggest curator over-pruning |
| `dissenter_overturned_rejections` | count of rejected rows the dissenter successfully re-promoted | quality signal for the dissenter role |

### C. Per-session leaderboard

Markdown emitted to `<session>/leaderboard.md`:

```markdown
| Model | Share | Marginal | Corroborated | Accepted | Brief-dissent | $/marginal |
|---|---|---|---|---|---|---|
| GPT-5.5 | 32% | 4 | 2 | 1 | yes (accepted) | $0.05 |
| Opus 4.7 | 32% | 3 | 1 | 4 | n/a (curator) | $0.20 |
| Gemini 3.1 Pro | 28% | 2 | 3 | 2 | yes (rejected) | $0.02 |
| Convergent (all-3) | 8% | n/a | n/a | n/a | n/a | n/a |
| Panel diagnostics: effective_rank = 1.9 / 3.0 (collapse alert); α = 0.61; same-family curator share = 60% (bias alert)
```

## Oracle benchmark protocol (compute when proving v2 > v1)

Per GPT-5.5 2026-05-24 §Q5, with FER subset from Gemini 2026-05-24 §Q5.

### Setup

1. **Build oracle set.** Curate 6 to 10 prior audit sessions including:
   - The 2026-05-19 SYNTHESIS findings (verifiable post-hoc)
   - The 44-artifact meta-audit inventory (`docs/audits/skill-audit-loop-meta-audit-2026-05-19.md` §2, lines 23-103)
   - The runner fork finding (load-bearing minority signal)
   - The inert-verdict-population finding (Health Block all-UNVERIFIED at v7 ship)
   - The duplicate command-surfaces finding (5 to 13 audit-loop entry points in the meta-audit)
   - The missing application-cases finding (1 of 481 skills has `application.json`)
   - Plus **false-positive distractors**: 3 to 5 plausible-but-wrong findings the panel should NOT promote.

2. **Run v1 and v2 with fresh contexts.** Each session run twice per model (Rating Roulette). Randomize session order to prevent priming.

3. **Score per session:**
   - **Recall** of oracle findings promoted into synthesis
   - **False-positive rate** of distractor promotion
   - **Curator-loss rate**: oracle findings that any model surfaced but the curator dropped
   - **Cost per accepted marginal finding**, separately per model
   - **Diversity**: effective rank, Krippendorff α
   - **Trajectory recall**: fraction of oracle findings that required tool-call inspection to catch (output-only eval missed)

### Win condition for v2 over v1

v2 ships only if, across the oracle set:

| Metric | v2 must beat v1 by |
|---|---|
| Oracle finding recall | ≥ 15 percentage points |
| P1/P2 curator-loss rate | drop to 0 (any P1/P2 loss is a regression) |
| False-positive rate | ≤ +10 percentage points (v2 may surface more, but not 2x) |
| Cost per accepted marginal finding | reported separately per model, no hidden variance |
| Effective rank | ≥ +0.3 (less collapse) |
| Krippendorff α | report; not a gate (high α can mean agreement OR collapse, ambiguous) |

If v2 fails any gate, do not ship v2. Diagnose which v2 change underperforms (attribution? trajectory? dissenter? curator rotation?) and iterate before re-running the benchmark.

## Finding Extraction Rate (FER), per Gemini 2026-05-24

A subset of the oracle benchmark. Useful as a cheaper smoke test before a full oracle run:

1. Pick 10 skills.
2. Seed each with 3 bugs of known severity (one in body, one in references, one in metadata).
3. Run v1 and v2 (with fresh contexts) over each.
4. Compute FER = (oracle bugs promoted into final synthesis) / (oracle bugs total).
5. Compute FER_per_dollar = FER / total token cost.

FER targets:
- v1 baseline: not predicted; measure first
- v2 target: ≥ v1 + 15pp on FER, ≥ v1 + 25% on FER_per_dollar

FER is a smoke test, not a ship gate. Pass the full oracle benchmark before promoting v2 to default.

## Calibration: 05-19 retrospective with v2 metrics applied

From `retrospective-2026-05-19.md`, applying v2 metrics retroactively:

| Metric | Value | Interpretation |
|---|---|---|
| Panel size | 3 (Opus, GPT-5.5, Gemini) | Plus Sonnet at 0% (not seated). |
| Marginal findings (excluding research) | 1 (GPT-5.5: runner drift) | Single-model uniqueness was rare. |
| Marginal findings (including research) | 7 (Opus: SkillsBench + 6 others) | Research contribution dominates; should be reported separately per v2 §7. |
| Effective rank (estimate) | ~1.67 / 3.0 | Below the arXiv 2604.03809 baseline of 2.17. Worse collapse than the Qwen-panel benchmark. |
| Brief-dissent rate | GPT-5.5: 57% / Gemini: 67% / Opus: n/a (authored brief) | Both external models successfully dissented; brief signal "disagreement is the point" was sufficient. Would not survive a weaker brief. |
| Krippendorff α | Not computed (no shared structured rubric) | v2 will compute. |
| Same-family curator share | 100% (Opus curated; Anthropic-family findings credited at full weight) | Bias risk per arXiv 2410.21819. v2 rotation mitigates. |
| Curator-loss rate (P1/P2) | 0 (verified post-hoc) | v1's anti-loss rule worked. |
| Cost per marginal finding | Opus $0.014 / GPT-5.5 $0.02 / Gemini undefined | Opus was efficient per-finding due to research contributions; GPT-5.5 efficient on reasoning-only signal; Gemini's contribution was corroborative, undefined denominator. |

### What the v2 protocol would have changed in 05-19

- **Sonnet would have had a seat or a recorded exclusion reason.** Currently invisible.
- **Curator rotation would have been considered.** Opus convened AND curated. v2 forbids that on critical sessions. Either Sonnet, GPT-5.5, or Gemini would have curated.
- **GPT-5.5's runner-drift finding** would have surfaced in the novelty memo channel (it does not fit the structured rubric well), and would have carried `format_loss = true`.
- **Opus's web research** would be tagged `from-research` and reported separately from independent-respondent share.
- **Dissenter pass** would have rechecked any items Opus-as-curator considered out-of-scope.

Estimated effect on 05-19 outcome: same 10 load-bearing findings, but Sonnet seated as dissenter, curator rotated to GPT-5.5 (Anthropic-family bias diluted), runner-drift promoted under `format_loss = true` (auditable), research contribution attributed transparently. No load-bearing finding would have been lost. The decision content of SYNTHESIS would be essentially identical; the attribution would be honest.

## Open: detecting intentional gaming

A future v3 should consider:

- **Ceremonial dissent detection.** Per GPT-5.5: "bad forced dissent is worse than no dissent." If a model's brief-dissent claims are consistently shallow or self-rejected by curators, downgrade that model's marginality multiplier next session.
- **Stable-finding-id collusion.** If two models always corroborate each other and never independently surface, they may be sharing prompt distributions. Flag panels where `corroborated_by` overlap exceeds 80% across multiple sessions.
- **Novelty-hash gaming.** A model could write claims worded to maximize embedding distance from the brief without changing meaning. Counter: human spot-check of `novelty_class = brief-divergent` rows in the first 3 v2 sessions.

## Related

- v2 protocol: [skill-audit-multimodel-merge-v2.md](./skill-audit-multimodel-merge-v2.md)
- v1 protocol: [skill-audit-multimodel-merge.md](./skill-audit-multimodel-merge.md)
- 2026-05-24 roundtable: `/Users/jacobbalslev/Development/.roundtable/skill-audit-2026-05-24/`
- 2026-05-24 research file: `/Users/jacobbalslev/Development/.roundtable/skill-audit-2026-05-24/research-2026-state-of-art.md`
- Retrospective: `/Users/jacobbalslev/Development/.roundtable/skill-audit-2026-05-24/retrospective-2026-05-19.md`
