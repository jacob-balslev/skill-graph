# Skill System Audit — Protocol, Graph, Audit Loop (2026-05-25)

> **Type:** Report — read-only audit, no code changes.
> **Scope:** Skill Metadata Protocol + Skill Graph + Skill Audit Loop + the canonical skill library at `~/Development/skills/skills/` + AGENTS.md documentation sufficiency + Linear legacy-task scan.
> **Author:** Claude Opus 4.7 (1M context). Independent second-opinion run via GPT-5.5 (Codex plugin) launched in parallel — its output is posted as a separate Linear artifact.
> **Date:** 2026-05-25
> **Verdict at a glance:** Documentation is **excellent**. Implementation has **one P0 gap**: the `audit` command does NOT write Integrity Gate verdicts back to SKILL.md frontmatter — `structural_verdict` / `truth_verdict` stay `UNVERIFIED` on all 147 skills even after a successful audit run. The doc admits the gap but undersells the asymmetry: Behavior Gate write-back **is** wired in `evaluate-skill.js`, so the missing piece on the Integrity side is a 10-line fix, not a Level-1 milestone.

---

## 1. Skill Metadata Protocol — analysis

### What it is

The per-skill frontmatter contract. Defines required vs optional fields, the v8 5-axis classification, the v7 Health Block, the grounding block for `scope: project` skills, and typed relations between skills.

Canonical: `skill-graph/SKILL_METADATA_PROTOCOL.md` (normative spec) + `schemas/skill.schema.json` (machine contract) + `docs/field-reference.md` (per-field authoring prose).

### How it functions

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SKILL METADATA PROTOCOL                          │
│                    (per-SKILL.md contract)                          │
└─────────────────────────────────────────────────────────────────────┘

  ┌──────────────────┐
  │  Author writes   │
  │  SKILL.md        │
  │                  │
  │  ─── frontmatter │
  │  name: ...       │
  │  description: ...│
  │  + 5 axes        │
  │  + grounding     │
  │  + relations     │
  │  + Health Block  │
  │  ─── body        │
  │  ## Concept Card │
  │  ## Coverage     │
  │  ## Philosophy   │
  │  ## Verification │
  └────────┬─────────┘
           │
           │ Two physical encodings (both valid):
           │  (a) Protocol-native — flat keys
           │  (b) Agent-Skills-compatible — nested under metadata:
           │
           ▼
  ┌─────────────────────────────┐
  │ parse-frontmatter.js        │
  │ ::normalizeFrontmatter()    │  ←─ lifts metadata.* to top
  │                             │     JSON.parses stringified
  │ One logical contract        │     values; strips export
  │ from two on-disk shapes     │     provenance keys
  └────────┬────────────────────┘
           │
           ▼
  ┌────────────────────────────────────────────────────────────┐
  │                  THE FIVE AXES (v8)                        │
  │                                                            │
  │  AXIS 1: subject        9 closed values                   │
  │          code-engineering / quality-assurance /            │
  │          frontend-ui / design-craft / agent-ops /          │
  │          product-domain / knowledge-organization /         │
  │          meta-methods / data-analytics                     │
  │                                                            │
  │  AXIS 2: operation      4 Bloom-grounded values            │
  │          know  (declarative)  decide (judgment)            │
  │          do    (procedural)   modify (context-injecting)   │
  │                                                            │
  │  AXIS 3: scope          3 values                           │
  │          portable / workspace / project                    │
  │                                                            │
  │  AXIS 4: keywords       ≤10 strings (capped v8)            │
  │                                                            │
  │  AXIS 5: relations      typed edges to other skills        │
  │          related / boundary / verify_with /                │
  │          depends_on / broader / narrower /                 │
  │          disjoint_with                                     │
  └────────┬───────────────────────────────────────────────────┘
           │
           ▼
  ┌──────────────────────────────────────────────────────────┐
  │            CONDITIONALLY REQUIRED                        │
  │                                                          │
  │   if type == overlay      → extends required             │
  │   if scope == project     → grounding required           │
  │   if stability deprecated → superseded_by required       │
  │   if comprehension_state  → 5 Understanding fields       │
  │      == present              (mental_model, purpose,     │
  │                               boundary, analogy,         │
  │                               misconception)             │
  └──────────────────────────────────────────────────────────┘
           │
           ▼
  ┌─────────────────────────────────────────────────────────┐
  │   HEALTH BLOCK (v7+, loop-stamped — do NOT hand-author) │
  │                                                         │
  │   last_audited           ←  audit stamps                │
  │   last_changed           ←  improve stamps              │
  │   structural_verdict     ←  audit (Integrity, form)     │
  │   truth_verdict          ←  audit (Integrity, truth)    │
  │   comprehension_verdict  ←  evaluate (Behavior, smoke)  │
  │   application_verdict    ←  evaluate (Behavior, REAL)   │
  │   eval_score             ←  evaluate                    │
  │   eval_failed_ids        ←  evaluate                    │
  │   lint_verdict           ←  per-script signal           │
  │   drift_status           ←  per-script signal           │
  └─────────────────────────────────────────────────────────┘
