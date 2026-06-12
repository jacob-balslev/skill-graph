---
name: performance-testing
description: "Use when measuring a system's non-functional properties — latency, throughput, error rate, resource utilization, saturation — by running it under controlled load and verifying against explicit SLO thresholds. Covers the five primitives (load profile, workload, latency metric, throughput metric, SLO target), load-shape taxonomy (smoke, load, stress, spike, soak, breakpoint), latency-percentile vocabulary (p50, p95, p99, p99.9), why average latency and coordinated omission mislead, tool selection (k6, JMeter, Locust, Gatling, Vegeta), and offline controlled measurement versus production observability. Do NOT use for optimization itself (use `performance-engineering`), threshold contracts (use `performance-budgets`), production runtime measurement (use `observability-modeling` or `error-tracking`), single-function microbenchmarks, fault injection, or test-suite quality measurement (use `mutation-testing`). Do NOT use for decide which modules need more unit tests and what test coverage target to enforce."
license: MIT
allowed-tools: Read Grep
metadata:
  relations: "{\"related\":[\"error-tracking\",\"testing-strategy\",\"integration-test-design\",\"e2e-test-design\",\"performance-engineering\",\"performance-budgets\",\"observability-modeling\",\"mutation-testing\",\"test-coverage-strategy\"],\"suppresses\":[\"performance-engineering\",\"performance-budgets\",\"testing-strategy\",\"integration-test-design\",\"mutation-testing\",\"e2e-test-design\",\"test-coverage-strategy\"],\"verify_with\":[\"observability-modeling\",\"testing-strategy\",\"integration-test-design\",\"performance-budgets\"]}"
  subject: quality-assurance
  scope: "Designing and interpreting controlled-load tests for non-functional system properties: latency distributions, throughput, error rate, resource use, saturation, load profile, workload mix, percentiles, SLO thresholds, and load shapes such as smoke, load, stress, spike, soak, and breakpoint. Portable across web, API, service, and distributed-system test surfaces. Excludes optimization/profiling itself (performance-engineering), declaring budget contracts (performance-budgets), production observability/error monitoring, single-function microbenchmarks, fault injection, and test-suite quality measurement."
  public: "true"
  taxonomy_domain: quality/testing
  stability: experimental
  keywords: "[\"performance testing\",\"load testing\",\"stress testing\",\"soak testing\",\"spike testing\",\"breakpoint test\",\"latency percentile\",\"SLO threshold\",\"k6 thresholds\",\"coordinated omission\"]"
  triggers: "[\"performance test\",\"load test\",\"stress test or load test\",\"p95 vs average latency\",\"k6 threshold\",\"is the system fast enough under load\"]"
  examples: "[\"design a performance test for an API endpoint that verifies the p95 SLO at expected production traffic\",\"decide whether a new service needs load, stress, spike, soak, or breakpoint tests before launch\",\"diagnose a soak test failure where p99 latency and memory growth only degrade after 4 hours\",\"explain why average latency and coordinated omission are the wrong acceptance basis for user experience\"]"
  anti_examples: "[\"decide which modules need more unit tests and what test coverage target to enforce\",\"declare the p95 latency budget, threshold, and build-fail consequence for checkout\",\"choose the test strategy ratio between unit, integration, e2e, and performance suites\",\"measure whether mutation score shows the tests catch code defects\"]"
  grounding: "{\"subject_matter\":\"Portable controlled-load performance testing for APIs, services, and user journeys\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://grafana.com/docs/k6/latest/using-k6/thresholds/\",\"https://grafana.com/docs/k6/latest/testing-guides/automated-performance-testing/\",\"https://grafana.com/docs/k6/latest/\",\"https://jmeter.apache.org/usermanual/\",\"https://docs.locust.io/\",\"https://docs.gatling.io/\",\"https://www.infoq.com/presentations/latency-pitfalls/\",\"../skills/skills/quality-assurance/performance-testing/references/performance-testing-2026-06-07.md\"],\"failure_modes\":[\"performance_test_without_slo_verdict\",\"acceptance_criteria_use_average_latency\",\"coordinated_omission_hidden_by_load_generator\",\"load_shape_mismatch_to_failure_mode\",\"non_production_like_environment_over_certified\",\"workload_mix_unlike_real_traffic\",\"tool_generator_becomes_bottleneck\"],\"evidence_priority\":\"equal\"}"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "Performance testing is to a software system what a load-bearing inspection is to a bridge — you do not certify a bridge by walking across it (functional test) and concluding it works; you drive trucks of known weight across at increasing volumes, with strain gauges on every beam, and verify the deflection stays within spec under expected traffic, that the failure mode is graceful when overloaded (cracks before collapse), that nothing creeps over a long soak. A bridge whose 'average' load it can carry is 50 tonnes but whose p99 stressor reveals harmonic resonance at 80 tonnes is the bridge that fails on a windy day."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/quality-assurance/performance-testing/SKILL.md
  skill_graph_export_description_projection: anti_examples
  skill_graph_export_description_projection_truncated: "true"
