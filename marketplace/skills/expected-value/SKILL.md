---
name: expected-value
description: "Use when choosing among actions under quantified uncertainty by enumerating outcomes, assigning probabilities, valuing each outcome in one shared unit, computing probability-weighted value, testing sensitivity, and checking downside constraints before recommending. Covers expected value, expected utility, expected monetary value, payoff tables, break-even probability, value of information, and risk-of-ruin constraints. Do NOT use for updating probabilities from evidence (use bayesian-reasoning), broad mixed-criteria backlog ranking (use prioritization), or tracing consequences before outcomes are modeled (use second-order-thinking). Do NOT use for Update these probabilities after new customer evidence. Do NOT use for Prioritize this backlog with RICE using reach, impact, confidence, and effort. Do NOT use for Trace the second- and third-order consequences before we model outcomes."
license: MIT
compatibility: "Markdown, decision memos, strategy analysis, product bets, risk tradeoffs"
allowed-tools: Read Grep
metadata:
  relations: "{\"related\":[\"evaluation\",\"bayesian-reasoning\",\"second-order-thinking\",\"prioritization\",\"constraint-awareness\"],\"suppresses\":[\"bayesian-reasoning\",\"second-order-thinking\"],\"verify_with\":[\"constraint-awareness\",\"methodical\",\"epistemic-grounding\"]}"
  subject: reasoning-strategy
  public: "true"
  scope: "Use when choosing among actions under quantified uncertainty by enumerating outcomes, assigning probabilities, valuing each outcome in one shared unit, computing probability-weighted value, testing sensitivity, and checking downside constraints before recommending. Covers expected value, expected utility, expected monetary value, payoff tables, break-even probability, value of information, and risk-of-ruin constraints. Do NOT use for updating probabilities from evidence (use bayesian-reasoning), broad mixed-criteria backlog ranking (use prioritization), or tracing consequences before outcomes are modeled (use second-order-thinking)."
  taxonomy_domain: foundations/decision-quality
  stability: stable
  keywords: "[\"expected value\",\"three options\",\"recommend one\",\"expected utility\",\"expected monetary value\",\"probability weighted\",\"probabilities and payoffs\",\"outcome probability\",\"downside constraints\",\"break-even probability\"]"
  triggers: "[\"expected-value\",\"probability-weighted-decision\",\"ev-decision\"]"
  examples: "[\"Calculate the expected value of these three options and recommend one.\",\"This experiment has outcome probabilities and payoffs; calculate expected value and decide whether to run it.\",\"Find the break-even probability for this product bet.\",\"The expected value is positive but the downside is severe; how should we decide?\"]"
  anti_examples: "[\"Update these probabilities after new customer evidence.\",\"Prioritize this backlog with RICE using reach, impact, confidence, and effort.\",\"Trace the second- and third-order consequences before we model outcomes.\"]"
  grounding: "{\"subject_matter\":\"Expected value as a portable probability-weighted decision method\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://plato.stanford.edu/entries/rationality-normative-utility/\",\"https://plato.stanford.edu/entries/decision-theory/\",\"skills/reasoning-strategy/expected-value/references/expected-value-sources.md\",\"skills/reasoning-strategy/expected-value/references/upstream-displacement-2026-05-27.md\"],\"failure_modes\":[\"probability_sum_error\",\"mixing_units_across_outcomes\",\"payoff_without_cost\",\"average_case_hides_ruin\",\"fake_precision\",\"ignoring_sensitivity\",\"treating_expected_value_as_probability_update\"],\"evidence_priority\":\"general_knowledge_first\"}"
  mental_model: "Expected value is a weighted average over possible futures. The primitives are actions, mutually exclusive outcomes, probabilities conditional on each action, values or utilities in one shared unit, costs, constraints, and sensitivity ranges. For each action, multiply each outcome value by its probability, sum the products, subtract costs, and compare the resulting expectation against alternatives inside the feasible set."
  purpose: "This skill prevents agents from choosing by best-case story, worst-case fear, or unweighted option lists when probabilities and payoffs are already available. It replaces intuition-only recommendations with an explicit probability-weighted comparison, plus sensitivity checks that show which assumptions drive the decision."
  concept_boundary: "Expected value chooses among actions once probabilities and values are accepted or can be reasonably estimated. It does not update probabilities from evidence, trace unmodeled downstream consequences, run broad backlog scoring with qualitative criteria, or perform domain-specific valuation work. Those tools may feed the outcome model, but this skill owns probability-weighted action comparison."
  analogy: "Expected value is like a scale that weighs every possible future by both its size and its chance of happening, then subtracts the cost of putting that future on the scale."
  misconception: "The common mistake is treating expected value as the outcome to expect in a single trial. Expected value is a long-run or portfolio guide; a positive average can still be vetoed by ruin risk, hard constraints, non-repeatability, or made-up inputs."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/reasoning-strategy/expected-value/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

