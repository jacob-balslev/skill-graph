---
name: problem-framing
description: "Use when a team is converging on solutions before agreeing on the problem, when a brief reads as a feature request, when symptoms and root needs are tangled, or when assumptions need surfacing before design work proceeds. Do NOT use for code-level bug triage, runtime failure diagnosis, or root-cause analysis of system errors — those are engineering investigation tasks, not design problem framing. Do NOT use for Find the bug causing the 500 error in the checkout endpoint. Do NOT use for Why is the test suite flaky on CI? Do NOT use for Classify whether this agent request is high-risk before executing."
license: CC-BY-4.0
metadata:
  schema_version: "8"
  version: "1.0.0"
  subject: design-craft
  deployment_target: portable
  owner: skill-graph-maintainer
  freshness: "2026-05-12"
  drift_check: "{\"last_verified\":\"2026-05-12\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"how might we\",\"problem statement\",\"reframing\",\"assumption mapping\",\"root need\",\"symptom vs need\",\"point of view statement\",\"jobs to be done framing\",\"design challenge\",\"double diamond discover\"]"
  triggers: "[\"frame this problem\",\"how might we\",\"write a problem statement\",\"this brief is a solution\",\"what are we actually solving\"]"
  examples: "[\"We've been asked to 'add a chatbot' — help me reframe what we're actually solving for users.\",\"Draft three how-might-we statements from these synthesis insights.\",\"The PRD jumps straight to features; help me extract the underlying user problem.\",\"List the assumptions baked into this product brief and rank them by riskiness.\"]"
  anti_examples: "[\"Find the bug causing the 500 error in the checkout endpoint.\",\"Why is the test suite flaky on CI?\",\"Classify whether this agent request is high-risk before executing.\"]"
  relations: "{\"related\":[\"user-research\",\"ideation\",\"research-synthesis\",\"design-thinking\"],\"boundary\":[{\"skill\":\"problem-locating-solving\",\"reason\":\"problem-locating-solving handles bug localization in source code — concrete failure traced to a line or function. problem-framing handles ambiguous human/business problems where the question itself is unclear and there is no error to reproduce.\"},{\"skill\":\"diagnosis\",\"reason\":\"diagnosis handles failure triage of broken systems and incidents. problem-framing handles upstream definition of what a team should be working on at all.\"}]}"
  structural_verdict: PASS
  truth_verdict: PASS
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/design-craft/problem-framing/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# Problem Framing

## Coverage
Problem framing covers the practices that move a team from a vague request, complaint, or feature brief to a sharply articulated problem statement that does not pre-commit to a solution. Core techniques include the **How Might We** reformulation (popularized by IDEO and the Stanford d.school), the **point-of-view statement** (`<user> needs <need> because <insight>`), **jobs-to-be-done** problem articulation (Clayton Christensen, Tony Ulwick), **assumption mapping** to surface what a team is taking on faith, and **5 Whys** style symptom-to-need laddering when a presenting issue masks a deeper one. The UK Design Council's Double Diamond names this entire phase **Discover → Define**, and treats the transition from divergent discovery to convergent problem definition as a distinct skill from solutioning.

The practice draws a hard line between three things that beginners conflate: a **symptom** (an observed irritant), a **problem** (a structured statement of an unmet need), and a **solution** (a proposed intervention). A brief that says "add notifications" is a solution; "users miss time-sensitive updates" is a problem; "I keep forgetting to renew my license" is a symptom. Reframing techniques surface which level the team is operating at and explicitly demote solutions back to problems before ideation begins.

A separate body of methods addresses **problems that are already solutions in disguise**. Tim Brown's HBR essay (2008) and the Stanford d.school bootleg argue that the biggest single failure mode in human-centered work is solving the wrong problem confidently. Tools like the **5 Whys**, **assumption laddering**, and the **inversion technique** (asking what would make the problem worse) are designed to expose where a brief embeds an unexamined causal claim.

## Philosophy
Problem framing exists because solutions are cheap to imagine and expensive to build — and the cost of building the wrong solution dwarfs the cost of spending another day on the question. The discipline insists that ambiguity at the top of the funnel is not a bug to be eliminated by acting quickly; it is a signal that more discovery is needed. A well-framed problem is narrow enough to act on, broad enough to admit several solutions, and honest about which user it serves.

The practice is opinionated about language. "How might we" is not interchangeable with "how do we" — the conditional voice keeps possibility open. A point-of-view statement that names a solution ("users need a dashboard") has framed nothing; one that names a need ("users need to know whether they are on track without opening the app") has. Framing rewards precision over poetry: every word in the problem statement should be defensible against the question "what evidence supports this word being here?"

## Verification
- The problem statement can be read aloud in one sentence without naming a specific solution, feature, or technology.
- At least one assumption in the original brief has been promoted to an explicit, testable claim — not silently accepted.
- A reader who did not attend the framing session can identify the user, the need, and the insight that motivates the need.
- The team can articulate at least two materially different solutions that would satisfy the problem statement — confirming the frame is not solution-shaped.
- The "5 Whys" or equivalent laddering has been applied at least once to the presenting symptom, and the team agrees the chosen level is the right altitude to act on.
- The how-might-we is neither too narrow (admitting only the obvious solution) nor too broad (admitting solutions the team cannot ship).

## Do NOT Use When
- A specific software component is failing and the question is "where in the code does this break" — use **problem-locating-solving** for bug localization.
- A production incident is in progress and the team needs to triage a failure — use **diagnosis**.
- The problem is fully understood and the next action is generating solution concepts — go directly to **ideation**.
- There is no research evidence yet about the user or context, only opinions in the room — gather primary input first via **user-research**, then return to framing with data.
- The task is decomposing a single known task into UI steps — use **task-analysis** instead of journey-spanning framing.
- The "problem" is an internal engineering modeling exercise (event flows, bounded contexts) — use **event-storming** or **conceptual-modeling**.

## Skill Graph context

<!-- generated by scripts/export-marketplace-skills.js from Skill Metadata Protocol fields; do not edit by hand -->

**Classification**
- Subject: `design-craft`
- Deployment: `portable`

**When to use**
- We've been asked to 'add a chatbot' — help me reframe what we're actually solving for users.
- Draft three how-might-we statements from these synthesis insights.
- The PRD jumps straight to features; help me extract the underlying user problem.
- List the assumptions baked into this product brief and rank them by riskiness.
- Triggers: `frame this problem`, `how might we`, `write a problem statement`, `this brief is a solution`, `what are we actually solving`

**Not for**
- Find the bug causing the 500 error in the checkout endpoint.
- Why is the test suite flaky on CI?
- Classify whether this agent request is high-risk before executing.
- Owned by `problem-locating-solving`
- Owned by `diagnosis`

**Related skills**
- Related: `user-research`, `ideation`, `research-synthesis`, `design-thinking`

**Lifecycle & audit status**
- Stability: `experimental`
- Freshness: `2026-05-12`
- Eval state: `unverified`
- Routing eval: `absent`
- Audit status: structural PASS, truth PASS, comprehension UNVERIFIED, application UNVERIFIED
- Last audited: `2026-05-28`

**Provenance**
- version 1.0.0, schema v8, owner `skill-graph-maintainer`
- Keywords: `how might we`, `problem statement`, `reframing`, `assumption mapping`, `root need`, `symptom vs need`, `point of view statement`, `jobs to be done framing`, `design challenge`, `double diamond discover`
