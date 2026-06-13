---
name: codex
description: "Use when deciding whether to run a task in the Codex CLI agent harness (which drives a frontier GPT model), when scoping work to its native capabilities (resumable `codex exec resume` sessions, non-interactive `exec` stdout-piping, in-process dispatch, `/permissions` sandbox modes, MCP, on-demand subagents, the `/review` code-review agent), or when choosing Codex versus the Claude Code harness for a piece of work — and when avoiding its known failure modes (non-autonomous subagents, Full-Access network reach, cold-one-shot context loss). Do NOT use for routing a task to the GPT MODEL versus Claude (use `gpt-5-5`), for the Claude Code harness decision (use `claude-code`), or for designing a generic resumable agent loop (use `autonomous-loop-patterns`). Do NOT use for is GPT-5.5 or Opus the better model for this task? Do NOT use for what is Claude Code good at? Do NOT use for design a resumable supervised loop from scratch."
license: MIT
compatibility: "Harness-knowledge skill. Facts current as of 2026-06-08 (GPT-5.5 generation). The Codex CLI ships features fast — verify command names, flags, and the served GPT model against current OpenAI Codex docs before relying on a specific detail."
allowed-tools: Read Grep
metadata:
  subject: agent-ops
  subjects: "[\"agent-ops\",\"ai-engineering\"]"
  public: "true"
  scope: "Choosing and scoping work for the Codex CLI agent harness (runs a frontier GPT model) — its capability surface (resumable codex exec resume sessions that retain transcript/plan/approvals, non-interactive exec stdout-piping for in-process dispatch, /permissions Auto/Read-only/Full-Access sandbox modes, MCP, explicit-only subagents, the /review code-review agent), what it is good at versus the Claude Code harness, and its known failure modes. Portable across any project that uses Codex; harness-knowledge, not repo-bound. Excludes GPT-vs-Claude model routing (gpt-5-5), the Claude Code harness decision (claude-code), and generic agent-loop design (autonomous-loop-patterns)."
  taxonomy_domain: agent/harness
  stability: experimental
  keywords: "[\"codex cli harness\",\"when to use codex\",\"codex exec resume\",\"resumable codex session\",\"codex vs claude code\",\"codex permissions sandbox\",\"codex review agent\",\"codex in-process dispatch\",\"codex mcp subagents\",\"codex failure modes\"]"
  examples: "[\"should I run this through Codex or Claude Code?\",\"how do I resume my last Codex session non-interactively?\",\"what are Codex's permission modes and when is Full Access risky?\"]"
  anti_examples: "[\"is GPT-5.5 or Opus the better model for this task?\",\"what is Claude Code good at?\",\"design a resumable supervised loop from scratch\"]"
  grounding: "{\"subject_matter\":\"Codex model routing, app capability, and failure-mode facts\",\"grounding_mode\":\"hybrid\",\"truth_sources\":[\"skills/agent-ops/codex/references/model-facts.md\"],\"failure_modes\":[\"stale_model_id\",\"stale_context_window\",\"stale_pricing_or_rate_limit\",\"benchmark_claim_without_date\",\"capability_claim_quoted_from_memory\"],\"evidence_priority\":\"repo_code_first\"}"
  relations: "{\"related\":[\"claude-code\",\"gpt-5-5\",\"autonomous-loop-patterns\",\"claude-opus\"],\"suppresses\":[{\"skill\":\"gpt-5-5\",\"reason\":\"I own running GPT through the Codex CLI harness; gpt-5-5 owns routing the task to the GPT MODEL vs Claude\"},{\"skill\":\"claude-code\",\"reason\":\"I own the Codex harness decision; claude-code owns the Claude Code harness decision\"}],\"verify_with\":[\"claude-code\",\"gpt-5-5\"]}"
  mental_model: "An agent CLI is a HARNESS (the body: loop, tool use, session, permissions) wrapping a swappable frontier MODEL (the brain). What distinguishes this harness among bodies is statefulness — a session is a durable object holding transcript, plan, and approvals that can be resumed by id — plus a non-interactive exec mode that pipes results to stdout for scripting and in-process dispatch."
  purpose: It exists to operate a codebase with a frontier model under a controllable permission boundary while making runs RESUMABLE and SCRIPTABLE — so a long task can be continued across invocations (keeping its plan and approval history) and automated into pipelines instead of restarting cold every time.
  concept_boundary: "This is the HARNESS decision — which agent CLI runs the work, and how to scope its native capabilities and avoid its failure modes. It is NOT routing the task to a model versus another model, NOT the rival harness's decision, and NOT designing a generic resumable agent loop from scratch."
  analogy: "It is a cockpit with a flight recorder and autopilot resume — you can land, walk away, and later climb back into the exact same flight with its plan and clearances intact, instead of taking off from scratch."
  misconception: "That resuming a session means re-pasting context into a fresh run. It does not — resume-by-id reuses the stored transcript, plan, and approvals; cold one-shots that re-send full context every turn waste tokens and discard that state. A second misconception is that the harness auto-spawns subagents; it only does so when explicitly asked."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/agent-ops/codex/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# Codex

