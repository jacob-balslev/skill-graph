---
name: claude-sonnet
description: "Use when deciding whether to route a task to the balanced implementation tier (Claude Sonnet) — feature work, bug fixes, test writing, multi-step code — as the default lane that is cheaper/faster than the frontier tier and more capable than the fast tier. Covers the cost/quality tradeoff vs Opus and Haiku, the shared 1M context window, effort behavior, and the 1M-context subscription billing caveat. Do NOT use for the hardest reasoning/architecture/security work (use claude-opus), high-volume mechanical or low-latency work (use claude-haiku), loop design (use autonomous-loop-patterns), or Claude API request syntax (read the claude-api reference)."
license: MIT
metadata:
  subject: agent-ops
  public: "true"
  scope: "Choosing the balanced implementation tier (Claude Sonnet) for a task — the default coding/feature lane between the frontier reasoning tier and the fast/cheap tier. Teaches the cost/quality tradeoff (cheaper and faster than Opus, materially more capable than Haiku), the shared 1M context window, effort behavior and ceilings, and the 1M-context subscription billing caveat that complicates the naive 'Sonnet is always cheaper' intuition. Out of scope: frontier-tier routing (claude-opus), fast/cheap routing (claude-haiku), loop architecture (autonomous-loop-patterns), and Claude API call syntax (claude-api reference)."
  subjects: "[\"agent-ops\",\"ai-engineering\"]"
  taxonomy_domain: agent/models
  mental_model: "A model roster is a tiered ladder. The middle rung is the default — routing starts here and moves only with evidence: up to the frontier tier when a task proves too hard, down to the fast tier when a task proves mechanical. Most work clears the middle rung at lower cost and latency than the top."
  purpose: "Anchor the roster with an explicit default lane so routing becomes a question of 'is there evidence to move off the default' rather than a guess about which model is good enough — preventing the two bad habits of sending everything to the smartest model (overpaying) or chasing the cheapest (underperforming on real coding work)."
  concept_boundary: "It is not the tier for the hardest reasoning (that earns the frontier tier) nor for high-volume mechanical work (that drops to the fast tier or a script). It is not a quality compromise — for well-specified feature work it is the correct choice, not a budget concession. It is not the loop or harness the model runs inside."
  analogy: The balanced tier is the experienced generalist who handles the bulk of the caseload well — you escalate to the specialist only for the genuinely hard case and hand the routine paperwork to the assistant.
  misconception: "That the middle tier is 'the cheaper compromise you settle for.' It is not a compromise — it is the default, chosen affirmatively because most implementation work does not need the frontier tier's ceiling and is poorly served by the fast tier's limits."
  keywords: "[\"when to use Claude Sonnet\",\"balanced implementation model\",\"default coding model tier\",\"Sonnet vs Opus cost\",\"Sonnet vs Haiku\",\"feature work model\",\"test writing model\",\"cheaper than Opus\",\"1M context billing caveat\",\"default agent model lane\"]"
  stability: experimental
  relations: "{\"related\":[\"claude-opus\",\"claude-haiku\",\"autonomous-loop-patterns\",\"agent-engineering\",\"tool-call-strategy\"],\"suppresses\":[{\"skill\":\"claude-opus\",\"reason\":\"I own the default balanced-tier decision; claude-opus owns escalation to the frontier reasoning tier when a task is too hard for the balanced lane\"},{\"skill\":\"claude-haiku\",\"reason\":\"I own routing ordinary multi-step code; claude-haiku owns routing mechanical, high-volume, low-latency work below the implementation lane\"}],\"verify_with\":[\"claude-opus\",\"claude-haiku\"]}"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/agent-ops/claude-sonnet/SKILL.md
---

# Claude Sonnet — Balanced Implementation Tier

## Concept of the skill

**What it is:** `claude-sonnet` is the routing decision for a model provider's balanced middle tier — the default lane for ordinary implementation work that sits between the frontier reasoning tier and the fast/cheap tier on both cost and capability.

**Mental model:** A model roster is a tiered ladder. The middle rung is the *default* — routing starts here and moves only with evidence: up to the frontier tier when a task proves too hard, down to the fast tier when a task proves mechanical. Most work clears the middle rung at lower cost and latency than the top.

**Why it exists:** Without an explicit "default lane," routing collapses into one of two bad habits — sending everything to the smartest model (overpaying) or chasing the cheapest (underperforming on real coding work). A named balanced tier anchors the roster: it is where work goes unless there is a specific reason to escalate or drop.

**What it is NOT:** It is not the tier for the hardest reasoning (that earns the frontier tier) nor for high-volume mechanical work (that drops to the fast tier or a script). It is not a quality compromise — for well-specified feature work it is the *correct* choice, not a budget concession.

