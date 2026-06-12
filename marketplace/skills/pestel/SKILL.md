---
name: pestel
description: "Use when scanning an external macro environment with PESTEL/PESTLE and variants such as STEEPLE, STEEPLED, PESTLIED, STEEP, DESTEP, and LoNGPESTLE: political, economic, social, technological, environmental, and legal forces; evidence quality and recency; geography/jurisdiction and local/national/global level; time horizon; uncertainty; weak signals; impact/probability scoring; factor interactions; bias checks; opportunity/threat implications; assumptions; action conversion; and monitoring triggers. Covers external-environment scanning before strategy choices, market-entry reviews, strategic planning, product/service context, policy-aware planning, and risk/opportunity surfacing. Do NOT use for internal capability diagnosis (use swot-tows), industry profit-pressure diagnosis (use porters-five-forces), value-curve redesign (use blue-ocean-strategy), integrated strategy cascades (use playing-to-win), product positioning (use positioning), or quantified option comparison (use expected-value)."
license: MIT
compatibility: "Markdown, strategy memos, market-entry analysis, business plans, product strategy, nonprofit planning, workforce planning, policy-aware planning"
allowed-tools: Read Grep WebSearch WebFetch
metadata:
  relations: "{\"related\":[\"second-order-thinking\",\"bayesian-reasoning\",\"swot-tows\",\"porters-five-forces\",\"blue-ocean-strategy\",\"playing-to-win\",\"positioning\",\"expected-value\",\"epistemic-grounding\",\"research-synthesis\",\"methodology\"],\"suppresses\":[\"swot-tows\",\"porters-five-forces\",\"blue-ocean-strategy\",\"playing-to-win\",\"positioning\",\"expected-value\"],\"verify_with\":[\"epistemic-grounding\",\"research-synthesis\",\"methodology\"]}"
  subject: reasoning-strategy
  scope: "PESTEL/PESTLE macro-environment scanning (and its variant family STEEPLE/STEEPLED/PESTLIED/STEEP/DESTEP/LoNGPESTLE) for organizations, products, programs, markets, and strategic decisions: define decision scope, horizon, geography or jurisdiction, and local/national/global level when relevant; gather external evidence across political, economic, social, technological, environmental, and legal forces; separate facts/trends/weak signals/assumptions; rate materiality, impact, probability, uncertainty, timing, and evidence quality; analyze factor interactions and multi-level friction; guard against planning bias; split predictable drivers from critical uncertainties; convert signals into opportunities, threats, strategic assumptions, owned next actions, and monitoring triggers; and route the resulting fact base into downstream strategy work. Excludes internal capability analysis, industry profit-pool structure, value-innovation design, product positioning, integrated strategy-choice formulation, execution goal-setting, and quantified expected-value comparison."
  public: "true"
  taxonomy_domain: foundations/strategy
  stability: stable
  keywords: "[\"PESTEL\",\"PESTLE\",\"PEST analysis\",\"macro environment\",\"external environment\",\"environmental scan\",\"political economic social technological environmental legal forces\",\"PESTEL market entry\",\"horizon scanning\",\"weak signals\"]"
  triggers: "[\"pestel\",\"pestle\",\"pest-analysis\",\"steeple\",\"macro-environment-scan\"]"
  examples: "[\"Run a PESTEL analysis for entering this market.\",\"Scan the macro-environmental risks and opportunities before we choose a strategy.\",\"Build a PESTLE table for this product launch and separate evidence from assumptions.\",\"Which political, economic, social, technological, environmental, and legal forces could affect this plan?\",\"Review this PESTEL analysis and tell me where it jumps from trends to conclusions.\",\"Do a STEEPLE scan and tell me which factors are wildcard risks I should monitor.\"]"
  anti_examples: "[\"Turn strengths, weaknesses, opportunities, and threats into SO, WO, ST, and WT options.\",\"Analyze supplier power, buyer power, entrants, substitutes, and rivalry.\",\"Turn this strategy into winning aspiration, where to play, how to win, capabilities, and systems.\",\"Choose a market category that makes this product's differentiated value obvious.\",\"We have three options with probabilities and payoffs — compute the expected value and recommend one.\"]"
  grounding: "{\"subject_matter\":\"PESTEL/PESTLE analysis as a portable external macro-environment scanning method\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://www.cipd.org/uk/knowledge/factsheets/pestle-analysis-factsheet/\",\"https://open.oregonstate.education/strategicmanagement/chapter/3-the-general-environment-pestel/\",\"https://open.oregonstate.education/strategicmanagement2e/chapter/3-the-general-environment-pestel/\",\"https://open.oregonstate.education/strategicmanagement2e/chapter/8-strategy-analysis-framework-saf/\",\"https://openstax.org/books/principles-management/pages/8-3-a-firms-external-macro-environment-pestel\",\"https://www.si-labs.com/en/articles/pestle-analysis/\",\"https://www.oecd.org/en/publications/oecd-science-technology-and-innovation-outlook-2025_5fe57b90-en/full-report/tools-for-agility-actionable-strategic-intelligence-and-policy-experimentation_288971cb.html\",\"https://openlibrary.org/books/OL5535031M\",\"https://doi.org/10.1016/S0024-6301(96)00095-7\",\"skills/reasoning-strategy/pestel/references/pestel-sources.md\",\"skills/reasoning-strategy/pestel/references/upstream-displacement-2026-06-03.md\"],\"failure_modes\":[\"internal_factor_misclassified_as_macro_force\",\"competitor_rivalry_confused_with_macro_environment\",\"trend_list_without_strategy_implications\",\"stale_or_unsourced_macro_claims\",\"future_claims_presented_as_certainties\",\"factor_categories_used_as_final_recommendations\",\"overcollecting_data_without_prioritization\",\"one_country_or_segment_scope_left_implicit\",\"weak_signal_treated_as_established_trend\",\"ai_summary_used_as_source_of_truth\",\"snapshot_without_refresh_cadence\",\"factor_interactions_left_unanalyzed\",\"scan_skewed_by_confirmation_recency_or_groupthink_bias\",\"impact_probability_score_used_as_false_precision\",\"analysis_without_action_conversion\"],\"evidence_priority\":\"general_knowledge_first\"}"
  mental_model: "PESTEL is an external-environment scan. The primitives are a scoped decision context, geography or jurisdiction, local/national/global level where relevant, time horizon, stakeholder boundary, six uncontrollable macro-force categories, evidence sources, evidence states, signals, impact, probability, uncertainty, timing, materiality, interactions, level friction, predictable drivers, critical uncertainties, bias checks, opportunities, threats, assumptions, owned next actions, monitoring triggers, and downstream method handoff. The method turns broad external change into a prioritized context map — scored by impact and probability and checked for how factors compound — that can feed SWOT/TOWS, Five Forces, scenario planning, market-entry decisions, risk monitoring, or strategy formulation."
  purpose: "This skill prevents agents from choosing a strategy while ignoring the broader context that can make the choice invalid: regulation, economic conditions, social shifts, technology change, climate or resource constraints, and legal requirements. It also prevents shallow PESTEL tables by forcing scope, evidence, source recency, materiality, impact/probability scoring, interaction analysis, bias checks, uncertainty, implications, owned next actions, and a refresh plan — and by insisting the scan ends in owned actions, not an unread table."
  concept_boundary: "PESTEL is for broad external macro-environment scanning. It is not internal capability diagnosis, SWOT/TOWS option generation, Five Forces industry-structure analysis, Blue Ocean value innovation, product positioning, Playing to Win strategy-cascade design, OKR execution tracking, or expected-value calculation. Those methods may use PESTEL evidence, but they do not replace the macro scan. Scenario planning is its near neighbor for deep uncertainty — PESTEL hands wildcard (high-impact, low-probability) factors to scenario work rather than scoring them as if their direction were known."
  analogy: "PESTEL is like checking the weather, tides, laws, and terrain before choosing a route: it does not pick the route, but it prevents planning as if the outside world were still — and it flags which conditions could change abruptly enough to need a backup plan."
  misconception: "The common mistake is treating PESTEL as a six-heading brainstorming table, AI-generated trend list, or complete strategy. A useful PESTEL scan is evidence-backed, scoped by geography and horizon, scored and prioritized by decision impact and probability, explicit about evidence strength and uncertainty, alert to interacting forces and planning bias, and clear about which signals become opportunities, threats, assumptions, owned next actions, or monitoring triggers — and it is only finished when those signals are converted into owned next actions."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/reasoning-strategy/pestel/SKILL.md
  skill_graph_export_description: shortened for Agent Skills 1024-character description limit; canonical source keeps the full routing contract
  skill_graph_canonical_description_length: "1026"
