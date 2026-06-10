---
name: testing-strategy
description: "Use when planning tests for a bug fix, feature, or refactor — deciding what deserves a test, at which level, with what evidence. Covers test-scope decisions, test-level selection (unit / integration / contract / e2e), effort-to-risk matching, regression targeting, evidence quality, and failure-case coverage. Do NOT use for chasing a known failure (that is `debugging`), for pure doc writing (that is `documentation`), or for conceptual architecture discussion with no verification target (no dedicated skill — treat as strategy, not testing). Do NOT use for my existing test is failing — why? Do NOT use for write a testing-patterns guide for the contributor docs. Do NOT use for clean up this duplicated test setup across three files."
license: MIT
compatibility: "Markdown, Git, any codebase"
allowed-tools: Read Grep Bash
metadata:
  relations: "{\"related\":[\"microcopy\",\"middleware-patterns\",\"debugging\",\"refactor\",\"test-coverage-strategy\",\"integration-test-design\",\"contract-testing\",\"e2e-test-design\"],\"suppresses\":[\"integration-test-design\",\"performance-engineering\"],\"verify_with\":[\"debugging\",\"contract-testing\",\"test-coverage-strategy\",\"integration-test-design\",\"e2e-test-design\"],\"depends_on\":[\"refactor\"]}"
  subject: quality-assurance
  scope: "Portable test-scope and test-level decision-making for software changes: choosing what behavior or regression target deserves verification, selecting unit, integration, contract, or end-to-end evidence by risk and coupling, and avoiding tests whose maintenance cost exceeds their failure signal. Excludes root-cause debugging of active failures, implementation mechanics for a chosen test type, documentation writing, and architecture discussion without a concrete verification target."
  public: "true"
  taxonomy_domain: quality/testing-strategy
  stability: experimental
  keywords: "[\"testing strategy\",\"what to test\",\"test level selection\",\"test scope\",\"effort vs risk\",\"regression target\",\"failure case coverage\",\"unit integration contract e2e\",\"test plan\",\"verification evidence\"]"
  triggers: "[\"testing-skill\"]"
  examples: "[\"do I need a unit test for this pure formatter or is integration enough?\",\"what's the right test level for a webhook handler that talks to Stripe?\",\"the feature passes manual QA — does it need an automated test?\",\"pin this regression so the same bug can't slip through again\"]"
  anti_examples: "[\"my existing test is failing — why?\",\"write a testing-patterns guide for the contributor docs\",\"clean up this duplicated test setup across three files\"]"
  grounding: "{\"subject_matter\":\"Test-scope and test-level selection for software changes\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://martinfowler.com/articles/practical-test-pyramid.html\",\"https://testing.googleblog.com/2010/12/test-sizes.html\",\"https://playwright.dev/docs/best-practices\",\"https://docs.pact.io/getting_started/how_pact_works\"],\"failure_modes\":[\"test_level_selected_by_file_type_not_risk\",\"mocked_unit_test_hides_cross_boundary_regression\",\"end_to_end_suite_expands_until_slow_and_flaky\",\"coverage_percentage_replaces_behavior_target\",\"production_regression_pinned_at_wrong_level\"],\"evidence_priority\":\"equal\"}"
  mental_model: "Testing strategy is the choice of verification target, test level, and evidence quality for a specific change. Its primitives are the behavior or regression target, the risk of failure, the coupling boundary that could hide the bug, the cheapest test level that can observe the behavior honestly, the expected failure signal, and the maintenance cost the suite will carry afterward."
  purpose: "Test suites become expensive when they chase coverage percentage, duplicate low-risk paths, or mock away the boundary that can actually fail. This skill exists to spend verification effort where it can prevent real regressions, while avoiding tests that will never produce useful signal."
  concept_boundary: "This skill owns the decision about what behavior to test and at which level for a planned change or regression target. It does not own root-cause debugging of a failing test, detailed implementation patterns for one chosen test type, documentation writing, performance-load verification, or architecture strategy without a concrete verification target."
  analogy: "A test strategy is placing sensors in a system: each sensor should sit where a meaningful failure can be observed with the least noise and maintenance cost."
  misconception: "The common mistake is choosing tests by edited file type or coverage percentage. The better choice starts from the behavior that could regress, then selects the cheapest level that can observe that failure without mocking it away."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/quality-assurance/testing-strategy/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

