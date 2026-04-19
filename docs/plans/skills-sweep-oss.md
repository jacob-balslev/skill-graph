# Karpathy-style sweep — OSS variant

> **Status.** Implemented 2026-04-19 as `scripts/skills-sweep-oss.js` + `.gitignore` entries for the checkpoint state. Ships the skills-sweep for this open-source library; the sibling personal variant lives in the parent workspace and is never published here.
> **Created.** 2026-04-19.
> **Subject.** An autonomous 5-phase sweep (ANALYZE → TRIAGE → EXECUTE → VERIFY → PROMOTE) that iterates every production SKILL.md in this library, runs every deterministic gate, and refuses to promote any edit that regresses a baseline metric. Adapted from Andrej Karpathy's AutoResearch loop (design-run-measure-keep-best) for a skill library rather than an ML training loop.

---

## Why this plan exists

The `docs/library-audit-workflow.md` doctrine describes a per-skill audit in prose but does not ship an executable. `scripts/skill-graph-routing-eval.js` and `scripts/skill-lint.js` each enforce one slice of correctness but do not coordinate — a library-wide sweep required a human to run three commands in sequence and correlate the output manually. This sweep is the coordinator.

The load-bearing guard is the **redaction pass**. This OSS library is extracted from a larger private workspace; every commit must pass a grep against a deny-list of private-context identifiers (workspace paths, owner names, private project labels) so the extraction stays honest.

---

## Phase model

Per skill, in order:

| Phase | What it does | Exits |
|---|---|---|
| **ANALYZE** | Parse frontmatter and body; compute deterministic health signals (required fields present, body sections present, local redaction pass). Writes `audits/<skill>/findings.md`. | Always succeeds; counts errors for the triage phase. |
| **TRIAGE** | Skip skills already marked `PASS` in the checkpoint when `--resume` is on; honour `--stratum` (scope filter), `--skill` (single name), and `--max-skills`. | Skills array to sweep. |
| **EXECUTE** | Optional: invoke `--editor-cmd` with three env vars pointing at the skill dir, the findings file, and the skill name. Default is **stub mode** — no editor, findings-only. | On editor failure, mark `EDITOR_FAIL` and continue with the next skill. |
| **VERIFY** | Re-run every library-wide gate (manifest regeneration, skill-lint, contract consistency, routing harness, drift check). If any regressed vs the pre-sweep baseline, `git checkout` the skill dir to roll back the edit. | On regression, mark `REGRESSION` and roll back. |
| **PROMOTE** | Stage the skill dir and regenerated manifest. Commit unless `--no-commit`. Append to `audits/sweep-ledger.jsonl`. | `PASS`. |

All five phases run on every skill even when the checkpoint already records `PASS` — `--resume` is the only way to skip. This is intentional: a rebuild-everything-from-state run must be cheap.

---

## Library-wide gates (baseline + post-promotion)

Run once before the sweep (to establish a baseline the per-skill verify phase compares against) and once after (to confirm the library is still clean at the end):

1. **Manifest regeneration** — `node scripts/generate-manifest.js --include-template --timestamp 1970-01-01T00:00:00Z --output examples/skills.manifest.sample.json`. A stable timestamp keeps the manifest byte-reproducible.
2. **Lint (strict)** — `node scripts/skill-lint.js --include-template --strict`. Zero errors required. This is the authoritative per-file schema + structure check.
3. **Contract consistency** — `node scripts/check-contract-consistency.js`. C1–C6 OK. Confirms schemas, manifests, and docs agree.
4. **Routing harness** — `node scripts/skill-graph-routing-eval.js --manifest <manifest>`. Every skill with `routing_eval: present` must report PASS. Lint check 12 enforces this per-file; the harness runs it library-wide.
5. **Drift check** — `node scripts/skill-graph-drift.js --check` (optional; script is present on main but may be absent in older branches). For each skill with `drift_check.truth_source_hashes`, the script hashes each truth source and compares. Drift → manual review.

A per-skill EXECUTE that causes any of (2), (3), or (4) to regress triggers automatic rollback (`git checkout -- <skill-dir>`).

---

## Redaction gate

The single most important guard. Runs on:

- every authored SKILL.md (pre-flight)
- every edited SKILL.md (post-EXECUTE)
- every file under `audits/` (after findings report is written)
- the final library-wide sweep

The deny-list pattern set lives in `scripts/skills-sweep-oss.js` under `REDACTION_PATTERNS`. Additions are one-sided — strings get added when a leak is discovered in review, never removed. The current list covers workspace paths, personal names, private project labels, and the Linear issue prefix from the upstream workspace.

