# Opus 4.7 Skill Graph SYSTEM-Side Audit

> Source: User-provided Claude Code / Opus 4.7 transcript from 2026-05-27.
> Mode: SYSTEM.
> Scope: read-only audit report preservation.
> Saved by Codex on 2026-05-27 under `docs/research/` because `skill-graph/AGENTS.md` routes one-shot investigations and research findings there.

## Setup

Mode declared: SYSTEM. The user explicitly asked Opus to audit the Skill Graph project on the SYSTEM side. Per the Skill Graph work-mode rules, the audit was read-only and produced a report; it did not edit schema files, scripts, protocol docs, `SKILL.md` files, or per-skill artifacts.

Scope: every SYSTEM surface of the `skill-graph` project: Tier 1 schemas, Tier 2 prose protocol/audit-loop/graph docs and ADRs, Tier 3 enforcement scripts and codemods, Tier 4 consumer tooling, Tier 5 specimens/fixtures, CI workflow, package contract, audits manifest, lane config, and grader prompts. Individual `SKILL.md` content drift was excluded as CONTENT-mode work.

Read corpus reported by Opus:

- `CLAUDE.md`, `AGENTS.md`, `SKILL_GRAPH.md`, `SKILL_METADATA_PROTOCOL.md`, `SKILL_AUDIT_LOOP.md`
- `schemas/skill.schema.json`
- `audits/manifest.json`, `audits/lanes.json`
- `package.json`, `.skill-graph/config.json`
- ADRs 0009, 0015, 0016, 0017, 0018 in full; ADR 0001-0018 titles enumerated
- `CHANGELOG.md` lines 1-120
- `.github/workflows/skill-graph-lint.yml`
- recent commit history and commit `f88603d`
- live results from `npm run lint`, `lint:template`, `category:check`, `protocol:check`, `docs:links`, `docs:drift`, `mirror:freeze`, `charter:parity`, `stability:check`, `manifest:validate`, `routing-eval`, `marketplace:verify`, `overlap`, `audit-manifest:check`, `status:check`, and `test:unit`
- on-disk counts: 154 canonical `SKILL.md`, 152 marketplace `SKILL.md`, 8 `comprehension.json`, 5 `application.json`

One-line situational summary from Opus: the most recent commit, `f88603d refactor(protocol): retire operation field + 5 doctrinal changes`, removed `operation` from the schema/lint/router/manifest path, but many SYSTEM surfaces still describe `operation` as a v8 axis or still re-author it. The `npm run verify` chain is red across multiple gates.

## Findings

### S1. Tier 1 Schema

S1-B1 (CRITICAL). `operation` is still described as a v8 required axis in `AGENTS.md`, `SKILL_METADATA_PROTOCOL.md`, `SKILL_AUDIT_LOOP.md`, `SKILL_GRAPH.md`, `CHANGELOG.md`, and ADR-0017. The schema no longer declares or requires `operation`; with `additionalProperties: false`, skills carrying `operation` fail validation. Commit `f88603d` explicitly retired `operation`, so the prose now describes a contract the schema does not enforce.

S1-B2 (HIGH). `schemas/skill.schema.json` still contains the v7 `category` conditional machinery. It only fires when `category` is present, so it is not immediately breaking v8-only skills, but it keeps deprecated classification logic in the binding schema. Opus recommended recording whether this is a deliberate back-compat window or pruning debt.

S1-B3 (HIGH). `primaryCategory` still allows six lowercase legacy values plus five title-case workspace values. With `primaryCategory` deprecated and replaced by `subject`, those title-case values are stranded unless a consumer still needs them.

S1-B4 (MEDIUM). The schema now describes `description` as a short topical statement, but `AGENTS.md` and `SKILL_METADATA_PROTOCOL.md` still describe `description` as a routing contract with positive trigger phrases and explicit negative boundary text.

S1-INFO-1. The schema's tolerance of both integer and string `schema_version` values is explicitly documented as back-compat, which Opus called good schema hygiene.

### S2. Tier 2 Protocol And Loop Docs

S2a-B5 (CRITICAL). `SKILL_METADATA_PROTOCOL.md` still claims `operation` is a required v8 axis in the required fields table, the classification model, and the schema contract section.

S2a-B6 (HIGH). `SKILL_METADATA_PROTOCOL.md` still teaches the retired framing that `description` is the routing contract.

S2a-B7 (MEDIUM). `SKILL_METADATA_PROTOCOL.md` has a broken TOC anchor for `#Evaluation Status`; the markdown checker expects the generated slug form.

S2a-B8 (MEDIUM). `SKILL_METADATA_PROTOCOL.md` still links to `#health-block-v6-flat--written-by-the-audit-loop`, but the section was renamed to Audit Status.

S2b-B9 (CRITICAL). `SKILL_AUDIT_LOOP.md` Part 2 still asks auditors to verify that `operation` is one of the four Bloom-grounded enum values. The schema no longer declares `operation`, so this checklist tells auditors to check for a field the schema rejects.

