---
schema_version: 4
name: v3-1-skos-fixture
description: Test fixture exercising SKOS predicates (related, broader, narrower), routing-layer suppresses, the ADR 0006 split between routing exclusion and disjoint_with (OWL class-disjointness), and the io_contract composition hook. Used by scripts/__tests__/test-v3-1-skos-runtime.js to verify that the manifest generator, lint, and router all recognize the full canonical predicate set. Not a production skill.
version: 1.0.0
type: capability
category: testing
scope: portable
owner: skill-graph-maintainer
freshness: 2026-05-04
license: MIT
stability: experimental

triggers:
  - test fixture
keywords:
  - fixture
  - v3-1
  - SKOS
  - predicate
examples:
  - "Used by scripts/__tests__/test-v3-1-skos-runtime.js to assert manifest entries"
  - "Used by scripts/skill-lint.js relation-target test (related/broader/narrower)"
  - "Used by scripts/skill-graph-route.js Stage 4b broader-recall test"
anti_examples:
  - "DO NOT use as a real authored skill — fixture only"

relations:
  related:
    - documentation
    - testing-strategy
  broader:
    - debugging
  narrower:
    - a11y
  suppresses:
    - skill: skill-router
      reason: "skill-router owns dispatch decisions; this fixture only exercises predicates"
  disjoint_with:
    - skill: refactor
      reason: "Formal OWL example — fixture and refactor name disjoint conceptual classes"
  verify_with:
    - lint-overlay
  depends_on:
    - graph-audit
  io_contract:
    inputs:
      - skill-md
    outputs:
      - manifest

eval_artifacts: none
eval_state: untested
routing_eval: absent

drift_check:
  last_verified: 2026-05-04
---

# v3.1 SKOS Fixture

> Test fixture exercising the full v3.1 predicate set. Not a production skill.

## Domain Context

This fixture exists to verify that the runtime — `generate-manifest.js`, `skill-lint.js`,
`skill-graph-route.js`, and the lint-target resolver — iterates the complete canonical
predicate set defined in ADR 0001 (SKOS additions: `related`, `broader`, `narrower`),
ADR 0018 (`suppresses` for routing-layer exclusion), ADR 0006 (`disjoint_with` as
the separate orthogonal relation for formal OWL class-disjointness), and the
composition hook `io_contract`.

The companion test `scripts/__tests__/test-v3-1-skos-runtime.js` builds a manifest entry
from this file and asserts every predicate above appears in the resulting `relations`
block, with relation-target validation passing for all eight references.

## Coverage

Predicates exercised:

- `related` — symmetric SKOS associative relation (skos:related)
- `broader` — SKOS generalisation (skos:broader); triggers Stage 4b parent recall in router
- `narrower` — SKOS specialisation (skos:narrower)
- `suppresses` — routing-layer asymmetric exclusion (sg:disjointOwnership)
- `disjoint_with` — formal OWL class-disjointness (owl:disjointWith)
- `verify_with` — PROV-O informational influence (prov:wasInformedBy)
- `depends_on` — DCMI requirement (dcterms:requires)
- `io_contract` — machine-checkable artifact inputs/outputs for composition

Retired aliases are intentionally NOT exercised in this fixture; the companion unit
test checks in-memory alias normalization separately.

## Workflow

This skill has no workflow — it is a fixture, not a procedure.

## Verification

`scripts/__tests__/test-v3-1-skos-runtime.js` exits 0 only when this fixture round-trips
cleanly through the manifest generator and lint relation-target check.
