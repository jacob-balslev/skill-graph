---
name: server-components-design
description: "Use when designing or reviewing React Server Components: what an RSC can do (async, data fetching, server-only imports) versus what it cannot (state, effects, event handlers, browser APIs), where to draw the server/client boundary in the tree, how to keep private data from leaking across that boundary, and how RSC composes with Suspense to stream content without a separate API layer. Covers Next.js App Router as the canonical implementation, but the discipline is framework-agnostic. Do NOT use for the 'use client' directive mechanics (use client-server-boundary), hook discipline on Client Components (use hooks-patterns), rendering strategy choice (use rendering-models), the server-action mutation surface (use server-actions-design), or the wider Suspense discipline (use suspense-patterns). Do NOT use for add a click handler to an existing component (use hooks-patterns and client-server-boundary). Do NOT use for design the public API for a third-party integration (use api-design)."
license: MIT
allowed-tools: Read Grep
metadata:
  subject: frontend-engineering
  public: "true"
  scope: "Designing and reviewing React Server Components — what an RSC can do (async, direct data access, server-only imports) versus what it cannot (state, effects, event handlers, browser APIs), where to draw the server/client boundary in the component tree, how to keep private data from leaking across that boundary (DTOs, a Data Access Layer, the server-only package, taint APIs), how to fetch without waterfalls (request memoization, parallel reads, the preload pattern), how RSC composes with Suspense to stream content without a separate API layer, and the read-path caching/freshness decision (Next.js Cache Components / 'use cache' / Partial Prerendering). Next.js App Router is the canonical implementation; the discipline is framework-agnostic. Excludes the 'use client'/'use server' directive serialization mechanics (client-server-boundary), Client Component hook discipline (hooks-patterns), the SSR/SSG/ISR/CSR strategy choice (rendering-models), the write-path mutation surface (server-actions-design), and the wider Suspense orchestration (suspense-patterns)."
  taxonomy_domain: engineering/frontend
  stability: experimental
  keywords: "[\"React Server Components\",\"RSC\",\"Next.js App Router\",\"async components\",\"server-side data fetching\",\"streaming RSC\",\"server/client component tree\",\"RSC payload\",\"Data Access Layer DTO\",\"Cache Components use cache\"]"
  triggers: "[\"should this be a Server Component or a Client Component\",\"can I fetch data here\",\"why can't I use useState in this file\",\"how does data move from server to client\",\"do I need an API route\",\"why is the bundle so large\",\"how do I stop private data leaking to the client\",\"can I pass a Promise to a Client Component\",\"why are params and searchParams promises\",\"should this data be cached with use cache\",\"why is loading.tsx not showing\"]"
  examples: "[\"decide whether a dashboard widget should be a Server Component (fetches and renders) or a Client Component (interactive)\",\"explain why a Server Component cannot pass a function as a prop to a Client Component\",\"design a page where the layout fetches user data once and child widgets fetch their own data, with Suspense streaming each in\",\"audit a component tree for unnecessary 'use client' boundaries that pull static rendering into the bundle\",\"review a Server Component that passes a whole database row to a Client Component and decide what to strip\"]"
  anti_examples: "[\"add a click handler to an existing component (use hooks-patterns and client-server-boundary)\",\"choose between SSR and SSG for a marketing page (use rendering-models)\",\"build the form-submission mutation flow (use server-actions-design)\",\"design the public API for a third-party integration (use api-design)\",\"design nested error boundaries and transition-driven fallback orchestration (use suspense-patterns)\"]"
  relations: "{\"related\":[\"client-server-boundary\",\"rendering-models\",\"hooks-patterns\",\"streaming-architecture\",\"suspense-patterns\",\"server-actions-design\"],\"boundary\":[{\"skill\":\"client-server-boundary\",\"reason\":\"client-server-boundary owns the serialization-and-directive mechanics of the boundary itself ('use client', what can cross, RSC payload format); server-components-design owns the discipline of which work belongs on the server side of that boundary.\"},{\"skill\":\"rendering-models\",\"reason\":\"rendering-models owns the strategic decision among SSR, SSG, ISR, and CSR; server-components-design operates within the App Router / RSC paradigm and is one rendering mode among several.\"},{\"skill\":\"hooks-patterns\",\"reason\":\"hooks-patterns covers state and effect discipline on Client Components; Server Components cannot use those primitives at all, so the two skills cover disjoint surfaces.\"},{\"skill\":\"server-actions-design\",\"reason\":\"server-actions-design owns the write path (mutations, 'use server' functions, form actions, re-authorization inside the action); server-components-design owns the read path (components that fetch and render data). They share the server/client boundary infrastructure but are disjoint design surfaces.\"}],\"verify_with\":[\"code-review\",\"rendering-models\"]}"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "A Server Component is to a React tree what a printed page is to a book — the typesetter (server) sets the lead, presses the ink, and ships the printed page (RSC payload); the reader's table lamp (Client Component) is wired and switchable at the reader's end. You do not ship the typesetter to the reader's living room, and you do not ship the lamp's wiring to the printer — the boundary is where 'this never changes once it leaves my workshop' ends and 'this responds to who touches it' begins. And just as a typesetter proofs the galley to strip the editor's private margin notes before the page is printed, a Server Component must strip private fields before the rendered output ships to the reader."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/frontend-engineering/server-components-design/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# Server Components Design

## Concept of the skill

React Server Components (RSC) are a kind of component that runs *only* on the server, never ships to the browser as JavaScript, can be `async`, and can reach directly into server-side resources — databases, the file system, secrets, server-only environment variables. Their rendered output is serialized into a wire format (the *RSC payload*) and reconstituted into the client tree without any intermediating JSON API. Server and Client Components compose in a single tree with strictly one-way directionality: a Server Component may render (or `import`) a Client Component, but a Client Component may never `import` a Server Component — though it *can* receive one as a `children`/slot prop that its Server-Component parent already rendered. The two capability surfaces are disjoint: Server Components cannot use hooks, state, effects, event handlers, or browser APIs; Client Components cannot read databases, secrets, or server-only modules directly. The discipline this skill teaches is *where to draw the boundary in the tree*: push as much as possible to the server side and place `'use client'` at the thinnest interactive leaf, so the surrounding layout and data reads stay server-only (zero bundle, no hydration, data baked into the payload). Three concerns run through every RSC review — execution locality (does this need server-only or browser-only resources?), data security (every prop crossing to a Client Component is serialized and shipped to the browser, so private fields must be filtered into minimal DTOs *before* they cross), and reveal/freshness (which reads block, which stream behind Suspense, and which are cached). Next.js App Router is the canonical implementation, but the primitive is the React RFC, so the discipline is framework-agnostic.

