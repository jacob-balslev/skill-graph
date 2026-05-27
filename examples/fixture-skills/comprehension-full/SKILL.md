---
schema_version: 6
name: comprehension-full
description: "Use as the v6-conformant fixture exercising the full Understanding surface — flat top-level fields (mental_model, purpose, boundary, analogy, misconception) AND the nested v5 concept block for anyOf back-compat. Activate this skill when verifying that lint accepts both presentation forms when comprehension_state is present. Do NOT use as a production skill (use a real capability skill from the canonical library)."
version: 1.0.0
type: capability
category: engineering
scope: portable
owner: skill-graph-fixture-suite
freshness: "2026-05-19"
comprehension_state: present
mental_model: "Understanding fields are the comprehension grader's reading surface. The grader expects five primitives — mental_model, purpose, boundary, analogy, misconception — each with its own grading dimension and weight. v6 promotes them to flat top-level fields; v5 nested them inside a concept block. Both shapes must round-trip cleanly through lint, manifest generation, and the grader."
purpose: "Comprehension grading checks whether an agent given the SKILL.md can answer realistic scenarios. The Understanding fields anchor that grading by declaring what the skill claims to teach. Before v6, these primitives lived as bold-label body sections that parsers had to scrape; v5 lifted them into the nested concept block; v6 promotes them to flat top-level fields so consumers no longer need to walk a sub-object to read them."
boundary: "Comprehension grading is NOT routing-eval (which tests whether the router picks the right skill) and NOT lint (which tests schema conformance). The flat top-level boundary field (concept-layer) is also distinct from relations.boundary (routing-layer handoff): one declares what the skill is NOT conceptually; the other declares which sibling skill should handle a misrouted query."
analogy: "Like the difference between a book's table of contents and its index. Both let a reader find content, but they answer different questions. Flat Understanding fields are the index — direct, addressable, no nesting. The legacy concept block was the table of contents — hierarchical, requiring traversal."
misconception: "Believing that comprehension_state: present means the skill ships a passing comprehension eval. It does not. comprehension_state: present means the skill carries the Understanding fields the grader reads against; eval_state: passing is a separate, independent claim that the eval has been run and succeeded."
concept:
  definition: "The legacy nested v5 concept block. Seven required sub-fields covering definition, mental_model, purpose, boundary, taxonomy, analogy, and misconception. Retained in v6 for back-compat so v5 skills not yet migrated still satisfy the comprehension_state: present requirement."
  mental_model: "v5 grouped the seven primitives under one frontmatter key (concept) for namespacing. v6 unbundled them to flat top-level fields. The grader reads from the flat fields first when both are present; the nested block remains valid as a fallback."
  purpose: "Allow v5 skills to satisfy the comprehension_state: present requirement during the multi-cycle v5→v6 migration without forcing a flag-day rewrite of every author skill."
  boundary: "Not a replacement for the flat fields in v6 — when both are present in a v6 skill, the flat fields win. Do not author new v6 skills that only set the nested block; treat the nested block as a back-compat surface, not the canonical home."
  taxonomy: "Subset of the v6 Understanding surface — every nested concept.* sub-field has a flat top-level equivalent (or, for definition, is absorbed by description; for taxonomy, by category + relations.broader)."
  analogy: "Like the v3.1 alias pattern (e.g., grounding.subject for grounding.domain_object). Both shapes validate; both round-trip; the preferred form takes precedence when both are present."
  misconception: "Believing the v6 schema removed the nested concept block. It did not — the schema retains it under an anyOf rule so v5 skills continue to validate without modification. v6 deprecates the nested form for new skills but does not eliminate it."
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
forms simultaneously: the v6 flat top-level fields (`mental_model`,
`purpose`, `boundary`, `analogy`, `misconception`) AND the nested v5
`concept` block. The lint and the comprehension grader must both accept
either shape, and when both are present the flat fields must win.

## Coverage

The five flat Understanding fields (v6 canonical) and the seven nested
`concept` sub-fields (v5 back-compat) co-existing in one skill, plus
`comprehension_state: present` to trigger the conditional requirement.
No grounding (scope: portable), no relations, no Audit Status.

## Philosophy

The v5 → v6 migration cannot happen as a flag-day — there are too many
adopter skills to rewrite atomically. v6 keeps the nested `concept` block
under an `anyOf` rule so v5 skills validate without changes, while the
new flat top-level fields become the canonical authoring surface for
new skills. This fixture is the smallest configuration that proves both
shapes round-trip through lint together, anchoring the regression test
that detects any future change that would force a flag-day rewrite.

## Verification

```bash
node scripts/skill-lint.js --path examples/fixture-skills/comprehension-full
# expected: 0 errors
node scripts/skill-lint.js --path examples/fixture-skills
# expected: 0 errors across all four fixtures
```

Lint must accept the dual-shape skill: `comprehension_state: present`
satisfied by the nested `concept` block (per the v6 anyOf back-compat
rule) AND the flat top-level fields present alongside it. If the grader
reads from both, the flat values must take precedence — that contract is
documented in the v5-to-v6 migration note in `skill-metadata-protocol`.

## Do NOT Use When

- You need to test the bare-minimum frontmatter — use `minimal-capability`.
- You need to test codebase grounding — use `with-grounding`.
- You need to test typed relations — use `with-relations`.
- You need to test v6-only flat Understanding fields without the nested back-compat block — author a separate fixture or use a real v6-only canonical skill.
