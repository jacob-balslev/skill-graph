---
name: agent-engineering
description: "Use when designing or evaluating a production AI agent system, choosing a multi-agent coordination pattern (orchestrator/worker, fan-out, consensus, sequential chain, evaluator/optimizer), diagnosing coordination failures (claim races, silent stalls, context contamination, runaway loops), or auditing whether an agent loop is truly production-ready. Covers the four pillars (architecture and lifecycle, task decomposition, coordination patterns, production reliability), the six reliability requirements (observability, cost budgets, idempotency, failure recovery, safety caps, claim locks), the delegation decision framework with overhead crossover, and the most common anti-patterns. Do NOT use for prompt wording (use `prompt-craft`), per-call tool efficiency (use `tool-call-strategy`), context-stack design within a single agent (use `context-engineering`), or runtime debugging of a deployed system (use `debugging`). Do NOT use for improve this prompt's wording to get better outputs."
license: MIT
compatibility: "Provider- and harness-agnostic. Patterns apply across Claude Code, Cursor, Copilot, OpenCode, Aider, Continue, custom Anthropic/OpenAI/Google SDK loops, and self-hosted multi-agent systems. Specific filenames in this skill (continuation.json, claim.lock, session-logs.jsonl) are example artefacts -- substitute your harness's equivalents."
allowed-tools: Read Grep Bash Edit Write
metadata:
  relations: "{\"related\":[\"context-engineering\",\"tool-call-strategy\",\"debugging\",\"context-window\",\"summarization\",\"prompt-craft\"],\"suppresses\":[\"architecture-decision-records\"],\"verify_with\":[\"testing-strategy\",\"code-review\"]}"
  subject: software-architecture
  subjects: "[\"software-architecture\",\"ai-engineering\"]"
  scope: "Designing and evaluating production AI agent systems — multi-agent coordination patterns (orchestrator/worker, fan-out, consensus, sequential chain, evaluator/optimizer), the four pillars (architecture/lifecycle, task decomposition, coordination, production reliability), the six reliability requirements (observability, cost budgets, idempotency, failure recovery, safety caps, claim locks), the delegation decision framework with overhead crossover, and coordination-failure diagnosis (claim races, silent stalls, context contamination, runaway loops). Portable across any agent runtime; principle-grounded, not repo-bound. Excludes prompt wording (prompt-craft), per-call tool efficiency (tool-call-strategy), single-agent context-stack design (context-engineering), and runtime debugging of a deployed system (debugging)."
  public: "true"
  taxonomy_domain: ai-engineering/architecture
  stability: experimental
  keywords: "[\"agent engineering\",\"agentic engineering\",\"multi-agent systems\",\"production agent system\",\"orchestration patterns\",\"orchestrator worker\",\"fan-out merge\",\"consensus pattern\",\"evaluator optimizer\",\"sequential chain\"]"
  examples: "[\"we want to fan out 40 classification subtasks to subagents — what coordination pattern should we use and what are the failure modes?\",\"two of our agents claimed the same task and produced duplicate PRs — what atomicity guarantee prevents this?\",\"the orchestrator burns 6x the budget we planned every Tuesday — where do we add cost visibility and caps?\",\"an agent loop ran for four hours without progress before anyone noticed — how do we detect silent stalls?\",\"we keep getting context-contamination bugs where agent B uses stale output from agent A's failed run — fix the protocol\",\"audit this agent loop and tell me whether it's production-ready or still a demo\",\"is consensus-of-three worth the 3x cost for security-critical decisions, or is two-pass cheaper and good enough?\",\"design the lifecycle for a long-running autonomous agent that survives crashes mid-task\"]"
  anti_examples: "[\"improve this prompt's wording to get better outputs\",\"the agent made 17 read calls when 3 greps would have done\",\"design what skills get loaded for which prompts\",\"scaffold a new SKILL.md for our orchestration runbook\",\"review this AI-generated PR for correctness\",\"the test suite is failing after my change — find the cause\",\"draft an architecture note explaining why we chose Postgres\"]"
  grounding: "{\"subject_matter\":\"Production AI agent system architecture and multi-agent coordination\",\"grounding_mode\":\"hybrid\",\"truth_sources\":[\"https://www.anthropic.com/engineering/building-effective-agents\",\"https://www.anthropic.com/engineering/multi-agent-research-system\",\"https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents\",\"https://openai.github.io/openai-agents-python/tracing/\",\"https://arxiv.org/abs/2308.08155\"],\"failure_modes\":[\"coordination_pattern_mismatch\",\"unbounded_agent_loop\",\"missing_observability\",\"duplicate_task_claims\",\"handoff_context_loss\",\"over_delegation_cost_spike\"],\"evidence_priority\":\"equal\"}"
  mental_model: "Agent engineering treats LLM calls as unreliable, tool-using components inside a larger workflow. The core move is to make lifecycle, delegation, coordination, verification, observability, budgets, and recovery explicit so model variability is contained by system design."
  purpose: "This skill prevents agent systems from shipping as impressive demos that stall, duplicate work, over-spend, lose handoff state, or silently produce unverified results under real workload pressure."
  concept_boundary: "This skill does not optimize one prompt, choose individual tool calls, design one agent's context payload, debug a single live incident, review generated code, or write the architecture decision record. It owns the architecture of agent loops and multi-agent coordination."
  analogy: "Agent engineering is like operating a crew of contractors on a construction site: each specialist may be capable, but the project succeeds only if the plan, locks, handoffs, inspections, budget, and stop conditions are explicit."
  misconception: "The common mistake is thinking more agents automatically means more capability. Extra agents also add coordination cost, context transfer risk, merge work, and failure modes; delegation is valuable only when independence, specialization, context protection, or cost reduction outweighs the overhead."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/software-architecture/agent-engineering/SKILL.md
  skill_graph_export_description_projection: anti_examples
  skill_graph_export_description_projection_truncated: "true"
