---
name: three-horizons
description: "Use when balancing an innovation, growth, transformation, or venture portfolio across McKinsey's Three Horizons: Horizon 1 current core businesses, Horizon 2 emerging growth businesses, and Horizon 3 future options. Covers concurrent portfolio balance, resource allocation, evidence maturity, governance, metrics by horizon, transitions from option to emerging business to core, and the risk that short-term core demands starve future growth. Do NOT use for BCG growth-share portfolio allocation (use bcg-matrix), Ansoff product-market growth path selection (use ansoff-matrix), Blue Ocean value-curve redesign (use blue-ocean-strategy), OKR goal-setting (use okrs), or quantified probability-weighted valuation (use expected-value). Do NOT use for Classify our business units as stars, cash cows, question marks, or dogs by market growth and relative market share. Do NOT use for Use Ansoff to choose between market penetration, market development, product development, and diversification."
license: MIT
compatibility: "Markdown, innovation portfolio reviews, corporate growth strategy, transformation roadmaps, venture portfolio planning, R&D portfolio reviews"
allowed-tools: Read Grep WebSearch WebFetch
metadata:
  relations: "{\"related\":[\"ansoff-matrix\",\"bcg-matrix\",\"blue-ocean-strategy\",\"playing-to-win\",\"expected-value\",\"okrs\",\"swot-tows\",\"value-chain-analysis\",\"epistemic-grounding\",\"methodology\"],\"suppresses\":[\"bcg-matrix\",\"ansoff-matrix\",\"blue-ocean-strategy\",\"okrs\",\"expected-value\",\"playing-to-win\"],\"verify_with\":[\"epistemic-grounding\",\"methodology\",\"expected-value\"]}"
  subject: reasoning-strategy
  scope: "Three Horizons innovation and growth portfolio analysis for companies, business units, product portfolios, R&D portfolios, transformation programs, and venture pipelines: classify initiatives as Horizon 1 current core, Horizon 2 emerging growth, or Horizon 3 future option; balance current performance with future opportunity creation; match governance, metrics, evidence, resources, and decision rights to each horizon; identify starvation, gap, and transition risks; and convert the portfolio view into rebalance actions. Excludes BCG growth-share allocation, Ansoff product-market growth-path selection, Blue Ocean value-curve redesign, standalone OKR planning, quantified expected-value valuation, generic roadmap sequencing, and treating horizons as a fixed calendar backlog."
  public: "true"
  taxonomy_domain: foundations/strategy
  stability: stable
  keywords: "[\"three horizons\",\"horizons of growth\",\"innovation portfolio\",\"growth portfolio\",\"horizon 1\",\"horizon 2\",\"horizon 3\",\"core adjacent transformational\",\"future growth options\",\"portfolio balance\"]"
  triggers: "[\"three-horizons\",\"three-horizons-framework\",\"horizons-of-growth\",\"h1-h2-h3\",\"innovation-portfolio\"]"
  examples: "[\"Use Three Horizons to review our innovation portfolio and show whether current core work is starving future growth.\",\"Use the Three Horizons framework to map these growth initiatives into Horizon 1 current core, Horizon 2 emerging growth, and Horizon 3 future options, then recommend rebalance actions.\",\"Build a Three Horizons view for our product roadmap: core optimization, emerging businesses, and future options.\",\"Review this R&D portfolio with Horizon 1, Horizon 2, and Horizon 3 governance and metrics.\",\"We have too many incremental bets and no future options. Use Three Horizons to diagnose the gap.\"]"
  anti_examples: "[\"Classify our business units as stars, cash cows, question marks, or dogs by market growth and relative market share.\",\"Use Ansoff to choose between market penetration, market development, product development, and diversification.\",\"Use Blue Ocean Strategy to create a strategy canvas and ERRC grid for this category.\",\"Write quarterly OKRs for the innovation team.\",\"Use expected-value analysis to compare these investment options with probabilities, payoffs, and scenario values.\"]"
  grounding: "{\"subject_matter\":\"Three Horizons as a portable innovation and growth portfolio framework\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://www.mckinsey.com/capabilities/strategy-and-corporate-finance/our-insights/enduring-ideas-the-three-horizons-of-growth\",\"https://www.mckinsey.com/capabilities/growth-marketing-and-sales/our-insights/now-new-next-how-growth-champions-create-new-value\",\"https://www.internationalfuturesforum.com/world-model-three-horizons\",\"https://www.internationalfuturesforum.com/transformative-innovation\",\"skills/skills/reasoning-strategy/three-horizons/references/three-horizons-sources.md\",\"skills/skills/reasoning-strategy/three-horizons/references/upstream-displacement-2026-06-09.md\"],\"failure_modes\":[\"horizons_treated_as_sequential_calendar_phases\",\"horizon_one_cash_engine_neglected_or_demonized\",\"horizon_two_starved_between_core_demands_and_future_theater\",\"horizon_three_ideas_scaled_without_evidence_or_options_logic\",\"same_metrics_and_governance_used_for_all_horizons\",\"portfolio_balance_claimed_without_resource_or_decision_evidence\",\"innovation_theater_confused_with_real_option_creation\",\"private_strategy_customer_or_financial_data_used_in_examples_or_evals\"],\"evidence_priority\":\"general_knowledge_first\"}"
  mental_model: "Three Horizons is a concurrent portfolio map for growth work. The primitives are a portfolio owner, Horizon 1 current core businesses that generate today's value and cash flow, Horizon 2 emerging opportunities that may become material growth engines but need investment, Horizon 3 future options that are uncertain and exploratory, evidence maturity, resource allocation, governance model, metrics, transition path, and risk. The agent classifies initiatives by strategic role and maturity rather than by a simple date, then checks whether the organization is protecting the core, scaling the next engines, and creating enough credible future options at the same time."
  purpose: "This skill prevents agents from turning innovation strategy into either short-term optimization or distant invention theater. It forces the agent to show whether the portfolio funds current performance, builds emerging growth, maintains future options, uses different metrics by horizon, and has a plausible path for initiatives to move toward material business impact."
  concept_boundary: "Three Horizons is for innovation and growth portfolio balance across current core, emerging businesses, and future options. It is not BCG growth-share portfolio allocation, Ansoff product-market growth path selection, Blue Ocean value-curve redesign, OKR goal-setting, expected-value calculation, generic roadmap sequencing, or the International Futures Forum social-change Three Horizons method unless the user explicitly asks for futures or systems-change facilitation."
  analogy: "Three Horizons is like managing a farm: harvest today's crop, cultivate the next field, and plant experiments for future seasons without pretending one task can wait until the others are finished."
  misconception: "The common mistake is treating Horizon 1, Horizon 2, and Horizon 3 as now, later, and much later work that should be handled sequentially. The framework's point is concurrent management: all three horizons need attention now, but with different evidence standards, resources, metrics, and governance."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/reasoning-strategy/three-horizons/SKILL.md
  skill_graph_export_description_projection: anti_examples
  skill_graph_export_description_projection_truncated: "true"
