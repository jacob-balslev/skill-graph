---
name: design-system-architecture
description: "Use when designing or auditing a design system's architecture: token taxonomy, semantic tokens, component APIs, theming, accessibility contracts, documentation, governance, and migration strategy. Do NOT use for information hierarchy and navigation (use `information-architecture`), page-specific layout (use `layout-composition`), visual craft direction (use `visual-design-foundations`), sentence-level UI copy (use `microcopy`), or accessibility-only audits (use `a11y`). Do NOT use for organize pages, nav, sitemap, and wayfinding. Do NOT use for rewrite the empty-state text and tooltip labels. Do NOT use for add aria-labels and keyboard behavior to this component. Do NOT use for draft an architecture note explaining why we chose Postgres over DynamoDB."
license: MIT
allowed-tools: Read Grep
metadata:
  subject: frontend-engineering
  public: "true"
  scope: "Designing and auditing a design system's architecture — token taxonomy, semantic tokens, component APIs, theming, accessibility contracts, documentation, governance, and migration strategy. Portable across any design system; principle-grounded, not repo-bound. Excludes information hierarchy and navigation (information-architecture), page-specific layout (layout-composition), visual craft direction (visual-design-foundations), sentence-level UI copy (microcopy), and accessibility-only audits (a11y)."
  taxonomy_domain: design/system
  stability: experimental
  keywords: "[\"design tokens\",\"semantic tokens\",\"component API\",\"theming\",\"component library\",\"token taxonomy\",\"design system migration\",\"design system audit\",\"component library audit\",\"token drift\"]"
  examples: "[\"define semantic tokens so charts, status colors, and surfaces do not hardcode raw colors\",\"audit this component library for API consistency and token drift\",\"design the theming architecture before adding dark mode\",\"how should we migrate old CSS variables to canonical design-system tokens?\"]"
  anti_examples: "[\"organize pages, nav, sitemap, and wayfinding\",\"rewrite the empty-state text and tooltip labels\",\"add aria-labels and keyboard behavior to this component\",\"draft an architecture note explaining why we chose Postgres over DynamoDB\"]"
  relations: "{\"related\":[\"component-architecture\",\"layout-composition\",\"visual-design-foundations\",\"interaction-patterns\",\"microcopy\",\"refactor\",\"a11y\",\"information-architecture\",\"semantics\"],\"verify_with\":[\"a11y\",\"code-review\",\"component-architecture\"]}"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "A design system architecture is to product UI what a building code plus a kit of standardized parts is to construction — it does not draw any single floor plan (the page layout) or pick the paint colors (the visual values); it defines the load-bearing vocabulary (semantic tokens), the certified components and how they connect (component contracts), and the rules every builder must follow (governance), so any team can assemble a sound, consistent building without re-engineering the joists each time."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/frontend-engineering/design-system-architecture/SKILL.md
  skill_graph_export_description_projection: anti_examples
---
# Design System Architecture

## Concept of the skill

A design system architecture is the discipline of turning recurring UI decisions into a governed, layered vocabulary so that building a screen becomes composition from durable parts rather than a fresh round of local choices. It has three layers and a rule layer. **Raw tokens** hold the literal brand values — a palette, a spacing ramp, a type scale. **Semantic tokens** name product meaning (surface, danger, primary-action, text-muted) and point at raw tokens, so the meaning of a token is stable while the value behind it can change per theme. **Component contracts** define each reusable piece — its purpose, props and slots, states, accessibility behavior, and composition rules — and consume only semantic tokens, never raw values. Over all three sits **governance**: forbidden local overrides, deprecation and migration paths, documentation that shows expected use and anti-use, and drift detection between code and design intent. The architecture's job is to encode decisions once and make them reusable and enforceable, so that color, spacing, state, theming, and accessibility are answered by the system instead of re-decided on every screen — and a theme change or token rename propagates through the semantic layer without rewriting components.

## Coverage

Design and audit reusable UI systems. Covers token taxonomy, semantic vs raw tokens, component APIs, variants, slots, theming, accessibility contracts, responsive behavior, documentation, governance, migration, and drift detection between code and design intent.

## Philosophy of the skill

A design system is a product architecture layer, not a style pile. Tokens and components should encode durable decisions so product work becomes faster and more consistent. If every screen still makes local choices for color, spacing, state, and behavior, the design system is only decorative.

Optimize for clear constraints. A system with too many escape hatches is not flexible; it is ungoverned.

## Method

1. Inventory tokens, components, variants, and usage hotspots.
2. Separate raw tokens from semantic tokens.
3. Define component contracts: purpose, props/slots, states, accessibility, and composition rules.
4. Establish theming and density rules before multiplying variants.
5. Mark forbidden local overrides and migration paths.
6. Add docs examples that show expected use and anti-use.
7. Verify real screens can be built without one-off styling.

## Verification

- [ ] Semantic tokens cover product meaning without leaking palette names
- [ ] Components have clear ownership and API boundaries
- [ ] Variants map to real use cases, not visual guesses
- [ ] Accessibility behavior is part of the component contract
- [ ] Theming does not require component-level rewrites
- [ ] Deprecated tokens or components have migration paths
- [ ] Real product screens can use the system without local escape hatches

## Do NOT Use When

| Use instead | When |
|---|---|
| `information-architecture` | You need page hierarchy, navigation, sitemap, or wayfinding. |
| `microcopy` | You need UI wording, labels, empty states, or error copy. |
| `a11y` | You need focused accessibility compliance verification. |
| `layout-composition` | You need page-specific responsive structure, section order, or breakpoints. |
| `visual-design-foundations` | You need color, typography, spacing, density, or visual craft direction. |
| `interaction-patterns` | You need to choose a control or interaction pattern before systemizing it. |
| `refactor` | You are only restructuring existing code without changing design-system contracts. |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `frontend-engineering`
- Public: `true`
- Domain: `design/system`
- Scope: Designing and auditing a design system's architecture — token taxonomy, semantic tokens, component APIs, theming, accessibility contracts, documentation, governance, and migration strategy. Portable across any design system; principle-grounded, not repo-bound. Excludes information hierarchy and navigation (information-architecture), page-specific layout (layout-composition), visual craft direction (visual-design-foundations), sentence-level UI copy (microcopy), and accessibility-only audits (a11y).

**When to use**
- define semantic tokens so charts, status colors, and surfaces do not hardcode raw colors
- audit this component library for API consistency and token drift
- design the theming architecture before adding dark mode
- how should we migrate old CSS variables to canonical design-system tokens?

**Not for**
- organize pages, nav, sitemap, and wayfinding
- rewrite the empty-state text and tooltip labels
- add aria-labels and keyboard behavior to this component
- draft an architecture note explaining why we chose Postgres over DynamoDB

**Related skills**
- Verify with: `a11y`, `code-review`, `component-architecture`
- Related: `component-architecture`, `layout-composition`, `visual-design-foundations`, `interaction-patterns`, `microcopy`, `refactor`, `a11y`, `information-architecture`, `semantics`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: A design system architecture is to product UI what a building code plus a kit of standardized parts is to construction — it does not draw any single floor plan (the page layout) or pick the paint colors (the visual values); it defines the load-bearing vocabulary (semantic tokens), the certified components and how they connect (component contracts), and the rules every builder must follow (governance), so any team can assemble a sound, consistent building without re-engineering the joists each time.
- Common misconception: |

**Keywords**
- `design tokens`, `semantic tokens`, `component API`, `theming`, `component library`, `token taxonomy`, `design system migration`, `design system audit`, `component library audit`, `token drift`

<!-- skill-graph-context:end -->