---

# Agent Engineering

## Concept of the skill

Agent engineering treats LLM calls as unreliable, tool-using components inside a larger workflow.

## Coverage

- The discipline's relationship to and distinction from prompt engineering, harness engineering, and traditional distributed systems
- The four pillars: architecture and lifecycle management, task decomposition and context management, multi-agent coordination patterns, production reliability
- The lifecycle state machine: claim → execute → verify → commit → release, with the extended research/plan/review variant for complex workflows
- Context health states (ok / degraded / compact / exhausted) and their budget thresholds, plus the six observable signals of context rot
- Multi-agent coordination patterns: orchestrator/worker, fan-out/merge, evaluator/optimiser, consensus/fusion, sequential chain, hybrid — and the cost/reliability trade-offs of each
- The two-pass pattern (audit then fresh-context implement) for reliability-critical workflows
- The eight named coordination failure modes (task stealing, context contamination, merge conflicts, silent stall, brief rot, result injection, context bloat, double-commit) with detection and mitigation
- The six production reliability requirements: observability, cost budgets, idempotency, failure recovery, safety caps, claim locks — and what breaks when each is missing
- The delegation decision framework: six gates with overhead crossover analysis (≈1000-token minimum subagent overhead), batch crossover at four tasks for cheap-model fan-out
- The most common anti-patterns (God Agent, prompt-as-architecture, memory-persisted state, runaway loop, telephone-game briefs, ghost claim) and corrective actions
- The production readiness audit checklist and the staged-rollout verification workflow (10% → 50% → 100% budget)

## Philosophy of the skill
A single LLM prompt produces an answer. A *system* of LLMs produces a workflow that survives session boundaries, crashes, model variance, budget exhaustion, and adversarial input. Agent engineering is the discipline of building the second from the first.

Three foundational truths inform everything that follows:

1. **LLMs are unreliable components.** They hallucinate, forget, rationalise, and vary between calls. Treat each model call like any other unreliable component — with retries, circuit breakers, verification passes, and observability that catches failures early.
2. **Context is finite and decays.** Every session has a context budget; reasoning quality degrades *before* the hard limit through a phenomenon called context rot. Architecture must compensate: decompose tasks, compress handoffs, spawn fresh agents, and detect rot early.
3. **Coordination overhead is real.** The minimum cost of a single subagent round-trip is roughly 1000 tokens (brief composition + result verification + handoff summary). Over-delegation is as harmful as under-delegation; every fan-out must create value exceeding its overhead.

Four design axioms follow:

- **Non-determinism is a feature, not a bug.** Use the LLM for creative breadth; use architecture to converge that breadth onto deterministic results.
- **Context is the most precious resource.** Treat context like RAM: garbage-collect, page in and out, protect the working set.
- **Validation ≥ Generation.** The code that *verifies* output should be at least as robust as the logic that *generates* it.
- **Deterministic-first.** If a task can be solved by SQL, regex, or a script, the agent should *invoke* those tools — never *simulate* their logic.

