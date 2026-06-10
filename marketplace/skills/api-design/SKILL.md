---
name: api-design
description: "Use when designing or reviewing HTTP API surfaces: consumer tasks, audience class, protocol/paradigm fit, resources/actions, route taxonomy, request and response schemas, status codes in context, pagination, filtering, sorting, field selection, idempotency, auth and tenant boundaries, error envelopes, rate-limit signals, versioning, deprecation, discovery, and contract artifacts. Do NOT use for pure HTTP protocol semantics (use `http-semantics`), framework-specific route handler mechanics (use `route-handler-design`), non-HTTP system contracts (use `system-interface-contracts`), async event contracts (use `event-contract-design`), database design (use `data-modeling`), inbound provider webhook mechanics (use `webhook-integration`), or post-failure diagnosis (use `debugging`). Do NOT use for define the broader contract between a job, service, and dashboard. Do NOT use for design database tables, foreign keys, and views. Do NOT use for implement provider webhook signature verification and retry behavior."
license: MIT
compatibility: "Portable API design guidance for REST-like HTTP APIs, route handlers, internal APIs, and documented JSON contracts."
allowed-tools: Read Grep
metadata:
  relations: "{\"related\":[\"event-contract-design\",\"data-modeling\",\"debugging\",\"system-interface-contracts\",\"testing-strategy\",\"webhook-integration\",\"semantics\"],\"suppresses\":[\"route-handler-design\",\"webhook-integration\",\"http-semantics\"],\"verify_with\":[\"contract-testing\",\"testing-strategy\",\"code-review\",\"http-semantics\"]}"
  subject: backend-engineering
  public: "true"
  scope: "Use when designing or reviewing HTTP API surfaces: consumer tasks, audience class, protocol/paradigm fit, resources/actions, route taxonomy, request and response schemas, status codes in context, pagination, filtering, sorting, field selection, idempotency, auth and tenant boundaries, error envelopes, rate-limit signals, versioning, deprecation, discovery, and contract artifacts. Do NOT use for pure HTTP protocol semantics (use `http-semantics`), framework-specific route handler mechanics (use `route-handler-design`), non-HTTP system contracts (use `system-interface-contracts`), async event contracts (use `event-contract-design`), database design (use `data-modeling`), inbound provider webhook mechanics (use `webhook-integration`), or post-failure diagnosis (use `debugging`)."
  taxonomy_domain: engineering/api-design
  stability: experimental
  keywords: "[\"API design\",\"REST API\",\"endpoint design\",\"request response schema\",\"status codes\",\"pagination\",\"filtering\",\"idempotency\",\"API versioning\",\"error envelope\"]"
  examples: "[\"design the API for listing orders with filters, pagination, and stable errors\",\"review this route contract before frontend and backend implement it separately\",\"should this operation be a resource update, an action endpoint, or an async job?\",\"define API versioning and idempotency for this create endpoint\"]"
  anti_examples: "[\"define the broader contract between a job, service, and dashboard\",\"design database tables, foreign keys, and views\",\"implement provider webhook signature verification and retry behavior\",\"debug why this endpoint is returning 500\"]"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/backend-engineering/api-design/SKILL.md
  skill_graph_export_description_projection: anti_examples
  skill_graph_export_description_projection_truncated: "true"
---

# API Design

## Concept of the skill

Use when designing or reviewing HTTP API surfaces: consumer tasks, audience class, protocol/paradigm fit, resources/actions, route taxonomy, request and response schemas, status codes in context, pagination, filtering, sorting, field selection, idempotency, auth and tenant boundaries, error envelopes, rate-limit signals, versioning, deprecation, discovery, and contract artifacts.

## Coverage

Design clear, durable HTTP API surfaces — the contract another program depends on. This skill covers:

- **Consumer & task framing** — who calls the API, the job each call accomplishes, the audience class, the owner, and the stability/release channel that set the compatibility bar.
- **Protocol/paradigm fit** — confirming HTTP/REST is the right shape before drawing routes (vs GraphQL, gRPC, or async events).
- **Resource & action modeling** — resources vs RPC-style action endpoints, route naming, when an operation is a sub-resource, a state transition, or an async job.
- **Schemas** — request/response/error body shapes as *public representations* separate from internal models; validation, required vs optional, nullability, read-only/write-only, and additive evolution — including extensible enums (treat enum sets as open so a new server-added value never breaks a strict client).
- **Status codes in context** — choosing the code that matches retry behavior and the required client action (the status-code reference table below).
- **Error envelopes** — a single consistent error shape; RFC 9457 Problem Details as the portable default.
- **Collections** — pagination (cursor vs offset), filtering, sorting, field selection, stable ordering, and empty-result behavior.
- **Idempotency & concurrency** — `Idempotency-Key` for unsafe writes (request fingerprinting, replay, and conflict rules); `ETag` / `If-Match` optimistic concurrency for updates.
- **Async / long-running operations** — `202 Accepted` + operation-resource polling.
- **Rate-limit & deprecation signals** — `429` + the `RateLimit` / `RateLimit-Policy` fields / `Retry-After`; `Deprecation` + `Sunset` headers.
- **Versioning** — URI vs header vs date-based; additive-change rules and the deprecation lifecycle.
- **Auth, tenant & authorization boundaries** — authentication, scopes, tenancy, and per-object/per-property authorization (mass-assignment and output-exposure control) in the contract.
- **Discovery & contract artifacts** — OpenAPI (the latest version your toolchain supports) as the machine-readable source of truth; an API catalog for portfolio-level discovery; AI/tool discoverability; contract tests and fixtures.

