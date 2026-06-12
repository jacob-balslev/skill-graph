---
name: value-chain-analysis
description: "Use when decomposing how an organization, business unit, product, service, platform, or operating model creates value and cost through Porter's Value Chain and adjacent activity-system lenses. Covers primary and support activities, value configurations, virtual information activities, value-system dependencies, activity-level cost and differentiation drivers, linkages, fit, margin, mapping activities, comparing activity configuration to rivals or alternatives, and diagnosing cost or differentiation opportunities. Do NOT use for industry profit-pressure diagnosis (use porters-five-forces), resource/capability advantage testing (use vrio), durable moat classification (use seven-powers), full strategy-cascade design (use playing-to-win), market-boundary reconstruction (use blue-ocean-strategy), portfolio allocation (use bcg-matrix), product-market growth paths (use ansoff-matrix), macro scanning (use pestel), or quantified option valuation (use expected-value)."
license: MIT
compatibility: "Markdown, strategy memos, operating-model reviews, business-unit strategy, value-chain maps, value-system maps, value-configuration checks, virtual value-chain checks, cost and differentiation analysis"
allowed-tools: Read Grep WebSearch WebFetch
metadata:
  relations: "{\"related\":[\"playing-to-win\",\"seven-powers\",\"blue-ocean-strategy\",\"positioning\",\"porters-five-forces\",\"vrio\",\"swot-tows\",\"expected-value\",\"epistemic-grounding\",\"methodology\"],\"suppresses\":[\"porters-five-forces\",\"expected-value\",\"vrio\",\"swot-tows\",\"bcg-matrix\",\"ansoff-matrix\"],\"verify_with\":[\"epistemic-grounding\",\"methodology\",\"expected-value\"]}"
  subject: reasoning-strategy
  scope: "Porter's Value Chain analysis for organizations, business units, products, services, platforms, operating models, and strategy reviews: frame the business unit and decision, choose the value configuration that fits the business model, map primary and support activities, identify activity-level value and cost drivers, trace linkages and fit across activities and the wider value system, check whether information-heavy businesses need a virtual value-chain lens, compare the activity system to rivals or alternatives, diagnose cost-leadership and differentiation opportunities, and convert the analysis into strategic hypotheses or operating changes. Excludes external industry profit-pressure diagnosis, resource/capability durability testing, durable moat-source classification, full strategy-cascade design, market-boundary reconstruction, BCG portfolio allocation, Ansoff product-market growth paths, PESTEL macro scanning, OKR execution tracking, Lean waste removal as the primary lens, customer-journey mapping as the primary lens, formal ESG/carbon accounting, and standalone financial valuation."
  public: "true"
  taxonomy_domain: foundations/strategy
  stability: stable
  keywords: "[\"value chain analysis\",\"Porter's Value Chain\",\"activity system\",\"primary activities\",\"support activities\",\"linkages\",\"margin\",\"operating model\",\"cost drivers\",\"differentiation drivers\"]"
  triggers: "[\"value-chain\",\"value-chain-analysis\",\"porters-value-chain\",\"activity-system-map\",\"value-system-map\",\"value-configuration\",\"value-shop-analysis\",\"value-network-map\",\"virtual-value-chain\"]"
  examples: "[\"Map our value chain and show where we create customer value, incur cost, and may have differentiation opportunities.\",\"Use Porter's Value Chain to analyze this business unit and identify activity-level sources of competitive advantage.\",\"Review this operating model through primary activities, support activities, linkages, and margin.\",\"Compare our activity system to competitors and tell me where the cost or differentiation drivers differ.\",\"We are a marketplace, not a factory. Decide whether the value-chain template fits and map the activity system that actually drives value.\",\"Map the value system across our suppliers, channels, and the buyer's usage activities.\",\"Analyze our virtual value chain: how information is gathered, organized, selected, synthesized, and distributed.\"]"
  anti_examples: "[\"Analyze buyer power, supplier power, substitutes, entrants, and rivalry for this industry.\",\"Use VRIO to decide whether our data, brand, process, or supplier network is a sustained competitive advantage.\",\"Classify whether our advantage is scale economies, network economies, switching costs, or another power.\",\"Write the full Playing to Win cascade from aspiration to management systems.\",\"Build a Blue Ocean value curve and reconstruct market boundaries.\",\"Classify our products as stars, cash cows, question marks, or dogs.\",\"Classify growth ideas as market penetration, market development, product development, or diversification.\",\"Calculate expected value across these options with probabilities and payoff scenarios.\"]"
  grounding: "{\"subject_matter\":\"Porter's Value Chain as a portable strategy framework for activity-level cost, differentiation, linkage, fit, value-system, and margin analysis, adapted with value configurations and virtual value-chain checks for non-linear and information-heavy business models\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://www.isc.hbs.edu/strategy/business-strategy/Pages/the-value-chain.aspx\",\"https://www.isc.hbs.edu/strategy/Pages/strategy-explained.aspx\",\"https://www.isc.hbs.edu/strategy/business-strategy/Pages/strategic-positioning.aspx\",\"https://www.isc.hbs.edu/strategy/creating-a-successful-strategy/Pages/fit-across-the-value-chain.aspx\",\"https://online.hbs.edu/blog/post/what-is-value-chain-analysis\",\"https://www.hbs.edu/faculty/Pages/item.aspx?num=191\",\"https://www.hbs.edu/faculty/Pages/item.aspx?num=3556\",\"https://hbr.org/1995/11/exploiting-the-virtual-value-chain\",\"https://sms.onlinelibrary.wiley.com/doi/abs/10.1002/%28SICI%291097-0266%28199805%2919%3A5%3C413%3A%3AAID-SMJ946%3E3.0.CO%3B2-C\",\"https://ghgprotocol.org/corporate-value-chain-scope-3-standard\",\"skills/reasoning-strategy/value-chain-analysis/references/value-chain-analysis-sources.md\",\"skills/reasoning-strategy/value-chain-analysis/references/upstream-displacement-2026-06-07.md\"],\"failure_modes\":[\"value_chain_reduced_to_supply_chain_logistics\",\"activity_labels_used_without_cost_or_value_evidence\",\"primary_and_support_activities_treated_as_fixed_org_chart\",\"linear_chain_template_forced_on_value_shop_or_value_network\",\"virtual_information_activities_ignored_for_digital_or_data_rich_business\",\"value_system_upstream_channel_or_buyer_usage_ignored\",\"linkages_and_fit_ignored\",\"broad_functions_not_decomposed_to_decision_relevant_activities\",\"operational_effectiveness_confused_with_strategy\",\"competitive_advantage_claimed_without_relative_activity_comparison\",\"margin_not_connected_to_willingness_to_pay_cost_or_value_capture\",\"ai_generated_activity_map_treated_as_evidence\",\"sustainability_driver_either_omitted_when_material_or_expanded_into_formal_reporting\",\"value_chain_confused_with_vrio_five_forces_seven_powers_playing_to_win_or_blue_ocean\"],\"evidence_priority\":\"general_knowledge_first\"}"
  mental_model: "Value Chain analysis treats competitive advantage as arising from activities and the fit among activities. The primitives are a business unit or offering, a customer value proposition, a value configuration, primary activities, support activities, activity costs, activity value or willingness-to-pay effects, value capture, linkages between activities, the wider value system of suppliers/channels/buyers, virtual information activities when information itself creates value, relative activity configuration versus rivals or alternatives, margin, and strategic choices. The agent chooses the value configuration that fits the business model, maps activities at a useful granularity, asks how each activity affects cost or differentiation, traces how activities reinforce or undermine each other, and identifies where a different configuration could produce lower cost, higher willingness to pay, better value capture, or stronger fit."
  purpose: "This skill prevents agents from making strategy recommendations at the slogan level. It forces the agent to show where value and cost are created activity by activity, how activities link together, whether advantage comes from cost position, differentiation, value-system coordination, virtual information value, or fit, and which downstream method should test the remaining uncertainty."
  concept_boundary: "Value Chain analysis is activity-system diagnosis. It is not Porter's Five Forces external industry analysis, VRIO resource/capability durability testing, Seven Powers moat-source classification, Playing to Win strategy-cascade design, Blue Ocean market-boundary reconstruction, BCG portfolio allocation, Ansoff growth-path selection, PESTEL macro scanning, Lean waste removal as the main lens, customer-journey mapping as the main lens, OKR execution management, ESG/carbon accounting, or a DCF valuation. Those methods can feed or follow the analysis, but they do not replace the activity-level value and cost map."
  analogy: "A value chain is like opening the back of a clock: the advantage is not the face, but the gears, costs, timing, sensors, and linkages that make the clock run differently."
  misconception: "The common mistake is treating the value chain as a generic supply-chain diagram or org chart. Porter's value chain is an activity-level strategy tool: the activity labels only matter when they reveal value, cost, linkages, fit, margin, and relative difference. For services, platforms, marketplaces, and information-heavy businesses, the fix is not merely renaming rows; first decide whether the business behaves like a chain, shop, network, or hybrid, then add a virtual value-chain lens if information itself creates marketspace value."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/reasoning-strategy/value-chain-analysis/SKILL.md
  skill_graph_export_description: shortened for Agent Skills 1024-character description limit; canonical source keeps the full routing contract
  skill_graph_canonical_description_length: "1103"
