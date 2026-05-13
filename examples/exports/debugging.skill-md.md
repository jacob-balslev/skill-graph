---
name: debugging
description: "Use when behavior is broken, a test is failing, or runtime output contradicts expectations. Covers failure reproduction, scope reduction by bisection, evidence capture at the moment of failure, root-cause isolation (not symptom patching), fix verification against the same evidence path, and regression-test creation. Do NOT use for feature planning, architectural design, or behavior-preserving refactor."
license: MIT
compatibility: "Markdown, Git, any codebase"
allowed-tools: Read Grep Bash
metadata:
  schema_version: "3"
  version: "1.0.0"
  type: workflow
  browse_category: engineering
  scope: portable
  owner: skill-graph-maintainer
  freshness: "2026-04-18"
  drift_check: "{\"last_verified\":\"2026-04-18\"}"
  eval_artifacts: present
  eval_state: passing
  routing_eval: present
  stability: experimental
  keywords: "[\"debugging\",\"reproduce failure\",\"reproduce bug\",\"failing test\",\"root cause\",\"symptom vs cause\",\"minimum reproduction\",\"bisect\",\"what caused it\",\"my tests are failing\",\"why is this broken\",\"it broke in production\",\"cannot reproduce\",\"test passes locally\",\"stack trace\",\"used to work\",\"worked yesterday\",\"what changed\",\"was working before\",\"agent stuck\",\"stuck in a loop\",\"stuck in loop\",\"blocking my commit\",\"blocking the build\",\"specific error\",\"specific failure\",\"diagnose failure\",\"error blocking\",\"broke the build\",\"broke build\"]"
  triggers: "[\"debugging-skill\"]"
  examples: "[\"my tests pass locally but fail in CI — why?\",\"this function used to work yesterday; what changed?\",\"reproduce this Stripe webhook failure from production logs\",\"I see the symptom but can't find the root cause of this nil panic\"]"
  anti_examples: "[\"plan test coverage for a new feature\",\"document what this function does for future readers\",\"refactor this messy code while the test suite is green\"]"
  relations: "{\"boundary\":[{\"skill\":\"documentation\",\"reason\":\"documentation is durable reference prose; debugging is transient failure-chasing\"},{\"skill\":\"testing-strategy\",\"reason\":\"testing-strategy plans what to test before a failure exists; debugging chases a specific observed failure\"},{\"skill\":\"refactor\",\"reason\":\"refactor is behavior-preserving code change with green tests; debugging is invoked because tests or behavior are NOT green\"}],\"verify_with\":[\"testing-strategy\"]}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
---