```

### Is it easy to understand and follow?

**Yes for readers; partially for authors.** The doc itself is 695 lines and reads cleanly. The five-axis model is well-motivated by the empirical v7 distribution analysis (93% `type: capability`, 67% `scope: portable` — weak discriminating power). But three friction points remain:

| Friction | Where | Severity |
|---|---|---|
| **v7/v8 dual-state.** Schema currently accepts both versions; spec doc is v8-first; corpus is 147 on v8 fields + 1 v7 template. The "Migration state" table at the top of the doc is honest, but a new author has to read 30 lines of compatibility prose before authoring a single field. | `SKILL_METADATA_PROTOCOL.md:13-34` | P2 |
| **`boundary` field-name collision.** Top-level `boundary` (Understanding field, a string teaching what the concept is NOT) AND `relations.boundary` (routing-layer exclusion guard, an array of skill names) share a name. ADR-0018 will rename these in v8.1 (`concept_boundary` + `relations.suppresses`), but until then both fields coexist with a multi-paragraph WARNING. | `SKILL_METADATA_PROTOCOL.md:395-396`, `:528-541` | P2 |
| **`relations.boundary` mechanic is INVERSE to its name.** `boundary: [skill-B]` means "exclude B from co-routing when I win," NOT "defer to B." The doc has a 14-line WARNING block — necessary, but the smell is real and is the only field in the protocol that requires reading prose to get its mechanic right. | `SKILL_METADATA_PROTOCOL.md:528-541` | P1 |

The two physical encodings (protocol-native flat vs Agent-Skills-compatible nested) are reconciled by `normalizeFrontmatter()` and the precedence rules are documented, but a fresh author opening a SKILL.md in the canonical library sees the nested shape and gets no inline hint that it's the on-disk form, not the spec form. (The canonical library is the public release repo wearing two hats — explained well in `skill-graph/AGENTS.md § Public Distribution` but not in `SKILL_METADATA_PROTOCOL.md`.)

### Concrete improvement opportunities (file every finding)

1. **F1** [P2] Move the "Migration state v7→v8" block from the top of `SKILL_METADATA_PROTOCOL.md` into a callout box at the END of the doc. New authors do not need 30 lines of sunset compatibility prose before they see Axis 1. (Or invert: put the v8 axes first, then the compatibility table.)
2. **F2** [P1] Either rename `relations.boundary` → `relations.suppresses` NOW (per ADR-0018) or rename it in v8.1 as planned, but until then ADD an inline warning right where the field is first listed in the required-vs-optional table, not just in § Relations. The 14-line WARNING is correct but reaches only readers who hit § Relations; the field is also listed earlier without warning context.
3. **F3** [P2] Document the "one repo, two hats" reality (canonical library + public release) in `SKILL_METADATA_PROTOCOL.md` § Overview — currently buried in `skill-graph/AGENTS.md`. A protocol reader should not have to read the repo-governance doc to know which on-disk shape they're looking at.
4. **F4** [P3] The `scope` value normalization (v7 `codebase`→v8 `project`, `reference`→`workspace`) is mentioned in three places (Migration state, Axis 3 table, Legacy fields table). Pick ONE canonical location and link from the other two.

---

## 2. Skill Audit Loop — analysis (step-by-step)

### What it is

The maintenance discipline. Four operations (`audit` / `improve` / `evaluate` / `evolve`), two gates (Integrity + Behavior), four Health Block verdicts written to the skill itself.

Canonical: `skill-graph/SKILL_AUDIT_LOOP.md` (1056 lines, three Parts: Doctrine → Checklist → Runbook).

### How it functions (step-by-step)

```
┌──────────────────────────────────────────────────────────────────────┐
│                       SKILL AUDIT LOOP                               │
│                                                                      │
│             read  →  fix  →  test  →  next                           │
│             (Karpathy keep-or-revert discipline)                     │
└──────────────────────────────────────────────────────────────────────┘

  ┌─────────────┐
  │   evolve    │  ← thin for-loop over corpus,
  │             │    prioritized by application_verdict
  │             │    then skill-graph centrality + staleness
  └──────┬──────┘
         │
         │ for each skill in priority order:
         ▼
  ┌───────────────────────────────────────────────────────────────┐
  │                       audit  <skill>                          │
  │                                                               │
  │   ┌─────────────────────────────────┐                         │
  │   │ Phase 1  INTEGRITY · STRUCTURAL │  always                 │
  │   │   skill-lint.js → lint_verdict  │                         │
  │   │                  ──rolls up──►  │  structural_verdict     │
  │   └─────────────────────────────────┘                         │
  │                                                               │
  │   ┌─────────────────────────────────┐                         │
  │   │ Phase 2  INTEGRITY · TRUTH      │  always                 │
  │   │   skill-graph-drift.js          │                         │
  │   │     → drift_status              │                         │
  │   │              ──rolls up──►      │  truth_verdict          │
  │   └─────────────────────────────────┘                         │
  │                                                               │
  │   ┌─────────────────────────────────┐                         │
  │   │ Phase 3  BEHAVIOR · COMPREHEND  │  only --graded          │
  │   │   comprehension grader on the   │                         │
  │   │   5 flat Understanding fields   │                         │
  │   │              ──writes──►        │  comprehension_verdict  │
  │   └─────────────────────────────────┘                         │
  │                                                               │
  │   ┌─────────────────────────────────┐                         │
  │   │ Phase 4  BEHAVIOR · APPLY       │  only --graded          │
  │   │   application grader on real    │                         │
  │   │   artifacts (the QUALITY signal)│                         │
  │   │              ──writes──►        │  application_verdict    │
  │   └─────────────────────────────────┘                         │
  │                                                               │
  │   ┌─────────────────────────────────┐                         │
  │   │ Phase 5  STAMP                  │                         │
  │   │   last_audited = today          │                         │
  │   └─────────────────────────────────┘                         │
  │                                                               │
  │                       │                                       │
  │                       ▼                                       │
  │       Writes 3 evidence artifacts:                            │
  │         audits/<skill>/findings.md                            │
  │         audits/<skill>/verdict.md                             │
  │         audits/<skill>/scorecard.md (--graded)                │
  │                                                               │
  │       ⚠️  STUB: Does NOT write structural_verdict /            │
  │       truth_verdict back to SKILL.md frontmatter.             │
  │       See § "Stubs and silent fails" below.                   │
  └───────────────────────────────────────────────────────────────┘
         │
         │ if (structural_verdict in {FAIL, PASS_WITH_FIXES}
         │     OR truth_verdict in {DRIFT, BROKEN}
         │     OR application_verdict in {UNVERIFIED, REDUNDANT,
         │                                HARMFUL, MIXED}):
         ▼
  ┌───────────────────────────────────────────────────────────────┐
  │                     improve  <skill> --field X                │
  │                                                               │
  │   1. ONE field, ONE commit                                    │
  │   2. Time-boxed (default 20 min)                              │
  │   3. Auto-call evaluate after                                 │
  │   4. KEEP-OR-REVERT on eval_score                             │
  │   5. Stamp last_changed                                       │
  │                                                               │
  │   Modes: (default field edit) /                               │
  │          --mode <adapter> /                                   │
  │          --lens <other-skill>                                 │
  └───────────────────────────────────────────────────────────────┘
         │
         ▼
  ┌───────────────────────────────────────────────────────────────┐
  │                     evaluate  <skill>                         │
  │                                                               │
  │   Run evals/<skill>.json + optional comprehension.json        │
  │     + optional application.json                               │
  │                                                               │
  │   Writes:  eval_score / eval_failed_ids / freshness           │
  │            comprehension_verdict (if comprehension grader ran)│
  │            application_verdict   (if application grader ran)  │
  │                                                               │
  │   ✓  This operation DOES write verdicts back to frontmatter   │
  │      (evaluate-skill.js:1467, 1505-1507)                      │
  └───────────────────────────────────────────────────────────────┘
         │
         ▼ next skill
