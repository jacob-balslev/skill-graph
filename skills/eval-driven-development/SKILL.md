---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: eval-driven-development
description: "Use when reasoning about building language-model-integrated systems by writing evaluations before and alongside the system: the statistical (not binary) nature of LLM evals, the five primitives (dataset, evaluation function, aggregation, iteration loop, regression budget), the judgment-mechanism taxonomy (programmatic, model-graded, human-graded, preference comparison), the difference between system-specific evals and canonical benchmarks (MMLU, HumanEval, BIG-bench, GAIA), how evals drive prompt/model/scaffolding/tooling changes, why Goodhart's Law means higher eval scores are not always improvements, and the offline-eval-vs-production-telemetry distinction. Do NOT use for deterministic unit testing (use testing-strategy), production monitoring (use evaluation or error-tracking), general-software TDD (use testing-strategy), or the construction of individual eval rubrics and task sets (use agent-eval-design — it owns construction; this skill owns the iteration discipline)."
version: 1.0.0
type: capability
category: agent
domain: agent/evaluation
scope: reference
owner: skill-graph-maintainer
freshness: "2026-05-16"
drift_check:
  last_verified: "2026-05-16"
eval_artifacts: planned
eval_state: unverified
routing_eval: absent
comprehension_state: present
stability: experimental
license: MIT
allowed-tools: Read Grep
keywords:
  - eval-driven development
  - LLM evals
  - evaluation harness
  - benchmark
  - HumanEval
  - MMLU
  - BIG-bench
  - GAIA
  - LLM-as-judge
  - model-graded eval
  - pass rate
  - regression budget
  - Goodhart's law
  - golden dataset
  - reference-free eval
triggers:
  - "how do we know this prompt change improved things"
  - "should this be an eval or a unit test"
  - "the model passes the benchmark but fails in production"
  - "what should we measure"
  - "the LLM-as-judge gives different scores each run"
examples:
  - "design an offline eval suite for an LLM-integrated summarization feature before writing the prompt"
  - "decide between programmatic grading, model-graded judgment, and human review for a freeform-output eval"
  - "explain why MMLU score is a poor predictor of a domain-specific assistant's quality"
  - "structure an iteration loop where each prompt change is gated by a regression budget"
anti_examples:
  - "write unit tests for a deterministic data transformation (use testing-strategy)"
  - "set up production alerting on API error rates (use observability)"
  - "interpret a specific benchmark's leaderboard (use benchmarking-engine)"
relations:
  related:
    - tool-call-flow
    - prompt-injection-defense
    - testing-strategy
    - type-safety
    - agent-eval-design
    - evaluation
  boundary:
    - skill: testing-strategy
      reason: "testing-strategy owns deterministic-software testing where every run is binary pass/fail; this skill owns LLM evaluation where every run is a sample from a distribution and pass-rate is the unit of judgment. The disciplines share vocabulary (suite, gate, regression) but the math underneath differs."
    - skill: tool-call-flow
      reason: "tool-call-flow owns the protocol cycle by which a model invokes tools; this skill owns the discipline of measuring whether that cycle produces correct behavior. Tool-call evals are a specialization of the general pattern."
    - skill: prompt-injection-defense
      reason: "prompt-injection-defense owns the security property; this skill owns the measurement of whether the property holds. Red-team evals against an injection corpus are one application of eval-driven-development."
    - skill: agent-eval-design
      reason: "agent-eval-design owns the construction of evals — task sets, rubrics, graders, hard negatives, traces; this skill owns the development discipline that uses constructed evals to gate every change to prompt, model, retrieval, scaffolding, or tooling. The two compose: agent-eval-design produces the suite; this skill applies it."
    - skill: type-safety
      reason: "type-safety owns the compile-time property of programs; this skill owns the runtime-distributional property of LLM outputs. They are both validate-at-the-boundary disciplines with different threat models."
  verify_with:
    - testing-strategy
    - agent-eval-design
