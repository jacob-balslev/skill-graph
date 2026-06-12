---
name: missing-scope
description: "Negative fixture for the gate-conformance suite: identical to the minimal valid fixture except the required `scope` field is omitted. Activate only inside test-gate-conformance.js to prove the structural lint gate FAILS when a required protocol field is absent. Do NOT use as a production skill."
subject: backend-engineering
public: true
stability: experimental
license: Apache-2.0
---

# Missing Scope (negative fixture)

This fixture is intentionally invalid: it omits the v8-required `scope` field.
The structural lint gate MUST reject it. It is the "Given" of the
`structural-missing-scope` scenario in the gate-conformance spec.

## Concept of the skill

**What it is:** A deliberately broken capability skill used only by the conformance runner.
**Mental model:** Remove exactly one required field so the lint error isolates that one rule.
**Why it exists:** To give the "must FAIL on missing required field" rule a failing example.
**What it is NOT:** It is not a production skill and never routes outside the test runner.
**Adjacent concepts:** the other negative fixtures under this directory.
**One-line analogy:** It is a unit test's fixture, not a real skill.
**Common misconception:** That a negative fixture should also be lint-clean — it must not be.

## Coverage

The required v8 frontmatter minus `scope`. Nothing else.

## Philosophy of the skill

One broken field per fixture keeps the failing assertion unambiguous.

## Verification

Exercised by the gate-conformance runner; expected to fail structural lint with a `scope` error.

## Do NOT Use When

- Always. This is a test fixture, not a usable skill.
