---
name: ref-patterns
description: "Use when designing or reviewing React ref usage: refs as mutable handles that survive renders without triggering them, useRef for DOM access and instance values, ref callbacks for mount/unmount hooks, forwardRef and React 19 ref-as-prop, useImperativeHandle for controlled imperative APIs, and ref forwarding through compound-component primitives such as Radix Slot. Use for focus, measurement, animation, third-party DOM integration, and sparse imperative APIs; never as a substitute for reactive state. Do NOT use for the broader hook discipline (use react-hooks-patterns), state ownership decisions (use state-management), component-layering strategy (use component-architecture), Client/Server serialization boundaries (use client-server-boundary), or form validation UX (use form-ux-architecture)."
license: MIT
allowed-tools: Read Grep
metadata:
  schema_version: "8"
  version: "1.0.0"
  type: capability
  operation: know
  category: engineering
  subject: frontend-ui
  domain: engineering/frontend
  scope: workspace
  owner: skill-graph-maintainer
  freshness: "2026-05-17"
  drift_check: "{\"last_verified\":\"2026-05-17\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  comprehension_state: present
  stability: experimental
  keywords: "[\"useRef hook\",\"forwardRef\",\"useImperativeHandle\",\"ref callback\",\"DOM ref React\",\"ref forwarding compound component\",\"React 19 ref as prop\",\"mutable ref vs state\",\"current property ref\",\"Radix Slot ref forwarding\"]"
  triggers: "[\"how do I focus an input on mount\",\"how do I pass a ref through a wrapper component\",\"do I still need forwardRef in React 19\",\"when should I use a ref instead of state\",\"how do I expose a method like open or close to the parent\",\"how do I measure a DOM element\",\"why is my ref.current null on first render\",\"how do I integrate a non-React DOM library\"]"
  examples: "[\"design a Modal component that exposes open() and close() to the parent via useImperativeHandle so the parent can trigger it imperatively without lifting full state\",\"forward a ref through a styled Button wrapper to the underlying <button> element using React 19 ref-as-prop (or forwardRef on React 18 and earlier)\",\"integrate a third-party chart library that needs a DOM container by handing it a ref callback that initializes on mount and tears down on unmount\",\"replace a useState that nobody reads in render with a useRef because the value drives an imperative side effect (interval id, latest-args closure) not the render output\",\"audit a component that uses a ref to read 'current form values' instead of reading from controlled state — usually a sign the wrong primitive was chosen\"]"
  anti_examples: "[\"design the Rules of Hooks and dependency-array discipline for useEffect (use hooks-patterns)\",\"decide whether the form state lives in URL, server, client, or persistent storage (use state-management)\",\"design the headless-vs-styled layering of a component library (use component-architecture)\",\"explain how 'use client' marks a component boundary (use client-server-boundary)\",\"design the validation-state UX of an input (use form-ux-architecture)\",\"design the layering and API surface of a cross-product component library (use component-architecture)\",\"design the validation states, layout, and microcopy of a form (use form-ux-architecture)\"]"
  relations: "{\"related\":[\"hooks-patterns\",\"component-architecture\",\"state-management\",\"client-server-boundary\",\"form-ux-architecture\"],\"boundary\":[{\"skill\":\"hooks-patterns\",\"reason\":\"hooks-patterns owns the broader hook discipline — Rules of Hooks, dependency arrays, custom hooks, the You Might Not Need an Effect rule, the render/effect/cleanup mental model. ref-patterns covers the ref family specifically (useRef, forwardRef, useImperativeHandle, ref callbacks) and the design rule for when a ref is the right primitive vs when state is. They cross-reference but solve different problems.\"},{\"skill\":\"state-management\",\"reason\":\"state-management owns the location and ownership decisions for the four kinds of state (server / client UI / URL / persistent). ref-patterns is about the mutable-handle primitive that is NOT state — using a ref when a useState was needed (or vice versa) is the most common ref misuse. ref-patterns covers the boundary; state-management owns state itself.\"},{\"skill\":\"client-server-boundary\",\"reason\":\"client-server-boundary owns the serialization and directive mechanics. Refs only work in Client Components — a ref cannot be passed through a Server Component or serialized across the 'use client' boundary. ref-patterns notes this constraint; client-server-boundary owns the broader boundary semantics that explain why.\"}],\"verify_with\":[\"code-review\",\"hooks-patterns\"]}"
  mental_model: "|"
  purpose: "|"
  boundary: "|"
  analogy: "A ref is to a React component what a static local variable is to a C function — it persists across calls (renders), reading it does not make the function 'depend on' it, writing to it does not change the function's signature or trigger any caller-visible event, and its single purpose is to hold the state that is not part of the function's interface. State, by contrast, is to the component what the function's return value is to the caller: every read participates in the contract, every change requires a re-evaluation."
  misconception: "|"
  concept: "{\"definition\":\"A React ref is a mutable object — `{ current: T }` — created by `useRef(initial)` that persists across renders without participating in the render cycle. Writing to `ref.current` does not trigger a re-render; reading from it does not subscribe the component to changes. The two canonical uses are (1) holding a reference to a DOM node so it can be focused, measured, or handed to a non-React library, and (2) holding a mutable value (an interval id, a latest-arguments closure, a previous-value snapshot) that drives side effects but is not part of what gets rendered. The design rule is: if the value should cause a re-render when it changes, it is state. If it should not, it is a ref.\",\"mental_model\":\"|\",\"purpose\":\"|\",\"boundary\":\"|\",\"taxonomy\":\"|\",\"analogy\":\"|\",\"misconception\":\"|\"}"
  structural_verdict: UNVERIFIED
  truth_verdict: UNVERIFIED
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v7
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/engineering/frontend/ref-patterns/SKILL.md
  skill_graph_export_description: shortened for Agent Skills 1024-character description limit; canonical source keeps the full routing contract
  skill_graph_canonical_description_length: "1311"