---

## Concept of the skill

**What it is:** PESTEL, also written PESTLE, is a macro-environment scanning method. It examines political, economic, social or sociological, technological, environmental, and legal forces outside the actor's direct control. It belongs to a family of acronym variants (STEEPLE, STEEPLED, PESTLIED, STEEP, DESTEP, LoNGPESTLE) that add or drop force categories or scanning levels; they share one mechanism — structured scanning of uncontrollable external forces.

**Mental model:** Define the decision, actor, market, geography or jurisdiction, stakeholders, and time horizon. Scan each external-force category for evidence-backed signals. Then rate each signal by relevance, impact, probability, uncertainty, timing, materiality, and evidence quality; analyze how forces amplify, dampen, trigger, or condition each other; guard against planning bias; and convert the result into an opportunity, threat, assumption, owned next action, or monitoring trigger.

**Why it exists:** Agents often jump from a trend list to a recommendation. This skill makes the external context explicit before strategy, market entry, product launch, policy-aware planning, workforce planning, or risk review proceeds — and forces prioritization and conversion-to-action so the scan does not die as an unread checklist.

**What it is NOT:** It is not SWOT/TOWS, Five Forces, Blue Ocean Strategy, Playing to Win, positioning, OKRs, internal capability analysis, scenario planning, or expected-value math.

**Adjacent concepts:** environmental scanning, macro environment, strategic context, market-entry research, horizon scanning, weak-signal detection, factor interaction / cross-impact mapping, opportunity/threat analysis, risk monitoring, scenario inputs.

**One-line analogy:** PESTEL checks the outside conditions before a strategy commits to a route.

**Common misconception:** A PESTEL table is not a strategy. It is a structured external fact base that must be sourced, scored, prioritized, checked for interactions and bias, interpreted, monitored, converted into owned next actions, and handed to the next decision method.

# PESTEL

## Domain Context

Use PESTEL for business strategy, product strategy, market-entry preparation, nonprofit planning, workforce planning, public-policy-aware planning, and review of existing strategic-context work. Use public, aggregate, or synthetic examples only. Do not include personal data, customer data, payment data, secrets, confidential deal details, or private business facts in examples or evals.

PESTEL is strongest before a team chooses a strategy or when a plan is being stress-tested against external change. It is weaker when the question is already about internal capabilities, direct industry competition, customer-relative positioning, a quantified option choice, or execution goals.

