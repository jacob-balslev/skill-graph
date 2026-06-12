---
name: layout-composition
description: "Use when deciding responsive page or screen structure: section order, scan pattern, grid/flex composition, breakpoints, viewport hierarchy, responsive media, and density. Do NOT use for user-goal decomposition (use `task-analysis`), navigation taxonomy (use `information-architecture`), visual polish (use `visual-design-foundations`), or component/token contracts (use `design-system-architecture`). Do NOT use for what is the user's top task for this route? Do NOT use for design the global navigation and sitemap. Do NOT use for pick the color palette, type scale, and visual mood. Do NOT use for define component variants and semantic tokens. Do NOT use for navigation and page grouping (use information-architecture). Do NOT use for visual craft choices (use visual-design-foundations)."
license: MIT
allowed-tools: Read Grep
metadata:
  subject: design
  public: "true"
  scope: "Deciding responsive page or screen structure — section order, scan pattern, grid/flex composition, breakpoints, viewport hierarchy, responsive media, and density. Portable across any UI; principle-grounded, not repo-bound. Excludes user-goal decomposition (task-analysis), navigation taxonomy (information-architecture), visual polish (visual-design-foundations), and component/token contracts (design-system-architecture)."
  taxonomy_domain: design/layout
  stability: experimental
  keywords: "[\"layout composition\",\"responsive screen composition\",\"viewport hierarchy\",\"breakpoint selection\",\"grid flex composition\",\"stable dimensions\",\"scan pattern\",\"responsive media\",\"density planning\",\"whitespace balance\"]"
  triggers: "[\"layout composition\",\"responsive layout\",\"section order\",\"breakpoints\",\"scan pattern\"]"
  examples: "[\"turn this route hierarchy into a responsive section order\",\"decide whether this dashboard should use tabs, columns, or stacked sections on mobile\",\"the page works on desktop but the mobile scan path is broken\",\"choose grid tracks, breakpoints, and responsive media behavior for this screen\"]"
  anti_examples: "[\"what is the user's top task for this route?\",\"design the global navigation and sitemap\",\"pick the color palette, type scale, and visual mood\",\"define component variants and semantic tokens\"]"
  relations: "{\"related\":[\"task-analysis\",\"information-architecture\",\"design-system-architecture\",\"a11y\",\"performance-engineering\",\"interaction-patterns\"],\"suppresses\":[{\"skill\":\"information-architecture\",\"reason\":\"information-architecture owns navigation and page grouping; layout-composition owns the structure inside a page or screen\"},{\"skill\":\"visual-design-foundations\",\"reason\":\"visual-design-foundations owns visual craft choices; layout-composition owns spatial structure and responsive behavior\"}],\"verify_with\":[\"task-analysis\",\"a11y\"]}"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "Layout composition is to a screen what an architect's floor plan is to a building — it does not choose the furniture's finish (visual polish) or decide why you need a kitchen (task analysis) or how you walk between buildings on the campus (information architecture); it fixes where the load-bearing rooms sit, how the space reflows when the lot is narrow, and which walls stay put so the structure holds at every size."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/design/layout-composition/SKILL.md
  skill_graph_export_description_projection: anti_examples+boundary
---
# Layout Composition

## Concept of the skill

Layout composition is the discipline of assigning priority-ranked content to space across the full range of viewports a surface must serve, so the task hierarchy survives every real screen. It runs in one direction — hierarchy first, structure second. Given the primary, secondary, and supporting content (handed over from task analysis or a route contract), composition chooses a scan pattern (single column, master-detail, sidebar/content, table-first, card grid, or step flow), lays down a grid or flex skeleton, and then sets breakpoints at the points where the content actually breaks rather than at marketed device widths. Two constraints are non-negotiable: spatial stability — fixed-format elements such as tables, charts, media, and cards get stable dimensions so they do not jump on hover, loading, or label changes; and ordered survival — at every breakpoint the primary content stays above the fold and the action and recovery order is preserved as elements stack, pin, collapse, or hide. The layout is the visible contract between task priority and available space, and it must hold not only at full data but across loading, empty, and error states. Composition arranges; it does not decide why the content exists, how the user navigates to it, how it is styled, or how its components are built.

## Coverage

Compose page and screen structure so the hierarchy survives real viewports. Covers section order, scan pattern, grid and flex choices, responsive breakpoints, mobile-first stacking, stable dimensions, responsive media, density, empty/loaded-state footprint, and handoff from task hierarchy to implementation-ready layout.

**Scan patterns** are the structural archetypes: *single column* (linear reading/forms), *master-detail* (a list plus a detail pane), *sidebar/content* (persistent nav or filters beside the main region), *table-first* (dense tabular data leads), *card grid* (browsable peers), and *step flow* (sequenced screens). The pattern is chosen from the content hierarchy, not from aesthetic preference.

