# Skill Audit Loop — Single-Model Prompt

> Portable across Opus, GPT-5.x/Codex, Gemini, and Sonnet. Hand this to ONE model to run the
> Skill Audit Loop from the worklist, upgrading skills to the newest Skill Metadata Protocol.
> This is the SINGLE-MODEL audit prompt. The multi-model union-merge flow is a separate,
> separately-orchestrated process (`.opencode/commands/skill-audit-merge-v1.md`) — do not use
> this prompt to drive it.
>
> Last updated: 2026-05-22 (v3). v3 fixes a PREFLIGHT lint gate that hard-stopped automation runs
> in a sparse/sandboxed worktree (env false-positive lint errors); the gate is now per-skill, not
> a clean-corpus precondition. v3 also makes Step 8 (self-assessment) auto-solve small/low-risk findings
> in-session and file only the larger ones to Linear as Audit Reports. RULE 0 added after a
> Codex/GPT-5.5 run over-applied the repo's
> multi-model merge guidance and wrongly spawned Gemini + Claude for a GPT-only audit. v2 fixes a
> truncated verify/commit step and folds in the operational gotchas confirmed in a live
> agent-loop-infra audit (drift_status enum, census-CLEAN gate, JSON-rewrite diff check,
> eval-score regression, context budget, the pid-bound claim lock).

