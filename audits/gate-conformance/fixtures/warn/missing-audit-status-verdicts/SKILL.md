---
name: missing-audit-status-verdicts
description: "Warning fixture for the gate-conformance suite: the sidecar is schema-valid but omits the four durable Audit Status verdict fields. Activate only inside test-gate-conformance.js to prove lint warns without failing. Do NOT use as a production skill."
subject: backend-engineering
public: true
scope: "Warning fixture validating report-only audit-status migration debt. Out: production skill guidance."
stability: experimental
license: Apache-2.0
---

# Missing Audit Status Verdicts Fixture

## Concept of the skill

**What it is:** A deliberately incomplete audit-state fixture used only by the conformance runner.
**Mental model:** The sidecar is valid enough to load, but lacks the four durable Audit Status verdict fields.
**Why it exists:** To prove the lint warning surfaces migration backlog without failing the current corpus.
**What it is NOT:** It is not a production skill and never routes outside the test runner.
**Adjacent concepts:** audit-state sidecars and four-verdict Audit Status.
**One-line analogy:** It is a checklist with the status row left blank.
**Common misconception:** That missing loop-written verdicts should be hand-authored to silence the warning — they should be stamped by the Skill Audit Loop.

## Coverage

Schema-valid sidecar basics with missing `structural_verdict`, `truth_verdict`, and `comprehension_verdict`.

## Philosophy of the skill

Warnings are still executable contract. This fixture keeps report-only migration debt visible without turning it into a hard gate.

## Verification

Exercised by the gate-conformance runner; expected to exit 0 and emit the audit-status warning.

## Do NOT Use When

- Always. This is a test fixture, not a usable skill.
