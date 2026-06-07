---
name: middleware-patterns
description: "Use when designing or reviewing Next.js middleware: the single middleware.ts request preprocessor, Edge Runtime constraints, matcher config, NextRequest/NextResponse APIs, redirects, rewrites, pass-through responses, direct responses, auth gates, locale routing, A/B rewrites, security-header delivery, geo routing, bot blocking, and request ID injection. Use for fast cross-cutting request concerns that apply across many routes. Do NOT use for per-route API handlers, Server Actions, HTTP semantics, full security policy design, streaming logic, or webhook signature handling. Do NOT use for implement a /api/posts POST endpoint (use route-handler-design). Do NOT use for implement a delete-comment mutation triggered from a form button (use server-actions-design). Do NOT use for explain what an HTTP 308 means vs 307 (use http-semantics). Do NOT use for design the full CSP policy and the rest of the security-header strategy (use security-fundamentals)."
license: MIT
allowed-tools: Read Grep
metadata:
  schema_version: "8"
  version: "2.0.0"
  subject: frontend-engineering
  deployment_target: portable
  scope: "Designing and reviewing the Next.js request-preprocessing layer — the single root file (`proxy.ts` since Next.js 16, function `proxy`, Node.js runtime; or the deprecated-but-retained `middleware.ts`, function `middleware`, Edge Runtime by default with a Node.js opt-in since 15.5) that runs cross-cutting request/response transforms before route resolution. Covers the proxy↔middleware runtime split and its capability consequences, the matcher config (including the `_next/data` always-runs and Server-Function-coverage gotchas), the NextRequest/NextResponse API (cookies/headers; geolocation()/ipAddress() from @vercel/functions after the Next.js 15 geo/ip removal), the four response shapes (next/rewrite/redirect/direct), waitUntil background work, the official next/experimental/testing/server utilities, the canonical patterns (auth gate, locale routing, A/B testing, header injection, geo-routing, bot blocking), the per-matched-request performance cost, the CVE-2025-29927 lesson that this layer is not a security boundary, and the rule that it is for cross-cutting concerns, never per-route business logic. Portable across Next.js App Router projects; principle-grounded, not repo-bound. Excludes per-route endpoint logic (route-handler-design), the Server Action surface (server-actions-design), abstract HTTP semantics (http-semantics), CSP and hardening (security-fundamentals), and the streaming model (streaming-architecture)."
  taxonomy_domain: engineering/frontend
  owner: skill-graph-maintainer
  freshness: "2026-06-06"
  drift_check: "{\"last_verified\":\"2026-06-06\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  comprehension_state: present
  stability: experimental
  keywords: "[\"Next.js middleware\",\"proxy.ts Next.js 16\",\"middleware.ts to proxy\",\"NextRequest NextResponse\",\"matcher config\",\"Edge vs Node runtime middleware\",\"NextResponse redirect rewrite next\",\"auth check before route\",\"locale routing i18n middleware\",\"CSP nonce middleware\"]"
  triggers: "[\"how do I redirect unauthenticated users to login in Next.js\",\"how do I run code before every request in Next.js\",\"should I use middleware.ts or proxy.ts in Next.js 16\",\"how do I migrate middleware.ts to proxy.ts\",\"how do I set security headers globally in Next.js\",\"how do I do locale routing in App Router\",\"why does my middleware run on static assets\",\"can middleware do a database query\",\"how do I read geo or IP in Next.js middleware now\",\"is Next.js middleware a security boundary\"]"
  examples: "[\"design proxy.ts that redirects unauthenticated users to /login while letting public routes through, configured via a matcher\",\"migrate my Next.js 15 middleware.ts auth gate to the Next.js 16 proxy.ts convention\",\"add a proxy that generates a per-request CSP nonce and injects it into both the request and response headers\",\"implement locale routing that detects Accept-Language and rewrites /about to /en/about for new visitors\",\"my geo-routing broke after upgrading to Next.js 15 because request.geo is undefined — how do I read country now\",\"is it safe to rely on middleware to protect /admin, or do I need route-level auth too\"]"
  anti_examples: "[\"implement a /api/posts POST endpoint (use route-handler-design)\",\"implement a delete-comment mutation triggered from a form button (use server-actions-design)\",\"explain what an HTTP 308 means vs 307 (use http-semantics)\",\"design the full CSP policy and the rest of the security-header strategy (use security-fundamentals)\",\"design a long-lived SSE stream from middleware (use streaming-architecture)\",\"design the CSP policy, threat model, or OWASP audit for a system (use security-fundamentals)\",\"decide what an HTTP method, status code, or header should mean per RFC 9110 (use http-semantics)\",\"design signature verification, idempotency, or retry semantics for vendor webhooks (use webhook-integration)\"]"
  relations: "{\"related\":[\"route-handler-design\",\"server-actions-design\",\"http-semantics\",\"security-fundamentals\",\"server-components-design\",\"client-server-boundary\",\"webhook-integration\"],\"boundary\":[{\"skill\":\"server-actions-design\",\"reason\":\"server-actions-design owns the internal-mutation surface invoked from the app's own UI; the proxy/middleware layer is the cross-cutting request preprocessor that runs before any route or action. A Server Action call passes through proxy on its way to the server — but only if its route matches the matcher.\"},{\"skill\":\"server-components-design\",\"reason\":\"server-components-design owns the render path that produces a page; proxy runs upstream of render and can rewrite, redirect, or pass through. Proxy does not replace render; it gates and rewrites it.\"}],\"verify_with\":[\"code-review\",\"security-fundamentals\"]}"
  mental_model: "|"
  purpose: "|"
  boundary: "|"
  analogy: "The proxy/middleware layer is to a Next.js app what a building's lobby concierge is to its offices — every visitor passes through the lobby before reaching any specific floor; the concierge can glance at ID badges (auth UX gate), redirect visitors to the right elevator (locale or A/B rewrite), hand out lanyards with security policies attached (CSP nonce, request-ID header), or turn away obvious bad-faith visitors at the door (bot block) — but a concierge's glance is not the vault lock: the office door still verifies you (route-level auth), because anyone who slips past the lobby (CVE-2025-29927) must still be stopped at the office itself."
  misconception: "|"
  concept: "{\"definition\":\"The Next.js request-preprocessing layer is a single async function exported from one root file (`proxy.ts`/`proxy` since Next.js 16 on the Node.js runtime; the deprecated `middleware.ts`/`middleware` on the Edge Runtime) that runs before route resolution for every request matching its `matcher` config. It receives a `NextRequest` and returns a `NextResponse` (or implicitly `NextResponse.next()`), and can do four things: pass through (`next`), rewrite to a different internal path (`rewrite`), redirect to a different URL (`redirect`), or short-circuit with a direct response. It runs once per request before any page render, Server Component fetch, Server Action, or Route Handler executes — making it the place to apply genuinely cross-cutting concerns, while never being the authorization boundary itself.\",\"mental_model\":\"|\",\"purpose\":\"|\",\"boundary\":\"|\",\"taxonomy\":\"|\",\"analogy\":\"|\",\"misconception\":\"|\"}"
  structural_verdict: PASS
  truth_verdict: PASS
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/frontend-engineering/middleware-patterns/SKILL.md
  skill_graph_export_description: shortened for Agent Skills 1024-character description limit; canonical source keeps the full routing contract
  skill_graph_canonical_description_length: "1661"
  skill_graph_export_description_projection: anti_examples+boundary
  skill_graph_export_description_projection_truncated: "true"