PESTEL and PESTLE refer to the same six-force family. The order varies because some authors place legal before environmental. Use whichever acronym the user uses, but cover all six forces unless the user explicitly narrows scope.

### The variant family — when to extend the six forces

PESTEL sits inside a family of acronym variants. They share the scanning mechanism; they differ in which force categories or scanning levels are made explicit. Treat the variant as a lens choice, not a different method — and own the variant the user names rather than rerouting them. Promote a force to its own heading only when it would otherwise hide a decision-changing signal; do not add headings for completeness theater.

| Variant | Adds / changes | Use when | Guardrail |
| --- | --- | --- | --- |
| **PEST / STEP** | Drops Environmental and Legal | A quick four-force first pass; rarely sufficient for regulated or resource-exposed sectors | Note whether legal or environmental forces were considered and found immaterial, or intentionally excluded |
| **PESTEL / PESTLE** | The canonical six | Default for most strategy and market-entry scans | Cover all six forces even if the letter order changes |
| **STEEPLE** | Adds **Ethical** | Reputational, ESG, AI-ethics, or values-sensitive decisions where ethical exposure is distinct from legal duty | Do not use ethics as a substitute for enforceable legal analysis or stakeholder evidence |
| **STEEPLED / PESTLIED** | Adds **Demographic** (PESTLIED adds **International**) | Population-shift-driven demand, or explicitly cross-border decisions | Keep the same evidence and materiality tests; more headings do not mean better analysis |
| **DESTEP** | Separates Demographic, Economic, Sociocultural, Technological, Ecological, Political | The requested local convention uses these headings | Map enforceable legal duties somewhere explicit if legal exposure matters |
| **LoNGPESTLE** | Runs the scan at **Local, National, and Global** levels | Multi-jurisdiction operations where a force differs sharply by level (e.g., local zoning vs. national policy vs. global trade) | State which level owns each signal, identify friction between levels, avoid mixing a local fact with a global conclusion |

AI research tools, deep-research products, and PESTLE generators can help gather or format sources. They do not replace the method. Do not treat an AI-generated PESTEL table as evidence; trace every material macro claim to a current, relevant source or mark it as an assumption or weak signal.

## Coverage

This skill teaches agents to:

1. Define the decision, actor, geography, jurisdiction, local/national/global level when relevant, market, stakeholder group, and time horizon before scanning.
2. Separate external macro forces from internal strengths, weaknesses, preferences, aspirations, competitor conduct, and product-positioning choices.
3. Gather evidence across political, economic, social, technological, environmental, and legal factors (extending to ethical, demographic, international, or multi-level scanning when the variant warrants it).
4. Distinguish facts, trends, weak signals, assumptions, speculation, and AI-generated summaries.
5. Rate each signal for decision impact, probability, uncertainty, timing, materiality, and evidence quality without pretending rough scores are precise.
6. Convert signals into opportunities, threats, strategic assumptions, owned next actions, and monitoring triggers.
7. Analyze factor interactions and multi-level friction: forces that amplify, dampen, trigger, condition, or conflict with one another across PESTEL categories or local, national, and global layers.
8. Split predictable drivers from critical uncertainties and route high-impact/low-probability "wildcard" factors to scenario planning rather than scoring them as if their direction were known.
9. Guard against confirmation, recency, availability, groupthink, optimism, control, anchoring, and source bias.
10. Prioritize the few external forces that materially change the decision, while preserving a source appendix when needed.
11. Define a refresh cadence or trigger threshold for volatile claims.
12. Route downstream work to the right method instead of treating the PESTEL table as final strategy.

## Philosophy of the skill

PESTEL is useful because organizations underweight the outside world when they are deep in operations, product details, or internal planning. A good scan expands the field of view without pretending that a six-heading table can decide the strategy.

The method is deliberately evidence-hungry. Macro claims go stale, vary by geography, and often hide uncertainty. The agent should be stricter about source quality, publication date, jurisdiction, and time horizon than it would be in a generic brainstorm. A useful PESTEL pass says what the external signal means for the decision, what evidence supports it, how uncertain it is, how it interacts with other forces, what would change the interpretation, and what should be watched next.

PESTEL is also a prioritization discipline. The six categories are prompts, not proof of completeness. A signal only belongs in the main answer if it could change price, demand, cost, feasibility, compliance, timing, supply resilience, access, trust, or strategic risk within the chosen horizon. Put low-impact background facts in an appendix or omit them.

The framework's signature failure is the *checklist trap*: a generic list of forty-plus factors with no scoring, no interaction analysis, and no implications produces volume, not insight. The classic empirical warning comes from SWOT rather than PESTEL — Hill and Westbrook's 1997 survey of fifty firms found their structured analyses degenerated into long, unprioritized lists that none of the firms converted into a concrete strategic action — but the trap is identical for a macro scan. For PESTEL the conversion-to-action is not "choose the whole strategy"; it is naming the decision implication, the assumption to test, the evidence to gather, the trigger to monitor, the owner role for follow-up, and the downstream method that should use the scan. PESTEL earns its keep in the scoring, interaction, bias, and action-conversion steps, not in the six headings.

## Workflow

### 1. Frame the scan

Start by naming the decision and scope.

```text
Decision or planning question:
Actor:
Product, program, organization, or initiative:
Market or segment:
Geography / jurisdiction:
Level(s) of analysis: local / national / global / mixed / not applicable
Time horizon:
Stakeholders affected:
Existing evidence:
Decision this scan must inform:
Variant used (PESTEL / STEEPLE / ...):
Refresh cadence or trigger for re-check:
```

