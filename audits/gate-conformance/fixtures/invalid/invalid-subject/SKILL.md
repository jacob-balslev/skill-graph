---
name: invalid-subject
description: "Negative fixture for the gate-conformance suite: valid v8 frontmatter except `subject` is set to a value outside the closed twelve-shelf enum. Activate only inside test-gate-conformance.js to prove the structural lint gate FAILS on an out-of-enum subject. Do NOT use as a production skill."
subject: not-a-real-subject
public: true
scope: "Negative fixture validating that lint rejects a subject outside the closed twelve-value enum. Out: production skill guidance."
stability: experimental
license: Apache-2.0
---

# Invalid Subject (negative fixture)

This fixture is intentionally invalid: `subject` is not one of the twelve closed
competency shelves. The structural lint gate MUST reject it.

## Concept of the skill

**What it is:** A deliberately broken capability skill used only by the conformance runner.
**Mental model:** Break exactly one rule so the lint error isolates that one rule.
**Why it exists:** To give the "subject must be in the closed enum" rule a failing example.
**What it is NOT:** It is not a production skill and never routes outside the test runner.
**Adjacent concepts:** the other negative fixtures under this directory.
**One-line analogy:** It is a unit test's fixture, not a real skill.
**Common misconception:** That a negative fixture should also be lint-clean — it must not be.

## Coverage

Valid v8 frontmatter except an out-of-enum `subject`.

## Philosophy of the skill

One broken field per fixture keeps the failing assertion unambiguous.

## Verification

Exercised by the gate-conformance runner; expected to fail structural lint with a `subject` error.

## Do NOT Use When

- Always. This is a test fixture, not a usable skill.
