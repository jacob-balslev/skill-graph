---
name: autonomous-loop-patterns
description: "This skill consolidates autonomous AI agent loop patterns: the Ralph Wiggum exit-code-2 pattern, our manage-loop (manage-continuation.json + manage-loop-hook.py), grind-loop.sh supervisor, completion detection strategies, safety caps, stall detection, and the tradeoffs between simple loops and sophisticated orchestration. Use when designing or debugging autonomous agent loops, choosing between loop approaches, or implementing safety limits. Do NOT use for choosing which command to run (use ai-coding-agents) or for task management (use linear)."
metadata:
  schema_version: "8"
  type: capability
  operation: know
  version: "1.2.0"
  scope: portable
  category: agent
  subject: agent-ops
  eval_artifacts: present
  eval_state: passing
  routing_eval: present
  triggers: "[\"autonomous-loop-skill\",\"loop-patterns-skill\"]"
  keywords: "[\"autonomous loop\",\"ralph wiggum\",\"grind loop\",\"manage loop\",\"agent respawn\",\"completion detection\",\"safety cap\"]"
  examples: "[\"design an autonomous loop with a safety cap and completion detection\",\"what completion detection and safety cap should an autonomous loop use\",\"manage loop continuation signal vs ralph wiggum stop hook for an autonomous agent\",\"how does the grind loop supervisor respawn fresh sessions until completion\"]"
  anti_examples: "[\"design a multi-agent orchestrator-worker architecture with parallel subagents\",\"choose between chaining, routing, and parallelization agent patterns\",\"should I parallelize subagents or use an orchestrator-worker pattern\"]"
  owner: claude
  freshness: "2026-05-18"
  drift_check: "{\"last_verified\":\"2026-05-18\",\"truth_source_hashes\":{}}"
  primaryCategory: Agent System
  layerPrimary: meta
  routingRole: primary
  comprehension_state: present
  mental_model: "A loop has five primitives: trigger, worker session, progress signal, stop condition, and safety cap. Ralph Wiggum keeps the stop condition in a Stop hook plus completion word, manage-loop keeps it in a continuation signal, and grind-loop keeps it in an external supervisor that respawns fresh sessions from status and exit evidence."
  purpose: "Autonomous loop patterns exist to prevent ad hoc respawn logic with no checkpoint, cap, or recovery owner. They let the system choose the smallest loop shape that can safely finish the work while preserving progress across session boundaries."
  boundary: "This is not command selection, task execution, inter-agent messaging, budget steering, or checkpoint implementation internals. Use ai-coding-agents for command choice, task-execution for the work inside an iteration, agent-to-agent or agent-messaging for communication, agent-control for steering, and agent-loop-infra for checkpoint mechanics."
  analogy: "Autonomous loop patterns are autopilot modes: each mode keeps moving, but each needs instruments, altitude limits, and a clear handoff back to the pilot."
  misconception: "The common mistake is treating autonomy as a loop that can run forever. A safe autonomous loop is defined by when it stops, what it persists, and how it proves progress between iterations."
  relations: "{\"related\":[\"agent-governance\",\"ai-native-development\",\"hook-patterns\",\"agent-observability\",\"orchestration\"],\"boundary\":[{\"skill\":\"ai-coding-agents\",\"reason\":\"ai-coding-agents owns which command or workflow to run such as /solve, /manage, /grind; autonomous-loop-patterns owns the loop control shape, not command selection\"},{\"skill\":\"linear\",\"reason\":\"linear owns task and issue lifecycle and tracking; autonomous-loop-patterns owns loop control, not work-item management\"},{\"skill\":\"task-execution\",\"reason\":\"task-execution owns the work performed inside one iteration; autonomous-loop-patterns owns when the loop continues, stops, caps, and respawns around that work\"},{\"skill\":\"agent-engineering\",\"reason\":\"agent-engineering owns multi-agent architecture selection such as orchestrator-worker, chaining, routing, and parallelization; autonomous-loop-patterns owns the single-loop control shape\"}],\"verify_with\":[\"agent-observability\",\"agent-control\"]}"
  structural_verdict: UNVERIFIED
  truth_verdict: UNVERIFIED
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v7
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/agent/autonomous-loop-patterns/SKILL.md
---

# Autonomous Loop Patterns

## Concept Card

**What it is:** Autonomous loop patterns are reusable control shapes for running an agent repeatedly until an explicit stop condition is reached. They define how a session continues, stops, checkpoints, respawns, and avoids runaway behavior.

