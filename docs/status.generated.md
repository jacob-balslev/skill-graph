# Skill Graph — Generated Status

> **Generated:** 2026-05-19T03:15:14.675Z
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
| Active schema version | `6` | `schemas/skill.schema.json` |
| Skill count (manifest) | `145` | `skills.manifest.json` |
| Mirror status | docs-only mirrors per ADR 0009 (2026-05-18) | `docs/adr/0009-sibling-repo-deprecation.md` |

## Checks

| Check | Status | Duration | Last line |
|---|---|---|---|
| check-markdown-links | ✅ PASS | 188 ms | OK   markdown links (245 file(s)) |
| check-protocol-consistency | ✅ PASS | 114 ms | PASS: all protocol consistency checks passed. 0 warning(s). |
| check-doc-drift | ✅ PASS | 61 ms | OK   doc drift sentinel: 59 active doc(s) scanned against schema v6 |
| check-mirror-freeze | ✅ PASS | 61 ms | OK   mirror freeze: 50 file(s) scanned across 2 mirror(s); no active-source/package claims found. |

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
