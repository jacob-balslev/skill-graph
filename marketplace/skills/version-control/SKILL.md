---
name: version-control
description: "Use when designing or maintaining the shape of a repository's git history — choosing a branching model, deciding rebase vs merge, sizing commits, linking commits to tracker tickets, tagging releases, running parallel work across worktrees, and resolving the merge conflicts that arise from any of the above. Covers trunk-based development, short-lived feature branches, atomic commit discipline, linear-history conventions (rebase + squash), release tagging with annotated tags and SemVer, hotfix flows from tags, and worktree lifecycle for parallel agents or contributors. Do NOT use for the words inside the commit message (Conventional Commits format, identifier naming — use `naming-conventions`), for chasing a release-pipeline failure (use `debugging`), or for reviewing a PR's content (use `code-review`). Do NOT use for draft a Conventional Commits message for this change. Do NOT use for the release pipeline failed at the tag-creation step — find out why. Do NOT use for review this PR before we merge it."
license: MIT
compatibility: "Git-centric. Patterns translate to other DAG-based version-control systems (Mercurial, Jujutsu) with tool-specific syntax substitutions. Centralized systems (SVN, CVS) lack cheap branching and most of this skill's discipline does not apply."
allowed-tools: Read Grep Bash Edit
metadata:
  schema_version: "8"
  version: "1.0.0"
  subject: code-engineering
  deployment_target: portable
  taxonomy_domain: engineering/version-control
  owner: skill-graph-maintainer
  freshness: "2026-05-06"
  drift_check: "{\"last_verified\":\"2026-05-06\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"version control\",\"git workflow\",\"branching strategy\",\"trunk-based development\",\"git flow\",\"short-lived branch\",\"feature branch\",\"merge vs rebase\",\"linear history\",\"atomic commit\"]"
  examples: "[\"set up trunk-based development for a four-person team\",\"the main branch has 50 merge commits before release — clean up the history\",\"two agents are working in the same repo and clobbering each other's uncommitted changes — set up worktrees\",\"tag the v1.2.0 release with provenance back to the closing tracker milestone\",\"the feature branch is two weeks old and three weeks behind main — rebase or recreate?\",\"design the hotfix workflow for an urgent production patch off a release tag\",\"every commit must link back to a tracker ticket — what's the right enforcement layer?\",\"should we squash, rebase, or merge when integrating a feature branch?\"]"
  anti_examples: "[\"draft a Conventional Commits message for this change\",\"the release pipeline failed at the tag-creation step — find out why\",\"review this PR before we merge it\",\"explain our git policy to new contributors in the docs\",\"decide if this branching-rule change needs a regression test\",\"refactor the git helper scripts in our tooling repo\"]"
  relations: "{\"boundary\":[{\"skill\":\"code-review\",\"reason\":\"code-review evaluates the *content* of a change before merge; version-control owns the *shape* of history that change leaves behind\"},{\"skill\":\"refactor\",\"reason\":\"refactor reorganizes code without changing external behavior; version-control reorganizes history without changing the code's content (rebase, squash, cherry-pick)\"},{\"skill\":\"naming-conventions\",\"reason\":\"naming-conventions owns commit-message wording (Conventional Commits prefix, scope, subject); version-control owns commit *boundaries* (what counts as one commit) and history *shape*\"}],\"related\":[\"code-review\",\"refactor\",\"naming-conventions\",\"debugging\"],\"verify_with\":[\"code-review\"]}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":90,\"review_cadence\":\"quarterly\"}"
  structural_verdict: PASS
  truth_verdict: PASS
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/code-engineering/version-control/SKILL.md
  skill_graph_export_description_projection: anti_examples+boundary
  skill_graph_export_description_projection_truncated: "true"
---

# Version Control

## Coverage

- Branching strategy selection: trunk-based development (default for product teams), Git Flow (only for shipped libraries with multiple supported versions), and the warning signs that a chosen model is failing
- Atomic commit discipline: one logical change per commit, the test that distinguishes "atomic" from "small," and how to split a commit that snuck two changes together
- History shape: rebase over merge for feature integration, squash on merge for keeping main linear, when to allow merge commits (rare — release branches with parallel hotfix history)
- Provenance: the convention that every commit references its originating tracker ticket, and the enforcement options (commit-message hook, CI check, social convention)
- Release tagging: annotated tags with provenance, SemVer 2.0.0 mapping, hotfix flow from a tag without polluting main
- Worktree lifecycle: when to use worktrees, how to keep them clean, and the multi-agent failure mode worktrees prevent (parallel-session index contamination)
- Path-limited commits: the `git commit --only -- <paths>` discipline that prevents a parallel session from injecting unrelated staged files into your commit
- Conflict resolution: structural conflicts (one side renamed, one side edited) versus content conflicts; when to abandon a rebase and recreate the branch