**Mental model:** A loop has five primitives: a trigger, a worker session, a progress signal, a stop condition, and a safety cap. Ralph Wiggum puts the stop condition in a Stop hook and completion word. Manage-loop puts it in a continuation signal. Grind-loop puts it in an external supervisor that respawns fresh sessions based on status files and exit outcomes.

**Why it exists:** Without named loop patterns, agents invent ad hoc respawn logic that has no checkpoint, no cap, and no clear owner for recovery. These patterns let the system choose the smallest loop that can safely finish the work.

**What it is NOT:** It is not command selection, task execution, inter-agent messaging, or budget steering. Those are handled by `ai-coding-agents`, `task-execution`, `agent-to-agent`, and `agent-control`.

**Adjacent concepts:** Hook patterns provide lifecycle intercepts, loop infrastructure provides checkpoint mechanics, agent control provides steering and abort signals, and observability provides evidence that a loop is progressing.

**One-line analogy:** Autonomous loop patterns are autopilot modes: each mode keeps moving, but each needs instruments, altitude limits, and a clear handoff back to the pilot.

**Common misconception:** A loop is not safer because it can run forever. A safe autonomous loop is defined by when it stops, what it persists, and how it proves progress between iterations.

## Domain Context

**What is this skill?** This skill consolidates autonomous AI agent loop patterns: the Ralph Wiggum exit-code-2 pattern, our manage-loop (manage-continuation.json + manage-loop-hook.py), grind-loop.sh supervisor, completion detection strategies, safety caps, stall detection, and the tradeoffs between simple loops and sophisticated orchestration. Use when designing or debugging autonomous agent loops, choosing between loop approaches, or implementing safety limits. Do NOT use for choosing which command to run (use ai-coding-agents) or for task management (use linear).

## Key Files

| File | Purpose |
|---|---|
| `scripts/hooks/manage-loop-hook.py` | Stop hook that reads the continuation signal, validates it against schema, enforces max iterations, and decides continue vs stop. |
| `scripts/schemas/manage-continuation.schema.json` | Canonical continuation-signal shape (`should_continue`, `remaining_tasks`, `context_health`, `iteration`, `max_iterations`). |
| `scripts/hooks/wrap-gate-hook.py` | PreToolUse workflow gate that reads instance-aware continuation signals and blocks claims after the wrap threshold is reached. |
| `scripts/hooks/context-health-hook.py` | Updates continuation-signal `context_health` for Ghostty tab agents at warning/critical context thresholds. |
| `scripts/loop/grind-loop.sh` | Supervisor for solo/manage/pretriaged modes; owns respawn, status files, bad-exit caps, claim locks, and instance suffixes. |
| `scripts/loop/loop-supervisor.js` | Checkpoint staleness monitor for registered loops and phase thresholds. |
| `scripts/agent/agent-events.js` | Emits structured JSONL lifecycle telemetry for loop/task observability. |
| `.claude/settings.json` | Project hook registration, including `Stop` and `PreToolUse` hook wiring. |
## Coverage

This skill covers the three autonomous loop architectures used in the Development repo: Ralph Wiggum (completion-word + Stop hook pattern), the manage-loop (continuation signal + `manage-loop-hook.py`), and `grind-loop.sh` (external supervisor with instance isolation and fresh-session respawn). It also covers completion detection strategies ranked by reliability, current continuation-signal behavior, stall detection and recovery signals, safety mechanisms (iteration caps, context health checks, wrap-gate enforcement, bad-exit caps, claim-lock TTL), the decision tree for choosing a pattern, and the prompt contract for completion-word-based loops. Runtime state files are generated under the agent-memory directory only while loops run; do not list them as stable source files.

## Philosophy

Without this skill, agents build loops that lack termination guarantees, skip safety caps, or reinvent patterns already proven in this repo. The most common failure mode is over-engineering: agents build manage-loop complexity for tasks that only need Ralph Wiggum. The second failure mode is missing safety caps entirely, leading to runaway loops that consume context budget without making progress. This skill exists to make the three-pattern landscape legible so agents pick the simplest adequate pattern and wire in the correct safety mechanisms from the start.

> Use this skill when designing or debugging autonomous agent loops, choosing between loop approaches, or implementing safety caps and stall detection.

