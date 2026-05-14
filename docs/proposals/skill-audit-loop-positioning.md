# Skill Audit Loop — Positioning Proposal

> Type: Proposal
> Status: Draft for review
> Date: 2026-05-14
> Scope: Documentation and positioning only. No schema, field, script, or CLI changes.

## Why this proposal exists

The Skill Audit Loop is currently documented as a maintenance workflow —
something a library maintainer runs to keep a growing collection of skills
healthy. That description is accurate but it undersells what the loop does. It
describes the loop's cadence and outputs without stating its purpose.

This proposal supplies the missing purpose statement and proposes where it goes.
It does not change the loop, the protocol, or the graph. It changes how two
documents introduce the loop.

## 1. The conceptual frame

### What the loop is for

A portable capability skill ships as a contract about a subject. The contract
states what the skill is for, what grounds it, what it must not own, and how it
should be checked. But the contract is inert on its own. It is a frame, not an
answer. It becomes useful only when an agent applies it to a specific situation,
and it stays useful only while the things it was written against still hold.

Two of those things move. The first is the user's codebase: files get renamed,
patterns get replaced, the truth sources a skill points at drift out from under
it. The second is the subject itself: specifications get revised, conventions
shift, the guidance a skill encodes goes from current to dated. A skill written
against either moving target will, given enough time, describe a world that no
longer exists.

The Skill Audit Loop is the mechanism that re-grounds a skill against both. It
is not an optional polish step layered on top of skills that already work — it
is what keeps a skill working at all once time has passed. A maintainer running
the loop across their own library is one instance of this. An adopter running
the loop against their own repository is another instance of the same loop.
Both are doing the same thing: checking a skill's declared grounding against
current reality and recording the result.

This is not a new capability. The protocol fields that make the loop possible —
`grounding.truth_sources`, `grounding.failure_modes`, `freshness`, and
`drift_check` — already exist and already carry this meaning. The loop has
always been a re-grounding mechanism. The current documentation describes the
activity, auditing many skills on a cadence, without naming the purpose:
keeping each skill true to what it was grounded against.

### The two axes of re-grounding

The loop re-grounds along two independent axes. Both are already expressed in
protocol fields; neither needs a new term.

| Axis | What moves | Protocol fields that express it | How the loop checks it |
|---|---|---|---|
| **Codebase** | The repo the skill is grounded in — renamed files, replaced patterns, moved code. | `grounding.truth_sources` with `path:` entries, `grounding_mode: repo_specific`, `evidence_priority: repo_code_first`, `drift_check.truth_source_hashes` | The drift sentinel hashes each local truth source and reports `DRIFT` or `BROKEN`. Loop Step 5 classifies a mismatch as skill drift, code drift, or documentation drift. |
| **World** | The subject the skill describes — revised specs, shifted conventions, updated guidance. | `grounding.truth_sources` with URL entries, `grounding_mode: universal`, `grounding.failure_modes`, `freshness`, `lifecycle.review_cadence: on-truth-source-change` | The sentinel marks URL sources `EXTERNAL_UNHASHED` — valid but unfetched, so a human must re-check them. `freshness` is the authored claim that the body was last checked against current understanding on a given date. |

A skill grounded only in local code drifts when the code moves. A skill grounded
in an external standard drifts when the standard moves. Most real skills are
`grounding_mode: hybrid` and drift along both axes. The loop is the single
procedure that checks both, because both are declared in the same `grounding`
block.

## 2. Where the frame goes

### 2a. README.md — Skill Audit Loop section (proposed rewrite)

Keep the section in its current position. Keep both reference links. Open with
the frame, then the mechanics.

