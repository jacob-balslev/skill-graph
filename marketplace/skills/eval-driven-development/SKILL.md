---
name: eval-driven-development
description: "Use when building language-model-integrated systems by writing evaluations before and alongside the system: the statistical (not binary) nature of LLM evals, the five primitives (dataset, evaluation function, aggregation, iteration loop, regression budget), the judgment-mechanism taxonomy (programmatic, model-graded, human-graded, preference comparison), the eval-surface stack (final response, trajectory/tool-use, retrieval/RAG, safety, cost), the statistical-significance discipline (paired tests, bootstrap CI on the delta, minimum-detectable-effect), trajectory-vs-final-output evaluation for multi-step agents, judge calibration and bias, Goodhart's Law and suite saturation, and the offline-eval-vs-production-telemetry distinction. Do NOT use for deterministic unit testing or general TDD (use testing-strategy), production monitoring (use evaluation or error-tracking), or building individual eval rubrics and task sets (use agent-eval-design — it owns construction; this skill owns iteration discipline)."
license: MIT
allowed-tools: Read Grep
metadata:
  subject: ai-engineering
  deployment_target: portable
  scope: "Building language-model-integrated systems by writing evaluations before and alongside the system — the statistical (not binary) nature of LLM evals, the five primitives (dataset, evaluation function, aggregation, iteration loop, regression budget), the judgment-mechanism taxonomy (programmatic, model-graded, human-graded, preference comparison, trace/hybrid), the eval-surface stack (final response, trajectory/tool-use, retrieval/RAG, safety, side effects, cost/latency), continuous evals and model/vendor-upgrade gates, system-specific evals vs canonical benchmarks (MMLU, HumanEval, BIG-bench, GAIA), how evals drive prompt/model/scaffolding/tooling changes, the statistical-significance discipline (paired difference tests, McNemar's test for paired binary outcomes, bootstrap confidence intervals on the delta, minimum-detectable-effect, clustered standard errors, slice vetoes), trajectory-vs-final-output evaluation for multi-step agents, RAG eval surfaces (context recall/precision, faithfulness, answer relevance), model-grader calibration and bias mitigation, eval-awareness and benchmark-contamination risk, Goodhart's Law and suite saturation, cost-aware regression budgets, and the offline-eval-vs-production-telemetry distinction with its graded rollout spectrum. Portable across any LLM-integrated system; principle-grounded, not repo-bound. Excludes deterministic unit testing and general TDD (testing-strategy), production monitoring (evaluation, error-tracking, observability-modeling), and constructing individual eval rubrics, task sets, graders, hard negatives, and traces (agent-eval-design owns construction; this skill owns iteration discipline)."
  taxonomy_domain: agent/evaluation
  stability: experimental
  keywords: "[\"eval-driven development\",\"LLM evals\",\"continuous evals\",\"evaluation harness\",\"agent trajectory eval\",\"LLM-as-judge\",\"model-graded eval\",\"regression budget\",\"eval statistical significance\",\"model upgrade eval\"]"
  triggers: "[\"how do we know this prompt change improved things\",\"should this be an eval or a unit test\",\"the model passes the benchmark but fails in production\",\"what should we measure before changing the agent\",\"the LLM-as-judge gives different scores each run\",\"is this eval delta statistically significant\",\"how do we eval a multi-step agent not just the final answer\",\"can we upgrade this model safely\",\"how should traces become eval cases\"]"
  examples: "[\"design an offline eval suite for an LLM-integrated summarization feature before writing the prompt\",\"structure an iteration loop where each prompt, retrieval, tool, or model change is gated by a regression budget\",\"the new prompt scored 3 points higher on 30 examples — is that real or noise?\",\"decide whether a model upgrade should merge when the headline score improves but one high-risk slice regresses\",\"explain how production traces and user feedback should feed a private eval set without replacing offline evals\"]"
  anti_examples: "[\"write unit tests for a deterministic data transformation (use testing-strategy)\",\"create the exact rubric and hard negatives for this agent eval (use agent-eval-design)\",\"set up production alerting on API error rates (use error-tracking or observability-modeling)\",\"interpret this scorecard or benchmark result without changing an LLM-system eval loop (use evaluation)\"]"
  relations: "{\"related\":[\"agent-eval-design\",\"evaluation\",\"testing-strategy\",\"prompt-injection-defense\",\"tool-call-flow\",\"error-tracking\",\"observability-modeling\",\"type-safety\"],\"boundary\":[{\"skill\":\"agent-eval-design\",\"reason\":\"eval-driven-development owns the change-gating discipline that uses eval suites; agent-eval-design owns construction of task sets, rubrics, graders, hard negatives, traces, and thresholds\"},{\"skill\":\"evaluation\",\"reason\":\"eval-driven-development owns iterative LLM-system change gates and regression budgets; evaluation owns general scoring frameworks and result interpretation\"},{\"skill\":\"prompt-injection-defense\",\"reason\":\"eval-driven-development owns measuring whether a prompt-injection defense holds; prompt-injection-defense owns the security property and threat model itself\"}],\"verify_with\":[\"agent-eval-design\",\"evaluation\",\"testing-strategy\"]}"
  grounding: "{\"subject_matter\":\"Eval-driven development for LLM-integrated systems\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://developers.openai.com/api/docs/guides/evaluation-best-practices\",\"https://developers.openai.com/api/reference/resources/evals\",\"https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents\",\"https://platform.claude.com/docs/en/test-and-evaluate/develop-tests\",\"https://adk.dev/evaluate/\",\"https://inspect.aisi.org.uk/\",\"https://docs.langchain.com/oss/python/langchain/test/evals\",\"https://mlflow.org/docs/latest/genai/eval-monitor/scorers/index.html\",\"https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/\",\"https://arxiv.org/abs/2406.19314\",\"https://arxiv.org/abs/2405.16281\"],\"failure_modes\":[\"model_change_ships_on_vibes_without_private_eval_gate\",\"single_run_pass_mistaken_for_distributional_quality\",\"public_benchmark_score_replaces_system_specific_eval\",\"headline_average_hides_slice_regression\",\"delta_declared_real_without_significance_test\",\"model_judge_bias_or_drift_goes_uncalibrated\",\"trace_level_agent_failure_hidden_by_final_answer_score\",\"production_telemetry_ignored_in_eval_refresh_loop\",\"eval_tooling_mistaken_for_eval_discipline\",\"rag_retrieval_failure_hidden_by_final_answer_score\",\"near_perfect_suite_saturation_mistaken_for_certification\",\"post_hoc_eval_spec_written_after_seeing_results\",\"cost_or_latency_regression_hidden_by_quality_delta\",\"benchmark_contamination_mistaken_for_generalization\"],\"evidence_priority\":\"equal\"}"
  mental_model: "|"
  purpose: "|"
  boundary: "|"
  analogy: "Eval-driven development is to LLM system engineering what crash-test ratings are to automotive safety — you do not ship a car based on how well it parked in your driveway; you ship it after a battery of standardized tests on representative crash scenarios, with the pass-rate against named criteria as the gating signal. A score of 4.3 stars across the suite is the only defensible claim of 'safer'; a developer's intuition that 'the new model feels smarter' is the unmeasured equivalent of 'I drove it home, it seemed fine.' And just as a crash lab that the manufacturer trains its cars to detect stops measuring real safety, an eval the model can recognize as a test stops measuring real behavior."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/ai-engineering/eval-driven-development/SKILL.md
  skill_graph_export_description: shortened for Agent Skills 1024-character description limit; canonical source keeps the full routing contract
  skill_graph_canonical_description_length: "1412"
---

# Eval-Driven Development

## Coverage

The practice of building language-model-integrated systems by writing evaluations before and alongside the system, then using the eval suite's measured signal to gate every meaningful change. Covers:

- The statistical (not binary) nature of LLM evaluation: pass-rate, score distribution, repeated runs, slice variance, confidence intervals, and minimum detectable change.
- The five primitives: dataset, evaluation function, aggregation, iteration loop, regression budget.
- Where eval datasets come from (production logs, user-feedback capture, hand-authoring, prior failures, adversarial generation, synthetic generation) and how origin determines representativeness.
- The judgment-mechanism taxonomy (programmatic / model-graded / human-graded / preference comparison / trace-hybrid) and its cost dimension.
- The eval surface stack: final response, trajectory/tool-use, retrieval/context use, safety/boundary, side effects, cost/latency — and which layer must block merge.
- RAG-specific eval surfaces: context precision, context recall, faithfulness/groundedness, answer relevance, citation support.
- The discipline of distinguishing a real improvement from sampling noise: paired difference tests, McNemar's test for paired binary outcomes, bootstrap confidence intervals on the delta, minimum-detectable-effect, clustered standard errors, and high-risk slice vetoes.
- The distinction between final-output and trajectory evaluation for multi-step agents.
- Continuous evaluation and model/vendor-upgrade gates: rerunning private evals before adopting a new model, API feature, tool runtime, or judge model.
- The distinction between system-specific evals and canonical public benchmarks (MMLU, HumanEval, BIG-bench, GAIA, MT-Bench, HELM, SimpleQA, SWE-bench, τ-bench).
- Why higher scores are not always improvements (Goodhart's Law, including suite saturation at 100%), and the eval-awareness/contamination risk that erodes benchmark validity.
- The pre-registration / spec-first discipline that keeps the iteration loop from degrading into post-hoc p-hacking.
- Cost-aware regression budgets: when a quality gain justifies higher latency, token spend, tool calls, or human-review load.
- Offline evals vs production telemetry: the graded offline→shadow→canary→A/B→full rollout spectrum, and how live traces, feedback, incidents, and A/B tests feed the next eval version without replacing pre-deployment gates.
- The eval-lifecycle archetypes (acceptance, regression, calibration, red-team, cross-model, drift-refresh).

## Philosophy

Building LLM-integrated systems without evals is shipping airplanes based on how good the model feels at the desk. The system's behavior is stochastic, the input space is open-ended, the model may change under you, and the developer's pet examples are not a representative sample of what users will throw at it. An eval suite is the empirical measurement instrument that lets a team distinguish "the new system is better" from "the new system is better on the five examples I happened to inspect."

The discipline's hard part is not writing evals. It is choosing what to measure, encoding the choice into a grader the team agrees with, sampling a dataset that represents production, distinguishing a real improvement from sampling noise, calibrating subjective graders, holding the suite stable while the system changes, and resisting the gravitational pull of Goodhart's Law as the eval suite becomes the optimization target. Teams that get this right ship systems whose quality matches their team's stated definition of "good." Teams that get this wrong ship systems that ace evals and disappoint users.

Eval-driven development is not test-driven development with extra noise. It is empirical engineering applied to systems whose behavior is a distribution rather than a value. The vocabulary overlaps with testing — suite, gate, regression, CI — but the unit of judgment differs. A deterministic unit test asks "did this exact behavior happen?" An LLM eval asks "how often, under which slices, at what cost, with what uncertainty, and against whose definition of quality?"

## The Five Primitives In Practice

| Primitive | What it is | Common encoding | Failure mode if neglected |
|---|---|---|---|
| Eval dataset | Curated input examples representing real use, edge cases, prior failures, and held-out slices | JSONL/CSV/dataset table of inputs, references, expectations, metadata, or trace expectations; checked into version control | "It works for me" with no shared evidence |
| Evaluation function | Per-example grader producing a score | Code scorer, exact/semantic match, model-graded prompt, pairwise preference, human-review UI, trace checker, hybrid scorer | Implicit, undocumented definition of "good" |
| Aggregation | Statistical summary across examples and slices | Pass-rate, weighted pass-rate, mean score, win rate, stratified slice table, distribution, confidence interval | Headline number hides regressions or variance |
| Iteration loop | Baseline → diagnose → change → re-run → compare | CI job, experiment run, dashboard, PR comment, eval ledger | Changes ship without measured comparison |
| Regression budget | Merge policy per metric/slice, including cost/latency tradeoffs | Per-eval policy: "must not regress" / "improvement gates merge" / "watchful" / "human signoff required" / "cost-aware threshold" | Every change becomes a debate about the headline number |

Three invariants keep the loop honest:

- **Keep the eval suite stable while the system changes.** If the dataset, grader, and system all change at once, the comparison anchor is gone and the team is doing parallel experiments.
- **When the eval itself changes, version it as a new measurement instrument.** Re-baseline the old and new system on the new eval if you need continuity; a delta is only comparable across runs on the same dataset version.
- **Pre-register the comparison before seeing candidate results.** At minimum, write the hypothesis, dataset version, primary metric, slice vetoes, judge version, sample size or repeat policy, cost/latency budget, and merge rule. This is the structural defense against post-hoc rationalization (see § Iteration Loop Discipline).

### Where Eval Datasets Come From

The first primitive — the dataset — is only as good as its representativeness, and *origin* determines what population the result can speak for and which blind spots the suite will have. Six common origins, ordered roughly from closest-to-deployment to furthest:

| Origin | What it is | Strength | Limitation |
|---|---|---|---|
| Production log sampling | Real user inputs (and outputs) sampled from the deployed system, then sanitized and labeled | Highest deployment fidelity; cannot be contaminated by public benchmark leakage | Requires a deployed system + capture pipeline; PII/privacy review before use; references are often retroactive; survivorship bias toward inputs that already worked |
| User-feedback capture | Inputs flagged by thumbs-down, escalation, support tickets, or correction | Direct link from real user pain to future gates | Skewed toward known failure shapes; noisy feedback is not automatically a valid eval case; under-samples silent failures users never report |
| Prior failures | Incidents, bad traces, complaints, and regression bugs converted into named cases | Makes fixes durable; keeps high-risk cases visible | Reactive; over-represents known problems if not balanced |
| Hand-authored | Cases written by domain experts to encode the spec and edge cases | Precise coverage of intended behavior and boundary conditions | Reflects what authors *imagine* users do, not what they actually do; small and labor-bound |
| Adversarial generation | Cases deliberately constructed to break the system (red-team, hard negatives, injections, ambiguity, tool misuse) | Surfaces failure modes positive sampling misses; the source of red-herring cases | Not representative of typical-traffic distribution; over-weighting it distorts headline pass-rate |
| Synthetic generation | Cases produced by a model from a spec or seed set | Cheap volume; fills coverage gaps fast | Inherits the generator model's blind spots; can drift from real input distribution; can make the eval easy to game; needs human spot-checks |

A healthy suite blends origins and labels each case with provenance: production-sampled inputs anchor representativeness, hand-authored + adversarial cases pin the spec and the boundaries, prior-failure cases prevent regressions, and synthetic generation fills volume — with the mix and each stratum's weight chosen deliberately, not by whichever data was easiest to collect.

## What To Evaluate — The Eval Surface Stack

"Run the evals" is underspecified until you name *which surface* each eval scores. For simple LLM features, final-output quality may be enough; for agents it is usually too shallow. A complete LLM system has several distinct evaluable surfaces, and grading only the final response — the most common mistake — leaves the others unmeasured.

| Surface | What it scores | Typical mechanism | Skipping it costs you |
|---|---|---|---|
| Final response | Correctness/quality of the user-facing output | Programmatic + model-graded (reference, rubric, pairwise, factuality) | (the baseline; rarely skipped) |
| Trajectory (for agents) | Whether the path — plans, tool selection, arguments, sequence — was correct, efficient, safe | Trajectory-aware grading — see § Evaluating Multi-Step Agents | Right answers reached by broken or unsafe paths that fail in production |
| Retrieval / context (for RAG) | Whether the right context was fetched and faithfully used | Programmatic + model-graded — see § RAG Eval Surfaces | Hallucinations and wrong answers blamed on the generator that are actually retrieval failures |
| Safety / policy | Whether the system refused, redacted, or stayed in policy where required | Programmatic gates + red-team evals — see § Safety And Red-Team Eval Gates | Silent policy violations that only surface as incidents |
| Side effects | Whether destructive or external actions (writes, sends, payments) were correct and authorized | End-state assertions + trajectory action checks | An agent that "succeeded" by taking an action it should not have |
| Cost / latency | Per-request token cost and wall-clock time | Programmatic measurement | Quality gains that quietly triple the bill or the p95 latency (see the cost-aware regression budget) |

A suite that covers only the first row reports a single number that hides failures on every other surface. Decide which surfaces your system actually has, and put at least one eval on each that matters. This skill decides *how those surfaces become a change gate*; `agent-eval-design` owns constructing the exact rubrics and trace schemas.

### RAG Eval Surfaces

Retrieval-augmented systems have a distinct, well-named set of eval dimensions because a RAG answer can fail in two independent places — the retriever fetched the wrong passages, or the generator ignored/contradicted the right ones. A green final answer can hide an unreliable retriever, and a faithful answer can still be useless if the retriever missed the necessary source. Naming the layers separately localizes the failure instead of blaming "the model" (RAGAS framing):

| RAG metric | Question it answers | Gate implication |
|---|---|---|
| Context precision | Are the retrieved chunks relevant, and are the most useful chunks ranked early? | Low precision forces the model to sift noise; tune chunking, retrieval query, reranker, or top-k policy |
| Context recall | Did retrieval include the evidence needed to answer the task? | Low recall is usually a release blocker for knowledge-heavy workflows, even if the generator sometimes guesses correctly; a faithfulness failure with low recall is a *retriever* bug, not a generator bug |
| Faithfulness / groundedness | Are the answer's claims actually supported by the retrieved context? | Unsupported claims block merge for high-risk domains; this is the RAG-specific hallucination measure |
| Answer relevance | Does the answer address the question asked, independent of grounding? | Low relevance points to prompt, routing, context packing, or instruction-following issues |
| Citation support | Do cited passages actually support the statement they are attached to? | Citation failures are separate from answer correctness; a correct answer with bad support still erodes trust |

Report the *failure location*: retrieval miss, ranking/noise problem, context-packing loss, synthesis hallucination, bad refusal, or citation mismatch. The regression budget should say which layer blocks merge and which only triggers diagnosis. These are *eval surfaces to name and measure*, not a RAG-metric construction manual — building the retrieval corpus, the rubric, and the graders is `agent-eval-design`'s territory.

## Safety And Red-Team Eval Gates

Safety evals need named gates, not just a generic "safety score." Separate attack success from false-positive refusal and severity.

| Safety signal | What it measures | Gate style |
|---|---|---|
| Attack success rate | How often adversarial or near-miss inputs bypass the intended boundary | Critical-severity successes veto merge |
| False-positive refusal rate | How often safe, in-scope requests are incorrectly refused | Blocks if user-visible utility falls below the product threshold |
| Severity-weighted failure count | Whether failures are cosmetic, recoverable, policy-relevant, data-exposing, or irreversible | High-severity failures are slice vetoes even when average quality improves |
| Boundary trace correctness | Whether tool calls, approvals, data access, and refusals followed the intended control path | Protocol violations block merge even if the final response looks acceptable |

This skill owns making those signals part of the change gate. The threat model, attack taxonomy, and defense mechanism belong to `prompt-injection-defense` or the relevant safety/security skill.

## Judgment Mechanism Selection

| Mechanism | Best for | Cost per example | Reliability | Watch for |
|---|---|---|---|---|
| Programmatic | Outputs with mechanical correctness: code tests, JSON schema, exact labels, allowed transitions, tool-call sequence | $0 (near zero) | Deterministic when the oracle is valid | Narrow applicability; can miss semantic failures |
| Model-graded | Open-output tasks at scale: summarization, classification, Q&A, instruction following, style, safety classification | $0.001-$0.10 per grade, model-dependent | Useful when calibrated; not self-validating | Verbosity bias, position bias in pairwise, self-preference, correlated error; calibrate against humans |
| Human-graded | Subjective criteria, calibration runs, high-risk slices, ambiguous outputs | $1-$50 per grade, annotator-dependent | Highest validity; lowest scale | Inter-rater agreement must be measured; one rater is not "humans think"; fatigue and inconsistent rubrics matter |
| Preference comparison | Variant selection, model/prompt comparisons | Low to high depending on judge | Often more reliable than absolute scoring — LLMs discriminate between options better than they generate open scores | Randomize order; blind variant labels; inspect ties and slice regressions |
| Trace / program hybrid | Agent workflows, tool use, side effects, retrieval quality | Mixed | Strong when deterministic invariants catch protocol errors and judges score open semantics | Trace logs can show "tool succeeded" while context quality was insufficient |

A practical default: programmatic checks for invariants, model judges for semantic scale, preference comparison for variants, and human review for calibration and high-risk decisions.

**Cost is a design axis, not an afterthought.** Per-grade cost multiplied by suite size multiplied by run frequency is a real budget, and it shapes which mechanism goes where. A 500-example suite graded by a model at ~$0.05/grade is ~$25 per run — runnable on every PR; the same suite under human grading at ~$5/grade is ~$2,500 per run — a quarterly-calibration activity, not a CI gate. The design rule that falls out: put the *highest-frequency* runs (per-commit gates) on the *cheapest adequate* mechanism (programmatic, then model-graded), and reserve human grading for the low-frequency calibration and ambiguous-case sampling that only humans can do. Cost also belongs in the gating decision itself — see the "cost-aware threshold" regression-budget policy and § Cost-Aware Evaluation.

## The Statistics of "Is This Better?"

A pass-rate is an estimate, not a measurement. "Version B scored 3 points higher" is not a shipping argument until you have asked whether the gap survives sampling noise. This is the single most common place eval-driven development degrades into eval-flavored vibes: a team reads two numbers, declares a winner, and ships a change the data does not actually support.

**Report sample size with every pass-rate, mean score, or win rate.** A bare number with no n is not interpretable.

**Compare the delta, not two separate intervals.** The decision rule is whether the **confidence interval on the *difference* (B − A) excludes zero** (or clears the predeclared regression budget) — not whether A's and B's individual intervals fail to overlap (the overlap check is needlessly conservative and throws away power).

**Prefer a paired test on a shared dataset.** Run both system versions on the *same* eval examples and analyze the per-example score differences. Because scores on the same question are positively correlated across versions, the paired estimator removes that shared variance "for free" — a paired t-test or Wilcoxon signed-rank produces a *substantially* tighter confidence interval on the delta than the unpaired equivalent, at the cost of roughly 2× inference (you run both arms). *How much* tighter is not a fixed quantity: it scales with the within-example correlation between the two arms, so the gain is large when versions agree on most examples and modest when they do not — there is no universal "orders of magnitude" multiplier to quote. When you cannot pair (different datasets), fall back to the unpaired interval and expect to need far more data.

**For paired binary pass/fail outcomes, name the test.** McNemar's test (or an exact binomial test on the discordant pairs) is the usual check for whether B fixes more cases than it breaks. The interesting count is not total wins; it is `A fail / B pass` versus `A pass / B fail`.

**Bootstrap the delta when assumptions are shaky.** For small, skewed, or non-normal datasets, compute `delta_i = score_B_i − score_A_i` for each shared example, resample the delta vector with replacement (e.g. 1,000–10,000 resamples), recompute the mean/pass-rate delta, and use the 2.5th and 97.5th percentiles as the approximate 95% interval. Ship only when that CI sits entirely on one side of zero. When central-limit assumptions hold and n is a few hundred or more, a closed-form paired interval (`Δ ± 1.96 × SE(difference)`) is sufficient and bootstrapping is optional.

**Know your minimum detectable effect (MDE) before you run.** Sample size scales **quadratically** with the inverse of the effect you want to detect: detecting a gap half as large requires **4× the samples**. There is no universal "N examples per 1% gap" constant — the requirement depends on the design and the pass-rate. For an *unpaired* one-sample 95% CI with ±1pp half-width, the normal approximation needs roughly `1.96² · p(1−p) / 0.01²` examples: ≈9,600 at p=0.5, ≈6,100 at p=0.8, ≈3,500 at p=0.9 — thousands, not hundreds, to pin a single percentage point. As a rough feel for smaller suites, a binary pass-rate at `n=100` has a 95% half-width of about ±8pp near 80% pass-rate and about ±10pp near 50%; `n=400` cuts those roughly in half. **These figures are the *unpaired* case** — and they are why teams that actually ship on small eval suites run *paired* comparisons, which need far fewer examples for the same MDE (how many fewer depends entirely on the arm correlation, so no fixed per-1pp number is defensible for either design). The practical consequence: a small eval resolves only coarse effects — treat any delta below your design's MDE as "no signal," not "small improvement," and compute that MDE for *your* design and pass-rate rather than trusting a rule of thumb. For finer MDE you need more examples, repeated runs, or token-probability scoring.

**Account for correlated examples (clustered standard errors).** If your dataset contains groups of related examples — multiple questions from one document, paraphrases, translations, repeated tasks from one user — the effective sample size is the number of *clusters*, not the number of rows. Naively treating correlated rows as independent can understate the true standard error by ~3×, turning noise into a false "significant" result. Cluster the standard error on the grouping variable, or treat the cluster count as the effective n.

**Shrink within-question noise with repeats.** A stochastic system gives a different score on the same input across runs. Generating K samples per question and averaging reduces the within-question variance by a factor of K; when token-probability scores are available, that within-question noise can be eliminated entirely. Repeat runs whenever the system, tools, environment, or judge is stochastic enough that one run can flip the result.

**Report slices separately, and treat high-risk slices as veto gates.** Break results out by task type, difficulty, user segment, language, tool path, safety class, context source, model family, and known prior failures. A +5-point average does not justify a critical privacy, safety, tool-side-effect, or grounding regression on a slice.

**Reporting standard.** A defensible eval result reports: mean score, standard error (CLT-based or clustered), the 95% CI on the *delta*, sample size n, cluster count, the slice table, the MDE or threshold, the repeat-run policy, the cost/latency delta, and — for a paired comparison — the correlation between the paired arms. A bare "B scored higher" with none of these is an unverified claim.

> Boundary note: *constructing* the rubric, hard negatives, and acceptance thresholds is `agent-eval-design`'s job; *interpreting whether the delta is real and gating the change on it* is this skill's. The statistics live here because they are the gating decision.

## Iteration Loop Discipline

The eval-driven iteration loop is the development cycle. Run the suite, diagnose failures and slices, choose one meaningful change, re-run the same suite, gate the change on the regression budget.

```text
baseline eval
  -> diagnose failures and slices
  -> choose one meaningful change
  -> re-run the same eval suite
  -> compare against regression budget
  -> merge, iterate, or revert
```

Allowed system changes include prompt wording, system/developer instructions, retrieval query strategy, context packing, tool schema, tool-call policy, model choice, reasoning effort, output format, guardrail policy, and orchestration. The suite should remain stable during the comparison. **Change one thing per iteration** so the eval delta is attributable; if the budget allows multiple changes, gate them as a batch but expect harder root-causing when the batch regresses.

**Pre-register the decision rule before you run (spec-first, anti-p-hacking).** The structural defense against fooling yourself is to write down *what you will measure, the threshold, and the ship/no-ship rule* before you see the result — not after. Before a candidate run, write the eval spec as if it were a test plan: baseline system, candidate change, dataset version, primary metric, secondary metrics, slice vetoes, judge/grader version, sample size or repeat count, MDE, cost/latency ceiling, and merge rule. After the run, record whether the predeclared rule passed. An iteration loop that decides the metric and cutoff *after* looking at the numbers is p-hacking with extra steps: with enough sliced views (this subset, that stratum, this rephrased grader) some comparison will always cross significance by chance, and a team that picks the favorable slice post-hoc ships noise. Treat any post-hoc slice that "looks better" as a *hypothesis for the next pre-registered run*, not as evidence for this one — that is a new experiment, not the same comparison.

**When you must change both the system and the eval:**

1. Freeze the old system and old eval result as the baseline.
2. Add or revise eval cases with a reason: new production failure, drifted product requirement, missing slice, judge bug, or stale benchmark assumption.
3. Run old and new system on the new eval if you need a fair comparison.
4. Record that future deltas are against the new eval version, not the old one.

## Eval Lifecycle Archetypes — Different Jobs, Not One Number

"The eval suite" is usually several suites doing different jobs, and conflating them into a single headline number is a recurring failure: a regression suite and a red-team suite answer opposite questions, and averaging them tells you nothing. Name the archetype each eval belongs to and run it on its own cadence:

| Archetype | Question it answers | When it runs | Gating posture |
|---|---|---|---|
| Acceptance | Does the system meet the bar to ship at all? (a planned capability the system cannot yet pass) | Once per release candidate | Hard gate — starts low; merge requires reaching the product threshold |
| Regression | Did this change break anything that worked? | Every change / PR | Gating — named case or slice must not regress |
| Calibration | Does the model-grader/rubric still agree with humans or a trusted reference? | Periodic cadence (e.g. quarterly) | Watchful — drift triggers re-anchoring, not a block |
| Red-team / adversarial | Can the system be made to fail, leak, or violate policy? | Pre-release + on cadence | Gating on critical cases; tracked otherwise |
| Cross-model | How do candidate models compare on *our* tasks (a model upgrade, reasoning-effort change, vendor switch, or fallback strategy)? | At model-selection decisions | Decision input — compare quality, cost, latency, and high-risk slices; not a merge gate |
| Drift-refresh | Has production behavior or requirements moved since the dataset was written? | When telemetry surfaces drift | New cases are added; old-vs-new comparability is recorded |

The point is not the exact list — it is that a single fragile number conflates jobs that need different datasets, cadences, and gating rules. Splitting the suite by archetype is how you stop a calibration drift from silently masquerading as a quality regression.

## Calibrating Model-Graded Evals (LLM-as-Judge)

Model-graded evals are the workhorse of open-output evaluation, but the judge is itself a stochastic, biased instrument — another model with its own error distribution. Treat it as a measurement instrument that needs calibration, not as neutral authority. Naming the biases and fixing them *mechanically* is operational hygiene, not optional polish.

**Known biases of an LLM judge.** The effect-size column gives *illustrative ranges* — they vary widely by judge model, task, and study, so treat them as "big enough to flip a close call," not as fixed constants; **measure the effect on your own setup** before trusting any number here.

| Bias | What it is | Illustrative effect size | Mechanical fix |
|---|---|---|---|
| Position bias | In pairwise comparison, the judge favors the response in a particular slot regardless of content; strongest when candidates are close in quality | Can shift win-rates by ~10+ points on close calls | Swap positions (A-then-B and B-then-A), average; treat swap-inconsistent verdicts as low-confidence |
| Verbosity / length bias | Longer answers score higher even when the extra content adds nothing | One of the larger, most consistently reported effects | Length-control the candidates, or penalize/normalize for length; include length-matched calibration pairs |
| Self-preference bias | A judge rates its *own model family* higher (genuine quality and bias are *conflated* in raw win-rates) | Reported single-digit to low-double-digit win-rate shifts | Judge from a different top-tier family; detect empirically (below); never let a model be the sole judge of its own family |
| Format bias | Superficial structure (markdown, headers, citation style, confident tone) sways the score independent of substance | Varies; close-call magnitude | Strip/normalize formatting before grading where feasible; rubric anchored to substance; include format-variant calibration examples |
| Calibration drift | A judge anchored to human judgment diverges over time, or a silent provider-side model update shifts scores with a byte-identical prompt | Accumulates until re-anchored | Pin judge versions where possible; recalibrate against humans on a cadence; re-run calibration on every judge-model version bump |

**The fixes are mechanical, not prompt-level.** Adding "evaluate objectively, ignore writing style" to the grader prompt does **not** remove these biases, because they live in the model's embedding distribution, not in surface style. What works:

- **Judge from a different family than the candidate — but only if the cross-family judge is itself a top-tier model.** Diversifying families breaks self-preference bias *only* when the alternate judge is at least as capable as the candidate; grading quality with a *weaker* model to "diversify families" trades one bias for a worse one (an unreliable judge) and is a false economy. If you cannot afford a top-tier judge from a different family, a *same-family top-tier* judge with position-swapping and human calibration is a legitimate fallback — not ideal, but valid when the mechanical mitigations are applied, and strictly better than dropping to a weaker cross-family judge. Never let a model grade its own family's output as the *sole, un-mitigated* judge.
- **Swap positions** (run each pairwise comparison both ways, A-then-B and B-then-A) and average, to cancel position bias. Inconsistent verdicts across the swap are themselves a signal of low-confidence judgments.
- **Ensemble across families for high-stakes decisions.** For a launch gate, run a small multi-family judge panel and aggregate by majority or weighted vote; family-specific biases tend to cancel, at roughly N× the cost of a single judge.
- **Detect self-preference empirically.** Generate the *same* answer with two different families on a calibration set, have each judge score both; if a judge scores its own family's text consistently higher on equivalent content, you have measured the bias and can correct or down-weight that judge.
- **Calibrate against humans on a sample** every cadence (quarterly is a common default). The operational loop has named steps: (1) draw a *stratified* sample of graded examples (cover pass/fail and each criticality band, not just a random slice that under-represents rare-but-important cases); (2) have humans grade that sample blind to the model's score; (3) measure agreement with an inter-rater statistic — Cohen's κ or percent-agreement, not eyeballing — and set a re-anchor threshold below which the judge is not trusted; (4) **re-run the calibration whenever the judge model version changes**, because a silent provider-side update can shift scoring even with a byte-identical prompt. A judge that has not been calibrated since its model last changed is reporting an unverified number.

Estimate judge-bias magnitude on the *local* calibration slice in score points or win-rate points. Do not import universal bias ranges as if they were constants; the size depends on task, rubric, judge model, candidate model, answer length, and how close the variants are.

> Boundary note: this section is the *measurement-hygiene* application of calibration inside the iteration loop. The *design* of the grader rubric and its anchors is `agent-eval-design`; the *general* result-interpretation framework is `evaluation`.

## Evaluating Multi-Step Agents — Trajectory, Not Just Final Output

The five primitives describe the general pattern, but for a multi-step **agent** (one that plans, calls tools, reads results, and iterates) the *unit being graded* shifts. Grading only the final answer is insufficient and actively dangerous: an agent can reach a correct final answer through a broken, wasteful, or unsafe path — calling the wrong tool, fabricating an intermediate result, taking a destructive action that happened not to matter this time — and pass a final-output-only eval while being unfit for production.

**Two complementary metric families:**

| Metric family | Question answered | Examples |
|---|---|---|
| Final-output / outcome | Did the agent end in the correct end state? | Task success, goal completion, end-state assertion |
| Trajectory-aware | Was the *path* correct, efficient, and safe? | Tool-selection accuracy, tool-call argument correctness, plan validity, step efficiency (no needless loops), absence of unsafe intermediate actions |

A complete agent eval scores **both**, because a high outcome score with a poor trajectory score is a strong predictor of brittle production behavior (the agent succeeded by luck or memorization, not by sound process).

**Reference benchmarks for the *shape* of agent evals** (cited for grounding, never for gating your system): τ-bench and τ²-bench (multi-turn tool-use agents in policy-constrained environments with shared world-state), BFCL (function/tool-calling correctness across languages and modes), GAIA and Terminal-Bench (end-to-end multi-step assistant tasks), and the trajectory-aware benchmarks that explicitly score the sequence of tool calls rather than only the final state. Use these to understand what trajectory grading looks like; build your own trajectory eval against your agent's actual tools and policies.

## Public Benchmarks — Cited For Grounding, Not For Gating

Benchmarks measure cross-system capability against a shared standard. They predict how a model will do on the *exact* tasks the benchmark contains. They do not prove your specific system — with your prompt, tools, retrieval, latency budget, and user population — is good enough to ship.

| Benchmark | Measures | Cited for |
|---|---|---|
| MMLU (Hendrycks et al., 2021) | 57 subjects of multiple-choice general knowledge | Breadth of general capability |
| HumanEval (Chen et al., 2021) | 164 programming problems graded by test execution | Code-generation correctness baseline |
| BIG-bench (Srivastava et al., 2022) | 200+ tasks across the long tail of NLP | Breadth of niche capabilities |
| GAIA (Mialon et al., 2023) | General-assistant multi-step tasks with tool use | Realistic agentic-task baseline |
| MT-Bench / Chatbot Arena (Zheng et al., 2023) | Pairwise preference comparison for chat | Human-aligned preference signal |
| HELM (Liang et al., 2022) | Multi-scenario, multi-metric model evaluation | Reminder that single metrics are incomplete |
| SimpleQA | Short fact-seeking questions | Factuality and calibration-style checks |
| SWE-bench family | Real software-issue resolution | Coding-agent capability baseline |
| τ-bench / τ²-bench (2024–2025) | Multi-turn tool-use agents under explicit policies, shared world-state | Agentic / trajectory-task baseline |

The right use: pick a model partly on benchmark performance (and to notice upstream movement), then build system-specific evals to gate the actual deployment.

## Benchmark Validity Is Decaying — Eval-Awareness and Contamination

Two forces erode the gating value of *any* fixed eval over time, and both have sharpened as frontier models have grown more capable (documented across 2025–2026 research):

- **Contamination.** Benchmark questions, solutions, and discussions leak into training data and the public web. A model can then "solve" a contaminated item by recall rather than reasoning, inflating the score without the underlying capability. In one 2026 study a frontier model in a multi-agent configuration *actively found* contaminated items inside a public benchmark and worked backward from the leaked answers.
- **Eval-awareness.** Frontier models can detect features of their environment that signal "this is an evaluation, not real deployment" — and in some cases change behavior accordingly (the documented direction includes models inferring they are being tested without being told which benchmark). When a model behaves differently *because* it knows it is being evaluated, the eval no longer measures deployment behavior.

**Use a contamination register** for every public benchmark or shared eval cited in a decision: record benchmark name, version, release date, task source, whether items are public, any canary/decontamination claims, known leakage flags, and the model's plausible training cutoff. For private evals, record who can see the examples and whether the cases have appeared in prompts, docs, tickets, demos, or fine-tuning data.

**Practical defenses for the eval-driven practitioner** (these specialize the Goodhart defenses below to contamination/awareness):

- Prefer **private, system-specific** eval datasets sampled from *your* production inputs over public benchmarks for any gating decision — private data cannot be contaminated by public leakage and is less likely to trip eval-awareness heuristics.
- Check benchmark cards, maintainer notes, contamination analyses, leaderboard contamination flags, and any decontamination or canary-string policy before using a public score as evidence.
- Favor **time-sliced, live, or continuously updated** benchmarks (e.g. LiveCodeBench, LiveBench) when a benchmark is only being used for model-selection grounding; compare performance on old/static items versus newer or post-cutoff items — a sharp drop on post-cutoff items is contamination evidence to investigate.
- Run near-duplicate checks between private eval items and any training, fine-tuning, documentation, support, or public benchmark material the system may have seen; use memorization probes sparingly (if a model can reproduce benchmark wording or canonical rationales without the task context, treat the score as suspect).
- **Refresh and rotate** held-out examples on a cadence so the suite cannot be memorized or recognized as a known test; keep held-out private cases outside prompts, public docs, demos, and fine-tuning data — if a case leaks, retire it or mark it development-only.
- Make eval inputs **look like real traffic** rather than canonical benchmark phrasing where feasible, and treat any suspiciously large, sudden benchmark jump as a **contamination or eval-awareness hypothesis** to investigate, not an automatic capability win.

## Goodhart's Law In Eval Practice

When the eval becomes the optimization target, the eval ceases to be a good measure of product quality. Symptoms:

- Development-set pass-rate climbs while held-out pass-rate or human reviewers' confidence in the system flattens or declines.
- The system learns phrasings, verbosity, formatting, or refusal patterns the grader rewards but users dislike (e.g., verbose hedging that scores well on rubric, reads poorly on screen).
- A judge favors the model family, style, position, or length rather than the underlying task quality.
- A single headline number improves while a high-risk slice regresses.
- The team stops adding hard cases because they would lower the score.
- A held-out evaluation set, scored fresh, shows worse pass-rate than the development set.
- **The suite saturates — the system aces it (pass-rate at or near 100%).** A suite the system passes completely has stopped discriminating: it can no longer tell a better version from a worse one, so it provides zero gating signal even though the number looks ideal. A 100% pass-rate is a *measurement failure*, not a victory.

Defenses:

- **Hold out a portion of the dataset from active iteration.** Score it periodically; if held-out and development pass-rates diverge, the iteration is over-fitting.
- **Keep a frozen prior-failure set** that every release must pass, even as the main suite evolves.
- **Periodically refresh the eval dataset** from sanitized production traces, user feedback, incidents, and domain-expert cases, to prevent the dataset from going stale.
- **Calibrate model-graders against humans.** A grader that has drifted from human judgment can produce high pass-rates on outputs humans dislike.
- **Randomize answer order and blind variant labels** for pairwise judging.
- **Track multiple criteria and slices, not one average.** A single headline number is easier to over-fit than a panel of independent measures.
- **Harden a saturated suite.** When pass-rate hits the ceiling, add harder/production-sampled/adversarial cases (or retire obsolete ones as a versioned eval change) so it can again separate a better version from a worse one. A suite nobody can fail measures nothing.
- **Preserve failures as evidence.** A failing eval is a product requirement becoming concrete, not an annoyance to delete.

### The 100% Pass-Rate Trap

A suite that reaches 100% pass-rate is often no longer measuring the frontier of product quality. It may mean the capability is truly solved, but it can also mean the cases are too easy, the judge is too forgiving, the system has overfit the development set, or the eval has lost discriminative power. When a gating suite is perfect or near-perfect:

- Do not raise confidence automatically — trigger a suite-hardening review.
- Re-run the held-out slice and compare development versus held-out performance.
- Add harder cases from recent production failures, domain experts, adversarial generation, or previously ambiguous human reviews.
- Check whether high-risk slices are too small to matter in the average.
- Retire obsolete cases only as a versioned eval change with a new baseline; keep the frozen prior-failure set.

## Cost-Aware Evaluation

Quality is not the only product metric. A candidate that improves answer score by 1 point while doubling latency, token spend, tool calls, or human-review load may be worse for the product. Make cost explicit in the regression budget:

- Report token count, model mix, wall-clock latency, tool-call count, retry rate, cache hit rate, and human-review volume *beside* quality metrics.
- Set ceilings before the run: e.g. "quality must improve by at least 3 points if p95 latency rises more than 10%," or "no model upgrade may increase cost per successful task by more than 20% without product approval."
- Compare **cost per successful task**, not only cost per request. A more expensive system can be cheaper if it reduces retries, support tickets, or human escalation.
- Treat cost reductions as candidates too. A cheaper model, lower reasoning effort, narrower context, or cached retrieval path should still pass the private quality suite and high-risk slices.
- Keep cost/latency watch-only metrics out of the headline score unless the regression budget explicitly says they gate.

## Offline Evals vs Production Telemetry

Offline evals and production telemetry are complementary, never substitutable, and they answer different questions:

- Offline evals ask: "Can this candidate system satisfy known scenarios before users are exposed?" — a fixed, curated input distribution under controlled conditions *before* deployment. This is the gate.
- Production telemetry asks: "What is the deployed system doing under real traffic, real inputs, and actual model versions *after* deployment?" — the ground truth the offline suite is trying to predict.

They feed each other without collapsing into each other:

1. Production monitoring, user feedback, manual transcript review, and A/B tests surface candidate failures and unknown input distributions.
2. The team triages those signals into named failure modes: wrong answer, missing context, bad tool choice, unsafe side effect, bad refusal, poor latency/cost tradeoff, or user dissatisfaction.
3. Sanitized and permission-safe examples become eval cases or held-out slices.
4. The next prompt/model/retrieval/tool change is gated against the expanded suite before release.

A team that trusts only offline evals ships changes that pass the suite and degrade in production on inputs the suite never contained; a team that trusts only telemetry has no gate and learns about regressions from users. Vendor guidance (e.g., Anthropic's 2026 evals guidance) is now explicit that static pre-deployment tests cannot fulfill the production-monitoring requirement — systematic post-launch human review of real traffic is a *distinct, required* activity, not something offline evals replace.

### Offline-To-Online Rollout Spectrum

Offline and production are not a binary — a change earns its way across a graded spectrum rather than jumping from the offline gate straight to 100% of traffic:

| Stage | What it does | What it measures | Risk exposure / guardrail |
|---|---|---|---|
| Offline eval | Runs the candidate against the frozen suite before any traffic | Pass-rate delta on curated inputs | None (no users); blocks release if regression budget fails |
| Shadow / mirror | Runs the candidate on real traffic in parallel, output discarded (not served) | Candidate behavior, cost, latency, and unsafe side effects on the live input distribution | None (output not shown) |
| Canary | Serves the candidate to a small, low-risk traffic slice | Real user-facing outcomes on a small blast radius | Bounded by slice size; fast rollback, high-risk slices excluded or manually watched |
| A/B / interleaving | Serves candidate and control concurrently and compares outcomes (interleaving alternates within a session for finer signal) | Statistically-compared production outcome delta | Half (or interleaved) of traffic; predeclared success metrics and safety stop conditions |
| Full rollout | Serves the candidate to all traffic | The deployed system's actual behavior at scale | All traffic; monitoring, incident review, and dataset refresh stay active |

The offline gate is necessary but not sufficient: it certifies the change is *safe to expose*, and the online stages certify it actually *behaves better on real traffic* — the same paired/CI-on-the-delta statistics from § The Statistics of "Is This Better?" apply to the A/B comparison, not just the offline one. Shadow, canary, and A/B stages are not substitutes for offline evals; they are exposure controls and data sources for future eval cases.

## The Tooling Landscape (Cited For Grounding, Changes Fast)

Eval tooling has consolidated and matured (2025–2026), and modern platforms automate major pieces of the loop — but **none of it replaces the discipline this skill teaches**. Choosing what to measure, sampling representative data, judging whether a delta is real, calibrating the judge, and resisting Goodhart remain human/architectural decisions a framework cannot make for you. Treat the tools as the *substrate* the iteration loop runs on:

- **Inspect** (UK AI Security Institute / AISI) — an open, provider-flexible framework purpose-built for capability and safety evals, with datasets, solvers/agents, scorers, tools, sandboxing, and a large library of pre-built evals.
- **OpenAI Evals / Promptfoo** — OpenAI's open-source evals framework and Evals API/dashboard (eval resources, JSONL data sources, graders, runs, continuous evaluation), plus Promptfoo (now under OpenAI) for prompt/model A/B evals; weigh single-vendor ownership against multi-provider strategies.
- **Anthropic eval tooling** — Claude Console evaluation workflow (prompt variants, generated test cases, side-by-side comparison, quality grading, prompt versioning); eval creation/execution is now built into Anthropic's skill-creator, treating skills and context as software that requires testing.
- **DeepEval and similar harnesses** — pytest-style assertion layers over LLM outputs for CI integration.
- **Trajectory- and trace-based eval tooling** (for the agent / multi-step surface, not just final output) — Google's Agent Development Kit (ADK) trajectory evaluation, LangChain AgentEvals / LangSmith (deterministic and LLM-as-judge trajectory evaluators, datasets, experiment tracking, offline/online evaluators), and MLflow's trace-based judges/scorers. These score the *path* (tool calls, intermediate state) against a reference trajectory, the tooling counterpart to § Evaluating Multi-Step Agents.
- **Ragas** — RAG-oriented metrics (context precision, context recall, faithfulness, response relevancy), the tooling counterpart to § RAG Eval Surfaces.

**Selection and versioning are part of the discipline, not the framework's job.** Choose a harness on whether it can: keep private eval examples and traces inside the required data boundary; express *your* judgment mechanisms (programmatic + model-graded + preference + human-in-the-loop); score the eval *surfaces your system has* (trajectory and retrieval, not just final response); integrate into your CI gate (block PRs, annotate changes, preserve an experiment ledger); support a human calibration workflow; avoid single-vendor lock-in if you need multi-provider grading; and rerun old systems against new eval versions reproducibly. And version the eval dataset itself like code: tag the dataset version a result was produced against, and treat a dataset change as a change that invalidates prior pass-rates — a delta is only comparable across runs on the same dataset version.

## What This Skill Is Not

This skill is the development *discipline* for using LLM evals as change gates. Specific neighboring scopes:

- The mechanics of running evals in CI/CD pipelines belong to a tooling skill — though the *decision* to run continuous evals on every change is part of this discipline.
- The construction of individual eval rubrics, task sets, graders, hard negatives, trace expectations, and thresholds belongs to `agent-eval-design`.
- The deterministic testing of non-LLM code belongs to `testing-strategy`; general software TDD belongs to `test-driven-development` or `testing-strategy`.
- General scoring frameworks and result interpretation belong to `evaluation`.
- Production exception reporting belongs to `error-tracking`; telemetry semantics belong to `observability-modeling`.
- Tool-call protocol mechanics belong to `tool-call-flow`; this skill can measure whether tool-use behavior is correct.
- Security threat modeling and defenses for prompt injection belong to `prompt-injection-defense`; this skill can measure whether a defense holds.

## Verification

After applying this skill, verify:

- [ ] The system has a private, system-specific eval dataset, checked into version control, that represents production work, hard cases, prior failures, and at least one held-out slice; each case is labeled with its provenance/origin.
- [ ] Each eval criterion has a defined judgment mechanism (programmatic, model-graded, human-graded, preference comparison, trace check, or hybrid), and the mechanism's known biases are accounted for.
- [ ] Agentic systems evaluate the right surface: final answer, trajectory (tool selection, argument correctness, plan validity, unsafe-action absence), retrieval/context use, safety boundary, side effects, and cost/latency — not only the final output.
- [ ] For RAG systems, retrieval is evaluated separately from generation — context recall/precision, faithfulness/groundedness, answer relevance, and citation support are distinct measures, so a failure is localized to the retriever, context packing, synthesis, or citation rather than blamed on "the model."
- [ ] Every eval surface the system actually has carries at least one eval; the headline number is not a single final-response score standing in for all of them.
- [ ] Aggregation reports pass-rate with sample size, slices, and either a confidence interval, repeated-run evidence, or a defined minimum-detectable-change threshold.
- [ ] When comparing two system versions, the decision is gated on the confidence interval of the *delta* (B − A) excluding zero (or a predeclared threshold) — ideally via a paired test on a shared dataset; paired binary comparisons consider McNemar's test or an exact discordant-pair test; correlated examples are clustered or de-duplicated; the eval's MDE is known and deltas smaller than it are treated as "no signal."
- [ ] Each eval metric or slice has an explicit regression budget: gating, optimizing, watchful, human-signoff, or cost-aware (a pass-rate gain must clear the cost/latency budget to count); high-risk slices are veto gates even when the average improves.
- [ ] The comparison was pre-registered before looking at candidate results: dataset version, primary metric, judge version, slice vetoes, sample size/repeat policy, MDE, cost/latency budget, and merge rule (anti-p-hacking).
- [ ] Model-graded evals are judged by a different top-tier model family than the candidate where possible, with position-swapping and blinded variant labels in pairwise comparisons, and have been calibrated against human review on a documented cadence (with judge-bias magnitude measured on a local calibration slice and recalibration on every judge-model version bump).
- [ ] Safety and red-team evals report attack success, false-positive refusals, severity, and boundary-trace correctness; critical failures veto merge.
- [ ] A held-out portion of the dataset is reserved from active iteration and scored periodically to detect over-fitting; gating decisions prefer private, production-sampled data over public benchmarks to resist contamination and eval-awareness; a contamination register exists for any public benchmark cited in a decision.
- [ ] The suite still discriminates — pass-rate is not pinned at or near 100%; a saturated suite triggers a suite-hardening review rather than automatic confidence.
- [ ] Prompt, model, retrieval, context-packing, tool, and orchestration changes all run through the same change-gating loop; a model upgrade or vendor switch has been tested against the private suite, including high-risk slices, cost, and latency.
- [ ] Public benchmarks (MMLU, HumanEval, etc.) are cited for model-selection grounding but are not the gating decision for system-specific quality.
- [ ] Production telemetry, shadow runs, canaries, user feedback, A/B tests, and manual transcript review feed sanitized cases back into the offline dataset; they do not replace offline eval gates, and a change earns its way across the rollout spectrum (offline gate → shadow → canary → A/B → full) rather than jumping straight to all traffic, with the online A/B comparison using the same CI-on-the-delta statistics as the offline one.
- [ ] The eval dataset is version-controlled and a result records the dataset version it was produced against; deltas are only compared across runs on the same dataset version.
- [ ] The shipping threshold is a product decision documented before the comparison, not an emergent average across team opinion.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Writing deterministic unit tests for non-LLM code | `testing-strategy` | testing-strategy owns binary pass/fail test planning; this skill owns distributional LLM-system measurement |
| Designing individual eval rubrics, task sets, graders, traces, hard negatives, or thresholds | `agent-eval-design` | agent-eval-design owns eval construction; this skill owns the iteration discipline that uses constructed evals |
| Interpreting scores or applying a general evaluation framework without changing an LLM-system eval loop | `evaluation` | evaluation owns general scoring frameworks and result interpretation; this skill owns repeated system-change gates |
| Setting up production monitoring, alerting, trace semantics, or exception capture | `error-tracking` or `observability-modeling` | those own live runtime measurement; this skill owns offline/pre-deployment eval gates and dataset refresh from telemetry |
| Reasoning about the protocol cycle of tool calls | `tool-call-flow` | tool-call-flow owns the mechanism; eval-driven development can measure whether tool-use behavior is correct as one criterion |
| Defending against prompt injection | `prompt-injection-defense` | prompt-injection-defense owns the security property; this skill can measure whether the defense holds |
| General software TDD process | `test-driven-development` or `testing-strategy` | TDD is process-shape for general software; this skill is concept-shape for the LLM-specific evaluation-iteration discipline |

## Key Sources

- OpenAI. ["Evaluation best practices"](https://developers.openai.com/api/docs/guides/evaluation-best-practices) and ["Evals API reference"](https://developers.openai.com/api/reference/resources/evals). Current official guidance on eval-driven development, production-data/dataset mixing, held-out sets, continuous evaluation on every change, growing the eval set, and pairwise/classification/scoring-friendly eval design; the API surface for eval resources, JSONL data sources, graders, and runs.
- OpenAI. [openai/evals](https://github.com/openai/evals) (Promptfoo now under OpenAI). Open-source framework and registry for LLM and LLM-system evals, including private/custom eval patterns.
- Anthropic. ["Demystifying evals for AI agents"](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) (2026). Practitioner guidance on agent eval structure, capability evals that start at a low pass-rate to make future model drops visible, trajectory/multi-turn evals, and combining evals with production monitoring, A/B tests, user research, manual transcript review, and human evaluation; the basis for the production-monitoring-is-a-distinct-required-activity point.
- Anthropic. ["Define success criteria and build evaluations"](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests) and ["Using the Evaluation Tool"](https://platform.claude.com/docs/en/test-and-evaluate/eval-tool). Official guidance on success criteria, task-specific evals, volume vs grading quality, code/human/LLM grading, multidimensional criteria, and the Console prompt-comparison workflow; eval creation is now also built into Anthropic's skill-creator.
- Anthropic. ["Eval awareness in Claude Opus 4.6's BrowseComp performance"](https://www.anthropic.com/engineering/eval-awareness-browsecomp) and [Apollo Research on eval-distinguishing](https://www.apolloresearch.ai/science/claude-sonnet-37-often-knows-when-its-in-alignment-evaluations/). The basis for § Benchmark Validity Is Decaying (eval-awareness + contamination).
- UK AI Security Institute and Meridian Labs. [Inspect](https://inspect.aisi.org.uk/). Open framework purpose-built for capability and safety evaluations of LLMs, with datasets, agents, tools, scorers, sandboxing, external-agent support, and a large pre-built eval library.
- Google. ["Why Evaluate Agents — Agent Development Kit"](https://adk.dev/evaluate/) (trajectory evaluation); LangChain. ["Agent Evals"](https://docs.langchain.com/oss/python/langchain/test/evals) and ["LangSmith evaluation concepts"](https://docs.langchain.com/langsmith/evaluation-concepts) (deterministic and LLM-as-judge trajectory evaluators, datasets, offline/online evaluators); MLflow. ["LLM Judges and Scorers"](https://mlflow.org/docs/latest/genai/eval-monitor/scorers/index.html) (built-in judges, custom LLM judges, code-based scorers over traces). The tooling counterpart to § Evaluating Multi-Step Agents.
- Ragas. ["List of available metrics"](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/) and Es, S., James, J., Espinosa-Anke, L., & Schockaert, S. (2023). ["Ragas: Automated Evaluation of Retrieval Augmented Generation"](https://arxiv.org/abs/2309.15217). Names the reference-free RAG eval dimensions (context precision/recall, faithfulness/groundedness, answer relevance) — the basis for § RAG Eval Surfaces. OpenAI's [evaluation best-practices guide](https://developers.openai.com/api/docs/guides/evaluation-best-practices) also names context recall and context precision in its Q&A-over-docs example.
- Wolfe, C. R. (2026). ["Applying Statistics to LLM Evaluations"](https://cameronrwolfe.substack.com/p/stats-llm-evals). Practitioner walkthrough of paired vs unpaired tests, bootstrap CIs on the delta, minimum-detectable-effect (the quadratic sample-size scaling), and clustered standard errors — the basis for § The Statistics of "Is This Better?". McNemar, Q. (1947). "Note on the sampling error of the difference between correlated proportions or percentages." Classic paired-binary test basis for comparing two systems on the same pass/fail cases.
- Zheng, L., Chiang, W.-L., et al. (2023). ["Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena"](https://arxiv.org/abs/2306.05685); ["Judging the Judges: A Systematic Study of Position Bias in LLM-as-a-Judge"](https://arxiv.org/abs/2406.07791) (2024); and the self-preference-bias literature (e.g. [arXiv:2410.21819](https://arxiv.org/pdf/2410.21819)). Foundational and empirical basis for the mechanical (not prompt-level) bias-mitigation guidance in § Calibrating Model-Graded Evals (position, verbosity, self-enhancement biases).
- Yao, S., et al. (2024). ["τ-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains"](https://arxiv.org/abs/2406.12045) and the 2025 ["τ²-Bench"](https://arxiv.org/abs/2506.07982) follow-up. Canonical references for multi-turn tool-use / trajectory-aware agent evaluation under explicit policies.
- Jain, N., et al. (2024). ["LiveCodeBench: Holistic and Contamination Free Evaluation"](https://arxiv.org/abs/2403.07974); White, C., et al. (2024). ["LiveBench: A Challenging, Contamination-Free LLM Benchmark"](https://arxiv.org/abs/2406.19314); Oren, Y., et al. (2024). ["ConStat: Performance-Based Contamination Detection in Large Language Models"](https://arxiv.org/abs/2405.16281). Time-sliced/contamination-aware benchmark design and statistical contamination detection — the basis for the contamination defenses in § Benchmark Validity Is Decaying.
- Hendrycks, D., et al. (2021). ["Measuring Massive Multitask Language Understanding"](https://arxiv.org/abs/2009.03300); Chen, M., et al. (2021). ["Evaluating Large Language Models Trained on Code"](https://arxiv.org/abs/2107.03374); Srivastava, A., et al. (2022). ["BIG-bench"](https://arxiv.org/abs/2206.04615); Mialon, G., et al. (2023). ["GAIA"](https://arxiv.org/abs/2311.12983). Canonical public benchmark references for model-selection grounding, not deployment gating.
- Goodhart, C. (1975). "Problems of Monetary Management: The U.K. Experience." The origin of Goodhart's Law as commonly cited; "when a measure becomes a target, it ceases to be a good measure."
- Liang, P., et al. (2022). ["Holistic Evaluation of Language Models"](https://arxiv.org/abs/2211.09110). The HELM framework paper; argues for multi-metric eval across many dimensions as a counter to single-metric Goodharting.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `ai-engineering`
- Deployment: `portable`
- Domain: `agent/evaluation`
- Scope: Building language-model-integrated systems by writing evaluations before and alongside the system — the statistical (not binary) nature of LLM evals, the five primitives (dataset, evaluation function, aggregation, iteration loop, regression budget), the judgment-mechanism taxonomy (programmatic, model-graded, human-graded, preference comparison, trace/hybrid), the eval-surface stack (final response, trajectory/tool-use, retrieval/RAG, safety, side effects, cost/latency), continuous evals and model/vendor-upgrade gates, system-specific evals vs canonical benchmarks (MMLU, HumanEval, BIG-bench, GAIA), how evals drive prompt/model/scaffolding/tooling changes, the statistical-significance discipline (paired difference tests, McNemar's test for paired binary outcomes, bootstrap confidence intervals on the delta, minimum-detectable-effect, clustered standard errors, slice vetoes), trajectory-vs-final-output evaluation for multi-step agents, RAG eval surfaces (context recall/precision, faithfulness, answer relevance), model-grader calibration and bias mitigation, eval-awareness and benchmark-contamination risk, Goodhart's Law and suite saturation, cost-aware regression budgets, and the offline-eval-vs-production-telemetry distinction with its graded rollout spectrum. Portable across any LLM-integrated system; principle-grounded, not repo-bound. Excludes deterministic unit testing and general TDD (testing-strategy), production monitoring (evaluation, error-tracking, observability-modeling), and constructing individual eval rubrics, task sets, graders, hard negatives, and traces (agent-eval-design owns construction; this skill owns iteration discipline).

**When to use**
- design an offline eval suite for an LLM-integrated summarization feature before writing the prompt
- structure an iteration loop where each prompt, retrieval, tool, or model change is gated by a regression budget
- the new prompt scored 3 points higher on 30 examples — is that real or noise?
- decide whether a model upgrade should merge when the headline score improves but one high-risk slice regresses
- explain how production traces and user feedback should feed a private eval set without replacing offline evals
- Triggers: `how do we know this prompt change improved things`, `should this be an eval or a unit test`, `the model passes the benchmark but fails in production`, `what should we measure before changing the agent`, `the LLM-as-judge gives different scores each run`, `is this eval delta statistically significant`, `how do we eval a multi-step agent not just the final answer`, `can we upgrade this model safely`, `how should traces become eval cases`

**Not for**
- write unit tests for a deterministic data transformation (use testing-strategy)
- create the exact rubric and hard negatives for this agent eval (use agent-eval-design)
- set up production alerting on API error rates (use error-tracking or observability-modeling)
- interpret this scorecard or benchmark result without changing an LLM-system eval loop (use evaluation)
- Owned by `agent-eval-design`: the change-gating discipline
- Owned by `evaluation`: iterative LLM-system change gates and regression budgets
- Owned by `prompt-injection-defense`: measuring whether a prompt-injection defense holds

**Related skills**
- Verify with: `agent-eval-design`, `evaluation`, `testing-strategy`
- Related: `agent-eval-design`, `evaluation`, `testing-strategy`, `prompt-injection-defense`, `tool-call-flow`, `error-tracking`, `observability-modeling`, `type-safety`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: Eval-driven development is to LLM system engineering what crash-test ratings are to automotive safety — you do not ship a car based on how well it parked in your driveway; you ship it after a battery of standardized tests on representative crash scenarios, with the pass-rate against named criteria as the gating signal. A score of 4.3 stars across the suite is the only defensible claim of 'safer'; a developer's intuition that 'the new model feels smarter' is the unmeasured equivalent of 'I drove it home, it seemed fine.' And just as a crash lab that the manufacturer trains its cars to detect stops measuring real safety, an eval the model can recognize as a test stops measuring real behavior.
- Common misconception: |

**Grounding**
- Mode: `universal`
- Truth sources: `https://developers.openai.com/api/docs/guides/evaluation-best-practices`, `https://developers.openai.com/api/reference/resources/evals`, `https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents`, `https://platform.claude.com/docs/en/test-and-evaluate/develop-tests`, `https://adk.dev/evaluate/`, `https://inspect.aisi.org.uk/`, `https://docs.langchain.com/oss/python/langchain/test/evals`, `https://mlflow.org/docs/latest/genai/eval-monitor/scorers/index.html`, `https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/`, `https://arxiv.org/abs/2406.19314`, `https://arxiv.org/abs/2405.16281`

**Keywords**
- `eval-driven development`, `LLM evals`, `continuous evals`, `evaluation harness`, `agent trajectory eval`, `LLM-as-judge`, `model-graded eval`, `regression budget`, `eval statistical significance`, `model upgrade eval`

<!-- skill-graph-context:end -->
