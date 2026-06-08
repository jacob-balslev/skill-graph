---
name: ansoff-matrix
description: "Use when choosing or reviewing growth strategy options with the Ansoff product-market matrix: market penetration, market development, product development, diversification, existing vs new products, existing vs new markets, strategic distance, risk, assumptions, and sequencing. Covers growth-option framing, quadrant classification, evidence needs, option comparison, and handoff to deeper validation methods. Do NOT use for internal/external factor inventory (use swot-tows), macro-environment scanning (use pestel), industry profit-pressure diagnosis (use porters-five-forces), integrated strategy cascades (use playing-to-win), durable moat classification (use seven-powers), or quantified option valuation (use expected-value). Do NOT use for Turn strengths, weaknesses, opportunities, and threats into SO, WO, ST, and WT options. Do NOT use for Scan political, economic, social, technological, environmental, and legal forces before market entry."
license: MIT
compatibility: "Markdown, strategy memos, growth planning, market-entry analysis, product strategy, portfolio option review"
allowed-tools: Read Grep WebSearch WebFetch
metadata:
  relations: "{\"boundary\":[\"swot-tows\"]}"
  subject: reasoning-strategy
  scope: "Ansoff product-market growth strategy framing for organizations, products, programs, and initiatives: define the current product and market baseline, classify growth options as market penetration, market development, product development, or diversification, surface strategic distance and risk, state assumptions and evidence needs, compare options without treating quadrant labels as recommendations, and route to validation, strategy-choice, or valuation methods when needed. Excludes SWOT/TOWS situational inventory, PESTEL macro-environment scanning, Five Forces industry-structure diagnosis, Playing to Win integrated strategy formulation, Seven Powers moat-source classification, OKR execution tracking, BCG-style portfolio allocation, and discounted or expected-value valuation."
  taxonomy_domain: foundations/strategy
  stability: stable
  keywords: "[\"Ansoff Matrix\",\"product-market matrix\",\"product market growth\",\"growth vector\",\"market penetration\",\"market development\",\"product development\",\"diversification\",\"growth strategy\",\"expansion strategy\"]"
  triggers: "[\"ansoff\",\"ansoff-matrix\",\"product-market-matrix\",\"product-market-growth\"]"
  examples: "[\"Use the Ansoff Matrix to compare growth options for this product.\",\"Classify these growth ideas as market penetration, market development, product development, or diversification.\",\"Use market penetration, market development, product development, and diversification to map our current-product, new-region, new-product, and new-segment growth options.\",\"Review this Ansoff Matrix and tell me where it confuses products, markets, and recommendations.\",\"Use product-market growth logic to sequence expansion options before we choose one.\"]"
  anti_examples: "[\"Turn strengths, weaknesses, opportunities, and threats into SO, WO, ST, and WT options.\",\"Scan political, economic, social, technological, environmental, and legal forces before market entry.\",\"Analyze supplier power, buyer power, entrants, substitutes, and rivalry.\",\"Turn this strategy into winning aspiration, where to play, how to win, capabilities, and systems.\",\"Classify this company's durable moat source using scale economies, network economies, counter-positioning, switching costs, branding, cornered resource, or process power.\"]"
  grounding: "{\"subject_matter\":\"Ansoff product-market matrix as a portable growth strategy framing method\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://www.econbiz.de/Record/strategies-for-diversification-ansoff-igor/10001836084\",\"https://open.oregonstate.education/strategicmanagement2e/chapter/7-concentration-strategies/\",\"https://open.oregonstate.education/strategicmarketing/chapter/chapter-4-strategy-and-strategic-planning/\",\"skills/skills/reasoning-strategy/ansoff-matrix/references/ansoff-matrix-sources.md\",\"skills/skills/reasoning-strategy/ansoff-matrix/references/upstream-displacement-2026-06-04.md\"],\"failure_modes\":[\"quadrant_label_treated_as_strategy_recommendation\",\"current_product_or_market_baseline_left_implicit\",\"market_development_confused_with_product_development\",\"diversification_risk_understated\",\"evidence_needs_omitted\",\"option_sequence_not_stated\",\"portfolio_allocation_confused_with_product_market_growth\",\"financial_value_claim_made_without_valuation_method\"],\"evidence_priority\":\"general_knowledge_first\"}"
  mental_model: "The Ansoff Matrix is a two-axis growth-option map. The primitives are an actor, a current product baseline, a current market baseline, a proposed product state, a proposed market state, four product-market quadrants, strategic distance, risk, assumptions, evidence needs, resource fit, and sequencing. Existing products in existing markets imply market penetration; existing products in new markets imply market development; new products in existing markets imply product development; new products in new markets imply diversification. The matrix frames growth direction, but it does not prove attractiveness, feasibility, profitability, or strategic coherence by itself."
  purpose: "This skill prevents agents from treating growth as one vague verb. It forces each option to declare what is new, what remains familiar, why the move is plausible, what risk increases with product or market novelty, what evidence is missing, and which downstream method should validate the option before a commitment."
  analogy: "The Ansoff Matrix is like a map at a fork in the road: it shows whether growth stays close to known products and customers or moves into unfamiliar territory, but it does not tell you the road is safe or worth taking."
  misconception: "The common mistake is treating the four boxes as four recommendations. They are not recommendations; they are labels for different kinds of strategic distance. The work begins after classification, when the agent tests evidence, fit, risk, sequencing, and whether another method is needed to choose among options."
  public: "true"
  concept_boundary: "The Ansoff Matrix is for product-market growth direction. It is not a SWOT/TOWS situation inventory, PESTEL macro scan, Five Forces industry-structure diagnosis, Playing to Win strategy cascade, Seven Powers moat taxonomy, BCG portfolio allocation grid, OKR execution system, or financial valuation. Those methods may feed or follow Ansoff analysis, but they do not replace the product-market newness logic."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/reasoning-strategy/ansoff-matrix/SKILL.md
  skill_graph_export_description_projection: anti_examples
  skill_graph_export_description_projection_truncated: "true"
