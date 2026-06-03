---
name: doc-updater
description: "Enforces the documentation-sync discipline: every code or behavior change ships its documentation in the SAME commit, never after. Provides the five-step workflow — diff the change, route each changed file to the doc that OWNS that behavior (document by ownership, not convenience), update each owning doc, verify the update actually landed, and report what was changed — plus the doc-type-purity and stale-reference gates that keep a docs corpus from drifting as code moves. Use at the pre-commit step of any task that changes code, when a change touches several docs, when renaming or deleting something that is referenced elsewhere, or whenever you are unsure which doc owns a change. Do NOT use for how to WRITE good documentation prose or pick a doc's Diátaxis type (that is a documentation-authoring skill), for choosing clear names (use `naming-conventions`), or for the broad cross-domain quality catalog (use `best-practice`). Do NOT use for choosing clear, correct, self-documenting names (use naming-conventions)."
metadata:
  subject: software-engineering-method
  deployment_target: portable
  scope: "Portable across any project, repo, or agent runtime that keeps documentation alongside code. Teaches the discipline of keeping docs synchronized with the code they describe: documentation is part of the change, not optional cleanup afterward, so doc edits ship in the same commit as the code that changed the documented behavior. The five-step workflow (diff → route-by-ownership → update → verify → report), the doc-type-purity gate, and the rename/delete stale-reference sweep are codebase-agnostic; a project supplies only its own routing table of which doc owns which behavior."
  triggers: "[\"doc-updater-skill\",\"doc-sync\"]"
  keywords: "[\"documentation sync\",\"docs in same commit\",\"which doc to update\",\"doc routing\",\"stale references\",\"update docs\",\"documentation drift\",\"doc ownership\",\"rename references\",\"pre-commit docs\"]"
  relations: "{\"related\":[\"best-practice\",\"semantics\",\"methodical\"],\"boundary\":[{\"skill\":\"naming-conventions\",\"reason\":\"naming-conventions owns choosing clear, correct, self-documenting names; doc-updater owns propagating a rename or deletion across every documentation reference in the same change so no stale pointer survives.\"}],\"verify_with\":[\"methodical\",\"best-practice\"]}"
  mental_model: "Documentation and the code it describes are two halves of one artifact, joined at the commit. When code changes but its docs do not, the working tree carries a silent contradiction: the next reader (human or agent) trusts the doc, acts on stale truth, and propagates the error. The fix is mechanical, not heroic — treat every changed file as a question 'which doc owns this behavior?', answer it from a routing table of ownership, and edit that doc inside the same commit so the contradiction never exists on disk."
  purpose: "To prevent documentation drift — the gap that opens between what the code does and what the docs claim — by binding the doc update to the code change in time (same commit) and in ownership (the doc that owns the behavior, not whichever doc is convenient). Drift is invisible at write time and expensive at read time; this discipline closes the window where it can form."
  boundary: "This skill governs WHEN and WHERE a doc change happens (same commit as the code; the doc that owns the behavior) and that renames propagate everywhere. It does not govern HOW to write the prose well or which Diátaxis type a doc should be (a documentation-authoring concern), how to choose the names themselves (that is `naming-conventions`), or the broad cross-domain quality-standards catalog (that is `best-practice`)."
  analogy: "Keeping docs in sync is like double-entry bookkeeping: every change to the ledger of code must post a matching entry to the ledger of docs in the same transaction, or the books silently stop balancing."
  misconception: "The common misconception is that documentation is a finishing step you do 'after the task is done.' Deferred docs are not done docs — they are a drift window that usually never closes. Docs are part of the change; a commit that updates behavior without its docs is partial, not complete."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/software-engineering-method/doc-updater/SKILL.md
  skill_graph_export_description_projection: boundary
---

## Concept Card

**What it is:** The discipline of keeping documentation synchronized with the code it describes — docs ship in the same commit as the code that changed the documented behavior, routed to the doc that *owns* that behavior, with renames and deletions propagated everywhere they are referenced.