A redaction hit:

1. prints the filename, matched string, and triggering pattern,
2. writes `REDACTION_BLOCK` to the checkpoint and ledger,
3. does NOT roll back the edit (the hit is surfaced to the author, not auto-corrected — rollback would hide the signal),
4. exits the sweep with code 3.

A new author should expect the redaction gate to fire on their first edit — that is the gate doing its job.

---

## Checkpoint + ledger

- **Checkpoint:** `audits/_state/sweep.json`. Gitignored. Replayable mid-sweep. One record per skill: `{claimed_at, completed_at, pre_hash, post_hash, verdict}`. Rebuilt from empty on `--force-all`.
- **Ledger:** `audits/sweep-ledger.jsonl`. Gitignored. One line per `PROMOTE` or `REDACTION_BLOCK`. Permanent history even after `--force-all` resets the checkpoint.

The two files together give an observability surface without requiring a database.

---

## Scaffold policy

`examples/skill-template.md` is **never** swept. It is a teaching artifact that models the correct authoring-time defaults (`eval_artifacts: planned`, `eval_state: unverified`, `routing_eval: absent`) for a brand-new un-verified skill. Sweeping it would either (a) leave it unchanged and noise the ledger, or (b) change it and break the defaults the scaffold is teaching. Explicitly excluded by path match.

The banner comment at the top of `examples/skill-template.md` and the SCAFFOLD-marker blockquote in its body make this status unmissable to human readers.

---

## Usage

```bash
# Stub mode — audit + findings only, no edits, no commits
node scripts/skills-sweep-oss.js

# Dry-run — phases 1–4, no commits, prints the plan
node scripts/skills-sweep-oss.js --dry-run

# Limit scope
node scripts/skills-sweep-oss.js --skill a11y
node scripts/skills-sweep-oss.js --stratum portable --max-skills 3
node scripts/skills-sweep-oss.js --resume

# Full autonomous run with an editor command
node scripts/skills-sweep-oss.js \
  --editor-cmd 'claude code --headless --skill "$SKILL_GRAPH_SKILL_NAME" --findings "$SKILL_GRAPH_FINDINGS_PATH"' \
  --max-skills 5
```

The editor command receives three env vars:

- `SKILL_GRAPH_SKILL_DIR` — absolute path to `skills/<name>/`
- `SKILL_GRAPH_FINDINGS_PATH` — absolute path to `audits/<name>/findings.md`
- `SKILL_GRAPH_SKILL_NAME` — `<name>`

Any LLM CLI that can read a findings file and edit SKILL.md in place satisfies the contract. The sweep itself is provider-agnostic.

---

## Exit codes

| Code | Meaning |
|---|---|
| `0` | Every processed skill PASS or SKIP; redaction clean. |
| `1` | Usage error or missing prerequisite (skills dir absent, baseline failure). |
| `2` | At least one skill failed verification (lint/contract/harness/drift regression). Re-run after fixing. |
| `3` | Redaction block: a personal-context string was detected. Remove it and re-run. |

---

## Verification after the initial implementation run

- `node -c scripts/skills-sweep-oss.js` → syntax OK
- `node scripts/skills-sweep-oss.js --dry-run` → 8/8 skills PASS, 0 redaction hits (after the one real leak — `owner: jacob-balslev` → `skill-graph-maintainer` across every SKILL.md — was caught and fixed)
- Baseline gates all OK (lint, contract, routing-eval `--only-asserted`)
- Redaction pattern library caught a live leak on first run, which is the gate's intended behavior

---

## Related

- `docs/library-audit-workflow.md` — the per-skill audit doctrine this sweep implements.
- `docs/plans/routing-harness-followup.md` — the 9/9 routing-harness sprint that validated the `routing_eval` gate.
- `scripts/skill-graph-routing-eval.js` — the per-skill routing harness.
- `scripts/skill-lint.js` — the authoritative per-file structural audit.
- `scripts/check-contract-consistency.js` — the C1–C6 cross-artifact consistency check.

---

## Out of scope

| Concern | Why out of scope |
|---|---|
| Telemetry-driven skill prioritization | No runtime telemetry for this library; the sweep processes every skill uniformly. The sibling personal variant in the upstream workspace uses telemetry because it has it. |
| LLM model routing | The sweep accepts a single `--editor-cmd`; model routing is the caller's concern. |
| Schema migrations | Schema bumps are a separate workflow; see `docs/plans/v4-schema-bump.md`. |
| Eval authoring | The sweep enforces that `eval_artifacts: present` skills have a real artifact, but does not write the artifact. Use the documentation/scaffold tooling for that. |
