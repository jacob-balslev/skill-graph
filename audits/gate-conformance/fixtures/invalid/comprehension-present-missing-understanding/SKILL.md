---
name: comprehension-present-missing-understanding
description: "Negative fixture for the gate-conformance suite: the audit-state sidecar declares `comprehension_state: present` but the SKILL.md omits the five flat Understanding fields. Activate only inside test-gate-conformance.js to prove the cross-file lint gate (comprehension_state -> Understanding fields) FAILS. Do NOT use as a production skill."
subject: backend-engineering
public: true
scope: "Negative fixture validating the comprehension_state -> Understanding-fields cross-file gate. Out: production skill guidance."
stability: experimental
license: Apache-2.0
---

# Comprehension Present, Understanding Missing (negative fixture)

This fixture is intentionally invalid: its sibling `audit-state.json` sets
`comprehension_state: present`, which REQUIRES the five flat Understanding fields
(`mental_model`, `purpose`, `concept_boundary`, `analogy`, `misconception`) in the
frontmatter — but this SKILL.md omits them. The cross-file lint gate MUST reject it.

## Concept of the skill

**What it is:** A deliberately broken capability skill used only by the conformance runner.
**Mental model:** Declare comprehension present in the sidecar while omitting the frontmatter Understanding fields.
**Why it exists:** To give the comprehension_state -> Understanding-fields cross-file rule a failing example.
**What it is NOT:** It is not a production skill and never routes outside the test runner.
**Adjacent concepts:** the other negative fixtures under this directory.
**One-line analogy:** It is a unit test's fixture, not a real skill.
**Common misconception:** That the body "Concept of the skill" prose substitutes for the frontmatter Understanding fields — it does not; the gate checks the frontmatter fields.

## Coverage

Sidecar `comprehension_state: present` without the five frontmatter Understanding fields.

## Philosophy of the skill

One broken rule per fixture keeps the failing assertion unambiguous.

## Verification

Exercised by the gate-conformance runner; expected to fail the comprehension_state cross-file gate.

## Do NOT Use When

- Always. This is a test fixture, not a usable skill.
