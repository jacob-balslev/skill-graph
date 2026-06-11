# Skill Graph Concept Map

> **Status:** Reality-aligned teaching reference as of **2026-05-28** (schema_version 8).
> **Source of truth precedence:** `schemas/SKILL_METADATA_PROTOCOL_schema.json` > `skill-metadata-protocol/field-reference.md` > this file.
> **Purpose:** Explain the two-file Skill Metadata Protocol contract at a conceptual level without inventing structure that the schemas do not actually enforce. If this file disagrees with the schemas, the schemas win — fix this file.

## What kind of graph is this?

Skill Graph is a **property graph with a controlled-vocabulary set of typed predicates**, not an RDF knowledge graph. Nodes are skills. Edges are the keys inside `relations.*`. Node attributes come from `SKILL.md` frontmatter joined with sibling `audit-state.json` sidecars. A JSON-LD `@context` (`schemas/skill.context.jsonld`) projects the agent-facing frontmatter into SKOS / Dublin Core / PROV-O triples for consumers that want RDF semantics, but authoring stays in `SKILL.md` plus JSON sidecar files.

Skill Graph does **not** promise:

- Automated inference (no OWL reasoner runs against the graph)
- Open-world consistency checking (the schema closes it via `additionalProperties: false`)
- SPARQL queryability as the primary interface (you get that by applying the JSON-LD `@context` first)

What it does promise: deterministic lint, manifest generation, relation-aware routing, drift detection against content-addressable truth sources, and portable export to SKILL.md.

## The two-file contract — grouped by role

The fields split into conceptual groups. This grouping is a teaching aid only — the schema groups by requiredness and conditional rules. See `skill-metadata-protocol/design-rationale.md § Requiredness Groups` for the authoritative grouping.

The exact field count:

- **25 agent-facing frontmatter fields** — the current `SKILL.md` surface authors maintain for routing and execution.
- **30 audit-state sidecar fields** — the sibling `audit-state.json` surface the Skill Audit Loop owns.
- **5 required frontmatter fields** — every `SKILL.md` must populate `name`, `description`, `subject`, `public`, and `scope`.
- **7 required sidecar fields** — every `audit-state.json` must populate `schema_version`, `owner`, `freshness`, `drift_check`, `eval_artifacts`, `eval_state`, and `routing_eval`.
- **Conditionally-required fields** — `grounding` when `project[]` is non-empty, `superseded_by` when `stability: deprecated`, and the Understanding fields or `concept` when `comprehension_state: present`.
- **Optional enrichment fields** — including nested sub-fields inside `relations`, `grounding`, `portability`, `compatibility`, `lifecycle`, `runtime_telemetry`, `model_run_coverage`, and concept/eval receipts.

When you see "possible fields" counted anywhere, that is the count including nested sub-fields and legacy aliases individually. The current contract is the two-file ADR-0019 shape, not the older single-frontmatter count.

### Identity (5 fields)

The identity of the skill — what it is, who it is, which version of itself.

| Field | Cardinality | Role | W3C mapping |
|---|---|---|---|
| `name` | one | Stable identifier; the handle other skills point at | `dcterms:identifier` |
| `urn` | one | Optional globally unique persistent identifier | `dcterms:identifier` |
| `description` | one | Routing contract — *when* to activate, not *what* the skill covers | `dcterms:description` |
| `version` | one | Semver of the skill content itself; sidecar field | `dcterms:hasVersion` |
| `owner` | one | Maintenance accountability; sidecar field | `dcterms:creator` |

### Classification (7 frontmatter fields)

The kind of skill and where it lives in the library.

