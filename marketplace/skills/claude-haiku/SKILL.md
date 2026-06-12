---
name: claude-haiku
description: "Use when deciding whether to route a task to the fast/cheap tier (Claude Haiku) — transcription, polling, format conversion, structured-output slot-filling, small-diff review, high-volume low-latency work — and where the boundary is that should escalate to Sonnet/Opus. Covers the cost/latency floor, the 200K context ceiling (vs the upper tiers' 1M), the absence of the effort knob, the separate rate-limit pool, and when to drop below Haiku to a script. Do NOT use for ordinary multi-step feature work (use claude-sonnet), the hardest reasoning (use claude-opus), loop design (use autonomous-loop-patterns), or Claude API request syntax (read the claude-api reference)."
license: MIT
metadata:
  subject: agent-ops
  public: "true"
  scope: "Choosing the fast/cheap tier (Claude Haiku) for a task — mechanical, high-volume, low-latency work where throughput and cost dominate and deep reasoning is not required. Teaches what Haiku is for (transcription, polling, format conversion, slot-filling, small-diff review), the structural 200K-context ceiling and missing effort knob that bound it, and the two-sided boundary: escalate to Sonnet/Opus when reasoning depth or context size demands it, drop below to a script when the task is fully deterministic. Out of scope: balanced-tier routing (claude-sonnet), frontier-tier routing (claude-opus), loop architecture (autonomous-loop-patterns), and Claude API call syntax (claude-api reference)."
  subjects: "[\"agent-ops\",\"ai-engineering\"]"
  taxonomy_domain: agent/models
  mental_model: "A model roster is a tiered ladder, and just below the bottom model rung sits 'no model at all — a script.' The fast tier is the rung you take when a task needs a little judgment (more than a regex) but not reasoning depth, and runs often or fast enough that a higher tier's cost and latency are wasteful."
  purpose: "Give mechanical, high-volume, low-latency work a correct home — cheaper and faster than the implementation lane — so a premium reasoning model is not wasted on transcription, polling, or slot-filling where it adds cost and latency with zero quality gain."
  concept_boundary: "It is not the lane for multi-step synthesis, architecture, or hard debugging — those need a higher tier's reasoning and tunable depth. It is not a universal cost-cutter: routing a task that needs reasoning here to 'save money' produces wrong answers, the most expensive outcome of all. It is not the loop or harness the model runs inside."
  analogy: "The fast tier is the quick, low-cost assistant for high-volume routine paperwork — perfect for the form-filling that floods the inbox, the wrong choice for the case that needs an analyst's judgment."
  misconception: That the cheapest model is the safe way to cut costs across the board. It is the right choice only for work that does not need reasoning depth or large context; pushing reasoning-heavy or large-context work down to it trades a small token saving for wrong answers and re-work.
  keywords: "[\"when to use Claude Haiku\",\"fast cheap model tier\",\"transcription model\",\"high-volume classification model\",\"format conversion model\",\"slot-filling model\",\"cheapest model tier\",\"Haiku vs Sonnet boundary\",\"200K context model\",\"low latency model\"]"
  stability: experimental
  grounding: "{\"subject_matter\":\"Claude Haiku model routing, pricing, context, and rate-limit facts\",\"grounding_mode\":\"hybrid\",\"truth_sources\":[\"skills/agent-ops/claude-haiku/references/model-facts.md\"],\"failure_modes\":[\"stale_model_id\",\"stale_context_window\",\"stale_pricing_or_rate_limit\",\"benchmark_claim_without_date\",\"capability_claim_quoted_from_memory\"],\"evidence_priority\":\"repo_code_first\"}"
  relations: "{\"related\":[\"claude-sonnet\",\"claude-opus\",\"autonomous-loop-patterns\",\"agent-engineering\",\"tool-call-strategy\"],\"suppresses\":[{\"skill\":\"claude-sonnet\",\"reason\":\"I own routing mechanical/high-volume/low-latency work to the fast tier; claude-sonnet owns the balanced lane for ordinary multi-step implementation work above this floor\"},{\"skill\":\"claude-opus\",\"reason\":\"I own the fast/cheap floor of the roster; claude-opus owns the frontier reasoning ceiling — the opposite end of the same ladder\"}],\"verify_with\":[\"claude-sonnet\",\"claude-opus\"]}"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/agent-ops/claude-haiku/SKILL.md
---

# Claude Haiku — Fast/Cheap Tier

## Concept of the skill

**What it is:** `claude-haiku` is the routing decision for a model provider's fast, cheapest tier — the floor of the roster, used for work where throughput, latency, and cost dominate and deep reasoning is not the binding constraint.

**Mental model:** A model roster is a tiered ladder, and just below the bottom model rung sits "no model at all — a script." The fast tier is the rung you take when a task needs a little judgment (more than a regex) but not reasoning depth, and runs often or fast enough that a higher tier's cost and latency are wasteful.

**Why it exists:** The expensive failure mode is using a premium reasoning model for mechanical work — transcription, polling, slot-filling — where it adds cost and latency with zero quality gain. An explicit fast tier gives that work a correct home: cheaper and faster than the implementation lane, while still being a model when a deterministic script can't quite do the job.

