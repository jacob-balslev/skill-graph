---
name: with-grounding
description: "Use as the minimal v8-conformant project-grounded fixture for skill-graph package tests. Activate this skill when verifying that lint enforces the rule 'non-empty project[] requires grounding' (subject_matter, grounding_mode, truth_sources, failure_modes, evidence_priority). Do NOT use as a production skill (use a real grounded skill from the canonical library)."
subject: knowledge-organization
public: false
scope: "Hermetic v8 fixture for validating project-anchored skill metadata and grounding requiredness. Out: production grounding guidance."
project:
  - handle: skill-graph
    role: source-of-truth
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
    - "If the v8 schema renames or removes a grounding sub-field, this fixture must move in lockstep with the schema change."
    - "If the fixture-skills README anchor 'Invariants' is renamed, the anchor reference above breaks and lint fails."
  evidence_priority: repo_code_first
stability: experimental
license: Apache-2.0
---

# With-Grounding Fixture

This fixture exercises the v8 rule `non-empty project[] → grounding
required`. It also carries `keywords` so routing-quality checks have realistic
activation metadata to inspect, but `keywords` are not schema-required.

## Concept of the skill

**What it is:** A project-anchored skill declares which projects it belongs to (`project[]`) and grounds its claims in those projects' truth sources (`grounding`).
**Mental model:** Project membership implies repo-specific claims, which the schema makes grounding mandatory for.
**Why it exists:** To prove the v8 rule that a non-empty `project[]` requires a populated `grounding` block (re-anchored from the retired `deployment_target: project` rule).
**What it is NOT:** It is not a portable/ambient skill (those carry no `project[]` and need no grounding), and `public: false` here marks it as not-for-marketplace, independent of grounding.
**Adjacent concepts:** `grounding`, `project[]`, drift detection, the `public` publishability gate.
**One-line analogy:** Grounding is a citation; a project-anchored claim without it is hearsay.
**Common misconception:** That publishability (`public`) drives the grounding requirement — it does not; `project[]` presence does.

## Coverage

The five required `grounding` sub-fields (`subject_matter`, `grounding_mode`,
`truth_sources`, `failure_modes`, `evidence_priority`), an object-shaped
truth_source entry with `path` + `anchor` + `note`, and a non-empty
`keywords` array for routing realism. No relations, no Audit Status, no
Understanding fields.

## Philosophy of the skill

The grounding block is the contract that distinguishes a knowledge skill from
a hallucinated one. A project-anchored skill (non-empty `project[]`) is making claims about
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
- You need a production project-grounded skill — use a real grounded skill from `skills/` (for example `skill-router` or `graph-audit`).
