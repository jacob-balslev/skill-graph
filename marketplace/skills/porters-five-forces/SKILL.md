---
name: porters-five-forces
description: "Use when analyzing an industry's competitive structure and profit pool using Porter's Five Forces: rivalry among existing competitors, threat of new entrants, bargaining power of suppliers, bargaining power of buyers, and threat of substitutes. Covers industry-boundary definition, force-by-force diagnostics, structural drivers, dynamic trends, profitability implications, strategic positioning options, and the distinction between industry attractiveness and firm-specific advantage. Do NOT use for creating an integrated strategy cascade (use playing-to-win), classifying durable moat sources (use Seven Powers when available), backlog scoring (use prioritization), or generic market sizing. Do NOT use for turn this vague product strategy into where-to-play and how-to-win choices. Do NOT use for rank these roadmap items by expected impact. Do NOT use for estimate the TAM for this market. Do NOT use for classify this company's durable moat source. Do NOT use for write OKRs for the chosen strategy."
license: MIT
compatibility: "Markdown, strategy memos, market-entry analysis, competitive strategy, executive decision-making"
allowed-tools: Read Grep
metadata:
  last_audited: "2026-05-31"
  lint_verdict: PASS
  schema_version: "8"
  version: "1.0.0"
  subject: reasoning-strategy
  deployment_target: portable
  scope: "Industry competitive-structure analysis using Porter's Five Forces — defining industry boundaries, diagnosing each of the five forces (rivalry, new entrants, supplier power, buyer power, substitutes) by their structural drivers, reading dynamic trends, and translating force intensity into profit-pool and positioning implications. Portable across any domain doing competitive or market-structure analysis; principle-grounded, not repo-bound. Excludes integrated strategy-cascade design (playing-to-win), durable-moat classification (seven-powers), task/option scoring (prioritization), and generic market sizing."
  taxonomy_domain: foundations/strategy
  owner: skill-graph-maintainer
  freshness: "2026-05-31"
  drift_check: "{\"last_verified\":\"2026-05-26\",\"truth_source_hashes\":{\"skills/meta-methods/porters-five-forces/references/porters-five-forces-sources.md\":\"66c6fd769ae91f3815b7c34e4fe2c80809b12203bf4e2c5c05220517b4746511\",\"skills/meta-methods/porters-five-forces/references/upstream-displacement-2026-05-26.md\":\"eab1270c9ca85a16946d067291a2e74d4effa88ea1649a7f2c3de3914e515b8c\"}}"
  eval_artifacts: present
  eval_state: unverified
  routing_eval: absent
  comprehension_state: present
  stability: stable
  keywords: "[\"porter five forces\",\"porters five forces\",\"five forces\",\"industry structure\",\"competitive forces\",\"industry attractiveness\",\"buyer power\",\"supplier power\",\"threat of entrants\",\"threat of substitutes\",\"competitive rivalry\"]"
  examples: "[\"analyze this market with Porter's Five Forces\",\"which forces make this industry unattractive?\",\"is supplier power or buyer power the bigger risk in this category?\",\"we are entering a new market; diagnose industry structure before we choose a position\",\"map how substitutes and new entrants could change the profit pool\"]"
  anti_examples: "[\"turn this vague product strategy into where-to-play and how-to-win choices\",\"rank these roadmap items by expected impact\",\"estimate the TAM for this market\",\"classify this company's durable moat source\",\"write OKRs for the chosen strategy\"]"
  relations: "{\"boundary\":[{\"skill\":\"playing-to-win\",\"reason\":\"playing-to-win owns integrated strategy choices; porters-five-forces owns upstream industry-structure diagnosis\"},{\"skill\":\"prioritization\",\"reason\":\"prioritization scores tasks or options; porters-five-forces analyzes industry forces and profit-pool pressure\"},{\"skill\":\"framework-fit-analysis\",\"reason\":\"framework-fit-analysis chooses among methods or technologies; porters-five-forces applies one specific competitive-structure framework\"}],\"related\":[\"playing-to-win\",\"constraint-awareness\",\"epistemic-grounding\",\"framework-fit-analysis\"],\"verify_with\":[\"epistemic-grounding\",\"constraint-awareness\"]}"
  grounding: "{\"subject_matter\":\"Porter's Five Forces competitive strategy framework\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://www.isc.hbs.edu/strategy/business-strategy/Pages/the-five-forces.aspx\",\"https://hbr.org/2008/01/the-five-competitive-forces-that-shape-strategy\",\"skills/meta-methods/porters-five-forces/references/porters-five-forces-sources.md\",\"skills/meta-methods/porters-five-forces/references/upstream-displacement-2026-05-26.md\"],\"failure_modes\":[\"industry_boundary_too_broad\",\"direct_competitor_only_view\",\"force_names_listed_without_drivers\",\"firm_strength_confused_with_industry_structure\",\"substitutes_confused_with_rivals\",\"market_size_substituted_for_profitability\",\"static_snapshot_ignores_trends\"],\"evidence_priority\":\"general_knowledge_first\"}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":365,\"review_cadence\":\"quarterly\"}"
  mental_model: "Porter's Five Forces treats profitability as a structural outcome of five pressures around an industry, not just the visible fight among direct competitors. The primitives are the industry boundary, buyers, suppliers, potential entrants, substitutes, current rivals, structural drivers behind each force, and the resulting division of economic value across the profit pool."
  purpose: "This skill prevents agents from mistaking a market summary, TAM estimate, competitor list, or company-strength memo for competitive strategy analysis. It replaces shallow market attractiveness prose with a force-by-force diagnosis of who can capture value, who can bid it away, which forces are changing, and what strategic position or no-go decision follows."
  boundary: "Five Forces is for industry-structure and profit-pool diagnosis. It is not a Playing to Win strategy cascade, Seven Powers moat taxonomy, SWOT inventory, PESTEL macro scan, market-sizing model, OKR system, backlog prioritization method, or firm-specific capability audit. Those tools can feed or follow the analysis, but they do not replace the five structural forces."
  analogy: "Five Forces is like checking the pressure on all sides of a container: the firm may be strong, but the industry's structure determines where the pressure leaks value away."
  misconception: "The common mistake is treating Five Forces as a checklist of five labels or as a direct-competitor analysis. The method only works when each force is tied to structural drivers and then translated into profitability, positioning, and change over time."
  structural_verdict: PASS
  truth_verdict: UNVERIFIED
  comprehension_verdict: SKIPPED_BASELINE_HIGH
  application_verdict: UNVERIFIED
  eval_score: "4.17"
  eval_failed_ids: "[]"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/reasoning-strategy/porters-five-forces/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# Porter's Five Forces

