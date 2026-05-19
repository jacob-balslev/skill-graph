# Migration: schema_version 6 → 7

> **Status:** Active. Created 2026-05-19.
> **Breaking shape change.** v7 removes the v6 `audit_verdict` field and replaces it with four discrete verdict fields. Coupled with this is a doctrine change about which form checks produce a verdict at all — internal style preferences no longer set `structural_verdict`. See [ADR 0011](../adr/0011-split-audit-verdict-into-four-verdicts.md) for the full rationale.
> **Plan:** the SYNTHESIS document at `~/Development/.roundtable/skill-audit-2026-05-19/SYNTHESIS.md` (Skill Graph workspace) drives the outer roadmap. This migration corresponds to SYNTHESIS §6 Step 1.

## What changed

### 1. The single `audit_verdict` field is removed and replaced by four verdicts

**v6 Health Block:**

```yaml
# v6 — single aggregate verdict
schema_version: 6
last_audited: 2026-05-17
last_changed: 2026-05-15
audit_verdict: PASS                # PASS | PASS_WITH_FIXES | PARTIAL | FAIL | UNKNOWN
eval_score: 4.2
eval_failed_ids: []
lint_verdict: PASS
drift_status: OK
```

**v7 Health Block:**

```yaml
# v7 — four discrete verdicts
schema_version: 7
last_audited: 2026-05-17
last_changed: 2026-05-15
structural_verdict: PASS           # PASS | PASS_WITH_FIXES | FAIL | UNVERIFIED
truth_verdict: PASS                # PASS | DRIFT | BROKEN | UNVERIFIED
comprehension_verdict: UNVERIFIED  # PASS | SHALLOW | REDUNDANT | UNVERIFIED |
                                   # SKIPPED_BASELINE_HIGH | NA
application_verdict: UNVERIFIED    # APPLICABLE | REDUNDANT | HARMFUL | MIXED |
                                   # FALSE_POSITIVE | UNVERIFIED
eval_score: 4.2
eval_failed_ids: []
lint_verdict: PASS                 # retained — per-script signal
drift_status: OK                   # retained — per-script signal
```

Each new verdict is scoped to one layer of the audit pipeline:

| Verdict | Scope | What it certifies | Written by |
|---|---|---|---|
| `structural_verdict` | Form (gates 1–2, 7) | Skill is exportable: external-constraint shape (1024-char description, required fields, valid YAML, Anthropic Agent Skills schema) | `scripts/skill/skill-evolution-loop.js` audit phase |
| `truth_verdict` | Truth (gates 3–6) | Truth sources align with declared `last_verified` and recorded hashes | `scripts/skill/skill-evolution-loop.js` audit phase (rolls up `drift_status`) |
| `comprehension_verdict` | Recitation (gate 8, demoted) | Optional: the foundation model has the concept. `SKIPPED_BASELINE_HIGH` is the expected verdict for any concept the model already knows from training. | `scripts/skill/evaluate-skill.js --comprehension` |
| `application_verdict` | Behavior (gate 9) | Loading the skill changes agent behavior on real artifacts. The only field that certifies the skill is **useful**. | `scripts/skill/evaluate-skill.js --application` |

`lint_verdict` and `drift_status` are retained unchanged — they remain the per-script signals that `structural_verdict` and `truth_verdict` roll up from. Tools that read `lint_verdict` directly continue to work.

### 2. Form-gate authority narrows to external constraints

Pre-v7, every check in `scripts/skill-lint.js` and `scripts/lint/*.js` could produce a `lint_verdict: FAIL` that propagated into the aggregate `audit_verdict`. Post-v7, lint checks fall into two tiers:

| Tier | Examples | Effect |
|---|---|---|
| **External-constraint compliance** | description > 1024 chars (marketplace limit); missing required fields; invalid YAML; name not present; Anthropic Agent Skills required-fields schema | Sets `structural_verdict: FAIL`. Hard gate. |
| **Internal style** | title length below the external limit; body section structure; comment style; internal naming preferences; header hierarchy beyond what Anthropic enforces | **Warnings only.** Never sets `structural_verdict: FAIL`. Surfaced in console output and optionally in a separate `style_warnings` field if useful telemetry; otherwise informational. |

The redirect rule: if a check exists because Anthropic's API, OpenAI's API, or the marketplace export pipeline rejects skills that violate it, the check is structural. If a check exists because someone wrote down an internal style preference, it is a warning.

**This commit does not yet implement the lint demotion.** The schema accepts the new doctrine; reclassifying every existing lint check is a follow-up task tracked in Linear. Until that task lands, `structural_verdict` is conservatively rolled up from the legacy `lint_verdict` — which means skills whose only "FAIL" is internal style still show `structural_verdict: FAIL` for now. The follow-up commit will demote those to PASS.

### 3. `application_verdict` is the primary quality signal

The audit loop's "is this skill good?" authority moves from form to behavior. Specifically:

- `application_verdict == APPLICABLE` is the only verdict that certifies a skill is useful.
- The other three verdicts (`structural_verdict`, `truth_verdict`, `comprehension_verdict`) are necessary infrastructure — the skill loads, exports cleanly, and the model has the concept — but they do not certify usefulness.
- The walker (`scripts/skill/skill-evolution-loop.js`) reads `application_verdict` first when picking the next skill. Skills with `application_verdict: UNVERIFIED` and high routing centrality get priority for application-eval authoring.
- The honest default for the v6→v7 corpus is `application_verdict: UNVERIFIED` — no skill has been audited via gate 9 yet, so claiming `APPLICABLE` would be a lie.

See [ADR 0011](../adr/0011-split-audit-verdict-into-four-verdicts.md) Change 3 for the full rationale.

## Migration procedure

### Forward (v6 → v7)

Run the codemod from the canonical workspace root (`~/Development/`):

```bash
# Dry-run (default) — shows what would change without writing
node skill-graph/scripts/migrate-skill-v6-to-v7.js --dry-run skills

# Single skill dry-run
node skill-graph/scripts/migrate-skill-v6-to-v7.js --dry-run --skill cognitive-load-theory

# Apply across the whole canonical skills repo (284 active + 52 archived)
node skill-graph/scripts/migrate-skill-v6-to-v7.js --apply skills

# Apply against a specific path
node skill-graph/scripts/migrate-skill-v6-to-v7.js --apply skills/cognitive-load-theory/SKILL.md
```

The codemod:

1. Adds `schema_version: 7` immediately after the opening `---` if absent, or bumps `schema_version: 6` → `7` in place.
2. Removes the `audit_verdict:` line if present.
3. Inserts the four new verdict lines at the position where `audit_verdict` was, or after `last_changed:` if no `audit_verdict` existed.
4. Derives initial verdict values conservatively from existing per-script signals:
   - `lint_verdict: PASS` → `structural_verdict: PASS`
   - `lint_verdict: FAIL` → `structural_verdict: FAIL`
   - else, falls back to the prior `audit_verdict` if present (`PASS` → PASS, `PASS_WITH_FIXES` → PASS_WITH_FIXES, `PARTIAL` → PASS_WITH_FIXES, `FAIL` → FAIL, else UNVERIFIED).
   - `drift_status: OK` → `truth_verdict: PASS`
   - `drift_status: DRIFT` → `truth_verdict: DRIFT`
   - `drift_status: BROKEN` → `truth_verdict: BROKEN`
   - else (`STALE`, `NO_BASELINE`, `EXTERNAL_UNHASHED`, `UNKNOWN`, missing) → `truth_verdict: UNVERIFIED`
   - `comprehension_verdict: UNVERIFIED` (the demoted gate 8 will populate this on next run)
   - `application_verdict: UNVERIFIED` (no skill has been audited via gate 9 yet; this is the honest state)

The codemod skips two paths by default to avoid corrupting generated mirrors:

- `~/Development/skills/skills/` — the categorized marketplace export. Regenerated post-migration by `scripts/export-marketplace-skills.js`.
- `~/Development/skill-graph/marketplace/skills/` — the skill-graph staging surface. Same regeneration path.

### Reverse (v7 → v6, for rollback only)

The migrator supports `--reverse` for rollback and round-trip testing:

```bash
# Reverse a single skill (lossy — see below)
node skill-graph/scripts/migrate-skill-v6-to-v7.js --reverse --apply --skill cognitive-load-theory

# Reverse the corpus
node skill-graph/scripts/migrate-skill-v6-to-v7.js --reverse --apply skills
```

Reverse mapping:

| v7 state | v6 `audit_verdict` |
|---|---|
| `structural_verdict: FAIL` OR `truth_verdict: BROKEN` | `FAIL` |
| `structural_verdict: PASS_WITH_FIXES` OR `truth_verdict: DRIFT` | `PASS_WITH_FIXES` |
| `structural_verdict: PASS` AND `truth_verdict: PASS` | `PASS` |
| All four verdicts UNVERIFIED (or NA) | `UNKNOWN` |
| Mixed (some PASS, some UNVERIFIED) | `PARTIAL` |

**Reverse is lossy by construction.** The four v7 verdicts collapse back into one v6 verdict. Specifically:

- `comprehension_verdict` and `application_verdict` are discarded on reverse — v6 has no equivalent fields.
- `structural_verdict: PASS` and `truth_verdict: PASS` together produce `audit_verdict: PASS`. But a v6 skill that originally had `audit_verdict: PASS` because of a *graded* dimension score (the `--graded` audit path) loses that detail because v6 itself did not preserve the dimension breakdown — that information was already lost in v6.
- After forward → reverse round-trip on a skill that originally had `audit_verdict: PASS` with no other Health Block context, the reverse output may show `audit_verdict: PARTIAL` if the forward step set some verdicts to UNVERIFIED. This is expected and HONEST — `PARTIAL` correctly reflects the post-reverse state of "structural verified, others unverified."

