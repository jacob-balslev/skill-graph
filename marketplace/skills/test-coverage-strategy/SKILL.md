---
name: test-coverage-strategy
description: "Use when reasoning about code coverage as a strategic measurement rather than a target: the coverage-criterion hierarchy (function, statement, line, branch, decision, condition, MC/DC, path), Marick's distinction between coverage as a floor signal and coverage as a ceiling target, Goodhart's Law applied to coverage metrics, why 100% line coverage may catch nothing important while 80% well-chosen coverage catches almost everything, the safety-critical industry's MC/DC requirement (DO-178C aviation, ISO 26262 automotive) as the empirical evidence that coverage at the right granularity matters, the difference between covered (lines exercised) and tested (behaviors verified), and how coverage gaps are diagnostic signals about the test suite. Do NOT use for choosing test levels (use testing-strategy), the technique of mutation testing as a stronger signal (use mutation-testing), the construction of test doubles (use test-doubles-design), or specific coverage-tooling configuration (tool docs)."
license: MIT
allowed-tools: Read Grep
metadata:
  schema_version: "8"
  version: "1.0.0"
  subject: quality-assurance
  deployment_target: portable
  taxonomy_domain: quality/testing
  owner: skill-graph-maintainer
  freshness: "2026-05-16"
  drift_check: "{\"last_verified\":\"2026-05-16\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  comprehension_state: present
  stability: experimental
  keywords: "[\"code coverage\",\"line coverage\",\"branch coverage\",\"decision coverage\",\"condition coverage\",\"MC/DC\",\"modified condition decision coverage\",\"path coverage\",\"coverage as target\",\"Goodhart on coverage\"]"
  triggers: "[\"what coverage target should we set\",\"is 100% coverage the goal\",\"is this line covered or tested\",\"should we add tests for these uncovered lines\",\"branch vs line coverage\"]"
  examples: "[\"set a coverage policy for a service that distinguishes 'covered' from 'tested'\",\"explain why a 100% line coverage gate may be worse than an 80% branch coverage gate\",\"diagnose a high-coverage test suite that still misses bugs — likely a granularity mismatch\",\"decide when to upgrade from branch coverage to MC/DC for safety-critical code\"]"
  anti_examples: "[\"choose test levels (unit/integration/e2e) for a project (use testing-strategy)\",\"use mutation testing to evaluate test-suite quality (use mutation-testing)\",\"configure Istanbul, Jest coverage, or JaCoCo (tool documentation)\"]"
  relations: "{\"related\":[\"testing-strategy\",\"mutation-testing\",\"test-driven-development\",\"eval-driven-development\"],\"boundary\":[{\"skill\":\"testing-strategy\",\"reason\":\"testing-strategy owns the question of what to test at which level; this skill owns the measurement of how much of the code those tests actually exercise and at what granularity.\"},{\"skill\":\"mutation-testing\",\"reason\":\"mutation-testing owns the stronger signal of whether tests would *catch* a defect; this skill owns the structural signal of whether tests *reach* the code at all. Coverage is a necessary-not-sufficient precondition for mutation tests to even apply.\"},{\"skill\":\"test-driven-development\",\"reason\":\"TDD produces high coverage as a side effect; this skill explains why that coverage is a side effect rather than a target, and why pursuing the metric directly produces worse tests.\"}],\"verify_with\":[\"testing-strategy\",\"mutation-testing\"]}"
  mental_model: "|"
  purpose: "|"
  boundary: "|"
  analogy: "Test coverage is to a test suite what cell-phone coverage maps are to a network — a green map on the carrier's website is not the same as actually being able to make a call in your basement; the map measures *where there is theoretical signal*, not *whether the call gets through*. A 100% coverage map with a 30% call-completion rate is the same shape of problem as a 100%-line-coverage suite that misses bugs — the floor is met (no dead zones), but the ceiling is unverified."
  misconception: "|"
  concept: "{\"definition\":\"Test coverage is the family of structural measurements that report which parts of the production code were exercised by the test suite. Coverage criteria differ in granularity — function, statement, line, branch, decision, condition, modified-condition/decision (MC/DC), path — and each higher criterion subsumes the lower ones. Coverage is a *structural* property: it answers 'did the test reach this code,' not 'did the test verify this behavior.' The strategic discipline of test coverage is using coverage as a diagnostic signal about gaps in the test suite while resisting the Goodhart-Law failure mode of treating the coverage number as the target. Coverage is a floor (below this level, the test suite definitely misses things) not a ceiling (above this level, the test suite is necessarily good).\",\"mental_model\":\"|\",\"purpose\":\"|\",\"boundary\":\"|\",\"taxonomy\":\"|\",\"analogy\":\"|\",\"misconception\":\"|\"}"
  structural_verdict: PASS
  truth_verdict: PASS
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/quality-assurance/test-coverage-strategy/SKILL.md
---

