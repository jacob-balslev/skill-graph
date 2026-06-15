'use strict';

const fs = require('fs');
const path = require('path');

const REVIEW_SCHEMA_VERSION = 1;
const DECISIONS = new Set(['pending', 'approved', 'disapproved']);
const GROUP_BY = ['none', 'skill', 'model', 'verdict', 'decision'];

// Sort strategies for the findings review list. 'disposition-priority' (the default) surfaces the
// findings an agent most wants accepted (kept/incorporated) FIRST, so the highest-incentive-to-exploit
// items get a human's eyes before they are buried at the bottom of a long ledger. 'decision-status'
// surfaces still-pending (undecided) findings first so the reviewer always sees outstanding work.
// 'original' preserves the source order. There is deliberately NO bulk-approve sort or action — every
// finding is decided individually; sort only reorders WHICH finding the human looks at next.
const SORT_BY = ['disposition-priority', 'original', 'decision-status'];

// Lower rank = surfaced first. A contribution's `verdict` carries the merge-ledger `disposition`.
const DISPOSITION_PRIORITY = {
  kept: 0, incorporated: 0, accepted: 0, approved: 0, applicable: 0,
  mixed: 1, partial: 1, provisional: 1,
  deferred: 2, 'deferred-to-eval': 2,
  rejected: 3, dropped: 3, disapproved: 3,
};
// Evidence-strength tiebreak within the same disposition (stronger evidence surfaces first).
const EVIDENCE_PRIORITY = {
  'direct-file-line': 0, 'command-output': 1, 'external-source': 2, inference: 3, unsupported: 4,
};
// 'decision-status' sort: pending (undecided) first so the reviewer never loses sight of open work.
const DECISION_STATUS_PRIORITY = { pending: 0, approved: 1, disapproved: 2 };

// Fallback saved views when no review-views config file is present. The interactive viewer cycles
// these with the `v` key; a config file (skill-audit-loop/review-views.json) overrides this list.
const DEFAULT_REVIEW_VIEWS = [
  { name: 'All', group_by: 'none', sort: 'disposition-priority' },
  { name: 'Pending first', sort: 'decision-status' },
  { name: 'Kept (agent wants accepted)', verdict: 'kept', sort: 'disposition-priority' },
  { name: 'By skill', group_by: 'skill', sort: 'disposition-priority' },
];

function oneLine(value, max = 180) {
  if (value == null) return null;
  let text = null;
  if (typeof value === 'string') text = value;
  else if (typeof value === 'number' || typeof value === 'boolean') text = String(value);
  else {
    try { text = JSON.stringify(value); } catch (_) { text = String(value); }
  }
  text = text.replace(/\s+/g, ' ').trim();
  if (!text) return null;
  return text.length > max ? `${text.slice(0, Math.max(0, max - 3))}...` : text;
}

function firstText(...values) {
  for (const value of values) {
    if (Array.isArray(value)) {
      const nested = firstText(...value);
      if (nested) return nested;
    } else {
      const text = oneLine(value);
      if (text) return text;
    }
  }
  return null;
}

function normalizeDecision(value) {
  const raw = oneLine(value, 40);
  if (!raw) return 'pending';
  const lower = raw.toLowerCase();
  if (lower === 'approve' || lower === 'accepted' || lower === 'accept' || lower === 'kept') return 'approved';
  if (lower === 'reject' || lower === 'rejected' || lower === 'declined' || lower === 'deny') return 'disapproved';
  return DECISIONS.has(lower) ? lower : 'pending';
}

function sourceText(raw = {}) {
  return firstText(
    raw.source,
    raw.sources,
    raw.surfaced_by,
    raw.corroborated_by,
    raw.accepted_by,
    raw.author,
  );
}

