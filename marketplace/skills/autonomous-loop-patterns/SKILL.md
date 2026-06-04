---
name: autonomous-loop-patterns
description: "Use when designing, reviewing, or debugging an autonomous AI agent loop: repeated agent execution, completion signals, checkpoints, supervisor respawn, stall detection, safety caps, and human handoff rules. Covers the core loop patterns from simple bounded runs through sentinel-based continuation, checkpoint-resume, and external supervisor loops. Do NOT use for choosing a specific agent product command (use agent-engineering or the product's docs), writing ordinary task instructions (use prompt-craft), or optimizing individual tool calls (use tool-call-strategy)."
metadata:
  relations: "{\"adjacent\":[\"evaluation\"],\"boundary\":[\"agent-engineering\"]}"
  schema_version: "7"
  subject: agent-ops
  deployment_target: portable
  version: "1.3.0"
  taxonomy_domain: agent/loop-design
  eval_artifacts: present
  eval_state: unverified
  routing_eval: absent
  triggers: "[\"autonomous-loop-skill\",\"loop-patterns-skill\",\"agent-loop-design\"]"
  keywords: "[\"autonomous agent loop\",\"agent loop pattern\",\"completion signal\",\"checkpoint resume loop\",\"supervisor respawn\",\"stall detection\",\"safety cap\",\"agent watchdog\",\"human handoff\"]"
  owner: skill-graph-maintainer
  freshness: "2026-05-21"
  drift_check: "{\"last_verified\":\"2026-05-21\"}"
  stability: experimental
  comprehension_state: present
  mental_model: "An autonomous loop has six primitives: a trigger, a worker agent, a progress signal, a stop condition, durable state, and a safety cap. Different loop patterns place those primitives in different owners: a bounded run keeps them in the prompt and runtime limit, a sentinel loop keeps the stop condition in a completion marker, a checkpoint loop persists state between sessions, and a supervisor loop keeps restart and timeout policy outside the worker."
  purpose: "Autonomous loop patterns replace improvised keep-going instructions with explicit control design. They solve the failure mode where an agent keeps retrying without a stop rule, loses progress after a restart, or appears active while making no useful progress."
  boundary: "This skill owns loop control shape, not the work performed inside each iteration. Use prompt-craft for the wording of a single worker prompt, tool-call-strategy for per-tool efficiency, agent-engineering for broader multi-agent system architecture, context-management for what context to load, and observability-modeling for telemetry schema design."
  analogy: "An autonomous loop is an autopilot mode: it can keep flying, but only because it has instruments, altitude limits, a route, and a clear handoff back to a pilot."
  misconception: "The common mistake is treating autonomy as permission to run forever. A safe loop is defined by when it stops, what state it writes, what evidence proves progress, and what cap forces human review."
  structural_verdict: PASS
  truth_verdict: PASS
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/agent-ops/autonomous-loop-patterns/SKILL.md
---

# Autonomous Loop Patterns

## Coverage

- Core primitives of an autonomous agent loop: trigger, worker agent, progress signal, stop condition, durable state, and safety cap.
- Pattern selection across bounded single-run loops, sentinel continuation loops, checkpoint-resume loops, and external supervisor loops.
- Completion signal design: explicit done markers, tracker state, exit status, persisted status files, and observable progress evidence.
- Safety design: iteration limits, consecutive-error limits, elapsed-time limits, budget limits, context-health exits, and human handoff thresholds.
- Stall detection and recovery: heartbeat age, unchanged work state, repeated failures, repeated plan churn, and supervisor escalation.
- Checkpoint and handoff contracts: what state must persist between runs and what state must never live only in agent memory.
- Anti-patterns that make autonomous loops unsafe: unbounded retry, prompt-only reliability, hidden mutable state, and silent respawn storms.

## Philosophy

An autonomous agent loop is not just an agent being told to continue. It is a control system. The agent is one component; the loop decides when to run it again, what evidence proves progress, what state survives a crash, and when a human must take over.

The smallest safe loop is usually better than the most powerful loop. A one-off task with a clear finish condition does not need a queue supervisor. A multi-session backlog should not rely on a single completion word. A long-running unattended process must not depend on the worker agent remembering its own state.