## Coverage

The discipline of designing React Server Components (RSC): what an RSC is *for*, what it can do that Client Components cannot, what it cannot do, how the server/client boundary shapes the component graph and the data-flow graph, **how to keep private data from leaking across that boundary** (Data Access Layer, Data Transfer Objects, the `server-only` package, and the taint APIs), how to fetch data without waterfalls (request memoization, parallel reads, the preload pattern), how RSC composes with Suspense to stream content from the server in chunks, how a framework's caching layer (Next.js `'use cache'` / Partial Prerendering) reuses a Server Component's output, why Server Components remove the need for a separate API layer for read-path data, and the recurring design questions a reviewer asks of any RSC tree. Next.js App Router is the canonical implementation referenced throughout; the discipline applies to any RSC implementation (Remix RSC, Waku, Parcel RSC, hand-rolled RSC servers) since the underlying primitive is the React RFC, not a single framework.

RSC design also covers the **data-freshness axis** that modern App Router projects must make explicit: whether a Server Component read is uncached, request-cached, framework-cached, tagged for revalidation, or intentionally streamed behind Suspense. In current Next.js, Cache Components and the `'use cache'` directive make caching a component/data design decision, not an incidental `fetch` option. This skill owns the RSC read-path placement question; `server-actions-design` owns the write-path mutation and revalidation trigger.

## Philosophy of the skill

The original React component model collapsed two roles into one function: produce HTML for the initial render, and produce a virtual DOM update in response to client-side state. Server-Side Rendering pre-React-18 tried to make that single function run twice — once on the server to produce HTML, once on the client to produce the interactive tree — and pay for it with hydration: a full re-execution on the client to bind event handlers and reconstruct state.

Hydration has two costs the industry tolerated for a decade: every component must ship to the client (bundle size grows with the page), and every component re-runs on the client (CPU cost grows with the page). React Server Components separate the two roles into different *kinds* of component. A Server Component runs once, on the server, and produces a serialized output that the client uses directly — no shipping, no re-execution. A Client Component is what we used to call "a component": ships to the browser, runs on render and on every interaction.

The discipline of RSC design is to push as much of the tree as possible to the server side of the boundary, and to draw the line as close to the actual interactive leaves as possible. A button needs `useState`; the dashboard surrounding the button does not. A chart that responds to filter clicks is interactive; the page header above it is not. The win is real: bundle size shrinks toward "only the interactive parts," and the server has direct access to databases, file systems, and secrets without an intermediating API layer.

But the boundary is unforgiving — and it is a *security* boundary, not only a serialization one. A Server Component cannot use hooks. It cannot read state. It cannot attach event handlers. Anything that crosses to a Client Component must be serializable. The serializable set is *wider* than most people assume: strings, numbers, bigints, booleans, `null`, `undefined`, plain objects, arrays, `Map`, `Set`, `Date`, typed arrays / `ArrayBuffer`, Promises (React 19+), JSX / React elements, and globally-registered symbols (`Symbol.for`) all cross. What does *not* cross: functions (unless they are Server Functions marked `'use server'`), class instances (any object that is an instance of a class other than the built-ins above, or a null-prototype object), event objects, and non-global symbols (`Symbol('x')`). So a `Map` or a `Date` is fine; a class instance or an `onClick` handler is not. And anything that crosses is *shipped to the browser*: a Server Component that passes its whole database row to a Client Component has just published every field of that row to the client, including the ones it filtered out of the UI. The discipline is to express the work in shapes that respect the serialization constraint, to filter private data into minimal Data Transfer Objects before it crosses, and to use Suspense boundaries to let the server-rendered tree stream piece by piece rather than blocking on the slowest piece.

The modern RSC design question has **three axes, not one**:

1. **Execution locality** — does this logic require server-only resources, browser-only APIs, or neither?
2. **Freshness and cache lifetime** — should this read happen every request, be request-memoized, be persisted with a framework cache, or be invalidated by a mutation tag?
3. **Reveal granularity** — should this subtree block the page, stream independently behind Suspense, or be part of a static shell that resumes dynamic holes later?

The old advice "fetch in a Server Component" is directionally right but incomplete. A review should also ask: what cache owns this data, what invalidates it, what fallback appears while it resolves, and what minimal DTO crosses to the client? A Server Component can access the database, but that does not mean it should pass raw database rows to Client Components or hide freshness behind an accidental framework default.

## What a Server Component Can Do (And What a Client Component Cannot)

| Capability | Server Component | Client Component |
|---|---|---|
| `async` / `await` at the component level | Yes — prefer it for data reads | No; unwrap a stable Promise with `use()` (React 19+), especially a Promise created in a Server Component and passed as a prop |
| Direct database queries, file reads, secret access | Yes | No — would leak to the browser |
| Read environment variables (including `PROCESS_SECRET`-style) | Yes | No — only `NEXT_PUBLIC_*` vars are safe |
| Import server-only libraries (Postgres driver, file system) | Yes | No — bundling would fail (or worse, succeed and leak); guard with the `server-only` package |
| Subscribe to browser events (`onClick`, `onChange`) | No | Yes |
| Manage state (`useState`, `useReducer`) | No | Yes |
| Side effects (`useEffect`) | No | Yes |
| Read browser APIs (`window`, `localStorage`) | No | Yes |
| Render Client Components as children | Yes — boundary crosses here | Yes |
| Be rendered *as a child* of a Client Component | Only via the `children` / slot prop pattern | n/a |
| Receive props that are shipped to the browser | n/a — it sends them | Yes — every prop it receives is serialized to the client |

The boundary is not just about what's available; it's about what makes sense, and what is safe to send. A Server Component that renders the same output regardless of any client state is doing the right thing. A Server Component that wants to know "what tab did the user click on" is asking the wrong primitive — that's Client Component territory. A Server Component that hands a Client Component more data than that Client Component renders is leaking — see *Data Security* below.

