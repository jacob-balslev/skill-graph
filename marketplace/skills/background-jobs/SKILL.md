---
name: background-jobs
description: "Use when moving slow or failure-prone work out of a request path, designing job queues, retries, checkpoints, progress reporting, cancellation, or worker concurrency. Covers inline-vs-background decisions, queue contracts, state machines, idempotency, retry/backoff, progress signals, worker leases, and user-visible completion reporting. Do NOT use for time-based schedule design (use `cron-scheduling`), live browser transport choice (use `real-time-updates`), or async message schema ownership (use `event-contract-design`). Do NOT use for choose the cron expression for a daily run. Do NOT use for design an SSE or WebSocket browser update channel. Do NOT use for define an event envelope and topic naming standard. Do NOT use for debug why this already-running worker crashed. Do NOT use for model the database schema for the business entity being processed."
license: MIT
compatibility: "Portable background job design guidance for web apps, APIs, workers, serverless functions, and queue-backed systems. Specific queue products differ; verify platform limits before production rollout."
allowed-tools: Read Grep Bash
metadata:
  relations: "{\"adjacent\":[\"real-time-updates\"],\"boundary\":[\"cron-scheduling\"]}"
  schema_version: "7"
  version: "1.1.0"
  subject: backend-engineering
  deployment_target: portable
  taxonomy_domain: engineering/async/background-jobs
  owner: skill-graph-maintainer
  freshness: "2026-05-21"
  drift_check: "{\"last_verified\":\"2026-05-21\"}"
  eval_artifacts: present
  eval_state: unverified
  routing_eval: absent
  stability: stable
  keywords: "[\"background jobs\",\"job queue\",\"worker queue\",\"async processing\",\"long-running task\",\"retry backoff\",\"dead letter queue\",\"job progress\",\"checkpointing\",\"worker concurrency\",\"idempotent job\",\"queue lease\",\"job cancellation\"]"
  triggers: "[\"background-jobs-skill\",\"job-queue-skill\",\"async-processing-skill\",\"long-running-task-skill\",\"worker-pattern-skill\"]"
  examples: "[\"move this report generation out of the API handler and still show progress\",\"design a queue-backed import job that can resume after failure\",\"choose retry and dead-letter behavior for a worker\",\"avoid duplicate processing when a job is enqueued twice\",\"add cancellation and progress to a long-running export\"]"
  anti_examples: "[\"choose the cron expression for a daily run\",\"design an SSE or WebSocket browser update channel\",\"define an event envelope and topic naming standard\",\"debug why this already-running worker crashed\",\"model the database schema for the business entity being processed\"]"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":180,\"review_cadence\":\"quarterly\"}"
  comprehension_state: present
  mental_model: "A background job system has five primitives: a producer records durable work, a queue orders and deduplicates it, a worker leases and executes it, a state store records progress and outcomes, and a notification path tells humans or systems what changed. Reliability comes from making each primitive explicit instead of hiding long work inside a request handler."
  purpose: "Background jobs keep interactive requests short while preserving reliable processing for slow, retryable, or batch-oriented work. They replace timeout-prone inline execution and untracked fire-and-forget calls with durable state, resumable progress, controlled concurrency, and observable outcomes."
  boundary: "This skill is not schedule design, browser push transport design, event schema design, or incident debugging. It begins after work has been requested and ends with execution state, retry, progress, completion, cancellation, and failure handling."
  analogy: "A background job is a numbered work order in a shop: the front desk accepts the request, the workshop picks it up when capacity exists, and the status board shows where it is."
  misconception: "Putting work in a worker is not enough. Without durable state, idempotency, progress, retry policy, and observability, a background job is just an invisible request handler with a longer timeout."
  structural_verdict: PASS
  truth_verdict: PASS
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/backend-engineering/background-jobs/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# Background Jobs

## Coverage

- Inline-vs-background execution decisions for web requests, API routes, workers, and serverless functions.
- Durable job contracts: job identity, payload, state, priority, ownership, attempts, progress, result, and failure record.
- Queue and worker patterns: push queues, pull queues, leases, deduplication, priority, rate control, and concurrency limits.
- Reliability patterns: idempotency keys, retry classification, exponential backoff with jitter, checkpoints, dead-letter handling, and partial failure recovery.
- User-visible progress: stage names, percentages, timestamps, cancellation, completion notification, and stale status handling.
- Verification: proving long work left the request path without losing observability or recovery paths.

