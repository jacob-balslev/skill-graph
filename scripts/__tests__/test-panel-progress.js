'use strict';

// Unit tests for lib/audit/panel-progress.js — the panel-enrich visibility layer
// (heartbeat status.json contract + pinned-header TUI gating). Pure Node, no LLM.

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { createProgressReporter, renderCollected, fmtElapsed } = require('../../lib/audit/panel-progress');
const {
  extractFindings,
  mergeFindings,
  applyFindingDecision,
  decisionFor,
  decisionRecord,
  decisionCounts,
  nextPendingIndex,
  sortFindings,
  loadReviewViews,
  normalizeSort,
  DEFAULT_REVIEW_VIEWS,
  parseMarkdownLedger,
  loadFindingsFile,
  renderFindingsReview,
} = require('../../lib/audit/finding-review');

let passed = 0;
let failed = 0;
function ok(name, fn) {
  try { fn(); console.log(`  PASS    ${name}`); passed += 1; }
  catch (e) { console.log(`  FAIL    ${name}\n          ${e.message}`); failed += 1; }
}

// A fake stream that captures writes and reports as a non-TTY by default.
function fakeStream({ isTTY = false } = {}) {
  const chunks = [];
  return { isTTY, rows: 40, cols: 100, write: (s) => { chunks.push(String(s)); return true; }, _chunks: chunks, text: () => chunks.join('') };
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'panel-progress-'));
const statusPath = (n) => path.join(tmp, `${n}.json`);
const readStatus = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

// ── 1. heartbeat shape (the watch-audit-batch.sh contract) ──
console.log('1. heartbeat shape');
ok('writes the documented status.json keys (superset of comprehension-ab-driver)', () => {
  const sf = statusPath('shape');
  const out = fakeStream();
  let clock = 1000;
  const r = createProgressReporter({
    skill: 's', mandatoryModels: ['opus', 'gpt-5.5'], advisoryModels: ['minimax'],
    statusFile: sf, tty: false, now: () => clock, out,
  });
  r.heartbeat();
  const st = readStatus(sf);
  for (const k of ['ts', 'pid', 'total', 'done', 'failed', 'running', 'complete', 'agents']) {
    assert.ok(Object.prototype.hasOwnProperty.call(st, k), `missing key ${k}`);
  }
  assert.strictEqual(st.total, 3, 'total = mandatory + advisory');
  assert.strictEqual(st.done, 0);
  assert.strictEqual(st.complete, false);
  assert.ok(Array.isArray(st.running) && st.running.length === 0);
  assert.strictEqual(st.agents.length, 3);
  assert.deepStrictEqual(st.agents.map((a) => a.tier), ['mandatory', 'mandatory', 'advisory']);
});

// ── 2. progress-event state transitions ──
console.log('2. progress-event state transitions');
ok('propose start → running; propose done → done count increments', () => {
  const sf = statusPath('transitions');
  const out = fakeStream();
  let clock = 0;
  const r = createProgressReporter({
    skill: 's', mandatoryModels: ['opus', 'gpt-5.5'], advisoryModels: [],
    statusFile: sf, tty: false, now: () => clock, out,
  });
  clock = 5000;
  r.onProgress({ kind: 'agent', model: 'opus', tier: 'mandatory', phase: 'propose', state: 'start' });
  let st = readStatus(sf);
  assert.strictEqual(st.running.length, 1, 'one agent running after start');
  assert.strictEqual(st.running[0].cell, 'opus:propose');
  assert.strictEqual(st.done, 0);
  clock = 9000;
  r.onProgress({ kind: 'agent', model: 'opus', tier: 'mandatory', phase: 'propose', state: 'done' });
  st = readStatus(sf);
  assert.strictEqual(st.running.length, 0, 'no agent running after done');
  assert.strictEqual(st.done, 1, 'done incremented');
  assert.strictEqual(st.agents.find((a) => a.model === 'opus').state, 'proposed');
});

