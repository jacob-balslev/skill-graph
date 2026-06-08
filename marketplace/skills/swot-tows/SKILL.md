---
name: swot-tows
description: "Use when turning internal/external situation analysis into strategic options with SWOT and TOWS: strengths, weaknesses, opportunities, threats, evidence quality, SO/WO/ST/WT option generation, and action hypotheses. Covers separating internal from external factors, avoiding unsupported laundry lists, crossing quadrants into strategy options, and naming what evidence or method should follow. Do NOT use for industry profit-pressure diagnosis (use porters-five-forces), durable moat classification (use seven-powers), value-curve redesign (use blue-ocean-strategy), integrated strategy cascades (use playing-to-win), or quantified option comparison (use expected-value). Do NOT use for Analyze supplier power, buyer power, entrants, substitutes, and rivalry. Do NOT use for Classify this company's durable moat source. Do NOT use for Create a strategy canvas and ERRC grid for a new market space. Do NOT use for Turn this strategy into winning aspiration, where to play, how to win, capabilities, and systems."
license: MIT
compatibility: "Markdown, strategy memos, planning workshops, business plans, product strategy, nonprofit and project planning"
allowed-tools: Read Grep
metadata:
  subject: reasoning-strategy
  scope: "SWOT and TOWS strategy option generation for organizations, products, programs, and projects: separate internal strengths/weaknesses from external opportunities/threats, attach evidence and uncertainty, convert the four-quadrant inventory into SO/WO/ST/WT strategic options, and identify follow-on validation. Excludes Five Forces industry-structure diagnosis, Seven Powers moat-source classification, Blue Ocean value innovation, Playing to Win strategy-cascade design, OKR execution tracking, and quantified expected-value comparison."
  taxonomy_domain: foundations/strategy
  stability: stable
  keywords: "[\"SWOT\",\"TOWS\",\"SWOT analysis\",\"TOWS matrix\",\"strengths weaknesses opportunities threats\",\"SO strategies\",\"WO strategies\",\"ST strategies\",\"WT strategies\",\"situational analysis\"]"
  triggers: "[\"swot-tows\",\"SWOT\",\"TOWS\",\"swot-analysis\",\"tows-matrix\"]"
  examples: "[\"Build a SWOT and TOWS matrix for this product strategy.\",\"Turn these strengths, weaknesses, opportunities, and threats into strategic options.\",\"We have a SWOT table but no actions; convert it into SO, WO, ST, and WT options.\",\"Check whether this SWOT analysis confuses internal weaknesses with external threats.\",\"Use TOWS to generate strategy hypotheses from this planning workshop output.\"]"
  anti_examples: "[\"Analyze supplier power, buyer power, entrants, substitutes, and rivalry.\",\"Classify this company's durable moat source.\",\"Create a strategy canvas and ERRC grid for a new market space.\",\"Turn this strategy into winning aspiration, where to play, how to win, capabilities, and systems.\",\"Calculate the expected value of these strategic options.\"]"
  relations: "{\"boundary\":[{\"skill\":\"porters-five-forces\",\"reason\":\"swot-tows owns internal/external factor inventory and option generation; porters-five-forces owns industry profit-pressure structure, not SWOT/TOWS quadrant crossing\"},{\"skill\":\"seven-powers\",\"reason\":\"swot-tows owns situation inventory and strategy-option generation; seven-powers owns durable firm-level power classification\"},{\"skill\":\"blue-ocean-strategy\",\"reason\":\"swot-tows owns factor crossing into SO/WO/ST/WT options; blue-ocean-strategy owns value-curve reconstruction and new-demand design\"},{\"skill\":\"playing-to-win\",\"reason\":\"swot-tows owns situational option generation before strategy-choice integration; playing-to-win owns the five-choice strategy cascade\"},{\"skill\":\"expected-value\",\"reason\":\"swot-tows owns qualitative option generation from factors; expected-value owns probability-weighted comparison after outcomes, probabilities, and values are modeled\"},{\"skill\":\"okrs\",\"reason\":\"swot-tows owns strategic diagnosis and option generation; okrs owns objective and key-result execution tracking after choices are made\"}],\"related\":[\"porters-five-forces\",\"seven-powers\",\"blue-ocean-strategy\",\"playing-to-win\",\"positioning\",\"okrs\",\"expected-value\",\"epistemic-grounding\",\"methodology\"],\"verify_with\":[\"epistemic-grounding\",\"methodology\",\"expected-value\"]}"
  grounding: "{\"subject_matter\":\"SWOT analysis and the TOWS matrix as portable situational-analysis and strategy-option methods\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://cir.nii.ac.jp/crid/1361137044448123776\",\"https://business.gov.au/planning/business-plans/do-a-swot-analysis\",\"https://hbr.org/2007/03/from-swot-to-tows-answering-a-readers-strategy-question\",\"skills/skills/reasoning-strategy/swot-tows/references/swot-tows-sources.md\",\"skills/skills/reasoning-strategy/swot-tows/references/upstream-displacement-2026-06-02.md\"],\"failure_modes\":[\"laundry_list_without_strategy_options\",\"internal_external_factor_mixup\",\"opportunity_confused_with_strength\",\"threat_confused_with_weakness\",\"generic_actions_not_crossed_from_quadrants\",\"unsupported_assertions_or_missing_evidence\",\"treating_swot_as_final_strategy\",\"quantified_choice_needed_but_not_escalated\"],\"evidence_priority\":\"general_knowledge_first\"}"
  mental_model: "SWOT/TOWS is a two-step strategy method: first inventory internal factors and external conditions, then cross them into options. The primitives are a defined decision context, strengths, weaknesses, opportunities, threats, evidence confidence, factor priority, SO options that use strengths to exploit opportunities, WO options that overcome weaknesses to pursue opportunities, ST options that use strengths to reduce threats, and WT options that reduce weakness-threat exposure. SWOT names the situation; TOWS converts the situation into candidate moves."
  purpose: "This skill prevents agents from producing a four-box SWOT list and stopping there. It forces internal/external classification, evidence tagging, prioritization of the most decision-relevant factors, and TOWS crossing so the output becomes testable strategic options rather than a decorative planning worksheet."
  analogy: "SWOT/TOWS is like sorting parts on a workbench, then using the pairings to sketch possible builds instead of admiring the piles."
  misconception: "The common mistake is treating SWOT as the strategy. A SWOT table is only the inventory; strategic work begins when the strongest evidence-backed factors are crossed into options, tested for coherence, and handed to a method that chooses, validates, or executes them."
  public: "true"
  concept_boundary: "SWOT/TOWS is for situational factor inventory and strategy-option generation. It is not industry-structure diagnosis, moat taxonomy, macro-environment scanning, value innovation, integrated strategy-choice design, OKR execution management, or quantitative valuation. Those methods may feed the factor list or follow the option set, but they do not replace the internal/external factor crossing that SWOT/TOWS owns."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/reasoning-strategy/swot-tows/SKILL.md
  skill_graph_export_description_projection: anti_examples+boundary
  skill_graph_export_description_projection_truncated: "true"
