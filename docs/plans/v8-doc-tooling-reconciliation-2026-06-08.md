# v8 Schema Doc + Tooling Reconciliation (active plan)

> Type: Active plan. Created 2026-06-08T11:00Z. SYSTEM mode. Owner: skill-graph.
> Driver: user directives 2026-06-08 — "make the documentation up to date with the latest v8 schema contract" + "remove all deprecated and legacy to git history." User chose **Conservative** scope (see § Scope decision).

## Why this exists

The v8 schema (`schemas/SKILL_METADATA_PROTOCOL_schema.json`, Tier-1, **correct**) is ahead of the docs/tooling on the ADR-0017 amendment that **retired `deployment_target` and replaced it with the boolean `public` gate** (+ moved project-anchoring/grounding-trigger to `project[]`, + made `scope` required free-text). ~24 active docs + several tooling surfaces still present `deployment_target` (and other retired terms) as the CURRENT contract. This plan reconciles them.

This plan was written because the work exceeds one context window; it is the durable worklist so any session continues cleanly. **Recommend running it post-`/compact`.**

## Current v8 contract (the target every doc/tool must match)

- Required SKILL.md frontmatter: `name`, `description`, `subject` (closed 12-enum), **`public` (boolean publishability gate)**, `scope` (free-text PRD statement).
- **`public` REPLACED the retired `deployment_target` enum.** Mapping: `deployment_target: portable` → `public: true`; `deployment_target: project` → `public: false`. **Project-anchoring + the grounding obligation moved to `project[]`** — schema `allOf[0]`: grounding required when `project[]` is non-empty (NOT keyed off public/deployment_target).
- `scope` is free-text (the old enum `scope`, incl. the `workspace` value, was removed).
- `grounding.subject_matter` (was `domain_object`); `taxonomy_domain` (was `domain`); `project[]` (was `workspace_tags`).
- Understanding: five flat fields `mental_model`/`purpose`/`concept_boundary`/`analogy`/`misconception`; nested `concept` deprecated; top-level `boundary` = deprecated alias of `concept_boundary`.
- `relations`: canonical `related` (alias `adjacent`), `suppresses` (alias `boundary`), + `verify_with`/`depends_on`/`broader`/`narrower`/`disjoint_with`.
- ADR-0019: audit/eval/provenance fields (schema_version, owner, freshness, the four verdicts, eval_*, drift_check, portability, comprehension_state) live in the sibling `audit-state.json`.

## Scope decision (user-confirmed 2026-06-08: CONSERVATIVE)

- **FIX** all doc/code that presents a retired term as the CURRENT contract → rewrite to v8.
- **DELETE** confirmed-obsolete tooling (the v7→v8 codemod) to git history (clean-cut).
- **KEEP** the corpus-coupled deprecated **aliases** (the normalizer/lint/router fallback handling for `deployment_target→public`, `boundary→concept_boundary`, `adjacent→related`, nested `concept`, `domain→taxonomy_domain`, `domain_object→subject_matter`, v3.1 aliases). ~113 unmigrated corpus skills still author these; the normalizer strips them before lint, so the corpus validates. **Do NOT delete these** — they drain per-skill via **SKI-317**. Deleting them now would fail corpus validation until that drain completes. (The aggressive "Major Version Is a Clean Cut" deletion was explicitly declined.)
- **LEAVE** frozen records untouched: `docs/adr/**`, `CHANGELOG.md`, `docs/research/**`, `docs/plans/**` (except this file), `docs/proposals/**`, `skill-audit-loop/progress/**` (audit scratch logs). They describe past state and stay accurate by NOT being rewritten.

## Worklist

### Part 1 — Tooling clean-cut (DELETE the obsolete v7→v8 codemod)

`lib/audit/migrate-frontmatter.js` is obsolete: under `audit --fix` it writes the RETIRED `deployment_target` and DROPS the now-required free-text `scope`, so it **cannot produce a valid current-v8 skill**. Only real consumer: `lib/audit/skill-audit.js` `--fix` (the example skill `examples/projects/markdown-static-site/skills/migrate-posts-to-v2-frontmatter/` is a coincidental name, NOT a consumer). Per AGENTS.md § "Major Version Is a Clean Cut" ("run the codemod, then delete it; the `--fix` framework stays, the map entry is removed"):

