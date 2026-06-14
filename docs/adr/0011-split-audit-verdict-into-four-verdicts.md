# ADR-0011: Move Audit Authority from Form to Behavior — Four-Verdict Health Block

**Status:** Accepted
**Date:** 2026-05-19
**Deciders:** Jacob Balslev (owner), Claude Opus 4.7 (convener), Gemini 3 Pro, GPT-5.5 (Codex)
**Schema:** v6 → v7 (breaking; the standalone `docs/migrations/v6-to-v7.md` procedure was later retired by [ADR 0014](0014-canonical-only-schema-files.md) — the migration narrative now lives in git history + this ADR)
**Supersedes:** the single `audit_verdict` aggregate field introduced in v6
**Tags:** schema, audit-loop, evaluation, breaking-change, form-vs-behavior

> **Amendment (2026-05-29) — gate-8 grader-model demotion superseded.** Change 3 / the Consequences section demoted the comprehension grader (gate 8) to Haiku 4.5 for token cost. That **grader-model** choice is reversed: the comprehension grader returns to **Opus** (`DEFAULT_COMPREHENSION_GRADER_MODEL = 'opus'`), per `~/Development/.claude/rules/no-lesser-models-for-quality.md` — quality judging uses the strongest model; a lesser model must never score skill quality. The rest of this ADR stands: `application_verdict` remains the primary quality signal, and the **baseline-skip early-exit** (`SKIPPED_BASELINE_HIGH` when `avg_primary_baseline >= threshold` after the first 2 completed evals) is retained as the token-cost mitigation — for a saturated concept the run grades only the first 2 evals (both runs, on Opus) and then skips the remainder, rather than grading the full set or grading with a weak model. The saving is the skipped remainder on saturated concepts; concepts that are NOT saturated now grade in full on Opus, so the token cost on those returns to the pre-demotion level. (The original Consequences estimate of ~80% reduction assumed a cheap grader on every call; with Opus restored, the realized saving depends on how many concepts actually skip.)

> **Amendment (2026-06-14) — verdict placement moved to the sidecar; script paths relocated.** The four verdicts described below as the `SKILL.md` frontmatter "Health Block" were **relocated to the `audit-state.json` sidecar** by [ADR-0019](0019-audit-state-sidecar-separation.md) (2026-06-01); the four-verdict *model* stands — only its file placement changed. Operational scripts this ADR names at workspace `scripts/skill/` paths (e.g. `skill-evolution-loop.js`) now live in the skill-graph repo under `lib/audit/` per the 2026-06-05 canonical-location directive.

## Context

The Skill Graph audit pipeline has 9 gates. 8 of them measure **form** (lint, schema, file shape, manifest census, naming) or **recitation** (does the model remember the concept). 1 of them — the application grader (gate 9) — measures **behavior change** on real artifacts. It has never been run on a live skill.

Every `audit_verdict: PASS` on every skill in the 284-skill corpus is therefore a form+recitation verdict mislabelled as a quality verdict. The single field is structurally a lie about quality. It certifies that a skill is well-formed and that the model can recite it. It does not certify that loading the skill changes how an agent solves real problems.

**Three concrete symptoms in the live corpus:**

1. `skills/cognitive-load-theory/SKILL.md` carries `audit_verdict: PASS` alongside `eval_score: 0` and `eval_failed_ids: [1, 2, 3]`. The combined surface is incoherent — the reader sees PASS and failure at the same time, with no field that says "structurally pass, behaviorally unvalidated."
2. Gate 8 (the comprehension grader) has burned an estimated $5,000–$15,000 in Opus tokens to date measuring **recitation** under the name "understanding." The corpus is dominated by framework concepts (CLT, Toulmin, FMEA, DSRP, Meadows, OODA, design thinking) that foundation models already know from training. The grader ceiling-saturates on baseline: 1,919 comprehension runs sampled show most concepts at `baseline 2.00 / with-skill 2.00 / delta 0.00`.
3. Gate 9 — the only gate that measures behavior change — exists in `scripts/skill/evaluate-skill.js --application`, has a hand-authored 5-case pilot at `skills/_archived/financial-domain-fundamentals/evals/application.json`, and **has never run on a live skill**.

