---
name: balanced-scorecard
description: "Use when building, reviewing, or applying a Balanced Scorecard for strategy execution and performance management: destination statement, strategy map, perspectives, strategic objectives, strategic readiness, measures/KPIs, targets, initiatives, owners, review cadence, cascading, and learning from performance gaps. Covers financial/stewardship, customer/stakeholder, internal process, and learning/growth or organizational-capacity perspectives, with sustainability/ESG embedded or added as a fifth perspective when strategic, and adaptation for business, nonprofit, public-sector, product, and transformation contexts. Do NOT use for upstream strategy formulation alone (use playing-to-win), quarterly goal-setting alone (use okrs), technical service thresholds (use performance-budgets), portfolio allocation (use bcg-matrix), generic internal/external factor inventory (use swot-tows), probability-weighted option valuation (use expected-value), or activity-level value/cost decomposition (use value-chain-analysis)."
license: MIT
compatibility: "Markdown, strategy maps, operating plans, KPI catalogs, performance reviews, nonprofit/public-sector scorecards, sustainability/ESG scorecards (SBSC), transformation scorecards, AI-assisted reporting with source provenance"
allowed-tools: Read Grep WebSearch WebFetch
metadata:
  relations: "{\"related\":[\"okrs\",\"playing-to-win\",\"performance-budgets\",\"value-chain-analysis\",\"swot-tows\",\"bcg-matrix\",\"expected-value\",\"mckinsey-7s\",\"scenario-planning\",\"three-horizons\",\"evaluation\",\"methodology\",\"epistemic-grounding\"],\"suppresses\":[{\"skill\":\"playing-to-win\",\"reason\":\"balanced-scorecard owns translating chosen strategy into objectives, measures, targets, initiatives, and review cadence; playing-to-win owns the upstream integrated strategy choices\"},{\"skill\":\"okrs\",\"reason\":\"balanced-scorecard owns an integrated strategic performance-management system across perspectives; okrs owns period goal-setting with Objectives and Key Results (the two compose — see the strategy-stack section — but the quarterly-goal authoring routes to okrs)\"},{\"skill\":\"bcg-matrix\",\"reason\":\"balanced-scorecard owns strategy execution metrics and learning; bcg-matrix owns portfolio allocation by market growth and relative market share\"},{\"skill\":\"swot-tows\",\"reason\":\"balanced-scorecard owns objective-measure-target-initiative translation; swot-tows owns internal/external factor inventory and option generation\"},{\"skill\":\"expected-value\",\"reason\":\"balanced-scorecard owns performance management and strategic learning; expected-value owns probability-weighted option comparison\"},{\"skill\":\"value-chain-analysis\",\"reason\":\"balanced-scorecard owns cross-perspective performance management; value-chain-analysis owns activity-level value and cost decomposition\"}],\"verify_with\":[\"methodology\",\"evaluation\",\"epistemic-grounding\"]}"
  subject: reasoning-strategy
  scope: "Balanced Scorecard strategy-execution work: translate an already-stated mission, vision, strategy, or strategic theme into a destination statement, a strategy map, and a balanced performance-management system across financial/stewardship, customer/stakeholder, internal-process, and learning/growth or organizational-capacity perspectives; define strategic objectives, causal hypotheses (treated with time-lag discipline and causality humility), measures/KPIs, baselines, targets, strategic initiatives, resources/budgets, owners, cadence, and review loops; place the scorecard inside the closed-loop strategy-execution system (develop, translate, align, plan operations, monitor and learn, test and adapt) and govern it over time with a named steward or Office of Strategy Management; adapt perspectives for nonprofit, public-sector, product, transformation, sustainability/ESG, or mission contexts, inverting the hierarchy so mission/stakeholder outcomes sit above financial stewardship where appropriate; compose with OKRs for short-cycle execution without competing; use AI/software/reporting tools without letting them replace strategy judgment; cascade without copy-pasting; and use performance gaps to learn and adjust. Excludes upstream strategy formulation as the primary task, OKR-only period goal-setting, technical performance budgets, portfolio allocation, SWOT/TOWS factor inventory, and probability-weighted valuation."
  public: "true"
  taxonomy_domain: foundations/strategy-execution
  stability: stable
  keywords: "[\"balanced scorecard\",\"strategy map\",\"performance management\",\"strategic objectives\",\"four perspectives\",\"cascading scorecards\",\"lead and lag measures\",\"strategy review cadence\",\"destination statement\",\"strategic readiness\"]"
  triggers: "[\"balanced-scorecard\",\"balanced scorecard\",\"strategy map\",\"four perspectives\",\"scorecard perspectives\",\"organization scorecard\",\"team scorecard\",\"corporate scorecard\",\"cascade organization scorecard\",\"cascade scorecard to team\",\"cascading scorecards\",\"strategic objectives measures targets initiatives\",\"balanced scorecard destination statement\",\"office of strategy management\",\"sustainability balanced scorecard\"]"
  examples: "[\"Use a Balanced Scorecard to translate this strategy into objectives, measures, targets, initiatives, owners, and a review cadence.\",\"Review this strategy map and scorecard. Are the perspectives balanced and are the KPIs tied to strategic objectives?\",\"Create a nonprofit Balanced Scorecard that includes stakeholder outcomes, internal process, organizational capacity, and stewardship measures.\",\"We have too many KPIs. Use the Balanced Scorecard to choose the few strategic measures that matter.\",\"Turn this transformation strategy into a strategy map, lead and lag measures, and initiatives we can track monthly.\",\"Write a destination statement and Balanced Scorecard for this strategy so our targets and cascades have a clear future-state anchor.\",\"Cascade this organization scorecard to a product team without making them copy every corporate metric.\",\"Add our ESG and sustainability commitments to the Balanced Scorecard without turning them into a disconnected reporting annex.\",\"An AI tool generated this scorecard. Check whether the objectives, measures, sources, targets, and initiatives are actually strategy-linked.\"]"
  anti_examples: "[\"Choose our winning aspiration, where to play, and how to win.\",\"Write quarterly OKRs with qualitative objectives and measurable key results.\",\"Generate our Q3 OKRs based on this Balanced Scorecard strategy map.\",\"Set latency, uptime, bundle-size, and error-rate thresholds for a web service.\",\"Plot product lines by market growth and relative market share.\",\"List strengths, weaknesses, opportunities, and threats and create TOWS options.\",\"Compare three options by expected cash flow and probability.\",\"Decompose our delivery activities and their costs to find differentiation and cost drivers.\"]"
  grounding: "{\"subject_matter\":\"Balanced Scorecard as a portable strategy-execution and performance-management framework\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://hbr.org/2005/07/the-balanced-scorecard-measures-that-drive-performance\",\"https://hbr.org/2007/07/using-the-balanced-scorecard-as-a-strategic-management-system\",\"https://hbr.org/2005/10/the-office-of-strategy-management\",\"https://hbr.org/2021/02/reimagining-the-balanced-scorecard-for-the-esg-era\",\"https://hbr.org/2008/08/strategy-execution-needs-a-sys\",\"https://balancedscorecard.org/bsc-basics-overview/\",\"https://balancedscorecard.org/about/nine-steps/\",\"https://www.bain.com/insights/management-tools-balanced-scorecard/\",\"https://www.hbs.edu/ris/Publication%20Files/10-074_0bf3c151-f82b-4592-b885-cdde7f5d97a6.pdf\",\"https://en.wikipedia.org/wiki/Third-generation_balanced_scorecard\",\"https://doi.org/10.1006/mare.1999.0121\",\"https://doi.org/10.1108/17410400410561231\",\"skills/reasoning-strategy/balanced-scorecard/references/balanced-scorecard-sources.md\",\"skills/reasoning-strategy/balanced-scorecard/references/upstream-displacement-2026-06-12.md\"],\"failure_modes\":[\"scorecard_reduced_to_kpi_dump\",\"financial_only_dashboard_mislabeled_as_balanced_scorecard\",\"perspectives_copied_without_strategy_fit\",\"objectives_not_linked_by_strategy_map_or_causal_hypothesis\",\"measures_without_baselines_targets_owners_or_cadence\",\"initiatives_missing_or_unlinked_to_objectives\",\"lag_measures_only_no_leading_drivers\",\"cascading_by_copying_parent_metrics_instead_of_translating_strategy\",\"scorecard_used_as_employee_compensation_or_surveillance_system\",\"nonprofit_or_public_sector_forced_into_shareholder_financial_logic\",\"scorecard_treated_as_strategy_formulation_not_execution_learning\",\"strategy_map_causal_links_asserted_as_proven_rather_than_falsifiable_time_lagged_hypotheses\",\"scorecard_disconnected_from_budgets_and_operating_plans\",\"learning_growth_reduced_to_generic_training_or_morale_counts\",\"strategic_readiness_not_connected_to_human_information_or_organization_capital\",\"esg_or_sustainability_strategy_omitted_or_bolted_on_without_strategy_fit\",\"hallucinated_esg_baselines_or_unscientific_sustainability_targets\",\"no_owner_or_governance_body_to_steward_the_scorecard_over_time\",\"software_dashboard_or_ai_connector_treated_as_the_method\",\"ai_generated_metrics_treated_as_source_of_truth\",\"targets_invented_without_baseline_or_owner_signoff\",\"strategy_too_vague_for_quantification_without_human_elicitation\",\"okrs_and_bsc_treated_as_competing_instead_of_layered\",\"private_or_sensitive_business_facts_leaked_into_examples\"],\"evidence_priority\":\"general_knowledge_first\"}"
  mental_model: "A Balanced Scorecard is a strategy-to-learning system. The primitives are a mission or strategy, a destination statement, perspectives, strategic objectives, a strategy map, measures, baselines, targets, initiatives, resources/budgets, owners, a named steward, cadence, evidence sources, and review decisions. Perspectives prevent strategy execution from collapsing into short-term financial results or disconnected ESG/KPI reporting. Objectives state what must change, measures show whether it is changing, targets define the desired level and date, initiatives name the work that should move the measures, strategic readiness names the human/information/organization capital needed for future performance, and strategy-map arrows are falsifiable, time-lagged hypotheses to test rather than proof. The scorecard is one stage of a closed loop that runs from developing strategy, through translating it and aligning the organization, planning operations and budgets, to monitoring, learning, testing, and adapting the strategy itself; review cadence turns gaps into learning rather than dashboard theatre, and many organizations pair the multi-year scorecard with OKRs as a short-cycle execution layer."
  purpose: "This skill prevents agents from producing KPI dumps, finance-only dashboards, OKR lists, or AI-generated reporting packs when the user needs an integrated strategy-execution management system. It forces each measure to trace back to a strategic objective, each objective to fit a perspective and a cause-effect story, each initiative and budget to support the objective it claims to move, and each gap to produce a decision, initiative change, or strategy-learning question."
  concept_boundary: "Balanced Scorecard is for translating strategy into a balanced set of objectives, measures, targets, initiatives, owners, and review loops. It can clarify or expose gaps in a strategy, but it is not the primary upstream act of choosing the strategy, not OKR-only quarterly goal-setting, not technical performance-budget definition, not portfolio allocation, not SWOT/TOWS factor inventory, not value-chain activity decomposition, not expected-value decision math, and not a replacement for human strategy ownership or data governance."
  analogy: "A Balanced Scorecard is like an instrument panel for a strategy: it tracks speed, fuel, engine health, route progress, and warning lights together so the driver can steer, not just admire one gauge."
  misconception: "The common mistake is treating a Balanced Scorecard as any dashboard with four boxes, or as an outdated rival to OKRs. A useful scorecard starts from strategy, names objectives, links them through a strategy map whose arrows are tested hypotheses, chooses a few meaningful measures with targets and owners, names a steward, and uses review cycles to adapt; it can sit above OKRs as the strategy map they ladder up to rather than competing with them."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/reasoning-strategy/balanced-scorecard/SKILL.md