This skill owns the product-facing contract of an HTTP API. It does **not** own the broader interface contract between systems, async event envelopes, stored data design, inbound provider webhook mechanics, framework-specific route handler implementation, or diagnosis of an already failing endpoint.

## Philosophy of the skill
An API is a product surface for another program. Its main job is **stable meaning under change**: a consumer that integrated last year should keep working, and a client should be able to tell what happened, what it can do next, and whether retrying is safe without reading server code. Internal convenience should not leak into routes, schemas, or errors unless consumers actually need it.

Prefer **boring consistency**. A small set of predictable patterns — one error shape, one pagination style, one idempotency mechanism — beats clever endpoint-specific behavior that every client has to rediscover. Consistency is itself a feature: it is what lets a client author one HTTP layer instead of one per endpoint.

**Assume observable behavior becomes part of the contract.** Clients can come to depend on response shape, ordering, error codes, null behavior, latency class, and even undocumented fields once those details are visible. Decide deliberately what is public and what may change.

**Do not expose the database, framework, or internal service layout by accident.** A resource is the representation the client needs, not necessarily a table. A route is the public language of the product, not the shape of the implementation. A storage table can split, merge, denormalize, or migrate without changing the API if the representation is stable.

**Design the contract first, then implement to it.** A contract written as an OpenAPI document (or even a reviewed Markdown spec) before code exists is cheap to change; the same change after three teams have coded against it is expensive. The contract is the artifact frontend, backend, and test authors agree on in parallel — that parallelism is the whole point of writing it down.

**Evolve additively; break loudly.** Adding an optional field, a new endpoint, or a new enum value a client can ignore is safe. Removing a field, renaming it, tightening validation, or changing a status code is breaking — it requires a new version and an announced deprecation, never a silent in-place edit.

**Standards are defaults, not ceremony.** Start from HTTP semantics, Problem Details, OpenAPI, documented deprecation headers, and explicit compatibility rules. Deviate only when the consumers and the migration cost justify it.

## Method

1. **Triage consumers, audience, and tasks before drawing routes.** List who calls the API and the job each call accomplishes; name the owner, the stability level (internal / preview / beta / stable / deprecated), the release channel, and the data sensitivity. Classify the audience — public / partner / internal / admin / service-to-service / agent-or-tool — because that classification sets the compatibility bar, the auth model, and how loudly you must version. Design for those tasks, not for your table layout.
2. **Decide whether this is API design or a handoff to a neighboring skill** (see Boundary Triage), then **choose the protocol/paradigm fit** before drawing routes — a graph-shaped client-driven read surface may belong in GraphQL, a low-latency internal call in gRPC, and a fire-and-forget notification in an async event contract.
3. **Model resources first; use actions only when standard resource operations do not fit.** Most operations are CRUD on nouns (`/orders`, `/orders/{id}`). When a verb has no clean resource (`/orders/{id}/cancel`, `/payments/{id}/refunds`), model it as a state transition or a sub-resource, not a free-floating RPC.
4. **Write the contract before implementation:** method, URI, request, response, errors, auth, idempotency, pagination, versioning, and concrete examples.
5. **Define request, response, and error schemas as public representations** — separate from internal models. Decide required vs optional, nullable vs absent, read-only/write-only, and enum-vs-open-string for every field. Validate input and return field-level errors.
6. **Choose HTTP method and status behavior by client action and retry semantics** (table below). The code is a contract: it tells the client whether to retry, re-auth, fix input, or give up.
7. **Define collection semantics:** pagination style (cursor for large/changing sets, offset only for small bounded ones), filtering grammar, sort keys with a stable unique tiebreaker, optional sparse field selection, stable total ordering, and empty-result behavior.
8. **Define mutation semantics:** idempotency keys with request fingerprinting and replay, optimistic concurrency (`ETag`/`If-Match`), async job behavior, and retry windows for unsafe operations.
9. **State auth, tenant, scope, object-level, function-level, and property-level authorization** in the contract.
10. **Publish machine-readable contract artifacts and add fixtures or contract tests.** Generate or hand-write an OpenAPI document; add contract tests or recorded fixtures so drift between doc and implementation is caught.
11. **Define versioning, compatibility, deprecation, sunset, and discovery before the first breaking change** — pick one versioning scheme, document the support window, and plan to emit `Deprecation`/`Sunset` headers.

## Boundary Triage

Use this skill when the task is the shape and behavior of an HTTP API endpoint or documented JSON-over-HTTP contract.

