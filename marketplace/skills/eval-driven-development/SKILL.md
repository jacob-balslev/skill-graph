---
name: eval-driven-development
description: "Use when building language-model-integrated systems by writing evaluations before and alongside the system: the statistical (not binary) nature of LLM evals, the five primitives (dataset, evaluation function, aggregation, iteration loop, regression budget), the judgment-mechanism taxonomy (programmatic, model-graded, human-graded, preference comparison), the eval-surface stack (final response, trajectory/tool-use, retrieval/RAG, safety, cost), the statistical-significance discipline (paired tests, bootstrap CI on the delta, minimum-detectable-effect), trajectory-vs-final-output evaluation for multi-step agents, judge calibration and bias, Goodhart's Law and suite saturation, and the offline-eval-vs-production-telemetry distinction. Do NOT use for deterministic unit testing or general TDD (use testing-strategy), production monitoring (use evaluation or error-tracking), or building individual eval rubrics and task sets (use agent-eval-design — it owns construction; this skill owns iteration discipline)."
license: MIT
allowed-tools: Read Grep
metadata:
  relations: "{\"related\":[\"error-tracking\",\"tool-call-flow\",\"observability-modeling\",\"type-safety\",\"evaluation\",\"testing-strategy\",\"prompt-injection-defense\"],\"suppresses\":[\"evaluation\",\"prompt-injection-defense\"],\"verify_with\":[\"evaluation\",\"testing-strategy\"]}"
  subject: ai-engineering
  scope: "Building language-model-integrated systems by writing evaluations before and alongside the system — the statistical (not binary) nature of LLM evals, the five primitives (dataset, evaluation function, aggregation, iteration loop, regression budget), the judgment-mechanism taxonomy (programmatic, model-graded, human-graded, preference comparison, trace/hybrid), the eval-surface stack (final response, trajectory/tool-use, retrieval/RAG, safety, side effects, cost/latency), continuous evals and model/vendor-upgrade gates, system-specific evals vs canonical benchmarks (MMLU, HumanEval, BIG-bench, GAIA), how evals drive prompt/model/scaffolding/tooling changes, the statistical-significance discipline (paired difference tests, McNemar's test for paired binary outcomes, bootstrap confidence intervals on the delta, minimum-detectable-effect, clustered standard errors, slice vetoes), trajectory-vs-final-output evaluation for multi-step agents, RAG eval surfaces (context recall/precision, faithfulness, answer relevance), model-grader calibration and bias mitigation, eval-awareness and benchmark-contamination risk, Goodhart's Law and suite saturation, cost-aware regression budgets, and the offline-eval-vs-production-telemetry distinction with its graded rollout spectrum. Portable across any LLM-integrated system; principle-grounded, not repo-bound. Excludes deterministic unit testing and general TDD (testing-strategy), production monitoring (evaluation, error-tracking, observability-modeling), and constructing individual eval rubrics, task sets, graders, hard negatives, and traces (the construction details are task-specific artifacts; this skill owns iteration discipline)."
  public: "true"
  taxonomy_domain: agent/evaluation
  stability: experimental
  keywords: "[\"eval-driven development\",\"LLM evals\",\"continuous evals\",\"evaluation harness\",\"agent trajectory eval\",\"LLM-as-judge\",\"model-graded eval\",\"regression budget\",\"eval statistical significance\",\"model upgrade eval\"]"
  triggers: "[\"how do we know this prompt change improved things\",\"should this be an eval or a unit test\",\"the model passes the benchmark but fails in production\",\"what should we measure before changing the agent\",\"the LLM-as-judge gives different scores each run\",\"is this eval delta statistically significant\",\"how do we eval a multi-step agent not just the final answer\",\"can we upgrade this model safely\",\"how should traces become eval cases\"]"
  examples: "[\"design an offline eval suite for an LLM-integrated summarization feature before writing the prompt\",\"structure an iteration loop where each prompt, retrieval, tool, or model change is gated by a regression budget\",\"the new prompt scored 3 points higher on 30 examples — is that real or noise?\",\"decide whether a model upgrade should merge when the headline score improves but one high-risk slice regresses\",\"explain how production traces and user feedback should feed a private eval set without replacing offline evals\"]"
  anti_examples: "[\"write unit tests for a deterministic data transformation (use testing-strategy)\",\"create the exact rubric and hard negatives for this agent eval (outside this skill; construction belongs in task-specific eval artifacts)\",\"set up production alerting on API error rates (use error-tracking or observability-modeling)\",\"interpret this scorecard or benchmark result without changing an LLM-system eval loop (use evaluation)\"]"
  grounding: "{\"subject_matter\":\"Eval-driven development for LLM-integrated systems\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://developers.openai.com/api/docs/guides/evaluation-best-practices\",\"https://developers.openai.com/api/reference/resources/evals\",\"https://developers.openai.com/api/docs/guides/agent-evals\",\"https://developers.openai.com/api/docs/guides/trace-grading\",\"https://openai.com/index/openai-to-acquire-promptfoo/\",\"https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/\",\"https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents\",\"https://www.anthropic.com/engineering/eval-awareness-browsecomp\",\"https://platform.claude.com/docs/en/test-and-evaluate/develop-tests\",\"https://adk.dev/evaluate/\",\"https://inspect.aisi.org.uk/\",\"https://docs.langchain.com/oss/python/langchain/test/evals\",\"https://mlflow.org/docs/latest/genai/eval-monitor/scorers/index.html\",\"https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/\",\"https://arxiv.org/abs/2406.19314\",\"https://arxiv.org/abs/2405.16281\",\"https://arxiv.org/abs/2505.23836\",\"https://arxiv.org/abs/2605.05835\",\"https://arxiv.org/abs/2604.23178\"],\"failure_modes\":[\"model_change_ships_on_vibes_without_private_eval_gate\",\"single_run_pass_mistaken_for_distributional_quality\",\"public_benchmark_score_replaces_system_specific_eval\",\"headline_average_hides_slice_regression\",\"delta_declared_real_without_significance_test\",\"model_judge_bias_or_drift_goes_uncalibrated\",\"trace_level_agent_failure_hidden_by_final_answer_score\",\"production_telemetry_ignored_in_eval_refresh_loop\",\"eval_tooling_mistaken_for_eval_discipline\",\"rag_retrieval_failure_hidden_by_final_answer_score\",\"near_perfect_suite_saturation_mistaken_for_certification\",\"post_hoc_eval_spec_written_after_seeing_results\",\"cost_or_latency_regression_hidden_by_quality_delta\",\"benchmark_contamination_mistaken_for_generalization\",\"dev_set_overfit_when_iteration_reuses_the_gate_set\",\"metrics_read_without_reading_transcripts\",\"trace_grading_mistaken_for_repeatable_eval_gate\",\"small_bootstrap_suite_used_to_claim_small_delta_significance\",\"capability_suite_saturation_confused_with_regression_suite_health\",\"benchmark_deprecation_or_contamination_flag_ignored\",\"pass_at_k_improvement_masks_consistency_regression\",\"judge_style_bias_not_measured_on_local_calibration_set\"],\"evidence_priority\":\"equal\"}"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "Eval-driven development is to LLM system engineering what crash-test ratings are to automotive safety — you do not ship a car based on how well it parked in your driveway; you ship it after a battery of standardized tests on representative crash scenarios, with the pass-rate against named criteria as the gating signal. A score of 4.3 stars across the suite is the only defensible claim of 'safer'; a developer's intuition that 'the new model feels smarter' is the unmeasured equivalent of 'I drove it home, it seemed fine.' And just as a crash lab that the manufacturer trains its cars to detect stops measuring real safety, an eval the model can recognize as a test stops measuring real behavior."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/ai-engineering/eval-driven-development/SKILL.md
  skill_graph_export_description: shortened for Agent Skills 1024-character description limit; canonical source keeps the full routing contract
  skill_graph_canonical_description_length: "1446"
---
# Eval-Driven Development

## Concept of the skill

Eval-driven development is the practice of building LLM-integrated systems by writing evaluations before and alongside the system, with each eval defining a behavioral criterion the system must satisfy on a representative input set, and the suite's aggregated signal gating every change to prompt, model, retrieval, context assembly, scaffolding, tooling, or orchestration. *Five primitives*: (1) *eval dataset* — curated input examples representing production plus edge cases, prior failures, and held-out slices, typically JSONL of `{input, reference}` records checked into version control; (2) *evaluation function* — per-example grader producing a score, with mechanism chosen from programmatic, model-graded, human-graded, preference comparison, trace check, or hybrid; (3) *aggregation* — statistical summary across the dataset (pass-rate, weighted pass-rate, stratified slice scores, distribution) with sample size and either a confidence interval or a defined minimum-detectable-change threshold, plus cost/latency side metrics; (4) *iteration loop* — eval → diagnose → change one meaningful variable → re-eval → compare, with the suite stable while the system changes; (5) *regression budget* — per-eval/per-slice merge policy: gating (no regression allowed), optimizing (improvement gates merge), watchful (tracked, not gated), human-signoff, or cost-aware threshold (a pass-rate gain only counts if it clears the eval's cost/latency budget — a 1pp quality gain at 3× inference cost is a regression).

