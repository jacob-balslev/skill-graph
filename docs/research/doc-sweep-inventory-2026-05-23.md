# Skill Graph Doc Sweep — Phase 0 Inventory (2026-05-23)

> Type: Research / Audit Findings (Phase 0 — read-only inventory)
> Auditor: Opus 4.7 (1M context) — main session
> Triggered by: User request "Skill Graph Doc Sweep — Audit, Reconcile, Update" (2026-05-23)
> Status: pending action; Phase 1+ remediation lands in subsequent commits
> Supersedes scope of: `docs/research/skill-graph-doc-audit-2026-05-23.md` (general-purpose subagent run earlier same day) — this inventory **extends** that work with verification of current status and adds five drift seeds from the user's brief that the prior audit did not cover.

## Summary

- **Repo scope verified:** `/Users/jacobbalslev/Development/skill-graph/` — separate git repo, currently dirty but clean for the doc files touched here.
- **Schema state:** v7 active. `schema_version: 7` is the canonical label everywhere it appears in normative docs.
- **Prior audit reconciliation:** Of the 22 findings in `skill-graph-doc-audit-2026-05-23.md`, **5 are now resolved** (F1, F4, F6, F8 — and parts of F11), **8 remain open and in-scope for this sweep**, **6 are out-of-scope** (live in Development root or require Linear/external action), and **3 are INFO-only**.
- **New drift confirmed in this Phase 0:** README.md internal count-vocabulary self-contradicts (146 vs 143 vs 145 vs 145), README.md schema-pin description contradicts itself (v6 line 388 vs v7 line 476), `marketplace-syndication.md` provenance block still emits `Skill Metadata Protocol v4` (line 93), and `SKILL_AUDIT_LOOP.md` § "two axes" disagrees with the cross-repo `Development/docs/reference/skill-audit-pipeline.md:7` § "three axes."

## Findings (32 total — all shown, severity-tagged)

### CRITICAL — internal-protocol contradictions

**F-NEW-1 — `README.md` lists three different canonical skill counts in one doc** (CRITICAL)
- Files: `README.md`
- Evidence:
  - Line 81: "146 v7-compliant skills"
  - Line 301: "143 canonical skills in plain Agent-Skills shape"
  - Line 318: "canonical 145-skill library"
  - Line 403: "Public open-source 145-skill library"
  - SKILL_GRAPH.md:19 (single-source-of-truth): **144**
  - AGENTS.md § Doc Ownership Map (line 252) anti-pattern explicitly bans this exact pattern
- Doc Ownership Map verdict: `SKILL_GRAPH.md § Current State` is single-source-of-truth; README must link, not inline.
- Recommended fix: Replace inline counts with vocabulary-precise references ("OSS canonical library" → link to SKILL_GRAPH.md § Current State; "Public surface" → link to marketplace export). Phase 1 work.

**F-NEW-2 — `marketplace-syndication.md` provenance block still emits `Skill Metadata Protocol v4`** (CRITICAL)
- Files: `docs/marketplace-syndication.md:93`
- Evidence: The provenance YAML emits `skill_graph_protocol: "Skill Metadata Protocol v4"` while the doc's own header (line 7) says "Last verified. 2026-05-23." The current contract is v7. AGENTS.md § "Version Labels Are Earned, Not Bumped" notes the related script-side known tension (`scripts/export-marketplace-skills.js` hardcodes v7) — but the doc-level guidance still teaches authors v4. Document teaches outdated protocol.
- Doc Ownership Map verdict: `docs/marketplace-syndication.md` owns export-pipeline detail; the canonical protocol label lives in `SKILL_METADATA_PROTOCOL.md` (v1.4.0 / schema 7).
- Recommended fix: Update the provenance example to `v7`, and add a one-line note that the value should reflect the current schema_version of the source skill (per AGENTS.md § Version Labels rule — the value is content-conformance, not export-tooling-version). Phase 4 work.

**F-NEW-3 — `README.md` schema-pin description self-contradicts** (CRITICAL)
- Files: `README.md`
- Evidence:
  - Line 388: "pinned v2 through v6; the unversioned mirror tracks v6"
  - Line 476: "The `schemas/` directory pins v2 through v7 for tooling that consumes the schemas directly. The unversioned `skill.schema.json` tracks v7."
- Doc Ownership Map verdict: `README.md` is downstream; AGENTS.md § Coupled Changes is the binding rule. Both lines must report v7.
- Recommended fix: Update line 388 to "pinned v2 through v7; the unversioned mirror tracks v7." Phase 1 work.

