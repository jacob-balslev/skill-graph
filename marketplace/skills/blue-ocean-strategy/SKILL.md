---
name: blue-ocean-strategy
description: "Use when creating, auditing, or pressure-testing a Blue Ocean Strategy: value innovation, strategy canvas, Four Actions Framework, ERRC grid, six paths, buyer utility, noncustomers, and commercial viability. Covers reconstructing market boundaries, breaking the value-cost trade-off, shifting from competitor benchmarking to alternative/noncustomer insight, and turning the result into a new value curve. Do NOT use for industry-structure diagnosis alone (use porters-five-forces), durable moat classification (use seven-powers), or integrated five-choice strategy cascades (use playing-to-win). Do NOT use for analyze supplier power, buyer power, entrants, substitutes, and rivalry in this industry. Do NOT use for classify which durable moat this company has using Seven Powers. Do NOT use for turn this company strategy into aspiration, where to play, how to win, capabilities, and systems. Do NOT use for rank these roadmap initiatives by impact and effort."
license: MIT
compatibility: "Markdown, strategy memos, market-entry analysis, product strategy, innovation strategy"
allowed-tools: Read Grep
metadata:
  schema_version: "8"
  version: "1.0.0"
  subject: meta-methods
  deployment_target: portable
  scope: "Blue Ocean Strategy for market-creating strategy work: diagnose the current value curve, reconstruct market boundaries, target noncustomers, design eliminate/reduce/raise/create moves, and test utility-price-cost-adoption viability. Excludes Five Forces industry-pressure diagnosis, Seven Powers moat taxonomy, generic positioning copy, and OKR execution tracking."
  taxonomy_domain: foundations/strategy
  owner: skill-graph-maintainer
  freshness: "2026-05-28"
  drift_check: "{\"last_verified\":\"2026-05-28\",\"truth_source_hashes\":{\"skills/skills/meta-methods/blue-ocean-strategy/references/blue-ocean-strategy-sources.md\":\"d985a1d7003dfa0fe468e437471846ce86950cba32db2b53d5f6e9c717a37290\",\"skills/skills/meta-methods/blue-ocean-strategy/references/upstream-displacement-2026-05-28.md\":\"a7818b1441ec7e01974d3b2da1b0af130dd32306c1c4d015d9c246964a4992ee\"}}"
  eval_artifacts: present
  eval_state: unverified
  routing_eval: absent
  stability: stable
  keywords: "[\"blue ocean strategy\",\"value innovation\",\"strategy canvas\",\"four actions framework\",\"ERRC grid\",\"eliminate reduce raise create\",\"six paths framework\",\"buyer utility map\",\"three tiers of noncustomers\",\"uncontested market space\"]"
  examples: "[\"apply Blue Ocean Strategy to this crowded market\",\"build a strategy canvas and ERRC grid for our product category\",\"how can we create new demand instead of competing feature-for-feature?\",\"use the six paths framework to find market boundary reconstruction options\",\"pressure-test whether this idea is real value innovation or just differentiation\"]"
  anti_examples: "[\"analyze supplier power, buyer power, entrants, substitutes, and rivalry in this industry\",\"classify which durable moat this company has using Seven Powers\",\"turn this company strategy into aspiration, where to play, how to win, capabilities, and systems\",\"rank these roadmap initiatives by impact and effort\"]"
  relations: "{\"boundary\":[{\"skill\":\"porters-five-forces\",\"reason\":\"blue-ocean-strategy owns value-curve redesign and market-boundary reconstruction when the task is to create new demand rather than diagnose existing industry profit pressure\"},{\"skill\":\"seven-powers\",\"reason\":\"blue-ocean-strategy owns market-creating value innovation; seven-powers should not co-route when the task is not durable firm-level power classification\"},{\"skill\":\"playing-to-win\",\"reason\":\"blue-ocean-strategy owns Blue Ocean tools such as the strategy canvas, ERRC grid, noncustomers, and utility-price-cost adoption tests; playing-to-win should not co-route when the task is specifically value-innovation design\"},{\"skill\":\"prioritization\",\"reason\":\"blue-ocean-strategy owns strategic value-curve choices before an initiative list exists; prioritization should not co-route when the task is market-creating strategy design\"}],\"related\":[\"playing-to-win\",\"porters-five-forces\",\"seven-powers\",\"framework-fit-analysis\",\"constraint-awareness\"],\"verify_with\":[\"epistemic-grounding\",\"methodology\"]}"
  grounding: "{\"subject_matter\":\"Blue Ocean Strategy by W. Chan Kim and Renee Mauborgne\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://www.blueoceanstrategy.com/what-is-blue-ocean-strategy/\",\"https://www.blueoceanstrategy.com/tools/value-innovation/\",\"https://www.blueoceanstrategy.com/tools/strategy-canvas/\",\"https://www.blueoceanstrategy.com/tools/four-actions-framework/\",\"https://www.blueoceanstrategy.com/tools/errc-grid/\",\"https://www.blueoceanstrategy.com/tools/six-paths-framework/\",\"https://www.blueoceanstrategy.com/tools/buyer-utility-map/\",\"https://www.blueoceanstrategy.com/tools/three-tiers-of-noncustomers/\",\"skills/skills/meta-methods/blue-ocean-strategy/references/blue-ocean-strategy-sources.md\",\"skills/skills/meta-methods/blue-ocean-strategy/references/upstream-displacement-2026-05-28.md\"],\"failure_modes\":[\"competitor_benchmarking_disguised_as_blue_ocean\",\"differentiation_without_cost_logic\",\"low_cost_without_buyer_utility\",\"ERRC_grid_lists_actions_without_new_value_curve\",\"current_customers_only_no_noncustomers\",\"six_paths_used_as_brainstorming_without_boundary_reconstruction\",\"commercial_viability_not_tested\"],\"evidence_priority\":\"general_knowledge_first\"}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":365,\"review_cadence\":\"quarterly\"}"
  comprehension_state: present
  mental_model: "Blue Ocean Strategy treats strategy as reconstruction of demand and value, not as winning a head-to-head fight inside fixed industry boundaries. The primitives are the current strategic profile, factors of competition, buyer utility, price, cost, adoption hurdles, noncustomers, alternative markets, and the eliminate/reduce/raise/create choices that produce a new value curve. A valid blue ocean move lifts buyer value and lowers or changes cost logic enough to open new demand."
  purpose: "This skill prevents agents from calling ordinary differentiation, feature bundling, or low-price competition a blue ocean. It forces the work through the strategy canvas, boundary reconstruction, noncustomer insight, the Four Actions Framework, ERRC grid, and commercial viability checks so the answer shows how the move creates new demand rather than merely performing better on the old industry's factors."
  boundary: "Blue Ocean Strategy is for designing value innovation and new market space. It is not Porter's Five Forces industry-structure diagnosis, Seven Powers moat-source classification, Playing to Win integrated strategy-cascade formulation, generic positioning, OKR execution design, or backlog prioritization. Those methods may feed or follow the work, but they do not replace value-curve reconstruction."
  analogy: Blue Ocean Strategy is like redrawing a game board so new players want to enter and old scoring rules stop deciding the winner.
  misconception: "The common mistake is treating Blue Ocean Strategy as creative differentiation or an instruction to avoid competitors. The method is stricter: it must reconstruct buyer value, reduce or eliminate costly old factors, create or raise factors that unlock demand, and pass utility, price, cost, and adoption tests."
  structural_verdict: PASS
  truth_verdict: BROKEN
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  drift_status: EXTERNAL_UNHASHED
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/meta-methods/blue-ocean-strategy/SKILL.md
  skill_graph_export_description_projection: anti_examples+boundary
  skill_graph_export_description_projection_truncated: "true"
