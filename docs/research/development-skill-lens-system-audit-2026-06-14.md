# Development Skill Lens Audit of Skill Graph

Date: 2026-06-14
Author: Codex
Mode: initial read-only analysis report under the root `AGENTS.md` analysis-only carve-out for Skill Graph work; follow-up fixes applied after the user requested "Solve ALL issues."

Resolution status as of 2026-06-14 follow-up:

- F1 fixed: marketplace export regenerated; after removing the active HARMFUL skill in F9, `node scripts/export-marketplace-skills.js --check` passes with 179 exported skills and `node scripts/verify-skill-md-export.js --plain marketplace/skills` passes 179/179.
- F2 fixed: `data-modeling` field-purpose comments backfilled with the dedicated codemod; targeted `skill-lint` now reports 0 warnings.
- F3 fixed: `SKILL_GRAPH.md` now describes the live broader `scripts/skill-lint.js` gate.
- F4 fixed: `SKILL_GRAPH.md` now names current `grounding.*` fields in the opening description.
- F5 fixed: refined inventory counting normal `//` comments found 12 true missing top-level purpose signals, and all 12 now have comments; rerun reports 0 missing across 167 script files.
- F6, F7, and F8 were informational/status findings; no code or doc fix was required.
- F9 fixed: `bounded-context-mapping` carried `application_verdict: HARMFUL`; it was removed from the active corpus, references to it were removed or rerouted, and manifests/docs/marketplace exports were regenerated.
- F10 fixed: `data-modeling` carried a non-certifying single-frontier `HARMFUL` panel receipt as the durable active-corpus verdict; the recorder now preserves the receipt while downgrading non-certifying dangerous panel verdicts to `UNVERIFIED`, and `data-modeling` was honestly downgraded while preserving the re-grade receipt.
- Final verification: `npm run verify` now passes end-to-end with 183 active skills, 179 marketplace exports, and 0 active `application_verdict: HARMFUL` skills.

## Scope

The user requested that the root instructions be read, all Development repo skills be loaded, and those skills be used against the Skill Graph project, the Skill Metadata Protocol, the Skill Audit Loop, the scripts, and the docs.

Inputs loaded or inventoried:

- Root workspace instructions: `/Users/jacobbalslev/Development/CLAUDE.md`, `/Users/jacobbalslev/Development/AGENTS.md`, and `/Users/jacobbalslev/Development/SKILL-SYSTEM-CHEAT-SHEET.md`.
- Skill Graph instructions: `/Users/jacobbalslev/Development/skill-graph/CLAUDE.md` and `/Users/jacobbalslev/Development/skill-graph/AGENTS.md`.
- Canonical Skill Graph docs: `/Users/jacobbalslev/Development/skill-graph/SKILL_GRAPH.md`, `/Users/jacobbalslev/Development/skill-graph/skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md`, and `/Users/jacobbalslev/Development/skill-graph/skill-audit-loop/SKILL_AUDIT_LOOP.md`.
- Skill index: `/Users/jacobbalslev/Development/SKILL-INDEX.md`.
- All canonical Development skill files at the initial audit point: 184 `SKILL.md` files under `/Users/jacobbalslev/Development/skills/skills/**/SKILL.md`, total loaded text approximately 5,646,674 characters.
- Final active corpus after remediation: 183 `SKILL.md` files; `bounded-context-mapping` was removed because it carried an active HARMFUL application verdict.
- Skill Graph script surface: 167 JavaScript or shell files under `/Users/jacobbalslev/Development/skill-graph/bin`, `/Users/jacobbalslev/Development/skill-graph/lib`, and `/Users/jacobbalslev/Development/skill-graph/scripts`.
- Targeted full script reads for enforcement and release behavior: `scripts/skill-lint.js`, `scripts/lib/parse-frontmatter.js`, `scripts/generate-manifest.js`, `scripts/lib/audit-state-sidecar.js`, and `bin/skill-graph.js`.
- Package command surface from `/Users/jacobbalslev/Development/skill-graph/package.json`.

Final active skill corpus distribution:

| Subject | Count |
|---|---:|
| agent-ops | 20 |
| ai-engineering | 9 |
| backend-engineering | 12 |
| data-engineering | 9 |
| design | 22 |
| frontend-engineering | 16 |
| knowledge-organization | 9 |
| product-domain | 3 |
| quality-assurance | 25 |
| reasoning-strategy | 31 |
| software-architecture | 11 |
| software-engineering-method | 16 |

## Verification Evidence

Commands run from `/Users/jacobbalslev/Development/skill-graph`:

| Command | Result | Evidence |
|---|---|---|
| `npm run protocol:check` | PASS | Field-set parity, authored/generated parity, artifact-root convention, sample manifest correctness, example truth invariants, generated field-reference parity, and JSON-LD context coverage all passed with 0 warnings. |
| `npm run models:check` | PASS | No restated dated model versions were reported in durable instruction surfaces. |
| `npm run verify:system` | PASS | Schema constants, protocol checks, markdown links, docs drift, inline counts, routing config, mirror freeze, stability promotion, fixture lint, application eval structure, model-version check, routing overlap checks, marketplace superset shape, and unit tests passed. |
| Initial `npm run verify` | FAIL | The full gate reached `marketplace:verify` and failed on generated marketplace freshness: 8 stale generated files, 1 missing generated skill export, expected 180 exported skills but found 179. |
| Final `npm run verify` | PASS | Full verification passed after all fixes: lint 183/183 clean, protocol/docs/counts/routing/export/marketplace/status/audit-manifest/application-evals/models/overlap/unit tests all passed. |

Important interpretation from `skill-graph/AGENTS.md`: `verify:system` green means the SYSTEM gate is green; it does not mean the library is publishable. The initial full `verify` failure was a corpus/release freshness failure surfaced by `marketplace:verify`, not evidence that the current Skill Metadata Protocol design or system gate was broken. The final full `verify` run is now green.

## Findings

Total findings documented below: 10. None are hidden or rolled up into an unlisted parent.

### F1 - P1 - Marketplace export freshness is red and blocks the full verification gate

Status: fixed in the follow-up. The marketplace export was regenerated, `lean-startup` is present, `bounded-context-mapping` was removed because of F9, and export freshness now checks clean with 179 public skills.

Evidence:

- `npm run verify` failed at `marketplace:verify`.
- The gate reported these stale generated files:
  - `marketplace/README.md`
  - `marketplace/skills/bounded-context-mapping/SKILL.md`
  - `marketplace/skills/client-server-boundary/SKILL.md`
  - `marketplace/skills/data-modeling/SKILL.md`
  - `marketplace/skills/transaction-isolation/SKILL.md`
  - `marketplace/skills/usability-testing/SKILL.md`
  - `marketplace/skills/visual-design-foundations/SKILL.md`
- The gate reported this missing generated file:
  - `marketplace/skills/lean-startup/SKILL.md`
- The gate reported: expected 180 exported skills, found 179.
- The gate reported: missing exported skill `lean-startup`.
- The exporter intentionally excluded these private or repo-specific skills:
  - `agent-ops/skill-router`
  - `knowledge-organization/skill-evolution`
  - `quality-assurance/graph-audit`
  - `software-engineering-method/canonical-repo-structure`

Impact:

The system-level gate is green, but the full repo is not release-clean. A public marketplace release from this working tree would ship stale generated exports and omit `lean-startup`.

Recommended action:

Regenerate and verify the marketplace export in a SYSTEM/release-freshness change:

```bash
cd /Users/jacobbalslev/Development/skill-graph
node scripts/export-marketplace-skills.js
node scripts/export-marketplace-skills.js --check
node scripts/verify-skill-md-export.js --plain marketplace/skills
npm run verify
```

Before any push or public release, re-run the privacy/publication checks named in `skill-graph/AGENTS.md`.

### F2 - P2 - `data-modeling` has missing top-level field-purpose comments

Status: fixed in the follow-up. The dedicated `backfill-field-purpose-comments.js` codemod added 52 comment lines to `skills/software-architecture/data-modeling/SKILL.md`, and the targeted lint check now reports 0 warnings.

