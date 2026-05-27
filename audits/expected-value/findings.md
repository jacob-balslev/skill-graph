# Expected Value Audit Findings

Run date: 2026-05-27
Mode: CONTENT
Skill: `expected-value`

## Findings

1. `expected-value` was missing from the live nested canonical library at `skills/skills/meta-methods/expected-value/`.
   - Evidence: live tree search found `bayesian-reasoning`, `playing-to-win`, `porters-five-forces`, and `seven-powers`, but no `expected-value` directory.
   - Action: authored the nested v8 skill, evals, and references.
   - Status: resolved.

2. The old root commit and audit artifacts claimed `expected-value` was authored in the flat path `skills/expected-value/`, but that file is not present in the current live canonical tree.
   - Evidence: `git show 9eea04ab` contains the old flat skill; `find /Users/jacobbalslev/Development -path '*expected-value*'` found only cache/audit artifacts before this run.
   - Action: recovered and adapted the prior domain content into the current nested library shape.
   - Status: resolved for the current live tree.

3. The canonical `skill-graph audit expected-value --dry-run` CLI is blocked by a missing module.
   - Evidence: Node throws `Cannot find module './audit-prompt-builder'` from `skill-graph/lib/audit/skill-audit.js`.
   - Action: did not patch system infrastructure in CONTENT mode; used deterministic internal gates directly.
   - Status: unresolved SYSTEM follow-up.

4. Manifest generation includes `expected-value`, but manifest validation still fails.
   - Evidence: generated manifest contains `expected-value` at `skills/skills/meta-methods/expected-value/SKILL.md`; validation fails because `manifest.schema.json` still requires v7 `type` and `category`, while the normative protocol says new skills must not author those deprecated fields. Existing root scaffold/workspace-project schema failures also remain.
   - Action: kept the new skill v8-only per `SKILL_METADATA_PROTOCOL.md`; did not patch manifest schema in CONTENT mode.
   - Status: unresolved SYSTEM follow-up.

5. The comprehension evaluator cannot complete in this environment because the configured grader model is inaccessible.
   - Evidence: `skill-graph evaluate --mode comprehension ... --dry-run` invokes Claude with `haiku-4-5` and returns: "It may not exist or you may not have access to it."
   - Action: left `comprehension_verdict` and `application_verdict` as `UNVERIFIED`.
   - Status: blocked by grader model access/configuration.

6. Routing examples initially failed for weak positive and noisy negative prompts.
   - Evidence: first routing eval returned 4/8 passing; the final focused routing eval returned 7/7 passing.
   - Action: tightened examples, anti-examples, keywords, and boundaries; set `routing_eval: present` after the passing run.
   - Status: resolved.

7. The generated manifest projection does not expose nested eval-health fields for `expected-value`.
   - Evidence: `SKILL.md` has `metadata.routing_eval: present`, `metadata.eval_artifacts: present`, `metadata.eval_state: unverified`, and `metadata.comprehension_state: present`, while a direct `jq` projection of those fields from `/tmp/expected-value-manifest.json` reports them as `null`; the routing-eval command still reports `routing_eval_declared: present` and passes 7/7 cases.
   - Action: did not patch manifest generation in CONTENT mode.
   - Status: unresolved SYSTEM follow-up.

## Privacy Review

The skill and evals use synthetic examples only. No personal data, customer data, payment details, secrets, private file paths, internal database names, or private project data were added.