The quality bar is explicit termination plus recoverable state. If a loop cannot answer "why did this run again?", "what changed since the last iteration?", and "what stops it from running forever?", it is not an autonomous loop. It is an uncapped retry.

## The Six Primitives

| Primitive | Question it answers | Examples |
|---|---|---|
| Trigger | What starts the next iteration? | User request, queue item, scheduler tick, failed verification |
| Worker agent | Who performs one unit of work? | A coding agent, reviewer agent, data extractor, browser runner |
| Progress signal | How do we know anything changed? | Commit, test result, status update, artifact write, metric delta |
| Stop condition | What means the loop is done? | Empty queue, completion marker, passing gate, explicit human stop |
| Durable state | What survives crash or context reset? | Checkpoint file, issue comment, job record, append-only log |
| Safety cap | What forces review when progress fails? | Max iterations, max consecutive errors, elapsed-time cap, budget cap |

Design the primitives first. Tooling choices come second.

## Pattern Catalog

| Pattern | Best for | Stop owner | State owner | Main risk |
|---|---|---|---|---|
| Bounded single-run loop | One clear task that should finish in one session | Runtime limit or final verification gate | The current run plus final artifact | Agent tries to continue after the task is already done |
| Sentinel continuation loop | Small repeated task with a precise done marker | Completion marker checked by a wrapper or hook | Transcript plus optional counter | Completion marker appears accidentally or never appears |
| Checkpoint-resume loop | Multi-session work where context may reset | Checkpoint state and remaining-work count | Durable checkpoint | Stale checkpoint causes repeated or skipped work |
| Supervisor respawn loop | Long-running unattended throughput | External supervisor | Status files, queue, and logs | Respawn storm after repeated failure |
| Human-gated loop | Risky work with side effects or unclear requirements | Human approval gate | Review record and approved next action | Loop waits without making the escalation visible |

## Pattern 1: Bounded Single-Run Loop

Use this for a single task with a concrete finish condition. The prompt names the deliverable, the runtime enforces a hard limit, and verification decides whether the run is done.

Use when:

- The work has one primary deliverable.
- The done condition can be verified inside one run.
- Failure is reviewable from the final artifact and logs.
- Restarting from scratch would not lose meaningful progress.

Required safeguards:

- A hard iteration or elapsed-time limit.
- A final verification command or acceptance gate.
- A clear final status: done, blocked, or failed.

Do not use this for long backlogs, stateful migrations, or tasks where partial progress must be resumed.

## Pattern 2: Sentinel Continuation Loop

A sentinel loop repeats until the worker emits a precise completion marker, or until a wrapper decides the marker is absent and starts another turn. Some teams call this the Ralph Wiggum pattern: the runtime keeps going until the agent says the exact stop phrase.

Prompt contract:

```text
Do the task described below.

Completion condition: all requested changes are implemented and verification passes.

When and only when the completion condition is true, output this exact marker:
TASK_COMPLETE_9F3A

If the task is blocked, output BLOCKED with the reason instead.
Do not output the completion marker in code, examples, logs, or explanations.
```

Use when:

- The task is small enough that repeated turns stay understandable.
- The completion condition is easy to state as a marker contract.
- A wrapper can count iterations and stop after a cap.

Required safeguards:

- Use an uncommon marker, not a word like "done".
- Count iterations outside the model.
- Stop on a blocked marker instead of continuing forever.
- Keep the marker out of code snippets and examples.

Do not use this when the task spans many sessions, requires durable queue state, or has high-risk side effects.

## Pattern 3: Checkpoint-Resume Loop

A checkpoint loop persists the state needed to resume later. The worker writes a checkpoint at the end of each run. The next run reads it, verifies it against current reality, and continues.

Minimum checkpoint contract:

```json
{
  "objective": "short stable goal",
  "iteration": 3,
  "max_iterations": 10,
  "remaining_work": ["item-a", "item-b"],
  "completed_work": ["item-0"],
  "last_verified_evidence": "test name or artifact reference",
  "context_health": "ok | degraded | exhausted",
  "next_action": "the first action for the next run",
  "stop_reason": null
}
```