---

## Concept of the skill

**What it is:** SWOT/TOWS is a situational-analysis and strategy-option method. SWOT inventories strengths, weaknesses, opportunities, and threats; TOWS crosses those factors into SO, WO, ST, and WT strategic options.

**Mental model:** Separate the world into internal controllable factors and external conditions. Then do not stop at the list. Pair internal and external factors to create options: use strengths against opportunities, use opportunities to address weaknesses, use strengths against threats, and reduce exposure where weaknesses meet threats.

**Why it exists:** Agents often produce generic SWOT tables that feel complete but do not change a decision. This skill forces the table to become action hypotheses with evidence, tradeoffs, and next validation.

**What it is NOT:** It is not Five Forces, Seven Powers, Blue Ocean Strategy, Playing to Win, OKRs, PESTEL, VRIO, expected value, or a finished strategy.

**Adjacent concepts:** situational analysis, strategic fit, internal capabilities, external environment, strategic options, risk exposure, strategic planning, issue prioritization.

**One-line analogy:** SWOT/TOWS turns a four-pile inventory into candidate moves by crossing what the organization has with what the environment presents.

**Common misconception:** SWOT does not produce strategy by naming four lists. TOWS is the action step that converts the lists into options, and another decision method may still be needed to choose among them.

# SWOT/TOWS

