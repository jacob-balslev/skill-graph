---
schema_version: 1
name: a11y
description: Accessibility skill for semantic HTML, keyboard support, focus behavior, and screen-reader-safe interaction design. Use when building or reviewing interactive UI, forms, navigation, or dynamic content. Do NOT use for color palette creation or visual branding strategy.
version: 1.0.0
type: capability
family: frontend
scope: generic
owner: maintainer
freshness: "2026-04-15"
drift_check: "2026-04-15"
eval_status: pending
stability: experimental
license: MIT
compatibility: Markdown, Git, any web stack
allowed-tools: Read Grep
keywords:
  - accessibility
  - a11y
  - keyboard navigation
  - screen reader
  - focus management
triggers:
  - a11y-skill
relations:
  adjacent:
    - documentation
    - testing-strategy
  boundary:
    - refactor
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

# Accessibility

## Coverage

Semantic HTML, keyboard access, focus management, labeling, and interaction states that support assistive technologies.

## Philosophy

Accessibility is part of product quality, not a finishing pass. The correct default is usable structure and interaction from the start.

## Verification

- [ ] Interactive elements use the right semantic primitives
- [ ] Keyboard-only flows remain usable
- [ ] Focus is visible and lands in the correct place
- [ ] Labels and state changes are perceivable

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| `a11y` | `documentation` | Documentation handles prose structure, not interaction accessibility |
