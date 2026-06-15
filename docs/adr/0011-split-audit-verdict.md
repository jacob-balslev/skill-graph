# ADR-0011: Split Audit Authority from Form to Behavior — Per-Layer Verdicts

**Status:** Accepted
**Date:** 2026-05-19
**Deciders:** Jacob Balslev (owner), Opus (convener), Gemini Pro, GPT (Codex)
**Schema:** v6 → v7 (breaking; the migration procedure was later retired by [ADR 0014](0014-canonical-only-schema-files.md) — the migration narrative lives in git history + this ADR)
**Supersedes:** the single `audit_verdict` aggregate field introduced in v6
**Tags:** schema, audit-loop, evaluation, breaking-change, form-vs-behavior

> **Amendment (2026-05-29) — grader-model.** The comprehension grader (gate 8) runs on **Opus** (`DEFAULT_COMPREHENSION_GRADER_MODEL = 'opus'`), per `~/Development/.claude/rules/no-lesser-models-for-quality.md` — quality judging uses the strongest model. The **baseline-skip early-exit** (`SKIPPED_BASELINE_HIGH` when `avg_primary_baseline >= threshold` after the first 2 completed evals) is the token-cost mitigation: a saturated concept grades only the first 2 evals and then skips the remainder.

> **Amendment (2026-06-14) — verdict placement moved to the sidecar.** The verdicts described below as the `SKILL.md` frontmatter "Health Block" were **relocated to the `audit-state.json` sidecar** by [ADR-0019](0019-audit-state-sidecar-separation.md); the per-layer verdict *model* stands — only its file placement changed. Operational scripts this ADR names at workspace `scripts/skill/` paths now live in the skill-graph repo under `lib/audit/` per the 2026-06-05 canonical-location directive.

## Context

The Skill Graph audit pipeline measures **form** (lint, schema, file shape, manifest census, naming), **truth** (truth-source drift, claim verification), and **recitation/comprehension** (does an agent given the skill understand the concept). The v6 contract compressed all of this into a single `audit_verdict` field.

Every `audit_verdict: PASS` on every skill in the corpus was therefore a form+truth+recitation verdict mislabelled as one undifferentiated "quality" verdict. The single field could not answer "is form clean?" separately from "is truth current?" separately from "does an agent comprehend it?" without a string match, and downstream tools (manifest, routing, marketplace) could not route on individual layers.

**Concrete symptom in the live corpus:** a skill could carry `audit_verdict: PASS` alongside `eval_score: 0` and failing eval IDs. The combined surface was incoherent — the reader saw PASS and failure at the same time, with no field that said "structurally pass, behaviorally unvalidated."

**The framing failure underneath the metric failure.** The pipeline measured whether a skill was *well-formed* and treated that as a proxy for *useful*. Form is necessary infrastructure but it is not sufficient — a skill can be well-formed and behaviorally redundant, lint-clean and stale, schema-valid and ceiling-saturated against baseline.

**External constraints are real and must be respected.** Anthropic's Agent Skills marketplace enforces a 1024-character description limit, a required-fields shape, and valid YAML frontmatter; OpenAI's tool-use surface has similar hard limits. Those constraints are non-negotiable. But every *internal* style check (naming conventions, body section presence, header hierarchy) is style, not behavior, and should not produce a PASS/FAIL verdict that influences whether the skill ships.

## Decision

Two coupled changes that take effect together.

### Change 1: Split `audit_verdict` into per-layer verdicts

Replace the single v6 `audit_verdict` field with discrete verdicts, each scoped to one layer of the audit pipeline:

```yaml
structural_verdict:    PASS | PASS_WITH_FIXES | FAIL | UNVERIFIED
truth_verdict:         PASS | DRIFT | BROKEN | UNVERIFIED
comprehension_verdict: PASS | SHALLOW | REDUNDANT | UNVERIFIED |
                       PROVISIONAL | SKIPPED_BASELINE_HIGH | NA
```

| Field | Layer | What it certifies | Default for the v6 corpus |
|---|---|---|---|
| `structural_verdict` | Form (gates 1–2, 7) | Skill is exportable: external-constraint shape (see Change 2) | PASS (rolled from `lint_verdict`) when available, else UNVERIFIED |
| `truth_verdict` | Truth (gates 3–6) | Truth sources align with declared `last_verified` and hashes | PASS (rolled from `drift_status: OK`) when available, else UNVERIFIED |
| `comprehension_verdict` | Behavior (gate 8) | A representative agent given the skill comprehends the concept measurably deeper than baseline | UNVERIFIED until the comprehension grader runs |

`structural_verdict` and `truth_verdict` are the **Integrity Gate** — necessary infrastructure (the skill loads, exports, and stays current) but not a quality assessment. `comprehension_verdict` is the **Behavior Gate** quality signal: `PASS` is earned only from the independent dual-run grader; `PROVISIONAL` records a single-model self-assessment; `SKIPPED_BASELINE_HIGH` is the expected verdict for any concept the foundation model already knows. Confidence ordering and the full enum semantics are canonical in [`docs/verdict-semantics.md`](../verdict-semantics.md).

