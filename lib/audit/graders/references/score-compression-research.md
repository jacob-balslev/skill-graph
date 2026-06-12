# Score Compression in LLM-as-Judge Evaluation

> Research bibliography on why LLM judges cluster scores in narrow bands, and the interventions that decompress them.
> Last updated: 2026-05-18

## Why Score Compression Happens

LLM judges systematically produce score distributions that are too narrow to discriminate output quality. This is a structural problem in the LLM-as-judge paradigm, not a bug in any specific rubric.

### Empirical evidence of compression

- **DeepSeek-V3 rates >50% of samples at score 5 on a 1-5 scale** with no intervention. Mistral favors 4. ([Evaluating Scoring Bias in LLM-as-a-Judge, arXiv 2506.22316](https://arxiv.org/html/2506.22316v1))
- **Scale format alone shifts ratings by ~1.5 points**: the same item averages 1.68 on a 1-5 numeric scale vs 3.17 on an A-E categorical scale. The judge's preference is for the *position* in the range, not the content. ([Score IDs Bias](https://arxiv.org/html/2506.22316v1))
- **Base judges sometimes NEVER predict certain Likert scores** (e.g., 5-6) and barely predict others (2-3) on a 1-7 scale. Single-response ratings produce pervasive ties. ([Quantitative LLM Judges, arXiv 2506.02945](https://arxiv.org/html/2506.02945v1))
- **Anchoring effects from numeric range**: judges produce different ratings for identical content on 1-5 vs 2-6 vs 0-4 scales — the range itself biases the output. ([Score Range Bias, Emergent Mind](https://www.emergentmind.com/topics/score-range-bias))

### The root causes

1. **Central tendency bias**: Without concrete behavioral anchors, judges default to the middle of the range. "Excellent" is too vague — the judge picks the safe middle.
2. **Anchoring bias from rubric framing**: The scale's endpoints anchor the judge to a position relative to those endpoints, not to an absolute quality level.
3. **Self-preference bias**: Judges rate output similar to their own training higher. ([Self-Preference Bias in LLM-as-a-Judge, arXiv 2410.21819](https://arxiv.org/html/2410.21819v2))
4. **Overconfidence**: Judges report high confidence even on items they rate inconsistently across runs. ([Overconfidence in LLM-as-a-Judge, arXiv 2508.06225](https://arxiv.org/html/2508.06225v2))
5. **Shortcut bias**: Judges latch onto surface features (length, formatting, vocabulary overlap) and use them as proxies for quality. ([The Silent Judge, arXiv 2509.26072](https://arxiv.org/html/2509.26072v2))
6. **Position bias in pairwise**: Vicuna-13B vs ChatGPT win-rate flipped from 2.5% to 82.5% just by reordering candidates. Position effects are severe. ([LMSYS Chatbot Arena](https://www.lmsys.org/blog/2023-12-07-leaderboard/))

## Anti-Compression Techniques

### 1. Behavioral Anchored Rating Scales (BARS) — Highest leverage

Replace vague labels ("good", "excellent") with **concrete observable behaviors** + worked examples at each score level. Cuts central tendency bias by **28%** (Landy & Farr meta-analysis). The strongest single intervention measured.

Pattern:
```
5 = <observable behavior + example from the actual corpus>
4 = <observable behavior + example>
3 = <observable behavior + example>
2 = <observable behavior + example>
1 = <observable behavior + example>
```

Anchors must be **behavioral** (what the rater observed) not **inferential** (what the rater concluded).

References:
- [BARS — AIHR](https://www.aihr.com/blog/behaviorally-anchored-rating-scale/)
- [BARS — PerformYard](https://www.performyard.com/articles/what-are-behaviorally-anchored-rating-scales-bars)
- [BARS pros/cons — Bryq](https://www.bryq.com/blog/behaviorally-anchored-rating-scale-bars)
- [BARS — Asanify](https://asanify.com/glossary/bars-method-performance-appraisal/)

### 2. Calibration sets — In-prompt golden examples

Embed 1 worked example per score level directly in the grader prompt. Force the judge to first identify which example the current output is closest to before scoring. Base judges literally never predict certain scores without these anchors.

References:
- [LLM-as-a-Judge Done Right — Kinde](https://www.kinde.com/learn/ai-for-software-engineering/best-practice/llm-as-a-judge-done-right-calibrating-guarding-debiasing-your-evaluators/)
- [OpenAI Model Spec Evals](https://alignment.openai.com/model-spec-evals/)
- [LLM Judge Calibration — Deepchecks](https://deepchecks.com/llm-judge-calibration-automated-issues/)
- [Calibrate LLM-as-a-Judge — LangChain](https://www.langchain.com/articles/llm-as-a-judge)

### 3. Pairwise comparison (Bradley-Terry, Elo)

Absolute pointwise scores fluctuate ~10x more than pairwise comparisons. For N-candidate winner selection, pairwise round-robin with position randomization is mathematically superior to any pointwise rubric. Keep the rubric for explainability; use pairwise for the actual decision.

References:
- [Bradley-Terry Model — Wikipedia](https://en.wikipedia.org/wiki/Bradley%E2%80%93Terry_model)
- [LMSYS Chatbot Arena Elo](https://www.lmsys.org/blog/2023-12-07-leaderboard/)
- [Statistical Framework for Ranking LLM Chatbots, arXiv 2412.18407](https://arxiv.org/html/2412.18407v1)
- [Arena-Lite, EMNLP 2025](https://aclanthology.org/2025.emnlp-main.360.pdf)
- [Pairwise & Elo for LLMs — Brenndoerfer](https://mbrenndoerfer.com/writing/preference-evaluation-pairwise-comparisons-elo-llm)

### 4. G-Eval — Chain-of-thought + token-probability weighting

Make the judge generate evaluation steps before scoring, then weight the final score by token probabilities of each discrete score value. Achieves Spearman 0.514 with human on summarization. Token-probability weighting extracts graded signal from logits even when the surface answer is always "4".

References:
- [G-Eval, arXiv 2303.16634](https://arxiv.org/abs/2303.16634)
- [G-Eval — DeepEval docs](https://deepeval.com/docs/metrics-llm-evals)
- [G-Eval — Confident AI](https://www.confident-ai.com/blog/g-eval-the-definitive-guide)
- [G-Eval — Promptfoo](https://www.promptfoo.dev/docs/configuration/expected-outputs/model-graded/g-eval/)

### 5. Multi-judge ensembles and disagreement-as-signal

Use a different model family as judge to break self-preference. For tier-1 assets, always cross-family judge. Treat judge disagreement as a signal that the item is genuinely ambiguous, not noise to be averaged away.

### 6. Critical-dimension min-gate (replaces weighted averaging on failure)

Currently rubrics use weighted SUM, which lets a strong dimension mask a failing critical dimension (correctness, safety). Replace with one of:
- **Hard cap**: if any critical dimension < 3, total capped at 60
- **Weighted geometric mean**: `score = (∏ dim_i^w_i)^(1/Σw_i)` — one zero kills the score

This is the published weighted-geometric-mean intuition expressed as a simple, judge-readable rule.

## Discriminative Power Metrics — How to Measure Compression

Without these metrics, you can't detect compression. Add them to every grader's output.

### Coefficient of variation (CV = σ/μ)

- CV ≥ 0.2 = usable discrimination
- CV 0.1-0.2 = borderline
- CV < 0.1 = **compressed** — needs anchor refresh

References:
- [Coefficient of Variation — Wikipedia](https://en.wikipedia.org/wiki/Coefficient_of_variation)
- [Coefficient of Variation — Statistics By Jim](https://statisticsbyjim.com/basics/coefficient-variation/)

### Cronbach's alpha (internal consistency)

- α ≥ 0.7 = acceptable
- α ≥ 0.8 = good
- α ≥ 0.9 = excellent (potentially redundant dimensions if too high)

References:
- [Cronbach's Alpha — Wikipedia](https://en.wikipedia.org/wiki/Cronbach%27s_alpha)
- [Making Sense of Cronbach's Alpha — PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC4205511/)
- [Cronbach's Alpha Thresholds — NextPublishers](https://nextpublishers.com/cronbachs-alpha-acceptable-thresholds-and-what-to-do-if-its-low/)
- [Aberrant Abundance of Alpha at .70 — Sage 2025](https://journals.sagepub.com/doi/10.1177/25152459241287123)

### Cohen's kappa (inter-rater reliability)

- κ ≥ 0.6 = substantial agreement
- κ ≥ 0.8 = near-perfect agreement
- κ < 0.4 = poor — your judges disagree

References:
- [Cohen's Kappa — Wikipedia](https://en.wikipedia.org/wiki/Cohen%27s_kappa)
- [Cohen's Kappa — PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC3900052/)
- [Cohen's Kappa for AI Evaluation — Galileo](https://galileo.ai/blog/cohens-kappa-metric)

### Ceiling and floor effects

- If >20% of scores are at the maximum → ceiling effect (compression at the top)
- If >20% are at the minimum → floor effect (compression at the bottom)

References:
- [Ceiling & Floor Effects — Cogn-IQ](https://www.cogn-iq.org/learn/theory/ceiling-floor-effects/)

## Industry Examples (Compression Mitigation in the Wild)

- **HumanEval / MBPP**: binary pass/fail; no compression because no scale
- **MT-Bench**: 1-10 with category-specific anchors. Compression observed; mitigated by anchor refresh + multi-judge
- **AlpacaEval**: head-to-head pairwise — pairwise is the deliberate design choice for the variance reduction
- **HELM**: explicit holistic evaluation across multiple axes with per-axis metrics; reports per-axis variance
- **Anthropic Constitutional AI**: uses paired preferences during reward modeling, not absolute scores
- **OpenAI Evals framework**: extensive use of golden answers for calibration

References:
- [MT-Bench — Klu](https://klu.ai/glossary/mt-bench-eval)
- [AlpacaEval](https://tatsu-lab.github.io/alpaca_eval/)
- [HELM — Stanford CRFM](https://crfm.stanford.edu/helm/)
- [OpenAI Evals — GitHub](https://github.com/openai/evals)
- [OpenAI Evaluation Best Practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices)
- [Anthropic — Demystifying Evals for AI Agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- [Anthropic — Constitutional AI](https://www.anthropic.com/research/constitutional-ai-harmlessness-from-ai-feedback)
- [Constitutional AI, arXiv 2212.08073](https://arxiv.org/abs/2212.08073)
- [Anatomy of an LLM Benchmark — Cameron Wolfe](https://cameronrwolfe.substack.com/p/llm-bench)
- [Rubric-Based Evals — Adnan Masood](https://medium.com/@adnanmasood/rubric-based-evals-llm-as-a-judge-methodologies-and-empirical-validation-in-domain-context-71936b989e80)

## Application to This Repo (Score Compression)

See `docs/plans/eval-weighting-decompression.md` (in the workspace orchestration repo, not bundled with this package) for the concrete six-intervention plan applied to:
- `skills/evaluation/SKILL.md` (1-5 scale)
- `skills/self-evaluation/SKILL.md` (1-5 scale)
- `.claude/agents/experiment-judge.md` (110-pt, 13 dims)
- `.claude/agents/fusion-judge.md` (100-pt, 6 dims)
- `lib/audit/graders/concept-grader-prompt.md` (0–100 × 7 dims; primary dimension required, non-primary dimensions may be null)
- `lib/audit/graders/application-grader-prompt.md` (0–100 × 4 axes — migrated from 0/1/2 on 2026-06-11)

> **2026-06-11/12 reconciliation (application + comprehension graders).** The application grader moved from a coarse 0/1/2 per-axis scale to free-continuous 0–100 on 2026-06-11; the comprehension grader followed on 2026-06-12. The 0/1/2 scale was originally chosen to fight the compression documented above, but it carried a side effect this research did not weigh: on a 3-point scale a strong frontier *baseline* (the no-skill arm) is forced to the ceiling (2/2), auto-tripping baseline saturation with zero headroom to measure the skill's marginal lift — the ceiling effect (see [Ceiling & Floor Effects](https://www.cogn-iq.org/learn/theory/ceiling-floor-effects/) in the sources). 0–100 restores that headroom. The compression risk this doc documents is REAL on a wide scale and is mitigated, not ignored: both graders retain their Anti-Compression Mandate (use the full range including the tails, anchor on the calibration set, do not round upward into the next band) and `eval-discriminability-report.js` (CV / Cronbach's α / histogram) is the empirical backstop if compression resurfaces.

## Sources (Score Compression Research)

### LLM-as-judge bias and compression
- [Evaluating Scoring Bias in LLM-as-a-Judge — arXiv 2506.22316](https://arxiv.org/html/2506.22316v1)
- [Justice or Prejudice? Quantifying Biases in LLM-as-a-Judge — arXiv 2410.02736](https://arxiv.org/html/2410.02736v1)
- [LLM Judges Are Unreliable — Collective Intelligence Project](https://www.cip.org/blog/llm-judges-are-unreliable)
- [The Silent Judge: Unacknowledged Shortcut Bias — arXiv 2509.26072](https://arxiv.org/html/2509.26072v2)
- [How to Correctly Report LLM-as-a-Judge Evaluations — arXiv 2511.21140](https://arxiv.org/abs/2511.21140)
- [Score Range Bias — Emergent Mind](https://www.emergentmind.com/topics/score-range-bias)
- [Quantitative LLM Judges — arXiv 2506.02945](https://arxiv.org/html/2506.02945v1)
- [Overconfidence in LLM-as-a-Judge — arXiv 2508.06225](https://arxiv.org/html/2508.06225v2)
- [Judge Reliability Harness — arXiv 2603.05399](https://arxiv.org/html/2603.05399v1)
- [Self-Preference Bias — arXiv 2410.21819](https://arxiv.org/html/2410.21819v2)
- [Using LLMs for Evaluation — Cameron Wolfe](https://cameronrwolfe.substack.com/p/llm-as-a-judge)
- [LLM-as-a-Judge Done Right — Kinde](https://www.kinde.com/learn/ai-for-software-engineering/best-practice/llm-as-a-judge-done-right-calibrating-guarding-debiasing-your-evaluators/)
- [Biases in GPT-4o, Claude, Qwen2.5 — Simon Couch](https://simonpcouch.com/blog/2025-01-30-llm-biases/)
- [LLM-as-a-Judge Guide — Evidently AI](https://www.evidentlyai.com/llm-guide/llm-as-a-judge)
- [LLM Evaluation Metrics — Confident AI](https://www.confident-ai.com/blog/llm-evaluation-metrics-everything-you-need-for-llm-evaluation)
- [LLM-as-a-Judge Complete Guide — Confident AI](https://www.confident-ai.com/blog/why-llm-as-a-judge-is-the-best-llm-evaluation-method)
- [Calibrate LLM-as-a-Judge — LangChain](https://www.langchain.com/articles/llm-as-a-judge)
- [LLM Judge Calibration — Deepchecks](https://deepchecks.com/llm-judge-calibration-automated-issues/)

### Anti-compression techniques
- [G-Eval — arXiv 2303.16634](https://arxiv.org/abs/2303.16634)
- [G-Eval — DeepEval docs](https://deepeval.com/docs/metrics-llm-evals)
- [G-Eval — Confident AI](https://www.confident-ai.com/blog/g-eval-the-definitive-guide)
- [G-Eval — Promptfoo](https://www.promptfoo.dev/docs/configuration/expected-outputs/model-graded/g-eval/)
- [Bradley-Terry Model — Wikipedia](https://en.wikipedia.org/wiki/Bradley%E2%80%93Terry_model)
- [LMSYS Chatbot Arena Elo system](https://www.lmsys.org/blog/2023-12-07-leaderboard/)
- [Statistical Framework for Ranking LLM Chatbots — arXiv 2412.18407](https://arxiv.org/html/2412.18407v1)
- [Arena-Lite — EMNLP 2025](https://aclanthology.org/2025.emnlp-main.360.pdf)
- [Pairwise & Elo for LLMs — Brenndoerfer](https://mbrenndoerfer.com/writing/preference-evaluation-pairwise-comparisons-elo-llm)
- [Bradley-Terry — Brenndoerfer](https://mbrenndoerfer.com/writing/bradley-terry-model-pairwise-preferences-rankings)
- [BARS — AIHR](https://www.aihr.com/blog/behaviorally-anchored-rating-scale/)
- [BARS — Asanify](https://asanify.com/glossary/bars-method-performance-appraisal/)
- [BARS — PerformYard](https://www.performyard.com/articles/what-are-behaviorally-anchored-rating-scales-bars)
- [BARS pros/cons — Bryq](https://www.bryq.com/blog/behaviorally-anchored-rating-scale-bars)
- [Forced Ranking — SHRM](https://www.shrm.org/topics-tools/news/hr-magazine/forced-ranking)
- [Anchoring Effects — Jacowitz & Kahneman 1995](https://journals.sagepub.com/doi/10.1177/01461672952111004)

### Discriminative power metrics
- [Cronbach's Alpha — Wikipedia](https://en.wikipedia.org/wiki/Cronbach%27s_alpha)
- [Making Sense of Cronbach's Alpha — PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC4205511/)
- [Cronbach's Alpha Thresholds — NextPublishers](https://nextpublishers.com/cronbachs-alpha-acceptable-thresholds-and-what-to-do-if-its-low/)
- [Aberrant Abundance of Alpha at .70 — Sage 2025](https://journals.sagepub.com/doi/10.1177/25152459241287123)
- [Coefficient of Variation — Wikipedia](https://en.wikipedia.org/wiki/Coefficient_of_variation)
- [Coefficient of Variation — Statistics By Jim](https://statisticsbyjim.com/basics/coefficient-variation/)
- [Ceiling & Floor Effects — Cogn-IQ](https://www.cogn-iq.org/learn/theory/ceiling-floor-effects/)
- [Cohen's Kappa — Wikipedia](https://en.wikipedia.org/wiki/Cohen%27s_kappa)
- [Cohen's Kappa — PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC3900052/)
- [Inter-Rater Reliability — Wikipedia](https://en.wikipedia.org/wiki/Inter-rater_reliability)
- [IRR Statistical Methods — RPA Journal](https://www.rpajournal.com/dev/wp-content/uploads/2024/03/Examining-Statistical-Methods-for-Interrater-Reliability-RPA.pdf)
- [Cohen's Kappa for AI Evaluation — Galileo](https://galileo.ai/blog/cohens-kappa-metric)
