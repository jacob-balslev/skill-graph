'use strict';

// Unit test: SH-6681 (remainder) — the FULL OS fence (lib/audit/isolated-checkout.js).
// The in-process guard refuses paths the orchestrator resolves; this kernel-level fence
// stops the spawned model PROCESS from reading a private workspace tree at all. Pure
// tests cover profile generation, the support gate, the enable-resolution, and the
// wrap; a macOS-gated LIVE test proves the generated Seatbelt profile actually denies a
// private path (EPERM) while allowing a public one — the empirical guarantee.

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const ic = require('../../lib/audit/isolated-checkout');

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log(`  PASS    ${name}`);
}

console.log('1. buildSeatbeltProfile — deny workspace, allow back the public roots');
check('emits (allow default), a workspace deny, and an allow-back per public root in order', () => {
  const profile = ic.buildSeatbeltProfile({
    workspaceRoot: '/ws',
    publicRoots: ['/ws/skill-graph', '/ws/skills', '/ws/.opencode/progress/skill-audits'],
  });
  const lines = profile.split('\n');
  assert.ok(lines.includes('(allow default)'), 'has allow default');
  const denyIdx = lines.findIndex((l) => l === '(deny file-read* file-write* (subpath "/ws"))');
  assert.ok(denyIdx >= 0, 'denies the workspace root');
  // Last-match-wins: every allow-back must come AFTER the workspace deny.
  for (const root of ['/ws/skill-graph', '/ws/skills', '/ws/.opencode/progress/skill-audits']) {
    const allowIdx = lines.findIndex((l) => l === `(allow file-read* file-write* (subpath "${root}"))`);
    assert.ok(allowIdx > denyIdx, `allow-back ${root} comes after the deny`);
  }
});
check('refuses a public root that is the workspace root or an ancestor (fence-defeating)', () => {
  assert.throws(() => ic.buildSeatbeltProfile({ workspaceRoot: '/ws', publicRoots: ['/ws'] }),
    /defeat the fence/);
  assert.throws(() => ic.buildSeatbeltProfile({ workspaceRoot: '/ws/sub', publicRoots: ['/ws'] }),
    /defeat the fence/);
});
check('requires workspaceRoot and at least one public root', () => {
  assert.throws(() => ic.buildSeatbeltProfile({ publicRoots: ['/ws/x'] }), /workspaceRoot is required/);
  assert.throws(() => ic.buildSeatbeltProfile({ workspaceRoot: '/ws', publicRoots: [] }), /at least one public root/);
});
check('escapes quotes/backslashes in a path for the SBPL string literal', () => {
  const profile = ic.buildSeatbeltProfile({ workspaceRoot: '/w s', publicRoots: ['/w s/a"b'] });
  assert.ok(profile.includes('(allow file-read* file-write* (subpath "/w s/a\\"b"))'));
});

console.log('2. wrapWithSeatbelt — sandbox-exec -f <profile> <cli> <args>');
check('wraps a CLI invocation', () => {
  const w = ic.wrapWithSeatbelt('/tmp/fence.sb', 'claude', ['-p', 'hi', '--model', 'opus']);
  assert.strictEqual(w.cli, ic.SANDBOX_EXEC);
  assert.deepStrictEqual(w.args, ['-f', '/tmp/fence.sb', 'claude', '-p', 'hi', '--model', 'opus']);
});
check('requires a profilePath', () => {
  assert.throws(() => ic.wrapWithSeatbelt('', 'claude', []), /profilePath is required/);
});

console.log('3. resolveOsFenceEnabled — explicit > env, default ON, =0 opts out');
check('explicit option wins over env', () => {
  assert.strictEqual(ic.resolveOsFenceEnabled(false, { SKILL_ENRICH_OS_FENCE: '1' }), false);
  assert.strictEqual(ic.resolveOsFenceEnabled(true, { SKILL_ENRICH_OS_FENCE: '0' }), true);
});
check('defaults to enabled when unset; SKILL_ENRICH_OS_FENCE=0 disables', () => {
  assert.strictEqual(ic.resolveOsFenceEnabled(undefined, {}), true);
  assert.strictEqual(ic.resolveOsFenceEnabled(undefined, { SKILL_ENRICH_OS_FENCE: '0' }), false);
  assert.strictEqual(ic.resolveOsFenceEnabled(undefined, { SKILL_ENRICH_OS_FENCE: '1' }), true);
});

