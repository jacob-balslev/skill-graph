# Adopting Skill Graph

> Should you adopt Skill Graph for your AI agent skill library? This page is a 1-screen decision tree. For the full mental model, read [`SKILL_METADATA_PROTOCOL_PRIMER.md`](../skill-metadata-protocol/PRIMER.md). For the contract details, read [`skill-metadata-protocol.md`](../skill-metadata-protocol/design-rationale.md).

## Relevance probe

> **Skill Metadata Protocol is for project-relevant skills; Skill Graph is for operating on a library of them.** If your skills are generic (no codebase grounding, no inter-skill relations, one project), plain `SKILL.md` covers it. If you've started authoring skills that reference real files in your repo, that need to coexist with related skills, or that should activate for some projects but not others, you need the protocol. If you then want indexing, routing, clustering, drift checks, and eval loops across the library, you are in Skill Graph territory. For progressive adoption levels, read [`CONFORMANCE.md`](CONFORMANCE.md).
>
> The pain test is the same idea, said differently: if you've ever said *"why did the agent load the wrong skill?"* or *"this skill was right last week but the code changed,"* those are the failure modes the contract addresses. Library size is a proxy — these failures usually become worth the extra metadata around 10-15 skills, earlier with multiple projects or grounded codebase skills, later for a single small library.

## You don't have skills yet?

If you have not yet authored any skills, start with plain `SKILL.md` files first. That is the on-ramp. **Pilot Skill Graph on one painful skill before migrating the whole library**: usually around 10-15 skills, or earlier if you have multiple projects, repo-grounded claims, or a real wrong-routing incident.

## Quick yes/no

You should adopt Skill Graph if your skill library has any of these properties:

1. **Two or more skills cover overlapping territory** and the agent routes to the wrong one.
2. **One skill is load-bearing for another** and you've silently broken the assumption.
3. **One or more skills are grounded in specific repo files** that change frequently.
4. **You run evals on skills** and want the router to respect quality.
5. **You're authoring skills for multiple projects** that share some and diverge on others.
6. **You need to verify a skill still matches reality** (drift detection on grounded claims).