> **Both kinds run on the server during the initial render, but in isolated module systems.** A Client Component executes on the server only to produce prerender HTML, and must obey browser security assumptions: no secrets, no `process.env` (beyond `NEXT_PUBLIC_*`), no server-only modules. "Runs on the server" for a Client Component does not make it a safe place for privileged data.

## The Composition Pattern: Client at the Leaves, Server Everywhere Else

A naive boundary draws the line at the page level: "this page needs interactivity, so the whole page is a Client Component." This loses most of the RSC benefit.

A disciplined boundary draws the line at the *interactive leaves*: the button that toggles a dropdown is a Client Component; the dropdown's structure, the surrounding layout, the data feeding it — all Server Components. The design goal has a name worth keeping: the **thinnest client boundary** — the `'use client'` directive sits at the smallest leaf that genuinely needs state, effects, event handlers, refs, or browser APIs, with as much of the surrounding tree as possible staying on the server. Keep layouts, data reads, formatting, markdown rendering, and non-interactive structure on the server unless there is a concrete browser-only requirement.

The enabling pattern is **passing Server Components as `children` (or any named slot prop) to Client Components**:

```tsx
// app/dashboard/page.tsx — Server Component
import { ServerData } from './ServerData'
import { ClientFilterBar } from './ClientFilterBar'

export default async function Dashboard() {
  const data = await db.getDashboardData()
  return (
    <ClientFilterBar>
      <ServerData data={data} />
    </ClientFilterBar>
  )
}

// ClientFilterBar.tsx — Client Component with state
'use client'
import { useState } from 'react'

export function ClientFilterBar({ children }: { children: React.ReactNode }) {
  const [filter, setFilter] = useState('all')
  return (
    <div>
      <select onChange={e => setFilter(e.target.value)}>...</select>
      {children}  {/* Server Component renders here */}
    </div>
  )
}
```

The `children` prop is *content*, not *components-to-import*. The Client Component receives the already-rendered React element from the server tree. This is the only way to put a Server Component "inside" a Client Component visually without violating the import rule. The same mechanism works for *any* prop typed as `React.ReactNode` — a Client Component can accept multiple Server-rendered slots (`header`, `sidebar`, `content`), not just `children` — which is how you keep a complex interactive shell (tabs, modals, providers, drawers, split panes, resizable splitters, filter bars) on the client while every slot it lays out stays on the server. Do not convert the whole shell subtree to client code merely because one wrapper is interactive.

## Deciding Server vs Client: A Review Rubric

When auditing or designing a tree, decide each component's kind by asking these questions in order. The first "yes" that forces the client wins — and it should force *only that component* to the client, not its ancestors (the thinnest-client-boundary rule above).

| Question about the component | If yes → | Reason |
|---|---|---|
| Does it call `useState` / `useReducer` / `useEffect` / `useRef`, or any hook other than `use()`? | **Client** | Hooks need the client runtime; Server Components have none. |
| Does it attach an event handler (`onClick`, `onChange`, `onSubmit`) the user triggers? | **Client** | Event handlers are not serializable and run in the browser. |
| Does it read a browser API (`window`, `document`, `localStorage`, `navigator`)? | **Client** | These do not exist during server render; touching them crashes. |
| Does it use a Client-only library (a charting lib that reads the DOM, an animation lib using `requestAnimationFrame`)? | **Client** | The library assumes a browser; wrap it in the smallest Client leaf. |
| Does it query a database / read the file system / read a secret or non-`NEXT_PUBLIC_*` env var? | **Server** | Direct resource access is the Server Component's job; doing it on the client leaks credentials. |
| Does the data come *only* after user interaction or from a browser-only source (live polling, geolocation, post-click reads)? | **Client** (with a client data library — SWR / React Query — or an event-driven path) | Do not force a Server Component round-trip for live or post-interaction data; it has no server-render moment to attach to. |
| Does it just fetch-and-render data with no interactivity? | **Server (default)** | Zero bundle, no hydration, data baked into the payload. |
| Does it need interactive data but the *fetch* should stay on the server? | **Split** | Server Component starts the query and passes the unawaited Promise; a Client leaf unwraps it with `use()` (see the Promise-handoff section). |

The default answer is **Server**. A component is a Client Component only because one of the forcing rows above forced it — never "to be safe." When a row forces a leaf to the client, check whether you can push the `'use client'` *down* (extract the interactive bit into its own small component) so the data-fetching and layout around it stay on the server.

## The Import Rule and Why It Matters

A Client Component cannot `import` a Server Component. Not "should not" — *cannot*, because the bundler running on the client would have to bundle the Server Component, and Server Components are not allowed to ship.

But a Server Component *can* `import` a Client Component. The Client Component file is marked `'use client'` at its top, the bundler treats it as a client-bundle entry point, and the Server Component renders a reference to it (in the RSC payload) that the client runtime resolves to the bundled component.

The directionality matters for tree design:

- Top-down: Server → Server → Server → Client → (only more Client below this point).
- Pierce-through via children/slots: Server → Client → (children prop receives) → Server → Server.

A tree that follows the first pattern naturally pushes work to the server. A tree that violates it (a Client Component near the root that needs to render a Server Component as a non-children child) cannot be expressed; you'll be forced to restructure.

## Serializable Values Across the Boundary

Use "serializable" to mean *React-serializable*, not merely JSON-serializable — and treat this as a review reference card, not a license to pass rich objects. The current Server Component → Client Component prop **allowlist** includes:

- **primitives:** `string`, `number`, `bigint`, `boolean`, `undefined`, `null`, and globally-registered symbols from `Symbol.for(...)`;
- **iterables and containers** containing serializable values: arrays, `Map`, `Set`, typed arrays, and `ArrayBuffer`;
- `Date`;
- **plain objects** with serializable properties;
- **Server Functions** (a function explicitly marked / exported `'use server'`);
- **Client or Server Component elements** (JSX);
- **Promises**, as long as the resolved value is also serializable (React 19+).

The **denylist** is just as important: ordinary callback functions, class definitions, class instances other than the supported built-ins, objects with null prototypes, symbols created with `Symbol(...)`, event objects, ORM entities, `Request` / `Response` objects, and custom objects that rely on methods or prototypes must not cross to Client Components.