function peekFields(raw = {}) {
  const candidates = [
    ['note', raw.note],
    ['proposal', raw.proposal || raw.latest_proposal],
    ['review', raw.review || raw.latest_review],
    ['verdict', raw.verdict || raw.disposition],
    ['evidence', raw.evidence || raw.evidence_strength],
    ['corroborated', raw.corroborated_by],
    ['reason', raw.reason || raw.rationale],
  ];
  const seen = new Set();
  const rows = [];
  for (const [label, value] of candidates) {
    const text = oneLine(value, 220);
    if (!text || seen.has(`${label}:${text}`)) continue;
    seen.add(`${label}:${text}`);
    rows.push({ label, text });
  }
  return rows;
}

function normalizeFinding(raw, index = 0) {
  if (typeof raw === 'string') {
    return {
      id: `finding-${index + 1}`,
      title: oneLine(raw) || `Finding ${index + 1}`,
      detail: null,
      decision: 'pending',
      peek: [],
    };
  }
  const item = raw && typeof raw === 'object' ? raw : {};
  const id = firstText(item.id, item.finding_id, item.contribution_id, item.key, item.slug) || `finding-${index + 1}`;
  const title = firstText(
    item.title,
    item.summary,
    item.contribution,
    item.finding,
    item.issue,
    item.claim,
    item.description,
    item.note,
    item.reason,
  ) || `Finding ${index + 1}`;
  const detail = firstText(item.detail, item.description, item.rationale, item.reason, item.note, item.evidence, item.format_loss);
  return {
    id,
    title,
    detail: detail && detail !== title ? detail : null,
    skill: firstText(item.skill, item.skill_slug),
    model: firstText(item.model, item.agent, item.reviewer),
    verdict: firstText(item.verdict, item.disposition, item.status),
    severity: firstText(item.severity, item.priority, item.tier),
    source: sourceText(item),
    decision: normalizeDecision(item.decision || item.review_decision),
    peek: peekFields(item),
    raw: item,
  };
}

function rawFindingArrays(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return [payload];
  if (typeof payload !== 'object') return [];
  return [
    payload.findings,
    payload.contributions,
    payload.merge_ledger && payload.merge_ledger.contributions,
    payload.mergeLedger && payload.mergeLedger.contributions,
    payload.review && payload.review.findings,
    payload.audit && payload.audit.findings,
  ].filter(Array.isArray);
}

function extractFindings(payload) {
  const arrays = rawFindingArrays(payload);
  const findings = [];
  for (const arr of arrays) {
    arr.forEach((raw) => findings.push(normalizeFinding(raw, findings.length)));
  }
  return findings;
}

// ── Markdown merge-ledger parsing (single-model runs write merge-ledger.md, not .json) ──
// Single-model audit/improve runs emit a free-form markdown ledger whose shape varies by the model
// and era that wrote it. There is no single schema, so this is a BEST-EFFORT extractor for the two
// structured shapes seen in the corpus; a ledger with neither (e.g. one that only lists file-change
// bullets) honestly yields zero findings rather than fabricated ones.

// Shape A — a pipe table whose header carries a finding-ish column, e.g.
//   | Finding | Decision | Evidence |
//   | --- | --- | --- |
//   | F1: ... | Fixed | ... |
// The header guard means a non-finding table (e.g. a Verdicts table) is skipped, not mis-parsed.
function parseMarkdownTableFindings(text) {
  const lines = String(text || '').split(/\r?\n/);
  const out = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (!/^\s*\|.*\|\s*$/.test(lines[i])) continue;
    const headers = lines[i].split('|').slice(1, -1).map((c) => c.trim().toLowerCase());
    const findingCol = headers.findIndex((h) => /finding|issue|contribution|claim/.test(h));
    const sepOk = /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1] || '');
    if (findingCol < 0 || !sepOk) continue;
    const decisionCol = headers.findIndex((h) => /decision|disposition|verdict|status/.test(h));
    const evidenceCol = headers.findIndex((h) => /evidence|reason|basis|note|detail/.test(h));
    let r = i + 2;
    for (; r < lines.length && /^\s*\|.*\|\s*$/.test(lines[r]); r += 1) {
      const cells = lines[r].split('|').slice(1, -1).map((c) => c.trim());
      const titleCell = cells[findingCol] || '';
      if (!titleCell) continue;
      const m = titleCell.match(/^([A-Za-z]+\d+)\s*[:.\-—]\s*(.*)$/);
      out.push({
        id: m ? m[1] : null,
        finding: m ? m[2] : titleCell,
        disposition: decisionCol >= 0 ? (cells[decisionCol] || null) : null,
        evidence: evidenceCol >= 0 ? (cells[evidenceCol] || null) : null,
      });
    }
    i = r - 1;
  }
  return out;
}

