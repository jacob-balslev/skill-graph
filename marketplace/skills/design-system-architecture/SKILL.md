---
name: design-system-architecture
description: "Use when designing or auditing a design system's architecture: token taxonomy, semantic tokens, component APIs, theming, accessibility contracts, documentation, governance, and migration strategy. Do NOT use for information hierarchy and navigation (use `information-architecture`), page-specific layout (use `layout-composition`), visual craft direction (use `visual-design-foundations`), sentence-level UI copy (use `microcopy`), or accessibility-only audits (use `a11y`)."
license: MIT
compatibility: "Portable design-system architecture guidance for web and app component systems, token systems, and multi-theme UI libraries."
allowed-tools: Read Grep
metadata:
  schema_version: "4"
  version: "1.0.0"
  type: capability
  category: frontend
  domain: frontend/design-system
  scope: portable
  owner: skill-graph-maintainer
  freshness: "2026-05-11"
  drift_check: "{\"last_verified\":\"2026-05-11\"}"
  eval_artifacts: present
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"design tokens\",\"semantic tokens\",\"component API\",\"theming\",\"component library\",\"token taxonomy\",\"design system migration\",\"design system audit\",\"component library audit\",\"token drift\",\"component API consistency\",\"tokens components variants\"]"
  examples: "[\"define semantic tokens so charts, status colors, and surfaces do not hardcode raw colors\",\"audit this component library for API consistency and token drift\",\"design the theming architecture before adding dark mode\",\"how should we migrate old CSS variables to canonical design-system tokens?\"]"
  anti_examples: "[\"organize pages, nav, sitemap, and wayfinding\",\"rewrite the empty-state text and tooltip labels\",\"add aria-labels and keyboard behavior to this component\",\"draft an architecture note explaining why we chose Postgres over DynamoDB\"]"
  relations: "{\"boundary\":[{\"skill\":\"information-architecture\",\"reason\":\"information-architecture owns navigation and content structure; design-system-architecture owns tokens and component systems\"},{\"skill\":\"microcopy\",\"reason\":\"microcopy owns UI text patterns; design-system-architecture owns reusable component and token contracts\"},{\"skill\":\"a11y\",\"reason\":\"a11y verifies accessibility behavior; design-system-architecture embeds accessibility contracts into components\"},{\"skill\":\"layout-composition\",\"reason\":\"layout-composition owns page-specific responsive structure; design-system-architecture owns reusable component and token rules\"},{\"skill\":\"visual-design-foundations\",\"reason\":\"visual-design-foundations owns surface-level visual craft; design-system-architecture owns reusable system contracts\"},{\"skill\":\"interaction-patterns\",\"reason\":\"interaction-patterns owns selecting the right pattern for a task; design-system-architecture owns reusable component APIs once the pattern belongs in the system\"},{\"skill\":\"documentation\",\"reason\":\"documentation owns durable architecture notes and prose; design-system-architecture owns UI system contracts\"},{\"skill\":\"refactor\",\"reason\":\"refactor restructures code behavior-preservingly; design-system-architecture changes the UI system contract\"}],\"related\":[\"a11y\",\"microcopy\",\"information-architecture\",\"semantics\",\"layout-composition\",\"visual-design-foundations\",\"interaction-patterns\"],\"verify_with\":[\"a11y\",\"code-review\"]}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":365,\"review_cadence\":\"quarterly\"}"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v4
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/design-system-architecture/SKILL.md
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
