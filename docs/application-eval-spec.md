# Application Spec (`evals/application.json`)

> Type: Reference. Binding sibling of [`comprehension-eval-spec.md`](./comprehension-eval-spec.md).
> Canonical schema: [`schemas/application.schema.json`](../schemas/application.schema.json) (v1, 2026-05-30, SH-6624).
> Consumed by: `evaluate-skill.js --mode application` → `lib/audit/application-eval.js`.
> Graded by: [`lib/audit/graders/application-grader-prompt.md`](../lib/audit/graders/application-grader-prompt.md) for pointwise score provenance plus [`lib/audit/graders/application-comparative-grader-prompt.md`](../lib/audit/graders/application-comparative-grader-prompt.md) for the default blind pairwise verdict.
> Required-on-disk by: `scripts/check-audit-manifest.js` whenever a graded `application_verdict` is claimed.

## What this artifact is

Application is the **gate-9** behavior check: a set of realistic scenarios used to measure whether **loading a skill changes an agent's behavior on a real task** — which problems it flags, which fixes it recommends, which non-problems it avoids — versus a baseline with no skill loaded. It is the artifact behind `application_verdict`, the **only** verdict that certifies a skill is *useful* (ADR-0011; `docs/verdict-semantics.md`).

It is distinct from Comprehension (`evals/comprehension.json`), which tests definitional *understanding*. A skill can be `APPLICABLE` here while `REDUNDANT` on Comprehension (the model knows the concept but the skill changes its operational behavior) and vice versa.

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

Application uses **`cases[]`**, not `evals[]` (the Comprehension key). The runner throws loudly if it sees the wrong key under `--mode application`.

**Floor: ≥5 cases** (mirrors the Comprehension floor), **7 recommended**, and **at least one `red_herring: true`** is required before `APPLICABLE` can be earned — a real-cases-only suite gives false confidence (per the `agent-eval-design` skill: "the highest-value cases are hard negatives and prior failures").

## Per-case shape

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
| `criteria[]` | optional | Boolean per-criterion checklist consumed by the blind comparative grader when present. |
| `artifact` | optional | Single real input for the comparative grader; falls back to `scenario` + `context` when absent. |

## `application.json` vs `comprehension.json` (NOT interchangeable)

Application and Comprehension are **different behavior checks with different schemas, array keys, and `criticality` enums.** The most common authoring error is reusing one shape — or the wrong `criticality` value — for the other.

| | `application.json` (Application) | `comprehension.json` (Comprehension) |
|---|---|---|
| Array key | `cases[]` (`--mode application` throws if it sees `evals[]`) | `evals[]` |
| Per-item fields | `id, scenario_type, criticality, red_herring, scenario, context, question, expected_flags, expected_fix_hints, absent_signals` | `id, dimension, prompt, substance, calibration, truth_mode, skill_type, criticality, expected_elements` / `negative_expectation` |
| `criticality` enum | `critical` / `high` / **`normal`** / `low` | `critical` / `high` / **`medium`** / `low` |
| Validator | `scripts/check-application-evals.js` (criticality enum-pinned; **rejects `medium`**) | `lib/audit/eval-linter.js` (criticality required; default `medium`; not enum-pinned) |
| Schema | `schemas/application.schema.json` | `schemas/comprehension.schema.json` |
| Grader → verdict | `evaluate --mode application` → `application_verdict` | `evaluate --mode comprehension` → `comprehension_verdict` |

> ⚠ **`criticality` differs between the two:** Application uses `normal`, Comprehension uses `medium`. Writing `criticality: medium` in an Application case fails `check-application-evals.js` (the enum here is `critical / high / normal / low`). Full Comprehension contract: [`comprehension-eval-spec.md`](./comprehension-eval-spec.md).

## How it is graded

For each case the runner runs **N trials** (`--trials`, default 3, recommended 3–5). Each trial is one baseline run (no skill) + one with_skill run (skill body injected). The runner records pointwise 0–100 axis grades for both arms, then uses a blind A/B comparative grader by default (`grading_mode: pairwise`) to decide which anonymous response is better. The runner grades both A/B presentation orders for each trial and uses the pairwise signal only when the two orders agree; this prevents position bias from masquerading as skill lift.

