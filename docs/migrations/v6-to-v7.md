# v6 to v7 Migration

Schema v7 replaces the single v6 `audit_verdict` aggregate with four independent Health Block verdicts. The goal is to stop compressing form, truth, comprehension, and behavioral usefulness into one PASS/FAIL-style value.

## Field Changes

Remove:

```yaml
audit_verdict: PASS
```

Add the four v7 verdict fields:

```yaml
structural_verdict: UNVERIFIED
truth_verdict: UNVERIFIED
comprehension_verdict: UNVERIFIED
application_verdict: UNVERIFIED
```

Use `UNVERIFIED` during migration unless the corresponding audit gate has actually run and produced evidence.

## Verdict Meaning

`structural_verdict` covers schema lint, manifest census, and concept-card shape.

`truth_verdict` covers truth-source cataloging, drift checks, tests, and claim verification.

`comprehension_verdict` covers the comprehension grader. In v7 this is a smoke-test layer, not the final quality signal.

`application_verdict` covers whether the skill changes agent behavior on realistic tasks. This is the primary v7 usefulness signal.

## Required Verification

After migrating a skill, run:

```bash
node scripts/skill-lint.js <skill>
node scripts/check-protocol-consistency.js
```

For library-level changes, also run:

```bash
node scripts/skill-graph-routing-eval.js --only-asserted
node bin/skill-graph.js doctor
```
