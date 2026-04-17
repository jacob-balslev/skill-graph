---
schema_version: 1
name: skill-router
description: "Skill routing logic for dispatching agent requests to the correct skill variant by keyword pattern, trigger label, or file path. Use when you need to decide which skill handles an incoming request, when building a routing table for a multi-skill repo, or when auditing existing routing coverage. Do NOT use when the target skill is already known — load that skill directly."
version: 1.0.0
type: router
family: knowledge
scope: generic
owner: maintainer
freshness: "2026-04-17"
drift_check: "2026-04-17"
eval_status: pending
stability: experimental
license: MIT
compatibility: Markdown, YAML, any agent runtime
allowed-tools: Read Grep
keywords:
  - skill routing
  - skill dispatch
  - keyword routing
  - route skill
  - which skill
  - skill selector
triggers:
  - skill-router
relations:
  adjacent:
    - documentation
    - testing-strategy
  boundary:
    - refactor
portability:
  level: high
  exports:
    - agent-skills
    - cursor
    - windsurf
    - copilot
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

When keyword scores are equal, prefer skills in this `scope` order: `operational` > `reference` > `generic`. An operational skill is more specific to this repository and wins over a generic one when both match equally.

### Type tiebreaker

After scope, prefer `workflow` over `capability` over `router` over `overlay`. A workflow skill provides procedural steps that are usually more actionable than a pure capability reference when the query is ambiguous.

### Fallback behavior

If no skill matches any surface, the router does not fall back to a generic response. It surfaces a coverage gap and recommends authoring a new skill or broadening an existing skill's `keywords` array.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| `skill-router` | the target skill directly | When the correct skill is already known, skip the router and load the skill |
| `skill-router` | `documentation` | Writing skill documentation is not routing — use documentation for authoring guides |
