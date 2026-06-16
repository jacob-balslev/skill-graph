'use strict';

// Step 8 TUI polish coverage: help overlay, explicit to-file disposition sidecar writes,
// and graceful empty/error states for bad heartbeat or findings inputs.

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ANSI_RE = /\u001B\[[0-?]*[ -/]*[@-~]/g;

function stripAnsi(value) {
  return String(value || '').replace(ANSI_RE, '');
}

function hashFile(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function delay(ms = 80) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  const React = (await import('react')).default;
  const htm = (await import('htm')).default;
  const {render, cleanup} = await import('ink-testing-library');
  const {App} = await import('../../tui/app.mjs');
  const html = htm.bind(React.createElement);

  {
    const auditRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-graph-tui-help-'));
    let instance;
    try {
      instance = render(html`<${App} auditRoot=${auditRoot} />`);
      await delay();
      instance.stdin.write('?');
      await delay();
      const frame = stripAnsi(instance.lastFrame());
      assert.match(frame, /Help/);
      assert.match(frame, /Global Focus And Quit/);
      assert.match(frame, /Breadcrumb Navigation/);
      assert.match(frame, /FindingsReview/);
      assert.match(frame, /f\s+records a to-file disposition in review\.json/);
    } finally {
      if (instance) instance.unmount();
      cleanup();
    }
  }

  {
    const fixture = path.join(__dirname, 'fixtures', 'findings-review-merge-ledger.json');
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-graph-tui-file-disposition-'));
    const ledger = path.join(tmp, 'merge-ledger.json');
    const reviewFile = path.join(tmp, 'review.json');
    fs.copyFileSync(fixture, ledger);
    const beforeHash = hashFile(ledger);

    let instance;
    try {
      instance = render(html`
        <${App}
          auditRoot=${tmp}
          findingsFile=${ledger}
          reviewFile=${reviewFile}
        />
      `);
      await delay();
      instance.stdin.write('\t');
      await delay(40);
      instance.stdin.write('\t');
      await delay();
      instance.stdin.write('f');
      await delay(140);

      assert.strictEqual(hashFile(ledger), beforeHash, 'to-file action leaves findings source untouched');
      assert.ok(fs.existsSync(reviewFile), 'to-file action creates the review sidecar');
      const sidecar = JSON.parse(fs.readFileSync(reviewFile, 'utf8'));
      assert.strictEqual(sidecar.decisions['F-risk-rejected'].decision, 'pending');
      assert.strictEqual(sidecar.decisions['F-risk-rejected'].disposition, 'to-file');
      assert.ok(sidecar.decisions['F-risk-rejected'].disposition_at, 'to-file action records a timestamp');
      assert.deepStrictEqual(
        fs.readdirSync(tmp).filter((name) => name !== 'merge-ledger.json' && name !== 'review.json'),
        [],
        'to-file action writes only the review sidecar next to the copied ledger',
      );

      const frame = stripAnsi(instance.lastFrame());
      assert.match(frame, /f records a to-file disposition in review\.json/);
      assert.match(frame, /to-file/);
    } finally {
      if (instance) instance.unmount();
      cleanup();
    }
  }

  {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-graph-tui-empty-state-'));
    const missingHeartbeat = path.join(tmp, 'missing-status.json');
    const emptyFindings = path.join(tmp, 'empty-findings.json');
    fs.writeFileSync(emptyFindings, '');

    let instance;
    try {
      instance = render(html`
        <${App}
          auditRoot=${tmp}
          findingsFile=${emptyFindings}
          noInput=${true}
          statusFile=${missingHeartbeat}
        />
      `);
      await delay();
      const frame = stripAnsi(instance.lastFrame());
      assert.match(frame, /Heartbeat unreadable/);
      assert.match(frame, /Findings file is empty/);
      assert.match(frame, /No sessions yet/);
    } finally {
      if (instance) instance.unmount();
      cleanup();
    }
  }

  console.log('  PASS    tui polish covers help, to-file sidecar writes, and empty states');
  console.log('\n1 passed');
})().catch((err) => {
  console.error(err.stack || err.message);
  process.exit(1);
});
