---
name: agent-eval-design
description: "Use when designing evaluations for AI agents, skills, routers, prompts, tool-use policies, or multi-step workflows: task sets, rubrics, graders, hard negatives, regression cases, traces, and acceptance thresholds. Do NOT use for application test planning (use `testing-strategy`), skill-library health tooling (use `skill-infrastructure`), or live debugging of a failed run (use `debugging`). Do NOT use for plan unit, integration, and e2e tests for this product feature. Do NOT use for run the skill graph lint and overlap tooling. Do NOT use for debug why yesterday's agent run failed. Do NOT use for write production code to fix this failing test. Do NOT use for library health tooling (use skill-infrastructure)."
license: MIT
compatibility: "Portable eval-design discipline for agent workflows, skill routers, prompt systems, and tool-use policies."
allowed-tools: Read Grep
metadata:
  subject: quality-assurance
  deployment_target: portable
  scope: "Designing behavioral evaluations for AI agents, skills, routers, prompts, tool-use policies, and multi-step workflows: task sets, rubrics, graders, hard negatives, regression cases, traces, and acceptance thresholds. Portable across agentic systems and skill libraries. Excludes application-code test planning, skill-library health tooling, live failure debugging, and code-diff review."
  taxonomy_domain: ai-engineering/evaluation
  stability: experimental
  keywords: "[\"agent eval\",\"AI eval design\",\"skill routing eval\",\"eval rubric\",\"hard negatives\",\"grader design\",\"regression eval\",\"trace evaluation\",\"acceptance threshold\",\"prompt eval\"]"
  examples: "[\"design an eval set for whether this skill routes correctly against near-miss prompts\",\"create a rubric for judging agent outputs on grounded project knowledge extraction\",\"what hard negatives should test this router before we mark routing_eval present?\",\"turn these agent failure traces into regression eval cases\"]"
  anti_examples: "[\"plan unit, integration, and e2e tests for this product feature\",\"run the skill graph lint and overlap tooling\",\"debug why yesterday's agent run failed\",\"write production code to fix this failing test\"]"
  relations: "{\"boundary\":[{\"skill\":\"testing-strategy\",\"reason\":\"testing-strategy plans software tests; agent-eval-design designs behavioral evals for AI agents and skills\"},{\"skill\":\"skill-infrastructure\",\"reason\":\"skill-infrastructure owns library health tooling; agent-eval-design owns eval content and grading design\"},{\"skill\":\"debugging\",\"reason\":\"debugging investigates a live failure; agent-eval-design turns patterns into future evals\"},{\"skill\":\"code-review\",\"reason\":\"code-review evaluates diffs; agent-eval-design evaluates agent behavior\"}],\"related\":[\"skill-router\",\"context-engineering\",\"testing-strategy\",\"skill-infrastructure\"],\"verify_with\":[\"testing-strategy\",\"skill-infrastructure\"]}"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/quality-assurance/agent-eval-design/SKILL.md
  skill_graph_export_description_projection: anti_examples+boundary
---

# Agent Eval Design

## Coverage

Design evaluations for agent behavior, skill routing, prompt systems, tool-use policies, and multi-step workflows. Covers task selection, expected behavior, rubrics, graders, hard negatives, trace capture, regression cases, thresholds, coverage, and eval maintenance.

## Philosophy

Agent evals are behavioral contracts. They should measure whether the agent does the right thing under realistic ambiguity, not whether it can parrot the happy path.

The highest-value cases are hard negatives and prior failures. A routing eval with only obvious positives gives false confidence.

## Method

1. Define the behavior being evaluated in one sentence.
2. Collect realistic positive cases, near misses, and failure traces.
3. Write expected outcomes that are observable.
4. Add hard negatives that should route elsewhere or refuse an unsafe path.
5. Choose grader type: exact, rubric, trace inspection, artifact check, or hybrid.
6. Set pass thresholds and severity for failures.
7. Add regression cases whenever a real agent failure is fixed.

## Eval Case Matrix

| Behavior surface | Positive cases | Hard negatives | Grader shape |
|---|---|---|---|
| Skill routing | Real prompts that should load the target skill | Near-miss prompts owned by boundary skills or no skill | Exact expected skill plus explanation check |
| Grounded project work | Tasks with enough source files to answer correctly | Stale docs, missing files, or tempting unsupported claims | Rubric plus citation/trace inspection |
| Tool-use policy | Cases where tool use is necessary and allowed | Cases where a tool would leak data, mutate state, or skip approval | Trace inspection against policy constraints |
| Multi-step workflow | End-to-end tasks with intermediate checkpoints | Partial completion, skipped verification, or wrong order | Artifact check plus step-completion rubric |
| Prompt/system behavior | Representative prompts from actual usage | Jailbreaks, prompt injection, ambiguity, or scope inversion | Rubric with refusal/boundary criteria |

## Threshold Design

- Set the pass bar from user and system risk, not from a desired green percentage.
- Separate blocking failures from score-lowering failures; one critical privacy or mutation error should fail even if most rubric items pass.
- Track regressions from prior failures as named cases so fixes stay fixed.
- Keep hard negatives in the suite even when they feel adversarial; they are where overconfident agents reveal the real boundary.

## Verification

- [ ] Eval cases include positives, hard negatives, and prior failures
- [ ] Expected outcomes are observable and not preference-only
- [ ] The grader can distinguish partially correct from wrong
- [ ] Thresholds match risk, not vanity metrics
- [ ] Cases cover routing, grounding, tool use, and final artifact where relevant
- [ ] New failures become regression cases
- [ ] Eval metadata honestly reflects run state

## Do NOT Use When

| Use instead | When |
|---|---|
| `testing-strategy` | You are planning tests for application code or product behavior. |
| `skill-infrastructure` | You are building or running skill-library health tooling. |
| `debugging` | You need to root-cause a specific failed run. |
| `code-review` | You need to review a code diff. |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `quality-assurance`
- Deployment: `portable`
- Domain: `ai-engineering/evaluation`
- Scope: Designing behavioral evaluations for AI agents, skills, routers, prompts, tool-use policies, and multi-step workflows: task sets, rubrics, graders, hard negatives, regression cases, traces, and acceptance thresholds. Portable across agentic systems and skill libraries. Excludes application-code test planning, skill-library health tooling, live failure debugging, and code-diff review.

**When to use**
- design an eval set for whether this skill routes correctly against near-miss prompts
- create a rubric for judging agent outputs on grounded project knowledge extraction
- what hard negatives should test this router before we mark routing_eval present?
- turn these agent failure traces into regression eval cases

**Not for**
- plan unit, integration, and e2e tests for this product feature
- run the skill graph lint and overlap tooling
- debug why yesterday's agent run failed
- write production code to fix this failing test
- Owned by `testing-strategy`
- Owned by `skill-infrastructure`: library health tooling
- Owned by `debugging`
- Owned by `code-review`

**Related skills**
- Verify with: `testing-strategy`, `skill-infrastructure`
- Related: `skill-router`, `context-engineering`, `testing-strategy`, `skill-infrastructure`

**Keywords**
- `agent eval`, `AI eval design`, `skill routing eval`, `eval rubric`, `hard negatives`, `grader design`, `regression eval`, `trace evaluation`, `acceptance threshold`, `prompt eval`

<!-- skill-graph-context:end -->