> Agent engineering is to LLM systems what distributed-systems engineering is to unreliable network services — the model is one component, and the real work is managing its lifecycle, scaling, and failure recovery so the whole system stays alive under failure.

## Source Notes

Current public references converge on a few practical constraints:

- Anthropic's agent-pattern guidance separates workflows from autonomous agents, recommends simple composable patterns first, and names parallelization, orchestrator-worker, and evaluator-optimizer as distinct patterns with different fit criteria.
- Anthropic's multi-agent research write-up shows the upside and cost of parallel subagents: they help breadth-first work and large context loads, but coordination complexity, duplicated work, and token burn rise quickly.
- Anthropic's long-running harness guidance emphasizes durable project state, progress files, clean session endings, and feature-by-feature progress because compaction alone does not make multi-session work reliable.
- OpenAI Agents SDK tracing docs treat traces as a production debugging surface for LLM generations, tool calls, handoffs, guardrails, and custom events.
- The AutoGen paper grounds multi-agent systems as configurable conversations among LLM-backed agents, human inputs, and tools rather than as a single-prompt trick.

## Agent Engineering vs Related Disciplines

| Discipline | Focus | Key question | Scope |
|---|---|---|---|
| **Prompt engineering** | Single LLM call optimisation | "What instruction produces the right output?" | One call |
| **Harness engineering** | Execution environment and safety | "What can the agent NOT do?" | Per-agent |
| **Agent engineering** | System architecture and reliability | "How do we build a trustworthy system from unreliable components?" | Multi-agent system |
| **Distributed systems** | Deterministic service reliability | "How do reliable services coordinate at scale?" | Assumes deterministic, repeatable behaviour |

The key distinction from traditional system design: distributed systems assume reliable, deterministic components. Agent systems assume unreliable, non-deterministic components that require explicit alignment, cost management, and failure handling at every layer. Techniques transfer (retries, circuit breakers, idempotency keys, leader-election analogues) but the failure modes differ. A database node fails with an error code. An LLM node fails by confidently producing a plausible-but-wrong answer.

## The Four Pillars

### Pillar 1 — Architecture and Lifecycle Management

Agents are not fire-and-forget. They have an explicit lifecycle that must be managed across session boundaries.

**Standard lifecycle:** Claim → Execute → Verify → Commit → Release.

**Extended lifecycle for complex workflows:** Claim → Research → Plan → Execute → Verify → Review → Commit → Release.

Each stage is traceable and recoverable:

- **Claim** — agent locks the task via an atomic file write or equivalent primitive; prevents two agents from working on the same task simultaneously.
- **Execute** — agent operates on the task; all tool calls logged; state snapshots written every N iterations.
- **Verify** — before commit, agent checks acceptance criteria, runs tests, validates output against spec.
- **Commit** — changes staged and committed (typically with path-limited commits to avoid parallel-session interference).
- **Release** — durable status update (issue tracker, work queue) marks task complete; claim lock removed so other agents know the task is released.

#### Context health states

Define explicit budget thresholds and behaviour at each:

| State | Budget used | Behaviour |
|---|---|---|
| `ok` | < 60% | Normal operation |
| `degraded` | 60–80% | Trigger internal compaction or pruning |
| `compact` | 80–90% | Prepare a handoff brief; spawn fresh session |
| `exhausted` | > 90% | Stop work; do not attempt complex writes |

#### Critical implementation rule

**Lifecycle state must persist to disk, not to process memory.** If the agent crashes between Execute and Commit, the state file tells the next agent where to resume. A variable in memory does not survive a crash.

### Pillar 2 — Task Decomposition and Context Management

Complex tasks fail when forced into one session. Decomposition is the primary tool for managing reasoning quality.

#### The "God Agent" anti-pattern

Placing a complex, multi-day task into a single session.

- **Symptoms:** repeating errors, hallucinating file paths, forgetting constraints, increasing latency, re-explaining own prior actions.
- **Fix:** decompose into sub-tasks that fit within a ~4000-token "working zone" per agent step, and chain or fan-out with explicit handoffs.

#### Decomposition rules

