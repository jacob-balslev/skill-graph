# Marketplace Release Agent Prompt

Use this prompt when handing the next implementation step to an agent. It assumes
Skill Graph remains the canonical protocol source and the marketplace release is
a generated public export surface.

```text
You are working in the Skill Graph repository.

Goal: prepare the public marketplace release surface for skills.sh and SkillsMP
without weakening the canonical Skill Metadata Protocol source.

Read first:

- AGENTS.MD
- README.md
- SKILL_GRAPH.md
- SKILL_METADATA_PROTOCOL.md
- docs/quality-doctrine.md
- docs/marketplace-syndication.md
- docs/marketplace-skill-candidate-list.md
- docs/SKILL-MD-FORMAT-COMPATIBILITY.md
- scripts/export-skill.js
- scripts/verify-skill-md-export.js

Release principles:

1. Keep this repository as the canonical protocol source.
2. Generate a public export surface containing only privacy-gated skills.
3. Use plain SKILL.md files for the marketplace surface, not protocol-enriched
   source files directly.
4. Shorten only export-specific descriptions for skills that exceed marketplace
   or base Agent Skills limits. Do not weaken canonical Skill Metadata Protocol
   descriptions.
5. Add factual Skill Graph provenance metadata to exported skills:
   skill_graph_source_repo, skill_graph_protocol, skill_graph_project, and
   skill_graph_canonical_skill.
6. Keep readable names and explicit metadata keys. Do not abbreviate names or
   fields to save space.
7. Do not publish private project skills, customer workflows, local runtime
   paths, personal names, email addresses, token-like strings, private
   repository names, or local operating context.
8. Treat excluded skills as private source material only. If useful ideas should
   become public, rewrite them as general portable skills and re-scan cleanly.

Implementation tasks:

1. Start from the canonical Skill Graph skills under skills/.
2. Build or extend a deterministic export script that creates the marketplace
   surface from canonical sources.
3. Make the generated surface contain one plain SKILL.md per public skill.
4. Preserve the canonical source path in provenance metadata.
5. Add export-specific descriptions only where required by hard limits.
6. Add a privacy gate for the generated surface and fail the release if any
   private/customer/local/personal/token-like signal appears.
7. Add a plain Agent Skills shape validation gate for the generated surface.
8. Decide and document the GitHub release target: this repo, a dedicated export
   branch, or a dedicated export repository.
9. Do not push until the generated surface passes npm.cmd run verify, export
   verification, privacy scanning, and markdown link checking.
10. After the release target is pushed, validate skills.sh installation with
    npx skills add jacob-balslev/skills.
11. Check SkillsMP discovery after GitHub indexing. If it is not indexed, contact
    SkillsMP with the public GitHub source and the short project description.

Required verification:

- npm.cmd run verify
- node scripts/verify-skill-md-export.js
- node scripts/check-markdown-links.js
- a privacy scan over the generated export surface
- a git status check showing no accidental local artifacts staged

Short project description for outreach:

Skills that know your project and codebase. Structured and categorized. Skill
Metadata Protocol is a structured frontmatter contract for SKILL.md. Skill Graph
is the local library tooling that works across those structured skills.

Do not release from a dirty working tree. If unrelated local changes exist,
separate them into their own commits before preparing the marketplace release.
```
