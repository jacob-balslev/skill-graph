---
name: bad-criticality-app
description: "Negative fixture for the application-eval conformance scenario. Activate only inside test-gate-conformance.js to prove application criticality rejects the comprehension-only `medium` value. Do NOT use as a production skill."
subject: quality-assurance
public: true
scope: "Fixture validating the application-eval criticality enum. Out: production skill guidance."
stability: experimental
license: Apache-2.0
---

# Bad Criticality App Fixture

## Concept of the skill

**What it is:** A deliberately tiny skill used only by the gate-conformance runner.
**Mental model:** The eval is broken in exactly one contract-relevant way: `criticality: medium`.
**Why it exists:** To catch the recurring confusion between comprehension and application eval enums.
**What it is NOT:** It is not a real production skill.
**Adjacent concepts:** application eval schema and comprehension eval schema.
**One-line analogy:** It is a signpost pointing at the wrong lane.
**Common misconception:** That `medium` is a valid application criticality because it exists in comprehension evals.

## Coverage

One application eval whose case count and red-herring coverage are valid but whose criticality enum is invalid.

## Philosophy of the skill

The common authoring error deserves an executable fixture because prose warnings are easy to miss.

## Verification

Run by `node scripts/__tests__/test-gate-conformance.js`.

## Do NOT Use When

- Always. This fixture is not a usable skill.
