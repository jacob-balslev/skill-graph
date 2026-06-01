# P3b — Behavior A/B on Understanding fields: GRADER-LIMITED (not run)

> Field-Relevance Benchmark, Phase P3b (Machine B). Question: do the 5 Understanding
> fields (`mental_model`, `purpose`, `boundary`, `analogy`, `misconception`) change an
> agent's in-context comprehension? **Resolution: the measurement is grader-limited — a
> result would be uninterpretable, so the phase is NOT run. Verdict for the fields comes
> from consumer-wiring + conceptual need instead.** Receipt: `p3b-discriminability-receipt.json`.

## Why P3b is not run (the plan's own guard fires)

The plan mandates the grader-compression guard *before* trusting any Machine B result:
"run `eval-discriminability-report.js` on grader output; if CV<0.1 / ceiling>20%, the judge
physically can't register a small delta → report `grader-limited`, not 'field irrelevant.'"

The guard (1,970 comprehension-grader rows, deterministic) shows the grader **ceilings on
exactly the dimensions P3b would measure:**

| Dimension (Understanding field) | with-skill mean | ceiling | > 20% threshold |
|---|---|---|---|
| `analogy` | 0.930 | **47%** | ⚑ compressed |
| `purpose` | 0.914 | **37%** | ⚑ compressed |
| `mental_model` | 0.928 | **36%** | ⚑ compressed |
| `boundary` | 0.931 | **27%** | ⚑ compressed |
| `misconception` | — | — | 0 grader consumers (not graded at all) |

Compounding it: the **whole-skill** comprehension delta is already at the noise floor for the
eligible corpus — the 13 canonical-arm cells score `primary_delta_avg` mean **−0.037** (max
|0.29|) with verdicts **10 REDUNDANT / 2 SHALLOW**. The 15 skills that even qualify (have both
populated Understanding fields AND a comprehension eval) are almost all `meta-methods` — portable
methodology skills whose concepts the frontier models already know (REDUNDANT). The Understanding
fields are a strict *subset* of a whole-skill contribution that is itself ≈0, so their isolated
delta is bounded below the grader's discrimination floor.

Running P3b would spend ~300 model calls to produce a null the guard tells us to distrust.
Per the plan's guard rule + `cost-aware-delegation`, it is not run.

## Consistency with prior evidence

- 2026-05-29 metadata A/B (memory `skill-metadata-structure-ab-no-effect`): stripping
  audit/eval/provenance metadata had no detectable behavioral effect on Opus (p=0.65); structure
  changes also null. That experiment *kept* the Understanding fields — P3b is the untested strip —
  but the broader signal (metadata barely moves a frontier agent's behavior on these skills) is
  the same direction.
- The user directive (2026-06-01) that invalidated corpus-routing as a relevance signal applies
  with equal force here: the Understanding fields, the eval scenarios, and the rubric are all
  self-authored, and the grader saturates. Machine B over this corpus+grader is not a valid
  relevance source — same class of confound as Machine R.

## How the Understanding fields ARE verdicted instead

Population-and-grader-invariant evidence:
- **Consumer wiring (P1a):** the comprehension grader reads `mental_model`, `purpose`, `analogy`,
  and `boundary` as **INPUT** (`cgrader` consumer). They are wired into the comprehension pipeline
  — LOAD-BEARING-by-grader-input, independent of any measured behavior delta.
- **`misconception`:** 0 consumers (not even the grader). Its only value is as a body-level
  authored inoculation hint → DECORATIVE *as a routed/graded frontmatter field*; KEEP only if the
  conceptual-coverage check argues a human-reader/authoring dimension nothing else carries.
- **Conceptual need:** the dimensional-coverage model (`CONCEPTUAL-MODEL.md`) decides whether each
  field maps to a distinct teaching dimension — the structural question, immune to grader ceiling.

## To override (if a receipt is wanted anyway)

A grader-limited verdict is the honest call, but if a literal Understanding-strip receipt is
desired despite the ceiling, the minimal slice is:
`node dist/ab/comprehension-ab-driver.js --skills autonomous-loop-patterns,blue-ocean-strategy
--variants uf-with,uf-without --trials 3` after building the variants with a
`build-understanding-variant.js` sibling stripper. Expect a null bounded by the 27–47% ceiling —
interpret as grader-limited, never as "fields irrelevant."

## Completeness

Examined: the guard over 1,970 comprehension rows + 13 canonical-arm whole-skill cells + 15
eligible skills. Phase resolved as grader-limited with receipt. No model calls spent. The
behavior axis for all 5 Understanding fields is recorded UNMEASURABLE (grader-limited), never
DECORATIVE-by-null.
