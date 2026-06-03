#!/usr/bin/env node
'use strict';

/**
 * update-model-roster.js
 *
 * The model roster is single-source: Claude family aliases (`opus`/`sonnet`/
 * `haiku`) and the `codex-current` role track "latest" automatically (the CLI/app
 * resolves the newest model — no edit needed when a new Claude or GPT ships).
 *
 * Providers WITHOUT a CLI latest-alias (Gemini, and the OpenCode GPT pin) keep
 * their concrete id in `MODEL_LATEST` inside the registry. This script is the
 * one-command way to view and bump those pins so a version string is never hand-
 * edited in scattered places.
 *
 * Usage:
 *   node scripts/update-model-roster.js                       # print the roster + which pins need manual bumps
 *   node scripts/update-model-roster.js --set geminiPro=gemini-3.2-pro-preview
 *   node scripts/update-model-roster.js --set geminiFlash=<id> --set gptOpenCode=<id>
 *
 * `--set <key>=<value>` rewrites the `MODEL_LATEST.<key>` literal in BOTH the
 * canonical registry (lib/audit-shared/model-provider.js) and the workspace
 * mirror, and bumps `REGISTRY_VERSION` to today's date so eval receipts record a
 * new model epoch. Writing the registry is a SYSTEM change — review and commit it.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const CANONICAL = path.join(REPO_ROOT, 'lib/audit-shared/model-provider.js');
const WORKSPACE_MIRROR = path.resolve(REPO_ROOT, '..', 'scripts/shared/model-provider.js');

function parseSetArgs(argv) {
  const sets = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--set' && argv[i + 1]) {
      const [k, ...rest] = argv[i + 1].split('=');
      sets[k.trim()] = rest.join('=').trim();
      i += 1;
    }
  }
  return sets;
}

function printRoster() {
  const { MODEL_LATEST, OPENCODE_LATEST, REGISTRY_VERSION } = require(CANONICAL);
  console.log(`Model roster — registry version ${REGISTRY_VERSION}\n`);
  console.log('Auto-latest (no pin to maintain):');
  console.log('  opus / sonnet / haiku          → newest Claude (claude CLI alias)');
  console.log('  strongest-reasoning-grader     → newest Opus  (the evaluator)');
  console.log('  representative-generator       → newest Sonnet');
  console.log('  codex-current                  → newest GPT Codex serves (model flag omitted)\n');
  console.log('Single-source pins in MODEL_LATEST (bump with --set <key>=<id>):');
  for (const [k, v] of Object.entries(MODEL_LATEST)) {
    console.log(`  ${k.padEnd(14)} = ${v}`);
  }
  if (OPENCODE_LATEST) {
    console.log('\nOpenCode Zen free-tier pins in OPENCODE_LATEST (bump with --set <key>=<id>;');
    console.log('verify against the live catalog: `opencode models | grep -iE free`):');
    for (const [k, v] of Object.entries(OPENCODE_LATEST)) {
      console.log(`  ${k.padEnd(14)} = ${v}`);
    }
  }
}

function applySet(filePath, key, value) {
  if (!fs.existsSync(filePath)) return false;
  let src = fs.readFileSync(filePath, 'utf8');
  // Match:  <key>: '<old>',   inside the MODEL_LATEST block.
  const re = new RegExp(`(\\b${key}\\s*:\\s*)'[^']*'`);
  if (!re.test(src)) return false;
  src = src.replace(re, `$1'${value}'`);
  // Bump REGISTRY_VERSION to today (a pin change is a new model epoch).
  const today = new Date().toISOString().slice(0, 10);
  src = src.replace(/(const REGISTRY_VERSION = )'[^']*'/, `$1'${today}'`);
  fs.writeFileSync(filePath, src);
  return true;
}

function main() {
  const argv = process.argv.slice(2);
  const sets = parseSetArgs(argv);

  if (Object.keys(sets).length === 0) {
    printRoster();
    return;
  }

  const { MODEL_LATEST, OPENCODE_LATEST = {} } = require(CANONICAL);
  const validKeys = { ...MODEL_LATEST, ...OPENCODE_LATEST };
  for (const [key, value] of Object.entries(sets)) {
    if (!(key in validKeys)) {
      console.error(`✗ Unknown pin key '${key}'. Valid keys: ${Object.keys(validKeys).join(', ')}`);
      process.exit(2);
    }
    const a = applySet(CANONICAL, key, value);
    const b = applySet(WORKSPACE_MIRROR, key, value);
    console.log(`${a ? '✓' : '✗'} canonical   ${key} → ${value}`);
    console.log(`${b ? '✓' : '⚠'} ws mirror   ${key} → ${value}${b ? '' : ' (mirror not found / pattern missing — check manually)'}`);
  }
  console.log('\nRegistry pin(s) updated and REGISTRY_VERSION bumped. Review the diff and commit (SYSTEM change).');
}

if (require.main === module) {
  main();
}

module.exports = { applySet, parseSetArgs };
