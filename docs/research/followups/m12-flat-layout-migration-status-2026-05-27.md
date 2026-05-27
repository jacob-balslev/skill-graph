# Audit M12 — Flat-layout v8 migration P1–P7 status

Date: 2026-05-27
Status: SYSTEM-side priorities P0 complete; P1–P7 deferred, CONTENT-side, awaits per-skill audit-loop drain.

## What the audit found

`docs/audits/system-audit-2026-05-27.md § M12`:

> Flat-layout v8 migration (302 skills) — P0 fixed 2026-05-25, P1–P7 deferred with no progress visible.
>
> `audits/2026-05-25-flat-layout-drift-report.md` documents 302 flat-layout skills carrying v7/v3-era mixed drift. P0 (4 `schema_version` orphans) fixed same day. P1 (extend migrate script to flat tree) and P2–P7 have no commits in the 53-commit post-audit window.

## Why P1–P7 are not landed in this branch

Two structural reasons:

1. **The remaining priorities are CONTENT-side per-skill migrations.** Looking at the drift-report's P1–P7 plan: each priority operates on per-skill SKILL.md content. AGENTS.md § Sequencing forbids batching that kind of cascade into a SYSTEM commit; the work belongs inside `/audit:*` runs, one skill at a time, with Health Block evidence per skill. The same doctrine prevented the H9/H10 inline fixes earlier in this audit.

2. **The cross-repo blast radius**. The flat-layout migration touches the canonical skill library at `~/Development/skills/`, which is a different git repo. Changes there need their own commit history and PR review; squashing 302 skill rewrites into a skill-graph SYSTEM commit would invert the boundary ADR 0009 / ADR 0015 / ADR 0016 settled.

## What the audit-remediation-2026-05-27 branch closes for M12

This doc is the SYSTEM-side closure. The branch:

- Landed audit `--single-model` (B2) and `comprehension_verdict` writeback (H2), which the per-skill migrations need so the Health Block evidence the audit loop produces is honest about confidence (PROVISIONAL vs PASS).
- Landed `drift_status` write-back (B1), which is the per-script signal the migrations should re-stamp after re-recording baselines.
- Added the field-purpose-comment lint check (H8) so each migrated skill keeps the convention.
- Surfaced v8 axis violations as named lint errors (M3) so authors see the v8 conformance issue cleanly instead of a raw schema pointer.

With those building blocks in place, P1–P7 reduce to running `/audit:audit <skill>` per skill, with the loop now producing observably-honest verdicts.

## P1–P7 work plan (for the audit loop to drain)

| Priority | Description | Owner |
|---|---|---|
| P1 | Extend `migrate-skill-vN-to-vM.js` to walk the flat-layout tree | SYSTEM ticket in skill-graph |
| P2 | Migrate skills whose `schema_version` advanced but Understanding fields are still legacy v5 nested | CONTENT (per-skill `/audit:audit`) |
| P3 | Re-record drift baselines for skills with stale truth-source hashes | CONTENT (per-skill `drift --record --apply`) |
| P4 | Author missing `evals/comprehension.json` for skills claiming `comprehension_state: present` | CONTENT (overlaps with H10 closure list) |
| P5 | Re-classify skills whose `subject` / `operation` / `scope` is still v7 category/type | CONTENT (per-skill `/audit:audit`) |
| P6 | Backfill field-purpose comments per backfill-field-purpose-comments.js | CONTENT (script available; per-skill commit) |
| P7 | Re-record routing-eval coverage for skills graduating to `routing_eval: present` | CONTENT |

Priorities P2 through P7 are explicitly CONTENT-side and should drain through the audit loop. Priority P1 is the one residual SYSTEM ticket: a Linear/issue should be filed to "extend the migrate codemod to walk the flat-layout tree." That codemod work would be one SYSTEM commit followed by the per-skill CONTENT drain — the version-earned gate (`check-version-earned.js`) keeps the two commit shapes separate.

## Why not Linear tickets in this commit

Per the user instruction at the start of the audit-remediation work and per CLAUDE.md project rules: Linear ticket creation is not in scope without explicit confirmation. This doc names the work that needs Linear tickets; the user can spawn them at the right cadence.