ok('agent fail → failed count; skip → skipped state, not counted done/failed', () => {
  const sf = statusPath('failskip');
  const r = createProgressReporter({
    skill: 's', mandatoryModels: ['opus', 'gpt-5.5'], advisoryModels: ['minimax'],
    statusFile: sf, tty: false, out: fakeStream(),
  });
  r.onProgress({ kind: 'agent', model: 'gpt-5.5', tier: 'mandatory', phase: 'propose', state: 'fail' });
  r.onProgress({ kind: 'agent', model: 'minimax', tier: 'advisory', phase: 'propose', state: 'skip' });
  const st = readStatus(sf);
  assert.strictEqual(st.failed, 1, 'one failed');
  assert.strictEqual(st.done, 0, 'skip is not done');
  assert.strictEqual(st.agents.find((a) => a.model === 'minimax').state, 'skipped');
});

ok('phase event updates the phase label', () => {
  const sf = statusPath('phase');
  const r = createProgressReporter({ skill: 's', mandatoryModels: ['opus', 'gpt-5.5'], advisoryModels: [], statusFile: sf, tty: false, out: fakeStream() });
  r.onProgress({ kind: 'phase', phase: 'curate (synthesis)' });
  assert.strictEqual(readStatus(sf).phase, 'curate (synthesis)');
});

// ── 3. TTY gating ──
console.log('3. TTY gating');
ok('NOT a TTY → no ANSI escapes written, heartbeat still written', () => {
  const sf = statusPath('notty');
  const out = fakeStream({ isTTY: false });
  const r = createProgressReporter({ skill: 's', mandatoryModels: ['opus', 'gpt-5.5'], advisoryModels: [], statusFile: sf, tty: false, out });
  r.onProgress({ kind: 'agent', model: 'opus', tier: 'mandatory', phase: 'propose', state: 'start' });
  r.teardown();
  assert.strictEqual(out.text(), '', 'no terminal writes when not a TTY');
  assert.ok(fs.existsSync(sf), 'heartbeat still written when not a TTY');
  assert.strictEqual(readStatus(sf).complete, true, 'teardown marks complete');
});

ok('TTY → writes ANSI scroll-region + header escapes', () => {
  const out = fakeStream({ isTTY: true });
  const r = createProgressReporter({ skill: 's', mandatoryModels: ['opus', 'gpt-5.5'], advisoryModels: ['minimax'], statusFile: statusPath('tty'), tty: true, out });
  r.onProgress({ kind: 'agent', model: 'opus', tier: 'mandatory', phase: 'propose', state: 'start' });
  const text = out.text();
  assert.ok(text.includes('\x1b['), 'emits ANSI escapes on a TTY');
  assert.ok(text.includes('Opus 4.8'), 'renders the agent row by display name (Model Identity Discipline)');
  assert.ok(text.includes('Skill Audit Loop'), 'renders the collected header');
  r.teardown();
  assert.ok(out.text().includes('\x1b[r'), 'teardown resets the scroll region');
});

