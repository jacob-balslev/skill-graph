---
name: compression
description: "This skill provides expertise in data and context compression: SaaS payload optimization (Zstd, Brotli, Gzip), database storage compression, and AI context window compression (Semantic Summarization, Token Pruning). Use when optimizing API latency, reducing storage costs, or managing long-running agent sessions near context limits. Do NOT use for image/video lossy compression (use product-photo) or file archiving."
license: MIT
compatibility: "Markdown, Git, agent-skill runtimes"
allowed-tools: Read Grep Bash
metadata:
  relations: "{\"related\":[\"context-window\",\"context-management\",\"summarization\",\"cognitive-load-theory\"]}"
  subject: backend-engineering
  scope: "Data and context compression — SaaS payload optimization (Zstd, Brotli, Gzip), database storage compression, and AI context-window compression (semantic summarization, token pruning) — applied to cut API latency, storage cost, and long-running agent context pressure. Portable across any service or agent runtime; principle-grounded, not repo-bound. Excludes lossy image/video compression (product-photo) and file archiving."
  public: "true"
  taxonomy_domain: engineering/data
  stability: experimental
  keywords: "[\"compression\",\"Zstd\",\"Brotli\",\"Gzip\",\"context window\",\"token efficiency\",\"semantic summarization\",\"payload reduction\",\"DB TOAST\"]"
  triggers: "[\"compression-skill\",\"context-compression\",\"payload-optimization\"]"
  grounding: "{\"subject_matter\":\"Portable data and context compression across HTTP content negotiation, web codecs, database TOAST storage, and agent context summarization\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://www.rfc-editor.org/info/rfc8878\",\"https://datatracker.ietf.org/doc/html/rfc7932\",\"https://www.rfc-editor.org/rfc/rfc1952\",\"https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Accept-Encoding\",\"https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Encoding\",\"https://www.postgresql.org/docs/current/storage-toast.html\",\"https://www.postgresql.org/docs/current/runtime-config-client.html#GUC-DEFAULT-TOAST-COMPRESSION\"],\"failure_modes\":[\"algorithm_priority_claim_ignores_client_accept_encoding\",\"compression_applied_to_tiny_payloads_that_grow_after_headers\",\"vary_accept_encoding_omitted_and_cache_polluted\",\"postgres_toast_misstated_as_zstd_native_instead_of_pglz_or_lz4\",\"context_summary_drops_evidence_paths_or_decisions\",\"file_archiving_or_media_transcoding_misrouted_to_general_data_compression\"],\"evidence_priority\":\"equal\"}"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/backend-engineering/compression/SKILL.md
---
# Compression

## Concept of the skill

Data and context compression — SaaS payload optimization (Zstd, Brotli, Gzip), database storage compression, and AI context-window compression (semantic summarization, token pruning) — applied to cut API latency, storage cost, and long-running agent context pressure.


## Domain Context

**What is this skill?** This skill provides expertise in data and context compression: SaaS payload optimization (Zstd, Brotli, Gzip), database storage compression, and AI context window compression (Semantic Summarization, Token Pruning). Use when optimizing API latency, reducing storage costs, or managing long-running agent sessions near context limits. Do NOT use for image/video lossy compression (use product-photo) or file archiving.

## Grounding Sources

Use primary codec and platform references for factual claims: RFC 8878 for Zstandard, RFC 7932 for Brotli, RFC 1952 for Gzip, MDN and HTTP docs for `Accept-Encoding` / `Content-Encoding`, and PostgreSQL's TOAST and `default_toast_compression` documentation for database storage behavior. Keep agent context-compression guidance separate from HTTP/database codec facts: summaries are correct only when they preserve intent, outcome, and evidence paths.

## Coverage

SaaS payload compression (Zstd, Brotli, Gzip algorithm selection, level tuning, content negotiation), PostgreSQL storage compression (TOAST with pglz/lz4 where supported, plus deliberate application-layer blob compression), and AI context window compression (semantic summarization, token pruning, dead context identification, state re-injection). Covers the decision tree for matching algorithms to data types, the `Accept-Encoding` negotiation order, and the three-phase token pruning workflow.

## Philosophy of the skill
Compression is the science of increasing information density. In a modern SaaS, it applies at two layers: the **Infrastructure Layer** (reducing bytes on the wire/disk) and the **Intelligence Layer** (reducing tokens in the context window). Without this skill, agents default to generic compression advice that ignores the specific algorithm-to-data-type mapping (e.g., using Gzip everywhere instead of Zstd for dynamic API payloads) and fail to recognize that sub-1KB payloads should skip compression entirely. On the intelligence side, agents routinely let context windows bloat with dead research turns instead of applying structured summarization that preserves evidence paths.

## 1. SaaS Data Compression Decision Tree

Match the compression algorithm to the data type and lifecycle.

| Data Type                  | Recommended              | Why?                                                       |
| -------------------------- | ------------------------ | ---------------------------------------------------------- |
| **Static Assets** (JS/CSS) | Brotli (Level 11)        | Highest ratio for web strings; slow build-time OK.         |
| **Dynamic API** (JSON)     | Zstd (Level 3)           | Fastest decompression; lower TTFB than Gzip.               |
| **Small Payloads** (<1KB)  | None / Custom Dictionary | Compression overhead often increases size for small items. |
| **Large DB Columns**       | PostgreSQL TOAST pglz/lz4, or explicit application-layer compression | PostgreSQL TOAST supports pglz and lz4 when built with lz4; use application-layer Zstd only when you own encode/decode and query tradeoffs. |

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

- **TOAST Compression**: PostgreSQL TOAST can compress large values with `pglz` by default and `lz4` when PostgreSQL is built with lz4 support. Do not claim native TOAST Zstd unless the deployed database explicitly provides it.
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
[ ] DB compression matches the deployed database's actual TOAST options (`pglz` / `lz4`) or a deliberate application-layer codec
[ ] Payloads < 1KB skip compression to avoid overhead
```

## Verification

After applying this skill, verify:

- [ ] Algorithm matches data type per the decision tree (static=Brotli, dynamic API=Zstd when supported, DB=TOAST pglz/lz4 or explicit application-layer codec)
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

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `backend-engineering`
- Public: `true`
- Domain: `engineering/data`
- Scope: Data and context compression — SaaS payload optimization (Zstd, Brotli, Gzip), database storage compression, and AI context-window compression (semantic summarization, token pruning) — applied to cut API latency, storage cost, and long-running agent context pressure. Portable across any service or agent runtime; principle-grounded, not repo-bound. Excludes lossy image/video compression (product-photo) and file archiving.

**When to use**
- Triggers: `compression-skill`, `context-compression`, `payload-optimization`

**Related skills**
- Related: `context-window`, `context-management`, `summarization`, `cognitive-load-theory`

**Grounding**
- Mode: `universal`
- Truth sources: `https://www.rfc-editor.org/info/rfc8878`, `https://datatracker.ietf.org/doc/html/rfc7932`, `https://www.rfc-editor.org/rfc/rfc1952`, `https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Accept-Encoding`, `https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Encoding`, `https://www.postgresql.org/docs/current/storage-toast.html`, `https://www.postgresql.org/docs/current/runtime-config-client.html#GUC-DEFAULT-TOAST-COMPRESSION`

**Keywords**
- `compression`, `Zstd`, `Brotli`, `Gzip`, `context window`, `token efficiency`, `semantic summarization`, `payload reduction`, `DB TOAST`

<!-- skill-graph-context:end -->