---
# Performance Testing

## Concept of the skill

Performance testing is the discipline of measuring a system's *non-functional properties* — latency, throughput, error rate, resource utilization, saturation — by running the system under *controlled load* and observing the resulting metrics. Where functional tests answer "does the system produce the right output?", performance tests answer "does the system produce the right output *quickly enough* and at *sufficient scale*, while staying within resource budgets and error tolerances?" The unit of judgment is whether measured metrics meet defined acceptance thresholds — typically *Service-Level Objectives* (SLOs) expressed as *percentiles* (e.g., "p95 latency below 200ms at 1,000 RPS sustained for 30 minutes").

Replaces "is it fast enough?" answered by intuition or user complaints with empirical answers measured against an explicit SLO. Solves the problem that performance is *multi-dimensional* — latency distribution, throughput ceiling, error rate under load, resource utilization, saturation point are each separate properties; each requires its own measurement; each can be acceptable while others fail. Reducing performance to a single number (especially average latency) is the most common discipline failure. Sub-purpose: verify that declared performance budgets (per `performance-budgets`) hold under realistic load — without performance tests, a budget is an aspirational threshold without empirical evidence; without budgets, a performance test produces measurements without a verdict. A complete pre-launch performance test suite runs all six load shapes because each verifies a different property; an ongoing suite typically runs smoke on every PR, load on every merge, with stress/spike/soak/breakpoint on cadence.

Distinct from performance-engineering, which owns the activity of *profiling and optimizing* a specific slow path once it has been identified — this skill owns the discipline of *exercising the system under controlled load* to discover and quantify performance behavior; the two compose (this skill produces measurements that locate bottlenecks and verifies optimizations afterward). Distinct from performance-budgets, which owns the *declaration* of the threshold-and-consequence contract (metric, threshold, percentile, consequence) as a quality property — this skill owns the *test mechanism* that exercises the system under load and verifies the budgets hold. Distinct from observability, which owns *real-time runtime measurement* of the deployed system — this skill is *offline controlled measurement*; the two compose (one for pre-deploy verification, the other for production runtime validation). Distinct from chaos-engineering (fault injection in deployed systems), microbenchmarks (single-function isolation via language benchmark tools), testing-strategy (level/scope), integration-test-design and e2e-test-design (correctness across seams or user journeys — this skill exercises those same paths under load), and mutation-testing (test-suite quality measurement). Performance testing is to a software system what a load-bearing inspection is to a bridge — you do not certify a bridge by walking across it (functional test) and concluding it works; you drive trucks of known weight across at increasing volumes, with strain gauges on every beam, and verify the deflection stays within spec under expected traffic, that the failure mode is graceful when overloaded (cracks before collapse), that nothing creeps over a long soak. A bridge whose 'average' load it can carry is 50 tonnes but whose p99 stressor reveals harmonic resonance at 80 tonnes is the bridge that fails on a windy day. The wrong mental model is that *average latency* is a meaningful performance metric. It is not. A system whose mean is 50ms and p99 is 5 seconds has a user-experience problem the mean hides — 1 in 100 users sees a 5-second response time. Acceptance criteria should always be *percentiles* (or distributions); averages are easily skewed by outliers in both directions. Adjacent misconceptions: that performance tests in a stripped/non-production environment are meaningful (they are not — the test produces a measurement of *that environment*, not the system; production hardware, network, data volumes, dependency versions, and configuration are the load-bearing investment); that one-time pre-launch testing is enough (it is not — regressions accumulate; the ongoing value is continuous testing in CI); that load tests alone characterize the system (they do not — a complete pre-launch suite runs all six shapes, because each verifies a different property: load verifies SLO at design load, stress verifies graceful failure, spike verifies elasticity, soak verifies no leaks or memory growth, breakpoint quantifies the capacity ceiling); that performance testing replaces observability (it does not — performance testing is offline controlled measurement; observability is online real-traffic measurement; the two compose); that *coordinated omission* in the load tool doesn't matter (it does — Tene's canonical talk shows naive percentile reporting silently drops slow responses; honest tools account for it); and that a performance test without an SLO is a verification (it is not — without an SLO it is a measurement without a verdict; the SLO is what makes the test a verification rather than an information report).