**Mental model:** Code and its docs are two halves of one artifact joined at the commit. A code change without its doc change leaves a silent contradiction on disk that the next reader acts on as truth.

**Why it exists:** To close the window in which documentation drift forms. Drift is invisible when you write the code and expensive when the next person reads the stale doc. Binding the doc update to the code change — same commit, owning doc — means the contradiction never exists.

**What it is NOT:** It is not how to *write* documentation well or pick its Diátaxis type (a documentation-authoring skill). It is not choosing the names (`naming-conventions`). It is not the cross-domain quality catalog (`best-practice`). It is specifically the *sync* discipline: which doc, same commit, propagate renames.

**Adjacent concepts:** Documentation-as-code, single-source-of-truth, Diátaxis doc types, double-entry bookkeeping, the "broken windows" drift model.

**One-line analogy:** Double-entry bookkeeping for a codebase — every change to the code ledger posts a matching entry to the docs ledger in the same transaction, or the books silently stop balancing.

**Common misconception:** That documentation is a step you do "after the task is done." Deferred docs are a drift window that rarely closes; the doc update is part of the change, not cleanup after it.

# Documentation Updater

> **Documentation is part of the change, not cleanup after it.** Docs are updated in the same commit as the code that changed the documented behavior — never in a follow-up commit, never "later." For a multi-commit task, run this workflow before EACH commit. A change that updates behavior without updating its docs is a PARTIAL result, not DONE.

## Domain Context

**What is doc-updater?** It enforces the documentation-sync discipline: identifying every doc affected by a code change, routing each change to the doc that *owns* the behavior, updating those docs *before* the code is committed, verifying the update actually landed, and reporting what was changed. The principle is **document by ownership, not convenience** — content goes to the canonical doc that owns the behavior, not to whatever scratch file or index is nearest to hand.

## Coverage

This skill covers the mandatory documentation-sync workflow for any change: identify the diff, route each changed file to the doc(s) that own it, update those docs before staging, verify the updates landed, and report the documentation work in the task summary. It also covers the doc-type-purity gate (keep reference, tutorial, how-to, explanation, and state docs from bleeding into each other), machine-scannability standards, and the stale-reference sweep that must run whenever something is renamed or deleted.

## Philosophy

Undocumented or mis-documented code changes create false state for the next reader. An agent or human who trusts a stale doc acts on a contradiction between what the code does and what the doc claims, and propagates that error downstream. Documentation drift is invisible at the moment you write the code — everything still works — and expensive at the moment someone else reads the doc. The only reliable fix is to remove the window in which drift can form: bind the doc update to the code change in **time** (same commit) and in **ownership** (the doc that owns the behavior). This is not bureaucratic overhead; it is the cheapest possible insurance against the most common form of knowledge rot in a codebase.

The discipline is deliberately mechanical so it survives time pressure. You do not need to *judge* whether docs "feel" out of date — you enumerate the diff, look up each file's owning doc in a routing table, and edit it. The judgment was front-loaded into the routing table once; execution is lookup-and-apply.

---

## The 5-Step Doc-Sync Workflow (Execute in Order)

### Step 1 — Diff Check (FIRST action, no exceptions)

Before writing a single doc, enumerate exactly what changed:

```bash
git diff --name-only HEAD          # changes since last commit
git diff --name-only && git diff --cached --name-only   # staged + unstaged
```

**Output every filename.** This list drives the rest of the steps. You cannot route what you have not enumerated — Step 1 is the completeness anchor for the whole workflow.

### Step 2 — Route Each Changed File to Its Owning Doc

For EVERY file in the diff, ask: *which doc owns the behavior this file implements?* Route the change there. The owning doc is decided by **ownership, not convenience** — the canonical doc for that domain, not the closest index file or a scratch note.

- A project that takes this discipline seriously maintains a **routing table** (change-type → owning doc). When one exists, it is the authority; apply the matching row for each changed file.
- If a changed file matches no owning doc, state explicitly — with reasoning — that no doc update is needed. "I checked and nothing owns this" is a valid outcome; silently skipping is not.
- Prefer the canonical reference doc over an ad-hoc note. Code comments and session summaries do **not** substitute for the doc that owns the behavior.

