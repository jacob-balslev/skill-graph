---
name: bcg-matrix
description: "Use when analyzing product, brand, business-unit, or investment portfolio allocation with the BCG Growth-Share Matrix: market growth, relative market share, stars, cash cows, question marks, dogs/pets, cash generation, invest/harvest/divest/reposition choices, portfolio balance, and modern limitations. Covers defining portfolio units and markets, choosing comparable metrics, plotting quadrants, interpreting cash-flow logic, challenging share-growth assumptions, and handing off to valuation or strategy methods. Do NOT use for product-market growth paths (use ansoff-matrix), macro-environment scanning (use pestel), industry profit-pressure diagnosis (use porters-five-forces), internal/external factor inventory (use swot-tows), durable moat classification (use seven-powers), or quantified option valuation (use expected-value). Do NOT use for Classify growth ideas as market penetration, market development, product development, or diversification."
license: MIT
compatibility: "Markdown, portfolio reviews, business-unit strategy, product portfolio analysis, resource allocation memos, investment prioritization"
allowed-tools: Read Grep WebSearch WebFetch
metadata:
  relations: "{\"related\":[\"playing-to-win\",\"prioritization\",\"ansoff-matrix\",\"swot-tows\",\"pestel\",\"porters-five-forces\",\"seven-powers\",\"expected-value\",\"epistemic-grounding\",\"methodology\"],\"suppresses\":[\"ansoff-matrix\",\"expected-value\",\"swot-tows\",\"pestel\",\"porters-five-forces\",\"seven-powers\"],\"verify_with\":[\"epistemic-grounding\",\"methodology\",\"expected-value\"]}"
  subject: reasoning-strategy
  scope: "BCG Growth-Share Matrix portfolio analysis for products, brands, business units, programs, and investment candidates: define comparable portfolio units and market boundaries, choose market-growth and relative-market-share measures, classify units as stars, cash cows, question marks, or dogs/pets, interpret cash generation and investment implications, challenge the assumptions behind share and growth, and route to valuation, competitive analysis, or integrated strategy when a quadrant label is not enough. Excludes Ansoff product-market growth-path framing, PESTEL macro-environment scanning, Porter's Five Forces industry profit-pressure diagnosis, SWOT/TOWS situational option generation, Seven Powers moat-source classification, OKR execution tracking, and standalone financial valuation."
  public: "true"
  taxonomy_domain: foundations/strategy
  stability: stable
  keywords: "[\"BCG Matrix\",\"growth-share matrix\",\"Boston Matrix\",\"product portfolio matrix\",\"stars cash cows\",\"question marks dogs\",\"relative market share\",\"market growth\",\"portfolio allocation\",\"business unit portfolio\"]"
  triggers: "[\"bcg\",\"bcg-matrix\",\"growth-share-matrix\",\"boston-matrix\",\"product-portfolio-matrix\"]"
  examples: "[\"Build a BCG Matrix for these product lines and recommend where to invest, harvest, or divest.\",\"Classify our business units as stars, cash cows, question marks, or dogs based on market growth and relative share.\",\"Review this growth-share matrix and tell me where the market definition or share metric is weak.\",\"Use the Boston Matrix to explain which portfolio units generate cash and which need funding.\",\"Map this product portfolio by high/low market growth and high/low relative market share without pretending the labels are final strategy.\"]"
  anti_examples: "[\"Classify growth ideas as market penetration, market development, product development, or diversification.\",\"Scan political, economic, social, technological, environmental, and legal forces for a market entry.\",\"Analyze supplier power, buyer power, entrants, substitutes, and rivalry.\",\"Turn strengths, weaknesses, opportunities, and threats into SO, WO, ST, and WT options.\",\"Classify this company's durable moat using scale economies, switching costs, network economies, branding, cornered resource, counter-positioning, or process power.\"]"
  grounding: "{\"subject_matter\":\"BCG Growth-Share Matrix as a portable portfolio analysis and resource-allocation framework\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://www.bcg.com/about/overview/our-history/growth-share-matrix\",\"https://www.bcg.com/publications/1970/strategy-the-product-portfolio\",\"https://www.bcg.com/ja-jp/publications/2014/growth-share-matrix-bcg-classics-revisited\",\"skills/skills/reasoning-strategy/bcg-matrix/references/bcg-matrix-sources.md\",\"skills/skills/reasoning-strategy/bcg-matrix/references/upstream-displacement-2026-06-05.md\"],\"failure_modes\":[\"portfolio_unit_left_undefined\",\"market_boundary_or_growth_metric_left_implicit\",\"absolute_market_share_confused_with_relative_market_share\",\"quadrant_label_treated_as_final_recommendation\",\"cash_flow_logic_ignored\",\"modern_market_share_assumption_not_challenged\",\"product_market_growth_confused_with_portfolio_allocation\",\"financial_value_claim_made_without_valuation_method\"],\"evidence_priority\":\"general_knowledge_first\"}"
  mental_model: "The BCG Growth-Share Matrix is a two-axis portfolio map. The primitives are a portfolio owner, comparable portfolio units, a defined market boundary, a market-growth measure, a relative-market-share measure, four quadrants, cash generation, cash needs, investment posture, timing, and strategic assumptions. High growth indicates markets where leadership may need funding or experimentation; high relative share indicates stronger competitive position and potential cash generation. Stars are high growth and high share, cash cows are low growth and high share, question marks are high growth and low share, and dogs or pets are low growth and low share. The matrix frames allocation tradeoffs, but it does not prove attractiveness, valuation, or strategic fit by itself."
  purpose: "This skill prevents agents from talking about portfolios as undifferentiated lists of products or business units. It forces each unit to declare the market it is measured against, the growth and relative-share evidence, the cash-flow implication, the investment or harvest question, and the downstream analysis needed before a real allocation decision."
  concept_boundary: "The BCG Growth-Share Matrix is for portfolio allocation by market growth and relative market share. It is not Ansoff product-market growth direction, SWOT/TOWS factor crossing, PESTEL macro scanning, Five Forces industry-structure diagnosis, Seven Powers moat taxonomy, OKR execution management, or financial valuation. Those methods may feed or follow a BCG Matrix, but they do not replace its portfolio cash-flow logic."
  analogy: "The BCG Matrix is like a funding map for a garden: some plots are mature and throw off seeds, some are promising and need water, some are experiments, and some may not justify more space."
  misconception: "The common mistake is treating quadrant labels as automatic commands: invest in every star, milk every cash cow, fund every question mark, and divest every dog. The labels are hypotheses about cash needs and strategic posture. The agent still has to verify market definition, share measurement, growth durability, profitability, capability fit, and whether valuation or competitive analysis changes the decision."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/reasoning-strategy/bcg-matrix/SKILL.md
  skill_graph_export_description_projection: anti_examples
  skill_graph_export_description_projection_truncated: "true"
