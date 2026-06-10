---
name: mckinsey-7s
description: "Use when diagnosing organizational alignment with the McKinsey 7S framework: shared values, strategy, structure, systems, style, staff, and skills; how the seven elements reinforce or conflict; change-readiness gaps; and implementation risks. Covers internal organization effectiveness, operating-model alignment, transformation diagnostics, post-merger integration checks, and strategy-to-execution gap analysis. Do NOT use for external industry profit-pressure diagnosis (use porters-five-forces), activity-level value and cost mapping (use value-chain-analysis), durable resource advantage testing (use vrio), broad internal/external option generation (use swot-tows), or execution goal-setting alone (use okrs). Do NOT use for Analyze buyer power, supplier power, substitutes, entrants, and rivalry in this industry. Do NOT use for Map the value chain activities that create customer value and drive cost. Do NOT use for Use VRIO to test whether our data, brand, and process are durable advantages."
license: MIT
compatibility: "Markdown, organization-design reviews, transformation diagnostics, operating-model reviews, strategy memos, change-readiness assessments"
allowed-tools: Read Grep WebSearch WebFetch
metadata:
  relations: "{\"related\":[\"playing-to-win\",\"okrs\",\"swot-tows\",\"value-chain-analysis\",\"vrio\",\"porters-five-forces\",\"epistemic-grounding\",\"methodology\"],\"suppresses\":[\"porters-five-forces\",\"okrs\",\"swot-tows\",\"value-chain-analysis\",\"vrio\",\"playing-to-win\"],\"verify_with\":[\"epistemic-grounding\",\"methodology\",\"okrs\"]}"
  subject: reasoning-strategy
  scope: "McKinsey 7S organizational-alignment analysis for teams, business units, organizations, transformations, operating-model changes, post-merger integration, strategy execution, and change-readiness reviews: map shared values, strategy, structure, systems, style, staff, and skills; test how the elements reinforce or conflict; identify alignment gaps; prioritize root-cause interventions; and convert the diagnosis into change actions and monitoring signals. Excludes external industry analysis, activity-level value-chain economics, resource-based durable-advantage testing, broad SWOT/TOWS option generation, OKR goal-setting as the primary task, standalone culture advice, and generic change-management slogans."
  public: "true"
  taxonomy_domain: foundations/strategy
  stability: stable
  keywords: "[\"McKinsey 7S\",\"7S framework\",\"7S alignment\",\"organization alignment\",\"organizational effectiveness\",\"organization design\",\"reorganization\",\"post-merger integration\",\"operating model alignment\",\"strategy execution gap\"]"
  triggers: "[\"mckinsey-7s\",\"7s-framework\",\"seven-s-framework\",\"organization-alignment\"]"
  examples: "[\"Use McKinsey 7S to diagnose why this transformation is stuck after the strategy announcement.\",\"Build a 7S alignment table for our new operating model and show where structure, systems, skills, and shared values conflict.\",\"Review this reorganization proposal with the McKinsey 7S framework before we commit to the structure.\",\"Apply the McKinsey 7S framework to a post-merger integration plan and identify hidden organization-alignment risks.\",\"Use McKinsey 7S to turn these organization-alignment symptoms into a diagnosis before changing reporting lines.\"]"
  anti_examples: "[\"Analyze buyer power, supplier power, substitutes, entrants, and rivalry in this industry.\",\"Map the value chain activities that create customer value and drive cost.\",\"Use VRIO to test whether our data, brand, and process are durable advantages.\",\"Turn strengths, weaknesses, opportunities, and threats into TOWS strategy options.\",\"Write OKRs for this quarter and define measurable key results.\"]"
  grounding: "{\"subject_matter\":\"McKinsey 7S as a portable organizational-alignment and change-readiness framework\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://www.mckinsey.com/capabilities/strategy-and-corporate-finance/our-insights/enduring-ideas-the-7-s-framework\",\"https://www.mckinsey.com/capabilities/people-and-organizational-performance/our-insights/a-new-operating-model-for-a-new-world\",\"https://www.sciencedirect.com/science/article/pii/0007681380900270\",\"skills/skills/reasoning-strategy/mckinsey-7s/references/mckinsey-7s-sources.md\",\"skills/skills/reasoning-strategy/mckinsey-7s/references/upstream-displacement-2026-06-08.md\"],\"failure_modes\":[\"seven_s_reduced_to_org_chart_redesign\",\"shared_values_treated_as_generic_values_statement\",\"elements_listed_without_interdependency_analysis\",\"strategy_execution_gap_blamed_on_people_without_system_evidence\",\"hard_elements_overweighted_while_style_staff_skills_are_ignored\",\"culture_advice_given_without_linking_to_strategy_systems_and_structure\",\"modern_operating_model_refresh_ignored_when_user_asks_for_current_mckinsey_design\",\"private_employee_or_customer_data_used_in_examples_or_evals\"],\"evidence_priority\":\"general_knowledge_first\"}"
  mental_model: "McKinsey 7S is an organization-alignment map. The primitives are an actor, a target strategy or change, seven interdependent elements, a current-state description for each element, a target-state description for each element, element-to-element fit, contradictions, root causes, interventions, owners, and monitoring signals. Shared values sit at the center because they shape the other six elements; strategy, structure, systems, style, staff, and skills must reinforce one another for the organization to execute change. The agent diagnoses the system, not one box."
  purpose: "This skill prevents agents from treating a reorg, strategy rollout, culture program, or transformation as a single-lever problem. It forces the agent to test whether strategy, reporting lines, work systems, leadership style, people model, capabilities, and shared values fit together before recommending action."
  concept_boundary: "McKinsey 7S is for internal organization alignment and change-readiness diagnosis. It is not Porter's Five Forces external industry analysis, Value Chain activity-level economics, VRIO resource/capability durability testing, SWOT/TOWS option generation, OKR goal-setting, standalone culture coaching, or modern operating-model redesign under McKinsey's 2025 Organize to Value system unless the user explicitly asks for the newer McKinsey model."
  analogy: "McKinsey 7S is like tuning a seven-string instrument: changing one string changes the harmony, and a performance problem may come from the relationship among strings rather than from one string alone."
  misconception: "The common mistake is treating 7S as a checklist of seven headings or as an org-chart tool. The framework's point is interdependence: structure alone is not the organization, and a change in one element usually fails unless the other elements are adjusted to support it."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/reasoning-strategy/mckinsey-7s/SKILL.md
  skill_graph_export_description_projection: anti_examples
  skill_graph_export_description_projection_truncated: "true"
