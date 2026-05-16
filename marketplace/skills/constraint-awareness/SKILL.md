---
name: constraint-awareness
description: "Use when prioritizing work in an AI-assisted codebase, designing agent autonomy levels, deciding what to automate vs keep manual, or evaluating whether a process/tool adds value. Covers Theory of Constraints for AI-era engineering: cheap code production, human review/validation/decision bottlenecks, Five Focusing Steps, constraint-aware process design, attention audits, and constraint-shift modeling. Do NOT use for task-effort estimation, backlog scoring with RICE/WSJF/ICE, or routing a task to a specific model."
license: MIT
compatibility: "Operating-model-agnostic. Applies whether the constraint is a single solo developer operating multiple agents, a small team where one senior engineer reviews everything, or a larger team where review capacity is the limiting factor. The framework adapts as the constraint identity changes."
allowed-tools: Read Grep
metadata:
  schema_version: "4"
  version: "1.1.0"
  type: capability
  category: foundations
  domain: foundations/strategy
  scope: portable
  owner: skill-graph-maintainer
  freshness: "2026-05-16"
  drift_check: "{\"last_verified\":\"2026-05-16\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  comprehension_state: present
  stability: experimental
  keywords: "[\"theory of constraints\",\"goldratt five focusing steps\",\"bottleneck identification\",\"constraint of an ai-coding system\",\"human attention as constraint\",\"cost structure inversion ai\",\"what to automate vs keep manual\",\"batch decisions not interrupt\",\"options not questions\",\"constraint-aware process design\",\"attention budget\",\"reduce demand on the bottleneck\",\"elevate the constraint\",\"subordinate to the constraint\",\"constraint shift over time\",\"rework rate as constraint signal\",\"false dependency on the human\",\"over-engineering anti-pattern constraint\"]"
  examples: "[\"we keep adding tooling and the agent throughput isn't going up — what TOC step are we missing?\",\"should this approval gate stay in the loop or be replaced by an automated check?\",\"the agents keep asking me clarifying questions and I'm answering 30 a day — what's the structural fix?\",\"we're considering a 4-model review panel on every architectural decision — does that subordinate to or overload the constraint?\",\"code production used to be the bottleneck; what does the new bottleneck look like once agents do all the typing?\",\"is this proposed automation a constraint-elevator or a non-constraint optimization that won't move throughput?\",\"the rework rate climbed from 12% to 24% over the quarter — which constraint step does that point at?\"]"
  anti_examples: "[\"what's the ICE / RICE score for this initiative against five others\",\"estimate the effort tier for this ticket\",\"route this debugging task to the cheapest model that can solve it\",\"review this AI-generated PR for correctness\",\"design the production reliability layer for our agent system\"]"
  relations: "{\"boundary\":[{\"skill\":\"ai-native-development\",\"reason\":\"ai-native-development is the conceptual frame for AI-coding (eras, autonomy slider, vibe vs agentic); constraint-awareness is the prioritization lens applied within that frame\"},{\"skill\":\"agent-engineering\",\"reason\":\"agent-engineering owns production reliability patterns (orchestration, error budgets, observability); constraint-awareness owns *which* of those to invest in based on where the bottleneck currently is\"},{\"skill\":\"code-review\",\"reason\":\"code-review evaluates one piece of work; constraint-awareness reasons about whether the review gate itself is the bottleneck\"},{\"skill\":\"tool-call-strategy\",\"reason\":\"tool-call-strategy decides per-action which tool an agent calls; constraint-awareness decides per-process whether that whole class of action should require human intervention at all\"}],\"related\":[\"ai-native-development\",\"agent-engineering\",\"code-review\"]}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":365,\"review_cadence\":\"quarterly\"}"
  concept: "{\"definition\":\"Constraint awareness is the discipline of identifying the single resource that limits a system's throughput at any given time, and routing all improvement work through that resource. Drawn from Eliyahu Goldratt's Theory of Constraints (1984), it treats systems as throughput pipelines whose total output is bounded by their narrowest section — and treats local optimization of non-constraints as effort that produces no system-level gain.\",\"mental_model\":\"|\",\"purpose\":\"|\",\"boundary\":\"|\",\"taxonomy\":\"|\",\"analogy\":\"|\",\"misconception\":\"|\"}"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v4
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/constraint-awareness/SKILL.md
---

