---
name: background-jobs
description: "This skill provides background job patterns for web applications: job queue architecture, long-running sync operations, progress tracking and reporting, failure handling and retry, job prioritization, and concurrency management. Load when implementing async processing, building job queues, designing progress indicators for long operations, or handling failure recovery for background work."
license: MIT
compatibility: "Markdown, Git, agent-skill runtimes"
allowed-tools: Read Grep Bash
metadata:
  schema_version: "4"
  version: "1.0.0"
  type: capability
  category: engineering
  domain: engineering/async
  scope: portable
  owner: skill-graph-maintainer
  freshness: "2026-03-29"
  drift_check: "{\"last_verified\":\"2026-03-29\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"background-jobs\",\"background\",\"jobs\"]"
  triggers: "[\"background-jobs-skill\",\"job-queue-skill\",\"async-processing-skill\",\"long-running-task-skill\",\"worker-pattern-skill\"]"
  relations: "{\"related\":[\"cron-scheduling\"],\"boundary\":[\"real-time-updates\"]}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":90,\"review_cadence\":\"quarterly\"}"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v4
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/background-jobs/SKILL.md
---
# Background Jobs Skill

## Domain Context

**What is this skill?** This skill provides background job patterns for web applications: job queue architecture, long-running sync operations, progress tracking and reporting, failure handling and retry, job prioritization, and concurrency management. Load when implementing async processing, building job queues, designing progress indicators for long operations, or handling failure recovery for background work.
> If it takes longer than 10 seconds, it does not belong in a request handler. Move it to a background job with progress tracking.

## Coverage

This skill covers job queue architecture (push-based vs pull-based, priority queues), long-running operation patterns (sync jobs, data migrations, bulk operations), progress tracking and reporting (percentage, stage-based, ETA estimation), failure handling and retry strategies (exponential backoff, dead letter queues, partial failure recovery), job prioritization and concurrency control, the decision framework for inline vs background execution, and user-facing progress communication patterns.

## Philosophy

Background jobs are the mechanism that separates a responsive user interface from reliable data processing. The web request lifecycle imposes hard time limits (Vercel: 60-300s, Lambda: 15min), but real-world operations — syncing 50,000 orders, generating monthly reports, reconciling financial data — can take minutes or hours. Agents frequently make two mistakes: putting long operations in request handlers (causing timeouts and poor UX) or moving operations to background jobs without progress tracking (leaving users staring at a spinner with no feedback). Both destroy user trust. This skill enforces the discipline of moving heavy work out of the request path while keeping the user informed of progress.

## Architecture

### Execution Model Decision

| Question | If Yes | If No |
|----------|--------|-------|
| Does the user need the result immediately? | Keep inline (< 10s) | Background job |
| Can the operation fail partially? | Background with checkpoint | Simple background |
| Does the user need progress updates? | Background + progress tracking | Fire-and-forget |
| Could the operation take > 60 seconds? | Always background | Inline may work |
| Is the operation triggered by multiple sources? | Job queue with deduplication | Direct invocation OK |

### Job Queue Architecture

```
Producer (API route, webhook, cron)
  |
  v
Queue (database table, Redis, Inngest)
  |
  v
Worker (Inngest function, serverless fn, dedicated process)
  |
  v
Result Store (database, cache)
  |
  v
Notification (SSE, polling, email)
```

**Queue implementation options for serverless environments:**

| Option | Pros | Cons | Best For |
|--------|------|------|----------|
| **Inngest** | Step functions, retry, dashboard, concurrency control | Vendor dependency | Complex multi-step workflows |
| **Database table** | No extra infra, transactional with app data | Polling required, no built-in retry | Simple job tracking |
| **Vercel KV / Redis** | Fast, pub/sub capable | Separate data store, no built-in retry | High-throughput simple jobs |
| **SQS / Cloud Tasks** | Managed, scalable, dead letter queues | Extra infrastructure, more complex | High-volume production systems |

### Job State Machine

Every background job follows this state lifecycle:

```
PENDING -> RUNNING -> COMPLETED
                   -> FAILED -> RETRYING -> RUNNING
                                         -> DEAD (max retries exceeded)
           -> CANCELLED (user-initiated)
```

**Database schema pattern:**

```sql
CREATE TABLE background_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  type VARCHAR(100) NOT NULL,           -- 'order-sync', 'report-generation'
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  priority INTEGER NOT NULL DEFAULT 5,  -- 1 = highest, 10 = lowest
  payload JSONB NOT NULL DEFAULT '{}',
  progress_pct SMALLINT DEFAULT 0,      -- 0-100
  progress_message TEXT,                -- 'Processing order 1,234 of 5,000'
  result JSONB,                         -- Output data on completion
  error_message TEXT,                   -- Error details on failure
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_jobs_status_priority ON background_jobs(status, priority)
  WHERE status IN ('pending', 'running');
```

## Implementation Patterns

### 1. Progress Tracking

For any operation processing N items, track progress at regular intervals:

```typescript
async function processOrders(jobId: string, orders: Order[]) {
  const total = orders.length;
  for (let i = 0; i < total; i++) {
    await processOrder(orders[i]);

    // Update progress every 10 items or every 5 seconds (whichever comes first)
    if (i % 10 === 0 || i === total - 1) {
      await updateJobProgress(jobId, {
        progress_pct: Math.round(((i + 1) / total) * 100),
        progress_message: `Processing order ${i + 1} of ${total}`,
      });
    }
  }
}
```

**Progress reporting to the UI:**

| Method | Latency | Complexity | Best For |
|--------|---------|------------|----------|
| **Polling** | 2-5s | Low | Simple progress bars, MVP |
| **SSE** | Real-time | Medium | Dashboard live updates |
| **WebSocket** | Real-time | High | Bidirectional control (pause/cancel) |

