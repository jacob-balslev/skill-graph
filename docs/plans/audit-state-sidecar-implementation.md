# Implementation Plan — Audit-State Sidecar Separation (ADR-0019)

> Type: **SYSTEM** (schema + protocol + consumers). Status: **Phase 1 landed; Phases 2–5 in progress.**
> Authorizing decision: [ADR-0019 (Accepted 2026-06-01)](../adr/0019-audit-state-sidecar-separation.md).

> **Progress log**
> - 2026-06-01 — `schema-v8` git tag created at pre-cut HEAD `83c66385` (clean-cut recovery point).
> - 2026-06-01 — **Phase 1 DONE** (commit `16038f5`): `schemas/skill-audit-state.schema.json` authored
>   (28 fields lift-and-shifted, `required[7]`, 2 intra-sidecar `eval_state⇒eval_artifacts` gates).
>   Self-verified via ajv-free harness (valid passes; missing-required / bad-enum / extra-prop /
>   wrong-`schema_version` / both eval_state gates reject). Additive — `verify:system` unchanged by it.
> - 2026-06-01 — **Blocker filed: SH-6655** — pre-existing `docs:drift` red (5 operational `schema_version:7`
>   refs in `docs/plans/skill-audit-loop-end-to-end-completion-2026-05-30.md`, the v7→v8 migration plan).
>   Proven independent of this cut, but blocks a fully-green `verify:system` until resolved.
> - **Discovered downstream impacts to fold into Phases 3–4** (verified this session, not yet in the table
>   below): (a) `schemas/manifest.schema.json` skill-entry `required` includes `version` + `owner` (both →
>   sidecar) — must drop both so a sidecar-less/new skill validates. (b) `scripts/check-schema-constants.js`
>   reads `schema_version.oneOf` and asserts `v8_required_fields` from the **frontmatter** schema — rewrite
>   to read `schema_version` from the sidecar schema, assert the new 5-field frontmatter `required`, and gate
>   the sidecar's constants. (c) `scripts/generate-manifest.js` join = merge sidecar into `fm` BEFORE
>   `buildSkillEntry` (fields are disjoint, so health/eval/lifecycle/concept projections stay byte-identical);
>   `buildSkillEntry` itself needs no change. (d) `verify:system` lints `examples/skill-metadata-template.md`
>   AND `examples/fixture-skills/*` against the frontmatter schema → both must migrate (strip audit fields +
>   add sidecars) in Phase 5. (e) ~22 `scripts/__tests__/*` run in `test:unit`; `test-v8-schema-compat.js`,
>   `test-normalize-field-shape.js`, and the verdict-writeback tests assert the single-file shape and must move.
> Proposal: [audit-state-sidecar-separation.md](../proposals/audit-state-sidecar-separation.md).
> Classification source: `benchmarks/field-relevance/field-placement.json`.
> **Sequencing (binding):** this is a clean major-version-shaped cut (`AGENTS.md § Major Version Is a
> Clean Cut`) — the schema describes the NEW shape, prior shape lives in a git tag, no dual-shape window.
> The SYSTEM change ships and goes green on `verify:system` **independently** of corpus migration; the
> corpus then drains per-skill through the audit loop (CONTENT), one skill per commit — never a
> schema+N-skills mega-commit (`version-schema-contract.md § Companion rule`).

## Goal

Split the per-skill metadata into two files governed by two schemas:

- **`SKILL.md` frontmatter** (25 agent-facing fields) — what the everyday agent needs to find,
  understand, execute the skill. The CONTENT surface.
- **`audit-state.json`** (28 audit/eval/provenance fields, skill-folder root) — the Skill Audit Loop's
  records *about* the skill. SYSTEM output, written only by `/audit:*`.

The two are joined into the compiled manifest so the router's quality/staleness gates keep working.

## Resolved decisions (ADR-0019 § Open-question resolutions — overridable before start)

| # | Decision |
|---|---|
| Sidecar | `audit-state.json` at skill-folder root (sibling of `SKILL.md`, `evals/`, `references/`) |
| `grounding` | stays whole in frontmatter; `drift_check` (hashes) moves to sidecar — no sub-field split |
| `lifecycle` | → sidecar; manifest-join carries `stale_after_days` for the router staleness gate |
| `stability`/`superseded_by` | stay frontmatter (router deprecation gate = agent-facing) |
| `schema_version` | → sidecar only; frontmatter carries no version (clean-cut: tree = current contract) |
| `routing_bundles` | out of scope; separate follow-up; untouched here |

## The two-file field contract

