# Skill Graph Marketplace Export — Staging Surface

This directory is a **generated staging area** for the public marketplace export. It is intentionally empty in version control post-2026-05-16 monorepo split — `marketplace/skills/` was a redundant 137-entry mirror of the canonical `jacob-balslev/skills` repo and has been removed. The directory exists so that `scripts/export-marketplace-skills.js` has a deterministic output location; running the exporter will re-populate it.

**Canonical end-user install path** (no staging step required):

```bash
npx skills add jacob-balslev/skills
```

That repo is the canonical, public release of all 137+ skills in plain Agent-Skills shape, indexed by skills.sh.

**Post-split architecture:**

- Canonical authoring source: sibling `jacob-balslev/skills` repo (cloned locally at `/Users/jacobbalslev/Development/skills/`). All 137 SKILL.md files live there.
- Protocol contract: sibling `skill-metadata-protocol` repo (schemas, field reference).
- Tooling (this repo, `jacob-balslev/skill-graph`): lint, manifest compiler, router, drift sentinel, exporter.
- Staging output (this directory): populated on demand by `node scripts/export-marketplace-skills.js`; verified by `--check`; synced into the canonical `jacob-balslev/skills` repo via the two-step protocol documented in `AGENTS.MD § Release sync`.

Do not edit files under `marketplace/skills/` by hand. The exporter regenerates them deterministically from the canonical source.
