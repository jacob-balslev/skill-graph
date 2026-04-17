# Changelog

All notable changes to Skill Graph are recorded here.

The format is based on [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Skill Graph has not been published to a package registry. Versions below describe the contract at each checkpoint in the git history and are how consumers pin. `schema_version` in the JSON Schemas tracks contract shape (currently `2`); this changelog tracks the library as a whole (tooling + starters + docs).

## [Unreleased]

No unreleased changes since 0.3.0.

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

[Unreleased]: https://github.com/PLACEHOLDER/skill-graph/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/PLACEHOLDER/skill-graph/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/PLACEHOLDER/skill-graph/releases/tag/v0.2.0
