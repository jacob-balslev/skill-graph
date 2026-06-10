---
name: cron-scheduling
description: "Use when designing time-based scheduled work in web applications: Vercel Cron routes, Inngest cron-triggered functions, recurring-job idempotency, overlap prevention, retry/failure handling, UTC/timezone decisions, and monitoring for missed or failed schedules. Covers cron expressions, scheduler selection, authorization of cron endpoints, dispatch-to-worker patterns, execution-window idempotency, concurrency locks, and heartbeat/alert design. Do NOT use for general background job queue architecture (use background-jobs), event-driven orchestration without a time trigger, browser freshness transports, or one-off task debugging unrelated to recurring schedules. Do NOT use for move a slow export out of an API handler but it is user-triggered, not scheduled. Do NOT use for design a generic queue contract with retries and progress. Do NOT use for choose Server-Sent Events versus WebSockets for live progress. Do NOT use for define an event payload schema for an async integration."
license: MIT
compatibility: "Portable web-application scheduling guidance. Verify provider limits, retry semantics, auth headers, and timezone support against the target platform before production rollout."
allowed-tools: Read Grep Bash
metadata:
  relations: "{\"related\":[\"background-jobs\",\"real-time-updates\",\"observability-modeling\",\"webhook-integration\"],\"suppresses\":[\"background-jobs\",\"real-time-updates\"],\"verify_with\":[\"observability-modeling\",\"webhook-integration\",\"background-jobs\"]}"
  subject: backend-engineering
  scope: "Cron-job architecture for web applications — Inngest schedule integration, Vercel Cron configuration, retry logic, monitoring and alerting for failed crons, and idempotency requirements — for designing scheduled tasks, configuring triggers, and debugging missed or duplicate executions. Portable across web-application stacks; principle-grounded, not repo-bound. Excludes general background-job queue design and one-off task debugging unrelated to scheduling."
  public: "true"
  taxonomy_domain: engineering/scheduling
  stability: experimental
  keywords: "[\"cron scheduling\",\"cron job\",\"scheduled task\",\"Vercel Cron\",\"Inngest cron\",\"recurring job\",\"idempotent cron\",\"missed cron\",\"cron monitoring\",\"timezone cron\"]"
  triggers: "[\"cron-scheduling-skill\",\"cron-job-skill\",\"scheduled-task-skill\",\"vercel-cron-skill\",\"recurring-job-skill\"]"
  examples: "[\"design a daily cron that triggers a report job without timing out\",\"secure this Vercel Cron route and make sure duplicate invocations are safe\",\"decide whether this recurring workflow belongs in Vercel Cron, Inngest cron, or an external scheduler\",\"debug why this scheduled sync missed a run or ran twice\",\"add monitoring and alerts for a weekly scheduled cleanup job\"]"
  anti_examples: "[\"move a slow export out of an API handler but it is user-triggered, not scheduled\",\"design a generic queue contract with retries and progress\",\"choose Server-Sent Events versus WebSockets for live progress\",\"define an event payload schema for an async integration\",\"debug a one-off failed worker run with no recurring schedule\"]"
  grounding: "{\"subject_matter\":\"Cron scheduling patterns for web applications across Vercel Cron and Inngest scheduled functions\",\"grounding_mode\":\"hybrid\",\"truth_sources\":[\"https://vercel.com/docs/cron-jobs\",\"https://vercel.com/docs/cron-jobs/manage-cron-jobs\",\"https://www.inngest.com/docs/learn/inngest-functions\",\"https://www.inngest.com/docs/reference/typescript/functions/triggers\",\"https://www.inngest.com/docs/functions/concurrency\",\"https://www.inngest.com/docs/reference/typescript/functions/handling-failures\",\"https://www.inngest.com/docs/platform/monitor/observability-metrics\"],\"failure_modes\":[\"cron_endpoint_unauthorized\",\"cron_route_runs_long_work_inline\",\"duplicate_schedule_invocation_not_idempotent\",\"missed_or_failed_cron_has_no_alert\",\"cron_runs_overlap_and_corrupt_state\",\"timezone_assumption_drifts_from_user_expectation\"],\"evidence_priority\":\"equal\"}"
  mental_model: "Cron scheduling has six primitives: a schedule expression, a trigger surface, an authenticated entrypoint, a durable execution target, an idempotency key for the execution window, and observability that proves starts, completions, misses, and failures. The scheduler decides when work starts; a background job or workflow usually does the work; locks and idempotency make duplicate or overlapping starts safe."
  purpose: "Cron work fails in ways that ordinary request handlers hide: the provider can deliver a scheduled request more than once, skip retries after a failed invocation, overlap long runs, run in UTC when the user expects local time, or keep invoking a nonexistent route. This skill makes those recurring-job risks explicit before code is shipped."
  concept_boundary: "This skill owns time-based triggers and schedule-specific reliability. It does not own generic queue architecture, event-contract design, webhook ingestion, browser push transports, or one-off worker debugging. It should compose with background-jobs once a cron trigger hands off durable work."
  analogy: "A cron schedule is an alarm clock wired to a factory: the alarm can ring on time, twice, or not at all, so the factory still needs a front desk, work order number, lock, status board, and missed-alarm monitor."
  misconception: "The common mistake is treating cron as just a five-field string. The string is only the trigger; production cron design also needs auth, UTC/local-time intent, idempotency, overlap prevention, failure handling, and monitoring."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/backend-engineering/cron-scheduling/SKILL.md
  skill_graph_export_description_projection: anti_examples
  skill_graph_export_description_projection_truncated: "true"