---

## Concept of the skill

**What it is:** The Ansoff Matrix is a product-market growth framework. It classifies growth options by whether the product is existing or new and whether the market is existing or new.

**Mental model:** Define the current product and market first. Then classify each option: sell current products to current markets, sell current products to new markets, build new products for current markets, or build new products for new markets.

**Why it exists:** Agents often talk about growth without stating what is actually changing. This skill makes product and market novelty explicit so risk, assumptions, sequencing, and follow-on validation become visible.

**What it is NOT:** It is not SWOT/TOWS, PESTEL, Five Forces, Playing to Win, Seven Powers, BCG portfolio analysis, OKRs, or a valuation model.

**Adjacent concepts:** product-market fit, growth vectors, concentration strategy, diversification, market entry, product strategy, corporate strategy, strategic distance, option sequencing.

**One-line analogy:** Ansoff maps how far a growth option moves from known products and known customers.

**Common misconception:** The four quadrants do not choose the strategy. They classify growth direction so evidence and validation can decide what to do next.

# Ansoff Matrix

## Domain Context

Use the Ansoff Matrix for business strategy, product strategy, market-entry preparation, corporate growth planning, nonprofit program expansion, and review of existing growth-option work. Use public, aggregate, or synthetic examples only. Do not include personal data, customer data, payment data, secrets, confidential deal details, or private business facts in examples or evals.

The matrix is strongest when the user has several possible growth directions and needs a clear product-market framing before deeper analysis. It is weaker when the decision is already about industry structure, macro forces, durable competitive advantage, portfolio capital allocation, quantified option value, or execution goals.

Use the user's terms when possible. "Product" can mean product, service, program, offer, feature bundle, or solution. "Market" can mean customer segment, use case, geography, channel, industry vertical, buyer type, or mission. Name the definition you choose before classifying options.

## Coverage

This skill teaches agents to:

1. Define the current product and current market baseline before using the matrix.
2. Translate messy growth ideas into product change and market change.
3. Classify options into market penetration, market development, product development, or diversification.
4. Distinguish product novelty from market novelty when both are fuzzy.
5. Surface strategic distance, uncertainty, capability gaps, and evidence needs.
6. Compare and sequence options without pretending a quadrant label is a recommendation.
7. Use lower-risk and higher-risk language carefully, without universal guarantees.
8. Route downstream work to the right method once product-market growth direction is clear.

## Philosophy of the skill

