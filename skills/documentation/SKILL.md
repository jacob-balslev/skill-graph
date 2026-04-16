---
schema_version: 1
name: documentation
description: Documentation skill for choosing the right doc type, structuring technical explanation, and keeping system knowledge readable and durable. Use when writing reference docs, guides, specs, or architecture notes. Do NOT use for runtime debugging or UI accessibility behavior.
version: 1.0.0
type: capability
family: knowledge
scope: generic
owner: maintainer
freshness: "2026-04-15"
drift_check: "2026-04-15"
eval_status: pending
stability: experimental
license: MIT
compatibility: Markdown, Git
allowed-tools: Read Grep
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
    - a11y
  boundary:
    - debugging
  verify_with:
    - a11y
portability:
  level: high
  exports:
    - agent-skills
    - cursor
    - windsurf
    - copilot
---

# Documentation

## Coverage

Document type selection, audience fit, progressive disclosure, and docs-as-code discipline.

## Philosophy

Good documentation is not just correct text. It is the right kind of document for the reader's need.

## Verification

- [ ] The document matches its intended purpose
- [ ] The audience is clear
- [ ] The most important information appears early
- [ ] Stated facts are verifiable against the source of truth

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| `documentation` | `debugging` | Debugging is about failure diagnosis, not knowledge packaging |
