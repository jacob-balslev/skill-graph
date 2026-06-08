---
name: value-chain-analysis
description: "Use when decomposing how an organization, business unit, product, service, or operating model creates value and cost through Porter's Value Chain: primary activities, support activities, activity-level cost drivers, differentiation drivers, linkages, fit, margin, and where competitive advantage may come from. Covers mapping activities, comparing activity configuration to rivals or alternatives, diagnosing cost and differentiation opportunities, and handing off to strategy or operating-improvement methods. Do NOT use for industry profit-pressure diagnosis (use porters-five-forces), resource/capability advantage testing (use vrio), portfolio allocation (use bcg-matrix), product-market growth paths (use ansoff-matrix), macro-environment scanning (use pestel), or quantified option valuation (use expected-value). Do NOT use for Analyze buyer power, supplier power, substitutes, entrants, and rivalry for this industry."
license: MIT
compatibility: "Markdown, strategy memos, operating-model reviews, business-unit strategy, value-chain maps, cost and differentiation analysis"
allowed-tools: Read Grep WebSearch WebFetch
metadata:
  relations: "{\"boundary\":[\"porters-five-forces\",\"vrio\",\"bcg-matrix\",\"ansoff-matrix\",\"swot-tows\",\"expected-value\"]}"
  subject: reasoning-strategy
  scope: "Porter's Value Chain analysis for organizations, business units, products, services, operating models, and strategy reviews: map primary and support activities, identify activity-level value and cost drivers, trace linkages and fit across activities, compare the activity system to rivals or alternatives, diagnose cost-leadership and differentiation opportunities, and convert the analysis into strategic hypotheses or operating changes. Excludes external industry profit-pressure diagnosis, resource/capability durability testing, BCG portfolio allocation, Ansoff product-market growth paths, PESTEL macro scanning, OKR execution tracking, Lean waste removal as the primary lens, and standalone financial valuation."
  taxonomy_domain: foundations/strategy
  stability: stable
  keywords: "[\"value chain analysis\",\"Porter's Value Chain\",\"activity system\",\"primary activities\",\"support activities\",\"cost drivers\",\"differentiation drivers\",\"activity linkages\",\"strategic fit\",\"margin analysis\"]"
  triggers: "[\"value-chain\",\"value-chain-analysis\",\"porters-value-chain\",\"activity-system-map\"]"
  examples: "[\"Map our value chain and show where we create customer value, incur cost, and may have differentiation opportunities.\",\"Use Porter's Value Chain to analyze this business unit and identify activity-level sources of competitive advantage.\",\"Review this operating model through primary activities, support activities, linkages, and margin.\",\"Compare our activity system to competitors and tell me where the cost or differentiation drivers differ.\",\"Turn these activities into a value-chain analysis without confusing it with Five Forces or VRIO.\"]"
  anti_examples: "[\"Analyze buyer power, supplier power, substitutes, entrants, and rivalry for this industry.\",\"Use VRIO to decide whether our data, brand, process, or supplier network is a sustained competitive advantage.\",\"Classify our products as stars, cash cows, question marks, or dogs.\",\"Classify growth ideas as market penetration, market development, product development, or diversification.\",\"Calculate expected value across these options with probabilities and payoff scenarios.\"]"
  grounding: "{\"subject_matter\":\"Porter's Value Chain as a portable strategy framework for activity-level cost, differentiation, linkage, and margin analysis\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://www.isc.hbs.edu/strategy/business-strategy/Pages/the-value-chain.aspx\",\"https://www.isc.hbs.edu/strategy/Pages/strategy-explained.aspx\",\"https://www.isc.hbs.edu/strategy/business-strategy/Pages/strategic-positioning.aspx\",\"https://www.hbs.edu/faculty/Pages/item.aspx?num=191\",\"skills/skills/reasoning-strategy/value-chain-analysis/references/value-chain-analysis-sources.md\",\"skills/skills/reasoning-strategy/value-chain-analysis/references/upstream-displacement-2026-06-07.md\"],\"failure_modes\":[\"value_chain_reduced_to_supply_chain_logistics\",\"activity_labels_used_without_cost_or_value_evidence\",\"primary_and_support_activities_treated_as_fixed_org_chart\",\"linkages_and_fit_ignored\",\"operational_effectiveness_confused_with_strategy\",\"competitive_advantage_claimed_without_relative_activity_comparison\",\"margin_not_connected_to_willingness_to_pay_or_cost\",\"value_chain_confused_with_vrio_or_five_forces\"],\"evidence_priority\":\"general_knowledge_first\"}"
  mental_model: "Value Chain analysis treats competitive advantage as arising from activities and the fit among activities. The primitives are a business unit or offering, a customer value proposition, primary activities, support activities, activity costs, activity value or willingness-to-pay effects, linkages between activities, relative activity configuration versus rivals or alternatives, margin, and strategic choices. The agent decomposes the business into activities, asks how each activity affects cost or differentiation, traces how activities reinforce or undermine each other, then identifies where a different configuration could produce lower cost, higher willingness to pay, or stronger fit."
  purpose: "This skill prevents agents from making strategy recommendations at the slogan level. It forces the agent to show where value and cost are created activity by activity, how activities link together, whether advantage comes from cost position, differentiation, or fit, and which downstream method should test the remaining uncertainty."
  analogy: "A value chain is like opening the back of a clock: the advantage is not the face, but the gears, costs, timing, and linkages that make the clock run differently."
  misconception: "The common mistake is treating the value chain as a generic supply-chain diagram or org chart. Porter's value chain is an activity-level strategy tool: the activity labels only matter when they reveal value, cost, linkages, fit, margin, and relative difference."
  public: "true"
  concept_boundary: "Value Chain analysis is internal activity-system diagnosis. It is not Porter's Five Forces external industry analysis, VRIO resource/capability durability testing, Seven Powers moat-source classification, BCG portfolio allocation, Ansoff growth-path selection, PESTEL macro scanning, Lean waste removal as the main lens, OKR execution management, or a DCF valuation. Those methods can feed or follow the analysis, but they do not replace the activity-level value and cost map."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/reasoning-strategy/value-chain-analysis/SKILL.md
  skill_graph_export_description_projection: anti_examples
  skill_graph_export_description_projection_truncated: "true"
