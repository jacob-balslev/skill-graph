# Verdict Semantics — Canonical

> Type: Reference (binding)
> Authored: 2026-05-25 — closes the 5-way verdict-semantics restatement gap surfaced by the 2026-05-25 multi-model review (Opus G2#2 HIGH, GPT-5.5 G2#2 HIGH).
> Source of truth for verdict enums + tier ordering. All other surfaces should LINK to this file, not restate it.

## What this file is

The single canonical home for:

1. **The four Health Block verdict fields** — `structural_verdict`, `truth_verdict`, `comprehension_verdict`, `application_verdict`.
2. **Each field's enum** — every valid value, what it means, what generates it.
3. **The confidence tier ordering** — `APPLICABLE > PROVISIONAL > UNVERIFIED` and friends.
4. **The disjointness rule** — comprehension and application enums are disjoint per the schema.

This doc REPLACES the verdict-semantics restatements that previously lived (drift-prone) in `skill-graph/AGENTS.md:50`, `skill-graph/SKILL_AUDIT_LOOP.md:24`, `docs/reference/skill-audit-pipeline.md:22`, `.claude/rules/version-schema-contract.md:33`, and ADR-0011. Those files now carry one-line summaries + a link to this file.

## The four Health Block fields (binding)

| Field | Layer | Owner | Source of truth |
|---|---|---|---|
| `structural_verdict` | Form / lint | Gates 1–2 + 7 (schema lint, manifest census, concept-card shape) | [`skill-graph/schemas/skill.schema.json:241-249`](../schemas/skill.schema.json) |
| `truth_verdict` | Truth-source freshness | Gates 3–6 (truth-source catalog, drift sentinel, test coverage, claim verification) | [`schemas/skill.schema.json:251-259`](../schemas/skill.schema.json) |
| `comprehension_verdict` | Did the skill teach? | Gate 8 (comprehension grader on `evals/comprehension.json`) | [`schemas/skill.schema.json:261-272`](../schemas/skill.schema.json) |
| `application_verdict` | Did the skill change agent behavior? | Gate 9 (application grader on `evals/application.json`) | [`schemas/skill.schema.json:274-285`](../schemas/skill.schema.json) |

**`application_verdict` is the primary quality signal.** A skill is only behaviorally certified when this verdict is `APPLICABLE`. The other three are necessary infrastructure but never sufficient. See ADR-0011 for the rationale (replaces the v6 aggregate `audit_verdict`).

## Per-field enums

### `structural_verdict`

| Value | Meaning |
|---|---|
| `PASS` | Lint clean, no warnings. |
| `PASS_WITH_FIXES` | Warnings present but no errors. |
| `FAIL` | Lint or schema errors. |
| `UNVERIFIED` | No structural audit has run since the v7 schema bump. |

### `truth_verdict`

| Value | Meaning |
|---|---|
| `PASS` | Truth sources align with declared `last_verified` and hashes. |
| `DRIFT` | Truth sources changed since `last_verified`. |
| `BROKEN` | Declared truth sources missing or unreadable. |
| `UNVERIFIED` | No truth audit has run since the v7 schema bump. |

### `comprehension_verdict` (gate 8)

| Value | Meaning | Earned by |
|---|---|---|
| `PASS` | With-skill answers measurably deeper than baseline on the rubric dimensions. | Independent dual-run grader. |
| `PROVISIONAL` | A single competent model ran the comprehension assessment and recorded a real result. Lower confidence than `PASS` because not yet confirmed by the independent dual-run grader, but distinct from `UNVERIFIED` which means no assessment has run. | Single-model audit run. |
| `SHALLOW` | Skill recites the concept but does not deepen agent understanding. | Grader (single or dual). |
| `REDUNDANT` | Baseline already saturated — skill adds no comprehension lift. | Grader (single or dual). |
| `SKIPPED_BASELINE_HIGH` | Early-skip: `avg_primary_baseline >= 1.0` after the first 2 evals so the dual-run was aborted. v7 demotion behavior. | Procedural — no grader signal. |
| `NA` | Skill carries no `evals/comprehension.json` by design (the comprehension layer doesn't apply to this archetype). | Author's declaration. |
| `UNVERIFIED` | Initial state before any grader run since the v7 schema bump. | Default for the v6→v7 corpus migration. |

**Comprehension graded set:** `{PROVISIONAL, PASS, SHALLOW, REDUNDANT}`. The verifier at `skill-graph/scripts/check-audit-manifest.js` requires `skills/<name>/evals/comprehension.json` to exist on disk when `comprehension_verdict` is in this set.

### `application_verdict` (gate 9)

| Value | Meaning | Earned by |
|---|---|---|
| `APPLICABLE` | Loading the skill changes agent behavior on real artifacts in the expected direction (flags, fixes, generative trajectory). | Independent dual-run grader. |
| `PROVISIONAL` | Single-model dogfood audit found useful behavior but the independent application grader has not confirmed it. | Single-model audit run. |
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

- `skill-graph/schemas/skill.schema.json:261-285` — the `enum` arrays.
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
- **Never present "carries the vN label" as "verified."** A skill that is "fully v7" but never assessed at all is still `UNVERIFIED` — but it becomes `PROVISIONAL` the moment a single model assesses it. Never stuck at `UNVERIFIED` out of process purity.
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

- ADR-0011 — Split the v6 aggregate `audit_verdict` into the four-verdict Health Block. The decision rationale.
- [`schemas/skill.schema.json:241-285`](../schemas/skill.schema.json) — the binding enum definitions.
- [`SKILL_AUDIT_LOOP.md`](../SKILL_AUDIT_LOOP.md) — the audit-loop procedure that produces the verdicts.
- [`audits/per-skill-contract.md`](../audits/per-skill-contract.md) § 4c — how each verdict is written during a per-skill audit pass.
- `.claude/rules/version-schema-contract.md` § 5–7 — the `PROVISIONAL > UNVERIFIED` confidence rule and the "labels are earned, not bumped" doctrine.
- [`docs/comprehension-eval-spec.md`](comprehension-eval-spec.md) — the binding shape for `evals/comprehension.json`, the artifact the comprehension grader evaluates against.

## Stale restatements that should now link here

The following files previously restated parts of this content; they now carry a one-line summary + a link to this file. If you find a new restatement, fix it the same way:

- `skill-graph/AGENTS.md:50` (Mission and Vision § "application_verdict is the primary quality signal")
- `skill-graph/SKILL_AUDIT_LOOP.md:24-30` + `:82-92` (verdict definitions in audit doctrine)
- `docs/reference/skill-audit-pipeline.md:22` (tier paragraph)
- `.claude/rules/version-schema-contract.md:33-44` (confidence-tier rule)
- `skill-graph/docs/adr/0011-split-audit-verdict-into-four-verdicts.md` (ADR rationale + definitions)
