# ADR-0018: Resolve `relations.boundary` Semantic Inversion + Name Collision

> Status: **Both SYSTEM renames landed (2026-06-08), and the zero-use aliases were removed from the canonical schema on 2026-06-13** — `relations.boundary` → `relations.suppresses` and the Understanding-field `boundary` → `concept_boundary`. Runtime readers may keep defensive compatibility fallbacks, but new authored `SKILL.md` frontmatter must use `relations.suppresses` and `concept_boundary`. (Original: Accepted 2026-05-25.)
> Companion: [ADR 0017](0017-five-axis-classification-model.md) (Skill Metadata Protocol v8)
> Source finding: 2026-05-25 multi-model restructure-review F8
>
> ### Update — 2026-06-13: zero-use aliases removed from canonical schema
>
> A direct corpus scan found 0/186 authored uses of `relations.boundary` and 0/186 authored uses of the top-level Understanding `boundary` alias. The canonical frontmatter schema and JSON-LD context no longer accept either alias; `relations.suppresses` and `concept_boundary` are the only authored names. Runtime readers may retain compatibility fallbacks for historical generated data, but those fallbacks are not authoring contract.
>
> ### Update — 2026-06-08: Understanding-field `boundary` → `concept_boundary` SYSTEM rename LANDED
>
> The second rename this ADR called for — the Understanding-field `boundary` → `concept_boundary` (resolving the name collision with `relations.boundary`/`suppresses`) — **landed in the v8 `public`-field schema commit** (`23e13dd`). At that point `schemas/SKILL_METADATA_PROTOCOL_schema.json` declared `concept_boundary` as the canonical Understanding field with the legacy top-level `boundary` retained as a DEPRECATED alias (flat fields won when both were present); `scripts/lib/parse-frontmatter.js` normalized the alias, `lib/audit/evaluate-skill.js` + the concept grader read `concept_boundary`, and `skill-lint.js` checked it in the Understanding-field cross-file rule. The alias remained only until the per-skill CONTENT corpus rename drained; the 2026-06-13 update above records its canonical-schema removal.
>
> ### Update — 2026-06-07: routing-field rename SYSTEM half LANDED (SKI-285)
>
> The `relations.boundary` → `relations.suppresses` rename's **SYSTEM half is implemented** as a deprecated-alias migration (mirroring the existing `relations.adjacent` → `relations.related` pattern), NOT the "v8.1 breaking deprecation-pair within a sunset window" originally drafted below — per `AGENTS.md § Major Version Is a Clean Cut`, intra-version relation renames drain through the audit loop per-skill rather than via a coordinated breaking PR. Landed in this commit:
>
> - **Schema** (`schemas/SKILL_METADATA_PROTOCOL_schema.json`, `schemas/manifest.schema.json`): `relations.suppresses` is the canonical routing-exclusion edge (same item shape as `boundary`); `relations.boundary` was retained as a DEPRECATED alias during the migration window.
> - **Router** (`scripts/skill-graph-route.js` Stage 3): reads `relations.suppresses` first, falls back to `relations.boundary`.
> - **Manifest / exporter / lint** (`generate-manifest.js`, `lib/render-skill-context.js`, `skill-lint.js`): all read `suppresses` with `boundary` fallback.
> - **JSON-LD context** (`schemas/skill.context.jsonld`): during the migration window, both `suppresses` and `boundary` mapped to `sg:disjointOwnership` (property-scoped under `relations`).
> - **Docs**: `AGENTS.md § What the Skill Graph Is`, `skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md § Relations`, and the generated field-reference updated to make `suppresses` canonical.
>
> **Historical open item at the time:** the ~113-skill corpus renames — `relations.boundary` → `relations.suppresses` AND the Understanding-field `boundary` → `concept_boundary` (both CONTENT-mode work, drained per-skill through `/audit:*`). The 2026-06-13 update above records the zero-use corpus state and canonical-schema alias removal.
>
> ### Update — 2026-05-27: temporal framing corrected
>
> The original body of this ADR describes the rename as landing "within the v7 sunset window" (three references). That framing is obsolete: per [AGENTS.md § Major Version Is a Clean Cut](../../AGENTS.md), the v7 → v8 cut is past-tense and no "sunset window" exists. The rename remains valid as a breaking v8.1 change; it is now scheduled independently of any sunset phase.
>
> Body text below is the historical record of the 2026-05-25 decision and is preserved as-authored. When reading § Landing strategy, mentally substitute "scheduled v8.1 PR" for every mention of "within the v7 sunset window" / "alongside the v7-field removal" / "during the v7 sunset" — the rename's correctness is unchanged; only the temporal frame is.

