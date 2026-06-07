---
name: http-semantics
description: "Use when designing or reviewing HTTP-based systems where method semantics, status codes, idempotency, safe methods, conditional requests, content negotiation, caching headers, range requests, integrity digests, or representation metadata are load-bearing. Covers the RFC 9110/9111/9112 contract layer below any specific framework. Do NOT use for API surface shape and route taxonomy (use api-design), for WebSocket or SSE bidirectional streams (use streaming-architecture skill when available), for vendor-specific webhook signing (use webhook-integration), or for transport-level concerns like TLS or QUIC (use platform-level documentation). Do NOT use for decide between WebSocket and SSE for live updates (use streaming-architecture)."
license: MIT
allowed-tools: Read Grep
metadata:
  schema_version: "8"
  version: "1.0.0"
  subject: backend-engineering
  deployment_target: portable
  taxonomy_domain: engineering/protocol
  owner: skill-graph-maintainer
  freshness: "2026-06-07"
  drift_check: "{\"last_verified\":\"2026-05-15\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  comprehension_state: present
  stability: experimental
  keywords: "[\"HTTP semantics\",\"RFC 9110\",\"idempotent methods\",\"HTTP status codes\",\"conditional requests\",\"content negotiation\",\"cache control\",\"representation metadata\",\"HTTP QUERY method\",\"Problem Details\"]"
  triggers: "[\"what status code should this return\",\"is this method idempotent\",\"RFC 9110\",\"conditional request\",\"cache control header\",\"HTTP QUERY method\"]"
  examples: "[\"decide whether bulk-update should be PUT or PATCH\",\"explain why this endpoint should return 409 instead of 400\",\"review whether this DELETE handler is truly idempotent\",\"design the Vary header for this endpoint that varies on Accept-Language\",\"decide whether a complex read query should be GET, POST, or QUERY\"]"
  anti_examples: "[\"design the JSON shape of the request and response bodies (use api-design)\",\"verify a Stripe webhook signature (use webhook-integration)\",\"decide between WebSocket and SSE for live updates (use streaming-architecture)\"]"
  relations: "{\"related\":[\"api-design\",\"webhook-integration\",\"system-interface-contracts\"],\"boundary\":[{\"skill\":\"api-design\",\"reason\":\"api-design owns the surface shape (routes, request/response schemas, pagination); http-semantics owns the protocol-level method/status/header contract that any HTTP API builds on.\"},{\"skill\":\"webhook-integration\",\"reason\":\"webhook-integration owns inbound provider mechanics (signing, retry, vendor-specific topics); http-semantics owns vendor-neutral HTTP method and status semantics.\"}],\"verify_with\":[\"api-design\",\"code-review\"]}"
  mental_model: "|"
  purpose: "|"
  boundary: "|"
  analogy: "HTTP semantics is to web APIs what the rules of grammar are to written language — the framework provides the dictionary (routes, handlers, middleware) but the grammar is non-negotiable, and a sentence that follows the dictionary while violating the grammar is technically intelligible but causes downstream tooling (CDNs, proxies, client libraries) to misinterpret it."
  misconception: "|"
  concept: "{\"definition\":\"HTTP semantics is the IETF-standardized contract layer (RFC 9110, 9111, 9112) that defines method meanings, status code families, request/response metadata, conditional requests, content negotiation, and caching — independent of any specific framework or language. It is the wire-level meaning that every HTTP API inherits.\",\"mental_model\":\"|\",\"purpose\":\"|\",\"boundary\":\"|\",\"taxonomy\":\"|\",\"analogy\":\"|\",\"misconception\":\"|\"}"
  structural_verdict: PASS
  truth_verdict: PASS
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/backend-engineering/http-semantics/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# HTTP Semantics

## Coverage

The IETF contract layer for HTTP-based systems: version-independent semantics (RFC 9110), method semantics (§ 9), status code families (§ 15), representation metadata and validators (§ 8), request/response metadata (§ 6-8, 12), conditional requests (§ 13), content negotiation (§ 12), range requests (§ 14), request preferences (RFC 7240), structured field design (RFC 9651), and the caching model (RFC 9111). Extends to the modern header-field ecosystem built on these foundations: standardized error bodies (RFC 9457 Problem Details), payload integrity (RFC 9530 Digest Fields), retry-safety at scale (Idempotency-Key, RateLimit fields), cache observability (RFC 9211 Cache-Status, RFC 9213 Targeted Cache-Control, RFC 9875 Cache Groups), and API lifecycle signaling (RFC 9745 Deprecation, RFC 8594 Sunset). Applies to any system using HTTP as a transport: REST APIs, GraphQL-over-HTTP endpoints, webhook receivers, browser fetches, proxy behavior, CDN configuration, API clients, and agent/tool calls over HTTP — across HTTP/1.1, HTTP/2, and HTTP/3 identically.

This skill answers "what does this HTTP message mean to generic HTTP software?" It does not own the product-facing shape of an API, but it must be used to verify that the chosen API surface still obeys method, status, caching, negotiation, retry, lifecycle, integrity, and metadata semantics.

## Philosophy

HTTP is older and more carefully specified than most of the frameworks running on top of it. RFC 9110 is the consolidated semantics reference (June 2022, obsoletes RFC 7230-7235); it represents 25+ years of distilled experience from browsers, proxies, CDNs, and load balancers. Most "weird HTTP behavior" stories come down to a framework default that doesn't match the spec.

The discipline is to ground HTTP decisions in the RFC, not the framework. When the framework default conflicts with the spec, the spec wins for portability: anything outside your codebase (a browser cache, a CDN, a corporate proxy, a retrying client, a crawler, an API gateway, a generated SDK, a client library in a different language) will follow the RFC, not your framework's documentation.

**Status codes and headers are machine-readable control flow, not decoration.** A client, cache, proxy, or agent decides whether to retry, revalidate, authenticate, follow a redirect, reuse a cached representation, or stop based entirely on the method, status family, and headers. If you return 200 with an error body, omit `Vary`, attach a weak ETag to an `If-Match` concurrency path, or use POST for a safe query because the framework made that easy, you have changed the protocol contract whether or not your handler code "worked."

**Semantics are version-independent.** A deliberate goal of the 2022 revision was to split *semantics* (RFC 9110) and *caching* (RFC 9111) away from *wire syntax* so each protocol version can evolve independently: HTTP/1.1 syntax is RFC 9112, HTTP/2 is RFC 9113, HTTP/3 (over QUIC) is RFC 9114. RFC 9110 states it plainly: "All three major versions of HTTP rely on the semantics defined by this document." A method/status/header decision is therefore a decision about meaning that holds identically whether the bytes travel over HTTP/1.1 text framing or an HTTP/3 QUIC stream. This is why this skill is about semantics, and transport syntax (RFC 9112/9113/9114) is out of scope.

