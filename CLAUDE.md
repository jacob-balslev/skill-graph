# Claude Code — Skill Graph

> Type: Reference
> Claude-specific entrypoint. The binding contract lives in `AGENTS.md`.

This repo follows the [AGENTS.md cross-tool standard](https://agents.md/). Claude Code reads `CLAUDE.md` only, so this file imports `AGENTS.md` to keep both surfaces synchronized without duplication. Per the [Anthropic memory docs](https://code.claude.com/docs/en/memory): "Claude Code reads `CLAUDE.md`, not `AGENTS.md`. If your repository already uses `AGENTS.md` for other coding agents, create a `CLAUDE.md` that imports it so both tools read the same instructions without duplicating them."

@AGENTS.md

## Session Launch — Read Before Starting

This repo is a peer of `~/Development/` (the orchestration brain). Most agent workflows depend on `~/Development/.claude/` (rules, skills, agents, commands) and `~/Development/scripts/` (memory, analytics, Linear CLI, doc-verification gates).

Claude Code does NOT traverse `.claude/skills/`, `.claude/agents/`, or `.claude/commands/` from ancestor directories — verified against [claude-code #26489](https://github.com/anthropics/claude-code/issues/26489). Ancestor `CLAUDE.md` files DO eager-load, but the rest of the orchestration tree does not.

**Convention: launch Claude Code from `~/Development/`** and `cd` into `skill-graph/` to work. The solver/subagent inherits the parent session's rules, skills, agents, and commands.

If you must start from inside this repo (rare), expect:

- No `/manage`, `/wrap`, `/solve`, `/grind` commands
- No skill injection (`agent-orchestration/hooks/skill-injector.py`)
- No memory access — `~/.claude/projects/-Users-jacobbalslev-Development/memory/` is keyed by cwd at session start; launching from `~/Development/skill-graph/` creates a fresh, empty project memory
- No custom rules (`.claude/rules/*.md` from Development)
- AGENTS.md content is still loaded via this file's `@AGENTS.md` import
- Ancestor `~/Development/CLAUDE.md` still loads eagerly

Full analysis of Claude Code's cross-repo loading behavior: `~/Development/skills/repository-structure/references/agents-md-multi-repo-claude-code.md`.

## Documentation Routing

See `AGENTS.md` § Document Routing Table for change-type → docs-to-update mappings specific to this repo.

For routing concerns that span Development + skill-graph (cross-repo coordination, the canonical skill library at `~/Development/skills/`, or the deprecation-mirror `~/Development/skill-metadata-protocol/`), see [ADR 0009](docs/adr/0009-sibling-repo-deprecation.md).

## Memory

Cross-session memory for this repo lives in the workspace project at `~/.claude/projects/-Users-jacobbalslev-Development/memory/`. Repo-scoped memories use the `skill_graph_*.md` filename prefix.

Linear tasks for this repo live in the dedicated **skill-metadata-protocol** org (team `SKI`),
migrated out of Sales Hub on 2026-06-03 (clean break — see
`~/Development/docs/plans/skill-graph-linear-workspace-migration-2026-06-03.md`). Target it with the
`--workspace smp` selector (reads `LINEAR_API_KEY_SMP` + `LINEAR_TEAM_ID_SMP` from `~/.claude/.env.keys`):

```bash
node ~/Development/scripts/linear/linear-cli.js create --workspace smp \
  --project "Skill Graph" --title "..."   # projects: Metadata Protocol | Skill Graph | Skill Audit Loop
```

Per-skill audit work is **not** tracked as Linear issues — the audit loop drains the file-based ranked
worklist (`.opencode/progress/SKILL_LIST.json`) + per-skill run ledger; Linear holds SYSTEM tasks,
epics, and blockers only (per-skill audit tickets were deprecated 2026-05-25).

Never via Linear MCP tools (banned workspace-wide per `~/Development/.claude/rules/cli-first.md`).