## Concept of the skill

**What it is:** Expected value is a decision method for choosing under quantified uncertainty. It ranks actions by summing probability times value across each possible outcome, then comparing the resulting expected payoff or utility.

**Mental model:** Build a payoff table. Rows are actions, columns are possible outcomes, and each outcome has a probability and a value in the same unit. Expected value is the weighted total for each row after costs, checked against constraints.

**Why it exists:** Agents over-weight vivid upside, visible downside, or the option with the best story. Expected value forces each option to state how often each outcome happens, how much it matters, what it costs, and whether the result survives sensitivity checks.

**What it is NOT:** It is not Bayesian updating, broad backlog prioritization, second-order consequence discovery, formal valuation, or a guarantee that the average outcome will occur once.

**Adjacent concepts:** Expected utility, expected monetary value, payoff matrices, decision trees, break-even probability, sensitivity analysis, value of information, risk of ruin.

**One-line analogy:** Expected value is a scale that weighs every future by both its size and its chance, then compares the total weight of each option.

**Common misconception:** A positive expected value is not automatically a good decision. If the downside can kill the project, violates a constraint, or depends on made-up probabilities, the correct next move may be mitigation or information-gathering.

# Expected Value

## Domain Context

Expected value is a portable decision framework for ranking actions when outcomes are uncertain but probabilities and values can be stated. It is useful for product bets, experiments, investments, risk tradeoffs, information-gathering choices, and go/no-go decisions where the input probabilities are already accepted or can be estimated honestly.

Use synthetic, aggregate, or public examples only. Do not include personal data, customer data, payment data, order data, private file paths, secrets, or confidential business facts in expected-value examples or evals.

Correct application requires a clear action set, mutually exclusive outcomes, probabilities that sum coherently, values in one shared unit, costs included, sensitivity checked, and hard downside constraints handled before recommending the highest expected value.

## Coverage

This skill teaches the operational expected-value loop:

1. Define the decision and action set.
2. Enumerate mutually exclusive, collectively relevant outcomes for each action.
3. Assign probabilities conditional on each action.
4. Assign value or utility in one shared unit.
5. Include costs, opportunity costs, and downside exposure.
6. Compute expected value for each action.
7. Run sensitivity and break-even checks.
8. Apply constraints such as risk of ruin, safety, privacy, legality, or irreversibility.
9. Decide, mitigate, reject, or gather information based on the comparison.

It also covers expected monetary value versus expected utility, fake precision, probability calibration, value of information, variance, tail risk, and boundaries with nearby reasoning and strategy skills.

## Philosophy of the skill

Most bad expected-value work fails before the arithmetic. The agent chooses the outcome list that favors the preferred answer, uses probabilities that do not sum to a coherent scenario set, mixes dollars with time or trust, forgets action cost, and then treats the final number as objective.

The discipline is not "turn every decision into math." The discipline is to expose the hidden math that was already happening. If a team says a feature is "worth trying," expected value asks: worth how much, how often, at what cost, and what downside could invalidate the average? Rough ranges are acceptable when they are labeled and stress-tested. Fake exactness is worse than an honest range.

## 1. Decision Frame

Expected value starts with actions, not outcomes. Compare actions that are actually available.

