---
name: research-synthesis
description: "Use when turning raw qualitative research output (interview transcripts, field notes, diary entries, observation logs) into themes, patterns, insight statements, and design-ready artifacts via affinity mapping, empathy maps, and jobs-to-be-done framing. Do NOT use for collecting new research, quantitative analysis, statistical inference, or summarizing a single document — synthesis specifically operates on a corpus of qualitative evidence."
license: CC-BY-4.0
metadata:
  schema_version: "7"
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
  keywords: "[\"affinity mapping\",\"empathy map\",\"insight statement\",\"theme clustering\",\"jobs to be done synthesis\",\"qualitative coding\",\"research wall\",\"downloading research\",\"say think do feel\",\"persona drafting\",\"point of view\",\"sticky-note synthesis\",\"pattern extraction\"]"
  triggers: "[\"synthesize research\",\"affinity map\",\"empathy map\",\"find themes in interviews\",\"insight statements\"]"
  examples: "[\"Cluster these 14 interview transcripts into themes using affinity mapping.\",\"Build an empathy map for the 'first-time buyer' segment from these field notes.\",\"Turn this set of observations into three insight statements I can take into ideation.\",\"Draft a jobs-to-be-done statement from this user research corpus.\"]"
  anti_examples: "[\"Run more interviews with five additional participants.\",\"Calculate the response rate of the survey.\",\"Summarize this single PDF document.\"]"
  relations: "{\"related\":[\"user-research\",\"journey-mapping\",\"problem-framing\",\"design-thinking\"],\"boundary\":[{\"skill\":\"user-research\",\"reason\":\"user-research collects primary qualitative data. research-synthesis transforms that data into design-ready themes. Both are needed, in that order.\"},{\"skill\":\"conceptual-modeling\",\"reason\":\"conceptual-modeling synthesizes domain entities and their relationships for engineering. research-synthesis synthesizes human behavior and need patterns for design — different output shapes, different audiences.\"}]}"
  structural_verdict: UNVERIFIED
  truth_verdict: UNVERIFIED
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v7
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/design/research-synthesis/SKILL.md
---

# Research Synthesis

## Coverage
Research synthesis covers the methods that turn raw qualitative material into structured insight a team can act on. The canonical technique is **affinity mapping** (Jiro Kawakita's KJ method), where individual observations are written on cards or sticky notes, posted on a wall, and clustered bottom-up into emergent themes — without imposing pre-existing categories. Adjacent methods include **empathy mapping** (XPLANE / Dave Gray, "Say / Think / Do / Feel" quadrants), **insight statement** writing (a tension or surprise condensed into one sentence), **jobs-to-be-done synthesis** (extracting the functional, emotional, and social jobs a user is hiring a product to do), and **persona drafting** when patterns are stable enough to warrant archetypes.

The skill includes the mechanics of **downloading research** — getting raw observations off transcripts and onto a shared surface (physical wall or digital board) as atomic units, one observation per card, in the participant's words where possible. This is the unglamorous part of the work and it is non-negotiable: themes that emerge from a wall of evidence are defensible; themes that emerge from memory or impression are not.

The practice distinguishes **descriptive themes** (what we heard) from **interpretive insights** (what it means) from **point-of-view statements** (what we will act on). Each layer requires the previous one as evidence. A common synthesis output is a small set of insight statements, each in the form of an observation + interpretation + implication ("Users batch-process invoices on Fridays because their bookkeeper visits on Mondays — current weekly cadence misses this rhythm"), which then feed directly into problem framing or ideation.

## Philosophy
Synthesis is where qualitative research either pays off or quietly fails. The temptation is to read transcripts, form an impression, and write a summary — but impression-based summaries reproduce the researcher's priors rather than the participants' patterns. Affinity mapping is deliberately slow and physical because the act of moving cards forces the researcher to keep evaluating whether two observations actually belong together, instead of subsuming them under a comfortable label.

The discipline is wary of premature abstraction. A theme named too early ("users want simplicity") becomes a magnet that pulls unrelated observations into it. The IDEO field guide and the Stanford d.school bootleg both teach delaying naming as long as possible — clustering by proximity first, naming only when the cluster's shape is undeniable. The same caution applies to personas: a persona built before patterns have stabilized fossilizes a guess, then teams optimize for a fictional user instead of real ones.

## Verification
- Every theme on the affinity wall traces back to at least two specific cards (observations), and each card is attributable to a specific session or participant.
- Themes were named *after* the clusters formed, not before — the researcher can recount the moment the cluster's identity became clear.
- At least one insight contradicts something the team believed before the research started; if every insight is comfortable, the synthesis was likely too charitable to existing assumptions.
- The output distinguishes observations, interpretations, and implications — they are not collapsed into a single bullet list.
- A reader unfamiliar with the raw research can read the synthesis and predict, in rough strokes, what a participant said — meaning the synthesis preserves enough specificity to be falsifiable.
- The synthesis is small enough to act on (typically 3–7 themes, not 20) — if everything is a theme, nothing is.

## Do NOT Use When
- No primary research has been conducted yet — run **user-research** first; there is nothing to synthesize.
- The question is quantitative (counts, percentages, trends over time) — use statistical analysis rather than affinity methods.
- The corpus is a single document or a small set of internal artifacts — synthesis methods are designed for cross-session pattern extraction, not document summarization.
- The team needs to model an engineering domain (entities, events, contexts) — use **conceptual-modeling** or **event-storming**.
- The output target is a temporal cross-touchpoint experience map — synthesize first, then move to **journey-mapping**.
- The task is to validate a single hypothesis against a known artifact — use **usability-testing** instead.