---

## Concept of the skill

**What it is:** McKinsey 7S is an organizational-alignment framework for diagnosing whether seven internal elements reinforce one another: shared values, strategy, structure, systems, style, staff, and skills. It is used when a team needs to understand why an organization can or cannot execute a strategy, transformation, merger, reorg, or operating-model change.

**Mental model:** Treat the organization as an interdependent system. Map current and target states for all seven elements, then look for contradictions and reinforcing loops rather than assuming the visible structure is the whole organization.

**Why it exists:** Agents often jump from a strategy gap to one favorite fix: change the org chart, add OKRs, hire people, run training, or change culture. This skill makes the agent inspect the whole organization system before recommending the intervention.

**What it is NOT:** It is not Five Forces, Value Chain, VRIO, SWOT/TOWS, OKRs, Playing to Win, a generic change-management checklist, or a standalone culture framework.

**Adjacent concepts:** organization design, operating model, strategy execution, change readiness, transformation management, post-merger integration, culture, leadership style, capability building, process systems, staff model, shared values.

**One-line analogy:** 7S tunes the organization as a connected instrument, not as seven separate parts.

**Common misconception:** The seven headings are not independent boxes. The framework is about fit among elements; an answer that lists the seven elements but does not test alignment has not applied 7S.

# McKinsey 7S

## Domain Context

Use McKinsey 7S for internal organization-alignment questions: strategy execution, transformations, operating-model changes, post-merger integration, major reorgs, scaling bottlenecks, culture-to-strategy gaps, capability-building needs, and leadership or system friction. Use public, aggregate, or synthetic examples only. Do not include personal data, employee-level facts, customer data, payment data, secrets, confidential deal details, or private business facts in examples or evals.

The framework is strongest when the user asks why a strategy is not becoming execution, why a reorg did not change behavior, why a transformation is blocked, or whether a change plan covers the organization system. It is weaker when the question is about external industry attractiveness, value-chain economics, durable resource advantage, quantified option value, or goal-setting mechanics.

McKinsey's 2025 operating-model work explicitly refreshes the classic 7S framework into a broader "Organize to Value" system. If the user asks for current McKinsey operating-model redesign in a volatile environment, name that newer source and consider using it as the primary frame. If the user specifically asks for 7S, use the classic framework while disclosing that the newer McKinsey model exists for deeper current operating-model design.

## Coverage

This skill teaches agents to:

