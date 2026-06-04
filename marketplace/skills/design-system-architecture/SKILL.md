---
name: design-system-architecture
description: "Use when designing or auditing a design system's architecture: token taxonomy, semantic tokens, component APIs, theming, accessibility contracts, documentation, governance, and migration strategy. Do NOT use for information hierarchy and navigation (use `information-architecture`), page-specific layout (use `layout-composition`), visual craft direction (use `visual-design-foundations`), sentence-level UI copy (use `microcopy`), or accessibility-only audits (use `a11y`). Do NOT use for organize pages, nav, sitemap, and wayfinding. Do NOT use for rewrite the empty-state text and tooltip labels. Do NOT use for add aria-labels and keyboard behavior to this component. Do NOT use for draft an architecture note explaining why we chose Postgres over DynamoDB."
license: MIT
compatibility: "Portable design-system architecture guidance for web and app component systems, token systems, and multi-theme UI libraries."
allowed-tools: Read Grep
metadata:
  relations: "{\"adjacent\":[\"layout-composition\",\"visual-design-foundations\"],\"boundary\":[\"information-architecture\"],\"verify_with\":[\"a11y\"]}"
  schema_version: "8"
  version: "1.0.0"
  subject: frontend-engineering
  deployment_target: portable
  scope: "Designing and auditing a design system's architecture — token taxonomy, semantic tokens, component APIs, theming, accessibility contracts, documentation, governance, and migration strategy. Portable across any design system; principle-grounded, not repo-bound. Excludes information hierarchy and navigation (information-architecture), page-specific layout (layout-composition), visual craft direction (visual-design-foundations), sentence-level UI copy (microcopy), and accessibility-only audits (a11y)."
  taxonomy_domain: design/system
  owner: skill-graph-maintainer
  freshness: "2026-05-11"
  drift_check: "{\"last_verified\":\"2026-05-11\"}"
  eval_artifacts: present
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"design tokens\",\"semantic tokens\",\"component API\",\"theming\",\"component library\",\"token taxonomy\",\"design system migration\",\"design system audit\",\"component library audit\",\"token drift\"]"
  examples: "[\"define semantic tokens so charts, status colors, and surfaces do not hardcode raw colors\",\"audit this component library for API consistency and token drift\",\"design the theming architecture before adding dark mode\",\"how should we migrate old CSS variables to canonical design-system tokens?\"]"
  anti_examples: "[\"organize pages, nav, sitemap, and wayfinding\",\"rewrite the empty-state text and tooltip labels\",\"add aria-labels and keyboard behavior to this component\",\"draft an architecture note explaining why we chose Postgres over DynamoDB\"]"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":365,\"review_cadence\":\"quarterly\"}"
  structural_verdict: PASS
  truth_verdict: PASS
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/frontend-engineering/design-system-architecture/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# Design System Architecture

## Coverage

Design and audit reusable UI systems. Covers token taxonomy, semantic vs raw tokens, component APIs, variants, slots, theming, accessibility contracts, responsive behavior, documentation, governance, migration, and drift detection between code and design intent.

## Philosophy

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

## Evals

This skill ships a comprehension-eval artifact at [`examples/evals/design-system-architecture.json`](https://github.com/jacob-balslev/skill-graph/blob/main/examples/evals/design-system-architecture.json). The checklist below is the authoring gate for design-system architecture decisions; the eval file is the grader surface.

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
- Deployment: `portable`
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
- Verify with: `a11y`
- Related: `layout-composition`, `visual-design-foundations`

**Keywords**
- `design tokens`, `semantic tokens`, `component API`, `theming`, `component library`, `token taxonomy`, `design system migration`, `design system audit`, `component library audit`, `token drift`

<!-- skill-graph-context:end -->
