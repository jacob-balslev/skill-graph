---
name: suspense-patterns
description: "Use when designing or reviewing React Suspense usage: where to place Suspense boundaries to control loading granularity, the difference between Suspense for data fetching and Suspense for code splitting, how Suspense interacts with Server Components for streaming HTML, how error boundaries pair with Suspense (and why they must be distinct components), the relationship between Suspense and React's transition APIs (useTransition, startTransition), and the design rules that prevent waterfall fetches, layout shift, and SEO regressions. Covers React 18+ and 19's `use` hook for unwrapping Promises in Client Components. Do NOT use for general React rendering strategy choice (use rendering-models), for the underlying hook primitives (use hooks-patterns), for streaming protocols beyond Suspense (use streaming-architecture), or for Server Component design (use server-components-design)."
license: MIT
allowed-tools: Read Grep
metadata:
  schema_version: "8"
  version: "1.0.0"
  subject: frontend-ui
  deployment_target: portable
  taxonomy_domain: engineering/frontend
  owner: skill-graph-maintainer
  freshness: "2026-05-16"
  drift_check: "{\"last_verified\":\"2026-05-16\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  comprehension_state: present
  stability: experimental
  keywords: "[\"React Suspense\",\"Suspense boundary\",\"streaming HTML\",\"loading.tsx Next.js\",\"useTransition\",\"startTransition\",\"use hook React 19\",\"error boundary with Suspense\",\"Suspense waterfall\",\"parallel data fetching\"]"
  triggers: "[\"where should I put the Suspense boundary\",\"why is my page waiting for the slowest query\",\"how do I show partial loading states\",\"Suspense vs loading.tsx\",\"do I need useTransition here\",\"error boundary not catching\",\"data is waterfalling instead of parallel\"]"
  examples: "[\"design a dashboard that streams three independent widgets in as their data resolves, with skeleton fallbacks for each\",\"decide whether a tab switch should use useTransition or a top-level Suspense fallback\",\"diagnose why a Suspense boundary is showing its fallback on every prop change\",\"pair a Suspense boundary with an ErrorBoundary so failed fetches show an error UI while successful ones stream in\"]"
  anti_examples: "[\"choose between Server Components and Client Components (use server-components-design)\",\"design the dependency array for a useEffect that fetches data (use hooks-patterns)\",\"pick the streaming protocol for an LLM response (use streaming-architecture)\",\"decide between SSR and SSG for a marketing page (use rendering-models)\",\"design the streaming protocol itself — SSE, HTTP/2, chunked transfer-encoding (use streaming-architecture)\"]"
  relations: "{\"related\":[\"server-components-design\",\"hooks-patterns\",\"streaming-architecture\",\"rendering-models\"],\"boundary\":[{\"skill\":\"server-components-design\",\"reason\":\"server-components-design owns the discipline of which work runs on the server side of the RSC boundary; suspense-patterns owns the orthogonal discipline of where to place Suspense boundaries within a tree (RSC or Client).\"},{\"skill\":\"hooks-patterns\",\"reason\":\"hooks-patterns covers state, effects, and the closure model on Client Components; suspense-patterns covers the boundary-level loading-state model that operates on whole subtrees.\"}],\"verify_with\":[\"code-review\",\"rendering-models\"]}"
  mental_model: "|"
  purpose: "|"
  boundary: "|"
  analogy: "Suspense boundaries are to React's component tree what a restaurant's seating policy is to a multi-course meal — the policy decides whether courses arrive together (boundary around the whole meal, everyone waits for the slowest dish) or course-by-course (boundary per dish, each appears when ready). The component (the kitchen) just signals 'this course needs more time'; the boundary (the maître d') decides who waits for what and what placeholder shows in the meantime."
  misconception: "|"
  concept: "{\"definition\":\"A Suspense boundary is a React component that catches a thrown Promise (or, in RSC, an unresolved async render) from anywhere in its descendant tree and shows a fallback UI until the Promise resolves. It is a declarative loading-state mechanism: the consuming component requests data without knowing whether it is loading, and the ancestor Suspense boundary handles the rendering branch.\",\"mental_model\":\"|\",\"purpose\":\"|\",\"boundary\":\"|\",\"taxonomy\":\"|\",\"analogy\":\"|\",\"misconception\":\"|\"}"
  structural_verdict: PASS
  truth_verdict: PASS
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/frontend-ui/suspense-patterns/SKILL.md
---

