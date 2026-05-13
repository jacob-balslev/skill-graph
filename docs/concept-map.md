# Skill Graph Concept Map

> **Status:** Reality-aligned teaching reference as of **2026-04-20** (schema_version 3).
> **Source of truth precedence:** `schemas/skill.v3.schema.json` > `docs/field-reference.md` > this file.
> **Purpose:** Explain the 36-field Skill Metadata Protocol frontmatter at a conceptual level without inventing structure that the schema does not actually enforce. If this file disagrees with the schema, the schema wins — fix this file.

## What kind of graph is this?

Skill Graph is a **property graph with a controlled-vocabulary set of typed predicates**, not an RDF knowledge graph. Nodes are skills. Edges are the keys inside `relations.*`. Node attributes are the 36 canonical authored frontmatter fields. A JSON-LD `@context` (`schemas/skill.context.jsonld`) projects the property graph into SKOS / Dublin Core / PROV-O triples for consumers that want RDF semantics, but authoring stays in flat YAML.

Skill Graph does **not** promise:

- Automated inference (no OWL reasoner runs against the graph)
- Open-world consistency checking (the schema closes it via `additionalProperties: false`)
- SPARQL queryability as the primary interface (you get that by applying the JSON-LD `@context` first)

What it does promise: deterministic lint, manifest generation, relation-aware routing, drift detection against content-addressable truth sources, and portable export to SKILL.md.

## The 36 authored fields — grouped by role

The fields split into nine conceptual groups. This grouping is a teaching aid only — the schema groups by *requiredness* (always required / required-for-archetype / required-for-scope / optional). See `docs/skill-metadata-protocol.md § Requiredness Groups` for the authoritative grouping.

The exact field count:

- **36 canonical authored fields** — the number authors write in YAML frontmatter, excluding v3.1 alias fields.
- **13 required-for-all fields** — every skill must populate these.
- **5 conditionally-required fields** — unlocked by `type: overlay`, `scope: codebase`, `stability: deprecated`, `comprehension_state: present`, plus `keywords` for routable skills.
- **18 optional enrichment fields** — including the full nested sub-fields inside `relations`, `grounding`, `portability`, `compatibility`, `lifecycle`, `runtime_telemetry`, and concept/eval receipts.

When you see "possible fields" counted anywhere, that is the count including nested sub-fields and v3.1 aliases individually. The 36 count refers to canonical top-level authored keys only.

### Identity (5 fields, 4 required, 1 optional)

The identity of the skill — what it is, who it is, which version of itself.

| Field | Cardinality | Role | W3C mapping |
|---|---|---|---|
| `name` | one | Stable identifier; the handle other skills point at | `dcterms:identifier` |
| `urn` | one | Optional globally unique persistent identifier | `dcterms:identifier` |
| `description` | one | Routing contract — *when* to activate, not *what* the skill covers | `dcterms:description` |
| `version` | one | Semver of the skill content itself | `dcterms:hasVersion` |
| `owner` | one | Maintenance accountability | `dcterms:creator` |

### Classification (6 fields, 4 required, 2 optional)

The kind of skill and where it lives in the library.

| Field | Cardinality | Role | Required? |
|---|---|---|---|
| `schema_version` | one | Contract version — currently `3` | always |
| `type` | one enum | Archetype — `capability`, `workflow`, `router`, `overlay` | always |
| `scope` | one enum | Locality — `portable`, `reference`, `codebase` | always |
| `browse_category` | one | Flat browse bucket (e.g. `engineering`, `knowledge`) | always |
| `category` | one slash-path | Hierarchical browse path (e.g. `ecommerce/integrations/shopify`) | optional |
| `stability` | one enum | `experimental`, `stable`, `frozen`, `deprecated` | optional |
| `superseded_by` | one | Replacement skill when deprecated | required if `stability: deprecated` |

### Health & drift (4 fields, 2 required, 2 optional)

Whether the skill is fresh, verified, and monitored. The two required fields (`freshness`, `drift_check`) answer different questions; lifecycle and telemetry add maintenance policy and live feedback when available.

| Field | Cardinality | Question it answers | Required? |
|---|---|---|---|
| `freshness` | one ISO date | "When was this last editorially reviewed?" | always |
| `drift_check` | one object (`last_verified` + `truth_source_hashes?`) | "When was this last verified against truth sources, and do the source hashes still match?" | always |
| `lifecycle` | one object (`stale_after_days?` + `review_cadence?`) | "How fast does this rot, and how often should it be re-verified?" | optional |
| `runtime_telemetry` | one object (`feedback_source` + `metrics?`) | "What do real-world runs say about whether this works?" | optional |