| Step | Question | Output |
| --- | --- | --- |
| Decision | What choice is being made now? | A specific go/no-go or option comparison |
| Actions | What can we do? | A1, A2, A3 |
| Outcomes | What could result under each action? | Outcome set per action |
| Unit | What value scale is used? | Dollars, hours saved, utility points, risk-adjusted score |
| Constraint | What can veto the average? | Budget cap, privacy rule, ruin risk, reversibility limit |

Do not compute expected value over vague options like "make the product better." Convert the question to concrete actions: "ship experiment A this week," "run a two-day research probe," "do nothing," or "buy the risk down first."

## 2. Formula

For one action:

```text
EV(action) = sum(probability_i * value_i) - cost(action)
```

For expected utility, replace monetary value with utility:

```text
EU(action) = sum(probability_i * utility_i) - utility_cost(action)
```

Use expected utility instead of expected monetary value when money is not linear with preference, downside risk has nonlinear pain, or the choice includes non-financial values such as trust, time, reputation, safety, or strategic position.

## 3. Probability Rules

Probabilities are not decoration. They determine how much each outcome counts.

| Rule | Check |
| --- | --- |
| Conditional on action | Probability means "if we choose this action, how often does this outcome occur?" |
| Mutually exclusive outcomes | Do not double-count overlapping scenarios. |
| Coherent total | Outcome probabilities for an action should sum to 1 unless explicitly modeling partial branches. |
| Source quality labeled | Mark measured, estimated, assumed, or guessed probabilities. |
| Ranges beat fake precision | Use low/base/high ranges when a point estimate is pretend accuracy. |

If the core uncertainty is what probability to assign after new evidence, use `bayesian-reasoning` first. Expected value starts after the probability estimate is accepted enough to compare actions.

## 4. Value Rules

Every outcome value must be in the same unit for the comparison to mean anything.

| Rule | Check |
| --- | --- |
| Same unit | Do not add dollars, hours, reputation, and trust without conversion. |
| Costs included | Include implementation cost, delay cost, maintenance cost, and opportunity cost. |
| Sign explicit | Gains are positive; losses and costs are negative. |
| Utility allowed | Use utility points when money is a poor proxy, but define the scale. |
| Nonlinear pain | Convert ruin, trust loss, or safety exposure into a constraint or nonlinear utility penalty. |

Expected value is often wrong when it treats all dollars, all hours, or all failures as linear. Losing the last week before launch is not the same as losing a random week in a quiet month. A single privacy breach is not "just one bad outcome" if it crosses a non-negotiable threshold.

## 5. Sensitivity and Breakpoints

The expected-value number is less important than knowing what would change the decision.

Run these checks before recommending an action:

| Check | Question |
| --- | --- |
| Low/base/high | Does the same option win under pessimistic, base, and optimistic assumptions? |
| Break-even probability | What probability would make the option worth doing? |
| Break-even value | How large must the upside be to justify the cost? |
| Dominant assumption | Which input contributes most to the decision? |
| Information value | Would better information change the decision enough to justify getting it? |

If a small change in one guessed probability flips the answer, the right recommendation is usually "gather information or run a smaller probe," not "choose the option with a thin expected-value lead."

## 6. Downside Constraints

Expected value can recommend a positive-average action that is still unacceptable.

Treat these as vetoes or required mitigations:

- risk of ruin,
- privacy exposure,
- illegal or unethical actions,
- unrecoverable trust loss,
- irreversible architecture damage,
- budget or cash-flow constraints,
- safety-critical failure modes.

The rule is: maximize expected value only inside the feasible set. A positive expected value outside hard constraints is not a recommendation; it is a signal to redesign the option, buy down risk, or reject it.

## 7. Agent Workflow

When applying expected value, produce this compact trace:

```text
Decision:

Options:
- A:
- B:

Outcome model:
- A:
  - outcome / probability / value:
- B:
  - outcome / probability / value:

EV calculation:
- A:
- B:

Sensitivity:
- break-even:
- most fragile assumption:

Constraints:
- ruin/privacy/legal/irreversibility:

Recommendation:
- choose / mitigate / gather information / reject:
```

