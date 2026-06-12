---
name: balanced-scorecard
description: "Use when building, reviewing, or applying a Balanced Scorecard for strategy execution and performance management: strategy map, perspectives, strategic objectives, measures/KPIs, targets, initiatives, owners, review cadence, cascading, and learning from performance gaps. Covers financial/stewardship, customer/stakeholder, internal process, and learning/growth or organizational-capacity perspectives, with adaptation for business, nonprofit, public-sector, product, and transformation contexts. Do NOT use for upstream strategy formulation alone (use playing-to-win), quarterly goal-setting alone (use okrs), technical service thresholds (use performance-budgets), portfolio allocation (use bcg-matrix), generic internal/external factor inventory (use swot-tows), probability-weighted option valuation (use expected-value), or activity-level value/cost decomposition (use value-chain-analysis). Do NOT use for Choose our winning aspiration, where to play, and how to win."
license: MIT
compatibility: "Markdown, strategy maps, operating plans, KPI catalogs, performance reviews, nonprofit/public-sector scorecards, transformation scorecards"
allowed-tools: Read Grep WebSearch WebFetch
metadata:
  relations: "{\"related\":[\"okrs\",\"playing-to-win\",\"performance-budgets\",\"value-chain-analysis\",\"swot-tows\",\"bcg-matrix\",\"expected-value\",\"mckinsey-7s\",\"evaluation\",\"methodology\",\"epistemic-grounding\"],\"suppresses\":[{\"skill\":\"playing-to-win\",\"reason\":\"balanced-scorecard owns translating chosen strategy into objectives, measures, targets, initiatives, and review cadence; playing-to-win owns the upstream integrated strategy choices\"},{\"skill\":\"okrs\",\"reason\":\"balanced-scorecard owns an integrated strategic performance-management system across perspectives; okrs owns period goal-setting with Objectives and Key Results\"},{\"skill\":\"bcg-matrix\",\"reason\":\"balanced-scorecard owns strategy execution metrics and learning; bcg-matrix owns portfolio allocation by market growth and relative market share\"},{\"skill\":\"swot-tows\",\"reason\":\"balanced-scorecard owns objective-measure-target-initiative translation; swot-tows owns internal/external factor inventory and option generation\"},{\"skill\":\"expected-value\",\"reason\":\"balanced-scorecard owns performance management and strategic learning; expected-value owns probability-weighted option comparison\"},{\"skill\":\"value-chain-analysis\",\"reason\":\"balanced-scorecard owns cross-perspective performance management; value-chain-analysis owns activity-level value and cost decomposition\"}],\"verify_with\":[\"methodology\",\"evaluation\",\"epistemic-grounding\"]}"
  subject: reasoning-strategy
  scope: "Balanced Scorecard strategy-execution work: translate an already-stated mission, vision, strategy, or strategic theme into a strategy map and a balanced performance-management system across financial/stewardship, customer/stakeholder, internal-process, and learning/growth or organizational-capacity perspectives; define strategic objectives, causal hypotheses, measures/KPIs, baselines, targets, strategic initiatives, owners, cadence, and review loops; adapt perspectives for nonprofit, public-sector, product, transformation, or mission contexts; cascade without copy-pasting; and use performance gaps to learn and adjust. Excludes upstream strategy formulation as the primary task, OKR-only period goal-setting, technical performance budgets, portfolio allocation, SWOT/TOWS factor inventory, and probability-weighted valuation."
  public: "true"
  taxonomy_domain: foundations/strategy-execution
  stability: stable
  keywords: "[\"balanced scorecard\",\"strategy map\",\"performance management\",\"strategic objectives\",\"four perspectives\",\"KPIs targets initiatives\",\"organization scorecard\",\"cascading scorecards\",\"lead and lag measures\",\"strategy review cadence\"]"
  triggers: "[\"balanced-scorecard\",\"balanced scorecard\",\"strategy map\",\"four perspectives\",\"scorecard perspectives\",\"organization scorecard\",\"team scorecard\",\"corporate scorecard\",\"cascade organization scorecard\",\"cascade scorecard to team\",\"cascading scorecards\",\"strategic objectives measures targets initiatives\"]"
  examples: "[\"Use a Balanced Scorecard to translate this strategy into objectives, measures, targets, initiatives, owners, and a review cadence.\",\"Review this strategy map and scorecard. Are the perspectives balanced and are the KPIs tied to strategic objectives?\",\"Create a nonprofit Balanced Scorecard that includes stakeholder outcomes, internal process, organizational capacity, and stewardship measures.\",\"We have too many KPIs. Use the Balanced Scorecard to choose the few strategic measures that matter.\",\"Turn this transformation strategy into a strategy map, lead and lag measures, and initiatives we can track monthly.\",\"Cascade this organization scorecard to a product team without making them copy every corporate metric.\"]"
  anti_examples: "[\"Choose our winning aspiration, where to play, and how to win.\",\"Write quarterly OKRs with qualitative objectives and measurable key results.\",\"Set latency, uptime, bundle-size, and error-rate thresholds for a web service.\",\"Plot product lines by market growth and relative market share.\",\"List strengths, weaknesses, opportunities, and threats and create TOWS options.\",\"Compare three options by expected cash flow and probability.\",\"Decompose our delivery activities and their costs to find differentiation and cost drivers.\"]"
  grounding: "{\"subject_matter\":\"Balanced Scorecard as a portable strategy-execution and performance-management framework\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://hbr.org/2005/07/the-balanced-scorecard-measures-that-drive-performance\",\"https://hbr.org/2007/07/using-the-balanced-scorecard-as-a-strategic-management-system\",\"https://balancedscorecard.org/bsc-basics-overview/\",\"https://www.bain.com/insights/management-tools-balanced-scorecard/\",\"skills/reasoning-strategy/balanced-scorecard/references/balanced-scorecard-sources.md\",\"skills/reasoning-strategy/balanced-scorecard/references/upstream-displacement-2026-06-12.md\"],\"failure_modes\":[\"scorecard_reduced_to_kpi_dump\",\"financial_only_dashboard_mislabeled_as_balanced_scorecard\",\"perspectives_copied_without_strategy_fit\",\"objectives_not_linked_by_strategy_map_or_causal_hypothesis\",\"measures_without_baselines_targets_owners_or_cadence\",\"initiatives_missing_or_unlinked_to_objectives\",\"lag_measures_only_no_leading_drivers\",\"cascading_by_copying_parent_metrics_instead_of_translating_strategy\",\"scorecard_used_as_employee_compensation_or_surveillance_system\",\"nonprofit_or_public_sector_forced_into_shareholder_financial_logic\",\"scorecard_treated_as_strategy_formulation_not_execution_learning\",\"private_or_sensitive_business_facts_leaked_into_examples\",\"ai_generated_metrics_treated_as_source_of_truth\"],\"evidence_priority\":\"general_knowledge_first\"}"
  mental_model: "A Balanced Scorecard is a strategy-to-learning system. The primitives are a mission or strategy, perspectives, strategic objectives, a strategy map, measures, baselines, targets, initiatives, owners, cadence, and review decisions. Perspectives prevent strategy execution from collapsing into only short-term financial results. Objectives state what must change, measures show whether it is changing, targets define the desired level and date, initiatives name the work that should move the measures, and review cadence turns gaps into learning rather than dashboard theatre."
  purpose: "This skill prevents agents from producing KPI dumps, finance-only dashboards, or OKR lists when the user needs an integrated strategy-execution management system. It forces each measure to trace back to a strategic objective, each objective to fit a perspective and a cause-effect story, and each gap to produce a decision, initiative change, or strategy-learning question."
  concept_boundary: "Balanced Scorecard is for translating strategy into a balanced set of objectives, measures, targets, initiatives, owners, and review loops. It is not the upstream act of choosing the strategy, not OKR-only quarterly goal-setting, not technical performance-budget definition, not portfolio allocation, not SWOT/TOWS factor inventory, not value-chain activity decomposition, and not expected-value decision math."
  analogy: "A Balanced Scorecard is like an instrument panel for a strategy: it tracks speed, fuel, engine health, route progress, and warning lights together so the driver can steer, not just admire one gauge."
  misconception: "The common mistake is treating a Balanced Scorecard as any dashboard with four boxes. A useful scorecard starts from strategy, names objectives, links them through a strategy map, chooses a few meaningful measures with targets and owners, and uses review cycles to adapt."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/reasoning-strategy/balanced-scorecard/SKILL.md
  skill_graph_export_description_projection: anti_examples
  skill_graph_export_description_projection_truncated: "true"
