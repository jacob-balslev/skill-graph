---
name: github-copilot
description: "Use when deciding whether to spend GitHub Copilot's metered budget on a task (its premium-request / post-June-2026 AI-credit model, where 1 credit = $0.01 and cost = tokens × per-model rate), what Copilot is good at vs expensive at, which plan allowance (Pro 300 / Pro+ 1500, no rollover) applies, and when a cheaper or free lane should take the work instead. Covers the June 1 2026 shift from premium-request multipliers to usage-based token billing, the always-free completions/next-edit surface, and the IDE-native frontier-model lane. Do NOT use for choosing or operating the OpenCode runtime (use `opencode`), for picking a specific free model (use `opencode-free-models`), or for authoring an agent loop (use `autonomous-loop-patterns`). Do NOT use for how do I invoke the opencode CLI non-interactively? Do NOT use for which free model fits this bulk job? Do NOT use for how do I write the agent's retry loop?"
license: MIT
compatibility: "Markdown, any agent runtime; billing facts current as of 2026-06 (post June-1 usage-based shift)"
allowed-tools: Read
metadata:
  subject: agent-ops
  subjects: "[\"agent-ops\",\"ai-engineering\"]"
  public: "true"
  scope: "When to route work to GitHub Copilot and when not to: its metered cost model (premium requests pre-June-2026 with per-model multipliers; AI credits at 1 credit = $0.01 with token-based billing after the June 1 2026 shift), plan allowances and the no-rollover rule, the always-free completions/next-edit surface, what Copilot is good at (IDE-native completions + frontier-model chat) vs expensive at (agentic multi-file flows), and when a cheaper/free lane is preferable. Portable knowledge about a public product's published billing — no private budget config. Out: the OpenCode runtime (opencode), specific free-model choice (opencode-free-models), agent-loop authoring (autonomous-loop-patterns)."
  taxonomy_domain: agent/harness
  stability: experimental
  keywords: "[\"github copilot\",\"copilot premium requests\",\"copilot ai credits\",\"copilot usage-based billing\",\"copilot pro vs pro plus\",\"when to use copilot\",\"copilot premium request cost\",\"copilot model multipliers\",\"cheaper lane than copilot\"]"
  examples: "[\"is this task worth spending a Copilot premium request on?\",\"how does Copilot's AI-credit billing work after June 2026?\",\"should I run this agent flow on Copilot or a free lane?\"]"
  anti_examples: "[\"how do I invoke the opencode CLI non-interactively?\",\"which free model fits this bulk job?\",\"how do I write the agent's retry loop?\"]"
  relations: "{\"related\":[\"opencode\",\"opencode-free-models\",\"autonomous-loop-patterns\",\"ai-native-development\"],\"suppresses\":[{\"skill\":\"opencode-free-models\",\"reason\":\"I own Copilot's paid premium-request / AI-credit lane and when to avoid it; opencode-free-models owns the free open-weight model alternatives\"},{\"skill\":\"opencode\",\"reason\":\"I own Copilot's IDE-native economics; opencode owns the open-source multi-provider runtime\"}],\"verify_with\":[\"opencode-free-models\"]}"
  mental_model: "A metered AI coding assistant has two glued-together cost surfaces: an always-free completion/next-edit surface that is unmetered, and a metered chat/agent surface drawn from a finite, non-rolling allowance. Routing well means keeping low-complexity and high-volume work off the metered surface and spending the capped allowance only where an in-editor frontier model genuinely earns it."
  purpose: "Prevent waste of a finite, non-rolling metered budget by deciding, per task, whether the work belongs on the free completion surface, on the metered surface, or off the assistant entirely on a cheaper/free lane or a script."
  concept_boundary: "Owns the spend/route decision for a metered IDE coding assistant's published billing. Does NOT own choosing or operating an open-source multi-provider runtime, picking a specific free model, or authoring an agent loop — those are separate concepts."
  analogy: "It is a prepaid toll lane bundled with a free service road — the service road (completions) is unlimited, the toll lane (agent/chat credits) is fast but metered and the balance does not roll over, so you only take the toll lane when the trip is worth it."
  misconception: "That paying a subscription makes the assistant free or unlimited. The subscription buys unmetered completions plus a capped, non-rolling metered allowance — agent flows consume that allowance fastest, and cost is token-based at a per-model rate, not governed by the retired flat per-request multipliers."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/agent-ops/github-copilot/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# GitHub Copilot

## Concept of the skill

**What it is:** A routing-and-cost discipline for GitHub Copilot — knowing when its metered budget is worth spending on a task, how its billing works (premium requests with per-model multipliers, replaced June 1 2026 by usage-based AI credits at 1 credit = $0.01), what surfaces are always free, and when a cheaper or free lane should take the work instead.