Prefer a small table over prose when more than two outcomes are compared.

## 8. Worked Example

Scenario: choose between shipping a small product experiment or spending the same week on maintenance. Use synthetic values only.

| Option | Outcome | Probability | Value |
| --- | --- | ---: | ---: |
| Experiment | Strong signal and reusable learning | 0.20 | 120 |
| Experiment | Weak signal, some learning | 0.50 | 25 |
| Experiment | No useful signal | 0.30 | -20 |
| Maintenance | Known operational improvement | 1.00 | 25 |

Experiment gross expected value:

```text
(0.20 * 120) + (0.50 * 25) + (0.30 * -20) = 30.5
```

If the experiment costs 10 units of effort beyond maintenance, net expected value is 20.5, below the maintenance option's 25. If the experiment can be reduced so the extra cost is 4, net expected value becomes 26.5 and wins, assuming no hard constraints are violated.

The decision is not "experiments are good" or "maintenance is safer." The decision is driven by the cost and the probability of reusable learning. That is the assumption to test.

## 9. Value of Information

Information has expected value when it can change the decision.

Use this shortcut:

```text
VOI = expected improvement from better choice after learning - cost of learning
```

Gather information when:

- the current expected-value leader has a small margin,
- the decision flips under plausible assumptions,
- the information is cheap relative to the stakes,
- the action is hard to reverse,
- the downside constraint is uncertain.

Do not gather information when the same action wins under every plausible range or when learning costs more than the possible decision improvement.

## 10. Boundaries With Neighbor Skills

| Need | Use |
| --- | --- |
| Update probabilities from evidence | `bayesian-reasoning` |
| Rank actions by probability-weighted payoff or utility | `expected-value` |
| Rank a product backlog with qualitative criteria | `prioritization` |
| Trace downstream consequences before assigning outcome probabilities | `second-order-thinking` |
| Select which framework fits a business question | `framework-fit-analysis` |
| Identify hard constraints before optimizing | `constraint-awareness` |

## 11. Anti-Patterns

| Anti-pattern | Why it fails | Do instead |
| --- | --- | --- |
| Best-case expected value | Includes upside outcomes but ignores failure modes | Enumerate loss and neutral outcomes too |
| Probability theater | Uses exact percentages with no source or range | Label probability quality and run ranges |
| Unit mixing | Adds money, time, morale, and trust without conversion | Use one unit or move hard-to-price items to constraints |
| Cost omission | Computes gross upside and forgets implementation cost | Subtract costs and opportunity cost |
| Average hides ruin | Positive expected value masks a catastrophic tail outcome | Apply ruin and hard-constraint vetoes |
| Single-trial promise | Treats expected value as what will happen this time | State variance and sample-size caveat |
| Thin-margin certainty | Recommends a tiny expected-value winner despite fragile assumptions | Gather information or run a sensitivity check |

## Cross-Domain Synergy

- `bayesian-reasoning` supplies better probabilities when new evidence should change them.
- `second-order-thinking` expands the outcome list before probabilities and values are assigned.
- `prioritization` is useful when reach, confidence, effort, strategic fit, and non-quantified constraints matter more than a pure payoff calculation.
- `constraint-awareness` keeps the feasible set honest before expected-value optimization begins.
- `evaluation` helps decide whether the comparison has enough evidence to support the recommendation.

## Verification

After applying this skill, verify:

- [ ] The action set is concrete and comparable.
- [ ] Outcomes are mutually exclusive enough to avoid double-counting.
- [ ] Probabilities are conditional on the action and sum coherently.
- [ ] Probability source quality is labeled.
- [ ] Values use one shared unit or are explicitly converted to utility.
- [ ] Costs and opportunity costs are included.
- [ ] Expected value is calculated for each option, not just the favored option.
- [ ] Sensitivity or break-even analysis is shown.
- [ ] Hard constraints and ruin risk are checked before recommending the highest expected value.
- [ ] The recommendation is one of: choose, mitigate, gather information, or reject.

