# ADR 0006 — Revise ADR 0001 § Decision #2 (`boundary` is not `owl:disjointWith`)

- **Status:** Accepted (2026-05-04)
- **Deciders:** Skill Graph maintainers
- **Supersedes:** ADR 0001 § Decision #2 only (Decisions #1, #3, #4 stand unchanged)
- **Consulted:** OWL 2 Web Ontology Language Primer (W3C 2012), W3C SKOS Reference, GPT-5.5 empirical confirmation of the in-tree JSON-LD context (2026-05-04)

> **Update — 2026-06-01:** This ADR correctly separates the routing-layer `boundary` predicate from formal OWL `disjoint_with`, but some original paragraphs use "handoff" wording from the pre-ADR-0018 naming frame. Read those passages as routing-layer exclusion, not deference: the current v8.0 field is `relations.boundary`, it maps to `sg:disjointOwnership`, and [ADR 0018](0018-relations-boundary-semantic-inversion.md) schedules the clearer field name `relations.suppresses` for v8.1 while preserving the same predicate URI.

## Context

ADR 0001 (2026-04-20) accepted four predicate-set proposals as a single bundle for v3.1:

1. Rename `adjacent` → `related` (skos:related). **Sound and uncontested — academically defensible.**
2. Rename `boundary` → `disjoint_with` and treat them as aliases mapping to OWL `owl:disjointWith` semantics. **Category error — see below.**
3. Add `broader` / `narrower` (skos:broader / skos:narrower). **Sound — closes a real expressivity gap.**
4. Keep `verify_with` and `depends_on`. **Sound — these are PROV-O and DCMI relations, not SKOS classifications.**

The 2026-05-04 board meeting (synthesis at the 2026-05-04 multi-model synthesis (kept private) § 8 Disagreements / § 12 IP-R2) flagged Decision #2 as a category error: `boundary` and `owl:disjointWith` operate at different semantic layers and equating them obscures a real distinction the schema needs to keep.

The Opus 4.7 reviewer (`opus.md`) noted this directly. The GPT-5.5 reviewer (`gpt-5.5.md`) verified empirically that the in-tree JSON-LD context (`schemas/skill.context.jsonld`) was already mapping `boundary` to `sg:disjointOwnership` — a custom Skill-Graph predicate — and not to `owl:disjointWith`. The implementation was correct; only the ADR text claiming OWL alignment was wrong. This ADR documents what the implementation already does and revises the ADR 0001 narrative to match.

## The semantic distinction

`boundary` and `owl:disjointWith` answer different questions.