### Verification

```bash
# After applying forward, verify the corpus validates against the v7 schema
cd skill-graph
npm run verify

# Spot-check a specific skill's new Health Block
node lib/audit/skill-status.js cognitive-load-theory
```

`npm run verify` runs `scripts/skill-lint.js` against every skill. Until the lint-demotion follow-up commit lands, lint will treat the new verdict fields as recognized v7 fields and continue to validate `lint_verdict` and `drift_status` against their existing enums.

## Breaking-change compatibility matrix

| Direction | Outcome |
|---|---|
| **v6 tool reads v7 SKILL.md** | ⚠ Partial. The v6 schema's `additionalProperties: false` rejects the four new verdict fields. Use `normalizeFrontmatter()` in `skill-graph/scripts/lib/parse-frontmatter.js` for forward-compat reads. Tools that only access `lint_verdict` / `drift_status` directly continue to work because those fields are retained unchanged. |
| **v7 tool reads v6 SKILL.md** | ✅ Backwards compatible during migration window. The v7 schema's required field list still requires `schema_version`. A v6 skill that has not yet been migrated will read as schema-invalid against v7 (`schema_version: 6` is not in the v7 oneOf), but the migrator can be run incrementally. |
| **v7 tool reads v7 SKILL.md** | ✅ Native. |
| **External consumer reads exported marketplace skill** | ✅ Unchanged. The marketplace export at `~/Development/skills/skills/<category>/<name>/SKILL.md` follows Anthropic Agent Skills convention (no Health Block — that is internal Protocol surface). Re-run `scripts/export-marketplace-skills.js` post-migration to refresh. |
| **JSON-LD consumer reads `skill.context.jsonld`** | ✅ Forward-compatible. `audit_verdict` is kept aliased to `structural_verdict` for back-reads of older manifests; the four new properties are added. |
| **Manifest consumer reads `skills.manifest.json`** | ✅ Forward-compatible. The manifest projection at `health.*` adds `structural_verdict`, `truth_verdict`, `comprehension_verdict`, `application_verdict`. `health.audit_verdict` is retained as optional for back-read of older manifests. |

## Coupled commits in this migration

This migration is delivered as two commits, one per repo, with `--only` path-limiting per `~/Development/.claude/rules/multi-session-commits.md`:

**Commit 1 (in `skill-graph/`):** schema + migrator + ADR + this doc + AGENTS.md + CHANGELOG + coupled docs (field-reference, protocol, manifest-field-mapping, template, JSON-LD, manifest schema) + operational scripts (`scripts/skill/skill-evolution-loop.js`, `scripts/skill/skill-census.js`, `scripts/skill/backfill-audit-state.js`, `lib/audit/skill-status.js`).

**Commit 2 (in `~/Development/skills/`):** the migrated 284 active + 52 archived SKILL.md files. Generated by `node skill-graph/scripts/migrate-skill-v6-to-v7.js --apply skills`.

The marketplace mirror at `~/Development/skills/skills/` is regenerated by `scripts/export-marketplace-skills.js` after Commit 2. That regeneration is part of the publication-sync workflow, not the v6→v7 migration itself.

## Known limitations

- **`application_verdict: UNVERIFIED` is the default for every skill in the corpus.** This is the honest state — no skill has been audited via gate 9. SYNTHESIS §6 step 3 lands the first 4-skill pilot panel; step 6 governs the tiered rollout for the remaining corpus.
- **The lint demotion is a follow-up task.** Until it lands, internal style preferences still produce `lint_verdict: FAIL` which rolls up into `structural_verdict: FAIL`. The four-verdict shape is in place; the form-gate-authority narrowing follows in a subsequent commit.
- **Reverse migration is lossy.** Use it only for rollback or round-trip testing, not as part of a regular workflow. The four verdicts cannot be recovered from a v6 `audit_verdict` once a reverse has been applied — original information is lost.
- **The `skill_audit_loop` doc and the audit-loop runner doc reference `audit_verdict` in multiple places.** Those docs are updated in this commit to point at the four new fields, but external references (e.g., user-facing READMEs, marketing docs) may still mention `audit_verdict` — they should be updated as they are touched.

## See also

- [`docs/adr/0011-split-audit-verdict-into-four-verdicts.md`](../adr/0011-split-audit-verdict-into-four-verdicts.md) — full decision rationale.
- [`docs/migrations/v5-to-v6.md`](v5-to-v6.md) — prior migration, established the line-based codemod pattern this migrator extends.
- [`docs/SKILL_AUDIT_LOOP.md`](../SKILL_AUDIT_LOOP.md) — audit-loop operational contract.
- `~/Development/.roundtable/skill-audit-2026-05-19/SYNTHESIS.md` — the roundtable synthesis driving this work (lives in the canonical workspace, not the skill-graph repo).
- [SkillsBench (arXiv 2602.12670)](https://arxiv.org/pdf/2602.12670) — empirical evidence that 19% of agent skills produce negative deltas.
