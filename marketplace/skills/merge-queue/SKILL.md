---
name: merge-queue
description: "Use when serializing merges across multiple agent branches, resolving conflicts between agent outputs, or cleaning stale task branches. Covers atomic locking, idempotency checks, non-fast-forward handling, and worktree cleanup. Do NOT use for ordinary git operations outside an agent merge queue (use `version-control`)."
license: MIT
compatibility: "Markdown, Git, agent-skill runtimes"
allowed-tools: Read Grep Bash
metadata:
  schema_version: "8"
  version: "1.0.0"
  subject: software-engineering-method
  taxonomy_domain: engineering/git
  owner: skill-graph-maintainer
  freshness: "2026-04-01"
  drift_check: "{\"last_verified\":\"2026-04-01\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"merge queue\",\"atomic lock\",\"idempotency\",\"no-ff merge\",\"worktree cleanup\",\"agent branch\",\"master merge\"]"
  triggers: "[\"merge-queue\",\"agent-merge\"]"
  relations: "{\"related\":[\"version-control\"],\"boundary\":[\"version-control\"]}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":90,\"review_cadence\":\"quarterly\"}"
  structural_verdict: PASS
  truth_verdict: PASS
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  public: "true"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/software-engineering-method/merge-queue/SKILL.md
---
# Merge Queue (Serialized Commit Control)

## Domain Context

**What is this skill?** This skill manages the serialized merge queue for agent branches. Covers atomic locking, idempotency checks, non-fast-forward merges, and worktree cleanup. Use when merging multiple agent tasks to master, resolving merge conflicts between agents, or cleaning up stale task branches. Do NOT use for standard git operations (use version-control).

## Coverage

This skill manages the serialized merge queue for agent branches. The sections below contain the detailed rules, examples, and boundaries for using this skill correctly.

## Key Files

| File | Purpose |
|---|---|
| `scripts/agent/merge-queue.sh` | The primary CLI for managing the queue. |
| `agent-orchestration/logs/events.jsonl` | Emits `merge_started` and `merge_completed` events. |
## Workflow

Use the ordered phases, checklists, and guardrails in the sections below as the canonical workflow for this skill. When multiple subsections describe steps, follow them in the order presented.

## Queue Coverage

Atomic merge locking (`merge.lock`), branch idempotency checks, `--no-ff` (non-fast-forward) merge policy, automated worktree and branch cleanup, and event emission.

> The "Gatekeeper" for the master branch. Prevents agents from causing race conditions during the final commit phase.

## Philosophy

Merge queues exist to protect the main branch from concurrent merge failures. When multiple agents modify overlapping code simultaneously, merging them independently creates a false sense of safety — each agent's work may pass CI alone but break when combined. A merge queue serializes merges, ensuring every commit is tested against the current state of main plus all queued predecessors before pushing. The result is a main branch that is always in a known-good state, with clear task-level history preserved via non-fast-forward commits. This prevents both silent conflicts (where two agents unwittingly overwrite each other's work) and long debugging sessions trying to untangle which merge introduced a regression.

## 1. The Merge Protocol

To prevent merge conflicts and history pollution, all agents must submit their finished tasks to the merge queue.

| Phase | Action | Tool |
|---|---|---|
| **Lock** | Acquire `merge.lock` | `scripts/agent/merge-queue.sh` (merge subcommand) |
| **Verify** | Check branch state | Verify branch is up to date with master and passes tests. |
| **Merge** | Non-FF Merge | Merge with `--no-ff` to preserve task history. |
| **Cleanup** | Delete branch/worktree | Remove the git worktree and the remote task branch. |
| **Release** | Release `merge.lock` | Allow the next agent in the queue to proceed. |

## 2. Clever Features (Stolen from Merge Queue)

- **Atomic Lock**: Only one agent can merge at a time, ensuring that master is always in a known good state.
- **Idempotency**: If a merge fails halfway, the queue can be resumed without creating duplicate commits.
- **Automated Cleanup**: Once a merge is successful, the `merge-queue.sh` automatically deletes the task-specific worktree (`/tmp/worktrees/SH-XXXX`) to save disk space.

## 3. Managing the Queue

- **Submit Merge**: `bash scripts/agent/merge-queue.sh merge --task SH-XXXX`
- **Check Status**: `bash scripts/agent/merge-queue.sh status`
- **Cleanup Manually**: `bash scripts/agent/merge-queue.sh cleanup --task SH-XXXX`

## 4. Key Files

| File | Purpose |
|---|---|
| `scripts/agent/merge-queue.sh` | The primary CLI for managing the queue. |
| `.git/merge.lock` | (Virtual) The lock file preventing concurrent merges. |
| `agent-orchestration/logs/events.jsonl` | Emits `merge_started` and `merge_completed` events. |

## 5. Verification Protocol

- **Lock Test**: Try to start two merges simultaneously; the second should wait or fail.
- **Master Integrity**: Verify that master only contains `--no-ff` merge commits for agent tasks.
- **Disk Space**: Verify that the `/tmp/worktrees/` directory is pruned after successful merges.


## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| (To be filled during next audit pass) | — | — |


## Verification

After applying this skill, verify:
- [ ] Changes follow the patterns documented above
- [ ] No regressions in affected functionality

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `software-engineering-method`
- Domain: `engineering/git`

**When to use**
- Triggers: `merge-queue`, `agent-merge`

**Related skills**
- Related: `version-control`

**Keywords**
- `merge queue`, `atomic lock`, `idempotency`, `no-ff merge`, `worktree cleanup`, `agent branch`, `master merge`

<!-- skill-graph-context:end -->
