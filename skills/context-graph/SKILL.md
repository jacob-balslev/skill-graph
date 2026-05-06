---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v3.schema.json
schema_version: 3
name: context-graph
description: "Use when designing the multi-graph context architecture of an AI-coding workspace, when analyzing change-propagation impact across skills / docs / memory / scripts, when measuring graph connectivity health (orphan rate, average degree, hub-spoke ratio, cluster count), when classifying the edge types between skills, or when building a discovery layer that lets agents find context they did not already know existed. Covers the four interconnected graphs every mature AI-coding workspace ends up with — Skill Knowledge Graph, Document Routing Graph, Memory Index, Script / Command Registry — plus the cross-graph edges that connect them; orphan detection and remediation priorities; the deterministic-signal recipe for graph synthesis (explicit prose references, manual relations frontmatter, bundle co-membership, shared routing labels, keyword overlap); the three skill-edge types (adjacent, boundary, verify_with) and their per-edge-type caps; the change-propagation checklist that traces a single edit across all four graphs; and the anti-patterns that produce hub-and-spoke topology, drift, or silent orphan accumulation. Do NOT use for authoring or editing individual SKILL.md content (use `skill-scaffold` for authoring and `skill-infrastructure` for maintenance), for validating one skill against the schema (use `graph-audit`), for the live routing-decision step (use `skill-router`), for context-budget allocation inside a single agent session (that is a context-window concern), or for the design-phase 'what should I load for this task' decision (that is a context-management concern)."
version: 1.0.0
type: capability
browse_category: knowledge
category: ai-engineering/architecture
scope: portable
owner: skill-graph-maintainer
freshness: "2026-05-06"
drift_check:
  last_verified: "2026-05-06"
eval_artifacts: planned
eval_state: unverified
routing_eval: absent
stability: experimental
license: MIT
compatibility:
  notes: "Architecture-level skill. Applies to any agent-coding workspace that has more than one skill / doc-routing / memory artifact and any way to traverse them — Claude Code, OpenCode, Cursor, Aider, Continue, Copilot Workspace, or a custom harness. The four-graph model and the orphan / connectivity metrics are independent of the specific runtime."
allowed-tools: Read Grep
keywords:
  - context graph architecture
  - multi-graph context model
  - skill knowledge graph
  - document routing graph
  - memory index graph
  - script command registry graph
  - cross-graph edges
  - orphan detection skill graph
  - graph connectivity metrics
  - average node degree
  - hub-and-spoke anti-pattern
  - reciprocal relations
  - bidirectional graph edges
  - change propagation across graphs
  - edge type taxonomy
  - adjacent boundary verify_with
  - deterministic graph synthesis
  - bundle co-membership
examples:
  - "we have ~300 skills but the agent never finds half of them — what's the diagnostic frame?"
  - "how do I measure whether our skill graph is actually navigable vs just present?"
  - "I changed a webhook handler — what's the discipline for tracing the impact across docs, skills, memory, and scripts?"
  - "we keep accumulating orphan skills and our connectivity drops every quarter — how do I make graph-health a deliberate gate?"
  - "the agent is loading 15 skills per task and burning context — is the underlying graph too dense, too sparse, or wrong-shaped?"
  - "design a deterministic recipe for synthesizing the skill graph from frontmatter without running an LLM"
  - "what's the right cap on adjacent / boundary / verify_with relations per skill?"
anti_examples:
  - "scaffold a new SKILL.md from a template" # → skill-scaffold
  - "validate that this single skill's frontmatter matches the schema" # → graph-audit
  - "decide which skill to inject for this query right now" # → skill-router
  - "this skill says 'use orgQuery'; that one says 'never use orgQuery' — fix the conflict" # → skill-infrastructure
  - "decide what should and shouldn't be in this agent's context window for this task" # → context engineering / management skill
  - "review this AI-generated PR for correctness" # → code-review
relations:
  boundary:
    - skill: skill-router
      reason: "skill-router is the per-query dispatch decision (which skill activates now); context-graph is the underlying graph the router traverses"
    - skill: graph-audit
      reason: "graph-audit validates one skill's schema and relation-target existence; context-graph reasons about the topology of the whole graph (orphans, connectivity, edge cap discipline)"
    - skill: skill-infrastructure
      reason: "skill-infrastructure owns the live skill library tooling (census, conflict detection, routing-gap reporting); context-graph owns the architectural model behind it"
    - skill: skill-scaffold
      reason: "skill-scaffold authors a single SKILL.md; context-graph designs the graph that those authored skills participate in"
    - skill: documentation
      reason: "documentation produces durable prose; context-graph reasons about the routing-graph that connects code changes to the docs that need updating"
  related:
    - skill-router
    - graph-audit
    - skill-infrastructure
    - skill-scaffold
  verify_with:
    - graph-audit
    - skill-infrastructure