Reject scopes such as "global AI" or "the economy" unless the user explicitly wants a first-pass brainstorm. Narrow by product category, customer segment, country or region, channel, regulatory exposure, stakeholder group, or planning horizon.

When scope is missing and the answer depends on it, ask for the missing scope or state a narrow assumption. Do not silently turn a US-specific claim into a global claim, a national trend into a segment claim, or a one-year risk into a five-year strategy assumption.

For LoNGPESTLE, multi-jurisdiction, or place-sensitive decisions, tag each signal with the level that owns the evidence: local, national, global, mixed, or not applicable. Then check for level friction, such as a global technology trend constrained by municipal zoning, a national subsidy undermined by local permitting, or local demand limited by global supply-chain exposure.

### 2. Build an evidence plan

Name the source types before making claims. Prefer primary and institutional sources for current macro facts; use management-framework sources for stable method claims.

| Source type | Useful for | Watch for |
| --- | --- | --- |
| Government and regulator sources | policy, legal, tax, trade, procurement, safety, environmental rules | jurisdiction mismatch, draft guidance treated as law |
| Official statistics and central banks | growth, inflation, labor, interest rates, exchange rates, purchasing power | national averages hiding segment effects |
| Courts, statutes, standards bodies | enforceable legal exposure, standards, compliance duties | outdated versions, nonbinding commentary |
| Academic, institutional, and multilateral research | demographics, social trends, technology diffusion, climate or resource constraints | old publication dates, weak applicability |
| Industry reports and trade bodies | market-specific signals, adoption patterns, supply-chain pressure | vendor bias, paywalled summaries, self-interest |
| News and expert commentary | weak signals, emerging policy, early technology or social shifts | hype, single-source overconfidence |
| Horizon-scanning and foresight sources | early signals, plausible futures, disruptive surprises | treating weak signals as established trends |
| User-provided evidence | local context and constraints | private data, unsupported assertions |
| AI-generated summaries | source discovery or formatting help | never source-of-truth; verify each claim elsewhere |

For current macro claims, use recent sources and include `as of` dates. For stable conceptual claims about the PESTEL method, older strategic-management sources are acceptable. For volatile domains such as regulation, sanctions, elections, interest rates, AI, climate policy, or trade rules, re-check the source during the task.

### 3. Scan the six forces

Use the categories as prompts, not as a completeness guarantee.

| Force | What to look for | Classification test |
| --- | --- | --- |
| Political | government stability, elections, policy priorities, taxation, trade policy, public funding, geopolitics, sanctions, public-sector procurement | Is this about government action, political power, policy direction, public institutions, or public legitimacy? |
| Economic | growth, inflation, interest rates, exchange rates, unemployment, wages, credit, demand cycles, purchasing power, input costs, capital access | Is this about economic conditions, incentives, prices, labor markets, capital, or demand capacity? |
| Social | demographics, culture, norms, health, education, lifestyle, trust, work patterns, customer attitudes, social movements, workforce expectations | Is this about people, behavior, values, demographics, or social expectations? |
| Technological | adoption rates, automation, AI, infrastructure, standards, IP, cybersecurity, data systems, interoperability, adjacent innovation | Is this about capability change from technology or the infrastructure that enables it? |
| Environmental | climate, energy, resources, waste, emissions, biodiversity, physical risk, supply-chain resilience, sustainability expectations | Is this about the natural environment, resource constraints, climate exposure, ecological impact, or physical-environment obligations? |
| Legal | statutes, regulation, compliance duties, labor law, consumer law, privacy, antitrust, health and safety, litigation risk, enforceable standards | Is this about enforceable legal requirements, legal exposure, or formal compliance duties? |

If a factor is under the actor's control, move it to an internal capability or SWOT/TOWS analysis. If a factor is direct buyer/supplier/rival pressure inside the industry, route it to Five Forces. If the issue is how customers should understand an existing product's value, route it to positioning. If the issue is how to make integrated strategic choices, route it to Playing to Win.

Do not force every factor into exactly one category when the implication crosses categories. A privacy regulation can be legal and technological; a carbon rule can be political, environmental, and legal. Pick the primary category for organization, then note secondary categories when they affect interpretation.

### 4. Classify evidence state

Before turning a signal into a conclusion, label what kind of evidence it is.

| Evidence state | Meaning | How to use it |
| --- | --- | --- |
| Fact | Confirmed current or historical condition from a relevant source | Can support an implication if geography and date match |
| Trend | Directional movement supported by more than one point or source | State trend direction, period, and whether it is accelerating |
| Weak signal | Early, low-volume, or emerging evidence with uncertain durability | Put in a signal register; do not present as settled |
| Assumption | Needed for planning but not verified | Mark explicitly and attach a trigger for re-check |
| Speculation | Plausible but weakly supported idea | Keep out of recommendations or label as brainstorm |
| Contradiction | Sources disagree or evidence cuts both ways | State the conflict and what evidence would resolve it |

Weak signals are not noise by default. If a weak signal has high potential impact or high surprise value, keep it in a monitoring register even if it is not strong enough for the main recommendation.

### 5. Convert observations into implications

Each signal needs an implication, not just a label.

```text
Signal:
Evidence state: fact / trend / weak signal / assumption / speculation / contradiction
Primary PESTEL category:
Secondary categories:
Source and date:
Geography / jurisdiction:
Level: local / national / global / mixed / not applicable
Time horizon:
Impact: high / medium / low   (or 1-5)
Probability / likelihood: high / medium / low / unknown   (or 1-5)
Uncertainty:
Evidence quality: high / medium / low
Decision lever affected: price / demand / cost / feasibility / compliance / timing / trust / supply resilience / risk
Opportunity, threat, assumption, or monitoring trigger:
Implication for the decision:
Next evidence needed:
```