Knowing the wire format can encode `Map`, `Set`, `Date`, typed arrays, `Symbol.for`, JSX, Server Functions, and Promises is not permission to pass rich domain objects. The RSC design default is still a small DTO shaped for the UI. If the value is privileged, persistence-shaped, or method-bearing, map it before it crosses.

## Data Flow Without an API Layer

The classic React data-fetching pattern:

1. Browser requests page → SSR returns HTML
2. Browser hydrates page
3. Client Component mounts, runs `useEffect`, calls `/api/data`
4. API route handler runs, queries database, returns JSON
5. Component re-renders with data

RSC collapses steps 1–5 to:

1. Browser requests page → Server Component runs, queries database directly, returns RSC payload (with data already baked in)

The `/api/data` route does not need to exist. The Server Component reaches into the database, passes the result to a child component as a prop, and the prop arrives at the client *as the rendered output* — serialized in the RSC payload, never round-tripped through a JSON API.

The stronger rule is: **do not call your own same-app Route Handler from a Server Component just to read data.** A Server Component already runs on the server; calling `fetch('/api/...')` against your own app turns an in-process read into an HTTP round trip, may fail at build time when no server is listening, and duplicates the route-handler contract for no external consumer. Query the database / call the data layer directly instead.

When does an API route still make sense? When the consumer is *real and external*: a mobile app, a third-party integration, a server-to-server call, a separate backend team, a cross-language service, a public REST/GraphQL contract, or a deliberate zero-trust backend-for-frontend boundary. Existing large systems may continue to call hardened internal HTTP APIs from Server Components when *those APIs are the security boundary*. What RSC removes is the need to invent a private JSON endpoint solely so the page can fetch its own read data.

Do not use Server Actions as the read-path escape hatch either — see the anti-patterns table. Use Server Component data fetching for reads, Server Actions for writes, and Route Handlers for external or explicitly HTTP-shaped consumers.

**Request-time inputs are async — and `params` / `searchParams` are untrusted.** The four request-scoped inputs a Server Component can read — `params`, `searchParams`, `cookies()`, and `headers()` — are all *async* in the current App Router (Next.js 15 made `searchParams` and the `cookies()`/`headers()` accessors async; Next.js 16 removed synchronous `params` access entirely). You `await` each one:

```tsx
import { cookies, headers } from 'next/headers'

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params
  const { sort } = await searchParams
  const session = (await cookies()).get('session')   // async accessor
  const lang = (await headers()).get('accept-language')
  // ...
}
```

They are async on purpose: synchronous request inputs would force the framework to resolve everything before it could start streaming the shell. Two design rules follow:

1. **Read them as low in the tree as possible.** Any component that reads a request input is *dynamic* — it cannot be statically prerendered or cached. Reading `cookies()`/`headers()`/`searchParams` high (in a root layout) taints the whole subtree as dynamic; reading it in the leaf that actually needs it keeps the rest of the page cacheable / prerenderable (this is the boundary the caching section below depends on).
2. **None of the four is a trust signal.** `params` and `searchParams` are user-controlled URL input (`?isAdmin=true` proves nothing), and `headers()` are equally forgeable by the caller. A *signed/encrypted* session cookie is the exception — but you still verify it server-side rather than trusting the raw value. Never gate authorization on a raw request input; re-verify the actual session and re-check resource ownership in the data layer (see *Data Security*).

## Request Memoization, Parallel Reads, and the Preload Pattern

Three independent components in a tree may each need the current user. Naively that is three database round-trips per request. Two mechanisms collapse them:

- **`fetch` is auto-deduped per render** in the App Router (outside the Cache Components model): the same URL + options inside one request is fetched once and the result shared. No wrapping needed.
- **`React.cache()` deduplicates any other data source** (a database client, an ORM call, a custom function) for the lifetime of a single server request. Wrap the read once in the DAL; every call site reads the memoized result. Define the cached function *outside* components — each call to `cache()` creates a distinct memoized function, invalidated per server request. (`cache()` is request-scoped memoization, *not* a cross-request cache — that is the framework caching layer below.)

```tsx
// app/lib/user.ts
import { cache } from 'react'
import 'server-only'

export const getCurrentUser = cache(async () => {
  const session = await auth()
  if (!session) return null
  return db.user.findUnique({ where: { id: session.userId } })
})
```

**Data ownership.** For reusable data like "current user," do *not* stand up a top-level provider just to avoid repeated reads. Server Components can call the same cached server-only function from each place that needs the data; prop-drilling a "current user" through every Server Component turns server data co-location into a fake global-provider problem. Reserve context providers for client interactivity and client state, not as a substitute for server read co-location.

The performance trap RSC makes easy is the **waterfall**: a parent `await`s query A, then renders a child that `await`s query B, so B cannot start until A finishes even though they are independent. Two fixes:

- **Render independent reads as siblings** so the renderer holds both `await`s open at once (the Suspense pattern below does this structurally), or **`Promise.all([a(), b()])`** when one component needs both.
- **Preload** to kick off a slow query *before* it is awaited: call the cached read (without `await`) high in the tree so the request is in flight while other rendering proceeds; the component that finally needs it reads the already-resolved cache entry. Use the preload pattern to solve a *measured* waterfall, not pre-emptively everywhere.

## Data Security: The Boundary Is a Publish Boundary

This is the most common and most dangerous RSC mistake, and it is invisible in the rendered UI. **Every prop a Server Component passes to a Client Component is serialized into the RSC payload and shipped to the browser** — including fields the Client Component never renders. A Server Component that does `<Profile user={userRow} />` with a full database row has published the user's password hash, internal flags, and every other column to anyone who opens DevTools, even though the `<Profile>` only shows the name. The review question: *"Could this prop be screenshotted from the browser devtools? If yes and that would be a leak, the Server Component is passing too much."* Fix the data shape, not the component label.

Four guards, in roughly increasing strength:

