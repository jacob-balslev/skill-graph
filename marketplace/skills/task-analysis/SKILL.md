---
name: task-analysis
description: "Use when auditing a route, defining a route contract, reviewing onboarding or setup flows, diagnosing why a page feels confusing, or when the user asks about top tasks, time-to-value, branching, dead ends, or task complexity. Provides goal-driven UX analysis that turns vague critique into explicit goal -> task -> subtask decomposition and a primary / secondary / supporting hierarchy contract for the first viewport. Do NOT use for control-pattern choice (use `interaction-patterns`), visual craft (use `visual-design-foundations`), responsive layout (use `layout-composition`), or accessibility-only QA (use `a11y`). Do NOT use for review this PR for code quality. Do NOT use for audit this UI for WCAG 2.2 violations. Do NOT use for decide the CSS grid layout for this hero section. Do NOT use for pick the right colors for this status badge. Do NOT use for build the navigation taxonomy for the whole product. Do NOT use for should we use a dropdown or a stepper here."
license: MIT
compatibility: "Stack-agnostic. The actor / scenario / top-task model, the five friction dimensions, the breakpoint taxonomy, and the primary / secondary / supporting hierarchy apply to any UI under review; persona / journey YAML files are illustrative — substitute the equivalents (Notion, Confluence, in-repo Markdown, Figma annotations) of your team."
allowed-tools: Read Grep
metadata:
  relations: "{\"related\":[\"interaction-feedback\",\"visual-design-foundations\",\"diagnosis\",\"pattern-recognition\",\"code-review\",\"information-architecture\",\"layout-composition\",\"interaction-patterns\",\"a11y\"],\"verify_with\":[\"a11y\",\"information-architecture\"]}"
  subject: reasoning-strategy
  public: "true"
  scope: "Use when auditing a route, defining a route contract, reviewing onboarding or setup flows, diagnosing why a page feels confusing, or when the user asks about top tasks, time-to-value, branching, dead ends, or task complexity. Provides goal-driven UX analysis that turns vague critique into explicit goal -> task -> subtask decomposition and a primary / secondary / supporting hierarchy contract for the first viewport. Do NOT use for control-pattern choice (use `interaction-patterns`), visual craft (use `visual-design-foundations`), responsive layout (use `layout-composition`), or accessibility-only QA (use `a11y`)."
  taxonomy_domain: foundations/analysis
  stability: experimental
  keywords: "[\"top task analysis\",\"goal-driven UX review\",\"route audit workflow\",\"onboarding flow analysis\",\"task friction scoring\",\"five friction dimensions\",\"dead-end detection\",\"hidden next-step diagnosis\",\"hierarchy contract first viewport\",\"actor and scenario identification\"]"
  examples: "[\"this onboarding flow feels confusing — analyze the task structure\",\"audit this dashboard route for whether it supports the user's top task\",\"what should be above the fold on this page?\",\"users keep abandoning this wizard at step 3 — find the breakpoint\",\"decide what belongs in the first viewport for this analytics page\",\"diagnose why this multi-step setup has too many decisions\",\"the team disagrees on what the top task is for this route — settle it\"]"
  anti_examples: "[\"review this PR for code quality\",\"audit this UI for WCAG 2.2 violations\",\"decide the CSS grid layout for this hero section\",\"pick the right colors for this status badge\",\"build the navigation taxonomy for the whole product\",\"should we use a dropdown or a stepper here\"]"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/reasoning-strategy/task-analysis/SKILL.md
  skill_graph_export_description_projection: anti_examples
---
# Task Analysis

## Concept of the skill

Use when auditing a route, defining a route contract, reviewing onboarding or setup flows, diagnosing why a page feels confusing, or when the user asks about top tasks, time-to-value, branching, dead ends, or task complexity.

## Coverage

Goal-driven UX analysis for any route or flow: identifying the actor and scenario from persona / journey contracts, extracting the top task for a route, breaking tasks into sequential subtasks with skip paths and blocked states, scoring task friction across five dimensions (discoverability, cognitive load, effort, trust, recovery), identifying breakpoints (dead ends, hidden next steps, excessive branching, unclear success states, misleading value presentation, mobile-only friction, role / permission confusion), and producing the primary / secondary / supporting hierarchy contract for the first viewport that hands off to layout and composition skills. Applies to route audits, onboarding flow reviews, setup wizards, multi-step processes, and any page where "it feels confusing" needs a structured diagnosis. Includes a five-step analysis protocol, a structured output template, an anti-pattern list (Nielsen-first heuristic critique, "rendered correctly" as proof, ignoring skip paths, decorative polish over task completion, fictional persona detail), and a verification checklist that confirms the actor and scenario were named explicitly rather than assumed.

