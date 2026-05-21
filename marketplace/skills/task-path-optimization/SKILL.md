---
name: task-path-optimization
description: "This skill provides decision frameworks for choosing the optimal execution path before starting work: plan-vs-act gates, agent architecture selection (chaining, routing, parallelization, orchestrator-worker, evaluator-optimizer), scope management heuristics, critical-path analysis across task networks, and context budget awareness. Use when deciding how to approach a task (plan first vs act immediately), decomposing complex work into parallelizable subtasks, choosing between subagent patterns, or when a task has failed twice and needs a fresh approach. Do NOT use for executing the chosen plan (use task-execution), debugging failures (use troubleshooting or diagnosis), or tool-level efficiency (use tool-call-strategy)."
metadata:
  schema_version: "7"
  version: "1.1.0"
  type: capability
  scope: portable
  category: agent
  eval_artifacts: present
  eval_state: passing
  routing_eval: present
  triggers: "[\"task-path-optimization\",\"execution-strategy\",\"approach-selection\"]"
  keywords: "[\"optimal path\",\"plan vs act\",\"task decomposition\",\"critical path\",\"parallelization strategy\",\"agent architecture\",\"scope management\",\"execution efficiency\",\"shortest path to solution\",\"when to plan\",\"when to act immediately\",\"fresh approach\",\"task complexity assessment\"]"
  examples: "[\"this task has failed twice, I need a fresh approach not another retry on the same path\",\"what is the shortest path to a solution here, plan vs act for this task\",\"assess this task's complexity and pick the lightest sufficient approach before I start\",\"is this work simple enough to just act, or should I plan the execution path first\"]"
  anti_examples: "[\"reduce the number of tool calls in this read-heavy step\",\"troubleshoot why the deployment keeps timing out\",\"execute the implementation plan we already agreed on\"]"
  owner: claude
  freshness: "2026-05-18"
  drift_check: "{\"last_verified\":\"2026-05-18\"}"
  layer: meta
  primaryCategory: Agent System
  layerPrimary: meta
  routingRole: primary
  comprehension_state: present
  mental_model: "Task path optimization is route planning before execution: classify the task shape, choose the lightest sufficient approach, sequence dependencies, isolate exploration when context would get polluted, and switch strategy after repeated failure instead of pushing harder on a bad path."
  purpose: "This skill prevents agents from either coding too soon on ambiguous work or over-planning simple work. It makes the execution path an explicit decision so planning, delegation, parallelization, review, and context reset are used only when the task shape justifies them."
  boundary: "This skill chooses the approach before execution. It does not execute the implementation, debug a concrete failure, optimize individual tool calls, manage Linear issue lifecycle, or record durable architecture decisions."
  analogy: "Task path optimization is like choosing a route before a trip: walking across the street needs no map, crossing a city needs traffic awareness, and crossing a mountain range needs checkpoints and fallback routes."
  misconception: "The common mistake is treating more process as safer. The safest path is the smallest path that still handles ambiguity, dependency, risk, and verification."
  relations: "{\"adjacent\":[\"task-lifecycle\",\"agents\",\"task-sizing\",\"sequential-thinking\",\"codebase-search\",\"task-execution\"],\"boundary\":[{\"skill\":\"tool-call-strategy\",\"reason\":\"tool-call-strategy owns tool-level efficiency such as reducing or batching individual tool calls; task-path-optimization owns the higher-level choice of execution approach\"},{\"skill\":\"diagnosis\",\"reason\":\"diagnosis owns systematic root-cause investigation of a concrete failure; task-path-optimization owns choosing the approach before work begins, not debugging a failure\"},{\"skill\":\"troubleshooting\",\"reason\":\"troubleshooting owns resolving a specific broken behavior; task-path-optimization owns selecting the execution path, not fixing a live fault\"},{\"skill\":\"spec-driven-development\",\"reason\":\"spec-driven-development owns writing and executing against a spec or plan; task-path-optimization owns the upstream plan-vs-act decision and approach selection, not executing the chosen plan\"}],\"verify_with\":[\"task-evaluation\",\"code-review\"]}"
  structural_verdict: UNVERIFIED
  truth_verdict: UNVERIFIED
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v7
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/agent/task-path-optimization/SKILL.md
---

