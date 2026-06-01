# Proposal — Skill Dimensional Coverage: a Philosophy field + Comprehension/Eval separation

> Status: **PROPOSED — not decided.** Type: SYSTEM (schema + protocol contract).
> Filed: 2026-05-31. Reviewed by GPT-5.5 2026-06-01 (both findings softened — see below).
> Source: Claude Opus ↔ GPT-5.5 field-relevance discussion + two user corrections
> (see `benchmarks/field-relevance/CONCEPTUAL-MODEL.md`).
> Decision owner: project owner. Do NOT implement inline — on acceptance this cascades
> through SYSTEM-mode schema work and the audit loop, never a schema+N-skills mega-edit.

> **GPT-5.5 review (2026-06-01) softened BOTH findings — neither is a confirmed defect:**
> Finding 1 (Philosophy) is a *candidate field gated on naming a consumer*, not a missing
> dimension. Finding 2 (Comprehension) is a *field-description clarification*, not a structural
> split — keep the Understanding fields as the grader's input. GPT-5.5's standing dissent on
> Finding 1 is recorded at the end. The dimensional model itself gained 2 dimensions and 3
> orthogonality fixes from the review (see CONCEPTUAL-MODEL.md § Review provenance).

## Summary

A conceptual analysis of the Skill Metadata Protocol — reasoning from the orthogonal
dimensions a skill *has*, rather than rating the existing fields — surfaced two defects the
field-by-field view is structurally blind to:

1. **A candidate dimension with no field: the philosophy/foundation behind a skill.** No field
   captures *why the skill exists and the worldview/principles it embodies* — distinct from
   *when to use it*. (GPT-5.5: real body content, but a candidate field gated on naming a
   consumer, not a confirmed defect.)
2. **A framing conflation: Comprehension as authored prose vs Comprehension as measurement.**
   The five Understanding fields are *described* as both authored explanation AND the
   measurement. (GPT-5.5: fix the description; keep the fields as the grader's input.)

## Problem 1 — no field for the skill's philosophy

"The philosophy behind the skill" ≠ "when/why to use the skill." The former is the skill's
intellectual foundation (its stance, principles, the claim it rests on); the latter is the
deployment/activation contract carried by `scope` + `description` + `anti_examples`. The
protocol has no home for the former.

This is most acute for skills whose value *is* their stance — the `meta-methods` family
(`inversion`, `first-principles-thinking`, `second-order-thinking`, `methodical`): the
philosophy is the substance of the skill, yet it can only live in the body, invisible to any
structured consumer (human browse, curator review, or a future philosophy-aware grader).

**Why it was missed before:** rating existing fields can only ask "which bucket does this fall
into?" — so the concept got mapped onto `scope` and dismissed as redundant. A missing
dimension is invisible to a field-vs-field rating by construction.

### Option A (proposed): add an authored free-text `philosophy` field
- Free text, optional, no length cap. Captures the foundational rationale/worldview.
- Consumer: human curator + browse; candidate input to a future comprehension/philosophy grader; NOT a routing signal (keep it out of `scoreSkill`).
- Boundary vs neighbors: `description` = what it is; `scope` = when to use; `philosophy` = why it exists / what it believes; Understanding fields = the mental model it conveys.

### Option B: fold into an expanded Understanding block as a 6th authored field
- Lower schema surface, but inherits Problem 2's muddle (authored vs graded). Prefer A.

## Problem 2 — Comprehension conflates authored prose with measurement

Two distinct artifacts are blurred:

| | Comprehension as authored prose | Comprehension as measurement |
|---|---|---|
| What | free text explaining the understanding the skill conveys | `comprehension.json` — tests whether an agent comprehends after reading |
| Who consumes it | human/agent reader | the comprehension grader |
| Where it belongs | the skill's authored content | Evaluation |

Today the five Understanding fields (`mental_model`/`purpose`/`boundary`/`analogy`/
`misconception`) are documented **both** as authored prose **and** as "graded by the
comprehension grader's X dimension (weight N)." That double-duty is the muddle.

### Option A (proposed): name the authored dimension explicitly, keep the eval separate
- Treat the Understanding fields (or a single `comprehension` prose field) as **authored content** only. The eval (`comprehension.json`) is the **measurement**, referenced by the eval pipeline, and is not "the same fields."
- The schema field descriptions stop claiming the authored field *is* the grader input; instead the grader *reads* the authored field as one input among the eval cases.

### Option B: leave as-is, document the dual role
- Cheapest, but preserves the ambiguity that made the role unclear in the first place.

## Consequences if accepted (cascade targets — do NOT edit until decided)

- `schemas/SKILL_METADATA_PROTOCOL_schema.json` — add `philosophy`; clarify Understanding-field descriptions.
- `SKILL_METADATA_PROTOCOL.md`, `docs/SKILL_METADATA_PROTOCOL_field-reference.md`, `docs/field-rationale.md`, `docs/concept-map.md` — document the new dimension + the authored-vs-measured split.
- `docs/comprehension-eval-spec.md` — clarify the eval is the measurement, the authored field is its input.
- Corpus migration via `/audit:*` (version-earned gate), one skill at a time — never a schema+corpus mega-commit.

## GPT-5.5 standing dissent (2026-06-01)

> "Philosophy is a real body-level concept, especially for methodology skills, but the evidence
> does not yet justify a new structured metadata field. The counterfactual consumer is missing:
> the current router does not read it, the schema lacks it, and runtime agents already read body
> prose. File this as 'candidate future field if a human-browse or grader consumer is specified,'
> not as a confirmed protocol defect."

This dissent is **accepted into the proposal**: Decision 1 below is therefore gated on first
naming a concrete consumer for a `philosophy` field.

## Decision needed

1. **Philosophy:** first — is there a concrete consumer (human-browse surface, or a
   philosophy-aware grader) that would read a `philosophy` field? If yes → add it (Option A).
   If no consumer can be named → it stays body content; do NOT add the field yet.
2. **Comprehension:** apply the description clarification (name the eval artifact + verdicts as
   the measurement; name the Understanding fields as the grader's authored input)? (yes / no)
   This is a low-risk SYSTEM doc/schema-description edit — no field added or removed.

Until decided, the benchmark treats #3 (Philosophy) as a **candidate dimension gated on a named
consumer** and #4 (Comprehension) as a **framing/description defect**, not a structural one.
