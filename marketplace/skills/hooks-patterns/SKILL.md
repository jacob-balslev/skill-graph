---
name: hooks-patterns
description: "Use when reasoning about React Hooks as a discipline: when a render is the right shape for state, why the Rules of Hooks exist as a compile-time invariant, how the dependency array encodes a contract between closure and rerender, when useEffect is the wrong primitive, the distinction between derived state and stored state, when to extract a custom hook, and when memoization (useMemo, useCallback) is a footgun rather than a fix. Covers React 18+ semantics including automatic batching and concurrent rendering. Do NOT use for general React rendering models (use rendering-models), for the client/server boundary (use client-server-boundary), for component composition (use component-architecture), or for state location decisions across the application (use state-management)."
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
  freshness: "2026-05-16"
  drift_check: "{\"last_verified\":\"2026-05-16\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  comprehension_state: present
  stability: experimental
  keywords: "[\"React Hooks\",\"Rules of Hooks\",\"useEffect dependencies\",\"useState\",\"useMemo when not to\",\"useCallback footgun\",\"custom hooks extraction\",\"derived state\",\"stale closure\",\"effect cleanup\"]"
  triggers: "[\"is this hook safe to call here\",\"why does my useEffect run twice\",\"do I need useMemo here\",\"dependency array warning\",\"should this be state or derived\",\"extract this into a custom hook\"]"
  examples: "[\"review a useEffect whose dependency array is missing a variable and decide whether to add it, hoist the value, or rethink whether an effect is needed at all\",\"decide whether a derived value should live in useState plus useEffect, or simply be computed during render\",\"explain why the Rules of Hooks are a compile-time invariant, not just a convention\",\"audit a component for unnecessary useMemo / useCallback wrappers that don't actually prevent rerenders\"]"
  anti_examples: "[\"choose between Server Components and Client Components for a new page (use client-server-boundary)\",\"decide where the application's order list lives in memory across routes (use state-management)\",\"design the public API of a reusable component library primitive (use component-architecture)\",\"pick between SSR, SSG, and ISR for a route (use rendering-models)\",\"decide how to layer primitives, composites, and product-specific components (use component-architecture)\"]"
  relations: "{\"related\":[\"rendering-models\",\"client-server-boundary\",\"component-architecture\",\"state-management\"],\"boundary\":[{\"skill\":\"state-management\",\"reason\":\"state-management owns the question of where state lives across the application (server, client, URL, persistent); hooks-patterns owns the in-component discipline of expressing state with the hook primitives.\"},{\"skill\":\"client-server-boundary\",\"reason\":\"client-server-boundary owns the serialization and 'use client' / 'use server' contract; hooks-patterns owns the rules of hook usage on the client side of that boundary.\"}],\"verify_with\":[\"code-review\",\"testing-strategy\"]}"
  mental_model: "|"
  purpose: "|"
  boundary: "|"
  analogy: "Hooks are to function components what stack frames are to function calls — they let a function remember things across calls without breaking referential transparency from the outside, by tracking state in a slot array indexed by call order, and the Rules of Hooks are the same kind of invariant as 'do not goto into the middle of a stack frame': violating them produces undefined behavior masked by garbage collection rather than visible crashes."
  misconception: "|"
  concept: "{\"definition\":\"Hooks are the React primitives that let a function component participate in the render/commit lifecycle: subscribe to state, schedule effects, read context, and reference mutable values across renders. The Rules of Hooks — call at the top level, call only from React functions — are not style guidance but the precondition that lets React match each hook call to its slot in the fiber tree by call order alone.\",\"mental_model\":\"|\",\"purpose\":\"|\",\"boundary\":\"|\",\"taxonomy\":\"|\",\"analogy\":\"|\",\"misconception\":\"|\"}"
  structural_verdict: UNVERIFIED
  truth_verdict: UNVERIFIED
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/frontend-ui/hooks-patterns/SKILL.md
---

# Hooks Patterns

## Coverage

The discipline of using React Hooks correctly: why the Rules of Hooks are a compile-time invariant rather than a convention, how the dependency array encodes a contract between a closure and the next render, when `useEffect` is the wrong primitive (and what the right one is), the difference between *derived* values and *stored* values, the three legitimate reasons to extract a custom hook, when `useMemo` and `useCallback` actually prevent rerenders and when they merely add overhead, and the React 18+ semantics that change the calculus: automatic batching, concurrent rendering, and the still-experimental `useEffectEvent` separation of "reactive" from "non-reactive" effect logic.

