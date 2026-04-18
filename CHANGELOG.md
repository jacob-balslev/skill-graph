# Changelog

All notable changes to Skill Graph are recorded here.

The format is based on [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Skill Graph has not been published to a package registry. Versions below describe the contract at each checkpoint in the git history and are how consumers pin. `schema_version` in the JSON Schemas tracks contract shape (currently `3`); this changelog tracks the library as a whole (tooling + starters + docs).

## [Unreleased]

No unreleased changes since 0.4.0.

## [0.4.0] — 2026-04-18

The "v3 contract + reference consumer + multi-project workspace" release. A breaking schema bump (v2 → v3) coordinated with new authoring fields, executable drift evidence, multi-root workspace support, and two new reference consumer tools that exercise the full graph contract end-to-end.

### Added
- **`schemas/skill.v3.schema.json` + `schemas/manifest.v3.schema.json`** — pinned v3 copies. The unversioned schemas now track v3; v2 pinned copies remain in the repo as frozen prior-version stable copies.
- **`scripts/migrate-skill-v2-to-v3.js`** — line-based codemod that preserves author YAML style (comments, quoting, indentation). Applies the four v2 → v3 transformations: `schema_version: 2 → 3`, `family → browse_category`, scalar `drift_check` → object with `last_verified`, scalar `compatibility` → object with `notes`.
- **`scripts/skill-graph-route.js`** — the reference consumer. Graph-aware skill selector that uses `relations` (all four kinds), `grounding.truth_sources`, `eval_state`, `drift_check`, `lifecycle`, and `project_tags` to make routing decisions visible. Emits ranked lists with per-skill reasons explaining why each skill was selected, co-loaded via `verify_with` / `depends_on`, or excluded via `boundary`. Supports `--project`, `--max`, `--min-eval-state`, `--path`, `--manifest`, `--json`.
- **`scripts/skill-graph-drift.js`** — the drift sentinel. Hashes every `grounding.truth_sources` entry with SHA-256, compares against the stored `drift_check.truth_source_hashes` baseline, and reports DRIFT / BROKEN / STALE / NO_BASELINE states. `--record --apply` updates the SKILL.md frontmatter in place with current hashes and today's date.
- **`.skill-graph/config.json`** (optional workspace config) — declares `skill_roots` (multiple directories the generator unions into one manifest) and `projects` (literal handle → `semantic_tags` mapping). Fallback to single-root `skills/` when absent. Documented in `docs/plans/multi-root-workspace.md`.
- **Four new optional v3 fields** in the authored frontmatter contract:
  - `category` — hierarchical browse path (`ecommerce/integrations/shopify`), pattern-validated.
  - `project_tags` — array of literal project handles or semantic tags for multi-project filtering. Absent = ambient/cross-project.
  - `lifecycle` — object with `stale_after_days` and `review_cadence`. Drives the drift sentinel's staleness flag.
  - `runtime_telemetry` — object with `feedback_source` path, `last_updated`, and optional success-rate metrics. Enables closing the loop from self-reported `eval_state` to externally-observed success/failure.
- **Relation item object form** — `relations.boundary` items may now be `{skill, reason}` objects (back-compat with bare strings), and `relations.depends_on` items may be `{skill, min_version}` objects. Reasons make the anti-ownership field self-documenting.
- **Manifest-level generated fields**: `workspace` block echoing the config, `summary.by_project` rollup, `skills[].project` handle, `skills[].category`, `skills[].project_tags`, `health.lifecycle`, `health.runtime_telemetry`, `health.drift_detected` (computed by the generator when hashes are recorded).
- **Paths negation** — `paths` globs may now be prefixed with `!` for gitignore-style exclusion, matching how real file scanners work.
- **`docs/plans/multi-root-workspace.md`** — design reference for the hybrid layout, config format, scope placement rules, and migration path from single-root to multi-root.
- **`docs/field-decision-guide.md` § 4–5** — new decision tables for `project_tags` (literal vs semantic tags, when to tag vs leave ambient) and a cross-cutting table disambiguating `browse_category` vs `category` vs `project_tags` vs `routing_groups`.

### Changed (breaking)
- **`schema_version`: 2 → 3.** All v2 field names and scalar shapes that change are hard-rejected by the v3 schema's `additionalProperties: false` and type constraints. Lint emits friendlier WARN lines pointing at the rename for the first v3 minor release window.
- **`family` → `browse_category`** (rename). Values unchanged. The v2 name invited misuse as a routing signal; the v3 name makes the browse-taxonomy intent explicit.
- **`drift_check` shape: date string → object.** v2: `drift_check: "2026-04-15"`. v3: `drift_check: { last_verified: "2026-04-15", truth_source_hashes?: { ... } }`. The new hash map is optional but strongly recommended — it turns drift detection from self-asserted into evidence-backed.
- **`compatibility` shape: free-text string → object.** v2: `compatibility: "Node.js 18+, Git"`. v3: `compatibility: { runtimes?: [...], node?: string, notes?: string }`. The codemod moves the old string verbatim into `compatibility.notes`; authors upgrade to structured fields manually.
- **`summary.by_family` → `summary.by_browse_category`** in the manifest projection. Consumers reading the old key must update.
- **`scripts/skill-lint.js`** — `DEPRECATED_V1_FIELDS` becomes `DEPRECATED_V1_FIELDS` for v1 names plus new v2 → v3 warnings for `family`, scalar `drift_check`, scalar `compatibility`. `AUTHORED_FIELDS_MUST_FLOW` adds `browse_category`, `project_tags`, `category`.
- **`scripts/check-contract-consistency.js` C6** — now version-aware: resolves the current schema version from the unversioned schema, checks parity against the matching pinned copy, treats all prior versions as frozen (must exist, not checked for parity).
- **`scripts/generate-manifest.js`** — reads `.skill-graph/config.json` when present and walks multiple skill roots; falls back to single-root `skills/` otherwise. Computes SHA-256 on truth sources and emits `health.drift_detected` when baselines exist. `schema_version` written as `3`.
- **`scripts/export-skill.js`** — flattens the v3 `compatibility` object to a single string for Agent Skills export, concatenating `runtimes`, `node`, and `notes` into a 500-char budget. New v3 fields flow through the `metadata:` envelope without special handling.
- **`scripts/lib/parse-frontmatter.js`** — extended to parse block sequences of map entries (needed for v3 `boundary: [{skill, reason}]` and `depends_on: [{skill, min_version}]` shapes).
- **`examples/skill-template.md`** — upgraded to v3, now exercises `browse_category`, `category`, object `drift_check`, object `compatibility`, object `boundary` with reason, and `lifecycle`.
- **All 8 starter skills** migrated to v3 via the codemod.
- **All 5 Agent Skills exports** regenerated with the flattened v3 `compatibility`.
- **`examples/skills.manifest.sample.json`** regenerated with v3 shape (nine skill entries: 8 starters + template).

### Migration
- Run `node scripts/migrate-skill-v2-to-v3.js` against any v2 skill directory to apply all four transformations automatically.
- See `docs/manifest-contract.md § Migration Note — v2 → v3` for the full mapping table.
- See `docs/field-reference.md` for per-field rules, v3 examples, and v2 → v3 migration notes inline with each changed field.

### Verification
- `node scripts/skill-lint.js --include-template` → 0 errors across 8 starters + template.
- `node scripts/check-contract-consistency.js` → C1–C6 OK, 0 warnings. C6 confirms v3 tracks unversioned and v2 is correctly frozen.
- `node scripts/generate-manifest.js --include-template --validate-only` → manifest valid against `schemas/manifest.schema.json`.
- `node scripts/skill-graph-route.js "accessibility screen reader"` → produces expected selection + co-load + boundary-exclusion output with per-skill reasons.
- `node scripts/skill-graph-drift.js` → reports baseline status for every skill with truth sources.

## [0.3.0] — 2026-04-17

The "contract honesty + graded audits" release. Three priorities from the internal-only OSS roadmap (`docs/plans/skill-graph-oss-roadmap.md`): narrow the `portability.targets` enum to what actually has a working transform (P1), promote the audit runner from a lint-stub seeder to a real prompt-driven grader (P2), and close the versioning-policy-to-reality gap with pinned v2 schema files (P3). No GitHub remote, no npm publish — this release matures the contract for internal use.

### Added
- `scripts/lib/audit-prompt-builder.js` — 7-dimension registry, context collector (reads `SKILL.md` plus `grounding.truth_sources`), IDENTITY-STEPS-OUTPUT prompt composer, response parser (requires a `<verdict>…</verdict>` JSON block), and coarse verdict aggregator. Powers the new graded audit mode.
- `scripts/skill-audit.js --graded` mode — calls an external model CLI (default `claude -p`, also works with `codex exec`) once per scorecard dimension and merges the responses into `findings.md` / `verdict.md` / `scorecard.md`, replacing TODO placeholders with evidence-backed PASS / PASS WITH FIXES / FAIL verdicts. Grader CLI is user-supplied via `--grader-cli`; no API key is embedded.
- `scripts/lib/mock-grader.js` — deterministic stand-in grader that produces canned `<verdict>` blocks per dimension. Lets CI smoke-test the graded pipeline without an API key and powers the `examples/audits/documentation/` graded fixture.
- `schemas/skill.v2.schema.json` and `schemas/manifest.v2.schema.json` — pinned v2 copies of the unversioned schemas, content-identical modulo `$id` and `title`. Consumers that want stability across a future v3 bump pin to these; consumers that want to follow latest use the unversioned files.
- `check-contract-consistency.js` C6 — enforces parity between the versioned and unversioned schemas. Drift is an error; the v2 files must track the unversioned files exactly until v3 ships.
- `CHANGELOG.md` (this file) — Keep-a-Changelog-formatted history seeded with the current bundle. Future releases get entries under `## [Unreleased]` as they land.

### Changed
- `examples/audits/documentation/` regenerated via the mock grader to demonstrate what `--graded` output looks like: real scores, `N/A` for grounding on a portable skill, evidence-cited findings.
- `docs/integrations/github-actions.md` — installation guidance rewritten so the primary path is clone-and-vendor (the only path that works today). The `npm install --save-dev skill-graph` / `npx skill-graph-lint` snippets are preserved as a secondary **WHEN PUBLISHED** section so no reader mistakes them for current guidance.
- `docs/metadata-contract.md § Schema Versioning Policy` — rewrites policy point 3 as a current-state description now that the versioned schema files exist.
- `README.md` Status section — audit runner moves from "stub generator" bullet to a two-mode description and out of the Planned list. Validation table expands to six checks (adds C6). Quick Tour lists unversioned and v2 schemas side by side.
- `docs/plans/scripts-roadmap.md § Audit runner` — marked SHIPPED with full two-mode description, grader-CLI discipline, and links to the new `scripts/lib/audit-prompt-builder.js` and `scripts/lib/mock-grader.js`.

### Removed (breaking)
- `portability.targets` enum values `cursor`, `windsurf`, `copilot`, and `agents-md`. Only `agent-skills` has a working transform (`scripts/export-skill.js`); the other four were compatibility goals that violated the contract's `additionalProperties: false` strictness rule. The enum now accepts only `["agent-skills"]`. Re-adding a runtime is gated on a new RFC and the same PR that ships its transform. Starter skills, the template, the sample manifest, the exports fixtures, and all docs that mentioned the removed values were updated to match.

### Verification
- `node scripts/skill-lint.js --strict` → 0 errors across 8 starters.
- `node scripts/check-contract-consistency.js` → C1–C6 OK, 0 warnings.
- `node scripts/generate-manifest.js --validate-only` → manifest valid.
- `node scripts/skill-audit.js documentation --graded --grader-cli "node scripts/lib/mock-grader.js" --force` → 7 dimensions processed (6 grader calls + 1 N/A skip), 3 graded findings, 0 grader errors, non-TODO verdicts in all 3 artifact files.

## [0.2.0] — 2026-04-17 (pre-changelog, reconstructed from git)

The "v2 contract + scripts toolchain" release. Before 0.3.0 the project did not maintain a running changelog; this section reconstructs the bundle from the git history (commits `34bf6c0` through `3b2cec0`). Use this as a guide for pinning older consumers, not as a complete line-by-line history.

### Added
- `schema_version: 2` contract — split `eval_status` into the `eval_artifacts` / `eval_state` / `routing_eval` triple, renamed `scope` enum values (`generic` → `portable`, `operational` → `codebase`), renamed `portability.level` → `readiness` and `portability.exports` → `targets`, renamed `route_groups` → `routing_groups` (`6727a71`, SH-5784).
- Eight starter skills across all four archetypes and all three scopes: `a11y`, `debugging`, `documentation`, `refactor`, `testing-strategy`, `skill-router` (`router`), `lint-overlay` (`overlay`), `graph-audit` (`codebase` with a full `grounding` block). (`17c6609`, `823f19f`, SH-5783.)
- Five shipping scripts, all self-contained (Node built-ins only): `scripts/skill-lint.js` (schema + structural validation with code-frame diagnostics and archetype-aware section validator), `scripts/generate-manifest.js` (authored → generated projection), `scripts/export-skill.js` (Agent Skills export transform — single target: `agent-skills`), `scripts/check-contract-consistency.js` (C1–C5 cross-artifact checks), `scripts/skill-audit.js` (lint-seeded stub generator). (`747f446`, `5c2ae16`, `d98a6a7`, `b88c61b`, `aad2e87`.)
- GitHub Actions self-CI workflow and a copy-paste consumer integration doc (`7fa5af6`, SH-5786).
- Authored-to-generated bridge doc, Schema Versioning Policy, relation-semantics decision tables, and the authoring-via-self-referential-template pattern (`6c2f694`, `a9cdd42`, `760e083`, `4194d54`).

### Changed
- `docs/metadata-contract.md` split into three focused files: overview + archetype map, field reference, and manifest contract (`90f78e5`, SH-5782).
- Renamed frontmatter fields: `domain_frame` → `grounding`, `evaluation_mode` → `grounding_mode` (`5862283`, SH-5779).

### Fixed
- Restored four optional schema fields that were accidentally dropped in an earlier manifest refactor (`8791558`, SH-5776).
- Repaired six factual errors in the shipped worked examples (`873c463`, SH-5777).

[Unreleased]: https://github.com/PLACEHOLDER/skill-graph/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/PLACEHOLDER/skill-graph/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/PLACEHOLDER/skill-graph/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/PLACEHOLDER/skill-graph/releases/tag/v0.2.0
