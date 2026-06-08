---
name: interaction-patterns
description: "Use when choosing or auditing UI interaction patterns and controls: tabs vs pages, dropdown vs combobox, stepper vs wizard, modal vs inline edit, disclosure, command menus, selection, filtering, and gesture alternatives. Do NOT use for accessibility compliance (use `a11y`), task decomposition (use `task-analysis`), feedback-state staging (use `interaction-feedback`), or reusable component API design (use `design-system-architecture`). Do NOT use for audit this combobox for ARIA roles and keyboard support. Do NOT use for define the user's top task before choosing controls. Do NOT use for add skeleton loading and optimistic feedback to this action. Do NOT use for define the component props, variants, slots, and token contract. Do NOT use for feedback states after an action (use interaction-feedback). Do NOT use for component props, variants, slots, and token contracts (use design-module-composition)."
license: MIT
compatibility: Portable interaction-pattern guidance for web and app UI. Pattern choices should be checked against platform conventions and accessible-widget guidance before implementation.
allowed-tools: Read Grep
metadata:
  schema_version: "8"
  version: "1.0.0"
  subject: design
  scope: "Choosing and auditing UI interaction patterns and controls — tabs vs pages, dropdown vs combobox, stepper vs wizard, modal vs inline edit, disclosure, command menus, selection, filtering, and gesture alternatives. Portable across any UI; principle-grounded, not repo-bound. Excludes accessibility compliance (a11y), task decomposition (task-analysis), feedback-state staging (interaction-feedback), and reusable component API design (design-system-architecture)."
  taxonomy_domain: design/interaction
  owner: skill-graph-maintainer
  freshness: "2026-05-11"
  drift_check: "{\"last_verified\":\"2026-05-11\"}"
  eval_artifacts: present
  eval_state: unverified
  routing_eval: present
  stability: experimental
  keywords: "[\"interaction-patterns\",\"control pattern selection\",\"dropdown combobox choice\",\"modal inline edit choice\",\"tabs accordion choice\",\"bulk selection pattern\",\"command menu pattern\",\"disclosure pattern\",\"gesture alternative\",\"modal vs panel choice\"]"
  examples: "[\"should this control be a dropdown, combobox, radio group, or stepper?\",\"choose the interaction pattern for bulk editing rows in this table\",\"this modal interrupts the flow - should the edit be inline instead?\",\"decide whether these settings belong in tabs, accordion sections, or separate pages\"]"
  anti_examples: "[\"audit this combobox for ARIA roles and keyboard support\",\"define the user's top task before choosing controls\",\"add skeleton loading and optimistic feedback to this action\",\"define the component props, variants, slots, and token contract\"]"
  relations: "{\"boundary\":[{\"skill\":\"interaction-feedback\",\"reason\":\"interaction-feedback owns feedback states after an action; interaction-patterns owns the primary control and flow shape\"},{\"skill\":\"design-module-composition\",\"reason\":\"design-module-composition owns component props, variants, slots, and token contracts; interaction-patterns owns choosing the user-facing control pattern\"},{\"skill\":\"component-architecture\",\"reason\":\"component-architecture owns the component-library layering question (primitives, composites, product-specific) and headless/styled, controlled/uncontrolled splits; interaction-patterns owns choosing the user-facing control pattern before any component is designed\"}],\"related\":[\"layout-composition\",\"form-ux-architecture\",\"microcopy\",\"semiotics\",\"a11y\",\"task-analysis\",\"design-system-architecture\",\"spec-driven-development\"],\"verify_with\":[\"a11y\",\"task-analysis\"]}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":365,\"review_cadence\":\"quarterly\"}"
  structural_verdict: PASS
  truth_verdict: PASS
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  public: "true"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/design/interaction-patterns/SKILL.md
  skill_graph_export_description_projection: anti_examples+boundary
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

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `design`
- Domain: `design/interaction`
- Scope: Choosing and auditing UI interaction patterns and controls — tabs vs pages, dropdown vs combobox, stepper vs wizard, modal vs inline edit, disclosure, command menus, selection, filtering, and gesture alternatives. Portable across any UI; principle-grounded, not repo-bound. Excludes accessibility compliance (a11y), task decomposition (task-analysis), feedback-state staging (interaction-feedback), and reusable component API design (design-system-architecture).

**When to use**
- should this control be a dropdown, combobox, radio group, or stepper?
- choose the interaction pattern for bulk editing rows in this table
- this modal interrupts the flow - should the edit be inline instead?
- decide whether these settings belong in tabs, accordion sections, or separate pages

**Not for**
- audit this combobox for ARIA roles and keyboard support
- define the user's top task before choosing controls
- add skeleton loading and optimistic feedback to this action
- define the component props, variants, slots, and token contract
- Owned by `interaction-feedback`: feedback states after an action
- Owned by `design-module-composition`: component props, variants, slots, and token contracts
- Owned by `component-architecture`

**Related skills**
- Verify with: `a11y`, `task-analysis`
- Related: `layout-composition`, `form-ux-architecture`, `microcopy`, `semiotics`, `a11y`, `task-analysis`, `design-system-architecture`, `spec-driven-development`

**Keywords**
- `interaction-patterns`, `control pattern selection`, `dropdown combobox choice`, `modal inline edit choice`, `tabs accordion choice`, `bulk selection pattern`, `command menu pattern`, `disclosure pattern`, `gesture alternative`, `modal vs panel choice`

<!-- skill-graph-context:end -->
