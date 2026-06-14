'use strict';

// Unit tests for agent telemetry extraction, JSONL persistence, and sidecar
// runtime telemetry pointers.

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  TELEMETRY_FILENAME,
  computeLineDelta,
  extractTokenUsage,
  startAgentTelemetry,
  finishAgentTelemetry,
  appendSkillTelemetry,
  readTelemetrySummary,
} = require('../../lib/audit/agent-telemetry');

let pass = 0;
let fail = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS    ${name}`); pass += 1; }
  catch (e) { console.log(`  FAIL    ${name}\n          ${e.message}`); fail += 1; }
}

check('computeLineDelta: exact added/removed/net lines by LCS', () => {
  const delta = computeLineDelta('a\nb\nc\n', 'a\nx\nc\nd\n');
  assert.strictEqual(delta.before_lines, 3);
  assert.strictEqual(delta.after_lines, 4);
  assert.strictEqual(delta.added_lines, 2);
  assert.strictEqual(delta.removed_lines, 1);
  assert.strictEqual(delta.net_lines, 1);
  assert.strictEqual(delta.algorithm, 'lcs');
});

check('extractTokenUsage: reads OpenAI/Gemini-style usage objects and JSONL streams', () => {
  const direct = extractTokenUsage({ usage: { prompt_tokens: 11, completion_tokens: 5, total_tokens: 16 } });
  assert.strictEqual(direct.input_tokens, 11);
  assert.strictEqual(direct.output_tokens, 5);
  assert.strictEqual(direct.total_tokens, 16);

  const jsonl = [
    JSON.stringify({ type: 'text', part: { text: 'hello' } }),
    JSON.stringify({ usage: { input_tokens: 20, output_tokens: 8 } }),
  ].join('\n');
  const fromJsonl = extractTokenUsage(jsonl);
  assert.strictEqual(fromJsonl.input_tokens, 20);
  assert.strictEqual(fromJsonl.output_tokens, 8);
  assert.strictEqual(fromJsonl.total_tokens, 28);
});

check('extractTokenUsage: records unavailable rather than estimating', () => {
  const usage = extractTokenUsage('plain text with no usage metadata');
  assert.strictEqual(usage.input_tokens, null);
  assert.strictEqual(usage.output_tokens, null);
  assert.strictEqual(usage.total_tokens, null);
  assert.strictEqual(usage.source, 'unavailable');
});

check('appendSkillTelemetry: writes sibling JSONL and audit-state runtime pointer', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-telemetry-'));
  fs.writeFileSync(path.join(dir, 'SKILL.md'), '---\nname: demo\n---\n# Demo\n');
  fs.writeFileSync(path.join(dir, 'audit-state.json'), `${JSON.stringify({
    schema_version: 8,
    owner: 'test',
    freshness: '2026-06-12',
    drift_check: { last_verified: '2026-06-12' },
    eval_artifacts: 'none',
    eval_state: 'unverified',
    routing_eval: 'absent',
  }, null, 2)}\n`);

  const started = startAgentTelemetry({
    skill: 'demo',
    operation: 'panel',
    phase: 'propose',
    model: 'gemini',
    backend: 'gemini',
    tier: 'advisory',
  });
  const entry = finishAgentTelemetry(started, {
    stdout: JSON.stringify({ usage: { input_tokens: 3, output_tokens: 4 } }),
    before_text: 'one\n',
    after_text: 'one\ntwo\n',
    artifact_path: path.join(dir, 'proposal.md'),
  });

  appendSkillTelemetry(dir, entry);

  const telemetryPath = path.join(dir, TELEMETRY_FILENAME);
  assert.ok(fs.existsSync(telemetryPath), 'agent-telemetry.jsonl exists');
  const lines = fs.readFileSync(telemetryPath, 'utf8').trim().split('\n');
  assert.strictEqual(lines.length, 1);
  const stored = JSON.parse(lines[0]);
  assert.strictEqual(stored.tokens.total_tokens, 7);
  assert.strictEqual(stored.line_delta.added_lines, 1);

  const summary = readTelemetrySummary(telemetryPath);
  assert.strictEqual(summary.agent_run_count, 1);
  assert.strictEqual(summary.total_tokens, 7);

  const sidecar = JSON.parse(fs.readFileSync(path.join(dir, 'audit-state.json'), 'utf8'));
  assert.strictEqual(sidecar.runtime_telemetry.feedback_source, TELEMETRY_FILENAME);
  assert.strictEqual(sidecar.runtime_telemetry.run_receipts_source, TELEMETRY_FILENAME);
  assert.strictEqual(sidecar.runtime_telemetry.metrics.agent_run_count, 1);
  assert.strictEqual(sidecar.runtime_telemetry.last_run.phase, 'propose');
});

console.log(`\nResults: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