## Concept Card

**What it is:** Porter's Five Forces is Michael Porter's competitive strategy framework for diagnosing industry structure: rivalry among existing competitors, threat of new entrants, bargaining power of suppliers, bargaining power of buyers, and threat of substitutes.

**Mental model:** Competition for profits is broader than direct rivalry. Buyers, suppliers, entrants, substitutes, and current competitors each pressure the profit pool. The strategist's job is to understand which forces are strong, why they are strong, how they are changing, and how to position or reshape the business accordingly.

**Why it exists:** Agents often answer market-entry or competitive-strategy questions with a market-size summary, a competitor list, or generic strengths and weaknesses. Five Forces forces the analysis toward structural profit pressure: who can capture value, who can bid it away, and what that implies for strategy.

**What it is not:** It is not a strategy cascade, moat taxonomy, macro trend scan, firm capability audit, SWOT list, or TAM model. Those can support the work, but Five Forces owns industry-structure diagnosis.

**Adjacent concepts:** Industry attractiveness, profit pool, entry barriers, supplier concentration, buyer concentration, substitutes, rivalry intensity, positioning, reshaping industry structure.

**One-line analogy:** Five Forces is a pressure map around the profit pool.

**Common misconception:** Direct competitors are only one force. A quiet industry with powerful suppliers, powerful buyers, easy entry, or strong substitutes can still be structurally unattractive.

## Coverage

This skill teaches agents to:

1. Define the industry boundary before analyzing forces.
2. Separate industry structure from firm-specific strengths.
3. Diagnose all five forces using structural drivers, not generic labels.
4. Distinguish substitutes from rivals.
5. Explain how each force affects price, cost, investment, and value capture.
6. Evaluate how trends change force strength over time.
7. Translate the analysis into positioning, reshape, or no-go implications.
8. Avoid false precision and unsupported force scores.

## Philosophy

Five Forces is useful because it turns "is this a good market?" into a structural question. Market growth and customer demand can be attractive while profit potential remains weak because suppliers capture the value, buyers force concessions, substitutes cap willingness to pay, entry keeps prices low, or rivalry burns margin.

The framework is not a worksheet. Naming the five forces is not analysis. A useful Five Forces pass names the structural drivers behind each force and connects them to profitability. It also treats industry structure as dynamic: technology, regulation, distribution, standards, and business model shifts can change the forces.

## Workflow

### 1. Define the industry boundary

State the unit of analysis before scoring anything.