```

### Is it easy to understand and follow?

**Conceptually yes. Operationally noisier than necessary.** The four-operation model is crisp — `audit` reads, `improve` writes ONE field, `evaluate` grades, `evolve` loops. The Karpathy keep-or-revert framing is a clear discipline. The two-gate separation (never collapse Integrity and Behavior into one PASS/FAIL) is well-defended.

But the runbook in Part 3 has 13 numbered steps, each with multi-line bash invocations and several workarounds. It is correct, but a fresh agent reading Part 3 sees:

- **Step 0** — set AGENT_ID and MODEL env vars (and the note "these do NOT persist across tool calls")
- **Step 7** — a "Harness block" workaround for SH-6353 (`Write` tool blocked for `.md` files in subagents — workaround is `node -e "require('fs').writeFileSync(...)"`)
- **Steps 10-12** — `release` → `commit` → `advance checkpoint` in a specific order, with the warning that `release` must come before `commit`

These are real, but they are workflow scaffolding around a four-operation core. A future cleanup could absorb most of them into a single `skill-graph audit-full <skill>` command that orchestrates Steps 0-12 inline. (Right now `evolve` does this for the corpus, but no equivalent exists for a single skill driven end-to-end.)

### Does the loop work end-to-end? Stubs and silent fails

The deep implementation audit (`lib/audit/*.js` × 17 files, ~11,200 lines, plus the cross-repo claim/ledger surface in `~/Development/scripts/skill/`) produced these findings — all verified by file:line evidence and live smoke tests:

#### What works

- **F5** [INFO] `bin/skill-graph.js --help` works; lists 8 subcommands + 7 legacy aliases. (`bin/skill-graph.js:37-300`)
- **F6** [INFO] `audit` operation runs the structural Integrity Gate end-to-end. Live test on `hooks-patterns`: resolved → lint PASS → 3 files written to `examples/audits/hooks-patterns/`.
- **F7** [INFO] `--graded` mode calls the user-supplied `--grader-cli` via `spawnSync` and **hard fails if absent** (no silent zero-exit). (`lib/audit/skill-audit.js:262`)
- **F8** [INFO] `drift` reports real verdicts. Live: 146 skills → 3 DRIFT, 24 EXTERNAL_UNHASHED, 119 UNGROUNDED. (`scripts/skill-graph-drift.js`)
- **F9** [INFO] `lint` returns non-zero on broken frontmatter (verified on a real failing skill). (`scripts/skill-lint.js`)
- **F10** [INFO] `generate-manifest --validate-only` validates and exits 0 only when valid. Live: "manifest valid (147 skill(s))".
- **F11** [INFO] `evaluate-skill.js` actually writes `application_verdict` and `comprehension_verdict` back to SKILL.md frontmatter via `updateFrontmatterField`. (`lib/audit/evaluate-skill.js:1443-1508`)
- **F12** [INFO] The claim system (`scripts/skill/skill-audit-claim.js`) exists, locks atomically via `fs.linkSync` in `.claude/agent-memory/`. 6 lanes verified live. `next --lane bulk-audit` returns a real skill.
- **F13** [INFO] Grader prompts exist at `lib/audit/graders/{concept,application,application-comparative}-grader-prompt.md`.

#### Stubs and silent fails

- **F14** [P0] **`skill-graph audit` does NOT write Integrity Gate verdicts back to SKILL.md frontmatter.** `lib/audit/skill-audit.js` has **zero occurrences** of `structural_verdict`, `truth_verdict`, or `updateFrontmatterField`. It writes only to `findings.md / verdict.md / scorecard.md`. The result: `verdict.md` says "Integrity Gate: PASS" but the SKILL.md Health Block stays `structural_verdict: UNVERIFIED`. The doc admits this gap (`SKILL_AUDIT_LOOP.md:49-50`) but undersells it — the doc says "Integrity verdict write-back ≈ L0" implying "not yet wired"; the code says **the call sites do not exist**. Fix is ~10 lines of `updateFrontmatterField` calls in `skill-audit.js` after each phase.
- **F15** [P1] **`skill-graph improve` is NOT a CLI subcommand.** `SKILL_AUDIT_LOOP.md:54-83` lists it as one of "The Four Operations" and `:77` maps `audit:improve-skill → improve`. But `bin/skill-graph.js` has no `improve` command. The only way to actually improve a skill is `bin/skill-graph.js evolve --auto-improve --pilot <skill>`. The mapping table is aspirational.
- **F16** [P1] **`skill-graph evaluate` is NOT a CLI subcommand.** Same shape as F15. Doc Quick Start (`SKILL_AUDIT_LOOP.md:223-225`) points users at `node lib/audit/evaluate-skill.js` (raw library path) rather than a CLI surface.
- **F17** [P2] **`evolve --analyze-only` silently falls back to zero work.** `lib/audit/skill-evolution-loop.js:302-345` probes for `scripts/skill-evolution-analyzer.js` (or `scripts/skill/skill-evolution-analyzer.js`) and prints `Analyzer script not found; falling back to frontmatter scan` → `Queue size: 0`. The analyzer exists at `~/Development/scripts/skill/skill-evolution-analyzer.js` but when `evolve` is launched from `cwd=skill-graph`, the workspaceRoot probe misses it. Exit 0, no work done. **This is the silent fail to fix first.**
- **F18** [P2] **`evolve --auto-improve` bootstraps zero assets.** Live run: "Bootstrapped 0 assets from manifest (total: 2)" → "No skills to improve." The manifest probe in `lib/audit-shared/auto-improve.js:23` expects a `manifest.repos` shape that the actual `skills.manifest.json` does not produce. Silent zero work, exit 0.
- **F19** [P3] **`evaluate-skill.js` does not stamp the verdict if ALL cases error**, but DOES stamp `UNVERIFIED` if mixed. Depending on grader timeout policy this could mask partial failures. (`evaluate-skill.js:1467`)
- **F20** [P2] **The 5-command audit surface is incomplete.** `.claude/commands/audit/` has `audit.md / improve.md / evaluate.md / evolve.md / discover.md / merge.md` (6 files, not 5 — `merge.md` is undocumented in AGENTS.md). The skill catalog (`SKILL_AUDIT_LOOP.md:67-83` "old → new" mapping) does not mention `merge`.

#### Documented but missing

- **F21** [P1] **`scripts/skill-evolution-analyzer.js` inside `skill-graph/`** — `lib/audit/skill-evolution-loop.js:302` probes for it but the file only exists at workspace path `~/Development/scripts/skill/`. Cross-repo wiring is broken when launched from inside skill-graph.
- **F22** [P3] **`evals/<skill>.json` for most skills** — only 12 of 147 skills have `evals.json`; only 2 of 147 have `comprehension.json`; **0** have `application.json`. This is exactly the "Behavior Gate ≈ L0" admission in the doc — but worth restating: the eval artifacts the Behavior Gate consumes don't exist yet on 145 of 147 skills.

#### Asymmetry the doc undersells

The doc says "Integrity tooling ≈ Level 1; Integrity verdict write-back ≈ Level 0" and "Behavior Gate ≈ Level 0" — implying both gates are equally distant from production. **That framing is wrong.** Evidence:

- **Behavior Gate runner is COMPLETE.** `evaluate-skill.js` calls `updateFrontmatterField` and lands the verdict. The gap is **eval artifacts** (only 2/147 have `comprehension.json`). Authoring evals is the L0→L1 work.
- **Integrity Gate runner is INCOMPLETE.** The diagnostics run and report correctly, but the write-back code path **does not exist** in `skill-audit.js`. The gap is **10 lines of code**, not eval artifacts.

The doc's framing reads as if both sides are equally aspirational. The code says one side is 10 lines from done and the other side is 290+ eval artifacts from done. These are different categories of work and should be framed differently.

---

## 3. Skill Graph (library-level system) — analysis

### What it is

The 5-tier authority hierarchy (`SKILL_GRAPH.md`):

| Tier | Files | Role |
|---|---|---|
| 1 — Schema | `schemas/*.json` | Binding machine contract |
| 2 — Explanation | `SKILL_METADATA_PROTOCOL.md`, `SKILL_AUDIT_LOOP.md`, `docs/*.md` | Prose reflecting Tier 1 |
| 3 — Enforcement | `scripts/*.js` (lint, manifest, drift, route, export) | Policing + compilation |
| 4 — Consumer | `skill-graph-route.js`, `skill-graph-drift.js` | USE Tier 1 to make decisions |
| 5 — Specimens | `examples/`, `marketplace/skills/` | Worked examples |
| (Governance) | `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md` | Repo, not protocol |

Plus the canonical skill library at `~/Development/skills/skills/` (146 SKILL.md files across 6 directories: `agent / design / engineering / foundations / product / quality`) — which is **both** the canonical authoring source AND the public release repo (one repo wearing two hats).

### Is it easy to understand and follow?

**Yes for the tiering. No for the cross-repo geography.** The tier model is crisp and well-illustrated with mermaid diagrams (rendered as PNG fallbacks). The five-tier rule "if Tier N disagrees with Tier N-1, the lower-tier file is the bug" is a clean precedence model.

What's **not** crisp:

| Friction | Where | Severity |
|---|---|---|
| **The canonical library is a sibling repo.** `~/Development/skills/skills/` is the authoring source; `skill-graph/marketplace/skills/` is the staging/transform; `github.com/jacob-balslev/skills` is the public release; `skills.sh/jacob-balslev/skills/` is the installable surface. Four locations, one logical entity. Explained in `skill-graph/AGENTS.md § Public Distribution` but not visible from `SKILL_GRAPH.md` Tier 5. | `SKILL_GRAPH.md:14-46`, `skill-graph/AGENTS.md § Public Distribution` | P2 |
| **The 6-category canonical library disagrees with the v8 9-subject classification.** The library is organized as `skills/<category>/<name>/SKILL.md` where category ∈ {agent, design, engineering, foundations, product, quality} — that's the **v7** enum. The v8 enum is 9 values (`code-engineering`, `quality-assurance`, …). Skills carry v8 frontmatter but live in v7-named directories. The disconnect is real and not explained anywhere. | filesystem at `~/Development/skills/skills/` vs `SKILL_METADATA_PROTOCOL.md:220-231` | P1 |
| **Two `marketplace/` references could mean different things.** `skill-graph/marketplace/skills/` (the staging surface, plain Agent Skills shape) vs the skills.sh marketplace (the public install destination). | `SKILL_GRAPH.md:28-42` | P3 |

### Categorization intuitiveness

The v8 subject distribution (verified via `examples/skills.manifest.sample.json`):

| Subject | Count | Share |
|---|---|---|
| `code-engineering` | 36 | 25% |
| `quality-assurance` | 27 | 18% |
| `frontend-ui` | 20 | 14% |
| `design-craft` | 20 | 14% |
| `agent-ops` | 17 | 12% |
| `product-domain` | 11 | 7% |
| `knowledge-organization` | 7 | 5% |
| `meta-methods` | 6 | 4% |
| `data-analytics` | 3 | 2% |

This is well-balanced (each subject 3-36; balance rule says 5-25 per subject — `code-engineering` is over and `data-analytics` is under, both flagged in the protocol doc for subdivision/folding). The distribution itself is the strongest argument for the v8 redesign: it has actual discriminating power, unlike v7's 93%/67% concentrations.

### Concrete improvement opportunities

- **F23** [P1] **Reorganize the canonical library directory layout to match v8 subjects.** `skills/agent/` → `skills/agent-ops/`; `skills/foundations/` and `skills/quality/` collapse into `skills/quality-assurance/` + `skills/meta-methods/`; etc. This is a one-time codemod (filenames + git mv) followed by a single commit; the SKILL.md content does not change. Currently agents reading the filesystem see v7 directory names and v8 frontmatter — confusing.
- **F24** [P2] **Add a "Where does my skill live?" decision tree to `SKILL_METADATA_PROTOCOL.md`** — one paragraph mapping the v8 `subject` axis to the on-disk directory. Right now an author has to grep `examples/skill-metadata-template.md` and infer.
- **F25** [P3] **`SKILL_GRAPH.md § Tier 5` notes 8 starter skills, but 3 are marked `_(removed)_`.** Either update the table to reflect the current `examples/fixture-skills/` inventory or move the historical table to an ADR/archive.
- **F26** [P2] **The "one repo two hats" canonical-library-+-public-release setup is a recurring source of confusion** (visible in commit messages, prior session memory). Add a 5-line ASCII diagram to `SKILL_GRAPH.md § Source vs Marketplace` showing: authoring source repo (hat 1) → exporter → marketplace staging → sync push → release repo (hat 2 — same physical repo) → skills.sh index.

---

## 4. Documentation sufficiency — is AGENTS.md enough?

**The user's frustration is justified.** Quoting the request: *"I feel like I have to explain you and other agents all the time."*

Why this happens, with evidence:

### Where AGENTS.md is excellent

The workspace `~/Development/AGENTS.md § Skill System (Protocol / Graph / Audit Loop)` (lines 97-146) is a strong, recently-added section:

- **F27** [INFO] Names the three layers, points to their canonical docs, summarizes their missions in one sentence each.
- **F28** [INFO] Includes a "Current state (verified 2026-05-25)" table with schema version enforced, skill count single-source-of-truth pointer, audit-loop maturity, and the two-encoding reality.
- **F29** [INFO] States the three load-bearing doctrines (version-labels-earned, lint-is-floor, application_verdict-is-PRIMARY) inline.
- **F30** [INFO] Explicitly tells launching agents "Launch from `~/Development/`, `cd` into `skill-graph/` to work."

### Where AGENTS.md is insufficient

- **F31** [P1] **The Skill System section is buried at line 97 of a 1056-line file.** A fresh agent doing a Sales Hub task may never read past line 50. The user's frustration is downstream of this: agents need explicit skill-system context but the explicit context is below the fold. **Recommendation:** Add a single line at line ~40 (Quick Start area) — `If your task touches a SKILL.md, skill audit, skill graph, or skill metadata: read § Skill System (line 97) FIRST.` — and add a parallel callout near the top of `skill-graph/AGENTS.md`.
- **F32** [P1] **The "non-Claude agents" carve-out at line 93 says skills are NOT auto-injected for Gemini/GPT/Codex** — agents must read `SKILL-INDEX.md` and load skills manually. But there's no equivalent rule for *Claude itself when launched from `skill-graph/`*, which (per `skill-graph/CLAUDE.md`) ALSO loses skill injection. A Claude session launched from `~/Development/skill-graph/` shows the same auto-injection blind spot as a non-Claude agent — but the rule isn't surfaced in AGENTS.md.
- **F33** [P2] **The mapping "old 13-command surface → new 5-command surface" is in `SKILL_AUDIT_LOOP.md:67-83`, not in AGENTS.md.** Linear has 121 tasks referencing the old surface (see § 5 below). Agents reading AGENTS.md and then a legacy task don't know the commands have been renamed. **Recommendation:** Move the table into AGENTS.md § Skill System or add a sub-section "Command surface (5 commands replaced 13)."
- **F34** [P2] **AGENTS.md mentions `application_verdict: UNVERIFIED on all 147 skills`** at line 116 — but never explains that this is the *expected current state* and not a defect. An agent reading "the Behavior Gate is L0" may flag it as broken. **Recommendation:** Add a one-line "this is the expected state — see SKILL_AUDIT_LOOP.md § Current Maturity" disclaimer.
- **F35** [P2] **The v7/v8 dual-state is mentioned at line 113 (`Schema actually enforced: v7`) and line 114 (`Schema spec'd in protocol doc: v8`)** but the implication ("if you write v8-only fields, schema lint will fail until the v8 enum lands in schemas/skill.schema.json") is not stated. New skill authors will hit this.
- **F36** [P2] **The "two physical encodings" note at line 117 is correct but terse.** "Protocol-native flat (`a-b/SKILL.md`) AND Agent-Skills-compatible nested (`skills/<cat>/<name>/SKILL.md` with everything under `metadata:`)" — but an agent reading this still doesn't know which to author. The right answer ("the canonical library uses nested; the protocol spec is flat; normalizer reconciles them") is in `SKILL_METADATA_PROTOCOL.md:67-76` but not surfaced.

### Diagnosis: why agents keep needing re-explanation

Two root causes:

1. **The canonical knowledge is fragmented across 4+ docs** (workspace AGENTS.md, skill-graph/AGENTS.md, SKILL_METADATA_PROTOCOL.md, SKILL_AUDIT_LOOP.md, SKILL_GRAPH.md, plus 11 ADRs). Each doc is well-written, but a fresh agent has to traverse 3-5 of them to act safely. **The fix is not more docs but more pointers** — every doc should start with "if you only have 2 minutes, read X."
2. **No top-level "if you touch skills, read this first" trigger.** AGENTS.md § Skill System is excellent but is at line 97. Agents auto-injected with skills get loaded with skill content but not necessarily with the protocol+graph+loop context. **The fix is a single trigger line at line ~40 of workspace AGENTS.md** pointing into § Skill System.

---

## 5. Linear legacy task scan

**144 tasks scanned (1 In Progress + 143 Ready) across the "Skill Graph" and "Skill Audit Loop" Linear projects.**

### CURRENT (aligned with plan) — 2 tasks

- **SH-6331** · Skill Graph publishing hygiene: empty install handle + duplicate repos + stale exports · [Sonnet] · Ready — tracks the post-consolidation export pipeline.
- **SH-6330** · Skill Graph: want-to-create skill backlog (2026-05-21 reconciled) · [—] · In Progress — current backlog tracker.

### LEGACY (pre-consolidation) — 134 tasks

All 134 reference docs deleted/relocated by **ADR-0009** (2026-05-18): `docs/reference/skill-audit-spec.md` (now `skill-graph/SKILL_METADATA_PROTOCOL.md`), `docs/reference/skill-audit-loop-hub.md` (now `skill-graph/SKILL_AUDIT_LOOP.md`), `.claude/plans/vivid-splashing-lagoon.md` (session-scoped, lost). SH-5096's own comment dated 2026-05-19 explicitly verifies these references are dead.

**121 v2.2-benchmark upgrade tasks** (all "[Skill Audit Loop] Upgrade skill to merged v2.2 benchmark: …") — reference the deprecated 4-artifact v2.2 "merged benchmark" pipeline (catalog/research/scorecard/comprehension) plus the deleted `.opencode/commands/skill-audit-per-skill.md`. Pre-dates the 5-command consolidation. Full IDs:

SH-5641, SH-5646, SH-5644, SH-5643, SH-5642, SH-5637, SH-5636, SH-5635, SH-5634, SH-5633, SH-5632, SH-5631, SH-5630, SH-5629, SH-5616, SH-5225, SH-5224, SH-5615, SH-5222, SH-5221, SH-5220, SH-5614, SH-5613, SH-5612, SH-5219, SH-5218, SH-5217, SH-5216, SH-5215, SH-5214, SH-5213, SH-5610, SH-5212, SH-5209, SH-5609, SH-5208, SH-5207, SH-5206, SH-5205, SH-5204, SH-5202, SH-5200, SH-5198, SH-5608, SH-5197, SH-5196, SH-5194, SH-5193, SH-5607, SH-5606, SH-5605, SH-5191, SH-5190, SH-5189, SH-5188, SH-5604, SH-5187, SH-5186, SH-5603, SH-5184, SH-5183, SH-5182, SH-5602, SH-5181, SH-5180, SH-5179, SH-5178, SH-5176, SH-5601, SH-5175, SH-5174, SH-5600, SH-5173, SH-5598, SH-5172, SH-5597, SH-5171, SH-5596, SH-5170, SH-5169, SH-5595, SH-5594, SH-5593, SH-5592, SH-5166, SH-5165, SH-5164, SH-5163, SH-5162, SH-5161, SH-5591, SH-5590, SH-5160, SH-5159, SH-5158, SH-5157, SH-5156, SH-5155, SH-5589, SH-5154, SH-5153, SH-5152, SH-5151, SH-5149, SH-5148, SH-5588, SH-5147, SH-5146, SH-5145, SH-5144, SH-5143, SH-5142, SH-5141, SH-5140, SH-5131, SH-5587, SH-5586, SH-5125.

**13 "Audit skill: X" tasks** — reference `.opencode/commands/skill-audit-per-skill.md` (deleted) + v7 6-category enum. Pre-v8. Full IDs: SH-5252, SH-5150, SH-5185, SH-5136, SH-5135, SH-5138, SH-5195, SH-5168, SH-5201, SH-5244, SH-5139, SH-5137, SH-5134.

### LEGACY (deprecated approach) — 8 tasks

These 8 numbered "recommendations" (#35–#50) were filed against `.claude/plans/vivid-splashing-lagoon.md` and `product-design-doctrine.md` — both deleted in the consolidation.

- **SH-5096** · #35 Profile Opus vs Haiku grader cost-accuracy trade-off · [GPT-5.4] · Ready — Haiku is no longer a grader option (current rules: Opus or GPT-5.4 only).
- **SH-5101** · #40 Implement semantic evaluation in eval-set.json · [Sonnet] · Ready — current pipeline uses dimension-tagged `comprehension.json` (ADR-0014/0017).
- **SH-5105** · #44 Multi-model consensus framework · [—] · Ready — depends on v7 `type=doctrine` enum value; v8 5-axis replaces this.
- **SH-5106** · #45 D3 dependency visualization in audit viewer · [GPT-5.4] · Ready — depends on `build-audit-viewer.js` which never existed.
- **SH-5108** · #47 Audit-loop SLO + alerting · [Sonnet] · Ready — pre-MLOps-Level-1 framing.
- **SH-5109** · #48 Audit-finding remediation standard · [—] · Ready — superseded by current Linear-native flow.
- **SH-5110** · #49 Weekly status report automation · [Sonnet] · Ready — references dead `comprehension-history` checkpoint path.
- **SH-5111** · #50 Document skill-audit in AGENTS.md · [Sonnet] · Ready — already done in commit `5dc9778de` (2026-05-25).

### LEGACY (pre-v8) — 0 separately classified

The 13 "Audit skill: X" tasks above implicitly use the v7 6-category enum and are grouped under LEGACY (pre-consolidation) since their primary breakage is the deleted command file; v7-enum dependency is secondary.

### AMBIGUOUS — 0

All 144 tasks had enough body/comments to classify.

### Recommendation for the user

**Do NOT auto-close these 142 legacy tasks.** Per `code-preservation.md` and `no-permission-asking-for-trivial-actions.md`, the audit is report-only and the user decides what to cut. But:

- 142 tasks (98.6%) are aligned to a deleted pipeline. The 121 v2.2-benchmark tasks specifically wait for a command file that does not exist. They cannot succeed if dispatched.
- The 13 "Audit skill: X" tasks reference the old 13-command surface. They could be rewritten against the new 5-command surface, but each would need fresh acceptance criteria.
- The 8 numbered recommendations are mostly superseded by current state — SH-5111 is already done (close as duplicate); the others need new framing.

A reasonable user action would be: **(a) bulk-close the 121 v2.2-benchmark tasks** with a comment pointing at SH-6331 (the current export-hygiene tracker), **(b) keep the 13 "Audit skill" tasks** but relabel them against the new 5-command surface, **(c) close SH-5111 as duplicate of completed work**, **(d) decide individually on the other 7 recommendations**.

**The user decides. I am not closing any of them in this report.**

---

## 6. Mandatory dissent

The Skill Audit Loop's self-description in `SKILL_AUDIT_LOOP.md:45-52` ("Integrity tooling ≈ Level 1; Integrity verdict write-back ≈ Level 0. Behavior Gate ≈ Level 0.") **understates the asymmetry between the two gates** and **overstates the closeness to L1 on the Integrity side**.

Evidence (from § 2):

- The Behavior Gate has the **runner** complete (`evaluate-skill.js` writes verdicts back via `updateFrontmatterField`). What's missing is **eval artifacts** — 145 of 147 skills have no `comprehension.json` and 147 of 147 have no `application.json`. That's a 200+ artifact authoring backlog.
- The Integrity Gate has the **diagnostics** complete (lint runs, drift runs, manifest validates) but the **write-back code path does not exist** in `skill-audit.js`. That's ~10 lines of code.

These are different categories of work. The doc frames them as "both at L0" — which suggests they should be advanced together. The code says one is 10 lines away from L1 and the other is 200+ eval artifacts away. The fix on the Integrity side is **mechanically cheap and dominantly leveraged** (every audit run henceforth lands a verdict instead of producing only a side artifact). The doc's framing reads as if both gates require the same kind of work.

This is not a flaw in the audit-loop's design. It is a doc-side issue: the L0/L1 maturity mapping should distinguish "runner missing" from "data missing." The current text bundles them.

## 7. Novelty memo (up to 10 off-rubric findings)

Findings that the structured checklist sections above did not directly surface, but that came up while traversing the implementation and the docs. Each entry tagged by evidence strength.

- **N1** [direct-file-line] `.claude/commands/audit/merge.md` is a 6th audit command that is not in any "5-command surface" claim. AGENTS.md and SKILL_AUDIT_LOOP.md should reconcile to "5 + merge" or "6". (`ls .claude/commands/audit/`)
- **N2** [direct-file-line] `marketplace/skills/` and `~/Development/skills/skills/` have the same SKILL.md count today but DIFFERENT directory shapes (flat vs nested by category). The "ls | wc -l" pre-release check in `skill-graph/AGENTS.md § Pre-release verification` is incorrect — it should compare recursive `SKILL.md` counts, not top-level entries. This is already noted in `SKILL_GRAPH.md:44` but the fix has not landed in AGENTS.md.
- **N3** [direct-file-line] `lib/audit/skill-evolution-loop.js:166-168` says "monorepo runner; the skill-graph copy is `lib/audit/skill-evolution-loop.js`" — referring to itself in third person. This is a hint that the duplicate-source situation (workspace `scripts/skill/skill-evolution-loop.js` + `skill-graph/lib/audit/skill-evolution-loop.js`) is still confusing the implementors. Pick one canonical, retire the other.
- **N4** [direct-file-line] The skill-graph repo has 17 files under `lib/audit/` (~11,200 lines) but only 1 (`skill-audit.js`) is a "user-facing" operation. The other 16 are runners/helpers/graders. This is fine, but the directory structure does not telegraph that — a fresh contributor scanning `lib/audit/` does not see "1 entry point + 16 internals." A README or a 4-line entry-point comment would help.
- **N5** [command-output] `skill-graph audit` writes audit artifacts to `examples/audits/<skill>/` — the same directory `examples/` that the documentation uses for canonical specimens. This couples evidence (per-run audit output) with specimens (the protocol-stable starter examples). They should live in different directories — perhaps `audits/<skill>/` at repo root.
- **N6** [inference] The 13-command → 5-command surface consolidation (`SKILL_AUDIT_LOOP.md:67-83`) is well-documented in the doc, but the actual `.claude/commands/audit/` directory has 6 files (including `merge.md`). The user-facing surface and the docs disagree by one command. This is the kind of drift the audit doctrine specifically warns against.
- **N7** [direct-file-line] `~/Development/skills/skills/` has 146 SKILL.md files (`find ... -name SKILL.md | wc -l`). `SKILL_GRAPH.md § Current State` says **147**. The off-by-one is likely the template (`examples/skill-metadata-template.md`) being counted in one but not the other. Worth reconciling.
- **N8** [inference] The user's request *"I feel like I have to explain you and other agents all the time"* maps to a single architectural issue: **there's no auto-loaded "skill system primer" for fresh agents.** A 200-line `skill-graph/PRIMER.md` (or even just a single section in workspace AGENTS.md at line 40) would close the loop. The content exists; only the placement is wrong.
- **N9** [direct-file-line] The `version-schema-contract.md` rule (linked from AGENTS.md line 121) is one of the strongest doctrines in the workspace, but it lives in `.claude/rules/` and is auto-loaded only when an agent reads workspace rules. A skill-graph-launched session (which loses workspace rules per `skill-graph/CLAUDE.md`) does not see it. This is a real gap, not a doc placement issue — the rule should be mirrored into `skill-graph/AGENTS.md` (which it partially is, but only the doctrine text, not the enforcement script reference).
- **N10** [format_loss] The structured checklist sections (§ 1-3 above) follow the user's prompt rubric. But the user's deepest question — *"is the documentation sufficient so that I don't have to re-explain agents"* — is fundamentally a **placement** question, not a **content** question. The content is excellent. The placement scatters it. The rubric assumed a content-quality answer; the real answer is a placement-quality answer.

---

## 8. Completeness claim

**Examined:**
- 6 canonical docs (workspace `AGENTS.md`, `CLAUDE.md`, skill-graph `AGENTS.md`, `CLAUDE.md`, `SKILL_METADATA_PROTOCOL.md`, `SKILL_AUDIT_LOOP.md`, `SKILL_GRAPH.md`)
- 22 implementation files (`bin/skill-graph.js`, `lib/audit/*.js` × 17, `lib/audit-shared/auto-improve.js`, `lib/audit-shared/model-provider.js`, `scripts/skill/skill-audit-claim.js`, `audits/lanes.json`)
- 9 live smoke tests across `--help`, `audit --dry-run`, `audit`, `drift`, `lint`, `generate-manifest --validate-only`, `evolve --analyze-only`, `evolve --auto-improve`, `skill-audit-claim.js lanes` + `next`
- 1 filesystem survey of `~/Development/skills/skills/` (146 SKILL.md files)
- 144 Linear tasks across Skill Graph + Skill Audit Loop projects (1 In Progress + 143 Ready)
- 1 schema file (`schemas/skill.schema.json`)
- 12 directory layouts inspected
- A separate independent GPT-5.5 run was launched in parallel via `codex exec -m gpt-5.5` — its findings will be posted as a separate Linear artifact for triangulation.

**Reported all findings F1–F36 + N1–N10 = 46 distinct findings.** Severity distribution: 1× P0 (F14 — Integrity Gate verdict write-back missing) · 8× P1 · 12× P2 · 4× P3 · 11× INFO · 10× novelty memo.

**Excluded:** Did NOT run `--graded` mode with a live grader CLI (no scoped credentials). Did NOT run `evaluate-skill.js --mode application` end-to-end against a real `application.json` because none exist on any skill in the corpus. Did NOT modify any Linear tasks (read-only audit per the user's request). Did NOT close, comment on, or relabel any of the 142 legacy tasks — flagged for user decision.

---

## 9. /Wrap summary

**What this audit produced:** a 46-finding report on the Skill System (Protocol + Graph + Audit Loop + skill library + AGENTS.md placement). The documentation is excellent; the highest-leverage gap is **F14** (10-line fix: write Integrity Gate verdicts back to SKILL.md in `lib/audit/skill-audit.js`). The user's frustration with "having to re-explain skills to agents" maps to **F31** (the Skill System section is at line 97 of a 1056-line AGENTS.md, below most fresh-agent attention horizons) and to **N8** (no single "primer" file). Linear has 142 of 144 skill-system tasks aligned to a deleted pipeline — the user decides how to triage; this report does not auto-close anything.

**Files written:** `skill-graph/docs/research/skill-system-audit-2026-05-25.md` (this report) + parallel GPT-5.5 second-opinion at `/tmp/gpt55-skill-audit-report-2026-05-25.md`.
**Linear post:** This report is posted as a comment on a new Skill Graph audit issue (see Linear URL on the audit issue).
**No commits made.** Report-only per the user's instruction.
