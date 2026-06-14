---
name: lean-startup
description: "Use when applying Lean Startup methodology to validate a new venture, product, feature, program, or business model under high uncertainty: build-measure-learn loops, minimum viable products, validated learning, riskiest assumptions, actionable metrics, innovation accounting, learning milestones, and pivot/persevere decisions. Covers experiment design and learning discipline before scaling. Do NOT use for generative customer interviews alone (use user-research), synthesizing existing research (use research-synthesis), feature satisfaction classification (use kano-model), OKR goal-setting, product positioning, or quantified option valuation. Do NOT use for Plan interviews to discover what users need before we have a product concept. Do NOT use for Synthesize these interview transcripts into themes and insights. Do NOT use for Classify these roadmap items as must-be, performance, delighter, indifferent, or reverse features. Do NOT use for Turn this strategy into quarterly Objectives and Key Results."
license: MIT
compatibility: "Markdown, product discovery, startup validation, innovation programs, business-model experiments, product strategy memos"
allowed-tools: Read Grep WebSearch WebFetch
metadata:
  subject: reasoning-strategy
  public: "true"
  scope: "Lean Startup validation methodology for teams creating new ventures, products, features, programs, or business models under high uncertainty: state the vision and riskiest assumptions, turn assumptions into testable hypotheses, choose the smallest ethical minimum viable product or experiment that can produce validated learning, define actionable metrics and learning milestones before building, run build-measure-learn loops, use innovation accounting to judge progress, and make pivot/persevere/stop decisions from evidence rather than optimism. Excludes broad generative customer research collection, qualitative research synthesis, generic feature-priority scoring, Kano satisfaction-response classification, OKR execution planning, positioning, and financial expected-value analysis."
  taxonomy_domain: foundations/product-strategy
  stability: experimental
  keywords: "[\"Lean Startup\",\"build-measure-learn\",\"minimum viable product\",\"MVP experiment\",\"validated learning\",\"innovation accounting\",\"pivot or persevere\",\"startup experiment\",\"learning milestone\",\"actionable metrics\"]"
  triggers: "[\"lean-startup\",\"build-measure-learn\",\"minimum-viable-product\",\"mvp-experiment\",\"validated-learning\"]"
  examples: "[\"Use Lean Startup to design an MVP experiment for this product idea.\",\"Turn these startup assumptions into build-measure-learn loops with actionable metrics.\",\"Review this MVP plan and tell me whether it will produce validated learning.\",\"Help us decide whether to pivot or persevere after these experiment results.\",\"Create an innovation accounting plan for validating this new business model.\"]"
  anti_examples: "[\"Plan interviews to discover what users need before we have a product concept.\",\"Synthesize these interview transcripts into themes and insights.\",\"Classify these roadmap items as must-be, performance, delighter, indifferent, or reverse features.\",\"Turn this strategy into quarterly Objectives and Key Results.\",\"Choose the market category and differentiated value for this existing product.\",\"Compute the probability-weighted expected value of these three product bets.\"]"
  relations: "{\"suppresses\":[{\"skill\":\"kano-model\",\"reason\":\"lean-startup owns hypothesis-driven venture/product validation; kano-model owns customer-satisfaction response classification for candidate features\"},{\"skill\":\"okrs\",\"reason\":\"lean-startup owns learning milestones and innovation-accounting evidence under uncertainty; okrs owns measurable execution goals once priorities are chosen\"},{\"skill\":\"positioning\",\"reason\":\"lean-startup owns validation of assumptions and business-model learning; positioning owns market category, alternatives, and differentiated value framing\"},{\"skill\":\"expected-value\",\"reason\":\"lean-startup owns empirical learning loops before scale; expected-value owns probability-weighted option comparison once outcomes and values are modeled\"}],\"related\":[\"user-research\",\"research-synthesis\",\"design-thinking\",\"kano-model\",\"okrs\",\"positioning\",\"expected-value\",\"bayesian-reasoning\",\"epistemic-grounding\",\"prioritization\",\"playing-to-win\"],\"verify_with\":[\"epistemic-grounding\",\"bayesian-reasoning\",\"user-research\"]}"
  grounding: "{\"subject_matter\":\"Lean Startup methodology as a portable validation and innovation-accounting method\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://theleanstartup.com/principles\",\"https://leanstartup.co/about/principles/\",\"https://leanstartup.co/resources/articles/what-is-an-mvp/\",\"skills/reasoning-strategy/lean-startup/references/lean-startup-sources.md\",\"skills/reasoning-strategy/lean-startup/references/upstream-displacement-2026-06-14.md\"],\"failure_modes\":[\"mvp_treated_as_smallest_shippable_product\",\"building_before_naming_learning_question\",\"vanity_metrics_substituted_for_actionable_metrics\",\"learning_threshold_chosen_after_results\",\"experiment_tests_easy_assumption_not_riskiest_assumption\",\"pivot_decision_based_on_opinion_not_evidence\",\"qualitative_research_confused_with_validated_learning\",\"scaling_before_value_or_growth_hypothesis_is_supported\",\"fake_door_or_smoke_test_used_without_ethical_guardrails\",\"innovation_accounting_replaced_by_regular_financial_accounting\",\"build_measure_learn_loop_run_as_build_ship_measure_loop\"],\"evidence_priority\":\"general_knowledge_first\"}"
  mental_model: "Lean Startup treats a new venture, product, feature, program, or business model as a sequence of experiments under extreme uncertainty. The primitives are vision, leap-of-faith assumptions, value hypothesis, growth hypothesis, riskiest assumption, experiment, minimum viable product, build-measure-learn loop, actionable metric, cohort or behavior evidence, learning milestone, innovation accounting, pivot, persevere, and stop decision. The method reduces waste by building only what is needed to test the next important assumption, measuring customer behavior against a pre-declared threshold, and deciding the next loop from validated learning rather than from plan completion."
  purpose: "This skill prevents agents from confusing product progress with learning progress. It forces the answer to name the risky assumption, design the smallest ethical test that can answer it, define evidence and decision thresholds before building, avoid vanity metrics, and explain whether the resulting evidence supports persevering, pivoting, stopping, or running the next experiment."
  concept_boundary: "Lean Startup is for hypothesis-driven validation under uncertainty. It is not generic user-research collection, research synthesis, ordinary agile delivery, feature satisfaction classification, OKR goal-setting, product positioning, financial valuation, or a license to ship low-quality products. Those methods can feed or follow Lean Startup work, but they do not replace the build-measure-learn evidence loop and pivot/persevere decision discipline."
  analogy: "Lean Startup is like instrument flying through fog: each small movement is tied to a gauge reading, and the pilot changes course from evidence rather than from how convincing the original route looked on the map."
  misconception: "The common mistake is thinking MVP means the smallest product a team can ship. In Lean Startup, an MVP is the smallest ethical product experience, prototype, or manual test that can produce validated learning about a specific assumption; if it does not answer the learning question, it is not viable no matter how small it is."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/reasoning-strategy/lean-startup/SKILL.md
  skill_graph_export_description_projection: anti_examples+boundary
  skill_graph_export_description_projection_truncated: "true"
