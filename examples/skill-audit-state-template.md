# Audit-State Sidecar Template (`audit-state.json`)

> Companion to `examples/skill-metadata-template.md`. Per [ADR-0019](../docs/adr/0019-audit-state-sidecar-separation.md), the Skill Audit Loop's records ABOUT a skill — provenance, audit/eval verdicts, drift bookkeeping — live in an `audit-state.json` sidecar at the skill-folder root (sibling of `SKILL.md`), NOT in frontmatter. The audit loop (`/audit:*`) owns this file; a new-skill author seeds the minimal shape below and leaves the verdict fields absent until a real audit/eval run writes evidence.

## Minimal seed (copy alongside your `SKILL.md`)

```json
{
  "schema_version": 8,
  "version": "1.0.0",
  "owner": "your-team-or-handle",
  "freshness": "YYYY-MM-DD",
  "drift_check": {
    "last_verified": "YYYY-MM-DD"
  },
  "eval_artifacts": "none",
  "eval_state": "unverified",
  "routing_eval": "absent"
}
```

`required` (7): `schema_version`, `owner`, `freshness`, `drift_check`, `eval_artifacts`, `eval_state`, `routing_eval`. `version` is optional. Validate against `schemas/skill-audit-state.schema.json`.

## Full field guidance (relocated from the SKILL.md template)

The field-purpose notes for every audit-state field — formerly inline YAML comments on the single-file template — are preserved here:

### `schema_version`

yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.schema.json
============================================================================
SCAFFOLD — this file is a skill template, not a production skill.
============================================================================
Adopters COPY this file to `skills/<new-name>/SKILL.md` and then edit it to
author a new skill. Two distinct comment conventions live in this template
— they have OPPOSITE lifecycles, do not confuse them:
1. Field-purpose comments — short blocks (typically 2-4 lines) immediately
above each field, naming what the field is, its allowed values, and
when-to-use. Example:
# subject: primary browse shelf — what the skill teaches.
# One of twelve closed values: code-engineering / quality-assurance /
# frontend-ui / design-craft / agent-ops / product-domain /
# knowledge-organization / meta-methods / data-analytics.
subject: agent-ops
→ **STAY in the derived skill.** These are the design intent at the
point of authoring. Cold-start agents and human authors read them
instead of opening `skill-metadata-protocol/field-reference.md`. Do NOT strip these.
Canonical source for field-purpose content is `skill-metadata-protocol/field-reference.md`;
the inline comment is the abridged summary. See
`SKILL_METADATA_PROTOCOL.md § Inline field comments — the authoring convention`.
2. `# TEMPLATE NOTE:` comments — authoring scaffolding about HOW to use
the template itself, OR about this specific scaffold (e.g., why
`routing_eval` stays `absent` on the template). Example:
# TEMPLATE NOTE: Be pushy in your description — Claude tends to
# under-trigger skills, so descriptions should read as commands...
→ **STRIPPED on derivation.** Run `grep -n "TEMPLATE NOTE" <derived>`
before commit; the result MUST be zero hits. Every `# TEMPLATE NOTE:`
line and every `> **TEMPLATE NOTE:**` body blockquote is removed.
Field values here are deliberate authoring-time defaults, not aspirational
targets. In particular `eval_artifacts: planned`, `eval_state: unverified`,
and `routing_eval: absent` (see comment on the routing_eval line below)
encode the correct starting state for a brand-new un-verified skill —
flipping them to `present` on this scaffold would make every derived skill
inherit a false attestation until the author noticed.
Build automation treats this file specially: the sample manifest
generator ingests it only under `--include-template`, and the library-wide
harness counts it as the 9th "skill" only when the flag is set. It is NOT
routable in day-to-day skill dispatch. The frontmatter template declares
`deployment_target: project` because it is itself a Skill Graph specimen with
local truth sources; authors choose `portable` or `project` for their derived
skill and keep `project[]` / `repo[]` only when those belonging-entity
references are true.
============================================================================
schema_version: protocol contract version this skill conforms to.
Integer 8. Prior contract retrievable via
`git show schema-v7:schemas/skill.schema.json`.

```yaml
schema_version: 8
```

### `version`

```yaml
version: 1.0.0
```