---

## Concept of the skill

**What it is:** The Balanced Scorecard is a strategy-execution and performance-management framework that translates strategy into objectives, measures, targets, initiatives, owners, resources, and review learning across several perspectives.

**Mental model:** Start with strategy, not metrics. Capture a destination statement of the desired future state, arrange the work through perspectives, define strategic objectives, link them in a strategy map, choose a small set of measures for each objective, set targets and initiatives, assign owners and resources, name a steward, and review gaps to learn whether execution or strategy needs to change.

**Why it exists:** Agents often produce dashboards that count what is easy, goals that are not measurable, financial reports that ignore future capability, or AI-generated metric tables with no source discipline. This skill keeps short-term results, customer or stakeholder outcomes, internal process performance, and long-term capacity visible together. Kaplan and Norton designed the system to break the four classic barriers that make most strategies fail in execution: the **vision barrier** (few people understand the strategy), the **people barrier** (incentives are not linked to strategy), the **management barrier** (management meetings discuss short-term operations, not strategy), and the **resource barrier** (budgets are not linked to strategy).

**What it is NOT:** It is not upstream strategy formulation, OKR-only goal-setting, a KPI catalog, a technical performance budget, portfolio allocation, SWOT/TOWS, value-chain analysis, expected-value math, a compensation system, or a dashboard/software setup alone.

**Adjacent concepts:** strategy execution, strategic objectives, destination statements, strategy maps, KPIs, lead and lag indicators, causal hypotheses, targets, initiatives, cascading, management review, organizational capacity, strategic readiness, stewardship, Office of Strategy Management, sustainability/ESG, stakeholder outcomes, data provenance, OKRs, dashboards.

**One-line analogy:** A Balanced Scorecard is an instrument panel for a strategy, showing several gauges needed to steer instead of one financial speedometer.

**Common misconception:** A Balanced Scorecard is not a dashboard with four unlabeled boxes, nor an outdated alternative to OKRs. The scorecard is useful only when the measures are tied to strategic objectives, targets, initiatives, owners, resources, data sources, and a learning cadence stewarded by a named owner.

# Balanced Scorecard

## Domain Context

Use the Balanced Scorecard when the user already has a strategy, mission, vision, strategic theme, transformation agenda, or operating model and needs to translate it into a management system. The method is strongest when leaders must track both current performance and the future capabilities that create tomorrow's performance.

Balanced Scorecard literature treats the framework as a strategic planning and management system, so it can help clarify, update, or expose gaps in a strategy. In this skill's routing boundary, however, it should not become the primary method for making competitive strategy choices. If the winning aspiration, where-to-play choice, how-to-win logic, or capability system is missing, ask for it, infer a provisional strategic theme with a visible caveat, or route the strategy-choice work to `playing-to-win`.

The Balanced Scorecard has evolved through three design generations, and naming the generation prevents the most common confusion about what the tool is:

| Generation | Core artifact | What it added |
| --- | --- | --- |
| 1st (1992) | Four-perspective measurement dashboard | Balanced financial and non-financial measures so leaders stop steering on lagging financials alone. |
| 2nd (late 1990s) | Strategy map | Explicit cause-and-effect objectives linking the perspectives; the scorecard became a strategy-communication tool, not just a measurement set. |
| 3rd (1998+) | Destination statement | A narrative picture of the desired future state, so objectives and targets are derived from an agreed destination rather than invented metric by metric (Lawrie & Cobbold, 2GC). |

A scorecard that is only a four-box dashboard is a first-generation artifact. The value this skill teaches lives in the second and third generations: the strategy map and the destination statement. Do not downgrade a mature scorecard request into a first-generation KPI table.

Use public, aggregate, or synthetic examples only. Do not include personal data, customer records, payment data, employee records, private forecasts, secrets, confidential deal details, or sensitive business facts in scorecard examples or evals.

