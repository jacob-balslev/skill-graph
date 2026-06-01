# Audit Verdict

## Skill

`semantic-relations`

## Audit Date

2026-06-01

## Integrity Gate

PASS_WITH_FIXES

## Behavior Gate

UNVERIFIED

## Rationale

The deterministic audit completed on 2026-06-01. The skill passes canonical-source lint with one warning:

- 4 top-level field(s) missing field-purpose comment (skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md § Inline field comments). Run `node scripts/backfill-field-purpose-comments.js` to add.

The truth gate is UNVERIFIED, not BROKEN: the skill is grounded in external universal sources and `skill-graph audit semantic-relations --force` reported `drift: EXTERNAL_UNHASHED`, so source hash comparison cannot certify the current external documents.

The behavior gate is UNVERIFIED because this skill has no comprehension/application eval artifacts yet. That is an honest state, not a content defect.

Human review found the instructional body, activation, relation graph, and portability sound. The remaining content issue is stale comment-only guidance in `SKILL.md` that still describes sidecar-owned fields and a Health Block as if they lived in frontmatter.

## Follow-up State

Fixes deferred — field-purpose comments, behavior-gate eval artifacts, external-source truth verification policy, and stale sidecar-comment cleanup are queued for focused follow-up work rather than patched ad hoc in this audit run.
