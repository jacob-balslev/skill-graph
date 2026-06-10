---
name: opencode-free-models
description: "Use when deciding WHICH free or cheap agent model to route a piece of work to (e.g. MiniMax M3 Free, NVIDIA Nemotron, GLM, GPT-5 Nano, or another OpenCode Zen free-tier model), what each is good at, where its quality ceiling sits, and when to escalate the same work to a frontier model instead. Covers cost-routing: matching deterministic/mechanical/high-volume work to the cheapest model that clears its bar, and the hard rule that quality-creating and quality-judging work never goes to a free/cheap model. Do NOT use for choosing or operating the OpenCode runtime itself (use `opencode`), for authoring the agent loop (use `autonomous-loop-patterns`), or for GitHub Copilot premium-request budgeting (use `github-copilot`). Do NOT use for how do I invoke opencode from a script? Do NOT use for how do I write the retry loop for my agent? Do NOT use for how many Copilot premium requests will this cost?"
license: MIT
compatibility: "Markdown, any agent runtime; model facts current as of 2026-06"
allowed-tools: Read Bash
metadata:
  subject: agent-ops
  subjects: "[\"agent-ops\",\"ai-engineering\"]"
  public: "true"
  scope: "Cost-routing across free and cheap agent models reachable via a multi-provider runtime: what each free-tier family (MiniMax M3, NVIDIA Nemotron, GLM, GPT-5 Nano-class) is good at, its quality ceiling, which deterministic/mechanical/high-volume work to route to it, the escalate-on-signal rule, and the hard boundary that quality-creating/judging work goes to a frontier model. Portable model-capability knowledge — not any project's private model-roster config. Out: choosing/operating the OpenCode runtime (opencode), authoring the loop (autonomous-loop-patterns), Copilot credit budgeting (github-copilot)."
  taxonomy_domain: agent/models
  stability: experimental
  keywords: "[\"which free model to use\",\"free agent models\",\"opencode zen free tier\",\"minimax nemotron glm routing\",\"cheap model for mechanical work\",\"model cost routing\",\"when to escalate to frontier model\",\"free model quality ceiling\",\"route deterministic work to cheap model\"]"
  examples: "[\"which free model should I send this bulk classification job to?\",\"is MiniMax M3 or Nemotron the better free choice for this?\",\"can I use a free model to grade these eval responses?\"]"
  anti_examples: "[\"how do I invoke opencode from a script?\",\"how do I write the retry loop for my agent?\",\"how many Copilot premium requests will this cost?\"]"
  relations: "{\"related\":[\"opencode\",\"github-copilot\",\"autonomous-loop-patterns\",\"ai-native-development\"],\"suppresses\":[{\"skill\":\"opencode\",\"reason\":\"I own WHICH free/cheap model to route work to; opencode owns the runtime itself (invocation, provider/model strings, Zen service)\"},{\"skill\":\"github-copilot\",\"reason\":\"I own free/cheap open-weight model routing; github-copilot owns Copilot's paid premium-request / AI-credit lane\"}],\"verify_with\":[\"opencode\"]}"
  mental_model: "Every task has a quality BAR; every model has a quality CEILING and a cost. Cost-routing matches the cheapest model whose ceiling clears the task's bar, then escalates only on a concrete signal. Free is the default lane only for work whose bar a competent open-weight model already clears."
  purpose: "It exists because premium model capacity is finite and expensive while a large share of agent work — mechanical edits, bulk classification, high-volume triage — does not need a frontier model. Routing that work to a free/cheap model preserves premium capacity for work that genuinely needs it, but only if the ceiling-vs-bar match is made honestly rather than by reflex."
  concept_boundary: "This owns the per-task MODEL CHOICE among free and cheap models, including the escalation rule and the hard quality boundary. It does NOT own the runtime (how to invoke a model), the agent loop (how to retry/claim), or a paid premium-credit lane's economics."
  analogy: "It is choosing the right gear for the grade — flat ground takes the cheap, fast gear; a steep climb needs the powerful one, and forcing the climb in the cheap gear strips the chain."
  misconception: "That a free model is interchangeable with a frontier model if you just retry enough — or, inversely, that free models are toys. Both are wrong: open-weight models clear a real, sizeable band of work, but their ceiling is real, and retrying cannot raise a model above it, so quality-creating or quality-judging work pushed onto them produces confident garbage that poisons everything downstream."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/agent-ops/opencode-free-models/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# OpenCode Free Models

## Concept of the skill

**What it is:** A cost-routing discipline for free and cheap agent models — deciding which open/open-weight model (and which free-tier lane) a given piece of work should run on, where each model's quality ceiling sits, and when the same work must escalate to a frontier model instead.

