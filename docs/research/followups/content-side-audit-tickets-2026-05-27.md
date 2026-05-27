# CONTENT-side audit tickets (audit H9 + H10, 2026-05-27)

This is the audit's recommended-tickets list for the two CONTENT-side findings the system audit deliberately did not fix inline. Per AGENTS.md § Cross-mode discoveries: "A SYSTEM task that uncovers a skill-content issue (a SKILL.md that's wrong, drifted, mis-classified) **files a Linear task** for the next audit-loop run on that skill. It does NOT fix the SKILL.md inline."

Each row below is the unit of work for a single `/audit:audit` run on the named skill. Stamp the resulting Health Block evidence into the skill itself; do not batch-fix across skills in one commit.

## H9 — Drift sentinel RED on 7 skills

Live state captured 2026-05-27 from `node scripts/skill-graph-drift.js`. Two STATUSES that gate the drift exit code:

- **BROKEN** — a declared local truth source file does not exist. Either the file moved (re-record the hash with `--record --apply`) or the truth-source path is wrong (correct the SKILL.md frontmatter).
- **DRIFT** — live hash of a declared truth source no longer matches the recorded hash. Either the truth source actually drifted (re-verify the skill's claims against the source and re-record the hash) or the skill is now wrong about what the source says (rewrite the skill).

| Skill | Status | Recommended runbook | Notes |
|---|---|---|---|
| `expected-value` | BROKEN | `/audit:audit expected-value` → fix the missing truth source, re-record drift_check baseline | Surfaced 2026-05-27 (was not in the original audit list — caught during re-verification). The single skill that also drives the stability:check warning under H1. |
| `porters-five-forces` | BROKEN | `/audit:audit porters-five-forces` → fix the missing truth source, re-record drift_check baseline | Audit-listed BROKEN. |
| `project-knowledge-extraction` | DRIFT | `/audit:audit project-knowledge-extraction` → re-verify claims, re-record baseline | Audit-listed DRIFT. |
| `skill-infrastructure` | DRIFT | `/audit:audit skill-infrastructure` → re-verify, re-record | Audit-listed DRIFT. |
| `skill-router` | DRIFT | `/audit:audit skill-router` → re-verify, re-record | Audit-listed DRIFT. |
| `graph-audit` | DRIFT | `/audit:audit graph-audit` → re-verify, re-record | Audit-listed DRIFT. |
| `lint-overlay` | DRIFT | `/audit:audit lint-overlay` → re-verify, re-record | Audit-listed DRIFT. |

After each per-skill audit completes, that skill's drift_status should re-stamp to `OK`, leaving the count of red skills monotonically decreasing. When all seven are clean, `npm run drift` can be added to `npm run verify` (currently held out for the same reason this doc exists).

## H10 — 15 graded-comprehension claims missing `evals/comprehension.json`

`node scripts/check-audit-manifest.js` lists 15 audit-run receipts that recorded `comprehension_verdict = PROVISIONAL` without a backing `evals/comprehension.json` artifact (the May 22–25 incident referenced at `check-audit-manifest.js:119`). The schema requires the artifact when `comprehension_verdict ∈ {PROVISIONAL, PASS, SHALLOW, REDUNDANT}`.

| Skill | Receipt | Recommended runbook |
|---|---|---|
| `agent-infrastructure` | `2026-05-23T2040--audit--codex--44c5b5` | `/audit:audit agent-infrastructure` → author `evals/comprehension.json`, re-grade |
| `backend` | `2026-05-23T1704--audit--codex--bdd034` | `/audit:audit backend` → author `evals/comprehension.json` |
| `chrome-devtools-mcp` | `2026-05-23T2045--audit--codex--e95079` | `/audit:audit chrome-devtools-mcp` → author `evals/comprehension.json` |
| `credential-encryption` | `2026-05-23T1654--audit--codex--ba321c` | `/audit:audit credential-encryption` → author `evals/comprehension.json` |
| `docs-development` | `2026-05-23T2053--audit--codex--a04166` | `/audit:audit docs-development` → author `evals/comprehension.json` |
| `ecosystem-modeling` | `2026-05-25T0711--audit--codex--d84f5c` | `/audit:audit ecosystem-modeling` → author `evals/comprehension.json` |
| `expected-value` | (none yet — also drives the H9 BROKEN finding above) | `/audit:audit expected-value` → close drift + author `evals/comprehension.json` in the same audit run |
| `growth-metrics-frameworks` | `2026-05-23T1928--audit--codex--dbdc84` | `/audit:audit growth-metrics-frameworks` → author `evals/comprehension.json` |
| `human-in-the-loop` | `2026-05-23T1443--audit--gpt55--fa518c` | `/audit:audit human-in-the-loop` → author `evals/comprehension.json` (gpt-5.5 verdict — re-grade with current grader) |
| `knowledge-graph` | `2026-05-24T2026--audit--codex--17de27` | `/audit:audit knowledge-graph` → author `evals/comprehension.json` |
| `mcp-builder` | `2026-05-23T1710--audit--codex--6b1b39` | `/audit:audit mcp-builder` → author `evals/comprehension.json` |
| `skill-graph-glossary` | `2026-05-23T1717--audit--codex--c5eeaf` | `/audit:audit skill-graph-glossary` → author `evals/comprehension.json` |
| `task-lifecycle` (run 1) | `2026-05-23T2033--audit--codex--c8b2e0` | `/audit:audit task-lifecycle` → author `evals/comprehension.json` (two receipts; same skill — one audit closes both) |
| `task-lifecycle` (run 2) | `2026-05-23T1723--audit--codex--493d87` | (covered by the row above) |
| `token-cost-estimation` | `2026-05-23T1919--audit--codex--11f35d` | `/audit:audit token-cost-estimation` → author `evals/comprehension.json` |

After each comprehension.json is authored and a real grader run happens, the audit run's PROVISIONAL stamp can either be promoted to PASS (dual-run grader) or stay PROVISIONAL with the artifact now present (single-model). Either way the audit-manifest:check warning for that skill clears.

When all 15 entries clear, `npm run audit-manifest:check` can be added to `npm run verify`.

## Why this is one doc and not 22 inline edits

Per `AGENTS.md § Sequencing principle`: schema bumps and protocol additions cascade to skills *through the contract — the audit loop migrates skills per the version-earned gate*. They do NOT cascade by way of a system commit that touches the schema and N SKILL.md files in the same diff. Drift-baseline re-recording and `evals/comprehension.json` authoring are exactly the kind of per-skill writes that belong inside `/audit:*` runs, with Health Block evidence per skill, not in a SYSTEM-mode batch commit.

The system-audit-2026-05-27.md classification calls H9 and H10 explicitly as CONTENT-side debt with SYSTEM-side gating issues (the gating issues — drift / audit-manifest:check being absent from `npm run verify` — were closed under audit B7 in this same branch).