## Concept of the skill

**What it is:** Codex is OpenAI's terminal-first agent harness that drives a frontier GPT model (the GPT-5.5 generation). It is the GPT-running counterpart to Claude Code, with its own differentiators: resumable sessions, non-interactive `exec` piping, sandbox permission modes, MCP, on-demand subagents, and a `/review` code-review agent.

**Mental model:** Same harness-vs-model split as any agent CLI — Codex is the *body*, a frontier GPT is the *brain*. What makes Codex distinct among bodies is statefulness: a session is a durable object holding transcript, plan, and approvals that you can resume by ID, plus an `exec` mode that pipes results to stdout for scripting and in-process dispatch.

**Why it exists:** To operate a codebase with a GPT model under a controllable permission boundary, while making runs *resumable and scriptable* — so a long task can be continued across invocations (keeping its plan and approval history) and automated into pipelines instead of restarting cold every time.

**What it is NOT:** It is not the GPT model itself (the model is selectable inside Codex via `/model`), not the OpenAI SDK/API, and not the Claude Code harness — choosing Codex is a harness decision distinct from the GPT-vs-Claude model-routing decision.

**Adjacent concepts:** Claude Code (the rival harness), `gpt-5-5` (the model-routing decision for the GPT the harness runs), the OpenAI API (the SDK surface), and generic resumable-loop patterns (the topology underneath).

**One-line analogy:** Codex is a cockpit with a flight recorder and autopilot resume — you can land, walk away, and later climb back into the exact same flight with its plan and clearances intact.

**Common misconception:** That resuming a Codex session means re-pasting context into a fresh run. It does not — `codex exec resume <SESSION_ID>` reuses the stored transcript, plan, and approvals; cold one-shots that re-send full context every turn waste tokens and discard that state.

## Coverage

- The harness-selection decision: when to run a piece of work in the Codex CLI versus the Claude Code harness
- Scoping work to Codex's native capabilities: resumable `codex exec resume` sessions, non-interactive `exec` stdout-piping, in-process dispatch, `/permissions` sandbox modes, MCP connectors, on-demand subagents, the `/review` code-review agent, `/model` switching
- The threaded-consultation pattern: holding a session across turns by capturing and resuming a session id instead of cold one-shots
- The known failure modes to avoid: non-autonomous subagents, Full-Access network/cross-machine reach, and cold-one-shot context/plan loss
- The boundary against adjacent skills: GPT-vs-Claude model routing (the model, not the harness), the rival Claude Code harness, the OpenAI/Anthropic SDK surface, and generic resumable-loop design
- What this skill is NOT: the GPT model itself, the OpenAI SDK/API, or the Claude Code harness

## Philosophy of the skill

