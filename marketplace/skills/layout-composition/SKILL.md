---
name: layout-composition
description: "Use when deciding responsive page or screen structure: section order, scan pattern, grid/flex composition, breakpoints, viewport hierarchy, responsive media, and density. Do NOT use for user-goal decomposition (use `task-analysis`), navigation taxonomy (use `information-architecture`), visual polish (use `visual-design-foundations`), or component/token contracts (use `design-system-architecture`). Do NOT use for what is the user's top task for this route? Do NOT use for design the global navigation and sitemap. Do NOT use for pick the color palette, type scale, and visual mood. Do NOT use for define component variants and semantic tokens. Do NOT use for navigation and page grouping (use information-architecture). Do NOT use for visual craft choices (use visual-design-foundations). Do NOT use for reusable component and token contracts (use design-system-architecture)."
license: MIT
compatibility: "Portable layout and responsive-composition guidance for web apps, dashboards, documentation sites, admin tools, and mobile-first product surfaces."
allowed-tools: Read Grep
metadata:
  schema_version: "8"
  version: "1.0.0"
  type: capability
  operation: know
  category: design
  subject: frontend-ui
  domain: design/layout
  scope: portable
  owner: skill-graph-maintainer
  freshness: "2026-05-11"
  drift_check: "{\"last_verified\":\"2026-05-11\"}"
  eval_artifacts: present
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"layout-composition\",\"responsive screen composition\",\"viewport hierarchy\",\"breakpoint selection\",\"grid flex composition\",\"stable dimensions\",\"scan pattern\",\"responsive media\",\"density planning\",\"whitespace balance\"]"
  examples: "[\"turn this route hierarchy into a responsive section order\",\"decide whether this dashboard should use tabs, columns, or stacked sections on mobile\",\"the page works on desktop but the mobile scan path is broken\",\"choose grid tracks, breakpoints, and responsive media behavior for this screen\"]"
  anti_examples: "[\"what is the user's top task for this route?\",\"design the global navigation and sitemap\",\"pick the color palette, type scale, and visual mood\",\"define component variants and semantic tokens\"]"
  relations: "{\"boundary\":[{\"skill\":\"task-analysis\",\"reason\":\"task-analysis defines the user goal and first-viewport hierarchy contract; layout-composition turns that contract into responsive structure\"},{\"skill\":\"information-architecture\",\"reason\":\"information-architecture owns navigation and page grouping; layout-composition owns the structure inside a page or screen\"},{\"skill\":\"visual-design-foundations\",\"reason\":\"visual-design-foundations owns visual craft choices; layout-composition owns spatial structure and responsive behavior\"},{\"skill\":\"design-system-architecture\",\"reason\":\"design-system-architecture owns reusable component and token contracts; layout-composition uses those contracts on a concrete surface\"}],\"related\":[\"task-analysis\",\"information-architecture\",\"design-system-architecture\",\"a11y\",\"performance-engineering\"],\"verify_with\":[\"task-analysis\",\"a11y\"]}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":365,\"review_cadence\":\"quarterly\"}"
  structural_verdict: UNVERIFIED
  truth_verdict: UNVERIFIED
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/frontend-ui/layout-composition/SKILL.md
  skill_graph_export_description_projection: anti_examples+boundary
---

# Layout Composition

## Coverage

Compose page and screen structure so the hierarchy survives real viewports. Covers section order, scan pattern, grid and flex choices, responsive breakpoints, mobile-first stacking, stable dimensions, responsive media, density, empty/loaded-state footprint, and handoff from task hierarchy to implementation-ready layout.

## Philosophy

Layout is the visible contract between task priority and available space. A surface that has the right content can still fail if primary information collapses below the fold, controls jump between states, or a desktop-only composition is squeezed into a narrow viewport.

Start from hierarchy, then choose structure. Do not design to named devices; design to the point where the content starts to break.

## Method

1. Read the primary, secondary, and supporting hierarchy from `task-analysis` or the route contract.
2. Identify fixed-format elements: tables, cards, charts, boards, media, toolbars, and forms.
3. Choose the scan pattern: single column, master-detail, sidebar/content, table-first, card grid, or step flow.
4. Define responsive breakpoints where content breaks, not where devices are marketed.
5. Set stable dimensions for elements that must not resize on hover, loading, or label changes.
6. Decide what collapses, stacks, pins, hides, or moves at each breakpoint.
7. Check mobile, tablet, desktop, low-data, loading, empty, and error states.

## Evals

This skill ships a comprehension-eval artifact at [`examples/evals/layout-composition.json`](https://github.com/jacob-balslev/skill-graph/blob/main/examples/evals/layout-composition.json). The checklist below is the authoring gate for layout decisions; the eval file is the grader surface.

## Verification

- [ ] The primary task remains visible before supporting detail
- [ ] Breakpoints are content-driven rather than device-name-driven
- [ ] Fixed-format elements have stable dimensions or aspect ratios
- [ ] Mobile and narrow layouts preserve action order and recovery paths
- [ ] Loading, empty, and error states do not shift the core layout unpredictably
- [ ] Responsive media cannot overflow its container
- [ ] Accessibility landmarks, heading order, and focus order still match the visual order

## Do NOT Use When

| Use instead | When |
|---|---|
| `task-analysis` | The user goal, top task, or first-viewport hierarchy is not yet known. |
| `information-architecture` | The problem is global navigation, sitemap shape, or page grouping. |
| `visual-design-foundations` | The task is color, typography, spacing taste, mood, or polish. |
| `design-system-architecture` | The task is token taxonomy, component API, theming, or system governance. |
| `a11y` | The primary question is WCAG, ARIA, keyboard behavior, labels, or assistive-tech output. |