Use explicit qualifiers. "The regulator proposed" is not the same as "the law requires"; "customers may shift" is not the same as "customers are shifting"; "AI tools could reduce cost" is not the same as "this actor can reduce cost."

### 6. Score and prioritize material signals

A PESTEL scan fails when it treats every external fact as equal. Score each surviving signal, then act on the top few.

**Qualitative pass (fast):** rate impact and probability high / medium / low and keep the high-impact items.

**Numeric pass (for rigor and defensible prioritization across many signals):** score each factor on two 1–5 scales and multiply them into a priority score. Keep the caveat visible: the number is a prioritization aid, not a measured forecast.

- **Impact: 1 (marginal) → 5 (existential threat or enabler).**
- **Probability: 1 (very unlikely) → 5 (certain or already occurring).**
- **Priority score = Impact × Probability** (range 1–25).
- **Confidence adjustment:** temper the raw score by evidence quality and uncertainty.

Then place each factor in the impact/probability quadrant — this decides *what kind* of response it earns, not just its rank:

| Quadrant | Meaning | Treatment |
| --- | --- | --- |
| High impact / high probability | Decision-relevant near-term driver | Put in the main synthesis; convert into an assumption, opportunity, threat, or owned next action; feed the strategy method |
| High impact / low probability | **Wildcard / discontinuity** | Do not score as if direction is known; keep in monitoring and route to scenario planning if it would change the decision architecture |
| Low impact / high probability | Background condition or operational context | Mention only if it affects timing, cost, compliance, or trust |
| Low impact / low probability | Low-priority noise | Move to appendix or omit unless the user explicitly wants a full evidence log |

Prioritization filters to apply alongside the score:

- Would this signal change the decision?
- Is the source recent and relevant to the geography?
- Is the signal specific enough to act on or monitor?
- Is the impact large enough to matter within the chosen horizon?
- Is uncertainty high enough that scenario work or monitoring is needed (the wildcard quadrant)?
- Does the signal affect price, demand, cost, feasibility, compliance, timing, supply resilience, access, or trust?
- Is the signal independent, or is it a duplicate symptom of a more fundamental driver?
- Could the signal interact with another force enough to change the implication?

Keep a long evidence appendix if needed, but put only the top few decision-changing signals in the main answer. If the output has more than 7–10 main signals, create a ranked top set and move the rest to an appendix. A scan that surfaces forty factors and ranks none has produced volume, not insight.

### 7. Analyze interactions and compounding

External forces rarely act alone; the decision-relevant story is usually in how they compound. After scoring individual signals, check whether one signal amplifies, dampens, triggers, conditions, or conflicts with another. This prevents a PESTEL table from missing the system effect that actually changes the decision.

```text
Signal A:
Signal B:
Relationship: amplifies / dampens / triggers / conditions / conflicts with
Level relationship: local / national / global / mixed / not applicable
Mechanism:
Evidence:
Combined implication:
Whether combined impact changes priority:
Monitoring trigger:
```

Examples of compounding worth surfacing: a privacy law (legal) that raises the cost of an AI feature (technological); rising rates (economic) that magnify a subsidy withdrawal (political); aging demographics (social) that intensify a labor-shortage signal (economic); a climate event (environmental) that triggers a legal reporting duty; social trust conditioning whether a new data technology is acceptable; municipal permitting blocking a globally attractive technology rollout; national immigration rules constraining a local workforce strategy. Name the two or three interactions that change the decision; do not build a full N×N matrix unless the stakes justify it.

### 8. Split predictable drivers from critical uncertainties

Separate signals that can be treated as planning assumptions from signals that need scenario work.

| Type | Test | Use |
| --- | --- | --- |
| Predictable driver | Direction is supported, uncertainty is manageable, and the main question is magnitude or timing | Use as a planning assumption and monitor for threshold changes |
| Critical uncertainty | High impact, high uncertainty, plausible divergent outcomes, and each outcome changes the decision | Route to scenario planning, strategic foresight, or explicit option design |

If several critical uncertainties remain, do not build a sprawling scenario matrix. Pick the two most decision-changing, independent uncertainties as axes; cluster or monitor the rest. A good scenario axis is not merely interesting — it creates materially different choices under different plausible outcomes.

### 9. Run a bias guard

PESTEL scans are produced by people (or an agent) and inherit predictable distortions. Before finalizing priorities, check whether the scan is preserving the user's favored story rather than the external evidence.

| Bias | Symptom in a scan | Counter |
| --- | --- | --- |
| Confirmation | Only signals supporting the preferred decision appear | Add disconfirming sources; run a red-team pass that argues the opposite reading; state what would change the conclusion |
| Recency / availability | The scan over-weights the latest headline or a vivid event | Anchor on dated evidence and base rates; compare recent signals with longer-run institutional series |
| Groupthink | A single consensus narrative, no dissent; workshop belief treated as evidence | Collect signals independently/silently before discussing; separate stakeholder belief from sourced external fact |
| Optimism / control | Threats softened, opportunities inflated; the actor is assumed able to overcome uncontrollable forces without proof | Force a worst-case probability on each high-impact factor; mark the force external and name the constraint or contingency |
| Anchoring | Early assumptions set the impact/probability score despite contrary evidence | Re-score after evidence review and explain major changes |
| Source / vendor | A trade body, vendor, or advocacy source is treated as neutral | Triangulate with primary, institutional, or counterparty evidence |

