'use strict';

// Writable model-CLI home for restricted harnesses.
//
// Codex desktop can run a subprocess with read access to the user's real home but
// without write access to ~/.codex / ~/.claude. The model CLIs need small state writes
// even for non-interactive calls. This module creates a temporary HOME with selected
// auth/config files copied from the real home, leaving volatile databases, histories,
// logs, sessions, and caches behind. The temp tree is mode 0700 and is removed by the
// caller at process exit.

const fs = require('fs');
const os = require('os');
const path = require('path');

let writeProbeCounter = 0;

const CODEX_FILES = [
  'auth.json',
  'config.toml',
  'installation_id',
  'version.json',
  'models_cache.json',
  '.codex-global-state.json',
];

const CLAUDE_FILES = [
  'settings.json',
  '.env.keys',
  'mcp-needs-auth-cache.json',
  'stats-cache.json',
];

const GEMINI_FILES = [
  'google_accounts.json',
  'oauth_creds.json',
  'settings.json',
  'installation_id',
  'state.json',
  'projects.json',
  'trustedFolders.json',
  'config',
  'acknowledgments',
];

const OPENCODE_CONFIG_FILES = [
  'opencode.json',
  'opencode.jsonc',
  'package.json',
  'package-lock.json',
];

const OPENCODE_DATA_FILES = [
  'account.json',
];

function mkdirSecure(dir, fsImpl = fs) {
  fsImpl.mkdirSync(dir, { recursive: true, mode: 0o700 });
  try { fsImpl.chmodSync(dir, 0o700); } catch (_) { /* best-effort on filesystems without chmod */ }
}

function canWriteDir(dir, fsImpl = fs) {
  try {
    mkdirSecure(dir, fsImpl);
    const probe = path.join(dir, `.skill-audit-write-test-${process.pid}-${writeProbeCounter += 1}`);
    fsImpl.writeFileSync(probe, 'ok', { mode: 0o600 });
    fsImpl.rmSync(probe, { force: true });
    return true;
  } catch (_) {
    return false;
  }
}

function copyPathIfPresent(src, dest, fsImpl = fs) {
  if (!fsImpl.existsSync(src)) return false;
  mkdirSecure(path.dirname(dest), fsImpl);
  const st = fsImpl.statSync(src);
  if (st.isDirectory()) {
    fsImpl.cpSync(src, dest, {
      recursive: true,
      filter: (p) => {
        const base = path.basename(p);
        if (base === 'node_modules') return false;
        if (base.endsWith('.sqlite') || base.endsWith('.sqlite-wal') || base.endsWith('.sqlite-shm')) return false;
        if (['history', 'sessions', 'tmp', 'cache', 'logs', 'log', 'archived_sessions', 'tool-output', 'snapshot'].includes(base)) return false;
        return true;
      },
    });
    return true;
  }
  fsImpl.copyFileSync(src, dest);
  try { fsImpl.chmodSync(dest, st.mode & 0o777); } catch (_) { /* best-effort */ }
  return true;
}

function copyListedFiles({ srcDir, destDir, entries, fsImpl = fs }) {
  const copied = [];
  for (const name of entries) {
    const src = path.join(srcDir, name);
    const dest = path.join(destDir, name);
    try {
      if (copyPathIfPresent(src, dest, fsImpl)) copied.push(name);
    } catch (_) {
      // A single unreadable optional file must not prevent the scratch home from working.
    }
  }
  return copied;
}

function realHomeWritableSummary(realHome = os.homedir(), fsImpl = fs) {
  const checks = {
    codex: canWriteDir(path.join(realHome, '.codex'), fsImpl),
    claude: canWriteDir(path.join(realHome, '.claude'), fsImpl),
    gemini: canWriteDir(path.join(realHome, '.gemini'), fsImpl),
    xdgConfig: canWriteDir(path.join(realHome, '.config'), fsImpl),
    xdgData: canWriteDir(path.join(realHome, '.local', 'share'), fsImpl),
  };
  return checks;
}

function prepareModelCliHome(options = {}) {
  const fsImpl = options.fsImpl || fs;
  const realHome = path.resolve(options.realHome || os.homedir());
  const mode = options.mode || 'auto'; // auto | scratch | real
  if (!['auto', 'scratch', 'real'].includes(mode)) {
    throw new Error(`prepareModelCliHome: mode must be auto, scratch, or real; got ${JSON.stringify(mode)}`);
  }

  const realWritable = realHomeWritableSummary(realHome, fsImpl);
  const needsScratch = mode === 'scratch'
    || (mode === 'auto' && (!realWritable.codex || !realWritable.claude));

  if (!needsScratch) {
    return {
      active: false,
      mode: 'real',
      env: {},
      homeDir: realHome,
      realWritable,
      copied: {},
      cleanup: () => {},
    };
  }

  const tmpBase = options.tmpDir || os.tmpdir();
  const root = fsImpl.mkdtempSync(path.join(tmpBase, 'skill-audit-cli-home-'));
  mkdirSecure(root, fsImpl);

  const env = {
    HOME: root,
    CODEX_HOME: path.join(root, '.codex'),
    XDG_CONFIG_HOME: path.join(root, '.config'),
    XDG_CACHE_HOME: path.join(root, '.cache'),
    XDG_DATA_HOME: path.join(root, '.local', 'share'),
    XDG_STATE_HOME: path.join(root, '.local', 'state'),
    SKILL_AUDIT_MODEL_CLI_HOME: root,
  };

  for (const dir of [
    env.CODEX_HOME,
    path.join(root, '.claude'),
    path.join(root, '.gemini'),
    env.XDG_CONFIG_HOME,
    env.XDG_CACHE_HOME,
    env.XDG_DATA_HOME,
    env.XDG_STATE_HOME,
  ]) mkdirSecure(dir, fsImpl);

  const copied = {
    codex: copyListedFiles({ srcDir: path.join(realHome, '.codex'), destDir: env.CODEX_HOME, entries: CODEX_FILES, fsImpl }),
    claude: copyListedFiles({ srcDir: path.join(realHome, '.claude'), destDir: path.join(root, '.claude'), entries: CLAUDE_FILES, fsImpl }),
    gemini: copyListedFiles({ srcDir: path.join(realHome, '.gemini'), destDir: path.join(root, '.gemini'), entries: GEMINI_FILES, fsImpl }),
    opencodeConfig: copyListedFiles({ srcDir: path.join(realHome, '.config', 'opencode'), destDir: path.join(env.XDG_CONFIG_HOME, 'opencode'), entries: OPENCODE_CONFIG_FILES, fsImpl }),
    opencodeData: copyListedFiles({ srcDir: path.join(realHome, '.local', 'share', 'opencode'), destDir: path.join(env.XDG_DATA_HOME, 'opencode'), entries: OPENCODE_DATA_FILES, fsImpl }),
  };

  return {
    active: true,
    mode: 'scratch',
    env,
    homeDir: root,
    realHome,
    realWritable,
    copied,
    cleanup: () => {
      try { fsImpl.rmSync(root, { recursive: true, force: true }); } catch (_) { /* best-effort */ }
    },
  };
}

function mergeModelEnv(baseEnv = process.env, modelEnv = {}) {
  return { ...baseEnv, ...(modelEnv || {}) };
}

module.exports = {
  CODEX_FILES,
  CLAUDE_FILES,
  GEMINI_FILES,
  OPENCODE_CONFIG_FILES,
  OPENCODE_DATA_FILES,
  canWriteDir,
  realHomeWritableSummary,
  prepareModelCliHome,
  mergeModelEnv,
};
