# Expected Value Audit Scorecard

Run date: 2026-05-27
Mode: CONTENT
Skill: `expected-value`

| Dimension | Result | Evidence |
|---|---|---|
| Live gap check | PASS | No live nested `expected-value` existed before this run. |
| Skill file authored | PASS | `skills/skills/meta-methods/expected-value/SKILL.md` added. |
| Eval artifacts authored | PASS | `evals/comprehension.json` and `evals/evals.json` added. |
| References authored | PASS | Source and upstream-displacement references added. |
| Field-purpose comments | PASS | Focused lint reports 0 errors and 0 warnings. |
| Schema lint | PASS | `skill-graph lint skills/skills/meta-methods/expected-value/SKILL.md` exits 0. |
| Drift baseline | PASS_WITH_EXTERNALS | Local reference hashes recorded; external URLs report `EXTERNAL_UNHASHED`. |
| Routing eval | PASS | 7/7 examples and anti-examples pass with `expected-value` as owner for positives and boundary owners for negatives; the routing command reports `routing_eval_declared: present`. |
| Manifest inclusion | PASS_WITH_SYSTEM_FAILURE | Generated manifest includes `expected-value`, but manifest validation fails on SYSTEM-level schema drift. |
| Audit CLI | BLOCKED | `skill-graph audit` cannot load `./audit-prompt-builder`. |
| Comprehension evals | BLOCKED | Grader model `haiku-4-5` is inaccessible in this environment. |
| Application evals | UNVERIFIED | No application eval was run. |
| Upstream displacement | PASS | No displacement found in official OpenAI, Anthropic, or OpenCode release notes checked on 2026-05-27. |

## Commands Run

- `node skill-graph/bin/skill-graph.js lint skills/skills/meta-methods/expected-value/SKILL.md`
- `node skill-graph/scripts/skill-graph-drift.js --record --apply skills/skills/meta-methods/expected-value`
- `node skill-graph/bin/skill-graph.js drift skills/skills/meta-methods/expected-value`
- `node skill-graph/bin/skill-graph.js manifest --output /tmp/expected-value-manifest.json`
- `node skill-graph/bin/skill-graph.js routing-eval --manifest /tmp/expected-value-manifest.json --skill expected-value --json`
- `node skill-graph/bin/skill-graph.js route "calculate expected value for three probabilistic options" --manifest /tmp/expected-value-manifest.json --json`
- `node skill-graph/bin/skill-graph.js evaluate --mode comprehension skills/skills/meta-methods/expected-value/evals/comprehension.json --dry-run`
- `jq '.skills[] | select(.name == "expected-value") | {name, path, schema_version, subject, operation, scope, routing_eval, eval_artifacts, eval_state, comprehension_state}' /tmp/expected-value-manifest.json`

## Health Block Decision

- `structural_verdict: PASS` because focused lint and routing eval passed.
- `truth_verdict: PASS` because reviewed sources support the skill and local reference hashes were recorded; external URL hashing remains `EXTERNAL_UNHASHED`.
- `comprehension_verdict: UNVERIFIED` because the grader did not complete.
- `application_verdict: UNVERIFIED` because no application eval ran.
