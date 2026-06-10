---
name: lint-overlay
description: "Use when adding or enforcing lint rules as part of a test or verification plan. Extends testing-strategy with lint-specific guidance: rule selection, gate placement, failure triage, and migration planning when introducing rules to an existing codebase. Do NOT use standalone — load the base testing-strategy skill alongside it — and do NOT use for chasing a specific lint failure in one file (that is debugging). Do NOT use for decide whether to unit-test or integration-test this handler. Do NOT use for extract this repeated code pattern into a shared util."
license: MIT
compatibility: "Markdown, Git, any codebase with a lint tool"
allowed-tools: Read Grep Bash
metadata:
  relations: "{\"related\":[\"pattern-recognition\",\"debugging\",\"refactor\",\"skill-infrastructure\",\"problem-locating-solving\"],\"suppresses\":[\"testing-strategy\",\"integration-test-design\"]}"
  subject: quality-assurance
  public: "true"
  scope: "Use when adding or enforcing lint rules as part of a test or verification plan. Extends testing-strategy with lint-specific guidance: rule selection, gate placement, failure triage, and migration planning when introducing rules to an existing codebase. Do NOT use standalone — load the base testing-strategy skill alongside it — and do NOT use for chasing a specific lint failure in one file (that is debugging)."
  stability: experimental
  keywords: "[\"lint\",\"lint rules\",\"new rule\",\"pre-commit\",\"CI only\",\"lint integration\",\"static analysis\",\"eslint\",\"noImplicitAny\",\"phased lint rollout\"]"
  triggers: "[\"lint-overlay\"]"
  examples: "[\"plan ESLint rule introduction for a monorepo that has never had linting\",\"which lint rules should block CI and which should warn-only for now?\",\"migrate these legacy noImplicitAny violations in phased gates\",\"decide whether this new rule runs pre-commit or in CI only\"]"
  anti_examples: "[\"decide whether to unit-test or integration-test this handler\",\"extract this repeated code pattern into a shared util\"]"
  grounding: "{\"subject_matter\":\"Lint-specific verification planning in the Skill Graph starter library\",\"grounding_mode\":\"hybrid\",\"truth_sources\":[\"scripts/skill-lint.js\",\"scripts/lint/check-routing-quality.js\",\"scripts/lint/check-routing-eval.js\",\"examples/evals/lint-overlay.json\",\"skills/testing-strategy/SKILL.md\"],\"failure_modes\":[\"lint_failure_triaged_as_strategy_problem\",\"overlay_loaded_without_base_testing_strategy\",\"rule_migration_lacks_gate_placement\",\"routing_eval_claim_not_backed_by_harness\"],\"evidence_priority\":\"repo_code_first\"}"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/quality-assurance/lint-overlay/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# Lint Overlay

## Concept of the skill

Use when adding or enforcing lint rules as part of a test or verification plan. Extends testing-strategy with lint-specific guidance: rule selection, gate placement, failure triage, and migration planning when introducing rules to an existing codebase.

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

## Philosophy of the skill
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

## Verification

After applying this skill, verify:

- [ ] The task matches the declared scope, coverage, or positive examples.
- [ ] The response follows this skill's workflow or checks instead of generic advice.
- [ ] The exclusions in `## Do NOT Use When` do not point to a better skill.

## Do NOT Use When
| Use instead | When |
|---|---|
| `testing-strategy` alone | Lint is not in scope for this change — load only the base skill |
| `debugging` | The task is chasing a specific lint failure in one file, not planning lint-gate strategy |
| `refactor` | The task is fixing accumulated lint debt as structural cleanup — refactor covers behavior preservation during the cleanup |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `quality-assurance`
- Public: `true`
- Scope: Use when adding or enforcing lint rules as part of a test or verification plan. Extends testing-strategy with lint-specific guidance: rule selection, gate placement, failure triage, and migration planning when introducing rules to an existing codebase. Do NOT use standalone — load the base testing-strategy skill alongside it — and do NOT use for chasing a specific lint failure in one file (that is debugging).

**When to use**
- plan ESLint rule introduction for a monorepo that has never had linting
- which lint rules should block CI and which should warn-only for now?
- migrate these legacy noImplicitAny violations in phased gates
- decide whether this new rule runs pre-commit or in CI only
- Triggers: `lint-overlay`

**Not for**
- decide whether to unit-test or integration-test this handler
- extract this repeated code pattern into a shared util

**Related skills**
- Related: `pattern-recognition`, `debugging`, `refactor`, `skill-infrastructure`, `problem-locating-solving`

**Grounding**
- Mode: `hybrid`
- Truth sources: `scripts/skill-lint.js`, `scripts/lint/check-routing-quality.js`, `scripts/lint/check-routing-eval.js`, `examples/evals/lint-overlay.json`, `skills/testing-strategy/SKILL.md`

**Keywords**
- `lint`, `lint rules`, `new rule`, `pre-commit`, `CI only`, `lint integration`, `static analysis`, `eslint`, `noImplicitAny`, `phased lint rollout`

<!-- skill-graph-context:end -->
