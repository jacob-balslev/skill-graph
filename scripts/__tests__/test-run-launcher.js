#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const runLayout = require('../../lib/audit/run-layout');
const { createSession, attachRun } = require('../../tui/lib/sessions');
const { launchRun } = require('../../tui/lib/run-launcher');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function waitForExit(child) {
  return new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', (code, signal) => resolve({ code, signal }));
  });
}

(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-graph-run-launcher-'));
  const auditRoot = path.join(tmp, 'audits');
  const skillDir = path.join(tmp, 'skills', 'fake-skill');
  const fakeLauncher = path.join(tmp, 'fake-launcher.js');
  const sessionId = 'step6-session';
  const runId = 'abc123';
  const date = '2026-06-16T12:34:00.000Z';

  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), '---\nname: fake-skill\ndescription: fake skill fixture\n---\n');
  fs.writeFileSync(fakeLauncher, `#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
function value(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : null;
}
const statusFile = value('--status-file');
const skill = value('--skill');
fs.mkdirSync(path.dirname(statusFile), { recursive: true });
fs.writeFileSync(statusFile, JSON.stringify({
  ts: '2026-06-16T12:34:05.000Z',
  pid: process.pid,
  skill,
  phase: 'fake-launch',
  elapsed_s: 0,
  total: 0,
  done: 0,
  failed: 0,
  complete: false,
  running: [],
  agents: []
}, null, 2));
fs.writeFileSync(path.join(path.dirname(statusFile), 'fake-env.json'), JSON.stringify({
  session: process.env.SKILL_AUDIT_SESSION,
  args: process.argv.slice(2)
}, null, 2));
`);
  fs.chmodSync(fakeLauncher, 0o755);

  createSession({
    auditRoot,
    sessionId,
    title: 'Step 6 launcher test',
    now: '2026-06-16T12:33:00.000Z',
  });

  let observedSpawn = null;
  const launch = launchRun({
    auditRoot,
    date,
    extraArgs: ['--dry-run', '--no-eval'],
    launcherPath: fakeLauncher,
    runId,
    sessionId,
    skill: 'fake-skill',
    skillDir,
    spawnImpl(command, args, options) {
      observedSpawn = { command, args, options };
      return spawn(command, args, options);
    },
  });

  assert.ok(launch.pid > 0, 'launcher returns the child pid');
  assert.strictEqual(observedSpawn.options.detached, true, 'child is launched in its own process group');
  assert.deepStrictEqual(observedSpawn.options.stdio, ['ignore', 'ignore', 'ignore'], 'child does not inherit TUI stdin/stdout/stderr');
  assert.notStrictEqual(observedSpawn.options.stdio[0], 'inherit', 'stdin is not inherited');
  assert.ok(observedSpawn.args.includes('--status-file'), 'status-file is passed to the existing runner');
  assert.ok(observedSpawn.args.includes('--no-tui'), 'runner TUI is disabled for child launch');

  const expectedRunDir = runLayout.runDir(auditRoot, 'fake-skill', {
    op: 'audit',
    model: 'panel',
    id: runId,
    date,
  });
  assert.strictEqual(launch.runDir, expectedRunDir);
  assert.strictEqual(launch.heartbeatPath, path.join(expectedRunDir, 'status.json'));
  assert.ok(!launch.runDir.split(path.sep).includes('latest'), 'runDir is stable, not latest');

  const exit = await waitForExit(launch.child);
  assert.strictEqual(exit.code, 0);
  assert.strictEqual(exit.signal, null);

  const heartbeat = readJson(launch.heartbeatPath);
  assert.strictEqual(heartbeat.skill, 'fake-skill');
  assert.strictEqual(heartbeat.phase, 'fake-launch');

  const envRecord = readJson(path.join(launch.runDir, 'fake-env.json'));
  assert.strictEqual(envRecord.session, sessionId, 'SKILL_AUDIT_SESSION is passed to the child');
  assert.ok(envRecord.args.includes('--dry-run'), 'extra args are forwarded');
  assert.ok(envRecord.args.includes('--no-eval'), 'extra args are forwarded');

  const session = attachRun({
    auditRoot,
    sessionId,
    now: '2026-06-16T12:35:00.000Z',
    runRef: launch.runRef({ role: 'primary' }),
  });
  assert.strictEqual(session.runRefs.length, 1);
  assert.strictEqual(session.runRefs[0].runId, runId);
  assert.strictEqual(session.runRefs[0].runDir, launch.runDir);
  assert.strictEqual(session.runRefs[0].heartbeatPath, launch.heartbeatPath);
  assert.ok(!session.runRefs[0].runDir.split(path.sep).includes('latest'), 'attached RunRef uses stable runDir');

  console.log('  PASS    run launcher spawns fake child, resolves stable run dir, and attaches RunRef');
  console.log('\n1 passed');
})().catch((err) => {
  console.error(err.stack || err.message);
  process.exit(1);
});
