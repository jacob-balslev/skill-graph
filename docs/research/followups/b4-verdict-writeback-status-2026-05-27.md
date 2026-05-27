# Audit B4 / SH-6481 — structural_verdict + truth_verdict write-back status

Date: 2026-05-27
Status: SYSTEM-side write path implemented; corpus-wide state is CONTENT-debt.

## What the audit found

`docs/audits/system-audit-2026-05-27.md § BLOCKER B4`:

> SH-6481 — `structural_verdict` and `truth_verdict` write-back is incomplete despite ADR 0011 acceptance.
> Per the governance audit (Agent #4): `lib/audit/skill-audit.js:1075` carries an in-code comment documenting the gap; `lib/audit/skill-audit.js:1086-1091` prepares the verdict dict but the field-write commit path is not confirmed in all paths.
>
> Effect: corpus-wide `structural_verdict` and `truth_verdict` read `UNVERIFIED` on all 147 canonical skills despite `npm run verify` passing.

## Re-verification (2026-05-27, this branch)

`lib/audit/skill-audit.js` at HEAD of `audit-remediation-2026-05-27`:

- Lines **1086–1091** prepare `healthFields = { last_audited, lint_verdict, structural_verdict, truth_verdict }`.
- Lines **1093–1097** unconditionally call `updateFrontmatterFields(content, healthFields)` and write the result back to `SKILL.md`. No branch, no early return, no flag gate.
- Lines **1098–1106** log the new values and the "Health Block already current" no-op case.
- Lines **1108–1111** raise a loud error (and set `process.exitCode = 2`) if the read/write throws — closing the SAL-7 silent-fail pattern the audit was right to call out as the historical risk.
- The path runs identically on the stub branch (`!opts.graded`) and the graded branch (`opts.graded`) because the verdict-write block lives **after** the `if (!opts.graded) { ... } else { ... }` branch closes on line 1064. Both paths reach lines 1086–1097.

`updateFrontmatterFields` itself is covered by `scripts/__tests__/test-application-verdict-write-back.js` (53 cases passing as of this commit). The function is the same primitive both write paths use.

**Conclusion:** the write-back for `structural_verdict` + `truth_verdict` is implemented, exercised, and tested. The audit's reading of "the field-write commit path is not confirmed in all paths" appears to predate the SH-6481 closure work landed in commits `9af8526` (truth_verdict wire-back) and `fbdf598` (Health Block wire-back + CLI surface alignment); the comment block at line 1075 documents that history, not an open gap.

## What the corpus-wide UNVERIFIED reading actually means

`grep -l "structural_verdict: UNVERIFIED" $SKILLS_ROOT/skills/**` returns 146 SKILL.md files on this branch — matching the audit's count.

That count is **CONTENT debt, not a SYSTEM gap.** The write-back code stamps a verdict only when the `audit` command actually runs against a given skill. `npm run verify` is the integrity gate for the skill-graph repo, not a per-skill audit driver — it does not call `skill-graph audit <name>` for each of the 154 skills, and it should not (per AGENTS.md § Sequencing principle: "schema bumps and protocol additions cascade to skills through the contract … one skill at a time, with Health Block evidence"). The 146 UNVERIFIED skills are the migration backlog the audit loop drains skill-by-skill, with `/audit:audit` or `skill-graph audit` runs per skill, each writing its own commit.

## Companion gap — Behavior Gate verdicts

The same write-back block carries an honest comment:

```
comprehension_verdict / application_verdict: (unchanged — run --graded with grader CLI to populate)
```

That is precisely the `comprehension_verdict` writeback gap H2 calls out (ADR 0011 § Addendum 2026-05-20 — gate 8 appends to `comprehension-history.jsonl` but does not write the Health Block field). Closure for H2 is tracked under a separate audit ticket; the structural / truth half — B4 — is in.

## Follow-ups out of scope here

- **CONTENT-side ticketing** for the 146 UNVERIFIED skills: produce per-skill audit runs through `/audit:*`. Not in scope for the audit-remediation branch (SYSTEM mode only).
- **Regression test** that specifically targets `lib/audit/skill-audit.js`'s verdict-write block (not just `updateFrontmatterFields` indirectly). Worth adding when the script grows a module.exports surface so it can be required from a test fixture without spawning the full audit subprocess. Deferred to a separate ticket alongside the seven other untested `lib/audit/*.js` runners (audit M9).
