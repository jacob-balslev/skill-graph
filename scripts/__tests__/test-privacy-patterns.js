'use strict';

// Unit test: detectPrivacyViolations FAILS CLOSED on an unreadable file (SKI-256).
// A privacy/safety gate that silently skips a file it cannot read is fail-open — an
// unscannable file is not a clean file. The gate must emit a blocking finding so callers
// (which treat findings as failures) refuse to pass it. Pure DI on the injectable fs.

const assert = require('assert');
const { detectPrivacyViolations, scanPrivacyText } = require('../lib/privacy-patterns');

let passed = 0;
function check(name, fn) { fn(); passed += 1; console.log(`  PASS    ${name}`); }

const throwingFs = (code) => ({ readFileSync() { const e = new Error(code); e.code = code; throw e; } });

check('an unreadable file (EACCES) produces a blocking "unreadable-file" finding, not a silent skip', () => {
  const findings = detectPrivacyViolations(['/x/secret.md'], { fs: throwingFs('EACCES') });
  assert.strictEqual(findings.length, 1, 'one finding for the unreadable file');
  assert.strictEqual(findings[0].id, 'unreadable-file');
  assert.strictEqual(findings[0].file, '/x/secret.md');
  assert.match(findings[0].message, /failing closed/i);
});

check('a missing file (ENOENT) also fails closed', () => {
  const findings = detectPrivacyViolations(['/x/gone.md'], { fs: throwingFs('ENOENT') });
  assert.strictEqual(findings.length, 1);
  assert.strictEqual(findings[0].id, 'unreadable-file');
});

check('a readable clean file produces no findings (normal scan path unbroken)', () => {
  const okFs = { readFileSync() { return '# clean content\nno secrets here\n'; } };
  assert.strictEqual(detectPrivacyViolations(['/x/clean.md'], { fs: okFs }).length, 0);
});

check('pathDisplay is applied to the unreadable-file finding', () => {
  const findings = detectPrivacyViolations(['/abs/x/secret.md'], {
    fs: throwingFs('EACCES'),
    pathDisplay: (p) => p.replace('/abs/', ''),
  });
  assert.strictEqual(findings[0].file, 'x/secret.md');
});

check('a mix of readable + unreadable scans the readable and blocks on the unreadable', () => {
  let n = 0;
  const mixedFs = { readFileSync() { n += 1; if (n === 1) return 'clean\n'; const e = new Error('EACCES'); e.code = 'EACCES'; throw e; } };
  const findings = detectPrivacyViolations(['/x/ok.md', '/x/bad.md'], { fs: mixedFs });
  assert.strictEqual(findings.length, 1, 'only the unreadable file yields a finding');
  assert.strictEqual(findings[0].id, 'unreadable-file');
  assert.strictEqual(findings[0].file, '/x/bad.md');
});

// --- Structured financial-identifier patterns (IBAN / payment card / ABA routing) ---
// The validate() checksum guard must DETECT real identifiers and REJECT innocent
// digit runs — the false positive that would otherwise break the export/CI gate.
const fid = (text) => [...new Set(scanPrivacyText(text, 't').map((f) => f.id))]
  .filter((i) => ['iban', 'credit_card', 'us_aba_routing'].includes(i)).sort();

check('detects a checksum-valid IBAN (ISO 7064 mod-97)', () => {
  assert.deepStrictEqual(fid('account GB82 WEST 12345698765432 here'), ['iban']);
});
check('detects a Luhn-valid major-network card number', () => {
  assert.deepStrictEqual(fid('card 4111 1111 1111 1111 on file'), ['credit_card']);
});
check('detects a checksum-valid US ABA routing number', () => {
  assert.deepStrictEqual(fid('routing 021000021 here'), ['us_aba_routing']);
});
check('does NOT flag a plain 16-digit number in an example (no valid card IIN)', () => {
  assert.deepStrictEqual(fid('id 1234567890123456 example'), []);
});
check('does NOT flag a card-shaped number that fails the Luhn checksum', () => {
  assert.deepStrictEqual(fid('card 4111 1111 1111 1112'), []);
});
check('does NOT flag an IBAN-shaped string with bad check digits', () => {
  assert.deepStrictEqual(fid('GB00WEST12345698765432'), []);
});
check('does NOT flag a 9-digit number that fails the ABA checksum', () => {
  assert.deepStrictEqual(fid('value 123456789 here'), []);
});

console.log(`\n${passed} passed`);
