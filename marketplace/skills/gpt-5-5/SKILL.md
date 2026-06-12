---
name: gpt-5-5
description: "Use when deciding whether to route a task to OpenAI's GPT-5.5 frontier model versus Claude Opus or Sonnet — picking the model lane for infrastructure scripts, CI pipelines, concrete implementation, analytical code review, security review, or CLI/terminal-heavy work, and weighing GPT-5.5's context window, pricing, and per-benchmark strengths against the Claude tiers for the same task. Covers the decision-useful capability and pricing facts, and the boundary against the Claude routing skills. Do NOT use for running the GPT model through a harness (use `codex`), for choosing among the Claude tiers themselves (use `claude-opus` / `claude-sonnet`), or for routing among local skills at request time (use `skill-router`). Do NOT use for resume my last Codex session and keep going. Do NOT use for is Opus or Sonnet the right Claude tier for this? Do NOT use for which of my skills handles webhook tasks?"
license: MIT
compatibility: "Model-routing knowledge skill. Facts current as of 2026-06-08 (GPT-5.5 generation). OpenAI iterates point releases fast — verify the current GPT-5 generation, context window, and pricing against OpenAI's docs before relying on a specific number."
allowed-tools: Read Grep
metadata:
  subject: agent-ops
  subjects: "[\"agent-ops\",\"ai-engineering\"]"
  public: "true"
  scope: "Deciding when to route a task to OpenAI's GPT-5.5 frontier tier versus Claude Opus or Sonnet: the ~1M context window and its 272K pricing cliff, the $5/$30 standard rates and Pro tier, and the per-benchmark split that says GPT-5.5 leads SWE-bench Verified and Terminal-Bench (CLI/tool-use, infra, concrete implementation, analytical review) while Claude Opus leads SWE-bench Pro and architectural reasoning across large codebases. Portable model-routing knowledge, not anchored to any project. Excludes running GPT through the Codex harness (codex), choosing among Claude tiers (claude-opus/claude-sonnet), and request-time dispatch among local skills (skill-router)."
  taxonomy_domain: agent/models
  stability: experimental
  keywords: "[\"when to use gpt-5.5\",\"gpt-5.5 vs claude opus\",\"route task to gpt\",\"gpt-5.5 for code review\",\"gpt-5.5 infrastructure scripts\",\"gpt-5.5 context window pricing\",\"gpt-5.5 security review\",\"model routing gpt claude\",\"swe-bench gpt vs claude\",\"gpt-5.5 terminal bench\"]"
  examples: "[\"should this CI pipeline script go to GPT-5 or Opus?\",\"is GPT-5 or Claude better for an analytical code review of this diff?\",\"what's GPT-5's context window and how does its pricing compare to Opus?\"]"
  anti_examples: "[\"resume my last Codex session and keep going\",\"is Opus or Sonnet the right Claude tier for this?\",\"which of my skills handles webhook tasks?\"]"
  relations: "{\"related\":[\"codex\",\"claude-opus\",\"claude-sonnet\",\"gemini-pro\",\"claude-code\"],\"suppresses\":[{\"skill\":\"codex\",\"reason\":\"I own routing the task to the GPT MODEL vs Claude; codex owns running GPT through its CLI harness\"},{\"skill\":\"claude-opus\",\"reason\":\"I own the GPT-vs-Claude routing decision; claude-opus owns the choice among Claude tiers\"}],\"verify_with\":[\"claude-opus\",\"codex\"]}"
  mental_model: "Frontier models are specialists with overlapping but non-identical edges. Two near-equal models still diverge by task TYPE, so routing means matching a task's dominant axis to the model that owns that axis — not crowning one model 'best overall'."
  purpose: "An explicit per-task model-routing rule exists because 'just use the strongest model' ignores that strength is task-shaped and ignores cost. The rule captures real per-benchmark splits so concrete-implementation, CLI/terminal, and analytical-review work lands on the model that leads those axes while architecture-heavy work stays on the model that leads there."
  concept_boundary: "This decides WHICH frontier MODEL gets a task (the GPT line vs the Claude tiers). It is NOT the CLI harness that runs the model, NOT the model's SDK/API, NOT intra-Claude tier selection, and NOT request-time dispatch among local skills."
  analogy: "Choosing the model is choosing a surgeon by procedure, not by overall reputation — the more decorated surgeon is still the wrong pick for the operation the other one specializes in."
  misconception: "That a higher headline coding-benchmark score makes one model the universal coding choice. Aggregate margins are often within noise and carry contamination caveats; on complex multi-file resolution the ranking can flip, so a single verified-bench headline does not generalize to architecture-heavy work."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/agent-ops/gpt-5-5/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# GPT-5.5

