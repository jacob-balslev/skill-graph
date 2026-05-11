# Adopting Skill Graph

> Should you adopt Skill Graph for your AI agent skill library? This page is a 1-screen decision tree. For the full mental model, read [`PRIMER.md`](PRIMER.md). For the contract details, read [`skill-metadata-protocol.md`](skill-metadata-protocol.md).

## Relevance probe

> **Skill Metadata Protocol is for project-relevant skills; Skill Graph is for operating on a library of them.** If your skills are generic (no codebase grounding, no inter-skill relations, one project), plain Agent Skills covers it. If you've started authoring skills that reference real files in your repo, that need to coexist with related skills, or that should activate for some projects but not others, you need the protocol. If you then want indexing, routing, clustering, drift checks, and eval loops across the library, you are in Skill Graph territory.
>
> The pain test is the same idea, said differently: if you've ever said *"why did the agent load the wrong skill?"* or *"this skill was right last week but the code changed,"* those are the failure modes the contract addresses. Library size is a proxy — these failures usually start around 3–5 skills, earlier with multiple projects, later for a single small library.

## You don't have skills yet?

If you have not yet authored any skills, **adopt [Anthropic Agent Skills](https://www.claude.com/skills) first** — that is the on-ramp. A folder of `SKILL.md` files using the base standard is the right starting point. **Adopt Skill Graph after your 3rd skill** (or earlier if you have multiple projects), when the typed-relations layer starts to pay off.

## Quick yes/no

You should adopt Skill Graph if your skill library has any of these properties:

1. **Two or more skills cover overlapping territory** and the agent routes to the wrong one.
2. **One skill is load-bearing for another** and you've silently broken the assumption.
3. **One or more skills are grounded in specific repo files** that change frequently.
4. **You run evals on skills** and want the router to respect quality.
5. **You're authoring skills for multiple projects** that share some and diverge on others.
6. **You need to verify a skill still matches reality** (drift detection on grounded claims).

If none of these apply, stay on base [Agent Skills](https://agentskills.io/specification). The extra fields are overhead without payoff until the library is large enough to produce the implicit graph.

## The 5-minute decision

| You have… | You want… | Recommendation |
|---|---|---|
| 0–2 skills, single project, no grounded skills | A simple way to author and load instructions | Stay on Agent Skills; revisit at skill #3 |
| **3+ skills with one wrong-routing incident OR multi-project workspace OR any grounded skill** | Routing that respects relations + drift detection + project scoping | **Adopt Skill Graph** |
| Skills grounded in repo files | Drift detection when truth sources change | **Adopt Skill Graph** (drift sentinel) |
| Multi-project workspace | Shared skills + project-specific overlays | **Adopt Skill Graph** (multi-root mode) |
| Skills shipped externally | Compatibility with Agent Skills consumers | **Adopt Skill Graph + use export transform** |
| Skills with formal evals | Honest routing claims (lint enforces) | **Adopt Skill Graph** (routing-eval check) |

## Cost-benefit summary

| You pay | Time investment per skill | You get (in outcomes) |
|---|---|---|
| 13 required frontmatter fields per skill (vs Agent Skills' 2) | ~5 min boilerplate (use template) | Wrong-skill activation becomes debuggable |
| SHA-256 baselines for grounded skills | ~5 min one-command baseline (`drift-check --record`) | Repo-specific skills stop silently rotting |
| Cross-skill relation existence checks | ~10 min on day 1 (less afterward as relations stabilise) | Team conventions become auditable rather than tribal |
| Time-boxed `freshness` claims | <1 min per re-verification | Credibility you can defend in code review |
| Schema versioning discipline | One-time codemod per major bump | Smooth migration story across breaking schema bumps |
| One export transform step before publishing externally | ~1 min one command | Round-trip compatibility with the base Agent Skills standard |

**Total time per skill on day 1: ~20 min. Steady-state after the library settles: ~10 min per new skill.**

The fields you pay for cluster into 8 semantic purposes (Identity, Classification, Health, Eval Health, Activation & Routing, Relations, Grounding, Portability). The full anatomy is in [`skill-metadata-protocol.md § Anatomy`](skill-metadata-protocol.md).

## 5-minute quickstart

> **Step 0 — pilot first, do not migrate the whole library.** Choose ONE skill currently most likely to misroute or drift. Add the required Skill Metadata Protocol fields, route a real query against it, record a drift baseline. Pay the contract once on a skill where the payoff is visible, before paying it 20 times across skills where it isn't yet. The 30-minute walkthrough in [`docs/QUICKSTART-30MIN.md`](QUICKSTART-30MIN.md) walks you through this with literal terminal output at every step.

For the full conceptual primer read [`PRIMER.md`](PRIMER.md). To migrate your first skill from a valid Agent Skills file:

1. **Copy the template** — `cp examples/skill-metadata-template.md skills/<your-skill>/SKILL.md`. The template is a real, valid, schema-conformant Skill Metadata Protocol skill whose subject is skill authoring itself; adapt by rewriting identity, description, body, and verification.
2. **Add the 13 required Skill Metadata Protocol fields** — `schema_version: 3`, `version`, `type`, `browse_category`, `scope`, `owner`, `freshness`, `drift_check`, `eval_artifacts`, `eval_state`, `routing_eval`, plus your existing `name` and `description`. The template inline-comments each field.
3. **Strip the teaching annotations** — every `> **TEMPLATE NOTE:**` blockquote and `# TEMPLATE NOTE:` YAML comment must be removed before commit.
4. **Validate locally:**
   ```bash
   node scripts/skill-lint.js                     # schema + relations + evals + sections
   node scripts/check-contract-consistency.js     # cross-artifact parity
   node scripts/generate-manifest.js              # compile to a deterministic manifest
   node scripts/skill-graph-route.js --query "your test query"  # see routing in action
   ```
5. **If the skill is grounded in repo files**, record the drift baseline:
   ```bash
   node scripts/skill-graph-drift.js --record --apply skills/<your-skill>
   ```
6. **If you need to publish externally**, project back to Agent Skills shape:
   ```bash
   node scripts/export-skill.js skills/<your-skill>
   ```

If any step fails, the error message names the rule and the file. Lint output is the primary debugging surface; it's deliberately verbose.

## When to revisit your adoption decision

Re-evaluate the cost-benefit when:

- **Your library exceeds 20 skills.** Implicit graph density is hitting; explicit relations start paying back the authoring cost.
- **You hit a routing failure** that descriptions alone can't fix. `relations.boundary` and `relations.disjoint_with` exist for exactly this.
- **An eval reveals a quality gradient** you want to express in metadata. `eval_state` + `eval_artifacts` + `routing_eval` are the three orthogonal axes.
- **A grounded skill claims something the codebase no longer supports.** The drift sentinel will surface this — but only if you adopted it before the drift accumulated.
- **You start authoring skills for a second project** that shares some and diverges on others. Multi-root workspace mode + `project_tags` is built for this.

## What Skill Graph is *not*

To set expectations honestly:

- **Not a router.** Skill Graph ships a *reference* router (`scripts/skill-graph-route.js`) to demonstrate why the metadata exists. Production routers should consume the manifest and apply their own scoring. The reference router is intentionally simple.
- **Not a runtime.** Skill Graph defines the contract and ships the validators. It does not load skills into an agent at request time — that's the consumer's job.
- **Not a full ontology framework.** The relations are typed (boundary, related, broader, narrower, depends_on, verify_with) but Skill Graph does not implement OWL inference, satisfiability checking, or formal class subsumption. Use `ontology-modeling` if you need that.
- **Not a proprietary format.** The schema is JSON Schema; the contract is MIT-licensed. The export transform makes every skill round-trippable to the base Agent Skills format.

## Where to go next

| You want to… | Read |
|---|---|
| Understand the conceptual model | [`PRIMER.md`](PRIMER.md) |
| Look up a specific field's semantics | [`field-reference.md`](field-reference.md) |
| See a worked authoring example | [`../examples/skill-metadata-template.md`](../examples/skill-metadata-template.md) |
| Read the architecture and authority tiers | [`ARCHITECTURE.md`](ARCHITECTURE.md) |
| See which skills are recommended for a starter library | [`recommended-skills.md`](recommended-skills.md) |
| Set up CI integration | [`integrations/github-actions.md`](integrations/github-actions.md) |
| Decide between four overlapping taxonomy axes | [`field-decision-guide.md`](field-decision-guide.md) |

## Compatibility direction (one-paragraph honesty)

A Skill-Metadata-Protocol-enriched `SKILL.md` is **not** automatically a valid Agent Skills file. The `compatibility` shape (object vs string) and the `name` pattern (allows `/` and `:` vs strict kebab-case) diverge. Going either direction requires a transform. Skill Metadata Protocol → Agent Skills is automated via `scripts/export-skill.js` (flattens `compatibility` to a string, nests extensions under `metadata:`). Agent Skills → Skill Metadata Protocol is a manual rewrite — you must add the additional required fields. The two formats are *interoperable* via the transform, not *compatible* via shared shape.
