# Verdict

## Skill

`semiotics`

## Audit Date

2026-06-01

## Integrity Gate

PASS

## Behavior Gate

UNVERIFIED

## Audit Status

| Field | Verdict | Evidence |
|---|---|---|
| structural_verdict | PASS | Focused lint now reports 0 errors and 0 warnings. |
| truth_verdict | UNVERIFIED | External truth sources are declared and manually checked, but local drift evidence is `EXTERNAL_UNHASHED`; no hash/graded receipt certifies truth. |
| comprehension_verdict | UNVERIFIED | `evals/comprehension.json` now exists with eight dimension-tagged cases, but no independent grader run was executed. |
| application_verdict | UNVERIFIED | The skill has not yet been independently applied and graded on a real artifact by the Behavior Gate. |

## Rationale

The audit repaired the skill's current v8 structural contract: loop-owned fields moved to `audit-state.json`, the deprecated nested `concept` field was removed, top-level field-purpose comments were added, truth-source verification dates were refreshed in the sidecar, and a gradeable comprehension eval was added.

The skill teaches the intended behavior: it treats interfaces as multi-channel sign systems, separates signifier from signified, distinguishes denotation from connotation, applies icon/index/symbol and signifier/affordance reasoning to UI and code-facing surfaces, and keeps clear boundaries from microcopy, visual craft, accessibility compliance, semantics, semantic-relations, linguistics, and ontology modeling.

Truth remains deliberately `UNVERIFIED`: Peirce, Saussure, Barthes, Norman, NN/g, and W3C sources checked on 2026-06-01 support the skill's core claims, but the local drift sentinel cannot hash external URLs and no independent grader receipt was produced.

## Follow-Up State

Fixes applied. No remaining in-scope CONTENT defects were found. Future improvement is to add an application eval fixture that grades whether an agent applies semiotic analysis to a real interface/sign-system audit rather than stopping at terminology.
