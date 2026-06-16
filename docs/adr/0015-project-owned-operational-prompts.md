# ADR 0015 — Project-Owned Operational Prompts

> Status: Accepted — 2026-05-25
> Linear: none (drive-by infrastructure cleanup; no Linear issue prerequisite for the migration)
> Authors: Opus 4.7 session (2026-05-25) following the canonical-source-cleanup roundtable brief at `.roundtable/canonical-source-cleanup-2026-05-25/`
> Related: ADR-0009 (sibling repo deprecation; this ADR extends the same pattern from canonical *source code* to canonical *operational prompts*).

> **Amendment (2026-05-31) — runner prompts relocated within the repo.** The four runner prompts moved from `skill-graph/audits/prompts/` to `skill-graph/skill-audit-loop/prompts/` as part of the documentation-front-door reorganization (the new `skill-audit-loop/` folder collects the audit-loop spec and its runner prompts behind a `README.md`). This is a relocation only — the prompts remain **project-owned** exactly as this ADR establishes; the decision is unchanged. `audits/manifest.json` runner paths, the `audits-manifest.schema.json` `^skill-graph/skill-audit-loop/prompts/` pattern, the workspace `prompts/audits/` back-compat stubs, and all cross-references were updated in the same change. The decision body below still reads `audits/prompts/` for historical fidelity.
>
> **Amendment (2026-06-01) — runner prompts relocated to the project-root `prompts/` dir.** The four runner prompts moved again, from `skill-graph/skill-audit-loop/prompts/` to `skill-graph/prompts/`, so the audit-loop runners sit in a single project-level prompts home (a runtime-neutral canonical source consumed by the Claude / Codex / OpenCode adapters) rather than nested under the spec folder. Relocation only — the prompts remain **project-owned**; the decision is unchanged. `audits/manifest.json` runner paths, the `audits-manifest.schema.json` `^skill-graph/prompts/` pattern, the `skill-audit-loop/README.md` + root `README.md` references, the workspace `prompts/audits/` back-compat stubs, and all cross-references were updated in the same change. **The live path is now `skill-graph/prompts/`.**
>
> **Amendment (2026-06-07T) — run-root relocated.** The audit run-root (referenced in the body below as `.opencode/progress/skill-audits/<skill>/`) was relocated to `skill-graph/skill-audit-loop/progress/skill-audits/` per the **ADR-0016 supersession note (2026-06-07T)** — see [ADR-0016 § Status](0016-operational-data-ownership.md). This is the actioned form of the "tracked, not executed" run-artifacts migration the decision body below records (it had proposed `skill-graph/audit-runs/`; the actioned target is `skill-graph/skill-audit-loop/progress/skill-audits/`). The run-root is gitignored transient scratch. The decision body below still reads `.opencode/progress/skill-audits/` for historical fidelity.
>
> **Supersession (2026-06-05) — canonical-location directive.** The user directive recorded in `AGENTS.md § Canonical Location` (all Skill Graph scripts, commands, prompts, and library code live in `skill-graph/`; the only Skill Graph content outside is the `SKILL.md` files in `skills/skills/`) is the governing rule for *where* project-owned prompts and commands live. It extends this ADR's project-owned decision from "owned by the project" to "physically located in `skill-graph/`, with only thin pointer-shims in the runtime-resolved dirs (`.claude/commands/audit/*`, `.opencode/commands/*`)." The command + prompt migration (Stage 1a/1b) is done; the residual `~/Development/scripts/skill/*` script migration executes via the `stage2-scripts-skill-migration-2026-06-05` plan. The decision is unchanged in principle; the canonical location is now `skill-graph/`.

## Status

**Accepted.** Migration executed in three commits on 2026-05-25:

1. `skill-graph` `d1665e3` (2026-05-25 earlier today) — relocate 4 Skill Audit Loop runner prompts from workspace `prompts/audits/` to `skill-graph/audits/prompts/`; leave thin pointer stubs at the old paths.
2. `Development` (workspace root) `ddfcc2fa2` (same day) — rewrite `AGENTS.md § Shared Prompt Library` to document the project-owned-prompts convention; bump skill-graph gitlink.
3. `skill-graph` `d9d131a` + `5b21f26` — move the per-skill audit contract from `.opencode/commands/skill-audit-prompt-v2.2.md` into `skill-graph/SKILL_AUDIT_LOOP.md#part-3--per-skill-audit-runbook`, update all four runners' cross-references, add `skill-graph/audits/manifest.json` (machine-readable protocol index), add `skill-graph/scripts/check-audit-manifest.js` (false-canonicality verifier).
4. `Development` (this commit's pair) — delete the legacy `.opencode/commands/skill-audit-prompt-v2.{1,2}.md` files, convert workspace command files to thin pointers, update CONTEXT.md and AGENTS.md and the .claude rule files to reference the new canonical path.

## Context

Two failure modes drove this ADR.

**1. The May 22-25 GPT-5.5 audit incident.** Three skills (`backend`, `mcp-builder`, `token-cost-estimation`) had their SKILL.md Health Block stamped with `comprehension_verdict: PROVISIONAL` despite `skills/<name>/evals/comprehension.json` being absent on disk. Root-cause analysis (see `.roundtable/gpt55-canonical-source-debate-2026-05-25/`) surfaced fragmented authority: the Skill Audit Loop "canonical" contract existed in **three files at different paths** — `.opencode/commands/skill-audit-prompt-v2.2.md`, `prompts/audits/skill-audit-loop-single-model.md` (v3), and `prompts/audits/skill-audit-loop-batch-worker-v4.md` — each with subtly different statements about whether self-assessment could substitute for comprehension-case assessment. The agent that ran the audit landed on whichever file got loaded first and stamped the same verdict label from different evidence shapes.

**2. Workspace-level ownership of project-specific operational files.** The Skill Audit Loop is a Skill Graph concern (the contract evaluates skills; the runner artifacts go into `.opencode/progress/skill-audits/<skill>/`; the verdict semantics are owned by `skill-graph/SKILL_AUDIT_LOOP.md`). Yet its operational prompts lived under workspace-level `.opencode/commands/` and `prompts/audits/` directories used by every project. This created two anti-patterns:

- **Drift was undetectable.** No single grep target identified "this is THE canonical Skill Audit Loop spec." Five+ files at workspace level claimed to define some aspect of it.
- **Ownership was diffuse.** A change to the contract had no canonical home, so it landed wherever the editing agent happened to read first — multiplying the drift problem above.

## Decision

**Project-owned operational prompts live with their project.** Specifically:

| Layer | Location | Examples |
|---|---|---|
| **Project-owned operational prompts** | `<project>/audits/prompts/` (or analogous project-internal dir) | `skill-graph/audits/prompts/skill-audit-loop-{single-model,batch-worker-v4,codex-autonomous-v5,minimal-iteration}.md` |
| **Project-owned per-skill / per-task contracts** | `<project>/audits/<contract-name>.md` | `skill-graph/SKILL_AUDIT_LOOP.md#part-3--per-skill-audit-runbook` (was `.opencode/commands/skill-audit-prompt-v2.2.md`) |
| **Machine-readable protocol index** | `<project>/audits/manifest.json` | `skill-graph/audits/manifest.json` |
| **Project-owned verifiers** | `<project>/scripts/check-*.js` | `skill-graph/scripts/check-audit-manifest.js` |
| **Workspace slash-command resolvers** | `.claude/commands/`, `.opencode/commands/` | Thin pointers — at most a usage block + a redirect to the project-owned canonical |
| **Workspace prompt library (`prompts/`)** | `prompts/audits/` | Thin pointer stubs for back-compat; the operational content lives in the project |

The runtime-specific `.claude/commands/` and `.opencode/commands/` directories hold slash-command surface (description, argument hints, usage examples, when-to-use lists) but defer the operational contract to the project. They are runtime-bound (Claude Code / OpenCode discovers them) and version-bound to the slash-command runtime, not the protocol.

## Consequences

**Positive:**
- One grep target for the canonical contract (`skill-graph/SKILL_AUDIT_LOOP.md#part-3--per-skill-audit-runbook`); no drift-by-multiplication.
- `skill-graph/audits/manifest.json` declares the protocol's runners and required artifacts in machine-readable form. The verifier `skill-graph/scripts/check-audit-manifest.js` catches the May 22-25 failure mode (a verdict.md claiming PROVISIONAL/APPLICABLE/PASS for `comprehension_verdict` without `skills/<name>/evals/comprehension.json` on disk) — confirmed on the same 3 historical runs that surfaced the incident.
- Slash commands continue to work via thin resolvers — `.claude/commands/audit/audit.md` and `.opencode/commands/audit-skill.md` discover and execute via `@file` include or direct reference.
- Ownership is unambiguous: changes to the contract land in `skill-graph/` with the project they govern.

**Negative / accepted costs:**
- Path indirection: agents reading a runner prompt now follow one extra hop to the canonical contract. Mitigated by the manifest making the relationship explicit.
- Workspace docs (`CONTEXT.md`, `AGENTS.md`, `.claude/rules/*`, `.claude/references/loop-lifecycle.md`, etc.) had to be updated to point at the new path. This was a one-time migration; the project-owned convention prevents recurrence.
- Runner files are not slimmed to the ideal "~50 lines each just operational shape" in this pass. They still contain inline verdict definitions, commit discipline, hard rules. This is **deliberate deferred work**: the runners are actively used by automation (Codex cron) and a heavy refactor introduces risk for limited gain. Future cleanup can extract the shared content; the present-day `SKILL_AUDIT_LOOP.md` § Part 3 — Per-Skill Audit Runbook is the authoritative source of truth either way.

## Deferred work (not done in this ADR)

- **Audit-run artifacts migration** (`.opencode/progress/skill-audits/` → `skill-graph/audit-runs/`). 3,241 path references exist across the workspace. The vast majority are inside historical run snapshots (read-only). The migration would require updating only the active writer/reader scripts. Strategy when actioned: freeze `.opencode/progress/skill-audits/` as historical archive; new runs write to `skill-graph/audit-runs/<skill>/<timestamp>/`; update writer scripts (`scripts/skill/skill-audit-claim.js` and friends); document the frozen status in AGENTS.md / CONTEXT.md. Tracked here, not executed.
- **Runner slim-down to minimal operational shape.** As above — present-day runners are still substantive. The per-skill contract is the authoritative source, so the duplication is at worst a readability cost, not a correctness cost.

## Related

- [ADR-0009](0009-sibling-repo-deprecation.md) — establishes the pattern of consolidating canonical source into the owning project; this ADR extends the same pattern to operational prompts.
- [ADR-0011](0011-split-audit-verdict.md) — establishes the four-verdict Health Block that the per-skill contract enforces.
- `.claude/rules/version-schema-contract.md` — "version labels are earned, not bumped" — same principle: the canonical source must match its declared identity, never just bear the label.
- `.claude/rules/multi-session-commits.md` — every commit in this migration used `git commit --only -F ... -- <paths>`.
- `.roundtable/canonical-source-cleanup-2026-05-25/` — the executable brief that drove this work, including the structured-pass + novelty-memo + dissent + completeness-claim shape per `.claude/rules/prompt-shape-structured-plus-novelty.md`.
- `.roundtable/gpt55-canonical-source-debate-2026-05-25/` — the earlier root-cause debate that surfaced the three-file drift.

## Verification

The grep verification from the brief's Step 7 returns the expected results:

- `grep -rE 'prompts/audits/skill-audit-loop-|\.opencode/commands/skill-audit-prompt' skill-graph/audits/` — returns only the intentional history note in `SKILL_AUDIT_LOOP.md` § Part 3 — Per-Skill Audit Runbook.
- The verifier `node skill-graph/scripts/check-audit-manifest.js` flags exactly the 3 May-incident runs (backend / mcp-builder / token-cost-estimation) and passes on every other run.
- `git show --stat` on each commit matches the intended file list per `.claude/rules/multi-session-commits.md` § "always run --only path-limited."