**External corroboration.** SkillsBench (arXiv 2602.12670, 7,308 evaluated trajectories across 7 agent-model configurations) found that **19% of evaluated skills produce *negative* deltas — they make agents worse**. The current Skill Graph pipeline cannot detect any of those, because no Skill Graph skill has ever been measured for operational behavior change.

**The framing failure underneath the metric failure.** The pipeline measures whether a skill is *well-formed* (title length, description length, file shape, schema conformance) and treats that as a proxy for *useful*. It is not. A skill can be well-formed and behaviorally redundant. A skill can be lint-clean and harmful. A skill can be schema-valid and ceiling-saturated against baseline. Form is necessary infrastructure but it is not quality.

**External constraints are real and must be respected.** Anthropic's Agent Skills marketplace enforces a 1024-character description limit, required-fields shape, and valid YAML frontmatter. OpenAI's tool-use surface has similar hard limits. Those constraints are non-negotiable because the skill becomes unusable if they are violated. But every other form check (internal naming conventions, body section presence, style preferences, title length below external limits) is internal style, not behavior. Style preferences should not produce a PASS/FAIL verdict that influences whether the skill ships or gets demoted in routing.

## Decision

Three coupled changes that take effect together.

### Change 1: Split `audit_verdict` into four independent verdicts

Replace the single v6 `audit_verdict` field with four discrete Health Block fields, each scoped to one layer of the audit pipeline:

```yaml
# v7 Health Block — four-verdict shape
structural_verdict:    PASS | PASS_WITH_FIXES | FAIL | UNVERIFIED
truth_verdict:         PASS | DRIFT | BROKEN | UNVERIFIED
comprehension_verdict: PASS | SHALLOW | REDUNDANT | UNVERIFIED |
                       SKIPPED_BASELINE_HIGH | NA
application_verdict:   APPLICABLE | REDUNDANT | HARMFUL | MIXED |
                       FALSE_POSITIVE | UNVERIFIED | PROVISIONAL |
                       NOT_DISCRIMINATED_CEILING |
                       EQUIVALENT_ON_FRONTIER
```

| Field | Layer | What it certifies | Default for the v6 corpus |
|---|---|---|---|
| `structural_verdict` | Form (gates 1–2, 7) | Skill is exportable: external-constraint shape (see Change 2) | PASS (rolled from `lint_verdict`) when available, else UNVERIFIED |
| `truth_verdict` | Truth (gates 3–6) | Truth sources align with declared `last_verified` and hashes | PASS (rolled from `drift_status: OK`) when available, else UNVERIFIED |
| `comprehension_verdict` | Recitation (gate 8, demoted) | Optional: cheap smoke test that the model has the concept | UNVERIFIED — will be SKIPPED_BASELINE_HIGH on the next audit for most framework concepts |
| `application_verdict` | Behavior (gate 9) | Loading the skill changes agent behavior on real artifacts | UNVERIFIED — no skill has been audited via gate 9 yet |

`application_verdict` is the only field that certifies the skill is **useful**. The other three are necessary infrastructure (the skill loads, exports, and stays current) but not sufficient. A skill is only behaviorally certified when `application_verdict: APPLICABLE`.

### Change 2: Narrow form-gate authority to external constraints only

Form checks are demoted from "gates that produce a PASS/FAIL verdict" to one of two tiers:

| Tier | What's enforced | Effect on verdict |
|---|---|---|
| **External-constraint compliance** | Anthropic Agent Skills marketplace 1024-char description limit, required-fields shape, valid YAML frontmatter, name/description present, marketplace schema conformance. OpenAI/Codex tool-use API hard limits when applicable. | Sets `structural_verdict` — FAIL when violated, PASS when clean. |
| **Internal style** | Title length below external limit, body section structure, internal naming conventions, header hierarchy, comment style, file shape preferences. | Lint **warnings** — never sets `structural_verdict: FAIL`. Optionally emits to a separate `style_warnings` field if useful telemetry; otherwise the lint pass surfaces them in console output but does not block. |