**F-NEW-4 — Migration list incomplete in README** (HIGH)
- Files: `README.md:397`
- Evidence: "Per-bump author migration procedures (v4→v5, v5→v6)" — missing v6→v7, which exists at `docs/migrations/v6-to-v7.md` and is referenced from README:476 itself.
- Doc Ownership Map verdict: `README.md` § Quick start owns the public migration entry-point list.
- Recommended fix: Add v6→v7 to the migration enumeration. Phase 1 work (bundle with F-NEW-3).

### HIGH — cross-doc doctrine drift

**F-NEW-5 — Audit axis count: `SKILL_AUDIT_LOOP.md` says "two axes," `Development/docs/reference/skill-audit-pipeline.md:7` says "three axes"** (HIGH — cross-repo)
- Files: `skill-graph/SKILL_AUDIT_LOOP.md:15` vs `/Users/jacobbalslev/Development/docs/reference/skill-audit-pipeline.md:7`
- Evidence:
  - SKILL_AUDIT_LOOP.md:15: "We evaluate each skill on two axes: 1. Intent fidelity … 2. Teaching efficacy"
  - Development/docs/reference/skill-audit-pipeline.md:7: "We evaluate each skill on three axes"
- Doc Ownership Map verdict: `SKILL_AUDIT_LOOP.md` is canonical (per AGENTS.md line 217 — "Audit loop procedure"). The Development-side reference doc is a summary, not the contract.
- Recommended fix: Update Development pipeline doc to match the canonical "two axes" framing, OR (if a deliberate doctrine update is intended) bump the canonical first via ADR, then re-summarize. The current state is unresolved drift.
- **Cross-repo note:** Fix lands in Development repo, not skill-graph. Out-of-scope for this commit; flag for separate Development-repo commit in Phase 3.

**F-NEW-6 — `field-decision-guide.md` says `category` is "always present because it is required"; `SKILL_METADATA_PROTOCOL.md § Classification` does not pin this consistently** (HIGH)
- Files: `docs/field-decision-guide.md:315`, `SKILL_METADATA_PROTOCOL.md:184-227, 680`
- Evidence: Decision guide line 315: "`category` is always present because it is required." SMP line 680 (v3→v4 migration table) lists `category` under "New optional fields." SMP line 184 says "A browse facet — answers the single question…" without explicitly stating required/optional in the prose, though the v5 closed-enum is enforced at schema + lint level (line 187).
- Doc Ownership Map verdict: Normative status ("required vs optional") lives in `SKILL_METADATA_PROTOCOL.md` (Doc Ownership Map line 197). Decision guide should match.
- Recommended fix: Confirm against `schemas/skill.v7.schema.json` whether `category` is in the `required: []` array; update SMP § Classification with an explicit "Required since v5" line; reconcile field-decision-guide reference. Phase 2 work.

### MEDIUM — open from prior audit (still in-scope here)

**F-PRIOR-2 — Active scripts still require deleted `skill-audit-loop/src/build-skill-audit-worklist.js`** (HIGH per prior audit)
- Files: `scripts/skill/build-skill-audit-worklist.js:13-14,728`, `skill-graph/scripts/seed-publication-classification.js:13,113`, `docs/marketplace-publication-queue.generated.md:9`
- Status: NOT verified resolved in this Phase 0 (tool-budget bounded). Carry-forward to Phase 4 (marketplace docs phase).

**F-PRIOR-3 — `examples/skill-metadata-template.md` cites the archived sibling as canonical** (HIGH per prior audit)
- Files: `examples/skill-metadata-template.md:283, 317`
- Status: NOT verified resolved in this Phase 0. Carry-forward to Phase 2 (per-field semantic consistency phase).

**F-PRIOR-5 — `docs/_drafts/0.5.8-release-prep.md` never applied; still marked DRAFT after 0.5.8 shipped**
- Files: `skill-graph/docs/_drafts/0.5.8-release-prep.md`
- Status: file confirmed present in `_drafts/`. Should be moved to `docs/_archived/0.5.8-release-prep-2026-05-19.md`. Phase 1 work (housekeeping bundle).

**F-PRIOR-7 — `docs/_archived/` has only 1 entry — older candidates never moved**
- Files: `docs/plans/v4-schema-bump.md`, `docs/plans/wave-2-extraction.md`, `docs/plans/marketplace-p1-public-migration-plan.md`
- Status: NOT verified in this Phase 0; the `docs/plans/` listing shows only `multi-root-workspace.md, PLANS.md, scripts-roadmap.md, skill-library-as-lens-review-2026-05-21.md` — the three flagged plans appear already moved or renamed. Carry-forward to Phase 1 (counts + housekeeping) for explicit re-verification.