The output is not a prettier dashboard. It is a strategy execution contract:

```text
Destination statement -> strategic objective -> causal hypothesis -> measure -> baseline -> target -> initiative -> resource/budget -> owner -> cadence -> decision rule
```

If a metric cannot be traced to a strategic objective, or if a strategic objective has no owner, target, initiative, resource path, or review use, the scorecard is not ready.

### Where the scorecard sits in the closed-loop system

A Balanced Scorecard is one stage of a closed-loop strategy-execution system, not the whole thing. Kaplan and Norton's *Execution Premium* names six stages, and knowing the neighbors tells you what the scorecard must connect to:

1. **Develop the strategy** — clarify mission, values, vision; formulate the strategy. *(Route to `playing-to-win`; the scorecard does not do this.)*
2. **Translate the strategy** — strategy map, objectives, measures, targets, initiatives, and the budgets that fund them. **This is the core of this skill.**
3. **Align the organization** — cascade to business units and link people's objectives to the scorecard. *(Cascade section below.)*
4. **Plan operations** — connect strategic measures and targets to operating plans, process improvement, and the annual budget.
5. **Monitor and learn** — operational reviews (short cycle) and strategy reviews (longer cycle). *(Review section below.)*
6. **Test and adapt** — periodically question whether the strategy itself, not just its execution, is still right.

The practical consequence: a scorecard that does not connect to budgets (stage 4) and does not feed a strategy-review meeting that can change the strategy (stages 5–6) is a measurement artifact, not a management system. Two of the four execution barriers above — the resource barrier and the management barrier — are broken only by those connections.

### AI governance and data provenance

Modern strategy execution often uses AI assistants, connectors, and dashboards to synthesize data, but the core of the method remains the human causal hypothesis and the human-owned decision.

- **Human-in-the-loop.** AI can suggest measures, baselines, or targets, but every scorecard element needs an explicit human owner who approves the target and is accountable for the result.
- **Data provenance.** Record the source and method for every data feed (e.g., "Source: CRM API; Calculation: rolling 30-day average"). This prevents *dashboard theatre*, where polished metrics appear with no verifiable grounding.

The dedicated AI/software section below makes this operational. The rule throughout: software shows progress and drafts artifacts; it does not decide the strategy, validate a causal hypothesis, invent a trustworthy baseline, or own a management decision.

## Coverage

This skill teaches agents to:

1. Decide whether a Balanced Scorecard is the right tool for the user's request, potentially in tandem with OKRs.
2. Start from strategy, mission, vision, strategic themes, stakeholders, and decision cadence before choosing metrics, and capture a destination statement of the desired future state.
3. Classify the strategy source (stated / provisional / inferred) and either ask for missing strategic choices or route them upstream to `playing-to-win`.
4. Use perspectives to balance short-term financial or stewardship outcomes with customer/stakeholder outcomes, internal process performance, and learning/growth or organizational capacity.
5. Adapt perspective names for nonprofit, public-sector, product, transformation, sustainability/ESG, and mission-driven contexts without losing the balancing function — and for nonprofit/public-sector, invert the hierarchy so mission/beneficiary outcomes sit at the apex and financial/stewardship becomes the enabling base.
6. Embed sustainability/ESG across the four perspectives or add it as a linked fifth perspective when it is a core strategic pillar — never as a disconnected reporting annex.
7. Define strategic objectives in each perspective.
8. Build a strategy map that makes cause-effect hypotheses explicit before selecting metrics — and treat those links as falsifiable, time-lagged hypotheses, not proven causal laws.
9. Select a small set of lead, lag, guardrail, strategic-readiness, and (where strategic) ESG measures tied to objectives.
10. Structure the learning/growth perspective as strategic readiness across human, information, and organization capital, not generic training counts.
11. Add definitions, baselines, targets, owners, data sources with provenance, cadence, and interpretation rules.
12. Link strategic initiatives, resources, and budgets to the objectives they are meant to move, and flag unfunded initiatives.
13. Cascade scorecards by translating strategy for each level, not by copying every parent metric.
14. Compose cleanly with OKRs (the scorecard as the multi-year strategic architecture, OKRs as the short-cycle execution layer) without treating them as rivals.
15. Use AI, connectors, dashboards, and performance-management software as execution support without treating generated metrics or reports as source of truth.
16. Place the scorecard inside the closed-loop execution rhythm and govern it with a named steward or Office of Strategy Management.
17. Use review cycles to learn from gaps and decide whether to adjust execution, targets, initiatives, resources, or strategy assumptions.
18. Route adjacent work to the right framework instead of stretching the Balanced Scorecard beyond its mechanism.

## Philosophy of the skill

Balanced Scorecard exists because measurement changes behavior. If leaders track only financial results, teams optimize for what has already happened and may underinvest in customers, processes, learning, culture, systems, and capabilities. If leaders track everything, attention disappears into metric noise. The scorecard forces a small set of strategy-linked measures that balance results with drivers.

The method is not "more metrics." The method is disciplined translation. A strategic statement becomes objectives; objectives become measures; measures get baselines and targets; targets get initiatives, resources, and owners; review meetings use gaps to learn. The scorecard should make the strategy visible enough that people can act on it and revise it when evidence contradicts the causal story.

The four classic perspectives are a starting architecture, not a prison. For a public agency, financial may become stewardship; for a nonprofit, customer may become stakeholder or beneficiary; for a product group, internal process may include delivery, quality, and adoption loops; for a transformation program, organizational capacity may include skills, platforms, and operating rhythm. Keep the balancing logic even when the labels change.

**Honesty about causality.** The strategy map's arrows are the most powerful and the most overclaimed part of the method. The academic critique (most prominently Hanne Nørreklit) is that the cause-and-effect links between perspectives are *logical* relationships, not empirically proven *causal* ones, and that asserting "construct causality" as if it were natural-law causality makes the scorecard sound more scientific than the evidence supports. The mature stance is not to abandon the strategy map but to treat every link as a falsifiable, **time-lagged** hypothesis: better training does not improve customer retention this quarter, and if it never does, the link was wrong. A scorecard that presents its causal links as settled facts, rather than as bets to be tested in the review meeting, has imported the critique's exact failure mode.

**Software does not replace the method.** Modern tools can automate data collection, dashboards, review packs, reminders, and report generation. A software platform can show progress; an AI connector can fetch data or draft candidate measures; neither can decide the strategy, validate the causal hypothesis, invent a trustworthy baseline, or own a management decision.

**Stewardship.** A scorecard with no owner decays into a quarterly reporting chore. For larger organizations a named scorecard owner or Office of Strategy Management-like function coordinates definitions, cascade integrity, data quality, review calendars, and action follow-up; it does not replace executive strategy ownership but prevents the scorecard from becoming an orphaned reporting artifact.

**Compose with OKRs, do not fight them.** Many organizations run the multi-year Balanced Scorecard as the long-term compass and OKRs as the short-cycle execution engine — a pairing sometimes described informally as a "strategy stack" or "two-speed execution." The routing edge to `okrs` is about who authors the quarterly goals; it does not mean the two methods are rivals.

## 1. Decide Whether Balanced Scorecard Fits

Use a Balanced Scorecard when the user needs strategy execution, performance management, a strategy map, cross-perspective measures, target setting, initiative alignment, budget/resource alignment, cascading, or review cadence.

Do not use it as the primary method when the user needs:

