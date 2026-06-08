# Proposal — Separate Audit/Eval/Provenance State into a Sidecar JSON

> Status: **ACCEPTED (2026-06-01)** via [ADR-0019](../adr/0019-audit-state-sidecar-separation.md).
> Type: SYSTEM (schema + protocol contract + consumers). Filed: 2026-06-01. Decision owner: project owner.
> Implementation scoped in [`docs/plans/audit-state-sidecar-implementation.md`](../plans/audit-state-sidecar-implementation.md).
> The 6 Open Questions below are RESOLVED in ADR-0019 § Open-question resolutions (defaults, overridable
> before implementation).
> Source: the field-relevance benchmark + three user directives (2026-06-01) — see
> `benchmarks/field-relevance/FIELD-PLACEMENT-MODEL.md` (the deliverable) and
> `benchmarks/field-relevance/CONCEPTUAL-MODEL.md` (the conceptual basis).
> Companion ADR: [ADR-0019](../adr/0019-audit-state-sidecar-separation.md).
> Subsumes: [`skill-dimensional-coverage.md`](skill-dimensional-coverage.md) Finding 2 — the
> comprehension *prose* (frontmatter) vs comprehension *evaluation* (sidecar) split is the same cut.
> Do NOT implement inline — on acceptance this cascades through SYSTEM-mode schema work + the audit
> loop, never a schema+N-skills mega-edit.

## Summary

The `SKILL.md` frontmatter currently carries **two kinds of fields that serve two different
consumers at two different moments**, fused into one block:

1. **Agent-facing content** — what the everyday agent needs to *find, understand, and execute* the
   skill (identity, classification, activation, relations, the 5 Understanding **prose** fields,
   scope, grounding, `allowed-tools`).
2. **Audit-loop state** — the Skill Audit Loop's records *about* the skill (the four verdicts,
   `eval_*`, `comprehension_state`, `drift_*`, `lint_verdict`, freshness, `schema_version`/`owner`/
   provenance). The everyday agent never reads these.

**Proposal: move the audit-loop state out of the agent-facing `SKILL.md` frontmatter into a sidecar
JSON in the skill folder** (alongside the existing `comprehension.json` / `application.json` eval
artifacts). The frontmatter keeps only what the agent consumes.

## Why this is the right cut (conceptual, not corpus-derived)

The decision is **conceptual** — it follows from *who consumes each field*, a fact about the
system's design, not from any measurement over the legacy corpus. (The corpus was authored before
the system; per the benchmark's methodology corrections, it cannot prove a field's concept.)

The cut, one test per field: *does the everyday agent need to **see** this field to **find**,
**understand**, or **execute** the skill?* — yes → frontmatter; no (it only tells the audit loop
whether the skill is healthy/honest/fresh/published) → sidecar. The full per-field classification
(all 56 fields, completeness-checked) is in `field-placement.json`:

- **25 frontmatter** (agent-facing)
- **28 sidecar** (audit/eval/provenance) — **8 of them schema-required today**
- **2 deprecated/alias** (`concept`, `allowed_tools`)
- **1 unresolved** (`routing_bundles` — 0-consumer; library-level config decision)

### This makes the SYSTEM/CONTENT boundary physical

The split *is* the project's SKILL-SYSTEM-WORK vs INDIVIDUAL-SKILL-WORK boundary, expressed as a
file boundary:

| File | Holds | Mode | Written by |
|---|---|---|---|
| `SKILL.md` (frontmatter + body) | the skill's authored content | **CONTENT** | authoring / `/audit:improve` |
| sidecar JSON | the audit loop's records about the skill | **SYSTEM-output** | only `/audit:*` |

Mixing SYSTEM and CONTENT in one commit is the project's #1 recurring failure
(`AGENTS.md § Work Modes`). Today they share one frontmatter, which *forces* the mixing. After the
split, a content edit touches `SKILL.md` and an audit run touches the sidecar — the boundary is
enforced by the filesystem, not by discipline. The pre-commit work-mode warning
(`check-work-mode-separation.js`) becomes a backstop instead of the primary guard.

### Consistent empirical note (not the basis)

The 2026-05-29 behavioral A/B stripped exactly this audit/eval/provenance set and measured **no
agent-behavior change** (p=0.65) — because the agent never reads them. This *corroborates* "invisible
to the everyday workflow → sidecar" without the decision resting on the legacy corpus.

## Design

### The sidecar artifact

A new per-skill file — working name `audit-state.json` (final name TBD; see Open Questions) — in the
skill folder beside `comprehension.json` / `application.json`. It carries the 28 audit/eval/provenance
fields. Shape governed by a new `schemas/skill-audit-state.schema.json` (Tier-1 binding contract).