### Step 3 — Update Each Routed Doc

For every owning doc identified in Step 2:

1. **Read** the target doc first — never edit blind.
2. **Edit** the section that owns the changed behavior; add or update the content.
3. **Add a dated change marker** to the section header so the next reader can see when it last moved, e.g. `(Updated YYYY-MM-DD)`.

### Step 3.5 — Quality Gate (per-doc checklist)

A doc that is updated but poorly structured is still a failure. After each edit, verify:

**Doc-type purity (Diátaxis).** Keep the five doc types from bleeding into each other:

| Doc Type | Must Contain | Must NOT Contain |
|---|---|---|
| **Reference** | Tables, code blocks, paths, terse facts | Step-by-step tutorials, narrative, opinion |
| **Tutorial** | Numbered steps, expected outcomes, hand-holding | Dense reference tables, API specs |
| **How-to / Guide** | Goal-oriented steps for a known task | Conceptual background, full reference |
| **Explanation** | Rationale, trade-offs, mental models | Step lists, exhaustive parameter tables |
| **State / Status** | Timestamps, activity entries, handoff notes | Permanent reference data, architecture decisions |

If an update violates type purity (e.g. tutorial steps added to a reference doc), move the content to the correct doc type and link between them.

**Machine-scannability** (another agent must parse it fast):