## Philosophy

A React component is a function from props and state to a description of UI. Hooks are the primitives that let the function remember things across calls without breaking referential transparency from the outside — to the calling renderer, each render is a fresh function call producing fresh output; to the component, `useState` returns "the same" state across renders.

This illusion is held together by a single mechanism: **React identifies hooks by call order**. The first `useState` call in a render is matched to slot 0 of the fiber's hook list, the second to slot 1, and so on. The Rules of Hooks exist to keep that call order stable across renders. A conditional `useState` would shift the slot indices and corrupt the state of every later hook in the component. The lint rule that flags conditional hooks is not enforcing style; it is preventing a class of memory-corruption bug from compiling.

Once that foundation is internalized, every other "discipline" rule around hooks falls out of it: dependency arrays exist because hooks capture closures over the render's props and state, and a stale closure is a referential bug. `useEffect` exists for **synchronizing** with systems outside React, not for general "do this when X changes" logic — most uses are better expressed as derived values during render. Custom hooks exist when stateful logic must be **reused across components**, not as a stylistic preference for shorter component bodies. `useMemo` and `useCallback` exist to stabilize referential identity for downstream `React.memo` or hook dependency arrays, not as general performance optimizations.

The discipline is to ask, at each hook call, *what invariant am I expressing?* — and to reach for the cheapest primitive that expresses it. Most stale-closure bugs, most "why does my effect run twice" mysteries, and most over-memoized components come from reaching for hooks as a generic toolkit rather than as primitives with specific semantics.

## Rules of Hooks — Why They Are a Compile-Time Invariant

The two rules:

1. Only call hooks at the top level. Not inside conditions, loops, or nested functions.
2. Only call hooks from React function components or from other hooks. Not from regular functions, event handlers, or class methods.

The mechanism they protect:

```
// First render
const [a, setA] = useState(0);   // slot 0
const [b, setB] = useState('');  // slot 1
useEffect(() => {...}, [a]);     // slot 2

// Second render — what if the second hook is conditional?
const [a, setA] = useState(0);   // slot 0
if (a > 0) {
  const [b, setB] = useState(''); // SOMETIMES slot 1, SOMETIMES skipped
}
useEffect(() => {...}, [a]);     // either slot 1 OR slot 2 — slot mismatch
```

React does not store hooks by name. It stores them by call-order index. A conditional hook makes the index of every later hook depend on the condition. State and effect state get reassigned to wrong slots, and the component starts reading another hook's state — a classic memory-corruption pattern, except in JavaScript with garbage collection it surfaces as silent bugs rather than crashes.

`eslint-plugin-react-hooks` and the React runtime in development mode both enforce these rules. The cost of violating them is not lint-failure aesthetics; it is undefined behavior.

## The Dependency Array — A Closure Contract

Every callback you pass to `useEffect`, `useMemo`, `useCallback`, and similar hooks **captures the variables in scope at the time of the render that produced it**. The dependency array is the contract that says: "the next render's callback should replace this one if any of these values changed; otherwise keep using the cached one."

Three failure modes:

1. **Missing dependency (stale closure).** The callback references `x` but `x` is not in the array. The effect runs with the value of `x` from the render where the effect was last created — which may be many renders behind reality. Symptom: "the value seems frozen" or "this used to update and now doesn't."

2. **Reference-unstable dependency (over-firing).** The callback depends on an object, array, or function that is *re-created on every render*. The dependency array compares by `Object.is`, so a new array literal `[a, b]` is never `===` to the previous one. The effect re-runs every render even when the meaningful values didn't change.

3. **Disabled lint (silent drift).** `// eslint-disable-next-line react-hooks/exhaustive-deps`. The escape hatch exists, but every use should be a documented exception with a comment explaining why the missing dependency is intentional. Most production stale-closure bugs trace to silent disables.

The right fix depends on the case:

- **Missing dep**: add it. If adding it causes an infinite loop, the loop was already a latent bug — the effect was running every render and producing new state, you just hadn't noticed because the deps were lying about it.
- **Reference-unstable dep**: lift the value up (define it outside the component, or pass it as a prop), memoize it with `useMemo` / `useCallback` at its source, or refactor so the effect depends on a primitive (string, number) rather than a reference.
- **Genuinely-don't-want-to-react**: the React team's answer is `useEffectEvent` (RFC stage as of writing) — separate the "reactive" reads from the "latest snapshot" reads. Until that lands, a `useRef` mirror of the value is the documented escape hatch.

