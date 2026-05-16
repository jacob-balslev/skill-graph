---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: rendering-models
description: "Use when reasoning about how a web UI is produced and delivered: client-side rendering, server-side rendering, static-site generation, incremental static regeneration, React Server Components, streaming SSR, edge rendering, and partial prerendering. Covers the time × place grid (build/request/stream/interaction × server/edge/client), the trade-offs between first-paint latency and time-to-interactive, the relationship between rendering and hydration, and how a route's content profile (dynamic / static / personalized) maps to a model. Do NOT use for organizing the frontend codebase (use frontend-architecture), the serialization frontier between server and client code (use client-server-boundary), the wire protocol itself (use http-semantics), or specific deploy-platform composition patterns (use vercel-composition-patterns)."
version: 1.0.0
type: capability
category: engineering
domain: engineering/frontend
scope: reference
owner: skill-graph-maintainer
freshness: "2026-05-15"
drift_check:
  last_verified: "2026-05-15"
eval_artifacts: planned
eval_state: unverified
routing_eval: absent
comprehension_state: present
stability: experimental
license: MIT
allowed-tools: Read Grep
keywords:
  - rendering model
  - CSR
  - SSR
  - SSG
  - ISR
  - React Server Components
  - RSC
  - streaming SSR
  - edge rendering
  - partial prerendering
  - hydration
  - time to interactive
  - first contentful paint
triggers:
  - "should this page be server-rendered"
  - "static or dynamic"
  - "what's the difference between SSR and RSC"
  - "why is this page slow to first paint"
  - "should this be a client component"
examples:
  - "decide whether a product page should be SSG with revalidation or SSR"
  - "explain why a marketing page is fast but a dashboard is slow despite both 'server rendering'"
  - "choose between streaming SSR and a loading skeleton"
  - "diagnose why a server component re-renders on every navigation"
anti_examples:
  - "organize the folder structure of a frontend codebase (use frontend-architecture)"
  - "decide what types can cross the network boundary (use client-server-boundary)"
  - "design HTTP cache headers (use http-semantics)"
relations:
  related:
    - frontend-architecture
    - client-server-boundary
    - http-semantics
    - performance-engineering
    - vercel-composition-patterns
  boundary:
    - skill: frontend-architecture
      reason: "frontend-architecture owns how the codebase is organized; rendering-models owns where and when the UI is produced. A route's architecture and its rendering model are independent decisions."
    - skill: client-server-boundary
      reason: "client-server-boundary owns the serialization frontier (what can cross between server and client code). rendering-models owns the staging of work across build/request/stream/interaction."
    - skill: http-semantics
      reason: "http-semantics owns the wire protocol (caching headers, status codes, content negotiation). rendering-models is upstream — it decides what HTML and JS exist; http-semantics decides how they are delivered and cached."
    - skill: performance-engineering
      reason: "performance-engineering owns measurement, profiling, and optimization across the stack. rendering-models is one input — the choice of model bounds what performance numbers are achievable on a given route."
  verify_with:
    - performance-engineering
    - frontend-architecture