---

## Concept of the skill

**What it is:** Lean Startup is Eric Ries's methodology for creating products and ventures under extreme uncertainty by running disciplined build-measure-learn loops. It treats progress as validated learning about a sustainable business, not as the amount of product shipped.

**Mental model:** Start with a vision, identify the leap-of-faith assumptions that must be true, choose the riskiest assumption, build the smallest ethical experiment that can test it, measure customer behavior with actionable metrics, and decide whether to pivot, persevere, stop, or run the next loop.

**Why it exists:** Teams often spend months building a polished product before discovering that customers do not care. Lean Startup compresses that waste by making the learning question, evidence threshold, and decision rule explicit before the build effort begins.

**What it is NOT:** It is not ordinary agile delivery, generic user interviews, research synthesis, feature prioritization, OKRs, positioning, valuation, or permission to release a careless product.

**Adjacent concepts:** customer development, MVP, concierge test, wizard-of-oz test, smoke test, fake door test, cohort metrics, actionable metrics, innovation accounting, pivot, persevere, value hypothesis, growth hypothesis.

**One-line analogy:** Lean Startup is instrument flying for product uncertainty: move in small loops, read the gauges, and change course from evidence.

**Common misconception:** MVP does not mean "smallest thing we can ship." It means the least effort that can produce validated learning about a specific assumption.