## Coverage

The discipline of measuring non-functional system properties — latency, throughput, error rate, resource utilization, saturation — by running the system under controlled load and verifying against explicit SLO thresholds. Covers the five primitives (load profile, workload, latency metric, throughput metric, SLO target), the six load-shape types (smoke, load, stress, spike, soak, breakpoint) that each test a different property, the latency-percentile discipline (p50/p95/p99/p99.9) that replaces the misleading average, the environment-fidelity requirement that makes results meaningful, the modern tool landscape (k6, JMeter, Locust, Gatling, Vegeta, Wrk), and the distinction from observability (offline controlled vs online real-traffic) and benchmarking (system vs single-function).

## Philosophy of the skill
Performance testing is the discipline of adding the *time and scale* dimensions to verification. Functional tests verify "the system produces the right output"; performance tests verify "the system produces the right output quickly enough and at sufficient scale, within resource budgets and error tolerances." Without performance testing, "is it fast enough" is answered by intuition or by users complaining; with performance testing, it is answered by measurement against an explicit SLO.

The central insight is that performance is multi-dimensional. Latency distribution, throughput ceiling, error rate under load, resource utilization, saturation point — each is a separate property; each requires its own measurement; each can be acceptable while others fail. Reducing performance to a single number (especially average latency) is the most common discipline failure.

The complementary insight is environment fidelity. A performance test in a non-production-like environment produces a measurement of that environment, not the system. Production hardware, network, data volumes, dependency versions, and configuration are the load-bearing investment for performance testing; the load tool itself is increasingly cheap.

## The Six Load Shapes

| Shape | Profile | Verifies | When to run |
|---|---|---|---|
| Smoke | Small load, short duration | Test harness works, system functions under any load | Every PR (fast) |
| Load | Expected production load × margin, sustained | System meets SLO at design load | Every merge / nightly |
| Stress | Load beyond expected capacity | Failure mode is graceful | Pre-launch / quarterly |
| Spike | Sudden large increase | Elasticity, autoscaling, recovery | Pre-launch / before known traffic events |
| Soak | Sustained moderate load for hours | No leaks, no degradation | Pre-launch / monthly |
| Breakpoint | Gradually increasing load to failure | Quantitative capacity ceiling | Pre-launch / before capacity planning |

A complete pre-launch performance test suite runs all six. An ongoing test suite usually runs smoke on every PR and load on every merge, with stress / spike / soak / breakpoint on cadence.

## Latency Percentiles — The Honest Vocabulary

| Metric | What it tells you | Use for |
|---|---|---|
| Mean (average) | Arithmetic average — easily skewed by outliers | Almost nothing; avoid as acceptance criterion |
| p50 (median) | The typical request | Sanity check; basic system health |
| p95 | The slow 5% — what 1 in 20 users feels | Common SLO target |
| p99 | The slow 1% — what 1 in 100 users feels | Common SLO target for user-facing systems |
| p99.9 | The very slow 0.1% — rare but real | SLO target for high-stakes systems |
| Max | The single worst request | Diagnosis; avoid as SLO (one bad data point dominates) |

Acceptance criteria should always be percentiles (or distributions), never averages. A system whose mean is 50ms and p99 is 5 seconds has a user-experience problem the mean hides.

## SLO-Driven Performance Tests

A performance test without an SLO is "we measured X" without a verdict. An SLO-driven performance test is:

```
SLO statement:
  - p95 latency < 200ms
  - p99 latency < 500ms
  - error rate < 0.1%
  - sustained throughput >= 1000 RPS

Test design:
  - Load shape: constant 1000 RPS for 30 minutes
  - Workload: 70% reads, 25% writes, 5% complex queries
  - Environment: production-equivalent staging
  - Pass: all four SLO conditions met for full test duration
  - Fail: any SLO condition violated for > 60 seconds cumulative
```

