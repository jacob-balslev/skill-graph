# skills.sh Maintainer Cleanup Request

> Status: required because the public skills.sh index still exposes stale Skill Graph source rows after the canonical export repository was corrected and pushed.
>
> Last verified: 2026-05-14.

## Desired Canonical Source

- Public skills.sh URL: https://www.skills.sh/jacob-balslev/skills/
- GitHub repository: https://github.com/jacob-balslev/skills
- Branch: `main`
- Verified commit: `0f0f68e3083ddd049f69eecd16b22106bb5e951c`
- Repository shape: `skills/<slug>/SKILL.md` at repo root
- Public CLI proof: `npx.cmd --yes skills add jacob-balslev/skills --list` finds 102 skills

## Stale Source Rows To Merge Or Remove

These public rows should no longer be user-facing source paths for Skill Graph skills:

| Stale skills.sh source | Live indexed count | Cause |
|---|---:|---|
| https://www.skills.sh/jacob-balslev/skill-graph/ | 39 | Old canonical repo was indexed directly before the dedicated export repo existed. |
| https://www.skills.sh/jacob-balslev/skill-graph-skills/ | 34 | Old split export source; duplicates a subset of the old Skill Graph rows. |
| https://www.skills.sh/jacob-balslev/skill-graph-skills-missing-1/ | 27 | Old split export source for rows missing from the first split export. |

The owner page still reports `3 sources`, `100 skills`, and `420 total installs` at:

```text
https://www.skills.sh/jacob-balslev/
```

The owner page should instead expose one public user-facing source:

```text
jacob-balslev/skills
```

## Current Failure Evidence

The canonical target exists but is not indexed:

```text
https://www.skills.sh/jacob-balslev/skills/
```

Live page metadata still reports `0` skills for `jacob-balslev/skills`.

The skills.sh snapshot API confirms the target snapshot is missing:

```text
https://skills.sh/api/download/jacob-balslev/skills/a11y
{"error":"not_found"}
```

The same API confirms the old stale source still has cached snapshot data:

```text
https://skills.sh/api/download/jacob-balslev/skill-graph/a11y
```

That old response returns a cached v3 `a11y` `SKILL.md`, proving skills.sh still serves stale rows under the old source.

## User-Side Attempts Already Ruled Out

- Direct add/remove telemetry did not transfer old rows to `jacob-balslev/skills`.
- Temporary-home CLI install/remove attempts did not transfer old rows to `jacob-balslev/skills`.
- Public CLI discovery against the canonical target works, so the GitHub repo shape is not the blocker.
- The public CLI source keys telemetry and snapshot download paths by exact `owner/repo`; remove telemetry is not a source-row delete.
- The public CLI source aliases do not contain any `jacob-balslev/*` alias mapping.
- The documented skills.sh public surface describes discovery through `npx skills add <owner/repo>` and read APIs, not a user-facing source merge/delete/reindex operation.
- A related Vercel Community thread states that obsolete skills.sh source lists currently require a skills team fix rather than a self-service rescan or update mechanism: https://community.vercel.com/t/how-to-remove-or-update-obsolete-skill-lists-on-skills-sh/37935

## Requested Maintainer Action

Please perform a maintainer-side cleanup or reindex so that:

1. `jacob-balslev/skill-graph`, `jacob-balslev/skill-graph-skills`, and `jacob-balslev/skill-graph-skills-missing-1` are removed, merged, or aliased away from public user-facing source lists.
2. `jacob-balslev/skills` becomes the only public user-facing source under `https://www.skills.sh/jacob-balslev/`.
3. Snapshot/download rows are generated for the 102 skills in `jacob-balslev/skills@main`.
4. `https://www.skills.sh/jacob-balslev/skills/` reports 102 indexed skills.