S2b-INFO-2. `SKILL_AUDIT_LOOP.md` Part 3 contains a strong "Audience & runtime" disclosure explaining which commands are workspace-only and which are standalone-package-safe.

S2c-B10 (CRITICAL). `SKILL_GRAPH.md § Current State` still says the schema's global required array mandates `subject + operation + scope`. As the live current-state surface, this is the highest-impact stale prose.

S2d-B11 (CRITICAL). ADR-0017 remains Accepted and still records the 5-axis model with `operation` as axis 2. Since `f88603d` retired `operation`, Opus recommends either a superseding ADR or an amendment block. The commit message's "ADRs left untouched (immutable history)" rationale is incomplete because immutable ADR systems use supersession or amendment records for changed decisions.

S2d-INFO-3. ADR-0009 already contains an amendment block pattern that could be copied for ADR-0017.

S2d-INFO-4. ADR-0016 references a prior `system-audit-2026-05-27.md`-style audit artifact, but Opus did not find that file in the read budget.

S2e-B12 (CRITICAL). `docs/field-reference.generated.md` is stale against `schemas/skill.schema.json`, and `docs/field-reference.md` still links to `#operation`. `npm run protocol:check` and `npm run docs:links` both confirm this.

S2f-B13 (CRITICAL). `CHANGELOG.md [Unreleased]` still says the schema mandates `subject + operation + scope`. It needs an entry recording the `f88603d` retire-operation refactor and doctrinal changes.

S2f-B14 (MEDIUM). `docs/status.generated.md` is stale and should be regenerated by its owner script.

### S3. Tier 3 Enforcement And Transformation Scripts

S3-B15 (CRITICAL). `scripts/migrate-skill-v7-to-v8.js` still inserts `operation:` when migrating a skill. Running it today would produce frontmatter that fails the current schema.

S3-B16 (HIGH). `scripts/lint/check-category-enum.js` still treats `category` as required and fails when it is absent, contradicting the current v8 direction where `category` is deprecated optional back-compat.

S3-B17 (HIGH). `schemas/manifest.schema.json` still requires `type` and `category`, and still declares `operation`. `npm run manifest:validate` fails on a skill with missing `category` and `type`.

S3-B18 (HIGH). `npm run marketplace:verify` reports stale generated marketplace output: stale `marketplace/README.md`, stale exported skills, missing `expected-value`, and expected/exported count mismatch.

S3-INFO-5. `scripts/check-doc-drift.js` correctly catches stale-version prose and complements the schema checks.

### S4. Tier 4 Consumer Tooling

S4-B19 (HIGH). The standalone-package boundary is violated in `lib/audit/`. The reported `test:unit` failure showed files requiring `../../scripts/lib/roots` and hardcoding `REPO_ROOT`-based workspace paths such as `agent-orchestration/`, `.opencode/`, and `sales-hub/`. Opus interpreted this as unfinished ADR-0016 work and recommended moving/copying the roots helper into a package-safe `lib/audit-shared/` or equivalent.

S4-INFO-6. `lib/audit/graders/` appears to be the canonical grader-prompt location after the 2026-05-25 consolidation, but Opus did not verify whether workspace-side copies are only shims.

### S5. Tier 5 Specimens

S5-B20 (MEDIUM). Templates and fixtures still carry `operation:` and now fail lint. Although commit `f88603d` says this is expected until the corpus drain, `examples/skill-metadata-template.md` is the canonical starting point for new skills; using it today produces a skill that fails the current schema.

### S6. Audit Infrastructure

S6-INFO-7. `schemas/routing-config.schema.json` exists, indicating part of ADR-0016 shipped. Opus did not verify whether the workspace-side instance file is validated on every load.

### S7. CI And Release Infrastructure

S7-B21 (CRITICAL). `npm run verify` is red across many gates. Opus separates these into intentional drain-pending failures (`lint`, `lint:template`) and SYSTEM cleanup failures (`manifest:validate`, `category:check`, generated docs, marketplace export, generated status, package-boundary tests). The important question is which red gates are intentionally tied to the `operation` retirement and which are unrelated SYSTEM regressions.

S7-INFO-8. The CI workflow still has a `skills/**` path entry even though this repo no longer contains the canonical `skills/` tree after ADR-0009 consolidation.

### S8. Package Boundary And Governance Hygiene

S8-INFO-9. `package.json` has empty dependencies and devDependencies, which Opus called good supply-chain hygiene for this tooling repo.

## Novelty Memo

N1. The work-mode separation and version-label rules predict the current red state after a schema-breaking SYSTEM change; the risk is leaving the SYSTEM-side propagation unscheduled.

N2. `CHANGELOG.md [Unreleased]` is the correct place to record the retire-operation entry so the next release notes do not contradict the schema.

N3. Multiple failures point to `expected-value`: marketplace export is missing it, manifest validation fails on a skill index, and `category:check` fails on `expected-value`.

