---
name: spec-driven-development
description: "This skill provides Spec Driven Development (SDD) expertise for AI engineering: the Specify → Plan → Tasks → Implement lifecycle. Use when starting any non-trivial task, refactoring a core module, or when an agent loop has stalled due to ambiguous requirements. Do NOT use for one-line edits or README fixes."
license: MIT
compatibility: "Markdown, Git, agent-skill runtimes"
allowed-tools: Read Grep Bash
metadata:
  schema_version: "4"
  version: "1.0.0"
  type: workflow
  category: ai-engineering
  domain: ai-engineering/workflow
  scope: reference
  owner: skill-graph-maintainer
  freshness: "2026-03-28"
  drift_check: "{\"last_verified\":\"2026-03-28\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"spec driven development\",\"SDD\",\"technical plan\",\"task decomposition\",\"specification\",\"architecture plan\",\"phase gates\",\"AI engineering methodology\"]"
  triggers: "[\"sdd-skill\",\"planning-mode\",\"spec-driven-development\"]"
  relations: "{\"verify_with\":[\"code-review\"]}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":90,\"review_cadence\":\"quarterly\"}"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v4
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/spec-driven-development/SKILL.md
---
# Spec Driven Development (SDD)

## Domain Context

**What is this skill?** This skill provides Spec Driven Development (SDD) expertise for AI engineering: the Specify → Plan → Tasks → Implement lifecycle. Use when starting any non-trivial task, refactoring a core module, or when an agent loop has stalled due to ambiguous requirements. Do NOT use for one-line edits or README fixes.

## Workflow

Use the ordered phases, checklists, and guardrails in the sections below as the canonical workflow for this skill. When multiple subsections describe steps, follow them in the order presented.

## Coverage

The 5-phase SDD lifecycle (Specify, Plan, Decompose, Implement, Verify), spec.md and plan.md artifact authoring, atomic task decomposition (<10 min per task with topological ordering), verification gates (spec compliance, zero regressions, visual QA, doc updates), and the Build-Measure-Learn validation loop for post-implementation learning.

## Philosophy

AI agents default to implementation-first thinking: receive a prompt, start coding. This produces features that "work" but miss edge cases, violate constraints, and accumulate design debt. SDD exists because fixing a design flaw in Markdown costs 10x less than fixing it in a pull request. By forcing the Specify and Plan phases before any code is written, agents surface hidden dependencies, breaking changes, and security constraints while they are cheap to address. Observed failure: agents that skip specs produce code that passes tests but fails real-world scenarios the spec would have caught.

> Spec Driven Development is the methodology of separating **"What"** (Specification) from **"How"** (Implementation). In the age of AI agents, SDD replaces "vibe coding" (iterative prompting without a plan) with systematic engineering.

## 1. The SDD Lifecycle

Every non-trivial task follows these five phases:

| Phase | Agent Role | Output Artifact | Exit Criteria |
|-------|------------|-----------------|---------------|
| **1. Specify** | Researcher | `spec.md` | Human approval of requirements |
| **2. Plan** | Architect | `plan.md` | Human approval of architecture |
| **3. Decompose**| Project Manager | Linear Tasks | Tasks are atomic (<10 mins) |
| **4. Implement**| Solver | Code + Tests | Tests pass, linting clear |
| **5. Verify** | Validator | RESULT report | Spec compliance confirmed |

**Rule**: Never start coding until the **Plan** phase is approved. Fixing a design flaw in Markdown is 10x cheaper than in a Pull Request.

## 2. The Specification (`spec.md`)

The `spec.md` defines the intent, constraints, and success criteria.

- **Requirements**: User stories and "Must-Haves"
- **Constraints**: Architecture, security, and PII rules (GDPR)
- **Success Criteria**: Observable behaviors that prove the task is "Done"
- **Edge Cases**: Zero states, error states, and high-volume data handling

> **Anti-pattern**: Describing implementation details (e.g., "Use a `for` loop") in the spec. The spec is for "What", not "How".

## 3. The Technical Plan (`plan.md`)

The `plan.md` defines the implementation strategy and architecture.

- **Architecture**: Affected modules, new components, and DB schema changes
- **Data Flow**: How data moves from input to storage to output
- **API Contracts**: Request/Response shapes and status codes
- **Testing Strategy**: Unit, integration, and E2E coverage targets

**Rule**: The plan must identify **hidden dependencies** and **breaking changes** before the first line of code is written.

## 4. Task Decomposition

Break the plan into atomic, testable tasks.

- **Atomic**: One behavioral change per task
- **Time-bound**: Each task should take an agent <10 minutes to implement
- **Verifiable**: Each task must have a verification step (e.g., run a specific test)
- **Topological Order**: Respect dependencies (Task B depends on Task A)

> **Source**: `skills/task-lifecycle/SKILL.md` task decomposition rules.

## 5. Verification Gates

Verification is the only path to finality.

- **SDD spec-compliance**: Every "Must-Have" in the spec is demonstrably true
- **Zero-regressions**: Existing tests still pass
- **Visual-QA**: UI changes match design-tokens and `composition-theory`
- **Doc-update**: AGENTS.md, CONTEXT.md, and relevant domain docs updated

## 6. Validate (Build-Measure-Learn)

After implementation, validate that the change actually solves the problem. This phase comes from Eric Ries's Lean Startup methodology.

### The BML Loop
1. **Build** — Minimum viable implementation (already done in Phase 4)
2. **Measure** — Collect data on whether the change achieved its goal
   - Does the DORA rework rate stay stable or improve?
   - Does user activation improve (if user-facing)?
   - Does the target metric move in the right direction?
3. **Learn** — Draw conclusions and decide next steps
   - **Persevere** — The hypothesis was correct, continue investing
   - **Pivot** — The hypothesis was wrong, change approach
   - **Stop** — The problem isn't worth solving at this time

### Validation Checklist
- [ ] Success metric defined before implementation (from the spec)
- [ ] Measurement mechanism in place (analytics, telemetry, user feedback)
- [ ] Data collected for at least one cycle
- [ ] Decision documented (persevere/pivot/stop) in Linear or decision ledger

### When to Skip Validation
- Pure infrastructure/tooling changes (validate via tests instead)
- Bug fixes (validate via regression test)
- Cosmetic changes under 10 lines

> Source: Eric Ries "The Lean Startup" (2011)

---

## 7. Verification Checklist

```text
SDD CHECK
=========
[ ] spec.md approved by human (or documented rationale)
[ ] plan.md approved by human (or documented rationale)
[ ] Tasks are atomic (<10 min execution)
[ ] Dependencies are explicitly ordered
[ ] No code written until Plan phase is complete
[ ] Every task has an associated test case
[ ] Final verification confirms ALL spec success criteria met
```

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| One-line edits, README fixes, or trivial changes | `effort` | Effort calibration determines when fast-track is appropriate |
| Breaking a plan into atomic tasks with dependencies | `task` | Task skill owns decomposition mechanics and topological ordering |
| Reviewing code quality after implementation | `code-review` | Code review owns post-implementation quality assessment |
| Designing the UI layout and visual contracts | `design-execution` | Design execution owns the visual implementation doctrine |


## Verification

After applying this skill, verify:
- [ ] Changes follow the patterns documented above
- [ ] No regressions in affected functionality