1. Frame the organization, strategic change, decision, time horizon, and evidence boundary.
2. Map the seven elements: shared values, strategy, structure, systems, style, staff, and skills.
3. Separate current state, target state, evidence, assumptions, and uncertainty for each element.
4. Diagnose fit, contradictions, reinforcing loops, and missing support across elements.
5. Identify whether the root cause is in one element, the interaction between elements, or an unclear target strategy.
6. Convert the diagnosis into interventions, owners, sequencing, and monitoring triggers.
7. Distinguish 7S from adjacent strategy, organization, and execution methods.
8. Keep analysis privacy-safe by using aggregate or synthetic examples and avoiding employee-level details.

## Philosophy of the skill

7S is useful because organizations often treat performance gaps as isolated problems. A strategy does not execute because it was announced. A structure does not work because boxes moved. A culture does not change because values were written down. Capabilities do not improve because training happened once.

The framework asks whether the elements support the same change. A structure may conflict with the strategy. Systems may reward the old behavior. Leaders may model a style that contradicts shared values. Staff may lack capacity, and skills may not match the strategy. The useful output is therefore not a tidy seven-row table. The useful output is a causal alignment diagnosis: which elements conflict, which elements reinforce, and which few interventions would change the system.

## Workflow

### 1. Frame the alignment question

Start by defining the scope and target. Do not begin with the seven headings until the change being tested is clear.

```text
Organization, unit, or team:
Strategic change or performance gap:
Decision this analysis must inform:
Current time horizon:
Target outcome:
Evidence available:
Known constraints:
Privacy boundary:
```

If the user cannot name the target strategy or change, pause and clarify the intended direction. 7S cannot test alignment against a vague aspiration.

### 2. Map the seven elements

Use the seven elements as prompts for evidence, not as a fill-in-the-blanks exercise.

| Element | Diagnostic question | Evidence to request | Common failure |
| --- | --- | --- | --- |
| Shared values | What purpose, beliefs, priorities, or norms actually guide decisions? | decision criteria, stories leaders repeat, trade-offs, rituals, values in action | values statement is copied without evidence of behavior |
| Strategy | What choices define how the organization will win or deliver the target outcome? | strategy memo, priorities, where-to-play/how-to-win choices, resource allocation | strategy is a slogan or list of goals |
| Structure | How are roles, accountabilities, reporting lines, and decision rights arranged? | org chart, RACI, governance, team topology, spans and layers | changing boxes without changing work or decisions |
| Systems | Which processes, measures, tools, routines, incentives, and information flows run the work? | operating cadence, metrics, incentives, workflows, systems of record | old systems keep rewarding old behavior |
| Style | How do leaders and managers actually behave, decide, communicate, and handle conflict? | leadership norms, meeting behavior, escalation patterns, feedback, pace | stated leadership style differs from lived behavior |
| Staff | Who is in the organization, in what roles, with what capacity, incentives, and talent flow? | headcount mix, roles, hiring, retention, workload, incentives | blaming individuals without testing capacity or role design |
| Skills | Which institutional and individual capabilities are needed, present, missing, or declining? | capability map, training, experience, hiring pipeline, performance evidence | training plan is treated as capability proof |

Shared values are not generic culture. They are the operating beliefs and priorities that shape decisions. If they are not visible in trade-offs, incentives, leadership behavior, or systems, mark them as claimed rather than proven.

### 3. Build current-state and target-state rows

For each element, record current and target states separately.

```text
Element:
Current state:
Target state:
Evidence:
Gap:
Confidence:
Dependencies on other elements:
Risk if unchanged:
```

Do not score alignment before this distinction is clear. A system can be internally consistent with the old strategy and misaligned with the new one.

### 4. Diagnose element-to-element fit

The main work is the interaction map. Ask how each element supports or blocks the others.

| Interaction question | What it reveals |
| --- | --- |
| Does the structure make the strategy easier or harder to execute? | Accountability and decision-right fit |
| Do systems reinforce the shared values and desired style? | Incentive and behavior fit |
| Do staff capacity and skills match the new work the strategy requires? | Talent and capability gap |
| Does leadership style match the change type: urgent turnaround, innovation, integration, scale, or reliability? | Style-to-context fit |
| Do metrics, governance, and routines reward the target behavior or preserve the old behavior? | Systems as hidden root cause |
| Are shared values visible in trade-offs, not just in language? | Values credibility |

Name contradictions directly. A useful 7S diagnosis sounds like: "The stated strategy needs cross-functional speed, but structure and systems still optimize local functional efficiency, and leadership style escalates decisions upward."

