---
name: okrs
description: "Objectives and Key Results goal-setting methodology for turning strategy, quarterly priorities, product goals, or team focus areas into outcome-oriented Objectives, measurable Key Results, review cadences, and learning loops. Do NOT use for Decide our winning aspiration, where to play, and how to win. Do NOT use for Use constraint-awareness to identify hard constraints before choosing a strategy or goal. Do NOT use for measurable execution goals after strategy direction is chosen (use playing-to-win). Do NOT use for goal-setting after constraints and priorities are understood (use constraint-awareness)."
license: MIT
compatibility: "Markdown, strategy memos, operating plans, quarterly planning, goal reviews"
allowed-tools: Read Grep
metadata:
  subject: reasoning-strategy
  deployment_target: portable
  scope: "OKR goal-setting for strategy execution: define qualitative Objectives, 2-5 measurable outcome Key Results, alignment checks, scoring, review cadence, and learning loops. Excludes upstream strategy formulation, backlog prioritization, KPI dashboard design, compensation evaluation, and task-list management."
  taxonomy_domain: foundations/strategy-execution
  stability: stable
  keywords: "[\"OKRs\",\"objectives and key results\",\"objective key results\",\"goal setting\",\"quarterly goals\",\"key results\",\"stretch goals\",\"outcome goals\",\"OKR scoring\",\"goal alignment\"]"
  triggers: "[\"okrs\",\"objectives-and-key-results\",\"objective-key-results\"]"
  examples: "[\"Use okrs to turn this product strategy into quarterly Objectives and Key Results.\",\"Rewrite these OKRs so Objectives are qualitative and Key Results are measurable outcomes with baselines and targets.\",\"Our OKRs look like a task list; convert the activities into outcome Key Results.\",\"Create an OKR set for this launch plan with scoring cadence and retrospective guidance.\"]"
  anti_examples: "[\"Decide our winning aspiration, where to play, and how to win.\",\"Use constraint-awareness to identify hard constraints before choosing a strategy or goal.\"]"
  relations: "{\"boundary\":[{\"skill\":\"playing-to-win\",\"reason\":\"okrs owns measurable execution goals after strategy direction is chosen; playing-to-win owns the upstream integrated strategy choices\"},{\"skill\":\"constraint-awareness\",\"reason\":\"okrs owns goal-setting after constraints and priorities are understood; constraint-awareness owns identifying hard limits and trade-off boundaries\"}],\"related\":[\"playing-to-win\",\"prioritization\",\"methodology\",\"performance-budgets\",\"evaluation\",\"constraint-awareness\",\"expected-value\",\"epistemic-grounding\"],\"verify_with\":[\"constraint-awareness\",\"epistemic-grounding\",\"methodology\"]}"
  grounding: "{\"subject_matter\":\"Objectives and Key Results as a portable goal-setting and strategy-execution methodology\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://www.whatmatters.com/faqs/okr-meaning-definition-example\",\"https://rework.withgoogle.com/intl/en/guides/set-goals-with-okrs\",\"https://okrinstitute.org/okrs/\",\"skills/reasoning-strategy/okrs/references/okrs-sources.md\",\"skills/reasoning-strategy/okrs/references/upstream-displacement-2026-05-30.md\"],\"failure_modes\":[\"objectives_without_strategy_context\",\"key_results_as_tasks_or_outputs\",\"key_results_without_baselines_or_targets\",\"too_many_objectives_diffusing_focus\",\"okrs_used_as_compensation_evaluation\",\"sandbagged_or_unreachable_goals\",\"no_check_in_or_scoring_cadence\",\"cascading_everything_instead_of_aligning_priorities\"],\"evidence_priority\":\"general_knowledge_first\"}"
  mental_model: "OKRs connect strategic intent to measurable learning over a fixed planning period. The primitives are a small set of qualitative Objectives, two to five measurable Key Results per Objective, owners, baselines, targets, check-in cadence, score, and retrospective learning. Objectives describe the important outcome to pursue; Key Results define observable evidence that the outcome happened."
  purpose: "This skill prevents agents from turning OKRs into task lists, KPI inventories, or aspirational slogans. It forces the work to state what matters this period, how success will be measured, what evidence proves progress, what will be reviewed during the period, and what the team should learn from the score."
  boundary: "OKRs are for measurable goal-setting and strategy execution. They are not the strategy itself, a project plan, a backlog scoring model, a KPI dashboard for business-as-usual monitoring, a compensation review system, or a list of every task a team will do. Those tools can feed or follow OKRs, but they do not replace outcome-oriented Objectives and measurable Key Results."
  analogy: "OKRs are like a compass plus mile markers: the Objective points toward the destination, and the Key Results show whether the team is actually getting closer."
  misconception: "The common mistake is treating Key Results as planned activities. A Key Result is not 'launch feature X' unless the launch itself proves the outcome; stronger Key Results measure the customer, business, quality, or learning change the work is supposed to create."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/reasoning-strategy/okrs/SKILL.md
  skill_graph_export_description_projection: anti_examples+boundary
