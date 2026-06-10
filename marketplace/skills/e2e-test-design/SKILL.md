---
name: e2e-test-design
description: "Use when designing end-to-end tests that exercise a user-visible path through the whole system, including the UI layer: the user-journey unit-of-test that distinguishes e2e from integration testing, the five-primitive structure (user journey, environment, test data, observable assertion, recovery), why e2e tests are expensive and how to keep them few-and-load-bearing, the wait/synchronization discipline that makes them not-flaky, the page-object and trace-test patterns, the role of e2e tests in the test pyramid/trophy (the top tier — fewest in count but highest in coverage of user-observable behavior), and the modern e2e tool landscape (Playwright, Cypress, Selenium). Do NOT use for testing internal seams of the system (use integration-test-design), single-unit isolated tests (use testing-strategy + test-doubles-design), consumer-driven contract verification (use contract-testing), or visual regression of specific components (use snapshot-testing)."
license: MIT
allowed-tools: Read Grep
metadata:
  relations: "{\"related\":[\"test-driven-development\",\"testing-strategy\",\"integration-test-design\",\"snapshot-testing\",\"contract-testing\"],\"suppresses\":[\"integration-test-design\",\"testing-strategy\",\"contract-testing\",\"snapshot-testing\"],\"verify_with\":[\"testing-strategy\",\"integration-test-design\"]}"
  subject: quality-assurance
  public: "true"
  scope: "Use when designing end-to-end tests that exercise a user-visible path through the whole system, including the UI layer: the user-journey unit-of-test that distinguishes e2e from integration testing, the five-primitive structure (user journey, environment, test data, observable assertion, recovery), why e2e tests are expensive and how to keep them few-and-load-bearing, the wait/synchronization discipline that makes them not-flaky, the page-object and trace-test patterns, the role of e2e tests in the test pyramid/trophy (the top tier — fewest in count but highest in coverage of user-observable behavior), and the modern e2e tool landscape (Playwright, Cypress, Selenium). Do NOT use for testing internal seams of the system (use integration-test-design), single-unit isolated tests (use testing-strategy + test-doubles-design), consumer-driven contract verification (use contract-testing), or visual regression of specific components (use snapshot-testing)."
  taxonomy_domain: quality/testing
  stability: experimental
  keywords: "[\"end-to-end testing\",\"e2e test\",\"user journey test\",\"Playwright\",\"Cypress\",\"Selenium\",\"page object\",\"test flake\",\"wait strategy\",\"trace test\"]"
  triggers: "[\"do we need e2e tests\",\"the e2e tests are flaky\",\"Playwright vs Cypress\",\"how many e2e tests is too many\",\"page object pattern\"]"
  examples: "[\"design an e2e test suite for an onboarding journey: signup → email verify → first action\",\"decide which user journeys deserve e2e coverage vs integration-test coverage\",\"diagnose flaky e2e tests — usually wait-strategy or test-data problems\",\"explain why fewer e2e tests with higher load-bearing value beats many e2e tests with low value\"]"
  anti_examples: "[\"test internal seams of the system (use integration-test-design)\",\"test a single component in isolation (use testing-strategy + test-doubles-design)\",\"verify a service's contract against consumers (use contract-testing)\"]"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "An e2e test is to a software system what a flight rehearsal is to a launch — you do not certify a rocket by testing each bolt in a clean room (units), nor by firing each engine in isolation (integration), nor by writing a specification of what the avionics should do (contract); you certify it by performing the entire launch sequence, with real fuel, against a real flight plan, with the actual crew, and you do this rarely because each rehearsal costs millions and ten high-fidelity rehearsals tell you more than a thousand quick ones."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/quality-assurance/e2e-test-design/SKILL.md
---

# E2e Test Design

## Concept of the skill