---

## Concept of the skill

**What it is:** Cron scheduling is the backend discipline of starting recurring work on a time-based schedule while making the resulting execution safe, observable, and recoverable.

**Mental model:** A schedule expression only creates an alarm. Production scheduling also needs an authenticated entrypoint, a durable worker or workflow target, an idempotency key for the scheduled window, overlap prevention, and monitoring that detects missed starts, failed completions, and duplicate invocations.

**Why it exists:** Time-based jobs fail outside the normal request path. They can run twice, not retry, overlap with themselves, execute in UTC instead of the expected local time, or disappear into logs without alerting. The skill turns those hidden failure modes into explicit design checks.

**What it is NOT:** It is not general background-job queue design, event-schema design, webhook ingestion, browser live-update transport, or debugging an isolated worker failure. It owns the schedule-trigger boundary and composes with those skills after work is triggered.

**Adjacent concepts:** Background jobs, durable workflows, observability, webhook integration, distributed locks, idempotency, and retry classification.

**One-line analogy:** Cron scheduling is an alarm clock wired to a factory: the alarm rings, but the factory still needs a work order, lock, status board, and missed-alarm monitor.

**Common misconception:** The common mistake is believing the cron expression is the design. The expression is only the trigger; the production design is the reliability envelope around the trigger.

# Cron Scheduling

## Domain Context

**What is this skill?** This skill provides cron job architecture patterns for web applications: Inngest schedule integration, Vercel Cron configuration, retry logic, monitoring and alerting for failed crons, and idempotency requirements. Load when designing scheduled tasks, configuring cron triggers, debugging missed or duplicate executions, or implementing monitoring for recurring jobs.
> A cron that runs twice is worse than a cron that doesn't run. Idempotency is not optional.

## Coverage

This skill covers cron expression syntax and scheduling precision, Vercel Cron configuration (`vercel.json` cron routes), Inngest scheduled function patterns (cron triggers vs event-driven), idempotency guarantees for scheduled jobs, retry and failure handling for cron-triggered work, monitoring and alerting for missed or failed cron executions, timezone handling in cron schedules, and the decision framework for choosing between Vercel Cron, Inngest schedules, and external cron services.

## Philosophy of the skill

Cron jobs are the most deceptively simple infrastructure in web applications. The expression `0 9 * * *` looks trivial, but the implementation must handle: what happens when the job runs twice (deploy overlap), what happens when the job fails silently (no monitoring), what happens when the job takes longer than the interval (overlap), and what happens at DST transitions (timezone drift). Every anti-pattern in this skill was observed in production. The skill exists because agents routinely create cron schedules without idempotency, without monitoring, and without considering the failure modes that only surface under real-world conditions.

## Architecture

### Cron Platform Decision Matrix

| Platform | Max Duration | Cold Start | Retry Built-in | Monitoring | Best For |
|----------|-------------|------------|-----------------|------------|----------|
| **Vercel Cron** | Same as the invoked Vercel Function's `maxDuration` | Yes | No | Basic logs | Lightweight triggers that dispatch to background jobs |
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

