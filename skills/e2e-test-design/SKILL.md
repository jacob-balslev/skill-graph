---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: e2e-test-design
description: "Use when designing end-to-end tests that exercise a user-visible path through the whole system, including the UI layer: the user-journey unit-of-test that distinguishes e2e from integration testing, the five-primitive structure (user journey, environment, test data, observable assertion, recovery), why e2e tests are expensive and how to keep them few-and-load-bearing, the wait/synchronization discipline that makes them not-flaky, the page-object and trace-test patterns, the role of e2e tests in the test pyramid/trophy (the top tier — fewest in count but highest in coverage of user-observable behavior), and the modern e2e tool landscape (Playwright, Cypress, Selenium). Do NOT use for testing internal seams of the system (use integration-test-design), single-unit isolated tests (use testing-strategy + test-doubles-design), consumer-driven contract verification (use contract-testing), or visual regression of specific components (use snapshot-testing)."
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
  - end-to-end testing
  - e2e test
  - user journey test
  - Playwright
  - Cypress
  - Selenium
  - page object
  - test flake
  - wait strategy
  - trace test
  - smoke test
triggers:
  - "do we need e2e tests"
  - "the e2e tests are flaky"
  - "Playwright vs Cypress"
  - "how many e2e tests is too many"
  - "page object pattern"
examples:
  - "design an e2e test suite for an onboarding journey: signup → email verify → first action"
  - "decide which user journeys deserve e2e coverage vs integration-test coverage"
  - "diagnose flaky e2e tests — usually wait-strategy or test-data problems"
  - "explain why fewer e2e tests with higher load-bearing value beats many e2e tests with low value"
anti_examples:
  - "test internal seams of the system (use integration-test-design)"
  - "test a single component in isolation (use testing-strategy + test-doubles-design)"
  - "verify a service's contract against consumers (use contract-testing)"
relations:
  related:
    - testing-strategy
    - integration-test-design
    - snapshot-testing
    - test-driven-development
    - contract-testing
  boundary:
    - skill: testing-strategy
      reason: "testing-strategy owns the strategic ratio of test levels; this skill owns the design of the e2e tier specifically — the smallest tier in the pyramid/trophy, the most expensive per test, the most user-meaningful per test."
    - skill: integration-test-design
      reason: "integration-test-design owns tests of internal seams between units; this skill owns user-journey tests through the whole stack including UI. The cost difference is an order of magnitude; conflating them either inflates CI cost or misses real e2e coverage."
    - skill: contract-testing
      reason: "contract-testing verifies the interface between consumer and provider via consumer-driven contracts; this skill verifies the user-journey behavior end-to-end. Contracts replace e2e tests across service boundaries when the journey is service-to-service; e2e is for journeys with humans at one end."
    - skill: snapshot-testing
      reason: "Visual snapshot tests are a regression net at e2e or component scope; this skill owns the user-journey behavior end-to-end. They compose: visual snapshots within e2e tests catch UI changes the journey assertions don't."
  verify_with:
    - testing-strategy
    - integration-test-design
