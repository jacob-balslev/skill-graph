---
name: component-architecture
description: "Use when structuring a component library or design system for reuse across products, themes, and teams: layering of primitives, composites, and product-specific assemblies; component API design (props, polymorphism, compound components, render props vs hooks vs slots); the open-closed principle for component evolution; the headless/styled split for theming; controlled vs uncontrolled state contracts; ref forwarding and imperative escape hatches; composition over configuration trade-offs; and the cross-product reuse problem. Do NOT use for within-product module composition (use design-module-composition), design system meta-architecture (use design-system-architecture), the visual language itself (use visual-design-foundations or tokens), tactical hooks (library docs), or state-management decisions that are not component-API-shaped (use state-management)."
license: MIT
allowed-tools: Read Grep
metadata:
  schema_version: "8"
  version: "1.0.0"
  type: capability
  operation: know
  category: design
  subject: design-craft
  domain: design/component-systems
  scope: workspace
  owner: skill-graph-maintainer
  freshness: "2026-05-16"
  drift_check: "{\"last_verified\":\"2026-05-16\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  comprehension_state: present
  stability: experimental
  keywords: "[\"component library design\",\"atomic design layering\",\"component primitives\",\"component composites\",\"compound components\",\"polymorphic component\",\"asChild prop\",\"headless component\",\"styled component\",\"controlled component\"]"
  triggers: "[\"structure components for reuse\",\"how do I design this component API\",\"controlled or uncontrolled\",\"should I use props or composition\",\"compound component pattern\",\"headless vs styled\",\"primitive vs composite\"]"
  examples: "[\"design the API surface for a Dialog component that must work in multiple products with different visual languages\",\"decide whether a Form component should be controlled, uncontrolled, or both\",\"structure a component library so primitives can be themed without rewriting the composites\",\"refactor a 30-prop component into a compound API that surfaces the right primitives\"]"
  anti_examples: "[\"decide where the form's state lives across page navigations (use state-management)\",\"pick the design tokens for color and spacing (use visual-design-foundations)\",\"decide how a single product's modules are wired together internally (use design-module-composition)\",\"implement a specific React hook for form management (library docs / tactical decision)\",\"decide where state lives across the app — server, client UI, URL, or persistent (use state-management)\",\"design the application-level folder structure, routing, build, and deployment (use frontend-architecture)\"]"
  relations: "{\"related\":[\"design-system-architecture\",\"design-module-composition\",\"visual-design-foundations\",\"state-management\",\"frontend-architecture\",\"typography-system\",\"color-system-design\"],\"boundary\":[{\"skill\":\"design-module-composition\",\"reason\":\"design-module-composition owns how a SINGLE PRODUCT's modules compose internally — layout, slots, named regions, within-product composition patterns. This skill owns the layer above: how components are STRUCTURED to be reusable across products, with API surfaces that survive multiple visual languages and interaction contracts. They compose: this skill says how to build the components; design-module-composition says how a product wires them up.\"},{\"skill\":\"design-system-architecture\",\"reason\":\"design-system-architecture owns the META structure of a design system: tokens, foundations, governance, documentation, distribution. This skill owns one stratum inside that: how components themselves are structured. A design system is a system of components plus tokens plus foundations plus distribution; this skill is the component stratum.\"},{\"skill\":\"visual-design-foundations\",\"reason\":\"visual-design-foundations owns the design language itself: color theory, typography, spacing, grid, motion. This skill owns the structural mechanism by which that language is delivered to product code — components that bind to tokens and surface the language in reusable form.\"}],\"verify_with\":[\"design-system-architecture\",\"design-module-composition\"]}"
  mental_model: "|"
  purpose: "|"
  boundary: "|"
  analogy: "Component architecture is to a UI library what API design is to a backend service — the public contract is the only thing consumers see; every consumer depends on shape, behavior, and naming for things that may seem internal to the author; once a version ships, every prop and slot becomes a thing future versions must continue to support, just as every endpoint and field of a public API does. The headless/styled split is to component libraries what the data-plane/control-plane split is to distributed systems: separating the part that changes slowly (behavior, contracts) from the part that changes fast (visual treatment, theming)."
  misconception: "|"
  concept: "{\"definition\":\"Component architecture is the architectural discipline of structuring a library of UI components so that they can be reused across products, themes, and teams without each reuse requiring a rewrite. The discipline answers four interlocking questions: (1) at what LAYER does a given concern belong — primitive, composite, product-specific assembly; (2) what is the API SURFACE — which props, slots, refs, callbacks, render functions, and which are open for extension vs closed for modification; (3) what STATE CONTRACT does the component expose — controlled, uncontrolled, hybrid; (4) what THEMING and styling mechanism allows the component's behavior to remain stable while its visual language changes. The discipline is distinct from the visual design language itself (which colors, which type scale) and from within-product wiring (which screens compose which modules) — it is the architectural stratum that makes both possible by producing components whose API outlives any single product instance and any single visual treatment.\",\"mental_model\":\"|\",\"purpose\":\"|\",\"boundary\":\"|\",\"taxonomy\":\"|\",\"analogy\":\"|\",\"misconception\":\"|\"}"
  structural_verdict: UNVERIFIED
  truth_verdict: UNVERIFIED
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v7
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/design/component-architecture/SKILL.md
---