The harness and the model are two separate decisions, and conflating them is the most common error this skill guards against. Choosing Codex is a statement about the *body* — its statefulness, scriptability, permission boundary, and operating surface — not about the brain it happens to run; the model is selectable inside it. The opinionated stance is that statefulness is the differentiator worth optimizing for: a session that durably holds transcript, plan, and approvals turns long multi-step work from a sequence of cold restarts into one continuable flow, and an `exec` mode that pipes to stdout turns an interactive agent into a scriptable pipeline component. The corollary discipline is to treat the harness's powerful modes as boundaries, not conveniences — Full Access is a deliberate escalation, subagents are an explicit request, and a resume is always preferred over re-priming.

## When to use Codex (routing decision)

Reach for Codex when the task wants its **statefulness, scriptability, or GPT lane**, and the work lives in a real repo:

| Want this | Why Codex fits |
|---|---|
| Continue a prior run keeping its plan + approvals | **Resumable sessions** — `codex resume` / `codex exec resume <ID>` |
| A scripted, threaded, automatable GPT consultation | **`exec` stdout-piping** + resume-by-id (the threaded-consultation pattern) |
| In-process GPT dispatch (vs a visible external spawn) | `exec` powers in-process dispatch (e.g. the `codex:codex-rescue` subagent) |
| A controllable permission boundary | **`/permissions`** — Auto / Read-only / Full Access |
| A dedicated diff review pass | **`/review`** — prioritized, actionable findings |
| Real CLI/terminal-heavy iteration | The GPT it runs leads Terminal-Bench 2.0 (82.7%) |

Choose Claude Code instead when the task wants Claude Code's richer native extensibility, plan mode, or Opus's architecture edge — see the boundary table.

## Capability surface

| Feature | What it gives you | When it earns its keep |
|---|---|---|
| `codex resume` / `exec resume <ID>` / `--last` / `--all` | Resume a session by id/most-recent, across any dir | Multi-step work continued without re-priming context |
| `exec` (non-interactive) | Pipes final plan + results to stdout | Scripting, pipelines, in-process dispatch |
| `/permissions` (Auto / Read-only / Full Access) | Sandbox boundary for the agent's actions | Gating destructive or networked actions |
| MCP (`~/.codex/config.toml`, `codex mcp`) | External tool/data connectors | Capabilities with no native CLI |
| Subagents (`[agents]` in config) | Parallel sub-work — **explicit request only** | Fan-out you deliberately invoke (never assume auto) |
| `/review` | Dedicated diff-review agent | A focused review pass with ranked findings |
| `/model` | Switch GPT model / reasoning level mid-session | Tuning the model/effort to the task |
| `--cd` / `--add-dir` | Steer the environment before resuming | Pointing a resumed run at the right roots |

## Strengths and weaknesses

**Strengths**
- Durable, resumable sessions that retain transcript, plan, and approvals — uniquely strong for threaded, multi-step GPT work.
- `exec` stdout-piping makes it scriptable and dispatchable in-process.
- Runs a GPT that leads Terminal-Bench 2.0 — well-matched to its CLI operating surface.
- Explicit sandbox modes give a clear permission boundary.

**Weaknesses / failure modes**
- **Subagents are not autonomous** — Codex only spawns them when explicitly asked; do not assume automatic fan-out.
- **Full Access opens network + cross-machine reach** — a real safety boundary; default to Auto/Read-only and escalate deliberately.
- **Cold one-shots lose state** — re-sending full context instead of `exec resume <ID>` wastes tokens and discards the plan/approval history.
- Its GPT trails Claude Opus on complex multi-file resolution and broad architecture (a model fact that bleeds into harness choice for those task shapes).

## Verification

Use this checklist to confirm a Codex harness decision is correct and current.

- [ ] The decision was framed as a HARNESS choice (statefulness, scriptability, permission boundary, operating surface) — not as a model-routing decision in disguise
- [ ] For continued work, a resumable session (`codex resume` / `codex exec resume <ID>` / `--last`) is used instead of a cold one-shot that re-pastes context
- [ ] For automation/pipelines, the non-interactive `exec` (stdout-piping) path is used rather than the interactive TUI
- [ ] The permission mode was chosen deliberately: Auto/Read-only by default, Full Access only when network/cross-machine reach is genuinely required and its risk is accepted
- [ ] Subagent fan-out, if expected, is explicitly requested — the harness does NOT spawn subagents autonomously
- [ ] Command names, flags, and the served GPT generation were re-checked against current provider docs (the CLI ships features fast) before relying on a specific detail

