---
name: snapshot-testing
description: "Use when reasoning about snapshot testing as a tactical technique: the capture-and-compare-against-baseline pattern, the difference between data snapshots (serialized object trees), DOM snapshots (rendered HTML trees), and visual snapshots (pixel images), the approval-cycle discipline that determines whether the technique adds testing value or just maintenance burden, the failure modes (auto-update without review, snapshot churn on irrelevant changes, large snapshots that hide diffs), where snapshot testing fits (structural regression of complex outputs) and where it doesn't (behavioral specification of contracts), and the relationship to visual regression testing tools (Chromatic, Percy, Loki, Playwright screenshots). Do NOT use for behavioral assertions about output values (use example tests in testing-strategy), for universal property claims (use property-based-testing), for the construction of test doubles (use test-doubles-design), or for end-to-end user-journey testing (use e2e-test-design)."
license: MIT
allowed-tools: Read Grep
metadata:
  schema_version: "7"
  version: "1.0.0"
  type: capability
  category: quality
  domain: quality/testing
  scope: reference
  owner: skill-graph-maintainer
  freshness: "2026-05-16"
  drift_check: "{\"last_verified\":\"2026-05-16\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  comprehension_state: present
  stability: experimental
  keywords: "[\"snapshot testing\",\"golden file\",\"characterization test\",\"approval testing\",\"visual regression\",\"Chromatic\",\"Percy\",\"Storybook\",\"Jest snapshot\",\"DOM snapshot\",\"image snapshot\",\"approval cycle\"]"
  triggers: "[\"should this be a snapshot test\",\"the snapshot keeps changing\",\"is visual regression testing the same thing\",\"should we auto-update snapshots\",\"snapshot file is too big\"]"
  examples: "[\"decide whether a rendered component is a candidate for a snapshot test or for behavioral tests\",\"diagnose a test suite where every PR updates snapshot files — likely snapshot churn from non-stable inputs\",\"explain why auto-updating snapshots without review removes the testing value\",\"design an approval cycle for a visual regression suite (Chromatic / Percy)\"]"
  anti_examples: "[\"specify the exact return value of a calculation (use example tests under testing-strategy)\",\"verify a universal property like sort correctness (use property-based-testing)\",\"design end-to-end user journey tests (use e2e-test-design)\"]"
  relations: "{\"related\":[\"testing-strategy\",\"property-based-testing\",\"test-driven-development\",\"code-review\"],\"boundary\":[{\"skill\":\"testing-strategy\",\"reason\":\"testing-strategy owns the strategic question of what to test at which level; this skill owns one tactical technique (capture-and-compare) within that strategy.\"},{\"skill\":\"property-based-testing\",\"reason\":\"property-based-testing asserts universal claims about output structure; snapshot testing captures a specific output and asserts equality to a baseline. The two complement: PBT for universal contracts, snapshots for complex structural outputs that are easier to capture than specify.\"},{\"skill\":\"test-driven-development\",\"reason\":\"TDD prescribes writing the test before the code; snapshot testing requires the code to exist before the snapshot can be captured. Snapshot testing fits poorly with strict TDD on greenfield code and well with characterization of existing code.\"},{\"skill\":\"code-review\",\"reason\":\"Snapshot diffs surface change evidence that code review must read and approve; the approval cycle of snapshot testing is operationally part of the review process the code-review discipline owns.\"}],\"verify_with\":[\"testing-strategy\",\"code-review\"]}"
  mental_model: "|"
  purpose: "|"
  boundary: "|"
  analogy: "A snapshot test is to a piece of output what a wedding photograph is to a memory of the day — the photograph does not say what the wedding *should* have looked like, only what it did look like; on the next anniversary, you compare the room to the photograph and notice 'the curtains are different' (intentional — they were replaced) or 'the picture is crooked' (unintentional — fix it). A photograph filed away without anyone ever looking at it again is not a record; it is paper. A snapshot file the team auto-accepts via `-u` is the same."
  misconception: "|"
  concept: "{\"definition\":\"Snapshot testing is a tactical testing technique in which the output of a system under test is captured on a known-good run, stored as an artifact (the snapshot), and compared against fresh output on each subsequent test run. A mismatch is the test failure. The snapshot itself is the assertion — there is no hand-written claim about what the output should be; the claim is 'the output should equal what it was last time, until someone deliberately approves a new baseline.' The discipline is in the *approval cycle*: when the output legitimately changes, a human reviews the diff and accepts the new baseline; when the change is unexpected, the test failure surfaces the regression. A snapshot test without disciplined approval review is not a test; it is a record of whatever the output happened to be on the day the snapshot was last updated.\",\"mental_model\":\"|\",\"purpose\":\"|\",\"boundary\":\"|\",\"taxonomy\":\"|\",\"analogy\":\"|\",\"misconception\":\"|\"}"
  structural_verdict: UNVERIFIED
  truth_verdict: UNVERIFIED
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v7
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/quality/testing/snapshot-testing/SKILL.md
---