The redirect rule: if a check exists because Anthropic's API or OpenAI's API or the marketplace export pipeline will reject the skill, it is structural and enforced. If a check exists because someone wrote down an internal style preference, it is a warning. No internal style preference produces a PASS/FAIL verdict.

This is a doctrine change, not just a schema change. Subsequent work (Linear follow-up, not part of this commit) needs to walk every check in `scripts/skill-lint.js`, `scripts/lint/*.js`, and the related routing/manifest validators, and reclassify each as external-constraint vs internal-style. Internal-style checks get demoted to warnings or removed.

### Change 3: `application_verdict` becomes the primary quality signal

The audit loop's authority shifts from form to behavior. Specifically:

- The walker (`scripts/skill/skill-evolution-loop.js`) reads `application_verdict` first when picking the next skill to improve. `UNVERIFIED`, legacy `REDUNDANT`, `NOT_DISCRIMINATED_CEILING`, or `EQUIVALENT_ON_FRONTIER` skills with high routing centrality get priority.
- The aggregate "is this skill good?" signal is `application_verdict == APPLICABLE`. No combination of structural/truth/comprehension verdicts produces a usefulness claim.
- The marketplace publication pipeline does not promote a skill solely on form-clean checks. `application_verdict == UNVERIFIED` is published transparently as "behavior unvalidated" rather than rolled into PASS via the old aggregate.

`comprehension_verdict` is retained but explicitly **never alone certifies a skill**. Its job is to catch genuine recitation failures on project-invented or repo-specific concepts where the foundation model has no training prior. For framework concepts (CLT, Toulmin, FMEA, etc.) the grader will write `SKIPPED_BASELINE_HIGH` and exit early without an Opus call.

## Options considered

### Option A — Single `audit_verdict` field with extra enum values (rejected)

Extend the existing enum to `PASS_FORM_ONLY`, `PASS_BEHAVIOR_VERIFIED`, etc. Smaller change, no schema bump.

- Pro: minimal migration cost.
- Con: the single field still compresses four independent layers into one signal. Readers cannot answer "is form clean?" separately from "is behavior verified?" without a string match. Tools downstream (manifest, routing, marketplace) cannot route on individual layers.
- Con: keeps the lie that form is the primary signal — only renames the lie.

### Option B — Separate Health Block per layer (heavier shape, rejected)

Replace the flat Health Block with a nested object: `health: { structural: {...}, truth: {...}, ... }`.

- Pro: clean grouping. Easier to extend with per-layer metadata (run timestamps, sub-scores).
- Con: breaks every tool that reads the flat Health Block today (manifest projection, JSON-LD context, lint, status display). Migration cost ~3× higher than the chosen split.
- Con: contradicts the v5→v6 doctrine of *flattening* nested blocks because flat reads better in YAML.

### Option C — Four flat verdict fields (chosen)

Replace the single `audit_verdict` with four flat top-level fields. Keep the other Health Block fields (`lint_verdict`, `drift_status`, `eval_score`, `eval_failed_ids`, `last_audited`, `last_changed`) unchanged so they continue to surface per-script fine-grained signal alongside the new audit-loop roll-up verdicts.

- Pro: matches the v6 flattening doctrine. Each verdict is a single field, queryable in one regex.
- Pro: preserves backwards-compat for tools that already read `lint_verdict` and `drift_status` directly.
- Pro: the four-axis taxonomy maps cleanly to the ECIR 2025 Parametric vs Contextual Knowledge framework (Augenstein, arXiv 2603.09654) — Supportive → REDUNDANT, Complementary → APPLICABLE, Conflicting → HARMFUL or MIXED, Irrelevant → REDUNDANT.
- Con: net +3 fields on every skill. Mitigated by the migrator and the migration doc.

## Consequences

### Immediate (this commit)

