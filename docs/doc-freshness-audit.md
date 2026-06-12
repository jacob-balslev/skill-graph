# Doc Freshness Audit

Use this page when you want to run the Skill Graph documentation freshness audit and understand its output.

## What It Checks

`skill-graph doc` and `npm run docs:freshness` run `scripts/check-doc-freshness.js`. The audit is read-only. It scans active Markdown docs and compares documented references against the repo code surface:

| Check | Evidence used |
|---|---|
| Local doc/code path references | Files and directories under the current workspace root. |
| `node scripts/...` commands | Actual files under `scripts/`. |
| `npm run ...` commands | `package.json` scripts. |
| `skill-graph ...` commands | The public command map in `bin/skill-graph.js`. |
| Rewrite questions | Long paragraphs, vague taxonomy headings, deep heading nesting, and actionable TODO-style markers. |
| Keep-or-rewrite questions for old wording | Active-doc lines that mention legacy/deprecated/retired/back-compat language without enough current-or-historical context. |

Historical records are skipped by default: ADRs, migration notes, research, plans, audits, examples, generated docs, and change logs. Those files are allowed to preserve dated context.

Inline references are also allowed when the surrounding line clearly says the path or command is historical, recoverable from git history, owned by an external repository, or only an example-project placeholder.

## How To Run

```bash
skill-graph doc
skill-graph doc --errors-only
skill-graph doc --strict
npm run docs:freshness
npm run docs:freshness:strict
```

`--strict` exits non-zero when error-class findings exist. Review questions do not fail the command because they require human judgment.

## How To Use Findings

Every finding is a question with evidence. Treat the output as a worklist:

| Finding class | Default action |
|---|---|
| `missing-local-path` | Update the link/reference, restore the target, or move the reference to a historical record. |
| `missing-node-script` | Update the command or restore the script. |
| `missing-package-script` | Add the package script or update the documented command. |
| `missing-skill-graph-command` | Add the CLI command or update the documented command. |
| `legacy-language` | State the current behavior, or add enough context to show the line is intentional history. |
| `long-paragraph` | Segment the prose without deleting useful context. |
| `vague-taxonomy-heading` | Rename the heading to the organizing principle or split it into specific categories. |
| `deep-heading` | Check whether the hierarchy can be flattened for first-pass understanding. |
| `open-marker` | Resolve explicit markers such as `TODO:` or move them to a tracked plan. |

This audit never deletes or rewrites content automatically. Removal still needs evidence that the content is wrong, dead, redundant, or harmful; otherwise preserve it and rewrite for clearer understanding.