# Lean Startup

## Domain Context

Use Lean Startup when the task involves a new venture, new product, new feature, new business model, innovation program, nonprofit program, or internal initiative where the core uncertainty is whether a customer, user, market, or stakeholder will respond in the expected way. The method is strongest when the team can run small experiments before committing to a full build or scale-up.

Use public, aggregate, or synthetic examples. Do not put personal data, customer identifiers, payment details, private financials, raw interview transcripts, or confidential roadmap details into examples or evals unless the user supplied them and the active task permits that handling.

Lean Startup does not replace judgment. It structures learning. A good output should make clear what is being learned, how evidence will be collected, what threshold will trigger each decision, and why the proposed MVP is the smallest ethical test of the risky assumption.

## Coverage

This skill teaches agents to:

1. Decide whether Lean Startup fits the decision context.
2. Separate vision, strategy, assumptions, experiments, and execution work.
3. Name leap-of-faith assumptions, especially value and growth hypotheses.
4. Select the riskiest assumption rather than the easiest assumption to test.
5. Design MVPs and experiments that produce validated learning, not just demos.
6. Choose experiment types such as concierge tests, wizard-of-oz tests, smoke tests, fake-door tests, landing pages, prototypes, pilots, pre-orders, and manual service tests.
7. Define actionable metrics, cohorts, thresholds, and learning milestones before building.
8. Use innovation accounting to track learning progress under uncertainty.
9. Make pivot, persevere, stop, or next-experiment decisions from evidence.
10. Avoid common failures: vanity metrics, post-hoc success criteria, overbuilt MVPs, unethical deception, and scaling before the value or growth hypothesis is supported.

## Philosophy of the skill

Lean Startup is useful because it changes the unit of progress. In known execution work, progress can often be measured by completing planned output. In a startup-like environment, output can be perfectly executed and still worthless because the underlying assumptions are wrong. The method therefore asks a different question: what did the team learn that reduces uncertainty about a sustainable product or business?

The build-measure-learn loop is not "build something, launch it, inspect analytics later." The loop starts with a learning question. Building is the cost paid to create an observable customer or stakeholder reaction. Measuring is only useful when the metric can change the next decision. Learning is only validated when the evidence tests the hypothesis that mattered before the result was known.

The word "minimum" in MVP is a constraint on waste, not a license for low craft or user harm. A concierge test, wizard-of-oz test, landing page, manual prototype, or pilot can be more valid than a thin software release when it tests the assumption with less build effort. The right MVP is the smallest ethical intervention that can answer the current learning question.

## Workflow

### 1. Decide Whether Lean Startup Fits

Use Lean Startup when the request is about uncertain demand, business-model viability, adoption, behavior change, pricing, channel, retention, or growth before scale.

Do not use it as the primary method when the user needs:

| User need | Better fit |
| --- | --- |
| Discover user problems before a hypothesis exists | `user-research` |
| Turn collected qualitative evidence into themes | `research-synthesis` |
| Classify feature satisfaction response | `kano-model` |
| Set execution goals for a known strategy | `okrs` |
| Choose market category and differentiated value | `positioning` |
| Compare quantified options by probability and payoff | `expected-value` |
| Formulate the full strategy cascade | `playing-to-win` |

If the request lacks a hypothesis, ask for or infer one and label the inference.

