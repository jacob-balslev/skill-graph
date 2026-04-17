# Findings

## Skill

`documentation`

## Audit Date

2026-04-17

## Audit Mode

`--graded` (grader: `node scripts/lib/mock-grader.js`)

## Verdict Summary

PASS WITH FIXES

## Findings

ID: F1
Severity: P3
Surface: frontmatter: triggers
Category: Activation quality
Source: grader (node scripts/lib/mock-grader.js)
Problem: No triggers array is declared; the skill is only discoverable via keyword matching.
Evidence: triggers: (absent from frontmatter)
Required action: Add a `triggers: [documentation-skill]` entry so label-based routers can activate the skill deterministically.

ID: F2
Severity: P2
Surface: skill body
Category: Content quality
Source: grader (node scripts/lib/mock-grader.js)
Problem: No explicit `## Do NOT Use When` section; negative routing is only implied.
Evidence: Section headings observed: `# Documentation`, `## Coverage`, `## Philosophy`, `## Verification` — no explicit negative-bounds section.
Required action: Add a `## Do NOT Use When` section listing at least two cases where the skill must not activate (e.g. UI accessibility behavior, runtime debugging).

ID: F3
Severity: P3
Surface: examples/evals/comprehension.json
Category: Eval quality
Source: grader (node scripts/lib/mock-grader.js)
Problem: Eval covers happy-path and boundary prompts but has no explicit failure-mode eval.
Evidence: Seven prompts, all affirmative; no prompt tests what the skill should refuse.
Required action: Add one failure-mode prompt per skills/evaluation SKILL.md guidance (≥ 1 negative expectation per skill).

## Required Fixes

- Activation quality: PASS WITH FIXES — 1 finding(s) from grader
- Content quality: PASS WITH FIXES — 1 finding(s) from grader
- Eval quality: PASS WITH FIXES — 1 finding(s) from grader