### 5. Prioritize root causes

Do not recommend one action per element. Find the few constraints that create the most misalignment.

| Pattern | Interpretation | Typical intervention |
| --- | --- | --- |
| Clear strategy, conflicting systems | Execution blocked by metrics, incentives, routines, or tools | Change metrics, governance, incentives, workflows, and decision cadence |
| Clear structure, unclear strategy | Org chart is solving an undefined problem | Revisit strategy choices before reorg work |
| Capability gap with strong motivation | Skills or staff do not match the target work | Capability build, hiring, partners, workload reset, role redesign |
| Values conflict with leadership style | Culture claim lacks behavioral proof | Leadership behavior reset, feedback loops, decision rules, role modeling |
| Staff overloaded by systems debt | People are blamed for a broken operating system | Simplify workflows, remove low-value work, adjust capacity, fix tools |
| Soft elements ignored | Hard-element change will not stick | Add leadership, skills, staff, and shared-values actions to the plan |

Prioritize by decision impact, dependency, reversibility, time to effect, risk, and evidence strength.

### 6. Convert diagnosis into a change plan

End with actions that change the organization system.

```text
Intervention:
7S element(s) addressed:
Contradiction it resolves:
Owner role:
First concrete step:
Metric or signal:
Review date:
Risks:
Evidence still needed:
```

Sequence changes so supporting elements move together. Do not recommend a reorg without naming the systems, style, staff, and skills changes needed for the structure to work.

## Output Template

```text
McKinsey 7S Alignment Review

Scope:
Strategic change or performance gap:
Target outcome:
Evidence boundary:

7S map:
| Element | Current state | Target state | Evidence | Gap | Confidence |

Alignment diagnosis:
1. Reinforcing fit:
2. Contradictions:
3. Hidden root causes:
4. Missing evidence:

Priority interventions:
1. Action:
   Elements addressed:
   Contradiction resolved:
   Owner:
   Metric:
   Next review:

Residual risks:
Downstream method:
```

## Boundary Rules

| User is really asking for | Use | Why |
| --- | --- | --- |
| Industry attractiveness, rivalry, buyer/supplier power, substitutes, or entrants | `porters-five-forces` | The question is external industry structure, not internal organization alignment. |
| Activities that create customer value, cost, margin, and fit | `value-chain-analysis` | Value Chain maps activity economics; 7S maps organization-element alignment. |
| Whether resources or capabilities are durable advantages | `vrio` | VRIO tests resource value, rarity, imitation cost, and organization; 7S tests system fit. |
| Broad strengths, weaknesses, opportunities, and threats | `swot-tows` | SWOT/TOWS inventories factors and creates options; 7S diagnoses internal fit. |
| Goal-setting and execution tracking | `okrs` | OKRs define objectives and measurable key results; 7S tests whether the organization can support them. |
| Integrated strategy choices | `playing-to-win` | Playing to Win chooses where and how to win; 7S checks whether the organization can execute the choice. |

## Verification

Before presenting a 7S output, check:

- [ ] The organization or unit of analysis is named.
- [ ] The target strategy, change, or performance gap is concrete enough to test.
- [ ] All seven elements were considered, and omissions are explained.
- [ ] Current state and target state are separated for each material element.
- [ ] The answer diagnoses interactions among elements, not just one heading at a time.
- [ ] At least three fit relationships or contradictions are named.
- [ ] Recommendations tie back to specific element gaps and owners.
- [ ] The answer does not treat structure as the whole organization.
- [ ] If the user asked for current McKinsey operating-model redesign, the 2025 Organize to Value refresh is mentioned as a more current adjacent model.
- [ ] No personal data, employee-level details, customer data, secrets, or confidential facts are exposed.

## Do NOT Use When

| Instead of this skill | Use | Why |
| --- | --- | --- |
| Porter's Five Forces | `porters-five-forces` | The user needs external industry profit-pressure structure. |
| Value Chain Analysis | `value-chain-analysis` | The user needs activity-level value, cost, margin, and linkage diagnosis. |
| VRIO | `vrio` | The user needs resource/capability durability testing. |
| SWOT/TOWS | `swot-tows` | The user needs broad factor inventory and option generation. |
| OKRs | `okrs` | The user needs objectives, key results, and execution tracking. |
| Playing to Win | `playing-to-win` | The user needs an integrated strategy-choice cascade. |

## References