---

## Concept of the skill

**What it is:** Value Chain analysis is Michael Porter's activity-level strategy framework for understanding how a firm creates value and incurs cost. It decomposes a business into primary and support activities, then asks where cost advantage, differentiation, linkages, and fit create competitive advantage.

**Mental model:** Map the activities first, then trace value, cost, and linkages. Advantage is not usually one isolated activity; it is often a different configuration of activities that raises willingness to pay, lowers relative cost, or reinforces a distinctive positioning.

**Why it exists:** Agents often jump from "we need strategy" to generic recommendations. This skill forces the work down to the activity system so claims about advantage, margin, differentiation, or operating change have a visible mechanism.

**What it is NOT:** It is not Five Forces, VRIO, BCG, Ansoff, PESTEL, SWOT/TOWS, Lean waste removal, OKRs, or a valuation model.

**Adjacent concepts:** strategic positioning, activity systems, primary activities, support activities, cost drivers, differentiation drivers, linkages, fit, margin, value proposition, operational effectiveness.

**One-line analogy:** Value Chain analysis opens the operating system of the business and asks which activities make value, cost, and advantage happen.

**Common misconception:** The value chain is not just inbound logistics to outbound logistics. It includes all strategically relevant activities, including support activities, and its strategic power comes from how those activities are configured and linked.

# Value Chain Analysis

## Domain Context

Use Value Chain analysis for business-unit strategy, product/service strategy, operating-model reviews, cost and differentiation diagnosis, margin-improvement work, and critiques of existing strategy memos that claim advantage without showing the activity mechanism. Use public, aggregate, or synthetic examples only. Do not include personal data, customer data, payment data, secrets, confidential deal details, or private business facts in examples or evals.

The method is strongest when the user asks how a business creates value, why its cost or differentiation position differs from competitors, where margin is made or lost, or which activities need to change to support a positioning choice. It is weaker when the question is about industry attractiveness, resource rarity, portfolio allocation, macro trends, growth quadrant selection, task prioritization, or quantified investment value.

