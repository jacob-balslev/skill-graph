---
name: prototyping
description: "Use when building an artifact whose purpose is to answer a specific question — paper sketch, wireframe, clickable mockup, wizard-of-oz, role-play, service prototype, or code spike — at the lowest fidelity sufficient to produce that learning. Do NOT use for production-grade component construction, design-system contribution, or building the actual ship-ready feature — those are design-module-composition and engineering implementation. Do NOT use for Build the production React component for the new dashboard widget. Do NOT use for Add this component to the design system library. Do NOT use for Write the migration script for the production database."
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
  keywords: "[\"paper prototype\",\"low fidelity prototype\",\"clickable prototype\",\"wizard of oz\",\"role play prototype\",\"service prototype\",\"code spike\",\"learning goal\",\"fidelity matching\",\"throwaway prototype\"]"
  triggers: "[\"prototype this\",\"wizard of oz\",\"paper prototype\",\"clickable mockup\",\"what fidelity\"]"
  examples: "[\"Pick the right fidelity for a prototype that tests whether users will trust an AI-suggested category.\",\"Plan a wizard-of-oz study where a human acts as the recommendation engine.\",\"Sketch a role-play prototype for a service-desk interaction before any UI is built.\",\"Decide between a paper prototype and a Figma clickable for this onboarding test.\"]"
  anti_examples: "[\"Build the production React component for the new dashboard widget.\",\"Add this component to the design system library.\",\"Write the migration script for the production database.\"]"
  relations: "{\"related\":[\"ideation\",\"usability-testing\",\"design-thinking\"],\"boundary\":[{\"skill\":\"design-module-composition\",\"reason\":\"design-module-composition produces durable design-system components meant to ship and be reused. prototyping produces disposable artifacts whose only purpose is learning — different lifecycle, different quality bar, different audience.\"},{\"skill\":\"interaction-patterns\",\"reason\":\"interaction-patterns is a reference catalog of established UI behaviors. prototyping is the activity of building a thing to test a question — it may use interaction patterns but is not itself a pattern library.\"}]}"
  structural_verdict: PASS
  truth_verdict: PASS
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/design-craft/prototyping/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# Prototyping

## Coverage
Prototyping covers the practice of constructing artifacts whose primary purpose is to **answer a question** the team has written down. The fidelity ladder runs from **paper sketches** (fastest, cheapest, best for early flow and concept testing) through **wireframes**, **clickable prototypes** (Figma, Framer, similar), **wizard-of-oz** prototypes (a human secretly performs the function the system will eventually automate — Kelley 1984), **role-play / bodystorming** (the team physically acts out a service interaction), **service prototypes** (props and staged environments for service-design questions), and up to **code spikes** (throwaway working code that answers a feasibility question).

The central skill is **fidelity matching**: choosing the lowest fidelity that can credibly answer the learning question. Paper prototypes can answer "is this flow understandable?" but not "is the typography readable?"; a clickable prototype can answer "do users find the primary action?" but not "does this feel fast under load?"; only a code spike can answer "will this API rate-limit us at scale?". Building higher fidelity than the question requires wastes time and prematurely anchors stakeholders on visual decisions.

A complementary skill is **the learning goal contract**: every prototype begins with one or two written questions it is built to answer, and a definition of what evidence would count as an answer in either direction. Without this, prototypes drift into "let's just make it look nice" and the testing session that follows produces ambiguous results because nobody agreed in advance what they were looking for.

The practice also covers **sacrificial concepts** — deliberately rough or extreme prototypes whose purpose is to provoke a reaction, not to be defended. IDEO and the Stanford d.school both teach using disposable artifacts to draw out user preferences that would not surface in abstract conversation.

## Philosophy
Prototyping rejects the instinct to polish before showing. Polish signals finality; polish makes stakeholders evaluate fit-and-finish instead of concept; polish makes users reluctant to criticize. A rougher prototype invites honest reaction. The famous IDEO maxim "if a picture is worth a thousand words, a prototype is worth a thousand meetings" captures the substitution effect — but only if the prototype is cheap enough that a team can build three and throw two away.

The discipline insists prototypes are means, not ends. A successful prototype is one that produced a clear answer, even if the answer is "this concept doesn't work" — perhaps especially then, because that finding came at the price of a prototype rather than a launched feature. Teams that judge prototypes by their visual quality have inverted the value system; teams that judge them by what was learned have it right.

## Verification
- The prototype has a written learning question, agreed before construction began, and a definition of what evidence would answer it.
- The fidelity matches the learning goal — the team can defend why this fidelity was chosen and what a higher- or lower-fidelity version would have cost or gained.
- The prototype is **disposable** in the team's mind — there is no implicit commitment that this code/file/sketch will become the production artifact.
- The construction time is small relative to the cost of being wrong about the underlying concept — if a prototype took two weeks to test a one-week assumption, the fidelity was probably too high.
- The prototype is testable: a real participant can interact with it (or watch it being acted out) and produce a meaningful reaction, not just nod politely.
- The team has a plan for what happens after testing — either iterate, escalate fidelity, or kill the concept — written down before testing begins.

## Do NOT Use When
- The artifact will ship to real users in production — that is engineering implementation, not prototyping; even a "high-fi prototype" that ships is a product.
- The component is meant for reuse across many features and contexts — use **design-module-composition** to contribute to the design system.
- No learning question has been articulated — return to **problem-framing** or **ideation** to clarify what the prototype would even test.
- The team needs to evaluate an existing artifact with users — use **usability-testing** directly; no new prototype is required.
- The question is purely technical performance, scaling, or infrastructure — use an engineering spike with appropriate measurement instrumentation, not a design prototype.
- The output is a reference catalogue of established UI behaviors — use **interaction-patterns**.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `design-craft`
- Deployment: `portable`

**When to use**
- Pick the right fidelity for a prototype that tests whether users will trust an AI-suggested category.
- Plan a wizard-of-oz study where a human acts as the recommendation engine.
- Sketch a role-play prototype for a service-desk interaction before any UI is built.
- Decide between a paper prototype and a Figma clickable for this onboarding test.
- Triggers: `prototype this`, `wizard of oz`, `paper prototype`, `clickable mockup`, `what fidelity`

**Not for**
- Build the production React component for the new dashboard widget.
- Add this component to the design system library.
- Write the migration script for the production database.
- Owned by `design-module-composition`
- Owned by `interaction-patterns`

**Related skills**
- Related: `ideation`, `usability-testing`, `design-thinking`

**Keywords**
- `paper prototype`, `low fidelity prototype`, `clickable prototype`, `wizard of oz`, `role play prototype`, `service prototype`, `code spike`, `learning goal`, `fidelity matching`, `throwaway prototype`

<!-- skill-graph-context:end -->
