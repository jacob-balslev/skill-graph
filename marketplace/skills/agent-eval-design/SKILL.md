---
name: agent-eval-design
description: "Use when designing evaluations for AI agents, skills, routers, prompts, tool-use policies, or multi-step workflows: task sets, rubrics, graders, hard negatives, regression cases, traces, and acceptance thresholds. Do NOT use for application test planning (use `testing-strategy`), skill-library health tooling (use `skill-infrastructure`), or live debugging of a failed run (use `debugging`)."
license: MIT
compatibility: "Portable eval-design discipline for agent workflows, skill routers, prompt systems, and tool-use policies."
allowed-tools: Read Grep
metadata:
  schema_version: "4"
  version: "1.0.0"
  type: capability
  category: quality
  domain: ai-engineering/evaluation
  scope: portable
  owner: skill-graph-maintainer
  freshness: "2026-05-11"
  drift_check: "{\"last_verified\":\"2026-05-11\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"agent eval\",\"AI eval design\",\"skill routing eval\",\"eval rubric\",\"hard negatives\",\"grader design\",\"regression eval\",\"trace evaluation\",\"acceptance threshold\",\"prompt eval\"]"
  examples: "[\"design an eval set for whether this skill routes correctly against near-miss prompts\",\"create a rubric for judging agent outputs on grounded project knowledge extraction\",\"what hard negatives should test this router before we mark routing_eval present?\",\"turn these agent failure traces into regression eval cases\"]"
  anti_examples: "[\"plan unit, integration, and e2e tests for this product feature\",\"run the skill graph lint and overlap tooling\",\"debug why yesterday's agent run failed\",\"write production code to fix this failing test\"]"
  relations: "{\"boundary\":[{\"skill\":\"testing-strategy\",\"reason\":\"testing-strategy plans software tests; agent-eval-design designs behavioral evals for AI agents and skills\"},{\"skill\":\"skill-infrastructure\",\"reason\":\"skill-infrastructure owns library health tooling; agent-eval-design owns eval content and grading design\"},{\"skill\":\"debugging\",\"reason\":\"debugging investigates a live failure; agent-eval-design turns patterns into future evals\"},{\"skill\":\"code-review\",\"reason\":\"code-review evaluates diffs; agent-eval-design evaluates agent behavior\"}],\"related\":[\"skill-router\",\"context-engineering\",\"testing-strategy\",\"skill-infrastructure\"],\"verify_with\":[\"testing-strategy\",\"skill-infrastructure\"]}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":365,\"review_cadence\":\"quarterly\"}"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v4
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/agent-eval-design/SKILL.md
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

