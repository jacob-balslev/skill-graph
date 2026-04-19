# Consultant Showcase Improvement Prompt (Layered)

> **Purpose.** A single prompt designed to work unchanged across Opus (Claude
> Code), GPT-5.4 (Codex), and Gemini Pro. Each consulting model must load
> all relevant Skill Graph skills, demonstrate multi-layer understanding via
> an explicit layer map, and propose improvements tagged with the layers
> they touch and the cascades they force.
>
> **When to use this prompt.** Any self-showcase improvement sprint — when
> you want to raise the bar on how Skill Graph teaches its own contract
> through templates, documentation, descriptions, and diagrams.
>
> **How to dispatch.** Copy the block between the `=== BEGIN PROMPT ===` /
> `=== END PROMPT ===` markers. Paste into any of:
>
> | Model | Invocation |
> |---|---|
> | Opus (Claude Code) | Paste at the prompt; tools are native. |
> | GPT-5.4 (Codex plugin) | `Agent({ subagent_type: "codex:codex-rescue", prompt: <block> })` — in-session, no external spawn. |
> | Gemini Pro | `gemini -m gemini-2.5-pro -p "$(cat docs/plans/consultant-showcase-prompt.md | sed -n '/=== BEGIN PROMPT ===/,/=== END PROMPT ===/p')"` — the CLI on this machine does not expose `gemini-3-pro` as a valid alias; 2.5 Pro is the best tier that accepts. |
>
> **Design rationale.** The prompt teaches the 7-layer model up front, lists
> required reading grouped by which layer each file lives in, and requires
> each consulting model to produce a layer map as Artifact 1 — so they must
> prove they internalised the layering before proposing any changes.
> Previous two-artifact prompts (plan + worked improvements) produced
> single-layer myopia: models optimised one layer and missed the cascades.
> The 7-layer discipline is the fix.

---

=== BEGIN PROMPT ===

# Skill Graph — Self-Showcase Improvement Sprint (Layered)

You are a senior documentation + diagram engineer consulted to raise the bar
on how the Skill Graph project teaches its own contract.

Skill Graph defines a v3 frontmatter contract for AI agent SKILL.md files.
It is a small system but a deeply layered one: a single change at one layer
can cascade through three others. Your recommendations will only be useful if
you understand the layering BEFORE you propose anything. This prompt teaches
you the layers; you must prove you internalised them in Artifact 1 below
before moving to improvements.

Working directory: /Users/jacobbalslev/Projekter/Development/Skill Graph/

## The 7-layer model — understand this before reading any file

Skill Graph is not a flat repository. It is 7 layers stacked on each other,
each with a distinct authority, audience, and failure mode. A well-informed
improvement names which layer it touches and traces the cascade through
every dependent layer. A badly-informed improvement "fixes" one layer and
breaks three others silently.

### Authority layers (from docs/ARCHITECTURE.md — canonical)

1. CONTRACT. The law. Machine-enforceable.
   Lives in: schemas/skill.schema.json, schemas/manifest.schema.json,
   pinned v3 copies, frozen v2 copies.
   Authority: always wins. If any lower layer disagrees, the lower layer is
   the bug. 32 top-level authored fields, 13 always-required, 4 conditionally
   required (extends / grounding / keywords / superseded_by).

2. EXPLANATION. Human prose describing the contract.
   Lives in: docs/metadata-contract.md, docs/field-reference.md,
   docs/field-decision-guide.md, docs/manifest-contract.md,
   docs/ARCHITECTURE.md, docs/library-audit-workflow.md,
   docs/single-skill-audit-checklist.md.
   Authority: binding until the schema disagrees. Drift at this layer is
   a BUG (recent fix: 29→32 field-count drift in metadata-contract.md was
   caught by reading the schema directly; manifest-contract.md may still
   have the same drift — verify for yourself).

3. ENFORCEMENT. Scripts that police and compile.
   Lives in: scripts/skill-lint.js (11 checks per skill),
   scripts/check-contract-consistency.js (6 cross-artifact checks C1–C6),
   scripts/generate-manifest.js (authored → compiled projection),
   scripts/skill-audit.js (stub mode + --graded mode),
   scripts/lib/audit-prompt-builder.js (7-dimension prompt composer),
   scripts/lib/parse-frontmatter.js, scripts/migrate-skill-v2-to-v3.js.
   Authority: run-time gatekeepers. Their output must match Tier 1.

4. CONSUMER. Tools that USE the metadata to make visible decisions.
   Lives in: scripts/skill-graph-route.js (graph-aware selector using
   relations + grounding + eval_state + lifecycle + project_tags),
   scripts/skill-graph-drift.js (SHA-256 hash-based drift sentinel).
   Authority: proof that Tier 1's complexity earns its rent.

5. SPECIMENS. Worked examples that illustrate the contract.
   Lives in: examples/skill-template.md (canonical self-referential template),
   examples/skills.manifest.sample.json (generator output),
   examples/audits/<skill>/ (worked audit outputs),
   examples/evals/*.json (comprehension-eval fixtures),
   skills/*/SKILL.md (8 starters covering every archetype × scope).
   Authority: illustrative only. If they break the schema, they are wrong.