// ── 3b. renderCollected — the canonical collected view ──
console.log('3b. renderCollected (canonical collected view)');
ok('renders a single-line header + one tree row per agent (no per-row tier tag)', () => {
  const status = {
    skill: 'schema-evolution', phase: 'cross-review r1/2', elapsed_s: 125,
    done: 1, total: 3, failed: 0,
    agents: [
      { model: 'opus', tier: 'mandatory', phase: 'review', state: 'reviewing', elapsed_s: 40 },
      { model: 'gpt-5.5', tier: 'mandatory', phase: 'propose', state: 'proposed', elapsed_s: 0 },
      { model: 'minimax', tier: 'advisory', phase: 'propose', state: 'queued', elapsed_s: 0 },
    ],
  };
  const lines = renderCollected(status);
  assert.strictEqual(lines.length, 4, '1 header line + 3 agent rows');
  assert.ok(lines[0].startsWith('Skill Audit Loop: (schema-evolution)'), 'new header prefix');
  assert.ok(lines[0].includes('cross-review r1/2') && lines[0].includes('1/3'), 'header carries phase + counters');
  assert.ok(lines[1].includes('Opus 4.8') && lines[1].includes('reviewing'), 'agent row by display name + state');
  assert.ok(!lines[1].includes('[MANDATORY]') && !lines[1].includes('[advisory]'), 'no per-row tier tag');
  assert.ok(lines[1].startsWith('├') && lines[3].startsWith('└'), 'tree branches');
  assert.ok(lines[3].includes('MiniMax M3'), 'advisory row by display name');
});
ok('marks DONE in the header when complete', () => {
  const lines = renderCollected({ skill: 's', phase: 'apply (keep)', done: 2, total: 2, complete: true, agents: [] });
  assert.ok(lines[0].includes('DONE'));
});
ok('tolerates a missing/empty status object (single header line)', () => {
  const lines = renderCollected(null);
  assert.ok(Array.isArray(lines) && lines.length === 1, 'one header line even with no agents');
});
ok('shows the failure reason (+ detail) on a skipped/failed row', () => {
  const lines = renderCollected({
    skill: 's', phase: 'propose (advisory)', done: 1, total: 3,
    agents: [
      { model: 'opus', tier: 'mandatory', phase: 'propose', state: 'proposed' },
      { model: 'minimax', tier: 'advisory', phase: 'propose', state: 'skipped', failure_reason: 'error', failure_detail: 'opencode exit 1' },
      { model: 'big-pickle', tier: 'advisory', phase: 'propose', state: 'skipped', failure_reason: 'no-document' },
    ],
  });
  const mm = lines.find((l) => l.includes('MiniMax M3'));
  const bp = lines.find((l) => l.includes('Big Pickle'));
  assert.ok(mm.includes('skipped (error: opencode exit 1)'), 'reason + detail shown');
  assert.ok(bp.includes('skipped (no-document)'), 'reason shown without detail');
});
ok('quality + advisory render by display name, ordering preserved, no tier tag', () => {
  const lines = renderCollected({
    skill: 'board', phase: 'review', done: 1, total: 3, failed: 1,
    agents: [
      { model: 'opus', tier: 'quality', phase: 'review', state: 'reviewing' },
      { model: 'gpt-5.5', tier: 'quality', phase: 'review', state: 'reviewing' },
      { model: 'minimax', tier: 'advisory', phase: 'review', state: 'done' },
    ],
  });
  assert.ok(lines[0].startsWith('Skill Audit Loop: (board)'), 'header prefix');
  assert.ok(!lines.some((l) => l.includes('[QUALITY]') || l.includes('[advisory]')), 'no tier tags in rows');
  assert.ok(lines[3].includes('MiniMax M3'), 'advisory row rendered last');
});
ok('live timer: nowMs extrapolates active elapsed past the frozen snapshot', () => {
  const tsMs = 1700000000000;
  const status = {
    skill: 's', phase: 'propose', done: 0, total: 1, elapsed_s: 5,
    ts: new Date(tsMs).toISOString(),
    agents: [{ model: 'opus', tier: 'mandatory', phase: 'propose', state: 'proposing', elapsed_s: 5 }],
  };
  const snap = renderCollected(status);                          // no nowMs → snapshot 5s
  const live = renderCollected(status, { nowMs: tsMs + 30000 }); // +30s past the heartbeat
  assert.ok(snap[1].includes('5s'), 'snapshot shows base elapsed');
  assert.ok(live[1].includes('35s'), 'live agent row counts up by (now - ts)');
  assert.ok(live[0].includes('35s'), 'live header counts up too');
});

// ── 3c. findings review — human approve/disapprove list ──
console.log('3c. findings review');
ok('extracts all findings from heartbeat findings[] and merge-ledger contributions[]', () => {
  const findings = mergeFindings(
    extractFindings({
      findings: [
        { id: 'f1', title: 'Tighten the audit verdict wording', skill: 'a11y', model: 'opus', verdict: 'APPLICABLE' },
      ],
    }),
    extractFindings({
      contributions: [
        { id: 'c1', contribution: 'Preserve the reviewer rationale in the final ledger', surfaced_by: ['gpt-5.5'], disposition: 'kept', reason: 'prevents silent context loss' },
      ],
    }),
  );
  assert.strictEqual(findings.length, 2, 'no findings are dropped');
  assert.strictEqual(findings[0].id, 'f1');
  assert.strictEqual(findings[1].id, 'c1');
  assert.ok(findings[1].title.includes('Preserve the reviewer rationale'), 'merge-ledger contribution becomes the finding title');
  assert.ok(findings[1].peek.some((p) => p.label === 'reason'), 'reason is available in the peek rows');
});

