# Field Placement Model — the benchmark's actual conclusion

> The field-relevance benchmark's deliverable. It does **not** rank fields "relevant vs
> irrelevant" via corpus ablation — that was retired (the system was built after the skills;
> the legacy corpus cannot prove a field's concept). It classifies every field by **which
> consumer serves which moment**, which determines **where the field lives**: agent-facing
> `SKILL.md` frontmatter, or an audit-loop sidecar JSON in the skill folder.
> Machine-readable: `field-placement.json` (regenerate: `node field-placement.js`).
> Conceptual basis: `CONCEPTUAL-MODEL.md`. Plan: `docs/plans/field-relevance-benchmark-2026-05-31.md`.

## The cut (one test per field)

> *Does the everyday agent — loading this skill to do dev work — need to **see** this field to
> **find**, **understand**, or **execute** the skill?*
> **YES → frontmatter (agent-facing). NO (it only tells the audit loop whether the skill is
> healthy / honest / fresh / published) → sidecar (audit-loop-facing).**

This cut is **conceptual** (who consumes the field — a fact about the system's design), never
corpus-derived. The one *consistent* empirical note (not the basis): the 2026-05-29 behavioral
A/B stripped exactly the audit/eval/provenance set and found **no agent-behavior change**
(p=0.65) — because the agent never reads them.

## This IS the SYSTEM-work / CONTENT-work boundary, made physical

| Tier | Holds | Is | Written by | Read by |
|---|---|---|---|---|
| **`SKILL.md` frontmatter + body** | identity, description, classification, activation, relations, the 5 Understanding **prose** fields, scope, grounding, `allowed-tools` | **INDIVIDUAL SKILL WORK (CONTENT)** — what the skill teaches & how it's found | skill authoring / `/audit:improve` (content ops) | the everyday agent; the router (activation) |
| **Sidecar JSON** (skill folder, beside `comprehension.json`/`application.json`) | the four verdicts, `eval_*`, `comprehension_state`, `drift_*`, `lint_verdict`, `last_audited`/`last_changed`, `freshness`, `schema_version`/`version`/`owner`/`urn`/`repo` provenance | **SKILL SYSTEM WORK output** — the audit loop's records *about* the skill | only `/audit:*` (the audit loop) | the audit loop; the router's *quality gate* via the compiled manifest |

Splitting them makes the project's #1 recurring failure — mixing SYSTEM and CONTENT in one
commit — physically harder: a content edit touches `SKILL.md`; an audit run touches the sidecar.
The boundary is enforced by the filesystem, not by discipline. It also finishes a pattern already
started — `comprehension.json` / `application.json` are already sidecars; the audit/eval/provenance
*state* joins them.

## Classification (all 56 fields — see `field-placement.json` for the full per-field record)

### FRONTMATTER — agent-facing (25)
`name`, `description`, `subject`, `subjects`, `taxonomy_domain`, `deployment_target`, `scope`,
`grounding`, `project`, `keywords`, `triggers`, `examples`, `anti_examples`, `paths`, `relations`,
`mental_model`, `purpose`, `boundary`, `analogy`, `misconception`, `allowed-tools`, `license`,
`compatibility`, `stability`, `superseded_by`.

- The 5 Understanding fields are the **actual comprehension** (authored prose the agent reads) —
  distinct from the **evaluation of comprehension** (`comprehension.json` + `comprehension_verdict`),
  which is sidecar. Same concept, two artifacts: prose stays, measurement leaves.
- `license`/`compatibility` stay because they are **public Agent-Skills standard** fields that ship
  with the exported skill.
- `stability`/`superseded_by` stay because the **router gates on deprecation** (don't route to a
  deprecated skill) — an agent-facing routing decision, not an audit record.

### SIDECAR — audit-loop-facing (28)
`schema_version`, `version`, `owner`, `urn`, `repo` (provenance); `freshness`, `reviewed_at`,
`last_audited`, `last_changed`, `drift_check`, `drift_status`, `structural_verdict`, `truth_verdict`,
`comprehension_verdict`, `application_verdict`, `lint_verdict`, `lifecycle` (audit); `eval_artifacts`,
`eval_state`, `routing_eval`, `eval_score`, `eval_failed_ids`, `eval_last_run`, `eval`,
`comprehension_state` (evaluation); `marketplace_tier`, `portability` (distribution-internal);
`runtime_telemetry` (runtime-feedback).

- **8 of these are schema-REQUIRED today** (`schema_version, version, owner, freshness, drift_check,
  eval_artifacts, eval_state, routing_eval`) — required in the agent-facing frontmatter, which is
  exactly the clutter to remove. The SYSTEM split must de-require them from frontmatter and require
  them in the sidecar.
- `comprehension_state` is the **flag** (eval/bookkeeping side) — sidecar; the Understanding **prose**
  it gates is frontmatter.

### DEPRECATED / ALIAS — consolidate or remove (2)
`concept` (legacy nested Understanding block, superseded by the 5 flat fields);
`allowed_tools` (snake-case alias — keep kebab `allowed-tools`, the public spelling).

### UNRESOLVED — decide, do not default (1)
`routing_bundles` — 0 acting consumer (P1a). If revived it is **library-level routing config**, not
per-skill frontmatter. A decision, not a default-to-sidecar.

## Implementation path (separate work, not done here)

**SYSTEM (one coherent change):**
1. Author the sidecar schema (a new `schemas/skill-audit-state.schema.json`, or extend the existing
   eval-sidecar concept) covering the 28 audit/eval/provenance fields.
2. Remove those fields from `SKILL_METADATA_PROTOCOL_schema.json`; de-require the 8 currently-required
   ones from frontmatter; require them in the sidecar.
3. Update consumers: manifest compiler (join frontmatter + sidecar so the router's quality gate still
   sees verdicts), lint, exporter (already strips most for marketplace), the audit-loop writers
   (`lib/audit/*` now write the sidecar), drift sentinel.
4. Update protocol docs, `field-reference.md`, an ADR (this is a major-version-shaped cut).

**CONTENT (per-skill, through the audit loop):** migrate each skill's audit fields from frontmatter
into its sidecar via `/audit:*` — one skill per commit with Audit Status evidence, or the
version-agnostic field-shape normalizer (mechanical move only) run as CONTENT. **Never** a
schema+N-skills mega-commit (version-earned + sequencing discipline).

## Honest wrinkles (not hidden)

- **The router reads some sidecar fields** (`structural_verdict`/`eval_state`/`application_verdict`)
  for quality gating — but via the compiled **manifest**, never from the agent-facing `SKILL.md`.
  Agent reads frontmatter; system reads both through the manifest. The split holds.
- **`grounding.truth_source_hashes`** is the drift-sentinel's input (audit), while
  `grounding.subject_matter`/`claim_scope` are agent-facing scoping. `grounding` is placed frontmatter
  but is itself split-natured; a clean implementation may move the hash sub-field to the sidecar.
- **`lifecycle.stale_after_days`** feeds the router's staleness gate, so like the verdicts it must
  reach the manifest even though `lifecycle` is audit-loop-owned.

## Completeness

Examined and classified all **56** schema fields (verified against
`schemas/SKILL_METADATA_PROTOCOL_schema.json` by `field-placement.js`'s completeness gate). Counts:
25 frontmatter, 28 sidecar, 2 deprecated/alias, 1 unresolved. Items excluded: none. No verdict rests
on the legacy corpus.
