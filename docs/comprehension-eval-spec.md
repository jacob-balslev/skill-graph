# Comprehension Eval Spec — `skills/<name>/evals/comprehension.json`

> Type: Reference (binding spec)
> Authored: 2026-05-25 (closes the highest-priority canonicalization gap from the 2026-05-25 multi-model review: Opus G2#3 CRITICAL, GPT-5.5 G3#1 PARTIAL)
> Schema: [`skill-graph/schemas/comprehension.schema.json`](../schemas/comprehension.schema.json)
> Provenance: ADR-0011 (four-verdict Audit Status) defines `comprehension_verdict`; this doc defines the artifact the comprehension grader (gate 8) evaluates against; ADR-0015 + the false-canonicality verifier at `skill-graph/scripts/check-audit-manifest.js` enforce its presence when `comprehension_verdict ∈ {PROVISIONAL, PASS, SHALLOW, REDUNDANT}`.

## What this artifact is

`comprehension.json` is a per-skill **gradeable comprehension eval**. It enumerates 5–7+ realistic scenarios that exercise the skill's specific judgment across the rubric dimensions, dimension-tagged so the grader can score per-dimension and produce a `comprehension_verdict` (PASS / SHALLOW / REDUNDANT / PROVISIONAL).

**File location:** `skills/<name>/evals/comprehension.json` (workspace canonical; the skill-graph verifier resolves this path via `--workspace` flag).

**Reader:** gate 8 (the comprehension grader at `skill-graph/lib/audit/graders/concept-grader-prompt.md`).

**Enforcement:** `skill-graph/scripts/check-audit-manifest.js` fails with exit 1 if the SKILL.md's `comprehension_verdict` is in the graded set `{PROVISIONAL, PASS, SHALLOW, REDUNDANT}` but the file is absent or unparseable.

## File shape (binding)

The shape is normative — `skill-graph/schemas/comprehension.schema.json` is the source of truth and validates every field, enum, and constraint described below.

### Top-level fields

| Field | Required | Type | Description |
|---|---|---|---|
| `skill_name` | yes | kebab-case string | MUST match the parent directory and the SKILL.md `name:` field. |
| `subject` | yes | string | Human-readable subject (e.g., "Methodical Execution"). Used by the grader prompt header. |
| `adjacent_concepts` | no | string[] | Related skill names for boundary-check cases. Recommended. |
| `evals` | yes | array | 5+ eval cases. 7 is the practitioner default (one per rubric dimension). |

### Per-case fields

| Field | Required | Type | Description |
|---|---|---|---|
| `id` | yes | integer | Stable, unique within the file. |
| `dimension` | yes | enum | One of: `definition`, `mental_model`, `purpose`, `boundary`, `taxonomy`, `analogy`, `application`, `misconception`. |
| `prompt` | yes | string | The scenario. Must require the skill's judgment to answer correctly. |
| `substance` | yes | enum | `concept` / `procedure` / `boundary` — what kind of knowledge is probed. |
| `calibration` | yes | enum | `semantic` (paraphrase OK) / `exact-match` / `structural`. |
| `truth_mode` | yes | enum | `conceptual_correctness`, `conceptual_correctness_plus_repo_application`, `spec_grounded`, `principle_grounded`. |
| `skill_type` | yes | enum | `concept` / `procedure` / `router` / `overlay`. Maps to SKILL.md `type`. |
| `criticality` | yes | enum | `critical` / `high` / `medium` / `low`. |
| `negative_expectation` | no | string | What the answer must NOT say. Recommended for `boundary` + `critical` cases. |

## The 7 rubric dimensions

Each dimension probes a different layer of comprehension. A complete eval set covers all 7:

| Dimension | What it tests | When to write a case |
|---|---|---|
| **definition** | Does the agent know what the skill is? | Always — first case in most files. |
| **mental_model** | Does the agent have the right mental model of the concept? | Always — the model is what transfers, not the prose. |
| **purpose** | Does the agent know WHY the skill exists / what problem it solves? | Always — purposeless skill = pattern-match risk. |
| **boundary** | Does the agent know where the skill stops and other skills begin? | Always — boundary failures are the most common routing bug. |
| **taxonomy** | Does the agent know how the skill's concepts decompose / relate? | When the skill has a non-trivial internal structure. |
| **analogy** | Does the agent have a transferable mental anchor (analogy / metaphor)? | When teaching efficacy depends on a single sticky image. |
| **application** | Can the agent apply the skill to a NOVEL scenario (not in the skill body)? | Always — the application case is the gate-8 signal. |
| **misconception** | Can the agent name + correct the most common wrong reading? | Recommended; surfaces silent failure modes. |

The schema's `dimension` enum includes `misconception`; the corpus has not yet adopted it as of 2026-05-25 (Opus's audit found 0 cases). New authoring SHOULD include a misconception case.