| If the task is mainly... | Use |
|---|---|
| REST/resource route taxonomy, request/response shape, pagination, idempotency, versioning, errors | `api-design` |
| HTTP method/status/header semantics independent of one API surface | `http-semantics` |
| Next.js `route.ts`, runtime choice, raw body parsing, CORS mechanics, framework defaults | `route-handler-design` |
| A contract across modules, jobs, services, agents, teams, or multiple transport types | `system-interface-contracts` |
| Async topics, event envelopes, replay, dead-letter behavior, CloudEvents, AsyncAPI | `event-contract-design` |
| Tables, keys, constraints, indexes, normalization, stored-data lifecycle | `data-modeling` |
| Inbound third-party webhook signatures, provider retry contracts, raw payload persistence | `webhook-integration` |
| Verifying consumer/provider compatibility from the API contract | `contract-testing` |
| A behavior is already broken and needs root-cause isolation | `debugging` |

## Protocol and Paradigm Triage

This skill may help choose the initial API style, but it should not take over full ownership of non-HTTP or specialized schema work.

| Paradigm | Prefer when | Boundary |
|---|---|---|
| Resource-oriented JSON-over-HTTP | Consumers need broad tooling, cacheable/linkable resources, simple public or partner compatibility, and OpenAPI-style documentation. | `api-design` owns the endpoint contract; verify method/header details with `http-semantics`. |
| GraphQL-over-HTTP | Consumers need query-shaped reads, selective nested data, or frontend-driven composition, and the organization can govern schema evolution and resolver cost. | Use `api-design` for the selection tradeoff only; schema/resolver ownership belongs to a GraphQL-specific or broader interface-contract skill when available. |
| gRPC or typed IDL | Internal service-to-service calls need strict generated clients, streaming, low-latency binary transport, or strongly versioned RPC methods. | Route detailed ownership to `system-interface-contracts` and transport-specific skills; do not force gRPC design into this HTTP API skill. |
| Async events or webhooks | Producers push state changes, consumers subscribe, replay matters, or delivery/retry contracts dominate. | Use `event-contract-design` for event streams and `webhook-integration` for inbound provider webhooks. |

Protocol choice depends on consumers, tooling, compatibility, cache behavior, operations, contract ownership, and migration cost. Avoid categorical rules like "public means REST" or "internal means gRPC."

## Consumer and Task Framing

Before drawing routes, name:

- **Consumers:** browser UI, mobile app, partner, internal service, CLI, background worker, admin operator, agent/tool.
- **Audience class:** public, partner, internal, admin/operator, service-to-service, or agent/tool consumer.
- **Task:** list, inspect, create, update, cancel, approve, export, retry, reconcile, search, or report.
- **Owner:** team responsible for the contract and for client communication.
- **Stability:** internal, preview, beta, stable, deprecated.
- **Change tolerance:** coordinated deploy, independent deploy, public backward compatibility, or migration window.
- **Data sensitivity:** tenant, principal, scopes, object-level checks, property-level exposure.

If the API has multiple independent consumers, **design for the least coordinated one.** A public or partner API needs stronger compatibility and deprecation discipline than an internal route called only by one UI bundle. A co-deployed internal surface may relax the version *label* — but never the additive-vs-breaking discipline.

## Resources vs Actions

Start with resources and standard operations:

| Operation | Typical HTTP shape | Notes |
|---|---|---|
| List | `GET /orders` | Define filters, sort, pagination, and stable ordering. |
| Read one | `GET /orders/{orderId}` | Use an opaque stable identifier. Decide 404 vs hidden-by-policy 404. |
| Create | `POST /orders` | Usually returns `201 Created`, `Location`, and the created representation. |
| Replace | `PUT /orders/{orderId}` | Full replacement; idempotent if the same representation is sent repeatedly. |
| Partial update | `PATCH /orders/{orderId}` | Define patch format and concurrency behavior explicitly. |
| Delete | `DELETE /orders/{orderId}` | Idempotent post-condition; repeated calls may return different responses. |

Use an action endpoint when the operation is not a natural resource state transfer:

- `POST /orders/{orderId}/cancel`
- `POST /exports`
- `POST /orders/{orderId}/refund`
- `POST /imports/{importId}/retry`

Action endpoints still need resource discipline: request schema, response schema, auth, idempotency, retry behavior, error types, and compatibility rules. Avoid inventing custom HTTP verbs. Pick one action style and use it consistently. Reach for an action endpoint only when the operation genuinely is not a resource lifecycle change.

## Status Codes — Retry & Client-Action Semantics

API design does not replace `http-semantics`, but every API contract must respect HTTP semantics. Pick the code by what you want the client to *do*, not just by category.

| Decision | API design rule |
|---|---|
| Method | Choose by operation meaning, safety, idempotency, payload semantics, and client retry behavior. |
| Status family | The first digit is the contract: 2xx fulfilled, 3xx further action, 4xx client-actionable problem, 5xx server or upstream failure. |
| Retryability | State whether the client may retry, when, and whether it must reuse an idempotency key or conditional header. |
| Client action | Error responses must tell the client whether to fix input, authenticate, ask for permission, retry later, or stop using the endpoint. |
| Representation metadata | Define `Content-Type`, content negotiation, caching, `ETag`, `Vary`, and `Location` when they matter. |