---

# Middleware Patterns

> **Next.js 16 rename.** The root request-preprocessing file is now **`proxy.ts`** (exported function **`proxy`**). The `middleware.ts`/`middleware` convention is **deprecated** — it still works (a build warning, no error) and is retained specifically for **Edge Runtime** use cases, but Vercel's recommended path is `proxy.ts`. This skill uses **"proxy/middleware"** for the shared concept and names the file explicitly when the distinction matters. If you are on Next.js 15 or earlier, everything here applies under the `middleware.ts` name. See [§ The File Contract](#the-file-contract) and [§ Migrating middleware.ts → proxy.ts](#migrating-middlewarets--proxyts).

## Coverage

The discipline of designing the Next.js request-preprocessing layer: the one-file-per-project contract (`proxy.ts` since Next.js 16, or the deprecated `middleware.ts`, at the root or under `src/`, single function export), the **runtime split** (`proxy` runs on Node.js and its `runtime` config throws; `middleware.ts` runs on Edge with the Edge capability ceiling) and what each runtime can and cannot do, the `matcher` config that filters which paths trigger the layer (including the `_next/data`-always-runs and Server-Function-coverage gotchas), the `NextRequest` / `NextResponse` API surface (cookies, headers, and `geolocation()`/`ipAddress()` from `@vercel/functions` since `request.geo`/`request.ip` were removed in Next.js 15), the four response shapes (`next`, `rewrite`, `redirect`, direct response), `waitUntil` for background work, the official `next/experimental/testing/server` test utilities, the canonical pattern library (authentication UX gate, locale routing, A/B testing, security header injection, geo-routing, bot blocking, request-id correlation), the performance discipline that every matched request pays the cost, the **CVE-2025-29927** lesson that this layer is not a security boundary, and the central design rule: it is for cross-cutting concerns that apply across many routes — never for per-route business logic.

## Philosophy

The Pages Router's request lifecycle was: server hits `getServerSideProps`, which returns props, which render the page. The App Router added more layers (Server Components, Server Actions, Route Handlers), but kept one thing constant — they all run *after* the route is resolved.

The proxy/middleware layer runs *before*. It is the only layer where you can intercept a request without knowing which route it will eventually hit. That makes it the right home for concerns that apply across the entire app or large subsets of it: "every request needs a request-id header", "every request to `/admin/*` needs a role check", "every page needs a CSP nonce".

Next.js 16's rename from `middleware` to `proxy` encodes a deliberate stance. The team renamed it because "middleware" invited Express-style "do all my server logic here" misuse, and because the feature behaves as a **network proxy in front of the app**. Vercel now frames it as a feature to "use as a last resort" — reach first for native `next.config` `redirects`/`headers`, route-level auth, and the Data Access Layer. The architectural trade is **breadth for power**. The layer:

- Runs on a single runtime per file — `proxy` on **Node.js** (full Node APIs, but cross-cutting perf still forbids per-request I/O), `middleware.ts` on **Edge** (limited APIs, no Node-specific dependencies, no large packages).
- Runs on every matched request — performance ceiling matters because the cost multiplies.
- Has no per-route knowledge until the rewrite/redirect resolves — cannot read route-specific params.
- Cannot read the response body — it sits in front of the response, not over it.
- Is **not a security boundary** — it can be bypassed (CVE-2025-29927) and silently skipped by matcher exclusions; authorization must be enforced at the route.

In exchange, it can shape the entire request/response edge in a single place. Done well, it removes ceremony from every route; done badly, it adds latency to every request, concentrates business logic in a hard-to-test file, and gets mistaken for an access-control gate it cannot be.

**The discipline is to keep it small, fast, cross-cutting, and never the sole authorization gate.** When a piece of logic only applies to one route, it does not belong here. When it requires a per-request database lookup that adds 50ms, it does not belong here. When it is the only thing standing between an attacker and `/admin`, it is not enough.

## Prefer Native Features First — Proxy Is a Last Resort

Vercel's own guidance frames this layer as the feature to reach for *last*. Before writing per-request code that runs on every matched request, check whether a simpler, cheaper, statically-evaluated upstream feature already does the job:

| Need | Reach for this first | Use proxy only when |
|---|---|---|
| Permanent or static redirect (`/old` → `/new`) | `next.config` `redirects` | the decision is dynamic (depends on a cookie, header, geo, or A/B bucket) |
| Static security headers on every response | `next.config` `headers` with a *static* CSP | the header must vary per request (a per-request CSP nonce) |
| Blocking bad traffic, rate limiting, bot management | the platform WAF / firewall / bot-management layer | you need app-specific logic the WAF can't express |
| Strict CSP for static pages | a hash/SRI-based policy where the project version supports it | a per-request nonce is genuinely required and the page is intentionally dynamic |
| Authorization | route-level checks + the Data Access Layer | never — proxy is a UX redirect, not the authz boundary |

`next.config` `redirects` and `headers` run *before* proxy in the routing chain and cost no per-request execution. The full execution order is: `next.config` `headers` → `next.config` `redirects` → proxy → `beforeFiles` rewrites → filesystem routes (`public/`, `_next/static/`, `pages/`, `app/`) → `afterFiles` rewrites → dynamic routes → `fallback` rewrites. Every concern you can push to a static upstream feature is latency you do not pay on every request — and a smaller, faster proxy is a better proxy. Proxy is the right tool when the app must decide at the HTTP edge using request facts before the route is resolved; it is not a general-purpose "before hook" and should not become a hidden second router.

## The File Contract

```ts
// proxy.ts (Next.js 16+, project root or src/) — Node.js runtime
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {       // mark async if you await inside
  // ... transform or gate the request ...
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

```ts
// middleware.ts (Next.js ≤15, or Next.js 16 when you NEED the Edge Runtime) — DEPRECATED in 16
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