---

# Ref Patterns

## Coverage

The discipline of designing React ref usage: the conceptual distinction between refs (mutable handles that survive renders without triggering them) and state (reactive values that do trigger renders), the `useRef` hook for DOM access and mutable instance values, ref callbacks (`ref={(node) => ...}`) for fine-grained mount and unmount hooks, `forwardRef` for passing refs through component boundaries on React 18 and earlier, the React 19 **ref-as-prop** change that retires `forwardRef` for new code, `useImperativeHandle` for exposing a controlled imperative surface to a parent ref, the ref-forwarding pattern used inside compound-component primitives (Radix `Slot` / Headless UI), and the central design rule that refs are an escape hatch — appropriate for DOM access, focus management, animation, measurement, integration with non-React DOM libraries, and sparingly-exposed imperative APIs — never as a substitute for state.

## Philosophy

React's rendering model is built on a single contract: the UI is a pure function of state and props. When state changes, the component re-renders; the new output is reconciled against the old; the DOM updates. This contract is what makes React components composable, testable, and reasonable.

Refs are the deliberate hole in that contract.

A ref is a mutable container — `{ current: T }` — that React creates once per component instance and preserves across renders. Writes to `ref.current` do not trigger a re-render. Reads from `ref.current` do not subscribe to changes. The ref exists outside the reactive graph.

That's exactly what makes refs useful in the few places they belong:

- A DOM node is an external resource that React produces but does not own. A ref gives the component a stable handle to that node for focus, measurement, animation, or third-party integration.
- An interval id, a `requestAnimationFrame` id, a previous-value snapshot, a "latest arguments" closure — these are values the component needs but should not render. Storing them in state would trigger pointless re-renders; storing them in refs keeps them out of the render path.
- A child component sometimes needs to expose an imperative surface (`open()`, `close()`, `focus()`, `scrollIntoView()`) that doesn't naturally fit into the props-and-state model. A ref combined with `useImperativeHandle` gives the parent that surface in a controlled way.

The same mutability that makes refs useful also makes them dangerous. **A ref used as a substitute for state silently breaks React's contract** — the value changes, the UI doesn't update, the bug surfaces somewhere remote from the cause. The design rule is sharp: *if the value should cause a re-render when it changes, it is state; if it should not, it is a ref.* No middle ground.

## `useRef` — The Primitive

