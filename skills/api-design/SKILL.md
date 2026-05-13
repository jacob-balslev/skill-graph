---
name: api-design
description: "Use when designing or reviewing API surfaces: resources/actions, request and response schemas, status codes, pagination, filtering, idempotency, versioning, auth boundaries, and error envelopes. Do NOT use for non-HTTP system contracts (use `system-interface-contracts`), async event contracts (use `event-contract-design`), database design (use `data-modeling`), or inbound provider webhook mechanics (use `webhook-integration`)."
license: MIT
compatibility: "Portable API design guidance for REST-like HTTP APIs, route handlers, internal APIs, and documented JSON contracts."
allowed-tools: Read Grep
metadata:
  schema_version: "3"
  version: "1.0.0"
  type: capability
  browse_category: engineering
  category: engineering/api-design
  scope: portable
  owner: skill-graph-maintainer
  freshness: "2026-05-11"
  drift_check: "{\"last_verified\":\"2026-05-11\"}"
  eval_artifacts: present
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"API design\",\"REST API\",\"endpoint design\",\"request response schema\",\"status codes\",\"pagination\",\"filtering\",\"idempotency\",\"API versioning\",\"error envelope\"]"
  examples: "[\"design the API for listing orders with filters, pagination, and stable errors\",\"review this route contract before frontend and backend implement it separately\",\"should this operation be a resource update, an action endpoint, or an async job?\",\"define API versioning and idempotency for this create endpoint\"]"
  anti_examples: "[\"define the broader contract between a job, service, and dashboard\",\"design database tables, foreign keys, and views\",\"implement provider webhook signature verification and retry behavior\",\"debug why this endpoint is returning 500\"]"
  relations: "{\"boundary\":[{\"skill\":\"system-interface-contracts\",\"reason\":\"system-interface-contracts owns interface contracts across any boundary; api-design owns API endpoint shape and HTTP semantics\"},{\"skill\":\"event-contract-design\",\"reason\":\"event-contract-design owns asynchronous event and message contracts; api-design owns HTTP request/response surfaces\"},{\"skill\":\"data-modeling\",\"reason\":\"data-modeling owns persistence shape; api-design owns external representation and operation shape\"},{\"skill\":\"webhook-integration\",\"reason\":\"webhook-integration owns inbound provider webhooks; api-design owns APIs the system exposes or calls by contract\"},{\"skill\":\"debugging\",\"reason\":\"debugging owns known endpoint failures; api-design owns pre-implementation surface design\"}],\"related\":[\"system-interface-contracts\",\"data-modeling\",\"testing-strategy\",\"webhook-integration\",\"event-contract-design\"],\"verify_with\":[\"testing-strategy\",\"code-review\"]}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":365,\"review_cadence\":\"quarterly\"}"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v3
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/api-design/SKILL.md
---

# API Design

## Coverage

Design clear and evolvable API surfaces. Covers resources vs actions, route naming, request/response schemas, validation, status codes, pagination, filtering, sorting, idempotency, auth boundaries, error envelopes, rate-limit signals, versioning, deprecation, and contract examples.

## Philosophy

An API is a product surface for another program. Its main job is stable meaning under change. Internal convenience should not leak into routes, schemas, or errors unless consumers actually need it.

Prefer boring consistency. A small set of predictable patterns beats clever endpoint-specific behavior that every client has to rediscover.

## Method

1. Identify consumers and their tasks.
2. Model resources and actions separately.
3. Define request, response, and error schema examples.
4. Decide pagination, filtering, sorting, and field selection.
5. State auth, tenant, and permission boundaries.
6. Add idempotency and retry behavior for mutating or async operations.
7. Define versioning and deprecation rules before the first breaking change.
8. Add contract tests or fixtures.

## Evals

This skill ships a comprehension-eval artifact at [`examples/evals/api-design.json`](https://github.com/jacob-balslev/skill-graph/blob/main/examples/evals/api-design.json). The checklist below is the authoring gate for API surface decisions; the eval file is the grader surface.

## Verification

- [ ] Routes use consistent nouns/actions and avoid implementation leakage
- [ ] Request and response examples cover success and failure
- [ ] Status codes match retry and client-action semantics
- [ ] Collection endpoints define pagination and stable ordering
- [ ] Mutating operations define idempotency or explicitly reject it
- [ ] Auth and tenant boundaries are visible in the contract
- [ ] Breaking-change and deprecation rules are stated

## Do NOT Use When

| Use instead | When |
|---|---|
| `system-interface-contracts` | The boundary is broader than an API endpoint, such as jobs, modules, events, or agent interfaces. |
| `event-contract-design` | You need asynchronous event schema, envelope, topic/channel naming, replay, or compatibility. |
| `data-modeling` | You need persistence structure and constraints. |
| `webhook-integration` | You are implementing inbound third-party webhook handling. |
| `debugging` | An API already fails and needs diagnosis. |