**Reach for the standard header field before inventing one.** Most "API conventions" teams invent — error envelopes, idempotency tokens, rate-limit headers, integrity checksums, deprecation notices — now have a registered, off-the-shelf standard that generic clients, gateways, and proxies already understand. Inventing `X-RateLimit-Remaining` or `{"error": ...}` when `RateLimit` and `application/problem+json` exist creates a contract only your own client can read. The standard-field-first sections below name the current standard for each.

## Method Semantics (RFC 9110 § 9)

The method token is the primary source of request semantics. Standard method names are **case-sensitive** (§ 9.1) and, once standardized, carry the same semantics on every resource — though each resource decides whether that method is implemented or allowed. The registry is closed-by-convention: inventing methods (`PURGE`, `BAN`) means only your own cache understands them.

| Method | Safe | Idempotent | Cacheable | Typical use |
|---|---|---|---|---|
| GET | yes | yes | yes | Retrieve a representation |
| HEAD | yes | yes | yes | Retrieve metadata only; response headers correspond to the GET response without transferring content |
| POST | no | no | only with explicit freshness | Submit data; catch-all for non-fitting operations |
| PUT | no | yes | no | Replace target resource with payload |
| DELETE | no | yes | no | Remove target resource |
| PATCH | no | not by default | no | Apply a partial modification (RFC 5789) |
| QUERY | yes | yes | yes (request content in the cache key) | Safe + idempotent read carrying a request body — for complex/large/sensitive query inputs. **Emerging: IANA-registered and IESG-approved but not yet a published RFC; verify ecosystem support before relying on it** |
| OPTIONS | yes | yes | no | Discover capabilities (`Allow` for methods, `Accept-Patch` for PATCH formats) |
| TRACE | yes | yes | no | Loop-back diagnostic; often disabled by policy |
| CONNECT | no | no | no | Establish a tunnel |

**Idempotency rule (RFC 9110 § 9.2.2):** repeated requests have the same effect on resource state as a single request. The response code may differ across invocations (204 → 404 for DELETE); idempotency is about the post-condition, not the post-response.

**Safe-method rule (§ 9.2.1):** a method is *safe* when the client does not request, and does not expect, any state change from applying it. The spec is careful here: it does **not** forbid the server from having incidental side effects while serving a safe request — access logging, an ad-account charge triggered by a GET, metrics counters are all explicitly allowed. What matters is that *the client did not request that behavior and cannot be held accountable for it*. So "GET never changes anything on the server" is the wrong reading; the correct, load-bearing consequence is narrower: **a state change must never be reachable *only* through a safe method**, because crawlers, link prefetchers, and `<a>`-tag preloaders issue GETs unprompted — the classic "Googlebot deleted our records via GET links" failure. If a URI parameter selects an unsafe action (`?do=delete`), the resource owner MUST disallow that action under a safe method.

**QUERY, and the GET-with-body trap.** A recurring need is a *safe, idempotent* read whose parameters are too large or too structured for a URL query string (a complex search filter, a list of IDs). The wrong reach is "GET with a request body": RFC 9110 § 9.3.1 states content in a GET "has no generally defined semantics," cannot change the meaning of the request, and "might lead some implementations to reject the request and close the connection" (it reads like a request-smuggling vector to some intermediaries). So a GET body is non-portable — proxies, CDNs, and client libraries may strip or reject it; never put load-bearing data there. The standardized fix is the **QUERY** method (`draft-ietf-httpbis-safe-method-w-body`): a method that is **safe and idempotent like GET but carries a request body**, with cacheability keyed off the request content. As of this review QUERY is registered in the IANA HTTP Method Registry and IESG-approved with its defining document in the RFC Editor queue, **but it is not yet a published RFC and ecosystem support (frameworks, proxies, gateways, generated SDKs, browsers) is still emerging** — so for a public API today, prefer POST for a body-carrying "query" (accepting that it is not cacheable) and adopt QUERY once your stack and intermediaries support it. When you do adopt it, advertise it (`Allow` / `Accept-Query`) and check CORS-preflight impact. The portability rule to remember regardless: data the request *depends on* goes in the URL or in a POST/QUERY body, never in a GET body.

**PUT vs PATCH, and the patch-document formats.** PUT replaces the *entire* target representation; a field omitted from a PUT body is being set to absent. PATCH applies a *partial* change described by a patch document, and the format of that document is itself negotiated — PATCH is **not** "partial PUT," and the patch media type defines the operation, conflict model, and idempotency properties. The two registered JSON patch formats:

- **JSON Merge Patch** (RFC 7396, media type `application/merge-patch+json`) — the body looks like the resource; `null` means "delete this member." Simple, but cannot express array edits or set a value *to* null.
- **JSON Patch** (RFC 6902, media type `application/json-patch+json`) — an ordered array of `add`/`remove`/`replace`/`move`/`copy`/`test` operations with JSON Pointer paths. Expressive enough for array splices and conditional (`test`) edits.

A server advertises which patch formats it accepts with the **Accept-Patch** response header (RFC 5789 § 3.1), typically on the `OPTIONS` or `405` response, and rejects an unsupported patch format with `415 Unsupported Media Type`. PATCH SHOULD be applied atomically — partial application is a spec violation. **PATCH is not idempotent by default**: some patch documents are idempotent by construction, but do not assume retry safety unless the format, target, and concurrency contract make it so. For state-changing PATCH, prefer a strong `ETag` + `If-Match` and return `412 Precondition Failed` when the validator no longer matches.

## Representation Metadata and Validators (RFC 9110 § 8)

Representation metadata says *what the payload is* and *which selected representation it corresponds to*. It is not interchangeable with transport framing, and it is the substrate conditional requests, range requests, and caching all build on.

| Field | Use | Common failure |
|---|---|---|
| `Content-Type` | Media type and parameters for request or response content | Returning JSON as `text/plain`; sniffing request content instead of validating it |
| `Content-Language` | Intended audience language(s) for the representation | Negotiating by language but omitting response language metadata |
| `Content-Encoding` | Representation-level coding such as gzip/br | Reusing the same strong ETag for encoded and unencoded variants |
| `Content-Length` | Content size / message delimitation | Sending it on 1xx, 204, or 2xx CONNECT responses; forwarding inconsistent values |
| `Content-Location` | URI for the representation enclosed in this message | Treating it as a redirect or as a replacement for the target URI |
| `ETag` | Opaque validator for the selected representation | Generating weak ETags for optimistic-concurrency paths that require `If-Match` |
| `Last-Modified` | Date validator when ETag is absent | Depending on one-second date precision for high-churn resources |

