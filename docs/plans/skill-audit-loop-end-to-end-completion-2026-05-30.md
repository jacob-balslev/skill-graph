# Skill Audit Loop — End-to-End Completion: Explanation, Verified Gaps, and Fix Plan

> Type: Plan (forward) + verification report. SYSTEM mode (machinery). Created 2026-05-30.
> Companion to the receipt ledger `docs/research/2026-05-30-skill-audit-loop-end-to-end-verification.md`.
> Standard inherited from that ledger: a loop step is "working" ONLY with a real-run receipt on a
> real skill — not "the code is wired," not "mocks pass." Every break below was reproduced by
> running the actual script and reading the actual code.

## Context — why this exists

Across multiple sessions the loop has been declared "done" from code-reading, then a real skill run
hit a script/path that never worked, invalidating the work. This document answers, with reproduced
evidence, the two recurring questions, then records a corrected fix plan reviewed by two Claude
skill-distiller passes (18 quality/architecture skills) AND a real GPT-5.4 adversarial review.

1. **Are we letting important metadata be optional?** — Yes. Part 1.
2. **Can the loop run 100% end-to-end and produce the result we want** (skills automatically
   audited → researched → improved → upgraded to the latest schema version → used → evaluated)? —
   **No, not today.** Reproduced breaks in Part 3; corrected plan in Part 5.