## Philosophy of the skill
UX quality is not about how a page looks — it is about whether the page supports the user's top task. Without task analysis, agents default to generic heuristic critique ("add more whitespace," "reduce clutter") that sounds professional but changes nothing about task completion.

This skill exists because aesthetic-first design reviews produce recommendations that do not address why users abandon flows. Task analysis forces the question: what is the user trying to accomplish, and where does the route break that goal? Once the goal is explicit, every layout, copy, and interaction decision can be measured against task support rather than personal taste — and the conversation moves from subjective debate ("I think this looks better") to falsifiable claim ("this change reduces friction at the discoverability dimension for step 2").

## Workflow

Use the ordered phases, checklists, and guardrails in the sections below as the canonical workflow for this skill. When multiple subsections describe steps, follow them in the order presented.

> If you cannot state the user's goal, top task, and next step, you are not analyzing the UX yet.

### When to Activate

Load this skill when:

- auditing a route or flow
- writing or updating route contracts
- checking onboarding / setup / multi-step flows
- diagnosing friction, dead ends, or too many clicks
- deciding what belongs above the fold on a task-heavy page

### Core Model

Separate these concepts clearly:

| Term         | Meaning                                  | Example                                            |
| ------------ | ---------------------------------------- | -------------------------------------------------- |
| **Goal**     | Why the user is here                     | "Know if my marketing campaign performed well"     |
| **Task**     | Observable activity that serves the goal | Open the analytics report and read summary metrics |
| **Subtask**  | Smaller step within the task             | Navigate to Analytics → select 7D → inspect summary |
| **Scenario** | The specific situation / route context   | Marketing manager checking this week's results on mobile |

Never confuse a UI interaction with a goal. Filling a form is not the goal; it is a task in service of the goal.

### Inputs To Read First

1. The route contract or page contract for the target route (if your team maintains one).
2. The canonical persona definitions for your product.
3. The canonical journey / scenario sequencing for your product.
4. Any narrative route-flow documentation (user-journey docs, sitemaps).

If these inputs are missing, state the missing source of truth instead of inventing task structure. If the inputs exist but disagree (the persona doc says one thing and the journey doc another), flag the discrepancy in your output rather than picking a winner silently.

**Caution:** these sources may have drifted. Trust the most-recently-updated canonical source for the field in question and document any conflicts you encountered.

### Analysis Protocol

#### 1. Identify the actor and scenario

Output:

```text
Actor: <persona_id>
Scenario: <journey_id> — <scenario>
Business objective: <activation | retention | expansion | operational_efficiency>
```

#### 2. Extract the top task

For the target route, answer:

- What is the primary task this route must support?
- What would success look like in the smallest useful unit of time?
- What information must be visible before the user can proceed confidently?

Also name the hierarchy contract for the first viewport:

- **Primary:** what must be seen first.
- **Secondary:** what must frame or support the primary task.
- **Supporting:** what can wait until the user asks for more detail.

If you cannot name these three layers, you are not ready to decide what belongs above the fold. Once named, hand off to `layout-composition` to turn the hierarchy into actual section order, scan pattern, and component decisions.

#### 3. Break the task into subtasks

Represent the flow as ordered steps:

```text
Goal
  → Task
    → Subtask 1
    → Subtask 2
    → Branch / skip
    → Completion state
```

Include skip paths, blocked states, and role-limited variants.

#### 4. Score task friction

For each subtask, evaluate:

| Dimension           | Questions                                                        |
| ------------------- | ---------------------------------------------------------------- |
| **Discoverability** | Can the user find the next step quickly?                         |
| **Cognitive load**  | Does the user need to remember hidden context or jargon?         |
| **Effort**          | How many clicks / scrolls / decisions are required?              |
| **Trust**           | Is uncertainty, incompleteness, or gating communicated honestly? |
| **Recovery**        | If blocked, is the next step obvious and actionable?             |

#### 5. Identify the breakpoints

Flag the exact point where the journey degrades:

- dead end
- excessive branching
- hidden next step
- unclear success state
- misleading value presentation
- mobile-only friction
- role / permission confusion

### Output Template

```markdown
## Task Analysis

- Actor: <persona>
- Scenario: <journey>
- Top task: <single-sentence task>
- Success metric: <time-to-value or completion target>

### Task Breakdown

1. <subtask>
2. <subtask>
3. <subtask>

### Friction Points

- <point> — why it increases effort or confusion

### Failure Modes

- <documented route failure mode>

### UX Implication

- What must change in layout, copy, affordance, or state handling to support the task better
```

### Anti-Patterns

- Starting with Nielsen heuristics before naming the top task.
- Treating "rendered correctly" as proof the task is supported.
- Ignoring skip paths or role-limited states.
- Counting decorative polish as more important than task completion.
- Using fictional persona detail instead of route / journey evidence.