**Adjacent concepts:** the frontier reasoning tier (escalation target for hard tasks); the fast/cheap tier (drop target for mechanical/high-volume work); cost-aware delegation (the policy that decides which way to move off the default); loop architecture (the harness the model runs inside).

**One-line analogy:** The balanced tier is the experienced generalist who handles the bulk of the caseload well — you escalate to the specialist only for the genuinely hard case and hand the routine paperwork to the assistant.

**Common misconception:** That the middle tier is "the cheaper compromise you settle for." It is not a compromise — it is the *default*, chosen affirmatively because most implementation work does not need the frontier tier's ceiling and is poorly served by the fast tier's limits.

## Coverage

- The default-lane decision: which work stays on the balanced tier (feature work, bug fixes, tests, well-specified multi-step code, most agentic coding) and the two-directional test for moving off it
- The escalation signal upward: task hardness or the need for the Opus-only `xhigh`/`max` effort settings the balanced tier lacks
- The de-escalation signal downward: mechanical, high-volume, or latency-dominated work that belongs on the fast tier or a script
- The cost/quality tradeoff vs the frontier and fast tiers, including the shared 1M context window
- The 1M-context subscription billing caveat that complicates the naive "balanced tier is always cheaper" intuition
- Effort behavior and ceilings, the 64K output ceiling, and the prompt-cache minimum

## Philosophy of the skill

A roster without a named default collapses into one of two failures: routing everything to the smartest model (over-paying) or chasing the cheapest (under-performing on real coding work). The balanced tier exists to be that default — chosen affirmatively, not as a budget concession — so that routing becomes a question of *evidence to move off the default* rather than a guess about which model is "good enough." Movement is two-directional and asymmetric: escalation upward is triggered by task hardness or a need for the effort ceiling the balanced tier cannot reach; de-escalation downward is triggered by mechanical or high-volume signals. Treating those as the same decision is the error this skill guards against. The one place the cost intuition genuinely inverts — the 1M-context subscription billing caveat — is called out explicitly because "the balanced tier is always cheaper" is a rule of thumb with a real exception.

## When to reach for Sonnet vs alternatives

Sonnet is the **default lane** — route here unless a task gives a specific reason to move off it:

- **Feature work, bug fixes** — well-specified implementation against an understood codebase.
- **Test writing** — unit/integration test authoring, fixtures, coverage.
- **Multi-step code** — sequential changes the task spells out, structured extraction, content generation.
- **Most agentic coding / tool-use workflows** that are well-specified (set effort explicitly to tune the cost/latency/quality balance).

Escalate *up* to the frontier tier (`claude-opus`) when the task is hard: architecture and tradeoff design, intermittent multi-system debugging, security reasoning, or long-horizon autonomy that needs the Opus-only effort ceiling. Drop *down* to the fast tier (`claude-haiku`) — or a script — for mechanical, high-volume, or latency-dominated work. The default-lane test: *is there a specific reason this is too hard, or too mechanical, for the middle tier?* If neither, it stays on Sonnet.

## Capabilities (current generation — verify live before quoting)

