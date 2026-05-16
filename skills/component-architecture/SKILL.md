---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: component-architecture
description: "Use when structuring a component library or design system for reuse across products, multi-app environments, or scaled teams: the layering of primitives, composites, and product-specific assemblies; component API design (props, polymorphism, compound components, render props vs hooks vs slots); the open-closed principle for component evolution; the headless / styled split and how it enables theming; controlled vs uncontrolled patterns; ref forwarding and imperative escape hatches; the trade-offs between configuration and composition; and the cross-product reuse problem that emerges when one component must serve multiple visual languages or interaction contracts. Do NOT use for within-product module composition that does not span product boundaries (use design-module-composition), the design-system meta-architecture above components (use design-system-architecture), the visual design language itself (use visual-design-foundations or design tokens), tactical React patterns at the hook level (library docs), or state-management decisions that are not component-API-shaped (use state-management)."
version: 1.0.0
type: capability
category: design
domain: design/component-systems
scope: reference
owner: skill-graph-maintainer
freshness: "2026-05-16"
drift_check:
  last_verified: "2026-05-16"
eval_artifacts: planned
eval_state: unverified
routing_eval: absent
comprehension_state: present
stability: experimental
license: MIT
allowed-tools: Read Grep
keywords:
  - component library design
  - atomic design layering
  - component primitives
  - component composites
  - compound components
  - polymorphic component
  - asChild prop
  - headless component
  - styled component
  - controlled component
  - uncontrolled component
  - ref forwarding
  - render props
  - component slots
  - compose components
  - component prop API
  - component reuse across products
triggers:
  - "structure components for reuse"
  - "how do I design this component API"
  - "controlled or uncontrolled"
  - "should I use props or composition"
  - "compound component pattern"
  - "headless vs styled"
  - "primitive vs composite"
examples:
  - "design the API surface for a Dialog component that must work in multiple products with different visual languages"
  - "decide whether a Form component should be controlled, uncontrolled, or both"
  - "structure a component library so primitives can be themed without rewriting the composites"
  - "refactor a 30-prop component into a compound API that surfaces the right primitives"
anti_examples:
  - "decide where the form's state lives across page navigations (use state-management)"
  - "pick the design tokens for color and spacing (use visual-design-foundations)"
  - "decide how a single product's modules are wired together internally (use design-module-composition)"
  - "implement a specific React hook for form management (library docs / tactical decision)"
relations:
  related:
    - design-system-architecture
    - design-module-composition
    - visual-design-foundations
    - state-management
    - frontend-architecture
    - typography-system
    - color-system-design
  boundary:
    - skill: design-module-composition
      reason: "design-module-composition owns how a SINGLE PRODUCT's modules compose internally — layout, slots, named regions, within-product composition patterns. This skill owns the layer above: how components are STRUCTURED to be reusable across products, with API surfaces that survive multiple visual languages and interaction contracts. They compose: this skill says how to build the components; design-module-composition says how a product wires them up."
    - skill: design-system-architecture
      reason: "design-system-architecture owns the META structure of a design system: tokens, foundations, governance, documentation, distribution. This skill owns one stratum inside that: how components themselves are structured. A design system is a system of components plus tokens plus foundations plus distribution; this skill is the component stratum."
    - skill: visual-design-foundations
      reason: "visual-design-foundations owns the design language itself: color theory, typography, spacing, grid, motion. This skill owns the structural mechanism by which that language is delivered to product code — components that bind to tokens and surface the language in reusable form."
    - skill: state-management
      reason: "state-management owns the location and ownership of state independent of how it's exposed to components. This skill owns the API surface for state in components: controlled vs uncontrolled, default values, change handlers, ref forwarding to imperative state. The two compose: state-management decides where state lives; this skill decides how a component exposes its state contract."
    - skill: frontend-architecture
      reason: "frontend-architecture owns the application-level architecture (folder structure, routing, build, deployment). This skill owns the component-level architecture within. A well-architected frontend uses well-architected components, but they answer different questions."
  verify_with:
    - design-system-architecture
    - design-module-composition