The SLO is what makes the test a verification rather than a measurement.

## Tool Selection

| Tool | Strengths | Best for |
|---|---|---|
| k6 (Grafana Labs) | Modern JS scripting; cloud-and-local; HTTP/gRPC/WebSocket | New projects; production default |
| Apache JMeter | Broad protocol support; UI-driven; very mature | Enterprise / complex protocol mix |
| Locust | Python scripting; distributed; behavioral modeling | Python ecosystem teams |
| Gatling | Scala / Java; high throughput per generator | High-load single-generator scenarios |
| Vegeta | Go; simple HTTP; CLI-driven | Simple HTTP load with CI integration |
| Wrk / Wrk2 | C; very fast; minimal | Microbenchmarks and pure HTTP |

## Verification

After applying this skill, verify:
- [ ] Performance tests have explicit SLOs as acceptance criteria. "We measured X" without a target is not a verification.
- [ ] Acceptance criteria are stated as percentiles (p50/p95/p99/p99.9), never as averages. Tests that report only averages are misleading.
- [ ] The test environment is production-equivalent in hardware, network, data volumes, dependency versions, and configuration. Stripped environments produce informational results, not verifications.
- [ ] A range of load shapes is tested: smoke (PR-level), load (merge-level), stress / spike / soak / breakpoint (pre-launch and on cadence).
- [ ] Workload composition is derived from production traffic patterns where possible. Synthetic load with the right RPS but wrong operation mix tests the wrong code paths.
- [ ] The load tool is not the bottleneck. Distributed load generation is used where single-generator capacity might be exceeded.
- [ ] Performance tests run continuously (not just pre-launch). Regression detection is the on-going value; one-time tests are point-in-time signals only.
- [ ] Soak tests run for hours and exercise the leak and degradation failure modes that shorter tests miss.
- [ ] Performance testing is paired with observability for production validation. The two compose; neither replaces the other.
- [ ] Stress and breakpoint tests are run to characterize failure mode and capacity ceiling. A system whose failure mode is unknown cannot be operated.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Profiling and optimizing a specific slow path once located | `performance-engineering` | performance-engineering is the optimization activity itself; this skill is the load-driven measurement that locates and quantifies what to optimize |
| Declaring the threshold-and-consequence contract (metric, threshold, percentile, consequence) | `performance-budgets` | performance-budgets owns the contract; this skill verifies the contract holds under load |
| Measuring real production traffic in real time | `observability-modeling` or `error-tracking` | observability owns runtime measurement; this skill owns offline controlled measurement |
| Benchmarking a single function or implementation | language-level benchmark tools | benchmarks isolate; this skill measures the assembled system |
| Injecting failures into a running system | dedicated fault-injection / resilience-testing guidance | fault injection is not load measurement; this skill is controlled performance measurement |
| Testing the test suite's quality | `mutation-testing` | mutation measures test-suite effectiveness; this skill measures system performance |
| Choosing the test-level ratio | `testing-strategy` | strategy owns ratios; this skill is one technique within them |
| Testing internal seams between modules | `integration-test-design` | integration owns correctness across seams; this skill owns load behavior |
| Testing user journeys end-to-end | `e2e-test-design` | e2e owns user-perceived behavior; "performance e2e" composes both |

## Key Sources

