# Proposal — Complete the Skill Audit Loop's fix paths (deterministic `repair` + folded eval cold-start)

> **Status:** Proposal (draft — for discussion, no code yet).
> **Mode:** SYSTEM (audit-loop infrastructure). Building this edits `lib/audit/**`, a command resolver, and `skill-audit-loop/SKILL_AUDIT_LOOP.md`.
> **Date:** 2026-05-28.
> **Origin:** SH-6596 (v8 corpus migration) surfaced that the corpus *cannot be migrated through the loop today*. Rather than bypass the loop with an external script (rejected — the loop must be the only gate for skill changes), this proposal closes the structural gap that makes the bypass tempting.
> **Companion (settled, SYSTEM):** `~/Development/docs/plans/skill-graph-system-side-finish-2026-05-28.md` — the v8 schema is complete; this proposal is about the loop's ability to *apply* it.

## Summary

The Skill Audit Loop has **two gates** (Integrity = deterministic lint/drift; Behavior = measured evals) but only **one fix path** — `improve`, which is LLM-driven and gated on `eval_score`, i.e. a *Behavior*-gate tool. There is **no deterministic fix path for the Integrity gate**: `audit` *detects* shape violations (it even classifies "Schema migration" as a finding) but nothing *applies* the fix. That empty cell is why the v8 corpus migration has no home inside the loop, and why it kept getting pushed toward an external script.

The fix is to make the loop symmetric: add a **deterministic Integrity-gate fix** (the write-counterpart to `lint`) — provisionally `repair`, though it may instead be an `audit --fix` remediation step (see Open Questions). The eval cold-start for never-graded skills is **not** a separate operation — it folds into the existing graded path ("author the eval if absent, then grade"). Net new surface: **one deterministic fix path + one capability (author-eval-if-missing on the graded path).**

## The problem — the loop is asymmetric

| Gate | Signal | **Detect** | **Fix** |
|---|---|---|---|
| **Integrity** (schema shape, lint, drift) | deterministic, binary pass/fail | `audit` (runs on all skills, eval-independent) | **— (empty: this is the gap)** |
| **Behavior** (does it teach?) | measured, `eval_score` 0–5 | `evaluate` / `audit --graded` (needs eval files) | `improve` (LLM rewrite, Karpathy keep-or-revert) |

The Karpathy keep-or-revert inner loop (`improve`: one field → edit → evaluate → keep or revert) is correct **for the Behavior gate** — a continuous metric is exactly what keep-or-revert needs. But the loop tries to use that one tool for everything. A deterministic shape migration (binary lint pass/fail, multi-field, no quality metric to "rise") is a category mismatch for `improve`, so it falls into the empty cell: detected, never fixed.

## Evidence (researched against the live code, 2026-05-28)

- **`improve` requires `evals/evals.json` and skips skills without it** — `lib/audit/run-skill-improvement-loop.js:654-658` (`Skipping ${skillName}: missing evals.json`). Only **19 of 155** skills have that file → the only field-editing operation skips 136 skills.
- **`improve` is LLM-driven + eval-pass-rate-gated** — `runImprover()` spawns a model CLI; `evaluateCandidateGate()` keeps/reverts on eval delta. A shape rename doesn't raise an eval score → would be reverted as "did not improve."
- **`audit` detects but cannot fix the migration** — `lib/audit/skill-audit.js:339` classifies "Schema migration" as a finding category and writes report artifacts + Audit Status; it does not rewrite frontmatter. The `audit` Integrity pipeline is eval-independent and runs on all 155 skills (`skill-audit.js` runLint/runDrift; graders only under `--graded`).
- **No deterministic migration function exists anywhere** in `lib/` or `scripts/` (grep for `migrateSkill`/`normalizeToSchema`/`upgradeSkill` → none).
- **The eval gap is known and planned, not a bug** — `skill-audit-loop/SKILL_AUDIT_LOOP.md:31,73,78`: the runner (`evaluate-skill.js`) is wired; authoring eval data is the "Level 0 → Level 1 lift." Eval-less skills are a content backlog the loop was built to drain, **not** what blocks SH-6596.

**Conclusion:** the corpus genuinely cannot be migrated through the loop today, because the loop has no deterministic Integrity-gate fix path. This is a real system gap, not a content chore.

## Design

### Path A (the real gap) — deterministic Integrity-gate fix

Apply the deterministic fixes `audit` detects. Properties:

- **Deterministic, no LLM.** Driven by a declarative transform map; the correct output is unambiguous. (This is the "codemod" logic, but living *inside* the loop, owned by it — not an external `/tmp` script.)
- **Binary gate, no keep-or-revert.** Accept iff `lint` error count drops (ideally to 0). There is no fuzzy metric — lint passes or it doesn't. The LLM-and-evals machinery (`improve`) is the wrong tool here and is not involved.
- **Eval-independent.** Runs on all 155 skills regardless of eval coverage (Integrity, not Behavior).
- **Through the loop, per-skill commit with Audit Status evidence.** After the fix, re-run `audit` to stamp `structural_verdict`/`last_audited`; commit path-limited per skill (or per subject). Sets `AUDIT_LOOP=1` so the work-mode pre-commit check treats it as sanctioned loop output. No external script — the loop is the gate.
- **Scope-limited "repair catalog."** Only transforms whose output is mechanically determined — NOT open-ended "fix anything." First (only) catalog entry: the v7→v8 shape migration map (below). Judgment-requiring fixes (rewrites, dangling-relation removal, stale-path deletion) are NOT in scope — they stay `improve` or get filed.

**Where it slots:** parallel to `improve` — `audit` (detect) → deterministic Integrity fix for structural findings; `evaluate` (measure) → `improve` (measured Behavior fix) for behavior findings. A correctly-shaped skill then flows through the normal loop (`improve`/`evaluate`) like any other.

### Path B (folded, not a new operation) — eval cold-start

For the 136 never-graded skills, `improve`/`evaluate` can't run because **no eval test exists** — a grader *runs the skill against a pre-written test set*; it does not invent the test. This does **not** need a separate `initial_run` operation. Fold the capability into the graded path: **`audit --graded` / `evaluate` authors `evals/comprehension.json` when absent (LLM, judgment work — per the Part 3 runbook minimum: ≥5 evals across ≥5 of 7 dimensions), then grades it.** One command takes a skill `UNVERIFIED` → graded.

- LLM-driven (eval authoring is inherently judgment) → this is the planned, ongoing L0→L1 lift.
- **NOT required for `npm run verify`** (verify checks shape: lint/manifest/routing/status — never eval presence). So Path B must never gate the shape migration.

### The completed structure

```
                 DETECT                         FIX
Integrity   audit (lint+drift, all skills)   deterministic shape fix (binary)  ← NEW
Behavior    evaluate / audit --graded        improve (LLM, keep-or-revert)
            (authors eval if absent ← NEW capability, Path B)

evolve = audit → [deterministic fix if structural findings]
              → [graded: author-eval-if-missing → evaluate]
              → improve (if behavior-targetable) → evaluate
```

The key clarification (the LLM question): the **shape fix is mechanical — no LLM, no evals, no keep-or-revert.** A plain function applies the same transform to every skill. The LLM only enters *afterward*, for **content** quality (`improve`), on a skill that is already correctly shaped. Two kinds of "wrong" → two different tools: wrong *shape* → deterministic function; wrong *teaching* → LLM + evals.

## The v7→v8 migration map (the deterministic transform — fully specified)

**Both physical encodings** (auto-detect per file):
- **Nested** (152 skills): fields under `metadata:` at 2-space indent; complex values (`grounding`, `relations`, `keywords`, `drift_check`, …) are **single-line JSON strings**; Understanding fields may be multi-line block scalars (`|`).
- **Flat** (3 skills: `methodical`, `task-path-optimization`, `blue-ocean-strategy`): fields at 0-indent. `blue-ocean-strategy` is already v8 (untracked, leave it).

**Transforms:**
1. **Remove** (not in schema; fail `additionalProperties: false`): `type`, `category`, `operation`, `primaryCategory`, `layerPrimary`, `routingRole`.
2. **Rename key:** `domain` → `taxonomy_domain`.
3. **Rename (blanket over whole frontmatter):** `domain_object` → `subject_matter` (appears as JSON-string fragment *and* structured-YAML key; `graph-audit` carries it in **both** a structured top-level block and a metadata JSON-string — both must rename; verified `domain_object` appears only in grounding context, so blanket replace is safe).
4. **Drop** the enum `scope` line; **add** required `deployment_target`.
5. **Comments:** strip field-purpose comment lines at the field indent, then regenerate via `scripts/backfill-field-purpose-comments.js` (already v8-aware: emits `deployment_target`/`taxonomy_domain`/`subject_matter`/free-text-scope comments + the v8 classification divider; add-only + idempotent).
6. **Do NOT bump `schema_version`.** 144 are already `8`; the 8 at `7` validate fine (enum `[7,8]`) — the blocker is `deployment_target`, not the integer. Leaving `schema_version: 7` with v8 fields present is honest "label-behind-content" drift per the version-earned rule; a separate earned bump handles it.