| Field | Cardinality | Role | Required? |
|---|---|---|---|
| `subject` | one enum | Primary browse shelf — one of twelve closed values (`backend-engineering`, `frontend-engineering`, `software-architecture`, `data-engineering`, `agent-ops`, `ai-engineering`, `quality-assurance`, `design`, `reasoning-strategy`, `software-engineering-method`, `knowledge-organization`, `product-domain`) | always |
| `public` | boolean | Publishability gate — `true` shareable / `false` private to one project | always |
| `scope` | one string | Free-text PRD-style statement of what the skill teaches and what it does not | always |
| `subjects` | up to 2 | Polyhierarchy when a skill genuinely spans two shelves (primary first, must equal `subject`) | optional |
| `taxonomy_domain` | one slash-path | Hierarchical sub-path within a `subject` (e.g. `ecommerce/integrations/shopify`) | optional |
| `stability` | one enum | `experimental`, `stable`, `frozen`, `deprecated` | optional |
| `superseded_by` | one | Replacement skill when deprecated | required if `stability: deprecated` |

### Health & drift (sidecar fields)

Whether the skill is fresh, verified, and monitored. The two required fields (`freshness`, `drift_check`) answer different questions; lifecycle and telemetry add maintenance policy and live feedback when available.

| Field | Cardinality | Question it answers | Required? |
|---|---|---|---|
| `freshness` | one ISO date | "When was this last editorially reviewed?" | always |
| `drift_check` | one object (`last_verified` + `truth_source_hashes?`) | "When was this last verified against truth sources, and do the source hashes still match?" | always |
| `lifecycle` | one object (`stale_after_days?` + `review_cadence?`) | "How fast does this rot, and how often should it be re-verified?" | optional |
| `runtime_telemetry` | one object (`feedback_source` + `metrics?`) | "What do real-world runs say about whether this works?" | optional |
| `model_run_coverage` | one object (`models` keyed by model alias) | "Which models have actually run which audit-loop operation, and where is the receipt or failure evidence?" | optional |

Historical proposal: collapse `freshness` + `drift_check.last_verified` + `lifecycle.stale_after_days` into two primitives (`asserted_at` + `stale_after`). That proposal did not land in v8; the current schema keeps the three-field shape above.

### Evaluation Status (sidecar fields plus frontmatter Understanding fields)

Three independent axes of eval status. A skill can be at any point in the 3×3×2 product of these enums.

| Field | Axis | Values |
|---|---|---|
| `eval_artifacts` | Does an eval file exist on disk? | `none` \| `planned` \| `present` |
| `eval_state` | Have the evals been run and passed? | `unverified` \| `passing` \| `monitored` |
| `routing_eval` | Is routing explicitly evaluated? | `absent` \| `present` |
| `comprehension_state` | Is concept comprehension explicitly evaluated? | `absent` \| `present` |
| `concept` | Legacy concept model accepted only in historical skills | retired seven-field teaching block |
| `eval_last_run` | What concrete run supports the current eval claim? | `{ at, status, receipt? }` |

### Activation & routing (7 optional fields)

How the skill surfaces to a router. The three trigger fields (`triggers`, `keywords`, `examples`) answer routing at three different specificities.

| Field | Cardinality | Role |
|---|---|---|
| `triggers` | many | Exact phrase or label triggers |
| `keywords` | many, max 10 | Recommended semantic phrases for fuzzy matching; not a schema-required field |
| `examples` | many | Positive-class activation prompts (few-shot retrieval targets) |
| `anti_examples` | many | Negative-class prompts (hard negatives for boundary discrimination) |
| `paths` | many glob patterns | File-surface activation |
| `project[]` | many | Project belonging references (handle + role) for project-anchored (`public: false`) skills |

### Relations (one object, up to 8 predicate keys, each optional)

Typed edges to sibling skills. Lint verifies every target exists.

| Predicate | Cardinality | Semantics | W3C mapping |
|---|---|---|---|
| `adjacent` *(deprecated alias)* / `related` | many skill names | Symmetric "co-read" relation | `skos:related` |
| `depends_on` | many; string or `{skill, min_version}` | Pragmatic prerequisite | `dcterms:requires` |
| `verify_with` | many | Co-load for verification | `prov:wasInformedBy` |
| `boundary` | many; string or `{skill, reason}` | Routing-layer score-aware exclusion edge; excludes the target when the declaring skill wins | `sg:disjointOwnership` |
| `disjoint_with` *(v3.1)* | many; string or `{skill, reason}` | Formal class-disjointness assertion | `owl:disjointWith` |
| `broader` *(v3.1)* | many | Cross-skill generalisation — target is more general | `skos:broader` |
| `narrower` *(v3.1)* | many | Cross-skill specialisation — target is more specific | `skos:narrower` |

