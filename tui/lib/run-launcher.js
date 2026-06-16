'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const runLayout = require('../../lib/audit/run-layout');
const roots = require('../../scripts/lib/roots');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const DEFAULT_AUDIT_ROOT = path.join(REPO_ROOT, 'skill-audit-loop', 'progress', 'skill-audits');
const DEFAULT_RUNNER = path.join(REPO_ROOT, 'lib', 'audit', 'run-skill-audit-loop.js');
const HEARTBEAT_FILE = 'status.json';

const OWNED_VALUE_ARGS = new Set([
  '--skill',
  '--skill-dir',
  '--cwd',
  '--status-file',
]);
const OWNED_FLAG_ARGS = new Set([
  '--no-tui',
]);

function requireText(value, field) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) throw new Error(`run-launcher: ${field} is required`);
  return text;
}

function repoRootFrom(opts = {}) {
  return path.resolve(opts.repoRoot || REPO_ROOT);
}

function auditRootFrom(opts = {}) {
  return path.resolve(opts.auditRoot || DEFAULT_AUDIT_ROOT);
}

function resolveSkillDir({ skill, skillDir, repoRoot = REPO_ROOT, workspaceRoot } = {}) {
  if (skillDir) {
    const resolved = path.resolve(skillDir);
    const skillFile = path.join(resolved, 'SKILL.md');
    if (!fs.existsSync(skillFile)) {
      throw new Error(`run-launcher: skillDir does not contain SKILL.md: ${resolved}`);
    }
    return resolved;
  }

  const workspace = path.resolve(workspaceRoot || repoRoot);
  const resolved = roots.resolveSkillDirSpecifier(skill, workspace, roots.loadRootsConfig(workspace));
  if (!resolved || !resolved.skillDir) {
    throw new Error(`run-launcher: cannot resolve skill directory for ${JSON.stringify(skill)}`);
  }
  return resolved.skillDir;
}

function normalizeExtraArgs(extraArgs = []) {
  if (!Array.isArray(extraArgs)) throw new Error('run-launcher: extraArgs must be an array');
  const out = [];
  for (let i = 0; i < extraArgs.length; i += 1) {
    const arg = String(extraArgs[i]);
    const argName = arg.includes('=') ? arg.slice(0, arg.indexOf('=')) : arg;
    if (OWNED_VALUE_ARGS.has(argName) || OWNED_FLAG_ARGS.has(argName)) {
      throw new Error(`run-launcher: ${arg} is owned by the launcher and cannot be passed via extraArgs`);
    }
    out.push(arg);
  }
  return out;
}

function runnerCommand(launcherPath = DEFAULT_RUNNER) {
  const resolved = path.resolve(launcherPath);
  if (/\.[cm]?js$/i.test(resolved)) {
    return { command: process.execPath, prefixArgs: [resolved] };
  }
  return { command: resolved, prefixArgs: [] };
}

function buildRunRef(launch, opts = {}) {
  const ref = {
    runId: launch.runId,
    skill: launch.skill,
    runDir: launch.runDir,
    heartbeatPath: launch.heartbeatPath,
  };
  if (opts.role || launch.role) ref.role = opts.role || launch.role;
  if (opts.ledgerRef) ref.ledgerRef = opts.ledgerRef;
  if (opts.reviewPath) ref.reviewPath = opts.reviewPath;
  return ref;
}

function launchRun(opts = {}) {
  const skill = requireText(opts.skill, 'skill');
  const op = runLayout.sanitizeOp(opts.op || 'audit');
  const repoRoot = repoRootFrom(opts);
  const auditRoot = auditRootFrom(opts);
  const workspaceRoot = path.resolve(opts.workspaceRoot || repoRoot);
  const skillDir = resolveSkillDir({ skill, skillDir: opts.skillDir, repoRoot, workspaceRoot });
  const id = opts.runId || runLayout.runId();
  const model = opts.model || 'panel';
  const runDir = runLayout.runDir(auditRoot, skill, {
    op,
    model,
    id,
    date: opts.date,
  });
  const heartbeatPath = path.join(runDir, HEARTBEAT_FILE);
  const extraArgs = normalizeExtraArgs(opts.extraArgs || []);
  const { command, prefixArgs } = runnerCommand(opts.launcherPath || DEFAULT_RUNNER);
  const args = [
    ...prefixArgs,
    '--skill', skill,
    '--skill-dir', skillDir,
    '--cwd', repoRoot,
    '--status-file', heartbeatPath,
    '--no-tui',
    ...extraArgs,
  ];
  const auditSession = opts.sessionId
    || opts.auditSession
    || (opts.env && opts.env.SKILL_AUDIT_SESSION)
    || process.env.SKILL_AUDIT_SESSION
    || `tui-${id}`;
  const env = {
    ...process.env,
    ...(opts.env || {}),
    SKILL_AUDIT_SESSION: auditSession,
  };
  const spawnOptions = {
    cwd: repoRoot,
    env,
    detached: true,
    stdio: ['ignore', 'ignore', 'ignore'],
    windowsHide: true,
  };
  const spawnImpl = opts.spawnImpl || spawn;
  const child = spawnImpl(command, args, spawnOptions);

  const launch = {
    child,
    command,
    args,
    spawnOptions,
    skill,
    skillDir,
    op,
    auditRoot,
    runDir,
    runId: id,
    heartbeatPath,
    pid: child.pid,
    auditSession,
    role: opts.role || 'primary',
    detach() {
      if (child && typeof child.unref === 'function') child.unref();
      return launch;
    },
    stop(signal = 'SIGTERM') {
      if (!child || !child.pid) return false;
      try {
        if (process.platform === 'win32') child.kill(signal);
        else process.kill(-child.pid, signal);
        return true;
      } catch (err) {
        if (err && err.code === 'ESRCH') return false;
        throw err;
      }
    },
    runRef(extra = {}) {
      return buildRunRef(launch, extra);
    },
  };
  return launch;
}

module.exports = {
  DEFAULT_AUDIT_ROOT,
  DEFAULT_RUNNER,
  HEARTBEAT_FILE,
  buildRunRef,
  launchRun,
  resolveSkillDir,
};