## When `useEffect` Is the Wrong Primitive

`useEffect` is for **synchronizing the component with an external system**: a DOM subscription, a network request, a timer, a third-party widget. It is not for "do this calculation when X changes." Most of the patterns below are mis-uses:

| Pattern | What it does | Better primitive |
|---|---|---|
| `useState(initial); useEffect(() => setState(derive(props)), [props])` | Stores a derived value in state, then re-syncs on prop change | Compute during render: `const derived = derive(props);` |
| `useState; useEffect(() => setState(...))` triggered by a prop change to reset | Resets local state when a prop changes | Use the `key` prop to remount, or lift state up |
| `useEffect(() => { fetchData().then(setData) }, [])` for initial data | Imperative fetch-on-mount | Server Components, React Query / SWR, or Suspense data fetching |
| `useEffect(() => onChange?.(value), [value])` to notify parent | Re-syncs parent state from child effect | Call `onChange` in the event handler that changed `value` |
| `useEffect(() => { const id = setTimeout(...); return () => clearTimeout(id) }, [...])` to debounce | Effect-driven debounce | Custom `useDebouncedValue` hook, or library |

The React docs' essay [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) is the canonical taxonomy of effect misuse. The pattern: every `useEffect` is a code smell until it has earned its place by genuinely synchronizing with something React doesn't own.

## Derived Values vs Stored Values

A value is *derived* if it can be computed from other values you already have (props, state, refs). A value is *stored* if it has its own lifecycle — set by an event, persisted across renders, and not recoverable from other inputs.

Stored:

```tsx
const [draft, setDraft] = useState('');
<input value={draft} onChange={e => setDraft(e.target.value)} />
```

Derived (no extra `useState` needed):

```tsx
const fullName = `${firstName} ${lastName}`;          // from props
const isValid = email.includes('@') && password.length >= 8;  // from state
const filteredItems = items.filter(i => i.tag === activeTag);  // from props+state
```

The rule: if the value can be computed during render, compute it during render. State exists to remember things across renders; it is not a cache for computation. Storing a derived value in state introduces a two-step update cycle: render → effect → setState → rerender, where a single render with inline computation would have sufficed.

When derived computation is expensive enough to matter, that's what `useMemo` is for — and *only then*, because for cheap computations the overhead of `useMemo` (a deps check, an array allocation, a callback closure) exceeds the cost of re-running the computation.

## Custom Hooks — When and Why

Three legitimate reasons to extract a custom hook:

1. **Reuse across components.** The same stateful logic is needed in two or more components. Extract it once, import it twice.
2. **Name the abstraction.** A sequence of `useState` + `useEffect` + `useCallback` whose collective purpose is "track the window's scroll position" deserves to be named `useScrollPosition`. The name is documentation.
3. **Encapsulate a state machine.** A reducer plus its bound actions is a contained unit; `useFormDraft` is clearer at the call site than the seven hooks it composes.

Anti-patterns:

- **Extracting because the component is "too long".** Length is not a smell. Hooks have one-call-site-per-component semantics; splitting a 200-line component's hooks into three custom hooks that are each called from one place produces three indirections and no reuse.
- **Extracting to "follow the pattern".** Custom hooks are not architecture; they are factorization. If the factor isn't reused or doesn't have a useful name, it's noise.
- **Extracting effects without their state.** A custom hook that takes a callback and runs it in `useEffect` is almost always wrong — the callback closes over the caller's state, and you've just hidden the dependency-array problem from view.

Library precedent: `react-use`, `usehooks-ts`, `@tanstack/react-query`, `swr` — these libraries are entirely composed of named, reusable custom hooks. They are the existence proof of what custom hooks earn their keep doing.

## `useMemo` and `useCallback` — Footgun Cases

These hooks have two valid jobs:

1. **Stabilize referential identity** for a value that will be a dependency of another hook, or a prop to a `React.memo`-wrapped child.
2. **Skip expensive computation** when the inputs haven't changed.

For everything else, they are net negative — they add a deps-check cost, an allocation, and a closure, in exchange for no observable benefit.