Proposal for v4: collapse `freshness` + `drift_check.last_verified` + `lifecycle.stale_after_days` into two primitives (`asserted_at` + `stale_after`). Tracked in the v4 roadmap.

### Eval health (5 fields, 3 required, 2 optional)

Three independent axes of eval status. A skill can be at any point in the 3×3×2 product of these enums.

| Field | Axis | Values |
|---|---|---|
| `eval_artifacts` | Does an eval file exist on disk? | `none` \| `planned` \| `present` |
| `eval_state` | Have the evals been run and passed? | `unverified` \| `passing` \| `monitored` |
| `routing_eval` | Is routing explicitly evaluated? | `absent` \| `present` |
| `comprehension_state` | Is concept comprehension explicitly evaluated? | `absent` \| `present` |
| `concept` | What concept model supports comprehension grading? | seven-field teaching block |
| `eval_last_run` | What concrete run supports the current eval claim? | `{ at, status, receipt? }` |

### Activation & routing (7 fields, 1 conditionally-required, 6 optional)

How the skill surfaces to a router. The three trigger fields (`triggers`, `keywords`, `examples`) answer routing at three different specificities.

| Field | Cardinality | Role |
|---|---|---|
| `triggers` | many | Exact phrase or label triggers |
| `keywords` | many | Semantic keywords for fuzzy matching — required when skill is routable (`scope: codebase` or non-empty `routing_groups`) |
| `examples` | many | Positive-class activation prompts (few-shot retrieval targets) |
| `anti_examples` | many | Negative-class prompts (hard negatives for boundary discrimination) |
| `paths` | many glob patterns | File-surface activation |
| `project_tags` | many | Project affiliation (literal handles or semantic tags) |
| `routing_groups` | many | Query-time overlapping bundles (`quality`, `integrations`) |

### Relations (one object, up to 8 predicate keys, each optional)

Typed edges to sibling skills. Lint verifies every target exists.

| Predicate | Cardinality | Semantics | W3C mapping |
|---|---|---|---|
| `adjacent` *(deprecated alias)* / `related` | many skill names | Symmetric "co-read" relation | `skos:related` |
| `depends_on` | many; string or `{skill, min_version}` | Pragmatic prerequisite | `dcterms:requires` |
| `verify_with` | many | Co-load for verification | `prov:wasInformedBy` |
| `boundary` | many; string or `{skill, reason}` | Routing-layer anti-ownership handoff | `sg:disjointOwnership` |
| `disjoint_with` *(v3.1)* | many; string or `{skill, reason}` | Formal class-disjointness assertion | `owl:disjointWith` |
| `broader` *(v3.1)* | many | Cross-skill generalisation — target is more general | `skos:broader` |
| `narrower` *(v3.1)* | many | Cross-skill specialisation — target is more specific | `skos:narrower` |

`adjacent` remains valid through v3.x as a deprecated alias of `related`; the v4 bump removes it in favour of the SKOS-aligned name. `boundary` remains canonical for routing-layer handoff. ADR 0001 records the `adjacent` rename; ADR 0006 records the `boundary` / `disjoint_with` split.

### Inheritance (1 field, conditionally required)

| Field | Cardinality | Role |
|---|---|---|
| `extends` | one skill name | Parent skill being specialised — required when `type: overlay` |

Skill Graph supports single-parent inheritance only. For an overlay that needs to inherit concepts from two parents, express the secondary axis as `depends_on`. The OntoClean rigidity constraints for overlays are documented in ADR 0003.

### Grounding (1 object, 5 required sub-fields — conditional on `scope: codebase`)

Ties the skill to hashable artifacts and documents the trust hierarchy.

| Sub-field | Cardinality | Role |
|---|---|---|
| `grounding.domain_object` | one | Primary artifact the skill describes |
| `grounding.grounding_mode` | one enum | `repo_specific` \| `universal` \| `hybrid` |
| `grounding.truth_sources` | many strings or anchored objects | Authoritative files, line ranges, or anchors |
| `grounding.failure_modes` | many | Known degradation modes |
| `grounding.evidence_priority` | one enum | `repo_code_first` \| `general_knowledge_first` \| `equal` |

Drift hash semantics: `drift_check.truth_source_hashes` maps each normalized truth-source key to a SHA-256 digest at the time of last verification. Keys are `path` for whole-file sources, `path#Lstart-Lend` for line ranges, and `path#anchor` for anchor-only sources. Directories cannot be hashed; local truth sources must resolve to files, while URL truth sources are valid references but are not fetched by the zero-dependency sentinel. The drift sentinel (`scripts/skill-graph-drift.js`) reports `DRIFT` when live hash differs from recorded, `BROKEN` when a local source is missing, `STALE` when `last_verified + lifecycle.stale_after_days < today`, `NO_BASELINE` when local truth sources are declared but no hashes are recorded, and `EXTERNAL_UNHASHED` for URL truth sources.