```
You are running the Skill Audit Loop. Work from the repo root (Development/).

╔══════════════════════════════════════════════════════════════════════════╗
║  RULE 0 — RUN AS YOURSELF, ONE MODEL ONLY.                                 ║
║  You are the single model executing this prompt (set MODEL to your slug:   ║
║  opus | gpt-5.5 | gemini-3-pro | sonnet | codex). You do ONE model's audit.║
║  Do NOT spawn, invoke, delegate to, or "consult" any other model or CLI —  ║
║  not Gemini, not Claude/Opus, not OpenCode, not Codex — under any           ║
║  circumstance. The repo documents a MULTI-MODEL MERGE flow                  ║
║  (skill-audit-merge-v1.md). That is a SEPARATE, separately-orchestrated     ║
║  process. IGNORE it. You are an AUDIT-mode contributor: you produce ONE     ║
║  model's audit + upgrade for ONE skill and commit it. If you ever feel the  ║
║  urge to bring in a second model "for coverage," or to ask another model to ║
║  grade an eval you cannot run, STOP — that is the exact bug this rule       ║
║  exists to prevent. Single model, start to finish.                          ║
╚══════════════════════════════════════════════════════════════════════════╝

SETUP
1. Read AGENTS.md (root) — § "Skill Audit Loop", the Document Routing Table, the
   Version Schema Contract, and the multi-session commit rule (`git commit --only`).
2. Read the protocol + the SINGLE-skill audit contract ONLY:
   - skill-graph/AGENTS.md  → Skill Metadata Protocol + "Labels Are Earned" doctrine
     (the old top-level `skill-metadata-protocol` path is gone; this is canonical)
   - skill-graph/audits/per-skill-contract.md  → the per-skill audit contract (steps 1-8)
   - docs/reference/skill-audit-pipeline.md          → Audit Doctrine (intent fidelity +
     teaching efficacy; lint is a floor, never the goal)
   Do NOT read or act on skill-audit-merge-v1.md — that is the multi-model flow (see RULE 0).
3. Load the skills relevant to this task: skill-infrastructure, skill-scaffold,
   skill-evolution, evaluation, methodical, no-cutting-corners, quality-doctrine
   (read skills/<name>/SKILL.md directly — these are the quality-assurance set).

PREFLIGHT (verify the TOOLCHAIN RUNS — not that the corpus is already perfect)
4. Smoke-test the toolchain once, from the repo root. The question is "do the scripts RUN
   without crashing," NOT "is the whole skill library already lint-clean":
     node scripts/skill/build-skill-audit-worklist.js --write     # re-rank the queue
     node scripts/skill/skill-audit-claim.js reap                  # clear dead-pid claims
     node scripts/skill/skill-lint.js | tail -3                    # CAPTURE the error count as BASELINE_ERRORS
   STOP and report ONLY if a script CRASHES — throws, exits non-zero from a missing dependency,
   a syntax error, or an unreadable file. That is a broken toolchain.
   A non-zero skill-lint ERROR COUNT is NOT a stop condition. Record it as BASELINE_ERRORS and
   continue. skill-lint exits 0 even when it reports errors, so "reports N errors" ≠ "the tool
   errored" — do not conflate them.
     - In a SPARSE or SANDBOXED worktree (e.g. `skill-graph/` is an empty gitlink, or the nested
       `agent-orchestration/` repo is not checked out, or sibling paths are outside the sandbox),
       skill-lint reports dozens-to-hundreds of dead-path / dead-relation errors that are
       ENVIRONMENTAL FALSE POSITIVES — the referenced files exist in the full checkout, just not
       in your worktree. This is EXPECTED. Do not try to fix the whole corpus, and do not block.
     - The real lint GATE is PER-SKILL and lives in Step 7: your claimed skill must be clean
       (`skill-lint.js --skill <slug>`), and your audit must not INCREASE the corpus error count
       above BASELINE_ERRORS. Pre-existing corpus errors on OTHER skills are never yours to fix
       in this run (mirrors the census-CLEAN rule and the "lint is a floor, never the goal"
       doctrine).
   Ranked queue lives at .opencode/progress/skill-audit-worklist.md.

CLAIM (one skill at a time)
5. Pick the next skill and claim it for YOUR model only:
     node scripts/skill/skill-audit-claim.js next                  # never returns a
            # Sales-Hub / personal / customer-data skill (repoScope=shared, not denylisted)
     node scripts/skill/skill-audit-claim.js claim <slug> --model "$MODEL"
   (Do NOT pass --merge — that is curator/multi-model mode, not yours.)
   The claim lock is PID-bound and written to .claude/agent-memory/skill-audit-<slug>;
   it also opens a run dir under .opencode/progress/skill-audits/<slug>/runs/<run-dir>/.
   If `claim` fails, another agent holds it — pick the next. Never hand-pick a Sales-Hub
   or personal/customer-data skill even if it ranks high; trust `next`.

AUDIT + UPGRADE (run the full v2.2 contract, as YOU, one model)
6. Inspect → Change → Verify against CURRENT SOURCE TRUTH:
   a. Catalog + tests: source-truth-catalog.js --skill <slug> --deep --json ;
      skill-test-runner.js --skill <slug> ; claim-extractor.js --skill <slug> --json
   b. VERIFY EVERY SOURCE-TRUTH CLAIM YOURSELF before changing or rejecting it. Re-grep,
      re-run, SMOKE-TEST scripts. A literal path/string mismatch is NOT proof of drift —
      confirm the target truly doesn't exist (no shim/symlink) AND the command actually
      fails. (Real false positive: a "broken path" finding where a shim made the path
      resolve fine; and a "VALID_LOOPS has 12 but manifest has 14" mismatch that was
      correct repo-scoping, not a bug. Run the command before you call it drift.)
   c. Upgrade by MIGRATING CONTENT, not editing labels:
      - Author the v6 Understanding fields in frontmatter — mental_model, purpose,
        boundary, analogy, misconception — plus comprehension_state: present, AND a
        matching `## Concept Card` body section (mirror the `agents` skill for shape).
      - Author/repair a GRADEABLE comprehension.json: dimension-tagged cases covering all
        seven dimensions in canonical order — definition, mental_model, purpose, boundary,
        taxonomy, analogy, application. (The legacy expectations[]-array shape is
        ungradeable and does not count; verify with `node -e` that every case has a
        `dimension` field.)
      - Fix all verified drift; preserve all existing capability (improve = ENRICH, never
        trim). Fix adjacent doc drift in the SAME commit, and grep *.md for stale refs to
        anything you renamed.
   d. Earn the four Health-Block verdicts from evidence — never bump them for convenience:
      - structural_verdict: PASS only if skill-lint is clean for this skill.
      - truth_verdict: PASS only with firsthand source evidence for EVERY claim, after the
        drift you found is fixed. Otherwise UNVERIFIED.
      - comprehension_verdict / application_verdict: do NOT default these to UNVERIFIED.
        UNVERIFIED means "not assessed at all" — a vacuum. You ARE assessing the skill, so
        record a real result. Assess it YOURSELF: this is single-model self-assessment and
        does NOT violate RULE 0 — RULE 0 forbids spawning/consulting ANOTHER model, not
        judging your own work.
          * comprehension_verdict: answer each gradeable comprehension.json case the way the
            skill content would lead an agent to answer it, and judge whether the skill
            actually teaches enough to produce the correct answer. If yes → record PROVISIONAL.
            If it teaches the dimension shallowly or redundantly → record SHALLOW / REDUNDANT
            (and fix what you can in this commit).
          * application_verdict: use your Step 8 self-assessment — apply the upgraded skill to a
            realistic task and judge whether it changed agent behavior for the better. If yes
            → record PROVISIONAL. If redundant / harmful / mixed → record REDUNDANT / HARMFUL /
            MIXED.
        PROVISIONAL = a real single-model result: lower-confidence, single-perspective, to be
        CONFIRMED OR OVERTURNED by the independent dual-run grader later. It is NOT
        grader-verified — never report PROVISIONAL as "verified" / "graded" / "best". Record
        PASS / APPLICABLE ONLY if the dual-run grader pipeline actually executed and you have
        its receipt — it can't run non-interactively here, and you MUST NOT substitute another
        model to grade (RULE 0). The confidence hierarchy is
        APPLICABLE (grader) > PROVISIONAL (you) > UNVERIFIED (nobody).
      - drift_status: use only a CANONICAL enum value — OK, DRIFT, BROKEN, STALE,
        NO_BASELINE, EXTERNAL_UNHASHED, UNKNOWN. (e.g. "current" is INVALID and census
        will flag it.) After fixing all drift, OK is correct.
   e. Bump version ONLY when its content is present (the gate enforces this):
        node scripts/skill/check-version-earned.js skills/<slug>/SKILL.md   # must exit 0
      A patch bump (e.g. 1.1.1 -> 1.1.2) for content fixes is fine; advancing schema_version
      requires that version's content to actually be present, or the gate fails the commit.