---

## Concept of the skill

**What it is:** The BCG Growth-Share Matrix, also called the Boston Matrix or product portfolio matrix, is a portfolio allocation framework. It classifies products, brands, or business units by market growth and relative market share.

**Mental model:** Define the portfolio unit and its market first. Then plot each unit on two axes: how fast the market is growing and how strong the unit's relative share is. The quadrant label becomes a cash-flow and investment hypothesis, not a final decision.

**Why it exists:** Agents often recommend investing or divesting from a portfolio without making the allocation logic explicit. This skill forces market definition, metric choice, cash-generation logic, and assumption checks before recommending action.

**What it is NOT:** It is not Ansoff, SWOT/TOWS, PESTEL, Five Forces, Seven Powers, OKRs, or a valuation model.

**Adjacent concepts:** corporate portfolio strategy, product portfolio management, resource allocation, relative market share, market attractiveness, cash generation, harvesting, divestment, strategic experimentation.

**One-line analogy:** BCG maps which portfolio units fund the system, which need funding, which are bets, and which may be absorbing scarce resources.

**Common misconception:** The quadrant names do not decide the strategy. They classify a portfolio position so evidence, cash economics, and follow-on analysis can decide what to do next.

# BCG Matrix

## Domain Context

Use the BCG Matrix for corporate strategy, product portfolio strategy, brand portfolio reviews, business-unit allocation, R&D or initiative portfolio reviews, and review of existing growth-share matrix work. Use public, aggregate, or synthetic examples only. Do not include personal data, customer data, payment data, secrets, confidential deal details, or private business facts in examples or evals.

The matrix is strongest when the user has multiple comparable units competing for resources and needs a simple view of where cash is generated, where cash may be required, and where portfolio balance is weak. It is weaker when the decision is about one product's growth path, an industry's structural attractiveness, macro forces, durable moat source, or quantified value. In those cases, route to the method that owns that mechanism.

