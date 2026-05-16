---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: state-management
description: "Use when deciding where state lives, how it propagates, and how multiple kinds of state compose: local component state vs lifted/shared state vs application state, the difference between server state and client state, URL as state, persistent state, derived state, ephemeral interaction state, and the cross-cutting decision of who owns which piece. Covers state colocation, lifting state up, state derivation vs duplication, single source of truth, optimistic updates, server-state cache invalidation (the React Query/SWR model), the URL as a state container (deep-linking, share-ability, back-button correctness), and the architectural anti-patterns of prop-drilling, state sprawl, and global-state-by-default. Do NOT use for the choice of a specific state library (Redux vs Zustand vs Jotai vs Recoil — those are tactical), for data fetching mechanics (use api-design or rendering-models), for the boundary of what runs on client vs server (use client-server-boundary), for distributed-system state across services (use replication-patterns), or for state-machine modeling of finite states (use state-machine-modeling)."
version: 1.0.0
type: capability
category: engineering
domain: engineering/frontend
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
  - state management
  - state colocation
  - lifting state
  - state derivation
  - single source of truth
  - server state
  - client state
  - URL state
  - persistent state
  - ephemeral state
  - global state
  - prop drilling
  - state sprawl
  - optimistic update
  - cache invalidation
  - state ownership
triggers:
  - "where should this state live"
  - "should this be in component state or global"
  - "I have state across multiple routes"
  - "this prop is drilled through 5 components"
  - "is this server state or client state"
  - "should this be in the URL"
examples:
  - "decide where the filter/sort/page state for a data table should live"
  - "decide whether a piece of state should be in the URL, component state, or persistent storage"
  - "diagnose whether a piece of duplicated state is a real performance need or accidental sprawl"
  - "structure state for a form that spans multiple steps and survives navigation"
anti_examples:
  - "implement a specific Redux reducer (tactical, library-specific)"
  - "design the JSON shape of an API response (use api-design)"
  - "model the state transitions of a multi-step workflow (use state-machine-modeling)"
  - "configure HTTP cache headers on the server (use rendering-models or http-semantics)"
relations:
  related:
    - rendering-models
    - client-server-boundary
    - frontend-architecture
    - api-design
    - state-machine-modeling
  boundary:
    - skill: client-server-boundary
      reason: "client-server-boundary owns the line between code-that-runs-where (server components, client components, the serialization boundary); this skill owns the orthogonal question of which side owns which piece of state. They compose: the boundary skill says what code runs where; this skill says what state lives where."
    - skill: state-machine-modeling
      reason: "state-machine-modeling owns finite-state representation of workflows (states, transitions, guards); this skill owns the decision of where state of any kind lives. The two compose when a workflow has a finite state space whose value still has to live somewhere — the machine names the values, this skill names the location."
    - skill: api-design
      reason: "api-design owns the external request/response shape; this skill owns where the response data lives once it arrives, and how it's invalidated. Server state cache management (React Query / SWR doctrine) is in scope of this skill; the API surface itself is not."
    - skill: rendering-models
      reason: "rendering-models owns the question of when content is generated (SSR, RSC, CSR, ISR); this skill owns the question of where data backing that content lives. The two intersect in 'server state' — data fetched on the server that the client needs."
  verify_with:
    - rendering-models
    - api-design
