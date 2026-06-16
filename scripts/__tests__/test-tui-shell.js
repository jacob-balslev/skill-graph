'use strict';

// Smoke test for the Step 2 Ink shell. The app is ESM-only, so this CommonJS
// unit test imports it dynamically while keeping the repo package type CommonJS.

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ANSI_RE = /\u001B\[[0-?]*[ -/]*[@-~]/g;

function stripAnsi(value) {
  return String(value || '').replace(ANSI_RE, '');
}

(async () => {
  const React = (await import('react')).default;
  const htm = (await import('htm')).default;
  const {render, cleanup} = await import('ink-testing-library');
  const {App} = await import('../../tui/app.mjs');
  const html = htm.bind(React.createElement);
  const auditRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-graph-tui-shell-'));

  let instance;
  try {
    instance = render(html`<${App} auditRoot=${auditRoot} noInput=${true} />`);
    await new Promise((resolve) => setTimeout(resolve, 50));
    const frame = stripAnsi(instance.lastFrame());

    assert.match(frame, /Audit TUI/);
    assert.match(frame, /Session/);
    assert.match(frame, /Skill/);
    assert.match(frame, /Run/);
    assert.match(frame, /Phase/);
    assert.match(frame, /Finding/);
    assert.match(frame, /SessionList/);
    assert.match(frame, /RunPanel/);
    assert.match(frame, /FindingsReview/);
    assert.match(frame, /No heartbeat selected/);
    assert.match(frame, /Step 3: live heartbeat panel mounted/);
    assert.match(frame, /no-input smoke mode/);
  } finally {
    if (instance) instance.unmount();
    cleanup();
  }

  console.log('  PASS    tui shell renders breadcrumb and stub panes');
  console.log('\n1 passed');
})().catch((err) => {
  console.error(err.stack || err.message);
  process.exit(1);
});
