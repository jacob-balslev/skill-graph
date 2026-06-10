---
name: performance-engineering
description: "Use when measuring, diagnosing, budgeting, or improving performance: latency, throughput, Core Web Vitals, database queries, caching, bundle size, concurrency, resource use, and regression prevention. Do NOT use for telemetry schema design alone (use `observability-modeling`), error capture setup (use `error-tracking`), or premature micro-optimization without a measured bottleneck. Do NOT use for design logs, spans, metrics, and correlation IDs before implementation. Do NOT use for set up Sentry and error redaction. Do NOT use for make random micro-optimizations without measurements. Do NOT use for write general unit tests for this feature."
license: MIT
compatibility: "Portable performance discipline for frontend, backend, databases, jobs, APIs, and agent tooling."
allowed-tools: Read Grep
metadata:
  relations: "{\"related\":[\"api-design\",\"data-modeling\",\"refactor\",\"observability-modeling\",\"testing-strategy\"],\"suppresses\":[\"testing-strategy\",\"error-tracking\"],\"verify_with\":[\"code-review\",\"observability-modeling\",\"connection-pooling\"]}"
  subject: quality-assurance
  scope: "Measuring, diagnosing, budgeting, and improving performance — latency, throughput, Core Web Vitals, database queries, caching, bundle size, concurrency, resource use, and regression prevention. Portable across any system with performance goals; principle-grounded, not repo-bound. Excludes telemetry schema design alone (observability-modeling), error-capture setup (error-tracking), and premature micro-optimization without a measured bottleneck."
  public: "true"
  taxonomy_domain: quality/performance
  stability: experimental
  keywords: "[\"performance engineering\",\"performance budget\",\"profiling\",\"latency\",\"throughput\",\"Core Web Vitals\",\"database performance\",\"caching\",\"bundle size\",\"performance regression\"]"
  examples: "[\"profile this slow dashboard and decide what to optimize first\",\"set performance budgets for API latency, page load, and query time\",\"review this change for likely N+1 queries, cache mistakes, or bundle growth\",\"design a regression check so this endpoint cannot get slow again unnoticed\"]"
  anti_examples: "[\"design logs, spans, metrics, and correlation IDs before implementation\",\"set up Sentry and error redaction\",\"make random micro-optimizations without measurements\",\"write general unit tests for this feature\"]"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/quality-assurance/performance-engineering/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# Performance Engineering

## Concept of the skill

Measuring, diagnosing, budgeting, and improving performance — latency, throughput, Core Web Vitals, database queries, caching, bundle size, concurrency, resource use, and regression prevention.

## Coverage

Measure and improve performance across frontend, backend, database, jobs, APIs, and tooling. Covers bottleneck analysis, performance budgets, Core Web Vitals, query plans, N+1 detection, caching, batching, concurrency, bundle size, resource use, regression checks, and tradeoffs.

## Philosophy of the skill
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

This skill ships a comprehension-eval artifact at [`examples/evals/performance-engineering.json`](https://github.com/jacob-balslev/skill-graph/blob/main/examples/evals/performance-engineering.json). The checklist below is the authoring gate for performance decisions; the eval file is the grader surface.

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

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `quality-assurance`
- Public: `true`
- Domain: `quality/performance`
- Scope: Measuring, diagnosing, budgeting, and improving performance — latency, throughput, Core Web Vitals, database queries, caching, bundle size, concurrency, resource use, and regression prevention. Portable across any system with performance goals; principle-grounded, not repo-bound. Excludes telemetry schema design alone (observability-modeling), error-capture setup (error-tracking), and premature micro-optimization without a measured bottleneck.

**When to use**
- profile this slow dashboard and decide what to optimize first
- set performance budgets for API latency, page load, and query time
- review this change for likely N+1 queries, cache mistakes, or bundle growth
- design a regression check so this endpoint cannot get slow again unnoticed

**Not for**
- design logs, spans, metrics, and correlation IDs before implementation
- set up Sentry and error redaction
- make random micro-optimizations without measurements
- write general unit tests for this feature

**Related skills**
- Verify with: `code-review`, `observability-modeling`, `connection-pooling`
- Related: `api-design`, `data-modeling`, `refactor`, `observability-modeling`, `testing-strategy`

**Keywords**
- `performance engineering`, `performance budget`, `profiling`, `latency`, `throughput`, `Core Web Vitals`, `database performance`, `caching`, `bundle size`, `performance regression`

<!-- skill-graph-context:end -->
