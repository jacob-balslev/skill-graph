---
name: information-architecture
description: "Use when structuring information for findability: navigation, page hierarchy, docs architecture, sitemap shape, labeling systems, wayfinding, and content grouping. Do NOT use for formal category-governance work (use `taxonomy-design`), responsive page composition (use `layout-composition`), component/token architecture (use `design-system-architecture`), or sentence-level UI text (use `microcopy`). Do NOT use for make the category taxonomy and assignment rules for this skill library. Do NOT use for define design tokens, component APIs, and theming rules. Do NOT use for rewrite this tooltip and empty-state copy. Do NOT use for audit keyboard accessibility and ARIA semantics."
license: MIT
compatibility: "Portable IA guidance for apps, documentation, dashboards, admin tools, and skill libraries."
allowed-tools: Read Grep
metadata:
  relations: "{\"adjacent\":[\"interaction-feedback\",\"layout-composition\",\"task-analysis\"],\"boundary\":[\"design-system-architecture\",\"taxonomy-design\"],\"verify_with\":[\"a11y\"]}"
  subject: design
  subjects: "[\"design\",\"knowledge-organization\"]"
  deployment_target: portable
  scope: "Structuring information for findability — navigation, page hierarchy, docs architecture, sitemap shape, labeling systems, wayfinding, and content grouping. Portable across any product or docs surface; principle-grounded, not repo-bound. Excludes formal category-governance work (taxonomy-design), responsive page composition (layout-composition), component/token architecture (design-system-architecture), and sentence-level UI text (microcopy)."
  taxonomy_domain: design/information-architecture
  stability: experimental
  keywords: "[\"information architecture\",\"navigation structure\",\"sitemap\",\"wayfinding\",\"page hierarchy\",\"docs architecture\",\"labeling system\",\"content grouping\",\"findability\",\"content model\"]"
  examples: "[\"our docs have good content but nobody can find the setup instructions - how should the IA change?\",\"design the navigation and page hierarchy for this admin app\",\"these dashboard sections overlap and users do not know where to look first\",\"should this be a top-level nav item, a tab, a filter, or a page section?\"]"
  anti_examples: "[\"make the category taxonomy and assignment rules for this skill library\",\"define design tokens, component APIs, and theming rules\",\"rewrite this tooltip and empty-state copy\",\"audit keyboard accessibility and ARIA semantics\"]"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/design/information-architecture/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# Information Architecture

## Coverage

Structure information so users and agents can find, understand, and move through it. Covers navigation, sitemaps, hierarchy, page grouping, labeling systems, docs structure, cross-links, wayfinding cues, content models, and IA validation through real user tasks.

## Philosophy

Information architecture is not decoration. It is the contract between a user's goal and the system's structure. If the IA is wrong, good content and good components still feel confusing because the path to them is unclear.

Good IA starts from tasks, then chooses structure. Do not promote every important thing to top-level navigation. Do not bury frequently used workflows under technically accurate but user-invisible categories.

## Method

1. Name the top user tasks and entry points.
2. Inventory current content or screens.
3. Group by user goal first, implementation detail second.
4. Decide structure: nav item, page, tab, section, filter, or cross-link.
5. Apply label discipline: recognizable user language, stable nouns, no internal jargon.
6. Add wayfinding: current location, sibling options, next action, and escape path.
7. Test against task scenarios and no-prior-knowledge discovery.

## Evals

This skill ships a comprehension-eval artifact at [`examples/evals/information-architecture.json`](https://github.com/jacob-balslev/skill-graph/blob/main/examples/evals/information-architecture.json). The checklist below is the authoring gate for findability and structure decisions; the eval file is the grader surface.

## Verification

- [ ] Top tasks have obvious entry points
- [ ] Labels use user language rather than implementation terms
- [ ] Navigation levels are limited and predictable
- [ ] Similar content has one canonical home plus cross-links where needed
- [ ] Users can recover from a wrong turn without restarting
- [ ] Empty states and low-data states still preserve structure
- [ ] IA was tested against real task prompts

## Do NOT Use When

| Use instead | When |
|---|---|
| `taxonomy-design` | You need classification governance, facets, or category assignment rules. |
| `layout-composition` | You need responsive section order, grid/flex structure, or page-level scan pattern. |
| `design-system-architecture` | You need token, theme, component API, or design-system governance. |
| `microcopy` | The structure is settled and you need wording for labels, errors, or empty states. |
| `a11y` | The primary task is accessibility compliance or assistive-technology behavior. |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `design` (also: `knowledge-organization`)
- Deployment: `portable`
- Domain: `design/information-architecture`
- Scope: Structuring information for findability — navigation, page hierarchy, docs architecture, sitemap shape, labeling systems, wayfinding, and content grouping. Portable across any product or docs surface; principle-grounded, not repo-bound. Excludes formal category-governance work (taxonomy-design), responsive page composition (layout-composition), component/token architecture (design-system-architecture), and sentence-level UI text (microcopy).

**When to use**
- our docs have good content but nobody can find the setup instructions - how should the IA change?
- design the navigation and page hierarchy for this admin app
- these dashboard sections overlap and users do not know where to look first
- should this be a top-level nav item, a tab, a filter, or a page section?

**Not for**
- make the category taxonomy and assignment rules for this skill library
- define design tokens, component APIs, and theming rules
- rewrite this tooltip and empty-state copy
- audit keyboard accessibility and ARIA semantics

**Related skills**
- Verify with: `a11y`
- Related: `interaction-feedback`, `layout-composition`, `task-analysis`

**Keywords**
- `information architecture`, `navigation structure`, `sitemap`, `wayfinding`, `page hierarchy`, `docs architecture`, `labeling system`, `content grouping`, `findability`, `content model`

<!-- skill-graph-context:end -->
