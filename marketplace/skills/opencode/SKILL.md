---
name: opencode
description: "Use when deciding whether to run a task on the OpenCode agent runtime (the open-source, provider-agnostic terminal coding agent), how to invoke it non-interactively with `opencode run`, how to pick a `provider/model` string, or how OpenCode differs from Claude Code and Codex. Covers its 75+-provider model routing, the OpenCode Zen curated/free model service, model-selection precedence, local models, and scripting/automation invocation. Do NOT use when choosing WHICH free model to route specific work to (use `opencode-free-models`), when the runtime is already chosen and you only need to write the agent loop (use `autonomous-loop-patterns`), or for GitHub Copilot's premium-request economics (use `github-copilot`). Do NOT use for which free model should I use for this classification job? Do NOT use for how do I structure the autonomous agent loop itself? Do NOT use for how many Copilot premium requests will this burn?"
license: MIT
compatibility: "Markdown, any agent runtime; describes the OpenCode CLI (Node-based)"
allowed-tools: Read Bash
metadata:
  subject: agent-ops
  subjects: "[\"agent-ops\",\"ai-engineering\"]"
  public: "true"
  scope: "Choosing and operating the OpenCode agent runtime: when OpenCode is the right runtime vs a single-vendor CLI, non-interactive invocation via `opencode run` and its flags, the `provider/model` string format and model-selection precedence, the OpenCode Zen curated/free model service, local-model configuration, and automation patterns. Portable knowledge about a public open-source tool — no project-internal config. Out: choosing which specific free model fits a task (opencode-free-models), authoring the agent/loop logic itself (autonomous-loop-patterns), and GitHub Copilot billing (github-copilot)."
  taxonomy_domain: agent/harness
  stability: experimental
  keywords: "[\"opencode runtime\",\"opencode run non-interactive\",\"opencode model routing\",\"provider/model string\",\"opencode zen\",\"multi-provider coding agent\",\"opencode vs claude code\",\"run free model in terminal\",\"opencode CLI automation\"]"
  examples: "[\"should I run this on OpenCode or Claude Code?\",\"how do I invoke opencode non-interactively from a script?\",\"what's the provider/model string format for opencode run?\"]"
  anti_examples: "[\"which free model should I use for this classification job?\",\"how do I structure the autonomous agent loop itself?\",\"how many Copilot premium requests will this burn?\"]"
  relations: "{\"related\":[\"opencode-free-models\",\"github-copilot\",\"autonomous-loop-patterns\",\"ai-native-development\"],\"suppresses\":[{\"skill\":\"opencode-free-models\",\"reason\":\"I own the OpenCode RUNTIME (invocation, routing mechanics, Zen service); opencode-free-models owns WHICH free model to route a given task to\"},{\"skill\":\"github-copilot\",\"reason\":\"I own the OpenCode runtime; github-copilot owns Copilot's premium-request / AI-credit economics and IDE-native flow\"}],\"verify_with\":[\"opencode-free-models\"]}"
  mental_model: "A coding-agent runtime is the HARNESS (the loop, tool use, session, permissions); the model is a swappable engine behind a provider/model string. A provider-agnostic runtime separates the two cleanly — pick the harness once, switch the engine per task — where single-vendor CLIs weld the harness to one engine."
  purpose: "It exists so one terminal agent can reach any model — frontier, cheap, free, or local — through a single configuration, without a separate CLI per vendor and without vendor lock-in, so model choice becomes a per-task routing decision rather than a tooling commitment."
  concept_boundary: "This owns the RUNTIME: choosing and operating the provider-agnostic harness, its non-interactive invocation, the provider/model string and selection precedence, the curated/free model service, and local-model config. It does NOT own which specific model a task should route to, the agent-loop logic itself, or another tool's premium-credit economics."
  analogy: "It is a universal power-tool body with a swappable bit — the body (harness) stays, you snap in whichever bit (model) the job needs, including the free ones in the case."
  misconception: "That the runtime's name denotes a model or a quality tier. It does not — the runtime is just the harness; capability and cost come entirely from the provider/model routed to, so naming the runtime says nothing about how capable or expensive a run was."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/agent-ops/opencode/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# OpenCode

## Concept of the skill

**What it is:** OpenCode is an open-source, provider-agnostic AI coding agent for the terminal — a runtime that routes a single agent loop across 75+ LLM providers (and local models) through one configuration, usable both as an interactive TUI and as a non-interactive `opencode run` command for scripting.