concept:
  definition: "Component architecture is the architectural discipline of structuring a library of UI components so that they can be reused across products, themes, and teams without each reuse requiring a rewrite. The discipline answers four interlocking questions: (1) at what LAYER does a given concern belong — primitive, composite, product-specific assembly; (2) what is the API SURFACE — which props, slots, refs, callbacks, render functions, and which are open for extension vs closed for modification; (3) what STATE CONTRACT does the component expose — controlled, uncontrolled, hybrid; (4) what THEMING and styling mechanism allows the component's behavior to remain stable while its visual language changes. The discipline is distinct from the visual design language itself (which colors, which type scale) and from within-product wiring (which screens compose which modules) — it is the architectural stratum that makes both possible by producing components whose API outlives any single product instance and any single visual treatment."
  mental_model: |
    Six primitives structure component-architecture reasoning:

    1. **The layering principle**. Components stratify into recognizable layers, each with different change rates and different reuse scopes. *Primitives* are the smallest reusable units — a button, an input, a checkbox, a popover trigger — with no opinion about content and minimal opinion about visual context. *Composites* combine primitives into recurring patterns — a form field combining label, input, error message; a dialog combining trigger, content, close button. *Product-specific assemblies* combine composites into the unique surfaces of a specific product — a checkout form, a settings panel, a dashboard widget. Layering is descriptive of where change happens (primitives change rarely; product assemblies change weekly) and prescriptive of how dependencies flow (composites depend on primitives; assemblies depend on composites; never the reverse).

    2. **The composition-over-configuration principle**. A component with N independent variants exposed as N boolean props (or a single enum prop with N values) is *configured*; a component that accepts children, slots, or render functions and lets the consumer compose the structure is *composed*. Configuration is appropriate when the variations are small in number and combinatorially independent; composition is appropriate when the variations are open-ended or when combinations matter. A common failure mode is the configuration-explosion: a `Button` that started with `variant: 'primary' | 'secondary'` and now has 30 boolean props (`leftIcon`, `rightIcon`, `loading`, `disabled`, `compact`, `block`, `rounded`, `outlined`, `ghost`, `iconOnly`, ...) — each prop is a leaf the consumer can hit, and the combinations are mostly untested. The disciplined refactor turns the 30-prop monolith into a compound API: `<Button><Button.Icon left /><Button.Label>…</Button.Label></Button>`. Composition surfaces structure; configuration hides it.

    3. **The headless / styled split**. A *headless* component implements behavior — keyboard navigation, focus management, ARIA, state — without any visual styling. A *styled* component composes a headless component with a specific visual language. The split lets one piece of behavior (say, a combobox) serve many visual languages without behavior duplication, and lets one visual language (say, a brand's tokens) apply to many behavioral components without behavior coupling. Radix UI, Headless UI, Ariakit, and React Aria are the modern canonical implementations. The split is the architectural mechanism that solves the cross-product reuse problem when the same interaction patterns must look different in different products.

    4. **The controlled / uncontrolled state contract**. A *controlled* component exposes its state as a prop and a change handler — the consumer owns the value; the component is a view. An *uncontrolled* component owns its own state internally and exposes events when it changes — the component is autonomous; the consumer reacts. A *hybrid* component supports both: the consumer can pass a value (controlled) or an initial value (uncontrolled). Each contract serves different consumers: controlled is necessary when the value participates in a larger state model (a form's overall state, a redux store, a URL); uncontrolled is sufficient (and simpler) when the value is the component's business alone. Forcing all consumers to controlled is the recurring 'I have to manage state for every input even though I just want a text field' frustration; forcing all consumers to uncontrolled is the recurring 'I can't programmatically reset this form' bug. The discipline is the hybrid by default.

    5. **The open-closed principle for component evolution (Meyer, adapted)**. Components should be *open for extension* (consumers can add new behavior or content) and *closed for modification* (consumers cannot break the component's internal invariants). Extension mechanisms include children/slots (open structure), render functions/render props (open rendering), forward refs and imperative handles (open imperative access), and well-named events/callbacks (open behavior reaction). The discipline is to expose exactly the extension points that legitimate consumers need and to make breaking the invariants — like 'this component must always have a label for accessibility' — either impossible or loudly visible.

    6. **Polymorphism and the `as` / `asChild` patterns**. A component is *polymorphic* when its rendered element type can be controlled by the consumer — a `Button` that can render as `<button>`, `<a>`, or any other element. Two competing patterns: the `as` prop (`<Button as="a" href="…">`) which is React-idiomatic but produces complex type signatures; and the `asChild` pattern (`<Button asChild><a href="…">…</a></Button>`) popularized by Radix, where the consumer wraps the desired element and the component merges its behavior into it. Each has trade-offs: `as` is more familiar but harder to type correctly; `asChild` is cleaner for accessibility (the consumer sees exactly the semantic element they're producing) but unfamiliar at first encounter. The discipline is to support exactly the polymorphism legitimate cases require and to be deliberate about which pattern.

    The deep insight is that *the component's API is the contract between its author and every future consumer*. Every prop, every slot, every event is a public surface that, once exposed, becomes a thing future versions must continue to support — or break consumers. Component architecture is the discipline of designing that contract with the knowledge that you cannot predict every consumer and that the contract will be inhabited by integrations you didn't anticipate. The principles (layering, composition, headless/styled, controlled/uncontrolled, open-closed, polymorphism) are the framework that lets you design contracts that survive contact with reality.

    The complementary insight is that *configuration explodes and composition scales*. A configured component grows by adding props; each prop multiplies the surface area. A composed component grows by adding sub-components or slots; each addition is additive, not multiplicative. The architectures that survive a decade of feature growth — Radix, Ariakit, Mantine's headless layer, MUI's slot system — share the structural choice to favor composition over configuration even when configuration would be faster in the short term. The architectures that don't survive are typically the ones that started with a small configuration surface and grew it without ever refactoring to composition.
  purpose: |
    Component-architecture discipline exists because the recurring problems of component libraries — props that mean different things to different consumers, components that work for one product and break for the next, styling that has to be ripped out to support a new theme, forks of the same component for each variant, refactors that ship every quarter to undo the previous refactor — are all symptoms of architectural decisions made (or skipped) when the components were first designed. Pick the right layer, composition pattern, state contract, and theming mechanism, and a component library can serve many products for many years; pick the wrong ones, and every new product is partly a rewrite.

    The discipline matters with particular force in design-system work. A design system is the canonical case of multi-product, multi-team component reuse: one library serves N internal products, M external integrations, and a roadmap of variants. The architectural decisions made in the first version of any component are inherited by every product that adopts it; the cost of fixing those decisions later scales with adoption (every consumer is a migration cost). Teams that internalize component architecture early ship libraries that absorb new requirements through composition; teams that do not ship libraries that fork under each new requirement.

    For organizations that need their UI to evolve while preserving consistency, the discipline is what makes both possible. A component library that exposes its primitives as headless behavior + token-driven styling can re-theme across an entire product without changing a line of consuming code; the same library, structured as monolithic styled components, requires touching every consumer when the theme changes. Re-themability and architectural quality are not separable concerns — the second produces the first.

    For agents working in component-heavy codebases, the discipline is what lets the agent reason about an unfamiliar component without reading its full implementation. An agent that knows the layering principle can look at a component and ask: 'is this a primitive, composite, or product-specific?' 'what's its API surface — props, slots, events?' 'is its state controlled, uncontrolled, or hybrid?' These questions produce correct usage without the agent having to internalize each component's idiosyncrasies. Without the framework, the agent pattern-matches against whatever the codebase already does — which means proliferating the codebase's existing architectural mistakes.

    Finally, the discipline matters because component architecture is the architectural stratum that determines whether 'reuse' is a hopeful aspiration or a real property of the library. Many component libraries are described as 'reusable' while being effectively single-product — they encode product-specific assumptions in their primitives (a button that only knows the brand's three color tokens; a form field that only knows the product's validation library). The discipline is the difference between a library that calls itself reusable and a library that demonstrably is.
  boundary: |
    **Component architecture is not visual design.** The visual language — colors, type scale, spacing, motion, iconography — is the work of `visual-design-foundations` and the design token system. Component architecture is the structural mechanism that *delivers* that language to product code through components whose behavior is stable across visual treatments. A component-architecture decision (compound API for a dialog) is independent of a visual-design decision (which shadow tier the dialog uses). They compose: visual design produces the tokens; component architecture produces the components that bind to them.

    **Component architecture is not design-system meta-structure.** A design system is a system of tokens + components + foundations + governance + distribution. Component architecture is one stratum (the components). The other strata — token taxonomies, foundation primitives like color and type, governance models for who-can-add-what, distribution infrastructure for npm packages and registries — are the work of `design-system-architecture`. The two compose: design-system-architecture defines the system; component architecture defines the components that fit it.

    **Component architecture is not within-product module composition.** Once components exist, a product wires them up into screens — layouts, named regions, slot patterns, page templates. That wiring is the work of `design-module-composition`. Component architecture is upstream: it produces the components whose APIs make composition possible. The difference: component architecture asks 'how should this Dialog component be built so any product can use it'; design-module-composition asks 'how should THIS product's settings panel be assembled from the components we have'.

    **Component architecture is not React-specific.** The principles apply to any UI framework: Vue's slots, Svelte's slots, Angular's content projection, SolidJS's children, Web Components' slot element. The names differ; the layering, composition, headless/styled split, controlled/uncontrolled distinction, and open-closed principle all generalize. References here mention React idioms because that's the dominant ecosystem at the time of writing; the underlying ideas predate React and will outlive it.

    **Component architecture is not tactical implementation choice.** Whether to use `useState` or `useReducer` inside a component, whether to memoize, whether to use Context internally — these are implementation details inside the component's boundary. They affect the component's quality but not its architectural shape. The architectural shape is the API surface visible to the consumer; the implementation is what's inside.

    **Component architecture is not the application's overall folder structure.** Where components live in the codebase (one folder per component, atomic-design folders, feature-based folders) is the work of `frontend-architecture` and `folder-structure`. Component architecture cares about the components themselves, not where they live on disk.

    **'Reusable' is not a property a component announces; it is a property a component demonstrates.** A library that claims its components are reusable but has only ever been used in one product is unverified; its 'reusable' claim is a hypothesis. The discipline of component architecture is the discipline of testing that hypothesis by integrating into multiple actual consumers — which is the only way to discover which assumptions were product-specific (and need to be parameterized) and which were genuinely general.

    **Component architecture does not produce 'one true API'.** Different consumer needs lead to different valid APIs; a primitive that exposes too much may be more powerful but harder to use safely, while one that exposes too little may be safe but unsuitable for advanced cases. The discipline is to know what trade-off the API takes and to make the trade-off deliberately, often by exposing layered APIs (a high-level convenience + low-level escape hatches) rather than choosing one or the other.
  taxonomy: |
    By layer (Atomic Design, Brad Frost):
    - **Atoms** — primitives: button, input, icon, label. No layout opinion; minimal context.
    - **Molecules** — small composites: search-input-with-button, form-field-with-error. Two or three atoms wired together.
    - **Organisms** — larger composites: navigation, dialog, data-table. Substantial structure.
    - **Templates** — page-level structure without specific content.
    - **Pages** — instantiations of templates with specific content.

    (Note: many libraries collapse atoms/molecules/organisms into "primitives / composites / product-specific" — the labels matter less than the layering principle.)

    By state contract:
    - **Controlled** — value comes from props; change handler exposed; consumer owns state.
    - **Uncontrolled** — value owned internally; events expose changes; consumer reacts but doesn't store.
    - **Hybrid** — supports both; consumer chooses by passing `value` (controlled) or `defaultValue` (uncontrolled).
    - **Imperative-only** — state controlled via refs and imperative methods; rare; for cases where declarative APIs are awkward (e.g., video playback).

    By extension mechanism:
    - **Props-as-config** — finite enum of variations; closed surface; simple.
    - **Children / slots** — open structural extension; consumer composes inner content.
    - **Render props / render functions** — open rendering extension; consumer overrides how something renders.
    - **Compound components** — exposed sub-components (`Dialog.Trigger`, `Dialog.Content`); structural composition with implicit context.
    - **Headless behavior + styled wrapper** — orthogonal extension; behavior and presentation evolve independently.
    - **Polymorphic `as` / `asChild`** — element-type extension; consumer chooses semantic tag.
    - **Imperative handles (`forwardRef`)** — escape hatch for cases declarative APIs cannot reach.

    By coupling to a styling system:
    - **Headless** — no styles; pure behavior. Examples: Radix Primitives, Headless UI, Ariakit, React Aria, Tanstack Table (headless).
    - **Styled with tokens** — styled, but the styles bind to tokens that can be re-themed. Examples: Mantine, shadcn/ui (uses Radix + Tailwind), MUI with theme overrides.
    - **Styled with fixed brand** — styles bake in a specific brand; cross-product reuse requires a fork. Examples: many internal libraries that started as one-product libraries.

    By polymorphism support:
    - **Single-element** — always renders one specific tag.
    - **`as` prop** — accepts a tag/component name; renders that.
    - **`asChild` (Radix pattern)** — wraps the consumer's element and merges behavior into it.
    - **Slot-based polymorphism** — uses framework's slot mechanism (Vue, Svelte).

    By coupling to specific external libraries:
    - **Framework-agnostic** — vanilla JS or Web Components; works in any framework.
    - **Framework-coupled** — written for a specific framework but library-independent within it (e.g., React but no Redux assumption).
    - **Library-coupled** — depends on specific state-management, routing, or form libraries; limits adoption to teams using those.

    By accessibility maturity:
    - **WAI-ARIA-compliant primitive** — full keyboard, screen-reader, focus-management support; matches an authoring practice.
    - **Partially accessible** — implements some patterns but misses edge cases (focus traps in modals, announcement of state changes).
    - **Inaccessible** — works visually; fails for keyboard or assistive-technology users.

    By distribution model:
    - **Library / package** — installed via npm; semver-managed; updates centralized.
    - **Registry / copy-paste** (shadcn pattern) — copied into the consumer's repo; lives in their code; updates are explicit pulls.
    - **Federation** — components served from a remote; runtime composition.

    By API stability commitment:
    - **Internal** — no stability promise; can break consumers freely.
    - **Public unstable** — exposed but versioned with explicit breaking-change policy.
    - **Public stable** — semver-respected; deprecation cycles before removal; the contract is part of the product.
  analogy: |
    A LEGO system, designed and produced as a multi-decade product line.

    Several insights follow, all of them load-bearing:

    **Bricks at the bottom; sets at the top.** A LEGO system has standardized bricks — 2×4, 1×6, the round one — at the bottom. On top are sets: a fire station, a spaceship, a castle. The bricks are general-purpose primitives; the sets are product-specific assemblies. The relationship is unidirectional: sets are built from bricks; bricks know nothing about sets. This is the layering principle. A LEGO line where the bricks were specialized for each set (the 'fire station brick' that only fits a fire station) would not survive a decade — the specialization couples bricks to use cases, and use cases evolve faster than bricks should.

    **The studs are the API.** Every LEGO brick has the same stud-and-socket pattern on every face — a 50-year-old contract that hasn't changed because changing it would break every consumer (and every LEGO ever made). The studs are the component's API; their consistency is the architectural commitment that makes new bricks composable with old ones. New brick types are introduced (the curved roof tile, the windshield) but they all conform to the stud-and-socket protocol. This is the open-closed principle in physical form: the protocol is closed for modification; new pieces are open for extension.

    **Some bricks are 'headless,' some are 'styled.'** A plain 2×4 brick is a primitive: it has no opinion about whether it's a wall, a roof, or a base. A specialized piece — the printed police-badge tile, the firefighter minifig torso — is styled: it carries a specific visual identity that commits it to a particular set's aesthetic. The system needs both — the headless bricks for general-purpose use, the styled bricks for set-specific identity. A library composed only of styled bricks is a single-product library; a library with both layers serves many products and many visual languages.

    **The same brick can play many roles.** A 2×4 brick can be a wall, a step, a roof tile, a structural support, or the cabin of a spaceship. The brick doesn't dictate its role; the context of the assembly does. This is composition over configuration: the brick exposes its structural contract (the studs) and lets the assembly determine its meaning. A 2×4 brick with a 'role' prop ('wall' | 'step' | 'roof' | …) would be a worse design — it would constrain consumers who saw new roles that didn't fit the enum.

    **Some sets contain custom one-off bricks.** Modern LEGO sets sometimes include set-specific pieces — a unique pirate-ship hull, a Hogwarts-castle keystone. These are product-specific assemblies that, once they exist, can only be used in their original context (or by hobbyists with imagination). The system tolerates them in moderation; if every set introduced 30 one-offs, the system would devolve into 'one bag per product' and lose the recombination property that's central to LEGO's value. The discipline is to push 'this needs a custom piece' to 'can this be solved with existing primitives' before committing to the one-off.

    **The instructions are not the system.** A LEGO set's instructions are the wiring of bricks into a specific assembly — they belong to the set. The bricks themselves don't care about instructions. The instructions are the analog of within-product module composition; the bricks are the analog of component architecture. A LEGO product line could ship the same bricks with different instructions and produce many sets; an instruction sheet is useless without bricks. The two strata serve different purposes.

    The analogy also illuminates *why retrofit is hard*. A LEGO line that started with proprietary studs (3-stud and 5-stud variants alongside the standard 4) and then tried to consolidate would have to choose: either break every existing set's compatibility, or maintain three parallel stud systems forever. The same applies to component libraries: an API decision made at v1 is inherited by every consumer; reversing it later requires breaking changes that scale with adoption. Architecture done early is cheap; architecture retrofitted is expensive and lossy.

    Finally: **the same studs work across decades because the protocol was abstract enough**. The 2×4 brick from 1958 fits today's bricks. The studs don't encode any specific era's set design; they encode a structural protocol that survives every visual evolution. Component architecture has the same property when done well: the API surface outlives the visual treatments, the technology stack changes, and the product surfaces. A button component whose API survived React's class-to-hooks migration, the move from CSS-in-JS to CSS modules to Tailwind, and three brand refreshes is doing component architecture correctly.
  misconception: |
    The most common misconception is that **'reusable' is achieved by adding more props**. It is not. A component grows props every time someone wants a new variation, and at some point the prop count overwhelms the consumer's ability to understand the component. The thirty-prop Button (`leftIcon`, `rightIcon`, `loading`, `disabled`, `compact`, `block`, `rounded`, `outlined`, `ghost`, `iconOnly`, `iconPosition`, `iconSize`, `iconColor`, `labelColor`, `bgColor`, `borderColor`, `hoverBgColor`, …) is the canonical anti-pattern — the component is technically reusable but practically incomprehensible, every new use requires reading the prop docs, and the prop combinations are mostly untested. The discipline is to refactor toward composition: expose the sub-parts (`Button.Icon`, `Button.Label`) and let consumers compose the variation, rather than enumerating it.

    The second misconception is that **a component library can be one library that serves all products perfectly**. It usually cannot, without compromise. The components that serve N products well share most of their behavior but differ in styling, defaults, and sometimes layout. A library that tries to serve all products with no parameterization either bakes in one product's choices (and works poorly for the others) or surfaces every parameter as a prop (and becomes incomprehensible). The architectural answer is the headless / styled split — one behavior layer, multiple styling layers — but this requires the structural commitment from the start. Libraries that started as 'one styled library' rarely cleanly refactor to headless without breaking their consumers.

    The third misconception is that **all components should be controlled**. They should not. Forcing every component to be controlled forces every consumer to manage state for every input field, every modal's open/close, every accordion's expansion. For inputs whose values don't participate in larger state, this is pure overhead. Forcing all components to be uncontrolled is the opposite failure — consumers can't reset, validate, or programmatically manipulate. The disciplined default is hybrid: support both, let the consumer choose, default to uncontrolled if no value prop is passed.

    The fourth misconception is that **the API should be designed for the maintainer, not the consumer**. The opposite is true. The component's API is read by every consumer; the implementation is read by the maintainer (and the maintainer's successor, occasionally). Optimizing the implementation at the cost of consumer ergonomics — exposing internal types, requiring boilerplate setup, surfacing maintenance concerns — produces components that work but are unpleasant to use. The discipline is to design the API for the case the consumer will hit most often, even when this makes the implementation slightly more complex.

    The fifth misconception is that **headless components are a niche pattern**. They are increasingly the mainstream. Radix UI (28k+ stars), Headless UI (Tailwind Labs), Ariakit, React Aria, Tanstack Table, Tanstack Form — the modern wave of well-architected component libraries is overwhelmingly headless-first, with styling provided as a separate layer (shadcn/ui ships components that combine Radix Primitives + Tailwind; users own the styled wrapper). Teams still defaulting to monolithic styled components are working against the architectural direction of the ecosystem.

    The sixth misconception is that **Atomic Design's atoms/molecules/organisms is the only layering scheme**. It is one scheme; the layering *principle* — primitives, composites, product-specific assemblies — is what matters, not the specific names. Different teams use different terminology: 'elements / components / patterns', 'primitives / parts / blocks', 'tokens / components / templates'. The architectural property is the layering and the dependency direction, not the labels. Treating Atomic Design as a rigid taxonomy ('we need to figure out if this is a molecule or an organism') is the misframing; the productive question is 'what layer does this belong in, given how it'll be used and how often it'll change'.

    The seventh misconception is that **accessibility is a feature you add later**. It is not. Accessibility properties — keyboard navigation, focus management, ARIA attributes, screen-reader announcement — are structural properties of the component's behavior, not styling concerns. Retrofitting them after the API is shipped is painful: focus management interacts with state contracts; ARIA roles interact with polymorphism; keyboard navigation interacts with compound-component structure. The well-architected component library bakes accessibility into the primitives (this is most of what Radix, React Aria, and similar libraries do); the styled layer inherits accessibility for free. Component libraries that ship 'accessibility coming later' produce inaccessible apps; component libraries that prioritize accessibility produce libraries that scale to many products without rewriting it each time.

    The eighth misconception is that **'use composition over configuration' is universal**. It is the right default but not the universal answer. Composition has costs: more code at each consumer, more concepts to learn, more places to get the structure wrong. For variations that are genuinely small (a button with two visual variants, a label with two type scales), configuration is simpler and faster. The discipline is to default to composition for *open-ended* variation and configuration for *closed* variation — and to refactor from configuration to composition when the closed enum starts to grow.

    The ninth misconception is that **'design system' means 'component library'**. A design system is the larger structure: tokens, foundations, governance, documentation, distribution, plus the component library. The component library is one stratum; the surrounding strata — token taxonomies, governance models, documentation infrastructure, the ability to update across products — are the rest of the system. A library without the surrounding strata is a one-off code drop, not a system.

    The tenth misconception is that **forking is a failure**. Sometimes it is the right call. When a product genuinely needs behavior the upstream library doesn't support, and the change is not generalizable, forking is faster and cleaner than upstream debate. The discipline is to fork *deliberately* — with awareness that the fork is now a separate code path that will not receive upstream improvements — rather than to accumulate undocumented patches and slowly drift away. A fork that's intentional and bounded is fine; an unintentional fork that no one noticed becoming a fork is the bug.
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
