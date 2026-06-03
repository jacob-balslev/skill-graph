# Prompt: Solve ALL remaining Skill Graph SYSTEM work

> Type: Plan / execution handoff prompt
> Created: 2026-06-03
> Scope: the SYSTEM side of the Skill Graph project — schema, scripts, audit-loop
> infrastructure, prompts, protocol/audit docs. **CONTENT work (individual `SKILL.md`
> bodies + per-skill artifacts) is OUT OF SCOPE here** and runs only via `/audit:*`.
> Use as a fresh-context prompt (paste below the line) or as the spec for a `/manage`
> batch. As of writing, **`npm run verify:system` is GREEN (exit 0)** — keep it that way.

---

You are solving the remaining **SYSTEM-mode** work in the Skill Graph project. Read
`skill-graph/AGENTS.md` § "Work Modes — SYSTEM vs CONTENT" before touching anything.
Declared mode for this whole task: **SYSTEM**. Do not edit any `~/Development/skills/skills/**/SKILL.md`
or per-skill artifact (`comprehension.json`, `evals/`, `references/`, `audits/<skill>/`) —
those are CONTENT and route through `/audit:*`. A CONTENT issue you discover gets **filed**
to Linear, never patched inline.

## 0. Setup (do this first, every session)

1. Launch from `~/Development/` and `cd skill-graph` (the launch convention — you lose
   rules/skills/memory if you launch from inside skill-graph). See `skill-graph/CLAUDE.md`.
2. Establish the baseline: `npm run verify:system` must be **exit 0** before you start.
   If it is red, the red is your first finding — fix it before anything else.
3. The Linear CLI is at `node ~/Development/scripts/linear/linear-cli.js` (NOT inside
   skill-graph). Get a ticket: `node ~/Development/scripts/linear/linear-cli.js get SH-XXXX`.

## 1. The non-negotiable per-ticket loop

For EVERY ticket, in order:

1. **Fetch + read the ticket** (`linear-cli.js get SH-XXXX`) — title, description, AC.
2. **VERIFY IT IS STILL OPEN IN THE CODE.** This is the most important step and the
   single biggest time-saver this project has. ~half of the "open" SYSTEM tickets in the
   last sweep were **already resolved** by prior commits — the ticket was just never
   closed. Before writing any fix: run the relevant gate / grep / read the named file and
   confirm the bug actually reproduces *right now*. If it does not, **close the ticket as
   verified-already-resolved with the evidence** (the grep output / green gate) and move on.
   Do NOT "fix" a non-bug.
3. **Fix** — touch only the lines the ticket requires (`code-preservation`). Improve =
   enrich, never trim live behavior.
4. **Fixing a bug often reveals a stale TEST or FIXTURE** that was written to accommodate
   the bug (this happened with SH-6652: two test fixtures created files at the bug's bogus
   path). Update those in the SAME commit — the fix is incomplete if its test still encodes
   the old broken behavior.
5. **Verify with evidence** (`no-unverified-claims`): `node --check <file>` on every
   changed JS, run the most specific test that covers the change, and `npm run verify:system`
   (must stay exit 0). Capture the output.
6. **Commit path-limited, ONE logical change per commit** (`multi-session-commits`):
   `git commit --only -F /tmp/msg -- <paths>` (flags BEFORE `--`, paths AFTER). Reference
   the SH id. Co-Author line: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.
7. **Close the ticket** with an evidence-bearing summary
   (`linear-cli.js done SH-XXXX "..."`).
8. Next ticket.

Commit in the **skill-graph** repo (it is a nested git repo — `cd` into it). SYSTEM commits
never touch the `~/Development/skills/` repo.

## 2. The quality bar (this is grading/eval code — sloppiness poisons data)

- **`no-lesser-models-for-quality` (`~/Development/.claude/rules/`):** anything that JUDGES
  or CREATES quality (graders, eval scoring, audit verdicts) uses the strongest model
  (Opus, or `codex-current`/GPT where a contract names it) — never Haiku/Sonnet/Gemini
  Flash/MiniMax/Nemotron. A *frontier generator* (the measured agent) is NOT a violation —
  that rule governs the JUDGE. Several open tickets are about closing fail-open holes where
  a weak model could slip into a grader path; get these exactly right.
- **Model identity by ROLE/ALIAS, never dated version** (`models:check` enforces this —
  `npm run models:check`). Don't write `gpt-5.4`/`claude-opus-4-8` in durable surfaces.
