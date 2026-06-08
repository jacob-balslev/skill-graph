# Prompt: Finish the remaining Skill Graph SYSTEM work (SKI board) — 2026-06-08 handoff

> Type: Plan / execution handoff prompt
> Created: 2026-06-08T (supersedes `finish-remaining-skill-system-work-2026-06-03.md`, whose 81-ticket
> list is now mostly drained). Scope: the SYSTEM side of the Skill Graph project. CONTENT work
> (`SKILL.md` bodies + per-skill artifacts) is OUT OF SCOPE and runs only via `/audit:*`.

## What the 2026-06-08 session already did (do NOT redo)

- **Keystone:** `verify:system` was RED → GREEN (stale manifest/status regen + `skill-infrastructure`
  1024-char export override). SKI-259/311/318/320 closed.
- **~29 deterministic fixes committed**, ~24 verified-already-resolved closed. ~66 SKI tickets cleared total.
- **Lesson — verify EVERY triaged fix before applying.** 3 triage misanalyses were caught and reversed
  (SKI-253 not-a-bug; SKI-245 `taxonomy` is a live rubric dimension used by 42 files; SKI-334 the file
  was not deleted) and 1 inadequate suggested fix was corrected (SKI-247 — the proposed regex was still
  O(n²); the shipped fix is genuinely linear). Treat subagent "OPEN_DETERMINISTIC + suggested fix" as a
  hypothesis to reproduce, not a patch to apply.
- **`verify:system` reds intermittently from a parallel CONTENT session's corpus churn** (manifest:fresh /
  status:check / marketplace:verify go stale when another session edits a canonical skill). This is the
  live SKI-319 problem — do NOT chase it by regenerating in a loop. Regenerate the gitignored
  `skills.manifest.json` once locally; judge your SYSTEM commit by `node --check` + the targeted unit test,
  not by a corpus-churned verify:system.

## 0. Setup (every session)

1. Launch from `~/Development/`, `cd skill-graph`. Declare mode **SYSTEM**.
2. `npm run verify:system` baseline (ignore corpus-churn reds on manifest:fresh/status:check — see above).
3. SKI board CLI: `node ~/Development/scripts/linear/linear-cli.js --workspace smp {get|done|comment} SKI-XXX`.

## 1. Per-ticket loop (non-negotiable)

Fetch+read → **reproduce in current code FIRST** (cited paths/lines may have shifted; search by name) →
if it does not reproduce, close verified-already-resolved with evidence → else fix only the required lines
(`code-preservation`) → `node --check` + run the most specific unit test (corpus-independent) → commit
path-limited, one logical change, `git commit --only -F /tmp/msg -- <paths>` (flags BEFORE `--`) →
close SKI with evidence. Commit in the owning repo (skill-graph vs Development root). Avoid backticks in
double-quoted Linear comment strings (zsh executes them — use single quotes or `--body-file`).

## 2. Remaining queue

### A. Deterministic — audit-loop logic
- **SKI-297** — per-cell retry on transient failures in `lib/audit/run-skill-audit-loop.js`. Port
  `classifyInfraError` (TRANSIENT/STRUCTURAL) from `run-skill-improvement-loop.js`; in the `crossReview`/
  `reviseProposal` catch blocks, retry a TRANSIENT failure up to 2× with backoff before `alive=false`,
  so a transient model death does not trip the quorum check and discard all work. Add a unit test.

### B. Deterministic — panel shell scripts (runtime-adjacent; obey `no-ps-for-liveness`)
- **SKI-279** — `start-panel-drain.sh` has no nohup/detached launch → a tab/session close SIGHUPs the drain.
  Add a `--nohup` launch path (nohup + pid file).
- **SKI-234** — orphaned claim blocks the whole batch until restart. Add a `trap` on EXIT/ERR around the
  per-skill loop to release a claimed-but-unreleased skill, + a periodic mid-loop orphan reap.
- **SKI-230** — panel uses fixed per-model agent ids (`enrich-opus` …) that orphan across a killed run.
  Use a run-scoped agent id (append the run id) in `skill-audit-loop-live-deps.js` claimSlot.
- **SKI-235** — `skill-audit-claim.js next` deprioritizes already-audited high-importance skills on a
  re-enrich pass. Add a `--priority-mode importance` flag (raw importance order, no audited penalty).

### C. Explicitly deferred (user asked to skip 2026-06-08 — handle in a dedicated isolated pass)
- **SKI-296** — rename 41 residual `*Enrich*` / `SKILL_ENRICH_*` symbols across 3 `lib/audit` files +
  `loops.manifest.json` id. Large mechanical rename; do alone, run `test:unit` after.
- **SKI-322** — `evaluate` write-back writes `eval_last_run.artifact`, an additionalProperties:false
  violation (rename key to `receipt`; re-stamp affected sidecars).
- **SKI-324** — dimension graders are sidecar-blind (ADR-0019): merge the `audit-state.json` view before
  grading so portability/eval/comprehension_state fields are not reported "missing".

### D. DECISION — stop and ask the user (do NOT mechanically fix)
- **SKI-306 (LOAD-BEARING)** — redefine APPLICABLE / the eval generator population. 0/170 APPLICABLE is
  structural (frontier generator → ceiling effect). Resolving this unblocks SKI-303/224/225. Ask: *what
  agent population does the library serve?*
- **SKI-319** — split corpus-completeness gates (manifest:fresh/status:check/marketplace:verify) out of
  `verify:system` into `verify:corpus`, so a parallel CONTENT session can't red the SYSTEM gate.
- SKI-268 (compositeBundles create-vs-delete), 275/276 (broader/narrower & disjoint_with author-contract
  vs remove), 221 (require project[]/repo[]/paths for project skills), 241 (claim_scope alias keep-vs-cut),
  244 (comprehension skill_type enum rename), 251/256/257 (acceptance-bar / privacy-skip / YAML-strictness
  judgment), 298 (retire /evolve engine — needs the model-free contract test gate first), 307 (advisory
  feedback after mandatory convergence).

### E. CONTENT — drain via `/audit:*`, NOT SYSTEM
SKI-218/227 (sidecar migration), 224 (scope on ~166 skills), 225 (application evals), 232/233 (semantics
body), 270/271/272 (taxonomy_domain collisions), 273/274 (boundary edges), 277 (14 stale
`skill_graph_canonical_skill` paths), 317 / **335 (dup of 317 — close)**, 216 (truth-source drift), 333
(SKILL_AUDIT_LOOP.md restructure). Route, do not edit SKILL.md inline.

### F. RUNTIME / EXTERNAL
SKI-315 (codex Monitor-armed — live spawn). SKI-223 (escalate stale skills.sh rows to `@quuu` in the
Vercel forum), SKI-19 remainder + SKI-16 publish (maintainer CI / Vercel staff — not agent-doable).

## 3. Sequencing

A (SKI-297) → B (panel scripts, disjoint — safe to fan out one task-solver each) → then **stop for the
Cluster-D decisions**, since SKI-306/319 reshape downstream work. C only in a dedicated isolated pass.
End with a completeness claim: "Examined N, closed M (fixed: …; verified-already-resolved: …), remaining: … ."