### Inside-a-skill layers

6. KNOWLEDGE. How each skill teaches its own domain.
   Lives in: the body of every SKILL.md.
   Structure: ## Coverage (scope map) + ## Philosophy (the single
   testable claim) + ## Verification (authoring gate) + ## Do NOT Use When
   (negative routing) + archetype-specific sections (## Workflow for
   workflow, ## Routing Rules for router, ## Overlay Rules for overlay).
   Authority: the skill is a mini-product; this is its prose surface.

### Across-skills layers

7. GRAPH. How skills relate to each other and to the router.
   Lives in: relations.adjacent / relations.boundary / relations.verify_with
   / relations.depends_on blocks in every SKILL.md frontmatter; the routing
   priority chain (triggers > paths > keywords) and scope/type tiebreakers
   documented in skills/skill-router/SKILL.md.
   Authority: determines which skill activates at request time and which
   skills co-load for verification. Silent graph drift (a boundary pointing
   at a renamed skill, a depends_on pointing at a skill that no longer
   ships) is the worst failure mode because the router fails confidently.

### Orthogonal cross-cut: EVOLUTION

Every layer above has a time dimension. schema_version tracks Tier 1's
evolution (v1 → v2 → v3 breaking bumps, each paired with a codemod).
stability + superseded_by track per-skill lifecycle. CHANGELOG.md tracks
library-wide evolution. drift_check.last_verified + truth_source_hashes
track per-skill drift against Tier 1. A good improvement considers where
it lands in time: does it ship under the current schema_version, or does
it bump the schema? Does it require a migration codemod? Does it need a
CHANGELOG entry under [Unreleased] vs a new release?

## Step 1 — Load the relevant skills, grouped by layer

Read these files in full. Do not skim — the quality of your recommendations
depends on seeing how each layer teaches, enforces, and cross-references.

Layer 1 (Contract):
- schemas/skill.v3.schema.json

Layer 2 (Explanation):
- docs/ARCHITECTURE.md                   — the 5-tier authority system, § System Model
- docs/metadata-contract.md              — § Anatomy (diagram + 32-field table),
                                           § Archetype Section Map,
                                           § Requiredness Groups,
                                           § Authored vs Generated Fields
- docs/field-reference.md                — one section per authored field
- docs/field-decision-guide.md           — scope / relations / eval-health decision tables
- docs/manifest-contract.md              — rename map from authored → compiled
- docs/library-audit-workflow.md         — § Loop at a Glance (2 diagrams)
- docs/single-skill-audit-checklist.md   — deterministic audit checklist

Layer 5 (Specimens):
- examples/skill-template.md             — canonical self-referential template
- examples/skills.manifest.sample.json   — generator output

Layer 6 (Knowledge — read the skill bodies):
- skills/documentation/SKILL.md          — doc-type selection, progressive disclosure,
                                           source-of-truth, freshness/drift
- skills/graph-audit/SKILL.md            — schema conformance + relation integrity
- skills/refactor/SKILL.md               — improve = enrich, never simplify
- skills/skill-router/SKILL.md           — routing priority chain + tiebreakers
- skills/testing-strategy/SKILL.md       — test-level selection
- skills/a11y/SKILL.md                   — minimal capability specimen
- skills/debugging/SKILL.md              — failure-chasing workflow specimen
- skills/lint-overlay/SKILL.md           — overlay archetype specimen with extends

Layer 7 (Graph — skim the frontmatter `relations` block in every skill above):
you are looking for dangling targets, asymmetric adjacencies, and weak
boundary reasons.

Evolution:
- CHANGELOG.md § [Unreleased]            — improvements already shipped — do NOT re-propose

## Step 2 — Four improvement surfaces

A. TEMPLATES (Layer 5 + Layer 2).
   examples/skill-template.md is the only canonical specimen. Look for:
   placeholder sludge, missing TEMPLATE NOTE guidance for fields the v3
   schema added (examples, anti_examples, superseded_by, project_tags,
   lifecycle, runtime_telemetry, category), conditional fields shown
   unconditionally, confusing ordering relative to authoring flow, weak
   ## Philosophy, missing worked contrast between the four archetypes.

B. DOCUMENTATION (Layer 2).
   All files under docs/. Look for: doc-vs-schema drift, canonical content
   duplicated across files when one should own it, rules the repo itself
   breaks, tables that should be diagrams or vice versa, missing drill-down
   paths from overview to detail, broken cross-references after recent
   diagram work.

C. DESCRIPTIONS (Layer 6 + Layer 7, all 8 starter skills).
   The `description:` field is the pushy routing contract. ≤3 sentences,
   lead with "Use when…", name at least one explicit negative boundary with
   "Do NOT use for…". Look for: vague triggers, weak negatives, missing
   near-miss cases, descriptions that summarise instead of trigger,
   inconsistent voice across the 8 starters.

D. DIAGRAMS (Layer 2).
   The four existing Mermaid diagrams in ARCHITECTURE.md (system-model),
   metadata-contract.md (skill-anatomy), library-audit-workflow.md
   (audit-phases, graded-mode). Look for MISSING diagrams that would teach
   something the prose currently carries alone — candidates:
   (1) the drift sentinel's hash lifecycle (Layer 4 consumer),
   (2) the manifest compilation pipeline (Layer 3 enforcement),
   (3) the v2 → v3 migration shape changes (evolution),
   (4) the skill-graph-route decision path (Layer 4 consumer),
   (5) the relations graph across the 8 starter skills (Layer 7).
   Each new diagram must follow the existing discipline: one caption
   question, ≤12 nodes, explicit legend, rendered PNG companion at
   docs/images/<name>.png.

## Step 3 — Deliver three artifacts in this order

### Artifact 1 — Layer map (show your multi-layer understanding)

Produce a compact table of the 7 layers + evolution cross-cut. For each
layer, one line:

    | Layer | Canonical home | What depends on it | Most common drift |

You may refine my 7-layer model — if you see a meaningful 8th layer or
think two should merge, justify it in one sentence below the table. The
model I taught you is a starting point, not a fixed answer. Your ability
to improve or validate it is the first signal of how well you understood
the reading.

### Artifact 2 — Improvement plan (ordered, layer-tagged)

Ten to fifteen improvements across A/B/C/D, ordered by leverage (highest
impact × lowest cost first). Each item is one line:

    N. [A|B|C|D] [L1|L2|…|L7|E] <target file:section> —
       <what to change> —
       <why, grounded in a specific rule from a specific loaded skill> —
       <cascades to: other layers this change forces to update>

Every item must name the primary layer it touches and every secondary
layer it cascades into. An improvement that says "touches Layer 2 only"
with no cascades is either trivial or wrong — contract-first projects
almost always cascade through at least Explanation + Enforcement.

Do not re-propose anything already in CHANGELOG.md § [Unreleased].
Do not propose changes you have not verified against the actual file
contents.

### Artifact 3 — Three worked improvements

Pick the three highest-leverage items from Artifact 2 and execute them
fully. Each must include:

- Exact before → after (or full new-file contents).
- One citation naming the specific skill rule that motivates the change
  ("per skills/documentation/SKILL.md § Source-of-Truth Discipline" or
  equivalent — be precise, cite the section).
- Layer-cascade table: which layers you touched, in which file, and what
  the cascade dependency is.
- For diagram changes: full Mermaid source + the exact npx command to
  render the PNG:
      npx @mermaid-js/mermaid-cli -i <source>.mmd \
          -o docs/images/<name>.png -b white --width 1600

## Quality bar — every proposed change must

- Pass  node scripts/skill-lint.js                 (8 skills, 0 errors)
- Pass  node scripts/check-contract-consistency.js (C1–C6, 0 warnings)
- Honour the documentation skill's source-of-truth rule: never duplicate
  canonical data. The 32 fields live once, in the schema. Everywhere else
  is an index, not a copy.
- Honour the refactor skill's preservation rule: improve means ENRICH.
  Output grows or stays equal unless something is genuinely wrong.
- Honour the graph-audit skill's integrity rule: every relation target
  must resolve to a real sibling skill.
- For diagrams: one question per visual (stated in caption), ≤12 nodes,
  legend block, rendered PNG companion committed alongside the source.

## Anti-patterns — reject these in your own output

- Proposing a Layer-1 change (schema) without naming the Layer-2, Layer-3,
  Layer-5 cascades. A field addition touches the schema (1), its doc
  section (2), its lint check (3), the sample manifest (5), and the
  template (5). A proposal that only lists the schema change is incomplete.
- Listing fields in a new diagram. The Anatomy table indexes them once;
  duplicating is drift surface.
- Suggesting non-Mermaid diagram formats (Excalidraw, SVG, Lucidchart).
  Breaks docs-as-code.
- Rewriting the documentation skill's Philosophy to sound "better." It is
  the authoritative test of good documentation.
- Proposing improvements to consumer-tier tools (skill-graph-route,
  skill-graph-drift) without pointing at a concrete routing or drift
  decision that would change. Consumer-tier improvements must prove their
  rent.
- Handwaving evolution. If a change bumps schema_version, say so and
  name the required codemod. If it needs a CHANGELOG entry, cite the
  section.

## Output format

Markdown. Top-level headings:
    ## Artifact 1 — Layer Map
    ## Artifact 2 — Improvement Plan
    ## Artifact 3 — Worked Improvements

Under Artifact 3, use `### Improvement N — <short title>` for each of
the three. Fenced code blocks for before/after and Mermaid sources. No
emoji. No preamble about having read the files — show your understanding
through the precision of the layer map, the accuracy of the cascade
tagging, and the citations in the worked improvements.

=== END PROMPT ===

---

## Related

- `docs/ARCHITECTURE.md § System Model` — the 5-entity orienting diagram this prompt's Layer 4 references.
- `docs/metadata-contract.md § Anatomy` — the 3-box composition diagram + 32-field grouped table this prompt's Layer 2 references.
- `docs/library-audit-workflow.md § Loop at a Glance` — the 2-diagram audit-loop decomposition this prompt's Layer 3 references.
- `CHANGELOG.md § [Unreleased]` — the ship list consultants must not re-propose.