**Frontmatter (25):** `name`, `description`, `subject`, `subjects`, `taxonomy_domain`,
`deployment_target`, `scope`, `grounding`, `project`, `keywords`, `triggers`, `examples`,
`anti_examples`, `paths`, `relations`, `mental_model`, `purpose`, `boundary`, `analogy`,
`misconception`, `allowed-tools`, `license`, `compatibility`, `stability`, `superseded_by`.
Frontmatter `required`: `name`, `description`, `subject`, `deployment_target`, `scope`.

**Sidecar `audit-state.json` (28):** `schema_version`, `version`, `owner`, `urn`, `repo`, `freshness`,
`reviewed_at`, `last_audited`, `last_changed`, `drift_check`, `drift_status`, `lifecycle`,
`structural_verdict`, `truth_verdict`, `comprehension_verdict`, `application_verdict`, `lint_verdict`,
`eval_artifacts`, `eval_state`, `routing_eval`, `eval_score`, `eval_failed_ids`, `eval_last_run`,
`eval`, `comprehension_state`, `marketplace_tier`, `portability`, `runtime_telemetry`.
Sidecar `required`: `schema_version`, `owner`, `freshness`, `drift_check`, `eval_artifacts`,
`eval_state`, `routing_eval` (the 7 of the 8 currently-required audit fields; `version` optional).

**Retired in the same cut:** `concept` (→ flat Understanding fields), `allowed_tools` snake (→ kebab).

## Phased implementation