The authoritative **per-case verdict is the MODE** of the N per-trial verdicts (averaging categorical verdicts is a fallacy; the winning verdict is one a real trial produced). The runner reports `verdict_consistency` (the modal-agreement fraction) and flags `verdict_stable: false` when the mode holds across fewer than 60% of trials — an unstable per-case verdict is surfaced, never silently averaged away. Repetition smooths the single-draw noise of same-judge grading (IRT judge-reliability framework, CARE confounder-aware aggregation; verified 2026-05-30).

Axes and weights: `flag_correctness` (2.0), `fix_correctness` (1.5), `false_positive_avoidance` (1.0 real / 2.0 red-herring), `primary_signal_clarity` (1.0).

Each axis is scored on a **0–100** free-continuous integer scale (the coarse 0/1/2 scale was retired 2026-06-11: on a 3-point scale a strong frontier baseline is forced to the ceiling (2/2) and auto-trips saturation with no headroom to measure the skill's lift — see the grader's Anti-Compression Mandate for the discipline that keeps a wide scale discriminative). The per-axis `weighted_score` stays normalized 0–1. A baseline counts as **saturated** (no headroom → `not_discriminated_ceiling` on a no-lift case) only when it scores ≥ `APPLICATION_BASELINE_SATURATION_THRESHOLD` (default 90, env-overridable) on *every* axis; a per-axis delta counts as a real behavior change rather than grader noise only at ≥ `APPLICATION_MIN_MEANINGFUL_DELTA` points (default 10).

**Web access — both arms run WITHOUT websearch by default (2026-06-11, owner directive).** The eval measures a skill's *deployment value* (search-elimination + curation — the skill delivers the one vetted approach so a deployed agent need not run an extended websearch), NOT "is the answer findable on the web." A web-enabled baseline could search its way to a passable answer and hide the skill's lift. So the eval generator's `research` allowance defaults to **repo-only (web OFF)** for BOTH arms (only the skill differs → parity preserved; repo/exec `tools` stay full). `SKILL_EVAL_WEB=on` restores the web-enabled baseline (the "is this un-googleable" filter). This is the EVAL generator's web access; the skill **authoring/curation** step keeps full web research ("research IS the curation mechanism"). NOTE: the single-direction CLI default currently runs the baseline tools-OFF (already no-web); giving it repo-on + web-off safely requires the panel's public-workspace isolation (`isolated-eval-workspace.js`) and is a tracked follow-up — the candidate's resolved workspace is the whole private Development tree, which a tools-on agent must never read.

Per-case verdict from the paired evidence (real case): `applicable` if the with-skill arm is preferred with clean false-positive behavior; `not_discriminated_ceiling` if there is no visible lift because the pointwise baseline already saturated all axes; `equivalent_on_frontier` if there was headroom but this measured frontier model behaved the same with and without the skill; `harmful` if the baseline arm is preferred or flag/fix behavior regresses; `mixed` on split signals. Red-herring cases are graded primarily on false-positive avoidance. Aggregate per-skill verdict: `applicable` if ≥60% of real cases are applicable AND ≤20% of red-herrings false-positive; `harmful` if any real case is harmful or >20% red-herrings false-positive; otherwise the majority no-lift category is preserved instead of collapsing every no-lift outcome into `REDUNDANT`.

Run completeness is a hard gate. If any case errors, the CLI exits non-zero, `aggregate_verdict` is `unverified`, and `completed_subset_aggregate_verdict` records what the completed subset would have said for debugging only. Write-back refuses to stamp `application_verdict` from an incomplete run.

Important scope boundary: this application eval measures **raw skill-body injection** (`<skill>...</skill>` in the with-skill arm) against the same task prompt. It does not measure router recall, progressive-disclosure loading, marketplace installation, or whether an everyday agent would choose to load the skill. Those are separate routing/runtime evals. A no-lift application verdict therefore says "this body did not improve this measured model on this case set under raw injection," not "the skill should be removed from routing."

## Verdict tiering — earned, not assumed (enforced in code)

A single-model run records **`application_verdict: PROVISIONAL`** with an `eval_last_run` receipt — never `APPLICABLE`. `APPLICABLE` requires an **independent, cross-family** dual-run grader (a top-tier judge of a *different model family* than the generator — e.g. Opus generates, GPT-5.4 grades), because a same-family judge inflates its own family's outputs by +10–25pp (self-preference bias, verified 2026-05-30). Until the grader reaches ≥85% agreement with a human reviewer on a calibration set, verdicts are written with `calibrated: false` and MUST NOT certify a skill. See `.claude/rules/version-schema-contract.md` and `docs/verdict-semantics.md`.

