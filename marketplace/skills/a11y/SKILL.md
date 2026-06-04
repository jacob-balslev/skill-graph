---
name: a11y
description: "Use when building or reviewing interactive UI, forms, navigation, or dynamic content. Covers semantic HTML, keyboard access, focus management, labeling, state-change announcement, and reduced-motion / high-contrast preferences. Do NOT use for color-palette creation, visual branding, feedback-state staging, or prose reading-level accessibility - those belong to `visual-design-foundations`, `interaction-feedback`, and documentation respectively. Do NOT use for rewrite this error message at a 6th-grade reading level. Do NOT use for clean up this accessibility code without changing how it behaves."
license: MIT
compatibility: "Markdown, Git, any web stack"
allowed-tools: Read Grep
metadata:
  last_audited: "2026-05-28"
  lint_verdict: PASS
  relations: "{\"verify_with\":[\"interaction-feedback\",\"semantics\",\"task-analysis\"]}"
  schema_version: "8"
  version: "1.0.0"
  subject: quality-assurance
  deployment_target: portable
  taxonomy_domain: quality/accessibility
  owner: skill-graph-maintainer
  freshness: "2026-04-18"
  drift_check: "{\"last_verified\":\"2026-04-18\"}"
  eval_artifacts: present
  eval_state: passing
  routing_eval: present
  stability: experimental
  keywords: "[\"screen reader\",\"announce\",\"validation state\",\"form labels\",\"assistive tech\",\"ARIA roles\",\"keyboard support\",\"arrow key\",\"navigation\",\"focus return\"]"
  triggers: "[\"a11y-skill\"]"
  paths: "[\"**/*.{html,tsx,jsx,vue,svelte}\",\"**/*.css\",\"!**/*.test.{ts,tsx,js,jsx}\",\"!**/dist/**\",\"!**/node_modules/**\"]"
  examples: "[\"this modal is keyboard-trapped — users can't Escape to close it\",\"screen reader doesn't announce when the form validation state changes\",\"add proper labels to these form fields so assistive tech can read them\",\"review this dropdown menu for arrow-key navigation and focus return\"]"
  anti_examples: "[\"rewrite this error message at a 6th-grade reading level\",\"clean up this accessibility code without changing how it behaves\"]"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  structural_verdict: PASS
  truth_verdict: PASS
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/quality-assurance/a11y/SKILL.md
  skill_graph_export_description_projection: anti_examples
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
- Deployment: `portable`
- Domain: `quality/accessibility`

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
- Verify with: `interaction-feedback`, `semantics`, `task-analysis`

**Keywords**
- `screen reader`, `announce`, `validation state`, `form labels`, `assistive tech`, `ARIA roles`, `keyboard support`, `arrow key`, `navigation`, `focus return`

<!-- skill-graph-context:end -->