## Context

The `relations.boundary` field has accumulated two distinct, persistent failure modes that the WARNING block in `SKILL_METADATA_PROTOCOL.md § Relations` patches but does not fix:

### 1. Semantic inversion (the name does not match the mechanic)

The field name reads as **deference** ("this skill defers to that one"). The runtime mechanic is **exclusion of the target from co-routing when the declarer wins** (`scripts/skill-graph-route.js` Stage 5: `if (target.score >= declarer.score) skip target`).

Concretely:

- A reader sees `boundary: [skill-B]` on `skill-A` and reasonably concludes "skill-A defers to skill-B."
- The router actually does the opposite: when `skill-A` outscores `skill-B` on a query, it **suppresses** `skill-B` from the result set.
- Authors writing `reason: "use skill-B instead"` (deference framing) document the field as if deference were the mechanic, then the next author edits skill-A confused that the relation is asymmetric and the suppression of skill-B is silent.

The 2026-05-23 boundary-semantics audit confirmed four canonical docs (`SKILL_METADATA_PROTOCOL.md`, `docs/SKILL_METADATA_PROTOCOL_field-reference.md`, `docs/SKILL_METADATA_PROTOCOL_field-decision-guide.md`, `AGENTS.md`) each held their own version of the truth, because none was declared canonical and the WARNING that documents the inversion is itself an admission that the field name is wrong. The current footing — *"the field name lies, but you must memorise the WARNING"* — is non-scalable.

### 2. Name collision with the Understanding `boundary` field

The protocol carries two fields literally named `boundary`:

| Field | Location | Type | Mechanic |
|---|---|---|---|
| **Understanding `boundary`** | top-level (v6+ flat field) | string (prose) | Teaches the *concept's* edges — what the concept is NOT, expressed as a mechanism distinction. Read by the comprehension grader's `boundary` dimension (weight 1.5). |
| **Routing `boundary`** | nested under `relations.boundary` | array of skill names | Score-aware **exclusion** of listed skills from co-routing when the declarer wins. |

They share a name, share a connotation ("edges of this thing"), and disambiguate only by nesting depth. This is a tax on every reader of every skill, every audit pass, every grader prompt that touches either field, and every routing-engine consumer that needs to know which `boundary` they mean. The collision is documented in `SKILL_METADATA_PROTOCOL.md § Understanding § boundary` — again, a WARNING patching what should not exist.

## Decision

In **v8.1** (a single coordinated breaking change within the v7 sunset window), perform both renames atomically:

| Old name | New name | Reason |
|---|---|---|
| `relations.boundary[]` | **`relations.suppresses[]`** | Verb that matches the mechanic. "Skill-A `suppresses` skill-B" is read as "when skill-A wins, skill-B is suppressed from the result set" — which IS the runtime behavior. The WARNING block is no longer needed. |
| Understanding top-level `boundary` (string) | **`concept_boundary`** | Prefix disambiguates from `relations.suppresses[]` and from any future `boundary` use. Preserves the v6 flat-field shape (single string, comprehension-graded). Grader prompts get a new clean field name with no nesting-disambiguation hack. |

### Why these names and not alternatives

| Alternative | Rejected because |
|---|---|
| `excludes[]` for the routing field | Reads as "excludes from what?" — ambiguous. `suppresses` is more specific to the mechanic (suppresses the target in result sets the declarer wins). |
| `defers_to[]` (the misread interpretation) | Would require *also* reversing the runtime semantic. Doing both renames AND the runtime reversal in one PR is two breaking changes welded together; harder to review, harder to roll back, harder to migrate. Keep the runtime mechanic; rename the field to match. |
| `disjointOwnership[]` (the `sg:` JSON-LD predicate) | Too jargony for a top-level frontmatter field. Reserve for the predicate URI; surface a human field name. |
| `not_boundary` / `routing_boundary` | Prefix solves the collision but does not solve the semantic inversion. Both must be fixed in one go. |
| Rename only the Understanding field, keep `relations.boundary` | The semantic inversion is the bigger of the two problems — the failure mode it causes (silent suppression of legitimate alternatives because authors wrote "use skill-B instead") is observed in audit findings, not just theoretical. Solving only the collision and leaving the inversion is rearranging the deck chairs. |

