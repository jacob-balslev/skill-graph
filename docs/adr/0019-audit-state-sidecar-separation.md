# ADR-0019: Separate Audit/Eval/Provenance State into a Per-Skill Sidecar JSON

> Status: **Proposed (2026-06-01)** — awaiting decision-owner acceptance.
> Proposal: [audit-state-sidecar-separation.md](../proposals/audit-state-sidecar-separation.md)
> Companion: [ADR-0017](0017-five-axis-classification-model.md) (v8 classification), the
> field-relevance benchmark (`benchmarks/field-relevance/FIELD-PLACEMENT-MODEL.md`).
> Subsumes the eval-vs-prose half of the dimensional-coverage proposal
> ([`skill-dimensional-coverage.md`](../proposals/skill-dimensional-coverage.md) Finding 2).
> Target version: a major-version-shaped cut (treat per [AGENTS.md § Major Version Is a Clean Cut](../../AGENTS.md)); scheduled independently.

## Status

Proposed. Not yet implemented. This ADR records the decision *to be made*; it does not authorize the
schema/consumer changes, which are sequenced SYSTEM work on acceptance.

## Context

The `SKILL.md` frontmatter fuses two field classes that serve two different consumers at two different
moments:

- **Agent-facing content** (25 fields) — what the everyday agent needs to *find, understand, execute*
  the skill: identity, classification, activation, relations, the five Understanding **prose** fields,
  scope, grounding, `allowed-tools`.
- **Audit-loop state** (28 fields) — the Skill Audit Loop's records *about* the skill: the four
  verdicts, `eval_*`, `comprehension_state`, `drift_*`, `lint_verdict`, freshness,
  `schema_version`/`owner`/provenance. The everyday agent never reads these. **8 of the 28 are
  schema-required in the frontmatter today.**

This fusion has three costs:

1. **It forces SYSTEM/CONTENT mixing.** The project's #1 recurring failure is mixing
   skill-system-work with individual-skill-work in one commit (`AGENTS.md § Work Modes`). When the
   audit loop's records and the skill's authored content share one frontmatter, a single file edit
   inherently touches both modes.
2. **It clutters the agent-facing surface with state the agent ignores.** The 2026-05-29 behavioral
   A/B confirmed stripping exactly this set changes nothing for the agent (p=0.65).
3. **It conflates the *evaluation* of comprehension with the *actual* comprehension.** The Understanding
   prose (what the skill teaches) and the comprehension eval/verdict (the measurement) are different
   artifacts wrongly co-located.

The classification is **conceptual** — derived from which consumer reads each field, not from any
measurement over the legacy corpus (which postdates the system and cannot prove a field's concept; see
the benchmark's methodology corrections).

## Decision

**Move the 28 audit/eval/provenance fields out of the agent-facing `SKILL.md` frontmatter into a
per-skill sidecar JSON in the skill folder**, beside the existing `comprehension.json` /
`application.json` eval artifacts. The frontmatter retains only the 25 agent-facing fields.

This makes the SKILL-SYSTEM-WORK / INDIVIDUAL-SKILL-WORK boundary **physical**: `SKILL.md`
(frontmatter + body) is CONTENT, written by authoring / `/audit:improve`; the sidecar is SYSTEM
output, written only by `/audit:*`. The router's quality gate continues to read the verdicts via the
**compiled manifest** (`generate-manifest.js` joins frontmatter + sidecar), so the verdicts leave the
agent-facing file without leaving the system.

`concept` and `allowed_tools` (snake) are retired/consolidated in the same cut; `routing_bundles`
(0-consumer) is resolved separately and does not block this decision.

## Consequences

**Positive:**
- The SYSTEM/CONTENT boundary is enforced by the filesystem, not by discipline; the work-mode
  pre-commit check becomes a backstop, not the primary guard.
- The agent-facing `SKILL.md` shrinks to what the agent actually consumes — closer to the public
  Agent-Skills shape, smaller context footprint.
- Comprehension prose (frontmatter) and comprehension evaluation (sidecar) are cleanly separated.

**Costs / risks:**
- **Breaking schema change** touching the frontmatter schema, a new sidecar schema, the manifest
  compiler, lint, exporter, drift sentinel, and the `lib/audit/*` writers. Treat as a clean major cut
  (prior contract recoverable via git tag), not a gradual-deprecation dual-shape window.
- **Manifest-join complexity** — the router's quality gate and the `lifecycle.stale_after_days`
  staleness gate now depend on the manifest correctly merging sidecar fields; a join bug would silently
  drop quality gating.
- **Per-skill migration debt** — every existing skill carries the audit fields in frontmatter until
  migrated through the audit loop (CONTENT, one skill per commit). The SYSTEM change ships first and
  goes green on `verify:system`; the corpus drains via `/audit:*` (`version-schema-contract.md §
  Companion rule`). No schema+N-skills mega-commit.
- **`grounding` and `schema_version` are split-natured** (see proposal Open Questions 2 & 5) — needs a
  decision on whether sub-fields cross the boundary.

## Alternatives considered

1. **Status quo (everything in frontmatter).** Rejected — perpetuates SYSTEM/CONTENT fusion and the
   agent-facing clutter.
2. **Hide audit fields under a nested `metadata.audit:` block in the same frontmatter.** Rejected — the
   fields are still in the agent-facing file (still mixable in one commit, still shipped to the agent);
   nesting is cosmetic, not a boundary.
3. **Gradual deprecation (dual-shape window where both placements are valid).** Rejected per
   `AGENTS.md § Major Version Is a Clean Cut` — Skill Graph is a controlled monorepo, not a public API;
   the clean cut + audit-loop migration is the project's pattern.

## References

- Proposal: [audit-state-sidecar-separation.md](../proposals/audit-state-sidecar-separation.md)
- Benchmark deliverable: `benchmarks/field-relevance/FIELD-PLACEMENT-MODEL.md` + `field-placement.json`
- Conceptual basis: `benchmarks/field-relevance/CONCEPTUAL-MODEL.md`
- Work modes: `AGENTS.md § Work Modes — SYSTEM vs CONTENT`
- Major-version discipline: `AGENTS.md § Major Version Is a Clean Cut`
- Version-label discipline: `~/Development/.claude/rules/version-schema-contract.md`