- [ ] Headings use a clean `##`/`###` hierarchy (cap depth at `####`)
- [ ] Structured data uses tables, not prose paragraphs (params, env vars, file lists)
- [ ] Code blocks name their language (` ```bash `, ` ```sql `, ` ```ts `)
- [ ] Paths are unambiguous (repo-root-relative or a documented alias)
- [ ] No wall of text — bullets or short paragraphs (≤3 sentences)

**Content quality:**

- [ ] Dated change marker present in the section header
- [ ] Concrete, not vague — "Added the `export` endpoint" beats "Updated API docs"
- [ ] No stale content left in the surrounding section
- [ ] Internal links (`§ Section`, `file.md`) point at things that exist

### Step 4 — Verify the Updates Actually Landed

Do not trust that you wrote the doc — prove it. Grep the docs for the marker or the changed identifier you added:

```bash
grep -rn "<identifier-or-marker>" <docs-dir> --include="*.md"
```

Expected: at least one hit per doc you claimed to update. Zero hits means the edit did not land — go back and fix it. This step is the verification gate; "I updated the docs" without a grep receipt is an unverified claim.

### Step 5 — Report What Was Updated

The task's completion summary MUST name the docs that changed. Fill in every row — never leave it blank:

```markdown
## Docs Updated

| Doc | What Was Added/Changed |
|-----|------------------------|
| <owning-doc> | <section, what changed> |
| ... | ... |

Verification: `grep "<identifier>" ...` returned N hits across M files.
```

If genuinely no docs needed updating (pure test fix, typo, internal refactor with no documented behavior change), say so explicitly and list the diff files that led to that conclusion:

```markdown
## Docs Updated

No docs updated — the diff changed no documented behavior (API / schema / config / public interface).
Diff contained: <files from Step 1>
```

A missing or blank "Docs Updated" section makes the result PARTIAL, not DONE.

---

## The Stale-Reference Sweep (Rename / Delete)

Renames and deletions are the highest-drift events: the code moves, but every doc that *named* the old path, function, flag, command, or URL is now lying. Whenever you rename or delete anything referenced outside its own file:

1. Grep the whole docs surface (and scripts/config) for the old name:
   ```bash
   grep -rn "old_name\|old/path" --include="*.md" --include="*.yml" --include="*.json" .
   ```
2. Fix **every** hit in the **same commit** as the rename/delete. A half-renamed reference sends the next reader to a missing target.
3. A reference inside a frozen historical record (changelog, ADR, archived report) is *not* drift — those describe past state and stay accurate by not being rewritten. Fix references in *live* docs only.

---

## Verification

After applying this skill, verify:

- [ ] Every changed file from the Step 1 diff was checked against its owning doc
- [ ] All owning docs were updated *before* staging, in the same commit as the code
- [ ] Each updated doc passes the doc-type-purity and machine-scannability gate
- [ ] Step 4 grep produced ≥1 hit per doc claimed updated (verification, not assertion)
- [ ] Any rename or deletion triggered a full stale-reference sweep across live docs
- [ ] The completion report names every doc that changed (or states, with the diff, that none needed changing)

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Writing the documentation prose well, or choosing its Diátaxis type | a documentation-authoring skill | Authoring owns doc *quality and type*; doc-updater owns *which doc, same commit, propagate renames* |
| Choosing clear, correct names for things | `naming-conventions` | naming-conventions owns selecting names; doc-updater owns propagating a name change across every doc reference |
| Enforcing the broad cross-domain quality catalog (OWASP, WCAG, SOLID) | `best-practice` | best-practice owns cross-domain standards; doc-updater owns the documentation-sync gate specifically |
| Proving an output is complete and every claim is verified | `methodical` | methodical owns completeness/evidence discipline; doc-updater applies it to the narrow doc-sync surface |

## Key Sources

- Diátaxis (procida.github.io/diataxis) — the four doc types (tutorial, how-to, reference, explanation) the purity gate enforces.
- "Documentation as code" / docs-in-the-same-PR practice — the same-commit binding that closes the drift window.
- Single-source-of-truth doctrine — route content to the one doc that owns the behavior, link from everywhere else.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `software-engineering-method`
- Deployment: `portable`
- Scope: Portable across any project, repo, or agent runtime that keeps documentation alongside code. Teaches the discipline of keeping docs synchronized with the code they describe: documentation is part of the change, not optional cleanup afterward, so doc edits ship in the same commit as the code that changed the documented behavior. The five-step workflow (diff → route-by-ownership → update → verify → report), the doc-type-purity gate, and the rename/delete stale-reference sweep are codebase-agnostic; a project supplies only its own routing table of which doc owns which behavior.

**When to use**
- Triggers: `doc-updater-skill`, `doc-sync`

**Not for**
- Owned by `naming-conventions`: choosing clear, correct, self-documenting names

**Related skills**
- Verify with: `methodical`, `best-practice`
- Related: `best-practice`, `semantics`, `methodical`

**Concept**
- Mental model: Documentation and the code it describes are two halves of one artifact, joined at the commit. When code changes but its docs do not, the working tree carries a silent contradiction: the next reader (human or agent) trusts the doc, acts on stale truth, and propagates the error. The fix is mechanical, not heroic — treat every changed file as a question 'which doc owns this behavior?', answer it from a routing table of ownership, and edit that doc inside the same commit so the contradiction never exists on disk.
- Purpose: To prevent documentation drift — the gap that opens between what the code does and what the docs claim — by binding the doc update to the code change in time (same commit) and in ownership (the doc that owns the behavior, not whichever doc is convenient). Drift is invisible at write time and expensive at read time; this discipline closes the window where it can form.
- Boundary: This skill governs WHEN and WHERE a doc change happens (same commit as the code; the doc that owns the behavior) and that renames propagate everywhere. It does not govern HOW to write the prose well or which Diátaxis type a doc should be (a documentation-authoring concern), how to choose the names themselves (that is `naming-conventions`), or the broad cross-domain quality-standards catalog (that is `best-practice`).
- Analogy: Keeping docs in sync is like double-entry bookkeeping: every change to the ledger of code must post a matching entry to the ledger of docs in the same transaction, or the books silently stop balancing.
- Common misconception: The common misconception is that documentation is a finishing step you do 'after the task is done.' Deferred docs are not done docs — they are a drift window that usually never closes. Docs are part of the change; a commit that updates behavior without its docs is partial, not complete.

**Keywords**
- `documentation sync`, `docs in same commit`, `which doc to update`, `doc routing`, `stale references`, `update docs`, `documentation drift`, `doc ownership`, `rename references`, `pre-commit docs`

<!-- skill-graph-context:end -->