concept:
  definition: "Eval-driven development is the practice of building language-model-integrated systems by writing evaluations before and alongside the system, where each evaluation defines a behavioral criterion the system must satisfy on a representative input set, and the suite's aggregated pass-rate signal gates every change to the prompt, model, retrieval, scaffolding, or tooling. Evals are the LLM analog of automated tests for deterministic software with one fundamental difference: LLM evals are statistical (pass-rate over a sampled population) rather than binary (pass/fail per run), because the system under test is itself stochastic. The discipline is the rigorous separation of generation (what the system produces) from judgment (how it is scored) with explicit accounting for the uncertainty in both."
  mental_model: |
    Five primitives structure eval-driven development:

    1. **Eval dataset** — a finite, curated set of input examples that represents the target distribution of inputs the system will face in production. Each example carries the input itself plus any reference outputs, gold labels, rubric criteria, or comparison baselines the grader will consume. The dataset is the empirical ground; without a defined dataset, "the eval passed" has no meaning.

    2. **Evaluation function** — the per-example judgment that produces a score from the system's output (and, in graded evals, from any reference data). Three judgment mechanisms: programmatic (a deterministic function: exact-match, regex, JSON-Schema-validity, code-execution-correctness, contains-substring), model-graded (a separate LLM call asked to score the output against a rubric), and human-graded (a person scores the output). Each mechanism trades off cost, scale, consistency, and the validity of what it actually measures.

    3. **Aggregation** — the statistical summary across the dataset that turns per-example scores into a system-level signal. Pass-rate (fraction of examples scoring above threshold) is the simplest; more sophisticated aggregations stratify by input type, weight by importance, or report distributions instead of point estimates. Confidence intervals matter: on a 50-example dataset, a 4-percentage-point pass-rate change is not signal.

    4. **Iteration loop** — the development cycle in which evals gate every change. Run the eval; diagnose the failing examples; identify the change to prompt, model, retrieval, scaffolding, or tooling; re-run the eval; check that pass-rate improved without regressing other criteria. The loop's discipline is keeping the eval suite stable while the system changes — flipping the suite and the system in the same iteration removes the comparison anchor.

    5. **Regression budget** — the policy that defines what magnitude of pass-rate change in either direction counts as significant. Some metrics are gating (any regression is unacceptable; e.g., a safety eval must not regress at all). Some are optimizing (improvement is desired, small regressions are acceptable). Some are watchful (track the metric, do not gate on it). Without explicit budgets, every eval becomes either a gate or a footnote, and the development loop loses calibration.

    The deep insight is that LLM evals are not unit tests with extra noise. They are measurement instruments for a stochastic system, and the discipline is the same as any empirical science: define what you are measuring, choose an instrument appropriate to it, account for the instrument's bias and variance, and report results with uncertainty. A team that treats evals as "tests that sometimes flake" will eventually be wrong about whether their system is improving; a team that treats them as measurement instruments will know what they know and what they don't.

    The complementary insight is that *no benchmark is a substitute for a system-specific eval*. Public benchmarks (MMLU for general knowledge, HumanEval for code, BIG-bench for the long tail, GAIA for general assistants) measure the general capability of a model in a controlled setting; they predict performance on the exact tasks they contain. A domain-specific assistant — for medical records, for a particular API surface, for a niche user population — needs evals constructed from that domain's input distribution. The benchmark and the system-specific eval are complementary, not interchangeable.
  purpose: |
    Eval-driven development exists because LLM-integrated systems have three properties that make conventional testing approaches insufficient.

    **Behavior is statistical.** The same input run twice may produce different outputs. A single passing run is not evidence that the system works; a single failing run is not evidence that it's broken. The unit of evidence is the pass-rate over a sample, and the sample size determines the precision of the measurement. Conventional tests assume determinism; LLM evals require sample sizes large enough for the noise floor to be smaller than the changes you want to detect.

    **The behavior space is open-ended.** A function that takes a number and returns a number has a closed input/output space — every possible input has one correct output, and finite tests can cover the input space's significant cases. An LLM-integrated summarization, classification, or assistant feature has open inputs (any natural-language text the user might type) and open outputs (any natural-language response). The set of "correct" behaviors is itself an empirical question, not a deductive one. Evals scope the open space to a representative sample and judge that sample.

    **Manual review doesn't scale.** A pre-eval-driven approach to LLM development is read-the-output: developer changes the prompt, runs a handful of examples, eyeballs the results, and decides if it's better. This works at the dozen-example scale and fails at the hundred-example scale. A prompt change that improves output on the 5 examples the developer notices may regress output on the 50 they didn't. Eval-driven development is the discipline of looking at all 50 every iteration, automatically, with a defined grader, so the developer's attention is freed for the cases that actually need human judgment.

    The deeper reason eval-driven matters is that it forces the team to make their behavioral expectations explicit. A team that writes evals must say what "good" means in code (or in a rubric the model-grader applies); a team that does not write evals carries the definition in their head, which means different team members have different definitions, which means the system drifts toward whatever the loudest voice in the room argued for. The eval suite is the team's shared, version-controlled, queryable definition of what the system is for.

    Eval-driven development is also the discipline that makes model upgrades safe. When a new model is released, the question "is it better for our system" has no general answer — the new model may improve on some criteria and regress on others. With an eval suite, the question is empirical: run both models on the suite, compare per-criterion pass-rates, decide based on the criteria's regression budgets. Without an eval suite, the team upgrades on vibes, regrets it three weeks later when a user reports a regression, and rolls back without certainty about what they actually changed.
  boundary: |
    **Evals are not unit tests.** Unit tests are binary: a single run passes or fails, and the system is either deterministic enough that flakes are bugs, or non-deterministic in a way that the test design must account for explicitly. Evals are distributional: a single example's score is a sample from the system's output distribution, and the pass-rate aggregates samples. Treating an eval like a unit test ("the eval passed once, ship it") produces false confidence; treating a unit test like an eval ("we passed 90% of the time, that's fine") produces false tolerance. The two disciplines have different math underneath the same vocabulary.

    **Evals are not benchmarks.** A benchmark is a canonical, static, public dataset built by an external party to compare models against a shared standard (MMLU for general knowledge across 57 subjects; HumanEval for code generation; BIG-bench for the long tail of NLP capabilities; GAIA for general-assistant tasks). The benchmark is constructed once and used by everyone; its value is comparability across systems. A system-specific eval is constructed for one application by its developers; its value is fidelity to that application's actual input distribution. Benchmarks predict cross-system capability; system-specific evals predict in-system quality. A team that confuses them ships systems that ace the benchmark and fail in production.

    **Evals are not production monitoring.** Production telemetry is online — it observes what the system actually does on real user inputs, with all the variance and adversarial behavior of production. Evals are offline — they run on a curated dataset before deployment, with controlled inputs and reproducible grading. Both are essential and they answer different questions: evals answer "should I ship this change," monitoring answers "is the shipped system still healthy." Conflating them produces either over-cautious deployment (every production hiccup blocks rollout) or under-cautious deployment (no offline gating at all because "we'll catch it in monitoring").

    **Higher eval scores are not always better.** Goodhart's Law applies sharply to LLM evals: "when a measure becomes a target, it ceases to be a good measure." A prompt change that improves the eval pass-rate by 8 points may have done so by over-fitting to the eval dataset's quirks, or by adopting a verbose style the grader rewards, or by gaming a specific phrasing the test cases share. The signal of true improvement is *across-dataset transfer*: pass-rates on held-out evaluation, on production-sampled data, and on human review all move together. An eval that improves but human review disagrees with is a broken eval.

    **Model-graded evals are not free.** Using an LLM to grade another LLM's output is the only scalable mechanism for many open-output evaluations, and it is also a source of correlated error. The grader and the system may share biases, fail in the same conditions, or rate each other's outputs higher than human raters would. A model-graded eval suite that has not been calibrated against human review on a sample is measuring something other than what it claims. The discipline is to periodically validate the grader against humans and adjust both prompts and grading criteria.

    **An eval pass is not a guarantee.** A system that passes the eval at 95% pass-rate will still produce wrong outputs on 5% of inputs from the eval's distribution, and on potentially more inputs from distributions the eval didn't sample. Eval-driven development reduces uncertainty; it does not eliminate it. Production gating, human-in-the-loop fallbacks, monitoring, and post-deployment feedback loops are all part of the broader system reliability story — evals are necessary, not sufficient.

    **Evals do not measure correctness; they measure agreement with the rubric.** Every eval encodes a definition of "good" in its grader. A model-graded eval whose rubric is "the summary is fluent and detailed" rewards a different system than one whose rubric is "the summary is faithful to the source and excludes unsupported claims." Both rubrics are reasonable; they measure different things. Iterating on the rubric is part of iterating on the system, and a rubric change must be tracked and explained the same way a system change is.
  taxonomy: |
    By judgment mechanism:
    - **Programmatic grading** — a deterministic function maps output to score. Examples: exact-match against a reference, regex match, JSON-Schema validation, code-execution correctness (run the generated code, check the test suite), contains-substring, numeric tolerance. Highest consistency, lowest cost, narrowest applicability (works only when correctness is mechanically checkable).
    - **Model-graded** — a separate LLM call grades the system's output against a rubric. Examples: pairwise preference comparison (which of two outputs is better against a rubric), single-output rubric scoring, multi-criterion grids. Highest scalability for open-output tasks, sensitivity to grader-model selection and prompt design.
    - **Human-graded** — a person grades the output. Highest validity for ambiguous criteria, lowest scalability, essential for calibrating model-graders. Inter-rater agreement must be measured and reported; one rater's judgments are not "what humans think."
    - **Hybrid** — programmatic checks gate first, model-graded for the remaining open criteria, human-graded for a sampled subset to calibrate the model-grader. Standard production setup.

    By what is being evaluated:
    - **Single-turn output** — given an input, score the system's response. The simplest case.
    - **Multi-turn trajectory** — given a conversation or session, score the trajectory as a whole. Aggregates per-turn outputs and overall task success.
    - **Tool-use behavior** — score whether the system called the right tools with the right arguments in the right order. Specializations of tool-call-flow correctness.
    - **Safety / refusal behavior** — score whether the system correctly refuses disallowed inputs or correctly handles policy-relevant content. Requires adversarial datasets (red-team prompts, prompt-injection corpora).
    - **Robustness** — score performance under input perturbation (typos, paraphrase, irrelevant context, adversarial suffixes). Reveals brittle systems.
    - **Latency / cost** — measure non-quality dimensions that gate production deployment.

    By source of truth:
    - **Gold-standard reference** — every example has a defined "correct" output and the grader compares against it.
    - **Reference-free** — the grader applies a rubric to the output without a reference; suited to open-output tasks where there is no single right answer.
    - **Preference comparison** — two systems' outputs are scored relative to each other (A is better, B is better, or tie); produces a head-to-head signal.
    - **Property checks** — the grader asks "does this output have property X" without specifying what the output should be (e.g., "does this summary mention every named entity in the source").

    By eval purpose in the lifecycle:
    - **Acceptance eval** — runs once before initial deployment; gates the go/no-go.
    - **Regression eval** — runs on every change; gates merges or deploys.
    - **Calibration eval** — runs periodically to validate model-graders against human review.
    - **Red-team eval** — runs on adversarial inputs to test safety, injection, and edge-case handling.
    - **Cross-model eval** — runs on multiple models to support routing or upgrade decisions.

    By canonical public benchmarks (cited for grounding, not for system-specific use):
    - **MMLU** (Hendrycks et al., 2021) — 57 subjects of general knowledge multiple-choice questions; tests breadth of knowledge.
    - **HumanEval** (Chen et al., 2021) — 164 programming problems; tests code-generation correctness via test-suite execution.
    - **BIG-bench** (Srivastava et al., 2022) — 200+ tasks across the long tail of NLP capabilities.
    - **GAIA** (Mialon et al., 2023) — general AI assistant tasks; tests multi-step reasoning with tool use.
    - **MT-Bench / Chatbot Arena** (Zheng et al., 2023) — pairwise preference comparison for chat assistants.
    - **Inspect AI / METR / UK AISI evals** — open-source frameworks for safety and capability evaluation.
  analogy: |
    Wind tunnel testing for aerodynamics. An aerospace team designing a new airframe does not ship the airplane based on intuition and rollback if it crashes. They build a model, test it in a wind tunnel under conditions that approximate flight, measure lift and drag across a range of speeds and angles of attack, and use the measurements to gate every design change. The wind tunnel is not flight — flight has weather, turbulence, pilot error, manufacturing variance — but the wind tunnel is the controlled measurement environment without which design progress would be guesswork.

    The eval suite is the wind tunnel. The dataset is the range of test conditions. The grader is the instrumentation. The pass-rate is the aerodynamic measurement. The iteration loop is the design cycle. Just as aerospace engineers know not to over-fit airfoil shapes to the specific wind tunnel they tested in (a shape that performs brilliantly in one tunnel may perform differently in another), eval-driven developers know not to over-fit prompts to specific eval datasets — Goodhart's Law is the LLM equivalent of the wind-tunnel-fit problem.

    A team that ships LLM systems without evals is shipping airplanes based on how good the model feels at the desk. Some of them fly. The ones that don't crash with the developer's pet examples still working perfectly, because those examples weren't a representative sample of the flight envelope.

    Production monitoring, in this analogy, is the in-service inspection regime — measuring fatigue, vibration, anomaly events on aircraft in operation. It catches what the wind tunnel missed. It does not replace the wind tunnel; it complements it.

    The benchmarks (MMLU, HumanEval) are standardized wind-tunnel test profiles published by industry bodies. An airframe that performs well on the standard profiles tells you something — the model has general aerodynamic competence. It does not tell you whether it will perform well on the specific mission your customer's flying.
  misconception: |
    The most common misconception is that **evals are tests with a 95% threshold**. They are not. A test asserts a specific behavior of a deterministic component; the assertion either holds or it doesn't, and a failing test indicates a bug. An eval samples the output distribution of a stochastic system; the pass-rate is a measurement, and the question is not "did it pass" but "is the new pass-rate significantly different from the old, and in the right direction." Conflating the disciplines causes teams to either over-react to single failures (treating an eval like a test that just broke) or under-react to drift (treating an eval like a test that's "mostly passing").

    The second misconception is that **public benchmarks predict system-specific quality**. They do not, except weakly. A model that scores high on MMLU has broad general knowledge; it may or may not be good at the specific summarization task, the specific domain language, or the specific user population your system serves. The right use of public benchmarks is as cross-system comparability — "this new model is generally stronger than the previous one in our class of capabilities" — paired with system-specific evals as the actual gating decision.

    The third misconception is that **LLM-as-judge eliminates the need for human evaluation**. It does not. Model-graders share biases with the systems they grade (verbosity bias, position bias in pairwise comparisons, calibration to the grader's training distribution). A model-graded eval that has not been calibrated against human review is measuring an unknown quantity. The discipline is to periodically sample 50-100 outputs, have humans grade them under the same rubric, and check that the model-grader's scores correlate with the human grades. When they diverge, the rubric or the grader prompt needs revision.

    The fourth misconception is that **higher eval scores are always improvements**. Goodhart's Law applies here with particular force: the eval is a proxy for quality, and any optimization process pulled hard enough toward the proxy will drift away from the underlying quality. The signal of real improvement is transfer: pass-rate improvements on the eval correlate with improvements on held-out data, on production samples, and on human review. An eval that improves while human review disagrees is a Goodhart failure — the system has learned to game the grader, not to be better.

    The fifth misconception is that **production telemetry replaces offline evals**. It does not. Production telemetry measures what happens; offline evals gate what gets deployed. A team that relies only on production monitoring discovers regressions by shipping them; a team that relies only on offline evals misses the production-specific failure modes that the offline dataset didn't sample. Both layers are necessary, and they answer different questions.

    The sixth misconception is that **adding more examples improves the eval**. Diminishing returns set in: the marginal example provides less signal as the dataset grows, and beyond some size the maintenance cost exceeds the precision gain. The right dataset size depends on the precision needed (detecting a 3-point change requires more examples than detecting a 10-point change) and on the breadth of the input space (broader inputs need more examples to sample). 50-500 examples per criterion is the common range; thousands are required only for the highest-precision metrics.

    The seventh misconception is that **evals can be written after the system is built**. They can be, but the team has already lost the discipline's main benefit. Writing evals first forces the team to define what "good" means before they can be tempted to redefine it to match what the system produces. Evals written after the system are anchored to the system's behavior; evals written before are anchored to the requirements.

    The eighth misconception is that **a 90% pass-rate is shippable**. The shipping threshold is a product decision, not a generic rule. For a casual chat assistant, 90% may be fine; for a medical-records assistant, 90% is catastrophic. The threshold depends on what the 10% looks like (silent low-impact errors vs. loud high-impact errors), how it's caught downstream (human review vs. unchecked deployment), and the user's tolerance for failure. The pass-rate is one input; the ship/no-ship decision integrates it with consequence analysis.
---

# Eval-Driven Development

## Coverage

The practice of building language-model-integrated systems by writing evaluations before and alongside the system, and using the eval suite's aggregated pass-rate signal to gate every change. Covers the statistical (not binary) nature of LLM evaluation, the five primitives (dataset, evaluation function, aggregation, iteration loop, regression budget), the judgment-mechanism taxonomy (programmatic / model-graded / human-graded / hybrid), the distinction between system-specific evals and canonical public benchmarks (MMLU, HumanEval, BIG-bench, GAIA, MT-Bench), why higher scores are not always improvements (Goodhart's Law), the difference between offline evals and production telemetry, and the eval-lifecycle archetypes (acceptance, regression, calibration, red-team, cross-model).

