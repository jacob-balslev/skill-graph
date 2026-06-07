'use strict';

// ─── The FULL OS fence for enrich/eval CLI dispatch (SH-6681) ─────────────────
//
// The in-process guard (lib/audit/public-content-fence.js — the SH-6681 "down
// payment") refuses any PATH the orchestrator resolves outside the public scope. It
// cannot stop the model PROCESS the CLI spawns from reading a private workspace tree
// by absolute path: `claude --permission-mode bypassPermissions` runs with NO sandbox
// at all, and `codex exec -s workspace-write` restricts WRITES, not reads. A tools-ON
// agent could therefore `cat ../sales-hub/.env` or read an absolute private path. That
// is the gap GPT-5.5 review finding F5 named and the tracked remainder of SH-6681.
//
// THIS module closes it with a kernel-enforced read/write fence around the spawned
// CLI. On macOS it generates a Seatbelt (sandbox-exec) profile that is the POLICY
// equivalent of an isolated checkout: from the spawned process's view the workspace
// contains ONLY the public roots (skill-graph repo + skills tree + the audit-artifacts
// run dir). Every other path under the workspace — sales-hub, printify, shopify, any
// private sibling, `<ws>/.claude`, `<ws>/scripts` — is DENIED for both read and write
// (EPERM), even by absolute path. System paths, the CLI's own install + config
// (~/.claude, ~/.codex), node, tmp, and network stay reachable via `(allow default)`
// so the CLI runs normally and can still read PUBLIC cross-tree refs like
// skill-graph/audits/merge-protocol.md.
//
// Public roots come in two grades (see buildSeatbeltProfile): READ-WRITE roots (the loop's
// own run dirs) and READ-ONLY roots (the skill SOURCE — skill-graph repo + skills library —
// which an advisory model researches but must NOT mutate; a write there EPERMs). A
// read-write run dir NESTED inside a read-only source root is re-allowed for write by SBPL
// last-match. This is what makes the advisory-panel fence safe: the model can read the
// corpus to research, can write its own proposal into the run dir, and physically cannot
// edit a canonical SKILL.md.
//
// Why a policy and not a physical checkout: it is strictly better for this threat
// model — no stale duplicate of the corpus, no disk cost, no broken cross-tree
// relative references, and the guarantee is kernel-enforced rather than relying on the
// model never typing an absolute path. The deny is anchored at the workspace ROOT with
// the public roots allowed back (last-match-wins), so it cannot silently miss an
// unlisted private sibling — the default WITHIN the workspace is DENY.
//
// Non-macOS: sandbox-exec is unavailable; the fence degrades to the in-process guard
// (which stays always-on in skill-audit-loop-lite-deps) and reports `supported: false`. A
// container (Docker) fence for Linux/CI is the tracked follow-up — see
// docs/skill-audit-loop-philosophy.md point 3.
//
// See public-content-fence.js (the in-process layer, defense-in-depth) and memory
// skill-graph-private-content-boundary.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const SANDBOX_EXEC = '/usr/bin/sandbox-exec';

const OS_FENCE_DENY_REASON =
  'The enrich/eval private-content boundary is HARD — only the public skill-graph repo '
  + '+ skills tree + audit-artifacts run dir are reachable; every other workspace path is '
  + 'kernel-denied. See docs/skill-audit-loop-philosophy.md and lib/audit/isolated-checkout.js.';

// Cached result of the runtime capability probe (null = not yet probed).
let _seatbeltCapable = null;

/**
 * Probe whether Seatbelt can ACTUALLY be applied on this host — not merely whether the
 * sandbox-exec binary exists. In a restricted/nested sandbox (macOS App Sandbox, some CI
 * runners, an outer sandbox-exec) the binary is present but the kernel denies the nested
 * `sandbox_apply` at runtime with "Operation not permitted" (EPERM). The existence check
 * alone therefore returns a false positive there, and the LIVE Seatbelt test then fails
 * the SYSTEM gate (SKI-150). We detect the real capability by applying a minimal no-op
 * profile to a trivial process and observing whether it succeeds. Result is cached so the
 * probe runs at most once per process.
 * @returns {boolean}
 */
function testSeatbeltCapability() {
  if (_seatbeltCapable !== null) return _seatbeltCapable;
  if (process.platform !== 'darwin' || !fs.existsSync(SANDBOX_EXEC)) {
    _seatbeltCapable = false;
    return _seatbeltCapable;
  }
  try {
    // Minimal everything-allowed profile — we are testing the APPLY capability, not the
    // policy. If sandbox_apply is denied this throws (EPERM / non-zero exit) and we
    // degrade gracefully to the in-process guard.
    execFileSync(SANDBOX_EXEC, ['-p', '(version 1)(allow default)', '/usr/bin/true'], {
      stdio: 'ignore',
      timeout: 5000,
    });
    _seatbeltCapable = true;
  } catch (_) {
    _seatbeltCapable = false;
  }
  return _seatbeltCapable;
}

