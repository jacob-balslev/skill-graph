---
name: interaction-patterns
description: "Use when choosing or auditing UI interaction patterns and controls: tabs vs pages, dropdown vs combobox, stepper vs wizard, modal vs inline edit, disclosure, command menus, selection, filtering, and gesture alternatives. Do NOT use for accessibility compliance (use `a11y`), task decomposition (use `task-analysis`), feedback-state staging (use `interaction-feedback`), or reusable component API design (use `design-system-architecture`). Do NOT use for audit this combobox for ARIA roles and keyboard support. Do NOT use for define the user's top task before choosing controls. Do NOT use for add skeleton loading and optimistic feedback to this action. Do NOT use for define the component props, variants, slots, and token contract. Do NOT use for feedback states after an action (use interaction-feedback). Do NOT use for component props, variants, slots, and token contracts (use design-module-composition)."
license: MIT
allowed-tools: Read Grep
metadata:
  subject: design
  public: "true"
  scope: "Choosing and auditing UI interaction patterns and controls — tabs vs pages, dropdown vs combobox, stepper vs wizard, modal vs inline edit, disclosure, command menus, selection, filtering, and gesture alternatives. Portable across any UI; principle-grounded, not repo-bound. Excludes accessibility compliance (a11y), task decomposition (task-analysis), feedback-state staging (interaction-feedback), and reusable component API design (design-system-architecture)."
  taxonomy_domain: design/interaction
  stability: experimental
  keywords: "[\"interaction patterns\",\"control pattern selection\",\"dropdown combobox choice\",\"modal inline edit choice\",\"tabs accordion choice\",\"bulk selection pattern\",\"command menu pattern\",\"disclosure pattern\",\"gesture alternative\",\"modal vs panel choice\"]"
  triggers: "[\"interaction patterns\",\"choose a control pattern\",\"modal or inline edit\",\"tabs or accordion\",\"dropdown or combobox\"]"
  examples: "[\"should this control be a dropdown, combobox, radio group, or stepper?\",\"choose the interaction pattern for bulk editing rows in this table\",\"this modal interrupts the flow - should the edit be inline instead?\",\"decide whether these settings belong in tabs, accordion sections, or separate pages\"]"
  anti_examples: "[\"audit this combobox for ARIA roles and keyboard support\",\"define the user's top task before choosing controls\",\"add skeleton loading and optimistic feedback to this action\",\"define the component props, variants, slots, and token contract\"]"
  relations: "{\"related\":[\"layout-composition\",\"form-ux-architecture\",\"microcopy\",\"semiotics\",\"a11y\",\"task-analysis\",\"design-system-architecture\",\"spec-driven-development\"],\"suppresses\":[{\"skill\":\"interaction-feedback\",\"reason\":\"interaction-feedback owns feedback states after an action; interaction-patterns owns the primary control and flow shape\"},{\"skill\":\"design-module-composition\",\"reason\":\"design-module-composition owns component props, variants, slots, and token contracts; interaction-patterns owns choosing the user-facing control pattern\"},{\"skill\":\"component-architecture\",\"reason\":\"component-architecture owns the component-library layering question (primitives, composites, product-specific) and headless/styled, controlled/uncontrolled splits; interaction-patterns owns choosing the user-facing control pattern before any component is designed\"}],\"verify_with\":[\"a11y\",\"task-analysis\"]}"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "Choosing an interaction pattern is like a surgeon choosing the approach before choosing the instrument — the decision is driven by the anatomy of the problem (how many options, ordered or not, reversible or not), and only once the approach is right does it make sense to pick the exact tool; a brilliant instrument used for the wrong approach still produces a worse outcome than the plain instrument used correctly."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/design/interaction-patterns/SKILL.md
  skill_graph_export_description_projection: anti_examples+boundary
---

# Interaction Patterns

## Concept of the skill

An interaction pattern is the chosen shape of how a user makes a decision or takes an action on a surface — tabs versus pages, dropdown versus combobox, stepper versus wizard, modal versus inline edit, command menu, disclosure, bulk selection, filtering, and the rest. The discipline is to derive that choice from the shape of the user's decision rather than from a catalogue of available components. Two questions settle most cases: what is the user actually deciding (compare, choose one, choose many, sequence, search, edit, confirm, or recover), and what is the choice set like (small, large, searchable, hierarchical, ordered, destructive, reversible, repeated)? From those the simplest pattern that keeps the needed context visible follows. A chosen pattern is then pressure-tested against its edges — selection, cancel, escape, undo, invalid action, keyboard alternatives to pointer gestures, and behavior under loading, empty, error, and permission-limited states. Pattern choice is upstream of component design and accessibility implementation: it decides which control the user faces; the component API and the ARIA wiring come afterward.

## Coverage

Choose and audit interaction patterns before implementation. Covers control selection, mode switching, progressive disclosure, modals, drawers, tabs, accordions, command menus, comboboxes, steppers, wizards, inline edit, bulk selection, filters, sorting, gestures, keyboard alternatives, and pattern fit under task pressure.