## Minimum vs. recommended

- **Hard floor: 5 cases.** Per SKILL_AUDIT_LOOP.md § Part 3 — Per-Skill Audit Runbook § 4c. Below 5, the verifier fails with a dimension-coverage error.
- **Practitioner default: 7 cases**, one per rubric dimension. Catches per-dimension `SHALLOW` failures the 5-case minimum cannot.
- **Robust: 9–12 cases.** Adds 2–5 application cases probing different novel scenarios.

## Worked example (abbreviated)

```json
{
  "skill_name": "methodical",
  "subject": "Methodical Execution",
  "adjacent_concepts": ["intellectual honesty", "quality-doctrine", "task-execution", "self-review-pattern"],
  "evals": [
    {
      "id": 1,
      "dimension": "definition",
      "prompt": "Define the 'Complete Before Summarize' rule and explain why LLM summarization bias makes it necessary.",
      "substance": "concept",
      "calibration": "semantic",
      "truth_mode": "conceptual_correctness_plus_repo_application",
      "skill_type": "concept",
      "criticality": "high"
    },
    {
      "id": 4,
      "dimension": "boundary",
      "prompt": "If an agent needs to know the architecture constraints of a React component, which skill should it consult — methodical, quality-doctrine, or self-review-pattern? Defend the choice.",
      "substance": "boundary",
      "calibration": "semantic",
      "truth_mode": "conceptual_correctness_plus_repo_application",
      "skill_type": "concept",
      "criticality": "critical",
      "negative_expectation": "Must not say 'methodical' — methodical owns the disciplined-execution protocol, not architectural knowledge of React components. The correct answer routes to a React-specific skill."
    }
  ]
}
```

Full live example: `skills/methodical/evals/comprehension.json` (7 cases, 6 dimensions covered).

## Validation

Validate locally:

```bash
node -e "const schema=require('./skill-graph/schemas/comprehension.schema.json');const f=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));console.log('skill_name:',f.skill_name,'evals:',f.evals.length);"
node skill-graph/scripts/check-audit-manifest.js --limit 1
```

The verifier walks every skill's most-recent verdicts; a graded comprehension_verdict without this artifact is a FAIL.

## Anti-patterns

| Anti-pattern | Why it fails |
|---|---|
| Single-dimension file (all cases `definition`) | Misses 6 rubric dimensions; grader will record `SHALLOW`. |
| Eval that paraphrases SKILL.md back to itself | Tests the prose, not comprehension; will record `REDUNDANT`. |
| Below 5 cases | Below the hard floor; verifier fails. |
| `criticality: critical` without `negative_expectation` | Critical cases must be unambiguous about what disqualifies an answer. |
| `dimension: application` case that's a known-from-body scenario | Application MUST be novel — not a quoted use-case from the skill body. |

## Related

- [`skill-graph/SKILL_AUDIT_LOOP.md`](../SKILL_AUDIT_LOOP.md) — gate 8 (comprehension grader) doctrine.
- [`skill-graph/SKILL_AUDIT_LOOP.md#part-3--per-skill-audit-runbook`](../SKILL_AUDIT_LOOP.md#part-3--per-skill-audit-runbook) § Step 4c — the audit-loop step that authors / refreshes this file.
- [`skill-graph/lib/audit/graders/concept-grader-prompt.md`](../lib/audit/graders/concept-grader-prompt.md) — the grader the verdict is earned against.
- ADR-0011 — four-verdict Audit Status; defines `comprehension_verdict` semantics.
- ADR-0015 — project-owned operational prompts; the verifier the schema gates.
- `.claude/rules/version-schema-contract.md` § 5 — the `PROVISIONAL` vs `UNVERIFIED` confidence hierarchy this artifact's existence enables.
