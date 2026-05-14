# Repo Diff Patterns

These are recurring patch patterns in this repo that deserve extra scrutiny.

## 1. Mixed formatting plus one semantic branch

Common shape:

- import reordering or whitespace churn across a file
- one real change inside a conditional or helper call

Review rule:

- summarize the semantic branch only
- do not let mechanical churn hide the behavioral change

## 2. Type-only diff with real downstream impact

Common shape:

- interface, schema, or union changed in one file
- few or no runtime files changed in the same patch

Review rule:

- treat contract edits as blast-radius changes
- check callers, API responses, query consumers, and docs

## 3. Snapshot-only test update

Common shape:

- snapshot file changed
- no clear explanation of the user-visible behavior shift

Review rule:

- ask what justified the snapshot change
- treat unexplained snapshot churn as a possible regression mask

## 4. Guard removal presented as refactor

Common shape:

- author says "cleanup" or "refactor"
- diff removes a null/auth/range guard or fallback branch

Review rule:

- compare the stated intent against the actual widened behavior
- call out the removed safety boundary explicitly

## 5. Query or view change with tiny hunk size

Common shape:

- one predicate, join, or grouping clause changes
- hunk is visually small

Review rule:

- assume the blast radius may be large even if the diff is small
- identify every downstream metric, report, or read model that could shift

This file is reference-only. Add new recurring patch patterns here when they show up in the repo.
