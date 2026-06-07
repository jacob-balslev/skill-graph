# SKILL.md Format Compatibility

> Read this if you need to know how Skill Graph projects richer protocol
> metadata back to the plain `SKILL.md` format.

Skill Metadata Protocol is not a replacement for `SKILL.md`. It is a stricter
authoring and operations contract that can be exported back to a plain
`SKILL.md` runtime artifact.

The export shape keeps a small top-level field set: `name`, `description`,
optional `license`, optional `compatibility`, optional `metadata`, and optional
`allowed-tools`.

## Compatibility Direction

| Source | Target | Automated? | Notes |
|---|---|---|---|
| Plain `SKILL.md` | Skill Metadata Protocol | No | Requires authoring the required protocol fields and deciding scope, Evaluation Status, relations, and grounding. |
| Skill Metadata Protocol | Plain `SKILL.md` | Yes | `scripts/export-skill.js` writes a projected `SKILL.md` artifact. |
| Exported `SKILL.md` | Skill Metadata Protocol | No | The export is lossy for rich types because `metadata` values are strings. Keep the source Skill Metadata Protocol file authoritative. |

## Export Shape

`scripts/export-skill.js` emits at most these top-level fields:

```yaml
---
name: documentation
description: "Use when writing reference docs..."
license: MIT
compatibility: "Markdown, Git"
allowed-tools: Read Grep
metadata:
  schema_version: "4"
  type: capability
  drift_check: "{\"last_verified\":\"2026-04-17\"}"
---
```

Export rules:

| Skill Metadata Protocol source | Plain `SKILL.md` output |
|---|---|
| `name` | Top-level `name`. |
| `description` | Top-level `description`. |
| `license` | Top-level `license` when present. |
| `compatibility` object | Top-level `compatibility` string, flattened from `runtimes`, `node`, and `notes`. |
| `allowed-tools` or `allowed_tools` | Top-level `allowed-tools` string. |
| All protocol extension fields | `metadata.<field>` string values. Objects and arrays are JSON-encoded strings. |

The JSON encoding is deliberate: the plain export uses a string-to-string
`metadata` map. Emitting nested YAML objects would preserve structure but would
stop being the simple portable export shape.

## Marketplace Surface

`scripts/export-marketplace-skills.js` builds the public marketplace surface from
the canonical `skills/` library:

```bash
node scripts/export-marketplace-skills.js
```

The output goes to `marketplace/skills/<name>/SKILL.md`. Each generated file is a
plain `SKILL.md` export, not a Skill Metadata Protocol source file. The generator
adds factual provenance under `metadata`:

```yaml
metadata:
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: "Skill Graph"
  skill_graph_canonical_skill: "skills/<name>/SKILL.md"
```

`skill_graph_protocol` is intentionally not emitted. It was retired from the
marketplace surface because it looked like a content-conformance claim while the
exporter could only prove source provenance.

The marketplace generator also applies export-specific descriptions only for
skills whose canonical descriptions exceed the 1024-character Agent Skills
description limit. The canonical source descriptions stay unchanged.

## Verify Exports

Run:

```bash
node scripts/verify-skill-md-export.js
```

or through npm:

```bash
npm run export:verify-skill-md
```

The verifier rebuilds every `skills/*/SKILL.md` export in memory and checks:

- only plain export fields exist at the top level
- required top-level fields are present as strings
- `allowed-tools` is a string when present
- `metadata` is a string-to-string object

It does not impose description, body, title, or name-length limits.

For a generated plain export surface, validate the files as written:

```bash
node scripts/verify-skill-md-export.js --plain marketplace/skills
```

Use the marketplace gate to verify shape, description limit, provenance, privacy
scan, and generated-surface freshness together:

```bash
node scripts/export-marketplace-skills.js --check
```

## Common Failure Modes

| Failure | Fix |
|---|---|
| Required base field is missing | Fix the source identity field or the export transform. |
| Rich protocol metadata appears nested under `metadata` | Regenerate with `scripts/export-skill.js`; structured values must be JSON strings in the exported artifact. |

## Policy

The source `SKILL.md` remains the protocol artifact. The exported `SKILL.md`
file is a runtime artifact. Do not hand-edit exported files and then treat them
as canonical protocol sources.
