'use strict';

// Unit tests for scratch model-CLI homes and per-CLI environment routing.

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const h = require('../../lib/audit/model-cli-home');

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log(`  PASS    ${name}`);
}

console.log('1. scratch model CLI home');
check('creates writable HOME/CODEX_HOME/XDG dirs and copies selected auth/config only', () => {
  const real = fs.mkdtempSync(path.join(os.tmpdir(), 'real-home-'));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'scratch-home-'));
  fs.mkdirSync(path.join(real, '.codex'), { recursive: true });
  fs.writeFileSync(path.join(real, '.codex', 'auth.json'), '{"token":"x"}');
  fs.writeFileSync(path.join(real, '.codex', 'config.toml'), 'model="x"');
  fs.writeFileSync(path.join(real, '.codex', 'state_5.sqlite'), 'do-not-copy');
  fs.writeFileSync(path.join(real, '.claude.json'), '{"auth":"x"}');
  fs.mkdirSync(path.join(real, '.claude'), { recursive: true });
  fs.writeFileSync(path.join(real, '.claude', 'settings.json'), '{}');
  fs.mkdirSync(path.join(real, '.gemini', 'config'), { recursive: true });
  fs.writeFileSync(path.join(real, '.gemini', 'oauth_creds.json'), '{}');
  fs.writeFileSync(path.join(real, '.gemini', 'config', 'config.json'), '{}');
  fs.mkdirSync(path.join(real, '.config', 'opencode'), { recursive: true });
  fs.writeFileSync(path.join(real, '.config', 'opencode', 'opencode.jsonc'), '{}');
  fs.mkdirSync(path.join(real, '.local', 'share', 'opencode'), { recursive: true });
  fs.writeFileSync(path.join(real, '.local', 'share', 'opencode', 'account.json'), '{}');
  fs.writeFileSync(path.join(real, '.local', 'share', 'opencode', 'auth.json'), '{"credentials":[]}');

  const prepared = h.prepareModelCliHome({ mode: 'scratch', realHome: real, tmpDir: tmp });
  assert.strictEqual(prepared.active, true);
  assert.ok(h.canWriteDir(prepared.env.CODEX_HOME));
  assert.deepStrictEqual(prepared.envByCli.claude, {}, 'Claude keeps real HOME for keychain-bound auth');
  assert.strictEqual(prepared.envByCli.codex.HOME, prepared.homeDir);
  assert.strictEqual(h.envForCli('claude', { HOME: real }, { byCli: prepared.envByCli, default: prepared.env }).HOME, real);
  assert.strictEqual(h.envForCli('codex', { HOME: real }, { byCli: prepared.envByCli, default: prepared.env }).HOME, prepared.homeDir);
  assert.ok(fs.existsSync(path.join(prepared.env.CODEX_HOME, 'auth.json')));
  assert.ok(fs.existsSync(path.join(prepared.env.CODEX_HOME, 'config.toml')));
  assert.ok(!fs.existsSync(path.join(prepared.env.CODEX_HOME, 'state_5.sqlite')), 'volatile sqlite state is not copied');
  assert.ok(fs.existsSync(path.join(prepared.env.HOME, '.claude.json')));
  assert.ok(fs.existsSync(path.join(prepared.env.HOME, '.claude', 'settings.json')));
  assert.ok(fs.existsSync(path.join(prepared.env.HOME, '.gemini', 'oauth_creds.json')));
  assert.ok(fs.existsSync(path.join(prepared.env.XDG_CONFIG_HOME, 'opencode', 'opencode.jsonc')));
  assert.ok(fs.existsSync(path.join(prepared.env.XDG_DATA_HOME, 'opencode', 'account.json')));
  assert.ok(fs.existsSync(path.join(prepared.env.XDG_DATA_HOME, 'opencode', 'auth.json')));
  prepared.cleanup();
  assert.ok(!fs.existsSync(prepared.homeDir), 'cleanup removes scratch home');
  fs.rmSync(real, { recursive: true, force: true });
  fs.rmSync(tmp, { recursive: true, force: true });
});

check('mode real returns no env override', () => {
  const prepared = h.prepareModelCliHome({ mode: 'real' });
  assert.strictEqual(prepared.active, false);
  assert.deepStrictEqual(prepared.env, {});
});

console.log(`\nResults: ${passed} passed, 0 failed`);
