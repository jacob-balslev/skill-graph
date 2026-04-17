---
schema_version: 2
name: skill-router
description: "Use when deciding which skill handles an incoming agent request, building a routing table for a multi-skill repo, or auditing routing coverage. Covers trigger-label matching, file-path matching, keyword matching, scope/type tiebreakers, and coverage-gap detection. Do NOT use when the target skill is already known (load it directly) or when authoring a new skill (use the skill-template)."
version: 1.0.0
type: router
family: knowledge
scope: portable
owner: maintainer
freshness: "2026-04-17"
drift_check: "2026-04-17"
eval_artifacts: none
eval_state: unverified
routing_eval: absent
stability: experimental
license: MIT
compatibility: Markdown, YAML, any agent runtime
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
relations:
  adjacent:
    - documentation
  boundary:
    - documentation
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

## Do NOT Use When

| Use instead | When |
|---|---|
| The target skill directly | The correct skill is already known — skip the router and load it |
| `documentation` | The task is writing or structuring doc prose, not routing |
| `graph-audit` | The task is auditing whether routing metadata is consistent, not dispatching a query |
| `examples/skill-template.md` | The task is authoring a new skill from scratch, not dispatching to an existing one (the template is a reference artifact, not a routable skill) |