| User need | Better fit | Reason |
| --- | --- | --- |
| Choose the strategy | `playing-to-win` | Balanced Scorecard translates and manages strategy; it does not choose the winning aspiration, where to play, or how to win. |
| Write period goals | `okrs` | OKRs are a lighter period goal-setting method; a scorecard is a broader strategic performance-management system. |
| Set technical thresholds | `performance-budgets` | Technical budgets define service/product quality limits; scorecards track organizational strategic objectives. |
| Allocate product/business portfolio | `bcg-matrix` | BCG classifies portfolio units by growth and relative share. |
| Inventory strengths/weaknesses/opportunities/threats | `swot-tows` | SWOT/TOWS generates strategic options from factor inventory. |
| Quantify expected payoff | `expected-value` | Expected value compares options with probabilities and payoffs. |
| Decompose value-creating activities | `value-chain-analysis` | Value Chain analysis maps activity-level value and cost. |
| Diagnose organizational alignment | `mckinsey-7s` | McKinsey 7S diagnoses internal alignment among strategy, structure, systems, shared values, skills, style, and staff; a scorecard manages execution measures and learning after strategic direction is usable. |

`performance-budgets` is a soft cross-subject redirect rather than a `relations.suppresses` edge. Technical thresholds such as latency, uptime, bundle size, error budgets, and accessibility limits belong to technical quality governance; the scorecard should only include them when they are linked to organizational strategic objectives.

If the strategy is missing, ask for it or infer a provisional strategic theme and label it explicitly. Do not hide a strategy-choice gap behind confident metrics.

### Composing with OKRs (not the same as choosing between them)

The `okrs` suppression edge is a **routing** decision: when a request is purely about quarterly Objectives and Key Results, route there. It does not mean the two methods are rivals in practice. The common, well-documented composition is:

- The **Balanced Scorecard is the strategic architecture** — perspectives, strategy map, multi-year objectives, annual targets. It answers "what strategy are we executing, and is it balanced?"
- **OKRs are the short-cycle execution layer** — each quarter, teams derive OKRs from the scorecard objectives they can influence. They answer "what do we move in the next 90 days?"
- Each OKR should trace to a scorecard perspective and objective; review OKRs every 1–2 weeks and the scorecard monthly or quarterly.

When a user already runs OKRs and asks for a scorecard (or vice versa), do not force a replacement — show how the scorecard sits above the OKRs as the strategy map they ladder up to, and hand the quarterly-goal authoring itself to `okrs`. **If the request is to generate the actual 90-day OKR artifact from a scorecard input, that authoring is `okrs`'s job**, even though the scorecard owns the architecture it ladders up to.

## 2. Frame The Strategy Execution Question

Begin with the minimum context required to make the scorecard strategic.

```text
Organization or unit:
Mission / vision / strategic theme:
Strategy source:
Strategy confidence: stated / provisional / inferred
Destination statement:
Strategy steward / OSM owner:
Decision owner:
Planning horizon:
Review cadence:
Stakeholders:
What must improve:
What must not be sacrificed:
Existing measures:
Known data sources:
Resource or budget constraints:
Sensitive-data constraints:
```

Classify the strategy source before drafting — Balanced Scorecard is used to clarify and align strategy, not only to manage an already-perfect one, so handle vague input explicitly instead of assuming the user "already" has a complete strategy:

| Strategy source state | What to do |
| --- | --- |
| Explicit strategy | Build the scorecard from the stated mission, vision, strategic themes, or strategy choices. |
| Vague strategy | Ask for the missing strategic choices or write a provisional strategic theme with caveats. |
| Metric list only | Reverse-engineer implied objectives, mark uncertainty, and ask which strategy the metrics are supposed to serve. |
| Conflicting strategies | Surface the conflict and route upstream choice-making to `playing-to-win` before committing targets. |
| Future state unclear | Ask for a destination statement before setting targets or cascading measures. |
| Too tacit to quantify | Some strategic intent is too vague to scorecard without human elicitation; surface that the intent must be made explicit before measures can be defined, rather than inventing measurable proxies. |

If the user provides only a metric list, reverse-engineer the implied objectives and flag uncertainty:

```text
Inferred objective:
Metric currently used:
Why this metric may matter:
What it misses:
Better measure or companion measure:
Evidence needed:
```

Do not invent baselines, targets, budgets, or owners. Use `TBD`, a range, or a stated assumption and list the source needed to verify it.

## 2A. Anchor Targets With A Destination Statement

Before choosing a single measure, capture where the strategy is supposed to arrive. A **destination statement** is a short, concrete narrative of what the organization, unit, product, program, or mission will look like at the end of the planning horizon (typically three to five years out), written in the present tense as if you are already there. It is the third-generation BSC innovation (Lawrie & Cobbold) and it does real work: targets become derivations from an agreed destination rather than numbers invented metric by metric, and it gives the review meeting a picture to test progress against.

Use it especially when:

- leaders disagree about what success looks like,
- target levels feel arbitrary,
- cascaded scorecards are drifting into copied parent metrics,
- perspective labels need adaptation,
- the scorecard must coordinate multiple teams, stakeholders, or programs.

Destination statement template:

```text
Destination date:
Strategic theme:
Future-state narrative (present tense):
- For its customers/stakeholders, looks like: ...
- In how it operates, looks like: ...
- In its people, capabilities, and systems, looks like: ...
- In its financial/stewardship position, looks like: ...
Critical trade-offs:
Assumptions and time lags:
Owner signoff:
```

A good destination statement is specific enough that two readers would agree whether it has been reached. If you cannot write it, the strategy is probably underspecified — surface that gap rather than papering over it with metrics. The destination statement does not replace strategy formulation: if it exposes missing winning choices, route those choices upstream to `playing-to-win`.

## 3. Choose Perspectives

Use the classic four perspectives when they fit. Rename them when the organization type makes another label clearer.

| Classic perspective | Core question | Business examples | Public/nonprofit/product adaptation |
| --- | --- | --- | --- |
| Financial / stewardship | What financial or stewardship result must the strategy deliver? | revenue growth, margin, cash flow, return on capital, unit economics | stewardship, grant sustainability, cost per outcome, budget resilience |
| Customer / stakeholder | How must customers or stakeholders experience value? | retention, satisfaction, share of wallet, customer outcome | beneficiary outcomes, citizen trust, access, equity, partner value |
| Internal process | What processes must perform well to deliver the strategy? | quality, cycle time, delivery reliability, compliance, data security | service delivery, policy execution, case throughput, operational resilience |
| Learning and growth / organizational capacity | What capabilities enable future performance? | human capital (skills), information capital (systems), organization capital (culture/alignment) | workforce capability, technology platform, institutional learning, volunteer capacity |
| Sustainability / ESG *(when strategic)* | How do we manage environmental and societal value and risk? | emissions per unit, decarbonization, physical climate risk, supplier ethics | regulatory alignment, nature-related risk, community outcome, access equity |

Do not force every scorecard into exactly these labels if another set preserves the balancing mechanism better. Do keep at least one result perspective and at least one driver/capability perspective, otherwise the scorecard collapses into a dashboard.

### Nonprofit and public-sector: invert the hierarchy (mission at the top)

For a for-profit, the financial perspective sits at the apex of the strategy map — every other perspective ultimately serves financial results. Kaplan and Norton's nonprofit and public-sector adaptation **inverts this order**: the **mission** (or the stakeholder/beneficiary outcome that expresses it) moves to the top, and the **financial/stewardship perspective drops to a supporting, enabling role** — a resource constraint and license to operate, not the end the strategy serves. For these organizations financial success is a *means* (stay solvent, steward funds well, sustain grants and budget) toward the mission, never the goal. So when adapting perspectives for a nonprofit or agency, do not just rename "customer" to "stakeholder" — re-order the strategy map so mission/beneficiary outcomes are the apex the causal chain climbs toward, with financial/stewardship as the base that funds it. A nonprofit scorecard that keeps shareholder-financial logic at the apex has imported the exact `nonprofit_or_public_sector_forced_into_shareholder_financial_logic` failure mode: the strategy map then optimizes for budget instead of mission outcomes.

### Sustainability and ESG: embedded or a fifth perspective?

When sustainability, climate, social, or governance (ESG) commitments are strategic — not just compliance reporting — there are two documented patterns, and the right choice depends on how central they are to the strategy:

| Pattern | When to use | Risk |
| --- | --- | --- |
| **Embed across the four** | ESG matters but is one of several strategic themes; e.g. emissions targets sit in internal process, supplier ethics in customer/stakeholder, board diversity in learning & growth. | ESG objectives get diluted and quietly dropped when other priorities crowd the perspective. |
| **Add a fifth sustainability perspective** (Sustainability Balanced Scorecard, SBSC) | Sustainability is a core strategic pillar or a license to operate; it needs its own objectives, measures, and cause-effect links into the other perspectives. | A bolt-on fifth box that is never linked into the strategy map becomes a disconnected ESG annex — the exact failure the scorecard exists to prevent. |

Either way, the test is the same as for any perspective: the sustainability objectives must connect through the strategy map (e.g. lower emissions → regulatory and reputational resilience → stakeholder trust → funding/financial durability) with measures, targets, and owners. ESG bolted on without strategy fit is a reporting exercise wearing scorecard clothing. When generating ESG examples, do not invent regulatory frameworks, Scope 1/2/3 baselines, or carbon-reduction targets — use real figures the user supplies or explicitly mark them synthetic; a hallucinated ESG baseline is worse than a `TBD`.

## 4. Define Strategic Objectives

Strategic objectives state what must change. They are not measures, initiatives, or slogans.

Strong objectives:

- connect to the strategy and destination statement,
- describe an outcome or capability state,
- are specific enough to measure,
- fit one perspective,
- can be owned and reviewed,
- create trade-offs against lower-priority work,
- are few enough that leaders can review them without losing focus.

Weak objectives:

- "Improve everything"
- "Track customer satisfaction"
- "Launch the project"
- "Be innovative"
- "Increase metrics"
- "Report ESG"
- "Use AI for strategy"

Rewrite weak objectives:

| Weak item | Stronger strategic objective |
| --- | --- |
| Track NPS | Increase customer confidence in the onboarding experience |
| Launch data platform | Make trustworthy customer and product data available for weekly decisions |
| Reduce cost | Lower unit cost without reducing service reliability |
| Train employees | Build the skills needed to operate the new service model |
| Improve sustainability | Reduce operating footprint while preserving delivery quality |
| Report ESG | Reduce material supplier emissions while maintaining availability and margin guardrails |
| Use AI for reporting | Make verified scorecard evidence available before each monthly strategy review |

Keep the objective set small enough to manage. A useful first scorecard often has two to four objectives per perspective, not dozens.

## 5. Build The Strategy Map

A strategy map makes the cause-effect story explicit. Build it before choosing metrics. It should answer:

```text
If we build these capabilities,
then these internal processes improve,
then customers/stakeholders experience this value,
then these financial/stewardship/mission results follow.
```

Use arrows as hypotheses, not decoration. Every link should name the assumed mechanism:

| Link | Mechanism to test |
| --- | --- |
| Training -> service reliability | Skill gaps currently cause repeat errors or slow resolution. |
| Data quality -> product adoption | Better usage insight lets teams remove the highest-friction steps. |
| Process cycle time -> customer retention | Faster completion reduces abandonment and support escalation. |
| Stakeholder trust -> funding resilience | Demonstrated outcomes improve renewal, donation, or budget support. |
| Supplier emissions -> brand trust | Material environmental improvements affect stakeholder trust or purchasing decisions. |
| Decision-data availability -> initiative reprioritization | Leaders can stop weak initiatives sooner when trusted evidence is ready before review meetings. |

If you cannot explain a link, either remove it or mark it as an assumption that needs evidence.

**Two disciplines keep the map honest:**

- **Links are hypotheses, not proven laws.** Distinguish a *logical/definitional* relationship ("completed training increases training completion"; "revenue = price × volume") from a *causal* hypothesis ("demonstrated capability reduces repeat service errors"). The empirical evidence for cross-perspective causality is weak; label each causal link as an assumption and decide, in advance, what evidence in the review meeting would confirm or refute it.
- **Links are time-lagged.** A leading driver (training, data quality, platform adoption) moves *before* the lagging outcome it is supposed to cause. Expecting this quarter's capability investment to show up in this quarter's retention number is how teams wrongly conclude "the link doesn't work" and abandon a sound bet. Name the expected lag for each link so the review reads the timing correctly.

Apply this causality checklist to each arrow:

- **Sequence:** the driver must plausibly precede the outcome in time.
- **Relationship type:** separate definitional/accounting/formula relationships from causal hypotheses that require evidence.
- **Independence:** do not treat two measures as causal merely because they move together.
- **Mechanism:** name why the upstream objective should move the downstream objective.
- **Evidence:** state what data, review question, or experiment would weaken or confirm the hypothesis.
- **Lag:** define when a lead measure should be expected to affect a lag measure.

When in doubt, say "hypothesis" or "assumption" rather than claiming proof.

## 6. Choose Measures

For each objective, choose one or two measures that show progress. Prefer paired lead and lag measures when possible.

| Measure type | Use for | Example |
| --- | --- | --- |
| Lag measure | Outcome after work has had an effect | retention, margin, incident rate, program completion |
| Lead measure | Driver that should move the outcome | activation milestone, defect escape rate, training completion with demonstrated competence |
| Quality guardrail | What must not be sacrificed while improving another measure | service reliability, customer trust, compliance, equity, safety |
| Capacity measure | Future capability needed for the strategy | platform adoption, skill coverage, data freshness, process maturity |
| Strategic-readiness measure | Whether human, information, or organization capital is ready to support the strategy | certified coverage in strategic roles, decision data available by review date, operating-rhythm adoption |
| Stakeholder / ESG measure | Social, environmental, safety, community, or governance outcome tied to strategy | emissions per unit, access equity, safety incident rate, supplier compliance, community outcome |

Every measure needs:

```text
Objective:
Measure:
Definition / formula:
Measure type: lead / lag / guardrail / capacity / strategic-readiness / ESG
Baseline:
Target:
Time horizon:
Owner:
Data source:
Data quality / provenance:   (where the number comes from, how trustworthy, manual vs system vs model-generated)
Cadence:
Interpretation rule:
Linked initiative:
Known failure mode:
```

A named data source is not the same as a trusted one. Record the provenance of every measure — where the number originates, whether it is manually entered, pulled from a system of record, or produced by an analytics/AI tool — and how trustworthy it is. A measure whose baseline or target cannot be sourced is an assumption, not a fact; mark it as such rather than presenting it with false confidence.

Avoid vanity metrics, pure activity counts, and measures chosen only because they are easy to obtain. If a metric cannot change a decision, it is not a scorecard metric.