1. **Filter to a Data Transfer Object (DTO) before crossing.** Return only the public fields the client needs, not the raw record. `return { name: user.name }` instead of `return user`. This is the primary discipline; the rest are backstops.
2. **Centralize reads in a Data Access Layer (DAL).** For new projects, route all data access through a `server-only` module that (a) performs authorization, and (b) returns minimal DTOs. The DAL is the single place `process.env` and database drivers are imported, so secrets and queries cannot leak into render code. Re-check *authorization* (does this user own this resource?), not just *authentication* (is the user logged in?) — skipping this is the IDOR vulnerability class.
3. **Mark server-only modules with the `server-only` package.** `import 'server-only'` at the top of a module causes a *build error* if that module is ever imported into a Client Component. It turns "a refactor accidentally pulled secret-reading code into the client bundle" from a silent production leak into a failed build.
4. **Taint sensitive data with the React taint APIs.** `experimental_taintObjectReference(reason, obj)` and `experimental_taintUniqueValue(reason, lifetime, value)` mark an object or a specific value (a token, a key) as non-crossable; React throws if a tainted value reaches the client boundary. In Next.js, enable with `experimental.taint: true`. Tainting is a *defense-in-depth backstop for simple mistakes*, not a substitute for DTOs — a secure app layers all four.

```ts
// data/user-dto.ts — the Data Access Layer
import 'server-only'
import { cache } from 'react'
import { getCurrentUser } from './auth'

export const getProfileDTO = cache(async (slug: string) => {
  const [row] = await sql`SELECT * FROM users WHERE slug = ${slug}` // raw row, server-only
  const viewer = await getCurrentUser()                            // authorization context
  // Return ONLY the fields the UI may show this viewer:
  return {
    name: row.name,
    phone: viewer.isAdmin || viewer.team === row.team ? row.phone : null,
  }
})
```

> Functions and class instances are already blocked from crossing by default, and Next.js encrypts variables a Server Action closes over. Those are framework backstops — they reduce blast radius, they do not replace deliberate DTO design.

**Operational security note.** RSC support is framework-integrated, and the RSC / Server Functions stack has had critical security advisories. CVE-2025-55182 (CVSS 10.0) was an unauthenticated RCE caused by malicious requests being deserialized by vulnerable `react-server-dom-webpack`, `react-server-dom-parcel`, and `react-server-dom-turbopack` releases — it affects any RSC app even without explicitly authored Server Functions. React patched the 19.0, 19.1, and 19.2 lines (`19.0.1` / `19.1.2` / `19.2.1`), and frameworks tracked downstream impact separately (for Next.js App Router, CVE-2025-66478). When reviewing or upgrading an RSC project, check the project's *actual* React, framework, and `react-server-dom-*` versions against the current advisory for that release line — do not rely on a generic "React 19 is installed" signal.

## Suspense and Streaming RSC

A Server Component that awaits a slow query blocks the entire HTML response. Suspense unblocks the pattern: wrap the slow component in `<Suspense fallback={...}>` and the server flushes the surrounding tree immediately, then streams in the slow component's output when it resolves.

```tsx
// app/dashboard/page.tsx — Server Component
export default async function Dashboard() {
  return (
    <>
      <Header />
      <Suspense fallback={<SkeletonChart />}>
        <SlowChartData />  {/* awaits a 2-second query */}
      </Suspense>
      <Suspense fallback={<SkeletonTable />}>
        <SlowTableData />  {/* awaits a 1.5-second query */}
      </Suspense>
    </>
  )
}
```

Both `SlowChartData` and `SlowTableData` start their queries in parallel (the Server Component renders both subtrees, and each `await` is a Promise that the renderer holds open). The chart and table fallback HTML ships immediately; the actual content streams in as each query resolves. Time-to-first-byte is bounded by the fastest non-Suspended path; time-to-interactive of each section is bounded by that section's own query.

Two design rules:

1. **Co-locate the Suspense boundary with the slow data, not above it.** A boundary too high makes more of the page wait; a boundary too low produces visible layout shift as content pops in.
2. **Trigger parallel data fetches at the same level.** If two queries don't depend on each other, render their components as siblings (not parent/child) so their awaits happen in parallel.

In Next.js App Router there are two practical Suspense surfaces:

- **`loading.js` creates a route-segment boundary.** Good for page or segment navigations where the whole segment can show one meaningful loading state.
- **`<Suspense>` around a component is the finer tool.** Use it around the specific slow or uncached subtree so the rest of the shell can flush.

**Layouts deserve special scrutiny:** a layout that performs uncached runtime reads can block navigation *before* the page-level `loading.js` gets a chance to show. Move the read into the page or a child Server Component, or wrap the runtime read in its own Suspense boundary.

React 19.2 also briefly batches server-rendered Suspense boundary reveals, so adjacent boundaries that resolve close together can reveal together. The design rule does not change: place boundaries by product meaning and waterfall risk, not by trying to micromanage every millisecond of reveal timing.

See `suspense-patterns` for the wider Suspense discipline — error boundaries, nested fallbacks, the relationship to React's transition APIs — and `streaming-architecture` for streaming as a general protocol concern.

## Streaming a Promise to a Client Component with `use()`

Sometimes the interactive leaf itself needs the slow data — a Client Component that renders a chart needs the chart's data points. You do not have to `await` the query in the Server Component and block the whole subtree on it, and you must not fetch it from inside the Client Component (that reintroduces the `useEffect` waterfall). The pattern is to **start the query in the Server Component, pass the *unawaited* Promise as a prop, and unwrap it inside the Client Component with `use()`** under a Suspense boundary:

```tsx
// page.tsx — Server Component: kick off the query, DON'T await it
import { Suspense } from 'react'
import { Chart } from './Chart'

export default function Page() {
  const dataPromise = db.getChartData()      // no await — a Promise crosses the boundary
  return (
    <Suspense fallback={<SkeletonChart />}>
      <Chart dataPromise={dataPromise} />
    </Suspense>
  )
}

// Chart.tsx — Client Component: unwrap with use()
'use client'
import { use } from 'react'

export function Chart({ dataPromise }: { dataPromise: Promise<Point[]> }) {
  const data = use(dataPromise)              // suspends until resolved, then renders
  return <InteractiveChart data={data} />
}
```

A Promise is a serializable prop in React 19+, so it can cross the boundary; `use()` suspends the Client Component until it resolves, and the surrounding Suspense boundary streams the fallback first. Use this when the high-priority server content should render first, the lower-priority data can stream later, and the Client Component needs to own presentation or interactivity for that data. Two rules make it safe:

1. **Create the Promise on the server** (in the Server Component, or via a Server-side cached read) — *never* freshly during the Client Component's render. A new Promise created inside the Client Component on each render re-suspends forever (a render loop), the exact failure `useEffect`-fetching was supposed to avoid. Prefer server-created Promises, framework data sources, or a client data library with its own cache semantics.
2. **The Suspense boundary that catches the suspension must sit *above* the component calling `use()`** — otherwise the suspension propagates up and a higher (or missing) boundary blocks more of the page than intended.