# Component Architecture

## Coverage

The architectural discipline of structuring a library of UI components so they can be reused across products, themes, and teams. Covers the layering of primitives, composites, and product-specific assemblies; the composition-over-configuration principle and its trade-offs; the headless/styled split as the mechanism for behavior reuse across visual languages; controlled / uncontrolled / hybrid state contracts; the open-closed principle adapted to component evolution; polymorphism via `as` and `asChild`; extension mechanisms (props, children, slots, render props, compound components, ref forwarding); and the API-as-contract framing that makes component libraries survive multi-product, multi-year reuse.

## Philosophy

The component's API is the contract between its author and every future consumer. Every prop, every slot, every event is a public surface that becomes a thing future versions must continue to support — or break consumers. Component architecture is the discipline of designing those contracts with the knowledge that you cannot predict every consumer and that the contract will be inhabited by integrations you didn't anticipate.

The discipline is upstream of any specific library, framework, or visual language. Layering, composition, the headless/styled split, the controlled/uncontrolled distinction, and the open-closed principle are properties of how components are *structured* — independent of which framework implements them and which design tokens style them. A team that internalizes these properties produces libraries that survive a decade of framework changes, brand refreshes, and product evolution. A team that does not produces libraries that work for the first product and require a rewrite for the second.

For agents working in component-heavy codebases, the discipline is the framework that lets the agent reason locally. Pick up a component, classify it by layer (primitive / composite / product-specific), inspect its API surface (props, slots, events), identify its state contract (controlled / uncontrolled / hybrid), and use it correctly without internalizing every idiosyncrasy. Without the framework, the agent pattern-matches against whatever the codebase already does — which means proliferating the codebase's existing architectural mistakes.

## The Layering Principle

| Layer | What it is | Change rate | Reuse scope | Examples |
|---|---|---|---|---|
| **Primitive** | Smallest reusable unit; behavior only or behavior + minimal styling | Rare | All products | Button, Input, Checkbox, Popover, Dialog Root |
| **Composite** | Combines primitives into recurring patterns | Moderate | Most products | FormField (label + input + error), Card, DataTable |
| **Product-specific assembly** | Combines composites into unique product surfaces | Frequent | One product | CheckoutForm, SettingsPanel, DashboardWidget |

Dependencies flow downward (composites depend on primitives; assemblies depend on composites). Reversing the flow couples primitives to specific use cases and destroys reuse.

## Composition Over Configuration

