# Verdict Semantics — Canonical

> Type: Reference (binding)
> Authored: 2026-05-25 — closes the 5-way verdict-semantics restatement gap surfaced by the 2026-05-25 multi-model review (Opus G2#2 HIGH, GPT-5.5 G2#2 HIGH).
> Source of truth for verdict enums + tier ordering. All other surfaces should LINK to this file, not restate it.
> **The verdict is a guardrail, not an optimizer:** see [`docs/skill-audit-loop-philosophy.md`](skill-audit-loop-philosophy.md) — verdicts confirm an enriched skill helps and didn't regress; they must never drive stripping knowledge that didn't move a score.

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

**`application_verdict` is the primary quality signal.** A skill is only behaviorally certified when this verdict is `APPLICABLE`. The other three are necessary infrastructure but never sufficient. See ADR-0011 for the historical rationale behind the four-field shape.

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
| `PASS` | With-skill answers measurably deeper than baseline on Comprehension criteria. | Independent dual-run grader. |
| `PROVISIONAL` | A single competent model ran the comprehension assessment and recorded a real result. Lower confidence than `PASS` because not yet confirmed by the independent dual-run grader, but distinct from `UNVERIFIED` which means no assessment has run. | Single-model audit run. |
| `SHALLOW` | Skill recites the concept but does not deepen agent understanding. | Grader (single or dual). |
| `REDUNDANT` | Baseline already saturated — skill adds no comprehension lift. | Grader (single or dual). |
| `SKIPPED_BASELINE_HIGH` | Early-skip: `avg_primary_baseline >= 90` after the first 2 cases so the dual-run was aborted. | Procedural — no grader signal. |
| `NA` | Skill carries no `evals/comprehension.json` by design (the comprehension layer doesn't apply to this archetype). | Author's declaration. |
| `UNVERIFIED` | Initial state before any grader run. | Default for skills not yet assessed by the comprehension grader. |

**Comprehension graded set:** `{PROVISIONAL, PASS, SHALLOW, REDUNDANT}`. The verifier at `skill-graph/scripts/check-audit-manifest.js` requires `skills/<name>/evals/comprehension.json` to exist on disk when `comprehension_verdict` is in this set.

**Comprehension scope carve-out.** Gate 8 is the **required** behavior gate for skills teaching **project-invented or repository-specific concepts** where the foundation model has no training prior (e.g., repo internal conventions, custom frameworks, in-house DSLs). For framework concepts the model already knows (CLT, Toulmin, FMEA, OODA, design thinking, …), the grader early-skips via `SKIPPED_BASELINE_HIGH` and gate 8 is genuinely optional — `application_verdict` alone carries the quality signal. The carve-out lives in the verdict values themselves: `SKIPPED_BASELINE_HIGH` flags "framework-concept, comprehension legitimately doesn't apply"; `NA` flags "this skill ships no `comprehension.json` by design." Reporting that counts comprehension coverage must split these two values out of the unassessed bucket, or it will under-report eval state on framework-concept skills. Authority: ADR-0011 § Addendum 2026-05-20.

### `application_verdict` (gate 9)

| Value | Meaning | Earned by |
|---|---|---|
| `APPLICABLE` | Loading the skill changes agent behavior on real artifacts in the expected direction (flags, fixes, generative trajectory). | Independent dual-run grader. |
| `PROVISIONAL` | single-model self-assessment audit found useful behavior but the independent application grader has not confirmed it. | Single-model audit run. |
| `NOT_DISCRIMINATED_CEILING` | The eval was inconclusive because baseline behavior already saturated the pointwise rubric; there was not enough headroom to measure marginal lift. | Application runner from pointwise baseline saturation plus no blind-pairwise with-skill preference. |
| `EQUIVALENT_ON_FRONTIER` | The measured generator had headroom but behaved equivalently with and without the skill on this case set. Legacy enum name retained for existing receipts. This is a scoped no-lift finding, not a deletion verdict. | Application runner from blind pairwise tie/no preference plus unsaturated baseline. |
| `REDUNDANT` | Legacy no-visible-delta verdict. New runs should prefer `NOT_DISCRIMINATED_CEILING` or `EQUIVALENT_ON_FRONTIER` so no-lift evidence is interpretable. | Grader or historical runner. |
| `HARMFUL` | Negative delta — agent makes worse decisions with the skill loaded. Active skills with this verdict must be removed from the corpus or replaced by a newly evaluated non-HARMFUL version. SkillsBench arXiv 2602.12670 found 19% of evaluated skills exhibit this. | Grader. |
| `MIXED` | Delta varies across cases — some applicable, some redundant or false-positive. | Grader. |
| `FALSE_POSITIVE` | Skill over-triggers — applies on cases where its expertise does not apply. | Grader. |
| `UNVERIFIED` | No application assessment has run. | Default. |

**Application graded set:** every application verdict except `UNVERIFIED` is a graded claim and requires `skills/<name>/evals/application.json` on disk. The verifier at `skill-graph/scripts/check-audit-manifest.js` enforces this full set: `{APPLICABLE, PROVISIONAL, NOT_DISCRIMINATED_CEILING, EQUIVALENT_ON_FRONTIER, REDUNDANT, MIXED, HARMFUL, FALSE_POSITIVE}`.

**No-lift verdicts are scoped evidence.** `NOT_DISCRIMINATED_CEILING` and `EQUIVALENT_ON_FRONTIER` do not mean "delete this skill" or "never route this skill." They mean the specific measured generator, task set, and raw-injection eval did not show marginal lift. Router consumers may avoid boosting them as certified-useful skills, but they must not treat them as equivalent to `HARMFUL` or `FALSE_POSITIVE`.

**HARMFUL is removal, not quarantine.** An active skill with `application_verdict: HARMFUL` is a corpus violation because the best available behavior evidence says the skill makes agents worse. The correct resolution is to remove that skill from the active library or replace it with a corrected skill that earns a fresh non-HARMFUL application verdict. The `check-audit-manifest.js` gate fails while any active manifest entry still carries `HARMFUL`.

## Disjointness rule (binding)

**The `comprehension_verdict` and `application_verdict` enums are disjoint.** No value belongs to both — except `UNVERIFIED` and `PROVISIONAL`, which carry the same semantic meaning in both fields (no assessment has run; or a single model has run an assessment but not the dual-run grader, respectively).

Specifically:

- `APPLICABLE`, `NOT_DISCRIMINATED_CEILING`, `EQUIVALENT_ON_FRONTIER`, `HARMFUL`, `MIXED`, `FALSE_POSITIVE` are **application-only**. They must never appear in `comprehension_verdict`.
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
- **The non-certifying verdicts (`SHALLOW` / `REDUNDANT` / `NOT_DISCRIMINATED_CEILING` / `EQUIVALENT_ON_FRONTIER` / `HARMFUL` / `MIXED` / `FALSE_POSITIVE`) are also lower-confidence when produced by a single model**, but record the grader signal honestly. They are NOT downgraded to `PROVISIONAL` when single-model — the verdict label captures the grader output, the confidence tier is implicit in whether a dual-run confirmed it.

## Two-frontier bidirectional reconciliation (how a dual-run verdict is earned)

The dual-run that earns `PASS` / `APPLICABLE` is the bidirectional eval in `lib/audit/run-bidirectional-eval.js`. The measured generator is fixed as the `representative-generator` role, and the two directions are named by which frontier model judges the evidence: the **Claude** direction (`representative-generator` answers → Opus judges) and the **Codex** direction (`representative-generator` answers → GPT judges). The results are reconciled **conservatively** — the more-skeptical verdict wins (`lib/audit-shared/synthesize-bidirectional.js`). So a strong verdict requires BOTH frontier judges to reach it independently for the same measured generator.

**Procedural carve-out (one direction did not grade).** A `SKIPPED_BASELINE_HIGH` / `NA` direction carries no graded signal, so only ONE direction actually graded. A single graded direction can support **at most `PROVISIONAL`** — it may not certify `PASS` / `APPLICABLE`, because the second corroborating direction is missing (the conservative rule forbids single-direction certification). The cap never inflates a weak verdict: a lone `SHALLOW` / `REDUNDANT` / `NOT_DISCRIMINATED_CEILING` / `EQUIVALENT_ON_FRONTIER` / `MIXED` / `UNVERIFIED` stays as-is. An **unknown / invalid** direction verdict (a grader returned a label outside the enum) is normalized to `UNVERIFIED` and never surfaces as the synthesized verdict. (`synthesize-bidirectional.capAtProvisional` / `normalizeKnown`; SH-6679 / SH-6678.)

**Single-available-frontier degraded panel run.** When the multi-model Skill Audit Loop explicitly runs with one available mandatory frontier because another frontier has an active exhausted-lock, the receipt uses `reconciliation: single-frontier-provisional`, sets `regrade_required: true`, and caps any `PASS` / `APPLICABLE` signal to `PROVISIONAL`. This is lower-confidence evidence that keeps the corpus drain moving; it is not certification and must be replaced by a later full two-frontier re-grade before the skill can claim `PASS` / `APPLICABLE`.

If a degraded panel receipt reports a dangerous application result such as `HARMFUL` or `FALSE_POSITIVE`, the receipt and `model_run_coverage` must preserve that signal, but `recordFullLoop()` downgrades the durable active-corpus verdict to `UNVERIFIED`. The active-corpus removal/routing-exclusion effect of a dangerous verdict requires a certifying-clean signal or a replacement skill that has been newly evaluated; a one-frontier degraded panel result is re-grade evidence, not a corpus-removal verdict.

A strong verdict additionally requires the run to be **certifying-clean**, or it is capped to `PROVISIONAL`:

1. **`parity_ok`** — both directions ran under an identical tools-ON execution profile. A parity mismatch means the run measured permissions, not the model — INVALID, capped.
2. **both directions certifying** — the measured generator is `representative-generator`, each direction uses a top-tier frontier judge, and both frontier judges agree (`certification.js`). This is the model-contract that makes the `PROVISIONAL → APPLICABLE` step honest: a same-family judge can inflate its own family's outputs by ~+10–25pp (LLM self-preference bias, [arXiv 2410.21819](https://arxiv.org/abs/2410.21819)), so one frontier judgment alone can support **at most `PROVISIONAL`**. The same-family Opus judgment over a Sonnet representative-generator output is allowed only because it is corroborated by the independent GPT judgment; it cannot certify by itself. This does **not** conflict with `no-lesser-models-for-quality` (`~/Development/.claude/rules/`): the generator is a measured subject, while the judges remain top-tier frontier models.
3. **resolved models** — neither direction's generator/grader model is the `latest-alias-unresolved` sentinel. If we cannot prove WHICH concrete model ran, the run caps to `PROVISIONAL` (honest provenance, per `.claude/rules/version-schema-contract.md` § 5). The GPT (`codex-current`) direction omits the model flag so Codex serves its own current model; its concrete id is now captured from `codex exec`'s output header (`model: <id>`) by `evaluate-skill.extractCodexModel` (SH-6680), so a resolved-clean codex run no longer carries the sentinel. The sentinel still applies — and still caps to `PROVISIONAL` — only when codex emits no parseable header model line.

A capped/invalid run is **inconclusive**, never a regression: the enrich keep-or-revert defers (keeps) on it and never reverts a skill for a confidence cap.

**Measured-generator applicability (`applicable_for`, SH-6682, revised by SKI-306).** The conservative aggregate is one verdict, and the measured agent is the fixed `representative-generator` role. New receipts record `applicable_for: representative | neither`: `representative` only when the run is certifying-clean and both frontier judge directions reached the certifying verdict; `neither` when no direction certified or the run was not certifying-clean. Older receipts may still contain the legacy `anthropic | openai | both | neither` family values; readers keep accepting them for history, but new certifying receipts should use `representative` or `neither`.

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

- ADR-0011 — Historical decision rationale for the four-verdict Audit Status.
- [`schemas/SKILL_METADATA_PROTOCOL_schema.json:241-285`](../schemas/SKILL_METADATA_PROTOCOL_schema.json) — the binding enum definitions.
- [`skill-audit-loop/SKILL_AUDIT_LOOP.md`](../skill-audit-loop/SKILL_AUDIT_LOOP.md) — the audit-loop procedure that produces the verdicts.
- [`skill-audit-loop/SKILL_AUDIT_LOOP.md` § Part 3 — Per-Skill Audit Runbook](../skill-audit-loop/SKILL_AUDIT_LOOP.md#part-3--per-skill-audit-runbook) § 4c — how each verdict is written during a per-skill audit pass.
- [ADR-0022](adr/0022-representative-generator-frontier-judges.md) — Decision rationale for the `representative-generator` measured subject and frontier judge pair.
- `.claude/rules/version-schema-contract.md` § 5–7 — the `PROVISIONAL > UNVERIFIED` confidence rule and the "labels are earned, not bumped" doctrine.
- [`docs/comprehension-eval-spec.md`](comprehension-eval-spec.md) — the binding shape for `evals/comprehension.json`, the artifact the comprehension grader evaluates against.

## Stale restatements that should now link here

The following files previously restated parts of this content; they now carry a one-line summary + a link to this file. If you find a new restatement, fix it the same way:

- `skill-graph/AGENTS.md:50` (Mission and Vision § "application_verdict is the primary quality signal")
- `skill-graph/skill-audit-loop/SKILL_AUDIT_LOOP.md:24-30` + `:82-92` (verdict definitions in audit doctrine)
- `docs/reference/skill-audit-pipeline.md:22` (tier paragraph)
- `.claude/rules/version-schema-contract.md:33-44` (confidence-tier rule)
- `skill-graph/docs/adr/0011-split-audit-verdict-into-four-verdicts.md` (ADR rationale + definitions)