concept:
  definition: "A rendering model is the strategy by which a web user interface is produced and delivered, defined by two axes: when the work happens (build time, request time, response stream, or user interaction) and where it executes (server, edge, or client). The choice of model determines first-paint latency, time-to-interactive, server cost, cache behavior, and which content can be indexed by crawlers."
  mental_model: |
    Rendering is staged across four moments on a time axis and three locations on a place axis:

    1. **Time axis** — *build* (work done once during deploy and reused for every request), *request* (work done per HTTP request, may be cached), *stream* (work done while the response is being sent — chunks emitted over time), *interaction* (work done in the browser in response to user events).

    2. **Place axis** — *server* (origin compute, full database access), *edge* (compute geographically close to the user, limited runtime, fast cold start), *client* (the user's browser, after the document has loaded).

    Each named rendering model is a position on this grid:

    - **CSR (client-side render)** — produce a near-empty HTML shell; do all rendering at interaction time on the client. Fast deploys, slow first paint, fast subsequent navigations.
    - **SSR (server-side render)** — produce HTML per request on the server. Slower per-request but fast first paint; the client then hydrates to attach behavior.
    - **SSG (static-site generation)** — produce HTML once at build, serve from a CDN. Cheapest per request, fastest first paint, but content is frozen until the next build.
    - **ISR (incremental static regeneration)** — SSG with a revalidation window. The CDN serves the cached HTML; on a stale read, the server regenerates in the background.
    - **RSC (React Server Components)** — produce a serialized component tree at request time. Components marked server-only never ship to the client; client components are interspersed and hydrate where needed.
    - **Streaming SSR** — render the server response in chunks, emitting HTML for the page shell first and filling in slower parts as they resolve (typically via `<Suspense>` boundaries).
    - **Edge SSR** — SSR running at the edge instead of the origin. Trades full database access for proximity.
    - **PPR (Partial Prerendering)** — hybrid: a static shell prerendered at build, with dynamic holes streamed in at request.

    Hydration is a consequence of these models, not a model itself. Whenever the server produces HTML and the client must attach event handlers and re-create component state, the cost of attaching is hydration. It is paid by every model except pure CSR (where the client renders from scratch) and pure SSG-without-JS (where no behavior attaches).
  purpose: |
    Choosing a rendering model is a product decision dressed as a technical one. The trade-offs are:

    - **First Contentful Paint (FCP) and Largest Contentful Paint (LCP)** are best on SSG and PPR (HTML pre-built, served from edge cache), worse on SSR (server work per request), worst on CSR (empty shell + JS download + JS execute before any paint).
    - **Time to Interactive (TTI) and Interaction-to-Next-Paint (INP)** depend on hydration cost. Pages that ship megabytes of client JS pay a long TTI regardless of how their HTML was produced.
    - **Server cost** is highest for SSR (compute per request) and lowest for SSG (compute once). RSC sits between: server work per request, but a smaller payload than full SSR HTML.
    - **Crawlability and SEO** favor server-produced HTML. Pure CSR pages depend on the crawler executing JavaScript, which most do but with limits and delays.
    - **Personalization and freshness** favor request-time models. SSG and ISR cannot produce per-user content without falling back to client-side rendering for the personal parts.

    The right choice is per-route, not per-application. A marketing landing page is SSG. A logged-in dashboard is SSR or RSC. A real-time chart is CSR (with the data fetched from a server endpoint). A product detail page with reviews is ISR or PPR — the product is static, the reviews update through revalidation.
  boundary: |
    **Rendering model is not bundling.** Bundling is the process of packaging the JavaScript that ships to the client. Two pages with the same rendering model can ship wildly different bundle sizes; two pages with different models can ship the same bundle. Bundle size affects TTI; rendering model affects FCP/LCP.

    **Rendering model is not hydration.** Hydration is the attachment of client behavior to server-rendered DOM. SSR and SSG both produce HTML that requires hydration if the page has any client interactivity. RSC reduces hydration cost by keeping server components off the client entirely.

    **Rendering model is not framework choice.** Every modern framework supports multiple models. The model decision is independent of whether the project uses React, Vue, Svelte, Solid, or Astro. The framework affects ergonomics; the model affects user-perceived performance.

    **Rendering model is not the wire format.** HTML, JSON, RSC payloads, and streamed chunks are all delivered over HTTP. The wire format and caching strategy are downstream of the model — they are how the produced output is transported.

    **"Server" in SSR and "server" in RSC are not interchangeable.** SSR produces HTML strings on the server. RSC produces a React tree (serialized as a custom format) on the server. The HTML produced by SSR ages out of the React component model the moment it is sent; an RSC payload remains a tree that React can reconcile against on the client.

    **SSG is not always faster than SSR.** SSG is faster only when the CDN cache is warm and the build process is feasible. A site with 100,000 product pages and frequent updates cannot SSG in reasonable time; SSR or ISR is the realistic option.

    **"Hybrid" is the norm, not the exception.** Most real applications use multiple models across routes. Treating the choice as global is a category error.
  taxonomy: |
    By when production happens:
    - **Build-time models** — SSG. Output is fixed until the next deploy.
    - **Request-time models** — SSR, RSC, edge SSR. Output is produced per request.
    - **Stream models** — Streaming SSR, RSC with `<Suspense>`, PPR. Output is produced over the lifetime of one response.
    - **Interaction-time models** — CSR. Output is produced in the browser after the document loads.

    By where production happens:
    - **Origin server** — full database access, full Node.js (or equivalent) runtime, slower cold starts.
    - **Edge runtime** — geographically close, limited runtime (often Web Standard APIs only), no direct database, fast cold start.
    - **Client** — the user's browser. Cost is paid by the user's CPU and battery.

    By what the server emits:
    - **HTML strings** — SSR, SSG (the output is a complete HTML document).
    - **Serialized component trees** — RSC (the output is a custom format React parses).
    - **Streamed HTML chunks** — Streaming SSR (the output is HTML emitted over time).
    - **Empty shell + JS** — CSR (the server emits a near-empty document; the client renders).
    - **Hybrid prerender + stream** — PPR (a static shell with dynamic holes filled by streaming).

    By revalidation behavior:
    - **Frozen** — SSG (output changes only on next build).
    - **Time-based revalidation** — ISR with a TTL.
    - **On-demand revalidation** — ISR triggered by a webhook or API call.
    - **Per-request** — SSR, RSC (always fresh).
  analogy: |
    Restaurant service models. SSG is meal-prep — cook everything Sunday afternoon, store in the fridge, serve from cold storage all week. Fast to serve, but the menu cannot change mid-week. SSR is cook-to-order — fresh, slower, more expensive to staff. CSR is hand the diner raw ingredients and a stove and a recipe — they assemble at the table; slow first bite, but they can customize. RSC is the chef plates the dish but the diner adds the seasoning at the table — the plating cost is on the kitchen, the garnish cost is on the diner. ISR is meal-prep with a sous-chef who refreshes hot trays when they cool — most plates come from the prep, fresh batches arrive in the background. PPR is meal-prep for the entrée with a sous-chef preparing the sauce while you sit — most of the plate is already there, the personal part arrives moments later.
  misconception: |
    The most common misconception is that **"server-rendered" means "fast"**. Server rendering produces HTML on the server, which improves FCP relative to CSR. But if the page ships megabytes of client JS that must execute before interactivity, the page will *paint* fast and *react* slowly. A CSR page with a smaller bundle can feel faster than an SSR page with a larger one.

    The second misconception is that **RSC is just SSR with extra steps**. RSC produces a serialized component tree, not an HTML string. The implications: (1) server components can be omitted from the client bundle entirely, reducing client JS for routes that mostly display server data; (2) navigation between RSC routes can re-fetch only the changed parts of the tree rather than a full HTML document; (3) the boundary between server and client is per-component, not per-route.

    The third misconception is that **SSG is always cheaper than SSR**. SSG is cheaper *at request time* — the CDN serves a pre-built file. But the build itself can be expensive. A site with 1,000 dynamic pages that change hourly cannot SSG cheaply; the rebuild cost will dwarf the per-request cost of SSR. ISR exists precisely to bridge the cases where SSG's build cost is impractical but the per-request freshness of SSR is unnecessary.

    The fourth misconception is that **hydration is free**. Hydration is the cost of attaching event handlers, re-creating component state, and reconciling the React tree against the server-produced DOM. On large pages with many components, hydration can take longer than the original render. Models that reduce hydration (RSC, islands architecture, progressive hydration) exist because this cost is significant.

    The fifth misconception is that **the rendering model is a framework choice**. It is a per-route product decision. A single Next.js application can mix SSG, SSR, ISR, RSC, and CSR across its routes; the same is true in SvelteKit, Remix, Astro, and Nuxt. Choosing the framework constrains which models are first-class, but does not determine which model is right for each route.
---

# Rendering Models

## Coverage

The taxonomy of how a web user interface is produced and delivered. Covers the time × place grid (build / request / stream / interaction × server / edge / client), the six named models in current use (CSR, SSR, SSG, ISR, RSC, streaming SSR) plus two recent additions (edge SSR, PPR), their trade-offs in FCP, LCP, TTI, INP, server cost, and crawlability, and the relationship between rendering and the downstream concerns of bundling, hydration, and HTTP delivery.

## Philosophy

A rendering model is a staging decision: at what moment, and in what location, does the work of producing the UI happen. The full work is the same — interpret data, compose a component tree, emit DOM, attach behavior — but moving each step between build, request, stream, and interaction has dramatic consequences for what the user experiences first, how the server scales, and whether the content is crawlable.

The model choice is per-route, not per-application. A site that picks one model for everything will be wrong for most of its routes. The correct mental model is a grid of trade-offs, with each route landing at the position that matches its content profile (static / dynamic / personalized) and its performance constraints (FCP / TTI / cost).

The goal of this skill is to make the trade-offs legible, not to pick a winner. The right model in 2026 for a marketing page is not the right model for a logged-in dashboard, and neither is the right model for a streaming chat UI.

## The Time × Place Grid

The grid below positions the named models on the two-axis space. Read each cell as "work happens at this time, in this place."

| | Server (origin) | Edge | Client |
|---|---|---|---|
| **Build** | SSG | SSG (with edge cache) | — |
| **Request** | SSR, RSC | Edge SSR, Edge RSC | — |
| **Stream** | Streaming SSR, PPR | Edge streaming | — |
| **Interaction** | — | — | CSR, hydration |

The Client column is sparse because client-only models are rare in production — most pages mix at least one server-produced step (HTML or RSC payload) with client interaction.

## Trade-off Profile

The four user-facing performance numbers respond differently to each model.

| Model | FCP | LCP | TTI | INP | Server cost | Crawl-friendly |
|---|---|---|---|---|---|---|
| CSR | Worst — empty shell | Worst — depends on client fetch | Worst — full JS execute | Worst — depends on bundle | Lowest | Conditional (depends on crawler JS support) |
| SSR | Good — HTML served | Good | Worse — hydration cost | Worse if bundle is large | Highest | Yes |
| SSG | Best — CDN cache | Best | Worse — hydration cost | Worse if bundle is large | Lowest at request | Yes |
| ISR | Best (hot) / Good (cold) | Best (hot) / Good (cold) | Worse — hydration cost | Worse if bundle is large | Low (background regen) | Yes |
| RSC | Good — server tree | Good | Better — less client JS | Better — less client JS | High | Yes |
| Streaming SSR | Excellent — shell first | Good | Better — interactive in chunks | Same as SSR | High | Yes |
| Edge SSR | Excellent — proximity | Good | Same as SSR | Same as SSR | Medium | Yes |
| PPR | Excellent — static shell | Good — streamed | Better | Better | Low for shell, high for dynamic | Yes |

"Worse if bundle is large" means hydration cost dominates: the model produced HTML quickly, but the page is not interactive until the client JS loads, parses, and executes.

## When to Choose Each Model

A heuristic matrix. Use it as a starting point; always validate with real measurements.

| Route profile | First choice | Second choice |
|---|---|---|
| Marketing page (rarely changes, no personalization) | SSG | ISR if content updates daily |
| Blog post (occasional updates) | SSG with on-demand revalidation | ISR with TTL |
| Product detail (catalog + inventory) | ISR or PPR | SSR if catalog changes hourly |
| Search results (per-query) | SSR or streaming SSR | Edge SSR if global users |
| Logged-in dashboard (per-user data) | SSR or RSC | Streaming SSR if data is slow |
| Real-time chart (high update rate) | CSR with server data | RSC + client island for the chart |
| Admin panel (rarely visited, personal) | RSC | SSR |
| Documentation site (static content + search) | SSG + client search | PPR if search is server-side |

## Hydration — The Cost the Model Cannot Hide

Every model except pure CSR-from-scratch produces HTML that the client must hydrate to be interactive. Hydration walks the existing DOM, reconciles it against the React (or other framework) component tree, and attaches event handlers. The cost is:

- Proportional to the number of components.
- Paid before the page is interactive.
- Visible in INP and TTI metrics.

Strategies that reduce hydration cost:

- **RSC** — server components are omitted from the client bundle; only client components hydrate.
- **Islands architecture** (Astro, Marko, Qwik) — only the marked-interactive parts hydrate; the rest is static HTML forever.
- **Progressive hydration** — hydrate components as they enter the viewport or as the user interacts.
- **Resumability** (Qwik) — the framework serializes the application state into HTML so the client never needs to re-execute initialization code.

A page that uses any model with a 2MB client JS bundle will hydrate slowly regardless of how its HTML was produced. The HTML production speed and the hydration cost are independent.

## Edge Rendering

Edge runtimes (Cloudflare Workers, Vercel Edge, Deno Deploy, Fastly Compute@Edge) move SSR closer to the user. The trade-off:

- **Pro** — geographic proximity reduces TTFB. Cold starts are faster than serverless functions (often single-digit ms).
- **Con** — the runtime is constrained: typically Web Standard APIs (fetch, Request, Response, streams) but not full Node.js. Direct database connections are usually unavailable; data access happens via HTTP to an origin.
- **Hybrid** — edge for the rendering step, origin for the data step. Works well when the data fetch is cacheable; less well when every request requires a fresh database round-trip from the edge.

Edge SSR is most useful when (1) the audience is geographically distributed, (2) per-request rendering is needed, (3) the data layer is HTTP-accessible.

## Partial Prerendering (PPR)

PPR is the most recent addition to the taxonomy. It produces:

1. A static shell at build time (the parts of the page that don't change per request).
2. Streamed dynamic content at request time (the parts that do — user data, personalized blocks, inventory).

The user sees the shell instantly (cache-served), and the dynamic holes fill in via streaming. The model is well-suited for routes where most of the layout is static but small regions are personal (a product page with a "recommended for you" block, a dashboard wrapper with per-user widgets).

PPR is currently first-class in Next.js (App Router); the underlying pattern is general and can be implemented in any framework with streaming SSR and a CDN.

## Verification

After applying this skill, verify:
- [ ] The rendering model for each route is documented (per route, not per app).
- [ ] The choice matches the route's content profile — static content uses build-time models; per-user content uses request-time models.
- [ ] FCP, LCP, INP are measured for representative routes in real-user conditions (not lab-only Lighthouse scores).
- [ ] Hydration cost is acknowledged separately from rendering cost — a "fast SSR" page with a 1MB bundle is not actually fast for the user.
- [ ] Routes mixing server and client work use the appropriate marker (`'use client'` / `'use server'` in React + Next.js, or the equivalent in the chosen framework).
- [ ] SSG and ISR caches are validated to invalidate correctly on content updates (stale-while-revalidate behavior matches expectations).
- [ ] Edge-rendered routes confirm their data access path works at the edge (HTTP-accessible, not direct DB).

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Organizing the frontend codebase folder layout | `frontend-architecture` | frontend-architecture owns module boundaries and component layering; rendering-models owns where and when the UI is produced |
| Deciding what types and values can cross between server and client code | `client-server-boundary` | client-server-boundary owns the serialization frontier and marker directives |
| Designing HTTP caching headers, status codes, or content negotiation | `http-semantics` | http-semantics owns the wire protocol; rendering-models is upstream |
| Setting performance thresholds and failure consequences | `performance-budgets` | performance-budgets owns the threshold-and-consequence contract; rendering-models is one input to what budgets are achievable |
| Profiling a specific slow page and deciding what to fix | `performance-engineering` | performance-engineering owns the diagnostic and optimization activity |
| Composing build pipelines, deploy configs, or platform-specific features | `vercel-composition-patterns` | platform composition is downstream of model choice |

## Key Sources

- React team. [React Server Components RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md). Proposed Dec 2020; integrated into React 18+ and Next.js App Router. The canonical specification of RSC's component-tree serialization model.
- Vercel. [Next.js App Router documentation — Rendering](https://nextjs.org/docs/app/building-your-application/rendering). Reference for how the named models map to the framework's primitives.
- Google Chrome Team. [web.dev — Rendering on the Web](https://web.dev/articles/rendering-on-the-web). Jason Miller and Addy Osmani's matrix of CSR / SSR / SSG / pre-rendering / streaming — the foundational document for the taxonomy.
- Remix team. [Remix loaders and the server-first model](https://remix.run/docs/en/main/route/loader). Reference for the request-time data-loading pattern that informs SSR design beyond React.
- Astro team. [Astro Islands](https://docs.astro.build/en/concepts/islands/). The canonical statement of islands architecture and selective hydration.
- Google. [Core Web Vitals](https://web.dev/articles/vitals). The user-experience metrics (LCP, INP, CLS) that the model choice directly affects.
- Google. [The RAIL Performance Model](https://web.dev/articles/rail). Older but still load-bearing: the interaction-class taxonomy (Response / Animation / Idle / Load) that frames why TTI matters.
- Misko Hevery. ["Hydration is Pure Overhead"](https://www.builder.io/blog/hydration-is-pure-overhead). 2022 essay arguing that hydration cost is the dominant factor in TTI for modern SSR — motivates resumability and islands as alternative architectures.
