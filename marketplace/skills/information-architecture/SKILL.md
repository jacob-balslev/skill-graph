---
name: information-architecture
description: "Use when structuring information for findability: navigation, page hierarchy, docs architecture, sitemap shape, labeling systems, wayfinding, and content grouping. Do NOT use for formal category-governance work (use `taxonomy-design`), responsive page composition (use `layout-composition`), component/token architecture (use `design-system-architecture`), or sentence-level UI text (use `microcopy`). Do NOT use for make the category taxonomy and assignment rules for this skill library. Do NOT use for define design tokens, component APIs, and theming rules. Do NOT use for rewrite this tooltip and empty-state copy. Do NOT use for audit keyboard accessibility and ARIA semantics. Do NOT use for structure inside a page or screen (use layout-composition). Do NOT use for sentence-level UI text (use microcopy)."
license: MIT
allowed-tools: Read Grep
metadata:
  subject: design
  public: "true"
  subjects: "[\"design\",\"knowledge-organization\"]"
  scope: "Structuring information for findability — navigation, page hierarchy, docs architecture, sitemap shape, labeling systems, wayfinding, and content grouping. Portable across any product or docs surface; principle-grounded, not repo-bound. Excludes formal category-governance work (taxonomy-design), responsive page composition (layout-composition), component/token architecture (design-system-architecture), and sentence-level UI text (microcopy)."
  taxonomy_domain: design/information-architecture
  stability: experimental
  keywords: "[\"information architecture\",\"navigation structure\",\"sitemap\",\"wayfinding\",\"page hierarchy\",\"docs architecture\",\"labeling system\",\"content grouping\",\"findability\",\"content model\"]"
  triggers: "[\"information architecture\",\"navigation structure\",\"sitemap\",\"page hierarchy\",\"wayfinding\"]"
  examples: "[\"our docs have good content but nobody can find the setup instructions - how should the IA change?\",\"design the navigation and page hierarchy for this admin app\",\"these dashboard sections overlap and users do not know where to look first\",\"should this be a top-level nav item, a tab, a filter, or a page section?\"]"
  anti_examples: "[\"make the category taxonomy and assignment rules for this skill library\",\"define design tokens, component APIs, and theming rules\",\"rewrite this tooltip and empty-state copy\",\"audit keyboard accessibility and ARIA semantics\"]"
  relations: "{\"boundary\":[{\"skill\":\"layout-composition\",\"reason\":\"layout-composition owns structure inside a page or screen; information-architecture owns cross-page organization and wayfinding\"},{\"skill\":\"microcopy\",\"reason\":\"microcopy owns sentence-level UI text; information-architecture owns placement and hierarchy\"}],\"related\":[\"taxonomy-design\",\"task-analysis\",\"design-system-architecture\",\"layout-composition\",\"a11y\"],\"verify_with\":[\"task-analysis\",\"a11y\"]}"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "Information architecture is to a product what the floor plan and signage of a building are to its rooms — it does not furnish a room (layout) or write the notices on the wall (microcopy) or decide the building code for room types (taxonomy); it decides which rooms exist on which floor, how they are grouped, what each door is labeled, and how a lost visitor finds their way back to the lobby."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/design/information-architecture/SKILL.md
  skill_graph_export_description_projection: anti_examples+boundary
---

# Information Architecture

## Concept of the skill

Information architecture is the discipline of structuring information so that people and agents can find, understand, and move through it. It is the contract between a user's goal and the system's structure: when the IA is wrong, good content and good components still feel confusing because the path to them is unclear. Strong IA always starts from tasks — name the top user goals and entry points first — and only then chooses structure, grouping content by what the user is trying to accomplish rather than by how the system is built internally. Every item then gets a deliberate placement (nav item, page, tab, section, filter, or cross-link) decided by frequency and task-entry rather than by raw importance, a label drawn from recognizable user language, and a wayfinding layer that keeps the user oriented (where am I, what is nearby, what is next, how do I recover from a wrong turn). The whole structure is validated the same way it was conceived — against real task scenarios and no-prior-knowledge discovery — because an IA that merely looks logical to its authors but cannot be navigated by a first-time user has not done its job.

## Coverage

Structure information so users and agents can find, understand, and move through it. Covers navigation, sitemaps, hierarchy, page grouping, labeling systems, docs structure, cross-links, wayfinding cues, content models, and IA validation through real user tasks.

