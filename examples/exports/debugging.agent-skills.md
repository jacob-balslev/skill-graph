---
name: debugging
description: "Debugging skill for reproducing failures, narrowing scope, checking evidence, and separating symptoms from root causes. Use when behavior is broken, tests fail, or runtime output contradicts expectations. Do NOT use for feature planning or pure refactoring work."
license: MIT
compatibility: "Markdown, Git, any codebase"
allowed-tools: Read Grep Bash
metadata:
  schema_version: 1
  version: "1.0.0"
  type: workflow
  family: engineering
  scope: generic
  owner: maintainer
  freshness: "2026-04-16"
  drift_check: "2026-04-16"
  eval_status: pending
  stability: experimental
  keywords:
    - debugging
    - bug
    - reproduce
    - failing test
    - root cause
  triggers:
    - debugging-skill
  relations:
    adjacent:
      - testing-strategy
      - refactor
    boundary:
      - documentation
    verify_with:
      - testing-strategy
  portability:
    level: high
    exports:
      - agent-skills
      - cursor
      - windsurf
      - copilot
---

# Debugging

## Coverage

- Reproduction: turning a vague bug report into a deterministic failing case
- Scope reduction: isolating the smallest surface where the failure still reproduces
- Evidence capture: collecting logs, stack traces, and state snapshots at the moment of failure
- Root-cause isolation: distinguishing symptoms from causes and resisting the urge to patch symptoms
- Fix verification: re-running the original failure path to confirm the fix is real
- Regression prevention: converting the failing case into a permanent test so the same bug cannot return silently

## Philosophy

A good debugging loop reduces uncertainty step by step. It does not jump straight from symptoms to preferred fixes.

## Workflow

1. Reproduce the issue
2. Capture the exact failing behavior
3. Narrow the affected surface
4. Identify the root cause
5. Verify the fix with the same evidence path
6. Add a regression test so the failure cannot return silently

## Verification

- [ ] The original failure was reproduced or evidenced
- [ ] The fix targets the cause, not only the symptom
- [ ] The failure path was re-tested after the change
- [ ] A regression test exists covering the failure path

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| `debugging` | `refactor` | Refactor is for structural cleanup without failure-driven diagnosis |
| `debugging` | `testing-strategy` | Designing a new test suite is not the same as chasing a known failure |
