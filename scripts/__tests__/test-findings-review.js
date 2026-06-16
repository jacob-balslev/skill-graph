'use strict';

// Unit test for the Step 4 Ink FindingsReview pane. It verifies the core
// anti-exploit path: findings are loaded read-only, flagged findings surface
// first, and each decision writes only the review sidecar.

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

function delay(ms = 60) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  const React = (await import('react')).default;
  const htm = (await import('htm')).default;
  const {render, cleanup} = await import('ink-testing-library');
  const {App} = await import('../../tui/app.mjs');
  const {loadReviewSnapshot} = await import('../../tui/hooks/useReviewState.mjs');
  const html = htm.bind(React.createElement);

  const fixture = path.join(__dirname, 'fixtures', 'findings-review-merge-ledger.json');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-graph-findings-review-'));
  const ledger = path.join(tmp, 'merge-ledger.json');
  const reviewFile = path.join(tmp, 'review.json');
  fs.copyFileSync(fixture, ledger);

  const initial = loadReviewSnapshot({findingsFile: ledger, reviewFile});
  assert.strictEqual(initial.visibleFindings.length, 2, 'fixture yields two reviewable findings');
  assert.strictEqual(initial.visibleFindings[0].id, 'F-risk-rejected', 'flagged finding sorts before kept disposition');
  assert.strictEqual(initial.visibleFindings[0].flagged, true, 'risk finding is flagged');

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
    await delay(100);
    instance.stdin.write('\t');
    await delay(40);
    instance.stdin.write('\t');
    await delay(100);

    let frame = stripAnsi(instance.lastFrame());
    assert.match(frame, /FindingsReview/);
    assert.match(frame, /REVIEW INCOMPLETE - 0 of 2 decided; 2 pending/);
    assert.match(frame, /Finding F-risk-rejected/);
    assert.ok(
      frame.indexOf('Tenant orgId can leak') < frame.indexOf('Document the harmless'),
      'rendered table keeps flagged finding before kept low-risk finding',
    );
    assert.doesNotMatch(frame, /bulk|approve all/i, 'per-finding Ink pane exposes no bulk-approve path');

    instance.stdin.write('a');
    await delay(120);
    assert.strictEqual(hashFile(ledger), beforeHash, 'decision write does not rewrite the findings ledger');
    assert.ok(fs.existsSync(reviewFile), 'decision creates the review sidecar');
    let sidecar = JSON.parse(fs.readFileSync(reviewFile, 'utf8'));
    assert.strictEqual(sidecar.decisions['F-risk-rejected'].decision, 'approved');
    assert.deepStrictEqual(
      fs.readdirSync(tmp).filter((name) => /\.tmp-/.test(name)),
      [],
      'atomic tmp file is renamed away',
    );
    frame = stripAnsi(instance.lastFrame());
    assert.match(frame, /approved/);
    assert.match(frame, /REVIEW INCOMPLETE - 1 of 2 decided; 1 pending/);

    instance.stdin.write('j');
    await delay(60);
    instance.stdin.write('d');
    await delay(120);
    assert.strictEqual(hashFile(ledger), beforeHash, 'second decision also leaves findings ledger untouched');
    sidecar = JSON.parse(fs.readFileSync(reviewFile, 'utf8'));
    assert.strictEqual(sidecar.decisions['F-low-kept'].decision, 'disapproved');
    frame = stripAnsi(instance.lastFrame());
    assert.match(frame, /ALL 2 REVIEWED - 1 approved; 1 disapproved/);
  } finally {
    if (instance) instance.unmount();
    cleanup();
  }

  console.log('  PASS    findings review renders flagged-first and writes only the review sidecar');
  console.log('\n1 passed');
})().catch((err) => {
  console.error(err.stack || err.message);
  process.exit(1);
});
