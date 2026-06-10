---
name: claude-opus
description: "Use when deciding whether to route a task to Anthropic's frontier reasoning tier (Claude Opus) — architecture, multi-file synthesis, hard debugging, security reasoning, long-horizon agentic planning — and when NOT to (mechanical work belongs on a cheaper tier). Covers the Opus capability profile: 1M-token context, the cost/latency premium, adaptive thinking, the Opus-only effort ceiling (xhigh/max), task budgets, prompt-caching minimums, and high-resolution vision. Do NOT use for picking the balanced implementation tier (use claude-sonnet), the fast/cheap tier (use claude-haiku), designing the loop the model runs inside (use autonomous-loop-patterns), or for Claude API request syntax (read the claude-api reference)."
license: MIT
metadata:
  subject: agent-ops
  public: "true"
  scope: "Choosing the frontier reasoning tier (Claude Opus) for a task — when its strengths (deep reasoning, multi-file synthesis, hard debugging, security analysis, long-horizon autonomy) justify the cost/latency premium, and the boundary where a task should drop to a cheaper tier or a script. Teaches the decision-useful capability facts (context window, effort ceiling, thinking model, caching minimums) that distinguish Opus from the Sonnet and Haiku tiers. Out of scope: balanced-tier routing (claude-sonnet), fast/cheap routing (claude-haiku), loop architecture (autonomous-loop-patterns), and Claude API call syntax (claude-api reference)."
  subjects: "[\"agent-ops\",\"ai-engineering\"]"
  taxonomy_domain: agent/models
  mental_model: "A model roster is a tiered ladder — a deep-reasoning tier (slow, expensive, smartest), a balanced tier, and a fast/cheap tier. Routing is choosing the lowest rung that still clears the task's difficulty bar. The frontier tier is the top rung: correct only when the task genuinely needs its ceiling, because every task that could clear a lower rung but is sent here wastes the premium."
  purpose: "Make escalation to the most capable, most expensive reasoning tier a deliberate decision a task earns by clearing a difficulty bar — not the lazy default of sending every task to the smartest model, which over-pays on work a cheaper tier does identically and starves the budget for the genuinely hard tasks."
  concept_boundary: "It is not 'the model to use when in doubt' — doubt routes down, not up, until the task proves it needs the ceiling. It is not a quality guarantee on its own (a frontier model on a vague prompt underperforms a cheaper model on a sharp one), and it is not the loop, harness, or prompt the model runs inside — those are separate concerns."
  analogy: "The frontier tier is the senior specialist you book for the genuinely hard case — overkill and overpriced for the routine appointment a generalist handles, indispensable for the one that would defeat the generalist."
  misconception: "That the smartest model is always the safest choice. It is the safest only when the task needs it; for work a cheaper tier or a script handles deterministically, the frontier tier adds cost and latency with no quality gain, and the misallocation compounds across a workload."
  keywords: "[\"when to use Claude Opus\",\"frontier reasoning model\",\"Opus tier routing\",\"hardest model for architecture\",\"long-horizon agentic model\",\"Opus vs Sonnet\",\"1M context window model\",\"expensive reasoning model\",\"escalate to Opus\",\"max effort model\"]"
  stability: experimental
  relations: "{\"related\":[\"claude-sonnet\",\"claude-haiku\",\"autonomous-loop-patterns\",\"agent-engineering\",\"tool-call-strategy\"],\"suppresses\":[{\"skill\":\"claude-sonnet\",\"reason\":\"I own the decision to reach for the frontier reasoning tier; claude-sonnet owns the balanced implementation tier and is the right skill once the task is judged ordinary feature work\"},{\"skill\":\"claude-haiku\",\"reason\":\"I own routing the hardest reasoning work; claude-haiku owns routing fast/cheap mechanical work — the inverse decision\"}],\"verify_with\":[\"claude-sonnet\",\"claude-haiku\"]}"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/agent-ops/claude-opus/SKILL.md
---

# Claude Opus — Frontier Reasoning Tier

## Concept of the skill

**What it is:** `claude-opus` is the routing decision for a model provider's most capable, most expensive reasoning tier — the model you reach for when a task is hard enough that depth of reasoning, not throughput, is the binding constraint.

**Mental model:** A model roster is a tiered ladder: a deep-reasoning tier (slow, expensive, smartest), a balanced tier, and a fast/cheap tier. Routing is choosing the lowest rung that still clears the task's difficulty bar. The frontier tier is the top rung — correct only when the task genuinely needs its ceiling, because every task that could clear a lower rung but is sent here wastes the premium.

**Why it exists:** Sending every task to the smartest model is the lazy default and it is wrong twice over — it burns cost/latency on work a cheaper tier does identically, and it starves the budget so the genuinely hard tasks compete with trivia. Explicit frontier-tier routing makes the escalation decision deliberate: a task earns the top tier by clearing a difficulty bar, not by being next in the queue.