| Pattern | When to use | What it costs | What it scales |
|---|---|---|---|
| **Configuration (props)** | Small closed enum of variations; combinations are independent | Each new prop is more API surface; combinations multiply | Acceptable up to ~5-7 independent props; gets dangerous beyond |
| **Composition (children, slots, sub-components)** | Open-ended variation; structure matters | More code at each consumer; more concepts | Scales indefinitely; new variations are additive, not multiplicative |

Refactor sign: a configured component with >10 props that are mostly independent is a candidate for the compound-component refactor.

## The Headless / Styled Split

| Layer | Owns | Examples |
|---|---|---|
| **Headless** | Keyboard navigation, focus management, ARIA, internal state, event emission | Radix Primitives, Headless UI, Ariakit, React Aria, Tanstack Table |
| **Styled** | Visual treatment, layout, spacing, typography binding | shadcn/ui (Radix + Tailwind), Mantine, MUI theme, your design system |

The split is the architectural mechanism that solves cross-product reuse when the same interaction patterns must look different in different products. Behavior evolves independently of styling; styling evolves independently of behavior.

## State Contract Patterns

| Contract | Who owns value | API shape | When to use |
|---|---|---|---|
| **Controlled** | Consumer | `value` + `onChange` | Value participates in larger state (form, store, URL) |
| **Uncontrolled** | Component (internal) | `defaultValue` + `onChange` (event-shaped) | Value is the component's business alone |
| **Hybrid** | Both supported | Both `value` (controlled path) and `defaultValue` (uncontrolled path) | Default for any new component; serves both consumer kinds |
| **Imperative-only** | Refs and methods | `ref.current.play()`, etc. | Rare; for cases where declarative APIs are awkward (video, focus) |

Default to hybrid. Consumers choose by passing `value` or `defaultValue`.

## Extension Mechanisms

| Mechanism | What it opens | When to use |
|---|---|---|
| **Props (config)** | Closed set of variations | Variations are small, closed, combinatorially independent |
| **Children / slots** | Structure | Consumer composes inner content |
| **Compound components** (`Dialog.Root`, `Dialog.Trigger`, `Dialog.Content`) | Structure + implicit shared state via context | Multi-part components with structural variation |
| **Render props / render functions** | Rendering | Consumer overrides how something renders, with access to internal state |
| **Forward refs / imperative handles** | Imperative access | Escape hatch for cases declarative APIs cannot reach (focus, scroll, play) |
| **Polymorphism (`as` / `asChild`)** | Element type | Consumer chooses the semantic tag rendered |

## The Polymorphism Patterns

| Pattern | Syntax | Pros | Cons |
|---|---|---|---|
| **`as` prop** | `<Button as="a" href="...">` | React-idiomatic; familiar | Hard to type correctly; doesn't compose well across libraries |
| **`asChild`** (Radix) | `<Button asChild><a href="...">...</a></Button>` | Cleaner accessibility; consumer sees the semantic element | Unfamiliar at first encounter |
| **Slot-based** (Vue, Svelte) | Framework slot mechanism | Native framework support | Limited to that framework |

For cross-library compatibility in React, `asChild` (and the underlying Radix Slot pattern) has become the modern default.

## Verification