# Snapshot Testing

## Coverage

The tactical testing technique in which the output of a system under test is captured on a known-good run, stored as an artifact, and compared against fresh output on each subsequent test run. Covers the five primitives (target output, snapshot artifact, comparison and diff, approval cycle, stability discipline), the taxonomy across output target (data / DOM / image / text), storage location (inline / file / centralized service), approval process (auto-update / manual edit / PR-integrated review), comparison strategy (exact / perceptual / structural / property-equality), and scope (unit / integration / full-page visual). Covers the Feathers characterization-test pattern as a legitimate use, and the auto-update-without-review anti-pattern as the technique's most common failure mode.

## Philosophy

A snapshot test is a photograph of the output. The photograph itself is not a specification — it doesn't say what the output should be, only what it was on the day of capture. The technique's value is in surfacing every subsequent change to a reviewer's eye, so that intentional changes are approved and unintentional changes are caught as regressions.

The discipline is the approval cycle. When a snapshot test fails, the developer reads the diff, decides whether the change was intentional, and either updates the baseline (intentional) or fixes the production code (unintentional). A team that types `jest -u` reflexively in response to every failing snapshot has automated the maintenance and removed the verification.

Snapshot testing fits where the output is structurally complex enough that hand-specifying every part is expensive, where small drift should be visible, and where the team will honor the approval cycle. It fits poorly where the output is simple (use precise assertions), unstable (the snapshot will churn), or where the team treats failures as nuisances to silence rather than signals to read.

## Output Target Matrix

| Target | Serialization | Diff format | Common tooling |
|---|---|---|---|
| Data structure | JSON or framework-specific | Line-by-line text diff | Jest `toMatchSnapshot`, Vitest snapshot |
| DOM / HTML | Pretty-printed HTML or virtual-DOM tree | Line-by-line text diff | `@testing-library` + Jest, Enzyme legacy |
| Image | PNG (or other lossless) | Perceptual diff with threshold | Chromatic, Percy, Argos, Loki, Playwright screenshots |
| Text | Plain text | Line-by-line text diff | Approval test libraries; framework snapshot |
| Generated code | Plain text | Line-by-line text diff | Same as text |

The target's serialization stability is the technique's precondition. Outputs that include timestamps, random IDs, iteration-order-dependent collections, or environment-dependent values must be normalized before snapshot capture or the test will churn.

## The Approval Cycle In Detail

```
Test fails (snapshot != fresh output)
            │
            ▼
   Read the diff carefully
            │
            ▼
  ┌─────────────┴─────────────┐
  │                           │
  Change was intended         Change was not intended
  │                           │
  ▼                           ▼
  Update the snapshot         Fix the production code
  (the new baseline is the    (the snapshot stays;
   intended output)            the code is what changed
                               unintentionally)
```

The discipline is the read. The diff must be small enough to read, the diff format must be legible, and the developer must read it. Tooling that bypasses the read (auto-update, mass-accept) is incompatible with the technique.

## When Snapshot Testing Fits

| Fits well | Fits poorly |
|---|---|
| Complex rendered DOM components | Simple return values |
| Large JSON API responses | Single primitive outputs |
| Generated SQL or code output | Random or nondeterministic outputs |
| Visual regression of UI components | Outputs that change frequently for unrelated reasons |
| Characterizing legacy code for refactoring | Greenfield code under strict TDD |
| Full-page visual diff | Behavioral contracts that need explicit specification |
| Detecting structural drift over time | Cases where every diff is expected and uninformative |

## Stability Sources To Control

