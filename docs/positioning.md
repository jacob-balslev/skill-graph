# Positioning — Skill Graph in the Agent-Skills Ecosystem

> **One-line:** Skill Graph is the **authoring contract + audit loop** for agent skills — it sits *above* plain `SKILL.md` files and *beside* protocols like MCP and A2A. It does not host, dispatch, or execute skills.

## What this answers

If you came in via the README hero and asked "where does this fit?", this doc names every adjacent project and draws the boundary. The goal is to make the
unique angle of Skill Graph legible in under 60 seconds.

## The 60-second pitch

Most agent-skill projects answer one of these questions:

1. **How does an agent find and load a skill?** (Anthropic Skills, agent-skills registries)
2. **How does an agent call a tool?** (MCP)
3. **How do agents talk to each other?** (A2A)
4. **Where do skills get packaged and discovered?** (Smithery, marketplaces)
5. **How does an agent author orchestrate skill calls in production?** (Composio, agent platforms)

Skill Graph answers a **different** question: **how do you keep a library of skills correct over time?**

It does this by giving every skill a structured contract (`SKILL.md` frontmatter), a graph of typed edges between skills (`relations.*`), and a Skill Audit Loop lifecycle: `Read → Verify → Evaluate → Research → Improve → Use → Evaluate → Grade`. The four operations (`audit`, `improve`, `evaluate`, `evolve`) are the executable command surface for that lifecycle, and Karpathy-style keep-or-revert is the discipline for candidate changes. The contract is portable; the audit loop is the unique mechanism.

## The "what this is not" matrix

Skill Graph is not a competitor to MCP, A2A, Anthropic Skills, Smithery, or Composio. They sit at different layers:

| Project | What it is | What Skill Graph is in that frame |
|---|---|---|
| **[Anthropic Skills](https://docs.anthropic.com/en/docs/claude-code/skills)** | A discovery + loading convention: agent-runtime auto-loads `SKILL.md` files from a directory and decides what to invoke. | Skill Graph **extends** the `SKILL.md` shape with structured metadata (relations, grounding, Evaluation Status) so a library of 100+ skills stays coherent. A plain `SKILL.md` still loads everywhere; Skill Graph adds validation, drift checks, and graph queries on top. |
| **[Agent Skills spec](https://agentskills.my/specification)** | A portable `SKILL.md` packaging format with a draft cross-runtime contract. | Skill Graph **emits** Agent-Skills-compatible exports (see [`skill-graph export`](../README.md#quick-start)). The Skill Metadata Protocol adds typed relations and audit fields the base spec does not require, but the export is plain. |
| **[Model Context Protocol (MCP)](https://modelcontextprotocol.io)** | A *runtime* protocol: how an agent client calls a tool server (function calling, structured tools, resources, prompts). | Skill Graph is **build-time and authoring-time**, not runtime. Skills can describe how an agent should use an MCP server (in their body or `relations.depends_on`), but Skill Graph itself does not implement MCP. |
| **[Agent-to-Agent (A2A)](https://google.github.io/A2A/latest/specification/)** | A *runtime* protocol: how one agent delegates a task to another agent and exchanges capability cards. | Skill Graph's metadata could serve as the capability descriptor an A2A agent advertises, but Skill Graph does not implement A2A delegation, transport, or task lifecycle. |
| **[Smithery](https://smithery.ai)** | A *registry*: searchable directory of MCP servers and agent skills with install confidence and compatibility signals. | Skill Graph's marketplace export pipeline (`marketplace/skills/`) is one upstream that *feeds* a registry like Smithery; Skill Graph itself is the authoring source, not the registry. |
| **[Composio](https://docs.composio.dev)** | An *agent tooling platform*: hosted integrations, auth, and tool execution for production agents. | Skill Graph and Composio operate at different layers entirely. A Composio agent could include Skill-Graph-published skills as part of its task brief; Skill Graph does not host or dispatch. |
| **[AGENTS.md](https://agents.md)** | A *repository-local* convention for instructing coding agents (Claude, Cursor, Codex, etc.) on how to work in a specific repo. | Skill Graph can **ingest** an `AGENTS.md` as a context source for a codebase-scope skill's `grounding` field, but it does not compete with the convention. Skill Graph is repository-portable; AGENTS.md is repository-local. |

## The Karpathy axis (what makes Skill Graph itself distinct)

Most of the above projects are concerned with the *what* and *how* of agent skills. Skill Graph adds an **opinionated discipline** for the *when* — when a skill is changed:

- **One field, one commit, one keep-or-revert decision** ([Karpathy's autoresearch](https://github.com/karpathy/autoresearch) loop, applied to skill libraries instead of training scripts).
- Every change has a hard pass/fail gate (a deterministic check script that reports PASS or FAIL).
- Failed changes auto-revert. The lesson is recorded; the field's truth is preserved.

That discipline is the unique angle. The metadata schema is the substrate that makes it possible — without typed fields, you can't have a deterministic gate. The audit loop is the mechanism. The result is a skill library that drifts less, even as it grows.

## When to reach for Skill Graph

Reach for it when:

- You have **more than ~5 skills** and they have started to depend on, verify, or exclude one another.
- You want **deterministic checks** for skill correctness (schema, paths, Evaluation Status) and not just LLM-as-grader.
- You want **graph queries** over the library — "what skills depend on this one?", "what's the boundary between X and Y?", "which skills verify this one?"
- You want a **single audit loop** that produces a fingerprint per skill (`structural_verdict`, `truth_verdict`, `comprehension_verdict`, `application_verdict`, `eval_score`, `drift_status`) recorded in the skill's sibling `audit-state.json` sidecar and joined into the compiled manifest.

Do NOT reach for it when:

- You have 1–3 skills and a plain folder is enough.
- You want a hosted skill marketplace (use Smithery, agentskills.io).
- You want an agent runtime (use Claude Code, Cursor, Codex, etc.).
- You want a tool execution platform (use Composio, your agent runtime's tool layer).

## Where this puts Skill Graph

In the ecosystem map, Skill Graph sits in the **author-time + audit-time** layer:

```
runtime layer            Anthropic Skills | MCP | A2A | Composio | Smithery
                              ↑   ↑     ↑       ↑          ↑
                              |   |     |       |          |  (consumes published skills)
author/audit-time layer       └───┴─────┴───────┴──────────┘
                                          ↑
                              ┌───────────┴────────────┐
                              |   Skill Graph (here)   |
                              | + Karpathy audit loop  |
                              └────────────────────────┘
```

The runtime layer answers "how does this skill execute?" The author/audit-time layer answers "how does this library stay correct?" Both are needed; both are different products.

## Related reading

- [`skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md`](../skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md) — the contract.
- [`skill-audit-loop/SKILL_AUDIT_LOOP.md`](../skill-audit-loop/SKILL_AUDIT_LOOP.md) — the Skill Audit Loop lifecycle and its four operations (`audit`, `improve`, `evaluate`, `evolve`).
- [`docs/quality-doctrine.md`](quality-doctrine.md) — what "improve" means in this discipline.
- [`docs/adr/0009-sibling-repo-deprecation.md`](adr/0009-sibling-repo-deprecation.md) — why the protocol, audit, and CLI live in one repo now.
- [Karpathy autoresearch](https://github.com/karpathy/autoresearch) — the keep-or-revert loop applied to LLM training scripts that Skill Graph borrows for skill libraries.
