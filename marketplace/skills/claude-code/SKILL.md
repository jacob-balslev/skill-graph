---
name: claude-code
description: "Use when deciding whether to run a task in the Claude Code agent harness, when scoping work to its native capabilities (skills, hooks, subagents, MCP, plan mode, 1M-context Opus, background tasks, slash commands), or when choosing Claude Code versus a different harness (Codex, OpenCode, Copilot) for a given piece of work. Covers what the harness is good at, the extensibility stack and when each layer earns its keep, and the decision boundaries against rival harnesses. Do NOT use for writing Anthropic SDK / API code (use `claude-api`), for choosing which Claude MODEL to route a task to versus GPT (use `gpt-5-5`), or for designing a generic autonomous agent loop (use `autonomous-loop-patterns`). Do NOT use for write a Python script that calls the Anthropic Messages API. Do NOT use for is GPT-5.5 or Opus better for this code review? Do NOT use for design a resumable autonomous loop with a supervisor."
license: MIT
compatibility: "Harness-knowledge skill. Facts current as of 2026-06-08 (Claude Opus 4.8 era); the harness ships new features fast, so verify capability claims against current Claude Code docs before relying on a specific version detail."
allowed-tools: Read Grep
metadata:
  subject: agent-ops
  subjects: "[\"agent-ops\",\"ai-engineering\"]"
  public: "true"
  scope: "Choosing and scoping work for the Claude Code agent/CLI harness — its capability surface (the skills + hooks + subagents extensibility stack, MCP, plan mode, 1M-context Opus, run_in_background tasks, slash commands), what it is decisively good at, and how to decide between it and a rival harness (Codex, OpenCode, Copilot) for a task. Portable across any project that uses Claude Code; principle- and capability-grounded, not repo-bound. Excludes Anthropic SDK/API coding (claude-api), Claude-vs-GPT model routing (gpt-5-5), and generic agent-loop design (autonomous-loop-patterns)."
  taxonomy_domain: agent/harness
  mental_model: "The harness is the body; the model is the brain. The model decides what to do; the harness decides what the model is allowed to do and how its actions are gated, rendered, parallelized, and persisted. Choosing this harness is choosing that body — its permission model, extensibility layers, and context budget — not just the underlying model."
  purpose: "A frontier model alone cannot safely operate a codebase. The harness supplies the missing scaffolding — typed tool surfaces the host can gate, lifecycle hooks for automation and security, isolated subagent context windows, on-demand skill loading, and a plan-before-act mode — so a long-horizon coding task can run autonomously without losing control or context."
  concept_boundary: "It is not the model provider's API or SDK (that is application code you write), not the model itself (the model is swappable inside the harness), and not a generic 'agent framework' you assemble — it is one specific, opinionated harness with a fixed protocol."
  analogy: "Picking a harness is like picking the cockpit, not the pilot — the same pilot flies differently depending on which instruments, autopilot, and safety interlocks the cockpit gives them."
  misconception: "That the harness and the model are the same choice. They are two orthogonal decisions: which harness (this one vs a rival) and which model runs inside it. Conflating them leads to picking a harness for a model strength it does not own, or vice versa."
  stability: experimental
  keywords: "[\"claude code harness\",\"when to use claude code\",\"claude code skills hooks subagents\",\"claude code vs codex\",\"claude code plan mode\",\"1M context opus\",\"run_in_background tasks\",\"claude code mcp\",\"agent harness comparison\",\"claude code slash commands\"]"
  examples: "[\"should I run this refactor in Claude Code or hand it to Codex?\",\"what is Claude Code actually good at compared to other agent CLIs?\",\"do I need a hook, a subagent, or a skill for this?\"]"
  anti_examples: "[\"write a Python script that calls the Anthropic Messages API\",\"is GPT-5.5 or Opus better for this code review?\",\"design a resumable autonomous loop with a supervisor\"]"
  grounding: "{\"subject_matter\":\"Claude Code model routing and command/runtime capability facts\",\"grounding_mode\":\"hybrid\",\"truth_sources\":[\"skills/agent-ops/claude-code/references/model-facts.md\"],\"failure_modes\":[\"stale_model_id\",\"stale_context_window\",\"stale_pricing_or_rate_limit\",\"benchmark_claim_without_date\",\"capability_claim_quoted_from_memory\"],\"evidence_priority\":\"repo_code_first\"}"
  relations: "{\"related\":[\"codex\",\"gpt-5-5\",\"claude-opus\",\"autonomous-loop-patterns\",\"agent-eval-design\"],\"suppresses\":[{\"skill\":\"gpt-5-5\",\"reason\":\"I own the Claude Code harness decision; gpt-5-5 owns routing a task to the GPT MODEL vs Claude\"},{\"skill\":\"codex\",\"reason\":\"I own the Claude Code harness scope; codex owns the rival Codex harness decision\"}],\"verify_with\":[\"codex\",\"gpt-5-5\"]}"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/agent-ops/claude-code/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# Claude Code

