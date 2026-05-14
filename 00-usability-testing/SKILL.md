---
name: usability-testing
description: "Use when observing real users attempting tasks on a prototype or live product to surface usability issues — moderated or unmoderated, think-aloud protocol, task scenarios, severity rating, sample sizing per Nielsen's heuristics. Do NOT use for automated test suites, code coverage analysis, CI pipelines, unit/integration testing, or any engineering verification — those are testing-strategy concerns, not human-behavior observation."
license: CC-BY-4.0
metadata:
  schema_version: "4"
  version: "1.0.0"
  type: capability
  category: design
  scope: portable
  owner: skill-graph-maintainer
  freshness: "2026-05-12"
  drift_check: "{\"last_verified\":\"2026-05-12\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"think aloud protocol\",\"task scenario\",\"moderated usability test\",\"unmoderated test\",\"severity rating\",\"five user rule\",\"formative testing\",\"summative testing\",\"hallway test\",\"moderator neutrality\",\"usability heuristics\",\"SUS score\",\"task success rate\",\"critical incident\"]"
  triggers: "[\"usability test\",\"think aloud\",\"test this prototype\",\"task scenarios\",\"test with users\"]"
  examples: "[\"Write three task scenarios for a usability test of this onboarding flow.\",\"How many participants do I need for a formative round on this prototype?\",\"Review my moderator script for neutrality and leading prompts.\",\"Rate the severity of these eight usability findings using Nielsen's scale.\"]"
  anti_examples: "[\"Add unit tests for the order-total calculation function.\",\"Set up the CI pipeline for the new repo.\",\"Run a load test against the checkout API.\"]"
  relations: "{\"related\":[\"prototyping\",\"user-research\",\"research-synthesis\",\"design-thinking\"],\"boundary\":[{\"skill\":\"testing-strategy\",\"reason\":\"testing-strategy is an engineering practice for automated test suites that verify code behavior against specifications. usability-testing is a research practice for observing humans interacting with artifacts. The shared word 'testing' is the only thing in common.\"},{\"skill\":\"a11y\",\"reason\":\"a11y covers accessibility conformance criteria (WCAG, screen reader behavior, keyboard operability). usability-testing can include accessibility-focused sessions but its scope is broader and its method is empirical observation rather than spec conformance.\"}]}"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v4
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/usability-testing/SKILL.md
---

# Usability Testing

## Coverage
Usability testing covers the evaluative research practice of watching people attempt realistic tasks on a prototype or product, then identifying the obstacles they encounter. The dominant method is the **think-aloud protocol** (Ericsson & Simon), where participants narrate their thoughts as they work, surfacing the mental model they are using and the points where it diverges from the design. Sessions are organized around **task scenarios** — short narratives that frame a goal without prescribing the steps ("you want to find out how much you owe in taxes this quarter") — and a **moderator** who maintains neutrality, resists answering questions, and prompts only with open-ended interventions like "what are you thinking now?" or "what did you expect to happen?".

The skill covers **sample sizing**. The widely-cited Nielsen/Landauer "5-user rule" estimates that 5 users surface ~85% of major usability problems for a homogeneous user group on a discrete task, with steeply diminishing returns afterward. The rule has important limits: it applies per distinct user segment, per discrete task scope, and to **formative** (iterative diagnostic) testing — not to **summative** (benchmark) studies, which require much larger samples for valid statistical comparison. Misapplying the 5-user rule to summative claims is a common error.

Findings are organized by **severity rating** (Nielsen's 0–4 scale: cosmetic, minor, major, catastrophic) so the team can triage. **Task success rate**, **time on task**, and standardized instruments like **SUS** (System Usability Scale, Brooke 1996) provide quantitative complements when needed. The practice distinguishes **moderated** sessions (richer data, higher cost, requires scheduling) from **unmoderated** tools (lower cost, scales to dozens of sessions, sacrifices the moderator's ability to follow up on surprises).

The skill also covers what NOT to do in a session: leading prompts, defending the design, explaining how the design "is supposed to work" when the participant gets stuck, and over-fitting interpretations to a single dramatic finding from one participant.

## Philosophy
Usability testing is built on a humbling claim: designers and engineers cannot reliably predict where users will struggle. The mental models that make a design feel obvious to its creators are exactly the models a fresh user lacks, and only direct observation closes that gap. The discipline rejects "I think users will understand this" in favor of "we watched users; here is what happened." Each session that confirms the design entirely is mildly suspicious — either the tasks were too easy or the moderator was unintentionally helping.

The practice is opinionated about moderator behavior. The moderator's job is to be uninteresting — to let the silence sit, to let the participant struggle long enough for the obstacle to become visible, to not rescue. This is hard because the social instinct is to help, and the design instinct is to defend. A moderator who explains the design after a participant gets stuck has destroyed the evidence; the obstacle the participant just encountered is the finding, and it cannot be re-observed in that session.

## Verification
- Tasks are written as goals, not as instructions — a participant could complete the task without seeing the design first; "find out how much you owe" not "click the Tax Summary tab and then click View Details."
- The moderator script contains no leading prompts and no defensive explanations; the moderator's most common utterances are "what are you thinking?" and silence.
- Findings are rated by severity, not just listed; the team can identify the catastrophic issues distinctly from cosmetic ones.
- Sample size matches the claim type — 5 users for formative diagnostic findings is defensible; for summative or benchmark claims, sample size is justified separately.
- At least one finding contradicts a designer or PM expectation; if every finding confirms prior beliefs, the tasks were likely too constrained or the moderation too helpful.
- Recordings or detailed notes preserve specific participant behavior so synthesis works from observation, not from moderator impressions.

## Do NOT Use When
- The target is automated verification of code correctness — use **testing-strategy** for unit, integration, and end-to-end engineering tests.
- The goal is to discover what users need before any artifact exists — use **user-research** for generative interviews and contextual studies.
- The artifact has not yet been built or sketched — build a prototype first via **prototyping**, then test it.
- The question requires statistical significance across a large population (benchmarking, A/B comparison) — usability testing surfaces issues; statistical comparison needs larger summative methods or experimentation.
- The evaluation is purely about accessibility conformance to a specification — use **a11y** for WCAG/ARIA conformance review; usability testing complements this with empirical observation of assistive-tech users but is not a conformance audit.
- The output should be themes from a corpus of completed sessions — move to **research-synthesis** for affinity mapping and insight extraction.
