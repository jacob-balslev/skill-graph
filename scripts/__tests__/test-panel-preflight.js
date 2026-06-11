'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { runPanelPreflight, modelCliStateDir, authProbe } = require('../../lib/audit/panel-preflight');

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
    mandatoryModels: ['opus', 'gpt-5.5'],
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
    mandatoryModels: ['opus', 'gpt-5.5'],
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

check('advisory CLI list uses registry backends instead of falling through to claude', () => {
  const ws = fs.mkdtempSync(path.join(os.tmpdir(), 'preflight-advisory-'));
  const sg = path.join(ws, 'skill-graph');
  const skillDir = path.join(ws, 'skills', 'skills', 'quality-assurance', 'a11y');
  const home = path.join(ws, 'home');
  fs.mkdirSync(skillDir, { recursive: true });
  fs.mkdirSync(sg, { recursive: true });
  fs.mkdirSync(path.join(home, '.codex'), { recursive: true });
  fs.mkdirSync(path.join(home, '.claude'), { recursive: true });
  fs.mkdirSync(path.join(home, '.gemini'), { recursive: true });
  fs.mkdirSync(path.join(home, '.local', 'share', 'opencode'), { recursive: true });
  const result = runPanelPreflight({
    skillGraphRoot: sg,
    workspaceRoot: ws,
    skillDir,
    mandatoryModels: ['opus', 'gpt-5.5'],
    advisoryModels: ['minimax', 'gemini'],
    env: { HOME: home, CODEX_HOME: path.join(home, '.codex') },
    osFenceSupported: true,
    publicWorkspace: { active: false },
    spawn: fakeSpawn(['claude', 'codex', 'opencode', 'gemini']),
  });
  assert.strictEqual(result.ok, true);
  assert.deepStrictEqual(result.advisory_clis.sort(), ['gemini', 'opencode']);
  fs.rmSync(ws, { recursive: true, force: true });
});

console.log('2. authenticated no-op probe (SKI-376)');
check('authProbe classifies authed/logged-out/timeout/0-credentials per CLI', () => {
  const spawn = (cli) => {
    if (cli === 'claude') return { status: 0, stdout: 'ok', stderr: '' };
    if (cli === 'gemini') return { status: 1, stdout: '', stderr: 'not authenticated' };
    if (cli === 'opencode') return { status: 0, stdout: '└  3 credentials\n', stderr: '' };
    if (cli === 'codex') return { error: { code: 'ETIMEDOUT', message: 'timed out' } };
    return { status: 0, stdout: '' };
  };
  assert.deepStrictEqual(authProbe('claude', { spawn }), { ok: true, detail: null });
  assert.strictEqual(authProbe('gemini', { spawn }).ok, false);
  assert.strictEqual(authProbe('opencode', { spawn }).ok, true);
  assert.strictEqual(authProbe('codex', { spawn }).ok, false);
  // opencode with 0 credentials = logged out
  assert.strictEqual(authProbe('opencode', { spawn: () => ({ status: 0, stdout: '└  0 credentials' }) }).ok, false);
  // no probe defined => ok:null
  assert.strictEqual(authProbe('unknown-cli', { spawn }).ok, null);
});

check('runPanelPreflight authProbe gates mandatory (error) vs advisory (warning)', () => {
  const ws = fs.mkdtempSync(path.join(os.tmpdir(), 'preflight-auth-'));
  const sg = path.join(ws, 'skill-graph');
  const skillDir = path.join(ws, 'skills', 'skills', 'quality-assurance', 'a11y');
  const home = path.join(ws, 'home');
  fs.mkdirSync(skillDir, { recursive: true });
  fs.mkdirSync(sg, { recursive: true });
  fs.mkdirSync(path.join(home, '.codex'), { recursive: true });
  fs.mkdirSync(path.join(home, '.claude'), { recursive: true });
  fs.mkdirSync(path.join(home, '.gemini'), { recursive: true });
  fs.mkdirSync(path.join(home, '.local', 'share', 'opencode'), { recursive: true });
  // which: all present. auth probe: codex (mandatory) logged out -> error; gemini (advisory) ok.
  const spawn = (cmd, args = []) => {
    if (cmd === 'which') return { status: 0, stdout: `/bin/${args[0]}\n` };
    if (cmd === 'codex') return { status: 1, stdout: '', stderr: 'please login' };
    if (cmd === 'opencode') return { status: 0, stdout: '└  2 credentials' };
    return { status: 0, stdout: 'ok' };
  };
  const result = runPanelPreflight({
    skillGraphRoot: sg,
    workspaceRoot: ws,
    skillDir,
    mandatoryModels: ['opus', 'gpt-5.5'],
    advisoryModels: ['gemini'],
    env: { HOME: home, CODEX_HOME: path.join(home, '.codex') },
    osFenceSupported: true,
    publicWorkspace: { active: false },
    spawn,
    authProbe: true,
  });
  assert.strictEqual(result.ok, false, 'mandatory codex auth failure fails preflight');
  assert.strictEqual(result.auth.codex.ok, false);
  assert.strictEqual(result.auth.codex.tier, 'mandatory');
  assert.ok(result.auth.codex.hint, 'failed probe carries a re-auth hint');
  assert.strictEqual(result.auth.claude.ok, true);
  assert.ok(result.errors.some((e) => /codex CLI auth probe FAILED/.test(e)));
  // a default run (no authProbe) carries no auth block
  const noProbe = runPanelPreflight({
    skillGraphRoot: sg, workspaceRoot: ws, skillDir,
    mandatoryModels: ['opus'], advisoryModels: [],
    env: { HOME: home }, osFenceSupported: true, publicWorkspace: { active: false },
    spawn: fakeSpawn(['claude']),
  });
  assert.strictEqual(noProbe.auth, undefined, 'no auth block when authProbe is off');
  fs.rmSync(ws, { recursive: true, force: true });
});

