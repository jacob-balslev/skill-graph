# Skill Graph Conformance

> Read this if you need to decide how much Skill Metadata Protocol structure a
> skill library should adopt, or if you need to explain compatibility with base
> `SKILL.md`-compatible runtimes.

Skill Metadata Protocol is an authoring and operations superset. Plain
`SKILL.md` remains the runtime portability floor. Conformance is therefore layered:
adopt the smallest level that pays for itself, then move up only when routing,
grounding, evals, or team maintenance need the extra contract.

## Format Map

| Format | Purpose | Valid where |
|---|---|---|
| Plain `SKILL.md` skill | Portable runtime package | `SKILL.md`-compatible runtimes |
| Skill Metadata Protocol skill | Authoring, routing, grounding, and governance | Skill Graph tooling |
| Exported `SKILL.md` skill | Runtime artifact generated from Skill Metadata Protocol | `SKILL.md`-compatible runtimes |

## Levels

| Level | Name | Contract | Typical proof command |
|---|---|---|---|
| L0 | Portable Skill | Valid plain `SKILL.md`: `name`, `description`, optional base fields. | `skills-ref validate <skill-dir>` |
| L1 | Routable Skill | Valid Skill Metadata Protocol frontmatter with enough activation metadata to route and explain selection. | `node scripts/skill-lint.js <skill-dir>` |
| L2 | Grounded Skill | L1 plus `grounding.truth_sources`, `scope: codebase` when appropriate, and a drift baseline. | `node scripts/skill-graph-drift.js <skill-dir>` |
| L3 | Audited Skill | L2 plus eval artifacts, routing examples / anti-examples, and receipts for claimed passing state. | `node scripts/skill-graph-routing-eval.js --skill <name>` |
| L4 | Managed Skill | L3 plus CI, ownership, lifecycle cadence, workspace project mapping, and export verification. | `npm run verify` |

## What Each Level Is For

**L0 - Portable Skill.** Use this for small libraries, personal skills, and
skills that need no cross-skill graph. Do not add protocol fields just to look
complete.

**L1 - Routable Skill.** Use this when descriptions alone are not enough:
overlapping skills, ambiguous prompts, path-based activation, or explicit
`relations.boundary` handoff.

**L2 - Grounded Skill.** Use this when a skill makes claims about real repo
files, APIs, schemas, or operational behavior. The drift hash proves evidence
changed or did not change; it does not prove the skill is semantically correct.

**L3 - Audited Skill.** Use this when `eval_state: passing`,
`routing_eval: present`, or public reuse would otherwise be an unsupported
claim. Lint should be able to find the artifact or receipt behind the metadata.

**L4 - Managed Skill.** Use this for maintained team libraries. L4 is a library
posture, not a requirement that every individual skill carry every optional
field.

## Adoption Rule

Start with one painful skill: the one that misroutes most often, cites repo
truth, or gets reused across projects. Bring that skill to L2 or L3 before
migrating the whole library. The protocol is useful when the metadata changes a
decision a tool can make.

## Related Docs

| Need | Read |
|---|---|
| Base-standard mapping and export rules | [`SKILL-MD-FORMAT-COMPATIBILITY.md`](SKILL-MD-FORMAT-COMPATIBILITY.md) |
| First-skill decision tree | [`ADOPTION.md`](ADOPTION.md) |
| Field-level authoring rules | [`SKILL_METADATA_PROTOCOL_field-reference.md`](SKILL_METADATA_PROTOCOL_field-reference.md) |
| Routing metrics and scaling limits | [`ROUTING-METRICS.md`](ROUTING-METRICS.md) |