# Test-Coverage Strategy

## Coverage

The strategic use of code-coverage measurement as a diagnostic signal about test-suite gaps, without falling into the Goodhart-Law trap of treating the coverage number as the target. Covers the coverage-criterion hierarchy (function → line → branch → decision → condition → MC/DC → path), Marick's distinction between coverage as floor (uncovered code is definitely untested) and coverage as ceiling (covered code is necessarily tested — false), the covered-vs-tested distinction, the safety-critical industry's MC/DC standard (DO-178C aviation, ISO 26262 automotive) as empirical evidence for granularity-matching, and the strategic uses of coverage (diagnostic, floor-gating, diff-based gating, audit artifact).

## Philosophy

Coverage measures execution, not verification. A test that calls every function but asserts nothing has 100% line coverage and zero testing value; a test with rich assertions but missing some branches has lower coverage and may have much higher testing value. The metric's strategic value is in the *floor direction*: uncovered code is definitely untested. The reverse direction — covered code is necessarily tested — is not reliable.

The discipline of coverage strategy is using the metric where it is informative (gap detection, regression signaling, test-effort allocation, audit compliance) and refusing to use it where it is misleading (as a quality target, as a substitute for behavioral verification, as a ceiling claim about test thoroughness). The risk is large because coverage numbers are easy to produce, easy to gate on, and easy to optimize for in ways that degrade the test suite.

Most working test suites should aim for coverage that is *high enough to reveal gaps without becoming the goal*. Where the certification environment mandates a specific criterion (MC/DC for safety-critical), the discipline shifts: the criterion is given; the work is meeting it without coverage-padding.

## The Criterion Hierarchy

| Criterion | What it requires | Test count for `A && B && C` | Typical use |
|---|---|---|---|
| Function | Each function called once | 1 | Detects entirely-untested functions |
| Statement / Line | Each line executed once | 1 | Default in most tools |
| Branch | Each branch (true/false) taken once | 2 | Catches missed-else-branch bugs |
| Decision | Each decision evaluated both ways | 2 | Often conflated with branch in tooling |
| Condition | Each Boolean sub-expression both true and false | 2 | Catches short-circuit-evaluation bugs |
| MC/DC | Each condition independently affects the decision | 4 (N+1 for N conditions) | DO-178C Level A; ISO 26262 ASIL-D |
| Multiple condition | All combinations of conditions exercised | 8 (2^N) | Combinatorial; rarely required |
| Path | Every execution path through the function | Infeasible for loops | Theoretical |

The right criterion depends on where the code's failure modes hide. Straight-line procedural code: line coverage. Complex Boolean conditions (access control, rate limiters, financial logic): branch or condition coverage. Safety-critical: MC/DC by mandate.

## Covered vs Tested

| Aspect | Covered | Tested |
|---|---|---|
| What it measures | Test reached the code | Test verified the code's behavior |
| Detected by | Coverage tool | Assertion presence + correctness |
| 100% achievable cheaply by | Function/line traversal with no assertions | Real behavioral assertions |
| Signal direction | Floor (uncovered = untested) reliable | Ceiling (covered = tested) unreliable |
| Strategic value | Gap detection | Quality assurance |

