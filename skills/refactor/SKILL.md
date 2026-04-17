---
schema_version: 2
name: refactor
description: Refactor skill for behavior-preserving structural cleanup, simplification, and readability improvements. Use when reorganizing code without changing external behavior. Do NOT use for bug investigation or for adding new product behavior.
version: 1.0.0
type: workflow
family: engineering
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
  depends_on:
    - testing-strategy
portability:
  readiness: scripted
  targets:
    - agent-skills
    - cursor
    - windsurf
    - copilot
---

# Refactor

## Coverage

- Behavior preservation: identifying the external contract that must remain stable before any change
- Duplication reduction: consolidating repeated logic without over-abstraction
- Decomposition: extracting functions, modules, or types to improve readability and reuse
- Naming improvements: renaming so identifiers carry their real meaning
- Structure improvements: reorganizing file and module boundaries when the current layout obscures intent
- Verification before and after: running the same behavioral checks on both sides of the change

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
- [ ] No new abstraction was introduced speculatively

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| `refactor` | `debugging` | Debugging starts from a failing behavior rather than structural cleanup |
| `refactor` | `documentation` | Rewriting docs is documentation work, even when the docs describe code that was just refactored |