The decision shapes that drive pattern choice are: **compare** (the user must weigh options side by side — favors visible options over hidden ones), **choose one** (single selection from a set — radio/segmented for small sets, dropdown/combobox for large), **choose many** (multi-selection — checkboxes, tag inputs, bulk-select with a contextual action bar), **sequence** (ordered steps — stepper for short known sequences, wizard only when ceremony is genuinely warranted), **search** (the set is large and the user knows what they want — combobox/command menu), **edit** (modify a value in place — inline edit when context must stay, modal/panel when the edit is involved), **confirm** (a deliberate gate before a consequential action), and **recover** (undo, cancel, escape, retry).

Choice-set characteristics modulate the pattern: a **small** closed set tolerates always-visible controls; a **large** set needs search; a **hierarchical** set needs nesting or a tree; an **ordered** set needs a sequence pattern; a **destructive** action needs a confirm or an undo window; a **reversible** action can skip the confirm in favor of undo; a **repeated** action favors keyboard-first and bulk patterns.

Hidden options (in dropdowns, accordions, overflow menus) are acceptable only when comparison is not required. Modals are justified only when the interaction genuinely needs to block the surface; otherwise a drawer, panel, or inline pattern keeps context. Every pointer-only gesture needs a keyboard or explicit-control alternative before handoff.

## Philosophy of the skill

Most confusing interfaces are not missing components; they chose the wrong pattern for the decision the user has to make. A dropdown hides options that need comparison. A modal blocks context the user needs. A wizard adds ceremony to a task that only needed one form.

Choose the pattern from the user's decision shape: compare, choose one, choose many, sequence, search, edit, confirm, or recover. The component and its styling are consequences of that choice, never the starting point.

The simplest pattern that keeps the needed context visible wins. Complexity in interaction is a cost paid on every use; the burden of proof is on the more elaborate pattern, not the simpler one.

## Method

1. Name the user decision or action the control must support.
2. Classify the choice set: small, large, searchable, hierarchical, ordered, destructive, reversible, or repeated.
3. Choose the simplest known pattern that keeps needed context visible.
4. Preserve alternatives for keyboard and non-pointer users before handoff to `a11y`.
5. Define what happens on selection, cancel, escape, undo, and invalid action.
6. Check whether the pattern works with loading, empty, error, and permission-limited states.
7. Hand off feedback-state staging to `interaction-feedback` and component API concerns to `design-system-architecture`.

## Verification

- [ ] The pattern matches the user's decision type.
- [ ] Hidden options are acceptable only when comparison is not required.
- [ ] Context needed to decide is visible or intentionally preserved.
- [ ] Cancel, escape, undo, and invalid-action behavior are defined.
- [ ] Pointer-only gestures have a keyboard or explicit control alternative.
- [ ] Loading, empty, error, and disabled states fit the pattern.
- [ ] Accessibility implementation is handed off to `a11y`.

## Do NOT Use When

| Use instead | When |
|---|---|
| `a11y` | The task is ARIA roles, keyboard behavior, focus management, labels, or WCAG compliance. |
| `task-analysis` | The user goal, top task, or flow breakpoint is still unknown. |
| `interaction-feedback` | The pattern is chosen and the task is feedback timing, progress, optimistic UI, or state visibility. |
| `design-system-architecture` | The task is reusable component APIs, variants, slots, tokens, or governance. |
| `component-architecture` | The task is the component-library layering (primitive/composite/assembly) and headless/styled or controlled/uncontrolled API splits. |
| `form-ux-architecture` | The surface is primarily a form with validation, field grouping, and submission lifecycle concerns. |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `design`
- Public: `true`
- Domain: `design/interaction`
- Scope: Choosing and auditing UI interaction patterns and controls — tabs vs pages, dropdown vs combobox, stepper vs wizard, modal vs inline edit, disclosure, command menus, selection, filtering, and gesture alternatives. Portable across any UI; principle-grounded, not repo-bound. Excludes accessibility compliance (a11y), task decomposition (task-analysis), feedback-state staging (interaction-feedback), and reusable component API design (design-system-architecture).

**When to use**
- should this control be a dropdown, combobox, radio group, or stepper?
- choose the interaction pattern for bulk editing rows in this table
- this modal interrupts the flow - should the edit be inline instead?
- decide whether these settings belong in tabs, accordion sections, or separate pages
- Triggers: `interaction patterns`, `choose a control pattern`, `modal or inline edit`, `tabs or accordion`, `dropdown or combobox`

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

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: Choosing an interaction pattern is like a surgeon choosing the approach before choosing the instrument — the decision is driven by the anatomy of the problem (how many options, ordered or not, reversible or not), and only once the approach is right does it make sense to pick the exact tool; a brilliant instrument used for the wrong approach still produces a worse outcome than the plain instrument used correctly.
- Common misconception: |

**Keywords**
- `interaction patterns`, `control pattern selection`, `dropdown combobox choice`, `modal inline edit choice`, `tabs accordion choice`, `bulk selection pattern`, `command menu pattern`, `disclosure pattern`, `gesture alternative`, `modal vs panel choice`

<!-- skill-graph-context:end -->
