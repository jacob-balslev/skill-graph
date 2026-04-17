---
schema_version: 2
name: a11y
description: Accessibility skill for semantic HTML, keyboard support, focus behavior, and screen-reader-safe interaction design. Use when building or reviewing interactive UI, forms, navigation, or dynamic content. Do NOT use for color palette creation or visual branding strategy.
version: 1.0.0
type: capability
family: frontend
scope: portable
owner: maintainer
freshness: "2026-04-17"
drift_check: "2026-04-17"
eval_artifacts: planned
eval_state: unverified
routing_eval: absent
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
  readiness: scripted
  targets:
    - agent-skills
---

# Accessibility

## Coverage

- Semantic HTML: choosing the right primitive elements so structure is meaningful to assistive technology
- Keyboard access: making every interaction reachable and operable without a pointing device
- Focus management: keeping focus visible, predictable, and correctly placed after navigation and state changes
- Labeling and naming: ensuring every interactive element has a programmatic name that matches its visible label
- State and change announcement: communicating dynamic updates (loading, errors, success) to assistive technology
- Reduced-motion and high-contrast preferences: respecting user settings that affect interaction perception

## Philosophy

Accessibility is part of product quality, not a finishing pass. The correct default is usable structure and interaction from the start.

## Verification

- [ ] Interactive elements use the right semantic primitives
- [ ] Keyboard-only flows remain usable
- [ ] Focus is visible and lands in the correct place
- [ ] Labels and state changes are perceivable
- [ ] User preferences (reduced motion, high contrast) are respected

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| `a11y` | `documentation` | Documentation handles prose structure, not interaction accessibility |
| `a11y` | `refactor` | Behavior-preserving code cleanup is not the same as changing what assistive technology perceives |