## Philosophy

A repository's history is a *decision log*. When the log is noisy — merge commits where rebases would have been cleaner, multi-purpose commits that mix a fix with a feature, missing tracker IDs, branches that lived for a month — the team loses the ability to answer two questions that matter under pressure: *"why did this change?"* and *"can I revert just this without taking everything else with it?"* Both questions become archaeology rather than lookup.

The correct mental model is: every commit is a transaction the future will need to read, often in a hurry, often by someone who was not in the meeting. The discipline is to keep transactions small, attributed, and reversible. A commit that combines a refactor with a bug fix cannot be reverted cleanly when the fix turns out to be wrong; a commit without a tracker ID forces the next reader into git-blame archaeology to reconstruct intent.

The second principle is *cost asymmetry*. Cleaning up history *before* merge is cheap — squash, rebase, edit messages, split commits, all local operations on a feature branch. Cleaning up history *after* merge is expensive — it requires force-pushes, coordinated rewrites, and risks losing other people's work. Push the cleanup left to the moment the cost is lowest.

The third principle, specific to multi-agent and multi-session work: the git index is a *process-shared mutex*. Two agents in the same repo share `.git/index`, which means a `git add` in one session lands in the other session's `git diff --cached`. The standard `git commit` command picks up everything currently staged. The defence is path-limited commits (`git commit --only -- <paths>`) that build a temporary index from explicitly-named paths only, ignoring whatever else a parallel session has staged. Without this discipline, multi-agent work produces commits with surprise files.

## Branching Strategy: Trunk-Based by Default

Trunk-based development is the right default for almost every product codebase: a single long-lived branch (`main`), short-lived feature branches that integrate frequently (every 1-2 days), and incomplete features merged behind feature flags rather than parked on long-running branches.

| Rule | Why |
|---|---|
| Branches live < 48 hours | Forces small PRs, prevents drift from main, keeps merge cost low |
| PRs target < 400 changed lines | Larger PRs review poorly; reviewer attention drops sharply past 400 lines |
| Incomplete features ship behind flags | Lets you merge often without exposing half-built work to users |
| `main` is always shippable | CI is the gate; nobody pushes broken code to main |

The anti-pattern is a long-lived `develop` branch (Git Flow) used as if it were trunk: drift accumulates, integration becomes its own project, and "merging develop to main" becomes a quarterly event with thousands of changed files. Git Flow exists for a different problem — shipping libraries with multiple supported major versions, where you genuinely need parallel release branches. If you are not maintaining `v1.x` and `v2.x` simultaneously, you do not need Git Flow.

## Commit Authoring: One Change, One Commit

A commit is "atomic" when reverting it produces no broken intermediate state, no accidentally-reverted unrelated work, and no half-finished features. The test:

> *If a senior reviewer asks "why does this commit exist?" and the answer requires the word "and," split the commit.*

A commit titled "fix order rounding bug AND clean up the order utils file" is two commits. Run `git rebase -i HEAD~1` and split before merging.

The commit-message wording (verb tense, prefix conventions, character limits) is *naming* — see `naming-conventions` for that. Version-control owns the commit *boundaries*: what counts as one commit, where one ends and the next begins, and whether the commit can stand alone if every later commit is reverted.

### Provenance: Linking Commits to Tracker Tickets

Every commit on a feature branch should link to the tracker ticket that produced it. The format is convention-driven; common forms:

```
feat(orders): add CSV export button (PROJ-1234)

Implements the export button on the order list. Output mirrors the
table columns; encoding is UTF-8 with BOM for spreadsheet compatibility.
```

The tracker ID may live in the subject (visible in `git log --oneline`) or in a structured trailer (`Refs: PROJ-1234`, machine-parseable for automated cross-linking). Pick one and apply it consistently — mixing both fragments the searchable history.

If the change implements an architecture decision, reference the decision document in the commit body so future readers can find the why:

```
refactor(persistence): replace ad-hoc SQL with repository pattern (PROJ-1290)

Implements the data-access pattern decided in docs/decisions/0017-repository-pattern.md.
The change is mechanical; behavior is preserved by the existing integration tests.
```

## History Shape: Rebase, Squash, Linear

For feature-branch integration into main, prefer this order:

1. **Rebase the feature branch onto main** before merging. This re-applies your commits on top of the latest main, replacing "merge main into feature" noise with a clean linear history.
2. **Squash on merge** if the feature branch has multiple commits that only make sense together. The PR becomes one commit on main; the feature-branch detail lives in the PR description and the squashed commit body.
3. **Allow real merge commits** only when both branches have valuable independent history (rare — usually a release branch and a hotfix branch).

