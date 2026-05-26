---
name: system-interface-contracts
description: "Use when defining or reviewing contracts between systems, modules, services, agents, jobs, events, APIs, or teams: ownership, inputs, outputs, invariants, compatibility, errors, idempotency, and versioning. Do NOT use for REST resource design alone (use `api-design`), async event contract detail (use `event-contract-design`), database schemas (use `data-modeling`), or post-failure debugging (use `debugging`)."
license: MIT
compatibility: "Portable contract-design discipline across code modules, services, queues, APIs, webhooks, jobs, and agent interfaces."
allowed-tools: Read Grep
metadata:
  schema_version: "8"
  version: "1.0.0"
  type: capability
  operation: know
  category: engineering
  subject: code-engineering
  domain: architecture/contracts
  scope: portable
  owner: skill-graph-maintainer
  freshness: "2026-05-11"
  drift_check: "{\"last_verified\":\"2026-05-11\"}"
  eval_artifacts: present
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"interface contract\",\"system boundary\",\"contract design\",\"compatibility contract\",\"input output invariant\",\"event schema\",\"module boundary\",\"idempotency contract\",\"versioning contract\",\"error contract\"]"
  examples: "[\"define the contract between the ingestion job and the dashboard view layer\",\"what invariants must this event producer and consumer share?\",\"review this module boundary for missing ownership and compatibility rules\",\"we need an interface contract before several agents implement opposite sides of the boundary\"]"
  anti_examples: "[\"design the REST endpoints, status codes, and pagination\",\"create database tables and constraints\",\"investigate why this existing integration is failing in production\",\"write an ADR after the interface decision has already been accepted\"]"
  relations: "{\"boundary\":[{\"skill\":\"api-design\",\"reason\":\"api-design owns REST/API surface shape; system-interface-contracts owns the broader boundary contract across any interface type\"},{\"skill\":\"event-contract-design\",\"reason\":\"event-contract-design owns asynchronous event envelopes, schemas, topics, and compatibility; system-interface-contracts owns the broader boundary discipline\"},{\"skill\":\"data-modeling\",\"reason\":\"data-modeling owns stored data structure; system-interface-contracts owns producer/consumer expectations and compatibility\"},{\"skill\":\"debugging\",\"reason\":\"debugging investigates a known failure; system-interface-contracts prevents ambiguous boundary behavior before failure\"},{\"skill\":\"architecture-decision-records\",\"reason\":\"architecture-decision-records records the adopted contract decision; this skill designs the contract\"}],\"related\":[\"bounded-context-mapping\",\"api-design\",\"event-storming\",\"event-contract-design\",\"state-machine-modeling\"],\"verify_with\":[\"testing-strategy\",\"code-review\"]}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":365,\"review_cadence\":\"quarterly\"}"
  structural_verdict: UNVERIFIED
  truth_verdict: UNVERIFIED
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v7
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/code-engineering/system-interface-contracts/SKILL.md
---

# System Interface Contracts

## Coverage

Design and audit contracts across boundaries: modules, services, event producers/consumers, background jobs, APIs, webhooks, databases, and agents. Covers ownership, data shape, required/optional fields, invariants, preconditions, postconditions, idempotency, ordering, error behavior, retries, compatibility, versioning, and verification.

## Philosophy

A boundary without a contract is a rumor. The implementation may work today because both sides accidentally agree, but the first independent change exposes the missing contract.

Contracts should be specific enough to protect both sides from drift and small enough that teams can keep them true. The contract is not the implementation. It is the stable promise at the boundary.

## Method

1. Name the producer, consumer, owner, and direction of dependency.
2. Define inputs, outputs, and allowed states.
3. State invariants and forbidden states.
4. Define error, retry, timeout, and idempotency behavior.
5. Specify compatibility: additive changes, breaking changes, versioning, and deprecation.
6. Identify observability required to prove the contract is being honored.
7. Add contract tests or fixtures where possible.

## Evals

This skill ships a comprehension-eval artifact at [`examples/evals/system-interface-contracts.json`](https://github.com/jacob-balslev/skill-graph/blob/main/examples/evals/system-interface-contracts.json). The checklist below is the authoring gate for system-boundary contracts; the eval file is the grader surface.

## Verification

- [ ] Each side has a named owner
- [ ] Required and optional fields are explicit
- [ ] Invariants and forbidden states are stated
- [ ] Error and retry behavior is deterministic
- [ ] Idempotency keys or deduplication rules exist where duplicate delivery is possible
- [ ] Compatibility rules distinguish additive from breaking changes
- [ ] Contract tests, fixtures, or examples exist for positive and negative cases

## Do NOT Use When

| Use instead | When |
|---|---|
| `api-design` | You specifically need REST/resource endpoint shape, HTTP semantics, or API envelope design. |
| `event-contract-design` | You specifically need asynchronous event envelope, schema, topic, replay, or consumer compatibility rules. |
| `data-modeling` | You need persistence schema, keys, indexes, or data lifecycle. |
| `debugging` | A boundary has already failed and the task is root-cause analysis. |
| `architecture-decision-records` | The contract is chosen and needs a durable decision record. |