## Evals

This skill ships a comprehension-eval artifact at [`examples/evals/task-analysis.json`](https://github.com/jacob-balslev/skill-graph/blob/main/examples/evals/task-analysis.json). The checklist below is the authoring gate for route and flow analysis; the eval file is the grader surface.

## Verification

After applying task analysis, verify:

- [ ] Actor and scenario are explicitly named (persona id + journey id), not assumed.
- [ ] Top task is stated as a single sentence describing what the user is trying to accomplish.
- [ ] Subtasks are listed in sequential order with skip paths and blocked states noted.
- [ ] Friction scoring covers all five dimensions (discoverability, cognitive load, effort, trust, recovery).
- [ ] Breakpoints identify the exact point where the journey degrades, not generic complaints.
- [ ] Primary / secondary / supporting hierarchy contract is named for the first viewport.
- [ ] Layout and composition decisions are deferred to `layout-composition`, not attempted here.
- [ ] Recommendations are framed in terms of task support, not aesthetic preference.

## Do NOT Use When

| Instead, use | Why |
|---|---|
| `code-review` | Reviewing a specific PR or change for code quality and correctness. Code-review owns the per-change judgment; task-analysis owns the per-route user-goal decomposition. |
| `a11y` | Auditing an existing UI against WCAG / ARIA / keyboard / screen-reader contracts. A11y owns the accessibility-compliance lens; task-analysis owns the user-goal-fit lens. |
| `diagnosis` | Triaging an unknown software failure into a problem class before debugging begins. Diagnosis owns the per-incident triage; task-analysis owns the per-route user-task decomposition. |
| `pattern-recognition` | Detecting recurring UX-friction patterns across many routes. Pattern-recognition owns the cross-route class analysis; task-analysis owns the within-route analysis of one route at a time. |
| `documentation` | Writing or updating route-contract docs, page-template specs, or sitemap docs. Documentation owns the artifact format; task-analysis produces the content that goes into those artifacts. |
| `layout-composition` | Deciding CSS grid layout, section ordering, breakpoints, or scan-pattern composition. Task-analysis stops at the hierarchy contract; layout-composition owns the visual structure decisions. |
| `visual-design-foundations` | Reviewing visual polish (spacing, color, typography). Task-analysis is goal-first; visual-design-foundations owns visual craft. |
| `interaction-patterns` | Choosing controls such as dropdowns, steppers, tabs, modals, or inline edit. Interaction-patterns owns pattern selection. |
| `interaction-feedback` | Adding loading skeletons, empty states, progress indicators, retry, or undo behavior. Interaction-feedback owns UI-state patterns; task-analysis identifies where such patterns are needed without specifying which. |
| `information-architecture` | Building the navigation taxonomy or page-group structure for an entire product. IA owns structural organization across pages; task-analysis owns per-page user-goal analysis. |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `reasoning-strategy`
- Public: `true`
- Domain: `foundations/analysis`
- Scope: Use when auditing a route, defining a route contract, reviewing onboarding or setup flows, diagnosing why a page feels confusing, or when the user asks about top tasks, time-to-value, branching, dead ends, or task complexity. Provides goal-driven UX analysis that turns vague critique into explicit goal -> task -> subtask decomposition and a primary / secondary / supporting hierarchy contract for the first viewport. Do NOT use for control-pattern choice (use `interaction-patterns`), visual craft (use `visual-design-foundations`), responsive layout (use `layout-composition`), or accessibility-only QA (use `a11y`).

**When to use**
- this onboarding flow feels confusing — analyze the task structure
- audit this dashboard route for whether it supports the user's top task
- what should be above the fold on this page?
- users keep abandoning this wizard at step 3 — find the breakpoint
- decide what belongs in the first viewport for this analytics page
- diagnose why this multi-step setup has too many decisions
- the team disagrees on what the top task is for this route — settle it

**Not for**
- review this PR for code quality
- audit this UI for WCAG 2.2 violations
- decide the CSS grid layout for this hero section
- pick the right colors for this status badge
- build the navigation taxonomy for the whole product
- should we use a dropdown or a stepper here

**Related skills**
- Verify with: `a11y`, `information-architecture`
- Related: `interaction-feedback`, `visual-design-foundations`, `diagnosis`, `pattern-recognition`, `code-review`, `information-architecture`, `layout-composition`, `interaction-patterns`, `a11y`

**Keywords**
- `top task analysis`, `goal-driven UX review`, `route audit workflow`, `onboarding flow analysis`, `task friction scoring`, `five friction dimensions`, `dead-end detection`, `hidden next-step diagnosis`, `hierarchy contract first viewport`, `actor and scenario identification`

<!-- skill-graph-context:end -->
