---
name: a11y
description: "Use when building or reviewing interactive UI, forms, navigation, or dynamic content. Covers semantic HTML, keyboard access, focus management, labeling, state-change announcement, and reduced-motion / high-contrast preferences. Do NOT use for color-palette creation, visual branding, feedback-state staging, or prose reading-level accessibility - those belong to `visual-design-foundations`, `interaction-feedback`, and documentation respectively. Do NOT use for rewrite this error message at a 6th-grade reading level. Do NOT use for clean up this accessibility code without changing how it behaves."
license: MIT
compatibility: "Markdown, Git, any web stack"
allowed-tools: Read Grep
paths:
  - "**/*.{html,tsx,jsx,vue,svelte}"
  - "**/*.css"
  - "!**/*.test.{ts,tsx,js,jsx}"
  - "!**/dist/**"
  - "!**/node_modules/**"
metadata:
  relations: "{\"related\":[\"interaction-patterns\",\"form-ux-architecture\",\"interaction-feedback\",\"design-system-architecture\",\"refactor\",\"diagnosis\",\"linguistics\",\"visual-design-foundations\"],\"suppresses\":[\"best-practice\"],\"verify_with\":[\"testing-strategy\",\"interaction-feedback\",\"visual-design-foundations\"]}"
  subject: quality-assurance
  public: "true"
  scope: "Teaches implementation-level accessibility checks for interactive web UI: semantic HTML, keyboard operation, focus management, programmatic names, state-change announcements, and reduced-motion / high-contrast preferences. Excludes visual branding, color-palette creation, prose reading-level edits, and behavior-preserving cleanup that does not change assistive-technology behavior."
  taxonomy_domain: quality/accessibility
  stability: experimental
  keywords: "[\"screen reader\",\"announce\",\"validation state\",\"form labels\",\"assistive tech\",\"ARIA roles\",\"keyboard support\",\"arrow key\",\"navigation\",\"focus return\"]"
  triggers: "[\"a11y-skill\"]"
  examples: "[\"this modal is keyboard-trapped — users can't Escape to close it\",\"screen reader doesn't announce when the form validation state changes\",\"add proper labels to these form fields so assistive tech can read them\",\"review this dropdown menu for arrow-key navigation and focus return\"]"
  anti_examples: "[\"rewrite this error message at a 6th-grade reading level\",\"clean up this accessibility code without changing how it behaves\"]"
  mental_model: "Accessible interaction is the relationship between semantic primitives, keyboard behavior, focus movement, programmatic names, state announcement, and user preferences. Native elements carry much of that relationship by default; custom widgets must explicitly recreate the expected role, name, state, focus, and keyboard contract. Visual appearance is only one output of the component, while assistive technology reads the semantic and state model that the markup and ARIA expose."
  purpose: "Prevents interactive UI from shipping as visually usable but unavailable to keyboard and assistive-technology users. The skill moves accessibility decisions into implementation review: choose the right primitive first, preserve keyboard operation, make focus predictable, expose labels and state changes programmatically, and verify user-preference handling before the component is considered done."
  concept_boundary: "Not visual-design-foundations: color and visual hierarchy only enter this skill when contrast or user preferences affect perceivability. Not interaction-feedback: feedback timing and emotional tone are adjacent, but this skill owns whether dynamic state is programmatically announced. Not microcopy or linguistics: reading level and wording quality are separate unless the text is part of an accessible name, description, or error relationship. Not refactor: behavior-preserving cleanup is outside scope unless it changes semantic, focus, keyboard, or announcement behavior."
  analogy: "Accessible UI is like a building with visible signs and usable ramps: the path has to work through the structure, not just look finished from the street."
  misconception: "The common mistake is treating accessibility as ARIA tags or a post-build audit. ARIA can help only when it matches real keyboard and state behavior, and an audit cannot recover the lost leverage of choosing the correct native primitive and focus model early."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/quality-assurance/a11y/SKILL.md
  skill_graph_export_description_projection: anti_examples
---
# Accessibility

## Concept of the skill

Accessibility for interactive UI means the component exposes the same operable structure to keyboard users and assistive technology that sighted pointer users see visually. The skill checks whether the implementation chose semantic primitives, preserved keyboard operation, controlled focus, provided programmatic names and descriptions, announced dynamic state, and respected user preferences.

## Coverage

- Semantic HTML: choosing the right primitive elements so structure is meaningful to assistive technology
- Keyboard access: making every interaction reachable and operable without a pointing device
- Focus management: keeping focus visible, predictable, and correctly placed after navigation and state changes
- Labeling and naming: ensuring every interactive element has a programmatic name that matches its visible label
- State and change announcement: communicating dynamic updates (loading, errors, success) to assistive technology
- Reduced-motion and high-contrast preferences: respecting user settings that affect interaction perception

## Philosophy of the skill

Accessible interaction is structural, not cosmetic. It is decided by the primitive you picked, the focus order you wrote, and the label that ships or doesn't — not by the audit that runs after. Teams that treat accessibility as a finishing pass pay for it twice: once in remediation work that was cheaper to avoid, and again when assistive-technology users hit the failure and bounce. The correct default is to build with those users in scope from the first commit, not after the first lawsuit.

## Primitive Selection

