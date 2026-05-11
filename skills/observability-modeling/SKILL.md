---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v3.schema.json
schema_version: 3
name: observability-modeling
description: "Use when designing telemetry semantics before or during implementation: logs, metrics, traces, events, spans, attributes, correlation IDs, SLOs, alert signals, and diagnostic questions. Do NOT use for domain/business event contracts (use `event-contract-design`), configuring an error tracker alone (use `error-tracking`), performance optimization (use `performance-engineering`), or debugging a current incident (use `debugging`)."
version: 1.0.0
type: capability
browse_category: engineering
category: engineering/observability
scope: portable
owner: skill-graph-maintainer
freshness: "2026-05-11"
drift_check:
  last_verified: "2026-05-11"
eval_artifacts: present
eval_state: unverified
routing_eval: absent
stability: experimental
license: MIT
compatibility:
  notes: "Portable observability modeling discipline for applications, integrations, jobs, queues, APIs, and agent workflows."
allowed-tools: Read Grep
keywords:
  - observability modeling
  - telemetry design
  - logs metrics traces
  - SLO
  - spans
  - correlation id
  - diagnostic events
  - alert design
  - instrumentation model
examples:
  - "design telemetry for this ingestion pipeline so failures can be diagnosed later"
  - "which logs, metrics, spans, and correlation IDs should this interface contract require?"
  - "model observability for a background job before adding alerts"
  - "turn these diagnostic questions into events and metrics"
anti_examples:
  - "set up Sentry error tracking for this app"
  - "profile and optimize a slow endpoint"
  - "debug the current production incident"
  - "write application tests for this feature"
relations:
  boundary:
    - skill: error-tracking
      reason: "error-tracking owns error-capture setup and handling; observability-modeling owns the broader telemetry schema"
    - skill: event-contract-design
      reason: "event-contract-design owns published business event contracts; observability-modeling owns telemetry events, spans, metrics, and logs for diagnosability"
    - skill: performance-engineering
      reason: "performance-engineering improves measured performance; observability-modeling defines the signals needed to measure and diagnose"
    - skill: debugging
      reason: "debugging investigates a current failure; observability-modeling designs future diagnosability"
    - skill: testing-strategy
      reason: "testing-strategy proves behavior in tests; observability-modeling proves runtime diagnosability"
  related:
    - error-tracking
    - performance-engineering
    - system-interface-contracts
    - event-contract-design
    - debugging
  verify_with:
    - error-tracking
    - debugging
portability:
  readiness: scripted
  targets:
    - agent-skills
lifecycle:
  stale_after_days: 365
  review_cadence: quarterly
---

# Observability Modeling

## Coverage

Design telemetry semantics that make systems diagnosable. Covers diagnostic questions, logs, metrics, traces, spans, events, attributes, correlation IDs, SLOs, alert signals, cardinality, privacy, sampling, and contract-level observability requirements.

## Philosophy

Observability starts with questions, not tools. "Can we answer why this order failed to sync?" is a better design input than "add logs." Tool setup without a telemetry model produces noisy data and weak diagnosis.

Instrument boundaries, state changes, and decisions. Avoid high-cardinality or sensitive fields unless the operational value justifies the risk.

## Method

1. List diagnostic questions the system must answer.
2. Map each question to required signals: log, metric, trace, event, or derived view.
3. Define correlation identifiers across boundaries.
4. Name span/event attributes with stable semantics and cardinality limits.
5. Add SLOs and alert signals only for user or business impact.
6. Define privacy redaction and sampling rules.
7. Verify that failures can be reconstructed from emitted signals.

## Evals

This skill ships a comprehension-eval artifact at [`examples/evals/observability-modeling.json`](../../examples/evals/observability-modeling.json). The checklist below is the authoring gate for telemetry-semantics decisions; the eval file is the grader surface.

## Verification

- [ ] Telemetry answers named diagnostic questions
- [ ] Correlation IDs cross async and external boundaries
- [ ] Event and metric names use stable domain language
- [ ] High-cardinality attributes are avoided or justified
- [ ] Sensitive data is redacted before emission
- [ ] Alerts map to actionable symptoms, not raw noise
- [ ] A realistic failure can be reconstructed from the proposed signals

## Do NOT Use When

| Use instead | When |
|---|---|
| `error-tracking` | You need error tracker setup, redaction, source maps, or issue triage. |
| `event-contract-design` | You need a business/domain event envelope, schema, topic, replay, or consumer compatibility contract. |
| `performance-engineering` | You need to profile and optimize latency, throughput, or resource use. |
| `debugging` | There is already a failing incident or reproducible bug. |
| `testing-strategy` | You need pre-runtime test coverage design. |
