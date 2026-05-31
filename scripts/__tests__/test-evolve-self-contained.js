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

const mod = require('../../lib/audit/skill-evolution-loop');
const { buildModelInvocation, resolveWorkspaceScript } = mod;

let failures = 0;
function assert(condition, msg) {
  if (condition) process.stdout.write(`  PASS  ${msg}\n`);
  else { process.stderr.write(`  FAIL  ${msg}\n`); failures += 1; }
}

assert(typeof buildModelInvocation === 'function', 'buildModelInvocation is exported');
assert(typeof resolveWorkspaceScript === 'function', 'resolveWorkspaceScript is exported');

// 1 + 2: sonnet apply mode → real claude CLI, acceptEdits, no dispatch-solver.
{
  const { cli, args } = buildModelInvocation('GEN EVALS PROMPT', { model: 'sonnet', apply: true });
  assert(cli === 'claude', 'sonnet resolves to the claude CLI (a real executor, not node)');
  assert(args.includes('-p') && args.includes('GEN EVALS PROMPT'),
    'invocation passes the prompt via -p (in-loop, not via dispatch-solver --prompt-file)');
  assert(args.includes('acceptEdits'),
    'apply mode uses --permission-mode acceptEdits so the model can write evals.json');
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

if (failures > 0) {
  process.stderr.write(`\ntest-evolve-self-contained: ${failures} assertion(s) FAILED\n`);
  process.exit(1);
}
process.stdout.write('\nPASS test-evolve-self-contained: generate_evals is self-contained (SH-6643 option B)\n');