## Philosophy

Building LLM-integrated systems without evals is shipping airplanes based on how good the model feels at the desk. The system's behavior is stochastic, the input space is open-ended, and the developer's pet examples are not a representative sample of what users will throw at it. An eval suite is the empirical measurement instrument that lets a team distinguish "the new prompt works better" from "the new prompt works better on the five examples I happened to try."

The discipline's hard part is not writing evals. It is choosing what to measure, encoding the choice into a grader the team agrees with, sampling a dataset that represents production, and resisting the gravitational pull of Goodhart's Law as the eval suite becomes the optimization target. Teams that get this right ship systems whose quality matches their team's stated definition of "good." Teams that get this wrong ship systems that ace evals and disappoint users.

Eval-driven development is not test-driven development with extra noise. It is empirical engineering applied to systems whose behavior is a distribution rather than a value. The vocabulary overlaps; the math underneath does not.

## The Five Primitives In Practice

| Primitive | What it is | Common encoding | Failure mode if neglected |
|---|---|---|---|
| Eval dataset | Curated input examples that represent production | JSONL of `{input, reference}` records; checked into version control | "It works for me" with no shared evidence |
| Evaluation function | Per-example grader producing a score | Python function, model-graded prompt template, or human-review UI | Implicit, undocumented definition of "good" |
| Aggregation | Statistical summary across the dataset | Pass-rate, weighted pass-rate, stratified pass-rate, distribution | Headline number obscures pattern of failure |
| Iteration loop | Eval → diagnose → change → eval | CI-integrated pipeline; eval results in PR comment | Changes ship without measurement |
| Regression budget | Defined acceptable change per metric | Per-eval policy: "must not regress" / "improvement gates merge" / "watchful" | Every change becomes a debate about the headline number |

