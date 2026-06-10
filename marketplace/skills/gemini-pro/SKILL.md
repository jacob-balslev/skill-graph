---
name: gemini-pro
description: "Use when deciding whether to route a task to Google's Gemini Pro frontier model (current Gemini 3.1 Pro generation, moving to Gemini 3.5 Pro) instead of Claude Opus or GPT-5 — especially for very-large-context reasoning (1M-token input), whole-codebase or long-document analysis, native multimodal input (audio/video/PDF/image in one call), or capability-per-dollar at the frontier. Covers the context window, the 200K context-tier pricing cliff, multimodal support, and the per-lane comparison against Claude Opus / GPT-5. Do NOT use for choosing the cheap/fast tier (use `gemini-flash`), for general agent-system architecture (use `agent-engineering`), or for dispatching among local skills (use `skill-router`). Do NOT use for I just need a cheap classifier for 10k rows. Do NOT use for design the multi-agent orchestration for this system. Do NOT use for which of my local skills should handle this request?"
license: MIT
compatibility: "Markdown, any agent runtime; model facts current as of 2026-06-08"
allowed-tools: Read WebSearch
metadata:
  subject: agent-ops
  subjects: "[\"agent-ops\",\"ai-engineering\"]"
  public: "true"
  scope: "Deciding when to route a task to Google's Gemini Pro frontier tier (current Gemini 3.1 Pro; generation-stable as it moves to 3.5 Pro) versus Claude Opus or GPT-5: the 1M-token context window and its 200K pricing cliff, native multimodal input, frontier capability-per-dollar, and the per-lane benchmark comparison that says which model owns code, reasoning, and long-context retrieval. Portable model-routing knowledge, not anchored to any project. Excludes the cheap/fast Flash tier (gemini-flash), agent-system architecture (agent-engineering), and request-time dispatch among local skills (skill-router)."
  taxonomy_domain: agent/models
  stability: experimental
  keywords: "[\"route to Gemini Pro\",\"Gemini 3.1 Pro vs Claude Opus\",\"Gemini Pro 1M context window\",\"large context model routing\",\"long document reasoning model\",\"multimodal model audio video PDF\",\"Gemini Pro pricing per token\",\"which frontier model for big context\",\"Gemini 3.5 Pro frontier\",\"whole codebase analysis model\"]"
  examples: "[\"I need to reason over a 600K-token codebase in one shot — which model?\",\"should I send this to Gemini 3.1 Pro or Claude Opus?\",\"what's the cheapest frontier model that can take a 1M-token context?\",\"I have audio + PDFs + images in one task — which model handles all of it natively?\"]"
  anti_examples: "[\"I just need a cheap classifier for 10k rows\",\"design the multi-agent orchestration for this system\",\"which of my local skills should handle this request?\"]"
  relations: "{\"related\":[\"gemini-flash\",\"agent-engineering\",\"autonomous-loop-patterns\",\"skill-router\"],\"suppresses\":[{\"skill\":\"gemini-flash\",\"reason\":\"I own the FRONTIER Gemini tier (large context, hardest reasoning, multimodal depth); gemini-flash owns the cheap/fast tier and the escalation boundary up to me\"}],\"verify_with\":[\"gemini-flash\",\"agent-engineering\"]}"
  mental_model: "A frontier model is a routing destination chosen by the dominant constraint of the task, not by habit. The largest-context tier wins specifically when the input is too big to fit any other model in one call, or is mixed-multimodal, or needs frontier reasoning at the best capability-per-dollar — and loses when another frontier model owns the task's lane (hardest agentic code, or needle-precise long-context retrieval and hard math)."
  purpose: "Replace 'use my usual model' with an evidence-based, per-lane routing decision, so a task lands on the model whose strength its dominant constraint actually needs — and budget is not spent on capability the task never uses."
  concept_boundary: "Owns single-model selection of the large-context frontier tier and the comparison against its peer frontier models. Does NOT own the cheap/fast tier decision, agent-system architecture that composes many models, or request-time dispatch among local skills — those are separate concepts."
  analogy: "It is the wide-load freight truck of frontier models — when the cargo is too big to fit any other vehicle in one trip, it wins by capacity, even though a sports car is faster on the specific stretch of road it owns."
  misconception: "That holding a very large context window means being best at finding the needle inside it. Context capacity and long-context retrieval quality are different properties; route to the large-context tier to FIT the context cheaply, and verify a needle-precise retrieval need against the model that leads retrieval quality."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/agent-ops/gemini-pro/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# Gemini Pro

