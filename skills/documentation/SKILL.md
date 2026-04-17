---
schema_version: 2
name: documentation
description: "Use when writing reference docs, guides, tutorials, specs, architecture notes, or any durable technical prose that a future reader has to trust. Covers doc-type selection, audience fit, progressive disclosure, docs-as-code workflow, freshness and drift tracking, and source-of-truth discipline. Do NOT use for runtime debugging, UI accessibility behavior, or behavior-preserving code refactor."
version: 1.0.0
type: capability
family: knowledge
scope: portable
owner: maintainer
freshness: "2026-04-17"
drift_check: "2026-04-17"
eval_artifacts: present
eval_state: passing
routing_eval: absent
stability: experimental
license: MIT
compatibility: Markdown, Git
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
relations:
  adjacent:
    - testing-strategy
    - refactor
  boundary:
    - debugging
    - a11y
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

## Evals

This skill ships a comprehension-eval artifact at [`examples/evals/comprehension.json`](../../examples/evals/comprehension.json). The `Verification` checklist below is the authoring gate for a new doc; the eval file is how this skill is graded by `scripts/skill-audit.js --graded`. Do not conflate them — the checklist is for writers, the eval is for the grader.

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
