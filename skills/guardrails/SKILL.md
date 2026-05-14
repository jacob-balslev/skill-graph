---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: guardrails
description: "Use when planning or executing operations that touch protected files, credentials, destructive git commands, destructive SQL, PII, secrets, or irreversible system mutations. Covers proactive policy plus reactive pattern blocking for dangerous operations, data exfiltration, and unsafe mutations. Do NOT use for application input validation, user RBAC, or general code logic review (use `code-review`)."
version: 1.0.0
type: capability
category: ai-engineering
domain: ai-engineering/security
scope: portable
owner: skill-graph-maintainer
freshness: "2026-03-28"
drift_check:
  last_verified: "2026-03-28"
eval_artifacts: planned
eval_state: unverified
routing_eval: absent
stability: experimental
license: MIT
compatibility:
  notes: "Markdown, Git, agent-skill runtimes"
allowed-tools: Read Grep Bash
keywords:
  - "guardrails"
  - "tripwire"
  - "safety gate"
  - "force push"
  - "secret detection"
  - "destructive action"
  - "protected files"
  - "circuit breaker"
triggers:
  - "guardrails-skill"
  - "security-skill"
relations:
  related:
    - intent-recognition
portability:
  readiness: scripted
  targets:
    - skill-md
lifecycle:
  stale_after_days: 90
  review_cadence: quarterly
---
# Guardrails

## Domain Context

**What is this skill?** This skill provides a unified framework for proactive and reactive agent safety. It bridges agent-governance (proactive policy) and tripwire-guardrails.py (reactive pattern blocking) to prevent dangerous operations, data exfiltration, and irreversible system mutations. Use when planning operations that touch protected files (.env, credentials), performing git mutations (force push, reset), running destructive SQL, or working with PII and secrets. Do NOT use for application-level input validation (use zod-validation) or user RBAC (use nextauth-patterns). Do NOT use for general code logic review (use code-logic).

> The safety layer that catches what logic misses. Guardrails are the final circuit breaker between intent and execution.

## Key Files

| File | Purpose |
|---|---|
| `agent-orchestration/logs/tripwire.jsonl` | audit-traceability**: Every guardrail trigger is an immutable log event in . |
| `scripts/hooks/tripwire-guardrails.py` | > **Source:** |
## Coverage

This skill covers the two-layer defense model (proactive governance + reactive tripwires), protected operations for git mutations (force push, hard reset, clean), filesystem and secret detection (`.env` writes, API key patterns, private key blocks), SQL safety (unbounded DELETE/UPDATE, DROP TABLE), the three enforcement tiers (CRITICAL/HIGH/WARN with exit codes), the verification protocol for pre-checking high-risk operations, and drift traps where agents attempt to bypass safety gates. It bridges `agent-governance` (proactive policy) with `tripwire-guardrails.py` (reactive pattern blocking).

## Philosophy

Agents with broad tool access will eventually execute dangerous operations -- not from malice but from inference errors, ambiguous instructions, or optimistic assumptions about reversibility. Guardrails exist to make the irreversible harder to reach than the safe alternative. The two-layer model ensures that even when governance approves an intent, the reactive tripwire layer still scans the actual action for secrets, destructive patterns, and protected file writes. Without this skill, agents default to "allowed means safe" -- which is how secrets get committed, production tables get dropped, and force pushes destroy remote history.

## Cross-Domain Synergy
Guardrails provide the enforcement layer for all high-risk operations:
- **agent-governance**: Proactively declares what is allowed; Guardrails reactively blocks what is dangerous even if "allowed" (e.g., a regex match for a secret in a permitted file write).
- **deterministic**: Enforces that mutations are not only correct but also safe and traceable.
- **audit-traceability**: Every guardrail trigger is an immutable log event in `agent-orchestration/logs/tripwire.jsonl`.

## 1. The Two Layers of Defense

