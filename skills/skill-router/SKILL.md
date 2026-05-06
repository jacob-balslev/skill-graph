---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v3.schema.json
schema_version: 3
name: skill-router
description: "Use when routing an agent request across multiple skills, building or auditing a routing table, detecting routing coverage gaps, or answering questions like 'which skill handles this?', 'who routes X?', or 'why did skill A activate instead of B?'. Covers trigger-label matching, file-path matching, keyword matching, description-based semantic matching, scope/type tiebreakers, and coverage-gap detection. Do NOT use when the target skill is already known (load it directly), when authoring a new skill (use `skill-template` instead), or when evaluating a SINGLE skill's quality (use `graph-audit`)."
version: 1.0.0
type: router
browse_category: knowledge
scope: portable
owner: skill-graph-maintainer
freshness: "2026-04-18"
drift_check:
  last_verified: "2026-04-18"
eval_artifacts: present
eval_state: passing
# routing_eval: present — restored after the Priority 1 + 2 follow-up sprint
# (stopword filter, per-token dedup, score-aware boundary exclusion, scope/type
# tiebreakers, plus boundary and keyword authoring across the library). The
# harness now agrees with every positive and negative case for all 9 starters,
# including the previously falsified hard-negative which was rewritten to
# "reproduce this routing mis-dispatch from production logs" and now correctly
# routes to debugging (named in this skill's boundary[]). Lint check 12 gates
# future regressions. See `docs/plans/routing-harness-followup.md` for the
# full sprint write-up.
routing_eval: present
stability: experimental
license: MIT
compatibility:
  notes: "Markdown, YAML, any agent runtime"
allowed-tools: Read Grep
keywords:
  - skill routing
  - skill dispatch
  - keyword routing
  - route skill
  - which skill to use
  - skill selector
  - routing table
  - coverage gap
  - ambiguous skill activation
  - skill activate
  - skill activates
  - activate skill
  - skill should activate
  - which skill activates
  - why did skill activate
  - why skill activated
  - routing decision
  - dispatch request
  - dispatch agent request
  - agent request routing
  - route this request
  - route the request
  - pick the right skill
  - which skill handles
triggers:
  - skill-router
examples:
  - "activate the right skill for this agent request: 'my tests are failing in CI'"
  - "build a routing table that covers every agent request type we see"
  - "why did the documentation skill activate when the user asked about a11y?"
  - "find the coverage gaps — which agent requests match no skill at all?"
anti_examples:
  - "audit the graph-audit skill for schema conformance"           # graph-audit owns single-skill metadata verification
  - "write a guide explaining how our routing works"               # documentation owns durable prose
  - "reproduce this routing mis-dispatch from production logs"     # debugging (specific failure reproduction) not routing design
relations:
  # No adjacent: skill-router is a dispatch engine; its natural neighbors
  # are either in boundary (documentation, graph-audit) or in Do NOT Use
  # (skill-template is a reference artifact, not a routable skill). No
  # sibling skill is routinely loaded alongside this one.
  boundary:
    - skill: documentation
      reason: "documentation writes prose ABOUT routing; skill-router is the routing logic itself"
    - skill: graph-audit
      reason: "graph-audit verifies ONE skill's metadata; skill-router chooses BETWEEN skills at request time"
    - skill: debugging
      reason: "debugging reproduces a specific routing mis-dispatch from evidence; skill-router designs the routing table itself"
    - skill: skill-infrastructure
      reason: "skill-infrastructure analyses routing-miss patterns across the whole library to find systemic gaps; skill-router authors the routing logic for one library at a time"
  # verify_with points at graph-audit specifically for the *routing-metadata
  # integrity* concern: after a routing table is produced, graph-audit
  # confirms every relation target resolves to a real skill, every trigger
  # label is unique across the library, and the manifest sample stays in
  # sync with the generator. This is distinct from the boundary concern
  # above — boundary forbids confusing the two at request time; verify_with
  # says "run graph-audit on skill-router's authored metadata before
  # shipping a routing table."
  verify_with:
    - graph-audit
portability:
  readiness: scripted
  targets:
    - agent-skills
---

# Skill Router

## Coverage

