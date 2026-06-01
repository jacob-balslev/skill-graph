# Findings

## Skill

`prompt-craft`

## Audit Date

2026-06-01

## Verdict Summary

PASS for structural Integrity Gate; truth and Behavior Gate remain UNVERIFIED because public provider/security sources are external URLs the zero-dependency drift sentinel does not hash, and no graded application eval was run.

## Findings

ID: F1
Severity: HIGH
Surface: `/Users/jacobbalslev/Development/skills/skills/agent-ops/prompt-craft/SKILL.md`
Category: Metadata validity
Problem: The skill carried sidecar-owned fields in `SKILL.md`, retained a deprecated `concept` block despite having flat Understanding fields, used `skill_graph_protocol: Skill Metadata Protocol v6`, and described audit state as a Health Block.
Evidence: Before repair, `node scripts/normalize-skill-field-shape.js --report --skill prompt-craft` reported 17 fields to relocate and schema-unknown `concept`; `node bin/skill-graph.js lint prompt-craft` reported 18 errors and 1 warning.
Required action: Move loop-owned fields to `audit-state.json`, remove the legacy `concept` block, update protocol/provenance comments after conformance is earned, and re-run lint.
Status: remediated - lint now passes with 0 errors and 0 warnings, and normalization reports 0 remaining work.

ID: F2
Severity: MEDIUM
Surface: `/Users/jacobbalslev/Development/skills/skills/agent-ops/prompt-craft/SKILL.md` activation metadata
Category: Activation quality
Problem: The `keywords` list exceeded the v8 cap of 10, increasing activation noise and making the fuzzy routing surface less disciplined.
Evidence: Pre-repair `keywords` contained broad overlapping terms such as `prompt`, `prompt craft`, `write a prompt`, `improve this prompt`, `iterate on prompt`, `llm prompt`, and `agent prompt`, plus more than 10 total entries.
Required action: Reduce keywords to 10 user-plausible semantic phrases that preserve the main activation surface.
Status: remediated.

ID: F3
Severity: MEDIUM
Surface: `/Users/jacobbalslev/Development/skills/skills/agent-ops/prompt-craft/SKILL.md` relation metadata
Category: Relation quality
Problem: Relation comments still described the older edge vocabulary and pending `boundary` rename instead of the current relation field set.
Evidence: Pre-repair metadata said "Six edge types" and "rename to `suppresses` pending ADR-0018".
Required action: Refresh relation comments to the current relation field set, including `disjoint_with`, and keep boundary reason text in ownership/exclusion form.
Status: remediated.

ID: F4
Severity: MEDIUM
Surface: `/Users/jacobbalslev/Development/skills/skills/agent-ops/prompt-craft/SKILL.md` truth sources
Category: Grounding fidelity
Problem: The skill has public OpenAI, Anthropic, Gemini, and OWASP truth sources, but they are external URLs without recorded hashes, so the local drift sentinel cannot certify source freshness.
Evidence: `node scripts/skill-graph-drift.js --json ../skills/skills/agent-ops/prompt-craft` reports `status: "EXTERNAL_UNHASHED"` for all five truth sources.
Required action: Keep `truth_verdict: UNVERIFIED` until a hashable source-review receipt or graded source review exists.
Status: accepted - the audit state uses `truth_verdict: UNVERIFIED`.

ID: F5
Severity: MEDIUM
Surface: `/Users/jacobbalslev/Development/skills/skills/agent-ops/prompt-craft/evals/comprehension.json`
Category: Eval artifact coverage
Problem: The skill declared eval intent but had no local comprehension eval artifact under its skill directory.
Evidence: Pre-repair sidecar state was `eval_artifacts: planned`; the skill directory contained only `SKILL.md`.
Required action: Add a local comprehension eval covering definition, mental model, boundaries, misconception, and application.
Status: remediated - local eval exists and parses as JSON.

ID: F6
Severity: INFO
Surface: `/Users/jacobbalslev/Development/skills/skills/agent-ops/prompt-craft/audit-state.json`
Category: Behavior Gate
Problem: No graded comprehension or application run was executed, so behavior certification cannot be claimed.
Evidence: `node bin/skill-graph.js audit prompt-craft --force` ran in Integrity-only mode and said to re-run with `--graded` to populate behavior verdicts.
Required action: Leave `comprehension_verdict` and `application_verdict` as `UNVERIFIED` until a graded run produces receipts.
Status: accepted.

## Verification Evidence

- `node bin/skill-graph.js lint prompt-craft` - PASS, 0 errors, 0 warnings.
- `node scripts/normalize-skill-field-shape.js --report --skill prompt-craft` - 0 fields to relocate, 0 semantic debt fields.
- `node scripts/check-markdown-links.js ../skills/skills/agent-ops/prompt-craft/SKILL.md` - OK.
- `node -e "JSON.parse(...audit-state.json); JSON.parse(...evals/comprehension.json)"` - JSON OK.
- `node scripts/skill-graph-drift.js --json ../skills/skills/agent-ops/prompt-craft` - `EXTERNAL_UNHASHED` for public external truth sources.
- `node bin/skill-graph.js audit prompt-craft --force` - Integrity-only audit ran lint PASS and drift EXTERNAL_UNHASHED; audit runner kept Audit Status sidecar current.
