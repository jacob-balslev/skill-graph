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
routing_eval: present
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
  - migrate legacy
  - migrate lint
  - phased migration
  - phased gates
  - legacy violations
  - legacy lint violations
  - noimplicitany
  - pre-commit vs ci
  - pre-commit gate
  - ci gate
  - introduce lint rule
  - rule pre-commit
  - rule runs pre-commit
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
  # No adjacent: the natural siblings of a lint overlay would be other
  # verification-plan skills (code-coverage-overlay, perf-budget-overlay,
  # security-scan-overlay) but none of those exist in this starter library
  # yet. Declaring speculative adjacency to `refactor` or `debugging`
  # would be wrong — both are in boundary because the overlay explicitly
  # hands those concerns off. An adjacent slot will open once a peer
  # quality-overlay skill ships.
  boundary:
    - skill: debugging
      reason: "debugging fixes a specific failing lint result; lint-overlay plans rule selection and gate placement"
    - skill: refactor
      reason: "refactor changes behavior-preserving code shape; lint-overlay is verification-plan authoring, not code modification"
    - skill: testing-strategy
      reason: "base testing-strategy owns unit-vs-integration scope selection; lint-overlay extends it only for lint-specific gate placement"
  # No verify_with: `extends: testing-strategy` already binds this overlay to
  # its base contract — the base IS the verification partner, so naming it
  # again under verify_with would be redundant without adding signal. If a
  # dedicated CI-gate or lint-runner skill lands later, it belongs here.
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

## Philosophy

Lint is a verification signal, not a style opinion. A lint rule exists because a pattern has a measurable cost — a bug class, a readability drop, a maintenance drag — and the rule's job is to surface that cost early enough to fix it cheaply. Rules without that grounding are style preferences dressed up as gates, and style preferences should not block merges.

Three principles follow from that stance:

- **Enforce only rules that were green before the change.** A new rule that fails 200 pre-existing files on its first run is not a test — it is a scope change. Pin the pre-change green state, fail only on *new* violations, and plan the cleanup as a separate migration track.
- **Lint failures are test failures, not advisory warnings.** A rule that does not block the merge does not change behavior; it just adds noise to the log. Either the rule is worth a block or it is not a rule yet. "Warn-only" is a deployment mode for a migration window, not a permanent posture.
- **Lint scope matches test scope.** Run lint on the files the change touches, not on the entire tree. The exception is a rule whose correctness is global (e.g., a no-circular-imports check that a local diff cannot detect) — those run tree-wide, deliberately, and their cost is acknowledged.

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