---

## Concept of the skill

**What it is:** Blue Ocean Strategy is W. Chan Kim and Renee Mauborgne's market-creating strategy method. It helps an agent design value innovation by breaking from head-to-head competition and reconstructing market boundaries, buyer utility, price, and cost around a new value curve.

**Mental model:** Start with the industry's current strategy canvas, then ask which factors buyers receive and which factors the industry overfunds. Use six paths and noncustomer analysis to find demand outside the accepted boundary. Use eliminate, reduce, raise, and create choices to design a value curve that is meaningfully different and commercially viable.

**Why it exists:** Agents often say "blue ocean" when they mean niche positioning, feature differentiation, or cheaper pricing. This skill forces the answer to show the mechanism of new demand creation.

**What it is NOT:** It is not Five Forces, Seven Powers, Playing to Win, SWOT, generic innovation brainstorming, or a moat claim.

**Adjacent concepts:** value innovation, strategy canvas, value curve, Four Actions Framework, ERRC grid, six paths, buyer utility, noncustomers, price corridor, adoption hurdles.

**One-line analogy:** Blue Ocean Strategy redraws the game board rather than playing harder on the existing one.

**Common misconception:** A blue ocean is not merely "different." It must create a leap in buyer value while changing the cost structure enough that the strategy is viable.

