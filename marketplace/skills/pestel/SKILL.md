---
name: pestel
description: "Use when scanning an external macro environment with PESTEL/PESTLE: political, economic, social, technological, environmental, and legal forces; evidence quality; time horizon; uncertainty; opportunity/threat implications; and monitoring triggers. Covers external-environment scanning before strategy choices, market-entry reviews, strategic planning, product/service context, and risk/opportunity surfacing. Do NOT use for internal capability diagnosis (use swot-tows or a capability method), industry profit-pressure diagnosis (use porters-five-forces), value-curve redesign (use blue-ocean-strategy), integrated strategy cascades (use playing-to-win), or quantified option comparison (use expected-value). Do NOT use for Turn strengths, weaknesses, opportunities, and threats into SO, WO, ST, and WT options. Do NOT use for Analyze supplier power, buyer power, entrants, substitutes, and rivalry. Do NOT use for Turn this strategy into winning aspiration, where to play, how to win, capabilities, and systems."
license: MIT
compatibility: "Markdown, strategy memos, market-entry analysis, business plans, product strategy, nonprofit planning, policy-aware planning"
allowed-tools: Read Grep WebSearch WebFetch
metadata:
  relations: "{\"boundary\":[\"swot-tows\"]}"
  subject: reasoning-strategy
  deployment_target: portable
  scope: "PESTEL/PESTLE macro-environment scanning for organizations, products, programs, markets, and strategic decisions: define scope and horizon, gather external evidence across political, economic, social, technological, environmental, and legal forces, rate impact/probability/uncertainty, convert signals into opportunities, threats, assumptions, and monitoring triggers, and route the resulting fact base into downstream strategy work. Excludes internal capability analysis, industry profit-pool structure, value-innovation design, integrated strategy-choice formulation, execution goal-setting, and quantified expected-value comparison."
  taxonomy_domain: foundations/strategy
  stability: stable
  keywords: "[\"PESTEL\",\"PESTLE\",\"PEST analysis\",\"macro environment\",\"external environment\",\"environmental scan\",\"political economic social technological\",\"legal environmental factors\",\"PESTEL market entry\",\"external macro context\"]"
  triggers: "[\"pestel\",\"pestle\",\"pest-analysis\",\"macro-environment-scan\"]"
  examples: "[\"Run a PESTEL analysis for entering this market.\",\"Scan the macro-environmental risks and opportunities before we choose a strategy.\",\"Build a PESTLE table for this product launch and separate evidence from assumptions.\",\"Which political, economic, social, technological, environmental, and legal forces could affect this plan?\",\"Review this PESTEL analysis and tell me where it jumps from trends to conclusions.\"]"
  anti_examples: "[\"Turn strengths, weaknesses, opportunities, and threats into SO, WO, ST, and WT options.\",\"Analyze supplier power, buyer power, entrants, substitutes, and rivalry.\",\"Turn this strategy into winning aspiration, where to play, how to win, capabilities, and systems.\"]"
  grounding: "{\"subject_matter\":\"PESTEL/PESTLE analysis as a portable external macro-environment scanning method\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://www.cipd.org/uk/knowledge/factsheets/pestle-analysis-factsheet/\",\"https://open.oregonstate.education/strategicmanagement/chapter/3-the-general-environment-pestel/\",\"https://open.oregonstate.education/strategicmanagement2e/chapter/8-strategy-analysis-framework-saf/\",\"https://openlibrary.org/books/OL5535031M\",\"skills/skills/meta-methods/pestel/references/pestel-sources.md\",\"skills/skills/meta-methods/pestel/references/upstream-displacement-2026-06-03.md\"],\"failure_modes\":[\"internal_factor_misclassified_as_macro_force\",\"competitor_rivalry_confused_with_macro_environment\",\"trend_list_without_strategy_implications\",\"stale_or_unsourced_macro_claims\",\"future_claims_presented_as_certainties\",\"factor_categories_used_as_final_recommendations\",\"overcollecting_data_without_prioritization\",\"one_country_or_segment_scope_left_implicit\"],\"evidence_priority\":\"general_knowledge_first\"}"
  mental_model: "PESTEL is an external-environment scan. The primitives are a scoped decision context, a time horizon, a geography or market boundary, six uncontrollable macro-force categories, evidence sources, signals, impact, probability, uncertainty, opportunity/threat implications, assumptions, and monitoring triggers. The method turns broad external change into a prioritized context map that can feed SWOT/TOWS, Five Forces, scenario planning, market-entry decisions, or strategy formulation."
  purpose: "This skill prevents agents from choosing a strategy while ignoring the broader context that can make the choice invalid: regulation, economic conditions, social shifts, technology change, climate or resource constraints, and legal requirements. It also prevents shallow PESTEL tables by forcing scope, evidence, impact, uncertainty, implications, and monitoring."
  boundary: "PESTEL is for broad external macro-environment scanning. It is not internal capability diagnosis, SWOT/TOWS option generation, Five Forces industry-structure analysis, Blue Ocean value innovation, Playing to Win strategy-cascade design, OKR execution tracking, or expected-value calculation. Those methods may use PESTEL evidence, but they do not replace the macro scan."
  analogy: "PESTEL is like checking the weather, tides, laws, and terrain before choosing a route: it does not pick the route, but it prevents planning as if the outside world were still."
  misconception: "The common mistake is treating PESTEL as a six-heading brainstorming table. A useful PESTEL scan is evidence-backed, scoped by geography and horizon, prioritized by decision impact, and explicit about which signals become opportunities, threats, assumptions, or monitoring triggers."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/reasoning-strategy/pestel/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