- All 284 active skills + 52 archived skills get migrated to v7 shape. `application_verdict: UNVERIFIED` is the default for every skill — the honest state given gate 9 has never run.
- The four operational scripts that write `audit_verdict` today (`scripts/skill/skill-evolution-loop.js`, `scripts/skill/skill-census.js`, `scripts/skill/backfill-audit-state.js`, `skill-graph/lib/audit/skill-status.js`) write the four new verdicts instead. `audit_verdict` is removed from the canonical schema and the migrator strips it from skill frontmatter.
- The schema files (`SKILL_METADATA_PROTOCOL_schema.json`, plus a pinned `skill.v7.schema.json` mirror later retired by [ADR 0014](0014-canonical-only-schema-files.md)), the JSON-LD context (`skill.context.jsonld`), the manifest schema (`manifest.schema.json`), the field reference (`docs/SKILL_METADATA_PROTOCOL_field-reference.md` + regenerated `SKILL_METADATA_PROTOCOL_field-reference.generated.md`), the protocol docs, the manifest field mapping, and the skill template all carry the v7 contract.
- The marketplace export pipeline (`scripts/export-marketplace-skills.js`) projects the four verdicts into the manifest under `health.*` as today.
- The migrator script supports `--reverse` for round-trip testing and emergency rollback. Reverse is lossy by construction (the four verdicts collapse back into one).

### Follow-up (subsequent commits, tracked in Linear)

- **Demote form gates in `skill-lint.js` and `scripts/lint/*.js`** to the external-constraint vs internal-style split described in Change 2. Internal-style checks become warnings; external-constraint checks remain hard FAIL on `structural_verdict`. Estimated scope: ~1 day eng. Tracked as the lint-demotion follow-up Linear task.
- **Demote gate 8 (the comprehension grader)** to Haiku 4.5 or Gemini 3.1 Flash and add the `avg_primary_baseline >= 1.0` early-skip path. Estimated scope: ~½ day eng. This is SYNTHESIS §6 step 5 — committed separately in this session as Step 4 of the prompt.
- **Run the 4-skill application pilot panel** (`_archived/financial-domain-fundamentals`, `cognitive-load-theory`, `toulmin-argument`, `receipts`) to validate that `application_verdict` discriminates across scenario types. This is SYNTHESIS §6 step 3 and Step 3 of the prompt. The three new skills need hand-authored `application.json` files anchored on external evidence (real PR diffs, real agent failures, real audit findings) — never auto-generated from the skill body. Estimated scope: ~3 days human authoring + ~$100–$200 in API spend.
- **Extend the application grader rubric** for generative scenario types (`scenario_type: "generation"`, axes for constraint compliance and trajectory divergence). The current 4-axis rubric (`flag_correctness`, `fix_correctness`, `false_positive_avoidance`, `primary_signal_clarity`) assumes audit/review scenarios. This is SYNTHESIS §6 step 4. Out of scope for this session — pilot results inform the rubric extension.
- **Classify 325 existing `evals.json` files** as recitation, route/boundary, or application-like. Promote application-like cases to `application.json`; archive pure recitation as historical. SYNTHESIS §6 step 7. Out of scope this session.
- **Tier the corpus-wide application backfill** (Tier A: top ~30 by injection telemetry; Tier B: gated on new skills; Tier C: deferred). SYNTHESIS §6 step 6. Out of scope this session.

### Token cost impact

- Gate 8 demotion (follow-up): ~80% token-cost reduction on comprehension passes — the bulk of skills will hit the baseline-skip early exit.
- Gate 9 introduction: per-skill application audit costs roughly 20 model invocations (5 cases × 2 runs × generator+grader). The 4-skill pilot is ~$100–$200; a full-corpus sweep is ~$8,700–$9,100, gated on the Tier rollout above. This is a release-milestone cost, not a weekly hygiene cost.
- Net: form-gate work is free (deterministic scripts). Comprehension work drops ~10× per skill. Application work is the new spending — concentrated on Tier A skills.

### Behavioral risk

