---
schema_version: 8
name: comprehension-full
description: "Use as the v8-conformant fixture exercising the full Understanding surface — flat top-level fields (mental_model, purpose, boundary, analogy, misconception) AND the nested v5 concept block for anyOf back-compat. Activate this skill when verifying that lint accepts both presentation forms when comprehension_state is present. Do NOT use as a production skill (use a real capability skill from the canonical library)."
version: 1.0.0
subject: knowledge-organization
deployment_target: portable
owner: skill-graph-fixture-suite
freshness: "2026-05-19"
comprehension_state: present
mental_model: "Understanding fields are the comprehension grader's reading surface. The grader expects five primitives — mental_model, purpose, boundary, analogy, misconception — each with its own grading dimension and weight. v6 promotes them to flat top-level fields; v5 nested them inside a concept block. Both shapes must round-trip cleanly through lint, manifest generation, and the grader."
purpose: "Comprehension grading checks whether an agent given the SKILL.md can answer realistic scenarios. The Understanding fields anchor that grading by declaring what the skill claims to teach. Before v6, these primitives lived as bold-label body sections that parsers had to scrape; v5 lifted them into the nested concept block; v6 promotes them to flat top-level fields so consumers no longer need to walk a sub-object to read them."
boundary: "Comprehension grading is NOT routing-eval (which tests whether the router picks the right skill) and NOT lint (which tests schema conformance). The flat top-level boundary field (concept-layer) is also distinct from relations.boundary (routing-layer handoff): one declares what the skill is NOT conceptually; the other declares which sibling skill should handle a misrouted query."
analogy: "Like the difference between a book's table of contents and its index. Both let a reader find content, but they answer different questions. Flat Understanding fields are the index — direct, addressable, no nesting. The legacy concept block was the table of contents — hierarchical, requiring traversal."
misconception: "Believing that comprehension_state: present means the skill ships a passing comprehension eval. It does not. comprehension_state: present means the skill carries the Understanding fields the grader reads against; eval_state: passing is a separate, independent claim that the eval has been run and succeeded."
concept:
  definition: "The legacy nested concept block — accepted by the schema for back-compat. Seven sub-fields covering definition, mental_model, purpose, boundary, taxonomy, analogy, and misconception. When the flat top-level Understanding fields are also present, the flat fields take precedence."
  mental_model: "The schema groups seven primitives under one frontmatter key (concept) in the legacy nested shape, and promotes them to flat top-level fields in the canonical shape. The grader reads from the flat fields first when both are present; the nested block remains valid as a fallback."
  purpose: "Allow skills that carry the nested block to satisfy the comprehension_state: present requirement without requiring a flag-day rewrite — the back-compat anyOf rule in the schema keeps both shapes valid."
  boundary: "Not a replacement for the flat top-level fields — when both are present, the flat fields win. Do not author new skills that only set the nested block; treat the nested block as a back-compat surface, not the canonical home."
  taxonomy: "Subset of the Understanding surface — every nested concept.* sub-field has a flat top-level equivalent (or, for definition, is absorbed by description; for taxonomy, by relations.broader)."
  analogy: "Like a dual-encoding alias pattern where both encodings validate and the schema specifies which takes precedence. Both shapes round-trip cleanly; the canonical form is preferred when both are present."
  misconception: "Believing the schema removed the nested concept block. It did not — the schema retains it under an anyOf rule so skills that carry it continue to validate without modification. The nested form is accepted for back-compat but is not the canonical authoring surface for new skills."
drift_check:
  last_verified: "2026-05-19"
eval_artifacts: none
eval_state: unverified
routing_eval: absent
stability: experimental
license: Apache-2.0
---

# Comprehension-Full Fixture

This fixture exercises the full Understanding surface in two presentation
forms simultaneously: the canonical flat top-level fields (`mental_model`,
`purpose`, `boundary`, `analogy`, `misconception`) AND the nested legacy
`concept` block accepted for back-compat. The lint and the comprehension
grader must both accept either shape, and when both are present the flat
fields must win.

## Coverage

The five flat Understanding fields (canonical) and the seven nested
`concept` sub-fields (back-compat) co-existing in one skill, plus
`comprehension_state: present` to trigger the conditional requirement.
No grounding (deployment_target: portable), no relations, no Audit Status.

## Philosophy

The schema keeps the nested `concept` block under an `anyOf` rule so
skills that carry it still validate, while the flat top-level fields are
the canonical authoring surface for new skills. This fixture is the
smallest configuration that proves both shapes round-trip through lint
together, anchoring the regression test that detects any future change
that would force a flag-day rewrite.

## Verification

```bash
node scripts/skill-lint.js --path examples/fixture-skills/comprehension-full
# expected: 0 errors
node scripts/skill-lint.js --path examples/fixture-skills
# expected: 0 errors across all four fixtures
```

Lint must accept the dual-shape skill: `comprehension_state: present`
satisfied by the nested `concept` block (the back-compat anyOf rule)
AND the flat top-level fields present alongside it. If the grader reads
from both, the flat values must take precedence — that contract is
documented in `SKILL_METADATA_PROTOCOL.md` § Understanding.

## Do NOT Use When

- You need to test the bare-minimum frontmatter — use `minimal-capability`.
- You need to test codebase grounding — use `with-grounding`.
- You need to test typed relations — use `with-relations`.
- You need to test v6-only flat Understanding fields without the nested back-compat block — author a separate fixture or use a real v6-only canonical skill.