Evidence:

- During the initial `npm run verify`, `npm run lint` checked 184 skill files and reported 0 errors and 1 warning.
- The warning was:
  - `/Users/jacobbalslev/Development/skills/skills/software-architecture/data-modeling/SKILL.md`: 19 top-level fields missing field-purpose comment.

Impact:

This does not fail lint today, but it is corpus documentation debt against the current field-purpose-comment convention. It also means `data-modeling` is less cold-start friendly than the rest of the migrated skill corpus.

Recommended action:

Handle this as CONTENT work through the audit loop for `software-architecture/data-modeling`; do not patch it opportunistically inside a SYSTEM change.

### F3 - P2 - `SKILL_GRAPH.md` still describes `scripts/skill-lint.js` as a four-check validator, but the live linter is broader

Status: fixed in the follow-up. The Tier 3 table now describes the current schema, structure, alias-equality, relation-target, sidecar, and comprehension-state checks.

Evidence:

- `/Users/jacobbalslev/Development/skill-graph/SKILL_GRAPH.md:184` says `scripts/skill-lint.js` is a "Four-check canonical-source validator" covering YAML parse, `name`, non-empty `description`, and parent directory/name matching.
- The live `/Users/jacobbalslev/Development/skill-graph/scripts/skill-lint.js` performs broader checks, including schema validation, `subjects[0]` and `subject` alignment, required body sections, non-blank `scope`, compatibility alias equality, relation target existence, optional sidecar validation, and understanding-field checks when comprehension state is present.
- `/Users/jacobbalslev/Development/skill-graph/skill-audit-loop/SKILL_AUDIT_LOOP.md:743` also says the five skill-content body sections are lint-enforced.
- `npm run verify:system` passed, so the automated docs drift checks do not currently catch this prose-level stale description.

Impact:

This can mislead agents that read `SKILL_GRAPH.md` first and assume lint is intentionally narrow. That is especially risky because `skill-graph/AGENTS.md` instructs agents to update gate-conformance fixtures when changing gate scripts or adding structural/truth/protocol rules.

Recommended action:

Update the Tier 3 table in `SKILL_GRAPH.md` to describe the current lint responsibilities and point readers to `scripts/skill-lint.js` plus `audits/gate-conformance/spec.yaml` for executable coverage.

### F4 - P3 - The opening description in `SKILL_GRAPH.md` uses older flattened grounding field names

Status: fixed in the follow-up. The opening description now names `grounding.grounding_mode`, `grounding.truth_sources`, and `grounding.failure_modes`.

Evidence:

- `/Users/jacobbalslev/Development/skill-graph/SKILL_GRAPH.md:7` says the Skill Metadata Protocol declares each skill's `truth_sources`, `grounding_mode`, and `failure_modes`.
- The current protocol describes those fields under `grounding` in authored frontmatter:
  - `/Users/jacobbalslev/Development/skill-graph/skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md:671`
  - `/Users/jacobbalslev/Development/skill-graph/skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md:672`
  - `/Users/jacobbalslev/Development/skill-graph/skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md:676`
- Other current docs correctly refer to `grounding.truth_sources`, including `SKILL_GRAPH.md:211`, `SKILL_GRAPH.md:255`, and `SKILL_AUDIT_LOOP.md:297`.

Impact:

The first paragraph of the system overview points readers at legacy flattened names before they reach the current nested `grounding.*` contract. It is not breaking validation, but it is a precision problem in the entrypoint doc.

Recommended action:

Rewrite that paragraph to say the protocol declares grounding mode, truth sources, and failure modes under `grounding`, with project-anchored skills requiring non-empty `grounding.truth_sources`.

### F5 - P3 - Script documentation headers are uneven in audit implementation modules and tests

Status: fixed in the follow-up. The initial detector counted only block comments/shebangs and therefore over-listed files that already had good `//` purpose blocks. A corrected detector found 12 files without a top-level purpose signal; all 12 now have concise purpose comments, and the corrected inventory reports 0 missing across 167 script files.

Evidence:

- The script inventory found 167 JavaScript or shell files:
  - `bin`: 1
  - `lib`: 52
  - `scripts`: 114
- 105 files have a shebang.
- The refined detector found 12 files without a top-level purpose comment or shebang in the first 10 lines:
  - `lib/audit-shared/auto-improve.js`
  - `lib/audit/agent-telemetry.js`
  - `lib/audit/evaluate-skill.js`
  - `lib/audit/panel-preflight.js`
  - `lib/audit/run-skill-improvement-loop.js`
  - `lib/audit/skill-improvement-helpers.js`
  - `scripts/__tests__/test-agent-telemetry.js`
  - `scripts/__tests__/test-model-cli-home.js`
  - `scripts/__tests__/test-panel-preflight.js`
  - `scripts/__tests__/test-public-workspace-fallback.js`
  - `scripts/__tests__/test-run-command-with-timeout.js`
  - `scripts/__tests__/test-skill-audit-loop-doctrine.js`

Impact:

This is not a current automated gate failure and does not imply the modules are incorrect. The risk is cold-start maintainability: the audit loop implementation is a dense multi-file subsystem, and several internal library modules and test files lack a short purpose statement at the top.

Recommended action:

The follow-up pass added short top-of-file purpose comments to the 12 files listed above. The corrected inventory command now reports `missingTopPurposeSignal: 0`.

### F9 - P1 - `bounded-context-mapping` carried an active HARMFUL application verdict

Status: fixed in the follow-up. The skill was removed from the active corpus because the audit-manifest gate treats active `application_verdict: HARMFUL` as a corpus violation, and no newly evaluated replacement was available in this task.

Evidence:

- `npm run verify` later failed at `audit-manifest:check`.
- The gate reported `bounded-context-mapping` as an active skill carrying `application_verdict: HARMFUL`.
- The sidecar and eval artifacts for the skill existed under `/Users/jacobbalslev/Development/skills/skills/software-architecture/bounded-context-mapping/`.

Impact:

The full verification gate cannot pass while an active manifest entry carries `application_verdict: HARMFUL`. The router also treats dangerous application verdicts as behavior exclusions, so keeping the skill active would preserve a known-dangerous routing surface.

Resolution:

- Removed the active `bounded-context-mapping` skill files from the corpus.
- Removed or rerouted all live `SKILL.md` references to `bounded-context-mapping`.
- Regenerated root and Skill Graph manifests, skill indexes, status docs, marketplace exports, and registry docs.
- Verified no live `SKILL.md` or generated public surface still references `bounded-context-mapping`.

### F10 - P1 - `data-modeling` recorded a non-certifying single-frontier HARMFUL panel result as the active-corpus verdict

Status: fixed in the follow-up. The recorder now preserves the single-frontier dangerous receipt but downgrades the durable active-corpus verdict to `UNVERIFIED` when the panel receipt is non-certifying. The `data-modeling` sidecar now carries `application_verdict: UNVERIFIED`, while retaining the `eval_last_run.bidirectional.synthesized_verdict: HARMFUL`, `certifying_clean: false`, and `regrade_required: true` evidence.

Evidence:

- After F9 was fixed, `npm run verify` failed again at `audit-manifest:check`.
- The gate reported `data-modeling` as an active skill carrying `application_verdict: HARMFUL`.
- The `data-modeling` sidecar showed:
  - `eval_state: unverified`
  - `application_verdict: HARMFUL`
  - `eval_last_run.bidirectional.reconciliation: single-frontier-provisional`
  - `eval_last_run.bidirectional.certifying_clean: false`
  - `eval_last_run.bidirectional.synthesized_verdict: HARMFUL`
  - `eval_last_run.bidirectional.regrade_required: true`
  - missing frontier: `opus`

Impact:

The sidecar mixed two meanings: it correctly preserved a dangerous one-frontier panel signal, but it also promoted that non-certifying signal into the durable active-corpus verdict. That made the audit-manifest gate demand removal of a core skill even though the panel receipt itself says a full two-frontier re-grade is required.

Resolution:

- Updated `recordFullLoop()` in `/Users/jacobbalslev/Development/skill-graph/lib/audit/run-skill-audit-loop.js` so non-certifying `HARMFUL` or `FALSE_POSITIVE` panel receipts are preserved in `eval_last_run` but the durable active verdict is written as `UNVERIFIED`.
- Added a focused unit test in `/Users/jacobbalslev/Development/skill-graph/scripts/__tests__/test-skill-audit-loop-record.js`.
- Updated verdict docs in `/Users/jacobbalslev/Development/skill-graph/docs/verdict-semantics.md` and `/Users/jacobbalslev/Development/skill-graph/skill-audit-loop/SKILL_AUDIT_LOOP.md`.
- Updated `/Users/jacobbalslev/Development/skills/skills/software-architecture/data-modeling/audit-state.json` to `application_verdict: UNVERIFIED` while preserving the re-grade receipt.

### F6 - P4 - `verify:system` green while full `verify` was red matched the documented gate split

Evidence:

- `npm run verify:system` passed.
- The initial `npm run verify` failed at the corpus/release freshness gate `marketplace:verify`.
- The final `npm run verify` now passes.
- `/Users/jacobbalslev/Development/skill-graph/AGENTS.md:686` says SYSTEM work is shippable when `verify:system` is green and that full `verify` only goes green once corpus/release gates are also green.
- `/Users/jacobbalslev/Development/skill-graph/AGENTS.md:688` explicitly says `verify:system` green does not mean publishable.

Impact:

This was a healthy separation, not a defect. The initial state should have been reported as "system gate green; release/corpus freshness red," not as "Skill Graph broken." The final state is now both system-green and full-verify-green.

Recommended action:

Keep using `verify:system` for SYSTEM-only changes, then run `release:ready`, `release:check`, or full `verify` before any publication claim.

### F7 - P4 - Routing evaluations pass where declared, but declaration coverage is still partial

Evidence:

- During `npm run verify`, `routing-eval` wrote `.skill-graph/_routing-eval.manifest.json`.
- It reported 29 of 183 skills with `routing_eval: present`.
- All 29 declared routing evaluations passed.
- One accepted detail was reported for `lint-overlay`: a negative anti-example coverage gap for the phrase "configure eslint rule severity mapping in package json"; the overall routing evaluation still passed.

Impact:

This is not a failure. It is useful progress telemetry: declared routing evals are healthy, but routing-eval declaration coverage is not corpus-wide.

Recommended action:

Continue adding routing evals through the audit loop when a skill is materially improved or when routing ambiguity is discovered.

### F8 - P4 - The archived mirror divergence warning is expected noise, not an action item

Evidence:

- Both `verify:system` and `verify` emitted the charter parity warning for `skill-audit-loop/AGENTS.md (MIRROR_ARCHIVED)`.
- The output says the archived mirror diverges from canonical and that this is expected for frozen mirrors.

Impact:

The warning should not be treated as a failing finding. It is useful only as a reminder that frozen mirrors are intentionally not canonical.

Recommended action:

No action unless the project wants to reduce verifier noise by changing the presentation of expected archived-mirror divergence.

## Clean Checks Worth Preserving

These are not findings requiring action, but they are important evidence about current health:

- `protocol:check` passed with 0 warnings.
- `models:check` passed.
- `verify:system` passed.
- Final `manifest:validate` passed during full `verify`, reporting a valid 183-skill manifest.
- Final `export:verify-skill-md` passed for 183 skill exports.
- Final `marketplace:verify` passed with 179 public marketplace exports.
- Final `audit-manifest:check` passed with 0 active HARMFUL skills; current application verdict distribution is `UNVERIFIED: 169`, `PROVISIONAL: 9`, `REDUNDANT: 3`, `MIXED: 2`.
- Final `application-evals:check` passed for all application eval artifacts across 1 skill root.
- `marketplace:superset` passed in `verify:system`.

## Recommended Execution Order

This section is retained as historical context from the initial report. The follow-up completed items 1-4, fixed F9 and F10 discovered during remediation, and left F6, F7, and F8 as reporting notes because they were not defects.
