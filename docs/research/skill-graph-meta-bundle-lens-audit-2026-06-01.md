# Skill Graph Meta Bundle Lens Audit — 2026-06-01

> Mode: SYSTEM documentation and SYSTEM fixes only. CONTENT audits for individual skills are committed separately through the Skill Audit Loop.
> Scope: apply each available `skill-graph-meta` bundle skill as a lens against the `/Users/jacobbalslev/Development/skill-graph` repo/project.

## Bundle Status

| Skill | Load status | CONTENT audit status | SYSTEM lens status |
|---|---:|---:|---:|
| semantics | loaded | complete | complete |
| doc-updater | missing from local skill roots | blocked | blocked |
| no-cutting-corners | missing from local skill roots | blocked | blocked |

The remaining loaded bundle skills are pending in bundle order.

## Findings Table

| ID | Lens skill | Severity | Surface | Finding | Evidence | Action taken |
|---|---|---:|---|---|---|---|
| SEM-1 | semantics | HIGH | Active docs and CLI help | Several active surfaces used the old meaning that Audit Status lives in `SKILL.md` frontmatter or a “Health Block,” even though ADR-0019 moved audit/eval/provenance state into `audit-state.json`. This creates a false operator signal about where audit/eval commands write. | `AGENTS.md` command table said “Writes to SKILL.md frontmatter”; `bin/skill-graph.js` help said “stamp the SKILL.md Health Block”; `skill-audit-loop/SKILL_AUDIT_LOOP.md` said Audit Status carried verdicts on every `SKILL.md` frontmatter. | Updated `AGENTS.md`, `bin/skill-graph.js`, and `skill-audit-loop/SKILL_AUDIT_LOOP.md` to name `audit-state.json` as the write/read surface. |
| SEM-2 | semantics | HIGH | Authoring docs | Several active onboarding/spec docs still taught the retired single-file required-field set. New authors would put sidecar-owned fields such as `schema_version`, `owner`, `freshness`, `drift_check`, `eval_artifacts`, `eval_state`, and `routing_eval` into `SKILL.md`. | `docs/QUICKSTART-30MIN.md` and `docs/ADOPTION.md` listed the old required fields as SKILL.md/frontmatter fields; `README.md` example included sidecar fields in YAML frontmatter; `docs/concept-map.md` described the old field count. | Split the examples and required-field descriptions into `SKILL.md` frontmatter plus `audit-state.json` sidecar in the active docs. |
| SEM-3 | semantics | MEDIUM | Protocol prose | The normative protocol doc had a correct ADR-0019 top callout but lower sections still used single-frontmatter wording, making the document internally inconsistent. | `skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md` still said every skill is a single `SKILL.md`, described required thirteen fields, and called Audit Status frontmatter state. | Reworded the overview, required fields, health/eval sections, Audit Status section, and authored-vs-loop-owned field list around the two-file contract. |

## Novelty Memo

The useful new observation from the `semantics` lens is that ADR-0019 was implemented in code and partially documented at the top of the protocol, but the old word “frontmatter” persisted in operator-facing surfaces below the fold. That is a semantic drift pattern: the system behavior was right, but the signs users read still pointed at the pre-sidecar model.

## Dissent / Abstain

No dissent on the `semantics` findings. I abstained from editing historical research, archived docs, and old ADR rationale text where stale wording is preserved as historical record rather than current operational guidance.
