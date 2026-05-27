# Skill Graph — SYSTEM-side end-to-end audit (2026-05-27 follow-up)

> Type: Research / one-shot SYSTEM audit
> Author: Claude Opus 4.7 session (2026-05-27 ~12h after commit `f88603d`)
> Companion: `docs/adr/0016-operational-data-ownership.md` § Status references a `system-audit-2026-05-27.md` — this file is the follow-up audit that surfaces post-`f88603d` (operation-field-retire) drift.
> Mode: SYSTEM (read-only analysis; no schemas, scripts, protocol docs, SKILL.md files, or per-skill artifacts edited).

## Setup

**Mode declared:** SYSTEM. Per AGENTS.md § Work Modes, this audit is read-only and produces a report; no schema, script, protocol doc, SKILL.md, or per-skill artifact is edited.

**Scope:** every SYSTEM surface of the skill-graph project — Tier 1 schemas, Tier 2 prose protocol/audit-loop/graph docs and ADRs, Tier 3 enforcement scripts and codemods, Tier 4 consumer tooling, Tier 5 specimens/fixtures, plus CI workflow, package contract, audits manifest, lane config, and grader prompts. Excludes individual SKILL.md content drift (that is CONTENT-mode work for the audit loop).

**Read corpus (verified):**
- `CLAUDE.md`, `AGENTS.md`, `SKILL_GRAPH.md` (full), `SKILL_METADATA_PROTOCOL.md` (full), `SKILL_AUDIT_LOOP.md` (Parts 1-3, full)
- `schemas/skill.schema.json` (full)
- `audits/manifest.json` (full), `audits/lanes.json` (full)
- `package.json` (full), `.skill-graph/config.json`
- ADRs 0009, 0015, 0016, 0017, 0018 (full); ADR titles 0001-0018 enumerated
- `CHANGELOG.md` (lines 1-120; [Unreleased] + 0.5.10 + 0.5.9 + 0.5.8)
- CI workflow `.github/workflows/skill-graph-lint.yml` (head)
- Most recent 25 commits (`git log --oneline -25`)
- Commit `f88603d` full diffstat + message
- Live results of: `npm run lint`, `lint:template`, `category:check`, `protocol:check`, `docs:links`, `docs:drift`, `mirror:freeze`, `charter:parity`, `stability:check`, `manifest:validate`, `routing-eval`, `marketplace:verify`, `overlap`, `audit-manifest:check`, `status:check`, `test:unit`
- On-disk counts: 154 canonical SKILL.md, 152 marketplace SKILL.md, 8 comprehension.json, 5 application.json artifacts

**One-line situational summary:** the most recent commit (`f88603d`, ~12h before this audit) is `refactor(protocol): retire operation field + 5 doctrinal changes`. The schema/lint/router/manifest cleanup landed; ~12 SYSTEM surfaces still describe `operation` as a v8 axis or actively re-author it. The entire `npm run verify` chain is RED across 7+ independent gates (some predating this commit, some caused by it, some by historical drift). This is mid-refactor state, not steady state — but several drifts have no follow-up tracking visible in commits or ADRs.

---

## Structured pass — layer by layer

### S1. Tier 1 — Schema (binding contract)

| Item | State | Evidence |
|---|---|---|
| `schemas/skill.schema.json` exists, canonical-only per ADR-0014 | OK | file present; `$id: https://skillgraph.dev/schemas/skill.schema.json` |
| Required array | **partial** | requires `subject` + `scope` (+ identity/lifecycle/Evaluation Status). Does NOT require `operation`. |
| `operation` property declared | **NO** | `grep '"operation"' schemas/skill.schema.json` returns 0 lines. `additionalProperties: false` therefore rejects every skill carrying `operation`. |
| `subject` property | declared | enum of 9 values, lines 126-140 |
| `subjects` polyhierarchy array | declared | max 2 items, lines 141-161 |
| v7 legacy fields | declared as deprecated optional | `type`, `category`, `categories`, `primaryCategory`, `layerPrimary`, `routingRole` all present as optional properties |
| `category.const` 6-enum allOf rules | **present but stale** | 6 allOf branches (lines 962-1106) still keyed off `category` const matches — fire only when a skill declares `category`, so they are harmless on v8-only skills, but the schema still spends 144 lines enforcing the deprecated facet |
| `extends` required when `type: overlay` allOf | **stale guard added** | The allOf branch now requires `type` to be present before firing (lines 1108-1124, with `_comment` noting "extends is required only when type: overlay is explicitly declared. The required: [type] guard prevents this rule from firing when type is absent (which it can be, post-v7→v8 phase end)") — but the parallel "type ≠ overlay → forbid extends" branch (lines 1142-1162) has the same guard intent. Both are correct; this is well-handled. |
| `scope: codebase|project → grounding` allOf | declared | lines 1126-1141 |
| `comprehension_state: present → flat OR concept` anyOf allOf | declared | lines 1181-1209 |
| New eval-state coherence allOf (M5) | **declared and correct** | lines 1226-1255: `eval_state: passing` and `eval_state: monitored` both require `eval_artifacts: present`. This is the kind of cross-field invariant the schema should carry. |
| Schema version field `oneOf` | accepts integer `7|8` AND string `"7"|"8"` | line 22-32. The description (line 33) annotates the string form as documented-only-for-back-compat and slated for removal "no earlier than v8→v9 phase" |
| Audit Status field set | declared | all four verdicts (`structural_verdict`, `truth_verdict`, `comprehension_verdict`, `application_verdict`) + `lint_verdict` + `drift_status` + `eval_score` + `eval_failed_ids` + `last_audited` + `last_changed` |
| `comprehension_verdict` enum | **canonical and disjoint from application enums** | 7 values; correctly excludes `APPLICABLE/MIXED/HARMFUL/FALSE_POSITIVE` (those are application_verdict-only). This was a fix called out in 0.5.10 CHANGELOG. |

