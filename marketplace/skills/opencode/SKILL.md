---
name: opencode
description: "Use when deciding whether to run a task on the OpenCode agent runtime, how to invoke it non-interactively, how to pick a provider/model string, or how OpenCode differs from Claude Code and Codex. Covers terminal TUI, opencode run, ACP/IDE bridge, desktop beta, web UI, opencode serve, provider/model routing, OpenCode Zen and OpenCode Go lanes, config precedence, JSONL output, CLI command surface, build/plan agents, LSP code intelligence, permissions, Agent Skills, MCP, references, commands, plugins, local models, and scripting/automation. Do NOT use for choosing which free model fits a task (use opencode-free-models), writing the agent loop itself (use autonomous-loop-patterns), or GitHub Copilot premium-request economics (use github-copilot). Do NOT use for which free model should I use for this classification job? Do NOT use for how do I structure the autonomous agent loop itself? Do NOT use for how many Copilot premium requests will this burn?"
license: MIT
compatibility: "Markdown, any agent runtime; describes the OpenCode CLI (TypeScript core, client-server architecture; npm/Bun/pnpm/Yarn distributed)"
allowed-tools: "Read Bash(opencode:*) Bash(node:*) Bash(git:*)"
metadata:
  subject: agent-ops
  subjects: "[\"agent-ops\",\"ai-engineering\"]"
  public: "true"
  scope: "Choosing and operating the OpenCode agent runtime across its surfaces (terminal TUI, non-interactive `opencode run` CLI, IDE bridge via ACP, desktop beta, web UI, headless `opencode serve` server): when OpenCode is the right runtime vs a single-vendor CLI, non-interactive invocation and its flags, the `provider/model` string format and model-selection precedence, model variants, the multi-source config-merge precedence (8 layers, remote → MDM), the built-in build/plan agents and LSP code intelligence, the MCP/plugin/skill/references/commands extension layers, permissions vs provider policies, the OpenCode Zen curated/free model service and the OpenCode Go subscription lane, Zen privacy exceptions, local-model configuration, the full CLI lifecycle command surface (session/stats/export/import/github/pr/plugin/mcp/db/debug/upgrade), and automation patterns (including parsing the `--format json` JSONL event stream). Portable knowledge about a public open-source tool — no project-internal config. Out: choosing which specific free model fits a task (opencode-free-models), authoring the agent/loop logic itself (autonomous-loop-patterns), and GitHub Copilot billing (github-copilot)."
  taxonomy_domain: agent/harness
  stability: experimental
  keywords: "[\"opencode runtime\",\"opencode run non-interactive\",\"opencode model routing\",\"provider/model string\",\"opencode zen\",\"opencode config precedence\",\"opencode vs claude code\",\"opencode serve attach\",\"opencode CLI automation\",\"opencode json output\"]"
  examples: "[\"should I run this on OpenCode or Claude Code?\",\"how do I invoke opencode non-interactively from a script?\",\"what's the provider/model string format for opencode run?\",\"can I run OpenCode against a warm server and parse JSON output?\",\"what's the configuration precedence in opencode.json?\",\"is OpenCode Go different from Zen pay-as-you-go pricing?\"]"
  anti_examples: "[\"which free model should I use for this classification job?\",\"how do I structure the autonomous agent loop itself?\",\"how many Copilot premium requests will this burn?\"]"
  grounding: "{\"subject_matter\":\"OpenCode CLI/runtime, model-roster, config, and extension capability facts\",\"grounding_mode\":\"hybrid\",\"truth_sources\":[\"skills/agent-ops/opencode/references/model-facts.md\"],\"failure_modes\":[\"stale_model_id\",\"stale_context_window\",\"stale_pricing_or_rate_limit\",\"benchmark_claim_without_date\",\"capability_claim_quoted_from_memory\"],\"evidence_priority\":\"repo_code_first\"}"
  relations: "{\"related\":[\"opencode-free-models\",\"github-copilot\",\"autonomous-loop-patterns\",\"ai-native-development\"],\"suppresses\":[{\"skill\":\"opencode-free-models\",\"reason\":\"I own the OpenCode RUNTIME (invocation, routing mechanics, config merge, Zen service, permissions/policies, skills/references/commands); opencode-free-models owns WHICH free model to route a given task to\"},{\"skill\":\"github-copilot\",\"reason\":\"I own the OpenCode runtime; github-copilot owns Copilot's premium-request / AI-credit economics and IDE-native flow\"}],\"verify_with\":[\"opencode-free-models\"]}"
  mental_model: "A coding-agent runtime is the HARNESS (the loop, tool use, session, permissions, code intelligence); the model is a swappable engine behind a provider/model string, optionally with a variant. A provider-agnostic runtime separates the two cleanly — pick the harness once, switch the engine per task — where single-vendor CLIs are designed around one engine even when they can be coerced toward others. The same harness can be reached through several surfaces (terminal TUI, non-interactive CLI, IDE bridge, desktop app, web UI, headless server) without changing the runtime decision."
  purpose: "It exists so one agent runtime can reach any model — frontier, cheap, free, subscription-backed, or local — through a single configuration, without a separate CLI per vendor and without vendor lock-in, so model choice becomes a per-task routing decision rather than a tooling commitment, while automation, permissions, session handling, and context-loading behavior stay stable."
  concept_boundary: "This owns the RUNTIME: choosing and operating the provider-agnostic harness, its multiple surfaces and non-interactive invocation, the JSONL event stream, the provider/model string and selection precedence, the config-source precedence, the built-in agents and code intelligence, permissions vs provider policies, the MCP/plugin/skill/references/commands extension layers, the curated/free model service and subscription lane, and local-model config. It does NOT own which specific model a task should route to, the agent-loop logic itself, or another tool's premium-credit economics."
  analogy: "It is a universal power-tool body with a swappable bit and a lockable safety guard — the body (harness) stays, you snap in whichever bit (model) the job needs (including the free ones in the case) and set the guard (permissions/policies) for the job, and you can grip the same body by several handles (terminal, IDE, web, server)."
  misconception: "That the runtime's name denotes a model, a quality tier, a privacy guarantee, or a cost tier. It does not — the runtime is just the harness; capability, cost, context window, and data retention come entirely from the provider/model routed to, its variant, and the provider's data path, so naming the runtime says nothing about how capable, expensive, or private a run was."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/agent-ops/opencode/SKILL.md
  skill_graph_export_description: shortened for Agent Skills 1024-character description limit; canonical source keeps the full routing contract
  skill_graph_canonical_description_length: "1223"
  skill_graph_export_description_projection: anti_examples
