---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: form-ux-architecture
description: "Use when designing or auditing form structure and validation UX: field grouping, required vs optional inputs, validation timing, client/server validation split, submission lifecycle, recovery, multi-step forms, and high-risk data entry. Do NOT use for labels and announcements alone (use `a11y`), validation-message wording (use `microcopy`), API schema design (use `api-design`), or stored data modeling (use `data-modeling`)."
version: 1.0.0
type: capability
category: design
domain: design/ux
scope: portable
owner: skill-graph-maintainer
freshness: "2026-05-11"
drift_check:
  last_verified: "2026-05-11"
eval_artifacts: present
eval_state: unverified
routing_eval: absent
stability: experimental
license: MIT
compatibility:
  notes: "Portable form UX guidance for web and app forms. Client-side validation improves UX; server-side validation remains mandatory for trust and security."
allowed-tools: Read Grep
keywords:
  - form-ux
  - form architecture
  - validation timing
  - client server validation
  - field grouping
  - submission lifecycle
  - form recovery
  - multi-step forms
  - required optional fields
examples:
  - "design the validation lifecycle for this signup form"
  - "audit this checkout form for grouping, required fields, and recovery"
  - "should this be one form, a wizard, or progressive disclosure?"
  - "split client-side and server-side validation responsibilities for this form"
anti_examples:
  - "add labels so assistive tech can read each field"
  - "rewrite the inline validation messages"
  - "define the request and response schema for the form submit endpoint"
  - "model the database columns that store these inputs"
relations:
  boundary:
    - skill: a11y
      reason: "a11y owns labels, focus, fieldsets, errors, and assistive-tech behavior; form-ux-architecture owns form structure and validation lifecycle"
    - skill: microcopy
      reason: "microcopy owns validation-message wording; form-ux-architecture owns when validation appears and how users recover"
    - skill: api-design
      reason: "api-design owns submit endpoint schemas and error envelopes; form-ux-architecture owns the user-facing input and correction flow"
    - skill: data-modeling
      reason: "data-modeling owns stored data shape; form-ux-architecture owns collection and correction before submission"
  related:
    - interaction-patterns
    - interaction-feedback
    - task-analysis
    - a11y
    - microcopy
  verify_with:
    - a11y
    - microcopy
portability:
  readiness: scripted
  targets:
    - skill-md
lifecycle:
  stale_after_days: 365
  review_cadence: quarterly
---

# Form UX Architecture

## Coverage

Design form structure and validation behavior. Covers field grouping, labels as structure handoff, required vs optional decisions, progressive disclosure, defaults, input formats, client-side validation, server-side validation, validation timing, submit lifecycle, error recovery, multi-step forms, review steps, autosave, and high-risk data entry.

## Philosophy

Forms are not data dumps. A form is a guided conversation that asks only for information the system truly needs, at the moment the user can answer it, with correction paths that preserve trust.

Client-side validation is a user-experience aid, not a security boundary. The server must validate every submitted field even when the client appears correct.

## Method

1. Name the user goal and the minimum data needed to complete it.
2. Remove fields that are not needed now or cannot be acted on.
3. Group fields by user mental model, not database table.
4. Decide required, optional, defaulted, derived, and deferred fields.
5. Choose validation timing: on submit, on blur, on change, or after async check.
6. Split client-side validation from server-side validation and map server errors back to fields.
7. Define submit, pending, success, failure, retry, and partial-save behavior.
8. Hand off labels and announcements to `a11y`, wording to `microcopy`, and endpoint shape to `api-design`.

## Evals

This skill ships a comprehension-eval artifact at [`examples/evals/form-ux-architecture.json`](../../examples/evals/form-ux-architecture.json). The checklist below is the authoring gate for form UX architecture; the eval file is the grader surface.

## Verification

- [ ] Every field has a reason tied to the user's goal or system requirement
- [ ] Required fields are truly required at this step
- [ ] Field groups match how users think about the task
- [ ] Validation timing avoids hostile on-keystroke errors unless immediate feedback is necessary
- [ ] Client-side checks improve correction speed but do not replace server validation
- [ ] Server errors map back to fields or a clear form-level recovery path
- [ ] Submit, pending, success, failure, retry, and partial-save states are defined

## Do NOT Use When

| Use instead | When |
|---|---|
| `a11y` | The task is labels, fieldsets, focus, keyboard flow, or screen-reader announcement. |
| `microcopy` | The task is validation-message wording, placeholder text, button labels, or error copy. |
| `api-design` | The task is endpoint shape, request/response schema, status codes, or error envelope. |
| `data-modeling` | The task is persistence schema, constraints, keys, or data lifecycle. |
| `interaction-feedback` | The task is feedback state staging after the form action starts. |
