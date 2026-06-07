#!/usr/bin/env node
'use strict';

/**
 * Codex GPT-5.5 evaluation profile.
 *
 * This is a canonical Skill Graph wrapper around evaluate-skill.js, not a fork of
 * the evaluator. It exists for operator contexts where the default evaluator
 * would route through the Claude CLI. The wrapper pins the model env vars used by
 * the comprehension/application gates, forces the Codex backend for generator and
 * grader calls, enables tools-on execution for the generator, and marks the run
 * as single-model so PASS/APPLICABLE cannot be certified from same-family
 * evidence.
 */

const path = require('path');
const { spawnSync } = require('child_process');

const CODEX_GPT55_MODEL = 'gpt-5.5';
const CODEX_BACKEND = 'codex';
const EVALUATOR_PATH = path.join(__dirname, 'evaluate-skill.js');

const MODEL_ENV = Object.freeze({
  COMPREHENSION_GRADER_MODEL: CODEX_GPT55_MODEL,
  COMPREHENSION_GENERATOR_MODEL: CODEX_GPT55_MODEL,
  APPLICATION_GRADER_MODEL: CODEX_GPT55_MODEL,
  APPLICATION_GENERATOR_MODEL: CODEX_GPT55_MODEL,
});

const HELP = `Usage: skill-graph evaluate:gpt-5.5 [evaluate options] <eval-file>

Run the canonical evaluator through Codex CLI + GPT-5.5.

Injected profile:
  --grader codex
  --generator codex
  --tools-on
  --single-model
  COMPREHENSION_GRADER_MODEL=gpt-5.5
  COMPREHENSION_GENERATOR_MODEL=gpt-5.5
  APPLICATION_GRADER_MODEL=gpt-5.5
  APPLICATION_GENERATOR_MODEL=gpt-5.5

Confidence:
  This is a same-family Codex/GPT run. Positive behavior evidence is honest but
  provisional: it cannot earn comprehension PASS or application APPLICABLE.
  Use the cross-family evaluator path when a certifying verdict is required.

Examples:
  skill-graph evaluate:gpt-5.5 --comprehension skills/foo/evals/comprehension.json
  skill-graph evaluate:gpt-5.5 --mode application --application skills/foo skills/foo/evals/application.json
  skill-graph evaluate:gpt-5.5 --dry-run --eval-id 1 skills/foo/evals/comprehension.json
`;

function optionValue(argv, flag) {
  const eqPrefix = `${flag}=`;
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === flag) {
      return { found: true, value: argv[i + 1], index: i, equalsForm: false };
    }
    if (token.startsWith(eqPrefix)) {
      return { found: true, value: token.slice(eqPrefix.length), index: i, equalsForm: true };
    }
  }
  return { found: false, value: null, index: -1, equalsForm: false };
}

function hasFlag(argv, flag) {
  return argv.includes(flag) || argv.some((token) => token.startsWith(`${flag}=`));
}

function ensureOption(argv, flag, value) {
  const current = optionValue(argv, flag);
  if (!current.found) {
    argv.push(flag, value);
    return;
  }
  if (current.value !== value) {
    throw new Error(`${flag} must be "${value}" in the Codex GPT-5.5 evaluation profile; got "${current.value || ''}".`);
  }
}

function ensureBooleanFlag(argv, flag) {
  if (!hasFlag(argv, flag)) argv.push(flag);
}

function buildCodexGpt55Invocation(argv, baseEnv = process.env, options = {}) {
  const args = [...argv];
  if (hasFlag(args, '--certifying')) {
    throw new Error('The Codex GPT-5.5 profile is single-family evidence. Do not pass --certifying; use a cross-family run for PASS/APPLICABLE.');
  }

  ensureOption(args, '--grader', CODEX_BACKEND);
  ensureOption(args, '--generator', CODEX_BACKEND);
  ensureBooleanFlag(args, '--tools-on');
  ensureBooleanFlag(args, '--single-model');

  const env = {
    ...baseEnv,
    ...MODEL_ENV,
    SKILL_AUDIT_PROFILE: 'codex-gpt-5.5',
    SKILL_AUDIT_PROFILE_BACKEND: CODEX_BACKEND,
    SKILL_AUDIT_PROFILE_MODEL: CODEX_GPT55_MODEL,
  };

  return {
    command: options.nodePath || process.execPath,
    args: [options.evaluatorPath || EVALUATOR_PATH, ...args],
    env,
  };
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write(HELP);
    process.exit(0);
  }

  let invocation;
  try {
    invocation = buildCodexGpt55Invocation(argv);
  } catch (error) {
    process.stderr.write(`Error: ${error.message}\n\n`);
    process.stderr.write(HELP);
    process.exit(2);
  }

  process.stderr.write(
    `[skill-graph] Codex GPT-5.5 evaluator profile: backend=codex model=${CODEX_GPT55_MODEL} tools-on single-model\n`,
  );

  const result = spawnSync(invocation.command, invocation.args, {
    cwd: process.cwd(),
    env: invocation.env,
    stdio: 'inherit',
  });

  if (result.error) {
    process.stderr.write(`Failed to run Codex GPT-5.5 evaluator profile: ${result.error.message}\n`);
    process.exit(1);
  }
  process.exit(result.status == null ? 1 : result.status);
}

if (require.main === module) main();

module.exports = {
  CODEX_BACKEND,
  CODEX_GPT55_MODEL,
  EVALUATOR_PATH,
  HELP,
  MODEL_ENV,
  buildCodexGpt55Invocation,
};