/**
 * Is the OS-level fence enforceable on this host? macOS only — Seatbelt's sandbox-exec is
 * the kernel primitive. Returns false (degrade to the in-process guard) on non-macOS AND
 * on macOS hosts where sandbox_apply is denied (restricted/nested sandbox). The capability
 * is DETECTED at runtime, never assumed from the binary's existence (SKI-150).
 * @returns {boolean}
 */
function isOsFenceSupported() {
  return testSeatbeltCapability();
}

/**
 * Resolve a path to its canonical (symlink-free) absolute form when it exists, else
 * fall back to a plain resolve. Seatbelt matches against the resolved vnode path, so a
 * live run must canonicalize (e.g. /tmp → /private/tmp, or a symlinked workspace); a
 * unit test with a synthetic non-existent path still gets a stable absolute string.
 * @param {string} p
 * @returns {string}
 */
function canonicalPath(p) {
  const resolved = path.resolve(p);
  try { return fs.realpathSync(resolved); } catch (_) { return resolved; }
}

/** Escape a path for an SBPL double-quoted string literal. */
function escapeSbpl(p) {
  return p.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * Build the Seatbelt (SBPL) profile string for an enrich/eval run.
 *
 * Pattern (last-match-wins): allow everything by default (so the CLI binary, its
 * config, node, system libs, tmp, and network all work), DENY the entire workspace
 * subtree for read+write, then ALLOW back the public roots. The net effect is an
 * isolated-checkout policy: within the workspace only the public roots are visible.
 *
 * Two grades of public root:
 *   - `readOnlyRoots`  — allow file-READ only. The process can research these trees but
 *     CANNOT mutate them (a write EPERMs). Used to make the skill SOURCE (skill-graph repo
 *     + skills library) research-readable yet physically un-writable by an advisory model.
 *   - `publicRoots`    — allow file READ+WRITE. The loop's own derived-artifact run dirs.
 *
 * Read-only roots are emitted BEFORE the read-write roots, so a read-write root that is
 * NESTED inside a read-only root (e.g. `<skill-graph>/.opencode/progress` inside the
 * read-only `<skill-graph>`) wins by last-match: the parent is read-only, the run-dir
 * subtree inside it is writable. When `readOnlyRoots` is omitted the output is identical
 * to the original all-read-write profile (the frontier path is unchanged).
 *
 * @param {object}   opts
 * @param {string}   opts.workspaceRoot   Absolute workspace root (parent of skill-graph + the private siblings).
 * @param {string[]} [opts.publicRoots]   Read+write public roots (audit-artifacts run dirs).
 * @param {string[]} [opts.readOnlyRoots] Read-only public roots (source trees: skill-graph repo, skills tree).
 * @returns {string} the SBPL profile text.
 */
function buildSeatbeltProfile({ workspaceRoot, publicRoots, readOnlyRoots } = {}) {
  if (!workspaceRoot) throw new Error('buildSeatbeltProfile: workspaceRoot is required');
  const rw = Array.isArray(publicRoots) ? publicRoots.filter(Boolean) : [];
  const ro = Array.isArray(readOnlyRoots) ? readOnlyRoots.filter(Boolean) : [];
  if (rw.length === 0 && ro.length === 0) {
    throw new Error('buildSeatbeltProfile: at least one public root (read-write or read-only) is required');
  }
  const ws = canonicalPath(workspaceRoot);
  const rwRoots = rw.map(canonicalPath);
  const roRoots = ro.map(canonicalPath);

  // Guard against a fence-defeating config: a public root (of EITHER grade) that IS the
  // workspace root (or an ancestor of it) would re-allow the whole tree and negate the
  // deny. Refuse it loudly rather than silently shipping a no-op fence. (A read-only
  // ancestor would re-allow READS of the whole tree — still a leak — so both sets are
  // guarded identically.)
  for (const r of [...roRoots, ...rwRoots]) {
    if (r === ws || ws.startsWith(r + path.sep)) {
      throw new Error(
        `buildSeatbeltProfile: public root "${r}" is the workspace root or an ancestor of it — `
        + 'allowing it back would defeat the fence. Public roots must be strict children of, '
        + 'or outside, the workspace.',
      );
    }
  }

  const lines = [
    '(version 1)',
    ';; SH-6681 OS fence — enrich/eval private-content boundary (kernel-enforced).',
    ';; Generated by lib/audit/isolated-checkout.js. See OS_FENCE_DENY_REASON.',
    '(allow default)',
    `(deny file-read* file-write* (subpath "${escapeSbpl(ws)}"))`,
    // Let a CLI STAT the workspace-root NODE at startup without exposing its contents. Some
    // CLIs (the Gemini CLI's `isWorkspaceHomeDir` settings probe) lstat their ancestor chain
    // up to the workspace root; the subpath deny above EPERMs that lstat and the CLI aborts
    // before doing any work. `file-read-metadata` on the LITERAL root allows lstat/stat of the
    // `/ws` directory node only — it does NOT permit reading files under it (still subpath-denied)
    // nor listing its entries (readdir is file-read-data, denied), so no private sibling leaks.
    `(allow file-read-metadata (literal "${escapeSbpl(ws)}"))`,
    // Read-only roots FIRST so a read-write root nested inside one wins by last-match.
    ...roRoots.map((r) => `(allow file-read* (subpath "${escapeSbpl(r)}"))`),
    ...rwRoots.map((r) => `(allow file-read* file-write* (subpath "${escapeSbpl(r)}"))`),
  ];
  return lines.join('\n') + '\n';
}

/**
 * Wrap a CLI invocation so it runs under the given Seatbelt profile.
 * `sandbox-exec -f <profile> <cli> <args...>`.
 *
 * @param {string}   profilePath  Absolute path to the .sb profile file.
 * @param {string}   cli          The CLI to fence (e.g. 'claude', 'codex').
 * @param {string[]} args         The CLI args.
 * @returns {{ cli: string, args: string[] }} the fenced invocation.
 */
function wrapWithSeatbelt(profilePath, cli, args) {
  if (!profilePath) throw new Error('wrapWithSeatbelt: profilePath is required');
  return { cli: SANDBOX_EXEC, args: ['-f', profilePath, cli, ...(args || [])] };
}

/**
 * Prepare an OS fence for an enrich/eval run. Returns a handle whose `wrap(cli, args)`
 * fences a model CLI invocation when the fence is enabled AND supported, and is the
 * identity otherwise (so callers can wrap unconditionally).
 *
 * The profile file is written lazily on the FIRST wrap() call — so a dry-run (which
 * never dispatches a real CLI) and a non-darwin host never touch the filesystem.
 *
 * @param {object}   opts
 * @param {string}   opts.workspaceRoot   Absolute workspace root.
 * @param {string[]} [opts.publicRoots]   Read+write public roots to allow back.
 * @param {string[]} [opts.readOnlyRoots] Read-only public roots (source trees the process may read but not mutate).
 * @param {boolean} [opts.enabled=true]   Caller intent. When false, wrap is identity even on macOS.
 * @param {string}  [opts.tmpDir]         Where to write the profile file (default os.tmpdir()).
 * @param {Function}[opts.warn]           One-arg logger for the degrade notice (default console.warn).
 * @returns {{ supported: boolean, enabled: boolean, active: boolean,
 *            wrap: (cli: string, args: string[]) => { cli: string, args: string[] },
 *            profilePath: () => (string|null), cleanup: () => void }}
 */
function prepareOsFence({ workspaceRoot, publicRoots, readOnlyRoots, enabled = true, tmpDir, warn } = {}) {
  const supported = isOsFenceSupported();
  const active = Boolean(enabled) && supported;
  const log = warn || ((m) => console.warn(m));

  if (enabled && !supported) {
    log(
      '[enrich] OS fence requested but unavailable on this platform '
      + `(${process.platform}; sandbox-exec ${fs.existsSync(SANDBOX_EXEC) ? 'present' : 'absent'}). `
      + 'Falling back to the in-process public-content guard only. '
      + 'A container (Docker) fence is the tracked follow-up (SH-6681).',
    );
  }

  let profilePathValue = null;
  let writtenDir = null;

  function ensureProfile() {
    if (!active) return null;
    if (profilePathValue) return profilePathValue;
    const profile = buildSeatbeltProfile({ workspaceRoot, publicRoots, readOnlyRoots });
    writtenDir = fs.mkdtempSync(path.join(tmpDir || os.tmpdir(), 'enrich-osfence-'));
    profilePathValue = path.join(writtenDir, 'fence.sb');
    fs.writeFileSync(profilePathValue, profile, { mode: 0o600 });
    return profilePathValue;
  }

  return {
    supported,
    enabled: Boolean(enabled),
    active,
    wrap(cli, args) {
      if (!active) return { cli, args };
      return wrapWithSeatbelt(ensureProfile(), cli, args);
    },
    profilePath() { return profilePathValue; },
    cleanup() {
      if (writtenDir) {
        try { fs.rmSync(writtenDir, { recursive: true, force: true }); } catch (_) { /* best-effort */ }
        writtenDir = null;
        profilePathValue = null;
      }
    },
  };
}

/**
 * Resolve whether the OS fence should be enabled, from an explicit option then the
 * SKILL_ENRICH_OS_FENCE env var. Default is ENABLED (the fence is the security
 * boundary; an opt-in-off fence does not close the gap). `SKILL_ENRICH_OS_FENCE=0`
 * opts out (e.g. for a debugging run that genuinely needs the model to reach a
 * non-public path — rare, and a deliberate operator choice).
 *
 * @param {boolean|undefined} explicit  An explicit `osFence` option, if any.
 * @param {object} [env=process.env]
 * @returns {boolean}
 */
function resolveOsFenceEnabled(explicit, env = process.env) {
  if (explicit !== undefined) return Boolean(explicit);
  return env.SKILL_ENRICH_OS_FENCE !== '0';
}

module.exports = {
  SANDBOX_EXEC,
  OS_FENCE_DENY_REASON,
  isOsFenceSupported,
  canonicalPath,
  buildSeatbeltProfile,
  wrapWithSeatbelt,
  prepareOsFence,
  resolveOsFenceEnabled,
};
