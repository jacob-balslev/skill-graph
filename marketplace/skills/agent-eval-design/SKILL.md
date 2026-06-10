---
name: agent-eval-design
description: "Use when designing evaluations for AI agents, skills, routers, prompts, tool-use policies, or multi-step workflows: task sets, rubrics, graders, hard negatives, regression cases, traces, and acceptance thresholds. Do NOT use for application test planning (use `testing-strategy`), skill-library health tooling (use `skill-infrastructure`), or live debugging of a failed run (use `debugging`). Do NOT use for score this completed agent task against acceptance criteria and residual risk. Do NOT use for extract grounded project knowledge from these source files. Do NOT use for harden an LLM system against prompt injection from untrusted webpage content."
license: MIT
compatibility: "Portable eval-design discipline for agent workflows, skill routers, prompt systems, and tool-use policies."
allowed-tools: Read Grep
metadata:
  relations: "{\"related\":[\"debugging\",\"context-engineering\",\"code-review\",\"evaluation\",\"eval-driven-development\",\"skill-router\",\"testing-strategy\",\"skill-infrastructure\",\"project-knowledge-extraction\",\"prompt-injection-defense\"],\"suppresses\":[\"evaluation\",\"eval-driven-development\",\"prompt-injection-defense\",\"project-knowledge-extraction\"],\"verify_with\":[\"skill-infrastructure\",\"epistemic-grounding\",\"evaluation\",\"testing-strategy\"]}"
  subject: ai-engineering
  scope: "Designing behavioral evaluations for AI agents, skills, routers, prompts, tool-use policies, and multi-step workflows: task sets, rubrics, graders, hard negatives, regression cases, traces, and acceptance thresholds. Portable across agentic systems and skill libraries. Excludes application-code test planning, skill-library health tooling, live failure debugging, and code-diff review."
  public: "true"
  taxonomy_domain: ai-engineering/evaluation
  grounding: "{\"subject_matter\":\"Portable agent-evaluation design: eval task sets, rubrics, graders, trajectories, tool-use criteria, hard negatives, regression cases, thresholds, and maintenance\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://platform.openai.com/docs/guides/evals\",\"https://platform.openai.com/docs/guides/graders/\",\"https://github.com/openai/evals\",\"https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents\",\"https://google.github.io/adk-docs/evaluate/\",\"https://google.github.io/adk-docs/evaluate/criteria/\"],\"failure_modes\":[\"Eval suite contains only easy positives and misses hard negatives\",\"Rubric criteria are subjective and not observable from output, trace, or artifact\",\"Trajectory/tool-use behavior is graded only by final answer quality\",\"Model grader is accepted without calibration or spot-checks\",\"Thresholds are set from desired green rate instead of risk\",\"Agent eval design confused with application test planning, final artifact evaluation, or live debugging\"],\"evidence_priority\":\"equal\"}"
  stability: experimental
  keywords: "[\"agent eval\",\"agent-eval rubric\",\"rubric and grader\",\"AI eval design\",\"skill routing eval\",\"eval rubric\",\"hard negatives\",\"grader design\",\"trace evaluation\",\"acceptance threshold\"]"
  triggers: "[\"agent-eval-design\",\"agent eval design\",\"design an agent eval\",\"eval rubric design\",\"hard negative evals\"]"
  examples: "[\"design an agent eval set for whether this skill routes correctly against near-miss prompts\",\"create an agent-eval rubric and grader for grounded project-knowledge extraction outputs\",\"what hard negatives, trace checks, and thresholds should test this router before we mark routing_eval present?\"]"
  anti_examples: "[\"score this completed agent task against acceptance criteria and residual risk\",\"extract grounded project knowledge from these source files\",\"harden an LLM system against prompt injection from untrusted webpage content\"]"
  mental_model: "Agent eval design starts with a behavior claim and turns it into a repeatable experiment: task inputs, harness, observable output and trajectory evidence, grader, thresholds, and a regression loop. The design is only useful when it can falsify the claim with hard negatives, prior failures, and cases where the final answer looks plausible but the trace or artifact violates the contract."
  purpose: "Agent behavior changes when prompts, models, tools, context, retrieval, policies, or orchestration change. Agent eval design prevents teams from discovering those regressions in production by making expected behavior, failure boundaries, and release thresholds executable before changes ship."
  concept_boundary: "This skill designs reusable eval suites, graders, thresholds, hard negatives, and regression cases. It does not score one completed deliverable against evidence (evaluation), run eval suites as an iterative release process (eval-driven-development), choose product test levels (testing-strategy), operate skill-library health tooling (skill-infrastructure), investigate one failed run (debugging), extract project knowledge (project-knowledge-extraction), or design prompt-injection mitigations (prompt-injection-defense)."
  analogy: "Agent eval design is a flight simulator: it creates repeatable weather, failures, and landing criteria before trusting the pilot in production airspace."
  misconception: "The common mistake is treating a few happy-path prompts and an uncalibrated LLM judge as an eval suite. Real agent evals include hard negatives, trajectory checks, observable criteria, grader calibration, risk-based thresholds, and regression cases from actual failures."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/ai-engineering/agent-eval-design/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# Agent Eval Design

