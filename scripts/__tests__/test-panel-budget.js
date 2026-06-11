'use strict';

// Unit test: panel rate-limit recovery + budget gate (lib/audit/panel-budget.js, F1)
// and the advisory auth preflight (lib/audit/advisory-preflight.js, F5).

const assert = require('assert');
const {
  RateLimitError,
  BudgetExhaustedError,
  parseRateLimit,
  exhaustedLockPath,
  exhaustedLockAliases,
  findExhaustedLock,
  frontierAvailability,
  assertBudgetAvailable,
} = require('../../lib/audit/panel-budget');
const { advisoryAuthPreflight } = require('../../lib/audit/advisory-preflight');

let passed = 0;
function check(name, fn) { fn(); passed += 1; console.log(`  PASS    ${name}`); }

console.log('1. parseRateLimit');
check('detects a 429 / rate-limit / usage-limit signal', () => {
  assert.strictEqual(parseRateLimit('HTTP 429 Too Many Requests').isRateLimit, true);
  assert.strictEqual(parseRateLimit('Error: rate_limit_exceeded').isRateLimit, true);
  assert.strictEqual(parseRateLimit('usage limit reached for this account').isRateLimit, true);
  assert.strictEqual(parseRateLimit('the model is overloaded, try again').isRateLimit, true);
});
check('a non-rate-limit error is not flagged', () => {
  assert.strictEqual(parseRateLimit('proposal not written — ENOENT').isRateLimit, false);
  assert.strictEqual(parseRateLimit('').isRateLimit, false);
});
check('extracts a retry-after window in seconds and minutes', () => {
  assert.strictEqual(parseRateLimit('rate limited; retry after 30s').retryAfterMs, 30000);
  assert.strictEqual(parseRateLimit('429 — try again in 2 minutes').retryAfterMs, 120000);
});

console.log('2. assertBudgetAvailable (injected fs)');
check('no lock => no throw', () => {
  const fsImpl = { existsSync: () => false, readFileSync: () => '' };
  assert.doesNotThrow(() => assertBudgetAvailable({ model: 'opus', budgetDir: '/b', fsImpl }));
});
check('lock present => throws BudgetExhaustedError with resetAt', () => {
  const lock = exhaustedLockPath('gpt-5.5', '/b');
  const fsImpl = {
    existsSync: (p) => p === lock,
    readFileSync: () => JSON.stringify({ resetAt: '2026-06-08T12:00:00Z' }),
  };
  let err;
  try { assertBudgetAvailable({ model: 'gpt-5.5', budgetDir: '/b', fsImpl }); } catch (e) { err = e; }
  assert.ok(err instanceof BudgetExhaustedError);
  assert.strictEqual(err.code, 'BUDGET_EXHAUSTED');
  assert.strictEqual(err.recoverable, true);
  assert.strictEqual(err.resetAt, '2026-06-08T12:00:00Z');
});
check('exhaustedLockPath sanitizes the model alias', () => {
  assert.match(exhaustedLockPath('gemini-flash', '/b'), /exhausted-gemini-flash\.lock$/);
});
check('gpt-5.5 lock aliases include app/provider names', () => {
  assert.ok(exhaustedLockAliases('gpt-5.5').includes('gpt-5.5'));
  assert.ok(exhaustedLockAliases('gpt-5.5').includes('gpt-5.4'));
});
check('findExhaustedLock honors aliases and ignores stale dated locks', () => {
  const stale = exhaustedLockPath('opus', '/b');
  const activeAlias = exhaustedLockPath('gpt-5.5', '/b');
  const fsImpl = {
    existsSync: (p) => p === stale || p === activeAlias,
    readFileSync: (p) => (p === stale
      ? JSON.stringify({ date: '2026-06-09' })
      : JSON.stringify({ date: '2026-06-10', reset_at: '2026-06-10T12:00:00Z' })),
  };
  assert.strictEqual(findExhaustedLock({ model: 'opus', budgetDir: '/b', fsImpl, today: '2026-06-10' }).active, false);
  const codex = findExhaustedLock({ model: 'gpt-5.5', budgetDir: '/b', fsImpl, today: '2026-06-10' });
  assert.strictEqual(codex.active, true);
  assert.strictEqual(codex.alias, 'gpt-5.5');
});
check('frontierAvailability returns the available frontier when one is exhausted', () => {
  const opusLock = exhaustedLockPath('opus', '/b');
  const fsImpl = {
    existsSync: (p) => p === opusLock,
    readFileSync: () => JSON.stringify({ date: '2026-06-10' }),
  };
  const r = frontierAvailability({ models: ['opus', 'gpt-5.5'], budgetDir: '/b', fsImpl, today: '2026-06-10' });
  assert.deepStrictEqual(r.available, ['gpt-5.5']);
  assert.deepStrictEqual(r.exhausted.map((e) => e.model), ['opus']);
  assert.strictEqual(r.anyAvailable, true);
  assert.strictEqual(r.allExhausted, false);
});

console.log('3. RateLimitError shape');
check('carries model + checkpoint + recoverable', () => {
  const e = new RateLimitError('rl', { model: 'opus', retryAfterMs: 1000, checkpoint: { proposed: ['opus'] } });
  assert.strictEqual(e.code, 'RATE_LIMIT');
  assert.strictEqual(e.recoverable, true);
  assert.strictEqual(e.model, 'opus');
  assert.deepStrictEqual(e.checkpoint, { proposed: ['opus'] });
});

console.log('4. advisoryAuthPreflight (F5)');
check('NEVER drops a model; emits a loud warning for an unauthed backend', () => {
  const logs = [];
  const r = advisoryAuthPreflight({
    models: ['gemini', 'minimax', 'big-pickle'],
    resolveBackend: (m) => ({ backend: m === 'gemini' ? 'gemini' : 'opencode' }),
    probe: (backend) => ({ authed: backend === 'gemini' }), // opencode unauthed
    log: (m) => logs.push(m),
  });
  // models returned UNCHANGED — no model dropped
  assert.deepStrictEqual(r.models, ['gemini', 'minimax', 'big-pickle']);
  // gemini ready; the two opencode-backed models warned
  assert.deepStrictEqual(r.ready, ['gemini']);
  assert.strictEqual(r.warnings.length, 2);
  assert.ok(r.warnings.every((w) => w.backend === 'opencode' && /opencode auth login/.test(w.hint)));
  assert.ok(logs.some((l) => /ADVISORY AUTH/.test(l) && /never silently dropped/.test(l)));
});
check('a throwing probe is treated as NOT authed (fail-loud, never fail-silent)', () => {
  const r = advisoryAuthPreflight({
    models: ['gemini'],
    resolveBackend: () => ({ backend: 'gemini' }),
    probe: () => { throw new Error('probe boom'); },
    log: () => {},
  });
  assert.strictEqual(r.warnings.length, 1);
  assert.strictEqual(r.ready.length, 0);
  assert.match(r.warnings[0].detail, /probe boom/);
});

console.log(`\n${passed} passed`);
