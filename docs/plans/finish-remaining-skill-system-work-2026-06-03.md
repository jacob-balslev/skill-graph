# Prompt: Finish ALL remaining Skill Graph SYSTEM work (SKI board)

> Type: Plan / execution handoff prompt
> Created: 2026-06-03 (supersedes the prior Sales-Hub-board handoff, removed from the live tree because
> completed/superseded plans live in git history; the skill-graph backlog migrated to the dedicated **skill-metadata-protocol** Linear org, team **SKI**,
> on 2026-06-03; the old SH- board is archived).
> Scope: the SYSTEM side of the Skill Graph project (schema, scripts, audit-loop infra, prompts,
> protocol/audit docs, graders, hooks, CI). **CONTENT work (individual `SKILL.md` bodies + per-skill
> artifacts) is OUT OF SCOPE** and runs only via `/audit:*` — it "starts fresh" via the file-based
> worklist, never as a SKI ticket. As of writing, **`npm run verify:system` is GREEN (exit 0)** — keep it that way.

---

You are finishing the remaining **SYSTEM-mode** work in the Skill Graph project. Read
`skill-graph/AGENTS.md` § "Work Modes — SYSTEM vs CONTENT" before touching anything.
**Declared mode for this whole task: SYSTEM.** Do not edit any `~/Development/skills/skills/**/SKILL.md`
or per-skill artifact. A CONTENT issue you discover gets **filed** (or left to the audit loop), never
patched inline.

## 0. Setup (every session)

1. Launch from `~/Development/` and `cd skill-graph` (the launch convention — you lose rules/skills/memory
   if you launch from inside skill-graph; see `skill-graph/CLAUDE.md`).
2. Baseline: `npm run verify:system` must be **exit 0** before you start. If red, that red is your first finding.
3. **The board is SKI, not Sales Hub.** Linear CLI is workspace-aware:
   - List: `node ~/Development/scripts/linear/linear-cli.js list --workspace smp --limit 100`
   - Read: `node ~/Development/scripts/linear/linear-cli.js get SKI-XXX --workspace smp`
   - Close: `node ~/Development/scripts/linear/linear-cli.js done SKI-XXX --workspace smp "<evidence>"`
   - Comment: `node ~/Development/scripts/linear/linear-cli.js comment SKI-XXX --workspace smp "..."`
   The `--workspace smp` flag is mandatory for every SKI call (reads `LINEAR_API_KEY_SMP` + `LINEAR_TEAM_ID_SMP`).

## 1. The non-negotiable per-ticket loop

1. **Fetch + read** the ticket (`get SKI-XXX --workspace smp`) — title, description, AC. Note: descriptions
   carry a `> Migrated from SH-XXXX` backlink; the cited file paths/line numbers are from the pre-migration
   snapshot and may have shifted (e.g. `schemas/skill.schema.json` → `schemas/SKILL_METADATA_PROTOCOL_schema.json`).
2. **VERIFY IT STILL REPRODUCES IN THE CODE.** This is the single biggest time-saver. The 2026-06-03 triage
   already closed 46 of 127 as verified-already-resolved — the v8 clean cut and recent work silently fixed
   them. Before writing any fix, re-run the cited grep/command, read the named file:line, check the named
   gate. If it does not reproduce **now**, close it verified-already-resolved with the evidence and move on.
3. **Fix** — touch only the lines the ticket requires (`code-preservation`; improve = enrich, never trim
   live behavior). Most cited paths shifted — search by name, don't trust the literal path
   (`exhaustive-search-before-blocked`).
4. **Fixing a bug often reveals a stale TEST/FIXTURE** — update it in the SAME commit.
5. **Verify with evidence** (`no-unverified-claims`): `node --check` every changed JS, run the most specific
   test, and `npm run verify:system` (must stay exit 0). Capture the output. The WARN/`stability: stable`
   lines about `../skills/skills/**` are expected corpus-content noise, not SYSTEM failures.