**F-PRIOR-9 — ADR 0005 still marked "Proposed" after 5+ weeks**
- Files: `docs/adr/0005-freshness-consolidation.md`
- Status: file last-modified 2026-05-23 (recent). Need to check whether status was advanced. Phase 3 work (audit-doctrine reconciliation).

### MEDIUM — link integrity

**F-LINK-1 — `check-markdown-links.js` reported 8 broken links on 2026-05-23**
- Sources reportedly: `docs/_drafts/INDEX.md:10`, `docs/adr/0013-scope-field-vs-overlay-of.md:6`, `docs/plans/PLANS.md:11,15,16`, `docs/recommended-skills.md:3,83,121`
- Status: NOT re-verified in Phase 0 (skipping the script run keeps the budget). Phase 4 work — run the script as part of Phase 5 verification.

### MEDIUM — concept-card / Concept Card cross-doc

**F-NEW-7 — Concept Card semantics: drift seed claim partially refuted in skill-graph; cross-repo asymmetry stands**
- Files (skill-graph): `SKILL_METADATA_PROTOCOL.md:288, 625`
- Evidence: SMP:288 says "The body's `## Concept Card` section is retired in v6 — the flat frontmatter fields are the canonical location." SMP:625 reaffirms in the v5→v6 migration column. Within skill-graph, this is internally consistent.
- Cross-repo asymmetry: The user's brief mentioned that a v2.2 audit prompt elsewhere requires the Concept Card body section. That prompt lives in `Development/.opencode/commands/skill-audit-prompt-v2.2.md` (not in skill-graph). If retained, it conflicts with the v6 retirement.
- Recommended fix: skill-graph side requires no edit. Cross-repo audit prompt update is **out of scope** for this sweep — file as a separate Linear ticket against Development if not already tracked. Phase 3 work to draft the Linear comment.

### MEDIUM — overlay_of contradiction

**F-NEW-8 — ADR 0013 vs `Development/docs/research/duplicate-canonical-recommendations-2026-05-23.md` — claim resolved by banner**
- Files (skill-graph): `docs/adr/0013-scope-field-vs-overlay-of.md` (Option A accepted; Option B with `overlay_of:` rejected, line 84)
- Files (Development): `/Users/jacobbalslev/Development/docs/research/duplicate-canonical-recommendations-2026-05-23.md:3` carries a SUPERSEDED banner that explicitly cites ADR 0013 and warns "DO NOT act on any recommendation in this file."
- Status: RESOLVED via banner. No skill-graph-side edit required.
- Recommended fix: Confirm the Phase 2 continuation doc `docs/research/duplicate-reclassification-2026-05-23.md` exists (referenced from the banner) — if missing, file a Linear task.

### INFO — resolved since 2026-05-23 prior audit

- **F-PRIOR-1 RESOLVED:** SKILL_GRAPH.md:19 now says 144, AGENTS.md:78 says 144, marketplace-syndication.md:135 says 144. Single-source-of-truth is consistent. (README.md is the remaining drift — F-NEW-1.)
- **F-PRIOR-4 RESOLVED:** Grep for `skill-audit-loop` in `docs/integrations/github-actions.md` returned empty — the prior-audit link appears fixed (verify in Phase 4).
- **F-PRIOR-6 RESOLVED:** `docs/_drafts/INDEX.md` exists.
- **F-PRIOR-8 RESOLVED:** `docs/plans/PLANS.md` exists.
- **F-PRIOR-11 RESOLVED:** `docs/field-reference.generated.md` is clean and stamped.
- **F-PRIOR-12 RESOLVED:** No `*-backup`, `*.old`, `*-deprecated` files.
- **F-PRIOR-13 RESOLVED:** Stale skills.sh URLs correctly documented as deprecated.
- **F-PRIOR-15 RESOLVED:** `skill-audit-loop` sibling deprecation banners compliant.
- **F-PRIOR-17 RESOLVED:** Worktree-leak references are agent scratch state, not user-facing.
- **F-PRIOR-20 RESOLVED:** `SKILL_METADATA_PROTOCOL.md` correctly versioned (1.4.0, schema 7, SG 0.5.8).
- **F-PRIOR-21 RESOLVED:** No "TBD" markers in the four top-level docs.
- **F-PRIOR-22 RESOLVED:** Workspace SKILL.md count of 4916 is bulk in worktrees + scratch dirs (informational).