Treat "portfolio unit" broadly. It can mean strategic business unit, product line, brand, geography, program, customer segment, investment theme, or internal initiative. The unit must be comparable enough that market growth and relative share are meaningful across the set.

## Coverage

This skill teaches agents to:

1. Define the portfolio owner, portfolio units, market boundaries, and decision horizon.
2. Choose comparable market-growth and relative-market-share metrics.
3. Classify units as stars, cash cows, question marks, or dogs/pets.
4. Interpret the cash-flow and investment logic behind each quadrant.
5. Challenge weak market definitions, weak share proxies, and stale growth assumptions.
6. Compare portfolio balance without treating quadrant labels as automatic recommendations.
7. State assumptions, evidence gaps, risks, and next analysis for each unit.
8. Route valuation, competitive, growth-path, or execution questions to the right downstream method.

## Philosophy of the skill

The BCG Matrix is useful because resource allocation is often political, anecdotal, or driven by the loudest unit owner. A growth-share pass makes the implicit portfolio theory visible: mature strong positions may fund future opportunities; high-growth positions may need investment; weak positions in slow markets may need repositioning, harvesting, divestment, or a clear reason to keep them.

The method is intentionally blunt. Its power is shared language and cash-flow discipline, not precision. A good BCG Matrix output names the market definition, the share denominator, the growth measure, the cash-flow implication, and the next evidence needed. It should also challenge the original assumptions: relative share is no longer always a direct proxy for durable advantage, growth rates can shift quickly, and units can move across quadrants faster than classic portfolio doctrine assumed.

## Workflow

### 1. Frame the portfolio question

Start by naming the portfolio and the decision it must inform.

```text
Portfolio owner:
Portfolio units:
Market boundary for each unit:
Decision horizon:
Resource decision to inform:
Market-growth source:
Relative-share source:
Known cash-flow or profitability data:
Constraints:
```

Reject vague scopes such as "our products" unless the user explicitly wants a first-pass brainstorm. Narrow by business unit, product line, brand, geography, customer segment, channel, or investment pool.

### 2. Define the two axes

The matrix depends on comparable axis definitions.

| Axis | What it means | Evidence to request | Common failure |
| --- | --- | --- | --- |
| Market growth | How fast the relevant market is growing over the chosen horizon | category growth, demand growth, segment revenue growth, adoption growth, market forecasts, unit economics trend | using total company growth or hype instead of market growth |
| Relative market share | The unit's share relative to a leading competitor or reference competitor in the defined market | share versus leader, share versus top competitor, rank, volume/revenue share, installed base, distribution share | using absolute share without relative competitive context |

If exact data is missing, allow a proxy only when it is labeled as a proxy and the uncertainty is carried into the recommendation. Do not invent market size, market growth, share, or profitability.

### 3. Plot the portfolio units

Use the quadrants as hypotheses.

| Quadrant | Market growth | Relative market share | Allocation hypothesis | Evidence needed |
| --- | --- | --- | --- | --- |
| Star | High | High | Protect or invest while growth remains attractive; may become a cash generator when growth slows | growth durability, reinvestment needs, profitability path, competitor response, capacity |
| Cash cow | Low | High | Harvest cash beyond maintenance needs; fund future growth elsewhere when excess cash exists | actual cash generation, maintenance investment, decline risk, price/margin resilience |
| Question mark | High | Low | Decide whether to invest enough to pursue leadership, reposition, partner, or exit | path to share gain, required cash, differentiation, timing, option value, downside |
| Dog / pet | Low | Low | Consider harvest, reposition, divest, exit, or keep only with a strategic reason | strategic dependency, turnaround evidence, cash drain, exit cost, customer or platform role |

Do not present a "dog" label as an insult or a command. It is a portfolio-position label. Keep the tone analytical and explain the evidence.

### 4. Interpret cash-flow logic

For each unit, separate position from action.

```text
Unit:
Market definition:
Market growth: high / low / uncertain
Relative share: high / low / uncertain
Quadrant:
Cash generation:
Cash needs:
Allocation hypothesis:
Assumptions:
Evidence gaps:
Decision risk:
Next analysis:
```

The classic logic says high-growth units require cash, high-share units can generate stronger margins and cash, and the portfolio needs both cash-generating mature positions and future growth options. Treat that as a hypothesis to test with actual cash flow, profitability, strategic fit, and competitive evidence.

### 5. Challenge the matrix before recommending action