---

## Concept of the skill

**What it is:** Value Chain analysis is Michael Porter's activity-level strategy framework for understanding how a firm creates value and incurs cost. It decomposes a business into strategically relevant activities, then asks where cost advantage, differentiation, linkages, fit, value-system coordination, and margin create or weaken competitive advantage.

**Mental model:** Pick the unit of analysis, choose the value configuration, map the activities, then trace value, cost, margin, and linkages. Advantage is not usually one isolated activity; it is often a different configuration of activities that raises willingness to pay, lowers relative cost, captures value better, coordinates better across the value system, or reinforces a distinctive positioning.

**Why it exists:** Agents often jump from "we need strategy" to generic recommendations. This skill forces the work down to the activity system so claims about advantage, margin, differentiation, or operating change have a visible mechanism.

**What it is NOT:** It is not Five Forces, VRIO, Seven Powers, Playing to Win, Blue Ocean Strategy, BCG, Ansoff, PESTEL, SWOT/TOWS, Lean waste removal, customer-journey mapping, ESG reporting, OKRs, or a valuation model.

**Adjacent concepts:** strategic positioning, activity systems, value configurations, value system, virtual value chain, marketspace, primary activities, support activities, cost drivers, differentiation drivers, linkages, fit, margin, value capture, value proposition, operational effectiveness.