| Layer | Type | Mechanism | Focus |
|---|---|---|---|
| **Governance** | Proactive | Policy files (JSON) | Intent, Trust, Permissions |
| **Guardrails** | Reactive | regex patterns (Python) | Arguments, Content, Side-effects |

The canonical sequence: Governance approves the **Intent** -> Hook runner fires Guardrails -> Guardrails inspects the **Action**.

---

## 2. Protected Operations (Tripwires)

Any operation matching these patterns triggers a block or high-severity warning.

### Git Mutations
- **Force Push**: `git push --force` or `-f` is hard-blocked. Use `--force-with-lease` or request explicit user bypass.
- **Hard Reset**: `git reset --hard` is blocked if it discards uncommitted work in non-tmp directories.
- **Clean**: `git clean -f` requires verification of untracked files.

### Filesystem & Secrets
- **Protected Files**: Writes to `.env*`, `credentials.json`, `id_rsa`, or any `.pem`/`.key` files are critical-blocked.
- **Secret Detection**: The content of every `Write` call is scanned for:
    - OpenAI/Anthropic keys (`sk-...`)
    - GitHub tokens (`ghp_...`)
    - Stripe live keys (`sk_live_...`)
    - Private key block sentinels (`BEGIN ... PRIVATE KEY`)

### SQL Execution
- **Unbounded Mutation**: `DELETE FROM` or `UPDATE` without a `WHERE` clause is blocked.
- **Schema Destruction**: `DROP TABLE` or `ALTER TABLE ... DROP COLUMN` is blocked in production contexts.

---

## 3. Enforcement Tiers

| Tier | Exit Code | Action | User Message |
|---|---|---|---|
| **CRITICAL** | 1 | Hard Block | "TRIPWIRE [CRITICAL]: [Reason]. Operation aborted." |
| **HIGH** | 1 | Hard Block | "TRIPWIRE [HIGH]: Avoid this pattern. Use [Alternative]." |
| **WARN** | 2 | Soft Warning | "ADVISORY: This pattern is risky. Proceed with caution." |

> **Source:** `scripts/hooks/tripwire-guardrails.py`

---

## Verification

Before performing a high-risk operation, run the **Guardrails Pre-Check**:

1. **Scan for Secrets**: Manually grep your proposed output for any strings matching secret patterns.
2. **Path Verification**: Confirm the target path is not in the `PROTECTED_FILE_PATTERNS` list.
3. **Intent Alignment**: Ensure your `agent-governance` intent (read-only/mutation/destructive) matches the risk tier of the action.

---

## 5. Drift Traps

| Trap | Why it fails | Correct Approach |
|---|---|---|
| Bypassing hooks with `--no-verify` | This is a guardrail violation in itself. | Fix the underlying issue that triggers the hook. |
| Using Bash to edit secrets | Evasion via `sed` or `perl` is still caught by content tripwires. | Use the `Edit` tool so the system can track the diff. |
| Assuming "allowed" means "safe" | An agent with `destructive` permission can still commit a secret by accident. | Guardrails scan content regardless of permission tier. |

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Application-level input validation (form fields, Zod schemas) | `zod-validation` | Guardrails protects the agent layer; Zod protects the application layer |
| User RBAC, session auth, route protection | `nextauth-patterns` | Auth concerns are application-level, not agent-safety-level |
| General code logic review (TypeScript correctness) | `code-logic` | Code review catches logic bugs; guardrails catches dangerous operations |
| Writing or debugging hook implementation code | `hook-patterns` | Hook-patterns owns how hooks are built; guardrails describes what they enforce |
| Proactive agent policy declaration (trust scores, intent classification) | `agent-governance` | Governance declares what is allowed; guardrails reactively blocks what is dangerous |

---

*Version 1.1.0 — Updated 2026-03-28. Added Coverage, Philosophy, Do NOT Use When sections. Renamed Verification Protocol to standard Verification heading.*
