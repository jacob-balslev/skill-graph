---
name: observability-modeling
description: "Use when designing telemetry semantics before or during implementation: logs, metrics, traces, events, spans, attributes, correlation IDs, SLOs, alert signals, and diagnostic questions. Do NOT use for domain/business event contracts (use `event-contract-design`), configuring an error tracker alone (use `error-tracking`), performance optimization (use `performance-engineering`), or debugging a current incident (use `debugging`). Do NOT use for set up Sentry error tracking for this app. Do NOT use for profile and optimize a slow endpoint. Do NOT use for debug the current production incident. Do NOT use for write application tests for this feature."
license: MIT
compatibility: "Portable observability modeling discipline for applications, integrations, jobs, queues, APIs, and agent workflows."
allowed-tools: Read Grep
metadata:
  relations: "{\"related\":[\"system-interface-contracts\",\"testing-strategy\",\"error-tracking\",\"performance-engineering\",\"event-contract-design\",\"debugging\",\"semantics\"],\"verify_with\":[\"error-tracking\",\"debugging\",\"performance-budgets\"]}"
  subject: data-engineering
  subjects: "[\"data-engineering\",\"quality-assurance\"]"
  scope: "Designing telemetry semantics before or during implementation — logs, metrics, traces, events, spans, attributes, correlation IDs, SLOs, alert signals, and the diagnostic questions telemetry must answer. Portable across any instrumented system; principle-grounded, not repo-bound. Excludes domain/business event contracts (event-contract-design), configuring an error tracker alone (error-tracking), performance optimization (performance-engineering), and debugging a current incident (debugging)."
  public: "true"
  taxonomy_domain: engineering/observability
  stability: experimental
  keywords: "[\"observability modeling\",\"telemetry design\",\"logs metrics traces\",\"SLO\",\"spans\",\"correlation id\",\"diagnostic events\",\"alert design\",\"instrumentation model\"]"
  examples: "[\"design telemetry for this ingestion pipeline so failures can be diagnosed later\",\"which logs, metrics, spans, and correlation IDs should this interface contract require?\",\"model observability for a background job before adding alerts\",\"turn these diagnostic questions into events and metrics\"]"
  anti_examples: "[\"set up Sentry error tracking for this app\",\"profile and optimize a slow endpoint\",\"debug the current production incident\",\"write application tests for this feature\"]"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/data-engineering/observability-modeling/SKILL.md
  skill_graph_export_description_projection: anti_examples
---
# Observability Modeling

## Concept of the skill

Designing telemetry semantics before or during implementation — logs, metrics, traces, events, spans, attributes, correlation IDs, SLOs, alert signals, and the diagnostic questions telemetry must answer.

## Coverage

Design telemetry semantics that make systems diagnosable. Covers diagnostic questions, logs, metrics, traces, spans, events, attributes, correlation IDs, SLOs, alert signals, cardinality, privacy, sampling, and contract-level observability requirements.

## Philosophy of the skill
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

This skill ships a comprehension-eval artifact at [`examples/evals/observability-modeling.json`](https://github.com/jacob-balslev/skill-graph/blob/main/examples/evals/observability-modeling.json). The checklist below is the authoring gate for telemetry-semantics decisions; the eval file is the grader surface.

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

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `data-engineering` (also: `quality-assurance`)
- Public: `true`
- Domain: `engineering/observability`
- Scope: Designing telemetry semantics before or during implementation — logs, metrics, traces, events, spans, attributes, correlation IDs, SLOs, alert signals, and the diagnostic questions telemetry must answer. Portable across any instrumented system; principle-grounded, not repo-bound. Excludes domain/business event contracts (event-contract-design), configuring an error tracker alone (error-tracking), performance optimization (performance-engineering), and debugging a current incident (debugging).

**When to use**
- design telemetry for this ingestion pipeline so failures can be diagnosed later
- which logs, metrics, spans, and correlation IDs should this interface contract require?
- model observability for a background job before adding alerts
- turn these diagnostic questions into events and metrics

**Not for**
- set up Sentry error tracking for this app
- profile and optimize a slow endpoint
- debug the current production incident
- write application tests for this feature

**Related skills**
- Verify with: `error-tracking`, `debugging`, `performance-budgets`
- Related: `system-interface-contracts`, `testing-strategy`, `error-tracking`, `performance-engineering`, `event-contract-design`, `debugging`, `semantics`

**Keywords**
- `observability modeling`, `telemetry design`, `logs metrics traces`, `SLO`, `spans`, `correlation id`, `diagnostic events`, `alert design`, `instrumentation model`

<!-- skill-graph-context:end -->
