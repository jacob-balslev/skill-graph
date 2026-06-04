---
name: http-semantics
description: "Use when designing or reviewing HTTP-based systems where method semantics, status codes, idempotency, safe methods, conditional requests, content negotiation, caching headers, or representation metadata are load-bearing. Covers the RFC 9110/9111/9112 contract layer below any specific framework. Do NOT use for API surface shape and route taxonomy (use api-design), for WebSocket or SSE bidirectional streams (use streaming-architecture skill when available), for vendor-specific webhook signing (use webhook-integration), or for transport-level concerns like TLS or QUIC (use platform-level documentation). Do NOT use for decide between WebSocket and SSE for live updates (use streaming-architecture)."
license: MIT
allowed-tools: Read Grep
metadata:
  relations: "{\"adjacent\":[\"streaming-architecture\"],\"boundary\":[\"api-design\"]}"
  schema_version: "8"
  version: "1.0.0"
  subject: backend-engineering
  deployment_target: portable
  taxonomy_domain: engineering/protocol
  owner: skill-graph-maintainer
  freshness: "2026-05-15"
  drift_check: "{\"last_verified\":\"2026-05-15\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  comprehension_state: present
  stability: experimental
  keywords: "[\"HTTP semantics\",\"RFC 9110\",\"idempotent methods\",\"safe methods\",\"HTTP status codes\",\"conditional requests\",\"content negotiation\",\"cache control\",\"HTTP caching\",\"representation metadata\"]"
  triggers: "[\"what status code should this return\",\"is this method idempotent\",\"RFC 9110\",\"conditional request\",\"cache control header\"]"
  examples: "[\"decide whether bulk-update should be PUT or PATCH\",\"explain why this endpoint should return 409 instead of 400\",\"review whether this DELETE handler is truly idempotent\",\"design the Vary header for this endpoint that varies on Accept-Language\"]"
  anti_examples: "[\"design the JSON shape of the request and response bodies (use api-design)\",\"verify a Stripe webhook signature (use webhook-integration)\",\"decide between WebSocket and SSE for live updates (use streaming-architecture)\"]"
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

The IETF contract layer for HTTP-based systems: method semantics (RFC 9110 § 9), status code families (§ 15), request/response metadata (§ 6-8, 12), conditional requests (§ 13), content negotiation (§ 12), and the caching model (RFC 9111). Applies to any system using HTTP as a transport: REST APIs, GraphQL endpoints, webhook receivers, browser fetches, proxy behavior, CDN configuration.

## Philosophy

HTTP is older and more carefully specified than most of the frameworks running on top of it. RFC 9110 is the consolidated semantics reference (June 2022, obsoletes RFC 7230-7235); it represents 25+ years of distilled experience from browsers, proxies, CDNs, and load balancers. Most "weird HTTP behavior" stories come down to a framework default that doesn't match the spec.

The discipline is to ground HTTP decisions in the RFC, not the framework. When the framework default conflicts with the spec, the spec wins for portability: anything outside your codebase (a CDN, a corporate proxy, a client library in a different language) will follow the RFC, not your framework's documentation.

## Method Semantics (RFC 9110 § 9)

| Method | Safe | Idempotent | Cacheable | Typical use |
|---|---|---|---|---|
| GET | yes | yes | yes | Retrieve a representation |
| HEAD | yes | yes | yes | Retrieve metadata only |
| POST | no | no | only with explicit freshness | Submit data; catch-all for non-fitting operations |
| PUT | no | yes | no | Replace target resource with payload |
| DELETE | no | yes | no | Remove target resource |
| PATCH | no | not by default | no | Apply a partial modification (RFC 5789) |
| OPTIONS | yes | yes | no | Discover capabilities |
| TRACE | yes | yes | no | Loop-back diagnostic |
| CONNECT | no | no | no | Establish a tunnel |

**Idempotency rule (RFC 9110 § 9.2.2):** repeated requests have the same effect on resource state as a single request. The response code may differ across invocations (204 → 404 for DELETE); idempotency is about the post-condition, not the post-response.

**Safe-method rule (§ 9.2.1):** safe methods do not modify resource state. Servers MUST NOT depend on side effects of safe methods (e.g., logging counters that affect business logic are not "side effects" in the sense of the spec).

## Status Code Selection

Use the **first digit** as the contract; use the **last two digits** as refinement. A proxy that doesn't understand a specific 4xx will treat it as a generic 4xx.

| Family | When to use | Common errors |
|---|---|---|
| 2xx | Request fulfilled. 200 default; 201 for creation with Location header; 202 for async accepted; 204 for success with no body | Returning 200 with `{ error: ... }` body — wrong family |
| 3xx | Client must take further action. 301/308 for permanent; 302/307 for temporary; 303 after a POST to direct to the result; 304 for cache validation hit | Returning 302 to authentication when 401 is correct |
| 4xx | Client error. 400 for malformed request; 401 for missing/invalid credentials; 403 for valid credentials but insufficient authorization; 404 for not-found (or hidden); 405 for wrong method on valid target; 409 for state conflict; 410 for permanently gone; 412 for failed precondition; 415 for unsupported media type; 422 for valid syntax but unprocessable; 428 for required precondition; 429 for rate limit | Using 400 for everything; conflating 401 (who) with 403 (what allowed) |
| 5xx | Server error. 500 default; 501 for not-implemented method; 502 for upstream bad response; 503 for temporary unavailability (with Retry-After); 504 for upstream timeout | Returning 500 when the cause is client input (should be 4xx) |

## Conditional Requests (RFC 9110 § 13)

Use conditional requests to make non-idempotent operations safe under retry and to enable cache validation.