| Question | Answer in Skill Graph | Maps to | Layer |
|---|---|---|---|
| "If a query matches skill A, can the router also pick skill B?" | No (because A's `boundary: [B]` is a routing-layer hand-off) | `sg:disjointOwnership` | **Routing layer** — operational |
| "Is there an entity that is simultaneously an instance of A's class and B's class?" | No (because `owl:disjointWith` claims formal class-disjointness) | `owl:disjointWith` | **Ontology layer** — formal class theory |

`boundary` is a **directional, asymmetric** routing claim. Skill A says "I am not the right answer for queries also matching B; route those to B." Skill B is not required to make the reciprocal claim. The router uses this to demote A in the candidate list when B scores higher, even when A's keywords and triggers also matched.

`owl:disjointWith` is a **symmetric, irreflexive** class-theoretic claim. If A `owl:disjointWith` B, then B `owl:disjointWith` A — and any reasoner deriving an entity that is both A and B will flag a contradiction. (Irreflexive because a class is never disjoint with itself: every class is identical to itself, not disjoint from itself.)

These are not aliases. They model different facts about the world.

## Empirical evidence

Per GPT-5.5's audit (2026-05-04), the existing `schemas/skill.context.jsonld` already chose the correct mapping for `boundary`:

```json
"boundary": {
  "@id": "sg:disjointOwnership",
  ...
}
```

The custom `sg:disjointOwnership` predicate was the right call: it makes a Skill-Graph-specific routing-layer claim without committing the schema to formal OWL semantics that authors do not actually intend. ADR 0001 § Decision #2 wrote prose that claimed OWL alignment, but the implementation never produced that mapping. The correction is to make the prose match the implementation, not the implementation match the prose.

## Decision

1. **`boundary` stays canonical** for routing-layer asymmetric handoff. The schema description, JSON-LD context, lint warnings, and field-reference narrative all describe `boundary` as the canonical name for wrong-skill routing protection. The "DEPRECATED ALIAS" framing in the v3.1 schema and ADR 0001 is reverted.
2. **`disjoint_with` becomes a separate orthogonal relation** with explicit OWL semantics (Option B from the synthesis IP-R2 § 4). It maps to `owl:disjointWith` in the JSON-LD context. Authors use it ONLY when they want a formal ontological class-disjointness claim — which is rare. Most skill libraries will never need it; `boundary` covers the routing-layer use case.
3. **The two predicates coexist with distinct mappings.** Lint validates targets exist for both. Routers use `boundary` for routing-layer exclusion (per `scripts/skill-graph-route.js` Stage 5). RDF consumers reading the JSON-LD projection see two distinct predicates.
4. **Lint deprecation warnings adjust:** the `boundary -> disjoint_with` rename warning in `scripts/skill-lint.js` is removed. The `adjacent -> related` rename warning stays (Decision #1 of ADR 0001 was sound).
5. **JSON-LD context comments cite this ADR** so future maintainers see the reasoning for the split mapping.

## Rationale

- **The implementation was already correct.** The JSON-LD context never claimed OWL alignment for `boundary`. Reverting the prose is cheaper and safer than retroactively bending the implementation.
- **`boundary` is a real, distinct relation type.** It encodes a routing-layer fact ("I am the wrong answer; route to X") that has no clean OWL/SKOS analogue. Naming it `disjoint_with` and gesturing at OWL hides that fact under a more famous predicate. Keeping the Skill-Graph-specific name with a Skill-Graph-specific @context predicate (`sg:disjointOwnership`) is the academically defensible call.
- **Option B preserves capability over Option A (drop).** Per the project's quality doctrine ("improve = enrich, never simplify"), keeping `disjoint_with` available — but with distinct semantics — leaves authors a place to encode formal class-disjointness if the rare case arises. Removing it would force authors who genuinely want OWL semantics to invent custom extensions.
- **No skill in the wild actually used `disjoint_with` as anything other than a `boundary` alias.** Re-purposing it under the new semantics breaks zero existing skills. (`grep -r "disjoint_with:" skills/` across the workspace returned zero hits at the time of this ADR.)

## Consequences

### Positive

- ADR 0001's narrative now matches the implementation. No agent reading the docs can reach a wrong conclusion about `boundary`'s semantics.
- `disjoint_with` becomes available for genuinely OWL-class-disjoint claims without being conflated with routing.
- The JSON-LD context projects to RDF cleanly: `sg:disjointOwnership` for routing, `owl:disjointWith` for formal class-theory.
- Lint stops nudging authors to rename `boundary -> disjoint_with` (which would have been wrong under the new posture).

### Negative

- Authors who already migrated to `disjoint_with` under the previous (false) "alias" framing now hold a relation with subtly different semantics. **Net impact: zero**, since no live skill in this repo or the consuming workspace uses `disjoint_with`. New authors reading the post-revision docs see only the corrected semantics.
- ADR-history readers must read ADR 0001 and ADR 0006 together to reconstruct the intended posture. Mitigated by the explicit status banner on ADR 0001.

### Neutral

- `boundary` and `disjoint_with` are now both present in the schema. Authors who need only routing-layer behavior continue to use `boundary` and never touch `disjoint_with`. Authors with formal-OWL needs reach for `disjoint_with` deliberately.
- The W3C SKOS / OWL alignment of the rest of the predicate set (`related`, `broader`, `narrower`, `verify_with`, `depends_on`) is unchanged.

## Implementation surface

The full set of edits accompanying this ADR is documented in the synthesis IP-R2:

- `schemas/skill.v3.schema.json` — `boundary` description restored to canonical; `disjoint_with` description rewritten with OWL framing.
- `schemas/skill.context.jsonld` — `boundary` keeps `sg:disjointOwnership`; `disjoint_with` switches from alias to `owl:disjointWith`. New `owl` namespace declared. `_adr_anchors` block added so the file points back here.
- `scripts/skill-lint.js` — `boundary -> disjoint_with` deprecation warning removed; `adjacent -> related` warning kept; new warning for declaring both `adjacent` and `related` (or both `boundary` and `disjoint_with`) for the same target.
- `docs/adr/0001-predicate-set.md` — Status banner: "Accepted with revision per ADR 0006 (Decision #2 reverted; Decisions #1, #3, #4 stand)."
- `docs/SKILL_METADATA_PROTOCOL_field-reference.md § relations` — Narrative updated to match the split semantics.
- `CHANGELOG.md` — `[Unreleased]` entry documenting the revision.

## References

- W3C OWL 2 Primer — https://www.w3.org/TR/owl2-primer/
- W3C SKOS Reference (skos:related, skos:broader, skos:narrower) — https://www.w3.org/TR/skos-reference/
- ADR 0001 — `docs/adr/0001-predicate-set.md` (the decision this ADR partially supersedes)
- ADR 0002 — `docs/adr/0002-json-ld-context.md` (governs the @context coverage policy)
- Synthesis 2026-05-04 § 8 Disagreement D1 + § 12 IP-R2 — the 2026-05-04 multi-model synthesis (kept private)
- GPT-5.5 reviewer empirical verification — kept private alongside the 2026-05-04 multi-model synthesis

## Supersedes

- ADR 0001 § Decision #2 only. Decisions #1 (`adjacent -> related`), #3 (`broader` / `narrower` additions), and #4 (`verify_with` / `depends_on` retention) stand unchanged.
