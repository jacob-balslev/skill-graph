'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const DEFAULT_AUDIT_ROOT = path.join(__dirname, '..', '..', 'skill-audit-loop', 'progress', 'skill-audits');
const SESSIONS_LEDGER = '_sessions.jsonl';
const SESSIONS_DIR = 'sessions';
const STATE_FILE = 'state.json';

const SESSION_ID_RE = /^[A-Za-z0-9._-]+$/;
const SESSION_STATUSES = new Set(['open', 'paused', 'closed']);
const RUN_ROLES = new Set(['primary', 'comparison', 'retry', 'verification']);
const EVENT_TYPES = new Set([
  'session.created',
  'session.renamed',
  'run.attached',
  'run.detached',
  'cursor.updated',
  'note.added',
  'session.paused',
  'session.closed',
]);

function rootFrom(opts = {}) {
  return path.resolve(opts.auditRoot || DEFAULT_AUDIT_ROOT);
}

function options(first, second) {
  if (typeof first === 'string') return { auditRoot: first, ...(second || {}) };
  return { ...(first || {}) };
}

function sessionOptions(first, second) {
  if (typeof first === 'string') return { auditRoot: first, sessionId: second };
  return { ...(first || {}) };
}

function sessionPaths(auditRoot, sessionId = null) {
  const root = path.resolve(auditRoot || DEFAULT_AUDIT_ROOT);
  const out = {
    auditRoot: root,
    ledger: path.join(root, SESSIONS_LEDGER),
    sessionsDir: path.join(root, SESSIONS_DIR),
  };
  if (sessionId) {
    out.sessionDir = path.join(out.sessionsDir, sessionId);
    out.state = path.join(out.sessionDir, STATE_FILE);
  }
  return out;
}

function cloneJson(value) {
  if (value === undefined || value === null) return value;
  return JSON.parse(JSON.stringify(value));
}

function nowIso(value) {
  const raw = typeof value === 'function' ? value() : value;
  if (raw instanceof Date) return raw.toISOString();
  if (typeof raw === 'string' && !Number.isNaN(Date.parse(raw))) return new Date(raw).toISOString();
  if (raw == null) return new Date().toISOString();
  throw new Error(`invalid timestamp: ${raw}`);
}

function requireString(value, field) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) throw new Error(`${field} is required`);
  return text;
}

function optionalString(value) {
  if (value == null) return undefined;
  const text = String(value).trim();
  return text || undefined;
}

function normalizeSessionId(value) {
  const id = value ? String(value).trim() : `session-${crypto.randomBytes(5).toString('hex')}`;
  if (!SESSION_ID_RE.test(id)) {
    throw new Error(`sessionId must match ${SESSION_ID_RE}`);
  }
  return id;
}

function normalizeTags(tags) {
  if (tags == null) return undefined;
  if (!Array.isArray(tags)) throw new Error('tags must be an array');
  const out = [];
  const seen = new Set();
  for (const tag of tags) {
    const text = optionalString(tag);
    if (!text || seen.has(text)) continue;
    seen.add(text);
    out.push(text);
  }
  return out.length ? out : undefined;
}

function normalizeCursor(cursor) {
  if (cursor == null) return undefined;
  if (!cursor || typeof cursor !== 'object' || Array.isArray(cursor)) {
    throw new Error('currentCursor must be an object');
  }
  return cloneJson(cursor);
}

function hasLatestSegment(value) {
  return String(value || '').split(/[\\/]+/).some((part) => part === 'latest');
}

function normalizeRunRef(raw = {}, attachedAt) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('runRef must be an object');
  }
  const runDir = requireString(raw.runDir, 'runRef.runDir');
  if (hasLatestSegment(runDir)) {
    throw new Error('runRef.runDir must reference a stable run directory, not latest');
  }
  const ref = {
    runId: requireString(raw.runId, 'runRef.runId'),
    skill: requireString(raw.skill, 'runRef.skill'),
    runDir,
    heartbeatPath: requireString(raw.heartbeatPath, 'runRef.heartbeatPath'),
    attachedAt: nowIso(raw.attachedAt || attachedAt),
  };
  const ledgerRef = optionalString(raw.ledgerRef);
  const reviewPath = optionalString(raw.reviewPath);
  const role = optionalString(raw.role);
  if (ledgerRef) ref.ledgerRef = ledgerRef;
  if (reviewPath) ref.reviewPath = reviewPath;
  if (role) {
    if (!RUN_ROLES.has(role)) throw new Error(`invalid runRef.role: ${role}`);
    ref.role = role;
  }
  return ref;
}

