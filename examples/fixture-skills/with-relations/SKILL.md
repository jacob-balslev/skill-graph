---
schema_version: 6
name: with-relations
description: "Use as the v6-conformant fixture exercising all four typed relation predicates (related, boundary, verify_with, depends_on) using the {skill, reason} object shape. Activate this skill when verifying that lint resolves cross-fixture relation targets without a sibling skills clone. Do NOT use as a production skill (use a real capability skill from the canonical library)."
version: 1.0.0
type: capability
category: engineering
scope: portable
owner: skill-graph-fixture-suite
freshness: "2026-05-19"
relations:
  related:
    - skill: minimal-capability
      reason: "Same fixture-suite kind (capability/portable) — minimal-capability is the bare-minimum baseline this fixture extends with relation edges."
  boundary:
    - skill: with-grounding
      reason: "Use with-grounding instead when the test target is grounding-block requireds or scope: codebase keyword enforcement — this fixture is portable and groundless by design."
  verify_with:
    - skill: comprehension-full
      reason: "When this fixture's relation edges are exercised in a routing-eval pass, comprehension-full provides the flat Understanding fields the grader reads against."
  depends_on:
    - skill: minimal-capability
      reason: "Composition signal: this fixture assumes the lint passes for the minimal-capability baseline; if minimal-capability regresses, this fixture is meaningless until the baseline is repaired."
drift_check:
  last_verified: "2026-05-19"
eval_artifacts: none
eval_state: unverified
routing_eval: absent
stability: experimental
license: Apache-2.0
---

# With-Relations Fixture

This fixture exercises every typed relation predicate in the v6 contract using
the canonical `{skill, reason}` object shape. Together with the sibling
fixtures (`minimal-capability`, `with-grounding`, `comprehension-full`) it
forms a closed cross-reference cluster — lint resolves every relation target
from the fixtures directory alone, with no dependency on the sibling
`../skills/skills/` canonical library.

## Coverage

The four relation kinds with distinct semantics:

| Predicate | Meaning | Target here |
|---|---|---|
| `related` | Adjacency for browse / routing expansion | `minimal-capability` |
| `boundary` | Routing-layer handoff ("use that one instead because...") | `with-grounding` |
| `verify_with` | Cross-check: when applied, verify with another | `comprehension-full` |
| `depends_on` | Composition: this assumes the other is in scope | `minimal-capability` |

Each entry carries a non-empty `reason` string — lint warns on relations that
omit the reason field because routing decisions become unauditable without it.

## Philosophy

Relations are the edges of the Skill Graph. The four predicates are
intentionally orthogonal: `related` is symmetric and weakly directional,
`boundary` is asymmetric and routing-routed, `verify_with` is symmetric and
quality-routed, `depends_on` is asymmetric and load-order-routed. Conflating
them would force the router to guess intent. This fixture is the smallest
configuration that demonstrates the distinction across every predicate at
once, hermetically, without leaking any canonical-skill name into the test
surface.

## Verification

```bash
node scripts/skill-lint.js --path examples/fixture-skills/with-relations
# expected: 0 errors
node scripts/skill-lint.js --path examples/fixture-skills
# expected: 0 errors across all four fixtures with relations resolved
```

Lint must resolve every relation target from the union of configured roots
plus the explicit `--path` set. In a hermetic package-test environment
(no sibling skills clone), the four fixtures in this directory form a closed
cross-reference set: every `relations.*` target above names another fixture
that lives in the same directory.

## Do NOT Use When

- You need to test the bare-minimum frontmatter — use `minimal-capability`.
- You need to test codebase grounding — use `with-grounding`.
- You need to test flat Understanding fields or the nested concept block — use `comprehension-full`.
- You need to test relation-target resolution against the canonical library — use any real skill from `skills/` (e.g. `naming-conventions` → `semantics`).
