'use strict';

// Unit tests for tui/lib/sessions.js: append-only session events plus atomic
// materialized snapshots for the Skill Audit Loop terminal TUI.

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  createSession,
  listSessions,
  getSession,
  appendEvent,
  attachRun,
  updateCursor,
  setStatus,
  materialize,
} = require('../../tui/lib/sessions');

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log(`  PASS    ${name}`);
}

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-graph-sessions-'));
const sessionId = 's-step1';
const statePath = path.join(root, 'sessions', sessionId, 'state.json');
const ledgerPath = path.join(root, '_sessions.jsonl');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function readEvents() {
  return fs.readFileSync(ledgerPath, 'utf8').trim().split('\n').filter(Boolean).map((line) => JSON.parse(line));
}

console.log('1. sessions append/read/snapshot');

check('createSession appends session.created and writes state.json', () => {
  const session = createSession({
    auditRoot: root,
    sessionId,
    title: 'Audit TUI pass',
    objective: 'Review active audit runs',
    tags: ['audit', 'tui', 'audit'],
    currentCursor: { view: 'sessions', row: 2 },
    now: '2026-06-16T10:00:00.000Z',
  });

  assert.strictEqual(session.sessionId, sessionId);
  assert.strictEqual(session.status, 'open');
  assert.deepStrictEqual(session.tags, ['audit', 'tui']);
  assert.deepStrictEqual(readJson(statePath), session);

  const events = readEvents();
  assert.strictEqual(events.length, 1);
  assert.strictEqual(events[0].type, 'session.created');
  assert.strictEqual(events[0].payload.title, 'Audit TUI pass');
});

check('attachRun stores only stable run references', () => {
  const runDir = path.join(root, 'a11y', 'runs', '2026-06-16T1000--audit--opus--abc123');
  const session = attachRun({
    auditRoot: root,
    sessionId,
    now: '2026-06-16T10:01:00.000Z',
    runRef: {
      runId: 'abc123',
      skill: 'a11y',
      runDir,
      ledgerRef: '_ledger.jsonl:1',
      heartbeatPath: path.join(runDir, 'status.json'),
      reviewPath: path.join(runDir, 'review.json'),
      role: 'primary',
    },
  });

  assert.strictEqual(session.runRefs.length, 1);
  assert.deepStrictEqual(Object.keys(session.runRefs[0]).sort(), [
    'attachedAt',
    'heartbeatPath',
    'ledgerRef',
    'reviewPath',
    'role',
    'runDir',
    'runId',
    'skill',
  ]);
  assert.strictEqual(session.runRefs[0].runDir, runDir);
  assert.strictEqual(session.runRefs[0].attachedAt, '2026-06-16T10:01:00.000Z');
});

check('updateCursor, setStatus, and note.added round-trip through the event log', () => {
  updateCursor({
    auditRoot: root,
    sessionId,
    now: '2026-06-16T10:02:00.000Z',
    currentCursor: { view: 'run', runId: 'abc123', row: 4 },
  });
  setStatus({
    auditRoot: root,
    sessionId,
    now: '2026-06-16T10:03:00.000Z',
    status: 'paused',
  });
  appendEvent({
    auditRoot: root,
    sessionId,
    ts: '2026-06-16T10:04:00.000Z',
    type: 'note.added',
    payload: { note: 'operator paused for review' },
  });

  const session = getSession({ auditRoot: root, sessionId });
  assert.strictEqual(session.status, 'paused');
  assert.strictEqual(session.updatedAt, '2026-06-16T10:04:00.000Z');
  assert.deepStrictEqual(session.currentCursor, { view: 'run', runId: 'abc123', row: 4 });
  assert.ok(!Object.prototype.hasOwnProperty.call(session, 'note'), 'notes stay in the event log, not the snapshot');
  assert.strictEqual(readEvents().length, 5);
});

console.log('2. materialize and atomic writes');

check('listSessions reads the materialized session snapshot', () => {
  const sessions = listSessions({ auditRoot: root });
  assert.strictEqual(sessions.length, 1);
  assert.strictEqual(sessions[0].sessionId, sessionId);
  assert.strictEqual(sessions[0].runRefs[0].runId, 'abc123');
});

check('materialize rebuilds state.json from _sessions.jsonl', () => {
  fs.rmSync(path.join(root, 'sessions'), { recursive: true, force: true });
  assert.strictEqual(fs.existsSync(statePath), false);
  const rebuilt = materialize({ auditRoot: root, sessionId });
  assert.strictEqual(rebuilt.sessionId, sessionId);
  assert.deepStrictEqual(readJson(statePath), rebuilt);
});

check('state snapshot writes use tmp+rename and leave no tmp files behind', () => {
  const renames = [];
  const realRename = fs.renameSync;
  fs.renameSync = function captureRename(from, to) {
    renames.push({ from, to });
    return realRename.call(fs, from, to);
  };
  try {
    materialize({ auditRoot: root, sessionId });
  } finally {
    fs.renameSync = realRename;
  }
  assert.ok(renames.some((r) => r.to === statePath && path.basename(r.from).includes('state.json.tmp-')), 'snapshot rename observed');
  const leftovers = fs.readdirSync(path.dirname(statePath)).filter((name) => name.includes('.tmp-'));
  assert.deepStrictEqual(leftovers, []);
});

check('appendEvent supports session.renamed and preserves append-only history', () => {
  appendEvent({
    auditRoot: root,
    sessionId,
    ts: '2026-06-16T10:05:00.000Z',
    type: 'session.renamed',
    payload: { title: 'Renamed audit TUI pass' },
  });
  const session = getSession({ auditRoot: root, sessionId });
  assert.strictEqual(session.title, 'Renamed audit TUI pass');
  assert.strictEqual(readEvents().length, 6);
});

check('attachRun rejects the latest symlink as a runDir', () => {
  assert.throws(() => attachRun({
    auditRoot: root,
    sessionId,
    runRef: {
      runId: 'bad',
      skill: 'a11y',
      runDir: path.join(root, 'a11y', 'latest'),
      heartbeatPath: path.join(root, 'a11y', 'latest', 'status.json'),
    },
  }), /not latest/);
});

console.log(`\n${passed} passed`);
