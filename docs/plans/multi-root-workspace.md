# Multi-Root Workspace Plan

> **Status.** Shipped in v0.4.0 (schema_version 3). This document is the design reference for the workspace config format and the skill-root resolution rules.
> **Audience.** Consumers of Skill Graph who maintain more than one project in a single repo, and contributors extending the generator, router, or drift sentinel.

## Problem

Skill Graph v0.3.0 assumed a single `skills/` directory at the repo root. That worked for a single-project workspace. It broke the moment a developer had more than one project:

- **Codebase-scoped skills** (skills with `scope: codebase` and concrete file paths in `grounding.truth_sources`) cannot live in a central `skills/` folder because their truth sources reference files in a specific project. Moving them to the central folder either invalidates the paths or picks one project over another.
- **Cross-project skills** (GDPR, a11y, react-best-practices) should not be duplicated per project — duplication leads to drift.
- **Project-specific skills** (e.g. `<project-a>-orders`, `<project-b>-seo` — names tied to one project's domain) should not pollute the shared namespace.

The existing single-root design forced authors to either duplicate skills or invent contract-breaking workarounds.

## Design — hybrid layout with a workspace config

v3 adds an optional workspace config at `.skill-graph/config.json` that declares multiple skill roots. When the config is present, the generator walks every declared root and unions the result into one manifest. Each skill entry carries a `project` field identifying which root it came from.

### Directory layout

```
workspace/
  .skill-graph/
    config.json                  # workspace definition
  skills/                        # shared / ambient skills (scope: portable | reference)
    gdpr/SKILL.md
    a11y/SKILL.md
    react-best-practices/SKILL.md
  <project-a>/                   # project 1 (placeholder name — adopters use their own)
    .skill-graph/skills/
      <project-a>-orders/SKILL.md
      <project-a>-billing/SKILL.md
  <project-b>/                   # project 2
    .skill-graph/skills/
      <project-b>-seo/SKILL.md
      <project-b>-keywords/SKILL.md
  shared-skills/                 # optional alternative shared root
      cross-project-onboarding/SKILL.md
```

Three layout styles this design accommodates:

| Layout | Shape | Best for |
|---|---|---|
| **A — single root** | `skills/` at repo root, no config file | One project. Tutorial default. Skill Graph repo itself. |
| **B — per-project only** | `<project>/.skill-graph/skills/` roots, no shared root | Projects with zero shared skills (rare). |
| **C — hybrid** | Shared root + per-project roots | Most multi-project workspaces. Default recommendation. |

### Config format

`.skill-graph/config.json`:

```json
{
  "workspace": {
    "skill_roots": [
      { "path": "skills",                              "project": null },
      { "path": "<project-a>/.skill-graph/skills",     "project": "<project-a>" },
      { "path": "<project-b>/.skill-graph/skills",     "project": "<project-b>" }
    ],
    "projects": {
      "<project-a>":  { "semantic_tags": ["ecommerce", "saas", "b2b"] },
      "<project-b>":  { "semantic_tags": ["ecommerce", "b2c"] }
    }
  }
}
```

(`<project-a>` and `<project-b>` are placeholder handles — adopters use whatever kebab-case names they choose for their projects.)

**Fields:**

- `workspace.skill_roots` (required): ordered list of skill root directories. Each entry declares:
  - `path`: repo-relative directory to walk. The generator expects each subdirectory under the path to contain a `SKILL.md`.
  - `project`: literal project handle stamped onto every skill loaded from this root. `null` means "shared / ambient" — skills loaded without a project owner.
- `workspace.projects` (optional): map of literal project handle → `{ semantic_tags: string[] }`. The router expands the active project into this semantic set before matching skills' `project_tags`.

### Single-root fallback

When `.skill-graph/config.json` is absent, the generator falls back to the default single-root mode: walk `skills/`, stamp no project. This keeps v2-era consumers and the Skill Graph repo itself working unchanged.

## Resolution rules

### Skill discovery

1. Generator loads the workspace config (or falls back to `[{ path: "skills", project: null }]`).
2. For each root, walks direct children. Each child directory with a `SKILL.md` becomes a skill.
3. The same skill path cannot be loaded twice — the first root to claim a path wins. Roots are processed in declaration order.
4. Skill `id` is the directory name; `project` is the root's declared project (or absent if null).
5. Manifest output adds a top-level `workspace` block echoing the config so downstream consumers don't need to re-read it.

### Router project matching

When a consumer calls `skill-graph route <query> --project <handle>`, the router:

1. Reads `manifest.workspace.projects[<handle>].semantic_tags` to expand the project handle into a set of matchable tags.
2. For each skill:
   - If `project_tags` is absent → skill is ambient, matches.
   - If `project_tags` contains the literal project handle → matches.
   - If `project_tags` contains any of the project's expanded semantic tags → matches.
   - Otherwise → excluded with reason `project_tags [...] exclude project "<handle>"`.

### Drift sentinel scope

`skill-graph drift` walks the same skill roots as the generator. When run without arguments, it checks every skill in every root. When run with an explicit skill directory, it checks only that skill.

## Scope placement rules

| Skill scope | Preferred root |
|---|---|
| `scope: portable` | Shared root (`skills/`). The skill makes no repo-specific claims, so it lives outside any project. |
| `scope: reference` | Shared root. Documentation-style skill anchored to a contract document. |
| `scope: codebase` | Project root (`<project>/.skill-graph/skills/`). The skill's `grounding.truth_sources` reference files inside that project. Placing it in the shared root creates paths that resolve relative to the repo root and break when the project moves. |

Lint warns when a skill's placement contradicts its scope (shared root with `scope: codebase`, or project root with `scope: portable`). The warning is advisory — in some unusual cases the placement is correct and the scope declaration is wrong.

## Migration path from single-root

For an existing v2/v3 single-root repo that wants to adopt multi-root:

1. Create `.skill-graph/config.json` with the current `skills/` directory as the first root:
   ```json
   {
     "workspace": {
       "skill_roots": [{ "path": "skills", "project": null }]
     }
   }
   ```
2. Run `node scripts/generate-manifest.js` and confirm the manifest is identical to before (plus the new top-level `workspace` block).
3. Add per-project roots one at a time, moving `scope: codebase` skills into them.
4. Add `project_tags` to skills that should be filtered by project; leave ambient skills untouched.
5. For large libraries, also add hierarchical `category` values to the moved skills — a tree helps readers find skills in a workspace with dozens of per-project skills.

## Non-goals

- **No cross-workspace linking.** The manifest only unions skills within one repo. Pulling skills from a sibling repo is out of scope (and is SKILL.md' job via export).
- **No runtime skill-root mounting.** The set of skill roots is read at manifest generation time. A consumer cannot add a root at query time.
- **No glob-based skill-root declarations.** Each root is a literal directory path. Glob patterns in the config file are a footgun and are not supported.

## Reference

- `scripts/generate-manifest.js` — workspace config loader and multi-root walker.
- `scripts/skill-graph-route.js` — project-aware filter using semantic-tag expansion.
- `scripts/skill-graph-drift.js` — walks all workspace roots in default mode.
- `docs/field-reference.md § project_tags` — authored-side semantics.
- `docs/field-decision-guide.md § 4. How do I tag a skill for multiple projects?` — decision tables.
- `schemas/manifest.schema.json § workspace` — machine-enforceable config shape in the manifest.
