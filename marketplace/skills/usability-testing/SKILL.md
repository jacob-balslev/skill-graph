---
name: usability-testing
description: "Use when observing real users attempting tasks on a prototype or live product to surface usability issues — moderated or unmoderated, think-aloud protocol, task scenarios, severity rating, sample sizing per Nielsen's heuristics. Do NOT use for automated test suites, code coverage analysis, CI pipelines, unit/integration testing, or any engineering verification — those are testing-strategy concerns, not human-behavior observation. Do NOT use for Add unit tests for the order-total calculation function. Do NOT use for Set up the CI pipeline for the new repo. Do NOT use for Run a load test against the checkout API."
license: CC-BY-4.0
metadata:
  subject: design
  public: "true"
  scope: "Observing real users attempting tasks on a prototype or live product to surface usability issues — moderated or unmoderated, think-aloud protocol, task scenarios, severity rating, and sample sizing per Nielsen's heuristics. Portable across any product under evaluation; principle-grounded, not repo-bound. Excludes automated test suites, code coverage, CI pipelines, and unit/integration testing (testing-strategy) — this is human-behavior observation, not engineering verification."
  stability: experimental
  keywords: "[\"think aloud protocol\",\"task scenario\",\"moderated usability test\",\"unmoderated test\",\"severity rating\",\"five user rule\",\"formative testing\",\"summative testing\",\"hallway test\",\"moderator neutrality\"]"
  triggers: "[\"usability test\",\"think aloud\",\"test this prototype\",\"task scenarios\",\"test with users\"]"
  examples: "[\"Write three task scenarios for a usability test of this onboarding flow.\",\"How many participants do I need for a formative round on this prototype?\",\"Review my moderator script for neutrality and leading prompts.\",\"Rate the severity of these eight usability findings using Nielsen's scale.\"]"
  anti_examples: "[\"Add unit tests for the order-total calculation function.\",\"Set up the CI pipeline for the new repo.\",\"Run a load test against the checkout API.\"]"
  relations: "{\"related\":[\"prototyping\",\"user-research\",\"research-synthesis\",\"design-thinking\",\"testing-strategy\",\"a11y\"],\"verify_with\":[\"a11y\"]}"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "A usability test is to a design what a flight check with a new pilot is to a cockpit layout — you do not ask the designers whether the controls are intuitive; you put someone unfamiliar in the seat, give them a goal, and watch which switch they reach for, because the moment they reach for the wrong one is the finding, and a helpful instructor pointing at the right switch erases the very evidence you came for."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/design/usability-testing/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# Usability Testing

## Concept of the skill

Usability testing is the evaluative research practice of watching real people attempt realistic tasks on a prototype or product to surface the obstacles they encounter — making it empirical observation rather than expert opinion. Its core instrument is the think-aloud protocol (Ericsson & Simon), where participants narrate their reasoning so the divergence between their mental model and the design becomes visible at the moment it happens. Sessions are built around task scenarios that state a goal without prescribing steps ("find out how much you owe in taxes this quarter"), run by a moderator whose discipline is neutrality: frame the goal, prompt only with open questions, let silence and struggle sit, and never rescue or defend the design. Sample size is governed by purpose — the Nielsen/Landauer 5-user rule (~85% of major problems per homogeneous segment, per discrete task) holds for formative, diagnostic, iterative testing, but summative benchmark claims require much larger statistical samples, and conflating the two is a classic error. Findings are triaged by Nielsen's 0–4 severity scale, complemented when needed by quantitative instruments (task success rate, time on task, SUS), and the practice is explicit about what destroys evidence: leading prompts, defending the design, and over-fitting to a single dramatic finding.

## Coverage
Usability testing covers the evaluative research practice of watching people attempt realistic tasks on a prototype or product, then identifying the obstacles they encounter. The dominant method is the **think-aloud protocol** (Ericsson & Simon), where participants narrate their thoughts as they work, surfacing the mental model they are using and the points where it diverges from the design. Sessions are organized around **task scenarios** — short narratives that frame a goal without prescribing the steps ("you want to find out how much you owe in taxes this quarter") — and a **moderator** who maintains neutrality, resists answering questions, and prompts only with open-ended interventions like "what are you thinking now?" or "what did you expect to happen?".

The skill covers **sample sizing**. The widely-cited Nielsen/Landauer "5-user rule" estimates that 5 users surface ~85% of major usability problems for a homogeneous user group on a discrete task, with steeply diminishing returns afterward. The rule has important limits: it applies per distinct user segment, per discrete task scope, and to **formative** (iterative diagnostic) testing — not to **summative** (benchmark) studies, which require much larger samples for valid statistical comparison. Misapplying the 5-user rule to summative claims is a common error.

Findings are organized by **severity rating** (Nielsen's 0–4 scale: cosmetic, minor, major, catastrophic) so the team can triage. **Task success rate**, **time on task**, and standardized instruments like **SUS** (System Usability Scale, Brooke 1996) provide quantitative complements when needed. The practice distinguishes **moderated** sessions (richer data, higher cost, requires scheduling) from **unmoderated** tools (lower cost, scales to dozens of sessions, sacrifices the moderator's ability to follow up on surprises).

The skill also covers what NOT to do in a session: leading prompts, defending the design, explaining how the design "is supposed to work" when the participant gets stuck, and over-fitting interpretations to a single dramatic finding from one participant.

## Philosophy of the skill
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

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `design`
- Public: `true`
- Scope: Observing real users attempting tasks on a prototype or live product to surface usability issues — moderated or unmoderated, think-aloud protocol, task scenarios, severity rating, and sample sizing per Nielsen's heuristics. Portable across any product under evaluation; principle-grounded, not repo-bound. Excludes automated test suites, code coverage, CI pipelines, and unit/integration testing (testing-strategy) — this is human-behavior observation, not engineering verification.

**When to use**
- Write three task scenarios for a usability test of this onboarding flow.
- How many participants do I need for a formative round on this prototype?
- Review my moderator script for neutrality and leading prompts.
- Rate the severity of these eight usability findings using Nielsen's scale.
- Triggers: `usability test`, `think aloud`, `test this prototype`, `task scenarios`, `test with users`

**Not for**
- Add unit tests for the order-total calculation function.
- Set up the CI pipeline for the new repo.
- Run a load test against the checkout API.

**Related skills**
- Verify with: `a11y`
- Related: `prototyping`, `user-research`, `research-synthesis`, `design-thinking`, `testing-strategy`, `a11y`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: A usability test is to a design what a flight check with a new pilot is to a cockpit layout — you do not ask the designers whether the controls are intuitive; you put someone unfamiliar in the seat, give them a goal, and watch which switch they reach for, because the moment they reach for the wrong one is the finding, and a helpful instructor pointing at the right switch erases the very evidence you came for.
- Common misconception: |

**Keywords**
- `think aloud protocol`, `task scenario`, `moderated usability test`, `unmoderated test`, `severity rating`, `five user rule`, `formative testing`, `summative testing`, `hallway test`, `moderator neutrality`

<!-- skill-graph-context:end -->