---

## Concept of the skill

**What it is:** Three Horizons is an innovation and growth portfolio framework for balancing current core performance, emerging businesses, and future options. It helps an organization manage Horizon 1, Horizon 2, and Horizon 3 work concurrently rather than sacrificing future growth to near-term pressure or treating exploratory ideas as a disconnected lab.

**Mental model:** Treat growth as a portfolio of overlapping maturity curves. Horizon 1 funds and extends the current core; Horizon 2 turns promising opportunities into scaled engines; Horizon 3 creates options for future businesses or models that are still uncertain.

**Why it exists:** Agents often collapse innovation strategy into a roadmap, a list of ideas, or a single investment decision. This skill forces portfolio balance, different governance by horizon, evidence fit, and explicit transition paths.

**What it is NOT:** It is not BCG, Ansoff, Blue Ocean Strategy, OKRs, expected-value math, a fixed time-phased roadmap, or the futures-studies Three Horizons facilitation method unless the user asks for that variant.

**Adjacent concepts:** innovation portfolio, corporate growth strategy, current core, adjacent growth, transformational bets, venture pipeline, R&D portfolio, option value, governance, portfolio metrics, transition risk.

**One-line analogy:** Three Horizons manages the growth garden by harvesting, cultivating, and planting at the same time.

**Common misconception:** Horizon 3 is not work to ignore until the distant future. It is uncertain work that needs small, credible, current investment and learning now.