A test that calls `processOrder()` but asserts nothing covers `processOrder` and tests nothing in it. The coverage report cannot distinguish this from a test with full behavioral assertions. The discipline is to read coverage as one part of a picture that includes assertion review, mutation testing (see `mutation-testing`), and integration test coverage.

## When To Use Each Criterion

| Code character | Recommended criterion | Why |
|---|---|---|
| Straight-line procedural; few branches | Line | Adequate; cheap |
| Branchy business logic | Branch | Catches missed-else cases line misses |
| Compound Boolean conditions (access checks, rate limiting, financial gates) | Condition or MC/DC | Catches short-circuit-evaluation bugs |
| Safety-critical (aviation, automotive, medical) | MC/DC | Mandated by DO-178C, ISO 26262 |
| Algorithmic / mathematical | Branch + mutation testing | Coverage + behavioral signal |
| Pure utility / value objects | Line | Most failure modes line coverage catches |
| Error / exception paths | Branch (or accept the gap) | Branch reveals untested error handling |

## Goodhart-Resistant Strategy

Patterns that use coverage strategically without producing Goodhart-pressure:

1. **Diagnostic, not gating.** Report coverage on PRs; don't fail builds on coverage. Reviewers read the report; the team adjusts allocation.
2. **Diff-based gating at low threshold.** New/changed lines must be covered above (e.g.) 70%, not the codebase as a whole. Lower aggregate target, higher meaningfulness of each test.
3. **Coverage as part of a panel.** Pair coverage with mutation score, assertion density, and integration test breadth. No single metric is the target.
4. **Per-module differentiation.** Higher coverage required for high-impact modules (financial calculation, security, data-loss-risk); lower for stable utility code.
5. **Annual review of gaps.** Walk the uncovered code; decide consciously whether the gap is acceptable (defensive code, logging) or a real test debt.

## Verification

After applying this skill, verify:
- [ ] The team's coverage criterion is appropriate to the code's failure modes (line for procedural, branch for branchy, MC/DC for safety-critical). The default criterion is not assumed correct without checking what it measures.
- [ ] Coverage is read as a floor signal (gaps point to untested code), not a ceiling signal (high coverage proves tests are good). The team distinguishes "covered" from "tested" in conversation and in policy.
- [ ] Coverage gates, if used, are set at a level achievable by real behavioral testing — not a level that forces coverage-padding tests.
- [ ] Coverage of dead code is excluded or noted. A dropping coverage percentage is interpreted (could be dead-code removal, test deletion, or new untested code), not treated as automatically bad.
- [ ] Coverage is paired with at least one behavioral measurement (mutation testing, assertion review, integration-test breadth) in any quality conversation about the test suite.
- [ ] For safety-critical code, the certification standard's coverage criterion is the criterion in use, and the tool's reported number actually matches the standard's definition.
- [ ] Production observability is treated as a separate verification dimension from coverage. Coverage tells you what tests exercised; observability tells you what production exercises.
- [ ] The team can explain a coverage gap on any specific module as either "we don't need to test this because [reason]" or "we should test this and have not." Unexplained gaps are test debt.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Deciding which test levels (unit/integration/e2e) to invest in | `testing-strategy` | testing-strategy owns the level/scope question; this skill owns the measurement of structural reach |
| Measuring whether tests would catch deliberately-introduced defects | `mutation-testing` | mutation owns the behavioral signal; this skill owns the structural signal |
| Constructing test doubles (mocks, stubs, fakes) | `test-doubles-design` | test-doubles-design owns the stand-in design |
| Iterating on LLM behavior via an eval suite | `eval-driven-development` | eval-driven-development is the LLM-system analog; this skill is about deterministic-software coverage |
| Configuring Istanbul, Jest coverage, JaCoCo, Coverlet | tool documentation | tool API choice is tactical detail below this skill's scope |

