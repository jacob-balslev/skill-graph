# Org-Level README Draft (Item 50)

> **Status:** DRAFT — not yet deployed.
> **Destination:** `https://github.com/jacob-balslev/.github/blob/main/profile/README.md`
> **GitHub behaviour:** any markdown at `profile/README.md` inside an account-level `.github` repo is rendered as the user/org landing page at `https://github.com/jacob-balslev`.
> **Prepared:** 2026-05-19 by Karpathy-loop Phase 3 Item 50.
> **Source:** Synthesis §4 item 1 — Claude's #1-ROI growth lever per the two-model comparison.

---

## Why this exists

GitHub renders `<account>/.github/profile/README.md` as the public landing page for the account. `github.com/jacob-balslev` currently has no top-level narrative — visitors see only an alphabetised repo list. A short, well-shaped landing page costs ~30 minutes to ship once and routes every future inbound viewer (RSS-shared link, Linear comment, npm-package-author click) toward the canonical projects with the right framing.

This file is the proposed content. Deployment steps are at the bottom.

---

## Proposed content for `profile/README.md`

```markdown
# Jacob Balslev

> Building agent-skills infrastructure: protocols, audit loops, and the tooling that keeps a skill library honest as it grows.

I work on the machinery between an LLM and a useful coding agent. The thread across the projects below is **typed metadata + deterministic gates + a Karpathy-style keep-or-revert loop** applied to skills, audits, and routing decisions.

## Public projects

### [`skill-graph`](https://github.com/jacob-balslev/skill-graph) — Skill Metadata Protocol + audit-loop toolchain

The authoring + audit-time contract for `SKILL.md` files. Typed frontmatter, a JSON Schema (`schema_version: 6`), a lint + manifest + router + drift sentinel, and a `doctor` subcommand that runs every deterministic gate in one pass. Ships as `@skill-graph/cli` on npm.

The differentiator: a Karpathy-style **keep-or-revert audit loop** applied to skill libraries instead of training scripts. Each edit ships as one field per commit with a hard pass/fail gate; if the gate fails, `git revert HEAD`. The loop is what keeps a library trustworthy as it crosses 100+ skills.

→ **Install:** `npm install -g @skill-graph/cli`
→ **Quickstart:** [author your first skill in 30 minutes](https://github.com/jacob-balslev/skill-graph/blob/main/docs/QUICKSTART-30MIN.md)
→ **Primer:** [the mental model](https://github.com/jacob-balslev/skill-graph/blob/main/docs/PRIMER.md)

### [`skills`](https://github.com/jacob-balslev/skills) — published Agent Skills

The public skill library that the marketplace at `skills.sh/jacob-balslev/skills` indexes. Plain Agent-Skills-format `SKILL.md` files exported from `skill-graph`'s authoring repo. Install:

```bash
npx skills add jacob-balslev/skills
```

### [`skill-metadata-protocol`](https://github.com/jacob-balslev/skill-metadata-protocol) + [`skill-audit-loop`](https://github.com/jacob-balslev/skill-audit-loop) — docs-only mirrors

Historical canonical docs for the protocol and audit loop. Both repos were consolidated into `skill-graph` on 2026-05-18 ([ADR 0009](https://github.com/jacob-balslev/skill-graph/blob/main/docs/adr/0009-sibling-repo-deprecation.md)). They remain readable so existing inbound links stay valid; new development lives in `skill-graph`.

## What I read into the work

- **Karpathy on autoresearch** — one experiment, one editable field, one scalar metric, keep-or-revert. The whole audit loop is structured around this discipline.
- **Diátaxis** — explanation, tutorial, reference, how-to. Every doc surface in skill-graph is tagged with its Diátaxis genre.
- **OntoClean** — what makes a category rigid, what makes it anti-rigid. The four skill archetypes (`capability` / `workflow` / `router` / `overlay`) come from this analysis.
- **Anthropic Skills + the Agent Skills spec** — the base format Skill Metadata Protocol extends.

## Contact

- GitHub Issues on any of the repos above
- npm: `@skill-graph/cli`
```

---

## Deployment steps (when ready)

```bash
# 1. Create the .github repo (account-level, public, special name)
gh repo create jacob-balslev/.github --public \
  --description "Account-level landing page + shared community health files"

# 2. Clone it locally
cd ~/Development
git clone https://github.com/jacob-balslev/.github jacob-balslev-dotgithub
cd jacob-balslev-dotgithub

# 3. Create the profile dir and drop the README
mkdir -p profile
# Copy the content block from this draft into profile/README.md
# (only the content between the triple-backtick fences above)

# 4. Commit + push
git add profile/README.md
git commit -m "feat(profile): add org-level landing page"
git push -u origin main
```

GitHub re-renders the page at `https://github.com/jacob-balslev` within a minute.

## Maintenance contract

When the project list changes — a new public repo, a repo retirement, a `skill-graph` version that changes the install story — this file must be updated in the same change. The org README is the entry point; stale claims here cost more than stale claims in a deep doc.

If we add Mintlify / Nextra docs (Item 55), surface the docs-site URL here as the *first* link under `skill-graph`, ahead of QUICKSTART and PRIMER.

## Open question

- Should the landing page list the four Karpathy / Diátaxis / OntoClean / Anthropic-Skills influences, or move them to a separate `INFLUENCES.md`? Argument for keeping inline: every visitor sees the intellectual lineage at a glance. Argument for moving: keeps the landing page shorter and lets each project's README do its own framing.
