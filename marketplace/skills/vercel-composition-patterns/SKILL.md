---
name: vercel-composition-patterns
description: "Use when refactoring React components with boolean-prop proliferation, designing flexible component APIs, building reusable component libraries, or reviewing component architecture — compound components, explicit variant components, children-over-render-props, the context provider state/actions/meta interface, boolean state-explosion auditing, and the React 19 API migration (ref-as-prop, use() over useContext()). Do NOT use for render performance optimization (memoization, suspense, profiling), visual styling, or Next.js routing/server-component framework patterns. Do NOT use for Memoize this component tree to stop re-renders. Do NOT use for Style this card with the brand spacing and color tokens. Do NOT use for Set up the App Router route and a server component for this page."
license: MIT
allowed-tools: Read Grep Bash
metadata:
  subject: frontend-engineering
  public: "true"
  scope: "React component composition patterns that prevent boolean-prop proliferation and scale a component API: compound components with shared context, explicit variant components over flag combinations, children-over-render-props, the provider state/actions/meta interface, boolean state-explosion auditing, and the React 19 API migration. Portable across any React codebase; principle-grounded, not repo-bound. Excludes render-performance optimization, visual styling, and Next.js framework-level routing/server-component patterns."
  taxonomy_domain: engineering/frontend
  stability: experimental
  keywords: "[\"composition pattern\",\"compound component\",\"boolean prop\",\"render prop\",\"react composition\",\"context provider\",\"state explosion\",\"explicit variant\",\"lifted state\",\"react 19 api\"]"
  triggers: "[\"compound component\",\"this component has too many props\",\"make this more composable\",\"refactor with render props\",\"component api design\"]"
  examples: "[\"Refactor a Button with isPrimary, isLoading, isDisabled, isGhost, isIcon booleans into explicit variant components\",\"Design a compound Tabs component where Tabs.List, Tabs.Tab, and Tabs.Panel share state through a context provider\",\"Replace a renderHeader/renderFooter render-prop API with children composition\"]"
  anti_examples: "[\"Memoize this component tree to stop re-renders\",\"Style this card with the brand spacing and color tokens\",\"Set up the App Router route and a server component for this page\"]"
  relations: "{\"related\":[\"state-management\",\"rendering-models\",\"design-system-architecture\",\"refactor\"],\"verify_with\":[\"code-review\"]}"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "Composition patterns are to a component API what a power strip with labeled, purpose-built outlets is to a wall socket wired with a dozen toggle switches — instead of guessing which combination of switches produces a working configuration, you plug each named part into the contract it was built for, and the impossible combinations simply have no socket to plug into."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/frontend-engineering/vercel-composition-patterns/SKILL.md
  skill_graph_export_description_projection: anti_examples
---
# React Composition Patterns

## Concept of the skill

This skill is the discipline of growing a React component's API by composition instead of by accumulating boolean flags. Its central move is the boolean state-explosion audit: before any prop is added, you count how many booleans a component already has, how many combined states that produces (2ⁿ), and how many of those combinations are impossible, unsupported, or contradictory — because the answer almost always reveals that the component's real shape is a small set of *named valid variants*, not the cartesian product of its flags. From that audit follow the patterns that scale: **compound components** (a family like `Tabs.List` / `Tabs.Tab` / `Tabs.Panel` that share state through a context provider rather than through prop drilling), **explicit variant components** (named modes instead of flag combinations), **children-over-render-props** (composing structure through `children` rather than `renderX` callbacks), and the **provider state/actions/meta interface** (one place owns the canonical state, the actions that mutate it, and the derived meta, decoupling consumers from how state is managed). The skill also carries the React 19 API migration — ref as a regular prop instead of `forwardRef`, and `use()` in place of `useContext()`. The throughline is restraint enforced by measurement: provider boundaries matter more than visual nesting, and a boolean prop is a cost to be justified against the audit, never a default reflex.

## Coverage

React component composition patterns that prevent boolean prop proliferation: compound components (shared-context child families), explicit variant components, children-over-render-props, the context provider state/actions/meta interface, the boolean state explosion audit, and the React 19 API migration (ref as a regular prop instead of `forwardRef`, `use()` over `useContext()`). Covers the refactor playbook from flag inventory through impossible-state deletion and variant extraction to provider-based composition.

The rule categories, in priority order:

| Priority | Category | Impact | Prefix |
| -------- | ----------------------- | ------ | --------------- |
| 1 | Component Architecture | HIGH | `architecture-` |
| 2 | State Management | MEDIUM | `state-` |
| 3 | Implementation Patterns | MEDIUM | `patterns-` |
| 4 | React 19 APIs | MEDIUM | `react19-` |

**1. Component Architecture (HIGH)**

- `architecture-avoid-boolean-props` — don't add boolean props to customize behavior; use composition.
- `architecture-compound-components` — structure complex components with shared context (a parent provides state; named children consume it).
- `architecture-boolean-state-audit` — count reachable vs impossible states before adding props.

**2. State Management (MEDIUM)**