---

## Concept of the skill

**What it is:** OKRs, or Objectives and Key Results, are a goal-setting method for translating important strategy or team priorities into a small set of qualitative Objectives and measurable Key Results for a defined period.

**Mental model:** An Objective names the meaningful outcome to pursue. Key Results are the measurable evidence that the outcome happened. A good OKR set also includes ownership, baseline, target, check-in cadence, score, and retrospective learning.

**Why it exists:** Agents often produce goals that sound strategic but cannot be inspected, or measurement tables that track activity without focus. OKRs force focus, outcome evidence, alignment, and learning into the planning artifact.

**What it is NOT:** OKRs are not strategy formulation, project management, KPI dashboards, compensation evaluation, backlog prioritization, or a task inventory.

**Adjacent concepts:** strategy execution, stretch goals, KPIs, milestones, leading indicators, lagging indicators, quarterly planning, goal scoring, alignment, retrospectives.

**One-line analogy:** OKRs are a compass plus mile markers: the Objective points the direction, and the Key Results show whether the team is moving.

**Common misconception:** Key Results are not the work the team plans to do. They are the measurable change the work must create.

# OKRs

## Domain Context

OKRs are useful when a team already has a strategy, mission, product direction, or operating priority and needs to turn it into measurable focus for the next cycle. The method is strongest when it is public, reviewable, and decoupled from compensation so teams can set ambitious goals and learn honestly from partial progress.

Use synthetic, aggregate, or public examples only. Do not include personal data, customer data, payment data, order data, private file paths, secrets, or confidential business facts in OKR examples or evals.

The output of this skill is not a polished plan. It is a goal contract: what matters, how success is measured, who owns the result, when progress is checked, and what score or learning will close the loop.

## Coverage

This skill teaches agents to:

1. Decide whether OKRs are the right tool for the request.
2. Extract strategy context before writing goals.
3. Draft a small set of qualitative Objectives.
4. Convert activity statements into measurable outcome Key Results.
5. Add baselines, targets, owners, time horizons, and evidence sources.
6. Separate OKRs from KPIs, tasks, initiatives, roadmaps, and performance reviews.
7. Check alignment without forcing every lower-level team to mirror every higher-level OKR.
8. Define check-in, scoring, and retrospective cadence.
9. Identify bad OKRs: task lists, vague aspirations, too many goals, vanity metrics, and sandbagged goals.

## Philosophy of the skill

Good OKRs are useful because they make focus observable. They turn "we should improve onboarding" into a short-cycle commitment with visible evidence: what improvement, for whom, from what baseline, to what target, by when, and with what review rhythm.

The discipline is not "make every goal numerical." The discipline is to separate the desired outcome from the work used to pursue it. A task can be necessary and still make a weak Key Result. A metric can be measurable and still be a weak Key Result if it is vanity, business-as-usual, or disconnected from the Objective.

OKRs work best when partial achievement is treated as information. If every OKR is always fully achieved, the goals are probably too safe. If every OKR is missed badly, the system is probably fantasy or under-resourced. The review should explain what changed, what was learned, and what the next cycle should do differently.

## 1. Decide Whether OKRs Fit

Use OKRs when the user needs focus, alignment, measurable outcomes, and a review cadence for a defined period.

Do not use OKRs when the user needs:

| User need | Better fit |
| --- | --- |
| Choose the actual strategy | `playing-to-win` or another strategy framework |
| Rank a known queue of work | `prioritization` |
| Monitor ongoing business-as-usual health | KPI dashboard or scorecard method |
| Assign tasks and dependencies | project plan |
| Evaluate employee performance | performance-management process |
| Specify technical service thresholds | `performance-budgets` |

If the request lacks strategy context, ask for or infer the strategic source and label inference clearly.

```text
Strategic source:
Planning period:
Team or scope:
Current baseline:
What must change this period:
What must not be sacrificed:
Review cadence:
```

