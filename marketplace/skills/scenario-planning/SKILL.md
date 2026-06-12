---
name: scenario-planning
description: "Use when building, reviewing, or applying scenario planning for strategy under deep uncertainty: focal question, time horizon, stakeholders, driving forces, predetermined elements, critical uncertainties, 2x2 scenario matrices, scenario narratives, plausibility and internal-consistency checks, signposts, no-regret moves, options, hedges, contingency plans, and stress-testing of strategies across several futures. Covers business, policy, product, nonprofit, market-entry, risk, and transformation contexts where the future system may change in structurally different ways. Do NOT use for ordinary macro-environment scanning alone (use pestel), probability-weighted payoff calculation (use expected-value), belief updating from evidence (use bayesian-reasoning), innovation portfolio allocation (use three-horizons), generic internal/external factor inventory (use swot-tows), or integrated strategy-choice cascades (use playing-to-win)."
license: MIT
compatibility: "Markdown, strategy memos, foresight workshops, product strategy, policy strategy, nonprofit planning, market-entry planning, transformation planning"
allowed-tools: Read Grep WebSearch WebFetch
metadata:
  relations: "{\"related\":[\"pestel\",\"swot-tows\",\"playing-to-win\",\"three-horizons\",\"expected-value\",\"bayesian-reasoning\",\"second-order-thinking\",\"inversion\",\"epistemic-grounding\",\"research-synthesis\",\"methodology\"],\"suppresses\":[\"pestel\",\"expected-value\",\"bayesian-reasoning\",\"three-horizons\",\"swot-tows\",\"playing-to-win\"],\"verify_with\":[\"epistemic-grounding\",\"research-synthesis\",\"second-order-thinking\",\"methodology\"]}"
  subject: reasoning-strategy
  scope: "Scenario planning for strategic decisions under deep uncertainty: define the focal question, decision owner, scope, stakeholders, time horizon, and decision deadline; gather external and internal evidence; distinguish predetermined elements from critical uncertainties; select uncertainties that are high-impact, uncertain, independent enough to form useful axes, and relevant to the decision; build two to four plausible, internally consistent, decision-relevant scenarios; write named narratives that are not best-case/worst-case wish lists; identify implications, risks, opportunities, early-warning signposts, no-regret moves, options, hedges, and contingency actions; and stress-test candidate strategies across the scenario set. Excludes routine macro-environment scanning without alternative futures, quantified expected-value comparison, Bayesian belief updating, innovation-portfolio horizon allocation, generic SWOT/TOWS factor inventory, and full strategy-cascade formulation as the primary task."
  public: "true"
  taxonomy_domain: foundations/strategy
  stability: stable
  keywords: "[\"scenario planning\",\"scenario analysis\",\"scenario matrix\",\"four plausible scenarios\",\"scenario narratives\",\"critical uncertainties\",\"signposts\",\"stress-test strategy\",\"robust contingent hedging actions\",\"fake probabilities\"]"
  triggers: "[\"scenario-planning\",\"scenario planning\",\"scenario analysis\",\"strategic foresight scenarios\",\"2x2 scenario matrix\",\"scenario matrix\",\"scenario narratives\",\"four plausible scenarios\",\"critical uncertainties\",\"fake probabilities\"]"
  examples: "[\"Use scenario planning to build four plausible scenarios for how this market could evolve over the next five years and stress-test our strategy against them.\",\"Use scenario planning to identify critical uncertainties, signposts, and no-regret moves for this product launch.\",\"Use scenario planning to review these future scenarios and tell me whether they are internally consistent or just optimistic/pessimistic variants.\",\"Use scenario planning after this macro-driver scan to create a scenario matrix and strategic implications.\",\"Create scenario narratives for a nonprofit planning process, then identify robust, contingent, and hedging actions.\",\"We face uncertainty about regulation and AI adoption. Use scenario planning rather than assigning fake probabilities.\"]"
  anti_examples: "[\"Scan political, economic, social, technological, environmental, and legal forces for market entry.\",\"We have three options with probabilities and payoffs. Compute expected value and recommend one.\",\"Update our confidence in this forecast after new evidence arrived.\",\"Balance our innovation portfolio across core, adjacent, and transformational bets.\",\"Turn strengths, weaknesses, opportunities, and threats into SO, WO, ST, and WT options.\",\"Answer the five Playing to Win choices for this business.\"]"
  grounding: "{\"subject_matter\":\"Scenario planning as a portable strategic-foresight method for strategy under deep uncertainty\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://www.gov.uk/government/publications/futures-toolkit-for-policy-makers-and-analysts/the-futures-toolkit-html\",\"https://www.gov.uk/government/publications/futures-toolkit-for-policy-makers-and-analysts\",\"https://sloanreview.mit.edu/article/scenario-planning-a-tool-for-strategic-thinking/\",\"https://www.shell.com/what-we-do/energy-and-innovation/scenarios.html\",\"https://www.oecd.org/en/topics/strategic-foresight.html\",\"https://doi.org/10.1002/ffo2.3\",\"skills/skills/reasoning-strategy/scenario-planning/references/scenario-planning-sources.md\",\"skills/skills/reasoning-strategy/scenario-planning/references/upstream-displacement-2026-06-11.md\"],\"failure_modes\":[\"forecast_presented_as_scenario\",\"best_case_worst_case_middle_case_disguised_as_scenarios\",\"probabilities_fabricated_for_deep_uncertainty\",\"critical_uncertainties_not_distinguished_from_predetermined_elements\",\"scenario_axes_correlated_redundant_or_low_impact\",\"narratives_lack_causal_logic_or_internal_consistency\",\"scenarios_not_linked_to_decisions_or_strategy_options\",\"no_signposts_monitoring_triggers_or_contingency_actions\",\"one_preferred_future_selected_too_early\",\"stakeholder_perspectives_missing\",\"scenario_work_replaces_rather_than_feeds_strategy_choice\",\"private_or_sensitive_business_facts_leaked_into_examples\",\"ai_generated_scenario_treated_as_source_of_truth\"],\"evidence_priority\":\"general_knowledge_first\"}"
  mental_model: "Scenario planning is an uncertainty-to-choice method. The primitives are a focal decision, time horizon, stakeholders, driving forces, predetermined elements, critical uncertainties, scenario logic, scenario narratives, internal-consistency tests, strategic implications, signposts, no-regret actions, options, hedges, contingency plans, and monitoring cadence. The method first separates what is relatively knowable from what could plausibly break in several directions, then builds several coherent future worlds and asks which choices survive, which choices depend on a particular world, and what signals would tell the decision owner which world is emerging."
  purpose: "This skill prevents agents from treating uncertain futures as a single forecast, a fake probability table, or an optimistic/base/pessimistic spreadsheet. It forces agents to surface deep assumptions, construct multiple plausible and uncomfortable futures, reason through consequences before choosing, and convert foresight into robust actions, contingent bets, hedges, and monitoring triggers."
  concept_boundary: "Scenario planning is for exploring structurally different plausible futures and testing choices against them. It is not PESTEL macro scanning by itself, expected-value math, Bayesian belief updating, Three Horizons innovation-portfolio allocation, SWOT/TOWS inventory, Blue Ocean value-curve redesign, Five Forces industry-structure diagnosis, or the full Playing to Win strategy cascade. Those methods may feed or follow scenario planning, but they do not replace the alternative-future construction and stress-testing mechanism."
  analogy: "Scenario planning is like rehearsing several credible weather systems before a voyage: the point is not to predict the exact storm, but to choose routes, supplies, and watch signals that keep the ship viable across different conditions."
  misconception: "The common mistake is treating scenario planning as three forecasts labeled optimistic, base, and pessimistic. Useful scenarios are not probability bands around one expected future; they are distinct, plausible, internally consistent worlds built from critical uncertainties and used to improve today's decisions."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/reasoning-strategy/scenario-planning/SKILL.md