1. **Fit-in-budget test.** Will the full task context plus expected output fit in one session's budget? If not, decompose.
2. **Independence test.** Can subtasks execute without reading intermediate output from each other? If yes, fan-out is safe (no ordering constraint, no shared mutable file).
3. **Specialisation test.** Does the subtask benefit from a different model, harness, or tool set? If yes, route to a specialist.
4. **Context protection.** Would doing this subtask inline risk blowing the orchestrator's context? If yes, delegate to protect the working set.
5. **Three-step rule.** If a task requires more than three distinct logical steps, it should be a planned sub-issue in the work tracker, not an ad-hoc inline task.

#### Context rot detection signals

Observable indicators that an agent's context has degraded *before* hitting the hard limit:

- Agent starts repeating the same tool calls without progressing
- Reasoning sections become shorter and less specific
- Agent begins re-explaining its own prior actions from the same session
- Model forgets a constraint it acknowledged 10 turns earlier
- Summary quality degrades: less detail, more vague hedging
- Agent's tool-selection accuracy drops noticeably

When two of these signals appear together, treat context as `degraded` and trigger compaction or spawn a fresh agent.

### Pillar 3 — Multi-Agent Coordination Patterns

| Pattern | Structure | When to use | Cost / reliability trade-off |
|---|---|---|---|
| **Orchestrator/worker** | One orchestrator dispatches N workers sequentially or via queue | Default for backlogs of independent tasks (bulk fixes, repo-wide audits) | Low overhead, sequential throughput |
| **Fan-out/merge** | Orchestrator spawns N parallel agents, merges results | Independent subtasks with no ordering constraint (parallel feature work, parallel test generation) | Moderate overhead (merge cost), high parallelism, reduced wall-clock |
| **Evaluator/optimiser** | Agent A generates, agent B critiques, A revises | UI implementation, documentation, complex logic | Moderate cost, higher quality through iteration |
| **Consensus/fusion** | N agents solve the same task independently; judge picks best or fuses results | High-stakes decisions (security, financial logic) where single-agent reliability is insufficient | N× cost, higher reliability, detects hallucinations better |
| **Sequential chain** | A.output → B.input → ... → final result | Each phase depends on prior output (impossible to parallelise) | Low overhead, sequential throughput, cannot parallelise |
| **Hybrid** | Orchestrator + parallel workers + sequential verify + consensus on risky decisions | Most production workflows | Moderate overhead, high reliability and parallelism |

#### The two-pass pattern

A mandatory standard for reliability-critical workflows:

- **Pass 1 (audit).** Agent researches and produces a research report or plan; writes to durable storage.
- **Pass 2 (implement).** A *fresh* agent (or fresh context) consumes the plan and executes.

This resets context rot and prevents "sunk-cost" bias — the implementing agent has not invested reasoning in a flawed plan, so it can flag issues rather than rationalise them.

#### Coordination failure modes

| Failure | Symptom | Root cause | Detection | Mitigation |
|---|---|---|---|---|
| **Task stealing** | Two agents claim the same task; duplicate PRs | No atomic claim primitive | Two claim files with same task ID | Atomic lock file write before *any* tool call; loser of race backs off immediately |
| **Context contamination** | Agent B uses stale output from A's failed run | Completion marker is file presence, not explicit status | Output file exists but tracker shows no completion | Tracker status is authoritative, not file presence |
| **Merge conflicts** | A and B edit the same file concurrently | No ownership assignment | Conflict markers on next commit | Disjoint file ownership per agent; worktree isolation |
| **Silent stall** | Agent stops responding without marking failure | No staleness monitor | No state update for N minutes | Per-phase timeouts; heartbeat writes; timeout escalates |
| **Brief rot** | Subagent brief contains stale context from earlier in the orchestrator session | Brief composed late in a long session | Brief references outdated paths or constraints | Compose briefs early; verify against current state before dispatch |
| **Result injection** | Agent B receives a result from A that was partially written mid-crash | No atomic result write | Downstream consumer errors on malformed JSON | Write to temp file, then rename atomically |
| **Context bloat** | Orchestrator keeps expanding context to track all workers' output | No summary compression | Orchestrator context grows monotonically | Workers write to durable storage, not back into prompt; orchestrator reads compressed summaries |
| **Double-commit** | Agent posts completion comment twice (retried after partial failure) | Missing idempotency check | Duplicate comments in tracker | Check before posting; post only if not already present |

Choosing the wrong coordination pattern for a given task structure is the most common architectural error: orchestrator/worker on highly dependent tasks bottlenecks; fan-out on dependent tasks fails because subagents lack prior subtask context; consensus on cheap decisions wastes 3× cost for marginal reliability gain. Treat multi-agent coordination claims as architecture hypotheses until observability, evals, and staged rollout data prove them.

