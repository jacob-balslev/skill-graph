# Skill Graph Marketplace Export

This directory is generated from the canonical Skill Metadata Protocol source in `skills/`.
Do not edit generated files here by hand; run `node scripts/export-marketplace-skills.js` from the canonical repo.

Canonical source repo: https://github.com/jacob-balslev/skill-graph
Release target repo: jacob-balslev/skills
Generated public skills: 177

Each skill under `skills/<name>/SKILL.md` is a plain Agent Skills-compatible export.
Protocol fields are preserved as string values under `metadata`, with factual Skill Graph provenance.
The meaningful protocol fields are also projected into a readable `## Skill Graph context`
section appended to each skill body, so vendor auto-loaders (which read the body on activation,
not the `metadata` map) see the classification, relations, grounding, and audit status as prose.

After the release target is published, install with:

```bash
npx skills add jacob-balslev/skills
```