**Schema findings:**
- **S1-B1 (CRITICAL).** `operation` is referenced as a v8 required axis in `AGENTS.md § Skill Metadata Protocol — Quick Reference:199`, `SKILL_METADATA_PROTOCOL.md § Required fields:163`, `SKILL_AUDIT_LOOP.md § Part 2 § 1 audit checklist:425-427`, `SKILL_GRAPH.md § Current State:17`, every recent CHANGELOG entry under `[Unreleased]` and `[0.5.10]`, and ADR-0017 § Decision row 2. But the schema does NOT declare it, does NOT require it, and `additionalProperties: false` actively rejects skills that carry it. Commit `f88603d` (2026-05-27) explicitly retired it — the docs are now describing a contract the schema does not enforce. This is the single biggest doc/schema split.
- **S1-B2 (HIGH).** Schema still carries the entire v7 `category` allOf machinery (lines 962-1106, 144 lines, 6 conditional branches). With `category` deprecated and never authored on new skills, these branches become inert noise. Not broken per se — they only fire when `category` is present and require `categories[0]` to match — but they widen the schema surface for no current consumer. Decision needed: prune when the corpus has drained, or keep for the deprecation-back-compat window. Either decision should be recorded.
- **S1-B3 (HIGH).** Schema still defines `primaryCategory` enum with 6 lowercase + 5 title-case workspace values (lines 162-178). With `primaryCategory` deprecated and replaced by `subject`, the title-case workspace values (`Meta Method`, `Technical Capability`, `Design & UX`, `Agent System`, `Product Domain`) are stranded — they had no v8 equivalent because v8 axes are lowercase-only. No consumer documented today. Same pruning question as S1-B2.
- **S1-B4 (MEDIUM).** `description` schema definition (lines 45-48) no longer says "routing contract" — `f88603d` rewrote it as "A short description of what the skill is about" with activation moved to `keywords`/`triggers`/`examples`/`anti_examples`/`relations.boundary`. But AGENTS.md § Skill Metadata Protocol — Quick Reference (line 202) still says "`description` — routing contract: positive trigger phrases + explicit negative boundary (`Do NOT use for X (use that-skill).`)" — describing the OLD contract. Same for SKILL_METADATA_PROTOCOL.md § Identity § description (lines 264-267): "The routing contract, not a summary. Write for the router, not for a human reader. Lead with a trigger clause… Include an explicit negative boundary." This is the new "+5 doctrinal changes" #1 — the schema was updated, the human docs were partially updated but two prominent surfaces still teach the retired framing.
- **S1-INFO-1.** The `schema_version` `oneOf` accepting both string and integer is honest pragmatism for hand-rolled YAML, and the inline description annotates the string form as documented-only-for-back-compat. Good documentation of a tolerance gap.

### S2. Tier 2 — Prose protocol/loop docs (canonical explanations)

#### S2a. `SKILL_METADATA_PROTOCOL.md`

| Item | State | Evidence |
|---|---|---|
| Spec version banner | `1.5.0 (schema_version: 8, Skill Graph 0.5.10)` | line 5 |
| Required axes section | **describes operation as required** | lines 199-205 list `subject`/`operation`/`scope` as the v8 5-axis core. Schema no longer agrees (per S1-B1). |
| § Classification — the 5-axis model | full prose still 5-axis | lines 276-342 author the `operation` axis as Bloom-grounded 4-enum with verified live-manifest distribution |
| § Schema contract | claims schema mandates subject+operation+scope | lines 761-777. Schema does not. |
| v8 directory layout decision tree | OK | lines 71-87, matches 9-shelf v8 subjects, post-F23 flat-by-subject layout |
| Two-physical-encodings explanation | OK | lines 49-67, accurate |
| `description` field semantics | **describes retired routing-contract framing** | lines 262-267, contradicts schema description |
| § Relations § boundary WARNING | **present and accurate** | lines 605-619 carry the full WARNING + ADR-0018 v8.1 rename plan |
| Doc routing rules | accurate | links to field-reference.md for prose, decision-guide.md for choice logic |
| Broken anchors in TOC | **YES** | `#Evaluation Status` is not a valid anchor (would need `#evaluation-status`). Confirmed broken by `npm run docs:links`. |

**Protocol-doc findings:**
- **S2a-B5 (CRITICAL).** Per S1-B1, the protocol-doc claims a contract the schema no longer enforces. Three of the four normative claims about `operation` in this file are now false against schema:
  - Line 163 ("operation | enum (4 closed values, Bloom-grounded) | v8 axis 2 — Cognitive operation enabled by loading this skill")
  - Lines 199-205 (lists `operation` as required core)
  - Lines 280-289 (5-axis table with `operation` row)
  - Lines 310-322 (full § Axis 2 — `operation` prose with verified distribution)
- **S2a-B6 (HIGH).** Per S1-B4, the description field's normative framing teaches activation-via-description; schema and commit `f88603d` rewrote that to about-statement-only.
- **S2a-B7 (MEDIUM).** Broken anchor `#Evaluation Status` (with capital letters and space) in the TOC (line 33) — confirmed by `docs:links`. Should be `#evaluation-status` per standard Markdown anchor slugification.
- **S2a-B8 (MEDIUM).** Broken anchor `#health-block-v6-flat--written-by-the-audit-loop` (line 244) — refers to a section that was renamed to "Audit Status" per `f88603d` doctrinal change #4. The internal link should now point at `#audit-status-v6-flat--written-by-the-audit-loop` or similar; the `f88603d` rename didn't sweep this internal reference.

#### S2b. `SKILL_AUDIT_LOOP.md`

| Item | State | Evidence |
|---|---|---|
| Work-mode rule banner at top | present | line 3 |
| Three-part structure (doctrine / checklist / runbook) | present | lines 5-9 |
| Two-gate model | present and well-articulated | lines 36-43 |
| MLOps maturity (post-F14) self-location | present | lines 45-57 — honest L1/L0 split between Integrity Gate and Behavior Gate eval data |
| Four-operations table | present | lines 63-69, accurate against bin/skill-graph.js |
| Inner pipelines of audit/improve/evaluate/evolve | documented | lines 154-219 |
| Quick start | present | lines 254-278; `node lib/audit/evaluate-skill.js` paths match lib/ |
| Part 2 checklist § 1 mentions `operation` enum check | **present, schema disagrees** | lines 424-427: "operation is one of the 4-value Bloom-grounded enum — know / do / decide / modify" |
| Part 3 runbook — "Audience & runtime" carve-out at top | **excellent honest disclosure** | lines 540-545. Documents that several Part-3 commands (`scripts/skill/skill-audit-claim.js`, `source-truth-catalog.js`, `skill-census.js`, `build-skill-audit-worklist.js`, `skill-test-runner.js`) live in the parent workspace at `~/Development/scripts/skill/` and are NOT in the npm package — explicitly the ADR-0016 surface that isn't migrated yet. |
| Hard rules — audit loop | present | lines 805-815 |
| Continuation prompt | present | lines 794-803 |
| Step 5 / Step 11 commit-path list | references workspace logs/paths | lines 642-684, 759-772 — `agent-orchestration/logs/comprehension-history.jsonl`, `.opencode/progress/skill-audits/`, `_ledger.jsonl` — all workspace paths the npm-only consumer cannot reach |