# Suspense Patterns

## Coverage

The discipline of placing and pairing Suspense boundaries: how a Suspense boundary catches a thrown Promise (or unresolved async RSC) and renders a fallback, how boundary *placement* determines what waits for what, how Suspense composes with error boundaries (and why they cannot be the same component), how `useTransition` and `startTransition` change the boundary's behavior on updates, how Suspense for code splitting (`React.lazy`) and Suspense for data fetching share the same mechanism, and how Next.js App Router's `loading.tsx` is a sugar for a route-level Suspense boundary. The skill covers React 18+ semantics throughout and the React 19 `use` hook that lets Client Components unwrap Promises directly.

## Philosophy

The classic React loading-state pattern was conditional rendering: each component owned an `isLoading` flag, returned a spinner or skeleton, and re-rendered when its data resolved. That pattern is local and imperative. It puts every component in the position of deciding *how* to communicate "I'm waiting" and *where* in its render output the placeholder goes. It does not compose; two sibling components loading in parallel produce two independent spinners with no coordinated layout.

Suspense inverts the responsibility. The component that needs data *throws* a Promise (or, in the case of RSC, the renderer encounters an unresolved `await`). The Suspense boundary catches the throw and renders a fallback for the entire subtree. The component itself only has to declare "I need this data" — never "I might not have it yet." The boundary, declared once, owns the placeholder UI for everything below it. The semantics compose: nested Suspense boundaries let outer fallbacks resolve first while inner sections continue to wait.

This is a different mental model than try/catch for asynchronicity. The thrown Promise is not an error — it is a signal that "this render cannot complete until this Promise resolves, please show the nearest Suspense fallback and try again when it does." React reconciles the wait at the boundary; the component code reads as if the data were already there.

The design discipline of Suspense is therefore about **boundary placement**, not about loading-state plumbing. The questions are: *what content should appear together?* (one boundary around them all) and *what content should stream in independently?* (separate boundaries around each). The boundary is a hierarchy decision in the UI, not a state machine inside a component.

## Boundary Placement — The Central Design Question

A Suspense boundary catches *any* throw from *any* descendant. The boundary's job is to define a *grouping*: "these things appear together, and either they all show or the fallback shows."

Three placement strategies, each correct in different contexts:

**1. Page-level boundary.** One boundary near the root. The whole page shows a fallback until everything inside resolves.

```tsx
<Suspense fallback={<PageSkeleton />}>
  <Header />
  <Dashboard />
  <Footer />
</Suspense>
```

- **Use when**: the page's value is only meaningful when complete (an onboarding flow, a checkout summary).
- **Cost**: the slowest part of the page determines the page's perceived load time.

**2. Section-level boundaries.** A boundary around each independent section.

```tsx
<Header />
<Suspense fallback={<ChartSkeleton />}>
  <Chart />        {/* slow query */}
</Suspense>
<Suspense fallback={<TableSkeleton />}>
  <Table />        {/* faster query */}
</Suspense>
<Footer />
```

- **Use when**: each section is independently meaningful and can stream in separately.
- **Cost**: more visible layout activity as sections pop in.

**3. Leaf-level boundaries.** A boundary on each loading-aware component itself.

```tsx
<UserList>
  {users.map(user => (
    <Suspense key={user.id} fallback={<UserCardSkeleton />}>
      <UserCard userId={user.id} />
    </Suspense>
  ))}
</UserList>
```

- **Use when**: you have many parallel slow operations whose orderings don't matter.
- **Cost**: many small skeletons, potential layout thrash.

The wrong placement is usually too coarse: a single boundary near the page root waits for everything, defeating the streaming benefit. Less commonly, a boundary too fine produces a busy "many spinners" UI. The right granularity matches the page's actual visual hierarchy.

## Parallel vs Waterfall Fetching

Suspense alone does not prevent waterfalls. A waterfall is when fetch B starts only after fetch A resolves, sequentially, when both could have started together.