# Task Path Optimization

## Concept Card

**What it is:** Task path optimization is the pre-execution discipline of choosing how to work before starting the work. It classifies task shape, risk, uncertainty, dependency structure, context cost, and review needs so the agent picks a direct edit, lightweight plan, exploration pass, parallel split, orchestrator-worker flow, evaluator-optimizer loop, or fresh-context recovery.

**Mental model:** Treat the task as a route-planning problem. The primitives are scope clarity, file certainty, dependency graph, risk/reversibility, context budget, parallelism, and failure history. The route is only optimal if its overhead is proportional to the work.

**Why it exists:** Agents waste time in two opposite ways: coding immediately when they do not understand the surface, or creating elaborate plans for one-line work. Naming the path decision prevents both failure modes and makes escalation deliberate.

**What it is NOT:** It is not task execution, debugging, tool-call optimization, Linear task lifecycle management, or architecture decision recording. It chooses the work path; adjacent skills perform the work, investigate failures, manage tasks, or document durable decisions.

**Adjacent concepts:** `task-lifecycle` shapes work into tasks, `task-execution` executes a chosen plan, `codebase-search` handles exploration mechanics, `tool-call-strategy` optimizes individual calls, and `diagnosis`/`troubleshooting` handle observed failures.

**One-line analogy:** Task path optimization is choosing whether you need no map, a route preview, a scout, a convoy, or a fresh start before the trip begins.

**Common misconception:** More planning is not automatically safer. The best path is the smallest sufficient path that still handles the task's actual uncertainty and risk.

## Domain Context

**What is this skill?** This skill provides decision frameworks for choosing the optimal execution path before starting work: plan-vs-act gates, agent architecture selection (chaining, routing, parallelization, orchestrator-worker, evaluator-optimizer), scope management heuristics, critical-path analysis across task networks, and context budget awareness. Use when deciding how to approach a task (plan first vs act immediately), decomposing complex work into parallelizable subtasks, choosing between subagent patterns, or when a task has failed twice and needs a fresh approach. Do NOT use for executing the chosen plan (use task-execution), debugging failures (use troubleshooting or diagnosis), or tool-level efficiency (use tool-call-strategy).

## Key Files

| File | Purpose |
|---|---|
| `.claude/commands/workflow/experiment.md` | Sequential Verify -> Design -> Re-verify workflow; concrete prompt-chaining example. |
| `scripts/model/model-router.js` | Live routing surface that classifies task text and labels into model lanes. |
| `scripts/loop/dispatch-solver.js` | One-shot and wave dispatch surface; shows background dispatch and dependency-wave execution. |
| `scripts/task/task-helpers.js` | Queue, wave, effort, prompt, AC, packet, and continuation helpers used by task workflows. |
| `scripts/loop/dispatch-loop.sh` | Parallel loop dispatch surface with status, budget gates, steering, and harvest behavior. |
| `scripts/agent/spawn-batch.sh` | Concurrency-limited batch spawner; documents reliability tradeoffs as agent count rises. |
| `.claude/agents/task-manager.md` | Manage-tier delegation agent; concrete orchestrator-worker handoff contract. |
| `scripts/analytics/session-scorecard.js` | Local measurement surface for tool efficiency, context discipline, verification, handoff, and session health. |

## Coverage

Decision frameworks for choosing the optimal execution path: complexity-first triage, plan-vs-act gates, five agent architecture patterns (prompt chaining, routing, parallelization, orchestrator-worker, evaluator-optimizer), scope management heuristics, critical-path analysis, context budget awareness, recovery from failed approaches, and the Writer/Reviewer pattern for high-risk quality assurance.

## Philosophy

The shortest path between a problem statement and a working solution is rarely a straight line, but it is always a deliberate choice. Agents default to "start coding immediately" or "plan everything exhaustively" — both waste time depending on context. This skill exists because the decision of *how* to approach a task is separate from the act of executing it, and getting the approach wrong costs more than the approach selection itself. A 30-second triage that correctly identifies "act immediately" saves 10 minutes of unnecessary planning. A 2-minute plan on a complex task prevents 30 minutes of wrong-direction implementation. The key insight: match the weight of your approach to the weight of the problem.