```tsx
import { useRef, useEffect } from 'react'

function AutoFocusInput() {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return <input ref={inputRef} />
}
```

`useRef(initial)` returns the same `{ current }` object across every render of this component instance. The first render initializes `current` to the argument; subsequent renders return the same container with whatever `current` has become.

Two canonical shapes:

```tsx
// DOM ref — initialized to null; React assigns the node on mount
const inputRef = useRef<HTMLInputElement>(null)

// Mutable instance value — initialized to a real value
const intervalIdRef = useRef<number | null>(null)
const latestPropsRef = useRef(props)
```

In strict mode, refs survive React's intentional double-invocation of components and effects — they are tied to component instances, not to render passes.

## The Ref / State Decision

| Symptom | Right primitive |
|---|---|
| The value drives what's rendered | `useState` |
| The value affects an effect's behavior but isn't shown | `useRef` (unless the effect needs to re-run when it changes, then `useState`) |
| You want a re-render when this changes | `useState` |
| You don't want a re-render when this changes | `useRef` |
| You're storing a DOM node | `useRef` (never `useState` — would trigger a re-render on every reconciliation pass) |
| You're storing a setTimeout / setInterval id | `useRef` |
| You're tracking "previous value" or "latest args" for an effect | `useRef` |
| You're caching an expensive value that depends on inputs | `useMemo` (not a ref) |
| You're holding form-input state | `useState` for controlled, `useRef` for genuinely uncontrolled |

The most common misuse: storing form values in refs to "avoid re-renders" — then needing to read those values during render and discovering the read is stale, because refs don't trigger renders when they change. The fix is almost always to use `useState`; the perf concern was a phantom.

## Ref Callbacks

`ref` can be a callback instead of an object. The callback runs with the DOM node on mount, and with `null` on unmount:

```tsx
function MeasuredDiv() {
  const setRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const { width, height } = node.getBoundingClientRect()
      // do something with width/height
    } else {
      // node is null — unmount cleanup
    }
  }, [])

  return <div ref={setRef} />
}
```

Use a ref callback when:

- You need to run code at the exact moment the DOM node mounts or unmounts (more reliable than `useEffect` for this — runs synchronously during commit).
- You need to attach the same ref to multiple elements conditionally (the callback is called with each).
- You need to compose multiple refs onto one element (write a `composeRefs` helper that calls each).

Composing refs is a common compound-component need:

```tsx
function composeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node)
      else if (ref) (ref as React.MutableRefObject<T | null>).current = node
    }
  }
}

// Usage in a Slot-style component:
<button ref={composeRefs(forwardedRef, internalRef)} />
```

Libraries like Radix UI ship `composeRefs` as part of their primitives because compound components routinely need to merge a consumer's ref with the library's internal ref.

## `forwardRef` — Pre-React-19

On React 18 and earlier, a function component cannot accept a `ref` prop directly — refs are special and need `forwardRef` to opt in:

```tsx
import { forwardRef } from 'react'

const StyledButton = forwardRef<HTMLButtonElement, ButtonProps>(
  function StyledButton(props, ref) {
    return <button ref={ref} className="my-styled-button" {...props} />
  },
)
```

The consumer can now do `<StyledButton ref={myRef} />` and `myRef.current` will be the underlying `<button>` element. Without `forwardRef`, the same code would warn that "Function components cannot be given refs."

## React 19 — Ref as Prop

In React 19, `ref` became a normal prop for function components. `forwardRef` is no longer required for new code:

```tsx
// React 19
function StyledButton({ ref, ...props }: ButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  return <button ref={ref} className="my-styled-button" {...props} />
}
```

`forwardRef` still works on React 19 for backward compatibility, but the React team's guidance is to use ref-as-prop for new code. Codemods exist to migrate existing `forwardRef` usage.

The change does not affect:

- Class components (still need `React.createRef` and instance refs).
- The fundamentals — refs still flow from consumer to provider; what changed is the API for accepting them, not the model.
- `useImperativeHandle` — still works the same way; the second argument to the function component is no longer the ref, so reach for the `ref` prop directly instead.

## `useImperativeHandle` — The Controlled Imperative Surface