**Mental model:** A coding-agent runtime is the *harness* (the loop, tool use, session, permissions); the *model* is a swappable engine behind a `provider/model` string. OpenCode separates those two cleanly — pick the harness once, switch the engine per task. Single-vendor CLIs weld the harness to one engine; OpenCode decouples them.

**Why it exists:** To let one terminal agent reach any model (frontier, cheap, free, or local) without a separate CLI per vendor and without vendor lock-in, so model choice becomes a routing decision rather than a tooling commitment.

**What it is NOT:** It is not a model, not a hosted marketplace, and not the agent loop *logic* — it is the runtime that executes a loop against whatever model you route to. It is also not a billing model: cost depends entirely on which `provider/model` you select.

**Adjacent concepts:** the model that the runtime drives (the swappable engine); the agent loop the runtime executes; single-vendor CLIs that bind one harness to one engine; a model-routing layer that picks the engine per task.

**One-line analogy:** OpenCode is a universal power tool body with a swappable bit — the body (harness) stays, you snap in whichever bit (model) the job needs, including the free ones in the case.

**Common misconception:** That "OpenCode" names a model or a quality tier. It does not — it is the harness; quality and cost come entirely from the `provider/model` you route to, so "I used OpenCode" says nothing about how capable or expensive the run was.

## Coverage

- When to choose the OpenCode runtime over a single-vendor CLI (Claude Code, Codex) — the harness-vs-engine decision
- Non-interactive invocation: `opencode run` and its flags for scripting/automation (`--model`, `--continue`, `--session`, `--fork`, `--file`, `--format json`)
- The `provider/model` string format and the four-step model-selection precedence at startup
- The OpenCode Zen curated/free model service: what it is, the promotional free tier, and per-1M-token paid models
- Local-model configuration (Ollama, LM Studio) as standard providers
- Auth, model discovery (`opencode models`), and agent/mode/permission definition (`opencode agent create`)
- What OpenCode is NOT: a model, a quality tier, a hosted marketplace, or the agent-loop logic

## Philosophy of the skill

The runtime and the model are two separable decisions, and OpenCode's entire value is honoring that separation. The tempting shortcut — treating "we ran it on OpenCode" as if it implied a capability or a cost — is exactly the conflation the harness-vs-engine model exists to prevent. Pick the harness for what the *task needs from the loop* (multi-provider routing, a free lane, local models, scriptability, open source); pick the model separately for what the task needs from the *engine* (capability, context window, cost). Welding the two together is what single-vendor CLIs do; OpenCode's discipline is to keep them apart so model choice stays a per-task routing decision rather than a tooling commitment.

## When to choose OpenCode (routing decision)

Pick the runtime by what the task needs from the *harness*, then pick the model separately.

| Situation | Use OpenCode? | Why |
|---|---|---|
| You need to route the same task across many vendors / compare models | Yes | One harness, 75+ providers via the AI SDK + Models.dev; no per-vendor CLI |
| You want a free or cheap model lane in the terminal | Yes | OpenCode Zen exposes a free tier; single-vendor CLIs do not |
| You need to run a local/offline model (Ollama, LM Studio) | Yes | Local runners are configured as standard providers |
| You want an open-source, scriptable, non-interactive agent | Yes | `opencode run` + `--format json` for automation |
| You are committed to one vendor's CLI features (e.g. Claude Code skills injection, Codex sandboxing) | Often no | Those CLIs are tuned to their own model/ecosystem |
| The decision is *which model*, not *which runtime* | No | That is a model-routing question (see `opencode-free-models`) |

## Capability reference

| Surface | Form | Notes |
|---|---|---|
| Non-interactive run | `opencode run [message..]` | The scripting/automation entry; no TUI |
| Model select | `--model` / `-m` `provider/model` | e.g. `anthropic/claude-sonnet-4-20250514`, `opencode/minimax-m3-free` |
| Continue session | `--continue`/`-c`, `--session`/`-s <id>`, `--fork` | Resume or branch prior context |
| Attach file | `--file` / `-f` | Add file(s) to the message |
| Machine output | `--format json` | Parse the result in a script |
| Auth | `opencode auth login [--provider ID]` | Per-provider credentials |
| List models | `opencode models [provider]` (`--refresh`) | Discover available `provider/model` ids |
| Define agent | `opencode agent create` | `--permissions`, `--mode all\|primary\|subagent`, `--model` |

**Model-selection precedence (startup):** (1) CLI `--model` → (2) `opencode.json` `model` key → (3) last used session model → (4) internal default. `opencode.json` also carries per-model provider options (reasoning effort, thinking budget).

## Strengths and weaknesses

