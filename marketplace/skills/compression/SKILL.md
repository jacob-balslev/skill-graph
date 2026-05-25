---
name: compression
description: "This skill provides expertise in data and context compression: SaaS payload optimization (Zstd, Brotli, Gzip), database storage compression, and AI context window compression (Semantic Summarization, Token Pruning). Use when optimizing API latency, reducing storage costs, or managing long-running agent sessions near context limits. Do NOT use for image/video lossy compression (use product-photo) or file archiving."
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
  domain: engineering/data
  scope: portable
  owner: skill-graph-maintainer
  freshness: "2026-03-28"
  drift_check: "{\"last_verified\":\"2026-03-28\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"compression\",\"Zstd\",\"Brotli\",\"Gzip\",\"context window\",\"token efficiency\",\"semantic summarization\",\"payload reduction\",\"DB TOAST\"]"
  triggers: "[\"compression-skill\",\"context-compression\",\"payload-optimization\"]"
  relations: "{\"related\":[\"context-window\"],\"boundary\":[\"context-management\",\"summarization\"]}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":90,\"review_cadence\":\"quarterly\"}"
  structural_verdict: UNVERIFIED
  truth_verdict: UNVERIFIED
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v7
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/engineering/data/compression/SKILL.md
---
# Compression

## Domain Context

**What is this skill?** This skill provides expertise in data and context compression: SaaS payload optimization (Zstd, Brotli, Gzip), database storage compression, and AI context window compression (Semantic Summarization, Token Pruning). Use when optimizing API latency, reducing storage costs, or managing long-running agent sessions near context limits. Do NOT use for image/video lossy compression (use product-photo) or file archiving.

## Key Files

| File                                                 | Purpose                                                                                  |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `skills/token-efficiency/SKILL.md`                   | Adjacent authority for prompt and token-budget compression strategy.                     |
| `skills/context-window/SKILL.md`                     | Adjacent authority for compaction timing and context-budget math.                        |
| `scripts/hooks/pre-compact-hook.py`                  | Pre-compaction persistence hook that preserves state before context compression.         |
| `scripts/session/session-ctl.js`                     | Session-control CLI that exposes wrap, clear, and continue operations around compaction. |
| `docs/reference/session-control-wrapper-contract.md` | Canonical session-control contract covering wrap, clear, compact, and resume semantics.  |
| `agent-orchestration/ONBOARDING.md`                  | Workflow context for how session-control and continuation fit the orchestration flow.    |

## Coverage

SaaS payload compression (Zstd, Brotli, Gzip algorithm selection, level tuning, content negotiation), PostgreSQL storage compression (TOAST with Zstd, application-layer blob compression), and AI context window compression (semantic summarization, token pruning, dead context identification, state re-injection). Covers the decision tree for matching algorithms to data types, the `Accept-Encoding` negotiation order, and the three-phase token pruning workflow.

## Philosophy

Compression is the science of increasing information density. In a modern SaaS, it applies at two layers: the **Infrastructure Layer** (reducing bytes on the wire/disk) and the **Intelligence Layer** (reducing tokens in the context window). Without this skill, agents default to generic compression advice that ignores the specific algorithm-to-data-type mapping (e.g., using Gzip everywhere instead of Zstd for dynamic API payloads) and fail to recognize that sub-1KB payloads should skip compression entirely. On the intelligence side, agents routinely let context windows bloat with dead research turns instead of applying structured summarization that preserves evidence paths.

## 1. SaaS Data Compression Decision Tree

Match the compression algorithm to the data type and lifecycle.

| Data Type                  | Recommended              | Why?                                                       |
| -------------------------- | ------------------------ | ---------------------------------------------------------- |
| **Static Assets** (JS/CSS) | Brotli (Level 11)        | Highest ratio for web strings; slow build-time OK.         |
| **Dynamic API** (JSON)     | Zstd (Level 3)           | Fastest decompression; lower TTFB than Gzip.               |
| **Small Payloads** (<1KB)  | None / Custom Dictionary | Compression overhead often increases size for small items. |
| **Large DB Columns**       | Zstd (TOAST)             | Postgres 14+ native support; high speed/low I/O.           |

### Implementation Rules

- **Negotiation**: Always check `Accept-Encoding` header. Order: `zstd` > `br` > `gzip`.
- **Level Selection**: Use Level 3 for dynamic runtime; Level 11 for static build-time.
- **Header Safety**: Ensure `Vary: Accept-Encoding` is set to prevent cache pollution.

## 2. AI Context Compression

Protect the context window by maximizing token density.

### Semantic Summarization

- **Pattern**: Replace raw logs/code with high-density Markdown summaries.
- **Rule**: A summary must preserve **Intent**, **Outcome**, and **Evidence Paths** while removing boilerplate.

### Token Pruning (The "Surgical Cut")

- **Phase 1**: Identify "Dead Context" (e.g., redundant file reads, failed research turns).
- **Phase 2**: Use `/clear` or `/compact` to drop the bottom 50% of the session history.
- **Phase 3**: Re-inject the "State of the Union" summary via Memory MCP.

> **Source**: `skills/token-efficiency/SKILL.md` (Adjacent)

## 3. Storage Compression (Postgres)

Optimize for cost and performance at the database layer.

- **TOAST Compression**: Set `default_toast_compression = 'zstd'` for large JSONB fields.
- **Blob Compression**: For extremely large blobs (>10MB), compress in the application layer (Node.js `zstd` bindings) before storing as `BYTEA`.

## 4. Verification Checklist

```text
COMPRESSION CHECK
=================
[ ] Static assets pre-compressed with Brotli (Level 11)
[ ] API middleware supports Zstd with Gzip fallback
[ ] Vary: Accept-Encoding header present
[ ] AI context summary preserves Evidence Paths
[ ] redundant research/file reads pruned from session
[ ] DB compression matches Postgres version (Zstd if 14+)
[ ] Payloads < 1KB skip compression to avoid overhead
```

## Verification

After applying this skill, verify:

- [ ] Algorithm matches data type per the decision tree (static=Brotli, dynamic API=Zstd, DB=TOAST Zstd)
- [ ] `Accept-Encoding` negotiation respects the `zstd > br > gzip` priority order
- [ ] `Vary: Accept-Encoding` header is set to prevent cache pollution
- [ ] Small payloads (<1KB) are not compressed (overhead exceeds savings)
- [ ] Context summaries preserve Intent, Outcome, and Evidence Paths
- [ ] Token pruning removes dead context (failed research turns, redundant reads) before injecting fresh state

## Do NOT Use When

| Instead of this skill                                                           | Use                     | Why                                                                                 |
| ------------------------------------------------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------- |
| Image/video lossy compression (JPEG quality, WebP, AVIF format selection)       | `product-photo`         | product-photo owns the image pipeline and format selection logic                    |
| Agent session lifecycle (when to compact, context budgets, compaction triggers) | `context-management`    | context-management owns session-level compaction strategy and budget allocation     |
| Token budget allocation and prompt compression techniques                       | `token-efficiency`      | token-efficiency owns the token budget framework; compression handles the mechanics |
| Credential encryption at rest                                                   | `credential-encryption` | credential-encryption covers AES-256-GCM patterns, not data compression             |