> **Authority:** Owns the pre-execution decision: what approach to use, how to decompose work, when to parallelize, when to start over. Defers to `task-execution` for executing the chosen plan and `tool-call-strategy` for individual tool call efficiency.

---

## 1. Complexity-First Triage

Before touching any code, assess task complexity to determine approach weight.

| Complexity Signal | Approach | Rationale |
|---|---|---|
| Can describe the diff in one sentence | **Act immediately** | Planning overhead exceeds implementation cost |
| Single file, clear scope, known pattern | **Act with lightweight verification** | Low risk of cascading side effects |
| Multiple files, unclear interfaces | **Plan first, then implement** | Need to understand module boundaries before committing |
| Unfamiliar codebase area, architectural implications | **Explore, plan, implement** (3-phase) | Understanding precedes strategy |
| Open-ended or ambiguous requirements | **Clarify, then plan** | Wrong problem = wasted work regardless of execution quality |
| Previously failed twice | **Clear context, fresh approach** | Context pollution degrades performance geometrically |

**Rule:** If you could describe the diff in one sentence, skip the plan. If you can't name the files you'll change, you're not ready to plan — you need to explore first. The concrete exploration paths are: `task-researcher` (key-files + RIPER sections), `codebase-search` (Glob/Grep/Read decision tree), and the RIPER mode escalation path (Read → Identify → Plan → Execute → Review) documented in `task-researcher`. Use `task-researcher` as the subagent when exploration should happen in an isolated context.

---

## 2. The Plan-vs-Act Decision Gate

```
Is the task scope clear and the fix small?
  YES --> Act immediately (commit to execution path)
  NO  --> Is the execution path predictable (known files, known pattern)?
            YES --> Lightweight plan (list files + changes, then execute)
            NO  --> Is it exploratory or research-oriented?
                      YES --> Explore-Plan-Execute (3-phase, use RIPER)
                      NO  --> Orchestrator-Worker (dynamic decomposition with subagents)
```

### Decision signals

| Signal | Points toward ACT | Points toward PLAN |
|---|---|---|
| Number of files | 1-2 files | 3+ files |
| Pattern exists in codebase | Yes, copy from neighbor | No precedent |
| Risk of regression | Low (isolated change) | High (shared boundary) |
| Reversibility | Easy (one commit to revert) | Hard (schema migration, API contract) |
| Ambiguity | Clear requirement | Ambiguous or conflicting signals |
| Prior failures on this task | 0 | 1+ (need fresh strategy) |

---

## 3. Five Agent Architecture Patterns

Choose the right pattern for the task shape. Anthropic's "Building effective agents" recommends starting with simple composable patterns and adding complexity only when it improves outcomes.

| Pattern | Status In This Repo | Task Shape | When to Use | Concrete repo anchor |
|---|---|---|---|---|
| **Prompt Chaining** | **Conceptual framing** — present as command/phase design, not a named runtime primitive | Sequential fixed steps | Clear stages where output of A feeds B | `/experiment` Phase 1 -> 2 -> 3 in `.claude/commands/workflow/experiment.md` |
| **Routing** | **Live infra** | Distinct categories need different treatment | Input classification determines handler | `scripts/model/model-router.js`, `scripts/loop/dispatch-solver.js`, `scripts/task/task-helpers.js` |
| **Parallelization** | **Live infra** | Independent subtasks or multi-perspective | Work can be sectioned; voting improves confidence | `scripts/loop/dispatch-loop.sh`, `scripts/agent/spawn-batch.sh`, parallel tool execution |
| **Orchestrator-Worker** | **Live infra** | Subtasks can't be predicted in advance | Dynamic decomposition needed | `.claude/agents/task-manager.md`, `/workflow/manage`, `scripts/task/task-helpers.js` |
| **Evaluator-Optimizer** | **Mixed** — live in a few concrete loops, otherwise a conceptual quality pattern | Iterative refinement measurably improves output | Quality is gradable and loopable | `/experiment` judge flow in `.claude/commands/workflow/experiment.md`; task-manager critic gate references `task-critic.js` even though that implementation is not currently present in this repo |

