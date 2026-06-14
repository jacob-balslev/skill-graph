---
name: design-thinking
description: "Use when orchestrating a full human-centered design process across discovery, definition, ideation, prototyping, and testing — when uncertain which stage of the arc a team is in, when deciding whether to loop back, or when routing to the right stage-specific sibling skill. Do NOT use for single-stage execution (go directly to problem-framing, user-research, research-synthesis, journey-mapping, ideation, prototyping, or usability-testing) or for engineering domain discovery (use event-storming). Do NOT use for Run a single crazy-8s round on this specific how-might-we. Do NOT use for Write the React component for the dashboard widget. Do NOT use for Model the bounded contexts for the order-fulfillment domain. Do NOT use for single-stage divergent/convergent concept generation (use ideation)."
license: CC-BY-4.0
metadata:
  subject: design
  public: "true"
  scope: "Orchestrating a full human-centered design process across discovery, definition, ideation, prototyping, and testing — identifying which stage of the arc a team is in, deciding whether to loop back, and routing to the right stage-specific sibling skill. Portable across any design effort; principle-grounded, not repo-bound. Excludes single-stage execution (go directly to problem-framing, user-research, research-synthesis, journey-mapping, ideation, prototyping, or usability-testing) and engineering domain discovery (event-storming)."
  stability: experimental
  keywords: "[\"design thinking process\",\"double diamond\",\"five stage design process\",\"empathize define ideate prototype test\",\"human centered design\",\"Stanford d.school\",\"IDEO method\",\"design sprint\",\"discover define develop deliver\",\"looping back\"]"
  triggers: "[\"design thinking\",\"human-centered design\",\"double diamond\",\"which stage\",\"design process\"]"
  examples: "[\"We have user interviews done but no synthesis yet — which design-thinking stage are we in and what's next?\",\"Plan a full design-thinking arc for a four-week project on rural healthcare access.\",\"We just finished a usability test and three findings broke our framing — should we loop back to define?\",\"Route this brief to the right stage-specific skill: 'help us figure out what to build for new homeowners'.\"]"
  anti_examples: "[\"Run a single crazy-8s round on this specific how-might-we.\",\"Write the React component for the dashboard widget.\",\"Model the bounded contexts for the order-fulfillment domain.\"]"
  relations: "{\"related\":[\"problem-framing\",\"user-research\",\"research-synthesis\",\"journey-mapping\",\"ideation\",\"prototyping\",\"usability-testing\",\"event-storming\",\"problem-locating-solving\"],\"suppresses\":[{\"skill\":\"ideation\",\"reason\":\"ideation owns single-stage divergent/convergent concept generation; design-thinking owns the whole arc and routes to ideation when the open question is concept generation.\"}]}"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "Design thinking is to a design effort what a conductor is to an orchestra — the conductor plays no instrument, but decides which section comes in next, when a passage must be repeated because the ensemble drifted, and when the piece is finished; the meta-skill chooses the next stage, calls a loop-back when a finding breaks the framing, and names when the team has enough to proceed."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/design/design-thinking/SKILL.md
  skill_graph_export_description_projection: anti_examples+boundary
---
# Design Thinking

## Concept of the skill

