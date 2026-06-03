---
name: state-management
description: "Use when deciding where state lives, how it propagates, and how it composes: local component state vs lifted/shared state vs application state, server state vs client state, URL as state, persistent state, derived state, and the cross-cutting decision of who owns which piece. Covers state colocation, lifting up, derivation vs duplication, single source of truth, optimistic updates, server-state cache invalidation (React Query/SWR model), URL state for deep-linking, and anti-patterns like prop-drilling, state sprawl, and global-state-by-default. Do NOT use for specific state library choice (Redux vs Zustand — tactical), data fetching mechanics (use api-design or rendering-models), client/server boundary (use client-server-boundary), distributed system state (use replication-patterns), or finite state machines (use state-machine-modeling). Do NOT use for implement a specific Redux reducer (tactical, library-specific). Do NOT use for design the JSON shape of an API response (use api-design)."
license: MIT
allowed-tools: Read Grep
metadata:
  subject: frontend-ui
  deployment_target: portable
  scope: "Portable frontend state-placement discipline for deciding where each piece of application data lives, who owns it, how it propagates, and how it stays consistent across changes. Teaches the four-kinds classification (server state, client UI state, URL state, persistent state), the colocation-and-lifting decision path, single source of truth, server-state cache invalidation, URL state for deep-linking, and anti-pattern detection for prop drilling, duplicated state, state sprawl, and global-state-by-default. Excludes tactical library choice, API surface design, client/server execution-boundary decisions, distributed-system replication, and finite-state workflow modeling."
  taxonomy_domain: engineering/frontend
  stability: experimental
  keywords: "[\"state management\",\"state colocation\",\"lifting state\",\"state derivation\",\"single source of truth\",\"server state\",\"client state\",\"URL state\",\"persistent state\",\"ephemeral state\"]"
  triggers: "[\"where should this state live\",\"should this be in component state or global\",\"I have state across multiple routes\",\"this prop is drilled through 5 components\",\"is this server state or client state\",\"should this be in the URL\"]"
  examples: "[\"decide where the filter/sort/page state for a data table should live\",\"decide whether a piece of state should be in the URL, component state, or persistent storage\",\"diagnose whether a piece of duplicated state is a real performance need or accidental sprawl\",\"structure state for a form that spans multiple steps and survives navigation\"]"
  anti_examples: "[\"implement a specific Redux reducer (tactical, library-specific)\",\"design the JSON shape of an API response (use api-design)\",\"model the state transitions of a multi-step workflow (use state-machine-modeling)\",\"configure HTTP cache headers on the server (use rendering-models or http-semantics)\"]"
  relations: "{\"related\":[\"rendering-models\",\"client-server-boundary\",\"frontend-architecture\",\"api-design\",\"state-machine-modeling\"],\"boundary\":[{\"skill\":\"client-server-boundary\",\"reason\":\"client-server-boundary owns the line between code-that-runs-where (server components, client components, the serialization boundary); this skill owns the orthogonal question of which side owns which piece of state. They compose: the boundary skill says what code runs where; this skill says what state lives where.\"},{\"skill\":\"rendering-models\",\"reason\":\"rendering-models owns the question of when content is generated (SSR, RSC, CSR, ISR); this skill owns the question of where data backing that content lives. The two intersect in server state: data fetched on the server that the client may still need to cache, invalidate, or localize.\"}],\"verify_with\":[\"rendering-models\",\"api-design\",\"state-machine-modeling\"]}"
  mental_model: "|"
  purpose: "|"
  boundary: "|"
  analogy: "State management is to a frontend application what addressing is to a postal system — you do not ask 'should this letter exist?', you ask 'where does it live?', and the right destination depends entirely on the letter's kind: a registered package (server data with provable delivery), a postcard (URL state, public on the back), a private letter (client UI state, inside an envelope), a deed (persistent state, kept in the safe). One mailbox for everything produces predictable failures."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/frontend-ui/state-management/SKILL.md
  skill_graph_export_description_projection: anti_examples+boundary
  skill_graph_export_description_projection_truncated: "true"