The single highest-leverage accessibility decision is picking the right HTML primitive before styling. A wrong primitive cannot be rescued by ARIA; the right primitive usually needs no ARIA at all.

| User intent                          | Correct primitive                               | Wrong primitives (common mistakes)                      |
| ------------------------------------ | ----------------------------------------------- | ------------------------------------------------------- |
| Trigger an action on the same page   | `<button type="button">`                        | `<a href="#">`, `<div onclick>`, `<span role="button">` |
| Navigate to a different URL          | `<a href="…">`                                  | `<button onclick=navigate>`, `<div onclick>`            |
| Group related form controls          | `<fieldset>` + `<legend>`                       | `<div>` with a heading above it                         |
| Label a form control                 | `<label for="…">` (or wrapping `<label>`)       | `<div>` text next to the input, `placeholder` only      |
| Show a collapsible section           | `<details>` + `<summary>`                       | `<div>` with JS toggle and no ARIA                      |
| Present tabular data                 | `<table>` + `<th scope="…">`                    | `<div>` grid, CSS grid with no semantic role            |
| Announce a status change             | `<output>` or `role="status"` live region       | Toast that only renders visually                        |
| Interactive widget not covered above | Native element + tested keyboard + ARIA pattern | Custom `<div>` with ad-hoc `role` and handlers          |

### When ARIA is appropriate

Only when no native primitive fits the interaction, and only when you also ship the keyboard behavior that matches the role. Adding `role="button"` to a `<div>` without Enter/Space handlers is worse than either the correct `<button>` or the untyped `<div>` alone.

## Evals

This skill ships a comprehension-eval artifact at [`examples/evals/a11y.json`](https://github.com/jacob-balslev/skill-graph/blob/main/examples/evals/a11y.json). The `Verification` checklist below is the authoring gate for a new interactive component; the eval file is how this skill is graded by `scripts/skill-audit.js --graded`. Do not conflate them — the checklist is for implementers, the eval is for the grader.

## Verification

- [ ] Interactive elements use the right semantic primitives
- [ ] Keyboard-only flows remain usable
- [ ] Focus is visible and lands in the correct place
- [ ] Labels and state changes are perceivable
- [ ] User preferences (reduced motion, high contrast) are respected

## Do NOT Use When

| Use instead     | When                                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------------------- |
| `documentation` | The task is prose structure or reading-level clarity, not interaction accessibility                      |
| `refactor`      | The task is behavior-preserving code cleanup — refactoring does not change what assistive tech perceives |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `quality-assurance`
- Public: `true`
- Domain: `quality/accessibility`
- Scope: Teaches implementation-level accessibility checks for interactive web UI: semantic HTML, keyboard operation, focus management, programmatic names, state-change announcements, and reduced-motion / high-contrast preferences. Excludes visual branding, color-palette creation, prose reading-level edits, and behavior-preserving cleanup that does not change assistive-technology behavior.

**When to use**
- this modal is keyboard-trapped — users can't Escape to close it
- screen reader doesn't announce when the form validation state changes
- add proper labels to these form fields so assistive tech can read them
- review this dropdown menu for arrow-key navigation and focus return
- Triggers: `a11y-skill`

**Not for**
- rewrite this error message at a 6th-grade reading level
- clean up this accessibility code without changing how it behaves

**Related skills**
- Verify with: `testing-strategy`, `interaction-feedback`, `visual-design-foundations`
- Related: `interaction-patterns`, `form-ux-architecture`, `interaction-feedback`, `design-system-architecture`, `refactor`, `diagnosis`, `linguistics`, `visual-design-foundations`

**Concept**
- Mental model: Accessible interaction is the relationship between semantic primitives, keyboard behavior, focus movement, programmatic names, state announcement, and user preferences. Native elements carry much of that relationship by default; custom widgets must explicitly recreate the expected role, name, state, focus, and keyboard contract. Visual appearance is only one output of the component, while assistive technology reads the semantic and state model that the markup and ARIA expose.
- Purpose: Prevents interactive UI from shipping as visually usable but unavailable to keyboard and assistive-technology users. The skill moves accessibility decisions into implementation review: choose the right primitive first, preserve keyboard operation, make focus predictable, expose labels and state changes programmatically, and verify user-preference handling before the component is considered done.
- Boundary: Not visual-design-foundations: color and visual hierarchy only enter this skill when contrast or user preferences affect perceivability. Not interaction-feedback: feedback timing and emotional tone are adjacent, but this skill owns whether dynamic state is programmatically announced. Not microcopy or linguistics: reading level and wording quality are separate unless the text is part of an accessible name, description, or error relationship. Not refactor: behavior-preserving cleanup is outside scope unless it changes semantic, focus, keyboard, or announcement behavior.
- Analogy: Accessible UI is like a building with visible signs and usable ramps: the path has to work through the structure, not just look finished from the street.
- Common misconception: The common mistake is treating accessibility as ARIA tags or a post-build audit. ARIA can help only when it matches real keyboard and state behavior, and an audit cannot recover the lost leverage of choosing the correct native primitive and focus model early.

**Keywords**
- `screen reader`, `announce`, `validation state`, `form labels`, `assistive tech`, `ARIA roles`, `keyboard support`, `arrow key`, `navigation`, `focus return`

<!-- skill-graph-context:end -->