### Pillar 4 — Production Reliability

A production agent system must address all six reliability requirements. Missing any one cascades into operational failure.

#### 4.1 Observability

Every model call, tool call, state transition, cost event, and claim/release must be logged and queryable. Implementation: structured event logs (JSONL is the de-facto standard) with a fixed schema:

```
{ timestamp, task_id, agent_id, event_type, model, tokens_in, tokens_out, tool, outcome, cost, session_id }
```

Without observability, "agent completed" is indistinguishable from "agent silently failed" — you cannot detect degradation, budget creep, or model-specific failure modes. Observability is the difference between a system you can operate and a black box.

#### 4.2 Cost budgets

Per-model daily quotas with graduated response: throttle → warn → lock. Free-tier or cheaper-model lanes for absorbing bulk work. Recommended thresholds per model per day:

- 0–70% — green (normal)
- 70–90% — yellow (warn)
- 90–100% — orange (throttle to cheaper model)
- > 100% — red (lock until reset)

Without budgets, one misconfigured infinite loop burns a month's quota in two hours. With budgets, the loop hits the cap and escalates to human review.

#### 4.3 Idempotency

Operations must be safe to retry. Claiming a task twice must not create two PR branches. Posting a completion comment twice must not duplicate it. Applying a migration twice must not corrupt data.

Patterns:

- **Idempotency keys** — store result of operation under a key derived from inputs; check before retrying
- **Atomic writes** — file writes are all-or-nothing (rename from temp, never overwrite in place)
- **Pre-post existence check** — before posting a comment or creating a branch, search for an existing one with the same identifier
- **Grounding** — always verify state via inspection (`ls`, `git status`, tracker query) before acting; never trust the prompt's memory of state

#### 4.4 Failure recovery

Three recovery layers:

- **Detect early** — stall detection (no state update for N minutes), error caps (stop after K consecutive errors), context-health checks (spawn fresh at `degraded`)
- **Retry with backoff** — exponential backoff (1s, 2s, 4s, 8s) on transient failures; max 3 retries per operation; wait 30 s before respawning
- **Escalate** — after retries exhausted, post a comment in the tracker, send a chat alert, or page on-call

Never loop indefinitely. Every loop must have an escape valve.

#### 4.5 Safety caps

Iteration limits (10 per session is a sane default, higher only with explicit override), consecutive error limits (3), context health checks (spawn fresh at `degraded`). A runaway agent that retries the same failing task 100 times is "working as designed" if no safety cap is set.

```json
{ "max_iterations": 10, "max_consecutive_errors": 3 }
```

#### 4.6 Claim locks

Prevent two agents from claiming the same task. Implement as an atomic file write (POSIX `O_EXCL`, or `mv` from temp): the file contains `{ task_id, agent_id, timestamp }`. If the file already exists, the second agent skips. The lock is released on completion (success or failure).

Why atomic files instead of a database lock service? Simple to debug (readable with `cat`), crash-safe (rename is atomic at OS level), requires no running server, scales horizontally via instance isolation, and humans can edit it mid-run for steering. Trade-off: concurrent writes still need the rename pattern — plain `echo > file` is not atomic.

## Delegation Decision Framework

Before spawning a subagent, walk this decision tree:

```
0. Single-shot decision or under three tool calls?
   YES → Do it inline. Delegation overhead (~1000 tokens) exceeds task cost.
   NO  → Continue.

1. Requires a specialist tool or model not currently loaded?
   YES → Delegate to the specialist.
   NO  → Continue.

2. Two or more genuinely independent subtasks (no ordering, no shared mutable file)?
   YES → Fan-out to parallel workers. Verify independence first.
   NO  → Continue.

3. Inline context plus output would exceed working budget?
   YES → Delegate to a subagent with its own context window. Compose a minimal brief (< 2000 tokens).
   NO  → Continue.

4. Cheaper model would handle this adequately (scanning, classification, format conversion)?
   YES → Route to cheaper model.
   NO  → Continue.

5. None of the above?
   → Do it inline. Over-delegation is an anti-pattern.
```

**Delegation overhead breakdown** (minimum cost of one subagent round-trip):

- Brief composition: ~500 tokens
- Result verification: ~300 tokens
- Context transfer (handoff summary): ~200 tokens
- **Total: ~1000 tokens minimum**

