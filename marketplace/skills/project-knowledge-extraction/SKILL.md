---
name: project-knowledge-extraction
description: "Use when extracting durable project knowledge from code, docs, issues, incidents, reports, screenshots, or conversations into reusable context such as skills, ADRs, glossaries, context docs, or memory. Do NOT use for writing a new skill contract (use `skill-scaffold`), maintaining library tooling (use `skill-infrastructure`), or generic documentation polish (use `documentation`). Do NOT use for design an agent-eval rubric to grade project knowledge extraction groundedness. Do NOT use for harden an agent against prompt injection in untrusted incident notes. Do NOT use for write a reusable prompt template for a future extraction workflow without extracting evidence now."
license: MIT
compatibility: Portable extraction workflow for turning project evidence into durable agent context without hallucinated project claims.
allowed-tools: Read Grep
metadata:
  relations: "{\"related\":[\"skill-infrastructure\",\"architecture-decision-records\",\"skill-router\",\"knowledge-modeling\",\"context-graph\",\"skill-scaffold\",\"agent-eval-design\",\"prompt-injection-defense\",\"prompt-craft\"],\"suppresses\":[\"agent-eval-design\",\"prompt-injection-defense\",\"prompt-craft\"],\"verify_with\":[\"knowledge-modeling\",\"context-graph\",\"epistemic-grounding\"]}"
  subject: ai-engineering
  scope: "Extracting durable project knowledge from code, docs, issues, incidents, reports, screenshots, or conversations into reusable context — skills, ADRs, glossaries, context docs, or memory entries. Portable across any project accumulating knowledge; principle-grounded, not repo-bound. Excludes writing a new skill contract (skill-scaffold), maintaining library tooling (skill-infrastructure), and generic documentation polish (documentation)."
  public: "true"
  taxonomy_domain: agent/knowledge
  stability: experimental
  keywords: "[\"context extraction\",\"repeated discoveries\",\"grounded skills\",\"ADRs context docs\",\"context doc\",\"agent memory\",\"source-of-truth files\",\"project vocabulary\",\"reusable agent context\",\"incident notes\"]"
  examples: "[\"read this repo and extract durable project knowledge an agent should know next time\",\"extract durable project knowledge from incident notes into reusable context without copying noise\",\"mine the code and docs for source-of-truth files, project vocabulary, and reusable agent context\",\"convert repeated discoveries from recent tasks into grounded skills, ADRs, or context docs\"]"
  anti_examples: "[\"design an agent-eval rubric to grade project knowledge extraction groundedness\",\"harden an agent against prompt injection in untrusted incident notes\",\"write a reusable prompt template for a future extraction workflow without extracting evidence now\"]"
  grounding: "{\"subject_matter\":\"Extracting durable project knowledge into Skill Graph context artifacts\",\"grounding_mode\":\"hybrid\",\"truth_sources\":[\"skill-metadata-protocol/PRIMER.md\",\"docs/ADOPTION.md\",\"docs/recommended-skills.md\",\"../skills/skills/agent-ops/skill-scaffold/SKILL.md\",\"../skills/skills/agent-ops/context-graph/SKILL.md\"],\"failure_modes\":[\"session_noise_promoted_to_durable_context\",\"project_claims_without_truth_sources\",\"artifact_type_chosen_before_evidence_is_classified\",\"extracted_knowledge_not_linked_into_graph\",\"untrusted_incident_or_conversation_text_treated_as_instructions\"],\"evidence_priority\":\"repo_code_first\"}"
  mental_model: "Project knowledge extraction is a grounded distillation workflow. Start from evidence, classify each retained claim by durability and source, decide the right destination artifact, and link it so future agents can retrieve it. The primitives are evidence packet, stable claim, volatile note, vocabulary, decision, failure pattern, artifact destination, grounding, freshness trigger, and discoverability link."
  purpose: "This skill prevents agents from rediscovering the same project facts every session or, worse, preserving noisy session notes as durable truth. It turns code, docs, issues, incidents, and conversations into reusable context while preserving the distinction between evidence-backed facts, hypotheses, decisions, procedures, and short-lived observations."
  concept_boundary: "This skill performs grounded extraction and artifact routing. It does not author a new skill contract from a template (skill-scaffold), operate skill-library health tooling (skill-infrastructure), choose a skill for one prompt (skill-router), polish known documentation (documentation), write a reusable extraction prompt (prompt-craft), design prompt-injection defenses (prompt-injection-defense), or design eval suites for extraction quality (agent-eval-design)."
  analogy: "Project knowledge extraction is an evidence librarian: it keeps the durable books, labels where they came from, shelves them where future readers will look, and leaves sticky-note noise off the catalog."
  misconception: "The common mistake is treating every useful-looking note as durable knowledge. Durable project knowledge must be grounded, reusable, routed to the right artifact, and given a freshness trigger; otherwise it is a hypothesis or session note, not project truth."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/ai-engineering/project-knowledge-extraction/SKILL.md
  skill_graph_export_description_projection: anti_examples