### Cross-cutting portability & standards (5 fields, all optional)

Artifact-level metadata.

| Field | Cardinality | Role |
|---|---|---|
| `license` | one | SPDX identifier (e.g. `MIT`, `Apache-2.0`) |
| `compatibility` | one object (`runtimes?`, `node?`, `notes?`) | Runtime environment |
| `allowed-tools` | one space-separated string | Pre-approved tool allowlist |
| `portability.readiness` | one enum | `declared` \| `scripted` \| `verified` — operational export readiness |
| `portability.targets` | many, currently `["skill-md"]` only | Export destinations |
| `urn` *(v3.1, optional)* | one | Global persistent identifier — `urn:skill:<repo>:<name>`. Target: required in v4. |

## The four orthogonal classification axes (carefully qualified)

Skill Graph classifies along **three strictly-orthogonal axes plus one partially-coupled axis**. The concept map's earlier claim of "four orthogonal axes" overstated the orthogonality of `routing_groups`.

| Axis | Field | Orthogonality | Question |
|---|---|---|---|
| Scope | `scope` | Strict — `portable`/`reference`/`codebase` do not overlap | Where does this apply? |
| Taxonomy | `browse_category` + `category` | Strict — one flat bucket, one tree path | What kind of concern is this? |
| Project affiliation | `project_tags` | Strict — multiple tags allowed, no hierarchy | Which projects use this? |
| Routing bundle | `routing_groups` | **Partially coupled to taxonomy** — `quality`, `integrations`, etc. are often functions of *what the skill is*, not *when it fires* | Which query-time bundle does this join? |

The taxonomy-vs-routing-group coupling is intentional for ergonomics (a router can say "load all `quality` skills") but means the fourth axis is not a strict Ranganathan facet. Keep the distinction in mind when adding routing groups: if the group is redundant with the skill's category, use the category alone.

## Archetype → body-section requirements

The `type` field binds to required H2 sections in the SKILL.md body. This is enforced by `scripts/skill-lint.js`.

| Archetype | Required H2 sections | OntoClean rigidity (see ADR 0003) |
|---|---|---|
| `capability` | `## Coverage`, `## Philosophy`, `## Verification`, `## Do NOT Use When` | +R +I +U -D |
| `workflow` | `## Coverage`, `## Philosophy`, `## Workflow`, `## Verification`, `## Do NOT Use When` | +R +I +U -D |
| `router` | `## Coverage`, `## Routing Rules`, `## Do NOT Use When` | ~R -I ~U +D |
| `overlay` | `## Coverage`, `## Overlay Rules`, `## Extends`, `## Do NOT Use When` | -R -I -U +D |

## How the concept map differs from earlier drafts (drift log)

An earlier concept map (pre-2026-04-20) contained six inaccuracies now corrected here:

1. Claimed "5 metadata layers" as canonical — corrected to "9 conceptual groups" with an explicit note that the schema groups by requiredness.
2. Listed 9 identity fields including `schema_version`/`stability`/`superseded_by` — corrected to 4 identity fields (`name`, `description`, `version`, `owner`) with the other fields moved to Classification.
3. Described `drift_check` as a scalar date — corrected to object (v3 shape, schema-enforced).
4. Called the axes "4 orthogonal" — corrected to "3 strictly orthogonal + 1 partially coupled".
5. Stated the field count without distinguishing authored-vs-possible — clarified that the current schema has 36 canonical top-level authored fields, while aliases and nested sub-field counts are separate measures.
6. Omitted the 6-field-required-for-all set (`browse_category`, `freshness`, `drift_check`, `eval_artifacts`, `eval_state`, `routing_eval`) — restored and grouped under Health & drift and Eval health.

## References

- `schemas/skill.v3.schema.json` — pinned v3 schema (source of truth for types and requiredness)
- `schemas/skill.context.jsonld` — JSON-LD `@context` for W3C interoperability
- `docs/skill-metadata-protocol.md` — requiredness groups, archetype section map, schema strictness
- `docs/field-reference.md` — per-field semantics (authoritative prose)
- `docs/field-decision-guide.md` — decision tables
- `docs/adr/0001-predicate-set.md` — predicate evolution decision
- `docs/adr/0002-json-ld-context.md` — W3C vocabulary mapping decision
- `docs/adr/0003-ontoclean-rigidity-tags.md` — archetype rigidity semantics
- `docs/adr/0004-persistent-identifiers.md` — URN scheme for v4