## Concept of the skill

**What it is:** Claude Code is Anthropic's terminal-first agent harness — a CLI and runtime that drives a frontier Claude model (Opus 4.8 as of mid-2026) through a real codebase with a native extensibility stack: skills, hooks, subagents, MCP, plan mode, background tasks, and slash commands.

**Mental model:** The harness is the *body*; the model is the *brain*. The model decides what to do; the harness decides what the model is allowed to do and how its actions are gated, rendered, parallelized, and persisted. Choosing Claude Code is choosing that body — its permission model, its extensibility layers, and its context budget — not just the underlying model.

**Why it exists:** A frontier model alone cannot safely operate a codebase. The harness supplies the missing scaffolding — typed tool surfaces the host can gate, lifecycle hooks for automation and security, isolated subagent context windows, on-demand skill loading, and a plan-before-act mode — so a long-horizon coding task can run autonomously without losing control or context.

**What it is NOT:** It is not the Anthropic API or SDK (that is application code you write), not the Claude model itself (the model is swappable inside the harness), and not a generic "agent framework" you assemble — it is one specific, opinionated harness with a fixed protocol.

**Adjacent concepts:** the Codex CLI (the GPT-running rival harness), OpenCode (the provider-agnostic open-source harness), the Claude API (the SDK surface for building your own harness), and generic autonomous-loop patterns (the topology underneath any harness).

**One-line analogy:** Picking a harness is like picking the cockpit, not the pilot — the same pilot flies differently depending on which instruments, autopilot, and safety interlocks the cockpit gives them.

**Common misconception:** That "Claude Code" and "Claude" are the same choice. They are two orthogonal decisions: *which harness* (Claude Code vs Codex vs OpenCode) and *which model* runs inside it. Conflating them leads to picking a harness for a model strength it does not own, or vice versa.

## Coverage

- The harness-selection decision: when a task wants Claude Code's native capabilities over a rival harness (Codex, OpenCode, Copilot), and when a rival's differentiator makes it the better fit
- The extensibility stack and when each layer earns its keep: skills (on-demand expertise), hooks (lifecycle automation/security gates), subagents (isolated parallel context), MCP (external connectors), plan mode (investigate-before-act), background tasks (`run_in_background`), slash commands
- The capability surface that drives the choice: 1M-context Opus inside the harness, cross-session context, typed host-gatable tools, the permission model
- The decision boundaries against rival harnesses, framed by each rival's specific strength (terminal-bench leadership, provider-agnostic model routing)
- The strengths and watch-outs (Anthropic-first model routing, fast-moving feature surface that ages version claims, background-dispatch git-permission caveat)
- Out of scope and where it routes instead: Anthropic SDK/API coding (`claude-api`), Claude-vs-GPT model routing (`gpt-5-5`), generic agent-loop topology (`autonomous-loop-patterns`)

## When to use Claude Code (routing decision)

Reach for Claude Code when the task wants its **native extensibility stack** or its **plan-then-act control**, and the work lives in a real repo:

| Want this | Why Claude Code fits |
|---|---|
| On-demand, reusable expertise the agent loads only when relevant | **Skills** — progressive disclosure via the Skill tool; the description sits in context, the body loads on demand |
| Deterministic automation or a security gate around the agent's actions | **Hooks** — use lifecycle hook points such as `PreToolUse` for gates that must run before tools execute; verify the current hook event list before depending on a specific count |
| Parallel or isolated sub-work without polluting the main context | **Subagents** — each runs in its own context window; only a summary returns |
| Investigate-and-propose before any edit lands | **Plan mode** — read-only planning phase, then execute on approval |
| Kick off a long shell job and keep working | **Background tasks** — `run_in_background` on the Bash tool; notified on completion |
| A very large codebase or multi-day project held in one window | **1M context** on the Opus tier (no long-context premium on the Opus model), with cross-session context carry |
| Anthropic-first reasoning quality on architecture and large-codebase work | Runs Opus; treat current benchmark claims as dated routing evidence and re-check them before making a model-choice decision |

Choose a **different harness** when its differentiator is the point of the task — see the boundary table below.

## Capability surface

| Layer | What it gives you | When it earns its keep |
|---|---|---|
| Skills | Named instruction bundles, loaded on demand via the Skill tool | Recurring domain knowledge the base prompt should not always carry |
| Hooks | Lifecycle automation at 25 points (e.g. `PreToolUse`) | Security gates, formatters, telemetry, "always do X before/after Y" |
| Subagents | Isolated-context specialized instances | Fan-out, noisy investigation, parallel independent workstreams |
| MCP | External tool/data connectors | Capabilities with no native CLI — but prefer a CLI when one exists |
| Plan mode | Read-only investigate-then-propose phase | High-stakes or unfamiliar code where a wrong edit is expensive |
| Background tasks | `run_in_background` Bash jobs with completion notification | Long builds, test suites, dev servers that should not block the loop |
| Slash commands | User-typed `/command` workflows from `.claude/commands/` | Repeatable operator workflows |
| 1M-context Opus | The model's full window inside the harness | Large repos, long sessions, multi-day projects |

## Strengths and weaknesses

**Strengths**
- The richest native extensibility protocol (skills + hooks + subagents) of the major harnesses — no assembly required.
- Plan mode plus typed, host-gatable tools give strong control over destructive actions.
- Runs Opus; current benchmark snapshots favor it for architectural reasoning and complex multi-file issue resolution, but model-routing claims must be re-checked against the dated fact source before use.
- 1M context on the Opus tier with no long-context premium; cross-session context for multi-day work.

**Weaknesses / watch-outs**
- Anthropic-first: it does not natively route to non-Anthropic models the way OpenCode does (a non-Claude lane needs a different harness).
- The harness ships features fast — version-specific capability claims (hook count, effort tiers, flags) go stale quickly; verify against current docs.
- For pure terminal-command planning/iteration, the GPT-running Codex leads Terminal-Bench 2.0 — Claude Code is not automatically the right harness for every task.
- Background-dispatched subagents have had unreliable `git`-commit permission propagation in this workspace (commit-deliverable work prefers foreground dispatch).

## Philosophy of the skill

Harness choice is an axis people routinely collapse into model choice, and that collapse is where bad decisions come from. The opinionated stance here is that you pick the *body* on the strength it actually owns — the extensibility protocol, the control surface, the context budget — not on a model strength that travels with the model regardless of harness. The corollary is anti-tribal: the best harness for a given task is not always the one whose model you prefer. A task that lives in terminal-command iteration may belong on the rival even when you favour Anthropic's reasoning; a non-Anthropic-model lane forces a provider-agnostic harness no matter how good the native extensibility is. The skill is therefore deliberately written to *route work away from itself* when a rival's differentiator is the point of the task — a harness skill that never says "use the other one" is a sales pitch, not a routing contract. And because the harness ships features fast, the discipline is to treat every version-specific capability claim as perishable: verify against current docs, never quote a hook count or flag from memory.

## Verification

Before concluding "run this in Claude Code," confirm:

