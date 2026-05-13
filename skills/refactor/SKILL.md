---
name: refactor
description: "Use when reorganizing existing code without changing external behavior — extracting functions, reducing duplication, renaming for clarity, splitting modules, or tightening structure. Covers behavior preservation, duplication reduction, decomposition, naming improvements, structural reorganization, and before/after verification. Do NOT use for bug investigation, adding new product behavior, or writing documentation (even when the docs describe the refactored code)."
license: MIT
compatibility: "Markdown, Git, any codebase"
allowed-tools: Read Grep Bash
metadata:
  schema_version: "3"
  version: "1.0.0"
  type: workflow
  browse_category: engineering
  scope: portable
  owner: skill-graph-maintainer
  freshness: "2026-04-18"
  drift_check: "{\"last_verified\":\"2026-04-18\"}"
  eval_artifacts: present
  eval_state: passing
  routing_eval: present
  stability: experimental
  keywords: "[\"refactor\",\"cleanup\",\"simplify\",\"extract function\",\"reduce duplication\",\"clean this up\",\"simplify this\",\"rename this\",\"split this file\",\"too long function\",\"duplicated logic\",\"decompose function\",\"decompose code\",\"decompose long\",\"split by responsibility\",\"behavior preserving\",\"rename module\",\"rename utils\",\"messy code\",\"messy suite\",\"extract helper\",\"extract duplicated\",\"consolidate logic\",\"tighten structure\"]"
  triggers: "[\"refactor-skill\"]"
  examples: "[\"this 600-line function is hard to reason about — decompose it while keeping tests green\",\"extract the duplicated validation logic from these three handlers into a helper\",\"rename this module from `utils` to something that describes what it actually does\",\"split this file by responsibility; no behavior changes, tests must still pass\"]"
  anti_examples: "[\"the test is failing after my edit — what did I break?\",\"write an architecture note explaining this pattern for new team members\",\"reproduce why this function retries three times on transient network errors\"]"
  relations: "{\"boundary\":[{\"skill\":\"documentation\",\"reason\":\"documentation is prose about the code; refactor is behavior-preserving changes to the code itself\"},{\"skill\":\"debugging\",\"reason\":\"debugging chases an observed failure; refactor runs only with a green test suite and preserves behavior\"}],\"verify_with\":[\"testing-strategy\"],\"depends_on\":[{\"skill\":\"testing-strategy\",\"min_version\":\"^1.0.0\"}]}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v3
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/refactor/SKILL.md
---

# Refactor

## Coverage

- Behavior preservation: identifying the external contract that must remain stable before any change
- Duplication reduction: consolidating repeated logic without over-abstraction
- Decomposition: extracting functions, modules, or types to improve readability and reuse
- Naming improvements: renaming so identifiers carry their real meaning
- Structure improvements: reorganizing file and module boundaries when the current layout obscures intent
- Verification before and after: running the same behavioral checks on both sides of the change

## Philosophy

Refactoring pays off only when the shape of the code has diverged from the shape of the problem. Before that point it is risk without reward — every move invites a regression, and "cleaner" is a preference, not a justification. The honest test for a legitimate refactor is not "this feels better" but "the next concrete change will be materially easier because of this one." If you cannot name the next change, stop — you are rearranging, not refactoring, and the safest rearrangement is none.

## Workflow

Each step decides whether to continue, split, or stop. "Stop" is always a valid answer; speculative refactoring is a failure mode, not a signal of ambition.

| Step | Ask | If yes | If no |
|---|---|---|---|
| 1. Contract | What externally observable behavior must stay the same? | Write it down as a test suite or explicit checklist | Stop — you cannot refactor what you cannot pin down |
| 2. Next-change justification | Can you name one concrete pending change that becomes easier because of this refactor? | Go to step 3 | Stop — you are rearranging for taste, not improving the codebase |
| 3. Smallest useful cut | What is the smallest structural change that moves toward the next-change goal? | Make only that change | Split into sequential cuts; do not change multiple abstraction layers at once |
| 4. Behavior re-verify | Does the contract from step 1 still hold exactly? | Commit | Revert; the refactor was not behavior-preserving. Start over smaller |
| 5. Stop condition | Have you made the next change materially easier than it would have been before? | Done | Do not keep going — refactoring beyond the next change is speculative waste |

### When to back out

- A green test from before the refactor is now red → revert immediately, then cut smaller.
- The next-change goal shifted during the refactor → restart at step 2 with the new goal before continuing.
- The refactor requires touching more than one abstraction layer in a single commit → split into per-layer commits and re-verify each.

## Evals

This skill ships a comprehension-eval artifact at [`examples/evals/refactor.json`](https://github.com/jacob-balslev/skill-graph/blob/main/examples/evals/refactor.json). The `Verification` checklist below is the authoring gate for a completed refactor; the eval file is how this skill is graded by `scripts/skill-audit.js --graded`. Do not conflate them — the checklist is for the engineer, the eval is for the grader.

## Verification

- [ ] External behavior is unchanged — same tests green before and after
- [ ] The named next change is now demonstrably easier, not merely "more possible"
- [ ] No new abstraction was introduced speculatively (no "future-proofing" without a named consumer)
- [ ] Each commit is a single structural change, not a bundle of rearrangements

## Do NOT Use When

| Use instead | When |
|---|---|
| `debugging` | The task starts from a failing behavior, not from structural cleanup |
| `documentation` | The task is rewriting docs — even docs about the refactored code — it belongs to a separate commit and skill |
| `testing-strategy` | The task is designing a new test suite; the refactor's own tests should already exist before step 1 |
