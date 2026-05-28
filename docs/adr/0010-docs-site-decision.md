# ADR 0010 — Docs Site Decision (Defer Mintlify / Nextra, Stay on GitHub-Native)

> Status: Accepted
> Date: 2026-05-19
> Karpathy-loop Phase 3 Item 55

## Context

The Skill Graph repo carries 20+ doc files plus a 1500-line auto-generated field reference. The original 2026-05-12 OSS docs refresh plan explicitly **excluded** spinning up a docs site (Mintlify, Nextra, GitHub Pages, Docusaurus). The two-model synthesis in `Development/docs/plans/skill-graph-karpathy-loop/synthesis.md` later disagreed:

- **Claude (synthesis §4 item 3):** "The project has 20+ docs, 1477-line field reference, ADRs, migrations. This is a documentation site, not a README." → recommended a docs site.
- **GPT-5.5 (synthesis §5C):** "Don't polish prose while `docs:links` is red and lint reports 296 errors. Phase 1 truth repairs first. Docs site is a Phase 3 question after Phase 1 invariants exist (otherwise the docs site mirrors today's drift onto a fancier surface)."

Phase 1 (33 items) and Phase 2 (16 items) have now landed. The doc surface is *as accurate as it has ever been*: drift sentinel green, mirror-freeze sentinel green, manifest validates, doctor PASS on 5/6 checks, schema_version drift sentinel watches the active docs. The question is now ripe.

## Options considered

| Option | Pro | Con |
|---|---|---|
| **A. Mintlify** (`mintlify.com`) | Best-in-class search and code-block UX. Heroic adoption inside the AI / developer-infra cohort (Resend, Anthropic, Together, Mintlify itself). Free for OSS. AI-friendly content rendering (their own AI assist reads MDX cleanly). | Lock-in: their config format, their search, their components. Yet another auth surface. Vendor risk if they pivot pricing. |
| **B. Nextra** (`nextra.site`) | Owned by the Next.js / Vercel ecosystem. Self-hostable. Used by Turborepo, SWR, Vercel themselves. MDX-native. | Heavier toolchain (Next.js install, build pipeline, deploy target). More config burden than Mintlify. |
| **C. GitHub Pages + a minimal static-site generator** (e.g. Just-the-Docs, mkdocs-material) | Zero vendor lock-in, ships at `<account>.github.io/<repo>/`, free with the existing repo. Good search. Familiar to OSS contributors. | More plumbing than the hosted options. Theming work to look anything like Mintlify-tier. |
| **D. Defer — stay on GitHub-rendered Markdown** | Zero migration cost. Every change is `git push`. The existing drift sentinels already keep the docs honest. The Codespace from Item 52 lets visitors actually run the tooling, which is more useful than a prettier static site. | No global search across docs. No nav-tree sidebar (though README's `## Pick the right doc` table is a workable substitute). No SEO surface beyond GitHub. |

## Decision

**Defer the docs site. Stay on GitHub-rendered Markdown for the foreseeable future.** Re-evaluate when **any one** of these three triggers fires:

1. **Search becomes the bottleneck.** When a visitor's "where is the explanation of `X`" question can't be answered by grep on the repo + the README's `## Pick the right doc` table — when we get external feedback that the docs are hard to navigate, not hard to write.
2. **The doc surface exceeds ~40 active files.** Currently at ~30 active docs (per `check-doc-drift.js` output: 59 scanned, includes archived). At 40+ active, the README's hand-curated table becomes a maintenance burden in its own right.
3. **External adoption reaches a threshold that justifies a marketing surface.** A docs site at `skill-graph.dev` or similar is partly a credibility signal. Below ~100 external GitHub stars, no one notices the difference. Above ~500, the lack of a docs site starts to look like neglect.

When the docs site comes, the recommended choice is **Mintlify** — based on:
- Speed of standup (~1 day vs ~3+ days for Nextra/Pages).
- The audience overlap with Mintlify's existing customers (Anthropic, Together, Resend) is high; readers will feel familiar with the navigation.
- Free for OSS removes the vendor-cost risk for v1; the migration cost back out to Nextra later is non-trivial but bounded (MDX content is portable).

The trigger-to-launch path:

1. Confirm one of the three triggers above has fired.
2. Open a follow-on ADR (0011 or later) recording the trigger evidence.
3. Cut a `docs-site` branch; install Mintlify locally; mirror the existing `docs/` tree.
4. Apply the drift sentinels to the site as well — every claim on the site must also be true at the source. The site is a presentation layer, never a fork.
5. Deploy at `docs.skill-graph.dev` or `skill-graph.mintlify.app` (decide at launch).
6. Update the [`docs/positioning.md`](../positioning.md), the org-level README (Item 50 draft), and the `README.md` to surface the docs URL.

## Consequences

- No immediate work. The 5 closing gates from Phase 2 remain the source of doc-truth.
- The README's `## Pick the right doc` table and the `docs/SKILL_METADATA_PROTOCOL_PRIMER.md` ↔ `docs/QUICKSTART-30MIN.md` cross-links are the navigation substrate until triggers fire.
- The `check-markdown-links` + `check-doc-drift` + `check-mirror-freeze` sentinels keep the GitHub-rendered surface honest. A docs site without those sentinels would *reduce* doc trust, not increase it.
- Phase 3 closes Item 55 with a "no docs site yet, here is the trigger contract" decision instead of a Mintlify rollout. The work isn't dropped; it is gated behind explicit, measurable triggers.

## Related

- ADR 0008 — Skill surface split and curation policy.
- ADR 0009 — Sibling repo deprecation (consolidation addendum).
- Phase 3 Item 50 (org-level README) — surfaces the docs-site URL when one exists.
- Phase 3 Item 52 (devcontainer) — competing investment that delivers more value per hour than a docs site at current scale.
- Synthesis §4 item 3 (Claude) and §5C (GPT-5.5) — the two-model disagreement this ADR resolves.