- **One file per project.** There is no chain of files. Compose multiple concerns inside a single `proxy`/`middleware` function, with helpers imported from small modules.
- **Single export.** Default export or a named `proxy` (or `middleware`) export both work; pick one. Multiple proxies from the same file are not supported.
- **Never ship both files.** If `proxy.ts` and `middleware.ts` coexist, behavior is unstable — delete `middleware.ts` once `proxy.ts` exists.
- **Use the codemod for Next.js 16 migrations.** `npx @next/codemod@canary middleware-to-proxy .` renames the file and the exported function (see [§ Migrating middleware.ts → proxy.ts](#migrating-middlewarets--proxyts)).
- **`config.matcher`** filters which paths trigger the layer. **Critical**: the default — no matcher — runs on every single request including static assets. Always set a matcher.
- **`NextProxy` type** (Next.js 16) infers both the `request` (`NextRequest`) and `event` (`NextFetchEvent`) parameters: `export const proxy: NextProxy = (request, event) => { … }`.

### Runtime: the load-bearing distinction

| | `proxy.ts` (Next.js 16) | `middleware.ts` (deprecated; Edge) |
|---|---|---|
| Runtime | **Node.js only** — `runtime` config **throws** if set | **Edge** (Node.js opt-in via `experimental.nodeMiddleware` + `runtime: 'nodejs'`, stable since 15.5) |
| Node `crypto`, `fs`, `Buffer`, full SDKs | ✅ available (but see perf discipline) | ❌ Edge: not available |
| Bundle ceiling | Node server limits | Vercel, after gzip: 1 MB Hobby / 2 MB Pro / 4 MB Enterprise; one Node-only `import` breaks the build |
| Web Crypto, `fetch`, Web Streams | ✅ | ✅ |
| Status | Recommended (Next.js 16) | Works with a warning; for Edge-only needs |

The runtime is what decides whether the old "no Node APIs, no DB, hand-roll everything" advice applies. On Edge (`middleware.ts`) it is a hard *capability* wall. On Node (`proxy.ts`) those APIs exist — but the **performance discipline still forbids per-request database calls**, because the cost multiplies across every matched request. The constraint moved from "you can't" to "you mustn't." Do not turn the Node.js runtime into permission to do expensive work: a database query, remote JWKS fetch, or SDK initialization in proxy still adds cost to every matched request and can become a global latency tax.

### Matcher syntax

```ts
export const config = {
  matcher: [
    '/dashboard/:path*',                                          // glob
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)', // negative lookahead
    {
      source: '/api/admin/:path*',
      has: [{ type: 'header', key: 'Authorization' }],
      missing: [{ type: 'cookie', key: 'session' }],             // skip when cookie absent
    },
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [                                                 // skip speculative prefetches
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
```

Matchers compile to regular expressions at build time. They cannot use runtime values — every `source` must be a build-time constant, must start with `/`, may use named parameters (`:path*`), and may add `has` / `missing` conditions to match on headers, cookies, or query params. Complex negative lookaheads are common because the default-matches-everything behavior is rarely what you want — image fetches, static assets, prefetch requests, and webhook routes should usually be excluded. The baseline exclusion list usually covers `api` routes (unless this layer is intentionally protecting a whole API subtree), `/_next/static` and `/_next/image`, static metadata files such as `favicon.ico` / `sitemap.xml` / `robots.txt`, webhook paths that need exact raw-body/signature handling in their Route Handler, and prefetch requests when the concern need not run for speculative navigation.

Three gotchas the docs call out explicitly:

- **The biggest footgun** is forgetting to exclude `/_next/static` and `/_next/image`, which makes every image fetch run the layer on the hot path.
- **`/_next/data` still runs even when you exclude it in a negative matcher** — this is intentional, so that protecting a page also protects its corresponding data route. Don't assume your negative lookahead removed data-route coverage; test matcher coverage instead of fighting the behavior.
- **Server Functions follow the matcher.** Server Actions are handled as POST requests to the route where they're used, so a matcher that excludes a path *also skips the Server Function calls on that path*. A matcher change or a refactor that moves a Server Function can silently remove proxy coverage — which is one more reason auth must live inside the action (see [§ The Auth Reality](#the-auth-reality-cve-2025-29927)).
- **Excluding prefetch requests is for *non-auth* concerns only.** The `missing` block above skips speculative `next-router-prefetch` / `purpose: prefetch` requests so header-injection or logging work doesn't run twice — a *performance* optimization. Do **not** use it to skip an auth gate: transport-specific route variants (`.rsc`, segment-prefetch) can resolve to the same page, and excluding them is exactly the class of gap that produced **CVE-2026-44575** (App Router middleware/proxy bypass via segment-prefetch routes — see [§ The Auth Reality](#the-auth-reality-cve-2025-29927)). For auth, stay on a patched Next.js (which now includes transport variants when generating matchers) *and* enforce authorization at the route regardless.

## The Four Response Shapes

```ts
import { NextResponse } from 'next/server'

// 1. Pass through — let the request continue to its route
return NextResponse.next()

// 2. Rewrite — internally route to a different path; URL bar unchanged
return NextResponse.rewrite(new URL('/en/about', request.url))

// 3. Redirect — send a 30x to the browser; URL bar changes
return NextResponse.redirect(new URL('/login', request.url))

// 4. Direct response — short-circuit; return a response without hitting any route
return new NextResponse('Forbidden', { status: 403 })
// (Response.json(...) and Response.redirect(...) also work for direct responses)
```

Choose based on what the user should see and what should change:

| Goal | Use |
|---|---|
| Continue to the originally requested route, possibly with modified headers/cookies | `next()` (often with `.headers.set()` on the response) |
| Serve a different route's content under the same URL (A/B test, locale variant, feature flag) | `rewrite` |
| Send the user to a different URL (login redirect, canonical redirect, locale-detection redirect) | `redirect` |
| Block the request entirely (rate limit hit, bot blocked, missing auth on protected API) | direct response with appropriate status |

**Rewrite vs redirect** is a load-bearing distinction: rewrites are invisible to the user (the URL stays the same), redirects are visible (the URL changes and the browser does a second request). If you want the user to see they've been moved (`/old-path` → `/new-path`), redirect. If you want to keep their URL and serve different content (A/B variant, internal locale path), rewrite.

**Always rewrite with `NextResponse.rewrite()`, not a hand-rolled `fetch()`.** For App Router rewrites, Next.js propagates internal RSC/Flight headers (the request carries an `RSC` marker; the response needs the matching `vary` handling) so a rewritten route still serves the correct React Server Component payload to a client-side navigation. A custom `fetch()` that re-implements the rewrite can drop or mishandle those headers — the page works on a hard load but breaks (or serves the wrong/stale RSC payload) on soft client-side navigation. Let `NextResponse.rewrite()` own the transport; only set the headers you own on top of it.

> **Before reaching for a redirect/rewrite here, check `next.config`.** Static `redirects` and `headers` in `next.config.js` run *before* proxy in the routing chain and need no per-request code. Use proxy only when the decision is dynamic (depends on a cookie, header, geo, or A/B bucket). The full execution order is: `next.config` `headers` → `next.config` `redirects` → proxy → `beforeFiles` rewrites → filesystem routes → `afterFiles` rewrites → dynamic routes → `fallback` rewrites.

## Header and Cookie Discipline

`NextResponse.next({ request: { headers } })` changes the request seen by the route/rendering layer; `response.headers.set(...)` changes the response seen by the browser. **These are two different surfaces** — set both only when both consumers need the value (e.g. a CSP nonce the renderer reads *and* the browser enforces). The rules:

- **Set only the headers you own.** Clone with `new Headers(request.headers)` and set the specific keys you need. Do **not** blanket-forward all inbound headers to an upstream `fetch` or rewrite target — user-controlled headers can leak credentials, override framework internals (e.g. `x-middleware-subrequest`, see [§ The Auth Reality](#the-auth-reality-cve-2025-29927)), or exceed header-size limits (`431 Request Header Fields Too Large`).
- **Cookies for the client go on the response.** Mutating `request.cookies` changes only the request object the route sees, not the cookie stored by the browser — set browser-visible cookies with `response.cookies.set(...)`.
- **Do not import `cookies()` from `next/headers` here.** That API is scoped to render-time route code (Server Components, Server Functions, Route Handlers) and reads the wrong context at the request boundary. Read with the synchronous `request.cookies.get(...)`; write with `response.cookies.set(...)`.
- **Let `NextResponse.rewrite()` own internal RSC/Flight headers** — do not hand-roll a `fetch()`-based rewrite that must re-implement them (see the response-shapes note above).

## Edge Runtime Constraints (`middleware.ts` only)

> These constraints apply to **`middleware.ts` on the Edge Runtime**. On `proxy.ts` (Node.js) the Node APIs below are available — but the performance discipline in [§ Performance Discipline](#performance-discipline) still applies.

| Capability | Available on Edge |
|---|---|
| `fetch` | ✅ |
| Web Crypto (`crypto.subtle`, `crypto.randomUUID`) | ✅ |
| Web Streams (`ReadableStream`, `TransformStream`) | ✅ |
| `URL`, `URLSearchParams`, `Request`, `Response` | ✅ |
| `setTimeout` / `setInterval` | ⚠️ best-effort, may not fire after response |
| Node `crypto`, `fs`, `child_process`, `net`, `dns`, `Buffer` | ❌ |
| `require` / dynamic code evaluation | ❌ |
| Most npm packages that aren't pure JS | ❌ |
| Large bundle sizes | ❌ (Vercel, after gzip: 1 MB Hobby / 2 MB Pro / 4 MB Enterprise) |

Edge code is bundled and shipped to Edge nodes globally. Cold-start is fast (~10–50ms) but the trade is a tight capability surface. Anything you import — including transitive dependencies — must be Edge-compatible. A single `import` of a Node-only package breaks the build.

**Practical consequence on Edge**: don't reach for ORMs, full SDKs, or complex libraries. Hand-roll the small piece you need (decode a JWT, hash a token, parse a cookie). If the work genuinely needs Node — verifying a webhook signature with a vendor SDK, hitting a database — either move to `proxy.ts` on Node.js (Next.js 16) or push the work down into a Route Handler / Server Action.

### Background work: `waitUntil`

The `NextFetchEvent` second argument exposes `waitUntil(promise)`, which extends the request's lifetime until the promise settles — for fire-and-forget work that must not block the response (analytics beacons, audit logging). Use it **only for non-critical side effects**; if the side effect must complete for correctness, it belongs in the route/action/job that owns the operation, not in proxy.

```ts
import { NextResponse } from 'next/server'
import type { NextFetchEvent, NextRequest } from 'next/server'

export function proxy(request: NextRequest, event: NextFetchEvent) {
  event.waitUntil(
    fetch('https://analytics.example.com', {
      method: 'POST',
      body: JSON.stringify({ pathname: request.nextUrl.pathname }),
    }).catch(() => undefined),
  )
  return NextResponse.next()
}
```

## The Canonical Pattern Library

### 1. Authentication UX gate (NOT a security boundary)

```ts
export function proxy(request: NextRequest) {
  const session = request.cookies.get('session')?.value
  const { pathname } = request.nextUrl

  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/admin')
  if (isProtected && !session) {
    const url = new URL('/login', request.url)
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
```

This redirect is a **UX optimization** — it sends a logged-out user to `/login` quickly so they don't load a page that would fail anyway. It is **not** the authorization decision. The session cookie is *checked for presence*, not *cryptographically verified*, and even a perfect check here can be bypassed entirely (CVE-2025-29927) or silently skipped by a matcher change. **Every protected route, Route Handler, and Server Action must verify authorization itself**, ideally through a shared Data Access Layer. A per-request database lookup to validate the session does not belong here — that 50ms hits every protected page load; defer it to the route.

```ts
// In the page, route, action, or data-access layer: the REAL authorization
async function requireAdmin() {
  const session = await verifySession()           // cryptographic check, DB/role lookup
  if (!session?.roles.includes('admin')) {
    throw new Error('Forbidden')
  }
  return session
}
```

### 2. Locale routing

```ts
const LOCALES = ['en', 'es', 'fr', 'de']
const DEFAULT_LOCALE = 'en'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasLocale = LOCALES.some((l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`)
  if (hasLocale) return NextResponse.next()

  const accept = request.headers.get('accept-language') ?? ''
  const detected = LOCALES.find((l) => accept.includes(l)) ?? DEFAULT_LOCALE

  return NextResponse.redirect(new URL(`/${detected}${pathname}`, request.url))
}
```

A first-visit user lands on `/about`, gets redirected to `/en/about`. Subsequent visits to locale-prefixed paths pass through. The redirect-once pattern keeps the URL canonical and lets the rest of the app assume locale is in the path. (If you use `next-intl` or a similar library, note that its `middleware` export must also be renamed to `proxy` under Next.js 16 — check the library's v16 migration notes.)

### 3. A/B testing via rewrite

```ts
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname !== '/pricing') return NextResponse.next()

  let variant = request.cookies.get('pricing-variant')?.value
  if (!variant) {
    variant = crypto.randomUUID().charCodeAt(0) % 2 === 0 ? 'a' : 'b' // Edge-safe random pick
  }

  const url = new URL(`/pricing-${variant}`, request.url)
  const response = NextResponse.rewrite(url)
  response.cookies.set('pricing-variant', variant, { maxAge: 60 * 60 * 24 * 30 })
  return response
}
```

The user sees `/pricing` in their URL bar but receives `/pricing-a` or `/pricing-b`. The cookie pins their variant so subsequent visits are consistent. The rewrite preserves the canonical URL for analytics and sharing. (`Math.random()` works too; `crypto.randomUUID()` is shown because it is available on both Edge and Node.)

### 4. Security header injection (with per-request CSP nonce)

```ts
export function proxy(request: NextRequest) {
  // btoa(crypto.randomUUID()) works on BOTH Edge and Node.
  // `Buffer.from(...).toString('base64')` is Node-only — it breaks the Edge build.
  const nonce = btoa(crypto.randomUUID())

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'nonce-${nonce}'`,
    `img-src 'self' blob: data:`,
    `font-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join('; ')

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('content-security-policy', csp)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('content-security-policy', csp)
  response.headers.set('x-content-type-options', 'nosniff')
  response.headers.set('referrer-policy', 'strict-origin-when-cross-origin')
  response.headers.set('permissions-policy', 'camera=(), microphone=(), geolocation=()')
  return response
}
```

The nonce flows to the request headers (so Server Components can read it via `headers()` and inject it into `<script>` tags) and to the response headers (so the browser enforces the CSP). The policy itself is just an example; the actual rules belong to the broader security strategy in `security-fundamentals`. Avoid setting very large headers — they can trigger `431 Request Header Fields Too Large` depending on the backend.

**The nonce has a rendering cost.** A per-request CSP nonce is unique per response, so it forces the affected pages into *dynamic rendering* — they can no longer be statically generated, served from the CDN cache, used by ISR, or kept as a PPR static shell. If you do not actually need per-request script allow-listing, prefer a *static* CSP in `next.config` `headers` (cacheable, no dynamic-rendering penalty) or a hash/SRI-based policy. Reach for the nonce only when `'strict-dynamic'` script allow-listing genuinely requires it.

**Never cache or share a nonce across responses, and never derive nonce material from untrusted inbound headers.** A nonce is only safe if it is unique per response and generated server-side: caching the page that carries it (or otherwise replaying one nonce to multiple users) lets an injected script execute under a still-valid nonce, and accepting a `Content-Security-Policy` / nonce value supplied in the *request* lets an attacker control the policy. Both are the failure behind the May 2026 **CSP-nonce shared-cache XSS** ([CVE-2026-44581 / GHSA-ffhc-5mcf-pf4q](https://github.com/vercel/next.js/security/advisories/GHSA-ffhc-5mcf-pf4q), patched 15.5.18 / 16.2.6). It is the same fact as the rendering cost, stated as a security rule: a nonce'd response and a cacheable response are mutually exclusive — stay patched, generate the nonce in proxy (never from request headers), strip inbound CSP/nonce headers from untrusted traffic on unpatched apps, keep nonce'd pages dynamic, and use a static/hash CSP for anything you want cached.

### 5. Geo-routing (post-Next.js-15 API)

```ts
import { geolocation } from '@vercel/functions'   // request.geo was removed in Next.js 15

export function proxy(request: NextRequest) {
  const { country } = geolocation(request)        // 'US', 'GB', … (undefined off Vercel)

  if (country === 'GB' && !request.nextUrl.pathname.startsWith('/uk')) {
    return NextResponse.redirect(new URL(`/uk${request.nextUrl.pathname}`, request.url))
  }

  return NextResponse.next()
}
```

**`request.geo` and `request.ip` were removed from `NextRequest` in Next.js 15** — the framework kept geolocation as a Vercel-specific feature. On Vercel, read it via `geolocation(request)` and `ipAddress(request)` from `@vercel/functions` (install the package; the Next.js 15 codemod does this for you). On other hosts, parse the platform's own geo headers (e.g. `x-vercel-ip-country`, or your CDN's equivalent) and read defensively — values may be undefined locally, and may be wrong when another proxy sits in front of the deployment unless trusted-proxy support is configured. For *hard* enforcement (e.g. blocking a region), prefer the platform firewall/WAF where available; app-level geo routing is usually product behavior, not a security boundary.

### 6. Bot blocking

```ts
const BLOCKED_AGENTS = [/AhrefsBot/i, /SemrushBot/i, /MJ12bot/i]

export function proxy(request: NextRequest) {
  const ua = request.headers.get('user-agent') ?? ''
  if (BLOCKED_AGENTS.some((re) => re.test(ua))) {
    return new NextResponse('Forbidden', { status: 403 })
  }
  return NextResponse.next()
}
```

UA strings are trivially spoofable — bot blocking via user-agent works for honest crawlers but does not stop adversaries. Use this for noise reduction, not security.

### 7. Request-ID correlation

```ts
export function proxy(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-request-id', requestId)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('x-request-id', requestId)
  return response
}
```

The request-id flows through to the route (readable via `headers()`) and back out to the client (visible in DevTools). Pair with structured logging that includes the id — optionally flushed via `event.waitUntil(...)` — and you get end-to-end traceability.

## The Auth Reality (CVE-2025-29927)

The single most important security fact about this layer: **it is not an authorization boundary, and treating it as one has already caused a critical, widely-exploited vulnerability.**

**CVE-2025-29927** (CVSS 9.1, disclosed March 2025) let an attacker bypass middleware entirely by sending a crafted internal `x-middleware-subrequest` header. That header was meant for Next.js's own loop-prevention and was trusted without verifying its origin — so spoofing it made the framework skip the middleware layer, and with it every auth check implemented there. It was patched in **14.2.25** and **15.2.3** (and 12.3.5 / 13.5.9 for older lines); if you cannot upgrade, block external requests carrying `x-middleware-subrequest` at the edge.

The patch closed that specific hole, but the architectural lesson is permanent and reinforced by the matcher behavior above:

- The proxy/middleware auth gate is a **UX optimization** (fast redirect to `/login`), never the authorization decision.
- A matcher exclusion **silently removes coverage** — including for Server Actions on the excluded path.
- Therefore **authorization must be enforced at the route, the Route Handler, and inside each Server Action** — ideally through a single Data Access Layer that every data read/mutation passes through. Next.js's own Data Security guidance says the same: verify authn/authz at the point of data access, not (only) in the proxy.

### It keeps happening — the May 2026 release

CVE-2025-29927 was not a one-off. Next.js's **May 2026 security release** patched a cluster of advisories that hit this exact layer again, several of which defeat a proxy/middleware auth gate by a route the matcher never saw:

| Advisory | What it does | Patched in |
|---|---|---|
| **CVE-2026-44575** / [GHSA-267c-6grr-h53f](https://github.com/vercel/next.js/security/advisories/GHSA-267c-6grr-h53f) | App Router middleware/proxy **bypass via segment-prefetch routes** — a crafted `.rsc` / segment-prefetch URL resolves to the same page without matching the intended matcher rule, reaching protected content without the auth check. | 15.5.18 / 16.2.6 |
| **CVE-2026-45109** / [GHSA-26hh-7cqf-hhc6](https://github.com/vercel/next.js/security/advisories/GHSA-26hh-7cqf-hhc6) | **Incomplete-fix follow-up** to the above: the original fix did not cover `middleware.ts` built with **Turbopack**. Turbopack users must go one patch higher. | 15.5.18 / 16.2.6 |
| **CVE-2026-44574** / [GHSA-492v-c6pp-mqqv](https://github.com/vercel/next.js/security/advisories/GHSA-492v-c6pp-mqqv) | Bypass via **dynamic route parameter injection** — another transport/route-shape variant that sidesteps matcher-based checks. | 15.5.18 / 16.2.6 |
| **CVE-2026-44581** / [GHSA-ffhc-5mcf-pf4q](https://github.com/vercel/next.js/security/advisories/GHSA-ffhc-5mcf-pf4q) | **XSS via CSP nonce + a shared cache** — a per-request nonce cached and replayed across users, or nonce material derived from an untrusted inbound request header, lets injected script execute under a valid nonce. Directly relevant to [§ pattern 4](#4-security-header-injection-with-per-request-csp-nonce): a nonce must be generated server-side, never cached/shared, and never read from request headers. | 15.5.18 / 16.2.6 |

Two durable takeaways reinforce everything above:

1. **The matcher is not a security perimeter.** Three of these four are bypasses that reach a protected page through a *transport variant of its URL* the matcher didn't enumerate. You cannot make an auth gate sound by adding matcher rules — the framework has to enumerate every variant (the patches do), and you must still enforce authz at the route.
2. **Stay patched, and patch one higher on Turbopack.** Upgrade to **≥15.5.18 / ≥16.2.6** for this cluster (the Turbopack follow-up is *not* covered by the first-announced patch level). For CVE-2025-29927, the floor is ≥14.2.25 / ≥15.2.3. Strip or distrust framework-internal headers (e.g. `x-middleware-subrequest`) and inbound CSP/nonce headers from untrusted traffic when an advisory says to.

## Composing Multiple Concerns

There is one proxy file. Combine concerns inside it — typically in a clear order:

```ts
export function proxy(request: NextRequest) {
  // 1. Block bots first — fast reject
  const ua = request.headers.get('user-agent') ?? ''
  if (BLOCKED_AGENTS.some((re) => re.test(ua))) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  // 2. Locale detection — redirect once for first-visit users
  const localeRedirect = applyLocaleRouting(request)
  if (localeRedirect) return localeRedirect

  // 3. Auth UX gate — redirect to login for protected routes (NOT the security boundary)
  const authRedirect = applyAuthGate(request)
  if (authRedirect) return authRedirect

  // 4. Pass through with security headers + request-id
  return applyHeaders(request)
}
```

Each helper returns either a short-circuit `NextResponse` or `null` (continue). The shape is a small chain of guards; the file stays readable. When the chain grows past ~5 concerns, it's a signal that the layer is doing too much — push something down to per-route logic or to a separate request-time hook.

## Testing

The old "this file is impossible to test" excuse no longer holds. Since **Next.js 15.1**, `next/experimental/testing/server` ships utilities to unit-test the layer:

```ts
import { unstable_doesProxyMatch, isRewrite, getRewrittenUrl, getRedirectUrl } from 'next/experimental/testing/server'

// Assert the matcher includes/excludes a path
expect(unstable_doesProxyMatch({ config, nextConfig, url: '/dashboard' })).toEqual(true)
expect(unstable_doesProxyMatch({ config, nextConfig, url: '/_next/static/x.js' })).toEqual(false)
expect(
  unstable_doesProxyMatch({ config, nextConfig, url: '/dashboard', headers: { purpose: 'prefetch' } }),
).toEqual(false)

// Exercise the function and assert the response shape
const response = await proxy(new NextRequest('https://app.example.com/about'))
expect(isRewrite(response)).toEqual(true)
expect(getRewrittenUrl(response)).toEqual('https://app.example.com/en/about')
```

Test three things:

1. **Matcher coverage.** Assert the function runs for protected paths and does *not* run for static assets, metadata files, prefetches, or webhooks — and at least one App Router transport/data variant where relevant.
2. **Response shape.** Assert the rewrite/redirect targets, cookies, headers, and short-circuit branches are exactly what callers should receive (`getRedirectUrl` exists for redirect responses).
3. **Defense-in-depth coverage.** Because proxy can be bypassed (CVE-2025-29927) or silently skipped by a matcher exclusion, the proxy-redirect test alone is not enough. Add a test that hits the protected page, Route Handler, Server Action, or Data Access Layer **directly, bypassing proxy**, with an unauthorized (or missing) credential and asserts it still rejects. For Server Actions, include at least one mutation test invoked through its POST transport — a green proxy test proves the UX gate redirects; only the bypass test proves the authorization boundary actually holds.

Where the project version lacks the experimental helpers, unit-test the pure helper functions and add integration tests around the real Next.js server.

## Performance Discipline

Every matched request pays the cost. Three rules:

1. **Tune the matcher.** If only `/dashboard/*` needs the gate, match only `/dashboard/*`. Don't run checks against image fetches.
2. **Cap the time budget.** Target <10ms p99. Slow proxy code degrades every page on the site.
3. **No per-request I/O.** A network round-trip is a tax on every request — *even on Node.js (`proxy.ts`), where a DB call is now possible, it is still the wrong place for one.* Cache aggressively; use signed cookies that carry the data the layer needs without a lookup; defer DB checks to the route. Use `waitUntil` for any logging/analytics so it doesn't block the response.

The performance budget is invisible until you load-test the site and see this layer dominate the latency profile. Build it in from the start.

## Migrating `middleware.ts` → `proxy.ts`

Next.js 16 ships a codemod:

```bash
npx @next/codemod@canary middleware-to-proxy .
# (the broader `npx @next/codemod@canary upgrade latest` also performs this step)
```

It renames the file and the exported function (`middleware` → `proxy`). Do it manually if you prefer:

1. `mv middleware.ts proxy.ts` (and rename the function to `proxy`, even with a default export).
2. **Delete the old `middleware.ts`** — shipping both is unstable.
3. Rename config flags: `skipMiddlewareUrlNormalize` → `skipProxyUrlNormalize` (the codemod does this too).
4. **Mind the runtime change.** `proxy` runs on **Node.js only**; setting `runtime` throws. If your code genuinely depends on the Edge Runtime, keep using `middleware.ts` for now (it still works with a deprecation warning) — Vercel has signalled follow-up Edge guidance in a later minor.

## Common Anti-Patterns

| Anti-pattern | Why it's wrong | Fix |
|---|---|---|
| Treating `middleware.ts` as the current convention in a Next.js 16 app | The current convention is `proxy.ts`; `middleware.ts` is deprecated | Run the codemod; teach the current file/function name |
| No matcher — runs on `/_next/static`, `/_next/image`, `/favicon.ico`, metadata files | Adds latency to every image fetch and static asset | Set a matcher with negative lookahead excluding `_next` paths, assets, and metadata files |
| Matcher excludes prefetch or transport variants without tests | Protected content may be reachable through a request shape the developer didn't consider | Test matcher coverage; enforce authz in the underlying page/route/action |
| Treating the proxy/middleware auth gate as the security boundary | Bypassable (CVE-2025-29927) and silently skipped by matcher changes | Enforce authz at the route / Server Action / Data Access Layer; keep proxy as a UX redirect only |
| Trusting inbound framework-internal or CSP headers | Users can supply headers meant to be generated internally (e.g. `x-middleware-subrequest`, inbound `Content-Security-Policy`) | Strip/distrust those headers at the edge when an advisory says they are sensitive |
| Using `request.geo` / `request.ip` | Removed from `NextRequest` in Next.js 15 — now `undefined` | Use `geolocation()` / `ipAddress()` from `@vercel/functions`, or parse platform geo headers |
| `Buffer.from(...)` for a nonce in `middleware.ts` | `Buffer` is Node-only — breaks the Edge build | Use `btoa(crypto.randomUUID())` (works on Edge and Node) |
| Shipping both `middleware.ts` and `proxy.ts` | Unstable, undefined behavior | Keep exactly one; delete the other |
| Setting `export const config = { runtime: 'edge' }` in `proxy.ts` | Throws — `proxy` is Node.js only | Keep `middleware.ts` if you truly need Edge |
| Per-request database query or uncached remote auth lookup | Network round-trip on every request (even where Node makes it possible) | Use signed cookies that carry the data, cached keys, or push the lookup to the route |
| Per-route business logic in the proxy layer | Centralized file that hides the logic from the route that owns it | Move to the route; keep this layer for genuine cross-cutting |
| Importing a Node-only package in `middleware.ts` | Edge build fails | Use Edge-compatible alternatives, move to `proxy.ts` (Node), or move the work to a Route Handler |
| `redirect` when `rewrite` was meant (or vice versa) | URL changes when it shouldn't, or stays the same when it should | Choose based on whether the user should see the URL change |
| Rewriting with a hand-rolled `fetch()` instead of `NextResponse.rewrite()` | Drops/mishandles the internal RSC/Flight headers Next.js propagates; the route serves a wrong/stale RSC payload on soft client-side navigation | Use `NextResponse.rewrite()`; layer only your own headers on top |
| Nonce-based CSP everywhere by default | Forces dynamic rendering; undermines static generation / CDN cache / ISR / PPR | Use static `next.config` `headers` or SRI/hash CSP when a per-request nonce isn't required |
| Importing `cookies()` from `next/headers` inside proxy/middleware | `cookies()` is for render-time route code; it reads the wrong context here | Read with `request.cookies.get(...)`; write with `response.cookies.set(...)` |
| Modifying request headers without `NextResponse.next({ request: { headers } })` | Request-side changes don't reach the route | Use the `request.headers` form; set on `response.headers` too if the client needs to see them |
| Setting cookies on the request | Cookie set silently lost | Set cookies on the response via `response.cookies.set(...)` |
| Blanket-forwarding all inbound headers upstream (cloning `request.headers` wholesale onto an outgoing `fetch`/rewrite target) | User-controlled, security, or framework-internal headers can leak or alter downstream behavior, or exceed header-size limits | Copy only the specific headers you own/need onto the outgoing request |
| Running the layer on webhook routes | Proxy buffers the body up to `proxyClientMaxBodySize`; large raw payloads can exceed it, and redirects/header changes/auth gates can interfere with exact webhook delivery and HMAC verification | Exclude webhook paths from the matcher; verify the HMAC in the route handler off the raw body |
| Assuming a negative matcher removed `/_next/data` coverage | `/_next/data` runs even when excluded (by design) | Don't rely on the exclusion for data routes; account for them |
| Single 100-line proxy doing 8 things | Untestable, slow, hard to reason about | Decompose into named helpers; unit-test with `next/experimental/testing/server`; move some concerns per-route |

## Verification

After applying this skill, verify:

- [ ] The project version is identified and the file matches it: on Next.js 16, the file is `proxy.ts` with a `proxy` function; `middleware.ts` is used only when the Edge Runtime is genuinely required, and the two files never coexist. If migrating, the codemod (or equivalent) renamed the file, the exported function, and `middleware`-named config flags.
- [ ] `config.matcher` is set with build-time constants and excludes `_next/static`, `_next/image`, `favicon.ico`, metadata files (`sitemap.xml`, `robots.txt`), and any other paths that don't need the layer (typically webhooks); `/_next/data` coverage is accounted for.
- [ ] Matcher coverage is tested for protected URLs, static assets, prefetch headers, metadata files, webhooks, and at least one App Router transport/data variant where relevant.
- [ ] Authorization is enforced at the route / Route Handler / Server Action (Data Access Layer), not only in proxy; the proxy auth check is a UX redirect; the framework is patched against CVE-2025-29927 (≥14.2.25 / ≥15.2.3) and the May 2026 segment-prefetch / dynamic-route / CSP-nonce cluster (≥15.5.18 / ≥16.2.6 — and Turbopack users are on the follow-up patch, not the first-announced level).
- [ ] A defense-in-depth test exists that bypasses proxy and asserts the protected route / handler / action / Data Access Layer still rejects an unauthorized caller; Server Actions under protected pages are tested through their POST transport.
- [ ] Simpler upstream features were checked first — `next.config` `redirects`/`headers`, a static CSP, and the platform WAF/bot-management layer — before this layer was used.
- [ ] If a per-request CSP nonce is used, its dynamic-rendering cost (no static generation / CDN cache / ISR / PPR static shell) is acceptable, the nonce is generated server-side and never cached, shared across responses, or derived from inbound request headers (CVE-2026-44581 / GHSA-ffhc-5mcf-pf4q), and the framework is patched; otherwise a static or hash/SRI CSP is used instead.
- [ ] Only owned headers are forwarded upstream — inbound headers are not cloned wholesale onto an outgoing `fetch`/rewrite.
- [ ] No per-request database queries or other I/O adding >10ms — even on `proxy.ts` (Node.js) where it is technically possible.
- [ ] Geo/IP is read via `@vercel/functions` (or platform headers), handles local/undefined values, and is not treated as a security boundary — not the removed `request.geo`/`request.ip`.
- [ ] On `middleware.ts` (Edge), all imports are Edge-compatible (no Node `crypto`, `fs`, `Buffer`, `child_process`, `net`); on `proxy.ts`, no `runtime` config is set.
- [ ] Cookies are read via `request.cookies` and written via `response.cookies.set` — `cookies()` from `next/headers` is NOT imported here; cookies that need to reach the client are set on the response, not the request.
- [ ] Modified request headers use `NextResponse.next({ request: { headers } })` so they flow to the route; response headers the browser needs are set on the response.
- [ ] The choice between `rewrite`, `redirect`, direct response, and `next()` matches whether the URL should visibly change and the HTTP semantics; static cases were checked against `next.config` `redirects`/`headers` first; rewrites use `NextResponse.rewrite()` (not a hand-rolled `fetch()`) so RSC/Flight headers survive soft navigation.
- [ ] `waitUntil` is used only for non-critical side effects.
- [ ] Multiple concerns are decomposed into named helpers and unit-tested with `next/experimental/testing/server`.
- [ ] Security-header injection (if used) coordinates with the broader security strategy defined in `security-fundamentals`.

## Grounding Sources

- Next.js docs — [Proxy (getting started)](https://nextjs.org/docs/app/getting-started/proxy) and [proxy.js file convention](https://nextjs.org/docs/app/api-reference/file-conventions/proxy). The canonical reference for the Next.js 16 `proxy.ts` convention, runtime, matcher, response API, `waitUntil`, version history, and testing utilities.
- Next.js docs — [Renaming Middleware to Proxy](https://nextjs.org/docs/messages/middleware-to-proxy) and [Upgrading to Version 16](https://nextjs.org/docs/app/guides/upgrading/version-16). The rename rationale, codemod, runtime change, and config-flag renames.
- Next.js docs — [`NextRequest`](https://nextjs.org/docs/app/api-reference/functions/next-request). Cookies, `nextUrl`, and the `ip`/`geo` removal history.
- Next.js docs — [`cookies()`](https://nextjs.org/docs/app/api-reference/functions/cookies). The scope of the `next/headers` cookie helper (Server Components, Server Functions, Route Handlers — not the request boundary).
- Next.js docs — [Updating Data / Server Actions](https://nextjs.org/docs/app/getting-started/updating-data). Server Actions/Functions use HTTP `POST` under the hood and require action-owned authorization.
- Next.js PR — [remove `geo` and `ip` from `NextRequest` (#68379)](https://github.com/vercel/next.js/pull/68379) and Vercel KB — [geo/IP headers with Vercel Functions](https://vercel.com/kb/guide/geo-ip-headers-geolocation-vercel-functions). The Next.js 15 geo/ip removal and the `@vercel/functions` replacement.
- GitHub Advisory — [CVE-2025-29927 Authorization Bypass in Next.js Middleware (GHSA-f82v-jwr5-mffw)](https://github.com/advisories/GHSA-f82v-jwr5-mffw), plus Vercel's [firewall changelog](https://vercel.com/changelog/vercel-firewall-proactively-protects-against-vulnerability-with-middleware) and [postmortem](https://vercel.com/blog/postmortem-on-next-js-middleware-bypass). The auth-bypass CVE, affected/patched versions, and the `x-middleware-subrequest` mitigation.
- Vercel — [Next.js May 2026 security release](https://vercel.com/changelog/next-js-may-2026-security-release) and the four advisories it patched: [CVE-2026-44575 / GHSA-267c-6grr-h53f](https://github.com/vercel/next.js/security/advisories/GHSA-267c-6grr-h53f) (segment-prefetch middleware/proxy bypass), [CVE-2026-45109 / GHSA-26hh-7cqf-hhc6](https://github.com/vercel/next.js/security/advisories/GHSA-26hh-7cqf-hhc6) (Turbopack incomplete-fix follow-up), [CVE-2026-44574 / GHSA-492v-c6pp-mqqv](https://github.com/vercel/next.js/security/advisories/GHSA-492v-c6pp-mqqv) (dynamic-route parameter injection bypass), and [CVE-2026-44581 / GHSA-ffhc-5mcf-pf4q](https://github.com/vercel/next.js/security/advisories/GHSA-ffhc-5mcf-pf4q) (CSP-nonce shared-cache XSS). Patched in 15.5.18 / 16.2.6.
- Next.js docs — [Edge Runtime](https://nextjs.org/docs/pages/api-reference/edge) and Vercel docs — [Edge Runtime](https://vercel.com/docs/functions/runtimes/edge). The Edge capability surface `middleware.ts` runs against, and the per-plan code-size limit (after gzip: 1 MB Hobby / 2 MB Pro / 4 MB Enterprise).
- MDN — [Fetch API: Request](https://developer.mozilla.org/en-US/docs/Web/API/Request), [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response), and [`waitUntil`](https://developer.mozilla.org/en-US/docs/Web/API/ExtendableEvent/waitUntil). The Web-standard interfaces underlying `NextRequest`/`NextResponse` and `NextFetchEvent`.
- RFC 9110 — [HTTP Semantics](https://datatracker.ietf.org/doc/html/rfc9110). The protocol this layer operates on — methods, status codes, headers.
- OWASP — [Secure Headers Project](https://owasp.org/www-project-secure-headers/). The canonical reference for the security-header set this layer can inject (policy ownership remains with `security-fundamentals`).
- Next.js — [Content Security Policy](https://nextjs.org/docs/app/guides/content-security-policy). The canonical per-request nonce pattern, and the static-vs-dynamic-rendering tradeoff a nonce-based CSP forces.
- Next.js — [`proxyClientMaxBodySize` config](https://nextjs.org/docs/app/api-reference/config/next-config-js/proxyClientMaxBodySize). The body-buffering size ceiling that governs whether proxy can sit in front of large/raw payloads (e.g. webhooks).

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Per-route HTTP endpoint logic — JSON APIs, webhook handlers, streaming responses | `route-handler-design` | Route Handlers own per-route per-method logic; this layer owns cross-cutting preprocessing. |
| Internal mutations triggered from this app's UI | `server-actions-design` | Server Actions are the in-app mutation surface; the proxy layer sits upstream of them but does not replace them — and must not be their only auth gate. |
| Understanding what each HTTP status or method means in the abstract | `http-semantics` | http-semantics owns the protocol; this skill owns honoring it in the proxy layer. |
| Designing the full Content Security Policy, the authorization architecture, or the broader hardening discipline | `security-fundamentals` | security-fundamentals owns the policy and the security boundary; this layer is one delivery surface and a UX gate. |
| The cross-cutting streaming model (Web Streams, SSE, backpressure) | `streaming-architecture` | This layer can set headers for streamed responses but does not author the streaming logic. |
| The serialization/directive mechanics of `'use client'` and `'use server'` | `client-server-boundary` | Different boundary — that's the bundler component split, not the HTTP request edge. |
| The full webhook reliability story (HMAC verification, idempotency, retries) | `webhook-integration` | Webhook routes should generally be excluded from this layer; their handler owns the reliability discipline. |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `frontend-engineering`
- Deployment: `portable`
- Domain: `engineering/frontend`
- Scope: Designing and reviewing the Next.js request-preprocessing layer — the single root file (`proxy.ts` since Next.js 16, function `proxy`, Node.js runtime; or the deprecated-but-retained `middleware.ts`, function `middleware`, Edge Runtime by default with a Node.js opt-in since 15.5) that runs cross-cutting request/response transforms before route resolution. Covers the proxy↔middleware runtime split and its capability consequences, the matcher config (including the `_next/data` always-runs and Server-Function-coverage gotchas), the NextRequest/NextResponse API (cookies/headers; geolocation()/ipAddress() from @vercel/functions after the Next.js 15 geo/ip removal), the four response shapes (next/rewrite/redirect/direct), waitUntil background work, the official next/experimental/testing/server utilities, the canonical patterns (auth gate, locale routing, A/B testing, header injection, geo-routing, bot blocking), the per-matched-request performance cost, the CVE-2025-29927 lesson that this layer is not a security boundary, and the rule that it is for cross-cutting concerns, never per-route business logic. Portable across Next.js App Router projects; principle-grounded, not repo-bound. Excludes per-route endpoint logic (route-handler-design), the Server Action surface (server-actions-design), abstract HTTP semantics (http-semantics), CSP and hardening (security-fundamentals), and the streaming model (streaming-architecture).

**When to use**
- design proxy.ts that redirects unauthenticated users to /login while letting public routes through, configured via a matcher
- migrate my Next.js 15 middleware.ts auth gate to the Next.js 16 proxy.ts convention
- add a proxy that generates a per-request CSP nonce and injects it into both the request and response headers
- implement locale routing that detects Accept-Language and rewrites /about to /en/about for new visitors
- my geo-routing broke after upgrading to Next.js 15 because request.geo is undefined — how do I read country now
- is it safe to rely on middleware to protect /admin, or do I need route-level auth too
- Triggers: `how do I redirect unauthenticated users to login in Next.js`, `how do I run code before every request in Next.js`, `should I use middleware.ts or proxy.ts in Next.js 16`, `how do I migrate middleware.ts to proxy.ts`, `how do I set security headers globally in Next.js`, `how do I do locale routing in App Router`, `why does my middleware run on static assets`, `can middleware do a database query`, `how do I read geo or IP in Next.js middleware now`, `is Next.js middleware a security boundary`

**Not for**
- implement a /api/posts POST endpoint (use route-handler-design)
- implement a delete-comment mutation triggered from a form button (use server-actions-design)
- explain what an HTTP 308 means vs 307 (use http-semantics)
- design the full CSP policy and the rest of the security-header strategy (use security-fundamentals)
- design a long-lived SSE stream from middleware (use streaming-architecture)
- design the CSP policy, threat model, or OWASP audit for a system (use security-fundamentals)
- decide what an HTTP method, status code, or header should mean per RFC 9110 (use http-semantics)
- design signature verification, idempotency, or retry semantics for vendor webhooks (use webhook-integration)
- Owned by `server-actions-design`: the internal-mutation surface invoked from the app's own UI
- Owned by `server-components-design`: the render path

**Related skills**
- Verify with: `code-review`, `security-fundamentals`
- Related: `route-handler-design`, `server-actions-design`, `http-semantics`, `security-fundamentals`, `server-components-design`, `client-server-boundary`, `webhook-integration`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: The proxy/middleware layer is to a Next.js app what a building's lobby concierge is to its offices — every visitor passes through the lobby before reaching any specific floor; the concierge can glance at ID badges (auth UX gate), redirect visitors to the right elevator (locale or A/B rewrite), hand out lanyards with security policies attached (CSP nonce, request-ID header), or turn away obvious bad-faith visitors at the door (bot block) — but a concierge's glance is not the vault lock: the office door still verifies you (route-level auth), because anyone who slips past the lobby (CVE-2025-29927) must still be stopped at the office itself.
- Common misconception: |

**Keywords**
- `Next.js middleware`, `proxy.ts Next.js 16`, `middleware.ts to proxy`, `NextRequest NextResponse`, `matcher config`, `Edge vs Node runtime middleware`, `NextResponse redirect rewrite next`, `auth check before route`, `locale routing i18n middleware`, `CSP nonce middleware`

<!-- skill-graph-context:end -->
