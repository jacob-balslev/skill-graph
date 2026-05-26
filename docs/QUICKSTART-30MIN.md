# 30-Minute Quickstart for Project Developers

> **Audience.** A working developer with at least one painful skill — wrong-skill activation on an ambiguous prompt, or a `SKILL.md` quoting a file that no longer exists, or skills that should be project-scoped but live in a shared folder. You have ~30 minutes and a Node 20+ environment.
>
> **What you'll do.** Adopt Skill Graph for one painful workflow — author a `markdown-post-frontmatter-review` skill grounded in real repository files, add a second skill that depends on it, watch the lint catch a broken relation, route a real query, and record a drift baseline so the skill warns you when its truth source moves.
>
> **What you won't do.** Migrate your whole library yet. Pilot on one skill first; the rest follows after you've felt the contract pay off once.

| Minute | Step | What you'll learn |
|---|---|---|
| M0–M2 | Clone the repo and install | The repo runs with zero external dependencies |
| M3–M7 | Copy the template into your first skill directory | The authoring flow is copy → rename → adapt → strip → verify |
| M8–M11 | Fill in the required v7 fields + v8 axes for `markdown-post-frontmatter-review` | Why each field exists and what it commits you to |
| M12–M15 | Lint your first skill | Lint output is the primary debugging surface |
| M16–M19 | Create a second skill (`post-archive-rebuild`) with a `relations.depends_on` link | The graph is real — relations enforce that `depends_on` targets exist |
| M20–M24 | Break the relation deliberately and watch lint catch it | The contract fails loud, not silent |
| M25–M29 | Route a real query and read the routing trace | Why each skill was SELECTED, CO-LOADED, or EXCLUDED |
| M30 | Record the drift baseline | The skill now knows when its truth source moved |

This walkthrough uses a markdown static-site project as the running example — content under `content/posts/**/*.md`, a build-time validator at `lib/content/parse-frontmatter.ts`, a content schema at `lib/content/schema.ts`. Substitute paths from your own project as you go.

---

## M0–M2: Clone and install

```bash
git clone https://github.com/<your-org>/skill-graph my-skill-library
cd my-skill-library
node --version
```

Expected output:

```
v20.17.0
```

That's it for local clone setup. Skill Graph has zero runtime dependencies — every reference script uses only Node built-ins, so no `npm install` step is required to run the tools from a clone. `package.json` exists for the installable CLI, release packaging, and CI entry points.

---

## M3–M7: Copy the template into `markdown-post-frontmatter-review`

```bash
mkdir -p skills/markdown-post-frontmatter-review
cp examples/skill-metadata-template.md skills/markdown-post-frontmatter-review/SKILL.md
ls skills/markdown-post-frontmatter-review/
```

Expected output:

```
SKILL.md
```

Open `skills/markdown-post-frontmatter-review/SKILL.md` in your editor. The template is a *real, valid, schema-conformant* Skill Metadata Protocol skill whose subject is skill authoring itself. You'll adapt it by:

1. Renaming the identity (`name`, `description`, `version`)
2. Rewriting `## Coverage`, `## Philosophy`, `## Verification`, `## Do NOT Use When` for your subject
3. Stripping every `# TEMPLATE NOTE:` YAML comment and `> **TEMPLATE NOTE:**` blockquote — they are authoring scaffolding, never skill content

The template lints clean as-is, so you can incrementally edit and re-lint to catch mistakes early.

---

## M8–M11: Fill in the required fields (v8 5-axis classification)