# Blue Ocean Strategy

## Coverage

This skill teaches agents to:

1. Separate Blue Ocean Strategy from generic differentiation, low-cost competition, and competitor avoidance.
2. Draw the current strategy canvas and identify the industry's accepted factors of competition.
3. Use the six paths framework to reconstruct market boundaries.
4. Look beyond current customers to the three tiers of noncustomers.
5. Use buyer utility to find utility blocks and demand-expansion opportunities.
6. Apply the Four Actions Framework and ERRC grid to create a new value curve.
7. Test value innovation against utility, strategic price, target cost, and adoption hurdles.
8. Translate the analysis into a clear strategic profile, risks, and next evidence requests.

## Philosophy of the skill

Blue Ocean Strategy is useful because it makes innovation accountable to both value and economics. A creative idea is not enough. A lower price is not enough. A new segment is not enough. The method asks whether the offering changes what buyers value, removes costly assumptions from the old category, reaches latent demand, and can be delivered with a coherent profit logic.

The skill should make an agent less impressed by novelty and more disciplined about reconstruction. The goal is not to ignore competitors; it is to understand the old competitive logic well enough to escape it on purpose.

## Workflow

### 1. Define the current red-ocean frame

State the category before changing it.

```text
Industry or category:
Geography or channel:
Current buyer group:
Current competitors and alternatives:
Current factors of competition:
Current cost drivers:
Current noncustomers:
```

If the category is too broad, narrow it before drawing the strategy canvas. "Healthcare", "AI tools", or "education" is too broad for useful factor-level analysis.

### 2. Draw the strategy canvas

List the factors the industry competes on and invests in, then compare the current offering, major rivals, and alternatives.

| Factor of competition | Industry emphasis | Our current level | Alternative level | Buyer value evidence |
| --- | --- | --- | --- | --- |
| Price | high / medium / low | | | |
| Convenience | high / medium / low | | | |
| Trust or risk reduction | high / medium / low | | | |
| Speed | high / medium / low | | | |
| Customization | high / medium / low | | | |

Use factors buyers can recognize. Internal activities such as "machine learning pipeline quality" only belong on the canvas if buyers directly experience them as utility, price, risk, speed, simplicity, status, or reliability.

### 3. Search across the six paths

Use the six paths to find new demand by changing the lens.

| Path | Question |
| --- | --- |
| Alternative industries | What do buyers use to solve the same job outside this industry? |
| Strategic groups | What trade-offs separate premium, mid-market, and low-cost groups? |
| Buyer groups | Who buys, uses, influences, maintains, or pays, and what changes if the target buyer shifts? |
| Complementary offerings | What happens before, during, or after use that shapes value? |
| Functional-emotional orientation | Is the category over-indexed on function when emotion matters, or the reverse? |
| Time | Which trends are irreversible enough to reshape value before the industry catches up? |

Do not present all six paths as equal. Name the one or two paths with the strongest evidence.

### 4. Look to noncustomers

Blue oceans usually come from demand beyond current loyal buyers.

| Tier | Who they are | Useful question |
| --- | --- | --- |
| First tier | Buyers on the edge who minimally use the category and may leave | What makes them tolerate the category rather than love it? |
| Second tier | Buyers who consciously refuse the category | What barrier, trade-off, price, complexity, or risk makes them opt out? |
| Third tier | Buyers distant from the current category | What alternative job, context, or constraint keeps them outside the market definition? |

Current-customer feedback can improve the red ocean. Noncustomer insight is what can reshape demand.

### 5. Apply eliminate, reduce, raise, and create

Turn insight into a new value curve.

