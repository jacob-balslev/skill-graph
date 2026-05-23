# Skill Graph — Generated Status

> **Generated:** 2026-05-23T14:49:49.801Z
> **Generator:** `node scripts/build-status-doc.js` (regenerate; never hand-edit)
>
> This file is the single-source-of-truth status snapshot for the project's
> trust surface. Each value below is pulled from a deterministic origin:
> `package.json`, `schemas/skill.schema.json`, the generated manifest, ADR
> 0009, and the live exit code of each check script.

## Identity

| Field | Value | Source |
|---|---|---|
| Package name | `@skill-graph/cli` | `package.json` |
| Package version | `0.5.8` | `package.json` |
| Node engine | `>=20.0.0` | `package.json` |
| Active schema version | `7` | `schemas/skill.schema.json` |
| Skill count (manifest) | `144` | `skills.manifest.json` |
| Mirror status | docs-only mirrors per ADR 0009 (2026-05-18) | `docs/adr/0009-sibling-repo-deprecation.md` |

## Checks

| Check | Status | Duration | Last line |
|---|---|---|---|
| check-markdown-links | ❌ FAIL | 210 ms | FAIL markdown links: 1 broken local link(s) in active docs (0 in _archived/ ignored — use --strict-archived to elevate) |
| check-protocol-consistency | ✅ PASS | 144 ms | PASS: all protocol consistency checks passed. 0 warning(s). |
| check-doc-drift | ✅ PASS | 72 ms | OK   doc drift sentinel: 74 active doc(s) scanned against schema v7 |
| check-mirror-freeze | ✅ PASS | 54 ms | WARN mirror not found: /Users/jacobbalslev/Development/skill-metadata-protocol |

## How to refresh

```bash
node scripts/build-status-doc.js
```

`docs/status.generated.md` is regenerated and overwritten each run. CI
should commit the regenerated file alongside any code that affects the
underlying values (package version bump, schema bump, new lint check,
etc.).

## What this replaces

- Hand-maintained "Latest release" lines in README hero sections (drifted three minor versions in Phase 1).
- Ad-hoc "skill count" claims scattered across docs (drifted from 137 → 141 → 145 in Phase 1 alone).
- Manual "we run these checks" lists in CONTRIBUTING.

The reader is now one URL away from the truth.