| Header | Pairs with | Semantic |
|---|---|---|
| If-Match | ETag | "Only apply if the resource still matches this version" — protects against lost-update on PUT/PATCH/DELETE |
| If-None-Match | ETag | "Apply only if the resource has changed" — primary cache validation |
| If-Modified-Since | Last-Modified | Date-based cache validation (lower precision than ETag) |
| If-Unmodified-Since | Last-Modified | Date-based lost-update protection |

A non-idempotent operation made conditional with If-Match becomes safe to retry: the server applies it once if the precondition holds, and returns 412 Precondition Failed every subsequent time.

## Caching (RFC 9111)

The freshness model has three orthogonal questions:

1. **Is this response cacheable at all?** Default yes for safe + 2xx + no explicit no-store. Cache-Control: no-store opts out.
2. **For how long is it fresh?** Cache-Control: max-age=N (seconds) is authoritative. Expires is the older alternative.
3. **What request headers participate in cache-key construction?** Vary lists them. A response without Vary on an endpoint that varies by Accept-Language will be served to all languages from one cached entry.

**Cache-Control directive cheat sheet:**

| Directive | Where | Meaning |
|---|---|---|
| max-age=N | response | Fresh for N seconds |
| s-maxage=N | response | Fresh in shared caches for N seconds (overrides max-age) |
| no-cache | response | Must revalidate before reuse (still cacheable) |
| no-store | response | Do not cache at all |
| private | response | Cacheable only in single-user caches (browser, not CDN) |
| public | response | Cacheable in shared caches even if normally not |
| must-revalidate | response | Stale entries must be revalidated, not served |
| stale-while-revalidate=N | response | Serve stale for N seconds while async revalidating |
| stale-if-error=N | response | Serve stale for N seconds on origin error |

## Content Negotiation (RFC 9110 § 12)

Server-driven negotiation uses request Accept-* headers and response Vary header. Pattern:

```
Request:
  Accept: application/json, text/html;q=0.9
  Accept-Language: en, fr;q=0.8

Response:
  Content-Type: application/json
  Content-Language: en
  Vary: Accept, Accept-Language
```

The Vary response header is the contract for downstream caches: it lists the request headers the cache must match on. Forgetting Vary causes language-A users to see language-B responses cached by a CDN.

## Verification

After applying this skill, verify:
- [ ] Method choice (GET/POST/PUT/PATCH/DELETE) is justified by the operation's safe/idempotent properties, not by convention.
- [ ] Status codes use the correct family; first digit semantically matches the outcome.
- [ ] Non-idempotent operations that need retry safety use If-Match + ETag (or an idempotency-key pattern).
- [ ] Cached responses include Cache-Control with explicit max-age or no-store.
- [ ] Responses that vary on request headers declare Vary correctly.
- [ ] 401 is used for "who are you" failures; 403 for "you can't do that" failures; the two are not interchangeable.
- [ ] DELETE handlers are spec-idempotent: server state is the same after one invocation as after many, regardless of the response code returned.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Designing the JSON request/response shape | `api-design` | api-design owns the surface; this skill owns the protocol layer below it |
| Verifying a vendor webhook signature | `webhook-integration` | webhook-integration owns inbound provider mechanics |
| Designing a WebSocket or SSE stream | `real-time-updates` or a streaming-architecture skill | Those skills own bidirectional / streaming patterns above HTTP |
| Designing the cross-boundary contract regardless of transport | `system-interface-contracts` | system-interface-contracts owns the contract layer that may or may not be HTTP |
| Designing a GraphQL schema or resolver chain | `api-design` or a graphql skill | This skill applies to HTTP semantics under any payload format, but schema design is api-design's surface |
| Configuring TLS, HTTP/2, HTTP/3 transport | platform documentation | Transport syntax (RFC 9112/9113/9114) is below the semantics layer |

## Key Sources

- Fielding, R., & Reschke, J. (Eds.) (2022). [RFC 9110: HTTP Semantics](https://datatracker.ietf.org/doc/html/rfc9110). IETF. The consolidated semantics reference; obsoletes RFC 7230-7235.
- Fielding, R., Nottingham, M., & Reschke, J. (Eds.) (2022). [RFC 9111: HTTP Caching](https://datatracker.ietf.org/doc/html/rfc9111). IETF. The caching model.
- Fielding, R., Nottingham, M., & Reschke, J. (Eds.) (2022). [RFC 9112: HTTP/1.1](https://datatracker.ietf.org/doc/html/rfc9112). IETF. The HTTP/1.1 wire syntax.
- Dusseault, L., & Snell, J. (Eds.) (2010). [RFC 5789: PATCH Method for HTTP](https://datatracker.ietf.org/doc/html/rfc5789). IETF. The PATCH method specification.
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
- Triggers: `what status code should this return`, `is this method idempotent`, `RFC 9110`, `conditional request`, `cache control header`

**Not for**
- design the JSON shape of the request and response bodies (use api-design)
- verify a Stripe webhook signature (use webhook-integration)
- decide between WebSocket and SSE for live updates (use streaming-architecture)

**Related skills**
- Related: `streaming-architecture`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: HTTP semantics is to web APIs what the rules of grammar are to written language — the framework provides the dictionary (routes, handlers, middleware) but the grammar is non-negotiable, and a sentence that follows the dictionary while violating the grammar is technically intelligible but causes downstream tooling (CDNs, proxies, client libraries) to misinterpret it.
- Common misconception: |

**Keywords**
- `HTTP semantics`, `RFC 9110`, `idempotent methods`, `safe methods`, `HTTP status codes`, `conditional requests`, `content negotiation`, `cache control`, `HTTP caching`, `representation metadata`

<!-- skill-graph-context:end -->