## Philosophy

Background jobs are not just "run this later." They are a reliability boundary between interactive work and processing work. A request handler is optimized for short, synchronous feedback. A worker is optimized for durable execution, retries, checkpoints, and controlled resource use.

The most common failure is moving code into a worker while keeping request-handler assumptions: no durable state, no idempotency, no progress, no cancellation, and no evidence of completion. That makes the system feel faster only until the first timeout, duplicate enqueue, or partial failure. A good job design makes the execution contract visible before choosing a queue product.

## Execution Decision Gate

Use this gate before adding a queue. If any answer in the right column is true, design a background job instead of inline request work.

| Question | Inline request is acceptable when | Background job is required when |
|---|---|---|
| Duration | Work predictably completes within a few seconds | Work can exceed the request budget or has unbounded input size |
| Failure shape | Failure is atomic and easy to show immediately | Failure can be partial, transient, or recoverable |
| User feedback | The caller needs the result before continuing | The caller can continue with progress or later completion |
| Retry safety | Retrying the request is harmless and visible | Retrying needs idempotency, checkpointing, or backoff |
| Resource use | Work uses normal request resources | Work may saturate CPU, memory, database connections, or external limits |
| Coordination | One request owns the whole operation | Many producers, workers, or duplicate triggers can touch the same work |

**Rule of thumb:** if you need progress, checkpointing, retry classification, cancellation, concurrency control, or delayed completion, you are already designing a background job.

## Job Contract

Every background job needs a durable contract. The exact storage can be a database row, queue message plus result table, workflow engine state, or object store record, but the same fields need clear ownership.

| Field | Purpose | Failure if omitted |
|---|---|---|
| Job ID | Stable handle for status, logs, and support | Cannot find or correlate work after enqueue |
| Type | Routes to the correct handler | Workers need payload guessing or brittle branching |
| Payload | Immutable input to the handler | Retries run against changing state by accident |
| Idempotency key | Deduplicates repeated enqueue attempts | Duplicate processing and double side effects |
| Status | Communicates lifecycle state | Work disappears into a black box |
| Attempts and max attempts | Controls retry lifecycle | Infinite retry loops or premature dead-lettering |
| Progress | Shows percentage, count, stage, or checkpoint | Humans see a spinner with no useful signal |
| Result | Records output or pointer to output | Completion cannot be consumed reliably |
| Failure reason | Records actionable failure class | Operators see failed without knowing why |
| Lease or lock | Ensures one worker owns an active job | Two workers process the same job concurrently |

### State Machine

Keep states few and explicit:

```text
queued -> running -> succeeded
                  -> retry_waiting -> running
                  -> failed
                  -> cancelled
```

Use `failed` for terminal failure after retry policy is exhausted. Use `cancelled` only when the system intentionally stops work. Do not collapse retryable and terminal failures into one ambiguous error state.

## Queue And Worker Patterns

| Pattern | Use when | Watch out for |
|---|---|---|
| Database-backed queue | You need simple durability near app data and moderate volume | Polling cadence, lock contention, cleanup of old rows |
| Managed queue | You need high throughput, delayed retry, and dead-letter support | Message visibility timeouts and at-least-once delivery |
| Workflow engine | You need multi-step orchestration, step retries, or human-visible traces | Vendor lock-in and over-modeling simple jobs |
| In-process worker | You need low-latency local processing in a persistent service | Process restarts lose work unless the queue is durable |
| Fire-and-forget task | Work is non-critical and safe to lose | Most product work is not actually safe to lose |

### Lease-Based Pull Worker

Use a lease when workers pull from a shared store. The lease prevents two workers from processing the same job while still letting another worker recover abandoned work after the lease expires.

```typescript
async function claimNextJob(workerId: string) {
  return updateOneJob(
    {
      status: "queued",
      runAfter: { lte: new Date() },
    },
    {
      status: "running",
      leaseOwner: workerId,
      leaseExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
      startedAt: new Date(),
    },
    { sort: { priority: 1, createdAt: 1 } },
  );
}
```

