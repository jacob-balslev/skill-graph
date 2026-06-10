---
name: form-ux-architecture
description: "Use when designing or auditing form structure and validation UX: field grouping, required vs optional inputs, validation timing, client/server validation split, submission lifecycle, recovery, multi-step forms, and high-risk data entry. Do NOT use for labels and announcements alone (use `a11y`), validation-message wording (use `microcopy`), API schema design (use `api-design`), or stored data modeling (use `data-modeling`). Do NOT use for add labels so assistive tech can read each field. Do NOT use for rewrite the inline validation messages. Do NOT use for define the request and response schema for the form submit endpoint. Do NOT use for model the database columns that store these inputs. Do NOT use for validation-message wording (use microcopy)."
license: MIT
allowed-tools: Read Grep
metadata:
  subject: design
  public: "true"
  taxonomy_domain: design/ux
  scope: "Designing and auditing form structure and validation UX — field grouping, required vs optional inputs, validation timing, the client/server validation split, the submission lifecycle, recovery, multi-step forms, and high-risk data entry. Portable across any form-bearing UI; principle-grounded, not repo-bound. Excludes labels and announcements alone (a11y), validation-message wording (microcopy), API schema design (api-design), and stored data modeling (data-modeling)."
  stability: experimental
  keywords: "[\"form-ux\",\"form architecture\",\"validation timing\",\"client server validation\",\"field grouping\",\"submission lifecycle\",\"form recovery\",\"multi-step forms\",\"required optional inputs\",\"error recovery flow\"]"
  triggers: "[\"form ux\",\"validation timing\",\"client server validation\",\"multi-step form\",\"form recovery\"]"
  examples: "[\"design the validation lifecycle for this signup form\",\"audit this checkout form for grouping, required fields, and recovery\",\"should this be one form, a wizard, or progressive disclosure?\",\"split client-side and server-side validation responsibilities for this form\"]"
  anti_examples: "[\"add labels so assistive tech can read each field\",\"rewrite the inline validation messages\",\"define the request and response schema for the form submit endpoint\",\"model the database columns that store these inputs\"]"
  relations: "{\"related\":[\"interaction-patterns\",\"interaction-feedback\",\"task-analysis\",\"a11y\",\"microcopy\",\"api-design\",\"data-modeling\"],\"boundary\":[{\"skill\":\"microcopy\",\"reason\":\"microcopy owns validation-message wording; form-ux-architecture owns when validation appears and how users recover\"}],\"verify_with\":[\"a11y\",\"microcopy\"]}"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "Designing a form is like designing an intake interview rather than handing someone a blank questionnaire — a good interviewer asks only what is relevant, in an order the person can follow, waits until an answer is complete before correcting it, and never loses the answers already given when one question goes wrong."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/design/form-ux-architecture/SKILL.md
  skill_graph_export_description_projection: anti_examples+boundary
---

# Form UX Architecture

## Concept of the skill

Form UX architecture is the discipline of structuring a form and its validation behavior so that data entry becomes a guided conversation rather than a data dump. It owns a connected set of decisions: which fields to ask for (the minimum the user's goal truly requires), how to group them (by the user's mental model, not by a storage table), how to classify each one (required, optional, defaulted, derived, or deferred), when validation fires (on submit, on blur, on change, or after an async check), how to split the client-side correction aid from the mandatory server-side trust check, and how the whole submission lifecycle behaves (submit, pending, success, failure, retry, partial-save, and error recovery). Its central principle is that client-side validation is a user-experience aid and never a security boundary — the server must validate every submitted field even when the client appears correct — and its central craft is asking only for what is needed, at the moment the user can answer, with correction paths that preserve trust and the data already entered. It deliberately hands off neighbors it does not own: labels and announcements to a11y, message wording to microcopy, endpoint shape to api-design, and persistence to data-modeling.

## Coverage

Design form structure and validation behavior. Covers field grouping, labels as structure handoff, required vs optional decisions, progressive disclosure, defaults, input formats, client-side validation, server-side validation, validation timing, submit lifecycle, error recovery, multi-step forms, review steps, autosave, and high-risk data entry.

## Philosophy of the skill

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

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `design`
- Public: `true`
- Domain: `design/ux`
- Scope: Designing and auditing form structure and validation UX — field grouping, required vs optional inputs, validation timing, the client/server validation split, the submission lifecycle, recovery, multi-step forms, and high-risk data entry. Portable across any form-bearing UI; principle-grounded, not repo-bound. Excludes labels and announcements alone (a11y), validation-message wording (microcopy), API schema design (api-design), and stored data modeling (data-modeling).

**When to use**
- design the validation lifecycle for this signup form
- audit this checkout form for grouping, required fields, and recovery
- should this be one form, a wizard, or progressive disclosure?
- split client-side and server-side validation responsibilities for this form
- Triggers: `form ux`, `validation timing`, `client server validation`, `multi-step form`, `form recovery`

**Not for**
- add labels so assistive tech can read each field
- rewrite the inline validation messages
- define the request and response schema for the form submit endpoint
- model the database columns that store these inputs
- Owned by `microcopy`: validation-message wording

**Related skills**
- Verify with: `a11y`, `microcopy`
- Related: `interaction-patterns`, `interaction-feedback`, `task-analysis`, `a11y`, `microcopy`, `api-design`, `data-modeling`

**Concept**
- Mental model: |
- Purpose: |
- Analogy: Designing a form is like designing an intake interview rather than handing someone a blank questionnaire — a good interviewer asks only what is relevant, in an order the person can follow, waits until an answer is complete before correcting it, and never loses the answers already given when one question goes wrong.
- Common misconception: |

**Keywords**
- `form-ux`, `form architecture`, `validation timing`, `client server validation`, `field grouping`, `submission lifecycle`, `form recovery`, `multi-step forms`, `required optional inputs`, `error recovery flow`

<!-- skill-graph-context:end -->