**ETag strength matters.** A *strong* ETag (`"abc"`) means byte-for-byte identical; a *weak* ETag (`W/"abc"`) means semantically equivalent but possibly byte-different (e.g., a differently-whitespaced but equivalent body). Range requests and `If-Match` require a **strong** validator; `If-None-Match` cache validation accepts a weak one. **Validator rule:** send an `ETag` for representations where change detection can be consistently determined, and when content negotiation produces multiple simultaneous representations, validators must distinguish the variants that matter to cache updates and range requests — if gzip and identity encodings produce different bytes, their strong ETags must differ.

## Status Code Selection

Use the **first digit** as the contract; use the **last two digits** as refinement. A proxy that doesn't understand a specific 4xx will treat it as a generic 4xx. A response body can add application detail, but it must not contradict the status family.

| Family | When to use | Common errors |
|---|---|---|
| 1xx | Informational, interim. 100 Continue (server willing to accept the body after an `Expect: 100-continue` probe — lets a client avoid uploading a large body that would be rejected); 103 Early Hints (RFC 8297 — preload/preconnect `Link` hints sent before the final response so the browser can start fetching assets early) | Treating a 1xx as final — there is always a later final status |
| 2xx | Request fulfilled. 200 default; 201 for creation with Location header; 202 for async accepted; 204 for success with no body; 206 Partial Content for a satisfied range request | Returning 200 with `{ error: ... }` body — wrong family; sending a body on 204 |
| 3xx | Client must take further action. 301/308 for permanent; 302/307 for temporary; 303 after a POST to direct to the result; 304 for cache validation hit. **308/307 preserve the method and body; 301/302 historically let clients rewrite POST→GET** — use 307/308 when the method must survive the redirect | Returning 302 to authentication when 401 is correct; using 301/302 for a POST you need re-POSTed |
| 4xx | Client error. 400 malformed; 401 missing/invalid credentials; 403 valid credentials but insufficient authorization; 404 not-found (or hidden); 405 wrong method on valid target; 406 Not Acceptable (cannot satisfy the request's `Accept-*` constraints and unwilling to choose a default); 409 state conflict; 410 permanently gone; 412 failed precondition; 415 unsupported media type or content coding; 416 Range Not Satisfiable; 421 Misdirected Request (sent to a server that can't authoritatively answer for this target — relevant to connection coalescing in HTTP/2); 422 Unprocessable Content (valid syntax, semantically unprocessable — generalized into RFC 9110 § 15.5.21 from WebDAV); 425 Too Early (RFC 8470 — refuse a replayable request received in TLS 1.3 0-RTT data); 428 precondition required; 429 rate limit; 451 Unavailable For Legal Reasons (RFC 7725) | Using 400 for everything; conflating 401 (who) with 403 (what allowed); returning 200 for a not-found; returning 404 for a wrong method instead of 405 |
| 5xx | Server error. 500 default; 501 not-implemented method; 502 upstream bad response; 503 temporary unavailability (with Retry-After); 504 upstream timeout | Returning 500 when the cause is client input (should be 4xx); returning 501 when the method is known but not allowed on this resource (405); leaking stack traces in the body |

**Companion headers — know which are MUST and which are SHOULD.** Several status codes are incomplete without a paired header. The requirement *level* matters: for some of them omitting the header is an outright spec violation (a MUST); the rest are SHOULD / context-dependent — strongly recommended because real clients and proxies depend on them, but not a conformance failure. Do not flatten the distinction.

| Status | Companion header | Level | Why |
|---|---|---|---|
| 401 Unauthorized | `WWW-Authenticate` (RFC 9110 § 15.5.2) — at least one challenge | **MUST** | Without it the client cannot tell *how* to authenticate; this is the most common real-world 401 bug |
| 405 Method Not Allowed | `Allow` (§ 15.5.6) — the list of supported methods | **MUST** | Lets the client discover the correct method instead of guessing |
| 206 Partial Content (single range) | `Content-Range` (§ 15.3.7) | **MUST** | Which bytes this body represents (a multipart/byteranges 206 carries per-part Content-Range instead) |
| 304 Not Modified | No response content; include/update validators and selected response metadata as appropriate | required / expected | The client reuses its stored body; do not send a new one |
| 3xx redirect (301/302/303/307/308) | `Location` (§ 15.4) | SHOULD | The redirect target — clients overwhelmingly require it, but the spec states SHOULD |
| 201 Created | `Location` (§ 15.3.2) | context-dependent | Where the new resource lives; if omitted, the resource is identified by the effective request URI |
| 416 Range Not Satisfiable | `Content-Range` with current representation length when known | SHOULD | Tells the client the valid range bounds |
| 429 / 503 | `Retry-After` (§ 15.5.30 / § 15.6.4) | SHOULD/MAY | Lets clients and proxies back off deterministically instead of hammering — strongly recommended, but the spec says MAY |

**Auth rule.** `401` means the request lacks valid authentication credentials and requires a `WWW-Authenticate` challenge ("who are you"). `403` means the server understood the request and refuses it ("you can't do that") — if credentials were provided, they are insufficient or the refusal is unrelated to credentials. A server may use `404` to hide a forbidden resource's existence, but that is a deliberate information-disclosure decision, not a substitute for authentication semantics. The two are not interchangeable.

**Standard error body — RFC 9457 Problem Details (`application/problem+json`).** When you return a 4xx/5xx with a body, the registered standard shape is a Problem Details object (RFC 9457, July 2023, obsoletes RFC 7807): `type` (a URI identifying the problem class), `title`, `status`, `detail`, `instance`, plus extension members. RFC 9457 added an IANA registry of common `type` URIs and support for reporting multiple problems. The *protocol-level* fact — that this standard media type exists and what its members mean — is in scope here; the *decision* of whether and how to adopt it for a given API's error contract is api-design's surface. The load-bearing rule this skill owns: an error must use a 4xx/5xx status as its primary signal, and the body is supplementary detail — Problem Details *enriches* the status code, it never replaces it, and never a 200 carrying `{"error": ...}`.