**What it is NOT:** It is not "the model to use when in doubt" — doubt routes down, not up, until the task proves it needs the ceiling. It is not a quality guarantee on its own (a frontier model on a vague prompt still underperforms a cheaper model on a sharp one), and it is not the loop, harness, or prompt the model runs inside — those are separate concerns.

**Adjacent concepts:** the balanced implementation tier (ordinary feature work, the default lane); the fast/cheap tier (mechanical slot-filling and high-volume work); loop architecture (the harness the model executes within); cost-aware delegation (the policy that routes mechanical work down and away from any model).

**One-line analogy:** The frontier tier is the senior specialist you book for the genuinely hard case — overkill and overpriced for the routine appointment a generalist handles, indispensable for the one that would defeat the generalist.

**Common misconception:** That the smartest model is always the safest choice. It is not — it is the safest *only when the task needs it*; for work a cheaper tier or a script handles deterministically, the frontier tier adds cost and latency with no quality gain, and the misallocation compounds across a workload.

## Coverage

- The escalation decision: which task signals (architecture, multi-file synthesis, hard/intermittent debugging, security reasoning, long-horizon autonomy) earn the frontier tier over the balanced tier
- The de-escalation boundary: when a task is too well-specified, too mechanical, or too deterministic to justify the frontier premium, and where it should route instead
- Capability facts that drive the decision: 1M context window, the Opus-only `xhigh`/`max` effort ceiling, adaptive thinking, task budgets, high-resolution vision, prompt-cache minimum
- The cost/latency tradeoff vs the balanced and fast tiers, including the 1M-context no-premium fact
- The relationship to adjacent concepts: balanced-tier routing, fast-tier routing, loop architecture, and cost-aware delegation

## Philosophy of the skill

Routing the frontier tier is adversarial against the lazy default. The tempting move — "this matters, so use the smartest model" — silently over-pays on the majority of tasks that a cheaper tier clears identically, and it normalizes a habit that compounds across a whole workload. The correct posture is the inverse: a task must *earn* the top rung by clearing a difficulty bar, and under uncertainty routing moves **down**, not up, until the task proves it needs the ceiling. The frontier tier's distinguishing capability is the `xhigh`/`max` effort settings the cheaper tiers cannot reach — so the cleanest escalation test is whether the task genuinely needs that depth. Cost and latency are not the enemy to minimize blindly; they are the price of a reasoning ceiling that only the hardest tasks redeem.

## When to reach for Opus vs alternatives

Route a task to Opus when at least one of these holds — and the task is too hard for the balanced tier to clear reliably:

- **Architecture and tradeoff design** — boundaries, schemas, cross-system contracts, "should this be one service or two," long-horizon decisions whose cost-of-error is high.
- **Multi-file synthesis** — a change whose correctness depends on holding many files, a large codebase, or a long document in working context at once.
- **Hard debugging** — intermittent flakes, multi-system root cause, "it works locally but not in prod," anything where a cheaper tier would declare it fixed after one clean run.
- **Security reasoning** — auth boundaries, data-exposure analysis, threat-surface review.
- **Long-horizon autonomous agentic work** — overnight or multi-step runs that must stay coherent without human correction. Give the full task spec up front in one turn and run at `high`/`xhigh` effort.

Route *down* to the balanced tier (`claude-sonnet`) for ordinary feature work, test writing, and multi-step code that is well-specified. Route down to the fast/cheap tier (`claude-haiku`) — or to a script — for mechanical work. The escalation test: *would the balanced tier plausibly get this wrong?* If no, do not pay the frontier premium.

## Capabilities (current generation — verify live before quoting)

| Dimension | Opus (frontier tier) | Decision relevance |
|---|---|---|
| Context window | 1M tokens | Holds large multi-file / long-document tasks in one pass — same window as the balanced tier |
| Long-context pricing | No premium above the base rate (current gen) | The wide window is not itself a reason to avoid Opus on cost |
| Pricing tier | Highest of the three tiers (≈5× the fast tier on input) | The cost half of the routing tradeoff |
| Max output | 128K tokens (streaming required for large outputs) | Long generations are feasible but must stream |
| Thinking | Adaptive thinking only (fixed token budgets removed on current gen) | No `budget_tokens` to tune — control depth via effort |
| Effort ceiling | `xhigh` and `max` are **Opus-tier only** | The reason Opus clears the hardest tasks: a depth ceiling the cheaper tiers cannot reach |
| Task budgets | Beta — model self-moderates spend across an agentic loop (min 20K) | Useful for capping cost on long autonomous runs |
| Vision | High-resolution (current gen) | Strongest tier for screenshot / document / chart understanding |
| Prompt-cache minimum | 4096-token prefix (higher than the balanced tier) | Short prefixes silently won't cache on Opus — size the shared prefix accordingly |