## Concept of the skill

**What it is:** A routing skill that decides when a task should go to Google's Gemini Pro frontier model — the current Gemini 3.1 Pro generation (moving to Gemini 3.5 Pro) — rather than Claude Opus or GPT-5. It is model-selection judgment, not a Gemini tutorial.

**Mental model:** Three signals push work toward Gemini Pro and one pushes it away. PUSH TOWARD: (1) the context is genuinely large — a corpus, codebase, or long document near or beyond 200K tokens, where Gemini Pro's 1M-token input avoids chunking-and-retrieval entirely; (2) the input is mixed-multimodal — audio + video + PDF + image in one call, which Gemini accepts natively; (3) the budget wants frontier-grade reasoning at the best capability-per-dollar. PUSH AWAY: the task is in a lane another frontier model owns (Claude Opus for the hardest agentic code modification; GPT-5 for best-in-class long-context *retrieval quality* and hard math).

**Why it exists:** Agents default to one model out of habit and pay for it — either too much (sending a 30K classification to the frontier) or in capability (chunking a 500K-token corpus through a 200K-window model when a 1M-window model would read it whole). This skill replaces "use my usual model" with an evidence-based per-lane decision, and corrects the most expensive misconception: that "has a 1M context window" means "best at using a 1M context window."

**What it is NOT:** It is not the cheap/fast tier decision (that's `gemini-flash`), not agent-system architecture (`agent-engineering`), not request-time dispatch among your local skills (`skill-router`), and not a Gemini API integration guide.

**Adjacent concepts:** `gemini-flash` (the cheap/fast Gemini tier and the escalation boundary up to Pro); `agent-engineering` (how to compose models into a system, one layer up from picking one model); `skill-router` (dispatches among skills, not among external models); `autonomous-loop-patterns` (the loop that decides which model each step in a pipeline uses).

**One-line analogy:** Gemini Pro is the wide-load freight truck of frontier models — when the cargo (context) is too big to fit any other vehicle in one trip, it wins by capacity, even though a sports car (Claude Opus / GPT-5) is faster on the specific stretch of road each owns.

**Common misconception:** That a 1M-token context window means Gemini Pro is the best at *finding the needle* in 1M tokens. Context *capacity* and long-context *retrieval quality* are different properties — GPT-5 leads on retrieval quality even where Gemini holds more tokens. Route to Gemini Pro to FIT the context cheaply; verify the retrieval-quality need separately.

## Coverage

- The three PUSH-TOWARD signals for the Gemini Pro frontier tier: very-large single-call context, mixed-multimodal input, and frontier reasoning at the best capability-per-dollar.
- The PUSH-AWAY (escalation) boundary: which tasks another frontier model owns (Claude Opus for the hardest agentic code modification; GPT-5 for long-context retrieval quality and hard math).
- The 1M-token context window and what it buys (whole-corpus / whole-codebase / long-document reasoning without a chunk-and-retrieve pipeline).
- The 200K-token pricing cliff: the whole request reprices at ~2× once the prompt crosses 200K tokens, across both input and output.
- Native multimodal input (text · image · audio · video · PDF in one call) and what it removes (media preprocessing).
- The per-lane benchmark comparison against Claude Opus and GPT-5 — capacity vs code-modification vs retrieval-quality — and how to read it at routing time.
- That the concrete model id and prices move fast; the tier is stable, the facts must be re-checked at routing time.

## Philosophy of the skill

Model choice is a routing decision driven by the task's dominant constraint, not by which model an agent reached for last time. The defaulting habit costs in two directions at once: paying frontier rates for work that never uses the capability, or crippling a task by forcing a giant corpus through a small-context model when a single-call large-context model would read it whole. The discipline is to name the dominant constraint first — is the binding limit context size, multimodality, capability-per-dollar, or a lane another model owns? — and route on that, not on familiarity. The skill also insists on a distinction that is easy to collapse and expensive to get wrong: capacity is not quality. Holding the most tokens is not the same as retrieving best from them. So the rule is to route to this tier to FIT the context cheaply, and to verify any needle-precise retrieval or hard-reasoning need against the model that actually leads that lane — never to assume the biggest window also wins every property measured inside it.

## When to Route to Gemini Pro

Route here when ONE OR MORE of these is the dominant constraint:

| Signal | Why Gemini Pro | Threshold / tell |
|---|---|---|
| Context too big for a 200K window | 1M-token input reads the whole corpus/codebase/long-doc in one call — no chunk-and-retrieve pipeline | Input is >150K tokens and the task needs cross-document reasoning, not lookup |
| Mixed multimodal input | Native text + image + audio + video + PDF in one prompt, no preprocessing | The task hands you raw media of more than one type |
| Frontier reasoning on a budget | Near-top reasoning at materially lower frontier cost ("volume tier") | High request volume where Opus/GPT-5 frontier pricing is the bottleneck |
| Long-horizon agentic + coding (3.5 line) | Gemini 3.5 Pro/Flash are positioned as Google's strongest agentic+coding models | Multi-step agent task where the newest Gemini generation is available |

## Capability Sheet — Gemini 3.1 Pro (current Pro frontier, June 2026)

| Property | Value | Routing note |
|---|---|---|
| Context window (input) | **1,000,000 tokens** | The headline reason to pick this tier |
| Max output | 64K tokens | Same order as Claude/GPT frontier |
| Multimodal input | text · image · audio · video · PDF (native) | One call, no media preprocessing |
| Price ≤200K prompt | **$2.00 in / $12.00 out** per 1M | Cheaper than top Claude/GPT frontier tiers |
| Price >200K prompt | **$4.00 in / $18.00 out** per 1M | The WHOLE request reprices at 2× once the prompt crosses 200K |
| Batch API | 50% off | For async, non-interactive workloads |
| AI Studio free tier | **Pro is paid-only** | Free AI Studio covers Flash / Flash-Lite only |

The 200K pricing cliff is the trap: a 201K-token prompt costs 2× per token versus a 199K-token prompt — across input AND output, the whole request. If a task can be kept under 200K, do it; if it genuinely needs the 1M window, budget for the 2× tier.

## Strengths vs Weaknesses

**Strengths**
- Largest practical single-call context among the frontier trio — the only one that fits a ~1M-token corpus without retrieval engineering.
- Native, broad multimodal input in a single prompt.
- Best capability-per-dollar at the frontier (the "volume tier" default in the April-2026 cross-model snapshot).
- Strong general reasoning (GPQA Diamond ~94%) and competitive SWE-Bench Verified (~80%).

**Weaknesses (the escalation boundary)**
- **Not the code leader.** Claude Opus leads SWE-Bench Pro (the hardest agentic code-modification benchmark) — route the hardest code-mod work to Opus.
- **Context size ≠ retrieval quality.** GPT-5 leads long-context *retrieval quality* and hard math — if the task is needle-in-haystack precision or heavy math, verify against GPT-5.
- **Fast-moving generation.** The concrete model id (`gemini-3.1-pro-preview` → `gemini-3.5-pro`) and prices change; treat the tier as stable, re-check the concrete facts at routing time.

## Verification

Confirm a Gemini-Pro routing decision before committing to it — and confirm the model facts it rests on are still current.

- [ ] The task's dominant constraint was named explicitly (context size / multimodality / capability-per-dollar / a lane another model owns) before a model was chosen — not picked by habit.
- [ ] If routed here for context size: the input genuinely exceeds a 200K window AND needs cross-document reasoning (not a lookup a retrieval pipeline would serve more cheaply).
- [ ] If the prompt crosses 200K tokens, the ~2× pricing-cliff cost (input AND output, whole request) was accounted for — or the prompt was kept under 200K where feasible.
- [ ] The decision did not assume "biggest context window" equals "best long-context retrieval" — a needle-precise retrieval or hard-math need was verified against the model that leads that lane (GPT-5), and the hardest agentic code-mod against Claude Opus.
- [ ] The concrete model id and per-token prices were re-checked against `references/model-facts.md` (or a live source) at routing time, since the Gemini generation moves fast.
- [ ] Pro is paid-only was accounted for (the free AI Studio tier covers Flash / Flash-Lite, not Pro).

## Do NOT Use When

| Instead of `gemini-pro` | Use | Why |
|---|---|---|
| The task is a cheap gate, classification, or structured-output job | `gemini-flash` | Frontier pricing on cheap work is waste; Flash is the right tier and owns the escalation boundary up to here |
| You are designing how models compose into an agent system | `agent-engineering` | That is system architecture, one layer above single-model selection |
| You need to pick which of YOUR skills handles a request | `skill-router` | That dispatches among local skills, not among external frontier models |
| The hardest agentic code modification is the whole task | (route to Claude Opus) | Opus leads SWE-Bench Pro; "has big context" does not beat "best at code" |
| The job is needle-precise long-context retrieval or hard math | (route to GPT-5) | GPT-5 leads long-context retrieval quality and math even where Gemini holds more tokens |

## References

- `references/model-facts.md` — current context/pricing/benchmark facts with sources (Last updated 2026-06-08)
- `gemini-flash` skill — the cheap/fast Gemini tier and the boundary where work escalates up to this skill

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `agent-ops` (also: `ai-engineering`)
- Public: `true`
- Domain: `agent/models`
- Scope: Deciding when to route a task to Google's Gemini Pro frontier tier (current Gemini 3.1 Pro; generation-stable as it moves to 3.5 Pro) versus Claude Opus or GPT-5: the 1M-token context window and its 200K pricing cliff, native multimodal input, frontier capability-per-dollar, and the per-lane benchmark comparison that says which model owns code, reasoning, and long-context retrieval. Portable model-routing knowledge, not anchored to any project. Excludes the cheap/fast Flash tier (gemini-flash), agent-system architecture (agent-engineering), and request-time dispatch among local skills (skill-router).

**When to use**
- I need to reason over a 600K-token codebase in one shot — which model?
- should I send this to Gemini 3.1 Pro or Claude Opus?
- what's the cheapest frontier model that can take a 1M-token context?
- I have audio + PDFs + images in one task — which model handles all of it natively?

**Not for**
- I just need a cheap classifier for 10k rows
- design the multi-agent orchestration for this system
- which of my local skills should handle this request?
- Owned by `gemini-flash`

**Related skills**
- Verify with: `gemini-flash`, `agent-engineering`
- Related: `gemini-flash`, `agent-engineering`, `autonomous-loop-patterns`, `skill-router`

**Concept**
- Mental model: A frontier model is a routing destination chosen by the dominant constraint of the task, not by habit. The largest-context tier wins specifically when the input is too big to fit any other model in one call, or is mixed-multimodal, or needs frontier reasoning at the best capability-per-dollar — and loses when another frontier model owns the task's lane (hardest agentic code, or needle-precise long-context retrieval and hard math).
- Purpose: Replace 'use my usual model' with an evidence-based, per-lane routing decision, so a task lands on the model whose strength its dominant constraint actually needs — and budget is not spent on capability the task never uses.
- Analogy: It is the wide-load freight truck of frontier models — when the cargo is too big to fit any other vehicle in one trip, it wins by capacity, even though a sports car is faster on the specific stretch of road it owns.
- Common misconception: That holding a very large context window means being best at finding the needle inside it. Context capacity and long-context retrieval quality are different properties; route to the large-context tier to FIT the context cheaply, and verify a needle-precise retrieval need against the model that leads retrieval quality.

**Keywords**
- `route to Gemini Pro`, `Gemini 3.1 Pro vs Claude Opus`, `Gemini Pro 1M context window`, `large context model routing`, `long document reasoning model`, `multimodal model audio video PDF`, `Gemini Pro pricing per token`, `which frontier model for big context`, `Gemini 3.5 Pro frontier`, `whole codebase analysis model`

<!-- skill-graph-context:end -->