- [ ] The decision is about the HARNESS (which body runs the task), not about the model (Claude vs GPT → `gpt-5-5`) or the SDK call (→ `claude-api`).
- [ ] The task genuinely wants a native capability the harness owns (a specific layer of the skills/hooks/subagents/MCP/plan-mode/background/1M-context stack) — name the layer, not just "it's a coding task."
- [ ] No rival harness's differentiator is the actual point of the task (terminal-command leadership → `codex`; non-Anthropic-model routing → OpenCode). If one is, route there.
- [ ] Any version-specific capability claim used in the decision (hook count, effort tiers, flags, 1M-context behavior) was checked against current Claude Code docs, not quoted from memory — the harness ages claims fast.

## Do NOT Use When

| Instead of `claude-code` | Use | Why |
|---|---|---|
| Writing code that calls the Anthropic Messages API / SDK | `claude-api` | That is application code, not a harness-selection decision |
| Deciding whether GPT-5.5 or Claude should do the task | `gpt-5-5` | That is a MODEL-routing decision, orthogonal to the harness |
| Choosing the resumable-session, `exec`-piping GPT harness | `codex` | When the task wants Codex's specific differentiators |
| Designing a generic resumable/supervised agent loop | `autonomous-loop-patterns` | That is loop topology, below any specific harness |

## References

- `references/model-facts.md` — verified capability + model facts (Opus 4.8 era, 2026-06-08) with sources
- Sibling skills `codex` and `gpt-5-5` — the rival-harness and model-routing decisions this skill defers to

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `agent-ops` (also: `ai-engineering`)
- Public: `true`
- Domain: `agent/harness`
- Scope: Choosing and scoping work for the Claude Code agent/CLI harness — its capability surface (the skills + hooks + subagents extensibility stack, MCP, plan mode, 1M-context Opus, run_in_background tasks, slash commands), what it is decisively good at, and how to decide between it and a rival harness (Codex, OpenCode, Copilot) for a task. Portable across any project that uses Claude Code; principle- and capability-grounded, not repo-bound. Excludes Anthropic SDK/API coding (claude-api), Claude-vs-GPT model routing (gpt-5-5), and generic agent-loop design (autonomous-loop-patterns).

**When to use**
- should I run this refactor in Claude Code or hand it to Codex?
- what is Claude Code actually good at compared to other agent CLIs?
- do I need a hook, a subagent, or a skill for this?

**Not for**
- write a Python script that calls the Anthropic Messages API
- is GPT-5.5 or Opus better for this code review?
- design a resumable autonomous loop with a supervisor
- Owned by `gpt-5-5`
- Owned by `codex`

**Related skills**
- Verify with: `codex`, `gpt-5-5`
- Related: `codex`, `gpt-5-5`, `claude-opus`, `autonomous-loop-patterns`, `agent-eval-design`

**Concept**
- Mental model: The harness is the body; the model is the brain. The model decides what to do; the harness decides what the model is allowed to do and how its actions are gated, rendered, parallelized, and persisted. Choosing this harness is choosing that body — its permission model, extensibility layers, and context budget — not just the underlying model.
- Purpose: A frontier model alone cannot safely operate a codebase. The harness supplies the missing scaffolding — typed tool surfaces the host can gate, lifecycle hooks for automation and security, isolated subagent context windows, on-demand skill loading, and a plan-before-act mode — so a long-horizon coding task can run autonomously without losing control or context.
- Boundary: It is not the model provider's API or SDK (that is application code you write), not the model itself (the model is swappable inside the harness), and not a generic 'agent framework' you assemble — it is one specific, opinionated harness with a fixed protocol.
- Analogy: Picking a harness is like picking the cockpit, not the pilot — the same pilot flies differently depending on which instruments, autopilot, and safety interlocks the cockpit gives them.
- Common misconception: That the harness and the model are the same choice. They are two orthogonal decisions: which harness (this one vs a rival) and which model runs inside it. Conflating them leads to picking a harness for a model strength it does not own, or vice versa.

**Grounding**
- Mode: `hybrid`
- Truth sources: `skills/agent-ops/claude-code/references/model-facts.md`

**Keywords**
- `claude code harness`, `when to use claude code`, `claude code skills hooks subagents`, `claude code vs codex`, `claude code plan mode`, `1M context opus`, `run_in_background tasks`, `claude code mcp`, `agent harness comparison`, `claude code slash commands`

<!-- skill-graph-context:end -->