## Concept of the skill

**What it is:** Testing strategy is the discipline of choosing which behavior needs verification, which test level can observe it honestly, and what evidence proves the change is protected.

**Mental model:** A strategy decision has six parts: the behavior or regression target, the risk of failure, the boundary where the failure would appear, the cheapest test level that still observes that boundary, the expected failure signal, and the future maintenance cost of keeping the test.

**Why it exists:** Test suites fail when they optimize for visible effort instead of useful signal. They add tests that never catch regressions, mock the only boundary that could fail, or expand end-to-end coverage until feedback becomes slow and flaky. This skill keeps verification effort tied to production risk.

**What it is NOT:** It is not debugging an active failing test, implementing integration-test fixtures, designing contract-test provider states, writing contributor documentation, performance-load testing, or architecture planning without a concrete verification target.

**Adjacent concepts:** Test coverage strategy, integration test design, contract testing, end-to-end test design, debugging, refactor verification, performance engineering, and code review.

**One-line analogy:** A test strategy is placing sensors in a system: each sensor should sit where a meaningful failure can be observed with the least noise and maintenance cost.

**Common misconception:** Coverage percentage or the edited file type does not decide the right test. The behavior that could regress decides the target, and the cheapest honest observation point decides the level.

# Testing Strategy

## Coverage

- Test scope: deciding what behavior actually needs a test, and what does not earn the maintenance cost
- Test level selection: choosing between unit, integration, contract, and end-to-end tests based on risk and coupling
- Effort-to-risk matching: investing verification effort where regressions are most likely and most damaging
- Regression targeting: writing tests that pin the specific behavior a change risks breaking, not generic coverage
- Evidence quality: preferring concrete, reproducible verification over assumed or manual checks
- Failure-case coverage: ensuring boundary conditions and error paths are tested, not only the happy path

## Philosophy of the skill

Most test suites fail the effort-to-risk test: they exercise code that will never break and skip code that breaks in production. The correct target is the behavior that ships to users, not the code you happen to have written last. Coverage percentage is a proxy, and every proxy eventually gets gamed — the real signal is regressions caught before release. A test that never fails is noise; a test that fails without isolating the cause is worse than no test at all because it wastes the next engineer's time.

## Test-Level Selection

Pick the test level by the risk of the change and the coupling of the behavior, not by the file you happen to be editing. Unit tests are cheap to write and cheap to pass; integration and contract tests are where real production bugs are actually caught.

| Situation | Test level | Why |
|---|---|---|
| Pure function, single-owner, no I/O | **Unit** | Fast, deterministic, zero setup. If you cannot unit-test it, the function is doing too much |
| Logic that composes multiple units inside one service | **Integration** (in-process) | Unit tests of each piece will miss composition bugs; integration test catches real wiring |
| Behavior that crosses a service / process / network boundary | **Contract** | Both sides need a shared verifiable agreement; a unit test on either side misses the real failure mode |
| User-visible flow end-to-end | **E2E** (one or two per critical path) | Proves the full path works at least once; too expensive to run for every code path |
| Bug fix for a bug that reached production | **Regression** at the level where the bug slipped through | If it slipped past unit tests, a unit test won't catch it next time; write the test at the level the bug exposed |
| Behavior that is "obviously correct," unchanged for a year, no external pressure | **No new test** | The test would never fail; it would only add maintenance cost. Every test is a liability until it catches a bug |

### Level-selection anti-patterns

