# Skill Audit — Multi-Model Merge Protocol

> **Canonical location:** `skill-graph/audits/merge-protocol.md` (project-owned per ADR-0016 surface #2; relocated 2026-05-25 from `.opencode/commands/skill-audit-merge-v1.md`).
>
> Portable across OpenCode, Codex, and Claude. Extends [`skill-graph/skill-audit-loop/SKILL_AUDIT_LOOP.md` § Part 3 — Per-Skill Audit Runbook](../skill-audit-loop/SKILL_AUDIT_LOOP.md#part-3--per-skill-audit-runbook) (the project-owned per-skill audit contract) with dynamic claiming and a union-curate merge so several models can audit the same skill and we keep the union of all valuable work. Full design: [`skill-graph/docs/skill-audit-multimodel-merge.md`](../docs/skill-audit-multimodel-merge.md).
>
> **Audit Doctrine** (unchanged from the per-skill contract): evaluate each skill on (1) fidelity to its declared intent and (2) teaching efficacy (`application_verdict`). Lint is a floor, never the goal.
>
> **When this merge flow is mandatory (SH-6344):** skills in the **critical** importance band (worklist `importanceBand: critical`) MUST use this multi-model merge (≥ 2 model AUDIT proposals → curator MERGE), not a single-model audit — one model's verification is one model's blind spot. Doctrine: `docs/reference/skill-audit-pipeline.md` § "Audit rigor scales with centrality".
>
> **Operationalized as the two-frontier ENRICH orchestrator (HOW).** The claim → per-model propose → curator union-merge sequence below is driven programmatically by `lib/audit/run-skill-audit-loop-lite.js` (orchestration: sequencing + anti-loss + keep-or-revert) with its live production deps in `lib/audit/skill-audit-loop-lite-deps.js` (it shells the same `skill-audit-claim.js` slots + the claude/codex CLIs this doc describes). Run one skill end-to-end: `node lib/audit/run-skill-audit-loop-lite.js --skill <slug> --skill-dir <dir> --cwd <skill-graph-root>` (add `--dry-run` to exercise the wiring offline). The **WHY** — enrich-never-strip, two fully-tooled frontier models, tools-ON research as the curation mechanism — is the canonical doctrine in [`docs/skill-audit-loop-philosophy.md`](../docs/skill-audit-loop-philosophy.md). This manual runbook remains the by-hand / mixed-CLI path and the source of the merge-ledger v2 contract the orchestrator validates.

## Setup (every session)
1. Read `AGENTS.md`.
2. `node scripts/skill/build-skill-list.js --write` — re-rank.
3. `node scripts/skill/skill-audit-claim.js reap` — clear stale claims.
4. Know your **mode** and **model**:
   - Set `MODEL` env to your model slug (`opus`, `gpt-5.5`, `gemini-3.1-pro`, `sonnet`, …).
   - **AUDIT mode** = you produce a proposal for one skill. **MERGE mode** = you are the curator (Opus 4.7 or GPT-5.4 only).

## Claim — one skill at a time (atomic, cross-CLI)
```bash
node scripts/skill/skill-audit-claim.js next                 # highest-priority public-safe unclaimed skill
node scripts/skill/skill-audit-claim.js claim <slug>         # atomic; REFUSES a 2nd skill while you hold one
node scripts/skill/skill-audit-claim.js claim <slug> --model "$MODEL"   # AUDIT: open your model slot on that skill
node scripts/skill/skill-audit-claim.js claim <slug> --merge           # MERGE: curator lock
```
`next` never returns a Sales Hub / personal / customer-data skill (it requires repoScope `shared`, not sales-hub-bound, not on the private denylist). If `claim` fails, the skill is held by another agent — pick the next one. If you must stop, `release` first.

## AUDIT mode (any model) — produce a PROPOSAL, do not commit canonical files
Run the full **v2.2 per-skill contract** (steps 1–8: deep catalog, test runner, read, audit-as-contract, Concept Card check, comprehension-evals check, fix-drift reasoning, external research, dual-run comprehension grader). Then write per-model artifacts — **NOT** edits to the canonical `skills/<slug>/SKILL.md`:
```
skill-graph/skill-audit-loop/progress/skill-audits/<slug>.$MODEL.catalog.json
skill-graph/skill-audit-loop/progress/skill-audits/<slug>.$MODEL.research.md
skill-graph/skill-audit-loop/progress/skill-audits/<slug>.$MODEL.findings.md
skill-graph/skill-audit-loop/progress/skill-audits/<slug>.$MODEL.proposed-SKILL.md   # OR <slug>.$MODEL.changeset.md (see below)
skill-graph/skill-audit-loop/progress/skill-audits/<slug>.$MODEL.proposed-comprehension.json
skill-graph/skill-audit-loop/progress/skill-audits/<slug>.$MODEL.scorecard.md
```
**Proposal form — pick by drift size (SH-6345):**
- **Change-set (preferred for small drift — a handful of localized fixes):** write `<slug>.$MODEL.changeset.md` as an ordered list of edits, each an `old:` block and a `new:` block plus a one-line rationale + evidence. Anchored, easy to union, and avoids near-identical full-file copies of a large skill. Use this when your fixes touch < ~20% of the skill and don't restructure it.
- **Full rewrite (`proposed-SKILL.md`):** the entire proposed SKILL.md. Use when the drift is structural (re-archetyping, section reorg, large rewrites) where a change-set would be more confusing than a clean file.

Pick exactly one form per model. Commit only these proposal artifacts (one commit), then `release --model "$MODEL"`. Your research is now durable and feeds the merge — it is never discarded.

## MERGE mode (curator: Opus 4.7 / GPT-5.4) — union, never winner-take-all
1. `claim <slug> --merge`.
2. `node scripts/skill/skill-audit-claim.js contributions <slug>` — see which models submitted.
3. **Read the CURRENT `skills/<slug>/SKILL.md` + evals first** — this is the merge baseline. Existing valuable content stays unless a proposal disproves it with repo evidence.
4. Read every `<slug>.<model>.*` proposal — both forms: apply each `<slug>.<model>.changeset.md` against the current baseline (anchored old→new blocks) and read each `<slug>.<model>.proposed-SKILL.md` full rewrite. A skill may receive a mix of change-sets and full rewrites across models; union them the same way.
5. **Union-merge** into the canonical `SKILL.md` + evals: fold in every valuable contribution from every model (fixed claims, sharper boundaries, better examples, missing edge cases, stronger evals). Resolve conflicts by strongest repo/vendor evidence.
6. **Reject nothing valuable silently.** Write `skill-graph/skill-audit-loop/progress/skill-audits/<slug>.merge-ledger.md` listing each contribution → kept / merged / rejected(reason) → evidence. Every drop has a recorded reason.
7. **Verify + keep-or-revert**: run the v2.2 verify checklist (`skill-census --write-docs` + `build-skill-list --refresh-manifest` — census no longer writes the manifest, SKI-371; `skill-lint`; test-runner) and the dual-run grader on the merged result. The merged skill must not regress `eval_score` vs the current skill. If it does, revert the regressing change and re-merge.
8. **Commit** (one skill, path-limited `git commit --only`): canonical `SKILL.md` + evals + `<slug>.merge-ledger.md` + retained `<slug>.<model>.*` proposals + regenerated `skills/_meta/REGISTRY.*` + grader log.
9. Update the worklist; `release <slug>` and `release <slug> --merge`.

## Hard rules
- One skill per agent at a time (the claim helper enforces it).
- **Eval files on public-safe skills track automatically (SH-6343 fixed 2026-05-22).** `skills/.gitignore` has a `/*` privacy guard that keeps the ~280 internal `scope: operational` skills out of the public marketplace. A generated allowlist (managed block in `skills/.gitignore`, between the `SH-6343` markers) re-includes ONLY the `evals/` tree of each public-safe flat skill — so eval files commit with a plain `git add`, while skill bodies and operational/Sales-Hub skills stay ignored. If you audit a public skill whose evals are still being ignored, it is not yet in the allowlist: run `node scripts/skill/generate-public-eval-gitignore.js` (it derives the public-safe set from the worklist using the same `isPrivate` rule as `skill-audit-claim.js`) and commit the regenerated `skills/.gitignore`. `git add -f` is a last-resort fallback only. NEVER weaken the `/*` guard or blanket-negate eval files across all skill dirs — operational and public skills share the `skills/<name>/` namespace, so no blanket negation is privacy-safe.
- Auditors propose; only the curator edits/commits the canonical `SKILL.md`.
- No `git add -A`; path-limited `git commit --only -- <paths>`.
- Never drop a valuable contribution without a recorded reason in the merge ledger.
- The merge always starts from the current skill state.
- Don't override grader model routing; `evaluate-skill.js` owns it.
- Stop after 4–5 skills (audit) or merges per session to avoid quality drop-off.

## Continue
Repeat from **Claim**. Stop on a real blocker (report skill, exact blocker, why).
