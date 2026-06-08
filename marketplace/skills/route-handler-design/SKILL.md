---
name: route-handler-design
description: "Use when designing or reviewing Next.js App Router Route Handlers: route.ts file placement, HTTP method exports, Web Request/Response APIs, body parsing, GET caching and opt-outs, dynamic segments, search params, CORS, Edge vs Node runtime choice, streaming responses, status and header discipline, error responses, and webhook endpoint shape. Use when the caller is mobile, third-party, webhook, server-to-server, cross-origin, or otherwise not your own typed UI. Do NOT use for internal UI mutations, broad API design, abstract HTTP semantics, request preprocessing, or full webhook reliability design. Do NOT use for design an internal create-comment form mutation triggered only from this app's UI (use server-actions-design). Do NOT use for read application data inside a Server Component during render (call the data source directly, not a self-fetch to your own Route Handler). Do NOT use for define the REST contract and resource model for a v2 public API (use api-design)."
license: MIT
allowed-tools: Read Grep
metadata:
  schema_version: "8"
  version: "2.0.0"
  subject: backend-engineering
  taxonomy_domain: engineering/backend
  owner: skill-graph-maintainer
  freshness: "2026-06-07"
  drift_check: "{\"last_verified\":\"2026-06-07\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  comprehension_state: present
  stability: experimental
  keywords: "[\"Next.js Route Handler\",\"route.ts file\",\"GET Route Handler caching\",\"Cache Components use cache\",\"RouteContext typed params\",\"NextRequest geo ip removed\",\"request.json formData parsing\",\"after Route Handler webhook\",\"ReadableStream pull backpressure\",\"Edge runtime vs Node runtime\"]"
  triggers: "[\"how do I expose an API endpoint in Next.js App Router\",\"when should I use a Route Handler instead of a Server Action\",\"why is my Route Handler GET not cached anymore\",\"how do I statically cache a GET Route Handler in Next 15 or 16\",\"how do I type dynamic params in route.ts\",\"how do I receive a webhook in Next.js without breaking raw body verification\",\"how do I ACK a webhook fast and run short work after the response\",\"how do I return a streaming response from an API route\",\"how do I stream a large response with ReadableStream backpressure\",\"how do I parse a JSON body in route.ts\",\"how do I set CORS headers on a Next.js API route\",\"Edge runtime vs Node runtime for an API route\"]"
  examples: "[\"design the route.ts that receives a Stripe webhook — verify signature before parsing the body, return 200 immediately, queue the heavy work\",\"decide whether a 'export user data' endpoint should be a Route Handler or a Server Action\",\"add CORS to a Route Handler that mobile clients call from a different origin\",\"cache a GET Route Handler that returns rarely-changing data (force-static or use cache)\",\"return a streaming binary response (PDF generation, large CSV export) from a Route Handler\"]"
  anti_examples: "[\"design an internal create-comment form mutation triggered only from this app's UI (use server-actions-design)\",\"read application data inside a Server Component during render (call the data source directly, not a self-fetch to your own Route Handler)\",\"define the REST contract and resource model for a v2 public API (use api-design)\",\"explain what an HTTP 422 means vs 400 (use http-semantics)\",\"add an auth check that runs before every protected route in proxy.ts/middleware.ts (use middleware-patterns)\",\"design the idempotency-key + retry + dead-letter-queue strategy for a webhook (use webhook-integration)\",\"design the resource model, versioning, pagination, or error envelope of an HTTP API (use api-design)\",\"decide what an HTTP method, status code, or header should mean per RFC 9110 (use http-semantics)\",\"design signature verification, idempotency keys, retry semantics, or dead-letter queues for vendor webhooks (use webhook-integration)\",\"design a cross-cutting streaming model with Web Streams, SSE, or backpressure (use streaming-architecture)\"]"
  relations: "{\"related\":[\"server-actions-design\",\"api-design\",\"http-semantics\",\"middleware-patterns\",\"webhook-integration\",\"streaming-architecture\",\"client-server-boundary\"],\"verify_with\":[\"code-review\",\"api-design\"]}"
  mental_model: "|"
  purpose: "|"
  analogy: "A Route Handler is to a Next.js app what a service window at a government office is to its workflow — different windows handle different services (`GET /posts`, `POST /comments`); each window has a posted sign saying which forms it accepts and what stamps it returns; you do not walk into the back office (Server Action) unless you work there. The window is the contract: filesystem path = window number, export name = service offered, function body = the clerk's actual work."
  misconception: "|"
  structural_verdict: PASS
  truth_verdict: UNVERIFIED
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-06-07"
  lint_verdict: PASS
  public: "true"
  concept_boundary: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/backend-engineering/route-handler-design/SKILL.md
  skill_graph_export_description: shortened for Agent Skills 1024-character description limit; canonical source keeps the full routing contract
  skill_graph_canonical_description_length: "1972"
  skill_graph_export_description_projection: anti_examples
  skill_graph_export_description_projection_truncated: "true"
---

# Route Handler Design

## Coverage

The discipline of designing Next.js App Router `route.ts` / `route.js` handlers: the file-and-export convention (one async function per HTTP method, one URL per filesystem path), the Web-standard Request/Response interface that replaces the Node `req`/`res` pair, the body-parsing primitives (`request.json` / `formData` / `text` / `blob` / `arrayBuffer`) and one-shot body consumption, the **off-by-default** GET caching behavior (Next 15+) and the opt-in mechanisms (`dynamic = 'force-static'`, the Cache Components `use cache` model), async request APIs (`params`, `cookies()`, `headers()` — `await` required since Next 16) and `RouteContext` typed params, dynamic segments and search-param access, the rule that every Route Handler is a **public** surface that must authenticate/authorize/validate inside the handler, manual CORS, the Edge-vs-Node runtime choice (Node now default and recommended) and deployment knobs (`maxDuration`, `preferredRegion`, static-export limits), streaming responses via `ReadableStream` with `pull()` backpressure, status-code and header discipline, error response shaping, the canonical webhook pattern (verify signature against the raw body before parsing, ACK fast, `after()` for short post-response work), a version-drift map across Next 13→16, and the central design rule that determines when a Route Handler is the right surface at all: **the caller is not your own typed UI or render tree**.

## Philosophy

The App Router collapsed three things that used to be distinct in the Pages Router:

- **Pages**: rendered routes — moved to Server Components and `page.tsx`.
- **API routes**: HTTP endpoints under `/api/*` — moved to Route Handlers in `route.ts`.
- **Custom server handlers**: middleware, edge functions — partly absorbed by `middleware.ts` (renamed `proxy.ts` in Next 16), partly by per-route runtime selection.

