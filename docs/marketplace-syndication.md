# Marketplace Syndication and Gap Discovery

> **Audience.** Maintainers preparing Skill Graph and the full starter library for public discovery through `skills.sh`, SkillsMP, and other `SKILL.md` registries.
>
> **Status.** Working strategy. Update after each marketplace indexing experiment.
>
> **Last verified.** 2026-05-13.

Skill Graph should use public skill marketplaces as discovery channels, not as the source of truth. The canonical artifacts stay in this repo: protocol-enriched `skills/**/SKILL.md` files, schemas, docs, evals, manifests, and reference tooling. Marketplaces receive plain `SKILL.md` exports or GitHub-indexable surfaces that point back to the canonical Skill Graph source.

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

## Export Provenance

Marketplace exports should carry a small, factual provenance block in `metadata`. Do not put advertising copy in every skill body; the body is operational context loaded by agents.

Use string values so the result stays compatible with the base `SKILL.md` metadata shape:

```yaml
metadata:
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: "Skill Metadata Protocol v3"
  skill_graph_project: "Skill Graph"
  skill_graph_canonical_skill: "skills/<name>/SKILL.md"
```

If a generated export already nests protocol fields under `metadata`, keep these `skill_graph_*` keys alongside that export metadata. The purpose is provenance, not keyword stuffing.

## Marketplace Preparation Checklist

Before publishing or asking a marketplace to index the library:

- Use [`marketplace-release-agent-prompt.md`](marketplace-release-agent-prompt.md) when handing the export-surface implementation to another agent.
- Run `npm run verify`.
- Generate plain `SKILL.md` exports for the whole public library.
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
| Skill registry hygiene | Marketplace users need to inspect third-party skills before installing them. | `capability`, portable, strong `relations.verify_with` to `security` and `graph-audit`. |
| Skill provenance review | Public registries need source, license, compatibility, and trust review. | `workflow`, portable, grounded in Agent Skills spec and Skill Graph export docs. |
| Marketplace export packaging | Authors need to publish Skill Metadata Protocol skills as plain `SKILL.md`. | `workflow`, reference or portable, tied to `scripts/export-skill.js`. |
| Skill gap analysis | Teams need to compare their library against marketplace demand. | `workflow`, portable, depends on `skill-router`, `graph-audit`, and `skill-infrastructure`. |
| Skill install risk triage | Installing a public skill is supply-chain work, not only copy-paste. | `capability`, portable, verify with `owasp-security` and `dependency-architecture`. |
| Cross-runtime compatibility notes | Skills may behave differently across Claude Code, Codex, Cursor, Windsurf, and others. | `capability`, portable, with conservative compatibility language. |
| Skill library release checklist | A multi-skill library needs release hygiene before public distribution. | `workflow`, portable, depends on `version-control`, `documentation`, and `graph-audit`. |

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
