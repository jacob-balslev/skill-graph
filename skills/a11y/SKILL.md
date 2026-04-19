---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v3.schema.json
schema_version: 3
name: a11y
description: "Use when building or reviewing interactive UI, forms, navigation, or dynamic content. Covers semantic HTML, keyboard access, focus management, labeling, state-change announcement, and reduced-motion / high-contrast preferences. Do NOT use for color-palette creation, visual branding, or prose reading-level accessibility — those belong to visual-design and documentation respectively."
version: 1.0.0
type: capability
browse_category: frontend
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
  notes: "Markdown, Git, any web stack"
allowed-tools: Read Grep
keywords:
  - accessibility
  - a11y
  - keyboard navigation
  - screen reader
  - focus management
  - keyboard not working
  - tab order
  - missing aria label
  - screen reader says
  - reduced motion
  - high contrast
  - semantic html
triggers:
  - a11y-skill
# File surface: a11y concerns live in user-facing markup and component code.
# Path-based routers activate this skill when the agent edits these file types.
# Tests are excluded (testing-strategy owns test authoring); generated files
# and vendor bundles are excluded with gitignore-style negations.
paths:
  - "**/*.{html,tsx,jsx,vue,svelte}"
  - "**/*.css"
  - "!**/*.test.{ts,tsx,js,jsx}"
  - "!**/dist/**"
  - "!**/node_modules/**"
examples:
  - "this modal is keyboard-trapped — users can't Escape to close it"
  - "screen reader doesn't announce when the form validation state changes"
  - "add proper labels to these form fields so assistive tech can read them"
  - "review this dropdown menu for arrow-key navigation and focus return"
anti_examples:
  - "pick an accessible brand color palette"              # color-palette design, not keyboard/SR behavior
  - "rewrite this error message at a 6th-grade reading level"  # documentation covers reading level
  - "clean up this accessibility code without changing how it behaves"  # refactor owns behavior preservation
relations:
  boundary:
    - skill: refactor
      reason: "refactor is behavior-preserving code modification; a11y is observable user-facing behavior"
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

Accessible interaction is structural, not cosmetic. It is decided by the primitive you picked, the focus order you wrote, and the label that ships or doesn't — not by the audit that runs after. Teams that treat accessibility as a finishing pass pay for it twice: once in remediation work that was cheaper to avoid, and again when assistive-technology users hit the failure and bounce. The correct default is to build with those users in scope from the first commit, not after the first lawsuit.

## Primitive Selection

The single highest-leverage accessibility decision is picking the right HTML primitive before styling. A wrong primitive cannot be rescued by ARIA; the right primitive usually needs no ARIA at all.

| User intent | Correct primitive | Wrong primitives (common mistakes) |
|---|---|---|
| Trigger an action on the same page | `<button type="button">` | `<a href="#">`, `<div onclick>`, `<span role="button">` |
| Navigate to a different URL | `<a href="…">` | `<button onclick=navigate>`, `<div onclick>` |
| Group related form controls | `<fieldset>` + `<legend>` | `<div>` with a heading above it |
| Label a form control | `<label for="…">` (or wrapping `<label>`) | `<div>` text next to the input, `placeholder` only |
| Show a collapsible section | `<details>` + `<summary>` | `<div>` with JS toggle and no ARIA |
| Present tabular data | `<table>` + `<th scope="…">` | `<div>` grid, CSS grid with no semantic role |
| Announce a status change | `<output>` or `role="status"` live region | Toast that only renders visually |
| Interactive widget not covered above | Native element + tested keyboard + ARIA pattern | Custom `<div>` with ad-hoc `role` and handlers |

### When ARIA is appropriate

Only when no native primitive fits the interaction, and only when you also ship the keyboard behavior that matches the role. Adding `role="button"` to a `<div>` without Enter/Space handlers is worse than either the correct `<button>` or the untyped `<div>` alone.

## Evals

This skill ships a comprehension-eval artifact at [`examples/evals/a11y.json`](../../examples/evals/a11y.json). The `Verification` checklist below is the authoring gate for a new interactive component; the eval file is how this skill is graded by `scripts/skill-audit.js --graded`. Do not conflate them — the checklist is for implementers, the eval is for the grader.

## Verification

- [ ] Interactive elements use the right semantic primitives
- [ ] Keyboard-only flows remain usable
- [ ] Focus is visible and lands in the correct place
- [ ] Labels and state changes are perceivable
- [ ] User preferences (reduced motion, high contrast) are respected

## Do NOT Use When

| Use instead | When |
|---|---|
| `documentation` | The task is prose structure or reading-level clarity, not interaction accessibility |
| `refactor` | The task is behavior-preserving code cleanup — refactoring does not change what assistive tech perceives |