## Concept of the skill

**What it is:** `agent-eval-design` is the discipline of turning a desired agent behavior into a reusable eval suite: task set, expected outcomes, traces or artifacts to inspect, grader, hard negatives, thresholds, and regression maintenance.

**Mental model:** Start with a behavior claim, then build the smallest evidence-producing experiment that could falsify it. An agent eval has task inputs, an execution harness, observable outputs and trajectories, a grader, thresholds, and a loop that turns failures into regression cases.

**Why it exists:** Agent behavior changes with prompts, models, tools, retrieval, and orchestration. Without eval design, teams learn about regressions from production users or from optimistic self-assessment.

**What it is NOT:** It is not final scoring of a completed artifact, application-code test planning, skill-library health tooling, live debugging, or implementing the production fix.

**Adjacent concepts:** `evaluation` scores a concrete completed artifact; `eval-driven-development` runs eval suites as change gates; `testing-strategy` chooses product test levels; `skill-infrastructure` operates skill-library health tooling; `debugging` investigates one failed run; `project-knowledge-extraction` performs extraction; `prompt-injection-defense` designs defenses.

**One-line analogy:** Agent eval design is a flight simulator: it creates repeatable weather, failures, and landing criteria before trusting a pilot in production airspace.

**Common misconception:** A few happy-path prompts are not an eval suite. Useful agent evals include hard negatives, trajectory checks, grader calibration, and thresholds tied to risk.

## Coverage

Design evaluations for agent behavior, skill routing, prompt systems, tool-use policies, and multi-step workflows. Covers task selection, expected behavior, rubrics, graders, hard negatives, trace capture, regression cases, thresholds, coverage, and eval maintenance.

## Philosophy of the skill
Agent evals are behavioral contracts. They should measure whether the agent does the right thing under realistic ambiguity, not whether it can parrot the happy path.

The highest-value cases are hard negatives and prior failures. A routing eval with only obvious positives gives false confidence.

An agent eval needs both outcome and process evidence. Final-answer quality matters, but tool choice, ordering, approval behavior, retrieval grounding, mutation boundaries, and recovery from ambiguity are often where agent failures hide.

## Eval Design Primitives

| Primitive | What to define | Failure if weak |
|---|---|---|
| Behavior claim | The capability or boundary the eval is meant to measure | Cases drift into generic quality scoring |
| Task set | Positives, hard negatives, prior failures, and distribution slices | Suite passes while real users hit untested ambiguity |
| Harness | Tools, state, permissions, data, and trace capture available during the run | The eval measures a different environment than production |
| Observable evidence | Final output, tool calls, files changed, citations, screenshots, or traces | The grader guesses from vibes |
| Grader | Exact check, artifact check, rubric, model judge, human review, or hybrid | Pass/fail is subjective or impossible to reproduce |
| Threshold | Blocking criteria, score cutoffs, severity, and acceptable variance | Green rate becomes a vanity target |
| Regression loop | How fixed failures enter the suite and stay there | Failures reappear after prompt/model/tool changes |

## Method

1. Define the behavior being evaluated in one sentence.
2. Declare the harness: model family, tools, permissions, state, data, timeouts, and what trace/artifacts are captured.
3. Collect realistic positive cases, near misses, prior failures, and distribution slices.
4. Write expected outcomes that are observable from output, trace, tool calls, or artifacts.
5. Add hard negatives that should route elsewhere, refuse an unsafe path, or expose missing evidence.
6. Choose grader type: exact, rubric, trace inspection, artifact check, model judge, human calibration, or hybrid.
7. Set pass thresholds and severity from product risk, privacy risk, mutation risk, and regression cost.
8. Add regression cases whenever a real agent failure is fixed.
9. Record what the eval does not cover, so a passing suite is not mistaken for full certification.

## Eval Case Matrix

