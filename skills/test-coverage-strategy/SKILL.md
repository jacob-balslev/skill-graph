---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: test-coverage-strategy
description: "Use when reasoning about code coverage as a strategic measurement rather than a target: the coverage-criterion hierarchy (function, statement, line, branch, decision, condition, MC/DC, path), Marick's distinction between coverage as a floor signal and coverage as a ceiling target, Goodhart's Law applied to coverage metrics, why 100% line coverage may catch nothing important while 80% well-chosen coverage catches almost everything, the safety-critical industry's MC/DC requirement (DO-178C aviation, ISO 26262 automotive) as the empirical evidence that coverage at the right granularity matters, the difference between covered (lines exercised) and tested (behaviors verified), and how coverage gaps are diagnostic signals about the test suite. Do NOT use for choosing test levels (use testing-strategy), the technique of mutation testing as a stronger signal (use mutation-testing), the construction of test doubles (use test-doubles-design), or specific coverage-tooling configuration (tool docs)."
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
  - code coverage
  - line coverage
  - branch coverage
  - decision coverage
  - condition coverage
  - MC/DC
  - modified condition decision coverage
  - path coverage
  - coverage as target
  - Goodhart on coverage
  - covered vs tested
  - DO-178C
triggers:
  - "what coverage target should we set"
  - "is 100% coverage the goal"
  - "is this line covered or tested"
  - "should we add tests for these uncovered lines"
  - "branch vs line coverage"
examples:
  - "set a coverage policy for a service that distinguishes 'covered' from 'tested'"
  - "explain why a 100% line coverage gate may be worse than an 80% branch coverage gate"
  - "diagnose a high-coverage test suite that still misses bugs — likely a granularity mismatch"
  - "decide when to upgrade from branch coverage to MC/DC for safety-critical code"
anti_examples:
  - "choose test levels (unit/integration/e2e) for a project (use testing-strategy)"
  - "use mutation testing to evaluate test-suite quality (use mutation-testing)"
  - "configure Istanbul, Jest coverage, or JaCoCo (tool documentation)"
relations:
  related:
    - testing-strategy
    - mutation-testing
    - test-driven-development
    - eval-driven-development
  boundary:
    - skill: testing-strategy
      reason: "testing-strategy owns the question of what to test at which level; this skill owns the measurement of how much of the code those tests actually exercise and at what granularity."
    - skill: mutation-testing
      reason: "mutation-testing owns the stronger signal of whether tests would *catch* a defect; this skill owns the structural signal of whether tests *reach* the code at all. Coverage is a necessary-not-sufficient precondition for mutation tests to even apply."
    - skill: test-driven-development
      reason: "TDD produces high coverage as a side effect; this skill explains why that coverage is a side effect rather than a target, and why pursuing the metric directly produces worse tests."
  verify_with:
    - testing-strategy
    - mutation-testing