This is **enforced in the runner, not just documented** (SH-6624). The runner stamps a `certification_tier` from operator declarations and `stampApplicationVerdict` caps `APPLICABLE → PROVISIONAL` for any tier that is not `certifying`:

- **`provisional` (the default)** — no attestation, undeclared families, or same-family. `APPLICABLE` is unreachable. This is the in-code form of "never UNVERIFIED→APPLICABLE without evidence."
- **`certifying`** — reached ONLY when the operator passes `--certifying` AND declares two *different* vendor families via `--generator-family <F>` and `--grader-family <G>` (e.g. `--generator-family opus --grader-family gpt-5.4`). These flags are a **declaration of provenance, not a model selector** — the runner never selects a model (the operator sets the session model). The declared families are recorded on every history record and on the run summary.

`--single-model` is an additional, stronger override that forces `PROVISIONAL` even on a `certifying` run. Provisional is the safe default; `APPLICABLE` is a deliberate, recorded cross-family act.

### Copy-paste certifying run (earns `APPLICABLE`)

Earning `application_verdict: APPLICABLE` requires a cross-family dual-run: the `--certifying` flag plus two *different* declared vendor families. Omitting `--certifying`, or declaring the same family on both sides, silently caps the result at `PROVISIONAL`.

```bash
# Cross-family certifying run. Model families named by ROLE, not dated version
# (per workspace AGENTS.md § Model Identity Discipline). The generator and grader
# MUST be different families (here: anthropic generates, openai/Codex grades).
APPLICATION_GENERATOR_MODEL=opus APPLICATION_GRADER_MODEL=<codex-current> \
  node bin/skill-graph.js evaluate \
    --mode application \
    --application <skill-dir> \
    <skill-dir>/evals/application.json \
    --certifying \
    --generator-family anthropic --grader-family openai \
    --grader codex --generator claude \
    --trials 3
```

- Drop `--certifying` **or** make `--generator-family` == `--grader-family` → the runner caps `APPLICABLE → PROVISIONAL` (the in-code form of "never certify without cross-family evidence").
- `--generator-family` / `--grader-family` are a **declaration of provenance, not a model selector** — set the actual models via the env vars / session model.
- For a same-family PROVISIONAL spot-check (no certification), use the `skill-graph evaluate:gpt-5.5` profile or pass `--single-model`.

## Comparative fields (`criteria[]`, `artifact`)

The optional `criteria[]` (boolean per-criterion checklist: `{id, polarity: positive|negative|guard, statement}`) and `artifact` fields are consumed by the default blind comparative grader when present. They remain optional so existing eval artifacts continue to run, but new application evals should include them when the case has a concrete diff/config/query or when the expected behavior can be expressed as crisp, checkable criteria.

## Structural conformance gate

`scripts/check-application-evals.js` (SKI-51) is the standalone validator that checks every `evals/application.json` (plus the worked specimen) against the schema-mirrored structural contract: required top-level fields, the `mode: "application"` discriminator, the ≥5-case floor, the per-case required-field set, unique case ids, the `criticality` enum, and red-herring coverage. It is a Node-built-in structural check (no ajv — repo policy), mirroring how the comprehension shape is covered by `lib/audit/eval-linter.js`.

It exists because the schema was previously enforced "by construction + the audit loop" only — the runner deliberately does NOT enforce the case floor at runtime (a partial `--case` filter must run), and `check-audit-manifest.js` only checks that the artifact *exists* when a graded verdict is claimed, never its shape. This gate makes the schema mechanically checkable.

- `npm run application-evals:check` — report-only (exit 0 unless a hard structural break is present). Wired into both `npm run verify` and `npm run verify:system`. Below-floor and missing-red-herring findings are CONTENT-migration debt (drain via `/audit:*`) and are reported but do NOT fail report mode, so a SYSTEM gate never goes red purely because the corpus has not yet migrated to the floor.
- `npm run application-evals:check:strict` (`--check`) — the opt-in HARD gate (exit 1 on ANY finding) for use once the corpus has migrated, or in a CONTENT pre-commit that just authored an application.json. `--strict-floor` gates on the floor in report mode; `--json` emits a machine-readable report; `--skill <name>` checks one skill.

## Worked specimen

`examples/evals/application.sample.json` (database-migration, 5 cases: 4 real + 1 red-herring) is the canonical illustrative specimen and validates against the schema and the conformance gate above.
