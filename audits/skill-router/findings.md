# Findings

## Skill

`skill-router`

## Audit Date

2026-05-18

## Audit Mode

Manual audit using `node scripts/skill-lint.js` (absolute path) + `node scripts/skill-graph-routing-eval.js` + body review against `SKILL_AUDIT_CHECKLIST.md`.

> **Workspace note.** `node scripts/skill-audit.js skill-router` run via `SKILL_GRAPH_WORKSPACE=/...skills` reports 6 lint errors because truth-source paths (`scripts/skill-graph-route.js`, `examples/evals/skill-router.*`) exist in the `skill-graph` tooling repo, not the `skills` library repo. Running lint with the absolute path from the `skill-graph` workspace resolves all truth sources correctly and passes clean. The cross-repo resolution gap is a tool limitation — `skill-audit.js` hardcodes `SKILLS_DIR = path.join(REPO_ROOT, 'skills')` rather than using `resolveSkillRoots()`.

## Verdict Summary

PASS WITH FIXES

## Findings

ID: F1
Severity: P2
Surface: scripts/skill-audit.js — cross-repo path resolution
Category: Tool limitation
Problem: When `skill-audit.js` runs via `SKILL_GRAPH_WORKSPACE=/...skills`, it cannot resolve `scripts/skill-graph-route.js`, `scripts/skill-graph-routing-eval.js`, `examples/evals/skill-router.json`, `examples/evals/skill-router.routing.json` or `examples/evals/` because those paths live in the sibling `skill-graph` repo, not the `skills` workspace. The script hardcodes `SKILLS_DIR = path.join(REPO_ROOT, 'skills')` rather than calling `resolveSkillRoots()`.
Evidence: `node scripts/skill-audit.js skill-router` (SKILL_GRAPH_WORKSPACE=/skills) reports 6 lint errors. `node scripts/skill-lint.js /...skills/skills/skill-router` (absolute path from skill-graph): 0 skill-level errors.
Required action: Fix `scripts/skill-audit.js` to use `resolveSkillRoots()` and `resolveTruthSourcePath()` when resolving truth sources. Track as SH-6107 sub-issue.

ID: F2
Severity: P3
Surface: skills/skill-router/SKILL.md — metadata.scope vs grounding.grounding_mode
Category: Grounding fidelity
Problem: The skill declares `scope: portable` but also `grounding_mode: repo_specific` with truth sources pointing to `skill-graph` scripts. A portable skill should not embed repo-specific grounding.
Evidence: `scope: portable` in frontmatter vs `grounding_mode: repo_specific` in grounding JSON.
Required action: Either change scope to `codebase` (honest about what it describes) or change grounding_mode to `portable` and replace truth_sources with abstract references. Defer to next edit cycle.

ID: F3
Severity: P3
Surface: skills/skill-router/SKILL.md — metadata.skill_graph_protocol
Category: Schema migration
Problem: The `skill_graph_protocol` field says "Skill Metadata Protocol v5" but `schema_version` is 6.
Evidence: `skill_graph_protocol: Skill Metadata Protocol v5` alongside `schema_version: 6`.
Required action: Update to "Skill Metadata Protocol v6" in next skill edit.

ID: F4
Severity: P4
Surface: skills/skill-router/SKILL.md — Evals section body
Category: Content quality
Problem: The Evals section says "ships a comprehension-eval artifact as `skill-router.json`" without distinguishing it from the routing eval (`skill-router.routing.json`).
Evidence: Body Evals section references only one file; the directory has two.
Required action: Clarify to name both files and their purposes (comprehension vs routing).

## Required Fixes

- F1 [P2]: Fix `skill-audit.js` cross-repo resolution — create sub-issue (not blocking skill-router pass)
- F2 [P3]: Resolve scope/grounding_mode tension — defer to next edit
- F3 [P3]: Update skill_graph_protocol label v5 → v6 — fix in next edit
- F4 [P4]: Clarify Evals section to label both eval files

## Qualitative Assessment (Human Review)

### Activation quality — PASS

Description is specific and covers trigger scenarios. 25 keywords cover the routing vocabulary. Trigger label enables label-based dispatch. Examples are realistic. Anti-examples correctly name adjacent skills.

### Relation quality — PASS

Boundary relations are crisp and semantically correct. `verify_with: graph-audit` is appropriate. Routing eval 7/7 PASS confirms boundary exclusions work.

### Grounding fidelity — PASS WITH FIXES (F2)

Truth sources exist and are hashed. Routing eval passes 7/7. The scope/grounding_mode tension is a classification issue, not a live defect.

### Content quality — PASS

Coverage, Philosophy, Routing Rules, and Do NOT Use When sections are all present and substantive. No generic filler detected.

### Eval quality — PASS

Both eval files exist in skill-graph. Routing eval 7/7 PASS. Cases cover positive dispatch, boundary exclusions, and coverage-gap scenarios.

### Portability quality — PASS WITH FIXES (F2)

Marketplace export exists. The scope/grounding_mode tension (F2) limits portability in practice.
