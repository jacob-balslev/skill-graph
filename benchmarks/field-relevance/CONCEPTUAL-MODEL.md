# Field Relevance — Conceptual Model

> The conceptual foundation for the field-relevance benchmark. Answers "how relevant
> is each metadata field *in and of itself*" — before any empirical run. Authored
> 2026-05-31 from a Claude Opus ↔ GPT-5.5 discussion and two user corrections that
> reframed the whole question. Companion to the benchmark plan
> (`docs/plans/field-relevance-benchmark-2026-05-31.md`) and `p05-findings.md`.

---

## Correction 1 — population is NOT a relevance signal

**The corpus is self-authored. How many skills populate a field measures our authoring
habits, not the field's worth.** "138/159 skills set `taxonomy_domain`" only proves we
filled it in dutifully; "0 skills set `marketplace_tier`" does not prove it is useless —
it may be a useful field nobody has authored yet. Using adoption to judge relevance is
circular: it measures the output of our own past decisions and calls it evidence.

**Relevance is judged only by signals invariant to population:**

1. **Consumer dependency** — does any code path *read and act on* the field? (A field no consumer reads can only have human-reader value, which must be argued explicitly, never assumed.)
2. **Counterfactual outcome change** — hold a skill fixed, vary *only* this field's value, run the consumer (router / lint / gate / agent); does the outcome change in the expected direction?
3. **Controlled injection** — on probe skills/queries *we construct*, does a correct value change routing/behavior vs an absent-or-wrong value? (Never the self-authored corpus as evidence.)
4. **Redundancy & conceptual need** — non-redundant information mapping to a real consumer?