ok('applies pending/approved/disapproved decisions and renders row buttons', () => {
  const findings = extractFindings({
    findings: [
      { id: 'f1', title: 'Show every finding in the terminal review list', evidence: 'complete reporting requires no silent drops' },
      { id: 'f2', title: 'Let the reviewer reject a finding without editing JSON' },
    ],
  });
  let state = applyFindingDecision(null, 'f1', 'approved', '2026-06-13T00:00:00.000Z');
  assert.strictEqual(decisionFor(findings[0], state), 'approved');
  state = applyFindingDecision(state, 'f2', 'disapproved', '2026-06-13T00:01:00.000Z');
  assert.strictEqual(decisionFor(findings[1], state), 'disapproved');
  const frame = renderFindingsReview(findings, state, { selectedIndex: 0, width: 100, reviewFile: '/tmp/review.json' });
  assert.ok(frame.lines[0].includes('1 approved') && frame.lines[0].includes('1 disapproved'), 'header shows decision counts');
  assert.ok(frame.lines.some((line) => line.includes('[Approve]') && line.includes('[Disapprove]')), 'selected row renders action buttons');
  assert.ok(frame.lines.some((line) => line.includes('Decision') && line.includes('Scope') && line.includes('Finding')), 'renders a table header');
  assert.ok(frame.lines.some((line) => line === 'Preview'), 'renders a separate preview pane in narrow mode');
  assert.deepStrictEqual(frame.hitTargets.map((hit) => hit.action), ['approved', 'disapproved', 'pending'], 'mouse targets map to decisions');
});

ok('renders a grouped wide table with a side-by-side preview pane', () => {
  const findings = extractFindings({
    findings: [
      { id: 'f1', title: 'A11y button labels need explicit intent', skill: 'a11y', model: 'opus', verdict: 'APPLICABLE', review: 'Keep the finding because it has user-facing impact.' },
      { id: 'f2', title: 'A11y contrast result needs evidence', skill: 'a11y', model: 'gpt-5.5', verdict: 'PROVISIONAL' },
      { id: 'f3', title: 'State machine preview should expose invalid transitions', skill: 'state-machine-modeling', model: 'opus', verdict: 'APPLICABLE' },
    ],
  });
  const frame = renderFindingsReview(findings, null, { selectedIndex: 0, width: 132, groupBy: 'skill' });
  assert.ok(frame.lines.some((line) => line.includes('Group: skill')), 'header names active grouping');
  assert.ok(frame.lines.some((line) => line.includes('-- skill: a11y (2) --')), 'group header includes count');
  assert.ok(frame.lines.some((line) => line.includes(' | Preview')), 'wide mode renders table and preview side by side');
  assert.ok(frame.lines.some((line) => line.includes('review: Keep the finding')), 'preview exposes latest review material');
  assert.deepStrictEqual(frame.hitTargets.map((hit) => hit.action), ['approved', 'disapproved', 'pending'], 'wide preview buttons keep the same actions');
});

// ── 3d. findings review — real merge-ledger shape, notes, pending nav, sort, saved views ──
console.log('3d. findings review (merge-ledger normalization, notes, nav, sort, views)');

ok('maps a real merge-ledger contribution shape (note → title, evidence/corroboration → peek)', () => {
  const findings = extractFindings({
    contributions: [
      {
        id: 'opus-closed-loop',
        surfaced_by: 'opus',
        corroborated_by: ['gpt-5.5'],
        evidence_strength: 'external-source',
        disposition: 'kept',
        format_loss: false,
        note: 'Six-stage closed loop documented in section 12; gpt-5.5 corroborated.',
      },
    ],
  });
  assert.strictEqual(findings.length, 1);
  assert.ok(findings[0].title.includes('Six-stage closed loop'), 'note becomes the readable title (not the bare id)');
  assert.strictEqual(findings[0].verdict, 'kept', 'disposition maps to verdict');
  assert.ok(findings[0].peek.some((p) => p.label === 'note'), 'note available in peek');
  assert.ok(findings[0].peek.some((p) => p.label === 'corroborated'), 'corroborated_by available in peek');
  assert.ok(findings[0].peek.some((p) => p.label === 'evidence'), 'evidence_strength available in peek');
});