The required v8 fields are: `schema_version`, `name`, `description`, `version`, `subject` (9-enum), `operation` (4-enum, Bloom-grounded), `scope` (`portable`/`workspace`/`project`), `owner`, `freshness`, `drift_check`, `eval_artifacts`, `eval_state`, `routing_eval`. **The v7 classification fields (`type`, `category`, `categories`, `primaryCategory`, `layerPrimary`, `routingRole`) are DEPRECATED** — schema accepts them as optional back-compat properties but new skills do not author them (the v7→v8 phase ended 2026-05-26; schema-level removal tracked in SH-6557). See [`SKILL_METADATA_PROTOCOL.md` § Schema contract](../SKILL_METADATA_PROTOCOL.md#schema-contract-v7v8-phase-ended-2026-05-26). The template has all current fields — you're replacing values, not adding fields.

For `markdown-post-frontmatter-review`, the values look like:

```yaml
schema_version: 8
name: markdown-post-frontmatter-review
description: "Use when authoring or reviewing the YAML frontmatter of a markdown post — checking required fields (title, date, slug, tags), validating against the content schema, catching ambiguous date formats, and ensuring the slug matches the file path. Activate this skill whenever the task touches files under `content/posts/**/*.md` or the `parsePostFrontmatter()` helper — even if the user just says 'the post'. Do NOT use for general YAML schema design (use a different skill) or for chasing a specific build-time validation failure (use debugging)."
version: 0.1.0

# v8 5-axis classification (required)
subject: code-engineering
operation: decide
scope: project

# v8 axes (additionally required when schema_version: 8; safe to author on v7 too)
subject: code-engineering   # one of the 9-enum v8 subjects
operation: do               # one of: know | do | decide | modify

owner: <your-handle-or-team>
freshness: "2026-05-06"
drift_check:
  last_verified: "2026-05-06"
eval_artifacts: none
eval_state: unverified
routing_eval: absent
```

For `scope: project` (or legacy `scope: codebase`) you also need a `grounding` block — point it at the real content schema and template post in your repo:

```yaml
grounding:
  domain_object: "Markdown post frontmatter — the YAML block at the top of every content file that drives the site's index, routing, and rendering"
  grounding_mode: repo_specific
  truth_sources:
    - content/posts/_template.md
    - lib/content/schema.ts
    - lib/content/parse-frontmatter.ts
  failure_modes:
    - missing_required_title_field
    - ambiguous_date_format_no_timezone
    - tag_not_in_controlled_vocabulary
    - slug_mismatch_with_file_path
  evidence_priority: repo_code_first
```

Adjust the `truth_sources` paths to match your actual content schema and template files. Strip every `# TEMPLATE NOTE:` and `> **TEMPLATE NOTE:**` blockquote before the next step.

---

## M12–M15: Lint your first skill

```bash
node scripts/skill-lint.js skills/markdown-post-frontmatter-review
```

If everything is correct:

```
OK   [T1↔T3]     schemas/ (cross-schema parity)
OK   [T5 sample] examples/skills.manifest.sample.json
OK   [T3↔T5]     examples/skills.manifest.sample.json (generator parity)
OK   [T5 evals]  examples/evals/ (truth_source ranges)
OK   [T5]        skills/markdown-post-frontmatter-review/SKILL.md

1 file(s) checked, 0 error(s).
```

If a required field is missing, the failure looks like:

```
FAIL skills/markdown-post-frontmatter-review/SKILL.md
  ─ schema: must have required property 'category'

1 file(s) checked, 1 error(s).
```

The lint is opinionated and verbose by design — it tells you the file, the rule, the field, and the fix. It is the primary debugging surface for authoring.

---

## M16–M19: Create a second skill with a `depends_on` link

Most pain in skill libraries comes from skills that *depend on* each other but don't say so. Let's add `post-archive-rebuild` (a workflow skill that re-indexes the post archive when frontmatter changes) and have it declare `depends_on: markdown-post-frontmatter-review` — the rebuild can't proceed if the frontmatter primitive isn't authored.

```bash
mkdir -p skills/post-archive-rebuild
cp examples/skill-metadata-template.md skills/post-archive-rebuild/SKILL.md
```

Edit `skills/post-archive-rebuild/SKILL.md` to set:

```yaml
schema_version: 8
name: post-archive-rebuild
description: "Use when re-indexing the post archive after one or more frontmatter fields have changed — walking every post, re-extracting the indexed fields, and writing the updated archive page. Activate this skill whenever the task says 'rebuild the archive' or mentions a post-index regeneration after a content edit. Do NOT use for routine authoring of a single post (use markdown-post-frontmatter-review)."
version: 0.1.0

# v8 5-axis classification (required)
subject: code-engineering
operation: do
scope: portable

# v8 axes (dual-author per Migration state)
subject: code-engineering
operation: do

owner: <your-handle>
freshness: "2026-05-06"
drift_check:
  last_verified: "2026-05-06"
eval_artifacts: none
eval_state: unverified
routing_eval: absent
relations:
  depends_on:
    - skill: markdown-post-frontmatter-review
      min_version: "^0.1.0"
```

Body: include the required `## Workflow` section (workflow archetype mandates it), plus `## Coverage`, `## Philosophy`, `## Verification`, `## Do NOT Use When`.

Lint:

```bash
node scripts/skill-lint.js skills/post-archive-rebuild
```

Expected:

```
OK   [T5]        skills/post-archive-rebuild/SKILL.md

1 file(s) checked, 0 error(s).
```

---

## M20–M24: Break the relation and watch lint catch it

In `skills/post-archive-rebuild/SKILL.md`, change the `depends_on` target from `markdown-post-frontmatter-review` to a name that doesn't exist:

```yaml
relations:
  depends_on:
    - skill: markdown-post-frontmatter-review-typo
      min_version: "^0.1.0"
```

Re-lint:

```bash
node scripts/skill-lint.js skills/post-archive-rebuild
```

Expected:

```
FAIL skills/post-archive-rebuild/SKILL.md
  ─ relations.depends_on: "markdown-post-frontmatter-review-typo" does not match any known skill in skills/

1 file(s) checked, 1 error(s).
```

The lint walks every relation predicate (`depends_on`, `verify_with`, `boundary`, `adjacent`, `disjoint_with`) and verifies that every named target resolves to a real sibling skill in `skills/`. This is the contract that catches the most-painful failure mode in real libraries: a skill that *claims* it depends on another, but the other was renamed/deleted/never-shipped, and nothing surfaces the broken edge until an agent tries to load the relation chain at runtime.

Restore the correct name:

```yaml
relations:
  depends_on:
    - skill: markdown-post-frontmatter-review
      min_version: "^0.1.0"
```

Re-lint and confirm `0 error(s)`.

---

## M25–M29: Route a real query

```bash
node scripts/skill-graph-route.js "review my post's frontmatter for the controlled-vocabulary tag check"
```

Expected (your output will list whatever skills exist in your library):

```
Query: "review my post's frontmatter for the controlled-vocabulary tag check"

SELECTED
  Skill                              Score  State        Reason
  ──────────────────────────────────────────────────────────────────────────────
  markdown-post-frontmatter-review   7      unverified   keyword:frontmatter, keyword:controlled-vocabulary, keyword:tag

CO-LOADED
  Skill                              State        Reason
  ──────────────────────────────────────────────────────────────────────────────
  post-archive-rebuild               unverified   depends_on: post-archive-rebuild depends on this skill

1 selected, 1 co-loaded, 0 excluded. 0 stale.
```

Read the trace as evidence:

- **SELECTED** — the router picked `markdown-post-frontmatter-review` because three keyword tokens matched. You can see exactly *which* keywords matched, so if the wrong skill activates you can fix the keyword list rather than guess.
- **CO-LOADED** — `post-archive-rebuild` is loaded alongside because it `depends_on: markdown-post-frontmatter-review`. The router respects the graph automatically — you don't have to ask for the dependency.
- **EXCLUDED** — would appear if any skill named `markdown-post-frontmatter-review` in its `relations.boundary` (anti-routing). Empty here because no boundary fires.

---

## M30: Record the drift baseline

`markdown-post-frontmatter-review` is grounded in three truth sources (the template post, the schema, the parser). If any of those files change, the skill might be silently lying. Record the baseline so the drift sentinel can warn you:

```bash
node scripts/skill-graph-drift.js --record --apply skills/markdown-post-frontmatter-review
```

Expected:

```
Recorded baseline for markdown-post-frontmatter-review:
  content/posts/_template.md: <sha256...>
  lib/content/schema.ts: <sha256...>
  lib/content/parse-frontmatter.ts: <sha256...>

Updated skills/markdown-post-frontmatter-review/SKILL.md frontmatter: drift_check.truth_source_hashes
```

Run the drift check:

```bash
node scripts/skill-graph-drift.js
```

Expected:

```
41 skill(s): 3 CLEAN, 38 UNGROUNDED
```

(`UNGROUNDED` = skills with no `grounding` block; that's normal for `scope: portable` and `scope: reference` skills.)

Now edit `lib/content/schema.ts` (any change — add a comment) and re-run drift:

```bash
node scripts/skill-graph-drift.js
```

Expected:

```
DRIFT         markdown-post-frontmatter-review
  DRIFT         lib/content/schema.ts

41 skill(s): 1 DRIFT, 2 CLEAN, 38 UNGROUNDED
```

The skill now warns you that the truth source moved. Re-verify the skill against the changed file (does the `## Verification` checklist still pass?), then re-record the baseline once you've confirmed:

```bash
node scripts/skill-graph-drift.js --record --apply skills/markdown-post-frontmatter-review
```

---

## Where to go from here

You've adopted Skill Graph for one painful workflow. The contract paid off twice in 30 minutes — caught a broken relation at lint time and surfaced a stale truth source at drift-check time.

| Next step | Read |
|---|---|
| Migrate your second skill | This document, repeated for the next skill |
| Understand the full contract | [`docs/PRIMER.md`](PRIMER.md) and [`docs/skill-metadata-protocol.md`](skill-metadata-protocol.md) |
| See worked examples in a real project | [`examples/projects/markdown-static-site/README.md`](../examples/projects/markdown-static-site/README.md) |
| Set up CI integration | [`docs/integrations/github-actions.md`](integrations/github-actions.md) |
| Decide which skills to author next | [`docs/recommended-skills.md`](recommended-skills.md) |

If a step in this quickstart did not match your local output, file an issue — the lint output is the primary debugging surface and any divergence between the documented expected output and the real output is a bug in the docs or the script, never in your skill.