Use when:

- The work cannot safely fit in one context window.
- Partial progress must survive a restart.
- The loop must decide whether work remains before starting another run.
- A fresh run may need a compact handoff instead of full history.

Required safeguards:

- Write checkpoints atomically where the platform supports it.
- Treat checkpoint state as a cache; verify current reality before acting.
- Stop when context health is exhausted, even if work remains.
- Include the next action so the next run does not rediscover the plan.

Do not store the only copy of progress in model memory or chat history.

## Pattern 4: Supervisor Respawn Loop

A supervisor loop runs outside the worker agent. It starts a worker, watches status and timeout signals, records the result, and decides whether to spawn another worker.

Use when:

- Many independent work items need unattended throughput.
- Each worker should start with fresh context.
- The supervisor can own queue selection, timeout, and retry policy.
- Workers may fail independently without ending the whole process.

Required safeguards:

- Per-worker timeout.
- Consecutive-error cap.
- Queue item lock or claim before work starts.
- Status write on success, failure, blocked, and timeout.
- Supervisor log that explains every respawn decision.

Do not let a supervisor respawn a worker after repeated identical failures without changing state, backoff, or escalation.

## Completion Signals Ranked

| Signal | Reliability | Use it for | Failure mode |
|---|---|---|---|
| Authoritative tracker state | High | Queue and backlog loops | Tracker update omitted or duplicated |
| Passing verification gate | High | Coding, data, or document loops | Gate is too shallow or not rerun |
| Explicit sentinel marker | Medium-high | Small repeated tasks | Marker appears accidentally or never appears |
| Durable checkpoint says no work remains | Medium | Checkpoint loops | Checkpoint is stale |
| Process exit code | Medium | Supervisor loops | Exit code lacks semantic detail |
| Absence of new output | Low | Last-resort stall hint only | Quiet work and stalled work look the same |

Prefer authoritative tracker state and verification gates when available. Use sentinel markers for small loops. Use absence of output only as a stall warning, never as proof of completion.

## Safety Caps

Every autonomous loop needs at least one cap. Unattended loops usually need several.

| Cap | Prevents | Typical default |
|---|---|---|
| Max iterations | Endless continue loops | 5-15 iterations, lower for risky work |
| Consecutive errors | Respawn storms | Stop after 3 repeated failures |
| Elapsed time | Long silent runs | Based on expected phase duration |
| Work item lock age | Zombie ownership | Expire only after evidence of worker death |
| Context health | Low-quality late-session changes | Stop and hand off at exhausted context |
| Budget | Runaway cost | Small initial budget, staged increase |

The cap must be enforced outside the worker when possible. A model instruction that says "do not loop forever" is not a cap.

## Stall Detection

A loop is stalled when it keeps consuming iterations without improving the durable state.

Common stall signals:

- Same work item repeated across several iterations.
- No new durable artifact after an iteration that claimed progress.
- Same verification failure appears repeatedly.
- The worker rewrites the plan but does not execute it.
- Heartbeat or status timestamp is older than the expected phase duration.
- Supervisor respawns the same failing task without backoff or escalation.

Recovery sequence:

1. Stop the current worker or refuse the next respawn.
2. Preserve the latest checkpoint, logs, and verification output.
3. Classify the stall: unclear requirement, failing dependency, repeated bug, or loop-control error.
4. Escalate to human review when the next action requires judgment.
5. Restart only after changing the state that caused the stall.

Do not recover from a stall by only increasing the iteration limit.

## Pattern Selection

Use this decision table before implementing loop control.

| Situation | Recommended pattern |
|---|---|
| One task, one artifact, clear verification | Bounded single-run loop |
| One task that may need a few more turns | Sentinel continuation loop |
| Multiple related steps that may exceed context | Checkpoint-resume loop |
| Many independent queue items | Supervisor respawn loop |
| Side effects, approvals, or unclear requirements | Human-gated loop |
| Unknown done condition | Do not loop yet; define the stop condition first |

The rule of thumb: choose the simplest pattern that can stop safely and resume correctly.