---

## Concept of the skill

**What it is:** Scenario planning is a strategic-foresight method for making decisions under deep uncertainty by constructing several plausible future worlds and testing choices against them.

**Mental model:** Start with a decision, not a generic future. Gather forces that could shape the environment, split relatively predetermined elements from high-impact uncertainties, combine the strongest uncertainties into scenario logics, write coherent narratives, and use those narratives to identify robust actions, contingent moves, hedges, signposts, and research needs.

**Why it exists:** Agents often collapse uncertainty into a single forecast or fabricate probabilities. This skill keeps uncertainty explicit long enough for the strategy to become more resilient.

**What it is NOT:** It is not PESTEL scanning alone, expected-value math, Bayesian updating, Three Horizons portfolio allocation, SWOT/TOWS inventory, or the full strategy cascade.

**Adjacent concepts:** strategic foresight, horizon scanning, critical uncertainties, driver mapping, policy stress-testing, robust strategy, contingency planning, weak signals, no-regret moves, option value, early-warning signposts.

**One-line analogy:** Scenario planning rehearses several credible future worlds before committing the strategy.

**Common misconception:** Scenario planning is not optimistic/base/pessimistic forecasting. The useful output is a set of distinct, plausible, internally consistent futures that expose different strategic consequences.

# Scenario Planning