**One-line analogy:** Value Chain analysis opens the operating system of the business and asks which activities make value, cost, and advantage happen.

**Common misconception:** The value chain is not just inbound logistics to outbound logistics. It includes all strategically relevant activities, including support activities, and its strategic power comes from how those activities are configured and linked. For non-manufacturing businesses, the classic chain is a prompt, not a cage.

# Value Chain Analysis

## Domain Context

Use Value Chain analysis for business-unit strategy, product/service strategy, platform or marketplace operating-model reviews, cost and differentiation diagnosis, margin-improvement work, and critiques of strategy memos that claim advantage without showing the activity mechanism. Use public, aggregate, or synthetic examples only. Do not include personal data, customer data, payment data, secrets, confidential deal details, or private business facts in examples or evals.

The method is strongest when the user asks how a business creates value, why its cost or differentiation position differs from competitors, where margin is made or lost, which activities need to change to support a positioning choice, or how upstream suppliers, channels, partners, and buyers affect the firm's economics. It is weaker when the question is about industry attractiveness, resource rarity, durable moat type, full strategy-cascade design, market-boundary reconstruction, portfolio allocation, macro trends, growth quadrant selection, task prioritization, quantified investment value, customer emotions across a journey, or compliant emissions reporting.

Treat classic primary/support activity categories as prompts, not a mandatory org chart. A software company, marketplace, manufacturing firm, professional-services firm, hospital, financial-services firm, public-sector program, and nonprofit will map activities differently. The task is to identify strategically relevant activities at the level where cost, value, fit, and margin can be discussed, not to force every business into the same linear diagram.

For digital or information-rich businesses, also ask whether information captured in the physical chain is merely a support input or has become a virtual value chain that creates customer value in the marketspace. For platform and ecosystem businesses, map interaction orchestration, trust, liquidity, governance, data flows, and participant incentives rather than forcing everything into a sequential pipeline.

Use web research, AI research agents, and source-gathering tools as evidence aids, not as substitutes for the method. A generated activity map is a hypothesis until supported by public sources, user-provided facts, operating metrics, interviews, benchmark evidence, or direct observation. When using external research, cite the source type and keep competitor-cost claims explicitly hypothetical unless verified.

Sustainability, emissions, resilience, and regulatory exposure belong in this skill only when they materially affect an activity's cost, risk, differentiation, buyer value, or value-system coordination. Do not turn the analysis into carbon accounting, ESG disclosure, or a Scope 3 inventory.

## Coverage

This skill teaches agents to:

1. Frame the business unit, offering, customer, competitor set, and strategic decision.
2. Choose the right value configuration: chain, shop, network, or a named hybrid.
3. Check whether a digital or data-rich business also needs a virtual value-chain lens.
4. Map primary and support activities at the right level of specificity for that configuration.
5. Decompose broad functions into decision-relevant sub-activities where value and cost can be discussed.
6. Identify cost drivers, differentiation drivers, value-capture effects, and margin effects activity by activity.
7. Trace linkages between activities, including trade-offs, reinforcing fit, information flows, network effects, and value-system dependencies.
8. Compare the activity configuration against rivals, alternatives, internal benchmarks, or the current baseline.
9. Distinguish operational effectiveness from strategy when an activity is simply a best practice.
10. Convert activity findings into strategic hypotheses, operating changes, or downstream analyses.
11. State assumptions, evidence gaps, freshness limits, privacy boundaries, and data needed before recommending action.

## Philosophy of the skill

Value Chain analysis is useful because strategy often hides inside words like "better product," "strong brand," "efficient operations," or "great customer experience." Those phrases are not yet strategy. They become strategic only when the agent can name the activities that create the value, the costs attached to them, the linkages between them, and the trade-offs that make the configuration hard to copy without changing the business.

The method is also a guardrail against generic best-practice advice. Integrating best practices can improve execution, but a company does not become distinctive merely by doing ordinary activities competently. A good value-chain analysis asks what activities are configured differently, what those differences do to relative cost or willingness to pay, and how the activity system fits the chosen position.

The second guardrail is configurational honesty. Porter's classic chain works best for long-linked production and delivery systems. Services, expert problem-solving firms, platforms, and marketplaces often create value through shops or networks rather than a simple sequence. If the agent forces every business into inbound logistics -> operations -> outbound logistics, it may produce a tidy diagram that hides the real source of advantage.

