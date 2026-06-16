'use strict';

// Unit test for the Step 3 Ink RunPanel. It mounts the TUI with deterministic heartbeat
// fixtures and asserts the live header, agent rows, and liveness banner states.

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ANSI_RE = /\u001B\[[0-?]*[ -/]*[@-~]/g;

function stripAnsi(value) {
  return String(value || '').replace(ANSI_RE, '');
}

async function renderFrame(statusFile) {
  const React = (await import('react')).default;
  const htm = (await import('htm')).default;
  const {render, cleanup} = await import('ink-testing-library');
  const {App} = await import('../../tui/app.mjs');
  const html = htm.bind(React.createElement);
  const auditRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-graph-run-panel-'));

  let instance;
  try {
    instance = render(html`<${App} auditRoot=${auditRoot} noInput=${true} statusFile=${statusFile} />`);
    await new Promise((resolve) => setTimeout(resolve, 50));
    return stripAnsi(instance.lastFrame());
  } finally {
    if (instance) instance.unmount();
    cleanup();
  }
}

(async () => {
  const fixtureDir = path.join(__dirname, 'fixtures');
  const completeFixture = path.join(fixtureDir, 'run-panel-complete-heartbeat.json');
  const deadFixture = path.join(fixtureDir, 'run-panel-dead-heartbeat.json');

  const completeFrame = await renderFrame(completeFixture);
  assert.match(completeFrame, /RunPanel/);
  assert.match(completeFrame, /✓ DONE/);
  assert.match(completeFrame, /run-panel-complete \/ complete \/ 2\/3 done \/ failed 0 \/ elapsed 2m 5s \//);
  assert.match(completeFrame, /hb-age/);
  assert.match(completeFrame, /Opus 4\.8\[Q\] \/ verify \/ done \/ 0s/);
  assert.match(completeFrame, /codex-current\[Q\] \/ revise \/ revised \/ 0s/);

  const completeAgentRows = completeFrame
    .split('\n')
    .filter((line) => /\/ (verify|revise|propose) \//.test(line));
  assert.ok(completeAgentRows.length >= 1, 'expected at least one agent row');

  const deadFrame = await renderFrame(deadFixture);
  assert.match(deadFrame, /× CRASHED/);
  assert.match(deadFrame, /run-panel-dead \/ review \/ 0\/2 done \/ failed 0 \/ elapsed/);
  assert.match(deadFrame, /⟳× Opus 4\.8\[Q\] \/ review \/ reviewing/);
  assert.match(deadFrame, /·× Gemini 3\.1 Pro \/ queued \/ queued \/ 0s/);

  console.log('  PASS    run panel renders heartbeat header, agent rows, DONE, and CRASHED');
  console.log('\n1 passed');
})().catch((err) => {
  console.error(err.stack || err.message);
  process.exit(1);
});