N4. ADR-0018's planned `relations.boundary` rename has not shipped. Landing another breaking rename before the `operation` drain completes could compound migration debt. Opus recommended an explicit sequencing decision.

N5. `audits/manifest.json` has `schema_version: 1`; any bump should be treated as an audit-loop contract change and validated by `schemas/audits-manifest.schema.json`.

N6. Opus did not find direct evidence of tests for the schema's newer `allOf` coherence rules, such as `eval_state: passing` requiring `eval_artifacts: present`.

N7. The two physical frontmatter encodings are documented honestly, but the accepted input shapes live in normalizer behavior rather than a separate input-encoding schema.

N8. The failing standalone-package test is valuable because it directly encodes the ADR-0009 package-boundary promise.

N9. The overlap command's 31 keyword-overlap warnings are intentionally warn-level, but there is no visible tracking loop for those warnings.

N10. The Doc Ownership Map is useful but large; Opus suggested a linter that checks canonical-doc claims in the map resolve to a single existing owner.

## Dissent From A Naive Reading

Opus argued that a red `npm run verify` chain is not automatically a defect in this repo after a schema-breaking SYSTEM commit. The Skill Graph doctrine intentionally prevents one SYSTEM commit from changing the schema and manually editing many `SKILL.md` files. The better question is which failures are expected CONTENT-mode drain work and which failures are incomplete SYSTEM propagation. Opus classified `lint` and `lint:template` as intentionally drain-pending, while classifying manifest schema drift, stale category checks, the migration codemod, generated docs, marketplace export, and package-boundary tests as SYSTEM cleanup.

Opus also cautioned that stale generated artifacts should not necessarily become separate user-facing tickets. They are mechanical regenerations that can be handled together.

## Completeness Claim From Opus

Opus reported examining 27 SYSTEM surfaces:

- schema: `schemas/skill.schema.json`
- audit-manifest and lane files: `audits/manifest.json`, `audits/lanes.json`
- presence-only schemas: `schemas/comprehension.schema.json`, `schemas/audits-manifest.schema.json`, `schemas/routing-config.schema.json`
- canonical docs: `SKILL_METADATA_PROTOCOL.md`, `SKILL_AUDIT_LOOP.md`, `SKILL_GRAPH.md`
- repo agents files: `CLAUDE.md`, `AGENTS.md`
- ADRs: 0009, 0015, 0016, 0017, 0018 in full; others enumerated
- generated mirrors via gate output: `docs/field-reference.generated.md`, `docs/status.generated.md`
- Tier 3 commands and scripts via runs/listing: lint, template lint, category check, protocol check, docs links, docs drift, mirror freeze, charter parity, stability check, manifest validate, marketplace verify, overlap, audit-manifest check, status check
- Tier 4 consumer tooling via directory listing and tests: `lib/audit/`, `lib/audit/graders/`
- specimens via directory listing: `examples/fixture-skills/`
- CI and package: `.github/workflows/skill-graph-lint.yml`, `package.json`, `.skill-graph/config.json`
- operational counts: canonical skills, marketplace skills, comprehension/application artifact counts, git status, recent commits
- one commit drilldown: `f88603d`

Reported finding counts: 21 lettered findings, 9 INFO observations, 10 novelty-memo claims, and 1 dissent block.

Explicit exclusions:

- ADR 0001-0008, 0010, 0013 were not fully opened.
- `scripts/skill-graph-route.js` and `scripts/skill-graph-drift.js` internals were not deeply read.
- Individual `SKILL.md` content drift was excluded as CONTENT-mode work.
- Fixture frontmatter was not directly read.
- `lib/audit/*.js` internals were not deeply read beyond the unit-test failures.
- Routing eval internals were blocked by manifest validation failure.
- `examples/exports/`, `examples/evals/`, runner prompt files, publication classification data, and workspace routing config were not deeply read.

## Recommended Next Moves From Opus

1. Decide ADR-0017's status: add an amendment block or create a superseding ADR for retiring `operation`.
2. Add a `CHANGELOG.md [Unreleased]` entry for the `f88603d` retire-operation refactor and doctrinal changes.
3. Run a mechanical regeneration pass for generated field reference, status doc, and marketplace export.
4. Fix `scripts/migrate-skill-v7-to-v8.js` so it no longer authors `operation:`.
5. Update `schemas/manifest.schema.json` to align with the current classification contract and stop requiring retired fields.
6. Update or retire `scripts/lint/check-category-enum.js`.
7. Update `examples/skill-metadata-template.md` so new skill authoring matches the current schema, or remove it from template lint until the drain completes.
8. Sweep `AGENTS.md`, `SKILL_METADATA_PROTOCOL.md`, `SKILL_AUDIT_LOOP.md`, `SKILL_GRAPH.md`, and `docs/field-reference.md` to remove stale `operation` claims and retired `description` routing-contract language.
9. Repair `lib/audit/` standalone-package boundary failures.
10. Decide whether ADR-0018's `relations.boundary` rename waits for or lands alongside the `operation` drain.