**What it is NOT:** It is not the lane for multi-step synthesis, architecture, or hard debugging — those need a higher tier's reasoning and tunable depth. It is not a universal cost-cutter either: routing a task that needs reasoning to the fast tier to "save money" produces wrong answers, which is the most expensive outcome of all.

**Adjacent concepts:** the balanced implementation tier (the escalation target for ordinary multi-step work); the frontier reasoning tier (the escalation target for the hardest work); a deterministic script (the drop target below any model for fully repeatable work); cost-aware delegation (the policy that routes mechanical work down to here or to a script).

**One-line analogy:** The fast tier is the quick, low-cost assistant for high-volume routine paperwork — perfect for the form-filling that floods the inbox, the wrong choice for the case that needs an analyst's judgment.

**Common misconception:** That the cheapest model is the safe way to cut costs across the board. It is not — it is the right choice only for work that does not need reasoning depth or large context; pushing reasoning-heavy or large-context work down to it trades a small token saving for wrong answers and re-work.

## Coverage

- What the fast tier is for: transcription, parsing, polling/status loops, format conversion, config updates, slot-filling, small-diff review, simple classification
- The two-sided boundary: escalate up to the balanced/frontier tier on reasoning-depth or context-size signals; drop below to a deterministic script on fully repeatable work
- The two distinct upward boundaries kept separate: the structural 200K-context ceiling vs the reasoning-difficulty limit (a task can exceed 200K while being mechanically trivial)
- Capability/limit facts that drive the decision: lowest per-token cost, 200K context window, the missing `effort` parameter, the separate rate-limit pool, often-lower load (overload fallback)
- The high-correctness-cost trap: small-looking tasks (security, money math) whose wrong-answer cost outweighs the token saving

## Philosophy of the skill

The fast tier defends against the single most expensive routing failure: using a premium reasoning model for mechanical work that gains nothing from reasoning. But its mirror failure is just as costly — pushing reasoning-heavy or large-context work *down* to the cheapest model to "save money," which buys wrong answers and re-work at a fraction of a cent of apparent savings. The fast tier therefore lives between two hard edges. Below it sits "no model at all — a script," the correct home for fully deterministic work. Above it sit two *separate* escalation boundaries that must not be conflated: a structural 200K-context ceiling (a task can exceed it while being mechanically trivial, and that alone forces escalation) and a reasoning-depth limit (the fast tier has no `effort` knob, so anything needing tunable depth belongs higher). Cheapness is a property to exploit only inside those edges, never a reason to cross them.

## When to reach for Haiku vs alternatives

Route a task to Haiku when throughput/latency/cost dominate and reasoning depth is not required:

- **Transcription / parsing** — turning a structured payload (webhook body, log line, raw record) into a target shape.
- **Polling and status loops** — repeated cheap checks where per-call cost matters because volume is high.
- **Format conversion and config updates** — mechanical reshaping with a clear target.
- **Slot-filling** — keyword/frontmatter additions, boilerplate generation, structured-output extraction against a fixed schema.
- **Small-diff review and simple classification** — bounded, low-stakes judgment over many items.

Escalate *up* to the balanced tier (`claude-sonnet`) when the task becomes genuine multi-step implementation; *up* to the frontier tier (`claude-opus`) when it needs the hardest reasoning. Drop *below* Haiku to a **script** when the task is fully deterministic and repeatable. The fast-tier test: *does this need a little judgment but not reasoning depth, and does it run often or fast enough that a higher tier is wasteful?* If a script can do it deterministically, use the script; if it needs reasoning depth or more than 200K of context, escalate.

## Capabilities (current generation — verify live before quoting)

| Dimension | Haiku (fast tier) | Decision relevance |
|---|---|---|
| Context window | **200K tokens** (NOT 1M) | The structural ceiling: a task whose context exceeds 200K cannot run on the fast tier and must escalate |
| Pricing tier | Lowest: ~1/3 the balanced tier, ~1/5 the frontier tier on input | The cost case for routing mechanical/high-volume work here |
| Max output | 64K tokens (stream above ~16K) | Adequate for slot-filling and conversion; large generations still stream |
| Effort parameter | **Not supported** — errors on the fast tier | No way to dial up reasoning depth; if a task needs that, it needs a higher tier by definition |
| Thinking | Limited vs upper tiers; no tunable depth knob | Reinforces: the fast tier is for low-reasoning work |
| Rate-limit pool | Separate from older Haiku generations | High-volume ramps may need a tier bump — check limits before scaling |
| Prompt-cache minimum | 4096-token prefix | Same as the frontier tier; short prefixes silently won't cache |
| Load | Often less loaded than busier tiers | A practical fallback during provider overload (529 errors) |

> Concrete model IDs, exact prices, context, and the effort/rate-limit details change with each release. Read them live from the provider's models API / pricing docs (or the `claude-api` reference) before quoting. Current verified facts: `references/model-facts.md`.

## Strengths and weaknesses

**Strengths:** lowest cost and latency of the three tiers; ideal for high-volume mechanical work, transcription, polling, format conversion, and slot-filling; often less loaded, making it a useful overload fallback.