End-to-end (e2e) test design is the discipline of designing tests that exercise a *complete user-visible path through the entire system* — UI, application layer, data layer, external integrations, and back. The *unit of test is the user journey*: a sequence of user actions and the observable outcomes the user experiences. E2e tests are the *highest-scope, smallest-count, slowest-per-test* tier of the test pyramid (Cohn 2009) or trophy (Dodds 2018) — by design, not by accident. *Five primitives*: (1) *user journey* — signup, checkout, primary creative action; a complete path that matters; (2) *environment* — production-like with real UI, real backend, real database, real message bus; recorded fakes only for paid or unavailable third parties; (3) *test data* — isolated per test, typically via per-test user accounts with unique IDs, with cleanup at test or suite end; (4) *observable assertion* — DOM elements visible, URL changes, key user-observable outcomes (what the user would see and say); (5) *wait/synchronization strategy* — wait-for-condition with generous timeouts; never hardcoded `sleep`; auto-waits in Playwright, retry-until-pass in Cypress.

Replaces "we tested all the units, surely the system works" with empirical evidence that the *assembled system* serves *real user tasks*. Solves the problem that no other test tier can provide that evidence — unit tests verify units in isolation, integration tests verify seams between units, contract tests verify service boundaries; none of them verify "the user can complete signup, see the welcome screen, click the first action, and have it work." E2e tests are the only tier that exercises the actual rendered UI in a real browser against a real backend with real database queries and real third-party integrations (or carefully-recorded fakes). The discipline is making each e2e test *load-bearing*: covers a journey that matters; asserts outcomes that prove the system works for users; runs reliably with near-zero flake. A team with one hundred low-value flaky e2e tests is worse off than a team with ten high-value reliable e2e tests — because *trust in the suite*, the willingness to take a red build as evidence of a real bug, is the suite's value. Modern infrastructure (Playwright's trace viewer, per-test parallelism, video capture on failure, recorded third-party fakes, parallel CI execution) has shifted the cost down enough to make a load-bearing e2e suite practical.

