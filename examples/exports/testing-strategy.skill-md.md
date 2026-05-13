---
name: testing-strategy
description: "Use when planning tests for a bug fix, feature, or refactor — deciding what deserves a test, at which level, with what evidence. Covers test-scope decisions, test-level selection (unit / integration / contract / e2e), effort-to-risk matching, regression targeting, evidence quality, and failure-case coverage. Do NOT use for chasing a known failure (that is `debugging`), for pure doc writing (that is `documentation`), or for conceptual architecture discussion with no verification target (no dedicated skill — treat as strategy, not testing)."
license: MIT
compatibility: "Markdown, Git, any codebase"
allowed-tools: Read Grep Bash
metadata:
  schema_version: "3"
  version: "1.0.0"
  type: capability
  browse_category: quality
  scope: portable
  owner: skill-graph-maintainer
  freshness: "2026-04-18"
  drift_check: "{\"last_verified\":\"2026-04-18\"}"
  eval_artifacts: present
  eval_state: passing
  routing_eval: present
  stability: experimental
  keywords: "[\"testing strategy\",\"what to test\",\"what not to test\",\"which test level\",\"test scope\",\"effort vs risk\",\"regression target\",\"failure case coverage\",\"test plan\",\"do I need a test\",\"should I test this\",\"unit or integration\",\"test coverage\",\"pin this behavior\",\"plan test coverage\",\"plan coverage\",\"needs an automated test\",\"automated test\",\"manual QA coverage\",\"passes manual QA\",\"test level decision\"]"
  triggers: "[\"testing-skill\"]"
  routing_groups: "[\"quality\"]"
  examples: "[\"do I need a unit test for this pure formatter or is integration enough?\",\"what's the right test level for a webhook handler that talks to Stripe?\",\"the feature passes manual QA — does it need an automated test?\",\"pin this regression so the same bug can't slip through again\"]"
  anti_examples: "[\"my existing test is failing — why?\",\"write a testing-patterns guide for the contributor docs\",\"clean up this duplicated test setup across three files\"]"
  relations: "{\"boundary\":[{\"skill\":\"documentation\",\"reason\":\"documentation is durable prose; testing-strategy is active verification planning\"},{\"skill\":\"debugging\",\"reason\":\"debugging chases a specific observed failure; testing-strategy decides what to test BEFORE a failure exists\"},{\"skill\":\"refactor\",\"reason\":\"refactor reshapes code (including test setup) while preserving behavior; testing-strategy decides what coverage to author in the first place\"}],\"verify_with\":[\"debugging\"]}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
---