- `references/mckinsey-7s-sources.md` - source notes from McKinsey, the 1980 Business Horizons article record, and the 2025 McKinsey operating-model refresh.
- `references/upstream-displacement-2026-06-08.md` - audit-loop upstream-displacement check for this concept skill.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `reasoning-strategy`
- Public: `true`
- Domain: `foundations/strategy`
- Scope: McKinsey 7S organizational-alignment analysis for teams, business units, organizations, transformations, operating-model changes, post-merger integration, strategy execution, and change-readiness reviews: map shared values, strategy, structure, systems, style, staff, and skills; test how the elements reinforce or conflict; identify alignment gaps; prioritize root-cause interventions; and convert the diagnosis into change actions and monitoring signals. Excludes external industry analysis, activity-level value-chain economics, resource-based durable-advantage testing, broad SWOT/TOWS option generation, OKR goal-setting as the primary task, standalone culture advice, and generic change-management slogans.

**When to use**
- Use McKinsey 7S to diagnose why this transformation is stuck after the strategy announcement.
- Build a 7S alignment table for our new operating model and show where structure, systems, skills, and shared values conflict.
- Review this reorganization proposal with the McKinsey 7S framework before we commit to the structure.
- Apply the McKinsey 7S framework to a post-merger integration plan and identify hidden organization-alignment risks.
- Use McKinsey 7S to turn these organization-alignment symptoms into a diagnosis before changing reporting lines.
- Triggers: `mckinsey-7s`, `7s-framework`, `seven-s-framework`, `organization-alignment`

**Not for**
- Analyze buyer power, supplier power, substitutes, entrants, and rivalry in this industry.
- Map the value chain activities that create customer value and drive cost.
- Use VRIO to test whether our data, brand, and process are durable advantages.
- Turn strengths, weaknesses, opportunities, and threats into TOWS strategy options.
- Write OKRs for this quarter and define measurable key results.

**Related skills**
- Verify with: `epistemic-grounding`, `methodology`, `okrs`
- Related: `playing-to-win`, `okrs`, `swot-tows`, `value-chain-analysis`, `vrio`, `porters-five-forces`, `epistemic-grounding`, `methodology`

**Concept**
- Mental model: McKinsey 7S is an organization-alignment map. The primitives are an actor, a target strategy or change, seven interdependent elements, a current-state description for each element, a target-state description for each element, element-to-element fit, contradictions, root causes, interventions, owners, and monitoring signals. Shared values sit at the center because they shape the other six elements; strategy, structure, systems, style, staff, and skills must reinforce one another for the organization to execute change. The agent diagnoses the system, not one box.
- Purpose: This skill prevents agents from treating a reorg, strategy rollout, culture program, or transformation as a single-lever problem. It forces the agent to test whether strategy, reporting lines, work systems, leadership style, people model, capabilities, and shared values fit together before recommending action.
- Boundary: McKinsey 7S is for internal organization alignment and change-readiness diagnosis. It is not Porter's Five Forces external industry analysis, Value Chain activity-level economics, VRIO resource/capability durability testing, SWOT/TOWS option generation, OKR goal-setting, standalone culture coaching, or modern operating-model redesign under McKinsey's 2025 Organize to Value system unless the user explicitly asks for the newer McKinsey model.
- Analogy: McKinsey 7S is like tuning a seven-string instrument: changing one string changes the harmony, and a performance problem may come from the relationship among strings rather than from one string alone.
- Common misconception: The common mistake is treating 7S as a checklist of seven headings or as an org-chart tool. The framework's point is interdependence: structure alone is not the organization, and a change in one element usually fails unless the other elements are adjusted to support it.

**Grounding**
- Mode: `universal`
- Truth sources: `https://www.mckinsey.com/capabilities/strategy-and-corporate-finance/our-insights/enduring-ideas-the-7-s-framework`, `https://www.mckinsey.com/capabilities/people-and-organizational-performance/our-insights/a-new-operating-model-for-a-new-world`, `https://www.sciencedirect.com/science/article/pii/0007681380900270`, `skills/skills/reasoning-strategy/mckinsey-7s/references/mckinsey-7s-sources.md`, `skills/skills/reasoning-strategy/mckinsey-7s/references/upstream-displacement-2026-06-08.md`

**Keywords**
- `McKinsey 7S`, `7S framework`, `7S alignment`, `organization alignment`, `organizational effectiveness`, `organization design`, `reorganization`, `post-merger integration`, `operating model alignment`, `strategy execution gap`

<!-- skill-graph-context:end -->
