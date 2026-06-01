---
name: comprehension-full
description: "Use as the v8-conformant fixture exercising the full Understanding surface — the five flat top-level fields (mental_model, purpose, boundary, analogy, misconception) in SKILL.md frontmatter, paired with comprehension_state: present in the audit-state.json sidecar. Activate this skill when verifying that the cross-file lint accepts the flat Understanding fields when the sidecar declares comprehension_state: present. Do NOT use as a production skill (use a real capability skill from the canonical library)."
subject: knowledge-organization
deployment_target: portable
scope: "Hermetic v8 fixture for validating the cross-file comprehension_state contract (ADR-0019): sidecar comprehension_state: present requires the five flat Understanding fields in frontmatter. Out: production skill guidance."
mental_model: "Understanding fields are the comprehension grader's reading surface. The grader expects five primitives — mental_model, purpose, boundary, analogy, misconception — each with its own grading dimension and weight. They are authored as flat top-level frontmatter fields; the sidecar's comprehension_state: present flag declares they are present. The cross-file lint check ties the two files together: when the sidecar flag is present, the five frontmatter fields must be populated."
purpose: "Comprehension grading checks whether an agent given the SKILL.md can answer realistic scenarios. The Understanding fields anchor that grading by declaring what the skill claims to teach. Before they were flat top-level fields, these primitives lived first as bold-label body sections parsers had to scrape, then in a nested concept block; the protocol now promotes them to flat top-level frontmatter fields so consumers no longer walk a sub-object, while the comprehension_state bookkeeping flag lives in the audit-state sidecar."
boundary: "Comprehension grading is NOT routing-eval (which tests whether the router picks the right skill) and NOT lint (which tests schema conformance). The flat top-level boundary field (concept-layer) is also distinct from relations.boundary (routing-layer exclusion): one declares what the skill is NOT conceptually; the other declares which sibling skill is suppressed from co-routing when this skill owns the query."
analogy: "Like the difference between a book's table of contents and its index. Both let a reader find content, but they answer different questions. The flat Understanding fields are the index — direct, addressable, no nesting; the sidecar comprehension_state flag is the library catalog card that records the index exists."
misconception: "Believing that comprehension_state: present means the skill ships a passing comprehension eval. It does not. comprehension_state: present means the skill carries the Understanding fields the grader reads against; eval_state: passing is a separate, independent claim that the eval has been run and succeeded."
stability: experimental
license: Apache-2.0
---

# Comprehension-Full Fixture

This fixture exercises the full Understanding surface in the canonical
v8 post-sidecar shape: the five flat top-level fields (`mental_model`,
`purpose`, `boundary`, `analogy`, `misconception`) live in `SKILL.md`
frontmatter, and `comprehension_state: present` lives in the
`audit-state.json` sidecar. The cross-file lint check (per ADR-0019)
must accept this pairing — when the sidecar declares
`comprehension_state: present`, the five frontmatter fields are required.

## Coverage

The five flat Understanding fields in frontmatter plus
`comprehension_state: present` in the audit-state sidecar, proving the
cross-file comprehension contract. No grounding (deployment_target:
portable), no relations.

## Philosophy

Per [ADR-0019](../../../docs/adr/0019-audit-state-sidecar-separation.md),
agent-facing fields (including the flat Understanding prose) live in
frontmatter, while audit/eval bookkeeping (including `comprehension_state`)
lives in the sidecar. The legacy nested `concept` block was retired in the
clean cut. This fixture is the smallest configuration that proves the
cross-file lint binds the sidecar flag to the frontmatter Understanding
fields without re-introducing the nested block.

## Verification

```bash
node scripts/skill-lint.js --path examples/fixture-skills/comprehension-full
# expected: 0 errors
node scripts/skill-lint.js --path examples/fixture-skills
# expected: 0 errors across all four fixtures
```

The cross-file lint must accept the split shape: `comprehension_state:
present` in `audit-state.json` satisfied by the five flat top-level
Understanding fields in `SKILL.md` frontmatter. That contract is
documented in `SKILL_METADATA_PROTOCOL.md` § Understanding.

## Do NOT Use When

- You need to test the bare-minimum frontmatter — use `minimal-capability`.
- You need to test codebase grounding — use `with-grounding`.
- You need to test typed relations — use `with-relations`.
- You need to test frontmatter with no comprehension surface at all — author a separate fixture or use a real capability skill with `comprehension_state` absent.