| Source | Mitigation |
|---|---|
| Wall-clock timestamps | Inject a deterministic clock; freeze time in tests |
| Random IDs (UUID, nanoid) | Inject a seeded ID generator in tests |
| Iteration order of unordered collections | Sort before serialization |
| Environment-dependent values (env vars, hostnames) | Fix or mock in test environment |
| Browser/OS rendering differences (image snapshots) | Use a snapshot service that pins the environment; tolerance threshold for perceptual diff |
| Pretty-printer changes across library versions | Pin the serializer version |
| Locale-dependent formatting | Fix locale in tests |

A snapshot test on output without these controls churns on noise and trains the team to ignore the failures.

## Verification

After applying this skill, verify:
- [ ] Every snapshot test has a designated approval cycle. The team's response to a failed snapshot test is "read the diff," not "run `-u`."
- [ ] Snapshot files are small enough that the diff between baseline and fresh output is readable by a human reviewer. Snapshots over a few hundred lines are split or replaced with per-property assertions.
- [ ] The target output is *stable* — timestamps, IDs, ordering, and environment values are controlled. Snapshots that churn on noise are diagnosed as instability, not accepted as normal.
- [ ] Snapshot tests are paired with example tests for behaviors that need specification. The suite is not snapshot-only.
- [ ] Visual snapshots use perceptual diff with a tolerance threshold, not bit-for-bit equality. The threshold is tuned to ignore rendering noise while catching real changes.
- [ ] PR review surfaces snapshot diffs; reviewers actually read them. (For visual snapshots, the snapshot service's review UI is the integration point.)
- [ ] Characterization snapshots are recognized as safety nets for legacy refactoring, not as specifications. They are progressively replaced with example or property tests as the code is understood.
- [ ] Snapshot files in source control are reviewed for size. Repository bloat from large snapshot files is a real cost that needs counterweight (technique fit, review discipline).

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Specifying one concrete behavior with explicit assertions | example tests (see `testing-strategy`) | examples specify with reasoning; snapshots capture without |
| Asserting a universal property like sort correctness | `property-based-testing` | properties assert universal claims; snapshots assert "equals last time" |
| Constructing test doubles | `test-doubles-design` | test-doubles owns the stand-in construction |
| Designing end-to-end user journey tests | `e2e-test-design` | e2e owns user-level behavioral testing; snapshot-of-screenshot is one tool inside it |
| Choosing test levels (unit/integration/e2e) | `testing-strategy` | strategy owns level choice; this skill is one tactical technique within |
| Reviewing intended visual changes against a design system | dedicated design-review process | visual design intent assessment is its own discipline; visual snapshots surface unintended changes, not whether intended ones are good |

## Key Sources

- Feathers, M. (2004). *Working Effectively with Legacy Code*. Prentice Hall. Introduces "characterization tests" — capturing current behavior as a safety net for refactoring legacy code. The conceptual ancestor of snapshot testing.
- Jest Team. ["Snapshot Testing — Jest Documentation"](https://jestjs.io/docs/snapshot-testing). The most-adopted JavaScript snapshot-testing implementation; canonical reference for inline snapshots, the `__snapshots__/` convention, and the `--updateSnapshot` flag and its discipline implications.
- Llopis, N. ["Approval Tests"](https://approvaltests.com/). Cross-language framework explicitly focused on the approval cycle as the central discipline; useful as a contrast to auto-update-heavy tools.
- Chromatic. ["Visual Testing Handbook"](https://www.chromatic.com/blog/visual-testing-handbook/). Practitioner-oriented guide to visual snapshot testing, perceptual diff, cross-browser concerns, and PR-integrated review UI.
- Percy / BrowserStack. ["Visual Testing Documentation"](https://docs.percy.io/). Reference for the centralized-snapshot-service pattern in visual regression testing.
- Storybook Team. ["Visual testing with Storybook"](https://storybook.js.org/docs/writing-tests/visual-testing). Reference for integrating visual snapshot testing with component development workflows.
- Reactive Tests. ["Testing Library — Snapshot considerations"](https://testing-library.com/docs/queries/about/#priority) and broader [Testing Library documentation](https://testing-library.com/). Practitioner reference for DOM snapshot best practices in React/Vue test suites.
- Spadini, D., Schvarcbacher, M., Oprescu, A.-M., Bruntink, M., & Bacchelli, A. (2020). ["Investigating Severity Thresholds for Test Smells"](https://dl.acm.org/doi/10.1145/3387940.3392177). Industrial study including snapshot-test smells; useful empirical signal on approval-cycle failure modes.