**Foundational principle:** Start with the simplest pattern that could work. Only increase complexity when the simpler pattern demonstrably fails.

### How to read the status column

- **Live infra** means the pattern exists as a concrete script, command, or runtime surface in this repo today.
- **Conceptual framing** means the pattern is useful for thinking about execution shape, but it is not exposed as a named shared runtime primitive.
- **Mixed** means part of the pattern is implemented in a specific workflow, while the generalized pattern is still guidance rather than reusable infrastructure.

### Pattern selection flowchart

```
Are all steps known in advance?
  YES --> Are they independent?
            YES --> Parallelization
            NO  --> Prompt Chaining
  NO  --> Does the task have distinct categories?
            YES --> Routing
            NO  --> Can quality be measured and iterated?
                      YES --> Evaluator-Optimizer
                      NO  --> Orchestrator-Worker
```

---

## 4. Scope Management Heuristics

Scope creep is the primary cause of task failure in agent workflows. These rules prevent it.

### Before starting

1. **Name the deliverable.** One sentence: "When this is done, [X] will work."
2. **List the files.** If you can't name the files, you need exploration, not execution. Use `task-researcher` (subagent) or `codebase-search` (direct Glob/Grep/Read) to explore; RIPER mode (`task-researcher` key-files → overview) is the structured escalation path.
3. **Set the boundary.** "I will NOT touch [Y] even if I see issues."
4. **Define success evidence.** A command, test, or screenshot that proves completion.

### During execution

5. **One task per context.** Never mix unrelated work in the same session.
6. **Adjacent issues go to Linear.** If you find a bug while fixing another bug, file it — don't fix it now unless it blocks you.
7. **Two-failure rule.** After two failed corrections on the same approach, stop. The approach is wrong, not the details. Clear context, rethink strategy.
8. **Context pollution compounds.** Each failed attempt adds noise. After the two-failure threshold, `/clear` and restart with lessons learned baked into the initial prompt.

### After completion

9. **Verify against the original deliverable.** Not "does the code work" but "does it satisfy the one-sentence deliverable from step 1."
10. **Capture the path.** If the optimal path was non-obvious, document it for future agents.

---

## 5. Critical Path Analysis

When a task decomposes into subtasks, identify the critical path — the longest chain of dependent subtasks that determines total completion time.

### Dependency classification