## Domain Context

Use scenario planning for business strategy, product strategy, market entry, nonprofit planning, public policy, transformation planning, risk review, capital allocation conversations, and strategy reviews where the future environment could change in structurally different ways. Use public, aggregate, or synthetic examples only. Do not include personal data, customer records, payment data, secrets, confidential deal details, private forecasts, or sensitive business facts in examples or evals.

Scenario planning is strongest when the decision owner faces uncertainty that cannot credibly be reduced to a single forecast or probability-weighted payoff table. It is weaker when the task is only to gather macro facts, update a known probability, compare options with reliable probabilities and payoffs, or choose a complete strategy cascade.

The output should change a decision. If the scenarios are interesting but do not affect choices, investments, policies, research priorities, monitoring, timing, or fallback plans, the work is incomplete.

## Coverage

This skill teaches agents to:

1. Frame the focal decision, decision owner, time horizon, scope, stakeholders, and deadline.
2. Gather drivers from evidence, research, PESTEL scans, horizon scanning, stakeholder interviews, market signals, technology shifts, regulation, competition, economics, social change, and operational constraints.
3. Separate predetermined elements from critical uncertainties.
4. Choose scenario axes or scenario logics that are high-impact, genuinely uncertain, relevant, and not redundant.
5. Build two to four scenarios that are plausible, internally consistent, distinct, decision-relevant, and neither utopian nor dystopian by default.
6. Write scenario narratives with causal logic, stakeholder behavior, timing, constraints, and consequences.
7. Test existing or candidate strategies against every scenario.
8. Identify robust actions, contingent actions, hedges, options to preserve, bets to delay, and decisions that need more evidence.
9. Define signposts and monitoring triggers that show which scenario logic may be emerging.
10. Route adjacent tasks to the right strategy method instead of stretching scenario planning beyond its mechanism.

## Philosophy of the skill

Scenario planning is useful because uncertainty is not only a data shortage. Sometimes the system itself can evolve in several plausible directions: regulation can tighten or fragment, a technology can commoditize or remain scarce, customers can change behavior, capital can become cheap or expensive, and public trust can rise or collapse. A single forecast hides those branches.

The method deliberately resists premature convergence. It asks the agent to hold multiple futures in mind long enough to see which strategies are fragile, which actions are useful across worlds, and which signals deserve monitoring. The goal is not prediction. The goal is a better present decision.

Good scenarios are disciplined stories. They are not fiction for its own sake and not generic trend prose. Each scenario should have a causal chain from drivers to outcomes, a time horizon, actor behavior, constraints, and implications for the focal decision. The names should help people remember the logic without smuggling in a preferred future.

## Workflow

### 1. Frame the focal decision

Start by naming the decision that the scenarios must inform.

```text
Decision owner:
Focal decision or strategic question:
Decision deadline:
Time horizon for scenarios:
Geography / market / system boundary:
Stakeholders:
Existing strategy or options to test:
Evidence available:
Evidence missing:
Constraints:
```

Reject scenario work that has no decision owner or decision use. If the user only asks "what could happen in the future," produce a lightweight exploration and state that it is not decision-grade scenario planning until the focal decision is named.

### 2. Gather drivers and evidence

Use evidence before imagination. Gather drivers from sources that fit the scope:

| Source surface | Use for | Guardrail |
| --- | --- | --- |
| PESTEL or macro scan | Political, economic, social, technological, environmental, and legal forces | PESTEL lists drivers; scenario planning turns critical uncertainties into future worlds |
| Horizon scanning | Weak signals, emerging issues, early discontinuities | Mark weak signals as uncertain rather than established facts |
| Stakeholder interviews | Interests, fears, incentives, behaviors, blind spots | Include more than one perspective; avoid letting one stakeholder define the future |
| Market and user research | Demand changes, adoption barriers, behavior shifts | Do not extrapolate from anecdotes without labeling uncertainty |
| Industry structure | Rivalry, supplier/buyer power, substitutes, entrants | Industry pressure can be a driver but is not the full scenario method |
| Technology and regulation sources | Adoption constraints, compliance exposure, standards, policy shifts | Re-check volatile claims and name jurisdictions |
| Internal strategy constraints | Capabilities, cost structure, assets, commitments | Internal facts shape strategy options but should not replace external uncertainty |