### `repo`

repo: repos this skill is linked to. Array of {handle, url} objects.
Plural even when most skills have one source repo (federation-ready).

```yaml
repo:
  - handle: skill-graph
    url: https://github.com/jacob-balslev/skill-graph
```

### `owner`

```yaml
owner: skill-graph-maintainer
```

### `freshness`

```yaml
freshness: "2026-04-17"
```

### `drift_check`

drift_check: truth-source verification record. Object with required
`last_verified` (ISO date) and optional `truth_source_hashes`.
Record hashes with: `node scripts/skill-graph-drift.js --record --apply <skill-dir>`.

```yaml
drift_check:
  last_verified: "2026-04-17"
```

### `eval_artifacts`

=== Evaluation Status: three orthogonal axes ===
Introduced in schema_version 2 to split what v1's single `eval_status` enum
collapsed. The three fields answer three different questions and must NOT
be collapsed back into a boolean. See docs/field-rationale.md § eval_artifacts
+ § eval_state + § routing_eval for the design rationale.
eval_artifacts: disk-truth — does an eval file exist on disk?
none (no intent) / planned (intent declared, no file yet) / present (file exists).
`planned` is a temporary state; move to `present` once the artifact ships.
ADR-0005 staleness guard: `planned` past `lifecycle.stale_after_days` warns.

```yaml
eval_artifacts: planned
```

### `eval_state`

eval_state: runtime-truth — has the eval been run and passed?
unverified (no run yet, or no file) / passing (one-shot green) / monitored (cadenced green).
`monitored` is strictly stronger than `passing` — advance here when continuous
cadence runs against this skill. Forward state, not aspirational.

```yaml
eval_state: unverified
```

### `routing_eval`

routing_eval: routing-coverage — is the skill's activation verified by the harness?
absent (not verified) / present (gated by lint check 12; harness must exit 0).
`present` requires populated `examples` + `anti_examples` (below) AND a passing
run of `node bin/skill-graph.js routing-eval --skill <name> --only-asserted`.
See `skill-metadata-protocol/field-reference.md` § `routing_eval` for the full
enforcement contract.
TEMPLATE NOTE: on THIS scaffold, routing_eval MUST stay `absent` even though
the harness happens to report every case passing. The scaffold's job is to
model the correct authoring-time default for a brand-new un-verified skill.
If flipped to `present`, every skill copy-pasted from the scaffold would
inherit a false attestation until the author noticed and downgraded. In your
derived copy, leave this line `absent` at first commit; flip to `present` only
after the harness exits 0 on YOUR skill's own examples + anti_examples.

```yaml
routing_eval: absent
```

### `portability`

portability: external-runtime export claims. Object with:
readiness — `declared` (claim only) / `scripted` (export tooling exists) /
`verified` (proven with a receipt artifact).
targets   — array; currently only `skill-md` is in the enum.
Other runtimes (cursor, windsurf, copilot, agents-md) were removed in 0.3.0
pending working transforms; re-add via RFC + matching transform.
Omit this block if the skill is internal-only.

```yaml
portability:
  readiness: scripted
  targets:
    - skill-md
```

### `lifecycle`

lifecycle: maintenance policy for the drift sentinel.
`stale_after_days` — skill flagged STALE when N days have passed since
`drift_check.last_verified`. Integration skills (third-
party APIs) want shorter; pure-concept skills longer.
`review_cadence`   — process commitment, not a calendar fact — don't lie.
Omit this block if staleness is not meaningful for your skill.

```yaml
lifecycle:
  stale_after_days: 180
  review_cadence: quarterly
```

### `runtime_telemetry`

runtime_telemetry: optional pointer to a JSONL feed of real-world success
/failure receipts so consumers can corroborate or override `eval_state`.
Each receipt carries at minimum `{ timestamp, skill, outcome }`.
`metrics.sample_size` + `metrics.success_rate` are aggregate summaries;
consumers may compute their own from the raw feed.
Omit the entire block when no feedback pipeline exists.

```yaml
runtime_telemetry:
  feedback_source: .skill-graph/telemetry/skill-metadata-template.jsonl
  last_updated: "2026-04-17"
  metrics:
    sample_size: 0
    success_rate: 0
```