The Pages Router `/api/foo.ts` exported a default function taking Node's `req` and `res`. The Route Handler exports per-method async functions taking a Web `Request` and returning a Web `Response`. The change is not cosmetic — it makes Next.js endpoints portable to any runtime that speaks Web standards (Edge, Cloudflare Workers, Deno, browser Service Workers in principle) and removes a category of "Node-specific" footguns.

The deeper shift is that the App Router introduced a *competing* mutation surface in **Server Actions**. Before, every mutation needed an API route. Now, most mutations triggered from the app's own UI should use a Server Action (one declaration, no manual wire format). Route Handlers remain the right surface only when the caller is *not* the Next.js bundler's typed call site — mobile apps, third-party integrations, webhooks, server-to-server calls, server-sent events, binary downloads, and anything else that benefits from explicit HTTP semantics.

The Route Handler is the **public HTTP endpoint** surface. Use it when you need an HTTP endpoint. Use a Server Action when you need a mutation triggered from this app's UI. The two surfaces can coexist — many apps publish a Route Handler `/api/v1/posts` for external clients AND use Server Actions for the same mutations from their own forms. Next's own docs frame Route Handlers as the App Router's "Backend for Frontend" layer: an HTTP endpoint beside the UI, not a full backend replacement for every internal read or write. **Do not fetch your own Route Handler from a Server Component just to read application data** — call the database, service, or cached data helper directly. A self-fetch adds an avoidable HTTP round-trip and can fail during static generation or prerendering, because no request server is running for that internal URL at build time.

**Treat every Route Handler as public.** "Only our frontend calls this" is not a security boundary: a browser, mobile app, script, or server-to-server client can send the same HTTP request. Authentication, authorization, runtime input validation, rate limiting, tenant/user derivation from server-trusted state, and safe error shaping belong inside the handler or in code it calls. A `proxy.ts`/middleware auth redirect can be a useful UX gate, but the route itself must still reject an unauthorized direct request — middleware can be skipped, mis-matched, or bypassed.

## When to Use What

| Caller | Right surface | Why |
|---|---|---|
| This app's `<form>` or button | **Server Action** | One declaration; no wire format; progressive enhancement; revalidation built in |
| This app's component reading data on render | **Server Component / data helper** | No round-trip; co-located with the render that uses the data. Do NOT self-fetch your own Route Handler — call the data source directly |
| Mobile app, third-party integration, server-to-server | **Route Handler** | Explicit HTTP contract; the caller does not run the Next.js bundler |
| Webhook from Stripe / Shopify / GitHub | **Route Handler** | Need raw-body access for signature verification; need exact status codes; vendor expects standard HTTP |
| Streaming SSE, binary downloads, large CSV/PDF | **Route Handler** | Returns a `ReadableStream` with the right headers; Server Actions can't model this |
| Client-side `fetch()` from a Client Component | **Route Handler** if it's a real API, **Server Action** if it's a mutation | Don't fetch your own internal mutation; that's what Server Actions exist to replace |
| Static JSON / feed endpoint (Next 15+) | **Route Handler with explicit static/cache opt-in** | `GET` is dynamic by default in current Next; cache only when the response is safe to share across callers |
| Public API with many nested routes + shared validation | **Route Handler entrypoint, optionally with a small router (e.g. Hono) inside** | Next still owns the `route.ts` entrypoint and the surface-choice discipline; a router library only reduces boilerplate after the Route Handler choice is made |
| Project deployed with `output: 'export'` | **Only a static `GET` Route Handler** | Non-GET handlers and dynamic request-time behavior need a server/runtime |

The single most common Route Handler mistake in App Router code is using a Route Handler for an internal mutation that a Server Action would serve better — duplicate type contracts, manual fetch wiring, no progressive enhancement, no built-in revalidation.

## The File-and-Export Contract

```ts
// app/api/posts/route.ts
export async function GET(request: Request) {
  const posts = await db.post.findMany()
  return Response.json(posts)
}

export async function POST(request: Request) {
  const body = await request.json()
  const created = await db.post.create({ data: body })
  return Response.json(created, { status: 201 })
}
```

The filesystem path `app/api/posts/route.ts` registers `/api/posts`. The exports `GET` and `POST` register the methods. Unhandled methods auto-return `405 Method Not Allowed`. There is no router-level config object, no separate registration step.

A Route Handler file cannot coexist with a `page.tsx` at the same path — `/api/posts/page.tsx` and `/api/posts/route.ts` collide and Next.js rejects the build. Choose one or the other per URL.