## Reliability Patterns

### Idempotency

Background workers must assume at-least-once execution. A retry, duplicate enqueue, worker crash, or lease expiry can run the same logical job more than once.

Use an idempotency key that represents the logical work, not the physical attempt:

```typescript
const idempotencyKey = `report:${workspaceId}:${periodStart}:${periodEnd}`;

await enqueueJob({
  type: "report.generate",
  idempotencyKey,
  payload: { workspaceId, periodStart, periodEnd },
});
```

The worker should also make side effects idempotent. Deduplicating enqueue is helpful but not sufficient because messages can be delivered more than once.

### Retry Classification

Not every failure deserves a retry.

| Failure class | Retry? | Handling |
|---|---|---|
| Transient network or service unavailable | Yes | Exponential backoff with jitter |
| Rate limited | Yes | Respect retry-after signals when available |
| Validation error | No | Mark terminal failure and expose the fixable input issue |
| Missing permission | No | Mark terminal failure and request operator action |
| Partial progress | Yes | Resume from checkpoint instead of restarting |
| Unknown failure | Limited | Retry a small number of times, then dead-letter with context |

Use jitter so a shared outage does not cause every worker to retry at the same moment:

```typescript
function retryDelayMs(attempt: number) {
  const base = 1000;
  const cap = 5 * 60 * 1000;
  const exponential = Math.min(base * 2 ** attempt, cap);
  const jitter = Math.floor(Math.random() * base);
  return exponential + jitter;
}
```

### Checkpointing

Long jobs need resumable checkpoints. A checkpoint should identify the last committed unit of work, not just a percentage.

```typescript
async function processPages(jobId: string) {
  let cursor = await loadCheckpoint(jobId);

  while (true) {
    const page = await fetchNextPage(cursor);
    if (page.items.length === 0) break;

    await processBatch(page.items);
    cursor = page.nextCursor;
    await saveCheckpoint(jobId, cursor);
    await updateProgress(jobId, { stage: "processing", processed: page.totalProcessed });
  }
}
```

### Progress Throttling

Progress writes are product value only when they communicate meaningful change. Updating progress after every item in a large batch can overload the same database or cache the job is trying to use.

Use one of these gates:

- Update every N items.
- Update every T seconds.
- Update when the stage changes.
- Update at completion or terminal failure.

## User-Facing Progress

The UI does not need internal worker details. It needs a stable status contract.

| Duration | Progress contract | UX expectation |
|---|---|---|
| Under 5 seconds | Pending state only | Inline spinner or disabled action |
| 5-30 seconds | Status plus short message | Progress bar or step label |
| 30 seconds-5 minutes | Status, stage, count, and cancel option when safe | Dedicated progress panel or status row |
| Over 5 minutes | Durable status page plus completion signal | User can leave and return later |

Avoid fake precision. If you do not know the denominator, report stages or processed counts instead of a misleading percentage.

## Concurrency And Priority

Concurrency limits protect shared resources. Define at least one limit before shipping a worker:

| Limit | Protects | Example |
|---|---|---|
| Global worker concurrency | CPU, memory, queue pressure | Max 10 running jobs total |
| Per-workspace concurrency | Fairness and duplicate work | Max 1 import per workspace |
| Per-job-type concurrency | Hot paths and external services | Max 3 report renders |
| Rate limit | External calls or expensive writes | Max 100 requests per minute |

Priority should reorder queued work, not bypass safety. A high-priority job still needs idempotency, leases, and retry policy.

## Observability

Background jobs need enough telemetry to answer four questions without reading code:

- Was the job enqueued?
- Did a worker claim it?
- What progress or checkpoint was last committed?
- Did it succeed, fail terminally, retry, or get cancelled?

Log job ID, type, attempt number, state transitions, duration, failure class, and queue latency. Emit metrics for queue depth, age of oldest queued job, success rate, retry rate, terminal failure rate, and worker saturation. Trace multi-step jobs when a single user action fans out into several worker operations.

## Verification

After applying this skill, verify:

- [ ] Long or unbounded work is outside the interactive request path.
- [ ] Every enqueued job has a durable status that can be queried after refresh or worker restart.
- [ ] The job contract includes idempotency, attempts, progress, result, and failure reason.
- [ ] Retry policy distinguishes transient, rate-limit, validation, permission, partial-progress, and unknown failures.
- [ ] Backoff includes jitter or an equivalent herd-prevention mechanism.
- [ ] Long jobs checkpoint the last committed unit of work.
- [ ] Progress updates are throttled by item count, time, stage, or completion.
- [ ] Worker concurrency is bounded globally and at any needed fairness boundary.
- [ ] Terminal failure and cancellation are visible to users or operators.
- [ ] Tests or manual probes cover duplicate enqueue, retry, resume, and terminal failure behavior.

## Do NOT Use When

| Use instead | When |
|---|---|
| `cron-scheduling` | You are choosing when recurring work starts, validating cron expressions, or preventing overlap in a scheduled trigger. |
| `real-time-updates` | You are choosing polling, Server-Sent Events, or WebSocket transport for browser freshness. |
| `event-contract-design` | You are defining async event envelopes, topic names, replay semantics, or producer/consumer compatibility. |
| `observability-modeling` | You are designing telemetry vocabulary across logs, metrics, traces, and alerts without changing job execution behavior. |
| `debugging` | A deployed worker or queue is already failing and needs root-cause investigation. |

## Anti-Patterns

| Anti-pattern | Why it fails | Better pattern |
|---|---|---|
| Long work in a request handler | Timeouts and partial side effects are user-visible failures | Enqueue durable work and return a job ID |
| Fire-and-forget without a status record | No one can tell whether work ran, failed, or is still pending | Store job state and expose status |
| Retrying every failure | Validation and permission failures waste capacity and hide real action items | Classify failures before retrying |
| Restarting from zero after partial progress | Retries get slower and can duplicate side effects | Save checkpoints at committed boundaries |
| Unlimited workers | Shared resources get saturated during spikes | Bound concurrency and add leases |
| Progress update per item | Progress tracking becomes the bottleneck | Throttle progress writes |
| Queue code owns domain rules | Worker infrastructure becomes hard to test and reuse | Keep domain logic in services; workers orchestrate execution |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `backend-engineering`
- Deployment: `portable`
- Domain: `engineering/async/background-jobs`

**When to use**
- move this report generation out of the API handler and still show progress
- design a queue-backed import job that can resume after failure
- choose retry and dead-letter behavior for a worker
- avoid duplicate processing when a job is enqueued twice
- add cancellation and progress to a long-running export
- Triggers: `background-jobs-skill`, `job-queue-skill`, `async-processing-skill`, `long-running-task-skill`, `worker-pattern-skill`

**Not for**
- choose the cron expression for a daily run
- design an SSE or WebSocket browser update channel
- define an event envelope and topic naming standard
- debug why this already-running worker crashed
- model the database schema for the business entity being processed

**Related skills**
- Related: `real-time-updates`

**Concept**
- Mental model: A background job system has five primitives: a producer records durable work, a queue orders and deduplicates it, a worker leases and executes it, a state store records progress and outcomes, and a notification path tells humans or systems what changed. Reliability comes from making each primitive explicit instead of hiding long work inside a request handler.
- Purpose: Background jobs keep interactive requests short while preserving reliable processing for slow, retryable, or batch-oriented work. They replace timeout-prone inline execution and untracked fire-and-forget calls with durable state, resumable progress, controlled concurrency, and observable outcomes.
- Boundary: This skill is not schedule design, browser push transport design, event schema design, or incident debugging. It begins after work has been requested and ends with execution state, retry, progress, completion, cancellation, and failure handling.
- Analogy: A background job is a numbered work order in a shop: the front desk accepts the request, the workshop picks it up when capacity exists, and the status board shows where it is.
- Common misconception: Putting work in a worker is not enough. Without durable state, idempotency, progress, retry policy, and observability, a background job is just an invisible request handler with a longer timeout.

**Keywords**
- `background jobs`, `job queue`, `worker queue`, `async processing`, `long-running task`, `retry backoff`, `dead letter queue`, `job progress`, `checkpointing`, `worker concurrency`, `idempotent job`, `queue lease`, `job cancellation`

<!-- skill-graph-context:end -->