concept:
  definition: "Test coverage is the family of structural measurements that report which parts of the production code were exercised by the test suite. Coverage criteria differ in granularity — function, statement, line, branch, decision, condition, modified-condition/decision (MC/DC), path — and each higher criterion subsumes the lower ones. Coverage is a *structural* property: it answers 'did the test reach this code,' not 'did the test verify this behavior.' The strategic discipline of test coverage is using coverage as a diagnostic signal about gaps in the test suite while resisting the Goodhart-Law failure mode of treating the coverage number as the target. Coverage is a floor (below this level, the test suite definitely misses things) not a ceiling (above this level, the test suite is necessarily good)."
  mental_model: |
    Five primitives structure coverage strategy:

    1. **The coverage criterion hierarchy** — each criterion is a stricter measurement than the previous, and each higher criterion implies lower-criterion coverage. Function coverage (was the function called?) is the weakest. Statement/line coverage (was each line executed?) is the most common. Branch coverage (was each branch — true and false — taken?) catches missed-else-branch bugs that line coverage misses. Decision coverage (was each decision point evaluated to both true and false?) is similar to branch but distinct in some tools. Condition coverage (was each Boolean sub-expression independently evaluated to both values?) catches short-circuit-evaluation bugs that decision coverage misses. MC/DC (modified condition/decision coverage; was each condition shown to independently affect the decision's outcome?) is the safety-critical standard from DO-178C aviation. Path coverage (was every possible execution path exercised?) is the strongest and combinatorially infeasible for non-trivial code.

    2. **Covered vs tested** — "covered" means a test caused the code to execute. "Tested" means a test verified that the code behaved correctly. A line that is covered but whose output the test does not assert against is reached but not tested; the coverage metric counts it as covered all the same. This is the most consequential property of coverage metrics: they are blind to assertion quality. A test that calls every function and asserts nothing has 100% line coverage and zero testing value.

    3. **Coverage as floor signal** — uncovered code is *definitely* untested. If the coverage report says line 47 was never reached, line 47's behavior is not verified by the suite. This direction of the signal is reliable and diagnostic — coverage gaps point to specific testing gaps. The reverse direction (covered means tested) is not reliable, but the floor direction is the main strategic value of the metric.

    4. **Goodhart on coverage** — "when a measure becomes a target, it ceases to be a good measure." Coverage targets (90% line coverage required to merge) create pressure to write coverage-producing tests rather than behavior-verifying tests. The pressure is corrosive at the margin: developers add tests that exercise hard-to-cover lines without actually verifying their behavior, because the metric rewards the exercise, not the verification. The discipline is to treat coverage as diagnostic, not gating, or to gate at a level low enough that meeting the gate requires real testing rather than coverage-padding.

    5. **The granularity-matching principle** — the right coverage criterion depends on the code's failure modes. For straight-line procedural code, line coverage catches most gaps. For code with complex Boolean conditions (rate limiters, access control, financial calculations), branch or condition coverage catches gaps that line coverage misses. For safety-critical code (aviation, automotive, medical), MC/DC is required by industry standard. A team using line coverage on a codebase whose bugs hide in Boolean conditions has chosen the wrong granularity and is measuring the wrong thing.

    The deep insight is that **coverage measures structure, not behavior**. The map of which code ran in the tests is useful — uncovered code is unverified code — but the map does not tell you whether the verification is correct. Mutation testing, contract testing, and property-based testing each add behavioral signal on top of the structural signal coverage provides. A coverage-strategy practitioner uses coverage for what it measures (structural reach) and pairs it with other measurements for what it cannot (behavioral correctness).
  purpose: |
    Coverage exists because the alternative — judging test-suite thoroughness by eyeballing the test files — does not scale and does not produce shared signal across a team.

    **Diagnostic visibility.** A coverage report shows which code the test suite reaches and which it doesn't. Without it, the team's belief about test thoroughness is anecdotal: "I tested that" / "I think we have tests for that" / "we should add tests for that." The coverage map replaces opinion with measurement at the structural level, even though it doesn't replace opinion at the behavioral level.

    **Regression detection on coverage drop.** A team that tracks coverage over time can detect when new code lands without tests (coverage percentage drops or specific modules' coverage drops). This is a leading indicator of test-suite degradation that is otherwise hard to see until defects arrive.

    **Allocating test effort.** Coverage reports point to the parts of the codebase that have the least test investment. For risk-weighted test allocation — covering high-impact code well, accepting lower coverage on stable utility code — coverage data is the input the discipline acts on.

    **Industry-standard compliance.** Safety-critical domains have mandated coverage standards: DO-178C requires MC/DC coverage at the highest assurance level (Level A) for aviation software; ISO 26262 requires MC/DC for ASIL-D automotive software; FDA medical device software guidance recommends MC/DC for high-risk software. Teams in these domains use coverage not because it is generically good but because the certification frameworks require it as evidence of test thoroughness.

    The cost of coverage strategy is real. Higher coverage criteria are more expensive to satisfy (MC/DC for a 10-condition Boolean requires up to 11 test cases instead of 2 for branch coverage). Coverage targets create Goodhart pressure that produces low-value tests. Coverage-as-gate slows development with tests-for-the-metric rather than tests-for-the-behavior. The discipline is using coverage strategically — as diagnostic signal, as floor enforcement at a level that requires real testing to meet, as input to risk-weighted test allocation — rather than as the success metric for the test suite.

    The deeper purpose of a coverage strategy is to make the test suite's blind spots legible. Every test suite has blind spots; the question is whether the team knows where they are. A coverage report does not tell the team whether their tests are good, but it tells them where the tests aren't, which is half of the picture and the half harder to see without measurement.
  boundary: |
    **Coverage is not test quality.** A test that calls every function and asserts nothing has 100% line coverage and verifies nothing. A test with assertions but with no execution path through the buggy line has 0% coverage of that line and would not catch the bug. Coverage measures *execution*, not *verification*. Treating coverage as a quality metric is the most common misuse of the measurement.

    **Coverage targets are not the goal.** The number is a side effect of writing good tests, not the success criterion for them. Goodhart's Law applies sharply here: pressure to hit a coverage number produces tests written for the metric (call this function, exercise this line) rather than tests written for the behavior (specify what this code should do). The result is a test suite that hits the target and degrades the codebase.

    **Branch coverage is not the same as decision coverage in all tools.** Some tools distinguish them (decision coverage requires each decision evaluated both ways; branch coverage requires each branch taken). Some tools conflate them. Read the tool's documentation to know what its number means; assuming the standard definition without verifying it produces miscalibrated targets.

    **MC/DC is not 'a stricter branch coverage'.** Modified Condition/Decision Coverage requires, for each Boolean condition in a decision, that the test suite demonstrates the condition independently affects the decision's outcome. For a decision `A && B && C`, MC/DC requires test cases showing that changing A alone changes the outcome (with B, C fixed), changing B alone changes the outcome, changing C alone changes the outcome — plus one all-true case. That's roughly N+1 cases for N conditions, where simple branch coverage needs only 2. The criteria are not interchangeable; they catch different defect classes.

    **Coverage measures the code, not the requirements.** A coverage report can tell you every line is reached; it cannot tell you whether the requirements are tested. A requirement that the code doesn't implement at all has zero coverage *and* zero implementation; the report says nothing about the missing implementation. Requirements traceability (DO-178C calls this "low-level requirements coverage") is a different discipline that pairs with code coverage.

    **High coverage in CI is not high coverage in production.** Coverage reports come from test executions. Production code paths exercised by users — error paths, edge cases, race conditions — may differ from test-exercised paths in ways the coverage report does not show. Production observability, not the test coverage report, measures what real users actually hit.

    **Coverage of dead code is meaningless.** If a function is never called in production but is exercised by a test, the coverage report counts it. Removing dead code can drop coverage without removing test value (the test was meaningless). Coverage and dead-code analysis must be read together.

    **Mutation testing is a different signal, not a coverage criterion.** Mutation testing measures whether the test suite would catch deliberately-introduced defects. It pairs with coverage but is not part of the coverage hierarchy. A codebase can have 100% branch coverage and 10% mutation score, meaning the tests reach everything and verify almost nothing.
  taxonomy: |
    By coverage criterion (in order of strictness; each higher subsumes lower):
    - **Function/method coverage** — was the function called at least once? Weakest; reveals only entirely-untested functions.
    - **Statement coverage** — was each statement executed at least once? Equivalent in most languages to line coverage.
    - **Line coverage** — was each source line executed at least once? Most common; default in most tools.
    - **Branch coverage** — was each branch (true and false outcome of each if/switch/loop) taken at least once? Catches missed else-branch bugs that line coverage doesn't.
    - **Decision coverage** — was each decision point evaluated to both true and false at least once? Similar to branch in most tools; distinct in stricter standards.
    - **Condition coverage** — was each Boolean sub-expression evaluated to both true and false at least once? Catches short-circuit-evaluation bugs.
    - **Condition/decision coverage (CDC)** — both condition coverage and decision coverage simultaneously.
    - **Modified Condition/Decision Coverage (MC/DC)** — was each condition shown to independently affect the decision's outcome? Required by DO-178C Level A (aviation), ISO 26262 ASIL-D (automotive). Roughly N+1 tests for N conditions.
    - **Multiple condition coverage** — were all combinations of conditions in a decision exercised? Combinatorial: 2^N tests for N conditions. Rarely required.
    - **Path coverage** — was every possible execution path through the function exercised? Combinatorial in loops; infeasible for non-trivial code.

    By how the coverage signal is used:
    - **Diagnostic (read-only)** — coverage is reported and reviewed; not enforced. Used to identify gaps and allocate test effort.
    - **Floor-gating** — a minimum coverage level required for the build to pass. Common; vulnerable to Goodhart pressure if set too high relative to natural coverage.
    - **Diff-based gating** — coverage must not regress on changed lines; new code must be covered above a threshold. More targeted than codebase-wide gating.
    - **Industry-mandated** — coverage criterion and level set by certification standard. Non-negotiable; the criterion is given.

    By coverage's role in the test-suite lifecycle:
    - **Coverage as developer feedback** — quick local report after running tests; the developer sees what they didn't cover. Lowest-cost use.
    - **Coverage as code-review input** — coverage diff shown on pull requests; reviewers see what changed in coverage. Common.
    - **Coverage as merge gate** — PR cannot merge if coverage drops or falls below threshold. Standard in many teams.
    - **Coverage as audit artifact** — historical coverage reports retained for compliance. Required in regulated industries.

    By relationship to other measurements:
    - **Coverage + mutation testing** — coverage as the structural signal; mutation as the behavioral signal. Complementary; together they characterize the test suite.
    - **Coverage + requirements traceability** — coverage of code; traceability of requirements to tests. Both required by DO-178C.
    - **Coverage + production observability** — coverage of tested paths; observability of production paths. The intersection (high coverage, high production hit-rate) is well-tested code; the union characterizes verification breadth.
  analogy: |
    A safety inspector walking through a building. The inspector's report says which rooms they entered (coverage). It does not say whether the rooms they entered had functioning smoke detectors, intact fire doors, unblocked exits (testing).

    A 100% line coverage report is an inspector who walked into every room. That's better than walking into half the rooms, but if the inspector entered every room without checking the smoke detectors, the building is no safer than one where the inspector skipped a few rooms but checked everything in the ones they entered. The structural signal (which rooms were entered) is real and useful but not the same as the behavioral signal (which safety features were verified).

    Branch coverage is the inspector who not only entered every room but tried both the regular entrance and the emergency exit from each. They saw both paths in and out. They still didn't check the smoke detectors. The structural signal got more thorough; the behavioral signal didn't change.

    MC/DC, for safety-critical buildings (hospitals, aircraft hangars, nuclear facilities), is the inspector who verified that each independently-required safety feature is independently functional — not just that the system as a whole passes one test, but that no single failure (one disabled smoke detector among many) goes unnoticed. This is more inspection work for the same building; for buildings where one failure can kill people, the work is justified.

    Goodhart's Law on coverage is the inspector who was told they would be paid by rooms entered. They entered every closet, every hallway alcove, every storage cupboard — and stopped checking smoke detectors entirely, because the metric measured doors opened, not safety features verified. The inspector's coverage number went up; the buildings became less safe.

    A coverage strategy is the discipline of running an inspection program where the rooms-entered count is one input the head office uses to find inspectors who skip rooms, but the actual safety judgment requires reading the inspector's notes on what they checked in each room. The strategy survives when the metric is read as floor signal (rooms not entered are definitely not inspected) rather than as ceiling target (rooms entered are necessarily inspected).
  misconception: |
    The most common misconception is that **higher coverage equals better tests**. It does not. Coverage measures execution, not verification. A test suite with 100% line coverage and no assertions has zero testing value; a test suite with 70% branch coverage and dense behavioral assertions has high testing value. The relationship between coverage and quality is necessary-not-sufficient: low coverage *does* mean some code is untested; high coverage *does not* mean the tested code is well-tested.

    The second misconception is that **100% coverage is the goal**. It is rarely the right goal. The marginal test required to cover the last 10% of lines is usually exercising defensive code, unreachable error branches, or hard-to-construct edge cases — and the test for that 10% is usually a low-quality test that exists to hit the metric. Most well-tested codebases settle in the 75-90% range with the gap consisting of code that the team has consciously chosen not to test (logging branches, exception messages, etc.).

    The third misconception is that **branch coverage is the same as decision coverage**. They are similar but distinct, and tools differ in which they report. Branch coverage requires every branch (true/false outcome of each conditional) to be taken. Decision coverage requires every decision (whole Boolean expression) to be evaluated both ways. For simple conditions they are the same; for compound conditions they can diverge. Read the tool's documentation; do not assume.

    The fourth misconception is that **MC/DC is just stricter branch coverage**. It is materially different. MC/DC requires evidence that each Boolean condition *independently* affects the decision's outcome — for a decision with N conditions, roughly N+1 test cases. Branch coverage needs only 2. MC/DC is required by DO-178C for aviation Level A software and ISO 26262 for ASIL-D automotive software *because* it catches defect classes that simple branch coverage misses, not because it is a tighter version of the same metric.

    The fifth misconception is that **coverage gates produce better test suites**. They produce *more* tests, not necessarily better ones. Goodhart's Law applies: when coverage is the gate, developers write tests that produce coverage. The resulting tests often exercise lines without verifying behavior, which adds maintenance burden without adding testing value. A team using coverage as a gate must set the gate at a level low enough that meeting it requires real testing rather than coverage-padding.

    The sixth misconception is that **coverage measures requirements coverage**. It does not. Coverage measures which code was executed by tests. A requirement that the code does not implement has zero coverage *and* zero implementation; the coverage report says nothing about the gap. Requirements traceability (the practice of linking requirements to the tests that verify them) is a separate discipline that pairs with code coverage in regulated environments.

    The seventh misconception is that **coverage from CI tests reflects production code paths**. It does not. Production code paths include error paths, edge cases, race conditions, and environmental variations that CI may not exercise. A line covered by tests is verified at test time; whether the production code path that hits that line is correct under production conditions is a different question. Production observability, not the coverage report, measures what production actually does.

    The eighth misconception is that **mutation testing is a coverage criterion**. It is not. Coverage criteria are structural measurements (did the test reach this code at this granularity). Mutation testing is a behavioral measurement (would the test suite catch a defect inserted here). They are complementary, both required for a confident test-suite characterization, but they live at different layers and the mutation score is not interchangeable with any coverage criterion.

    The ninth misconception is that **dropping coverage means the test suite got worse**. It does not necessarily. Dropping coverage *can* mean new code landed without tests, which is bad. It can also mean dead code was removed (lowering coverage % without lowering test value), a test was deleted because it was duplicative, or the codebase grew with planned-untested utility code. Coverage trends require interpretation; the number alone is not a verdict.
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