- **`complete-reporting`:** if a check emits N findings, report all N. Never "top issues."
- **Earned-not-bumped:** never advance a version label without the content migration.

## 3. The work-list (49 open as of 2026-06-03; classified)

Run the live query to refresh:
`node ~/Development/scripts/linear/linear-cli.js list --project skill-graph --limit 80 --json`

### A. SYSTEM code fixes — DO THESE (priority order)

P1 — nested-repo claim system (likely related; investigate together):
- **SH-6644** Fix audit claim ownership for nested skills repo
- **SH-6578** Fix nested-repo skill claim filtering
- **SH-6640** [CRITICAL] `improve` crashes on real library — hardcodes `.claude/skills`,
  ignores `skill_roots` config. (Partly fixed already per the CHANGELOG — VERIFY what
  remains: the apply-mode generate→evaluate→keep cycle was unproven. Confirm live before fixing.)

P2 — eval-integrity / grading honesty (the highest-value cluster; same modules
`lib/audit/evaluate-skill.js`, `application-eval.js`, `audit-shared/certification.js` — do
them SERIALLY, they share files):
- **SH-6663** Eval receipts record model alias, not resolved concrete model
- **SH-6677** Eval parity: codex eval branch has repo access, claude branch tool-disabled
- **SH-6653** Comprehension grader ceilings 27-47% on Understanding-field dims — can't discriminate
- **SH-6628** with-skill comprehension prompt instructs repo-file inspection while tools disabled
- **SH-6627** Raise comprehension baseline-skip default off the 0-2 midpoint (1.0 ≠ saturation)
- **SH-6624** With/without-skill behavior-delta runner to earn `application_verdict` (larger)
- **SH-6639** Audit loop has no proven path to upgrade a sub-v8 skill to v8 (larger)
- **SH-6643** `evolve --top 1` generate_evals spawns missing `dispatch-solver.js` (cross-repo dep)
- **SH-6642** Collapse divergent `skill-evolution-loop.js` fork to a shim (SH-6603 follow-up)
- **SH-6692** `comprehension.schema.json` divorced from grader's real contract + unenforced
  (filed this session — reconcile schema↔grader contract + wire a validator)
- **SH-6548** Audit-ledger consistency check fails outside `npm run verify` (16 graded verdicts w/o artifacts)
- **SH-6357** `skill-census.js` skips 155 nested-tree skills (audit-loop blind spot)
- **SH-6654** Implement ADR-0019 sidecar separation — **CHECK: largely LANDED already**
  (CHANGELOG "ADR-0019 LANDED" 2026-06-01). Likely a verify-and-close; confirm Phase 6 corpus
  migration is the only remainder (that part is CONTENT).

P3:
- **SH-6665** Grader policy not enforced for opencode/gemini grader backends (extends the
  SH-6626 allowlist to the non-claude grader branches in `runGraderPrompt`)
- **SH-6660** `check-version-earned` gate `REPO_ROOT` is cross-repo-blind on nested skills-repo commits
- **SH-6675** De-duplicate workspace `scripts/shared/model-provider.js` → shim of canonical `skill-graph/lib/audit-shared/model-provider.js`
- **SH-6691** Container (Docker) OS fence for Linux/CI where `sandbox-exec` is absent (extends
  the macOS Seatbelt fence in `lib/audit/isolated-checkout.js`)
- **SH-6630** Pairwise LLM judge position/recency bias — randomize order in all pairwise evals
- **SH-6635** Add McDonald's omega alongside Cronbach's alpha in `eval-discriminability-report.js`
- **SH-6623** Derive deterministic I/O-schema dependency edges for `relations.depends_on`
- **SH-6622** Route on skill body text, not just name+description (larger, routing)
- **SH-6587** `route` command returns zero matches for obvious strategy queries
- **SH-6620** Wire `verify:system` into CI so SYSTEM PRs aren't blocked by corpus content
- **SH-6668** 299 cross-subject `relations.boundary` edges across 122 skills → move to
  anti_examples+related. **CAUTION: editing `relations` in SKILL.md files is CONTENT.**
  The SYSTEM part is any *tooling/codemod* to detect/report; the actual edits drain via `/audit:*`.