## Judgment Mechanism Selection

| Mechanism | Best for | Cost per example | Reliability | Watch for |
|---|---|---|---|---|
| Programmatic | Outputs with mechanical correctness (code, JSON validity, exact match) | $0 | Deterministic | Narrow applicability — won't work for freeform output |
| Model-graded | Open-output tasks at scale (summarization, classification, freeform Q&A) | $0.001-$0.10 per grade depending on model | Correlated error with the system being graded | Verbosity bias, position bias in pairwise; calibrate against humans |
| Human-graded | Subjective criteria, calibration runs, ambiguous outputs | $1-$50 per grade depending on annotator | Highest validity; lowest scale | Inter-rater agreement must be measured; one rater is not "humans think" |
| Hybrid | Production systems | Mixed | Mixed | Standard setup: programmatic gates, model-graded scales, human samples calibrate |

A practical default: programmatic checks for the parts you can mechanically verify, model-graded for the open parts, periodic human review to calibrate.

## Iteration Loop Discipline

The eval-driven iteration loop is the development cycle. Run the suite, diagnose failures, identify the change, re-run, gate the change on regression budget.

```
┌─────────┐    ┌──────────┐    ┌──────────────┐    ┌──────────┐
│ Eval    │ -> │ Diagnose │ -> │ Change       │ -> │ Re-run   │
│ baseline│    │ failures │    │ (prompt,     │    │ Eval     │
│         │    │          │    │  model,      │    │          │
│         │    │          │    │  retrieval,  │    │          │
│         │    │          │    │  tooling)    │    │          │
└─────────┘    └──────────┘    └──────────────┘    └──────────┘
                                                          │
                                                          v
                                                ┌──────────────────┐
                                                │ Compare against  │
                                                │ regression budget│
                                                │ Merge / iterate  │
                                                └──────────────────┘
```