VERIFY + COMMIT
7. Run the verify gates and confirm NO eval-score regression:
     node scripts/skill/skill-lint.js --skill <slug>                   # YOUR skill: 0 errors / 0 warnings
            # The GATE is per-skill, plus "did not increase the baseline." Do NOT require the
            # whole-corpus error count to be 0 — in a sparse/sandboxed worktree it never will be
            # (environmental false positives, see PREFLIGHT). Re-run `skill-lint.js | tail -3`
            # and confirm corpus errors <= BASELINE_ERRORS captured in Step 4. If your claimed
            # skill is clean AND you did not add errors, the structural gate PASSES.
     node scripts/skill/skill-census.js --write-manifest --write-docs  # <slug> must be CLEAN
            # (the only census error/warning lines that matter are YOUR skill's; pre-existing
            #  ones for other skills are not yours to fix in this commit)
     node --test <skill key-file tests>  (or skill-test-runner)        # all pass
   Compare eval_score before/after — the merged skill must not regress it. If it does, revert
   the regressing change and re-verify.
   Write a single-model audit ledger under the run dir
   (.opencode/progress/skill-audits/<slug>/runs/<run-dir>/merge-ledger.md): every finding →
   kept / fixed / rejected(reason) + firsthand evidence. Your ledger Contributor is YOUR
   model only.
   COMMIT PATH-LIMITED in the repo that OWNS the files (verify ownership with
   `git -C <repo> ls-files --error-unmatch <path>` — skills/ files are usually owned by the
   Development root; agent-orchestration/ has its OWN .git):
     git commit --only -F /tmp/msg -- skills/<slug>/SKILL.md \
        skills/<slug>/evals/comprehension.json \
        .opencode/progress/skill-audits/<slug>/...        # flags BEFORE --, paths AFTER
   The git index is SHARED across parallel sessions — `--only` is mandatory. EXCLUDE the
   regenerated aggregates (skills.manifest.json, skills/_meta/REGISTRY.md, SKILL-INDEX.md,
   the worklist json/md, package-lock.json) when their diff is dominated by OTHER skills'
   uncommitted edits — never sweep thousands of lines of unrelated worklist churn into your
   commit. If you used a SCRIPT to rewrite a large JSON, first confirm the diff is LOCALIZED
   (`git diff` shows a few hunks, not a whole-file reformat) before staging.
   After committing, `git show --stat HEAD` and confirm the file list is EXACTLY yours.
   Operational (scope:operational) skills stay out of the public marketplace clone
   (skills/.git) — never `git add -f` them there.

