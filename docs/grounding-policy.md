# Grounding Policy — When an Ambient Skill MUST Ground Its Claims

> Type: Reference (SYSTEM doctrine). Created 2026-06-07 (SKI-289).
> Companion to `skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md` § Classification (`public` / `project[]`),
> `docs/verdict-semantics.md` (`truth_verdict`), and the `epistemic-grounding` skill.
> Authoritative for the audit loop's grounding requirement; the schema enforces the
> `non-empty project[] ⇒ grounding` half mechanically, this doc defines the
> ambient-subset (no `project[]`) half that the audit loop (`/audit:improve`, Truth Gate) enforces by judgment.

## The problem this policy solves

The schema (`schemas/SKILL_METADATA_PROTOCOL_schema.json`) mandates a populated `grounding`
block **only** for skills with a non-empty `project[]` (project-anchored). That rule is correct but incomplete: it
leaves every ambient skill (no `project[]`) ungrounded by default, including ambient skills that make
**concrete, externally-checkable claims** (specific API signatures, framework behaviors,
file-structure conventions, named tool flags, version-specific facts). Those claims rot, drift,
and hallucinate exactly like project claims do — absence of project anchoring does not make a claim self-verifying.

Corpus state at authoring (2026-06-07, 170 skills, grounded via `grounding` block presence with content):

| anchoring (2026-06-07 snapshot) | total | grounded | ungrounded |
|---|---|---|---|
| project-anchored (`project[]` non-empty) | 4 | 4 | 0 |
| ambient (`project[]` empty) | 166 | 65 | **101** |

All 101 ungrounded skills are ambient. The question this policy answers: **of those 101, which
legitimately need NO grounding (pure methodology) and which MUST ground (concrete
implementation claims)?**

## The two-axis test

Grounding obligation is determined by **what kind of claims the skill makes**, not by where it
deploys. A skill MUST ground when it asserts facts that an external truth source could confirm or
refute. A skill is grounding-exempt when its content is a reasoning discipline, mental model, or
heuristic whose validity does not depend on any current external artifact.

### Axis 1 — project anchoring (`project[]`)

| Project anchoring | Grounding obligation |
|---|---|
| Anchored (non-empty `project[]`) | **MUST ground.** Already schema-enforced. `grounding.subject_matter` + `truth_sources` naming the project's real files/contracts. |
| Ambient (no `project[]`) | Determined by Axis 2 below. |

### Axis 2 — claim kind (applies to ambient skills)