## Cross-Domain Synergy
Autonomous loops power the continuous execution engine:
- **agent-governance**: Dictates how many actions a loop can take before hitting trust ceilings, enforcing the max iterations or mutation caps documented here.
- **ai-coding-agents**: Exposes the user-facing CLI commands (`/manage-auto`, `/grind`) that internally trigger these specific loop architectures.
- **hook-patterns**: Implements the actual exit-signal (e.g., Ralph Wiggum) intercepts that make these loops function mechanically.

## 1. When this skill applies

| Use this skill for... | Use something else for... |
|---|---|
| choosing between Ralph Wiggum, manage-loop, or grind-loop | choosing which repo command to run for a task (`ai-coding-agents`) |
| understanding how completion detection works in each loop | creating or updating Linear issues (`linear`) |
| implementing stall detection or iteration safety caps | implementing the task itself (`task-execution`) |
| debugging a loop that is not terminating or resuming correctly | |

## 2. The three loop patterns at a glance

| Pattern | Complexity | Best for | Safety mechanism |
|---|---|---|---|
| **Ralph Wiggum** | ~20 lines | Mechanical, single-pass tasks | Completion word in prompt |
| **Manage-loop** | ~150 lines of Python | Multi-task backlog with Linear integration | 10-iteration cap + health check |
| **grind-loop.sh** | ~200 lines of bash | Parallel throughput, worktree isolation | Instance-aware + per-session cap |

Use the simplest pattern that meets the requirement. Ralph Wiggum is underrated.

## 3. Pattern 1 — Ralph Wiggum (exit code 2 + stop hook)

Named after the Simpsons character who just keeps going until something stops him. The pattern is widely adopted in the Claude Code community because it requires almost no infrastructure.

### How it works

1. The stop hook reads Claude's last response text.
2. If the text contains the completion word (e.g., "TASK_COMPLETE"), the hook exits with code `0`, ending the session.
3. If the text does NOT contain the completion word, the hook exits with code `2`.
4. Exit code `2` from a stop hook signals Claude Code to continue — a new turn starts automatically.
5. Claude keeps iterating until the completion word appears.

### Minimal implementation

```python
# .claude/hooks/stop.py
import sys
import json

data = json.loads(sys.stdin.read())
transcript = data.get("transcript", [])
last_message = transcript[-1]["content"] if transcript else ""

if "TASK_COMPLETE" in last_message:
    sys.exit(0)   # Done — stop the session
else:
    sys.exit(2)   # Not done — keep going
```

### Prompt contract

The agent prompt must:
1. Describe the task
2. Describe the completion condition precisely
3. Instruct the agent to output the completion word when done

```
Implement the following changes to the CSV export feature:
[task details]

When you have committed all changes and verified they pass, output the exact word TASK_COMPLETE.
Do not output TASK_COMPLETE until the commit exists and verification passes.
```

### When Ralph Wiggum is the right choice

- Single well-defined task with a clear done condition
- No Linear integration needed
- No need for cross-session state
- Task fits in one context window
- Low risk — agent makes decisions that are easy to review in git

### Risks

- No iteration cap by default. Add one if the task could loop indefinitely:

```python
iteration = data.get("iteration", 0)
if iteration > 15:
    print("Safety cap reached", file=sys.stderr)
    sys.exit(0)
```

- The completion word can appear accidentally in code output. Choose an uncommon sentinel, not "done" or "complete".

## 4. Pattern 2 — Manage-loop (manage-continuation.json)

The manage-loop powers `/manage-auto` and `/grind`. It is a checkpoint/resume architecture: the task-manager agent writes state to a JSON file at the end of each session, and a Python hook reads it to decide whether to continue.

### How it works

```
Session N
  task-manager claims tasks, executes solvers, marks Done
  at session end: writes manage-continuation.json
  stop hook reads the file
    should_continue == true AND remaining_tasks > 0 → block (new session)
    should_continue == false → exit(0) (stop)
    iteration >= cap → exit(0)

Session N+1
  task-manager reads manage-continuation.json for context
  continues from where session N left off
```

### manage-continuation.json schema

> The continuation signal schema is canonically defined in `agent-to-agent`. See that skill for the full field list and context health states. The summary relevant to loop mechanics: `should_continue: boolean` gates loop continuation; `context_health` is the task-manager's self-assessment (`ok`, `compact`, `exhausted`). When `exhausted`, the loop terminates even if tasks remain — a compact context produces bad code.

### manage-loop-hook.py

Located at `scripts/hooks/manage-loop-hook.py`. Key behaviors:

- Reads the default continuation signal from the agent-memory directory
- Validates required fields with `scripts/schemas/manage-continuation.schema.json`
- Uses `mode` as the gate; only `manage`, `grind`, and `solo` opt into continuation
- Clears the signal when `should_continue` is false, the iteration cap is reached, or no tasks remain
- Approves stop for `context_health: "compact"` or `"exhausted"` and marks the signal with `needs_new_session` / `needs_compaction` when work remains
- Blocks stop only when healthy context remains and `remaining_tasks > 0`

### Self-retrospective

Between sessions, the task-manager writes a brief retrospective to Linear — what was completed, what is blocked, what the next session should tackle first. This replaces the need for a human to manually review progress between iterations.

### When manage-loop is the right choice

- Multi-task backlog (5+ tasks)
- Linear integration required (claim, done, comment)
- Tasks have dependencies that need ordering
- Session context degrades after 3-4 tasks and fresh context is needed

### Wrap-gate enforcement

The wrap-gate hook (`scripts/hooks/wrap-gate-hook.py`) enforces that the task-manager runs `/wrap` between tasks. It:
1. On `linear-cli.js done`, `done-batch`, or equivalent `linearis` Done update — writes an instance-aware `wrap-required` marker
2. Tracks `tasks_since_wrap` and reads `max_tasks_before_wrap` from the continuation signal (default: 3)
3. Allows claims below the threshold and blocks claims once the threshold is reached
4. Session start cleanup removes stale wrap markers

This prevents long manage/grind runs from claiming indefinitely without closeout while avoiding the overhead of forcing `/wrap` after every tiny task.

## 5. Pattern 3 — grind-loop.sh (supervisor)

The `grind-loop.sh` supervisor architecture (instance isolation via `GRIND_INSTANCE`, restart behavior, per-session budget control, consecutive-error cap, worktree compatibility) is canonically documented in `agent-loop-infra`. Read that skill for the full implementation reference.

