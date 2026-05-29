---
name: lint-overlay
description: "Use when adding or enforcing lint rules as part of a test or verification plan. Extends testing-strategy with lint-specific guidance: rule selection, gate placement, failure triage, and migration planning when introducing rules to an existing codebase. Do NOT use standalone — load the base testing-strategy skill alongside it — and do NOT use for chasing a specific lint failure in one file (that is debugging). Do NOT use for decide whether to unit-test or integration-test this handler. Do NOT use for extract this repeated code pattern into a shared util. Do NOT use for the design of integration-level tests including the unit-vs-integration choice (use integration-test-design). Do NOT use for detecting and naming repeated patterns in code (use pattern-recognition)."
license: MIT
compatibility: "Markdown, Git, any codebase with a lint tool"
allowed-tools: Read Grep Bash
metadata:
  schema_version: "8"
  version: "1.0.0"
  subject: quality-assurance
  deployment_target: portable
  owner: skill-graph-maintainer
  freshness: "2026-04-18"
  drift_check: "{\"last_verified\":\"2026-05-13\",\"truth_source_hashes\":{\"scripts/skill-lint.js\":\"3a78f75f8921542b91dc619cd41bde29bf379de3c16bdcf3653c854ecbe9fa29\",\"scripts/lint/check-routing-quality.js\":\"b57d10f4c7c4e42a1a86c2741cbac6708e2de7dedb51b13f707283fbf91e32b5\",\"scripts/lint/check-routing-eval.js\":\"ab541922dfcbfb2cd7740c4abebb892e8b26477643e9d802fd0ea4cfbc8de649\",\"examples/evals/lint-overlay.json\":\"d60dcd4512904f36e56702d5338295dbf1238448b988dc60225fdd77285eaff9\",\"skills/testing-strategy/SKILL.md\":\"9c5da135ab8834843367da9e9120c92b57e81d1680ef84a0ea9e32f362e1456e\"}}"
  eval_artifacts: present
  eval_state: passing
  routing_eval: present
  stability: experimental
  extends: testing-strategy
  keywords: "[\"lint\",\"linting\",\"lint rules\",\"lint integration\",\"static analysis\",\"eslint\",\"format check\",\"add eslint rule\",\"lint is failing\",\"add lint check\",\"noImplicitAny\",\"phased lint rollout\",\"lint rule migration\",\"pre-commit lint\",\"ci lint gate\",\"lint rule violations\"]"
  triggers: "[\"lint-overlay\"]"
  examples: "[\"plan ESLint rule introduction for a monorepo that has never had linting\",\"which lint rules should block CI and which should warn-only for now?\",\"migrate these legacy noImplicitAny violations in phased gates\",\"decide whether this new rule runs pre-commit or in CI only\"]"
  anti_examples: "[\"decide whether to unit-test or integration-test this handler\",\"extract this repeated code pattern into a shared util\"]"
  relations: "{\"boundary\":[{\"skill\":\"debugging\",\"reason\":\"debugging fixes a specific failing lint result; lint-overlay plans rule selection and gate placement\"},{\"skill\":\"refactor\",\"reason\":\"refactor changes behavior-preserving code shape; lint-overlay is verification-plan authoring, not code modification\"},{\"skill\":\"testing-strategy\",\"reason\":\"base testing-strategy owns unit-vs-integration scope selection; lint-overlay extends it only for lint-specific gate placement\"},{\"skill\":\"integration-test-design\",\"reason\":\"integration-test-design owns the design of integration-level tests including the unit-vs-integration choice; lint-overlay owns lint-rule rollout and CI gate placement — deciding test level is a testing concern, not a lint concern\"},{\"skill\":\"pattern-recognition\",\"reason\":\"pattern-recognition owns detecting and naming repeated patterns in code; lint-overlay owns lint-rule planning — extracting repeated code into a shared util is a refactor/pattern-extraction task, not a lint-rule decision\"}]}"
  grounding: "{\"subject_matter\":\"Lint-specific verification planning in the Skill Graph starter library\",\"grounding_mode\":\"hybrid\",\"truth_sources\":[\"scripts/skill-lint.js\",\"scripts/lint/check-routing-quality.js\",\"scripts/lint/check-routing-eval.js\",\"examples/evals/lint-overlay.json\",\"skills/testing-strategy/SKILL.md\"],\"failure_modes\":[\"lint_failure_triaged_as_strategy_problem\",\"overlay_loaded_without_base_testing_strategy\",\"rule_migration_lacks_gate_placement\",\"routing_eval_claim_not_backed_by_harness\"],\"evidence_priority\":\"repo_code_first\"}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  structural_verdict: PASS
  truth_verdict: DRIFT
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/quality-assurance/lint-overlay/SKILL.md
  skill_graph_export_description_projection: anti_examples+boundary
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

This skill ships a comprehension-eval artifact at [`examples/evals/lint-overlay.json`](https://github.com/jacob-balslev/skill-graph/blob/main/examples/evals/lint-overlay.json). Because this is an overlay, the eval prompts specifically test what the overlay adds on top of `testing-strategy` and what it deliberately leaves to the base. The eval file is how this skill is graded by `scripts/skill-audit.js --graded`.

## Do NOT Use When

| Use instead | When |
|---|---|
| `testing-strategy` alone | Lint is not in scope for this change — load only the base skill |
| `debugging` | The task is chasing a specific lint failure in one file, not planning lint-gate strategy |
| `refactor` | The task is fixing accumulated lint debt as structural cleanup — refactor covers behavior preservation during the cleanup |

## Skill Graph context

<!-- generated by scripts/export-marketplace-skills.js from Skill Metadata Protocol fields; do not edit by hand -->

**Classification**
- Subject: `quality-assurance`
- Deployment: `portable`

**When to use**
- plan ESLint rule introduction for a monorepo that has never had linting
- which lint rules should block CI and which should warn-only for now?
- migrate these legacy noImplicitAny violations in phased gates
- decide whether this new rule runs pre-commit or in CI only
- Triggers: `lint-overlay`

**Not for**
- decide whether to unit-test or integration-test this handler
- extract this repeated code pattern into a shared util
- Owned by `debugging`
- Owned by `refactor`
- Owned by `testing-strategy`
- Owned by `integration-test-design`: the design of integration-level tests including the unit-vs-integration choice
- Owned by `pattern-recognition`: detecting and naming repeated patterns in code

**Grounding**
- Mode: `hybrid`
- Truth sources: `scripts/skill-lint.js`, `scripts/lint/check-routing-quality.js`, `scripts/lint/check-routing-eval.js`, `examples/evals/lint-overlay.json`, `skills/testing-strategy/SKILL.md`

**Lifecycle & audit status**
- Stability: `experimental`
- Freshness: `2026-04-18`
- Eval state: `passing`
- Routing eval: `present`
- Audit status: structural PASS, truth DRIFT, comprehension UNVERIFIED, application UNVERIFIED
- Last audited: `2026-05-28`

**Provenance**
- version 1.0.0, schema v8, owner `skill-graph-maintainer`
- Keywords: `lint`, `linting`, `lint rules`, `lint integration`, `static analysis`, `eslint`, `format check`, `add eslint rule`, `lint is failing`, `add lint check`, `noImplicitAny`, `phased lint rollout`, `lint rule migration`, `pre-commit lint`, `ci lint gate`, `lint rule violations`