---

# OpenCode

## Concept of the skill

**What it is:** OpenCode is an open-source (TypeScript core, client-server architecture; distributed via npm/Bun/pnpm/Yarn), provider-agnostic AI coding agent — a runtime that routes a single agent loop across 75+ LLM providers (and local models) through one configuration. It is exposed through several surfaces: an interactive terminal TUI, a non-interactive `opencode run` command for scripting, an IDE bridge via the Agent Client Protocol (`opencode acp`), a desktop app (beta) on macOS/Windows/Linux, a browser UI (`opencode web`), and a headless `opencode serve` server.

**Mental model:** A coding-agent runtime is the *harness* (the loop, tool use, session, permissions, LSP-backed code intelligence); the *model* is a swappable engine behind a `provider/model` string. OpenCode separates those two cleanly — pick the harness once, switch the engine per task. Single-vendor CLIs are *designed around* one engine; OpenCode is designed around the decoupling. The harness itself stays the same whether you reach it from the terminal, an IDE, the desktop app, the browser, or a server.

**Why it exists:** To let one agent runtime reach any model (frontier, cheap, free, subscription-backed, or local) without a separate CLI per vendor and without vendor lock-in, so model choice becomes a routing decision rather than a tooling commitment.

**What it is NOT:** It is not a model, not a hosted marketplace, and not the agent loop *logic* — it is the runtime that executes a loop against whatever model you route to. It is also not a billing, quality, or privacy guarantee: cost, capability, and data retention depend entirely on which `provider/model` (and which data path) you select. OpenCode Zen is an *optional* curated provider inside the ecosystem; using OpenCode does not mean every run uses Zen, and using Zen does not make the free roster stable.

**Adjacent concepts:** the model that the runtime drives (the swappable engine); the agent loop the runtime executes; single-vendor CLIs that center one harness on one engine; a model-routing layer that picks the engine per task; configuration merge precedence across environments.

**One-line analogy:** OpenCode is a universal power-tool body with a swappable bit and a lockable guard — the body (harness) stays, you snap in whichever bit (model) the job needs (including the free ones in the case), set the guard (permissions/policies), and grip it by whichever handle (terminal, IDE, web, server) suits the work.

**Common misconception:** That "OpenCode" names a model or a quality tier. It does not — it is the harness; quality, cost, and privacy come entirely from the `provider/model` (and data path) you route to, so "I used OpenCode" says nothing about how capable, expensive, or private the run was.

## Coverage

- When to choose the OpenCode runtime over a single-vendor CLI (Claude Code, Codex, Copilot) — the harness-vs-engine decision
- The multi-surface runtime: terminal TUI, non-interactive `opencode run` CLI, IDE bridge via ACP (`opencode acp`), desktop app (beta), browser UI (`opencode web`), and headless `opencode serve` server — and which surface fits which usage (interactive dev, scripting, editor-embedded, browser, CI driver)
- Non-interactive invocation: `opencode run` and its flags for scripting/automation (`--model`, `--agent`, `--variant`, `--continue`, `--session`, `--fork`, `--file`, `--dir`, `--format json`, `--attach`, `--dangerously-skip-permissions`, `--thinking`, `--port`, `--username`/`--password`)
- The `--format json` JSONL event stream and how to parse it defensively in automation (the exit-before-`step_finish` gotcha)
- The `provider/model` string format, model variants, and the four-step model-selection precedence at startup; `small_model` for helper tasks
- The multi-source config merge/precedence (8 layers: remote → global → custom → project → `.opencode/` → inline → managed → MDM) and what it means for CI/enterprise automation; JSONC + variable substitution
- The built-in `build` / `plan` agents and LSP-backed code intelligence — harness capabilities independent of the model
- Permissions (which gate tool actions) versus experimental provider policies (which gate provider/resource access)
- Native extension layers: Agent Skills (discovered from `.opencode/skills/`, `~/.config/opencode/skills/`, and Claude-/agents-compatible `.claude/skills/` & `.agents/skills/`), instruction-file precedence (`AGENTS.md` native, `CLAUDE.md` fallback), `opencode mcp` (Model Context Protocol servers), `opencode plugin` (harness plugins), `opencode github` (GitHub integration), references, and custom commands
- `OPENCODE_DISABLE_CLAUDE_CODE` and related env vars for pure OpenCode-native execution where stray `.claude` fallback files are present but unwanted
- The client-server architecture: `opencode serve` + `--attach` for CI/long-running drivers, remote TUI via `opencode attach`, and securing a network-reachable server with `OPENCODE_SERVER_PASSWORD`
- The CLI lifecycle surface: `session`, `stats`, `export`/`import`, `github`, `pr`, `plugin`, `mcp`, `db`, `debug`, `upgrade`, `uninstall`
- The OpenCode Zen curated/free model service (promotional free tier, per-1M-token paid models, privacy exceptions) and the separate OpenCode Go subscription lane
- Local-model configuration (Ollama, LM Studio, Docker Model Runner) as standard providers via Models.dev / the Vercel AI SDK
- Version-check discipline (`opencode --version`) because the CLI moves fast and local flags can lag the docs
- What OpenCode is NOT: a model, a quality tier, a hosted marketplace, a privacy guarantee, or the agent-loop logic

