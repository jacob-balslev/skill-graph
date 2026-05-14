---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: debugging
description: "Use when behavior is broken, a test is failing, or runtime output contradicts expectations. Covers failure reproduction, scope reduction by bisection, evidence capture at the moment of failure, root-cause isolation (not symptom patching), fix verification against the same evidence path, and regression-test creation. Do NOT use for feature planning, architectural design, or behavior-preserving refactor."
version: 1.0.0
type: workflow
category: engineering
scope: portable
owner: skill-graph-maintainer
freshness: "2026-04-18"
drift_check:
  last_verified: "2026-04-18"
eval_artifacts: present
eval_state: passing
routing_eval: present
stability: experimental
license: MIT
compatibility:
  notes: "Markdown, Git, any codebase"
allowed-tools: Read Grep Bash
keywords:
  - debugging
  - reproduce failure
  - reproduce bug
  - failing test
  - root cause
  - symptom vs cause
  - minimum reproduction
  - bisect
  - what caused it
  - my tests are failing
  - why is this broken
  - it broke in production
  - cannot reproduce
  - test passes locally
  - stack trace
  - used to work
  - worked yesterday
  - what changed
  - was working before
  - agent stuck
  - stuck in a loop
  - stuck in loop
  - blocking my commit
  - blocking the build
  - specific error
  - specific failure
  - diagnose failure
  - error blocking
  - broke the build
  - broke build
triggers:
  - debugging-skill
examples:
  - "my tests pass locally but fail in CI — why?"
  - "this function used to work yesterday; what changed?"
  - "reproduce this Stripe webhook failure from production logs"
  - "I see the symptom but can't find the root cause of this nil panic"
anti_examples:
  - "plan test coverage for a new feature"                    # testing-strategy plans, debugging chases
  - "document what this function does for future readers"     # documentation skill
  - "refactor this messy code while the test suite is green"  # refactor (no failure, no symptom)
relations:
  # testing-strategy and refactor USED to live in `adjacent` here as close
  # siblings, but the routing harness surfaced real confusable collisions:
  # debugging's anti_examples ("plan test coverage…", "refactor this messy
  # code…") need those two skills to WIN the anti-routing, not to be loaded
  # alongside debugging. `boundary` is the correct relation for confusables
  # — the lint `check-adjacency-boundary` enforces this dichotomy, so both
  # adjacency entries were removed. verify_with still pulls testing-strategy
  # in when debugging is the primary match (regression-test authoring after
  # a failure is fixed), which is the original intent of the adjacency.
  boundary:
    - skill: documentation
      reason: "documentation is durable reference prose; debugging is transient failure-chasing"
    - skill: testing-strategy
      reason: "testing-strategy plans what to test before a failure exists; debugging chases a specific observed failure"
    - skill: refactor
      reason: "refactor is behavior-preserving code change with green tests; debugging is invoked because tests or behavior are NOT green"
  verify_with:
    - testing-strategy
portability:
  readiness: scripted
  targets:
    - skill-md
---

# Debugging

## Coverage

- Reproduction: turning a vague bug report into a deterministic failing case
- Scope reduction: isolating the smallest surface where the failure still reproduces
- Evidence capture: collecting logs, stack traces, and state snapshots at the moment of failure
- Root-cause isolation: distinguishing symptoms from causes and resisting the urge to patch symptoms
- Fix verification: re-running the original failure path to confirm the fix is real
- Regression prevention: converting the failing case into a permanent test so the same bug cannot return silently

## Philosophy

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

This skill ships a comprehension-eval artifact at [`examples/evals/debugging.json`](../../examples/evals/debugging.json). The `Verification` checklist below is the authoring gate for a completed debugging pass; the eval file is how this skill is graded by `scripts/skill-audit.js --graded`. Do not conflate them — the checklist is for the debugger, the eval is for the grader.

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