Treat the classic activity categories as prompts, not a mandatory org chart. A software company, marketplace, manufacturing firm, professional-services firm, and nonprofit will map activities differently. The task is to identify strategically relevant activities, not to force every business into the same linear diagram.

## Coverage

This skill teaches agents to:

1. Frame the business unit, offering, customer, competitor set, and strategic question.
2. Map primary and support activities at the right level of specificity.
3. Identify cost drivers, differentiation drivers, and margin effects activity by activity.
4. Trace linkages between activities, including trade-offs and reinforcing fit.
5. Compare the activity configuration against rivals, alternatives, or the current baseline.
6. Distinguish operational effectiveness from strategy when an activity is simply a best practice.
7. Convert activity findings into strategic hypotheses, operating changes, or downstream analyses.
8. State assumptions, evidence gaps, and privacy-safe data needed before recommending action.

## Philosophy of the skill

Value Chain analysis is useful because strategy often hides inside words like "better product," "strong brand," "efficient operations," or "great customer experience." Those phrases are not yet strategy. They become strategic only when the agent can name the activities that create the value, the costs attached to them, the linkages between them, and the trade-offs that make the configuration hard to copy without changing the business.

The method is also a guardrail against generic best-practice advice. Integrating best practices can improve execution, but a company does not become distinctive merely by doing ordinary activities competently. A good value-chain analysis asks what activities are configured differently, what those differences do to relative cost or willingness to pay, and how the activity system fits the chosen position.

## Workflow

### 1. Frame the strategic question

Start by naming the unit of analysis and the decision the value-chain map must inform.

```text
Business unit or offering:
Customer segment or use case:
Value proposition:
Competitors or alternatives:
Strategic question:
Cost, differentiation, or margin issue:
Evidence available:
Decision this analysis must inform:
```

Reject vague scopes such as "the company" or "operations" unless the user explicitly wants a first-pass map. Narrow the scope until the activities can be described concretely.

### 2. Map primary and support activities

Use the classic activity groups as a starting checklist, then adapt them to the business model.

| Activity group | What to look for | Example evidence |
| --- | --- | --- |
| Inbound logistics | Inputs, sourcing, receiving, data intake, supplier handoffs | input cost, supplier terms, data quality, lead time, defects |
| Operations | Transformation into the product or service | cycle time, quality, throughput, automation, rework, uptime |
| Outbound logistics | Delivery, fulfillment, deployment, distribution | delivery cost, time to deliver, channel performance, returns |
| Marketing and sales | Demand generation, pricing, sales motion, channel, persuasion | conversion, win rate, CAC, pricing power, channel economics |
| Service | Post-sale support, success, maintenance, retention | support cost, retention, expansion, resolution time, NPS or satisfaction |
| Firm infrastructure | Management systems, planning, finance, legal, governance | overhead, decision speed, compliance cost, resource allocation |
| Human resource management | Hiring, training, incentives, culture, labor model | skill availability, retention, productivity, incentive fit |
| Technology development | Product technology, process technology, data, R&D | roadmap, tooling, patents, learning loops, automation |
| Procurement | Purchasing inputs across the chain | supplier concentration, price, quality, terms, switching cost |

For services, software, platforms, and marketplaces, rename activity rows so the user can see the real system. For example, "operations" may mean onboarding, matching, risk scoring, model training, deployment, professional delivery, or customer workflow execution.

### 3. Attach value and cost to each activity

For each activity, separate description from strategic effect.

```text
Activity:
Current activity design:
Customer value or willingness-to-pay effect:
Cost or capital effect:
Quality, speed, risk, or learning effect:
Metric or evidence:
Relevant competitor or alternative:
Advantage hypothesis:
Uncertainty:
```

Do not call an activity strategic because it exists. It becomes strategically relevant when it changes relative cost, relative value, risk, speed, learning, switching cost, access, quality, or margin.

### 4. Trace linkages and fit

Value-chain analysis is not a list. Look for relationships across activities.

| Linkage question | What it reveals |
| --- | --- |
| Which upstream activity makes a downstream activity cheaper, faster, or more valuable? | Cost and differentiation reinforcement |
| Which activity creates a trade-off that competitors would avoid or find costly? | Strategic positioning and uniqueness |
| Which support activity quietly determines performance in primary activities? | Hidden source of advantage or constraint |
| Which activities are best practices everyone can copy? | Operational effectiveness, not durable strategy by itself |
| Which activities conflict with the stated positioning? | Fit gap or incoherent strategy |

