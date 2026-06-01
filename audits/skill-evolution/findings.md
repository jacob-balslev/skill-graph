# Skill Audit Findings: skill-evolution

## Skill

`skill-evolution`

## Audit Date

2026-06-01

## Mode

CONTENT audit of `/Users/jacobbalslev/Development/skills/skills/meta-methods/skill-evolution/`.

## Verdict Summary

Integrity Gate: PASS after fixes. Behavior Gate: UNVERIFIED because the comprehension/application graders were not run.

## Evidence Receipts

| Check | Result |
|---|---|
| `node bin/skill-graph.js lint skill-evolution` before repair | FAIL: 30 errors, 1 warning. Missing v8 `subject` and `deployment_target`; retired fields and audit-loop fields were still in `SKILL.md`; deprecated grounding shape remained. |
| `node scripts/normalize-skill-field-shape.js --report --skill skill-evolution` before repair | 16 fields to relocate plus missing v8 classification fields. |
| `node scripts/skill-graph-drift.js --json ../skills/skills/meta-methods/skill-evolution` before repair | BROKEN because old truth sources pointed at removed workspace scripts. |
| `node bin/skill-graph.js lint skill-evolution` after repair | PASS: 0 errors, 0 warnings. |
| `node scripts/normalize-skill-field-shape.js --report --skill skill-evolution` after repair | PASS: 0 fields to relocate, 0 semantic-debt fields. |
| `node scripts/skill-graph-drift.js --record --apply ../skills/skills/meta-methods/skill-evolution` | Recorded six local truth-source hashes. |
| `node scripts/skill-graph-drift.js --json ../skills/skills/meta-methods/skill-evolution` after hash recording | OK: all six truth sources matched recorded hashes. The drift tool wrote `last_verified: 2026-06-02`. |
| JSON parse of `audit-state.json` and `evals/comprehension.json` | PASS. |
| `node scripts/skill/check-version-earned.js skills/skills/meta-methods/skill-evolution/SKILL.md` | PASS: schema label v8 earned. |
| `node scripts/check-markdown-links.js ../skills/skills/meta-methods/skill-evolution/SKILL.md` | PASS. |
| `node scripts/skill/source-truth-catalog.js --skill skills/meta-methods/skill-evolution --deep --json` | PASS for skill evidence paths: 6 key files resolved, 0 broken. Generic code probe additionally reported 2 string-based security-flag candidates and 41 dead-export candidates in live Skill Graph code; those are SYSTEM-lens inputs, not CONTENT defects in this skill artifact. |
| `node scripts/skill/skill-test-runner.js --skill skills/meta-methods/skill-evolution --json` | SKIPPED: no test files found for the key files. |
| `node scripts/skill/claim-extractor.js --skill skills/meta-methods/skill-evolution --json` | PASS: 6 path claims verified, 0 broken. |
| `node bin/skill-graph.js audit skill-evolution --force` | PASS: lint PASS, drift OK; wrote seed artifacts that this completed audit replaces. |

## Findings

| ID | Severity | Surface | Finding | Evidence | Action |
|---|---|---|---|---|---|
| F1 | HIGH | Structure | The skill still used the pre-sidecar/frontmatter shape and could not satisfy the live v8 schema. | Initial lint found 30 errors and 1 warning. Initial normalization found 16 fields to relocate plus missing `subject` and `deployment_target`. | Fixed. Reauthored `SKILL.md` in the nested Agent-Skills-compatible v8 shape; moved audit-loop state to `audit-state.json`; removed retired fields. |
| F2 | HIGH | Grounding | The truth-source contract was stale and pointed at removed workspace scripts instead of the current bundled Skill Graph implementation. | Initial drift was BROKEN for old `scripts/skill/skill-evolution-loop.js`, `scripts/skill/skill-evolution-analyzer.js`, and `scripts/skill/skill-keyword-matrix.js`. | Fixed. Replaced truth sources with current Skill Graph sources and recorded matching hashes for all six local sources. |
| F3 | MEDIUM | Content | The instructional body taught the old Health Block/frontmatter model and a simplified fixed operation sequence. | The previous body described `SKILL.md` Health Block fields as the loop input/output and workspace-root scripts as key files. Current doctrine and code use `audit-state.json`, `skill-graph evolve`, and an analyze/triage/execute/verify/checkpoint loop. | Fixed. Rewrote the body around the current `evolve` command, sidecar write surface, queue driver behavior, failure budget, checkpoints, and corpus-vs-single-skill boundaries. |
| F4 | MEDIUM | Evals | The skill claimed eval artifacts but had no sibling eval file under the canonical nested skill directory. | `skills/meta-methods/skill-evolution/` had only `SKILL.md` before repair. | Fixed. Added `evals/comprehension.json` with eight repo-grounded cases covering definition, mental model, purpose, boundary, taxonomy, analogy, application, and misconception. |
| F5 | LOW | Claim verification | The generic workspace-root claim tooling cannot resolve repo-relative Skill Graph package paths in the body. | Claim extractor initially flagged Skill Graph code paths as broken when they were written as repo-relative body claims. The Skill Graph drift sentinel resolved the same paths correctly from the Skill Graph repo. | Fixed for body claims. Body Key Files and Key Sources now use workspace-relative paths; frontmatter truth sources remain repo-relative for the Skill Graph drift checker. |
| F6 | NONE | Activation | No activation defect remains after repair. | Description, keywords, triggers, examples, anti-examples, and boundaries all target `skill-graph evolve`, corpus walking, auto-improve loops, checkpoints, and sidecar-driven priority. | No CONTENT action required. |
| F7 | NONE | Relations | No relation defect remains after repair. | Relations distinguish `graph-audit`, `skill-scaffold`, `evaluation`, and `eval-driven-development` by mechanism; `verify_with` names relevant sibling skills. | No CONTENT action required. |
| F8 | NONE | Portability | Project grounding is intentional and now explicit. | `deployment_target: project`, `project: skill-graph`, sidecar repo provenance, and truth sources identify the Skill Graph package as the authority. | No CONTENT action required. |
| F9 | DEFERRED | SYSTEM input | The source-truth deep probe reported live-code candidates outside this CONTENT audit's ownership. | Source catalog resolved all six key files, and also reported 2 string-based security-flag candidates plus 41 dead-export candidates in live Skill Graph files. | Deferred to the `skill-evolution` SYSTEM lens against `/Users/jacobbalslev/Development/skill-graph`. |

## Required Fixes

All CONTENT fixes identified in this audit were applied. Remaining Behavior Gate work requires running an independent comprehension/application grader and recording the receipt.