```bash
# Local workflow, on a feature branch
git fetch origin
git rebase origin/main          # replay your commits on top of latest main
# resolve any conflicts, run tests, push
git push --force-with-lease     # safe force: rejects if remote moved since your last fetch

# Merging the PR into main (in your forge UI or CLI)
# Pick "Squash and merge" if the branch has noisy WIP commits
# Pick "Rebase and merge" if every commit is publishable on its own
# Avoid "Create a merge commit" by default
```

`--force-with-lease` is the safe variant of `--force`: it pushes only if the remote branch is at the SHA you last fetched, refusing if a collaborator pushed in between. Plain `--force` overwrites whatever is there, which destroys other people's work.

## Release Tagging

Releases are *annotated* tags (`git tag -a`), not lightweight tags. Annotated tags carry a tagger identity, a date, and a message — they are first-class objects in the git store and survive history rewrites that would orphan a lightweight tag.

```bash
git tag -a v1.2.0 -m "Release v1.2.0 — closes Milestone 4 (PROJ-MS-4)"
git push origin v1.2.0
```

Tag names follow SemVer 2.0.0 (`MAJOR.MINOR.PATCH`, optional pre-release suffix `-rc.1` or `-beta.2`). Patch tags are cheap; cut one per shipped fix.

### Hotfix Flow

When production has a bug that cannot wait for the next scheduled release:

```bash
# 1. Branch from the latest release tag, not from main
git checkout -b hotfix/v1.2.1 v1.2.0

# 2. Apply the minimal fix; test; commit
git commit -m "fix(orders): rounding error in tax calculation (PROJ-1305)"

# 3. Tag the patch
git tag -a v1.2.1 -m "Hotfix v1.2.1 — tax rounding (PROJ-1305)"
git push origin v1.2.1

# 4. Cherry-pick the fix back to main so the bug doesn't return next release
git checkout main
git cherry-pick <hotfix-commit-sha>
git push origin main
```

The hotfix branch can be deleted after the cherry-pick. The discipline is to keep `main`'s history linear *and* keep the hotfix tag pointing at the minimal fix, not at a snapshot of main.

## Worktrees: Parallel Work Without Contamination

Worktrees let multiple checkouts of the same repository coexist on different branches in different filesystem directories — without the cost of a full clone and without the conflict of a single working tree being on multiple branches.

```bash
# Create a worktree for a parallel feature
git worktree add ../my-repo-feature-A feature/A

# List current worktrees
git worktree list

# Remove a worktree after the work is merged
git worktree remove ../my-repo-feature-A
```

Worktrees are essential when:

- Multiple agents or contributors are working in the same repo simultaneously and would otherwise overwrite each other's uncommitted changes
- You want to run a long task (test suite, build) on one branch while editing on another
- You need to inspect a release tag's tree without disrupting your in-progress work

The cleanup discipline matters: an abandoned worktree directory does not free its branch lock; `git worktree list --porcelain` and `git worktree prune` are the cleanup tools.

## Path-Limited Commits

In any repository where multiple processes or sessions share the working tree, the standard `git commit` is unsafe. The git index is a process-shared mutex; another session's `git add` lands in your `git diff --cached`, and a later `git commit` picks it up.

The defence:

```bash
# Right — for tracked files: build a temporary index from these paths only
git commit --only -m "..." -- path/one path/two

# Right — for new files: add first, then commit with --only
git add path/one path/two
git commit --only -m "..." -- path/one path/two

# Right — for multi-line messages: use -F with a temp file
printf 'subject\n\nbody\n' > /tmp/msg
git commit --only -F /tmp/msg -- path/one path/two

# Wrong — `-m` AFTER `--` is parsed as a pathspec, not a flag.
# git fails with: error: pathspec '-m' did not match any file(s) known to git
git commit --only -- path/one path/two -m "..."

# Wrong — picks up whatever a parallel session has staged
git add path/one
git commit -m "..."
```

`--only` builds a transient index containing only the listed paths and commits from that. Whatever a parallel session has in the real index is left untouched for that session to commit. The safety window closes at the `git commit --only` call, not at the `git add`.

**Flag ordering rule:** Everything after `--` is a path to git. Put `-m`, `-F`, and other flags BEFORE `--`, paths AFTER it. Both Tier 1 solvers in the 2026-05-18 post-v0.5.7 skill-graph cleanup hit the `-m`-after-`--` failure; Issue 3 worked around with `-F /tmp/file`.

After every commit, verify the file list:

```bash
git show --stat HEAD
```