| Claim kind the skill's body makes | Grounding obligation | Why |
|---|---|---|
| **Concrete implementation claims** — specific API signatures, framework/library behaviors, file or repo-structure conventions, named CLI flags, protocol/RFC specifics, version-dependent facts, anything a reader could check against a doc or codebase | **MUST ground** (`grounding_mode: "external_docs"` or `"reference_implementation"`; `truth_sources` naming the docs/spec/reference repo; `failure_modes` naming how the claim drifts) | The claim is falsifiable against an external artifact that changes over time. Ungrounded, it silently becomes wrong. This is the `epistemic-grounding` "source-to-claim warrant" requirement applied at the skill level. |
| **Pure methodology** — reasoning frameworks, mental models, decision heuristics, doctrine, classification taxonomies whose validity is conceptual, not empirical | **Grounding-exempt** (no `grounding` block required; the `scope` field's scope statement is sufficient) | The content is a way of thinking, not a fact about a system. There is no external truth source to drift against; demanding `truth_sources` would force ceremonial or fabricated citations, which is worse than honest exemption (per `epistemic-grounding`: a citation that does not support a checkable claim is noise). |

## Subject-level default mapping

`subject` is a strong (not absolute) proxy for claim kind. Use this table as the **default**
obligation per subject; an individual skill overrides the default when its actual body content
disagrees (a methodology skill that happens to make concrete tool claims MUST ground those
specific claims; a nominally engineering skill that is purely conceptual may be exempt).

| `subject` | Default obligation | Rationale |
|---|---|---|
| `backend-engineering` | **MUST ground** | Asserts API/DB/protocol behaviors checkable against docs + code |
| `frontend-engineering` | **MUST ground** | Asserts framework/render/component behaviors checkable against docs + code |
| `data-engineering` | **MUST ground** | Asserts schema/migration/query/replication behaviors checkable against docs + engines |
| `ai-engineering` | **MUST ground** | Asserts model/eval/tooling behaviors that are version- and provider-specific |
| `quality-assurance` | **MUST ground** (per-skill) | Testing/security/perf skills that name concrete tools/flags MUST ground; conceptual QA doctrine (e.g. cognitive-load review) is exempt |
| `design` | **MUST ground** (per-skill) | Implementation-oriented design skills (dark-mode, theme-system, layout, visual tokens) make concrete CSS/framework claims → ground; pure design-thinking/ideation/research-method skills are exempt |
| `software-architecture` | **MUST ground** (per-skill) | Skills naming concrete modeling notations/contracts/tools ground them; abstract architecture doctrine is exempt |
| `agent-ops` | **MUST ground** (per-skill) | Skills referencing concrete runtime/loop/tool mechanisms ground them; pure agent doctrine is exempt |
| `reasoning-strategy` | **Exempt** (default) | Mental models, strategy frameworks (Five Forces, SWOT, OKRs, Bayesian reasoning) — conceptual, not empirical |
| `software-engineering-method` | **Exempt** (default) | Execution disciplines, methodology, naming, prioritization — conceptual; ground only the specific tool claim if one appears |
| `knowledge-organization` | **Exempt** (default) | Taxonomy/semantics/ontology disciplines — conceptual |
| `product-domain` | **Exempt** (default) | Personas, market/positioning concepts — conceptual; concrete platform skills (shopify, etsy, printify) are the exception and MUST ground |

## How a grounded ambient skill records its grounding

Reuse the existing `grounding` block shape (no schema change — this policy uses fields the schema
already permits on ambient skills):

```yaml
grounding:
  subject_matter: "what the skill's concrete claims are about"
  grounding_mode: "external_docs"            # or reference_implementation / repo_specific
  truth_sources:
    - "https://vendor.example/docs/api"      # the doc/spec that confirms the claims
    - "path/to/reference/implementation"     # or a reference repo/file
  failure_modes:
    - claim_drifts_when_vendor_bumps_major_version
    - flag_name_changed_upstream
```

## Relationship to the Truth Gate (`truth_verdict`)

This policy is the **eligibility rule** for the Truth Gate, not a replacement for it. A
must-ground skill that lacks grounding fails the Truth Gate (`truth_verdict` cannot reach `PASS`
without verifiable sources). A grounding-exempt skill is not penalized by the Truth Gate for
having no `grounding` block — its truth verdict is assessed against its conceptual claims and the
`scope` statement. See `docs/verdict-semantics.md`.

## Enforcement

- **Schema (mechanical):** non-empty `project[]` ⇒ `grounding` — already enforced (schema `allOf`).
- **Audit loop (judgment):** `/audit:improve` and the Truth Gate apply the Axis-2 / subject-default
  table above to ambient skills. A must-ground ambient skill with no grounding is a Truth Gate
  finding, drained via `/audit:improve`.
- **This is a policy doc, not a codemod.** Per `.claude/rules/version-schema-contract.md`, the
  must-ground ambient skills are migrated **through the audit loop, one skill per pass**, not by a
  bulk frontmatter edit. The CONTENT drain set is enumerated and queued separately (SKI-289 CONTENT half).

## The must-ground drain (CONTENT half — enumerated, queued separately)

The CONTENT half of SKI-289 enumerates the subset of the 101 ungrounded ambient skills whose
subject default is MUST-ground (engineering + concrete platform/QA/design subjects) and queues
them for `/audit:improve` grounding. The seed manifest lives at
`.opencode/progress/skill-audit-drain-must-ground.json`. Per-skill grounding decisions still defer
to actual body content (a conceptual skill inside a must-ground subject is exempted by the auditor
at drain time).
