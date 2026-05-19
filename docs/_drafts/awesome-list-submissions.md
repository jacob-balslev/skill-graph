# Awesome-List Submissions — Drafts (Item 53)

> **Status:** DRAFT — not yet submitted.
> **Prepared:** 2026-05-19 by Karpathy-loop Phase 3 Item 53.

Two targets, two different surfaces, two different timing gates.

---

## A. VoltAgent/awesome-agent-skills

- **Repo:** [`VoltAgent/awesome-agent-skills`](https://github.com/VoltAgent/awesome-agent-skills) (22k+ stars, 1100+ curated skills, named the "most contributed" Agent Skills list)
- **Submission rules** (from their `CONTRIBUTING.md`):
  - "Skill must have real community usage. We focus on community-adopted, proven skills. Brand new skills that were just created are not accepted. Give your skill time to mature and gain users before submitting."
  - Entry format: `- **[author/skill-name](https://github.com/author/repo/path)** - Short description of what it does`
  - Description ≤10 words.
  - PR title: `Add skill: author/skill-name`

### Timing gate (must clear before submitting)

The "real community usage" bar is the explicit filter. Submitting too early invites a polite rejection that costs the project a credibility tick with the maintainers. **Wait until any one of these is true** for the `jacob-balslev/skills` repo:

1. ≥50 GitHub stars (low bar — proves the public surface exists and someone clicked Watch).
2. ≥3 external contributions (issue, PR, or fork) from users not in this workspace.
3. Documented external adoption (one Twitter/X post, one blog mention, one Discord thread linking back).

When any trigger fires, file the PR per the entry below.

### Proposed entry

Drop into the **Community Skills → Development and Testing** subsection (or "Other" if Development feels too narrow):

```markdown
- **[jacob-balslev/skills](https://github.com/jacob-balslev/skills)** - Typed, audit-loop-grounded SKILL.md library (145 skills)
```

Description is exactly 9 words — fits the ≤10 limit. "Audit-loop-grounded" is the differentiator that distinguishes from bulk-generated collections (their stated quality bar).

### PR body template

```markdown
**What this is:** A 145-skill SKILL.md library exported from the [`skill-graph`](https://github.com/jacob-balslev/skill-graph) authoring + audit-time toolchain. Every skill ships with typed frontmatter (Skill Metadata Protocol v6), passes a 6-check `doctor` gate (lint, manifest, drift sentinel, mirror-freeze, links, protocol), and is re-grounded against its truth sources on a Karpathy-style keep-or-revert audit loop.

**Why it fits the curation bar:** The collection is not bulk-generated. Each skill is hand-authored, lint-validated, and goes through a documented audit loop ([`docs/SKILL_AUDIT_LOOP.md`](https://github.com/jacob-balslev/skill-graph/blob/main/docs/SKILL_AUDIT_LOOP.md)). The repo's primary use is internal but the export pipeline (`scripts/export-marketplace-skills.js`) explicitly produces plain Agent-Skills-format `SKILL.md` files for the public.

**Compatible with:** Claude Code, Cursor, Codex, OpenCode (any Agent Skills runtime that reads SKILL.md).

**Install:** `npx skills add jacob-balslev/skills`

Closes #N/A — this is a new addition, not a fix.
```

---

## B. anthropics/skills (Discussions)

- **Repo:** [`anthropics/skills`](https://github.com/anthropics/skills) (137k stars, `has_discussions: true`)
- **Surface:** GitHub Discussions, not Issues. Lower bar than the awesome-list — these are conversations, not curated entries.
- **Goal:** introduce `skill-graph` (the tooling) + `jacob-balslev/skills` (the published library) to the Anthropic Skills audience. Solicit feedback on the Skill Metadata Protocol extension shape (v6) — Anthropic's own format is the base spec the protocol extends.

### Timing

Discussions accept early-stage projects. The submission can go up **after the 0.5.8 release lands on npm** (currently waiting on `@skill-graph` npm org creation + `NPM_TOKEN` secret per CHANGELOG `[0.5.8]`). Reasoning: a discussion that says "install with `npm install -g @skill-graph/cli`" must point at an actual published package.

### Proposed discussion category

Most likely fit: **"Show and tell"** (if the category exists) or **"Ideas"** if not. Confirm at submission time by visiting `https://github.com/anthropics/skills/discussions/categories`.

### Proposed discussion post

```markdown
**Title:** Skill Metadata Protocol — a Karpathy-style audit loop for SKILL.md libraries

Hi Anthropic Skills team and community,

I've been building [`skill-graph`](https://github.com/jacob-balslev/skill-graph) as an extension to the Agent Skills spec — a typed metadata protocol (`schema_version: 6`) plus a keep-or-revert audit loop that re-grounds each skill against its truth sources on a cadence. The published library is at [`jacob-balslev/skills`](https://github.com/jacob-balslev/skills) (145 skills, install with `npx skills add jacob-balslev/skills`).

The extension is fully backwards-compatible with the base Agent Skills spec — the published `SKILL.md` files are plain Agent Skills shape (the protocol metadata lives in the authoring repo, never in the export). I'd love feedback on a few specific things:

1. **The four-archetype model** (`capability` / `workflow` / `router` / `overlay`) for skill type-tagging — does this match patterns you see in your own library?
2. **The `relations.*` predicates** (`related` / `boundary` / `verify_with` / `depends_on`) for typed edges between skills — would something like this fit upstream in the base spec?
3. **The keep-or-revert audit loop** ([`docs/SKILL_AUDIT_LOOP.md`](https://github.com/jacob-balslev/skill-graph/blob/main/docs/SKILL_AUDIT_LOOP.md)) — has anyone else built drift-detection over SKILL.md files? I haven't found public prior art.

I'm not asking to upstream anything — the protocol's whole point is to be a thin layer on top of your spec so authors can choose to adopt it without giving up Agent Skills compatibility. But I'd value pattern-matching against your team's experience curating the official library.

Happy to demo via the [Codespace](https://codespaces.new/jacob-balslev/skill-graph) if that helps.

— Jacob
```

---

## Submission checklist (when triggers fire)

For each target:

1. **Verify the canonical URLs still resolve** — every link in the entry/post.
2. **Re-read the destination repo's CONTRIBUTING.md** in case rules have changed since this draft.
3. **Run `node bin/skill-graph.js doctor`** on the latest `main` so any failures are caught before external eyes see them.
4. **Fork → branch → PR** for the awesome-list; **open discussion directly** for anthropics/skills.
5. **Do not** name any private/internal projects in either submission (per the personal-projects-out-of-OSS rule).
6. **Record the submission URL** here under a new "Submitted" section once it lands.

---

## Submitted

(Empty — no submissions filed yet. Update when triggers fire.)
