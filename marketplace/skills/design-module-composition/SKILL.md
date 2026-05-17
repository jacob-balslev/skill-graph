---
name: design-module-composition
description: "Use when designing reusable component modules — composition patterns, compound components, slot/children APIs, render props, headless component contracts, and the choice between configuration and composition. Do NOT use for application-level architecture, single-use feature components, or visual styling decisions."
license: CC-BY-4.0
metadata:
  metadata: "{\"schema_version\":6,\"version\":\"1.0.0\",\"type\":\"capability\",\"category\":\"design\",\"scope\":\"portable\",\"owner\":\"skill-graph-maintainer\",\"freshness\":\"2026-05-12\",\"drift_check\":\"{\\\\\\\"last_verified\\\\\\\":\\\\\\\"2026-05-12\\\\\\\"}\",\"eval_artifacts\":\"planned\",\"eval_state\":\"unverified\",\"routing_eval\":\"absent\",\"stability\":\"experimental\",\"keywords\":\"[\\\\\\\"component composition\\\\\\\",\\\\\\\"compound components\\\\\\\",\\\\\\\"slot api\\\\\\\",\\\\\\\"headless components\\\\\\\",\\\\\\\"render props\\\\\\\",\\\\\\\"polymorphic components\\\\\\\",\\\\\\\"asChild pattern\\\\\\\",\\\\\\\"children as api\\\\\\\",\\\\\\\"composition over configuration\\\\\\\",\\\\\\\"component contract design\\\\\\\",\\\\\\\"component module patterns\\\\\\\",\\\\\\\"selectable rows sortable columns\\\\\\\",\\\\\\\"primitives composites templates\\\\\\\"]\",\"triggers\":\"[\\\\\\\"compound component\\\\\\\",\\\\\\\"composition over configuration\\\\\\\",\\\\\\\"headless component\\\\\\\",\\\\\\\"slot pattern\\\\\\\",\\\\\\\"asChild\\\\\\\"]\",\"examples\":\"[\\\\\\\"Design a Dialog component whose trigger, content, and close button are addressable by consumers\\\\\\\",\\\\\\\"Refactor a Card with 14 boolean props into a composition-based API\\\\\\\",\\\\\\\"Build a headless table primitive that exposes state and behavior without imposing markup\\\\\\\"]\",\"anti_examples\":\"[\\\\\\\"Choose the border radius value for cards\\\\\\\",\\\\\\\"Decide where the OrderDetailPage component lives in the folder structure\\\\\\\",\\\\\\\"Pick the brand font for headings\\\\\\\"]\",\"relations\":\"{\\\\\\\"related\\\\\\\":[\\\\\\\"design-system-architecture\\\\\\\",\\\\\\\"frontend-architecture\\\\\\\",\\\\\\\"interaction-patterns\\\\\\\",\\\\\\\"a11y\\\\\\\"],\\\\\\\"boundary\\\\\\\":[{\\\\\\\"skill\\\\\\\":\\\\\\\"frontend-architecture\\\\\\\",\\\\\\\"reason\\\\\\\":\\\\\\\"frontend-architecture covers application-level organization; this skill covers the internal API of a reusable module that the application composes.\\\\\\\"},{\\\\\\\"skill\\\\\\\":\\\\\\\"a11y\\\\\\\",\\\\\\\"reason\\\\\\\":\\\\\\\"Composition choices affect accessibility (focus management, ARIA wiring); when the question is whether a pattern meets WCAG requirements, hand off to a11y.\\\\\\\"}]}\",\"skill_graph_source_repo\":\"https://github.com/jacob-balslev/skill-graph\",\"skill_graph_protocol\":\"Skill Metadata Protocol v5\",\"skill_graph_project\":\"Skill Graph\",\"skill_graph_canonical_skill\":\"skills/design-module-composition/SKILL.md\"}"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v4
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/design-module-composition/SKILL.md
---

# Design Module Composition

## Coverage
A composable component module exposes its parts to consumers rather than hiding them behind a configuration prop. The four mainstream patterns are compound components (a parent and a named set of children share context: <Tabs>, <Tabs.List>, <Tabs.Trigger>, <Tabs.Panel>), slot/children APIs (named slots accept arbitrary content: <Card header={...} footer={...} />), render props or function-as-children (the parent provides state, the consumer provides markup: <Tooltip>{({open}) => ...}</Tooltip>), and headless primitives (state and behavior are exposed as hooks or unstyled components — Radix, Headless UI, TanStack Table — leaving all markup and styling to the consumer).

The "asChild" or polymorphic pattern (Radix's term; also called "as" prop, "render" prop in some libraries) lets a consumer change the rendered element while inheriting all behavior: <Dialog.Trigger asChild><Button>Open</Button></Dialog.Trigger>. The pattern collapses two-level wrappers and avoids the "button inside button" accessibility error, but requires the parent to clone or render-prop its single child carefully.

Choosing between configuration and composition is a trade-off between control surface and expressiveness. A prop-heavy API (<Card title={} subtitle={} action={} variant={} />) is fast to consume for the common case and friction-heavy for variants the original author didn't anticipate. A composition API (<Card><Card.Header>...</Card.Header></Card>) reverses this: more typing for the common case, no friction for variants. Mature design systems often offer both: a high-level "summary" component that consumes the low-level composable primitives.

State sharing between compound-component pieces uses React context (or framework-equivalent). The context contract — what the parent provides, what the children expect — is the real API of the module, and changing it is a breaking change even when the prop signatures stay the same. Headless primitives push this further: state and behavior leave the module entirely, and the visual layer is the consumer's responsibility.

## Philosophy
Composition externalizes variation. Every boolean prop on a component is a decision the module author made on behalf of every future consumer; every slot is a decision deferred. The discipline is to ask whether the variant being added is part of the module's identity (it should be a prop) or part of how a specific consumer uses the module (it should be a slot).

Headless primitives separate three concerns that are routinely conflated: state (open/closed, selected, expanded), behavior (focus trapping, keyboard navigation, ARIA attribute wiring), and presentation (markup and styles). Conflation is convenient until the design system needs a second visual treatment of the same behavior; separation makes that addition trivial.

## Verification
- The component's primary variations are achievable by composing children rather than passing boolean props; a count of boolean props is in single digits.
- Compound-component children render outside the parent only with an explicit error (they require the parent's context).
- Slot props accept ReactNode (or framework equivalent) rather than typed sub-shapes; consumers can pass any valid element.
- Accessibility wiring (aria-controls, aria-expanded, focus return on dialog close) is the module's responsibility, not the consumer's, even when markup is delegated via asChild or headless patterns.
- Documentation shows the compositional pattern as the primary example, with prop-API shortcuts noted as conveniences.
- Replacing the rendered element type via asChild or polymorphic-as preserves all behavior and ARIA attributes.
- The module has at least one example of being composed into a non-obvious shape (a tabs control becoming a vertical sidebar) without modification.

## Do NOT Use When
- The component is single-use within one feature and will never be reused. Reach for the simpler prop-driven shape.
- The question is which features live in which folders or which application owns which screen. Use frontend-architecture.
- The decision is purely visual — color, spacing, type. Use visual-design-foundations or layout-composition.
- The work is configuring or publishing the shared library that hosts these modules. Use design-system-architecture.
- The concern is meeting specific accessibility criteria for a control pattern. Use a11y for the criteria; this skill for the API shape.
