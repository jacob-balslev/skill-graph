# Scorecard

## Skill

`prompt-injection-defense`

## Dimensions

| Dimension | Score | Note |
|---|---:|---|
| Metadata validity | 5 | Focused lint passes with 0 errors and 0 warnings after sidecar migration and required `scope` addition. |
| Activation quality | 5 | Description, keywords, triggers, examples, and anti-examples target prompt injection specifically and avoid generic security-routing noise. |
| Relation quality | 4 | Boundary and verify-with edges point to semantically correct neighboring skills; no broader/narrower/disjoint edge is required for this skill. |
| Grounding fidelity | 4 | Public truth sources are declared and current by manual web/source check; score is capped below 5 because the zero-dependency drift sentinel reports external URLs as `EXTERNAL_UNHASHED`. |
| Content quality | 5 | Body includes coverage, philosophy, threat matrix, defense stack, injection-surface matrix, exfiltration pattern, dual-LLM pattern, checklist, and negative-boundary table. |
| Eval quality | 4 | Added eight dimension-tagged comprehension cases with realistic security prompts; score is capped below 5 because no independent grader or application eval was run. |
| Portability quality | 5 | Scope and examples are provider/product agnostic and contain no private data or repo-specific assumptions. |
| Audit report completion | 4 | Integrity evidence is complete and fixes are committed; Behavior Gate remains ungraded/unverified pending an independent grader or application eval receipt. |

## Score Ceilings

- Grounding fidelity cannot exceed 4 while truth sources are external and unhashable by the local drift sentinel.
- Eval quality and audit report completion cannot exceed 4 without a grader/application-eval receipt.

## Completion Method

Quality principle: intent fidelity plus teaching efficacy, with lint treated as a floor rather than the target.

Method used: Skill Audit Loop CONTENT audit: inspect current skill, run deterministic checks, verify external truth sources, fix low-risk structural/eval drift, rerun focused gates, and record all findings.

Ordered process executed: read skill and file inventory; ran focused lint, normalization, drift, version-earned, markdown-link, JSON, catalog, test-runner, and claim-extractor checks; browsed primary external sources; patched only the owned skill/eval/sidecar files; committed the skills repo repair in `b400e35`; replaced generated seed audit artifacts with completed evidence.

Hard-gate evidence: focused lint PASS, normalization 0 work, version-earned PASS, JSON parse OK, markdown links OK, drift `EXTERNAL_UNHASHED`, and exact-path diff check OK.
