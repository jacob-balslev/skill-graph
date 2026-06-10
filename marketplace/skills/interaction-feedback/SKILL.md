---
name: interaction-feedback
description: "Use when designing UI feedback around user actions and system state: loading, skeletons, optimistic updates, progress, success, errors, empty states, retries, disabled/pending states, autosave, undo, and perceived latency. Do NOT use for the words inside feedback (use `microcopy`), accessibility announcement mechanics (use `a11y`), business lifecycle modeling (use `state-machine-modeling`), or performance optimization (use `performance-engineering`). Do NOT use for rewrite the toast and validation text. Do NOT use for make sure the status update is announced to screen readers. Do NOT use for model the order lifecycle and legal transitions. Do NOT use for profile the endpoint that makes this action slow. Do NOT use for the words inside feedback states (use microcopy)."
license: MIT
allowed-tools: Read Grep
metadata:
  subject: design
  public: "true"
  scope: "Designing UI feedback around user actions and system state — loading, skeletons, optimistic updates, progress, success, errors, empty states, retries, disabled/pending states, autosave, undo, and perceived latency. Portable across any interactive UI; principle-grounded, not repo-bound. Excludes the words inside feedback (microcopy), accessibility announcement mechanics (a11y), business lifecycle modeling (state-machine-modeling), and performance optimization (performance-engineering)."
  taxonomy_domain: design/interaction
  stability: experimental
  keywords: "[\"interaction feedback\",\"feedback state staging\",\"optimistic ui\",\"pending state\",\"retry feedback\",\"undo feedback\",\"perceived latency\",\"long-running action feedback\",\"skeleton loading\",\"empty state\"]"
  triggers: "[\"interaction feedback\",\"loading and error states\",\"optimistic update\",\"perceived latency\",\"design feedback states\"]"
  examples: "[\"design loading, success, error, and retry feedback for this async action\",\"should this save be optimistic, pending, blocked, or undoable?\",\"the sync takes 30 seconds - what should users see at each stage?\",\"add feedback states so the UI does not feel frozen after clicking Export\"]"
  anti_examples: "[\"rewrite the toast and validation text\",\"make sure the status update is announced to screen readers\",\"model the order lifecycle and legal transitions\",\"profile the endpoint that makes this action slow\"]"
  relations: "{\"related\":[\"interaction-patterns\",\"microcopy\",\"task-analysis\",\"a11y\",\"performance-engineering\",\"state-machine-modeling\"],\"boundary\":[{\"skill\":\"microcopy\",\"reason\":\"microcopy owns the words inside feedback states; interaction-feedback owns timing, placement, persistence, and recovery behavior\"}],\"verify_with\":[\"a11y\",\"microcopy\"]}"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "Interaction feedback is to a user's action what a courier's tracking updates are to a shipment — the package is not faster because you can watch 'picked up → in transit → out for delivery,' but the staged, honest signals turn an anxious silence into a confident wait, and a failed delivery that tells you why and offers a re-attempt is recoverable where one that simply vanishes is not."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/design/interaction-feedback/SKILL.md
  skill_graph_export_description_projection: anti_examples+boundary
---

# Interaction Feedback

## Concept of the skill

Interaction feedback is the discipline of designing the observable signals a UI gives back to a user across the entire lifetime of an action or system state change. Every action that is not instantaneous travels through a sequence of states — idle, pending, partial, success, failure, retrying, cancelled, undoable — and feedback design decides, for each state, what the user sees, where they see it, how long it persists, and what control they keep. It is settled by four decisions: the expected duration class of the action (instant, short, medium, long, background, or unknown), the surface that carries the signal (inline state, button state, skeleton, banner, toast, progress row, modal, or job history), the transitions the user can observe along with the recovery affordances they retain (cancel, retry, undo, leave-and-return), and how honest the UI is about uncertainty — whether it shows a result optimistically before the system confirms it, and what happens when that optimism turns out to be wrong. Feedback is the user's proof that the system heard them, and it is a distinct concern from performance: a fast system still owes confirmation, and a slow system still owes staged, truthful communication about what is happening.

## Coverage

Design feedback states for user actions and system changes. Covers immediate click feedback, loading indicators, skeletons, optimistic UI, pending and disabled states, progress, success confirmation, persistent errors, retry, undo, autosave, long-running jobs, empty and low-data states, and perceived-latency staging.

The full lifecycle of a non-instant action is the unit of work. The states to account for are: **idle** (nothing started), **pending** (acknowledged, in flight), **partial** (some of a multi-item action completed), **success** (confirmed done), **failure** (errored, recoverable or not), **retrying** (a recovery attempt in flight), **cancelled** (user-aborted), and **undoable** (completed but reversible for a window). Each state maps to a surface and a control set.