After applying this skill, verify:
- [ ] Each component has been classified by layer (primitive / composite / product-specific); the dependency direction is downward only.
- [ ] Configuration-explosion candidates (components with many independent boolean/enum props) have been considered for composition refactors.
- [ ] Headless behavior is separated from styled presentation when the component is intended for cross-product or cross-theme reuse.
- [ ] State contracts are deliberate (controlled / uncontrolled / hybrid / imperative); the default is hybrid for inputs.
- [ ] Polymorphic components use a deliberate pattern (`as` or `asChild`) — not an accidental any-tag escape hatch.
- [ ] Compound components share state via context and document the requirement that sub-components live within the parent.
- [ ] Accessibility (keyboard, focus, ARIA, screen-reader announcement) is built into the primitive layer, not retrofitted.
- [ ] The API surface is documented (every prop, every slot, every event, every imperative method) and stable; breaking changes follow a deprecation cycle.
- [ ] Tokens (color, spacing, type) are the binding mechanism for visual properties, not hardcoded values; the styled layer binds to tokens, not literals.
- [ ] The component library has been tested with multiple actual consumers (multiple products, multiple themes) to verify reusability claims.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Wiring a specific product's screens from components | `design-module-composition` | design-module-composition owns within-product assembly; this skill owns the components being assembled |
| Designing the design system's overall structure (tokens, foundations, governance, distribution) | `design-system-architecture` | design-system-architecture owns meta-structure; this skill owns the component stratum |
| Picking the design language (color, type, spacing decisions) | `visual-design-foundations` | visual-design-foundations owns the language; this skill owns the structural mechanism delivering it |
| Deciding where component state lives across the app | `state-management` | state-management owns location and ownership; this skill owns the component's state-contract API surface |
| Picking React hook patterns for internal component state | Library docs (React, Vue, etc.) | Tactical implementation; below this skill |
| Designing the app's folder structure | `folder-structure` or `frontend-architecture` | This skill cares about components, not where they live on disk |
| Component-level accessibility audit | `a11y` | a11y owns the discipline of checking accessibility; this skill bakes the property into the architecture |
| Form-specific component architecture (validation, submit) | `form-ux-architecture` | form-ux-architecture owns the form-specific patterns; this skill is the broader framing |

## Key Sources

- Frost, B. (2016). *Atomic Design*. Brad Frost Web. The canonical layering framework: atoms / molecules / organisms / templates / pages. Establishes the discipline of layering as a property of well-structured component libraries.
- Meyer, B. (1988). *Object-Oriented Software Construction*. Prentice Hall. The original articulation of the open-closed principle ("software entities should be open for extension, but closed for modification") — adapted in this skill to component evolution.
- Radix UI. [Radix Primitives documentation](https://www.radix-ui.com/primitives/docs/overview/introduction). The modern reference implementation of the headless component pattern, the compound-component pattern, and the `asChild` polymorphism pattern. Establishes the contract that has become widely adopted across the React ecosystem.
- Adobe. [React Aria documentation](https://react-spectrum.adobe.com/react-aria/). The reference implementation of accessibility-first headless components. Demonstrates the architectural commitment to keyboard, focus, and screen-reader support as primitive-layer concerns.
- Erikson, M. (2020). ["Compound Components"](https://kentcdodds.com/blog/compound-components-with-react-hooks) [Kent C. Dodds]. Canonical modern articulation of the compound-component pattern with hooks-based React.
- shadcn. [shadcn/ui documentation](https://ui.shadcn.com/). The 'registry' distribution model (copy into the consumer's repo) and the canonical example of the headless-primitive + styled-wrapper layered architecture.
- Vue Team. [Vue.js Slots documentation](https://vuejs.org/guide/components/slots.html). The reference framework-native slot mechanism that predates and inspired React's compound-component patterns; demonstrates that the architectural principles apply across frameworks.
- Liskov, B. (1987). "Data Abstraction and Hierarchy." *Proceedings of OOPSLA '87 Addendum*. The Liskov Substitution Principle — adapted in this skill as the constraint that polymorphic substitutions must preserve invariants.
- Garlan, D., & Shaw, M. (1993). "An Introduction to Software Architecture." *Advances in Software Engineering and Knowledge Engineering*, Vol. 1. The foundational treatment of layered architectures as a software-architecture pattern; provides the dependency-direction reasoning this skill adapts to components.
- Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1994). *Design Patterns: Elements of Reusable Object-Oriented Software*. Addison-Wesley. The Composite, Decorator, and Strategy patterns underlie much of the composition-vs-configuration framing; the foundational reference for reuse-via-composition.
