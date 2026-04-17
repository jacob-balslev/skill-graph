---
schema_version: 2
name: testing-strategy
description: Testing strategy skill for deciding what to test, choosing the right test level, and verifying behavior changes with meaningful evidence. Use when planning tests for bug fixes, features, or refactors. Do NOT use for documentation writing or purely conceptual architecture discussion.
version: 1.0.0
type: capability
family: quality
scope: portable
owner: maintainer
freshness: "2026-04-17"
drift_check: "2026-04-17"
eval_artifacts: planned
eval_state: unverified
routing_eval: absent
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
routing_groups:
  - quality
relations:
  adjacent:
    - debugging
    - refactor
  boundary:
    - documentation
  verify_with:
    - debugging
portability:
  readiness: scripted
  targets:
    - agent-skills
    - cursor
    - windsurf
    - copilot
---

# Testing Strategy

## Coverage

- Test scope: deciding what behavior actually needs a test, and what does not earn the maintenance cost
- Test level selection: choosing between unit, integration, contract, and end-to-end tests based on risk and coupling
- Effort-to-risk matching: investing verification effort where regressions are most likely and most damaging
- Regression targeting: writing tests that pin the specific behavior a change risks breaking, not generic coverage
- Evidence quality: preferring concrete, reproducible verification over assumed or manual checks
- Failure-case coverage: ensuring boundary conditions and error paths are tested, not only the happy path

## Philosophy

Not every change needs the same test shape. Good testing strategy focuses effort where it catches the most likely regressions.

## Verification

- [ ] The test type matches the change risk
- [ ] A behavior or regression target is explicit
- [ ] Verification evidence is concrete, not assumed
- [ ] Failure cases and boundaries are covered, not only the happy path

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| `testing-strategy` | `documentation` | Documentation structures explanation; testing strategy structures verification |
| `testing-strategy` | `debugging` | Chasing a known failure is debugging work; test strategy is planned before the failure |
