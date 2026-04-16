---
schema_version: 1
name: debugging
description: Debugging skill for reproducing failures, narrowing scope, checking evidence, and separating symptoms from root causes. Use when behavior is broken, tests fail, or runtime output contradicts expectations. Do NOT use for feature planning or pure refactoring work.
version: 1.0.0
type: workflow
family: engineering
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

Reproduction, scope reduction, evidence capture, root-cause isolation, and verification after a fix.

## Philosophy

A good debugging loop reduces uncertainty step by step. It does not jump straight from symptoms to preferred fixes.

## Workflow

1. Reproduce the issue
2. Capture the exact failing behavior
3. Narrow the affected surface
4. Identify the root cause
5. Verify the fix with the same evidence path

## Verification

- [ ] The original failure was reproduced or evidenced
- [ ] The fix targets the cause, not only the symptom
- [ ] The failure path was re-tested after the change

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| `debugging` | `refactor` | Refactor is for structural cleanup without failure-driven diagnosis |