# Constraint Awareness

## Coverage

Theory-of-Constraints (Goldratt) applied to the cost-structure inversion of AI-assisted software development. Identifies the constraint as the human activity that cannot be delegated to an agent — review, validation, decision-making, learning. Walks the Five Focusing Steps (Identify, Exploit, Subordinate, Elevate, Repeat) and shows how each step maps to a team operating multiple coding agents. Names the four constraint-aware process-design rules: front-load agent work and back-load human judgment; batch constraint touches; present options + recommendation rather than open questions; eliminate false dependencies on the constraint by promoting recurring questions into rules or skills. Catalogs five anti-patterns (unnecessary questions, spawning without consent, summaries nobody reads, over-engineering with maintenance debt, circular discussions). Specifies attention-audit ratios for measuring constraint health. Explains the constraint-shift model — that the bottleneck moves over time as agent autonomy improves, from review bandwidth → strategic decisions → user research → market timing — and that the focusing steps must restart when it does.

## Philosophy

Most AI-coding systems fail not because the agents are incapable, but because they waste the one resource that cannot be scaled: the human operator's attention. Without explicit constraint-awareness, agents treat all tasks as equal-priority, interrupt the operator with questions they could have answered themselves, and produce verbose output nobody reads. Theory of Constraints turns this into a tractable engineering problem rather than a vague productivity complaint: identify the constraint, route work around it, invest only in changes that genuinely move it.

The single sharpest insight TOC offers an AI-coding team is the _cost-structure inversion_. Pre-AI, code production was the dominant cost — every feature took hours of typing, every test took hours of writing. Post-AI, code production is nearly free; an agent can produce ten thousand lines in minutes. The bottleneck has moved entirely to the activities that cannot be delegated: reviewing whether the agent's output is correct, deciding what to build next, validating that the system matches user reality, and learning from outcomes. Every team optimization should now be evaluated through one question: does this reduce demand on the constraint?

## 1. Goldratt's Theory of Constraints

Eliyahu Goldratt's TOC states that every system has exactly one constraint that limits its throughput. Improving anything other than the constraint does not improve the system. Overloading the constraint degrades the entire system.

### The Five Focusing Steps

1. **IDENTIFY the constraint.** What single resource currently limits system throughput? In an AI-coding team, this is almost always a class of _human_ activity, not a class of _agent_ activity.
2. **EXPLOIT the constraint.** Maximize the value of every minute of constraint-time. Never waste it on work the constraint shouldn't be touching.
3. **SUBORDINATE everything else to the constraint.** Non-constraint resources (agents, automation, tooling) exist to _serve_ the constraint, not the other way around. Their schedules, outputs, and APIs should be shaped around the constraint's needs.
4. **ELEVATE the constraint.** Invest in increasing the constraint's capacity — better tooling, better skills, higher agent autonomy, better pre-review.
5. **REPEAT.** When the constraint moves (and it will), restart from step 1. The subordination rules change.

### The map for an AI-coding team

| Focusing step   | Applied to a team operating coding agents                                                                                                                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **IDENTIFY**    | The constraint is the senior reviewer's / architect's / product-owner's attention — review bandwidth, validation, decision-making, learning.                                                                                 |
| **EXPLOIT**     | Only surface decisions to the constraint that genuinely require human judgment. Every constraint-minute should produce maximum value.                                                                                        |
| **SUBORDINATE** | Agents do all work that does not require the constraint: building, testing, auditing, documenting, researching, comparing options, drafting recommendations.                                                                 |
| **ELEVATE**     | Better tools, better agent autonomy, better skill / context content, better memory across sessions = less demand on the constraint per unit of throughput.                                                                   |
| **REPEAT**      | Once agent autonomy is high enough, the constraint may move from review to strategic decisions, then to user research, then to market timing. The processes that served the old constraint may be irrelevant to the new one. |

