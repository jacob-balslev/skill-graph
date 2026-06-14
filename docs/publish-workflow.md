# Skill Graph Publish Workflow

> **Canonical doc for:** export pipeline, release sync, pre-push gates, and the two-step publishing protocol.
> **Audience:** Maintainers publishing skills to `jacob-balslev/skills` (the `skills.sh`-indexed release repo).
> **Last verified:** 2026-05-24 (SH-6331).

This document captures the exact steps, commands, and verification gates required to publish Skill Graph marketplace exports to the public `jacob-balslev/skills` release repository. Follow this exactly to prevent silent drift and accidental leakage of internal content.

---

## Why Two Repos

The Skill Graph ecosystem keeps authoring and publication separated:

| Repo | Role | Path |
|---|---|---|
| `jacob-balslev/skill-graph` | Tooling + protocol contract repo — protocol spec (`skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md`), audit-loop runbook, schemas, audit/eval/lint scripts, manifest compiler, drift sentinel, and the staging surface (`marketplace/skills/`). | `~/Development/skill-graph/` |
| `jacob-balslev/skills` | Canonical SKILL.md library + release repo — the authoritative `skills/<category>/<name>/SKILL.md` source files, also published to `skills.sh` as the release surface. (Updated 2026-05-27 per audit H14 — pre-2026-05-18 framing put the canonical SKILL.md sources inside skill-graph; ADR 0009 consolidated tooling into skill-graph but kept the canonical skill library at `~/Development/skills/`.) | `~/Development/skills/` |

The staging surface in `marketplace/skills/` is the bridge. The exporter reads from the canonical source and writes there; the publish step syncs it into the release repo.

This separation prevents protocol-native authoring fields and audit sidecar state from leaking into the public surface. The public surface only needs the plain Agent Skills fields: `name`, `description`, `license`, `compatibility`, `allowed-tools`, and generated `metadata`.

---

## Canonical URL Contract

| Surface | URL |
|---|---|
| User install command | `npx skills add jacob-balslev/skills` |
| skills.sh page | `https://www.skills.sh/jacob-balslev/skills/` |
| GitHub release source | `https://github.com/jacob-balslev/skills` |

Every doc, README, and script must point at these. See `AGENTS.md § Stale URLs` for the three deprecated rows to never reference.

---

## Two-Step Publish Protocol

### Step 1 — Generate the Marketplace Surface

Run from the **skill-graph repo root** (`~/Development/skill-graph/`), not from `~/Development/`.

```bash
# Generate plain SKILL.md files into marketplace/skills/
node scripts/export-marketplace-skills.js

# Verify the generated surface passes all gates
node scripts/export-marketplace-skills.js --check
```

The `--check` flag runs without writing files. It must exit 0 before proceeding. It enforces:

- Every exported description is ≤ 1024 characters (Agent Skills marketplace limit).
- No privacy violations (`sales-hub/` paths, personal names, tokens, internal DB surface names).
- All exported skills carry factual Skill Graph provenance (`skill_graph_source_repo`, `skill_graph_project`, `skill_graph_canonical_skill`) and do **not** emit `skill_graph_protocol`; that label was retired because version labels must describe content conformance, not exporter version.
- Structural-verdict FAIL skills are blocked from export (gate added in commit `8925a56`).

If `--check` fails on a description-length violation, add an override in `EXPORT_DESCRIPTION_OVERRIDES` in `scripts/export-marketplace-skills.js`. Never shorten the canonical description to fit the limit.

**CWD guard:** The exporter detects if it is invoked from the wrong directory (e.g. `~/Development/` instead of `~/Development/skill-graph/`) and fails fast. This prevents accidentally exporting the 244 `scope: operational` internal skills from the Development workspace.

### Step 2 — Sync to the Release Repo

Run from the **skills release repo** (`~/Development/skills/`).

