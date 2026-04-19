---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v3.schema.json
schema_version: 3
name: testing-strategy
description: "Use when planning tests for a bug fix, feature, or refactor — deciding what deserves a test, at which level, with what evidence. Covers test-scope decisions, test-level selection (unit / integration / contract / e2e), effort-to-risk matching, regression targeting, evidence quality, and failure-case coverage. Do NOT use for chasing a known failure (that is `debugging`), for pure doc writing (that is `documentation`), or for conceptual architecture discussion with no verification target (no dedicated skill — treat as strategy, not testing)."
version: 1.0.0
type: capability
browse_category: quality
scope: portable
owner: jacob-balslev
freshness: "2026-04-18"
drift_check:
  last_verified: "2026-04-18"
eval_artifacts: present
eval_state: passing
routing_eval: absent
stability: experimental
license: MIT
compatibility:
  notes: "Markdown, Git, any codebase"
allowed-tools: Read Grep Bash
keywords:
  - testing strategy
  - what to test
  - what not to test
  - which test level
  - test scope
  - effort vs risk
  - regression target
  - failure case coverage
  - test plan
  - do I need a test
  - should I test this
  - unit or integration
  - test coverage
  - pin this behavior
triggers:
  - testing-skill
routing_groups:
  - quality
examples:
  - "do I need a unit test for this pure formatter or is integration enough?"
  - "what's the right test level for a webhook handler that talks to Stripe?"
  - "the feature passes manual QA — does it need an automated test?"
  - "pin this regression so the same bug can't slip through again"
anti_examples:
  - "my existing test is failing — why?"                           # debugging chases specific failure
  - "write a testing-patterns guide for the contributor docs"      # documentation owns durable prose
  - "clean up this duplicated test setup across three files"       # refactor owns behavior-preserving code changes
relations:
  adjacent:
    - debugging
    - refactor
  boundary:
    - skill: documentation
      reason: "documentation is durable prose; testing-strategy is active verification planning"
  verify_with:
    - debugging
portability:
  readiness: scripted
  targets:
    - agent-skills
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

Most test suites fail the effort-to-risk test: they exercise code that will never break and skip code that breaks in production. The correct target is the behavior that ships to users, not the code you happen to have written last. Coverage percentage is a proxy, and every proxy eventually gets gamed — the real signal is regressions caught before release. A test that never fails is noise; a test that fails without isolating the cause is worse than no test at all because it wastes the next engineer's time.

## Test-Level Selection

Pick the test level by the risk of the change and the coupling of the behavior, not by the file you happen to be editing. Unit tests are cheap to write and cheap to pass; integration and contract tests are where real production bugs are actually caught.

| Situation | Test level | Why |
|---|---|---|
| Pure function, single-owner, no I/O | **Unit** | Fast, deterministic, zero setup. If you cannot unit-test it, the function is doing too much |
| Logic that composes multiple units inside one service | **Integration** (in-process) | Unit tests of each piece will miss composition bugs; integration test catches real wiring |
| Behavior that crosses a service / process / network boundary | **Contract** | Both sides need a shared verifiable agreement; a unit test on either side misses the real failure mode |
| User-visible flow end-to-end | **E2E** (one or two per critical path) | Proves the full path works at least once; too expensive to run for every code path |
| Bug fix for a bug that reached production | **Regression** at the level where the bug slipped through | If it slipped past unit tests, a unit test won't catch it next time; write the test at the level the bug exposed |
| Behavior that is "obviously correct," unchanged for a year, no external pressure | **No new test** | The test would never fail; it would only add maintenance cost. Every test is a liability until it catches a bug |

### Level-selection anti-patterns

- **Unit testing what should be an integration test** — mocking the only thing that could actually break. Fix: test the real integration, or admit the unit test proves nothing.
- **Integration testing what should be a unit test** — slow setup for a function that has no dependencies. Fix: extract the pure logic and unit-test it.
- **E2E-testing every code path** — fragile, slow, flaky. Fix: one E2E per critical user journey, unit/integration for the rest.
- **Adding a test because coverage dropped** — test has no regression target and never fails meaningfully. Fix: either find a real regression to pin, or delete the uncovered code if it has no value.

## Evals

This skill ships a comprehension-eval artifact at [`examples/evals/testing-strategy.json`](../../examples/evals/testing-strategy.json). The `Verification` checklist below is the authoring gate for a completed test plan; the eval file is how this skill is graded by `scripts/skill-audit.js --graded`. Do not conflate them — the checklist is for the test author, the eval is for the grader.

## Verification

- [ ] The test type matches the change risk
- [ ] A behavior or regression target is explicit
- [ ] Verification evidence is concrete, not assumed
- [ ] Failure cases and boundaries are covered, not only the happy path

## Do NOT Use When

| Use instead | When |
|---|---|
| `documentation` | The task structures explanation for a reader, not verification for a change |
| `debugging` | The task is chasing a known failure — strategy is planned before the failure, not after |
| `refactor` | The task is restructuring code; any test work is to preserve existing behavior, which belongs to the refactor skill's verification step |