> **Honesty note (2026-05-30):** an earlier draft of Part 6 attributed findings to "GPT-5.5 (via
> Codex)" before any external model had actually run — that was fabrication and has been removed. The
> external review that DID run is **GPT-5.4 via Codex** (GPT-5.5 was reachable but its agentic output
> wasn't cleanly captured). Part 7 is GPT-5.4's verbatim output. This correction is itself an instance
> of the project's core discipline: no claim without a receipt.

---

## Part 1 — The Skill Metadata Protocol, field-by-field (what we capture and the rule for each)

**One canonical binding schema** (verified — exactly one, not two competing files):
`skill-graph/schemas/SKILL_METADATA_PROTOCOL_schema.json` — JSON Schema draft 2020-12,
`schema_version: 8`, `additionalProperties: false`. Loaded and enforced by `scripts/skill/skill-lint.js`
via a custom Node validator (no AJV). `additionalProperties:false` IS enforced (skill-lint.js:220–230)
— an undeclared field errors.

### 1a. The 13 required fields (the contract floor)

| Field | Rule / why required |
|---|---|
| `schema_version` | Must be `8`. Asserts the skill meets v8's *content* bar — earned, not bumped (`check-version-earned.js` fires only on a bump and fails closed if the content is absent). |
| `name` | Stable kebab-case = directory name; relation-target + routing key. |
| `description` | Routing contract. Activation belongs to `keywords`/`triggers`/`examples`; boundary to `relations.boundary`. |
| `version` | Semver of the skill's *content* (distinct from schema_version). |
| `subject` | Closed 9-enum browse shelf (primary classification). Balance rule 5–25 skills/subject. |
| `deployment_target` | Closed 2-enum `portable`/`project`. `project` ⇒ `grounding` block required (allOf). |
| `scope` | Free-text PRD statement of what it teaches / does not teach (the v8 enum value `workspace` was removed 2026-05-27). |
| `owner` | Accountability. |
| `freshness` | ISO date of last content review (must be truthful, not aspirational). |
| `drift_check` | Object: `last_verified` (ISO) + optional truth-source SHA-256 hashes. The truth-grounding metadata. |
| `eval_artifacts` | enum `none/planned/present` — disk truth: does an eval file exist? |
| `eval_state` | enum `unverified/passing/monitored` — runtime truth: has the eval run+passed? `passing` requires an `eval_last_run` receipt (allOf coupling). |
| `routing_eval` | enum `absent/present` — has the skill been included in a routing eval vs the retrieval baseline? |

### 1b. The quality-signal fields — present in the schema but OPTIONAL, and gating nothing

These carry the answer to "does the skill actually teach / help an agent" — and **none are required, and (verified by GPT-5.4) nothing in the live router even reads them**:

| Field(s) | Captures | Status | Consequence |
|---|---|---|---|
| `application_verdict` | **THE primary quality signal** — does loading the skill change agent behavior for the better on real artifacts? enum incl. `APPLICABLE` / `PROVISIONAL` / `UNVERIFIED` (default). | OPTIONAL, default `UNVERIFIED`, **gates nothing** | A skill ships + routes forever with nobody proving it helps. |
| `comprehension_verdict` | Does the agent understand the concept deeper with the skill? (weaker — recitation ≠ application.) | OPTIONAL, default `UNVERIFIED` | — |
| `structural_verdict` / `truth_verdict` | Integrity-gate roll-ups (form / grounded-in-truth). | OPTIONAL, loop-stamped | — |
| `comprehension_state` | Declares the skill carries a comprehension eval + the 5 Understanding fields. | OPTIONAL | If absent, the comprehension gate is silently skipped. |
| `mental_model`, `purpose`, `boundary`, `analogy`, `misconception` | The teachable concept, in frontmatter. | OPTIONAL — conditionally required only when `comprehension_state: present` (allOf) | A skill with no `comprehension_state` needs none of them. |
| `keywords` / `relations.*` | Fuzzy routing recall / the skill-graph edges. | OPTIONAL | Weaker routing / sparse graph. |

**The nuance that matters:** the four verdicts are *correctly* optional in the schema because they are
**loop-stamped, not hand-authored**. The real gap is twofold: (a) nothing **gates** on them, and (b)
GPT-5.4 verified the live router gates on **`eval_state`** (`skill-graph-route.js:16`), not on the
four-verdict Health Block at all. So the quality signal is not just optional — it is **disconnected
from the only place it would matter (routing)**. See Part 4.

---

## Part 2 — The Skill Audit Loop in lockstep (operations, gates, verdicts, steps)

Canonical contract: `skill-graph/SKILL_AUDIT_LOOP.md` § Part 3. Six commands under
`.claude/commands/audit/` (4 operations + 2 utilities). Two gates. Four verdicts.

### 2a. Four operations (and what each writes)
- **`audit`** — read every field vs live repo truth; run deterministic lint + drift (+ optional
  `--graded`); write `last_audited`, `lint_verdict`, `drift_status`, `structural_verdict`,
  `truth_verdict` (graded verdicts only with `--graded`). No body mutation.
- **`improve`** — Karpathy keep-or-revert: edit ONE field, one commit, time-boxed, auto-run eval,
  revert the commit if `eval_score` drops; stamp `last_changed` on accept.
- **`evaluate`** — run the eval suite via LLM grader; write `eval_score`, `eval_failed_ids`,
  `freshness`, and the behavior verdict(s). **(But verified: only when `--write-verdict` is passed — Break #2.)**
- **`evolve`** — corpus walker. **Verified conflict (GPT-5.4):** the docs (`SKILL_AUDIT_LOOP.md:220`)
  used the superseded thin-loop phrasing for `evolve`, but `bin/skill-graph.js:177` wires it
  to a *different* continuous auto-improve engine (`lib/audit/skill-evolution-loop.js`). Two meanings,
  one name — a contract/implementation split (Part 6, finding E1).

### 2b. Two gates
- **Integrity Gate** (deterministic, CI-safe): schema lint, manifest parity, drift vs truth-source
  hashes, link resolution, routing reachability, overlap, export shape → `structural_verdict` +
  `truth_verdict`. Mature (≈ MLOps L1).
- **Behavior Gate** (LLM grader, top model only per `no-lesser-models-for-quality`): gate 8
  comprehension (weak) + gate 9 application (primary) → `comprehension_verdict` + `application_verdict`.
  **Sparse by construction today** (12/160 graded); needs a paid model so it never runs in CI — the
  structural reason "done" is always asserted from code-reading (Part 6, root cause).

### 2c. Four verdicts & confidence tiers
`UNVERIFIED` (nobody graded) < `PROVISIONAL` (single-model self-assessment) < `PASS`/`APPLICABLE`
(independent dual-run grader). Never stamp `APPLICABLE` without an `eval_last_run` receipt; a single run
records `PROVISIONAL`, never `UNVERIFIED`. Only `application_verdict == APPLICABLE` *certifies*
usefulness; the others establish *eligibility for assessment*, not certification. (Both Claude reviews
and GPT-5.4 agree this comprehension/application split is sound construct validity — keep it.)

### 2d. Per-skill runbook (13 steps) — in lockstep with the implementing script
Setup: env `AGENT_ID`/`MODEL`; `skill-audit-claim.js claim <skill> --lane <l>` (atomic claim + run dir).
1 catalog → `source-truth-catalog.js --deep` · 2 tests → `skill-test-runner.js` · 3 read (manual) ·
4 audit-as-contract incl. 4b "Concept of the skill" 7-field check + 4c `comprehension.json` check (manual) ·
5 fix drift (manual edit) · 6 external research / upstream-displacement check (manual) · 6b grade
comprehension → `evaluate-skill.js --comprehension` · 7 write artifacts
(catalog/research/findings/scorecard/verdict) · 8 verify → `skill-census.js` + `skill-lint.js` +
`build-skill-list.js` · 9 checkpoint → `loop-checkpoint.js` · 10 **release BEFORE commit** →
`skill-audit-claim.js release ... --structural --truth --comprehension --application` (writes the
terminal ledger line + the four verdicts) · 11 `git commit --only` (one skill) · 12 checkpoint done · 13 `/wrap`.

### 2e. Schema-version upgrade path
Not automatic by design (`AGENTS.md § Major Version Is a Clean Cut`): no standing `migrate-skill-vN.js`;
content authored per-skill through `audit`/`improve`, then the integer bumped in the same commit;
`check-version-earned.js` blocks the bump without the content. **This is the biggest mismatch with the
mental model "skills auto-upgrade to v8."** User decision (Part 4) bends this.

---

## Part 3 — Verified breaks (reproduced this session — real command output + code read)

> Severity per the canonical schema. Complete reporting: all items listed; none dropped.

**[P1] Break #1 — `/evolve` cannot create skills (wrong path, replicated in 4+ places, one of them a test that *enshrines* the bug).**
`lib/audit/skill-evolution-loop.js:583-587` `spawnSync`s a hardcoded bare path
`scripts/skill-auto-create.js`; real path is `scripts/skill/skill-auto-create.js`. The status is caught
(`:589`), so it does **not crash** — every `scaffold_skill` action **fails silently** into the result
log (methodical anti-pattern #6, worse than a crash). GPT-5.4 + my own grep confirm the SAME bad path in
`scripts/skill/skills.js:36` and `scripts/skill/skill-discovery-loop.js:404`, and
`scripts/__tests__/skills.test.js:121` **asserts the wrong path** — a green test enshrining the bug
(false-green). (`skill-evolution-loop.legacy.js:401` uses the correct path.) Fix = path audit across all
sites + fix the test + fail-closed, not a one-line edit.

**[P1] Break #2 — verdict write-back is opt-in (`--write-verdict`, default OFF); the CLI help LIES about it.**
`evaluate-skill.js:2045-2046` gates `stamp*Verdict` on the flag; default = no write. GPT-5.4: the public
help at `bin/skill-graph.js:249` *promises* default Health-Block writes — a doc-lie vs the code. An
unattended loop that forgets the flag produces zero durable verdicts.

**[P1] Break #3 — the audit trail is already corrupted; the honesty gate is excluded from "green" as policy.**
`check-audit-manifest.js` → `FAIL — 14 verdict(s) claim graded comprehension without the artifact`
(reproduced twice). GPT-5.4: this gate is institutionally excluded from "green" status
(`build-status-doc.js:281`, blessed in `AGENTS.md:591/595`) — **false-green as policy** — and the gate
only enforces *comprehension* artifacts; *application*-artifact enforcement is merely "informational"
(`check-audit-manifest.js:48`) despite docs claiming graded application verdicts require artifacts.

**[P2] Break #4 — no standalone grader; divergent `evaluate-skill.js` fork (SH-6603); verdicts can outlive evidence.**
Grading logic is inlined in `evaluate-skill.js` (graders are .md prompts). GPT-5.4: application eval
results default to `.cache/...json` (`evaluate-skill.js:1945`) while the stamped receipt records only
timestamp/status/runner (`:1775`) — so a verdict can persist after its evidence is gone. Step 2 needs
durable receipts, not just write-back.

**[P3] Minor — `skill-audit.js` rejects `--help`.**

**[P4] INFO — corpus reality:** 12/160 skills carry `evals/comprehension.json` (7.5%). Even fixed, the
Behavior Gate stays sparse until a grading rollout runs. And `/evolve` scaffolds new skills with
`--skip-eval` by design (`skill-evolution-loop.js:580`) — so even after Break #1, new skills never
complete the intended create→evaluate lifecycle automatically (GPT-5.4).

---

## Part 4 — Decisions (user-selected 2026-05-30)

**Decision A — Quality-signal enforcement: gate-out-negatives + rank-weight (NOT gate-on-APPLICABLE).**
All three reviews (ontology + quality-doctrine skills + GPT-5.4) flagged that gating routing on
`application_verdict == APPLICABLE` is an open-world/closed-world category error: `UNVERIFIED` means
"unknown," not "proven bad." With 12/160 graded it would remove ~90% of the library on day one — a kill
switch. **Selected:** demote ONLY proven-negative verdicts (`HARMFUL`/`REDUNDANT`/`FALSE_POSITIVE`) and
**rank-weight** the rest (`APPLICABLE` boosts, `UNVERIFIED` stays routable). Optionally gate *publish*
(marketplace, low-volume) on `APPLICABLE`; never *routing*.
GPT-5.4 caveats: keep this to *behavior* verdicts only (structural/truth still hard-block broken skills);
don't let `UNVERIFIED` be so weakly penalised the router becomes a popularity contest; expire negative
verdicts so a fixed skill isn't tombstoned. **Critical sequencing caveat (GPT-5.4, verified):** the live
router gates on `eval_state` (`skill-graph-route.js:16`), NOT the four-verdict Health Block — so this is
a **contract migration** (wire the router to verdicts first), not a scoring tweak.

**Decision B — Schema upgrade: bend clean-cut to allow a deterministic field-shape migrator (codemod).**
A codemod handles mechanical fields (rename/move/default); agent authoring is reserved for genuinely
semantic fields (the 5 Understanding fields, `scope` prose). Makes "auto-upgrade" real for shape,
assisted for meaning. GPT-5.4 caveats: prevent the codemod from silently becoming a semantic author;
derived fields like `deployment_target` can be wrong yet look valid; codemod-migrated skills must NOT
get false "latest schema" legitimacy — leave explicit semantic-debt markers for the audit loop to drain.

---

## Progress log

**2026-05-30 — Break #1 (path drift) CLOSED.** The path bug was wider than first stated (4 live
sites, not 1) — confirmed by a file-existence check showing `batch-eval.js`, `skill-auto-create.js`,
and `skill-families.js` exist ONLY under `scripts/skill/`. Fixed across both repos, each commit
path-limited and verified:
- `skill-graph@f268023` — `lib/audit/skill-evolution-loop.js`: corrected scaffold path + added an
  `fs.existsSync` fail-loud guard (was failing silently into the result log).
- `workspace@6dc475784` — `scripts/skill/skills.js` (3 SCRIPT_PATHS: batch/create/families),
  `scripts/skill/skill-discovery-loop.js` (1 site), and `scripts/__tests__/skills.test.js` (the
  false-green create+batch assertions that GPT-5.4 flagged — now assert the real paths). (The first
  attempt `9e0a0c8b9` staged 8 files via a parallel-session race; it was soft-reset and recommitted
  clean as `6dc475784` — the multi-session-commit hazard in action.)
- `workspace@9c062858b` — `scripts/skill/skill-auto-create.js:38` `SKILL_FAMILIES_PATH` (the 5th
  silent-skip site; the `fileExists()` guard was skipping the families refresh).
- Verified (next session, 2026-05-30): `git log` confirms all four commits landed; the Break #1 grep
  receipt (array-form AND bare-string-form) returns empty across `scripts/skill` + `skill-graph/lib`;
  the `.legacy.js` copy already used the correct path. The 2 remaining `skills.test.js` failures
  (`design-guide`/`adr` skill resolution) are pre-existing and unrelated.

**2026-05-30 — Step 1 (SSOT before any behavior fix) — DONE for its safe scope.**
- _De-fork `evaluate-skill.js`._ Confirmed `scripts/skill/evaluate-skill.js` is already a clean shim
  (SH-6603). Found a SECOND, un-collapsed divergent copy: the top-level `scripts/evaluate-skill.js`
  carried duplicate eval helpers (`buildJudgePrompt`, `getEvalResponse`, `runClaudeCliPrompt`,
  `parseArgs`, `resolveWorkspaceFromEvalFile`, `normalizeWorkspace`) whose ONLY consumer was its own
  unit test — dead duplicates that could drift from the canonical. Collapsed it to a pure delegator;
  exported the three missing helpers from the canonical; repointed `scripts/__tests__/evaluate-skill.js`
  to exercise the SSOT (8/8 pass). Registered the second shim in `implementation-ownership.{json,md}`.
  Commits: `skill-graph@758738b` (canonical exports), `workspace@998302a4a` (collapse + test + registry).
  Verified: 8/8 helper test, 53/53 application-verdict test, 14/14 lib-audit smoke, ownership check pass.
- _Collapse the conflicting `evolve` meanings (E1)._ Rewrote `SKILL_AUDIT_LOOP.md` "Inner Pipeline of
  evolve" — the false "thin for-loop calling audit/improve/evaluate" pseudo-code matched neither the
  engine nor the CLI help. Now one honest meaning: a continuous analyzer-driven 5-phase loop
  (ANALYZE/TRIAGE/EXECUTE/VERIFY/CHECKPOINT) that composes the operations via the improve runner.
  Commit: `skill-graph@1c35224`.
- _Filed, NOT patched inline:_ the deeper implementation divergence — `scripts/skill/skill-evolution-loop.js`
  (468 non-comment lines) vs canonical `lib/audit/skill-evolution-loop.js` (1028; 1358 differing lines)
  is a behavior-bearing fork the SH-6603 collapse left as a full copy. Collapsing it is sequenced AFTER
  Step 0b (so the contract test backs it). Tracked as **SH-6642**.

**2026-05-30 — Step 0b (model-free black-box public-CLI contract test) — test authored; verify-wiring deferred to post-Step-3.**
- `skill-graph/scripts/__tests__/test-public-cli-loop-contract.js` (commit `skill-graph@4a3de1f`)
  drives the real `bin/skill-graph.js` surfaces — `audit`, `evaluate`, `evolve --analyze-only`, and the
  `init` create path — against a fixture skill (derived from the canonical template) in a hermetic
  mkdtemp workspace, with a **stubbed `claude`/`opencode`/`gemini` on PATH** returning canned
  concept-grade JSON (no real model). It asserts on-disk verdict/receipt transitions. **13/14 assertions
  pass.**
- **Break #2 is refined by the test (verified on disk):** `comprehension_verdict` + `freshness` ARE
  written by DEFAULT (`stampComprehensionVerdict`, unconditional, `evaluate-skill.js:2042-2044`). Only
  the v6 Health Block `eval_score` / `eval_failed_ids` remain gated behind `--write-verdict`
  (`evaluate-skill.js:2061`). The 1 red assertion (`eval_score` non-null by default) is the **forcing
  function for Step 3**; it flips green when Step 3 inverts that default.
- **Break #1 guard:** the test runs `evolve --analyze-only` end-to-end (exit 0) AND asserts the
  scaffold script the engine references (`skill-auto-create.js`) resolves to a real file — a path
  regression now fails the test instead of failing silently.
- **Not yet wired into `npm run verify`** — by design. A red test (the eval_score forcing function) in
  the shared gate would block parallel sessions; a green-while-broken test is the false-green
  anti-pattern. The test is wired into `verify` as the LAST sub-step once Step 3 makes it green.

**Ordering note (verified, do not reorder):** Step 2 BEFORE Step 3. Flipping the `--write-verdict`
default (Step 3) before receipts are durable (Step 2) would persist `eval_score` by default on the same
ephemeral `.cache/` receipt foundation — more verdicts that can outlive their evidence (Break #4). That
is the "looks smarter, same bug" trap GPT-5.4 flagged. Make receipts durable first (Step 2), then flip
the default (Step 3).

**Remaining:** Steps 2, 3, 5, 6, 7. **Next: Step 2** — make verdict-writing transactional with a
DURABLE artifact (not `.cache/`); promote `check-audit-manifest.js` application-artifact enforcement
from informational to blocking + move it into `npm run verify`; then reconcile the 14 orphan verdicts
(SYSTEM: identify + the script; CONTENT: the SKILL.md downgrades + missing `comprehension.json` route
via `/audit:*`). Then Step 3 (invert write-verdict default + fix the `bin/skill-graph.js:249` help-text;
flips the contract test green; THEN wire it into `npm run verify`), Step 5 (router → Health Block +
Decision A), Step 6 (field-shape codemod), Step 7 (end-to-end proof + corpus run).

**2026-05-30 (later session) — Step 2 MOSTLY DONE.**
- _Orphan reconciliation._ The 14 orphan verdicts were all run-records for skills **no longer in the
  library** (renamed/merged/deleted — verified: none of the 14 names resolve to a live SKILL.md
  anywhere). The plan's envisioned CONTENT path (downgrade the SKILL.md) is moot — there is no SKILL.md.
  They were **junk**, so they were deleted, not coded around (an earlier attempt to add "stale-record"
  classification logic to `check-audit-manifest.js` was reverted as bloat — the right fix for junk is
  `rm`). `check-audit-manifest.js` now exits 0 with **zero code change**. Commit `workspace@73f9e0f`
  (13 dirs / 122 files).
- _Durable receipts (Break #4)._ `evaluate-skill.js` now defaults both eval modes to the committed
  `audits/<skill>/eval-history/<ts>.json` home (was ephemeral `.cache/`), and the application
  `eval_last_run` receipt records the repo-relative `artifact:` path so a verdict cannot outlive its
  evidence. Additive (artifact written only when supplied) — 53/53 write-back tests pass. Commit
  `skill-graph@3ed080d`.
- _Gate wired into `npm run verify` (E3)._ Added `npm run audit-manifest:check` to the verify chain
  (after `status:check`) and rewrote the AGENTS.md "Separate gate" section — the evidence-honesty gate
  is no longer institutionally excluded from "green." Commit `skill-graph@8d3132a`.
- _NOT done (deliberately — out of the requested scope):_ promoting **application**-artifact enforcement
  from informational to blocking (`GRADED_APPLICATION_VERDICTS` is still defined-but-unused in
  `check-audit-manifest.js`). Verified there are currently **0** live application orphans, so this is a
  forward-looking hardening, not a live gap. Pick it up as a small follow-up when Step 5 touches the
  application axis.

**2026-05-31 — Step 3 DONE.**
- _Inverted the write-verdict default._ The v6 Health Block write (`eval_score` /
  `eval_failed_ids` / `freshness`) now persists **by default**; `--dry-run` is the single opt-out.
  `--write-verdict` is retained as a harmless no-op alias. Closes Break #2 (an unattended loop no longer
  produces zero durable verdicts by forgetting a flag). Commit `skill-graph@0883d0e`.
- _E2 (help-text lie) resolved by the code._ `bin/skill-graph.js` already documented "Writes (when not
  --dry-run): eval_score, eval_failed_ids, freshness …" — the code now matches the help, so no help-text
  edit was needed. The lie was the code, not the doc.
- _Step 0b contract test flipped GREEN and wired in._ The forcing-function assertion (`evaluate writes
  eval_score by default`) now passes on a real stubbed-model run (14/14). Added
  `test-public-cli-loop-contract.js` to the `test:unit` chain so it runs under `npm run verify` AND
  `verify:system` as the public-CLI loop guard. Commit `skill-graph@0514bb1`.
- _Portability regression fixed (caught by `test:unit`)._ The Step-2 durable-receipts commit (`3ed080d`)
  anchored the durable eval path to a hardcoded `SKILL_GRAPH_REPO_ROOT`, which `test-standalone-pipeline.js`
  forbids in `lib/` (breaks `npm install -g`). Re-resolved via the portable `log-paths.js` `LOG_DIR`.
  Folded into `0883d0e`. **Lesson: run the full `test:unit` suite per SYSTEM change, not just the one
  touched test** — Step 2's individual-test check missed this.
- `test:unit` green (exit 0) end to end.

**2026-05-31 — Step 4 (the open `--skip-eval` decision) RESOLVED.** The path-audit / fail-closed /
de-enshrine-the-false-green-test half of Step 4 was already done as Break #1 (earlier sessions). The one
open item — "Decide whether `/evolve` scaffold should keep `--skip-eval`" (finding E4) — is now resolved:
- _Decision: KEEP `--skip-eval`._ Verified by reading `skill-auto-create.js`: `--skip-eval` skips Phase 4
  (the A/B **grading run**), NOT Phase 2 (eval **authoring**). A scaffolded skill ships with its SKILL.md
  AND eval artifacts; it is created `UNVERIFIED`, not eval-less. Grading a brand-new unproven skill inline
  would add ~10min/skill to a throughput batch. The create→evaluate lifecycle completes on a LATER walker
  pass (UNVERIFIED → top-priority → `improve_skill` → generate→evaluate→keep/revert). So E4's "never
  completes" was an overstatement of a **deferred**, not skipped, lifecycle.
- _Fix: honesty._ The misleading comment ("Use /skill-discovery for eval-gated creation" implied evolve
  abandons the skill) + the silent `'created'` result were the real defects. The comment now states the
  true lifecycle and the success detail reports `created (UNVERIFIED — … grading deferred …)`. Commit
  `skill-graph@528c81d` (canonical engine only; workspace fork tracked under SH-6642, not sync-edited).
- _Surfaced dependency (NOT silently swallowed):_ the deferred grading only happens if the scaffolded
  skill is **committed** — improve/evaluate run on `git worktree add HEAD` (committed files only), so an
  uncommitted scaffold is invisible to the pass that would grade it. This is the real blocker to fully
  automatic `create→evaluate`, and it overlaps the worktree design + SH-6643 (generate_evals dispatch).
  Documented in the engine comment; left as a known dependency, not auto-fixed (auto-committing an
  AI-authored SKILL.md from the SYSTEM engine would cross the SYSTEM/CONTENT boundary).

**Remaining:** Steps 5, 6, 7 (+ the application-artifact-enforcement hardening from the Step 2 entry; + the
scaffold-commit-visibility dependency above, coupled to SH-6643).

**2026-05-31 — Step 5 DONE (router contract migration onto the four-verdict Health Block).**
- _Wired the router off `eval_state` onto the verdicts (5a)._ `scripts/skill-graph-route.js` now reads
  `structural_verdict` / `truth_verdict` / `application_verdict` from the (already-projected) manifest
  `health` block. The manifest already carried all four verdicts (`generate-manifest.js:433-443`) and
  `deriveAuditState`; only the router was blind to them.
- _Applied Decision A (5b)._ New Stage-6 verdict gate: (1) HARD integrity block — `structural_verdict=FAIL`
  / `truth_verdict=BROKEN` exclude a skill; UNVERIFIED structural/truth (the corpus default) stays
  routable (gating on PASS = ~90% kill-switch, the category error Decision A avoids). (2) BEHAVIOR
  gate-out — proven-negative `application_verdict` (HARMFUL/REDUNDANT/FALSE_POSITIVE) excluded, with
  expiry (skill `last_changed` after the grade, OR grade older than `NEGATIVE_VERDICT_EXPIRY_DAYS=90`)
  so a since-fixed skill isn't tombstoned. MIXED stays routable. (3) RANK-WEIGHT — APPLICABLE/PROVISIONAL
  get a gentle additive boost (+2/+1, < one keyword hit) folded into the sort key, recorded in the
  decision reasons; UNVERIFIED neutral. The opt-in `--min-eval-state` gate is preserved verbatim.
- _Receipt (5c)._ `scripts/__tests__/test-router-verdict-gate.js` (13 assertions, synthetic verdicts
  through the real `routeSkills`) wired into `test:unit`. The sample-manifest routing-eval baseline is
  provably unchanged (155 skills all-UNVERIFIED application → boost 0, zero negative/FAIL/BROKEN → zero
  new exclusions; HEAD vs post-change both 8 PASS / 2 FAIL on the asserted set). The live-corpus
  routing-eval red is pre-existing CONTENT drift (unmigrated skills missing `scope`), not this change.
- Commit `skill-graph@6fa82e1` (route.js + test + package.json, path-limited; parallel session's ~155
  staged `marketplace/*` files NOT swept in).

**2026-05-31 — SH-6548 DONE (application-artifact enforcement informational→blocking), folded into Step 5.**
- `GRADED_APPLICATION_VERDICTS` was defined-but-unused. `check-audit-manifest.js` now enforces it
  symmetric to the comprehension gate: a per-run verdict claiming a high-stakes graded
  `application_verdict` (APPLICABLE/MIXED/HARMFUL) requires `skills/<name>/evals/application.json`, with
  the same honest-downgrade escape hatch. `readSkillHealthBlock` extended to read `application_verdict`;
  `resolveComprehensionPath` generalized to `resolveEvalArtifact(ws, skill, name)` + wrappers.
- Verified **0 live application orphans** (57 run-records carry only (none)/UNVERIFIED/PROVISIONAL — none
  in the enforced set) → gate stays green; forward-looking hardening, not a live fix.
- Receipt: `scripts/__tests__/test-application-artifact-enforcement.js` (6 assertions, hermetic
  temp-workspace fixture) wired into `test:unit`. AGENTS.md gate description updated. Commit
  `skill-graph@a25df45` (path-limited).

**2026-05-31 — Step 6 DONE (version-agnostic field-shape normalizer, Decision B).**
- _Mechanism (per the user's chosen option)._ `skill-graph/scripts/normalize-skill-field-shape.js` reads
  the CURRENT schema's `required` set (no version number hardcoded → NOT a per-version codemod the
  clean-cut doctrine bans). `--report` (default, read-only, SYSTEM-safe) is the corpus debt ledger;
  `--apply` (writes SKILL.md = CONTENT) fills mechanical defaults + injects a `# semantic-debt:` marker.
- _GPT-5.4 guardrails honored._ MECHANICAL fields only (eval_artifacts/eval_state/routing_eval + the four
  UNVERIFIED Health verdicts — single honest default each). NEVER authors a semantic field
  (scope/subject/deployment_target/Understanding prose) — structurally impossible (not in
  MECHANICAL_DEFAULTS; guarded by a test assertion). NEVER bumps `schema_version` (earned-not-bumped); a
  touched skill with debt keeps its old label + the explicit marker → no false latest-schema legitimacy.
- _Doctrine reconciled._ Added an AGENTS.md § Major-Version-Clean-Cut carve-out citing Decision B: a
  version-agnostic normalizer is permitted standing infrastructure (distinct from the banned per-version
  `migrate-vN-to-vM.js`). Registered in AGENTS.md Validation Commands.
- _Significant honest finding (read-only report)._ **153 of 159 skills lack the v8-required `scope`** (only
  6 have it); 151 carry `schema_version: 8` while missing it → the label is corpus-wide AHEAD of content.
  `scope` is SEMANTIC → drains via /audit:*, NOT codemod. Commented onto the existing CONTENT task
  **SH-6591** (not duplicate-filed); also flagged lint-overlay's schema-unknown `extends`.
- Receipt: `scripts/__tests__/test-normalize-field-shape.js` (15 assertions) wired into test:unit.
  Commit `skill-graph@7ef6100` (path-limited).

**2026-05-31 — SH-6643 DONE (generate_evals self-contained; evolve execute unblocked).**
- Decision **(B)** self-contained (per ADR-0009). `generate_evals` now invokes the model IN-LOOP
  (`resolveModelExecutor` → `buildModelInvocation` → real claude/gemini/opencode CLI) instead of spawning
  the Development-tree `dispatch-solver.js` (which doesn't exist standalone AND lived at the wrong path —
  `scripts/loop/`, not flat `scripts/`). `checkpoint()`/`emitEvent()` resolve their orchestration script
  at the real subdir when present, else no-op gracefully (standalone-safe). Receipts:
  `test-evolve-self-contained.js` (11 assertions, in test:unit); `evolve --analyze-only` exit 0 / 0.3s;
  standalone-portability test green; lib-audit smoke green (added the `--analyze-only` SAFE_EXTRA_ARG —
  a bare run now reaches a real model call like the other execute-phase runners). Commit
  `skill-graph@93f6f77`. The full execute (authoring evals into a tracked skill via a real model) is
  CONTENT → audit loop / Step-7 CONTENT run, not a SYSTEM commit. Decision + receipts on SH-6643.

**2026-05-31 — Step 7: SYSTEM-completable portion DONE; the continuous graded chain + corpus run is CONTENT.**
- _Step-5 router exercised on REAL data (read-only, SYSTEM-safe)._ Generated a real-corpus manifest and ran
  `skill-graph-route "debug a failing test and find the root cause"`: `debugging` selected (eval_state
  passing); UNVERIFIED skills (pattern-recognition, problem-locating-solving, …) **still route** —
  confirming Decision A's "unknown ≠ bad" / no kill-switch on the real corpus; boundary exclusions fire;
  no integrity/behavior exclusions (the corpus has no FAIL/BROKEN/negative verdicts), so the verdict gate
  is live and non-destructive on real data.
- _Machinery proven._ The black-box public-CLI loop contract test (`test-public-cli-loop-contract.js`,
  stubbed grader, asserts on-disk verdict/receipt transitions) is in `test:unit`; every operation has a
  real-model receipt from the prior sessions recorded in the companion verification ledger (audit on
  api-design, evaluate application on okrs + comprehension on bayesian-reasoning with the Opus grader,
  improve keep/revert on acid-fundamentals with Opus). The loop is now fully UNBLOCKED end-to-end (router
  wired, evolve execute fixed, application gate enforced, codemod built).
- _What remains is CONTENT, not SYSTEM._ A fresh single continuous claim→audit→improve→evaluate(graded)→
  release→**commit** chain, and the multi-skill corpus run, mutate + commit real skills and need the live
  Opus pipe — that is CONTENT work through `/audit:*` (AUDIT_LOOP=1), which also drains the 153-skill
  `scope` debt (SH-6591). It is deliberately NOT run from this SYSTEM session (the session's discipline:
  never edit `skills/**/SKILL.md` in SYSTEM mode; auto-committing AI-authored skill content from the
  SYSTEM engine crosses the boundary).
- _Bonus SYSTEM fix._ `docs:drift` false-failed on the untracked `.opencode/` runtime tree (SH-6638 class —
  `schema_version: 7` strings in upgrade run-records are recorded data, not stale doc refs). Ignored
  `.opencode/` in `.gitignore`; docs:drift now green (58 docs). Commit `skill-graph@0015655`. Revealed a
  separate pre-existing red: `marketplace:verify` (stale/missing exports — etsy/okrs/principled-negotiation)
  is the **parallel session's** in-flight marketplace re-export (154 staged files) — CONTENT/export drift,
  not touched.

**2026-05-31 (later) — [P1] the "unblocked end-to-end" claim was FALSE for the documented runbook claim path; now fixed.**
A real-skill run (the exact discipline this plan champions) caught what code-reading and the hermetic
contract test missed: **`scripts/skill/skill-audit-claim.js` — the canonical Part-3 runbook claim entry —
could not claim ANY skill.** The SH-6377 ownership gate ran `git ls-files -- skills/` from
`REPO_ROOT = ~/Development` (workspace), but the SKILL.md corpus lives in a **separate nested git repo**
at `~/Development/skills`; git never traverses into a nested repo, so the tracked-set was empty and every
skill was judged "ignored/untracked" → `claim <slug>` refused all, `next` returned `null`. Compounded by a
flat-vs-nested mismatch (corpus is 100% nested `skills/<category>/<slug>/`; the gate synthesized a flat
path). The black-box contract test missed it because it uses a hermetic `mkdtemp` workspace and never
exercises the real nested-skills-repo claim gate. The CLI path (`bin/skill-graph.js audit`) was unaffected —
which is how the prior real-model receipts (api-design/okrs/bayesian-reasoning/acid-fundamentals) were
produced, bypassing this gate.
- _Fix (SYSTEM, bounded to the gate; SH-6377 safety preserved)._ `workspace@caba1ce0a`: added
  `SKILLS_REPO_ROOT = REPO_ROOT/skills`; the tracked-check defaults to it; `isUntrackedOrIgnored` now
  matches layout-agnostically (exact-path back-compat for the SH-6377 flat-fixture tests OR any tracked
  SKILL.md whose parent dir is the slug → handles nested). gitignored/internal skills still refused.
  Verified: 9/9 `skill-audit-claim.test.js` pass; `claim porters-five-forces` now succeeds (was refused);
  `next` recovers (was null).
- _Separate follow-up filed (NOT patched here)._ `next` now returns **pathy** skill names because
  `scripts/skill/build-skill-list.js` emits a worklist with corrupted identity: 155/157 entries carry the
  category path as the `skill` name + a doubled `skills/skills/` path; 2 are flat-stale; 157 entries vs 159
  corpus skills. Same flat-vs-nested drift, second script. Tracked as **SH-6649** (CONTENT-mode `next`/
  `evolve` queue driver — SYSTEM script fix).

**Status (corrected 2026-05-31):** The SKILL SYSTEM machinery is **substantially** complete and verified —
all Steps 0b/1–7 receipts hold AND the workspace claim gate that bricked the documented runbook path is now
fixed. **Not yet 100%:** the worklist generator (`build-skill-list.js`) still emits drifted entries
(SH-6649), so the `next`/`evolve` queue driver is unreliable until that lands — `claim <explicit-slug>`
works. Remaining work is CONTENT (the graded chain + corpus run via `/audit:*`, draining SH-6591) plus the
SH-6649 worklist fix and the parallel-owned marketplace export. **Lesson reaffirmed:** "done" requires a
real-run receipt on a real skill through the *documented* entry point, not the CLI fallback — the contract
test must exercise the real claim gate against the real nested skills repo, not only a hermetic fixture.

## Part 5 — Corrected fix plan (SYSTEM mode, one concern per commit; re-sequenced per the reviews)

GPT-5.4's framing drives the order: **"the system rewards component truth instead of contract truth."**
The ONE highest-leverage change is a blocking black-box test that drives the **public CLI** through the
real loop and asserts on-disk state transitions — so "done" can only mean "the real loop ran."

- **Step 0 (highest leverage) — model-free black-box public-CLI contract test, wired into `npm run verify`.**
  Drive `bin/skill-graph.js` through `audit → evaluate → evolve` AND the create/scaffold path on a fixture
  skill, with a STUBBED grader (`--grader-cli "cat canned-verdict.json"`), asserting verdicts/receipts
  land on disk. Must exercise the public surfaces (not unit internals) or it misses Break #1's class.
- **Step 1 — collapse the conflicting `evolve` execution paths** (docs vs `bin` vs the auto-improve
  engine) AND de-fork `evaluate-skill.js` (SH-6603). One meaning, one implementation, before any behavior fix.
- **Step 2 — make verdict-writing transactional with a DURABLE artifact** (not `.cache/`), and move
  `check-audit-manifest.js` into `npm run verify` with application-artifact enforcement promoted from
  "informational" to blocking. Then reconcile the 14 orphans (downgrade to `UNVERIFIED` where no artifact;
  authoring the missing `comprehension.json` is CONTENT, routes via `/audit:*`). This is the real fix; Step 3 is cleanup.
- **Step 3 — invert the write-verdict default to persist-by-default** (`--dry-run` to opt out) and fix the
  `bin/skill-graph.js:249` help-text lie.
- **Step 4 — path audit + fail-closed for `skill-auto-create`** across `skill-evolution-loop.js`,
  `skills.js:36`, `skill-discovery-loop.js:404`, and fix the enshrining test `skills.test.js:121`; make
  scaffold fail loud. Decide whether `/evolve` scaffold should keep `--skip-eval` (it breaks "auto create→evaluate").
- **Step 5 — wire the router to the four-verdict Health Block** (contract migration off `eval_state`),
  THEN apply Decision A (gate-out-negatives + rank-weight) with negative-verdict expiry. Per GPT-5.4's
  dissent, do NOT do the ranking change before Steps 0–1 land.
- **Step 6 — deterministic field-shape migrator** (Decision B) with explicit semantic-debt markers.
- **Step 7 — one green end-to-end proof run on a real skill** (now backed by Step 0's regression test),
  then a small corpus run to show self-maintenance, not just one specimen.

Each step is its own SYSTEM task. Cross-mode discoveries (skills missing `comprehension.json`) are FILED
for the CONTENT audit loop, not patched inline.

## Verification (definition of done for THIS plan)
- `npm run verify` includes a black-box public-CLI loop test that drives audit→evaluate→evolve+create and
  asserts on-disk verdict/receipt transitions (and goes red on Breaks #1/#2/#3).
- `evaluate-skill.js` writes `application_verdict` + a DURABLE `eval_last_run` receipt with no special flag.
- `node skill-graph/scripts/check-audit-manifest.js` exits 0 AND is part of `npm run verify`.
- The router reads the four-verdict Health Block (not `eval_state`); negatives demote, `UNVERIFIED` routes.
- One real skill goes claim→audit→improve→evaluate(graded, top model)→release→commit, manifest green.

---

## Part 6 — Review synthesis (2 Claude skill-distiller passes + analysis + real GPT-5.4 review)

Sources, honestly attributed: **(S1)** Claude Explore pass distilling 9 knowledge-organization /
meta-methods / quality skills; **(S2)** Claude Explore pass distilling 8 code-engineering skills;
**(A)** my own verified code reads; **(G)** a real **GPT-5.4** adversarial review via Codex (Part 7,
verbatim; it grepped the repo and cites file:line). GPT-5.5 was attempted but its agentic run wasn't
cleanly captured. All findings preserved; severity per the canonical schema.

### 6a. Decision A is right but is a CONTRACT migration, not a scoring tweak (S1 ontology + quality-doctrine, G)
Covered in Part 4. The sharpest addition from G: the router gates on `eval_state` (`skill-graph-route.js:16`),
so the verdicts aren't wired into routing at all yet — Step 5.

### 6b. Root cause — no model-free black-box CONTRACT test (S2 testing-strategy/eval-driven-development, G)
The Behavior Gate needs a paid model → never runs in CI → "done" = code-reading. The fix is Step 0.
S2's regression-test design (fixture skills: clean / drifted / improvement-ready; assert verdicts +
artifacts) and G's "black-box public-CLI contract test" are the same prescription. G sharpened it:
the test must drive the **public CLI surfaces incl. create/scaffold**, or it misses Break #1's class.

### 6c. Break #1 is worse and wider than first stated (A verified, G corroborated)
Reading the actual code (`skill-evolution-loop.js:583-591`): no resolver, no fallback — a bare wrong path
`spawnSync`'d, the error swallowed into `result.status`, so scaffold **fails silently**. The same wrong
path is in `skills.js:36`, `skill-discovery-loop.js:404`, and **asserted by a test** (`skills.test.js:121`)
— the test is green while the path is broken (false-green). Corrected from "crash" → "silent, replicated,
test-enshrined failure."

### 6d. Verdict/artifact integrity is a write-path defect, not a cleanup chore (S1 methodical + evaluation, S2 typescript-patterns, G)
The 14 orphans (methodical anti-pattern #6 assumed-verification + #7 deferral-as-completion) exist because
the write path *allows* a verdict with no artifact. S2: make the illegal state unrepresentable — a verdict
factory requiring a verified, durable artifact path. G: receipts default to `.cache/` and record only
timestamp/status/runner, so verdicts can outlive evidence; and the manifest gate only enforces
comprehension artifacts (application is "informational"). → Step 2.

### 6e. Decision B is right with guardrails (S1 quality-doctrine version-labels, G)
Codemod for mechanical fields, agent for semantic — but mark semantic debt so codemod-migrated skills don't
get false "latest-schema" legitimacy, and don't let the codemod silently author meaning. → Step 6.

### 6f. All remaining findings (complete; none dropped)

| # | Sev | Finding | Source |
|---|---|---|---|
| E1 | P1 | `evolve` has conflicting meanings/implementations: docs `audit→improve→evaluate` (`SKILL_AUDIT_LOOP.md:220`) vs `bin/skill-graph.js:177` wiring to a separate continuous auto-improve engine. Collapse to one. | G (direct) |
| E2 | P1 | The `evaluate` CLI help is a doc-lie: promises default Health-Block writes (`bin/skill-graph.js:249`) but code requires `--write-verdict` (`evaluate-skill.js:2045`). | G (direct) |
| E3 | P1 | False-green as policy: the evidence-honesty gate is institutionally excluded from "green" (`build-status-doc.js:281`, `AGENTS.md:591/595`). | G (direct) |
| E4 | P1 | `/evolve` scaffolds with `--skip-eval` by design (`skill-evolution-loop.js:580`) → new skills never complete create→evaluate automatically, defeating the "auto" goal. | G (direct) |
| E5 | P1 | `improve`'s keep-or-revert has no baseline on the 92.5% of skills without evals → "revert if score drops" has no reference; may be a silent no-op on most of the corpus. | A (inference) |
| E6 | P2 | "Researched" (user's pipeline step) has NO verdict field and NO artifact requirement → unverifiable, will be silently skipped like the behavior half was. | A (inference) |
| E7 | P2 | `boundary` relation is a semantics+ontology naming defect — needs a multi-paragraph WARNING to explain, which by the semantics skill's own test proves the name is wrong. Rename to a directional verb-phrase. | S1 semantics+ontology |
| E8 | P2 | Grader logic is inlined in `evaluate-skill.js` (graders are .md prompts) → un-testable in isolation. Extract `gradeComprehension()`/`gradeApplication()` as testable units. | S2 eval-harness |
| E9 | P3 | `deployment_target` is a low-entropy facet (~90% `portable`) carrying almost no routing-classification load. Accept as coarse stratum or augment. | S1 taxonomy |
| E10 | P3 | `scope` is semantically overloaded (legacy enum `codebase/workspace/operational` vs new free-text PRD; legacy skills still carry `scope: codebase`). | S1 semantics |
| E11 | P3 | Eligibility-gate + low coverage creates a perverse incentive to mass-stamp PROVISIONAL to stay routable — plausibly how the 14 orphans happened. | A (speculation) |
| E12 | P4 | 14 orphans are all `codex`/`gpt55`-authored PROVISIONAL — find that batch run's command; confirm it isn't still scheduled. | A (direct) |
| E13 | P4 | KEEP: comprehension/application verdict separation is textbook construct validity; "author grades own skill = PROVISIONAL" is the correct self-eval-bias mitigation. Do not weaken. | S1 evaluation+self-evaluation, G |

### 6g. GPT-5.4's dissent (recorded verbatim, Part 7)
> "I would not do the router policy change before collapsing the execution paths and proving the public
> loop contract; changing ranking on top of a lying state machine makes the system look smarter while
> preserving the same recurrence bug."

This is why Decision A's implementation (Step 5) is sequenced AFTER Steps 0–1, not first.

---

## Part 7 — GPT-5.4 review, verbatim (real run via Codex, 2026-05-30)

> Model: GPT-5.4 via Codex CLI (codex-cli 0.130.0, provider openai, reasoning xhigh). Command:
> `codex exec -m gpt-5.4 --skip-git-repo-check` from `~/Development`. It read the repo and cites file:line.

1. The architecture is conceptually sound, but operationally under-specified for self-maintenance. The 2-gate split is right, and the 4 verdicts are not the problem. The problem is that the named operations do not map cleanly to one executable state machine. The docs used the superseded thin-loop phrasing for `evolve` in SKILL_AUDIT_LOOP.md:220, but the public CLI wires `evolve` to a different continuous auto-improve engine in bin/skill-graph.js:177, whose implementation is analyzer/triage/execute/checkpoint orchestration in lib/audit/skill-evolution-loop.js:4. That is not over-engineering in concepts; it is too many unchecked execution paths.

2. The two user decisions are mostly correct.
- `Gate-out only proven-negative behavior verdicts; rank-weight the rest` is the right call for behavior routing. It avoids deleting 90% of the library for lack of evidence. Failure modes: if you apply this to structural/truth gates too, you will route broken skills; if `UNVERIFIED` is only weakly penalized, the router becomes a popularity contest over unassessed skills; if negative verdicts never expire, one bad run can tombstone a fixed skill.
- `Allow a deterministic codemod for mechanical fields` is also correct. Failure modes: the codemod quietly becomes a semantic author; derived fields like `deployment_target` are wrong but look valid; migrated skills get false "latest schema" legitimacy unless the codemod leaves explicit semantic debt behind.

3. The Step0-7 plan fixes honesty, but as written it still trends toward an operator-assisted loop, not a self-maintaining one.
- Step0 is the right first move only if it is a black-box public-CLI contract test. If it does not execute the actual `skill-graph` surfaces, including the create/scaffold path, it will miss the exact failure class you care about.
- Step1 is too narrow. De-forking `evaluate-skill.js` matters, but the deeper split is that `evolve` itself exists as conflicting implementations and meanings.
- Step2 is more important than Step3. Transactional verdict + artifact write-back is the real fix; flipping the default is cleanup.
- Step4 must become "path audit plus fail-closed," not "fix one path." The bad `scripts/skill-auto-create.js` path is also encoded in scripts/skill/skills.js:36, scripts/skill/skill-discovery-loop.js:404, and even a test in scripts/__tests__/skills.test.js:121.
- Step5 is mis-sequenced. The router still gates on `eval_state` in skill-graph-route.js:16, not the four-verdict Health Block. That is a contract migration, not a scoring tweak.
- Step7 is necessary but insufficient. One green real-skill run proves one specimen. It does not prove corpus self-maintenance.
- Most importantly: `/evolve` currently scaffolds with `--skip-eval` by design in lib/audit/skill-evolution-loop.js:580. So even after Break #1 is fixed, new skills still do not complete your intended `create → evaluate` lifecycle automatically.

4. It keeps getting declared "done" because the system rewards component truth instead of contract truth. The public help says `evaluate` writes Health Block state in bin/skill-graph.js:249, but the implementation only writes `eval_score` and related fields behind `--write-verdict` in evaluate-skill.js:2045. The dashboard/status layer intentionally omits the evidence-honesty gate in build-status-doc.js:281, and the repo doctrine explicitly blesses that separation in AGENTS.md:591. The one change that most reduces recurrence is a blocking black-box contract test in `verify` that drives the public CLI through `audit`, `evaluate`, `evolve`, and a create-skill path, then asserts the on-disk state transitions. That forces "done" to mean "the real loop ran."

5. Off-rubric findings:
- `[direct]` The public `evaluate` help lies today: it promises default Health Block writes, but code requires `--write-verdict` for `eval_score`/`eval_failed_ids`/`freshness` in bin/skill-graph.js:249 vs evaluate-skill.js:2045.
- `[direct]` The evidence-consistency gate is institutionally excluded from "green" status in both build-status-doc.js:281 and AGENTS.md:595. That encodes false-green as policy.
- `[direct]` `check-audit-manifest` still enforces comprehension-artifact honesty only; application-artifact enforcement is explicitly "informational" in check-audit-manifest.js:48, despite the docs claiming graded application verdicts require application artifacts.
- `[direct]` The bad `skill-auto-create` path is not an isolated typo; it is repeated in multiple dispatchers and a test, so the failure class is currently reinforced by the codebase.
- `[direct]` I reran `check-audit-manifest`; it currently reports 14 live graded-comprehension claims with no artifact. That means the ledger is not just theoretically inconsistent; it is red now.
- `[inference]` Step2 needs durable receipts, not just write-back. Application eval results default to `.cache/...json` in evaluate-skill.js:1945, while the stamped receipt only records timestamp/status/runner in evaluate-skill.js:1775. Verdicts can outlive evidence.

DISSENT: I would not do the router policy change before collapsing the execution paths and proving the public loop contract; changing ranking on top of a lying state machine makes the system look smarter while preserving the same recurrence bug.

Completeness: this review covers all 5 requested questions and includes 6 additional findings grounded in the live docs, scripts, and direct command output.

---

## Session Progress — 2026-05-31 (cont., SYSTEM gate done)

SH-6650 (the gating SYSTEM task) is **DONE**. Sequence executed system-first:

1. **Corpus cleanup** (`skills@315b877`): deleted flat v7 `code-review/` (stale dup — canonical is the v8 nested `skills/quality-assurance/code-review/`); migrated orphan `skill-evolution/` → `skills/knowledge-organization/skill-evolution/` (relocation only; v8 content migration is separate CONTENT debt — it still carries `scope: codebase`, 0 evals, 1 broken key-file path to `skill-graph/SKILL_AUDIT_LOOP.md`, all routing to the SH-6591 drain).
2. **Manifest regen** (`workspace@79926d5de`): `summary.active` 157 → **160**; matches census. Diff also absorbed the SH-6596 v8 migrations not yet re-manifested.
3. **Tests green** (run via `node`, not jest — jest globs `.claude/worktrees/` and crashes): walker 3/3, census 24/0, regressions 8/0.
4. **`next→claim` round-trip verified**: `cognitive-load-theory` claimed (bare slug, run_id written) + released clean.
5. **Count doc** (`skill-graph@1ef4588`): `SKILL_GRAPH.md § Current State` canonical count 155 → **160** (161 w/ template).

**Count reconciliation:** final corpus is **160**, not the plan's predicted **159** — because `skill-evolution` was *migrated, not deleted* (per the explicit do-not-delete instruction), so net removal was 1 (the `code-review` dup), not 2. `manifest == corpus` (the real AC) holds at 160.

**Process note (transparency):** the `skill-graph@1ef4588` count commit also swept in a parallel session's uncommitted SKILL_GRAPH.md doc-link-path migration (bare `SKILL_METADATA_PROTOCOL.md`/`SKILL_AUDIT_LOOP.md` refs → subdir paths) sitting in the working tree — `git commit --only <path>` commits the whole file's on-disk delta. Those changes are valid and align with the canonical AGENTS.md structure; nothing lost. Lesson: the multi-session defensive `git diff HEAD -- <file>` must be read in full, not grepped for one's own line.

**Item 3 (application gate — primary DoD gap) — PROVEN LIVE.** First real gate-9 run on a real skill: single-model Opus on `debugging` (3 cases × 3 trials, grader=Opus via `claude` CLI = MAX/no API billing; user chose Opus-only PROVISIONAL over the cross-family external run). Result: 2/2 real cases **REDUNDANT** (Opus debugs well without the skill), red-herring case correctly avoided over-owning a refactor (`false_positive_avoidance` 2/2). Stamped `application_verdict: REDUNDANT` + `eval_last_run` receipt → `skills@3546e03`. **Doctrine confirmed:** negative verdicts record the single-model grader signal honestly (`verdict-semantics.md:126`); only positive APPLICABLE caps to PROVISIONAL — so REDUNDANT is the correct stamp, NOT a downgrade to PROVISIONAL. The gate now demonstrably produces real, receipted verdicts. To earn APPLICABLE (or overturn REDUNDANT) at higher confidence requires the deferred cross-family dual-run (needs external-model approval per `claude-billing-guard`).

**Finding filed (SH-6651, P3 doc-drift):** `version-schema-contract.md § 5` groups the negative verdicts with PASS/APPLICABLE as "dual-run only," contradicting canonical `verdict-semantics.md:126`. Runtime is correct (rule defers to canonical); the § 5 wording needs a reword. SYSTEM task — not patched inline (CONTENT session).

**Item 4 (SH-6591 `scope` drain) — IN PROGRESS, 62/152 drained.** `/evolve` CONTENT pass: Opus-authored PRD-style `scope` (positive scope + portability/grounding + explicit exclusions) for 62 skills — 14 code-engineering, 16 agent-ops, 3 data-analytics, 19 design-craft, 10 frontend-ui — one skill per path-limited commit, `AUDIT_LOOP=1`, lint 0 errors each. Applier is now indent-aware (handles flat col-0 + nested 2-space encodings, after the flat-encoding `task-path-optimization` exposed a hardcoded-indent bug). **Key finding: the "152 missing scope" is two populations** — **122 v8 skills** that genuinely just need `scope` (the drain proper), and **8 v7 skills** (of 9 v7 total) that are un-migrated and fail lint on a scope-only add (`schema_version:7` error); those route to the v7→v8 migration effort (`audit --fix`, version-earned gate), NOT the scope drain. **Efficient continuation pattern:** batch-read descriptions → Opus authors scopes → mechanical applier inserts after `deployment_target` (idempotent, skips v7) → lint → per-skill commit `AUDIT_LOOP=1` (~5 calls/8 skills; authoring stays Opus, only insertion scripted). Progress posted to SH-6591.

**Remaining:** item 4 continuation (82 v8 skills still need scope); the 9 v7 skills (v7→v8 migration, separate from scope); item 5 (field-purpose-comment backfill — `--apply` is CONTENT via the loop); manifest regen once the drain is further along (deferred to avoid churn); the deferred **certifying cross-family** application run to lift `debugging` (and others) from single-model to grader-confirmed.

---

## Next-Session Continuation Prompt (authored 2026-05-31)

> Paste this to resume. SYSTEM machinery is verified complete; the claim-gate brick is fixed
> (`workspace@caba1ce0a`), the worklist bare-slug fix landed (`workspace@bfd890899`, SH-6649 Done),
> and ONE full graded chain is proven live on `porters-five-forces`
> (`skills@887725c` + `skill-graph@3b79a08`): comprehension gate, Opus grader → `SKIPPED_BASELINE_HIGH`,
> truth-source drift fixed, `scope` authored. What remains is below, in system-first order.

```
Resume the Skill Audit Loop end-to-end completion. Read
skill-graph/docs/plans/skill-audit-loop-end-to-end-completion-2026-05-30.md (progress log + Part 4
decisions) first. Mode discipline: SH-6650/manifest/docs = SYSTEM; application certification + SH-6591
drain = CONTENT via /audit:* with AUDIT_LOOP=1 — declare mode, never mix. Grading uses Opus or GPT-5.4
only (no-lesser-models-for-quality). Commit path-limited (git commit --only) per multi-session-commits.

Remaining work, system-first:

1. [SYSTEM, GATING] SH-6650 — manifest-name design decision + corpus cleanup. Decide: manifest `name`
   = bare frontmatter slug (protocol-aligned; what the claim/ledger/artifact/router system all use) vs
   the current deliberately-namespaced census output (asserted by test-skill-census-walker.js). Evidence
   strongly favors bare. If bare: first resolve the corpus issues — the `code-review` DUPLICATE (flat
   skills/code-review/ AND nested skills/skills/quality-assurance/code-review/) and the ORPHAN flat
   skill-evolution (no nested copy; migrate, don't delete) — THEN make skill-census.js use the frontmatter
   name, update the 2 walker-test assertions (test-skill-census-walker.js) with justification, and
   regenerate the manifest (count should reach 159). This unblocks reliable /evolve corpus-walking and
   fixes the 2 pre-existing test failures (skill-census.test.js "namespace containers" count 1-vs-2;
   skill-tooling-regressions.test.js "keyword-matrix walkSkillDir"). Per system-first, do this BEFORE the
   corpus run.

2. [CONTENT, PRIMARY DoD GAP] Prove the APPLICATION gate (gate 9) live — the plan's primary quality
   signal, still UNVERIFIED for every skill. Author evals/application.json for one tracked, eval-ready
   skill, then run a CERTIFYING cross-family dual-run:
     node skill-graph/bin/skill-graph.js evaluate --mode application --application <skill-dir> \
       --certifying --generator-family <A> --grader-family <B> <skill-dir>/evals/application.json
   to earn application_verdict: APPLICABLE on real artifacts (Opus/GPT-5.4 grader). Commit per skill.

3. [CONTENT] SH-6591 corpus drain — author `scope` for the ~152 remaining skills missing it (porters
   was the first), via /audit:* (AUDIT_LOOP=1), one skill per path-limited commit. Optionally run /evolve
   --top N for the broader graded corpus pass once SH-6650 makes the worklist queue reliable.

4. [SYSTEM] After SH-6650: regenerate the manifest + SKILL_GRAPH.md § Current State counts (deferred this
   session — a parallel session's marketplace re-export was in flight; coordinate to avoid the high-race
   doc clobber).

5. [SYSTEM, minor] Backfill field-purpose comments corpus-wide
   (node skill-graph/scripts/backfill-field-purpose-comments.js) — lint warning on porters-five-forces
   (6 top-level fields) and likely most skills.

First action: declare mode (SH-6650 = SYSTEM), then start SH-6650 — it gates the corpus run.
```

### Next-Session Continuation Prompt (authored 2026-05-31, after the 62-skill scope drain)

```
Resume the Skill Audit Loop end-to-end completion. Read
skill-graph/docs/plans/skill-audit-loop-end-to-end-completion-2026-05-30.md (progress log) FIRST.
Mode: SH-6591 scope drain + certifying eval = CONTENT via /audit:* with AUDIT_LOOP=1; manifest
regen + SKILL_GRAPH count + field-comment-backfill SYSTEM call = declare per task. Grading uses
Opus or GPT-5.4 only (no-lesser-models). Commit path-limited (git commit --only), one skill per commit.

STATE (2026-05-31): SH-6650 DONE (corpus 160, manifest regen, bare-slug census, count doc). Application
gate PROVEN LIVE — debugging stamped application_verdict: REDUNDANT (single-model Opus, PROVISIONAL
tier, receipted; skills@3546e03). SH-6651 filed (version-schema-contract §5 vs verdict-semantics:126
doc drift). Scope drain (SH-6591) at 70/152 with scope: 62 authored this session
(code-engineering 14, agent-ops 16, data-analytics 3, design-craft 19, frontend-ui 10).

REMAINING, in order:

1. [CONTENT] Continue the scope drain — 82 v8 skills still need `scope` (knowledge-organization,
   meta-methods, product-domain, quality-assurance, + remaining frontend-ui/data-analytics). PROVEN
   PATTERN: list next batch of v8-missing-scope skills with descriptions
   (find skills/skills -name SKILL.md | filter: no `scope:`, not schema_version:7), Opus authors a
   PRD-style scope each (positive scope + portability/grounding + explicit exclusions, mirroring the
   skill's own description boundary — see porters-five-forces as the reference), then a small node
   applier inserts `scope` after the deployment_target line MATCHING ITS INDENT (flat col-0 vs nested
   2-space — both encodings exist; hardcoding 2-space breaks flat skills like task-path-optimization),
   skip any schema_version:7 skill, skill-lint each (0 errors; the field-purpose-comment WARNING is
   item 5, ignore), then one path-limited AUDIT_LOOP=1 commit per skill. ~6 calls per 10 skills.
   Authoring stays Opus; only insertion is scripted. NEVER let an internal persona/path (e.g. the
   Sales Hub "Side Hustler") leak into a portable skill's scope.

2. [CONTENT] The 9 v7 skills (8 missing scope) are a SEPARATE backlog — a scope-only add fails lint
   (schema_version:7). Migrate v7->v8 via `node skill-graph/bin/skill-graph.js audit <skill> --fix`
   (mechanical: type/category->subject/deployment_target, bump, regenerate comments), then author scope,
   then lint+commit. Governed by the version-earned gate. v7 list: run
   `for f in $(find skills/skills -name SKILL.md); do grep -lE '^\s*schema_version:\s*7\b' "$f"; done`.

3. [SYSTEM] When the scope drain completes: regenerate the manifest
   (node scripts/skill/skill-census.js --write-manifest) and re-check SKILL_GRAPH.md § Current State
   (count stays 160; scope coverage improves). Then verify `next->claim` still round-trips. SH-6591 -> Done
   once 0 v8 skills are missing scope.

4. [CONTENT, deferred] Certifying cross-family application run to lift debugging (REDUNDANT/PROVISIONAL)
   and other eval-ready skills (a11y, testing-strategy, skill-router, skill-infrastructure, okrs have
   application.json) to a grader-confirmed verdict. REQUIRES external-model approval (cross-family =
   1 Anthropic + 1 non-Anthropic; billing-guard). Ask the user before dispatching GPT-5.4/Gemini.

5. [SYSTEM, minor] node skill-graph/scripts/backfill-field-purpose-comments.js corpus-wide (item 5) —
   note --apply writes SKILL.md so it is CONTENT via the loop, not a SYSTEM commit. Clears the
   field-purpose-comment lint warning present on most skills.

ENVIRONMENT: a parallel session is migrating/exporting the skills repo (v8 migrations, marketplace
re-export, flat-copy cleanup). The audit-claim system deconflicts per-skill; for shared docs
(SKILL_GRAPH.md, manifest) commit immediately after edit and read the FULL `git diff HEAD -- <file>`
before committing (git commit --only commits the whole file's on-disk delta — a parallel session's
uncommitted edits to the same file WILL be swept into your commit, as happened with skill-graph@1ef4588).

First action: declare mode (scope drain = CONTENT), then continue item 1 — list the next batch of v8
skills missing scope and drain it.
```