A task that takes 800 tokens inline costs 1800 tokens when delegated. Delegation must create value beyond its overhead: parallelism, specialisation, context protection, or model-cost reduction.

**Batch crossover rule.** Delegate a batch of N tasks if `per-task inline cost × N` exceeds `(N × per-task subagent cost) + fixed overhead`. For classification tasks routed to a model 75% cheaper than the orchestrator, the crossover is approximately **four tasks**. Below four, route inline. Above four, fan out.

| Mistake | Symptom | Cost |
|---|---|---|
| Delegating a < 3-tool task | Subagent spawns, briefs, runs, returns | 700 tokens vs ~200 inline = 3.5× cost |
| Not delegating when context-bound | Orchestrator hits limit, quality degrades, must compact and respawn | 2× context usage and delay |
| Parallel fan-out on dependent tasks | Subagent B fails because it lacked output from A | 2× cost for B plus merge complexity |
| Delegating to wrong specialist | Cheap model misses subtle bugs in code review | Quality loss, rework cost later |
| Recursive over-delegation | Agent spawns spawns spawns | Exponential context budget, hard to debug, slow |

## Production Readiness Checklist

Before declaring an agent system production-ready, verify all six. Missing any one is not production-ready — it is a demo.

| Requirement | Test | Consequence of missing |
|---|---|---|
| **Observability** | Every invocation logged with cost, model, task ID, outcome; queryable | Cannot diagnose failures or identify model-specific issues |
| **Cost budgets** | Per-model quotas enforced; graduated response (throttle → warn → lock) | One misconfigured loop burns the month's quota in hours |
| **Idempotency** | Operations safe to retry; no duplicate side effects from retries | Duplicate comments, duplicate work, data corruption on retry |
| **Failure recovery** | Stall detection configured, retry backoff, human escalation path | Agents stall indefinitely; consumers think loop is running when it has hung |
| **Safety caps** | Iteration limit, consecutive error limit, context-health check all set | Runaway agent retries the same failing task 100 times |
| **Claim locks** | Prevent double-claim of the same task | Two agents work on the same task; duplicate PRs; wasted effort |

The most commonly skipped requirements: **idempotency** (teams assume the orchestrator will not retry a successful operation) and **claim locks** (teams assume parallel agents will not race on the same task queue).

### Reliability audit checklist

- [ ] **Locking** — prevents concurrent claims on the same task
- [ ] **Isolation** — work performed in isolated worktrees or branches
- [ ] **Observability** — all tool and model calls logged to the event stream
- [ ] **Budgeting** — token or cost cap for this specific loop
- [ ] **Idempotency** — safe to run this loop ten times in a row
- [ ] **Verification** — automated gate (test, lint, eval) before the "done" signal
- [ ] **Handoff** — state persists to a durable continuation file
- [ ] **Safety caps** — iteration and error caps enforced

### Staged rollout verification

1. Deploy with observability on
2. Run against production workload with all budgets set to **10%** (catch failures early)
3. Monitor for one hour: stalls, cost overruns, duplicate claims
4. Increase budget to **50%**, run one day
5. Verify all six requirements pass; document any gaps
6. Only after every requirement is verified, increase budget to **100%** and declare production-ready

## Anti-Patterns