check('scratch CLI home auth failures are labeled as bridge failures, not real logout', () => {
  const ws = fs.mkdtempSync(path.join(os.tmpdir(), 'preflight-scratch-auth-'));
  const sg = path.join(ws, 'skill-graph');
  const skillDir = path.join(ws, 'skills', 'skills', 'quality-assurance', 'a11y');
  const scratchHome = path.join(ws, 'scratch-home');
  fs.mkdirSync(skillDir, { recursive: true });
  fs.mkdirSync(sg, { recursive: true });
  fs.mkdirSync(path.join(scratchHome, '.claude'), { recursive: true });
  fs.mkdirSync(path.join(scratchHome, '.codex'), { recursive: true });
  const spawn = (cmd, args = []) => {
    if (cmd === 'which') return { status: 0, stdout: `/bin/${args[0]}\n` };
    if (cmd === 'claude') return { status: 1, stdout: '', stderr: '' };
    if (cmd === 'codex') return { status: 0, stdout: 'ok', stderr: '' };
    return { status: 0, stdout: '' };
  };
  const result = runPanelPreflight({
    skillGraphRoot: sg,
    workspaceRoot: ws,
    skillDir,
    mandatoryModels: ['opus', 'gpt-5.5'],
    advisoryModels: [],
    env: { HOME: scratchHome, CODEX_HOME: path.join(scratchHome, '.codex') },
    modelCliHome: { active: true, mode: 'scratch', homeDir: scratchHome },
    osFenceSupported: true,
    publicWorkspace: { active: false },
    spawn,
    authProbe: true,
  });
  assert.strictEqual(result.ok, false);
  assert.strictEqual(result.auth.claude.scratch_bridge, true);
  assert.ok(/scratch CLI home/.test(result.auth.claude.hint));
  assert.ok(result.errors.some((e) => /scratch CLI home/.test(e) && /does NOT prove the real claude CLI is logged out/.test(e)));
  assert.ok(!result.errors.some((e) => /run `claude` once/.test(e)));
  fs.rmSync(ws, { recursive: true, force: true });
});

check('scratch mode can use real HOME for Claude and scratch HOME for other CLIs', () => {
  const ws = fs.mkdtempSync(path.join(os.tmpdir(), 'preflight-per-cli-env-'));
  const sg = path.join(ws, 'skill-graph');
  const skillDir = path.join(ws, 'skills', 'skills', 'quality-assurance', 'a11y');
  const realHome = path.join(ws, 'real-home');
  const scratchHome = path.join(ws, 'scratch-home');
  const scratchEnv = {
    HOME: scratchHome,
    CODEX_HOME: path.join(scratchHome, '.codex'),
    XDG_DATA_HOME: path.join(scratchHome, '.local', 'share'),
  };
  fs.mkdirSync(skillDir, { recursive: true });
  fs.mkdirSync(sg, { recursive: true });
  fs.mkdirSync(path.join(realHome, '.claude'), { recursive: true });
  fs.mkdirSync(scratchEnv.CODEX_HOME, { recursive: true });
  const seen = [];
  const spawn = (cmd, args = [], opts = {}) => {
    if (cmd === 'which') return { status: 0, stdout: `/bin/${args[0]}\n` };
    if (cmd === 'claude' || cmd === 'codex') seen.push({ cmd, home: opts.env && opts.env.HOME, codexHome: opts.env && opts.env.CODEX_HOME });
    return { status: 0, stdout: cmd === 'claude' || cmd === 'codex' ? 'ok' : '' };
  };
  const result = runPanelPreflight({
    skillGraphRoot: sg,
    workspaceRoot: ws,
    skillDir,
    mandatoryModels: ['opus', 'gpt-5.5'],
    advisoryModels: [],
    env: scratchEnv,
    envByCli: { claude: {}, codex: scratchEnv },
    modelCliHome: { active: true, mode: 'scratch', homeDir: scratchHome },
    osFenceSupported: true,
    publicWorkspace: { active: false },
    spawn,
    authProbe: true,
  });
  assert.strictEqual(result.ok, true);
  assert.strictEqual(seen.find((x) => x.cmd === 'claude').home, process.env.HOME);
  assert.strictEqual(seen.find((x) => x.cmd === 'codex').home, scratchHome);
  assert.strictEqual(seen.find((x) => x.cmd === 'codex').codexHome, scratchEnv.CODEX_HOME);
  fs.rmSync(ws, { recursive: true, force: true });
});

console.log(`\nResults: ${passed} passed, 0 failed`);
