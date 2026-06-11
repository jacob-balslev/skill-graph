---
# name: stable skill identifier. Match the skill directory name or the final namespace segment.
# Lowercase letters/numbers with hyphen, slash, or colon separators.
name: minimal-capability
# description: routing-facing summary of what the skill covers and when it activates.
# Include concrete triggers and an explicit negative boundary; keep routing semantics out of prose-only ambiguity.
description: "Use as the smallest v8-compat capability fixture for skill-graph package tests. Activate this skill when verifying that lint, manifest generation, and routing accept the bare-minimum required frontmatter. Do NOT use as a production skill (use a real capability skill from the canonical library)."

# === v8 Classification (subject + public; polyhierarchy via subjects[]) — see ADR-0017 ===
# subject: primary browse shelf — what the skill teaches. One of twelve closed values:
# backend-engineering / frontend-engineering / software-architecture / data-engineering / agent-ops / ai-engineering /
# quality-assurance / design / reasoning-strategy / software-engineering-method / knowledge-organization / product-domain.
subject: backend-engineering
# public: publishability/private-data gate. Boolean.
# true = publishable/shareable; false = private and excluded from public export.
# Project anchoring is carried separately by non-empty `project[]` plus `grounding`.
public: true
# scope: free-text PRD-style statement of what the skill teaches and what it excludes.
# (v8 required; not an enum). Mirrors Coverage + Do NOT Use When at frontmatter level.
scope: "Minimal v8 schema fixture for validating lint, manifest generation, routing, and standalone audit smoke tests. Out: production skill guidance."
# stability: lifecycle marker. One of:
# experimental (active development) / stable (production-ready) /
# frozen (no further changes expected) / deprecated.
# When `deprecated`, schema's allOf REQUIRES `superseded_by: <real-skill-name>`.
stability: experimental
# license: SPDX license identifier (e.g., MIT, Apache-2.0).
license: Apache-2.0
---

# Minimal Capability Fixture

This fixture exercises the bare-minimum required v8-compatible frontmatter. It contains
only the required fields, the recommended stability + license fields, and the
four capability-archetype body sections.

## Concept of the skill

**What it is:** A capability skill is a unit of reusable agent guidance described by v8-compatible frontmatter plus a small set of body sections.
**Mental model:** Frontmatter is the routing contract; the body is the teaching content the agent applies.
**Why it exists:** To prove the smallest conformant skill still lints, compiles into the manifest, and routes.
**What it is NOT:** It is not a grounded, relation-rich, or comprehension-graded skill — those are exercised by the sibling fixtures.
**Adjacent concepts:** the with-grounding, with-relations, and comprehension-full fixtures.
**One-line analogy:** It is the "hello world" of the skill contract.
**Common misconception:** That a minimal skill may omit the skill-content body sections — it may not; the five are required.

## Coverage

The required v8 frontmatter fields, plus `stability` and `license`. No
optional relations, no grounding, no Understanding fields, no
Audit Status.

## Philosophy of the skill

The simplest possible v8-compatible skill should still pass lint. If this fixture ever
starts failing lint without a deliberate schema change, the lint check has
regressed or grown a new required field that this fixture should adopt
together with the canonical library.

## Verification

```bash
node scripts/skill-lint.js --path examples/fixture-skills/minimal-capability
# expected: 0 errors
```

## Do NOT Use When

- You need to exercise codebase grounding — see the `with-grounding` planned fixture in [`../README.md`](../README.md).
- You need to exercise typed relations — see the `with-relations` planned fixture in [`../README.md`](../README.md).
- You need to exercise flat Understanding fields or the Audit Status — see the `comprehension-full` planned fixture in [`../README.md`](../README.md).
- You need a real production-grade authoring example — use a canonical skill from `skills/`.
