'use strict';

// Unit test for tui/hooks/useSessions.mjs: the hook-level session controller wraps
// tui/lib/sessions.js, re-reads after writes, debounces cursor writes when asked,
// and survives a fresh process/controller reload through the append-only ledger.

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function readEvents(root) {
  return fs.readFileSync(path.join(root, '_sessions.jsonl'), 'utf8')
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

(async () => {
  const { createSessionsController } = await import('../../tui/hooks/useSessions.mjs');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-graph-use-sessions-'));
  const sessionId = 'threaded-step5';
  const runDir = path.join(root, 'a11y', 'runs', '2026-06-16T1100--audit--opus--abc123');
  const heartbeatPath = path.join(runDir, 'status.json');
  const ledgerRef = path.join(runDir, 'merge-ledger.json');
  const reviewPath = path.join(runDir, 'review.json');
  fs.mkdirSync(runDir, { recursive: true });
  fs.writeFileSync(heartbeatPath, JSON.stringify({ skill: 'a11y', phase: 'review' }));
  fs.writeFileSync(ledgerRef, JSON.stringify({ contributions: [] }));

  const controller = createSessionsController({ auditRoot: root, debounceMs: 0 });

  const created = controller.createSession({
    sessionId,
    title: 'Threaded TUI session',
    now: '2026-06-16T11:00:00.000Z',
    currentCursor: { focusId: 'sessions', selectedIndex: 0 },
  });
  assert.strictEqual(created.sessionId, sessionId);
  assert.strictEqual(controller.listSessions(sessionId).length, 1);

  const attached = controller.attachRun({
    sessionId,
    now: '2026-06-16T11:01:00.000Z',
    runRef: {
      runId: 'abc123',
      skill: 'a11y',
      runDir,
      heartbeatPath,
      ledgerRef,
      reviewPath,
      role: 'primary',
    },
  });
  assert.strictEqual(attached.runRefs.length, 1);
  assert.strictEqual(attached.runRefs[0].runDir, runDir);
  assert.ok(!attached.runRefs[0].runDir.split(path.sep).includes('latest'), 'runDir is stable, not latest');

  controller.appendEvent({
    sessionId,
    ts: '2026-06-16T11:02:00.000Z',
    type: 'note.added',
    payload: { note: 'operator checked the first run' },
  });

  const cursor = {
    activeRunId: 'abc123',
    breadcrumb: { activeIndex: 2 },
    focusCursors: {
      sessions: { focusId: 'sessions', sessionId, selectedIndex: 0 },
      run: { focusId: 'run', runId: 'abc123', selectedRunIndex: 0 },
    },
    focusId: 'run',
    sessionId,
  };
  const updated = controller.updateCursor({
    sessionId,
    now: '2026-06-16T11:03:00.000Z',
    currentCursor: cursor,
    debounce: false,
  });
  assert.deepStrictEqual(updated.currentCursor, cursor);

  const materialized = controller.materialize({ sessionId });
  const statePath = path.join(root, 'sessions', sessionId, 'state.json');
  assert.deepStrictEqual(readJson(statePath), materialized);
  controller.dispose();

  const restarted = createSessionsController({ auditRoot: root, debounceMs: 0 });
  const sessions = restarted.listSessions();
  assert.strictEqual(sessions.length, 1);
  assert.strictEqual(sessions[0].sessionId, sessionId);
  assert.strictEqual(sessions[0].runRefs[0].heartbeatPath, heartbeatPath);

  const resumed = restarted.resumeSession(sessionId);
  assert.strictEqual(resumed.title, 'Threaded TUI session');
  assert.deepStrictEqual(resumed.currentCursor, cursor);
  assert.deepStrictEqual(readJson(statePath), resumed);
  assert.deepStrictEqual(
    readEvents(root).map((event) => event.type),
    ['session.created', 'run.attached', 'note.added', 'cursor.updated'],
  );
  restarted.dispose();

  console.log('  PASS    useSessions controller persists threaded session state across reload');
  console.log('\n1 passed');
})().catch((err) => {
  console.error(err.stack || err.message);
  process.exit(1);
});
