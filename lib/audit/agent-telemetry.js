'use strict';

// Per-skill agent-run telemetry helpers for token usage, line deltas, JSONL
// receipts, and audit-state runtime pointers.

const fs = require('fs');
const path = require('path');
const { readSidecar, writeSidecarFields } = require('./audit-state-sidecar');

const TELEMETRY_FILENAME = 'agent-telemetry.jsonl';
const TELEMETRY_SCHEMA_VERSION = 1;
const MAX_LCS_CELLS = 2_000_000;

function nowIso() {
  return new Date().toISOString();
}

function todayIsoDate(at = nowIso()) {
  return String(at).slice(0, 10);
}

function splitLines(value) {
  const text = String(value || '').replace(/\r\n/g, '\n');
  if (!text) return [];
  const trimmedFinalNewline = text.endsWith('\n') ? text.slice(0, -1) : text;
  return trimmedFinalNewline ? trimmedFinalNewline.split('\n') : [];
}

function computeLineDelta(beforeText, afterText) {
  const before = splitLines(beforeText);
  const after = splitLines(afterText);
  const beforeLines = before.length;
  const afterLines = after.length;

  if (beforeLines === 0 || afterLines === 0) {
    return {
      before_lines: beforeLines,
      after_lines: afterLines,
      added_lines: afterLines,
      removed_lines: beforeLines,
      net_lines: afterLines - beforeLines,
      algorithm: 'empty-side-fast-path',
    };
  }

  if (beforeLines * afterLines > MAX_LCS_CELLS) {
    return {
      before_lines: beforeLines,
      after_lines: afterLines,
      added_lines: Math.max(afterLines - beforeLines, 0),
      removed_lines: Math.max(beforeLines - afterLines, 0),
      net_lines: afterLines - beforeLines,
      algorithm: 'line-count-fallback',
    };
  }

  let previous = new Array(afterLines + 1).fill(0);
  let current = new Array(afterLines + 1).fill(0);
  for (let i = 1; i <= beforeLines; i += 1) {
    for (let j = 1; j <= afterLines; j += 1) {
      current[j] = before[i - 1] === after[j - 1]
        ? previous[j - 1] + 1
        : Math.max(previous[j], current[j - 1]);
    }
    const tmp = previous;
    previous = current;
    current = tmp.fill(0);
  }

  const common = previous[afterLines];
  return {
    before_lines: beforeLines,
    after_lines: afterLines,
    added_lines: afterLines - common,
    removed_lines: beforeLines - common,
    net_lines: afterLines - beforeLines,
    algorithm: 'lcs',
  };
}

function asNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function firstNumber(obj, names) {
  for (const name of names) {
    if (obj && Object.prototype.hasOwnProperty.call(obj, name)) {
      const n = asNumber(obj[name]);
      if (n !== null) return n;
    }
  }
  return null;
}

function normalizeUsageObject(obj, source) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;
  const input = firstNumber(obj, ['input_tokens', 'prompt_tokens', 'inputTokens', 'promptTokens', 'promptTokenCount']);
  const output = firstNumber(obj, ['output_tokens', 'completion_tokens', 'outputTokens', 'completionTokens', 'candidatesTokenCount']);
  let total = firstNumber(obj, ['total_tokens', 'totalTokens', 'totalTokenCount']);
  if (total === null && input !== null && output !== null) total = input + output;
  if (input === null && output === null && total === null) return null;
  return {
    input_tokens: input,
    output_tokens: output,
    total_tokens: total,
    source,
  };
}

function walkUsage(value, source, out, depth = 0) {
  if (depth > 8 || value === null || value === undefined) return;
  if (typeof value === 'string') {
    collectUsageFromText(value, source, out);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, idx) => walkUsage(item, `${source}[${idx}]`, out, depth + 1));
    return;
  }
  if (typeof value !== 'object') return;

  const direct = normalizeUsageObject(value, source);
  if (direct) out.push(direct);
  for (const [key, child] of Object.entries(value)) {
    walkUsage(child, `${source}.${key}`, out, depth + 1);
  }
}

