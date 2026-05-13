# Positioning — Skill Graph vs Marketplaces, Rules, and Always-On Conventions

> **Audience.** A working developer who has heard of Skill Graph and is mentally placing it on the AI-coding-context shelf alongside Cursor rules, Claude skills, GitHub Copilot custom instructions, AGENTS.md, skillsmp.com, and skills.sh. This document is a single-source reference for how Skill Graph relates to each.
>
> **Status.** Stable. Updated when a new context tool is named in the skill-library landscape (open an issue if a tool is missing).
>
> **Last updated.** 2026-05-06.

**Skill Metadata Protocol's job is project-relevance metadata for AI SKILL.md. Skill Graph's job is library-level operation over that metadata.** The protocol asks: which area is this skill for, which angle does it take, which project or stack does it fit, which taxonomy / semantic cluster does it belong to, which methodology or framework does it encode, and how should it be tested or reverified? Skill Graph asks how to index, route, cluster, audit, and reverify a library of skills that expose those declarations. Every comparison below is framed against that split.

## Categories on the shelf

There are five categories of AI-coding context tool, and they solve different problems:

| Category | Examples | What it does |
|---|---|---|
| **Open standard for skill packaging** | [Anthropic SKILL.md](https://www.claude.com/skills) | The base format for procedural-knowledge folders an agent can discover and load |
| **Project-relevance metadata protocol on top of the standard** | **Skill Metadata Protocol** | The skill-level contract that makes skills indexable by area, angle, taxonomy, semantics, project fit, methodology, framework, and verification loop |
| **Library-level system over skill metadata** | **Skill Graph** (this repo) | The index, router, cluster map, lint/eval harness, drift sentinel, and manifest pipeline that works with Skill Metadata Protocol records |
| **Public skill libraries / registries** | [skillsmp.com](https://skillsmp.com), [skills.sh](https://skills.sh) | The discovery and installation surface — find a skill, install it |
| **Always-on repo conventions** | CLAUDE.md, AGENTS.md, Cursor rules, Continue rules, GitHub Copilot custom instructions | Per-repo behavior rules the agent reads at session start (always loaded, not on-demand) |

Skill Metadata Protocol sits in the second category. Skill Graph sits in the third row above. Neither competes with SKILL.md (the protocol is interoperable with SKILL.md via the export transform), public libraries (those help you find skills; the protocol makes chosen skills relevant; Skill Graph makes them indexable, clusterable, routable, and testable inside a project), or always-on repo rules (those are repo behavior rules; Skill Graph is skill-library structure).

---

## Pros and cons per neighbor

### Anthropic SKILL.md

[claude.com/skills](https://www.claude.com/skills) — *"Teach Claude your way of working"*, *"Build once, use everywhere"*, *"Stack skills for complex work"*.

| Axis | Anthropic SKILL.md | Skill Metadata Protocol + Skill Graph |
|---|---|---|
| **Required fields** | 2 (`name`, `description`) | 13 in Skill Metadata Protocol; `name` and `description` remain the base bridge to SKILL.md |
| **Relevance model** | Mostly lexical retrieval over `description` and tag fields | Area, angle, taxonomy, semantic relations, project fit, grounding, eval state, and file/path relevance |
| **Drift detection** | None — staleness is invisible to the standard | SHA-256 baselines on `truth_sources`; the drift sentinel reports DRIFT / BROKEN / STALE / NO_BASELINE |
| **Project scoping** | Folder structure or naming hacks | `project_tags` + workspace `semantic_tags` matching, no folder gymnastics |
| **Eval awareness** | Not standardised | `eval_artifacts` + `eval_state` + `routing_eval` triple; routers can gate by quality |
| **Inheritance** | None | `type: overlay` + `extends` for specialisation with schema-level body-section enforcement |
| **Round-trip compatibility** | N/A | One-way export to base SKILL.md via `scripts/export-skill.js`; round-trip back requires re-authoring the lost fields |

**When to use both:** when you want Skill Metadata Protocol metadata for authoring and the broader runtime support of SKILL.md' format simultaneously. Author with the protocol; use Skill Graph for library-level operations; export to SKILL.md shape via `scripts/export-skill.js` for runtimes that read only the simpler format. The two contracts are peers, not parent-child.

**When this is overhead, not benefit:** library size below ~3 skills, single project, no grounded skills, no eval pipeline. Skill Metadata Protocol's richer required field set and Skill Graph's tooling are pure tax until at least one of those pressures appears — plain SKILL.md covers the simple case.

---

### skillsmp.com

[skillsmp.com](https://skillsmp.com) — *"Discover open-source agent skills from GitHub."*

| Axis | skillsmp.com | Skill Metadata Protocol + Skill Graph |
|---|---|---|
| **What it does** | Public agent-skill library / marketplace that indexes skills from GitHub repositories | Skill Metadata Protocol describes imported or local skills; Skill Graph operates over the resulting library |
| **Surface** | Discovery and installation (find a skill to install) | Relevance, structure, clustering, routing, testing, and re-verification inside your project |
| **Hosted** | Yes — independent community-run service | No — the protocol and Skill Graph reference scripts run in your own repo |
| **Per-skill structure** | Whatever the source repo authored | The 13 required + ~20 optional Skill Metadata Protocol fields |

**When to use both:** install a skill from skillsmp.com -> adopt it into your library -> annotate the frontmatter with area, angle, taxonomy, project tags, relations, grounding, and eval metadata -> benefit from lint, routing, clustering, drift checks, and Karpathy-style iteration loops on top of the imported skill. In the other direction, syndicate the full Skill Graph starter library through plain `SKILL.md` exports so SkillsMP can discover the repo while the canonical Skill Metadata Protocol source stays here. The operating plan is [`docs/marketplace-syndication.md`](marketplace-syndication.md).

**Mental model:** *skillsmp answers "what skills exist?"; Skill Metadata Protocol answers "what is this skill relevant for?"; Skill Graph answers "how can that relevance be indexed, routed, clustered, tested, and reverified?"*

---

### skills.sh

[skills.sh](https://skills.sh) — *"The Open SKILL.md Ecosystem."* The hero copy: *"Skills are reusable capabilities for AI agents. Install them with a single command to enhance your agents with access to procedural knowledge."*

Same category as skillsmp.com. Same distinction: discovery / installation surface vs Skill Metadata Protocol plus Skill Graph. The two public libraries differ in their cataloging conventions and ranking surface (skills.sh leads with a popularity leaderboard, skillsmp leads with GitHub-source provenance), but neither tells a local project which area, angle, taxonomy cluster, semantic relation, methodology, framework, or verification loop a skill belongs to.

**When to use both:** install a popular skill from skills.sh -> adopt the imported folder into your library -> upgrade the frontmatter to Skill Graph spec so it becomes relevant, indexable, clusterable, and testable in your project. In the other direction, export and publish the full Skill Graph library to the plain `SKILL.md` shape, use examples only as entry points, and keep provenance metadata pointing back to the canonical repo.

---

### Cursor rules

[cursor.com/docs](https://cursor.com/docs) — `.cursor/rules/*.mdc` files the IDE applies to every Cursor agent action.

| Axis | Cursor rules | Skill Graph |
|---|---|---|
| **What it does** | Repo-behavior guardrails ("always treat this folder as auth-critical", "never modify schemas without a migration") | Skill-library structure (typed relations between many skills, drift detection, eval state) |
| **Loading model** | Always-on for the IDE's agent — every action consumes the rule context | On-demand — the router selects skills per query, only the selected ones load |
| **Granularity** | Behavior constraints | Procedural knowledge packages |
| **Per-runtime** | Cursor IDE specifically | Any agent runtime that supports SKILL.md |

**Take a position:** Cursor rules are repo-behavior guardrails. Skill Graph is skill-library structure. They solve different problems and complement each other in the same repo. A repo can have `.cursor/rules/*.mdc` for IDE-wide behavior rules AND a Skill Graph library at `skills/**` for on-demand skill packaging — these do not compete; they layer.

**When to use both:** always, in a Cursor-using repo with a non-trivial skill library.

---

### Continue rules

`.continue/rules/*` — the [Continue](https://continue.dev) IDE's analog of Cursor rules. Same shape as Cursor: per-repo behavior constraints applied always-on to agent actions.

Same distinction as Cursor: behavior rules vs library structure. Use both.

---

### GitHub Copilot custom instructions

`.github/instructions/*` — per-repo prompt augmentation that ships with every Copilot completion request.

| Axis | Copilot custom instructions | Skill Graph |
|---|---|---|
| **What it does** | Inline prompt content prepended to every Copilot request | Routable, validatable, droppable skill-library contract |
| **Loading model** | Always — every Copilot completion includes the custom instructions | On-demand — only selected skills load |
| **Routing** | None — Copilot does not load skills dynamically | The router selects per query, with auditable reasoning |
| **Token impact** | Constant overhead per completion | Variable (depends on which skills the router picks) |

**The honest constraint:** Copilot does not load skills dynamically — Skill Graph assumes a runtime that does (Claude Code, agent runtimes that read SKILL.md). For Copilot specifically, custom instructions and Skill Graph are complementary: custom instructions for the prompt context Copilot always sees, Skill Graph for the on-demand skills a more capable runtime would route to.

**When to use both:** in a Copilot-primary repo where you also use Claude Code or another Skill-Graph-aware runtime — custom instructions handle the always-on baseline, Skill Graph handles the on-demand depth.

---

### CLAUDE.md and AGENTS.md

Plain-text repo-level conventions that Claude Code or generic agent runtimes read at session start.

| Axis | CLAUDE.md / AGENTS.md | Skill Graph |
|---|---|---|
| **What it does** | Always-on repo context (small, opinionated, ~100-500 lines typically) | On-demand skill packaging (many, structured, routable, ~50-300 lines per skill) |
| **Cardinality** | Usually 1 file per repo (sometimes 2-3 with descendant loading) | Many — usually 10+ skills per library |
| **Update cadence** | Slow (changes when repo conventions shift) | Per-skill (changes when the specific skill's domain or truth source changes) |
| **Loading** | Read once per session | Per query, by the router |

**When to use both:** AGENTS.md for non-negotiable repo rules (security policies, commit conventions, banned patterns); Skill Graph for the skills the agent reaches for when those rules don't cover the specific task. Together they form a two-layer context: always-on rules + on-demand skills.

---

## What Skill Graph deliberately is not

For symmetry with the README's negative framing:

- **Not a marketplace.** Skill Graph does not host or distribute skills. Use skillsmp.com or skills.sh for that.
- **Not a runtime.** Skill Graph can feed agent runtimes; it is not one. Claude Code, custom agent harnesses, or any runtime that reads SKILL.md can consume a Skill Graph library at whatever level of awareness it chooses.
- **Not a prompt library.** The skills' content is your team's procedural knowledge, authored by you; Skill Metadata Protocol structures the relevance metadata around it, not the prose inside it.
- **Not a competing format.** Skill Metadata Protocol enriches SKILL.md and can be exported to base SKILL.md via `scripts/export-skill.js`.
- **Not always-on context.** Skills managed by Skill Graph are loaded on-demand by a router; they are not appended to every agent request the way CLAUDE.md or Copilot custom instructions are.

---

## Decision shortcut

If you're trying to decide which tool to reach for:

| You want to… | Reach for |
|---|---|
| Find a community-authored skill to install | skillsmp.com or skills.sh |
| Author a procedural-knowledge folder for an agent | Anthropic SKILL.md (the base standard) |
| Make a multi-skill library project-relevant, indexable, and testable | **Skill Graph** |
| Apply repo-wide behavior constraints to every IDE agent action | Cursor rules / Continue rules |
| Prepend always-on context to every Copilot completion | Copilot custom instructions |
| Document repo conventions for any agent at session start | CLAUDE.md / AGENTS.md |
| Detect when a skill's truth source has silently moved | **Skill Graph** (drift sentinel) |
| Express that one skill depends on another | **Skill Graph** (`relations.depends_on`) |
| Share some skills across two projects but not all | **Skill Graph** (multi-root workspace mode + `project_tags`) |

If your need is in the **Skill Graph** rows, this contract is for you. If your need is in any other row, the named tool is the right primary fit; Skill Graph still complements it where the use cases overlap.

---

## Source URLs (verified 2026-05-06)

- Anthropic SKILL.md: https://www.claude.com/skills
- Anthropic engineering on Skills: https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills
- Cursor docs: https://cursor.com/docs
- Continue: https://continue.dev
- skillsmp.com: https://skillsmp.com
- skills.sh: https://skills.sh
- SKILL.md open standard: https://agentskills.io/specification

Each was reachable at the time of writing. URL drift is monitored via the sources cited in the README's positioning table.