Use these checks before any recommendation:

- Are the portfolio units comparable, or is the matrix mixing products, markets, geographies, and initiatives that should not share one grid?
- Is the market boundary precise enough that growth and share mean something?
- Is "high" and "low" defined by an explicit threshold or by relative comparison within the portfolio?
- Is relative share measured against the right competitor or segment?
- Does high relative share actually produce cash or advantage in this market?
- Is growth durable, cyclical, subsidized, regulatory, or temporary?
- Are there strategic reasons to keep a low-growth, low-share unit, such as platform dependency, customer retention, regulatory obligation, or learning?
- Is a quantified valuation, expected-value comparison, or Five Forces analysis needed before reallocating capital?

### 6. Route to downstream work

The BCG Matrix is an input to allocation work, not the whole decision.

| Remaining question | Next method |
| --- | --- |
| Is the unit pursuing growth through current/new products and markets? | Ansoff Matrix |
| What internal strengths and external conditions shape the portfolio options? | SWOT/TOWS |
| What macro forces could change market growth? | PESTEL |
| Is the target industry structurally attractive? | Porter's Five Forces |
| Could the unit build or defend durable advantage? | Seven Powers |
| What integrated strategy should the organization commit to? | Playing to Win |
| Which option has the best probability-weighted payoff? | Expected Value |

## Classification Tests

Use these tests when a quadrant is ambiguous:

| Question | If yes | If no |
| --- | --- | --- |
| Is the unit's market growing materially within the decision horizon? | High-growth side | Low-growth side |
| Does the unit have high share relative to a relevant competitor or reference point? | High-share side | Low-share side |
| Does the unit generate cash beyond maintenance investment? | Cash-cow logic may hold | Do not assume cash-cow economics from share alone |
| Can added investment plausibly move a question mark toward leadership? | Candidate for focused investment | Candidate for repositioning, partnership, harvest, or exit |
| Is the unit strategically necessary despite weak share and growth? | Keep with explicit reason and review trigger | Consider exit, divestment, or resource reduction |

## Output Formats

For a compact answer:

```text
Portfolio scope:
Axis definitions:

| Unit | Market growth | Relative share | Quadrant | Allocation hypothesis | Evidence gap |
| --- | --- | --- | --- | --- | --- |
| | | | | | |

Portfolio balance:
Recommended next analysis:
```

For a review of an existing BCG Matrix:

```text
Matrix reviewed:
Market definition issues:
Share measurement issues:
Growth measurement issues:
Quadrant classification issues:
Unsupported recommendations:
Missing cash-flow evidence:
Modern limitation or assumption:
Recommended correction:
```

## Quality Checks

- The portfolio owner, units, market boundary, and time horizon are named.
- Market growth and relative market share are defined before quadrants are assigned.
- Every quadrant label has evidence or an explicit uncertainty marker.
- Cash generation and cash needs are discussed separately from quadrant labels.
- No unit is recommended for investment, harvest, divestment, or exit solely because of its label.
- Modern limitations are acknowledged when share is used as a proxy for advantage.
- The output routes valuation, industry structure, macro environment, or product-market growth questions to the appropriate method.
- Examples remain synthetic, public, or aggregate and avoid private business data.

## Verification

After applying this skill, verify:

- [ ] The task matches the declared scope, coverage, or positive examples.
- [ ] The response follows this skill's workflow or checks instead of generic advice.
- [ ] The exclusions in `## Do NOT Use When` do not point to a better skill.

## Do NOT Use When
Use another method when the user's actual question is:

| User need | Use instead |
| --- | --- |
| Classify growth options by existing/new products and existing/new markets | Ansoff Matrix |
| Scan political, economic, social, technological, environmental, and legal forces | PESTEL |
| Diagnose buyer power, supplier power, entrants, substitutes, and rivalry | Porter's Five Forces |
| Turn strengths, weaknesses, opportunities, and threats into options | SWOT/TOWS |
| Classify durable competitive advantage sources | Seven Powers |
| Build an integrated strategy cascade | Playing to Win |
| Compare probability-weighted value or quantified payoff | Expected Value |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `reasoning-strategy`
- Public: `true`
- Domain: `foundations/strategy`
- Scope: BCG Growth-Share Matrix portfolio analysis for products, brands, business units, programs, and investment candidates: define comparable portfolio units and market boundaries, choose market-growth and relative-market-share measures, classify units as stars, cash cows, question marks, or dogs/pets, interpret cash generation and investment implications, challenge the assumptions behind share and growth, and route to valuation, competitive analysis, or integrated strategy when a quadrant label is not enough. Excludes Ansoff product-market growth-path framing, PESTEL macro-environment scanning, Porter's Five Forces industry profit-pressure diagnosis, SWOT/TOWS situational option generation, Seven Powers moat-source classification, OKR execution tracking, and standalone financial valuation.

