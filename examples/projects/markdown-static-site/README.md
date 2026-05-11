# Specimen Project — Multi-Tenant Markdown Static Site

> **Status:** Specimens, not a maintained starter pack.
>
> These five `SKILL.md` files are *illustrative*. They show what the Skill Metadata Protocol contract looks like when applied to a recognizable real-world project (a multi-tenant markdown static site with a build-time image pipeline, a periodic link-rot scan, and a content-source router). They are not production skills — the truth-source paths point at files that exist in a *hypothetical* adopter's project, not in this repository. If you adopt one of these specimens for your own library, copy the `SKILL.md`, replace the truth-source paths with your real ones, and re-record the drift baseline.
>
> The stack is deliberately low-stakes: even if a reader template-copies one of these specimens and gets it slightly wrong, no payment, auth, or tenant-isolation boundary is compromised. The contract features (typed relations, grounding, drift detection, project tagging, archetype discipline) work the same against any stack.

## What this directory demonstrates

The five specimens cover three Skill Graph archetypes (`capability`, `workflow`, `router`) at both relevant scopes (`codebase`, `portable`) and exercise the most-used contract features. The fourth archetype (`overlay`) is covered by the `lint-overlay` starter in the main `skills/` library.

| Specimen | Archetype | Scope | What it uniquely demonstrates |
|---|---|---|---|
| [`markdown-post-frontmatter-validation`](skills/markdown-post-frontmatter-validation/SKILL.md) | `capability` | `codebase` | Codebase-grounded capability with full `grounding` block, hierarchical `category` (`content/markdown/frontmatter`), and pushy `description` activation language |
| [`image-optimization-pipeline-config`](skills/image-optimization-pipeline-config/SKILL.md) | `capability` | `codebase` | Five concrete `failure_modes`, demonstrating the value of enumerable failure categories the eval grader can target (the canonical example of "what does a good `failure_modes` list look like") |
| [`link-rot-detection`](skills/link-rot-detection/SKILL.md) | `capability` | `portable` | The `portable` scope — repo-agnostic knowledge that does NOT need a `grounding` block (compare to the codebase-scoped specimens) |
| [`content-source-router`](skills/content-source-router/SKILL.md) | `router` | `codebase` | The `router` archetype with its required `## Routing Rules` section and the anti-default doctrine surfaced in the body |
| [`migrate-posts-to-v2-frontmatter`](skills/migrate-posts-to-v2-frontmatter/SKILL.md) | `workflow` | `codebase` | The `workflow` archetype with its required `## Workflow` section, plus a `relations.depends_on` declaration |

## The conceptual relationship graph

The five specimens form a graph in concept (read this as a domain map, not as their literal `relations` blocks — see the note below):

```
                        ┌─────────────────────────────────┐
                        │ migrate-posts-to-v2-frontmatter │
                        │ (workflow)                      │
                        │                                 │
                        │ depends conceptually on:        │
                        │   - markdown-post-frontmatter-  │
                        │     validation (the migration   │
                        │     re-validates against the    │
                        │     same schema this capability │
                        │     owns; flipping the validator│
                        │     is unsafe unless the        │
                        │     capability's contract is    │
                        │     authored correctly)         │
                        └────────────┬────────────────────┘
                                     │
                                     │ (conceptual dependency)
                                     ▼
                  ┌───────────────────────────────────────┐
                  │ markdown-post-frontmatter-validation  │
                  │ (capability)                          │
                  │                                       │
                  │ Owns the contract for the YAML        │
                  │ block at the top of every content     │
                  │ file — required fields, tag           │
                  │ vocabulary, slug consistency.         │
                  └───────────────────────────────────────┘

   ┌──────────────────────────────────┐    ┌─────────────────────────────────┐
   │ image-optimization-pipeline-     │    │ content-source-router           │
   │ config (capability)              │◀───│ (router)                        │
   │                                  │    │                                 │
   │ Owns the build-time image        │    │ Dispatches between markdown,    │
   │ pipeline contract — formats,     │    │ MDX, and CMS-synced sources by  │
   │ srcset breakpoints, quality.     │    │ file extension or content-path  │
   └──────────────────────────────────┘    │ prefix. Routes a request for a  │
                                           │ post to the right source skill. │
                                           └─────────────────────────────────┘

   ┌──────────────────────────────────┐
   │ link-rot-detection               │   (portable — applies to any        │
   │ (capability)                     │    markdown-content project; not    │
   │                                  │    coupled to this site's specific  │
   │ Periodic external-link scanner.  │    file paths or build pipeline)    │
   │ Reports broken links nightly.    │
   └──────────────────────────────────┘
```