Replaces "ship LLM systems based on how the model feels at the desk" (and benchmark shopping) with empirical measurement that distinguishes "the new prompt works better" from "the new prompt works better on the five examples I happened to try." Solves the problem that LLM system behavior is *stochastic* (every run is a sample, not a deterministic pass/fail), the input space is *open-ended* (the developer's pet examples are not a representative sample of what users will throw at it), model behavior *changes across releases* (a feature that failed last quarter may now be viable), and traditional binary unit tests do not capture the distributional nature of LLM outputs. The eval suite is the empirical measurement instrument that makes shipping decisions defensible and changes gateable: each change has a baseline, a representative private eval set, a comparison method, and a documented decision policy. The discipline's hard part is not writing evals — it is choosing what to measure, encoding the choice into a grader the team agrees with, sampling a dataset that represents production, distinguishing a real improvement from sampling noise, tracking high-risk slices separately from the average, calibrating model-graders against humans, feeding sanitized production failures back into the next eval version, and *resisting Goodhart's Law* as the eval suite becomes the optimization target. Teams that get this right ship systems whose quality matches their stated definition of "good"; teams that get this wrong ship systems that ace evals and disappoint users.

Distinct from testing-strategy, which owns deterministic-software testing where every run is binary pass/fail and the main decision is the cheapest honest test level — this skill owns LLM evaluation where every run is a sample from a distribution and *pass-rate* (or a score distribution) is the unit of judgment; the disciplines share vocabulary (suite, gate, regression) but the math underneath differs. The exact construction of eval task sets, rubrics, graders, hard negatives, trace schemas, and thresholds is separate from this skill; this skill owns the development discipline that uses those artifacts to gate whether prompt/model/retrieval/tool/orchestration changes ship. Distinct from evaluation, which owns general scoring frameworks and result interpretation — this skill owns the repeated LLM-system change gate. Distinct from tool-call-flow, which owns the protocol cycle by which a model invokes tools — this skill owns the discipline of *measuring* whether that cycle produces correct behavior; tool-call and trajectory evals are a specialization of the general pattern. Distinct from prompt-injection-defense, which owns the security property and threat model — this skill owns the *measurement* of whether the property holds (red-team evals against an injection corpus are one application). Distinct from error-tracking and observability-modeling, which own runtime measurement of deployed systems — this skill owns *offline pre-deployment* measurement while using production signals as inputs for dataset refresh; one is not used as a substitute for the other. Eval-driven development is to LLM system engineering what crash-test ratings are to automotive safety — you do not ship a car based on how well it parked in your driveway; you ship it after a battery of standardized tests on representative crash scenarios, with the pass-rate against named criteria as the gating signal. A score of 4.3 stars across the suite is the only defensible claim of 'safer'; a developer's intuition that 'the new model feels smarter' is the unmeasured equivalent of 'I drove it home, it seemed fine.' And just as a crash lab that the manufacturer trains its cars to detect stops measuring real safety, an eval the model can recognize as a test stops measuring real behavior. The wrong mental model is that LLM evals are "unit tests for prompts" — binary pass/fail, written once, checked in CI, ship on green. They are not. The fundamental property is *distributional and lifecycle-based*: every run is a sample from a stochastic system, and the unit of judgment is *pass-rate over a sampled population* with a sample size and confidence interval. A test that runs once and "passes" tells you nothing about the distribution; pass-rate at n=20 has huge uncertainty; pass-rate at n=500 starts to be informative. Adjacent misconceptions: that a higher headline pass-rate is a real improvement (it is not until the *delta's* confidence interval excludes zero — a paired bootstrap on a shared dataset is the cheap default, McNemar's test is the right check for paired pass/fail outcomes, and halving the effect you want to detect costs *four times* the samples); that a single headline number is sufficient (it is not — it can hide a high-risk slice regressing while the average improves; a panel of independent measures and slices is harder to over-fit, and HELM's multi-metric framing exists precisely as a counter to single-metric Goodharting); that public benchmarks (MMLU, HumanEval, BIG-bench, GAIA, MT-Bench, τ-bench) gate system-specific shipping decisions (they do not — benchmarks predict how a model will do on the *exact* tasks they contain, not on your system's user inputs; use them for model-selection grounding, and treat a sudden benchmark jump as a contamination hypothesis, not an automatic capability win); that higher eval scores are always improvements (they are not — *Goodhart's Law*: when the eval becomes the optimization target, it ceases to be a good measure; a 100% pass-rate is a *measurement failure* on a capability/gating suite, not a victory, because a suite the system aces has stopped discriminating — though a *regression* suite near 100% is doing its job, see the carve-out in § The 100% Pass-Rate Trap); that model-graded evals are reliable without calibration (they are not — model-graders have verbosity bias, position bias in pairwise comparisons, *self-preference* bias toward their own family's outputs, and correlated error with the system being graded; the fix is *mechanical* — judge from a different top-tier family, swap positions, ensemble across families — not a "be objective" instruction in the grader prompt, because the bias lives in the embedding distribution, not the surface style); that you can trust a metric without reading the transcripts (you cannot — error analysis on the actual traces is how you learn whether the grader itself is working and what the failures really are); that final-output grading is sufficient for multi-step agents (it is not — an agent that reaches the right answer through a broken or unsafe trajectory will pass a final-output eval and fail in production; multi-step systems need trajectory-aware evals that score planning, tool selection, and execution); that the model under test is fixed (it is not — every model upgrade or vendor switch changes the system under test and must be re-gated against the private suite, including high-risk slices, cost, and latency); and that offline evals replace production telemetry (they do not — production telemetry measures the actual user-facing system under actual load, and every production incident is a candidate eval case after sanitization; the two are complementary, not substitutable). Public benchmarks, vendor dashboards, and LLM judges are useful *inputs*, not shipping authority by themselves.

## Coverage

The practice of building language-model-integrated systems by writing evaluations before and alongside the system, then using the eval suite's measured signal to gate every meaningful change. Covers:

- The statistical (not binary) nature of LLM evaluation: pass-rate, score distribution, repeated runs, slice variance, confidence intervals, and minimum detectable change.
- The five primitives: dataset, evaluation function, aggregation, iteration loop, regression budget.
- Where eval datasets come from (production logs, user-feedback capture, hand-authoring, prior failures, adversarial generation, synthetic generation) and how origin determines representativeness.
- How a suite *starts small and grows* — a handful of real-failure cases is a legitimate beginning; statistical power is earned by accretion, not required on day one.
- The bootstrap-vs-certification distinction: a 20–50 case early suite can drive coarse development feedback, but it cannot certify small deltas unless its MDE supports the claim; every suite is labeled with the posture (bootstrap, regression, capability, launch gate) that says which claim it warrants.
- Repeated-trial metrics for stochastic agents: `pass@k` ("at least one success in k attempts") versus `pass^k` ("all k attempts succeed"), and why the product promise — one good candidate vs reliable-every-time behavior — decides which one gates.
- Trace-first debugging versus repeatable eval runs: traces diagnose workflow failures; versioned datasets and eval runs gate comparable changes.
- Benchmark retirement and deprecation hygiene: public benchmarks, shared evals, and private suites must be marked stale, contaminated, saturated, or retired when they stop measuring the intended capability.
- The judgment-mechanism taxonomy (programmatic / model-graded / human-graded / preference comparison / trace-hybrid) and its cost dimension.
- Error analysis — reading transcripts/traces before trusting any metric — as the diagnostic engine of the loop.
- The eval surface stack: final response, trajectory/tool-use, retrieval/context use, safety/boundary, side effects, cost/latency — and which layer must block merge.
- RAG-specific eval surfaces: context precision, context recall, faithfulness/groundedness, answer relevance, citation support.
- The discipline of distinguishing a real improvement from sampling noise: paired difference tests, McNemar's test for paired binary outcomes, bootstrap confidence intervals on the delta, minimum-detectable-effect, clustered standard errors, and high-risk slice vetoes.
- The distinction between final-output and trajectory evaluation for multi-step agents.
- Continuous evaluation and model/vendor-upgrade gates: rerunning private evals before adopting a new model, API feature, tool runtime, or judge model.
- The distinction between system-specific evals and canonical public benchmarks (MMLU, HumanEval, BIG-bench, GAIA, MT-Bench, HELM, SimpleQA, SWE-bench, τ-bench).
- Why higher scores are not always improvements (Goodhart's Law, including suite saturation at 100%), and the eval-awareness/contamination risk that erodes benchmark validity — including the *structural* worsening of eval-awareness with model capability.
- The pre-registration / spec-first discipline that keeps the iteration loop from degrading into post-hoc p-hacking.
- Cost-aware regression budgets: when a quality gain justifies higher latency, token spend, tool calls, or human-review load.
- Offline evals vs production telemetry: the graded offline→shadow→canary→A/B→full rollout spectrum, and how live traces, feedback, incidents, and A/B tests feed the next eval version without replacing pre-deployment gates.
- The eval-lifecycle archetypes (acceptance, regression, calibration, red-team, cross-model, drift-refresh).

## Philosophy of the skill
Building LLM-integrated systems without evals is shipping airplanes based on how good the model feels at the desk. The system's behavior is stochastic, the input space is open-ended, the model may change under you, and the developer's pet examples are not a representative sample of what users will throw at it. An eval suite is the empirical measurement instrument that lets a team distinguish "the new system is better" from "the new system is better on the five examples I happened to inspect."

The discipline's hard part is not writing evals. It is choosing what to measure, encoding the choice into a grader the team agrees with, sampling a dataset that represents production, distinguishing a real improvement from sampling noise, calibrating subjective graders, holding the suite stable while the system changes, and resisting the gravitational pull of Goodhart's Law as the eval suite becomes the optimization target. Teams that get this right ship systems whose quality matches their team's stated definition of "good." Teams that get this wrong ship systems that ace evals and disappoint users.

Eval-driven development is not test-driven development with extra noise. It is empirical engineering applied to systems whose behavior is a distribution rather than a value. The vocabulary overlaps with testing — suite, gate, regression, CI — but the unit of judgment differs. A deterministic unit test asks "did this exact behavior happen?" An LLM eval asks "how often, under which slices, at what cost, with what uncertainty, and against whose definition of quality?"

**Start small; do not wait for a perfect suite.** The barrier to entry is low and the cost of delay is high: a starter set of 20–50 tasks drawn from real failures is a legitimate beginning, not a placeholder (Anthropic's agent-eval guidance). Early in development the effect sizes of changes are large, so even a small suite separates good from bad; the statistical machinery below matters most *later*, when the easy wins are gone and you are arguing over single percentage points. The failure mode is not "started with too few cases" — it is "never grew the suite, and never read the transcripts."

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
| Prior failures | Incidents, bad traces, complaints, and regression bugs converted into named cases | Makes fixes durable; keeps high-risk cases visible; the natural seed for the *starter suite* (20–50 real failures) | Reactive; over-represents known problems if not balanced |
| Hand-authored | Cases written by domain experts to encode the spec and edge cases | Precise coverage of intended behavior and boundary conditions | Reflects what authors *imagine* users do, not what they actually do; small and labor-bound |
| Adversarial generation | Cases deliberately constructed to break the system (red-team, hard negatives, injections, ambiguity, tool misuse) | Surfaces failure modes positive sampling misses; the source of red-herring cases | Not representative of typical-traffic distribution; over-weighting it distorts headline pass-rate |
| Synthetic generation | Cases produced by a model from a spec or seed set | Cheap volume; fills coverage gaps fast | Inherits the generator model's blind spots; can drift from real input distribution; can make the eval easy to game; needs human spot-checks |

A healthy suite blends origins and labels each case with provenance: production-sampled inputs anchor representativeness, hand-authored + adversarial cases pin the spec and the boundaries, prior-failure cases prevent regressions, and synthetic generation fills volume — with the mix and each stratum's weight chosen deliberately, not by whichever data was easiest to collect.

### Bootstrap Suites: Start Small, But Label The Claim

The "start small" point from § Philosophy has a discipline attached: *the claim a suite can support must match its sample.* A starter set of 20–50 well-chosen tasks from real failures, manual smoke checks, support issues, and product requirements is enough to expose coarse regressions and make the team's definition of success concrete — it is a development steering wheel, not a certification instrument. A bootstrap suite can justify "this change fixed the obvious failure class" or "the new model is worth deeper evaluation"; it cannot justify "a 2pp lift is real" unless the design's minimum detectable effect supports that claim (see § The Statistics of "Is This Better?"). Effects worth shipping shrink as the system improves, so mature systems need larger, harder, stratified suites, repeated trials, or paired comparisons.

The operational rule is to label every suite with its *use posture* — this is the epistemic-warrant companion to the cadence/gating view in § Eval Lifecycle Archetypes:

| Suite posture | Typical size | What it can support | What it cannot support |
|---|---:|---|---|
| Bootstrap | 20–50 high-signal tasks | Coarse iteration, task concretization, early model/prompt comparison | Fine-grained significance claims or broad population quality |
| Regression | Named prior failures and must-not-break cases | Backsliding detection; usually expects near-100% pass | Frontier capability measurement |
| Capability / quality | Larger and hard enough to leave room to improve | Product-quality hill climbing and model-upgrade decisions | Permanent comparability if the suite changes without re-baselining |
| Launch gate | Stratified, calibrated, costed, with high-risk slices | Ship/no-ship decision under a regression budget | Replacement for production monitoring |

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

A suite that covers only the first row reports a single number that hides failures on every other surface. Decide which surfaces your system actually has, and put at least one eval on each that matters. This skill decides *how those surfaces become a change gate*; constructing the exact rubrics and trace schemas is a task-specific artifact concern.

### RAG Eval Surfaces

Retrieval-augmented systems have a distinct, well-named set of eval dimensions because a RAG answer can fail in two independent places — the retriever fetched the wrong passages, or the generator ignored/contradicted the right ones. A green final answer can hide an unreliable retriever, and a faithful answer can still be useless if the retriever missed the necessary source. Naming the layers separately localizes the failure instead of blaming "the model" (RAGAS framing):

| RAG metric | Question it answers | Gate implication |
|---|---|---|
| Context precision | Are the retrieved chunks relevant, and are the most useful chunks ranked early? | Low precision forces the model to sift noise; tune chunking, retrieval query, reranker, or top-k policy |
| Context recall | Did retrieval include the evidence needed to answer the task? | Low recall is usually a release blocker for knowledge-heavy workflows, even if the generator sometimes guesses correctly; a faithfulness failure with low recall is a *retriever* bug, not a generator bug |
| Faithfulness / groundedness | Are the answer's claims actually supported by the retrieved context? | Unsupported claims block merge for high-risk domains; this is the RAG-specific hallucination measure |
| Answer relevance | Does the answer address the question asked, independent of grounding? | Low relevance points to prompt, routing, context packing, or instruction-following issues |
| Citation support | Do cited passages actually support the statement they are attached to? | Citation failures are separate from answer correctness; a correct answer with bad support still erodes trust |

Report the *failure location*: retrieval miss, ranking/noise problem, context-packing loss, synthesis hallucination, bad refusal, or citation mismatch. The regression budget should say which layer blocks merge and which only triggers diagnosis. These are *eval surfaces to name and measure*, not a RAG-metric construction manual — building the retrieval corpus, the rubric, and the graders is the task-specific work of building the retrieval corpus, rubric, and graders.

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

## Read The Transcripts — Error Analysis Is The Engine

A metric is a summary, and a summary you have not traced back to specific transcripts is a number you do not yet understand. Before trusting any aggregate — and *especially* before trusting a model-graded aggregate — read a sample of the actual traces: the inputs, the full output, the tool calls and intermediate state, and the grade the grader assigned. This is error analysis, and it is the diagnostic engine of the iteration loop, not an optional polish step. "You won't know if your graders are working well unless you read the transcripts and grades from many trials" (Anthropic's agent-eval guidance).

Error analysis answers questions a pass-rate cannot:

- **Is the grader actually right?** A model-graded eval can report 85% while silently mis-grading a recurring failure shape; only reading graded transcripts catches a broken grader before it pollutes every downstream decision.
- **What are the failures *really*?** Reading a dozen failing traces usually clusters into 2–3 named failure modes (wrong tool, dropped context, over-refusal, hallucinated citation) far faster than staring at the scalar score — and those named modes become the next eval cases and the next fix.
- **Is a "pass" a real pass?** A trace that reached the right answer through a broken or unsafe path passes a final-output grader; only the trace reveals it.

The loop is: **read traces → name failure modes → encode them as cases/graders → then optimize the metric.** Skipping straight to "the number went up" is how teams optimize a metric they have never grounded in reality.

## The Statistics of "Is This Better?"

A pass-rate is an estimate, not a measurement. "Version B scored 3 points higher" is not a shipping argument until you have asked whether the gap survives sampling noise. This is the single most common place eval-driven development degrades into eval-flavored vibes: a team reads two numbers, declares a winner, and ships a change the data does not actually support. (The statistics matter *most* once the suite is past its starter phase — early, large-effect changes are visible even at n=20; single-percentage-point arguments are where the machinery below earns its keep.)

**Report sample size with every pass-rate, mean score, or win rate.** A bare number with no n is not interpretable.

**Compare the delta, not two separate intervals.** The decision rule is whether the **confidence interval on the *difference* (B − A) excludes zero** (or clears the predeclared regression budget) — not whether A's and B's individual intervals fail to overlap (the overlap check is needlessly conservative and throws away power).

**Prefer a paired test on a shared dataset.** Run both system versions on the *same* eval examples and analyze the per-example score differences. Because scores on the same question are positively correlated across versions, the paired estimator removes that shared variance "for free" — a paired t-test or Wilcoxon signed-rank produces a *substantially* tighter confidence interval on the delta than the unpaired equivalent, at the cost of roughly 2× inference (you run both arms). *How much* tighter is not a fixed quantity: it scales with the within-example correlation between the two arms, so the gain is large when versions agree on most examples and modest when they do not — there is no universal "orders of magnitude" multiplier to quote. When you cannot pair (different datasets), fall back to the unpaired interval and expect to need far more data.

**For paired binary pass/fail outcomes, name the test.** McNemar's test (or an exact binomial test on the discordant pairs) is the usual check for whether B fixes more cases than it breaks. The interesting count is not total wins; it is `A fail / B pass` versus `A pass / B fail`.

**Bootstrap the delta when assumptions are shaky.** For small, skewed, or non-normal datasets, compute `delta_i = score_B_i − score_A_i` for each shared example, resample the delta vector with replacement (e.g. 1,000–10,000 resamples), recompute the mean/pass-rate delta, and use the 2.5th and 97.5th percentiles as the approximate 95% interval. Ship only when that CI sits entirely on one side of zero. When central-limit assumptions hold and n is a few hundred or more, a closed-form paired interval (`Δ ± 1.96 × SE(difference)`) is sufficient and bootstrapping is optional.

**Know your minimum detectable effect (MDE) before you run.** Sample size scales **quadratically** with the inverse of the effect you want to detect: detecting a gap half as large requires **4× the samples**. There is no universal "N examples per 1% gap" constant — the requirement depends on the design and the pass-rate. For an *unpaired* one-sample 95% CI with ±1pp half-width, the normal approximation needs roughly `1.96² · p(1−p) / 0.01²` examples: ≈9,600 at p=0.5, ≈6,100 at p=0.8, ≈3,500 at p=0.9 — thousands, not hundreds, to pin a single percentage point. As a rough feel for smaller suites, a binary pass-rate at `n=100` has a 95% half-width of about ±8pp near 80% pass-rate and about ±10pp near 50%; `n=400` cuts those roughly in half. **These figures are the *unpaired* case** — and they are why teams that actually ship on small eval suites run *paired* comparisons, which need far fewer examples for the same MDE (how many fewer depends entirely on the arm correlation, so no fixed per-1pp number is defensible for either design). The practical consequence: a small eval resolves only coarse effects — treat any delta below your design's MDE as "no signal," not "small improvement," and compute that MDE for *your* design and pass-rate rather than trusting a rule of thumb. For finer MDE you need more examples, repeated runs, or token-probability scoring.

**Account for correlated examples (clustered standard errors).** If your dataset contains groups of related examples — multiple questions from one document, paraphrases, translations, repeated tasks from one user — the effective sample size is the number of *clusters*, not the number of rows. Naively treating correlated rows as independent can understate the true standard error by ~3×, turning noise into a false "significant" result. Cluster the standard error on the grouping variable, or treat the cluster count as the effective n.

**Shrink within-question noise with repeats.** A stochastic system gives a different score on the same input across runs. Generating K samples per question and averaging reduces the within-question variance by a factor of K; when token-probability scores are available, that within-question noise can be eliminated entirely. Repeat runs whenever the system, tools, environment, or judge is stochastic enough that one run can flip the result.

**Choose the repeated-trial metric that matches the product promise (`pass@k` vs `pass^k`).** For stochastic agents, repeated runs can answer two opposite questions. `pass@k` asks whether *at least one* of k attempts succeeds; it *rises* as k increases and is appropriate when the product can cheaply try multiple candidates and keep the first valid one. `pass^k` asks whether *all* k attempts succeed; it *falls* as k increases and is the right consistency metric when a user expects the agent to work every time. A change can improve `pass@10` while making `pass^3` worse — it found more lucky successes but became less reliable. Record which repeated-trial metric gates the change *before* running the eval, because the two reward opposite behaviors.

**Report slices separately, and treat high-risk slices as veto gates.** Break results out by task type, difficulty, user segment, language, tool path, safety class, context source, model family, and known prior failures. A +5-point average does not justify a critical privacy, safety, tool-side-effect, or grounding regression on a slice.

**Reporting standard.** A defensible eval result reports: mean score, standard error (CLT-based or clustered), the 95% CI on the *delta*, sample size n, cluster count, the slice table, the MDE or threshold, the repeat-run policy, the cost/latency delta, and — for a paired comparison — the correlation between the paired arms. A bare "B scored higher" with none of these is an unverified claim.

> Boundary note: *constructing* the rubric, hard negatives, and acceptance thresholds is the task-specific work of constructing the rubric, hard negatives, and acceptance thresholds; *interpreting whether the delta is real and gating the change on it* is this skill's. The statistics live here because they are the gating decision.

## Iteration Loop Discipline

The eval-driven iteration loop is the development cycle. Run the suite, diagnose failures and slices, choose one meaningful change, re-run the same suite, gate the change on the regression budget.

```text
baseline eval
  -> diagnose failures and slices (READ THE TRANSCRIPTS, not just the score)
  -> choose one meaningful change
  -> re-run the same eval suite
  -> compare against regression budget
  -> merge, iterate, or revert
```

The "diagnose" step is error analysis, not metric-watching (see § Read The Transcripts). Allowed system changes include prompt wording, system/developer instructions, retrieval query strategy, context packing, tool schema, tool-call policy, model choice, reasoning effort, output format, guardrail policy, and orchestration. The suite should remain stable during the comparison. **Change one thing per iteration** so the eval delta is attributable; if the budget allows multiple changes, gate them as a batch but expect harder root-causing when the batch regresses.

**Pre-register the decision rule before you run (spec-first, anti-p-hacking).** The structural defense against fooling yourself is to write down *what you will measure, the threshold, and the ship/no-ship rule* before you see the result — not after. Before a candidate run, write the eval spec as if it were a test plan: baseline system, candidate change, dataset version, primary metric, secondary metrics, slice vetoes, judge/grader version, sample size or repeat count, MDE, cost/latency ceiling, and merge rule. After the run, record whether the predeclared rule passed. An iteration loop that decides the metric and cutoff *after* looking at the numbers is p-hacking with extra steps: with enough sliced views (this subset, that stratum, this rephrased grader) some comparison will always cross significance by chance, and a team that picks the favorable slice post-hoc ships noise. Treat any post-hoc slice that "looks better" as a *hypothesis for the next pre-registered run*, not as evidence for this one — that is a new experiment, not the same comparison.

**Iterating on the *gate* set silently over-fits it.** A documented 2026 failure mode: when prompt edits are tuned against the same eval set that decides whether they ship, "better" eval scores can correspond to *worse* production behavior — the prompt has learned the eval, not the task ("When Better Prompts Hurt," 2026). The defense is structural: keep a held-out slice the iteration never sees (see § Goodhart defenses), and connect offline scores to online outcomes so an offline gain that does not show up in production is caught.

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
| Capability / quality | What can the system do well, and is it improving? | During active development | Watchful/decision-input — *designed to start at a low pass-rate* so future model/system gains are visible; near-100% here means the suite has gone blunt |
| Regression | Did this change break anything that worked? | Every change / PR | Gating — named case or slice must not regress; this suite *should* sit near 100% (that is its job — see the 100%-pass-rate carve-out) |
| Calibration | Does the model-grader/rubric still agree with humans or a trusted reference? | Periodic cadence (e.g. quarterly) | Watchful — drift triggers re-anchoring, not a block |
| Red-team / adversarial | Can the system be made to fail, leak, or violate policy? | Pre-release + on cadence | Gating on critical cases; tracked otherwise |
| Cross-model | How do candidate models compare on *our* tasks (a model upgrade, reasoning-effort change, vendor switch, or fallback strategy)? | At model-selection decisions | Decision input — compare quality, cost, latency, and high-risk slices; not a merge gate |
| Drift-refresh | Has production behavior or requirements moved since the dataset was written? | When telemetry surfaces drift | New cases are added; old-vs-new comparability is recorded |

The point is not the exact list — it is that a single fragile number conflates jobs that need different datasets, cadences, and gating rules. Splitting the suite by archetype is how you stop a calibration drift from silently masquerading as a quality regression, and how you avoid reading a *regression* suite's healthy near-100% as a *capability* suite's saturation failure.

## Calibrating Model-Graded Evals (LLM-as-Judge)

Model-graded evals are the workhorse of open-output evaluation, but the judge is itself a stochastic, biased instrument — another model with its own error distribution. Treat it as a measurement instrument that needs calibration, not as neutral authority. Naming the biases and fixing them *mechanically* is operational hygiene, not optional polish. (And calibration starts with reading graded transcripts — see § Read The Transcripts — because a bias you have not *seen* in a trace is a bias you cannot size.)

**Known biases of an LLM judge.** The effect-size column gives *illustrative ranges* — they vary widely by judge model, task, and study, so treat them as "big enough to flip a close call," not as fixed constants; **measure the effect on your own setup** before trusting any number here. (2026 systematic studies report frontier judges failing the majority of standardized bias probes, so assume the biases are present until your own calibration data says otherwise.)

| Bias | What it is | Illustrative effect size | Mechanical fix |
|---|---|---|---|
| Position bias | In pairwise comparison, the judge favors the response in a particular slot regardless of content; strongest when candidates are close in quality | Can shift win-rates by ~10+ points on close calls; ~40% verdict-flip inconsistency reported for some frontier judges | Swap positions (A-then-B and B-then-A), average; treat swap-inconsistent verdicts as low-confidence |
| Verbosity / length bias | Longer answers score higher even when the extra content adds nothing | One of the larger, most consistently reported effects | Length-control the candidates, or penalize/normalize for length; include length-matched calibration pairs |
| Self-preference bias | A judge rates its *own model family* higher (genuine quality and bias are *conflated* in raw win-rates) | Reported single-digit to low-double-digit win-rate shifts | Judge from a different top-tier family; detect empirically (below); never let a model be the sole judge of its own family |
| Format bias | Superficial structure (markdown, headers, citation style, confident tone) sways the score independent of substance | Varies; close-call magnitude | Strip/normalize formatting before grading where feasible; rubric anchored to substance; include format-variant calibration examples |
| Calibration drift | A judge anchored to human judgment diverges over time, or a silent provider-side model update shifts scores with a byte-identical prompt | Accumulates until re-anchored | Pin judge versions where possible; recalibrate against humans on a cadence; re-run calibration on every judge-model version bump |

**Treat the bias table as a checklist, not a universal ranking.** There is no fixed hierarchy of which bias dominates: recent LLM-as-judge debiasing work found *style* bias dominating *position* bias in its experimental setup, while other work emphasizes position, verbosity, and self-preference — and debiasing strategies are themselves model-dependent (a mitigation that helps one judge can be neutral or harmful for another). The safe operational move is *local measurement*: build calibration pairs that hold substance fixed while varying style, length, format, model family, and answer order, then estimate which bias is large enough to flip *your* gate. Record the calibration receipt rather than importing a generic bias hierarchy.

**The fixes are mechanical, not prompt-level.** Adding "evaluate objectively, ignore writing style" to the grader prompt does **not** remove these biases, because they live in the model's embedding distribution, not in surface style. What works:

- **Judge from a different family than the candidate — but only if the cross-family judge is itself a top-tier model.** Diversifying families breaks self-preference bias *only* when the alternate judge is at least as capable as the candidate; grading quality with a *weaker* model to "diversify families" trades one bias for a worse one (an unreliable judge) and is a false economy. If you cannot afford a top-tier judge from a different family, a *same-family top-tier* judge with position-swapping and human calibration is a legitimate fallback — not ideal, but valid when the mechanical mitigations are applied, and strictly better than dropping to a weaker cross-family judge. Never let a model grade its own family's output as the *sole, un-mitigated* judge.
- **Give the judge a defined escape hatch.** Let the grader return `Unknown` / `cannot determine` when the transcript does not contain enough information to grade the criterion, rather than forcing a pass/fail guess (Anthropic's agent-eval guidance). A forced binary on an under-specified case manufactures noise; an explicit abstain bucket both reduces that noise and surfaces under-specified cases for rubric repair. (This is a grader-*contract* fix, distinct from "be objective" prose — it changes the output space, not the instruction tone.)
- **Use reference-guided grading where a correct reference exists.** Anchoring the judge to a known-good answer is more reliable than open-ended absolute scoring (2026 mitigation literature).
- **Swap positions** (run each pairwise comparison both ways, A-then-B and B-then-A) and average, to cancel position bias. Inconsistent verdicts across the swap are themselves a signal of low-confidence judgments.
- **Ensemble across families for high-stakes decisions — but prefer a meta-judge to a debate.** For a launch gate, run a small multi-family judge panel and aggregate by majority or weighted vote; family-specific biases tend to cancel, at roughly N× the cost of a single judge. Note a 2026 caution: *debate-style* multi-model setups can *amplify* bias rather than cancel it, so aggregate independent verdicts (meta-judge / vote) rather than letting judges argue toward consensus.
- **Detect self-preference empirically.** Generate the *same* answer with two different families on a calibration set, have each judge score both; if a judge scores its own family's text consistently higher on equivalent content, you have measured the bias and can correct or down-weight that judge.
- **Calibrate against humans on a sample** every cadence (quarterly is a common default). The operational loop has named steps: (1) draw a *stratified* sample of graded examples (cover pass/fail and each criticality band, not just a random slice that under-represents rare-but-important cases); (2) have humans grade that sample blind to the model's score; (3) measure agreement with an inter-rater statistic — Cohen's κ or percent-agreement, not eyeballing — and set a re-anchor threshold below which the judge is not trusted; (4) **re-run the calibration whenever the judge model version changes**, because a silent provider-side update can shift scoring even with a byte-identical prompt. A judge that has not been calibrated since its model last changed is reporting an unverified number.

Estimate judge-bias magnitude on the *local* calibration slice in score points or win-rate points. Do not import universal bias ranges as if they were constants; the size depends on task, rubric, judge model, candidate model, answer length, and how close the variants are.

> Boundary note: this section is the *measurement-hygiene* application of calibration inside the iteration loop. The *design* of the grader rubric and its anchors belongs with the task-specific work of constructing the grader rubric and anchors; the *general* result-interpretation framework is `evaluation`.

## Evaluating Multi-Step Agents — Trajectory, Not Just Final Output

The five primitives describe the general pattern, but for a multi-step **agent** (one that plans, calls tools, reads results, and iterates) the *unit being graded* shifts. Grading only the final answer is insufficient and actively dangerous: an agent can reach a correct final answer through a broken, wasteful, or unsafe path — calling the wrong tool, fabricating an intermediate result, taking a destructive action that happened not to matter this time — and pass a final-output-only eval while being unfit for production.

**Two complementary metric families:**

| Metric family | Question answered | Examples |
|---|---|---|
| Final-output / outcome | Did the agent end in the correct end state? | Task success, goal completion, end-state assertion |
| Trajectory-aware | Was the *path* correct, efficient, and safe? | Tool-selection accuracy, tool-call argument correctness, plan validity, step efficiency (no needless loops), absence of unsafe intermediate actions |

A complete agent eval scores **both**, because a high outcome score with a poor trajectory score is a strong predictor of brittle production behavior (the agent succeeded by luck or memorization, not by sound process). The grading unit here is the *transcript* (also called a trace or trajectory): the complete record of a trial — outputs, tool calls, reasoning, intermediate results, and interactions — and grading it well requires *reading* a sample of those transcripts (see § Read The Transcripts), not only scoring the end state.

**Reference benchmarks for the *shape* of agent evals** (cited for grounding, never for gating your system): τ-bench and τ²-bench (multi-turn tool-use agents in policy-constrained environments with shared world-state), BFCL (function/tool-calling correctness across languages and modes), GAIA and Terminal-Bench (end-to-end multi-step assistant tasks), and the trajectory-aware benchmarks that explicitly score the sequence of tool calls rather than only the final state. Use these to understand what trajectory grading looks like; build your own trajectory eval against your agent's actual tools and policies.

### Trace-First Debugging, Dataset-Backed Gates

§ Read The Transcripts establishes *why* you read traces (validate the grader, find the real failures); this subsection is the agent-specific *workflow* that turns that reading into a gate. For agents, the fastest path from "something is wrong" to "we know what to measure" is often trace grading: a trace captures the model calls, tool calls, handoffs, guardrails, intermediate state, and final output for one run. Grading traces is excellent for diagnosing whether the agent chose the wrong tool, skipped a handoff, violated a policy, looped wastefully, or reached the right answer through a fragile path (OpenAI's agent-evals guidance: start with trace grading while debugging, then move to datasets/eval runs when you need repeatability).

But a graded trace is *not* automatically a release gate. A single trace is evidence for a failure mode; a *versioned dataset* of traces or tasks is the comparable measurement instrument. The promotion loop:

```text
inspect representative trace
  -> identify failure mode
  -> turn it into a task / trace expectation
  -> add it to a versioned dataset
  -> rerun baseline and candidate
  -> gate on the predeclared regression budget
```

Use trace tooling to find and localize failures; use datasets and eval runs to compare system versions. This keeps trace inspection from becoming another form of anecdotal "vibe eval."

## Public Benchmarks — Cited For Grounding, Not For Gating

Benchmarks measure cross-system capability against a shared standard. They predict how a model will do on the *exact* tasks the benchmark contains. They do not prove your specific system — with your prompt, tools, retrieval, latency budget, and user population — is good enough to ship.

| Benchmark | Measures | Cited for |
|---|---|---|
| MMLU (Hendrycks et al., 2021) | 57 subjects of multiple-choice general knowledge | Breadth of general capability (now saturated at the frontier — see note below) |
| HumanEval (Chen et al., 2021) | 164 programming problems graded by test execution | Code-generation correctness baseline |
| BIG-bench (Srivastava et al., 2022) | 200+ tasks across the long tail of NLP | Breadth of niche capabilities |
| GAIA (Mialon et al., 2023) | General-assistant multi-step tasks with tool use | Realistic agentic-task baseline |
| MT-Bench / Chatbot Arena (Zheng et al., 2023) | Pairwise preference comparison for chat | Human-aligned preference signal |
| HELM (Liang et al., 2022) | Multi-scenario, multi-metric model evaluation | Reminder that single metrics are incomplete |
| SimpleQA | Short fact-seeking questions | Factuality and calibration-style checks |
| SWE-bench family | Real software-issue resolution | Coding-agent capability baseline — only with an explicit benchmark member/version and current contamination/retirement status; OpenAI no longer treats SWE-bench Verified as suitable for frontier progress (flawed tests + contamination) and recommends SWE-bench Pro while new uncontaminated evals are built (known contamination vector — see § Benchmark Validity Is Decaying) |
| τ-bench / τ²-bench (2024–2025) | Multi-turn tool-use agents under explicit policies, shared world-state | Agentic / trajectory-task baseline |

The right use: pick a model partly on benchmark performance (and to notice upstream movement), then build system-specific evals to gate the actual deployment. **Note that several headline benchmarks are now saturated at the frontier** (MMLU sits in the high-80s–90s for current frontier models), which means a benchmark can stop *discriminating* between candidate models even before contamination is considered — a saturated public benchmark is no more useful for model selection than a saturated private suite is for gating.

**Every public benchmark reference needs a benchmark-state note: active, saturated, contaminated, retired/deprecated, or model-selection-only.** When a maintainer, vendor, or credible audit says a benchmark no longer measures the intended frontier, do not keep citing its headline score as if nothing changed. Preserve the benchmark as historical context, but move decisions to the current replacement or to a private system-specific suite. A benchmark can fail on either side: too narrow (rejects correct solutions), too wide or underspecified (accepts lucky or memorized solutions), contaminated, saturated, or recognized by eval-aware agents.

## Benchmark Validity Is Decaying — Eval-Awareness and Contamination

Two forces erode the gating value of *any* fixed eval over time, and both have sharpened as frontier models have grown more capable (documented across 2025–2026 research). Critically, this is **structural decay, not a transient bug**: eval-awareness has been reported to scale with model capability (a power-law-style relationship with model size), so each frontier generation predictably makes the problem *worse*, not better. An eval-design practice that assumes today's benchmarks will stay valid is planning to be wrong.

- **Contamination.** Benchmark questions, solutions, and discussions leak into training data and the public web. A model can then "solve" a contaminated item by recall rather than reasoning, inflating the score without the underlying capability. Concretely (2026): frontier-eval teams have reported models reproducing the *gold patch or problem statement verbatim* from a coding benchmark using nothing but the task ID — at which point the score measures recall, not engineering ability — and a frontier model in a multi-agent configuration was observed *actively finding* contaminated items inside a public benchmark and working backward from the leaked answers.
- **Eval-awareness.** Frontier models can detect features of their environment that signal "this is an evaluation, not real deployment" — and in some cases change behavior accordingly. The documented direction includes models inferring they are being tested without being told which benchmark; one lab reported internal representations consistent with evaluation-recognition on a meaningful fraction of a verified coding benchmark, and verbal evaluation-awareness surfacing in a fraction of alignment-eval transcripts (low-double-digit percentages in the reported studies). Linear probes have exposed evaluation-awareness features that generalize across models. When a model behaves differently *because* it knows it is being evaluated, the eval no longer measures deployment behavior — a *validity* failure (construct, ecological, and inference validity all degrade), not merely a noise problem.

**Tier the eval-awareness evidence — do not overclaim from a trace that merely says "this might be an eval."** Evaluation-awareness evidence has levels of severity: a model *classifying* a transcript as evaluative is a risk signal; a model *changing its answer distribution* because it detects the eval is stronger; a model *actively searching for, decrypting, or exploiting* benchmark materials is a direct integrity failure. The current evidence is genuinely mixed: frontier models can often identify evaluation contexts (Needham et al., 2025) and a web-enabled BrowseComp run was documented working backward to benchmark materials, yet a 2026 causal study of *verbalized* evaluation awareness in open-weight reasoning models found limited behavioral effect in the tested settings (Knecht et al., 2026). The practical rule: inspect and *record the level* of evidence, and match the response to it — do not treat every eval-aware phrase as automatic invalidation, and do not dismiss demonstrated behavior change or exploitation as "just a phrase."

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
- **The suite saturates — the system aces it (pass-rate at or near 100%).** A *capability/gating* suite the system passes completely has stopped discriminating: it can no longer tell a better version from a worse one, so it provides zero gating signal even though the number looks ideal. A 100% pass-rate on a capability suite is a *measurement failure*, not a victory. (Carve-out: a dedicated *regression* suite is *supposed* to sit near 100% — that is its job. See § The 100% Pass-Rate Trap.)

Defenses:

- **Hold out a portion of the dataset from active iteration.** Score it periodically; if held-out and development pass-rates diverge, the iteration is over-fitting. This is the structural defense against the "better prompts hurt" failure mode: iterating against the same set that gates you teaches the system the set, not the task (empirically documented in 2026 — prompt edits that raised dev-set scores lowered production performance when the dev set was reused for iteration).
- **Keep a frozen prior-failure set** that every release must pass, even as the main suite evolves.
- **Periodically refresh the eval dataset** from sanitized production traces, user feedback, incidents, and domain-expert cases, to prevent the dataset from going stale.
- **Calibrate model-graders against humans.** A grader that has drifted from human judgment can produce high pass-rates on outputs humans dislike.
- **Randomize answer order and blind variant labels** for pairwise judging.
- **Track multiple criteria and slices, not one average.** A single headline number is easier to over-fit than a panel of independent measures.
- **Harden a saturated suite.** When a capability suite's pass-rate hits the ceiling, add harder/production-sampled/adversarial cases (or retire obsolete ones as a versioned eval change) so it can again separate a better version from a worse one. A suite nobody can fail measures nothing.
- **Preserve failures as evidence.** A failing eval is a product requirement becoming concrete, not an annoyance to delete.

### The 100% Pass-Rate Trap

A *capability or gating* suite that reaches 100% pass-rate is often no longer measuring the frontier of product quality. It may mean the capability is truly solved, but it can also mean the cases are too easy, the judge is too forgiving, the system has overfit the development set, or the eval has lost discriminative power.

**The carve-out that prevents over-applying this rule:** the warning targets *capability* suites (designed to start at a low pass-rate so future gains are visible) and *gating-frontier* suites. A dedicated **regression suite is supposed to sit at or near 100%** — its job is to catch backsliding on things that already work, so a near-perfect regression suite is healthy, not saturated (Anthropic's agent-eval guidance draws exactly this contrast: capability evals start low, regression evals should have a near-100% pass rate). The diagnosis "saturated → harden it" applies to the capability/gating suite; applying it to a regression suite would be a category error. This is why splitting the suite by archetype (§ Eval Lifecycle Archetypes) matters: it tells you which 100% is a problem.

When a *capability/gating* suite is perfect or near-perfect:

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

A team that trusts only offline evals ships changes that pass the suite and degrade in production on inputs the suite never contained; a team that trusts only telemetry has no gate and learns about regressions from users. Vendor guidance (e.g., Anthropic's 2026 evals guidance) is now explicit that static pre-deployment tests cannot fulfill the production-monitoring requirement — systematic post-launch human review of real traffic is a *distinct, required* activity, not something offline evals replace. (This is the "Swiss-cheese" framing: automated evals, production monitoring, A/B testing, and human review are overlapping layers, and no single layer catches every failure.)

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

Eval tooling has consolidated and matured (2025–2026), and modern platforms automate major pieces of the loop — but **none of it replaces the discipline this skill teaches**. Choosing what to measure, sampling representative data, judging whether a delta is real, calibrating the judge, reading the transcripts, and resisting Goodhart remain human/architectural decisions a framework cannot make for you. Treat the tools as the *substrate* the iteration loop runs on:

- **Inspect** (UK AI Security Institute / AISI) — an open, provider-flexible framework purpose-built for capability and safety evals, with datasets, solvers/agents, scorers, tools, sandboxing, and a large library of pre-built evals.
- **OpenAI Evals / Datasets / Trace grading / Promptfoo** — OpenAI now exposes a layered workflow: trace grading for workflow-level diagnosis, datasets and eval runs for repeatable comparison, the Evals API for larger-scale and external-model evaluation, and Promptfoo's red-team/eval tooling moving under OpenAI Frontier. Treat this as a powerful native substrate, not a neutral authority: check data-boundary requirements, logs/data-source semantics, and vendor lock-in before making it the only gate. The Evals API still supports JSONL run sources, but current references also emphasize logs/data-source configs — do not teach "JSONL only" as the API truth.
- **Anthropic eval tooling** — Claude Console evaluation workflow (prompt variants, generated test cases, side-by-side comparison, quality grading, prompt versioning); eval creation/execution is now built into Anthropic's skill-creator, treating skills and context as software that requires testing.
- **DeepEval and similar harnesses** — pytest-style assertion layers over LLM outputs for CI integration.
- **Trajectory- and trace-based eval tooling** (for the agent / multi-step surface, not just final output) — OpenAI trace grading, Google's Agent Development Kit (ADK) eval UI/pytest/CLI, LangChain AgentEvals / LangSmith (deterministic and LLM-as-judge trajectory evaluators, datasets, offline/online evaluators), Inspect, and MLflow's trace-based judges/scorers. These score the *path* (tool calls, intermediate state, handoffs, sandbox state, or trace-derived fields) against a reference trajectory — the tooling counterpart to § Evaluating Multi-Step Agents — but still depend on the team's versioned dataset, regression budget, judge calibration, and privacy boundary.
- **Ragas** — RAG-oriented metrics (context precision, context recall, faithfulness, response relevancy), the tooling counterpart to § RAG Eval Surfaces.
- **Production-observability eval platforms** — Braintrust, LangSmith, Langfuse, Arize Phoenix, and MLflow increasingly combine offline evaluation with tracing, production monitoring, feedback capture, and experiment ledgers. The convergence is useful, but it raises the importance of *separation of concerns*: production telemetry discovers new cases, offline evals gate candidate changes, and online experiments validate deployed behavior (see § Offline Evals vs Production Telemetry) — one surface in a single dashboard does not collapse those three jobs into one.

**Selection and versioning are part of the discipline, not the framework's job.** Choose a harness on whether it can: keep private eval examples and traces inside the required data boundary; express *your* judgment mechanisms (programmatic + model-graded + preference + human-in-the-loop); score the eval *surfaces your system has* (trajectory and retrieval, not just final response); integrate into your CI gate (block PRs, annotate changes, preserve an experiment ledger); support a human calibration workflow; let you *read and triage transcripts* easily, not just read a dashboard scalar; avoid single-vendor lock-in if you need multi-provider grading; and rerun old systems against new eval versions reproducibly. And version the eval dataset itself like code: tag the dataset version a result was produced against, and treat a dataset change as a change that invalidates prior pass-rates — a delta is only comparable across runs on the same dataset version.

## What This Skill Is Not

This skill is the development *discipline* for using LLM evals as change gates. Specific neighboring scopes:

- The mechanics of running evals in CI/CD pipelines belong to a tooling skill — though the *decision* to run continuous evals on every change is part of this discipline.
- The construction of individual eval rubrics, task sets, graders, hard negatives, trace expectations, and thresholds belongs with the task-specific work of constructing the grader rubric and anchors.
- The deterministic testing of non-LLM code belongs to `testing-strategy`; general software TDD belongs to `test-driven-development` or `testing-strategy`.
- General scoring frameworks and result interpretation belong to `evaluation`.
- Production exception reporting belongs to `error-tracking`; telemetry semantics belong to `observability-modeling`.
- Tool-call protocol mechanics belong to `tool-call-flow`; this skill can measure whether tool-use behavior is correct.
- Security threat modeling and defenses for prompt injection belong to `prompt-injection-defense`; this skill can measure whether a defense holds.

## Verification

After applying this skill, verify:

- [ ] The system has a private, system-specific eval dataset, checked into version control, that represents production work, hard cases, prior failures, and at least one held-out slice; each case is labeled with its provenance/origin. (A starter set of 20–50 real-failure cases is a legitimate beginning; "no eval yet because it isn't comprehensive" is not.)
- [ ] Failures were diagnosed by reading a sample of transcripts/traces — not by metric-watching alone — and the grader itself was spot-checked against those traces before its aggregate was trusted.
- [ ] Each eval criterion has a defined judgment mechanism (programmatic, model-graded, human-graded, preference comparison, trace check, or hybrid), and the mechanism's known biases are accounted for.
- [ ] Agentic systems evaluate the right surface: final answer, trajectory (tool selection, argument correctness, plan validity, unsafe-action absence), retrieval/context use, safety boundary, side effects, and cost/latency — not only the final output.
- [ ] For RAG systems, retrieval is evaluated separately from generation — context recall/precision, faithfulness/groundedness, answer relevance, and citation support are distinct measures, so a failure is localized to the retriever, context packing, synthesis, or citation rather than blamed on "the model."
- [ ] Every eval surface the system actually has carries at least one eval; the headline number is not a single final-response score standing in for all of them.
- [ ] Aggregation reports pass-rate with sample size, slices, and either a confidence interval, repeated-run evidence, or a defined minimum-detectable-change threshold.
- [ ] When comparing two system versions, the decision is gated on the confidence interval of the *delta* (B − A) excluding zero (or a predeclared threshold) — ideally via a paired test on a shared dataset; paired binary comparisons consider McNemar's test or an exact discordant-pair test; correlated examples are clustered or de-duplicated; the eval's MDE is known and deltas smaller than it are treated as "no signal."
- [ ] Each eval metric or slice has an explicit regression budget: gating, optimizing, watchful, human-signoff, or cost-aware (a pass-rate gain must clear the cost/latency budget to count); high-risk slices are veto gates even when the average improves.
- [ ] The comparison was pre-registered before looking at candidate results: dataset version, primary metric, judge version, slice vetoes, sample size/repeat policy, MDE, cost/latency budget, and merge rule (anti-p-hacking); iteration is not done against the same held-out set that gates the change.
- [ ] Model-graded evals are judged by a different top-tier model family than the candidate where possible, with position-swapping and blinded variant labels in pairwise comparisons, a defined abstain/`Unknown` option, reference-guided grading where a reference exists, and have been calibrated against human review on a documented cadence (with judge-bias magnitude measured on a local calibration slice and recalibration on every judge-model version bump).
- [ ] Safety and red-team evals report attack success, false-positive refusals, severity, and boundary-trace correctness; critical failures veto merge.
- [ ] A held-out portion of the dataset is reserved from active iteration and scored periodically to detect over-fitting; gating decisions prefer private, production-sampled data over public benchmarks to resist contamination and eval-awareness; a contamination register exists for any public benchmark cited in a decision.
- [ ] The suite is split by archetype so a healthy near-100% *regression* suite is not misread as a saturated *capability* suite — and a capability/gating suite is not pinned at or near 100%; a saturated capability suite triggers a suite-hardening review rather than automatic confidence.
- [ ] Prompt, model, retrieval, context-packing, tool, and orchestration changes all run through the same change-gating loop; a model upgrade or vendor switch has been tested against the private suite, including high-risk slices, cost, and latency.
- [ ] Public benchmarks (MMLU, HumanEval, etc.) are cited for model-selection grounding but are not the gating decision for system-specific quality; their saturation/contamination status was checked before they were trusted.
- [ ] Production telemetry, shadow runs, canaries, user feedback, A/B tests, and manual transcript review feed sanitized cases back into the offline dataset; they do not replace offline eval gates, and a change earns its way across the rollout spectrum (offline gate → shadow → canary → A/B → full) rather than jumping straight to all traffic, with the online A/B comparison using the same CI-on-the-delta statistics as the offline one.
- [ ] The eval dataset is version-controlled and a result records the dataset version it was produced against; deltas are only compared across runs on the same dataset version.
- [ ] Every suite is labeled by posture — bootstrap, regression, capability, launch gate, or drift-refresh — and a small bootstrap suite is not used to certify a small delta below its MDE.
- [ ] Repeated-trial results distinguish `pass@k` from `pass^k`, and the chosen metric matches the product promise (one good candidate vs reliable every-time behavior).
- [ ] Trace-grading findings have been promoted into versioned dataset cases before they are used as a repeatable release gate, not treated as a gate on their own.
- [ ] Any cited public benchmark carries a state note — active, saturated, contaminated, retired/deprecated, or model-selection-only — and a benchmark replacement is used when a credible maintainer or vendor has retired the older signal.
- [ ] Eval-awareness evidence is tiered (detection phrase vs measured behavior shift vs direct benchmark exploitation) and the response matches the evidence level rather than treating every eval-aware phrase as automatic invalidation.
- [ ] LLM-judge calibration includes local style/format/length/order/model-family perturbation pairs, not only human agreement on unperturbed examples.
- [ ] The shipping threshold is a product decision documented before the comparison, not an emergent average across team opinion.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Writing deterministic unit tests for non-LLM code | `testing-strategy` | testing-strategy owns binary pass/fail test planning; this skill owns distributional LLM-system measurement |
| Designing individual eval rubrics, task sets, graders, traces, hard negatives, or thresholds | Build those rubrics, cases, graders, traces, hard negatives, and thresholds as task-specific artifacts | This skill owns the iteration discipline that uses those eval materials |
| Interpreting scores or applying a general evaluation framework without changing an LLM-system eval loop | `evaluation` | evaluation owns general scoring frameworks and result interpretation; this skill owns repeated system-change gates |
| Setting up production monitoring, alerting, trace semantics, or exception capture | `error-tracking` or `observability-modeling` | those own live runtime measurement; this skill owns offline/pre-deployment eval gates and dataset refresh from telemetry |
| Reasoning about the protocol cycle of tool calls | `tool-call-flow` | tool-call-flow owns the mechanism; eval-driven development can measure whether tool-use behavior is correct as one criterion |
| Defending against prompt injection | `prompt-injection-defense` | prompt-injection-defense owns the security property; this skill can measure whether the defense holds |
| General software TDD process | `test-driven-development` or `testing-strategy` | TDD is process-shape for general software; this skill is concept-shape for the LLM-specific evaluation-iteration discipline |

## Key Sources

- OpenAI. ["Evaluation best practices"](https://developers.openai.com/api/docs/guides/evaluation-best-practices) and ["Evals API reference"](https://developers.openai.com/api/reference/resources/evals). Current official guidance on eval-driven development, production-data/dataset mixing, held-out sets, continuous evaluation on every change, growing the eval set, and pairwise/classification/scoring-friendly eval design; the API surface for eval resources, JSONL data sources, graders, and runs.
- OpenAI. [openai/evals](https://github.com/openai/evals) (Promptfoo now under OpenAI). Open-source framework and registry for LLM and LLM-system evals, including private/custom eval patterns.
- OpenAI. ["Evaluate agent workflows"](https://developers.openai.com/api/docs/guides/agent-evals) and ["Trace grading"](https://developers.openai.com/api/docs/guides/trace-grading). Current official guidance on trace-first diagnosis, graders over model/tool/guardrail/handoff traces, and moving from traces to repeatable datasets/eval runs — the basis for § Trace-First Debugging, Dataset-Backed Gates and the layered-workflow framing in § The Tooling Landscape.
- OpenAI. ["Why SWE-bench Verified no longer measures frontier coding capabilities"](https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/) (2026). Current benchmark-retirement case study: flawed tests plus contamination can make a once-useful benchmark unsuitable for frontier progress measurement (recommends SWE-bench Pro) — the basis for the benchmark-state-note requirement in § Public Benchmarks.
- OpenAI. ["OpenAI to acquire Promptfoo"](https://openai.com/index/openai-to-acquire-promptfoo/) (2026). Current tooling-landscape shift: widely used open-source eval/red-team tooling moving under OpenAI Frontier, strengthening native security/eval workflows while raising vendor-neutrality questions.
- Anthropic. ["Demystifying evals for AI agents"](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) (2026). Practitioner guidance on agent eval structure; the basis for several points in this skill: capability evals start at a low pass-rate (and regression evals should sit near 100%) to make future model drops visible; transcripts/traces are the grading unit and you must *read* them to know your graders work; a starter set of "20–50 simple tasks drawn from real failures" is a great beginning; give the LLM judge an `Unknown`/way-out option; and the Swiss-cheese model in which automated evals, production monitoring, A/B testing, and human review are distinct overlapping layers (the production-monitoring-is-a-distinct-required-activity point).
- Anthropic. ["Define success criteria and build evaluations"](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests) and ["Using the Evaluation Tool"](https://platform.claude.com/docs/en/test-and-evaluate/eval-tool). Official guidance on success criteria, task-specific evals, volume vs grading quality, code/human/LLM grading, multidimensional criteria, and the Console prompt-comparison workflow; eval creation is now also built into Anthropic's skill-creator.
- "When Better Prompts Hurt: Evaluation-Driven Iteration for LLM Applications" (2026), [arXiv:2601.22025](https://arxiv.org/abs/2601.22025). Documents *evaluation overfitting*: prompt edits tuned against a reused eval set can raise eval scores while *lowering* production performance; the recommended discipline is strict dev/held-out separation and offline↔online connection. The empirical basis for the "iterating on the gate set silently over-fits it" point in § Iteration Loop Discipline and § Goodhart defenses.
- Rao, A., et al. "Evaluation-Driven Development and Operations of LLM Agents: A Process Model and Reference Architecture" (2024), [arXiv:2411.13768](https://arxiv.org/abs/2411.13768). Academic formalization of EDD as a process spanning offline development and online operations, treating LLM agents as compound systems (context engine, planning, memory, guardrails) that need system-level (not just model-level) evaluation; grounds the offline↔online and surface-stack framing.
- Anthropic. ["Eval awareness in Claude Opus 4.6's BrowseComp performance"](https://www.anthropic.com/engineering/eval-awareness-browsecomp) and [Apollo Research on eval-distinguishing](https://www.apolloresearch.ai/science/claude-sonnet-37-often-knows-when-its-in-alignment-evaluations/); "Decomposing and Measuring Evaluation Awareness" (2026), [arXiv:2605.23055](https://arxiv.org/abs/2605.23055). The basis for § Benchmark Validity Is Decaying — eval-awareness as a measured, decomposable property that scales with model capability (structural decay), plus the contamination evidence (verbatim gold-patch reproduction from a task ID; models actively locating contaminated benchmark items).
- Needham, J., Edkins, G., Pimpale, G., Bartsch, H., & Hobbhahn, M. (2025). ["Large Language Models Often Know When They Are Being Evaluated"](https://arxiv.org/abs/2505.23836), and Knecht, A., Florin, L., & Hagendorff, T. (2026). ["Evaluation Awareness in Language Models Has Limited Effect on Behaviour"](https://arxiv.org/abs/2605.05835). Read together they distinguish evaluation-context *detection* from measured *behavior change* — the basis for tiering the eval-awareness evidence rather than treating every eval-aware phrase as automatic invalidation.
- UK AI Security Institute and Meridian Labs. [Inspect](https://inspect.aisi.org.uk/). Open framework purpose-built for capability and safety evaluations of LLMs, with datasets, agents, tools, scorers, sandboxing, external-agent support, and a large pre-built eval library.
- Google. ["Why Evaluate Agents — Agent Development Kit"](https://adk.dev/evaluate/) (trajectory evaluation); LangChain. ["Agent Evals"](https://docs.langchain.com/oss/python/langchain/test/evals) and ["LangSmith evaluation concepts"](https://docs.langchain.com/langsmith/evaluation-concepts) (deterministic and LLM-as-judge trajectory evaluators, datasets, offline/online evaluators); MLflow. ["LLM Judges and Scorers"](https://mlflow.org/docs/latest/genai/eval-monitor/scorers/index.html) (built-in judges, custom LLM judges, code-based scorers over traces). The tooling counterpart to § Evaluating Multi-Step Agents.
- Ragas. ["List of available metrics"](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/) and Es, S., James, J., Espinosa-Anke, L., & Schockaert, S. (2023). ["Ragas: Automated Evaluation of Retrieval Augmented Generation"](https://arxiv.org/abs/2309.15217). Names the reference-free RAG eval dimensions (context precision/recall, faithfulness/groundedness, answer relevance) — the basis for § RAG Eval Surfaces. OpenAI's [evaluation best-practices guide](https://developers.openai.com/api/docs/guides/evaluation-best-practices) also names context recall and context precision in its Q&A-over-docs example.
- Wolfe, C. R. (2026). ["Applying Statistics to LLM Evaluations"](https://cameronrwolfe.substack.com/p/stats-llm-evals). Practitioner walkthrough of paired vs unpaired tests, bootstrap CIs on the delta, minimum-detectable-effect (the quadratic sample-size scaling), and clustered standard errors — the basis for § The Statistics of "Is This Better?". McNemar, Q. (1947). "Note on the sampling error of the difference between correlated proportions or percentages." Classic paired-binary test basis for comparing two systems on the same pass/fail cases.
- Zheng, L., Chiang, W.-L., et al. (2023). ["Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena"](https://arxiv.org/abs/2306.05685); ["Judging the Judges: A Systematic Study of Position Bias in LLM-as-a-Judge"](https://arxiv.org/abs/2406.07791) (2024); and the self-preference-bias literature (e.g. [arXiv:2410.21819](https://arxiv.org/pdf/2410.21819)), plus 2026 systematic bias-mitigation studies finding frontier judges fail a majority of standardized bias probes and that *debate-style* multi-judge setups can amplify rather than cancel bias (favor independent meta-judge/vote aggregation and reference-guided grading). Foundational and empirical basis for the mechanical (not prompt-level) bias-mitigation guidance in § Calibrating Model-Graded Evals (position, verbosity, self-enhancement biases).
- Soumik, S. K. (2026). ["Judging the Judges: A Systematic Evaluation of Bias Mitigation Strategies in LLM-as-a-Judge Pipelines"](https://arxiv.org/abs/2604.23178). Reports style bias dominating position bias in its setup and model-dependent mitigation effects — the basis for treating the judge-bias table as a local-measurement checklist (style/format/length/order/family perturbation pairs) rather than a universal bias hierarchy.
- Yao, S., et al. (2024). ["τ-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains"](https://arxiv.org/abs/2406.12045) and the 2025 ["τ²-Bench"](https://arxiv.org/abs/2506.07982) follow-up. Canonical references for multi-turn tool-use / trajectory-aware agent evaluation under explicit policies.
- Jain, N., et al. (2024). ["LiveCodeBench: Holistic and Contamination Free Evaluation"](https://arxiv.org/abs/2403.07974); White, C., et al. (2024). ["LiveBench: A Challenging, Contamination-Free LLM Benchmark"](https://arxiv.org/abs/2406.19314); Oren, Y., et al. (2024). ["ConStat: Performance-Based Contamination Detection in Large Language Models"](https://arxiv.org/abs/2405.16281). Time-sliced/contamination-aware benchmark design and statistical contamination detection — the basis for the contamination defenses in § Benchmark Validity Is Decaying.
- Hendrycks, D., et al. (2021). ["Measuring Massive Multitask Language Understanding"](https://arxiv.org/abs/2009.03300); Chen, M., et al. (2021). ["Evaluating Large Language Models Trained on Code"](https://arxiv.org/abs/2107.03374); Srivastava, A., et al. (2022). ["BIG-bench"](https://arxiv.org/abs/2206.04615); Mialon, G., et al. (2023). ["GAIA"](https://arxiv.org/abs/2311.12983). Canonical public benchmark references for model-selection grounding, not deployment gating.
- Goodhart, C. (1975). "Problems of Monetary Management: The U.K. Experience." The origin of Goodhart's Law as commonly cited; "when a measure becomes a target, it ceases to be a good measure."
- Liang, P., et al. (2022). ["Holistic Evaluation of Language Models"](https://arxiv.org/abs/2211.09110). The HELM framework paper; argues for multi-metric eval across many dimensions as a counter to single-metric Goodharting.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `ai-engineering`
- Public: `true`
- Domain: `agent/evaluation`
- Scope: Building language-model-integrated systems by writing evaluations before and alongside the system — the statistical (not binary) nature of LLM evals, the five primitives (dataset, evaluation function, aggregation, iteration loop, regression budget), the judgment-mechanism taxonomy (programmatic, model-graded, human-graded, preference comparison, trace/hybrid), the eval-surface stack (final response, trajectory/tool-use, retrieval/RAG, safety, side effects, cost/latency), continuous evals and model/vendor-upgrade gates, system-specific evals vs canonical benchmarks (MMLU, HumanEval, BIG-bench, GAIA), how evals drive prompt/model/scaffolding/tooling changes, the statistical-significance discipline (paired difference tests, McNemar's test for paired binary outcomes, bootstrap confidence intervals on the delta, minimum-detectable-effect, clustered standard errors, slice vetoes), trajectory-vs-final-output evaluation for multi-step agents, RAG eval surfaces (context recall/precision, faithfulness, answer relevance), model-grader calibration and bias mitigation, eval-awareness and benchmark-contamination risk, Goodhart's Law and suite saturation, cost-aware regression budgets, and the offline-eval-vs-production-telemetry distinction with its graded rollout spectrum. Portable across any LLM-integrated system; principle-grounded, not repo-bound. Excludes deterministic unit testing and general TDD (testing-strategy), production monitoring (evaluation, error-tracking, observability-modeling), and constructing individual eval rubrics, task sets, graders, hard negatives, and traces (the construction details are task-specific artifacts; this skill owns iteration discipline).

**When to use**
- design an offline eval suite for an LLM-integrated summarization feature before writing the prompt
- structure an iteration loop where each prompt, retrieval, tool, or model change is gated by a regression budget
- the new prompt scored 3 points higher on 30 examples — is that real or noise?
- decide whether a model upgrade should merge when the headline score improves but one high-risk slice regresses
- explain how production traces and user feedback should feed a private eval set without replacing offline evals
- Triggers: `how do we know this prompt change improved things`, `should this be an eval or a unit test`, `the model passes the benchmark but fails in production`, `what should we measure before changing the agent`, `the LLM-as-judge gives different scores each run`, `is this eval delta statistically significant`, `how do we eval a multi-step agent not just the final answer`, `can we upgrade this model safely`, `how should traces become eval cases`

**Not for**
- write unit tests for a deterministic data transformation (use testing-strategy)
- create the exact rubric and hard negatives for this agent eval (outside this skill; construction belongs in task-specific eval artifacts)
- set up production alerting on API error rates (use error-tracking or observability-modeling)
- interpret this scorecard or benchmark result without changing an LLM-system eval loop (use evaluation)

**Related skills**
- Verify with: `evaluation`, `testing-strategy`
- Related: `error-tracking`, `tool-call-flow`, `observability-modeling`, `type-safety`, `evaluation`, `testing-strategy`, `prompt-injection-defense`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: Eval-driven development is to LLM system engineering what crash-test ratings are to automotive safety — you do not ship a car based on how well it parked in your driveway; you ship it after a battery of standardized tests on representative crash scenarios, with the pass-rate against named criteria as the gating signal. A score of 4.3 stars across the suite is the only defensible claim of 'safer'; a developer's intuition that 'the new model feels smarter' is the unmeasured equivalent of 'I drove it home, it seemed fine.' And just as a crash lab that the manufacturer trains its cars to detect stops measuring real safety, an eval the model can recognize as a test stops measuring real behavior.
- Common misconception: |

**Grounding**
- Mode: `universal`
- Truth sources: `https://developers.openai.com/api/docs/guides/evaluation-best-practices`, `https://developers.openai.com/api/reference/resources/evals`, `https://developers.openai.com/api/docs/guides/agent-evals`, `https://developers.openai.com/api/docs/guides/trace-grading`, `https://openai.com/index/openai-to-acquire-promptfoo/`, `https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/`, `https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents`, `https://www.anthropic.com/engineering/eval-awareness-browsecomp`, `https://platform.claude.com/docs/en/test-and-evaluate/develop-tests`, `https://adk.dev/evaluate/`, `https://inspect.aisi.org.uk/`, `https://docs.langchain.com/oss/python/langchain/test/evals`, `https://mlflow.org/docs/latest/genai/eval-monitor/scorers/index.html`, `https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/`, `https://arxiv.org/abs/2406.19314`, `https://arxiv.org/abs/2405.16281`, `https://arxiv.org/abs/2505.23836`, `https://arxiv.org/abs/2605.05835`, `https://arxiv.org/abs/2604.23178`

**Keywords**
- `eval-driven development`, `LLM evals`, `continuous evals`, `evaluation harness`, `agent trajectory eval`, `LLM-as-judge`, `model-graded eval`, `regression budget`, `eval statistical significance`, `model upgrade eval`

<!-- skill-graph-context:end -->