---
# Project Knowledge Extraction

## Concept of the skill

**What it is:** `project-knowledge-extraction` turns local evidence into durable, reusable agent context such as skills, ADRs, glossaries, context docs, runbooks, or memory entries.

**Mental model:** Evidence first, claim second, artifact third. Keep only stable facts or explicitly labeled hypotheses, route each retained item to the right durable artifact, and link it so future agents can find it.

**Why it exists:** Without durable extraction, agents repeatedly rediscover the same project facts or promote noisy session notes into false memory.

**What it is NOT:** It is not new skill scaffolding, skill-library infrastructure work, one-prompt skill routing, generic documentation polish, prompt writing, prompt-injection defense design, or eval-suite design.

**Adjacent concepts:** `knowledge-modeling` shapes concept structures; `context-graph` links retrieved context; `architecture-decision-records` captures decisions; `skill-scaffold` authors new skill contracts; `skill-infrastructure` operates library tooling; `skill-router` chooses an existing skill; `agent-eval-design` evaluates extraction quality.

**One-line analogy:** This skill is an evidence librarian: collect trustworthy facts, label their source, shelf them in the right artifact, and discard sticky-note noise.

**Common misconception:** A note is not durable project knowledge until it is grounded, reusable, routed, and discoverable.

## Coverage

Extract durable, reusable project knowledge from local evidence. Covers source discovery, fact extraction, vocabulary capture, decision mining, failure-pattern capture, artifact routing, grounding, freshness, and deciding whether knowledge belongs in a skill, ADR, context doc, glossary, runbook, or memory.

## Philosophy of the skill
Agents lose value when every session rediscovers the same project facts. The fix is not to dump everything into context. The fix is to extract durable knowledge, classify it, ground it in truth sources, and store it where future agents can find it.

Durable knowledge must be evidence-backed. If it cannot be tied to code, docs, decisions, or observed behavior, mark it as a hypothesis.

## Method

1. Inventory evidence: code surfaces, docs, issues, reports, tests, scripts, screenshots, and prior decisions.
2. Extract stable facts, recurring failure modes, vocabulary, boundaries, and source-of-truth files.
3. Discard session noise, one-off logs, and facts likely to expire quickly.
4. Classify destination: skill, ADR, context doc, glossary, runbook, memory, or no artifact.
5. Add grounding: truth sources, last-verified date, and drift trigger.
6. Link the new artifact into the context graph.
7. Verify by asking what future task this knowledge should improve.

## Verification

- [ ] Every retained fact has a truth source or is marked as a hypothesis
- [ ] One-off session notes were excluded
- [ ] Vocabulary distinctions are captured with examples
- [ ] Decisions are routed to ADRs, not buried in generic notes
- [ ] Reusable procedures are routed to skills or runbooks
- [ ] Artifact links make the knowledge discoverable later
- [ ] Drift triggers are clear for volatile facts