Separate evidence into:

```text
Relatively predetermined elements:
High-impact uncertainties:
Low-impact uncertainties:
Known unknowns requiring research:
Weak signals:
Assumptions:
```

### 3. Select critical uncertainties

Critical uncertainties must be both important to the focal decision and genuinely uncertain within the time horizon.

| Test | Question | Failure signal |
| --- | --- | --- |
| Impact | Would different outcomes change the decision or strategy? | Interesting trend with no decision consequence |
| Uncertainty | Is the direction, timing, magnitude, or interaction genuinely unclear? | Predetermined trend used as a scenario axis |
| Independence | Are the candidate axes independent enough to create distinct worlds? | Axes move together and create duplicate scenarios |
| Plausibility | Could each end state occur without magical assumptions? | Science fiction or wishful thinking |
| Relevance | Does the uncertainty belong to the chosen scope and horizon? | Global trend used for a local decision without translation |
| Actionability | Could the scenario output change options, hedges, or monitoring? | Scenario produces no strategic implication |

When using a 2x2 matrix, avoid axes that are simply good/bad versions of the same preference. "Regulation tightens vs loosens" and "AI adoption fast vs slow" can be useful. "Success vs failure" cannot.

### 4. Build the scenario set

Most strategy work benefits from two to four scenarios. Four scenarios are natural for a 2x2 matrix; two or three can work when the uncertainties are not cleanly matrix-shaped. More than four usually becomes hard for decision-makers to use.

For each scenario, define:

```text
Scenario name:
Core logic:
Critical uncertainty outcomes:
Predetermined elements present in all scenarios:
Key actors and incentives:
Causal chain from today to the scenario:
What changes for customers, users, citizens, competitors, partners, suppliers, regulators, funders, or employees:
Opportunities:
Risks:
Strategic questions:
Evidence gaps:
Signposts:
```

Do not title scenarios "best," "base," and "worst." Use neutral names that preserve the scenario logic without declaring a favorite.

### 5. Check scenario quality

Before using scenarios, test them.

| Quality criterion | Check |
| --- | --- |
| Plausible | Each future could happen within the time horizon |
| Distinct | Each scenario differs in strategic consequences, not only tone |
| Internally consistent | The drivers, actors, economics, regulation, technology, and behavior can coexist |
| Decision-relevant | Each scenario changes implications for the focal decision |
| Memorable | Names and narratives are easy to recall without becoming slogans |
| Balanced | The set avoids one preferred future and several straw futures |
| Evidence-aware | Facts, assumptions, and weak signals are labeled |
| Diverse perspective | Stakeholder incentives and affected groups are not flattened |

If a scenario fails internal consistency, revise the causal logic or replace the axis. If all scenarios recommend the same action, either the action is robust or the scenario set is not challenging enough; name which is true.

### 6. Stress-test strategies

Use scenarios to evaluate existing or candidate strategies.

| Strategy response | Meaning | Output |
| --- | --- | --- |
| Robust action | Valuable or necessary across most or all scenarios | Do now, with normal governance |
| Contingent action | Useful only if a specific scenario starts emerging | Prepare trigger and owner |
| Hedge | Reduces downside across unfavorable worlds | Invest enough to preserve resilience |
| Option | Preserves ability to move later | Small reversible investment, partnership, prototype, research |
| Big bet | Pays off strongly in one or two worlds and fails in others | Only choose knowingly; name exposure |
| Delay | Decision can wait for a signpost without losing too much value | Monitor trigger and decision date |
| Stop | Fragile or harmful across scenarios | Reject or redesign |

Stress-test template:

```text
Strategy or option:
Scenario 1 result:
Scenario 2 result:
Scenario 3 result:
Scenario 4 result:
Robust actions:
Contingent actions:
Hedges:
Options to preserve:
Assumptions to test:
Signposts:
Decision owner and review date:
```

### 7. Define signposts and monitoring

Signposts are observable indicators that a scenario logic may be emerging. They are not vague watchwords.

Good signposts name:

- The indicator
- Source or collection method
- Direction or threshold
- Review cadence
- Owner
- Decision that changes if triggered

Examples:

| Weak signpost | Better signpost |
| --- | --- |
| "AI adoption" | "Percentage of target segment using AI-enabled workflow tools in monthly survey; review quarterly; if above 45%, accelerate integration roadmap" |
| "Regulation" | "Draft rule reaches formal consultation in target jurisdiction; legal owner reviews within two weeks; if enacted path becomes likely, pause noncompliant launch work" |
| "Capital markets" | "Customer CFO interviews mention budget freeze in more than 40% of discovery calls over two consecutive months; adjust packaging and sales forecast" |

### 8. Produce a decision-grade output

Use this answer structure for most scenario-planning tasks:

```text
Focal decision:
Scope and horizon:
Evidence used:
Evidence missing:
Predetermined elements:
Critical uncertainties:
Scenario set:
Scenario narratives:
Strategy stress-test:
Robust actions:
Contingent actions / hedges / options:
Signposts and monitoring:
Research needs:
Downstream method handoff:
```

Keep the output explicit about uncertainty. Do not imply that the scenarios are exhaustive, mutually exclusive in a formal probabilistic sense, or predictive.

## Boundary Routing

| User intent | Use | Reason |
| --- | --- | --- |
| Scan political, economic, social, technological, environmental, and legal forces | `pestel` | PESTEL gathers macro drivers; scenario planning can use the most uncertain, high-impact drivers afterward |
| Compare options with credible probabilities and payoffs | `expected-value` | Expected value requires defensible probabilities and values; scenario planning is for deeper uncertainty |
| Update confidence after new evidence | `bayesian-reasoning` | Bayesian reasoning updates beliefs; scenario planning constructs multiple future worlds |
| Balance core, adjacent, and transformational innovation investments | `three-horizons` | Three Horizons is portfolio-time-horizon allocation, not scenario narratives |
| Turn strengths, weaknesses, opportunities, and threats into options | `swot-tows` | SWOT/TOWS organizes factors and generates options; scenario planning stress-tests options across futures |
| Define winning aspiration, where to play, how to win, capabilities, and systems | `playing-to-win` | Playing to Win owns the full strategy cascade; scenario planning can inform assumptions and robustness |
| Analyze industry profit pressure | `porters-five-forces` | Five Forces diagnoses current or plausible industry structure; scenario planning can vary industry futures |

## Verification

- [ ] The focal decision, decision owner, horizon, and scope are explicit
- [ ] Predetermined elements are separated from critical uncertainties
- [ ] Scenario axes or logics are high-impact, uncertain, relevant, and not redundant
- [ ] Scenarios are plausible, distinct, internally consistent, and decision-relevant
- [ ] Scenario names do not encode a preferred future or best/base/worst pattern
- [ ] Narratives include causal logic, actors, timing, and consequences
- [ ] Strategic implications include robust actions, contingent actions, hedges, options, or stops
- [ ] Signposts have observable indicators, thresholds or directions, owners, cadence, and linked decisions
- [ ] Facts, assumptions, weak signals, and invented examples are clearly separated
- [ ] Adjacent methods are routed correctly

## Do NOT Use When

| Use instead | When |
| --- | --- |
| `pestel` | The task is an external macro-environment scan without constructing alternative futures. |
| `expected-value` | The task has credible probabilities and payoffs and asks for a probability-weighted option choice. |
| `bayesian-reasoning` | The task is belief updating after new evidence. |
| `three-horizons` | The task is innovation portfolio balance across current core, emerging growth, and future options. |
| `swot-tows` | The task is internal/external factor inventory or TOWS option generation. |
| `playing-to-win` | The task is a full integrated strategy cascade. |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `reasoning-strategy`
- Public: `true`
- Domain: `foundations/strategy`
- Scope: Scenario planning for strategic decisions under deep uncertainty: define the focal question, decision owner, scope, stakeholders, time horizon, and decision deadline; gather external and internal evidence; distinguish predetermined elements from critical uncertainties; select uncertainties that are high-impact, uncertain, independent enough to form useful axes, and relevant to the decision; build two to four plausible, internally consistent, decision-relevant scenarios; write named narratives that are not best-case/worst-case wish lists; identify implications, risks, opportunities, early-warning signposts, no-regret moves, options, hedges, and contingency actions; and stress-test candidate strategies across the scenario set. Excludes routine macro-environment scanning without alternative futures, quantified expected-value comparison, Bayesian belief updating, innovation-portfolio horizon allocation, generic SWOT/TOWS factor inventory, and full strategy-cascade formulation as the primary task.