portability:
  readiness: scripted
  targets:
    - agent-skills
lifecycle:
  stale_after_days: 365
  review_cadence: quarterly
---

# Context Graph

## Coverage

The architectural model behind navigable context in an AI-coding workspace. Names the four interconnected graphs that any mature workspace accumulates — Skill Knowledge Graph, Document Routing Graph, Memory Index, Script / Command Registry — and the cross-graph edges that connect them (skill → script, skill → memory, doc-routing → doc, script → command). Specifies the three skill-graph edge types (`adjacent`, `boundary`, `verify_with`) and their per-edge-type caps. Defines orphan detection (a node with zero or near-zero incoming edges that agents cannot find by traversal) and the priority order for remediation (security skills first, then financial, integration, infrastructure, then UX). Specifies graph-connectivity metrics with healthy / unhealthy bands: connectivity, average degree, orphan rate, max degree, cluster count, hub-spoke ratio. Names the five deterministic signals that should drive graph synthesis (explicit prose references, manual `relations` frontmatter, bundle co-membership, shared routing labels, keyword overlap) — never an LLM at synthesis time. Walks the change-propagation checklist that traces a single edit across all four graphs. Catalogs the anti-patterns that quietly destroy graph quality: edge inflation, one-way edges, optional-metadata mindset, AI-inferred edges that drift on rebuild, ignoring cross-graph edges.

## Philosophy

Without a navigable graph, agents cannot discover context they did not already know existed. The original failure mode looks like this: a skill exists, the agent doesn't reference it by name in the current prompt, and the routing layer has no edge to find it from — so the skill might as well not exist. A workspace can ship hundreds of skills and still operate as if it had ten, because the other 290 are unreachable from any traversal an agent actually performs.

Context discovery is therefore a precondition for context quality. If the right skill, doc, or memory file cannot be found by following edges from the current task, content quality is irrelevant. Graph maintenance — adding edges, fixing orphans, capping inflation, keeping cross-graph references current — is a quality gate, not optional metadata. Every new skill enters the system with a question attached: who reaches this from where, by which edges?

The deterministic-signal discipline is the second non-negotiable. Graph synthesis must be a deterministic function of the authored artifacts (frontmatter relations, bundle membership, prose references, shared routing labels, keyword overlap) — not an LLM inference. If the graph drifts on rebuild, agents lose the one stable surface they have. Use AI to _suggest_ edges during authoring; never to _generate_ the live graph at runtime.

## 1. The Four Context Graphs

A mature AI-coding workspace converges on four interconnected graphs:

### Graph 1 — Skill Knowledge Graph

Nodes are skill files; edges are the typed relations declared in skill frontmatter. The job of this graph is _what knowledge exists in the workspace, and what knowledge teaches alongside what other knowledge_. The graph's vital signs are connectivity (no large isolated components), orphan rate (no skills nobody references), and edge-type discipline (each edge has a typed reason).

### Graph 2 — Document Routing Graph

Nodes are documentation targets and change categories; edges express "when this kind of code changes, those docs must be updated." The job of this graph is _propagation_ — preventing stale docs by making the doc-update obligation visible at the point of code change. The graph is most valuable when it is read by humans during PR review and by agents during the wrap / closeout protocol, not when it is read by no one.

### Graph 3 — Memory Index

Nodes are persistent memory topic files (decisions, observations, durable preferences); edges are the index entries that point from a topic table to the underlying file. The job of this graph is _cross-session knowledge persistence_ — the answer to "what did we already decide about X, why, and when did the decision become true." A memory graph that records facts but not the _why_ and _how_ of decisions cannot answer audit questions like "why did the agent choose Y?". Workspaces that need decision provenance extend the memory graph with the Process Knowledge Ontology pattern (modeling decisions, triggers, state transitions, and outcomes as first-class entities).

### Graph 4 — Script / Command Registry

Nodes are scripts and commands; edges are the categorisations that group them by purpose. The job of this graph is _agent tooling discovery_ — when an agent needs a deterministic script or a slash command, the registry is what makes it findable without trial-and-error.

### Cross-graph edges

The four graphs are _interconnected_. The cross-graph edges are where most of the propagation value lives:

| From        | To      | Edge type                                          | Example                                                                   |
| ----------- | ------- | -------------------------------------------------- | ------------------------------------------------------------------------- |
| Skill       | Script  | `key_file` (frontmatter `paths` or body reference) | A health-audit skill points at the script that runs the audit             |
| Skill       | Skill   | `adjacent` / `boundary` / `verify_with`            | Frontmatter relations                                                     |
| Script      | Command | `consumed_by`                                      | A loop-supervisor script is consumed by a manage-style command            |
| Memory      | Skill   | `informs`                                          | A memory file recording a billing strategy informs an agent-routing skill |
| Doc-routing | Doc     | `requires_update`                                  | A code change row points at the docs that must be updated together        |

A workspace that names all four graphs _and_ their cross-graph edges has a complete map. A workspace that names only the skill graph has roughly a quarter of the picture.

## 2. Edge Types in the Skill Graph

The skill graph uses three relation types. Each has a different _meaning_ and a different _cap_. Mixing them collapses the graph into noise.

| Type          | Recommended cap | Meaning                                                                                                              | Example                                                     |
| ------------- | --------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `adjacent`    | ≤ 5 per skill   | Closely related — teach together; an agent loading one would benefit from also loading the other                     | A data-reconciliation skill ↔ a financial-correctness skill |
| `boundary`    | ≤ 5 per skill   | Contrasting — "do NOT use X for this; use Y instead." The router should _exclude_ the boundary skill when both match | A financial-correctness skill ↮ a data-visualisation skill  |
| `verify_with` | ≤ 3 per skill   | Cross-check skill output against this skill before trusting it                                                       | A financial-correctness skill → a code-logic skill          |

The caps exist to prevent edge inflation. A skill with 12 `adjacent` relations is not "well-connected" — it is a hub that pulls every adjacent traversal toward itself, hiding more specific signals. Edge discipline beats edge volume.

### `boundary` is exclusion, not adjacency

The most common edge-type confusion: putting "topical neighbour" skills in `boundary`. Boundary edges tell the router "if both this skill and the boundary skill match, route AWAY from the boundary skill" — they are _exclusion-with-a-reason_, not "see also." Putting a skill in `boundary` that should be in `related` will hijack the boundary skill's positive cases and depress its routing-eval pass rate. When in doubt, prefer `related` and only promote to `boundary` when the two skills genuinely _compete_ for the same prompt with different correct answers.

## 3. Orphan Detection

An **orphan** is a node with zero (or near-zero) incoming edges. Nothing points at it, so traversal cannot reach it; agents have to know its exact name to find it. In a healthy graph, the orphan rate is below 10%. In an unhealthy graph it is the majority — and adding more skills makes the problem worse, not better, because each new skill is also unreachable.

### Orphan-detection recipe

1. Rebuild the graph from authored artefacts (deterministic synthesis).
2. Walk every node, count its `degree` (incoming + outgoing).
3. Flag every node with degree ≤ 1 as an orphan candidate.
4. For each orphan: identify its domain cluster (layer, keywords, examples) and find 3–5 sibling skills that _should_ reference it.
5. Add `relations` to the orphan and reciprocal references to its siblings — bidirectionally. A one-way edge from the orphan does not solve discovery, because the existing skills are where traversal _starts_.

### Remediation priority

Fix orphans in order of blast radius, not alphabetically:

1. **Security and compliance skills** — data exposure risk if agents miss them
2. **Correctness-critical skills** — financial, accounting, time, irreversible mutations
3. **Integration skills** — webhook signature verification, idempotency, retry
4. **Infrastructure skills** — operational impact (deploy, migrate, rollback)
5. **UX / display skills** — lower blast radius; fix once higher-priority orphans are gone

## 4. Graph Connectivity Metrics

These are the vital signs of a skill graph. Run them after every batch of skill additions or edge edits.

| Metric              | Formula                                | Healthy band    | Unhealthy signal                                                                 |
| ------------------- | -------------------------------------- | --------------- | -------------------------------------------------------------------------------- |
| **Connectivity**    | `connected_skills / total_skills`      | > 95%           | Multiple disconnected clusters indicate domain silos                             |
| **Average degree**  | `total_edges × 2 / total_nodes`        | > 5             | Below 3 means the graph is too sparse for traversal to be useful                 |
| **Orphan rate**     | `nodes with degree ≤ 1 / total_nodes`  | < 10%           | Above 30% means agents cannot discover most of the library                       |
| **Max degree**      | Highest degree of any node             | < 30            | A single node with degree 50+ is a hub-and-spoke anti-pattern                    |
| **Cluster count**   | Connected components                   | < 3 (ideally 1) | Many clusters means the workspace has informal silos that traversal can't bridge |
| **Hub-spoke ratio** | `nodes with degree > 15 / total_nodes` | < 5%            | More than 10% means the graph is degenerating into a star around a few mega-hubs |

### Five deterministic signals for graph synthesis

Synthesise the skill graph from these signals only — never from an LLM at runtime:

1. **Explicit prose references** — patterns like "Do NOT use X — use skill-name" in skill bodies
2. **Manual `relations` frontmatter** — author-declared edges
3. **Bundle co-membership** — skills declared in the same routing bundle
4. **Shared routing labels / triggers** — overlapping `triggers` or label declarations
5. **Keyword overlap** — shared keywords via the routing-config map

A graph built from these signals is _reproducible_: rebuild today and tomorrow and the edges are identical. A graph that uses LLM inference at synthesis time will drift on every rebuild and the routing layer cannot trust it.

## 5. Change-Propagation Analysis

When a single artefact changes, trace the propagation across all four graphs. This is the discipline that prevents silent staleness.

### Propagation checklist

| Step | Action                                                                                                                                             | Tool                                      |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| 1    | Read the document-routing graph. Find the change category (e.g., "DB migration", "webhook handler change") and list the docs that must be updated. | Read the routing table                    |
| 2    | Grep the changed file path / function name across all `*.md` for stale references                                                                  | `grep -r "<changed_id>" --include="*.md"` |
| 3    | Check skill key-file sections for references to the changed file                                                                                   | `grep -r "<changed_id>" skills/`          |
| 4    | Check the memory index for related topic files; update or add records if a decision changed                                                        | Read the memory index                     |
| 5    | Verify no stale references remain — run any doc-verification gate the workspace ships                                                              | Local doc-verification script             |

Each step exercises a different edge type. Skipping a step leaves a stale edge somewhere in the system, and the staleness compounds — the next change inherits a wrong baseline.

## 6. Anti-Patterns

| Anti-pattern                                                                      | Why it fails                                                                                  | What to do instead                                                                                      |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Edge inflation** — adding 10+ `adjacent` relations to one skill                 | Creates a hub-and-spoke; traversal pulls everything toward the hub and hides specific signals | Cap at 5; pick the most semantically-close siblings                                                     |
| **One-way edges** — adding edges _from_ a new skill _to_ existing skills only     | Existing skills stay orphaned; nothing points at them in the new direction                    | Add reciprocal references — update the existing skill too                                               |
| **Optional-metadata mindset** — treating relations as nice-to-have                | Orphan rate drifts up silently; eventually most skills are unreachable                        | Graph maintenance is a quality gate; CI should fail on degraded connectivity                            |
| **AI-inferred runtime edges** — letting an LLM "infer" relations on every rebuild | Graph drifts non-deterministically; routing layer cannot trust it                             | Use deterministic signals at synthesis time; use AI only as an _authoring suggestion_ the human accepts |
| **Ignoring cross-graph edges** — only maintaining the skill graph                 | Skills reference scripts and memory references skills, but those edges are unmaintained       | Map all four graphs and the cross-graph edges between them                                              |
| **Boundary-as-adjacency** — putting topical neighbours in `boundary`              | Hijacks the neighbour's positive cases; depresses its routing-eval                            | Use `related` for neighbours; reserve `boundary` for genuine routing-exclusion                          |

## Verification

- [ ] All four graphs in the workspace are named and have an authoritative source-of-truth file
- [ ] Cross-graph edges are explicit (skill → script, skill → memory, doc-routing → doc, script → command) — not implicit
- [ ] Graph rebuild is deterministic — same input artefacts produce identical edge set on every run
- [ ] Orphan rate is below 10%; orphans above the threshold have been triaged by blast radius
- [ ] Average degree is above 5; max degree is below 30; cluster count is 1 (or small with explicit reason)
- [ ] Edge-type discipline is enforced — `adjacent` ≤ 5, `boundary` ≤ 5, `verify_with` ≤ 3 per skill
- [ ] `boundary` is used for routing-exclusion only, not for "see also"
- [ ] The change-propagation checklist has been applied for the most recent significant change, end-to-end across all four graphs
- [ ] CI (or an equivalent gate) fails the merge when connectivity, orphan rate, or max degree breaches the healthy bands

## Do NOT Use When

| Use instead            | When                                                                                                                                |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `skill-scaffold`       | Authoring or restructuring a single SKILL.md — the per-skill craft, not the whole-graph architecture                                |
| `skill-infrastructure` | Running the live skill library tooling — census, overlap detection, routing-gap reporting, drift checks on individual skills        |
| `graph-audit`          | Validating that one skill's frontmatter matches the schema and its relation targets exist                                           |
| `skill-router`         | Deciding which skill activates for a specific query at dispatch time — that is the _consumer_ of this graph, not the graph's design |
| `documentation`        | Writing the prose of a single document for a human reader — the change-propagation framework here is upstream                       |
| `code-review`          | Reviewing AI-generated code — orthogonal concern                                                                                    |
