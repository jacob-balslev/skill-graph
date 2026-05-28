# Seed Findings (Incomplete)

> This file is a seed artifact from `skill-graph audit` without `--graded`. It records deterministic lint evidence plus explicit TODO review areas. It is not a completed qualitative audit until the TODO sections are replaced by reviewer or grader evidence.

## Skill

`form-ux-architecture`

## Audit Date

2026-05-28

## Verdict Summary

PASS_WITH_FIXES

## Findings

ID: F1
Severity: P2
Surface: ../skills/skills/design-craft/form-ux-architecture/SKILL.md:1:1
Category: Lint diagnostic
Problem: 4 top-level field(s) missing field-purpose comment (SKILL_METADATA_PROTOCOL.md § Inline field comments). Run `node scripts/backfill-field-purpose-comments.js` to add.
Evidence: Emitted by skill-lint.js — see ../skills/skills/design-craft/form-ux-architecture/SKILL.md line 1
Required action: Inspect the flagged line, correct the value, and re-run skill-lint.js.

ID: F2
Severity: TODO
Surface: activation
Category: Activation quality — routing coverage
Problem: TODO — human judgment required
Evidence: TODO — reviewer must inspect the skill body
Required action: Does the description name real trigger scenarios? Are keywords specific and not generic filler? Does the skill under-trigger or over-trigger for its intended use case?

ID: F3
Severity: TODO
Surface: relations
Category: Relation quality — graph correctness
Problem: TODO — human judgment required
Evidence: TODO — reviewer must inspect the skill body
Required action: Do relations point at semantically correct neighbors? Are boundary handoffs crisp enough to prevent misuse? Are broader/narrower claims taxonomic rather than associative? Are dependencies real?

ID: F4
Severity: TODO
Surface: grounding
Category: Grounding quality — claims vs truth sources
Problem: TODO — human judgment required
Evidence: TODO — reviewer must inspect the skill body
Required action: If scope: project (or legacy scope: codebase), do all truth_sources exist? Do claims in the body match the referenced files? Classify any mismatch as skill drift, code drift, or doc drift.

ID: F5
Severity: TODO
Surface: content
Category: Content quality — completeness and density
Problem: TODO — human judgment required
Evidence: TODO — reviewer must inspect the skill body
Required action: Does the skill have a clear Coverage section, a Philosophy section, at least one decision table or checklist, and explicit negative bounds (Do NOT Use When)? Does it contain generic filler that adds no routing signal?

ID: F6
Severity: TODO
Surface: evals
Category: Eval quality — coverage and realism
Problem: TODO — human judgment required
Evidence: TODO — reviewer must inspect the skill body
Required action: Do eval files exist if the skill is expected to be graded? Do they test realistic prompts — not trivia — and cover boundaries and failure cases as well as the happy path?

## Required Fixes

- F1 [P2 warning]: 4 top-level field(s) missing field-purpose comment (SKILL_METADATA_PROTOCOL.md § Inline field comments). Run `node scripts/backfill-field-purpose-comments.js` to add.
