---
name: refactor
description: "Use when reorganizing existing code without changing external behavior — extracting functions, reducing duplication, renaming for clarity, splitting modules, or tightening structure. Covers behavior preservation, duplication reduction, decomposition, naming improvements, structural reorganization, and before/after verification. Do NOT use for bug investigation, adding new product behavior, or writing documentation (even when the docs describe the refactored code)."
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
  keywords: "[\"refactor\",\"cleanup\",\"simplify\",\"extract function\",\"reduce duplication\",\"clean this up\",\"simplify this\",\"rename this\",\"split this file\",\"too long function\",\"duplicated logic\",\"decompose function\",\"decompose code\",\"decompose long\",\"split by responsibility\",\"behavior preserving\",\"rename module\",\"rename utils\",\"messy code\",\"messy suite\",\"extract helper\",\"extract duplicated\",\"consolidate logic\",\"tighten structure\"]"
  triggers: "[\"refactor-skill\"]"
  examples: "[\"this 600-line function is hard to reason about — decompose it while keeping tests green\",\"extract the duplicated validation logic from these three handlers into a helper\",\"rename this module from `utils` to something that describes what it actually does\",\"split this file by responsibility; no behavior changes, tests must still pass\"]"
  anti_examples: "[\"the test is failing after my edit — what did I break?\",\"write an architecture note explaining this pattern for new team members\",\"reproduce why this function retries three times on transient network errors\"]"
  relations: "{\"boundary\":[{\"skill\":\"documentation\",\"reason\":\"documentation is prose about the code; refactor is behavior-preserving changes to the code itself\"},{\"skill\":\"debugging\",\"reason\":\"debugging chases an observed failure; refactor runs only with a green test suite and preserves behavior\"}],\"verify_with\":[\"testing-strategy\"],\"depends_on\":[{\"skill\":\"testing-strategy\",\"min_version\":\"^1.0.0\"}]}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
---
