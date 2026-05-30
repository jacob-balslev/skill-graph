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
  describe `evolve` as a thin `audit → improve → evaluate` loop, but `bin/skill-graph.js:177` wires it
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

1. The architecture is conceptually sound, but operationally under-specified for self-maintenance. The 2-gate split is right, and the 4 verdicts are not the problem. The problem is that the named operations do not map cleanly to one executable state machine. The docs say `evolve` is a thin `audit → improve → evaluate` loop in SKILL_AUDIT_LOOP.md:220, but the public CLI wires `evolve` to a different continuous auto-improve engine in bin/skill-graph.js:177, whose implementation is analyzer/triage/execute/checkpoint orchestration in lib/audit/skill-evolution-loop.js:4. That is not over-engineering in concepts; it is too many unchecked execution paths.

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
