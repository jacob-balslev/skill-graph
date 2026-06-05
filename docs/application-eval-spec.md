# Application Eval Shape (`evals/application.json`)

> Type: Reference. Binding sibling of [`comprehension-eval-spec.md`](./comprehension-eval-spec.md).
> Canonical schema: [`schemas/application.schema.json`](../schemas/application.schema.json) (v1, 2026-05-30, SH-6624).
> Consumed by: `evaluate-skill.js --mode application` → `lib/audit/application-eval.js`.
> Graded by: [`lib/audit/graders/application-grader-prompt.md`](../lib/audit/graders/application-grader-prompt.md) (deployed pointwise grader).
> Required-on-disk by: `scripts/check-audit-manifest.js` whenever a graded `application_verdict` is claimed.

## What this artifact is

The application eval is the **gate-9** input: a set of realistic scenarios used to measure whether **loading a skill changes an agent's behavior on a real task** — which problems it flags, which fixes it recommends, which non-problems it avoids — versus a baseline with no skill loaded. It is the artifact behind `application_verdict`, the **only** verdict that certifies a skill is *useful* (ADR-0011; `docs/verdict-semantics.md`).

It is distinct from the comprehension eval (`evals/comprehension.json`), which tests definitional *understanding*. A skill can be `APPLICABLE` here while `REDUNDANT` on comprehension (the model knows the concept but the skill changes its operational behavior) and vice versa.

## Top-level shape

```jsonc
{
  "skill_name": "database-migration",          // kebab-case, matches dir + SKILL.md name
  "subject": "safe production database migrations",
  "mode": "application",                         // discriminator (cases[], not evals[])
  "schema_version": 1,                           // this artifact's contract version
  "cases": [ /* ≥5 application_case objects */ ]
}
```

The application layer uses **`cases[]`**, not `evals[]` (the comprehension key). The runner throws loudly if it sees the wrong key under `--mode application`.

**Floor: ≥5 cases** (mirrors the comprehension gate-8 floor), **7 recommended**, and **at least one `red_herring: true`** is strongly recommended — a real-cases-only suite gives false confidence (per the `agent-eval-design` skill: "the highest-value cases are hard negatives and prior failures").

## Per-case shape (the deployed pointwise contract)

Each case carries the scenario and the expected-behavior spec the grader scores against:

| Field | Required | Meaning |
|---|---|---|
| `id` | yes | Stable integer, unique in file. |
| `scenario_type` | yes | Short family label (e.g. `live-schema-change`). |
| `criticality` | yes | `critical` / `high` / `normal` / `low`. A missed `critical` real case is the strongest negative signal. |
| `red_herring` | yes | `true` ⇒ scenario is OUTSIDE the skill's scope; the skill should NOT trigger. |
| `scenario` | yes | The real code/diff/schema/situation shown to the candidate. |
| `context` | yes | Surrounding facts (production vs test, scale, runtime). |
| `question` | yes | The open-ended ask — **no leading hints** (the same neutral prompt runs in both arms). |
| `expected_flags[]` | yes | Issues the skill should lead the agent to surface (flag_correctness, weight 2.0). |
| `expected_fix_hints[]` | yes | Remediations the skill should lead the agent to recommend (fix_correctness, weight 1.5). |
| `absent_signals[]` | yes | Claims the candidate should NOT make — false-positive risks (false_positive_avoidance, weight 1.0 real / 2.0 red-herring). |
| `criteria[]` | **optional, PROVISIONAL** | Boolean per-criterion checklist — see below. |
| `artifact` | **optional, PROVISIONAL** | Single input for the comparative grader — see below. |

## How it is graded (deployed pointwise grader)

For each case the runner runs **N trials** (`--trials`, default 3, recommended 3–5). Each trial is one baseline run (no skill) + one with_skill run (skill body injected), graded **independently** on 4 axes (0/1/2), then **paired** to compute a per-trial verdict from the delta. Independent (pointwise) grading means the grader never sees both runs side-by-side, so it is **not exposed to pairwise position bias** (verified 2026-05-30 against the LLM-as-judge literature; see `docs/research/`).

The authoritative **per-case verdict is the MODE** of the N per-trial verdicts (averaging categorical verdicts is a fallacy; the winning verdict is one a real trial produced). The runner reports `verdict_consistency` (the modal-agreement fraction) and flags `verdict_stable: false` when the mode holds across fewer than 60% of trials — an unstable per-case verdict is surfaced, never silently averaged away. Repetition smooths the single-draw noise of same-judge grading (IRT judge-reliability framework, CARE confounder-aware aggregation; verified 2026-05-30).