The discipline is keeping the suite stable while the system changes. If both move in the same iteration, the comparison anchor is gone and the team is doing parallel experiments.

## Public Benchmarks — Cited For Grounding, Not For Gating

Benchmarks measure cross-system capability against a shared standard. They predict how a model will do on the *exact* tasks the benchmark contains. They do not predict how your specific system, on your specific user inputs, with your specific prompts and retrieval, will perform.

| Benchmark | Measures | Cited for |
|---|---|---|
| MMLU (Hendrycks et al., 2021) | 57 subjects of multiple-choice general knowledge | Breadth of general capability |
| HumanEval (Chen et al., 2021) | 164 programming problems graded by test execution | Code-generation correctness baseline |
| BIG-bench (Srivastava et al., 2022) | 200+ tasks across the long tail of NLP | Breadth of niche capabilities |
| GAIA (Mialon et al., 2023) | General-assistant multi-step tasks with tool use | Realistic agentic-task baseline |
| MT-Bench / Chatbot Arena (Zheng et al., 2023) | Pairwise preference comparison for chat | Human-aligned preference signal |

The right use: pick a model partly on benchmark performance, then build system-specific evals to gate the actual deployment.

## Goodhart's Law In Eval Practice

When the eval becomes the optimization target, the eval ceases to be a good measure. Symptoms:

- Pass-rate climbs while human reviewers' confidence in the system flattens or declines.
- Prompt changes produce phrasings the grader rewards but users dislike (e.g., verbose hedging that scores well on rubric, reads poorly on screen).
- The system memorizes patterns specific to the eval dataset (over-fitting to test cases).
- A held-out evaluation set, scored fresh, shows worse pass-rate than the development set.

Defenses:

- **Hold out a portion of the dataset from active iteration.** Score it periodically; if held-out and development pass-rates diverge, the iteration is over-fitting.
- **Periodically refresh the eval dataset.** Replace some examples with new production-sampled inputs to prevent the dataset from going stale.
- **Calibrate model-graders against humans.** A grader that has drifted from human judgment can produce high pass-rates on outputs humans dislike.
- **Track multiple criteria.** A single headline number is easier to over-fit than a panel of independent measures.

## What This Skill Is Not

This skill is the *concept* of eval-driven development. Specific topics with their own scope:
- The mechanics of running evals in CI/CD pipelines belong to a tooling skill.
- The construction of individual eval rubrics, task sets, graders, and hard negatives belongs to `agent-eval-design`.
- The deterministic testing of non-LLM code belongs to `testing-strategy`.
- The production monitoring of running systems belongs to observability and reliability skills.
- The obra/superpowers `test-driven-development` skill (on skills.sh) is a process-shape workflow skill for general software TDD; this one is the concept-shape complement for the LLM-specific evaluation discipline.

