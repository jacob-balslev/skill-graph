---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: evaluation
description: "This skill provides a structured framework for automated agentic evaluation and human feedback loops. It defines the 'Critic' persona, the 5-point quality scale, and the mandatory 'Evaluation-Revision' loop for all critical work."
version: 1.0.0
type: capability
category: engineering
domain: engineering/skill-system
scope: portable
owner: skill-graph-maintainer
freshness: "2026-03-29"
drift_check:
  last_verified: "2026-03-29"
eval_artifacts: planned
eval_state: unverified
routing_eval: absent
stability: experimental
license: MIT
compatibility:
  notes: "Markdown, Git, agent-skill runtimes"
allowed-tools: Read Grep Bash
keywords:
  - "evaluation"
  - "quality gate"
  - "feedback loop"
  - "critic persona"
  - "evaluation revision"
  - "completion contract"
  - "score 1-5"
  - "skeptical critic"
triggers:
  - "evaluation-skill"
  - "critic-loop-skill"
relations:
  boundary:
    - code-review
portability:
  readiness: scripted
  targets:
    - skill-md
lifecycle:
  stale_after_days: 90
  review_cadence: quarterly
---
# Evaluation Skill (Critic Persona)

## Domain Context

**What is this skill?** This skill provides a structured framework for automated agentic evaluation and human feedback loops. It defines the 'Critic' persona, the 5-point quality scale, and the mandatory 'Evaluation-Revision' loop for all critical work.

## Coverage

This skill covers the Skeptical Critic evaluation framework for AI agent work: the 5-point quality scale (Broken through State-of-the-Art), the mandatory Evaluation-Revision loop for all critical work, Goal Alignment auditing against implementation plans, Pattern Compliance checking (financial nullish coalescing, composition-theory focal points, semantic naming), the evaluation process flow (Persona, Identify, Score, Critique, Iterate), and the repo-specific completion contract (code + docs + Linear + verification evidence).

## Philosophy

Without this skill, agents self-assess as "done" after code compiles and tests pass, missing the completion contract that includes documentation updates, Linear task reporting, verification evidence, and adherence to project-specific patterns. The Skeptical Critic persona exists because agents are systematically optimistic about their own output quality. By forcing a numeric score with explicit gap identification, this skill prevents the "ship it because it works" failure mode that produces technically functional but incomplete deliverables.

# MANDATORY ACTIVATION TRIGGER (SYSTEM DIRECTIVE)
This skill MUST be activated after EVERY meaningful implementation or cleanup step. It acts as a final 'Skeptical Critic' to ensure no regressions or half-baked solutions are shipped.

### EVALUATION RUBRIC (1-5 SCALE)
1. **Broken/Unusable**: Fails basic requirements, contains bugs or syntax errors.
2. **Partial/Risky**: Meets some goals but lacks edge-case coverage or violates security rules.
3. **Functional/Standard**: Meets all requirements but lacks 'Craft' (polish, docs, naming).
4. **Polish/Repo-Compliant**: High quality, full doc updates, passes all local tests.
5. **State-of-the-Art**: World-class implementation with zero-defect proof and proactive optimizations.

## Core Mandate

You MUST evaluate implementation against **Goal Alignment** and **Pattern Compliance**.

### 1. Goal Alignment (Audit)
- **Check**: Does the output solve the user's specific request?
- **Verify**: Cross-reference the `implementation_plan.md`. If any numbered requirement is missing (e.g., "tax reconciliation"), the score MUST be below 3.

### 2. Pattern Compliance (Grounded Evaluation)
You MUST proactively check for these project-specific requirements:
- **Financial Logic**: Does every calculation use nullish coalescing or zero-guards? (Pattern: `(val ?? 0)`). If missing, score is < 3.
- **UI & Layout**: Does the page have a clear L1 focal point according to `composition-theory`?
- **Naming**: Does it follow `semantics` rules (no generic suffixes like `Helper` or `Utils`)?

## Quality Scale (1-5)

You MUST assign a numeric score (1-5) and a 1-sentence justification for each.

1. **Broken/Dangerous**: Logic errors, security flaws, or incomplete file writes.
2. **Suboptimal**: Violates key patterns (missing `?? 0`, hardcoded strings, no focal point).
3. **Acceptable**: Meets functional goals and matches most patterns.
4. **Professional**: Follows all domain skills and design guidelines; well-documented.
5. **Exceptional**: Proactively handles edge cases (Skeleton states, error boundaries).

## Evaluation Process

1. **Persona**: Adopt the **Skeptical Critic** mindset.
2. **Identify**: List all changed files and their associated domain skills.
3. **Score**: Assign a 1-5 score.
4. **Critique**: List exactly what is missing or violates patterns.
5. **Iterate**: Do not consider a task "Done" until scores are >= 4.

## Key Files

| File | Why it matters |
|------|---------------|
| `docs/quality-doctrine.md` | The definition of "better" for Skill Graph artifacts |
| `skills/agent-eval-design/SKILL.md` | Agent, prompt, router, and skill evaluation design |
| `skills/code-review/SKILL.md` | Diff-level correctness and risk review |
| `skills/testing-strategy/SKILL.md` | Test planning and verification strategy |
| `skills/usability-testing/SKILL.md` | UI-specific evaluation gates |

## Reference Files
- [quality-doctrine](../../docs/quality-doctrine.md): The definition of "better."
- [usability-testing](../usability-testing/SKILL.md): UI-specific evaluation gates.

## Anti-Patterns

| Anti-pattern | Why it fails | Do instead |
|---|---|---|
| Scoring >= 4 with missing docs | Violates the completion contract — code alone is never "done" | Check AGENTS.md routing table before scoring |
| Accepting "tests pass" as full verification | Narrow test success hides missing integration, core-loop, or edge-case coverage | Require evidence of the repo's canonical verification gates |
| Self-scoring without the Skeptical Critic persona | Agents are systematically optimistic about their own output | Adopt the Critic mindset explicitly before assigning any score |
| Treating evaluation as code review | Evaluation is holistic quality gating; code review is line-by-line technical analysis | Route technical review to `code-review`, keep evaluation for the completion contract |
| Skipping financial null-guard checks | Financial logic without `?? 0` guards produces silent NaN/undefined bugs | Always verify nullish coalescing on every financial calculation |

## Verification

After applying this skill, verify:
- [ ] A numeric 1-5 score was assigned with a 1-sentence justification
- [ ] All changed files were identified and checked against their domain skills
- [ ] The implementation plan (if one exists) was cross-referenced for missing requirements
- [ ] Financial calculations include nullish coalescing guards (`val ?? 0`)
- [ ] Documentation routing table was checked and required doc updates are included
- [ ] Linear task has a summary comment if the task has an associated issue
- [ ] Score is not >= 4 if any requirement from the plan is missing or docs are stale

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Reviewing code for logic bugs, type errors, or security issues | `code-review` | Code review owns the technical review; evaluation owns the holistic quality gate |
| Evaluating visual design quality or DESIGN_GUIDE compliance | `design-review` | Design review owns the pre/post design quality gates with specific visual checks |
| Assessing task completion in the multi-agent /manage pipeline | `task-evaluation` | Task-evaluation owns the A/B scoring and pass/fail verdict for automated pipelines |
| Running a generate-critique-revise self-review loop | `self-evaluation`, `reflection-pattern` | Self-evaluation and reflection own the iterative internal revision cycle |
| Defining what "better" means for a specific artifact type | `craft-doctrine` | Craft-doctrine defines quality standards; evaluation applies them |