// Shape B — `### ` finding sections, e.g.
//   ## Findings (examined 4, report 4)
//   ### F1 — category:DRIFT (STALE), ..., severity P1 — FILED → Linear
//   <body...>
// A `### ` heading is treated as a finding only when it looks like one: an F<n>/C<n>-style id, OR it
// sits under a `## Findings`/`## Contributions` section. Severity + disposition are pulled from the body.
function parseMarkdownSectionFindings(text) {
  const lines = String(text || '').split(/\r?\n/);
  const sections = [];
  let cur = null;
  let inFindingsSection = false;
  const flush = () => { if (cur) { sections.push(cur); cur = null; } };
  for (const line of lines) {
    const h2 = line.match(/^##\s+(.*\S)\s*$/);
    if (h2) { flush(); inFindingsSection = /finding|contribution/i.test(h2[1]); continue; }
    if (/^#\s/.test(line)) { flush(); inFindingsSection = false; continue; }
    const h3 = line.match(/^###\s+(.*\S)\s*$/);
    if (h3) {
      flush();
      const heading = h3[1];
      const idm = heading.match(/^([A-Za-z]+\d+)\s*[:.\-—]\s*(.*)$/);
      const looksLikeFinding = inFindingsSection || /^[A-Za-z]+\d+\b/.test(heading);
      cur = looksLikeFinding
        ? { id: idm ? idm[1] : null, title: (idm ? idm[2] : heading) || heading, body: [] }
        : null;
      continue;
    }
    if (cur) cur.body.push(line);
  }
  flush();
  return sections.map((s) => {
    const body = s.body.join('\n').trim();
    const sev = `${s.title} ${body}`.match(/severity[:\s]+(P[0-4]|CRITICAL|HIGH|MEDIUM|LOW|INFO)/i);
    const disp = body.match(/disposition[:\s]+([^\n]+)/i);
    return {
      id: s.id,
      finding: s.title,
      description: body || null,
      severity: sev ? sev[1].toUpperCase() : null,
      disposition: disp ? oneLine(disp[1], 80) : null,
    };
  });
}

// Best-effort markdown ledger → raw finding objects (both shapes, deduped by id||title). Returns []
// for an unstructured ledger (the honest answer when a markdown ledger carries no findings table).
function parseMarkdownLedger(text) {
  const combined = [...parseMarkdownSectionFindings(text), ...parseMarkdownTableFindings(text)];
  const seen = new Set();
  const out = [];
  for (const f of combined) {
    const key = (f.id || f.finding || '').toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(f);
  }
  return out;
}

// Load a findings source file regardless of format: JSON merge-ledger / heartbeat / array first, and
// on a parse failure fall back to the best-effort markdown ledger parser. Content-sniffing, so it
// works for both merge-ledger.json (multi-model) and merge-ledger.md (single-model) by extension OR
// content. Returns normalized findings. Read-only; returns [] on a missing/unreadable file.
function loadFindingsFile(filePath) {
  if (!filePath) return [];
  let text;
  try { text = fs.readFileSync(filePath, 'utf8'); } catch (_) { return []; }
  try {
    return extractFindings(JSON.parse(text));
  } catch (_) { /* not JSON — treat as a markdown ledger */ }
  return parseMarkdownLedger(text).map((raw, i) => normalizeFinding(raw, i));
}

function mergeFindings(...findingLists) {
  const merged = [];
  const usedIds = new Map();
  for (const list of findingLists) {
    for (const raw of (Array.isArray(list) ? list : [])) {
      const finding = raw && raw.title ? raw : normalizeFinding(raw, merged.length);
      const baseId = finding.id || `finding-${merged.length + 1}`;
      const seen = usedIds.get(baseId) || 0;
      usedIds.set(baseId, seen + 1);
      merged.push(seen === 0 ? finding : { ...finding, id: `${baseId}-${seen + 1}` });
    }
  }
  return merged;
}

function filterFindings(findings, filters = {}) {
  const text = oneLine(filters.text, 120);
  const skill = oneLine(filters.skill, 120);
  const model = oneLine(filters.model, 120);
  const verdict = oneLine(filters.verdict, 120);
  return (Array.isArray(findings) ? findings : []).filter((finding) => {
    if (skill && !(finding.skill || '').toLowerCase().includes(skill.toLowerCase())) return false;
    if (model && !(finding.model || finding.source || '').toLowerCase().includes(model.toLowerCase())) return false;
    if (verdict && !(finding.verdict || '').toLowerCase().includes(verdict.toLowerCase())) return false;
    if (!text) return true;
    const haystack = [
      finding.id,
      finding.title,
      finding.detail,
      finding.skill,
      finding.model,
      finding.verdict,
      finding.severity,
      finding.source,
      ...(finding.peek || []).map((p) => p.text),
    ].filter(Boolean).join(' ').toLowerCase();
    return haystack.includes(text.toLowerCase());
  });
}

function createReviewState(source = {}) {
  return {
    schema_version: REVIEW_SCHEMA_VERSION,
    updated_at: new Date().toISOString(),
    source,
    decisions: {},
  };
}

function normalizeReviewState(value, source = {}) {
  const state = value && typeof value === 'object' ? value : {};
  const decisions = state.decisions && typeof state.decisions === 'object' ? state.decisions : {};
  return {
    schema_version: REVIEW_SCHEMA_VERSION,
    updated_at: oneLine(state.updated_at, 80) || new Date().toISOString(),
    source: state.source && typeof state.source === 'object' ? { ...source, ...state.source } : source,
    decisions: { ...decisions },
  };
}

function loadReviewState(file, source = {}) {
  if (!file) return createReviewState(source);
  try {
    return normalizeReviewState(JSON.parse(fs.readFileSync(file, 'utf8')), source);
  } catch (_) {
    return createReviewState(source);
  }
}

function writeReviewState(file, state) {
  if (!file) return;
  const normalized = normalizeReviewState(state);
  const tmp = `${file}.tmp-${process.pid}`;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(tmp, `${JSON.stringify(normalized, null, 2)}\n`);
  fs.renameSync(tmp, file);
}

function applyFindingDecision(state, findingId, decision, nowIso = new Date().toISOString(), note = undefined) {
  if (!findingId) return normalizeReviewState(state);
  const nextDecision = normalizeDecision(decision);
  const next = normalizeReviewState(state);
  next.updated_at = nowIso;
  const existing = next.decisions[findingId] || {};
  const record = { decision: nextDecision, decided_at: nowIso };
  // A bare decision change (e.g. the `a`/`d`/`u` keys) preserves any note already attached; only an
  // explicit note argument (the `c` key) overwrites it. Passing an empty string clears the note.
  const resolvedNote = note !== undefined ? oneLine(note, 400) : (existing.note || null);
  if (resolvedNote) record.note = resolvedNote;
  next.decisions[findingId] = record;
  return next;
}

function decisionFor(finding, reviewState = {}) {
  const state = reviewState && typeof reviewState === 'object' ? reviewState : {};
  const stored = state.decisions && finding && state.decisions[finding.id];
  return normalizeDecision((stored && stored.decision) || (finding && finding.decision));
}

function decisionRecord(finding, reviewState = {}) {
  const state = reviewState && typeof reviewState === 'object' ? reviewState : {};
  const stored = (state.decisions && finding && state.decisions[finding.id]) || {};
  return {
    decision: normalizeDecision(stored.decision || (finding && finding.decision)),
    decided_at: oneLine(stored.decided_at, 80) || null,
    note: oneLine(stored.note, 400) || null,
  };
}

// Returns the index of the next/prev finding still in the `pending` (undecided) state, wrapping
// around the list. direction > 0 walks forward, direction < 0 walks backward. Returns -1 when no
// finding is pending. This is the anti-exploit navigation primitive: it lets the reviewer walk every
// undecided finding without ever offering a batch action — each one is still decided individually.
function nextPendingIndex(findings, reviewState = {}, fromIndex = -1, direction = 1) {
  const list = Array.isArray(findings) ? findings : [];
  const n = list.length;
  if (!n) return -1;
  const step = direction < 0 ? -1 : 1;
  for (let i = 1; i <= n; i += 1) {
    const idx = (((fromIndex + step * i) % n) + n) % n;
    if (decisionFor(list[idx], reviewState) === 'pending') return idx;
  }
  return -1;
}

function decisionCounts(findings, reviewState = {}) {
  const counts = { approved: 0, disapproved: 0, pending: 0, total: 0 };
  for (const finding of (Array.isArray(findings) ? findings : [])) {
    counts.total += 1;
    counts[decisionFor(finding, reviewState)] += 1;
  }
  return counts;
}

function clip(value, width) {
  const text = oneLine(value, Math.max(10, width + 3)) || '';
  return text.length > width ? `${text.slice(0, Math.max(0, width - 3))}...` : text;
}

function normalizeGroupBy(value) {
  const raw = oneLine(value, 40);
  return GROUP_BY.includes(raw) ? raw : 'none';
}

function normalizeSort(value) {
  const raw = oneLine(value, 40);
  return SORT_BY.includes(raw) ? raw : 'disposition-priority';
}

function dispositionRank(finding) {
  const v = oneLine(finding && finding.verdict, 40);
  if (!v) return 5;
  const key = v.toLowerCase();
  return Object.prototype.hasOwnProperty.call(DISPOSITION_PRIORITY, key) ? DISPOSITION_PRIORITY[key] : 4;
}

function evidenceRank(finding) {
  const raw = (finding && finding.raw) || {};
  const e = oneLine(raw.evidence_strength, 40);
  if (!e) return 9;
  const key = e.toLowerCase();
  return Object.prototype.hasOwnProperty.call(EVIDENCE_PRIORITY, key) ? EVIDENCE_PRIORITY[key] : 8;
}

// Reorders findings WITHOUT mutating the input (returns a new array). Sorts are stable — ties fall
// back to original source order. 'decision-status' needs reviewState to read each finding's decision.
function sortFindings(findings, sortBy = 'disposition-priority', reviewState = {}) {
  const list = Array.isArray(findings) ? findings.slice() : [];
  const mode = normalizeSort(sortBy);
  if (mode === 'original') return list;
  const decorated = list.map((finding, i) => ({ finding, i }));
  if (mode === 'decision-status') {
    decorated.sort((a, b) => {
      const da = DECISION_STATUS_PRIORITY[decisionFor(a.finding, reviewState)];
      const db = DECISION_STATUS_PRIORITY[decisionFor(b.finding, reviewState)];
      return (da == null ? 3 : da) - (db == null ? 3 : db) || a.i - b.i;
    });
  } else {
    decorated.sort((a, b) => {
      const dr = dispositionRank(a.finding) - dispositionRank(b.finding);
      if (dr) return dr;
      const er = evidenceRank(a.finding) - evidenceRank(b.finding);
      if (er) return er;
      return a.i - b.i;
    });
  }
  return decorated.map((d) => d.finding);
}

// Loads the saved review views (gh-dash-style named filter/group/sort presets) from a JSON config
// file shaped { views: [{ name, filter?, skill?, model?, verdict?, group_by?, sort? }] }. Read-only;
// returns the default fallback list when the file is missing, unreadable, or carries no usable views.
function loadReviewViews(file) {
  if (!file) return DEFAULT_REVIEW_VIEWS.slice();
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    const views = Array.isArray(parsed) ? parsed : (parsed && Array.isArray(parsed.views) ? parsed.views : null);
    const clean = (views || [])
      .filter((v) => v && typeof v === 'object')
      .map((v, i) => ({
        name: oneLine(v.name, 60) || `View ${i + 1}`,
        filter: oneLine(v.filter, 120) || null,
        skill: oneLine(v.skill, 120) || null,
        model: oneLine(v.model, 120) || null,
        verdict: oneLine(v.verdict, 120) || null,
        group_by: normalizeGroupBy(v.group_by),
        sort: normalizeSort(v.sort),
      }));
    return clean.length ? clean : DEFAULT_REVIEW_VIEWS.slice();
  } catch (_) {
    return DEFAULT_REVIEW_VIEWS.slice();
  }
}

function fieldValue(finding, field, reviewState = {}) {
  if (!finding) return null;
  if (field === 'decision') return decisionFor(finding, reviewState);
  return finding[field] || null;
}

function groupingEntries(findings, reviewState = {}, groupBy = 'none') {
  const normalized = normalizeGroupBy(groupBy);
  const rows = [];
  let current = null;
  const counts = new Map();
  if (normalized !== 'none') {
    for (const finding of (Array.isArray(findings) ? findings : [])) {
      const key = fieldValue(finding, normalized, reviewState) || '(none)';
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  (Array.isArray(findings) ? findings : []).forEach((finding, index) => {
    if (normalized !== 'none') {
      const key = fieldValue(finding, normalized, reviewState) || '(none)';
      if (key !== current) {
        current = key;
        rows.push({ type: 'group', label: `${normalized}: ${key}`, count: counts.get(key) || 0 });
      }
    }
    rows.push({ type: 'finding', finding, index });
  });
  return rows;
}

function pad(text, width) {
  const s = String(text || '');
  if (s.length >= width) return s.slice(0, width);
  return s + ' '.repeat(width - s.length);
}

function wrap(value, width, maxLines = 4) {
  const text = oneLine(value, 2000);
  if (!text) return [];
  const limit = Math.max(20, width);
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    if (!line) line = word;
    else if (line.length + 1 + word.length <= limit) line += ` ${word}`;
    else {
      lines.push(line);
      line = word;
      if (lines.length >= maxLines) break;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (lines.length === maxLines && words.join(' ').length > lines.join(' ').length) {
    lines[lines.length - 1] = clip(lines[lines.length - 1], Math.max(4, limit - 1));
  }
  return lines;
}

function compactMeta(finding) {
  return [
    finding.skill,
    finding.model || finding.source,
    finding.verdict,
  ].filter(Boolean).join('/');
}

function tableLines(findings, reviewState, opts = {}) {
  const width = Math.max(54, Number(opts.width) || 72);
  const selectedIndex = opts.selectedIndex || 0;
  const groupBy = normalizeGroupBy(opts.groupBy);
  const rows = [];
  const numberWidth = Math.max(3, String((findings || []).length).length + 1);
  const decisionWidth = 11;
  const metaWidth = Math.max(16, Math.min(28, Math.floor(width * 0.28)));
  const titleWidth = Math.max(12, width - numberWidth - decisionWidth - metaWidth - 8);
  rows.push(`${pad('#', numberWidth)} ${pad('Decision', decisionWidth)} ${pad('Scope', metaWidth)} Finding`);
  rows.push('-'.repeat(Math.min(width, numberWidth + decisionWidth + metaWidth + titleWidth + 4)));
  for (const entry of groupingEntries(findings, reviewState, groupBy)) {
    if (entry.type === 'group') {
      rows.push(clip(`-- ${entry.label} (${entry.count}) --`, width));
      continue;
    }
    const finding = entry.finding;
    const selected = entry.index === selectedIndex;
    const marker = selected ? '>' : ' ';
    const number = `${entry.index + 1}.`;
    const decision = decisionFor(finding, reviewState);
    rows.push(`${marker}${pad(number, numberWidth)} ${pad(decision, decisionWidth)} ${pad(clip(compactMeta(finding), metaWidth), metaWidth)} ${clip(finding.title, titleWidth)}`);
  }
  return rows;
}

function previewLines(finding, reviewState, opts = {}) {
  const width = Math.max(32, Number(opts.width) || 60);
  const lines = [];
  if (!finding) {
    lines.push('Preview');
    lines.push('No finding selected.');
    return { lines, buttonLineIndex: -1, buttons: [] };
  }
  const record = decisionRecord(finding, reviewState);
  const decision = record.decision;
  lines.push('Preview');
  lines.push(`ID: ${clip(finding.id, width - 4)}`);
  lines.push(`Decision: ${decision}`);
  if (record.note) wrap(`Note: ${record.note}`, width, 3).forEach((line) => lines.push(line));
  const meta = [
    finding.skill && `Skill: ${finding.skill}`,
    finding.model && `Model: ${finding.model}`,
    finding.verdict && `Verdict: ${finding.verdict}`,
    finding.severity && `Severity: ${finding.severity}`,
    finding.source && `Source: ${finding.source}`,
  ].filter(Boolean);
  meta.forEach((line) => lines.push(clip(line, width)));
  lines.push('');
  lines.push('Finding');
  wrap(finding.title, width, 4).forEach((line) => lines.push(line));
  if (finding.detail) {
    lines.push('');
    lines.push('Detail');
    wrap(finding.detail, width, 4).forEach((line) => lines.push(line));
  }
  if (finding.peek && finding.peek.length) {
    lines.push('');
    lines.push('Latest material');
    finding.peek.slice(0, 5).forEach((peek) => {
      wrap(`${peek.label}: ${peek.text}`, width, 2).forEach((line) => lines.push(line));
    });
  }
  lines.push('');
  const buttonLine = '[Approve] [Disapprove] [Pending]';
  const buttonLineIndex = lines.length;
  lines.push(buttonLine);
  return {
    lines,
    buttonLineIndex,
    buttons: [
      { label: 'Approve', action: 'approved', colStart: 1, colEnd: 9 },
      { label: 'Disapprove', action: 'disapproved', colStart: 11, colEnd: 22 },
      { label: 'Pending', action: 'pending', colStart: 24, colEnd: 32 },
    ],
  };
}

function renderFindingsReview(findings, reviewState = {}, opts = {}) {
  const width = Math.max(60, Number(opts.width) || 100);
  const rows = [];
  const hitTargets = [];
  const visible = Array.isArray(findings) ? findings : [];
  const selectedIndex = visible.length
    ? Math.min(Math.max(0, Number(opts.selectedIndex) || 0), visible.length - 1)
    : 0;
  const totalFindings = Number.isFinite(opts.totalFindings) ? opts.totalFindings : visible.length;
  const counts = decisionCounts(visible, reviewState);
  const groupBy = normalizeGroupBy(opts.groupBy);
  const decided = counts.approved + counts.disapproved;
  rows.push(`Findings review: ${counts.approved} approved · ${counts.disapproved} disapproved · ${counts.pending} pending · ${visible.length}/${totalFindings} shown`);
  // Completeness banner — the anti-exploit core. Every finding must be decided individually; there is
  // no batch-approve. The review stays loudly INCOMPLETE until the pending count reaches zero.
  if (counts.total > 0 && counts.pending > 0) {
    rows.push(`⚠ REVIEW INCOMPLETE — ${decided} of ${counts.total} decided · ${counts.pending} still pending (decide each individually; n = next pending)`);
  } else if (counts.total > 0) {
    rows.push(`✓ ALL ${counts.total} REVIEWED — ${counts.approved} approved · ${counts.disapproved} disapproved`);
  }
  rows.push('Controls: Up/Down move · n/N next/prev pending · number jumps · a approve · d disapprove · u pending · c note · v view · s sort · g group · mouse-click buttons · q quit');
  const sortLabel = opts.sort ? ` · Sort: ${normalizeSort(opts.sort)}` : '';
  const viewLabel = opts.viewName ? ` · View: ${oneLine(opts.viewName, 40)}` : '';
  rows.push(`Group: ${groupBy}${sortLabel}${viewLabel}`);
  if (opts.reviewFile) rows.push(`Review file: ${opts.reviewFile}`);
  const activeFilters = Object.entries(opts.filters || {}).filter(([, v]) => oneLine(v));
  if (activeFilters.length) rows.push(`Filters: ${activeFilters.map(([k, v]) => `${k}=${oneLine(v)}`).join(' · ')}`);
  if (!visible.length) {
    rows.push('No findings are present in the heartbeat or findings file yet.');
    return { lines: rows, hitTargets };
  }

  const selectedFinding = visible[selectedIndex];
  const wide = width >= 112;
  if (wide) {
    const leftWidth = Math.max(62, Math.min(92, Math.floor(width * 0.58)));
    const rightWidth = Math.max(34, width - leftWidth - 3);
    const left = tableLines(visible, reviewState, { width: leftWidth, selectedIndex, groupBy });
    const preview = previewLines(selectedFinding, reviewState, { width: rightWidth });
    const max = Math.max(left.length, preview.lines.length);
    for (let i = 0; i < max; i += 1) {
      rows.push(`${pad(left[i] || '', leftWidth)} | ${preview.lines[i] || ''}`);
    }
    const buttonRow = rows.length - max + preview.buttonLineIndex + 1;
    const offset = leftWidth + 4;
    preview.buttons.forEach((button) => {
      hitTargets.push({
        row: buttonRow,
        colStart: offset + button.colStart - 1,
        colEnd: offset + button.colEnd - 1,
        index: selectedIndex,
        findingId: selectedFinding.id,
        action: button.action,
      });
    });
  } else {
    tableLines(visible, reviewState, { width, selectedIndex, groupBy }).forEach((line) => rows.push(line));
    rows.push('');
    const preview = previewLines(selectedFinding, reviewState, { width });
    const previewStart = rows.length + 1;
    preview.lines.forEach((line) => rows.push(line));
    preview.buttons.forEach((button) => {
      hitTargets.push({
        row: previewStart + preview.buttonLineIndex,
        colStart: button.colStart,
        colEnd: button.colEnd,
        index: selectedIndex,
        findingId: selectedFinding.id,
        action: button.action,
      });
    });
  }
  return { lines: rows, hitTargets };
}

module.exports = {
  REVIEW_SCHEMA_VERSION,
  DECISIONS,
  GROUP_BY,
  SORT_BY,
  DEFAULT_REVIEW_VIEWS,
  normalizeDecision,
  normalizeGroupBy,
  normalizeSort,
  normalizeFinding,
  extractFindings,
  parseMarkdownLedger,
  loadFindingsFile,
  mergeFindings,
  filterFindings,
  sortFindings,
  loadReviewViews,
  groupingEntries,
  createReviewState,
  normalizeReviewState,
  loadReviewState,
  writeReviewState,
  applyFindingDecision,
  decisionFor,
  decisionRecord,
  decisionCounts,
  nextPendingIndex,
  renderFindingsReview,
};