## Do NOT Use When

| Use instead | When |
|---|---|
| `skill-scaffold` | You already know the skill to write and need the Skill Metadata Protocol contract. |
| `skill-infrastructure` | You need library tooling, audits, overlap detection, or health checks. |
| `documentation` | You need prose polish or a human-facing guide from known facts. |
| `skill-router` | You need to choose an existing skill for one prompt. |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `ai-engineering`
- Public: `true`
- Domain: `agent/knowledge`
- Scope: Extracting durable project knowledge from code, docs, issues, incidents, reports, screenshots, or conversations into reusable context — skills, ADRs, glossaries, context docs, or memory entries. Portable across any project accumulating knowledge; principle-grounded, not repo-bound. Excludes writing a new skill contract (skill-scaffold), maintaining library tooling (skill-infrastructure), and generic documentation polish (documentation).

**When to use**
- read this repo and extract durable project knowledge an agent should know next time
- extract durable project knowledge from incident notes into reusable context without copying noise
- mine the code and docs for source-of-truth files, project vocabulary, and reusable agent context
- convert repeated discoveries from recent tasks into grounded skills, ADRs, or context docs

**Not for**
- design an agent-eval rubric to grade project knowledge extraction groundedness
- harden an agent against prompt injection in untrusted incident notes
- write a reusable prompt template for a future extraction workflow without extracting evidence now

**Related skills**
- Verify with: `knowledge-modeling`, `context-graph`, `epistemic-grounding`
- Related: `skill-infrastructure`, `architecture-decision-records`, `skill-router`, `knowledge-modeling`, `context-graph`, `skill-scaffold`, `agent-eval-design`, `prompt-injection-defense`, `prompt-craft`

**Concept**
- Mental model: Project knowledge extraction is a grounded distillation workflow. Start from evidence, classify each retained claim by durability and source, decide the right destination artifact, and link it so future agents can retrieve it. The primitives are evidence packet, stable claim, volatile note, vocabulary, decision, failure pattern, artifact destination, grounding, freshness trigger, and discoverability link.
- Purpose: This skill prevents agents from rediscovering the same project facts every session or, worse, preserving noisy session notes as durable truth. It turns code, docs, issues, incidents, and conversations into reusable context while preserving the distinction between evidence-backed facts, hypotheses, decisions, procedures, and short-lived observations.
- Boundary: This skill performs grounded extraction and artifact routing. It does not author a new skill contract from a template (skill-scaffold), operate skill-library health tooling (skill-infrastructure), choose a skill for one prompt (skill-router), polish known documentation (documentation), write a reusable extraction prompt (prompt-craft), design prompt-injection defenses (prompt-injection-defense), or design eval suites for extraction quality (agent-eval-design).
- Analogy: Project knowledge extraction is an evidence librarian: it keeps the durable books, labels where they came from, shelves them where future readers will look, and leaves sticky-note noise off the catalog.
- Common misconception: The common mistake is treating every useful-looking note as durable knowledge. Durable project knowledge must be grounded, reusable, routed to the right artifact, and given a freshness trigger; otherwise it is a hypothesis or session note, not project truth.

**Grounding**
- Mode: `hybrid`
- Truth sources: `skill-metadata-protocol/PRIMER.md`, `docs/ADOPTION.md`, `docs/recommended-skills.md`, `../skills/skills/agent-ops/skill-scaffold/SKILL.md`, `../skills/skills/agent-ops/context-graph/SKILL.md`

**Keywords**
- `context extraction`, `repeated discoveries`, `grounded skills`, `ADRs context docs`, `context doc`, `agent memory`, `source-of-truth files`, `project vocabulary`, `reusable agent context`, `incident notes`

<!-- skill-graph-context:end -->