```text
Industry:
Geography:
Customer segment:
Product/service category:
Value-chain stage:
Time horizon:
Relevant alternatives:
```

If the boundary is too broad, split it. "Software", "retail", or "AI tools" is usually too broad for a useful force diagnosis.

### 2. Diagnose each force

Use structural drivers. Do not stop at high/medium/low labels.

| Force | Core question | Common structural drivers |
| --- | --- | --- |
| Threat of new entrants | How easily can new capacity enter and pressure prices or costs? | Economies of scale, switching costs, capital requirements, distribution access, regulation, brand, network effects, expected retaliation |
| Supplier power | Can suppliers raise input costs, restrict quality, or capture value? | Supplier concentration, differentiated inputs, switching costs, scarce talent or infrastructure, forward integration threat, lack of substitute inputs |
| Buyer power | Can customers force lower prices or higher service at the same price? | Buyer concentration, purchase volume, price sensitivity, product standardization, low switching costs, backward integration threat |
| Threat of substitutes | Can a different solution meet the same underlying need? | Attractive price-performance tradeoff, low switching costs, changing customer behavior, adjacent technologies, do-it-yourself or no-consumption alternatives |
| Rivalry among existing competitors | Do current competitors compete away value? | Number and balance of rivals, slow growth, high fixed costs, low differentiation, exit barriers, capacity additions, diverse goals |

### 3. Score force strength with evidence

Use qualitative ratings only when tied to evidence.

```text
Force:
Strength: low / medium / high
Evidence:
Profitability implication:
Trend direction: weakening / stable / strengthening
Uncertainty:
```

Avoid fake numeric precision unless the user supplies real data. A precise-looking 7.2/10 score without evidence is weaker than a clear qualitative judgment.

### 4. Explain the profit-pool effect

After the five force passes, explain how value is divided.

Ask:

- Which actors capture the most value today?
- Which actors can force concessions?
- Which forces cap price?
- Which forces raise cost or required investment?
- Which force is most likely to change in the chosen time horizon?
- Is the industry attractive, unattractive, or attractive only for a specific position?

### 5. Translate analysis into strategy implications

Five Forces should end with strategic implications, not a table alone.

Useful implications include:

- choose a narrower industry segment,
- position away from the strongest force,
- build switching costs,
- differentiate against substitutes,
- vertically integrate or multi-source to reduce supplier power,
- target a buyer segment with lower price sensitivity,
- reshape the industry through standards, channels, partnerships, or business model changes,
- decline entry when the structure is persistently unattractive.

## Output Template

Use this compact shape for market-entry or strategy work.

```text
Five Forces analysis

Industry boundary:
- Geography:
- Customer segment:
- Product/service category:
- Value-chain stage:
- Time horizon:

Force diagnosis:
1. New entrants
   - Strength:
   - Structural drivers:
   - Profit implication:
   - Trend:
2. Supplier power
   - Strength:
   - Structural drivers:
   - Profit implication:
   - Trend:
3. Buyer power
   - Strength:
   - Structural drivers:
   - Profit implication:
   - Trend:
4. Substitutes
   - Strength:
   - Structural drivers:
   - Profit implication:
   - Trend:
5. Rivalry
   - Strength:
   - Structural drivers:
   - Profit implication:
   - Trend:

Overall attractiveness:
Most important force:
Strategic implication:
Evidence gaps:
```

## Anti-Patterns

| Anti-pattern | Why it fails | Repair |
| --- | --- | --- |
| Direct-rival-only analysis | Ignores four forces that can capture or destroy profits | Analyze entrants, suppliers, buyers, and substitutes explicitly |
| Market-size substitution | A large market can still be structurally unattractive | Connect structure to profitability, not just demand |
| Firm-strength confusion | A strong company can sit in a bad industry; a weak company can sit in a good one | Separate industry structure from relative position |
| Substitute/rival confusion | Substitutes meet the same need differently; rivals sell similar category offers | Define the customer need, then list different ways to meet it |
| Static snapshot | Industry structure changes with technology, regulation, and behavior | Add trend direction and time horizon to each force |
| Force-label checklist | Labels without drivers do not explain profit pressure | Name the structural drivers and value-capture mechanism |
| Universal "sixth force" add-on | Complementors can matter, but adding a sixth box often hides the original mechanism | Mention complements only when they materially change one of the five forces or value capture |

## Boundaries

Use Five Forces when the task is to diagnose industry structure and profit pressure.

Use another tool when the task is narrower or downstream:

| Need | Better owner |
| --- | --- |
| Integrated strategy choices: aspiration, where to play, how to win, capabilities, systems | `playing-to-win` |
| Durable moat source taxonomy | Seven Powers skill when available |
| Internal strengths, weaknesses, opportunities, and threats | SWOT/TOWS skill when available |
| Macro-environment scan | PESTEL skill when available |
| Execution goals and measurable results | OKRs skill when available |
| Ranking backlog items or initiatives | `prioritization` |
| Choosing which framework to apply | `framework-fit-analysis` |

## Verification

Before finishing, verify:

- [ ] The industry boundary is explicit.
- [ ] All five forces are analyzed.
- [ ] Each force includes structural drivers, not just a label.
- [ ] Substitutes are separated from direct rivals.
- [ ] Industry structure is separated from firm-specific capability.
- [ ] Profitability implications are named.
- [ ] Dynamic trends and time horizon are considered.
- [ ] Strategic implications follow from the strongest forces.
- [ ] Unverified assumptions and evidence gaps are labeled.
- [ ] The response does not present market size, SWOT, PESTEL, OKRs, or a Playing to Win cascade as a Five Forces analysis.

## References

- `references/porters-five-forces-sources.md`
- `references/upstream-displacement-2026-05-26.md`

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `reasoning-strategy`
- Deployment: `portable`
- Domain: `foundations/strategy`
- Scope: Industry competitive-structure analysis using Porter's Five Forces — defining industry boundaries, diagnosing each of the five forces (rivalry, new entrants, supplier power, buyer power, substitutes) by their structural drivers, reading dynamic trends, and translating force intensity into profit-pool and positioning implications. Portable across any domain doing competitive or market-structure analysis; principle-grounded, not repo-bound. Excludes integrated strategy-cascade design (playing-to-win), durable-moat classification (seven-powers), task/option scoring (prioritization), and generic market sizing.

**When to use**
- analyze this market with Porter's Five Forces
- which forces make this industry unattractive?
- is supplier power or buyer power the bigger risk in this category?
- we are entering a new market; diagnose industry structure before we choose a position
- map how substitutes and new entrants could change the profit pool

**Not for**
- turn this vague product strategy into where-to-play and how-to-win choices
- rank these roadmap items by expected impact
- estimate the TAM for this market
- classify this company's durable moat source
- write OKRs for the chosen strategy
- Owned by `playing-to-win`: integrated strategy choices
- Owned by `prioritization`
- Owned by `framework-fit-analysis`

**Related skills**
- Verify with: `epistemic-grounding`, `constraint-awareness`
- Related: `playing-to-win`, `constraint-awareness`, `epistemic-grounding`, `framework-fit-analysis`

**Concept**
- Mental model: Porter's Five Forces treats profitability as a structural outcome of five pressures around an industry, not just the visible fight among direct competitors. The primitives are the industry boundary, buyers, suppliers, potential entrants, substitutes, current rivals, structural drivers behind each force, and the resulting division of economic value across the profit pool.
- Purpose: This skill prevents agents from mistaking a market summary, TAM estimate, competitor list, or company-strength memo for competitive strategy analysis. It replaces shallow market attractiveness prose with a force-by-force diagnosis of who can capture value, who can bid it away, which forces are changing, and what strategic position or no-go decision follows.
- Boundary: Five Forces is for industry-structure and profit-pool diagnosis. It is not a Playing to Win strategy cascade, Seven Powers moat taxonomy, SWOT inventory, PESTEL macro scan, market-sizing model, OKR system, backlog prioritization method, or firm-specific capability audit. Those tools can feed or follow the analysis, but they do not replace the five structural forces.
- Analogy: Five Forces is like checking the pressure on all sides of a container: the firm may be strong, but the industry's structure determines where the pressure leaks value away.
- Common misconception: The common mistake is treating Five Forces as a checklist of five labels or as a direct-competitor analysis. The method only works when each force is tied to structural drivers and then translated into profitability, positioning, and change over time.

**Grounding**
- Mode: `universal`
- Truth sources: `https://www.isc.hbs.edu/strategy/business-strategy/Pages/the-five-forces.aspx`, `https://hbr.org/2008/01/the-five-competitive-forces-that-shape-strategy`, `skills/meta-methods/porters-five-forces/references/porters-five-forces-sources.md`, `skills/meta-methods/porters-five-forces/references/upstream-displacement-2026-05-26.md`

**Keywords**
- `porter five forces`, `porters five forces`, `five forces`, `industry structure`, `competitive forces`, `industry attractiveness`, `buyer power`, `supplier power`, `threat of entrants`, `threat of substitutes`, `competitive rivalry`

<!-- skill-graph-context:end -->