**Rate-limit rule.** For `429`, pair the status with `Retry-After` when the client should wait a known duration. The IETF `RateLimit` / `RateLimit-Policy` fields are active Internet-Draft work as of this review — useful for emerging clients, but do not cite them as ratified RFC fields yet (see Rate Limiting below).

## Conditional Requests (RFC 9110 § 13)

Use conditional requests to guard against lost updates (a concurrent overwrite of a representation you have already read) and to enable cache validation. Note the precise scope up front: a precondition protects a representation you *already observed* — it is **not** a general dedup mechanism for a brand-new POST whose outcome you never saw (see the Idempotency-Key section for that case).

| Header | Pairs with | Comparison | Semantic |
|---|---|---|---|
| If-Match | ETag | strong | "Only apply if the resource still matches this version" — protects against lost-update on PUT/PATCH/DELETE |
| If-None-Match | ETag | weak | "Apply only if the resource has changed" — primary cache validation; `If-None-Match: *` means "only if it does not yet exist" (create-if-absent) |
| If-Modified-Since | Last-Modified | date | Date-based cache validation (lower precision than ETag) |
| If-Unmodified-Since | Last-Modified | date | Date-based lost-update protection |
| If-Range | strong ETag / strong date | exact/strong | "Send the range only if the validator still matches; otherwise send the whole thing" — for resuming interrupted downloads |

A PUT/PATCH/DELETE made conditional with If-Match against a validator you already hold becomes safe to *re-send*: the server applies it once while the precondition holds and returns 412 Precondition Failed on every subsequent attempt. (A server MAY return success instead of 412 only when it can determine the state-changing operation already succeeded, and only when concurrent requests cannot corrupt state.) The boundary worth stating clearly: this works only because you have a validator for a representation you already fetched — it prevents *clobbering* a version you did not expect. It does **not** deduplicate the "I sent a POST /payments, the connection dropped, did it land?" case, where you hold no validator and the resource may not yet exist. For that, use an Idempotency-Key (below), not a conditional request.

**Strong vs weak, and precedence.** For lost-update protection, prefer **strong** ETags with `If-Match`; a weak ETag can validate a cache entry but is not enough to prove the representation data is unchanged for a write. Precondition evaluation has a defined precedence (RFC 9110 § 13.2.2): `If-Match` / `If-Unmodified-Since` (the "don't clobber" guards) are evaluated before `If-None-Match` / `If-Modified-Since` (the "don't re-send" guards). Use `428 Precondition Required` when a resource requires clients to send a precondition before a state-changing request, making the concurrency contract explicit instead of allowing blind overwrites.

## Range Requests (RFC 9110 § 14)

Range requests let a client fetch part of a selected representation — the foundation of resumable downloads, video seeking, and parallel chunked fetches.

| Element | Direction | Meaning |
|---|---|---|
| Accept-Ranges: bytes | response | Server advertises it supports byte ranges (`none` = does not) |
| Range: bytes=0-1023 | request | "Send me these bytes" |
| Content-Range: bytes 0-1023/4096 | response | "This body is bytes 0-1023 of a 4096-byte representation" |
| 206 Partial Content | response | A range request was satisfied (include Content-Range for a single range, or per-part Content-Range in multipart) |
| 416 Range Not Satisfiable | response | The requested range lies outside the representation |
| If-Range | request | Send the range only if the validator still matches (else send 200 + full body) |

A server that ignores `Range` and returns the whole body with 200 is spec-compliant but defeats resumable downloads; a server that returns 206 must include `Content-Range`. A range response is about the *selected representation*, not arbitrary pagination — do not use `206` for application-level list pagination; that stays `200` with explicit pagination fields or links.

## Caching (RFC 9111)

Caching has four separate questions, not one — and the first is **not** reducible to "safe + 2xx":

1. **May a cache store the response?** A cache may store a response only when the conditions in RFC 9111 § 3 all hold: the request method and the response status code are *defined as cacheable* (200/203/204/206/300/301/308/404/405/410/414/501 are heuristically cacheable by default; POST only with explicit freshness), `no-store` is absent on both request and response, and — for a **shared** cache — `private` is absent and any `Authorization` header is accompanied by an explicit directive (`public`, `must-revalidate`, or `s-maxage`) permitting it. The cache must also understand status-code-specific rules for `206`/`304`/`must-understand`. On top of that, the response needs a storage basis: an explicit freshness signal (`max-age`/`s-maxage`/`Expires`), `public`, `no-cache`, an extension permitting storage, or a heuristically cacheable status. `no-store` opts out entirely.
2. **May the cache reuse the stored response for this request?** Target URI, method semantics, `Vary`-selected request headers, `no-cache`, freshness/staleness, and validation all participate.
3. **For how long is it fresh?** `s-maxage` wins for shared caches, then `max-age`, then `Expires`; otherwise a heuristic may apply only in allowed cases. The `Age` response header reports how long a cached response has already been sitting in caches.
4. **What is the cache key?** At minimum method + target URI; `Vary` expands the key by request headers; QUERY cache keys must include the request content.

**Cache-Control directive cheat sheet:**

| Directive | Where | Meaning |
|---|---|---|
| max-age=N | response | Fresh for N seconds |
| s-maxage=N | response | Fresh in shared caches for N seconds (overrides max-age) |
| no-cache | response | Must revalidate before reuse (still cacheable) |
| no-store | request/response | Do not cache at all |
| private | response | Cacheable only in single-user caches (browser, not CDN) |
| public | response | Cacheable in shared caches even if normally not (e.g., authenticated requests when other rules permit) |
| must-revalidate | response | Stale entries must be revalidated, not served |
| must-understand | response | Cache only if it understands the status code's caching rules (RFC 9111) — fail-closed for new status codes; commonly paired with `no-store` so unaware caches fail closed |
| immutable | response | Do not revalidate during freshness even on user reload (RFC 8246) — for fingerprinted static assets |
| stale-while-revalidate=N | response | Serve stale for N seconds while async revalidating |
| stale-if-error=N | response | Serve stale for N seconds on origin error |

**`no-cache` ≠ `no-store`.** `no-cache` means "store it, but revalidate before each reuse"; `no-store` means "never write it to disk/memory at all." Reaching for `no-cache` when you meant `no-store` (e.g., for a response with PII) is a real privacy leak — the response *is* cached.