## Note on `relations` in these specimens

The Skill Graph lint enforces that every target named in `relations.depends_on`, `relations.verify_with`, etc. resolves to a real skill in `<repo>/skills/`. These specimen skills live at `examples/projects/markdown-static-site/skills/`, not in `<repo>/skills/`, so cross-specimen relations would fail lint.

To keep the specimens lint-clean, their `relations` blocks point at **real existing starter skills in this Skill Graph repository** (`testing-strategy`, `documentation`, `refactor`, `debugging`, `graph-audit`). The conceptual specimen-to-specimen relationships are documented in the diagram above and in each specimen's body prose. If you copy these specimens into a real adopter library where the sibling specimens are also present as production skills, you can additionally add cross-specimen `depends_on` entries — for example, `migrate-posts-to-v2-frontmatter` `depends_on: markdown-post-frontmatter-validation` — and lint will validate them.

## How to verify a specimen

```bash
# Lint a single specimen with --strict (zero warnings allowed)
node scripts/skill-lint.js --strict --skip-generator-parity \
  examples/projects/markdown-static-site/skills/markdown-post-frontmatter-validation/SKILL.md

# Lint all five specimens (one command per specimen)
for spec in markdown-post-frontmatter-validation \
            image-optimization-pipeline-config \
            link-rot-detection \
            content-source-router \
            migrate-posts-to-v2-frontmatter; do
  echo "=== Linting $spec ==="
  node scripts/skill-lint.js --strict --skip-generator-parity \
    "examples/projects/markdown-static-site/skills/$spec/SKILL.md"
done
```

`--skip-generator-parity` is needed because the manifest sample at `examples/skills.manifest.sample.json` is generated only from `skills/`, not from this specimen directory. The skip is intentional — these specimens are demonstrations, not production library entries.

## Adopting a specimen for your own library

1. Copy the `SKILL.md` from this specimen directory to your own `skills/<name>/SKILL.md`
2. Replace the `truth_sources` paths under `grounding` with the real file paths in your repository
3. Replace the `paths:` glob entries with globs that match your real directory layout
4. Update `owner` to your team handle
5. Re-record the drift baseline: `node scripts/skill-graph-drift.js --record --apply skills/<name>`
6. If you want to express cross-specimen dependencies as `relations.depends_on` (e.g., `migrate-posts → markdown-post-frontmatter-validation`), add them once the sibling specimens are also in your `skills/` directory

The specimens are MIT-licensed (per each `SKILL.md` frontmatter) so you can adapt them freely.

## Why this stack and not another?

This specimen pack was deliberately chosen to be a low-stakes, recognizable, multi-tenant content stack: a markdown static site with a build pipeline, a periodic maintenance job, and a multi-source dispatch. Every working developer has built (or could build) something shaped like this. Critically, the stack involves **no security-critical primitives** — no payment processing, no auth flows, no tenant-isolation boundaries, no cryptographic verification. If a reader template-copies one of these specimens and gets it slightly wrong, the worst outcome is a broken image variant or a 404 on a bad route — not a customer-affecting incident.

The Skill Metadata Protocol features the specimens demonstrate (typed relations, grounding, drift detection, project tags, archetype discipline) work identically against any stack. A future specimen pack against a different stack would exercise the same contract; pick one whose worst-case mistake matches your risk tolerance.
