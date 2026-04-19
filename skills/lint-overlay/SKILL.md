---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v3.schema.json
schema_version: 3
name: lint-overlay
description: "Use when adding or enforcing lint rules as part of a test or verification plan. Extends testing-strategy with lint-specific guidance: rule selection, gate placement, failure triage, and migration planning when introducing rules to an existing codebase. Do NOT use standalone — load the base testing-strategy skill alongside it — and do NOT use for chasing a specific lint failure in one file (that is debugging)."
version: 1.0.0
type: overlay
browse_category: quality
scope: portable
owner: jacob-balslev
freshness: "2026-04-18"
drift_check:
  last_verified: "2026-04-18"
eval_artifacts: present
eval_state: passing
routing_eval: absent
stability: experimental
license: MIT
compatibility:
  notes: "Markdown, Git, any codebase with a lint tool"
allowed-tools: Read Grep Bash
extends: testing-strategy
keywords:
  - lint
  - linting
  - lint rules
  - lint integration
  - static analysis
  - eslint
  - format check
  - add eslint rule
  - lint is failing
  - add lint check
  - rule migration
  - lint gate
triggers:
  - lint-overlay
examples:
  - "plan ESLint rule introduction for a monorepo that has never had linting"
  - "which lint rules should block CI and which should warn-only for now?"
  - "migrate these legacy noImplicitAny violations in phased gates"
  - "decide whether this new rule runs pre-commit or in CI only"
anti_examples:
  - "this specific ESLint error is blocking my commit — why?"       # debugging owns single-file failure chasing
  - "decide whether to unit-test or integration-test this handler"  # base testing-strategy (without lint overlay)
  - "extract this repeated code pattern into a shared util"          # refactor owns code reorganization
relations:
  boundary:
    - skill: debugging
      reason: "debugging fixes a specific failing lint result; lint-overlay plans rule selection and gate placement"
    - skill: refactor
      reason: "refactor changes behavior-preserving code shape; lint-overlay is verification-plan authoring, not code modification"
  verify_with:
    - testing-strategy
portability:
  readiness: scripted
  targets:
    - agent-skills
---

# Lint Overlay

## Extends

This overlay extends `testing-strategy`. Load both skills whenever lint is part of a verification plan — this overlay alone is under-specified because it relies on the base skill's effort-to-risk framework for deciding which rules to enforce at all.

**What this overlay adds on top of `testing-strategy`:**

| Concern | `testing-strategy` (base) | `lint-overlay` (this skill) |
|---|---|---|
| What to verify | Behavior under real input | Static properties of the source, independent of input |
| When to run | At the scope dictated by risk | Before unit tests, on changed files only (unless a global rule is at risk) |
| Failure meaning | A regression in shipped behavior | A rule violation — block the merge, do not debug it in situ |
| Migration pattern | Write tests for existing behavior once | Introduce rules by pinning pre-change green state; fail only on new violations |

**What this overlay does NOT override from the base:**

- Effort-to-risk matching (base decides *whether* to lint before this decides *how*)
- Evidence quality (lint output is evidence; the same "concrete, reproducible" rule applies)
- Failure-case coverage (lint catches only the cases its rules know about; behavior tests still cover the rest)

## Coverage

- Lint as verification: when a lint step belongs in a test plan and when it is out of scope
- Rule selection: choosing which lint rules to enforce based on the risk profile of the change
- Lint-gate placement: where lint fits in the verification sequence relative to unit and integration tests
- Failure triage: separating lint failures caused by the current change from pre-existing rule violations
- Overlay discipline: what this skill adds on top of testing-strategy and what it intentionally leaves to the base

## Overlay Rules

These rules augment (not replace) the testing-strategy base skill.

| Rule | When it applies | Why |
|---|---|---|
| Lint runs after unit tests, before integration tests | When the change touches logic and style | Lint fails are cheap to fix; catching them before integration saves context |
| Only enforce rules that were green before the change | When introducing lint to an existing codebase | Fail on regressions, not on pre-existing violations |
| Lint scope matches the test scope | When the diff is bounded to specific files | Run lint only on changed files unless a global rule is at risk |
| Lint failures are blocking, not advisory | When lint is part of the official CI gate | A lint failure is a test failure; treat it the same way |
| New lint rules require a migration plan | When adding a rule that affects many existing files | Adding a rule that immediately fails 200 files is not a test — it is a scope change |

## Evals

This skill ships a comprehension-eval artifact at [`examples/evals/lint-overlay.json`](../../examples/evals/lint-overlay.json). Because this is an overlay, the eval prompts specifically test what the overlay adds on top of `testing-strategy` and what it deliberately leaves to the base. The eval file is how this skill is graded by `scripts/skill-audit.js --graded`.

## Do NOT Use When

| Use instead | When |
|---|---|
| `testing-strategy` alone | Lint is not in scope for this change — load only the base skill |
| `debugging` | The task is chasing a specific lint failure in one file, not planning lint-gate strategy |
| `refactor` | The task is fixing accumulated lint debt as structural cleanup — refactor covers behavior preservation during the cleanup |