**Weaknesses:** 200K context ceiling (a hard structural limit, not just a quality one); no `effort` knob, so reasoning depth cannot be tuned; under-performs on multi-step synthesis, architecture, and hard debugging; wrong choice for high-correctness-cost tasks (security, financial calculation) even when they look small.

## Verification

Before concluding "route this to Haiku," confirm:

- [ ] The task needs a little judgment but NOT reasoning depth, and runs often/fast enough that the balanced tier's cost-latency is wasteful.
- [ ] The context fits within 200K tokens (if it exceeds 200K, escalate regardless of how mechanical the task is — this boundary is structural).
- [ ] The task does NOT carry a high correctness cost that a wrong answer would make expensive (security checks, money math route up even when they look small).
- [ ] A deterministic script can NOT do it identically (if it can, use the script — no model is needed).
- [ ] Any capability fact used (context ceiling, missing effort, rate-limit pool, pricing) was read live or from `references/model-facts.md`, not from memory.

## Do NOT Use When

| Situation | Route to | Why |
|---|---|---|
| Ordinary multi-step feature work, bug fixes, test writing | `claude-sonnet` | Genuine implementation work needs the balanced tier's reasoning; the fast tier under-performs |
| Architecture, hard/intermittent debugging, security reasoning, long-horizon autonomy | `claude-opus` | Needs the frontier reasoning ceiling and tunable effort the fast tier lacks |
| The context genuinely exceeds 200K tokens | `claude-sonnet` / `claude-opus` | A structural limit — the fast tier physically cannot hold the input |
| Fully deterministic, repeatable work (bulk rename, mechanical find-and-replace) | a script | No model is needed at all; a script is cheaper and exact |
| High-correctness-cost tasks that look small (security check, money math) | `claude-sonnet` / `claude-opus` | A wrong answer's cost outweighs the token saving |
| Designing the loop / supervisor the model runs inside | `autonomous-loop-patterns` | That is loop architecture, not model-tier selection |
| Writing the Claude API request | `claude-api` reference | That is call-site syntax, not the routing decision |

## References

- `references/model-facts.md` — verified current-generation Haiku facts (ID, 200K context, pricing, missing effort knob, separate rate-limit pool) with sources
- `claude-sonnet` — the balanced implementation tier this skill escalates *up* to
- `claude-opus` — the frontier reasoning tier this skill escalates *up* to for the hardest work

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `agent-ops` (also: `ai-engineering`)
- Public: `true`
- Domain: `agent/models`
- Scope: Choosing the fast/cheap tier (Claude Haiku) for a task — mechanical, high-volume, low-latency work where throughput and cost dominate and deep reasoning is not required. Teaches what Haiku is for (transcription, polling, format conversion, slot-filling, small-diff review), the structural 200K-context ceiling and missing effort knob that bound it, and the two-sided boundary: escalate to Sonnet/Opus when reasoning depth or context size demands it, drop below to a script when the task is fully deterministic. Out of scope: balanced-tier routing (claude-sonnet), frontier-tier routing (claude-opus), loop architecture (autonomous-loop-patterns), and Claude API call syntax (claude-api reference).

**Not for**
- Owned by `claude-sonnet`
- Owned by `claude-opus`

**Related skills**
- Verify with: `claude-sonnet`, `claude-opus`
- Related: `claude-sonnet`, `claude-opus`, `autonomous-loop-patterns`, `agent-engineering`, `tool-call-strategy`

**Concept**
- Mental model: A model roster is a tiered ladder, and just below the bottom model rung sits 'no model at all — a script.' The fast tier is the rung you take when a task needs a little judgment (more than a regex) but not reasoning depth, and runs often or fast enough that a higher tier's cost and latency are wasteful.
- Purpose: Give mechanical, high-volume, low-latency work a correct home — cheaper and faster than the implementation lane — so a premium reasoning model is not wasted on transcription, polling, or slot-filling where it adds cost and latency with zero quality gain.
- Boundary: It is not the lane for multi-step synthesis, architecture, or hard debugging — those need a higher tier's reasoning and tunable depth. It is not a universal cost-cutter: routing a task that needs reasoning here to 'save money' produces wrong answers, the most expensive outcome of all. It is not the loop or harness the model runs inside.
- Analogy: The fast tier is the quick, low-cost assistant for high-volume routine paperwork — perfect for the form-filling that floods the inbox, the wrong choice for the case that needs an analyst's judgment.
- Common misconception: That the cheapest model is the safe way to cut costs across the board. It is the right choice only for work that does not need reasoning depth or large context; pushing reasoning-heavy or large-context work down to it trades a small token saving for wrong answers and re-work.

**Grounding**
- Mode: `hybrid`
- Truth sources: `skills/agent-ops/claude-haiku/references/model-facts.md`

**Keywords**
- `when to use Claude Haiku`, `fast cheap model tier`, `transcription model`, `high-volume classification model`, `format conversion model`, `slot-filling model`, `cheapest model tier`, `Haiku vs Sonnet boundary`, `200K context model`, `low latency model`

<!-- skill-graph-context:end -->
