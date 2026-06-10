#!/usr/bin/env node
/**
 * Test: evolve generate_evals is self-contained (SH-6643 option B).
 *
 * Receipt that the evolve execute-phase no longer spawns a Development-tree
 * `dispatch-solver.js` (which does not exist in a standalone @skill-graph/cli
 * install and lived at the wrong path even in-workspace). Asserts:
 *
 *   1. buildModelInvocation resolves a REAL model CLI (claude/gemini/opencode),
 *      never a `node <missing-script>` spawn — the invocation has no dispatch-solver.
 *   2. apply vs plan permission modes are correct.
 *   3. resolveWorkspaceScript returns null for an absent orchestration script, so
 *      checkpoint()/emitEvent() degrade gracefully (no hard failure on a standalone
 *      install where loop-checkpoint.js / agent-events.js do not exist).
 */

'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawnSync } = require('child_process');

const mod = require('../../lib/audit/skill-evolution-loop');
const { buildModelInvocation, resolveWorkspaceScript, validateGeneratedEvalsBundle } = mod;

let failures = 0;
function assert(condition, msg) {
  if (condition) process.stdout.write(`  PASS  ${msg}\n`);
  else { process.stderr.write(`  FAIL  ${msg}\n`); failures += 1; }
}

assert(typeof buildModelInvocation === 'function', 'buildModelInvocation is exported');
assert(typeof resolveWorkspaceScript === 'function', 'resolveWorkspaceScript is exported');
assert(typeof validateGeneratedEvalsBundle === 'function', 'validateGeneratedEvalsBundle is exported');

// 1 + 2: sonnet apply mode → real claude CLI, acceptEdits, no dispatch-solver.
{
  const { cli, args } = buildModelInvocation('GEN EVALS PROMPT', { model: 'sonnet', apply: true });
  assert(cli === 'claude', 'sonnet resolves to the claude CLI (a real executor, not node)');
  assert(args.includes('-p') && args.includes('GEN EVALS PROMPT'),
    'invocation passes the prompt via -p (in-loop, not via dispatch-solver --prompt-file)');
  assert(args.includes('acceptEdits'),
    'apply mode uses --permission-mode acceptEdits so the model can write current eval artifacts');
  assert(args.includes('--dangerously-skip-permissions'),
    'apply mode passes --dangerously-skip-permissions');
  const joined = `${cli} ${args.join(' ')}`;
  assert(!/dispatch-solver/.test(joined), 'invocation NEVER references dispatch-solver.js');
  assert(cli !== 'node', 'invocation is a model CLI, never a bare `node <script>` spawn');
}

// plan mode → no write permissions.
{
  const { args } = buildModelInvocation('p', { model: 'sonnet', apply: false });
  assert(args.includes('plan') && !args.includes('acceptEdits'),
    'plan mode uses --permission-mode plan and does NOT accept edits');
  assert(!args.includes('--dangerously-skip-permissions'),
    'plan mode does not skip permissions');
}

// 3: graceful resolution — an absent orchestration script resolves to null.
{
  const r = resolveWorkspaceScript('definitely-not-a-real-script-xyz-987.js');
  assert(r === null,
    'resolveWorkspaceScript returns null for an absent script (checkpoint/emitEvent then no-op)');
}

// Current eval artifact validator accepts comprehension.json and rejects legacy evals.json shape.
{
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sg-evolve-evals-'));
  const comprehension = path.join(dir, 'comprehension.json');
  fs.writeFileSync(comprehension, JSON.stringify({
    skill_name: 'test-skill',
    subject: 'Test Skill',
    evals: [
      { id: 1, dimension: 'definition', prompt: 'Define it.', substance: 'concept', calibration: 'semantic', truth_mode: 'conceptual_correctness', skill_type: 'concept', criticality: 'medium', negative_expectation: 'Do not give generic advice.' },
      { id: 2, dimension: 'mental_model', prompt: 'Explain the model.', substance: 'concept', calibration: 'semantic', truth_mode: 'conceptual_correctness', skill_type: 'concept', criticality: 'medium' },
      { id: 3, dimension: 'purpose', prompt: 'Why use it?', substance: 'concept', calibration: 'semantic', truth_mode: 'conceptual_correctness', skill_type: 'concept', criticality: 'medium' },
      { id: 4, dimension: 'boundary', prompt: 'When not?', substance: 'boundary', calibration: 'semantic', truth_mode: 'conceptual_correctness', skill_type: 'concept', criticality: 'high' },
      { id: 5, dimension: 'application', prompt: 'Apply it.', substance: 'procedure', calibration: 'semantic', truth_mode: 'conceptual_correctness', skill_type: 'procedure', criticality: 'medium' },
    ],
  }));
  const legacy = path.join(dir, 'legacy-evals.json');
  fs.writeFileSync(legacy, JSON.stringify({ evals: [{ id: 1, prompt: 'p', expected_output: 'e', expectations: ['Does not x', 'a', 'b'] }] }));
  assert(validateGeneratedEvalsBundle(comprehension, { evalType: 'comprehension' }).valid === true,
    'validator accepts current comprehension.json shape');
  assert(validateGeneratedEvalsBundle(legacy, { evalType: 'comprehension' }).valid === false,
    'validator rejects legacy evals.json shape');
  fs.rmSync(dir, { recursive: true, force: true });
}

// --help exits before the loop starts.
{
  const script = path.resolve(__dirname, '..', '..', 'lib', 'audit', 'skill-evolution-loop.js');
  const r = spawnSync(process.execPath, [script, '--help'], { encoding: 'utf8' });
  assert(r.status === 0, '--help exits 0');
  assert(/Usage: node lib\/audit\/skill-evolution-loop\.js/.test(r.stdout), '--help prints usage text');
  assert(!/=== Skill Evolution Loop ===/.test(r.stdout), '--help does not start the loop');
}

if (failures > 0) {
  process.stderr.write(`\ntest-evolve-self-contained: ${failures} assertion(s) FAILED\n`);
  process.exit(1);
}
process.stdout.write('\nPASS test-evolve-self-contained: generate_evals is self-contained (SH-6643 option B)\n');
