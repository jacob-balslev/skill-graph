#!/usr/bin/env node
/**
 * Test: check-audit-manifest application-artifact enforcement (SH-6548).
 *
 * Receipt that promoting GRADED_APPLICATION_VERDICTS from informational to
 * blocking actually fires. Builds a hermetic temp workspace with a per-run
 * verdict claiming a high-stakes graded application verdict, then drives the
 * real check-audit-manifest.js via --workspace and asserts:
 *
 *   1. ORPHAN: application=APPLICABLE with no evals/application.json → gate FAILS
 *      (exit 1) and the failure names the missing application.json.
 *   2. SATISFIED: same verdict WITH evals/application.json on disk → gate PASSES.
 *   3. HONEST DOWNGRADE: orphan run-record but the SKILL.md application_verdict
 *      is UNVERIFIED → gate PASSES (downgrade is the documented resolution path).
 *   4. HARMFUL: any active skill in skills.manifest.json with
 *      application_verdict:HARMFUL → gate FAILS until removed from active corpus.
 *
 * Symmetric to the long-standing comprehension-artifact gate.
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const GATE = path.join(__dirname, '..', 'check-audit-manifest.js');

let failures = 0;
function assert(condition, msg) {
  if (condition) {
    process.stdout.write(`  PASS  ${msg}\n`);
  } else {
    process.stderr.write(`  FAIL  ${msg}\n`);
    failures += 1;
  }
}

function mkWorkspace({ withApplicationJson, skillMdApplicationVerdict }) {
  const ws = fs.mkdtempSync(path.join(os.tmpdir(), 'cam-app-'));
  const skill = 'fixture-skill';
  const runId = '20260531-000000';
  // Run-root relocated 2026-06-07T to skill-graph/skill-audit-loop/progress/skill-audits per
  // ADR-0016 surface #3 supersession — the fixture builds the run dir at the new root the gate reads.
  const runDir = path.join(ws, 'skill-graph', 'skill-audit-loop', 'progress', 'skill-audits', skill, 'runs', runId);
  fs.mkdirSync(runDir, { recursive: true });
  // verdict.md claims a high-stakes graded application verdict; comprehension is
  // UNVERIFIED so this test isolates the application gate.
  fs.writeFileSync(path.join(runDir, 'verdict.md'),
    '# Verdict\n\ncomprehension_verdict: UNVERIFIED\napplication_verdict: APPLICABLE\n');

  const skillDir = path.join(ws, 'skills', skill);
  fs.mkdirSync(path.join(skillDir, 'evals'), { recursive: true });
  if (skillMdApplicationVerdict) {
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'),
      `---\nname: ${skill}\napplication_verdict: ${skillMdApplicationVerdict}\n---\nbody\n`);
  }
  if (withApplicationJson) {
    fs.writeFileSync(path.join(skillDir, 'evals', 'application.json'),
      JSON.stringify({ skill, cases: [] }, null, 2));
  }
  return ws;
}

function writeSkillsManifest(ws, skills) {
  fs.writeFileSync(path.join(ws, 'skills.manifest.json'), JSON.stringify({
    schema_version: 4,
    generated_at: '2026-06-13T00:00:00.000Z',
    skills,
  }, null, 2));
}

function runGate(ws) {
  const res = spawnSync('node', [GATE, '--workspace', ws, '--json'], { encoding: 'utf8' });
  let parsed = null;
  try { parsed = JSON.parse(res.stdout); } catch (_) { /* leave null */ }
  return { code: res.status, json: parsed, stdout: res.stdout, stderr: res.stderr };
}

function cleanup(ws) {
  try { fs.rmSync(ws, { recursive: true, force: true }); } catch (_) { /* best effort */ }
}

// 1. ORPHAN — no application.json, no SKILL.md downgrade → must FAIL.
{
  const ws = mkWorkspace({ withApplicationJson: false, skillMdApplicationVerdict: null });
  const r = runGate(ws);
  const appFailure = r.json && (r.json.failures_detail || []).find(f =>
    f.skill === 'fixture-skill' && /application\.json/.test(f.reason || ''));
  assert(r.code === 1, 'orphan graded application verdict fails the gate (exit 1)');
  assert(!!appFailure, 'failure names the missing application.json artifact');
  cleanup(ws);
}

// 2. SATISFIED — application.json present → must PASS.
{
  const ws = mkWorkspace({ withApplicationJson: true, skillMdApplicationVerdict: null });
  const r = runGate(ws);
  const appFailure = r.json && (r.json.failures_detail || []).find(f =>
    f.skill === 'fixture-skill' && /application\.json/.test(f.reason || ''));
  assert(r.code === 0, 'graded application verdict WITH application.json passes the gate (exit 0)');
  assert(!appFailure, 'no application failure when the artifact exists');
  cleanup(ws);
}

// 3. HONEST DOWNGRADE — SKILL.md application_verdict UNVERIFIED → must PASS.
{
  const ws = mkWorkspace({ withApplicationJson: false, skillMdApplicationVerdict: 'UNVERIFIED' });
  const r = runGate(ws);
  const appFailure = r.json && (r.json.failures_detail || []).find(f =>
    f.skill === 'fixture-skill' && /application\.json/.test(f.reason || ''));
  assert(r.code === 0, 'honest downgrade to UNVERIFIED in SKILL.md resolves the orphan (exit 0)');
  assert(!appFailure, 'no application failure after honest downgrade');
  cleanup(ws);
}

// 4. HARMFUL — active manifest entry with application_verdict:HARMFUL → must FAIL.
{
  const ws = mkWorkspace({ withApplicationJson: true, skillMdApplicationVerdict: null });
  writeSkillsManifest(ws, [{
    name: 'harmful-skill',
    path: 'skills/harmful-skill/SKILL.md',
    health: { application_verdict: 'HARMFUL' },
  }]);
  const r = runGate(ws);
  assert(r.code === 1, 'active HARMFUL skill fails the gate (exit 1)');
  assert(
    r.json && Array.isArray(r.json.harmful_skills) && r.json.harmful_skills.some(s => s.name === 'harmful-skill'),
    'JSON output names the harmful skill that must be removed',
  );
  cleanup(ws);
}

if (failures > 0) {
  process.stderr.write(`\ntest-application-artifact-enforcement: ${failures} assertion(s) FAILED\n`);
  process.exit(1);
}
process.stdout.write('\nPASS test-application-artifact-enforcement: SH-6548 application gate is blocking\n');
