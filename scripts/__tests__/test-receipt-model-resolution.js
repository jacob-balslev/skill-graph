#!/usr/bin/env node
/**
 * Tests for eval-receipt model resolution (SKI-41).
 *
 * An eval receipt that records the bare grader/generator ALIAS (e.g. "opus") is
 * dishonest about comparability: a bare claude alias resolves to "newest
 * installed" at run time, so grader_model:"opus" is byte-identical across Opus
 * 4.8 and 4.9, and REGISTRY_VERSION only moves on a registry EDIT (never on CLI
 * resolution). resolveReceiptModelId() maps a latest-resolving alias to the honest
 * `latest-alias-unresolved` sentinel, keeps a concrete pinned id (gemini/gpt)
 * as-is, and prefers the concrete model captured from a codex run when available.
 *
 * Uses only Node built-ins.
 */

'use strict';

const {
  resolveReceiptModelId,
  LATEST_ALIAS_SENTINEL,
} = require('../../lib/audit/skill-improvement-helpers');
const { isLatestResolvingModel } = require('../../lib/audit-shared/model-provider');

let passed = 0;
let failed = 0;

function eq(name, actual, expected) {
  if (actual === expected) {
    passed += 1;
    console.log(`✓ ${name}`);
  } else {
    failed += 1;
    console.error(`✗ ${name}\n  expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

// isLatestResolvingModel: null + bare claude aliases are "newest at run time".
eq('isLatestResolvingModel(null)', isLatestResolvingModel(null), true);
eq('isLatestResolvingModel(undefined)', isLatestResolvingModel(undefined), true);
eq('isLatestResolvingModel("opus")', isLatestResolvingModel('opus'), true);
eq('isLatestResolvingModel("OPUS") (case-insensitive)', isLatestResolvingModel('OPUS'), true);
eq('isLatestResolvingModel("sonnet")', isLatestResolvingModel('sonnet'), true);
eq('isLatestResolvingModel("haiku")', isLatestResolvingModel('haiku'), true);
eq('isLatestResolvingModel("gpt-5.4") is concrete', isLatestResolvingModel('gpt-5.4'), false);
eq('isLatestResolvingModel("gemini-3.1-pro-preview") is concrete', isLatestResolvingModel('gemini-3.1-pro-preview'), false);

// resolveReceiptModelId: bare claude aliases → sentinel (not "opus").
eq('opus → sentinel', resolveReceiptModelId('opus'), LATEST_ALIAS_SENTINEL);
eq('sonnet → sentinel', resolveReceiptModelId('sonnet'), LATEST_ALIAS_SENTINEL);
eq('strongest-reasoning-grader → sentinel (resolves to opus)',
  resolveReceiptModelId('strongest-reasoning-grader'), LATEST_ALIAS_SENTINEL);
eq('representative-generator → sentinel (resolves to sonnet)',
  resolveReceiptModelId('representative-generator'), LATEST_ALIAS_SENTINEL);

// Concrete pinned ids are recorded as-is.
eq('gemini → concrete gemini-3.1-pro-preview', resolveReceiptModelId('gemini'), 'gemini-3.1-pro-preview');
eq('gpt-5.4 → concrete gpt-5.4', resolveReceiptModelId('gpt-5.4'), 'gpt-5.4');

// codex-current resolves to null (app-current) → sentinel unless a concrete id
// was captured from the codex output header (SH-6680).
eq('codex-current → sentinel without capture', resolveReceiptModelId('codex-current'), LATEST_ALIAS_SENTINEL);
eq('codex-current → captured id when supplied',
  resolveReceiptModelId('codex-current', { capturedCodexModel: 'gpt-5.5-codex' }), 'gpt-5.5-codex');

console.log(`\nTests passed: ${passed}`);
console.log(`Tests failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
