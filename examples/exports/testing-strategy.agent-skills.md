---
name: testing-strategy
description: "Use when planning tests for a bug fix, feature, or refactor — deciding what deserves a test, at which level, with what evidence. Covers test-scope decisions, test-level selection (unit / integration / contract / e2e), effort-to-risk matching, regression targeting, evidence quality, and failure-case coverage. Do NOT use for chasing a known failure (that is debugging), for pure doc writing, or for conceptual architecture discussion with no verification target."
license: MIT
compatibility: "Markdown, Git, any codebase"
allowed-tools: Read Grep Bash
metadata:
  schema_version: 2
  version: "1.0.0"
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