concept:
  definition: "End-to-end (e2e) test design is the discipline of designing tests that exercise a complete user-visible path through the entire system — the UI, the application layer, the data layer, external integrations, and back. The unit of test is the *user journey*: a sequence of user actions and the observable outcomes the user experiences. E2e tests are the highest-scope tier of the test pyramid (or trophy) — the fewest in count, the slowest per test, the most user-meaningful per test. Their value is the confidence that the system, assembled, works for a real user task; their cost is real and growing with the system's complexity. The discipline of e2e test design is keeping the count small enough that the cost stays manageable while keeping the coverage broad enough that the tests are load-bearing evidence the system works for users."
  mental_model: |
    Five primitives structure e2e test design:

    1. **User journey** — a sequence of user actions and observable outcomes that constitutes a real-task path through the system. A signup-and-onboarding journey: open the app, click signup, enter email, receive and click the verification link, complete the profile, see the dashboard. A checkout journey: add to cart, enter shipping, enter payment, confirm, see the order-confirmation. The journey is the unit of test; an e2e test verifies *that the user can complete the journey successfully* and *that observable outcomes match expectations at each step*.

    2. **Environment** — the complete system the e2e test runs against. May be a local docker-compose stack, a staging environment shared with humans, an ephemeral preview environment per PR, or a production-like environment dedicated to e2e tests. The environment must include every real piece the journey touches (UI, application, database, message bus, third-party integrations or their faked equivalents). Environment fidelity to production is the e2e test's reliability signal — a test that passes in a stack different from production proves only that the test stack works.

    3. **Test data** — the data state the journey starts from. The hardest engineering problem in e2e testing. Options: spin up a fresh environment per test (slow but isolated); seed the environment with a known fixture set (fast but tests interfere with each other); each test creates its own data with unique identifiers and cleans up (parallelism-friendly but adds setup complexity); shared environment with test data partitioned by user account or tenant (fast and parallel but requires partition discipline). The wrong test-data strategy is the source of most e2e flakiness.

    4. **Observable assertion** — the check the test performs at each step. E2e tests assert on what the user can observe: page content, element presence, element text, URL changes, network responses the user-agent sees. They do *not* assert on internal state directly (no peeking at the database, no peeking at the in-memory state of the application) because the user can't see those. The observable-only constraint is what makes the test an e2e test rather than a slow integration test.

    5. **Recovery and synchronization (wait strategy)** — how the test handles the fact that the system is asynchronous. Page loads, network calls, state transitions, animations all take time. A naive e2e test with hard-coded delays (`sleep(2)`) is flaky by construction — sometimes 2 seconds is enough, sometimes it isn't. The discipline is *wait-for-condition*: the test asserts the desired state by polling or by event-driven signal, with a generous timeout, until the condition holds or the timeout expires. Playwright's auto-waiting, Cypress's retry-until-pass assertions, and Selenium WebDriverWait are different framework expressions of the same principle.

    The deep insight is that **e2e tests are the smallest tier of the test suite by count and the largest tier by individual cost**. The cost is real and growing — each e2e test takes seconds to tens of seconds; the suite takes tens of minutes to hours; flakes destroy team trust. The discipline is making each e2e test *load-bearing*: covering a journey that matters, asserting outcomes that prove the system works for users, with reliability infrastructure that keeps the flake rate near zero. A team with one hundred low-value flaky e2e tests is worse off than a team with ten high-value reliable e2e tests.

    The complementary insight is that **e2e tests are not the place to specify behavior in detail**. The detailed behavioral specification belongs in unit and integration tests where the cost is low and the assertions are precise. E2e tests verify *that the journey completes* and *that key user-visible outcomes occur*; they do not verify every intermediate state. A team that uses e2e tests as the primary specification of behavior produces a slow, flaky, expensive suite that still misses real bugs.
  purpose: |
    E2e testing exists because unit tests and integration tests, by construction, cannot verify that the system works for users.

    **The composition gap.** Unit tests verify units; integration tests verify boundaries. Neither verifies the *entire assembled system*. A bug that exists only in the assembly — a misconfigured environment variable in staging, a CDN cache that serves a stale asset, a CSP header that breaks a third-party script, a database migration that's been applied to staging but not production — is invisible at all lower test tiers. The e2e test exercises the assembly.

    **The user-perspective gap.** Unit and integration tests assert on internal observables (function returns, database states, API responses). The user observes a different surface: rendered pages, visible elements, clickable buttons, URLs in the browser. A bug that exists only in the rendered surface — a button that's correctly wired but hidden by a stacking-context bug, a form that submits correctly but doesn't show a success message, a page that loads correctly but with a JS error that breaks interactivity — is invisible to internal tests. The e2e test exercises the user's actual surface.

    **The production-like-environment gap.** Unit and integration tests usually run against a stripped-down environment (in-memory database, mocked third parties, no CDN, no auth provider, no email delivery). The production environment has all of these. Bugs that emerge from the production stack — cold-start latency exceeding a timeout, a third-party API behaving differently than its fake, a CDN routing the wrong assets — are invisible to lower-tier tests. The e2e test in a production-like environment exercises the stack.

    There is a fourth purpose: documentation. An e2e test for the signup journey is also executable documentation of how the system supports signup. A new team member can read the e2e test and learn the user journey; a designer can read the e2e test and verify the user flow. This documentary value is real but secondary to the verification value.

    The cost of e2e testing is significant and well-documented. Each test is slow (seconds to tens of seconds). The suite is slow (tens of minutes to hours, parallelizable but still expensive). Tests are flaky (the more real the environment, the more real the failure modes). Tests are expensive to write (page-object setup, test-data engineering, environment management) and to maintain (UI changes break tests, journey changes require test updates). Test infrastructure (CI runners, parallel execution, video capture for flake diagnosis, screenshots for visual diff) is a real engineering investment.

    The discipline of e2e test design is making the investment worthwhile by being deliberate about *count, scope, and reliability*:
    - **Count.** Few enough that the suite stays under (e.g.) 30 minutes of CI time. Most teams target 10-50 critical-path e2e tests, not 500.
    - **Scope.** Each test covers a user-meaningful journey, not a UI interaction in isolation. "Click this button" is not a journey; "complete signup" is.
    - **Reliability.** Wait strategies are condition-based, not delay-based. Test data is isolated per test. Environments are reproducible. Flake rate is monitored and held near zero.

    The deeper purpose of e2e testing is to give the team the empirical evidence that *the system works for users*. Unit-test green is necessary; integration-test green is necessary; e2e-test green for the critical journeys is the evidence that the assembled system does what the team thinks it does for the people who use it.
  boundary: |
    **E2e tests are not integration tests.** Integration tests exercise an internal seam between units; e2e tests exercise a user-visible journey through the whole stack including the UI. The cost difference is an order of magnitude. Conflating them either inflates CI cost (treating internal-seam tests as full e2e) or misses real e2e coverage (treating integration tests as sufficient for user-visible verification).

    **E2e tests are not unit tests with more steps.** An e2e test that walks through a UI with the rest of the stack mocked is a slow unit test, not an e2e test. The full real stack — real backend, real database, real third-party fakes recorded against the real API — is what makes the test e2e. A team that mocks the backend in e2e tests has bought e2e's cost without its verification value.

    **E2e tests are not the place for fine-grained assertions.** A test that asserts on every detail of every page during a journey is over-specifying. The bugs at the e2e level are usually "the journey doesn't work" or "an end-state outcome is wrong"; the bugs at the per-step assertion level usually have unit-test or integration-test analogs that are cheaper. E2e tests assert on the load-bearing outcomes at key journey points.

    **E2e tests are not a substitute for unit and integration tests.** A team with comprehensive e2e tests and no unit/integration tests has a test suite that is slow, expensive, and missing the precision lower-tier tests provide. The pyramid (or trophy) framing exists because each tier catches different bug classes; e2e cannot replace lower tiers.

    **E2e tests are not necessarily browser tests.** Most e2e tests are browser tests because most user-visible systems have a browser UI. But a CLI tool's e2e test is a subprocess invocation that asserts on stdout/stderr/exit code; an API-only product's e2e test is an HTTP client that asserts on response shape and behavior across endpoints. The defining property is *user-journey scope*, not *browser*.

    **Flaky e2e tests are not unavoidable.** They are a design failure. Common flake sources: hard-coded delays instead of wait-for-condition (use auto-waiting); shared test data that earlier tests mutate (isolate per test); race conditions in event-driven UIs (use deterministic synchronization); environment-dependent values like time-of-day (inject test clocks); flaky third parties (use recorded fakes or sandbox with retry). A persistent flake rate above ~1% means the team has stopped paying engineering cost on the suite.

    **Visual snapshot tests are not e2e tests.** A visual snapshot test captures a rendered component or page and compares to a baseline; an e2e test exercises a user journey end-to-end with behavioral assertions. They compose (an e2e test can include a visual snapshot at a key page), but they are not interchangeable.

    **Smoke tests are not e2e tests.** A smoke test is a small subset of critical-path tests run for fast deployment validation; e2e tests are the broader user-journey suite. Many teams run a smoke subset of their e2e suite on every deploy and the full e2e suite less frequently. The terms are not interchangeable.

    **A green e2e suite does not prove the system has no bugs.** It proves the tested journeys complete with the asserted outcomes in the test environment. Bugs outside the tested journeys, bugs in untested edge cases, bugs in untested user populations (different locales, devices, accessibility tools), and bugs that emerge only in real production traffic are invisible to the suite. E2e tests are necessary, not sufficient.
  taxonomy: |
    By scope of journey:
    - **Critical-path e2e** — the journeys that are the product's core value (signup, checkout, primary creative task). 5-20 tests per team is typical; these run on every commit or PR.
    - **Smoke tests** — a small subset of critical-path tests run on every deploy for fast validation. Often a single happy-path test per major journey.
    - **Regression e2e** — broader coverage of edge cases and historical bugs. Run nightly or per-merge. 30-200 tests is typical.
    - **Cross-browser / cross-device e2e** — same journeys run across browser-and-device matrices. The matrix multiplies test count; usually run on a schedule.

    By environment:
    - **Local docker-compose** — fastest setup; each developer can run; matches production loosely.
    - **Ephemeral preview environment per PR** — Vercel preview deployments, Netlify deploy previews, similar — full stack spun per PR.
    - **Shared staging environment** — convenient but shared mutable state is a flake source.
    - **Dedicated e2e environment** — production-like environment reserved for e2e runs.
    - **Production** — generally avoided; some teams run synthetic monitors in production as a form of continuous e2e.

    By test-data strategy:
    - **Fresh environment per test** — slowest, most isolated. Sometimes used for the highest-stakes journeys.
    - **Per-test data creation with unique identifiers** — each test creates its own user/account/order with unique IDs; cleanup happens at suite end or test end. Most common.
    - **Fixture seed + per-test mutations isolated by user account** — common pattern: every test gets a unique user, all mutations under that user are isolated from other tests.
    - **Shared snapshot with read-only discipline** — works for purely read-only flows; rare in practice.

    By framework:
    - **Playwright** (Microsoft) — modern, fast, multi-browser (Chromium, Firefox, WebKit), auto-waiting, trace viewer. Standard for new projects.
    - **Cypress** (Cypress.io) — popular, developer-friendly UI, retry-until-pass assertions. Chromium-family focused.
    - **Selenium WebDriver** — original, cross-language, cross-browser. Foundation for many other tools.
    - **Puppeteer** (Google) — Chrome-focused Node API; lower-level than Playwright.
    - **WebDriverIO** — Node test runner on top of WebDriver protocol.
    - **TestCafe** — Node-based, no WebDriver dependency.

    By assertion style:
    - **DOM assertions** — element presence, text content, attribute values. Standard.
    - **Visual assertions** — screenshot diff against baseline (composes with snapshot-testing).
    - **Network assertions** — assert specific requests were made or specific responses received.
    - **State assertions** — assert URL, browser storage, cookies, console output.
    - **Trace assertions** — assert spans appeared in the trace, durations under threshold, no error spans.

    By failure-diagnosis support:
    - **Screenshot on failure** — capture page state when test fails.
    - **Video capture** — record the test run.
    - **Trace capture** — Playwright's trace mode records every action, network call, console event.
    - **Console log capture** — capture browser console output for debugging.
    - **HAR file capture** — capture all network activity.

    Test-pyramid / test-trophy position:
    - In both pyramid and trophy, e2e is the top (smallest) tier.
    - Typical count: 10-100 e2e tests per service / front-end, depending on complexity. Suites of 500+ e2e tests are usually symptoms of misplaced testing — many of those tests should be integration tests.
  analogy: |
    A flight check. The aircraft's components have all been tested individually: the engine on a stand, the avionics on a bench, the hydraulics under pressure. Subsystems have been tested in integration: engine plus fuel system, control surfaces plus hydraulics, navigation plus radio. None of these tests have flown the aircraft.

    The flight check is the journey-scope test. Pilot enters the cockpit, runs through the pre-flight checklist, taxis, takes off, climbs, levels off, banks, descends, lands. Every component is real; every subsystem is real; the user (the pilot) is real; the environment (the air) is real. The flight check verifies that the aircraft does what an aircraft is supposed to do for the person operating it.

    Flight checks are expensive. They take hours of pilot time, fuel cost, ground crew preparation, and they carry real risk. A program with one flight check per design change is feasible; a program with a flight check per software-button-position change is not. The discipline is choosing the flight tests so that each one is load-bearing — covers a maneuver that matters, verifies an outcome that proves the aircraft works for its mission — and using cheaper tests (component, bench, subsystem) for everything else.

    Wait-strategy is the pilot's discipline of looking at the gauges to confirm a state before proceeding rather than counting seconds. "Climb to 10,000 feet" doesn't mean "climb for 90 seconds and hope you're at 10,000"; it means "climb until the altimeter reads 10,000." The aircraft-test analog of hardcoded sleeps is dangerous; the wait-for-condition analog is what professional pilots actually do.

    Test data is the aircraft's fuel load, weight balance, payload. Each flight test starts from a known configuration; without this, the test result has unaccounted-for variables. The aircraft-test discipline of pre-flight inventory is the same discipline as e2e-test setup data.

    A program that has only bench tests and no flight tests is one that has not flown its aircraft. A program that has only flight tests and no bench tests is one that learns about engine failures by experiencing them at altitude. Both extremes are wrong; the working pattern is many bench tests, fewer subsystem tests, a small number of well-designed flight tests for the maneuvers that matter most.
  misconception: |
    The most common misconception is that **e2e tests are the gold-standard test type**. They are not. They are the most expensive test type — slow per test, flaky-prone, costly to write and maintain. They are the *least* you should have, not the most. A team that builds e2e-test-heavy suites pays continuously for what unit and integration tests would cover more cheaply.

    The second misconception is that **e2e tests can replace unit and integration tests**. They cannot. E2e tests catch composition bugs and user-perspective bugs; unit and integration tests catch implementation bugs and boundary bugs. The bug classes are different. A team that has only e2e tests has slow detection of bugs that lower-tier tests would catch in milliseconds.

    The third misconception is that **flaky e2e tests are a fact of life**. They are not. Common flake sources are well-understood: hardcoded delays instead of wait-for-condition; shared test data with cross-test mutation; race conditions in event-driven UIs without deterministic synchronization; flaky third parties without recorded fakes; environment-dependent values without injection. A persistently flaky e2e suite is symptomatic of missing infrastructure or accepted noise; both are fixable.

    The fourth misconception is that **e2e tests must use the production third parties**. They should not, by default. Recorded fakes of third-party APIs (VCR-style, or Playwright's network interception, or MSW for HTTP) give the e2e test the third party's behavior without its variability, cost, and unavailability. Real third-party calls belong in scheduled integration-test runs (nightly), not in PR e2e tests.

    The fifth misconception is that **the more e2e tests, the better**. The opposite is closer to right: each e2e test must be load-bearing, and the marginal e2e test usually has a cheaper unit-or-integration analog that would catch the same bug class. Suites of 500+ e2e tests usually indicate that many of those tests should be lower-tier.

    The sixth misconception is that **e2e tests are slow and that's okay**. They are slow; the okay-ness is conditional. Twenty-minute e2e suites are workable; two-hour suites are not. The discipline is keeping the suite size proportional to its CI-time budget by being deliberate about what each test must catch.

    The seventh misconception is that **page objects are mandatory**. The page-object pattern (encapsulate page interactions in a class per page) is a useful organization for large e2e suites but is not mandatory. Small suites can write actions inline. The pattern's value is reuse and centralized maintenance of locators; for small suites the cost-of-pattern exceeds the reuse-benefit.

    The eighth misconception is that **a passing e2e suite proves the system works**. It proves the tested journeys complete with the asserted outcomes in the test environment. Untested journeys, untested edge cases, untested user populations (locales, devices, accessibility), and bugs that emerge only in production traffic are invisible. E2e is necessary, not sufficient.

    The ninth misconception is that **Playwright is the same as Cypress is the same as Selenium**. They are different in cost models, flakiness profiles, and supported browsers. Playwright: modern API, multi-browser, fast, trace-viewer for diagnosis. Cypress: developer-friendly, retry-until-pass assertions, Chromium-family focused, in-browser test execution model. Selenium: cross-language WebDriver protocol, slower but most-portable, foundation for many other tools. Choice affects investment cost over years; choose deliberately.

    The tenth misconception is that **e2e tests are only for browser-based applications**. They are wherever the user journey is — CLI tools have CLI e2e tests (subprocess invocation, stdout/stderr/exit-code assertions); API-only products have API e2e tests (cross-endpoint HTTP journeys); mobile apps have mobile e2e tests (Appium, Detox, Maestro). The defining property is the user-journey scope, not the technology.
---

# E2e Test Design

## Coverage

The discipline of designing tests that exercise a complete user-visible path through the entire system — UI, application, data, third parties, and back — with the user journey as the unit of test. Covers the five primitives (journey, environment, test data, observable assertion, wait strategy), the pyramid/trophy position (top tier, fewest tests, highest cost, highest user-meaningful coverage), the test-data strategies that determine isolation and flake rate, the wait-for-condition synchronization discipline that prevents flake, the framework landscape (Playwright, Cypress, Selenium, Puppeteer), and the cost-and-count trade-off that distinguishes good e2e suites from over-investment.

## Philosophy

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