```text
Vision or opportunity:
Customer / user / stakeholder:
Current belief:
Value hypothesis:
Growth hypothesis:
Riskiest assumption:
What decision this experiment must inform:
Time / budget / ethical constraints:
```

### 2. Name the Riskiest Assumptions

List the assumptions that must hold for the plan to work. Then pick the one that combines high uncertainty with high consequence.

| Assumption type | Question | Example signal |
| --- | --- | --- |
| Customer / problem | Does the target customer have the problem with enough urgency? | repeated current workaround, budget already spent, active search |
| Value hypothesis | Does the proposed solution create enough value for the customer to act? | signup, pre-order, usage, willingness to switch, paid pilot |
| Growth hypothesis | Can the product reach more customers through a plausible channel or loop? | referral rate, conversion, channel cost, repeatable sales motion |
| Revenue / pricing | Will customers pay enough, soon enough, under realistic terms? | paid intent, deposit, renewal, budget owner confirmation |
| Feasibility / delivery | Can the team deliver the experience at acceptable cost and quality? | manual service cost, cycle time, failure rate, operational bottleneck |
| Risk / compliance | Can the experiment run ethically and legally? | consent, privacy review, reversibility, no material harm |

Do not spend the first experiment on an assumption that is easy to test but not decision-changing.

### 3. Convert the Assumption Into an Experiment

Write the experiment before proposing the build.

```text
Hypothesis:
Why this is the riskiest assumption:
MVP / experiment type:
What will be built or simulated:
Who will experience it:
Metric:
Baseline:
Success threshold:
Failure threshold:
Sample / exposure:
Timebox:
Decision rule: pivot / persevere / stop / next experiment
Ethical guardrails:
```

Choose the MVP form that answers the learning question with the least waste.

| Experiment type | Use when | Guardrail |
| --- | --- | --- |
| Concierge test | You can manually deliver the value to learn if customers want it | Do not mistake manual feasibility for scalable economics |
| Wizard-of-oz test | Users need to experience apparent automation before automation exists | Avoid deception that causes harm, privacy risk, or irreversible decisions |
| Smoke test / landing page | The question is whether people will express demand | Measure committed behavior, not compliments |
| Fake-door test | The question is whether users try to access a proposed feature | Explain unavailability gracefully; avoid trust damage |
| Prototype | The question is comprehension, usability, or perceived value | Do not infer retention or willingness to pay from prototype praise alone |
| Pre-order / deposit | The question is willingness to pay | Make terms clear and refundable when appropriate |
| Pilot | The question is value in a real operating context | Define success before the pilot starts |
| Manual service test | The question is value before software automation | Track delivery cost so feasibility is not hidden |

### 4. Define Actionable Metrics Before Building

Use metrics that can change the next decision. Prefer behavior over opinion and cohorts over aggregates.

| Metric quality | Good signal | Weak signal |
| --- | --- | --- |
| Actionable | tied to a specific hypothesis and decision threshold | interesting but not decision-changing |
| Accessible | understandable to the team and linked to source data | opaque dashboard number |
| Auditable | can be traced to events, cohorts, or records | hand-waved summary |
| Behavior-based | signup, use, payment, referral, repeat action, retention | compliments, survey intent, page views alone |
| Cohort-aware | shows who acted after which exposure | all-time totals that hide decay |

Vanity metrics are not always big numbers. A small number can still be vanity if it cannot change the decision.

### 5. Run the Build-Measure-Learn Loop

Answer in this order:

1. **Learn:** What must be learned next?
2. **Measure:** What observable evidence will decide the question?
3. **Build:** What is the smallest ethical thing needed to create that evidence?
4. **Run:** Expose the right audience under the stated constraints.
5. **Interpret:** Compare results to the pre-declared thresholds.
6. **Decide:** Pivot, persevere, stop, or run the next experiment.

The written answer can still present the loop as build-measure-learn, but the agent should design it backward from learning to measurement to build. This prevents overbuilding.