**Breakpoints** are defined where the content breaks — where a column becomes too narrow to read, where a table can no longer show its essential columns, where a card grid drops below a usable card width — not at named device widths (375, 768, 1024). Designing to devices dates the layout the moment a new device ships; designing to content-break points keeps it durable.

**Stable dimensions** protect elements that must not resize on hover, load, or label change: reserve space for tables, charts, images (aspect-ratio), and toolbars so the surrounding layout does not reflow when their content arrives or updates. Layout shift during loading is a designed-out defect, not an inevitability.

**Reflow decisions** at each breakpoint specify what *collapses* (multi-column to single), *stacks* (side-by-side to vertical), *pins* (a toolbar/action bar stays reachable), *hides* (secondary detail behind disclosure), or *moves*. Across all of these, the primary task stays visible before supporting detail and the action/recovery order is preserved.

**State footprints** matter: the loading, empty, and error states of a region must occupy the same structural slot as the loaded state so the page does not jump between states, and responsive media must not overflow its container.

## Philosophy of the skill

Layout is the visible contract between task priority and available space. A surface that has the right content can still fail if primary information collapses below the fold, controls jump between states, or a desktop-only composition is squeezed into a narrow viewport.

Start from hierarchy, then choose structure. Do not design to named devices; design to the point where the content starts to break. A breakpoint tied to a device is a breakpoint that expires; a breakpoint tied to content is one that endures.

Stability is a feature. An element that holds its position through loading, hover, and label changes is doing invisible work — it keeps the user's spatial memory intact. Treat layout shift as a defect to design out, not an artifact to tolerate.

## Method

1. Read the primary, secondary, and supporting hierarchy from `task-analysis` or the route contract.
2. Identify fixed-format elements: tables, cards, charts, boards, media, toolbars, and forms.
3. Choose the scan pattern: single column, master-detail, sidebar/content, table-first, card grid, or step flow.
4. Define responsive breakpoints where content breaks, not where devices are marketed.
5. Set stable dimensions for elements that must not resize on hover, loading, or label changes.
6. Decide what collapses, stacks, pins, hides, or moves at each breakpoint.
7. Check mobile, tablet, desktop, low-data, loading, empty, and error states.

## Verification

- [ ] The primary task remains visible before supporting detail.
- [ ] Breakpoints are content-driven rather than device-name-driven.
- [ ] Fixed-format elements have stable dimensions or aspect ratios.
- [ ] Mobile and narrow layouts preserve action order and recovery paths.
- [ ] Loading, empty, and error states do not shift the core layout unpredictably.
- [ ] Responsive media cannot overflow its container.
- [ ] Accessibility landmarks, heading order, and focus order still match the visual order.

## Do NOT Use When

| Use instead | When |
|---|---|
| `task-analysis` | The user goal, top task, or first-viewport hierarchy is not yet known. |
| `information-architecture` | The problem is global navigation, sitemap shape, or page grouping. |
| `visual-design-foundations` | The task is color, typography, spacing taste, mood, or polish. |
| `design-system-architecture` | The task is token taxonomy, component API, theming, or system governance. |
| `a11y` | The primary question is WCAG, ARIA, keyboard behavior, labels, or assistive-tech output. |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `design`
- Public: `true`
- Domain: `design/layout`
- Scope: Deciding responsive page or screen structure — section order, scan pattern, grid/flex composition, breakpoints, viewport hierarchy, responsive media, and density. Portable across any UI; principle-grounded, not repo-bound. Excludes user-goal decomposition (task-analysis), navigation taxonomy (information-architecture), visual polish (visual-design-foundations), and component/token contracts (design-system-architecture).

**When to use**
- turn this route hierarchy into a responsive section order
- decide whether this dashboard should use tabs, columns, or stacked sections on mobile
- the page works on desktop but the mobile scan path is broken
- choose grid tracks, breakpoints, and responsive media behavior for this screen
- Triggers: `layout composition`, `responsive layout`, `section order`, `breakpoints`, `scan pattern`

**Not for**
- what is the user's top task for this route?
- design the global navigation and sitemap
- pick the color palette, type scale, and visual mood
- define component variants and semantic tokens
- Owned by `information-architecture`: navigation and page grouping
- Owned by `visual-design-foundations`: visual craft choices

**Related skills**
- Verify with: `task-analysis`, `a11y`
- Related: `task-analysis`, `information-architecture`, `design-system-architecture`, `a11y`, `performance-engineering`, `interaction-patterns`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: Layout composition is to a screen what an architect's floor plan is to a building — it does not choose the furniture's finish (visual polish) or decide why you need a kitchen (task analysis) or how you walk between buildings on the campus (information architecture); it fixes where the load-bearing rooms sit, how the space reflows when the lot is narrow, and which walls stay put so the structure holds at every size.
- Common misconception: |

**Keywords**
- `layout composition`, `responsive screen composition`, `viewport hierarchy`, `breakpoint selection`, `grid flex composition`, `stable dimensions`, `scan pattern`, `responsive media`, `density planning`, `whitespace balance`

<!-- skill-graph-context:end -->