**Audit-loop-doc findings:**
- **S2b-B9 (CRITICAL).** Per S1-B1 + S2a-B5, the Part 2 checklist § 1 row that asks the auditor to verify `operation` is in the 4-enum is asking for a check the schema no longer accepts. Any auditor running this checklist on a v8 skill today either (a) finds operation present and contradicts the schema FAIL, or (b) finds operation absent and contradicts ADR-0017.
- **S2b-INFO-2.** The "Audience & runtime" banner at the top of Part 3 (lines 540-545) is the best example of honest doc hygiene in this repo — it tells a standalone `@skill-graph/cli` user explicitly which commands are workspace-only and how to substitute. Other docs should follow this pattern wherever ADR-0016 (Proposed-status surfaces) hasn't fully resolved.

#### S2c. `SKILL_GRAPH.md`

| Item | State | Evidence |
|---|---|---|
| § Current State table | present | lines 11-28 |
| Schema-version-enforced row | **incorrectly describes "v8 only" + subject+operation+scope** | line 17. Schema only enforces subject+scope; operation column was retired. |
| Per-skill schema_version in manifest | added per F4 | line 21 — confirmed via `scripts/generate-manifest.js::buildSkillEntry` |
| Canonical skill count | 153/154 (with template) | line 22 — verified live 2026-05-26, but live count today is 154 SKILL.md (one new since) |
| Marketplace export count | 152 | line 23 claims 152 — current state matches 152 |
| Audit Loop maturity row | post-F14, well-articulated | line 26 |
| Audit-ledger consistency gate row | **honest red disclosure** | line 27 — calls out the 15-item failure with link to SH-6548 follow-up |
| Source-vs-marketplace explanation | OK | lines 29-60 |
| Layout note re-verified 2026-05-27 | present | line 58 with M2 reconciliation note |
| Five tiers table | present | lines 102-110 |
| System-model Mermaid diagram | OK | lines 70-93 |
| Tier 5 fixture-graph diagram | OK with v6-pinned note | lines 369-405 |
| Tier 3 — pipeline diagram | OK | lines 178-214 |
| Tier 4 — drift sentinel state machine | OK | lines 237-270 |
| Tier 4 — routing harness decision path | OK | lines 273-325 |
| § Invariants this structure guards | present and verifiable | lines 425-434 |

**Graph-doc findings:**
- **S2c-B10 (CRITICAL).** Per S1-B1, the Current-State row on schema-enforced (line 17) describes operation as required when it is not. This is the single most important row in the doc — every other doc links here for the live answer.

#### S2d. ADRs (0001-0018) — coverage check

| ADR | Status | Scope-relevant findings |
|---|---|---|
| 0001-0008 | All Accepted, older decisions | Not re-audited; presumed stable. |
| 0009 (sibling repo deprecation) | Accepted 2026-05-18 + Updated 2026-05-20 (mirrors archived) | OK |
| 0010 (docs site) | not read; out of scope for this audit | |
| 0011 (four-verdict split) | Accepted | OK — current schema matches |
| 0012 (internal-skill separation) | Accepted | OK — defense-in-depth gates landed |
| 0013 (scope vs overlay_of) | not read; out of scope | |
| 0014 (canonical-only schema files) | Accepted | OK — C6 retired confirmed via `protocol:check` |
| 0015 (project-owned operational prompts) | Accepted 2026-05-25 | OK — `audits/prompts/` populated, `audits/manifest.json` present, `check-audit-manifest.js` present |
| 0016 (operational data ownership) | **Accepted 2026-05-27** (was Proposed 2026-05-25) | P1 lanes.json migration shipped; P2-P7 sequenced but not all shipped. Audit B7/H4 below tracks the residual. |
| 0017 (5-axis classification model) | Accepted 2026-05-25 | **Now PARTIALLY SUPERSEDED by `f88603d`.** The Decision table row 2 (`operation`) is no longer in force; ADR has no supersession note or amendment. |
| 0018 (relations.boundary semantic inversion) | Accepted 2026-05-25, target v8.1 | OK as Accepted; Phase 1+ work not yet shipped |

**ADR findings:**
- **S2d-B11 (CRITICAL).** ADR-0017 § Decision table row 2 + § Landing strategy + § Consequences explicitly bind the 5-axis model with `operation` as axis 2. Commit `f88603d` retired the field but the commit message says "ADRs and research records left untouched (immutable history)." Per ADR doctrine, ADRs ARE immutable history — but a superseding ADR is the canonical mechanism to record the change. None exists. The state today is: ADR-0017 (Accepted) describes a 5-axis model with `operation`; the schema (canonical Tier 1) describes a 4-axis model without `operation`. ADR-0017 is now a tier-2 doc that disagrees with tier-1 — per `SKILL_GRAPH.md § Authority Tiers`, tier 1 wins and tier 2 is the bug. Either a new ADR (ADR-0019: retire `operation`) supersedes ADR-0017's operation axis, or ADR-0017 gets an amendment block similar to ADR-0009 § Update 2026-05-20. The "immutable history" framing is a misread — amendment blocks and supersession ADRs are exactly how immutable-history doc systems handle this.
- **S2d-INFO-3.** ADR-0009's amendment-block precedent (`§ Update — 2026-05-20: repos archived (Option B → archive)`) is exactly the right pattern for ADR-0017's needed amendment.
- **S2d-INFO-4.** ADR-0016 status was updated Accepted 2026-05-27 (today) per the file head. The audit `system-audit-2026-05-27.md` referenced in its § Status section is an external file not in this scope's read budget — but it confirms an audit was performed before this one. This audit may be reproducing some of the same findings; the prior audit's findings should be cross-referenced before filing duplicates.

#### S2e. `field-reference.md` and generated mirror