### Why a rename, not a deprecation-pair

A deprecation pair (introduce `suppresses`, leave `boundary` valid for one cycle, then remove) would double the schema surface for one full release cycle. Given v8 itself is already in compatibility-mode with v7 (ADR-0017), stacking a second compat-mode on top *during* the v7 sunset compounds the cognitive load and lint surface. A single coordinated breaking rename within the v7 sunset window — alongside the v7-field removal — keeps the migration to one PR per axis.

### Why **v8.1** and not folded into v8.0

ADR-0017's v8.0 rollout is already a 17-commit PR landing the 5-axis classification model in compatibility mode. Adding `relations.boundary` rename to it would (a) widen the v8 PR review surface materially, (b) couple the classification model migration to a routing-engine field rename that is otherwise independent, and (c) miss the opportunity to validate the v8 schema in production for ≥4 weeks before stacking another breaking change. v8.1 lands AFTER v8.0 has at least one stable release cycle, so the rename can be audited in isolation.

## Landing strategy

### Phase 1 — Schema + tooling (one PR)

1. **`schemas/SKILL_METADATA_PROTOCOL_schema.json`** — add `relations.suppresses` (same shape as current `relations.boundary`). Keep `relations.boundary` valid in v8.0 schemas. Add `concept_boundary` (string). Keep top-level `boundary` valid in v8.0 schemas.
2. **`scripts/lib/parse-frontmatter.js::normalizeFrontmatter()`** — when reading a skill, lift `relations.boundary` → `relations.suppresses` and top-level `boundary` → `concept_boundary` in the normalized representation so all downstream code reads only the new names.
3. **`scripts/skill-graph-route.js`** — Stage 5 reads `relations.suppresses` (with `relations.boundary` fallback during the compat window).
4. **`scripts/skill-lint.js`** — when a skill carries the legacy `boundary` names, emit a `WARN level: rename to suppresses / concept_boundary (ADR-0018)` finding pointing to this ADR. Same severity as the existing v6 `concept.*` nested-block deprecation warning.
5. **`scripts/generate-manifest.js`** — project both names through during compat; consumer-facing manifest field name is `relations.suppresses` only.
6. **`scripts/check-protocol-consistency.js`** — new check: every doc mention of `relations.boundary` (the routing field, not the Understanding field) carries a backlink to this ADR. Prevents doc rot.

### Phase 2 — Corpus migration (one codemod, per-batch commits)

`scripts/migrate-skill-v8-to-v81.js` (new): rename `relations.boundary` → `relations.suppresses` and top-level `boundary` → `concept_boundary` in every SKILL.md. Per AGENTS.md "Version Labels Are Earned, Not Bumped," the codemod ALSO rewrites every `reason:` field on the renamed `suppresses` edges from deference framing ("use [skill] instead") to ownership framing ("I own this exclusively over [skill]") via a small heuristic + manual review. Confidence column on each row; HITL on `low` rows per the ADR-0017 precedent.

### Phase 3 — Doc rewrite (same PR as Phase 1)

1. **`SKILL_METADATA_PROTOCOL.md § Relations § boundary`** — replace with `### suppresses`; the WARNING block is removed because the name now matches the mechanic. Cross-link: "renamed from `boundary` in v8.1 per ADR-0018; see migration notes below."
2. **`SKILL_METADATA_PROTOCOL.md § Understanding § boundary`** — replace with `### concept_boundary`; cross-link the rename.
3. **`docs/SKILL_METADATA_PROTOCOL_field-reference.md`** — both field sections renamed; the field-name-collision footnote is deleted.
4. **`docs/SKILL_METADATA_PROTOCOL_field-decision-guide.md`** — decision rows renamed.
5. **`AGENTS.md § What the Skill Graph Is`** — `boundary` → `suppresses` in the edge type list; one-line note about the rename with backlink to this ADR.
6. **`docs/manifest-field-mapping.md`** — manifest projection name updated.
7. **`CHANGELOG.md`** — v8.1 entry calls out the breaking rename + the codemod path.

