---
name: state-machine-modeling
description: "Use when modeling lifecycle states, transitions, guards, events, side effects, invalid states, retries, and state invariants for workflows or domain objects. Do NOT use for broad event discovery (use `event-storming`), database schema design (use `data-modeling`), or observability instrumentation after the lifecycle already exists (use `observability-modeling`). Do NOT use for discover the domain events and policies for the whole business process. Do NOT use for create database tables and constraints for this lifecycle. Do NOT use for instrument metrics and traces for an existing workflow. Do NOT use for debug why this job got stuck yesterday."
license: MIT
compatibility: "Portable state-machine discipline for product workflows, domain lifecycles, retries, background jobs, and UI flow control."
allowed-tools: Read Grep
metadata:
  schema_version: "8"
  version: "1.0.0"
  type: capability
  operation: do
  category: engineering
  subject: code-engineering
  domain: modeling/state-machines
  scope: portable
  owner: skill-graph-maintainer
  freshness: "2026-05-11"
  drift_check: "{\"last_verified\":\"2026-05-11\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"state machine\",\"state modeling\",\"lifecycle states\",\"transitions\",\"guards\",\"finite state machine\",\"invalid states\",\"status field\",\"workflow invariants\"]"
  examples: "[\"model the order fulfillment status lifecycle so invalid transitions are impossible\",\"this status field keeps growing flags - should it become a state machine?\",\"define guards and side effects for onboarding steps\",\"find impossible states in this workflow before we implement it\"]"
  anti_examples: "[\"discover the domain events and policies for the whole business process\",\"create database tables and constraints for this lifecycle\",\"instrument metrics and traces for an existing workflow\",\"debug why this job got stuck yesterday\"]"
  relations: "{\"boundary\":[{\"skill\":\"event-storming\",\"reason\":\"event-storming discovers domain behavior broadly; state-machine-modeling formalizes a specific lifecycle\"},{\"skill\":\"data-modeling\",\"reason\":\"data-modeling persists state; state-machine-modeling defines legal state behavior\"},{\"skill\":\"observability-modeling\",\"reason\":\"observability-modeling instruments a lifecycle; state-machine-modeling defines the lifecycle itself\"},{\"skill\":\"debugging\",\"reason\":\"debugging investigates an observed stuck state; state-machine-modeling prevents invalid states by design\"}],\"related\":[\"event-storming\",\"system-interface-contracts\",\"testing-strategy\",\"api-design\"],\"verify_with\":[\"testing-strategy\",\"system-interface-contracts\"]}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":365,\"review_cadence\":\"quarterly\"}"
  structural_verdict: UNVERIFIED
  truth_verdict: UNVERIFIED
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/code-engineering/state-machine-modeling/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# State Machine Modeling

## Coverage

Define legal lifecycle behavior for a domain object, UI flow, job, integration, or process. Covers states, transitions, events, guards, side effects, terminal states, retries, timeouts, compensation, invalid states, and transition verification.

## Philosophy

State modeling prevents boolean sprawl. When a workflow has several flags that can combine into impossible conditions, the model is already a state machine - just an implicit and unsafe one.

Make illegal states unrepresentable where possible. Where that is not possible, make illegal transitions impossible and detectable.

## Method

1. Name the entity whose state is being modeled.
2. List observable states as nouns or adjectives, not events.
3. List events or commands that trigger transitions.
4. Add guards: conditions required before a transition is legal.
5. Add side effects separately from state changes.
6. Mark terminal, retryable, and compensating states.
7. Define invalid transitions and expected error behavior.
8. Create transition-table tests before implementation.

## Verification

- [ ] States are mutually exclusive unless explicitly modeled as parallel regions
- [ ] Every transition has a trigger
- [ ] Guards are explicit where transitions depend on conditions
- [ ] Side effects are not confused with state changes
- [ ] Terminal and retry states are named
- [ ] Invalid transitions have deterministic behavior
- [ ] Tests cover allowed and forbidden transitions

## Do NOT Use When

| Use instead | When |
|---|---|
| `event-storming` | You need to discover the broader domain flow, commands, policies, and aggregates. |
| `data-modeling` | You need persistence schema or query shape for state data. |
| `observability-modeling` | The lifecycle is settled and you need metrics, logs, traces, or alerts. |
| `debugging` | A stateful system has already failed and needs root-cause analysis. |

