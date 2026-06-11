# Rubric Design Best Practices

> Research-grounded guidance on scale ranges, dimensional weighting, holistic vs analytic scoring, and rubric construction for LLM-as-judge and human-evaluation systems.
> Last updated: 2026-06-03

## Optimal Scale Ranges

### 5-7 points is the psychometric sweet spot

Across HR, medical, academic, and AI evaluation literature:
- **2-4 points**: poor reliability, can't discriminate
- **5-7 points**: **optimal** — best balance of discrimination and judge reliability
- **8-10 points**: diminishing returns, requires very strong anchors
- **11+ points**: reliability *decreases* — judges can't distinguish 11 levels reliably

This is grounded in Miller's "magical number seven" — humans (and LLMs) reliably discriminate ~7 categories of any unidimensional stimulus.

References:
- [Likert Scale Review — HAL](https://hal.science/hal-03741841/document)
- [Taufique 2024 — Wiley GBOE Likert Review](https://onlinelibrary.wiley.com/doi/10.1002/joe.70032)
- [Miller (1956) — Magical Number Seven](https://labs.la.utexas.edu/gilden/files/2016/04/MagicNumberSeven-Miller1956.pdf)
- [Miller's Law — Laws of UX](https://lawsofux.com/millers-law/)
- [Likert in Psychometrics — Cogn-IQ](https://www.cogn-iq.org/learn/theory/likert-scale/)
- [Likert Scale — Simply Psychology](https://www.simplypsychology.org/likert-scale.html)
- [Likert Scale — Wikipedia](https://en.wikipedia.org/wiki/Likert_scale)
- [5 vs 7 Point — Enquete](https://www.enquete.com/en/blog-1295-5-point-vs-7-point-likert-scale--which-one-should-you-use-)
- [Evidence Against 5-Point Scales — UXPA](https://uxpajournal.org/response-interpolation-and-scale-sensitivity-evidence-against-5-point-scales/)
- [Likert-Type Scale — MDPI Encyclopedia](https://www.mdpi.com/2673-8392/5/1/18)

### 100-point rubrics are aggregation theatre

A 100-point or 110-point rubric does NOT yield 100 levels of discrimination. LLM judges collapse them to **~5-10 effective bands**. The apparent granularity is illusory.

The correct pattern: score 1-5 (or 1-7) per dimension with strong anchors, then weight and rescale to a headline number only if downstream consumers need it. The judge never makes a 100-way choice; it makes ~5-way choices per dimension.

### Bipolar vs unipolar

- **Unipolar** (0 to N): use when measuring presence/intensity ("how much")
- **Bipolar** (-N to +N or 1 to 2N+1): use when measuring direction ("better or worse than baseline")

For absolute quality: unipolar. For deltas (with-skill vs baseline): bipolar.

### Forced-choice vs unforced

- **Odd-numbered scales** (5, 7) include a neutral midpoint — judges retreat there under uncertainty
- **Even-numbered scales** (4, 6) force a directional choice — reduces central tendency but may force false precision

For LLM judges: odd-numbered scales with strong anchors reduce false precision better than even-numbered scales.

## Rubric Weighting Techniques

### Equal weights vs analytic hierarchy

- **Equal weights**: simple, transparent. Acceptable when dimensions are genuinely commensurate.
- **AHP (Analytic Hierarchy Process)**: pairwise dimension comparisons to derive weights. Best when stakeholders disagree on importance.
- **MAUT (Multi-Attribute Utility Theory)**: explicit utility functions per dimension. Best when dimensions have different ranges/units.

References:
- [Analytic Hierarchy Process — Wikipedia](https://en.wikipedia.org/wiki/Analytic_hierarchy_process)
- [AHP Revolution and Evolution — Tavana](http://tavana.us/publications/ANOR-AHP.pdf)
- [AHP for Creative Product Evaluation — Springer](https://link.springer.com/article/10.1007/s10763-013-9485-x)
- [What is AHP — 1000minds](https://www.1000minds.com/decision-making/analytic-hierarchy-process-ahp)
- [MAUT Introduction — Medium](https://medium.com/@vrajpatel9988/introduction-of-maut-and-mcda-9802b547506c)
- [MAUT — ML Wiki](http://mlwiki.org/index.php/Multi-Attribute_Utility_Theory)
- [MAUT — CIO Wiki](https://cio-wiki.org/wiki/Multi-Attribute_Utility_Theory_(MAUT))

### Weighted arithmetic mean vs weighted geometric mean

- **Weighted arithmetic mean** (sum): default. Strong dimensions can mask weak ones.
- **Weighted geometric mean** (product): one zero kills the score. Use for **gating** dimensions like correctness, safety.
- **Minimum gate**: simplest implementation of the geometric-mean intuition. "If any critical dim < 3, total capped at 60." Judge-readable.

For critical dimensions (correctness, safety, data integrity): use a min-gate or geometric mean. Do NOT use arithmetic mean.

## Holistic vs Analytic Rubrics

### Analytic

- Each dimension scored separately
- Total = weighted aggregation
- Pros: explainable, diagnostic, can identify weak dimensions
- Cons: more judge effort, dimension boundaries can be artificial

### Holistic

- Single overall score per output, no decomposition
- Pros: faster, matches how experts actually judge
- Cons: opaque, no diagnostic signal, harder to calibrate across judges

### Single-point rubric

- Defines only the "proficient" standard
- Judge notes deviations above (strengths) and below (concerns)
- Pros: focuses on the standard, less prescriptive
- Cons: requires very experienced judges; not suitable for LLM judges

For LLM judges: **analytic with strong behavioral anchors** is the right default. Holistic only when the dimensions can't be cleanly separated (e.g., aesthetic quality).

References:
- [Holistic vs Analytic Rubrics — DePaul](https://resources.depaul.edu/teaching-commons/teaching-guides/feedback-grading/rubrics/Pages/types-of-rubrics.aspx)
- [Holistic, Analytic, Single-Point — Cult of Pedagogy](https://www.cultofpedagogy.com/holistic-analytic-single-point-rubrics/)
- [Modeling Holistic Marks With Analytic Rubrics — Frontiers](https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2019.00089/full)
- [Holistic vs Analytic in Clinical Medicine — PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC5989338/)

## Industry Examples (Rubric Design)

### LLM evaluation benchmarks

- **MT-Bench (LMSYS)**: 1-10 with category-specific anchors. Two-turn dialogues. Compression observed; mitigated by anchor refresh + multi-judge.
- **AlpacaEval**: head-to-head pairwise. Pairwise is the deliberate design — variance reduction over pointwise.
- **HELM (Stanford)**: explicit holistic evaluation across multiple axes; reports per-axis variance and disagreement.
- **HumanEval, MBPP**: binary pass/fail. No scoring compression because no scale — but no quality discrimination either.
- **G-Eval**: chain-of-thought + token-probability weighting to extract graded signal even when surface score is always "4".

References:
- [MT-Bench — Klu](https://klu.ai/glossary/mt-bench-eval)
- [AlpacaEval](https://tatsu-lab.github.io/alpaca_eval/)
- [HELM — Stanford CRFM](https://crfm.stanford.edu/helm/)
- [OpenAI Evals — GitHub](https://github.com/openai/evals)
- [OpenAI Evaluation Best Practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices)
- [OpenAI Model Spec Evals](https://alignment.openai.com/model-spec-evals/)

### Frontier model labs

- **Anthropic Constitutional AI**: uses paired preferences during reward modeling, not absolute scores. Demystifying-evals essay recommends rubrics with concrete behavioral criteria.
- **OpenAI evals framework**: extensive use of golden answers for in-prompt calibration.

References:
- [Anthropic — Demystifying Evals for AI Agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- [Anthropic — Constitutional AI](https://www.anthropic.com/research/constitutional-ai-harmlessness-from-ai-feedback)
- [Constitutional AI — arXiv 2212.08073](https://arxiv.org/abs/2212.08073)
- [Anatomy of an LLM Benchmark — Cameron Wolfe](https://cameronrwolfe.substack.com/p/llm-bench)
- [Rubric-Based Evals — Adnan Masood](https://medium.com/@adnanmasood/rubric-based-evals-llm-as-a-judge-methodologies-and-empirical-validation-in-domain-context-71936b989e80)

## Construction Checklist

When designing a new rubric:

1. **Choose scale size by judge type**:
   - Human expert: 5-7
   - LLM judge: 5
   - High-stakes binary decision: 2 (pass/fail)
2. **Write behavioral anchors at every level**, not just labels. Each anchor: one observable behavior + one worked example from the actual corpus.
3. **Limit dimensions to 5-9 per rubric**. More than 9 → split into multiple rubrics or judges.
4. **Set weights deliberately**. Equal weights are fine unless one dimension is genuinely more critical.
5. **Add a min-gate on critical dimensions**. Correctness, safety, data integrity should not be averageable.
6. **Include a calibration set in the prompt** (LLM judges) — 1 worked example per score level.
7. **Force the judge to identify the nearest calibration example BEFORE scoring**. Anti-compression step.
8. **Measure discriminability**: emit CV, Cronbach's alpha, histograms per dimension. Flag dimensions with CV < 0.1 as compressed.
9. **For N-candidate winner selection, prefer pairwise**. Bradley-Terry over rubric for the actual decision.
10. **Use multiple judges from different model families** for tier-1 decisions. Treat disagreement as a signal.
11. **Randomize presentation order in every pairwise comparison** (and every before/after comparison). Pairwise LLM judges carry a strong, significant second-position/recency bias. Run both orders and require agreement, or randomize order per trial. See § Pairwise Judging: Neutralize Position Bias.

## Anti-Patterns

| Anti-pattern | Why it fails | Do instead |
|---|---|---|
| Vague labels ("excellent", "good") | Judge defaults to central tendency | Replace with observable behaviors + worked examples (BARS) |
| 100-point or 110-point scales | Illusory granularity; judge collapses to 5-10 bands | Score 1-5 per dim, weight and rescale |
| Weighted arithmetic mean on critical dims | Strong dims mask weak ones | Min-gate or weighted geometric mean |
| No calibration set in prompt | Judge never predicts certain scores | Embed 1 worked example per level |
| Single judge, single run | High variance, low reliability | Multi-judge ensemble, average across N runs |
| Pointwise scoring for N-candidate selection | ~10x more variance than pairwise | Bradley-Terry / Elo tournament |
| Single-direction pairwise comparison (fixed A-then-B order) | Judge favors the second-shown by a large, significant margin (win-rate flipped 2.5%→82.5% on reorder) | Run both orders and require agreement, or randomize order per trial |
| Never measuring discriminability | Can't detect compression when it happens | Emit CV / Cronbach's alpha / histogram per dim |

## Pairwise Judging: Neutralize Position Bias

Pairwise comparison is the recommended decision form for N-candidate selection (lower variance than pointwise), but the **same judge that is more reliable pairwise is also strongly biased toward whichever response it sees SECOND**. This is mandatory to mitigate in every audit-loop pairwise judge.

**Evidence.** A single-direction pairwise comparison flipped a model's win-rate from 2.5% to 82.5% purely by reordering the two responses (Arena-Lite, EMNLP 2025; LMSYS Chatbot Arena). In-repo (SKI-49, 2026-05-29 structure A/B, Opus judge): first-shown win-rate among decisive trials was 1/19, p=0.0001; overall p=0.0007–0.026 across pairs. Per-trial presentation-order randomization neutralized it — the win tallies stayed balanced.

**The requirement.** Every pairwise (and every before/after) LLM-judge in the audit/eval tooling MUST do one of:

1. **Run both orders and require agreement** — compare A-then-B and B-then-A; a clean winner needs both directions to agree, otherwise split credit / call it a tie. This is the strongest mitigation and the one `fusion-judge` uses (the Bradley-Terry tournament runs each pair twice with positions swapped).
2. **Randomize order per trial** — present the two responses in a coin-flipped order each trial (seeded so the run is reproducible) and de-randomize the recorded verdict back to the real arms. This is what the `structure-ab` harness uses.

For a **labeled** comparison where the two items are not interchangeable (before/after, baseline/with-skill), score each side on its **absolute** anchor independently — never as "is the second one better?" — so recency cannot inflate the second-examined side. See `.claude/agents/experiment-judge.md` § Anti-Position-Bias Mandate.

**Compliance (audit-loop pairwise judges).** `fusion-judge` (both-orders + agreement) ✓; `structure-ab` (per-trial randomized coin) ✓; `experiment-judge` (independent absolute before/after scoring) ✓; the **application comparative grader** (`lib/audit/application-eval.js::gradeApplicationPairwiseBothOrders`, option 1 — runs both `['baseline','with_skill']` and `['with_skill','baseline']` per trial and requires agreement; on disagreement it drops the pairwise signal to a tie with confidence 0 so the per-case verdict rests on the independent absolute axis scores) ✓ (A8, 2026-06-11T — replaced the prior cross-trial order alternation, which only averaged position bias across trials and left a single trial's pairwise verdict exposed to pure position artifact). Any new pairwise judge MUST satisfy this section before it is wired into the loop.

## Application to This Repo (Rubric Design)

See:
- [score-compression-research.md](score-compression-research.md) — companion file on the compression problem itself
- `docs/plans/eval-weighting-decompression.md` (in the workspace orchestration repo, not bundled with this package) — concrete six-intervention plan for the workspace scoring systems

## Sources (Rubric Best Practices)

### Scale ranges and Likert
- [Likert Scale Review — HAL](https://hal.science/hal-03741841/document)
- [Taufique 2024 — Wiley GBOE Likert Review](https://onlinelibrary.wiley.com/doi/10.1002/joe.70032)
- [Miller (1956) — Magical Number Seven](https://labs.la.utexas.edu/gilden/files/2016/04/MagicNumberSeven-Miller1956.pdf)
- [Miller's Law — Laws of UX](https://lawsofux.com/millers-law/)
- [Likert in Psychometrics — Cogn-IQ](https://www.cogn-iq.org/learn/theory/likert-scale/)
- [Likert Scale — Simply Psychology](https://www.simplypsychology.org/likert-scale.html)
- [Likert Scale — Wikipedia](https://en.wikipedia.org/wiki/Likert_scale)
- [5 vs 7 Point — Enquete](https://www.enquete.com/en/blog-1295-5-point-vs-7-point-likert-scale--which-one-should-you-use-)
- [Evidence Against 5-Point Scales — UXPA](https://uxpajournal.org/response-interpolation-and-scale-sensitivity-evidence-against-5-point-scales/)
- [Likert-Type Scale — MDPI Encyclopedia](https://www.mdpi.com/2673-8392/5/1/18)

### Rubric weighting and aggregation
- [Analytic Hierarchy Process — Wikipedia](https://en.wikipedia.org/wiki/Analytic_hierarchy_process)
- [AHP Revolution and Evolution — Tavana](http://tavana.us/publications/ANOR-AHP.pdf)
- [AHP for Creative Product Evaluation — Springer](https://link.springer.com/article/10.1007/s10763-013-9485-x)
- [What is AHP — 1000minds](https://www.1000minds.com/decision-making/analytic-hierarchy-process-ahp)
- [MAUT Introduction — Medium](https://medium.com/@vrajpatel9988/introduction-of-maut-and-mcda-9802b547506c)
- [MAUT — ML Wiki](http://mlwiki.org/index.php/Multi-Attribute_Utility_Theory)
- [MAUT — CIO Wiki](https://cio-wiki.org/wiki/Multi-Attribute_Utility_Theory_(MAUT))

### Holistic vs analytic
- [Holistic vs Analytic Rubrics — DePaul](https://resources.depaul.edu/teaching-commons/teaching-guides/feedback-grading/rubrics/Pages/types-of-rubrics.aspx)
- [Holistic, Analytic, Single-Point — Cult of Pedagogy](https://www.cultofpedagogy.com/holistic-analytic-single-point-rubrics/)
- [Modeling Holistic Marks With Analytic Rubrics — Frontiers](https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2019.00089/full)
- [Holistic vs Analytic in Clinical Medicine — PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC5989338/)

### Industry examples (sources)
- [MT-Bench — Klu](https://klu.ai/glossary/mt-bench-eval)
- [AlpacaEval](https://tatsu-lab.github.io/alpaca_eval/)
- [HELM — Stanford CRFM](https://crfm.stanford.edu/helm/)
- [OpenAI Evals — GitHub](https://github.com/openai/evals)
- [OpenAI Evaluation Best Practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices)
- [OpenAI Model Spec Evals](https://alignment.openai.com/model-spec-evals/)
- [Anthropic — Demystifying Evals for AI Agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- [Anthropic — Constitutional AI](https://www.anthropic.com/research/constitutional-ai-harmlessness-from-ai-feedback)
- [Constitutional AI — arXiv 2212.08073](https://arxiv.org/abs/2212.08073)
- [Anatomy of an LLM Benchmark — Cameron Wolfe](https://cameronrwolfe.substack.com/p/llm-bench)
- [Rubric-Based Evals — Adnan Masood](https://medium.com/@adnanmasood/rubric-based-evals-llm-as-a-judge-methodologies-and-empirical-validation-in-domain-context-71936b989e80)
