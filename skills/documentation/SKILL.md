---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v3.schema.json
schema_version: 3
name: documentation
description: "Use when writing reference docs, guides, tutorials, specs, architecture notes, or any durable technical prose that a future reader has to trust. Covers doc-type selection, audience fit, progressive disclosure, docs-as-code workflow, freshness and drift tracking, and source-of-truth discipline. Do NOT use for runtime debugging, UI accessibility behavior, or behavior-preserving code refactor."
version: 1.0.0
type: capability
browse_category: knowledge
scope: portable
owner: jacob-balslev
freshness: "2026-04-18"
drift_check:
  last_verified: "2026-04-18"
eval_artifacts: present
eval_state: passing
routing_eval: absent
stability: experimental
license: MIT
compatibility:
  notes: "Markdown, Git"
allowed-tools: Read Grep
keywords:
  - documentation
  - reference doc
  - guide
  - tutorial
  - how-to
  - architecture note
  - explain to reader
  - doc type
  - stale docs
  - doc drift
  - spec
  - update the readme
  - document this function
  - write api docs
  - doc this
  - add a comment block
triggers:
  - documentation-skill
examples:
  - "write an API reference for this new route handler"
  - "the README has drifted from the actual CLI flags — which wins?"
  - "draft an architecture note explaining why we chose Postgres over DynamoDB"
  - "this tutorial is too terse for a beginner — expand it with progressive disclosure"
anti_examples:
  - "the test suite is failing after my change — find the cause"  # debugging owns failure chasing
  - "add an aria-label to this icon button"                       # a11y owns assistive-tech behavior
  - "extract this repeated string-concat into a helper function"   # refactor owns behavior-preserving code changes
relations:
  boundary:
    - skill: debugging
      reason: "debugging chases a specific failure; documentation builds durable reference prose"
    - skill: a11y
      reason: "a11y covers assistive-tech behavior; documentation covers prose reading-level and audience fit"
    - skill: refactor
      reason: "refactor owns behavior-preserving code changes; documentation owns the prose that describes them"
portability:
  readiness: scripted
  targets:
    - agent-skills
---

# Documentation

## Coverage

- Document type selection: deciding between reference doc, tutorial, guide, how-to, and architecture note based on the reader's need
- Audience fit: matching depth, vocabulary, and assumed context to the intended reader
- Progressive disclosure: ordering information so the most important facts appear first and detail unfolds on demand
- Docs-as-code workflow: keeping documentation in the repo, versioned alongside the code it describes, and reviewed in the same pull requests
- Freshness and drift: recognizing when documented behavior has diverged from real behavior and treating drift as a bug
- Source-of-truth discipline: citing verifiable sources and avoiding restatement of content that lives authoritatively elsewhere

## Philosophy

Documentation is a product, not a deliverable. It is consumed under time pressure by someone who did not write it, and it ages against a codebase that moves without asking permission. The test of good documentation is a single question: does the reader reach the correct mental model faster by reading the doc than by reading the code? Everything else — format, length, voice, tone — follows from that one test. Docs that fail it waste everyone's time twice: the writer's on the way in, and every reader's on the way out.

## Doc-Type Selection

Pick the doc type by the reader's need, not by the author's content. A reader looking for "how do I do X" will not read a reference; a reader looking up a field will not read a tutorial. The wrong type is worse than a missing doc because it consumes attention before failing.

| Reader's need right now | Doc type | Primary test |
|---|---|---|
| "What does this field / function / endpoint do?" | **Reference** | Can a reader look up any symbol in under 30 seconds and get the complete definition? |
| "I am new to this system — walk me through it" | **Tutorial** | Does a first-time reader following step-by-step reach a working end state without unexplained jumps? |
| "I need to accomplish task X; just tell me how" | **How-to** | Does the doc solve one specific task, and can the reader execute it without reading anything else? |
| "I need to understand how this system works" | **Explanation / guide** | Does the reader leave with the right mental model — not just facts but why the design is this way? |
| "Where are we headed / why did we pick X over Y?" | **Architecture note / ADR** | Does the reader see the decision, the alternatives considered, and the constraints that forced the choice? |
| "What does this one thing mean?" (glossary term) | **Glossary entry** | Is the definition self-contained and free of forward references to other glossary terms? |

### Anti-patterns per type

- **Reference that tutorials** — inlining walkthroughs into API docs. Fix: extract the walkthrough to a separate tutorial page and link to it.
- **Tutorial that references** — interrupting flow with "see the full API docs for all options." Fix: link at the end, not mid-step.
- **How-to that explains** — "before we do this, let's understand how X works." Fix: cut it; add a "Background" link for readers who need it.
- **Explanation that how-tos** — mixing mental-model prose with step-by-step procedure. Fix: separate the two; each gets its own page.

## Docs-as-Code Workflow

Docs live in the same repository as the code they describe, ship through the same pull request, and pass the same automated gates. The workflow is not a style preference — it is the only arrangement that keeps documentation accountable to the code it claims to describe, because it forces every code change to confront its documentation at review time rather than at some deferred future sprint.

| Stage | Rule for code | Rule for docs |
|---|---|---|
| Source location | In the repo | In the same repo — not a separate wiki, not a hosted doc service, not a confluence page |
| Authoring context | Open in the same editor | Open in the same editor — authored alongside the change, not after it |
| Review | Required on the PR that changes the code | Required on the **same** PR that changes the code — not a follow-up ticket |
| CI gate | Tests must pass | Link-check, freshness check, and spelling gate must pass |
| Versioning | Git history | Git history — the doc's past is a `git log`, not a migration story |
| Deploy | The release pipeline ships it | The same release pipeline publishes the docs — no separate "docs site" release cadence |

**Anti-patterns.**