# Three Horizons

## Domain Context

Use Three Horizons for innovation portfolio reviews, corporate growth strategy, product and R&D portfolio planning, transformation roadmaps, venture studio reviews, new-business building, and strategy memos that need to balance today's performance with future opportunity creation. Use public, aggregate, or synthetic examples only. Do not include private strategy data, customer data, payment details, deal details, employee-level facts, secrets, or confidential financials in examples or evals.

The framework is strongest when the user asks whether a portfolio is too incremental, whether future bets are credible, whether emerging businesses are getting enough investment, how to govern different kinds of initiatives, or how to stop current-core pressure from crowding out future growth. It is weaker when the question is about industry attractiveness, product-market growth quadrant selection, market-boundary reconstruction, quarterly execution metrics, or a single quantified investment choice.

Do not treat the three horizons as a simple time sequence. McKinsey's own framing says companies manage all three simultaneously. The time axis describes how ventures may mature over time, not when leaders should start paying attention.

## Coverage

This skill teaches agents to:

1. Frame the portfolio owner, strategic ambition, business boundary, and decision the portfolio review must inform.
2. Classify initiatives into Horizon 1 current core, Horizon 2 emerging growth, and Horizon 3 future options.
3. Separate time horizon from maturity, uncertainty, evidence, governance, and strategic role.
4. Check whether current performance, emerging business building, and option creation are all being funded and managed.
5. Match metrics, decision rights, talent, funding, and governance to the horizon rather than using one operating model for all work.
6. Diagnose starvation, gap, transition, and innovation-theater risks.
7. Convert the portfolio view into rebalance actions: protect, invest, scale, learn, partner, pause, or kill.
8. Distinguish Three Horizons from BCG, Ansoff, Blue Ocean Strategy, OKRs, expected-value analysis, and futures facilitation.

## Philosophy of the skill

Three Horizons is useful because current businesses are loud. They have customers, revenue, managers, dashboards, and urgent problems. Future options are quiet. They are uncertain, easy to underfund, and often judged with the wrong metrics. Horizon 2 work is especially vulnerable: it is too speculative for core-business governance but too concrete to remain a research project.

The skill therefore treats the framework as a governance and portfolio-balancing method, not a decorative three-column slide. A useful Three Horizons analysis does not merely label initiatives. It asks whether each horizon has the right ambition, evidence, resources, metrics, governance, and transition path.

## Workflow

### 1. Frame the portfolio question

Start by naming the portfolio and the decision this analysis must support.

```text
Portfolio owner:
Strategic ambition:
Business, product, or market boundary:
Decision this analysis must inform:
Current core performance pressure:
Known growth gap:
Initiatives in scope:
Evidence available:
Resource constraints:
Privacy boundary:
```

If the user only provides a list of initiatives, ask what decision they need: rebalance funding, identify gaps, set governance, review roadmap risk, or choose which initiatives to advance.

### 2. Define the three horizons

Use the horizons as strategic roles, not just dates.

| Horizon | Strategic role | Typical work | Evidence standard | Common governance |
| --- | --- | --- | --- | --- |
| Horizon 1 | Extend, defend, and improve the current core that produces most current profit or cash flow | core product improvements, operational efficiency, pricing, channel expansion, customer retention | strong performance data, operating metrics, known customers, clear financial impact | business-line ownership, operating reviews, near-term financial and customer metrics |
| Horizon 2 | Build emerging opportunities that could become meaningful growth engines | adjacent businesses, new products with traction, new channels, scale-up ventures, new customer segments | market traction, repeatable unit economics, capability fit, scaling risks | dedicated growth governance, staged funding, scale milestones, cross-functional ownership |
| Horizon 3 | Create options for future growth under high uncertainty | research, prototypes, minority stakes, exploratory ventures, new technologies, new business-model experiments | learning velocity, strategic option value, assumptions tested, signals from weak evidence | small bets, discovery governance, option reviews, kill or continue based on learning |