**Mental model:** Every task has a quality *bar*; every model has a quality *ceiling* and a cost. Cost-routing matches the cheapest model whose ceiling clears the task's bar, then escalates only on a concrete signal (looping, contradiction, low confidence, or the work crossing into reasoning/judgment). Free is the default lane only for work whose bar a competent open-weight model already clears.

**Why it exists:** Premium model capacity is finite and expensive; a large share of agent work (mechanical edits, bulk classification, high-volume triage) does not need a frontier model. Routing that work to a free/cheap model preserves premium capacity for work that genuinely needs it — but only if the ceiling/bar match is made honestly, not by reflex.

**What it is NOT:** It is not "always use the cheapest model" — that ignores the quality ceiling and silently corrupts work whose output is the quality bar. It is not the runtime (how to invoke a model) and not the loop (how to retry/claim). It is the per-task *model choice*.

**Adjacent concepts:** the runtime that reaches the model; the quality bar a task imposes; a model's quality ceiling and throughput; the escalation signal that promotes work to a frontier model.

**One-line analogy:** It is choosing the right gear for the grade — flat ground takes the cheap, fast gear; a steep climb needs the powerful one, and forcing the climb in the cheap gear strips the chain.

**Common misconception:** That a free model is interchangeable with a frontier model if you just retry enough — or, inversely, that free models are toys. Both are wrong: free open-weight models clear a real, sizeable band of work, but their ceiling is real, and pushing quality-creating or quality-judging work onto them produces confident garbage that poisons everything downstream.

## Coverage

- The cost-routing decision: matching the cheapest model whose quality ceiling clears the task's bar
- What each free/cheap model family is good at (MiniMax M3, NVIDIA Nemotron, GLM-class, GPT-5 Nano-class) and its quality ceiling
- Which work belongs on the free lane: deterministic/mechanical edits, bulk classification/triage, high-volume extraction
- The escalate-on-signal rule — the concrete signals that promote work to a frontier model, and the warning against escalating by default
- The hard boundary: quality-creating and quality-judging work (grading, eval scoring, audit verdicts, architecture, security, correctness-critical synthesis) never goes to a free/cheap model
- The promotional, changing nature of free-tier rosters and how to confirm them at run time

## Philosophy of the skill

Cost-routing is adversarial against two opposite reflexes. The first — "always use the cheapest model" — ignores the quality ceiling and silently corrupts any work whose output is the quality bar. The second — "free models are toys, use a frontier model to be safe" — wastes premium capacity on work a competent open-weight model already clears. The discipline is to refuse both reflexes and instead make the ceiling-vs-bar match explicitly, per task, escalating only on a concrete signal. The single non-negotiable line in that discipline is that retrying cannot raise a model above its ceiling, so quality-creating and quality-judging work — where a wrong answer poisons everything built on it — is always frontier work, never a cost tradeoff.

## The routing decision

Match work to the cheapest model whose ceiling clears its bar. Escalate on signal, never by default.

| Work type | Route to | Why |
|---|---|---|
| Deterministic / mechanical (rename, format, transcribe, poll, convert) | A script first; else the cheapest free model (GPT-5 Nano-class) | No reasoning; a frontier model is wasted spend |
| Bulk classification / triage / extraction at volume | A high-throughput free model (Nemotron-class) | Throughput + a capped thinking budget; per-item bar is low |
| Large-context agentic coding on a big repo | MiniMax M3 Free (1M context) | Only free option with frontier-band coding AND a huge context window |
| Long iterative autonomous coding loop | GLM-class | Re-reviews its own strategy across many iterations instead of getting stuck |
| **Quality creation or judging** — grading, eval scoring, audit verdicts, architecture, security, correctness-critical synthesis | **A frontier model — NEVER a free/cheap model** | A weak judge or author silently poisons every downstream decision built on it |

**Escalate to a frontier model when:** the free model loops without progress, contradicts itself, returns a malformed or low-confidence result, the task crosses into reasoning/architecture/security, or the output itself becomes the quality bar (it gets graded, shipped as correct, or relied on as a decision). **Do not escalate** merely because a frontier model is available — that erases the cost lane.

## Free-model capability table (2026 snapshot — verify the live roster)

| Model family | Best at | Quality ceiling / tradeoff |
|---|---|---|
| MiniMax M3 (Free) | Frontier-band coding + agentic work; 1M-token context | Highest-capability free lane; the strongest free default for large-context coding |
| NVIDIA Nemotron 3 (Super/Ultra) | High-throughput reasoning, long-running agents, capped thinking budget | Great for volume/throughput lanes; not the top-end coding choice |
| GLM-5 / GLM-5.1 | Extended autonomous coding; strategy re-review over long loops | Strong agentic coding; weaker on pure reasoning/knowledge tasks |
| GPT-5 Nano / nano-flash-mini class | Cheapest, fastest; boilerplate, formatting, extraction, simple classification | Low ceiling for multi-step reasoning / correctness-critical synthesis |

