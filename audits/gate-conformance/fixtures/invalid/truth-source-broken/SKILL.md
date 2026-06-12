---
name: truth-source-broken
description: "Negative fixture for the gate-conformance suite: valid v8 frontmatter with a complete grounding block, except one declared truth source path points at a file that does not exist. Activate only inside test-gate-conformance.js to prove the truth/drift gate reports BROKEN. Do NOT use as a production skill."
subject: knowledge-organization
public: false
scope: "Negative fixture validating that the drift sentinel reports BROKEN when a declared truth source file is missing. Out: production grounding guidance."
project:
  - handle: skill-graph
    role: source-of-truth
grounding:
  subject_matter: "drift sentinel BROKEN state"
  grounding_mode: repo_specific
  truth_sources:
    - path: "audits/gate-conformance/fixtures/invalid/truth-source-broken/MISSING-TRUTH-SOURCE.md"
      note: "Intentionally missing — the drift gate must classify this skill BROKEN because the declared local truth source does not exist on disk."
  failure_modes:
    - "If the drift sentinel stops treating a missing local truth source as BROKEN, this fixture stops failing and the truth gate has regressed."
  evidence_priority: repo_code_first
stability: experimental
license: Apache-2.0
---

# Truth Source Broken (negative fixture)

This fixture is intentionally broken at the TRUTH layer (not the structural layer):
its `grounding` block is complete and valid, but one declared truth source path does
not exist on disk. The drift sentinel MUST classify it BROKEN (exit non-zero).

## Concept of the skill

**What it is:** A deliberately broken capability skill used only by the conformance runner.
**Mental model:** Keep the frontmatter structurally valid but declare a truth source that is missing on disk.
**Why it exists:** To give the truth/drift gate's BROKEN state a failing example — the drift gate had no unit coverage before this suite.
**What it is NOT:** It is not a production skill and never routes outside the test runner.
**Adjacent concepts:** the structural negative fixtures under this directory; drift detection; truth-source hashing.
**One-line analogy:** It is a citation pointing at a page that was torn out.
**Common misconception:** That a missing truth source is a structural (lint) failure — it is a TRUTH (drift) failure; the drift sentinel owns it.

## Coverage

Valid grounding except a missing declared truth source path → drift BROKEN.

## Philosophy of the skill

One broken layer per fixture keeps the failing assertion unambiguous.

## Verification

Exercised by the gate-conformance runner via the drift gate; expected to report BROKEN and exit non-zero.

## Do NOT Use When

- Always. This is a test fixture, not a usable skill.
