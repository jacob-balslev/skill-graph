# ADR 0001 — Relation Predicate Set

- **Status:** Accepted (2026-04-20)
- **Deciders:** Skill Graph maintainers
- **Consulted:** SKOS Reference (W3C 2009), PROV-O (W3C 2013), Gruber 1995 on ontology design, Guarino & Welty OntoClean, Wilkinson et al. 2016 on FAIR

## Context

Skill Graph models inter-skill relationships with typed edges under `relations.*`. Through v3 the predicate set was four keys: `adjacent`, `boundary`, `verify_with`, `depends_on`. An external audit (2026-04-20) flagged that the chosen names diverge from established W3C vocabularies (SKOS, PROV-O, Dublin Core Terms), blocking FAIR Interoperability and making the graph harder to reuse in federated knowledge-graph tooling.

The audit proposed:

1. Rename `adjacent` → `related` to align with `skos:related`.
2. Decompose `boundary` into an ownership-style `disjoint_with` (OWL `disjointWith` semantics) — `boundary` currently conflates "there is an edge" with "the edge is explicitly-not-ownership".
3. Add `broader` / `narrower` to express cross-skill generalisation that `browse_category` cannot capture.
4. Keep `verify_with` and `depends_on` — they have no clean SKOS equivalent and map instead to `prov:wasInformedBy` and `dcterms:requires` respectively.

## Decision

Accept all four proposals, with an **additive, backward-compatible** rollout:

1. Extend the `relations` schema to accept `related`, `broader`, `narrower`, and `disjoint_with` as optional predicates.
2. Keep `adjacent` and `boundary` valid. `adjacent` becomes an alias for `related`. `boundary` becomes an alias for `disjoint_with`.
3. Emit a `skill-lint.js` warning (not error) when `adjacent` or `boundary` is used. The warning points at the preferred name and the v4 deprecation target.
4. Map all six predicates to their W3C equivalents via `schemas/skill.context.jsonld`. Consumers gain RDF-projectable semantics without changing the authoring surface.
5. Target v4 for removal of the deprecated names. No v3 skill needs to change. The predicate set does not become breaking until the v4 schema bump.

## Rationale

- **SKOS alignment is cheap and buys FAIR Interoperability.** `skos:related` is the 17-year-old W3C standard for symmetric associative relations between concepts. Using `related` as the preferred name means a third-party tool that already understands SKOS can consume the Skill Graph with a single `@context` declaration. No parser rewrites.
- **`broader` / `narrower` close a real gap.** Cross-skill generalisation (e.g. "`react-best-practices` is narrower than `frontend`") is currently unexpressable — `browse_category` captures only taxonomy-tree hierarchy within a category, not skill-to-skill generalisation. SKOS solved this exact problem. Adopting the solved solution is correct.
- **`disjoint_with` makes anti-ownership semantics explicit.** `boundary` was invented vocabulary. Decomposing it into "there is a relation AND the relation is disjointness" matches OWL's `owl:disjointWith` and lets graph consumers reason about exclusion without special-casing a Skill-Graph-only predicate.
- **Additive, backward-compatible rollout respects code in the wild.** Hundreds of skills in the Development workspace use `adjacent` / `boundary` today. A breaking rename would force a coordinated library-wide edit. Additive-with-deprecation costs one lint-warning pass and buys the same interoperability.
- **`verify_with` and `depends_on` stay as-is.** `verify_with` is a provenance relation (PROV-O `wasInformedBy`) not a classification relation. `depends_on` is a pragmatic prerequisite (`dcterms:requires`) not a conceptual hierarchy. Neither has a SKOS analogue and both carry intent that would be lost if forced into SKOS naming.

## Consequences

### Positive

- JSON-LD `@context` file (`schemas/skill.context.jsonld`) ships alongside this ADR; any Skill Graph SKILL.md can be projected into RDF/OWL consumers.
- Cross-skill generalisation is now expressible via `broader` / `narrower` without changing the taxonomy tree.
- Lint warnings surface the rename before v4 forces it.
- FAIR Interoperability moves from *weak* to *strong* without changing the author-facing shape.

### Negative

- Two predicate names for the same concept during the v3 → v4 window. Authors must know that `adjacent` and `related` mean the same thing; the field-reference doc is extended to say so loudly.
- Slight schema growth (four new optional keys). Mitigated because they are all optional, the JSON Schema cost is negligible, and the documentation grows proportionally.

### Neutral

- Consumers that only read `adjacent` / `boundary` continue to work unchanged.
- Consumers written against `skos:related` / `skos:broader` etc. can be fed the @context-expanded JSON-LD projection with no Skill-Graph-specific code.

## References

- W3C SKOS Reference — https://www.w3.org/TR/skos-reference/
- W3C PROV-O — https://www.w3.org/TR/prov-o/
- Dublin Core Metadata Terms — https://www.dublincore.org/specifications/dublin-core/dcmi-terms/
- Gruber, T. (1995). *Toward principles for the design of ontologies used for knowledge sharing.* International Journal of Human-Computer Studies 43(5-6):907-928.
- Guarino, N. & Welty, C. *Evaluating Ontological Decisions with OntoClean.* Communications of the ACM 45(2):61-65.
- Wilkinson, M. D. et al. (2016). *The FAIR Guiding Principles for scientific data management and stewardship.* Scientific Data 3:160018. DOI:10.1038/sdata.2016.18.
- SPDX License List (ISO/IEC 5962:2021) — https://spdx.org/licenses/

## Supersedes

- Skill Graph v3.0 implicit predicate choice — this ADR documents the decision retrospectively so v3.x additions trace back to a cited rationale rather than "we invented these names".
