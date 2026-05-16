---
name: interaction-patterns
description: "Use when choosing or auditing UI interaction patterns and controls: tabs vs pages, dropdown vs combobox, stepper vs wizard, modal vs inline edit, disclosure, command menus, selection, filtering, and gesture alternatives. Do NOT use for accessibility compliance (use `a11y`), task decomposition (use `task-analysis`), feedback-state staging (use `interaction-feedback`), or reusable component API design (use `design-system-architecture`)."
license: MIT
compatibility: Portable interaction-pattern guidance for web and app UI. Pattern choices should be checked against platform conventions and accessible-widget guidance before implementation.
allowed-tools: Read Grep
metadata:
  schema_version: "4"
  version: "1.0.0"
  type: capability
  category: design
  domain: design/interaction
  scope: portable
  owner: skill-graph-maintainer
  freshness: "2026-05-11"
  drift_check: "{\"last_verified\":\"2026-05-11\"}"
  eval_artifacts: present
  eval_state: unverified
  routing_eval: present
  stability: experimental
  keywords: "[\"interaction-patterns\",\"control pattern selection\",\"dropdown combobox choice\",\"modal inline edit choice\",\"tabs accordion choice\",\"bulk selection pattern\",\"command menu pattern\",\"disclosure pattern\",\"gesture alternative\"]"
  examples: "[\"should this control be a dropdown, combobox, radio group, or stepper?\",\"choose the interaction pattern for bulk editing rows in this table\",\"this modal interrupts the flow - should the edit be inline instead?\",\"decide whether these settings belong in tabs, accordion sections, or separate pages\"]"
  anti_examples: "[\"audit this combobox for ARIA roles and keyboard support\",\"define the user's top task before choosing controls\",\"add skeleton loading and optimistic feedback to this action\",\"define the component props, variants, slots, and token contract\"]"
  relations: "{\"boundary\":[{\"skill\":\"a11y\",\"reason\":\"a11y verifies accessibility semantics and keyboard behavior; interaction-patterns chooses the user-facing pattern before implementation\"},{\"skill\":\"task-analysis\",\"reason\":\"task-analysis identifies what the user is trying to accomplish; interaction-patterns chooses the control pattern that supports it\"},{\"skill\":\"interaction-feedback\",\"reason\":\"interaction-feedback owns feedback states after an action; interaction-patterns owns the primary control and flow shape\"},{\"skill\":\"design-system-architecture\",\"reason\":\"design-system-architecture owns reusable component APIs; interaction-patterns decides which pattern is appropriate for a surface\"},{\"skill\":\"design-module-composition\",\"reason\":\"design-module-composition owns component props, variants, slots, and token contracts; interaction-patterns owns choosing the user-facing control pattern\"}],\"related\":[\"layout-composition\",\"form-ux-architecture\",\"microcopy\",\"semiotics\",\"a11y\"],\"verify_with\":[\"a11y\",\"task-analysis\"]}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":365,\"review_cadence\":\"quarterly\"}"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v4
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/interaction-patterns/SKILL.md
---

# Interaction Patterns

## Coverage

Choose and audit interaction patterns before implementation. Covers control selection, mode switching, progressive disclosure, modals, drawers, tabs, accordions, command menus, comboboxes, steppers, wizards, inline edit, bulk selection, filters, sorting, gestures, keyboard alternatives, and pattern fit under task pressure.

## Philosophy

Most confusing interfaces are not missing components; they chose the wrong pattern for the decision the user has to make. A dropdown hides options that need comparison. A modal blocks context the user needs. A wizard adds ceremony to a task that only needed one form.

Choose the pattern from the user's decision shape: compare, choose one, choose many, sequence, search, edit, confirm, or recover.

## Method

1. Name the user decision or action the control must support.
2. Classify the choice set: small, large, searchable, hierarchical, ordered, destructive, reversible, or repeated.
3. Choose the simplest known pattern that keeps needed context visible.
4. Preserve alternatives for keyboard and non-pointer users before handoff to `a11y`.
5. Define what happens on selection, cancel, escape, undo, and invalid action.
6. Check whether the pattern works with loading, empty, error, and permission-limited states.
7. Hand off component API concerns to `design-system-architecture`.

## Evals

This skill ships a comprehension-eval artifact at [`examples/evals/interaction-patterns.json`](https://github.com/jacob-balslev/skill-graph/blob/main/examples/evals/interaction-patterns.json). The checklist below is the authoring gate for pattern choice; the eval file is the grader surface.

## Verification

- [ ] The pattern matches the user's decision type
- [ ] Hidden options are acceptable only when comparison is not required
- [ ] Context needed to decide is visible or intentionally preserved
- [ ] Cancel, escape, undo, and invalid-action behavior are defined
- [ ] Pointer-only gestures have a keyboard or explicit control alternative
- [ ] Loading, empty, error, and disabled states fit the pattern
- [ ] Accessibility implementation is handed off to `a11y`

## Do NOT Use When

| Use instead | When |
|---|---|
| `a11y` | The task is ARIA roles, keyboard behavior, focus management, labels, or WCAG compliance. |
| `task-analysis` | The user goal, top task, or flow breakpoint is still unknown. |
| `interaction-feedback` | The pattern is chosen and the task is feedback timing, progress, optimistic UI, or state visibility. |
| `design-system-architecture` | The task is reusable component APIs, variants, slots, tokens, or governance. |
| `form-ux-architecture` | The surface is primarily a form with validation, field grouping, and submission lifecycle concerns. |