**When grind-loop is the right choice** (from this skill's perspective): maximum throughput via parallel instances, long-running unattended backlog clearing, task context short enough for one-task-per-session, and git worktree isolation needed to prevent concurrent-edit conflicts. Choose manage-loop instead when you need cross-session checkpoint/resume with Linear integration and structured handoff.

## 6. Completion detection strategies

Every loop needs a reliable signal that work is done. Here are the strategies in order of reliability:

| Strategy | Reliability | Notes |
|---|---|---|
| **Linear status check** | High | Query Linear for remaining `In Progress` or `Ready` tasks. Reliable if the agent marks done correctly. |
| **Completion word in output** | High | Ralph Wiggum pattern. Reliable if the agent follows the prompt contract. |
| **Exit code from stop hook** | High | Deterministic. The hook decides based on output content. |
| **Status file check** | Medium | `grind-loop.sh` reads generated `solo-status*.json` files. Reliable if the agent writes them consistently. |
| **Remaining task count in JSON** | Medium | Reads `remaining_tasks` from continuation file. Can be stale if session crashes mid-write. |
| **Absence of new commits** | Low | Heuristic only. An agent might think without committing. |

Prefer Linear status as the task-level ground truth. Use status files, continuation signals, and checkpoints for loop mechanics, then reconcile against Linear on session start before dispatching more task work.

## 7. Stall detection

A loop is stalled when it keeps running but is not making progress. Common causes:

1. Agent is thinking in circles without committing
2. A test is consistently failing and the agent cannot fix it
3. Agent is blocked on an ambiguous requirement
4. The Linear task is already Done but the loop did not detect it

### Detection heuristics

```python
# Stall indicators to check between iterations
def is_stalled(state):
    # No new commits since last iteration
    if state.new_commits_this_iteration == 0:
        return True, "No commits — agent may be stuck"

    # Same task claimed 3+ iterations in a row
    if state.last_three_tasks_all_same():
        return True, "Same task claimed repeatedly — likely blocked"

    # Linear task not advancing state
    if state.task_status_unchanged_for_n_iterations(3):
        return True, "Task status unchanged — agent may not be marking progress"

    return False, None
```

Current repo mechanisms are more specific than the generic heuristic:

| Mechanism | Current source | What it detects |
|---|---|---|
| Status-file watchdog | `scripts/loop/grind-loop.sh` | Child process finished after writing a non-`running` result, or timed out. |
| Bad-exit streaks | `scripts/loop/grind-loop.sh` | Solo/manage sessions that crash or exit without usable status three times in a row. |
| Claim-lock TTL | `scripts/loop/grind-loop.sh` | Parallel instances that left stale claim locks older than the TTL. |
| Checkpoint staleness | `scripts/loop/loop-supervisor.js` | Registered loops whose checkpoint phase has not updated within its threshold. |

### Recovery actions

| Stall type | Recovery action |
|---|---|
| Status-file timeout | Let `grind-loop.sh` kill the process tree, then inspect status and logs before respawn. |
| Repeated bad exits | Stop after the configured streak cap and write the loop abort file. |
| Stale claim lock | Remove only after TTL verification, then allow another instance to claim. |
| Stale checkpoint | Run `loop-supervisor.js status` and recover through `loop-checkpoint.js` before restarting. |
| Ambiguous requirement | Post a comment on the task, move it back to planning/Ready as appropriate, and stop the loop. |

## 8. Safety mechanisms summary

| Mechanism | Pattern | Where |
|---|---|---|
| Completion word | Ralph Wiggum | Stop hook reads transcript |
| Iteration cap | Manage-loop | `manage-loop-hook.py` (default: 10) |
| Context health check | Manage-loop | Task-manager self-reports `context_health` |
| Wrap-gate enforcement | Manage-loop | `wrap-gate-hook.py` blocks claims without `/wrap` |
| Bad-exit cap | grind-loop | Bash counters in `grind-loop.sh` stop solo/manage after 3 bad exits |
| Instance isolation | grind-loop | `GRIND_INSTANCE` env var |
| Checkpoint staleness | Registered loops | `loop-supervisor.js` reads checkpoint phase thresholds |

## 9. Choosing a pattern — decision tree

```
Is the task mechanical with a clear done condition?
├── Yes → Will it fit in one context window?
│   ├── Yes → Ralph Wiggum (simplest)
│   └── No → Manage-loop (checkpoint/resume)
└── No → Is it a multi-task backlog with Linear integration?
    ├── Yes → Manage-loop or grind-loop
    │   └── Need parallel throughput?
    │       ├── Yes → grind-loop (multiple instances)
    │       └── No → Manage-loop (single orchestrated session)
    └── No → Define the done condition first, then choose a pattern
```

When in doubt, start with Ralph Wiggum. It is simpler to debug, easier to inspect, and covers more use cases than it appears.

## 10. References

- Stop hook pattern: `.claude/settings.json` → `hooks.Stop`
- Manage-loop hook: `scripts/hooks/manage-loop-hook.py`
- Continuation schema: `scripts/schemas/manage-continuation.schema.json`
- Wrap-gate hook: `scripts/hooks/wrap-gate-hook.py`
- Grind-loop supervisor: `scripts/loop/grind-loop.sh`
- Loop staleness monitor: `scripts/loop/loop-supervisor.js`
- Observability events: `scripts/agent/agent-events.js`
- Runtime-generated continuation/status files use `manage-continuation` and `solo-status` prefixes under the agent-memory directory and may be absent when loops are idle.

## Verification

After applying this skill, verify:
- [ ] The chosen loop pattern is the simplest that meets the requirement (Ralph Wiggum before manage-loop before grind-loop)
- [ ] A safety cap exists — iteration limit, consecutive error limit, or context health check
- [ ] The completion detection strategy is defined and the prompt contract includes the completion word if using Ralph Wiggum
- [ ] Stall detection is wired in for any loop expected to run more than 3 iterations unattended
- [ ] The wrap-gate is not bypassed — `/wrap` runs between tasks in manage-loop flows
- [ ] For grind-loop: `GRIND_INSTANCE` env var is set when running parallel instances
- [ ] Observability events are emitted via `scripts/agent/agent-events.js` so loop progress is visible

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Choosing which CLI command to run | `ai-coding-agents` | That skill owns the `/manage`, `/grind`, `/solve` command reference |
| Creating or updating Linear issues from within a loop | `linear` | Linear skill owns issue lifecycle; this skill only covers loop mechanics |
| Implementing the task itself inside a loop iteration | `task-execution` | Task-execution owns the research-implement-verify protocol per task |
| Wiring up hook code (PreToolUse, PostToolUse, Stop) | `hook-patterns` | Hook-patterns owns the hook lifecycle; this skill only references hooks as loop components |
| Setting budget caps or model routing for loop agents | `agent-control` | Agent-control owns the control plane including budget and safety caps at the system level |
