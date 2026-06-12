---
name: problem-approach-router
description: "Use when facing a new problem and unsure which problem-solving methodology or foundational skill to apply first. Routes between first-principles-thinking, pattern-recognition, mental-models, constraint-awareness, and task-analysis by classifying the problem type. Activate before choosing any other foundational skill. Do NOT use to execute the selected approach (use the specific routed skill directly), for implementation work (use the relevant engineering skill), or when the correct approach is already known. Do NOT use for actually apply first-principles thinking to this specific problem. Do NOT use for analyze why this pattern keeps recurring in the codebase. Do NOT use for break down the constraints on this engineering decision. Do NOT use for map the mental model for this domain concept. Do NOT use for implement the algorithm we already decided on. Do NOT use for choose a testing strategy for this feature."
license: MIT
compatibility: "Domain-agnostic dispatch. The routing table applies to any problem a human or agent faces — software, design, product, or strategy. The skill names in the Routing Rules refer to sibling skills in the foundations category."
allowed-tools: Read Grep
metadata:
  relations: "{\"related\":[\"first-principles-thinking\",\"pattern-recognition\",\"mental-models\",\"constraint-awareness\",\"task-analysis\",\"epistemic-grounding\",\"taxonomy-design\"]}"
  subject: software-engineering-method
  public: "true"
  scope: "Use when facing a new problem and unsure which problem-solving methodology or foundational skill to apply first. Routes between first-principles-thinking, pattern-recognition, mental-models, constraint-awareness, and task-analysis by classifying the problem type. Activate before choosing any other foundational skill. Do NOT use to execute the selected approach (use the specific routed skill directly), for implementation work (use the relevant engineering skill), or when the correct approach is already known."
  taxonomy_domain: foundations/meta
  stability: experimental
  keywords: "[\"which approach\",\"which methodology\",\"problem-solving method\",\"select methodology\",\"which skill first\",\"approach selection\",\"methodology dispatch\",\"method router\",\"first principles vs pattern\",\"how to approach this problem\"]"
  triggers: "[\"problem-approach-router\",\"methodology-router\",\"approach-router\"]"
  examples: "[\"I have a completely novel problem nobody has solved before — where do I start?\",\"the codebase has a recurring bug pattern — which foundational approach should I use?\",\"I need to explain a complex system to a stakeholder — which skill applies?\",\"I'm blocked by conflicting requirements that all seem equally valid — which approach first?\",\"the task feels overwhelming because there are too many parts — what's the right starting lens?\",\"a user is asking me to solve something I know a similar solution for but the details differ\",\"I don't know what I don't know about this problem — which foundational skill handles that?\"]"
  anti_examples: "[\"actually apply first-principles thinking to this specific problem\",\"analyze why this pattern keeps recurring in the codebase\",\"break down the constraints on this engineering decision\",\"map the mental model for this domain concept\",\"implement the algorithm we already decided on\",\"choose a testing strategy for this feature\"]"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/software-engineering-method/problem-approach-router/SKILL.md
  skill_graph_export_description_projection: anti_examples
---
# Problem Approach Router

## Concept of the skill

Use when facing a new problem and unsure which problem-solving methodology or foundational skill to apply first.

## Coverage

Routes between the five foundational problem-solving skills by classifying the problem type before any approach is applied. Does not teach any methodology — it dispatches to the skill that teaches it. The routing table covers: novel problems with unknown assumptions (`first-principles-thinking`), recurring or familiar problem shapes (`pattern-recognition`), system-understanding and explanation tasks (`mental-models`), constraint-dominated or boundary-rich problems (`constraint-awareness`), and workflow and user-goal decomposition tasks (`task-analysis`).

## Routing Rules

Evaluate the problem against the signals below. The first matching row determines the skill to activate. If multiple rows match, the problem is multi-layered — apply the skills in the order they match (start from the top of the table).

