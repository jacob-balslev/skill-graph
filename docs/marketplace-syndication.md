# Marketplace Syndication and Gap Discovery

> **Audience.** Maintainers preparing Skill Graph and the full starter library for public discovery through `skills.sh`, SkillsMP, and other `SKILL.md` registries.
>
> **Status.** Working strategy. Update after each marketplace indexing experiment.
>
> **Last verified.** 2026-05-23.

> **CLI vs skill library distribution:** This document covers skill library syndication — publishing `SKILL.md` files to registries like `skills.sh` and SkillsMP. CLI distribution via npm (`@skill-graph/cli`) is a separate concern: the CLI is published from this repo via the `.github/workflows/publish.yml` pipeline on `v*.*.*` tags. See `SH-6110` for install verification and the [Releasing section in README.md](../README.md#releasing-maintainers) for the release procedure.

Skill Graph should use public skill marketplaces as discovery channels, not as the source of truth. The canonical artifacts split across two repos in the Skill Graph ecosystem: the **protocol-enriched `SKILL.md` library** lives in `~/Development/skills/` (the canonical SKILL.md source, also the public release repo at `jacob-balslev/skills`), and the **schemas, docs, evals, manifests, reference tooling, and staging surface** live in this repo (`skill-graph`). Marketplaces receive plain `SKILL.md` exports or GitHub-indexable surfaces that point back to the canonical Skill Graph source. (Updated 2026-05-27 per audit H14 — earlier framing put both halves "in this repo"; the consolidation under ADR 0009 kept the library at `~/Development/skills/` and pulled the tooling into `skill-graph`.)

The goal is twofold:

1. Syndicate the full library so people can discover and install the skills.
2. Mine marketplace gaps and add new Skill Metadata Protocol skills where Skill Graph can contribute real coverage.

This is additive. Do not shrink the library for marketplace presentation. Use indexes, generated views, metadata, and entry points.

## Short Advertising Description

Use this when a marketplace, README badge area, social post, repository description, or outreach note needs a compact project summary:

```text
Skills that know your project and codebase. Structured and categorized. Skill Metadata Protocol is a structured frontmatter contract for SKILL.md. Skill Graph is the local library tooling that works across those structured skills.
```

## Source Landscape

| Surface | What it is useful for | Practical note |
|---|---|---|
| `skills.sh` | Installable `SKILL.md` discovery, install telemetry, leaderboard, README badge. | The docs show `npx skills add owner/repo` and a badge at `https://skills.sh/b/owner/repo`. |
| SkillsMP | GitHub-scale discovery, keyword search, semantic search, categories, occupations, popularity/recent sorting. | The site describes public GitHub syncing and exposes `/api/v1/skills/search`; anonymous keyword search is rate-limited. |
| Agent Skills spec | The base portability target. | The base shape supports `name`, `description`, optional `license`, optional `compatibility`, optional `metadata`, optional `allowed-tools`, plus body content and optional `scripts/`, `references/`, and `assets/`. |

Source URLs:

- `skills.sh` docs: https://www.skills.sh/docs
- `skills.sh` CLI docs: https://www.skills.sh/docs/cli
- SkillsMP: https://skillsmp.com/
- SkillsMP API docs: https://skillsmp.com/docs/api
- Agent Skills specification: https://agentskills.io/specification

## Syndication Policy

Syndicate all public Skill Graph skills that pass export validation. A short demo list is allowed only as a front door in docs, posts, and outreach. It is never a cap on what gets exported or indexed. This follows the repository quality doctrine: organize and adapt exports, do not trim the canonical source. See [`quality-doctrine.md`](quality-doctrine.md).

The canonical source remains:

```text
skills/<skill-name>/SKILL.md
```

The plain marketplace artifact should be generated, not hand-edited. If a marketplace needs stricter base `SKILL.md` constraints than Skill Metadata Protocol uses internally, fix the export path or add an export-specific normalization step. Do not weaken the canonical protocol record just to satisfy a registry.

## Release Target Decision

Use a dedicated export repository as the public GitHub target:

```text
jacob-balslev/skills
```

Do not point marketplace indexers at this canonical protocol repo as the first
install target. The canonical `skills/` directory intentionally contains
Skill Metadata Protocol frontmatter, not plain marketplace frontmatter. A
dedicated export repository avoids mixed indexing, keeps the marketplace surface
small, and lets `skills/` sit at the repository root with one plain
`SKILL.md` per public skill.

The local staging surface is generated in this repo under:

```text
marketplace/skills/<name>/SKILL.md
```

After generation and verification, push that generated surface to the dedicated
export repository. The install command to validate after publishing is:

```bash
npx skills add jacob-balslev/skills
```

## Export Provenance

Marketplace exports should carry a small, factual provenance block in `metadata`. Do not put advertising copy in every skill body; the body is operational context loaded by agents.

Use string values so the result stays compatible with the base `SKILL.md` metadata shape:

```yaml
metadata:
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: "Skill Graph"
  skill_graph_canonical_skill: "skills/<name>/SKILL.md"
```

Exported marketplace skills do not emit `skill_graph_protocol`; per-skill `schema_version` is the honest source contract signal. Per [`AGENTS.md` § Version Labels Are Earned, Not Bumped](../AGENTS.md#version-labels-are-earned-not-bumped), protocol/version labels must describe content conformance, not export-tooling version.

If a generated export already nests protocol fields under `metadata`, keep these `skill_graph_*` keys alongside that export metadata. The purpose is provenance, not keyword stuffing.

## Export-Time Description Projection (Added 2026-05-26)

> Plan: `docs/plans/export-layer-description-projection-2026-05-26.md`

### Motivation — the two-router asymmetry

The Skill Graph has two consumers of `description:` data and they read different things at routing time.

| Consumer | What it sees at routing time | Where the boundary signal can live |
|---|---|---|
| Workspace router (`scripts/skill-graph-route.js`) | Full manifest: `description`, `keywords`, `triggers`, `anti_examples`, `relations.boundary`, `scope`, `type`, etc. | Typed fields (`anti_examples`, `relations.boundary`) — the router reads them directly. |
| Anthropic auto-invocation runtime (claude.ai, claude-code, skills.sh) | **Only `name` + `description`** pre-loaded at startup; the SKILL.md body loads on-demand AFTER trigger; named fields are read by name, not position. (Per [Anthropic Agent Skills overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview): "Claude loads this metadata at startup and includes it in the system prompt.") | The exported `description:` itself — typed fields are invisible at routing time. |

The asymmetry: the workspace's typed-field discipline (`anti_examples`, `relations.boundary`) does the negative-boundary work natively for the workspace router but is invisible to Anthropic's auto-invocation runtime. Reordering frontmatter does NOT fix this — the runtime reads named fields by name, not position.

### What the projection does

`scripts/export-marketplace-skills.js` synthesizes a `Do NOT use for X (use Y).` tail into the exported `description:` from the canonical skill's typed fields. The canonical SKILL.md source is never modified.

**Substrate read (in priority order):**

1. **`anti_examples:`** — array of strings. Each phrase is projected as `Do NOT use for <phrase>.` Most anti-example phrases already carry a trailing `(use <slug>)` reference, so the projected sentence is well-formed.
2. **`relations.boundary:`** — array of `{ skill, reason }` objects (Shape B) or bare slugs (Shape A). Only Shape B is projected: the `reason` is parsed for an `<slug> owns <X>` clause, and the projection becomes `Do NOT use for <X> (use <slug>).` Shape A is skipped silently — a bare slug carries too little context to compose meaningful prose; populate the `reason` field to make a boundary entry projectable.

**Deduplication.** Before synthesizing, the projector scans the base description for `(use <slug>)` mentions. Any slug already named in the canonical/override description is excluded from the projected tail, so the same `(use <slug>)` reference is never stacked twice in the exported text. The dedupe set is shared across `anti_examples` and `relations.boundary` so cross-source duplication is also prevented.

**Doctrine fit — augment, not replace.** The workspace's existing mandate that canonical descriptions include their own `Do NOT use for X (use Y).` clause (per `skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md` § Identity and `AGENTS.md` § Skill Metadata Protocol — Quick Reference) is unchanged. The projection runs **on top of** the canonical clause and only adds entries the canonical clause did not already name.

### 1024-character ceiling enforcement

The marketplace export must stay under `MARKETPLACE_DESCRIPTION_LIMIT = 1024` characters. The base description (canonical text, or the hand-written `EXPORT_DESCRIPTION_OVERRIDES` entry when the canonical is over-limit) is **never truncated**. Only the projected tail is truncated:

- If the canonical/override base + full projection fits in 1024, the full projection lands.
- If it does not fit, the projection is truncated at the last `.` (sentence boundary) that fits the remaining budget. The marketplace provenance metadata records `skill_graph_export_description_projection_truncated: "true"` for that skill.
- If the base description leaves less than 3 chars of headroom, the projection is skipped entirely and a stderr warning logs the cause.

### Provenance stamps

When projection runs, the exported skill's `metadata` carries:

```yaml
metadata:
  skill_graph_export_description_projection: "boundary" | "anti_examples" | "anti_examples+boundary"
  # Present only when the projected tail was truncated to fit 1024 chars:
  skill_graph_export_description_projection_truncated: "true"
```

When no projection runs (typed fields empty, or every projected slug was already named in the canonical description), no provenance stamp is added.

### What stays canonical

- SKILL.md source files are unchanged. The 158-skill canonical library is untouched by the projection.
- The workspace router never sees the projected tail. It reads `anti_examples` and `relations.boundary` directly from the typed fields in the canonical source.
- The protocol's typed-field discipline is preserved. Projection is a publish-time concern only.

### Limits and known gaps

- **`anti_examples` is corpus-empty today.** 1 of 158 skills (`task-path-optimization`) has `anti_examples` populated. Projection wires the read path so a future corpus-wide `anti_examples` population pass needs no exporter change.
- **`relations.boundary` Shape A entries do not project.** A bare-slug entry (`boundary: [foo, bar]`) has no `reason:` clause to extract context from. ~50% of corpus boundary entries are Shape A; populate `reason:` to make them projectable.
- **Slug-based dedupe is mechanical, not semantic.** If the canonical description mentions a concept by name (e.g., "Server Actions") but not by slug (`(use server-actions-design)`), the projector cannot tell and will project the boundary slug anyway. The result reads fine but technically duplicates the concept across canonical prose and projected tail. Reducing this is a separate, harder problem (semantic linking) — out of scope for this projection layer.

## Export-Time Body Projection — Skill Graph Context Section (Added 2026-05-29)

### Motivation — the description projection covers only the boundary signal

The description projection above surfaces the negative-boundary signal, but it is bounded by the 1024-character ceiling and is, by design, only about `Do NOT use for X`. Every *other* meaningful protocol field — `subject`, `subjects[]`, `deployment_target`, `taxonomy_domain`, `scope`, the positive activation signal (`examples`, `triggers`), the full `relations` graph (`depends_on` / `verify_with` / `related` / `broader` / `narrower` / `disjoint_with`), the Understanding fields, `grounding`, lifecycle (`stability` / `freshness` / `superseded_by`), the four Audit Status verdicts, and `keywords` — is carried JSON-encoded under the exported `metadata:` map. **Vendor auto-loaders (Claude, Codex, OpenCode, Gemini) do not read the `metadata:` map.** They read `name` + `description` at startup and the SKILL.md **body** on activation. So the graph was invisible to a consuming agent even though it was present in the file.

### What the projection does

The shared `scripts/lib/render-skill-context.js::renderSkillGraphContext()` projects those fields into a generated `## Skill Graph context` Markdown section appended to the exported body (via the `bodySuffix` hook added to `scripts/export-skill.js::buildExportedSkill()`). It is the single compile core used by **both** this marketplace export and the local `skill-graph render` command (`scripts/render-skills.js`) — marketplace export is just the public-publish profile of the same renderer. The body is read by the vendor on activation (progressive-disclosure level 2), so the graph becomes readable prose for any consuming agent — not just for the workspace router and audit tooling. The section is fenced by stable `<!-- skill-graph-context:start/end -->` markers so it is regenerable, and supports a `full` (default) or `runtime` field profile.

The rendered section has eight sub-blocks, emitted only when their fields are present, in fixed order:

| Block | Fields rendered |
|---|---|
| **Classification** | `subject` (+ secondary `subjects[]`), `deployment_target`, `taxonomy_domain`, `scope` |
| **When to use** | `examples`, `triggers` |
| **Not for** | `anti_examples`, `relations.boundary` (with the `owns` clause from each Shape-B reason) |
| **Related skills** | `relations.depends_on` / `verify_with` / `related` (+`adjacent`) / `broader` / `narrower` / `disjoint_with` |
| **Concept** | the five Understanding fields: `mental_model`, `purpose`, `boundary`, `analogy`, `misconception` |
| **Grounding** | `grounding.grounding_mode`, `grounding.truth_sources` |
| **Lifecycle & audit status** | `stability`, `freshness`, `superseded_by`, `eval_state` (+`eval_score`), `routing_eval`, the four verdicts, `last_audited` |
| **Provenance** | `version`, `schema_version`, `owner`, `keywords` |

### Doctrine fit — augment, not replace; lossless round-trip

- **The authored body is untouched.** The section is appended after it, with an HTML-comment provenance marker (`<!-- generated by scripts/export-marketplace-skills.js ... -->`) so it is regenerable and removable.
- **The `metadata:` map is preserved unchanged.** Nothing is lost — the section is the human/agent-readable *view* of the same data the map carries for lossless round-trip. Pure machine-state fields (`urn`, `drift_check` hashes, `eval_failed_ids`, `runtime_telemetry`, `reviewed_at`, `last_changed`, `eval_last_run`) stay in the map only; they are not readable guidance.
- **Output is deterministic** (fixed field order, only present fields emitted, free-text whitespace collapsed to single lines) so `node scripts/export-marketplace-skills.js --check` stays stable.
- **Slugs render as `code` spans, never as Markdown links**, so the section introduces no dangling-link findings in the export's link checker.
- **No new privacy surface.** The rendered values already appear (JSON-encoded) in the `metadata:` map, which the export privacy gate already scans; rendering the same strings as prose is privacy-neutral, and the gate still scans the full generated file.

### What stays canonical

- SKILL.md source files are unchanged — the projection is a publish-time concern only.
- The workspace router reads the typed fields directly from the canonical source; it never reads the projected section.

## Defense-in-Depth Privacy Gate (Updated 2026-05-23 — SH-6281)

The public skills library (`jacob-balslev/skills`) is defended by four independent gate layers. No single layer failure causes a leak — two or more layers must fail simultaneously.

**Architecture:** ADR 0012 — `docs/adr/0012-internal-skill-library-separation.md`

| Layer | Where | What it blocks |
|---|---|---|
| **L1 — Working tree `.gitignore`** | `jacob-balslev/skills` `.gitignore` — allowlist model (`/*` + re-include only public-safe paths) | `git add -A` or `git add .` picks up internal content |
| **L2 — Export pipeline publication gate** | `scripts/export-marketplace-skills.js` — excludes `deployment_target: project`, legacy internal scope values, and `grounding_mode: repo_specific\|repo_internal`; scans generated surface for `PRIVACY_PATTERNS` | Internal skills flowing through the export pipeline |
| **L3 — Pre-push hook** | `jacob-balslev/skills` repo: `hooks/pre-push` + `hooks/install.js` | Any push — scans changed `SKILL.md` files for `PRIVACY_PATTERNS` hits before the push leaves the local machine |
| **L4 — CI workflow** | `jacob-balslev/skills` repo: `.github/workflows/privacy-scan.yml` + `scripts/ci-privacy-scan.js` | Any PR or push to `main` — runs the full-tree scan on the remote side |

### Shared Pattern Library

All four layers consume the same canonical privacy pattern set from:

```
skill-graph/scripts/lib/privacy-patterns.js
```

This module exports `PRIVACY_PATTERNS` (the pattern array), `scanPrivacyText` (text scanner), and `detectPrivacyViolations` (filesystem-level scanner). Any new internal path prefix, DB surface name, or project-specific identifier must be added **here** — all gate layers update automatically.

Current pattern categories:
- Local filesystem paths (Windows `C:\Users\`, macOS `/Users/`, Linux `/home/`)
- Email addresses
- Private key blocks and known API token prefixes
- Internal codebase paths (`sales-hub`, `apps/web/src`)
- Internal database surface names (`stripe_events_raw`, `shopify_orders_raw`, etc.)
- Local-only artifact paths (`.artifacts/`, `.research/`, `.roundtable/`)
- Known private project names

### Installing the L3 Pre-Push Hook (One-Time, After Cloning)

After cloning `jacob-balslev/skills`, run from the repo root:

```bash
node hooks/install.js
```

This copies `hooks/pre-push` → `.git/hooks/pre-push`. The hook resolves the shared privacy-patterns module from the sibling `skill-graph` repo at `../skill-graph/` (or from `SKILL_GRAPH_PATH` if set). If skill-graph is not found, the push is blocked until the path is fixed — this is intentional: a broken hook fails closed, not open.

**Bypassing the hook via `git push --no-verify` is never acceptable.** The L4 CI gate will catch violations anyway, but a bypassed push leaves internal content in the public repo history until the CI gate fails and the commit is reverted.

### Verifying the Gate

```bash
# L2 — Export pipeline scan (from skill-graph repo root):
node scripts/export-marketplace-skills.js --check

# L3 — Pre-push hook (dry-run equivalent — scan all SKILL.md files directly):
SKILL_GRAPH_PATH=/path/to/skill-graph node skills/scripts/ci-privacy-scan.js

# L4 — Same scan the CI workflow runs:
cd skills && node scripts/ci-privacy-scan.js
```

All three should exit 0 before any push to `jacob-balslev/skills`.

## Marketplace Preparation Checklist

Before publishing or asking a marketplace to index the library:

- Use [`marketplace-release-agent-prompt.md`](marketplace-release-agent-prompt.md) when handing the export-surface implementation to another agent.
- Run `npm run verify`.
- Generate plain `SKILL.md` exports for the whole public library.
- Generate the marketplace surface with `node scripts/export-marketplace-skills.js`. **Run this from the skill-graph repo root** (not from the Development orchestration root) — the exporter contains a root-resolution guard that fails fast with an actionable error if the resolved source root looks like the internal flat operational copies (scope:operational). If the guard fires, set `SKILL_GRAPH_WORKSPACE=/path/to/skill-graph` or `cd` into the skill-graph repo before re-running. (Guard added 2026-05-22 — SH-6329.)
- Verify the generated surface with `node scripts/export-marketplace-skills.js --check`.
- Verify the generated plain shape with `node scripts/verify-skill-md-export.js --plain marketplace/skills`.
- Run a privacy gate before creating row-level marketplace lists or export surfaces.
- Exclude any skill that exposes private projects, customer workflows, local runtime paths, personal names, email addresses, token-like strings, private repository names, or local operating context.
- Keep excluded rows out of public reports, generated exports, marketplace metadata, social posts, and outreach notes until they are rewritten as general public skills and re-scanned cleanly.
- Verify exported `name` values match the base `SKILL.md` pattern and parent directory names.
- Verify exported `description` values fit the base `SKILL.md` limit.
- Verify exported `compatibility` values are flattened strings, not objects.
- Verify exported `metadata` values are string-to-string.
- Add or update README install instructions for the export surface.
- Add the `skills.sh` badge only after the install path works.
- Confirm ignored local artifacts are not staged.
- Review generated exports for secrets, private paths, telemetry, customer data, personal data, and accidental local-only research.

**After pushing to the release repo:**
- Verify indexing has happened: `curl -s "https://skills.sh/api/download/jacob-balslev/skills/a11y"` — expected to return a SKILL.md body (not `{"error":"not_found"}`).
- If the download API returns `not_found`, skills.sh has not re-indexed the push. Follow the manual trigger procedure in **Post-Publication — Triggering skills.sh Indexing** below.
- skills.sh does NOT auto-re-index on push — a maintainer request to @quuu on the Vercel Community forum is the only working lever.

## Post-Publication — Triggering skills.sh Indexing (Updated 2026-05-23 — SH-6292)

**skills.sh does not automatically re-index a GitHub repository when you push new skills.** Pushing to `jacob-balslev/skills` is necessary but not sufficient. The indexing pipeline is platform-controlled and requires a separate manual trigger after every push.

### Root Cause

skills.sh indexes repos through a one-time crawl that is triggered by the platform, not by a GitHub push webhook or CI event. Once a repo is indexed, subsequent pushes do not automatically schedule a re-crawl. There is no self-service re-index API (`skills.sh/api/v1/*` requires a `Bearer sk_live_...` key that library authors do not hold, and there is no `npx skills reindex` command).

This was confirmed during the SH-6292 investigation: pushing 144 skills to `jacob-balslev/skills@main` (verified live on GitHub as of 2026-05-21) produced a page at `https://www.skills.sh/jacob-balslev/skills/` showing **0 skills** and `{"error":"not_found"}` on the download API.

### Verification — Confirm Whether Indexing Has Happened

After pushing to the release repo, run these three checks before concluding the release is live:

```bash
# 1. Confirm the GitHub release repo has the expected skill count
gh api 'repos/jacob-balslev/skills/contents/skills' --jq '.[].name' | wc -l

# 2. Confirm skills.sh has indexed the canonical source
curl -s "https://skills.sh/api/download/jacob-balslev/skills/a11y"
# Expected when indexed: returns a SKILL.md body
# Actual when NOT indexed: {"error":"not_found"}

# 3. Check skills.sh owner page to verify the row count matches
# Visit: https://www.skills.sh/jacob-balslev/
# Expected: one source row "jacob-balslev/skills" with the correct skill count
# Actual when NOT indexed: 0 skills, or the row is absent
```

If check 2 returns `{"error":"not_found"}`, the release push succeeded but skills.sh has not indexed it yet. Proceed to the manual trigger below.

### Manual Re-Index Trigger (Only Working Lever)

There is no self-service re-index mechanism. The **only working lever** is a manual request to Vercel staff through the Vercel Community forum.

**Contact:** `@quuu` (Andrew Qu) — skills.sh maintainer and sole active committer on `vercel-labs/skills`.

**How to reach him (two doors, same person):**

1. **Vercel Community forum** — reply to or create a thread, tag `@quuu` with the repo name and what action you need (index a new source, remove a stale source, or both). Prior successful removal example: https://community.vercel.com/t/removing-a-skill-from-the-skills-sh-list/35562

2. **GitHub issue on `vercel-labs/skills`** — tag `@quuu` in a comment on the open cleanup tracking issue (currently https://github.com/vercel-labs/skills/issues/1147). Note: GitHub issue response has been slow (open since 2026-05-14 with no maintainer response as of 2026-05-20). Forum is faster.

**What to include in the request:**

```text
Repo: jacob-balslev/skills
Branch: main
GitHub URL: https://github.com/jacob-balslev/skills
Desired skills.sh URL: https://www.skills.sh/jacob-balslev/skills/
Action needed: Please re-index this source. The repo has [N] skills under skills/<category>/<name>/SKILL.md
  and was last pushed on [date]. The skills.sh page shows 0 skills and the download API returns
  {"error":"not_found"} for skills that exist in the repo.
```

### Dead Ends — Do Not Waste Time On These

All verified as non-functional during SH-6292 investigation:

| Attempt | Why it does not work |
|---|---|
| Deleting and re-creating the GitHub release repo | Proven: skills.sh rows persist after repo deletion. The stale `jacob-balslev/skill-graph-skills` row still serves 34 skills from a 404 repo. |
| `npx skills remove --source jacob-balslev/skills` | This is a local uninstall, not a registry de-index. Does not affect the platform-side row. |
| Setting `metadata.internal: true` in SKILL.md | Vercel staff confirmed this only skips default install with `INSTALL_INTERNAL_SKILLS=1`. It does not de-index the source row. |
| Pushing with an updated `README.md` or description | GitHub content changes are not re-crawled automatically. |
| Emailing Vercel support | skills.sh is a `vercel-labs` side-project outside platform support scope. `billing@`/`security@` only handles billing and security. |
| `skills.sh/api/v1/*` endpoints | Require a `Bearer sk_live_...` key that library authors do not hold. |

### Stale Source Rows (As of 2026-05-23)

Three old sources are live on skills.sh and should NOT be referenced as canonical. These require maintainer removal — the same forum/GitHub contact path applies:

| Stale URL | Skills indexed | Status |
|---|---:|---|
| `https://www.skills.sh/jacob-balslev/skill-graph/` | ~39 | Old canonical repo indexed directly — GitHub repo still exists |
| `https://www.skills.sh/jacob-balslev/skill-graph-skills/` | 34 | Old split export source — GitHub repo deleted (404), row still live |
| `https://www.skills.sh/jacob-balslev/skill-graph-skills-missing-1/` | 27 | Old split export source — GitHub repo deleted (404), row still live |

The cleanup request referencing all three rows is tracked at `vercel-labs/skills#1147`. See `docs/skills-sh-maintainer-cleanup-request.md` for the full brief to attach to the forum request.

## Curation Pipeline (Updated 2026-05-19 — SH-6127)

ADR 0008 freezes the legacy outer skill surface (`~/Development/skills/<name>/`) and makes the nested OSS surface (`~/Development/skills/skills/<category>/<name>/`) the active Skill Graph library. Curation is therefore a selective promotion workflow, not a mass migration.

| Stage | Gate | Artifact |
|---|---|---|
| Candidate discovery | Identify outer-surface skills that may be useful outside the local workspace | `docs/marketplace-skill-candidate-list.md`, `data/publication-classification.json` |
| Privacy screening | Exclude personal data, private paths, customer/project identifiers, local runtime details, and token/API-key-like strings from row-level public docs | Privacy Gate in `docs/marketplace-skill-candidate-list.md` |
| Scope screening | Exclude Sales Hub-coupled skills and personal-infra skills from public export | `classification: sales-hub-bound` / `personal-infra` in `data/publication-classification.json` |
| Generalization | Rewrite eligible ideas as portable skills instead of copying private source directly | `source: rewrite`, `port+sanitize`, or `port` in `data/publication-classification.json` |
| v8 authoring | Land promoted skills directly in the nested v8 library; do not codemod the frozen outer surface | `~/Development/skills/skills/<subject>/<name>/SKILL.md` |
| Queue generation | Rebuild the publication queue from the ledger after classification edits | `node scripts/skill/build-skill-audit-worklist.js --write` → `docs/marketplace-publication-queue.generated.md` |
| Export verification | Generate and verify the plain marketplace surface before publication | `node scripts/export-marketplace-skills.js --check`, `node scripts/verify-skill-md-export.js --plain marketplace/skills` |

Promotion criteria are all required:

- **Non-PII:** no personal data, customer references, production identifiers, real emails, local user paths, or token-like strings.
- **Non-Sales-Hub:** not coupled to Sales Hub routes, schemas, tenant data, product doctrine, or private integration assumptions.
- **Generalizable:** useful to consumers outside this monorepo without preserving local operating context.
- **v8-compliant on arrival:** authored directly into the nested Skill Metadata Protocol v8 surface with current frontmatter, eval state, and routing metadata.
- **Publication-ledger entry:** classification, tier, source, sanitization requirement, demand signal, and notes recorded in `data/publication-classification.json`.

Do not treat `needs_sanitization: yes` as publishable work already complete. It means the idea can be promoted only after a rewrite or sanitization pass produces a clean nested v8 skill and export verification passes.

## Gap Discovery Loop

Run this loop periodically, especially before outreach or a release.

1. Build the Skill Graph inventory from `examples/skills.manifest.sample.json` or a freshly generated manifest.
2. Query `skills.sh` and SkillsMP for Skill Graph domains, adjacent domains, and obvious missing terms.
3. Normalize marketplace results into a small working table: query, marketplace, skill name, repo, description, category, occupation, popularity signal, and last update when available.
4. Classify each query result against the current library:
   - `covered`: Skill Graph already has meaningful coverage.
   - `covered-needs-syndication`: Skill Graph has coverage, but marketplace search cannot see it yet.
   - `thin`: Skill Graph has adjacent coverage, but the marketplace exposes a real user task we should cover more directly.
   - `gap`: The marketplace has demand or repeated examples and Skill Graph has no matching skill.
   - `out-of-scope`: The gap belongs to a hosted service, proprietary workflow, prompt library, runtime implementation, or other excluded area.
5. For `thin` and `gap`, write a short skill spec and plan before authoring content.
6. Add the new skill under `skills/<skill-name>/SKILL.md` with the full Skill Metadata Protocol contract.
7. Add `examples`, `anti_examples`, and `relations.boundary` so the new skill improves the graph instead of creating duplicate activation.
8. Run lint, routing evals, overlap checks, and manifest validation.
9. Re-export the full library and repeat the marketplace search to confirm the gap is now discoverable.

The output of gap work is a better library, not a list of deleted or hidden skills.

## Initial Query Set

Use these queries as the first reproducible marketplace sweep. Add more as new domains appear.

| Query | What it probes |
|---|---|
| `SKILL.md audit` | Whether registries have skills for checking skill quality and conformance. |
| `skill routing` | Whether registries cover multi-skill routing and wrong-skill activation. |
| `skill drift detection` | Whether registries cover stale grounded skills and truth-source drift. |
| `skill manifest` | Whether registries expose generated inventory and library metadata workflows. |
| `agent skill eval` | Whether registries cover eval artifacts, routing evals, and quality states. |
| `skill overlap` | Whether registries cover duplicate activation and ownership boundaries. |
| `skill provenance` | Whether registries cover source, license, and trust metadata. |
| `skill graph` | Whether the Skill Graph concept itself is visible. |
| `context graph` | Whether larger context-library architecture is covered. |
| `tool call strategy` | Whether tool-use discipline is represented as a skill. |
| `agent workflow design` | Whether workflow-level agent engineering is covered. |
| `AI coding workspace` | Whether project-level AI workspace structure is covered. |
| `design thinking agent skill` | Whether design methodology skills are discoverable. |
| `ontology modeling agent skill` | Whether semantic modeling skills exist. |
| `webhook integration skill` | Whether integration-specific skills exist and how they are framed. |
| `Shopify skill` | Whether commerce-specific skills exist and where Skill Graph has differentiated coverage. |

Treat this table as a starting queue. The gap ledger should record exact dates and marketplace responses, because both registries change over time.

## Gap Candidates To Verify

These are hypotheses, not claims. Validate them with the gap loop before creating new skills.

| Candidate area | Why it may be useful | Likely Skill Graph shape |
|---|---|---|
| Skill registry hygiene | Marketplace users need to inspect third-party skills before installing them. | `capability`, portable, strong `relations.verify_with` to `security` and `skill-infrastructure`. |
| Skill provenance review | Public registries need source, license, compatibility, and trust review. | `workflow`, portable, grounded in Agent Skills spec and Skill Graph export docs. |
| Marketplace export packaging | Authors need to publish Skill Metadata Protocol skills as plain `SKILL.md`. | `workflow`, reference or portable, tied to `scripts/export-skill.js`. |
| Skill gap analysis | Teams need to compare their library against marketplace demand. | `workflow`, portable, depends on `skill-router`, `skill-scaffold`, and `skill-infrastructure`. |
| Skill install risk triage | Installing a public skill is supply-chain work, not only copy-paste. | `capability`, portable, verify with `owasp-security` and `dependency-architecture`. |
| Cross-runtime compatibility notes | Skills may behave differently across Claude Code, Codex, Cursor, Windsurf, and others. | `capability`, portable, with conservative compatibility language. |
| Skill library release checklist | A multi-skill library needs release hygiene before public distribution. | `workflow`, portable, depends on `version-control`, `docs-development`, and `skill-infrastructure`. |

Do not create a new skill just because a keyword is popular. Create one when Skill Graph can provide a useful, maintainable contract with clear activation, boundaries, relations, and verification.

## Outreach Path

Use a two-step outreach path:

1. Ask maintainers for indexing and compatibility feedback.
2. After the export and install path works, post the full project publicly.

Suggested maintainer note:

```text
Skills that know your project and codebase. Structured and categorized. Skill Metadata Protocol is a structured frontmatter contract for SKILL.md. Skill Graph is the local library tooling that works across those structured skills.

We are preparing to syndicate the full public starter library and would like feedback on the best shape for indexing generated exports while preserving canonical Skill Metadata Protocol metadata.

Repo: https://github.com/jacob-balslev/skill-graph
```

Suggested public note:

```text
Skills that know your project and codebase. Structured and categorized. Skill Metadata Protocol is a structured frontmatter contract for SKILL.md. Skill Graph is the local library tooling that works across those structured skills.

The full starter library is published from one canonical repo:
https://github.com/jacob-balslev/skill-graph
```

For broader creator outreach, lead with the full library and the protocol/tooling story. Mention examples only as entry points.

## Acceptance Criteria

Marketplace syndication is ready when:

- Every public skill has a generated plain `SKILL.md` export or a documented reason it is not exported yet.
- Exported skills include factual Skill Graph provenance metadata.
- The README explains how to install or inspect the exported library.
- `skills.sh` can install the intended surface.
- SkillsMP can discover the GitHub source or exports.
- A gap ledger exists with dated marketplace queries and classifications.
- New gap-driven skills go through the normal spec, plan, lint, manifest, routing, overlap, and export checks.
