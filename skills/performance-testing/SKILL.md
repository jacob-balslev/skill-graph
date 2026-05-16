---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: performance-testing
description: "Use when reasoning about performance testing as a discipline distinct from its siblings `performance-engineering` (optimization) and `performance-budgets` (threshold contract): the five primitives (load profile, workload, latency metric, throughput metric, SLO target), the load-shape taxonomy (smoke, load, stress, spike, soak, breakpoint), the latency-percentile vocabulary (p50, p95, p99, p99.9) and why average latency is misleading, the SLO-as-acceptance-criterion discipline, the tool ecosystem (k6, JMeter, Locust, Gatling, Vegeta), the difference between performance testing (controlled offline load) and observability (uncontrolled production measurement), and the failure modes (unrepresentative environment, average-fixation, ignored tail, one-time tests as continuous signal). Do NOT use for the optimization activity (use `performance-engineering`), declaring threshold contracts (use `performance-budgets`), runtime measurement (use `observability` or `error-tracking`), microbenchmarks (use language benchmark tools), chaos and fault injection (use `chaos-engineering`), or test-suite quality (use `mutation-testing`)."
version: 1.0.0
type: capability
category: quality
domain: quality/testing
scope: reference
owner: skill-graph-maintainer
freshness: "2026-05-16"
drift_check:
  last_verified: "2026-05-16"
eval_artifacts: planned
eval_state: unverified
routing_eval: absent
comprehension_state: present
stability: experimental
license: MIT
allowed-tools: Read Grep
keywords:
  - performance testing
  - load testing
  - stress testing
  - soak testing
  - spike testing
  - breakpoint test
  - k6
  - JMeter
  - Locust
  - Gatling
  - latency percentile
  - p95
  - p99
  - SLO
  - throughput
triggers:
  - "what should our load test do"
  - "p95 vs average latency"
  - "k6 vs JMeter vs Locust"
  - "is the system fast enough"
  - "stress test or load test"
examples:
  - "design a load test for an API endpoint that verifies the p95 SLO at expected production traffic"
  - "decide between load, stress, and soak tests for a new service before launch"
  - "diagnose a soak test failure that only appears after 4 hours — likely a leak"
  - "explain why average latency is the wrong metric for user experience"
anti_examples:
  - "measure production traffic latency in real time (use observability)"
  - "benchmark a single function in isolation (use language benchmark tools)"
  - "inject failures into a production system (use chaos-engineering)"
relations:
  related:
    - testing-strategy
    - integration-test-design
    - e2e-test-design
    - performance-engineering
    - performance-budgets
  boundary:
    - skill: testing-strategy
      reason: "testing-strategy owns the strategic question of what to test; this skill owns one tactical technique (controlled-load measurement of non-functional properties) within that strategy."
    - skill: integration-test-design
      reason: "integration-test-design owns tests of correctness across internal seams; this skill owns tests of non-functional properties (latency, throughput) under controlled load. Both can use the same environment; they answer different questions."
    - skill: e2e-test-design
      reason: "e2e-test-design owns user-journey correctness tests; this skill owns load-driven measurement of those same journeys. A 'performance e2e test' is the composition of both disciplines."
    - skill: performance-engineering
      reason: "performance-engineering owns the activity of profiling and optimizing a specific slow path once it has been identified; this skill owns the discipline of exercising the system under controlled load to discover and quantify performance behavior. Performance-engineering acts on bottlenecks; performance-testing produces the measurements that locate them and verifies the optimizations afterward."
    - skill: performance-budgets
      reason: "performance-budgets owns the declaration of the threshold-and-consequence contract (metric, threshold, percentile, consequence) as a quality property; this skill owns the test mechanism that exercises the system under load and verifies whether the declared budgets hold. The two compose: budgets declare what 'fast enough' means; performance tests verify the system meets the declaration. Without a budget, a performance test produces measurements without a verdict; without performance tests, a budget is an aspirational threshold without empirical evidence."
  verify_with:
    - testing-strategy
    - integration-test-design
    - performance-budgets
