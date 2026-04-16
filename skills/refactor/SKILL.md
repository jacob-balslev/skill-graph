---
schema_version: 1
name: refactor
description: Refactor skill for behavior-preserving structural cleanup, simplification, and readability improvements. Use when reorganizing code without changing external behavior. Do NOT use for bug investigation or for adding new product behavior.
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
  - refactor
  - cleanup
  - simplify
  - extract function
  - reduce duplication
triggers:
  - refactor-skill
relations:
  adjacent:
    - debugging
    - testing-strategy
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

# Refactor

## Coverage

Behavior-preserving cleanup, duplication reduction, decomposition, and naming/structure improvements.

## Philosophy

Refactoring improves the shape of the code without changing what the code means or does for consumers.

## Workflow

1. Identify the behavior that must remain stable
2. Make the smallest structural improvement that helps
3. Re-run verification against the unchanged behavior

## Verification

- [ ] External behavior is unchanged
- [ ] The resulting structure is simpler or clearer
- [ ] Verification was run before and after the change

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| `refactor` | `debugging` | Debugging starts from a failing behavior rather than structural cleanup |