function collectUsageFromText(text, source, out) {
  const clean = String(text || '').replace(/\x1b\[[0-9;]*m/g, '');
  const trimmed = clean.trim();
  if (!trimmed) return;

  if (trimmed[0] === '{' || trimmed[0] === '[') {
    try {
      walkUsage(JSON.parse(trimmed), `${source}:json`, out, 0);
    } catch (_) {
      // Fall through to JSONL parsing.
    }
  }

  for (const [idx, line] of clean.split(/\r?\n/).entries()) {
    const s = line.trim();
    if (!s || (s[0] !== '{' && s[0] !== '[')) continue;
    try {
      walkUsage(JSON.parse(s), `${source}:jsonl:${idx + 1}`, out, 0);
    } catch (_) {
      // Ignore non-JSON output; absence is recorded explicitly below.
    }
  }
}

function chooseUsage(candidates) {
  if (!candidates.length) {
    return {
      input_tokens: null,
      output_tokens: null,
      total_tokens: null,
      source: 'unavailable',
    };
  }
  return candidates
    .slice()
    .sort((a, b) => {
      const aFields = ['input_tokens', 'output_tokens', 'total_tokens'].filter((k) => a[k] !== null).length;
      const bFields = ['input_tokens', 'output_tokens', 'total_tokens'].filter((k) => b[k] !== null).length;
      if (bFields !== aFields) return bFields - aFields;
      return (Number(b.total_tokens) || 0) - (Number(a.total_tokens) || 0);
    })[0];
}

function extractTokenUsage(...values) {
  const candidates = [];
  values.forEach((value, idx) => walkUsage(value, `input${idx + 1}`, candidates, 0));
  return chooseUsage(candidates);
}

function startAgentTelemetry(meta = {}) {
  return {
    ...meta,
    started_at: nowIso(),
    started_hrtime: process.hrtime.bigint(),
  };
}

function finishAgentTelemetry(start, details = {}) {
  const endedAt = details.ended_at || nowIso();
  const durationMs = details.duration_ms !== undefined
    ? Number(details.duration_ms)
    : Number((process.hrtime.bigint() - start.started_hrtime) / 1_000_000n);
  const beforeText = details.before_text;
  const afterText = details.after_text;
  const lineDelta = details.line_delta !== undefined
    ? details.line_delta
    : (beforeText !== undefined && afterText !== undefined ? computeLineDelta(beforeText, afterText) : null);
  const tokens = details.tokens || extractTokenUsage(details.stdout, details.stderr, details.raw, details.result);

  const entry = {
    schema_version: TELEMETRY_SCHEMA_VERSION,
    timestamp: endedAt,
    skill: start.skill || details.skill || null,
    operation: start.operation || details.operation || null,
    phase: start.phase || details.phase || null,
    agent: start.agent || start.model || details.agent || details.model || null,
    model: start.model || details.model || null,
    backend: start.backend || details.backend || null,
    tier: start.tier || details.tier || null,
    status: details.status || (details.ok === false ? 'failed' : 'completed'),
    ok: details.ok !== false,
    started_at: start.started_at,
    ended_at: endedAt,
    duration_ms: Number.isFinite(durationMs) ? durationMs : null,
    tokens,
    line_delta: lineDelta,
    artifact_path: details.artifact_path || null,
    receipt_path: details.receipt_path || null,
    error: details.error ? String(details.error) : null,
    stdout_bytes: details.stdout !== undefined ? Buffer.byteLength(String(details.stdout || '')) : null,
    stderr_bytes: details.stderr !== undefined ? Buffer.byteLength(String(details.stderr || '')) : null,
  };

  for (const [key, value] of Object.entries(details.extra || {})) {
    if (entry[key] === undefined) entry[key] = value;
  }
  return entry;
}

function skillTelemetryPath(skillDir) {
  return path.join(skillDir, TELEMETRY_FILENAME);
}

function appendJsonl(file, entry) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, `${JSON.stringify(entry)}\n`);
}

function readTelemetrySummary(file) {
  if (!fs.existsSync(file)) {
    return {
      agent_run_count: 0,
      total_duration_ms: 0,
      total_tokens: null,
      tokens_observed_count: 0,
    };
  }
  let count = 0;
  let duration = 0;
  let totalTokens = 0;
  let tokensObserved = 0;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const entry = JSON.parse(line);
      count += 1;
      const ms = Number(entry.duration_ms);
      if (Number.isFinite(ms)) duration += ms;
      const tokens = entry.tokens && Number(entry.tokens.total_tokens);
      if (Number.isFinite(tokens)) {
        totalTokens += tokens;
        tokensObserved += 1;
      }
    } catch (_) {
      // Keep summary best-effort; the append-only feed remains the evidence.
    }
  }
  return {
    agent_run_count: count,
    total_duration_ms: duration,
    total_tokens: tokensObserved > 0 ? totalTokens : null,
    tokens_observed_count: tokensObserved,
  };
}

function appendSkillTelemetry(skillDir, entry, options = {}) {
  if (!skillDir) return { written: false, path: null };
  const skillMd = path.join(skillDir, 'SKILL.md');
  const file = skillTelemetryPath(skillDir);
  appendJsonl(file, entry);

  if (options.updateSidecar === false || !fs.existsSync(skillMd)) {
    return { written: true, path: file };
  }

  try {
    const existing = readSidecar(skillMd);
    if (!existing) return { written: true, path: file };
    const previousRuntime = existing.runtime_telemetry || {};
    const summary = readTelemetrySummary(file);
    const relative = TELEMETRY_FILENAME;
    const lastRun = {
      at: entry.timestamp,
      operation: entry.operation,
      phase: entry.phase,
      agent: entry.agent,
      status: entry.status,
      duration_ms: entry.duration_ms,
      tokens: entry.tokens,
      line_delta: entry.line_delta,
      receipt: relative,
    };
    writeSidecarFields(skillMd, {
      runtime_telemetry: {
        ...previousRuntime,
        feedback_source: previousRuntime.feedback_source || relative,
        run_receipts_source: relative,
        last_updated: todayIsoDate(entry.timestamp),
        last_run: lastRun,
        metrics: {
          ...(previousRuntime.metrics || {}),
          agent_run_count: summary.agent_run_count,
          total_duration_ms: summary.total_duration_ms,
          total_tokens: summary.total_tokens,
          tokens_observed_count: summary.tokens_observed_count,
        },
      },
    });
  } catch (_) {
    // Telemetry append is the durable receipt; sidecar summary is best-effort.
  }
  return { written: true, path: file };
}

module.exports = {
  TELEMETRY_FILENAME,
  TELEMETRY_SCHEMA_VERSION,
  splitLines,
  computeLineDelta,
  extractTokenUsage,
  startAgentTelemetry,
  finishAgentTelemetry,
  skillTelemetryPath,
  appendSkillTelemetry,
  readTelemetrySummary,
};