| Code | Meaning | Client should |
|---|---|---|
| `200 OK` | Success with a body | Use the body |
| `201 Created` | Resource created | Read `Location` / returned resource |
| `202 Accepted` | Accepted, processing async | Poll the operation/status URL |
| `204 No Content` | Success, no body (e.g. delete) | Proceed; expect no body |
| `400 Bad Request` | Malformed / un-parseable request | Fix the request; do **not** retry unchanged |
| `401 Unauthorized` | Missing/invalid credentials | Authenticate, then retry |
| `403 Forbidden` | Authenticated but not allowed | Do not retry; lacks permission/scope |
| `404 Not Found` | Resource absent (or hidden for authz) | Do not retry as-is |
| `409 Conflict` | State conflict (duplicate, version clash) | Resolve conflict, then retry |
| `410 Gone` | Resource permanently removed | Stop calling; update integration |
| `412 Precondition Failed` | `If-Match`/`If-Unmodified-Since` failed | Re-fetch, reconcile, retry |
| `415 Unsupported Media Type` | Request body media type unsupported | Send a supported `Content-Type` |
| `422 Unprocessable Content` | Syntactically valid, semantically invalid | Fix field-level errors |
| `428 Precondition Required` | Server requires a conditional request | Retry with `If-Match` |
| `429 Too Many Requests` | Rate limited | Back off per `Retry-After` or the `RateLimit` field's reset parameter |
| `500 Internal Server Error` | Unexpected server fault | Retry with backoff (idempotent ops) |
| `503 Service Unavailable` | Temporarily down/overloaded | Retry per `Retry-After` |

`422` is the right code for "well-formed JSON, business rule violated" (RFC 9110 §15.5.21); reserve `400` for requests the server cannot parse. Both are common — pick one convention and apply it everywhere. Never return `200 OK` with an error body for a failed operation — that breaks clients, caches, observability, and retry logic.

## Request and Response Schemas

Treat schemas as public representations:

- Separate **request models from response models from database models.**
- Mark required, optional, nullable, read-only, write-only, deprecated, and output-only fields.
- Define stable identifier format and opacity. Do not expose internal IDs unless they are intended public IDs.
- Name timestamps, time zones, units, currencies, and precision explicitly.
- Define **enum extension policy:** closed set, open set with unknown handling, or version-gated additions. Treat enum sets as open by default so a new server-added value never breaks a strict client. If the OpenAPI toolchain supports a vendor extension such as `x-extensible-enum`, use it as documentation or generator guidance — but do not depend on one extension unless the supported tooling is named.
- Define nested object expansion rules (`include`, `expand`, `fields`) if clients can request related data.
- For **bulk operations**, define partial-failure behavior and whether ordering is preserved.
- Provide one success example and at least one failure example for every nontrivial operation.

Validation should happen at the API boundary. **Do not bind arbitrary request JSON directly to internal entities** — that causes mass-assignment and property-authorization failures. Allowlist writable input fields and reject or ignore unknown fields deliberately, with a documented policy.

## Collection Endpoints — Pagination, Filtering & Sorting

A collection endpoint is incomplete until it defines ordering, pagination, filtering, sorting, and empty-result behavior.

| Strategy | Best for | Cost / risk |
|---|---|---|
| **Cursor (keyset)** — opaque `cursor`/`next` token over a stable sort key | Large or actively changing collections; infinite scroll | Cannot jump to an arbitrary page; cursor must encode the sort |
| **Offset** — `?limit=&offset=` (or `page=`) | Small, bounded, slow-changing sets needing page numbers | At deep offsets the DB reads and discards all skipped rows; inserts cause **skipped or duplicated** items between pages |

Default to **cursor-based** pagination for anything that grows; offset is acceptable only for small admin lists. Always define a **stable total ordering** (e.g. `created_at, id`) — pagination over a non-deterministic order silently drops and repeats rows.

**Cursor rules:**

- Ordering must be stable and deterministic; add a **unique tiebreaker** to every sort, even when the visible sort key is not unique.
- Cursors are opaque to clients and must bind to the filter and sort context that produced them.
- Define default and maximum page size.
- Return pagination metadata consistently (`next`/`prev` cursors and/or link relations).
- Do not promise exact total counts unless the system can produce them cheaply and correctly.
- An empty list is a successful `200` response, not an error.

**Offset rules:**

- Name a maximum offset or page limit.
- Warn when ordering is not stable under concurrent writes.
- Use only when the collection is naturally stable or consumer impact is low.

**Filtering, sorting & field selection** — filters and sorts are part of the contract, not pass-through query language:

- Pick one grammar and document the allowed fields and operators (`?status=open&sort=-created_at`).
- **Allowlist** filter/sort fields and operators — never interpolate them into a query.
- Define case sensitivity, time zone, date inclusivity, null handling, and enum matching.
- Define sort direction syntax and default sort; reject unsupported filters/sorts with a predictable error.
- Offer sparse field selection (`?fields=id,status`) only when payload size is a real problem; an extra option is a permanent contract. Document default fields, allowed fields, dependency fields, and auth behavior.
- **Never use field omission as the only authorization control** — enforce authorization before shaping the response.

## Mutations, Idempotency & Optimistic Concurrency