Name at least three linkages before recommending action. If no linkages appear, the output is probably an activity inventory, not a value-chain analysis.

### 5. Compare the activity configuration

Competitive advantage is relative. Compare the activity system against a named benchmark.

```text
Benchmark: competitor / substitute / current baseline / target model
Activity differences:
Cost position difference:
Differentiation difference:
Trade-offs:
Fit or reinforcement:
Activities easy to copy:
Activities hard to copy:
Evidence strength:
```

Do not invent competitor cost structures or activity details. If data is missing, label the comparison as a hypothesis and specify the evidence needed.

### 6. Convert findings into strategic options

Use the value-chain map to propose changes, then route unresolved questions to the right method.

| Finding | Strategic option |
| --- | --- |
| High-cost activity with no customer value effect | Simplify, automate, outsource, redesign, or stop |
| Activity creates high willingness to pay | Protect, amplify, price for it, or connect sales messaging to it |
| Support activity constrains primary activities | Fix incentives, systems, talent, procurement, or governance |
| Activity linkage creates differentiation | Deepen the reinforcing system rather than copying isolated tactics |
| Best-practice gap with no uniqueness | Improve execution, but do not over-claim strategic advantage |
| Trade-off supports positioning | Make the trade-off explicit and align downstream activities |

End with actions, assumptions, and evidence gaps. A value-chain analysis should produce a sharper strategy conversation, not just a diagram.

## Output Template

```text
Value Chain Analysis

Scope:
Strategic question:
Positioning or value proposition:
Competitor/alternative benchmark:

Activity map:
- Primary activities:
- Support activities:

Activity-level findings:
1. Activity:
   Value effect:
   Cost/margin effect:
   Linkages:
   Evidence:
   Advantage hypothesis:

Fit and trade-offs:
- Reinforcing linkages:
- Activities that conflict with positioning:
- Best-practice gaps:
- Distinctive choices:

Recommendations:
1. Change:
   Why this activity matters:
   Evidence needed:
   Downstream method:

Residual uncertainty:
```

## Boundary Rules

| User is really asking for | Use | Why |
| --- | --- | --- |
| Industry attractiveness, rivalry, buyer/supplier power, substitutes, entrants | `porters-five-forces` | External industry structure determines profit pressure; value-chain analysis is internal activity diagnosis. |
| Whether a resource or capability is rare and hard to imitate | `vrio` | VRIO tests resources and capabilities; value-chain analysis maps activities and linkages. |
| Which business units or products should receive capital | `bcg-matrix` | BCG classifies portfolio units; value-chain analysis diagnoses one unit's activity system. |
| Which product-market growth path to pursue | `ansoff-matrix` | Ansoff classifies growth direction; value-chain analysis tests the activity implications. |
| A broad strengths, weaknesses, opportunities, threats inventory | `swot-tows` | SWOT/TOWS turns internal/external factors into options; value-chain analysis decomposes activities. |
| Probability-weighted choice among options | `expected-value` | Expected value compares modeled outcomes; value-chain analysis creates qualitative activity hypotheses. |

## Verification

Before presenting the analysis, check:

- [ ] The unit of analysis is a business unit, offering, service, product, or operating model, not a vague whole-company label.
- [ ] Primary and support activities are adapted to the actual business model.
- [ ] Each important activity includes a value, cost, risk, speed, quality, learning, or margin effect.
- [ ] At least three linkages or fit relationships are named.
- [ ] Competitor or alternative comparison is labeled as evidence-backed or hypothetical.
- [ ] Operational effectiveness improvements are not overstated as distinctive strategy.
- [ ] Recommendations tie back to specific activities and evidence gaps.
- [ ] No private data, customer data, payment data, secrets, or confidential business facts are exposed.

## Do NOT Use When

| Instead of this skill | Use | Why |
| --- | --- | --- |
| Porter's Five Forces | `porters-five-forces` | The user needs external industry profit-pressure structure. |
| VRIO | `vrio` | The user needs resource/capability durability testing. |
| BCG Matrix | `bcg-matrix` | The user needs portfolio allocation across units. |
| Ansoff Matrix | `ansoff-matrix` | The user needs product-market growth path classification. |
| SWOT/TOWS | `swot-tows` | The user needs broad internal/external factor inventory and option generation. |
| Expected Value | `expected-value` | The user needs quantified probability-weighted option comparison. |