### Change 2: Narrow form-gate authority to external constraints only

Form checks are demoted from "gates that produce a PASS/FAIL verdict" to one of two tiers:

| Tier | What's enforced | Effect on verdict |
|---|---|---|
| **External-constraint compliance** | Anthropic Agent Skills 1024-char description limit, required-fields shape, valid YAML, marketplace schema conformance; OpenAI/Codex hard limits when applicable. | Sets `structural_verdict` — FAIL when violated, PASS when clean. |
| **Internal style** | Title length below the external limit, body section structure, naming conventions, header hierarchy, comment style. | Lint **warnings** — never set `structural_verdict: FAIL`. |

The redirect rule: if a check exists because an external API or the marketplace export pipeline will reject the skill, it is structural and enforced. If it exists because someone wrote down an internal style preference, it is a warning.

## Options considered

### Option A — single `audit_verdict` field with extra enum values (rejected)
Extend the existing enum (`PASS_FORM_ONLY`, `PASS_BEHAVIOR_VERIFIED`, …). Minimal migration, but the single field still compresses independent layers into one signal — readers cannot answer "is form clean?" separately from "is behavior verified?", and downstream tools cannot route on individual layers. Keeps the lie that form is the primary signal; only renames it.

### Option B — nested Health Block per layer (rejected)
`health: { structural: {...}, truth: {...}, … }`. Clean grouping, but breaks every tool that reads the flat block (manifest projection, JSON-LD context, lint, status display) and contradicts the v5→v6 doctrine of flattening nested blocks because flat reads better in YAML.

### Option C — flat per-layer verdict fields (chosen)
Replace the single `audit_verdict` with flat top-level verdict fields, keeping the other Health Block fields (`lint_verdict`, `drift_status`, `eval_score`, `eval_failed_ids`, `last_audited`, `last_changed`) unchanged so they continue to surface per-script fine-grained signal alongside the new audit-loop roll-up verdicts. Matches the v6 flattening doctrine, each verdict queryable in one regex, and preserves backwards-compat for tools that already read `lint_verdict`/`drift_status` directly.

## Consequences

- All active + archived skills migrate to the per-layer shape. `comprehension_verdict: UNVERIFIED` is the honest default until the grader runs.
- The operational scripts that wrote `audit_verdict` write the per-layer verdicts instead; `audit_verdict` is removed from the canonical schema and the migrator strips it from skill frontmatter.
- The schema files, JSON-LD context, manifest schema, field reference, protocol docs, manifest field mapping, and skill template all carry the per-layer contract.
- The marketplace export pipeline projects the verdicts into the manifest under `health.*`.
- **Behavioral risk — same-model bias on the grader.** LLM-as-judge bias is mitigated (anti-compression mandate + BARS calibration in the grader prompt; the independent dual-run grader earns `PASS`) but not eliminated; long-term mitigation requires task-outcome telemetry, out of scope here.
- **Auto-generation is forbidden.** LLM-authored eval cases create a closed-loop synthetic-eval lie; every comprehension case must be human-authored from an external anchor.

## Addendum 2026-05-27 — Eligibility vs Assessment

The verdict split fixed the verdict-layer conflation, but the same conflation can recur at the reporting layer: a `structural_verdict: PASS` reads as evidence of corpus health even though it only certifies the skill is *eligible* for assessment. The sharper framing: **lint is the admission ticket, not the performance review.** The canonical statements live in [`docs/verdict-semantics.md`](../verdict-semantics.md); this addendum carries the rationale.

- **Eligibility is not assessment.** Structural and truth verdicts certify a skill is *eligible* for quality assessment; they are not the assessment. A skill with `structural_verdict: PASS` and `comprehension_verdict: UNVERIFIED` is unassessed, not approved. Reporting must distinguish eligibility from assessment.
- **The corpus dashboard model is cumulative gates, not orthogonal axes:** every assessed skill IS-A admitted skill; a skill cannot be assessed without being admitted.
- **`SKIPPED_BASELINE_HIGH` is not comprehension-unassessed.** Framework-concept skills the foundation model already knows legitimately skip comprehension grading; reporting that buckets them into "unassessed" under-reports eval state.

## Review trigger

Revisited when a repeatable task-outcome telemetry source (PR-merge / bug-resolution tracking) comes online that lets us cross-validate `comprehension_verdict` against ground truth, or when Anthropic/OpenAI change their Agent Skills schema in a way that requires `structural_verdict` to enforce new external constraints.

## Sources

- `~/Development/.roundtable/skill-audit-2026-05-19/SYNTHESIS.md` — full diagnosis and decision rationale.
- `~/Development/.roundtable/skill-audit-2026-05-19/response-gemini.md` — behavioral modification as the unit of skill quality.
- `~/Development/.roundtable/skill-audit-2026-05-19/response-gpt55.md` — the verdict-split proposal and runner-fork finding.
- SkillsBench (arXiv 2602.12670) — empirical evidence that foundation models cannot reliably author the procedural knowledge they benefit from consuming.