**Shared-cache + Authorization.** A response to a request carrying `Authorization` must not be reused by a shared cache unless the response explicitly allows shared caching (`public`, `s-maxage`, `no-cache`, or `must-revalidate` under RFC 9111's authenticated-response rules). Forgetting this leaks one user's authenticated response to another from a shared cache.

**Targeted Cache-Control (RFC 9213).** Lets an origin address a *specific* cache tier without affecting others, using named fields like `CDN-Cache-Control` (shared CDN) vs `Cache-Control` (everything downstream). Use it to give a CDN a long TTL while telling browsers `no-store` — reasoning carefully about `Age`, downstream freshness, and sensitive data.

**Cache observability — Cache-Status (RFC 9211).** A standardized response header that explains how each cache in the chain handled the request — `Cache-Status: ExampleCDN; hit; ttl=300`. Each cache appends its own member, so you can read the full hit/miss path of a layered CDN. This replaces the zoo of vendor-specific `X-Cache: HIT` headers with one parseable, multi-hop standard — reach for it when debugging "why is this stale / why didn't this cache." Vendor headers can still help local debugging, but `Cache-Status` is the interoperable signal.

**Targeted invalidation — Cache Groups (RFC 9875).** TTLs answer "how long is this fresh"; Cache Groups answer "how do I purge a *set* of related responses at once" with a standard instead of a vendor purge API. A response declares membership with the **Cache-Groups** header (a list of case-sensitive group names), and a later response to an *unsafe* method (POST/PUT/DELETE) carries **Cache-Group-Invalidation** to invalidate every stored response in the named groups. Scope is one cache, same-origin only; implementations support at least 32 groups per field. RFC 9875 (Standards Track, Oct 2025) is the portable replacement for the per-CDN tag/surrogate-key purge mechanisms teams currently lock into — reach for it when a single mutation must invalidate a fan-out of related cached resources.

## Content Negotiation (RFC 9110 § 12)

Server-driven negotiation uses request `Accept-*` preference fields and response metadata. The response's `Vary` header is the cache contract: it lists the request fields that influenced representation selection.

```
Request:
  Accept: application/json, text/html;q=0.9
  Accept-Language: en, fr;q=0.8
  Accept-Encoding: br, gzip

Response:
  Content-Type: application/json
  Content-Language: en
  Content-Encoding: br
  ETag: "home-json-en-br-v7"
  Vary: Accept, Accept-Language, Accept-Encoding
```

The Vary response header is the contract for downstream caches: it lists the request headers the cache must match on. Forgetting Vary causes language-A users to see language-B responses cached by a CDN. For negotiated resources, validators must match the *selected* representation: if gzip and identity encodings produce different bytes, their strong ETags must differ.

Use `406 Not Acceptable` when the target resource cannot provide a representation acceptable under the request's `Accept-*` constraints and the server is unwilling to choose a default. Use `415 Unsupported Media Type` when request content or content coding is unsupported.

**Vary pitfalls.** `Vary: *` means "this response is uncacheable by a shared cache because it depends on factors beyond request headers." A frequent real bug: compressing responses but omitting `Vary: Accept-Encoding`, so a cache serves a gzip body to a client that did not send `Accept-Encoding: gzip`. Over-broad `Vary` (e.g., on the highly-unique `User-Agent`) destroys the cache hit rate by fragmenting the key — vary only on headers that genuinely change the representation.

## Request Preferences (RFC 7240)

Content negotiation chooses a *representation*; the **Prefer** request header lets a client ask for optional *processing behavior* without changing the target resource or making the preference a hard precondition. Registered tokens include `respond-async` (process asynchronously — pairs with a 202 + a status resource), `return=minimal` vs `return=representation` (after a mutation, send back just headers or the full updated body), `wait=N` (bound how long the server holds an async request open), and `handling=strict` / `handling=lenient` (how aggressively to validate). Preferences are hints, not commands — the server MAY ignore them — and a server that honors one echoes it in the **Preference-Applied** response header so the client can tell. `Prefer` is not content negotiation, authentication, a validator, or a substitute for status codes; if the server ignores a preference, the response status still describes the actual HTTP outcome. Reach for Prefer instead of inventing `?async=true` or `X-Return-Minimal` query params/headers.

## Idempotency and Retry-Safety at Scale

HTTP method idempotency and idempotency keys solve *different* problems. Method idempotency is part of the method definition: `PUT`, `DELETE`, and safe methods can be retried because the requested effect is the same after one or many identical requests. Conditional requests (If-Match) make non-idempotent operations retry-safe when the client already holds a validator. When it does not — the classic "did my POST /payments succeed before the connection dropped?" — the de-facto industry pattern is the **Idempotency-Key** request header (used by Stripe, PayPal, and others).

Note its standardization status precisely: the IETF document (`draft-ietf-httpapi-idempotency-key-header`) reached draft-07 (Oct 2025) but is now an **expired Internet-Draft, never published as an RFC** — so Idempotency-Key is a widely-deployed convention, not a ratified standard. Treat it as the best available pattern (and useful pattern vocabulary) while knowing there is no RFC to point a client library at; do not describe it as an HTTP core standard. The client sends a unique key with a POST/PATCH; the server records the first outcome against that key and **replays the stored response** for any retry carrying the same key, instead of processing twice.

Server obligations and the response contract:

| Case | Response |
|---|---|
| Required key missing | `400 Bad Request` (or a documented endpoint-specific client error) |
| Same key currently processing | `409 Conflict` plus retry guidance |
| Same key + same request fingerprint, completed | Replay the original successful response (or documented equivalent) |
| Same key with a *different* request body/fingerprint | `409`/`422 Unprocessable Content` (or documented conflict) — never silently apply a different operation |

Scope the key to a fingerprint of the request, persist the outcome with a defined retention window (after expiry, the server cannot promise duplicate suppression), and never process twice for the same key. This is the protocol-level mechanism; per-vendor key semantics (e.g., a specific provider's required prefix) belong to webhook-integration / that vendor's docs.

## Rate Limiting

When you return 429, the response should tell the client *when* to retry and ideally *what the policy is*:

- **Retry-After** (RFC 9110) — the minimum back-off, as seconds or an HTTP-date. The single most important header on a 429/503.
- **RateLimit and RateLimit-Policy** (`draft-ietf-httpapi-ratelimit-headers`, active Internet-Draft; **not yet an RFC**) — the standardizing replacement for the ad-hoc `X-RateLimit-*` family. `RateLimit-Policy` advertises the server's quota policy (windows, quotas, optionally concurrency limits); `RateLimit` reports the remaining quota for a policy. The draft consolidated to this two-field shape from the earlier three-header (`X-RateLimit-Limit`/`-Remaining`/`-Reset`) design. Prefer these standardized fields over inventing `X-`-prefixed ones so generic client libraries and gateways can read your limits — but label them with their current IETF status before describing them as standards.

## Payload Integrity (RFC 9530 Digest Fields)

When the *bytes* matter — large uploads, mirror reconstruction, content addressing — RFC 9530 (Feb 2024, obsoletes RFC 3230's `Digest`/`Want-Digest`) defines integrity fields with a clearer split. They are integrity, **not** authentication, authorization, privacy, or a full-message signature.

- **Content-Digest** — integrity of the *message content actually transferred* (after any range/encoding).
- **Repr-Digest** — integrity of the full *representation* (lets you validate a resource reassembled from multiple range requests or connections).
- **Want-Content-Digest / Want-Repr-Digest** — a receiver advertising that it wants a digest and which algorithms it prefers.

The old single `Digest` field was ambiguous about *what* it covered; the content-vs-representation split is the fix. Use these instead of inventing an `X-Checksum` header when you need end-to-end payload verification distinct from transport-level TLS integrity. If message metadata also needs integrity, combine digest fields with a signing mechanism; do not imply the digest field protects headers, identity, or transport.

## API Lifecycle Signaling

HTTP has standardized fields to tell clients a resource is going away — far better than a changelog nobody reads. They communicate timing without changing the resource's current method or status semantics.

- **Deprecation** (RFC 9745, March 2025) — a response header signaling the resource is or will be deprecated, carrying a Structured-Field date (`@<unix-timestamp>`) for *when*. It is a hint and does not change the resource's behavior; it announces deprecation of the *specific* resource the response came from.
- **Sunset** (RFC 8594) — an HTTP-date for when the resource is expected to become *unresponsive*. Deprecation says "don't rely on this"; Sunset says "it stops working at time T."
- The **`deprecation`** and **`sunset`** link relations (`Link:` header) point at human docs describing the migration path.

Pairing `Deprecation` + `Sunset` + a `Link; rel="deprecation"` to migration docs is the standard, machine-readable way to retire an endpoint without breaking clients silently. Do not use deprecation headers as a substitute for accurate status codes: a deprecated-but-working resource still returns `200`; a permanently removed one commonly returns `410 Gone`; a hidden/unknown one may still return `404`. Make the scope explicit — lifecycle fields on one response can be misread as applying to a wider API surface.

## Structured Field Values (RFC 9651)

Nearly every modern header above (RateLimit, Cache-Status, Deprecation, Digest fields) is defined as a *Structured Field* (RFC 9651, Sept 2024, obsoletes RFC 8941) — a small set of typed data structures with one canonical parsing/serialization algorithm. The payoff: these headers parse deterministically across implementations instead of each one inventing its own comma/semicolon grammar.

**Designing a new HTTP field.** First check whether an existing registered field already carries the semantics. If a new field is justified, define it as a Structured Field — never hand-rolled comma splitting, ad-hoc booleans, JSON-in-header values, or ambiguous free text — and choose a top-level type:

| Top-level type | Use |
|---|---|
| List | Ordered members (tokens, strings, inner lists), each optionally parameterized; multiple values |
| Dictionary | Named keys with typed values; extensible policy/quota fields |
| Item | One value, optionally parameterized; dates, booleans, integers, strings, byte sequences, tokens |

Common item types include `Integer`, `Decimal`, `String`, `Token`, `Byte Sequence`, `Boolean`, and `Date` (new in 9651); use `Display String` only when user-facing non-ASCII text is required. Define the allowed member types, ranges, parameters, unknown-key behavior, and what a recipient does when parsing or field-specific validation fails. Legacy fields do not automatically become Structured Fields; only fields that explicitly opt into RFC 9651 get those parsing rules. When you define a *new* custom header, define it as a Structured Field so off-the-shelf parsers handle it.

## Building an API or Protocol on HTTP (RFC 9205, BCP 56)

The sections above are the *primitives*; RFC 9205 (BCP 56, "Building Protocols with HTTP", June 2022, obsoletes RFC 3205) is the IETF's Best-Current-Practice on how to *compose* them into a sound API or protocol — the bridge between raw HTTP semantics and the thing you ship on top. It is the document to cite when a design choice is "is this a legitimate use of HTTP, or am I fighting the protocol." Its load-bearing rules, as a checklist:

- **Use URLs as opaque identifiers; do not let clients construct or parse their structure.** A client should follow URLs the server provides (links/templates), not assemble them from a documented pattern — so the server keeps the freedom to change its URL layout. (This is the protocol-soundness rule; the API's *link/templating design* is api-design's surface.)
- **Use methods and status codes per their registered semantics** — do not redefine GET to mutate, or invent a private meaning for a status code. A generic client/proxy will act on the registered meaning.
- **Do not reuse a single URL as an RPC tunnel** dispatching on a body field; let HTTP's own method/target/status carry the dispatch so intermediaries can reason about it.
- **Be specific about which HTTP version(s) and features you require, and degrade gracefully** — assume requests traverse caches, proxies, and CDNs that follow the RFCs, not your framework.
- **Define your media types and link relations; lean on content negotiation** rather than versioning by URL path where the representation can simply evolve.
- **Carry application state in the standard machinery** (status + standard headers + a defined media type), not in bespoke `X-` headers a generic consumer cannot interpret — the same standard-field-first discipline the sections above apply per-feature.
- **If an agent or generated client will consume the API**, make retryability, backoff, status family, media type, problem type, lifecycle state, and supported content types machine-actionable.

When a reviewer asks "should this be an HTTP API at all, and is it using HTTP correctly," RFC 9205 is the authority; the concrete *surface* it shapes (routes, schemas, versioning policy) is then api-design's call.

## Verification

After applying this skill, verify:
- [ ] Method choice (GET/POST/PUT/PATCH/DELETE) is justified by the operation's safe/idempotent properties, not by convention; no state change is reachable through a safe method alone (no user-requested business action hidden in a URI parameter or a safe-method body).
- [ ] Status codes use the correct family; first digit semantically matches the outcome; the body enriches but never contradicts the family; never a 200 carrying an error body.
- [ ] Companion-header MUSTs are honored: 401 carries WWW-Authenticate, 405 carries Allow, a single-range 206 carries Content-Range; and the strong SHOULDs are met where they apply: 3xx carries Location, 416 carries Content-Range, 429/503 carry Retry-After.
- [ ] No request the server *depends on* puts its data in a GET body (use the URL, or POST/QUERY); a body-carrying read uses POST today, or QUERY where the stack and intermediaries support it.
- [ ] PATCH uses a registered patch format (`merge-patch+json` or `json-patch+json`), advertised via Accept-Patch, applied atomically, and is not assumed idempotent by default.
- [ ] Representation metadata is consistent: `Content-Type` reflects the real media type, negotiated variants carry `Content-Language`/`Content-Encoding`, and validators (`ETag`) distinguish variants that differ in bytes.
- [ ] Non-idempotent operations that need retry safety use the right mechanism: strong `ETag` + `If-Match` for known-resource lost-update protection; an Idempotency-Key for create/submit/payment-style operations. Weak ETags are not used for `If-Match`.
- [ ] Range requests use `Range` / `If-Range` / `Content-Range` correctly; `206` is not used for ordinary application pagination.
- [ ] Cache storage/reuse/freshness/key decisions are explicit and do not rely on "safe + 2xx" folklore; cached responses include `Cache-Control` with explicit `max-age` or `no-store`; `no-store` (not `no-cache`) is used for responses that must never be cached (e.g., PII); responses to `Authorization`-bearing requests are protected from shared-cache reuse unless shared caching is explicitly intended.
- [ ] Responses that vary on request headers declare `Vary` correctly — including `Vary: Accept-Encoding` when compressing.
- [ ] 401 is used for "who are you" failures; 403 for "you can't do that" failures; the two are not interchangeable.
- [ ] DELETE handlers are spec-idempotent: server state is the same after one invocation as after many, regardless of the response code returned.
- [ ] Error bodies, when present, use the Problem Details media type (`application/problem+json`) rather than an invented envelope, with the status code as the primary signal.
- [ ] Integrity requirements use `Content-Digest` / `Repr-Digest` where appropriate and do not confuse digests with authentication or signatures.
- [ ] Optional server behavior uses `Prefer` / `Preference-Applied` where appropriate without replacing status, validation, or content-negotiation semantics.
- [ ] New custom HTTP fields use RFC 9651 Structured Field Values with an explicit top-level type, allowed member types, and failure behavior.
- [ ] Standardized fields are preferred over invented `X-` headers: RateLimit over `X-RateLimit-*`, Content-Digest over `X-Checksum`, Deprecation/Sunset over a prose changelog.
- [ ] URLs are treated as opaque identifiers the client follows from server-provided links, not strings the client assembles from a documented pattern (RFC 9205); methods/status codes are used per their registered semantics, not tunnelled as RPC over a single endpoint.
- [ ] Internet-Draft or not-yet-final fields/methods (`QUERY`, `Idempotency-Key`, `RateLimit`/`RateLimit-Policy`) are labeled with their current IETF status before being described as standards.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Designing the JSON request/response shape | `api-design` | api-design owns the surface; this skill owns the protocol layer below it |
| Deciding whether and how to adopt Problem Details for an API's error contract | `api-design` | this skill owns *that the standard exists and its media type*; the per-API error-contract decision is the surface |
| Verifying a vendor webhook signature | `webhook-integration` | webhook-integration owns inbound provider mechanics, including vendor-specific idempotency-key rules |
| Designing a WebSocket or SSE stream | `real-time-updates` or a streaming-architecture skill | Those skills own bidirectional / streaming patterns above HTTP |
| Designing the cross-boundary contract regardless of transport | `system-interface-contracts` | system-interface-contracts owns the contract layer that may or may not be HTTP |
| Designing a GraphQL schema or resolver chain | `api-design` or a graphql skill | This skill applies to HTTP semantics under any payload format, but schema design is api-design's surface |
| Configuring TLS, HTTP/2, HTTP/3 transport | platform documentation | Transport syntax (RFC 9112/9113/9114) is below the semantics layer |
| Applying application-level security headers (HSTS, CSP, Clear-Site-Data, CORS) | a web-security skill | Those headers govern browser security policy and session/data clearing (W3C WebAppSec specs), not the HTTP method/status/cache contract; this skill owns the protocol-semantics layer they ride on, not the security policy itself |

## Key Sources

- Fielding, R., & Reschke, J. (Eds.) (2022). [RFC 9110: HTTP Semantics](https://datatracker.ietf.org/doc/html/rfc9110). IETF. The consolidated semantics reference; obsoletes RFC 7230-7235. Semantics are shared by all three major HTTP versions.
- Fielding, R., Nottingham, M., & Reschke, J. (Eds.) (2022). [RFC 9111: HTTP Caching](https://datatracker.ietf.org/doc/html/rfc9111). IETF. The caching model.
- Fielding, R., Nottingham, M., & Reschke, J. (Eds.) (2022). [RFC 9112: HTTP/1.1](https://datatracker.ietf.org/doc/html/rfc9112). IETF. The HTTP/1.1 wire syntax.
- Thomson, M., & Melnikov, A. (Eds.) (2022). [RFC 9113: HTTP/2](https://www.rfc-editor.org/rfc/rfc9113.html). IETF. The HTTP/2 mapping of the shared semantics.
- Bishop, M. (Ed.) (2022). [RFC 9114: HTTP/3](https://www.rfc-editor.org/rfc/rfc9114.html). IETF. The HTTP/3 (over QUIC) mapping.
- Dusseault, L., & Snell, J. (Eds.) (2010). [RFC 5789: PATCH Method for HTTP](https://datatracker.ietf.org/doc/html/rfc5789). IETF. The PATCH method specification (Accept-Patch header).
- Bryan, P., & Nottingham, M. (Eds.) (2013). [RFC 6902: JavaScript Object Notation (JSON) Patch](https://www.rfc-editor.org/rfc/rfc6902.html). IETF. `application/json-patch+json`.
- Hoffman, P., & Snell, J. (2014). [RFC 7396: JSON Merge Patch](https://www.rfc-editor.org/rfc/rfc7396.html). IETF. `application/merge-patch+json`.
- Nottingham, M., Wilde, E., & Dalal, S. (2023). [RFC 9457: Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457.html). IETF. Standard error body (`application/problem+json`); obsoletes RFC 7807.
- Polli, R., & Pardue, L. (2024). [RFC 9530: Digest Fields](https://www.rfc-editor.org/rfc/rfc9530.html). IETF. Content-Digest / Repr-Digest; obsoletes RFC 3230.
- Nottingham, M. (2022). [RFC 9211: The Cache-Status HTTP Response Header Field](https://httpwg.org/specs/rfc9211.html). IETF. Standardized cache-handling debug header.
- Ludin, S., Nottingham, M., & Wu, Y. (2022). [RFC 9213: Targeted HTTP Cache Control](https://www.rfc-editor.org/rfc/rfc9213.html). IETF. Per-cache-tier directives (e.g., CDN-Cache-Control).
- Nottingham, M. (2025). [RFC 9875: HTTP Cache Groups](https://httpwg.org/specs/rfc9875.html). IETF (Standards Track, Oct 2025). The `Cache-Groups` / `Cache-Group-Invalidation` headers for targeted, same-origin invalidation of a set of related cached responses.
- Dalal, S., & Wilde, E. (2025). [RFC 9745: The Deprecation HTTP Response Header Field](https://www.rfc-editor.org/rfc/rfc9745.html). IETF. Resource deprecation signaling (pairs with RFC 8594 Sunset).
- Wilde, E. (2019). [RFC 8594: The Sunset HTTP Header Field](https://www.rfc-editor.org/rfc/rfc8594.html). IETF. Sunset signaling for resources with a known end-of-life.
- McManus, P. (2017). [RFC 8297: An HTTP Status Code for Indicating Hints](https://www.rfc-editor.org/rfc/rfc8297.html). IETF. `103 Early Hints`.
- Thomson, M., Nottingham, M., & Shapiro, W. (2018). [RFC 8470: Using Early Data in HTTP](https://www.rfc-editor.org/rfc/rfc8470.html). IETF. `425 Too Early` (TLS 1.3 0-RTT replay).
- Bray, T. (2016). [RFC 7725: An HTTP Status Code to Report Legal Obstacles](https://www.rfc-editor.org/rfc/rfc7725.html). IETF. `451 Unavailable For Legal Reasons`.
- Eastlake, D., Reschke, J., & Nottingham, M. (2017). [RFC 8246: HTTP Immutable Responses](https://www.rfc-editor.org/rfc/rfc8246.html). IETF. The `immutable` Cache-Control extension.
- Nottingham, M., & Kamp, P-H. (2024). [RFC 9651: Structured Field Values for HTTP](https://www.rfc-editor.org/rfc/rfc9651). IETF. The typed substrate for modern headers; obsoletes RFC 8941.
- Nottingham, M. (2022). [RFC 9205: Building Protocols with HTTP](https://www.rfc-editor.org/rfc/rfc9205.html). IETF (BCP 56; obsoletes RFC 3205). Best-current-practice for composing HTTP semantics into a sound API or protocol.
- Snell, J. (2014). [RFC 7240: Prefer Header for HTTP](https://www.rfc-editor.org/rfc/rfc7240.html). IETF. Client negotiation of optional server behavior (`respond-async`, `return=minimal`, `wait`, `handling`) + the `Preference-Applied` response header.
- [draft-ietf-httpbis-safe-method-w-body](https://datatracker.ietf.org/doc/draft-ietf-httpbis-safe-method-w-body/). IETF HTTPBIS WG. Defines the **QUERY** method (safe + idempotent, with a request body); IANA-registered and IESG-approved, in the RFC Editor queue, not yet a published RFC. See also RFC 9110 § 9.3.1 on why a GET body has no defined semantics.
- [draft-ietf-httpapi-idempotency-key-header](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/). IETF HTTPAPI WG, **expired Internet-Draft** (reached draft-07, Oct 2025; never published as an RFC). The Idempotency-Key request header — a widely-deployed de-facto convention (Stripe, PayPal) rather than a ratified standard. MDN documents it as experimental.
- [draft-ietf-httpapi-ratelimit-headers](https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/). IETF HTTPAPI WG, active Internet-Draft (not yet an RFC). The RateLimit / RateLimit-Policy fields.
- IANA. [Hypertext Transfer Protocol (HTTP) Method Registry](https://www.iana.org/assignments/http-methods/http-methods.xhtml). The current method registry, including safety/idempotency flags; `QUERY` is registered as safe and idempotent.
- HTTP Working Group. [HTTP Documentation](https://httpwg.org/specs/). Current map of core HTTP RFCs, registries, and extension RFCs.
- OpenAPI Initiative. [OpenAPI Specification v3.2.0](https://spec.openapis.org/oas/v3.2.0.html). Current HTTP API description standard (adds first-class `query` support); useful for documenting method/status/header contracts, not a replacement for HTTP semantics.
- Cloudflare. [Slashing agent token costs with RFC 9457-compliant error responses](https://blog.cloudflare.com/rfc-9457-agent-error-pages/). Vendor adoption signal for Problem Details as machine-readable client/agent error control flow.
- Akamai. [Error response syntax](https://techdocs.akamai.com/developer/docs/error-responses). Vendor adoption signal for RFC 9457-style API error responses.
- Fielding, R. T. (2000). [Architectural Styles and the Design of Network-based Software Architectures](https://www.ics.uci.edu/~fielding/pubs/dissertation/top.htm). Ph.D. dissertation, UC Irvine. The original REST definition.
- MDN Web Docs. [HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP). Practical reference complementing the RFCs.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `backend-engineering`
- Deployment: `portable`
- Domain: `engineering/protocol`

**When to use**
- decide whether bulk-update should be PUT or PATCH
- explain why this endpoint should return 409 instead of 400
- review whether this DELETE handler is truly idempotent
- design the Vary header for this endpoint that varies on Accept-Language
- decide whether a complex read query should be GET, POST, or QUERY
- Triggers: `what status code should this return`, `is this method idempotent`, `RFC 9110`, `conditional request`, `cache control header`, `HTTP QUERY method`

**Not for**
- design the JSON shape of the request and response bodies (use api-design)
- verify a Stripe webhook signature (use webhook-integration)
- decide between WebSocket and SSE for live updates (use streaming-architecture)
- Owned by `api-design`: the surface shape (routes, request/response schemas, pagination)
- Owned by `webhook-integration`: inbound provider mechanics (signing, retry, vendor-specific topics)

**Related skills**
- Verify with: `api-design`, `code-review`
- Related: `api-design`, `webhook-integration`, `system-interface-contracts`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: HTTP semantics is to web APIs what the rules of grammar are to written language — the framework provides the dictionary (routes, handlers, middleware) but the grammar is non-negotiable, and a sentence that follows the dictionary while violating the grammar is technically intelligible but causes downstream tooling (CDNs, proxies, client libraries) to misinterpret it.
- Common misconception: |

**Keywords**
- `HTTP semantics`, `RFC 9110`, `idempotent methods`, `HTTP status codes`, `conditional requests`, `content negotiation`, `cache control`, `representation metadata`, `HTTP QUERY method`, `Problem Details`

<!-- skill-graph-context:end -->