Horizon 1 is not bad and Horizon 3 is not automatically visionary. The question is whether the portfolio has enough of each for the strategy and environment.

### 3. Classify initiatives by maturity and role

For each initiative, record why it belongs in a horizon.

```text
Initiative:
Proposed horizon:
Strategic role:
Customer or market evidence:
Business-model evidence:
Capability or technology maturity:
Current investment:
Expected value path:
Governance owner:
Metric that should decide next funding:
Transition condition:
```

Do not classify only by launch date. A project launching next quarter can still be Horizon 3 if the business model is unproven. A current product may be Horizon 1 even if it has a multi-year roadmap.

### 4. Check portfolio balance

Look for patterns across the whole portfolio.

| Pattern | What it means | Diagnostic question |
| --- | --- | --- |
| Horizon 1 overweight | Current performance dominates future creation | Are core initiatives consuming all leadership attention, talent, and funding? |
| Horizon 2 gap | There are ideas and core work, but few scale-ready growth engines | Which H3 options have evidence enough to become H2, and what blocks the transition? |
| Horizon 3 theater | Exploratory ideas exist but no assumptions are tested | What learning, option, or signal would justify continued investment? |
| Same metrics across horizons | Core-business control is being imposed on exploration, or exploration looseness is being imposed on core | Which metric fits each horizon's uncertainty and maturity? |
| No transition logic | Initiatives sit in columns without movement | What evidence moves an initiative from H3 to H2, from H2 to H1, or to shutdown? |
| Funding mismatch | Resource allocation contradicts declared strategic ambition | Where do dollars, talent, executive attention, and decision rights actually go? |

Name resource allocation explicitly. A portfolio that claims Horizon 3 ambition but assigns no funding, owner, or learning metric does not have a Horizon 3 portfolio.

### 5. Match governance and metrics to each horizon

Use different controls for different uncertainty levels.

| Horizon | Good metrics | Bad metric fit | Decision rhythm |
| --- | --- | --- | --- |
| H1 | revenue, margin, retention, productivity, quality, customer satisfaction, cash flow | only learning milestones, no financial accountability | operating cadence, monthly or quarterly |
| H2 | traction, repeatability, unit economics, adoption, capability readiness, scale bottlenecks | mature-core profit thresholds too early, vanity pilots | staged funding, milestone reviews |
| H3 | assumptions tested, learning speed, signal quality, option value, strategic relevance, cheap invalidation | revenue targets before the model exists, indefinite exploration with no kill criteria | discovery reviews, option checkpoints |

If one governance model is applied to all horizons, call out the distortion. H1 needs discipline and performance. H2 needs scaling evidence and protection from core metrics. H3 needs fast learning and explicit option logic.

### 6. Diagnose transition risks

The portfolio is useful only if initiatives can move or stop.

| Transition | Risk | What to check |
| --- | --- | --- |
| H3 to H2 | Promising option cannot find a business owner, capability path, or funding model | sponsor, customer evidence, business-model hypothesis, required capability |
| H2 to H1 | Emerging business is scaled before repeatability or starved before scale | unit economics, operating model, channel readiness, leadership ownership |
| H1 renewal | Core business optimization blocks cannibalization or category shifts | incentives, customer migration, product architecture, sales conflict |
| Shutdown | Weak initiatives continue because they are politically protected | kill criteria, opportunity cost, evidence quality, owner incentives |

Name what evidence would change the classification. Without transition criteria, the horizon labels become static decoration.

### 7. Recommend rebalance actions

The output should be a short portfolio diagnosis followed by concrete moves.