The Ansoff Matrix is useful because it makes growth concrete. "Grow revenue" can mean deeper adoption in a known market, geographic expansion, a new offer for existing customers, or a leap into both a new offer and a new customer world. Those moves differ in evidence needs, capability requirements, uncertainty, and organizational strain.

The method is intentionally simple. Its value comes from disciplined classification and the questions that follow. A good Ansoff pass tells the user what is familiar, what is novel, what must be true, why risk changes, and what validation method should come next. It should never smuggle in a recommendation just because one quadrant sounds more ambitious.

## Workflow

### 1. Frame the growth question

Start by naming the unit of analysis and the baseline.

```text
Actor:
Current product / service / program:
Current customer or market:
Growth objective:
Time horizon:
Geography or channel:
Existing evidence:
Decision this matrix must inform:
```

Reject vague scopes such as "grow the company" or "expand internationally" unless the user explicitly wants a first-pass brainstorm. Narrow by offer, customer segment, channel, geography, mission, or planning horizon.

### 2. Define existing vs new

The matrix depends on a baseline. Existing and new are relative to the actor, not absolute to the world.

| Axis | Existing means | New means | Questions to ask |
| --- | --- | --- | --- |
| Product or offer | The actor already sells, operates, or can deliver it with known capabilities | The actor must build, acquire, adapt, package, or learn a materially different offer | Is the value proposition materially different? Are delivery, support, compliance, or production capabilities different? |
| Market or customer | The actor already serves this segment, channel, geography, use case, or mission | The actor must reach a materially different segment, channel, geography, use case, or mission | Do buying criteria, access channels, regulations, competitors, economics, or adoption behavior change? |

If an option is "mostly existing" but needs adaptation, label the ambiguity and explain the assumption. Do not force a clean quadrant when the product or market boundary is uncertain.

### 3. Map each option to a quadrant

| Quadrant | Product | Market | Core question | Typical evidence needed |
| --- | --- | --- | --- | --- |
| Market penetration | Existing | Existing | Can we get more share, usage, frequency, retention, or revenue from the current market? | current adoption, churn, share, pricing, channel productivity, sales capacity, competitor response |
| Market development | Existing | New | Can the current offer work for a new segment, geography, channel, use case, or mission? | customer differences, distribution access, localization, regulation, willingness to pay, channel economics |
| Product development | New | Existing | Can we build a new or meaningfully changed offer for customers we already understand? | unmet needs, product feasibility, roadmap capacity, adoption intent, support burden, cannibalization |
| Diversification | New | New | Can we credibly enter a new product-market domain? | strategic fit, capability gaps, acquisition vs build, governance, capital needs, learning plan, downside protection |

Do not collapse market development and product development because both sound like "expansion." One changes who or where the offer serves; the other changes what is offered to customers the actor already knows.

### 4. Surface assumptions and risk

For each option, state what becomes less familiar.

```text
Option:
Quadrant:
Product novelty:
Market novelty:
Why this option is plausible:
Evidence already available:
Assumptions:
Strategic distance: low / medium / high
Risk drivers:
Capability gaps:
Next validation:
```

Risk often rises as product and market novelty rise, with diversification usually requiring the largest learning burden. Treat that as a planning heuristic, not a universal law. A poorly executed market penetration move can still be risky; a diversification move can be reduced through acquisition, partnership, staged tests, or prior adjacency.

### 5. Compare and sequence options

A good Ansoff output should help the user decide what to analyze next.

Use these filters:

- Does the option match the stated growth objective and time horizon?
- Is the product or market novelty manageable for this actor?
- What existing capabilities transfer, and what new capabilities are required?
- What evidence would make the option a clear no-go?
- Can the option be staged, piloted, partnered, or acquired?
- Does one option create learning that reduces risk for a later option?
- What method is needed to choose, validate, or finance the option?

When multiple options remain plausible, show a sequence such as "test market penetration first to learn price sensitivity, then market development in one adjacent channel, then revisit product development." Do not imply that lower novelty is always better. Fit to objective matters.

### 6. Route to downstream work

The Ansoff Matrix is an input to strategy work, not the end of it.

