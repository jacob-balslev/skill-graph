---
name: rendering-models
description: "Use when reasoning about how a web UI is produced and delivered: client-side rendering, server-side rendering, static-site generation, incremental static regeneration, React Server Components, streaming SSR, edge rendering, and partial prerendering. Covers the time × place grid (build/request/stream/interaction × server/edge/client), the trade-offs between first-paint latency and time-to-interactive, the relationship between rendering and hydration, and how a route's content profile (dynamic / static / personalized) maps to a model. Do NOT use for organizing the frontend codebase (use frontend-architecture), the serialization frontier between server and client code (use client-server-boundary), the wire protocol itself (use http-semantics), or specific deploy-platform composition patterns (use vercel-composition-patterns)."
license: MIT
allowed-tools: Read Grep
metadata:
  schema_version: "7"
  version: "1.0.0"
  type: capability
  category: engineering
  domain: engineering/frontend
  scope: reference
  owner: skill-graph-maintainer
  freshness: "2026-05-15"
  drift_check: "{\"last_verified\":\"2026-05-15\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  comprehension_state: present
  stability: experimental
  keywords: "[\"rendering model\",\"CSR\",\"SSR\",\"SSG\",\"ISR\",\"React Server Components\",\"RSC\",\"streaming SSR\",\"edge rendering\",\"partial prerendering\",\"hydration\",\"time to interactive\",\"first contentful paint\"]"
  triggers: "[\"should this page be server-rendered\",\"static or dynamic\",\"what's the difference between SSR and RSC\",\"why is this page slow to first paint\",\"should this be a client component\"]"
  examples: "[\"decide whether a product page should be SSG with revalidation or SSR\",\"explain why a marketing page is fast but a dashboard is slow despite both 'server rendering'\",\"choose between streaming SSR and a loading skeleton\",\"diagnose why a server component re-renders on every navigation\"]"
  anti_examples: "[\"organize the folder structure of a frontend codebase (use frontend-architecture)\",\"decide what types can cross the network boundary (use client-server-boundary)\",\"design HTTP cache headers (use http-semantics)\"]"
  relations: "{\"related\":[\"frontend-architecture\",\"client-server-boundary\",\"http-semantics\",\"performance-engineering\",\"vercel-composition-patterns\"],\"boundary\":[{\"skill\":\"frontend-architecture\",\"reason\":\"frontend-architecture owns how the codebase is organized; rendering-models owns where and when the UI is produced. A route's architecture and its rendering model are independent decisions.\"},{\"skill\":\"client-server-boundary\",\"reason\":\"client-server-boundary owns the serialization frontier (what can cross between server and client code). rendering-models owns the staging of work across build/request/stream/interaction.\"},{\"skill\":\"http-semantics\",\"reason\":\"http-semantics owns the wire protocol (caching headers, status codes, content negotiation). rendering-models is upstream — it decides what HTML and JS exist; http-semantics decides how they are delivered and cached.\"},{\"skill\":\"performance-engineering\",\"reason\":\"performance-engineering owns measurement, profiling, and optimization across the stack. rendering-models is one input — the choice of model bounds what performance numbers are achievable on a given route.\"}],\"verify_with\":[\"performance-engineering\",\"frontend-architecture\"]}"
  mental_model: "|"
  purpose: "|"
  boundary: "|"
  analogy: "Rendering models are to web pages what cooking styles are to restaurant kitchens — the same ingredients (data, components, markup) get plated differently depending on whether the kitchen pre-cooks at dawn (SSG), cooks to order during service (SSR), streams courses out as they finish (streaming SSR), or hands raw ingredients to the diner to assemble themselves (CSR), and no one style is right for every menu item."
  misconception: "|"
  concept: "{\"definition\":\"A rendering model is the strategy by which a web user interface is produced and delivered, defined by two axes: when the work happens (build time, request time, response stream, or user interaction) and where it executes (server, edge, or client). The choice of model determines first-paint latency, time-to-interactive, server cost, cache behavior, and which content can be indexed by crawlers.\",\"mental_model\":\"|\",\"purpose\":\"|\",\"boundary\":\"|\",\"taxonomy\":\"|\",\"analogy\":\"|\",\"misconception\":\"|\"}"
  structural_verdict: UNVERIFIED
  truth_verdict: UNVERIFIED
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v7
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/engineering/frontend/rendering-models/SKILL.md
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