self-assessment + DOCUMENT
8. Apply the skill you just upgraded against the skill-graph repo as a real consumer would, to
   test its teaching efficacy. Surface ALL findings (canonical P0–P4 severity; show every
   finding, never a "top issues" subset). Route doc updates per the AGENTS.md Document Routing
   Table. This self-assessment IS your application assessment: judge whether applying the skill changed
   agent behavior for the better and record the Step 6d `application_verdict` from it
   (PROVISIONAL if it helped; REDUNDANT / HARMFUL / MIXED if not) — do not leave it UNVERIFIED.

   SOLVE-OR-FILE GATE — for EVERY finding, decide once (per
   `.claude/rules/overhead-proportional-to-work.md`):
   - SOLVE IN-SESSION when the fix is small and low-risk — roughly ≤20 lines in a single file,
     no architectural decision, no cross-repo blast radius, no security/auth/financial/
     irreversible surface, and it will not derail the audit. Fix it NOW, in the repo that OWNS
     the file (skill-graph/ has its OWN .git — commit there, path-limited with `git commit
     --only`, as a SEPARATE commit from the skill commit). Verify the fix (re-run the check that
     found it), then record it in the run ledger as FIXED-IN-SESSION with the commit hash + the
     before/after evidence. Batch several tiny fixes into one commit rather than spawning
     ceremony per finding — but still list each finding individually.
   - FILE TO LINEAR otherwise — too large, multi-file, architectural, risky, needs a human
     decision, or would balloon the session beyond this skill. Write it as a Linear Audit Report
     using the established label `Skill Graph,agent:error-report` (keep this label so the
     existing error-report queue/tooling still finds it), at its TRUE severity (P0→priority 1 …
     P3→4), with full evidence (file:line, command output/repro) and a suggested fix. Split
     grouped findings FIRST (per `complete-reporting.md`): one finding = one report; a finding
     joining two issues with "and" is two reports. Multi-line body → write to a temp file and use
     `linear-cli.js create ... --description "$(cat /tmp/er-<slug>.md)" --priority N --estimate N`.
   No severity filter, no truncation, no silently dropping the small ones into Linear to avoid the
   work: examined N findings, account for all N. Each finding ends tagged either
   FIXED-IN-SESSION (commit hash) or FILED → SH-XXXX. List both sets in the Step 10 report.
9. Release YOUR claim and re-rank, then commit doc updates (same --only discipline):
     node scripts/skill/skill-audit-claim.js release <slug> --status completed \
        --structural PASS --truth PASS --comprehension PROVISIONAL --application PROVISIONAL
   (PROVISIONAL = your single-model assessment from Step 6d + the Step 8 self-assessment; use
   UNVERIFIED ONLY if you genuinely could not assess the dimension, and the negative enums
   — SHALLOW/REDUNDANT for comprehension, REDUNDANT/HARMFUL/MIXED for application — when your
   assessment was negative. Never record PASS/APPLICABLE without a dual-run grader receipt.)
     node scripts/skill/build-skill-audit-worklist.js --write
   (If `release` reports "no lock by pid-..." it is because the lock is bound to the claiming
   process's pid. In a single long-running loop process this won't happen; if it does, the
   completed claim is cleared by `skill-audit-claim.js reap --ttl-min 0`.)