For every mutating endpoint, decide whether duplicate requests are safe. `GET`/`PUT`/`DELETE` are idempotent by HTTP definition (RFC 9110); `POST` and `PATCH` are not.

| Mutation type | Contract decision |
|---|---|
| Natural idempotent update | Use `PUT`, `DELETE`, conditional `PATCH`, or a state transition with a deterministic post-condition. |
| Non-idempotent create/action | Support client-generated idempotency keys when duplicate side effects would harm users. |
| Long-running work | Return `202 Accepted` with an operation resource, cancellation semantics, completion states, and retry behavior. |
| Concurrency-sensitive update | Use `ETag` plus `If-Match`, a version field, or another explicit precondition. |

**Idempotency keys.** For create/charge-style `POST`s, accept an **`Idempotency-Key`** request header — the de-facto industry pattern (Stripe, PayPal, Square). It was specified in the IETF `httpapi` working-group draft `draft-ietf-httpapi-idempotency-key-header`, but that draft has lapsed (the `-07` revision expired 2026-04-18), so treat the convention as the reference, not a ratified standard, and pair it with the provider contracts your clients actually depend on. When using idempotency keys, define:

- **Header/field name** (usually `Idempotency-Key`) and which methods accept it — do not require it for naturally idempotent `GET`/`DELETE`.
- **Key ownership and scope:** client-generated, scoped to tenant/user/API key and endpoint.
- **Entropy and length requirements.**
- **Store-and-replay:** atomically persist key, request fingerprint, response status, and response body; replay the identical stored response for any retry within the retention window, so a network retry never double-creates.
- **Request fingerprint:** bind the key to a hash of the request payload. A same key arriving later with a *different* body returns a deterministic client error (`409`/`422`) — never silently apply the new body under an old key.
- **In-flight collision behavior:** a second request with the same key while the first is still processing returns `409` (or waits on the original) rather than executing twice concurrently.
- **TTL and pruning behavior.**

**Optimistic concurrency.** Return an `ETag` on reads; require `If-Match: <etag>` on updates. A stale `If-Match` fails with `412 Precondition Failed` instead of clobbering a change the client never saw; a domain state conflict returns `409 Conflict`. Do not collapse both into a generic `400`. Use `428 Precondition Required` to force conditional writes.

## Async & Long-Running Operations

