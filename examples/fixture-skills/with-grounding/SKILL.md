---
# name: stable skill identifier. Match the skill directory name or the final namespace segment.
# Lowercase letters/numbers with hyphen, slash, or colon separators.
name: with-grounding
# description: routing-facing summary of what the skill covers and when it activates.
# Include concrete triggers and an explicit negative boundary; keep routing semantics out of prose-only ambiguity.
description: "Use as the minimal v8-conformant project-grounded fixture for skill-graph package tests. Activate this skill when verifying that lint enforces the rule 'non-empty project[] requires grounding' (subject_matter, grounding_mode, truth_sources, failure_modes, evidence_priority). Do NOT use as a production skill (use a real grounded skill from the canonical library)."

# === v8 Classification (subject + public; polyhierarchy via subjects[]) — see ADR-0017 ===
# subject: primary browse shelf — what the skill teaches. One of twelve closed values:
# backend-engineering / frontend-engineering / software-architecture / data-engineering / agent-ops / ai-engineering /
# quality-assurance / design / reasoning-strategy / software-engineering-method / knowledge-organization / product-domain.
subject: knowledge-organization
# public: publishability/private-data gate. Boolean.
# true = publishable/shareable; false = private and excluded from public export.
# Project anchoring is carried separately by non-empty `project[]` plus `grounding`.
public: false
# scope: free-text PRD-style statement of what the skill teaches and what it excludes.
# (v8 required; not an enum). Mirrors Coverage + Do NOT Use When at frontmatter level.
scope: "Hermetic v8 fixture for validating project-anchored skill metadata and grounding requiredness. Out: production grounding guidance."
# project: projects this skill is linked to. Array of {handle, role} objects.
# Non-empty project[] anchors the skill to a project and requires `grounding`.
# Suggested role values: source-of-truth, consumer, mirror. Replaces original v8 `workspace_tags`.
project:
  - handle: skill-graph
    role: source-of-truth
# keywords: semantic phrases for fuzzy router activation. v8 cap: max 10.
# Keep terms a user would actually type when starting a task in this skill's domain.
keywords:
  - grounding
  - fixture
  - truth-sources
  - hermetic-test
# grounding: required when `project[]` is non-empty. Declares the truth sources
# the skill anchors to and the failure modes those sources prevent. Omit when the
# skill is universal-knowledge. `subject_matter` replaces v8 `domain_object`.
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
# stability: lifecycle marker. One of:
# experimental (active development) / stable (production-ready) /
# frozen (no further changes expected) / deprecated.
# When `deprecated`, schema's allOf REQUIRES `superseded_by: <real-skill-name>`.
stability: experimental
# license: SPDX license identifier (e.g., MIT, Apache-2.0).
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