---

## Concept of the skill

**What it is:** The Balanced Scorecard is a strategy-execution and performance-management framework that translates strategy into objectives, measures, targets, initiatives, owners, and review learning across several perspectives.

**Mental model:** Start with strategy, not metrics. Arrange the work through perspectives, define strategic objectives, link them in a strategy map, choose a small set of measures for each objective, set targets and initiatives, assign owners, and review gaps to learn whether execution or strategy needs to change.

**Why it exists:** Agents often produce dashboards that count what is easy, goals that are not measurable, or financial reports that ignore future capability. This skill keeps short-term results, customer or stakeholder outcomes, internal process performance, and long-term capacity visible together.

**What it is NOT:** It is not upstream strategy formulation, OKR-only goal-setting, a KPI catalog, a technical performance budget, portfolio allocation, SWOT/TOWS, value-chain analysis, expected-value math, or a compensation system.

**Adjacent concepts:** strategy execution, strategic objectives, strategy maps, KPIs, lead and lag indicators, targets, initiatives, cascading, management review, organizational capacity, stewardship, stakeholder outcomes, OKRs, dashboards.

**One-line analogy:** A Balanced Scorecard is an instrument panel for a strategy, showing several gauges needed to steer instead of one financial speedometer.

**Common misconception:** A Balanced Scorecard is not a dashboard with four unlabeled boxes. The scorecard is useful only when the measures are tied to strategic objectives, targets, initiatives, owners, and a learning cadence.

