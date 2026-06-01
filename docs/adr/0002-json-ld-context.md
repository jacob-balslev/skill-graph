# ADR 0002 — JSON-LD @context for W3C Interoperability

- **Status:** Accepted (2026-04-20)
- **Deciders:** Skill Graph maintainers
- **Relates to:** ADR 0001 (Predicate Set), FAIR Wilkinson et al. 2016

> **Update — 2026-06-01:** The body below records the original JSON-LD decision. Current v8 semantics are refined by [ADR 0006](0006-revise-predicate-rename.md), [ADR 0018](0018-relations-boundary-semantic-inversion.md), and [ADR 0019](0019-audit-state-sidecar-separation.md): `relations.boundary` maps to Skill Graph's routing-layer exclusion predicate `sg:disjointOwnership`, `relations.disjoint_with` maps separately to formal OWL `owl:disjointWith`, and audit/eval/provenance fields live in `audit-state.json` and are not exported through this frontmatter JSON-LD context.

## Context

The external audit of 2026-04-20 identified **FAIR Interoperability** as the Skill Metadata Protocol's weakest dimension. The contract was self-consistent but isolated — no machine-readable mapping to established W3C vocabularies (SKOS, Dublin Core Terms, PROV-O, SPDX, schema.org). Third parties wanting to consume protocol metadata in a federated knowledge-graph tool or a generic RDF triplestore had no adapter path short of writing Skill-Metadata-Protocol-specific code.

## Decision

Ship `schemas/skill.context.jsonld` — a JSON-LD `@context` file that maps every authored Skill Graph field to its nearest W3C standard term. Authors do not need to change anything. Consumers that want RDF semantics apply the `@context` and receive standard SKOS / DC Terms / PROV-O triples.

Field-to-vocabulary mapping summary:

| Skill Graph | Mapped to | Vocabulary |
|---|---|---|
| `name` | `dcterms:identifier` | Dublin Core Terms |
| `description` | `dcterms:description` | Dublin Core Terms |
| `version` | `dcterms:hasVersion` | Dublin Core Terms |
| `owner` | `dcterms:creator` | Dublin Core Terms |
| `license` | `dcterms:license` | Dublin Core Terms (SPDX identifier) |
| `freshness` | `dcterms:modified` (xsd:date) | Dublin Core Terms |
| `superseded_by` | `prov:wasRevisionOf` | PROV-O |
| `workspace_tags` | `dcterms:audience` (set) | Dublin Core Terms |
| `keywords` | `dcat:keyword` (set) | DCAT |
| `category` | `skos:broader` (chain) | SKOS |
| `adjacent` / `related` | `skos:related` | SKOS |
| `broader` | `skos:broader` | SKOS |
| `narrower` | `skos:narrower` | SKOS |
| `boundary` / `disjoint_with` | `sg:disjointOwnership` (custom; decomposes to `skos:related` + `owl:disjointWith`) | SKOS+OWL |
| `verify_with` | `prov:wasInformedBy` | PROV-O |
| `depends_on` | `dcterms:requires` | Dublin Core Terms |
| `extends` | `prov:wasDerivedFrom` | PROV-O |
| `truth_sources` | `dcterms:source` | Dublin Core Terms |
| `drift_check.last_verified` | `prov:generatedAtTime` | PROV-O |
| `type`, `scope`, `category`, `routing_bundles`, `grounding.*`, `eval_*`, `lifecycle.*`, `runtime_telemetry.*`, `portability.*`, `compatibility.*` | `sg:*` custom namespace | Skill Graph vocabulary (no W3C analogue) |

Custom predicates live under `https://skillgraph.dev/vocab#` (`sg:` prefix). Everything that has a W3C equivalent is mapped to the equivalent, not rediscovered.

## Rationale

- **JSON-LD is additive, non-invasive.** Authors keep writing plain YAML. The `@context` file sits next to the schema. Consumers that want RDF apply it; consumers that don't, don't.
- **W3C vocabularies are 15+ years old and have deep tooling support.** Adopting them is cheaper than publishing a competing vocabulary.
- **Dual-layer mapping strategy.** Fields with clean W3C analogues (roughly 70% per audit) map to the analogue. Fields without (archetype, scope, eval-health triple, grounding, readiness) stay in the `sg:` namespace and are documented.
- **SPDX is already an ISO standard.** Our `license` field already uses SPDX identifiers; JSON-LD makes that machine-resolvable.

## Consequences

### Positive

- Skill Graph becomes one `@context` away from RDF — no parser changes.
- Federated tools (Skosmos, WebVOWL, generic SPARQL endpoints) can ingest a Skill Graph library with zero Skill-Graph-specific adapter code.
- FAIR Interoperability moves from Weak to Strong.
- Future "cross-repo skill federation" work is unblocked.

### Negative

- One more file to keep in sync. Mitigated by the protocol-consistency checker: if `schemas/skill.v3.schema.json` adds a field, the `@context` must add a mapping.
- The `sg:` custom namespace is not yet served from `https://skillgraph.dev/vocab#`. The ID is reserved; publishing the live resolvable vocabulary is tracked separately.

### Neutral

- Authors see no change.
- CI runs no new check today; the consistency check is a follow-up.

## Verification

- `schemas/skill.context.jsonld` exists and is valid JSON.
- Every required authored field (`schema_version`, `name`, `description`, `version`, `type`, `category`, `scope`, `owner`, `freshness`, `drift_check`, `eval_artifacts`, `eval_state`, `routing_eval`) has a mapping.
- Every `relations.*` predicate has a mapping.
- Custom `sg:` IRIs are defined consistently.

## References

- JSON-LD 1.1 — https://www.w3.org/TR/json-ld11/
- DCMI Metadata Terms — https://www.dublincore.org/specifications/dublin-core/dcmi-terms/
- SKOS Reference — https://www.w3.org/TR/skos-reference/
- PROV-O — https://www.w3.org/TR/prov-o/
- DCAT 3 — https://www.w3.org/TR/vocab-dcat-3/
- FAIR Principles — Wilkinson et al. 2016, DOI:10.1038/sdata.2016.18
