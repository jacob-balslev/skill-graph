'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const { exhaustedLockPath } = require('./panel-budget');
const { canWriteDir } = require('./model-cli-home');
const { isWithinPublicScope, defaultPublicRoots } = require('./public-content-fence');
const { cliForModel } = require('./skill-audit-loop-lite-deps');
const { AUTH_HINT } = require('./advisory-preflight');

function commandExists(cli, spawn = spawnSync) {
  try {
    const r = spawn('which', [cli], { encoding: 'utf8', timeout: 5000 });
    return { ok: r.status === 0 && Boolean(String(r.stdout || '').trim()), path: String(r.stdout || '').trim() || null };
  } catch (e) {
    return { ok: false, path: null, error: e.message };
  }
}

// SKI-376: optional cheap AUTHENTICATED no-op probe per CLI (opt-in via runPanelPreflight
// `authProbe`). It catches a logged-out / expired child CLI BEFORE any paid dispatch — the
// preflight `which` check above only proves the BINARY is on PATH, not that it is logged in.
// Each command is NON-INTERACTIVE (a logged-out CLI exits non-zero or is killed by the
// spawnSync timeout — it never opens an interactive auth prompt) and reuses the loop's verified
// dispatch flags (see skill-audit-loop-lite-deps build*EnrichArgs). opencode uses its pure
// `auth list` (no model call); the model-backed CLIs make one trivial print-mode call.
const AUTH_PROBE_ARGS = {
  claude: ['-p', 'reply with the single word: ok', '--output-format', 'text', '--no-session-persistence'],
  codex: ['exec', '--skip-git-repo-check', '--dangerously-bypass-approvals-and-sandbox', 'reply with the single word: ok'],
  gemini: ['--yolo', '-p', 'reply with the single word: ok'],
  opencode: ['auth', 'list'],
};

/**
 * Cheap authenticated no-op probe for one CLI. Never interactive (a timeout/non-zero exit is
 * treated as "not authenticated"). Returns { ok: true|false|null, detail }, where ok===null
 * means no probe is defined for that CLI.
 */
function authProbe(cli, { env = process.env, spawn = spawnSync, timeoutMs = 30000 } = {}) {
  const args = AUTH_PROBE_ARGS[cli];
  if (!args) return { ok: null, detail: 'no auth probe defined for this CLI' };
  let r;
  try {
    r = spawn(cli, args, { env, encoding: 'utf8', timeout: timeoutMs, stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    return { ok: false, detail: e.message };
  }
  if (r.error) {
    const code = r.error.code;
    return { ok: false, detail: code === 'ETIMEDOUT' ? `timed out after ${timeoutMs}ms (possible interactive auth prompt)` : `${code || ''} ${r.error.message}`.trim() };
  }
  if (r.signal) return { ok: false, detail: `killed by ${r.signal} (timeout ${timeoutMs}ms — possible auth prompt)` };
  if (cli === 'opencode') {
    // Pure auth-list probe (no model call): exit 0 AND at least one credential present.
    if (r.status !== 0) return { ok: false, detail: `exit ${r.status}` };
    const m = String(r.stdout || '').match(/(\d+)\s+credential/i);
    const count = m ? Number(m[1]) : null;
    if (count === 0) return { ok: false, detail: 'auth list shows 0 credentials (logged out)' };
    return { ok: true, detail: count != null ? `${count} credential(s)` : 'auth list ok' };
  }
  if (r.status !== 0) return { ok: false, detail: `exit ${r.status}: ${String(r.stderr || '').trim().slice(0, 200)}` };
  return { ok: true, detail: null };
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

  // SKI-376: optional per-CLI authenticated no-op probe (opt-in; off by default so --preflight-only
  // stays cheap). A logged-out MANDATORY CLI is an error (aborts before paid dispatch); a logged-out
  // ADVISORY CLI is a warning (the panel still runs, minus that free advisor). Per-CLI result is
  // surfaced in `auth` so the operator sees exactly which model to re-authenticate — never re-auths
  // interactively here.
  let auth;
  if (options.authProbe) {
    auth = {};
    const timeoutMs = Number(options.authProbeTimeoutMs) > 0 ? Number(options.authProbeTimeoutMs) : 30000;
    for (const cli of allClis) {
      const tier = mandatoryClis.includes(cli) ? 'mandatory' : 'advisory';
      const res = authProbe(cli, { env, spawn, timeoutMs });
      const hint = res.ok === false ? (AUTH_HINT[cli] || `authenticate the ${cli} CLI`) : null;
      auth[cli] = { tier, ok: res.ok, detail: res.detail || null, hint };
      if (res.ok === false) {
        const msg = `${cli} CLI auth probe FAILED — ${AUTH_HINT[cli] || `authenticate the ${cli} CLI`}${res.detail ? ` [${res.detail}]` : ''}`;
        if (tier === 'mandatory') errors.push(msg);
        else warnings.push(msg);
      }
    }
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
    ...(auth ? { auth } : {}),
  };
}

module.exports = {
  commandExists,
  modelCliStateDir,
  runPanelPreflight,
  authProbe,
  AUTH_PROBE_ARGS,
};