The OpenCode Zen free roster is **promotional and changes** — treat any list as a snapshot and confirm at run time (`opencode models opencode`). Trial/free models warn against sending personal or confidential data.

## Strengths and weaknesses of the free lane

**Strengths:** real cost savings on mechanical and high-volume work; open-weight models now clear a sizeable band of agentic/coding work; throughput options for background lanes; a free tier exists at all.

**Weaknesses:** the roster is promotional and unstable; trial models collect feedback and warn against confidential data; the quality ceiling is real and easy to overshoot; the cost saving is illusory if the output must be redone or, worse, silently corrupts a downstream decision. Free models are a *mechanical-and-volume* lane, not a frontier substitute.

## Verification

Use this checklist to confirm a free-model routing decision was made correctly.

- [ ] The task's quality bar was named before a model was chosen (mechanical / high-volume / reasoning / quality-judging)
- [ ] The chosen free model's ceiling was matched to that bar — not picked purely on cost
- [ ] Quality-creating or quality-judging work (grading, eval scoring, audit verdicts, architecture, security) was routed to a frontier model, never a free/cheap one
- [ ] A concrete escalation signal (looping, contradiction, malformed/low-confidence output, scope crossing into reasoning) — not mere availability — was used to escalate
- [ ] The live free-tier roster was confirmed (`opencode models opencode`) rather than assumed from a stale list
- [ ] No confidential data was sent to a trial/free model that warns against it

## Do NOT Use When

| Instead of `opencode-free-models` | Use | Why |
|---|---|---|
| Choosing or operating the OpenCode runtime (invocation, provider/model strings, Zen service) | `opencode` | That is the runtime layer; this skill is the per-task model choice |
| Authoring the agent loop / retry / escalation plumbing | `autonomous-loop-patterns` | This skill decides the model; the loop skill decides the control flow |
| Budgeting GitHub Copilot premium requests / AI credits | `github-copilot` | Copilot is a paid, IDE-native lane with its own economics |
| The work is quality-creating or quality-judging | A frontier model directly | A free/cheap model must never be the author or judge of the quality bar |

## References

- `references/model-facts.md` — current (2026-06-08) free-model capabilities, benchmarks, and the routing table with sources.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `agent-ops` (also: `ai-engineering`)
- Public: `true`
- Domain: `agent/models`
- Scope: Cost-routing across free and cheap agent models reachable via a multi-provider runtime: what each free-tier family (MiniMax M3, NVIDIA Nemotron, GLM, GPT-5 Nano-class) is good at, its quality ceiling, which deterministic/mechanical/high-volume work to route to it, the escalate-on-signal rule, and the hard boundary that quality-creating/judging work goes to a frontier model. Portable model-capability knowledge — not any project's private model-roster config. Out: choosing/operating the OpenCode runtime (opencode), authoring the loop (autonomous-loop-patterns), Copilot credit budgeting (github-copilot).

**When to use**
- which free model should I send this bulk classification job to?
- is MiniMax M3 or Nemotron the better free choice for this?
- can I use a free model to grade these eval responses?

**Not for**
- how do I invoke opencode from a script?
- how do I write the retry loop for my agent?
- how many Copilot premium requests will this cost?
- Owned by `opencode`
- Owned by `github-copilot`

**Related skills**
- Verify with: `opencode`
- Related: `opencode`, `github-copilot`, `autonomous-loop-patterns`, `ai-native-development`

**Concept**
- Mental model: Every task has a quality BAR; every model has a quality CEILING and a cost. Cost-routing matches the cheapest model whose ceiling clears the task's bar, then escalates only on a concrete signal. Free is the default lane only for work whose bar a competent open-weight model already clears.
- Purpose: It exists because premium model capacity is finite and expensive while a large share of agent work — mechanical edits, bulk classification, high-volume triage — does not need a frontier model. Routing that work to a free/cheap model preserves premium capacity for work that genuinely needs it, but only if the ceiling-vs-bar match is made honestly rather than by reflex.
- Analogy: It is choosing the right gear for the grade — flat ground takes the cheap, fast gear; a steep climb needs the powerful one, and forcing the climb in the cheap gear strips the chain.
- Common misconception: That a free model is interchangeable with a frontier model if you just retry enough — or, inversely, that free models are toys. Both are wrong: open-weight models clear a real, sizeable band of work, but their ceiling is real, and retrying cannot raise a model above it, so quality-creating or quality-judging work pushed onto them produces confident garbage that poisons everything downstream.

**Keywords**
- `which free model to use`, `free agent models`, `opencode zen free tier`, `minimax nemotron glm routing`, `cheap model for mechanical work`, `model cost routing`, `when to escalate to frontier model`, `free model quality ceiling`, `route deterministic work to cheap model`

<!-- skill-graph-context:end -->