| Action | Use when |
| --- | --- |
| Protect | H1 cash or customer trust is at risk and future work depends on it |
| Extend | H1 has overlooked near-term growth or efficiency opportunities |
| Invest | H2 has evidence and needs scale resources or executive protection |
| Incubate | H3 has strategic option value but needs cheap learning, not scale funding |
| Partner or acquire | capability, access, or speed cannot be built internally in time |
| Pause or kill | evidence is weak, learning has stalled, or opportunity cost is too high |
| Reclassify | the initiative's maturity or role does not match its label |

Do not recommend an even split by default. The right balance depends on industry maturity, disruption risk, cash position, ambition, capability, and time to impact.

## Output Template

Use this compact structure when applying the framework.

```text
Three Horizons diagnosis:

Portfolio boundary:
Strategic ambition:
Current portfolio pattern:

Horizon 1 - current core:
- Initiatives:
- Evidence:
- Resource level:
- Risks:
- Recommended action:

Horizon 2 - emerging growth:
- Initiatives:
- Evidence:
- Resource level:
- Risks:
- Transition criteria:
- Recommended action:

Horizon 3 - future options:
- Initiatives:
- Evidence:
- Resource level:
- Learning metrics:
- Kill or continue criteria:
- Recommended action:

Cross-horizon risks:
- Starvation:
- Gap:
- Governance mismatch:
- Metrics mismatch:
- Transition bottleneck:

Next decisions:
1.
2.
3.
```

## Boundary With Nearby Skills

| Nearby skill | Use that skill when | Use Three Horizons when |
| --- | --- | --- |
| `bcg-matrix` | The portfolio question is market growth x relative market share across business units or products | The question is innovation/growth maturity, evidence, governance, and current-vs-future balance |
| `ansoff-matrix` | The question is which product-market growth path an option represents | The question is how options across maturity levels balance in a growth portfolio |
| `blue-ocean-strategy` | The task is value innovation, strategy canvas, ERRC grid, or market-boundary reconstruction | The task is balancing current, emerging, and future growth initiatives |
| `playing-to-win` | The team needs an integrated strategy cascade before choosing portfolio bets | The strategy direction exists and the question is portfolio balance and governance |
| `expected-value` | Outcomes, probabilities, and values are estimable enough for quantitative option comparison | The task is portfolio-level classification, evidence fit, and governance design before valuation |
| `okrs` | The team needs measurable objectives and key results for execution | The team needs to decide what kinds of innovation work should exist and how they should be governed |

## Verification

Before giving the final analysis, check:

- Did you classify by strategic role, maturity, uncertainty, and evidence rather than by date alone?
- Did you explain that all three horizons require concurrent management?
- Did you include Horizon 1 value and cash flow instead of treating the core as merely obsolete?
- Did you identify whether Horizon 2 is underfunded, overprotected, or missing?
- Did you give Horizon 3 learning metrics and kill or continue criteria rather than vague ideation?
- Did you match governance and metrics to horizon uncertainty?
- Did you name transition criteria between horizons?
- Did you avoid private customer, employee, financial, or strategy details?

## Do NOT Use When

| Use instead | When |
| --- | --- |
| `bcg-matrix` | Portfolio allocation is based on market growth and relative market share |
| `ansoff-matrix` | The task is classifying a growth move by existing/new products and markets |
| `blue-ocean-strategy` | The task is reconstructing market boundaries or designing a new value curve |
| `okrs` | The task is writing execution goals and key results |
| `expected-value` | The task is comparing quantified scenarios by probability and payoff |
| `swot-tows` | The task is inventorying internal/external factors and generating options |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `reasoning-strategy`
- Public: `true`
- Domain: `foundations/strategy`
- Scope: Three Horizons innovation and growth portfolio analysis for companies, business units, product portfolios, R&D portfolios, transformation programs, and venture pipelines: classify initiatives as Horizon 1 current core, Horizon 2 emerging growth, or Horizon 3 future option; balance current performance with future opportunity creation; match governance, metrics, evidence, resources, and decision rights to each horizon; identify starvation, gap, and transition risks; and convert the portfolio view into rebalance actions. Excludes BCG growth-share allocation, Ansoff product-market growth-path selection, Blue Ocean value-curve redesign, standalone OKR planning, quantified expected-value valuation, generic roadmap sequencing, and treating horizons as a fixed calendar backlog.