| Item | State | Evidence |
|---|---|---|
| `docs/field-reference.generated.md` | **stale** | `protocol:check` C7 FAILS: "out of step with the current skill schema description strings. Run `node scripts/build-field-reference.js` to regenerate" |
| `docs/field-reference.md` references `#operation` anchor 3× | **broken** | `docs:links` lines 111/153/246 — references a section that was removed in `f88603d` (the file's diff showed 86 lines changed) |
| Generated file references `#operation` | broken | `docs:links` line 134 — generated file has stale reference because not regenerated |

**Field-reference findings:**
- **S2e-B12 (CRITICAL).** Per protocol:check C7 and docs:links failures, the generated `field-reference.generated.md` is stale. The fix is mechanical: `node scripts/build-field-reference.js`. The hand-authored `field-reference.md` still contains 3 references to the retired `#operation` anchor that the `f88603d` cleanup missed.

#### S2f. Other docs (CHANGELOG, README, etc.)

| Item | State | Evidence |
|---|---|---|
| `CHANGELOG.md` [Unreleased] | describes operation as v8 axis | line 14: "v7→v8 phase ended; v8 is the canonical classification (2026-05-26)…The schema's global required array mandates `subject` + `operation` + `scope` (v8 axes)." |
| `CHANGELOG.md` [Unreleased] body section heading rename | OK | line 13 — accurate to f88603d-precursor work |
| Marketplace publication queue (generated) | not re-verified in this audit; should be regenerated as part of marketplace:verify drain | — |
| `docs/status.generated.md` | **stale** | `status:check` FAILS: "stale relative to current state" + reports 3 child checks not passing (markdown-links, protocol-consistency, marketplace-export-check) |

**Other-doc findings:**
- **S2f-B13 (CRITICAL).** CHANGELOG [Unreleased] is now lying about what the v7→v8 phase end did. The 2026-05-26 entry should be amended (or a new Unreleased entry added) recording the 2026-05-27 `f88603d` retire-operation refactor. Without this CHANGELOG amendment, the next release tag will publish a doc that says "schema requires subject+operation+scope" while the schema requires subject+scope.
- **S2f-B14 (MEDIUM).** `docs/status.generated.md` is stale. The fix is mechanical (`node scripts/build-status-doc.js`); status:check is one of the gates that has been red ever since `f88603d`.

### S3. Tier 3 — Enforcement and transformation scripts

| Script | State | Evidence |
|---|---|---|
| `scripts/skill-lint.js` | partially updated | `V8_AXES = new Set(['subject', 'scope'])` (line 200) reflects the retire. Reduced 4-check canonical-source validator (per `SKILL_GRAPH.md` Tier 3 description). |
| `scripts/check-protocol-consistency.js` | C1-C5+C7+C8 pass; C7 FAILS today | 8 checks documented (C6 retired) but C7 generated parity FAILS — that's because the generated file is stale, not because the script is broken |
| `scripts/check-doc-drift.js` | OK | warn-class `stale-version-phrase` pattern (per CHANGELOG 0.5.10); ran clean against 54 active docs |
| `scripts/check-mirror-freeze.js` | OK | clean (per `npm run mirror:freeze`) |
| `scripts/check-charter-parity.js` | OK with one warn | one warn against the archived `skill-audit-loop/AGENTS.md` mirror — expected per `MIRROR_ARCHIVED` policy |
| `scripts/check-markdown-links.js` | working as intended | FAILS today on 6 broken links — that's the docs' fault, not the script's |
| `scripts/check-audit-manifest.js` | working as intended | FAILS today on 14 historical PROVISIONAL stamps without artifacts — separately tracked SH-6548 |
| `scripts/lint/check-category-enum.js` | **stale** | FAILS today on `expected-value/SKILL.md`: "category undefined must be one of foundations…product". With `category` deprecated, asserting required value is contradictory; this script needs to either treat category as conditional or be retired. |
| `scripts/lint/check-stability-promotion.js` | OK | 154 skills checked, 0 warnings |
| `scripts/generate-manifest.js` | **partial mismatch** | manifest validate FAILS today on `#/skills/49/category: expected type string, got undefined` and `#/skills/49/type: expected type string, got undefined`. That means the *manifest schema* still requires category+type while skills no longer carry them. |
| `scripts/skill-graph-routing-eval.js` | not directly tested (manifest gen failed before reaching routing eval) | upstream manifest:validate failure blocks the routing-eval as well |
| `scripts/export-marketplace-skills.js` | **drift detected** | `marketplace:verify` FAILS: stale README, stale `cognitive-load-theory` SKILL.md, missing `expected-value` SKILL.md, stale `skill-scaffold` SKILL.md, expected 153 exported, found 152. Truncation warnings on 4 descriptions (`tool-call-strategy`, `version-control`, `webhook-integration`, `writing-humanizer`). |
| `scripts/verify-skill-md-export.js` | not directly tested in isolation | runs as part of marketplace:verify |
| `scripts/skill-overlap.js` | OK | 0 errors, 31 keyword-overlap warnings (intentionally warn-not-fail per design) |
| `scripts/skill-graph-drift.js` | not directly tested in this audit | — |
| `scripts/build-field-reference.js` | not directly tested; deferred output is stale | — |
| `scripts/build-status-doc.js` | working; output stale | check mode FAILS because the regenerate hasn't been run |
| `scripts/migrate-skill-v7-to-v8.js` | **broken contract** | grep shows the codemod still authors `operation: <value>` per skill (lines 199, 242-247, 364, 371). Running it on a v7 skill today produces a v8 skill that fails lint. |
| `scripts/migrate-skill-v2-to-v3.js` | not re-verified; per ADR-0014 retained for git-history | — |
| `scripts/check-work-mode-separation.js` | not directly tested | per AGENTS.md, soft-signal exit-0-always; harness for SYSTEM/CONTENT mixing detection |

**Tier 3 findings:**
- **S3-B15 (CRITICAL).** `scripts/migrate-skill-v7-to-v8.js` still inserts `operation:` on every migration. The script is the canonical mechanism for the corpus drain ADR-0017 + S1-B1 require, but it now produces invalid v8 skills. Running `node scripts/migrate-skill-v7-to-v8.js skills/<v7-skill>/SKILL.md` would lead a migrating author into the trap. Either the script needs the operation-insert deleted (cleanest), or the script is renamed to `migrate-skill-v7-to-v8-legacy.js` and a new no-operation codemod replaces it, or it gets a hard `process.exit(1)` until updated.
- **S3-B16 (HIGH).** `scripts/lint/check-category-enum.js` treats `category` as required (failing on undefined) even though `category` was demoted to deprecated-optional. Per the SKILL_METADATA_PROTOCOL.md, v8 skills MAY omit `category`. This script's behavior contradicts the protocol — needs an update to skip skills that don't declare `category`, or be retired.
- **S3-B17 (HIGH).** `schemas/manifest.schema.json` apparently still requires `category` + `type` (or some equivalent type-validation rule) — `manifest:validate` fails on a skill index 49 with both undefined. That means the manifest schema has not been updated to mirror the v8 5-axis (now 4-axis) classification.
- **S3-B18 (HIGH).** Marketplace export is drifted: 1 missing skill (`expected-value`), 1 changed (`cognitive-load-theory`), 1 stale (`skill-scaffold`), 4 truncations on description-length overrides. None of these is "broken contract" — they are an out-of-date export run. The fix is mechanical (`node scripts/export-marketplace-skills.js`), but the fact that `marketplace:verify` runs as part of `npm run verify` AND has been failing means CI has been red on this gate.
- **S3-INFO-5.** `scripts/check-doc-drift.js` correctly catches stale-version *prose* (per CHANGELOG 0.5.10 entry) — good defense-in-depth that complements the schema's machine-readable contract.

### S4. Tier 4 — Consumer tooling

| Tool | State | Evidence |
|---|---|---|
| `scripts/skill-graph-route.js` | not directly tested in this audit | per ADR-0017 has SCOPE_RANK + OPERATION_RANK fallback; some of that machinery is now stale post-`f88603d` but not verified in this read budget |
| `scripts/skill-graph-drift.js` | not directly tested | — |
| `bin/skill-graph.js` | `--help` passes (last `test:unit` step) | one of the 2 passing tests in the truncated test:unit run |
| `bin/skill-graph.js doctor` | not directly tested | runs the fast subset per AGENTS.md |
| `lib/audit/evaluate-skill.js` | exists and is wired for write-back per F14 closure | per `SKILL_AUDIT_LOOP.md:50` runner Level-1 claim verified by file presence |
| `lib/audit/skill-audit.js` | exists | per directory listing |
| `lib/audit/application-eval.js`, `batch-eval.js`, `eval-staleness-checker.js`, `eval-linter.js`, `skill-status.js`, `skill-test-runner.js`, `research-feedback.js`, `run-skill-improvement-loop.js`, `skill-evolution-loop.js`, `skill-improvement-helpers.js`, `log-paths.js`, `parse-frontmatter.js`, `roots.js` | all present | per directory listing |
| `lib/audit-shared/` | present | per directory listing |
| `lib/audit/graders/` | 3 grader prompts present | `application-comparative-grader-prompt.md`, `application-grader-prompt.md`, `concept-grader-prompt.md` |
| Standalone-package boundary (no parent-workspace coupling) | **VIOLATED** | per `test:unit` failure: `lib/audit/batch-eval.js`, `lib/audit/skill-status.js`, `lib/audit/skill-improvement-helpers.js`, `lib/audit/eval-staleness-checker.js` all reach out to `../../scripts/lib/roots` and define `REPO_ROOT = path.resolve(__dirname, '../..')`. A consumer who `npm install`s `@skill-graph/cli` cannot use these modules because they require workspace paths that do not exist in the package consumer's filesystem. |

**Tier-4 findings:**
- **S4-B19 (HIGH).** `lib/audit/` standalone-package boundary is violated. The test `test-lib-audit-smoke.js` exists explicitly to catch this and is currently FAILING. Four files (`batch-eval.js`, `skill-status.js`, `skill-improvement-helpers.js`, `eval-staleness-checker.js`) all assume a parent workspace at `path.resolve(__dirname, '../..')`. They `require('../../scripts/lib/roots')` and reference `sales-hub/`, `agent-orchestration/logs/`, `.opencode/progress/` paths. ADR-0009's consolidation promise was that this repo IS the canonical implementation; ADR-0016's trinary (project owns type, workspace owns instance) suggests the cleanest fix is to copy `scripts/lib/roots` *into* `lib/audit-shared/` and reference it locally, with the workspace adapter staying in the workspace tree. This is the unfinished ADR-0016 P3/P4 work.
- **S4-INFO-6.** `lib/audit/graders/` is the canonical location for grader prompts post-2026-05-25 consolidation (confirmed by Doc Ownership Map row 27, `AGENTS.md`). Workspace `scripts/skill/graders/` should be thin shims per ADR-0009 — this was not verified in this audit.

### S5. Tier 5 — Specimens (fixtures + template)

| Item | State | Evidence |
|---|---|---|
| `examples/skill-metadata-template.md` | not directly read in this audit | per AGENTS.md line 223, the canonical authoring template |
| `examples/fixture-skills/minimal-capability/` | not directly read | per `SKILL_GRAPH.md § Tier 5`, v6-pinned hermetic fixture |
| `examples/fixture-skills/with-grounding/` | not directly read | full grounding block fixture |
| `examples/fixture-skills/with-relations/` | not directly read | all four relations.* edge types |
| `examples/fixture-skills/comprehension-full/` | not directly read | populated Understanding fields |
| `examples/skills.manifest.sample.json` | not directly read | C4 (sample manifest correctness) passes per `protocol:check`, so this is OK |
| `examples/evals/` | not directly read | — |
| `examples/exports/` | not directly read | — |
| Template / fixture frontmatter still carrying `operation:` | **expected per commit `f88603d`** | commit message explicitly accepts: "Fixtures and templates still carrying `operation:` in frontmatter will now fail lint — expected; corpus drain is separate per-skill audit-loop work." `lint:template` is in the verify chain and is FAILING today on the template, which has `operation:`. |

**Specimen findings:**
- **S5-B20 (MEDIUM).** Per commit `f88603d`'s explicit acceptance, the template and fixture files in `examples/` still carry `operation:` and fail lint. The user accepts this as expected and tied to the corpus drain. However: the in-repo `examples/skill-metadata-template.md` is the canonical scaffolding source for NEW skill authoring (per AGENTS.md line 223). Authoring a new skill from this template today produces a v8 skill that immediately fails the lint gate. The template is the SYSTEM specimen, not corpus content — it should be the FIRST thing fixed in the drain, or it should be explicitly held back from `npm run verify`'s `lint:template` script during the corpus drain.

### S6. Audit infrastructure (audits/, lanes, manifest, grader prompts)

| Item | State | Evidence |
|---|---|---|
| `audits/manifest.json` | OK, `schema_version: 1`, well-formed | full read confirmed; describes 1 protocol with 4 runners + 7 required artifacts + 9 alias rows |
| `audits/lanes.json` | OK, `schema_version: 2`, well-formed | full read confirmed; 6 lanes; minTier + preferredModels structure per multi-model review |
| `audits/prompts/` | 4 runners present | single-model, batch-worker-v4, codex-autonomous-v5, minimal-iteration |
| `audits/migration-mapping-v7-to-v8.json` | not directly verified | present per directory listing |
| `audits/merge-protocol.md` | not directly read | present per directory listing |
| `audits/_state/` | gitignored | per `.gitignore` policy in AGENTS.md |
| Grader prompts | 3 present | `lib/audit/graders/application-comparative-grader-prompt.md`, `application-grader-prompt.md`, `concept-grader-prompt.md` |
| Comprehension grader → eval shape | 8 comprehension.json on disk | per `find` count; spec is `schemas/comprehension.schema.json` (per AGENTS.md doc ownership map) |
| Application grader → eval shape | 5 application.json on disk | per `find` count; the L0 data state Part 1 honestly acknowledges |
| `schemas/comprehension.schema.json` | exists | per directory listing; not directly read |
| `schemas/audits-manifest.schema.json` | exists | per directory listing; not directly read |
| `schemas/routing-config.schema.json` | exists | per directory listing — confirms ADR-0016 surface #4 schema was authored |

**Audit-infrastructure findings:**
- **S6-INFO-7.** ADR-0016's promise to author the routing-config schema appears to have shipped (file present in `schemas/`). Whether the workspace-side instance file (`agent-orchestration/references/skill-routing-config.json`) is actually validated against it on each consumer load was not verified in this audit.

### S7. CI & release infrastructure

| Item | State | Evidence |
|---|---|---|
| `.github/workflows/skill-graph-lint.yml` | present, paths-filtered | runs on push to main + PRs |
| `.github/workflows/publish.yml` | present per `ls` output | not directly read |
| `package.json` files array | OK; explicitly excludes `_archived`, `_drafts`, `research` | lines 32-54 |
| `npm run verify` chain | **RED across 7 gates** | see consolidated table below |
| `engines.node` | `>=20.0.0`; CI runs Node 22 | OK |
| `packageManager: pnpm@9.15.0` | declared | not pinned via `engines.pnpm` |

**CI verify-chain red state (current):**

| Gate | Status | Cause |
|---|---|---|
| `lint` | RED | 154 files × `operation` field rejection (intentional per `f88603d`) + advisory field-purpose-comment + 1 inverted-boundary-reason finding |
| `lint:template` | RED | template still carries `operation:` (per S5-B20) |
| `category:check` | RED | per S3-B16 |
| `protocol:check` | RED on C7 only | per S2e-B12 (generated file stale) |
| `docs:links` | RED | 6 broken anchors (per S2a-B7/B8 + S2e-B12) |
| `docs:drift` | GREEN | clean |
| `mirror:freeze` | GREEN | clean |
| `charter:parity` | WARN only | archived-mirror divergence is expected |
| `stability:check` | GREEN | clean |
| `manifest:validate` | RED | per S3-B17 (manifest schema requires retired fields) |
| `routing-eval` | RED | blocked upstream by manifest validate |
| `export:verify-skill-md` | unknown — runs after marketplace:export | — |
| `marketplace:verify` | RED | per S3-B18 |
| `status:check` | RED | per S2f-B14 + cascades from other red gates |
| `overlap` | GREEN | 0 errors, 31 warnings |
| `test:unit` | RED | per S4-B19 (and chain stops at first fail; later tests not run) |

**CI findings:**
- **S7-B21 (CRITICAL).** `npm run verify` is currently RED. Whether the latest `f88603d` commit was supposed to make it red intentionally (and a corpus-drain PR is supposed to bring it back to green) or whether the drift on the OTHER gates (manifest schema, category check, marketplace export, generated docs) is unrelated drift is the highest-priority disambiguation. The 6 commits in the audit-fix range (`b35d294`, `47e951a`, `79b7a3d`, `c208245`, etc.) immediately before `f88603d` look like they were the *prior* audit's findings being landed. So the recurring SYSTEM state is "verify red until next audit" — the verify chain hasn't been stably green in the recent commits.
- **S7-INFO-8.** CI workflow doesn't have a `paths-ignore` for changes that are CONTENT-only (under `skills/`). Currently CI fires on `skills/**` per the paths filter — but this repo does not contain a `skills/` tree (per ADR-0009 consolidation, post-2026-05-18). So the path filter has a dead entry. Either the path filter should be cleaned up or CI is firing on non-existent paths.

### S8. Package boundary + governance hygiene

| Item | State | Evidence |
|---|---|---|
| `package.json` `dependencies` | empty | line 84 — accurate per AGENTS.md ("scripts use only Node built-ins") |
| `package.json` `devDependencies` | empty | accurate |
| `package.json` `version` | 0.5.10 | matches CHANGELOG and current state |
| `package.json` `files` exclusions | `_archived`, `_drafts`, `research` properly excluded | OK |
| `package.json` `files` inclusions | includes `lib/` (per 0.5.9 entry) | OK |
| `LICENSE` + `NOTICE` + `CODE_OF_CONDUCT.md` + `SECURITY.md` + `CONTRIBUTING.md` | all present | per `ls` |
| `pnpm-lock.yaml` | present | OK |
| `.skill-graph/config.json` | sibling-aware default with `SKILL_GRAPH_WORKSPACE` env override | OK |

**Governance findings:**
- **S8-INFO-9.** Empty `dependencies` + Node-built-ins-only policy is genuinely admirable for a Tier-1 tooling repo. Reduces supply-chain blast radius.

---

## Novelty memo — off-rubric observations (max 10, evidence-tagged)

These observations sit outside the structured-pass rubric above but should not be dropped. Per the rule, evidence-strength tagged.

| # | Claim | Evidence | Strength | format_loss |
|---|---|---|---|---|
| N1 | The user's "work-mode separation" + "schema-hostage" rules predict exactly this audit state — the schema was just changed (SYSTEM commit `f88603d`), but the docs, codemod, ADR, and generated artifacts have not caught up. This is the *correct* steady-state per those rules: ride the red verify chain until the audit-loop drain completes. The danger is leaving the SYSTEM half (ADR-0017 amendment, codemod fix, generated regeneration) unscheduled. | `git log f88603d`, `.claude/rules/version-schema-contract.md § Companion rule`, AGENTS.md § Work Modes anti-patterns table | command-output + direct-file-line | no |
| N2 | The CHANGELOG [Unreleased] tag is the right home for the `f88603d` retire-operation entry; it has not been added. Without it, the next `0.5.11` release notes will tell consumers "v8 mandates subject+operation+scope" while shipping a schema that mandates subject+scope. The `Keep a Changelog 1.1.0` discipline this repo follows treats [Unreleased] as the buffer for exactly this case. | direct read of CHANGELOG lines 9-29 | direct-file-line | no |
| N3 | The `marketplace:verify` failure includes both stale and missing exports — but the missing skill (`expected-value`) is the *same* skill that breaks `manifest:validate` (`#/skills/49`) AND `category:check`. Three failure surfaces all point at one skill that was added recently and didn't fully migrate. A single targeted fix (`expected-value` either becomes v8-correct or gets a `category` value) clears three red gates. | live verify output cross-referenced with `find /Users/jacobbalslev/Development/skills/skills -name 'expected-value' -type d` | command-output | no |
| N4 | ADR-0018 (relations.boundary → relations.suppresses rename) is Accepted but Phase 1 has not shipped (no `relations.suppresses` field in the schema). Stacking another breaking rename on top of an in-flight retire-operation refactor compounds the corpus-drain debt. Sequencing question worth surfacing: does ADR-0018 wait for the operation-drain to complete, or does it land alongside? No commit between today and 0.5.10 hints at the decision. | schema grep for `suppresses` returns 0; ADR-0018 § Phase 1 schedule line "Phase 1 — Schema + tooling (one PR)" | direct-file-line + inference | yes — the rubric did not ask about ADR sequencing |
| N5 | `audits/manifest.json` schema_version is 1 — and the file is the canonical "machine-readable protocol index" for the audit loop. Any version bump on this is a new audit-loop contract. The `audits-manifest.schema.json` should validate it; whether it actually does on each generate-or-edit step was not verified. | direct read of `audits/manifest.json:2`; schema file presence per `ls schemas/` | direct-file-line | yes — rubric did not ask about audit-manifest version discipline |
| N6 | `package.json` does not declare any tests under the `test` script that exercise the schema's allOf branches directly (e.g., "valid `eval_state: passing` skill but missing `eval_artifacts: present` should fail"). The new M5 coherence rule (S1 row in S1) is a great schema-level guard but has no test coverage that I can verify from the test-script chain. The recently-added `test-verify-gate-scripts.js` (per `test:unit` chain) might cover this; not directly read. | grep of `package.json:79` test:unit chain | inference | yes |
| N7 | The "two-physical-encodings" reality (protocol-native flat + Agent-Skills-compatible nested) is documented honestly in SKILL_METADATA_PROTOCOL.md lines 49-67, but the `normalizeFrontmatter()` reconciliation is single-source — if a future encoding diverges (e.g., a new public marketplace format) the protocol cannot accept it without adding a third branch. The current shape is fine; the structural risk is that the normalizer is a private function with no schema declaring valid input encodings. | direct read of SKILL_METADATA_PROTOCOL.md § Overview | inference + direct-file-line | yes — rubric scoped to existing surfaces |
| N8 | `lib/audit/` standalone-package violation (S4-B19) was caught by an explicit test that someone wrote on purpose. That is exemplary defensive engineering — the test itself is the evidence that the team has internalized the ADR-0009 promise. The test failing today is not "the test is broken" — it is "the test is correct and the cleanup is incomplete." | `test:unit` output naming the test by failure | command-output | no |
| N9 | The 31 keyword-overlap warnings in `overlap` are intentionally warn-not-fail (per the overlap script's design philosophy of "shared keywords are RECALL, not duplicates"). This is a good calibration: a CI gate that hard-failed on every overlap would force the corpus to either pick a winner per keyword (losing recall) or invent jargon (losing readability). The current design preserves both — but it does mean reading the warnings has to be in someone's loop. Currently the warnings are emitted, not tracked. | command-output: 154 skill(s) analyzed, 0 error(s), 31 warning(s) + overlap script header | command-output | yes — rubric did not ask about warn-tier tracking discipline |
| N10 | The Doc Ownership Map (AGENTS.md § Doc Ownership Map, ~70 lines) is exceptional — it solves the recurring "which of 30+ docs owns concept X?" failure mode by declaring canonical homes. But the map IS itself a 70-line section of AGENTS.md, which is the same file that gets edited the most. The risk is that the map becomes the bottleneck (it must be edited correctly for any new concept) and then drifts. A linter that grep-asserts every doc-canonical-claim mentioned in the map actually maps to a single canonical doc on disk would close that loop. The `check-protocol-consistency.js` could plausibly grow this check. | direct read of AGENTS.md § Doc Ownership Map; mental simulation of the failure mode it prevents | inference | yes — rubric covered ADRs but not the meta-doc-routing layer |

**format_loss flag (audit-level):** The rubric I structured around (Tier 1 → Tier 5 → CI → governance) covers the file/script surfaces but doesn't have a row for *operating-discipline* concerns like N4 (ADR sequencing), N6 (allOf test coverage), N9 (warn-tier drift over time), and N10 (meta-doc-routing linter). These belong on the structured rubric for the next SYSTEM audit.

---

## Dissent-or-abstain

Per the structured-pass + novelty-memo rule, an evidence-backed disagreement with the implied frame of this task, or an explicit abstain.

**Dissent point.** The audit frame "audit the SYSTEM side end-to-end" implies that a clean SYSTEM should produce a green `npm run verify`. After reading the work-mode-separation doctrine, the version-labels-are-earned rule, and the schema-hostage companion rule, I believe the *correct* SYSTEM state for this repo IS a temporary red `verify` chain whenever a schema-breaking change lands, until the audit-loop drains the corpus. Insisting on always-green verify would force exactly the anti-pattern AGENTS.md § Work Modes anti-patterns table warns against ("Bumping `schema_version` in `skill.schema.json` AND manually editing N SKILL.md files in the same commit"). So the right SYSTEM critique is not "verify is red — fix it now" but "verify is red — which red gates are intentional drain-pending state, which are SYSTEM regressions, and which are unrelated drift?"

The table in S7 attempts that decomposition explicitly. Some rows (lint, lint:template) are intentional drain-pending. Others (manifest:validate failing on schema, category:check stale, S3-B15 codemod bug, S3-B17 manifest-schema unrebased, marketplace:verify drift, generated-docs staleness) are SYSTEM cleanup the `f88603d` commit did not include — these are unfinished SYSTEM work, not corpus drain.

**Where I'd push back on a naive read of the findings table:** none of the "stale generated artifact" findings (S2e-B12, S2f-B14, status:check) should be filed as defects worth the user's attention as separate tickets. They are mechanical regenerations — one PR that runs the four `build-*.js` scripts and commits the output clears 4-6 red gates simultaneously. Listing them as 6 distinct findings risks the user thinking they are 6 separate work items. They are not.

**Where I would NOT abstain:** S1-B1 + S2a-B5 + S2b-B9 + S2c-B10 + S2d-B11 (the operation-retire propagation gap) and S3-B15 (codemod bug) and S4-B19 (lib/audit standalone-boundary) are real SYSTEM debt that the next audit will find again if not scheduled. ADR-0017 amendment (S2d-B11) is the one finding that, if dropped, leaves the protocol's binding-decision register actively lying about a structural axis.

---

## Completeness claim

**Examined 27 SYSTEM surfaces:**

- Schema (1): `schemas/skill.schema.json`
- Audit-manifest + lane + comprehension/audits-manifest/routing-config schemas (4): `audits/manifest.json`, `audits/lanes.json`, `schemas/comprehension.schema.json` (presence-only), `schemas/audits-manifest.schema.json` (presence-only), `schemas/routing-config.schema.json` (presence-only)
- Canonical normative docs (3): `SKILL_METADATA_PROTOCOL.md`, `SKILL_AUDIT_LOOP.md`, `SKILL_GRAPH.md`
- Workspace + repo agents files (2): `CLAUDE.md`, `AGENTS.md`
- ADRs (5 read full + 13 enumerated by title): 0009, 0015, 0016, 0017, 0018 full; rest enumerated
- Generated mirrors (2 indirectly via gate output): `docs/field-reference.generated.md`, `docs/status.generated.md`
- Tier 3 enforcement scripts (10 run / listed): lint, lint:template, category:check, protocol:check, docs:links, docs:drift, mirror:freeze, charter:parity, stability:check, manifest:validate, marketplace:verify, overlap, audit-manifest:check, status:check
- Tier 4 consumer tooling (1 directory listed + 1 boundary test interpreted): `lib/audit/`, `lib/audit/graders/`, test-lib-audit-smoke output
- Tier 5 specimens (1 directory listed; fixtures presence-confirmed): `examples/fixture-skills/`
- CI + package (3): `.github/workflows/skill-graph-lint.yml`, `package.json`, `.skill-graph/config.json`
- Live operational state (6 counts verified): canonical SKILL.md count, marketplace count, comprehension/application artifact counts, git status, recent commit history
- One commit drilldown: `f88603d` full diffstat + message

**Findings reported: 21 lettered findings (B1–B21) + 9 INFO observations + 10 novelty-memo claims + 1 dissent block.**

**Items excluded with reason:**
- ADR 0001-0008, 0010, 0013 — out of scope for SYSTEM end-to-end (older accepted decisions, not currently load-bearing on the f88603d question). Spot-check from the index suggests they're stable; not opened.
- `scripts/skill-graph-route.js`, `scripts/skill-graph-drift.js` internals — confirmed present; per-script logic not deeply read in this budget. Their consumer-tier role (Tier 4) is described in `SKILL_GRAPH.md` and not directly contradicted by current evidence.
- Individual SKILL.md content drift — explicitly CONTENT work, out of scope per user's "SYSTEM side" declaration.
- `examples/fixture-skills/*` SKILL.md frontmatter — presence verified, content not read.
- `lib/audit/*.js` internal logic beyond what `test:unit` revealed — would require deeper read budget than this audit allocated.
- `scripts/skill-graph-routing-eval.js` internals — blocked upstream by manifest:validate failure; would be next read budget.
- `examples/exports/`, `examples/evals/` — listed, not read.
- The `skill-graph/audits/prompts/skill-audit-loop-*.md` runner prompt files — present per `ls`, not deeply read against the most recent doctrine.
- The `data/publication-classification.json` ledger — not directly read; not load-bearing for SYSTEM correctness.
- Skill router config (`agent-orchestration/references/skill-routing-config.json`) — workspace surface, out of `skill-graph/` SYSTEM scope.

**This report is complete to the depth of this read budget. Further SYSTEM audits should pick up: ADR sequencing (N4), allOf test coverage (N6), warn-tier tracking discipline (N9), and meta-doc-routing linter (N10).**

---

## Recommended next moves (deprioritization layer — user decides)

These are NOT filed as Linear tickets — per the user's "no filtering, no meta-tasks, but also no permission-asking-for-trivial-actions" rules, the report itself is the deliverable. Below is the *suggested* ordering for the user to redirect if helpful:

1. **Decide ADR-0017's status.** Amendment block ("§ Update — 2026-05-27: operation field retired, see SKILL_METADATA_PROTOCOL.md § Schema contract") OR a new ADR-0019 superseding only the operation axis. Without this the binding decision register is broken.
2. **Add CHANGELOG [Unreleased] entry** for the `f88603d` retire-operation refactor + the 5 doctrinal changes. Reuses the existing CHANGELOG discipline; ~30 lines.
3. **One mechanical regenerate PR.** Runs `node scripts/build-field-reference.js && node scripts/build-status-doc.js && node scripts/export-marketplace-skills.js`. Path-limited commit. Clears 4-6 red gates simultaneously.
4. **Fix `scripts/migrate-skill-v7-to-v8.js`** so it does not author `operation:` on migrated skills (per S3-B15). One-line refactor; needed before any v7-to-v8 corpus drain runs.
5. **Update `schemas/manifest.schema.json`** to align with the v8 (operation-retired) classification — drop `category`/`type` from required if still present (per S3-B17). Needed to unblock `manifest:validate` and `routing-eval`.
6. **Update `scripts/lint/check-category-enum.js`** to make `category` truly conditional (skip skills that don't declare it) or retire the script (per S3-B16). Needed to unblock `category:check`.
7. **Update `examples/skill-metadata-template.md`** to remove `operation:` (per S5-B20) so new-skill authoring works post-`f88603d`. Or hold lint:template back from `npm run verify` during the corpus drain. The template is the canonical scaffolding source — fixing it should NOT wait for corpus drain.
8. **Sweep AGENTS.md § Skill Metadata Protocol Quick Reference, SKILL_METADATA_PROTOCOL.md § Required fields + § Schema contract, SKILL_AUDIT_LOOP.md § Part 2 § 1, SKILL_GRAPH.md § Current State row 1, and `docs/field-reference.md`** to strip the `operation` claims (per S1-B1 cluster). Document-routing-map says SKILL_METADATA_PROTOCOL.md is the canonical normative spec; sweep there first, then propagate.
9. **Schedule `lib/audit/` standalone-package boundary repair** (per S4-B19). The test is the canonical failure detector; once `lib/audit-shared/roots.js` (copy of `scripts/lib/roots.js`) lands and the 4 hardcoded `REPO_ROOT` files reference it, test goes green.
10. **Schedule a separate ADR-0018 sequencing decision** (per N4): before or after the operation drain?

Items 3 + 8 are independently the highest-leverage. The rest are real but smaller. None of these should be filed as tickets without confirmation; the report IS the artifact.

---

## Audit metadata

- **Author:** Claude Opus 4.7 (1M context)
- **Started:** 2026-05-27 (~12 hours after commit `f88603d`)
- **Methodology:** SETUP + STRUCTURED PASS (S1-S8) + NOVELTY MEMO (10 claims, evidence-tagged) + DISSENT + COMPLETENESS CLAIM, per `~/Development/.claude/rules/prompt-shape-structured-plus-novelty.md`.
- **Reads:** 27 SYSTEM surfaces (full file reads where stated, presence-only where stated).
- **Live gate runs:** 16 of 17 `npm run <gate>` commands executed; output evidenced inline.
- **Companion audit:** `system-audit-2026-05-27.md` referenced in ADR-0016 § Status was not found on disk in this session; this report is a follow-up and may overlap with whatever that file recorded. Cross-reference if/when it surfaces.