## 2. The Constraint Shift — When Building Becomes Cheap

The AI revolution changes the cost structure of software development. Understanding this inversion is essential for correct prioritization.

### Pre-AI cost structure

```
Code production    [=============================]  HIGH    (hours per feature)
Code review        [=================]              MEDIUM  (~30 min per PR)
Testing            [=================]              MEDIUM  (hours per test suite)
Documentation      [===========]                    MEDIUM  (often skipped)
Decision-making    [=======]                        LOW     (fast, drawn from experience)
```

### Post-AI cost structure

```
Code production    [===]                            CHEAP   (minutes per feature; agent-generated)
Code review        [=================]              MEDIUM  (still requires human judgment)
Testing            [========]                       LOW     (agents write tests; CI runs them)
Documentation      [===]                            CHEAP   (agents write docs alongside code)
Decision-making    [=============================]  HIGH    (more decisions, faster, higher stakes)
```

The inversion: code production was the bottleneck; now it is nearly free. The bottleneck moved to the human activities that cannot be delegated — review, validation, deciding, learning.

### Implications for prioritization

| Activity                          | Cost           | Who does it                           | Constraint impact              |
| --------------------------------- | -------------- | ------------------------------------- | ------------------------------ |
| Writing code                      | Nearly free    | Agents                                | None                           |
| Writing tests                     | Nearly free    | Agents                                | None                           |
| Writing docs                      | Nearly free    | Agents                                | None                           |
| Codebase audits                   | Nearly free    | Agents                                | None                           |
| Research & comparison             | Cheap          | Agents draft; human reads conclusions | Low                            |
| Design decisions                  | Expensive      | Human (agents prepare options)        | HIGH                           |
| Bug triage and prioritization     | Expensive      | Human                                 | HIGH                           |
| Code review                       | Medium         | Agents pre-review; human spot-checks  | MEDIUM (reduced by pre-review) |
| User research / market validation | Very expensive | Human only                            | VERY HIGH                      |

## 3. The Constraint Lens — One Question for Every Decision

Every proposed process, tool, and workflow should be evaluated with one question:

> Does this reduce demand on the constraint?

### Decision framework

```
Proposed change / process / tool
        │
        ▼
Does it reduce decisions the constraint must make?
        │
       YES → Subordinates to the constraint. APPROVE.
        │
       NO
        ▼
Does it improve the *quality* of decisions presented to the constraint?
        │
       YES → Exploits the constraint (more value per attention-minute). APPROVE.
        │
       NO
        ▼
Does it create *new* demands on the constraint?
        │
       YES → REJECT or REDESIGN. It overloads the constraint.
        │
       NO
        ▼
Does it improve a non-constraint resource (agent speed, CI time, lint pass-rate)?
        │
       YES → Low priority. Only do if free. It will not move throughput.
        │
       NO  → No value. Do not build.
```

The first three branches are the test that matters. A change that does not reduce demand on the constraint, does not improve decision quality, and does not introduce new demands is by definition optimizing a non-constraint — and per TOC, optimizing a non-constraint does not improve the system.

## 4. Constraint-Aware Process Design

When designing any new process, workflow, or tool, apply these four rules:

### 4.1 Front-load agent work; back-load human judgment

```
BAD:  human decides → agent builds → human reviews → agent fixes → human reviews
GOOD: agent researches → agent builds → agent tests → agent pre-reviews → human spot-checks
```

The bad pattern touches the constraint three times. The good pattern touches it once.

### 4.2 Batch constraint touches

Instead of interrupting the constraint with each decision:

```
BAD:  agent asks question 1 → human answers → agent asks question 2 → human answers → ...
GOOD: agent collects all questions → presents them in one batch → human answers all at once
```

Context-switching is expensive for the constraint. Batching decisions reduces switching cost dramatically.

### 4.3 Present options + recommendation, not open questions