## 2. Draft Objectives

Objectives answer "where do we want to go this period?" They should be qualitative, memorable, significant, concrete, and action-oriented.

Strong Objectives:

- describe an outcome state, not a task,
- are few enough to create focus,
- connect to strategy or a higher-level priority,
- create a real trade-off against lower-value work,
- can be understood by adjacent teams.

Weak Objectives:

- "Maintain current growth"
- "Work on onboarding"
- "Do the Q3 roadmap"
- "Improve everything"
- "Keep customers happy"

Rewrite weak Objectives into outcome states:

| Weak Objective | Better Objective |
| --- | --- |
| Ship onboarding improvements | New users reach value faster without hand-holding |
| Improve sales | Create a repeatable path from qualified lead to closed customer |
| Work on reliability | Make the product dependable for critical weekly workflows |
| Launch the campaign | Prove the new segment can produce qualified demand |

Keep the set small. Three to five Objectives is usually the upper bound for a team or organization in one cycle. One or two is often better for a focused team.

## 3. Draft Key Results

Key Results answer "how will we know we got there?" They should be measurable, time-bound, outcome-oriented, and easy to grade.

For each Key Result, include:

| Field | Question |
| --- | --- |
| Metric | What measurable evidence changes? |
| Baseline | Where are we now? |
| Target | What level counts as success? |
| Evidence source | Where will the number come from? |
| Owner | Who is accountable for reporting progress? |
| Check-in cadence | When will progress be reviewed? |

Convert activities into outcomes:

| Activity-shaped KR | Outcome-shaped KR |
| --- | --- |
| Launch onboarding checklist | Increase activation from 42% to 60% for first-week users |
| Run five customer interviews | Identify and validate the top three purchase blockers with evidence from at least 12 target buyers |
| Publish new landing page | Increase qualified demo requests from the target segment from 20 to 35 per month |
| Improve reliability | Reduce weekly failed jobs from 4.0% to 1.0% |

Activity-shaped Key Results are acceptable only when the activity itself is the outcome, such as meeting a compliance deadline or completing a migration whose completion is externally verifiable. Even then, prefer adding a quality bar.

## 4. Check the OKR Set

Use this checklist before presenting OKRs as final.

| Check | Good signal | Failure signal |
| --- | --- | --- |
| Strategy link | Each Objective traces to a strategy or priority | Goals are locally nice but strategically disconnected |
| Focus | Few Objectives and few Key Results | Long list of everything the team might do |
| Outcome orientation | Key Results measure change or proof | Key Results list tasks, meetings, or launches |
| Measurability | Baseline, target, and source are clear | "Improve", "increase", or "better" without a number |
| Ownership | Owner reports progress | Collective ownership hides accountability |
| Alignment | Dependencies and conflicts are visible | Every team copies the same OKR without local fit |
| Integrity | OKRs are not tied directly to pay | Scores become negotiation or sandbagging |
| Learning | Review cadence and retrospective exist | OKRs are written once and forgotten |

When an OKR fails a check, repair the mechanism. Do not merely polish the wording.

## 5. Score and Learn

Define scoring before the period starts.

Common scoring shape:

| Score | Meaning |
| --- | --- |
| 0.0 | No meaningful progress |
| 0.3 | Some progress, but far below target |
| 0.6-0.7 | Strong stretch progress |
| 1.0 | Fully achieved |

Use the score as learning, not compensation. A strong retrospective explains:

```text
Objective:
Score:
What moved:
What did not move:
What surprised us:
What assumption changed:
What we should continue:
What we should stop:
What becomes next cycle's focus:
```

For committed operational goals, define the expected score separately. Some organizations use aspirational OKRs where 0.6-0.7 is healthy; others use committed OKRs where the target is closer to 1.0. The agent must state which interpretation it is using.

## Output Template

Use this format when generating OKRs.

```text
Planning period:
Scope:
Strategic source:

Objective 1:
Why this matters:
Owner:
Key Results:
1. [Metric] from [baseline] to [target] by [date], source: [system/report]
2. [Metric] from [baseline] to [target] by [date], source: [system/report]
3. [Metric] from [baseline] to [target] by [date], source: [system/report]
Check-in cadence:
Scoring interpretation: aspirational / committed
Risks and dependencies:

Rejected task-shaped KRs:
- [task] -> [outcome rewrite]
```

## Do NOT Use When