| Dimension | Sonnet (balanced tier) | Decision relevance |
|---|---|---|
| Context window | 1M tokens | Same window as the frontier tier — a large-context task does not force an Opus escalation on window size |
| Pricing tier | Middle: ~60% of frontier input cost, ~3× the fast tier | The cost case for the default lane |
| Max output | 64K tokens (half the frontier tier; stream above ~16K) | Long generations feasible but smaller ceiling than Opus |
| Thinking | Adaptive thinking (fixed budgets deprecated) | Control depth via effort, not token budgets |
| Effort ceiling | Supported, but `xhigh`/`max` are **Opus-only** — Sonnet caps below them | The capability gap that defines when to escalate: if a task needs the top effort settings, it needs Opus |
| Effort default | Defaults to `high` (current gen) | Set effort explicitly (e.g. `low`/`medium`) on chat/classification to control latency and cost |
| Prompt-cache minimum | 2048-token prefix (lower than the frontier tier's 4096) | A mid-size shared prefix that caches on Sonnet may silently not cache on Opus |

> Concrete model IDs, exact prices, and context numbers change with each release. Read them live from the provider's models API / pricing docs (or the `claude-api` reference) before quoting. Current verified facts: `references/model-facts.md`.

## The 1M-context billing caveat

The 1M window carries **no long-context per-token premium** at GA on the first-party API. But the tradeoff inverts in one specific case on flat subscription runners: the 1M-context entitlement is included for the frontier tier on a MAX-style subscription, while the **balanced tier's 1M-context mode routes to per-token API billing**. So "Sonnet is always cheaper than Opus" is true for standard-window work but can be false for the 1M-context tier specifically, where the frontier tier may be the entitlement-included option and the balanced tier the metered one. When cost discipline matters and a task needs the full 1M window, check which tier is entitlement-included on your runner before assuming the middle tier is cheaper. See `references/model-facts.md`.

## Strengths and weaknesses

**Strengths:** best cost/quality balance for implementation work; same 1M context window as the frontier tier; fast turnaround; the right default for feature work, tests, and well-specified multi-step code.

**Weaknesses:** below the frontier tier's reasoning ceiling and lacks its top effort settings (`xhigh`/`max`), so it under-performs on the hardest debugging/architecture/security tasks; smaller 64K output ceiling; still more expensive and slower than the fast tier for mechanical/high-volume work; the 1M-context billing caveat can make it the metered option on subscription runners.

## Verification

Before concluding "route this to Sonnet," confirm:

- [ ] There is NO specific reason the task is too hard for the balanced tier (if there is, escalate to `claude-opus`).
- [ ] There is NO specific reason the task is mechanical/high-volume/latency-dominated (if there is, drop to `claude-haiku` or a script).
- [ ] If the task needs the full 1M-context window AND cost discipline matters, the 1M-context billing caveat was checked — confirm which tier is entitlement-included on your runner before assuming the balanced tier is cheaper.
- [ ] Any capability fact used (output ceiling, effort default, pricing, cache minimum) was read live or from `references/model-facts.md`, not from memory.

## Do NOT Use When

| Situation | Route to | Why |
|---|---|---|
| Architecture, hard/intermittent multi-system debugging, security reasoning, long-horizon autonomy | `claude-opus` | These need the frontier reasoning ceiling and the Opus-only `xhigh`/`max` effort settings |
| Transcription, polling, format conversion, high-volume classification, small-diff review | `claude-haiku` (or a script) | Mechanical/high-volume work is cheaper and fast enough on the fast tier; the implementation lane is wasted there |
| Deterministic, repeatable file processing / bulk rename | a script | No model is the right executor for work a script does identically |
| Designing the loop / supervisor / checkpoint the model runs inside | `autonomous-loop-patterns` | That is loop architecture, not model-tier selection |
| Writing the Claude API request (thinking, effort, streaming syntax) | `claude-api` reference | That is call-site syntax, not the routing decision |

## References

- `references/model-facts.md` — verified current-generation Sonnet facts (ID, context, pricing, the 1M-context billing caveat) with sources
- `claude-opus` — the frontier tier this skill escalates *up* to
- `claude-haiku` — the fast/cheap tier this skill drops *down* to

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `agent-ops` (also: `ai-engineering`)
- Public: `true`
- Domain: `agent/models`
- Scope: Choosing the balanced implementation tier (Claude Sonnet) for a task — the default coding/feature lane between the frontier reasoning tier and the fast/cheap tier. Teaches the cost/quality tradeoff (cheaper and faster than Opus, materially more capable than Haiku), the shared 1M context window, effort behavior and ceilings, and the 1M-context subscription billing caveat that complicates the naive 'Sonnet is always cheaper' intuition. Out of scope: frontier-tier routing (claude-opus), fast/cheap routing (claude-haiku), loop architecture (autonomous-loop-patterns), and Claude API call syntax (claude-api reference).

**Not for**
- Owned by `claude-opus`
- Owned by `claude-haiku`

**Related skills**
- Verify with: `claude-opus`, `claude-haiku`
- Related: `claude-opus`, `claude-haiku`, `autonomous-loop-patterns`, `agent-engineering`, `tool-call-strategy`

**Concept**
- Mental model: A model roster is a tiered ladder. The middle rung is the default — routing starts here and moves only with evidence: up to the frontier tier when a task proves too hard, down to the fast tier when a task proves mechanical. Most work clears the middle rung at lower cost and latency than the top.
- Purpose: Anchor the roster with an explicit default lane so routing becomes a question of 'is there evidence to move off the default' rather than a guess about which model is good enough — preventing the two bad habits of sending everything to the smartest model (overpaying) or chasing the cheapest (underperforming on real coding work).
- Boundary: It is not the tier for the hardest reasoning (that earns the frontier tier) nor for high-volume mechanical work (that drops to the fast tier or a script). It is not a quality compromise — for well-specified feature work it is the correct choice, not a budget concession. It is not the loop or harness the model runs inside.
- Analogy: The balanced tier is the experienced generalist who handles the bulk of the caseload well — you escalate to the specialist only for the genuinely hard case and hand the routine paperwork to the assistant.
- Common misconception: That the middle tier is 'the cheaper compromise you settle for.' It is not a compromise — it is the default, chosen affirmatively because most implementation work does not need the frontier tier's ceiling and is poorly served by the fast tier's limits.

**Keywords**
- `when to use Claude Sonnet`, `balanced implementation model`, `default coding model tier`, `Sonnet vs Opus cost`, `Sonnet vs Haiku`, `feature work model`, `test writing model`, `cheaper than Opus`, `1M context billing caveat`, `default agent model lane`

<!-- skill-graph-context:end -->