> ## Skill Audit Loop
>
> A skill is a contract about a subject. The contract is inert on its own — it stays useful only while the things it was written against still hold. Two of those things move: the codebase the skill is grounded in, and the subject the skill describes. The Skill Audit Loop re-grounds a skill against both. It is what keeps a skill true to its declared `grounding.truth_sources` once time has passed — whether a maintainer runs it across a whole library or an adopter runs it against their own repo.
>
> The loop adapts two useful patterns:
>
> - From [Karpathy's `autoresearch`](https://github.com/karpathy/autoresearch): a tight loop with a constrained action surface, a fixed experiment, a measurable result, and keep-or-revert pressure.
> - From [Stanford d.school design thinking](https://dschool.stanford.edu/resources/design-thinking-bootleg) and [IDEO's design thinking framing](https://designthinking.ideo.com/faq/isnt-design-thinking-a-set-step-by-step-process): human-centered iteration through discovery, framing, ideation, prototyping, testing, and loop-back when evidence changes the problem.
>
> For skills, the loop is:
>
> 1. Pick a skill or project area.
> 2. Gather evidence: the `SKILL.md`, eval files, manifest entry, related skills, and `grounding.truth_sources`.
> 3. Run deterministic checks first: schema lint, relation integrity, manifest validation, routing evals, overlap checks, and drift checks.
> 4. Audit the skill as a contract: activation, boundaries, taxonomy, grounding, examples, anti-examples, and verification partners.
> 5. Fix the skill or its metadata when the evidence supports the change.
> 6. Re-run checks and record the new state.
> 7. Move to the next skill or loop back if the fix changed the graph.
>
> This is not "self-improving skills" as a slogan. It is a re-grounding loop with evidence, constraints, and repeatable checks.

Changes from current text: one new opening paragraph before "The loop adapts
two useful patterns"; the closing line changes "maintenance loop" to
"re-grounding loop" to match the frame. The two bullet references and the
seven-step list are unchanged.

### 2b. SKILL_AUDIT_LOOP.md — opening (proposed rewrite)

The current opening goes straight to scope ("This document standardizes the
repeatable loop..."). Establish purpose first.

> # Skill Audit Loop
>
> A skill is a contract about a subject, and the contract is only true while the things it was written against still hold. The codebase a skill is grounded in changes. The subject a skill describes changes. The Skill Audit Loop is the procedure that re-grounds a skill against both — it checks a skill's declared `grounding.truth_sources` against current reality and records the result.
>
> This document standardizes that procedure so it can be run repeatably across many skills.
>
> ## Goal
>
> The loop exists to keep each skill true to what it was grounded against, and therefore to keep a skill library healthy over time.
>
> It should continuously detect:
>
> - metadata drift
> - routing drift
> - relation drift
> - stale grounding
> - weak eval coverage
> - portability hazards

Changes from current text: two new paragraphs before "This document
standardizes..."; the Goal sentence is extended to name the per-skill purpose
ahead of the library-health outcome. The six drift types are unchanged.

## 3. How the loop relates to the other two layers

Short paragraph, suitable for inclusion in README.md or SKILL_GRAPH.md:

> The three layers divide the work cleanly. The Skill Metadata Protocol declares what each skill is grounded against — its `truth_sources`, `grounding_mode`, and `failure_modes`. The Skill Graph operates across the whole library of those declarations, compiling, routing, clustering, and checking them. The Skill Audit Loop is the part of the Skill Graph that re-grounds each skill against its declared sources on a cadence, so the declarations the protocol captured stay true to the reality they point at.

The loop stays inside the Skill Graph layer. It is not promoted to a fourth
layer and not raised above the protocol.

## 4. What does not change

This repositioning is prose only. Explicitly, it does **not**:

- **rename anything** — Skill Metadata Protocol, Skill Graph, and Skill Audit Loop keep their names.
- **change the three-layer model** — SKILL.md format → Skill Metadata Protocol → Skill Graph is unchanged. The loop remains a function of the Skill Graph layer.
- **promote the loop** — the loop is not raised above the protocol or the graph, and the loop is not the product.
- **add or change schema** — no new fields, no new enum values, no `schema_version` bump.
- **add scripts or CLI verbs** — `skill-audit.js`, the five loop phases, and the `skill-graph` binary are untouched.
- **introduce new terms** — the frame is stated entirely in existing protocol vocabulary (`grounding.truth_sources`, `grounding_mode`, `failure_modes`, `freshness`, `drift_check`, `lifecycle`). In particular it does not introduce "concept-shaped skill" or any other new skill category.
- **replace the protocol** — the loop checks declarations; it does not define them. The protocol is still where grounding is declared.
- **claim "self-improving skills"** — the existing disclaimer stays. The loop is a re-grounding procedure with evidence and constraints, not an autonomous improver.
- **change the loop mechanics** — the five phases, the Karpathy and d.school/IDEO references, the cadence table, the artifact contract, and the non-goals are all unchanged.

## 5. Voice check

The proposed prose was checked against the existing README voice:

- **Short declarative sentences.** "The contract is inert on its own." "Two of those things move." Matches the README's "The distinction matters." and "Tags are not a global ontology."
- **"This is not X" disclaimers preserved.** The "self-improving skills" disclaimer is kept verbatim; the new "not an optional polish step" line follows the same pattern.
- **No exclamation, no slogans.** None used.
- **Restraint about novelty.** The frame is explicitly stated as "not a new capability" — consistent with the README's habit of underclaiming ("not a guarantee that every skill is correct").
- **Tables for structured comparison.** The two-axis table follows the existing README pattern of one concept per row.
- **Existing terminology only.** Every field name used (`grounding.truth_sources`, `grounding_mode`, `freshness`, `drift_check`, `failure_modes`, `lifecycle.review_cadence`, `evidence_priority`) appears verbatim in SKILL_METADATA_PROTOCOL.md.