---

## Concept of the skill

**What it is:** State management is the frontend architecture discipline of deciding where each changing value lives, who owns it, how it propagates to consumers, and how it stays consistent over time.

**Mental model:** State is at least four kinds with different owners and lifetimes: server state, client UI state, URL state, and persistent state. Classify the value first, then choose the narrowest owner and tool that fits its lifetime and invalidation needs.

**Why it exists:** Most recurring frontend state bugs come from putting the right value in the wrong place: server data in a general-purpose store, URL-worthy state in component state, duplicated values in two owners, or global stores used before local state has proven insufficient.

**What it is NOT:** It is not tactical state-library selection, API schema design, finite-state workflow modeling, distributed replication, or the client/server execution-boundary decision. Those skills can compose with this one after the state kind and owner are clear.

**Adjacent concepts:** Rendering models, client-server boundary, frontend architecture, API design, state-machine modeling, server-state caching, and URL state.

**One-line analogy:** State management is like addressing mail: each item needs the right destination for its kind, and one mailbox for everything creates predictable delivery failures.

**Common misconception:** The wrong starting question is "which state library should hold this?" The right first question is "what kind of state is this, who owns it, and how long should it live?"

# State Management

## Coverage

The architectural discipline of deciding, for each distinct piece of data an application reads or writes, where it lives, who owns it, how it propagates, and how it stays consistent. Covers the four kinds of state (server, client UI, URL, persistent), the colocation default and the lifting move, the single-source-of-truth principle, the React Query / SWR doctrine for server state, the URL as a state container, the architectural anti-patterns of premature globalization and state sprawl, optimistic-update trade-offs, and the framing of state ownership as a design contract distinct from state-library selection.

## Philosophy of the skill

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

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `frontend-ui`
- Deployment: `portable`
- Domain: `engineering/frontend`
- Scope: Portable frontend state-placement discipline for deciding where each piece of application data lives, who owns it, how it propagates, and how it stays consistent across changes. Teaches the four-kinds classification (server state, client UI state, URL state, persistent state), the colocation-and-lifting decision path, single source of truth, server-state cache invalidation, URL state for deep-linking, and anti-pattern detection for prop drilling, duplicated state, state sprawl, and global-state-by-default. Excludes tactical library choice, API surface design, client/server execution-boundary decisions, distributed-system replication, and finite-state workflow modeling.

**When to use**
- decide where the filter/sort/page state for a data table should live
- decide whether a piece of state should be in the URL, component state, or persistent storage
- diagnose whether a piece of duplicated state is a real performance need or accidental sprawl
- structure state for a form that spans multiple steps and survives navigation
- Triggers: `where should this state live`, `should this be in component state or global`, `I have state across multiple routes`, `this prop is drilled through 5 components`, `is this server state or client state`, `should this be in the URL`

**Not for**
- implement a specific Redux reducer (tactical, library-specific)
- design the JSON shape of an API response (use api-design)
- model the state transitions of a multi-step workflow (use state-machine-modeling)
- configure HTTP cache headers on the server (use rendering-models or http-semantics)
- Owned by `client-server-boundary`: the line between code-that-runs-where (server components, client components, the serialization boundary)
- Owned by `rendering-models`: the question of

**Related skills**
- Verify with: `rendering-models`, `api-design`, `state-machine-modeling`
- Related: `rendering-models`, `client-server-boundary`, `frontend-architecture`, `api-design`, `state-machine-modeling`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: State management is to a frontend application what addressing is to a postal system — you do not ask 'should this letter exist?', you ask 'where does it live?', and the right destination depends entirely on the letter's kind: a registered package (server data with provable delivery), a postcard (URL state, public on the back), a private letter (client UI state, inside an envelope), a deed (persistent state, kept in the safe). One mailbox for everything produces predictable failures.
- Common misconception: |

**Keywords**
- `state management`, `state colocation`, `lifting state`, `state derivation`, `single source of truth`, `server state`, `client state`, `URL state`, `persistent state`, `ephemeral state`

<!-- skill-graph-context:end -->