## Implementation Checklist

Before shipping an autonomous loop, answer these questions in writing:

- What exactly starts one iteration?
- What exactly proves the iteration made progress?
- What exactly means the whole loop is done?
- Where is state written so it survives restart?
- What cap stops repeated failure?
- How does a human see why the loop stopped?
- Which operation is safe to retry, and which requires approval?

If any answer is "the agent will remember", the design is not ready.

## Anti-Patterns

| Anti-pattern | Why it fails | Safer replacement |
|---|---|---|
| Unbounded continue prompt | The model can retry forever without new evidence | External iteration cap plus blocked state |
| Prompt-only reliability | The model is both worker and watchdog | Runtime or supervisor enforces caps |
| Hidden progress in chat history | Restart loses the work state | Durable checkpoint or tracker update |
| Completion by silence | Quiet output is indistinguishable from a hang | Explicit done, blocked, failed, or timed-out state |
| Respawn without state change | Repeats the same failure | Backoff, classify, and escalate |
| One giant worker context | Context rot degrades decisions | Fresh worker per item or checkpoint handoff |
| Human gate buried in logs | Review never happens | Explicit approval state and visible stop reason |

## Verification

After applying this skill, verify:

- [ ] The chosen pattern is the simplest one that can safely stop and resume.
- [ ] The loop has an explicit stop condition and an explicit blocked condition.
- [ ] At least one safety cap is enforced outside the worker agent.
- [ ] Durable state records objective, iteration, remaining work, latest evidence, and next action.
- [ ] Stall detection can identify repeated work, repeated failure, stale heartbeat, or no durable progress.
- [ ] Completion is based on tracker state, verification output, or a precise marker, not silence.
- [ ] Human handoff is visible when the loop reaches a cap or a judgment boundary.

## Do NOT Use When

| Use instead | When |
|---|---|
| `agent-engineering` | Designing the full production agent system, including model routing, multi-agent coordination, and rollout policy |
| `prompt-craft` | Writing the exact instruction for one agent run or one worker prompt |
| `tool-call-strategy` | Optimizing how many tools one agent calls inside a single iteration |
| `context-management` | Deciding what information belongs in one worker's context |
| `observability-modeling` | Designing event names, spans, metrics, and trace attributes for the loop |
| Product-specific docs | Choosing a slash command, IDE feature, or hosted-agent setting in a particular tool |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `agent-ops`
- Deployment: `portable`
- Domain: `agent/loop-design`

**When to use**
- Triggers: `autonomous-loop-skill`, `loop-patterns-skill`, `agent-loop-design`

**Related skills**
- Related: `evaluation`

**Concept**
- Mental model: An autonomous loop has six primitives: a trigger, a worker agent, a progress signal, a stop condition, durable state, and a safety cap. Different loop patterns place those primitives in different owners: a bounded run keeps them in the prompt and runtime limit, a sentinel loop keeps the stop condition in a completion marker, a checkpoint loop persists state between sessions, and a supervisor loop keeps restart and timeout policy outside the worker.
- Purpose: Autonomous loop patterns replace improvised keep-going instructions with explicit control design. They solve the failure mode where an agent keeps retrying without a stop rule, loses progress after a restart, or appears active while making no useful progress.
- Boundary: This skill owns loop control shape, not the work performed inside each iteration. Use prompt-craft for the wording of a single worker prompt, tool-call-strategy for per-tool efficiency, agent-engineering for broader multi-agent system architecture, context-management for what context to load, and observability-modeling for telemetry schema design.
- Analogy: An autonomous loop is an autopilot mode: it can keep flying, but only because it has instruments, altitude limits, a route, and a clear handoff back to a pilot.
- Common misconception: The common mistake is treating autonomy as permission to run forever. A safe loop is defined by when it stops, what state it writes, what evidence proves progress, and what cap forces human review.

**Keywords**
- `autonomous agent loop`, `agent loop pattern`, `completion signal`, `checkpoint resume loop`, `supervisor respawn`, `stall detection`, `safety cap`, `agent watchdog`, `human handoff`

<!-- skill-graph-context:end -->