## Concept of the skill

**What it is:** GPT-5.5 is OpenAI's current GPT frontier model generation (~1M context). This skill is the routing decision: when a task's shape favors GPT-5.5's strengths enough to send it there instead of a Claude tier.

**Mental model:** Treat frontier models as specialists with overlapping but non-identical edges. GPT-5.5 and Claude Opus are within a couple of points on aggregate coding benchmarks, but they diverge by task *type*: GPT-5.5 leads on terminal/CLI workflows and precise tool-use; Claude Opus leads on architecture and complex multi-file resolution. Routing is matching the task's dominant axis to the model that owns that axis — not crowning one model "best."

**Why it exists:** "Just use the strongest model" is the wrong default — it ignores that strength is task-shaped, and it ignores cost. An explicit per-task routing rule captures the real per-benchmark splits so concrete-implementation and review work lands on GPT-5 while architecture work stays on Opus, instead of being decided by habit.

**What it is NOT:** It is not the Codex CLI (that is the *harness* that runs GPT — a separate decision), not the OpenAI SDK/API, and not a claim that GPT-5 beats Claude everywhere. It is a model-lane selector, not a leaderboard.

**Adjacent concepts:** the Codex CLI (the harness for GPT), the Claude tier skills (`claude-opus`, `claude-sonnet`, `claude-haiku`), `gemini-pro` (the third frontier lane), and `skill-router` (request-time dispatch among local skills, a different layer).

**One-line analogy:** Routing GPT-5 vs Opus is choosing a surgeon by procedure, not by overall reputation — the more decorated surgeon is still the wrong pick for the operation the other one specializes in.

**Common misconception:** That the higher SWE-bench Verified score makes GPT-5.5 the universal coding choice. The aggregate margin is within noise and benchmark-contamination caveats; on complex multi-file resolution (SWE-bench Pro) Claude Opus leads, so the verified-bench headline does not generalize to architecture-heavy work.

## Coverage

- The per-task routing decision: when a task's dominant axis favors GPT-5.5 enough to send it there instead of a Claude tier
- The per-benchmark splits that drive routing — GPT-5.5 leading Terminal-Bench / CLI / tool-use and concrete implementation, Claude Opus leading SWE-bench Pro and broad architecture
- The decision-useful capability and pricing facts: ~1M context window, the >272K-token surcharge, standard / Pro / cached pricing, and how they compare to the Claude tiers
- The subscription-vs-API distinction: why headline per-token USD is notional on a flat subscription and must not drive routing alone
- The boundary against adjacent skills: the Codex harness (running GPT), the Claude tier skills (intra-Claude routing), `gemini-pro` (the third frontier lane), and `skill-router` (request-time local-skill dispatch)
- What this skill is NOT: the Codex CLI, the OpenAI SDK, a leaderboard, or a claim that GPT-5 beats Claude everywhere

## Philosophy of the skill

Routing is matching, not ranking. The tempting shortcut — "use the strongest model and stop thinking" — is wrong twice over: it treats model strength as a single scalar when it is actually a profile of task-shaped edges, and it ignores cost entirely. This skill refuses both errors. It insists the routing primitive is the task's *dominant axis*, not a model's aggregate benchmark rank, because two near-equal models split by task type and the per-task winner can flip even when one model leads on paper. It also refuses to let headline price be the primitive: on a flat subscription the per-token USD is notional, and even on API the capability-per-task delta usually dominates the price delta. The discipline is to name the task's dominant axis first, route to the model that owns that axis, and treat both "always strongest" and "always cheapest" as reflexes to override.