6. **Commit path-limited, ONE logical change per commit** (`multi-session-commits`):
   `git commit --only -F /tmp/msg -- <paths>` (flags BEFORE `--`, paths AFTER). Reference the SKI id.
   Co-Author: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`. Commit in the repo
   that owns the file: **skill-graph** (`cd skill-graph`) for `skill-graph/**`; **Development** root for
   `~/Development/scripts/**`. `status.generated.md` goes stale on any doc/proposal add/delete and on
   parallel-session churn — regenerate (`node scripts/build-status-doc.js`) and commit it when `status:check` reds.
7. **Close** the ticket on SKI with an evidence-bearing summary (`done SKI-XXX --workspace smp "..."`).
8. Next ticket.

## 2. Quality bar (this is grading/eval code — sloppiness poisons data)

- **`no-lesser-models-for-quality`:** anything that JUDGES or CREATES quality (graders, eval scoring, audit
  verdicts) uses the strongest model (Opus, or `codex-current`/GPT where a contract names it) — never
  Haiku/Sonnet/Gemini Flash/MiniMax/Nemotron. A *frontier generator* (the measured agent) is NOT a violation
  — that rule governs the JUDGE. The cross-family certifying contract (single same-family run → PROVISIONAL;
  APPLICABLE needs an independent cross-family top grader) lives in `docs/verdict-semantics.md`.
- **Model identity by ROLE/ALIAS, never dated version** (`npm run models:check` enforces).
- **`complete-reporting`:** if a check emits N findings, report all N. Never "top issues."
- **Earned-not-bumped:** never advance a version label without the content migration.

## 3. The work-list (81 open as of 2026-06-03; refresh live before starting)

Authoritative list: `node ~/Development/scripts/linear/linear-cli.js list --workspace smp --limit 100`.
The clusters below are the 2026-06-03 verify-live-triage classification — reconcile against live (a few may
have moved). **Do them roughly top-to-bottom: deterministic SYSTEM bug-fixes first, model-runs/decisions last.**

### A. Workspace census/parser not v8-migrated — HIGHEST VALUE (one root cause, do together)
The skill-graph repo's own `bin lint` + `parse-frontmatter.js::normalizeFrontmatter()` are v8-correct; the
**workspace** `scripts/skill/skill-census.js` + `scripts/shared/skill-frontmatter.js` lag — they validate
against retired v7/v3 fields (`type`/`category`/`family`), lack the `metadata.*` lift, and enumerate 0 skills.
- **SKI-67** census validates against retired v3/v7 fields (flags all 165 live skills invalid)
- **SKI-95** workspace skill-frontmatter parser lacks `metadata.*` lift (consumers carry manual fallbacks)
- **SKI-96** stale walker comment at `skill-census.js:254-258` (+ uses removed `frontmatter.type||category`)
- **SKI-98** `skill-graph-builder` misses v8 nested sub-skills (enumeration mismatch)
- **SKI-73** root `skill-lint` audit scope points at the empty flat-root, not the canonical 165-skill library

### B. doc-verification-gates / doc-gate-hook bugs (the gate misfires on its own repo)
- **SKI-140** `doc-verification-gates.js` crashes EISDIR on a directory-resolving ref (no statSync guard)
- **SKI-88** `--compare` keys findings by full-object JSON → a 1-line insertion shifts every line and reports all as new
- **SKI-87** `broken_paths` fires on negative-context citations ("no `does-not-exist.md` file")
- **SKI-139 / SKI-136** doc-gate bulk mode audits the whole staged index, not the `commit --only` scope (has a `--paths` flag the hook doesn't use)
- **SKI-134** `.githooks/pre-commit:19` calls missing `scripts/update-tree.js` (canonical is `scripts/docs/update-tree.js`; note the *installed* hooksPath is `scripts/githooks/` which has no such call — decide fix-vs-delete the dead `.githooks/` copy)

### C. Grader / eval-policy integrity (deterministic parts)
- **SKI-40** grader policy not enforced for the opencode/gemini grader backends (extend the top-tier allowlist/fail-closed to `runGraderPrompt`'s non-claude branches)
- **SKI-41** comprehension receipt records the model *alias*, not the resolved concrete model (the codex/application path got `resolved_model` via SH-6680; the comprehension `claude` path still records the bare alias)
- **SKI-49** pairwise LLM judge position/recency bias — randomize order in ALL audit-loop pairwise evals (`experiment-judge.md` still unmitigated)

### D. Routing
- **SKI-53** route on skill body text, not just name+description (embeddings index has no body field)
- **SKI-66** `route` returns zero matches for obvious queries — stale `skills.manifest.json` (blue-ocean-strategy missing); regen the manifest
- **SKI-52** derive deterministic I/O-schema dependency edges for `relations.depends_on`

### E. Dead-code / shim cleanup (`delete-dont-archive`)
- **SKI-58** `scripts/skill/skill-evolution-loop.legacy.js` (still live-referenced by orchestrate-loops.md + 2 tests — rewire or delete)
- **SKI-57** `scripts/skill/run-skill-evals.sh` (superseded by evaluate-skill; still referenced by 3 docs)
- **SKI-35** workspace `scripts/shared/model-provider.js` drifted from canonical `skill-graph/lib/audit-shared/model-provider.js` — make it a registered shim
- **SKI-26** 130 stray run-dirs under `skill-graph/.opencode/progress/skill-upgrades/` vs 11 canonical
- **SKI-48** stray `sales-hub/.agents/skills/evals/` dir (misplaced 2026-05-16 artifacts)
- **SKI-106** phantom-ref `'cards'` in `dataflow-skill-bundles.json` (no such skill)
- **SKI-65** one live stale pointer to deleted `per-skill-contract.md` at `loop-lifecycle.md:26` (rest are frozen records — leave)
- **SKI-107** dead external link `docs/migrations/v5-to-v6.md` at `CHANGELOG.md:178`
- **SKI-55** add a static `help` key to `bin/skill-graph.js add` subcommand

### F. Hooks / CI / linear-cli
- **SKI-72** sales-hub nested repo has `core.hooksPath` unset + no `.git/hooks/pre-commit` → version-earned gate bypassed there
- **SKI-91** `hooks/install.js` has no sync/staleness check for installed hooks
- **SKI-124** `checkWipLimit` counts unlabeled In-Progress tasks against agent WIP (`task-helpers.js:1404` falls through to counted when `taskAgent` undefined)
- **SKI-113 / SKI-112** PROVISIONAL-receipt lint error message + githooks install-instruction doc gap (verify the cited script still exists — `check-provisional-receipt.js` was deleted; may be moot)

### G. Docs / protocol
- **SKI-115** `discoverKeyFiles`/`extractNamedTargets` miss plain-text snake_case identifiers (e.g. `skill_graph_protocol`)
- **SKI-34** finalize `skill-graph-meta` bundle to 31/31 (apply no-cutting-corners lens, flip the report row)
- **SKI-50** adopt Claude Code `paths:` globs (schema field landed) + document `context: fork`/`disallowed-tools` for runner skills
- **SKI-105** `opencode.json` doesn't auto-load AGENTS.md (note: `ecc-core.md` deliberately says not to — confirm intent before "fixing")
- **SKI-102** Codex CLI has no slash-command resolver — needs a wrapper
- **SKI-122** combined protocol/audit/worklist findings report (a report deliverable)
- **SKI-44** resolve missing prompt-required skills — `quality-doctrine` is still missing from the corpus though the 3 runner prompts were repointed to `best-practice` (SH-6646); `no-cutting-corners` exists but the router still reports it `missing` (a manifest-registration gap worth a look)

### H. CONTENT-draining — these stay red until the corpus migrates via `/audit:*`. NOT a SYSTEM fix.
Do **not** "fix" these by editing SKILL.md files. The SYSTEM part (if any) is detect/report tooling; the
edits drain through the audit loop. Leave them open or route a CONTENT note.
- **SKI-12** migrate corpus to v8 deployment_target + grounding · **SKI-17** author comprehension/application evals corpus-wide · **SKI-97** 147 SKILL.md carry stale `skill_graph_protocol` label · **SKI-61** lint-overlay `extends` (per-skill edit) · **SKI-64 / SKI-63** example fixtures fail v8 lint (these ARE editable SYSTEM test fixtures — fixable) · **SKI-37** 299 cross-subject `relations.boundary` edges (SYSTEM = build the detect/report codemod; the edits are CONTENT) · **SKI-42** ADR-0019 sidecar corpus frontmatter-strip (P1 schema landed; the corpus strip is CONTENT)

### I. NEEDS A MODEL/EVAL RUN — run a real eval; cannot resolve by reading code
- **SKI-43** comprehension grader ceilings 27-47% on Understanding-field dims (run `eval-discriminability-report.js`)
- **SKI-51** with/without-skill behavior-delta runner (runner is BUILT — `lib/audit/application-eval.js`; confirm AC with a trial run)
- **SKI-45** audit loop has no proven path to upgrade a sub-v8 skill (improve prompt instructs v8; needs a live improve run on a sub-v8 skill — but that MUTATES a SKILL.md = CONTENT; run via `/audit:improve`)
- **SKI-38** report eval lift by measured-agent tier · **SKI-138** self-evaluation grader_compression flags (eval re-run)

### J. RUNTIME — cannot reproduce read-only (needs a live spawn / session)
- **SKI-104 / SKI-101** `spawn-ghostty-tab.sh` failures on the MacBook (live spawn; obey `no-ps-for-liveness`)
- **SKI-133** comprehension grader run-to-completion in a Claude Code session (auth-state runtime; the cited "claude is a picker wrapper" blocker is FALSIFIED — it's the real 218MB binary)
- **SKI-110** background-mode subagents bail on git (harness runtime behavior)

### K. NEEDS A HUMAN DECISION — surface options, do NOT mechanically "fix"
- **SKI-19** (P1) publishing hygiene — local export is clean+current; remaining ACs need a public-repo push (authorize) + Vercel staff removal of stale skills.sh rows (escalate `@quuu`) · **SKI-141** stale skills.sh rows (same Vercel-staff lever) · **SKI-16** npm publish (`blocker-credentials`)
- **SKI-39** `project[]` unpopulated + "absent=ambient" doctrine decision · **SKI-36** eval-generator vs improvement-author naming · **SKI-131** census `scope` enum vs free-text (transformed tension) · **SKI-32** prompt-shape rule (spot-check convener claims) · **SKI-30** multi-model consensus design · **SKI-59** line-by-line v8 merge-prune review · **SKI-46** verify imported eval-research numerics (needs web fetch) · **SKI-94** drift hash re-record (CONTENT) · **SKI-129/122** worklist policy / umbrella tracker
- **SKI-18, SKI-20, SKI-21–25, SKI-47, SKI-26** — want-to-create / DEFER skill triage + one-shot migration-queue artifacts → CONTENT-adjacent (the individual-skill work starts fresh via the worklist; these are decisions/CONTENT, not SYSTEM bug-fixes)

## 4. Sequencing

1. **Cluster A first** (census/parser v8 — one root cause, highest leverage, unblocks routing + worklist honesty).
2. **Cluster B** (doc-gate bugs — the gate misfiring blocks clean commits).
3. **Cluster C** (grader/eval-policy — grading honesty; serial, they touch `evaluate-skill.js`/`application-eval.js`/`certification.js`).
4. **Clusters D/E/F/G** — mostly independent, disjoint files; safe to fan out (see §6).
5. **Cluster H** — route as CONTENT, don't patch (except the editable SYSTEM test fixtures SKI-64/63).
6. **Clusters I/J** — model-run / live-spawn verification; schedule a real eval or spawn.
7. **Cluster K** — stop and ask the user; these are decisions, not fixes.

## 5. Stop conditions + completeness claim

- Stop if `verify:system` goes red and you can't green it within the change — revert, re-scope.
- Stop and ask on any Cluster K decision. A CONTENT discovery → leave for the audit loop, don't patch.
- **End every session with a completeness claim:** "Examined N tickets. Closed M with evidence (fixed: …;
  verified-already-resolved: …). Remaining: … . `verify:system` exit 0. Repos pushed (if authorized)."
  Never silently drop a ticket.

## 6. Parallel dispatch note

Clusters D/E/F/G are mostly disjoint single-file fixes — safe to fan out `task-solver` agents (`Agent` tool,
`isolation: "worktree"`, per `~/Development/.claude/rules/manage-via-agent-tool.md`) for tickets PROVEN to
touch disjoint files, merging sequentially. Keep cluster C (shared eval modules) and cluster A (shared census
files) SERIAL. Read-only verify-live triage parallelizes freely (that's how the 46 already-resolved were found
on 2026-06-03 — 7 read-only general-purpose subagents over ~18 tickets each).

---

## Progress log

- 2026-06-03: Created post-migration. Baseline: 110 SYSTEM tickets migrated SH→SKI + 27 originals; the
  2026-06-03 verify-live triage closed **46** as verified-already-resolved (v8 clean cut + recent work).
  **81 open remaining** (this list). `verify:system` green. Prior SYSTEM session closed SKI-5/6/7/8/9/10/11/13/14/15.