| Remaining question | Next method |
| --- | --- |
| What internal strengths/weaknesses and external opportunities/threats shape these options? | SWOT/TOWS |
| What macro forces could help or block this product-market move? | PESTEL |
| Is the target industry structurally attractive? | Porter's Five Forces |
| What integrated strategy should we commit to? | Playing to Win |
| Could the move create or strengthen a durable advantage? | Seven Powers |
| Which option has the best probability-weighted value? | Expected Value |
| Which claims are weak, stale, or unsupported? | Epistemic Grounding |

## Classification Tests

Use these tests when the prompt is ambiguous.

| Prompt pattern | Likely quadrant | Why |
| --- | --- | --- |
| "Increase usage, retention, share, pricing, or frequency among current customers" | Market penetration | Same offer and same market; deeper capture |
| "Sell the same offer through a new channel, region, customer segment, or use case" | Market development | Same offer; new market definition |
| "Build a new tier, feature bundle, service line, or product for current customers" | Product development | New offer; familiar customers |
| "Enter a new category for customers we do not currently serve" | Diversification | New offer and new market |
| "Acquire a company in an adjacent category" | Usually diversification | Treat acquisition as a vehicle; still classify product-market distance |
| "Reposition the current offer for a different job-to-be-done" | Usually market development | Market or mission changed; product may need adaptation |

## Output Template

Use this compact table when the user needs a direct answer.

| Option | Quadrant | Product change | Market change | Strategic distance | Key assumptions | Evidence needed | Next method |
| --- | --- | --- | --- | --- | --- | --- | --- |
| | Market penetration / market development / product development / diversification | Existing/new/adapted | Existing/new/adjacent | Low/medium/high | | | |

Then add:

```text
Best near-term learning move:
Highest-upside but highest-uncertainty move:
No-go trigger:
Recommended next validation:
```

## Quality Checks

Before presenting an Ansoff analysis, verify:

- The current product and current market baseline are explicit.
- Every option is classified by product novelty and market novelty, not by ambition or attractiveness.
- Market development and product development are not swapped.
- Diversification risk is not understated.
- Each option has at least one evidence need or assumption.
- The answer distinguishes classification from recommendation.
- The output routes to a downstream method when the user asks which option to choose.
- No private user or customer data is introduced into examples.

## Failure Modes

| Failure | What it looks like | Fix |
| --- | --- | --- |
| Quadrant as recommendation | "Diversification is best because it has the most growth potential" | Separate classification from attractiveness, feasibility, and value |
| Missing baseline | The answer labels a move "new market" without saying new relative to whom | Define current product and market first |
| Axis swap | New product for existing customers is called market development | Reclassify by product novelty and market novelty |
| Risk oversimplification | "Market penetration is safe; diversification is risky" | State risk drivers and evidence needs for this actor |
| Product-market blur | A channel change, geography change, and feature change are treated as one option | Split into separate options or name the mixed assumption |
| Portfolio confusion | Business units are scored by market growth and relative share | Route portfolio allocation work away from Ansoff |
| Valuation leap | The matrix recommends investment without a financial or expected-value method | Hand off to Expected Value, DCF, or another valuation method when value must be quantified |

## Do NOT Use When

| Instead of Ansoff Matrix | Use | Why |
| --- | --- | --- |
| Internal/external situation inventory and SO/WO/ST/WT option generation | `swot-tows` | SWOT/TOWS owns factor inventory and option crossing |
| External macro-environment scanning | `pestel` | PESTEL owns political, economic, social, technological, environmental, and legal context |
| Industry profitability and competitive pressure | `porters-five-forces` | Five Forces owns buyer, supplier, entrant, substitute, and rivalry mechanics |
| Integrated strategy choice across aspiration, arena, advantage, capabilities, and systems | `playing-to-win` | Playing to Win owns the full strategy cascade |
| Durable moat source classification | `seven-powers` | Seven Powers owns durable power mechanisms |
| Value-curve reconstruction and new-demand creation | `blue-ocean-strategy` | Blue Ocean owns value innovation mechanics |
| Probability-weighted option comparison or financial valuation | `expected-value` | Expected Value owns quantitative comparison after options are modeled |

## Key Sources