**When to use**
- Build a BCG Matrix for these product lines and recommend where to invest, harvest, or divest.
- Classify our business units as stars, cash cows, question marks, or dogs based on market growth and relative share.
- Review this growth-share matrix and tell me where the market definition or share metric is weak.
- Use the Boston Matrix to explain which portfolio units generate cash and which need funding.
- Map this product portfolio by high/low market growth and high/low relative market share without pretending the labels are final strategy.
- Triggers: `bcg`, `bcg-matrix`, `growth-share-matrix`, `boston-matrix`, `product-portfolio-matrix`

**Not for**
- Classify growth ideas as market penetration, market development, product development, or diversification.
- Scan political, economic, social, technological, environmental, and legal forces for a market entry.
- Analyze supplier power, buyer power, entrants, substitutes, and rivalry.
- Turn strengths, weaknesses, opportunities, and threats into SO, WO, ST, and WT options.
- Classify this company's durable moat using scale economies, switching costs, network economies, branding, cornered resource, counter-positioning, or process power.

**Related skills**
- Verify with: `epistemic-grounding`, `methodology`, `expected-value`
- Related: `playing-to-win`, `prioritization`, `ansoff-matrix`, `swot-tows`, `pestel`, `porters-five-forces`, `seven-powers`, `expected-value`, `epistemic-grounding`, `methodology`

**Concept**
- Mental model: The BCG Growth-Share Matrix is a two-axis portfolio map. The primitives are a portfolio owner, comparable portfolio units, a defined market boundary, a market-growth measure, a relative-market-share measure, four quadrants, cash generation, cash needs, investment posture, timing, and strategic assumptions. High growth indicates markets where leadership may need funding or experimentation; high relative share indicates stronger competitive position and potential cash generation. Stars are high growth and high share, cash cows are low growth and high share, question marks are high growth and low share, and dogs or pets are low growth and low share. The matrix frames allocation tradeoffs, but it does not prove attractiveness, valuation, or strategic fit by itself.
- Purpose: This skill prevents agents from talking about portfolios as undifferentiated lists of products or business units. It forces each unit to declare the market it is measured against, the growth and relative-share evidence, the cash-flow implication, the investment or harvest question, and the downstream analysis needed before a real allocation decision.
- Boundary: The BCG Growth-Share Matrix is for portfolio allocation by market growth and relative market share. It is not Ansoff product-market growth direction, SWOT/TOWS factor crossing, PESTEL macro scanning, Five Forces industry-structure diagnosis, Seven Powers moat taxonomy, OKR execution management, or financial valuation. Those methods may feed or follow a BCG Matrix, but they do not replace its portfolio cash-flow logic.
- Analogy: The BCG Matrix is like a funding map for a garden: some plots are mature and throw off seeds, some are promising and need water, some are experiments, and some may not justify more space.
- Common misconception: The common mistake is treating quadrant labels as automatic commands: invest in every star, milk every cash cow, fund every question mark, and divest every dog. The labels are hypotheses about cash needs and strategic posture. The agent still has to verify market definition, share measurement, growth durability, profitability, capability fit, and whether valuation or competitive analysis changes the decision.

**Grounding**
- Mode: `universal`
- Truth sources: `https://www.bcg.com/about/overview/our-history/growth-share-matrix`, `https://www.bcg.com/publications/1970/strategy-the-product-portfolio`, `https://www.bcg.com/ja-jp/publications/2014/growth-share-matrix-bcg-classics-revisited`, `skills/skills/reasoning-strategy/bcg-matrix/references/bcg-matrix-sources.md`, `skills/skills/reasoning-strategy/bcg-matrix/references/upstream-displacement-2026-06-05.md`

**Keywords**
- `BCG Matrix`, `growth-share matrix`, `Boston Matrix`, `product portfolio matrix`, `stars cash cows`, `question marks dogs`, `relative market share`, `market growth`, `portfolio allocation`, `business unit portfolio`

<!-- skill-graph-context:end -->
