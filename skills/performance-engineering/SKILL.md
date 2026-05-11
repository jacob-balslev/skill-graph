---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v3.schema.json
schema_version: 3
name: performance-engineering
description: "Use when measuring, diagnosing, budgeting, or improving performance: latency, throughput, Core Web Vitals, database queries, caching, bundle size, concurrency, resource use, and regression prevention. Do NOT use for telemetry schema design alone (use `observability-modeling`), error capture setup (use `error-tracking`), or premature micro-optimization without a measured bottleneck."
version: 1.0.0
type: capability
browse_category: engineering
category: engineering/performance
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
  notes: "Portable performance discipline for frontend, backend, databases, jobs, APIs, and agent tooling."
allowed-tools: Read Grep
keywords:
  - performance engineering
  - performance budget
  - profiling
  - latency
  - throughput
  - Core Web Vitals
  - database performance
  - caching
  - bundle size
  - performance regression
examples:
  - "profile this slow dashboard and decide what to optimize first"
  - "set performance budgets for API latency, page load, and query time"
  - "review this change for likely N+1 queries, cache mistakes, or bundle growth"
  - "design a regression check so this endpoint cannot get slow again unnoticed"
anti_examples:
  - "design logs, spans, metrics, and correlation IDs before implementation"
  - "set up Sentry and error redaction"
  - "make random micro-optimizations without measurements"
  - "write general unit tests for this feature"
relations:
  boundary:
    - skill: observability-modeling
      reason: "observability-modeling designs telemetry signals; performance-engineering uses measurements to improve performance"
    - skill: error-tracking
      reason: "error-tracking captures failures; performance-engineering handles latency, throughput, and resource efficiency"
    - skill: testing-strategy
      reason: "testing-strategy plans correctness tests; performance-engineering plans performance budgets and regressions"
    - skill: refactor
      reason: "refactor restructures code while preserving behavior; performance-engineering changes behavior characteristics under measurement"
  related:
    - observability-modeling
    - api-design
    - data-modeling
    - testing-strategy
  verify_with:
    - observability-modeling
    - code-review
portability:
  readiness: scripted
  targets:
    - agent-skills
lifecycle:
  stale_after_days: 180
  review_cadence: quarterly
---

# Performance Engineering

## Coverage

Measure and improve performance across frontend, backend, database, jobs, APIs, and tooling. Covers bottleneck analysis, performance budgets, Core Web Vitals, query plans, N+1 detection, caching, batching, concurrency, bundle size, resource use, regression checks, and tradeoffs.

## Philosophy

Measure first. Performance work without measurement is guessing, and guessing usually optimizes the easiest code rather than the bottleneck. The correct target is the user-visible or business-critical bottleneck with evidence.

Performance is also a contract. If speed matters, define budgets and regression checks before the system silently decays.

## Method

1. Define the performance goal and user/business impact.
2. Collect baseline measurements under realistic conditions.
3. Identify the bottleneck: network, server, database, rendering, bundle, CPU, memory, lock contention, or third party.
4. Choose the smallest intervention likely to move the bottleneck.
5. Verify improvement with the same measurement method.
6. Add a budget, alert, or regression test for the fixed surface.
7. Record tradeoffs such as freshness, complexity, cost, or cache invalidation risk.

## Evals

This skill ships a comprehension-eval artifact at [`examples/evals/performance-engineering.json`](../../examples/evals/performance-engineering.json). The checklist below is the authoring gate for performance decisions; the eval file is the grader surface.

## Verification

- [ ] Baseline and post-change measurements use the same method
- [ ] The optimized target is the measured bottleneck
- [ ] User-visible or business impact is stated
- [ ] Cache changes include invalidation and staleness rules
- [ ] Database fixes include query-plan or index evidence when relevant
- [ ] Frontend fixes include bundle or Web Vitals evidence when relevant
- [ ] A regression guard exists for important performance surfaces

## Do NOT Use When

| Use instead | When |
|---|---|
| `observability-modeling` | You need to design telemetry schema and diagnostic signals. |
| `error-tracking` | You need error capture, redaction, source maps, or issue triage. |
| `testing-strategy` | You need general correctness test planning. |
| `refactor` | You are restructuring code without a measured performance goal. |
