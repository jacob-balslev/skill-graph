'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { runPanelPreflight, modelCliStateDir } = require('../../lib/audit/panel-preflight');

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log(`  PASS    ${name}`);
}

function fakeSpawn(okCommands) {
  return (cmd, args = []) => {
    const target = cmd === 'which' ? args[0] : cmd;
    return {
      status: okCommands.includes(target) ? 0 : 1,
      stdout: okCommands.includes(target) ? `/bin/${target}\n` : '',
    };
  };
}

console.log('1. panel preflight');
check('passes with mandatory CLIs, writable scratch state, and public workspace fallback', () => {
  const ws = fs.mkdtempSync(path.join(os.tmpdir(), 'preflight-ws-'));
  const sg = path.join(ws, 'skill-graph');
  const skillsRoot = path.join(ws, 'skills');
  const skillDir = path.join(skillsRoot, 'skills', 'quality-assurance', 'a11y');
  const home = path.join(ws, 'home');
  fs.mkdirSync(skillDir, { recursive: true });
  fs.mkdirSync(path.join(home, '.codex'), { recursive: true });
  fs.mkdirSync(path.join(home, '.claude'), { recursive: true });
  fs.mkdirSync(sg, { recursive: true });
  const result = runPanelPreflight({
    skillGraphRoot: sg,
    workspaceRoot: ws,
    skillDir,
    mandatoryModels: ['opus', 'codex-current'],
    advisoryModels: [],
    env: { HOME: home, CODEX_HOME: path.join(home, '.codex') },
    osFenceSupported: false,
    publicWorkspace: { active: true, root: path.join(ws, 'public') },
    spawn: fakeSpawn(['claude', 'codex']),
  });
  assert.strictEqual(result.ok, true);
  assert.ok(result.warnings.some((w) => /public workspace fallback/.test(w)));
  fs.rmSync(ws, { recursive: true, force: true });
});

check('fails when mandatory CLI is missing or state dir is not writable', () => {
  const ws = fs.mkdtempSync(path.join(os.tmpdir(), 'preflight-fail-'));
  const sg = path.join(ws, 'skill-graph');
  const skillDir = path.join(ws, 'skills', 'skills', 'quality-assurance', 'a11y');
  const home = path.join(ws, 'home');
  fs.mkdirSync(skillDir, { recursive: true });
  fs.mkdirSync(sg, { recursive: true });
  fs.mkdirSync(home, { recursive: true });
  const blockedParent = path.join(home, 'blocked');
  fs.writeFileSync(blockedParent, 'not a directory');
  const result = runPanelPreflight({
    skillGraphRoot: sg,
    workspaceRoot: ws,
    skillDir,
    mandatoryModels: ['opus', 'codex-current'],
    env: { HOME: blockedParent, CODEX_HOME: path.join(blockedParent, '.codex') },
    osFenceSupported: false,
    publicWorkspace: { active: false },
    spawn: fakeSpawn(['claude']),
  });
  assert.strictEqual(result.ok, false);
  assert.ok(result.errors.some((e) => /codex CLI not found/.test(e)));
  assert.ok(result.errors.some((e) => /codex state dir is not writable/.test(e)));
  assert.ok(result.errors.some((e) => /OS public-content fence unavailable/.test(e)));
  fs.rmSync(ws, { recursive: true, force: true });
});

check('modelCliStateDir resolves codex home and XDG opencode data', () => {
  const env = { HOME: '/h', CODEX_HOME: '/tmp/codex', XDG_DATA_HOME: '/tmp/data' };
  assert.strictEqual(modelCliStateDir('codex', env), '/tmp/codex');
  assert.strictEqual(modelCliStateDir('claude', env), '/h/.claude');
  assert.strictEqual(modelCliStateDir('opencode', env), '/tmp/data/opencode');
});

console.log(`\nResults: ${passed} passed, 0 failed`);
