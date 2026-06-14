---
name: valid-app
description: "Positive fixture for the application-eval conformance scenario. Activate only inside test-gate-conformance.js to prove a five-case application eval with a red herring passes. Do NOT use as a production skill."
subject: quality-assurance
public: true
scope: "Fixture validating application-eval structural conformance. Out: production skill guidance."
stability: experimental
license: Apache-2.0
---

# Valid App Fixture

## Concept of the skill

**What it is:** A deliberately tiny skill used only by the gate-conformance runner.
**Mental model:** The SKILL.md unlocks discovery; the sibling application eval is the scenario under test.
**Why it exists:** To prove the application-eval structural gate accepts a conformant file.
**What it is NOT:** It is not a real production skill.
**Adjacent concepts:** application eval structural checks and red-herring coverage.
**One-line analogy:** It is a test harness prop.
**Common misconception:** That this skill's body is being evaluated — the scenario tests only its eval file.

## Coverage

One conformant application eval under `evals/application.json`.

## Philosophy of the skill

Conformance tests should use a small, boring fixture so the failing or passing condition is obvious.

## Verification

Run by `node scripts/__tests__/test-gate-conformance.js`.

## Do NOT Use When

- Always. This fixture is not a usable skill.
