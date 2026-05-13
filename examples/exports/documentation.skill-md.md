---
name: documentation
description: "Use when writing reference docs, guides, tutorials, specs, architecture notes, or any durable technical prose that a future reader has to trust. Covers doc-type selection, audience fit, progressive disclosure, docs-as-code workflow, freshness and drift tracking, and source-of-truth discipline. Do NOT use for runtime debugging, UI accessibility behavior, or behavior-preserving code refactor."
license: MIT
compatibility: "Markdown, Git"
allowed-tools: Read Grep
metadata:
  schema_version: "3"
  version: "1.0.0"
  type: capability
  browse_category: knowledge
  scope: portable
  owner: skill-graph-maintainer
  freshness: "2026-04-18"
  drift_check: "{\"last_verified\":\"2026-05-13\",\"truth_source_hashes\":{\"README.md\":\"957c366dbc8f3b1056fb812cc4440e56a9cb329ddb4c9ac4e0ea7294383ba013\",\"docs/PRIMER.md\":\"e6bd99468c224fe4c9606e147c5db94dff889feeb9ca5d80084480039c7e9296\",\"docs/manifest-field-mapping.md\":\"aca0b7f2d4631be24a3e7daed1a1d207b488f253164a7d514b9db7af21c6177f\",\"docs/field-reference.md\":\"2e5afcc5b623f0a7e1471485f627c24a91900e1d4c43168aa866314454ea46fa\",\"examples/evals/comprehension.json\":\"539f8d9aaf75f2eb2edd20ba6fb44be1b5fdccdd80440d0fb0217c781a08e1be\"}}"
  eval_artifacts: present
  eval_state: passing
  routing_eval: present
  stability: experimental
  keywords: "[\"documentation\",\"reference doc\",\"guide\",\"tutorial\",\"how-to\",\"architecture note\",\"explain to reader\",\"doc type\",\"stale docs\",\"doc drift\",\"spec\",\"update the readme\",\"readme drifted from code\",\"docs drifted from cli\",\"document this function\",\"write api docs\",\"doc this\",\"add a comment block\",\"progressive disclosure\",\"expand tutorial\",\"reading level\",\"plain language\",\"beginner friendly\",\"terse prose\",\"terse tutorial\",\"audience fit\",\"reader mental model\",\"explain the pattern\",\"write comments\",\"newcomer guide\"]"
  triggers: "[\"documentation-skill\"]"
  examples: "[\"write an API reference for this new route handler\",\"the README has drifted from the actual CLI flags — which wins?\",\"draft an architecture note explaining why we chose Postgres over DynamoDB\",\"this tutorial is too terse for a beginner — expand it with progressive disclosure\"]"
  anti_examples: "[\"the test suite is failing after my change — find the cause\",\"add an aria-label to this icon button\",\"extract this repeated string-concat into a helper function\"]"
  relations: "{\"boundary\":[{\"skill\":\"debugging\",\"reason\":\"debugging chases a specific failure; documentation builds durable reference prose\"},{\"skill\":\"a11y\",\"reason\":\"a11y covers assistive-tech behavior; documentation covers prose reading-level and audience fit\"},{\"skill\":\"refactor\",\"reason\":\"refactor owns behavior-preserving code changes; documentation owns the prose that describes them\"},{\"skill\":\"context-window\",\"reason\":\"context-window owns runtime context-budget management for an agent session; documentation owns durable reference prose. The phrase 'README has drifted from the actual CLI flags' is a documentation-drift question, not a context-budget question — context-window is named here so the router excludes it from documentation's positive scope.\"}]}"
  grounding: "{\"domain_object\":\"Documentation discipline in the Skill Graph repository\",\"grounding_mode\":\"hybrid\",\"truth_sources\":[\"README.md\",\"docs/PRIMER.md\",\"docs/manifest-field-mapping.md\",\"docs/field-reference.md\",\"examples/evals/comprehension.json\"],\"failure_modes\":[\"docs_restating_instead_of_citing_truth\",\"readme_cli_examples_drift_from_scripts\",\"durable_prose_confused_with_runtime_debugging\",\"audience_fit_omitted_from_reference_docs\"],\"evidence_priority\":\"repo_code_first\"}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
---