| Signal | Route to | When to activate |
|---|---|---|
| "Nobody has solved this before" or "I don't know what the correct assumptions are" | `first-principles-thinking` | Problem is genuinely novel; existing solutions, patterns, and analogies are unavailable or misleading |
| "This looks like something I've seen before" or "there's a recurring shape here" | `pattern-recognition` | Problem shape has appeared before in the same or analogous form; the goal is to name and apply the pattern rather than derive from scratch |
| "I need to explain how this system works" or "I don't understand how the parts relate" | `mental-models` | Goal is comprehension or explanation of a domain, system, concept, or architecture — not yet solving or deciding |
| "Everything is constrained and I don't know which constraints are hard" | `constraint-awareness` | Problem is dominated by boundary conditions, limitations, or competing requirements; the first move is mapping what cannot change |
| "I need to decompose this workflow or user goal into steps" | `task-analysis` | Problem is a sequence of user actions, a multi-step workflow, or a task that requires understanding user intent before designing a solution |
| "I'm not sure which of the above applies" | `epistemic-grounding` | Start here when the problem type itself is unclear — epistemic-grounding clarifies what is known, what is assumed, and what is missing before routing |

### Coverage-gap behavior

If no signal matches clearly, return to the caller with: "Which of the following best describes the problem — novel/no-prior-solution, recurring/familiar, needs-explanation, constraint-dominated, workflow/user-goal?" Do NOT default to any approach without a classification signal.

### Compound problems

When a problem matches more than one row simultaneously (e.g., it is both novel AND constraint-dominated), list both matches and route to each skill in sequence. Declare the compound classification explicitly before proceeding: "This is a novel + constraint-dominated problem. I will apply first-principles-thinking first to clear the assumptions, then constraint-awareness to map the hard boundaries."

## Philosophy of the skill

This skill exists to make agents apply Problem Approach Router through its declared scope, coverage, exclusions, and verification checks instead of relying on generic model memory. The useful behavior is specific: recognize the right task, follow the skill's operating guidance, and prove the result with the listed checks.

## Verification

After applying this skill, verify:

- [ ] The task matches the declared scope, coverage, or positive examples.
- [ ] The response follows this skill's workflow or checks instead of generic advice.
- [ ] The exclusions in `## Do NOT Use When` do not point to a better skill.

## Do NOT Use When
| Use instead | When |
|---|---|
| `first-principles-thinking` | The approach is already known to be first-principles; the router has already been applied |
| `pattern-recognition` | The recurring pattern is already identified; no routing decision is needed |
| `mental-models` | The goal is explicitly system understanding; the routing decision is already made |
| `task-analysis` | The task is explicitly a workflow or user-goal decomposition; no routing needed |
| `epistemic-grounding` | The problem is not about choosing an approach but about clarifying what is known |
| Domain-specific skills (`debugging`, `testing-strategy`, `code-review`, etc.) | The problem is domain-specific and the correct skill is already evident from context |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `software-engineering-method`
- Public: `true`
- Domain: `foundations/meta`
- Scope: Use when facing a new problem and unsure which problem-solving methodology or foundational skill to apply first. Routes between first-principles-thinking, pattern-recognition, mental-models, constraint-awareness, and task-analysis by classifying the problem type. Activate before choosing any other foundational skill. Do NOT use to execute the selected approach (use the specific routed skill directly), for implementation work (use the relevant engineering skill), or when the correct approach is already known.

**When to use**
- I have a completely novel problem nobody has solved before — where do I start?
- the codebase has a recurring bug pattern — which foundational approach should I use?
- I need to explain a complex system to a stakeholder — which skill applies?
- I'm blocked by conflicting requirements that all seem equally valid — which approach first?
- the task feels overwhelming because there are too many parts — what's the right starting lens?
- a user is asking me to solve something I know a similar solution for but the details differ
- I don't know what I don't know about this problem — which foundational skill handles that?
- Triggers: `problem-approach-router`, `methodology-router`, `approach-router`

**Not for**
- actually apply first-principles thinking to this specific problem
- analyze why this pattern keeps recurring in the codebase
- break down the constraints on this engineering decision
- map the mental model for this domain concept
- implement the algorithm we already decided on
- choose a testing strategy for this feature

**Related skills**
- Related: `first-principles-thinking`, `pattern-recognition`, `mental-models`, `constraint-awareness`, `task-analysis`, `epistemic-grounding`, `taxonomy-design`

**Keywords**
- `which approach`, `which methodology`, `problem-solving method`, `select methodology`, `which skill first`, `approach selection`, `methodology dispatch`, `method router`, `first principles vs pattern`, `how to approach this problem`

<!-- skill-graph-context:end -->