```
BAD:  "How should we handle the edge case where the upstream API returns null for the tracking field?"
GOOD: "Upstream null tracking — three options:
       A) Retry in 6h. Covers ~80% of cases (the upstream is usually catching up).
       B) Mark as manual-check. Zero false positives but increases human queue.
       C) Fall back to a secondary tracking source. Works for ~60% of orders.
       Recommendation: A. Approve?"
```

The bad pattern requires the constraint to _generate_ the solution. The good pattern requires only a yes/no judgment.

### 4.4 Eliminate false dependencies on the constraint

Some tasks that _seem_ to require the constraint actually do not:

| Looks like it needs human approval              | Actually                                  | Promote to                                       |
| ----------------------------------------------- | ----------------------------------------- | ------------------------------------------------ |
| "Should I fix this lint error?"                 | Always yes                                | Rule / agent default                             |
| "This test is failing — should I investigate?"  | Always yes                                | Rule / agent default                             |
| "Should I update the docs for this change?"     | Always yes                                | Rule / agent default                             |
| "Is this the right pattern for error handling?" | If a documented pattern exists, follow it | Skill content; only ask when genuinely ambiguous |
| "Should I report this bug somewhere?"           | Always yes                                | Rule / agent default                             |

If the answer is _always the same_, it should live in a rule or skill, not in a question to the constraint.

## 5. Anti-Patterns That Waste the Constraint

### 5.1 Unnecessary questions

Agents asking questions they could answer from already-loaded context. Every question consumes constraint bandwidth.

**Fix:** better skill content, better rules, higher agent autonomy within defined guardrails. Promote recurring questions to skills until they stop recurring.

### 5.2 Spawning without consent

Spawning agents, tabs, or processes without an explicit user signal. Forces context-switching and creates an interruption — overloading the constraint.

**Rule:** never spawn without an explicit signal from the constraint, and always make the spawned process visible (not background, not silent).

### 5.3 Summaries nobody reads

Producing verbose summaries at the end of every response. If the diff is readable, the summary is waste.

**Rule:** terse responses. The diff is the summary. Only elaborate when the change is non-obvious from the diff alone.

### 5.4 Over-engineering that creates maintenance debt

Building sophisticated abstractions that require ongoing constraint-attention to maintain. Every abstraction layer is a future demand on the constraint.

**Test:** "Will this abstraction save more constraint-time over its lifetime than it costs to maintain?" If no, keep it simple. The simplest design that passes the constraint lens wins.

### 5.5 Circular discussions

Multi-agent debates that produce no actionable output. Re-litigating settled decisions because the prior decision was not durably recorded.

**Fix:** check decision records / memory before re-debating. If a decision was already made, execute it; do not reopen it without new information.

## 6. Measuring Constraint Health

### 6.1 Attention audit

Periodically review where constraint-attention actually went. Healthy and unhealthy ranges:

| Category                            | Healthy share | Unhealthy signal                                       |
| ----------------------------------- | ------------- | ------------------------------------------------------ |
| Reviewing agent output              | 30–40%        | > 50% means agents need more autonomy                  |
| Making design / product decisions   | 20–30%        | < 10% means agents are making decisions they shouldn't |
| Debugging agent failures            | 5–10%         | > 20% means skill or context content is incomplete     |
| Answering agent questions           | 5–10%         | > 15% means rules / skills are incomplete              |
| Administrative overhead             | < 10%         | > 20% means processes need automation                  |
| Learning / user research / strategy | 15–25%        | < 10% means the constraint is consumed by operations   |

### 6.2 Constraint throughput

Measure tasks completed per unit of constraint-time:

```
constraint efficiency = tasks completed / constraint-hours spent
```

This number should increase over time as agents become more autonomous and skills become more complete. A flat or declining trend is a signal that the elevation work has stalled.

### 6.3 Leading indicators

| Indicator                           | Measures                                                | Healthy target |
| ----------------------------------- | ------------------------------------------------------- | -------------- |
| Agent autonomous-completion rate    | % of tasks agents finish without asking                 | > 80%          |
| Skill / context-injection precision | % of injected context that was actually relevant        | > 80%          |
| Rework rate                         | % of agent work needing human correction                | < 15%          |
| Decision batch size                 | Average number of decisions per constraint interruption | > 5            |