## Philosophy of the skill

The runtime and the model are two separable decisions, and OpenCode's entire value is honoring that separation. The tempting shortcut — treating "we ran it on OpenCode" as if it implied a capability or a cost — is exactly the conflation the harness-vs-engine model exists to prevent. Pick the harness for what the *task needs from the loop* (multi-provider routing, a free lane, local models, scriptability, LSP code intelligence, reusable skills/commands/references, permission/policy control, the right surface — terminal/IDE/web/server, open source); pick the model separately for what the task needs from the *engine* (capability, context window, cost, latency, data policy, availability).

Single-vendor CLIs are built around one engine — some can now be coerced toward third-party models via base-URL overrides or community routers, but that is a bolt-on, where provider-agnosticism is OpenCode's design center. The discipline is to keep harness and engine apart so model choice stays a per-task routing decision rather than a tooling commitment. If a result is weak, inspect the selected model and variant first; if a run was expensive, inspect the provider/model, Zen pay-as-you-go balance, and Go subscription/limit state first.

OpenCode moves quickly. Treat docs, model rosters, free-tier labels, prices, and local CLI behavior as live surfaces. A remembered model ID, stale free roster, or outdated local binary is not dispatch evidence.

## When to choose OpenCode (routing decision)

Pick the runtime by what the task needs from the *harness*, then pick the model separately.

| Situation | Use OpenCode? | Why |
|---|---|---|
| You need to route the same task across many vendors / compare models | Yes | One harness, 75+ providers via the AI SDK + Models.dev; native, not a bolt-on |
| You want a free or cheap model lane in the terminal | Yes | OpenCode Zen exposes a free tier; verify the exact live ID before dispatch |
| You need to run a local/offline model (Ollama, LM Studio, Docker Model Runner) | Yes | Local runners are configured as standard providers |
| You want an open-source, scriptable, non-interactive agent | Yes | `opencode run` + `--format json` (JSONL) for automation; `serve`/`web` HTTP API |
| You need repeated automation without repeated server/MCP cold starts | Yes | Start `opencode serve`, then run with `--attach http://localhost:4096` |
| You want the agent embedded in an IDE/editor rather than a terminal | Yes | `opencode acp` bridges the same runtime to ACP-compatible editors |
| You need a browser UI or remote TUI attachment | Yes | `opencode web`, then `opencode attach <url>` |
| You want type-aware editing (signatures, diagnostics) regardless of model | Yes | Built-in LSP integration feeds the agent real compiler info across 20+ languages |
| You need reusable project commands, native skills, references, or specialized agents | Yes | `.opencode/commands`, agent configs, `SKILL.md` discovery, and references |
| You need provider/tool guardrails at the harness level | Yes, with config | `permission` for tool actions, `experimental.policies` for provider access |
| You need a GitHub Actions agent that responds to `/opencode` in PRs | Yes | `opencode github install` sets up the workflow; runs inside your runners |
| You need subscription economics for open coding models rather than per-token Zen spend | Maybe | OpenCode Go is a separate optional lane; verify live price, limits, and roster |
| You are committed to one vendor's CLI-specific ecosystem features (e.g. Codex's sandbox model, a vendor's hooks) | Often no | Those CLIs are tuned to their own model/ecosystem (note: skill-injection is NOT one of these — OpenCode has native Agent Skills) |
| You just want one vendor's model with minimal setup | Often no | A single-vendor CLI (or a base-URL override on one) may be simpler than configuring a router |
| The decision is *which model*, not *which runtime* | No | That is a model-routing question (see `opencode-free-models`) |
| The runtime is chosen and you need loop control | No | Use `autonomous-loop-patterns` for retry/claim/checkpoint logic |

## Capability reference