Distinct from testing-strategy, which owns the strategic ratio of test levels — this skill owns the *design of the e2e tier specifically*: the smallest tier in the pyramid/trophy, the most expensive per test, the most user-meaningful per test. Distinct from integration-test-design, which owns tests of *internal seams* between units — this skill owns user-journey tests through the *whole stack including UI*; the cost difference is an order of magnitude, and conflating them either inflates CI cost or misses real e2e coverage. Distinct from contract-testing, which verifies the interface between consumer and provider via consumer-driven contracts — contract tests *replace* e2e tests across service boundaries when the journey is service-to-service; e2e is for journeys *with humans at one end*. Distinct from snapshot-testing — visual snapshot tests compose *inside* e2e tests as a regression net for UI changes the journey assertions don't catch. Distinct from mutation-testing (test-suite quality measurement applied at any level — this skill is the e2e tier's design itself). Distinct from test-driven-development (TDD prescribes red-green-refactor at unit scope; e2e tests typically don't drive TDD because they are too slow for the cycle). An e2e test is to a software system what a flight rehearsal is to a launch — you do not certify a rocket by testing each bolt in a clean room (units), nor by firing each engine in isolation (integration), nor by writing a specification of what the avionics should do (contract); you certify it by performing the entire launch sequence, with real fuel, against a real flight plan, with the actual crew, and you do this rarely because each rehearsal costs millions and ten high-fidelity rehearsals tell you more than a thousand quick ones. The wrong mental model is that *more e2e tests are always better* — "we have ninety-three e2e tests covering every page" as a measure of test quality. They are not, and ninety-three is usually too many. Adjacent misconceptions: that flake is normal and acceptable (it is not — flake's primary cause is bad synchronization, and the discipline is wait-for-condition everywhere with generous timeouts; `sleep(2)` followed by an assertion is the prototype anti-pattern, replaced by `await expect(elem).toBeVisible({ timeout: 10_000 })` which auto-retries until match); that auto-update or auto-retry of flaky tests is a fix (it is not — retried-and-ignored flake destroys trust in the suite; a persistent flake is a *bug in the test design* — shared mutable state, ordering dependency, time-of-day dependency, race condition — to be diagnosed, not accepted); that shared test data is efficient (it is not — the most common test-data strategy in production e2e suites is *per-test data with unique IDs*; shared mutable state is the flake source); that an "e2e test" of clicking one button is e2e (it is not — that is a unit or integration test; e2e is a *complete user journey*: signup → email verify → first action, not "click the save button"); that whole-page snapshot diffs are e2e tests (they are not — snapshot is a regression net that composes inside e2e tests); and that adding e2e tests is the right response to bug pressure (it usually is not — most bugs that escape lower tiers should be caught by improving those tiers; Google's "Just say no to more end-to-end tests" essay is the industrial reference for why this intuition is wrong).

## Coverage

The discipline of designing tests that exercise a complete user-visible path through the entire system — UI, application, data, third parties, and back — with the user journey as the unit of test. Covers the five primitives (journey, environment, test data, observable assertion, wait strategy), the pyramid/trophy position (top tier, fewest tests, highest cost, highest user-meaningful coverage), the test-data strategies that determine isolation and flake rate, the wait-for-condition synchronization discipline that prevents flake, the framework landscape (Playwright, Cypress, Selenium, Puppeteer), and the cost-and-count trade-off that distinguishes good e2e suites from over-investment.

## Philosophy of the skill
E2e tests are the smallest tier of the test suite by count and the largest by individual cost. They are the evidence that the *assembled system* works for *real users*; nothing else in the test suite provides that evidence. They are also the most expensive tests to write, run, and maintain.

The discipline is making each e2e test *load-bearing*: covers a journey that matters; asserts outcomes that prove the system works for users; runs reliably with near-zero flake. A team with one hundred low-value flaky e2e tests is worse off than a team with ten high-value reliable e2e tests, because trust in the suite — the willingness to take a red build as evidence of a real bug — is the suite's value.

The right e2e count is much lower than most teams intuit. The pyramid/trophy framings put e2e at the top — fewest tests, by design. Teams that grow e2e suites to hundreds of tests usually have many tests that should be integration tests; the discipline is reversing that drift.

## What An E2e Test Looks Like

| Component | Detail |
|---|---|
| Scope | A complete user journey (signup, checkout, primary creative action) |
| Environment | Production-like; all real components, recorded fakes for paid third parties |
| Stack | Full UI, application, database, message bus, file storage |
| Test data | Isolated per test, typically via per-test user accounts with unique IDs |
| Assertions | DOM elements visible, URL changes, key user-observable outcomes |
| Wait strategy | Wait-for-condition with generous timeouts; never hardcoded delays |
| Diagnostics | Screenshot on failure, video capture, trace viewer for replay |
| Runtime | Seconds to tens of seconds per test |
| Suite size | 10-50 critical-path; 50-200 for broader regression |
| Suite runtime | Under 30 minutes total via parallelization |

## The Wait-Strategy Discipline

E2e flake's primary cause is bad synchronization. The discipline:

| Anti-pattern | Pattern |
|---|---|
| `page.click('button'); sleep(2); expect(elem).toBeVisible()` | `page.click('button'); await expect(elem).toBeVisible()` (auto-waits up to timeout) |
| `sleep(5); expect(toast).toBe('Saved')` | `await expect(toast).toBe('Saved', { timeout: 10_000 })` (retries until match) |
| `page.click('a'); sleep(3); page.click('next')` | `page.click('a'); await page.waitForURL(/expected/); page.click('next')` |
| Hardcoded delay for network call | `await page.waitForResponse(predicate)` |
| Hardcoded delay for animation | Animation-aware wait or disable animations in test config |

Playwright, Cypress, and Selenium all support wait-for-condition. The discipline is using it everywhere instead of `sleep`.

## Test-Data Strategy Comparison

| Strategy | Speed | Isolation | Best for |
|---|---|---|---|
| Fresh environment per test | Slowest | Strongest | Highest-stakes journeys; very few tests |
| Per-test data with unique IDs | Fast | Strong | Most production e2e suites |
| Fixture seed + per-user partition | Fast | Strong (if partition discipline holds) | Suites with shared lookup data |
| Shared snapshot, read-only discipline | Fastest | Relies on discipline | Pure read flows; rare |

Per-test data with unique IDs is the working standard. Each test creates the users, orders, or whatever entities it needs, with IDs that don't collide with other tests. Cleanup happens at test end or suite end.

## Framework Selection

| Framework | Strengths | Weaknesses | Best fit |
|---|---|---|---|
| Playwright | Modern, fast, multi-browser, auto-waiting, trace viewer | Newer ecosystem, smaller community than Selenium | New projects; recommended default |
| Cypress | Excellent DX, retry-until-pass, in-browser test execution | Chromium-family focused, iframe and tab handling awkward | Developer-experience-focused teams |
| Selenium WebDriver | Largest ecosystem, cross-language, every browser | Slower, more boilerplate, more flake-prone without careful setup | Large enterprise / legacy / cross-browser-matrix |
| Puppeteer | Lower-level Chrome API | Chromium-only, less abstraction | Lower-level scripting and scraping |
| Detox / Appium / Maestro | Mobile-native | Mobile-only | Mobile app e2e |

## Verification

After applying this skill, verify:
- [ ] Every e2e test covers a complete user journey, not a UI interaction in isolation. "Click this button" is not an e2e test; "complete signup" is.
- [ ] The test environment is production-like: real UI, real backend, real database, real message bus. Recorded fakes are used only for paid or unavailable third parties.
- [ ] Wait strategy is wait-for-condition with generous timeouts everywhere. No hardcoded `sleep` calls.
- [ ] Test data is isolated per test (per-test user accounts with unique IDs, or per-test data with cleanup). Shared mutable state is the flake source.
- [ ] Each e2e test has a clear load-bearing reason for existing — names a journey that matters, asserts an outcome that would not be caught by a lower-tier test.
- [ ] Suite size and runtime are tracked. Suites trending toward 500+ tests or 30+ minutes are diagnosed; many should be lower-tier tests.
- [ ] Flake rate is monitored and held near zero. Flaky tests are diagnosed and fixed, not retried-and-ignored.
- [ ] Failure diagnostics (screenshot, video, trace) are configured so that test failures are debuggable from the CI artifacts.
- [ ] E2e tests run on every PR (critical-path subset) and on every merge or nightly (broader regression). They are not the primary test for behaviors lower-tier tests can verify.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Testing an internal seam between modules | `integration-test-design` | integration tests are cheaper and faster for non-user-journey verification |
| Testing a single unit in isolation | `testing-strategy` + `test-doubles-design` | unit-scope is much cheaper for implementation-detail verification |
| Verifying a service-to-service contract | `contract-testing` | contract tests are more targeted than e2e for service-boundary verification |
| Visual regression of a specific component | `snapshot-testing` | snapshot is cheaper and more targeted than e2e for visual regression |
| Choosing the ratio of test levels | `testing-strategy` | strategy owns ratios; this skill owns e2e-tier design |
| Measuring whether the test suite catches defects | `mutation-testing` | mutation is the test-suite quality signal; this skill is e2e tier design |

## Key Sources

- Cohn, M. (2009). *Succeeding with Agile: Software Development Using Scrum*. The test pyramid framing places e2e at the top tier; canonical reference for why e2e count should be small.
- Fowler, M. (2012). ["The Practical Test Pyramid"](https://martinfowler.com/articles/practical-test-pyramid.html). Practitioner essay on the pyramid; sections on UI/e2e tests' cost-benefit profile.
- Dodds, K. C. (2018). ["The Testing Trophy and Testing Classifications"](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications). Alternative framing that retains e2e at the top tier with similar cost-and-count reasoning.
- Microsoft / Playwright Team. ["Playwright — Documentation"](https://playwright.dev/docs/intro). Canonical reference for the modern multi-browser e2e framework; includes the auto-waiting and trace-viewer discipline.
- Cypress.io. ["Cypress — Documentation"](https://docs.cypress.io/). Canonical reference for the Cypress framework; includes the retry-until-pass assertion model and the in-browser test execution architecture.
- Selenium Project. ["Selenium WebDriver — Documentation"](https://www.selenium.dev/documentation/webdriver/). The canonical cross-language WebDriver protocol reference; foundation for many derived tools.
- Meszaros, G. (2007). *xUnit Test Patterns: Refactoring Test Code*. Catalog includes e2e-relevant patterns for test data lifecycle, shared fixtures, and test independence.
- Fowler, M. ["Page Object"](https://martinfowler.com/bliki/PageObject.html). The canonical reference for the page-object pattern; useful for organizing large e2e suites.
- Google Testing Blog. ["Testing on the Toilet — Just say no to more end-to-end tests"](https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html). Industrial perspective on why more e2e tests is usually the wrong response to bug pressure.
- North, D. ["BDD as Outside-In Development"](https://dannorth.net/introducing-bdd/). Adjacent thread: BDD's outside-in style produces user-journey-scope tests at the outermost layer, conceptually aligned with e2e.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `quality-assurance`
- Public: `true`
- Domain: `quality/testing`
- Scope: Use when designing end-to-end tests that exercise a user-visible path through the whole system, including the UI layer: the user-journey unit-of-test that distinguishes e2e from integration testing, the five-primitive structure (user journey, environment, test data, observable assertion, recovery), why e2e tests are expensive and how to keep them few-and-load-bearing, the wait/synchronization discipline that makes them not-flaky, the page-object and trace-test patterns, the role of e2e tests in the test pyramid/trophy (the top tier — fewest in count but highest in coverage of user-observable behavior), and the modern e2e tool landscape (Playwright, Cypress, Selenium). Do NOT use for testing internal seams of the system (use integration-test-design), single-unit isolated tests (use testing-strategy + test-doubles-design), consumer-driven contract verification (use contract-testing), or visual regression of specific components (use snapshot-testing).

**When to use**
- design an e2e test suite for an onboarding journey: signup → email verify → first action
- decide which user journeys deserve e2e coverage vs integration-test coverage
- diagnose flaky e2e tests — usually wait-strategy or test-data problems
- explain why fewer e2e tests with higher load-bearing value beats many e2e tests with low value
- Triggers: `do we need e2e tests`, `the e2e tests are flaky`, `Playwright vs Cypress`, `how many e2e tests is too many`, `page object pattern`

**Not for**
- test internal seams of the system (use integration-test-design)
- test a single component in isolation (use testing-strategy + test-doubles-design)
- verify a service's contract against consumers (use contract-testing)

**Related skills**
- Verify with: `testing-strategy`, `integration-test-design`
- Related: `test-driven-development`, `testing-strategy`, `integration-test-design`, `snapshot-testing`, `contract-testing`

**Concept**
- Mental model: |
- Purpose: |
- Analogy: An e2e test is to a software system what a flight rehearsal is to a launch — you do not certify a rocket by testing each bolt in a clean room (units), nor by firing each engine in isolation (integration), nor by writing a specification of what the avionics should do (contract); you certify it by performing the entire launch sequence, with real fuel, against a real flight plan, with the actual crew, and you do this rarely because each rehearsal costs millions and ten high-fidelity rehearsals tell you more than a thousand quick ones.
- Common misconception: |

**Keywords**
- `end-to-end testing`, `e2e test`, `user journey test`, `Playwright`, `Cypress`, `Selenium`, `page object`, `test flake`, `wait strategy`, `trace test`

<!-- skill-graph-context:end -->