- **Unit testing what should be an integration test** — mocking the only thing that could actually break. Fix: test the real integration, or admit the unit test proves nothing.
- **Integration testing what should be a unit test** — slow setup for a function that has no dependencies. Fix: extract the pure logic and unit-test it.
- **E2E-testing every code path** — fragile, slow, flaky. Fix: one E2E per critical user journey, unit/integration for the rest.
- **Adding a test because coverage dropped** — test has no regression target and never fails meaningfully. Fix: either find a real regression to pin, or delete the uncovered code if it has no value.

## Evals

This skill ships local eval artifacts at `skills/skills/quality-assurance/testing-strategy/evals/comprehension.json` and `skills/skills/quality-assurance/testing-strategy/evals/application.json`. The `Verification` checklist below is the authoring gate for a completed test plan; the eval files are audit-loop evidence for whether the concept can be understood and applied. Do not conflate them — the checklist is for the test author, the evals are for the grader.

## Verification

- [ ] The test type matches the change risk
- [ ] A behavior or regression target is explicit
- [ ] Verification evidence is concrete, not assumed
- [ ] Failure cases and boundaries are covered, not only the happy path

## Do NOT Use When

| Use instead | When |
|---|---|
| `documentation` | The task structures explanation for a reader, not verification for a change |
| `debugging` | The task is chasing a known failure — strategy is planned before the failure, not after |
| `refactor` | The task is restructuring code; any test work is to preserve existing behavior, which belongs to the refactor skill's verification step |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `quality-assurance`
- Public: `true`
- Domain: `quality/testing-strategy`
- Scope: Portable test-scope and test-level decision-making for software changes: choosing what behavior or regression target deserves verification, selecting unit, integration, contract, or end-to-end evidence by risk and coupling, and avoiding tests whose maintenance cost exceeds their failure signal. Excludes root-cause debugging of active failures, implementation mechanics for a chosen test type, documentation writing, and architecture discussion without a concrete verification target.

**When to use**
- do I need a unit test for this pure formatter or is integration enough?
- what's the right test level for a webhook handler that talks to Stripe?
- the feature passes manual QA — does it need an automated test?
- pin this regression so the same bug can't slip through again
- Triggers: `testing-skill`

**Not for**
- my existing test is failing — why?
- write a testing-patterns guide for the contributor docs
- clean up this duplicated test setup across three files

**Related skills**
- Depends on: `refactor`
- Verify with: `debugging`, `contract-testing`, `test-coverage-strategy`, `integration-test-design`, `e2e-test-design`
- Related: `microcopy`, `middleware-patterns`, `debugging`, `refactor`, `test-coverage-strategy`, `integration-test-design`, `contract-testing`, `e2e-test-design`

**Concept**
- Mental model: Testing strategy is the choice of verification target, test level, and evidence quality for a specific change. Its primitives are the behavior or regression target, the risk of failure, the coupling boundary that could hide the bug, the cheapest test level that can observe the behavior honestly, the expected failure signal, and the maintenance cost the suite will carry afterward.
- Purpose: Test suites become expensive when they chase coverage percentage, duplicate low-risk paths, or mock away the boundary that can actually fail. This skill exists to spend verification effort where it can prevent real regressions, while avoiding tests that will never produce useful signal.
- Analogy: A test strategy is placing sensors in a system: each sensor should sit where a meaningful failure can be observed with the least noise and maintenance cost.
- Common misconception: The common mistake is choosing tests by edited file type or coverage percentage. The better choice starts from the behavior that could regress, then selects the cheapest level that can observe that failure without mocking it away.

**Grounding**
- Mode: `universal`
- Truth sources: `https://martinfowler.com/articles/practical-test-pyramid.html`, `https://testing.googleblog.com/2010/12/test-sizes.html`, `https://playwright.dev/docs/best-practices`, `https://docs.pact.io/getting_started/how_pact_works`

**Keywords**
- `testing strategy`, `what to test`, `test level selection`, `test scope`, `effort vs risk`, `regression target`, `failure case coverage`, `unit integration contract e2e`, `test plan`, `verification evidence`

<!-- skill-graph-context:end -->
