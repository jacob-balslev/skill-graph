---
name: event-contract-design
description: "Use when designing or reviewing asynchronous event contracts: producer/consumer ownership, event envelope, schema, topic/channel naming, ordering, idempotency, versioning, compatibility, replay, dead-letter behavior, and AsyncAPI/CloudEvents-style documentation. Do NOT use for domain-event discovery (use `event-storming`), broad interface contracts (use `system-interface-contracts`), inbound provider webhook mechanics (use `webhook-integration`), or HTTP endpoint design (use `api-design`). Do NOT use for discover the domain events, commands, and policies in this business process. Do NOT use for define every boundary contract between services, jobs, and APIs. Do NOT use for verify inbound provider webhook signatures and retry behavior. Do NOT use for design REST endpoints, status codes, and pagination."
license: MIT
compatibility: "Portable async-event contract guidance for queues, streams, pub/sub, internal events, outbound webhooks, and documented event-driven APIs."
allowed-tools: Read Grep
metadata:
  relations: "{\"related\":[\"api-design\",\"state-machine-modeling\",\"entity-relationship-modeling\",\"event-storming\",\"system-interface-contracts\",\"observability-modeling\",\"webhook-integration\"],\"suppresses\":[\"event-storming\",\"system-interface-contracts\"],\"verify_with\":[\"system-interface-contracts\",\"observability-modeling\",\"real-time-updates\"]}"
  subject: software-architecture
  public: "true"
  scope: "Use when designing or reviewing asynchronous event contracts: producer/consumer ownership, event envelope, schema, topic/channel naming, ordering, idempotency, versioning, compatibility, replay, dead-letter behavior, and AsyncAPI/CloudEvents-style documentation. Do NOT use for domain-event discovery (use `event-storming`), broad interface contracts (use `system-interface-contracts`), inbound provider webhook mechanics (use `webhook-integration`), or HTTP endpoint design (use `api-design`)."
  taxonomy_domain: architecture/events
  stability: experimental
  keywords: "[\"event-contract\",\"async-api\",\"cloudevents\",\"event envelope\",\"topic naming\",\"async event schema\",\"event compatibility\",\"replay contract\",\"dead-letter behavior\",\"consumer fixtures\"]"
  examples: "[\"design the event contract for publishing OrderPaid to downstream consumers\",\"define topic names, payload schema, idempotency, and versioning for this event stream\",\"review this outbound webhook event schema before customers integrate with it\",\"write the compatibility rules for consumers of these async messages\"]"
  anti_examples: "[\"discover the domain events, commands, and policies in this business process\",\"define every boundary contract between services, jobs, and APIs\",\"verify inbound provider webhook signatures and retry behavior\",\"design REST endpoints, status codes, and pagination\"]"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/software-architecture/event-contract-design/SKILL.md
  skill_graph_export_description_projection: anti_examples
---
# Event Contract Design

## Concept of the skill

Use when designing or reviewing asynchronous event contracts: producer/consumer ownership, event envelope, schema, topic/channel naming, ordering, idempotency, versioning, compatibility, replay, dead-letter behavior, and AsyncAPI/CloudEvents-style documentation.

## Coverage

Design asynchronous event contracts for producers and consumers. Covers event envelope, schema, event type, topic/channel naming, producer ownership, consumer expectations, required and optional fields, idempotency keys, ordering, causation and correlation IDs, schema evolution, replay, dead-letter behavior, compatibility, observability, and machine-readable documentation such as AsyncAPI or CloudEvents-style metadata.

## Philosophy of the skill
An event is a public promise once another consumer depends on it. If the payload, ordering, retry, or compatibility rules are implicit, every consumer invents its own interpretation and the event stream becomes shared folklore.

Do not confuse event discovery with event contracts. Discovery asks what happened in the domain. Contract design asks what exactly will be published, consumed, replayed, and evolved.

## Method

1. Name the producer, owner, intended consumers, and event purpose.
2. Separate business event type from transport topic or queue name.
3. Define envelope fields: id, type, source, time, subject, schema version, correlation, causation, tenant, and idempotency key.
4. Define payload schema with required, optional, nullable, and deprecated fields.
5. State ordering, delivery, retry, replay, and dead-letter expectations.
6. Define compatibility rules: additive fields, breaking changes, versioning, deprecation, and consumer migration.
7. Add observability fields needed to reconstruct publishing and consumption failures.
8. Provide at least one positive and one negative contract fixture.

## Evals

This skill ships a comprehension-eval artifact at [`examples/evals/event-contract-design.json`](https://github.com/jacob-balslev/skill-graph/blob/main/examples/evals/event-contract-design.json). The checklist below is the authoring gate for async event contracts; the eval file is the grader surface.

## Verification

- [ ] Producer, owner, and consumers are named
- [ ] Event type, topic/channel, envelope, and payload are distinct
- [ ] Required, optional, nullable, and deprecated fields are explicit
- [ ] Idempotency, ordering, retry, replay, and dead-letter behavior are stated
- [ ] Compatibility rules distinguish additive from breaking changes
- [ ] Correlation and causation IDs cross async boundaries
- [ ] Positive and negative fixtures exist for contract testing

## Do NOT Use When

| Use instead | When |
|---|---|
| `event-storming` | You are still discovering domain events, commands, policies, aggregates, or timelines. |
| `system-interface-contracts` | The boundary is not specifically asynchronous events or messages. |
| `webhook-integration` | You are implementing inbound provider webhooks, signatures, retries, and raw payload handling. |
| `api-design` | You are designing HTTP endpoints, status codes, pagination, filtering, or error envelopes. |
| `observability-modeling` | The event contract is settled and the task is telemetry design. |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `software-architecture`
- Public: `true`
- Domain: `architecture/events`
- Scope: Use when designing or reviewing asynchronous event contracts: producer/consumer ownership, event envelope, schema, topic/channel naming, ordering, idempotency, versioning, compatibility, replay, dead-letter behavior, and AsyncAPI/CloudEvents-style documentation. Do NOT use for domain-event discovery (use `event-storming`), broad interface contracts (use `system-interface-contracts`), inbound provider webhook mechanics (use `webhook-integration`), or HTTP endpoint design (use `api-design`).

**When to use**
- design the event contract for publishing OrderPaid to downstream consumers
- define topic names, payload schema, idempotency, and versioning for this event stream
- review this outbound webhook event schema before customers integrate with it
- write the compatibility rules for consumers of these async messages

**Not for**
- discover the domain events, commands, and policies in this business process
- define every boundary contract between services, jobs, and APIs
- verify inbound provider webhook signatures and retry behavior
- design REST endpoints, status codes, and pagination

**Related skills**
- Verify with: `system-interface-contracts`, `observability-modeling`, `real-time-updates`
- Related: `api-design`, `state-machine-modeling`, `entity-relationship-modeling`, `event-storming`, `system-interface-contracts`, `observability-modeling`, `webhook-integration`

**Keywords**
- `event-contract`, `async-api`, `cloudevents`, `event envelope`, `topic naming`, `async event schema`, `event compatibility`, `replay contract`, `dead-letter behavior`, `consumer fixtures`

<!-- skill-graph-context:end -->
