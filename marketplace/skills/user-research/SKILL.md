---
name: user-research
description: "Use when planning or conducting generative qualitative research with real users — interviews, contextual inquiry, ethnographic observation, diary studies — to learn what people do, think, and need in their own context. Do NOT use for analytics review, survey statistics, A/B test interpretation, or agent-side intent classification — those are different research practices entirely. Do NOT use for Analyze last quarter's NPS results and produce a dashboard. Do NOT use for Classify whether this agent request from the user is high-risk before executing. Do NOT use for Set up an A/B test of two onboarding flows."
license: CC-BY-4.0
metadata:
  schema_version: "8"
  version: "1.0.0"
  subject: design
  deployment_target: portable
  scope: "Planning and conducting generative qualitative research with real users — interviews, contextual inquiry, ethnographic observation, diary studies — to learn what people do, think, and need in their own context. Portable across any product-discovery effort; principle-grounded, not repo-bound. Excludes analytics review, survey statistics, A/B test interpretation, and agent-side intent classification (different research practices)."
  owner: skill-graph-maintainer
  freshness: "2026-05-12"
  drift_check: "{\"last_verified\":\"2026-05-12\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"user interviews\",\"contextual inquiry\",\"ethnographic observation\",\"diary study\",\"generative research\",\"qualitative research\",\"interview guide\",\"leading questions\",\"master-apprentice model\",\"in-context observation\"]"
  triggers: "[\"interview users\",\"user research plan\",\"what to ask users\",\"contextual inquiry\",\"diary study\"]"
  examples: "[\"Draft an interview guide for SMB founders adopting their first accounting software.\",\"How do I observe ICU nurses on shift without disturbing the workflow?\",\"Review my interview script for leading questions and solution-prompts.\",\"Plan a two-week diary study for commuters using public transit apps.\"]"
  anti_examples: "[\"Analyze last quarter's NPS results and produce a dashboard.\",\"Classify whether this agent request from the user is high-risk before executing.\",\"Set up an A/B test of two onboarding flows.\"]"
  relations: "{\"related\":[\"problem-framing\",\"research-synthesis\",\"usability-testing\",\"design-thinking\",\"intent-recognition\"],\"boundary\":[{\"skill\":\"usability-testing\",\"reason\":\"usability-testing is evaluative — it watches users attempt tasks on an artifact to find usability defects. user-research is generative — it studies users before any artifact exists, to discover needs and context.\"}]}"
  structural_verdict: PASS
  truth_verdict: PASS
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/design/user-research/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# User Research

## Coverage
User research covers the generative qualitative methods that surface what people do, think, feel, and need — typically before a solution exists. The core methods are **semi-structured interviews** (Steve Portigal, Tomer Sharon), **contextual inquiry** with its master-apprentice stance (Beyer & Holtzblatt), **ethnographic observation** in the user's actual environment, **diary studies** for behaviors that unfold over days or weeks, and **intercept studies** for in-the-moment reactions. Each method trades off depth, naturalism, scale, and scheduling cost differently; choosing well depends on what kind of evidence the project needs.

The skill includes the craft of **interview construction**: opening with broad context questions, moving to specific recent episodes ("tell me about the last time you…"), avoiding hypotheticals ("would you use…") and leading prompts ("don't you find it frustrating that…"), and using silence as a tool. The **critical incident technique** (Flanagan) and **5 Whys** laddering are used in-session to push past surface answers. The practice also includes what NOT to do: solution-prompting, confirmation seeking, anchoring on the interviewer's own hypothesis, interrupting, and steering toward a preferred narrative.

Contextual methods extend interviews into the user's environment. **Contextual inquiry** treats the user as the master craftsperson and the researcher as an apprentice asking clarifying questions while the user works. **Fly-on-the-wall observation** removes the researcher's questions entirely. **Shadowing** follows a single user through their day. Each makes different trade-offs between naturalism (less intrusion → more authentic behavior) and depth (more questions → richer interpretation).

Diary and longitudinal methods cover behaviors that do not surface in a single session. Daily prompts, photo diaries, and experience sampling (Csíkszentmihályi) capture in-context moments and reduce recall bias.

## Philosophy
User research is harder than it looks because the natural conversational instincts that make humans good company — finishing each other's sentences, offering sympathy, confirming what the other person seems to want to hear — actively destroy data quality. The discipline trains interviewers to do the opposite: leave silence intact, ask the participant to "say more about that" instead of paraphrasing, and treat surprise as the signal that the conversation is producing new information.

The practice is grounded in a specific epistemological claim: people are unreliable narrators of their own behavior, especially when asked hypothetical or future-tense questions, but they are reasonably reliable when describing concrete recent episodes. This is why methods skew toward "tell me about the last time" over "would you ever" — episodic memory is more trustworthy than self-prediction. It is also why observation outranks interview when the project can afford it: what people do and what people say they do are routinely different.

## Verification
- The interview guide contains no leading, hypothetical, or solution-prompting questions; every question can be answered by describing a real past event.
- Sessions are recorded (with consent) so synthesis works from primary data, not interviewer memory.
- At least one finding from the research contradicts a hypothesis the team held going in — if every finding confirms prior beliefs, the questions were probably leading.
- For contextual studies, observation happened in the user's real environment, not a lab simulation of it.
- Sample composition is documented and matches the recruitment criteria — including who was excluded and why.
- The researcher can name what they don't yet know after the session, not just what they confirmed.

## Do NOT Use When
- The question is quantitative (how many, what percentage, statistical significance) — use survey or analytics methods, not generative interviews.
- A working artifact already exists and the question is "does this artifact work for users" — use **usability-testing**.
- The team needs to make sense of research that has already been collected — use **research-synthesis**.
- The "user" is an agent or system, not a human — interview methods do not transfer to non-humans.
- The team has not yet agreed on what problem they are studying — return to **problem-framing** first, then design research to investigate the framed problem.
- The need is to evaluate a feature against a hypothesis with a control group — use experimental methods (A/B, RCT), not interviews.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `design`
- Deployment: `portable`
- Scope: Planning and conducting generative qualitative research with real users — interviews, contextual inquiry, ethnographic observation, diary studies — to learn what people do, think, and need in their own context. Portable across any product-discovery effort; principle-grounded, not repo-bound. Excludes analytics review, survey statistics, A/B test interpretation, and agent-side intent classification (different research practices).

**When to use**
- Draft an interview guide for SMB founders adopting their first accounting software.
- How do I observe ICU nurses on shift without disturbing the workflow?
- Review my interview script for leading questions and solution-prompts.
- Plan a two-week diary study for commuters using public transit apps.
- Triggers: `interview users`, `user research plan`, `what to ask users`, `contextual inquiry`, `diary study`

**Not for**
- Analyze last quarter's NPS results and produce a dashboard.
- Classify whether this agent request from the user is high-risk before executing.
- Set up an A/B test of two onboarding flows.
- Owned by `usability-testing`

**Related skills**
- Related: `problem-framing`, `research-synthesis`, `usability-testing`, `design-thinking`, `intent-recognition`

**Keywords**
- `user interviews`, `contextual inquiry`, `ethnographic observation`, `diary study`, `generative research`, `qualitative research`, `interview guide`, `leading questions`, `master-apprentice model`, `in-context observation`

<!-- skill-graph-context:end -->