Axes and weights: `flag_correctness` (2.0), `fix_correctness` (1.5), `false_positive_avoidance` (1.0 real / 2.0 red-herring), `primary_signal_clarity` (1.0).

Per-case verdict from the delta (real case): `applicable` if flag or fix improves ≥ +0.2 with false-positives clean; `redundant` if no measurable delta; `harmful` if flag/fix regresses; `mixed` on split signals. Red-herring: graded primarily on false-positive avoidance. Aggregate per-skill verdict: `applicable` if ≥60% of real cases are applicable AND ≤20% of red-herrings false-positive; `harmful` if any real case is harmful or >20% red-herrings false-positive.

## Verdict tiering — earned, not assumed (enforced in code)

A single-model run records **`application_verdict: PROVISIONAL`** with an `eval_last_run` receipt — never `APPLICABLE`. `APPLICABLE` requires an **independent, cross-family** dual-run grader (a top-tier judge of a *different model family* than the generator — e.g. Opus generates, GPT-5.4 grades), because a same-family judge inflates its own family's outputs by +10–25pp (self-preference bias, verified 2026-05-30). Until the grader reaches ≥85% agreement with a human reviewer on a calibration set, verdicts are written with `calibrated: false` and MUST NOT certify a skill. See `.claude/rules/version-schema-contract.md` and `docs/verdict-semantics.md`.

This is **enforced in the runner, not just documented** (SH-6624). The runner stamps a `certification_tier` from operator declarations and `stampApplicationVerdict` caps `APPLICABLE → PROVISIONAL` for any tier that is not `certifying`:

- **`provisional` (the default)** — no attestation, undeclared families, or same-family. `APPLICABLE` is unreachable. This is the in-code form of "never UNVERIFIED→APPLICABLE without evidence."
- **`certifying`** — reached ONLY when the operator passes `--certifying` AND declares two *different* vendor families via `--generator-family <F>` and `--grader-family <G>` (e.g. `--generator-family opus --grader-family gpt-5.4`). These flags are a **declaration of provenance, not a model selector** — the runner never selects a model (the operator sets the session model). The declared families are recorded on every history record and on the run summary.

`--single-model` is an additional, stronger override that forces `PROVISIONAL` even on a `certifying` run. Provisional is the safe default; `APPLICABLE` is a deliberate, recorded cross-family act.

## Provisional fields (`criteria[]`, `artifact`) — SH-6624 Phase-0 pilot

The optional `criteria[]` (boolean per-criterion checklist: `{id, polarity: positive|negative|guard, statement}`) and `artifact` fields are the **comparative / checklist** contract under evaluation by the SH-6624 grader-design pilot. Research (CheckEval, FLASK) shows binary per-criterion rubrics have higher judge agreement and lower variance than graded scales. These fields are a **superset extension** so that, if the pilot promotes the checklist format, adoption is additive and non-breaking. **Do not rely on them** until the pilot resolves the grader-design fork and the fields are promoted from optional to part of the contract. The deployed pointwise runner ignores them.

## Structural conformance gate

`scripts/check-application-evals.js` (SKI-51) is the standalone validator that checks every `evals/application.json` (plus the worked specimen) against the schema-mirrored structural contract: required top-level fields, the `mode: "application"` discriminator, the ≥5-case floor, the per-case required-field set, unique case ids, the `criticality` enum, and the red-herring recommendation. It is a Node-built-in structural check (no ajv — repo policy), mirroring how the comprehension shape is covered by `lib/audit/eval-linter.js`.

It exists because the schema was previously enforced "by construction + the audit loop" only — the runner deliberately does NOT enforce the case floor at runtime (a partial `--case` filter must run), and `check-audit-manifest.js` only checks that the artifact *exists* when a graded verdict is claimed, never its shape. This gate makes the schema mechanically checkable.

- `npm run application-evals:check` — report-only (exit 0 unless a hard structural break is present). Wired into both `npm run verify` and `npm run verify:system`. Below-floor and missing-red-herring findings are CONTENT-migration debt (drain via `/audit:*`) and are reported but do NOT fail report mode, so a SYSTEM gate never goes red purely because the corpus has not yet migrated to the floor.
- `npm run application-evals:check:strict` (`--check`) — the opt-in HARD gate (exit 1 on ANY finding) for use once the corpus has migrated, or in a CONTENT pre-commit that just authored an application.json. `--strict-floor` gates on the floor in report mode; `--json` emits a machine-readable report; `--skill <name>` checks one skill.

## Worked specimen

`examples/evals/application.sample.json` (database-migration, 5 cases: 4 real + 1 red-herring) is the canonical illustrative specimen and validates against the schema and the conformance gate above.
