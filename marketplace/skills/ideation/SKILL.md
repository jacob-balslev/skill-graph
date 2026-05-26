---
name: ideation
description: "Use when generating a wide range of solution concepts before converging on a direction, running structured idea-generation sessions, breaking out of solution fixation, or moving from divergent to convergent selection with explicit criteria. Do NOT use for collaborative engineering domain discovery (event-storming), solo deep technical design, or making final go/no-go investment decisions — those require different methods. Do NOT use for Decide whether to invest in this feature for the next quarter. Do NOT use for Model the bounded contexts for the order-fulfillment domain. Do NOT use for Write the production code for the selected concept."
license: CC-BY-4.0
metadata:
  schema_version: "8"
  version: "1.0.0"
  type: capability
  operation: know
  category: design
  subject: design-craft
  scope: portable
  owner: skill-graph-maintainer
  freshness: "2026-05-12"
  drift_check: "{\"last_verified\":\"2026-05-12\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"crazy 8s\",\"brainstorming\",\"SCAMPER\",\"worst possible idea\",\"headlines from the future\",\"dot voting\",\"NUF test\",\"divergent thinking\",\"convergent thinking\",\"ideation workshop\"]"
  triggers: "[\"brainstorm\",\"ideation session\",\"crazy 8s\",\"generate concepts\",\"narrow down ideas\"]"
  examples: "[\"Run a crazy-8s round on this how-might-we statement and produce a divergent set.\",\"Apply SCAMPER to this existing feature to generate variant concepts.\",\"Use dot voting and an impact/effort matrix to converge on three concepts to prototype.\",\"Help me set up a worst-possible-idea round to break the team out of solution fixation.\"]"
  anti_examples: "[\"Decide whether to invest in this feature for the next quarter.\",\"Model the bounded contexts for the order-fulfillment domain.\",\"Write the production code for the selected concept.\"]"
  relations: "{\"related\":[\"problem-framing\",\"prototyping\",\"design-thinking\"],\"boundary\":[{\"skill\":\"event-storming\",\"reason\":\"event-storming is a collaborative engineering discovery practice for mapping domain events and aggregates. ideation generates user-facing concept variants and applies divergent/convergent selection — different purpose, different output, different participants.\"},{\"skill\":\"conceptual-modeling\",\"reason\":\"conceptual-modeling produces a single best model of a domain. ideation deliberately produces many alternatives before selecting — opposite epistemic stance.\"}]}"
  structural_verdict: UNVERIFIED
  truth_verdict: UNVERIFIED
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/design-craft/ideation/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# Ideation

## Coverage
Ideation covers the techniques that produce many concept variants in response to a well-framed problem, then converge on a subset worth pursuing. The practice has two distinct halves and treats them as separable activities. **Divergent techniques** include **Crazy 8s** (eight sketches in eight minutes, popularized by Google Ventures' Design Sprint), **brainwriting** (silent written generation that bypasses dominant voices), **SCAMPER** (Substitute / Combine / Adapt / Modify / Put-to-another-use / Eliminate / Reverse — Bob Eberle's adaptation of Alex Osborn's checklist), **worst-possible-idea** (deliberately bad concepts to disinhibit and reveal hidden assumptions), **headlines-from-the-future** (write the press release for the launched product), and **analogous inspiration** (how do other domains solve adjacent problems).

**Convergent techniques** include **dot voting** (each participant gets N stickers to place on concepts they would invest in), the **NUF test** (Is it New, Useful, Feasible?), **impact / effort 2×2** plotting, **weighted decision matrices** for multi-criteria selection, and **assumption-testing prioritization** (which concepts, if true, would teach the team the most). Convergent methods make the selection criteria explicit before voting begins, so the choice is defensible rather than political.

The skill includes the **facilitation mechanics** that keep the two halves separate: enforcing silence during divergent rounds so no idea is judged before it lands, time-boxing strictly so quantity is prioritized over polish, withholding feedback ("yes-and" rather than "yes-but"), and only opening evaluative discussion in the convergent phase. This separation is the single most-cited determinant of brainstorming productivity in the literature (going back to Osborn 1953, with the criticism / refinements from Diehl & Stroebe and others incorporated via brainwriting variants).

## Philosophy
Ideation is built on a counterintuitive claim: that quantity precedes quality. The case is empirical and structural — judging an idea costs cognitive effort, and judgment running in parallel with generation suppresses generation. Teams that judge as they ideate produce fewer ideas, and the ideas they produce skew toward the safe middle of the distribution. By splitting the modes, divergent rounds produce a wider range, and convergent rounds can then prune intelligently because the field is large enough that pruning is meaningful.

The discipline is sceptical of "good enough" early ideas. The first three ideas a team generates are usually the obvious ones — the ones any competitor has also considered. The interesting ideas live in the second half of a forced-quantity round, where the obvious is exhausted and the team is pushed into less-trodden territory. Worst-possible-idea exercises serve the same function from the other direction: by deliberately violating norms, they expose which norms were holding the design back.

## Verification
- A divergent round produced at least 20 concept variants (or 8 per participant in a Crazy 8s round) before any convergence began.
- The selection criteria for convergence were named in writing *before* voting started — not retrofitted to justify the popular choice.
- The selected concepts are materially different from each other; if the three "winners" are variations on the same idea, the divergent round failed to spread.
- At least one selected concept is uncomfortable or unfamiliar to the team — pure consensus often signals the convergent phase compressed the range.
- The team can articulate, for each selected concept, what specific question it would help answer in the next stage (prototyping or testing).
- Time-boxes were enforced; the session did not drift into open-ended discussion that re-merged the divergent and convergent modes.

## Do NOT Use When
- The problem has not been framed — return to **problem-framing** first; ideating on a fuzzy brief produces a fuzzy concept set.
- The team needs to commit to a single direction with budget implications, not just narrow a creative field — pair ideation with a separate investment-decision process.
- The task is modeling engineering domain events and aggregates — use **event-storming**.
- The output should be a single best architecture or model — use **conceptual-modeling**, which seeks correctness rather than variety.
- The decision is between two well-understood, already-specified options — a simple comparison is sufficient; full ideation is overhead.
- The next step is to make the chosen concept real and learn from it — move to **prototyping**.