## References

- `references/value-chain-analysis-sources.md` - source notes from Harvard Business School's Institute for Strategy & Competitiveness and the HBS publication record for `Competitive Advantage`.
- `references/upstream-displacement-2026-06-07.md` - audit-loop upstream-displacement check for this concept skill.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `reasoning-strategy`
- Domain: `foundations/strategy`
- Scope: Porter's Value Chain analysis for organizations, business units, products, services, operating models, and strategy reviews: map primary and support activities, identify activity-level value and cost drivers, trace linkages and fit across activities, compare the activity system to rivals or alternatives, diagnose cost-leadership and differentiation opportunities, and convert the analysis into strategic hypotheses or operating changes. Excludes external industry profit-pressure diagnosis, resource/capability durability testing, BCG portfolio allocation, Ansoff product-market growth paths, PESTEL macro scanning, OKR execution tracking, Lean waste removal as the primary lens, and standalone financial valuation.

**When to use**
- Map our value chain and show where we create customer value, incur cost, and may have differentiation opportunities.
- Use Porter's Value Chain to analyze this business unit and identify activity-level sources of competitive advantage.
- Review this operating model through primary activities, support activities, linkages, and margin.
- Compare our activity system to competitors and tell me where the cost or differentiation drivers differ.
- Turn these activities into a value-chain analysis without confusing it with Five Forces or VRIO.
- Triggers: `value-chain`, `value-chain-analysis`, `porters-value-chain`, `activity-system-map`

**Not for**
- Analyze buyer power, supplier power, substitutes, entrants, and rivalry for this industry.
- Use VRIO to decide whether our data, brand, process, or supplier network is a sustained competitive advantage.
- Classify our products as stars, cash cows, question marks, or dogs.
- Classify growth ideas as market penetration, market development, product development, or diversification.
- Calculate expected value across these options with probabilities and payoff scenarios.

**Concept**
- Mental model: Value Chain analysis treats competitive advantage as arising from activities and the fit among activities. The primitives are a business unit or offering, a customer value proposition, primary activities, support activities, activity costs, activity value or willingness-to-pay effects, linkages between activities, relative activity configuration versus rivals or alternatives, margin, and strategic choices. The agent decomposes the business into activities, asks how each activity affects cost or differentiation, traces how activities reinforce or undermine each other, then identifies where a different configuration could produce lower cost, higher willingness to pay, or stronger fit.
- Purpose: This skill prevents agents from making strategy recommendations at the slogan level. It forces the agent to show where value and cost are created activity by activity, how activities link together, whether advantage comes from cost position, differentiation, or fit, and which downstream method should test the remaining uncertainty.
- Analogy: A value chain is like opening the back of a clock: the advantage is not the face, but the gears, costs, timing, and linkages that make the clock run differently.
- Common misconception: The common mistake is treating the value chain as a generic supply-chain diagram or org chart. Porter's value chain is an activity-level strategy tool: the activity labels only matter when they reveal value, cost, linkages, fit, margin, and relative difference.

**Grounding**
- Mode: `universal`
- Truth sources: `https://www.isc.hbs.edu/strategy/business-strategy/Pages/the-value-chain.aspx`, `https://www.isc.hbs.edu/strategy/Pages/strategy-explained.aspx`, `https://www.isc.hbs.edu/strategy/business-strategy/Pages/strategic-positioning.aspx`, `https://www.hbs.edu/faculty/Pages/item.aspx?num=191`, `skills/skills/reasoning-strategy/value-chain-analysis/references/value-chain-analysis-sources.md`, `skills/skills/reasoning-strategy/value-chain-analysis/references/upstream-displacement-2026-06-07.md`

**Keywords**
- `value chain analysis`, `Porter's Value Chain`, `activity system`, `primary activities`, `support activities`, `cost drivers`, `differentiation drivers`, `activity linkages`, `strategic fit`, `margin analysis`

<!-- skill-graph-context:end -->