## When to route to GPT-5 (decision)

Send a task to GPT-5.5 when its **dominant axis** is one GPT-5.5 owns:

| Task axis | Route | Why |
|---|---|---|
| Infrastructure scripts, CI pipelines | **GPT-5.5** | Strong on concrete, well-specified implementation |
| CLI / terminal-heavy iteration (planning, tool coordination in a shell) | **GPT-5.5** | Leads Terminal-Bench 2.0 (82.7%) — its most decisive win |
| Analytical code review of a diff; security review | **GPT-5.5** | Strong analytical diff-reading and threat-surface work |
| Precise tool use + file navigation | **GPT-5.5** | Holds a slight edge here |
| Broad architectural reasoning across a large codebase | **Claude Opus** | Opus leads architecture work |
| Complex multi-file GitHub issue resolution | **Claude Opus** | Opus leads SWE-bench Pro (64.3% vs 58.6%) |
| Multi-tool agent coordination | **Claude** | Claude's tool-coordination edge (MCP Atlas) |
| Cost-sensitive but still-capable implementation | **Claude Sonnet** | Cheaper than both frontier tiers — see `claude-sonnet` |

## Capability and pricing facts (2026-06-08)

| Fact | GPT-5.5 | For comparison |
|---|---|---|
| Context window | ~1,050,000 tokens | Claude Opus 4.8 / Sonnet 4.6: 1M |
| Standard input / output | $5 / $30 per 1M | Opus 4.8: $5 / $25 · Sonnet 4.6: $3 / $15 |
| Pro tier | $30 / $180 per 1M | — |
| Cached input | $0.50 / 1M | — |
| Long-context surcharge | > 272K input → 2× in / 1.5× out (full session) | — |
| SWE-bench Verified | #1 (88.7%) | Opus 4.7: 87.6% (margin within noise + contamination caveats) |
| SWE-bench Pro | 58.6% | Opus 4.7 leads (64.3%) |
| Terminal-Bench 2.0 | 82.7% (leads) | — |

> On subscription plans (not per-token API), the per-token USD above is notional, not the billed cost — do not route on headline price alone when billing is a flat subscription.

## Strengths and weaknesses

**Strengths**
- Leads real CLI/terminal workflows and precise tool-use/file-navigation.
- Top-tier on SWE-bench Verified and strong on concrete implementation, infra/CI, analytical and security review.
- ~1M context for large-context coding and research.

**Weaknesses / watch-outs**
- Higher output price per token than Claude Opus ($30 vs $25); the >272K surcharge compounds long-context cost.
- Trails Claude Opus on complex multi-file resolution and broad architecture.
- SWE-bench Verified scores at this tier carry contamination caveats — do not over-weight the headline number.
- This is a *model* fact set; the *harness* you run GPT through (Codex) is a separate decision.

## Verification

Use this checklist to confirm a GPT-vs-Claude routing decision is correct and current.

- [ ] The task's **dominant axis** was named (infra/CI, CLI/terminal, analytical/security review, architecture, multi-file resolution, multi-tool coordination) BEFORE a model was picked — not chosen by habit or headline rank
- [ ] The route follows the axis → model map, not "always the strongest model" or "always the cheapest"
- [ ] The current GPT-5.5 generation, context window, and pricing were re-checked against the provider's live docs — these change fast and a stale number can flip the decision
- [ ] When cost was a factor, billing basis was checked: on a flat subscription the per-token USD is notional, not the billed cost, and the >272K-token surcharge was accounted for on long-context work
- [ ] The decision did not silently fold in a harness choice (running GPT) — that is a separate decision routed to the Codex harness skill
- [ ] A benchmark headline was not over-weighted: near-equal margins and contamination caveats were treated as such, and architecture-heavy work was not routed to GPT on the strength of a verified-bench lead alone

