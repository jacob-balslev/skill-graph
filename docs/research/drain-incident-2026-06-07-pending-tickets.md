# Drain incident 2026-06-07 — pending SKI Error Reports (Linear rate-limited)

> Type: Research / deferred findings. Two unsolved SYSTEM findings from the 2026-06-07 drain
> incident could NOT be filed to SKI because the Linear GraphQL API hit its hourly complexity
> limit (`Error: usage limit exceeded`) after the 44-ticket Phase B burst (SKI-236→279).
> File these when the Linear window resets. Both are WORKED AROUND (drain is running) — these
> are tracking tickets for the underlying SYSTEM fixes, not blockers.

Context: the panel-enrich drain (run-panel-loop.sh --worklist) died twice on 2026-06-07 —
first on the weekly MAX Claude limit (~08:51 CEST, reset 13:00), then on a stale per-model
claim after restart. Both recovered; drain resumed (pid 85977, nohup-detached). Related filed
ticket: **SKI-279** (SIGHUP resilience).

## Finding 1 — Stale per-model claim survives crash + startup self-heal

- **Severity:** P2 (caused full remaining-corpus failure)
- **What:** after the crash + restart, a stale claim `semantics--codex` (owner `enrich-codex-current`) from an earlier run persisted through the crash AND the loop's startup self-heal. `codex-current` is a MANDATORY model and the claim system enforces one-skill-at-a-time per model, so every subsequent skill failed `CLAIM REFUSED — you (enrich-codex-current) still hold semantics` at the codex propose step (`exit 1`). `doc-updater` passed opus propose (255s) then died at codex.
- **Where:** `scripts/skill/skill-audit-claim.js` (claim + self-heal); `skill-graph/scripts/run-panel-loop.sh` startup self-heal reaps orphaned per-model SLOT LOCKS but NOT stale per-skill claims (`slug--model`).
- **Workaround applied:** `AGENT_ID=enrich-codex-current MODEL=codex-current node scripts/skill/skill-audit-claim.js release semantics --model codex-current --status completed` → drain unblocked; `etsy` enriched (`58cd48d`).
- **Suggested fix:** startup self-heal reaps stale `slug--model` claims whose owning run/pid is dead; and/or release the per-model claim on skill completion so a committed skill (semantics had `89d3c9f`) never leaves a dangling claim.

File command (when Linear clears):
```bash
node scripts/linear/linear-cli.js --workspace smp create \
  --title "Stale per-model claim survives crash + startup self-heal, blocks mandatory model on every skill" \
  --description "$(sed -n '/^## Finding 1/,/^## Finding 2/p' skill-graph/docs/research/drain-incident-2026-06-07-pending-tickets.md)" \
  --project "Skill Audit Loop" --labels error-report --priority 3 --estimate 3
```

## Finding 2 — Drain has no Claude weekly-quota awareness → exhausts MAX weekly limit → mass cascade

- **Severity:** P2 (full-drain failure mode, distinct from SKI-279 SIGHUP)
- **What:** the drain calls `claude` (Opus) as the mandatory frontier proposer+curator for EVERY skill, with no awareness of the shared MAX weekly Claude budget. On 2026-06-07 it exhausted the weekly limit mid-run; once hit, every remaining skill instant-failed `exit 1` (~80 in 4 minutes) and the loop exited — burning the ledger with rate-limit "failures" that are not real skill failures. There is no pause-on-limit, no budget gate, and no backoff: the loop charges ahead failing every skill instead of pausing until reset.
- **Where:** `skill-graph/scripts/run-panel-loop.sh` + `lib/audit/panel-enrich-live-deps.js` (no quota check before/around the mandatory `claude` dispatch); contrast `scripts/model/budget-monitor.js` (exists for other lanes).
- **Impact:** a single overnight drain can exhaust the user's weekly interactive Claude access; the cascade also pollutes the ledger with ~80 false "failed" lines per exhaustion.
- **Suggested fix:** detect the "weekly limit / usage limit" signal from the `claude` CLI and PAUSE the loop (write a `pause_until` to loop-steering, sleep to reset) instead of failing every skill; optionally a pre-flight budget gate via `budget-monitor.js`; and do NOT record a rate-limit abort as a per-skill `failed` ledger line.

File command (when Linear clears):
```bash
node scripts/linear/linear-cli.js --workspace smp create \
  --title "Panel drain has no Claude weekly-quota awareness — exhausts MAX weekly limit, mass exit-1 cascade" \
  --description "$(sed -n '/^## Finding 2/,/^## How to file/p' skill-graph/docs/research/drain-incident-2026-06-07-pending-tickets.md)" \
  --project "Skill Audit Loop" --labels error-report --priority 3 --estimate 5
```

## How to file
Run the two commands above once `node scripts/linear/linear-cli.js --workspace smp list --limit 1`
stops returning `usage limit exceeded`. Delete this file (git rm) after both are filed; record the
SKI ids in the commit message.