## Concept of the skill

**What it is:** PESTEL, also written PESTLE, is a macro-environment scanning method. It examines political, economic, social, technological, environmental, and legal forces outside the actor's direct control.

**Mental model:** Define the decision, market, geography, and time horizon. Scan each external-force category for evidence-backed signals. Then rate each signal by relevance, impact, likelihood, uncertainty, and time horizon before converting it into an opportunity, threat, assumption, or monitoring trigger.

**Why it exists:** Agents often jump from a trend list to a recommendation. This skill makes the external context explicit before strategy, market entry, product launch, or planning work proceeds.

**What it is NOT:** It is not SWOT/TOWS, Five Forces, Blue Ocean Strategy, Playing to Win, OKRs, internal capability analysis, or expected-value math.

**Adjacent concepts:** environmental scanning, macro environment, strategic context, market-entry research, horizon scanning, opportunity/threat analysis, risk monitoring, scenario inputs.

**One-line analogy:** PESTEL checks the outside conditions before a strategy commits to a route.

**Common misconception:** A PESTEL table is not a strategy. It is a structured external fact base that must be prioritized, interpreted, and handed to the next decision method.

# PESTEL

## Domain Context

Use PESTEL for business strategy, product strategy, market-entry preparation, nonprofit planning, workforce planning, public-policy-aware planning, and review of existing strategic-context work. Use public, aggregate, or synthetic examples only. Do not include personal data, customer data, payment data, secrets, confidential deal details, or private business facts in examples or evals.

PESTEL is strongest before a team chooses a strategy or when a plan is being stress-tested against external change. It is weaker when the question is already about internal capabilities, direct industry competition, a quantified option choice, or execution goals.

PESTEL and PESTLE refer to the same six-force family. The order varies because some authors place legal before environmental. Use whichever acronym the user uses, but cover all six forces unless the user explicitly narrows scope.

## Coverage

This skill teaches agents to:

1. Define the decision, geography, market, stakeholder group, and time horizon before scanning.
2. Separate external macro forces from internal strengths, weaknesses, preferences, and aspirations.
3. Gather evidence across political, economic, social, technological, environmental, and legal factors.
4. Distinguish facts, trends, weak signals, assumptions, and speculation.
5. Rate each signal for decision impact, likelihood, uncertainty, timing, and evidence quality.
6. Convert signals into opportunities, threats, strategic assumptions, and monitoring triggers.
7. Prioritize the few external forces that materially change the decision.
8. Route downstream work to the right method instead of treating the PESTEL table as final strategy.