| Behavior surface | Positive cases | Hard negatives | Grader shape |
|---|---|---|---|
| Skill routing | Real prompts that should load the target skill | Near-miss prompts owned by boundary skills or no skill | Exact expected skill plus explanation check |
| Grounded project work | Tasks with enough source files to answer correctly | Stale docs, missing files, or tempting unsupported claims | Rubric plus citation/trace inspection |
| Tool-use policy | Cases where tool use is necessary and allowed | Cases where a tool would leak data, mutate state, or skip approval | Trace inspection against policy constraints |
| Multi-step workflow | End-to-end tasks with intermediate checkpoints | Partial completion, skipped verification, or wrong order | Artifact check plus step-completion rubric |
| Prompt/system behavior | Representative prompts from actual usage | Jailbreaks, prompt injection, ambiguity, or scope inversion | Rubric with refusal/boundary criteria |

## Grader Design

| Grader | Best for | Risk |
|---|---|---|
| Exact match | Routing labels, required fields, deterministic tool sequences | Too brittle for semantically valid variation |
| Artifact check | Files, JSON, screenshots, generated reports, database state | Misses reasoning or policy failures outside the artifact |
| Trace inspection | Tool-use order, approvals, retrieval, mutation boundaries | Requires reliable trace capture and normalization |
| Rubric | Multi-dimensional output quality or instruction following | Criteria can become subjective unless anchored to examples |
| Model judge | Semantic judgment at scale | Needs calibration, adversarial examples, and spot checks |
| Human review | Subjective or high-risk behavior | Slow and expensive; should calibrate automated checks, not replace all automation |

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
- Subject: `ai-engineering`
- Public: `true`
- Domain: `ai-engineering/evaluation`
- Scope: Designing behavioral evaluations for AI agents, skills, routers, prompts, tool-use policies, and multi-step workflows: task sets, rubrics, graders, hard negatives, regression cases, traces, and acceptance thresholds. Portable across agentic systems and skill libraries. Excludes application-code test planning, skill-library health tooling, live failure debugging, and code-diff review.

**When to use**
- design an agent eval set for whether this skill routes correctly against near-miss prompts
- create an agent-eval rubric and grader for grounded project-knowledge extraction outputs
- what hard negatives, trace checks, and thresholds should test this router before we mark routing_eval present?
- Triggers: `agent-eval-design`, `agent eval design`, `design an agent eval`, `eval rubric design`, `hard negative evals`

**Not for**
- score this completed agent task against acceptance criteria and residual risk
- extract grounded project knowledge from these source files
- harden an LLM system against prompt injection from untrusted webpage content

**Related skills**
- Verify with: `skill-infrastructure`, `epistemic-grounding`, `evaluation`, `testing-strategy`
- Related: `debugging`, `context-engineering`, `code-review`, `evaluation`, `eval-driven-development`, `skill-router`, `testing-strategy`, `skill-infrastructure`, `project-knowledge-extraction`, `prompt-injection-defense`

**Concept**
- Mental model: Agent eval design starts with a behavior claim and turns it into a repeatable experiment: task inputs, harness, observable output and trajectory evidence, grader, thresholds, and a regression loop. The design is only useful when it can falsify the claim with hard negatives, prior failures, and cases where the final answer looks plausible but the trace or artifact violates the contract.
- Purpose: Agent behavior changes when prompts, models, tools, context, retrieval, policies, or orchestration change. Agent eval design prevents teams from discovering those regressions in production by making expected behavior, failure boundaries, and release thresholds executable before changes ship.
- Analogy: Agent eval design is a flight simulator: it creates repeatable weather, failures, and landing criteria before trusting the pilot in production airspace.
- Common misconception: The common mistake is treating a few happy-path prompts and an uncalibrated LLM judge as an eval suite. Real agent evals include hard negatives, trajectory checks, observable criteria, grader calibration, risk-based thresholds, and regression cases from actual failures.

**Grounding**
- Mode: `universal`
- Truth sources: `https://platform.openai.com/docs/guides/evals`, `https://platform.openai.com/docs/guides/graders/`, `https://github.com/openai/evals`, `https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents`, `https://google.github.io/adk-docs/evaluate/`, `https://google.github.io/adk-docs/evaluate/criteria/`

**Keywords**
- `agent eval`, `agent-eval rubric`, `rubric and grader`, `AI eval design`, `skill routing eval`, `eval rubric`, `hard negatives`, `grader design`, `trace evaluation`, `acceptance threshold`

<!-- skill-graph-context:end -->
