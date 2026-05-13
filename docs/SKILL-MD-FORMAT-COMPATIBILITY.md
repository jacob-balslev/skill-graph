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
| Plain `SKILL.md` | Skill Metadata Protocol | No | Requires authoring the required protocol fields and deciding scope, eval health, relations, and grounding. |
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
  schema_version: "3"
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

## Common Failure Modes

| Failure | Fix |
|---|---|
| Required base field is missing | Fix the source identity field or the export transform. |
| Rich protocol metadata appears nested under `metadata` | Regenerate with `scripts/export-skill.js`; structured values must be JSON strings in the exported artifact. |

## Policy

The source `SKILL.md` remains the protocol artifact. The exported `SKILL.md`
file is a runtime artifact. Do not hand-edit exported files and then treat them
as canonical protocol sources.