## Domain Context

Use SWOT/TOWS for business strategy, product strategy, nonprofit planning, project planning, market-entry preparation, and review of an existing planning workshop output. Use synthetic, aggregate, or public examples only. Do not include personal data, customer data, payment data, secrets, confidential deal details, or private business facts in examples or evals.

SWOT is useful when the decision context is broad enough that both internal capability and external environment matter. TOWS is useful when a team already has factors but needs strategic options. If the user needs a method that analyzes one narrower mechanism, route accordingly: industry pressure to Five Forces, durable advantage to Seven Powers, value innovation to Blue Ocean Strategy, strategy integration to Playing to Win, execution goals to OKRs, or quantified choice to expected value.

## Coverage

This skill teaches agents to:

1. Define the decision context before filling quadrants.
2. Separate internal factors from external conditions.
3. Separate positive factors from negative factors.
4. Attach evidence, uncertainty, and owner to each factor.
5. Prioritize a small set of decision-relevant factors instead of keeping an undifferentiated list.
6. Build SO, WO, ST, and WT options from factor crossings.
7. State assumptions, risks, and validation needs for each option.
8. Escalate to another method when SWOT/TOWS has reached its limit.

## Philosophy of the skill

SWOT is easy to understand and easy to misuse. Its weakness is not the four labels; its weakness is that teams often treat labels as analysis. A useful SWOT/TOWS pass is disciplined about classification, evidence, and conversion into options.

The method is intentionally modest. It does not prove market attractiveness, competitive advantage, or financial value. It creates a shared map of internal and external factors and a set of strategy hypotheses. That makes it useful early in strategy work, especially when the team needs a common language before choosing a sharper method.

## Workflow

### 1. Frame the decision

Before writing any quadrant, state the scope.

```text
Decision or planning question:
Organization, product, program, or project:
Time horizon:
Market or operating context:
Stakeholders affected:
Evidence available:
Decision this analysis must inform:
```

Reject vague scopes such as "our company" or "AI market" unless the user is explicitly doing a first-pass brainstorm. Narrow by product, segment, geography, channel, or planning horizon when possible.

### 2. Classify factors correctly

Use the two axes:

| Quadrant | Axis rule | Test question |
| --- | --- | --- |
| Strength | internal + helpful | What capability, asset, relationship, resource, process, brand, data, team, or position do we control that helps this decision? |
| Weakness | internal + harmful | What internal limitation, gap, liability, constraint, process issue, resource shortfall, or capability deficit hurts this decision? |
| Opportunity | external + helpful | What outside trend, customer shift, market gap, regulation, technology, partnership, channel, or timing factor could help us? |
| Threat | external + harmful | What outside competitor, substitute, regulation, cost shock, behavior shift, dependency, or uncertainty could hurt us? |

If a factor changes when the organization acts on it, it is usually internal. If the organization must respond to it but does not control it, it is usually external.

### 3. Add evidence and confidence

Do not let the quadrants become assertion storage.

| Factor | Quadrant | Evidence | Confidence | Decision relevance |
| --- | --- | --- | --- | --- |
| | S/W/O/T | observed / cited / inferred / assumed | high / medium / low | high / medium / low |

Low-confidence factors can remain in the table, but they should not drive recommendations without a validation step.

### 4. Prioritize factors before crossing

TOWS works badly when every minor factor is crossed with every other factor. Select the few factors that matter most to the decision.

Use these filters:

- Does the factor materially affect the decision?
- Is there evidence beyond opinion?
- Is the factor specific enough to act on?
- Does it change over the chosen time horizon?
- Would a strategic option change if this factor were removed?

### 5. Build the TOWS matrix

Cross internal and external factors into strategy options.

