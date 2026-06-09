'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const { exhaustedLockPath } = require('./panel-budget');
const { canWriteDir } = require('./model-cli-home');
const { isWithinPublicScope, defaultPublicRoots } = require('./public-content-fence');
const { cliForModel } = require('./skill-audit-loop-lite-deps');

function commandExists(cli, spawn = spawnSync) {
  try {
    const r = spawn('which', [cli], { encoding: 'utf8', timeout: 5000 });
    return { ok: r.status === 0 && Boolean(String(r.stdout || '').trim()), path: String(r.stdout || '').trim() || null };
  } catch (e) {
    return { ok: false, path: null, error: e.message };
  }
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function modelCliStateDir(cli, env) {
  const home = env.HOME || process.env.HOME || '';
  if (cli === 'codex') return env.CODEX_HOME || path.join(home, '.codex');
  if (cli === 'claude') return path.join(home, '.claude');
  if (cli === 'gemini') return path.join(home, '.gemini');
  if (cli === 'opencode') return env.XDG_DATA_HOME ? path.join(env.XDG_DATA_HOME, 'opencode') : path.join(home, '.local', 'share', 'opencode');
  return home;
}

function runPanelPreflight(options = {}) {
  const skillGraphRoot = path.resolve(options.skillGraphRoot || process.cwd());
  const workspaceRoot = path.resolve(options.workspaceRoot || path.join(skillGraphRoot, '..'));
  const skillDir = options.skillDir ? path.resolve(options.skillDir) : null;
  const mandatoryModels = Array.isArray(options.mandatoryModels) ? options.mandatoryModels : [];
  const advisoryModels = Array.isArray(options.advisoryModels) ? options.advisoryModels : [];
  const env = { ...process.env, ...(options.env || {}) };
  const spawn = options.spawn || spawnSync;
  const fsImpl = options.fsImpl || fs;

  const errors = [];
  const warnings = [];
  const info = [];

  const mandatoryClis = unique(mandatoryModels.map(cliForModel));
  const advisoryClis = unique(advisoryModels.map(cliForModel));
  const allClis = unique([...mandatoryClis, ...advisoryClis]);

  for (const cli of allClis) {
    const found = commandExists(cli, spawn);
    const tier = mandatoryClis.includes(cli) ? 'mandatory' : 'advisory';
    if (!found.ok) {
      const msg = `${cli} CLI not found on PATH`;
      if (tier === 'mandatory') errors.push(msg);
      else warnings.push(msg);
    } else {
      info.push(`${cli} CLI: ${found.path}`);
    }
  }

  for (const cli of mandatoryClis) {
    const dir = modelCliStateDir(cli, env);
    if (!canWriteDir(dir, fsImpl)) {
      errors.push(`${cli} state dir is not writable: ${dir}`);
    } else {
      info.push(`${cli} state dir writable: ${dir}`);
    }
  }

  for (const cli of advisoryClis.filter((c) => !mandatoryClis.includes(c))) {
    const dir = modelCliStateDir(cli, env);
    if (!canWriteDir(dir, fsImpl)) warnings.push(`${cli} advisory state dir is not writable: ${dir}`);
  }

  for (const model of mandatoryModels) {
    const lock = exhaustedLockPath(model, options.budgetDir);
    if (fsImpl.existsSync(lock)) errors.push(`${model} budget lock is present: ${lock}`);
  }
  for (const model of advisoryModels) {
    const lock = exhaustedLockPath(model, options.budgetDir);
    if (fsImpl.existsSync(lock)) warnings.push(`${model} advisory budget lock is present: ${lock}`);
  }

  const roots = defaultPublicRoots({ skillGraphRoot, workspaceRoot, skillsRoot: options.skillsRoot });
  if (skillDir && !isWithinPublicScope(skillDir, { roots })) {
    errors.push(`skillDir is outside the public Skill Graph scope: ${skillDir}`);
  }

  const osFenceSupported = Boolean(options.osFenceSupported);
  const publicWorkspaceActive = Boolean(options.publicWorkspace && options.publicWorkspace.active);
  if (osFenceSupported) {
    info.push('OS public-content fence available');
  } else if (publicWorkspaceActive) {
    warnings.push(`OS public-content fence unavailable; using public workspace fallback at ${options.publicWorkspace.root}`);
  } else {
    errors.push('OS public-content fence unavailable and no public workspace fallback is active');
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    info,
    mandatory_clis: mandatoryClis,
    advisory_clis: advisoryClis,
    os_fence_supported: osFenceSupported,
    public_workspace_active: publicWorkspaceActive,
  };
}

module.exports = {
  commandExists,
  modelCliStateDir,
  runPanelPreflight,
};