| Use instead | When |
| --- | --- |
| `playing-to-win` | The user needs to choose strategy, not execute an existing strategy |
| `prioritization` | The user needs to rank backlog items or initiatives |
| `performance-budgets` | The user needs technical latency, throughput, or resource thresholds |
| `evaluation` | The user needs to score an artifact or option against criteria |
| Project planning | The user needs task owners, dependencies, and dates |
| KPI dashboard design | The user needs ongoing operating metrics rather than change goals |

## Verification

Before finalizing OKRs, verify:

- [ ] Every Objective has a strategic source or clearly labeled assumption.
- [ ] Every Objective describes an outcome state, not a task.
- [ ] Every Key Result has a metric, baseline, target, date, and evidence source.
- [ ] Key Results measure outcomes or proof, not just activity.
- [ ] The OKR set is small enough to force trade-offs.
- [ ] Dependencies and risks are visible.
- [ ] Scoring interpretation is explicit.
- [ ] Check-in and retrospective cadence are defined.
- [ ] The response does not present OKRs as compensation criteria.
- [ ] Private data, secrets, and personal identifiers are absent.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `reasoning-strategy`
- Deployment: `portable`
- Domain: `foundations/strategy-execution`
- Scope: OKR goal-setting for strategy execution: define qualitative Objectives, 2-5 measurable outcome Key Results, alignment checks, scoring, review cadence, and learning loops. Excludes upstream strategy formulation, backlog prioritization, KPI dashboard design, compensation evaluation, and task-list management.

**When to use**
- Use okrs to turn this product strategy into quarterly Objectives and Key Results.
- Rewrite these OKRs so Objectives are qualitative and Key Results are measurable outcomes with baselines and targets.
- Our OKRs look like a task list; convert the activities into outcome Key Results.
- Create an OKR set for this launch plan with scoring cadence and retrospective guidance.
- Triggers: `okrs`, `objectives-and-key-results`, `objective-key-results`

**Not for**
- Decide our winning aspiration, where to play, and how to win.
- Use constraint-awareness to identify hard constraints before choosing a strategy or goal.
- Owned by `playing-to-win`: measurable execution goals after strategy direction is chosen
- Owned by `constraint-awareness`: goal-setting after constraints and priorities are understood

**Related skills**
- Verify with: `constraint-awareness`, `epistemic-grounding`, `methodology`
- Related: `playing-to-win`, `prioritization`, `methodology`, `performance-budgets`, `evaluation`, `constraint-awareness`, `expected-value`, `epistemic-grounding`

**Concept**
- Mental model: OKRs connect strategic intent to measurable learning over a fixed planning period. The primitives are a small set of qualitative Objectives, two to five measurable Key Results per Objective, owners, baselines, targets, check-in cadence, score, and retrospective learning. Objectives describe the important outcome to pursue; Key Results define observable evidence that the outcome happened.
- Purpose: This skill prevents agents from turning OKRs into task lists, KPI inventories, or aspirational slogans. It forces the work to state what matters this period, how success will be measured, what evidence proves progress, what will be reviewed during the period, and what the team should learn from the score.
- Boundary: OKRs are for measurable goal-setting and strategy execution. They are not the strategy itself, a project plan, a backlog scoring model, a KPI dashboard for business-as-usual monitoring, a compensation review system, or a list of every task a team will do. Those tools can feed or follow OKRs, but they do not replace outcome-oriented Objectives and measurable Key Results.
- Analogy: OKRs are like a compass plus mile markers: the Objective points toward the destination, and the Key Results show whether the team is actually getting closer.
- Common misconception: The common mistake is treating Key Results as planned activities. A Key Result is not 'launch feature X' unless the launch itself proves the outcome; stronger Key Results measure the customer, business, quality, or learning change the work is supposed to create.

**Grounding**
- Mode: `universal`
- Truth sources: `https://www.whatmatters.com/faqs/okr-meaning-definition-example`, `https://rework.withgoogle.com/intl/en/guides/set-goals-with-okrs`, `https://okrinstitute.org/okrs/`, `skills/reasoning-strategy/okrs/references/okrs-sources.md`, `skills/reasoning-strategy/okrs/references/upstream-displacement-2026-05-30.md`

**Keywords**
- `OKRs`, `objectives and key results`, `objective key results`, `goal setting`, `quarterly goals`, `key results`, `stretch goals`, `outcome goals`, `OKR scoring`, `goal alignment`

<!-- skill-graph-context:end -->