# Balanced Scorecard

## Domain Context

Use the Balanced Scorecard when the user already has a strategy, mission, vision, strategic theme, transformation agenda, or operating model and needs to translate it into a management system. The method is strongest when leaders must track both current performance and the future capabilities that create tomorrow's performance.

Use public, aggregate, or synthetic examples only. Do not include personal data, customer records, payment data, employee records, private forecasts, secrets, confidential deal details, or sensitive business facts in scorecard examples or evals.

The output is not a prettier dashboard. It is a strategy execution contract:

```text
Strategic objective -> measure -> baseline -> target -> initiative -> owner -> cadence -> decision rule
```

If a metric cannot be traced to a strategic objective, or if a strategic objective has no owner, target, initiative, or review use, the scorecard is not ready.

## Coverage

This skill teaches agents to:

1. Decide whether a Balanced Scorecard is the right tool for the user's request.
2. Start from strategy, mission, vision, strategic themes, stakeholders, and decision cadence before choosing metrics.
3. Use perspectives to balance short-term financial or stewardship outcomes with customer/stakeholder outcomes, internal process performance, and learning/growth or organizational capacity.
4. Adapt perspective names for nonprofit, public-sector, product, transformation, and mission-driven contexts without losing the balancing function.
5. Define strategic objectives in each perspective.
6. Build a strategy map that makes cause-effect hypotheses explicit.
7. Select a small set of lead and lag measures tied to objectives.
8. Add baselines, targets, owners, data sources, cadence, and interpretation rules.
9. Link strategic initiatives and budgets to the objectives they are meant to move.
10. Cascade scorecards by translating strategy for each level, not by copying every parent metric.
11. Use review cycles to learn from gaps and decide whether to adjust execution, targets, initiatives, or strategy assumptions.
12. Route adjacent work to the right framework instead of stretching the Balanced Scorecard beyond its mechanism.

