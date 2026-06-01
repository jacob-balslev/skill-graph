# Scorecard

## Skill

`evaluation`

## Audit Date

2026-06-01

| Dimension | Score | Note |
|---|---:|---|
| Metadata validity | 5 | Lint passes clean after moving sidecar-owned fields out of `SKILL.md`, adding required `scope`, removing legacy `concept`, and updating the protocol label to v8. |
| Activation quality | 4 | Description, keywords, examples, and anti-examples strongly target completion scoring and distinguish adjacent tasks; routing eval remains absent. |
| Relation quality | 4 | Boundary ownership is now crisp across eval-suite design, code review, testing strategy, methodology, debugging, and eval-driven development; graph routing still lacks a dedicated routing harness receipt. |
| Grounding fidelity | 4 | External sources are appropriate and the stale Anthropic docs URL was updated; drift is `EXTERNAL_UNHASHED` because the sentinel does not hash external URLs. |
| Content quality | 5 | The skill has clear Coverage, Philosophy, input table, rubric, score ceilings, revision loop, finding format, dimension checklist, boundary table, source notes, verification checklist, and negative bounds. |
| Eval quality | 3 | A realistic comprehension fixture now exists, but no graded run has certified comprehension or application behavior. |
| Portability quality | 4 | The skill is portable across agent, documentation, and software deliverables; it depends only on inspecting request, artifact, and verification evidence. |

## Overall

Integrity Gate: PASS.

Behavior Gate: UNVERIFIED.

The skill is structurally usable after repair, with the remaining limitation isolated to graded behavior evidence.