Duration classes drive the surface choice. **Instant** (<100ms) needs only the result. **Short** (100ms-1s) needs an immediate acknowledgement (button/inline state). **Medium** (1-5s) needs a determinate or indeterminate indicator with a skeleton for content regions. **Long** (>5s) needs progress, the ability to background the work, or a leave-and-return path with a job history. **Background** work needs an unobtrusive status surface plus a notification on completion. **Unknown** duration must be treated as long until proven otherwise.

Optimistic UI shows the expected result before the server confirms it, which removes perceived latency — but it is a debt: it must define rollback behavior (revert the UI on rejection) and conflict behavior (what wins when the optimistic state and the server state disagree). An optimistic update with no defined rollback is a UI that lies.

## Philosophy of the skill

Feedback is the user's proof that the system heard them. Without it, users repeat actions, abandon flows, or assume data was lost. Good feedback is honest about uncertainty and gives recovery paths when the system cannot complete the action.

Feedback is not the same as performance. A fast system still needs confirmation, and a slow system still needs staged truth. Managing the perception of time is a separate craft from reducing the time, and conflating the two leads teams to either skip feedback ("it's fast enough") or to treat a spinner as a substitute for an honest progress story on genuinely slow work.

Honesty under uncertainty is the core value. The hardest feedback states are not success — they are the long, the failed, and the optimistic-then-rejected. A design that handles only the happy path is not a feedback design; it is a decoration on the happy path.

## Method

1. Name the action or state change that needs feedback.
2. Classify expected duration: instant, short, medium, long, background, or unknown.
3. Decide the feedback surface: inline state, button state, skeleton, banner, toast, progress row, modal, or job history.
4. Define transitions: idle, pending, partial, success, failure, retrying, cancelled, and undoable.
5. Preserve user control for long or destructive actions: cancel, retry, undo, leave-and-return.
6. For optimistic updates, define rollback and conflict behavior explicitly before shipping.
7. Hand off wording to `microcopy` and announcement mechanics to `a11y`.
8. Verify the user can tell whether work is still happening, done, failed, or recoverable.

## Verification

- [ ] Every async action has an immediate observable response.
- [ ] Each non-instant action is mapped to a duration class and an appropriate feedback surface.
- [ ] Long-running work has progress, backgrounding, or return-later behavior.
- [ ] Optimistic updates define rollback and conflict behavior.
- [ ] Success states are visible without being noisy or interrupting.
- [ ] Errors are persistent enough to read and recover from, not flashed and gone.
- [ ] Retry, cancel, undo, or support paths exist when relevant.
- [ ] Screen-reader announcement and wording are verified by `a11y` and `microcopy`.

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
- Public: `true`
- Domain: `design/interaction`
- Scope: Designing UI feedback around user actions and system state — loading, skeletons, optimistic updates, progress, success, errors, empty states, retries, disabled/pending states, autosave, undo, and perceived latency. Portable across any interactive UI; principle-grounded, not repo-bound. Excludes the words inside feedback (microcopy), accessibility announcement mechanics (a11y), business lifecycle modeling (state-machine-modeling), and performance optimization (performance-engineering).

**When to use**
- design loading, success, error, and retry feedback for this async action
- should this save be optimistic, pending, blocked, or undoable?
- the sync takes 30 seconds - what should users see at each stage?
- add feedback states so the UI does not feel frozen after clicking Export
- Triggers: `interaction feedback`, `loading and error states`, `optimistic update`, `perceived latency`, `design feedback states`

**Not for**
- rewrite the toast and validation text
- make sure the status update is announced to screen readers
- model the order lifecycle and legal transitions
- profile the endpoint that makes this action slow
- Owned by `microcopy`: the words inside feedback states

**Related skills**
- Verify with: `a11y`, `microcopy`
- Related: `interaction-patterns`, `microcopy`, `task-analysis`, `a11y`, `performance-engineering`, `state-machine-modeling`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: Interaction feedback is to a user's action what a courier's tracking updates are to a shipment — the package is not faster because you can watch 'picked up → in transit → out for delivery,' but the staged, honest signals turn an anxious silence into a confident wait, and a failed delivery that tells you why and offers a re-attempt is recoverable where one that simply vanishes is not.
- Common misconception: |

**Keywords**
- `interaction feedback`, `feedback state staging`, `optimistic ui`, `pending state`, `retry feedback`, `undo feedback`, `perceived latency`, `long-running action feedback`, `skeleton loading`, `empty state`

<!-- skill-graph-context:end -->
