# Wave 2 OSS Extraction Plan — ~20 Skills from Internal Library

> **Status.** Planned. Not yet executed. Builds on the 8-starter library shipped in v0.4.0.
> **Created.** 2026-05-04.
> **Authority.** This is the rollout plan for expanding Skill Graph's starter set from 8 to ~28 skills, drawn from the upstream private workspace (`Development/skills/`).

## Why expand the starter set

The 8 starters shipped in v0.4.0 prove the contract works. They do not prove the contract scales. An external evaluator looking at 8 cherry-picked skills cannot tell whether the metadata model handles real diversity (multiple authors' concerns, multiple archetypes co-existing, real overlap and disjointness across a meaningful relation graph). Eight skills is a demo; ~28 skills is a library.

Wave 2 closes that gap with skills drawn from two clusters chosen for **highest external value × lowest extraction risk**: Agent System (anyone building on Claude/GPT/Gemini cares) and Classification (universally portable conceptual-layer skills). Both have near-zero domain coupling and clear, defensible portability stories.

## Selection criteria

Each candidate must satisfy all five:

1. **Lives in the shared (cross-project) namespace** in the upstream workspace. No `salesHub`-scoped skills.
2. **Zero hard-locked domain references** in description or body. The redaction deny-list (`shopify`, `printify`, `stripe`, `inngest-orchestration`, `nextauth-patterns`, `neon`, `invoice`, `fulfillment`, `banking`, `gdpr-compliance`) excludes these.
3. **`stability` is `stable` or worth promoting to `stable` after the audit.** Experimental-only skills wait for Wave 3.
4. **Description survives redaction.** If half the description references Sales Hub, the skill needs rewriting first; defer to Wave 3.
5. **Adds either an archetype demonstration or a relation-graph node** the current 8 starters lack. (Wave 2's strategic value is graph density, not raw skill count.)

## Wave 2 candidate list — 20 skills

### Agent System cluster (12 skills)

| Skill | Archetype | Rationale |
|---|---|---|
| `agent-engineering` | capability | Production-discipline patterns for reliable agent systems. Highest single-skill external value. |
| `agent-orchestration` | capability | Multi-agent coordination patterns. Demonstrates how relations chain across orchestrator and worker skills. |
| `agent-observability` | capability | Logging, tracing, cost tracking for agent runtimes. Evidence-grounded — pairs with `grounding` field demonstration. |
| `prompt-craft` | capability | Prompt engineering patterns. Universally relevant. |
| `context-engineering` | capability | Context window management, RAG patterns, memory shape. Strong adjacent to `prompt-craft`. |
| `tool-call-strategy` | capability | When and how to use tool calls. Demonstrates `verify_with` + `boundary` relations clearly. |
| `mcp-builder` | workflow | Building MCP servers. Workflow archetype example with concrete deliverable. |
| `hook-patterns` | capability | Pre/post hook patterns for agent runtimes. |
| `autonomous-loop-patterns` | capability | Self-driving agent loops. Maps to OOOA (Observe-Orient-Act). |
| `human-in-the-loop` | capability | When to break automation and ask. Demonstrates `boundary` against `autonomous-loop-patterns`. |
| `session-lifecycle` | workflow | Session start, mid, end protocols. Workflow archetype with clear stage progression. |
| `claude-api` | capability | Working with Claude API specifically. Reference-scoped (grounded in upstream Anthropic docs). |

### Classification cluster (8 skills)

| Skill | Archetype | Rationale |
|---|---|---|
| `taxonomy` | capability | How to design hierarchical taxonomies. Foundation for the other Classification skills. |
| `ontology` | capability | Formal ontology patterns: classes, properties, axioms. Pairs with `taxonomy`. |
| `semantics` | capability | Semantic relation analysis. SKOS-aligned. |
| `naming-conventions` | doctrine | Identifier and file naming rules. Doctrine archetype example. |
| `glossary` | capability | Building and maintaining a glossary. |
| `knowledge-graph` | capability | Knowledge graph patterns. Strong adjacent to `ontology`. |
| `conceptual-modeling` | capability | Abstracting domains into structured representations. Foundation for ER modeling, domain modeling. |
| `domain-modeling` | capability | Bounded-contexts, ubiquitous language, domain entities. DDD-flavored. |

### Why this specific 20

- **Triples skill count from 8 to 28.** Crosses the threshold from "demo" to "library."
- **Doubles the relation graph density.** Current starter graph has 8 nodes and roughly 20 edges. Wave 2 adds 20 nodes that introduce realistic clustering (Agent System cluster has its own internal relations; Classification cluster has its own).
- **Demonstrates all four archetypes more thoroughly.** Current starters: 4 capability + 2 workflow + 1 router + 1 overlay. Wave 2 adds capabilities (heavily), workflows, doctrine. Still missing: a credible router beyond `skill-router` itself. (Defer to Wave 3.)
- **Demonstrates `grounding.truth_sources` against external references.** Several Wave 2 candidates (`claude-api`, `mcp-builder`) ground in upstream vendor docs — useful demonstrations of `scope: reference`.
- **Closes the matrix gap.** Currently no `scope: reference` starter. Wave 2 lands at least 2 (`claude-api`, `agents/<model>` profiles in Wave 3).

## What each extracted skill needs before publishing

This is the real work. Selection is mechanical; migration is not.

### Schema migration (per skill)

| Source field | Target field | Notes |
|---|---|---|
| `scope: operational` | `scope: codebase` if `grounding.truth_sources` is repo-specific; else `scope: portable` | Most Wave 2 skills land at `portable`. |
| `scope: generic` | `scope: portable` | Direct rename. |
| `eval_status: evals` | `eval_artifacts: present` + `eval_state: passing` + `routing_eval: absent` | Triple migration. Default `routing_eval: absent` until OSS routing harness validates. |
| `family: <value>` | `browse_category: <value>` | OSS uses `browse_category`. Map directly: `family: agent-ops` → `browse_category: engineering`, etc. |
| `drift_check: "2026-04-15"` | `drift_check: { last_verified: "2026-04-15" }` | Scalar → object. |
| `compatibility: "Node.js 18+"` | `compatibility: { notes: "Node.js 18+" }` | Scalar → object. |
| `layer`, `layerPrimary`, `primaryCategory`, `routingRole` | drop, or move under `metadata:` envelope on export | Internal-only fields; OSS rejects with `additionalProperties: false`. |

### Required additions

- `schema_version: 3` — every skill.
- `license: MIT` — every skill (per OSS license).
- `owner: skill-graph-maintainer` — every skill (anonymized from internal `owner: claude` or `owner: jacob-balslev`).
- `urn: urn:skill:skill-graph:<name>` — optional in v3, target-required in v4. Add now.
- `relations.disjoint_with` instead of `relations.boundary` — the v3.1 preferred name.
- `relations.related` instead of `relations.adjacent` (where adjacency exists).

### Redaction sweep

Run `scripts/skills-sweep-oss.js` redaction gate against each candidate before publishing. Per-skill review for:

- Truth-source paths pointing into `sales-hub/` — replace with neutral example or remove.
- Examples that name internal personas, projects, customers — replace with generic placeholders.
- Description text mentioning `Sales Hub`, `Free Oppression`, `Printify`, etc. — rewrite generically.
- Code blocks with internal env-var names — replace with `<YOUR_VAR>` placeholders.

## Pilot — first 3 skills

Before bulk-extracting all 20, validate the migration pipeline on three carefully chosen pilots:

| Pilot | Why this one |
|---|---|
| `agent-engineering` | Densest content. If migration handles this, it handles the rest. Strong portability (no domain references). |
| `taxonomy` | Pure conceptual layer. Zero domain coupling. Validates that Classification skills survive cleanly. |
| `naming-conventions` | Doctrine archetype. Tests whether the migration handles a non-`capability` skill. Has many truth-source links to internal files — tests the truth-source rebaselining process. |

If all three pass the migration pipeline and gates (`skill-lint.js` 0 errors, `check-contract-consistency.js` C1–C6 OK, redaction sweep clean, routing harness PASS where applicable), proceed to the remaining 17. If any pilot reveals a contract gap, fix the contract before extracting the rest.

## Sequencing the remaining 17

After pilot:

- **Batch A (6 skills, 1–2 days each):** `agent-orchestration`, `agent-observability`, `prompt-craft`, `context-engineering`, `tool-call-strategy`, `mcp-builder`. Most straightforward Agent System extractions.
- **Batch B (6 skills):** `hook-patterns`, `autonomous-loop-patterns`, `human-in-the-loop`, `session-lifecycle`, `claude-api`, `ontology`. Continue Agent System + start filling Classification.
- **Batch C (5 skills):** `semantics`, `glossary`, `knowledge-graph`, `conceptual-modeling`, `domain-modeling`. Complete Classification cluster.

Each batch ends with a manifest regeneration, full lint pass, and an OSS routing harness run. Ship as `0.5.0` after Batch C.

## What Wave 2 explicitly does NOT include

- **Sales Hub-scoped skills.** All 159 are excluded. They live in `Development/skills/sales-hub/` for reasons that don't translate to OSS.
- **Domain-locked shared skills.** The 10 hard-excluded skills (`shopify`, `printify`, `stripe-ledger-recon`, `inngest-orchestration`, `nextauth-patterns`, `neon`, `invoice`, `fulfillment`, `banking`, `gdpr-compliance`) wait for Wave 3 with explicit redaction strategies.
- **Product Strategy skills.** All 12 `sales-hub-*` Strategy skills are private and never extract.
- **Archived skills.** `Development/skills/_archived/` is excluded entirely.
- **Bundle skills.** `Development/skills/_bundles/` is excluded. Bundles aggregate other skills via a non-v3 mechanism (`replaces:` with a list); v3 has no equivalent.

## Wave 3 preview (not commitments — directional)

Roughly 30 more skills, the next-easiest tier after Wave 2:

- All 10 `agents/<model>/` profiles (`claude-haiku`, `claude-opus`, `claude-sonnet`, `gemini-flash`, `gemini-pro`, `gpt53-codex`, `gpt54`, `minimax`, `nemotron`). Demonstrate per-model behavior grounding.
- More Classification: `keywords`, `entity-relationship-modeling`, `sequential-thinking`, `teaching-patterns`, `evaluation`, `methodology`.
- More Technical Capability: `linting`, `test-driven-development`, `version-control`, `dependency-management`, `javascript-testing-patterns`, `git-worktree`, `streaming`, `websocket`.
- More Design & UX: `color-science`, `typography`, `design-token-architecture`, `motion-design`, `interaction-feedback`.

Wave 3 candidates total ~30 skills. Cumulative: 8 (starters) + 20 (Wave 2) + 30 (Wave 3) = 58 skills, the point at which the OSS Skill Graph contract is convincingly proven against real diversity.

## Implementation gates — Wave 2 ships when all of these pass

1. Pilot of 3 skills lands cleanly (no contract bugs surfaced).
2. All 20 skills pass `skill-lint.js --include-template` with 0 errors.
3. `check-contract-consistency.js` passes C1–C6 with 0 warnings.
4. The redaction sweep (`scripts/skills-sweep-oss.js` pattern) passes against every skill body.
5. `skill-graph-routing-eval.js` reports PASS for every skill with `routing_eval: present`.
6. `CHANGELOG.md` `[Unreleased]` block describes the wave with skill-by-skill rationale.
7. `README.md` "Shipping today" section updated to reflect 28 starter skills.
8. Drift sentinel reports CLEAN/UNGROUNDED correctly for every new skill (any `scope: codebase` skill must have a baseline).

## Cross-references

- `Skill Graph/README.md` § "Shipping today" — current 8-starter inventory.
- `Skill Graph/CHANGELOG.md` § `[Unreleased]` — release-in-progress notes.
- `Skill Graph/CONTRACT.md` — the v1 OSS metadata contract Wave 2 must satisfy.
- `Skill Graph/scripts/skills-sweep-oss.js` — redaction pipeline for extraction.
- `../../docs/plans/skill-graph-divergence.md` — Path-C divergence record (Wave 2 stays under Path C; doesn't trigger convergence).
- `../../skills/_meta/skill-graph-delta.md` — schema delta between internal v1 superset and OSS v3.
- `../../docs/plans/multi-project-skill-overlays.md` — companion plan; overlay pattern adoption is independent of Wave 2 but informs how Wave 2 skills relate to project-specific overlays in the internal library.