## Philosophy of the skill

PESTEL is useful because organizations underweight the outside world when they are deep in operations, product details, or internal planning. A good scan expands the field of view without pretending that a six-heading table can decide the strategy.

The method is deliberately evidence-hungry. Macro claims go stale, vary by geography, and often hide uncertainty. The agent should be stricter about source quality, date, geography, and time horizon than it would be in a generic brainstorm. A useful PESTEL pass says what the external signal means for the decision, what evidence supports it, how uncertain it is, and what should be watched next.

## Workflow

### 1. Frame the scan

Start by naming the decision and scope.

```text
Decision or planning question:
Actor:
Market or segment:
Geography or jurisdiction:
Time horizon:
Stakeholders affected:
Existing evidence:
Decision this scan must inform:
```

Reject scopes such as "global AI" or "the economy" unless the user explicitly wants a first-pass brainstorm. Narrow by product category, customer segment, country or region, channel, regulatory exposure, or planning horizon.

### 2. Build an evidence plan

Name the source types before making claims.

| Source type | Useful for | Watch for |
| --- | --- | --- |
| Government and regulator sources | policy, legal, tax, trade, safety, environmental rules | jurisdiction mismatch, outdated guidance |
| Economic data sources | growth, inflation, labor, interest rates, exchange rates, purchasing power | national averages hiding segment effects |
| Academic or institutional research | social trends, demographics, technology diffusion, climate or resource constraints | old publication dates, weak applicability |
| Industry reports and trade bodies | market-specific signals and adoption patterns | vendor bias, paywalled summaries |
| News and expert commentary | weak signals, emerging policy, early technology or social shifts | hype, single-source overconfidence |
| User-provided evidence | local context and constraints | private data, unsupported assertions |

For current macro claims, use recent sources. For stable conceptual claims about the PESTEL method, older strategic-management sources are acceptable.

### 3. Scan the six forces

Use the categories as prompts, not as a completeness guarantee.

| Force | What to look for | Classification test |
| --- | --- | --- |
| Political | government stability, policy priorities, taxation, trade policy, public funding, geopolitical risk, public-sector procurement | Is this about government action, political power, policy direction, or public institutions? |
| Economic | growth, inflation, interest rates, exchange rates, unemployment, wages, credit, demand cycles, purchasing power, input costs | Is this about economic conditions, incentives, prices, labor markets, capital, or demand capacity? |
| Social | demographics, culture, norms, health, education, lifestyle, trust, work patterns, customer attitudes, social movements | Is this about people, behavior, values, demographics, or social expectations? |
| Technological | adoption rates, automation, AI, infrastructure, standards, IP, cybersecurity, data systems, adjacent innovation | Is this about capability change from technology or the infrastructure that enables it? |
| Environmental | climate, energy, resources, waste, emissions, biodiversity, physical risk, supply-chain resilience, sustainability expectations | Is this about the natural environment, resource constraints, climate exposure, or ecological obligations? |
| Legal | statutes, regulation, compliance duties, labor law, consumer law, privacy, antitrust, health and safety, litigation risk | Is this about enforceable legal requirements or legal exposure? |

If a factor is under the actor's control, it probably belongs in an internal capability or SWOT/TOWS analysis. If a factor is direct buyer/supplier/rival pressure inside the industry, it probably belongs in Five Forces.

### 4. Convert observations into implications

Each signal needs an implication, not just a label.

```text
Signal:
PESTEL category:
Evidence:
Geography / jurisdiction:
Time horizon:
Impact: high / medium / low
Likelihood: high / medium / low / unknown
Uncertainty:
Opportunity, threat, assumption, or monitoring trigger:
Implication for the decision:
Next evidence needed:
```

Do not force every signal into only one category when the implication crosses categories. A privacy regulation can be legal and technological; a carbon rule can be political, environmental, and legal. Pick the primary category for organization, then note secondary categories when they affect interpretation.

### 5. Prioritize the material signals