| Anti-pattern | What happens | Corrective action |
|---|---|---|
| **God Agent / spawn-first design** | Monolithic prompt tries to solve everything; or agent spawns subagents reflexively without applying the decision tree | Decompose into 4K-token working zones; apply the six-question decision tree before every spawn |
| **Prompt-as-architecture** | System relies on prompt instructions for reliability; when the model deviates there is no fallback | Add lifecycle state, safety caps, and failure recovery as first-class components — not prompt instructions |
| **Memory-persisted state** | Continuation state lives in a variable; a crash loses all progress | Write continuation state to disk atomically before every yield |
| **Implicit completion marker** | Task is "done" when a file appears; two agents both find the file absent and both claim | Use an explicit, atomic status write (tracker comment, lock file) as the completion marker |
| **Uncapped loop / runaway loop** | Loop runs until success or user kills it; a stuck task loops forever | Set `max_iterations` and `max_consecutive_errors` in every loop config |
| **Telephone-game brief** | Orchestrator sends full conversation history as the subagent brief; subagent starts context-exhausted | Briefs must be minimal: goal, constraints, deliverables, verification. Cap at 2000 tokens |
| **Fan-out without independence verification** | Tasks that share mutable state are fanned out; agents conflict on writes | Before fan-out, prove independence: no shared file, no ordering dependency |
| **Stall without detection / Ghost Claim** | Agent stops progressing but does not exit; or zombie agents hold locks after work died | Per-phase timeouts with heartbeat writes; release the claim lock in a `finally` block |
| **Delegation to expensive model for mechanical work** | Premium model classifies 200 documents that a cheap model could handle | Cost-aware delegation: deterministic mechanical work → cheap model or script; judgment work → premium |
| **Cross-session local-file dependency** | Agent A writes a finding to a local file; agent B in the next session cannot find it | Durable findings go to the work tracker; ephemeral files do not survive session boundaries |
| **Observability as afterthought** | Cannot diagnose why a task failed; guessing at root cause | Add logging before deployment; observability is a feature, not optional |
| **Budget limits set too high on rollout** | One misconfigured loop burns 30% of monthly quota before anyone notices | Start with conservative limits (10% of quota); increase as confidence grows |
| **Non-atomic claim locks** | Two agents claim the same task; both start working; merge conflict on results | Use atomic file create (rename from temp, `O_EXCL`); not polling-based checks |
| **Context bloat in orchestrator** | Orchestrator tracks full output from ten workers; context approaches limit | Workers write to durable storage; orchestrator reads compressed summaries only |

## Debugging Common Coordination Failures

Start with the symptom, not the root-cause hypothesis.

**Symptom: two PRs opened for the same task**
- Was the claim lock written before execution started, or after?
- Is the lock file deleted on completion before the next dispatch cycle?
- Fix: move lock write to the first action inside the worker, before any tool call. Use `O_EXCL` open or rename-from-temp for atomicity.

**Symptom: worker reports "task already done" but the tracker still shows In Progress**
- Is completion detection based on file presence or on tracker status?
- Did a prior failed run leave a stale completion file?
- Fix: completion detection must query tracker status, not file presence. Stale files must be cleaned at session start.

**Symptom: orchestrator stalls at 70% context without producing a continuation signal**
- Was context health monitored during the run?
- Did brief composition happen late in the session, after significant context burn?
- Fix: check context health every ten iterations. Trigger compaction at `degraded`. At `compact`, write continuation and exit.

**Symptom: agent retries the same failing operation 20+ times**
- Is `max_consecutive_errors` set?
- Does the error-cap code path actually halt execution, or merely log and continue?
- Fix: set `max_consecutive_errors: 3` in every loop config. Verify the cap exits with non-zero status and writes a failure summary.

**Symptom: subagent produces different results when replayed with the same brief**
- This is expected — LLMs are non-deterministic. Agent engineering wraps it, does not eliminate it.
- Is the verification pass catching the variance?
- Fix: add a structured verification pass (schema check, test run) after every subagent result. Retry up to the cap, then escalate.

**Symptom: cost spike on a single task**
- Did the task loop without a safety cap?
- Were cost events emitted per-iteration, allowing early detection?
- Fix: emit a cost event per loop iteration. Set a per-task budget threshold and escalate if exceeded.

## Verification

After applying agent-engineering decisions, verify:

- [ ] Architecture is explicit — the coordination pattern can be drawn on a whiteboard
- [ ] All six production-readiness requirements are addressed
- [ ] Delegation decisions applied the six-gate framework, not "spawn because it seems helpful"
- [ ] Fan-out tasks are genuinely independent (no ordering, no shared mutable file, no implicit cross-subtask dependency)
- [ ] Stall detection is configured for unattended loops with thresholds based on expected phase duration
- [ ] Idempotency is verified for every operation with external side effects
- [ ] Continuation signals persist to disk, not memory or environment variables
- [ ] Safety caps are explicitly set, not left at defaults
- [ ] Claim locks are written before the first tool call and released in a `finally` block
- [ ] Claim locks work under concurrent load (test with two agents on the same task)
- [ ] Completion markers are based on explicit status, not file presence
- [ ] Cost events are emitted per iteration, enabling outlier detection
- [ ] Every fan-out has a corresponding merge or verify phase
- [ ] Observability answers within 30 seconds: how many agents ran today, total cost, error rate, mean time to failure

## Do NOT Use When

