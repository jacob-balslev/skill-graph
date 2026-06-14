---
name: demo-skill
description: "Negative fixture for the audit-manifest conformance scenario. Activate only inside test-gate-conformance.js to prove a graded application verdict without evals/application.json fails. Do NOT use as a production skill."
subject: backend-engineering
public: true
scope: "Fixture validating verdict/artifact honesty. Out: production skill guidance."
stability: experimental
license: Apache-2.0
---

# Demo Skill Fixture

## Concept of the skill

**What it is:** A fake skill used only by the audit-manifest conformance runner.
**Mental model:** The sidecar and run verdict claim a graded application result, but the artifact is absent.
**Why it exists:** To prove graded application verdicts require `evals/application.json`.
**What it is NOT:** It is not a real production skill.
**Adjacent concepts:** audit-state sidecars and application eval artifacts.
**One-line analogy:** It is a receipt without the purchased item.
**Common misconception:** That a verdict alone is enough evidence for behavior certification.

## Coverage

One intentionally dishonest graded application verdict without a backing artifact.

## Philosophy of the skill

Verdict honesty needs a fixture because this failure mode looks green in prose until the artifact path is checked.

## Verification

Run by `node scripts/__tests__/test-gate-conformance.js`.

## Do NOT Use When

- Always. This fixture is not a usable skill.
