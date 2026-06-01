# Skill Graph Meta Bundle Lens Audit — 2026-06-01

> Mode: SYSTEM documentation and SYSTEM fixes only. CONTENT audits for individual skills are committed separately through the Skill Audit Loop.
> Scope: apply each available `skill-graph-meta` bundle skill as a lens against the `/Users/jacobbalslev/Development/skill-graph` repo/project.

## Bundle Status

| Skill | Load status | CONTENT audit status | SYSTEM lens status |
|---|---:|---:|---:|
| semantics | loaded | complete | complete |
| semantic-relations | loaded | complete | complete |
| ontology-modeling | loaded | complete | complete |
| doc-updater | missing from local skill roots | blocked | blocked |
| no-cutting-corners | missing from local skill roots | blocked | blocked |

The remaining loaded bundle skills are pending in bundle order.

## Findings Table

| ID | Lens skill | Severity | Surface | Finding | Evidence | Action taken |
|---|---|---:|---|---|---|---|
| SEM-1 | semantics | HIGH | Active docs and CLI help | Several active surfaces used the old meaning that Audit Status lives in `SKILL.md` frontmatter or a “Health Block,” even though ADR-0019 moved audit/eval/provenance state into `audit-state.json`. This creates a false operator signal about where audit/eval commands write. | `AGENTS.md` command table said “Writes to SKILL.md frontmatter”; `bin/skill-graph.js` help said “stamp the SKILL.md Health Block”; `skill-audit-loop/SKILL_AUDIT_LOOP.md` said Audit Status carried verdicts on every `SKILL.md` frontmatter. | Updated `AGENTS.md`, `bin/skill-graph.js`, and `skill-audit-loop/SKILL_AUDIT_LOOP.md` to name `audit-state.json` as the write/read surface. |
| SEM-2 | semantics | HIGH | Authoring docs | Several active onboarding/spec docs still taught the retired single-file required-field set. New authors would put sidecar-owned fields such as `schema_version`, `owner`, `freshness`, `drift_check`, `eval_artifacts`, `eval_state`, and `routing_eval` into `SKILL.md`. | `docs/QUICKSTART-30MIN.md` and `docs/ADOPTION.md` listed the old required fields as SKILL.md/frontmatter fields; `README.md` example included sidecar fields in YAML frontmatter; `docs/concept-map.md` described the old field count. | Split the examples and required-field descriptions into `SKILL.md` frontmatter plus `audit-state.json` sidecar in the active docs. |
| SEM-3 | semantics | MEDIUM | Protocol prose | The normative protocol doc had a correct ADR-0019 top callout but lower sections still used single-frontmatter wording, making the document internally inconsistent. | `skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md` still said every skill is a single `SKILL.md`, described required thirteen fields, and called Audit Status frontmatter state. | Reworded the overview, required fields, health/eval sections, Audit Status section, and authored-vs-loop-owned field list around the two-file contract. |
| REL-1 | semantic-relations | HIGH | Active docs | Relation summaries exposed a partial relation vocabulary even though the schema and protocol define seven current relation fields plus the deprecated `adjacent` alias. This can make authors miss `relations.disjoint_with` and mistake the fixture graph for the full relation contract. | `AGENTS.md` listed only `related`, `boundary`, `verify_with`, and `depends_on`; `README.md` omitted `relations.disjoint_with`; `SKILL_GRAPH.md` said the fixture skill exercises "all four `relations.*` edge types." | Expanded `AGENTS.md` and `README.md` to include `broader`, `narrower`, and `disjoint_with`; reworded the fixture section to say it exercises four representative relation edge types and points readers back to the full schema. |
| REL-2 | semantic-relations | MEDIUM | Schema descriptions and protocol prose | Some schema descriptions still called `relations.boundary` a routing-layer "handoff," which conflicts with the actual score-aware exclusion mechanic and with the protocol warning that the field does not defer to the target. | `schemas/SKILL_METADATA_PROTOCOL_schema.json` described top-level `boundary` as distinct from `relations.boundary` "routing-layer handoff" and described `relations.boundary` as an "asymmetric handoff"; the protocol's same-domain doctrine used "handoffs" language. | Reworded those descriptions to "routing-layer exclusion" / "asymmetric exclusion edge" and changed the protocol doctrine to describe routing exclusions and routing distinctions. |
| ONT-1 | ontology-modeling | HIGH | JSON-LD context | The formal JSON-LD projection still described `relations.boundary` as a routing-layer "handoff" inside `schemas/skill.context.jsonld`, even though the ontology-level distinction is that `boundary` is a custom routing-exclusion predicate and `disjoint_with` is the OWL class-disjointness predicate. | `_adr_anchors.0006` and the property-scoped `relations.boundary` note used "handoff" wording while mapping to `sg:disjointOwnership`. | Updated the JSON-LD comments to "routing-layer asymmetric exclusion edge" and linked the note to ADR 0006 plus ADR 0018. |
| ONT-2 | ontology-modeling | MEDIUM | Accepted ADRs | The original JSON-LD ADR predates ADR 0006, ADR 0018, and ADR 0019, so a reader could still infer that `boundary` and `disjoint_with` share one predicate or that audit/eval fields are exported through frontmatter JSON-LD. | `docs/adr/0002-json-ld-context.md` mapped "`boundary` / `disjoint_with`" together and listed audit/eval/provenance fields in the original verification section; `docs/adr/0006-revise-predicate-rename.md` still used pre-ADR-0018 "handoff" wording. | Added current-state update notes to ADR 0002 and ADR 0006, and updated ADR 0018's related-doc pointer to avoid repeating "handoff." |

## Novelty Memo

The useful new observation from the `semantics` lens is that ADR-0019 was implemented in code and partially documented at the top of the protocol, but the old word “frontmatter” persisted in operator-facing surfaces below the fold. That is a semantic drift pattern: the system behavior was right, but the signs users read still pointed at the pre-sidecar model.

The useful new observation from the `semantic-relations` lens is that the precise `relations.boundary` warning had been added in the protocol, but summary layers kept compressing it back into the word "handoff." That compression matters because the runtime mechanic is exclusion, not deference, and the wrong word changes how authors write relation reasons.

The useful new observation from the `ontology-modeling` lens is that the repo's RDF/OWL projection has to distinguish operational routing claims from formal class-theory claims everywhere, including comments and ADR update notes. `sg:disjointOwnership` is not `owl:disjointWith`; the difference is the whole ontology-level safety property.

## Dissent / Abstain

No dissent on the `semantics`, `semantic-relations`, or `ontology-modeling` findings. I abstained from rewriting historical ADR bodies wholesale; instead, I added dated update notes where current readers need the corrected semantics. I also abstained from editing historical research, archived docs, old ADR rationale text where stale wording is preserved as historical record rather than current operational guidance, and the deprecated `relations.adjacent` alias because removing that alias is a broader schema/content migration.