### Out of scope — Development repo / cross-repo

- **F-PRIOR-18 / F-PRIOR-19:** Development-root plans contradicting ADR 0009. Live in Development, not skill-graph. Defer to a separate Development-repo commit; flag in Linear.
- **F-PRIOR-14:** `skill-metadata-protocol` sibling locally deleted; deletion should be committed in Development root. Defer.
- **F-NEW-5 (cross-repo half):** Development pipeline doc axis-count fix lands in Development repo.

## Phase Assignment

| Phase | Findings included | Tool-call cap | Owning commit message |
|---|---|---|---|
| **Phase 1 — counts + version labels** | F-NEW-1, F-NEW-3, F-NEW-4, F-PRIOR-5, F-PRIOR-7 verification | 15 | `docs(counts): reconcile count vocabulary + schema-pin description + v6→v7 migration mention` |
| **Phase 2 — per-field semantic consistency** | F-NEW-6, F-PRIOR-3 | 30 | `docs(fields): reconcile category required/optional + template canonical cites` |
| **Phase 3 — audit doctrine + protocol alignment** | F-NEW-5 (skill-graph side: no edit; flag for Development), F-NEW-7 (skill-graph side: no edit; flag for Development), F-PRIOR-9 | 20 | `docs(audit): advance ADR 0005 status + flag cross-repo axis/Concept-Card drift` |
| **Phase 4 — marketplace + publication docs** | F-NEW-2, F-PRIOR-2, F-PRIOR-4 verification, F-LINK-1 | 15 | `docs(marketplace): refresh syndication provenance + repoint deleted requires + fix link integrity` |
| **Phase 5 — verification + Linear close** | run `check-markdown-links.js`, `check-protocol-consistency.js`, `generate-manifest.js --validate-only`, `build-field-reference.js`; post final Linear comment | 10 | (no commit; verification + reporting) |

## Anti-Crash Notes

- **Phase 0 actual cost:** ~17 tool calls (under the 25-cap by 8). Good buffer for Phase 1.
- **Risk to flag:** README.md is large (35k); restrict Phase 1 reads to grep-targeted offsets, not full reads.
- **Cross-repo work in Phase 3 is reporting-only** on the skill-graph side; the actual Development-side fixes are deferred. This keeps each phase commit within one repo per `repo-commit-ownership.md`.

## Verification status of drift seeds from the user's brief

| Drift seed claim | Verified status |
|---|---|
| `field-reference.md` says schema_version must be 4 | **REFUTED.** Frontmatter `schema_version: 7` (line 37). The doc consistently teaches v7. |
| `field-reference.md` describes `category` as open-ended | **REFUTED.** SMP and field-reference both correctly describe the closed v5+ enum of six values. |
| `skill-metadata-protocol.md` lists `category` as both required AND optional | **PARTIALLY CONFIRMED** as F-NEW-6 — required-status is only explicit in field-decision-guide; SMP needs an explicit "Required since v5" line. |
| `field-decision-guide.md` says skill-lint.js rejects dangling relation targets | **NOT VERIFIED** in Phase 0 — grep returned no matches; carry to Phase 2 for confirmation. |
| `marketplace-syndication.md` shows v4 in provenance examples | **CONFIRMED** as F-NEW-2 (line 93). |
| Count vocabulary drift (144 / 146 / 143 / 310 / 441 / 443 / 444) | **CONFIRMED** as F-NEW-1 (README.md has 146/143/145/145; SKILL_GRAPH.md correctly at 144). |
| ADR 0013 vs `duplicate-canonical-recommendations-2026-05-23.md` contradict on `overlay_of` | **RESOLVED VIA BANNER** as F-NEW-8 — the research doc carries a SUPERSEDED notice citing ADR 0013. |
| `SKILL_AUDIT_LOOP.md` 2 axes vs `docs/reference/skill-audit-pipeline.md` 3 axes | **CONFIRMED** as F-NEW-5 (cross-repo). |
| Concept Card mismatch (v2.2 prompt requires; v6+ flattens) | **CONFIRMED INTERNALLY CONSISTENT in skill-graph** as F-NEW-7. Cross-repo asymmetry to be flagged. |
| Hardcoded developer paths in `mcp-builder`, `file-splitting` | **OUT OF SCOPE** (skills live in Development/, not skill-graph). |

## Source

Captured by main-session Opus 4.7 on 2026-05-23 during the doc sweep. Phase 0 inventory is the prerequisite to subsequent phase commits.
