---
name: interaction-feedback
description: "Use when designing UI feedback around user actions and system state: loading, skeletons, optimistic updates, progress, success, errors, empty states, retries, disabled/pending states, autosave, undo, and perceived latency. Do NOT use for the words inside feedback (use `microcopy`), accessibility announcement mechanics (use `a11y`), business lifecycle modeling (use `state-machine-modeling`), or performance optimization (use `performance-engineering`). Do NOT use for rewrite the toast and validation text. Do NOT use for make sure the status update is announced to screen readers. Do NOT use for model the order lifecycle and legal transitions. Do NOT use for profile the endpoint that makes this action slow."
license: MIT
compatibility: Portable feedback-state design for web and app UI. Applies before framework-specific implementation and after task or interaction pattern selection.
allowed-tools: Read Grep
metadata:
  relations: "{\"adjacent\":[\"semantics\",\"information-architecture\",\"interaction-patterns\",\"task-analysis\"],\"boundary\":[\"microcopy\"],\"verify_with\":[\"a11y\"]}"
  schema_version: "8"
  version: "1.0.0"
  subject: design
  deployment_target: portable
  scope: "Designing UI feedback around user actions and system state — loading, skeletons, optimistic updates, progress, success, errors, empty states, retries, disabled/pending states, autosave, undo, and perceived latency. Portable across any interactive UI; principle-grounded, not repo-bound. Excludes the words inside feedback (microcopy), accessibility announcement mechanics (a11y), business lifecycle modeling (state-machine-modeling), and performance optimization (performance-engineering)."
  taxonomy_domain: design/interaction
  owner: skill-graph-maintainer
  freshness: "2026-05-11"
  drift_check: "{\"last_verified\":\"2026-05-11\"}"
  eval_artifacts: present
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"interaction-feedback\",\"feedback-state staging\",\"optimistic ui\",\"pending state\",\"retry feedback\",\"undo feedback\",\"perceived latency\",\"long-running action feedback\",\"skeleton loading\"]"
  examples: "[\"design loading, success, error, and retry feedback for this async action\",\"should this save be optimistic, pending, blocked, or undoable?\",\"the sync takes 30 seconds - what should users see at each stage?\",\"add feedback states so the UI does not feel frozen after clicking Export\"]"
  anti_examples: "[\"rewrite the toast and validation text\",\"make sure the status update is announced to screen readers\",\"model the order lifecycle and legal transitions\",\"profile the endpoint that makes this action slow\"]"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":365,\"review_cadence\":\"quarterly\"}"
  structural_verdict: PASS
  truth_verdict: PASS
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/design/interaction-feedback/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# Interaction Feedback

## Coverage

Design feedback states for user actions and system changes. Covers immediate click feedback, loading indicators, skeletons, optimistic UI, pending and disabled states, progress, success confirmation, persistent errors, retry, undo, autosave, long-running jobs, empty and low-data states, and perceived-latency staging.

## Philosophy

Feedback is the user's proof that the system heard them. Without it, users repeat actions, abandon flows, or assume data was lost. Good feedback is honest about uncertainty and gives recovery paths when the system cannot complete the action.

Feedback is not the same as performance. A fast system still needs confirmation, and a slow system still needs staged truth.

## Method

1. Name the action or state change that needs feedback.
2. Classify expected duration: instant, short, medium, long, background, or unknown.
3. Decide the feedback surface: inline state, button state, skeleton, banner, toast, progress row, modal, or job history.
4. Define transitions: idle, pending, partial, success, failure, retrying, cancelled, and undoable.
5. Preserve user control for long or destructive actions: cancel, retry, undo, leave-and-return.
6. Hand off wording to `microcopy` and announcement mechanics to `a11y`.
7. Verify the user can tell whether work is still happening, done, failed, or recoverable.

## Evals

This skill ships a comprehension-eval artifact at [`examples/evals/interaction-feedback.json`](https://github.com/jacob-balslev/skill-graph/blob/main/examples/evals/interaction-feedback.json). The checklist below is the authoring gate for feedback-state design; the eval file is the grader surface.

## Verification

- [ ] Every async action has an immediate observable response
- [ ] Long-running work has progress, backgrounding, or return-later behavior
- [ ] Optimistic updates define rollback and conflict behavior
- [ ] Success states are visible without being noisy
- [ ] Errors are persistent enough to recover from
- [ ] Retry, cancel, undo, or support paths exist when relevant
- [ ] Screen-reader announcement and wording are verified by `a11y` and `microcopy`

## Do NOT Use When

| Use instead | When |
|---|---|
| `microcopy` | The task is writing button labels, toast text, empty-state text, or validation copy. |
| `a11y` | The task is live regions, screen-reader announcements, focus management, or WCAG compliance. |
| `state-machine-modeling` | The task is defining legal lifecycle states, guards, and transitions. |
| `performance-engineering` | The task is measuring and reducing latency, bundle size, query cost, or throughput. |
| `interaction-patterns` | The task is selecting the primary control or interaction pattern. |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `design`
- Deployment: `portable`
- Domain: `design/interaction`
- Scope: Designing UI feedback around user actions and system state — loading, skeletons, optimistic updates, progress, success, errors, empty states, retries, disabled/pending states, autosave, undo, and perceived latency. Portable across any interactive UI; principle-grounded, not repo-bound. Excludes the words inside feedback (microcopy), accessibility announcement mechanics (a11y), business lifecycle modeling (state-machine-modeling), and performance optimization (performance-engineering).

**When to use**
- design loading, success, error, and retry feedback for this async action
- should this save be optimistic, pending, blocked, or undoable?
- the sync takes 30 seconds - what should users see at each stage?
- add feedback states so the UI does not feel frozen after clicking Export

**Not for**
- rewrite the toast and validation text
- make sure the status update is announced to screen readers
- model the order lifecycle and legal transitions
- profile the endpoint that makes this action slow

**Related skills**
- Verify with: `a11y`
- Related: `semantics`, `information-architecture`, `interaction-patterns`, `task-analysis`

**Keywords**
- `interaction-feedback`, `feedback-state staging`, `optimistic ui`, `pending state`, `retry feedback`, `undo feedback`, `perceived latency`, `long-running action feedback`, `skeleton loading`

<!-- skill-graph-context:end -->
