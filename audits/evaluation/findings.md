# Findings

## Skill

`evaluation`

## Audit Date

2026-06-01

## Verdict Summary

PASS for Integrity Gate; Behavior Gate remains UNVERIFIED because no graded application eval was run.

## Findings

ID: F1
Severity: HIGH
Surface: `/Users/jacobbalslev/Development/skills/skills/code-engineering/evaluation/SKILL.md`
Category: Metadata validity
Problem: The skill carried sidecar-owned audit fields in `SKILL.md`, missed required v8 `scope`, kept `skill_graph_protocol: Skill Metadata Protocol v6`, and retained a legacy `concept` block alongside the flat understanding fields.
Evidence: Before repair, `node scripts/normalize-skill-field-shape.js --report --skill evaluation` reported 17 fields to relocate plus semantic debt for `scope` and schema-unknown `concept`; `node bin/skill-graph.js lint evaluation` reported 19 errors.
Required action: Relocate audit status to `audit-state.json`, author `scope`, remove `concept`, update protocol label only after the schema contract is actually satisfied, and re-run lint.
Status: remediated — `node bin/skill-graph.js lint evaluation` now reports `0 error(s), 0 warning(s)`, and `node scripts/normalize-skill-field-shape.js --report --skill evaluation` reports `0 field(s) to relocate`.

ID: F2
Severity: MEDIUM
Surface: `/Users/jacobbalslev/Development/skills/skills/code-engineering/evaluation/SKILL.md` relations metadata
Category: Relation quality
Problem: The relation comment still described the older six-edge wording and a pending `boundary` rename, and the relation set omitted important current neighbors for evidence discipline and LLM eval iteration.
Evidence: Pre-repair metadata described `relations` as "Six edge types" and "rename to `suppresses` pending ADR-0018"; relation neighbors did not include `epistemic-grounding`, `eval-driven-development`, or `debugging`.
Required action: Refresh the relation comment to the current field set, keep `boundary` reason text in ownership form, and add the missing adjacent boundaries/verification links.
Status: remediated — relations now include ownership boundaries for `agent-eval-design`, `code-review`, `testing-strategy`, `methodology`, `debugging`, and `eval-driven-development`, and verify with `epistemic-grounding`.

ID: F3
Severity: MEDIUM
Surface: `/Users/jacobbalslev/Development/skills/skills/code-engineering/evaluation/SKILL.md` grounding metadata
Category: Source freshness
Problem: The Anthropic documentation URL used the old `platform.claude.com/docs` location rather than the current docs URL.
Evidence: Pre-repair `grounding.truth_sources` contained `https://platform.claude.com/docs/en/test-and-evaluate/develop-tests`; link verification after repair passes with `node scripts/check-markdown-links.js ../skills/skills/code-engineering/evaluation/SKILL.md`.
Required action: Update the truth source to `https://docs.anthropic.com/en/docs/test-and-evaluate/develop-tests` and keep the claim phrasing aligned to current eval guidance.
Status: remediated.

ID: F4
Severity: MEDIUM
Surface: `/Users/jacobbalslev/Development/skills/skills/code-engineering/evaluation/evals/comprehension.json`
Category: Eval artifact coverage
Problem: The skill declared eval intent but had no comprehension fixture, leaving the Behavior Gate with no local artifact to exercise definition, boundary, misconception, or application understanding.
Evidence: Pre-repair sidecar had `"eval_artifacts": "planned"` and no `evals/` directory under the `evaluation` skill.
Required action: Add a comprehension eval with realistic cases for completion scoring, evidence sufficiency, boundaries, score ceilings, and required-revision behavior.
Status: remediated — `evals/comprehension.json` exists, parses as JSON, and the sidecar now records `"eval_artifacts": "present"`.

ID: F5
Severity: LOW
Surface: `node scripts/skill-graph-drift.js --json ../skills/skills/code-engineering/evaluation`
Category: Drift sentinel limitation
Problem: Drift verification cannot hash the external URL truth sources, so truth freshness is documented but not cryptographically checked by the zero-dependency drift sentinel.
Evidence: Drift output reports `status: "EXTERNAL_UNHASHED"` for OpenAI Evals, Anthropic's eval article, Anthropic docs, Google ADK eval docs, and NIST AIRC.
Required action: Keep `truth_verdict` honest and do not promote external-source drift to a stronger claim until a source-hash or citation snapshot workflow exists.
Status: accepted — this is a current tooling limitation, not a skill-content blocker.

ID: F6
Severity: INFO
Surface: `/Users/jacobbalslev/Development/skills/skills/code-engineering/evaluation/audit-state.json`
Category: Behavior Gate
Problem: No graded application evaluation was run, so the skill cannot claim behavior certification.
Evidence: `node bin/skill-graph.js audit evaluation --force` prints "INTEGRITY-only audit" and says to re-run with `--graded` for comprehension/application verdicts.
Required action: Leave `comprehension_verdict` and `application_verdict` as `UNVERIFIED` until a graded run produces receipts.
Status: accepted.

## Verification Evidence

- `node bin/skill-graph.js lint evaluation` — PASS, 0 errors, 0 warnings.
- `node scripts/normalize-skill-field-shape.js --report --skill evaluation` — 0 relocation fields, 0 semantic debt fields.
- `node scripts/check-markdown-links.js ../skills/skills/code-engineering/evaluation/SKILL.md` — OK.
- `node scripts/skill-graph-drift.js --json ../skills/skills/code-engineering/evaluation` — `EXTERNAL_UNHASHED` for external URL sources.
- `node -e "JSON.parse(...audit-state.json); JSON.parse(...evals/comprehension.json)"` — JSON OK.
- `node bin/skill-graph.js audit evaluation --force` — Integrity-only audit wrote audit artifacts and left Behavior Gate unverified.
