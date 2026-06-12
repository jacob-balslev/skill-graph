---
name: dangling-verify-with
description: "Negative fixture for the gate-conformance suite: valid v8 frontmatter except `relations.verify_with` points at a skill that does not exist. Activate only inside test-gate-conformance.js to prove the structural lint gate FAILS on a dangling relation target. Do NOT use as a production skill."
subject: backend-engineering
public: true
scope: "Negative fixture validating that lint rejects a relations.verify_with edge whose target skill does not exist. Out: production skill guidance."
stability: experimental
license: Apache-2.0
relations:
  verify_with:
    - this-skill-target-does-not-exist
---

# Dangling verify_with (negative fixture)

This fixture is intentionally invalid: its `relations.verify_with` edge points at a
non-existent sibling skill. The structural lint gate MUST reject the dangling pointer.

## Concept of the skill

**What it is:** A deliberately broken capability skill used only by the conformance runner.
**Mental model:** Point one relation edge at a missing target so the lint error isolates that rule.
**Why it exists:** To give the "every relations.* target must resolve" rule a failing example.
**What it is NOT:** It is not a production skill and never routes outside the test runner.
**Adjacent concepts:** the other negative fixtures under this directory.
**One-line analogy:** It is a unit test's fixture, not a real skill.
**Common misconception:** That a negative fixture should also be lint-clean — it must not be.

## Coverage

Valid v8 frontmatter except a dangling `relations.verify_with` target.

## Philosophy of the skill

One broken field per fixture keeps the failing assertion unambiguous.

## Verification

Exercised by the gate-conformance runner; expected to fail structural lint with a dangling-relation error.

## Do NOT Use When

- Always. This is a test fixture, not a usable skill.