### 6. Use Innovation Accounting

Regular accounting tells whether an existing business is performing. Innovation accounting tells whether a team is reducing uncertainty in a new business model.

Track:

- assumption being tested
- experiment run
- metric and threshold
- result
- confidence gained or lost
- decision made
- next assumption to test
- cost and time of learning

Use a learning ledger:

| Date | Assumption | Experiment | Metric / threshold | Result | Decision | Next loop |
| --- | --- | --- | --- | --- | --- | --- |
| YYYY-MM-DD | value hypothesis | landing page + interview follow-up | 8% qualified signup, 5 paid deposits | TBD | pivot / persevere / stop | next riskiest assumption |

### 7. Decide Pivot, Persevere, Stop, or Next Experiment

Make the decision from evidence, not from effort already spent.

| Evidence pattern | Decision |
| --- | --- |
| Threshold met, no major ethical or feasibility concern | Persevere and test the next riskiest assumption |
| Partial signal with ambiguity about audience, offer, channel, or metric | Run the next narrower experiment |
| Core assumption fails but a related pattern appears | Pivot by changing customer, problem, solution, channel, revenue model, or growth engine |
| Repeated failed assumptions and no promising adjacent signal | Stop or reset the vision |
| Metric looks good but is vanity, biased, or post-hoc | Do not count as validated learning; redesign the experiment |

Name the pivot type plainly. Do not use "pivot" as a euphemism for continuing without a learning-based change.

## Output Template

```text
Lean Startup validation plan

Decision:
Customer / user:
Vision:
Riskiest assumption:
Hypothesis:
MVP / experiment:
Why this is minimum:
Metric:
Threshold:
Sample / timebox:
Ethical guardrails:
Expected learning:
Decision rule:
Next loop if persevere:
Pivot options if not supported:
```

## Verification

- The plan states the riskiest assumption and why it matters.
- The MVP is tied to a learning question, not just to a smaller release.
- The metric is actionable, behavior-based where possible, and tied to a pre-declared threshold.
- The answer separates value hypothesis, growth hypothesis, and execution work.
- The experiment includes sample, timebox, and decision rule before build effort begins.
- Vanity metrics, compliments, and unsegmented aggregate numbers are not treated as validated learning.
- Ethical guardrails are named for smoke tests, fake-door tests, wizard-of-oz tests, and user-facing experiments.
- Pivot/persevere/stop recommendations cite evidence and avoid sunk-cost reasoning.
- The next loop tests the next riskiest assumption rather than scaling prematurely.

## Do NOT Use When

| Use instead | When |
| --- | --- |
| `user-research` | The user needs generative interviews, contextual inquiry, or field research before a specific venture/product hypothesis exists. |
| `research-synthesis` | The user already has raw qualitative evidence and needs themes, insights, or jobs-to-be-done synthesis. |
| `kano-model` | The user needs to classify feature satisfaction as must-be, performance, attractive, indifferent, reverse, or questionable. |
| `okrs` | The user needs quarterly or cycle-level execution goals after priorities are chosen. |
| `positioning` | The user needs category, alternatives, differentiated value, and best-fit customer framing for an existing product. |
| `expected-value` | The user has quantified outcomes, probabilities, and payoffs and needs probability-weighted comparison. |
| `playing-to-win` | The user needs an integrated strategy cascade: aspiration, where to play, how to win, capabilities, and management systems. |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `reasoning-strategy`
- Public: `true`
- Domain: `foundations/product-strategy`
- Scope: Lean Startup validation methodology for teams creating new ventures, products, features, programs, or business models under high uncertainty: state the vision and riskiest assumptions, turn assumptions into testable hypotheses, choose the smallest ethical minimum viable product or experiment that can produce validated learning, define actionable metrics and learning milestones before building, run build-measure-learn loops, use innovation accounting to judge progress, and make pivot/persevere/stop decisions from evidence rather than optimism. Excludes broad generative customer research collection, qualitative research synthesis, generic feature-priority scoring, Kano satisfaction-response classification, OKR execution planning, positioning, and financial expected-value analysis.