ok('a per-finding note persists alongside the decision and survives a later decision change', () => {
  const findings = extractFindings({ findings: [{ id: 'f1', title: 'Tighten the verdict wording' }] });
  // Approve with no note, then attach a note (the `c` key passes the note as the 5th arg).
  let state = applyFindingDecision(null, 'f1', 'approved', '2026-06-14T00:00:00.000Z');
  state = applyFindingDecision(state, 'f1', 'approved', '2026-06-14T00:01:00.000Z', 'kept: user-facing impact');
  let rec = decisionRecord(findings[0], state);
  assert.strictEqual(rec.decision, 'approved');
  assert.strictEqual(rec.note, 'kept: user-facing impact', 'note stored');
  // A bare decision change (no note arg) preserves the existing note.
  state = applyFindingDecision(state, 'f1', 'disapproved', '2026-06-14T00:02:00.000Z');
  rec = decisionRecord(findings[0], state);
  assert.strictEqual(rec.decision, 'disapproved', 'decision changed');
  assert.strictEqual(rec.note, 'kept: user-facing impact', 'note preserved across a bare decision change');
  // An explicit empty-string note clears it.
  state = applyFindingDecision(state, 'f1', 'disapproved', '2026-06-14T00:03:00.000Z', '');
  assert.strictEqual(decisionRecord(findings[0], state).note, null, 'empty note clears it');
});

ok('nextPendingIndex walks only undecided findings and wraps', () => {
  const findings = extractFindings({ findings: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }] });
  let state = applyFindingDecision(null, 'b', 'approved');
  state = applyFindingDecision(state, 'c', 'disapproved');
  // from index 0 (a), next pending forward is d (index 3) — b and c are decided
  assert.strictEqual(nextPendingIndex(findings, state, 0, 1), 3, 'skips decided b/c, lands on d');
  // from d (index 3) forward wraps to a (index 0)
  assert.strictEqual(nextPendingIndex(findings, state, 3, 1), 0, 'wraps to a');
  // backward from a (index 0) wraps to d
  assert.strictEqual(nextPendingIndex(findings, state, 0, -1), 3, 'backward wraps to d');
  // all decided → -1
  let allDone = state;
  for (const id of ['a', 'd']) allDone = applyFindingDecision(allDone, id, 'approved');
  assert.strictEqual(nextPendingIndex(findings, allDone, 0, 1), -1, 'no pending → -1');
});

ok('completeness banner: INCOMPLETE while pending, REVIEWED when all decided', () => {
  const findings = extractFindings({ findings: [{ id: 'a', title: 'A' }, { id: 'b', title: 'B' }] });
  const incomplete = renderFindingsReview(findings, applyFindingDecision(null, 'a', 'approved'), { selectedIndex: 0, width: 100 });
  assert.ok(incomplete.lines.some((l) => l.includes('REVIEW INCOMPLETE') && l.includes('1 still pending')), 'shows INCOMPLETE with pending count');
  let done = applyFindingDecision(null, 'a', 'approved');
  done = applyFindingDecision(done, 'b', 'disapproved');
  const complete = renderFindingsReview(findings, done, { selectedIndex: 0, width: 100 });
  assert.ok(complete.lines.some((l) => l.includes('ALL 2 REVIEWED')), 'shows ALL REVIEWED when none pending');
});