## Do NOT Use When

| Instead of `gpt-5-5` | Use | Why |
|---|---|---|
| Running GPT through its CLI agent (resume sessions, exec) | `codex` | That is a harness decision, not a model-routing one |
| Choosing among the Claude tiers (Opus vs Sonnet vs Haiku) | `claude-opus` / `claude-sonnet` / `claude-haiku` | Intra-Claude routing, not GPT-vs-Claude |
| Considering the Google frontier lane | `gemini-pro` | A different model family's routing |
| Dispatching among local skills at request time | `skill-router` | A different layer entirely |

## References

- `references/model-facts.md` — verified GPT-5.5 capability, pricing, and benchmark facts (2026-06-08) with sources
- Sibling skills `claude-opus`, `claude-sonnet`, `gemini-pro` — the other frontier lanes this routing decision weighs against; `codex` — the harness that runs GPT

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `agent-ops` (also: `ai-engineering`)
- Public: `true`
- Domain: `agent/models`
- Scope: Deciding when to route a task to OpenAI's GPT-5.5 frontier tier versus Claude Opus or Sonnet: the ~1M context window and its 272K pricing cliff, the $5/$30 standard rates and Pro tier, and the per-benchmark split that says GPT-5.5 leads SWE-bench Verified and Terminal-Bench (CLI/tool-use, infra, concrete implementation, analytical review) while Claude Opus leads SWE-bench Pro and architectural reasoning across large codebases. Portable model-routing knowledge, not anchored to any project. Excludes running GPT through the Codex harness (codex), choosing among Claude tiers (claude-opus/claude-sonnet), and request-time dispatch among local skills (skill-router).

**When to use**
- should this CI pipeline script go to GPT-5 or Opus?
- is GPT-5 or Claude better for an analytical code review of this diff?
- what's GPT-5's context window and how does its pricing compare to Opus?

**Not for**
- resume my last Codex session and keep going
- is Opus or Sonnet the right Claude tier for this?
- which of my skills handles webhook tasks?
- Owned by `codex`
- Owned by `claude-opus`

**Related skills**
- Verify with: `claude-opus`, `codex`
- Related: `codex`, `claude-opus`, `claude-sonnet`, `gemini-pro`, `claude-code`

**Concept**
- Mental model: Frontier models are specialists with overlapping but non-identical edges. Two near-equal models still diverge by task TYPE, so routing means matching a task's dominant axis to the model that owns that axis — not crowning one model 'best overall'.
- Purpose: An explicit per-task model-routing rule exists because 'just use the strongest model' ignores that strength is task-shaped and ignores cost. The rule captures real per-benchmark splits so concrete-implementation, CLI/terminal, and analytical-review work lands on the model that leads those axes while architecture-heavy work stays on the model that leads there.
- Boundary: This decides WHICH frontier MODEL gets a task (the GPT line vs the Claude tiers). It is NOT the CLI harness that runs the model, NOT the model's SDK/API, NOT intra-Claude tier selection, and NOT request-time dispatch among local skills.
- Analogy: Choosing the model is choosing a surgeon by procedure, not by overall reputation — the more decorated surgeon is still the wrong pick for the operation the other one specializes in.
- Common misconception: That a higher headline coding-benchmark score makes one model the universal coding choice. Aggregate margins are often within noise and carry contamination caveats; on complex multi-file resolution the ranking can flip, so a single verified-bench headline does not generalize to architecture-heavy work.

**Keywords**
- `when to use gpt-5.5`, `gpt-5.5 vs claude opus`, `route task to gpt`, `gpt-5.5 for code review`, `gpt-5.5 infrastructure scripts`, `gpt-5.5 context window pricing`, `gpt-5.5 security review`, `model routing gpt claude`, `swe-bench gpt vs claude`, `gpt-5.5 terminal bench`

<!-- skill-graph-context:end -->