| Use instead | When |
|---|---|
| `prompt-craft` | The fix is in the wording of one instruction (single-agent prompting), not the system around it |
| `tool-call-strategy` | The question is per-call efficiency inside one agent, not how multiple agents coordinate |
| `context-engineering` | The question is what reaches a single agent's context window, not the architecture of which agents run at all |
| `debugging` | A specific runtime failure needs root-cause analysis; not a class of coordination failure to prevent through architecture |
| `code-review` | Reviewing AI-generated code for correctness; not designing the system that generated it |
| `architecture-decision-records` | Writing the human-readable record of why an agent-system architecture was chosen; not designing the architecture itself |
| `testing-strategy` | Choosing test pyramid / trophy / honeycomb shape; not the verification pass inside an agent loop |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `software-architecture` (also: `ai-engineering`)
- Public: `true`
- Domain: `ai-engineering/architecture`
- Scope: Designing and evaluating production AI agent systems — multi-agent coordination patterns (orchestrator/worker, fan-out, consensus, sequential chain, evaluator/optimizer), the four pillars (architecture/lifecycle, task decomposition, coordination, production reliability), the six reliability requirements (observability, cost budgets, idempotency, failure recovery, safety caps, claim locks), the delegation decision framework with overhead crossover, and coordination-failure diagnosis (claim races, silent stalls, context contamination, runaway loops). Portable across any agent runtime; principle-grounded, not repo-bound. Excludes prompt wording (prompt-craft), per-call tool efficiency (tool-call-strategy), single-agent context-stack design (context-engineering), and runtime debugging of a deployed system (debugging).

**When to use**
- we want to fan out 40 classification subtasks to subagents — what coordination pattern should we use and what are the failure modes?
- two of our agents claimed the same task and produced duplicate PRs — what atomicity guarantee prevents this?
- the orchestrator burns 6x the budget we planned every Tuesday — where do we add cost visibility and caps?
- an agent loop ran for four hours without progress before anyone noticed — how do we detect silent stalls?
- we keep getting context-contamination bugs where agent B uses stale output from agent A's failed run — fix the protocol
- audit this agent loop and tell me whether it's production-ready or still a demo
- is consensus-of-three worth the 3x cost for security-critical decisions, or is two-pass cheaper and good enough?
- design the lifecycle for a long-running autonomous agent that survives crashes mid-task

**Not for**
- improve this prompt's wording to get better outputs
- the agent made 17 read calls when 3 greps would have done
- design what skills get loaded for which prompts
- scaffold a new SKILL.md for our orchestration runbook
- review this AI-generated PR for correctness
- the test suite is failing after my change — find the cause
- draft an architecture note explaining why we chose Postgres

**Related skills**
- Verify with: `testing-strategy`, `code-review`
- Related: `context-engineering`, `tool-call-strategy`, `debugging`, `context-window`, `summarization`, `prompt-craft`

**Concept**
- Mental model: Agent engineering treats LLM calls as unreliable, tool-using components inside a larger workflow. The core move is to make lifecycle, delegation, coordination, verification, observability, budgets, and recovery explicit so model variability is contained by system design.
- Purpose: This skill prevents agent systems from shipping as impressive demos that stall, duplicate work, over-spend, lose handoff state, or silently produce unverified results under real workload pressure.
- Boundary: This skill does not optimize one prompt, choose individual tool calls, design one agent's context payload, debug a single live incident, review generated code, or write the architecture decision record. It owns the architecture of agent loops and multi-agent coordination.
- Analogy: Agent engineering is like operating a crew of contractors on a construction site: each specialist may be capable, but the project succeeds only if the plan, locks, handoffs, inspections, budget, and stop conditions are explicit.
- Common misconception: The common mistake is thinking more agents automatically means more capability. Extra agents also add coordination cost, context transfer risk, merge work, and failure modes; delegation is valuable only when independence, specialization, context protection, or cost reduction outweighs the overhead.

**Grounding**
- Mode: `hybrid`
- Truth sources: `https://www.anthropic.com/engineering/building-effective-agents`, `https://www.anthropic.com/engineering/multi-agent-research-system`, `https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents`, `https://openai.github.io/openai-agents-python/tracing/`, `https://arxiv.org/abs/2308.08155`

**Keywords**
- `agent engineering`, `agentic engineering`, `multi-agent systems`, `production agent system`, `orchestration patterns`, `orchestrator worker`, `fan-out merge`, `consensus pattern`, `evaluator optimizer`, `sequential chain`

<!-- skill-graph-context:end -->