A PESTEL scan fails when it treats every external fact as equal.

Use these filters:

- Would this signal change the decision?
- Is the source recent and relevant to the geography?
- Is the signal specific enough to act on or monitor?
- Is the impact large enough to matter within the chosen horizon?
- Is uncertainty high enough that scenario work or monitoring is needed?
- Does the signal affect price, demand, cost, feasibility, compliance, timing, or trust?

Keep a long evidence appendix if needed, but put the few decision-changing signals in the main answer.

### 6. Route to downstream work

PESTEL is an input to strategic work, not the end of it.

| Remaining question | Next method |
| --- | --- |
| How do these external forces become opportunities and threats alongside internal strengths and weaknesses? | SWOT/TOWS |
| Is this industry structurally attractive or profit-limited? | Porter's Five Forces |
| Can we create new demand by changing the value curve? | Blue Ocean Strategy |
| What strategy should we commit to? | Playing to Win |
| Which option is worth most under uncertainty? | Expected Value |
| Which claims are weak or unsupported? | Epistemic Grounding |
| How should trend evidence be synthesized across sources? | Research Synthesis |

## Output Template

```text
PESTEL scope
- Decision:
- Actor:
- Market / segment:
- Geography / jurisdiction:
- Time horizon:

External signal table
| Force | Signal | Evidence | Impact | Likelihood | Uncertainty | Implication |
| --- | --- | --- | --- | --- | --- | --- |

Synthesis
- Most material opportunities:
- Most material threats:
- Strategic assumptions:
- Monitoring triggers:
- Evidence gaps:
- Recommended next method:
```

## Quality Checks

- The scope includes geography, market or segment, and time horizon.
- Every factor is external to the actor.
- Political and legal factors are distinguished: political is policy direction and public power; legal is enforceable rules and legal exposure.
- Environmental factors are not used as a catch-all for the "external environment"; they mean ecological, climate, resource, sustainability, or physical-environment forces.
- The scan uses evidence dates and source types, not generic trend claims.
- The answer prioritizes signals by decision impact.
- The output names opportunities, threats, assumptions, and monitoring triggers.
- The answer does not call the PESTEL table a completed strategy.

## Failure Modes

| Failure mode | Symptom | Correction |
| --- | --- | --- |
| Internal/external confusion | "Strong brand" or "weak data model" appears as a PESTEL factor | Move it to SWOT/TOWS, VRIO, value chain, or another internal method |
| Competitive-force confusion | Supplier power, buyer power, rivalry, entrants, or substitutes dominate the scan | Route industry profit pressure to Five Forces |
| Trend laundry list | The answer lists macro trends without decision implications | Add impact, likelihood, uncertainty, implication, and next evidence |
| Geography-free macro claim | The answer says "regulation is increasing" without jurisdiction | Add jurisdiction and source date |
| Legal/political collapse | Laws, policy sentiment, elections, and court exposure are mixed together | Separate political direction from enforceable legal requirements |
| False certainty | The answer predicts macro outcomes as facts | Mark assumptions and monitoring triggers |
| Data hoarding | The answer collects too many factors and never prioritizes | Keep only decision-changing signals in the main synthesis |

## Verification

Before returning a PESTEL output, verify:

- [ ] Scope, geography, and time horizon are explicit.
- [ ] All six categories were considered, or omissions are explained.
- [ ] Every material claim has a source type, date, or uncertainty marker.
- [ ] External forces are not mixed with internal capabilities.
- [ ] Signals are converted into implications for the decision.
- [ ] The answer identifies the next method when PESTEL is insufficient.
- [ ] No private or personal data is included in examples or artifacts.

## Do NOT Use When