IA decisions resolve into a small set of recurring choices. **Placement:** for each piece of content, decide whether it is a top-level navigation item, a page, a tab within a page, a section on a page, a filter over a list, or a cross-link from a related location — governed by how often the item is used and whether it is a genuine task entry point, not by how important the team feels it is. **Grouping:** cluster content by user goal first and implementation detail second, so a user looking to "get set up" finds setup material together rather than scattered across product-feature silos. **Labeling:** name each group and destination in stable, recognizable user nouns, avoiding internal jargon and ensuring the same concept is named the same way everywhere. **Wayfinding:** every location communicates the current position, the sibling options at that level, the likely next action, and an escape path back to a known anchor. **Hierarchy depth:** navigation levels are kept limited and predictable, because deep or inconsistent nesting hides content as effectively as omitting it.

A recurring tension is the single-canonical-home rule: similar content should have one authoritative location plus cross-links from related places, rather than being duplicated into several homes (which fragments maintenance and confuses users about which copy is current). Empty states and low-data states are part of the IA, not an afterthought — the structure must still read clearly when a list is empty or a section has no data yet.

## Method

1. Name the top user tasks and entry points.
2. Inventory current content or screens.
3. Group by user goal first, implementation detail second.
4. Decide structure: nav item, page, tab, section, filter, or cross-link.
5. Apply label discipline: recognizable user language, stable nouns, no internal jargon.
6. Add wayfinding: current location, sibling options, next action, and escape path.
7. Test against task scenarios and no-prior-knowledge discovery.

## Philosophy of the skill

Information architecture is not decoration. It is the contract between a user's goal and the system's structure. If the IA is wrong, good content and good components still feel confusing because the path to them is unclear.

Good IA starts from tasks, then chooses structure. Do not promote every important thing to top-level navigation. Do not bury frequently used workflows under technically accurate but user-invisible categories.

The credibility of an IA comes from being tested, not asserted. A structure that reads logically to the team that built it routinely fails a first-time user, because the team's mental model is shaped by the system's internals while the user's is shaped by their goal. Restraint at the top level is part of the discipline: a navigation that promotes everything communicates nothing, so the practice is to earn each top-level slot against frequency and task-entry, push the rest down into sections, tabs, filters, and cross-links, and verify the result against real task prompts.

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
- Public: `true`
- Domain: `design/information-architecture`
- Scope: Structuring information for findability — navigation, page hierarchy, docs architecture, sitemap shape, labeling systems, wayfinding, and content grouping. Portable across any product or docs surface; principle-grounded, not repo-bound. Excludes formal category-governance work (taxonomy-design), responsive page composition (layout-composition), component/token architecture (design-system-architecture), and sentence-level UI text (microcopy).

**When to use**
- our docs have good content but nobody can find the setup instructions - how should the IA change?
- design the navigation and page hierarchy for this admin app
- these dashboard sections overlap and users do not know where to look first
- should this be a top-level nav item, a tab, a filter, or a page section?
- Triggers: `information architecture`, `navigation structure`, `sitemap`, `page hierarchy`, `wayfinding`

**Not for**
- make the category taxonomy and assignment rules for this skill library
- define design tokens, component APIs, and theming rules
- rewrite this tooltip and empty-state copy
- audit keyboard accessibility and ARIA semantics
- Owned by `layout-composition`: structure inside a page or screen
- Owned by `microcopy`: sentence-level UI text

**Related skills**
- Verify with: `task-analysis`, `a11y`
- Related: `taxonomy-design`, `task-analysis`, `design-system-architecture`, `layout-composition`, `a11y`

**Concept**
- Mental model: |
- Purpose: |
- Analogy: Information architecture is to a product what the floor plan and signage of a building are to its rooms — it does not furnish a room (layout) or write the notices on the wall (microcopy) or decide the building code for room types (taxonomy); it decides which rooms exist on which floor, how they are grouped, what each door is labeled, and how a lost visitor finds their way back to the lobby.
- Common misconception: |

**Keywords**
- `information architecture`, `navigation structure`, `sitemap`, `wayfinding`, `page hierarchy`, `docs architecture`, `labeling system`, `content grouping`, `findability`, `content model`

<!-- skill-graph-context:end -->
