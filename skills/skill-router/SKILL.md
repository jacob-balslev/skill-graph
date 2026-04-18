---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v3.schema.json
schema_version: 3
name: skill-router
description: "MUST be used when routing an agent request across multiple skills, building or auditing a routing table, detecting routing coverage gaps, or deciding which skill claims a user task. Activate for: 'which skill handles this?', 'who routes X?', 'am I using the right skill?', 'why did skill A activate instead of B?'. Covers trigger-label matching, file-path matching, keyword matching, description-based semantic matching, scope/type tiebreakers, and coverage-gap detection. Do NOT use when the target skill is already known (load it directly), when authoring a new skill (use `skill-template` instead), or when evaluating a SINGLE skill's quality (use `graph-audit`)."
version: 1.0.0
type: router
browse_category: knowledge
scope: portable
owner: maintainer
freshness: "2026-04-18"
drift_check:
  last_verified: "2026-04-18"
eval_artifacts: present
eval_state: passing
routing_eval: absent
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
triggers:
  - skill-router
examples:
  - "which skill should activate for 'my tests are failing in CI'?"
  - "build a routing table that covers every agent request type we see"
  - "why did the documentation skill activate when the user asked about a11y?"
  - "find the coverage gaps — which agent requests match no skill at all?"
anti_examples:
  - "audit the graph-audit skill for schema conformance"   # graph-audit owns single-skill metadata verification
  - "write a guide explaining how our routing works"       # documentation owns durable prose
  - "the router activated the wrong skill once — debug it" # debugging (specific failure) not routing design
relations:
  adjacent:
    - documentation
  boundary:
    - skill: documentation
      reason: "documentation writes prose ABOUT routing; skill-router is the routing logic itself"
    - skill: graph-audit
      reason: "graph-audit verifies ONE skill's metadata; skill-router chooses BETWEEN skills at request time"
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

## Routing Rules

The router evaluates three matching surfaces in priority order. The first surface that produces a unique winner stops the evaluation chain.

| Priority | Surface | Field consulted | Match rule |
|---|---|---|---|
| 1 | Trigger label | `triggers` | Exact match against the declared label. Winner is unambiguous. |
| 2 | File path | `paths` | Glob match against the touched/mentioned path. Prefer the most specific match. |
| 3 | Keyword pattern | `keywords` | Token overlap between query terms and skill keyword list. Rank by match count; break ties with `scope` then `type`. |

### Scope tiebreaker

When keyword scores are equal, prefer skills in this `scope` order: `codebase` > `reference` > `portable`. A codebase-scoped skill is specific to *this* repository and wins over a portable one when both match the query equally.

> **Schema version note.** The v1 enum values `operational` and `generic` were renamed to `codebase` and `portable` in `schema_version: 2`. Always use the v2 names; the current schema rejects the v1 names as hard errors. See `docs/manifest-contract.md § Migration Note — schema_version 1 → 2` for the full rename map.

### Type tiebreaker

After scope, prefer `workflow` over `capability` over `router` over `overlay`. A workflow skill ships procedural decision logic that is usually more actionable than a pure capability reference when the query is ambiguous.

### Fallback behavior

If no skill matches any surface, the router does not fall back to a default skill. It surfaces a coverage gap and recommends authoring a new skill or broadening an existing skill's `keywords` array. Silent fallback to a wrong skill is worse than an explicit coverage-gap signal.

## Evals

This skill ships a comprehension-eval artifact at [`examples/evals/skill-router.json`](../../examples/evals/skill-router.json). The eval prompts specifically test the priority-ordered match surfaces, the scope/type tiebreakers, and the explicit refusal to fall back to a default. The eval file is how this skill is graded by `scripts/skill-audit.js --graded`.

## Do NOT Use When

| Use instead | When |
|---|---|
| The target skill directly | The correct skill is already known — skip the router and load it |
| `documentation` | The task is writing or structuring doc prose, not routing |
| `graph-audit` | The task is auditing whether routing metadata is consistent, not dispatching a query |
| `examples/skill-template.md` | The task is authoring a new skill from scratch, not dispatching to an existing one (the template is a reference artifact, not a routable skill) |