The third guardrail is evidence discipline. AI-generated activity maps, public web summaries, and benchmark claims can help the agent draft hypotheses, but they do not prove strategic effect. The analysis must separate activity description from evidence-backed value, cost, linkage, and margin effects.

## Workflow

### 0. Choose the value configuration

Before mapping activities, decide which value-creation logic the business actually uses. Porter's sequential value chain remains the anchor, but strategy literature generalizes firm-level value creation into three value configurations: chain, shop, and network. Most real firms are hybrids; name the dominant configuration and any secondary logic.

| Configuration | Value-creation logic | Primary activities usually look like | Common fits |
| --- | --- | --- | --- |
| Value chain | Transform inputs into outputs in a repeatable sequence | inbound logistics, operations, outbound logistics, marketing and sales, service | manufacturing, CPG, standardized fulfillment, repeatable digital delivery |
| Value shop | Solve a unique customer or client problem through iterative expertise | problem finding, problem solving, choice of solution, execution, control/evaluation | consulting, law, medicine, engineering, R&D, custom software, complex professional services |
| Value network | Mediate exchanges or relationships among interdependent participants | network promotion and contracting, service provisioning, infrastructure operation, trust/safety, matching, payments | marketplaces, platforms, telecom, payment networks, exchanges, insurance |

If the business is a value shop or value network, say so and adapt the activity model. A value-network analysis that only renames logistics rows will miss participant acquisition, liquidity, matching quality, governance, trust, safety, payments, and two-sided economics. A value-shop analysis that only renames operations will miss diagnosis quality, expertise allocation, reputation, and learning loops.

For digital, data-rich, or digitally transformed businesses, add a virtual value-chain check. This is not a fourth value configuration and not a generic "use technology" recommendation; it asks whether information captured from activities has become a value-creating marketspace asset. Use Rayport and Sviokla's five information value-adding steps as a prompt: gather information, organize it, select what is valuable, synthesize it into a usable product/service/insight, and distribute it through information-based channels. Then identify the maturity stage: visibility, where information helps managers see and coordinate the physical value chain; mirroring capability, where virtual activities substitute for or parallel physical activities; or new customer relationships, where information creates new marketspace value, offerings, or relationships. Keep the physical and virtual chains distinct, then analyze how they reinforce or cannibalize each other.

### 1. Frame the strategic question

Start by naming the unit of analysis and the decision the value-chain map must inform.

```text
Business unit or offering:
Value configuration and rationale:
Virtual value-chain lens needed? Why / why not:
Customer segment or use case:
Value proposition:
Competitors or alternatives:
Current-state or target-state map:
Strategic question:
Cost, differentiation, value-capture, or margin issue:
Evidence available:
Decision this analysis must inform:
```

Reject vague scopes such as "the company" or "operations" unless the user explicitly wants a first-pass map. Narrow the scope until the activities can be described concretely. If the user wants both current state and target state, keep them separate; do not let an aspirational operating model blur the current evidence.

### 2. Map primary and support activities

Use the classic activity groups as a starting checklist, then adapt them to the business model and value configuration.

| Activity group | What to look for | Example evidence |
| --- | --- | --- |
| Inbound logistics | Inputs, sourcing, receiving, data intake, supplier handoffs | input cost, supplier terms, data quality, lead time, defects |
| Operations | Transformation into the product or service | cycle time, quality, throughput, automation, rework, uptime |
| Outbound logistics | Delivery, fulfillment, deployment, distribution | delivery cost, time to deliver, channel performance, returns |
| Marketing and sales | Demand generation, pricing, sales motion, channel, persuasion | conversion, win rate, CAC, price realization, channel economics |
| Service | Post-sale support, success, maintenance, retention | support cost, retention, expansion, resolution time, NPS or satisfaction |
| Firm infrastructure | Management systems, planning, finance, legal, governance | overhead, decision speed, compliance cost, resource allocation |
| Human resource management | Hiring, training, incentives, culture, labor model | skill availability, retention, productivity, incentive fit |
| Technology development | Product technology, process technology, data, R&D | roadmap, tooling, patents, learning loops, automation |
| Procurement | Purchasing inputs across the chain | supplier concentration, price, quality, terms, switching cost |

For services, software, platforms, and marketplaces, rename or replace rows so the user can see the real system. For example, operations may mean onboarding, matching, risk scoring, model training, deployment, professional delivery, or customer workflow execution. For a value shop, primary activities may be diagnosis, solution design, delivery, and evaluation. For a value network, primary activities may be participant acquisition, participant retention, matching and discovery, trust and safety, payments, infrastructure operations, monetization, and ecosystem governance.

Break broad departmental functions into specific, measurable activities when the function is too coarse for a decision. Instead of a single "Marketing" row, separate paid acquisition, content marketing, SEO, events, sales enablement, community, brand advertising, pricing, and channel management when those sub-activities have distinct cost drivers, value effects, or improvement levers. The right granularity is the level where a strategic or operating decision can be made.