ok('disposition-priority sort surfaces kept before deferred/rejected, evidence breaks ties', () => {
  const findings = extractFindings({
    contributions: [
      { id: 'r1', note: 'rejected one', disposition: 'rejected', evidence_strength: 'direct-file-line' },
      { id: 'k-weak', note: 'kept weak evidence', disposition: 'kept', evidence_strength: 'inference' },
      { id: 'k-strong', note: 'kept strong evidence', disposition: 'kept', evidence_strength: 'direct-file-line' },
      { id: 'd1', note: 'deferred one', disposition: 'deferred' },
    ],
  });
  const sorted = sortFindings(findings, 'disposition-priority');
  // kept first (strongest evidence ahead of weaker), then deferred (rank 2), then rejected (rank 3)
  assert.strictEqual(sorted[0].id, 'k-strong', 'kept + strongest evidence first');
  assert.strictEqual(sorted[1].id, 'k-weak', 'kept + weaker evidence second');
  assert.strictEqual(sorted[2].id, 'd1', 'deferred (rank 2) before rejected (rank 3)');
  assert.strictEqual(sorted[3].id, 'r1', 'rejected last');
});

ok('decision-status sort surfaces pending first; original preserves order; sortFindings does not mutate input', () => {
  const findings = extractFindings({ findings: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] });
  const state = applyFindingDecision(applyFindingDecision(null, 'a', 'approved'), 'b', 'disapproved');
  const byStatus = sortFindings(findings, 'decision-status', state);
  assert.strictEqual(byStatus[0].id, 'c', 'pending finding first');
  const original = sortFindings(findings, 'original');
  assert.deepStrictEqual(original.map((f) => f.id), ['a', 'b', 'c'], 'original order preserved');
  assert.deepStrictEqual(findings.map((f) => f.id), ['a', 'b', 'c'], 'input array not mutated');
  assert.strictEqual(normalizeSort('bogus'), 'disposition-priority', 'bad sort falls back to default');
});

ok('loadReviewViews returns the default fallback for a missing/unreadable file', () => {
  const views = loadReviewViews(path.join(tmp, 'does-not-exist.json'));
  assert.ok(Array.isArray(views) && views.length === DEFAULT_REVIEW_VIEWS.length, 'falls back to default views');
  assert.ok(views.every((v) => typeof v.name === 'string' && v.name.length), 'each default view has a name');
  // A real file is read and normalized.
  const cfgPath = path.join(tmp, 'views.json');
  fs.writeFileSync(cfgPath, JSON.stringify({ views: [{ name: 'Mine', verdict: 'kept', sort: 'decision-status' }] }));
  const loaded = loadReviewViews(cfgPath);
  assert.strictEqual(loaded.length, 1);
  assert.strictEqual(loaded[0].name, 'Mine');
  assert.strictEqual(loaded[0].sort, 'decision-status', 'view sort normalized');
  assert.strictEqual(loaded[0].group_by, 'none', 'missing group_by normalized to none');
});

ok('decisionCounts tallies approved/disapproved/pending/total', () => {
  const findings = extractFindings({ findings: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] });
  const state = applyFindingDecision(applyFindingDecision(null, 'a', 'approved'), 'b', 'disapproved');
  assert.deepStrictEqual(decisionCounts(findings, state), { approved: 1, disapproved: 1, pending: 1, total: 3 });
});

// ── 3e. markdown merge-ledger parsing + live-heartbeat findings emission ──
console.log('3e. markdown ledger parsing + live heartbeat findings');

ok('parseMarkdownLedger reads a | Finding | Decision | Evidence | table', () => {
  const md = [
    '# Merge Ledger', '', '> Contributor: codex', '',
    '| Finding | Decision | Evidence |',
    '| --- | --- | --- |',
    '| F1: skill absent from active tree | Fixed | Added SKILL.md; lint passes. |',
    '| F2: no eval artifacts | Fixed | Added 7 evals. |',
    '', '## Rejected Changes', 'No content removed.',
  ].join('\n');
  const findings = parseMarkdownLedger(md);
  assert.strictEqual(findings.length, 2, 'two table rows → two findings');
  assert.strictEqual(findings[0].id, 'F1');
  assert.ok(findings[0].finding.includes('skill absent'));
  assert.strictEqual(findings[0].disposition, 'Fixed', 'decision column maps to disposition');
});

