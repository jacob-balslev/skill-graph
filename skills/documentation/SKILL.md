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