| Dependency Type | Can Parallelize? | Example |
|---|---|---|
| **Data dependency** (A's output feeds B) | No | Migration must complete before seed script |
| **Resource dependency** (A and B need same file) | No (merge conflicts) | Two features modifying the same component |
| **Order dependency** (A must run before B by convention) | Maybe | Tests after implementation (but lint can run in parallel) |
| **Independent** (no shared state) | Yes | Frontend and backend changes for the same feature |

### Parallelization decision

```
For each pair of subtasks:
  Do they share any files?
    YES --> Sequential (or use worktree isolation)
    NO  --> Do they share state (DB, env, running server)?
              YES --> Sequential
              NO  --> Parallel (use subagents)
```

### Optimal ordering rules

1. **Start with the riskiest subtask.** If it fails, you learn early before investing in dependent work.
2. **Parallelize verification.** Typecheck, lint, and test can almost always run in parallel.
3. **Front-load exploration.** Read and understand before writing — reduces wrong-direction time.
4. **Batch similar changes.** Five similar file edits are faster as one scripted batch than five individual tool calls.

---

## 6. Context Budget Awareness

Context is a finite resource. Every file read, every command output, every tool call result consumes it. Performance degrades as context fills.

### Context-efficient patterns

| Pattern | Why It Saves Context |
|---|---|
| Grep before Read | Matching lines only vs entire file |
| Subagents for exploration | Explore in separate context, report back summary |
| Scripts for bulk operations | One command result vs N individual results |
| `/clear` between unrelated tasks | Prevents cross-contamination |
| Targeted reads (offset + limit) | Read 50 lines around the function, not the 2000-line file |

### Context-expensive anti-patterns

| Anti-Pattern | Context Cost | Fix |
|---|---|---|
| Reading entire files to find one function | High | Grep for function name, read only that section |
| Keeping failed approach context | Compounds | `/clear` after two failures |
| Running full test suite output in context | Very high | Run in background, check exit code |
| Exploring without scope | Unbounded | Set a file/directory boundary before exploring |

---

## 7. Recovery: When the Current Approach Fails

Not every approach works. Recognizing failure early and switching cleanly is a skill.

### Failure signals

- Same error after two different fix attempts
- Fix introduces new failures in unrelated areas
- Realization that the mental model of the system was wrong
- Context is polluted with multiple failed approaches

### Recovery protocol

1. **Stop.** Do not make a third attempt on the same approach.
2. **Commit or stash** any partial progress worth keeping.
3. **Clear context** (`/clear` or spawn a fresh subagent).
4. **Write a one-paragraph brief** that includes: what was tried, why it failed, what the new hypothesis is.
5. **Start the new approach** from the brief, not from memory of the failed attempt.

### The Writer/Reviewer pattern

For high-stakes tasks, use two separate contexts:
- **Writer context:** Implements the solution
- **Reviewer context:** Reviews with fresh eyes (no implementation bias)

This pattern catches errors that the writer's context has normalized. Use it for security changes, architectural decisions, and any task where correctness matters more than speed.

---

## 8. The METR Finding

External research from METR (2025) reported that experienced open-source developers in its randomized controlled trial took 19% longer with early-2025 AI tools, despite expecting a 24% speedup. Treat that result as a caution about hidden coordination, review, and quality-standard overhead — not as a measured truth about this repo's own agent system, and not as a universal claim that AI tools slow all developers.

For repo-specific overhead, check local measurement surfaces instead of borrowing the METR number as if it were native telemetry:
- `scripts/analytics/session-scorecard.js` and the generated session score artifacts
- `scripts/model/usage-collector.js` and `USAGE.md`
- task-level runtime evidence such as verification receipts, wrap summaries, and per-command loop outcomes

**Implication for this skill:** The optimal path is NOT "let the agent do everything." It is knowing:
- When to let the agent work autonomously (clear scope, known pattern)
- When to decompose into smaller agent-sized chunks (complex but parallelizable)
- When to take over manually (agent is looping, context is polluted)
- When to use the agent as a reviewer rather than an implementer

## 9. Source Notes

| Claim | Evidence |
|---|---|
| Use simple composable agent patterns before adding complexity. | Anthropic, "Building effective agents" (2024): start with simple solutions and add agentic complexity only when needed. |
| Prompt chaining, routing, parallelization, orchestrator-workers, and evaluator-optimizer are standard agentic workflow patterns. | Anthropic, "Building effective agents" sections on workflow patterns. |
| Early-2025 AI slowed experienced open-source developers in one RCT by 19% despite expected speedup. | METR, "Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity" (2025). |
| Local overhead should be measured locally, not inferred from external studies. | `scripts/analytics/session-scorecard.js` and `scripts/model/usage-collector.js` provide repo-local measurement surfaces. |

---

## Verification

After applying this skill, verify:
- [ ] I assessed task complexity before choosing an approach
- [ ] I can name the specific files I will change
- [ ] I defined the deliverable in one sentence
- [ ] I chose the simplest agent pattern that fits the task shape
- [ ] I identified parallelizable subtasks and ran them concurrently where possible
- [ ] I did not mix unrelated work in the same context
- [ ] If an approach failed twice, I cleared context and started fresh

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Executing a known plan with clear subtasks | `task-execution` | This skill chooses the approach; task-execution runs it |
| Debugging a specific failure | `troubleshooting` or `diagnosis` | Debugging is reactive investigation, not approach selection |
| Optimizing individual tool calls | `tool-call-strategy` | This skill operates at the task level; tool-call-strategy operates at the call level |
| Breaking work into Linear tasks | `task-lifecycle` or `task-sizing` | This skill is about execution strategy, not project management |
| Choosing between technical architectures | `adr` | ADRs are about permanent architectural decisions, not ephemeral execution paths |

---

*Version 1.0.0 — 2026-04-02. Based on Anthropic's "Building Effective Agents" research, METR efficiency findings, and repo-specific execution patterns.*