The supported method exports are `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, and `OPTIONS`. When you implement `GET`, Next can answer `HEAD` requests for clients that only need headers; implement an explicit `HEAD` export only when the header-only path needs different work or stricter control. Route Handlers can be placed at **any** route segment, not only under `/api` — keep `/api/*` for externally recognizable API surfaces, but route-adjacent handlers such as `app/rss.xml/route.ts` or `app/sitemap.xml/route.ts` are appropriate when the URL is itself the product surface.

### Dynamic segments

```ts
// app/api/posts/[id]/route.ts
import type { NextRequest } from 'next/server'

// Idiomatic Next 15.5+: the generated RouteContext helper types params from the path.
export async function GET(request: NextRequest, ctx: RouteContext<'/api/posts/[id]'>) {
  const { id } = await ctx.params           // params is a Promise — await it
  const post = await db.post.findUnique({ where: { id } })
  return post ? Response.json(post) : new Response(null, { status: 404 })
}
```

`params` is a `Promise` and **must** be awaited — synchronous access was removed in Next 16 (it had a temporary sync-compat shim in Next 15). The `RouteContext<'/path/[id]'>` global helper (generated by `next dev` / `next build` / `next typegen`) is the current idiomatic typing; the older hand-written `{ params: Promise<{ id: string }> }` shape still works and is the right fallback if a project has not generated route types yet. Run `npx next typegen` to regenerate the helpers after changing dynamic segments.

### Search params

```ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = Number(searchParams.get('limit') ?? '20')
  // ...
}
```

`URLSearchParams` is the Web-standard read surface. There is no Next-specific helper for query strings beyond constructing a `URL` from `request.url`. (Note: reading `request.url` is request-time data — under Cache Components it opts the handler out of prerendering, as `cookies()`/`headers()` do.)

## Body Parsing

The `Request` object exposes five body-reading methods:

| Method | Returns | Use when |
|---|---|---|
| `request.json()` | parsed JSON | Content-Type: application/json |
| `request.formData()` | FormData | Content-Type: multipart/form-data or application/x-www-form-urlencoded |
| `request.text()` | string | Plain text, raw payload, or when you need to verify a signature against the raw bytes |
| `request.blob()` | Blob | File upload, binary payload you'll re-serve |
| `request.arrayBuffer()` | ArrayBuffer | Low-level binary processing |

A body can only be read **once**. If you need both the raw body (for HMAC verification) and the parsed body (for handler logic), call `request.text()` and parse it yourself. The webhook section below demonstrates this.

`request.bodyUsed` (a boolean) tells you whether the stream has already been consumed — useful for diagnosing a double-read (`bodyUsed === true` before your read means an earlier line already drained it). `request.clone()` *can* give you a second readable copy, but **clone before reading either branch**, and use it sparingly: the clone forces the runtime to buffer the body so both branches can be read, which creates unbounded memory pressure for large or streamed payloads. For the common raw-and-parsed case, prefer `text()`-then-`JSON.parse` over `clone()` — it buffers once, explicitly, and you control the bound.

## Caching: Off by Default; How to Opt In

> **This is the most-changed area of the Route Handler surface — verify which Next major you target.** In **Next 14**, a `GET` handler that didn't read request-scoped sources was *statically cached by default* and you opted out with `dynamic = 'force-dynamic'`. **Since Next 15 the default flipped: Route Handlers are NOT cached by default.** Every method, including `GET`, runs at request time unless you explicitly opt in. Code and advice written for Next 14 (including "remember to add `force-dynamic`") is now backwards.

If a handler returns user-, tenant-, cookie-, header-, time-, or auth-dependent data, leave it dynamic (the default) and make that intentional with the code you read (`cookies`, `headers`, auth/session helpers, `request.url`) and the tests you write.

To **cache a GET** in the classic (non-Cache-Components) model, opt in with segment config:

```ts
// app/api/posts/route.ts
export const dynamic = 'force-static'       // cache: prerender this GET, serve the same response
// or
export const revalidate = 60                // cache, then revalidate at most every 60s
```

`POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, and `OPTIONS` are never cached, even when placed alongside a cached `GET` in the same file. Only `GET` honors the opt-in.

**Footgun:** `force-static` on a `GET` whose response depends on the request user (auth, cookies, per-user data) serves one user's response to everyone. A cached API response is shared state; never cache a handler that depends on identity unless the cache key is deliberately partitioned by that identity. If the handler is per-user, leave it uncached (the default). Conversely, the old reflex of sprinkling `force-dynamic` everywhere is now redundant in most cases, because uncached is already the default.

### With Cache Components (Next 16 `cacheComponents: true`)

When [Cache Components](https://nextjs.org/docs/app/getting-started/caching) is enabled (`cacheComponents: true` in `next.config`, the stable successor to `experimental.dynamicIO`/`experimental.useCache` and the route-level `experimental_ppr` flag), `GET` Route Handlers follow the same prerender model as UI routes:

- A handler that touches no uncached or runtime data is **prerendered at build time**.
- Reading runtime APIs (`cookies()`, `headers()`, `connection()`, `request.url`, `request.headers`, a DB query, the filesystem, or non-deterministic ops like `Math.random()`) **terminates prerendering** and the handler runs at request time.
- To include *uncached* data (e.g. a DB read) in a prerendered response, wrap it in a `use cache` helper with a `cacheLife` profile. Read request-time APIs (cookies, headers) *outside* the cached scope and pass only serializable values into the cached function when they are meant to be part of the cache key:

```ts
// app/api/products/route.ts
import { cacheLife, cacheTag } from 'next/cache'

export async function GET() {
  const products = await getProducts()
  return Response.json(products)
}

async function getProducts() {
  'use cache'           // CANNOT go directly in the handler body — must be a helper
  cacheLife('hours')
  cacheTag('products')
  return await db.query('SELECT * FROM products')
}
```

`use cache` cannot be placed directly inside the Route Handler body — extract it to a helper. Cached responses revalidate per `cacheLife` on the next request. In Next 16, `cacheLife` and `cacheTag` are stable (drop the old `unstable_` prefix). The old segment options `dynamic`, `revalidate`, and `fetchCache` are removed/disabled under Cache Components — the segment config knobs that remain in that model are `runtime`, `preferredRegion`, `maxDuration`, and `dynamicParams`. Check the project's Next config before suggesting a segment-config fix.

`revalidateTag` now requires a second `cacheLife` argument — the single-arg form is a TS error. In a Route Handler, call `revalidateTag(tag, 'max')` for stale-while-revalidate, or `revalidateTag(tag, { expire: 0 })` when an external webhook needs immediate expiration. `updateTag(tag)` is the Server-Actions-only "read-your-writes" variant for immediate refresh in the same request.

## NextRequest and NextResponse

Standard Web `Request` and `Response` work fine. Next provides extended versions for convenience:

```ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const session = request.cookies.get('session')?.value
  const cursor = request.nextUrl.searchParams.get('cursor')
  return NextResponse.json({ session: Boolean(session), cursor }, { status: 200 })
}
```

`NextRequest` extends `Request` with `.cookies`, `.nextUrl`. `NextResponse` extends `Response` with `.cookies.set/.delete`, `NextResponse.redirect`, `NextResponse.rewrite`, `NextResponse.json` (a convenience that mirrors `Response.json`).

> **Drift fix (Next 15):** `request.geo` and `request.ip` were **removed from `NextRequest`** in Next 15 — and even before that they were only populated in middleware, never in Route Handlers. For geolocation/IP on Vercel, import from `@vercel/functions`:
>
> ```ts
> import { geolocation, ipAddress } from '@vercel/functions'
>
> export function GET(request: Request) {
>   const { country, city } = geolocation(request)
>   const ip = ipAddress(request)
>   // ...
> }
> ```
>
> Off Vercel, read the platform's forwarded headers (`x-forwarded-for`, provider-specific geo headers) directly from `request.headers`. Treat geo/IP as non-security-critical hints — they are spoofable header data, not an authentication signal.

Use `NextRequest`/`NextResponse` when you need cookies. Stick with standard `Request`/`Response` when you don't — it makes the handler more portable.

## Streaming Responses

A Route Handler can return a `ReadableStream` directly. Useful for SSE, AI streaming, large file generation, and chunked CSV/JSON exports.

```ts
export async function GET() {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of generateData()) {
        controller.enqueue(encoder.encode(chunk))
      }
      controller.close()
    },
  })
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  })
}
```

**Backpressure:** the `start(controller)` form above eagerly drains the whole source as fast as the loop runs, enqueueing every chunk regardless of whether the consumer is keeping up — fine for small, bounded, or already-buffered sources, but it buffers an entire slow-consumer backlog in memory for large or iterator-backed streams. For those, drive the stream from the `pull(controller)` method instead: the runtime calls `pull` only when the internal queue wants more (respecting the consumer's read rate and the `highWaterMark`/`CountQueuingStrategy`), so a slow client throttles production instead of forcing you to buffer it all. Reach for `pull` whenever the source is large, unbounded, or backed by an async iterator you don't want to run ahead of the reader.

```ts
function iteratorToStream(iterator: AsyncIterator<Uint8Array>) {
  return new ReadableStream<Uint8Array>({
    async pull(controller) {                 // called on demand, not eagerly
      const { value, done } = await iterator.next()
      if (done) return controller.close()
      controller.enqueue(value)
    },
  })
}
```

The Node runtime streams fine — on Vercel, Fluid Compute supports long-lived streaming responses without the per-connection memory pressure that once made Edge the safer choice. Historically the `Edge` runtime was recommended for long-lived streams (lower per-connection overhead); with standalone Edge Functions now folded onto Vercel Functions and Node recommended (see below), plus Fluid Compute available, **default to Node and verify your host's streaming/buffering behavior** (some platforms buffer Node responses unless you stream explicitly or set the right headers like `Content-Type`, `Cache-Control`, and `Connection`). Test the deployed platform for buffering, timeouts, and abort behavior — these vary by host.

For **AI-specific token streaming**, prefer the official AI SDK response helpers inside the Route Handler rather than hand-rolling the token/SSE protocol. For general streaming design choices (SSE vs WebSocket, backpressure semantics, partial-result correctness), route to `streaming-architecture`.

## The Webhook Pattern

Webhooks need three things almost always: **raw body access, signature verification before parse, fast acknowledgment**.

```ts
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'

export const runtime = 'nodejs'         // some HMAC libs need Node crypto
export const dynamic = 'force-dynamic'  // belt-and-suspenders: never cache a webhook (POST isn't cached anyway)

export async function POST(request: Request) {
  const signature = (await headers()).get('stripe-signature')   // headers() is async (Next 16)
  if (!signature) return new Response('Missing signature', { status: 400 })

  const rawBody = await request.text()  // raw bytes for HMAC

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 })
  }

  // ACK fast — but DURABLY persist the event before returning 200.
  // `await` a real enqueue (a DB row insert, a queue `send`) — NOT a fire-and-forget call.
  // If the process dies after the 200 but before the work is persisted, the vendor's
  // retry is the only thing that saves you, and only if you returned non-2xx. So: persist,
  // then ACK.
  await enqueueEventForProcessing(event)   // durable: DB insert / queue send, awaited
  return new Response(null, { status: 200 })
}
```

Key decisions encoded above:

- **`request.text()`**, not `request.json()` — you need the raw bytes for HMAC; parsing first would mutate whitespace and break verification.
- **`await headers()`** — request-time APIs are async; synchronous access was removed in Next 16.
- **Verify before any business logic** — reject unauthenticated calls with a fast 400 before touching the database.
- **ACK fast, but persist first** — return 200 within seconds, *after* the event is durably handed off (an awaited DB insert or queue `send`). A bare unawaited `queueEventForProcessing(event)` is a footgun: the serverless instance can be frozen or killed the instant you return, dropping in-flight fire-and-forget work with no retry. The durable enqueue is what makes the fast ACK safe; the heavy processing then runs off that queue. Use `after` (next section) only for *droppable* post-response work, never for the critical enqueue. Vendors interpret slow ACKs as failures and retry, which produces duplicate delivery — so the downstream consumer must also be idempotent (that reliability layer is `webhook-integration`).
- **`runtime = 'nodejs'`** — some vendor SDKs need Node-only crypto APIs (Stripe's `constructEvent` does in some versions). Edge supports Web Crypto, but with Node now the default-and-recommended runtime there's rarely a reason to switch a webhook to Edge.

### Keep webhooks out of the proxy/middleware matcher

Exclude webhook paths from the cross-cutting `proxy.ts` / `middleware.ts` `matcher` unless there is a measured reason to include them. Current Next.js proxy can **clone and buffer the request body up to `proxyClientMaxBodySize`** (default 10MB); when a payload exceeds the ceiling the request continues with only a partial body available, and any upstream redirect/header/body manipulation makes raw-signature reasoning harder. The Route Handler should be the first application code that reads the body for exact HMAC verification — anything that buffers, clones, or transforms the body before it reaches the handler can break signature verification on large or exact-signature payloads.

### Post-response work: `after` vs a durable queue

Next ships [`after`](https://nextjs.org/docs/app/api-reference/functions/after) (`import { after } from 'next/server'`; stable since Next 15.1, introduced as `unstable_after` in 15.0) to schedule a callback that runs *after the response is sent* without blocking it — usable in Route Handlers, Server Functions, Server Components, and proxy:

```ts
import { after } from 'next/server'

export async function POST(request: Request) {
  const event = await verifyAndParse(request)
  after(() => logWebhookReceipt(event.id))   // runs post-response; does NOT block the 200
  return new Response(null, { status: 200 })
}
```

`after` is the right tool for **non-critical, fire-and-forget** post-response side effects — analytics, audit logging, cache warming. It replaces the old dangling-promise pattern (an untracked promise started after `return` can be cancelled or time-limited by the platform, and its failures disappear from the request path). But it is **not** a durable work queue: it extends the serverless invocation's lifetime via `waitUntil` and runs within the route's configured `maxDuration`, so if the function instance is killed or crashes before the callback finishes, that work is **lost** with no retry. For webhook processing that *must* happen exactly once — the order is fulfilled, the subscription is provisioned — still hand off to a real queue (the ACK-fast-then-queue pattern above), or persist a receipt before using `after()` to dispatch follow-up work by ID. The two compose: ACK with 200, durably enqueue the critical work, and use `after` for the cheap telemetry around it.

The reliability concerns beyond the endpoint itself — idempotency keys, retry semantics, dead-letter queues, replay protection — belong to `webhook-integration`. This skill covers the framework-specific endpoint surface only.

## CORS

There is no built-in CORS helper in Route Handlers. Set headers manually, and handle the preflight `OPTIONS` request explicitly:

```ts
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://app.example.com',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(request: Request) {
  const data = await request.json()
  return Response.json({ ok: true }, { headers: CORS_HEADERS })
}
```

Never reflexively allow `*` for credentialed requests — it doesn't work with `Access-Control-Allow-Credentials: true` and is a footgun for cookies and auth. Allowlist explicit origins. If credentials are required, add `Access-Control-Allow-Credentials: true` only alongside an explicit allowed origin, never with `*`. Expose any custom response headers browser clients need to read with `Access-Control-Expose-Headers`.

When the allowlist has more than one entry, you reflect the *request's* `Origin` back in `Access-Control-Allow-Origin` per request (the header can carry only one origin, not a list). The moment the header varies by request origin, you **must** also send `Vary: Origin`:

```ts
const ALLOWED = new Set(['https://app.example.com', 'https://admin.example.com'])

function corsHeaders(origin: string | null) {
  const allow = origin && ALLOWED.has(origin) ? origin : ''
  return {
    'Access-Control-Allow-Origin': allow,
    'Vary': 'Origin',                       // so a shared cache keys per-origin
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}
```

Without `Vary: Origin`, a shared/CDN cache can store the CORS response computed for one origin and replay it to a request from a different origin — either leaking access to an origin you meant to allow only conditionally, or wrongly denying a permitted one. `Vary: Origin` tells the cache to key on the request `Origin`.

If many routes need the same CORS policy, push it to `middleware-patterns` (or `next.config` headers). Note the Next 16 rename: `middleware.ts` → `proxy.ts`, which runs on the Node runtime only and is meant primarily for request modification, rewrites, and redirects. It can set/forward response headers (so global CORS header injection remains viable) **and it can return a `Response`/`NextResponse` directly** — e.g. short-circuiting an unauthenticated request with `Response.json({ error }, { status: 401 })`, or answering a CORS preflight with `NextResponse.json({}, { headers })` (this has been supported since the advanced-middleware release in Next 13.1). What still belongs in a Route Handler is the *route's own* response — the resource body, streamed output, the per-method GET/POST/etc. handler — not an early-exit guard. Next positions proxy as a last resort; reach for it for cross-cutting interception, not as the place to author an endpoint's real payload.

## Status Codes and Errors

Honor HTTP semantics (see `http-semantics` for the full discipline):

- **200** — success with body
- **201** — created (returning the new resource)
- **202** — accepted: the work was handed off and will complete asynchronously (return an operation/status resource)
- **204** — success, no body
- **400** — client error: malformed input
- **401** — unauthenticated
- **403** — authenticated but not authorized
- **404** — resource not found
- **409** — conflict (e.g., duplicate)
- **422** — validation failure (unprocessable entity)
- **429** — rate limited
- **500** — unexpected server error
- **503** — temporarily unavailable

```ts
export async function POST(request: Request) {
  try {
    const parsed = Schema.safeParse(await request.json())
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 422 })
    }
    const created = await db.post.create({ data: parsed.data })
    return Response.json(created, { status: 201 })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

A thrown exception that escapes the handler becomes a 500. That's a usable fallback, but explicit `try/catch` plus a structured error envelope is better for any handler clients consume programmatically.

## Runtime and Deployment

```ts
export const runtime = 'nodejs'     // the default; 'edge' is still a documented, selectable runtime
export const maxDuration = 30       // seconds the function may run (also bounds `after()` work)
export const preferredRegion = 'iad1'
```

| Capability | Edge | Node |
|---|---|---|
| Web Crypto (`crypto.subtle`) | ✅ | ✅ |
| Node `crypto` module | ❌ | ✅ |
| Node `fs`, `child_process`, `net` | ❌ | ✅ |
| Most npm packages | ⚠️ depends on package | ✅ |
| Cold start | ~10–50ms (historical edge) | greatly reduced by Fluid Compute: bytecode caching + Scale-to-One warm instances |
| Memory ceiling | lower | higher |
| Long-lived streams | ✅ historically | ✅ on Fluid Compute |
| Vendor SDKs that need Node crypto | ❌ check vendor support | ✅ |

Pick the runtime by **dependency surface, data locality, resource/duration profile, and measured behavior** — not by a "faster" reflex:

- **Use Node when** the handler needs Node `crypto`/`fs`, database drivers, native modules, or vendor SDKs that assume Node; when work is close to a regional database; or when it needs higher memory / longer duration.
- **Use Edge when** the handler uses only Web APIs (`fetch`, Web Crypto, Web Streams), all imports are Edge-compatible, the work is lightweight and short, and geographic low latency near callers (without cross-region data penalties) genuinely wins.

> **Platform shift — read the scope precisely (verify the exact wording/date against the live Vercel changelog).** Vercel **folded the standalone *Edge Functions product* onto Vercel Functions** (the "Edge Middleware and Edge Functions are now powered by Vercel Functions" changelog) and now recommends the **Node.js runtime** for new work, citing full API support, Fluid Compute, and Active CPU pricing. This is **not** the same as the Next.js `export const runtime = 'edge'` option disappearing: the Edge runtime is still a documented, selectable runtime, and `runtime = 'edge'` still works at the framework level. The accurate summary is *Node is now the default and recommended target; Edge remains selectable* — not "Edge is gone." (The two models that proposed this enrichment cited conflicting effective dates; do not assert a specific cutoff date as fact — confirm it against the live changelog before quoting.) Fluid Compute (enabled by default for new Vercel projects since 2025) plus Node bytecode caching and Scale-to-One warm instances closed most of the cold-start gap that was Edge's headline advantage, which is *why* the recommendation flipped. Off Vercel, the Edge runtime maps to whatever Web-standard runtime your host provides — evaluate that host's own guidance.

**Default to Node** — it is now both the framework default and the recommended target. Reach for `runtime = 'edge'` only with a concrete, host-supported reason. Always re-test after switching — package compatibility breaks often, and the historical "Edge is faster" intuition no longer holds by default.

### Deployment constraints

Where a Route Handler can run depends on how the app is deployed — design with the target in mind:

- **Static export (`output: 'export'`)** ships only static assets, so **only a fully static `GET` works** — it must declare `export const dynamic = 'force-static'` and read no request-scoped data. Any handler that needs the request (other methods, dynamic GETs, webhooks) is unsupported under export and needs a server runtime instead. (`proxy.ts`/`middleware` is likewise unsupported in static export.)
- **Lambda-style / serverless deploys** run each invocation in an isolated, possibly cold instance. A handler **cannot rely on shared in-memory state** (a module-level counter or cache is per-instance and evaporates) **or on a persistent local filesystem** across requests. Use external state — a database, Redis, object storage, or the platform's runtime cache — for anything that must survive between requests or be shared across instances.
- **Long-lived connections don't fit this surface.** A Route Handler models one request → one response (it *can* stream a `ReadableStream`, but the request still completes). **WebSockets and other persistent bidirectional connections are not a Route Handler** — Vercel Functions do not support native WebSocket servers; run them on a dedicated WebSocket server or a realtime platform service.
- **Long work should not hold a Route Handler open.** Return `202 Accepted` plus an operation/status resource (see `api-design`) or enqueue a job/webhook pipeline, rather than blocking the response past `maxDuration`. `after()` covers *short* post-response work only, bounded by `maxDuration`; it is not a durable queue.

## Version Drift Map (Next 13 → 16)

This surface moves fast. When reading or reviewing existing code, identify the target Next major first:

| Concern | Next 13/14 | Next 15 | Next 16 |
|---|---|---|---|
| GET caching default | **cached** by default; opt out with `force-dynamic` | **NOT cached** by default; opt in with `force-static` | same as 15; plus Cache Components (`use cache`) model |
| `params` typing | plain object (sync) | `Promise` (sync-compat shim) | `Promise`, sync access **removed**; use `RouteContext<…>` |
| `cookies()` / `headers()` | sync | async (sync-compat shim) | async, sync access **removed** |
| `request.geo` / `request.ip` | middleware-only | **removed** → `@vercel/functions` | removed |
| Cross-route preprocessing file | `middleware.ts` (Edge) | `middleware.ts` (Edge) | renamed `proxy.ts`, **Node-only**; can return a `Response`/`NextResponse` (e.g. auth short-circuit), but authoring an endpoint's real payload still belongs in a Route Handler |
| PPR / dynamic IO | experimental flags | `experimental.ppr` / `dynamicIO` | `cacheComponents: true` (stable); old flags + `dynamic`/`revalidate`/`fetchCache` segment options removed in that model |
| Edge runtime (Vercel) | standalone | standalone Edge Functions folded onto Vercel Functions | Node recommended for new work; `runtime = 'edge'` still selectable |
| `revalidateTag` | `revalidateTag(tag)` | `revalidateTag(tag)` (single-arg deprecating) | `revalidateTag(tag, profile)` required (e.g. `'max'` or `{ expire: 0 }`); `updateTag` for read-your-writes |

## Common Anti-Patterns

| Anti-pattern | Why it's wrong | Fix |
|---|---|---|
| Using a Route Handler for an internal mutation triggered from this app's UI | Duplicate type contracts, manual fetch wiring, no progressive enhancement, no built-in revalidation | Use a Server Action |
| A Server Component `fetch()`-ing your *own* Route Handler to read internal data | Pointless extra HTTP round-trip (and serialization) to call code already running on the same server; loses direct typing and request-scoped context; can fail during prerender/build (no request server for the internal URL) | Call the data-access function (DB query, service module, cached helper) directly in the Server Component. Route Handlers are for *external* callers, not for the app fetching itself |
| Relying on `proxy.ts`/middleware auth as the *only* protection for a Route Handler | Proxy/middleware can be skipped, mis-matched, or bypassed; direct HTTP callers still reach the route | Enforce authn/authz/validation inside the handler or the data layer; treat middleware as a UX gate, not the security boundary |
| Calling `request.json()` on a webhook before HMAC verification | The parse can mutate whitespace; signature verification fails | Read `request.text()`, verify against raw bytes, then `JSON.parse` |
| Letting `proxy.ts` / `middleware.ts` run on webhook endpoints by default | Body buffering/clone (`proxyClientMaxBodySize`) and upstream transforms can interfere with exact raw-body HMAC verification | Exclude webhook paths from the matcher; verify the raw body in the handler |
| Carrying Next 14's `force-dynamic` reflex into Next 15+ | Redundant — GET is already uncached by default; signals a stale mental model that may also wrongly assume caching elsewhere | Rely on the uncached default; add `force-static`/`revalidate` only to *opt in* to caching |
| `force-static` on a GET whose response depends on the request user | Caches and serves one user's data to everyone | Leave per-user GETs uncached (the default); cache only request-independent responses |
| Reading `params`, `cookies()`, or `headers()` synchronously | Removed in Next 16; throws / type-errors | `await` them; type the context with `RouteContext<'/path/[id]'>` |
| Reading `request.geo` / `request.ip` | Removed from `NextRequest` in Next 15 (middleware-only before that) | `geolocation()` / `ipAddress()` from `@vercel/functions`, or forwarded headers off Vercel |
| Putting `'use cache'` directly in the handler body | Not allowed; build error | Extract the cached work to a helper function with `'use cache'` + `cacheLife` |
| Slow webhook ACK because the handler awaits the heavy work inline | Vendor retries; duplicate processing | Durably enqueue the work, then return 200 |
| Fire-and-forget `queueEventForProcessing(event)` (unawaited) before returning 200, or starting an untracked promise after return | The serverless instance can freeze/die the instant you return; in-flight non-durable work is dropped with no retry, and failures vanish from the request path | `await` a durable enqueue (DB insert / queue `send`) *before* the 200; use `after` only for droppable post-response work |
| Reflecting the request `Origin` in `Access-Control-Allow-Origin` without `Vary: Origin` | A shared/CDN cache replays one origin's CORS response to a different origin | Send `Vary: Origin` whenever the CORS headers depend on the request origin |
| Throwing inside the handler and letting it become a generic 500 | Client gets no actionable error | Catch, log, return a structured error envelope with the right status code |
| Reflexive `Access-Control-Allow-Origin: '*'` with credentialed requests | Browser refuses to send credentials; auth breaks | Allowlist explicit origins; never combine `*` with credentials |
| Putting a `route.ts` and a `page.tsx` at the same path | Build error | Choose one — the URL has one purpose |
| Reading `request.body` as a stream and also trying `request.json()` | Body is consumed once | Pick one read method; if you need both raw and parsed, read text and parse yourself |
| Mixing App Router Route Handlers with Pages Router `pages/api/*` patterns (`req.body`, `res.status`) | Different API surfaces; types don't transfer | App Router uses Web Request/Response; rewrite to that shape |
| Streaming large/iterator-backed output from an eager `start()` loop | Overproduces chunks before the client is ready; unbounded memory pressure | Drive the stream from `ReadableStream` `pull(controller)` so backpressure controls production |
| Hand-rolling an API subrouter with `if`/`switch` conditionals in one catch-all handler | Hard to read and test once the endpoint set grows | Split by Next filesystem routes, or mount a small router (e.g. Hono) deliberately behind the `route.ts` entrypoint |
| Reaching for `runtime = 'edge'` "because it's faster" | Vercel now recommends Node (standalone Edge Functions were folded onto Vercel Functions); Fluid Compute closed the cold-start gap; Edge's capability surface breaks many SDKs | Default to Node; switch to Edge only with a concrete, host-supported reason |

## Verification

After applying this skill, verify:

- [ ] The handler's caller is genuinely external (mobile, third-party, webhook, cross-origin client) or needs explicit HTTP semantics — otherwise it should be a Server Action or Server Component.
- [ ] Every public Route Handler authenticates, authorizes, validates input at runtime, and derives tenant/user identity from server-trusted state — not from "only our frontend calls this."
- [ ] No Server Component self-fetches a Route Handler for internal reads — Server Components call the data function directly.
- [ ] Each HTTP method that the endpoint should support is a named export; unsupported methods are not exported.
- [ ] Body is read exactly once (or read as `text()` and parsed manually when raw bytes are needed); `request.clone()` is not used to double-read a large/streamed body (it forces unbounded buffering).
- [ ] The Next.js version and Cache Components setting were identified before applying caching guidance; GET is uncached by default (Next 15+); `force-static`/`revalidate`/`use cache` is added only when caching is actually wanted and the response is request-independent.
- [ ] `params`, `cookies()`, and `headers()` are awaited (mandatory Next 16); dynamic-segment context is typed (`RouteContext<…>` or an explicit `Promise<…>` shape).
- [ ] No `request.geo` / `request.ip` (removed Next 15) — geolocation/IP comes from `@vercel/functions` or forwarded headers, and is treated as non-security-critical.
- [ ] Webhook handlers verify signature against the raw body before any parsing or business logic, and ACK within the vendor's timeout budget by *durably* enqueuing the work (awaited DB insert / queue `send`) before the 200 — not via an unawaited fire-and-forget call.
- [ ] Webhook routes are excluded from `proxy.ts`/`middleware.ts` matchers unless body-size, raw-signature, and timeout implications were tested.
- [ ] Status codes match the response semantics (201 for created, 202 for accepted-async, 422 for validation failure, 401 vs 403 distinguished).
- [ ] Errors are caught and returned with a structured envelope, not allowed to become bare 500s.
- [ ] CORS headers — if needed — are explicit allowlists, not `*` with credentials, an `OPTIONS` handler is present, `Vary: Origin` is set when the response varies by request origin, and only needed headers are exposed.
- [ ] Runtime choice (`edge` vs `nodejs`) is intentional and host-supported, accounting for dependency surface, data locality, `maxDuration`, and streaming behavior; Node is the default and recommended target, but `runtime = 'edge'` is still selectable.
- [ ] Post-response side effects use `after` only for non-critical, droppable work bounded by `maxDuration`; exactly-once webhook processing is handed to a durable queue, not `after`. Long work returns `202 Accepted` rather than holding the handler open.
- [ ] Large or iterator-backed streaming responses use `ReadableStream` `pull()` or another backpressure-aware source.
- [ ] The handler's deployment target is accounted for: no reliance on shared in-memory state or a persistent local filesystem on serverless; only a `force-static` GET is used under `output: 'export'`; persistent/WebSocket connections are not modeled as a Route Handler.

## Grounding Sources

- Next.js docs — [Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers). The canonical reference for the `route.ts` convention (verified against Next 16.2, 2026-06-07: GET uncached by default, opt in with `force-static`; Cache Components `use cache` model; `RouteContext` helper).
- Next.js docs — [`route.js` file convention / `RouteContext`](https://nextjs.org/docs/app/api-reference/file-conventions/route). The per-route export contract and the generated typed-params helper.
- Next.js docs — [Upgrading to Version 15](https://nextjs.org/docs/app/guides/upgrading/version-15). The GET-caching-default change and the `NextRequest` geo/ip removal.
- Next.js docs — [Upgrading to Version 16](https://nextjs.org/docs/app/guides/upgrading/version-16). Async request APIs now mandatory; `middleware`→`proxy`; `cacheComponents`; `revalidateTag`/`updateTag`; PPR via `cacheComponents`.
- Next.js docs — [Route Segment Config](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config). `dynamic`, `revalidate`, `runtime`, `maxDuration`, `preferredRegion`, `dynamicParams`, and which knobs survive under Cache Components.
- Next.js docs — [Caching (Cache Components)](https://nextjs.org/docs/app/getting-started/caching) and [`use cache`](https://nextjs.org/docs/app/api-reference/directives/use-cache) / [`cacheLife`](https://nextjs.org/docs/app/api-reference/functions/cacheLife) / [`cacheTag`](https://nextjs.org/docs/app/api-reference/functions/cacheTag). The prerender model for Route Handlers.
- Next.js docs — [`revalidateTag`](https://nextjs.org/docs/app/api-reference/functions/revalidateTag). The current two-argument signature.
- Next.js docs — [`after`](https://nextjs.org/docs/app/api-reference/functions/after). Post-response side-effect scheduling (stable since 15.1, `unstable_after` in 15.0); runs via `waitUntil`, bounded by `maxDuration`, not a queue replacement.
- Next.js docs — [`proxy.ts` (file convention)](https://nextjs.org/docs/app/api-reference/file-conventions/proxy), [`proxyClientMaxBodySize`](https://nextjs.org/docs/app/api-reference/config/next-config-js/proxyClientMaxBodySize), and [middleware-to-proxy](https://nextjs.org/docs/messages/middleware-to-proxy). The rename, Node-only runtime, body-buffering ceiling, and "return a response directly."
- Next.js docs — [Backend for Frontend](https://nextjs.org/docs/app/guides/backend-for-frontend). Frames Route Handlers as the App Router's BFF/public-endpoint layer; the Server-Component-self-fetch anti-pattern and the lambda shared-state / static-export deployment caveats.
- Vercel docs — [`@vercel/functions` API reference](https://vercel.com/docs/functions/functions-api-reference/vercel-functions-package). `geolocation()` / `ipAddress()` — replacements for the removed `NextRequest.geo`/`.ip`.
- Vercel docs — [Edge Runtime](https://vercel.com/docs/functions/runtimes/edge), [Fluid compute](https://vercel.com/docs/fluid-compute), [Streaming functions](https://vercel.com/docs/functions/streaming-functions), and the changelog [Edge Middleware and Edge Functions are now powered by Vercel Functions](https://vercel.com/changelog/edge-middleware-and-edge-functions-are-now-powered-by-vercel-functions). Standalone Edge Functions folded onto Vercel Functions; Node recommended; Edge runtime still selectable; Fluid Compute cold-start mitigations. (Verify the exact wording/effective date against the live changelog before quoting it — the two enrich models cited conflicting dates.)
- MDN — [Fetch API: Request](https://developer.mozilla.org/en-US/docs/Web/API/Request) and [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response), plus [`Request.bodyUsed`](https://developer.mozilla.org/en-US/docs/Web/API/Request/bodyUsed), [`Request.clone()`](https://developer.mozilla.org/en-US/docs/Web/API/Request/clone), and [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream). The Web-standard interface; single-read body contract; `clone()` buffering cost; `pull()` backpressure.
- RFC 9110 — [HTTP Semantics](https://datatracker.ietf.org/doc/html/rfc9110). Method semantics, status code semantics, header semantics. The contract Route Handlers honor.
- Stripe docs — [Verifying webhook signatures](https://stripe.com/docs/webhooks#verify-events). The canonical example of the raw-body / verify-before-parse pattern that drives Route Handler webhook design.
- WHATWG Streams — [Streams Living Standard](https://streams.spec.whatwg.org/). The `ReadableStream` interface used for streaming responses.
- Hono docs — [Next.js integration](https://hono.dev/docs/getting-started/nextjs). Optional in-handler subrouting (`app/api/[[...route]]/route.ts` exporting `GET = handle(app)`) that composes *inside* — not instead of — the Route Handler entrypoint.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Designing an internal mutation triggered only from this app's UI | `server-actions-design` | Server Actions are the right surface for in-app mutations — one declaration, no wire format, progressive enhancement. |
| Reading application data inside a Server Component during render | call the data source directly (DB/service/cached helper) | A Server Component self-fetching its own Route Handler adds an HTTP round-trip and can fail during prerender/build — there is no request server for the internal URL. |
| Designing the broader REST/RPC contract: resources, versioning, pagination, error envelopes | `api-design` | api-design owns the contract; this skill owns the Next.js implementation surface that hosts the contract. |
| Understanding what each HTTP method or status code means in the abstract | `http-semantics` | http-semantics owns the protocol semantics; this skill owns honoring them in App Router. |
| Adding auth, locale, or header injection across many routes (`middleware.ts` / `proxy.ts`) | `middleware-patterns` | middleware/proxy runs once before route resolution and applies to many routes; Route Handlers run per-route per-method. |
| The full webhook reliability story: idempotency, retries, dead-letter queues, replay protection | `webhook-integration` | webhook-integration owns the cross-vendor reliability discipline; this skill covers the endpoint surface only. |
| The cross-cutting streaming model: Web Streams, SSE, RSC streaming, backpressure | `streaming-architecture` | streaming-architecture covers streaming as a concept; this skill covers the Route Handler streaming surface specifically. |
| The serialization/directive mechanics of `'use client'` and `'use server'` | `client-server-boundary` | Different boundary — client-server-boundary is for the bundler's component split, not for HTTP endpoints. |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `backend-engineering`
- Domain: `engineering/backend`

**When to use**
- design the route.ts that receives a Stripe webhook — verify signature before parsing the body, return 200 immediately, queue the heavy work
- decide whether a 'export user data' endpoint should be a Route Handler or a Server Action
- add CORS to a Route Handler that mobile clients call from a different origin
- cache a GET Route Handler that returns rarely-changing data (force-static or use cache)
- return a streaming binary response (PDF generation, large CSV export) from a Route Handler
- Triggers: `how do I expose an API endpoint in Next.js App Router`, `when should I use a Route Handler instead of a Server Action`, `why is my Route Handler GET not cached anymore`, `how do I statically cache a GET Route Handler in Next 15 or 16`, `how do I type dynamic params in route.ts`, `how do I receive a webhook in Next.js without breaking raw body verification`, `how do I ACK a webhook fast and run short work after the response`, `how do I return a streaming response from an API route`, `how do I stream a large response with ReadableStream backpressure`, `how do I parse a JSON body in route.ts`, `how do I set CORS headers on a Next.js API route`, `Edge runtime vs Node runtime for an API route`

**Not for**
- design an internal create-comment form mutation triggered only from this app's UI (use server-actions-design)
- read application data inside a Server Component during render (call the data source directly, not a self-fetch to your own Route Handler)
- define the REST contract and resource model for a v2 public API (use api-design)
- explain what an HTTP 422 means vs 400 (use http-semantics)
- add an auth check that runs before every protected route in proxy.ts/middleware.ts (use middleware-patterns)
- design the idempotency-key + retry + dead-letter-queue strategy for a webhook (use webhook-integration)
- design the resource model, versioning, pagination, or error envelope of an HTTP API (use api-design)
- decide what an HTTP method, status code, or header should mean per RFC 9110 (use http-semantics)
- design signature verification, idempotency keys, retry semantics, or dead-letter queues for vendor webhooks (use webhook-integration)
- design a cross-cutting streaming model with Web Streams, SSE, or backpressure (use streaming-architecture)

**Related skills**
- Verify with: `code-review`, `api-design`
- Related: `server-actions-design`, `api-design`, `http-semantics`, `middleware-patterns`, `webhook-integration`, `streaming-architecture`, `client-server-boundary`

**Concept**
- Mental model: |
- Purpose: |
- Analogy: A Route Handler is to a Next.js app what a service window at a government office is to its workflow — different windows handle different services (`GET /posts`, `POST /comments`); each window has a posted sign saying which forms it accepts and what stamps it returns; you do not walk into the back office (Server Action) unless you work there. The window is the contract: filesystem path = window number, export name = service offered, function body = the clerk's actual work.
- Common misconception: |

**Keywords**
- `Next.js Route Handler`, `route.ts file`, `GET Route Handler caching`, `Cache Components use cache`, `RouteContext typed params`, `NextRequest geo ip removed`, `request.json formData parsing`, `after Route Handler webhook`, `ReadableStream pull backpressure`, `Edge runtime vs Node runtime`

<!-- skill-graph-context:end -->