- **Docs in a separate system** (wiki, confluence, notion). The system's access model, version history, and review workflow diverge from the code's, and the docs become un-reviewable. Fix: move them to the repo.
- **"I'll document this in a follow-up ticket"** after shipping code. The follow-up never happens. Fix: the PR that ships the code ships the docs, or it doesn't ship.
- **No CI gate on doc freshness or link integrity.** Broken links accumulate silently. Fix: add `lychee`, `markdownlint`, or an equivalent to CI and block the merge on failures.
- **Doc site deploy cadence that lags code deploy cadence.** A user can read a doc that describes behavior the deployed code no longer has. Fix: the same deploy ships both.

## Freshness and Drift

Documented behavior diverges from real behavior over time. That is drift, and drift is a bug. The reader's contract with the doc is "what is written here is true right now" — a stale doc does not inform, it misleads, and being misled is worse than having no doc. The owner of the doc is responsible for keeping it current; "the user should have known that was old" is not an excuse, it is an admission that the doc failed its one job.

| Drift symptom | Most likely cause | Fix |
|---|---|---|
| README shows CLI flags the actual binary rejects | Code changed, doc didn't | Regenerate from `--help` output or re-sync by hand; add a CI check that diffs the two |
| Tutorial commands fail on a fresh checkout | Dependencies, env vars, or bootstrap steps changed | Re-run the tutorial end-to-end on a clean machine; update every step that broke |
| Architecture doc references a service that was replaced | Service was renamed, decomposed, or deleted | Rewrite the section; add a "superseded by" note linking to the new canonical doc |
| "See X for details" points at a moved or deleted file | File was renamed, moved, or deleted | Fix the link; run a link-checker as a pre-commit gate so future renames fail loudly |
| Field table lists options the code no longer supports | Options were removed without sweeping the docs | Generate the field table from the schema or config; manual field tables always drift |

**Drift detection rules.**

- **Touch code → touch its docs.** If the change alters behavior a doc describes, update the doc in the same commit. Code review must block otherwise.
- **Prefer generation over restatement.** A field table derived from a JSON Schema cannot drift. A hand-typed one always does.
- **Record last-verified dates.** When a doc cannot be generated, record when it was last confirmed against the code (e.g., a `last_verified: 2026-04-19` comment). Readers can then judge trust by date, and authors have a scheduled nudge to re-verify.
- **Treat stale docs as blockers.** Drift is not a cosmetic issue to defer; it is a correctness issue to fix before the next feature merges.

## Source-of-Truth Discipline

Every fact has exactly one canonical location. Restating that fact anywhere else creates a drift surface — two copies will eventually disagree, and the reader cannot tell which is authoritative. The default move is to link to the source of truth, not to paraphrase it. Duplication is a cost; justify it before paying it.

| Fact lives in | Correct doc treatment | Incorrect doc treatment |
|---|---|---|
| A JSON Schema | Link to the schema, or generate the field table from it | Hand-write a separate field table that will drift |
| An OpenAPI / GraphQL spec | Embed or reference the spec; generate endpoint docs from it | Hand-write a table of endpoints that will drift |
| A config file | Show the actual file in a code block; link to it | Paraphrase the config prose; copy key names into sentences |
| A migration / SQL file | Link to the file by permalink | Restate the migration steps in prose |
| A dependency's own docs | Link to the upstream canonical page | Copy-paste upstream content into this doc |

**When duplication is justified.**

- **Self-contained short docs** that a reader needs to use offline or without following links. Mark the duplicate explicitly: `Mirrored from <source>, last verified YYYY-MM-DD.`
- **Quoted excerpts** for illustration. Keep them short and cite the source.
- **Derived summaries** that compress the canonical source for a different audience. The derivation must be one-way (summary → source), and the summary should be regenerated from the source when the source changes.

**Anti-patterns.**

- **"Keep this in sync with X" comments.** These comments do not prevent drift; they document drift that will happen.
- **Re-stating file paths or function signatures in prose.** Renames break the prose silently. Link to the file/symbol via a permalink or a symbol-resolving system.
- **Paraphrasing a config file.** The config file is already authored prose for its reader — duplicating it in English is just adding a second source with a lower update frequency.
- **"See X for the full truth"** when you have partially restated X above. Either fully defer to X (link only) or fully mirror it (and take on the maintenance). The middle option — partial restate — is where drift lives.

## Evals

This skill ships a comprehension-eval artifact at [`examples/evals/comprehension.json`](../../examples/evals/comprehension.json). The `Verification` checklist below is the authoring gate for a new doc; the eval file is how this skill is graded by `scripts/skill-audit.js --graded`. Do not conflate them — the checklist is for writers, the eval is for the grader.

## Relations Rationale

This skill declares `boundary` relations only. `verify_with` is intentionally empty: doc-drift detection and link-checking are owned by CI tools (`lychee`, `markdownlint`, generated-from-schema checks) that live outside the Skill Graph rather than by sibling skills. Adding a `verify_with` entry that points at `lint-overlay` or `testing-strategy` would misrepresent the relation — those skills govern code-lint gate selection and test-level decisions, not prose freshness or link integrity. If a future `doc-freshness` or `link-check` skill is authored, that is where `verify_with` should point.

## Verification

- [ ] The document matches its intended purpose
- [ ] The audience is clear
- [ ] The most important information appears early
- [ ] Stated facts are verifiable against the source of truth
- [ ] The document does not restate content that lives authoritatively elsewhere

## Do NOT Use When

| Use instead | When |
|---|---|
| `debugging` | The task is failure diagnosis, not knowledge packaging |
| `a11y` | The task is interaction behavior and assistive-tech affordances, not prose structure |
| `refactor` | The task is behavior-preserving code cleanup — even when the refactor should be documented, the documenting is separate work |