| Surface | Form | Notes |
|---|---|---|
| Version check | `opencode --version` | Check before relying on newly documented flags or config keys; the CLI moves fast |
| Interactive TUI | `opencode [project]` | `@` file/reference context, `!` bash results, slash commands, sessions, undo/redo, model/variant switching |
| Non-interactive run | `opencode run [message..]` | The scripting/automation entry; no full TUI |
| Model select | `--model` / `-m` `provider/model` | e.g. `anthropic/claude-sonnet-4-20250514`, `opencode/minimax-m3-free`; confirm exact IDs live |
| Model variant | `--variant <name>` | Provider-specific reasoning/effort preset (CLI surface of the `opencode.json` per-model options); not all providers support the same variants |
| Agent select | `--agent <name>` | Choose a built-in or custom agent (e.g. `build`, `plan`) |
| Continue session | `--continue`/`-c`, `--session`/`-s <id>`, `--fork` | Resume or branch prior context; `--fork` branches to save tokens |
| Attach file / working dir | `--file`/`-f`, `--dir` | Add file context; run against a directory other than cwd (CI-relevant) |
| Machine output | `--format json` | One JSON event-object per line (JSONL); parse the stream, not a single blob (see below) |
| Auto-approve | `--dangerously-skip-permissions` | Auto-approve any non-denied permission — the flag that unblocks unattended runs; use only in a disposable, fenced environment |
| Show thinking | `--thinking` | Display model reasoning blocks |
| Warm-server attach | `opencode serve`; `opencode run --attach http://localhost:4096 ...` | Reuse a headless server; protect it with `OPENCODE_SERVER_PASSWORD` when exposed |
| Web / remote TUI | `opencode web`; `opencode attach <url>` | Start a server with a browser UI; attach another TUI to the backend when needed |
| IDE bridge | `opencode acp` | Agent Client Protocol over stdin/stdout — drive the same runtime from an ACP-compatible editor/IDE |
| Auth | `opencode auth login [--provider ID]` (also `/connect` in TUI) | Per-provider credentials; stored in `~/.local/share/opencode/auth.json`; keys also read from env / `.env` |
| Discover models | `opencode models [provider]` (`--refresh --verbose`) | Discover available `provider/model` ids; verbose includes cost metadata |
| Define agent | `opencode agent create` | `--mode all\|primary\|subagent`, `--permissions` (deny-by-default), `--model`, `--description` |
| MCP servers | `opencode mcp add\|list\|auth\|logout\|debug` | Manage Model Context Protocol server connections (local + remote/OAuth) |
| Plugins | `opencode plugin <module> [--global] [--force]`; `--pure` | Manage harness plugins; `--pure` runs without external plugins |
| GitHub integration | `opencode github install\|run`; `opencode pr <number>` | GitHub agent for PR automation; reacts to `/opencode` mentions; `pr` checks out a PR and runs |
| Session lifecycle | `opencode session list\|delete`; `opencode export\|import`; `opencode stats` | List/delete sessions, move sessions across machines, inspect token/cost usage |
| Maintenance / debug | `opencode db`, `opencode debug`, `opencode upgrade`, `opencode uninstall` | Inspect local DB/config state, troubleshoot, update, or remove OpenCode |
| Resolved config | `opencode debug config` | Inspect the merged result when remote/global/custom/project/managed layers conflict |

**Built-in agents:** two ship by default and switch with `Tab` in the TUI (or `--agent` in `run`): **`build`** — full-access default for development; **`plan`** — read-only for analysis/exploration that cannot mutate files. Docs may list additional built-ins (e.g. general/explore/scout) and hidden compaction/title/summary agents — verify live. Custom agents are defined via `opencode agent create` or `.opencode/agents/<name>.md` frontmatter (`description`, `mode`, `model`, `permission` with `allow`/`ask`/`deny` glob rules, `steps`, `hidden`, `prompt`).

**Code intelligence:** OpenCode integrates the Language Server Protocol, so the agent receives real type information, function signatures, import paths, and live compiler diagnostics across 20+ languages — a harness capability independent of which model is routed.

### Full CLI command map

Roughly 18 top-level commands as of OpenCode 1.x (2026 — verify with `opencode --help`):

| Command | Purpose |
|---|---|
| `opencode [project]` | Launch the TUI in the given directory (default) |
| `opencode run [message..]` | One-shot non-interactive invocation |
| `opencode serve` | Headless HTTP API server (other clients attach) |
| `opencode web` | Headless server plus the OpenCode web UI |
| `opencode attach <url>` | Attach a TUI to a running server |
| `opencode acp` | Agent Client Protocol over stdin/stdout (IDE bridge) |
| `opencode auth` | Manage provider credentials and login (`login`/`list`/`logout`) |
| `opencode models [provider]` | List models, optionally filtered by provider (`--refresh --verbose`) |
| `opencode mcp` | Manage MCP servers (`add`/`list`/`auth`/`logout`/`debug`) |
| `opencode agent` | Manage agents (`list`/`create`) |
| `opencode session` | List or delete sessions |
| `opencode stats` | Token usage and cost statistics (`--days`/`--models`/`--project`) |
| `opencode export [sessionID]` | Export session data as JSON (`--sanitize` to redact) |
| `opencode import <file\|url>` | Import a session from file or share URL |
| `opencode github` | Manage the GitHub agent for PR automation |
| `opencode plugin <module>` | Install a plugin (`--global`, `--force`) |
| `opencode pr <number>` | Fetch and checkout a GitHub PR, then run |
| `opencode db [query]` | Local database tools |
| `opencode debug [command]` | Debug: `paths`, `config`, `startup`, `skill`, `agent`, `lsp`, `rg`, `file`, `snapshot`, `scrap` |
| `opencode upgrade [target]` | Update to latest or a specific version |
| `opencode uninstall` | Remove OpenCode and related files |

### Attach to a warm / remote server

```bash
# Start the backend for headless / web / remote access
opencode serve --port 4096
# or with a browser UI and remote binding:
opencode web --port 4096 --hostname 0.0.0.0

# In another terminal, attach an interactive TUI
opencode attach http://10.20.30.40:4096

# Or attach a non-interactive run directly
opencode run --attach http://localhost:4096 "Explain async/await"
```

### Model selection and dispatch discipline

OpenCode resolves the active model at startup in this order:

1. CLI `--model` / `-m` (`provider_id/model_id`).
2. The `model` key in `opencode.json` / `opencode.jsonc`.
3. The last used session model.
4. The first model from OpenCode's internal priority.

For automation, set `--model` explicitly unless the whole point is to exercise the configured default. If the run depends on reasoning effort or output style, set `--variant` (or configure per-model variants) rather than relying on a provider's implicit default. `opencode.json` carries per-model provider options (e.g. `reasoningEffort`, `thinking.budgetTokens`, `textVerbosity`) without duplicating entries. Use `small_model` only for lightweight helper tasks such as title generation — do not infer that the main task used the cheap helper just because a helper model exists.