## Philosophy of the skill

Balanced Scorecard exists because measurement changes behavior. If leaders track only financial results, teams optimize for what has already happened and may underinvest in customers, processes, learning, culture, systems, and capabilities. If leaders track everything, attention disappears into metric noise. The scorecard forces a small set of strategy-linked measures that balance results with drivers.

The method is not "more metrics." The method is disciplined translation. A strategic statement becomes objectives; objectives become measures; measures get baselines and targets; targets get initiatives and owners; review meetings use gaps to learn. The scorecard should make the strategy visible enough that people can act on it and revise it when evidence contradicts the causal story.

The four classic perspectives are a starting architecture, not a prison. For a public agency, financial may become stewardship; for a nonprofit, customer may become stakeholder or beneficiary; for a product group, internal process may include delivery, quality, and adoption loops; for a transformation program, organizational capacity may include skills, platforms, and operating rhythm. Keep the balancing logic even when the labels change.

## 1. Decide Whether Balanced Scorecard Fits

Use a Balanced Scorecard when the user needs strategy execution, performance management, a strategy map, cross-perspective measures, target setting, initiative alignment, cascading, or review cadence.

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

## 2. Frame The Strategy Execution Question

Begin with the minimum context required to make the scorecard strategic.

```text
Organization or unit:
Mission / vision / strategic theme:
Strategy source:
Decision owner:
Planning horizon:
Review cadence:
Stakeholders:
What must improve:
What must not be sacrificed:
Existing measures:
Known data sources:
Constraints:
```

If the user provides only a metric list, reverse-engineer the implied objectives and flag uncertainty:

```text
Inferred objective:
Metric currently used:
Why this metric may matter:
What it misses:
Better measure or companion measure:
Evidence needed:
```

## 3. Choose Perspectives

Use the classic four perspectives when they fit. Rename them when the organization type makes another label clearer.

| Classic perspective | Core question | Business examples | Public/nonprofit/product adaptation |
| --- | --- | --- | --- |
| Financial | What financial or stewardship result must the strategy deliver? | revenue growth, margin, cash flow, return on capital | stewardship, grant sustainability, cost per outcome, budget resilience |
| Customer | How must customers or stakeholders experience value? | retention, satisfaction, share of wallet, customer outcome | beneficiary outcomes, citizen trust, access, equity, partner value |
| Internal process | What processes must perform well to deliver the strategy? | quality, cycle time, delivery reliability, compliance | service delivery, policy execution, case throughput, operational resilience |
| Learning and growth / organizational capacity | What capabilities enable future performance? | skills, culture, systems, data, innovation, leadership | workforce capability, technology platform, institutional learning, volunteer capacity |

Do not force every scorecard into exactly these labels if another set preserves the balancing mechanism better. Do keep at least one result perspective and at least one driver/capability perspective, otherwise the scorecard collapses into a dashboard.

## 4. Define Strategic Objectives

Strategic objectives state what must change. They are not measures, initiatives, or slogans.

Strong objectives:

- connect to the strategy,
- describe an outcome or capability state,
- are specific enough to measure,
- fit one perspective,
- can be owned and reviewed,
- create trade-offs against lower-priority work.

Weak objectives:

- "Improve everything"
- "Track customer satisfaction"
- "Launch the project"
- "Be innovative"
- "Increase metrics"

Rewrite weak objectives:

| Weak item | Stronger strategic objective |
| --- | --- |
| Track NPS | Increase customer confidence in the onboarding experience |
| Launch data platform | Make trustworthy customer and product data available for weekly decisions |
| Reduce cost | Lower unit cost without reducing service reliability |
| Train employees | Build the skills needed to operate the new service model |
| Improve sustainability | Reduce operating footprint while preserving delivery quality |

Keep the objective set small enough to manage. A useful first scorecard often has two to four objectives per perspective, not dozens.

## 5. Build The Strategy Map

A strategy map makes the cause-effect story explicit. It should answer:

```text
If we build these capabilities,
then these internal processes improve,
then customers/stakeholders experience this value,
then these financial/stewardship results follow.
```

Use arrows as hypotheses, not decoration. Every link should name the assumed mechanism:

| Link | Mechanism to test |
| --- | --- |
| Training -> service reliability | Skill gaps currently cause repeat errors or slow resolution. |
| Data quality -> product adoption | Better usage insight lets teams remove the highest-friction steps. |
| Process cycle time -> customer retention | Faster completion reduces abandonment and support escalation. |
| Stakeholder trust -> funding resilience | Demonstrated outcomes improve renewal, donation, or budget support. |

If you cannot explain a link, either remove it or mark it as an assumption that needs evidence.

## 6. Choose Measures

For each objective, choose one or two measures that show progress. Prefer paired lead and lag measures when possible.

| Measure type | Use for | Example |
| --- | --- | --- |
| Lag measure | Outcome after work has had an effect | retention, margin, incident rate, program completion |
| Lead measure | Driver that should move the outcome | activation milestone, defect escape rate, training completion with demonstrated competence |
| Quality guardrail | What must not be sacrificed while improving another measure | service reliability, customer trust, compliance, equity, safety |
| Capacity measure | Future capability needed for the strategy | platform adoption, skill coverage, data freshness, process maturity |

Every measure needs:

```text
Objective:
Measure:
Definition / formula:
Baseline:
Target:
Time horizon:
Owner:
Data source:
Cadence:
Interpretation rule:
Linked initiative:
Known failure mode:
```

Avoid vanity metrics, pure activity counts, and measures chosen only because they are easy to obtain. If a metric cannot change a decision, it is not a scorecard metric.

## 7. Set Targets And Initiatives

Targets define the desired level of performance by a date. Initiatives name the work expected to move objectives and measures.

Good targets:

- have a baseline,
- have a target value or directional threshold,
- have a date,
- are ambitious but not fantasy,
- preserve guardrails,
- explain what decision follows if missed or exceeded.

Good initiatives:

- name the strategic objective they support,
- have an owner,
- have resources or budget,
- have milestones,
- have expected measure impact,
- are few enough to manage.

Do not attach every project to the scorecard. A scorecard initiative should be strategic, not business-as-usual task tracking.

## 8. Cascade Without Copying

Cascading means translating the strategy for lower levels, not cloning the parent scorecard.

| Cascade mistake | Repair |
| --- | --- |
| Every team inherits every corporate metric | Translate only the objectives the team can materially influence. |
| Local teams optimize their own measure against enterprise outcomes | Add shared guardrails and cross-team dependencies. |
| Measures become more specific but lose the strategy | Keep the parent objective visible and state the local contribution. |
| Accountability is vague | Assign owners for objectives, measures, and initiatives. |
| Individual scorecards become surveillance | Keep scorecards focused on strategy execution, not personal monitoring. |

Use this cascade template:

```text
Parent objective:
Local contribution:
Local objective:
Measure:
Target:
Owner:
Initiative:
Dependency:
Escalation trigger:
```

## 9. Review And Learn

The scorecard matters only if it changes management behavior. A useful review cadence asks:

1. Which measures are on track, off track, or ambiguous?
2. Which objective is not moving despite initiative activity?
3. Which initiative appears ineffective?
4. Which lead measure moved but lag measure did not?
5. Which causal link in the strategy map may be wrong?
6. Which target was unrealistic or sandbagged?
7. Which data source is untrusted?
8. What decision changes now: continue, adjust, stop, fund, escalate, or revise strategy?

Record decisions, not just status colors.

```text
Review date:
Objective:
Measure status:
Gap:
Root cause hypothesis:
Decision:
Owner:
Next evidence:
Review date:
```

## Output Format

For a full Balanced Scorecard, produce:

```markdown
# Balanced Scorecard

## Strategy Source
- Mission / vision / strategy:
- Unit:
- Horizon:
- Review cadence:
- Stakeholders:

## Strategy Map
| Perspective | Strategic objective | Cause-effect link | Assumption to test |
| --- | --- | --- | --- |

## Scorecard
| Perspective | Objective | Measure | Baseline | Target | Owner | Cadence | Initiative | Decision rule |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |

## Initiatives
| Initiative | Supports objective | Expected measure impact | Owner | Milestone | Risk |
| --- | --- | --- | --- | --- | --- |

## Review Plan
| Review question | Evidence | Decision options |
| --- | --- | --- |

## Gaps And Assumptions
- Missing strategy evidence:
- Missing data:
- Risk of metric gaming:
- Perspective imbalance:
```

## Quality Checklist

Before finalizing, verify:

- [ ] The strategy source is named or a provisional inference is labeled.
- [ ] Perspectives are balanced and adapted to the organization type.
- [ ] Each perspective has strategic objectives, not just metrics.
- [ ] Each objective has at least one measure and no more than a small practical set.
- [ ] Measures include baselines, targets, owners, data sources, cadence, and decision rules.
- [ ] Lead and lag measures are both considered.
- [ ] Initiatives are linked to objectives and are not just a project dump.
- [ ] The strategy map names plausible cause-effect links.
- [ ] Cascaded measures are locally influenceable and still tied to parent strategy.
- [ ] The review cadence produces management decisions.
- [ ] Private or sensitive data is absent from examples and eval artifacts.

## Verification

When applying this skill:

1. Read or ask for the strategy source before choosing measures.
2. Confirm whether the organization is business, public-sector, nonprofit, product, program, or transformation oriented, then adapt perspective labels if needed.
3. Trace every metric back to a strategic objective.
4. Trace every strategic objective to a perspective and a strategy-map link.
5. Check that each measure has baseline, target, owner, cadence, and data source.
6. Check that each initiative has an expected mechanism for moving an objective.
7. Verify boundaries: use `playing-to-win` for strategy formulation, `okrs` for period goal-setting, `performance-budgets` for technical thresholds, `bcg-matrix` for portfolio allocation, `swot-tows` for factor inventory, `expected-value` for probability-weighted decisions, and `value-chain-analysis` for activity-level value and cost decomposition.
8. State uncertainty and missing data rather than inventing targets or baselines.

## Do NOT Use When

| Use instead | When |
| --- | --- |
| `playing-to-win` | The user needs to choose the actual strategy: winning aspiration, where to play, how to win, capabilities, and management systems. |
| `okrs` | The user only needs quarterly or period goals with Objectives and Key Results. |
| `performance-budgets` | The user needs technical thresholds such as latency, uptime, bundle size, or error budgets. |
| `bcg-matrix` | The user needs portfolio allocation by market growth and relative market share. |
| `swot-tows` | The user needs a strengths, weaknesses, opportunities, threats inventory and TOWS options. |
| `expected-value` | The user has probabilities and payoffs and needs a probability-weighted comparison. |
| `value-chain-analysis` | The user needs to decompose activities, costs, linkages, and differentiation/cost drivers. |
| `mckinsey-7s` | The user needs to diagnose internal organizational alignment rather than manage scorecard objectives, measures, targets, initiatives, and review loops. |
| KPI catalog or analytics inventory | The user only wants a list of available metrics without strategy translation. |

Keep `performance-budgets` as a related technical boundary, not a hard suppression edge, because it lives in a different subject area and the router should first treat it as technical quality-governance work.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `reasoning-strategy`
- Public: `true`
- Domain: `foundations/strategy-execution`
- Scope: Balanced Scorecard strategy-execution work: translate an already-stated mission, vision, strategy, or strategic theme into a strategy map and a balanced performance-management system across financial/stewardship, customer/stakeholder, internal-process, and learning/growth or organizational-capacity perspectives; define strategic objectives, causal hypotheses, measures/KPIs, baselines, targets, strategic initiatives, owners, cadence, and review loops; adapt perspectives for nonprofit, public-sector, product, transformation, or mission contexts; cascade without copy-pasting; and use performance gaps to learn and adjust. Excludes upstream strategy formulation as the primary task, OKR-only period goal-setting, technical performance budgets, portfolio allocation, SWOT/TOWS factor inventory, and probability-weighted valuation.