### 10. Build a monitoring and action register

For volatile or weakly evidenced signals, do not end with a static table. Define what to watch next. A monitoring trigger is stronger when it carries a **pre-committed response**, not just a threshold to watch — pair each trigger with the action it should fire so the organization decides under calm conditions rather than improvising under pressure.

```text
Signal to monitor:
Why it matters:
Current evidence state:
Source to re-check:
Threshold or event that changes the decision:   e.g., "Tariff on imported inputs exceeds 15%"
Pre-committed response:                          e.g., "Shift sourcing to Region Y; re-price affected SKUs"
Review cadence:
Owner role:
Likely downstream method if triggered:
```

Reserve trigger-response pairs for the high-impact factors (especially the wildcard quadrant from step 6); do not write a pre-committed response for every low-impact signal. Use monitoring triggers when evidence is uncertain but decision impact is material: a bill becoming enforceable law, an interest-rate band crossing a planning threshold, a standard moving from draft to adopted, a technology-adoption metric crossing a target segment, a climate event changing supply assumptions, or a competitor-adjacent macro shock changing industry structure.

Name owned next actions without pretending PESTEL has chosen the full strategy. Appropriate actions include: validate one assumption, commission a source check, route to scenario planning, add a compliance review, test a demand assumption, create a risk trigger, or feed SWOT/TOWS with the opportunity/threat set.

### 11. Route to downstream work

PESTEL is an input to strategic work, not the end of it. Before routing, make sure every material signal has become an owned action, assumption, or trigger — an unconverted scan is the documented failure mode.

| Remaining question | Next method |
| --- | --- |
| How do these external forces become opportunities and threats alongside internal strengths and weaknesses? | SWOT/TOWS (a SWOT without a prior PESTEL is guessing at the external quadrants) |
| Is this industry structurally attractive or profit-limited? | Porter's Five Forces |
| Can we create new demand by changing the value curve? | Blue Ocean Strategy |
| How should an existing product's differentiated value be framed for buyers? | Positioning |
| What strategy should we commit to? | Playing to Win |
| Which option is worth most under uncertainty? | Expected Value |
| Do several high-uncertainty signals imply materially different futures (wildcard quadrant)? | Scenario planning / strategic foresight (PESTEL supplies the driving forces) |
| Which claims are weak or unsupported? | Epistemic Grounding |
| How should trend evidence be synthesized across sources? | Research Synthesis |

## Output Template

```text
PESTEL scope
- Decision:
- Actor:
- Product / program / organization:
- Market / segment:
- Geography / jurisdiction:
- Level(s): local / national / global / mixed / not applicable
- Time horizon:
- Variant used (PESTEL / STEEPLE / ...):
- Refresh cadence or trigger:

External signal table
| Force | Signal | Evidence state | Source/date | Geography | Level | Impact | Probability | Priority (I×P) | Uncertainty | Evidence quality | Decision lever | Implication |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

Interaction map (top 2-3)
| Signal A | Signal B | Relationship | Level friction/dependency | Combined implication | Priority change |
| --- | --- | --- | --- | --- | --- |

Synthesis
- Most material opportunities:
- Most material threats:
- Strategic assumptions:
- Predictable drivers:
- Critical uncertainties / wildcard factors (→ scenario planning / monitoring):
- Weak signals to monitor:
- Bias checks or disconfirming evidence:
- Evidence gaps:
- Owned next actions / owners:
- Recommended next method:

Monitoring and action register
| Signal | Source to re-check | Threshold/event | Pre-committed response | Cadence | Owner role | Next method if triggered |
| --- | --- | --- | --- | --- | --- | --- |
```

## Quality Checks