If none of these apply, stay on plain [`SKILL.md`](https://agentskills.io/specification). The extra fields are overhead without payoff until the library is large enough to produce the implicit graph.

## The 5-minute decision

| You have… | You want… | Recommendation |
|---|---|---|
| 0-9 skills, single project, no grounded skills, no wrong-routing incidents | A simple way to author and load instructions | Stay on plain `SKILL.md`; revisit when routing or grounding pain appears |
| **10+ skills with one wrong-routing incident OR multi-project workspace OR any grounded skill** | Routing that respects relations + drift detection + project scoping | **Pilot Skill Graph on the painful skill first** |
| Skills grounded in repo files | Drift detection when truth sources change | **Adopt Skill Graph** (drift sentinel) |
| Multi-project workspace | Shared skills + project-specific overlays | **Adopt Skill Graph** (multi-root mode) |
| Skills shipped externally | Compatibility with `SKILL.md` consumers | **Adopt Skill Graph + use export transform** |
| Skills with formal evals | Honest routing claims (lint enforces) | **Adopt Skill Graph** (routing-eval check) |

## Cost-benefit summary

| You pay | Time investment per skill | You get (in outcomes) |
|---|---|---|
| 5 required `SKILL.md` fields plus 7 required `audit-state.json` fields per skill (vs plain `SKILL.md`'s 2) | ~15-20 min first pass (use template) | Wrong-skill activation becomes debuggable |
| SHA-256 baselines for grounded skills | ~5 min one-command baseline (`drift-check --record`) | Repo-specific skills stop silently rotting |
| Cross-skill relation existence checks | ~10 min on day 1 (less afterward as relations stabilise) | Team conventions become auditable rather than tribal |
| Time-boxed `freshness` claims | <1 min per re-verification | Credibility you can defend in code review |
| Schema versioning discipline | One-time codemod per major bump | Smooth migration story across breaking schema bumps |
| One export transform step before publishing externally | ~1 min one command | One-way compatibility with the plain `SKILL.md` format |

**Total time per skill on day 1: ~20-30 min. Steady-state after the library settles: ~10-15 min per new skill.**

The fields you pay for cluster into 8 semantic purposes (Identity, Classification, Health, Evaluation Status, Activation & Routing, Relations, Grounding, Portability). The full anatomy is in [`skill-metadata-protocol.md § Anatomy`](../skill-metadata-protocol/design-rationale.md).

## 5-minute quickstart

> **Step 0 — pilot first, do not migrate the whole library.** Choose ONE skill currently most likely to misroute or drift. Add the required Skill Metadata Protocol fields, route a real query against it, record a drift baseline. Pay the contract once on a skill where the payoff is visible, before paying it 20 times across skills where it isn't yet. The 30-minute walkthrough in [`docs/QUICKSTART-30MIN.md`](QUICKSTART-30MIN.md) walks you through this with literal terminal output at every step.

For the full conceptual primer read [`SKILL_METADATA_PROTOCOL_PRIMER.md`](../skill-metadata-protocol/PRIMER.md). To migrate your first skill from a valid plain `SKILL.md` file:

1. **Copy the template** — `cp examples/skill-metadata-template.md skills/<your-skill>/SKILL.md`. The template is a real, valid, schema-conformant Skill Metadata Protocol skill whose subject is skill authoring itself; adapt by rewriting identity, description, body, and verification.
2. **Add the required Skill Metadata Protocol fields** — in `SKILL.md`: `name`, `description`, `subject` (9-enum), `deployment_target`, and free-text `scope`; in sibling `audit-state.json`: `schema_version: 8`, `owner`, `freshness`, `drift_check`, `eval_artifacts`, `eval_state`, and `routing_eval`. The template inline-comments each field.
3. **Strip the teaching annotations** — every `> **TEMPLATE NOTE:**` blockquote and `# TEMPLATE NOTE:` YAML comment must be removed before commit.
4. **Validate locally:**
   ```bash
   node scripts/skill-lint.js                     # schema + relations + evals + sections
   node scripts/check-protocol-consistency.js     # cross-artifact parity
   node scripts/generate-manifest.js              # compile to a deterministic manifest
   node scripts/skill-graph-route.js --query "your test query"  # see routing in action
   ```
5. **If the skill is grounded in repo files**, record the drift baseline:
   ```bash
   node scripts/skill-graph-drift.js --record --apply skills/<your-skill>
   ```
6. **If you need to publish externally**, project back to plain `SKILL.md` shape:
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
- **You start authoring skills for a second project** that shares some and diverges on others. Multi-root workspace mode + `workspace_tags` is built for this.

## What Skill Graph is *not*

To set expectations honestly:

- **Not a router.** Skill Graph ships a *reference* router (`scripts/skill-graph-route.js`) to demonstrate why the metadata exists. Production routers should consume the manifest and apply their own scoring. The reference router is intentionally simple.
- **Not a runtime.** Skill Graph defines the contract and ships the validators. It does not load skills into an agent at request time — that's the consumer's job.
- **Not a full ontology framework.** The relations are typed (boundary, related, broader, narrower, depends_on, verify_with) but Skill Graph does not implement OWL inference, satisfiability checking, or formal class subsumption. Use `ontology-modeling` if you need that.
- **Not a proprietary format.** The schema is JSON Schema; code and docs are Apache-2.0 and reusable skill content is CC-BY-4.0. The export transform projects protocol skills to the plain `SKILL.md` format.

## Where to go next

| You want to… | Read |
|---|---|
| Understand the conceptual model | [`SKILL_METADATA_PROTOCOL_PRIMER.md`](../skill-metadata-protocol/PRIMER.md) |
| Choose an adoption level | [`CONFORMANCE.md`](CONFORMANCE.md) |
| Verify `SKILL.md` export compatibility | [`SKILL-MD-FORMAT-COMPATIBILITY.md`](SKILL-MD-FORMAT-COMPATIBILITY.md) |
| Measure routing quality | [`ROUTING-METRICS.md`](ROUTING-METRICS.md) |
| Look up a specific field's semantics | [`SKILL_METADATA_PROTOCOL_field-reference.md`](../skill-metadata-protocol/field-reference.md) |
| See a worked authoring example | [`../examples/skill-metadata-template.md`](../examples/skill-metadata-template.md) |
| Read the architecture and authority tiers | [`SKILL_GRAPH.md`](../SKILL_GRAPH.md) |
| See which skills are recommended for a starter library | [`recommended-skills.md`](recommended-skills.md) |
| Set up CI integration | [`integrations/github-actions.md`](integrations/github-actions.md) |
| Decide between four overlapping taxonomy axes | [`SKILL_METADATA_PROTOCOL_field-decision-guide.md`](../skill-metadata-protocol/field-decision-guide.md) |

## Compatibility direction (one-paragraph honesty)

A Skill-Metadata-Protocol-enriched `SKILL.md` is **not** the same as the plain export shape. The `compatibility` shape is structured, and protocol fields live at the top level while the export puts extension fields under `metadata:` as strings. Skill Metadata Protocol -> plain `SKILL.md` is automated via `scripts/export-skill.js`. Plain `SKILL.md` -> Skill Metadata Protocol is a manual rewrite: you must add the additional required fields. See [`SKILL-MD-FORMAT-COMPATIBILITY.md`](SKILL-MD-FORMAT-COMPATIBILITY.md) for the verifier contract.
