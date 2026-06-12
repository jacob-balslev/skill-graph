---
name: invalid-sidecar
description: "Negative fixture for the gate-conformance suite: the SKILL.md frontmatter is fully valid, but the sibling audit-state.json sidecar is missing the required `owner` field. Activate only inside test-gate-conformance.js to prove the structural lint gate validates the sidecar against schemas/skill-audit-state.schema.json. Do NOT use as a production skill."
subject: backend-engineering
public: true
scope: "Negative fixture validating that the structural gate rejects an audit-state.json sidecar that violates its schema (missing required field). Out: production skill guidance."
stability: experimental
license: Apache-2.0
---

# Invalid Sidecar (negative fixture)

This fixture is intentionally invalid at the SIDECAR layer: the SKILL.md frontmatter
is valid, but `audit-state.json` omits the required `owner` field. The structural
lint gate validates the sidecar against its schema and MUST reject this.

## Concept of the skill

**What it is:** A deliberately broken capability skill used only by the conformance runner.
**Mental model:** Keep the frontmatter valid but break the sibling audit-state.json so the sidecar-schema branch of the structural gate is the thing under test.
**Why it exists:** To guard the sidecar-validation path — a regression that stopped validating audit-state.json against its schema would otherwise pass the suite.
**What it is NOT:** It is not a production skill and never routes outside the test runner.
**Adjacent concepts:** the other negative fixtures under this directory; the audit-state.json sidecar (ADR-0019); the skill-audit-state schema.
**One-line analogy:** It is a form with the body filled in but a required field on the attached cover sheet left blank.
**Common misconception:** That sidecar validity is the Behavior Gate's concern — it is structural (the Integrity Gate validates the sidecar shape before any eval runs).

## Coverage

Valid frontmatter, invalid sidecar (missing required `owner`) → structural lint failure.

## Philosophy of the skill

One broken layer per fixture keeps the failing assertion unambiguous.

## Verification

Exercised by the gate-conformance runner; expected to fail structural lint with a sidecar required-field error.

## Do NOT Use When

- Always. This is a test fixture, not a usable skill.