ok('parseMarkdownLedger reads ### F<n> finding sections (and ignores a non-finding Verdicts table)', () => {
  const md = [
    '# Audit Ledger', '',
    '## Verdicts (earned from evidence)', '',
    '| Verdict | Result | Basis |',
    '| --- | --- | --- |',
    '| structural_verdict | PASS | lint clean |',
    '', '## Findings (examined 2, report 2)', '',
    '### F1 — category:DRIFT (STALE), severity P1 — FILED → Linear',
    'The subsystem is absent from HEAD.',
    '- Disposition: FILED → SH-6350',
    '', '### F2 — category:QUALITY, severity P3 — FIXED',
    'Minor wording gap.',
  ].join('\n');
  const findings = parseMarkdownLedger(md);
  assert.strictEqual(findings.length, 2, 'two ### finding sections; the Verdicts table is NOT a finding');
  assert.strictEqual(findings[0].id, 'F1');
  assert.strictEqual(findings[0].severity, 'P1', 'severity parsed from the heading');
  assert.ok(/FILED/.test(findings[0].disposition || ''), 'disposition parsed from the body');
  assert.ok(findings[0].description.includes('absent from HEAD'), 'body becomes the description');
});

ok('parseMarkdownLedger returns [] for an unstructured ledger (no findings table) — no fabrication', () => {
  const md = [
    '# Merge Ledger - conductor', '',
    '## Files Changed', '- `skills/conductor/SKILL.md`', '  - Bumped schema version.',
    '## Preserve Decisions', '- Preserved primary scope.',
  ].join('\n');
  assert.deepStrictEqual(parseMarkdownLedger(md), [], 'no structured findings → empty, not invented');
});

ok('loadFindingsFile sniffs JSON vs markdown by content', () => {
  const jsonPath = path.join(tmp, 'ledger.json');
  fs.writeFileSync(jsonPath, JSON.stringify({ contributions: [{ id: 'c1', disposition: 'kept', note: 'kept note' }] }));
  const fromJson = loadFindingsFile(jsonPath);
  assert.strictEqual(fromJson.length, 1);
  assert.strictEqual(fromJson[0].verdict, 'kept', 'JSON contribution normalized (disposition→verdict)');
  const mdPath = path.join(tmp, 'ledger.md');
  fs.writeFileSync(mdPath, '| Finding | Decision |\n| --- | --- |\n| F1: a thing | Fixed |\n');
  const fromMd = loadFindingsFile(mdPath);
  assert.strictEqual(fromMd.length, 1, 'markdown file parsed via fallback');
  assert.strictEqual(fromMd[0].id, 'F1');
  assert.deepStrictEqual(loadFindingsFile(path.join(tmp, 'missing.md')), [], 'missing file → []');
});

ok('reporter emits findings into the live heartbeat via a findings event', () => {
  const sf = statusPath('live-findings');
  const r = createProgressReporter({ skill: 'demo', mandatoryModels: ['opus', 'gpt-5.5'], advisoryModels: [], statusFile: sf, tty: false, out: fakeStream() });
  r.heartbeat();
  let st = readStatus(sf);
  assert.ok(!('findings' in st) || !st.findings, 'no findings before the event');
  r.onProgress({ kind: 'findings', findings: [{ id: 'opus-1', disposition: 'kept', note: 'add an example' }] });
  st = readStatus(sf);
  assert.ok(Array.isArray(st.findings) && st.findings.length === 1, 'findings present in the heartbeat after the event');
  assert.strictEqual(st.findings[0].id, 'opus-1');
  // The viewer then reads them straight from the heartbeat (no --findings-file).
  const viewerFindings = extractFindings(st);
  assert.strictEqual(viewerFindings.length, 1);
  assert.ok(viewerFindings[0].title.includes('add an example'), 'note becomes the finding title in the viewer');
});

ok('updateCellStatus merges an optional findings array into the in-session heartbeat', () => {
  const { updateCellStatus } = require('../../lib/audit/panel-status-file');
  const sf = statusPath('insession-findings');
  updateCellStatus(sf, { skill: 'demo', model: 'opus', tier: 'mandatory', phase: 'curate', state: 'running' });
  assert.ok(!readStatus(sf).findings, 'no findings on the running tick');
  updateCellStatus(sf, { skill: 'demo', model: 'opus', tier: 'mandatory', phase: 'curate', state: 'done', findings: [{ id: 'c1', disposition: 'kept' }] });
  const st = readStatus(sf);
  assert.ok(Array.isArray(st.findings) && st.findings.length === 1 && st.findings[0].id === 'c1', 'findings merged on the done tick');
});

