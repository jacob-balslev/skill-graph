---
name: cron-scheduling
description: "This skill provides cron job architecture patterns for web applications: Inngest schedule integration, Vercel Cron configuration, retry logic, monitoring and alerting for failed crons, and idempotency requirements. Load when designing scheduled tasks, configuring cron triggers, debugging missed or duplicate executions, or implementing monitoring for recurring jobs."
license: MIT
compatibility: "Markdown, Git, agent-skill runtimes"
allowed-tools: Read Grep Bash
metadata:
  schema_version: "8"
  version: "1.0.0"
  type: capability
  operation: know
  category: engineering
  subject: code-engineering
  domain: engineering/scheduling
  scope: portable
  owner: skill-graph-maintainer
  freshness: "2026-03-29"
  drift_check: "{\"last_verified\":\"2026-03-29\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"cron-scheduling\",\"cron\",\"scheduling\"]"
  triggers: "[\"cron-scheduling-skill\",\"cron-job-skill\",\"scheduled-task-skill\",\"vercel-cron-skill\",\"recurring-job-skill\"]"
  relations: "{\"related\":[\"background-jobs\"]}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":90,\"review_cadence\":\"quarterly\"}"
  structural_verdict: UNVERIFIED
  truth_verdict: UNVERIFIED
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/code-engineering/cron-scheduling/SKILL.md
---
# Cron Scheduling Skill

## Domain Context

**What is this skill?** This skill provides cron job architecture patterns for web applications: Inngest schedule integration, Vercel Cron configuration, retry logic, monitoring and alerting for failed crons, and idempotency requirements. Load when designing scheduled tasks, configuring cron triggers, debugging missed or duplicate executions, or implementing monitoring for recurring jobs.
> A cron that runs twice is worse than a cron that doesn't run. Idempotency is not optional.

## Coverage

This skill covers cron expression syntax and scheduling precision, Vercel Cron configuration (`vercel.json` cron routes), Inngest scheduled function patterns (cron triggers vs event-driven), idempotency guarantees for scheduled jobs, retry and failure handling for cron-triggered work, monitoring and alerting for missed or failed cron executions, timezone handling in cron schedules, and the decision framework for choosing between Vercel Cron, Inngest schedules, and external cron services.

## Philosophy

Cron jobs are the most deceptively simple infrastructure in web applications. The expression `0 9 * * *` looks trivial, but the implementation must handle: what happens when the job runs twice (deploy overlap), what happens when the job fails silently (no monitoring), what happens when the job takes longer than the interval (overlap), and what happens at DST transitions (timezone drift). Every anti-pattern in this skill was observed in production. The skill exists because agents routinely create cron schedules without idempotency, without monitoring, and without considering the failure modes that only surface under real-world conditions.

## Architecture

### Cron Platform Decision Matrix

| Platform | Max Duration | Cold Start | Retry Built-in | Monitoring | Best For |
|----------|-------------|------------|-----------------|------------|----------|
| **Vercel Cron** | 60s (Hobby) / 300s (Pro) | Yes | No | Basic (logs) | Lightweight triggers that dispatch to background jobs |
| **Inngest Cron** | Configurable (step functions) | No (warm) | Yes (built-in) | Dashboard + webhooks | Complex scheduled workflows with retry and state |
| **External (e.g., cron-job.org)** | N/A (HTTP trigger) | Depends on target | No | External | When the app has no built-in cron capability |

**Key architectural rule:** Vercel Cron should trigger work, not perform work. The cron route should dispatch an Inngest event or enqueue a background job, then return 200 immediately. Never put long-running logic directly in a Vercel Cron handler.

### Vercel Cron Configuration

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/daily-digest",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/sync-orders",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

**Security:** Vercel Cron requests include a `CRON_SECRET` header. Always verify this header in the route handler to prevent unauthorized execution:

```typescript
// api/cron/daily-digest/route.ts
import { verifyCronSecret } from "@/lib/auth/verify-cron-secret";

export async function GET(request: Request) {
  const authError = verifyCronSecret(request);
  if (authError) return authError;
  // Dispatch work, do not perform work here
  await inngest.send({ name: 'cron/daily-digest.triggered' });
  return new Response('OK', { status: 200 });
}
```

### Inngest Scheduled Functions

```typescript
// Inngest cron function — preferred for complex scheduled work
export const dailyDigest = inngest.createFunction(
  {
    id: 'daily-digest',
    retries: 3,
    concurrency: { limit: 1 },  // Prevent overlap
  },
  { cron: '0 9 * * *' },       // Inngest-native cron trigger
  async ({ step }) => {
    const orgs = await step.run('fetch-orgs', async () => {
      return db.query('SELECT id FROM organizations WHERE digest_enabled = true');
    });
    for (const org of orgs) {
      await step.run(`send-digest-${org.id}`, async () => {
        return sendDigestEmail(org.id);
      });
    }
  }
);
```

## Implementation Patterns

### 1. Idempotency for Cron Jobs

Every cron job must be idempotent: running it twice with the same inputs produces the same result. This is not defensive programming; it is a hard requirement because:

- Vercel may invoke a cron route during overlapping deployments
- Inngest retries failed steps automatically
- Manual re-runs during debugging are common

**Pattern:** Use an idempotency key based on the scheduled execution window:

```typescript
const idempotencyKey = `digest-${orgId}-${format(new Date(), 'yyyy-MM-dd')}`;
const existing = await db.query(
  'SELECT 1 FROM cron_executions WHERE idempotency_key = $1',
  [idempotencyKey]
);
if (existing.rows.length > 0) {
  return { skipped: true, reason: 'already executed' };
}
// Execute, then record
await db.query(
  'INSERT INTO cron_executions (idempotency_key, executed_at) VALUES ($1, NOW())',
  [idempotencyKey]
);
```

### 2. Cron Expression Reference

| Expression | Meaning | Common Use |
|-----------|---------|------------|
| `* * * * *` | Every minute | Health checks (use sparingly) |
| `*/5 * * * *` | Every 5 minutes | Order sync polling |
| `*/15 * * * *` | Every 15 minutes | Data refresh, cache warm |
| `0 * * * *` | Every hour, on the hour | Hourly reports |
| `0 9 * * *` | Daily at 09:00 UTC | Daily digest |
| `0 9 * * 1` | Monday at 09:00 UTC | Weekly summary |
| `0 0 1 * *` | First day of month, midnight | Monthly rollup |

**Timezone rule:** All cron expressions in Vercel and Inngest execute in UTC. If the user expects "9am Eastern", compute the UTC offset and account for DST transitions. Document the intended local time as a comment next to every cron expression.

### 3. Monitoring and Alerting

A cron job that fails silently is worse than no cron job. Implement monitoring at three levels:

| Level | What to Monitor | Alert When |
|-------|----------------|------------|
| **Execution** | Did the job start? | No execution within expected window + buffer |
| **Completion** | Did the job finish? | Execution started but no completion within timeout |
| **Result** | Did the job produce correct output? | Completion with error status or unexpected result count |

**Heartbeat pattern:** After each successful cron execution, ping an external heartbeat monitor (e.g., Cronitor, Better Uptime, or a custom endpoint). If the heartbeat is missed, the monitor alerts the team.

```typescript
// After successful cron execution
await fetch(`${process.env.HEARTBEAT_URL}/cron-daily-digest`, {
  method: 'POST',
  body: JSON.stringify({ status: 'ok', processedCount: orgs.length }),
});
```

### 4. Overlap Prevention

When a cron job takes longer than its interval (e.g., a 15-minute sync that runs every 10 minutes), overlapping executions corrupt data or cause duplicate processing.

**Solutions:**
- **Inngest concurrency limit:** Set `concurrency: { limit: 1 }` on the function
- **Database lock:** Acquire an advisory lock at the start; skip if already held
- **Execution record:** Check if a previous run is still in-progress before starting

### 5. Graceful Degradation

When a cron job fails, it must:
1. Log the failure with structured context (job name, execution window, error)
2. Retry with exponential backoff (Inngest does this automatically)
3. After max retries, alert the team and record the failure
4. Never leave the system in a partial state — use transactions for atomicity

## Anti-Patterns

1. **Long-running logic in Vercel Cron handlers.** Vercel Cron routes have a 60s (Hobby) or 300s (Pro) timeout. Put the work in an Inngest function or background job; the cron route should only trigger.

2. **No idempotency.** A cron that sends duplicate digest emails or double-processes orders because it ran twice during a deploy. Every cron must handle re-execution gracefully.

3. **Silent failures.** A cron that catches all errors and returns 200. Failed crons must surface errors through logging and alerting, not swallow them.

4. **Missing timezone documentation.** A cron expression `0 9 * * *` without a comment explaining the intended local time. When DST shifts, 9am UTC becomes 4am or 5am Eastern, surprising the user.

5. **No overlap protection.** A data sync cron that runs every 5 minutes but occasionally takes 8 minutes, causing two instances to process the same data concurrently.

6. **Cron for real-time needs.** Using a 1-minute cron to poll for new orders instead of using webhooks. Cron is for periodic batch work, not real-time data ingestion.

## Key Files

When working in a project with cron scheduling:

- `vercel.json` — Vercel Cron route definitions
- `api/cron/` or `app/api/cron/` — Cron route handlers
- Inngest function definitions — for cron-triggered step functions
- `cron_executions` table (if it exists) — idempotency tracking
- Monitoring service configuration — heartbeat endpoints

## Verification

After applying this skill, verify:
- [ ] Every cron handler verifies the `CRON_SECRET` authorization header
- [ ] Every cron job is idempotent (safe to run twice)
- [ ] Vercel Cron routes dispatch work rather than performing long-running operations
- [ ] Overlap prevention is configured for jobs that could exceed their interval
- [ ] Monitoring alerts exist for missed or failed executions
- [ ] Timezone is documented as a comment next to every cron expression
- [ ] Retry logic exists for transient failures

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Event-driven job orchestration (not time-based) | `inngest-orchestration` | Inngest covers event-driven patterns; this skill covers time-based triggers |
| General background job queue patterns | `background-jobs` | Job queue architecture is broader than cron-specific scheduling |
| Data synchronization strategies | `data-sync` | Data sync covers webhook ingestion and polling; cron is one trigger mechanism |
| Alert rule evaluation and dispatch | `alert-dispatch` | Alert dispatch covers when and how to send alerts, not how to schedule the check |

---

*Version 1.0.0 -- 2026-03-29. Initial creation.*