concept:
  definition: "Performance testing is the discipline of measuring a system's non-functional properties — latency, throughput, resource utilization, error rate under load — by running the system under controlled load conditions and observing the resulting metrics. Where functional tests answer 'does the system produce the right output?', performance tests answer 'does the system produce the right output *quickly enough* and at *sufficient scale*, while staying within resource budgets and error tolerances?'. The unit of judgment is whether the measured metrics meet defined acceptance thresholds (typically Service-Level Objectives expressed as percentiles, e.g., 'p95 latency below 200ms at 1,000 requests per second sustained for 30 minutes'). Performance testing is *controlled* and *offline*; observability is its production-runtime counterpart that measures the live system without imposed load."
  mental_model: |
    Five primitives structure performance testing:

    1. **Load profile** — the pattern of requests over time the test imposes. A constant 100 requests per second for 10 minutes is one profile; a ramp from 0 to 1000 RPS over 5 minutes is another; a steady 100 RPS with a 1-minute spike to 10,000 RPS is a third. The profile determines which system property is exercised — sustained load profiles test capacity; spike profiles test elasticity; ramp profiles find the breaking point. Choosing the load profile is the first design decision.

    2. **Workload** — the mix of operations the test sends. A workload is "30% read requests on cached entities, 20% read requests on uncached entities, 40% search queries, 10% writes." A workload that is 100% reads of a single entity does not stress the same code paths as production traffic; a workload that matches production proportions is representative; a workload that exaggerates the expensive operations is stress-shaped. The workload's representativeness determines the test's validity.

    3. **Latency metric (with percentiles)** — the time the system takes to respond to a request. Average latency hides tail behavior; p50 (median) is more honest about the typical experience; p95 catches the experience of 5% of users; p99 catches the 1% worst experiences; p99.9 catches the rare-but-real outliers. User experience is dominated by tail latency because a user issues many requests in a session and the slowest one determines the perceived speed. Performance acceptance criteria are stated as percentile thresholds, never as averages.

    4. **Throughput metric** — the rate at which the system can handle work, expressed as requests per second, operations per second, transactions per second, or similar. Maximum throughput is the rate at which adding more load no longer increases successful operations (the system has saturated). Sustainable throughput is below maximum, with margin for spikes and acceptable error rate. Performance tests measure both: where is the maximum, and what is the sustainable level below it.

    5. **SLO target** — the acceptance threshold the test verifies against. A typical SLO: "p95 < 200ms, p99 < 500ms, error rate < 0.1%, throughput >= 1000 RPS sustained." The SLO is the *contract*; the performance test is the *verification*. Without an explicit SLO, performance tests produce numbers without verdicts — "we measured this latency" rather than "we verified the system meets the contract." The discipline begins with stating the SLO.

    The deep insight is that **performance is not a single number**. It is a multi-dimensional behavior — latency distribution, throughput ceiling, error rate, resource utilization — that varies with load shape and workload composition. A system can have excellent average latency and unacceptable p99 latency; a system can meet its SLO at 500 RPS and fail catastrophically at 1000 RPS; a system can serve a uniform workload well and a real-mix workload poorly. The discipline is naming each dimension explicitly, measuring it under representative conditions, and verifying it against an explicit target.

    The complementary insight is that **the right environment is non-negotiable**. A performance test in a developer laptop is informational at best; the production hardware, network, database, cache, and dependencies determine the measurements that matter. Performance tests must run in environments representative of production, with realistic data volumes, realistic network topology, and the same versions of all dependencies. A test in a stripped-down environment measures a stripped-down system, not the system that will face users.
  purpose: |
    Performance testing exists because functional correctness and operational viability are different properties, and the system that has the first does not necessarily have the second.

    **Functional tests miss performance bugs by construction.** A function that returns the right answer in 30 seconds is functionally correct and operationally broken if its caller's timeout is 10 seconds. Unit tests, integration tests, e2e tests verify behavior; they do not verify behavior-within-time-budget. Performance tests add the time dimension and the load dimension to the verification space.

    **Performance is non-compositional in surprising ways.** Two services that each respond in 50ms might compose to a 300ms response when one calls the other in a fan-out pattern across slow connections. A database that handles 1000 reads per second might handle 100 writes per second; a workload that mixes them at the wrong proportions saturates differently than the read-only or write-only tests would suggest. Functional integration testing exercises the correctness of these compositions; performance testing exercises their cost.

    **Tail latency dominates user experience.** A median request that completes in 100ms with a p99 of 5 seconds means 1% of requests take 50× the median time. Users in real applications issue many requests; the probability of hitting a p99 request in a session of 100 requests is about 63%. The average latency is misleading; the median is honest; the percentiles are what users feel. Performance tests that report only averages are giving the team a number whose mathematical mean has little relationship to user experience.

    **Soak tests find leaks and degradation.** A system that performs well in the first 10 minutes of a load test may leak memory, accumulate connection-pool exhaustion, fill log volumes, or hit garbage-collection death spirals after hours. Soak tests run for hours specifically to catch these degradation modes. Functional tests can't catch them; even most performance tests don't run long enough.

    **Stress tests find breaking points.** A stress test runs load past the expected capacity to characterize how the system fails — gracefully (rejected requests with clear errors), badly (cascading failures, retry storms, dependency death), catastrophically (data corruption, persistent unrecoverable state). Knowing the failure mode is essential for capacity planning and incident response.

    The cost of performance testing is real. Load-generation infrastructure (multiple load generators to avoid client-side bottleneck), production-like test environments (similar hardware, network, data volumes), engineering time to design representative workloads, ongoing maintenance as the system evolves. Modern tools (k6, JMeter, Locust, Gatling) make load generation cheap; the production-like environment is the load-bearing investment.

    The deeper purpose of performance testing is to make non-functional properties *first-class* in the team's decision-making. Without performance testing, "is the system fast enough?" is answered by intuition or by users complaining; with performance testing, it is answered by measurement against an explicit SLO. The discipline of stating SLOs and verifying them empirically is what shifts performance from "we hope it's fine" to "we have evidence."
  boundary: |
    **Performance testing is not benchmarking.** Benchmarking measures the speed of a specific function or implementation in isolation (a sort algorithm, a hash function, a serialization library). Performance testing measures the behavior of an *assembled system* under load. The disciplines overlap (a benchmark is a tiny performance test) but the scope and methodology differ: benchmarks isolate; performance tests integrate.

    **Performance testing is not observability.** Observability measures the live system under real production load using metrics, logs, traces. Performance testing measures the system in a controlled environment under imposed load. Both are essential; they answer different questions: observability tells you what production is doing now; performance testing tells you what the system will do at a stated load before that load arrives.

    **Performance testing is not load testing alone.** Load testing is one type of performance test (verify the system handles expected production load with margin). Stress testing, spike testing, soak testing, and breakpoint testing are also performance tests, each verifying different properties. Conflating "performance testing" with "load testing" misses the others.

    **Average latency is not the metric.** Users experience tail latency, not the average. A system with 10ms average and 5-second p99 has 1% of requests taking 500× the average — the user who hits one of those requests experiences the slow case, and in a typical session, the probability of hitting at least one such request is high. Performance acceptance is stated in percentiles (p50, p95, p99, p99.9), never as averages alone.

    **Performance testing in a non-representative environment is not testing.** A load test in a developer laptop with mocked dependencies measures the laptop and the mocks; it does not measure the system. Production-like hardware, network, data volume, dependency versions, and configuration are the load-bearing requirements. Performance tests in a stripped environment are informational about the stripped system, not the real one.

    **A single performance-test run is not continuous signal.** Performance regresses over time as code changes, data volumes grow, dependencies update. A test that ran once before launch tells you about that day's state; a test that runs on every PR (or every merge) detects regression as it happens. Performance testing is most valuable as continuous gating, not as a one-time launch artifact.

    **Performance tests do not replace capacity planning.** A test that shows the system handles 1000 RPS at p95<200ms tells you about today's capacity. Tomorrow's traffic, growth, and load shape are separate analyses. Performance testing is one input to capacity planning, not a substitute.

    **A passing performance test is not proof of production readiness.** It is evidence the system meets its SLO under the tested workload in the test environment. Production has variability the test doesn't (real user patterns, partial failures, network conditions, third-party variability). Performance tests are necessary, not sufficient.

    **Synthetic load is not the same as real traffic.** Synthetic load (generated by a load tool) follows the workload the test designer specified; real traffic has shape the designer didn't anticipate. The mitigation is using production traffic patterns (sampled from observability, anonymized) as the basis for synthetic workloads; the limitation is that production patterns drift and the workload needs to be refreshed.
  taxonomy: |
    By load shape:
    - **Smoke test** — small load (few users for a short time); verifies the test harness and basic system function. Run early, cheap, catches gross regressions.
    - **Load test** — expected production load (or expected production load × margin) sustained for a meaningful period. Verifies the system handles the design load. Most common type.
    - **Stress test** — load beyond expected production capacity; finds the breaking point and the failure mode. Verifies the system fails gracefully.
    - **Spike test** — sudden, large increase in load (e.g., from 100 to 10,000 RPS in seconds); verifies elasticity, autoscaling, and recovery.
    - **Soak / endurance test** — sustained moderate load for hours; finds memory leaks, connection-pool exhaustion, log volume issues, GC degradation.
    - **Breakpoint test** — gradually increasing load until the system fails; characterizes capacity quantitatively.
    - **Capacity test** — find the load at which a specific SLO threshold is violated.

    By scope:
    - **Component performance test** — single service or component under load.
    - **System performance test** — multiple services in their real interaction; full-stack measurement.
    - **User-journey performance test** — full e2e journey under load; "performance e2e."
    - **Database performance test** — database under load (often query-shape-specific).
    - **Third-party performance test** — measure the third-party dependency's behavior under the load you'll send it.

    By metric primary:
    - **Latency-focused** — measure response time distribution; verify percentile thresholds.
    - **Throughput-focused** — measure max sustainable rate; verify SLO at that rate.
    - **Error-rate-focused** — verify error rate stays under threshold at the tested load.
    - **Resource-utilization-focused** — verify CPU, memory, disk, network stay within budgets.
    - **Saturation-focused** — find the resource that saturates first; identify the bottleneck.

    By environment fidelity:
    - **Production-equivalent** — same hardware, data, network, dependencies. Highest fidelity; highest cost.
    - **Production-scaled-down** — proportional reduction; calibrated to extrapolate. Common for cost-prohibitive production-equivalent setups.
    - **Stripped** — much-reduced; informational only; cannot be the basis for production SLO claims.
    - **Production canary** — small slice of real production traffic with measurement infrastructure. Bridges performance testing and observability.

    By tool:
    - **k6** (Grafana Labs) — modern JavaScript-scriptable load tool; cloud-and-local. Increasingly the default for HTTP and gRPC.
    - **Apache JMeter** — long-established Java-based; broad protocol support; UI-driven.
    - **Locust** — Python-scriptable; distributed load generation.
    - **Gatling** — Scala-based; high-performance.
    - **Vegeta** — Go-based; simple HTTP load tool.
    - **Wrk / Wrk2** — fast C-based HTTP benchmarking tools.
    - **Hey** — simple Go-based HTTP load tool.
    - **Apache Bench (ab)** — venerable single-host HTTP load tool.

    By cadence:
    - **One-time pre-launch** — run before release; informational.
    - **On every PR (smoke)** — fast smoke test on PRs; catches gross regressions.
    - **On every merge or nightly (full)** — full performance suite catches regressions; gates merges if SLO violations.
    - **Periodic (weekly/monthly)** — broader stress/soak tests on longer cadence due to cost.
    - **Continuous** — automated production canary or continuous load tests in staging environment.

    By SLO relationship:
    - **SLO-gated** — test fails if SLO is violated; gates merge or deploy.
    - **SLO-tracked** — test reports SLO compliance; doesn't gate; trends watched.
    - **SLO-free** — test reports measurements without acceptance threshold; informational only.
  analogy: |
    A bridge load test. The bridge is built; the static structural inspection passed; the welds were verified; the materials were certified. None of this proves the bridge bears its rated load. The load test is the engineer running fully-loaded trucks across the bridge at the rated weight, then beyond it, and measuring deflection, vibration, and any structural distress.

    Load testing is the equivalent of driving the rated number of trucks across — verify the bridge bears its design load with the safety margin built in.

    Stress testing is loading the bridge past its design — finding the load at which it fails, and how. Does it fail gracefully (sag predictably) or catastrophically (snap suddenly)? The answer changes the operational decisions.

    Spike testing is driving five trucks across simultaneously after an hour of single-truck traffic — verifying the bridge handles sudden load increases, the kind that happen when a stadium event lets out.

    Soak testing is leaving heavy traffic on the bridge for 24 hours — finding the failure modes that emerge only over time: bolt vibration, expansion-joint wear, paint failure, drainage issues.

    Breakpoint testing is the systematic destruction test — load the bridge until it fails. Expensive (you destroy the bridge), but precisely characterizes capacity.

    The percentile latency analog is the bridge's deflection distribution under varied truck weights. Average deflection might be 5cm; p95 might be 12cm; p99 might be 28cm. A bridge spec that says "average deflection under 10cm" is misleading — the trucks at p99 deflect three times as much, and one truck in a hundred might deflect into territory the bridge wasn't designed for. The spec must be stated in percentiles to be operationally meaningful.

    The SLO is the bridge's published design contract — "bears 80,000 lb per axle, deflects no more than 15cm at peak load." Without this contract, the test produces numbers without verdict. With it, the test produces a pass/fail on a specific commitment.

    The environment fidelity is whether the test bridge was built with the same steel, the same welds, the same span and load distribution. A load test on a half-scale model is informational about scaled-up properties; it is not a verification of the real bridge.

    Performance testing applies this discipline to software: define the loads the system must bear, design tests for each load shape, measure against the stated SLO, treat percentile distributions seriously, run tests in environments that resemble production.
  misconception: |
    The most common misconception is that **average latency is the metric**. It is not. Users experience tail latency — the worst 1-5% of requests dominate the perception of speed because a user issues many requests in a session and the slowest one defines the felt experience. Performance acceptance criteria are stated in percentiles (p50, p95, p99, p99.9), never as averages alone. A system with a 50ms average and a 5-second p99 is failing every 100th user.

    The second misconception is that **performance testing is one type of test (load testing)**. It is six types: smoke, load, stress, spike, soak, breakpoint. Each tests a different property of the system. A team that runs only load tests has verified the system handles design load and knows nothing about its failure mode, its elasticity, its endurance, or its capacity ceiling.

    The third misconception is that **performance tests in a stripped environment provide useful signal**. They provide signal about the stripped environment, not the production system. Production hardware, network, data volumes, dependency versions, and configuration all materially affect performance. A test in a developer laptop with mocked dependencies measures the laptop and the mocks; the production system's behavior is unverified.

    The fourth misconception is that **a one-time pre-launch performance test is enough**. It tells you about the system's behavior on that day. Performance regresses as code changes, data grows, and dependencies update. Continuous performance testing — on every merge, with regression alerts — is the discipline that catches degradation as it happens, not after users notice.

    The fifth misconception is that **performance testing replaces observability**. It does not. Performance testing measures the system in a controlled environment under imposed load; observability measures the live system under real production load. Both are necessary: performance tests gate deploys against SLO; observability detects production issues the tests didn't anticipate.

    The sixth misconception is that **performance is just about speed**. It is about latency, throughput, error rate, resource utilization, and saturation — all under load. A system can be fast for small workloads and unsustainable at production scale; fast in steady state and broken at peak; fast on the happy path and failing on retry storms. Performance is multi-dimensional.

    The seventh misconception is that **the load tool is the bottleneck the test catches**. A poorly-distributed load generator can be the bottleneck instead of the system under test; an under-provisioned load tool produces measurements about itself. Distributed load generation, calibration of the load tool against the system's expected limits, and verification that the load tool isn't the bottleneck are part of the discipline.

    The eighth misconception is that **a passing performance test means production will be fine**. It means the system met its SLO under the tested workload in the test environment. Production has variability the test doesn't sample — long-tail user behaviors, partial failures, network conditions, third-party variability, cron-job interference. Performance tests are necessary but not sufficient.

    The ninth misconception is that **synthetic workload is representative because it has the right RPS**. Throughput rate is one dimension; workload composition (the mix of operations, the distribution of input sizes, the cache hit rate) is another. A synthetic workload that has the right RPS but the wrong operation mix tests the wrong code paths. Realistic workloads are derived from production traffic samples, not from invented patterns.

    The tenth misconception is that **stress tests should be avoided because they're disruptive**. Stress tests intentionally find the breaking point — that's their purpose. A system whose breaking point is unknown is one whose operators cannot capacity-plan, cannot incident-respond, and cannot calibrate retry policies. The disruption is the value.