### 2. Retry with Exponential Backoff

```typescript
function getRetryDelay(attempt: number): number {
  // Base: 1s, 2s, 4s, 8s, 16s... capped at 5 minutes
  const baseDelay = 1000;
  const maxDelay = 5 * 60 * 1000;
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
}
```

**Retry decision matrix:**

| Error Type | Retry? | Max Attempts | Example |
|-----------|--------|--------------|---------|
| Transient (network timeout, 503) | Yes | 3-5 | API rate limit, temporary outage |
| Rate limit (429) | Yes, with backoff | 3 | Shopify API throttle |
| Client error (400, 404) | No | 0 | Bad data, missing resource |
| Auth error (401, 403) | No | 0 | Expired credentials |
| Partial success | Resume from checkpoint | 3 | 3,000 of 5,000 orders processed |

### 3. Checkpointing for Long Operations

Operations processing thousands of items must checkpoint progress so retries resume from the last successful point, not restart from zero:

```typescript
async function syncAllOrders(jobId: string) {
  // Resume from last checkpoint if retrying
  const checkpoint = await getCheckpoint(jobId);
  const cursor = checkpoint?.lastCursor || null;

  let page = await fetchOrders({ after: cursor });
  while (page.hasMore) {
    await processOrderBatch(page.orders);
    await saveCheckpoint(jobId, { lastCursor: page.cursor });
    page = await fetchOrders({ after: page.cursor });
  }
}
```

### 4. Job Prioritization

Not all background jobs are equal. A user-initiated export should complete before a scheduled overnight sync:

| Priority | Level | Examples | Target Completion |
|----------|-------|---------|-------------------|
| 1 (Critical) | User-blocked | Data export, report generation user is waiting for | < 30 seconds |
| 3 (High) | User-initiated | Bulk order sync after store connect | < 5 minutes |
| 5 (Normal) | System | Scheduled daily sync, digest compilation | < 30 minutes |
| 8 (Low) | Maintenance | Data cleanup, index rebuild | < 24 hours |

### 5. Concurrency Control

Prevent resource exhaustion by limiting concurrent job execution:

```typescript
// Inngest pattern
export const orderSync = inngest.createFunction(
  {
    id: 'order-sync',
    concurrency: {
      limit: 5,           // Max 5 concurrent syncs across all orgs
      key: 'event.data.orgId', // Max 1 sync per org
    },
  },
  { event: 'orders/sync.requested' },
  async ({ event, step }) => { /* ... */ }
);
```

### 6. User-Facing Progress Communication

| Job Duration | UX Pattern | Example |
|-------------|------------|---------|
| < 5s | Inline loading state | Button spinner |
| 5-30s | Progress bar with percentage | "Syncing orders... 45%" |
| 30s-5min | Progress bar + stage indicator | "Step 2 of 4: Calculating margins" |
| > 5min | Background notification + email on complete | "We'll email you when your export is ready" |

## Anti-Patterns

1. **Long operations in request handlers.** Putting a 50,000-order sync in an API route handler. The request will timeout, the user gets an error, and partial work may corrupt data.

2. **Fire-and-forget without tracking.** Dispatching a background job with no way to check its status. The user refreshes the page and has no idea if the operation completed, failed, or is still running.

3. **Restarting from zero on retry.** A job that processed 4,000 of 5,000 orders before failing should resume from order 4,001, not restart. Without checkpointing, retries waste time and may cause duplicate processing.

4. **No concurrency limits.** Allowing unlimited concurrent sync jobs. If 100 users trigger syncs simultaneously, the database connection pool is exhausted and all jobs fail.

5. **Identical retry timing.** Retrying failed jobs at fixed intervals (e.g., every 5 seconds). When an external API is down, all retries hit simultaneously (thundering herd). Use exponential backoff with jitter.

6. **Progress updates on every item.** Updating the progress database row for every single item in a 50,000-item batch. This creates 50,000 database writes. Update every N items or every T seconds.

7. **Mixing job queue with business logic.** Putting order validation, margin calculation, and email sending in the job queue infrastructure code. The queue manages execution; business logic belongs in service functions.

## Key Files

When working in a project with background jobs:

- Inngest function definitions — step functions with retry and concurrency
- `background_jobs` table (if database-backed queue) — job tracking schema
- API routes for job status polling — `GET /api/jobs/[id]/status`
- SSE endpoints for real-time progress — `GET /api/jobs/[id]/progress`
- Job type registry — mapping job types to handler functions

## Verification

After applying this skill, verify:
- [ ] No request handler performs operations that could exceed 30 seconds
- [ ] Every background job has a trackable status (pending/running/completed/failed)
- [ ] Progress is reported to the user for operations exceeding 5 seconds
- [ ] Retry logic uses exponential backoff with jitter
- [ ] Long operations checkpoint progress for resumable retries
- [ ] Concurrency limits prevent resource exhaustion
- [ ] Failed jobs surface errors through monitoring, not silent swallowing

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Scheduling recurring jobs by time | `cron-scheduling` | Cron covers time-based triggers; this skill covers job execution patterns |
| Inngest-specific event orchestration | `inngest-orchestration` | Inngest has its own patterns beyond generic job queues |
| Data synchronization strategy | `data-sync` | Data sync covers the what (webhook, polling, reconciliation); this covers the how (queue, retry, progress) |
| Real-time UI updates | `real-time-updates` | Real-time covers push-to-UI patterns; this covers backend job execution |

---

*Version 1.0.0 -- 2026-03-29. Initial creation.*