- Grafana Labs / k6 Team. ["k6 Documentation"](https://grafana.com/docs/k6/latest/). Canonical reference for the modern JavaScript-scriptable load testing tool; covers thresholds, metrics, scenarios, and common load shapes.
- Grafana Labs / k6 Team. ["Thresholds"](https://grafana.com/docs/k6/latest/using-k6/thresholds/). Current reference for pass/fail criteria in k6 load tests.
- Grafana Labs / k6 Team. ["Automated performance testing"](https://grafana.com/docs/k6/latest/testing-guides/automated-performance-testing/). Current reference for smoke, average/load, stress, spike, and soak automation guidance.
- Apache Software Foundation. ["Apache JMeter — User Manual"](https://jmeter.apache.org/usermanual/). Canonical reference for the most-established cross-protocol performance testing tool.
- Locust Team. ["Locust Documentation"](https://docs.locust.io/). Reference for the Python-scriptable distributed load testing tool.
- Gatling Team. ["Gatling Documentation"](https://gatling.io/docs/). Reference for the high-performance Scala-based load testing tool.
- Dean, J., & Norvig, P. ["Latency Numbers Every Programmer Should Know"](https://gist.github.com/jboner/2841832). Industry-canonical reference table for the latency scales that performance testing measures against.
- Beyer, B., Jones, C., Petoff, J., & Murphy, N. R. (2016). *Site Reliability Engineering*. O'Reilly. Google SRE book; chapter on SLOs as the contract performance tests verify against.
- Brendan Gregg. ["The USE Method: A method for analyzing system performance"](https://www.brendangregg.com/usemethod.html). The Utilization-Saturation-Errors framework that underlies systematic performance analysis.
- Tene, G. ["How NOT to Measure Latency"](https://www.youtube.com/watch?v=lJ8ydIuPFeU). The canonical talk on percentile latency, coordinated omission, and the misleading nature of average-latency reporting.
- Smith, C. U., & Williams, L. G. (2002). *Performance Solutions: A Practical Guide to Creating Responsive, Scalable Software*. Addison-Wesley. Foundational reference on performance engineering methodology.
- Kounev, S., Lange, K.-D., & von Kistowski, J. (2020). *Systems Benchmarking: For Scientists and Engineers*. Springer. Modern reference on performance testing methodology and benchmark design.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `quality-assurance`
- Public: `true`
- Domain: `quality/testing`
- Scope: Designing and interpreting controlled-load tests for non-functional system properties: latency distributions, throughput, error rate, resource use, saturation, load profile, workload mix, percentiles, SLO thresholds, and load shapes such as smoke, load, stress, spike, soak, and breakpoint. Portable across web, API, service, and distributed-system test surfaces. Excludes optimization/profiling itself (performance-engineering), declaring budget contracts (performance-budgets), production observability/error monitoring, single-function microbenchmarks, fault injection, and test-suite quality measurement.

**When to use**
- design a performance test for an API endpoint that verifies the p95 SLO at expected production traffic
- decide whether a new service needs load, stress, spike, soak, or breakpoint tests before launch
- diagnose a soak test failure where p99 latency and memory growth only degrade after 4 hours
- explain why average latency and coordinated omission are the wrong acceptance basis for user experience
- Triggers: `performance test`, `load test`, `stress test or load test`, `p95 vs average latency`, `k6 threshold`, `is the system fast enough under load`

**Not for**
- decide which modules need more unit tests and what test coverage target to enforce
- declare the p95 latency budget, threshold, and build-fail consequence for checkout
- choose the test strategy ratio between unit, integration, e2e, and performance suites
- measure whether mutation score shows the tests catch code defects

**Related skills**
- Verify with: `observability-modeling`, `testing-strategy`, `integration-test-design`, `performance-budgets`
- Related: `error-tracking`, `testing-strategy`, `integration-test-design`, `e2e-test-design`, `performance-engineering`, `performance-budgets`, `observability-modeling`, `mutation-testing`, `test-coverage-strategy`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: Performance testing is to a software system what a load-bearing inspection is to a bridge — you do not certify a bridge by walking across it (functional test) and concluding it works; you drive trucks of known weight across at increasing volumes, with strain gauges on every beam, and verify the deflection stays within spec under expected traffic, that the failure mode is graceful when overloaded (cracks before collapse), that nothing creeps over a long soak. A bridge whose 'average' load it can carry is 50 tonnes but whose p99 stressor reveals harmonic resonance at 80 tonnes is the bridge that fails on a windy day.
- Common misconception: |

**Grounding**
- Mode: `universal`
- Truth sources: `https://grafana.com/docs/k6/latest/using-k6/thresholds/`, `https://grafana.com/docs/k6/latest/testing-guides/automated-performance-testing/`, `https://grafana.com/docs/k6/latest/`, `https://jmeter.apache.org/usermanual/`, `https://docs.locust.io/`, `https://docs.gatling.io/`, `https://www.infoq.com/presentations/latency-pitfalls/`, `../skills/skills/quality-assurance/performance-testing/references/performance-testing-2026-06-07.md`

**Keywords**
- `performance testing`, `load testing`, `stress testing`, `soak testing`, `spike testing`, `breakpoint test`, `latency percentile`, `SLO threshold`, `k6 thresholds`, `coordinated omission`

<!-- skill-graph-context:end -->