- `state-decouple-implementation` — the provider is the only place that knows how state is managed.
- `state-context-interface` — define a generic interface with `state`, `actions`, and `meta` for dependency injection.
- `state-lift-state` — move state into provider components so siblings can access it without prop drilling.

**3. Implementation Patterns (MEDIUM)**

- `patterns-explicit-variants` — create explicit variant components instead of boolean modes.
- `patterns-children-over-render-props` — use `children` for composition instead of `renderX` props.

**4. React 19 APIs (MEDIUM)**

> **⚠️ React 19+ only.** Skip this section on React 18 or earlier.

- `react19-no-forwardref` — don't use `forwardRef`; pass `ref` as a regular prop, and use `use()` instead of `useContext()`.

### Boolean State Explosion Audit

Before adding a new prop or mode, answer:

1. How many booleans does this component already have?
2. How many combined states does that create (2ⁿ)?
3. Which of those states are impossible, unsupported, or nonsensical?
4. Can the valid states be named as explicit variants instead?

If a boolean produces impossible combinations, stop and refactor the API.

### Refactor Playbook

1. Inventory flags and modes.
2. Enumerate valid combinations.
3. Delete impossible states.
4. Name the remaining variants explicitly.
5. Extract a provider that owns `state`, `actions`, and `meta`.
6. Compose subcomponents around that contract.
7. Add one example or test per valid variant.

## Philosophy of the skill

Boolean props are technical debt that compounds exponentially. Every boolean added to a component doubles the state space, and most of those combined states are impossible or unsupported. Agents default to adding "just one more boolean" because it is the fastest path — this skill forces the discipline of auditing the state explosion first. Without it, agents regularly create components with five-plus booleans and fragile if/else rendering chains that break on edge-case combinations.

Composition is the antidote: build flexible, maintainable React components by using compound components, lifting state, and composing internals rather than toggling behavior through flags. Provider boundaries matter more than visual nesting — the provider owns `state`, `actions`, and `meta`, and consumers compose around that contract. These patterns make codebases easier for both humans and AI agents to work with as they scale, because the valid configurations stay explicit and enumerable instead of hiding inside a cartesian product of flags.

The core mandate is short and strict:

- Never add boolean props to customize behavior.
- If a component accumulates three or more booleans, treat the API as broken until proven otherwise by the state-explosion audit.
- Provider boundaries matter more than visual nesting; the provider owns state, actions, and meta.

## Verification

After applying this skill, verify:

- No component has 3+ boolean props without an explicit variant refactor.
- State is lifted into a context provider, not drilled through props.
- Compound components use `children` composition, not `renderX` props.
- React 19 code passes `ref` as a regular prop and uses `use()` instead of `useContext()`.
- Impossible state combinations are documented and eliminated (the audit's "delete impossible states" step is reflected in the code).
- Each valid variant has at least one example or test, so the enumerated states are exercised rather than assumed.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| React render-performance optimization (memoization, suspense, re-render profiling) | `react-best-practices` | The performance skill owns rendering optimization; this skill owns API shape, not render speed. |
| Visual component design and styling | a design/UI skill (e.g. `design-system-architecture`) | This skill covers the component's API surface, not its visual appearance, spacing, or tokens. |
| Next.js routing and server components | a Next.js framework skill | The framework skill owns routing and server-component patterns; this skill is React-composition-level, framework-agnostic. |
| A general behavior-preserving structural cleanup with no specific composition target | `refactor` | `refactor` owns generic restructuring; reach for this skill when the target API shape is specifically a composition pattern. |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `frontend-engineering`
- Public: `true`
- Domain: `engineering/frontend`
- Scope: React component composition patterns that prevent boolean-prop proliferation and scale a component API: compound components with shared context, explicit variant components over flag combinations, children-over-render-props, the provider state/actions/meta interface, boolean state-explosion auditing, and the React 19 API migration. Portable across any React codebase; principle-grounded, not repo-bound. Excludes render-performance optimization, visual styling, and Next.js framework-level routing/server-component patterns.

**When to use**
- Refactor a Button with isPrimary, isLoading, isDisabled, isGhost, isIcon booleans into explicit variant components
- Design a compound Tabs component where Tabs.List, Tabs.Tab, and Tabs.Panel share state through a context provider
- Replace a renderHeader/renderFooter render-prop API with children composition
- Triggers: `compound component`, `this component has too many props`, `make this more composable`, `refactor with render props`, `component api design`

**Not for**
- Memoize this component tree to stop re-renders
- Style this card with the brand spacing and color tokens
- Set up the App Router route and a server component for this page

**Related skills**
- Verify with: `code-review`
- Related: `state-management`, `rendering-models`, `design-system-architecture`, `refactor`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: Composition patterns are to a component API what a power strip with labeled, purpose-built outlets is to a wall socket wired with a dozen toggle switches — instead of guessing which combination of switches produces a working configuration, you plug each named part into the contract it was built for, and the impossible combinations simply have no socket to plug into.
- Common misconception: |

**Keywords**
- `composition pattern`, `compound component`, `boolean prop`, `render prop`, `react composition`, `context provider`, `state explosion`, `explicit variant`, `lifted state`, `react 19 api`

<!-- skill-graph-context:end -->
