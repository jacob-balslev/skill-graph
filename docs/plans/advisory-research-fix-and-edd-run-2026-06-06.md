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

## After the fix lands → resume Round 2 of the eval-driven-development run (above).

## Canonical-location reminder
All Skill Graph code lives in `skill-graph/` (per `skill-graph/AGENTS.md § Canonical Location`). SYSTEM (this fix) and CONTENT (the enriched skill) commit separately.