// ── 4. helper ──
console.log('4. helpers');
ok('fmtElapsed formats seconds and minutes', () => {
  assert.strictEqual(fmtElapsed(5000), '5s');
  assert.strictEqual(fmtElapsed(65000), '1m 5s');
  assert.strictEqual(fmtElapsed(120000), '2m');
});

// ── D5. writeRunnerHeartbeat — the non-panel-runner heartbeat (batch-eval, evaluate-skill, evolve) ──
console.log('D5. writeRunnerHeartbeat (non-panel runners)');
const { writeRunnerHeartbeat } = require('../../lib/audit/panel-status-file');

ok('writes a valid status.json in the panel-progress contract shape', () => {
  const sf = statusPath('runner-shape');
  writeRunnerHeartbeat(sf, {
    skill: null, phase: 'batch-eval', total: 3, done: 1, failed: 0,
    agents: [
      { model: 's-a', tier: 'eval', phase: 'evaluate', state: 'done' },
      { model: 's-b', tier: 'eval', phase: 'evaluate', state: 'running' },
      { model: 's-c', tier: 'eval', phase: 'evaluate', state: 'pending' },
    ],
  });
  const st = readStatus(sf);
  // Same top-level keys the watch-audit-batch.sh / watch-panel.js readers expect.
  for (const k of ['ts', 'pid', 'skill', 'phase', 'total', 'done', 'failed', 'running', 'complete', 'agents']) {
    assert.ok(k in st, `status.json carries key ${k}`);
  }
  assert.strictEqual(st.total, 3);
  assert.strictEqual(st.done, 1);
  assert.strictEqual(st.phase, 'batch-eval');
  assert.strictEqual(st.complete, false);
  assert.strictEqual(st.agents.length, 3);
  // running[] is derived from agents in the 'running' state.
  assert.strictEqual(st.running.length, 1);
  assert.strictEqual(st.running[0].cell, 's-b:evaluate');
});

ok('complete:true is recorded; counters default from agents when omitted', () => {
  const sf = statusPath('runner-complete');
  writeRunnerHeartbeat(sf, {
    phase: 'evolve', complete: true,
    agents: [
      { model: 'x', tier: 'evolve', phase: 'evolve', state: 'done' },
      { model: 'y', tier: 'evolve', phase: 'evolve', state: 'failed' },
    ],
  });
  const st = readStatus(sf);
  assert.strictEqual(st.complete, true);
  assert.strictEqual(st.total, 2);   // defaulted from agents.length
  assert.strictEqual(st.done, 1);    // defaulted from agents in 'done' state
  assert.strictEqual(st.failed, 1);  // defaulted from agents in 'failed' state
});

ok('optional findings and findings_review pass through the heartbeat writer', () => {
  const sf = statusPath('runner-findings');
  writeRunnerHeartbeat(sf, {
    phase: 'curate',
    findings: [{ id: 'f1', title: 'Reviewable finding' }],
    findings_review: { approved: 0, disapproved: 0, pending: 1, review_file: '/tmp/review.json' },
  });
  const st = readStatus(sf);
  assert.deepStrictEqual(st.findings, [{ id: 'f1', title: 'Reviewable finding' }]);
  assert.strictEqual(st.findings_review.pending, 1);
  assert.strictEqual(st.findings_review.review_file, '/tmp/review.json');
});

ok('no-op on a falsy statusFile (opt-in); never throws on a bad path', () => {
  assert.doesNotThrow(() => writeRunnerHeartbeat(null, { phase: 'x' }));
  assert.doesNotThrow(() => writeRunnerHeartbeat('', { phase: 'x' }));
  // A path under a file (un-creatable dir) is swallowed best-effort, not thrown.
  const badParent = statusPath('not-a-dir');
  fs.writeFileSync(badParent, 'x');
  assert.doesNotThrow(() => writeRunnerHeartbeat(path.join(badParent, 'child.json'), { phase: 'x' }));
});

try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (_) {}

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