### Phase 4 — v8.1 release

After Phase 1+3 lands and bakes for ≥1 week with no regressions, run Phase 2 codemod per-batch (one commit per `subject`), then in v8.1 final release drop the `boundary` aliases from the schema, normalizer, router fallback, and lint warning. The legacy WARNING block is removed from `SKILL_METADATA_PROTOCOL.md` in the same release.

## Consequences

### Positive

- **The runtime mechanic and the field name agree.** New authors no longer need to memorise an inversion. The WARNING block goes away.
- **The collision goes away.** `relations.suppresses` (array of skills) and `concept_boundary` (prose teaching the concept's edges) cannot be confused even by readers who skim. Grader prompts can reference `concept_boundary` by its literal field name with zero disambiguation.
- **Audit findings stop classing this field as a recurring drift source.** The 2026-05-23 "four canonical docs disagree" pattern cannot reoccur for this field because there is no longer an inversion to misdocument.

### Negative

- **One more rename for skills already mid-migration to v8.** Authors who hand-edited v8 frontmatter in the v8.0 window must run the v8.1 codemod (one commit per subject). Mitigated by: codemod is mechanical, lint warns until migrated, and the compat-fallback in the router and schema means stale skills don't break.
- **Three field aliases live simultaneously during the v8.0-to-v8.1 compat window.** `relations.boundary` (legacy), `relations.suppresses` (preferred), top-level `boundary` (legacy), `concept_boundary` (preferred). Mitigated by: window is ≥1 week and ≤1 release cycle; lint surfaces the aliases; the normalizer collapses them to one name internally so consumer code only handles one.

### Neutral

- **The `sg:disjointOwnership` JSON-LD predicate is unaffected.** Predicate URIs are stable across field-name renames; the JSON-LD context maps the new field name to the existing predicate.

## Alternatives considered

### Keep `boundary` and add prose to clarify

Rejected. The WARNING block already exists. It is what is currently in place. The audit evidence is that it does not prevent the failure mode — authors keep writing `reason: "use skill-B instead"` despite the WARNING. A name that matches the mechanic is the structural fix; better docs over a misnamed field are a behavioral fix that does not stick.

### Reverse the runtime mechanic to match the name

Rejected. The `if (target.score >= declarer.score) skip target` mechanic is correct routing behavior — it protects the declarer's wins from being polluted by competing skills the declarer specifically asserts it owns. Reversing it (making `boundary` mean "actually defer when target outscores you") would require every routing eval to be re-baselined, and would also leave the field name carrying two contradictory historical meanings. Rename the field, keep the mechanic.

### Only rename the routing field, leave the Understanding `boundary` alone

Rejected. The collision is structurally bad even if the inversion goes away — two flat-named-`boundary` fields, one nested, one not, will trip up grader prompts and authors indefinitely. Fix both in one PR.

### Defer to a hypothetical v9

Rejected. v9 has no schedule and no driver. Findings deferred to "v9" historically don't get done. The v8.1 window is the natural place for a v8 follow-up.

## Related

- `SKILL_METADATA_PROTOCOL.md § Relations` — the current WARNING block this ADR plans to retire
- `SKILL_METADATA_PROTOCOL.md § Understanding § boundary` — the collision documented at field site
- `scripts/skill-graph-route.js` § Stage 5 — the runtime mechanic the rename matches
- [ADR 0017](0017-five-axis-classification-model.md) — the v8 5-axis classification compat-mode landing; v8.1 follows its precedent for staged breaking changes
- [ADR 0006](0006-revise-predicate-rename.md) — the prior precedent that `boundary` stays canonical for the routing-layer custom predicate `sg:disjointOwnership` (this ADR supersedes the naming half of that decision while preserving the mechanic)
- `.claude/rules/version-schema-contract.md` — the "Version Labels Are Earned, Not Bumped" rule the codemod's reason-text rewrite respects