P4:
- **SH-6667** Report eval lift by measured-agent tier
- **SH-6618** Add static help key to `bin/skill-graph.js add` subcommand

### B. SYSTEM doc / cleanup (mechanical, lower risk — good warm-ups)
- **SH-6636** Document cross-family certifying-grader model contract in `verdict-semantics.md`
- **SH-6645** Update Codex audit prompt worklist command
- **SH-6646** Resolve missing prompt-required skills
- **SH-6671** PLANS.md status drift (this index) — multi-root mis-filed Active; reconcile
- **SH-6670** Prune 199 orphan entries from `publication-classification.json` ledger
- **SH-6674** Delete or action the orphaned `skill-audit-loop-positioning` proposal (per
  `delete-dont-archive`: if dead, `git rm`)
- **SH-6637** Verify numeric claims in imported eval-research bibliography
- **SH-6632** v8 migration queue builder should pre-flag archived/deprecated skills
- **SH-6676** Finalize skill-graph-meta bundle to 31/31
- **SH-6625** Adopt Claude Code paths: `globs` + `context:fork` for project/runner skills

### C. NEEDS A HUMAN DECISION — do NOT mechanically "fix"; surface options to the user
- **SH-6666** `project[]` belonging axis unpopulated + "absent=ambient" doctrine decision
- **SH-6669** Separate eval-generator from improvement-author in names and docs (naming convention)
- **SH-6651** `version-schema-contract` §5 wording vs canonical `verdict-semantics` contradiction
- **SH-6685** prompt-shape rule: require respondents to spot-check convener "verified" claims
- **SH-6658** Discover 4 gap skills (this is `/discover` CONTENT-adjacent — confirm scope first)

### D. CONTENT — NOT this task. File/route via `/audit:*`, never patch inline.
- **SH-6591** Migrate skill corpus to v8 deployment_target + grounding.subject_matter
- **SH-6647** lint-overlay carries schema-unknown field `extends` (v8 lint error)
- **SH-6621** Revert/route Gemini/GPT-5.5 routing_eval downgrades + lint-overlay edits (gate-gaming)
- **SH-6633** 144/149 v8-labeled skills missing required `scope` field
- **SH-6631** Stray `sales-hub/.agents/skills/evals/` misplaced audit artifacts (cleanup — verify
  it's not in the public skills repo before deciding; could be a quick `git rm` if it's tracked junk)

## 4. Sequencing recommendation

1. **Cluster B doc/cleanup first** (warm up, low risk, build momentum, several are
   verify-and-close).
2. **Cluster A P1 nested-repo claim** (SH-6644/6578/6640) — highest priority, investigate together.
3. **Cluster A P2 eval-integrity SERIALLY** (shared files — never parallelize these).
4. **Cluster A P3/P4** as independent units (some CAN be parallelized via worktree-isolated
   `task-solver` agents IF they touch disjoint files — check first; most eval ones do not).
5. **Cluster C** — stop and ask the user; these are decisions, not fixes.
6. **Cluster D** — file/route only.

## 5. Stop conditions + completeness claim

- Stop if `verify:system` goes red and you cannot get it green within the change — revert
  and re-scope.
- Stop and ask on any Cluster C decision.
- A CONTENT discovery → file a Linear ticket, do not patch.
- **End every session with a completeness claim:** "Examined N tickets. Closed M with
  evidence (fixed: …; verified-already-resolved: …). Remaining: … . `verify:system` exit 0.
  Both repos pushed (if push authorized)." Never silently drop a ticket.

## 6. Parallel dispatch note

Most eval-integrity tickets share `evaluate-skill.js` / `application-eval.js` /
`certification.js`, so parallel worktree solvers WILL conflict — keep those serial. Only
fan out `task-solver` agents (via the `Agent` tool, `isolation: "worktree"`, per
`~/Development/.claude/rules/manage-via-agent-tool.md`) for tickets proven to touch disjoint
files (e.g. one routing ticket + one doc ticket + one CI ticket). Merge sequentially.

---

## Progress log (update as work lands)

- 2026-06-03: Baseline. 15 SYSTEM tickets closed this session (SH-6681 OS fence, 6662
  status-doc schema, 6659/6648/6619 marketplace regen, 6626 grader allowlist, 6657 dead
  decls, 6652 checklist crash; verified-resolved 6664/6641/6661/6672/6673/6655/6638).
  `verify:system` green. 49 open remaining (this list).
