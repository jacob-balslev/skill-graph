---
name: below-floor-app
description: "Negative fixture for the application-eval conformance scenario. Activate only inside test-gate-conformance.js to prove --check fails when application.json has fewer than five cases. Do NOT use as a production skill."
subject: quality-assurance
public: true
scope: "Fixture validating the application-eval case-floor gate. Out: production skill guidance."
stability: experimental
license: Apache-2.0
---

# Below Floor App Fixture

## Concept of the skill

**What it is:** A deliberately tiny skill used only by the gate-conformance runner.
**Mental model:** The eval is broken in exactly one contract-relevant way: four cases instead of five.
**Why it exists:** To prove the structural gate rejects below-floor application evals in `--check` mode.
**What it is NOT:** It is not a real production skill.
**Adjacent concepts:** application eval case floors and red-herring coverage.
**One-line analogy:** It is a measuring cup filled just below the required line.
**Common misconception:** That four cases plus a red herring is enough to certify behavior — it is not.

## Coverage

One intentionally below-floor application eval under `evals/application.json`.

## Philosophy of the skill

Negative fixtures should isolate one broken rule so the expected diagnostic is stable.

## Verification

Run by `node scripts/__tests__/test-gate-conformance.js`.

## Do NOT Use When

- Always. This fixture is not a usable skill.