## Do NOT Use When

| Instead of this skill | Use | Why |
| --- | --- | --- |
| Updating belief after new evidence | `bayesian-reasoning` | Expected value uses probabilities; Bayesian reasoning updates them |
| Mapping downstream consequences before outcomes are known | `second-order-thinking` | Expected value needs modeled outcomes; second-order thinking finds them |
| Ranking broad backlog items with reach, confidence, effort, and strategy | `prioritization` | Prioritization handles mixed qualitative and quantitative criteria |
| Selecting the right business framework | `framework-fit-analysis` | Framework fit chooses the method before expected-value math is appropriate |
| A hard constraint has not been identified yet | `constraint-awareness` | Constraints define the feasible set before optimization |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `reasoning-strategy`
- Public: `true`
- Domain: `foundations/decision-quality`
- Scope: Use when choosing among actions under quantified uncertainty by enumerating outcomes, assigning probabilities, valuing each outcome in one shared unit, computing probability-weighted value, testing sensitivity, and checking downside constraints before recommending. Covers expected value, expected utility, expected monetary value, payoff tables, break-even probability, value of information, and risk-of-ruin constraints. Do NOT use for updating probabilities from evidence (use bayesian-reasoning), broad mixed-criteria backlog ranking (use prioritization), or tracing consequences before outcomes are modeled (use second-order-thinking).

**When to use**
- Calculate the expected value of these three options and recommend one.
- This experiment has outcome probabilities and payoffs; calculate expected value and decide whether to run it.
- Find the break-even probability for this product bet.
- The expected value is positive but the downside is severe; how should we decide?
- Triggers: `expected-value`, `probability-weighted-decision`, `ev-decision`

**Not for**
- Update these probabilities after new customer evidence.
- Prioritize this backlog with RICE using reach, impact, confidence, and effort.
- Trace the second- and third-order consequences before we model outcomes.

**Related skills**
- Verify with: `constraint-awareness`, `methodical`, `epistemic-grounding`
- Related: `evaluation`, `bayesian-reasoning`, `second-order-thinking`, `prioritization`, `constraint-awareness`

**Concept**
- Mental model: Expected value is a weighted average over possible futures. The primitives are actions, mutually exclusive outcomes, probabilities conditional on each action, values or utilities in one shared unit, costs, constraints, and sensitivity ranges. For each action, multiply each outcome value by its probability, sum the products, subtract costs, and compare the resulting expectation against alternatives inside the feasible set.
- Purpose: This skill prevents agents from choosing by best-case story, worst-case fear, or unweighted option lists when probabilities and payoffs are already available. It replaces intuition-only recommendations with an explicit probability-weighted comparison, plus sensitivity checks that show which assumptions drive the decision.
- Boundary: Expected value chooses among actions once probabilities and values are accepted or can be reasonably estimated. It does not update probabilities from evidence, trace unmodeled downstream consequences, run broad backlog scoring with qualitative criteria, or perform domain-specific valuation work. Those tools may feed the outcome model, but this skill owns probability-weighted action comparison.
- Analogy: Expected value is like a scale that weighs every possible future by both its size and its chance of happening, then subtracts the cost of putting that future on the scale.
- Common misconception: The common mistake is treating expected value as the outcome to expect in a single trial. Expected value is a long-run or portfolio guide; a positive average can still be vetoed by ruin risk, hard constraints, non-repeatability, or made-up inputs.

**Grounding**
- Mode: `universal`
- Truth sources: `https://plato.stanford.edu/entries/rationality-normative-utility/`, `https://plato.stanford.edu/entries/decision-theory/`, `skills/reasoning-strategy/expected-value/references/expected-value-sources.md`, `skills/reasoning-strategy/expected-value/references/upstream-displacement-2026-05-27.md`

**Keywords**
- `expected value`, `three options`, `recommend one`, `expected utility`, `expected monetary value`, `probability weighted`, `probabilities and payoffs`, `outcome probability`, `downside constraints`, `break-even probability`

<!-- skill-graph-context:end -->