| TOWS quadrant | Strategy logic | Prompt |
| --- | --- | --- |
| SO | Use strengths to pursue opportunities | Which strengths let us exploit the opportunity better or faster than alternatives? |
| WO | Use opportunities to address weaknesses | Which opportunities help us reduce, bypass, partner around, or learn through a weakness? |
| ST | Use strengths to reduce threats | Which strengths protect us from the threat or let us respond before others do? |
| WT | Reduce weaknesses and avoid threats | Which defensive moves, risk reductions, exits, simplifications, or staged tests reduce exposure? |

Each option should cite the crossed factors.

```text
Option:
TOWS quadrant: SO / WO / ST / WT
Crossed factors:
Strategic move:
Assumption:
Evidence needed:
Downside:
Next method:
```

### 6. Convert options into next work

SWOT/TOWS outputs candidates, not final commitments. Choose the next method by the question still unanswered.

| Unanswered question | Next method |
| --- | --- |
| Is this industry structurally attractive? | Porter's Five Forces |
| Is this a durable advantage or moat? | Seven Powers |
| Can we create new demand by changing the value curve? | Blue Ocean Strategy |
| What integrated strategy should we commit to? | Playing to Win |
| How should the chosen strategy be executed and measured? | OKRs |
| Which option is worth most under uncertainty? | Expected Value |
| What evidence is missing or weak? | Epistemic Grounding |

## Quality Checks

- The scope is explicit enough that factors can be judged as internal or external.
- Strengths and weaknesses are under the actor's control.
- Opportunities and threats are external conditions, not internal aspirations or fears.
- Each important factor has evidence or is marked as an assumption.
- The answer does not treat long lists as insight.
- TOWS options cite the factors they cross.
- The output names what method or evidence should follow.
- Recommendations do not overclaim certainty from a SWOT table.

## Do NOT Use When

| Need | Use | Why |
| --- | --- | --- |
| Diagnose industry profit pressure | `porters-five-forces` | Five Forces explains structural profitability; SWOT/TOWS only inventories factors and generates options. |
| Classify durable advantage | `seven-powers` | Seven Powers tests benefit plus barrier; SWOT/TOWS does not prove a moat. |
| Reconstruct market boundaries and value curves | `blue-ocean-strategy` | Blue Ocean Strategy designs value innovation and new demand. |
| Integrate strategy choices into a cascade | `playing-to-win` | Playing to Win turns strategy into five linked choices. |
| Turn chosen strategy into objectives and metrics | `okrs` | OKRs own execution alignment after strategic choices. |
| Quantitatively compare options | `expected-value` | Expected value owns probability-weighted payoff once outcomes and probabilities are modeled. |

## Evals

This skill includes sibling eval files:

- `skills/skills/reasoning-strategy/swot-tows/evals/comprehension.json` checks concept definition, mental model, purpose, boundary, taxonomy, analogy, and application.
- `skills/skills/reasoning-strategy/swot-tows/evals/evals.json` checks applied behavior on realistic SWOT/TOWS prompts and hard negatives.

Keep `eval_state: unverified` in `audit-state.json` until a grader run produces a receipt.

## Verification

After applying this skill, verify:

- [ ] The response defines the decision context before producing quadrants.
- [ ] Internal and external factors are not mixed.
- [ ] Factors include evidence or are marked as assumptions.
- [ ] The answer creates SO, WO, ST, and WT options when the user asks for TOWS or actions.
- [ ] The answer does not claim SWOT/TOWS proves industry attractiveness, durable advantage, value innovation, or financial value.
- [ ] The answer names the next evidence-gathering or decision method.

## Key Sources

