---
name: component-architecture
description: "Use when structuring a component library or design system for reuse across products, themes, and teams: layering of primitives, composites, and product-specific assemblies; component API design (props, polymorphism, compound components, render props vs hooks vs slots); the open-closed principle for component evolution; the headless/styled split for theming; controlled vs uncontrolled state contracts; ref exposure and imperative escape hatches; composition over configuration trade-offs; and the cross-product reuse problem. Do NOT use for within-product module composition (use design-module-composition), design system meta-architecture (use design-system-architecture), the visual language itself (use visual-design-foundations or tokens), tactical hooks (library docs), or state-management decisions that are not component-API-shaped (use state-management). Do NOT use for design the typography system: type scale, font pairing, text sizes, and reading rhythm."
license: MIT
allowed-tools: Read Grep
metadata:
  subject: design
  scope: "Structuring a component library or design system for reuse across products, themes, and teams — layering of primitives/composites/product-specific assemblies, component API design (props, polymorphism, compound components, render props vs hooks vs slots), the open-closed principle for component evolution, the headless/styled split for theming, controlled vs uncontrolled state contracts, ref forwarding and imperative escape hatches, and composition-over-configuration trade-offs. Portable across any component library; principle-grounded, not repo-bound. Excludes within-product module composition (design-module-composition), design-system meta-architecture (design-system-architecture), the visual language itself (visual-design-foundations, tokens), tactical hooks (library docs), and non-component-API state-management decisions (state-management)."
  taxonomy_domain: design/component-systems
  stability: experimental
  keywords: "[\"component architecture\",\"component library design\",\"component API surface\",\"component primitives\",\"component composites\",\"compound components\",\"asChild prop\",\"headless component\",\"controlled component\",\"design system components\"]"
  triggers: "[\"component architecture\",\"structure components for reuse\",\"design this component API\",\"controlled or uncontrolled component\",\"props or composition\",\"compound component pattern\",\"headless vs styled\",\"primitive vs composite\"]"
  examples: "[\"design the component architecture and API surface for a Dialog primitive that must work across products and visual languages\",\"decide the controlled, uncontrolled, or hybrid state contract for a reusable FormField component\",\"layer a component library into primitives, composites, and product assemblies so theming can change without rewriting behavior\",\"refactor a 30-prop component into compound components, slots, and smaller primitives\"]"
  anti_examples: "[\"design the typography system: type scale, font pairing, text sizes, and reading rhythm\",\"define the form validation, error messaging, submit behavior, and field grouping for checkout\"]"
  relations: "{\"related\":[\"design-system-architecture\",\"design-module-composition\",\"visual-design-foundations\",\"state-management\",\"frontend-architecture\",\"typography-system\",\"color-system-design\",\"form-ux-architecture\",\"a11y\"],\"boundary\":[{\"skill\":\"design-module-composition\",\"reason\":\"design-module-composition owns how a single product's modules compose internally; component-architecture owns reusable component APIs and layers before product assembly.\"},{\"skill\":\"color-system-design\",\"reason\":\"color-system-design owns palette, token, contrast, and semantic color decisions; component-architecture owns the structural API that consumes tokens without hardcoding the visual language.\"},{\"skill\":\"typography-system\",\"reason\":\"typography-system owns type scale, font pairing, rhythm, and text hierarchy; component-architecture owns the reusable component API that consumes typography tokens and patterns.\"},{\"skill\":\"form-ux-architecture\",\"reason\":\"form-ux-architecture owns form validation, submission, grouping, and error experience; component-architecture owns reusable component state contracts and API surfaces such as FormField, Input, Select, and compound form primitives.\"}],\"verify_with\":[\"design-system-architecture\",\"design-module-composition\",\"a11y\"]}"
  grounding: "{\"subject_matter\":\"Portable component-library architecture for reusable UI systems\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://www.radix-ui.com/primitives/docs/overview/introduction\",\"https://www.radix-ui.com/primitives/docs/guides/composition\",\"https://react-aria.adobe.com/getting-started\",\"https://ui.shadcn.com/docs\",\"https://vuejs.org/guide/components/slots.html\",\"https://react.dev/reference/react/forwardRef\",\"../skills/skills/design/component-architecture/references/component-architecture-2026-06-07.md\"],\"failure_modes\":[\"component_library_treated_as_flat_pile_of_widgets\",\"primitive_layer_depends_on_product_specific_assembly\",\"visual_language_hardcoded_into_reusable_behavior\",\"state_contract_left_implicit\",\"composition_replaced_by_boolean_prop_explosion\",\"ref_guidance_stale_for_react_19\"],\"evidence_priority\":\"equal\"}"
  mental_model: "|"
  purpose: "|"
  analogy: "Component architecture is to a UI library what API design is to a backend service — the public contract is the only thing consumers see; every consumer depends on shape, behavior, and naming for things that may seem internal to the author; once a version ships, every prop and slot becomes a thing future versions must continue to support, just as every endpoint and field of a public API does. The headless/styled split is to component libraries what the data-plane/control-plane split is to distributed systems: separating the part that changes slowly (behavior, contracts) from the part that changes fast (visual treatment, theming)."
  misconception: "|"
  public: "true"
  concept_boundary: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/design/component-architecture/SKILL.md
  skill_graph_export_description_projection: anti_examples+boundary
  skill_graph_export_description_projection_truncated: "true"
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
| **Ref exposure / imperative handles** | Imperative access | Escape hatch for cases declarative APIs cannot reach (focus, scroll, play). In React 19, accept `ref` as a prop; use `forwardRef` for React 18 compatibility or libraries that still require it. |
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
- Radix UI. [Radix Primitives documentation](https://www.radix-ui.com/primitives/docs/overview/introduction) and [Composition guide](https://www.radix-ui.com/primitives/docs/guides/composition). Current reference for accessible unstyled primitives, `asChild`, prop spreading, ref compatibility, and primitive composition.
- Adobe. [React Aria getting started](https://react-aria.adobe.com/getting-started). Current reference for accessibility-first unstyled component parts, styling hooks, state data attributes, and building reusable wrappers.
- React. [`forwardRef` reference](https://react.dev/reference/react/forwardRef). Current React 19 ref guidance: `forwardRef` remains compatibility knowledge, but new React 19 components can receive `ref` as a prop.
- Dodds, K. C. (2020). ["Compound Components"](https://kentcdodds.com/blog/compound-components-with-react-hooks). Canonical modern articulation of the compound-component pattern with hooks-based React.
- shadcn. [shadcn/ui documentation](https://ui.shadcn.com/docs). Current reference for the open-code distribution model, component ownership, composable interfaces, and registry-based component delivery.
- Vue Team. [Vue.js Slots documentation](https://vuejs.org/guide/components/slots.html). The reference framework-native slot mechanism that predates and inspired React's compound-component patterns; demonstrates that the architectural principles apply across frameworks.
- Liskov, B. (1987). "Data Abstraction and Hierarchy." *Proceedings of OOPSLA '87 Addendum*. The Liskov Substitution Principle — adapted in this skill as the constraint that polymorphic substitutions must preserve invariants.
- Garlan, D., & Shaw, M. (1993). "An Introduction to Software Architecture." *Advances in Software Engineering and Knowledge Engineering*, Vol. 1. The foundational treatment of layered architectures as a software-architecture pattern; provides the dependency-direction reasoning this skill adapts to components.
- Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1994). *Design Patterns: Elements of Reusable Object-Oriented Software*. Addison-Wesley. The Composite, Decorator, and Strategy patterns underlie much of the composition-vs-configuration framing; the foundational reference for reuse-via-composition.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `design`
- Domain: `design/component-systems`
- Scope: Structuring a component library or design system for reuse across products, themes, and teams — layering of primitives/composites/product-specific assemblies, component API design (props, polymorphism, compound components, render props vs hooks vs slots), the open-closed principle for component evolution, the headless/styled split for theming, controlled vs uncontrolled state contracts, ref forwarding and imperative escape hatches, and composition-over-configuration trade-offs. Portable across any component library; principle-grounded, not repo-bound. Excludes within-product module composition (design-module-composition), design-system meta-architecture (design-system-architecture), the visual language itself (visual-design-foundations, tokens), tactical hooks (library docs), and non-component-API state-management decisions (state-management).

**When to use**
- design the component architecture and API surface for a Dialog primitive that must work across products and visual languages
- decide the controlled, uncontrolled, or hybrid state contract for a reusable FormField component
- layer a component library into primitives, composites, and product assemblies so theming can change without rewriting behavior
- refactor a 30-prop component into compound components, slots, and smaller primitives
- Triggers: `component architecture`, `structure components for reuse`, `design this component API`, `controlled or uncontrolled component`, `props or composition`, `compound component pattern`, `headless vs styled`, `primitive vs composite`

**Not for**
- design the typography system: type scale, font pairing, text sizes, and reading rhythm
- define the form validation, error messaging, submit behavior, and field grouping for checkout
- Owned by `design-module-composition`: how a single product's modules compose internally
- Owned by `color-system-design`: palette, token, contrast, and semantic color decisions
- Owned by `typography-system`: type scale, font pairing, rhythm, and text hierarchy
- Owned by `form-ux-architecture`: form validation, submission, grouping, and error experience

**Related skills**
- Verify with: `design-system-architecture`, `design-module-composition`, `a11y`
- Related: `design-system-architecture`, `design-module-composition`, `visual-design-foundations`, `state-management`, `frontend-architecture`, `typography-system`, `color-system-design`, `form-ux-architecture`, `a11y`

**Concept**
- Mental model: |
- Purpose: |
- Analogy: Component architecture is to a UI library what API design is to a backend service — the public contract is the only thing consumers see; every consumer depends on shape, behavior, and naming for things that may seem internal to the author; once a version ships, every prop and slot becomes a thing future versions must continue to support, just as every endpoint and field of a public API does. The headless/styled split is to component libraries what the data-plane/control-plane split is to distributed systems: separating the part that changes slowly (behavior, contracts) from the part that changes fast (visual treatment, theming).
- Common misconception: |

**Grounding**
- Mode: `universal`
- Truth sources: `https://www.radix-ui.com/primitives/docs/overview/introduction`, `https://www.radix-ui.com/primitives/docs/guides/composition`, `https://react-aria.adobe.com/getting-started`, `https://ui.shadcn.com/docs`, `https://vuejs.org/guide/components/slots.html`, `https://react.dev/reference/react/forwardRef`, `../skills/skills/design/component-architecture/references/component-architecture-2026-06-07.md`

**Keywords**
- `component architecture`, `component library design`, `component API surface`, `component primitives`, `component composites`, `compound components`, `asChild prop`, `headless component`, `controlled component`, `design system components`

<!-- skill-graph-context:end -->