Do not hold a connection open for work that takes seconds-to-minutes. Return `202 Accepted` with a link to an **operation resource** (`/operations/{id}` or the eventual resource's status URL); the client polls it and reads `status: pending|succeeded|failed` plus a result or error, with cancellation semantics defined. This keeps timeouts, retries, and progress observable. (If the consumer needs *push* notification of completion, that is a webhook/event-contract concern — route to `webhook-integration` / `event-contract-design`.)

## Auth, Tenancy & Exposure

Authorization is part of API design, not only middleware. For each operation, specify:

- **Principal:** user, service account, API key, anonymous caller, or delegated actor.
- **Tenant boundary** and how the tenant is selected — derive it from the token claim, **not** a client-supplied id.
- **Scopes, roles, or permissions** required, and what `401` vs `403` mean here.
- **Object-level authorization:** can this principal act on this specific resource?
- **Function-level authorization:** can this principal perform this operation?
- **Property-level authorization:** can this principal read or write each sensitive field?
- **Hidden-resource policy:** return `403`, `404`, or a redacted representation?
- **Audit and correlation identifiers** required for sensitive operations.

Property-level authorization matters in **both directions** (OWASP API3:2023, broken object property-level authorization). Output schemas can leak fields that should be hidden; input schemas can allow writes to fields that should be server-controlled. Bind writable fields to an allowlist so a client cannot set `role`, `owner_id`, or `is_admin` via mass assignment; bind readable fields so internal columns do not leak in responses.

## Error Envelopes — RFC 9457 Problem Details

Use **one** error shape across the whole API. The portable default is RFC 9457 *Problem Details for HTTP APIs* (published July 2023; obsoletes RFC 7807, same wire format), served as `Content-Type: application/problem+json`. Migrate old RFC 7807 references to RFC 9457 while preserving the same client-facing problem-type identities where possible — the upgrade is additive, so there is no urgency to migrate the wire format if you already standardized on 7807.

```json
{
  "type": "https://api.example.com/problems/insufficient-funds",
  "title": "Insufficient funds",
  "status": 403,
  "detail": "Charge of $50.00 exceeds the available balance of $12.40.",
  "instance": "/accounts/12345/charges/67890",
  "errors": [
    { "detail": "amount exceeds balance", "pointer": "/amount" }
  ]
}
```

- `type` is a stable URI identifying the problem class — the field clients branch on. **Treat changing a `type` URI or its meaning as a breaking change.** RFC 9457 added an IANA "HTTP Problem Types" registry for common `type` values.
- `title` is human-readable and constant per `type`; `detail` is instance-specific. Never make clients parse `detail` prose for logic.
- Problem Details **base members** are `type`, `title`, `status`, `detail`, and `instance`. Validation arrays such as `errors`, `violations`, or `invalid_params` are RFC 9457 **extension** members (§3.2), not standardized base fields — so the `errors` array shown above is part of *your* contract to document. Define its member name, item schema, JSON Pointer/field-path convention, ordering, localization, and compatibility rules.
- Always include a machine-readable error **code or `type`** in addition to the HTTP status, plus field-level errors for validation failures so a form can highlight the right input.
- Avoid stack traces, database names, secrets, internal hostnames, or raw upstream messages in public errors.
- Do **not** return `200 OK` with an error body — that defeats every generic HTTP client and is a classic semantic failure.

Validation errors should distinguish: malformed JSON / wrong content type; missing required field; unknown-field policy violation; field type/format violation; domain-rule violation; authorization failure; state conflict.

## Rate Limits & Quotas

A rate-limited API must tell clients how to behave. Define:

- **Partition key:** user, tenant, token, IP, endpoint, or business flow.
- **Quota unit:** request count, resource count, tokens, bytes, concurrent jobs, or cost units.
- **Window or budget reset policy.**
- **Status code,** normally `429 Too Many Requests`.
- **`Retry-After`** behavior on retryable throttling. When both `Retry-After` and a `RateLimit` reset are present, they should point to the same instant.
- **Rate-limit headers or body fields, with exact names and semantics.** The IETF `RateLimit` / `RateLimit-Policy` structured-field headers (`draft-ietf-httpapi-ratelimit-headers`) carry remaining quota and the window reset as parameters of the single `RateLimit` field (not the older separate `RateLimit-Limit`/`-Remaining`/`-Reset` headers). It is still an active Internet-Draft, not an RFC — if you adopt it, document the convention explicitly and keep clients tolerant of provider-specific alternatives (e.g. `x-ratelimit-*`).
- **Browser visibility:** expose the needed headers via CORS if browser clients must read them.
- **Classification:** whether exhausted quota is a retryable condition, a plan limit, or a permanent business error.

## Versioning, Compatibility, Deprecation & Sunset

Define compatibility rules **before the first breaking change**. For any externally-consumed API, do not ship an unversioned "default" surface — it creates silent breakage the day a change lands. (A tightly-controlled *internal* API with a known, co-deployed set of clients may defer an exposed version, but it still owes the same additive-vs-breaking discipline.)

**Usually backward-compatible (do not bump the version):** adding optional response fields; adding new enum values *only if* clients are required to ignore unknown values; adding optional request fields; adding new endpoints; adding new filters/sorts when old behavior is unchanged.

**Usually breaking (need a new version + migration path):** removing or renaming fields; making optional request fields required; changing field meaning, unit, precision, enum semantics, or identifier format; changing default sort/order in a client-visible way; changing error `type`/code semantics; changing pagination cursor format without preserving old cursors during a transition; tightening authorization clients previously depended on.

Pick **one** versioning scheme and use it consistently:

| Scheme | Example | Trade-off |
|---|---|---|
| **URI path** | `/v1/orders` | Most explicit and cache-friendly; coarse — a new version is a whole new tree. Best for public APIs needing parallel versions. |
| **Header / media type** | `Accept: application/vnd.example.v2+json` | Keeps URLs stable; harder to test from a browser/curl. |
| **Date-based** | `Stripe-Version: 2026-01-15` | Fine-grained, one pinned version per account; large internal transformation cost (Stripe's model). |

Avoid minor/patch versions in routes. Additive changes land in place; incompatible changes need a major version or a negotiated migration path. Stripe's decade of backward compatibility is built on absorbing this complexity internally via a per-version transformation layer rather than forcing every client to migrate at once.

**Deprecation & sunset** are distinct stages:

- Signal a deprecated endpoint/version with the `Deprecation` response header (RFC 9745) — "no longer recommended." Use `Link: <...>; rel="deprecation"` to point to migration documentation.
- When the resource will actually stop responding, add the `Sunset` header (RFC 8594) with the removal date — its timestamp must **not** precede the `Deprecation` date.
- Announce with documentation and client communication *before* behavior changes; keep deprecated behavior unchanged until the sunset/migration gate; track real usage before removal. Deprecation is a signal, not a behavior change — do not silently remove an endpoint because the server no longer needs it.

## Discovery & Contract Artifacts

Every nontrivial API should have a machine-readable contract artifact. For HTTP APIs, prefer **OpenAPI**:

- Use the current OpenAPI release your toolchain supports (3.2 is current, 3.1 is broadly tooled with full JSON Schema alignment).
- Define operation IDs, parameters, request bodies, responses, schemas, security requirements, headers, examples, and error responses.
- Include pagination parameters and response links, idempotency-header semantics for mutating operations, and deprecation/sunset headers where applicable.
- Keep examples valid against schemas — validate the generated examples, not only the schema shapes.

For public API **portfolios**, publish an API catalog (`/.well-known/api-catalog`, RFC 9727) so consumers can discover available surfaces, documentation, usage policies, versions, and OpenAPI definitions.

For **agent/tool consumers**, make the same public contract easy to ingest without inventing a second source of truth:

- Keep OpenAPI (or the canonical contract artifact) authoritative.
- Provide short, stable links to authentication, rate limits, pagination, idempotency, error types, deprecation policy, and examples.
- Optionally publish AI-readable documentation such as `/llms.txt` or an equivalent docs index that links to the canonical contract. Treat such files as public documentation support, not a required verification gate, and never a place for secrets, customer data, private paths, or unreleased internals.
- Test whether an agent can answer basic integration questions from the published docs — but fix the *canonical contract* when the agent-facing summary and the contract disagree.

Contract artifacts do not replace contract tests. OpenAPI describes the provider surface; consumer-driven contract tests capture what a specific consumer relies on and verify the provider against that expectation.

## Universal API Anti-Patterns

| Anti-pattern | Why it fails | Replace with |
|---|---|---|
| `200 OK` with an error body | Clients, caches, retries, and observability see success. | Real 4xx/5xx status plus Problem Details or stable equivalent. |
| Database-shaped routes and fields | Storage refactors become breaking API changes. | Consumer-facing resource representations with opaque stable IDs. |
| Custom verbs or action sprawl | Every endpoint needs custom client behavior. | Standard methods first; action endpoints only for real non-resource transitions. |
| Offset pagination over large mutable collections | Inserts/deletes cause duplicates, gaps, and expensive deep pages. | Cursor/keyset pagination with deterministic ordering and a unique tiebreaker. |
| Non-idempotent retries | Network ambiguity can duplicate side effects. | Idempotency keys, conditional requests, or explicit "do not retry" rules. |
| Public or partner breaking changes without a migration path | Independent consumers cannot coordinate instantly. | Compatibility rules, major-version or negotiated migration, `Deprecation`, and `Sunset`. |
| Closed enum additions without unknown handling | Generated clients crash or reject future values. | Open enum policy, fallback behavior, or version-gated additions. |
| Implicit null, missing, or unknown-field behavior | Clients guess whether absence means unset, hidden, unauthorized, or unchanged. | Document nullable vs optional, patch semantics, and unknown-field policy. |
| Over-broad input binding | Mass assignment and property-level authorization bugs leak through the API. | Separate request models, allowlisted writable fields, and property-level auth. |
| Chatty task flow | Clients stitch many calls together, creating latency and consistency problems. | Expansion, includes, compound resources, batch endpoints, or async jobs when the task requires them. |

## Worked Example: List Orders

Contract decisions for `GET /orders`:

- Consumers: admin UI and reporting integration.
- Auth: user must have `orders:read`; tenant is derived from auth context, not query string.
- Filters: `status`, `created_at[gte]`, `created_at[lt]`, `customer_id`.
- Sorts: `created_at`, `updated_at`; server always appends `id` as a tiebreaker.
- Pagination: cursor, default `limit=50`, max `limit=200`, opaque `page[after]`.
- Response: `{ "data": [...], "page": { "next": "..." } }`.
- Empty result: `200` with `data: []`.
- Errors: invalid filter field → `400` problem; invalid cursor → `400` problem; unauthorized tenant access → `404` or `403` according to policy.
- Contract fixtures: normal page, empty page, unsupported filter, invalid cursor, unauthorized access.

## Worked Example: Create Order

Contract decisions for `POST /orders`:

- Requires `Idempotency-Key` because duplicate order creation can harm users.
- Idempotency key is scoped to tenant, authenticated principal, endpoint, and request fingerprint.
- Reusing the same key with the same request replays the original status and body.
- Reusing the same key with a different request returns a deterministic client error.
- Concurrent duplicate-key attempts return the stored result or an in-flight conflict response defined by the contract.
- Success returns `201 Created`, `Location: /orders/{orderId}`, and the order representation.
- Semantic validation returns `422` Problem Details with field-level errors.
- State conflict (e.g. unavailable inventory) returns `409` with a stable problem type.
- A server timeout does not license client-side duplicate creation; the client retries with the same idempotency key.

## Evals

This skill ships a comprehension-eval artifact at [`examples/evals/api-design.json`](https://github.com/jacob-balslev/skill-graph/blob/main/examples/evals/api-design.json). The checklist below is the authoring gate for API surface decisions; the eval file is the grader surface.

## Verification

- [ ] Consumers, tasks, owners, stability level, and release channel are named.
- [ ] Audience class and protocol/paradigm fit are named before detailed route design.
- [ ] The task belongs to API design rather than a neighboring skill.
- [ ] Routes use consistent resource/action language and avoid implementation leakage.
- [ ] HTTP method and status choices match client action, retry, and cache semantics (`400` vs `422`, `401` vs `403`, `409`/`412` for conflicts).
- [ ] Request schemas are separate from internal models and reject or handle unknown fields deliberately.
- [ ] Response schemas mark required, optional, nullable, read-only, deprecated, and sensitive fields, and enum-growth policy is explicit.
- [ ] Request and response examples cover success, validation failure, auth failure, state conflict, and server failure where relevant.
- [ ] One consistent error envelope (RFC 9457 Problem Details or equivalent); errors carry a machine-readable `type`/code, never `200` + error body.
- [ ] Collection endpoints define filters, sorts, stable ordering, pagination style, page-size limits, allowlisted filter/sort fields, and empty-result behavior.
- [ ] Mutating operations define idempotency (`Idempotency-Key` with request fingerprinting + replay), concurrency (`ETag`/`If-Match`), and duplicate-request behavior, or explicitly reject retries.
- [ ] Long-running work returns `202` + a pollable operation resource, not a held connection.
- [ ] Auth, scope, tenant, object-level, function-level, and property-level boundaries are visible in the contract (tenancy derived from the token, not client input); writable/readable fields are allowlisted (no mass assignment, no internal-field leakage).
- [ ] Rate-limit/quota responses define status, retry timing, and client-visible headers or fields.
- [ ] One versioning scheme chosen; additive-vs-breaking rules, deprecation (`Deprecation`/`Sunset`), and migration window are stated.
- [ ] A machine-readable contract (current OpenAPI) exists for nontrivial surfaces; public/agent-facing docs point back to it; contract tests/fixtures guard drift.

## Do NOT Use When

| Use instead | When |
|---|---|
| `http-semantics` | The question is purely about HTTP method, status, header, caching, conditional-request, or content-negotiation semantics, rather than whole-surface API design. |
| `route-handler-design` | You are implementing the handler itself — framework-specific request parsing, middleware order, runtime choice, raw body parsing, CORS mechanics — rather than defining the externally-visible contract. |
| `system-interface-contracts` | The boundary is broader than an HTTP API endpoint, such as jobs, modules, events, services, or agent interfaces. |
| `event-contract-design` | You need asynchronous event schema, envelope, topic/channel naming, replay, dead-letter, or compatibility rules. |
| `data-modeling` | You need persistence structure, keys, constraints, indexes, normalization, or lifecycle. |
| `webhook-integration` | You are implementing inbound third-party webhook handling, signatures, provider retry semantics, or raw payload persistence. |
| `contract-testing` | The API contract exists and the task is writing the provider/consumer tests that pin compatibility, rather than designing the contract those tests verify. |
| `semantics` | You are naming a single field, status code, or error code for truthfulness, rather than designing the surface. |
| `debugging` | An API already fails and needs root-cause diagnosis. |

## References

- RFC 9110 — HTTP Semantics: https://www.rfc-editor.org/rfc/rfc9110
- RFC 9457 — Problem Details for HTTP APIs (obsoletes RFC 7807): https://www.rfc-editor.org/rfc/rfc9457
- RFC 9745 — Deprecation HTTP Response Header: https://www.rfc-editor.org/rfc/rfc9745
- RFC 8594 — The Sunset HTTP Header: https://www.rfc-editor.org/rfc/rfc8594
- RFC 9727 — `api-catalog` well-known URI for API discovery: https://www.rfc-editor.org/rfc/rfc9727
- OpenAPI Specification (latest): https://spec.openapis.org/oas/latest.html
- IETF HTTPAPI RateLimit headers draft: https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/
- IETF HTTPAPI Idempotency-Key header draft (status): https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/
- OWASP API Security Top 10 (2023): https://owasp.org/API-Security/editions/2023/en/0x11-t10/
- Stripe — Idempotent requests: https://docs.stripe.com/api/idempotent_requests
- Stripe — API versioning: https://docs.stripe.com/api/versioning
- Google Cloud API Design Guide: https://docs.cloud.google.com/apis/design
- Google AIP-121 (Resource-oriented design), AIP-132 (List), AIP-185 (Versioning): https://google.aip.dev/
- llms.txt proposal (optional AI-readable docs discovery): https://llmstxt.org/

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `backend-engineering`
- Public: `true`
- Domain: `engineering/api-design`
- Scope: Use when designing or reviewing HTTP API surfaces: consumer tasks, audience class, protocol/paradigm fit, resources/actions, route taxonomy, request and response schemas, status codes in context, pagination, filtering, sorting, field selection, idempotency, auth and tenant boundaries, error envelopes, rate-limit signals, versioning, deprecation, discovery, and contract artifacts. Do NOT use for pure HTTP protocol semantics (use `http-semantics`), framework-specific route handler mechanics (use `route-handler-design`), non-HTTP system contracts (use `system-interface-contracts`), async event contracts (use `event-contract-design`), database design (use `data-modeling`), inbound provider webhook mechanics (use `webhook-integration`), or post-failure diagnosis (use `debugging`).

**When to use**
- design the API for listing orders with filters, pagination, and stable errors
- review this route contract before frontend and backend implement it separately
- should this operation be a resource update, an action endpoint, or an async job?
- define API versioning and idempotency for this create endpoint

**Not for**
- define the broader contract between a job, service, and dashboard
- design database tables, foreign keys, and views
- implement provider webhook signature verification and retry behavior
- debug why this endpoint is returning 500

**Related skills**
- Verify with: `contract-testing`, `testing-strategy`, `code-review`, `http-semantics`
- Related: `event-contract-design`, `data-modeling`, `debugging`, `system-interface-contracts`, `testing-strategy`, `webhook-integration`, `semantics`

**Keywords**
- `API design`, `REST API`, `endpoint design`, `request response schema`, `status codes`, `pagination`, `filtering`, `idempotency`, `API versioning`, `error envelope`

<!-- skill-graph-context:end -->