`related` is the canonical broad association predicate. `boundary` records ownership exclusions for routing. ADR 0001 records the historical `adjacent` rename; ADR 0006 records the `boundary` / `disjoint_with` split.

### Grounding (1 object, 5 required sub-fields — conditional on non-empty `project[]`)

Ties the skill to hashable artifacts and documents the trust hierarchy.

| Sub-field | Cardinality | Role |
|---|---|---|
| `grounding.subject_matter` | one | Primary artifact or domain the skill describes |
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
| `urn` *(optional)* | one | Global persistent identifier — `urn:skill:<repo>:<name>`. |

## Classification And Routing Dimensions

Skill Graph keeps these classification and belonging dimensions distinct. Each row answers a different question; they do not overlap.

| Axis | Field | Orthogonality | Question |
|---|---|---|---|
| Publishability | `public` | boolean — `true` (shareable) / `false` (private) | Is this safe to publish? |
| Scope | `scope` | Free-text, not an enum | PRD-style description of deployment context |
| Taxonomy | `subject` + `taxonomy_domain` | Strict — one shelf, one optional tree path | What kind of concern is this? |
| Project belonging | `project[]` | Strict — explicit belonging references, no hierarchy | Which specific project is this anchored to? |

> The per-skill `routing_bundles` field was removed (SKI-286, 2026-06-07): it had no acting consumer. Library-level activation bundles (the "load all `quality` skills" ergonomic) live in the skill-injector routing config (`bundles` / `bundleTypes`), not in per-skill frontmatter. A second browse path for a skill is expressed with `subjects[]` (max 2) or `relations.related`.

## Body structure

The skill body follows the section structure demonstrated by `examples/skill-metadata-template.md` — at minimum `## Coverage`, `## Philosophy of the skill`, `## Verification`, and `## Do NOT Use When`. v8 has no archetype-specific section requirements; see [`skill-metadata-protocol/design-rationale.md § Body Structure`](../skill-metadata-protocol/design-rationale.md#body-structure).

## How the concept map differs from earlier drafts (drift log)

An earlier concept map (pre-2026-04-20) contained six inaccuracies now corrected here:

1. Claimed "5 metadata layers" as canonical — corrected to "9 conceptual groups" with an explicit note that the schema groups by requiredness.
2. Listed 9 identity fields including `schema_version`/`stability`/`superseded_by` — corrected to 4 identity fields (`name`, `description`, `version`, `owner`) with the other fields moved to Classification.
3. Described `drift_check` as a scalar date — corrected to object (v3 shape, schema-enforced).
4. Called the axes "4 orthogonal" — corrected to separate strict classification/belonging dimensions from query-time routing bundles.
5. Stated the field count without distinguishing authored-vs-possible — clarified that the current contract has 25 agent-facing frontmatter fields plus 30 audit-state sidecar fields, while aliases and nested sub-field counts are separate measures.
6. Omitted the required-for-all set (`subject`, `public`, `freshness`, `drift_check`, `eval_artifacts`, `eval_state`, `routing_eval`) — restored and grouped under Classification, Health & drift, and Evaluation Status.

## References

- `schemas/SKILL_METADATA_PROTOCOL_schema.json` — current canonical schema (source of truth for types and requiredness)
- `schemas/skill.context.jsonld` — JSON-LD `@context` for W3C interoperability
- `skill-metadata-protocol/design-rationale.md` — requiredness groups, body structure, schema strictness
- `skill-metadata-protocol/field-reference.md` — per-field semantics (authoritative prose)
- `skill-metadata-protocol/field-decision-guide.md` — decision tables
- `docs/adr/0001-predicate-set.md` — predicate evolution decision
- `docs/adr/0002-json-ld-context.md` — W3C vocabulary mapping decision
- `docs/adr/0004-persistent-identifiers.md` — URN scheme for v4
