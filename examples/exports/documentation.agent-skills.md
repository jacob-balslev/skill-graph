---
name: documentation
description: "Documentation skill for choosing the right doc type, structuring technical explanation, and keeping system knowledge readable and durable. Use when writing reference docs, guides, specs, or architecture notes. Do NOT use for runtime debugging or UI accessibility behavior."
license: MIT
compatibility: "Markdown, Git"
allowed-tools: Read Grep
metadata:
  schema_version: 2
  version: "1.0.0"
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
  keywords:
    - documentation
    - docs
    - reference doc
    - guide
    - architecture note
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

Good documentation is not just correct text. It is the right kind of document for the reader's need, written at the right depth, and placed where the reader will actually find it.

## Verification

- [ ] The document matches its intended purpose
- [ ] The audience is clear
- [ ] The most important information appears early
- [ ] Stated facts are verifiable against the source of truth
- [ ] The document does not restate content that lives authoritatively elsewhere

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| `documentation` | `debugging` | Debugging is about failure diagnosis, not knowledge packaging |
| `documentation` | `a11y` | Accessibility covers interaction behavior and assistive-tech affordances; `documentation` covers prose structure and technical explanation |
| `documentation` | `refactor` | Refactor is for behavior-preserving code cleanup, not for rewriting docs that describe the code |
