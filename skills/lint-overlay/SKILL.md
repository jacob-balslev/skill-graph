---
schema_version: 2
name: lint-overlay
description: "Lint integration overlay on top of the testing-strategy skill. Activate when adding or enforcing lint rules as part of a test or verification plan. Do NOT use standalone — this overlay only makes sense when the base testing-strategy skill is also loaded."
version: 1.0.0
type: overlay
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
compatibility: Markdown, Git, any codebase with a lint tool
allowed-tools: Read Grep Bash
extends: testing-strategy
keywords:
  - lint
  - linting
  - lint rules
  - lint integration
  - static analysis
  - eslint
  - format check
triggers:
  - lint-overlay
relations:
  adjacent:
    - refactor
    - debugging
  verify_with:
    - testing-strategy
portability:
  readiness: scripted
  targets:
    - agent-skills
---

# Lint Overlay

## Extends

This skill extends `testing-strategy`. Load both skills when lint is a required part of the test and verification plan. All testing-strategy rules apply; this overlay adds the lint-specific rules below.

## Coverage

- Lint as verification: when a lint step belongs in a test plan and when it is out of scope
- Rule selection: choosing which lint rules to enforce based on the risk profile of the change
- Lint-gate placement: where lint fits in the verification sequence relative to unit and integration tests
- Failure triage: separating lint failures caused by the current change from pre-existing rule violations
- Overlay discipline: what this skill adds on top of testing-strategy and what it intentionally leaves to the base

## Overlay Rules

These rules augment (not replace) the testing-strategy base skill.

| Rule | When it applies | Why |
|---|---|---|
| Lint runs after unit tests, before integration tests | When the change touches logic and style | Lint fails are cheap to fix; catching them before integration saves context |
| Only enforce rules that were green before the change | When introducing lint to an existing codebase | Fail on regressions, not on pre-existing violations |
| Lint scope matches the test scope | When the diff is bounded to specific files | Run lint only on changed files unless a global rule is at risk |
| Lint failures are blocking, not advisory | When lint is part of the official CI gate | A lint failure is a test failure; treat it the same way |
| New lint rules require a migration plan | When adding a rule that affects many existing files | Adding a rule that immediately fails 200 files is not a test — it is a scope change |

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| `lint-overlay` | `testing-strategy` alone | If lint is not in scope for this change, load only the base skill |
| `lint-overlay` | `debugging` | Chasing a lint failure in a specific file is debugging, not lint strategy |
