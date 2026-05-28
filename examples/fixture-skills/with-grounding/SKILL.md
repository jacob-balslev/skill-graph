---
schema_version: 8
name: with-grounding
description: "Use as the minimal v8-conformant project-grounded fixture for skill-graph package tests. Activate this skill when verifying that lint enforces grounding requireds (subject_matter, grounding_mode, truth_sources, failure_modes, evidence_priority) and non-empty keywords for deployment_target: project. Do NOT use as a production skill (use a real grounded skill from the canonical library)."
version: 1.0.0
subject: knowledge-organization
deployment_target: project
owner: skill-graph-fixture-suite
freshness: "2026-05-19"
keywords:
  - grounding
  - fixture
  - truth-sources
  - hermetic-test
grounding:
  subject_matter: "v8 grounding contract"
  grounding_mode: repo_specific
  truth_sources:
    - path: "examples/fixture-skills/README.md"
      anchor: "Invariants"
      note: "The hermetic-fixture invariants document what every fixture in this directory must satisfy."
  failure_modes:
    - "If the v6 schema renames or removes a grounding sub-field, this fixture must move in lockstep with the schema bump."
    - "If the fixture-skills README anchor 'Invariants' is renamed, the anchor reference above breaks and lint fails."
  evidence_priority: repo_code_first
drift_check:
  last_verified: "2026-05-19"
eval_artifacts: none
eval_state: unverified
routing_eval: absent
stability: experimental
license: Apache-2.0
---

# With-Grounding Fixture

This fixture exercises the v8 rule `deployment_target: project → grounding
required`, plus the lint rule that project-grounded skills must declare
non-empty `keywords`. Together those two rules form the smallest
routing-discoverable, drift-trackable project-anchored skill.

## Coverage

The five required `grounding` sub-fields (`subject_matter`, `grounding_mode`,
`truth_sources`, `failure_modes`, `evidence_priority`), an object-shaped
truth_source entry with `path` + `anchor` + `note`, and the non-empty
`keywords` array that `deployment_target: project` demands. No relations, no
Audit Status, no Understanding fields.

## Philosophy

The grounding block is the contract that distinguishes a knowledge skill from
a hallucinated one. A `deployment_target: project` skill is making claims about
specific local files; those claims rot when the files move. The grounding block
records *which* files anchor the claim, *how* to detect drift (anchor or
line_range hashing), and *what* failure modes appear when drift occurs. This
fixture is the smallest configuration that exercises every grounding required
field without depending on a sibling skills clone.

## Verification

```bash
node scripts/skill-lint.js --path examples/fixture-skills/with-grounding
# expected: 0 errors
```

Lint must accept this fixture even when the published `@skill-graph/cli`
package is installed standalone (no sibling `../skills/skills/` clone). The
truth_source path resolves under the package's own `examples/fixture-skills/`
tree, not under the canonical skill library.

## Do NOT Use When

- You need to test the bare-minimum frontmatter — use `minimal-capability`.
- You need to test typed relations — use `with-relations`.
- You need to test flat Understanding fields or the nested concept block — use `comprehension-full`.
- You need a production project-grounded skill — use a real grounded skill from `skills/` (e.g. `nextauth-patterns`, `query-tier-safety`).