| Case | `useMemo` adds value? |
|---|---|
| `const total = items.reduce(...)` where items has 5 entries | No |
| `const total = items.reduce(...)` where items has 50,000 entries | Yes (if rerender frequency is high) |
| `const onClick = useCallback(() => ..., [...])` passed to a normal child | No — the child re-renders anyway when its parent re-renders |
| `const onClick = useCallback(() => ..., [...])` passed to `React.memo(Child)` | Yes — keeps the memo equality check from breaking |
| `const opts = useMemo(() => ({ a, b }), [a, b])` used in another hook's deps | Yes — without it, the outer hook over-fires |
| `const opts = useMemo(() => ({ a, b }), [a, b])` never used as a dep | No |

The compiler (React Compiler, formerly React Forget) when generally available will auto-memoize where beneficial and eliminate this discipline as a manual concern. Until then, the rule is: don't memoize until you have evidence — a profiler trace, a benchmark, or a `React.memo`'d consumer — that memoization is preventing real work.

## React 18+ Semantics That Change Hook Reasoning

- **Automatic batching.** All state updates inside any callback (event handlers, promises, timeouts, async functions) are batched into a single re-render in React 18+. Pre-React-18, only updates inside React event handlers batched. The discipline change: stop reaching for `flushSync` to force separate updates; conversely, don't write code that depends on updates *not* batching.
- **Concurrent rendering.** A render can be interrupted, abandoned, or replayed. Two consequences: (1) render functions must be pure — no side effects, no I/O, no `Date.now()`-driven branching that won't survive replay; (2) effects run *after* the render commits, not after every render function call.
- **Strict Mode double-invocation in development.** React 18 in dev mounts every component twice, runs every effect twice, to surface non-idempotent effects. Effects that don't clean up properly (subscribe without unsubscribe, fetch without abort) misbehave under this regimen — that's a bug Strict Mode is *showing* you, not a bug Strict Mode is *causing*.
- **`useEffectEvent` (RFC, partial).** Separates a callback's *latest snapshot* read from the effect's reactive dependencies. The right primitive for "use the current value of X inside this effect but don't re-fire when X changes." Until stable, the workaround is a `useRef` mirror updated in a `useEffect`.

## Verification

After applying this skill, verify:

- [ ] Every hook is called at the top level of the component or another hook, with no conditional or loop wrapping.
- [ ] Every dependency array is exhaustive (eslint-plugin-react-hooks passes), with documented exceptions only.
- [ ] Each `useEffect` synchronizes with something React doesn't own; computational logic lives in render or in event handlers.
- [ ] No state holds a value that could be derived during render.
- [ ] Custom hooks have either ≥2 call sites or a meaningful name that earns its existence.
- [ ] `useMemo` / `useCallback` wrap only values that (a) stabilize identity for a downstream consumer or (b) skip provably-expensive work.
- [ ] Effects clean up: every subscribe has unsubscribe, every fetch has abort, every timer has clear.

## Grounding Sources

- React docs — [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks). The official statement of the two rules and their rationale.
- React docs — [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect). The canonical taxonomy of `useEffect` misuse.
- React docs — [Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks). The official guidance on when extraction is warranted.
- Abramov, D. — [A Complete Guide to useEffect](https://overreacted.io/a-complete-guide-to-useeffect/). The stale-closure model and the closure-over-render mental model.
- React RFC — [`useEffectEvent`](https://github.com/reactjs/rfcs/pull/220). The reactive/non-reactive separation for effect dependencies.
- React 18 working group — [Automatic batching for fewer renders in React 18](https://github.com/reactwg/react-18/discussions/21).
- Markbåge, S. & Clark, A. — React 18 announcement post on concurrent rendering invariants.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Choosing between Server Components, Client Components, and where to draw the boundary | `client-server-boundary` | client-server-boundary owns the serialization contract and the `'use client'` / `'use server'` rules; hooks-patterns operates on the client side of that boundary. |
| Deciding where the application's state should live (server, client, URL, persistent storage) | `state-management` | state-management owns the location and ownership decision; hooks-patterns owns the local discipline once you've decided client-component state is the right home. |
| Designing a reusable component library's API surface | `component-architecture` | component-architecture owns primitive/composite/product layering; hooks-patterns is one component's internal logic. |
| Picking SSR vs SSG vs ISR for a route | `rendering-models` | rendering-models owns the rendering-strategy decision; hooks-patterns has nothing to say about it. |
| Suspense for data fetching and streaming UI patterns | `suspense-patterns` | suspense-patterns owns the boundary-and-fallback discipline; hooks-patterns covers the underlying hook primitives but not the Suspense boundary protocol. |