For platform and multi-sided businesses, map the activities that enable interactions between sides rather than a linear transformation sequence. Typical platform activities include side acquisition, side retention, matching and discovery, trust and safety, data and intelligence, monetization, APIs/developer tools, partner programs, dispute resolution, and platform rules.

### 3. Attach value, cost, and evidence to each activity

For each important activity, separate description from strategic effect.

```text
Activity:
Current activity design:
Target activity design, if relevant:
Customer value or willingness-to-pay effect:
Price realization or value-capture effect:
Cost, capital, or working-capital effect:
Quality, speed, risk, learning, sustainability, or resilience effect:
Metric or evidence:
Relevant competitor, substitute, or baseline:
Evidence strength:
Advantage hypothesis:
Uncertainty:
```

Do not call an activity strategic because it exists. It becomes strategically relevant when it changes relative cost, relative value, risk, speed, learning, switching cost, access, trust, quality, value capture, or margin.

Check these driver families:

| Driver family | Useful questions |
| --- | --- |
| Cost drivers | Does the activity change scale, learning, capacity utilization, complexity, location, supplier terms, process technology, automation, energy, emissions, compliance, rework, or working capital? |
| Differentiation drivers | Does the activity improve performance, reliability, speed, convenience, customization, brand experience, expert quality, integrations, trust, security, or customer outcomes? |
| Learning and data drivers | Does the activity generate better data, faster feedback, better matching, better models, or operational learning that compounds? |
| Value-system drivers | Does supplier, channel, partner, or buyer behavior change the economics of this activity? |
| Platform and network drivers | Does the activity affect liquidity, matching quality, participant incentives, governance, trust/safety, ecosystem health, or network effects? |
| Sustainability and resilience drivers | Does the activity create material emissions exposure, climate or geopolitical risk, circularity opportunities, compliance cost, supplier resilience issues, or buyer-valued sustainability differentiation? |

Use directional economics when perfect activity-based costing is unavailable. A rough but explicit estimate is better than a polished map with no economics, as long as the uncertainty is labeled.

### 4. Trace linkages, fit, and the value system

Value-chain analysis is not a list. Look for relationships across activities and across firm boundaries.

| Linkage question | What it reveals |
| --- | --- |
| Which upstream activity makes a downstream activity cheaper, faster, safer, or more valuable? | Cost and differentiation reinforcement |
| Which support activity quietly determines performance in primary activities? | Hidden source of advantage or constraint |
| Which activity creates a trade-off competitors would avoid or find costly? | Strategic positioning and uniqueness |
| Which activities are best practices everyone can copy? | Operational effectiveness, not durable strategy by itself |
| Which activities conflict with the stated positioning? | Fit gap or incoherent strategy |
| Which supplier, channel, partner, or buyer activity changes your economics? | Value-system leverage, coordination opportunity, or margin leakage |
| Which buyer usage activity determines willingness to pay? | The real source of customer value beyond the sale |
| Which activity reinforces data, learning, network liquidity, trust, or reputation? | Compounding advantage or fragile dependency |
| Which virtual information activity reinforces or substitutes for a physical activity? | Digital mirroring, marketspace value, or cannibalization |

Porter's value-chain framing places the firm inside a larger value system: supplier chains upstream, channel chains downstream, and buyer chains or usage activities beyond the sale. Advantage may come from coordinating across those boundaries, not only from optimizing inside the firm. Name at least three linkages before recommending action. If no linkages appear, the output is probably an activity inventory, not a value-chain analysis.

### 5. Compare the activity configuration

Competitive advantage is relative. Compare the activity system against a named benchmark.

```text
Benchmark: competitor / substitute / current baseline / target model / internal best site
Activity differences:
Cost position difference:
Differentiation difference:
Value-capture or margin difference:
Trade-offs:
Fit or reinforcement:
Activities easy to copy:
Activities hard to copy:
Evidence strength:
```

Do not invent competitor cost structures or activity details. Use public filings, analyst reports, product experience, pricing, hiring patterns, supplier disclosures, customer reviews, benchmark studies, or user-provided evidence where available. If data is missing, label the comparison as a hypothesis and specify the evidence needed.

When assumptions are volatile, add a lightweight freshness note rather than a full monitoring program:

```text
Analysis date:
Review horizon:
Trigger for re-analysis:
Metrics or assumptions to watch:
```

### 6. Convert findings into strategic options

Use the value-chain map to propose changes, then route unresolved questions to the right method.

| Finding | Strategic option |
| --- | --- |
| High-cost activity with no customer value effect | Simplify, automate, outsource, redesign, standardize, or stop |
| Activity creates high willingness to pay | Protect, amplify, price for it, or connect sales messaging to it |
| Activity captures value poorly despite creating value | Redesign pricing, packaging, contracts, channels, or monetization |
| Support activity constrains primary activities | Fix incentives, systems, talent, procurement, governance, or decision rights |
| Activity linkage creates differentiation | Deepen the reinforcing system rather than copying isolated tactics |
| Value-system linkage creates margin leakage or slack | Coordinate, partner, integrate, renegotiate, or redesign handoffs |
| Network activity drives liquidity or trust | Improve matching, governance, trust/safety, onboarding, or participant incentives |
| Virtual information activity creates new value | Build the information product, distribution channel, or customer relationship deliberately |
| Sustainability or resilience driver is material | Redesign the activity, sourcing, logistics, or compliance posture; route formal accounting elsewhere |
| Best-practice gap with no uniqueness | Improve execution, but do not over-claim strategic advantage |
| Trade-off supports positioning | Make the trade-off explicit and align downstream activities |

