# Resume State — Advisory-Research Fix + eval-driven-development Panel Run (2026-06-06)

> Type: Plan (active). SYSTEM fix in progress + CONTENT run mid-flight. Written pre-/compact for cross-session resume.

## The in-session loop architecture (how this run is driven)

The Skill Audit Loop is driven **in-session through the Agent tool** so every model is a visible row in the **native Claude Code subagent panel** (↑/↓ · Enter) — the user's hard requirement (NOT `run-panel-enrich.js` as a background shell command; NOT tmux; NOT the statusline). Per-model primitives (committed, `skill-graph 1786a17`):

- `lib/audit/propose-one.js` (pre-existing), `cross-review-one.js`, `revise-one.js`, `curate-one.js` — each a thin CLI over the tested live deps (`panel-enrich-live-deps.js`), writing an authoritative `result.json` the orchestrating session reads from disk.
- Dispatch: **Opus 4.8 native** (Agent `model:opus`, it writes its output file directly); **GPT-5.5 + advisory** via `Agent model:sonnet` wrappers running the `*-one.js` primitive (which shells that model's own CLI). Agent `description` = the **registry display name** (`resolveDisplayName` in `lib/audit-shared/model-provider.js`: Opus 4.8, GPT-5.5, Gemini 3.1 Pro, Gemini 3 Flash, MiniMax M3, Nemotron 3 Ultra, Big Pickle, DeepSeek V4 Flash, MiMo V2.5).
- Run dir: `skill-graph/.opencode/progress/agenttool/<skill>/<model>/`. `panel.json` lists alive proposals.

## CONTENT run: eval-driven-development (skills/skills/ai-engineering/eval-driven-development)

- Phase 1 propose: **8/9 done** (DeepSeek V4 Flash failed first — see fix below; quorum = Opus 4.8 + GPT-5.5, both real research). Proposals on disk.
- Phase 2 cross-review **round 1: done** — ~117 feedback items from 6 reviewers (Opus 54, GPT-5.5 28, Gemini 3.1 Pro 14, Gemini 3 Flash 7, Big Pickle 7, MiniMax 7; MiMo + Nemotron empty/non-blocking). Aggregated to per-model `feedback-r1.json`.
- Phase 2 revise **round 1: done** — 6 changed (Opus, GPT-5.5, Gemini 3.1 Pro, Gemini 3 Flash, Big Pickle, MiMo), 2 unchanged (MiniMax, Nemotron). `hashes-before-r1.json` snapshotted.
- **NEXT: Round 2 cross-review/revise** (stability 0.25 < 1.0 at round 1; maxRounds=3) → then curate (Opus curator, `curate-one.js`, strict anti-loss + mandatory-coverage) → eval guardrail (eval-mode comprehension; only `evals/comprehension.json` exists, no `application.json` → SKIP → KEEP) → apply (write merged enriched SKILL.md to source, commit CONTENT path-limited).

## SYSTEM fix: advisory models must do their OWN research (NOT inline-only)

**Doctrine** (`docs/audit-loop-enrich-philosophy.md` line 35/97): "Research IS the curation mechanism"; "❌ Disabling the agents' tools or forbidding research". Advisory models are full RESEARCHERS — "advisory" is their DECISION role only (Opus 4.8 + GPT-5.5 curate + decide).

**Root cause found:** the panel advisory dispatch (`advisoryDispatch` in `panel-enrich-live-deps.js`) bypassed the kernel Seatbelt fence the frontier path uses (`isolated-checkout.js prepareOsFence`), so advisory models couldn't be given safe file access — and a prior workaround scoped opencode `--dir` to an empty run dir + "don't read, it's inline", demoting advisory to inline-reasoner.

**Fix applied (UNCOMMITTED in `lib/audit/panel-enrich-live-deps.js`):**
- Import `prepareOsFence`/`resolveOsFenceEnabled`; build `advisoryOsFence` over `defaultPublicRoots` (skill-graph + skills + audit-artifacts); wrap every advisory CLI in it.
- opencode `--dir = skills tree root` when fence active (NOT workspace root — that EPERMs at startup since the Seatbelt denies the workspace root itself; opencode lstats its `--dir` exactly), else narrow run-dir (degraded, safe). gemini `cwd = skill-graph`.
- Prompt restored to "research repo + web, tools ON" (deleted the "do not read" lines). Module header + comments updated. `os` import removed.
- **Unit tests pass:** panel-enrich-live-deps 7/7, isolated-checkout 11/11 (incl. live Seatbelt), panel-enrich 17/17.
- **Live-verified research WORKS:** DeepSeek read the skill + ran 8 web searches, no EPERM, no external_directory reject.

**REMAINING (do before committing — the fix is unsafe without it):** the write-capable model wrote its output INTO the canonical source skill dir (mutated `skills/.../eval-driven-development/SKILL.md` 248→314 + a stray `novelty-memo.md`). Already reverted (`git restore` + `rm`). To prevent it structurally:
1. **Make skills + skill-graph roots READ-ONLY in the advisory Seatbelt** (only the audit run dir writable) — needs a `buildSeatbeltProfile` enhancement in `isolated-checkout.js` to support per-root read-only vs read-write. Then a model physically cannot mutate the source (EPERM), and the only writable place (audit-artifacts) is external to opencode's `--dir=skills` gate → forces text-output delivery.
2. **Prompt delivery:** "Research (read + web) freely; DELIVER by emitting the complete enriched SKILL.md as your final text answer — do NOT write or edit any file." (Capture from stdout via `extractEnrichedDoc`.)
3. Re-test DeepSeek (research + clean text delivery, no source write), run unit tests, then commit SYSTEM (path-limited, skill-graph).

### STATUS — SYSTEM fix LANDED 2026-06-06T (commit `b680f11`)

- Step 2 (propose text-delivery) was already committed in `bb8d953` (before this plan's resume note had been acted on).
- Step 1 (per-root read-only Seatbelt) landed in **`b680f11`**: `buildSeatbeltProfile` gained an optional `readOnlyRoots` set (emitted `(allow file-read* …)` before the read-write roots so a nested run-dir RW root wins by SBPL last-match; `readOnlyRoots` absent ⇒ byte-identical to the prior all-RW profile, frontier path unchanged). `panel-enrich-live-deps.js` advisory fence now gives skill-graph repo + skills tree READ-ONLY and only `<ws>/.opencode/progress/skill-audits` + `<skill-graph>/.opencode/progress` read-write.
- Step 3 verified: isolated-checkout **15/15** (+4: 3 pure + 1 macOS-live proving source-read-OK / source-write-DENIED / nested run-dir-write-ALLOWED), panel-enrich-live-deps 7/7, panel-enrich 17/17, advisory-panel 24/24, lib-audit-smoke 14/14. LIVE (Agent-tool dispatch, panel row "DeepSeek V4 Flash"): researched (24 events, 0 EPERM), delivered 56 kB via stdout-capture, source hash `6669e62…` UNCHANGED (zero source-dir writes).

### KNOWN LIMITATION exposed by the read-only fence — advisory `reviseProposal` delivery

`reviseProposal` still uses `mode:'write'` (the model writes its own proposal file). For **sandboxed opencode advisory models** this never lands a real change under the read-only fence: the delivery instructs a relative/CWD write, but opencode's write scope is `--dir` (now read-only skills) and CWD is the read-only skill-graph root, so the write EPERMs (opencode still exits 0 → primitive reports `changed:false`, not an error). This is **not a convergence regression** — it was a silent misdelivery (wrong-location write, `ownProposalPath` untouched) under the old all-RW fence too; the fix just makes the no-op explicit. **gemini + frontier (Opus/codex) revise are unaffected** (they write the run dir directly, which is RW). The clean completion is to mirror propose's stdout text-capture into advisory/sandboxed `reviseProposal` — same delivery decision the user approved for propose. **DECISION (user, 2026-06-06): convert advisory revise to text-capture first. DONE — commit `ecd7df6`.** Sandboxed advisory revise now RESEARCHES under the read-only fence and EMITS the revised SKILL.md as text (captured via `extractEnrichedDoc`/`looksLikeSkillDoc`, written by us); frontier claude/codex keep native write-mode. Convergence stays hash-authoritative; sandboxed tiers re-emit each round so they lean on the maxRounds backstop (documented). Tests: panel-enrich-live-deps 7→9.

### RESUME — Round 2 of the eval-driven-development panel run (SYSTEM fix fully landed; both commits in)

**SYSTEM done:** `b680f11` (source read-only Seatbelt) + `ecd7df6` (advisory revise text-capture). Now CONTENT mode (`AUDIT_LOOP=1`, commit to `~/Development/skills` path-limited).

**Alive panel (8):** opus + codex-current (mandatory); gemini, gemini-flash, big-pickle, mimo, minimax, nemotron (advisory). DeepSeek failed Phase 1 — not in panel.json. Roster + current (round-1-revised) proposal paths: `skill-graph/.opencode/progress/agenttool/eval-driven-development/panel.json`.

**Round 2 phases (drive in-session, every model dispatch via the Agent tool — visible panel row, description = registry display name):**
1. Cross-review ×8: `node lib/audit/cross-review-one.js --model <alias> --tier <mandatory|advisory> --skill eval-driven-development --cwd . --out .opencode/progress/agenttool/eval-driven-development/<dir> --round 2 --panel .opencode/progress/agenttool/eval-driven-development/panel.json` (alias = panel `model`; dir = its run dir). Each writes `<skill>.<model>.review-r2.md` + returns reviews JSON.
2. Aggregate reviewers' items by `targetModel` → write each model's `feedback-r2.json` in its run dir.
3. Revise ×8: `node lib/audit/revise-one.js --model <alias> --tier <t> --skill eval-driven-development --skill-dir ../skills/skills/ai-engineering/eval-driven-development --cwd . --out <run dir> --round 2 --own-proposal <proposalPath> --feedback <run dir>/feedback-r2.json`. Snapshot hashes before (`hashes-before-r2.json`); compute stability after.
4. If stability==1.0 OR round==3 → curate. Else Round 3 (repeat 1–3 with --round 3).
5. Curate: Opus curator via `curate-one.js` (strict anti-loss + mandatory-coverage — both frontier proposals must be represented).
6. Eval guardrail: eval-mode comprehension; only `evals/comprehension.json` exists (no `application.json`) → SKIP → KEEP.
7. Apply: write merged enriched SKILL.md to source; commit CONTENT path-limited (`~/Development/skills`, `AUDIT_LOOP=1`).

## After the fix lands → resume Round 2 of the eval-driven-development run (above).

## Canonical-location reminder
All Skill Graph code lives in `skill-graph/` (per `skill-graph/AGENTS.md § Canonical Location`). SYSTEM (this fix) and CONTENT (the enriched skill) commit separately.
