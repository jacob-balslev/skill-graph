---
name: frontend-architecture
description: "Use when organizing a frontend codebase — module boundaries, component layering, state ownership, data-flow direction, and the separation between feature code and shared primitives. Do NOT use for visual design decisions, specific framework migration tactics, or backend API contract design. Do NOT use for Pick the brand color palette for a marketing site. Do NOT use for Design the REST endpoint shape for the orders resource. Do NOT use for Decide whether to use CSS-in-JS or Tailwind."
license: CC-BY-4.0
metadata:
  schema_version: "8"
  version: "1.0.0"
  subject: frontend-engineering
  scope: "Organizing a frontend codebase — module boundaries, component layering, state ownership, data-flow direction, and the separation between feature code and shared primitives. Portable across any frontend stack; principle-grounded, not repo-bound. Excludes visual design decisions, specific framework migration tactics, and backend API contract design."
  taxonomy_domain: engineering/frontend
  owner: skill-graph-maintainer
  freshness: "2026-05-12"
  drift_check: "{\"last_verified\":\"2026-05-12\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"frontend architecture\",\"component boundaries\",\"module organization\",\"state management shape\",\"feature-sliced design\",\"container presentational\",\"data flow direction\",\"shared primitives\",\"component layering\",\"frontend folder structure\"]"
  triggers: "[\"frontend architecture\",\"component boundaries\",\"folder structure\",\"state shape\",\"where should this code live\"]"
  examples: "[\"Decide whether a new modal lives in the shared component library or inside a feature folder\",\"Reorganize a frontend that has mixed presentational components and data-fetching components in the same files\",\"Choose a state shape that doesn't force every consumer to re-render on unrelated changes\"]"
  anti_examples: "[\"Pick the brand color palette for a marketing site\",\"Design the REST endpoint shape for the orders resource\",\"Decide whether to use CSS-in-JS or Tailwind\"]"
  relations: "{\"related\":[\"design-system-architecture\",\"design-module-composition\",\"refactor\",\"testing-strategy\",\"api-design\"],\"boundary\":[{\"skill\":\"design-system-architecture\",\"reason\":\"design-system-architecture covers token layering, primitive component contracts, and library publishing; this skill covers application-side organization that consumes those primitives.\"}]}"
  structural_verdict: PASS
  truth_verdict: PASS
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  public: "true"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/frontend-engineering/frontend-architecture/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# Frontend Architecture

## Coverage
Frontend architecture decides three things: where code lives (folder and module structure), what depends on what (allowed import direction), and who owns mutable state (component-local, feature-scoped, or global). This skill covers the common organizing models — feature-sliced (features/<feature>/{ui,model,api}), layered (components/, hooks/, services/, pages/), and domain-driven (domains/<domain>/{ui,logic,data}) — and the trade-offs each makes when the codebase grows from a few features to dozens.

Component layering separates primitives (no business knowledge, configurable purely through props — Button, Input, Stack), composed components (combine primitives with feature-specific layout, still no data fetching — OrderSummary, AddressForm), and connected components (own data fetching, mutation, and routing — OrderDetailPage). The boundary between composed and connected is the most common source of dependency tangles: a "shared" composed component that quietly reaches into a feature-specific store creates a back-edge that breaks the dependency graph.

State shape decisions span four axes: location (component, context, store), normalization (entity-keyed vs. nested), derivation (computed at read time vs. stored), and ownership (who can write). The shape choice determines what re-renders, what stays consistent across views, and what becomes a source of bugs when a mutation forgets to update one of several copies. Server state (data fetched from an API, cache-managed) and client state (UI-only, ephemeral) have different requirements and benefit from being managed by different tools.

Import direction enforces the architecture. A rule like "shared/ may not import from features/, and feature A may not import from feature B" is checkable with ESLint boundary plugins and tells the team at PR time when a change crosses an intended layer. Without enforcement, the structure degrades within months — a single shortcut import becomes the norm.

## Philosophy
The folder structure is not the architecture; the import graph is. A pretty folder tree with cyclic imports between features is architecturally worse than a flat folder with strict one-way dependencies. Optimize for "where would I look for this" (colocation by feature) and "what changes together stays together" (cohesion) over imposed taxonomy.

Server state and client state are different problems. Mixing them in a single store creates cache-invalidation bugs that look like rendering bugs. Use the same tool for fetching, caching, and revalidating server data; reserve global client state for genuinely cross-cutting UI concerns (theme, current user, route).

## Verification
- An import-boundary linter is configured and a CI step fails the build on violations.
- Every feature folder can be removed without touching code outside it, except a single registration point (route table, feature flag map).
- A new developer can name where any given piece of code lives within thirty seconds of being told the feature name and the kind of thing (UI vs. data vs. logic).
- Server state is fetched through one mechanism (a single query/cache library) — counting fetch call sites in client code returns approximately the number of distinct endpoints, not multiples per endpoint.
- Component props for shared primitives contain no feature-specific names; a grep for feature names in shared/ returns nothing.
- Re-render counts on a representative interaction can be measured and explained — no "this component re-renders five times and I'm not sure why."
- Tests follow the layering: primitives tested in isolation, connected components tested with mocked data layer, no test reaches across feature boundaries.

## Do NOT Use When
- The decision is visual rather than structural — color, type, spacing, motion. Use visual-design-foundations, color-system-design, or typography-system.
- The work is publishing or versioning a shared component library across multiple applications. Use design-system-architecture.
- The task is choosing or migrating a specific framework (React→Solid, Webpack→Vite). This skill is framework-neutral.
- You are designing the API the frontend consumes. Use api-design or system-interface-contracts.
- The problem is a single component's internal behavior or accessibility. Use design-module-composition, interaction-patterns, or a11y.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `frontend-engineering`
- Domain: `engineering/frontend`
- Scope: Organizing a frontend codebase — module boundaries, component layering, state ownership, data-flow direction, and the separation between feature code and shared primitives. Portable across any frontend stack; principle-grounded, not repo-bound. Excludes visual design decisions, specific framework migration tactics, and backend API contract design.

**When to use**
- Decide whether a new modal lives in the shared component library or inside a feature folder
- Reorganize a frontend that has mixed presentational components and data-fetching components in the same files
- Choose a state shape that doesn't force every consumer to re-render on unrelated changes
- Triggers: `frontend architecture`, `component boundaries`, `folder structure`, `state shape`, `where should this code live`

**Not for**
- Pick the brand color palette for a marketing site
- Design the REST endpoint shape for the orders resource
- Decide whether to use CSS-in-JS or Tailwind
- Owned by `design-system-architecture`

**Related skills**
- Related: `design-system-architecture`, `design-module-composition`, `refactor`, `testing-strategy`, `api-design`

**Keywords**
- `frontend architecture`, `component boundaries`, `module organization`, `state management shape`, `feature-sliced design`, `container presentational`, `data flow direction`, `shared primitives`, `component layering`, `frontend folder structure`

<!-- skill-graph-context:end -->