- **Same-model bias on the application grader.** All three roundtable respondents flagged LLM-as-judge bias on rubrics the grader was trained against. The anti-compression mandate and BARS calibration in the existing grader prompt mitigate but do not eliminate it. Long-term mitigation requires task-outcome telemetry (did the PR merge? did the bug get fixed?) — not in scope here.
- **Auto-generation is forbidden.** All four roundtable respondents independently warned that LLM-authored eval cases create a closed-loop synthetic-eval lie. SkillsBench corroborates: "Self-generated skills provide no measurable benefit on average." Every application case must be human-authored from an external anchor.
- **The verdict naming is load-bearing.** `APPLICABLE` / `REDUNDANT` / `HARMFUL` / `MIXED` / `FALSE_POSITIVE` / `UNVERIFIED` map directly to the SkillsBench-style negative-delta taxonomy. If the pilot finds these don't fit observed verdicts, the enum needs revision — but adding values is non-breaking on top of v7.

## Review trigger

This decision is revisited when any of the following happens:

- The 4-skill pilot panel runs and the verdicts look like noise (no discrimination between framework / argumentation / generative / financial-correctness scenarios). The rubric needs revision before the corpus-wide rollout proceeds.
- A repeatable task-outcome telemetry source comes online (PR-merge tracking, bug-resolution tracking) that lets us cross-validate `application_verdict` against ground truth. The verdict semantics should then anchor on that telemetry, not on grader output alone.
- SkillsBench publishes an updated benchmark or a new academic benchmark of agent skills produces a different taxonomy that better predicts negative-delta skills.
- Anthropic or OpenAI changes their Agent Skills schema in a way that requires `structural_verdict` to enforce new external constraints.

## Implementation evidence

This commit lands:

- `skill-graph/schemas/SKILL_METADATA_PROTOCOL_schema.json` — active contract bumped to v7. `audit_verdict` removed, four new verdict fields added with full descriptions.
- `skill-graph/schemas/skill.v7.schema.json` — pinned snapshot of the v7 contract. _(Later retired by [ADR 0014](0014-canonical-only-schema-files.md) — canonical-only schema model; this file no longer exists on disk.)_
- `skill-graph/schemas/skill.v6.schema.json` — unchanged (pinned v6 historical). _(Later retired by [ADR 0014](0014-canonical-only-schema-files.md) along with the other pinned versions.)_
- `skill-graph/scripts/migrate-skill-v6-to-v7.js` — codemod with `--apply`, `--dry-run`, `--reverse`. Migrates the canonical authoring source at `~/Development/skills/`; skips the marketplace mirror at `~/Development/skills/skills/` (regenerated post-migration). _(Codemod retired by [ADR 0014](0014-canonical-only-schema-files.md) after the corpus migration completed.)_
- `skill-graph/docs/migrations/v6-to-v7.md` — breaking-change matrix and migration procedure. _(Retired by [ADR 0014](0014-canonical-only-schema-files.md); the narrative now lives in git history + this ADR.)_
- `skill-graph/AGENTS.md` § Project Shape — current skill contract advanced to `schema_version: 7`.
- `skill-graph/CHANGELOG.md` — v7 entry.

Operational script updates (Option C hybrid scope — keeps the audit loop functioning under v7):

- `scripts/skill/skill-evolution-loop.js` — aggregates `lint_verdict` → `structural_verdict`, `drift_status` → `truth_verdict`. Writes all four new verdicts on every audit run (`comprehension_verdict: UNVERIFIED` and `application_verdict: UNVERIFIED` by default until their respective graders run).
- `scripts/skill/skill-census.js` — `VALID_AUDIT_VERDICTS` replaced by four per-field enums. Validation and census output use the new fields.
- `scripts/skill/backfill-audit-state.js` — derives `structural_verdict` from scorecard grade letter (was deriving `audit_verdict`).
- `skill-graph/lib/audit/skill-status.js` — `HEALTH_BLOCK_FIELDS` includes the four new verdict fields in canonical display order.

Coupled doc updates (per `AGENTS.md` § Coupled Changes):