- Ansoff, H. Igor. "Strategies for diversification." *Harvard Business Review*, 35(5), 1957, 113-124. Bibliographic record: https://www.econbiz.de/Record/strategies-for-diversification-ansoff-igor/10001836084
- Oregon State University Open Educational Resource, "Concentration Strategies" in *Strategic Management 2E*. https://open.oregonstate.education/strategicmanagement2e/chapter/7-concentration-strategies/
- Oregon State University Open Educational Resource, "Chapter 4: Strategy and Strategic Planning" in *Strategic Marketing in the Global Forest Industries*. https://open.oregonstate.education/strategicmarketing/chapter/chapter-4-strategy-and-strategic-planning/
- Local notes: `references/ansoff-matrix-sources.md` and `references/upstream-displacement-2026-06-04.md`.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `reasoning-strategy`
- Domain: `foundations/strategy`
- Scope: Ansoff product-market growth strategy framing for organizations, products, programs, and initiatives: define the current product and market baseline, classify growth options as market penetration, market development, product development, or diversification, surface strategic distance and risk, state assumptions and evidence needs, compare options without treating quadrant labels as recommendations, and route to validation, strategy-choice, or valuation methods when needed. Excludes SWOT/TOWS situational inventory, PESTEL macro-environment scanning, Five Forces industry-structure diagnosis, Playing to Win integrated strategy formulation, Seven Powers moat-source classification, OKR execution tracking, BCG-style portfolio allocation, and discounted or expected-value valuation.

**When to use**
- Use the Ansoff Matrix to compare growth options for this product.
- Classify these growth ideas as market penetration, market development, product development, or diversification.
- Use market penetration, market development, product development, and diversification to map our current-product, new-region, new-product, and new-segment growth options.
- Review this Ansoff Matrix and tell me where it confuses products, markets, and recommendations.
- Use product-market growth logic to sequence expansion options before we choose one.
- Triggers: `ansoff`, `ansoff-matrix`, `product-market-matrix`, `product-market-growth`

**Not for**
- Turn strengths, weaknesses, opportunities, and threats into SO, WO, ST, and WT options.
- Scan political, economic, social, technological, environmental, and legal forces before market entry.
- Analyze supplier power, buyer power, entrants, substitutes, and rivalry.
- Turn this strategy into winning aspiration, where to play, how to win, capabilities, and systems.
- Classify this company's durable moat source using scale economies, network economies, counter-positioning, switching costs, branding, cornered resource, or process power.

**Concept**
- Mental model: The Ansoff Matrix is a two-axis growth-option map. The primitives are an actor, a current product baseline, a current market baseline, a proposed product state, a proposed market state, four product-market quadrants, strategic distance, risk, assumptions, evidence needs, resource fit, and sequencing. Existing products in existing markets imply market penetration; existing products in new markets imply market development; new products in existing markets imply product development; new products in new markets imply diversification. The matrix frames growth direction, but it does not prove attractiveness, feasibility, profitability, or strategic coherence by itself.
- Purpose: This skill prevents agents from treating growth as one vague verb. It forces each option to declare what is new, what remains familiar, why the move is plausible, what risk increases with product or market novelty, what evidence is missing, and which downstream method should validate the option before a commitment.
- Analogy: The Ansoff Matrix is like a map at a fork in the road: it shows whether growth stays close to known products and customers or moves into unfamiliar territory, but it does not tell you the road is safe or worth taking.
- Common misconception: The common mistake is treating the four boxes as four recommendations. They are not recommendations; they are labels for different kinds of strategic distance. The work begins after classification, when the agent tests evidence, fit, risk, sequencing, and whether another method is needed to choose among options.

**Grounding**
- Mode: `universal`
- Truth sources: `https://www.econbiz.de/Record/strategies-for-diversification-ansoff-igor/10001836084`, `https://open.oregonstate.education/strategicmanagement2e/chapter/7-concentration-strategies/`, `https://open.oregonstate.education/strategicmarketing/chapter/chapter-4-strategy-and-strategic-planning/`, `skills/skills/reasoning-strategy/ansoff-matrix/references/ansoff-matrix-sources.md`, `skills/skills/reasoning-strategy/ansoff-matrix/references/upstream-displacement-2026-06-04.md`

**Keywords**
- `Ansoff Matrix`, `product-market matrix`, `product market growth`, `growth vector`, `market penetration`, `market development`, `product development`, `diversification`, `growth strategy`, `expansion strategy`

<!-- skill-graph-context:end -->