---

# Performance Testing

## Coverage

The discipline of measuring non-functional system properties — latency, throughput, error rate, resource utilization, saturation — by running the system under controlled load and verifying against explicit SLO thresholds. Covers the five primitives (load profile, workload, latency metric, throughput metric, SLO target), the six load-shape types (smoke, load, stress, spike, soak, breakpoint) that each test a different property, the latency-percentile discipline (p50/p95/p99/p99.9) that replaces the misleading average, the environment-fidelity requirement that makes results meaningful, the modern tool landscape (k6, JMeter, Locust, Gatling, Vegeta, Wrk), and the distinction from observability (offline controlled vs online real-traffic) and benchmarking (system vs single-function).

## Philosophy

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
| Measuring real production traffic in real time | `observability` or `error-tracking` | observability owns runtime measurement; this skill owns offline controlled measurement |
| Benchmarking a single function or implementation | language-level benchmark tools | benchmarks isolate; this skill measures the assembled system |
| Injecting failures into a running system | `chaos-engineering` (when it exists) | chaos is fault injection; this skill is load measurement |
| Testing the test suite's quality | `mutation-testing` | mutation measures test-suite effectiveness; this skill measures system performance |
| Choosing the test-level ratio | `testing-strategy` | strategy owns ratios; this skill is one technique within them |
| Testing internal seams between modules | `integration-test-design` | integration owns correctness across seams; this skill owns load behavior |
| Testing user journeys end-to-end | `e2e-test-design` | e2e owns user-perceived behavior; "performance e2e" composes both |