When a parent legitimately needs to call a method on a child (rare but real cases: focus an input from outside, scroll a virtualized list, open a modal), `useImperativeHandle` exposes a controlled object via the ref instead of the raw DOM node:

```tsx
type ModalHandle = { open: () => void; close: () => void }

const Modal = forwardRef<ModalHandle, ModalProps>(function Modal(props, ref) {
  const [isOpen, setIsOpen] = useState(false)

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  }), [])

  return isOpen ? <div role="dialog">{props.children}</div> : null
})

// Parent:
function Page() {
  const modalRef = useRef<ModalHandle>(null)
  return (
    <>
      <button onClick={() => modalRef.current?.open()}>Open</button>
      <Modal ref={modalRef}>...</Modal>
    </>
  )
}
```

Three discipline rules for `useImperativeHandle`:

1. **Expose the minimum surface.** Don't return the full set of internal methods; return only what the parent needs. The parent's ref is a public API; treat it as one.
2. **Don't expose state read functions.** If the parent needs to read state, lift state up. Reading via an imperative method makes the parent's render unreactive to that state.
3. **Default to props.** Most cases that look like they need `useImperativeHandle` are better expressed as a `isOpen` prop with an `onOpenChange` callback — that puts the parent in control via the normal data flow.

The legitimate use cases are narrow: focus management on a wrapped input, scrolling a virtualized list to an index, triggering an animation on a complex sub-tree. Most other "imperative" needs reveal a state-design problem.

## Ref Forwarding in Compound Components

Compound components (Radix UI, Headless UI, Reach UI, shadcn/ui) expose primitive parts (`Tabs.Root`, `Tabs.List`, `Tabs.Trigger`, `Tabs.Content`) that internally wrap real DOM elements. Consumers expect to forward refs to those underlying elements for focus, measurement, animation, and integration:

```tsx
// Consumer code that expects ref forwarding to work:
const triggerRef = useRef<HTMLButtonElement>(null)
useEffect(() => { triggerRef.current?.focus() }, [])

<Tabs.Trigger ref={triggerRef} value="settings">Settings</Tabs.Trigger>
```

For this to work, every layer between the consumer and the underlying `<button>` must forward the ref. Radix accomplishes this with a `Slot` component that merges a ref onto the rendered child:

```tsx
// Sketch of how Radix's Slot pattern propagates refs through layers
<Tabs.Trigger>           {/* accepts ref, forwards via Slot */}
  <Slot ref={mergedRef}> {/* merges consumer ref with library internal ref */}
    <button>...</button> {/* receives the merged ref */}
  </Slot>
</Tabs.Trigger>
```

The design rule for authoring compound components: **every primitive part must forward refs to its DOM node**. Failing to do this breaks consumer focus management, breaks third-party integrations that need DOM access, and produces "ref is null" bugs that are hard to diagnose because the chain of components looks correct.

A compound-component library that doesn't forward refs through every primitive is not finished.

## Refs and the Client/Server Boundary

Refs only work in Client Components. A ref cannot:

- Be created inside a Server Component (no `useRef`).
- Be passed as a prop from a Server Component to a Client Component (refs are not serializable).
- Be returned from a Server Action (same reason).

Server Components produce HTML on the server; there is no DOM node to point at and no client-side runtime to hold the mutable container. If you need a ref, the component (or at least the part of the tree containing the ref) must be a Client Component marked with `'use client'`. The broader boundary mechanics belong to `client-server-boundary`; the consequence for refs is the constraint stated here.

## Common Anti-Patterns