Before dispatching:

- Run `opencode models [provider] --refresh --verbose` when model availability, price, context, or provider metadata matters.
- Treat public docs and endpoints as discovery inputs, not proof that the local account/CLI can dispatch the model.
- Run a tiny smoke probe before a long unattended job, especially for free, preview, local, or newly added providers.
- Record the exact `provider/model`, variant, OpenCode version, and provider path when the result must be audited later.

### Config-source precedence (HARD — automation depends on it)

The effective config is a *merge* of multiple sources; later sources override earlier ones on key conflict, while non-conflicting settings are preserved. The documented 8-layer order (lowest to highest — verify against the live [Config](https://opencode.ai/docs/config/) docs):

1. **Remote config** — `.well-known/opencode` (organizational defaults, auto-fetched on auth)
2. **Global config** — `~/.config/opencode/opencode.json` (user preferences)
3. **Custom config** — the file pointed at by `OPENCODE_CONFIG`
4. **Project config** — `opencode.json` / `.jsonc` found by walking up to the git worktree
5. **`.opencode/` directories** — agents, commands, modes, plugins, skills, tools, themes
6. **Inline config** — `OPENCODE_CONFIG_CONTENT` (runtime override)
7. **Managed config files** — `/Library/Application Support/opencode/` (macOS), `/etc/opencode/` (Linux), `%ProgramData%\opencode` (Windows); admin-written, not user-overridable
8. **macOS managed preferences (MDM)** — `ai.opencode.managed` via `.mobileconfig`; highest priority, enforced

JSONC (comments) is supported, with schema validation via the `$schema` key (`https://opencode.ai/config.json`) and variable substitution: `{env:VAR_NAME}` for env vars and `{file:path}` for file contents (useful for secrets and shared snippets). The practical consequences for automation: (a) a CI runner and a developer can share a base global config and override per-repo; (b) `OPENCODE_CONFIG` lets a script pin an exact config file independent of cwd; (c) a managed/MDM policy can override anything a script sets, so in a controlled/enterprise environment run `opencode debug config` to confirm no higher-precedence layer is silently winning before debugging "my flag didn't take."

### Parsing `--format json` in automation

`--format json` emits **JSONL** — one JSON object per line on stdout, each with a `type` field naming the event (tool calls, message parts/`text`/`text-delta`, `step_start`/`step_finish`, reasoning, etc.). Consume it as a stream (read line by line), not as one JSON document.

For robust automation:

- Reconstruct assistant text by concatenating `text` / `text-delta` parts in stream order. Do not treat the last line alone as the canonical answer.
- **Known gotcha (verify against the live version):** a `run` can finish and exit **before** emitting the final `step_finish` event to stdout, even though the session record contains the finish data (tokens, cost). Treat **process exit** as the terminal signal; do not block forever waiting for `step_finish`. (Tracked upstream — see References.)
- If no text parts appear, handle that as an honest no-output/tool-only turn unless stderr or a non-event line reports a CLI error.
- Pull token/cost usage from the recorded session surface (`opencode stats`, `opencode export <sessionID>`, server/session API) rather than expecting complete usage on the final event line.
- Save the session ID, model, variant, OpenCode version, and raw event stream when the run must be auditable.

## Runtime controls that change the decision

OpenCode is a stronger fit when the task needs runtime-level control, not only provider breadth.

**Permissions vs policies (distinct mechanisms):** `permission` config gates *tool actions* — `allow` / `ask` / `deny`, with granular bash/edit/external-directory glob rules. `experimental.policies` gates *provider/resource access* (which LLM providers may be used). Prefer policies over older provider allow/block lists when controlling provider access; prefer `ask`/`deny` for edit/bash on planning, review, or unfamiliar-repo work. Keep the distinction clear: permissions control tools (bash, edit, webfetch, skill); policies control resources (providers).

**Native extension layers (harness, model-independent):** OpenCode discovers Agent Skills (`SKILL.md`) from `.opencode/skills/`, `~/.config/opencode/skills/`, and — for cross-tool compatibility — `.claude/skills/` and `.agents/skills/`, walking up to the git worktree for project-local paths. Project instructions come from `AGENTS.md` (the native file), falling back to `CLAUDE.md` for Claude-Code compatibility. It also exposes `opencode mcp` (MCP server connections), `opencode plugin` (harness plugins), `opencode github` (GitHub integration), references (local dirs or Git repos surfaced to the agent with descriptions), and custom commands (`.opencode/commands/*.md`, which can bind agent/model choices). These are reasons the *harness* can be the right choice independent of the model, and they correct the misconception that skill-injection is a single-vendor-CLI–only feature. **Pure-runtime control:** set `OPENCODE_DISABLE_CLAUDE_CODE=1` (and the finer `OPENCODE_DISABLE_CLAUDE_CODE_PROMPT` / `OPENCODE_DISABLE_CLAUDE_CODE_SKILLS`; verify the exact vars against the live [Config](https://opencode.ai/docs/config/) docs) to suppress the `.claude` cross-tool fallback when you want OpenCode-native discovery only — useful where stray `.claude` files would otherwise pollute a controlled run.

**TUI surface:** the interactive TUI supports `@` file/reference context, `!` shell results, multiple concurrent sessions (SQLite-persisted), undo/redo snapshots, plan mode (read-only, `Tab`-toggle), automatic context compaction (e.g. near the context limit; disable with `OPENCODE_DISABLE_AUTOCOMPACT`), and slash commands — `/models`, `/sessions`, `/compact`, `/share`, `/theme`, `/init`, `/thinking`, `/details`, `/export`, `/connect`, `/help`. Manual compaction (`/compact` / `/summarize`) and `compaction.auto` / `compaction.prune` config change what context the model actually saw — for long automations, record whether compaction/pruning was enabled.

**Server auth (HARD):** an `opencode serve` (or `opencode web`) instance is unauthenticated by default. Anything network-reachable (beyond `localhost`, or `localhost` on a shared host) must be protected — set `OPENCODE_SERVER_PASSWORD` to enable HTTP basic auth (username defaults to `opencode`; override with `OPENCODE_SERVER_USERNAME`, or pass `--username`/`--password` on `run`). Treat an exposed unprotected server as a remote-code-execution surface, since the agent can run tools; set deliberate CORS when exposing beyond localhost.

**Lifecycle commands:** treat `session`, `stats`, `export`, `import`, `debug`, `db`, `upgrade`, `uninstall`, `plugin`, `github`, and `pr` as operational surfaces, not model-selection tools. They matter when the task is to audit usage, move/share session data, troubleshoot config/DB state, manage plugins/MCP/GitHub integration, update the binary, or start work from a pull request.

**Environment variables (30+ documented — verify live):**

| Variable | Effect |
|---|---|
| `OPENCODE_CONFIG` / `OPENCODE_CONFIG_CONTENT` / `OPENCODE_CONFIG_DIR` | Path to config file / inline JSON config / config directory |
| `OPENCODE_SERVER_PASSWORD` / `OPENCODE_SERVER_USERNAME` | Basic auth for `serve`/`web` |
| `OPENCODE_PERMISSION` | Inlined JSON permissions config |
| `OPENCODE_DISABLE_CLAUDE_CODE` (+ `_PROMPT` / `_SKILLS`) | Suppress `.claude` cross-tool fallback (prompt and/or skills) |
| `OPENCODE_DISABLE_AUTOCOMPACT` / `OPENCODE_DISABLE_PRUNE` | Disable automatic compaction / data pruning |
| `OPENCODE_DISABLE_AUTOUPDATE` / `OPENCODE_DISABLE_DEFAULT_PLUGINS` | Disable auto-update checks / default plugins |
| `OPENCODE_DISABLE_LSP_DOWNLOAD` / `OPENCODE_DISABLE_MODELS_FETCH` | Disable LSP server downloads / remote model fetch |
| `OPENCODE_EXPERIMENTAL*` (plan mode, background subagents, parallel, models) | Opt into experimental features |

### OpenCode Zen and OpenCode Go

**Zen** is a curated provider/gateway (tested, optimized coding models served by OpenCode itself), **not** the OpenCode runtime — it is optional, behaves like any other provider, and exposes both paid per-1M-token models and limited-time free/trial models. Endpoint shape: `opencode/<model-id>` (e.g. `opencode/minimax-m3-free`), API at `https://opencode.ai/zen/v1/`. Team workspaces add admin/member roles, per-member/per-workspace spend limits, model-access control, and BYOK (bring your own OpenAI/Anthropic key while still reaching other Zen models). Frame Zen as *tested/recommended*, not as a *quality guarantee* for OpenCode runs.

**OpenCode Go** is a separate optional subscription lane for open coding models (public docs describe ~$5 first month then ~$10/month, with usage limits denominated in dollar value rather than request count). Use Go when subscription access to a curated open-model set is the economic reason; use Zen when you want a tested coding-agent model path without managing every provider separately. Treat Go's price, roster, and limit table as live economic data — verify before using Go as the reason to choose OpenCode.

**Zen discipline (HARD):**

- The free/trial roster is **promotional and rotates** — do **not** hardcode it. Treat any specific free-model list as a dated snapshot and confirm with the current Zen docs plus `opencode models opencode --refresh --verbose`. Endpoint-visible model IDs are candidates only; dispatch evidence comes from the local CLI-visible roster plus a smoke probe. (The current dated roster lives in `references/model-facts.md`, which should be refreshed each pass.)
- Zen is **not a blanket zero-retention guarantee.** Paid models are zero-retention by default, but there are named exceptions: free/trial models may collect data for model improvement / security logging, and OpenAI and Anthropic provider APIs retain requests (per their policies, ~30 days). Do not send confidential data to a free/trial model unless the exact selected model's current policy clears it.
- Attribute cost to the selected Zen model, Go subscription/limit bucket, or other provider — **not** to "OpenCode."
- Route "which free model is best for this task?" to `opencode-free-models`.

## Strengths and weaknesses

**Strengths:** vendor-agnostic routing (75+ providers, no lock-in) as a native design center, not a bolt-on; a real free/cheap lane via OpenCode Zen plus an optional Go subscription lane; local-model support; open source; first-class non-interactive mode with a JSONL event stream for automation; multiple runtime surfaces (TUI, non-interactive CLI, IDE bridge via ACP, desktop beta, web UI, headless server) over one harness; client-server architecture so sessions/work can survive disconnects and warm servers avoid cold starts; LSP-backed code intelligence and built-in build/plan agents that add value independent of the model; native extension layers (Agent Skills discovered from `.opencode`/`.claude`/`.agents`, MCP servers, plugins, GitHub integration, references, commands); permissions and provider policies for harness-level guardrails; session/usage lifecycle commands; one config (with an 8-layer precedence chain) for many engines.

**Weaknesses:** quality, cost, context window, and privacy remain model/provider/account facts — the runtime guarantees none of them; the Zen free roster is promotional and rotates (do not hardcode it); Go pricing/limits/roster can change; Zen is not a blanket zero-retention guarantee (free/trial and OpenAI/Anthropic exceptions apply); trial/free models warn against sending confidential data; an `opencode serve`/`web` instance is unauthenticated unless you set `OPENCODE_SERVER_PASSWORD`, so a careless network exposure is a real risk; the desktop app is still beta; local CLI version and docs can drift, so check `opencode --version`; compaction/pruning can change what context the model actually saw; permissions are powerful enough to be unsafe if left broad and `--dangerously-skip-permissions` removes the guardrail entirely; the large surface area (≈18 CLI commands, 30+ env vars, 8-layer config) is a non-trivial learning investment; it lacks *some* single-vendor CLIs' deepest ecosystem features (e.g. a specific vendor's sandbox model) — though it does have native Agent Skills, so "no skill-injection lane" is no longer true; and the multi-provider edge has narrowed as single-vendor CLIs added base-URL overrides and community routers, so for a one-vendor workflow a single-vendor CLI can be simpler. Choosing OpenCode does not absolve you of choosing the model wisely.

## How it differs from Claude Code / Codex

| | OpenCode | Claude Code | Codex |
|---|---|---|---|
| Vendor | Provider-agnostic (75+ via AI SDK / Models.dev) | Anthropic-centered | OpenAI-centered |
| Free model lane | Yes (Zen free tier, promotional) | No (subscription) | No |
| Non-interactive | `opencode run`; also `serve`/`web` APIs | `claude -p` | `codex exec` |
| Local models | Yes (Ollama, LM Studio, Docker Model Runner) | No | No |
| Source | Open source | Closed | Closed |
| Remote/headless | `serve` + `attach` for remote TUI / CI driver | Limited | Limited |
| IDE bridge | ACP (Agent Client Protocol) | Vendor-specific | Vendor-specific |

(Single-vendor CLIs can now be pointed at third-party models via base-URL overrides or community routers — a bolt-on, where provider-agnosticism is OpenCode's design center. Verify the current state per CLI.)

## Verification

Use this checklist to confirm an OpenCode runtime decision was made correctly.

- [ ] The runtime choice was made on harness needs (multi-provider, free lane, local, scriptable, LSP code intelligence, permissions/policies, the right surface — terminal/IDE/web/server), not on an assumed model quality
- [ ] The OpenCode version was checked (`opencode --version`) when relying on recent flags, policies, skills, references, or desktop/IDE behavior
- [ ] The right surface was chosen for the usage: `opencode run` for scripting, `opencode acp` for editor-embedded, `opencode serve`/`web` + `--attach` for a long-running/CI driver, the TUI for interactive dev
- [ ] The model was chosen separately via an explicit `provider/model` string (and `--variant` when reasoning effort matters) — not left to whatever default resolved
- [ ] Config precedence was checked with `opencode debug config` when a default model, provider, permission, policy, server, command, agent, or reference setting is surprising
- [ ] For long sessions, the compaction/pruning behavior (`/compact`, `compaction.auto`, `compaction.prune`) is known because it affects retained context
- [ ] For automation, `opencode run` (not the TUI) is used, with `--format json` parsed as a JSONL stream (line by line) and **process exit** — not a final `step_finish` line — treated as the terminal signal; usage is pulled from the recorded session
- [ ] The selected `provider/model` was confirmed to exist via `opencode models [provider] --refresh --verbose` rather than guessed; a smoke probe ran before a long unattended job
- [ ] If a warm server, web UI, or ACP endpoint is reachable beyond `localhost`, it is protected with `OPENCODE_SERVER_PASSWORD` (it is unauthenticated by default)
- [ ] Permission and provider-policy config matches the task risk; broad allow rules and `--dangerously-skip-permissions` are not used on sensitive work; agent permissions are deny-by-default
- [ ] If native skills, commands, references, or agents are part of the decision, their discovery path and scope are verified
- [ ] If a free/trial Zen model or OpenCode Go model is used, the roster, pricing/subscription limits, and per-model data policy are confirmed live, and no confidential data is sent unless the exact model's current policy permits it
- [ ] No claim of run quality, cost, context, or privacy is attributed to "OpenCode" itself — each is attributed to the routed provider/model, variant, and data path

## Do NOT Use When

| Instead of `opencode` | Use | Why |
|---|---|---|
| Picking which free/cheap model fits a specific task | `opencode-free-models` | Model-to-work routing is its own decision; this skill owns the runtime, not the per-task model choice |
| Writing the autonomous agent loop / retry / claim logic | `autonomous-loop-patterns` | That is loop authoring; OpenCode just executes whatever loop you build |
| Reasoning about GitHub Copilot premium-request / AI-credit cost | `github-copilot` | Copilot has a distinct, IDE-native economics model |
| The correct runtime is already chosen and known | Run it directly | No routing decision remains |

## References

- `references/model-facts.md` — current OpenCode CLI flags, model precedence, the `--format json` JSONL event stream and exit-before-`step_finish` gotcha, the runtime surfaces (TUI, `opencode run`, `opencode acp` IDE bridge, desktop beta, `opencode web`, `opencode serve`), the built-in agents and LSP integration, the client-server (`serve`/`--attach`) model with the `OPENCODE_SERVER_PASSWORD` auth requirement, the 8-layer config precedence, the native Agent Skills discovery paths (and `OPENCODE_DISABLE_CLAUDE_CODE`), the `opencode mcp`/`plugin`/`github` extension subcommands, and the OpenCode Zen + Go roster/pricing with sources. **The roster/pricing is a dated snapshot — confirm live; it rotates.**
- OpenCode docs (confirm against the live version — OpenCode moves fast): [Intro](https://opencode.ai/docs/), [CLI](https://opencode.ai/docs/cli/) (commands + flags + `--format json`), [Config](https://opencode.ai/docs/config/) (8-layer merge precedence, JSONC, variable substitution, `OPENCODE_DISABLE_CLAUDE_CODE`), [Models](https://opencode.ai/docs/models/), [Providers](https://opencode.ai/docs/providers/), [Zen](https://opencode.ai/docs/zen/) (roster, pricing, privacy exceptions), [Go](https://opencode.ai/docs/go/), [Agents](https://opencode.ai/docs/agents/), [Skills](https://opencode.ai/docs/skills/), [Permissions](https://opencode.ai/docs/permissions/), [Policies](https://opencode.ai/docs/policies/), [Commands](https://opencode.ai/docs/commands/), [References](https://opencode.ai/docs/references/), [Server](https://opencode.ai/docs/server/), [ACP](https://opencode.ai/docs/acp/), [GitHub](https://opencode.ai/docs/github/), [MCP Servers](https://opencode.ai/docs/mcp-servers/), [TUI](https://opencode.ai/docs/tui/).
- Source repository: `https://github.com/sst/opencode` (TypeScript core, MIT). The `--format json` exit-before-`step_finish` behavior is tracked in the project's upstream issues.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `agent-ops` (also: `ai-engineering`)
- Public: `true`
- Domain: `agent/harness`
- Scope: Choosing and operating the OpenCode agent runtime across its surfaces (terminal TUI, non-interactive `opencode run` CLI, IDE bridge via ACP, desktop beta, web UI, headless `opencode serve` server): when OpenCode is the right runtime vs a single-vendor CLI, non-interactive invocation and its flags, the `provider/model` string format and model-selection precedence, model variants, the multi-source config-merge precedence (8 layers, remote → MDM), the built-in build/plan agents and LSP code intelligence, the MCP/plugin/skill/references/commands extension layers, permissions vs provider policies, the OpenCode Zen curated/free model service and the OpenCode Go subscription lane, Zen privacy exceptions, local-model configuration, the full CLI lifecycle command surface (session/stats/export/import/github/pr/plugin/mcp/db/debug/upgrade), and automation patterns (including parsing the `--format json` JSONL event stream). Portable knowledge about a public open-source tool — no project-internal config. Out: choosing which specific free model fits a task (opencode-free-models), authoring the agent/loop logic itself (autonomous-loop-patterns), and GitHub Copilot billing (github-copilot).

**When to use**
- should I run this on OpenCode or Claude Code?
- how do I invoke opencode non-interactively from a script?
- what's the provider/model string format for opencode run?
- can I run OpenCode against a warm server and parse JSON output?
- what's the configuration precedence in opencode.json?
- is OpenCode Go different from Zen pay-as-you-go pricing?

**Not for**
- which free model should I use for this classification job?
- how do I structure the autonomous agent loop itself?
- how many Copilot premium requests will this burn?
- Owned by `opencode-free-models`
- Owned by `github-copilot`

**Related skills**
- Verify with: `opencode-free-models`
- Related: `opencode-free-models`, `github-copilot`, `autonomous-loop-patterns`, `ai-native-development`

**Concept**
- Mental model: A coding-agent runtime is the HARNESS (the loop, tool use, session, permissions, code intelligence); the model is a swappable engine behind a provider/model string, optionally with a variant. A provider-agnostic runtime separates the two cleanly — pick the harness once, switch the engine per task — where single-vendor CLIs are designed around one engine even when they can be coerced toward others. The same harness can be reached through several surfaces (terminal TUI, non-interactive CLI, IDE bridge, desktop app, web UI, headless server) without changing the runtime decision.
- Purpose: It exists so one agent runtime can reach any model — frontier, cheap, free, subscription-backed, or local — through a single configuration, without a separate CLI per vendor and without vendor lock-in, so model choice becomes a per-task routing decision rather than a tooling commitment, while automation, permissions, session handling, and context-loading behavior stay stable.
- Boundary: This owns the RUNTIME: choosing and operating the provider-agnostic harness, its multiple surfaces and non-interactive invocation, the JSONL event stream, the provider/model string and selection precedence, the config-source precedence, the built-in agents and code intelligence, permissions vs provider policies, the MCP/plugin/skill/references/commands extension layers, the curated/free model service and subscription lane, and local-model config. It does NOT own which specific model a task should route to, the agent-loop logic itself, or another tool's premium-credit economics.
- Analogy: It is a universal power-tool body with a swappable bit and a lockable safety guard — the body (harness) stays, you snap in whichever bit (model) the job needs (including the free ones in the case) and set the guard (permissions/policies) for the job, and you can grip the same body by several handles (terminal, IDE, web, server).
- Common misconception: That the runtime's name denotes a model, a quality tier, a privacy guarantee, or a cost tier. It does not — the runtime is just the harness; capability, cost, context window, and data retention come entirely from the provider/model routed to, its variant, and the provider's data path, so naming the runtime says nothing about how capable, expensive, or private a run was.

**Grounding**
- Mode: `hybrid`
- Truth sources: `skills/agent-ops/opencode/references/model-facts.md`

**Keywords**
- `opencode runtime`, `opencode run non-interactive`, `opencode model routing`, `provider/model string`, `opencode zen`, `opencode config precedence`, `opencode vs claude code`, `opencode serve attach`, `opencode CLI automation`, `opencode json output`

<!-- skill-graph-context:end -->