**When to use**
- Use a Balanced Scorecard to translate this strategy into objectives, measures, targets, initiatives, owners, and a review cadence.
- Review this strategy map and scorecard. Are the perspectives balanced and are the KPIs tied to strategic objectives?
- Create a nonprofit Balanced Scorecard that includes stakeholder outcomes, internal process, organizational capacity, and stewardship measures.
- We have too many KPIs. Use the Balanced Scorecard to choose the few strategic measures that matter.
- Turn this transformation strategy into a strategy map, lead and lag measures, and initiatives we can track monthly.
- Cascade this organization scorecard to a product team without making them copy every corporate metric.
- Triggers: `balanced-scorecard`, `balanced scorecard`, `strategy map`, `four perspectives`, `scorecard perspectives`, `organization scorecard`, `team scorecard`, `corporate scorecard`, `cascade organization scorecard`, `cascade scorecard to team`, `cascading scorecards`, `strategic objectives measures targets initiatives`

**Not for**
- Choose our winning aspiration, where to play, and how to win.
- Write quarterly OKRs with qualitative objectives and measurable key results.
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
- Related: `okrs`, `playing-to-win`, `performance-budgets`, `value-chain-analysis`, `swot-tows`, `bcg-matrix`, `expected-value`, `mckinsey-7s`, `evaluation`, `methodology`, `epistemic-grounding`

**Concept**
- Mental model: A Balanced Scorecard is a strategy-to-learning system. The primitives are a mission or strategy, perspectives, strategic objectives, a strategy map, measures, baselines, targets, initiatives, owners, cadence, and review decisions. Perspectives prevent strategy execution from collapsing into only short-term financial results. Objectives state what must change, measures show whether it is changing, targets define the desired level and date, initiatives name the work that should move the measures, and review cadence turns gaps into learning rather than dashboard theatre.
- Purpose: This skill prevents agents from producing KPI dumps, finance-only dashboards, or OKR lists when the user needs an integrated strategy-execution management system. It forces each measure to trace back to a strategic objective, each objective to fit a perspective and a cause-effect story, and each gap to produce a decision, initiative change, or strategy-learning question.
- Boundary: Balanced Scorecard is for translating strategy into a balanced set of objectives, measures, targets, initiatives, owners, and review loops. It is not the upstream act of choosing the strategy, not OKR-only quarterly goal-setting, not technical performance-budget definition, not portfolio allocation, not SWOT/TOWS factor inventory, not value-chain activity decomposition, and not expected-value decision math.
- Analogy: A Balanced Scorecard is like an instrument panel for a strategy: it tracks speed, fuel, engine health, route progress, and warning lights together so the driver can steer, not just admire one gauge.
- Common misconception: The common mistake is treating a Balanced Scorecard as any dashboard with four boxes. A useful scorecard starts from strategy, names objectives, links them through a strategy map, chooses a few meaningful measures with targets and owners, and uses review cycles to adapt.

**Grounding**
- Mode: `universal`
- Truth sources: `https://hbr.org/2005/07/the-balanced-scorecard-measures-that-drive-performance`, `https://hbr.org/2007/07/using-the-balanced-scorecard-as-a-strategic-management-system`, `https://balancedscorecard.org/bsc-basics-overview/`, `https://www.bain.com/insights/management-tools-balanced-scorecard/`, `skills/reasoning-strategy/balanced-scorecard/references/balanced-scorecard-sources.md`, `skills/reasoning-strategy/balanced-scorecard/references/upstream-displacement-2026-06-12.md`

**Keywords**
- `balanced scorecard`, `strategy map`, `performance management`, `strategic objectives`, `four perspectives`, `KPIs targets initiatives`, `organization scorecard`, `cascading scorecards`, `lead and lag measures`, `strategy review cadence`

<!-- skill-graph-context:end -->