## Do NOT Use When

| Instead of `codex` | Use | Why |
|---|---|---|
| Deciding whether GPT-5.5 or Claude should do the task | `gpt-5-5` | That is a MODEL-routing decision, orthogonal to the harness |
| Choosing/scoping the Claude Code harness | `claude-code` | The rival-harness decision |
| Writing code against the OpenAI/Anthropic API | `claude-api` (Anthropic) or the OpenAI SDK directly | That is application code, not harness selection |
| Designing a generic resumable/supervised agent loop | `autonomous-loop-patterns` | Loop topology below any specific harness |

## References

- `references/model-facts.md` — verified Codex capability + failure-mode facts (2026-06-08) with sources
- Sibling skills `claude-code` (the rival harness) and `gpt-5-5` (the GPT model-routing decision this harness choice defers to)

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `agent-ops` (also: `ai-engineering`)
- Public: `true`
- Domain: `agent/harness`
- Scope: Choosing and scoping work for the Codex CLI agent harness (runs a frontier GPT model) — its capability surface (resumable codex exec resume sessions that retain transcript/plan/approvals, non-interactive exec stdout-piping for in-process dispatch, /permissions Auto/Read-only/Full-Access sandbox modes, MCP, explicit-only subagents, the /review code-review agent), what it is good at versus the Claude Code harness, and its known failure modes. Portable across any project that uses Codex; harness-knowledge, not repo-bound. Excludes GPT-vs-Claude model routing (gpt-5-5), the Claude Code harness decision (claude-code), and generic agent-loop design (autonomous-loop-patterns).

**When to use**
- should I run this through Codex or Claude Code?
- how do I resume my last Codex session non-interactively?
- what are Codex's permission modes and when is Full Access risky?

**Not for**
- is GPT-5.5 or Opus the better model for this task?
- what is Claude Code good at?
- design a resumable supervised loop from scratch
- Owned by `gpt-5-5`
- Owned by `claude-code`

**Related skills**
- Verify with: `claude-code`, `gpt-5-5`
- Related: `claude-code`, `gpt-5-5`, `autonomous-loop-patterns`, `claude-opus`

**Concept**
- Mental model: An agent CLI is a HARNESS (the body: loop, tool use, session, permissions) wrapping a swappable frontier MODEL (the brain). What distinguishes this harness among bodies is statefulness — a session is a durable object holding transcript, plan, and approvals that can be resumed by id — plus a non-interactive exec mode that pipes results to stdout for scripting and in-process dispatch.
- Purpose: It exists to operate a codebase with a frontier model under a controllable permission boundary while making runs RESUMABLE and SCRIPTABLE — so a long task can be continued across invocations (keeping its plan and approval history) and automated into pipelines instead of restarting cold every time.
- Boundary: This is the HARNESS decision — which agent CLI runs the work, and how to scope its native capabilities and avoid its failure modes. It is NOT routing the task to a model versus another model, NOT the rival harness's decision, and NOT designing a generic resumable agent loop from scratch.
- Analogy: It is a cockpit with a flight recorder and autopilot resume — you can land, walk away, and later climb back into the exact same flight with its plan and clearances intact, instead of taking off from scratch.
- Common misconception: That resuming a session means re-pasting context into a fresh run. It does not — resume-by-id reuses the stored transcript, plan, and approvals; cold one-shots that re-send full context every turn waste tokens and discard that state. A second misconception is that the harness auto-spawns subagents; it only does so when explicitly asked.

**Grounding**
- Mode: `hybrid`
- Truth sources: `skills/agent-ops/codex/references/model-facts.md`

**Keywords**
- `codex cli harness`, `when to use codex`, `codex exec resume`, `resumable codex session`, `codex vs claude code`, `codex permissions sandbox`, `codex review agent`, `codex in-process dispatch`, `codex mcp subagents`, `codex failure modes`

<!-- skill-graph-context:end -->