```tsx
// WATERFALL — parent awaits, then child fetches
async function ParentBad() {
  const a = await fetchA()
  return <ChildBad a={a} />   // ChildBad starts fetch B only after this point
}

// PARALLEL — both fetches kicked off at the same render level
async function ParentGood() {
  const aPromise = fetchA()
  const bPromise = fetchB()
  const [a, b] = await Promise.all([aPromise, bPromise])
  return <Child a={a} b={b} />
}

// SUSPENSE-PARALLEL — siblings under separate Suspense boundaries
function ParentStreaming() {
  return (
    <>
      <Suspense fallback={<A_Skeleton />}><A /></Suspense>
      <Suspense fallback={<B_Skeleton />}><B /></Suspense>
    </>
  )
}
```

The pattern: kick off all independent fetches at the same level of the tree, then either `await Promise.all` if you need both before rendering, or wrap each child in its own Suspense boundary if they can stream in independently. A child that fetches its own data is fine — *as long as the parent doesn't `await` something the child depends on first*. Tree depth correlates with waterfall risk; flat trees with siblings starting requests in parallel correlate with optimal streaming.

## Suspense and Error Boundaries

A Suspense boundary catches *thrown Promises*, not thrown Errors. An error boundary catches *thrown Errors*, not Promises. They are different React mechanisms that solve adjacent problems and **must be different components**, but they almost always pair together.

The canonical pair:

```tsx
<ErrorBoundary fallback={<ErrorUI />}>
  <Suspense fallback={<LoadingUI />}>
    <DataLoadingComponent />
  </Suspense>
</ErrorBoundary>
```

Order matters:

- ErrorBoundary outside Suspense: the error UI replaces the entire group including any Suspense boundaries inside. A failed fetch shows the error UI; the loading state is no longer visible.
- Suspense outside ErrorBoundary: while loading, the Suspense fallback shows. If the fetch fails, the Suspense fallback unmounts and the error UI takes its place inside.

Most applications want ErrorBoundary on the outside so a failure replaces the loading state cleanly. Putting ErrorBoundary on the inside is appropriate when the loading state should remain visible and only a small portion of the subtree should swap to error UI.

React does not ship a built-in `ErrorBoundary` for function components (as of React 19). Use `react-error-boundary` (Kent C. Dodds) or implement a class component. Server Components' errors are caught by Next.js's `error.tsx` file, which is essentially a route-scoped ErrorBoundary.

## `useTransition`, `startTransition`, and "Stale" Boundaries

By default, a Suspense boundary unmounts its children and shows the fallback whenever any descendant throws a Promise — even on subsequent updates (e.g., a tab switch that triggers a new fetch). This causes the "spinner flicker" anti-pattern: every interaction shows the loading state.

`useTransition` (and `startTransition`) mark an update as non-urgent. React holds the previous render visible while the new render's data is loading, instead of unmounting to the fallback:

```tsx
function TabPanel({ activeTab }) {
  return <Content tab={activeTab} />  // suspends on tab change
}

function Tabs() {
  const [tab, setTab] = useState('a')
  const [isPending, startTransition] = useTransition()
  
  return (
    <>
      <button onClick={() => startTransition(() => setTab('b'))}>
        {isPending ? 'Loading…' : 'Tab B'}
      </button>
      <Suspense fallback={<Skeleton />}>
        <TabPanel activeTab={tab} />
      </Suspense>
    </>
  )
}
```

On the *first* render, the Suspense fallback shows (no previous render to keep). On *subsequent* tab changes triggered through `startTransition`, the previous tab's content stays mounted while the new tab loads, and `isPending` indicates the transition is in flight. The fallback only shows when there is no prior committed render to preserve.

Design rule: wrap user-initiated updates that may trigger Suspense in `startTransition` to avoid flickering fallbacks. Do not wrap initial-load updates in `startTransition`, since there is no previous content to preserve and the boundary will simply not show the fallback when you want it to.

## Suspense in RSC and Next.js App Router

In an RSC tree, Suspense controls streaming HTML granularity. The server flushes everything outside the boundary first, then streams in each boundary's content as it resolves:

```tsx
// app/dashboard/page.tsx — Server Component
export default async function Dashboard() {
  return (
    <>
      <Header />                       {/* renders and flushes immediately */}
      <Suspense fallback={<Skeleton />}>
        <SlowSection />                {/* streams in when data resolves */}
      </Suspense>
    </>
  )
}
```

