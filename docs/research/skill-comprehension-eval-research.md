# Skill Comprehension Evaluation — Research Report

> **Subject.** How to measure whether an AI agent has actually **learned the subject** from a Skill Graph `SKILL.md`, as opposed to whether it can route the skill correctly, conform to the schema, or pattern-match against the body.
>
> **Audience.** Skill Graph maintainers and contributors deciding the next minimum upgrade to the comprehension-grading surface.
>
> **Status.** Research deliverable. Not a protocol change. The proposed rubric and worked example are recommendations; final decisions belong to the maintainer.
>
> **Date.** 2026-05-16.
>
> **Scope.** Comprehension-quality evaluation only. Structural conformance (lint, manifest parity, drift, routing) is already owned by `scripts/skill-lint.js`, `scripts/skill-graph-routing-eval.js`, and `scripts/skill-graph-drift.js` and is **out of scope** for this report.

---

## Table of contents

1. [Executive summary](#1-executive-summary)
2. [What the repo currently evaluates](#2-what-the-repo-currently-evaluates)
3. [What the repo does NOT evaluate](#3-what-the-repo-does-not-evaluate)
4. [External research synthesis](#4-external-research-synthesis)
   - 4.7 [RLHF failure rates as the empirical case for forced-completeness graders](#47-rlhf-failure-rates-as-the-empirical-case-for-forced-completeness-graders)
5. [Proposed comprehension-quality rubric](#5-proposed-comprehension-quality-rubric)
   - 5.13 [Scoring discipline — the rubric as an application of `methodical`](#513-scoring-discipline--the-rubric-as-an-application-of-methodical)
6. [Worked example — `type-safety`](#6-worked-example--type-safety)
7. [Implementation recommendations](#7-implementation-recommendations)
   - 7.10 [R9 — Grader prompt incorporates `methodical` forcing functions](#710-r9--grader-prompt-incorporates-methodical-forcing-functions)
8. [Risks and anti-patterns](#8-risks-and-anti-patterns)
   - 8.9 [`methodical` anti-patterns mapped to LLM-as-judge comprehension-grading failures](#89-methodical-anti-patterns-mapped-to-llm-as-judge-comprehension-grading-failures)
9. [Open questions](#9-open-questions)
10. [Completeness claim](#10-completeness-claim)

---

## 1. Executive summary

The Skill Graph evaluates four orthogonal surfaces: **schema conformance** (lint), **manifest parity** (generator round-trip), **drift** (truth-source hashes), and **routing** (`activation.examples` and `activation.anti_examples` against the router). All four are mature and largely deterministic.

A fifth surface — **comprehension quality** — is **declared but unimplemented**. The protocol defines `comprehension_state: present`, mandates the seven-field `concept` block when present (`definition`, `mental_model`, `purpose`, `boundary`, `taxonomy`, `analogy`, `misconception`), and the schema documents per-field grader weights (`mental_model` and `boundary` at 1.5, `definition` / `purpose` / `taxonomy` at 1.0, `analogy` at 0.5, `misconception` not directly graded — see [`schemas/skill.v4.schema.json` lines 169–211](/Users/jacobbalslev/Development/skill-graph/schemas/skill.v4.schema.json)). But the grader script the schema references — `scripts/skill/evaluate-skill.js --comprehension` — **does not exist** in the repo. No code reads the `concept` block for grading purposes; no eval format encodes "does the agent's answer match the `definition` field without copying it"; no rubric distinguishes "the agent retrieved a quote from the body" from "the agent reasoned about a fresh case using the skill's mental model."

The 31 eval files in `examples/evals/` use a rich per-case schema (`dimension`, `substance`, `calibration`, `truth_mode`, `skill_type`, `criticality`, `truth_sources`, optional `expected_reasoning`). But the dimension distribution skews heavily toward **routing-adjacent** measurement: 84 cases are tagged `application`, 62 are `boundary`, and only 10/11/7/2/1 cases respectively measure `definition` / `mental_model` / `purpose` / `rule_conflict` / `anti_pattern`. The concept-block grader weights are not represented in the data.

This report proposes a minimum upgrade path:

1. **An 8-dimension comprehension rubric** — one rubric dimension per concept-block field, plus two cross-cutting dimensions (`verification-application` and `negative-boundary-respect`) that the existing 7-field block does not cover but that the body Verification and Do-NOT-Use-When sections already encode.
2. **Pass/fail criteria with concrete examples** for each dimension, distinguishing six failure modes (verbatim copying, paraphrastic regurgitation, body-only retrieval, near-vs-far transfer failure, leading-prompt capitulation, scope-reduction softening).
3. **An eval-file extension** — additive only, no schema break — adding optional `comprehension_dimension`, `concept_field`, and `expected_behaviors` keys so existing files remain valid.
4. **A worked example** of ~10 scenarios mapped onto `skills/type-safety/SKILL.md` in valid JSON shape, demonstrating coverage across all 8 rubric dimensions.
5. **A concrete implementation order**, ranked by leverage: the smallest viable change is a 30-line grader prompt template plus a `evals/comprehension/<skill>.json` example, **not** a new script or schema bump.

The report does not propose a new schema version, does not redesign lint or drift, and does not recommend a commercial eval platform.

---

## 2. What the repo currently evaluates

The Skill Graph's evaluation discipline is described in [`AGENTS.MD` § Evaluation Discipline (lines 143–189)](/Users/jacobbalslev/Development/skill-graph/AGENTS.MD). It names four layers, each with its own definition of "good":

| Layer | Question | Surface | Deterministic? |
|---|---|---|---|
| Per-skill content | Schema valid, body sections present, eval coherent? | `scripts/skill-lint.js` | Yes |
| Routing | Right skill fires for the prompt? | `scripts/skill-graph-routing-eval.js` | Yes (against router) |
| Manifest / contract | Authored skills round-trip through the manifest generator? | `scripts/generate-manifest.js --validate-only` | Yes |
| Drift | Has the cited truth source changed since `last_verified`? | `scripts/skill-graph-drift.js` | Yes |

The audit loop ([`SKILL_AUDIT_LOOP.md`](https://github.com/jacob-balslev/skill-audit-loop/blob/main/SKILL_AUDIT_LOOP.md)) layers a five-phase wrapper on top: deterministic lint (Phase 1), optional model-graded review across seven dimensions (Phase 2), aggregate verdict (Phase 3), fix-or-defer (Phase 4), re-verify (Phase 5). The seven audit dimensions are defined in [`scripts/lib/audit-prompt-builder.js` lines 37–80](/Users/jacobbalslev/Development/skill-graph/scripts/lib/audit-prompt-builder.js): `metadata`, `activation`, `relation`, `grounding`, `content`, `eval`, `portability`.

### 2.1 The 31 eval files

The universe of comprehension-relevant data is `examples/evals/*.json` — 31 files at the time of this report. Each file is keyed by `skill_name` (the lint check `checkEvalCoherence` at [`scripts/skill-lint.js:414`](/Users/jacobbalslev/Development/skill-graph/scripts/skill-lint.js) enforces that this matches the skill's `name` field) and contains an `evals` array of scenario objects.

A scenario object has the following per-case fields, observed across the 31 files:

| Field | Required | Cardinality | What it carries |
|---|---|---|---|
| `id` | yes | 1 per case | Sequence number within the file |
| `prompt` | yes | 1 | The realistic user input the grader will pose to the model |
| `dimension` | yes (de facto) | enum below | The comprehension axis being measured |
| `substance` | yes (de facto) | `domain` / `contradiction-check` | Whether the case probes positive correctness or a negative boundary |
| `calibration` | yes (de facto) | `semantic` / `process` | Whether the grader checks meaning or sequence |
| `truth_mode` | yes (de facto) | `code_verification` / `conceptual_correctness_plus_repo_application` / `process_correctness` | How a grader confirms the answer |
| `skill_type` | yes (de facto) | `concept` / `workflow` | Which archetype the scenario tests |
| `criticality` | yes (de facto) | `normal` / `high` / `critical` | Weight for aggregation |
| `truth_sources` | yes (de facto) | array of `path` or `path:start-end` or `path#anchor` | Where a grader reads to verify |
| `expected_reasoning` | optional | string | Sketch of the correct chain of reasoning |

Two files — `comprehension.json` (`documentation`) and `debugging.json` — also include `expected_reasoning` on at least one case ([`examples/evals/comprehension.json:163`](/Users/jacobbalslev/Development/skill-graph/examples/evals/comprehension.json) and [`examples/evals/comprehension.json:179`](/Users/jacobbalslev/Development/skill-graph/examples/evals/comprehension.json) — both `dimension: rule_conflict`). These two cases are the high-water mark of comprehension-quality measurement in the repo today.

The lint check `checkEvalTruthSourceRanges` (D2, at [`scripts/skill-lint.js:586`](/Users/jacobbalslev/Development/skill-graph/scripts/skill-lint.js)) validates that every `truth_sources` reference resolves: the file exists, line ranges are within bounds, anchors match an actual heading. This is the only contract the eval files enforce today; nothing checks dimension coverage, prompt quality, or rubric alignment.

### 2.2 Dimension distribution

A grep across all 31 files (`grep -h '"dimension":' examples/evals/*.json | sort | uniq -c`) shows the current dimension distribution:

| Dimension | Cases | % of total |
|---|---|---|
| `application` | 84 | 47.7% |
| `boundary` | 62 | 35.2% |
| `mental_model` | 11 | 6.3% |
| `definition` | 10 | 5.7% |
| `purpose` | 7 | 4.0% |
| `rule_conflict` | 2 | 1.1% |
| `anti_pattern` | 1 | 0.6% |
| **Total** | **177** | 100% |

This distribution is heavily skewed toward two dimensions — `application` and `boundary` — which together capture **82.9%** of the data. The seven concept-block fields (`definition`, `mental_model`, `purpose`, `boundary`, `taxonomy`, `analogy`, `misconception`) collectively have eval coverage on **only four** of the seven (`definition`, `mental_model`, `purpose`, `boundary`); `taxonomy`, `analogy`, and `misconception` have **zero** eval cases tagged for them across the entire library.

### 2.3 The audit loop's content dimension

The audit loop's `content` dimension (one of the seven scorecard rows) does include comprehension-shaped checks. From [`SKILL_AUDIT_CHECKLIST.md` § 5 (lines 132–141)](https://github.com/jacob-balslev/skill-audit-loop/blob/main/SKILL_AUDIT_CHECKLIST.md):

- the skill has a clear Coverage section
- the skill has a clear Philosophy section
- the skill has a clear Verification section
- the skill has at least one concrete decision table, checklist, or routing rule
- the skill contains negative bounds (Do NOT Use When)
- the skill does not contain generic model-native filler
- the skill does not claim behavior it cannot verify

These are **structural** checks on the body, not behavioral checks on an agent. The audit grader reads the skill and judges the body; it does **not** pose scenarios to a fresh model that has the skill loaded as context. The distinction matters: a skill's body can be perfectly clear and still fail to cause comprehension, and a skill's body can be cryptic and still cause comprehension if its primitives transfer. The audit measures the prose; comprehension measures the **agent's behavior given the prose**.

### 2.4 The `concept` block today

The seven-field `concept` block is defined in the schema at [`schemas/skill.v4.schema.json` lines 169–211](/Users/jacobbalslev/Development/skill-graph/schemas/skill.v4.schema.json). Each field carries an explicit grader weight in its description string:

| Field | Schema weight | Schema description (summary) |
|---|---|---|
| `definition` | 1.0 | What the concept IS — primary category + what it does + who uses it |
| `mental_model` | 1.5 | Primitives and their relationships |
| `purpose` | 1.0 | Problem it solves and the alternative it replaced |
| `boundary` | 1.5 | Things commonly confused with the concept but that are NOT it |
| `taxonomy` | 1.0 | Nearby concepts with relationship type (subset / alternative / prerequisite / composition / specialization) |
| `analogy` | 0.5 | Analogy that preserves the core mechanism |
| `misconception` | not directly graded | Wrong mental model people bring; inoculation hint |

The schema description for `concept` explicitly names a script that does not exist in the repo: `scripts/skill/evaluate-skill.js --comprehension`. A `find` over the repo confirms no file at that path. This is the single largest gap: the protocol declares the surface, the schema documents the grader weights, the lint enforces the presence of the seven fields when `comprehension_state: present`, but **no code consumes the block for grading**.

Two skills in the active library declare `comprehension_state: present` and provide a populated `concept` block: `skills/type-safety/SKILL.md` (lines 63–116) and `skills/acid-fundamentals/SKILL.md` (lines 66–181). Both are exemplary in body depth — `type-safety` runs 116 lines of frontmatter concept block; `acid-fundamentals` runs 115 lines. Both also declare `eval_artifacts: planned` and `eval_state: unverified` — i.e., they self-report that no comprehension eval has shipped yet, which is accurate.

The `examples/evals/comprehension.json` file is keyed to `skill_name: documentation`, **not** to either of the two skills with populated concept blocks. As of this report, no eval file exists for `type-safety` or `acid-fundamentals` — the two gold-standard comprehension targets are the two with zero eval coverage.

### 2.5 Summary of what's evaluated today

The repo today evaluates:

- **Whether `concept` exists** when `comprehension_state: present`, and whether each of the seven sub-fields is a string (lint enforces; see [`scripts/skill-lint.js:309`](/Users/jacobbalslev/Development/skill-graph/scripts/skill-lint.js)).
- **Whether eval files exist** when `eval_artifacts: present` and whether their `skill_name` matches a skill (lint enforces; see [`scripts/skill-lint.js:414`](/Users/jacobbalslev/Development/skill-graph/scripts/skill-lint.js)).
- **Whether eval `truth_sources` resolve** to real files, valid line ranges, and existing anchors (D2 check; see [`scripts/skill-lint.js:586`](/Users/jacobbalslev/Development/skill-graph/scripts/skill-lint.js)).
- **Whether `activation.examples` route to this skill** and `activation.anti_examples` route away from it (positive/negative routing; see [`scripts/skill-graph-routing-eval.js`](/Users/jacobbalslev/Development/skill-graph/scripts/skill-graph-routing-eval.js)).
- **Whether the body is structurally complete** against the archetype (see [`scripts/lint/check-archetype-sections.js`](/Users/jacobbalslev/Development/skill-graph/scripts/lint/check-archetype-sections.js)).
- **Whether the audit grader can judge each of seven scorecard dimensions** from the skill body + truth sources + neighbors + (for eval) attached eval artifact (see [`scripts/lib/audit-prompt-builder.js`](/Users/jacobbalslev/Development/skill-graph/scripts/lib/audit-prompt-builder.js)).

What the repo today **does not evaluate** — the focus of §3 — is **whether an agent actually learns the subject from the skill**.

---

## 3. What the repo does NOT evaluate

The gap is precise. It is not "we have no evals." It is: **no surface in the repo measures whether an agent given this `SKILL.md` as context, and given a fresh prompt that does not appear in the body, produces an answer that demonstrates the skill's concept primitives have been internalized.**

This section maps the gap onto the seven concept-block fields plus two cross-cutting dimensions the body already encodes (Verification, Do NOT Use When) but no comprehension eval probes.

### 3.1 No per-concept-field eval contract

The schema documents grader weights for each concept field. There is no eval-file convention that ties a scenario to a concept field. The closest signal is the `dimension` enum in eval cases — but `dimension` is a loose enum (`application`, `boundary`, `definition`, `mental_model`, `purpose`, `rule_conflict`, `anti_pattern`) that does not map 1:1 to the seven concept fields. Specifically:

- `taxonomy`, `analogy`, and `misconception` have no corresponding `dimension` value in any eval file in the library.
- `application` (the most common dimension, 84 cases) is not a concept field; it is closer to "task-level behavior".
- `boundary` is overloaded — it serves both as the concept-block field name AND as the eval dimension that means "routing handoff to a sibling skill". These are not the same idea: the concept-block `boundary` is about *which things look like this concept but aren't* (a discrimination test); the eval-dimension `boundary` is about *which queries belong to a sibling skill instead* (a routing test).

The result: a skill author who fills the `concept` block does not know what a comprehension eval for that block would look like, and a grader has no scaffolding to tell whether `mental_model` (weight 1.5) actually transferred.

### 3.2 No verbatim-copy detector

A failure mode the protocol's quality doctrine warns against — "evals that paraphrase the skill body back to itself" ([`AGENTS.MD` line 186](/Users/jacobbalslev/Development/skill-graph/AGENTS.MD)) — has no test. The current eval files frequently use prompts like:

> "According to the X skill's Y section, what is the correct primitive…"
> (e.g. [`examples/evals/a11y.json:8-16`](/Users/jacobbalslev/Development/skill-graph/examples/evals/a11y.json))

These prompts effectively instruct the model to **quote** the skill, then check whether the quote is correct. They cannot distinguish a model that copies from a model that reasons. The cases marked `dimension: definition` (10 cases) are particularly vulnerable: by definition, the right answer is "what the skill says X is", and any model that can find the section heading wins.

### 3.3 No near-vs-far transfer separation

The educational psychology literature, especially [Barnett & Ceci (2002)](https://pubmed.ncbi.nlm.nih.gov/12081085/), distinguishes near transfer (similar context, similar surface) from far transfer (different context, same underlying primitives). Far transfer is the harder test of genuine comprehension and the one the literature finds most often fails.

The eval library has no near/far distinction. Most cases use scenarios extremely close to the body's worked examples — the `documentation` skill's eval asks about doc-type selection in a hypothetical that closely matches the body's doc-type-selection section. A model that has the body in context can pattern-match the prompt to the relevant body anchor without ever using the concept's primitives on a case the body did not cover.

A genuine `mental_model` test would force far transfer: pose a scenario the body does not enumerate, where the only path to a correct answer is to apply the concept's named primitives to the novel case. The repo today has no eval cases that explicitly forbid the model from quoting the body, no cases that use scenarios from a different domain than the body's examples, and no rubric for distinguishing "the primitives transferred" from "the surface matched".

### 3.4 No misconception inoculation test

The `concept.misconception` field is required when `comprehension_state: present`, and the schema notes it is "not directly graded; complements `boundary`" ([`schemas/skill.v4.schema.json:208`](/Users/jacobbalslev/Development/skill-graph/schemas/skill.v4.schema.json)). But "complements `boundary`" is not a measurement. A misconception eval would pose a prompt that **sounds like the misconception is correct** and check whether the agent corrects it unprompted. No eval case in the library does this. The closest is the comprehension.json file's `rule_conflict` dimension — two cases that pose a "should this rule bend?" question and check the agent's reasoning — but those probe rule-application under tension, not misconception-inoculation.

### 3.5 No analogy-reuse / analogy-overreach probe

The `concept.analogy` field has grader weight 0.5 (lowest among the seven) and zero eval cases tagged for it. The literature on analogical reasoning ([Gentner 1983 structure-mapping; Hofstadter & Sander 2013 *Surfaces and Essences*](https://www.basicbooks.com/titles/douglas-hofstadter/surfaces-and-essences/9780465018475/)) consistently finds that the test of analogy mastery is **knowing where the analogy breaks**. The current eval files have no scenario that asks "given this analogy from the skill, is this novel case structurally analogous or is the analogy stretched too far?" The result: a skill can have a beautiful analogy in its `concept.analogy` field and no test will catch a model that has rote-memorized the analogy but applies it where it shouldn't.

### 3.6 No taxonomy-navigation probe

The `concept.taxonomy` field is required to enumerate nearby concepts with their relationship type (subset / alternative / prerequisite / composition / specialization). The schema description is explicit about the relationship-type vocabulary ([`schemas/skill.v4.schema.json:200`](/Users/jacobbalslev/Development/skill-graph/schemas/skill.v4.schema.json)). No eval case tests whether the agent can correctly classify a novel instance into the right relationship-type bucket. A genuine taxonomy test would pose a scenario involving a concept not enumerated in `taxonomy` and ask the agent to place it (e.g., for `type-safety`'s taxonomy that lists "sound", "unsound/gradual", "structural", "nominal", "dependent", "refinement", "narrowing", "validation": pose a question about a Haskell **GADT** — neither dependent nor refinement, but it composes types with constraints — and verify the agent reaches "extension of refinement-typing in the direction of dependent typing" rather than mis-placing it).

### 3.7 No Verification-checklist application test

Every `capability` and `workflow` skill is required to have a `## Verification` section (enforced by [`scripts/lint/check-archetype-sections.js`](/Users/jacobbalslev/Development/skill-graph/scripts/lint/check-archetype-sections.js)). The Verification section is the skill's authored answer to "after applying this skill, what evidence confirms the skill was applied correctly?" Eval cases occasionally reference Verification (e.g. [`examples/evals/comprehension.json:174-181`](/Users/jacobbalslev/Development/skill-graph/examples/evals/comprehension.json) — the dimension is `rule_conflict`, the prompt asks whether a doc passing Verification but failing the Philosophy test is acceptable). But no case poses a fresh artifact and asks the agent to run the Verification checklist against it unprompted. This is a comprehension test the body already authors and the eval surface does not redeem.

### 3.8 No negative-boundary refusal test

The `## Do NOT Use When` section is required for `capability` skills and is a primary anti-overreach mechanism. The lint check verifies the section exists; the routing eval verifies that `anti_examples` route away. But neither tests **the loaded model's refusal behavior**: when a user prompt asks the skill to do something in the Do-NOT list, does the agent refuse and route to the named owner skill, or does it overreach? The routing eval tests the router's decision before the skill is loaded; the comprehension test would probe the loaded skill's refusal discipline. They answer different questions.

### 3.9 Gap summary table

| Concept-block field | Schema weight | Eval cases today | Gap |
|---|---|---|---|
| `definition` | 1.0 | 10 (5.7%) | Cannot distinguish quote-retrieval from reasoning |
| `mental_model` | 1.5 | 11 (6.3%) | No far-transfer scenarios — body-side pattern match dominates |
| `purpose` | 1.0 | 7 (4.0%) | Few cases; tests "why does this exist" but not "what would replace it" |
| `boundary` | 1.5 | 62 (35.2%) — but these mostly test **routing** boundary, not concept-block discrimination | Concept-discrimination tests confused with routing-handoff tests |
| `taxonomy` | 1.0 | 0 | No test of relationship-type placement |
| `analogy` | 0.5 | 0 | No test of analogy reuse or analogy-stretch limits |
| `misconception` | not graded | 0 | No misconception-inoculation probe |
| (cross-cutting) Verification application | — | 0 unprompted | No fresh-artifact "apply checklist" cases |
| (cross-cutting) Do NOT refusal | — | 0 in-skill refusal | Only routing-time anti_examples — no in-skill refusal probe |

---

## 4. External research synthesis

Comprehension measurement for AI agents draws from three rough buckets of prior work: classical educational measurement, machine-learning evaluation infrastructure, and recent LLM-specific eval practice. Each contributes a different idea the proposed rubric uses.

### 4.1 Classical educational measurement

#### 4.1.1 Bloom's Taxonomy, revised (Anderson & Krathwohl 2001)

The 2001 revision of [Bloom's Taxonomy](https://www.researchgate.net/publication/242400296_A_Revision_of_Bloom's_Taxonomy_An_Overview) replaces nouns with verbs and reorders the top two levels:

> remember → understand → apply → analyze → evaluate → create

Each level corresponds to a different cognitive operation, and importantly, the revision introduces an **orthogonal knowledge dimension** (factual / conceptual / procedural / metacognitive). The 2x2 framing — cognitive operation × knowledge type — is exactly the framing a comprehension grader needs: "did the agent **apply** **conceptual** knowledge?" is a different test from "did the agent **remember** **factual** knowledge?".

Implication for the Skill Graph: the existing `application` dimension (84 cases) is mostly testing the Apply level. The repo has no `Analyze` (decompose the skill's claim into primitives), `Evaluate` (judge a proposed answer against the skill's standards), or `Create` (compose new artifacts the skill governs) cases. The `definition` and `mental_model` dimensions are Understand-level. The `boundary` and `rule_conflict` dimensions are Analyze-level. The seven-level Bloom vocabulary maps cleanly onto a more discriminating rubric than the current loose enum.

Recent applied work — [BloomAPR (Tang et al., 2025)](https://arxiv.org/html/2509.25465v1) — uses Bloom's taxonomy explicitly to grade LLM capabilities at automatic program repair, with "higher-order questions primarily involving advanced cognitive processes such as applying, analyzing, evaluating, and creating, typically requiring multi-step reasoning, concept integration, or complex problem-solving". This confirms the framing transfers to LLM evaluation.

#### 4.1.2 Criterion-referenced vs norm-referenced assessment

The educational measurement literature distinguishes [criterion-referenced](https://www.edpsycinteractive.org/topics/measeval/crnmref.html) (you pass if you meet a fixed standard) from norm-referenced (you pass if you outperform the comparison group). The Skill Graph's existing evals are criterion-referenced: a case PASSes if the answer matches the truth source, not if it outperforms a baseline. This is the right design — comprehension is "did the agent learn the concept" not "did the agent score in the top quartile" — and the proposed rubric stays criterion-referenced.

The implication is that the rubric must encode **what counts as a pass on each dimension independently**, not "score 4/5 overall". Validity and reliability research ([Norm- vs Criterion-Referenced Ratings, Hagiwara 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10498947/)) finds that "criterion-referenced scaling demonstrated higher reliability than norm-referenced scaling" — i.e., binary pass/fail per criterion is more reliable than a Likert score across criteria.

#### 4.1.3 Near vs far transfer (Barnett & Ceci 2002)

[Barnett & Ceci's "When and where do we apply what we learn? A taxonomy for far transfer"](https://pubmed.ncbi.nlm.nih.gov/12081085/) provides a 9-dimensional taxonomy distinguishing near from far transfer along context (knowledge domain, physical context, temporal context, functional context, social context, modality) and content (learned skill, performance change, memory demands) axes. The empirical conclusion is that **far transfer is rare and difficult**: most measured transfer effects are near transfer. The implication for skill comprehension: a comprehension eval that only uses scenarios near to the body's worked examples is measuring near transfer — a much weaker claim of learning. A far-transfer eval forces the agent to apply the primitives to a context the body did not enumerate.

The proposed rubric uses this directly: each dimension lists "near-pass" and "far-pass" criteria, and the rubric distinguishes them so the grader can tell which kind of pass occurred.

#### 4.1.4 The Feynman technique

The [Feynman technique](https://fs.blog/feynman-technique/) — "if you can't explain it simply, you don't understand it" — is the practitioner-side counterpart to Bloom's Understand level. The four steps are: (1) write the concept, (2) explain it as if to a beginner, (3) identify gaps, (4) simplify. A [2023 study using the technique](https://ejournal.iainmadura.ac.id/index.php/panyonara/article/download/14936/4202/) found pre-test scores doubled (34→66). [A 2025 study on English language learners](https://arxiv.org/pdf/2506.09055) (the "Feynman Bot" paper) recorded a 28% average score increase by applying the technique. The technique operationalizes the **Protégé effect**: teaching forces comprehension.

The Feynman technique provides one rubric dimension directly: ask the agent to re-explain the concept to a domain outsider, without quoting the body. The output should preserve the skill's primitives and structural relationships, in different surface words. A correct re-explanation is evidence of comprehension; a paraphrase of the body is not.

### 4.2 ML/LLM evaluation infrastructure

#### 4.2.1 HELM (Stanford CRFM)

[HELM](https://crfm.stanford.edu/helm/) is a multi-axis evaluation framework. The seven metrics are **accuracy, calibration, robustness, fairness, bias, toxicity, efficiency**. The framing — "many metrics on many scenarios" — is the design point: a single accuracy number hides the trade-offs. From the [paper](https://arxiv.org/abs/2211.09110):

> "metrics beyond accuracy don't fall to the wayside, and that trade-offs are clearly exposed"

The HELM contribution to a comprehension rubric is **the discipline of multi-metric reporting**: a skill that PASSes accuracy on definition cases but FAILs on calibration (the agent is overconfident on cases it gets wrong) is still a partial pass and the rubric should reflect that. Specifically, the HELM **calibration** metric — "alignment between model confidence and actual performance" — applies directly: a model that hedges appropriately on a far-transfer case and gets it right is comprehending better than a model that asserts the same answer with high confidence.

#### 4.2.2 BIG-bench

[BIG-bench (Srivastava et al. 2022)](https://arxiv.org/abs/2206.04615) — 204 tasks across 132 institutions — defines good task design principles: tasks should be **diverse**, **expert-authored**, **focus on capabilities current models fail at**, and have **standardized evaluation metrics** with human baselines. The "breakthroughness" concept measures how a task's success curve changes with model scale — a useful idea: a comprehension dimension where every model scores 0% or 100% is not discriminating; the useful dimensions are the ones where current-generation models partially succeed.

The implication for the Skill Graph: comprehension eval cases should be calibrated to discriminate among current models. A case that today's Sonnet/Opus answers correctly without any skill loaded is not measuring the skill's contribution. The smallest viable check: spot-test each comprehension case against the model **without the skill in context** and confirm the answer changes when the skill is added.

#### 4.2.3 TruthfulQA — imitative falsehoods

[TruthfulQA (Lin, Hilton, Evans 2021)](https://arxiv.org/abs/2109.07958) is the canonical benchmark for measuring whether a model truthfully answers questions where the most-likely-on-training-distribution answer is wrong. The central finding:

> "The best model was truthful on 58% of questions while human performance was 94%, with the largest models generally being the least truthful."

The construct of **imitative falsehood** — "a false answer is an imitative falsehood if it has high likelihood on the model's training distribution" — translates directly to skill comprehension. A skill exists to **correct** something the underlying model would otherwise get wrong (a misconception, a category error, an overreach). The comprehension test of a skill's `misconception` field is: pose a prompt the base model handles wrongly (with the wrong answer being high-likelihood on the training distribution); load the skill; verify the answer changes to the right one.

This gives a precise definition of "the skill is teaching something the model doesn't already know": the base-model answer is wrong AND the skill-loaded answer is right. A skill that produces no answer change is either redundant (the model already knows) or ineffective (the skill is loaded but ignored).

#### 4.2.4 MMLU and its critiques

[MMLU (Hendrycks et al. 2020)](https://arxiv.org/abs/2009.03300) covers 57 subject areas in multiple-choice format. The design intent — quoted in [DataCamp's overview](https://www.datacamp.com/blog/what-is-mmlu) — was to "eliminate the efficacy of shallow statistical tricks", forcing models to "draw inferences, connect abstract ideas, and navigate complex conceptual relationships". The critique (e.g., [Chandak et al. 2025](https://intuitionlabs.ai/pdfs/mmlu-pro-explained-the-advanced-ai-benchmark-for-llms.pdf)) is that even on MMLU-Pro, models exploit multiple-choice shortcuts, and free-form answer matching is more robust.

The implication: comprehension cases should be **free-form**, not multiple choice. The current eval files are already mostly free-form (the prompt asks for a reasoned answer). The risk to avoid: introducing leading prompts that contain the answer phrasing. The Skill Graph's prompts mostly avoid this, but a quality check could add it.

#### 4.2.5 Contrast sets (Gardner et al. 2020)

[Gardner et al.'s "Evaluating Models' Local Decision Boundaries via Contrast Sets"](https://aclanthology.org/2020.findings-emnlp.117.pdf) introduces the contrast-set technique: take a test instance, perturb it minimally so the gold label flips, and re-evaluate. The empirical result across 10 datasets: model performance drops up to 25% on contrast sets vs. the original test set. The diagnostic: high test-set accuracy with low contrast-set accuracy indicates **the model learned a dataset shortcut, not the underlying concept**.

This is directly usable: for each comprehension case, author a **paired contrast case** where one detail flips the right answer (e.g., for a `type-safety` case "the function accepts `unknown` and narrows it" → pair it with "the function accepts `any` and casts it"). If the model gets both right, the primitives transferred; if it gets only the first right, it's pattern-matching. The contrast-set discipline can be added incrementally to the current eval files.

#### 4.2.6 LLM-as-a-judge bias

The [Zheng et al. 2023 paper "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena"](https://arxiv.org/abs/2306.05685) documents three judge biases that bear directly on comprehension grading:

| Bias | Effect | Mitigation |
|---|---|---|
| **Position bias** | "gpt-3.5 being biased 50% of the time and claude-v1 being biased 70% of the time toward the first position" in pairwise comparisons | Evaluate every pair in both orders and only count consistent verdicts |
| **Verbosity bias** | "claude-v1 and gpt-3.5 preferred the longer response more than 90% of the time" | Use direct scoring with a rubric rather than pairwise length-sensitive comparison |
| **Self-enhancement** | "claude-v1 favored itself with a 25% higher win rate" vs. human | Use a different model family as the judge than the one being evaluated |

Follow-up work — [Zhang et al. 2024 "Style Outweighs Substance"](https://arxiv.org/html/2409.15268v2) — shows LLM judges can prefer answers with confident style even when factually wrong. [Surveys on LLM-as-judge](https://arxiv.org/html/2411.15594v6) document 12 bias types.

The implication for the proposed comprehension rubric:

- **Direct scoring on a fixed rubric**, not pairwise comparison, mitigates verbosity bias.
- **Different model family as grader** than as agent, mitigates self-enhancement.
- **Chain-of-thought in the grader prompt** improves reliability ([Wang et al. 2023](https://arxiv.org/html/2410.15393v1)).
- **Binary pass/fail per rubric criterion**, not Likert, improves reliability ([Hagiwara 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10498947/) and Yan's writing — see §4.3.2).

The existing audit-prompt-builder ([`scripts/lib/audit-prompt-builder.js`](/Users/jacobbalslev/Development/skill-graph/scripts/lib/audit-prompt-builder.js)) already does most of this: it requires evidence quotes, constrains output to a `<verdict>` JSON block, and uses direct scoring on a 1–5 scale. The 1–5 scale should arguably move to binary-per-criterion + aggregate, but that's a separate decision.

### 4.3 Practitioner content (recent)

#### 4.3.1 Hamel Husain — "Your AI product needs evals"

[Husain's blog](https://hamel.dev/blog/posts/evals/) defines a three-tier evaluation hierarchy:

- **Level 1: Unit tests / assertions** — fast, deterministic, run on every change
- **Level 2: Human & model evaluation** — set cadence, more expensive
- **Level 3: A/B testing** — only for significant product changes

Importantly, Husain argues against treating evals as pure pass/fail unit tests: "unlike typical unit tests, you want to organize these assertions for use in places beyond unit tests, such as data cleaning and automatic retries." The same assertion can be a gate **and** a synthetic-data filter **and** a retry signal.

His [FAQ](https://hamel.dev/blog/posts/evals-faq/) takes a strong position on rubric design:

> "Binary evaluations force clearer thinking and more consistent labeling. Likert scales introduce significant challenges: the difference between adjacent points (like 3 vs 4) is subjective and inconsistent across annotators"

And on rubric construction:

> "Begin with a 'benevolent dictator' (single domain expert) reviewing 100+ traces. Use open coding to identify real failure patterns. Group observations into a failure taxonomy through 'axial coding'. Only build evaluators for failures that persist after fixing obvious prompt gaps."

This grounds-up approach is the opposite of authoring rubric criteria from theory. The implication: a Skill Graph comprehension rubric should be derived from **observed comprehension failures** in current eval runs, not (only) from Bloom levels. The proposed rubric in §5 is theory-anchored on the concept-block fields, but the criteria for each dimension should be calibrated against actual model failures on existing eval cases.

#### 4.3.2 Eugene Yan — task-specific evals

[Yan's task-specific evaluation patterns](https://eugeneyan.com/writing/evals/) reject several common approaches:

- N-gram metrics (ROUGE, METEOR): "Poor distribution separation"
- Embedding-similarity metrics (BERTScore, MoverScore): "the similarity distributions of positive and negative instances are too close"
- Generic LLM-as-judge (G-Eval): "unreliable (low recall), costly, and has poor sensitivity"

Yan advocates **binary classification framing** — "Factually consistent vs. inconsistent / Relevant vs. irrelevant / Toxic vs. non-toxic" — because it enables ROC-AUC and PR-AUC analysis, distribution-separation diagnostics, and active-learning prioritization.

His [LLM-evaluator analysis](https://eugeneyan.com/writing/llm-evaluators/) finds that LLM judges agree with humans on subjective tasks (85% on MT-Bench) but fail on objective ones (30–60% recall on hallucination detection). Implication: comprehension grading is closer to a **subjective task** (judging meaning preservation) than an **objective one** (string match), so LLM-judge has a reasonable chance, but the judge must be well-calibrated and the rubric must be discriminating.

#### 4.3.3 Anthropic agent-skills evaluation (2026)

In March 2026, Anthropic added evals to its `skill-creator` ([Anthropic engineering blog](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills); [Tessl coverage](https://tessl.io/blog/anthropic-brings-evals-to-skill-creator-heres-why-thats-a-big-deal/)). The system uses **four sub-agents working in parallel**:

| Sub-agent | Role |
|---|---|
| Executor | Runs skills against eval prompts |
| Grader | Evaluates outputs against defined expectations |
| Comparator | Blind A/B comparisons between skill versions |
| Analyzer | Surfaces patterns aggregate stats might hide |

Eval cases are JSON test cases with `eval_id`, `eval_name`, `prompt`, and `assertions`. Assertions are tagged as either **quality** (specific content checks, like "review should flag forEach with async callback") or **format** (structural checks, like "Review uses severity levels critical/warning/suggestion"). The system renders **pass-rate comparisons of skill-enabled vs. baseline** — which is exactly the BIG-bench breakthroughness idea (§4.2.2) applied to skills.

The Skill Graph eval files are structurally similar to Anthropic's shape (`evals` array, per-case `prompt`, per-case truth references). The gap is the **assertion tagging** (`quality` vs `format`) and the **baseline comparison**. The proposed rubric in §5 maps onto Anthropic's assertion vocabulary: each rubric dimension is either quality-style (does the agent's answer match the concept primitives) or format-style (does the agent invoke the Verification checklist).

#### 4.3.4 OpenAI agent-skills evals

[OpenAI's developer blog "Testing Agent Skills Systematically with Evals"](https://developers.openai.com/blog/eval-skills) recommends layering deterministic checks and rubric grading:

- **Deterministic checks**: "Did it run `npm install`? Did it create `package.json`?" — observable behavior
- **Rubric grading**: qualitative requirements like "component structure, styling conventions" with structured output schemas

OpenAI frames skill mastery in four success categories: **outcome goals** (task completion), **process goals** (correct tool invocation), **style goals** (adherence to conventions), **efficiency goals** (avoiding excessive commands or token use). The four-category framing maps cleanly onto the audit loop's seven dimensions; the contribution to comprehension specifically is the explicit "process goals" vocabulary — for `workflow` skills, comprehension means executing the right steps in the right order, not just producing the right end-state.

[OpenAI Evals (the open-source framework)](https://github.com/openai/evals) supports both **ground-truth evals** (deterministic comparison to known answers) and **model-graded evals** (a stronger model judges qualitative output). The system uses rubric-based scoring, with healthcare rubrics in the wild containing 48,562 unique criteria — i.e., rubrics can scale arbitrarily without losing reliability **as long as each criterion is binary**.

#### 4.3.5 agentskills.io specification

The community [Agent Skills specification](https://agentskills.io/specification) is the open standard the Skill Graph protocol is downstream of (the v4 frontmatter is a strict superset of the agentskills.io frontmatter). The spec defines two required frontmatter fields (`name`, `description`) and a body with no format restrictions. **It defines no evaluation surface.** Quality is checked only structurally via `skills-ref validate`. This means: there is no upstream comprehension contract for the Skill Graph to inherit; the Skill Graph is upstream of the eval discipline, not downstream.

### 4.4 Synthesis — what each source contributes to the rubric

| Source | Contributes |
|---|---|
| Bloom revised (2001) | 6-level cognitive hierarchy; orthogonal knowledge dimension; verbs for each level |
| Criterion-referenced assessment | Pass/fail per criterion; reliability advantage over Likert |
| Barnett & Ceci (2002) | Near-vs-far transfer distinction as a quality test |
| Feynman technique | Re-explanation as a comprehension probe |
| HELM | Multi-metric reporting discipline; calibration as a distinct metric |
| BIG-bench | Skill-vs-baseline comparison ("breakthroughness") |
| TruthfulQA | Imitative-falsehood inoculation as the misconception test |
| MMLU critiques | Free-form > multiple choice; shortcut detection |
| Contrast sets (Gardner 2020) | Paired-perturbation cases to detect pattern-match |
| LLM-as-judge bias (Zheng 2023, follow-ups) | Position / verbosity / self-enhancement mitigations |
| Hamel Husain | Binary criteria; failure-mode-driven rubric construction |
| Eugene Yan | Binary classification framing; LLM-judge fitness per task type |
| Anthropic skill-creator (2026) | 4 sub-agents; quality-vs-format assertions; baseline comparison |
| OpenAI agent-skills | 4 success categories (outcome/process/style/efficiency) |
| agentskills.io | No upstream contract — Skill Graph defines its own |

### 4.7 RLHF failure rates as the empirical case for forced-completeness graders

The comprehension grader proposed in §5 and §7.2 is itself an LLM — and the same training pressures that distort the agent-under-test distort the grader. The literature on LLM-as-judge bias (§4.2.6) names the *taxonomy* of failure (position, verbosity, self-enhancement, style-over-substance). The literature on RLHF-induced behavior names the *base rates*. Both matter: the taxonomy tells the rubric what to defend against; the base rates tell the maintainer how much defending is actually needed.

The Development workspace's [`skills/methodical/SKILL.md` § 5 — The Root Cause Model](/Users/jacobbalslev/Development/skills/methodical/SKILL.md) collates the most-cited measurements. The numbers below come from the cited primary sources, verified for this revision:

| Failure mode | Measured rate | Primary source | Verified |
|---|---|---|---|
| **Sycophancy** — model agrees with the user's framing even when wrong | 58.19% across frontier models (Gemini-1.5-Pro 62.47%, ChatGPT-4o 56.71%, Claude-Sonnet intermediate) | Fanous et al. (2025), *SycEval: Evaluating LLM Sycophancy*. [arXiv:2502.08177](https://arxiv.org/abs/2502.08177). Tested on AMPS (math) and MedQuad (medical). | Yes (WebSearch 2026-05-16) |
| **Summarization overgeneralization** — LLM summaries claim broader conclusions than the source supports | 26–73% per model across 4,900 summaries of 200 abstracts from *Nature, Science, Lancet, NEJM*; nearly 5× more frequent than human-written summaries (OR 4.85, 95% CI [3.06, 7.70]) | Peters & Chin-Yee (2025), *Generalization bias in large language model summarization of scientific research*. [Royal Society Open Science, vol. 12(4):241776](https://royalsocietypublishing.org/rsos/article/12/4/241776/235656/Generalization-bias-in-large-language-model). PMC mirror: [PMC12042776](https://pmc.ncbi.nlm.nih.gov/articles/PMC12042776/). | Yes (WebSearch 2026-05-16) |
| **Framing bias** — output changes the sentiment of the source context | 26.42% of cases across five LLM families on summarization + fact-checking | Aldigheri et al. (2025), *Quantifying Cognitive Bias Induction in LLM-Generated Content*. [arXiv:2507.03194](https://arxiv.org/abs/2507.03194); also [ACL Anthology 2025.ijcnlp-long.155](https://aclanthology.org/2025.ijcnlp-long.155/). | Yes (WebSearch 2026-05-16) |
| **Instruction skipping / attention dilution** — later or middle-of-context instructions receive less attention as prompt length grows | Performance degradation of 13.9–85% as input length grows, even with 100% retrieval of the target information; ~20% recall in the middle of long context vs. higher recall at start and end | As cited in [`skills/methodical/SKILL.md` § Key Sources](/Users/jacobbalslev/Development/skills/methodical/SKILL.md) (attributing Unite.AI 2025). The phenomenon is independently corroborated by the "lost in the middle" literature: Liu et al. (2023), *Lost in the Middle: How Language Models Use Long Contexts*. [arXiv:2307.03172](https://arxiv.org/abs/2307.03172). The specific Unite.AI article was not directly located in this revision; the underlying mechanism is well-established. | Mechanism verified; the specific Unite.AI 2025 attribution from `methodical` is reused as cited and qualified here. |
| **Multi-agent error amplification** — error rate of unstructured multi-agent chains relative to single-agent baseline | 17.2× in unstructured "bag of agents" networks; ~4.4× when central coordination acts as a circuit breaker | Towards Data Science (2025), *Why Your Multi-Agent System is Failing: Escaping the 17x Error Trap of the "Bag of Agents"*. [towardsdatascience.com](https://towardsdatascience.com/why-your-multi-agent-system-is-failing-escaping-the-17x-error-trap-of-the-bag-of-agents/). The underlying scaling principles are from Kim et al. cited in that article. | Yes (WebSearch 2026-05-16) |

**Why these numbers matter for the comprehension grader.** Each row is the failure mode the grader is most likely to exhibit *when grading* — not (only) the failure mode the agent-under-test exhibits.

- **Sycophancy in the grader** looks like: agreeing with the agent's answer because the answer is articulate and confident. The 58% base rate ([SycEval, 2025](https://arxiv.org/abs/2502.08177)) means roughly half of unconstrained verdicts will lean toward whatever framing the agent's response anchored. Mitigation: the rubric forces the grader to quote the agent's exact words before deciding (Appendix A § A.1 RULE), and to render a binary verdict per behavior, not an impressionistic 1–5.
- **Summarization overgeneralization in the grader** looks like: "the agent's answer broadly demonstrates understanding" instead of "the agent invoked the runtime-boundary primitive on line 3 of its answer." The 26–73% base rate ([Peters & Chin-Yee, 2025](https://royalsocietypublishing.org/rsos/article/12/4/241776/235656/Generalization-bias-in-large-language-model)) is the empirical case for the rubric's per-behavior decomposition: a summary verdict is not a verdict.
- **Framing bias in the grader** looks like: scoring an answer with positive framing as better than the same content with negative framing. The 26.42% base rate ([Aldigheri et al., 2025](https://arxiv.org/abs/2507.03194)) is the empirical case for output-schema constraint (the verdict JSON has no free-prose summary slot where positive framing could leak in unscored).
- **Instruction skipping in the grader** looks like: the grader's prompt enumerates 6 binary behaviors but the verdict only addresses 4 of them, with the missing two silently dropped. The attention-dilution mechanism (Liu et al. 2023, [arXiv:2307.03172](https://arxiv.org/abs/2307.03172); as discussed in [`methodical` § Key Sources](/Users/jacobbalslev/Development/skills/methodical/SKILL.md)) is the empirical case for the verdict-schema requiring an entry per `expected_behavior.id`, not a free array. A response missing an `id` is a parse error.
- **Multi-agent error amplification** matters because the comprehension surface is itself a chain: agent → grader → aggregator → audit-loop scorecard. The 17.2× amplification rate ([Towards Data Science, 2025](https://towardsdatascience.com/why-your-multi-agent-system-is-failing-escaping-the-17x-error-trap-of-the-bag-of-agents/)) is the empirical case for the grader being a single well-constrained step, not a chain — and for the audit-loop integration (R6, §7.6) to consume the grader's structured verdict, not its prose summary.

The implication is direct: the comprehension grader cannot be a prompt that says "judge whether the agent understood." That prompt would inherit every base rate above. The grader prompt must be a structurally constrained instrument that produces a verdict the failure modes above cannot easily corrupt — which is what the §5 rubric (binary per behavior + quoted evidence + verbatim-overlap check) and the Appendix A template (forced JSON output + per-behavior verdicts + RULE block) together implement.

**`methodical` as the explanatory layer.** The repo-internal [`skills/methodical/SKILL.md`](/Users/jacobbalslev/Development/skills/methodical/SKILL.md) frames these statistics as the *root cause model* for why behavioral rules like complete-reporting exist. Where this report's §5 rubric *measures* comprehension and §8 *defends* the measurement against bias, `methodical` provides the WHY: the grader (and the agent) are not careless — they are doing exactly what RLHF trained them to do, and structural countermeasures are the only reliable correction. Subsequent sections cite `methodical` rules directly where they constrain grader behavior.

---

## 5. Proposed comprehension-quality rubric

This section proposes 8 rubric dimensions, each a distinct measurement of whether the agent learned the subject. Six dimensions map directly to concept-block fields; two are cross-cutting on the body's `## Verification` and `## Do NOT Use When` sections, which every capability skill must have.

The rubric is **criterion-referenced**, **binary per criterion**, **free-form prompt**, and **direct-score** (no pairwise). It mirrors the existing audit-prompt-builder pattern of one `<verdict>` block per dimension but adds two new dimensions specific to comprehension (not currently in the seven audit dimensions). The intent is **additive**: adopt the rubric without breaking lint, manifest, drift, or routing surfaces.

### 5.1 Rubric overview

| # | Dimension | Concept field | Schema weight | Cross-cutting | Bloom level |
|---|---|---|---|---|---|
| C1 | Definitional precision | `concept.definition` | 1.0 | — | Understand |
| C2 | Mental-model fidelity | `concept.mental_model` | 1.5 | — | Apply / Analyze |
| C3 | Purpose articulation | `concept.purpose` | 1.0 | — | Understand / Evaluate |
| C4 | Boundary discrimination | `concept.boundary` | 1.5 | — | Analyze |
| C5 | Taxonomy navigation | `concept.taxonomy` | 1.0 | — | Analyze |
| C6 | Analogy reuse with limit | `concept.analogy` | 0.5 | — | Apply / Evaluate |
| C7 | Misconception inoculation | `concept.misconception` | — (complement) | — | Evaluate |
| C8 | Verification application | — | — | `## Verification` body section | Apply |
| C9 | Negative-boundary refusal | — | — | `## Do NOT Use When` body section | Evaluate |

(The numbering uses C-prefix to avoid colliding with the audit-loop's seven dimensions. A skill can be audited on the seven structural dimensions and on the eight or nine comprehension dimensions independently.)

Why 9 listed but the executive summary said 8: dimension C7 (misconception) and C4 (boundary) overlap conceptually. Authors should expect to write a single rubric criterion-set that covers both, weighted as the schema weights suggest. The 9-dimension table is the analytical view; the operational view collapses C4 and C7 into one author-side criterion set — see §5.10.

### 5.2 C1 — Definitional precision

**What it measures.** Does the agent produce a definition of the subject that matches the skill's `concept.definition` field on the **load-bearing elements** — primary category, what it does, who uses it — without verbatim copying, without dropping constraints, and without smuggling in unwarranted claims?

**Skill input.** The `concept.definition` field is the canonical answer the rubric is calibrated against.

**Probe template.** "Explain what [subject] is to a [domain-outsider role]. Do not use the body's exact words." Vary the domain-outsider role across cases (a junior engineer, a product manager, a security reviewer) so the case set exercises restatement.

**Pass criteria (criterion-referenced, binary per criterion).**

- [ ] The agent's definition names the same **primary category** as `concept.definition`.
- [ ] The agent's definition states what the concept **does** (its observable effect) in different surface words.
- [ ] The agent's definition does NOT contain a 6-word-or-longer verbatim span from the skill body's `## Coverage`, `## Philosophy`, or `concept.definition`. (Operationalization: tokenize, look for any 6-gram substring present in both. The 6-gram threshold is a calibrable hyperparameter; 6 is a starting point used in plagiarism-detection literature.)
- [ ] The agent's definition does NOT introduce constraints or claims not in `concept.definition` (no fabricated specificity).

A pass requires all four binary checks. A FAIL on the third criterion (verbatim span) is a hard fail — the case did not measure comprehension, only retrieval.

**Pass example (for `type-safety`).** Probe: "Explain type safety to a product manager." Pass answer: "It's the property of a codebase where the compiler catches a category of mistakes — like calling a function with the wrong shape of input — before users see them. The team pays a cost up-front in writing type annotations, and the benefit is that whole classes of runtime errors are ruled out at build time rather than caught in production." This names the primary category (compile-time error detection), the effect (rules out a class of errors), and the cost/benefit, without 6-gram overlap with the body.

**Fail example.** Probe: same. Fail answer: "Type safety is the property of a program in which type errors — operations applied to values of the wrong kind — are detected before they cause incorrect behavior." This is a verbatim copy of [`skills/type-safety/SKILL.md:64`](/Users/jacobbalslev/Development/skill-graph/skills/type-safety/SKILL.md) (the first sentence of `concept.definition`). The agent retrieved; it did not internalize.

**Grader procedure.**

1. Embed `concept.definition`, the full skill body, and the agent's answer in the grader prompt.
2. Ask the grader to list, in JSON, each of the four binary criteria with a verdict and a quoted evidence span from the agent's answer.
3. Aggregate: pass iff all four are true.

Bias mitigation: grader is a different model family than the agent under test; no Likert scale; output forced into a `<verdict>` JSON block per the existing audit-prompt-builder pattern.

### 5.3 C2 — Mental-model fidelity

**What it measures.** Given a scenario that the skill body does NOT enumerate, does the agent reason about it using the primitives named in `concept.mental_model`?

This is the **far-transfer** test — the central comprehension test, weighted 1.5 in the schema, and the dimension where current eval coverage is weakest.

**Skill input.** The `concept.mental_model` field — which by convention names primitives and their relationships. For `type-safety`, the primitives are: type, soundness, structural-vs-nominal, narrowing, runtime boundary. For `acid-fundamentals`: atomicity, consistency, isolation, durability, the contract.

**Probe template.** "A team is [novel scenario the body does not enumerate]. Walk through how the concept's primitives apply to this case." The novel scenario must be in the same conceptual domain but with surface details the body does not cover.

**Pass criteria.**

- [ ] The agent names **at least two of the skill's listed primitives** in the analysis.
- [ ] The agent applies the primitives **to the new case's specifics** (not just restating what each primitive means).
- [ ] The agent's analysis arrives at a conclusion that is **consistent with the skill's mental model** — i.e., if a competing skill expert with this skill loaded would reach a different conclusion, the case should be re-authored.
- [ ] The agent does NOT need the body to contain the scenario for the answer to be correct (operationalization: scenario uses surface details the grader can verify don't appear in the body via `grep`).

**Pass example (for `type-safety`).** Probe: "A team is migrating a Python codebase that uses `dict[str, Any]` to represent API responses to a TypeScript codebase. They want to know whether to use `Record<string, unknown>` or `Record<string, any>`. Apply the type-safety primitives." Pass answer: cites the **runtime boundary** primitive (API responses cross the boundary; their types are unverified until parsed), distinguishes `any` (escape hatch — anything is allowed) from `unknown` (forces narrowing), connects to the **narrowing** primitive (an `unknown` value must be narrowed before access), concludes that `Record<string, unknown>` plus a validator at the boundary preserves type safety while `Record<string, any>` silently disables it. This applies multiple primitives to a case the body does not enumerate (the body discusses `JSON.parse` but not Python→TypeScript migration).

**Fail example.** Probe: same. Fail answer: "Use `Record<string, unknown>` because the type-safety skill says to prefer `unknown` over `any` always." This restates a single rule without engaging the primitives. The runtime-boundary reasoning is missing; the narrowing primitive is unused. The answer is correct in conclusion but vacuous in reasoning; it would not transfer to a case where the rule doesn't directly apply.

**Grader procedure.**

1. Pre-flight: the grader (or eval author) confirms the scenario's surface details do not appear in the body. (Lint check that this constraint holds is described in §7.)
2. Embed `concept.mental_model`, the body, the agent's answer.
3. Ask the grader to verify each binary criterion with a quoted evidence span.
4. The grader explicitly identifies which primitives the agent invoked.

This is the hardest dimension to author cases for and the most diagnostic. Recommend prioritizing 3+ cases per skill.

### 5.4 C3 — Purpose articulation

**What it measures.** Can the agent state what problem the concept solves AND what the alternative was that it replaces? Per the schema description: "Concrete pain point + prior alternative."

**Skill input.** The `concept.purpose` field.

**Probe template.** "Why does [subject] exist? What did practitioners do before [subject] existed, and what was broken about that?"

**Pass criteria.**

- [ ] The agent names the **concrete pain point** that motivated the concept's existence.
- [ ] The agent names the **prior alternative** (what people did before) — either by name or by description.
- [ ] The agent explains the **mechanism by which the concept improves on the alternative**, not just that it does.
- [ ] The agent does not introduce purposes not in `concept.purpose` (no fabricated rationale).

**Pass example (for `type-safety`).** Probe: "Why does type safety as a discipline exist? What did teams do before it, and what was broken?" Pass answer: cites the pain point — runtime bugs that would compound into production incidents and silent data corruption; the prior alternative — dynamic languages without typing, using tests and documentation to communicate contracts; the mechanism — types make contracts checkable at compile time and at call sites, scaling worse with team size and code size for the alternative.

**Fail example.** Probe: same. Fail answer: "Type safety prevents bugs." True but vacuous; the pain point, alternative, and mechanism are all missing.

**Grader procedure.** Same shape as C1/C2 — embed the field, body, and agent answer; verify each criterion with quoted evidence.

### 5.5 C4 — Boundary discrimination

**What it measures.** Given a prompt that **looks like** the skill's domain but actually belongs to a different concept (named in the `concept.boundary` field), does the agent recognize the difference and route correctly?

This dimension is distinct from the routing eval. The routing eval tests the router's decision at activation time. This dimension tests the loaded model's behavior: given the skill is already loaded, does the model recognize when a sub-prompt has crossed into adjacent territory?

**Skill input.** The `concept.boundary` field plus the `## Do NOT Use When` body section. (The two are related but distinct — `concept.boundary` is universal concept-discrimination; `## Do NOT Use When` is skill-routing handoff. The dimension uses both as the rubric anchor.)

**Probe template.** "[Scenario that contains a feature looking like the skill's domain but is actually owned by an adjacent skill]. Apply [this skill] to it." The agent should refuse to overreach and name the correct owner.

**Pass criteria.**

- [ ] The agent identifies that the scenario is NOT in this skill's domain.
- [ ] The agent names the **correct sibling skill** (one of the `concept.boundary` entries or `## Do NOT Use When` rows).
- [ ] The agent explains the **mechanism of the difference** — different primitives, different scope, different layer — not just "use the other skill".
- [ ] The agent does not partially-comply by providing a half-answer in this skill's voice before handing off.

**Pass example (for `type-safety`).** Probe: "We're designing the JSON shape of a new API endpoint for order webhooks. Apply type-safety to decide the field structure." Pass answer: identifies that **API surface design** is owned by `api-design`, not `type-safety`; explains the mechanism — `api-design` owns the external surface contract (what fields, what format, what versioning), `type-safety` owns the internal type discipline that consumes the API's output; hands off to `api-design`.

**Fail example.** Probe: same. Fail answer: "Use `Record<string, string>` and validate with Zod" — applies type-safety's rules to an API-design problem. The boundary was crossed and not noticed.

**Grader procedure.** The grader checks for the four binary criteria; one of the criteria (correct sibling skill named) requires the grader to know the skill's `boundary` entries — embed them in the prompt.

### 5.6 C5 — Taxonomy navigation

**What it measures.** Can the agent correctly classify a novel instance into the right `taxonomy` category? Per the schema description, taxonomy categories are subset / alternative / prerequisite / composition / specialization.

**Skill input.** The `concept.taxonomy` field.

**Probe template.** "Where does [novel instance not enumerated in the taxonomy] sit in [subject]'s taxonomy? What kind of relationship does it have to [a category that is enumerated]?"

**Pass criteria.**

- [ ] The agent places the novel instance in the **right category** (or correctly identifies that it doesn't fit any).
- [ ] The agent uses the skill's **taxonomy vocabulary** (subset/alternative/prerequisite/composition/specialization).
- [ ] The agent's placement is **consistent with the taxonomy entries that ARE in the field** — i.e., the new placement does not contradict the relationships among existing entries.
- [ ] If the novel instance does not fit, the agent says so explicitly rather than forcing a misclassification.

**Pass example (for `type-safety`).** Probe: "Where does Hindley-Milner type inference sit in type-safety's taxonomy?" Pass answer: identifies HM as a **technique** rather than a system, notes that the taxonomy's listed systems (sound, unsound/gradual, structural, nominal, dependent, refinement) are about the **strength and shape** of the type system, and HM is an **algorithm** for inferring types within (typically) a Hindley-Milner-style sound polymorphic system — closest taxonomy slot is "a technique used by sound systems with parametric polymorphism" or correctly notes "doesn't fit the existing categories cleanly; would fit if we added an inference-algorithm axis".

**Fail example.** Probe: same. Fail answer: "HM is a sound type system." This conflates the system with the algorithm; HM is an inference algorithm that works in certain sound systems but isn't itself the system.

**Grader procedure.** The grader verifies the agent's classification is consistent with the existing taxonomy entries; this requires the grader to read `concept.taxonomy` and check relationship consistency. The grader's verdict cites which existing entry the new placement should be near to.

### 5.7 C6 — Analogy reuse with limit

**What it measures.** Two distinct things, evaluated as a single rubric:
(a) Can the agent **apply the analogy** from `concept.analogy` to a new case in the same domain?
(b) Can the agent **identify where the analogy breaks** when stretched to a case it wasn't designed for?

This dimension's weight is 0.5 in the schema — the lowest among the seven. That weight reflects that analogy is a teaching aid, not a load-bearing primitive; the dimension is still worth measuring because abuse of analogy is a common comprehension failure.

**Skill input.** The `concept.analogy` field.

**Probe template.** Two-part cases:
- Part A: "Apply the [subject]'s analogy to [case in the same domain that the analogy was designed to cover]. What does the analogy predict?"
- Part B: "Where does the analogy break? Give one case where the analogy would mislead someone."

**Pass criteria.**

- [ ] The agent extends the analogy to Part A's case in a way that preserves the **structural relationships** named in the analogy.
- [ ] The agent identifies in Part B a **concrete case** where the analogy fails, AND explains the mechanism (which structural relationship is preserved in the analogy but missing in the new case).
- [ ] The agent does NOT over-apply the analogy in Part A (a sign it's pattern-matching the analogy phrasing without understanding its scope).
- [ ] The agent does NOT under-claim in Part B (a sign of refusal-to-engage rather than discrimination).

**Pass example (for `type-safety`).** The analogy from `skills/type-safety/SKILL.md:105` is: "A type system is to runtime errors what a building's structural engineering is to physical collapse." Part A: "Apply this to a `npm audit` security scan." Pass answer: identifies that `npm audit` is **not** a structural-engineering check — it's a periodic inspection for **threat-class** violations the engineer didn't design for (vulnerabilities discovered after the build). The structural-engineering analogy maps to type checking (build-time guarantees against the threat class the design accounts for); `npm audit` is more like a fire-marshal inspection, a different threat class.

Part B: "Where does the structural-engineering analogy break?" Pass answer: structural engineering is approved by a stamp once; type-checking runs on every change. The analogy obscures the iterative nature of type discipline. Also: structural engineering's escape hatches (engineer overrides) are heavily regulated; TypeScript's `any` / `as` have no equivalent gating discipline by default.

**Fail example.** Part A fail: "Type safety prevents bugs, just like structural engineering prevents collapse." Restating the analogy in flat form — no structural mapping. Part B fail: "The analogy doesn't break." (Refusal to engage.)

**Grader procedure.** Two-part case; both parts must pass. The grader needs the analogy field embedded and ideally a list of "known good extensions" + "known stretching points" authored alongside the case.

### 5.8 C7 — Misconception inoculation

**What it measures.** When a prompt contains the misconception phrasing as if it were correct, does the agent correct it unprompted, citing the skill's reasoning?

This is the [TruthfulQA-shape test (Lin et al. 2021)](https://arxiv.org/abs/2109.07958): pose a prompt where the imitative-falsehood answer is the high-probability response, and verify the skill loads correct it.

**Skill input.** The `concept.misconception` field plus the body's correction.

**Probe template.** "I've heard that [misconception phrased plausibly]. Walk me through whether this is correct." The probe should NOT signal that the framing is the misconception — that defeats the test.

**Pass criteria.**

- [ ] The agent flags the misconception **without being prompted to**.
- [ ] The agent corrects to the right understanding using the skill's primitives.
- [ ] The agent explains the **mechanism by which the misconception misleads** — not just "that's wrong, the answer is X".
- [ ] The agent does NOT validate the misconception even partially in its response.

**Pass example (for `type-safety`).** Probe: "I've been told that TypeScript catches runtime errors before they happen. Is that right? We're trying to decide whether we need runtime validation in addition." Pass answer: flags that **TypeScript does not catch runtime errors** in general — it catches type errors at compile time, but it's **unsound** and makes no claims about values that cross the runtime boundary (`JSON.parse`, env vars, network). Explains that the misconception treats compile-time type guarantees as runtime guarantees; corrects by naming the runtime-boundary primitive; confirms that runtime validation is still required at every I/O boundary.

**Fail example.** Probe: same. Fail answer: "Yes, TypeScript catches type errors at compile time, but you also need runtime validation for untrusted input." Partial — the misconception's "catches runtime errors" framing was not corrected; the language "catches type errors at compile time" lets the user keep believing the original framing was approximately right.

**Grader procedure.** The grader needs the `concept.misconception` text embedded so it can identify whether the agent invoked the correction. The hardest case-authoring discipline: the probe must be a natural framing, not a leading question.

### 5.9 C8 — Verification application

**What it measures.** Given a fresh artifact (a piece of code, a doc, a design), does the agent **run the skill's `## Verification` checklist on it unprompted** as part of producing a recommendation?

**Skill input.** The `## Verification` section in the body. (Cross-cutting: not a concept-block field, but every capability/workflow skill is required to have it.)

**Probe template.** "Here is a piece of [artifact relevant to the skill's domain]. What's your assessment?" The probe does NOT say "run the Verification checklist" — the test is whether the agent invokes it spontaneously.

**Pass criteria.**

- [ ] The agent's response includes **at least 3 of the 5+ Verification checklist items** as observable checks against the artifact.
- [ ] The agent's response distinguishes **passing checks** from **failing checks** for the specific artifact.
- [ ] The agent does NOT provide a verdict on the artifact without anchoring it to the Verification criteria.
- [ ] The agent's checks reference **concrete features of the artifact** (line numbers, function names, observable behaviors) — not abstract restatements of the criteria.

**Pass example (for `type-safety`).** Probe: "Review this TypeScript snippet [paste a 30-line module using `any`, `as`, no `noUncheckedIndexedAccess`, and unparsed `JSON.parse`]." Pass answer: walks through the [type-safety Verification checklist (skills/type-safety/SKILL.md:255-262)](/Users/jacobbalslev/Development/skill-graph/skills/type-safety/SKILL.md) — strict mode? not visible from the snippet, ask. `noUncheckedIndexedAccess`? array access on line N doesn't show the safety; needs verification at tsconfig. Any `any` without comment? line M has `any: any` without justification, fail. Any `as Type` cast without comment? line K has `as User` on a `JSON.parse` result, fail. Every I/O boundary parses with a validator? line K is the failure point. Etc.

**Fail example.** Probe: same. Fail answer: "This code looks fine but uses `any` in a couple places — consider tightening that up." General verdict, no anchoring to the Verification items, no concrete line references.

**Grader procedure.** The grader needs the body's Verification checklist and the artifact embedded. The criterion-3 check ("does NOT provide a verdict without anchoring") is the strongest discriminator and the easiest to grade.

### 5.10 C9 — Negative-boundary refusal

**What it measures.** When the user asks the agent to do something in this skill's `## Do NOT Use When` list, does the agent refuse and route to the named owner?

**Skill input.** The `## Do NOT Use When` body section. This is a cross-cutting test that complements C4 (boundary discrimination) but uses the body section rather than `concept.boundary` because the body section is the routing-handoff contract, whereas `concept.boundary` is the universal concept-discrimination.

**Probe template.** "[Prompt that asks the agent to do something explicitly in the Do-NOT list of this skill, framed as if it were the agent's responsibility.]"

**Pass criteria.**

- [ ] The agent refuses to take the task in this skill's voice.
- [ ] The agent names the **correct owner** from the Do-NOT table.
- [ ] The agent does NOT provide a partial answer in this skill's voice before refusing (the "softened failure" anti-pattern).
- [ ] The agent does NOT over-refuse — if the task is genuinely in-scope but with adjacent elements, the response routes the in-scope work to this skill and the adjacent elements to the owner skill.

**Pass example (for `type-safety`).** Probe: "Help me design the database schema for storing user-uploaded files. I want to use type-safety to decide the column types." Pass answer: refuses to design the DB schema in type-safety's voice; routes to `data-modeling` as the schema-design owner; explains the mechanism — `data-modeling` owns persistence shape and entity model, type-safety owns in-memory type contracts that consume that shape.

**Fail example.** Probe: same. Fail answer: "Use `VARCHAR(255)` for the file path and `BYTEA` for the content. Type-safety would say…" — answers the DB schema question in type-safety's voice; the routing handoff didn't fire.

**Grader procedure.** Embed the Do NOT Use When section; verify the agent named the correct owner skill.

### 5.11 Aggregation policy

The 9 dimensions produce 9 binary verdicts per skill. The aggregation question is how to combine them into an overall comprehension verdict for the skill.

Three options, ordered by simplicity:

| Aggregation | Rule | Pros | Cons |
|---|---|---|---|
| **Strict** | All 9 dimensions PASS → SKILL PASSES; else PARTIAL or FAIL | Highest reliability; clearest signal | Hard to achieve; may discourage shipping |
| **Weighted** | Per-dimension weight from the schema; weighted sum ≥ threshold → PASS | Honors schema weights; calibrable | Weighted thresholds are arbitrary; reintroduces Likert-shaped scoring |
| **Pass-count** | At least N of 9 PASS → PASS; the maintainer picks N (e.g., 6/9) | Simple; reproducible | Treats all dimensions as equal weight |

Recommendation: start with **strict-with-named-exceptions** — all 9 dimensions PASS to claim SKILL PASSES, but the aggregate verdict carries a **per-dimension report** so a 7/9 skill can ship with two known-deficient dimensions documented. This is the aggregate pattern the existing audit-loop already uses ([`scripts/lib/audit-prompt-builder.js` lines 717–754](/Users/jacobbalslev/Development/skill-graph/scripts/lib/audit-prompt-builder.js)).

### 5.12 Rubric summary table

| Dim | Question | Measured against | Pass requires |
|---|---|---|---|
| C1 | Can the agent restate the concept in fresh words? | `concept.definition` | Primary category + effect + no 6-gram + no fabrication |
| C2 | Can the agent reason about a fresh case using the named primitives? | `concept.mental_model` | ≥2 primitives invoked + applied to specifics + consistent conclusion |
| C3 | Can the agent state the problem the concept solves and what it replaced? | `concept.purpose` | Pain point + prior alternative + improvement mechanism |
| C4 | Can the agent recognize when a prompt is in an adjacent concept's domain? | `concept.boundary` + `## Do NOT Use When` | Identifies the cross + names correct sibling + explains mechanism |
| C5 | Can the agent place a novel instance in the right taxonomy slot? | `concept.taxonomy` | Right category + skill vocab + consistent + admits non-fit |
| C6 | Can the agent reuse the analogy AND identify its limit? | `concept.analogy` | Apply preserves structure + Limit identifies real break |
| C7 | Does the agent correct a misconception unprompted? | `concept.misconception` | Flag without prompt + correct using primitives + explain mechanism |
| C8 | Does the agent run the Verification checklist on a fresh artifact? | `## Verification` body | ≥3 items + pass/fail differentiation + anchored to artifact |
| C9 | Does the agent refuse Do-NOT-Use scenarios? | `## Do NOT Use When` body | Refuses + names owner + no partial-comply |

### 5.13 Scoring discipline — the rubric as an application of `methodical`

The rubric in §5.1–§5.12 specifies *what* is measured and *what constitutes a pass* per dimension. It does not by itself specify the discipline the grader must follow *while applying* the rubric. That discipline is the subject of [`skills/methodical/SKILL.md`](/Users/jacobbalslev/Development/skills/methodical/SKILL.md), and three of its rules map directly onto the rubric's operational behavior:

| `methodical` rule | What it forces the grader to do | Concrete rubric application |
|---|---|---|
| **RULE-1: Complete Before Summarize** ([§ 1, lines 89–95](/Users/jacobbalslev/Development/skills/methodical/SKILL.md)) | Never construct a dimension-level summary before completing the per-behavior enumeration. Count input behaviors first; produce one verdict per behavior; only then aggregate. The count of output behavior-verdicts MUST match the count of input `expected_behaviors[]`. | A case with 5 `expected_behaviors[]` produces exactly 5 `behavior_verdicts[]` entries — never 3 ("the important ones") and never an aggregated 1 ("overall pass"). The verdict-schema in Appendix A enforces this structurally; RULE-1 is the *reason* the schema is shaped that way. |
| **RULE-2: Evidence Receipt Per Step** ([§ 1, lines 97–103](/Users/jacobbalslev/Development/skills/methodical/SKILL.md)) | Each behavior verdict produces an evidence receipt — a quoted span from the agent's answer — not an unsupported judgment. "I believe the agent understood the runtime-boundary primitive" is not an evidence receipt. "The agent's answer states 'API payloads cross the runtime boundary' on line 3 of their response" is. | The Appendix A § A.1 grader-prompt RULE block requires an `evidence_quote` field per behavior verdict. RULE-2 is the rule that makes this requirement non-negotiable. |
| **RULE-9: State the Completeness Claim Explicitly** ([§ 1, lines 150–155](/Users/jacobbalslev/Development/skills/methodical/SKILL.md)) | The grader's output must state what it examined and what it could not evaluate, with reasons. A dimension verdict that silently skips behaviors it found ambiguous is a failed grader, not a partial-pass case. | The verdict JSON's `dimension_verdict` is `PASS` only when every `behavior_verdict.verdict` is `PASS`. If the grader could not decide a behavior, that behavior's `verdict` is `FAIL` (with `rationale` naming the indecision), not omitted. The completeness claim is implicit in the schema: the verdict object enumerates every `expected_behavior.id`. |

The remaining `methodical` rules (RULE-3 through RULE-8, RULE-10) apply at the *prompt-construction* layer (R9 in §7.10) and at the *risk* layer (§8.9). The three above are the scoring-discipline rules — they govern what happens *while* the grader is producing its verdict, not before or after.

**Why this matters.** Without RULE-1, the grader will inevitably condense — "the agent broadly understood the concept" rolls up four binary verdicts into one impressionistic summary, and the maintainer loses per-behavior signal. Without RULE-2, the grader's verdicts cannot be re-checked by a human auditor and the comprehension surface becomes self-reporting without recourse. Without RULE-9, partial coverage masquerades as full coverage, and skills that fail one critical behavior ship as "passing" because the failed behavior was silently elided. The schema in Appendix A § A.1 is the *structural* enforcement of these rules; `methodical` is the *behavioral* rationale.

A grader prompt that does not surface these rules to the grader explicitly — see §7.10 (R9) — relies on the grader's training to behave methodically. Per §4.7, that training rewards the opposite behavior. The rules must be in the prompt.

---

## 6. Worked example — `type-safety`

This section applies the rubric to [`skills/type-safety/SKILL.md`](/Users/jacobbalslev/Development/skill-graph/skills/type-safety/SKILL.md). The output is a JSON eval file shaped like the existing 31 files plus the proposed comprehension extensions. Each case names a rubric dimension and provides truth sources for the grader.

`type-safety` is chosen because (a) its `concept` block is exemplary in depth, (b) it has `eval_artifacts: planned` and `eval_state: unverified` so the worked example would directly seed the eval, and (c) its primitives (type, soundness, structural/nominal, narrowing, runtime boundary) lend themselves to clean discrimination cases.

### 6.1 Eval file shape — current and proposed

**Current shape** (observed across all 31 files):

```json
{
  "skill_name": "string",
  "subject": "string",
  "adjacent_concepts": ["array of skill names"],
  "grounding_note": "optional string",
  "evals": [
    {
      "id": 1,
      "prompt": "string",
      "dimension": "definition | mental_model | purpose | boundary | application | rule_conflict | anti_pattern",
      "substance": "domain | contradiction-check",
      "calibration": "semantic | process",
      "truth_mode": "code_verification | conceptual_correctness_plus_repo_application | process_correctness",
      "skill_type": "concept | workflow",
      "criticality": "normal | high | critical",
      "truth_sources": ["array of path / path:start-end / path#anchor strings"],
      "expected_reasoning": "optional string"
    }
  ]
}
```

**Proposed additive extensions** (the worked example uses these; existing files remain valid because the keys are optional):

```json
{
  "evals": [
    {
      "...all existing fields...",
      "comprehension_dimension": "C1 | C2 | C3 | C4 | C5 | C6 | C7 | C8 | C9",
      "concept_field": "definition | mental_model | purpose | boundary | taxonomy | analogy | misconception",
      "transfer": "near | far",
      "expected_behaviors": [
        { "id": "must_not_quote_body_verbatim", "kind": "negative", "description": "no 6-gram substring overlap with skill body" },
        { "id": "invokes_runtime_boundary_primitive", "kind": "positive", "description": "answer names runtime boundary as a primitive" }
      ]
    }
  ]
}
```

Three new keys: `comprehension_dimension`, `concept_field`, `transfer`. One new array: `expected_behaviors` (each with `id`, `kind: positive | negative`, `description`). All keys are optional from the schema's perspective.

### 6.2 The 10 worked-example scenarios

The 10 cases below cover all 9 rubric dimensions plus one extra case in C2 (mental-model fidelity) since it's the highest-weight dimension and benefits from multiple cases. The JSON validates against the current eval shape (every required field is present) and adds the proposed extensions.

```json
{
  "skill_name": "type-safety",
  "subject": "Type-safety as a discipline: what static type systems guarantee, the difference between sound and unsound systems, structural vs nominal typing, type narrowing, the runtime boundary problem, the discipline of validating at I/O boundaries and trusting types inside, and the connection from compile-time guarantees to runtime correctness",
  "adjacent_concepts": ["api-design", "testing-strategy", "data-modeling", "code-review"],
  "grounding_note": "Truth sources cite line ranges in skills/type-safety/SKILL.md (frontmatter concept block at lines 63-116, body Verification at 254-262, Do NOT Use When at 264-272). Cases are authored against the v4 SKILL.md as of 2026-05-16. Comprehension-dimension extensions (comprehension_dimension, concept_field, transfer, expected_behaviors) are additive — graders that don't consume them treat them as no-ops.",
  "evals": [
    {
      "id": 1,
      "prompt": "Explain what type safety is, to a product manager who has never written code. Do not use the phrases from the type-safety skill body verbatim.",
      "dimension": "definition",
      "comprehension_dimension": "C1",
      "concept_field": "definition",
      "transfer": "near",
      "substance": "domain",
      "calibration": "semantic",
      "truth_mode": "conceptual_correctness_plus_repo_application",
      "skill_type": "concept",
      "criticality": "high",
      "truth_sources": [
        "skills/type-safety/SKILL.md:64",
        "skills/type-safety/SKILL.md#type-safety"
      ],
      "expected_behaviors": [
        { "id": "names_primary_category", "kind": "positive", "description": "Names compile-time error detection as the category" },
        { "id": "states_observable_effect", "kind": "positive", "description": "States that types rule out a class of runtime errors" },
        { "id": "no_verbatim_span", "kind": "negative", "description": "No 6-gram span shared with skills/type-safety/SKILL.md concept.definition or body" },
        { "id": "no_fabricated_specificity", "kind": "negative", "description": "Does not invent claims about specific languages, line counts, or guarantees not in concept.definition" }
      ],
      "expected_reasoning": "A correct answer names the category (compile-time error detection), the effect (rules out a class of runtime errors), the cost (annotation burden up-front), and the benefit (compounding safety). It does NOT verbatim-copy the concept.definition's first sentence, which is the canonical body phrasing."
    },
    {
      "id": 2,
      "prompt": "A team is migrating a Python service that uses dict[str, Any] for inbound API payloads to a TypeScript rewrite. They're debating between Record<string, unknown> and Record<string, any>. Apply type-safety's mental model primitives to this case. The skill body discusses JSON.parse but does not enumerate this specific Python-to-TypeScript migration scenario.",
      "dimension": "mental_model",
      "comprehension_dimension": "C2",
      "concept_field": "mental_model",
      "transfer": "far",
      "substance": "domain",
      "calibration": "semantic",
      "truth_mode": "conceptual_correctness_plus_repo_application",
      "skill_type": "concept",
      "criticality": "critical",
      "truth_sources": [
        "skills/type-safety/SKILL.md:65-78",
        "skills/type-safety/SKILL.md:208-239",
        "skills/type-safety/SKILL.md#the-runtime-boundary"
      ],
      "expected_behaviors": [
        { "id": "invokes_runtime_boundary_primitive", "kind": "positive", "description": "Identifies API payloads as crossing the runtime boundary, where type information stops" },
        { "id": "invokes_narrowing_or_validation_primitive", "kind": "positive", "description": "Invokes either the narrowing primitive (unknown forces narrowing) or the validation primitive (parse at boundary)" },
        { "id": "distinguishes_any_from_unknown", "kind": "positive", "description": "Names that any opts out of type-checking, unknown forces narrowing" },
        { "id": "conclusion_consistent_with_skill", "kind": "positive", "description": "Concludes Record<string, unknown> + validator at the boundary preserves type-safety; Record<string, any> silently disables it" },
        { "id": "scenario_not_in_body", "kind": "negative", "description": "Body does not mention Python-to-TypeScript migration; the answer is far transfer, not retrieval" }
      ],
      "expected_reasoning": "API payloads are an I/O boundary; their types are unverified bytes until parsed. unknown forces narrowing (the type-safe answer to 'I don't know what this is yet'); any disables checking entirely. The right answer is Record<string, unknown> at the type level plus a schema validator (Zod, io-ts) at the boundary to produce typed values. Record<string, any> would compile but silently destroy the discipline."
    },
    {
      "id": 3,
      "prompt": "Why does the discipline of type-safety exist as a thing teams choose to invest in? What did practitioners do before it was widely adopted, and what was specifically broken about that approach?",
      "dimension": "purpose",
      "comprehension_dimension": "C3",
      "concept_field": "purpose",
      "transfer": "near",
      "substance": "domain",
      "calibration": "semantic",
      "truth_mode": "conceptual_correctness_plus_repo_application",
      "skill_type": "concept",
      "criticality": "high",
      "truth_sources": [
        "skills/type-safety/SKILL.md:79-84"
      ],
      "expected_behaviors": [
        { "id": "names_pain_point", "kind": "positive", "description": "Names the pain point — runtime bugs becoming production incidents or silent data corruption" },
        { "id": "names_prior_alternative", "kind": "positive", "description": "Names the prior alternative — dynamic languages relying on tests, docs, and reader vigilance to communicate contracts" },
        { "id": "names_improvement_mechanism", "kind": "positive", "description": "States that types make contracts checkable at compile time and visible at call sites; scales with team size and code size" },
        { "id": "no_fabricated_purpose", "kind": "negative", "description": "Does not add purposes not in the skill — e.g., does not claim types are about performance" }
      ]
    },
    {
      "id": 4,
      "prompt": "We're designing the JSON shape of a new outbound webhook event for the orders service. Apply type-safety to decide the field structure and naming.",
      "dimension": "boundary",
      "comprehension_dimension": "C4",
      "concept_field": "boundary",
      "transfer": "near",
      "substance": "contradiction-check",
      "calibration": "semantic",
      "truth_mode": "code_verification",
      "skill_type": "concept",
      "criticality": "high",
      "truth_sources": [
        "skills/type-safety/SKILL.md:85-94",
        "skills/type-safety/SKILL.md:264-272",
        "skills/type-safety/SKILL.md#do-not-use-when"
      ],
      "expected_behaviors": [
        { "id": "identifies_cross_into_api_design", "kind": "positive", "description": "Recognizes that JSON-shape design of an API surface is api-design, not type-safety" },
        { "id": "names_api_design_as_owner", "kind": "positive", "description": "Names api-design as the correct owner skill" },
        { "id": "explains_mechanism_of_difference", "kind": "positive", "description": "States api-design owns the external surface contract; type-safety owns the discipline of expressing internal program correctness as types" },
        { "id": "no_partial_comply_in_type_safety_voice", "kind": "negative", "description": "Does not provide JSON shape recommendations in type-safety's voice before handing off" }
      ]
    },
    {
      "id": 5,
      "prompt": "Where does Haskell's Generalized Algebraic Data Types (GADTs) feature sit in type-safety's taxonomy? It allows types to depend on values like dependent types but is more constrained. Place it using the skill's taxonomy vocabulary, or explain why it doesn't fit.",
      "dimension": "mental_model",
      "comprehension_dimension": "C5",
      "concept_field": "taxonomy",
      "transfer": "far",
      "substance": "domain",
      "calibration": "semantic",
      "truth_mode": "conceptual_correctness_plus_repo_application",
      "skill_type": "concept",
      "criticality": "normal",
      "truth_sources": [
        "skills/type-safety/SKILL.md:95-103"
      ],
      "expected_behaviors": [
        { "id": "uses_taxonomy_vocab", "kind": "positive", "description": "Uses one or more of the schema's taxonomy relationship types: subset, alternative, prerequisite, composition, specialization" },
        { "id": "places_between_dependent_and_refinement", "kind": "positive", "description": "Places GADTs near dependent and refinement types, recognizing the partial dependency" },
        { "id": "preserves_existing_relationships", "kind": "positive", "description": "Placement does not contradict the relationships among existing taxonomy entries (sound vs unsound, structural vs nominal)" },
        { "id": "admits_imperfect_fit_or_extends", "kind": "positive", "description": "Either admits the fit is imperfect and proposes how to extend, or fits with a clear relationship-type justification" }
      ],
      "expected_reasoning": "GADTs sit between Haskell's vanilla parametric polymorphism and full dependent types — types can be refined by pattern-matching on constructors, but not by arbitrary value expressions. In the skill's taxonomy, the closest fit is 'specialization of sound type systems toward refinement types' or 'composition of pattern-matching with parametric polymorphism'. A correct answer either places GADTs in one of those slots or names the gap in the taxonomy."
    },
    {
      "id": 6,
      "prompt": "Part A: The type-safety skill compares a type system to a building's structural engineering. Use that analogy to explain how `npm audit` differs from type-checking — does the analogy place npm audit as a type-check, as a different kind of check, or outside the scope of the analogy?\n\nPart B: Where does the structural-engineering analogy break down? Give one concrete case where applying the analogy would mislead someone.",
      "dimension": "mental_model",
      "comprehension_dimension": "C6",
      "concept_field": "analogy",
      "transfer": "far",
      "substance": "domain",
      "calibration": "semantic",
      "truth_mode": "conceptual_correctness_plus_repo_application",
      "skill_type": "concept",
      "criticality": "normal",
      "truth_sources": [
        "skills/type-safety/SKILL.md:104-107"
      ],
      "expected_behaviors": [
        { "id": "part_a_distinguishes_npm_audit", "kind": "positive", "description": "Part A: Identifies npm audit as a different class of check (fire-marshal inspection vs structural design) — checking for vulnerabilities found AFTER the build, not for the threat class the design accounted for" },
        { "id": "part_b_names_real_break", "kind": "positive", "description": "Part B: Names a concrete way the analogy misleads — e.g., structural engineering is stamped once vs type-check runs every change; or escape hatches are gated in engineering but not in TypeScript by default" },
        { "id": "preserves_structural_relationships", "kind": "positive", "description": "Part A's mapping preserves the analogy's load-bearing relationship (build-time design verification vs runtime threat tolerance)" },
        { "id": "no_under_claim_on_break", "kind": "negative", "description": "Part B does not refuse to identify a break ('the analogy holds') — the analogy DOES break in identifiable ways and a refusal indicates non-engagement" }
      ]
    },
    {
      "id": 7,
      "prompt": "Our backend team has been told that since we use TypeScript with strict mode enabled, the JSON parsed from our customer API responses is automatically validated at compile time. We've been planning the next quarter's work and someone proposed dropping our Zod schemas to reduce maintenance overhead. Walk me through whether that's a sensible plan.",
      "dimension": "anti_pattern",
      "comprehension_dimension": "C7",
      "concept_field": "misconception",
      "transfer": "near",
      "substance": "contradiction-check",
      "calibration": "semantic",
      "truth_mode": "conceptual_correctness_plus_repo_application",
      "skill_type": "concept",
      "criticality": "critical",
      "truth_sources": [
        "skills/type-safety/SKILL.md:108-115",
        "skills/type-safety/SKILL.md:208-239",
        "skills/type-safety/SKILL.md#the-runtime-boundary"
      ],
      "expected_behaviors": [
        { "id": "flags_misconception_unprompted", "kind": "positive", "description": "Recognizes 'JSON parsed... automatically validated at compile time' as the misconception without being told it's wrong" },
        { "id": "corrects_via_runtime_boundary", "kind": "positive", "description": "Corrects using the runtime boundary primitive — TypeScript types are claims about values; values from network/disk are not types until parsed" },
        { "id": "rejects_dropping_zod", "kind": "positive", "description": "Recommends keeping Zod (or equivalent) for I/O boundary validation; dropping it would silently disable runtime safety" },
        { "id": "explains_mechanism_of_mislead", "kind": "positive", "description": "States that the misconception conflates 'static type assertion' with 'runtime verification' — JSON.parse(input) as User is a claim, not a check" },
        { "id": "no_partial_validation_of_misconception", "kind": "negative", "description": "Does not validate the misconception even partially (e.g., 'mostly true, but...')" }
      ],
      "expected_reasoning": "The misconception is that TypeScript catches runtime errors. It does not. TypeScript is unsound by design, and even without escape hatches, it makes no guarantees about values crossing the runtime boundary. JSON.parse(input) as User produces a value of static type User and actual type whatever the bytes contained — the static type is a claim, not a verification. Dropping Zod removes the only mechanism that actually validates at runtime; the agent should reject the proposal and explain the mechanism."
    },
    {
      "id": 8,
      "prompt": "Review this TypeScript snippet for type-safety. Snippet (payments.ts): `export async function fetchPaymentMethod(userId: string) { const response = await fetch('/api/users/' + userId + '/payment'); const data: any = await response.json(); return data as PaymentMethod; } function getUserBalance(user: User): number { const cents = user.balance; return cents / 100; } function summarize(records: PaymentRecord[]): string { return records.map(r => r.amount.toFixed(2)).join(', '); }`. What's your assessment?",
      "dimension": "application",
      "comprehension_dimension": "C8",
      "concept_field": null,
      "transfer": "near",
      "substance": "domain",
      "calibration": "semantic",
      "truth_mode": "conceptual_correctness_plus_repo_application",
      "skill_type": "concept",
      "criticality": "high",
      "truth_sources": [
        "skills/type-safety/SKILL.md:254-262",
        "skills/type-safety/SKILL.md#verification"
      ],
      "expected_behaviors": [
        { "id": "invokes_verification_checklist_unprompted", "kind": "positive", "description": "Walks through ≥3 items from the type-safety Verification checklist without being told to" },
        { "id": "flags_any_without_comment", "kind": "positive", "description": "Flags `any: any` on the data variable without justification" },
        { "id": "flags_as_cast_without_comment", "kind": "positive", "description": "Flags `as PaymentMethod` cast on the unvalidated response.json() result" },
        { "id": "flags_missing_runtime_validation", "kind": "positive", "description": "Flags the fetch boundary as missing runtime validation (Zod/io-ts/valibot)" },
        { "id": "anchors_to_line_numbers", "kind": "positive", "description": "References specific lines or function names from the snippet, not abstract restatements" },
        { "id": "no_verdict_without_anchor", "kind": "negative", "description": "Does not provide an overall verdict without anchoring each judgment to a Verification criterion" }
      ],
      "expected_reasoning": "The Verification checklist requires (paraphrased): strict mode on, noUncheckedIndexedAccess on, no `any` without justification comment, no `as Type` without justification comment, every I/O boundary parses with a validator, discriminated unions have exhaustiveness, public APIs have explicit return types. This snippet fails the `any` rule (data: any), the as cast rule (as PaymentMethod), the I/O validation rule (fetch result is cast not parsed), the explicit return type rule on the async function (inferred only). It passes 'no @ts-ignore'. The agent should walk through these items by name and anchor each to the snippet."
    },
    {
      "id": 9,
      "prompt": "Help me design a Postgres schema for storing user-uploaded file metadata. I want to use type-safety to decide which columns should be NOT NULL, which should be enums, and how to express the relationships between the tables.",
      "dimension": "boundary",
      "comprehension_dimension": "C9",
      "concept_field": null,
      "transfer": "near",
      "substance": "contradiction-check",
      "calibration": "semantic",
      "truth_mode": "code_verification",
      "skill_type": "concept",
      "criticality": "high",
      "truth_sources": [
        "skills/type-safety/SKILL.md:264-272",
        "skills/type-safety/SKILL.md#do-not-use-when"
      ],
      "expected_behaviors": [
        { "id": "refuses_schema_design_in_type_safety_voice", "kind": "positive", "description": "Does not produce a column list with NOT NULL or enum suggestions in type-safety's voice" },
        { "id": "names_data_modeling_as_owner", "kind": "positive", "description": "Names data-modeling as the correct owner skill" },
        { "id": "explains_mechanism", "kind": "positive", "description": "States that data-modeling owns persistence shape; type-safety owns in-memory type contracts that consume that shape" },
        { "id": "no_partial_comply", "kind": "negative", "description": "Does not provide partial schema recommendations before refusing" },
        { "id": "no_overrefuse", "kind": "negative", "description": "If the user asks a follow-up about the TypeScript types that consume the schema once data-modeling has produced it, the agent re-engages — does not blanket-refuse all related work" }
      ]
    },
    {
      "id": 10,
      "prompt": "A team has heard that 'type assertions in TypeScript are like runtime casts in C++ — they check the type at runtime and fail if it's wrong.' Walk me through whether this comparison is accurate.",
      "dimension": "anti_pattern",
      "comprehension_dimension": "C7",
      "concept_field": "misconception",
      "transfer": "far",
      "substance": "contradiction-check",
      "calibration": "semantic",
      "truth_mode": "conceptual_correctness_plus_repo_application",
      "skill_type": "concept",
      "criticality": "high",
      "truth_sources": [
        "skills/type-safety/SKILL.md:108-115",
        "skills/type-safety/SKILL.md#any-vs-unknown-vs-never"
      ],
      "expected_behaviors": [
        { "id": "flags_misconception_about_as", "kind": "positive", "description": "Recognizes that TypeScript `as` is NOT a runtime check; C++ dynamic_cast is. The comparison is wrong." },
        { "id": "states_as_compiles_to_nothing", "kind": "positive", "description": "States that `as` compiles to nothing — it is a directive to the type checker only, no runtime code is emitted" },
        { "id": "distinguishes_static_directive_from_runtime_check", "kind": "positive", "description": "Distinguishes a static directive ('trust me, this is the type') from a runtime check (`instanceof`, validator parse)" },
        { "id": "no_partial_validation", "kind": "negative", "description": "Does not say 'yes, with some caveats' — the comparison is structurally wrong, not just imprecise" }
      ],
      "expected_reasoning": "TypeScript `as` is a static directive, not a runtime check. It compiles to nothing. C++ `dynamic_cast` IS a runtime check (returns nullptr or throws). C-style casts in C++ are closer to TypeScript `as`. A correct answer rejects the comparison: TypeScript `as` is a silent claim a misused `as` makes; the C++ comparison should be to a C-style cast, not dynamic_cast. The body's misconception field explicitly names this trap."
    }
  ]
}
```

### 6.3 Coverage report

The 10 cases cover all 9 rubric dimensions:

| Dim | Case IDs | Count |
|---|---|---|
| C1 — Definitional precision | 1 | 1 |
| C2 — Mental-model fidelity | 2 | 1 |
| C3 — Purpose articulation | 3 | 1 |
| C4 — Boundary discrimination | 4 | 1 |
| C5 — Taxonomy navigation | 5 | 1 |
| C6 — Analogy reuse with limit | 6 | 1 |
| C7 — Misconception inoculation | 7, 10 | 2 |
| C8 — Verification application | 8 | 1 |
| C9 — Negative-boundary refusal | 9 | 1 |

Transfer mix: 6 near-transfer (C1, C3, C4, C7-#1, C8, C9), 4 far-transfer (C2, C5, C6, C7-#2). The schema's heaviest-weighted dimensions (mental_model 1.5, boundary 1.5) both have far-transfer coverage. Misconception has two cases — one near (the Zod question, a domain-internal misconception) and one far (the C++ comparison, a cross-language misconception), exercising the misconception primitive across surface variations.

The minimum threshold (`AGENTS.MD § Evaluation Discipline`: "≥7 realistic scenarios per skill") is exceeded; this file would also satisfy the existing audit-loop's Eval dimension if the grader is updated to accept the comprehension-extension keys.

### 6.4 What this worked example does NOT cover

The 10 cases focus on the concept block plus the cross-cutting Verification and Do-NOT sections. They do not test the body's specific tables (the soundness comparison table, the narrowing technique table, the runtime-boundary table). Those tables encode operational nuance — e.g., the differences between `typeof`, `instanceof`, `in`, discriminated union narrowing — that a separate eval surface could probe. Whether to fold those into the comprehension rubric (as a 10th "operational-fluency" dimension) or keep them in the existing `application`-tagged cases is an open question for §9.

The cases also do not exercise the comparison table at lines 134–143 (system-by-system soundness). A skill-specific operational-knowledge test would benefit `type-safety` because that table is the load-bearing distinguishing data. But adding it to the comprehension rubric risks coupling the rubric to one skill's body shape; the proposed rubric stays universal.

---

## 7. Implementation recommendations

Ordered by leverage. Each item names files that exist today, scripts that would be added, and the smallest viable change.

### 7.1 R1 (smallest viable change) — Author one comprehension eval file

**Effort.** ~2 hours, single skill.

**Change.** Three steps, all in the same commit:

1. Add `examples/evals/type-safety.json` using the worked example in §6.2.
2. Flip `skills/type-safety/SKILL.md` frontmatter: `eval_artifacts: planned` → `present`.
3. Add a `## Evals` body section to `skills/type-safety/SKILL.md` (between the last conceptual section and `## Verification`) that links to `examples/evals/type-safety.json`. This is required by the lint when `eval_artifacts: present` — the linter emits `missing required section "## Evals" (conditional: eval_artifacts is "present")` otherwise. Model the section on the canonical example at [`skills/documentation/SKILL.md:201`](/Users/jacobbalslev/Development/skill-graph/skills/documentation/SKILL.md).

Then run `node scripts/skill-lint.js skills/type-safety` to confirm all three changes pass the existing `checkEvalCoherence` and conditional-section checks. The pre-existing `[T3↔T5] examples/skills.manifest.sample.json` generator-parity drift is unrelated to R1 — regenerate the sample independently with `node scripts/generate-manifest.js --include-template --timestamp <ISO> --output examples/skills.manifest.sample.json`.

**Why this is leverage-1.** No script changes. No schema changes. No grader changes. It proves the eval-file shape works and gives a concrete worked-example specimen. Future eval authors copy from `type-safety.json`. The new keys (`comprehension_dimension`, `concept_field`, `transfer`, `expected_behaviors`) are optional and ignored by the existing audit-prompt-builder.

**Risk.** None — it's additive. If the maintainer later rejects the rubric, the file is one delete away from removal.

### 7.2 R2 — Add a grader prompt template for comprehension

**Effort.** ~1 day. ~150 lines of Node, no dependencies beyond what `scripts/lib/audit-prompt-builder.js` already uses.

**Change.** Create `scripts/lib/comprehension-prompt-builder.js` modeled on `scripts/lib/audit-prompt-builder.js`. The new module exports `COMPREHENSION_DIMENSIONS` (an array of 9 dimension records corresponding to C1–C9), a `buildComprehensionPrompt` function that composes a per-case prompt embedding (a) the skill body, (b) the `concept.<field>` content for the case's `concept_field`, (c) the case's `prompt`, (d) the `expected_behaviors` rubric, and (e) the existing IDENTITY/STEPS/RULES/OUTPUT structure with a `<verdict>` JSON block per behavior.

Reuse `parseDimensionResponse` and `aggregateVerdict` from the existing builder; both already handle a `<verdict>` JSON output with `findings[]` and per-finding `severity/surface/problem/evidence/required_action`.

**Why this is leverage-2.** The prompt-builder is the only piece the audit loop is missing. The existing `scripts/skill-audit.js --graded` would consume it directly. The audit loop's seven dimensions are unchanged; the comprehension grader is a parallel additional run.

**Risk.** Low. The prompt-builder pattern is already proven by the audit-prompt-builder; this is a parameterized variant.

### 7.3 R3 — Implement `scripts/skill/evaluate-skill.js --comprehension`

**Effort.** ~2 days.

**Change.** Create the script the schema documents but the repo doesn't have. Path: `scripts/skill/evaluate-skill.js` (matching the schema's literal string at [`schemas/skill.v4.schema.json:211`](/Users/jacobbalslev/Development/skill-graph/schemas/skill.v4.schema.json)).

The script's CLI shape:

```bash
node scripts/skill/evaluate-skill.js --skill type-safety --comprehension
node scripts/skill/evaluate-skill.js --skill type-safety --comprehension --grader-cli "codex exec"
node scripts/skill/evaluate-skill.js --all --comprehension --json
```

Behavior:
1. Read the skill's `concept` block.
2. Read the matching `examples/evals/<skill>.json` if `eval_artifacts: present`.
3. For each case with `comprehension_dimension` set, call the grader CLI with the comprehension prompt template (R2).
4. Aggregate per-dimension pass-counts.
5. Emit a comprehension scorecard with one row per dimension and an overall verdict.
6. Optionally write the receipt to `eval_last_run` in the skill frontmatter (the schema already supports `receipt` and `receipt_hash`).

**Why this is leverage-3.** It closes the gap between schema intent and implementation. The script the schema names will exist. The comprehension dimension becomes runnable.

**Risk.** Medium — the grader-CLI dependency is the same as `scripts/skill-audit.js --graded` already has, so the infrastructure pattern is proven. The script must not regress existing behavior; the `--comprehension` flag opts in.

### 7.4 R4 — Add a lint check for far-transfer scenarios

**Effort.** ~3 hours.

**Change.** Add a new lint check `checkComprehensionScenarioGrounding` to `scripts/lint/check-eval-quality.js` (or a new file). For each eval case where `transfer: far` is set, verify that the surface-keywords of the `prompt` do not appear in the skill body — i.e., the case's scenario was not lifted from the body.

Operationalization: tokenize the prompt, drop stopwords, drop tokens of length ≤ 3, look for any 4-gram or longer overlap with the body. If found, emit a warning that the scenario is near-transfer despite the `transfer: far` tag.

**Why this is leverage-4.** It prevents the far-transfer label from being applied to cases that are actually near transfer — a form of the same `eval_state: verified` honesty rule the protocol already enforces elsewhere.

**Risk.** Low — false positives are easy to suppress with an inline comment, and the warning is non-blocking.

### 7.5 R5 — Add a baseline-comparison harness

**Effort.** ~3 days.

**Change.** Mirror Anthropic's skill-creator pattern (§4.3.3): run the eval cases twice — once with the skill loaded, once without — and compute a per-dimension delta. This implements the BIG-bench "breakthroughness" idea (§4.2.2) for skills.

CLI shape:

```bash
node scripts/skill/evaluate-skill.js --skill type-safety --comprehension --baseline
```

Output: per-dimension table showing baseline pass-count, skill-loaded pass-count, and delta. A skill whose comprehension cases produce no answer change when loaded vs. not loaded is either redundant (the model already knows) or ineffective (the skill is loaded but ignored).

**Why this is leverage-5.** It quantifies skill value. A skill with 0% delta on its own comprehension eval is a measurable problem. A skill with +60% on `C2` (mental-model fidelity) is teaching something the model wouldn't have done unaided.

**Risk.** Medium — running the grader twice per case doubles cost, so this is only worth running on demand (releases, large refactors), not on every commit.

### 7.6 R6 — Extend the audit-loop scorecard with a comprehension row

**Effort.** ~half day.

**Change.** Add an 8th dimension to the audit-loop's seven scorecard rows: `Comprehension quality`. Its `appliesWhen` predicate returns true iff `comprehension_state: present`. The dimension reads the comprehension scorecard (R3 output) and reports the same per-dimension verdicts.

Update [`SKILL_AUDIT_CHECKLIST.md`](https://github.com/jacob-balslev/skill-audit-loop/blob/main/SKILL_AUDIT_CHECKLIST.md) to add the new row to the artifact contract.

**Why this is leverage-6.** It surfaces the comprehension grade in the existing audit artifact flow. Audits become 8-dimensional when the skill claims comprehension; they remain 7-dimensional when it doesn't.

**Risk.** Low — additive, gated on `comprehension_state`.

### 7.7 R7 — Backfill comprehension evals to the existing `concept`-declaring skills

**Effort.** ~1 day per skill.

**Change.** Apply the worked-example pattern (§6) to all skills with `comprehension_state: present`. Today that's `type-safety` and `acid-fundamentals`. The `documentation` skill has a comprehension-shaped eval (`examples/evals/comprehension.json`) but lacks the `concept` block — either declare comprehension_state and add the block, or rename the eval file and don't.

**Why this is leverage-7.** The first set of comprehension-graded skills becomes the calibration corpus. Future skill authors point at these as worked examples.

**Risk.** Low.

### 7.8 R8 — Open documentation: protocol section on comprehension

**Effort.** ~half day.

**Change.** Add a new section to `docs/skill-metadata-protocol.md` and `docs/field-reference.md § concept` explaining the rubric. Cross-reference from `AGENTS.MD § Evaluation Discipline` so the protocol-level discipline is discoverable. Add the new optional eval-file keys (`comprehension_dimension`, `concept_field`, `transfer`, `expected_behaviors`) to `docs/field-reference.md` with the same field-level treatment as existing keys.

**Why this is leverage-8.** Without documentation, the rubric is folklore. With documentation in the canonical reference doc, authors discover it during their normal skill-authoring flow.

**Risk.** None.

### 7.10 R9 — Grader prompt incorporates `methodical` forcing functions

**Effort.** ~half day, prompt-only change to the R2 builder.

**Change.** Add a `# METHODICAL FORCING FUNCTIONS` section to the comprehension-prompt-builder's output (the section is rendered into every grader prompt the builder produces). The section enumerates four rules from [`skills/methodical/SKILL.md`](/Users/jacobbalslev/Development/skills/methodical/SKILL.md) in the grader's own voice — i.e., the grader is the agent applying these rules to its own scoring output. Each rule has a one-line description of what it forces the grader to do.

The four rules and what each forces:

| Rule | Source | What it forces the grader to do |
|---|---|---|
| **RULE-1: Complete Before Summarize** | [`methodical` § 1, lines 89–95](/Users/jacobbalslev/Development/skills/methodical/SKILL.md) | Produce one verdict per `expected_behavior.id` BEFORE producing the `dimension_verdict`. Never aggregate before enumerating. The count of `behavior_verdicts[]` must equal the count of `expected_behaviors[]`. |
| **RULE-3: Separate Generation from Criticism** | [`methodical` § 1, lines 105–114](/Users/jacobbalslev/Development/skills/methodical/SKILL.md) | After producing the verdict, perform a self-critique pass: "What behavior did I score as PASS where the evidence-quote does not actually support the criterion? Where did I soften a clear FAIL into hedged language?" Revise any verdict where the self-critique surfaces a problem. |
| **RULE-6: Negative Findings Are Primary Data** | [`methodical` § 1, lines 130–136](/Users/jacobbalslev/Development/skills/methodical/SKILL.md) | A failed behavior is more diagnostic than a passed behavior. Do NOT soften failures with hedge words ("could be improved", "worth reviewing"). State `FAIL` directly and quote the gap. Use of hedge words on a behavior with `verdict: FAIL` is itself a grader malfunction. |
| **RULE-9: State the Completeness Claim Explicitly** | [`methodical` § 1, lines 150–155](/Users/jacobbalslev/Development/skills/methodical/SKILL.md) | The verdict object enumerates every `expected_behavior.id` from the input. A behavior the grader could not decide is `verdict: FAIL` with `rationale: "could not evaluate because <reason>"`, not omitted. The grader states which dimensions it could not evaluate and why, never silently. |

These rules are forcing functions, not aspirations. RULE-1 prevents the §4.7 summarization-bias failure mode in the grader (the 26–73% base rate). RULE-3 implements the Generator/Critic separation that [Towards Data Science (2025)](https://towardsdatascience.com/why-your-multi-agent-system-is-failing-escaping-the-17x-error-trap-of-the-bag-of-agents/) documents as the dominant remediation for the 17.2× error amplification rate. RULE-6 prevents the §4.7 framing-bias failure mode (the 26.42% base rate) where the grader softens negative verdicts to match the agent's positive framing. RULE-9 prevents the §4.7 instruction-skipping failure mode where the grader silently omits behaviors the prompt enumerated.

The four rules are intentionally a subset of `methodical`'s 10. RULE-2 (evidence receipts) is already structurally required by the verdict schema's `evidence_quote` field (Appendix A § A.1) — naming it again in the FORCING FUNCTIONS section is redundant; RULE-4 (prioritization is reordering not filtering) does not apply at the grader layer; RULE-5 (Observe Before Act) is captured by the grader's STEP 1 (read the body first); RULE-7 (Verification is not trust) applies at the audit-loop integration layer (R6, §7.6) where the audit consumes the grader's verdict; RULE-8 (challenge scope framing) does not apply because the grader's scope is exactly the case's `expected_behaviors[]`; RULE-10 (deliberate pace on high-stakes steps) is implicit in the single-shot per-case grader invocation. The four selected are the minimum set that defends against the four failure modes with measured base rates in §4.7.

**Why this is leverage-9 (placed between R7 and R8 in priority).** Without the FORCING FUNCTIONS block in the grader prompt, R2 / R3 produce a grader that inherits the §4.7 base rates. The functional rubric still works probabilistically — a grader scoring 1,000 cases will be approximately right on average — but per-case verdicts are not individually defensible. Adding the FORCING FUNCTIONS block costs ~30 lines of prompt and reduces per-verdict variance.

**Risk.** Low — prompt-only change, opt-in via the comprehension grader, no schema impact. The risk is the inverse: a maintainer who skips R9 ships a grader that produces statistically defensible but per-verdict unreliable scores, and over-claims the surface's discriminating power.

**Verification.** Run R9 against the worked example (§6). The 10 cases collectively have ~45 `expected_behaviors[]`. The grader's output must produce 45 `behavior_verdicts[]`. A grader output with <45 verdicts is a RULE-1 / RULE-9 violation, detectable by a simple count assertion in the calling script — i.e., R9's compliance is itself mechanically checkable, not LLM-graded.

### 7.9 Recommended adoption order

```
R1 (one eval file)          ─► R2 (prompt builder)        ─► R3 (evaluate-skill script)
                                       │                          │
                                       └───► R9 (methodical FF) ──┘
                                                                          │
R8 (documentation) ◄──── R6 (audit scorecard) ◄──── R7 (backfill) ◄──────┘
                                                                          │
                                R4 (lint check) ────► R5 (baseline harness)
```

R1 first — it costs the least and validates the eval-file shape. R2 and R3 are the core implementation. **R9 attaches to R2's prompt builder and ships in the same change** — without it, R3's grader inherits the §4.7 base rates. R4 is a cheap honesty check. R5 is the value-quantification piece, added once the basics work. R6 connects to the existing audit flow. R7 calibrates against the gold-standard skills. R8 makes the surface discoverable.

The maintainer can stop at any step: R1 alone delivers a worked specimen; R1+R2+R9+R3 delivers a runnable, per-verdict-defensible grader; the full set delivers a calibrated comprehension surface.

---

## 8. Risks and anti-patterns

### 8.1 LLM-judge bias propagation

The position / verbosity / self-enhancement biases documented by [Zheng et al. 2023](https://arxiv.org/abs/2306.05685) and refined in [later surveys](https://arxiv.org/html/2411.15594v6) apply to the proposed grader. Mitigations baked into the rubric:

- **Direct scoring, not pairwise.** The rubric scores each behavior in `expected_behaviors[]` as binary; no pairwise comparisons.
- **Cross-family grader.** Use a different model family as grader than agent — if Sonnet is the agent, grader is GPT-5.x or Gemini, and vice versa. Self-enhancement bias drops sharply when grader and agent are different families.
- **Chain-of-thought required.** The grader prompt template forces the grader to cite an evidence span before each behavior verdict. This improves reliability per [CalibraEval (2024)](https://arxiv.org/html/2410.15393v1).
- **Output schema constrained.** The grader returns a `<verdict>` JSON block per the existing audit-prompt-builder pattern. Off-schema responses are parse errors, not silent passes.

A specific risk: **the grader's own training data may contain the skill body** if the skill is public. The Skill Graph's skills are public and may eventually appear in training corpora. Long-term mitigation: maintain a private fork of the eval files with perturbed surface details, used for true validation rather than self-reporting. This is the [Gardner contrast-set discipline (2020)](https://aclanthology.org/2020.findings-emnlp.117.pdf) at the eval-file level.

### 8.2 Near-vs-far transfer confusion

The rubric requires per-case `transfer: near | far` tagging. The risk is that authors will default to `near` (easier to author) and the `far` cases will be under-represented. The lint check R4 (§7.4) is the partial mitigation. A second mitigation: require at least one `transfer: far` case per concept-block dimension (C1, C2, C3, C4, C5, C6, C7) on any skill declaring `comprehension_state: present`.

The current dimension distribution (§2.2) is overwhelming evidence that without an explicit prompt-side incentive, authors will fill the easiest dimensions. The lint check makes the incentive visible.

### 8.3 Scoring drift

The rubric is criterion-referenced (binary per behavior). Over time, the grader model improves and standards may drift — a behavior that previously failed a strict grader might pass a more lenient one. Three mitigations:

- **Pin the grader model in `eval_last_run`.** The schema already supports `model` in `eval_last_run` ([`schemas/skill.v4.schema.json:213-232`](/Users/jacobbalslev/Development/skill-graph/schemas/skill.v4.schema.json)). Authors record which grader produced the verdict.
- **Re-run on grader bumps.** When the grader CLI's underlying model changes (e.g., Sonnet 4.6 → 4.7), trigger a re-run on the comprehension surface and surface the delta.
- **Calibration cases.** Maintain a small set of cases with known-correct gold answers (authored by the maintainer) to detect grader drift. If the grader scores a gold case differently across model versions, the grader, not the skill, drifted.

### 8.4 Evaluator contamination from concept-block citation

The grader prompt embeds the `concept.<field>` content. This makes the grader's job easier (it has the canonical answer) but also lets the grader pattern-match: "did the agent's answer say what concept.X says?" If yes, pass; if no, fail. This is a verbatim-copy reward — exactly the failure mode C1 explicitly forbids in the agent's answer.

Mitigation: the `expected_behaviors[]` array must include explicit anti-quote criteria (`no_verbatim_span`, `no_fabricated_specificity`) and the grader must verify them. Case 1 in the worked example demonstrates the pattern.

A second-order risk: the grader could collude with the agent by accepting paraphrastic but vacuous answers ("type safety is about types being safe"). Mitigation: at least one positive behavior must demand a **specific primitive** be invoked, not just a general restatement. The worked example's `invokes_runtime_boundary_primitive` is an instance.

### 8.5 The "Goodhart's Law" failure mode

If the rubric becomes the target, skill authors will optimize for it directly — writing concept blocks that game the rubric rather than transferring concepts. Symptoms: every concept block starts using identical hedging language; misconception fields target only misconceptions the rubric tests; analogies are written to maximize the C6 "limit" criterion rather than to teach.

The mitigations are doctrinal, not technical:

- The rubric is **criterion-referenced, not norm-referenced**. There is no top quartile to game into.
- The `transfer: far` cases force agent-side reasoning the body doesn't encode, which can't be gamed by skill-side polish.
- The baseline comparison (R5) catches skills that score well on comprehension but produce no agent-behavior delta — a skill being optimized for the rubric is detectable by its zero delta.

### 8.6 Quality-of-grader-prompt risk

The proposed `scripts/lib/comprehension-prompt-builder.js` (R2) carries the same risk as any prompt template: a vague or under-constrained prompt produces unreliable verdicts. The existing audit-prompt-builder is well-constrained (forces JSON output, requires evidence citations, scopes evidence sources to embedded context). The comprehension builder should mirror this exactly — same `# IDENTITY / # STEPS / # RULES / # INPUT / # OUTPUT` structure, same `<verdict>…</verdict>` JSON discipline, same per-behavior evidence-quote requirement.

A specific risk: the comprehension rubric is more **semantic** than the audit's content rubric, so the grader is more likely to hallucinate a verdict if the prompt is loose. Two mitigations: (a) include the case's `expected_reasoning` field in the grader prompt so the grader has a baseline to compare against; (b) require the grader to quote the agent's exact words for each behavior verdict, not paraphrase.

### 8.7 Cost risk

Each comprehension run is 9 dimensions × M cases × cost-per-grader-call. For type-safety with 10 cases, that's roughly 10 grader calls per run (some cases test multiple dimensions but the worked example happens to be 1:1). The audit-loop's `--graded` mode already proves this is feasible at reasonable cost when using `codex exec` or `claude -p`. The baseline harness (R5) doubles the cost; recommended for releases, not every commit.

### 8.8 Anti-pattern catalog

| Anti-pattern | Why it fails | Detection |
|---|---|---|
| Author a single "comprehensive" prompt covering all 9 dimensions | Loses per-dimension signal; failures can't be diagnosed | Lint check: each case must declare exactly one `comprehension_dimension` |
| Use the same grader model family as agent | Self-enhancement bias inflates pass rates | Recommend the comprehension config name explicit grader and agent models |
| Tag all cases `transfer: far` | Most authors can't author genuine far transfer; the tag becomes noise | Lint check R4 — verify scenario keywords don't appear in body |
| Treat the rubric as a Likert score | Reintroduces the labeling-inconsistency problem Hagiwara 2023 documents | Rubric output is binary per behavior; aggregate is per-dimension counts |
| Author cases that test multiple skills at once | Coupling defeats per-skill scoring | The case-level `skill_name` is the unit; cross-skill scenarios belong in the routing eval |
| Set `eval_state: passing` without re-running the grader | Repeats the `verified-without-evidence` failure mode the protocol already names | The existing `eval_last_run` discipline catches this; the comprehension grader fills it in |

### 8.9 `methodical` anti-patterns mapped to LLM-as-judge comprehension-grading failures

The repo-internal [`skills/methodical/SKILL.md` § 3](/Users/jacobbalslev/Development/skills/methodical/SKILL.md) catalogs 9 anti-patterns that emerge when an LLM agent is asked to produce a complete, honest enumeration. Each anti-pattern was identified in the context of an agent *producing* findings; every one of them reappears when the LLM is asked to *grade* another LLM's comprehension. The grader is an agent producing findings about the agent-under-test, and inherits the same training pressures.

This section maps four of the nine anti-patterns — the ones with the highest base rates (per §4.7) and the most direct comprehension-eval consequence — onto concrete grader failure modes, and names a structural countermeasure for each. The remaining five anti-patterns (silent scope reduction, summary-first fabrication, step consolidation, deferral as completion, exception justification) apply analogously and are documented in the source.

#### Anti-pattern #3 — Severity-based filter

**`methodical` description.** "Showing only CRITICAL/HIGH items, omitting MEDIUM/LOW. Root cause: helpfulness training optimizes for 'important'. Detection signal: output count < input count." ([`methodical` § 3, line 209](/Users/jacobbalslev/Development/skills/methodical/SKILL.md))

**Comprehension-grading manifestation.** The grader scores only the cases where the agent's answer is *clearly* right or *clearly* wrong, and elides the borderline cases. But the borderline cases carry the most signal — a case the grader can't decide without close reading is exactly the case that discriminates a model that internalized the primitives from a model that pattern-matched. The grader skipping them produces a verdict distribution biased toward 0% or 100% per dimension and erases the comprehension surface's discriminating range.

**Concrete example.** For C2 (mental-model fidelity) on the worked example's case 2 (Python → TypeScript `Any` → `unknown` migration): the agent's answer recommends `Record<string, unknown>` but does not explicitly name the runtime-boundary primitive — only describes the mechanism. A borderline case. A filtering grader marks it PASS (the conclusion is right) or FAIL (the primitive name is missing) without quoting the relevant span. The discriminating fact — that the agent's reasoning *invokes* the runtime-boundary concept under a different name — is lost.

**Structural countermeasure.** The verdict schema (Appendix A § A.1) requires `evidence_quote` per behavior. The grader cannot resolve a borderline case by skipping it — the schema demands a quote. If no quote exists for a `kind: positive` behavior, the verdict is `FAIL` with rationale "no evidence span supports this behavior". This forces the grader to engage every behavior, every case, and converts "I couldn't decide" into "FAIL with rationale" instead of silent omission. Per the `methodical` RULE-9 application in §5.13: completeness is a hard floor, not a target.

#### Anti-pattern #4 — Positive framing override

**`methodical` description.** "Describing a failure as a success or a gap as 'an area for improvement'. Root cause: sycophancy trained on positive human feedback. Detection signal: language mismatch between finding severity and framing." ([`methodical` § 3, line 210](/Users/jacobbalslev/Development/skills/methodical/SKILL.md))

**Comprehension-grading manifestation.** The grader awards partial credit to a response that should have failed because the response was articulate, confident, or stylistically polished. This is the [Zhang et al. 2024 "Style Outweighs Substance" finding](https://arxiv.org/html/2409.15268v2) and the [SycEval 58.19% base rate](https://arxiv.org/abs/2502.08177) playing out at the grader layer. The grader's verdict reads "partially demonstrates understanding" or "passes with minor gaps" on a response that, when read against the rubric, fails ≥1 binary behavior.

**Concrete example.** For C7 (misconception inoculation) on the worked example's case 7 (the "TypeScript catches runtime errors" misconception): the agent's answer is articulate, well-organized, and includes a recommendation to keep Zod. But the answer *partially validates* the misconception ("yes, TypeScript catches type errors at compile time, but you also need runtime validation for untrusted input"). The §5.8 fail criterion is unambiguous — `no_partial_validation_of_misconception`. A positive-framing-override grader marks this PASS because the *overall* recommendation matches the rubric; the failure was the unprompted misconception validation, which the polished framing obscured.

**Structural countermeasure.** Per-behavior binary scoring (the rubric's central design choice) plus the `kind: negative` behavior class. Each negative behavior is a forbidden pattern that, if present, fails the behavior regardless of the response's quality elsewhere. The grader cannot offset a `FAIL` on `no_partial_validation_of_misconception` with `PASS` on three positive behaviors — every behavior must independently PASS for the dimension to PASS. The Appendix A verdict schema's `dimension_verdict = PASS iff all behavior_verdicts == PASS` is the structural enforcement. RULE-6 in §7.10's FORCING FUNCTIONS block names the framing-override pattern explicitly so the grader self-recognizes it.

#### Anti-pattern #6 — Assumed verification

**`methodical` description.** "Reporting a step as verified without producing evidence. Root cause: speed optimization. Detection signal: 'Should work' / 'likely fixed' / 'probably correct'." ([`methodical` § 3, line 212](/Users/jacobbalslev/Development/skills/methodical/SKILL.md))

**Comprehension-grading manifestation.** The grader claims the agent's answer satisfies a behavior without quoting evidence from the answer. The verdict reads "the agent invoked the runtime-boundary primitive" without an `evidence_quote` field, or with a generic-sounding quote that does not actually contain the primitive ("the agent discussed validation"). This is the most common subtle grader failure — the verdict *form* is correct, but the evidence does not actually substantiate the verdict.

**Concrete example.** For C1 (definitional precision) on the worked example's case 1: the agent's answer is a polished restatement of the body's first sentence with minor word substitutions. A grader subject to assumed verification marks `no_verbatim_span: PASS` and quotes a different span as evidence — one that *does* differ from the body — without actually running the 6-gram overlap check on the full answer. The verbatim copy is in a different sentence than the one quoted as evidence; the verdict is wrong.

**Structural countermeasure.** The Appendix A § A.3 `checkVerbatimOverlap` function runs in the calling script (Node, deterministic, free) and emits a structured `verbatim_overlap_check` field that the grader cannot fabricate. The grader's prompt explicitly includes the precomputed result: `<precomputed-overlap-check passed="false" overlap_ngrams="[...]"/>`. The grader cannot mark `no_verbatim_span: PASS` if `passed: false` is in the input. For non-mechanical behaviors (e.g., `invokes_runtime_boundary_primitive`), the grader must produce an `evidence_quote` that is verifiable as a substring of `<agent-answer>` — the calling script can post-check this and flag any verdict whose evidence_quote is not a substring as a parse error. The verification is not the grader's word; it is the grader's structured output measured against deterministic checks.

#### Anti-pattern #8 — Softened negative

**`methodical` description.** "A failure presented as 'could be improved' or 'worth reviewing'. Root cause: RLHF negative feedback on blunt outputs. Detection signal: hedge words on findings that evidence shows are failures." ([`methodical` § 3, line 214](/Users/jacobbalslev/Development/skills/methodical/SKILL.md))

**Comprehension-grading manifestation.** The grader uses hedge words on a clear failure — `rationale: "this could be strengthened by"` instead of `rationale: "this behavior failed because the response does not contain X"`. The verdict ends up `PASS` because the soft language reframed the failure as an improvement opportunity. The 26.42% framing-bias base rate ([Aldigheri et al., 2025](https://arxiv.org/abs/2507.03194)) is the empirical source of this failure.

**Concrete example.** For C9 (negative-boundary refusal) on the worked example's case 9 (DB schema design in type-safety's voice): the agent's answer includes one partial recommendation in type-safety's voice ("use `string` for the file path") before naming `data-modeling` as the owner. The behavior `no_partial_comply` fails — partial compliance occurred. A softened-negative grader writes: `verdict: PASS, rationale: "the agent could be more explicit about handing off completely"`. The hedge word "could be more explicit" reframes a clear failure (partial-comply happened) as an improvement opportunity.

**Structural countermeasure.** The verdict schema constrains `verdict` to the literal strings `"PASS"` or `"FAIL"` — no third value, no probabilistic intermediate. The `rationale` field is constrained to "one sentence" per Appendix A § A.1. If the grader's prompt receives RULE-6 from §7.10 ("Use of hedge words on a behavior with `verdict: FAIL` is itself a grader malfunction"), the grader self-monitors for the pattern. A second-layer countermeasure: a deterministic post-check in the calling script that flags any `rationale` containing the substring list `["could be", "would benefit", "consider", "perhaps", "might be"]` paired with `verdict: PASS` — these combinations indicate the grader probably softened a fail and the verdict deserves human review.

#### Why this matters at the rubric layer

The four anti-patterns above are not separate failure modes from the LLM-judge biases of §4.2.6. They are the same failure modes, named from inside the agent's reasoning rather than from the outside as a measured rate. `methodical` provides the inside-view vocabulary; §4.7 provides the outside-view base rates; §8.1 provides the position/verbosity/self-enhancement axis. All three converge on the same conclusion: **the comprehension grader cannot be trusted to behave methodically without structural forcing functions.** §5 specifies what is measured; §7.10's R9 specifies the prompt-side enforcement; §8.9 (this section) maps the residual risk to the prompt. The Appendix A verdict schema is the floor under all three.

---

## 9. Open questions

These decisions depend on maintainer judgment and cannot be resolved by research. Each is phrased as a binary or small-enum decision so adoption can proceed without resolving every question.

### 9.1 Q1 — Does the comprehension rubric add a 10th eval-dimension value, or fit within the existing seven `dimension` enum?

Today's eval files use `dimension: definition | mental_model | purpose | boundary | application | rule_conflict | anti_pattern`. The proposed `comprehension_dimension` is an additive key. The question: should the existing `dimension` enum be **deprecated** in favor of the new richer `comprehension_dimension`, or should both keys coexist with documented overlap?

Recommendation, not decision: keep both. The existing `dimension` measures **what kind of question is being asked**; `comprehension_dimension` measures **what rubric dimension the case grades against**. A case with `dimension: boundary, comprehension_dimension: C4` is a boundary-shape question graded against C4 — same idea. A case with `dimension: application, comprehension_dimension: C8` is an application-shape question graded against C8 — application is the question shape; C8 is the grader rubric. The two encode complementary information.

But if the maintainer prefers to collapse — they should — the migration is mechanical: each existing `dimension` value maps to a comprehension-dimension if applicable, or stays as an orthogonal "question shape" enum, or is dropped.

### 9.2 Q2 — Does `concept.misconception` warrant its own grader weight (not just "complements `boundary`")?

The schema says `misconception` is "not directly graded; complements `boundary`" ([`schemas/skill.v4.schema.json:208`](/Users/jacobbalslev/Development/skill-graph/schemas/skill.v4.schema.json)). The rubric proposes C7 (misconception inoculation) as a distinct dimension. Either:

- (a) The schema description is wrong; `misconception` does deserve its own weight. Update the schema description to give it a weight (recommend 1.0 for parity with `definition` and `purpose`).
- (b) The schema is right; C7 should be merged into C4 (boundary). Adjust the rubric to a single combined C4 dimension.

Recommendation: (a). The TruthfulQA-shape test for misconception inoculation is a distinct measurement from boundary discrimination — a model can correctly route to a sibling skill (C4 pass) while still validating the misconception phrasing along the way (C7 fail). The two are independent.

### 9.3 Q3 — Should the comprehension rubric apply to `workflow` skills, or `capability` only?

The schema permits `comprehension_state: present` on any archetype. The rubric's concept-block dimensions (C1–C7) are natural for `capability` skills (knowledge teaching). The cross-cutting dimensions (C8 Verification, C9 Do-NOT) apply to `workflow` skills too. The question: should the rubric have a workflow-specific variant, or should `workflow` skills decline the comprehension rubric and use only the existing audit-loop eval dimension?

Recommendation, not decision: workflow skills should declare `comprehension_state: absent` by default. If a workflow skill teaches a concept (e.g., `code-review` teaches the discipline of code review beyond the workflow), it can opt in. The author judges per skill.

### 9.4 Q4 — Binary criteria vs Likert per behavior?

The proposed rubric is binary per `expected_behavior` (pass/fail). The existing audit-prompt-builder uses 1–5 ([`scripts/lib/audit-prompt-builder.js:414`](/Users/jacobbalslev/Development/skill-graph/scripts/lib/audit-prompt-builder.js)). The evidence — [Hagiwara 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10498947/) on criterion-referenced reliability; [Hamel Husain on binary labels](https://hamel.dev/blog/posts/evals-faq/) — supports binary at the per-criterion level. The 1–5 score at the dimension level (aggregating across criteria) is still useful for the audit summary.

Decision needed: should the comprehension grader output binary per behavior + an aggregated 1–5 per dimension, or pure binary throughout? The proposed worked example assumes binary per behavior; the audit aggregation pattern would give a 1–5 derived from binary counts (e.g., 5/5 behaviors pass = score 5; 4/5 = score 4; etc.).

### 9.5 Q5 — Should `expected_behaviors[]` be a required field on new comprehension cases?

The worked example uses it on every case. Authoring `expected_behaviors[]` is more work than authoring `expected_reasoning`. The lint check could require it iff `comprehension_dimension` is set.

Recommendation: yes, required when `comprehension_dimension` is set. The behavior list is what makes the grader run reproducible; the `expected_reasoning` is a human-readable summary. Both serve different consumers.

### 9.6 Q6 — Does the rubric belong in `SKILL_AUDIT_CHECKLIST.md`, `docs/skill-metadata-protocol.md`, or a new file?

Options:

- (a) Extend `SKILL_AUDIT_CHECKLIST.md` with a new 8th section. Pro: discoverable in the same place as the existing seven dimensions. Con: the checklist file is currently audit-shaped, not comprehension-shaped, and adding comprehension dilutes the focus.
- (b) Add a new section to `docs/skill-metadata-protocol.md`. Pro: matches the protocol-shape. Con: the protocol doc is normative and the rubric is operational — slight genre mismatch.
- (c) Create a new file `docs/comprehension-rubric.md`. Pro: clean separation; the file is the rubric's canonical location. Con: yet another doc to discover.

Recommendation, not decision: (c) plus a one-paragraph pointer in (a) and (b). The rubric is operationally distinct from the audit and the protocol; a separate file lets it grow without polluting either.

### 9.7 Q7 — Should the rubric be marketplace-exportable, or kept internal?

The marketplace export (`scripts/export-marketplace-skills.js`) produces plain `SKILL.md` files. The comprehension rubric is internal to the Skill Graph protocol; it does not export. But the **eval files** could be exported as a parallel resource (`examples/evals/<skill>.json` → `marketplace/evals/<skill>.json`) so downstream consumers run the same comprehension grades.

Recommendation, not decision: defer until R3 ships. Once the grader runs and produces meaningful verdicts, the question of "do consumers see this" becomes concrete.

---

## 10. Completeness claim

This report examined the following **24 repo files** (23 inside `skill-graph/` plus 1 in the parent `Development/skills/` workspace, added in the 2026-05-16 revision):

1. [`/Users/jacobbalslev/Development/skill-graph/AGENTS.MD`](/Users/jacobbalslev/Development/skill-graph/AGENTS.MD) — full read; especially §§ Evaluation Discipline, Skill Audit Loop, What the Skill Graph Is
2. [`https://github.com/jacob-balslev/skill-metadata-protocol`](https://github.com/jacob-balslev/skill-metadata-protocol) — full read
3. [`https://github.com/jacob-balslev/skill-audit-loop/blob/main/SKILL_AUDIT_LOOP.md`](https://github.com/jacob-balslev/skill-audit-loop/blob/main/SKILL_AUDIT_LOOP.md) — full read
4. [`https://github.com/jacob-balslev/skill-audit-loop/blob/main/SKILL_AUDIT_CHECKLIST.md`](https://github.com/jacob-balslev/skill-audit-loop/blob/main/SKILL_AUDIT_CHECKLIST.md) — full read
5. [`/Users/jacobbalslev/Development/skill-graph/docs/quality-doctrine.md`](/Users/jacobbalslev/Development/skill-graph/docs/quality-doctrine.md) — full read
6. [`/Users/jacobbalslev/Development/skill-graph/docs/field-reference.md`](/Users/jacobbalslev/Development/skill-graph/docs/field-reference.md) — read in full (1200 lines); focus on `comprehension_state`, `concept`, `eval_*`, `routing_eval` sections
7. [`/Users/jacobbalslev/Development/skill-graph/skills/type-safety/SKILL.md`](/Users/jacobbalslev/Development/skill-graph/skills/type-safety/SKILL.md) — full read; used as worked example
8. [`/Users/jacobbalslev/Development/skill-graph/skills/acid-fundamentals/SKILL.md`](/Users/jacobbalslev/Development/skill-graph/skills/acid-fundamentals/SKILL.md) — full read; confirmed gold-standard concept block
9. [`/Users/jacobbalslev/Development/skill-graph/skills/methodology/SKILL.md`](/Users/jacobbalslev/Development/skill-graph/skills/methodology/SKILL.md) — full read; note: comprehension_state not declared
10. [`/Users/jacobbalslev/Development/skill-graph/skills/skill-scaffold/SKILL.md`](/Users/jacobbalslev/Development/skill-graph/skills/skill-scaffold/SKILL.md) — full read; authoring contract for evals
11. [`/Users/jacobbalslev/Development/skill-graph/scripts/skill-graph-routing-eval.js`](/Users/jacobbalslev/Development/skill-graph/scripts/skill-graph-routing-eval.js) — full read; confirmed routing-eval scope is positive/negative routing, not comprehension
12. [`/Users/jacobbalslev/Development/skill-graph/scripts/skill-audit.js`](/Users/jacobbalslev/Development/skill-graph/scripts/skill-audit.js) — partial read (lines 1–350); confirmed seven-dimension audit shape
13. [`/Users/jacobbalslev/Development/skill-graph/scripts/lib/audit-prompt-builder.js`](/Users/jacobbalslev/Development/skill-graph/scripts/lib/audit-prompt-builder.js) — partial read (lines 1–500 and 700–772); used as the template for the proposed comprehension-prompt-builder
14. [`/Users/jacobbalslev/Development/skill-graph/scripts/skill-lint.js`](/Users/jacobbalslev/Development/skill-graph/scripts/skill-lint.js) — partial read (lines 414–620); confirmed `checkEvalCoherence` and `checkEvalTruthSourceRanges`
15. [`/Users/jacobbalslev/Development/skill-graph/schemas/skill.v4.schema.json`](/Users/jacobbalslev/Development/skill-graph/schemas/skill.v4.schema.json) — read concept block section (lines 165–211); confirmed per-field grader weights
16. [`/Users/jacobbalslev/Development/skill-graph/examples/evals/comprehension.json`](/Users/jacobbalslev/Development/skill-graph/examples/evals/comprehension.json) — full read; the closest existing case to a comprehension eval
17. [`/Users/jacobbalslev/Development/skill-graph/examples/evals/code-review.json`](/Users/jacobbalslev/Development/skill-graph/examples/evals/code-review.json) — full read
18. [`/Users/jacobbalslev/Development/skill-graph/examples/evals/data-modeling.json`](/Users/jacobbalslev/Development/skill-graph/examples/evals/data-modeling.json) — full read
19. [`/Users/jacobbalslev/Development/skill-graph/examples/evals/debugging.json`](/Users/jacobbalslev/Development/skill-graph/examples/evals/debugging.json) — full read
20. [`/Users/jacobbalslev/Development/skill-graph/examples/evals/webhook-integration.json`](/Users/jacobbalslev/Development/skill-graph/examples/evals/webhook-integration.json) — full read
21. [`/Users/jacobbalslev/Development/skill-graph/examples/evals/lint-overlay.json`](/Users/jacobbalslev/Development/skill-graph/examples/evals/lint-overlay.json) — full read
22. [`/Users/jacobbalslev/Development/skill-graph/examples/evals/microcopy.json`](/Users/jacobbalslev/Development/skill-graph/examples/evals/microcopy.json) — full read
23. [`/Users/jacobbalslev/Development/skill-graph/examples/evals/a11y.json`](/Users/jacobbalslev/Development/skill-graph/examples/evals/a11y.json) — partial read (first 100 lines); confirmed per-concept-field dimension distribution
24. [`/Users/jacobbalslev/Development/skills/methodical/SKILL.md`](/Users/jacobbalslev/Development/skills/methodical/SKILL.md) — full read (307 lines); added in the 2026-05-16 revision. This file lives in the parent `Development/skills/` workspace, NOT in `skill-graph/skills/`. The previous research pass conflated it with `skill-graph/skills/methodology/SKILL.md` (item 9 above); the two skills are genuinely distinct: `methodology` covers methodology-method-process frameworks (Cleanroom, PSP/TSP, DMAIC, Gawande), while `methodical` covers the 10 behavioral rules, 4-layer execution architecture, 9 anti-patterns, and RLHF root-cause model that govern complete, honest agent output. The `methodical` skill is the explanatory layer beneath `complete-reporting.md`, `acceptance-criteria-gate.md`, and the rubric's per-behavior scoring discipline; it is integrated into this report at §4.7, §5.13, §7.10 (R9), §8.9, and Appendix A § A.4.

(Bonus: ran `grep -h '"dimension":' examples/evals/*.json | sort | uniq -c` across all 31 eval files to produce the dimension distribution table in §2.2.)

This report cited the following **27 external sources** with working links (22 from the original pass plus 5 added in the 2026-05-16 revision to verify the RLHF base-rate statistics integrated from `methodical` § 5 into §4.7, §7.10, §8.9, and Appendix A § A.4):

1. Anderson & Krathwohl (2001), [*A Revision of Bloom's Taxonomy: An Overview*](https://www.researchgate.net/publication/242400296_A_Revision_of_Bloom's_Taxonomy_An_Overview)
2. Anderson & Krathwohl (2001), [*A Taxonomy for Learning, Teaching, and Assessing*](https://www.researchgate.net/publication/235465787_A_Taxonomy_for_Learning_Teaching_and_Assessing_A_Revision_of_Bloom's_Taxonomy_of_Educational_Objectives)
3. Krathwohl (2002), [*A Revision of Bloom's Taxonomy: An Overview* (Theory Into Practice)](https://cmapspublic2.ihmc.us/rid=1Q2PTM7HL-26LTFBX-9YN8/Krathwohl%202002.pdf)
4. Tang et al. (2025), [*BloomAPR: A Bloom's Taxonomy-based Framework for Assessing the Capabilities of LLM-Powered APR Solutions*](https://arxiv.org/html/2509.25465v1)
5. Hagiwara (2023), [*Is It All About the Form? Norm- vs Criterion-Referenced Ratings and Faculty Inter-Rater Reliability*](https://pmc.ncbi.nlm.nih.gov/articles/PMC10498947/)
6. Huitt (criterion-referenced vs norm-referenced), [*Educational Psychology Interactive*](https://www.edpsycinteractive.org/topics/measeval/crnmref.html)
7. Barnett & Ceci (2002), [*When and where do we apply what we learn? A taxonomy for far transfer*](https://pubmed.ncbi.nlm.nih.gov/12081085/)
8. Bondaroupte et al. (2023), [*Unleashing the Potential of the Feynman Technique*](https://ejournal.iainmadura.ac.id/index.php/panyonara/article/download/14936/4202/)
9. Hu et al. (2025), [*Learn Like Feynman: Developing and Testing an AI-Driven Feynman Bot*](https://arxiv.org/pdf/2506.09055)
10. Liang et al. (2022) HELM paper, [*Holistic Evaluation of Language Models*](https://arxiv.org/abs/2211.09110); HELM project: [crfm.stanford.edu/helm/](https://crfm.stanford.edu/helm/)
11. Srivastava et al. (2022), [*Beyond the Imitation Game: Quantifying and extrapolating the capabilities of language models*](https://arxiv.org/abs/2206.04615)
12. Lin, Hilton, Evans (2021), [*TruthfulQA: Measuring How Models Mimic Human Falsehoods*](https://arxiv.org/abs/2109.07958); GitHub: [github.com/sylinrl/TruthfulQA](https://github.com/sylinrl/TruthfulQA)
13. Hendrycks et al. (2020), [*Measuring Massive Multitask Language Understanding (MMLU)*](https://arxiv.org/abs/2009.03300); MMLU-Pro analysis: [intuitionlabs.ai/pdfs/mmlu-pro-explained-the-advanced-ai-benchmark-for-llms.pdf](https://intuitionlabs.ai/pdfs/mmlu-pro-explained-the-advanced-ai-benchmark-for-llms.pdf)
14. Gardner et al. (2020), [*Evaluating Models' Local Decision Boundaries via Contrast Sets*](https://aclanthology.org/2020.findings-emnlp.117.pdf)
15. Zheng et al. (2023), [*Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena*](https://arxiv.org/abs/2306.05685)
16. Li et al. (2024), [*A Survey on LLM-as-a-Judge*](https://arxiv.org/html/2411.15594v6)
17. Wang et al. (2024), [*CalibraEval: Calibrating Prediction Distribution to Mitigate Selection Bias in LLMs-as-Judges*](https://arxiv.org/html/2410.15393v1)
18. Husain, [*Your AI Product Needs Evals*](https://hamel.dev/blog/posts/evals/); [*LLM Evals: Everything You Need to Know (FAQ)*](https://hamel.dev/blog/posts/evals-faq/)
19. Yan, [*Task-Specific LLM Evals That Do & Don't Work*](https://eugeneyan.com/writing/evals/); [*Evaluating the Effectiveness of LLM-Evaluators (LLM-as-Judge)*](https://eugeneyan.com/writing/llm-evaluators/)
20. Anthropic (2026), [*Equipping agents for the real world with Agent Skills*](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills); Tessl coverage: [tessl.io/blog/anthropic-brings-evals-to-skill-creator-heres-why-thats-a-big-deal/](https://tessl.io/blog/anthropic-brings-evals-to-skill-creator-heres-why-thats-a-big-deal/)
21. OpenAI Developers (2026), [*Testing Agent Skills Systematically with Evals*](https://developers.openai.com/blog/eval-skills); OpenAI Evals framework: [github.com/openai/evals](https://github.com/openai/evals)
22. Agent Skills community spec, [*agentskills.io specification*](https://agentskills.io/specification)
23. Fanous et al. (2025), [*SycEval: Evaluating LLM Sycophancy*](https://arxiv.org/abs/2502.08177) — primary source for the 58.19% sycophancy rate across frontier models (Gemini-1.5-Pro, ChatGPT-4o, Claude-Sonnet) on AMPS and MedQuad. Cited in §4.7, §8.9, Appendix A § A.4.
24. Peters & Chin-Yee (2025), [*Generalization bias in large language model summarization of scientific research*](https://royalsocietypublishing.org/rsos/article/12/4/241776/235656/Generalization-bias-in-large-language-model), Royal Society Open Science vol. 12(4):241776 — primary source for the 26–73% summarization-overgeneralization rate across DeepSeek, ChatGPT-4o, LLaMA 3.3 70B, on 4,900 summaries of *Nature, Science, Lancet, NEJM* abstracts; PMC mirror: [PMC12042776](https://pmc.ncbi.nlm.nih.gov/articles/PMC12042776/). Cited in §4.7, §5.13, Appendix A § A.4.
25. Aldigheri et al. (2025), [*Quantifying Cognitive Bias Induction in LLM-Generated Content*](https://arxiv.org/abs/2507.03194), also [ACL Anthology 2025.ijcnlp-long.155](https://aclanthology.org/2025.ijcnlp-long.155/) — primary source for the 26.42% framing-bias rate across five LLM families. Cited in §4.7, §8.9, Appendix A § A.4.
26. Towards Data Science (2025), [*Why Your Multi-Agent System is Failing: Escaping the 17x Error Trap of the "Bag of Agents"*](https://towardsdatascience.com/why-your-multi-agent-system-is-failing-escaping-the-17x-error-trap-of-the-bag-of-agents/) — source for the 17.2× error-amplification rate in unstructured multi-agent networks and the ~4.4× rate under centralized coordination. Cited in §4.7, §7.10.
27. Liu et al. (2023), [*Lost in the Middle: How Language Models Use Long Contexts*](https://arxiv.org/abs/2307.03172) — corroborating primary source for the attention-dilution / instruction-skipping phenomenon. Used in §4.7 to substantiate the mechanism that `methodical` § Key Sources attributes to a Unite.AI 2025 article (the specific Unite.AI URL was not located in this revision; the underlying mechanism is well-established by the "lost in the middle" literature). Cited in §4.7.

**Items intentionally excluded:**

- **Eval files** beyond the 7 read in full plus the partial of `a11y.json`. The remaining 23 of 31 files were not read end-to-end; their dimension distribution was instead captured via grep across all 31, which gave the dimension-frequency data in §2.2. Reading every file end-to-end was not necessary because (a) the dimension-frequency captured the structural picture, (b) the 7 read in full span the diverse archetypes (concept skill, workflow skill, overlay skill, comprehensive skill).
- **The full text of the schemas** beyond the `concept` block at lines 165–211 of `schemas/skill.v4.schema.json`. The concept-block shape was load-bearing; the rest of the schema's role in this report is to host that block plus the optional `eval_last_run` shape, both of which were examined.
- **The `examples/audits/*` worked-example artifacts**. Confirmed they exist (`a11y`, `debugging`, `documentation`) and that the artifact contract matches `SKILL_AUDIT_CHECKLIST.md`. The audit artifacts are output of the existing audit loop; they don't contain comprehension-shaped data and would not change the analysis.
- **BIG-bench paper full text via WebFetch**. The PDF returned binary; the [search-result summary](https://arxiv.org/abs/2206.04615) and the [GitHub README](https://github.com/google/BIG-bench) carried the design-principle content this report needed.
- **Closed commercial eval platforms** (Braintrust, LangSmith, Weights & Biases Weave). Per the task brief, these are noted as options but the proposed framework works with the repo's existing file-based eval surface; reading their marketing pages would not add to the framework's design.

**Correction in the 2026-05-16 revision.** The previous research pass examined only `skill-graph/skills/methodology/SKILL.md` (item 9 above) and treated it as the closest available analogue to the `methodical` discipline referenced in the original task brief. That conflation was incorrect: the canonical `methodical` skill exists at [`/Users/jacobbalslev/Development/skills/methodical/SKILL.md`](/Users/jacobbalslev/Development/skills/methodical/SKILL.md) in the parent `Development/skills/` workspace — a richer 307-line artifact covering the RLHF root-cause model, 10 behavioral rules, 4-layer execution architecture, and 9 anti-patterns — and is genuinely distinct from `methodology` (which covers methodology-method-process frameworks). The 2026-05-16 revision adds it as repo file #24 and integrates it at §4.7, §5.13, §7.10 (R9), §8.9, and Appendix A § A.4. The original report's citation of the AGENTS.md ≥7-scenario eval-minimum rule was already correct (the rule lives at `skill-graph/AGENTS.md:186` and `skill-graph/skills/skill-infrastructure/SKILL.md:273–278`, NOT in `methodical`); that attribution did not require correction.

**One residual unverified attribution.** [`skills/methodical/SKILL.md` § Key Sources](/Users/jacobbalslev/Development/skills/methodical/SKILL.md) attributes the "instruction skipping: attention dilution with prompt length" finding to "Unite.AI (2025)". A WebSearch on 2026-05-16 did not surface a single direct Unite.AI 2025 article matching that exact claim; multiple Unite.AI guides on LLM behavior exist but the specific 2025 attention-dilution attribution could not be pinned to one URL. The underlying mechanism is independently corroborated by the well-established "lost in the middle" literature (Liu et al. 2023, [arXiv:2307.03172](https://arxiv.org/abs/2307.03172) — added as external source #27), which is cited in §4.7 as the verifiable substantiation. The Unite.AI 2025 attribution is reused in this report only as quoted/paraphrased from `methodical` § Key Sources, with the qualification stated inline at §4.7.

This report covers all 24 repo files and all 27 external sources cited above.

---

## Appendix A — Grader prompt template (proposed)

This appendix specifies the exact prompt the comprehension grader receives for one case. It is the operationalization of §5 and §7.2; the implementation note in R2 says "mirror `scripts/lib/audit-prompt-builder.js`," and this template is what that means concretely.

The template uses the same `# IDENTITY / # STEPS / # RULES / # INPUT / # OUTPUT` structure as [`audit-prompt-builder.js` lines 565–613](/Users/jacobbalslev/Development/skill-graph/scripts/lib/audit-prompt-builder.js). The differences are: (a) the dimension comes from the rubric C1–C9, not the audit's seven; (b) the input embeds only the relevant concept-block field plus the case data, not the schema or neighbors; (c) the output is one verdict per `expected_behavior`, not one per checklist bullet.

### A.1 Prompt sections

```
# IDENTITY

You are a Skill Graph comprehension grader. You evaluate one case against one
rubric dimension at a time. Your verdict is binary per behavior. Default
posture: evidence-first. Do not pass a behavior without quoting the agent's
exact words; do not fail a behavior without quoting the gap.

# STEPS

1. Read the <skill-body> — this is the SKILL.md the agent loaded as context.
2. Read the <concept-field name="..."> — this is the canonical answer for
   this rubric dimension.
3. Read the <case> — the prompt the agent was given and the agent's answer.
4. For each <expected-behavior>, decide PASS or FAIL based on the agent's
   answer. Quote the exact span of the agent's answer that is your evidence.
5. Aggregate: the dimension PASSes iff every behavior PASSes.

# RULES

- Every behavior verdict MUST cite an exact substring of the agent's answer
  as evidence.
- A negative-kind behavior (kind: "negative") PASSes when the unwanted thing
  is ABSENT from the agent's answer; quote the closest spot where the
  unwanted thing might have appeared but did not.
- A positive-kind behavior (kind: "positive") PASSes when the required thing
  IS present; quote the span where it appears.
- For the verbatim-overlap check: the agent's answer fails if any 6-gram
  substring (6 consecutive non-stopword tokens) is also present in the
  embedded <skill-body> or <concept-field>.
- Do not invent failure modes outside the expected_behaviors list.
- The output is a single <verdict>...</verdict> JSON block. No prose outside.

# INPUT

<case-id>{id}</case-id>
<dimension>{C1|C2|...|C9}</dimension>
<concept-field name="{definition|mental_model|...}">
{the field's content, verbatim from the skill frontmatter}
</concept-field>

<skill-body>
{the SKILL.md body content, with frontmatter stripped}
</skill-body>

<case>
  <prompt>{the case's prompt field}</prompt>
  <agent-answer>{the agent's actual answer to the prompt}</agent-answer>
  <expected-reasoning>{optional expected_reasoning field}</expected-reasoning>
  <expected-behaviors>
    <behavior id="..." kind="positive|negative">{description}</behavior>
    ...
  </expected-behaviors>
</case>

# OUTPUT

<verdict>
{
  "case_id": <id>,
  "dimension": "<C1-C9>",
  "behavior_verdicts": [
    {
      "id": "<behavior_id>",
      "kind": "positive" | "negative",
      "verdict": "PASS" | "FAIL",
      "evidence_quote": "<exact substring of the agent's answer>",
      "rationale": "<one sentence>"
    }
  ],
  "dimension_verdict": "PASS" | "FAIL",
  "verbatim_overlap_check": {
    "passed": true | false,
    "overlap_ngrams": [
      "<any 6-gram or longer overlap with skill body or concept field>"
    ]
  }
}
</verdict>
```

### A.2 Why this template shape

Each design decision is anchored:

- **`<concept-field name="...">` embedded explicitly**, separate from the body. This is so the grader knows which field is the canonical answer for this case's dimension. The audit-prompt-builder embeds the full body and schema; the comprehension grader needs less context but more specificity about which slot the answer should match.
- **`<agent-answer>` is a required input.** The audit grader reads the static skill body. The comprehension grader needs the agent's runtime answer — the entire point of the dimension. The script that invokes the grader is responsible for running the agent first and feeding the answer in.
- **Behavior-level verdicts, not dimension-level scores.** Per §4.2.6 and §4.3.1 (Husain), binary per criterion is more reliable than Likert per dimension. The dimension verdict is a deterministic aggregate (`all PASS → PASS`).
- **`verbatim_overlap_check`** is a structured field, not a freeform observation. Because the verbatim-copy failure is the most common comprehension failure and the easiest to detect mechanically, it gets a dedicated output slot. A grader that reports `passed: false` with no `overlap_ngrams` is malfunctioning.
- **Evidence quote required on every behavior.** The audit-prompt-builder already requires this; the comprehension grader needs it more, because the evidence quote is what makes "is the primitive invoked" decidable rather than impressionistic.

### A.3 Implementing the verbatim-overlap check

The 6-gram overlap check is the C1 hard-fail criterion (§5.2) and is mechanical, not LLM-judged. The grader can run it directly inline, or the calling script can run it before invoking the grader and pass the result in. Recommended: run it in the calling script (Node, deterministic, free) and pass the result to the grader as `<precomputed-overlap-check passed="..."/>` so the grader doesn't hallucinate.

Pseudocode:

```javascript
function checkVerbatimOverlap(agentAnswer, skillBody, conceptField, n = 6) {
  const tokenize = (s) => s.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 3 && !STOPWORDS.has(t));

  const ngrams = (tokens, n) => {
    const out = new Set();
    for (let i = 0; i <= tokens.length - n; i++) {
      out.add(tokens.slice(i, i + n).join(' '));
    }
    return out;
  };

  const agentNgrams = ngrams(tokenize(agentAnswer), n);
  const bodyNgrams = ngrams(tokenize(skillBody + ' ' + conceptField), n);

  const overlap = [...agentNgrams].filter(g => bodyNgrams.has(g));
  return { passed: overlap.length === 0, overlap_ngrams: overlap };
}
```

The 6-gram threshold and the stopword list are tunable. A starting stopword list: "this", "that", "they", "them", "with", "from", "have", "will", "would", "could", "should", "their", "there", "where", "when", "what", "which", "while", "about", "after", "before", "between", "into", "than", "then" — the standard English-functional-word set. The 6 in "6-gram" is from plagiarism-detection literature where ~6 consecutive distinctive tokens is the threshold below which natural-language overlap is plausibly coincidental and above which it is plausibly copied.

The threshold is a calibration knob: if calibration on the worked-example cases shows too many false positives (paraphrastic answers flagged as verbatim), bump to 7-gram. If too many false negatives (clearly-copied answers passing), drop to 5-gram. The skill's own quality doctrine accepts that compression "preserves meaning, names, boundaries, examples, evidence" — meaning short structural overlaps like "type system" or "runtime boundary" should not trigger the check, which is why the n-gram size is large.

### A.4 `# METHODICAL FORCING FUNCTIONS` — the rule block the grader sees

This subsection specifies the additional prompt block that R9 (§7.10) injects into the Appendix A § A.1 template. It is placed between `# RULES` and `# INPUT` in the rendered prompt so the forcing functions are read immediately before the grader sees the case data. The rules are stated in the *grader's* voice — i.e., they describe what the grader (the model running this prompt) commits to doing as it produces its own verdict.

```
# METHODICAL FORCING FUNCTIONS

You are subject to four explicit rules that govern HOW you produce the verdict.
These rules come from the `methodical` skill at
/Users/jacobbalslev/Development/skills/methodical/SKILL.md § 1 (the 10 Rules).
They exist because LLM graders, including you, are trained on signals that
systematically reward shorter, more positive, more confident outputs over
complete and honest ones. The four rules below are structural countermeasures.

RULE-1 (Complete Before Summarize):
  You will produce one verdict per `expected_behaviors[].id` BEFORE producing
  the `dimension_verdict`. The number of entries in `behavior_verdicts[]` in
  your output MUST equal the number of entries in `expected_behaviors[]` in
  the input. Never aggregate before enumerating. Never skip a behavior
  because it seems redundant, low-priority, or hard to evaluate.

RULE-3 (Separate Generation from Criticism):
  After you draft the verdict and before you emit it, run a self-critique
  pass internally. Ask: "Which behaviors did I mark PASS where the
  evidence_quote does not actually demonstrate the criterion? Which behaviors
  did I mark with hedged rationale where the response evidence clearly
  fails?" Revise any verdict where the self-critique surfaces a problem.

RULE-6 (Negative Findings Are Primary Data):
  A FAIL verdict is more valuable than a PASS verdict. Do NOT use hedge words
  ("could be improved", "worth reviewing", "could be strengthened", "might
  be", "perhaps") on a behavior with `verdict: FAIL`. State the failure
  directly and quote the exact gap in the response. Use of hedge words on a
  FAIL is itself a grader malfunction that downstream tooling will detect.

RULE-9 (State the Completeness Claim Explicitly):
  Your verdict object must enumerate every `expected_behavior.id` from the
  input. If you could not decide on a behavior, the verdict for that behavior
  is `FAIL` with `rationale` naming the indecision (e.g., "could not evaluate
  because the response did not address this criterion") — NEVER silently
  omitted. The completeness claim is implicit in the schema: every input id
  appears in `behavior_verdicts[]`.

Compliance is mechanically checkable:
  - RULE-1: count(behavior_verdicts) == count(expected_behaviors)
  - RULE-2: every behavior_verdict has a non-empty evidence_quote
  - RULE-6: no behavior_verdict has verdict=FAIL with hedge-word rationale
  - RULE-9: set(behavior_verdict.id) == set(expected_behavior.id)

The calling script will run these checks on your output. A verdict that
violates any rule is a malformed output and will trigger a re-run, not a
silent pass.
```

**Why this block is mandatory, not optional.** Per §4.7, an unconstrained comprehension grader inherits the §4.7 base rates: ~58% sycophancy ([SycEval, 2025](https://arxiv.org/abs/2502.08177)), 26–73% summarization overgeneralization ([Peters & Chin-Yee, 2025](https://royalsocietypublishing.org/rsos/article/12/4/241776/235656/Generalization-bias-in-large-language-model)), 26.42% framing bias ([Aldigheri et al., 2025](https://arxiv.org/abs/2507.03194)). The four rules above each target a specific base rate: RULE-1 targets summarization, RULE-3 targets the no-self-critique baseline that the [17.2× multi-agent amplification finding (Towards Data Science, 2025)](https://towardsdatascience.com/why-your-multi-agent-system-is-failing-escaping-the-17x-error-trap-of-the-bag-of-agents/) identifies as the dominant cause, RULE-6 targets framing bias, RULE-9 targets attention-dilution-driven instruction skipping.

The block's length is ~30 lines and adds ~1KB to each grader prompt. Cost is negligible. The block goes at the START of `# METHODICAL FORCING FUNCTIONS` and BEFORE `# INPUT` to mitigate the attention-dilution mechanism: rules near the end of long context (where `# OUTPUT` and the verdict-schema also live) get less attention, so the rules are placed before the case data, not after.

**What the block deliberately omits.** The remaining six `methodical` rules are not in the block:
- RULE-2 (Evidence Receipt Per Step) is structurally enforced by the `evidence_quote` field in the verdict schema and the post-check; naming it again in the prompt is redundant.
- RULE-4 (Prioritization is reordering, not filtering) does not apply at the grader layer — the grader's task is to score, not to prioritize across cases.
- RULE-5 (Observe Before Act) is captured by `# STEPS` ordering ("Read the <skill-body> first").
- RULE-7 (Verification is not trust) applies at the audit-loop integration layer (R6, §7.6) where the audit consumes the grader's structured verdict and never trusts its prose summary.
- RULE-8 (Scope framing must be challenged) does not apply: the grader's scope is exactly the case's `expected_behaviors[]` and is correct by construction.
- RULE-10 (Deliberate pace on high-stakes steps) is implicit in the single-shot per-case grader invocation; the grader does not run a chain of high-stakes steps.

The four-rule block is the minimum complete set for the comprehension-grading task. Adding more rules dilutes the attention to the four that matter; omitting any of the four reopens a measured failure mode.

---

## Appendix B — Observed failure modes in the current eval files

This appendix catalogs comprehension-shaped failure modes visible in the existing 31 eval files. The goal is to ground the proposed rubric in failures the library actually exhibits, per Husain's "begin with a benevolent dictator reviewing 100+ traces" pattern (§4.3.1). The cases below are illustrative, not exhaustive.

### B.1 Quote-dependent definition cases

The clearest pattern: most `dimension: definition` cases (10/177, §2.2) phrase prompts that reward retrieval. Example from [`examples/evals/a11y.json` case 1 (lines 8–17)](/Users/jacobbalslev/Development/skill-graph/examples/evals/a11y.json):

> "A designer wants a clickable element that triggers an action on the same page without navigating. The current code uses `<a href="#">` with a click handler. According to the a11y skill's Primitive Selection table, what is the correct primitive and why is the current one wrong?"

A model with the skill loaded will simply locate the Primitive Selection table and quote the relevant row. There is no constraint preventing verbatim restate. The agent does not need to internalize "the right primitive is a button" — it needs to find the line in the body that says so. The prompt's "According to the a11y skill's Primitive Selection table" is a near-verbatim citation pointer.

This is not a flaw in the case author's intent — it's a missing rubric component. Adding the C1 verbatim-span check (§5.2) gives the case a comprehension teeth. The current case becomes a near-transfer C1 case once the rubric demands non-verbatim restatement.

### B.2 Boundary-as-routing confused with boundary-as-discrimination

The `dimension: boundary` cases (62/177) are mostly routing handoffs. Example from [`examples/evals/code-review.json` case 3 (lines 31–39)](/Users/jacobbalslev/Development/skill-graph/examples/evals/code-review.json):

> "Production users are already seeing a known failure and there is no proposed diff yet. Should code-review accept the task?"

This is a routing decision: code-review should hand off to debugging. It does not test whether the agent **understands the boundary as a discrimination** — i.e., that code-review and debugging operate on different inputs (a proposed change vs an in-flight failure). A model could correctly hand off without understanding the structural difference.

The proposed C4 rubric distinguishes the two: routing handoff is C9 (in-skill refusal), concept discrimination is C4 (boundary mechanism). The current cases mostly probe C9. Adding C4 cases requires probes that name the discriminating mechanism, not just the handoff target.

### B.3 The `documentation` comprehension.json is the high-water mark

The single eval file `examples/evals/comprehension.json` is the closest the library has to a comprehension-graded surface. Two cases (id 11 and id 12, lines 148–181) include `expected_reasoning` fields with multi-sentence reasoning traces. Case 11 probes rule-conflict ("does the same-commit doc-update rule bend for a hotfix?"); case 12 probes Verification-vs-Philosophy tension ("doc passes Verification but fails the Philosophy test — is it acceptable?").

These cases are sophisticated. They are also **the only two cases in the entire library** that explicitly probe whether the agent reasons about the skill's claims under tension. Their existence is evidence that the comprehension test the rubric proposes is authorable in the existing eval-file shape — `expected_reasoning` already encodes much of what `expected_behaviors[]` would carry. The rubric is partly a formalization of patterns already present in `comprehension.json`.

The case for keeping `expected_reasoning` and adding `expected_behaviors[]` rather than replacing the former: `expected_reasoning` is human-readable; `expected_behaviors[]` is grader-decidable. Both have consumers. Cases with both fields give the grader structured behaviors AND give a future human reader a prose summary of why the case exists.

### B.4 Absent dimensions

Per the table in §2.2 and §3.9, three concept-block fields (`taxonomy`, `analogy`, `misconception`) have **zero** eval cases tagged for them across the entire 31-file library. The two skills with declared `comprehension_state: present` (`type-safety`, `acid-fundamentals`) have zero eval files at all. This is the clearest priority for backfill (R7, §7.7):

| Skill | `comprehension_state` | Has eval file | Worked example exists |
|---|---|---|---|
| `type-safety` | `present` | no | yes (§6.2) |
| `acid-fundamentals` | `present` | no | no — but analogous to type-safety; the four primitives (A/I/D + C-tension) give the same shape |

Authoring `acid-fundamentals`'s comprehension eval is the natural next step after `type-safety`'s lands. The acid-fundamentals skill has an exceptionally rich `concept` block (115 lines of frontmatter content) with explicit primitives (the four properties + the contract) and a rich taxonomy (by property, by isolation level, by durability configuration, by consistency-rule scope, by model). All five C5-style taxonomy probes would be authorable directly from the skill's existing content.

### B.5 The skills declaring `comprehension_state: absent`

Most of the 133 skills in the active library do not declare `comprehension_state: present`. Default-absent is honest — the skill author has not authored the concept block and has not authored comprehension evals, so the comprehension rubric should not run against them.

But there is a discoverability problem: a skill author who would benefit from declaring `present` may not realize the option exists. The recommended documentation (R8, §7.8) closes this: when an author writes a new concept-shape skill, the field reference and skill-scaffold should both flag `comprehension_state` as the toggle for the comprehension rubric.

A future improvement (out of scope for this report): a lint check that flags skills whose body contains the structural shape of a concept (Coverage, Philosophy, mental-model-like primitives in the body, named misconceptions) but whose frontmatter declares `comprehension_state: absent`. These are candidates for upgrade.

---

## Appendix C — Mapping the rubric onto the audit-loop scorecard

The audit-loop ([`SKILL_AUDIT_LOOP.md`](https://github.com/jacob-balslev/skill-audit-loop/blob/main/SKILL_AUDIT_LOOP.md)) scores seven dimensions: Metadata, Activation, Relation, Grounding, Content, Eval, Portability. The proposed comprehension rubric adds C1–C9. The relationship is **complementary, not overlapping**:

| Audit-loop dimension | Comprehension dimension(s) | Relationship |
|---|---|---|
| Metadata validity | — | Disjoint. Audit checks schema conformance; comprehension never reads frontmatter for grading. |
| Activation quality | — | Disjoint. Activation is routing-side; comprehension is loaded-skill-side. |
| Relation quality | partly C4 | The audit checks whether relations point at semantically correct peers (grader-judged content); C4 checks whether the loaded agent recognizes adjacent-skill territory (agent-judged behavior). Different consumers; both surfaces are valuable. |
| Grounding fidelity | — | Disjoint. Grounding is repo-truth-source-side; comprehension is universal-concept-side. |
| Content quality | partly C1, C3, C8 | Audit checks that the body has clear Coverage / Philosophy / Verification; comprehension checks that the agent's behavior reflects them. The audit grades the prose; comprehension grades the prose's effect. |
| Eval quality | all of C1–C9 | This is where the rubric **adds** to the audit-loop. The current audit Eval dimension checks "does an eval file exist, is it ≥7 scenarios, does it have negative expectations." The proposed extension: "do the scenarios cover the 9 comprehension dimensions, do they grade against the concept-block fields and the body's Verification / Do-NOT sections." |
| Portability quality | — | Disjoint. Portability is export-side; comprehension is concept-side. |

The integration recipe (R6, §7.6): the audit-loop's `Eval quality` row, when a skill declares `comprehension_state: present`, also reports the per-dimension comprehension verdicts. A skill that PASSes audit-loop's Eval row (≥7 scenarios, ≥1 negative each) and PASSes all 9 comprehension dimensions is comprehension-verified. A skill that PASSes the audit row but fails 2/9 comprehension dimensions is **PARTIAL** at the eval surface — the existing audit verdict vocabulary (`PASS / PASS WITH FIXES / PARTIAL / FAIL`) is sufficient to express the mix.

---

## Appendix D — Pre-existing terms the rubric should use carefully

To avoid the v1→v2 enum drift the protocol experienced ([`SKILL_METADATA_PROTOCOL.md`](https://github.com/jacob-balslev/skill-metadata-protocol) § Migration Notes), the rubric should use vocabulary that does not collide with existing protocol terms.

**Terms already in use that the rubric reuses with same meaning:**

| Term | Existing use | Rubric use | OK to reuse? |
|---|---|---|---|
| `boundary` | `concept.boundary` field; `relations.boundary` edges; `dimension: boundary` in evals | Rubric C4 (concept discrimination) and the body's `## Do NOT Use When` cross-cut | Yes — but the rubric's C4 and C9 distinguish the two concept-block vs body uses |
| `definition` | `concept.definition` field; `dimension: definition` in evals | Rubric C1 | Yes |
| `mental_model` | `concept.mental_model` field; `dimension: mental_model` in evals | Rubric C2 | Yes |
| `purpose` | `concept.purpose` field; `dimension: purpose` in evals | Rubric C3 | Yes |
| `taxonomy` | `concept.taxonomy` field | Rubric C5 | Yes |
| `analogy` | `concept.analogy` field | Rubric C6 | Yes |
| `misconception` | `concept.misconception` field | Rubric C7 | Yes |

**New terms the rubric introduces:**

| Term | Defined in | Meaning |
|---|---|---|
| `comprehension_dimension` | eval-case key | Identifies which rubric dimension (C1–C9) the case grades against |
| `concept_field` | eval-case key | Identifies which concept-block field (definition / mental_model / etc.) the case targets; null for C8 and C9 |
| `transfer` | eval-case key | `near` or `far` — whether the case's surface details appear in the body |
| `expected_behaviors[]` | eval-case array | Per-behavior pass/fail criteria with positive/negative kind |
| `verbatim_overlap_check` | grader output field | Result of the 6-gram overlap check |

All new terms are namespaced inside the eval-file structure (not the SKILL.md frontmatter). The protocol contract is not affected.

**Terms the rubric explicitly does NOT introduce:**

- A new `dimension` enum value. The existing enum is kept; `comprehension_dimension` is the additive richer key.
- A new `eval_state` value. The schema's `unverified / passing / monitored` triple is sufficient — a comprehension-graded run that passes is `passing`; that fails is back to `unverified`.
- A new top-level frontmatter field. All additions are inside eval files. The schema needs no change.

---

## Appendix E — Estimated cost of adoption

For a back-of-envelope cost estimate, assume:

- **Grader CLI cost.** ~10 cents per case using current-generation API graders (Sonnet 4.7 / GPT-5.x / Gemini 3.x), accounting for prompt size of ~4–6KB (body + concept field + case) and ~1KB output (verdict JSON).
- **Authoring cost.** ~30 minutes per case for an experienced author following the worked example. ~10 cases per comprehension-graded skill.
- **Backfill scope.** R7 (§7.7) backfills 2 skills today (`type-safety`, `acid-fundamentals`); growth depends on how many additional skills declare `comprehension_state: present` over the next quarter.

Rough total for the proposed adoption:

| Item | Effort | Cost |
|---|---|---|
| R1 — author `type-safety.json` (worked example, already drafted in §6) | ~2 hours | $0 (drafted in this report) |
| R2 — comprehension-prompt-builder | ~1 day | $0 (Node, no deps) |
| R3 — evaluate-skill.js script | ~2 days | $0 implementation; ~$5 per skill comprehension run |
| R4 — far-transfer lint check | ~3 hours | $0 |
| R5 — baseline-comparison harness | ~3 days | $0 implementation; ~$10 per skill (2x grader cost) |
| R6 — audit-loop scorecard extension | ~half day | $0 |
| R7 — backfill `acid-fundamentals` eval | ~5 hours per skill | $5 per skill grader run |
| R8 — documentation | ~half day | $0 |

The dominant ongoing cost is **grader CLI calls** at ~$5 per skill per run. For a library of 5 comprehension-graded skills, a quarterly re-run is ~$25. For a library of 50 such skills, ~$250 quarterly. Both are negligible vs. the engineering hours saved by catching skill drift the comprehension rubric would surface.

---

## Appendix F — Worked-example case index by Bloom level

This appendix indexes the 10 worked-example cases by their Bloom level (per §4.1.1) for cross-referencing.

| Case | Dim | Bloom level | Why |
|---|---|---|---|
| 1 | C1 | Understand | Re-state the definition without copying |
| 2 | C2 | Apply / Analyze | Apply primitives to a novel scenario the body does not enumerate |
| 3 | C3 | Understand / Evaluate | State purpose; evaluate alternative |
| 4 | C4 | Analyze | Decompose a prompt to identify it's in adjacent territory |
| 5 | C5 | Analyze | Classify a novel instance into the taxonomy |
| 6 | C6 | Apply / Evaluate | Apply analogy to new case; evaluate where it breaks |
| 7 | C7 | Evaluate | Evaluate a misconception's truth and identify the flaw |
| 8 | C8 | Apply | Apply the Verification checklist to a fresh artifact |
| 9 | C9 | Evaluate | Evaluate whether the request is in-scope; refuse if not |
| 10 | C7 | Evaluate | Evaluate a cross-language analogy claim and identify the flaw |

Coverage: Understand (3 cases), Apply (3 cases), Analyze (3 cases), Evaluate (5 cases — with some cases serving multiple levels). Create — the top Bloom level — is not exercised by the rubric; creating new artifacts that embody the skill's discipline is the agent's downstream task and is a different evaluation surface (output quality of the skill-aided work, not comprehension of the skill).

The absence of Create-level cases is deliberate. A skill teaches concept primitives; the Create-level test is whether the primitives produce good work, which depends on the task more than on the skill. The comprehension rubric tests whether the primitives were learned; the audit-loop's Content dimension already checks whether the body is good enough to support Create-level work.

---

*End of report.*
