# Findings

## Skill

`keywords`

## Audit Date

2026-06-01

## Verdict Summary

PASS for structural Integrity Gate; truth and Behavior Gate remain UNVERIFIED because truth sources are external URLs and no graded application eval was run.

## Findings

ID: F1
Severity: HIGH
Surface: `/Users/jacobbalslev/Development/skills/skills/product-domain/keywords/SKILL.md`
Category: Metadata validity
Problem: The skill carried sidecar-owned fields in `SKILL.md`, missed required v8 `scope`, retained legacy `concept`, used `skill_graph_protocol: Skill Metadata Protocol v6`, and exceeded the v8 keyword cap with a very large keyword list.
Evidence: Before repair, `node scripts/normalize-skill-field-shape.js --report --skill keywords` reported 17 fields to relocate, semantic debt for `scope`, and schema-unknown `concept`; `node bin/skill-graph.js lint keywords` reported 19 errors and 1 warning.
Required action: Move loop-owned fields to `audit-state.json`, author scope, remove the legacy concept block, update protocol label after conformance is earned, cap keywords, and re-run lint.
Status: remediated — lint now passes with 0 errors and 0 warnings, and normalization reports 0 remaining work.

ID: F2
Severity: HIGH
Surface: `/Users/jacobbalslev/Development/skills/skills/product-domain/keywords/SKILL.md` grounding and Amazon guidance
Category: Source freshness
Problem: The skill used stale Seller Central forum URLs and stated Amazon search terms as a hard 250-byte constraint, while current public Seller Central guidance includes newer title guidance and search-term guidance that should be verified in the current field before publication.
Evidence: Pre-repair grounding referenced older Seller Central discussion URLs; body said "Amazon search terms are limited to 250 bytes" and checklist said "current byte limits." Current source review on 2026-06-01 found newer Seller Central public guidance for 2025 title requirements and search terms.
Required action: Update Amazon truth sources and reword body/checklist guidance to avoid overclaiming byte-vs-character enforcement across marketplaces or account surfaces.
Status: remediated.

ID: F3
Severity: MEDIUM
Surface: `/Users/jacobbalslev/Development/skills/skills/product-domain/keywords/SKILL.md` relation metadata
Category: Relation quality
Problem: Relation comments still described the older six-edge vocabulary and pending `boundary` rename.
Evidence: Pre-repair metadata said "Six edge types" and "rename to `suppresses` pending ADR-0018".
Required action: Refresh relation comments to the current relation field set and keep boundary reason text in ownership form.
Status: remediated.

ID: F4
Severity: MEDIUM
Surface: `/Users/jacobbalslev/Development/skills/skills/product-domain/keywords/evals/comprehension.json`
Category: Eval artifact coverage
Problem: The skill declared eval intent but had no local comprehension eval under its skill directory.
Evidence: Pre-repair sidecar state was `eval_artifacts: planned`; the skill directory contained only `SKILL.md`.
Required action: Add a local comprehension eval covering definition, mental model, boundaries, misconception, and application workflow.
Status: remediated — local eval exists and parses as JSON.

ID: F5
Severity: LOW
Surface: `node scripts/skill-graph-drift.js --json ../skills/skills/product-domain/keywords`
Category: Drift sentinel limitation
Problem: All grounding sources are external URLs, so the zero-dependency drift sentinel cannot hash them.
Evidence: Drift output reports `status: "EXTERNAL_UNHASHED"` for Etsy Help, Amazon Seller Central, Google Search Central, and Shopify Help sources.
Required action: Leave `truth_verdict` as `UNVERIFIED` until a snapshot/hash or graded source-review receipt exists.
Status: accepted.

ID: F6
Severity: INFO
Surface: `/Users/jacobbalslev/Development/skills/skills/product-domain/keywords/audit-state.json`
Category: Behavior Gate
Problem: No graded comprehension or application run was executed, so behavior certification cannot be claimed.
Evidence: `node bin/skill-graph.js audit keywords --force` ran in Integrity-only mode and said to re-run with `--graded` to populate behavior verdicts.
Required action: Leave `comprehension_verdict` and `application_verdict` as `UNVERIFIED` until a graded run produces receipts.
Status: accepted.

## Verification Evidence

- `node bin/skill-graph.js lint keywords` — PASS, 0 errors, 0 warnings.
- `node scripts/normalize-skill-field-shape.js --report --skill keywords` — 0 fields to relocate, 0 semantic debt fields.
- `node scripts/check-markdown-links.js ../skills/skills/product-domain/keywords/SKILL.md` — OK.
- `node -e "JSON.parse(...audit-state.json); JSON.parse(...evals/comprehension.json)"` — JSON OK.
- `node scripts/skill-graph-drift.js --json ../skills/skills/product-domain/keywords` — `EXTERNAL_UNHASHED` for external URL truth sources.
- `node bin/skill-graph.js audit keywords --force` — Integrity-only audit ran lint PASS and drift EXTERNAL_UNHASHED.
