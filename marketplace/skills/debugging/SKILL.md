---
name: debugging
description: "Use when behavior is broken, a test is failing, or runtime output contradicts expectations. Covers failure reproduction, scope reduction by bisection, evidence capture at the moment of failure, root-cause isolation (not symptom patching), fix verification against the same evidence path, and regression-test creation. Do NOT use for feature planning, architectural design, or behavior-preserving refactor. Do NOT use for plan test coverage for a new feature. Do NOT use for document what this function does for future readers. Do NOT use for refactor this messy code while the test suite is green."
license: MIT
compatibility: "Markdown, Git, any codebase"
allowed-tools: Read Grep Bash
metadata:
  relations: "{\"related\":[\"generative-ui\",\"test-driven-development\",\"testing-strategy\",\"tool-call-strategy\"],\"suppresses\":[\"refactor\"],\"verify_with\":[\"testing-strategy\",\"observability-modeling\"]}"
  subject: software-engineering-method
  scope: "Portable failure-reproduction and root-cause isolation discipline for software work: turning an observed broken behavior, failing test, or contradictory runtime output into a deterministic reproduction; narrowing scope; capturing evidence at the moment of failure; separating symptoms from causes; verifying the fix against the same evidence path; and adding a regression test. Excludes feature planning, architecture design, behavior-preserving refactor, general documentation, and choosing test coverage when no active failure is being investigated."
  public: "true"
  stability: experimental
  keywords: "[\"debugging\",\"tests fail in CI\",\"used to work\",\"reproduce failure\",\"failing test\",\"root cause\",\"symptom vs cause\",\"minimum reproduction\",\"regression\",\"what changed\"]"
  triggers: "[\"debugging-skill\"]"
  examples: "[\"my tests pass locally but fail in CI — why?\",\"this function used to work yesterday; what changed?\",\"reproduce this Stripe webhook failure from production logs\",\"I see the symptom but can't find the root cause of this nil panic\"]"
  anti_examples: "[\"plan test coverage for a new feature\",\"document what this function does for future readers\",\"refactor this messy code while the test suite is green\"]"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/software-engineering-method/debugging/SKILL.md
  skill_graph_export_description_projection: anti_examples
---
# Debugging

## Concept of the skill

**What it is:** Debugging is the discipline of turning a broken behavior into a reproduced failure, isolating the cause, verifying the fix on the same evidence path, and preserving the case as a regression test.

**Mental model:** A debugging pass has six gates: reproduce the failure, reduce the scope, capture evidence at the failure point, form a hypothesis that explains all evidence, verify the fix with the same path, and add a regression test that fails without the fix.

**Why it exists:** Plausible explanations are cheap and often wrong. Debugging keeps the agent from patching the visible symptom before proving where the state first becomes wrong.

**What it is NOT:** It is not feature planning, architecture design, green-test refactoring, documentation, or test-strategy planning for a future change.

**Common misconception:** The newest change is not automatically the cause. It is only a hypothesis until it explains the failing path and the unaffected control paths.

## Coverage

- Reproduction: turning a vague bug report into a deterministic failing case
- Scope reduction: isolating the smallest surface where the failure still reproduces
- Evidence capture: collecting logs, stack traces, and state snapshots at the moment of failure
- Root-cause isolation: distinguishing symptoms from causes and resisting the urge to patch symptoms
- Fix verification: re-running the original failure path to confirm the fix is real
- Regression prevention: converting the failing case into a permanent test so the same bug cannot return silently

## Philosophy of the skill

The fastest way to fix a bug is usually the wrong fix. A working reproduction is worth more than a plausible hypothesis; a plausible hypothesis is worth more than a clever fix; a clever fix that skips the reproduction step ships the same bug again under a different name. When pressure is high the temptation to jump from symptom to patch is also high — resist it, because the cost of a wrong fix is paid again by the next person who hits the same failure with less context than you had.