## 7. When the Constraint Moves

The constraint is not permanently fixed. As agent autonomy improves, the bottleneck shifts:

| Current constraint           | What elevates it                                                            | New constraint                                                              |
| ---------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Review bandwidth             | Better agent pre-review, automated quality gates, tripwire safety           | Strategic decision bandwidth                                                |
| Strategic decision bandwidth | Multi-model decision-support, better research agents                        | User research (cannot automate talking to actual users)                     |
| User research                | AI-assisted user research, synthetic personas, automated interview analysis | Market timing / GTM execution                                               |
| Market timing / GTM          | Capital, distribution partners                                              | A _resource_ constraint (capital, headcount), not a _throughput_ constraint |

When the constraint moves, the Five Focusing Steps restart from step 1. The processes that served the old constraint may now be irrelevant or actively counterproductive. Subordination targets change. The team's _job_ changes.

## Verification

- [ ] The current system constraint has been explicitly identified, named, and agreed on
- [ ] Every proposed process, tool, or workflow change has been evaluated against the constraint decision framework before being adopted
- [ ] Agent-autonomous tasks are scheduled first; constraint-touching tasks are batched into a small number of structured surfaces (review, decision)
- [ ] When agents present a decision to the constraint, they present options + recommendation, not an open question
- [ ] Recurring questions have been promoted to rules or skills until they stop recurring
- [ ] Attention-audit ratios are within the healthy bands; outliers have a known cause and an active elevation action
- [ ] The team has named what would cause the constraint to _move_ and what the next constraint is likely to be

## Do NOT Use When

| Use instead                                          | When                                                                                                                                                                |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A task-sizing skill                                  | Estimating effort tier or fast-track-vs-full-protocol for a single task                                                                                             |
| A prioritization-framework skill (RICE / WSJF / ICE) | Scoring a backlog of initiatives against each other                                                                                                                 |
| A model-routing / `agents` skill                     | Deciding which AI model gets a specific task                                                                                                                        |
| `agent-engineering`                                  | Designing the production-reliability layer (orchestration, error budgets, observability)                                                                            |
| `ai-native-development`                              | Reasoning about the conceptual model (Software 3.0, autonomy slider, vibe vs agentic) — that's the frame; constraint-awareness is the prioritization lens within it |
| `tool-call-strategy`                                 | Choosing the right tool, batching, or sequencing for a single agent action                                                                                          |
| `code-review`                                        | Reviewing an actual piece of agent-generated code                                                                                                                   |

## Key Sources

- Goldratt, E. M., & Cox, J. (1984). *The Goal: A Process of Ongoing Improvement*. North River Press. The original business-novel introduction of the Theory of Constraints and the Five Focusing Steps. The plant-floor parable formalizes the throughput / inventory / operating-expense triple.
- Goldratt, E. M. (1990). *Theory of Constraints*. North River Press. The non-fiction follow-up; canonical statement of the focusing-steps protocol, Drum-Buffer-Rope scheduling, and the Thinking Processes (Current Reality Tree, Evaporating Cloud, Future Reality Tree).
- Goldratt, E. M. (1997). *Critical Chain*. North River Press. Application of constraint logic to project scheduling; buffer management as a substitute for per-task safety padding.
- Cox, J. F., & Schleier, J. G. (Eds.). (2010). *Theory of Constraints Handbook*. McGraw-Hill. Comprehensive reference; covers Throughput Accounting, the Thinking Processes, application domains beyond manufacturing.
- Womack, J. P., & Jones, D. T. (1996). *Lean Thinking*. Simon & Schuster. The complementary Lean discipline; useful for understanding the composition rule between Lean (waste reduction across the stream) and TOC (constraint-first prioritization).
- Reinertsen, D. G. (2009). *The Principles of Product Development Flow*. Celeritas. Flow-based product development; queueing theory and WIP constraints connect Theory of Constraints to knowledge-work systems beyond manufacturing.