> Concrete model IDs, exact prices, and context numbers change with each release. Read them live from the model provider's models API / pricing docs (or the `claude-api` reference) before quoting — this skill teaches the *routing judgment*, not a frozen price sheet. Current verified facts: `references/model-facts.md`.

## Strengths and weaknesses

**Strengths:** highest reasoning ceiling and the only tier with the top effort settings; best at holding large context coherently; best at hard debugging, security analysis, and autonomous long-horizon work; high-resolution vision.

**Weaknesses:** highest cost and latency of the three tiers; overkill (and slower) for routine work; can over-explore or over-engineer at high effort if not given a tight, well-specified goal up front; no quality advantage at all on mechanical tasks a script or cheaper tier handles deterministically.

## Verification

Before concluding "route this to Opus," confirm:

- [ ] The task clears a difficulty bar the balanced tier would plausibly fail — name the specific signal (architecture / multi-file synthesis / hard debugging / security / long-horizon autonomy), not just "it's important."
- [ ] The task is NOT mechanical, deterministic, or pure slot-filling (those route down to a script or the fast tier).
- [ ] If the routing rests on a capability fact (effort ceiling, context window, pricing, vision), that fact was read live from the provider's models/pricing docs or `references/model-facts.md` — not quoted from memory.
- [ ] The decision is about model tier, not about the loop/harness (loop design → `autonomous-loop-patterns`) or the API call syntax (→ `claude-api` reference).

## Do NOT Use When

| Situation | Route to | Why |
|---|---|---|
| Ordinary, well-specified feature work, tests, multi-step code | `claude-sonnet` | The balanced tier clears it at lower cost/latency; the frontier premium buys nothing |
| Transcription, polling, format conversion, frontmatter slot-filling, small-diff review | `claude-haiku` (or a script) | Mechanical work gains nothing from frontier reasoning and wastes premium capacity |
| Deterministic, repeatable file processing / bulk rename | a script | No model is the right executor for work a `$0.00` script does identically |
| Designing the loop / supervisor / checkpoint the model runs inside | `autonomous-loop-patterns` | That is loop architecture, not model-tier selection |
| Writing the Claude API request (thinking config, effort, streaming syntax) | `claude-api` reference | That is call-site syntax, not the routing decision |

## References

- `references/model-facts.md` — verified current-generation Opus facts (IDs, context, pricing, capabilities) with sources
- `claude-sonnet` — the balanced implementation tier this skill routes *down* to
- `claude-haiku` — the fast/cheap tier this skill routes *down* to

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `agent-ops` (also: `ai-engineering`)
- Public: `true`
- Domain: `agent/models`
- Scope: Choosing the frontier reasoning tier (Claude Opus) for a task — when its strengths (deep reasoning, multi-file synthesis, hard debugging, security analysis, long-horizon autonomy) justify the cost/latency premium, and the boundary where a task should drop to a cheaper tier or a script. Teaches the decision-useful capability facts (context window, effort ceiling, thinking model, caching minimums) that distinguish Opus from the Sonnet and Haiku tiers. Out of scope: balanced-tier routing (claude-sonnet), fast/cheap routing (claude-haiku), loop architecture (autonomous-loop-patterns), and Claude API call syntax (claude-api reference).

**Not for**
- Owned by `claude-sonnet`
- Owned by `claude-haiku`

**Related skills**
- Verify with: `claude-sonnet`, `claude-haiku`
- Related: `claude-sonnet`, `claude-haiku`, `autonomous-loop-patterns`, `agent-engineering`, `tool-call-strategy`

**Concept**
- Mental model: A model roster is a tiered ladder — a deep-reasoning tier (slow, expensive, smartest), a balanced tier, and a fast/cheap tier. Routing is choosing the lowest rung that still clears the task's difficulty bar. The frontier tier is the top rung: correct only when the task genuinely needs its ceiling, because every task that could clear a lower rung but is sent here wastes the premium.
- Purpose: Make escalation to the most capable, most expensive reasoning tier a deliberate decision a task earns by clearing a difficulty bar — not the lazy default of sending every task to the smartest model, which over-pays on work a cheaper tier does identically and starves the budget for the genuinely hard tasks.
- Analogy: The frontier tier is the senior specialist you book for the genuinely hard case — overkill and overpriced for the routine appointment a generalist handles, indispensable for the one that would defeat the generalist.
- Common misconception: That the smartest model is always the safest choice. It is the safest only when the task needs it; for work a cheaper tier or a script handles deterministically, the frontier tier adds cost and latency with no quality gain, and the misallocation compounds across a workload.

**Keywords**
- `when to use Claude Opus`, `frontier reasoning model`, `Opus tier routing`, `hardest model for architecture`, `long-horizon agentic model`, `Opus vs Sonnet`, `1M context window model`, `expensive reasoning model`, `escalate to Opus`, `max effort model`

<!-- skill-graph-context:end -->