This keeps the data fetch on the server (one round-trip, streamed) while the component that consumes it stays interactive on the client — the read-path equivalent of the children/slot composition pattern, but for *data* rather than *rendered markup*.

## Caching the Read Path: `use cache` and Partial Prerendering (Next.js)

`React.cache()` dedupes *within* a request. A *cross-request* cache — "this Server Component's output is the same for everyone for the next hour, don't re-render it" — is a framework concern layered on top of the RSC primitive. In Next.js 16 this is **Cache Components**, opt-in via `cacheComponents: true`. The model is a deliberate inversion of the older implicit caching: **nothing is cached by default; you opt in** with the `'use cache'` directive (in the Cache Components model, even `fetch` is not cached by default).

- **`'use cache'`** at the top of a file, async function, or component caches the *return value* (the rendered output / resolved data), not the execution. Place it as close to the data as possible — at the cacheable component or function, not the whole layout — for granular control.
- **`cacheLife('hours')`** sets time-based revalidation; **`cacheTag('user-123')`** + `revalidateTag` / `updateTag` give on-demand invalidation (the latter triggered from the mutation path — see `server-actions-design`).
- **Partial Prerendering (PPR)** is the production form of the streaming pattern this skill teaches: with Cache Components on, the page is a *static shell* (the cached parts, served instantly from the edge) with *dynamic holes* that stream in via Suspense. Cache the parts that are the same for everyone; wrap genuinely per-request data (the logged-in user's name, a live count) in Suspense and *do not* cache it.

```tsx
// app/lib/products.ts
import { cacheTag } from 'next/cache'
import 'server-only'

export async function getProducts() {
  'use cache'
  cacheTag('products')
  return db.product.findMany()
}
```

The design rule maps cleanly onto the boundary discipline: a Server Component is cacheable when its output does not depend on the specific request (no `cookies()`, `headers()`, or `searchParams` read inside it). The moment it reads request-specific input it is dynamic — give it a Suspense boundary, leave it uncached, because uncached runtime reads outside Suspense can block prerendering and navigation (and may error in dev/build under Cache Components). This shifts review from "where is the fetch?" to "what is the cache key / lifetime / invalidation contract?" This is a framework extension, not part of the React RSC RFC; the *which-runs-where* discipline is portable, the caching directives are Next.js-specific (other RSC frameworks expose their own).

## Common Anti-Patterns

| Anti-pattern | Why it's wrong | Fix |
|---|---|---|
| Whole page marked `'use client'` to use one button | Loses all RSC benefit; ships entire page as client bundle | Move `'use client'` to the leaf component that actually needs it |
| A fat Client Component boundary around a mostly static shell | Ships server-capable UI, data helpers, and formatting to the browser for one interactive control | Move `'use client'` to the smallest interactive leaf; pass server-rendered content through slots |
| Passing a whole DB row / full record / ORM or domain object to a Client Component | Every field is serialized and shipped to the browser, leaking columns the UI never shows, and couples the UI to the persistence shape | Filter to a minimal DTO (`{ name }`) in a `server-only` Data Access Layer before it crosses |
| Treating "Server Component" as "safe to pass everything to the client" | The client can read serialized props and rendered output in devtools | Return minimal DTOs from server-only data functions; pass only fields the Client Component needs |
| `useEffect` to fetch data on mount | Hydration delay + double-fetch + lost streaming | Fetch in a Server Component ancestor and pass data as prop |
| Parent `await`s query A, child then `await`s independent query B | Sequential waterfall — B can't start until A resolves | Render as siblings (each in its own Suspense) or `Promise.all`; dedupe shared reads with `React.cache()` |
| Fetching current user high in the tree and prop-drilling through every Server Component | Turns server data co-location into a fake global-provider problem | Put the read behind a cached `server-only` function and call it where needed |
| Forgetting the cache / freshness contract | The UI may be stale, over-dynamic, or accidentally blocking static shells | Name the cache: uncached, React `cache`, framework `'use cache'`, tag / lifetime, and invalidation trigger |
| Importing a Client Component that wraps `children` and trying to put a Server Component import inside | Bundler treats the Server Component as client code | Pass the Server Component as `children` / slot from a Server Component parent |
| Client Component imports a Server Component directly | The client bundle would have to include server-only code | Invert ownership: a Server Component imports the Client Component and passes server-rendered children / slots |
| `await fetch('/api/data')` in a Server Component (calling your own same-app Route Handler) | Spending an HTTP round-trip for data you could query directly in-process; can fail at build | Query the database / call the DAL function directly; the API route is only for *external* consumers |
| Using a Server Action (`'use server'`) to *read* data for rendering | Server Actions are mutation-oriented and execute **sequentially in a queue** (one at a time per request), so using them for reads serializes data fetching and blocks parallelism | Read with a Server Component or a cached DAL function; reserve Server Actions for writes/mutations (see `server-actions-design`) |
| Trusting `searchParams`/`params`/cookies/headers (`?isAdmin=true`) as authorization | They are user-controlled request input, not a trust signal, and reading them makes the subtree dynamic | Re-verify the real session server-side; check authorization (ownership), not just authentication |
| Treating "serializable" as JSON-only **or** as "anything structured" | Both are wrong: React supports `bigint`, `Date`, `Map`, `Set`, typed arrays, `ArrayBuffer`, `Symbol.for`, JSX, Server Functions, and Promises, while rejecting ordinary functions, classes, non-global symbols, event objects, and prototype-bearing instances | Use the current React-serializable allowlist, then still pass the smallest UI-shaped DTO |
| Creating a Promise inside a Client Component render for `use(promise)` | Promise identity changes every render, defeating stable Suspense behavior | Create the Promise in a Server Component, or use a client data library cache |
| Passing a function (`onClick`) from Server Component to Client Component | Not serializable across the boundary | Define the handler in the Client Component, pass primitive props instead |
| Reading `window` or `document` in a Server Component | Will crash at render time | Move browser-API code to a Client Component or to a `useEffect` |
| One giant Suspense boundary at the page root | All slow content blocks together — no streaming benefit | Place boundaries near the slow data, one per independent slow section |
| Uncached layout reads that rely on same-segment `loading.js` | The layout can block before the loading boundary is active | Move the read down or wrap the uncached subtree in explicit `<Suspense>` |
| Caching a Server Component that reads `cookies()`/`searchParams` (`'use cache'`) | Request-specific data gets frozen and served to the wrong user | Leave request-specific components dynamic + Suspense-wrapped; cache only request-independent output |

## Verification

After applying this skill, verify:

- [ ] `'use client'` appears at the leaf where interactivity actually starts, not higher in the tree — it is the *thinnest boundary* that satisfies the interaction requirement, with server-rendered slots used instead of moving whole shells client-side.
- [ ] Import direction is valid: Server Components may import Client Components; no Client Component imports a Server Component's internals (the Client Component is marked `'use client'` only at its top level).
- [ ] No serialization-breaking values cross the boundary — no non-Server-Function functions, no class instances, no non-global symbols, no event objects, no `Request`/`Response` or ORM entities. (`Map`, `Set`, `Date`, typed arrays, `bigint`, `Symbol.for`, and Promises *are* serializable and may cross.)
- [ ] **No Client Component prop carries more data than it renders** — whole DB rows / records / ORM objects are filtered to a DTO before crossing; secret-reading and DB-driver modules are guarded with `import 'server-only'`.
- [ ] Privileged reads authenticate **and** authorize (resource ownership) on the server; no raw request input (`params`, `searchParams`, `cookies()`, `headers()`) is trusted as a permission signal.
- [ ] Request-scoped inputs (`params`, `searchParams`, `cookies()`, `headers()`) are `await`ed and read as low in the tree as possible, so reading them does not taint an ancestor (a layout) as dynamic.
- [ ] Every Server Component data read has a named freshness strategy: uncached per request, React `cache`, framework cache (`'use cache'` / tags / lifetime), or external API cache.
- [ ] Same-app Route Handlers are not called from Server Components merely to read data; any retained API call has a real external / organizational / security consumer.
- [ ] No Server Action is used for ordinary read-path data fetching.
- [ ] Independent reads run in parallel (siblings / `Promise.all`), shared reads are deduped with `React.cache()` or `fetch` auto-dedup, and no avoidable parent→child `await` waterfall remains.
- [ ] Slow data fetches are wrapped in Suspense boundaries co-located with the data; route-level `loading.js` and component-level `<Suspense>` are chosen deliberately, and uncached layout reads do not accidentally block navigation.
- [ ] Client Components unwrap only stable Promises with `use(promise)`, preferably Promises created by a Server Component and wrapped in Suspense.
- [ ] No `useEffect` fetches for data that could be fetched server-side.
- [ ] Server Components do not call hooks, do not attach event handlers, and do not read browser APIs.
- [ ] Client Components do not import server-only libraries (DB drivers, file system modules, secret-reading helpers).
- [ ] If a framework caching layer is used (`'use cache'` / Cache Components), cached components are request-independent and request-specific data stays dynamic behind Suspense.
- [ ] The RSC bundler packages (`react-server-dom-webpack` / `-parcel` / `-turbopack`) and the framework that bundles them are on versions patched against CVE-2025-55182 (the unauthenticated Server Function deserialization RCE, patched in React `19.0.1` / `19.1.2` / `19.2.1`) and the downstream framework advisory for the project's release line (e.g. Next.js CVE-2025-66478) — affects any RSC app even without explicitly authored Server Functions.
- [ ] The component tree expresses the actual interactivity boundary; rebuild it if a Client Component is forced to wrap Server Components it should be a sibling of.

## Grounding Sources

- React RFC — [Server Components RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md). The original proposal and the formal model.
- React docs — [Server Components](https://react.dev/reference/rsc/server-components). Official reference for the runtime contract.
- React docs — [`'use client'`](https://react.dev/reference/rsc/use-client) and [`'use server'`](https://react.dev/reference/rsc/use-server). The directive semantics and the current serializable-props allowlist for the Server→Client boundary.
- React docs — [`cache`](https://react.dev/reference/react/cache). Request-scoped memoization for non-`fetch` reads (the preload + dedup pattern), with caveats.
- React docs — [`use`](https://react.dev/reference/react/use). Unwrapping a Promise (or context) inside a Client Component — the Server→Client Promise-handoff pattern, Suspense/Error-boundary integration, and the preference for server-created stable Promises.
- React blog — [React 19](https://react.dev/blog/2024/12/05/react-19). RSC stable status, the `react-server` export condition, and the "no directive for Server Components" clarification.
- React blog — [React 19.2](https://react.dev/blog/2025/10/01/react-19-2). `cacheSignal`, partial-prerendering APIs, brief batching of server-rendered Suspense reveals, and Web Streams support.
- React blog — [Critical Security Vulnerability in React Server Components](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components) (CVE-2025-55182, CVSS 10.0). The Server Function deserialization RCE and the patched `react-server-dom-*` versions.
- React docs — [`experimental_taintObjectReference`](https://react.dev/reference/react/experimental_taintObjectReference) and [`experimental_taintUniqueValue`](https://react.dev/reference/react/experimental_taintUniqueValue). The defense-in-depth guards against leaking private data across the boundary.
- Next.js docs — [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) and [Composition Patterns](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns). The canonical working implementation, provider depth, passing server-rendered content through Client Component children, and environment-poisoning prevention.
- Next.js docs — [Fetching Data](https://nextjs.org/docs/app/getting-started/fetching-data). Server Component data fetching, streaming, the `use` API, sequential-vs-parallel fetch guidance, and `React.cache` sharing.
- Next.js docs — [Backend for Frontend](https://nextjs.org/docs/app/guides/backend-for-frontend). Direct source reads from Server Components, route-handler caveats, and Server Actions not being the read-path primitive.
- Next.js docs — [How to think about data security](https://nextjs.org/docs/app/guides/data-security). DTOs, the Data Access Layer, `server-only`, taint, and the authentication-vs-authorization (IDOR) audit checklist.
- Next.js docs — [`cookies()`](https://nextjs.org/docs/app/api-reference/functions/cookies) and [`headers()`](https://nextjs.org/docs/app/api-reference/functions/headers). The async request-scoped accessors that mark a component dynamic and must not be trusted as authorization facts.
- Next.js docs — [Page file convention](https://nextjs.org/docs/app/api-reference/file-conventions/page). `params` / `searchParams` Promise shape, Client Component `use()` examples, and dynamic request-time behavior.
- Next.js docs — [Cache Components](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents), [`use cache`](https://nextjs.org/docs/app/getting-started/caching), and [Version 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16). The opt-in caching model, Partial Prerendering, and current App Router direction.
- Next.js blog — [Security Advisory: CVE-2025-66478](https://nextjs.org/blog/CVE-2025-66478). Downstream Next.js App Router impact from the upstream RSC vulnerability and release-line patch guidance.
- Vercel — [How React Server Components Work](https://vercel.com/blog/understanding-react-server-components). Walk-through of the RSC payload and rendering pipeline.
- Markbåge, S. et al. — [Introducing Zero-Bundle-Size React Server Components](https://legacy.reactjs.org/blog/2020/12/21/data-fetching-with-react-server-components.html). The first public introduction; useful for the design rationale.
- Akinmade Adeleke, A. — [The Forensics of React Server Components](https://www.smashingmagazine.com/2024/05/forensics-react-server-components/). Deep dive on the RSC payload format and tree reconstruction.
- Scharff, A. — [Avoiding Server Component Waterfall Fetching with React 19 cache](https://aurorascharff.no/posts/avoiding-server-component-waterfall-fetching-with-react-19-cache/). The waterfall anti-pattern, request-scoped dedup, and the preload pattern.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| The mechanics of the `'use client'` / `'use server'` directive boundary itself (serialization rules, what crosses, RSC payload format) | `client-server-boundary` | client-server-boundary owns the boundary as a serialization mechanism; this skill owns the *design discipline* of where to draw the boundary in your component graph. |
| Hook discipline on the Client Component side (Rules of Hooks, useEffect, useMemo) | `hooks-patterns` | hooks-patterns covers what Client Components do correctly. Server Components cannot use hooks at all. |
| Choosing between SSR, SSG, ISR, and CSR rendering strategies | `rendering-models` | rendering-models owns the strategic rendering choice. RSC is one rendering mode among several. |
| Designing the Server Actions / form-mutation surface and re-authorization inside the action | `server-actions-design` | Server Actions are the *write* path; Server Components are the *read* path. They share infrastructure but have distinct design concerns. |
| Designing nested error boundaries, transition-driven fallbacks, and the broader Suspense orchestration | `suspense-patterns` | suspense-patterns owns the full Suspense discipline; this skill uses Suspense as one streaming primitive. |
| Streaming patterns broader than RSC (HTTP/2 push, SSE, WebSockets, AI streaming) | `streaming-architecture` | streaming-architecture covers streaming as a general protocol concern. RSC streaming is one application of that toolkit. |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `frontend-engineering`
- Public: `true`
- Domain: `engineering/frontend`
- Scope: Designing and reviewing React Server Components — what an RSC can do (async, direct data access, server-only imports) versus what it cannot (state, effects, event handlers, browser APIs), where to draw the server/client boundary in the component tree, how to keep private data from leaking across that boundary (DTOs, a Data Access Layer, the server-only package, taint APIs), how to fetch without waterfalls (request memoization, parallel reads, the preload pattern), how RSC composes with Suspense to stream content without a separate API layer, and the read-path caching/freshness decision (Next.js Cache Components / 'use cache' / Partial Prerendering). Next.js App Router is the canonical implementation; the discipline is framework-agnostic. Excludes the 'use client'/'use server' directive serialization mechanics (client-server-boundary), Client Component hook discipline (hooks-patterns), the SSR/SSG/ISR/CSR strategy choice (rendering-models), the write-path mutation surface (server-actions-design), and the wider Suspense orchestration (suspense-patterns).

**When to use**
- decide whether a dashboard widget should be a Server Component (fetches and renders) or a Client Component (interactive)
- explain why a Server Component cannot pass a function as a prop to a Client Component
- design a page where the layout fetches user data once and child widgets fetch their own data, with Suspense streaming each in
- audit a component tree for unnecessary 'use client' boundaries that pull static rendering into the bundle
- review a Server Component that passes a whole database row to a Client Component and decide what to strip
- Triggers: `should this be a Server Component or a Client Component`, `can I fetch data here`, `why can't I use useState in this file`, `how does data move from server to client`, `do I need an API route`, `why is the bundle so large`, `how do I stop private data leaking to the client`, `can I pass a Promise to a Client Component`, `why are params and searchParams promises`, `should this data be cached with use cache`, `why is loading.tsx not showing`

**Not for**
- add a click handler to an existing component (use hooks-patterns and client-server-boundary)
- choose between SSR and SSG for a marketing page (use rendering-models)
- build the form-submission mutation flow (use server-actions-design)
- design the public API for a third-party integration (use api-design)
- design nested error boundaries and transition-driven fallback orchestration (use suspense-patterns)
- Owned by `client-server-boundary`: the serialization-and-directive mechanics of the boundary itself ('use client', what can cross, RSC payload format)
- Owned by `rendering-models`: the strategic decision among SSR, SSG, ISR, and CSR
- Owned by `hooks-patterns`
- Owned by `server-actions-design`: the write path (mutations, 'use server' functions, form actions, re-authorization inside the action)

**Related skills**
- Verify with: `code-review`, `rendering-models`
- Related: `client-server-boundary`, `rendering-models`, `hooks-patterns`, `streaming-architecture`, `suspense-patterns`, `server-actions-design`

**Concept**
- Mental model: |
- Purpose: |
- Analogy: A Server Component is to a React tree what a printed page is to a book — the typesetter (server) sets the lead, presses the ink, and ships the printed page (RSC payload); the reader's table lamp (Client Component) is wired and switchable at the reader's end. You do not ship the typesetter to the reader's living room, and you do not ship the lamp's wiring to the printer — the boundary is where 'this never changes once it leaves my workshop' ends and 'this responds to who touches it' begins. And just as a typesetter proofs the galley to strip the editor's private margin notes before the page is printed, a Server Component must strip private fields before the rendered output ships to the reader.
- Common misconception: |

**Keywords**
- `React Server Components`, `RSC`, `Next.js App Router`, `async components`, `server-side data fetching`, `streaming RSC`, `server/client component tree`, `RSC payload`, `Data Access Layer DTO`, `Cache Components use cache`

<!-- skill-graph-context:end -->