| Anti-pattern | Why it's wrong | Fix |
|---|---|---|
| Using a ref to store form input values to "avoid re-renders" | Reading the ref during render returns stale data; controlled inputs need state | Use `useState` — the perf concern was a phantom for almost all forms |
| Reading `ref.current` during render | The ref may be null on first render; render-time mutation breaks the render contract | Read refs inside effects, event handlers, or callbacks — never during render |
| Mutating a ref during render (`ref.current = newValue` inline) | Strict mode double-renders cause inconsistent state | Mutate inside effects, event handlers, or initial render guards (`if (ref.current === null)`) |
| `useImperativeHandle` exposing the whole internal API surface | Couples parent to internals; breaks encapsulation | Expose the minimum; prefer props + callbacks; reserve imperative for genuine escape-hatch needs |
| Compound-component primitive that doesn't forward refs | Consumer focus, measurement, third-party integration all break | Every primitive forwards refs to its underlying DOM element |
| Storing a DOM node in `useState` | Triggers re-render on every reconcile pass; pointless work | `useRef` for DOM nodes; or ref callback if mount/unmount hook is needed |
| Passing a ref through a Server Component | Refs are not serializable across the boundary | Mark the wrapper as `'use client'` so the ref flows in client-only space |
| Forgetting to clean up a ref-held resource (interval, observer, third-party instance) | Memory leak; observer fires after unmount | Clean up in the same effect or in the ref callback's `node === null` branch |
| Using `useRef` for a value derived from props | Stale closure; the value never updates | Either derive it inline in render (no ref needed) or sync via effect (`useEffect(() => { ref.current = derived }, [derived])`) — but the sync pattern is usually a smell |
| Replacing all `forwardRef` with ref-as-prop on a React 18 codebase | Breaks until React 19 is shipped | Migrate when React 19 is the active version; `forwardRef` still works on 18 |

## Verification

After applying this skill, verify:

- [ ] Every ref is either a DOM ref or a mutable instance value — never a substitute for state that drives the UI.
- [ ] `ref.current` is only read inside effects, event handlers, or callbacks — never during render.
- [ ] Compound-component primitives forward refs to their underlying DOM elements.
- [ ] `useImperativeHandle` exposes the minimum surface needed; props + callbacks were considered first.
- [ ] No ref is being passed across the `'use client'` boundary as a prop from a Server Component.
- [ ] Ref-held resources (intervals, observers, third-party instances) have cleanup paths in effects or ref-callback null branches.
- [ ] On React 19, new code uses ref-as-prop; existing `forwardRef` is retained for backward compat or migrated via codemod.
- [ ] No `useState(domNode)` — DOM nodes go in refs, not state.
- [ ] Composed refs (multiple consumers attaching to one element) use a `composeRefs` helper rather than ad-hoc merging.

## Grounding Sources

- React docs — [`useRef`](https://react.dev/reference/react/useRef). The hook reference, with the ref-vs-state decision tree.
- React docs — [Manipulating the DOM with Refs](https://react.dev/learn/manipulating-the-dom-with-refs). The conceptual introduction, with focus/scroll/measurement examples.
- React docs — [`forwardRef`](https://react.dev/reference/react/forwardRef) (deprecated as of React 19) and the [ref-as-prop migration note](https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop). The pre- and post-React-19 API.
- React docs — [`useImperativeHandle`](https://react.dev/reference/react/useImperativeHandle). The controlled imperative surface API.
- Radix UI — [Composition (Slot)](https://www.radix-ui.com/primitives/docs/utilities/slot). The canonical ref-forwarding pattern for compound primitives.
- Dodds, K. — [How to use React Context effectively](https://kentcdodds.com/blog/how-to-use-react-context-effectively) (covers the "lift imperative methods into props" alternative to `useImperativeHandle`).

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| The broader hook discipline — Rules of Hooks, dependency arrays, custom hooks, You Might Not Need an Effect | `hooks-patterns` | hooks-patterns owns the hook model; this skill covers the ref family specifically. |
| The cross-product component-layering question — primitives vs composites, headless vs styled, controlled vs uncontrolled | `component-architecture` | component-architecture owns the layering; this skill covers the ref-forwarding mechanics that compound primitives need. |
| State location and ownership decisions for server / client / URL / persistent state | `state-management` | state-management owns state; this skill owns the not-state primitive and the decision boundary between them. |
| The serialization and directive mechanics of `'use client'` and `'use server'` | `client-server-boundary` | client-server-boundary owns the boundary; this skill notes the constraint that refs can't cross it. |
| Form-state design — validation, accessibility, microcopy, layout | `form-ux-architecture` | form-ux-architecture owns forms; refs may appear in forms (focus management, uncontrolled inputs) but the broader design belongs there. |