**Mental model:** Copilot has two cost surfaces glued together: an *always-free* completions/next-edit surface (unmetered) and a *metered* chat/agent surface (premium requests → AI credits). Routing well means keeping low-complexity and high-volume work off the metered surface and reserving the finite, non-rolling metered allowance for work that genuinely benefits from an IDE-native frontier model.

**Why it exists:** The metered allowance is finite and expires each cycle (no rollover), and agent-like flows burn it fastest — so spending it on boilerplate or work a free lane handles is pure waste. A deliberate routing rule prevents that waste while still using Copilot where its IDE-native flow earns the spend.

**What it is NOT:** It is not a model and not a runtime — it is a metered access lane to frontier models inside the IDE. It is not "unlimited because I pay a subscription": the subscription buys completions plus a capped metered allowance, not unlimited agent flows.

**Adjacent concepts:** the metered allowance (the finite budget); the always-free completion surface; the per-model token rate that converts usage to credits; the cheaper/free lane that should absorb low-complexity work.

**One-line analogy:** Copilot is a prepaid toll lane bundled with a free service road — the service road (completions) is unlimited, the toll lane (agent/chat credits) is fast but metered and the balance does not roll over, so you only take the toll lane when the trip is worth it.

**Common misconception:** That "I pay for Copilot, so using it is free/unlimited," or that the old per-model multipliers still govern cost. Neither holds post-June-1-2026: cost is token-based (input + output + cached × per-model rate → credits), the allowance is finite and non-rolling, and agent flows consume it fastest.

## Coverage

- Copilot's two cost surfaces: the always-free completions/next-edit surface vs the metered chat/agent surface
- The current billing model (post-June-1-2026): GitHub AI Credits at 1 credit = $0.01, token-based cost, and what it replaced (legacy premium-request multipliers)
- Plan allowances (Pro ~300, Pro+ ~1500, Business/Enterprise per-seat) and the no-rollover rule
- The routing decision: which work earns metered Copilot spend vs which should go to a free/cheap lane or a script
- What Copilot is good at (IDE-native completions, frontier-model chat) vs expensive at (agentic multi-file flows)
- The models reachable through Copilot and that they bill at published per-token rates

## Philosophy of the skill

Copilot's metered allowance is a finite, non-rolling budget, and the single most expensive mistake is treating it as unlimited because a subscription was paid. The always-free completion surface is its strongest, cheapest value and needs no budgeting; the metered surface is where discipline matters. The rule is to spend metered budget only where an IDE-native frontier model genuinely earns it — context the IDE already has, work that benefits from the in-editor flow — and to push boilerplate, repetitive transformations, and high-volume mechanical work to a free lane or a script. Spending metered budget on low-complexity work is not a small inefficiency; with no rollover, every wasted request is gone at cycle end, and agent flows burn the allowance fastest of all.

## The routing decision

Spend metered Copilot budget only where an IDE-native frontier model earns it. Push everything else to a free surface or a cheaper lane.

| Work type | Route to | Why |
|---|---|---|
| Inline code completion, next-edit suggestions | Copilot (always-free surface) | Unmetered; not billed in AI credits — its cheapest, strongest surface |
| Genuine IDE-native frontier chat/refactor that needs context the IDE already has | Copilot metered surface | This is what the premium allowance is for |
| Boilerplate, formatting, small edits, repetitive transformations | Free/cheap lane (a script, or a free model) | Wastes finite metered budget on a low bar |
| Bulk classification / triage / high-volume mechanical work | Free model lane (see `opencode-free-models`) | Volume × premium credits is the fastest way to burn the allowance |
| Anything a deterministic script can do | No model at all | Don't meter what code can do for free |

## Cost model and plan allowances

| Fact | Value (2026) |
|---|---|
| Billing unit (post-June-1-2026) | GitHub AI Credits; **1 credit = $0.01 USD** |
| Cost formula | (input + output + cached tokens) × per-model rate → credits |
| Legacy (pre-June-1-2026) | Premium requests with per-model **multipliers** (e.g. premium model 1×, Copilot code review 13×) |
| Always free | Code completions + next-edit suggestions (not credit-billed) |
| Rollover | None — unused allowance expires each billing cycle |
| Pro | $10/mo, ~300 premium-requests-equivalent allowance/month |
| Pro+ | $39/mo, ~1500 allowance/month (≈5× Pro) |
| Business / Enterprise | $19/seat (300/user) / $39/seat (1000/user) |

Models reachable through Copilot include OpenAI (GPT-5 mini through GPT-5.5 tiers), Anthropic (Claude Haiku 4.5 → Opus 4.8), Google (Gemini 3 Flash / 3.1 Pro / 3.5 Flash), and Microsoft fine-tuned models — billed at their published per-token rates.