### What moves to the sidecar (28)

Provenance: `schema_version`, `version`, `owner`, `urn`, `repo`. Dates/audit: `freshness`,
`reviewed_at`, `last_audited`, `last_changed`, `drift_check`, `drift_status`, `lifecycle`. Verdicts:
`structural_verdict`, `truth_verdict`, `comprehension_verdict`, `application_verdict`, `lint_verdict`.
Eval: `eval_artifacts`, `eval_state`, `routing_eval`, `eval_score`, `eval_failed_ids`,
`eval_last_run`, `eval` (legacy), `comprehension_state`. Distribution-internal: `marketplace_tier`,
`portability`. Runtime: `runtime_telemetry`.

### What stays in frontmatter (25)

`name`, `description`, `subject`, `subjects`, `taxonomy_domain`, `deployment_target`, `scope`,
`grounding`, `project`, `keywords`, `triggers`, `examples`, `anti_examples`, `paths`, `relations`,
`mental_model`, `purpose`, `boundary`, `analogy`, `misconception`, `allowed-tools`, `license`,
`compatibility`, `stability`, `superseded_by`.

### The manifest joins both

The router's *quality gate* reads `structural_verdict`/`eval_state`/`application_verdict` to
demote/exclude skills. After the split those live in the sidecar, so **`generate-manifest.js` compiles
the manifest from frontmatter + sidecar**. The agent reads `SKILL.md`; the system's router reads the
compiled manifest. The verdicts are out of the agent-facing file but still reach the router — the
split holds.

## Implementation path (on acceptance — separate SYSTEM work, sequenced)

**SYSTEM (one coherent change, no SKILL.md edits):**
1. Author `schemas/skill-audit-state.schema.json` for the 28 fields.
2. Remove those fields from `schemas/SKILL_METADATA_PROTOCOL_schema.json`; **de-require** the 8
   currently-required ones (`schema_version, version, owner, freshness, drift_check, eval_artifacts,
   eval_state, routing_eval`) from frontmatter; require them in the sidecar schema.
3. Update consumers: `generate-manifest.js` (join frontmatter + sidecar), `skill-lint.js`,
   `export-marketplace-skills.js` (already strips most), the audit-loop writers in `lib/audit/*` (now
   write the sidecar), `skill-graph-drift.js`, the router's health-gate reads (via the manifest).
4. Update protocol docs (`SKILL_METADATA_PROTOCOL.md`, `field-reference.md`, `manifest-field-mapping.md`),
   regenerate `field-reference.generated.md`, write the CHANGELOG entry. This is a **major-version-shaped
   cut** — treat per `AGENTS.md § Major Version Is a Clean Cut`.

**CONTENT (per-skill, through the audit loop):** migrate each skill's audit fields from frontmatter into
its sidecar via `/audit:*` — one skill per commit with Audit Status evidence, OR the version-agnostic
field-shape normalizer doing the mechanical move (CONTENT, never a SYSTEM commit). Skills that haven't
migrated fail frontmatter lint with a clear "unexpected audit field in frontmatter" → ONE CONTENT-mode
follow-up ticket the audit loop drains. The SYSTEM change ships independently of corpus migration
(`version-schema-contract.md § Companion rule`).

## Open questions (for the decision owner)

1. **Sidecar filename** — `audit-state.json`? `health.json`? `skill-state.json`? It carries audit +
   eval + provenance + distribution-internal + runtime — "audit-state" undersells provenance.
2. **`grounding` is split-natured** — `truth_source_hashes` is the drift sentinel's input (audit) while
   `subject_matter`/`grounding_mode` are agent-facing scoping. Keep `grounding` whole in frontmatter, or
   move the hash sub-field to the sidecar?
3. **`lifecycle.stale_after_days`** feeds the router's staleness gate; like the verdicts it must reach
   the manifest even though `lifecycle` is audit-owned. Confirm the manifest-join covers it.
4. **`stability`/`superseded_by`** — placed frontmatter because the router gates deprecation. Confirm
   this is agent-facing routing (vs an audit/distribution concern that should be sidecar).
5. **`schema_version` in the sidecar** — the loader needs *a* version to parse. Does the frontmatter
   keep a minimal `protocol_version` for parsing while the audit `schema_version` moves to the sidecar?
6. **`routing_bundles`** — resolve the 0-consumer field (remove, or relocate to library-level config)
   independently; do not let it block this split.

## Completeness

All 56 schema fields classified and accounted for (`field-placement.json`, completeness-gated). No
field dropped; no verdict rests on the legacy corpus. Items excluded: none.