### Phase 1 — Sidecar schema (SYSTEM)
- **New:** `schemas/skill-audit-state.schema.json` — the 28 fields with the SAME enums/constraints/type
  defs they carry in the frontmatter schema today (lift-and-shift, don't redesign). Carry over the
  intra-sidecar `allOf` gates: `eval_state ∈ {passing,monitored} ⇒ eval_artifacts: present`;
  `stability: deprecated ⇒ superseded_by` — wait, `superseded_by` stays frontmatter, so this gate
  becomes **cross-file** (Phase 4 lint), not a sidecar `allOf`. Enumerate every existing `allOf` and
  route it: intra-sidecar → keep here; cross-file → Phase 4 lint.
- **Verify:** `node -e` ajv-free structural self-check (repo uses Node built-ins); a fixture
  `audit-state.json` validates; an invalid one fails.

### Phase 2 — Frontmatter schema rewrite (SYSTEM)
- **Edit:** `schemas/SKILL_METADATA_PROTOCOL_schema.json` — remove the 28 moved fields + `concept` +
  `allowed_tools`; set `required` to the 5 agent-facing core; **delete** every `allOf` that referenced
  a moved field (the `eval_state→eval_artifacts` allOf, the `comprehension_state→Understanding` allOf
  [becomes cross-file lint], the `deployment_target: project ⇒ grounding` allOf STAYS — both fields are
  frontmatter).
- Tag the prior contract: `git tag schema-v8 <pre-cut-sha>` (clean-cut recovery point).
- **Verify:** `node scripts/check-schema-constants.js`; the frontmatter schema validates a
  sidecar-stripped fixture skill.

### Phase 3 — Manifest compiler join (SYSTEM, CRITICAL PATH)
- **Edit:** `scripts/generate-manifest.js` — for each skill, read `SKILL.md` frontmatter AND
  `audit-state.json`; merge into the manifest entry so the manifest's `health`/`eval`/`lifecycle`
  projections are unchanged in SHAPE (only the SOURCE changes). The router's quality gate
  (`structural_verdict`/`eval_state`/`application_verdict`) and staleness gate
  (`lifecycle.stale_after_days`) read the manifest, so they keep working with zero router change IF the
  join is faithful.
- Missing `audit-state.json` ⇒ manifest entry gets `UNVERIFIED`/default health (a not-yet-migrated or
  brand-new skill is honestly unverified, never crash).
- **Verify:** `scripts/generate-manifest.js --validate-only`; diff a manifest built the old way vs the
  new way for a pilot skill — `health`/`eval`/`lifecycle` blocks must be byte-identical.

### Phase 4 — Consumer updates (SYSTEM)
| Consumer | Change |
|---|---|
| `scripts/skill-lint.js` | validate `SKILL.md` vs frontmatter schema + `audit-state.json` vs sidecar schema; add **cross-file** checks (`comprehension_state: present` ⇒ Understanding fields in frontmatter; `stability: deprecated` ⇒ `superseded_by` in frontmatter; `eval_state: passing` ⇒ `eval_last_run` in sidecar). Emit "unexpected audit field in frontmatter" for un-migrated skills. |
| `scripts/skill-graph-drift.js` | read/write `drift_check` + `drift_status` from the sidecar |
| `lib/audit/evaluate-skill.js` | `stampComprehensionVerdict`/`stampApplicationVerdict` + eval_* write to `audit-state.json`, not frontmatter |
| `lib/audit/run-skill-improvement-loop.js`, `batch-eval.js` | verdict/eval write-back targets the sidecar |
| `scripts/skill-audit-preflight.js` | read the contract from BOTH schemas; per-op readiness checks the right file |
| `scripts/check-version-earned.js` | reads `schema_version` + Understanding/verdict evidence from the sidecar (+ frontmatter for Understanding prose) |
| `scripts/normalize-skill-field-shape.js` | mechanical mover: relocate the 28 fields frontmatter→sidecar (this becomes the CONTENT migration tool in Phase 6) |
| `scripts/export-marketplace-skills.js`, `scripts/lib/render-skill-context.js` | confirm they read frontmatter only; the sidecar is NEVER exported/rendered (already strips audit/eval/provenance per the 2026-05-29 change — verify, don't duplicate) |
| `scripts/skill-graph-route.js` | confirm it reads verdicts/eval_state/lifecycle ONLY via the manifest, never `SKILL.md` directly (should already be true — add a guard test) |

- **Verify:** each consumer's existing unit suite (`scripts/__tests__/*`) updated + green; new cross-file
  lint test.

### Phase 5 — Docs + template + governance (SYSTEM)
- `skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md`: rewrite to the two-file contract; name the
  sidecar; state the clean-cut (no v8-in-frontmatter audit fields).
- `skill-metadata-protocol/field-reference.md` + `field-decision-guide.md`: each field notes its file.
  Regenerate `field-reference.generated.md` via `build-field-reference.js` (cover both schemas).
- `docs/manifest-field-mapping.md`: source is now frontmatter + sidecar → manifest.
- `examples/skill-metadata-template.md`: split into a `SKILL.md` template + an `audit-state.json` template.
- `AGENTS.md`: § Work Modes (the sidecar IS the physical SYSTEM/CONTENT boundary), § Skill Metadata
  Protocol Quick Reference (two-file), Doc Ownership Map (+ sidecar schema row), § Coupled Changes
  (schema edit now touches two schemas), § Major Version Is a Clean Cut (cite ADR-0019 as such a cut).
- `CHANGELOG.md`: record the cut **past-tense when it lands** (not before).
- `bin/skill-graph.js` / README / QUICKSTART: mention the sidecar where skill anatomy is described.

### Phase 6 — Corpus migration (CONTENT — separate, sequenced, NOT in the SYSTEM commit)
- Run `normalize-skill-field-shape.js --apply` per skill (mechanical move; never authors semantic
  fields, never bumps `schema_version`) OR `/audit:*`, one skill per commit with Audit Status evidence.
- Un-migrated skills fail frontmatter lint with "unexpected audit field" → tracked by **ONE** CONTENT
  follow-up ticket the audit loop drains. `verify:system` stays green throughout; full `verify` goes
  green as the corpus completes.

## Pilot-first strategy (de-risk the manifest-join)

Before touching the corpus or all consumers: pick ONE skill, hand-author its `audit-state.json`,
strip those fields from its `SKILL.md`, and prove the round-trip — frontmatter+sidecar →
`generate-manifest.js` → manifest `health`/`eval`/`lifecycle` blocks byte-identical to the pre-cut
manifest, and `skill-graph-route.js` gates it identically. Only then roll Phases 4–6.

## Verification gates

- `npm run verify:system` green after Phases 1–5 (SYSTEM-only gate; excludes corpus lint by design).
- Pilot round-trip: manifest health/eval/lifecycle byte-identical pre/post for the pilot skill.
- Router parity: a fixed query set returns identical selected/co-loaded/excluded pre/post for the pilot.
- Cross-file lint: a skill with `comprehension_state: present` but missing Understanding prose fails.
- `check-version-earned.js`: still blocks an unearned bump reading from the sidecar.

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Manifest-join drops a field the router gates on → silent quality-gate failure | Pilot byte-diff of the manifest health/eval/lifecycle blocks before rollout; router parity test |
| Cross-file gates (`comprehension_state`↔Understanding, `stability`↔`superseded_by`) unexpressible in one schema | Move them to `skill-lint.js` cross-file checks (Phase 4) with explicit tests |
| `schema_version` absent breaks a parser expecting it | Parser defaults to current contract (clean-cut); add a test for version-absent frontmatter |
| Un-migrated corpus floods lint red, blocking unrelated SYSTEM work | `verify:system` excludes corpus lint; SYSTEM ships green independent of migration |
| Two templates drift | `skill-audit-preflight.js --ensure` scaffolds both from the two schemas; one generator |

## Out of scope (tracked separately)
- `routing_bundles` 0-consumer resolution (remove vs library-level config).
- Any redesign of the moved fields' values — this cut is lift-and-shift of placement only.

## Completeness
All 28 moved fields + 25 retained + 2 retired accounted for (`field-placement.json`). Every consumer
that reads an audit/eval/provenance field (P1a consumer map) has a Phase-4 row. Items excluded: none.