If files you did not intend to commit appeared, a parallel session staged them between your `git add` and your `git commit`. The recovery is `git reset --soft HEAD^` and a retry with `--only`.

## Merge Conflict Resolution

Conflicts come in two shapes:

**Content conflicts** — both sides edited the same lines. Resolution is line-by-line judgment, often informed by reading the surrounding context to understand what each side was trying to achieve.

**Structural conflicts** — one side renamed a file, moved a function, or changed a dependency boundary while the other side edited the old shape. Git frequently reports these as "added by us / deleted by them" or "modified by both" with surprising contents. The resolution is rarely a textual merge; it is a re-application of the smaller change against the new shape.

When a rebase produces conflicts on every replayed commit (a sign the branch and main have diverged structurally), the right move is often to abandon the rebase, recreate the branch from current main, and cherry-pick or re-author the changes:

```bash
git rebase --abort
git checkout main && git pull
git checkout -b feature/x-redo
# re-author the changes against the current main shape
```

A rebase that requires resolving the same conflict in five replayed commits is a signal — the branch is too old and the cleanup cost has crossed the recreate threshold.

## Verification

- [ ] Branching model is named explicitly (trunk-based or Git Flow), and the team's actual behavior matches the named model
- [ ] Feature branches stay short-lived (under 48 hours typical, under one week absolute)
- [ ] Every commit on a feature branch is atomic — reverts cleanly without taking unrelated work
- [ ] Every commit links to a tracker ticket via convention (subject suffix or `Refs:` trailer), enforced by hook or CI when feasible
- [ ] PRs are integrated via rebase-and-merge or squash-and-merge by default; explicit merge commits only for cross-branch releases
- [ ] Releases are annotated tags following SemVer 2.0.0
- [ ] Hotfixes branch from the relevant release tag, are tagged with a patch increment, and are cherry-picked back to main
- [ ] Worktrees are used for any work that runs alongside other in-progress work in the same repo
- [ ] Commits in multi-session repos use `git commit --only -- <paths>` to prevent parallel-session index contamination
- [ ] `git push --force-with-lease` is the only force-push form ever used; plain `--force` is treated as a destructive operation

## Do NOT Use When

| Use instead | When |
|---|---|
| `naming-conventions` | Writing the commit message itself (Conventional Commits prefix, scope, subject wording, identifier names) |
| `documentation` | Drafting the contributor-docs page that explains your version-control policy |
| `code-review` | Reviewing a PR's content for correctness, style, or design |
| `refactor` | Reorganizing the code that the commits touch — version-control reorganizes the *commits*, refactor reorganizes the *code* |
| `debugging` | Chasing a release-pipeline failure or a broken hotfix tag |
| `testing-strategy` | Deciding whether a change to the branching policy itself needs a regression test |

## Skill Graph context

<!-- generated by scripts/export-marketplace-skills.js from Skill Metadata Protocol fields; do not edit by hand -->

**Classification**
- Subject: `code-engineering`
- Deployment: `portable`
- Domain: `engineering/version-control`

**When to use**
- set up trunk-based development for a four-person team
- the main branch has 50 merge commits before release — clean up the history
- two agents are working in the same repo and clobbering each other's uncommitted changes — set up worktrees
- tag the v1.2.0 release with provenance back to the closing tracker milestone
- the feature branch is two weeks old and three weeks behind main — rebase or recreate?
- design the hotfix workflow for an urgent production patch off a release tag
- every commit must link back to a tracker ticket — what's the right enforcement layer?
- should we squash, rebase, or merge when integrating a feature branch?

**Not for**
- draft a Conventional Commits message for this change
- the release pipeline failed at the tag-creation step — find out why
- review this PR before we merge it
- explain our git policy to new contributors in the docs
- decide if this branching-rule change needs a regression test
- refactor the git helper scripts in our tooling repo
- Owned by `code-review`
- Owned by `refactor`
- Owned by `naming-conventions`: commit-message wording (Conventional Commits prefix, scope, subject)

**Related skills**
- Verify with: `code-review`
- Related: `code-review`, `refactor`, `naming-conventions`, `debugging`

**Lifecycle & audit status**
- Stability: `experimental`
- Freshness: `2026-05-06`
- Eval state: `unverified`
- Routing eval: `absent`
- Audit status: structural PASS, truth PASS, comprehension UNVERIFIED, application UNVERIFIED
- Last audited: `2026-05-28`

**Provenance**
- version 1.0.0, schema v8, owner `skill-graph-maintainer`
- Keywords: `version control`, `git workflow`, `branching strategy`, `trunk-based development`, `git flow`, `short-lived branch`, `feature branch`, `merge vs rebase`, `linear history`, `atomic commit`