**When to use**
- Use Lean Startup to design an MVP experiment for this product idea.
- Turn these startup assumptions into build-measure-learn loops with actionable metrics.
- Review this MVP plan and tell me whether it will produce validated learning.
- Help us decide whether to pivot or persevere after these experiment results.
- Create an innovation accounting plan for validating this new business model.
- Triggers: `lean-startup`, `build-measure-learn`, `minimum-viable-product`, `mvp-experiment`, `validated-learning`

**Not for**
- Plan interviews to discover what users need before we have a product concept.
- Synthesize these interview transcripts into themes and insights.
- Classify these roadmap items as must-be, performance, delighter, indifferent, or reverse features.
- Turn this strategy into quarterly Objectives and Key Results.
- Choose the market category and differentiated value for this existing product.
- Compute the probability-weighted expected value of these three product bets.
- Owned by `kano-model`: hypothesis-driven venture/product validation
- Owned by `okrs`: learning milestones and innovation-accounting evidence under uncertainty
- Owned by `positioning`: validation of assumptions and business-model learning
- Owned by `expected-value`: empirical learning loops before scale

**Related skills**
- Verify with: `epistemic-grounding`, `bayesian-reasoning`, `user-research`
- Related: `user-research`, `research-synthesis`, `design-thinking`, `kano-model`, `okrs`, `positioning`, `expected-value`, `bayesian-reasoning`, `epistemic-grounding`, `prioritization`, `playing-to-win`

**Concept**
- Mental model: Lean Startup treats a new venture, product, feature, program, or business model as a sequence of experiments under extreme uncertainty. The primitives are vision, leap-of-faith assumptions, value hypothesis, growth hypothesis, riskiest assumption, experiment, minimum viable product, build-measure-learn loop, actionable metric, cohort or behavior evidence, learning milestone, innovation accounting, pivot, persevere, and stop decision. The method reduces waste by building only what is needed to test the next important assumption, measuring customer behavior against a pre-declared threshold, and deciding the next loop from validated learning rather than from plan completion.
- Purpose: This skill prevents agents from confusing product progress with learning progress. It forces the answer to name the risky assumption, design the smallest ethical test that can answer it, define evidence and decision thresholds before building, avoid vanity metrics, and explain whether the resulting evidence supports persevering, pivoting, stopping, or running the next experiment.
- Boundary: Lean Startup is for hypothesis-driven validation under uncertainty. It is not generic user-research collection, research synthesis, ordinary agile delivery, feature satisfaction classification, OKR goal-setting, product positioning, financial valuation, or a license to ship low-quality products. Those methods can feed or follow Lean Startup work, but they do not replace the build-measure-learn evidence loop and pivot/persevere decision discipline.
- Analogy: Lean Startup is like instrument flying through fog: each small movement is tied to a gauge reading, and the pilot changes course from evidence rather than from how convincing the original route looked on the map.
- Common misconception: The common mistake is thinking MVP means the smallest product a team can ship. In Lean Startup, an MVP is the smallest ethical product experience, prototype, or manual test that can produce validated learning about a specific assumption; if it does not answer the learning question, it is not viable no matter how small it is.

**Grounding**
- Mode: `universal`
- Truth sources: `https://theleanstartup.com/principles`, `https://leanstartup.co/about/principles/`, `https://leanstartup.co/resources/articles/what-is-an-mvp/`, `skills/reasoning-strategy/lean-startup/references/lean-startup-sources.md`, `skills/reasoning-strategy/lean-startup/references/upstream-displacement-2026-06-14.md`

**Keywords**
- `Lean Startup`, `build-measure-learn`, `minimum viable product`, `MVP experiment`, `validated learning`, `innovation accounting`, `pivot or persevere`, `startup experiment`, `learning milestone`, `actionable metrics`

<!-- skill-graph-context:end -->