## Strengths and weaknesses

**Strengths:** best-in-class, unmetered inline completions and next-edit suggestions; deep IDE integration (VS Code, JetBrains); frontier-model chat without separate vendor accounts.

**Weaknesses:** agent-like flows (multi-file edits, complex refactors, agentic loops) burn the metered allowance fast and surprise teams; no rollover means an oversized plan still wastes budget at cycle end; sticker-price comparisons hide real per-token cost; the metered surface is rarely the cheapest place to run mechanical or high-volume work.

## Verification

Use this checklist to confirm a Copilot spend decision was made correctly.

- [ ] The work was classified as always-free surface (completions/next-edit), metered surface, or route-off-Copilot before spending
- [ ] Metered Copilot budget is spent only where an IDE-native frontier model genuinely earns it
- [ ] Boilerplate, repetitive transformations, and high-volume mechanical work were routed to a free/cheap lane or a script, not the metered surface
- [ ] Cost reasoning uses the current model (AI credits at 1 credit = $0.01, token-based), not the retired premium-request multipliers — unless the account is explicitly on legacy annual billing
- [ ] The finite, non-rolling nature of the allowance was accounted for (an oversized plan does not prevent end-of-cycle waste)
- [ ] No assumption that a paid subscription makes metered agent flows free

## Do NOT Use When

| Instead of `github-copilot` | Use | Why |
|---|---|---|
| Choosing or operating the OpenCode runtime | `opencode` | That is an open-source multi-provider runtime, not Copilot's metered IDE lane |
| Picking which free/cheap model fits a task | `opencode-free-models` | This skill owns Copilot's paid economics; that one owns free-model selection |
| Authoring the agent loop / retry / claim logic | `autonomous-loop-patterns` | Loop authoring is separate from where you meter the model |
| The work is unmetered Copilot completion usage | Just use it | The always-free surface needs no budgeting decision |

## References

- `references/model-facts.md` — current (2026-06-08) Copilot billing model, plan allowances, model list, and the June-1 usage-based shift with sources.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `agent-ops` (also: `ai-engineering`)
- Public: `true`
- Domain: `agent/harness`
- Scope: When to route work to GitHub Copilot and when not to: its metered cost model (premium requests pre-June-2026 with per-model multipliers; AI credits at 1 credit = $0.01 with token-based billing after the June 1 2026 shift), plan allowances and the no-rollover rule, the always-free completions/next-edit surface, what Copilot is good at (IDE-native completions + frontier-model chat) vs expensive at (agentic multi-file flows), and when a cheaper/free lane is preferable. Portable knowledge about a public product's published billing — no private budget config. Out: the OpenCode runtime (opencode), specific free-model choice (opencode-free-models), agent-loop authoring (autonomous-loop-patterns).

**When to use**
- is this task worth spending a Copilot premium request on?
- how does Copilot's AI-credit billing work after June 2026?
- should I run this agent flow on Copilot or a free lane?

**Not for**
- how do I invoke the opencode CLI non-interactively?
- which free model fits this bulk job?
- how do I write the agent's retry loop?
- Owned by `opencode-free-models`
- Owned by `opencode`

**Related skills**
- Verify with: `opencode-free-models`
- Related: `opencode`, `opencode-free-models`, `autonomous-loop-patterns`, `ai-native-development`

**Concept**
- Mental model: A metered AI coding assistant has two glued-together cost surfaces: an always-free completion/next-edit surface that is unmetered, and a metered chat/agent surface drawn from a finite, non-rolling allowance. Routing well means keeping low-complexity and high-volume work off the metered surface and spending the capped allowance only where an in-editor frontier model genuinely earns it.
- Purpose: Prevent waste of a finite, non-rolling metered budget by deciding, per task, whether the work belongs on the free completion surface, on the metered surface, or off the assistant entirely on a cheaper/free lane or a script.
- Analogy: It is a prepaid toll lane bundled with a free service road — the service road (completions) is unlimited, the toll lane (agent/chat credits) is fast but metered and the balance does not roll over, so you only take the toll lane when the trip is worth it.
- Common misconception: That paying a subscription makes the assistant free or unlimited. The subscription buys unmetered completions plus a capped, non-rolling metered allowance — agent flows consume that allowance fastest, and cost is token-based at a per-model rate, not governed by the retired flat per-request multipliers.

**Keywords**
- `github copilot`, `copilot premium requests`, `copilot ai credits`, `copilot usage-based billing`, `copilot pro vs pro plus`, `when to use copilot`, `copilot premium request cost`, `copilot model multipliers`, `cheaper lane than copilot`

<!-- skill-graph-context:end -->