- Routing by keyword pattern: matching inbound query terms to skill `keywords` arrays to identify the best candidate
- Routing by trigger label: matching explicit skill-router labels (`triggers` field) to eliminate ambiguity when the intent is declared
- Routing by file path: matching touched or mentioned file paths against skill `paths` arrays for file-activated skills
- Fallback ordering: how to rank skills when multiple candidates score equally, including `scope` and `type` tiebreakers
- Coverage gaps: detecting when no skill matches a request and how to surface that gap as an authoring signal

## Philosophy

Routing is adversarial against convenience. The tempting move — "if nothing matches exactly, just pick the closest skill and activate it" — is the one that silently degrades every agent that depends on the router. A wrong skill that activates confidently is worse than a coverage gap that surfaces loudly, because silent wrongness has no signal for anyone to fix. The router's job is to produce either a certain winner or an explicit non-answer, never a confident guess.

Four principles follow from that stance:

- **First unique winner stops the chain.** A match on `triggers` is stronger than a match on `paths`, which is stronger than a match on `keywords`. Evaluate surfaces in priority order and stop at the first one that yields a unique winner — do not second-guess a trigger-label hit with keyword analysis.
- **Tiebreakers favor specificity, not popularity.** When scores tie, a skill specific to *this* codebase (`scope: codebase`) wins over a portable skill, and a procedural skill (`type: workflow`) wins over a reference (`type: capability`) because the inbound query is more likely to need action than lookup. Never rank by skill age, usage count, or author preference.
- **Explicit coverage gaps beat silent wrong fallback.** If no surface produces a winner, surface the gap to the caller — recommend authoring a new skill or broadening a keyword list. Silent fallback to a default skill is a bug that no test catches, because the misrouted query looks successful to the router but nonsensical to the downstream agent.
- **The router is a mapping, not a judge.** It decides which skill owns a query; it does not decide whether the query is well-formed, worth handling, or strategically important. Those are the activated skill's concerns. Overloading the router with domain judgment makes it harder to audit and harder to change.

## Routing Rules

The router evaluates three matching surfaces in priority order. The first surface that produces a unique winner stops the evaluation chain.

| Priority | Surface | Field consulted | Match rule |
|---|---|---|---|
| 1 | Trigger label | `triggers` | Exact match against the declared label. Winner is unambiguous. |
| 2 | File path | `paths` | Glob match against the touched/mentioned path. Prefer the most specific match. |
| 3 | Keyword pattern | `keywords` | Token overlap between query terms and skill keyword list. Rank by match count; break ties with `scope` then `type`. |

### Scope tiebreaker

When keyword scores are equal, prefer skills in this `scope` order: `codebase` > `reference` > `portable`. A codebase-scoped skill is specific to *this* repository and wins over a portable one when both match the query equally.

> **Schema version note.** The v1 enum values `operational` and `generic` were renamed to `codebase` and `portable` in `schema_version: 2`. Always use the v2 names; the current schema rejects the v1 names as hard errors. A full rename map ships with the Skill Graph schema migration notes — consult those when porting a v1 skill.

### Type tiebreaker

After scope, prefer `workflow` over `capability` over `router` over `overlay`. A workflow skill ships procedural decision logic that is usually more actionable than a pure capability reference when the query is ambiguous.

### Fallback behavior

If no skill matches any surface, the router does not fall back to a default skill. It surfaces a coverage gap and recommends authoring a new skill or broadening an existing skill's `keywords` array. Silent fallback to a wrong skill is worse than an explicit coverage-gap signal.

## Evals

This skill ships a comprehension-eval artifact as `skill-router.json` in the Skill Graph `examples/evals/` directory. The eval prompts specifically test the priority-ordered match surfaces, the scope/type tiebreakers, and the explicit refusal to fall back to a default. The eval file is how this skill is graded by the Skill Graph audit runner — consumers in other agent runtimes can treat the eval cases as conformance tests translated to their own grading harness.

## Do NOT Use When

| Use instead | When |
|---|---|
| The target skill directly | The correct skill is already known — skip the router and load it |
| `documentation` | The task is writing or structuring doc prose, not routing |
| `graph-audit` | The task is auditing whether routing metadata is consistent, not dispatching a query |
| `examples/skill-template.md` | The task is authoring a new skill from scratch, not dispatching to an existing one (the template is a reference artifact, not a routable skill) |