Population is recorded only as an *operational note* ("to use this field, N skills would
need authoring"), never as a verdict input.

---

## Correction 2 — rate the DIMENSIONS, not the fields

The deeper error: an earlier pass *rated the 56 existing fields against each other*. That
mode is **structurally blind** to the two most important questions:

- It cannot surface a **missing dimension** — a genuinely new concept (e.g. "the philosophy behind the skill") gets force-mapped onto the nearest existing field and dismissed as "redundant with `scope`," when in fact the protocol has *no field for it at all*.
- It cannot surface a **muddled dimension** — two fields that are secretly the same concept wearing two hats stay muddled, because field-vs-field rating never asks "are these the same dimension?"

Both failures share the root cause that drove Correction 1: **reasoning *from* the existing
protocol's categories instead of *from* the concept space itself.** The protocol became the
frame, so anything it omits was invisible.

The right question is therefore **not** "rate the 56 fields." It is:

> **What are the orthogonal conceptual dimensions a skill *has*? Which fields map cleanly to exactly one dimension? Which fields smear or duplicate a dimension? And which dimensions have no field at all?**

---

## The two lenses

### Lens A — "relevant to whom?" (the consumer lens)

A field is relevant only if a **consumer** acts on it. There are six, and most fields serve one:

| Consumer | Decides | Acts on |
|---|---|---|
| **R — Router/injector** | which skill to load | description, keywords, triggers, examples, anti_examples, paths, subject |
| **A — Runtime agent** | how to do the task | the **body** — almost no metadata |
| **U — Audit loop / grader** | is the skill honest & useful | verdicts, eval state, drift, grounding |
| **H — Human curator** | maintain the library | owner, version, stability, relations, taxonomy |
| **M — Marketplace** | publish | license, deployment_target, marketplace_tier, compatibility |
| **G — Graph** | navigate/triangulate | relations.* |

**Verified fact (corrected after GPT-5.5 review).** The router has two stages, and an earlier
draft of this doc over-claimed by collapsing them:
- The **scoring function** `scoreSkill` (`scripts/skill-graph-route.js:155`) scores on **only `triggers`, `keywords`, `paths`** — description/subject/scope contribute zero to the *score*.
- The **full `routeSkills` pipeline** additionally reads `project` filters, `deployment_target` tie-breaks, `relations`, and verdict / `eval_state` / staleness **gates** (`skill-graph-route.js:519/562/585/721`). So those fields ARE router-consumed — as gates/tie-breaks, not as score.

The **runtime agent reads almost no metadata** — it reads the body. So a field's relevance is
about whether **R (score OR gate), U, H, M, or G** acts on it, never the runtime agent.

### Lens B — orthogonal dimensions of a skill (v2, corrected after GPT-5.5 review)

GPT-5.5's review fixed three orthogonality defects in the v1 table and added two dimensions
the v1 model missed. Changes from v1: `examples`+`anti_examples` are ONE activation pair (both
under #7, not split across #5/#7); #9 vs #11 split cleanly into *measurement process* (#9) vs
*recorded result/freshness* (#11); old #12 split into **Governance** (#12, `owner`) and
**Distribution** (#13, marketplace/license); added **#14 Execution constraints** and **#15
Observed runtime outcome**. Net: the protocol has a field for **every dimension except #3
(Philosophy)** — i.e. dimensional coverage is more complete than v1 implied.

| # | Dimension (what it captures) | Current field(s) | State |
|---|---|---|---|
| 1 | **Identity** — what it's called | `name`, `version` | clean |
| 2 | **What it is** — one-line summary | `description` | clean |
| 3 | **Philosophy / foundation** — *why it exists; the worldview, stance & principles it embodies* | **none** (body only) | **CANDIDATE — no field, no consumer yet** (see Finding 1) |
| 4 | **Comprehension** — *authored prose explaining the understanding the skill conveys* | `mental_model`/`purpose`/`boundary`/`analogy`/`misconception` | clean as authored content; schema wrongly calls them *the measurement* (see Finding 2) |
| 5 | **When/why to use** — deployment contract (prose) | `scope` | clean |
| 6 | **Where it applies** — environment & grounding | `deployment_target`, `grounding`, `paths` | clean (router gate + tie-break) |
| 7 | **How it's found** — activation signal (positive + negative pair) | `keywords`, `triggers`, `examples`, `anti_examples` | clean |
| 8 | **How it relates** — graph edges | `relations.*` | clean (router co-load/exclude) |
| 9 | **How it's evaluated** — the *measurement process & artifacts* | `comprehension.json`, `application.json`, `eval_score`, `eval_last_run` | clean |
| 10 | **How it's classified** — browse shelf | `subject`, `subjects`, `taxonomy_domain` | clean (browse + manifest facet) |
| 11 | **Recorded quality / honesty / freshness state** — the *result* of #9 + drift | the four verdicts, `drift_*`, `freshness`, `last_audited`, `lifecycle` | clean (router health gate) |
| 12 | **Governance** — maintenance accountability | `owner` | clean |
| 13 | **Distribution / publication** | `license`, `marketplace_tier`, `compatibility`, `stability`, `superseded_by`, `portability` | clean (marketplace consumer) |
| 14 | **Execution constraints** — tools the skill may use | `allowed-tools` | clean (harness gates tool calls) |
| 15 | **Observed runtime outcome** — real-world success/failure feed | `runtime_telemetry` | clean concept; may corroborate/override #11 |

---

## The two structural findings (filed as a proposal)

These are findings, **not decided changes.** Filed at
`docs/proposals/skill-dimensional-coverage.md` for the SYSTEM-mode design pipeline.

### Finding 1 — Philosophy is a CANDIDATE dimension, not a confirmed defect (#3)

"The philosophy behind the skill" — its foundational rationale, worldview, and principles —
is **not** the same as "when/why to use it" (#5). One is what the skill *believes*; the other
is when it *fires*. The content is genuinely distinct and real: verified in the bodies of
`first-principles-thinking` (worldview: most constraints are second-hand; controlled reduction
+ reconstruction; originality is not the bar) and `inversion` (output is a map of blockers
turned into prevention, not pessimism). For methodology/thinking skills the philosophy *is* the
substance.

**But — corrected after GPT-5.5's dissent — this is a CANDIDATE field, not a proven defect.**
By the consumer test this whole model adopts, a dimension only earns a field once a *consumer*
reads it. Today: no `philosophy` property exists, no router/grader/browse consumer reads one,
and `purpose` already carries part of the content. So the honest status is: **the dimension
exists in body prose; it becomes a field only when a concrete consumer is named** (human-browse
surfacing, or a philosophy-aware grader). Calling it a "missing dimension / defect" in v1
overstated it — the rigorous claim is "candidate, gated on a named consumer."

### Finding 2 — Comprehension conflates authored prose (#4) with measurement (#9)

There are two distinct artifacts the protocol currently blurs:

- **Comprehension as authored prose (#4)** — free text explaining the understanding the skill conveys; its grasp of the subject; the mental model it imparts. A human/agent *reads* it.
- **Comprehension as measurement (#9)** — `comprehension.json`: an eval that *tests whether an agent comprehends* after reading the skill. A grader *runs* it. This belongs to Evaluation.

The five Understanding fields (`mental_model`/`purpose`/`boundary`/`analogy`/`misconception`)
are described in the schema **both** as authored prose **and** as "graded by the comprehension
grader's X dimension." That double-duty is the muddle.

**The fix — refined after GPT-5.5's review — is NOT to discard or even split the fields.**
Authored understanding prose *can and should* be a grader input. The defect is purely in the
*framing*: the schema describes the authored field **as** the measurement, when it is the
measurement's *input*. Keep the fields exactly where they are; correct the field descriptions
so that the eval artifact (`comprehension.json`) + the verdict fields are named as the
measurement, and the Understanding fields are named as authored content the grader reads. A
description fix, not a structural one.

---

## How this reframes the benchmark

- **Verdict target:** test whether *each dimension* changes a consumer outcome, not whether each field is individually redundant.
- **Design check (free, deterministic):** does every dimension have exactly one clean field, and does every field map to exactly one dimension? This check *immediately* surfaces #3 (no field) and #4↔#9 (one concept, conflated fields) — which the field-rating never could.
- **Controlled experiments** then measure the dimensions that have a live consumer (routing dimensions via injection; comprehension/philosophy prose via behavior A/B if a consumer reads them).

## Review provenance

v1 (Opus) → reviewed by GPT-5.5 (read-only, 2026-06-01) → v2 (this doc). GPT-5.5's accepted
corrections: 3 orthogonality fixes (examples/anti_examples are one pair; #9 vs #11 = process vs
recorded-result; old #12 split into Governance + Distribution); 2 added dimensions (#14
execution constraints, #15 runtime outcome); corrected the router over-claim (`scoreSkill`
scoring ≠ the full `routeSkills` pipeline, which also gates on project/deployment_target/
relations/verdicts/eval_state/staleness); Philosophy downgraded from "defect" to "candidate
gated on a named consumer"; Comprehension fix refined to a description change, not a structural
split. GPT-5.5's standing dissent: do not treat Philosophy as a confirmed protocol defect until
a consumer is specified — recorded in the proposal.

## Completeness

Examined 15 dimensions (v2) and all 56 fields against them. **Zero dimensions are structural
defects** after review: #3 (Philosophy) is a *candidate* field gated on a named consumer, and
#4 (Comprehension) needs a *description* clarification, not a structural change. Every other
dimension maps cleanly to ≥1 field with a real consumer. Items excluded: none.