## Key Sources

- Marick, B. (1999). ["How to Misuse Code Coverage"](http://www.exampler.com/testing-com/writings/coverage.pdf). The canonical practitioner essay on coverage as a strategic signal vs target; defines the floor/ceiling distinction.
- Cornett, S. ["Code Coverage Analysis"](http://www.bullseye.com/coverage.html). Long-form reference defining the coverage criterion hierarchy and the practical differences between branch, decision, and MC/DC coverage.
- RTCA. *DO-178C: Software Considerations in Airborne Systems and Equipment Certification* (2011). The aviation certification standard mandating MC/DC for Level A software. Industry benchmark for what coverage criterion safety-critical software requires.
- ISO. *ISO 26262: Road vehicles — Functional safety* (2018). The automotive safety standard mandating MC/DC for ASIL-D software. Parallel industry benchmark.
- Hayhurst, K. J., Veerhusen, D. S., Chilenski, J. J., & Rierson, L. K. (2001). ["A Practical Tutorial on Modified Condition/Decision Coverage"](https://ntrs.nasa.gov/citations/20010057789). NASA technical memorandum; the practical reference on MC/DC.
- Goodhart, C. (1975). "Problems of Monetary Management: The U.K. Experience." The origin of Goodhart's Law as commonly cited; applies sharply to coverage-as-target.
- Inozemtseva, L., & Holmes, R. (2014). ["Coverage Is Not Strongly Correlated with Test Suite Effectiveness"](https://dl.acm.org/doi/10.1145/2568225.2568271). *ICSE 2014*. Empirical study showing coverage and test-suite effectiveness are weakly correlated; supports the floor-not-ceiling reading.
- Namin, A. S., & Andrews, J. H. (2009). ["The influence of size and coverage on test suite effectiveness"](https://dl.acm.org/doi/10.1145/1572272.1572284). *ISSTA 2009*. Earlier empirical study with similar findings on coverage's limited correlation with bug-finding effectiveness.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `quality-assurance`
- Deployment: `portable`
- Domain: `quality/testing`

**When to use**
- set a coverage policy for a service that distinguishes 'covered' from 'tested'
- explain why a 100% line coverage gate may be worse than an 80% branch coverage gate
- diagnose a high-coverage test suite that still misses bugs — likely a granularity mismatch
- decide when to upgrade from branch coverage to MC/DC for safety-critical code
- Triggers: `what coverage target should we set`, `is 100% coverage the goal`, `is this line covered or tested`, `should we add tests for these uncovered lines`, `branch vs line coverage`

**Not for**
- choose test levels (unit/integration/e2e) for a project (use testing-strategy)
- use mutation testing to evaluate test-suite quality (use mutation-testing)
- configure Istanbul, Jest coverage, or JaCoCo (tool documentation)
- Owned by `testing-strategy`: the question of what to test at which level
- Owned by `mutation-testing`: the stronger signal of whether tests would *catch* a defect
- Owned by `test-driven-development`

**Related skills**
- Verify with: `testing-strategy`, `mutation-testing`
- Related: `testing-strategy`, `mutation-testing`, `test-driven-development`, `eval-driven-development`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: Test coverage is to a test suite what cell-phone coverage maps are to a network — a green map on the carrier's website is not the same as actually being able to make a call in your basement; the map measures *where there is theoretical signal*, not *whether the call gets through*. A 100% coverage map with a 30% call-completion rate is the same shape of problem as a 100%-line-coverage suite that misses bugs — the floor is met (no dead zones), but the ceiling is unverified.
- Common misconception: |

**Keywords**
- `code coverage`, `line coverage`, `branch coverage`, `decision coverage`, `condition coverage`, `MC/DC`, `modified condition decision coverage`, `path coverage`, `coverage as target`, `Goodhart on coverage`

<!-- skill-graph-context:end -->