**`deployment_target` derivation rule (deterministic):**
```
deployment_target = project   IF  scope == "project"  OR  grounding_mode == "repo_specific"
                  = portable   otherwise   (portable / workspace / reference / none)
```
Result across the corpus: **2 project** (`quality-assurance/graph-audit`, `agent-ops/skill-router` — both `repo_specific`, both already carry a `grounding` block so the schema's `project ⇒ grounding` rule is satisfied) and **153 portable**. The 48 legacy `scope: workspace` skills are universal-concept skills (`type-safety`, `rendering-models`, `cap-theorem-tradeoffs`, `mental-models`, …) — `portable`, not `project`. The 6 grounded-workspace skills are all `hybrid`/`universal` grounding_mode → `portable`.

**Lint baseline → target:** 155 files, **823 errors, 155 warnings** (errors: `operation` 154, `type` 153, `category` 153, `domain` 133, `domain_object` 35, missing `deployment_target` 155, camelCase trio 6) → **0 errors** after the fix + comment backfill.

## Doctrine reconciliation

- **Loop is the only gate / no external scripts:** the fix *is* a loop operation; runs through `/audit:*`, commits per-skill with Audit Status. The deterministic transform lives inside the loop, not in `/tmp`.
- **Work modes (#16):** building the fix path is SYSTEM; running it on the corpus is sanctioned CONTENT (like `improve`/`evaluate`), `AUDIT_LOOP=1`.
- **Version-earned:** the fix does not bump version labels; it makes skills *validate*, it does not claim earned content.
- **Clean cut (`AGENTS.md`):** the v7→v8 map entry is the one-time codemod; the loop hosts it, then the entry is removed (legacy in git tag `schema-v7`). The fix *framework* stays.
- **Complete-reporting / code-preservation:** the fix touches only the listed shape fields; teaching content, evals, verdicts, `concept` block, and `skill_graph_*` provenance are untouched.

## Scope

- **SH-6596 needs only Path A** (the deterministic Integrity fix + the v7→v8 map). That alone takes the corpus to 0 lint errors and `npm run verify` green.
- **Path B (eval cold-start)** is the separate, larger, ongoing L0→L1 lift — deferred, must not block the migration.

## Open questions for the user

1. **Home for the deterministic fix:** a new `repair` operation, vs. an `audit --fix` remediation step (audit already detects + already has a Diagnostic/Remediation two-mode structure — folding the fix into audit's remediation mode may be simpler than a new operation), vs. a `migrate` utility.
2. Build **Path A only** now (unblocks SH-6596), and file Path B separately? (Recommended.)
3. Commit granularity for the corpus run once the fix exists: per-subject (~9) or per-skill (155)?

## Appendix — corpus inventory (so the SH-6596 data is not lost)

- **155 skills**, repo `~/Development/skills` (branch `main`). Sibling tooling repo `~/Development/skill-graph` (branch `audit-remediation-2026-05-27`).
- **Encodings:** 152 nested, 3 flat (`methodical`, `task-path-optimization`, `blue-ocean-strategy`).
- **scope distribution:** 102 `portable`, 48 `workspace`, 1 `reference` (`code-engineering/acid-fundamentals`), 1 `project` (`quality-assurance/graph-audit`).
- **`schema_version`:** 144 at `8`, 8 at `7`.
- **`repo_specific` grounding (→ project):** `quality-assurance/graph-audit`, `agent-ops/skill-router`.
- **Already v8 / lints clean:** `meta-methods/blue-ocean-strategy` (untracked new skill — leave as-is, not part of the migration commits).
- **Eval coverage:** 19/155 have `evals/evals.json`; 9/155 have `evals/comprehension.json`; 24/155 have an `evals/` dir.
- **`backfill-field-purpose-comments.js`** is already v8-aware (FIELD_COMMENTS: `deployment_target`:92, `scope` free-text:97, `taxonomy_domain`:102, `subject_matter`:195, v8 divider:283) and is add-only + idempotent.