console.log('4. prepareOsFence — identity when disabled; lazy profile; idempotent cleanup');
check('enabled:false → wrap is the identity and no profile is written (any platform)', () => {
  const warnings = [];
  const f = ic.prepareOsFence({ workspaceRoot: '/ws', publicRoots: ['/ws/skill-graph'], enabled: false, warn: (m) => warnings.push(m) });
  assert.strictEqual(f.active, false);
  assert.deepStrictEqual(f.wrap('claude', ['-p', 'x']), { cli: 'claude', args: ['-p', 'x'] });
  assert.strictEqual(f.profilePath(), null);
  assert.strictEqual(warnings.length, 0, 'no degrade warning when the caller did not request the fence');
  f.cleanup();
});
check('requested but unsupported → identity wrap + a single degrade warning', () => {
  if (ic.isOsFenceSupported()) { console.log('    (skipped — host supports the OS fence)'); return; }
  const warnings = [];
  const f = ic.prepareOsFence({ workspaceRoot: '/ws', publicRoots: ['/ws/skill-graph'], enabled: true, warn: (m) => warnings.push(m) });
  assert.strictEqual(f.active, false);
  assert.deepStrictEqual(f.wrap('claude', ['-p', 'x']), { cli: 'claude', args: ['-p', 'x'] });
  assert.ok(warnings.some((m) => /OS fence requested but unavailable/.test(m)), 'warns on degrade');
});

console.log('5. LIVE Seatbelt enforcement (macOS only) — public allowed, private DENIED');
check('a node child under the generated profile reads public + is kernel-denied private', () => {
  if (!ic.isOsFenceSupported()) { console.log('    (skipped — sandbox-exec not available on this host)'); return; }
  const ws = fs.mkdtempSync(path.join(os.tmpdir(), 'osfence-live-'));
  try {
    const pub = path.join(ws, 'skill-graph', 'audits');
    const priv = path.join(ws, 'sales-hub');
    fs.mkdirSync(pub, { recursive: true });
    fs.mkdirSync(priv, { recursive: true });
    const pubFile = path.join(pub, 'merge-protocol.md');
    const privFile = path.join(priv, 'customers.csv');
    fs.writeFileSync(pubFile, 'PUBLIC OK');
    fs.writeFileSync(privFile, 'CUSTOMER PII');

    const f = ic.prepareOsFence({ workspaceRoot: ws, publicRoots: [path.join(ws, 'skill-graph')], enabled: true });
    assert.strictEqual(f.active, true, 'fence is active on a supported host');
    // Force the lazy profile to be written, then assert the policy with a real run.
    const w = f.wrap('node', ['-e', 'process.exit(0)']);
    assert.strictEqual(w.cli, ic.SANDBOX_EXEC);
    const profilePath = f.profilePath();
    assert.ok(profilePath && fs.existsSync(profilePath), 'profile file written lazily on first wrap');

    const node = process.execPath;
    const runFenced = (script) => execFileSync(ic.SANDBOX_EXEC, ['-f', profilePath, node, '-e', script], { encoding: 'utf8' }).trim();

    // Public read must succeed.
    const pubOut = runFenced(`process.stdout.write(require('fs').readFileSync(${JSON.stringify(pubFile)}, 'utf8'))`);
    assert.strictEqual(pubOut, 'PUBLIC OK', 'public file is readable under the fence');

    // Private read must be kernel-denied (EPERM) — by absolute path, the cwd-independent threat.
    const privOut = runFenced(
      `try{require('fs').readFileSync(${JSON.stringify(privFile)}, 'utf8');process.stdout.write('LEAK')}`
      + `catch(e){process.stdout.write('DENIED:'+(e.code||e.message))}`,
    );
    assert.ok(/^DENIED:/.test(privOut), `private read denied (got: ${privOut})`);
    assert.ok(!/LEAK/.test(privOut), 'private file did NOT leak');

    // Private WRITE must also be denied.
    const privWrite = runFenced(
      `try{require('fs').writeFileSync(${JSON.stringify(path.join(priv, 'x'))}, 'y');process.stdout.write('WROTE')}`
      + `catch(e){process.stdout.write('DENIED:'+(e.code||e.message))}`,
    );
    assert.ok(/^DENIED:/.test(privWrite) && !/WROTE/.test(privWrite), `private write denied (got: ${privWrite})`);

    f.cleanup();
    assert.ok(!fs.existsSync(profilePath), 'cleanup removes the profile temp dir');
    f.cleanup(); // idempotent — must not throw
  } finally {
    fs.rmSync(ws, { recursive: true, force: true });
  }
});

console.log(`\nResults: ${passed} passed, 0 failed`);