| Action | Question | Good answer | Weak answer |
| --- | --- | --- | --- |
| Eliminate | Which accepted factors should disappear? | Removes costly features, rituals, channels, or complexity buyers do not value | Removes anything expensive without checking utility |
| Reduce | Which factors should fall below industry standard? | Lowers over-served factors that do not drive demand | Cuts quality where buyers still care |
| Raise | Which factors should rise above industry standard? | Lifts utility, trust, access, speed, or simplicity in a way buyers notice | Raises every factor and inflates cost |
| Create | Which factors should appear for the first time? | Adds a new utility source that unlocks noncustomers | Adds novelty without demand evidence |

The ERRC grid is not a brainstorm list. It must produce a new strategic profile that is divergent, focused, and easy to explain.

### 6. Test commercial viability

Do not stop at a novel value curve.

```text
Buyer utility:
- What utility block is removed?
- Which buyer experience stage improves?
- Which noncustomer tier becomes reachable?

Strategic price:
- What price opens mass demand or a larger market?
- Which alternative sets the price reference?

Target cost:
- Which eliminated or reduced factors fund the new curve?
- What operating model makes the price profitable?

Adoption:
- What buyer, partner, channel, employee, or regulator resistance could block the move?
- What must be true for adoption to work?
```

A move that increases value but cannot hit target cost is not value innovation. A move that lowers cost but does not unlock buyer utility is low-cost competition.

## Output Template

```markdown
## Blue Ocean Strategy Pass

### Current Strategy Canvas
Industry/category:
Current factors of competition:
Current strategic profile:
Similarity trap:

### Boundary Reconstruction
Strongest six-path lens:
Alternative/noncustomer insight:
Demand creation hypothesis:

### ERRC Grid
| Eliminate | Reduce | Raise | Create |
| --- | --- | --- | --- |
| | | | |

### New Value Curve
Focused factors:
Divergence from current industry logic:
Simple tagline:

### Commercial Viability
- Buyer utility:
- Strategic price:
- Target cost:
- Adoption hurdles:

### Evidence Gaps
- What must be tested:
- What would disprove this is a blue ocean:
- What would make this only ordinary differentiation:
```

## Anti-Patterns

| Anti-pattern | Why it fails | Repair |
| --- | --- | --- |
| Competitor benchmarking with a blue-ocean label | It optimizes the old factors of competition | Start with the strategy canvas, then reconstruct factors |
| Raise/create only | It increases buyer value but usually raises cost | Add eliminate/reduce moves that fund the new curve |
| Cost cutting only | It lowers cost without creating new demand | Tie reductions to buyer utility and noncustomer conversion |
| Current-customer-only research | It improves current demand instead of unlocking latent demand | Analyze all three tiers of noncustomers |
| Novelty as strategy | New features are not value innovation by themselves | Test utility, price, cost, and adoption |
| Six paths as loose brainstorming | The framework becomes a creativity prompt | Show which boundary is reconstructed and why it matters |

## Boundaries

Use Blue Ocean Strategy when the task is to create new demand through value innovation.

Use another tool when the task is narrower:

| Need | Better owner |
| --- | --- |
| Industry attractiveness, bargaining power, entrants, substitutes, rivalry | `porters-five-forces` |
| Durable moat source classification | `seven-powers` |
| Integrated choices across aspiration, arena, advantage, capabilities, systems | `playing-to-win` |
| Choosing among strategy frameworks | `framework-fit-analysis` |
| Ranking a known list of initiatives | `prioritization` |
| Designing verification gates for a process | `methodology` |

## Verification

Before finishing, verify:

- [ ] The current industry/category and factors of competition are explicit.
- [ ] The answer includes a current strategy canvas or value-curve comparison.
- [ ] At least one six-path lens is used to reconstruct a market boundary.
- [ ] Noncustomers are considered, not only current customers.
- [ ] The ERRC grid includes eliminate, reduce, raise, and create moves.
- [ ] The proposed curve is focused and divergent, not "raise everything."
- [ ] Buyer utility, strategic price, target cost, and adoption hurdles are tested.
- [ ] The answer labels assumptions and evidence gaps.
- [ ] The response does not present ordinary differentiation, low price, Five Forces, Seven Powers, OKRs, or a Playing to Win cascade as Blue Ocean Strategy.

## References

- `references/blue-ocean-strategy-sources.md`
- `references/upstream-displacement-2026-05-28.md`
