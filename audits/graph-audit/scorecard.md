# Scorecard

## Skill

`graph-audit`

## Audit Date

2026-06-01

| Dimension | Score | Note |
|---|---:|---|
| Metadata validity | 5 | Lint passes clean after sidecar migration, required `scope`, current protocol label, and field-purpose comments. |
| Activation quality | 4 | Description, keywords, examples, paths, and anti-examples target skill metadata/sidecar/manifest audits; routing eval is present but was not re-run in this pass. |
| Relation quality | 4 | Relations now distinguish graph-audit from health-tool implementation, skill routing, refactoring, debugging, and eval-driven development. |
| Grounding fidelity | 5 | Truth sources now point at current schemas, protocol doc, audit-manifest verifier, lint, consistency, manifest, and eval fixture; drift hashes are recorded and report OK. |
| Content quality | 4 | Coverage, key files, evals, verification, and negative bounds now reflect the v8 two-file contract; the body is concise and procedural. |
| Eval quality | 3 | Local comprehension and repo-grounded eval fixtures exist and parse, but no graded behavior run was executed. |
| Portability quality | 3 | The skill is intentionally project-targeted to Skill Graph; portability is limited by design and documented through grounding. |
| Audit report completion score | 4 | All findings have evidence and status, checks are listed, and Behavior Gate is explicitly UNVERIFIED. No score ceiling below 4 applies because the report is complete and remaining behavior certification is disclosed. |

## Overall

Integrity Gate: PASS.

Behavior Gate: UNVERIFIED.

The skill is structurally repaired and truth-grounded. The remaining work is graded behavior evidence.