End with actions, assumptions, and evidence gaps. A value-chain analysis should produce a sharper strategy conversation, not just a diagram.

### 7. Route downstream uncertainty

Value-chain analysis often produces hypotheses that need another method.

| Remaining question | Downstream method |
| --- | --- |
| Is the industry profit pool attractive enough? | `porters-five-forces` |
| Is a needed resource or capability durable? | `vrio` |
| Does the activity system indicate a durable moat type? | `seven-powers` |
| Does the activity system fit the overall strategy choices? | `playing-to-win` |
| Should the company reconstruct market boundaries or target noncustomers? | `blue-ocean-strategy` |
| Which option has the best probability-weighted payoff? | `expected-value` |
| Are claims properly sourced and uncertainty labeled? | `epistemic-grounding` |

Do not switch frameworks mid-answer without telling the user. Finish the activity-level diagnosis first, then hand off the unresolved question.

## Output Template

```text
Value Chain Analysis

Scope:
Value configuration and rationale:
Virtual value-chain lens, if relevant:
Strategic question:
Positioning or value proposition:
Competitor/alternative benchmark:
Analysis date / review horizon:

Activity map:
- Primary activities:
- Support activities:
- Value-system dependencies:
- Virtual information activities, if relevant:

Activity-level findings:
1. Activity:
   Current design:
   Value / willingness-to-pay effect:
   Value-capture effect:
   Cost / capital / margin effect:
   Linkages:
   Evidence:
   Evidence strength:
   Advantage hypothesis:
   Uncertainty:

Fit, trade-offs, and value system:
- Reinforcing linkages:
- Value-system linkages:
- Virtual/physical linkages:
- Activities that conflict with positioning:
- Best-practice gaps:
- Distinctive choices:

Recommendations:
1. Change:
   Why this activity matters:
   Expected value/cost/margin effect:
   Evidence needed:
   Downstream method:

Residual uncertainty:
```

## Boundary Rules

| User is really asking for | Use | Why |
| --- | --- | --- |
| Industry attractiveness, rivalry, buyer/supplier power, substitutes, entrants | `porters-five-forces` | External industry structure determines profit pressure; value-chain analysis is internal activity diagnosis. |
| Whether a resource or capability is rare and hard to imitate | `vrio` | VRIO tests resources and capabilities; value-chain analysis maps activities and linkages. |
| Whether an activity-based benefit is a durable moat or power | `seven-powers` | Seven Powers classifies durable power sources; value-chain analysis maps the activities that may create the benefit. |
| A full strategy cascade from aspiration to management systems | `playing-to-win` | Playing to Win formulates the integrated strategy choices; value-chain analysis diagnoses activity-level advantage that can feed the cascade. |
| Reconstructing market boundaries, noncustomers, or a value curve | `blue-ocean-strategy` | Blue Ocean Strategy owns value innovation and market-boundary reconstruction; value-chain analysis diagnoses the activity system and economics. |
| Which business units or products should receive capital | `bcg-matrix` | BCG classifies portfolio units; value-chain analysis diagnoses one unit's activity system. |
| Which product-market growth path to pursue | `ansoff-matrix` | Ansoff classifies growth direction; value-chain analysis tests the activity implications. |
| A broad strengths, weaknesses, opportunities, threats inventory | `swot-tows` | SWOT/TOWS turns internal/external factors into options; value-chain analysis decomposes activities. |
| Probability-weighted choice among options | `expected-value` | Expected value compares modeled outcomes; value-chain analysis creates qualitative activity hypotheses. |
| Process-flow waste removal, takt-time work, kaizen events, or detailed value-stream mapping | Lean or value-stream mapping method, if available | Value-chain analysis is strategic and cross-activity; Lean owns detailed waste removal inside process flows. |
| Carbon inventory, emissions reporting, or formal Scope 3 accounting | ESG/carbon accounting method, if available | This skill may flag sustainability as an activity driver, but it does not calculate a compliant emissions inventory. |
| Customer touchpoint emotions, service blueprinting, or journey pain points | Customer-journey or service-design method, if available | Value-chain analysis is inside-out activity economics; journey mapping is outside-in experience flow. |

## Verification

Before presenting the analysis, check:

- [ ] The unit of analysis is a business unit, offering, service, product, platform, or operating model, not a vague whole-company label.
- [ ] The value configuration is named and the activity map is adapted to it.
- [ ] A virtual value-chain lens is included only when information itself creates or distributes value.
- [ ] Current-state and target-state activity claims are kept separate.
- [ ] Broad functions are decomposed into decision-relevant activities where value and cost can be discussed.
- [ ] Primary and support activities are adapted to the actual business model.
- [ ] Each important activity includes a value, cost, risk, speed, quality, learning, sustainability, value-capture, or margin effect.
- [ ] At least three linkages or fit relationships are named.
- [ ] Value-system dependencies with suppliers, channels, partners, or buyer usage activities are considered where relevant.
- [ ] Competitor or alternative comparison is labeled as evidence-backed or hypothetical.
- [ ] AI-generated or web-researched claims are treated as source leads or hypotheses until evidence is cited.
- [ ] Operational effectiveness improvements are not overstated as distinctive strategy.
- [ ] Sustainability or emissions appear only as material activity-level drivers, not as a formal reporting framework.
- [ ] Recommendations tie back to specific activities, economics, linkages, and evidence gaps.
- [ ] An analysis date, review horizon, or re-analysis trigger is included when assumptions are volatile.
- [ ] No private data, customer data, payment data, secrets, or confidential business facts are exposed.

## Do NOT Use When

| Instead of this skill | Use | Why |
| --- | --- | --- |
| Porter's Five Forces | `porters-five-forces` | The user needs external industry profit-pressure structure. |
| VRIO | `vrio` | The user needs resource/capability durability testing. |
| Seven Powers | `seven-powers` | The user needs durable moat-source classification with benefit-plus-barrier testing. |
| Playing to Win | `playing-to-win` | The user needs the full strategy cascade, not just activity-level diagnosis. |
| Blue Ocean Strategy | `blue-ocean-strategy` | The user needs market-boundary reconstruction and value-curve creation. |
| BCG Matrix | `bcg-matrix` | The user needs portfolio allocation across units. |
| Ansoff Matrix | `ansoff-matrix` | The user needs product-market growth path classification. |
| SWOT/TOWS | `swot-tows` | The user needs broad internal/external factor inventory and option generation. |
| Expected Value | `expected-value` | The user needs quantified probability-weighted option comparison. |

## References

- `references/value-chain-analysis-sources.md` - source notes from Harvard Business School's Institute for Strategy & Competitiveness and the HBS publication record for `Competitive Advantage`.
- `references/upstream-displacement-2026-06-07.md` - audit-loop upstream-displacement check for this concept skill.
- Harvard Business School Institute for Strategy & Competitiveness, "The Value Chain." https://www.isc.hbs.edu/strategy/business-strategy/Pages/the-value-chain.aspx
- Harvard Business School Institute for Strategy & Competitiveness, "Fit Across the Value Chain." https://www.isc.hbs.edu/strategy/creating-a-successful-strategy/Pages/fit-across-the-value-chain.aspx
- Harvard Business School faculty publication record for Rayport and Sviokla, "Exploiting the Virtual Value Chain." https://www.hbs.edu/faculty/Pages/item.aspx?num=3556
- Rayport, Jeffrey F., and J. J. Sviokla. "Exploiting the Virtual Value Chain." Harvard Business Review, November-December 1995. https://hbr.org/1995/11/exploiting-the-virtual-value-chain
- Stabell, C. B., and Fjeldstad, O. D. "Configuring Value for Competitive Advantage: On Chains, Shops, and Networks." Strategic Management Journal, 19(5), 413-437. https://sms.onlinelibrary.wiley.com/doi/abs/10.1002/%28SICI%291097-0266%28199805%2919%3A5%3C413%3A%3AAID-SMJ946%3E3.0.CO%3B2-C
- GHG Protocol, "Corporate Value Chain (Scope 3) Standard." https://ghgprotocol.org/corporate-value-chain-scope-3-standard

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `reasoning-strategy`
- Public: `true`
- Domain: `foundations/strategy`
- Scope: Porter's Value Chain analysis for organizations, business units, products, services, platforms, operating models, and strategy reviews: frame the business unit and decision, choose the value configuration that fits the business model, map primary and support activities, identify activity-level value and cost drivers, trace linkages and fit across activities and the wider value system, check whether information-heavy businesses need a virtual value-chain lens, compare the activity system to rivals or alternatives, diagnose cost-leadership and differentiation opportunities, and convert the analysis into strategic hypotheses or operating changes. Excludes external industry profit-pressure diagnosis, resource/capability durability testing, durable moat-source classification, full strategy-cascade design, market-boundary reconstruction, BCG portfolio allocation, Ansoff product-market growth paths, PESTEL macro scanning, OKR execution tracking, Lean waste removal as the primary lens, customer-journey mapping as the primary lens, formal ESG/carbon accounting, and standalone financial valuation.