**When to use**
- Use scenario planning to build four plausible scenarios for how this market could evolve over the next five years and stress-test our strategy against them.
- Use scenario planning to identify critical uncertainties, signposts, and no-regret moves for this product launch.
- Use scenario planning to review these future scenarios and tell me whether they are internally consistent or just optimistic/pessimistic variants.
- Use scenario planning after this macro-driver scan to create a scenario matrix and strategic implications.
- Create scenario narratives for a nonprofit planning process, then identify robust, contingent, and hedging actions.
- We face uncertainty about regulation and AI adoption. Use scenario planning rather than assigning fake probabilities.
- Triggers: `scenario-planning`, `scenario planning`, `scenario analysis`, `strategic foresight scenarios`, `2x2 scenario matrix`, `scenario matrix`, `scenario narratives`, `four plausible scenarios`, `critical uncertainties`, `fake probabilities`

**Not for**
- Scan political, economic, social, technological, environmental, and legal forces for market entry.
- We have three options with probabilities and payoffs. Compute expected value and recommend one.
- Update our confidence in this forecast after new evidence arrived.
- Balance our innovation portfolio across core, adjacent, and transformational bets.
- Turn strengths, weaknesses, opportunities, and threats into SO, WO, ST, and WT options.
- Answer the five Playing to Win choices for this business.

**Related skills**
- Verify with: `epistemic-grounding`, `research-synthesis`, `second-order-thinking`, `methodology`
- Related: `pestel`, `swot-tows`, `playing-to-win`, `three-horizons`, `expected-value`, `bayesian-reasoning`, `second-order-thinking`, `inversion`, `epistemic-grounding`, `research-synthesis`, `methodology`

**Concept**
- Mental model: Scenario planning is an uncertainty-to-choice method. The primitives are a focal decision, time horizon, stakeholders, driving forces, predetermined elements, critical uncertainties, scenario logic, scenario narratives, internal-consistency tests, strategic implications, signposts, no-regret actions, options, hedges, contingency plans, and monitoring cadence. The method first separates what is relatively knowable from what could plausibly break in several directions, then builds several coherent future worlds and asks which choices survive, which choices depend on a particular world, and what signals would tell the decision owner which world is emerging.
- Purpose: This skill prevents agents from treating uncertain futures as a single forecast, a fake probability table, or an optimistic/base/pessimistic spreadsheet. It forces agents to surface deep assumptions, construct multiple plausible and uncomfortable futures, reason through consequences before choosing, and convert foresight into robust actions, contingent bets, hedges, and monitoring triggers.
- Boundary: Scenario planning is for exploring structurally different plausible futures and testing choices against them. It is not PESTEL macro scanning by itself, expected-value math, Bayesian belief updating, Three Horizons innovation-portfolio allocation, SWOT/TOWS inventory, Blue Ocean value-curve redesign, Five Forces industry-structure diagnosis, or the full Playing to Win strategy cascade. Those methods may feed or follow scenario planning, but they do not replace the alternative-future construction and stress-testing mechanism.
- Analogy: Scenario planning is like rehearsing several credible weather systems before a voyage: the point is not to predict the exact storm, but to choose routes, supplies, and watch signals that keep the ship viable across different conditions.
- Common misconception: The common mistake is treating scenario planning as three forecasts labeled optimistic, base, and pessimistic. Useful scenarios are not probability bands around one expected future; they are distinct, plausible, internally consistent worlds built from critical uncertainties and used to improve today's decisions.

**Grounding**
- Mode: `universal`
- Truth sources: `https://www.gov.uk/government/publications/futures-toolkit-for-policy-makers-and-analysts/the-futures-toolkit-html`, `https://www.gov.uk/government/publications/futures-toolkit-for-policy-makers-and-analysts`, `https://sloanreview.mit.edu/article/scenario-planning-a-tool-for-strategic-thinking/`, `https://www.shell.com/what-we-do/energy-and-innovation/scenarios.html`, `https://www.oecd.org/en/topics/strategic-foresight.html`, `https://doi.org/10.1002/ffo2.3`, `skills/skills/reasoning-strategy/scenario-planning/references/scenario-planning-sources.md`, `skills/skills/reasoning-strategy/scenario-planning/references/upstream-displacement-2026-06-11.md`

**Keywords**
- `scenario planning`, `scenario analysis`, `scenario matrix`, `four plausible scenarios`, `scenario narratives`, `critical uncertainties`, `signposts`, `stress-test strategy`, `robust contingent hedging actions`, `fake probabilities`

<!-- skill-graph-context:end -->