- `skill-graph/docs/SKILL_METADATA_PROTOCOL_field-reference.md` — four new field sections; `audit_verdict` section marked deprecated and linked here.
- `skill-graph/docs/SKILL_METADATA_PROTOCOL_field-reference.generated.md` — regenerated via `node scripts/build-field-reference.js`.
- `skill-graph/docs/skill-metadata-protocol.md` — v7 Health Block shape, deprecation note for `audit_verdict`.
- `skill-graph/SKILL_METADATA_PROTOCOL.md` — same.
- `skill-graph/docs/manifest-field-mapping.md` — four new mapping rows; old `audit_verdict` row marked deprecated.
- `skill-graph/examples/skill-metadata-template.md` — template uses the new fields.
- `skill-graph/schemas/skill.context.jsonld` — JSON-LD context adds the four new properties; keeps `audit_verdict` aliased to `structural_verdict` for forward-compat reads of older manifests.
- `skill-graph/schemas/manifest.schema.json` — manifest projection adds `health.{structural,truth,comprehension,application}_verdict`; `health.audit_verdict` kept as optional for back-read compat.

## What this decision does NOT do

- It does not introduce a new gate. There are still four substantive layers (structural, truth, comprehension, application). The number of gates stays at 9 in the underlying scripts; the verdict surface compresses gates into four roll-ups, not nine.
- It does not enforce that every skill has an `application.json` immediately. The Tier rollout in SYNTHESIS §6 step 6 governs that. The honest default is `application_verdict: UNVERIFIED`.
- It does not delete the existing 325 `evals.json` files. Classification and selective promotion happens in SYNTHESIS §6 step 7.
- It does not retire the comprehension grader entirely. Demotion (cheap model + baseline-skip) is in scope; deletion is not.
- It does not modify lint behaviour in this commit. The lint demotion (external-constraint vs internal-style reclassification) is a follow-up tracked in Linear.

## Addendum 2026-05-20 — comprehension and application are BOTH quality signals

User ruling (2026-05-20), resolving "is comprehension demoted, or is the Understanding layer the standard?": **both are important.** This affirms — it does not reverse — the original decision:

- `application_verdict` remains the aggregate "is this skill good?" signal (behaviour change on real artifacts). This addendum does not promote comprehension to a co-equal *certification*.
- `comprehension_verdict` is **not** demoted to irrelevance. It is the required standard for the case the application layer cannot cheaply cover: **project-invented and repo-specific concepts** where the foundation model has no training prior. For framework concepts (CLT, Toulmin, FMEA, …) it still early-skips via `SKIPPED_BASELINE_HIGH` and is genuinely optional.
- Practical reading: a skill is "good" when `application_verdict == APPLICABLE`; a repo-specific skill is *additionally* untrustworthy if its `comprehension_verdict` is `SHALLOW`/`REDUNDANT`. Neither verdict is dropped; "both important" = comprehension where the prior is absent, application everywhere.

**Concrete enabler gap (verified 2026-05-20):** gate 8 only appends to `agent-orchestration/logs/comprehension-history.jsonl` (`scripts/skill/evaluate-skill.js` ~line 890) and never writes `comprehension_verdict` back to frontmatter — so the field reads `UNVERIFIED` corpus-wide regardless of grader output. To operationalize "comprehension is a signal," gate 8 needs a `--write-verdict` path that stamps `comprehension_verdict` (parallel to `skill-lint.js` → `structural_verdict` and drift → `truth_verdict`). Until then comprehension is measured but not persisted as a verdict. Tracked as a follow-up.

## Addendum 2026-05-27 — Eligibility vs Assessment; APPLICABLE Bounded by Eval Contract

Diagnosed in conversation 2026-05-27: the v6→v7 verdict split (this ADR) fixed the verdict-layer conflation, but **the same conflation has recurred at the operational reporting layer**. A `structural_verdict: PASS` still reads as evidence of corpus health on every current dashboard surface, even though `application_verdict` (the only field that certifies usefulness) sits at `UNVERIFIED` corpus-wide because gate 9 has never run on a live skill. The sharper framing: lint is the **admission ticket**, not the **performance review**. The "floor vs target" language in the original decision implies a single continuous axis; the operationally useful framing splits it into two categorically different questions about a skill.