**When to use**
- Use Three Horizons to review our innovation portfolio and show whether current core work is starving future growth.
- Use the Three Horizons framework to map these growth initiatives into Horizon 1 current core, Horizon 2 emerging growth, and Horizon 3 future options, then recommend rebalance actions.
- Build a Three Horizons view for our product roadmap: core optimization, emerging businesses, and future options.
- Review this R&D portfolio with Horizon 1, Horizon 2, and Horizon 3 governance and metrics.
- We have too many incremental bets and no future options. Use Three Horizons to diagnose the gap.
- Triggers: `three-horizons`, `three-horizons-framework`, `horizons-of-growth`, `h1-h2-h3`, `innovation-portfolio`

**Not for**
- Classify our business units as stars, cash cows, question marks, or dogs by market growth and relative market share.
- Use Ansoff to choose between market penetration, market development, product development, and diversification.
- Use Blue Ocean Strategy to create a strategy canvas and ERRC grid for this category.
- Write quarterly OKRs for the innovation team.
- Use expected-value analysis to compare these investment options with probabilities, payoffs, and scenario values.

**Related skills**
- Verify with: `epistemic-grounding`, `methodology`, `expected-value`
- Related: `ansoff-matrix`, `bcg-matrix`, `blue-ocean-strategy`, `playing-to-win`, `expected-value`, `okrs`, `swot-tows`, `value-chain-analysis`, `epistemic-grounding`, `methodology`

**Concept**
- Mental model: Three Horizons is a concurrent portfolio map for growth work. The primitives are a portfolio owner, Horizon 1 current core businesses that generate today's value and cash flow, Horizon 2 emerging opportunities that may become material growth engines but need investment, Horizon 3 future options that are uncertain and exploratory, evidence maturity, resource allocation, governance model, metrics, transition path, and risk. The agent classifies initiatives by strategic role and maturity rather than by a simple date, then checks whether the organization is protecting the core, scaling the next engines, and creating enough credible future options at the same time.
- Purpose: This skill prevents agents from turning innovation strategy into either short-term optimization or distant invention theater. It forces the agent to show whether the portfolio funds current performance, builds emerging growth, maintains future options, uses different metrics by horizon, and has a plausible path for initiatives to move toward material business impact.
- Analogy: Three Horizons is like managing a farm: harvest today's crop, cultivate the next field, and plant experiments for future seasons without pretending one task can wait until the others are finished.
- Common misconception: The common mistake is treating Horizon 1, Horizon 2, and Horizon 3 as now, later, and much later work that should be handled sequentially. The framework's point is concurrent management: all three horizons need attention now, but with different evidence standards, resources, metrics, and governance.

**Grounding**
- Mode: `universal`
- Truth sources: `https://www.mckinsey.com/capabilities/strategy-and-corporate-finance/our-insights/enduring-ideas-the-three-horizons-of-growth`, `https://www.mckinsey.com/capabilities/growth-marketing-and-sales/our-insights/now-new-next-how-growth-champions-create-new-value`, `https://www.internationalfuturesforum.com/world-model-three-horizons`, `https://www.internationalfuturesforum.com/transformative-innovation`, `skills/skills/reasoning-strategy/three-horizons/references/three-horizons-sources.md`, `skills/skills/reasoning-strategy/three-horizons/references/upstream-displacement-2026-06-09.md`

**Keywords**
- `three horizons`, `horizons of growth`, `innovation portfolio`, `growth portfolio`, `horizon 1`, `horizon 2`, `horizon 3`, `core adjacent transformational`, `future growth options`, `portfolio balance`

<!-- skill-graph-context:end -->