## Verification

After applying this skill, verify:
- [ ] An eval dataset exists, is checked into version control, and is representative of the system's actual production input distribution.
- [ ] Each eval criterion has a defined judgment mechanism (programmatic, model-graded, or human-graded), and the mechanism's known biases are accounted for.
- [ ] Aggregation reports pass-rate with sample size and either a confidence interval or a defined minimum-detectable-change threshold.
- [ ] Each eval has an explicit regression budget: gating (no regression allowed), optimizing (improvement gates merge), or watchful (tracked, not gated).
- [ ] Model-graded evals have been calibrated against human review on a sample within the past quarter (or whatever cadence the team has agreed to).
- [ ] A held-out portion of the dataset is reserved from active iteration and scored periodically to detect over-fitting.
- [ ] The eval suite is integrated into the change workflow — prompt changes, model upgrades, retrieval changes, and tooling changes are all gated by the suite.
- [ ] Public benchmarks (MMLU, HumanEval, etc.) are cited for model-selection grounding but are not the gating decision for system-specific quality.
- [ ] Production telemetry exists separately from the offline eval suite; one is not used as a substitute for the other.
- [ ] The shipping threshold is a product decision documented somewhere, not an emergent average across team opinion.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Writing deterministic unit tests for non-LLM code | `testing-strategy` | testing-strategy owns binary pass/fail testing; this skill owns distributional measurement |
| Designing individual eval rubrics, task sets, graders, hard negatives | `agent-eval-design` | agent-eval-design owns eval construction; this skill owns the iteration discipline that uses constructed evals |
| Setting up production monitoring, alerting, or telemetry | `evaluation` (general framing) or `error-tracking` | those own runtime measurement of deployed systems; this skill owns offline pre-deployment measurement |
| Reasoning about the protocol cycle of tool calls | `tool-call-flow` | tool-call-flow owns the cycle; eval-driven development can measure tool-call correctness as one criterion |
| Defending against prompt injection | `prompt-injection-defense` | prompt-injection-defense owns the security property; this skill can measure whether the defense holds |
| General software TDD process | the obra/superpowers `test-driven-development` skill or `testing-strategy` | TDD is process-shape for general software; this skill is concept-shape for the LLM-specific evaluation discipline |

