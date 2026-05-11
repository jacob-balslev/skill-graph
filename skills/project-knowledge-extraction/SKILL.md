---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v3.schema.json
schema_version: 3
name: project-knowledge-extraction
description: "Use when extracting durable project knowledge from code, docs, issues, incidents, reports, screenshots, or conversations into reusable context such as skills, ADRs, glossaries, context docs, or memory. Do NOT use for writing a new skill contract (use `skill-scaffold`), maintaining library tooling (use `skill-infrastructure`), or generic documentation polish (use `documentation`)."
version: 1.0.0
type: capability
browse_category: knowledge
category: ai-engineering/knowledge-extraction
scope: portable
owner: skill-graph-maintainer
freshness: "2026-05-11"
drift_check:
  last_verified: "2026-05-11"
eval_artifacts: planned
eval_state: unverified
routing_eval: absent
stability: experimental
license: MIT
compatibility:
  notes: "Portable extraction workflow for turning project evidence into durable agent context without hallucinated project claims."
allowed-tools: Read Grep
keywords:
  - project knowledge extraction
  - context extraction
  - durable knowledge
  - knowledge capture
  - code archaeology
  - docs mining
  - issue mining
  - tacit knowledge
  - context doc
  - agent memory
examples:
  - "read this repo and extract the durable domain knowledge an agent should know next time"
  - "turn these incident notes into reusable context without copying noise"
  - "mine the code and docs for the true source-of-truth files and project vocabulary"
  - "convert repeated discoveries from recent tasks into skills, ADRs, or context docs"
anti_examples:
  - "create a new SKILL.md from the Skill Metadata Protocol template"
  - "run the skill library health tooling and overlap detector"
  - "rewrite this README to sound better"
  - "decide which skill should route for this exact prompt"
relations:
  boundary:
    - skill: skill-scaffold
      reason: "skill-scaffold authors a specific skill contract; project-knowledge-extraction decides what durable knowledge should become a skill, ADR, context doc, or memory"
    - skill: skill-infrastructure
      reason: "skill-infrastructure maintains library tooling; project-knowledge-extraction mines evidence into reusable knowledge artifacts"
    - skill: documentation
      reason: "documentation writes reader-facing prose; project-knowledge-extraction extracts and classifies durable knowledge before deciding the artifact"
    - skill: skill-router
      reason: "skill-router dispatches a prompt to existing skills; project-knowledge-extraction creates or updates the knowledge base the router later uses"
  related:
    - knowledge-modeling
    - context-graph
    - architecture-decision-records
    - documentation
  verify_with:
    - knowledge-modeling
    - documentation
portability:
  readiness: scripted
  targets:
    - agent-skills
lifecycle:
  stale_after_days: 365
  review_cadence: quarterly
---

# Project Knowledge Extraction

## Coverage

Extract durable, reusable project knowledge from local evidence. Covers source discovery, fact extraction, vocabulary capture, decision mining, failure-pattern capture, artifact routing, grounding, freshness, and deciding whether knowledge belongs in a skill, ADR, context doc, glossary, runbook, or memory.

## Philosophy

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

