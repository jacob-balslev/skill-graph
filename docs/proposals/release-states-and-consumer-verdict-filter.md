# Proposal: Two Release States + Consumer Verdict Filter

> Status: proposal (not implemented). Surfaced by the 2026-05-30 Skill Graph roundtable (GPT-5.5 novelty #3 + #5; convener synthesis recommendation #2). Full deliberation: `~/Development/.roundtable/skill-graph-2026-05-30/SYNTHESIS.md`.
> Author: Claude Opus 4.8 (convener). Respondents: GPT-5.5, Gemini 3.1 Pro.
> Mode: SYSTEM (if implemented — touches schema-derived manifest facets + the export/README pipeline). This document is analysis/proposal only and changes no schema, script, or SKILL.md.
> Last verified against code: 2026-06-02.

## TL;DR

A skill answers two **independent** questions, and the project currently collapses them into one fuzzy notion of "ready":

1. **Is it safe and valid to put in front of users?** — structurally valid, grounded, routable, not malicious, no private content. Call this **marketplace-publishable**.
2. **Is it proven to actually improve agent behaviour?** — an independent grader scored `application_verdict: APPLICABLE` on real artifacts. Call this **behaviorally-certified**.

These are different bars. A skill can be (1) without being (2). Today **157 of 158 skills are `UNVERIFIED`** on behaviour, yet most pass the structural floor. So:

- If "ready to publish" requires **both**, you publish almost nothing for months while the Behaviour Gate drains.
- If "ready to publish" requires only (1), your public surface is full of skills a consumer cannot tell apart by proven quality — the exact quality-dilution failure of ClawHub (Snyk: 36.8% of public skills carry a flaw).

The proposal: **name the two states explicitly, decouple them as policy, and surface the certification signal to the consumer as a browse/sort filter.** "Publishable" must not imply "certified," and the consumer must be able to see and filter on the difference.

---

## Why this is mostly formalization, not new construction

The project already has both halves. They are just not named as two release states and the certified signal never reaches the consumer.

### What already exists

| Primitive | Where | What it gives us |
|---|---|---|
| **The export gate** (defines "publishable" today) | `scripts/export-marketplace-skills.js` — excludes `deployment_target: project`, `grounding_mode: repo_specific`/`repo_internal`, legacy scopes; blocks `structural_verdict: FAIL`; enforces the privacy gate and the ≤1024-char description limit | This **is** the marketplace-publishable bar already, just unnamed |
| **`application_verdict`** | `audit-state.json` sidecar (`schemas/skill-audit-state.schema.json:184`), joined into the generated manifest (`schemas/manifest.schema.json:836`) | This **is** the behaviorally-certified signal: `APPLICABLE` = certified; `UNVERIFIED`/`PROVISIONAL` = not |
| **`admitted` set** | `scripts/generate-manifest.js` (structural PASS + truth PASS gate; see `docs/verdict-semantics.md`) | Eligibility computation already distinct from assessment |
| **`marketplace_priority` (S/A/B/C)** | `schemas/skill-audit-state.schema.json:319` | Publication featuring/grouping already authored per skill |
| **`stability` / `superseded_by`** | `schemas/SKILL_METADATA_PROTOCOL_schema.json:119` | A lifecycle posture axis already exists, orthogonal to both states above |

### What is actually missing (this proposal)

1. **A named, written two-state policy.** Today "publishable" and "certified" are implicit and entangled. Make it explicit doctrine: *passing the export gate makes a skill publishable; it does NOT make it certified. Certification requires `application_verdict: APPLICABLE` from an independent grader.* (This is the `version-schema-contract.md` rule — "never present carries-the-label as verified" — applied at the product surface.)

2. **The certified signal does not reach the consumer.** The public export strips every skill to the six plain Agent Skills fields (`name`, `description`, `license`, `compatibility`, `allowed-tools`, `metadata`) per `docs/publish-workflow.md`. `application_verdict` lives in the sidecar and the *internal* manifest, so a user browsing `skills.sh` literally cannot see or filter by whether a skill is behaviourally certified. Surface it (in the exported `metadata` block, README grouping, and/or a public manifest facet).

3. **A consumer-facing filter / browse facet.** "Show all publishable" vs "show only behaviorally-certified," with `UNVERIFIED` exposed honestly as a filter value rather than hidden. This makes the certified tier visible — which is the whole point of having a moat.

---

## The mental model: two orthogonal axes, not one ladder

```
                         behaviorally-certified?
                         (application_verdict)
                    NO (UNVERIFIED/PROVISIONAL)   YES (APPLICABLE)
                  ┌──────────────────────────────┬───────────────────────────┐
   publishable?   │  PUBLISHABLE, UNVERIFIED      │  CERTIFIED                 │
   (export gate   │  ship it, labelled honestly   │  the premium tier / moat   │
    + security)   │  "behaviour not yet proven"   │  "proven to improve agents"│
            YES   │  ← 157 skills live here today  │  ← the goal for the top set │
                  ├──────────────────────────────┼───────────────────────────┤
            NO    │  EXCLUDED / QUARANTINED        │  (impossible — can't certify│
                  │  fails structural/privacy/sec │   what you won't ship)      │
                  └──────────────────────────────┴───────────────────────────┘
```

Conflating the two axes forces a bad choice: either gate publishing on the vertical-AND-horizontal corner (empty shelf) or ignore the horizontal axis (unranked flood). Keeping them orthogonal lets the safe set ship **now** while the certified set grows underneath it.

## Analogies (pick whichever lands)

| Domain | "Publishable" (safe to ship) | "Certified" (proven quality) |
|---|---|---|
| npm | package is published / installable | passing `npm audit` + provenance + verified-publisher badge |
| App Store | app is available | "Editor's Choice" |
| Docker Hub | image exists | "Verified Publisher" / "Official Image" |
| Academia | preprint posted | peer-reviewed |
| Restaurants | passes the health inspection (legal to sell food) | Michelin star |

In every case the two are orthogonal: passing inspection does not make you Michelin-starred, and the customer benefits from being able to see *which* shelf an item is on.

---

## Why it matters for this project, right now

- **It unblocks shipping.** With 157/158 `UNVERIFIED`, a single "ready = certified" bar means the marketplace stays near-empty until the Behaviour Gate drains. Two states let the structurally-sound, safe, non-malicious set ship immediately, labelled honestly, while the certified tier fills in (via the application-verdict runner already in flight — SH-6624 / `sh6624-application-verdict-runner.md`).
- **It is the product differentiator.** Native marketplaces (ClawHub et al.) ship publishable-only with no behavioural certification and suffer dilution. The certified tier is the moat (Gemini's roundtable framing); the consumer filter is *how a user sees the moat*. Without surfacing the verdict, the moat is invisible and therefore worthless as positioning.
- **It honours existing doctrine.** `application_verdict: UNVERIFIED` is "the honest default, not a defect" (`SKILL_AUDIT_LOOP.md`). A visible filter turns that honesty into a feature instead of a hidden embarrassment. And it enforces `version-schema-contract.md` rule 6 ("never present carries-the-label as verified") at the product surface, not just internally.

---

## Implementation sketch (NOT part of this proposal's approval — for scoping only)

1. **Derive, don't author, a `release_state`.** Compute at export/manifest time: `certified` if `application_verdict: APPLICABLE`; else `publishable` if it passes the export gate; else excluded/`quarantined`. No new hand-authored field — it derives from primitives that already exist.
2. **Carry the verdict into the public surface.** Add `application_verdict` (or a coarsened `certified: true/false` badge) to the exported `metadata` block so `skills.sh` pages and the README generator can group/badge it. This is the one real pipeline change.
3. **Group the generated READMEs by state.** A "✅ Behaviourally certified" section above an "Available (behaviour unverified)" section, reusing the existing `marketplace_priority` ordering within each.
4. **Add a `by_release_state` manifest facet** (alongside the existing `by_stability` / `by_application`) for programmatic consumer filtering.
5. **Write the policy** into `docs/publish-workflow.md` (publishable ≠ certified) and link it from `positioning-vs-marketplaces.md` as the differentiator vs native marketplaces.

Each of the above is SYSTEM-mode and independent; none requires the Behaviour Gate to be fully drained first — that is the entire point.

## Open questions for the user

- **Badge granularity:** expose the full `application_verdict` enum (`APPLICABLE`/`PROVISIONAL`/`UNVERIFIED`/`REDUNDANT`/`HARMFUL`/`MIXED`/`FALSE_POSITIVE`) to consumers, or coarsen to a single `certified` boolean + an internal detail? (Exposing `HARMFUL` publicly may be undesirable — though such a skill should fail the export gate anyway.)
- **Do `PROVISIONAL` skills get a distinct middle badge** ("self-assessed, not independently graded"), or do they group with `UNVERIFIED` on the public surface? The confidence-tier ordering `APPLICABLE > PROVISIONAL > UNVERIFIED` (`docs/verdict-semantics.md`) suggests a three-tier badge is honest.

## Related

- Roundtable synthesis: `~/Development/.roundtable/skill-graph-2026-05-30/SYNTHESIS.md`
- Behaviour Gate engine (recommendation #1): `~/Development/docs/plans/sh6624-application-verdict-runner.md`
- `docs/verdict-semantics.md` (eligibility vs assessment; verdict definitions)
- `docs/publish-workflow.md` (the export gate = today's implicit "publishable")
- `docs/positioning-vs-marketplaces.md` (where the differentiator argument lives)
- `.claude/rules/version-schema-contract.md` rule 6 (label ≠ verified)
