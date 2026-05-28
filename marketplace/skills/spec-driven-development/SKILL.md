---
name: spec-driven-development
description: "Use when starting a non-trivial feature, refactor, or agent implementation that needs a written spec, plan, task breakdown, and verification path before code changes. Covers Spec Kit-style SDD phases, requirements-vs-plan separation, task traceability, review gates, and spec-compliance verification. Do NOT use for one-line edits, README-only fixes, post-implementation code review (use `code-review`), or test-level decisions (use `testing-strategy`)."
license: MIT
compatibility: "Markdown, Git, agent-skill runtimes"
allowed-tools: Read Grep Bash
metadata:
  schema_version: "8"
  version: "1.1.0"
  subject: code-engineering
  deployment_target: portable
  taxonomy_domain: engineering/methodology
  owner: skill-graph-maintainer
  freshness: "2026-05-18"
  drift_check: "{\"last_verified\":\"2026-05-18\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"spec driven development\",\"SDD\",\"specification first\",\"technical plan\",\"task decomposition\",\"spec.md\",\"plan.md\",\"tasks.md\",\"requirements before code\",\"phase gates\"]"
  triggers: "[\"sdd-skill\",\"planning-mode\",\"spec-driven-development\"]"
  relations: "{\"boundary\":[{\"skill\":\"code-review\",\"reason\":\"code-review evaluates a concrete diff after implementation; spec-driven-development shapes the spec, plan, and task path before implementation\"},{\"skill\":\"testing-strategy\",\"reason\":\"testing-strategy decides the right test level and regression target; spec-driven-development only requires that the plan names verification evidence traceable to the spec\"}],\"related\":[\"testing-strategy\",\"evaluation\"],\"verify_with\":[\"code-review\",\"testing-strategy\"]}"
  grounding: "{\"subject_matter\":\"Spec-driven development workflow for AI-assisted engineering using specification, plan, task, implementation, and verification artifacts\",\"grounding_mode\":\"hybrid\",\"truth_sources\":[\"https://github.github.com/spec-kit/index.html\",\"https://github.github.com/spec-kit/reference/workflows.html\",\"https://github.com/github/spec-kit\",\"https://standards.ieee.org/ieee/29148/6937/\"],\"failure_modes\":[\"code_started_before_spec_or_plan\",\"implementation_plan_missing_architecture_contracts_or_tests\",\"tasks_not_traceable_to_plan_or_success_criteria\",\"verification_not_mapped_to_spec_requirements\",\"workflow_requires_vendor_specific_commands_when_plain_markdown_would_work\"],\"evidence_priority\":\"equal\"}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":90,\"review_cadence\":\"quarterly\"}"
  structural_verdict: PASS
  truth_verdict: UNVERIFIED
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/code-engineering/spec-driven-development/SKILL.md
---
# Spec Driven Development (SDD)

## Coverage

- When to require SDD: non-trivial work, core-module refactors, ambiguous agent loops, cross-boundary changes, or any task where hidden requirements could be expensive after code exists.
- Artifact chain: `spec.md` for what and why, `plan.md` for how, `tasks.md` for ordered work, implementation commits for execution, and a final verification report for spec compliance.
- Phase discipline: specification before plan, plan before tasks, tasks before implementation, and verification before completion.
- Traceability: each task and verification check maps back to a requirement, constraint, or success criterion.
- Review gates: human approval when available, or an explicit documented rationale when autonomous work must proceed.
- Scope control: if implementation discovers the spec or plan is wrong, update the upstream artifact before continuing.
- Post-implementation learning: measure whether the change solved the problem when the task has a product, operational, or user-facing success metric.

## Philosophy

AI agents default to implementation-first thinking: receive a prompt, start coding. That produces features that compile, pass narrow tests, and still miss the actual requirement. SDD makes the specification the source of truth and turns the plan, task list, implementation, and verification report into derived artifacts.

GitHub Spec Kit frames the core process as Spec → Plan → Tasks → Implement. This skill keeps that source shape and adds a final Verify gate because a skill application is not complete until the implementation is checked against the spec that justified it.

The most important separation is **what** versus **how**. The spec names user value, constraints, non-goals, and success criteria. The plan names architecture, contracts, data flow, testing, and risk. Collapsing those two artifacts creates design debt before the first file is edited.

## Workflow

Use this workflow in order. If a phase reveals that an earlier artifact is wrong, update the earlier artifact first and restart from there.

### 1. Decide Whether SDD Is Required

Use the lightweight path only for small, local, reversible edits. Use SDD when any of these are true:

- More than one module, service, schema, public API, or user flow may change.
- Requirements are ambiguous or conflict with existing behavior.
- Security, privacy, accessibility, data integrity, or migration risk is present.
- An agent loop has stalled because it keeps discovering new scope while coding.

### 2. Specify (`spec.md`)

The specification defines the desired outcome without prescribing implementation mechanics.

- Requirements: user-visible behavior, system behavior, and must-have outcomes.
- Constraints: architecture boundaries, security/privacy rules, accessibility, performance, compatibility, and data handling.
- Non-goals: what this change explicitly will not solve.
- Success criteria: observable facts that prove the work is done.
- Edge cases: zero states, failure states, concurrent access, volume limits, and rollback paths.

> **Anti-pattern**: Describing implementation details (e.g., "Use a `for` loop") in the spec. The spec is for "What", not "How".

Exit gate: the spec is approved by the human owner, or the agent records why it is safe to proceed without explicit approval.

### 3. Plan (`plan.md`)

The plan translates the spec into an implementation strategy.

- Architecture: affected modules, new components, storage/schema changes, migration path, and rollback strategy.
- Data flow: how data moves between inputs, processing, storage, outputs, and external systems.
- Contracts: API request/response shapes, events, schemas, status codes, and compatibility promises.
- Testing: evidence needed at unit, integration, contract, E2E, manual, or visual levels.
- Risks: hidden dependencies, breaking changes, sequencing hazards, and observability needs.

Exit gate: the plan explains how every success criterion will be implemented and verified.

### 4. Decompose (`tasks.md`)

Break the plan into ordered, testable tasks.

- One behavioral change per task.
- Each task names the spec requirement or plan section it satisfies.
- Each task includes a verification command, check, or review step.
- Dependencies are topologically ordered so prerequisite work appears first.
- Parallel tasks are marked only when they can be executed without touching the same files or contracts.

Exit gate: a reader can execute tasks in order without rediscovering architecture decisions.

### 5. Implement

Implement from `tasks.md`, not from memory.

- Complete tasks in dependency order.
- Keep each commit or patch scoped to the task it claims.
- If a task exposes a wrong requirement, update `spec.md`; if it exposes a wrong design, update `plan.md`; then regenerate or adjust tasks.
- Do not silently add scope just because the implementation made it convenient.
- Keep tests, docs, and operational checks attached to the task that requires them.

### 6. Verify

Verification is the only path to finality.

- Spec compliance: every must-have and success criterion has evidence.
- Plan compliance: implementation follows the chosen architecture or documents an approved change.
- Regression evidence: focused tests, lint/type checks, contract checks, or manual verification ran.
- User-facing quality: UI, copy, accessibility, and visual behavior match the spec and the project design system.
- Documentation: repo instructions, API docs, decisions, and runbooks are updated when the behavior or workflow changed.
- Residual risk: any skipped check has a named reason and owner.

### 7. Learn

When the spec has a product, operational, or user-facing metric, measure whether the change solved the intended problem.

- Define the success metric before implementation.
- Confirm the measurement mechanism exists.
- Collect enough evidence for the decision.
- Record whether to continue, adjust, or stop.

Skip the learning loop for pure infrastructure chores, small bug fixes with a regression test, and cosmetic edits with no measurable hypothesis.

## Verification Checklist

```text
SDD CHECK
=========
[ ] spec.md exists or the fast-track rationale is documented
[ ] spec.md separates requirements, constraints, non-goals, success criteria, and edge cases
[ ] plan.md maps each success criterion to architecture, contracts, data flow, and verification evidence
[ ] tasks.md is ordered, traceable, and verifiable
[ ] No code was written before the plan gate, or the exception is documented
[ ] Every implementation deviation updated the upstream spec or plan
[ ] Final verification confirms all spec success criteria
[ ] Eval, routing, or quality claims remain unverified unless the corresponding check actually ran
```

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| One-line edits, README-only fixes, or trivial local changes | no dedicated skill | The SDD overhead is larger than the change risk |
| Reviewing code quality after implementation | `code-review` | Code review owns diff-level correctness, risk, and merge-readiness assessment |
| Deciding what level of automated or manual testing is appropriate | `testing-strategy` | Testing strategy owns test-level selection and regression targeting |
| Holistic completion scoring after work is done | `evaluation` | Evaluation owns quality scoring and revision loops after implementation evidence exists |


## Verification

After applying this skill, verify:
- [ ] Changes follow the patterns documented above
- [ ] No regressions in affected functionality
- [ ] The final report names which spec criteria were satisfied and which checks produced evidence
