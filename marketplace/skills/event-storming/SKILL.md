---
name: event-storming
description: "Use when discovering a domain through events, commands, actors, policies, aggregates, read models, external systems, and temporal workflows before implementation. Do NOT use for event schema/topic contracts (use `event-contract-design`), webhook handler implementation (use `webhook-integration`), generic state transition modeling (use `state-machine-modeling`), or persistence schema design (use `data-modeling`). Do NOT use for implement Shopify webhook signature verification and idempotent retries. Do NOT use for draw the state machine for this one status field. Do NOT use for create a normalized data model and indexes. Do NOT use for write event-bus infrastructure code. Do NOT use for define the schema, topic, compatibility, and fixtures for a selected event."
license: MIT
compatibility: "Portable event-storming discipline for product discovery, domain modeling, event-driven architecture, and workflow analysis."
allowed-tools: Read Grep
metadata:
  relations: "{\"boundary\":[\"event-contract-design\",\"state-machine-modeling\"]}"
  schema_version: "8"
  version: "1.0.0"
  subject: software-architecture
  deployment_target: portable
  taxonomy_domain: architecture/domain-discovery
  owner: skill-graph-maintainer
  freshness: "2026-05-11"
  drift_check: "{\"last_verified\":\"2026-05-11\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"event storming\",\"domain events\",\"commands\",\"aggregates\",\"policies\",\"read models\",\"temporal workflow\",\"event-driven discovery\",\"process modeling\"]"
  examples: "[\"map the order lifecycle as domain events before we design tables or APIs\",\"which commands, policies, and external systems are hidden in this workflow?\",\"use event storming to find aggregate boundaries for fulfillment\",\"turn this incident-prone business process into events and decisions\"]"
  anti_examples: "[\"implement Shopify webhook signature verification and idempotent retries\",\"draw the state machine for this one status field\",\"create a normalized data model and indexes\",\"write event-bus infrastructure code\",\"define the schema, topic, compatibility, and fixtures for a selected event\"]"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":365,\"review_cadence\":\"quarterly\"}"
  structural_verdict: PASS
  truth_verdict: PASS
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/software-architecture/event-storming/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# Event Storming

## Coverage

Discover domain behavior through temporal events and decisions. Covers domain events, commands, actors, policies, aggregates, read models, external systems, hotspots, timelines, invariants, and handoff into bounded-context, state-machine, data, and API design.

## Philosophy

Event storming starts from "what happened" because events expose real business flow faster than nouns do. Noun-first modeling often freezes premature assumptions. Event-first modeling reveals time, causality, policy, and exceptions.

Do not confuse domain events with technical notifications. "OrderPlaced" is business meaning. "WebhookReceived" is transport detail.

## Method

1. List domain events in past tense.
2. Place them on a timeline.
3. Add commands that cause events.
4. Add actors and external systems that issue commands or receive outcomes.
5. Add policies: "when event X happens, if condition Y, then command Z."
6. Identify aggregates that enforce invariants.
7. Mark hotspots, missing decisions, temporal ambiguity, and unclear ownership.
8. Hand off to bounded-context, state-machine, data, or API design only after the flow is coherent.

## Verification

- [ ] Events are named in past tense and carry business meaning
- [ ] Commands are imperative and have actors or policies
- [ ] Policies are explicit condition-action rules
- [ ] Aggregates are tied to invariants, not guessed from nouns
- [ ] External systems and transport details are separated from domain events
- [ ] Hotspots and unanswered questions are recorded
- [ ] The timeline can replay a real scenario end to end

## Do NOT Use When

| Use instead | When |
|---|---|
| `webhook-integration` | You are implementing provider webhooks, signatures, retries, and deduplication. |
| `event-contract-design` | You already selected the event and need schema, envelope, topic, compatibility, replay, or fixtures. |
| `state-machine-modeling` | You already know the lifecycle and need formal states, transitions, and guards. |
| `data-modeling` | You need tables, keys, indexes, constraints, or data lifecycle. |
| `api-design` | You need endpoint, request, response, and status-code design. |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `software-architecture`
- Deployment: `portable`
- Domain: `architecture/domain-discovery`

**When to use**
- map the order lifecycle as domain events before we design tables or APIs
- which commands, policies, and external systems are hidden in this workflow?
- use event storming to find aggregate boundaries for fulfillment
- turn this incident-prone business process into events and decisions

**Not for**
- implement Shopify webhook signature verification and idempotent retries
- draw the state machine for this one status field
- create a normalized data model and indexes
- write event-bus infrastructure code
- define the schema, topic, compatibility, and fixtures for a selected event

**Keywords**
- `event storming`, `domain events`, `commands`, `aggregates`, `policies`, `read models`, `temporal workflow`, `event-driven discovery`, `process modeling`

<!-- skill-graph-context:end -->