**Strengths:** vendor-agnostic routing (75+ providers, no lock-in); a real free/cheap lane via OpenCode Zen; local-model support; open source; first-class non-interactive mode for automation; one config for many engines.

**Weaknesses:** quality/cost are entirely a function of the routed model — the runtime guarantees neither; the Zen free roster is promotional and changes (do not hardcode it); trial/free models warn against sending confidential data; it lacks some single-vendor CLIs' deep ecosystem features (e.g. a specific vendor's skill-injection or sandbox model). Choosing OpenCode does not absolve you of choosing the model wisely.

## Verification

Use this checklist to confirm an OpenCode runtime decision was made correctly.

- [ ] The runtime choice was made on harness needs (multi-provider, free lane, local, scriptable), not on an assumed model quality
- [ ] The model was chosen separately via an explicit `provider/model` string — not left to whatever default resolved
- [ ] For automation, `opencode run` (not the TUI) is used, with `--format json` when the result is parsed
- [ ] The selected `provider/model` was confirmed to exist via `opencode models [provider]` rather than guessed
- [ ] If a free Zen model is used, the roster was confirmed live (it is promotional and changes) and no confidential data is sent to a trial model
- [ ] No claim of run quality or cost is attributed to "OpenCode" itself — both are attributed to the routed model

## Do NOT Use When

| Instead of `opencode` | Use | Why |
|---|---|---|
| Picking which free/cheap model fits a specific task | `opencode-free-models` | Model-to-work routing is its own decision; this skill owns the runtime, not the per-task model choice |
| Writing the autonomous agent loop / retry / claim logic | `autonomous-loop-patterns` | That is loop authoring; OpenCode just executes whatever loop you build |
| Reasoning about GitHub Copilot premium-request / AI-credit cost | `github-copilot` | Copilot has a distinct, IDE-native economics model |
| The correct runtime is already chosen and known | Run it directly | No routing decision remains |

## References

- `references/model-facts.md` — current (2026-06-08) OpenCode CLI flags, model precedence, and OpenCode Zen roster with sources.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `agent-ops` (also: `ai-engineering`)
- Public: `true`
- Domain: `agent/harness`
- Scope: Choosing and operating the OpenCode agent runtime: when OpenCode is the right runtime vs a single-vendor CLI, non-interactive invocation via `opencode run` and its flags, the `provider/model` string format and model-selection precedence, the OpenCode Zen curated/free model service, local-model configuration, and automation patterns. Portable knowledge about a public open-source tool — no project-internal config. Out: choosing which specific free model fits a task (opencode-free-models), authoring the agent/loop logic itself (autonomous-loop-patterns), and GitHub Copilot billing (github-copilot).

**When to use**
- should I run this on OpenCode or Claude Code?
- how do I invoke opencode non-interactively from a script?
- what's the provider/model string format for opencode run?

**Not for**
- which free model should I use for this classification job?
- how do I structure the autonomous agent loop itself?
- how many Copilot premium requests will this burn?
- Owned by `opencode-free-models`
- Owned by `github-copilot`

**Related skills**
- Verify with: `opencode-free-models`
- Related: `opencode-free-models`, `github-copilot`, `autonomous-loop-patterns`, `ai-native-development`

**Concept**
- Mental model: A coding-agent runtime is the HARNESS (the loop, tool use, session, permissions); the model is a swappable engine behind a provider/model string. A provider-agnostic runtime separates the two cleanly — pick the harness once, switch the engine per task — where single-vendor CLIs weld the harness to one engine.
- Purpose: It exists so one terminal agent can reach any model — frontier, cheap, free, or local — through a single configuration, without a separate CLI per vendor and without vendor lock-in, so model choice becomes a per-task routing decision rather than a tooling commitment.
- Boundary: This owns the RUNTIME: choosing and operating the provider-agnostic harness, its non-interactive invocation, the provider/model string and selection precedence, the curated/free model service, and local-model config. It does NOT own which specific model a task should route to, the agent-loop logic itself, or another tool's premium-credit economics.
- Analogy: It is a universal power-tool body with a swappable bit — the body (harness) stays, you snap in whichever bit (model) the job needs, including the free ones in the case.
- Common misconception: That the runtime's name denotes a model or a quality tier. It does not — the runtime is just the harness; capability and cost come entirely from the provider/model routed to, so naming the runtime says nothing about how capable or expensive a run was.

**Keywords**
- `opencode runtime`, `opencode run non-interactive`, `opencode model routing`, `provider/model string`, `opencode zen`, `multi-provider coding agent`, `opencode vs claude code`, `run free model in terminal`, `opencode CLI automation`

<!-- skill-graph-context:end -->
