# Publishing and Quality Are Two Separate Questions

> Status: orientation doc. Corrects a confused recommendation from the 2026-05-30 Skill Graph roundtable. Full record: `~/Development/.roundtable/skill-graph-2026-05-30/SYNTHESIS.md`.
> History: rewritten 2026-06-02 from the retracted `proposals/release-states-and-consumer-verdict-filter.md` (renamed via `git mv`).
> Last verified against code: 2026-06-02.

## Why this doc exists (the correction)

The roundtable's recommendation #2 said: *"split release states: marketplace-publishable vs behaviorally-certified; expose verdict as a consumer filter."* That was wrong. It glued together **two questions that belong to two different systems**, as if they were two settings on one dial. They are not. And both of the things it described **already exist**. This doc states the two questions plainly so the mistake is not repeated.

## The two questions

Every skill (a small instruction manual you hand the AI) gets asked two unrelated questions:

### Question 1 — "Can this skill go on the public internet?"

A **publishing and security** question. It has nothing to do with whether the skill is any good. Two checks decide it, and **both already exist and run today**:

- **Is it general-purpose, or tied to your private business?** A skill like "how to write a good React hook" is general and can be shared. A skill about Sales Hub / Printify / your internal database is private and must stay home. The field that records this is `deployment_target` (`portable` = shareable, `project` = private to one project). The publisher refuses anything marked `project`.
  - Code: `scripts/export-marketplace-skills.js:353-381` (also blocks legacy `scope` values and `grounding.grounding_mode: repo_specific` / `repo_internal`).
- **Does it leak secrets?** A scanner reads the whole skill and blocks it if it finds emails, API keys, tokens, private file paths, internal table names, etc.
  - Code: `scripts/lib/privacy-patterns.js`, run as a layered gate (export-time, pre-push hook, CI) per `docs/adr/0012-internal-skill-library-separation.md`.

So Question 1 = *general-purpose AND no secrets → safe to open-source.* Pure distribution + safety. Quality is never read here (verified: the exporter reads no quality verdict; it only blocks a skill that is structurally broken — `structural_verdict: FAIL` — which is a validity check, not a quality one).

### Question 2 — "Is this skill actually any good?"

A **quality** question, owned entirely by the **Audit & Evaluation system** (the part of the project that maintains and grades skills). It has nothing to do with publishing.

The way it works: run a real task **with** the skill and **without** it, and check whether the skill actually made the AI do better. The result is stored as a label called `application_verdict`:

- `APPLICABLE` — tested, and it genuinely helps. (This is what the roundtable cryptically called "behaviorally-certified.")
- `UNVERIFIED` — nobody has run the test yet. True for roughly 157 of the 158 skills today. This is the honest default, not a failure.
- (Other values record tested-but-no-help, tested-but-harmful, etc. — see `docs/verdict-semantics.md`.)

This label lives in a separate per-skill file (`audit-state.json`), is written only by the audit tools (`/audit:*`), and is the job of the part of the system called the Behavior Gate (the "does it change behavior the way it claims?" check), as opposed to the Integrity Gate (the "is it well-formed and honest?" check). Definitions: `docs/verdict-semantics.md`, `skill-audit-loop/SKILL_AUDIT_LOOP.md`, `schemas/skill-audit-state.schema.json`.

## The two questions are deliberately decoupled

This is not an accident to fix — it is a designed property:

- **Publishing does not depend on quality.** A skill can be published while still untested (`application_verdict: UNVERIFIED`). Per `docs/adr/0011-split-audit-verdict-into-four-verdicts.md`, untested skills are published **transparently labeled "behavior unvalidated"** rather than being held back. With ~157/158 untested, gating publication on quality would mean publishing almost nothing.
- **There is already a separate publication-priority field.** `marketplace_tier` (`S`/`A`/`B`/`C`, in `schemas/skill-audit-state.schema.json`) decides how prominently a published skill is featured. It is authored per skill and is **not derived from the quality label** — confirming the two concerns are kept apart on purpose.

```
  Question 1: can it go public?            Question 2: is it any good?
  (publishing + security)                  (quality)
  owner: export / marketplace pipeline     owner: Audit & Evaluation system
  fields: deployment_target,               field: application_verdict
          privacy/secret scanner                  (Behavior Gate, audit-state.json)
  status: BUILT, runs today                status: being built out (SH-6624 runner)
                         \                 /
                          these never gate each other (ADR-0011)
```

## What, if anything, is left of recommendation #2

Almost nothing — and that is the honest finding. Both systems exist; the publishing one is built, the quality one is in progress (the application-verdict runner, `~/Development/docs/plans/sh6624-application-verdict-runner.md`).

The one small residual idea: once skills start getting quality-tested, it could be worth **showing a person browsing the public marketplace which skills have been tested** (and which are still "behavior unvalidated"). Even this is partly anticipated — `marketplace_tier` already groups skills, and ADR-0011 already mandates the transparent "behavior unvalidated" label. So it is a minor surfacing tweak, not a new subsystem, and it is downstream of the quality work actually producing tested labels in the first place.

## Related

- Roundtable record + synthesis: `~/Development/.roundtable/skill-graph-2026-05-30/SYNTHESIS.md`
- Quality system (Question 2) engine: `~/Development/docs/plans/sh6624-application-verdict-runner.md`
- Publishing model (Question 1): `docs/publish-workflow.md`, `docs/adr/0012-internal-skill-library-separation.md`, `docs/adr/0017-five-axis-classification-model.md`
- Quality model (Question 2): `docs/verdict-semantics.md`, `docs/adr/0011-split-audit-verdict-into-four-verdicts.md`, `docs/adr/0019-audit-state-sidecar-separation.md`