Next.js App Router provides `loading.tsx` as sugar for a route-level Suspense boundary. A file at `app/dashboard/loading.tsx` is the fallback for an implicit `<Suspense>` wrapping `app/dashboard/page.tsx`. This is convention; identical semantics could be expressed with an explicit `<Suspense>` inside a layout.

The interaction between RSC and Suspense is one of the biggest design wins of the App Router: server-rendered content can stream in chunks without giving up server-side rendering for the initial-paint content. The discipline of `server-components-design` (where to draw the server/client boundary) and `suspense-patterns` (where to draw the streaming boundary) compose together — they are orthogonal axes on the same tree.

See `server-components-design` for the discipline of *what* runs on the server side of the RSC boundary; this skill covers *how to chunk the streaming output of that server tree*.

## React 19's `use` Hook

React 19 adds `use(promise)` — a hook (with relaxed rules: can be called conditionally) that unwraps a Promise during render. Inside a Suspense boundary, `use` is how Client Components participate in data-fetching Suspense without throwing manually:

```tsx
'use client'
import { use } from 'react'

function Comments({ commentsPromise }) {
  const comments = use(commentsPromise)   // suspends until resolved
  return <ul>{comments.map(c => <li key={c.id}>{c.text}</li>)}</ul>
}

// In a Server Component:
export default function Post() {
  const commentsPromise = fetchComments()    // not awaited — passed as Promise
  return (
    <Suspense fallback={<Spinner />}>
      <Comments commentsPromise={commentsPromise} />
    </Suspense>
  )
}
```

The Promise is created in the Server Component (which is free to start the fetch eagerly), passed across the boundary as a serializable Promise, and unwrapped in the Client Component via `use`. The Server Component doesn't block on the fetch; the Suspense boundary in the Server tree streams in the resolved content as soon as the Promise resolves on the client.