- Heinz Weihrich, "The TOWS Matrix - A Tool for Situational Analysis", *Long Range Planning*, 15(2), 54-66, 1982. DOI: `10.1016/0024-6301(82)90120-0`.
- Australian Government business.gov.au, "Do a SWOT analysis".
- Michael D. Watkins, "From SWOT to TOWS: Answering a Reader's Strategy Question", Harvard Business Review, 2007.
- `skills/skills/reasoning-strategy/swot-tows/references/swot-tows-sources.md`
- `skills/skills/reasoning-strategy/swot-tows/references/upstream-displacement-2026-06-02.md`

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `reasoning-strategy`
- Domain: `foundations/strategy`
- Scope: SWOT and TOWS strategy option generation for organizations, products, programs, and projects: separate internal strengths/weaknesses from external opportunities/threats, attach evidence and uncertainty, convert the four-quadrant inventory into SO/WO/ST/WT strategic options, and identify follow-on validation. Excludes Five Forces industry-structure diagnosis, Seven Powers moat-source classification, Blue Ocean value innovation, Playing to Win strategy-cascade design, OKR execution tracking, and quantified expected-value comparison.

**When to use**
- Build a SWOT and TOWS matrix for this product strategy.
- Turn these strengths, weaknesses, opportunities, and threats into strategic options.
- We have a SWOT table but no actions; convert it into SO, WO, ST, and WT options.
- Check whether this SWOT analysis confuses internal weaknesses with external threats.
- Use TOWS to generate strategy hypotheses from this planning workshop output.
- Triggers: `swot-tows`, `SWOT`, `TOWS`, `swot-analysis`, `tows-matrix`

**Not for**
- Analyze supplier power, buyer power, entrants, substitutes, and rivalry.
- Classify this company's durable moat source.
- Create a strategy canvas and ERRC grid for a new market space.
- Turn this strategy into winning aspiration, where to play, how to win, capabilities, and systems.
- Calculate the expected value of these strategic options.
- Owned by `porters-five-forces`: internal/external factor inventory and option generation
- Owned by `seven-powers`: situation inventory and strategy-option generation
- Owned by `blue-ocean-strategy`: factor crossing into SO/WO/ST/WT options
- Owned by `playing-to-win`: situational option generation before strategy-choice integration
- Owned by `expected-value`: qualitative option generation from factors
- Owned by `okrs`: strategic diagnosis and option generation

**Related skills**
- Verify with: `epistemic-grounding`, `methodology`, `expected-value`
- Related: `porters-five-forces`, `seven-powers`, `blue-ocean-strategy`, `playing-to-win`, `positioning`, `okrs`, `expected-value`, `epistemic-grounding`, `methodology`

**Concept**
- Mental model: SWOT/TOWS is a two-step strategy method: first inventory internal factors and external conditions, then cross them into options. The primitives are a defined decision context, strengths, weaknesses, opportunities, threats, evidence confidence, factor priority, SO options that use strengths to exploit opportunities, WO options that overcome weaknesses to pursue opportunities, ST options that use strengths to reduce threats, and WT options that reduce weakness-threat exposure. SWOT names the situation; TOWS converts the situation into candidate moves.
- Purpose: This skill prevents agents from producing a four-box SWOT list and stopping there. It forces internal/external classification, evidence tagging, prioritization of the most decision-relevant factors, and TOWS crossing so the output becomes testable strategic options rather than a decorative planning worksheet.
- Analogy: SWOT/TOWS is like sorting parts on a workbench, then using the pairings to sketch possible builds instead of admiring the piles.
- Common misconception: The common mistake is treating SWOT as the strategy. A SWOT table is only the inventory; strategic work begins when the strongest evidence-backed factors are crossed into options, tested for coherence, and handed to a method that chooses, validates, or executes them.

**Grounding**
- Mode: `universal`
- Truth sources: `https://cir.nii.ac.jp/crid/1361137044448123776`, `https://business.gov.au/planning/business-plans/do-a-swot-analysis`, `https://hbr.org/2007/03/from-swot-to-tows-answering-a-readers-strategy-question`, `skills/skills/reasoning-strategy/swot-tows/references/swot-tows-sources.md`, `skills/skills/reasoning-strategy/swot-tows/references/upstream-displacement-2026-06-02.md`

**Keywords**
- `SWOT`, `TOWS`, `SWOT analysis`, `TOWS matrix`, `strengths weaknesses opportunities threats`, `SO strategies`, `WO strategies`, `ST strategies`, `WT strategies`, `situational analysis`

<!-- skill-graph-context:end -->
