---
schema_version: 8
name: minimal-capability
description: "Use as the smallest v8-compat capability fixture for skill-graph package tests. Activate this skill when verifying that lint, manifest generation, and routing accept the bare-minimum required frontmatter. Do NOT use as a production skill (use a real capability skill from the canonical library)."
version: 1.0.0
subject: code-engineering
deployment_target: portable
scope: "Minimal v8 schema fixture for validating lint, manifest generation, routing, and standalone audit smoke tests. Out: production skill guidance."
owner: skill-graph-fixture-suite
freshness: "2026-05-19"
drift_check:
  last_verified: "2026-05-19"
eval_artifacts: none
eval_state: unverified
routing_eval: absent
stability: experimental
license: Apache-2.0
---

# Minimal Capability Fixture

This fixture exercises the bare-minimum required v8-compatible frontmatter. It contains
only the required fields, the recommended stability + license fields, and the
four capability-archetype body sections.

## Coverage

The required v8 frontmatter fields, plus `stability` and `license`. No
optional relations, no grounding, no Understanding fields, no
Audit Status.

## Philosophy

The simplest possible v8-compatible skill should still pass lint. If this fixture ever
starts failing lint without a deliberate schema change, the lint check has
regressed or grown a new required field that this fixture should adopt
together with the canonical library.

## Verification

```bash
node scripts/skill-lint.js --path examples/fixture-skills/minimal-capability
# expected: 0 errors
```

## Do NOT Use When

- You need to exercise codebase grounding — see the `with-grounding` planned fixture in [`../README.md`](../README.md).
- You need to exercise typed relations — see the `with-relations` planned fixture in [`../README.md`](../README.md).
- You need to exercise flat Understanding fields or the Audit Status — see the `comprehension-full` planned fixture in [`../README.md`](../README.md).
- You need a real production-grade authoring example — use a canonical skill from `skills/`.