- [ ] `git rm lib/audit/migrate-frontmatter.js` (recoverable via `git show <sha>^:lib/audit/migrate-frontmatter.js` / `git tag schema-v7`).
- [ ] `lib/audit/skill-audit.js`: remove `require('./migrate-frontmatter')` (line ~78); rewrite the two `--fix` blocks (dry-run ~1047-1054, real ~1098-~1120) to report "v7→v8 codemod retired (clean-cut); the deterministic repair catalog is currently empty — remaining lint errors need `improve`/manual." Keep the `--fix` flag/plumbing + `runBackfill` definition (framework stays for the next version's catalog); drop the now-orphaned backfill call inside the removed migrate path. Update the file header comment (lines ~5-15, ~77, ~91-97).
- [ ] `bin/skill-graph.js`: `audit --fix` help (line ~76-80) — remove "apply the v7->v8 frontmatter migration … add deployment_target"; replace with "deterministic repair catalog (currently empty — v7→v8 codemod retired per clean-cut)."
- [ ] `skill-audit-loop/SKILL_AUDIT_LOOP.md`: the § "Inner Pipeline of `audit`" step-1 "Deterministic remediation (only under `--fix`)" note (~line 252) — remove the `deployment_target` derivation description; state the catalog is empty post-clean-cut.
- [ ] `commands/audit/audit.md`: same `--fix`/migrate reference.
- [ ] Verify: `node --check lib/audit/skill-audit.js`; `node bin/skill-graph.js audit <skill> --dry-run --fix` runs without the migrate reference; `npm run test:unit` (note: `test-marketplace-export` is a PRE-EXISTING corpus failure on `skill-infrastructure`, unrelated).

### Part 2 — `deployment_target` → `public` across active docs (24 files)

For each: `deployment_target: portable` → `public: true`; `deployment_target: project` → `public: false`; field-table/required-list rows → `public` (boolean); "grounding required when `deployment_target: project`" → "grounding required when `project[]` is non-empty"; deprecation-notes that CORRECTLY say "public replaced deployment_target" stay. **Per-file triage required** — many hits are correct deprecation-notes (leave) vs stale-as-current (fix). Files (from `grep -rln deployment_target` on active surfaces, 2026-06-08):

**`docs/` — authoring/reference (fix the stale-as-current; some need SEMANTIC rewrite):**
- [ ] `docs/AUTHORING-QUICKSTART.md` (field table row 4, YAML examples, grounding-trigger) — SEMANTIC
- [ ] `docs/QUICKSTART-30MIN.md` (required-fields sentence, YAML examples, UNGROUNDED note)
- [ ] `docs/ADOPTION.md` (required-fields list)
- [ ] `docs/concept-map.md` (5-required-fields, conditional-required, field rows, grounding-conditional) — SEMANTIC
- [ ] `docs/field-rationale.md` (`## deployment_target` SECTION — full rationale rewrite around `public` publishability + project[] anchoring) — SEMANTIC, biggest
- [ ] `docs/glossary.md` (`### deployment_target` entry + repo-code-first defaults) — SEMANTIC
- [ ] `docs/field-state-matrix.md`
- [ ] `docs/publish-workflow.md`
- [ ] `docs/manifest-field-mapping.md` (projection table row 9, `by_deployment_target`, examples, joined-manifest prose) — note: manifest still projects `public` now; confirm against `scripts/generate-manifest.js`
- [ ] `docs/grounding-policy.md` (Axis-1 `deployment_target` → re-key on `project[]`; the `deployment_target: project ⇒ grounding` mechanical rule → `project[] non-empty ⇒ grounding`) — SEMANTIC
- [ ] `docs/CONFORMANCE.md` (L2 row)
- [ ] `docs/positioning-vs-marketplaces.md` (project-scoping rows)
- [ ] `docs/publishing-vs-quality.md` (the publishability explanation — note: `public` IS the publishability gate now, so this doc is conceptually close; fix the field name)
- [ ] `docs/marketplace-syndication.md` (classification field lists)

**`skill-metadata-protocol/` — normative (triage: many are correct deprecation-notes):**
- [ ] `skill-metadata-protocol/PRIMER.md` (11 hits — triage)
- [ ] `skill-metadata-protocol/field-reference.md` (11 hits — prose; C1 parity passes so headers are already v8; triage prose)
- [ ] `skill-metadata-protocol/field-decision-guide.md`
- [ ] `skill-metadata-protocol/design-rationale.md` (classification-history — likely mostly DEPRECATION-NOTE-OK / FROZEN; triage)
- [ ] `skill-metadata-protocol/README.md`
- [ ] `skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md` (triage — `public` section already correct from commit 141341b; check remaining)
- [ ] `skill-metadata-protocol/field-reference.generated.md` — **GENERATED**: do NOT hand-edit; regenerate via `node scripts/build-field-reference.js` after any source change; the generator reads the schema so it should already be `public`-correct (confirm).

**Top-level:**
- [ ] `AGENTS.md` (triage), `SKILL_GRAPH.md` (triage), `skill-audit-loop/SKILL_AUDIT_LOOP.md` (the `--fix` note handled in Part 1; check for other deployment_target).

### Part 3 — other retired-term active-doc staleness

- [ ] `domain_object` → `grounding.subject_matter` in active docs: `docs/manifest-field-mapping.md`, `docs/field-state-matrix.md`, `skill-metadata-protocol/{SKILL_METADATA_PROTOCOL,design-rationale,field-decision-guide,field-reference}.md` (triage — many are correct rename-notes), `skill-audit-loop/SKILL_AUDIT_LOOP.md`. Regenerate `field-reference.generated.md`.
- [ ] `workspace_tags` → `project[]` in active docs (same file set — triage).
- [ ] `scope: workspace` / enum-scope as current (2 files) → free-text scope.

### Part 4 — small code stale-refs

- [ ] `lib/audit/skill-status.js:216-217` — `classifyAuditState` reads `skillContract.deployment_target` for `conceptScope`; never fires for `public`-migrated skills. Decide the `public`→conceptScope mapping (note: `public` boolean ≠ deployment_target enum, so it's not 1:1 — `public:false` ≈ project-ish, `public:true` ≈ portable-ish, but project-anchoring is really `project[]`). Update test `scripts/__tests__/test-skill-status-sidecar.js` (currently asserts `deployment_target: portable/project` → conceptScope) accordingly.

### Part 5 — verify + commit discipline

- One logical change per commit, path-limited (`git commit --only`), each with a timestamped `CHANGELOG.md` entry under `### Changed`/`### Removed`.
- After each batch: `npm run protocol:check`, `npm run docs:links`, `npm run docs:drift`, `npm run lint:template`, `npm run models:check`. (`manifest:fresh`/`status:check`/`test-marketplace-export` are PRE-EXISTING parallel-session corpus drift — see the SYSTEM-remediation report — not introduced by this work.)
- **Consider strengthening `scripts/check-doc-drift.js`** to FLAG `deployment_target`-as-current in active docs (it currently passes — it does not catch this class of drift). That makes this reconciliation enforceable going forward. (SYSTEM finding — optional.)

## Out of scope (do NOT do here)
- Deleting corpus-coupled deprecated aliases (gated on SKI-317 — see § Scope decision).
- Editing any `skills/skills/**/SKILL.md` (CONTENT — drains via `/audit:*`).
- Rewriting frozen records (ADR/CHANGELOG/research/plans/proposals/progress).

## Related
- SYSTEM-remediation session that preceded this (commits `8169de5`→`1587012`): fixed the audit-loop agent-clarity defects; surfaced `deployment_target` staleness as findings.
- SKI-317 (SMP) — the CONTENT corpus drain that retires the aliases per-skill.
- `.claude/rules/version-schema-contract.md`, `.claude/rules/delete-dont-archive.md`, AGENTS.md § "Major Version Is a Clean Cut" + § "The Latest Canonical Schema IS the Product."