concept:
  definition: "State management is the architectural discipline of deciding, for each distinct piece of data that an application reads or writes, where that data lives, who owns it, how it propagates to the components that need it, and how it stays consistent across changes. The discipline is upstream of any specific state library: it asks 'should this be local, lifted, global, server-cached, URL-encoded, or persisted' before asking 'which library do I use to hold it.' State is not a single thing; it is a category with at least four distinct kinds (server state, client UI state, URL state, persistent state), each with different lifetimes, invalidation rules, and consistency requirements. The discipline is the recognition that treating all state the same — putting all of it in one global store, or scattering it across every component — produces the recurring frontend problems of prop drilling, stale data, broken back-buttons, and tests that pass while users are confused."
  mental_model: |
    Six primitives structure state-management reasoning:

    1. **The kinds-of-state taxonomy**. State is not a single category; it is at least four distinct kinds, each with its own location rule. *Server state* is data owned by a backend that the client caches: it has a canonical source elsewhere, can become stale, and needs revalidation strategy. *Client UI state* is interaction state that exists only in the active session — open/closed, hover, focus, in-progress drag. *URL state* is the part of application state that should survive a page refresh, be shareable via link, and respond to browser navigation — search filters, current page, selected tab. *Persistent state* is data the user owns that survives session boundaries — preferences, drafts, auth tokens — stored in localStorage, IndexedDB, or cookies. A piece of state's correct location depends on which kind it is; treating client UI state like server state (or vice versa) produces specific predictable bugs.

    2. **Colocation as the default; lifting as the deliberate move (Kent C. Dodds)**. The default rule is: state lives next to the component that uses it. State is colocated until at least two distinct components need to read or write it, at which point it is *lifted* to the nearest common ancestor and passed down by props (or accessed through context, store, or query cache). The reason colocation is the default is that local state has no propagation cost, no invalidation cost, and no coupling — every state-sharing decision must justify its cost against the colocated alternative. Premature lifting (putting state in a global store "just in case") is the most common state-sprawl source.

    3. **Single source of truth**. For any given piece of information, exactly one location holds the canonical value; every other reference is a derivation or a read. Duplicated state — the same value held in two independent locations — is the recurring source of consistency bugs. The discipline is to identify when two pieces of state look duplicated but are actually one piece in two locations (sync them; the system is fragile), vs when they are genuinely independent (verify; don't sync). Derived state — values computed from other state at the moment they're needed — is the most common antidote to false duplication.

    4. **Server state requires its own model (the React Query / SWR doctrine)**. Server state is fundamentally different from client UI state: it has a remote owner, can change without the client knowing, needs deduplication of fetches, has revalidation and invalidation rules, and benefits from optimistic updates that may need rollback. A general-purpose state container (Redux, Zustand) treats server state as just-data, missing all of this. Server-state libraries (React Query / TanStack Query, SWR, RTK Query, Apollo) encode the model: queries are cached by key, refetched on focus/reconnect/interval, mutated via dedicated mutate functions, and invalidated by query-key matching. The discipline is to use server-state tools for server state and to NOT put server data in a general-purpose store.

    5. **The URL as a state container (deep-linking)**. The URL is the only state location the browser's history, share button, refresh, and back/forward buttons fully respect. State that should survive a refresh, be shareable, or respond to back-navigation belongs in the URL (search params, route params, hash). State that shouldn't survive these — current scroll position of a sub-panel, hover, drag-in-progress — explicitly does not. The decision rule is: 'should two people opening this URL see the same thing'. If yes, URL-state. If no, somewhere else. The cost of URL state is serialization complexity (state must be string-encoded); the benefit is the entire browser's worth of free state-management infrastructure that comes with putting state there.

    6. **State ownership as a design contract**. Every piece of state has an owner: the component, hook, or store responsible for its current value, its invalidation, its updates. Owners may be private (only that owner can write; others read) or shared (multiple writers). The architectural decision is who owns what, made before code is written; the architectural failure is state that has emerged into the codebase without anyone having decided who owns it, which always becomes contention later — multiple writers fighting, no one in charge of invalidation, derivation logic duplicated. Naming the owner explicitly is the discipline that prevents this.

    The deep insight is that 'state management' is not a tooling decision — it is a series of location and ownership decisions, each of which has a default. The defaults are: colocate locally; lift only when needed; put server state in a server-state library; put URL-worthy state in the URL; put session-survival state in persistent storage; never have two sources of truth for one value. Most state-sprawl in real codebases is the absence of these defaults being deliberately applied; global-state-by-default is the most common form of the absence.

    The complementary insight is that *the right kind of state determines the right tool for that kind*. A team that uses one store (Redux, Zustand) for everything inherits the cost of that single tool for every kind of state, and pays it in cache-invalidation manual labor that a server-state library would have automated. A team that uses no store and lifts everything by hand pays it in prop-drilling and refactor friction. The disciplined answer is multiple tools, each appropriate to its kind: useState/useReducer for component state, Context for tree-scoped state, React Query for server state, useSearchParams for URL state, localStorage for persistent state. The architecture is the assignment of state to tools, not the choice of one tool for everything.
  purpose: |
    State management discipline exists because the recurring problems in frontend codebases — prop drilling, stale data, the back-button broken, two places to update when one thing changes, tests that pass while users are confused, "why isn't this re-rendering," "why is this re-rendering" — are all symptoms of the same root cause: pieces of state in the wrong location, with the wrong owner, sharing the wrong invariants with their siblings. Pick the right location and these problems don't arise; pick the wrong location and they recur regardless of which library is used.

    The discipline matters with particular force as React, Next.js, and similar frameworks have evolved to support server components, server actions, streaming, and partial pre-rendering. Each new rendering capability changes what state can live where: server state can live on the server now, accessed via direct database calls rather than fetch-cache-revalidate cycles; URL state has new tooling support that makes deep-linking cheaper than it used to be; client UI state is the only state that genuinely needs a client component. Teams that haven't internalized the kinds-of-state taxonomy migrate to App Router and bring the old Redux store with them, missing most of the architectural simplification the new model enables.

    For long-lived products, state management is also the discipline of avoiding the *state-sprawl trap*: as features accumulate, every new "we need this in two places" decision adds a piece to a global store, and the global store grows until no one understands what's in it, no one knows which slice owns what, and refactors become hazardous because any change might break an unsuspected consumer. Sprawl is prevented by repeatedly asking the colocation question — "does this need to be where it is, or can it move closer to its only consumer" — and by treating each lift as a deliberate decision with a recorded reason.

    For agents writing or reviewing frontend code, the discipline is what lets the agent reason about a chunk of state-related code without reading every consumer. An agent that knows the kinds-of-state taxonomy can look at a piece of state and ask: 'is this server state? Then where is its cache? Is the cache invalidation correct?' 'Is this URL state? Then can a user share this URL and reproduce the view?' 'Is this local? Then is it duplicated anywhere?' Without the taxonomy, the agent is doing pattern-matching on whatever the codebase already has, replicating its choices without verifying them.

    Finally, the discipline matters because most of the well-known frontend bugs in user-facing products map to state-management failures: clicking back after submitting a form loses unsubmitted edits (persistent state missing); two tabs showing different data because each cached the same server data independently (cache strategy missing); search filters lost on refresh (URL state missing); pressing back shows a stale page (revalidation strategy wrong); changing a setting in one place doesn't reflect in another (single source of truth violated). Each of these is a category bug, not an individual fix — and the category is the kind-of-state mismatch.
  boundary: |
    **State management is not state-library selection.** The architectural decisions (which state lives where, who owns it, how it propagates) are upstream of and independent from the tool choices that implement them. A team can practice good state management with no library beyond `useState`/`useReducer` and still get the architecture right; a team can use Redux Toolkit + RTK Query + React Hook Form + URL search params and still get the architecture wrong if every piece of state goes wherever was convenient. The library is the implementation; the discipline is the design.

    **State management is not state-machine modeling.** A state machine is a *finite-state representation of a workflow* — the set of named states a system can be in, the transitions between them, the guards that constrain transitions, the actions that occur on entry/exit. This is a modeling discipline (see `state-machine-modeling`). State management is the *location decision*: given that a workflow has a current state value, where does that value live and who owns it. The two compose — a state machine describes the possible values; state management describes their location. Many state-management problems are not state-machine problems (a list of items isn't a state machine), and many state-machine problems are not state-management problems (a state machine can be implemented anywhere — local, lifted, store).

    **State management is not data fetching.** Fetching is the act of getting data from a remote source; state management is the act of holding it once fetched, deciding when it's stale, and triggering refetches. A team that calls `fetch` directly in a component is doing data fetching; a team that uses React Query is doing data fetching plus server-state management; the cache, the invalidation rules, the deduplication, the optimistic-update support are the *state management* layer on top of the fetch. Confusing the two leads to building cache infrastructure inside each component, badly.

    **State management is not React-specific.** The discipline applies to any UI framework: Vue's reactivity system, Svelte's stores, Angular's services, SolidJS's signals. The names differ; the kinds of state, the colocation rule, the single-source-of-truth principle, the server-state distinction all generalize. References here mention React idioms because that's the dominant ecosystem at the time of writing; the underlying ideas predate React (the Model in MVC, the Store in Flux, the cache in Apollo for any framework) and will outlive it.

    **State management is not distributed-system state.** This skill covers state in a single client (browser tab, mobile app, etc.) with one optional server backend. State across multiple replicas, eventual consistency, CRDTs, vector clocks, conflict resolution — those are distributed-systems territory, owned by `replication-patterns` and related skills. The 'server state' kind in this skill is the *client's view of* a single canonical server source, not the multi-replica problem.

    **State management is not concurrency control.** Concurrent updates from multiple users to the same record (optimistic concurrency, pessimistic locking, last-write-wins, operational transformation) are a separate concern that intersects with state management at the level of 'what does the client do when a mutation conflicts.' The mechanisms for the conflict — versioning, ETags, server-side reconciliation — are out of this skill's scope.

    **Premature globalization is the most common anti-pattern; premature decomposition is the second.** Putting state in a global store before evidence demands it produces sprawl. Decomposing a piece of state across N components before any of them need it produces premature optimization for non-existent flexibility. Both errors are the same shape: applying a state-management pattern in advance of the requirement that justifies it. The discipline is to make these moves *deliberately* in response to *observed need*, not preemptively.

    **Optimistic updates are not free.** An optimistic update is the pattern where the client mutates its local state immediately and rolls back if the server rejects the change. This produces a faster-feeling UX, but it requires (a) the ability to predict the server's response, (b) a rollback path that doesn't lose the user's intent, (c) a reconciliation path when the server's response differs from the prediction in a non-rejection way (server merged in changes), and (d) a way to surface conflicts when reconciliation fails. Optimistic updates without all four are bug factories. The discipline is to identify whether the latency benefit justifies the four-part complexity for each specific mutation.
  taxonomy: |
    By kind of state (the primary axis):
    - **Server state** — data owned by a backend, cached on the client, subject to staleness and invalidation. Tools: React Query/TanStack Query, SWR, RTK Query, Apollo Client (for GraphQL), tRPC's built-in caching, Server Components with direct DB access. Decision: when in doubt, use a server-state library, not a general-purpose store.
    - **Client UI state** — interaction state ephemeral to the session: open/closed, hover, focus, in-progress drag, currently-typing input. Tools: useState / useReducer (local); Context, Zustand, Jotai (lifted/shared); rarely benefits from a Redux-class store.
    - **URL state** — state encoded in the URL: route params, search params, hash. Tools: framework router hooks (Next.js useSearchParams, React Router useSearchParams, nuqs, query-string libraries). Decision rule: 'should two people opening this URL see the same view'. Yes → URL state.
    - **Persistent state** — state that survives session/tab/browser-close boundaries: preferences, drafts, auth tokens. Tools: localStorage, IndexedDB, cookies. Decision rule: 'should this survive if the user closes the tab and reopens it'. Yes → persistent state.

    By location relative to the consumer (the architectural axis):
    - **Local state** — held inside a single component or hook; default; lowest cost.
    - **Lifted state** — moved to a common ancestor of multiple consumers; passed by props or context.
    - **Tree-scoped state** — held in React Context, visible to a sub-tree; suitable for genuinely tree-shared data (theme, auth, viewer).
    - **Global state** — held in a top-level store, accessible from anywhere; suitable for application-wide data with many consumers (rare; most state doesn't need this).
    - **External state** — held outside the React/UI tree entirely; URL, localStorage, server cache.

    By relationship to other state (the derivation axis):
    - **Primary state** — independently owned; the canonical source of its value.
    - **Derived state** — computed from primary state at the moment of read; never stored separately if storing would risk drift.
    - **Duplicated state** — the same value held in two independent locations; an anti-pattern when accidental, a deliberate choice (with synchronization) when truly required for performance.

    By temporal scope:
    - **Ephemeral state** — exists only during a single interaction.
    - **Session state** — survives within a tab/session but not across tabs.
    - **Cross-session state** — survives tab close, browser restart.
    - **Cross-device state** — synced via server to other devices the same user owns.

    By mutation ownership:
    - **Owned state** — exactly one writer; many readers.
    - **Shared state** — multiple writers; requires a coordination protocol (commit order, last-write-wins, CRDT, server reconciliation).

    By update pattern:
    - **Synchronous update** — local state mutated; UI re-renders in the same frame.
    - **Optimistic update** — local state mutated immediately; server confirmation arrives later; rollback path if rejected.
    - **Pessimistic update** — UI shows loading; awaits server confirmation; updates state on success.
    - **Background update** — server-initiated update (push, websocket, polling); UI updates without user action.
  analogy: |
    Filing in an organization, before electronic systems.

    A piece of paperwork — a customer record, a purchase order — has to live somewhere. The right location depends on who uses it and how often.

    **The desk** is local state: the document the clerk is working with right now. It moves to the desk while in use; it moves elsewhere when not. Putting every document on every clerk's desk would be absurd — the desk's purpose is the active focus of one worker.

    **The shared drawer** is lifted state: documents that two or three people on the same team look at often, kept where they all can reach. Lifting from desk to drawer is a deliberate move that the team's workflow justified; one would not move a personal note to the shared drawer "just in case."

    **The central filing cabinet** is global state: the records the entire office shares. Everyone has access, but reaching the cabinet costs more than reaching a desk or drawer; in return, the cabinet is the canonical source — when the cabinet says "this customer's address is X," that is the address, and the desk-copy is just a copy that may have gone stale.

    **The customer's own files** are server state: the canonical version lives elsewhere (with the customer, or in their bank's records), and the office holds a copy. The copy may be out of date — the customer may have moved without telling the office. The office's job is to know that its copies are caches, to know when to refresh them, to know how to detect staleness. Treating the cached copy as the canonical source produces wrong answers when reality has moved on.

    **The address on the envelope** is URL state: the part of the document's identity that travels with it, visible from outside, shareable, restorable. If the address is correct, anyone delivering the envelope can route it to the same destination; if it's not, the envelope arrives at a wrong place. Putting the address inside the envelope (where you can't see it without opening) is equivalent to hiding URL-worthy state in component state — the link is no longer shareable.

    **The safe** is persistent state: items that must survive office closure, fire, theft. The cost of putting something in the safe is high (slow to retrieve); the cost of leaving important items on a desk overnight is also high (lost or destroyed). The discipline is to identify what's safe-worthy and put exactly that there.

    The two failure modes of office filing are equally familiar in code:

    *Sprawl* — every document is on every desk, every shared drawer has fifteen people's documents, the filing cabinet contains records no one has touched in years, and nobody knows where the canonical version of anything is. Office productivity collapses. The equivalent in code is the global store that has accumulated state from every feature ever shipped.

    *Friction* — every document is in the central cabinet, and every transaction requires walking across the office, finding the right drawer, copying the relevant fields onto paper, walking back, doing the work, copying it back. Office productivity collapses. The equivalent in code is the codebase that lifts every piece of state to the top of the tree and prop-drills it back down to every consumer.

    The right office filing system uses every location for the work its location is best at. The right state management system uses every kind of state location for what each is best at.
  misconception: |
    The most common misconception is that **all state should go into a single store**. This was the early-Redux orthodoxy ("the store is the single source of truth for the application's state"), and it produced years of codebases that treated form input state, hover state, server-cached data, and route parameters all as if they belonged in the same container. The orthodoxy was a reaction to genuine pre-Redux problems (state scattered everywhere, no traceability) but overcorrected. Modern doctrine — and Dan Abramov, Redux's author, has said this explicitly — is that most state doesn't need a store; component state is fine for most cases; lift only when you need to; use server-state libraries for server data; use URL state for URL-worthy state. A single-store architecture is now the exception that requires justification, not the default.

    The second misconception is that **server state is just another piece of state**. A general-purpose store treats server data as data: you put it in, you read it out, you write actions to update it. This misses the four properties that make server state different: (1) it has a remote canonical source that can change without the client knowing, (2) multiple components asking for the same data shouldn't trigger multiple fetches, (3) it can be stale and should be refetched on focus/reconnect/interval, (4) mutations need invalidation rules that automatically refetch related queries. Server-state libraries (React Query, SWR, RTK Query) encode all four as defaults; general-purpose stores require the team to reimplement them, badly. The recurring "I built a custom Redux middleware to refetch data on focus" is the symptom of this misconception.

    The third misconception is that **prop drilling is bad**. It is sometimes annoying, but it is not the architectural failure it gets diagnosed as. Prop drilling is what data does when it flows from where it lives to where it's used; the alternative (skipping the intermediate components) costs traceability — a reader can see in the props that data is flowing through, and follow it. The right reaction to prop drilling depends on its depth and stability: drilling through three components in a stable layout is fine; drilling through seven components, three of which are external to your codebase, is a sign of misplaced ownership. Use Context for genuinely tree-shared data (theme, viewer, auth); use composition (pass children, slot patterns) to avoid drilling through intermediaries that don't care about the data; reach for a store only when the propagation cost is high *and* the alternatives don't fit.

    The fourth misconception is that **derived state should be cached**. The default for derived state is to compute it at read time, not store it. Storing it introduces the problem of when to recompute (i.e., cache invalidation, which Phil Karlton named as one of the two hard problems in computer science). React's `useMemo` exists for the case where the derivation is genuinely expensive enough to justify the memo's complexity; the cases where it is are far fewer than the cases where `useMemo` gets applied prophylactically. Derive-don't-store is the default; store derived values only with evidence of measurable cost.

    The fifth misconception is that **the URL is for routing only**. The URL is for any application state that should survive a refresh, be shareable via link, be revisitable via back-button. Filter state, sort state, pagination state, expanded-section state, current-tab state — all of these can be URL state, and treating them as URL state produces a better product (shareable views, working back-button, restorable on refresh) at a small serialization cost. Frameworks have improved the URL-state ergonomics dramatically (Next.js searchParams, React Router useSearchParams, nuqs); the right question is "why is this in component state instead of URL state" for every piece of state that affects what the user sees.

    The sixth misconception is that **optimistic updates are always better UX**. They are sometimes better — for high-confidence mutations on actions the user takes constantly (e.g., toggling a like). They are often worse — for low-confidence mutations on actions the user takes occasionally (e.g., submitting a complex form). The cost of an optimistic update is the rollback experience when the server rejects: the user saw success, then saw it un-happen, then saw an error. For mutations that rarely fail, this is fine; for mutations that frequently fail (validation-heavy, slow, conflict-prone), the user experience of "wait, did that work, oh no it didn't" is worse than the honest "loading…then success or error." The decision is per-mutation, not a global setting.

    The seventh misconception is that **Context is a state management solution**. It is not, by itself. React Context is a *propagation mechanism* — it makes state available to descendants without prop-drilling. But it doesn't optimize re-renders (every consumer re-renders on any change to the context value, by default), it doesn't slice — and so it's a poor fit when many consumers depend on different parts of a large value. Combining Context with a state library that handles re-rendering (useContextSelector, Zustand store accessed through Context, Jotai atoms) is a valid pattern; treating Context alone as a Redux replacement is a recurring source of "why does my whole app re-render."

    The eighth misconception is that **persistent state should be the default for user preferences**. It often shouldn't be. localStorage is unencrypted, synchronously-blocking, single-origin, single-device; cookies are tiny and travel with every request; IndexedDB is async but complex. Each has trade-offs. User preferences that affect server-side rendering need to be readable on the server (cookies or server-side store); preferences that should sync across devices need to live on the server; preferences that are session-scoped (last-used filter) might belong in URL state instead. The blanket move "store user prefs in localStorage" is a frequent source of weirdness — the server doesn't know about them on first render, they don't sync across the user's devices, and they don't survive a clear-storage incident.
---

# State Management

## Coverage

The architectural discipline of deciding, for each distinct piece of data an application reads or writes, where it lives, who owns it, how it propagates, and how it stays consistent. Covers the four kinds of state (server, client UI, URL, persistent), the colocation default and the lifting move, the single-source-of-truth principle, the React Query / SWR doctrine for server state, the URL as a state container, the architectural anti-patterns of premature globalization and state sprawl, optimistic-update trade-offs, and the framing of state ownership as a design contract distinct from state-library selection.

## Philosophy

State management is a series of location and ownership decisions, each of which has a correct default. The defaults are: colocate locally; lift only when needed; put server state in a server-state library; put URL-worthy state in the URL; put session-survival state in persistent storage; never have two sources of truth for one value. Most recurring frontend bugs (broken back-button, stale data, prop drilling, "why is this re-rendering," changes that don't reflect everywhere) are violations of these defaults. The discipline is not the library; it is the application of the defaults.

The discipline matters because state is not one thing — server state, client UI state, URL state, and persistent state have different lifetimes, invalidation rules, and consistency requirements. Treating them as one category (one store, one set of patterns) produces a codebase that gets all four kinds of state slightly wrong simultaneously. Treating them as four categories produces a codebase where each kind is handled by the tool best suited to it.

For agents writing or reviewing frontend code, the discipline is the framework that lets the agent reason locally — pick up a piece of state, classify it (server / client / URL / persistent), check its current location against the right location for its kind, and make targeted fixes. Without the framework, the agent pattern-matches against whatever the codebase already does, replicating existing choices without questioning whether they were correct.

## The Four Kinds Of State

| Kind | Owned by | Lifetime | Invalidation rule | Common tools |
|---|---|---|---|---|
| **Server state** | A backend | Session, with revalidation | Time-based (stale-while-revalidate); event-based (mutation, focus, reconnect); manual | React Query, SWR, RTK Query, Apollo, Server Components |
| **Client UI state** | A component or hook in the active session | Ephemeral within a render lifecycle | Recreated on unmount | useState, useReducer, Context, Zustand, Jotai |
| **URL state** | The URL itself; framework router | Until URL changes | URL navigation | useSearchParams, route params, nuqs |
| **Persistent state** | The browser's local storage | Until cleared | Manual via app code | localStorage, IndexedDB, cookies |

Each piece of state in an application falls into one of these. Misclassifying produces predictable bugs — server data in a general-purpose store loses automatic revalidation; URL-worthy state in component state breaks the back-button; persistent state in component state loses on refresh.

## The Colocation Rule (Kent C. Dodds)

> **"State should live as close as possible to where it's used."** — colocation, deliberate lifting, escalation only by need.

The decision procedure:

1. **Start local.** Put new state in the component that needs it. Use `useState` or `useReducer`.
2. **Two consumers? Lift.** When a second component needs to read or write the state, lift to the nearest common ancestor and pass by props. Track the prop's path; if it goes through ≥4 intermediate components, consider Context or composition.
3. **Tree-scoped? Context.** When the state is genuinely shared by a sub-tree (theme, viewer, auth) and the value changes rarely, use Context. Use `useContextSelector` or pattern-match to slice if many consumers depend on different parts of a large value.
4. **Application-wide with frequent fine-grained updates? Store.** When you have many components depending on many slices of a value that changes often, a state library (Zustand, Jotai, Redux Toolkit) provides selector-based subscriptions that minimize re-renders. This is the rare case, not the default.
5. **Server data? Server-state library.** Always. Don't put server data in a general-purpose store.
6. **URL-worthy? URL state.** When the state should survive refresh, be shareable, respond to back-button.

Premature jumps (skipping step 2 to land at step 4, or starting at step 4 by default) cause state sprawl. The cost of climbing the ladder later (refactoring local to lifted) is less than the cost of being too high up to start.

## The Server-State Distinction

Server state has four properties that no general-purpose store handles by default:

| Property | What it requires | Why a server-state library wins |
|---|---|---|
| **Remote canonical source** | The client cache may diverge from the server | Built-in stale-while-revalidate, refetch on focus/reconnect |
| **Deduplication** | Two components asking for the same data should fetch once | Query-key cache prevents duplicate fetches |
| **Staleness** | Old data should be replaced | Time-based and event-based invalidation |
| **Mutation-triggered invalidation** | Updating data should refresh related queries | Mutate-then-invalidate pattern by query key |

The recurring failure: using Redux/Zustand for everything, then manually building "refetch on focus" middleware, manual deduplication, manual cache expiry, and manual mutation-invalidation rules. Each one of those is correct in concept; together they reimplement React Query, badly. The disciplined answer is to use a server-state library for server data and keep the general-purpose store (if any) for genuinely client UI state.

## URL State Decision Rule

> **"Should two people opening this URL see the same view?"**

If yes, the state belongs in the URL. If no, it doesn't.

| State | URL-worthy? | Why |
|---|---|---|
| Current filter, sort, page | Yes | Sharing a link reproduces the view; back-button works |
| Selected tab in a multi-tab panel | Often yes | Bookmark-able sub-view |
| Open/closed of a sidebar | Usually no | Personal preference, not the shared view |
| Modal open/closed | Sometimes | If it's a deep-linkable modal (sharable URL), yes; if it's transient confirmation, no |
| Form values mid-edit | No | Ephemeral; shouldn't survive refresh from a stranger's link |
| Pagination cursor | Yes | Restores state on refresh; shareable position |
| Search query | Yes | Canonical "what is this user looking for" |
| Currently-hovered element | No | Ephemeral; not part of the shareable view |

## Anti-Patterns And Their Fixes

| Anti-pattern | Symptom | Fix |
|---|---|---|
| **Premature globalization** | Every new state goes into the global store; the store grows; nobody knows what's in it | Start local. Only lift on observed need. Audit the store for entries that haven't been read in N months. |
| **Server data in a general-purpose store** | Custom middleware for refetch, dedup, invalidation; bugs in each | Migrate server data to React Query/SWR/RTK Query. Keep the general store for UI state only. |
| **URL-worthy state in component state** | Back-button doesn't work; refresh loses filters; can't share a link | Move to `useSearchParams` or equivalent. Adopt nuqs for type-safe URL state. |
| **Prop drilling through 7 layers** | Tedious to maintain; refactors break | Context for tree-shared data; or composition (children-as-prop) to avoid intermediate awareness. |
| **Duplicated state (same value, two locations)** | Updates in one place don't reflect in the other | Identify the canonical owner; derive in the other location or sync explicitly. |
| **Stored derived state without need** | Caches go stale; bugs from "I updated X but Y still shows old" | Compute derived state at read time. Use `useMemo` only with measured perf evidence. |
| **Optimistic updates for high-failure mutations** | "Did that work? Oh no, it didn't" UX | Use pessimistic (loading then success/error) for low-confidence mutations; optimistic for high-confidence only. |
| **localStorage for everything user-prefs** | Server doesn't know on first render; no cross-device sync | Server-side store for prefs that affect SSR; URL state for session-scoped prefs; localStorage only when local-only is correct. |

## Verification

After applying this skill, verify:
- [ ] Every distinct piece of state in scope has been classified into one of the four kinds (server / client UI / URL / persistent).
- [ ] Server data is held by a server-state library (React Query, SWR, RTK Query, Apollo, Server Components), not a general-purpose store.
- [ ] State that should survive refresh, be shareable, or respond to back-button is in the URL.
- [ ] No piece of state is duplicated (same value held in two independent locations) without an explicit synchronization mechanism and a recorded reason.
- [ ] Local state stays local; lifts have a documented justification.
- [ ] Context use is limited to genuinely tree-scoped data; large frequently-changing values that go through Context have been migrated to a store with selector-based subscriptions.
- [ ] Derived state is computed at read time; stored derived values have measured performance evidence.
- [ ] Optimistic updates are limited to high-confidence mutations; rollback paths exist where they are used.
- [ ] Persistent state choices match what the data actually needs (localStorage / IndexedDB / cookies / server-stored prefs).
- [ ] The state model is documented enough that a new contributor can answer "where does X live" in under a minute.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Choosing between Redux, Zustand, Jotai, Recoil, MobX, etc. | Library docs + framework conventions | Library choice is a tactical decision below this skill |
| Designing the JSON shape of an API endpoint | `api-design` | api-design owns the external request/response surface; this skill owns where the response lives once it arrives |
| Modeling the finite-state transitions of a workflow | `state-machine-modeling` | state-machine-modeling owns the workflow representation; this skill owns the location decision |
| Encoding/decoding URL search params, route params, hash | `url-state-management` | url-state-management owns the encoding patterns; this skill owns the upstream "should it be in the URL" decision |
| Building distributed state across services | `replication-patterns` | replication-patterns owns multi-replica consistency; this skill applies to single-client state |
| Deciding what runs on server vs client | `client-server-boundary` | client-server-boundary owns the code-location boundary; this skill owns the state-location decision orthogonal to it |
| Building the cache infrastructure of a server-state library | the library itself (React Query docs, etc.) | The library is the implementation of what this skill recommends; don't reimplement |
| Concurrency control across multiple users editing the same record | (no direct skill — out of scope) | Conflict resolution mechanisms (versioning, OT, CRDT) are a separate concern |

## Key Sources

- Dodds, K. C. (2019). ["Application State Management with React"](https://kentcdodds.com/blog/application-state-management-with-react) and ["State Colocation will make your React app faster"](https://kentcdodds.com/blog/state-colocation-will-make-your-react-app-faster). Foundational essays on the colocation rule and the lift-when-needed discipline; widely cited as the modern doctrine successor to Redux-by-default.
- TanStack. [React Query overview and motivation](https://tanstack.com/query/latest/docs/framework/react/overview). The canonical articulation of the server-state distinction: "React Query is often described as the missing data-fetching library for React, but in more technical terms, it makes fetching, caching, synchronizing and updating server state in your React applications a breeze."
- Vercel. [SWR docs](https://swr.vercel.app/). The first widely-adopted server-state library to make stale-while-revalidate the default mental model in React.
- Abramov, D. (2019). ["You Might Not Need Redux"](https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367) and follow-ups. Redux's author articulating that Redux is not always the right answer; foundational for the modern "store-by-need, not by-default" doctrine.
- React Team. [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components) and [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure). The official React docs' framing of lifting state up, single source of truth, and avoiding state duplication.
- Karlton, P. (attributed). "There are only two hard things in Computer Science: cache invalidation and naming things." The canonical statement of why server-state caching is not trivial — its difficulty is one of the two named hardest problems in the field.
- Marquardt, J. (2024). ["URL as the state of your app"](https://www.epicreact.dev/url-state). Modern articulation of the URL-as-state-container principle in the App Router era.
- Pelle, M. (2024). [nuqs documentation](https://nuqs.47ng.com/). Type-safe URL state library; reference implementation of the URL-as-state pattern with serialization, parsing, and React integration.
- Fowler, M. (2003). *Patterns of Enterprise Application Architecture*. Addison-Wesley. The classic treatment of the Service Layer / Data Mapper / Identity Map / Unit of Work patterns; the Identity Map pattern is the original articulation of "deduplicate fetches by entity key" that server-state libraries operationalize.