## Key Sources

- Grafana Labs / k6 Team. ["k6 Documentation"](https://k6.io/docs/). Canonical reference for the modern JavaScript-scriptable load testing tool; covers the six load shapes and the SLO-as-test-target discipline.
- Apache Software Foundation. ["Apache JMeter — User Manual"](https://jmeter.apache.org/usermanual/). Canonical reference for the most-established cross-protocol performance testing tool.
- Locust Team. ["Locust Documentation"](https://docs.locust.io/). Reference for the Python-scriptable distributed load testing tool.
- Gatling Team. ["Gatling Documentation"](https://gatling.io/docs/). Reference for the high-performance Scala-based load testing tool.
- Dean, J., & Norvig, P. ["Latency Numbers Every Programmer Should Know"](https://gist.github.com/jboner/2841832). Industry-canonical reference table for the latency scales that performance testing measures against.
- Beyer, B., Jones, C., Petoff, J., & Murphy, N. R. (2016). *Site Reliability Engineering*. O'Reilly. Google SRE book; chapter on SLOs as the contract performance tests verify against.
- Brendan Gregg. ["The USE Method: A method for analyzing system performance"](https://www.brendangregg.com/usemethod.html). The Utilization-Saturation-Errors framework that underlies systematic performance analysis.
- Tene, G. ["How NOT to Measure Latency"](https://www.youtube.com/watch?v=lJ8ydIuPFeU). The canonical talk on percentile latency, coordinated omission, and the misleading nature of average-latency reporting.
- Smith, C. U., & Williams, L. G. (2002). *Performance Solutions: A Practical Guide to Creating Responsive, Scalable Software*. Addison-Wesley. Foundational reference on performance engineering methodology.
- Kounev, S., Lange, K.-D., & von Kistowski, J. (2020). *Systems Benchmarking: For Scientists and Engineers*. Springer. Modern reference on performance testing methodology and benchmark design.