**Watch for measure gaming.** Any measure that is tied to reward or status will be optimized, sometimes against the objective it was meant to serve (Goodhart's law). Pairing each lag measure with a guardrail, and keeping the scorecard out of individual compensation (see cascading), are the main defenses.

**AI- and software-generated inputs require provenance and a human owner.** When measures, baselines, targets, reports, or strategy-map links are produced or suggested by an analytics tool or an AI assistant, treat the output as a draft input, not source of truth. Each such input needs recorded provenance (which tool, which data, when) and explicit human-owner approval before it enters the scorecard. A target or baseline that exists only because a model emitted it — with no human owner willing to be accountable for it — must be flagged, not booked as a fact. The agent's job here is to define the *contract* for the metric (definition, source, owner, decision rule), not to write data-ingestion code or build the analytics pipeline.

## 7. Strengthen Learning And Growth As Strategic Readiness

The learning and growth perspective is often the weakest part of a scorecard because agents fill it with generic training, morale, or engagement measures that are not tied to the strategy. Kaplan and Norton's *Strategy Maps* reframes this perspective as **strategic readiness**: how prepared the organization's intangible assets are to execute *this* strategy, measured as a gap against what the strategy's internal processes actually require. Three capital types structure it:

| Capital type | What it covers | Readiness question |
| --- | --- | --- |
| **Human capital** | Skills, talent, and know-how | Do the people in the strategy-critical jobs have the competencies those jobs require? |
| **Information capital** | Systems, databases, networks, applications | Do the information systems exist and perform well enough for the strategy's processes? |
| **Organization capital** | Culture, leadership, alignment, teamwork, knowledge-sharing | Is the organization aligned and capable of the change the strategy demands? |

The discipline: identify the few strategic-job families, systems, and cultural shifts the strategy's internal-process objectives depend on, then measure the *readiness gap* for each.

| Capability asset | Weak measure | Stronger strategic-readiness measure |
| --- | --- | --- |
| Human capital | Training hours completed | Percentage of strategic-role holders who demonstrate the required capability in a real workflow |
| Information capital | Data platform launched | Critical decisions with trusted data available before the review cadence |
| Organization capital | Employee satisfaction | Adoption of the operating rhythm, decision rights, or cross-team dependency pattern required by the strategy |
| Culture and alignment | Values campaign delivered | Teams that can name their local contribution to the strategy and the trade-off it implies |
| Innovation capacity | Number of ideas submitted | Validated experiments that progress to funded initiatives or explicitly kill weak assumptions |

Use generic measures such as morale, turnover, or training completion only when the strategy map explains why they are causal drivers. Otherwise they belong in HR or operating dashboards, not in the strategic scorecard.

## 8. Set Targets, Initiatives, And Resources

Targets define the desired level of performance by a date. Initiatives name the work expected to move objectives and measures. Resources and budgets make the initiative credible.

Good targets:

- have a baseline,
- have a target value or directional threshold,
- have a date,
- are ambitious but not fantasy,
- preserve guardrails,
- explain what decision follows if missed or exceeded,
- have explicit owner signoff when generated from incomplete data.

Good initiatives:

- name the strategic objective they support,
- have an owner,
- have committed resources or budget,
- have milestones,
- have expected measure impact,
- are few enough to manage,
- identify dependencies that could block the expected impact.

Do not attach every project to the scorecard. A scorecard initiative should be strategic, not business-as-usual task tracking.

**Fund the initiatives explicitly (the resource barrier).** Every strategic initiative needs a credible, protected resource path, or it loses to day-to-day spending every cycle. Kaplan and Norton describe managing strategic initiatives as a *portfolio* linked to the scorecard, and one well-documented funding pattern is a dedicated strategic-expenditure (STRATEX) line separate from the operational budget — but a ring-fenced STRATEX line is one pattern, not a universal requirement. What is non-negotiable is that the funding be real and shielded: an initiative whose only resourcing is "spare capacity" or an unfunded line is a wish, not a plan. If an initiative has no funding, time, staff, authority, or dependency path, mark it as unfunded or blocked rather than letting the scorecard pretend the target is actionable.

## 9. Cascade Without Copying

Cascading means translating the strategy for lower levels, not cloning the parent scorecard.

| Cascade mistake | Repair |
| --- | --- |
| Every team inherits every corporate metric | Translate only the objectives the team can materially influence. |
| Local teams optimize their own measure against enterprise outcomes | Add shared guardrails and cross-team dependencies. |
| Measures become more specific but lose the strategy | Keep the parent objective visible and state the local contribution. |
| Accountability is vague | Assign owners for objectives, measures, and initiatives. |
| Individual scorecards become surveillance | Keep scorecards focused on strategy execution, not personal monitoring. |
| Tier-2 metrics are more operational but less strategic | Tie each local measure back to a parent objective and mechanism. |

Use this cascade template:

```text
Parent objective:
Local contribution:
Local objective:
Measure:
Target:
Owner:
Initiative / quarterly OKR linkage:
Dependency:
Escalation trigger:
```

For teams and individuals, keep the scorecard focused on line of sight and contribution. Do not turn it into personal surveillance or compensation math.

## 10. Compose With OKRs (The Strategy Stack)

Where both methods are in use, run an optional "strategy stack" / two-speed execution model. Do not treat the BSC and OKRs as competing frameworks: the BSC carries organizational health and long-term balance; OKRs carry focused, short-cycle momentum.

- **The compass (BSC):** the strategic objectives across perspectives, the destination statement, and the cause-and-effect strategy map for a multi-year horizon.
- **The engine (OKRs):** each quarter, cross-functional teams take the BSC objectives that need movement and derive ambitious short-term Key Results that drive the scorecard's lead measures.

Translate concretely. A BSC lead measure such as "platform adoption rate" becomes a quarterly Key Result such as *"Onboard 500 new users to the data platform in Q3"* — same objective, different time-base. Keep the parent objective and the assumed causal link visible so the quarterly goal does not drift away from the strategy. The 90-day OKR artifact itself is authored by `okrs`; the scorecard supplies the architecture it ladders up to.

## 11. Use AI And Software Without Losing The Method

Balanced Scorecard software, dashboards, AI assistants, and connectors can help with data retrieval, reporting, reminders, workflow updates, anomaly summaries, and draft artifacts. They do not replace strategic judgment, source provenance, or owner accountability.

Use AI/software for:

- collecting scorecard evidence from approved source systems,
- drafting candidate objectives or measures from a stated strategy,
- checking whether metrics trace to objectives,
- identifying missing baselines, targets, owners, data sources, or review rules,
- summarizing review packs and open gaps,
- generating charts or dashboards from already-approved measures.

Do not use AI/software to:

- invent the strategy,
- invent targets or baselines without evidence,
- treat a generated metric catalog or opaque AI "health score" as authoritative,
- expose raw private data in examples or eval artifacts,
- bypass permission boundaries from source systems,
- replace a named owner or management decision.

Add this provenance block when the scorecard uses retrieved or AI-assisted evidence:

```text
Evidence source:
Access boundary:
Generated or retrieved by:
Human owner who approved interpretation:
Assumptions:
Data quality concerns:
Private data excluded:
```

If an AI-generated scorecard looks polished but lacks strategy source, causal links, data provenance, baselines, owners, or decision rules, mark it incomplete.

## 12. Review, Learn, And Govern

The scorecard matters only if it changes management behavior. Distinguish two review rhythms (the closed loop's stages 5–6):

- **Operational reviews** — frequent, short, about whether operations and initiatives are on plan.
- **Strategy reviews** — less frequent, about whether the strategy *itself* and its causal hypotheses still hold. This is where the management barrier breaks: a meeting that only reviews operations never tests the strategy.

A useful review cadence asks:

1. Which measures are on track, off track, or ambiguous?
2. Which objective is not moving despite initiative activity?
3. Which initiative appears ineffective or under-resourced?
4. Which lead measure moved but lag measure did not — and is the expected time-lag elapsed?
5. Which causal link in the strategy map may be wrong?
6. Which target was unrealistic or sandbagged?
7. Which data source or AI-generated score is untrusted?
8. Which ESG, stakeholder, or quality guardrail is being sacrificed?
9. Which execution barrier is showing up: vision, people, management, or resource?
10. What decision changes now: continue, adjust, stop, fund, escalate, or revise strategy?

Record decisions, not just status colors.

```text
Review date:
Objective:
Measure status:
Gap:
Root cause hypothesis:
Decision:
Owner:
Resource change:
Next evidence:
Next review date:
```

### Close the execution barriers

A Balanced Scorecard should address the recurring barriers between strategy and execution:

| Barrier | Symptom | Scorecard repair |
| --- | --- | --- |
| Vision barrier | People cannot explain the strategy or future state | Add a clear strategy source, destination statement, strategy map, and local contribution statement. |
| People barrier | Team goals, incentives, or work plans do not line up with the strategy | Cascade by local contribution, assign owners, and keep scorecards out of personal surveillance. |
| Management barrier | Reviews focus on operations only, not strategy learning | Separate operating status from strategy review, schedule cadence, and record decisions. |
| Resource barrier | Budgets and staff are not linked to strategic objectives | Link initiatives to resources, budgets, authority, dependencies, and blocked/unfunded status. |

### Who owns the scorecard over time

A scorecard with no steward decays into a quarterly reporting chore. Name an explicit governance owner:

- **Named steward** — for a small org or a single unit, one person (e.g., chief of staff, head of ops) responsible for the review cadence and data integrity.
- **Office of Strategy Management (OSM)** — at enterprise scale or for complex cases, a dedicated function that coordinates communicating the strategy, keeping unit scorecards aligned, running the strategy-review meetings, managing the test-and-adapt loop, and stewarding the BSC↔OKR integration.

Either way, name who keeps the scorecard alive between reviews; an unowned scorecard ("governance orphan") is the most common quiet death of the method. The steward coordinates the closed loop; executives still own strategy choices and trade-offs.

The closed-loop execution rhythm the steward maintains:

```text
1. Develop or clarify strategy.   (route strategy choice to playing-to-win)
2. Translate strategy into destination statement, strategy map, objectives, measures, targets, and initiatives.
3. Align organization units and teams through translated scorecards.
4. Plan operations, resources, budgets, and the initiative portfolio.
5. Monitor and learn through operating and strategy reviews.
6. Test and adapt the strategy when evidence contradicts assumptions.
```

## Output Format

For a full Balanced Scorecard, produce:

```markdown
# Balanced Scorecard

## Strategy Source & Destination
- Mission / vision / strategy:
- Strategy confidence: stated / provisional / inferred
- Destination statement (3–5 year picture):
- Unit:
- Horizon:
- Review cadence (operational / strategy):
- Stakeholders:
- Scorecard steward / governance (e.g., OSM):
- Sensitive data excluded:

## Strategy Map
| Perspective | Strategic objective | Cause-effect link | Mechanism | Expected lag | Assumption to test |
| --- | --- | --- | --- | --- | --- |

## Scorecard
| Perspective | Objective | Measure | Type | Baseline | Target | Owner | Data source & provenance | Cadence | Initiative / OKR | Decision rule |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

## Initiatives And Resources
| Initiative | Supports objective | Expected measure impact | Owner | Budget / STRATEX | Milestone | Dependency | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |

## Execution System
| Barrier | Current risk | Repair | Owner |
| --- | --- | --- | --- |

## Review Plan
| Review question | Evidence | Decision options | Closed-loop stage |
| --- | --- | --- | --- |

## Gaps And Assumptions
- Missing strategy evidence:
- Missing destination statement:
- Missing data:
- Unsourced / low-provenance measures, baselines, or targets:
- AI/software-generated inputs lacking human-owner approval:
- Unfunded initiatives:
- Risk of metric gaming:
- Perspective imbalance:
- Causal / time-lag links treated as proven rather than tested:
- Unowned scorecard stewardship:
- Execution barrier present:
```

## Quality Checklist

Before finalizing, verify:

- [ ] The strategy source is named or a provisional inference is labeled.
- [ ] A destination statement describes the desired future state, or its absence is flagged.
- [ ] Perspectives are balanced and adapted to the organization type, with mission/stakeholder outcomes placed above financial stewardship for nonprofit/public-sector work.
- [ ] Sustainability/ESG is either embedded with strategy fit or given a linked fifth perspective — never a disconnected annex (when in scope); ESG baselines/targets are real or explicitly synthetic, never hallucinated.
- [ ] Each perspective has strategic objectives, not just metrics.
- [ ] Each objective has at least one measure and no more than a small practical set.
- [ ] Measures include definitions, baselines, targets, owners, data sources, cadence, and decision rules.
- [ ] Each measure's data source has recorded provenance and a trust assessment; unsourced baselines/targets are flagged as assumptions.
- [ ] Any AI- or software-generated measure, baseline, target, or report carries provenance and explicit human-owner approval, not booked as source of truth.
- [ ] Lead and lag measures are both considered, with expected time-lags named.
- [ ] Learning/growth measures describe strategic readiness (human/information/organization capital), not generic training or morale unless those are causal drivers.
- [ ] Strategy-map links are labeled as falsifiable, time-lagged hypotheses, distinguished from logical/definitional relationships.
- [ ] Initiatives are linked to objectives, funded (or marked unfunded/blocked), and are not just a project dump.
- [ ] The scorecard connects to operating plans and budgets, not just to a dashboard.
- [ ] Cascaded measures are locally influenceable and still tied to parent strategy.
- [ ] The review cadence separates operational from strategy review and produces management decisions.
- [ ] Vision, people, management, and resource execution barriers are checked.
- [ ] A named steward or office stewards the scorecard between reviews.
- [ ] Private or sensitive data is absent from examples and eval artifacts.

## Verification

When applying this skill:

1. Read or ask for the strategy source before choosing measures, classify it as stated/provisional/inferred, and capture a destination statement.
2. Confirm whether the organization is business, public-sector, nonprofit, product, program, transformation, or ESG/stakeholder oriented, then adapt perspective labels if needed and, for nonprofit/public-sector, invert the hierarchy so mission/beneficiary outcomes are the apex and financial/stewardship is the enabling base; decide whether sustainability/ESG is embedded or a fifth perspective.
3. Trace every metric back to a strategic objective.
4. Trace every strategic objective to a perspective and a strategy-map link, and mark each link as a time-lagged hypothesis to test (separating logical from causal relationships).
5. Check that each measure has definition, baseline, target, owner, cadence, and a data source with recorded provenance; flag AI/software-generated inputs that lack human-owner approval.
6. Check that each initiative has an expected mechanism for moving an objective and a credible, protected resource path.
7. Confirm the scorecard connects to budgets/operating plans and to a strategy-review meeting that can change the strategy, with a named steward.
8. Check that learning/growth measures capture human, information, or organization-capital readiness rather than generic activity.
9. Check that AI-generated or software-retrieved evidence is treated as evidence to verify, not source-of-truth targets.
10. Verify boundaries: use `playing-to-win` for strategy formulation, `okrs` for period goal-setting (compose, don't fight), `performance-budgets` for technical thresholds, `bcg-matrix` for portfolio allocation, `swot-tows` for factor inventory, `expected-value` for probability-weighted decisions, and `value-chain-analysis` for activity-level value and cost decomposition.
11. State uncertainty and missing data rather than inventing targets or baselines.

## Do NOT Use When

| Use instead | When |
| --- | --- |
| `playing-to-win` | The user needs to choose the actual strategy: winning aspiration, where to play, how to win, capabilities, and management systems. |
| `okrs` | The user only needs quarterly or period goals with Objectives and Key Results — including generating the 90-day OKR artifact from a scorecard input. (The scorecard can sit above OKRs as the strategy map they ladder up to, but the quarterly-goal authoring itself is `okrs`.) |
| `performance-budgets` | The user needs technical thresholds such as latency, uptime, bundle size, or error budgets. |
| `bcg-matrix` | The user needs portfolio allocation by market growth and relative market share. |
| `swot-tows` | The user needs a strengths, weaknesses, opportunities, threats inventory and TOWS options. |
| `expected-value` | The user has probabilities and payoffs and needs a probability-weighted comparison. |
| `value-chain-analysis` | The user needs to decompose activities, costs, linkages, and differentiation/cost drivers. |
| `mckinsey-7s` | The user needs to diagnose internal organizational alignment rather than manage scorecard objectives, measures, targets, initiatives, and review loops. |
| KPI catalog or analytics inventory | The user only wants a list of available metrics without strategy translation. |
| Dashboard or AI connector setup | The user primarily needs tool configuration, data integration, chart building, or automation without Balanced Scorecard method design. |

Keep `performance-budgets` as a related technical boundary, not a hard suppression edge, because it lives in a different subject area and the router should first treat it as technical quality-governance work.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `reasoning-strategy`
- Public: `true`
- Domain: `foundations/strategy-execution`
- Scope: Balanced Scorecard strategy-execution work: translate an already-stated mission, vision, strategy, or strategic theme into a destination statement, a strategy map, and a balanced performance-management system across financial/stewardship, customer/stakeholder, internal-process, and learning/growth or organizational-capacity perspectives; define strategic objectives, causal hypotheses (treated with time-lag discipline and causality humility), measures/KPIs, baselines, targets, strategic initiatives, resources/budgets, owners, cadence, and review loops; place the scorecard inside the closed-loop strategy-execution system (develop, translate, align, plan operations, monitor and learn, test and adapt) and govern it over time with a named steward or Office of Strategy Management; adapt perspectives for nonprofit, public-sector, product, transformation, sustainability/ESG, or mission contexts, inverting the hierarchy so mission/stakeholder outcomes sit above financial stewardship where appropriate; compose with OKRs for short-cycle execution without competing; use AI/software/reporting tools without letting them replace strategy judgment; cascade without copy-pasting; and use performance gaps to learn and adjust. Excludes upstream strategy formulation as the primary task, OKR-only period goal-setting, technical performance budgets, portfolio allocation, SWOT/TOWS factor inventory, and probability-weighted valuation.

**When to use**
- Use a Balanced Scorecard to translate this strategy into objectives, measures, targets, initiatives, owners, and a review cadence.
- Review this strategy map and scorecard. Are the perspectives balanced and are the KPIs tied to strategic objectives?
- Create a nonprofit Balanced Scorecard that includes stakeholder outcomes, internal process, organizational capacity, and stewardship measures.
- We have too many KPIs. Use the Balanced Scorecard to choose the few strategic measures that matter.
- Turn this transformation strategy into a strategy map, lead and lag measures, and initiatives we can track monthly.
- Write a destination statement and Balanced Scorecard for this strategy so our targets and cascades have a clear future-state anchor.
- Cascade this organization scorecard to a product team without making them copy every corporate metric.
- Add our ESG and sustainability commitments to the Balanced Scorecard without turning them into a disconnected reporting annex.
- An AI tool generated this scorecard. Check whether the objectives, measures, sources, targets, and initiatives are actually strategy-linked.
- Triggers: `balanced-scorecard`, `balanced scorecard`, `strategy map`, `four perspectives`, `scorecard perspectives`, `organization scorecard`, `team scorecard`, `corporate scorecard`, `cascade organization scorecard`, `cascade scorecard to team`, `cascading scorecards`, `strategic objectives measures targets initiatives`, `balanced scorecard destination statement`, `office of strategy management`, `sustainability balanced scorecard`

**Not for**
- Choose our winning aspiration, where to play, and how to win.
- Write quarterly OKRs with qualitative objectives and measurable key results.
- Generate our Q3 OKRs based on this Balanced Scorecard strategy map.
- Set latency, uptime, bundle-size, and error-rate thresholds for a web service.
- Plot product lines by market growth and relative market share.
- List strengths, weaknesses, opportunities, and threats and create TOWS options.
- Compare three options by expected cash flow and probability.
- Decompose our delivery activities and their costs to find differentiation and cost drivers.
- Owned by `playing-to-win`: translating chosen strategy into objectives, measures, targets, initiatives, and review cadence
- Owned by `okrs`: an integrated strategic performance-management system across perspectives
- Owned by `bcg-matrix`: strategy execution metrics and learning
- Owned by `swot-tows`: objective-measure-target-initiative translation
- Owned by `expected-value`: performance management and strategic learning
- Owned by `value-chain-analysis`: cross-perspective performance management

**Related skills**
- Verify with: `methodology`, `evaluation`, `epistemic-grounding`
- Related: `okrs`, `playing-to-win`, `performance-budgets`, `value-chain-analysis`, `swot-tows`, `bcg-matrix`, `expected-value`, `mckinsey-7s`, `scenario-planning`, `three-horizons`, `evaluation`, `methodology`, `epistemic-grounding`

**Concept**
- Mental model: A Balanced Scorecard is a strategy-to-learning system. The primitives are a mission or strategy, a destination statement, perspectives, strategic objectives, a strategy map, measures, baselines, targets, initiatives, resources/budgets, owners, a named steward, cadence, evidence sources, and review decisions. Perspectives prevent strategy execution from collapsing into short-term financial results or disconnected ESG/KPI reporting. Objectives state what must change, measures show whether it is changing, targets define the desired level and date, initiatives name the work that should move the measures, strategic readiness names the human/information/organization capital needed for future performance, and strategy-map arrows are falsifiable, time-lagged hypotheses to test rather than proof. The scorecard is one stage of a closed loop that runs from developing strategy, through translating it and aligning the organization, planning operations and budgets, to monitoring, learning, testing, and adapting the strategy itself; review cadence turns gaps into learning rather than dashboard theatre, and many organizations pair the multi-year scorecard with OKRs as a short-cycle execution layer.
- Purpose: This skill prevents agents from producing KPI dumps, finance-only dashboards, OKR lists, or AI-generated reporting packs when the user needs an integrated strategy-execution management system. It forces each measure to trace back to a strategic objective, each objective to fit a perspective and a cause-effect story, each initiative and budget to support the objective it claims to move, and each gap to produce a decision, initiative change, or strategy-learning question.
- Boundary: Balanced Scorecard is for translating strategy into a balanced set of objectives, measures, targets, initiatives, owners, and review loops. It can clarify or expose gaps in a strategy, but it is not the primary upstream act of choosing the strategy, not OKR-only quarterly goal-setting, not technical performance-budget definition, not portfolio allocation, not SWOT/TOWS factor inventory, not value-chain activity decomposition, not expected-value decision math, and not a replacement for human strategy ownership or data governance.
- Analogy: A Balanced Scorecard is like an instrument panel for a strategy: it tracks speed, fuel, engine health, route progress, and warning lights together so the driver can steer, not just admire one gauge.
- Common misconception: The common mistake is treating a Balanced Scorecard as any dashboard with four boxes, or as an outdated rival to OKRs. A useful scorecard starts from strategy, names objectives, links them through a strategy map whose arrows are tested hypotheses, chooses a few meaningful measures with targets and owners, names a steward, and uses review cycles to adapt; it can sit above OKRs as the strategy map they ladder up to rather than competing with them.

**Grounding**
- Mode: `universal`
- Truth sources: `https://hbr.org/2005/07/the-balanced-scorecard-measures-that-drive-performance`, `https://hbr.org/2007/07/using-the-balanced-scorecard-as-a-strategic-management-system`, `https://hbr.org/2005/10/the-office-of-strategy-management`, `https://hbr.org/2021/02/reimagining-the-balanced-scorecard-for-the-esg-era`, `https://hbr.org/2008/08/strategy-execution-needs-a-sys`, `https://balancedscorecard.org/bsc-basics-overview/`, `https://balancedscorecard.org/about/nine-steps/`, `https://www.bain.com/insights/management-tools-balanced-scorecard/`, `https://www.hbs.edu/ris/Publication%20Files/10-074_0bf3c151-f82b-4592-b885-cdde7f5d97a6.pdf`, `https://en.wikipedia.org/wiki/Third-generation_balanced_scorecard`, `https://doi.org/10.1006/mare.1999.0121`, `https://doi.org/10.1108/17410400410561231`, `skills/reasoning-strategy/balanced-scorecard/references/balanced-scorecard-sources.md`, `skills/reasoning-strategy/balanced-scorecard/references/upstream-displacement-2026-06-12.md`

**Keywords**
- `balanced scorecard`, `strategy map`, `performance management`, `strategic objectives`, `four perspectives`, `cascading scorecards`, `lead and lag measures`, `strategy review cadence`, `destination statement`, `strategic readiness`

<!-- skill-graph-context:end -->