Before React 19, Client Components could not directly consume Suspense for data fetching without a library that implements the throw-a-Promise convention (React Query's Suspense mode, SWR with `suspense: true`, Relay). `use` makes the pattern first-class.

## Common Anti-Patterns

| Anti-pattern | Why it's wrong | Fix |
|---|---|---|
| One Suspense boundary near the page root | Fallback replaces the entire page even though most is fast | Move boundaries closer to the slow data, one per independent slow section |
| ErrorBoundary inside Suspense | Loading state lingers when fetch fails | Put ErrorBoundary outside Suspense (the common case) |
| Awaiting parent data, then child fetches its own | Sequential waterfall | Kick off both fetches at the same level, pass Promises down or use Promise.all |
| Suspense fallback shows on every interaction | Fallback flickers on updates | Wrap user-initiated updates in `startTransition` / `useTransition` |
| Skeleton fallback that doesn't match the real content's layout | Layout shift when content arrives | Match skeleton dimensions to the real content (use same width/height/padding) |
| Both Suspense and an `isLoading` prop in the same component | Duplicate loading-state plumbing | Pick one — Suspense throws or local state, not both |
| Suspense around the whole `app/` layout | Every navigation shows the page-level fallback | Place fallback at the route segment level (`loading.tsx` per segment) |
| Reading `searchParams` in a Server Component without Suspense | Whole route becomes dynamic with no streaming | Wrap the searchParams-reading subtree in Suspense so the rest can stream as static |

## Verification

After applying this skill, verify:

- [ ] Every slow data dependency is wrapped in a Suspense boundary co-located near the data, not at a far ancestor.
- [ ] Sibling sections that can stream independently have their own Suspense boundaries.
- [ ] Each Suspense boundary has a matching ErrorBoundary; their nesting order matches the desired failure-mode UI.
- [ ] User-initiated updates that may trigger Suspense are wrapped in `startTransition` to prevent fallback flicker.
- [ ] Skeleton fallbacks match real-content dimensions to avoid layout shift.
- [ ] No `isLoading` flag duplicates work that the Suspense boundary already handles.
- [ ] Parallel fetches are kicked off as siblings (not parent/child), avoiding waterfalls.
- [ ] In Next.js App Router, `loading.tsx` exists at the route segment that owns the slow data — not at a parent segment that includes fast content.

## Grounding Sources

- React docs — [`<Suspense>`](https://react.dev/reference/react/Suspense). The official reference for the boundary and its semantics.
- React docs — [`useTransition`](https://react.dev/reference/react/useTransition) and [`startTransition`](https://react.dev/reference/react/startTransition). The transition APIs that prevent fallback flicker.
- React docs — [`use`](https://react.dev/reference/react/use). The React 19 Promise-unwrapping hook for Client Components.
- React 18 working group — [Suspense in React 18 design discussion](https://github.com/reactwg/react-18/discussions/47). The semantics and edge cases of the React 18 Suspense rewrite.
- Next.js docs — [Loading UI and Streaming](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming) and [`loading.tsx`](https://nextjs.org/docs/app/api-reference/file-conventions/loading) conventions. The route-segment Suspense sugar.
- Dodds, K. C. — [react-error-boundary](https://github.com/bvaughn/react-error-boundary). The de facto error-boundary library for function components.
- React docs — [Streaming](https://react.dev/reference/react-dom/server/renderToReadableStream). Server-side streaming primitives that Suspense rides on top of.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Choosing between SSR, SSG, ISR, and CSR rendering strategies | `rendering-models` | rendering-models owns the strategic decision; suspense-patterns is an in-tree mechanism that works with several of those strategies. |
| Designing which work runs as Server Components vs Client Components | `server-components-design` | server-components-design owns the server/client tree split; suspense-patterns is orthogonal — Suspense boundaries can live in either kind of component. |
| Hook discipline on Client Components (Rules of Hooks, useEffect, useMemo) | `hooks-patterns` | hooks-patterns covers the in-component logic primitives; Suspense operates at the tree level above hooks. |
| Streaming protocols broader than React Suspense (SSE, WebSocket, AI streaming) | `streaming-architecture` | streaming-architecture is the general protocol concern; React Suspense streaming is one application of the broader streaming toolkit. |
| Error-handling patterns (try/catch, error boundaries in isolation) | `code-review` and `react-error-boundary` library docs | This skill covers Suspense+ErrorBoundary *pairing*; isolated error-boundary discipline lives elsewhere. |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `frontend-ui`
- Deployment: `portable`
- Domain: `engineering/frontend`

**When to use**
- design a dashboard that streams three independent widgets in as their data resolves, with skeleton fallbacks for each
- decide whether a tab switch should use useTransition or a top-level Suspense fallback
- diagnose why a Suspense boundary is showing its fallback on every prop change
- pair a Suspense boundary with an ErrorBoundary so failed fetches show an error UI while successful ones stream in
- Triggers: `where should I put the Suspense boundary`, `why is my page waiting for the slowest query`, `how do I show partial loading states`, `Suspense vs loading.tsx`, `do I need useTransition here`, `error boundary not catching`, `data is waterfalling instead of parallel`

**Not for**
- choose between Server Components and Client Components (use server-components-design)
- design the dependency array for a useEffect that fetches data (use hooks-patterns)
- pick the streaming protocol for an LLM response (use streaming-architecture)
- decide between SSR and SSG for a marketing page (use rendering-models)
- design the streaming protocol itself — SSE, HTTP/2, chunked transfer-encoding (use streaming-architecture)
- Owned by `server-components-design`: the discipline of which work runs on the server side of the RSC boundary
- Owned by `hooks-patterns`

**Related skills**
- Verify with: `code-review`, `rendering-models`
- Related: `server-components-design`, `hooks-patterns`, `streaming-architecture`, `rendering-models`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: Suspense boundaries are to React's component tree what a restaurant's seating policy is to a multi-course meal — the policy decides whether courses arrive together (boundary around the whole meal, everyone waits for the slowest dish) or course-by-course (boundary per dish, each appears when ready). The component (the kitchen) just signals 'this course needs more time'; the boundary (the maître d') decides who waits for what and what placeholder shows in the meantime.
- Common misconception: |

**Lifecycle & audit status**
- Stability: `experimental`
- Freshness: `2026-05-16`
- Eval state: `unverified`
- Routing eval: `absent`
- Audit status: structural PASS, truth PASS, comprehension UNVERIFIED, application UNVERIFIED
- Last audited: `2026-05-28`

**Provenance**
- version 1.0.0, schema v8, owner `skill-graph-maintainer`
- Keywords: `React Suspense`, `Suspense boundary`, `streaming HTML`, `loading.tsx Next.js`, `useTransition`, `startTransition`, `use hook React 19`, `error boundary with Suspense`, `Suspense waterfall`, `parallel data fetching`

<!-- skill-graph-context:end -->
