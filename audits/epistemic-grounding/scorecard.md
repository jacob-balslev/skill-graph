# Scorecard

## Skill

`epistemic-grounding`

## Audit Date

2026-06-01

## Dimensions

| Dimension | Score | Note |
|---|---:|---|
| Metadata validity | 5 | Lint passes clean after moving audit-owned fields to `audit-state.json`, adding v8 `scope`, removing legacy `concept`, and updating the protocol label. |
| Activation quality | 4 | Description, keywords, triggers, examples, and anti-examples now name claim-grounding scenarios and exclude execution evidence, naming precision, and rubric design. |
| Relation quality | 4 | Relations now include the main adjacent skills and write boundary reasons as ownership statements. |
| Grounding fidelity | 4 | External empirical claims were re-checked and replaced with direct paper/DOI links; hash-based drift still reports `UNGROUNDED` because no local `truth_sources` exist. |
| Content quality | 5 | The body has Coverage, Philosophy, decision tables, failure modes, verification checks, negative bounds, and primary-source grounding for Toulmin/RFC 2119/RFC 8174. |
| Eval quality | 4 | A realistic five-case comprehension eval now exists, but no graded run has stamped comprehension or application verdicts. |
| Portability quality | 5 | The scope is portable, repo-agnostic, and free of private project assumptions. |

## Overall

PASS_WITH_FIXES. The Integrity Gate is repaired for metadata, relations, content grounding, and eval artifact presence. The Behavior Gate remains `UNVERIFIED`.