This addendum makes two epistemic claims explicit. The canonical statements live in [`docs/verdict-semantics.md`](../verdict-semantics.md); this addendum carries the decision rationale.

### Claim 1 — Eligibility is not assessment

Structural and truth verdicts certify a skill is **eligible** for quality assessment. They do not constitute quality assessment itself. A skill with `structural_verdict: PASS` and `application_verdict: UNVERIFIED` is unassessed, not approved. Corpus reporting must distinguish eligibility from assessment, and an eligible-but-unassessed skill must be visually distinct from an eligible-and-certified one.

### Claim 2 — APPLICABLE is bounded by its eval contract

`application_verdict: APPLICABLE` certifies behavior change against the specific eval contract recorded at `evals/application.json@<git-sha>`, not universal quality. A skill graded against 5 weak cases is APPLICABLE in a weaker epistemic sense than one graded against 20 diverse cases anchored on real production failures and prior agent errors. The verdict label captures the grader output; the eval contract's scope, case count, and anchor sources determine the actual signal strength. Always read APPLICABLE alongside the eval contract's provenance, not as a standalone certification.

### Why these aren't a new ADR

These two claims are clarifications of the verdict split this ADR established, not a new independent decision. The original ADR's "necessary infrastructure but never sufficient" framing (Decision § Change 1) implicitly contains Claim 1; the "every application case must be human-authored from an external anchor" rule (§ Behavioral risk) implicitly contains Claim 2 as a procedural rule. This addendum makes both explicit as the underlying epistemic claims, so the doctrine + reporting layer can be built on them by name.

### Practical reading

- A corpus reporting "153 PASS" on structural is reporting eligibility, not approval. The honest equivalent today is "153 admitted, 0 quality-evaluated, 0 certified useful, 0 certified harmful."
- An `application_verdict: APPLICABLE` claim should always be cited with the eval contract it was earned against (commit SHA + case count + anchor type). The verdict label alone is insufficient context.
- The corpus dashboard model is **cumulative gates**, not orthogonal axes: every certified skill IS-A assessed skill; every assessed skill IS-A admitted skill. A skill cannot be certified without being assessed; cannot be assessed without being admitted.
- The comprehension scope carve-out (Addendum 2026-05-20) interacts with assessment counts: framework-concept skills with `comprehension_verdict: SKIPPED_BASELINE_HIGH` are NOT comprehension-unassessed — comprehension legitimately doesn't apply to them. Reporting that buckets `SKIPPED_BASELINE_HIGH` into "unassessed" under-reports eval state on the ~80% of the corpus that teaches framework concepts.

### Concrete enabler gap

No current reporting surface (`skill-status.js`, `generate-manifest.js::computeSummary()`, `build-status-doc.js`, `check-audit-manifest.js`) distinguishes admission from assessment or surfaces the `HARMFUL` and `PROVISIONAL` outcomes by name. The doctrine sentences above land at the doctrine layer; the operational reporting changes are tracked separately and reuse existing facet-bucketing patterns (do not require new schema fields).

## Sources

- `~/Development/.roundtable/skill-audit-2026-05-19/SYNTHESIS.md` — full diagnosis and decision rationale (§§1–7).
- `~/Development/.roundtable/skill-audit-2026-05-19/response-gemini.md` — Gemini 3 Pro's framework: behavioral modification as the unit of skill quality.
- `~/Development/.roundtable/skill-audit-2026-05-19/response-gpt55.md` — GPT-5.5's verdict-split proposal and runner-fork finding.
- `~/Development/skills/evaluation/references/intent-and-understanding-evaluation.md` — 30-source external research file underpinning the roundtable brief.
- SkillsBench (arXiv 2602.12670) — empirical evidence that 19% of evaluated skills produce negative deltas; foundation models cannot reliably author the procedural knowledge they benefit from consuming.
- Augenstein et al., ECIR 2025 keynote (arXiv 2603.09654) — Parametric vs Contextual Knowledge taxonomy that maps to the four `application_verdict` enum values.
- Counterfactual Probing for Hallucination Detection (arXiv 2508.01862) — empirical floor for perturbation-based eval methods.