```bash
cd ~/Development/skills

# Copy the staged marketplace export into the release repo's skills/ directory
cp -r ~/Development/skill-graph/marketplace/skills/. ./skills/

# Update the release README from the staged marketplace README
cp ~/Development/skill-graph/marketplace/README.md ./README.md

# Verify the release repo before committing
node ~/Development/skill-graph/scripts/verify-skill-md-export.js --plain skills/
```

Then commit path-limited (per `.claude/rules/multi-session-commits.md`):

```bash
git add skills/ README.md
git commit --only -m "feat(release): sync flat marketplace export (SH-XXXX)" -- skills/ README.md
```

Then push. The pre-push privacy gate fires automatically (see § Pre-Push Gate below).

```bash
git push origin main
```

---

## Pre-Push Gate

The release repo has a privacy gate in `.githooks/pre-push`. It runs automatically before every push and blocks the push if any changed `SKILL.md` file contains privacy violations.

The gate:

1. Reads the list of SKILL.md files changed vs the remote tip.
2. Uses `git rev-parse --show-toplevel` to reliably find the repo root (fixes SH-6452).
3. Runs `detectPrivacyViolations()` from `~/Development/skill-graph/scripts/lib/privacy-patterns.js`.
4. Rejects the push if any violation is found, printing the violating file and match.

**The gate requires `skill-graph` to be at the sibling path `~/Development/skill-graph/`.** If it cannot find the privacy-patterns module, it blocks the push with an install reminder rather than allowing the push through.

To install the hook after a fresh clone of the release repo, configure git to use the `.githooks` directory:

```bash
cd ~/Development/skills
git config core.hooksPath .githooks
```

Verify the hook is installed and working:

```bash
git push --dry-run
```

If there are no staged changes, the push will be a no-op. If you have changes in a SKILL.md file, the hook will validate them before the dry-run completes.

**Why this fix (SH-6452):** The previous hook used `__dirname` to resolve the repo root, which failed when the hook ran because `__dirname` resolved to `.git/hooks/` instead of the repository root. The new version uses `git rev-parse --show-toplevel` instead, which is reliable and works correctly regardless of the script's location.

---

## Verification Checklist (run before every push)

```bash
# 1. Export passes all gates
node scripts/export-marketplace-skills.js --check

# 2. SKILL.md count matches between marketplace and release repo
find ~/Development/skill-graph/marketplace/skills/ -name "SKILL.md" | wc -l
find ~/Development/skills/skills/ -name "SKILL.md" | wc -l
# Numbers must match

# 3. No protocol-only sidecar files in the marketplace surface
find ~/Development/skill-graph/marketplace/skills/ -name "audit-state.json" | wc -l
# Must be 0

# 4. No internal sales-hub references in committed SKILL.md files
cd ~/Development/skills
git ls-tree -r HEAD --name-only | grep "SKILL.md" | while read f; do
  if git show HEAD:"$f" 2>/dev/null | grep -qi "sales-hub"; then
    echo "MATCH: $f"
  fi
done
# Must be empty (CONTRIBUTING.md and .gitignore referencing sales-hub is expected and acceptable)

# 5. Release repo plain-shape verification
node ~/Development/skill-graph/scripts/verify-skill-md-export.js --plain skills/

# 6. Verify no operational/codebase-scoped skills leaked
git ls-tree --name-only HEAD | grep -v "^\.git"
# Must only show: .github, .gitignore, CODE_OF_CONDUCT.md, CONTRIBUTING.md,
# LICENSE, README.md, SECURITY.md, hooks, scripts, skills
```

---

## What `jacob-balslev/skills` Expects

The release repo has a flat structure under `skills/`:

```
  skills/
  <skill-name>/
    SKILL.md       ← plain Agent Skills-compatible shape
```

Each `SKILL.md` must carry:

- `name` — kebab-case, matches directory name.
- `description` — short topical summary, ≤ 1024 chars.
- `license` — `MIT`.
- `compatibility` — human-readable runtime compatibility note.
- `allowed-tools` — space-separated tool list (e.g. `Read Grep Bash`).
- Optional plain Agent Skills activation fields such as `paths`, `triggers`, `examples`, and `anti_examples` when present in the source.
- Protocol metadata fields are projected as strings under `metadata` when they are present in the canonical `SKILL.md` source.
- `metadata.skill_graph_source_repo` — `https://github.com/jacob-balslev/skill-graph`.
- `metadata.skill_graph_project` — `Skill Graph`.
- `metadata.skill_graph_canonical_skill` — path in the skill-graph repo.
- `metadata.skill_graph_export_description_projection*` — optional export bookkeeping when the marketplace description includes projected anti-example or suppression text.

Protocol extension fields must not appear as extra top-level fields in the plain Agent Skills surface. When preserved for traceability, they appear under `metadata` as string values; generated body text must not surface audit/eval maintenance state as user-facing guidance.

---

## Skills Excluded from Export

The exporter automatically excludes skills with:

- `public: false` — the primary publishability gate. A missing/undefined `public` is also excluded, so the publication boundary fails closed.
- `grounding_mode: repo_specific` or `grounding_mode: repo_internal`
- Any privacy pattern violation (see `scripts/lib/privacy-patterns.js`)
- `structural_verdict: FAIL`

The exporter emits the live export count and the full excluded list with reasons on every run (for example, `public: false`, internal `grounding_mode`, privacy violation, or structural failure). The live exported-skill count and excluded list are runtime receipts; this document does not hand-stamp counts or skill names that can drift.

---

## Drift Prevention

After any new skill is added to `skill-graph/skills/<category>/<name>/SKILL.md`, the marketplace surface is stale until the two-step protocol is run. Signs of drift:

- `find marketplace/skills/ -name SKILL.md | wc -l` does not match the canonical count.
- The release repo HEAD is behind the skill-graph marketplace by one or more skills.

Drift is expected between publish cycles. It is not a bug — it is a signal that a publish cycle is due. Run the two-step protocol to resolve it.

Per `AGENTS.md § Coupled Changes`: "If you add, remove, or rename a skill under `skills/`, the marketplace surface in `marketplace/skills/` is stale until you run `node scripts/export-marketplace-skills.js` (followed by `--check`) and the canonical user-facing release at `https://github.com/jacob-balslev/skills` is stale until you sync the marketplace surface into it and push."

---

## When skills.sh Shows Stale Rows

Three stale rows remain live on skills.sh as of 2026-05-24:

| URL | Status | Skills |
|---|---|---|
| `skills.sh/jacob-balslev/skill-graph` | Live (GitHub repo exists) | 39 skills |
| `skills.sh/jacob-balslev/skill-graph-skills` | Live (GitHub repo 404'd) | 34 skills |
| `skills.sh/jacob-balslev/skill-graph-skills-missing-1` | Live (GitHub repo 404'd) | 27 skills |

These cannot be removed by deleting the GitHub repo (already proven). Removal requires **manual Vercel staff action** via the Vercel Community forum (`@quuu`). Tracked in `vercel-labs/skills#1147` (open since 2026-05-14). See `AGENTS.md § When skills.sh is wrong about us` for the escalation runbook.

---

## Related Docs

| Doc | What it owns |
|---|---|
| `AGENTS.md § Public Distribution — Canonical URL Contract` | The canonical URL contract and skills.sh manual-removal escalation runbook |
| `docs/marketplace-syndication.md` | Syndication strategy, marketplace landscape, source decision rationale |
| `docs/adr/0012-internal-skill-library-separation.md` | Privacy gate architecture (ADR) |
| `scripts/export-marketplace-skills.js` | Export pipeline script (source of truth for export logic) |
| `scripts/verify-skill-md-export.js` | Plain-shape verification for the exported surface |
| `scripts/lib/privacy-patterns.js` | Privacy patterns shared by export, pre-push, and CI gates |
| `hooks/pre-push` | Pre-push privacy gate installed in the release repo |
