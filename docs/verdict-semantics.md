# Verdict Semantics — Canonical

> Type: Reference (binding)
> Authored: 2026-05-25 — closes the 5-way verdict-semantics restatement gap surfaced by the 2026-05-25 multi-model review (Opus G2#2 HIGH, GPT-5.5 G2#2 HIGH).
> Source of truth for verdict enums + tier ordering. All other surfaces should LINK to this file, not restate it.
> **The verdict is a guardrail, not an optimizer:** see [`docs/audit-loop-enrich-philosophy.md`](audit-loop-enrich-philosophy.md) — verdicts confirm an enriched skill helps and didn't regress; they must never drive stripping knowledge that didn't move a score.

## What this file is

The single canonical home for:

1. **The four Audit Status verdict fields** — `structural_verdict`, `truth_verdict`, `comprehension_verdict`, `application_verdict`.
2. **Each field's enum** — every valid value, what it means, what generates it.
3. **The confidence tier ordering** — `APPLICABLE > PROVISIONAL > UNVERIFIED` and friends.
4. **The disjointness rule** — comprehension and application enums are disjoint per the schema.

This doc REPLACES the verdict-semantics restatements that previously lived (drift-prone) in `skill-graph/AGENTS.md:50`, `skill-graph/skill-audit-loop/SKILL_AUDIT_LOOP.md:24`, `docs/reference/skill-audit-pipeline.md:22`, `.claude/rules/version-schema-contract.md:33`, and ADR-0011. Those files now carry one-line summaries + a link to this file.

## The four Audit Status fields (binding)

| Field | Layer | Owner | Source of truth |
|---|---|---|---|
| `structural_verdict` | Form / lint | Gates 1–2 + 7 (schema lint, manifest census, concept-card shape) | [`skill-graph/schemas/SKILL_METADATA_PROTOCOL_schema.json:241-249`](../schemas/SKILL_METADATA_PROTOCOL_schema.json) |
| `truth_verdict` | Truth-source freshness | Gates 3–6 (truth-source catalog, drift sentinel, test coverage, claim verification) | [`schemas/SKILL_METADATA_PROTOCOL_schema.json:251-259`](../schemas/SKILL_METADATA_PROTOCOL_schema.json) |
| `comprehension_verdict` | Did the skill teach? | Gate 8 (comprehension grader on `evals/comprehension.json`) | [`schemas/SKILL_METADATA_PROTOCOL_schema.json:261-272`](../schemas/SKILL_METADATA_PROTOCOL_schema.json) |
| `application_verdict` | Did the skill change agent behavior? | Gate 9 (application grader on `evals/application.json`) | [`schemas/SKILL_METADATA_PROTOCOL_schema.json:274-285`](../schemas/SKILL_METADATA_PROTOCOL_schema.json) |

**`application_verdict` is the primary quality signal.** A skill is only behaviorally certified when this verdict is `APPLICABLE`. The other three are necessary infrastructure but never sufficient. See ADR-0011 for the rationale (replaces the v6 aggregate `audit_verdict`).

**Eligibility is not assessment.** Structural and truth verdicts certify a skill is **eligible** for quality assessment. They do not constitute quality assessment itself. A skill with `structural_verdict: PASS` and `application_verdict: UNVERIFIED` is unassessed, not approved. Corpus reporting must distinguish eligibility from assessment, and an eligible-but-unassessed skill must be visually distinct from an eligible-and-certified one. See ADR-0011 § Addendum 2026-05-27 for the rationale.

**APPLICABLE is bounded by its eval contract.** `application_verdict: APPLICABLE` certifies behavior change against the specific eval contract recorded at `evals/application.json@<git-sha>`, not universal quality. A skill graded against 5 weak cases is APPLICABLE in a weaker epistemic sense than one graded against 20 diverse cases anchored on real production failures and prior agent errors. The verdict label captures the grader output; the eval contract's scope, case count, and anchor sources determine the actual signal strength. Always read APPLICABLE alongside the eval contract's provenance, not as a standalone certification.

### Why there is no fifth `displacement_verdict` (the 2026-05-25 decision)

The audit doctrine evaluates each skill on **three axes** ([`skill-audit-loop/SKILL_AUDIT_LOOP.md:13-21`](../skill-audit-loop/SKILL_AUDIT_LOOP.md)): intent fidelity, teaching efficacy, and **upstream currency (anti-displacement)**. But the Audit Status only carries **four verdict fields**, one per gate-output layer. There is intentionally **no fifth `displacement_verdict` / `upstream_verdict`** field. Why:

- **Displacement is recorded as a FINDING, not a verdict.** Per [`skill-audit-loop/SKILL_AUDIT_LOOP.md § Part 3:102, :176`](../skill-audit-loop/SKILL_AUDIT_LOOP.md#part-3--per-skill-audit-runbook), the upstream-displacement check writes a `category: DISPLACEMENT` finding when a recent first-party / platform / OSS release makes the skill's approach obsolete or strictly worse than a native capability. The finding carries one of three recommendations: **deprecate** (native fully supersedes) / **fold** (merge the still-useful delta into a broader skill) / **reframe-to-the-delta** (rewrite to teach only what the native does NOT).
- **Findings ≠ verdicts.** A verdict is a roll-up the four gates produce on every run. A finding is a per-issue record the human + curator triage. Displacement is well-suited to be a finding because: (a) it requires human judgment on the deprecate/fold/reframe call, never auto-deletion (per [`.claude/rules/code-preservation.md`](../../.claude/rules/code-preservation.md)); (b) "no displacement found" is the common valid result, which would clutter a verdict slot with `UNVERIFIED` / `N/A` noise; (c) displacement is an external-world signal (vendor releases), not a property of the skill the gates can measure directly.
- **The 2026-05-25 multi-model review surfaced this question** ([`.roundtable/skill-graph-restructure-review-2026-05-25/followup-tasks.md`](../../.roundtable/skill-graph-restructure-review-2026-05-25/followup-tasks.md) § F36). Resolved here: 3 axes for doctrine, 4 verdicts for Audit Status, 1 finding-category for displacement output. The mismatch in counts (3 vs 4) is not drift; it reflects that two gates (structural + truth) cover one axis (intent fidelity's foundation), one gate (comprehension) covers one axis (teaching efficacy's depth), one gate (application) covers teaching efficacy's behavior change, and the third doctrinal axis (upstream currency) intentionally bypasses the gate model.

If a future skill carries a DISPLACEMENT finding with a `requiredAction: follow-up` and the curator accepts a `deprecate` recommendation, that becomes a separate action (a deletion PR with explicit user sign-off) — never a verdict change in the Audit Status.

## Per-field enums

### `structural_verdict`

| Value | Meaning |
|---|---|
| `PASS` | Lint clean, no warnings. |
| `PASS_WITH_FIXES` | Warnings present but no errors. |
| `FAIL` | Lint or schema errors. |
| `UNVERIFIED` | No structural audit has run yet. |

### `truth_verdict`

| Value | Meaning |
|---|---|
| `PASS` | Truth sources align with declared `last_verified` and hashes. |
| `DRIFT` | Truth sources changed since `last_verified`. |
| `BROKEN` | Declared truth sources missing or unreadable. |
| `UNVERIFIED` | No truth audit has run yet. |

### `comprehension_verdict` (gate 8)

| Value | Meaning | Earned by |
|---|---|---|
| `PASS` | With-skill answers measurably deeper than baseline on the rubric dimensions. | Independent dual-run grader. |
| `PROVISIONAL` | A single competent model ran the comprehension assessment and recorded a real result. Lower confidence than `PASS` because not yet confirmed by the independent dual-run grader, but distinct from `UNVERIFIED` which means no assessment has run. | Single-model audit run. |
| `SHALLOW` | Skill recites the concept but does not deepen agent understanding. | Grader (single or dual). |
| `REDUNDANT` | Baseline already saturated — skill adds no comprehension lift. | Grader (single or dual). |
| `SKIPPED_BASELINE_HIGH` | Early-skip: `avg_primary_baseline >= 1.0` after the first 2 evals so the dual-run was aborted. | Procedural — no grader signal. |
| `NA` | Skill carries no `evals/comprehension.json` by design (the comprehension layer doesn't apply to this archetype). | Author's declaration. |
| `UNVERIFIED` | Initial state before any grader run. | Default for skills not yet assessed by the comprehension grader. |

**Comprehension graded set:** `{PROVISIONAL, PASS, SHALLOW, REDUNDANT}`. The verifier at `skill-graph/scripts/check-audit-manifest.js` requires `skills/<name>/evals/comprehension.json` to exist on disk when `comprehension_verdict` is in this set.

**Comprehension scope carve-out.** Gate 8 is the **required** behavior gate for skills teaching **project-invented or repository-specific concepts** where the foundation model has no training prior (e.g., repo internal conventions, custom frameworks, in-house DSLs). For framework concepts the model already knows (CLT, Toulmin, FMEA, OODA, design thinking, …), the grader early-skips via `SKIPPED_BASELINE_HIGH` and gate 8 is genuinely optional — `application_verdict` alone carries the quality signal. The carve-out lives in the verdict values themselves: `SKIPPED_BASELINE_HIGH` flags "framework-concept, comprehension legitimately doesn't apply"; `NA` flags "this skill ships no `comprehension.json` by design." Reporting that counts comprehension coverage must split these two values out of the unassessed bucket, or it will under-report eval state on framework-concept skills. Authority: ADR-0011 § Addendum 2026-05-20.

### `application_verdict` (gate 9)

| Value | Meaning | Earned by |
|---|---|---|
| `APPLICABLE` | Loading the skill changes agent behavior on real artifacts in the expected direction (flags, fixes, generative trajectory). | Independent dual-run grader. |
| `PROVISIONAL` | single-model self-assessment audit found useful behavior but the independent application grader has not confirmed it. | Single-model audit run. |
| `REDUNDANT` | No behavioral delta — agent behaves the same with or without the skill loaded. | Grader. |
| `HARMFUL` | Negative delta — agent makes worse decisions with the skill loaded. SkillsBench arXiv 2602.12670 found 19% of evaluated skills exhibit this. | Grader. |
| `MIXED` | Delta varies across cases — some applicable, some redundant or false-positive. | Grader. |
| `FALSE_POSITIVE` | Skill over-triggers — applies on cases where its expertise does not apply. | Grader. |
| `UNVERIFIED` | No application assessment has run. | Default. |

**Application graded set:** `{APPLICABLE, MIXED, HARMFUL}` is what the verifier currently considers "high-stakes" graded results. The full graded set (excluding `UNVERIFIED`) includes `REDUNDANT`, `PROVISIONAL`, and `FALSE_POSITIVE` as well; future application-artifact gates will use the full set.

## Disjointness rule (binding)

**The `comprehension_verdict` and `application_verdict` enums are disjoint.** No value belongs to both — except `UNVERIFIED` and `PROVISIONAL`, which carry the same semantic meaning in both fields (no assessment has run; or a single model has run an assessment but not the dual-run grader, respectively).

Specifically:

- `APPLICABLE`, `HARMFUL`, `MIXED`, `FALSE_POSITIVE` are **application-only**. They must never appear in `comprehension_verdict`.
- `PASS`, `SHALLOW`, `SKIPPED_BASELINE_HIGH`, `NA` are **comprehension-only**. They must never appear in `application_verdict`.
- `REDUNDANT` appears in both enums but means subtly different things (no comprehension lift vs no behavioral delta).
- `UNVERIFIED` and `PROVISIONAL` appear in both with identical semantics.

**This disjointness is enforced by:**

- `skill-graph/schemas/SKILL_METADATA_PROTOCOL_schema.json:261-285` — the `enum` arrays.
- `skill-graph/scripts/check-audit-manifest.js` — `GRADED_COMPREHENSION_VERDICTS` vs `GRADED_APPLICATION_VERDICTS` constants, plus a category-error guard that flags verdicts which stamp application enums in the comprehension slot.
- `skill-graph/audits/manifest.json:47` — `when` clause for the `comprehension.json` artifact uses the comprehension-only graded set.

The 2026-05-25 verifier enum-leak fix (commit `d55ec3f`) corrected an earlier bug where the verifier's `GRADED_COMPREHENSION_VERDICTS` was the union of both enums.

## Confidence tier ordering

The confidence hierarchy is **identical for both `comprehension_verdict` and `application_verdict`**:

```
PASS / APPLICABLE  >  PROVISIONAL  >  UNVERIFIED
   ^ grader-earned    ^ single-model     ^ no assessment
```

**Reading rules:**

- **`PROVISIONAL` is NOT a failure.** It is a real, lower-confidence result. A skill recorded as `PROVISIONAL` was actually assessed by a competent single model that produced a real grader output. The independent dual-run grader has not yet confirmed it. See `.claude/rules/version-schema-contract.md` § 5 for the canonical statement.
- **`UNVERIFIED` is honest absence.** No model ran the assessment. The skill has not been graded.
- **Never present "carries the vN label" as "verified."** A skill that is "fully v8" but never assessed at all is still `UNVERIFIED` — but it becomes `PROVISIONAL` the moment a single model assesses it. Never stuck at `UNVERIFIED` out of process purity.
- **The negative verdicts (`SHALLOW` / `REDUNDANT` / `HARMFUL` / `MIXED` / `FALSE_POSITIVE`) are also lower-confidence when produced by a single model**, but record the negative grader signal honestly. They are NOT downgraded to `PROVISIONAL` when single-model — the verdict label captures the grader output, the confidence tier is implicit in whether a dual-run confirmed it.

## How to update verdicts honestly

| Situation | Correct value |
|---|---|
| No grader has ever run on this skill. | `UNVERIFIED` |
| A single competent model ran the comprehension grader and got a real result. | `PROVISIONAL` (or whatever the grader output was, if negative) |
| The independent dual-run grader confirmed the result. | `PASS` (or `APPLICABLE`, depending on layer) |
| The skill has no `evals/comprehension.json` and that's intentional (e.g., the archetype doesn't have a comprehension layer). | `comprehension_verdict: NA` |
| Lint failed today after passing yesterday. | `structural_verdict: FAIL` (do not edit `truth_verdict`, `comprehension_verdict`, or `application_verdict`) |
| Truth source was renamed; drift sentinel fires. | `truth_verdict: DRIFT` until re-grounded with new hash |

**Anti-pattern:** Bulk `sed` of `PROVISIONAL` → `PASS` across the corpus without running the dual-run grader. This is fake-conformance, the same class of doc-lie as `eval_state: passing` without an `eval_last_run` receipt. See `.claude/rules/version-schema-contract.md` § 7.

## Related (canonicals + rationale)

- ADR-0011 — Split the v6 aggregate `audit_verdict` into the four-verdict Audit Status. The decision rationale.
- [`schemas/SKILL_METADATA_PROTOCOL_schema.json:241-285`](../schemas/SKILL_METADATA_PROTOCOL_schema.json) — the binding enum definitions.
- [`skill-audit-loop/SKILL_AUDIT_LOOP.md`](../skill-audit-loop/SKILL_AUDIT_LOOP.md) — the audit-loop procedure that produces the verdicts.
- [`skill-audit-loop/SKILL_AUDIT_LOOP.md` § Part 3 — Per-Skill Audit Runbook](../skill-audit-loop/SKILL_AUDIT_LOOP.md#part-3--per-skill-audit-runbook) § 4c — how each verdict is written during a per-skill audit pass.
- `.claude/rules/version-schema-contract.md` § 5–7 — the `PROVISIONAL > UNVERIFIED` confidence rule and the "labels are earned, not bumped" doctrine.
- [`docs/comprehension-eval-spec.md`](comprehension-eval-spec.md) — the binding shape for `evals/comprehension.json`, the artifact the comprehension grader evaluates against.

## Stale restatements that should now link here

The following files previously restated parts of this content; they now carry a one-line summary + a link to this file. If you find a new restatement, fix it the same way:

- `skill-graph/AGENTS.md:50` (Mission and Vision § "application_verdict is the primary quality signal")
- `skill-graph/skill-audit-loop/SKILL_AUDIT_LOOP.md:24-30` + `:82-92` (verdict definitions in audit doctrine)
- `docs/reference/skill-audit-pipeline.md:22` (tier paragraph)
- `.claude/rules/version-schema-contract.md:33-44` (confidence-tier rule)
- `skill-graph/docs/adr/0011-split-audit-verdict-into-four-verdicts.md` (ADR rationale + definitions)