function normalizeEvent(raw = {}) {
  const ts = nowIso(raw.ts || raw.now);
  const sessionId = normalizeSessionId(raw.sessionId);
  const type = requireString(raw.type, 'type');
  if (!EVENT_TYPES.has(type)) throw new Error(`invalid session event type: ${type}`);
  const payload = raw.payload == null ? {} : raw.payload;
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('payload must be an object');
  }
  return { ts, sessionId, type, payload: cloneJson(payload) };
}

function readEvents(auditRoot) {
  const file = sessionPaths(auditRoot).ledger;
  let text = '';
  try { text = fs.readFileSync(file, 'utf8'); } catch (err) {
    if (err && err.code === 'ENOENT') return [];
    throw err;
  }
  return text.split(/\r?\n/).filter(Boolean).map((line, index) => {
    try { return normalizeEvent(JSON.parse(line)); } catch (err) {
      throw new Error(`${file}:${index + 1}: ${err.message}`);
    }
  });
}

function appendJsonLine(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, `${JSON.stringify(value)}\n`);
}

function writeJsonAtomic(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp-${process.pid}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  fs.writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`);
  fs.renameSync(tmp, file);
}

function applyEvent(sessions, event) {
  const existing = sessions.get(event.sessionId) || null;
  const payload = event.payload || {};

  if (event.type === 'session.created') {
    const session = {
      sessionId: event.sessionId,
      title: optionalString(payload.title) || 'Untitled session',
      createdAt: event.ts,
      updatedAt: event.ts,
      status: 'open',
      runRefs: [],
    };
    const objective = optionalString(payload.objective);
    const tags = normalizeTags(payload.tags);
    const currentCursor = normalizeCursor(payload.currentCursor);
    if (objective) session.objective = objective;
    if (tags) session.tags = tags;
    if (currentCursor) session.currentCursor = currentCursor;
    sessions.set(event.sessionId, session);
    return;
  }

  if (!existing) return;
  const next = { ...existing, updatedAt: event.ts, runRefs: existing.runRefs.slice() };

  if (event.type === 'session.renamed') {
    next.title = optionalString(payload.title) || next.title;
  } else if (event.type === 'run.attached') {
    const ref = normalizeRunRef(payload.runRef, event.ts);
    const idx = next.runRefs.findIndex((r) => r.runId === ref.runId);
    if (idx >= 0) next.runRefs[idx] = ref;
    else next.runRefs.push(ref);
  } else if (event.type === 'run.detached') {
    const runId = requireString(payload.runId, 'payload.runId');
    next.runRefs = next.runRefs.filter((ref) => ref.runId !== runId);
  } else if (event.type === 'cursor.updated') {
    next.currentCursor = normalizeCursor(payload.currentCursor || {});
  } else if (event.type === 'session.paused') {
    next.status = 'paused';
  } else if (event.type === 'session.closed') {
    next.status = 'closed';
  }

  sessions.set(event.sessionId, next);
}

function reduceEvents(events) {
  const sessions = new Map();
  for (const event of events) applyEvent(sessions, event);
  return sessions;
}

function materialize(first, second) {
  const opts = sessionOptions(first, second);
  const auditRoot = rootFrom(opts);
  const sessions = reduceEvents(readEvents(auditRoot));
  const selected = opts.sessionId ? normalizeSessionId(opts.sessionId) : null;

  if (selected) {
    const session = sessions.get(selected) || null;
    if (!session) return null;
    writeJsonAtomic(sessionPaths(auditRoot, selected).state, session);
    return cloneJson(session);
  }

  const list = [...sessions.values()].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  for (const session of list) {
    writeJsonAtomic(sessionPaths(auditRoot, session.sessionId).state, session);
  }
  return cloneJson(list);
}

function getSession(first, second) {
  const opts = sessionOptions(first, second);
  if (!opts.sessionId) throw new Error('sessionId is required');
  return materialize({ auditRoot: rootFrom(opts), sessionId: opts.sessionId });
}

function listSessions(first) {
  const opts = options(first);
  return materialize({ auditRoot: rootFrom(opts) });
}

function appendEvent(first, second) {
  const opts = options(first, second);
  const auditRoot = rootFrom(opts);
  const event = normalizeEvent(opts);
  appendJsonLine(sessionPaths(auditRoot).ledger, event);
  materialize({ auditRoot, sessionId: event.sessionId });
  return cloneJson(event);
}

function createSession(first, second) {
  const opts = options(first, second);
  const auditRoot = rootFrom(opts);
  const sessionId = normalizeSessionId(opts.sessionId);
  if (reduceEvents(readEvents(auditRoot)).has(sessionId)) {
    throw new Error(`session already exists: ${sessionId}`);
  }
  const event = {
    auditRoot,
    sessionId,
    type: 'session.created',
    ts: nowIso(opts.createdAt || opts.now),
    payload: {
      title: requireString(opts.title || 'Untitled session', 'title'),
    },
  };
  const objective = optionalString(opts.objective);
  const tags = normalizeTags(opts.tags);
  const currentCursor = normalizeCursor(opts.currentCursor);
  if (objective) event.payload.objective = objective;
  if (tags) event.payload.tags = tags;
  if (currentCursor) event.payload.currentCursor = currentCursor;
  appendEvent(event);
  return getSession({ auditRoot, sessionId });
}

function attachRun(first, second, third) {
  const opts = typeof first === 'string'
    ? { auditRoot: first, sessionId: second, runRef: third }
    : { ...(first || {}) };
  const auditRoot = rootFrom(opts);
  const sessionId = normalizeSessionId(opts.sessionId);
  if (!getSession({ auditRoot, sessionId })) throw new Error(`unknown session: ${sessionId}`);
  const ts = nowIso(opts.ts || opts.now);
  const runRef = normalizeRunRef(opts.runRef, ts);
  appendEvent({ auditRoot, sessionId, type: 'run.attached', ts, payload: { runRef } });
  return getSession({ auditRoot, sessionId });
}

function updateCursor(first, second, third) {
  const opts = typeof first === 'string'
    ? { auditRoot: first, sessionId: second, currentCursor: third }
    : { ...(first || {}) };
  const auditRoot = rootFrom(opts);
  const sessionId = normalizeSessionId(opts.sessionId);
  if (!getSession({ auditRoot, sessionId })) throw new Error(`unknown session: ${sessionId}`);
  const currentCursor = normalizeCursor(opts.currentCursor || {});
  appendEvent({
    auditRoot,
    sessionId,
    type: 'cursor.updated',
    ts: nowIso(opts.ts || opts.now),
    payload: { currentCursor },
  });
  return getSession({ auditRoot, sessionId });
}

function setStatus(first, second, third) {
  const opts = typeof first === 'string'
    ? { auditRoot: first, sessionId: second, status: third }
    : { ...(first || {}) };
  const auditRoot = rootFrom(opts);
  const sessionId = normalizeSessionId(opts.sessionId);
  const status = requireString(opts.status, 'status');
  if (!SESSION_STATUSES.has(status)) throw new Error(`invalid session status: ${status}`);
  const current = getSession({ auditRoot, sessionId });
  if (!current) throw new Error(`unknown session: ${sessionId}`);
  if (status === current.status) return current;
  if (status === 'open') {
    throw new Error('setStatus cannot reopen a session; createSession opens new sessions');
  }
  appendEvent({
    auditRoot,
    sessionId,
    type: status === 'paused' ? 'session.paused' : 'session.closed',
    ts: nowIso(opts.ts || opts.now),
    payload: {},
  });
  return getSession({ auditRoot, sessionId });
}

module.exports = {
  createSession,
  listSessions,
  getSession,
  appendEvent,
  attachRun,
  updateCursor,
  setStatus,
  materialize,
};