**When to use**
- Map our value chain and show where we create customer value, incur cost, and may have differentiation opportunities.
- Use Porter's Value Chain to analyze this business unit and identify activity-level sources of competitive advantage.
- Review this operating model through primary activities, support activities, linkages, and margin.
- Compare our activity system to competitors and tell me where the cost or differentiation drivers differ.
- We are a marketplace, not a factory. Decide whether the value-chain template fits and map the activity system that actually drives value.
- Map the value system across our suppliers, channels, and the buyer's usage activities.
- Analyze our virtual value chain: how information is gathered, organized, selected, synthesized, and distributed.
- Triggers: `value-chain`, `value-chain-analysis`, `porters-value-chain`, `activity-system-map`, `value-system-map`, `value-configuration`, `value-shop-analysis`, `value-network-map`, `virtual-value-chain`

**Not for**
- Analyze buyer power, supplier power, substitutes, entrants, and rivalry for this industry.
- Use VRIO to decide whether our data, brand, process, or supplier network is a sustained competitive advantage.
- Classify whether our advantage is scale economies, network economies, switching costs, or another power.
- Write the full Playing to Win cascade from aspiration to management systems.
- Build a Blue Ocean value curve and reconstruct market boundaries.
- Classify our products as stars, cash cows, question marks, or dogs.
- Classify growth ideas as market penetration, market development, product development, or diversification.
- Calculate expected value across these options with probabilities and payoff scenarios.

**Related skills**
- Verify with: `epistemic-grounding`, `methodology`, `expected-value`
- Related: `playing-to-win`, `seven-powers`, `blue-ocean-strategy`, `positioning`, `porters-five-forces`, `vrio`, `swot-tows`, `expected-value`, `epistemic-grounding`, `methodology`

**Concept**
- Mental model: Value Chain analysis treats competitive advantage as arising from activities and the fit among activities. The primitives are a business unit or offering, a customer value proposition, a value configuration, primary activities, support activities, activity costs, activity value or willingness-to-pay effects, value capture, linkages between activities, the wider value system of suppliers/channels/buyers, virtual information activities when information itself creates value, relative activity configuration versus rivals or alternatives, margin, and strategic choices. The agent chooses the value configuration that fits the business model, maps activities at a useful granularity, asks how each activity affects cost or differentiation, traces how activities reinforce or undermine each other, and identifies where a different configuration could produce lower cost, higher willingness to pay, better value capture, or stronger fit.
- Purpose: This skill prevents agents from making strategy recommendations at the slogan level. It forces the agent to show where value and cost are created activity by activity, how activities link together, whether advantage comes from cost position, differentiation, value-system coordination, virtual information value, or fit, and which downstream method should test the remaining uncertainty.
- Boundary: Value Chain analysis is activity-system diagnosis. It is not Porter's Five Forces external industry analysis, VRIO resource/capability durability testing, Seven Powers moat-source classification, Playing to Win strategy-cascade design, Blue Ocean market-boundary reconstruction, BCG portfolio allocation, Ansoff growth-path selection, PESTEL macro scanning, Lean waste removal as the main lens, customer-journey mapping as the main lens, OKR execution management, ESG/carbon accounting, or a DCF valuation. Those methods can feed or follow the analysis, but they do not replace the activity-level value and cost map.
- Analogy: A value chain is like opening the back of a clock: the advantage is not the face, but the gears, costs, timing, sensors, and linkages that make the clock run differently.
- Common misconception: The common mistake is treating the value chain as a generic supply-chain diagram or org chart. Porter's value chain is an activity-level strategy tool: the activity labels only matter when they reveal value, cost, linkages, fit, margin, and relative difference. For services, platforms, marketplaces, and information-heavy businesses, the fix is not merely renaming rows; first decide whether the business behaves like a chain, shop, network, or hybrid, then add a virtual value-chain lens if information itself creates marketspace value.

**Grounding**
- Mode: `universal`
- Truth sources: `https://www.isc.hbs.edu/strategy/business-strategy/Pages/the-value-chain.aspx`, `https://www.isc.hbs.edu/strategy/Pages/strategy-explained.aspx`, `https://www.isc.hbs.edu/strategy/business-strategy/Pages/strategic-positioning.aspx`, `https://www.isc.hbs.edu/strategy/creating-a-successful-strategy/Pages/fit-across-the-value-chain.aspx`, `https://online.hbs.edu/blog/post/what-is-value-chain-analysis`, `https://www.hbs.edu/faculty/Pages/item.aspx?num=191`, `https://www.hbs.edu/faculty/Pages/item.aspx?num=3556`, `https://hbr.org/1995/11/exploiting-the-virtual-value-chain`, `https://sms.onlinelibrary.wiley.com/doi/abs/10.1002/%28SICI%291097-0266%28199805%2919%3A5%3C413%3A%3AAID-SMJ946%3E3.0.CO%3B2-C`, `https://ghgprotocol.org/corporate-value-chain-scope-3-standard`, `skills/reasoning-strategy/value-chain-analysis/references/value-chain-analysis-sources.md`, `skills/reasoning-strategy/value-chain-analysis/references/upstream-displacement-2026-06-07.md`

**Keywords**
- `value chain analysis`, `Porter's Value Chain`, `activity system`, `primary activities`, `support activities`, `linkages`, `margin`, `operating model`, `cost drivers`, `differentiation drivers`

<!-- skill-graph-context:end -->