## Key Sources

- Hendrycks, D., Burns, C., Basart, S., Zou, A., Mazeika, M., Song, D., & Steinhardt, J. (2021). ["Measuring Massive Multitask Language Understanding"](https://arxiv.org/abs/2009.03300). The MMLU benchmark paper; foundational reference for cross-system general-knowledge evaluation.
- Chen, M., Tworek, J., Jun, H., Yuan, Q., et al. (2021). ["Evaluating Large Language Models Trained on Code"](https://arxiv.org/abs/2107.03374). The HumanEval benchmark paper; foundational for code-generation evaluation.
- Srivastava, A., et al. (2022). ["Beyond the Imitation Game: Quantifying and extrapolating the capabilities of language models"](https://arxiv.org/abs/2206.04615). The BIG-bench paper; canonical reference for breadth-of-capability evaluation across 200+ tasks.
- Mialon, G., Fourrier, C., Swift, C., Wolf, T., LeCun, Y., & Scialom, T. (2023). ["GAIA: A Benchmark for General AI Assistants"](https://arxiv.org/abs/2311.12983). The GAIA benchmark paper; canonical reference for evaluating multi-step assistant tasks with tool use.
- Zheng, L., Chiang, W.-L., et al. (2023). ["Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena"](https://arxiv.org/abs/2306.05685). The MT-Bench paper; canonical reference for LLM-as-judge methodology, including known biases.
- OpenAI. [Evals framework on GitHub](https://github.com/openai/evals). Open-source framework for writing and running LLM evals; documents the practical mechanics of the discipline.
- Anthropic. [Building evals — Anthropic Cookbook](https://github.com/anthropics/anthropic-cookbook/tree/main/skills/classification) and [Evaluation guide](https://docs.anthropic.com/en/docs/test-and-evaluate/develop-tests). Practitioner-oriented guidance on building eval suites.
- UK AI Safety Institute. [Inspect: An open-source evaluation framework](https://inspect.ai-safety-institute.org.uk/). Open framework purpose-built for capability and safety evaluations of LLMs.
- Goodhart, C. (1975). "Problems of Monetary Management: The U.K. Experience." The origin of Goodhart's Law as commonly cited; "when a measure becomes a target, it ceases to be a good measure."
- Liang, P., et al. (2022). ["Holistic Evaluation of Language Models"](https://arxiv.org/abs/2211.09110). The HELM framework paper; argues for multi-metric eval across many dimensions as a counter to single-metric Goodharting.