10. Repeat from step 5. Stop after 4–5 skills per session, when context exceeds ~80%, or on a
    real blocker — report the skill, the exact blocker, and why. "Couldn't grade comprehension"
    is NOT a blocker (it's expected — leave UNVERIFIED and continue).

HARD RULES (every iteration)
- RULE 0 above is absolute: one model, no spawning others, no merge flow, no second-model grading.
- Labels are earned, not bumped: never sed/codemod a version label with no content change. A
  label ahead of its content is honest drift to RECORD, not to hide by editing the label.
- "completed" status ≠ "verified": the quality signal is application_verdict, not the schema
  integer. Never report "carries v7" / "284 on v7" as "best/newest/verified" — say which you mean.
- Privacy: no Sales Hub / Printify / Shopify / personal / bank / customer data in skills/ or evals.
- One skill per agent at a time (the claim helper enforces it).
- Show ALL findings; never filter by severity. Examined N, report N.
```

## Why these rules exist

**RULE 0 (incident 2026-05-22):** A Codex/GPT-5.5 automation run reading an earlier version
followed setup guidance to read `skill-audit-merge-v1.md` (the multi-model union-merge flow) and
over-applied it — spawning Gemini and Claude to "audit alongside it" for a GPT-only run. It made a
temporary commit, then had to scrub the Gemini artifact and secondary-model language and re-commit
GPT-only. Fix: a single-model runner never reads/acts on the merge flow, never passes
`claim --merge`, and never substitutes another model to grade comprehension/application evals.

**The PREFLIGHT baseline (incident 2026-05-22, Skill Audit Loop 3.0 automation):** A Codex
automation run repeatedly hard-stopped at preflight because the step read "baseline must be 0
errors" and the worktree reported 191 skill-lint errors. Those 191 were ENVIRONMENTAL FALSE
POSITIVES: the automation runs in a sparse/sandboxed checkout where `skill-graph/` is an empty
gitlink and the nested `agent-orchestration/` repo is not visible, so skill-lint flags the
skills' references to those paths as dead — even though they resolve fine in the full checkout
(verified: the same `skill-lint.js` reports **0 errors** in the full Development tree). The gate
was wrong in two ways: (1) it conflated "the lint tool ran" with "the corpus is perfect," and
(2) skill-lint exits 0 even when it reports errors, so "if any of these error, STOP" was
ambiguous. Fix: preflight only confirms the toolchain RUNS and captures the error count as a
baseline; the lint gate is per-skill (Step 7) plus "do not increase the baseline." A dirty
corpus baseline must never block auditing one skill — that is the "lint is a floor, never the
goal" doctrine applied to the runner. (The automation should also, where possible, run in the
full checkout or `git submodule update --init skill-graph` so the false positives shrink — but
the runner must not depend on a clean baseline to function.)

**The verify/commit gotchas (confirmed in a live agent-loop-infra audit, 2026-05-22):**
- `drift_status: current` is INVALID — census only accepts the canonical enum (OK/DRIFT/BROKEN/
  STALE/NO_BASELINE/EXTERNAL_UNHASHED/UNKNOWN).
- `skill-census --write-manifest --write-docs` regenerates aggregates from the WHOLE working tree,
  picking up parallel sessions' edits — so the manifest/REGISTRY/SKILL-INDEX diff is dominated by
  other skills. Commit only your skill's files; let a clean full regeneration own the aggregates.
- A script that rewrites a large JSON can silently reformat the whole file; always confirm the
  diff is localized before staging.
- The claim lock is pid-bound; `release` across process boundaries needs `reap --ttl-min 0`.

## Changelog
- **v3 (2026-05-22):** fixed the PREFLIGHT lint gate that hard-stopped the Skill Audit Loop 3.0
  automation in a sparse/sandboxed worktree (191 environmental false-positive lint errors). The
  preflight now only verifies the toolchain RUNS and captures BASELINE_ERRORS; the lint gate is
  per-skill (`skill-lint.js --skill <slug>`) plus "do not increase the baseline." A dirty corpus
  baseline no longer blocks claiming a skill. Also reworked Step 8 (self-assessment) into an explicit
  SOLVE-OR-FILE gate: small/low-risk findings (≤20 lines, 1 file, no architectural/cross-repo/
  risky surface) are FIXED IN-SESSION in the owning repo; everything else is FILED to Linear as
  an Audit Report (`Skill Graph,agent:error-report`). Every finding ends tagged FIXED-IN-SESSION
  or FILED → SH-XXXX, no severity filtering.
- **v2 (2026-05-22):** restored the truncated Step 6e command + the missing "VERIFY + COMMIT"
  step header (the v1 paste corrupted them); added PREFLIGHT toolchain smoke-test; added the
  drift_status enum, census-CLEAN gate, eval-score regression check, JSON-rewrite diff check,
  context-budget stop, the pid-lock release note, and the quality-assurance skill set to step 3.
- **v1 (2026-05-22):** initial single-model prompt with RULE 0.

## Related

- `skill-graph/audits/per-skill-contract.md` — the per-skill audit contract this prompt drives.
- `.opencode/commands/skill-audit-merge-v1.md` — the SEPARATE multi-model union-merge flow (curator only).
- `skill-graph/AGENTS.md` — Skill Metadata Protocol + "Labels Are Earned, Not Bumped" doctrine.
- `.claude/rules/version-schema-contract.md` — labels are earned; never bulk-bump a version label.
- `.claude/rules/multi-session-commits.md` — why every commit uses `git commit --only`.
