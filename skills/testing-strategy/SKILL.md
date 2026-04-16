---
schema_version: 1
name: testing-strategy
description: Testing strategy skill for deciding what to test, choosing the right test level, and verifying behavior changes with meaningful evidence. Use when planning tests for bug fixes, features, or refactors. Do NOT use for documentation writing or purely conceptual architecture discussion.
version: 1.0.0
type: capability
family: quality
scope: generic
owner: maintainer
freshness: "2026-04-15"
drift_check: "2026-04-15"
eval_status: pending
stability: experimental
license: MIT
compatibility: Markdown, Git, any codebase
allowed-tools: Read Grep Bash
keywords:
  - testing strategy
  - what to test
  - unit test
  - integration test
  - regression test
triggers:
  - testing-skill
relations:
  adjacent:
    - debugging
    - refactor
  boundary:
    - documentation
  verify_with:
    - debugging
portability:
  level: high
  exports:
    - agent-skills
    - cursor
    - windsurf
    - copilot
---

# Testing Strategy

## Coverage

Choosing test scope, selecting the right test level, and matching verification effort to change risk.

## Philosophy

Not every change needs the same test shape. Good testing strategy focuses effort where it catches the most likely regressions.

## Verification

- [ ] The test type matches the change risk
- [ ] A behavior or regression target is explicit
- [ ] Verification evidence is concrete, not assumed

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| `testing-strategy` | `documentation` | Documentation structures explanation; testing strategy structures verification |