| Use instead | When |
| --- | --- |
| `swot-tows` | The user needs internal strengths/weaknesses combined with external opportunities/threats or TOWS option generation |
| `porters-five-forces` | The user asks about buyer power, supplier power, entrants, substitutes, rivalry, industry attractiveness, or profit-pool pressure |
| `blue-ocean-strategy` | The user asks for a strategy canvas, ERRC grid, noncustomers, or value-curve reconstruction |
| `playing-to-win` | The user asks for winning aspiration, where to play, how to win, capabilities, and management systems |
| `expected-value` | The user has options, probabilities, and values and needs a quantified choice |
| `research-synthesis` | The task is primarily synthesizing research findings rather than using PESTEL categories |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `reasoning-strategy`
- Deployment: `portable`
- Domain: `foundations/strategy`
- Scope: PESTEL/PESTLE macro-environment scanning for organizations, products, programs, markets, and strategic decisions: define scope and horizon, gather external evidence across political, economic, social, technological, environmental, and legal forces, rate impact/probability/uncertainty, convert signals into opportunities, threats, assumptions, and monitoring triggers, and route the resulting fact base into downstream strategy work. Excludes internal capability analysis, industry profit-pool structure, value-innovation design, integrated strategy-choice formulation, execution goal-setting, and quantified expected-value comparison.

**When to use**
- Run a PESTEL analysis for entering this market.
- Scan the macro-environmental risks and opportunities before we choose a strategy.
- Build a PESTLE table for this product launch and separate evidence from assumptions.
- Which political, economic, social, technological, environmental, and legal forces could affect this plan?
- Review this PESTEL analysis and tell me where it jumps from trends to conclusions.
- Triggers: `pestel`, `pestle`, `pest-analysis`, `macro-environment-scan`

**Not for**
- Turn strengths, weaknesses, opportunities, and threats into SO, WO, ST, and WT options.
- Analyze supplier power, buyer power, entrants, substitutes, and rivalry.
- Turn this strategy into winning aspiration, where to play, how to win, capabilities, and systems.

**Concept**
- Mental model: PESTEL is an external-environment scan. The primitives are a scoped decision context, a time horizon, a geography or market boundary, six uncontrollable macro-force categories, evidence sources, signals, impact, probability, uncertainty, opportunity/threat implications, assumptions, and monitoring triggers. The method turns broad external change into a prioritized context map that can feed SWOT/TOWS, Five Forces, scenario planning, market-entry decisions, or strategy formulation.
- Purpose: This skill prevents agents from choosing a strategy while ignoring the broader context that can make the choice invalid: regulation, economic conditions, social shifts, technology change, climate or resource constraints, and legal requirements. It also prevents shallow PESTEL tables by forcing scope, evidence, impact, uncertainty, implications, and monitoring.
- Boundary: PESTEL is for broad external macro-environment scanning. It is not internal capability diagnosis, SWOT/TOWS option generation, Five Forces industry-structure analysis, Blue Ocean value innovation, Playing to Win strategy-cascade design, OKR execution tracking, or expected-value calculation. Those methods may use PESTEL evidence, but they do not replace the macro scan.
- Analogy: PESTEL is like checking the weather, tides, laws, and terrain before choosing a route: it does not pick the route, but it prevents planning as if the outside world were still.
- Common misconception: The common mistake is treating PESTEL as a six-heading brainstorming table. A useful PESTEL scan is evidence-backed, scoped by geography and horizon, prioritized by decision impact, and explicit about which signals become opportunities, threats, assumptions, or monitoring triggers.

**Grounding**
- Mode: `universal`
- Truth sources: `https://www.cipd.org/uk/knowledge/factsheets/pestle-analysis-factsheet/`, `https://open.oregonstate.education/strategicmanagement/chapter/3-the-general-environment-pestel/`, `https://open.oregonstate.education/strategicmanagement2e/chapter/8-strategy-analysis-framework-saf/`, `https://openlibrary.org/books/OL5535031M`, `skills/skills/meta-methods/pestel/references/pestel-sources.md`, `skills/skills/meta-methods/pestel/references/upstream-displacement-2026-06-03.md`

**Keywords**
- `PESTEL`, `PESTLE`, `PEST analysis`, `macro environment`, `external environment`, `environmental scan`, `political economic social technological`, `legal environmental factors`, `PESTEL market entry`, `external macro context`

<!-- skill-graph-context:end -->