## Workflow

Each step asks a question. The answer decides the next step. Do not skip steps to save time; the steps exist because skipping them is how bugs return.

| Step | Ask | If yes | If no |
|---|---|---|---|
| 1. Reproduce | Do you have a deterministic failing case? | Go to step 2 | Add logging, narrow inputs, or run the failing path in a loop until the failure is reliable |
| 2. Scope | Can you reproduce it in a surface smaller than the full system? | Go to step 3 | Bisect — halve the code path, data, or config and retry |
| 3. Evidence | Do you have the state at the moment of failure, not just the symptom after? | Go to step 4 | Add instrumentation at the boundary where state flips wrong |
| 4. Cause | Does your hypothesis explain ALL of the evidence, not just the visible symptom? | Go to step 5 | Form a better hypothesis — partial explanations hide shared root causes |
| 5. Verify | Does the same evidence path pass with the fix applied, and fail with it reverted? | Go to step 6 | The fix did not land or the cause was wrong — return to step 4 |
| 6. Regression test | Does the test you just wrote fail without the fix and pass with it? | Done | Your test is not isolating the cause — rewrite it |

### When to stop and escalate

- Step 1 is still unreproducible after ~60 min of narrowing → suspect non-determinism (race, timing, clock, network). This is a design issue, not a debugging issue.
- Step 3 instrumentation shows contradictory state on the same object → suspect memory corruption, concurrent mutation, or stale cache. Out of scope for a single-file debugger; escalate to architectural review.
- The same bug returned after a previous fix → the previous fix patched a symptom. Start over at step 1 and find the real cause.

## Evals

This skill ships a comprehension-eval artifact at [`examples/evals/debugging.json`](https://github.com/jacob-balslev/skill-graph/blob/main/examples/evals/debugging.json). The `Verification` checklist below is the authoring gate for a completed debugging pass; the eval file is how this skill is graded by `scripts/skill-audit.js --graded`. Do not conflate them — the checklist is for the debugger, the eval is for the grader.

## Verification

- [ ] The original failure was reproduced deterministically, not just described
- [ ] The hypothesis explains every piece of evidence collected, not a subset
- [ ] The fix was verified by the same evidence path that revealed the bug
- [ ] A regression test fails without the fix and passes with it
- [ ] The next engineer who hits this failure can reach the fix from the regression test alone

## Do NOT Use When

| Use instead | When |
|---|---|
| `refactor` | The task is structural cleanup, not failure-driven diagnosis |
| `testing-strategy` | The task is planning what to test, not chasing a known failure |
| `documentation` | The task is explaining behavior, not fixing broken behavior |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `software-engineering-method`
- Public: `true`
- Scope: Portable failure-reproduction and root-cause isolation discipline for software work: turning an observed broken behavior, failing test, or contradictory runtime output into a deterministic reproduction; narrowing scope; capturing evidence at the moment of failure; separating symptoms from causes; verifying the fix against the same evidence path; and adding a regression test. Excludes feature planning, architecture design, behavior-preserving refactor, general documentation, and choosing test coverage when no active failure is being investigated.

**When to use**
- my tests pass locally but fail in CI — why?
- this function used to work yesterday; what changed?
- reproduce this Stripe webhook failure from production logs
- I see the symptom but can't find the root cause of this nil panic
- Triggers: `debugging-skill`

**Not for**
- plan test coverage for a new feature
- document what this function does for future readers
- refactor this messy code while the test suite is green

**Related skills**
- Verify with: `testing-strategy`, `observability-modeling`
- Related: `generative-ui`, `test-driven-development`, `testing-strategy`, `tool-call-strategy`

**Keywords**
- `debugging`, `tests fail in CI`, `used to work`, `reproduce failure`, `failing test`, `root cause`, `symptom vs cause`, `minimum reproduction`, `regression`, `what changed`

<!-- skill-graph-context:end -->