- The scope includes decision, actor, geography or jurisdiction, market or segment, and time horizon.
- The variant in use is named when it is not plain PESTEL.
- All six categories (or the variant's) were considered, or omissions are explained.
- Every factor is external to the actor.
- Political and legal factors are distinguished: political is policy direction and public power; legal is enforceable rules and legal exposure.
- Environmental factors are not used as a catch-all for the "external environment"; they mean ecological, climate, resource, sustainability, or physical-environment forces.
- Current macro claims include source type, source date, and geography.
- AI-generated summaries are not treated as evidence.
- Weak signals are labeled separately from established trends.
- Signals are scored by impact and probability and prioritized without false precision; high-impact/low-probability wildcards are flagged for scenario work, not asserted as known.
- Factor interactions are checked, especially amplifiers, dampeners, triggers, and conditioning forces.
- Multi-level scans tag local, national, global, mixed, or not-applicable level for each material signal and identify friction between levels.
- Predictable drivers are separated from critical uncertainties, with scenario planning named when two decision-changing uncertainties remain.
- The scan was checked for confirmation, recency, groupthink, optimism, anchoring, and source bias, naming at least one disconfirming source or base-rate check for the highest-priority claims.
- The output names opportunities, threats, assumptions, and monitoring triggers.
- The output converts analysis into owned next actions, evidence checks, or downstream-method handoffs.
- The answer does not call the PESTEL table a completed strategy.
- The answer names the downstream method when the remaining question is no longer a macro-environment scan.

## Failure Modes

| Failure mode | Symptom | Correction |
| --- | --- | --- |
| Internal/external confusion | "Strong brand" or "weak data model" appears as a PESTEL factor | Move it to SWOT/TOWS, VRIO, value chain, or another internal method |
| Competitive-force confusion | Supplier power, buyer power, rivalry, entrants, or substitutes dominate the scan | Route industry profit pressure to Five Forces |
| Positioning confusion | The scan turns into market-category, value-theme, or messaging advice | Route product-market framing to positioning after macro signals are understood |
| Trend laundry list | The answer lists macro trends without decision implications | Add impact, probability, uncertainty, implication, and next evidence |
| Checklist trap | Forty-plus factors collected, none scored, no interactions, no implications | Score, prioritize the top few, analyze interactions, and convert to action |
| Geography-free macro claim | The answer says "regulation is increasing" without jurisdiction | Add jurisdiction and source date |
| Legal/political collapse | Laws, policy sentiment, elections, and court exposure are mixed together | Separate political direction from enforceable legal requirements |
| Weak-signal inflation | Early hints are written as if they are established trends | Label as weak signals and put them in a monitoring register |
| False certainty | The answer predicts macro outcomes as facts | Mark assumptions and monitoring triggers; route wildcard factors to scenario planning |
| AI-summary laundering | A generated PESTLE table is cited as the source for factual claims | Use AI only for discovery/formatting; verify claims against primary or institutional sources |
| Variant completeness theater | STEEPLE, STEEPLED, LoNGPESTLE, or another variant adds headings without changing the decision | Use the user's requested lens, but promote extra headings only when they expose a material signal |
| Level-blind LoNGPESTLE | Local, national, and global facts are listed, but the answer misses the conflict between layers | Tag each signal's level and map whether layers amplify, constrain, override, or conflict |
| Score false precision | A 1-5 impact/probability score is presented as a measured forecast | Treat scores as prioritization aids; explain evidence quality, uncertainty, and judgment calls |
| Interaction blindness | Political, economic, social, technological, environmental, and legal rows are analyzed as isolated facts | Add an interaction map for amplifiers, dampeners, triggers, and conditioning forces |
| Bias-preserving scan | The scan mostly validates the user's preferred plan or recent headlines | Add disconfirming evidence, base-rate checks, and source-bias caveats; collect signals independently first |
| Scenario confusion | Every uncertainty is turned into a scenario axis | Use scenario planning only for high-impact, high-uncertainty drivers; choose two independent axes when a matrix is needed |
| Data hoarding | The answer collects too many factors and never prioritizes | Keep only decision-changing signals in the main synthesis |
| Static snapshot | The answer has volatile claims but no re-check plan | Add source, threshold, and cadence to the monitoring register |
| Analysis without action | The scan ends with a table but no owner role, evidence check, monitoring trigger, or downstream handoff | Convert each material signal into an owned next action, assumption test, trigger, or next method |

## Verification

Before returning a PESTEL output, verify:

- [ ] Scope, geography or jurisdiction, and time horizon are explicit.
- [ ] The variant is named if it is not plain PESTEL; all six (or the variant's) categories were considered, or omissions are explained.
- [ ] Every material claim has a source type, date, geography, and uncertainty marker.
- [ ] External forces are not mixed with internal capabilities.
- [ ] Direct industry forces are not mixed with macro forces.
- [ ] Evidence states distinguish facts, trends, weak signals, assumptions, speculation, and contradictions.
- [ ] Signals are converted into implications for the decision.
- [ ] Prioritization uses impact × probability or high/medium/low materiality without implying false precision; wildcard factors are flagged for scenario work.
- [ ] Interactions between material signals were checked.
- [ ] Multi-level or multi-jurisdiction scans tag each material signal's level and check for local/national/global friction.
- [ ] Predictable drivers and critical uncertainties were separated.
- [ ] The scan was checked for confirmation/recency/groupthink/optimism/anchoring/source bias for high-priority claims.
- [ ] High-impact uncertain signals have monitoring triggers, ideally with a pre-committed response.
- [ ] Material signals have owned next actions, evidence checks, or downstream handoffs.
- [ ] The answer identifies the next method when PESTEL is insufficient.
- [ ] No private or personal data is included in examples or artifacts.

## Do NOT Use When

| Use instead | When |
| --- | --- |
| `swot-tows` | The user needs internal strengths/weaknesses combined with external opportunities/threats or TOWS option generation |
| `porters-five-forces` | The user asks about buyer power, supplier power, entrants, substitutes, rivalry, industry attractiveness, or profit-pool pressure |
| `blue-ocean-strategy` | The user asks for a strategy canvas, ERRC grid, noncustomers, or value-curve reconstruction |
| `playing-to-win` | The user asks for winning aspiration, where to play, how to win, capabilities, and management systems |
| `positioning` | The user asks how to frame a product's differentiated value, competitive alternatives, target segment, market category, or sales narrative |
| `expected-value` | The user has options, probabilities, and values and needs a quantified choice |
| `second-order-thinking` | The user wants to trace the downstream chain of consequences of one decision, rather than scan the external forces around it |
| `research-synthesis` | The task is primarily synthesizing a qualitative research corpus rather than using PESTEL categories |
| `epistemic-grounding` | The task is primarily checking whether claims are supported by sources rather than scanning the macro environment |
| scenario planning (no dedicated skill yet) | Deep uncertainty dominates and the goal is to build divergent futures from driving forces, not to score factors with known direction |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `reasoning-strategy`
- Public: `true`
- Domain: `foundations/strategy`
- Scope: PESTEL/PESTLE macro-environment scanning (and its variant family STEEPLE/STEEPLED/PESTLIED/STEEP/DESTEP/LoNGPESTLE) for organizations, products, programs, markets, and strategic decisions: define decision scope, horizon, geography or jurisdiction, and local/national/global level when relevant; gather external evidence across political, economic, social, technological, environmental, and legal forces; separate facts/trends/weak signals/assumptions; rate materiality, impact, probability, uncertainty, timing, and evidence quality; analyze factor interactions and multi-level friction; guard against planning bias; split predictable drivers from critical uncertainties; convert signals into opportunities, threats, strategic assumptions, owned next actions, and monitoring triggers; and route the resulting fact base into downstream strategy work. Excludes internal capability analysis, industry profit-pool structure, value-innovation design, product positioning, integrated strategy-choice formulation, execution goal-setting, and quantified expected-value comparison.

**When to use**
- Run a PESTEL analysis for entering this market.
- Scan the macro-environmental risks and opportunities before we choose a strategy.
- Build a PESTLE table for this product launch and separate evidence from assumptions.
- Which political, economic, social, technological, environmental, and legal forces could affect this plan?
- Review this PESTEL analysis and tell me where it jumps from trends to conclusions.
- Do a STEEPLE scan and tell me which factors are wildcard risks I should monitor.
- Triggers: `pestel`, `pestle`, `pest-analysis`, `steeple`, `macro-environment-scan`

**Not for**
- Turn strengths, weaknesses, opportunities, and threats into SO, WO, ST, and WT options.
- Analyze supplier power, buyer power, entrants, substitutes, and rivalry.
- Turn this strategy into winning aspiration, where to play, how to win, capabilities, and systems.
- Choose a market category that makes this product's differentiated value obvious.
- We have three options with probabilities and payoffs — compute the expected value and recommend one.

**Related skills**
- Verify with: `epistemic-grounding`, `research-synthesis`, `methodology`
- Related: `second-order-thinking`, `bayesian-reasoning`, `swot-tows`, `porters-five-forces`, `blue-ocean-strategy`, `playing-to-win`, `positioning`, `expected-value`, `epistemic-grounding`, `research-synthesis`, `methodology`

**Concept**
- Mental model: PESTEL is an external-environment scan. The primitives are a scoped decision context, geography or jurisdiction, local/national/global level where relevant, time horizon, stakeholder boundary, six uncontrollable macro-force categories, evidence sources, evidence states, signals, impact, probability, uncertainty, timing, materiality, interactions, level friction, predictable drivers, critical uncertainties, bias checks, opportunities, threats, assumptions, owned next actions, monitoring triggers, and downstream method handoff. The method turns broad external change into a prioritized context map — scored by impact and probability and checked for how factors compound — that can feed SWOT/TOWS, Five Forces, scenario planning, market-entry decisions, risk monitoring, or strategy formulation.
- Purpose: This skill prevents agents from choosing a strategy while ignoring the broader context that can make the choice invalid: regulation, economic conditions, social shifts, technology change, climate or resource constraints, and legal requirements. It also prevents shallow PESTEL tables by forcing scope, evidence, source recency, materiality, impact/probability scoring, interaction analysis, bias checks, uncertainty, implications, owned next actions, and a refresh plan — and by insisting the scan ends in owned actions, not an unread table.
- Boundary: PESTEL is for broad external macro-environment scanning. It is not internal capability diagnosis, SWOT/TOWS option generation, Five Forces industry-structure analysis, Blue Ocean value innovation, product positioning, Playing to Win strategy-cascade design, OKR execution tracking, or expected-value calculation. Those methods may use PESTEL evidence, but they do not replace the macro scan. Scenario planning is its near neighbor for deep uncertainty — PESTEL hands wildcard (high-impact, low-probability) factors to scenario work rather than scoring them as if their direction were known.
- Analogy: PESTEL is like checking the weather, tides, laws, and terrain before choosing a route: it does not pick the route, but it prevents planning as if the outside world were still — and it flags which conditions could change abruptly enough to need a backup plan.
- Common misconception: The common mistake is treating PESTEL as a six-heading brainstorming table, AI-generated trend list, or complete strategy. A useful PESTEL scan is evidence-backed, scoped by geography and horizon, scored and prioritized by decision impact and probability, explicit about evidence strength and uncertainty, alert to interacting forces and planning bias, and clear about which signals become opportunities, threats, assumptions, owned next actions, or monitoring triggers — and it is only finished when those signals are converted into owned next actions.

**Grounding**
- Mode: `universal`
- Truth sources: `https://www.cipd.org/uk/knowledge/factsheets/pestle-analysis-factsheet/`, `https://open.oregonstate.education/strategicmanagement/chapter/3-the-general-environment-pestel/`, `https://open.oregonstate.education/strategicmanagement2e/chapter/3-the-general-environment-pestel/`, `https://open.oregonstate.education/strategicmanagement2e/chapter/8-strategy-analysis-framework-saf/`, `https://openstax.org/books/principles-management/pages/8-3-a-firms-external-macro-environment-pestel`, `https://www.si-labs.com/en/articles/pestle-analysis/`, `https://www.oecd.org/en/publications/oecd-science-technology-and-innovation-outlook-2025_5fe57b90-en/full-report/tools-for-agility-actionable-strategic-intelligence-and-policy-experimentation_288971cb.html`, `https://openlibrary.org/books/OL5535031M`, `https://doi.org/10.1016/S0024-6301(96)00095-7`, `skills/reasoning-strategy/pestel/references/pestel-sources.md`, `skills/reasoning-strategy/pestel/references/upstream-displacement-2026-06-03.md`

**Keywords**
- `PESTEL`, `PESTLE`, `PEST analysis`, `macro environment`, `external environment`, `environmental scan`, `political economic social technological environmental legal forces`, `PESTEL market entry`, `horizon scanning`, `weak signals`

<!-- skill-graph-context:end -->
