---
name: project-knowledge-extraction
description: "Use when extracting durable project knowledge from code, docs, issues, incidents, reports, screenshots, or conversations into reusable context such as skills, ADRs, glossaries, context docs, or memory. Do NOT use for writing a new skill contract (use `skill-scaffold`), maintaining library tooling (use `skill-infrastructure`), or generic documentation polish (use `documentation`). Do NOT use for create a new SKILL.md from the Skill Metadata Protocol template. Do NOT use for run the skill library health tooling and overlap detector. Do NOT use for rewrite this README to sound better. Do NOT use for decide which skill should route for this exact prompt."
license: MIT
compatibility: Portable extraction workflow for turning project evidence into durable agent context without hallucinated project claims.
allowed-tools: Read Grep
metadata:
  schema_version: "8"
  version: "1.0.0"
  subject: agent-ops
  deployment_target: portable
  scope: "Extracting durable project knowledge from code, docs, issues, incidents, reports, screenshots, or conversations into reusable context — skills, ADRs, glossaries, context docs, or memory entries. Portable across any project accumulating knowledge; principle-grounded, not repo-bound. Excludes writing a new skill contract (skill-scaffold), maintaining library tooling (skill-infrastructure), and generic documentation polish (documentation)."
  taxonomy_domain: agent/knowledge
  owner: skill-graph-maintainer
  freshness: "2026-05-11"
  drift_check: "{\"last_verified\":\"2026-05-13\",\"truth_source_hashes\":{\"docs/PRIMER.md\":\"e6bd99468c224fe4c9606e147c5db94dff889feeb9ca5d80084480039c7e9296\",\"docs/ADOPTION.md\":\"3a75c1a613ac0bdf0b4b56e567d8ec1f35a80252e68595e8d86bb0a5abdf1bfc\",\"docs/recommended-skills.md\":\"5c0201bd76cdc0310bb57ddc88565ffa41f47f3b41f489c0557cb7634ed16379\",\"skills/skill-scaffold/SKILL.md\":\"ea0e988de27bea1bb0868c153b4e6b2739895d180f857339b97202cc287262f7\",\"skills/context-graph/SKILL.md\":\"732a04f09f2f4362ee17a65bee24406715a773aefd78dbcdc37a4cb3a9f287a7\"}}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"project knowledge extraction\",\"context extraction\",\"durable knowledge\",\"knowledge capture\",\"code archaeology\",\"docs mining\",\"issue mining\",\"tacit knowledge\",\"context doc\",\"agent memory\"]"
  examples: "[\"read this repo and extract the durable domain knowledge an agent should know next time\",\"turn these incident notes into reusable context without copying noise\",\"mine the code and docs for the true source-of-truth files and project vocabulary\",\"convert repeated discoveries from recent tasks into skills, ADRs, or context docs\"]"
  anti_examples: "[\"create a new SKILL.md from the Skill Metadata Protocol template\",\"run the skill library health tooling and overlap detector\",\"rewrite this README to sound better\",\"decide which skill should route for this exact prompt\"]"
  relations: "{\"boundary\":[{\"skill\":\"skill-scaffold\",\"reason\":\"skill-scaffold authors a specific skill contract; project-knowledge-extraction decides what durable knowledge should become a skill, ADR, context doc, or memory\"},{\"skill\":\"skill-infrastructure\",\"reason\":\"skill-infrastructure maintains library tooling; project-knowledge-extraction mines evidence into reusable knowledge artifacts\"},{\"skill\":\"skill-router\",\"reason\":\"skill-router dispatches a prompt to existing skills; project-knowledge-extraction creates or updates the knowledge base the router later uses\"}],\"related\":[\"knowledge-modeling\",\"context-graph\",\"architecture-decision-records\"],\"verify_with\":[\"knowledge-modeling\"]}"
  grounding: "{\"subject_matter\":\"Extracting durable project knowledge into Skill Graph context artifacts\",\"grounding_mode\":\"hybrid\",\"truth_sources\":[\"docs/PRIMER.md\",\"docs/ADOPTION.md\",\"docs/recommended-skills.md\",\"skills/skill-scaffold/SKILL.md\",\"skills/context-graph/SKILL.md\"],\"failure_modes\":[\"session_noise_promoted_to_durable_context\",\"project_claims_without_truth_sources\",\"artifact_type_chosen_before_evidence_is_classified\",\"extracted_knowledge_not_linked_into_graph\"],\"evidence_priority\":\"repo_code_first\"}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":365,\"review_cadence\":\"quarterly\"}"
  structural_verdict: PASS
  truth_verdict: DRIFT
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/agent-ops/project-knowledge-extraction/SKILL.md
  skill_graph_export_description_projection: anti_examples
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

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `agent-ops`
- Deployment: `portable`
- Domain: `agent/knowledge`
- Scope: Extracting durable project knowledge from code, docs, issues, incidents, reports, screenshots, or conversations into reusable context — skills, ADRs, glossaries, context docs, or memory entries. Portable across any project accumulating knowledge; principle-grounded, not repo-bound. Excludes writing a new skill contract (skill-scaffold), maintaining library tooling (skill-infrastructure), and generic documentation polish (documentation).

**When to use**
- read this repo and extract the durable domain knowledge an agent should know next time
- turn these incident notes into reusable context without copying noise
- mine the code and docs for the true source-of-truth files and project vocabulary
- convert repeated discoveries from recent tasks into skills, ADRs, or context docs

**Not for**
- create a new SKILL.md from the Skill Metadata Protocol template
- run the skill library health tooling and overlap detector
- rewrite this README to sound better
- decide which skill should route for this exact prompt
- Owned by `skill-scaffold`
- Owned by `skill-infrastructure`
- Owned by `skill-router`

**Related skills**
- Verify with: `knowledge-modeling`
- Related: `knowledge-modeling`, `context-graph`, `architecture-decision-records`

**Grounding**
- Mode: `hybrid`
- Truth sources: `docs/PRIMER.md`, `docs/ADOPTION.md`, `docs/recommended-skills.md`, `skills/skill-scaffold/SKILL.md`, `skills/context-graph/SKILL.md`

**Keywords**
- `project knowledge extraction`, `context extraction`, `durable knowledge`, `knowledge capture`, `code archaeology`, `docs mining`, `issue mining`, `tacit knowledge`, `context doc`, `agent memory`

<!-- skill-graph-context:end -->