Design thinking is the meta-skill that orchestrates a full human-centered design arc and routes specific work to the appropriate stage-specific sibling skill. It treats a design effort as one arc with five recognizable stages — discover/empathize, define, ideate, prototype, test — and supplies four capabilities on top of them: **stage recognition** (knowing which stage a team is in from what artifacts exist and what question is open), **stage routing** (handing each stage's work to the right specialist method), **transition criteria** (the written evidence that justifies advancing), and **loop-back governance** (deciding when a later-stage finding invalidates earlier work so the team returns rather than presses on). The canonical framings — the Stanford d.school's five stages, the UK Design Council's Double Diamond, Tim Brown's IDEO arc, and Knapp's compressed Design Sprint — all agree on the shape; the meta-skill is the discipline of locating the team on that shape, naming the open question, and choosing the next move to answer it. Its single most important content is the non-linearity principle: the stages are described in order, but real projects loop, and recognizing when to loop back is what separates practicing design thinking from performing its ritual.

## Coverage
Design thinking is the meta-skill that orchestrates a full human-centered design arc and routes specific work to the appropriate stage-specific sibling skill. Multiple canonical framings exist and largely agree on the shape. The **Stanford d.school** describes five stages: **Empathize → Define → Ideate → Prototype → Test**. The **MIT Sloan** framing renders it as **Understand → Involve → Ideate → Prototype-test → Implement**. The **UK Design Council's Double Diamond** maps the same arc onto two diamonds: **Discover → Define** (the problem-space diamond, diverge then converge on the right problem) and **Develop → Deliver** (the solution-space diamond, diverge then converge on the right solution). Tim Brown's HBR essay (2008) and the IDEO Field Guide describe the same arc under different stage labels.

Across framings the meta-skill covers (a) **stage recognition** — knowing which stage a team is currently in based on what artifacts exist and what question is open; (b) **stage routing** — handing the work to the right sibling skill (problem-framing for definition work, user-research for empathy/discovery, research-synthesis for sense-making, journey-mapping for cross-touchpoint experience, ideation for divergent/convergent concept generation, prototyping for learning artifacts, usability-testing for evaluation); (c) **transition criteria** — knowing what evidence justifies moving from one stage to the next; and (d) **loop-back conditions** — knowing when findings in a later stage invalidate work in an earlier one and the team should return rather than press forward.

The skill includes the **non-linearity principle**: although the stages are described in order, real projects loop. A prototype test (Test stage) commonly produces evidence that the team's problem framing (Define stage) was wrong, and the right response is to loop back to Define rather than ship the prototype as-is. Recognizing this is part of the meta-skill — a team that refuses to loop is performing the ritual of design thinking without practicing it. Conversely, looping endlessly without committing is its own failure mode, and the meta-skill includes naming when "we have enough" to proceed.

The skill also covers **format choices** for orchestration — multi-week project arcs versus compressed **Design Sprints** (Jake Knapp, Google Ventures) which run a full Define-through-Test cycle in five days. The format trades depth for speed; both have valid uses.

## Philosophy of the skill
Design thinking exists because complex human problems do not yield to either pure analysis or pure intuition, and the discipline insists that iterating between empathy with users and concrete artifacts is more productive than either alone. The arc is not a procedure to be executed once; it is a structured way to make uncertainty visible. Each stage produces a specific kind of evidence (qualitative observations, framed problems, concept variants, learning artifacts, behavioral findings), and the discipline rewards teams that can name what kind of evidence they have versus what kind they still need.

The meta-skill is sceptical of two opposite failure modes. The first is **stage skipping** — leaping from a vague brief directly to prototyping because building feels like progress, with no framing and no research; the resulting prototype answers a question nobody asked. The second is **stage stalling** — researching indefinitely, framing endlessly, ideating without ever building, because each new round of empathy raises new questions and the team mistakes activity for progress. Both failures stem from the same root: not knowing which stage's question is currently open. The meta-skill names the open question explicitly and chooses the next stage to address it.

## Verification
- The team can name which stage of the arc they are currently in (Empathize / Define / Ideate / Prototype / Test, or the equivalent in whichever framing) and what specific open question that stage exists to answer.
- The next-stage transition has a written criterion — what evidence will count as "done" for the current stage — not just a calendar date.
- When a later-stage finding contradicts an earlier-stage assumption, the team explicitly decides whether to loop back or continue, and records the rationale; the question is not silently dropped.
- Each stage's output uses the appropriate sibling skill's methods (real interviews and not just team brainstorming for empathy; affinity mapping and not just memory for synthesis; divergent rounds for ideation; learning-goal contracts for prototypes; task scenarios for tests).
- The arc preserves **human centrality** — at no stage is the user replaced by a stakeholder proxy or a single team member's opinion; if it has been, that is a flag for loop-back.
- The team can articulate what they no longer believe that they believed before the arc started — design thinking that produces no changed beliefs has either been performed superficially or applied to a problem that did not require it.

## Do NOT Use When
- The work is fully inside a single stage and the right sibling skill is obvious — go directly to **problem-framing**, **user-research**, **research-synthesis**, **journey-mapping**, **ideation**, **prototyping**, or **usability-testing** rather than invoking the meta-skill.
- The problem is a well-specified engineering implementation task with a clear acceptance criterion — there is no design uncertainty to discover; just build it.
- The discovery target is an engineering domain model, event flow, or ownership-boundary question — use **event-storming** or **conceptual-modeling**.
- The problem is a concrete code defect that needs localization — use **problem-locating-solving**.
- The work is automated test design, CI architecture, or any engineering verification — use **testing-strategy**.
- The "user" is an internal system, agent, or non-human actor — design thinking's empathy stage assumes human subjects; methods do not transfer cleanly.
- The team's question is purely strategic prioritization (which of these well-understood things should we build first) rather than open-ended design — use prioritization frameworks rather than the full arc.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `design`
- Public: `true`
- Scope: Orchestrating a full human-centered design process across discovery, definition, ideation, prototyping, and testing — identifying which stage of the arc a team is in, deciding whether to loop back, and routing to the right stage-specific sibling skill. Portable across any design effort; principle-grounded, not repo-bound. Excludes single-stage execution (go directly to problem-framing, user-research, research-synthesis, journey-mapping, ideation, prototyping, or usability-testing) and engineering domain discovery (event-storming).

**When to use**
- We have user interviews done but no synthesis yet — which design-thinking stage are we in and what's next?
- Plan a full design-thinking arc for a four-week project on rural healthcare access.
- We just finished a usability test and three findings broke our framing — should we loop back to define?
- Route this brief to the right stage-specific skill: 'help us figure out what to build for new homeowners'.
- Triggers: `design thinking`, `human-centered design`, `double diamond`, `which stage`, `design process`

**Not for**
- Run a single crazy-8s round on this specific how-might-we.
- Write the React component for the dashboard widget.
- Model the bounded contexts for the order-fulfillment domain.
- Owned by `ideation`: single-stage divergent/convergent concept generation

**Related skills**
- Related: `problem-framing`, `user-research`, `research-synthesis`, `journey-mapping`, `ideation`, `prototyping`, `usability-testing`, `event-storming`, `problem-locating-solving`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: Design thinking is to a design effort what a conductor is to an orchestra — the conductor plays no instrument, but decides which section comes in next, when a passage must be repeated because the ensemble drifted, and when the piece is finished; the meta-skill chooses the next stage, calls a loop-back when a finding breaks the framing, and names when the team has enough to proceed.
- Common misconception: |

**Keywords**
- `design thinking process`, `double diamond`, `five stage design process`, `empathize define ideate prototype test`, `human centered design`, `Stanford d.school`, `IDEO method`, `design sprint`, `discover define develop deliver`, `looping back`

<!-- skill-graph-context:end -->
