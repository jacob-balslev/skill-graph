---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v3.schema.json
schema_version: 3
name: visual-design-foundations
description: "Use when designing or auditing visual craft: color palette, typography, spacing, elevation, rhythm, density, visual hierarchy, brand fit, contrast intent, and motion feel. Do NOT use for sign-system meaning (use `semiotics`), token/component architecture (use `design-system-architecture`), responsive structure (use `layout-composition`), or accessibility compliance (use `a11y`)."
version: 1.0.0
type: capability
browse_category: frontend
category: design/visual
scope: portable
owner: skill-graph-maintainer
freshness: "2026-05-11"
drift_check:
  last_verified: "2026-05-11"
eval_artifacts: present
eval_state: unverified
routing_eval: absent
stability: experimental
license: MIT
compatibility:
  notes: "Portable visual-design guidance for product UI, dashboards, docs, marketing-adjacent product surfaces, and design-system consumers. Does not replace brand-specific guidelines."
allowed-tools: Read Grep
keywords:
  - visual-design
  - visual hierarchy
  - palette direction
  - type scale
  - spacing rhythm
  - density rules
  - elevation treatment
  - motion feel
  - brand fit
examples:
  - "pick a visual direction for this dashboard without changing the task structure"
  - "audit color, typography, spacing, and hierarchy for this product page"
  - "this UI feels flat and hard to scan - improve the visual hierarchy"
  - "choose a restrained palette and type scale for an internal admin tool"
anti_examples:
  - "what does this icon or badge color communicate to users?"
  - "define semantic tokens and component variants"
  - "decide the responsive section order and breakpoint behavior"
  - "verify WCAG contrast, focus order, and screen-reader behavior"
relations:
  boundary:
    - skill: semiotics
      reason: "semiotics owns what visual signs mean; visual-design-foundations owns the craft choices that shape the surface"
    - skill: design-system-architecture
      reason: "design-system-architecture owns reusable tokens and components; visual-design-foundations owns visual direction and craft on a surface"
    - skill: layout-composition
      reason: "layout-composition owns responsive structure; visual-design-foundations owns palette, typography, rhythm, density, and polish"
    - skill: a11y
      reason: "a11y owns accessibility compliance; visual-design-foundations can propose visual choices that a11y later verifies"
  related:
    - semiotics
    - design-system-architecture
    - layout-composition
    - microcopy
    - a11y
  verify_with:
    - a11y
    - semiotics
portability:
  readiness: scripted
  targets:
    - agent-skills
lifecycle:
  stale_after_days: 365
  review_cadence: quarterly
---

# Visual Design Foundations

## Coverage

Design and audit visual craft for interface surfaces. Covers palette direction, type scale, spacing rhythm, hierarchy, density, elevation, borders, contrast intent, visual weight, motion feel, brand fit, and when a visual system should be split into deeper color, typography, or motion skills.

## Philosophy

Visual design is not decoration after structure; it is how the structure becomes legible. Good visual craft makes priority, grouping, affordance, and tone visible without asking the user to parse every label.

Keep this skill at foundation level. If the task needs formal color math, font-loading engineering, or token governance, hand off to the skill that owns that contract.

## Method

1. Name the surface type: operational tool, docs, dashboard, editorial page, marketplace, or brand page.
2. State the intended tone and scanning demand.
3. Choose palette roles before picking raw colors: surface, text, accent, success, warning, danger, info, disabled.
4. Define type roles: page title, section heading, control label, body, metadata, numeric emphasis.
5. Set spacing and density rules that match repeated use, not one screenshot.
6. Use elevation, border, and background only to clarify grouping or affordance.
7. Check visual decisions against `semiotics` and `a11y` before treating them as done.

## Evals

This skill ships a comprehension-eval artifact at [`examples/evals/visual-design-foundations.json`](../../examples/evals/visual-design-foundations.json). The checklist below is the authoring gate for visual-design decisions; the eval file is the grader surface.

## Verification

- [ ] Visual hierarchy makes primary content faster to find
- [ ] Palette roles are named by purpose rather than raw color
- [ ] Type roles are consistent and not oversized inside compact UI
- [ ] Spacing and density fit the surface's repeated-use context
- [ ] Elevation and borders clarify grouping instead of adding noise
- [ ] Motion, if used, clarifies state or continuity and can be reduced
- [ ] A11y contrast and non-color-only checks are deferred to `a11y`

## Do NOT Use When

| Use instead | When |
|---|---|
| `semiotics` | The question is what a color, icon, badge, shape, or visual metaphor means. |
| `design-system-architecture` | The task is semantic tokens, component APIs, theming contracts, or governance. |
| `layout-composition` | The task is responsive structure, grid tracks, breakpoints, or section order. |
| `a11y` | The task is WCAG contrast, focus, labels, keyboard access, or assistive technology. |
| `microcopy` | The task is the wording inside buttons, dialogs, empty states, errors, or tooltips. |