**Security:** When the project defines `CRON_SECRET`, Vercel sends it as an `Authorization` header with a `Bearer` prefix. Always verify that header in the route handler to prevent unauthorized execution:

```typescript
// api/cron/daily-digest/route.ts
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  // Dispatch work, do not perform work here
  await inngest.send({ name: 'cron/daily-digest.triggered' });
  return new Response('OK', { status: 200 });
}
```

### Inngest Scheduled Functions

```typescript
// Inngest cron function — preferred for complex scheduled work
import { cron } from "inngest";

export const dailyDigest = inngest.createFunction(
  {
    id: 'daily-digest',
    retries: 3,
    concurrency: { limit: 1 }, // Prevent overlap
    triggers: [cron('TZ=UTC 0 9 * * *')],
  },
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

**Timezone rule:** Vercel Cron schedules are UTC. Inngest cron triggers support an optional `TZ=<zone>` prefix. If the user expects "9am Eastern", either use a scheduler that supports the intended timezone or compute the UTC offset and account for DST transitions. Document the intended local time next to every cron expression.

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

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `backend-engineering`
- Public: `true`
- Domain: `engineering/scheduling`
- Scope: Cron-job architecture for web applications — Inngest schedule integration, Vercel Cron configuration, retry logic, monitoring and alerting for failed crons, and idempotency requirements — for designing scheduled tasks, configuring triggers, and debugging missed or duplicate executions. Portable across web-application stacks; principle-grounded, not repo-bound. Excludes general background-job queue design and one-off task debugging unrelated to scheduling.

**When to use**
- design a daily cron that triggers a report job without timing out
- secure this Vercel Cron route and make sure duplicate invocations are safe
- decide whether this recurring workflow belongs in Vercel Cron, Inngest cron, or an external scheduler
- debug why this scheduled sync missed a run or ran twice
- add monitoring and alerts for a weekly scheduled cleanup job
- Triggers: `cron-scheduling-skill`, `cron-job-skill`, `scheduled-task-skill`, `vercel-cron-skill`, `recurring-job-skill`

**Not for**
- move a slow export out of an API handler but it is user-triggered, not scheduled
- design a generic queue contract with retries and progress
- choose Server-Sent Events versus WebSockets for live progress
- define an event payload schema for an async integration
- debug a one-off failed worker run with no recurring schedule

**Related skills**
- Verify with: `observability-modeling`, `webhook-integration`, `background-jobs`
- Related: `background-jobs`, `real-time-updates`, `observability-modeling`, `webhook-integration`

**Concept**
- Mental model: Cron scheduling has six primitives: a schedule expression, a trigger surface, an authenticated entrypoint, a durable execution target, an idempotency key for the execution window, and observability that proves starts, completions, misses, and failures. The scheduler decides when work starts; a background job or workflow usually does the work; locks and idempotency make duplicate or overlapping starts safe.
- Purpose: Cron work fails in ways that ordinary request handlers hide: the provider can deliver a scheduled request more than once, skip retries after a failed invocation, overlap long runs, run in UTC when the user expects local time, or keep invoking a nonexistent route. This skill makes those recurring-job risks explicit before code is shipped.
- Analogy: A cron schedule is an alarm clock wired to a factory: the alarm can ring on time, twice, or not at all, so the factory still needs a front desk, work order number, lock, status board, and missed-alarm monitor.
- Common misconception: The common mistake is treating cron as just a five-field string. The string is only the trigger; production cron design also needs auth, UTC/local-time intent, idempotency, overlap prevention, failure handling, and monitoring.

**Grounding**
- Mode: `hybrid`
- Truth sources: `https://vercel.com/docs/cron-jobs`, `https://vercel.com/docs/cron-jobs/manage-cron-jobs`, `https://www.inngest.com/docs/learn/inngest-functions`, `https://www.inngest.com/docs/reference/typescript/functions/triggers`, `https://www.inngest.com/docs/functions/concurrency`, `https://www.inngest.com/docs/reference/typescript/functions/handling-failures`, `https://www.inngest.com/docs/platform/monitor/observability-metrics`

**Keywords**
- `cron scheduling`, `cron job`, `scheduled task`, `Vercel Cron`, `Inngest cron`, `recurring job`, `idempotent cron`, `missed cron`, `cron monitoring`, `timezone cron`

<!-- skill-graph-context:end -->
