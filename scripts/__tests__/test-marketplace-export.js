#!/usr/bin/env node
/**
 * Regression tests for marketplace export generation and gates.
 *
 * These tests require the canonical skills library (a sibling repo at
 * ../skills/skills or configured via .skill-graph/config.json). In CI
 * environments where only the skill-graph tooling repo is checked out,
 * the tests skip gracefully rather than failing.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { workspaceRoot, loadWorkspaceConfig, resolveSkillRoots } = require('../lib/roots');
const {
  EXPORT_DESCRIPTION_OVERRIDES,
  GUARD_OPERATIONAL_THRESHOLD,
  GUARD_SAMPLE_SIZE,
  MARKETPLACE_DESCRIPTION_LIMIT,
  applyExportProjection,
  assertSourceRootIsPortable,
  buildMarketplaceSkillText,
  collectCanonicalSkills,
  collectMentionedSlugs,
  exportDescriptionForSkill,
  extractBoundaryOwnsClause,
  relationSlugs,
  renderSkillGraphContext,
  rewriteLocalMarkdownLinksToCanonicalRepo,
  scanPrivacyText,
  synthesizeBoundaryTail,
} = require('../export-marketplace-skills');
const { parseFrontmatter } = require('../lib/parse-frontmatter');
const { validateExportedFrontmatter } = require('../verify-skill-md-export');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

function fail(msg) {
  process.stderr.write(`FAIL test-marketplace-export: ${msg}\n`);
  process.exit(1);
}

function assert(condition, msg) {
  if (!condition) fail(msg);
}

// Skip gracefully when the canonical skills library is not present (e.g. CI
// environments that only check out the skill-graph tooling repo).
const _root = workspaceRoot();
const _skillRoots = resolveSkillRoots(_root, loadWorkspaceConfig(_root));
const _sourceDir = _skillRoots[0] && _skillRoots[0].absPath;
if (!_sourceDir || !fs.existsSync(_sourceDir)) {
  process.stdout.write(
    `SKIP test-marketplace-export: canonical skills library not found at ${_sourceDir || '(no path resolved)'} — skipping\n`
  );
  process.exit(0);
}

const skills = collectCanonicalSkills();
assert(skills.length > 0, 'canonical skills should be discovered');

// SKI-319: the per-skill description-limit + override-parity assertions are CORPUS-COMPLETENESS
// checks — they scan EVERY live skill and redden when a parallel CONTENT session edits a real
// skill's description over the marketplace limit (the doctrine: corpus-completeness belongs in
// verify:corpus, never in verify:system / test:unit). Run them ONLY in the corpus lane (the
// `--corpus` flag, set by `npm run test:marketplace-corpus` inside verify:corpus). In the SYSTEM
// unit run (test:unit, no flag) they are skipped — `marketplace:verify` enforces the limit
// corpus-wide in the corpus lane regardless. The export-LOGIC tests below always run.
const CORPUS_MODE = process.argv.includes('--corpus');
if (CORPUS_MODE) {
  const longDescriptions = [];
  for (const skill of skills) {
    const sourceLength = String(skill.fm.description || '').length;
    const exportDescription = exportDescriptionForSkill(skill);
    assert(
      exportDescription.description.length <= MARKETPLACE_DESCRIPTION_LIMIT,
      `${skill.fm.name} export description exceeds marketplace limit`
    );
    if (sourceLength > MARKETPLACE_DESCRIPTION_LIMIT) {
      longDescriptions.push(skill.fm.name);
      assert(
        EXPORT_DESCRIPTION_OVERRIDES[skill.fm.name],
        `${skill.fm.name} needs an explicit export description override`
      );
    }
  }
  const overrideNames = Object.keys(EXPORT_DESCRIPTION_OVERRIDES).sort();
  assert(
    JSON.stringify(overrideNames) === JSON.stringify(longDescriptions.sort()),
    'description overrides should exist only for over-limit canonical descriptions'
  );
} else {
  process.stdout.write(
    'SKIP corpus description-limit + override-parity checks (corpus-completeness — run via `npm run test:marketplace-corpus` / verify:corpus; marketplace:verify enforces the limit in the corpus lane)\n'
  );
}

const a11y = skills.find(skill => skill.fm.name === 'a11y');
assert(a11y, 'a11y fixture skill should exist');
const exportedA11y = buildMarketplaceSkillText(a11y);
const exportedA11yFm = parseFrontmatter(exportedA11y);
assert(exportedA11yFm, 'marketplace export should have frontmatter');
const shape = validateExportedFrontmatter(exportedA11yFm);
assert(shape.errors.length === 0, `marketplace export should be plain SKILL.md shape: ${shape.errors.join('; ')}`);
// After the M1 category restructure, a11y lives at skills/quality/a11y/SKILL.md
// in the sibling skills repo. Derive the expected path from the resolved source
// rather than hardcoding it, so the assertion stays correct if the skill moves again.
const _expectedCanonicalSkill = a11y.canonicalSkillPath;
assert(
  exportedA11yFm.metadata.skill_graph_canonical_skill === _expectedCanonicalSkill,
  `marketplace export should preserve canonical source path (expected: ${_expectedCanonicalSkill})`
);
// `skill_graph_protocol` removed 2026-05-26 per F8 — the field carried a
// misleading "content verified at vN" implication on every export regardless
// of source content. New exports must NOT emit this key; per-skill
// `schema_version` is the honest signal. The normalizer's PROVENANCE_KEYS
// in scripts/lib/parse-frontmatter.js still strips this key on read so
// historical marketplace exports drain cleanly.
assert(
  !('skill_graph_protocol' in (exportedA11yFm.metadata || {})),
  'marketplace export must NOT emit `skill_graph_protocol` (removed 2026-05-26 per F8)'
);
assert(
  exportedA11y.includes('https://github.com/jacob-balslev/skill-graph/blob/main/examples/evals/a11y.json'),
  'marketplace export should rewrite repo-local links to canonical GitHub URLs'
);

const rewritten = rewriteLocalMarkdownLinksToCanonicalRepo(
  'See [eval](../../examples/evals/a11y.json) and [external](https://example.com).',
  'skills/a11y/SKILL.md'
);
assert(
  rewritten.includes('https://github.com/jacob-balslev/skill-graph/blob/main/examples/evals/a11y.json'),
  'relative links should be rewritten to canonical GitHub URLs'
);
assert(rewritten.includes('[external](https://example.com)'), 'external links should be preserved');

const fakeSecret = 'sk-' + 'A'.repeat(24);
const fakeLeak = `C:\\Users\\Example\\secret.txt\nperson@example.com\n${fakeSecret}`;
const findings = scanPrivacyText(fakeLeak, path.join(REPO_ROOT, 'marketplace', 'skills', 'fake', 'SKILL.md'));
assert(findings.length >= 3, 'privacy scan should detect paths, email addresses, and token-like values');

// ---------------------------------------------------------------------------
// Root-resolution guard tests (SH-6329)
// ---------------------------------------------------------------------------
// Guard constants should be exported and in range.
assert(
  typeof GUARD_SAMPLE_SIZE === 'number' && GUARD_SAMPLE_SIZE > 0,
  'GUARD_SAMPLE_SIZE should be a positive number'
);
assert(
  typeof GUARD_OPERATIONAL_THRESHOLD === 'number' &&
    GUARD_OPERATIONAL_THRESHOLD > 0 &&
    GUARD_OPERATIONAL_THRESHOLD < 1,
  'GUARD_OPERATIONAL_THRESHOLD should be a fraction between 0 and 1'
);

// Signal 1: path guard — assertSourceRootIsPortable should throw when no
// workspace config was found but the skill root dir exists (the "wrong CWD"
// case). We simulate this by passing workspaceConfig=null with a sourceDir
// that exists on disk (the REPO_ROOT itself always exists).
let pathGuardFired = false;
try {
  assertSourceRootIsPortable(REPO_ROOT, null); // null config = no .skill-graph/config.json
  // Only fires if REPO_ROOT happens to be a non-existent path — would be a test-env oddity.
} catch (err) {
  pathGuardFired = true;
  assert(
    err.message.includes('no .skill-graph/config.json found'),
    `path guard error should mention missing config: ${err.message}`
  );
  assert(
    err.message.includes('skill-graph repo root'),
    `path guard error should mention fix (skill-graph repo root): ${err.message}`
  );
}
assert(pathGuardFired, 'assertSourceRootIsPortable should throw when workspaceConfig is null and sourceDir exists');

// Signal 2: content guard — build a temporary directory containing
// predominantly scope:operational skills and verify the guard rejects it.
const os = require('os');
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sg-guard-test-'));
try {
  // Create GUARD_SAMPLE_SIZE + 1 fake skills all with scope:operational
  const operationalFm = [
    '---',
    'name: fake-operational',
    'description: "Fake internal skill for test."',
    'scope: operational',
    '---',
    '',
    '# Fake operational skill body',
  ].join('\n');

  const portableFm = [
    '---',
    'name: fake-portable',
    'description: "Fake portable skill for test."',
    'scope: portable',
    '---',
    '',
    '# Fake portable skill body',
  ].join('\n');

  // Write more operational than portable so the fraction exceeds the threshold.
  const numOperational = Math.ceil(GUARD_SAMPLE_SIZE * (GUARD_OPERATIONAL_THRESHOLD + 0.1)) + 1;
  const numPortable = 1; // minority portable — total still > threshold operational

  for (let i = 0; i < numOperational; i++) {
    const skillDir = path.join(tmpDir, `operational-skill-${i}`);
    fs.mkdirSync(skillDir);
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), operationalFm.replace('fake-operational', `operational-skill-${i}`));
  }
  for (let i = 0; i < numPortable; i++) {
    const skillDir = path.join(tmpDir, `portable-skill-${i}`);
    fs.mkdirSync(skillDir);
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), portableFm.replace('fake-portable', `portable-skill-${i}`));
  }

  // The guard should fire: workspaceConfig is non-null (so signal 1 is bypassed),
  // but the content probe finds predominantly operational skills (signal 2).
  let contentGuardFired = false;
  try {
    assertSourceRootIsPortable(tmpDir, { skill_roots: [tmpDir] }); // non-null config bypasses signal 1
  } catch (err) {
    contentGuardFired = true;
    assert(
      err.message.includes('scope:operational') || err.message.includes('operational'),
      `content guard error should mention operational scope: ${err.message}`
    );
    assert(
      err.message.includes('skill-graph repo root'),
      `content guard error should mention fix (skill-graph repo root): ${err.message}`
    );
  }
  assert(contentGuardFired, 'assertSourceRootIsPortable should throw when source root is predominantly operational');

  // Guard should NOT fire for the actual clean portable library.
  let cleanRootThrewUnexpectedly = false;
  try {
    assertSourceRootIsPortable(_sourceDir, loadWorkspaceConfig(_root));
  } catch (err) {
    cleanRootThrewUnexpectedly = true;
    process.stderr.write(`FAIL guard should not fire for clean portable library: ${err.message}\n`);
  }
  assert(!cleanRootThrewUnexpectedly, 'assertSourceRootIsPortable should not throw for the clean portable library');
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

// ---------------------------------------------------------------------------
// Export-time description projection tests (added 2026-05-26)
// ---------------------------------------------------------------------------
// Source plan: docs/plans/export-layer-description-projection-2026-05-26.md
//
// The projection synthesizes a `Do NOT use for X (use Y).` tail into the
// exported description from typed fields (anti_examples, relations.boundary),
// dedupes against slugs already named in the canonical description, and
// enforces the 1024-char marketplace ceiling.
// ---------------------------------------------------------------------------

// collectMentionedSlugs — finds (use <slug>) mentions for dedupe
{
  const empty = collectMentionedSlugs('');
  assert(empty.size === 0, 'collectMentionedSlugs: empty input yields empty set');

  const none = collectMentionedSlugs('Plain description with no slug references.');
  assert(none.size === 0, 'collectMentionedSlugs: text without `(use X)` yields empty set');

  const one = collectMentionedSlugs('Do NOT use for foo (use bar-baz).');
  assert(one.has('bar-baz') && one.size === 1, 'collectMentionedSlugs: single mention extracted');

  const many = collectMentionedSlugs('Do NOT use for foo (use a-b). Skip when bar (use c-d).');
  assert(many.has('a-b') && many.has('c-d') && many.size === 2, 'collectMentionedSlugs: multiple mentions extracted');

  // Idempotence across calls (regex lastIndex reset)
  const second = collectMentionedSlugs('Do NOT use for foo (use bar-baz).');
  assert(second.has('bar-baz') && second.size === 1, 'collectMentionedSlugs: regex state reset between calls');
}

// extractBoundaryOwnsClause — extracts the "X owns Y" clause from a reason
{
  assert(extractBoundaryOwnsClause(null) === null, 'extractBoundaryOwnsClause: null returns null');
  assert(extractBoundaryOwnsClause('') === null, 'extractBoundaryOwnsClause: empty returns null');

  const semicolon = extractBoundaryOwnsClause(
    'testing-strategy owns deterministic-software testing; this skill owns LLM evaluation.'
  );
  assert(
    semicolon === 'deterministic-software testing',
    `extractBoundaryOwnsClause: semicolon-terminated clause; got ${JSON.stringify(semicolon)}`
  );

  const whereClause = extractBoundaryOwnsClause(
    'tool-call-flow owns the protocol cycle where the model invokes tools.'
  );
  assert(
    whereClause === 'the protocol cycle',
    `extractBoundaryOwnsClause: 'where'-terminated clause; got ${JSON.stringify(whereClause)}`
  );

  const noOwns = extractBoundaryOwnsClause('this skill teaches React patterns.');
  assert(noOwns === null, 'extractBoundaryOwnsClause: no `owns` clause returns null');

  // Length cap — clauses over 120 chars are rejected (defensive against noisy reasons)
  const longClause = 'foo owns ' + 'x'.repeat(150) + '; this skill owns nothing.';
  assert(extractBoundaryOwnsClause(longClause) === null, 'extractBoundaryOwnsClause: 120+ char clause rejected');
}

// synthesizeBoundaryTail — empty fields produce empty tail
{
  const result = synthesizeBoundaryTail({ fm: {} }, new Set());
  assert(result.tail === '' && result.sources.length === 0, 'synthesizeBoundaryTail: empty skill produces empty tail');
}

// synthesizeBoundaryTail — Shape A boundary (bare slug) is silently skipped
{
  const skill = { fm: { name: 'fixture', relations: { boundary: ['some-other-skill'] } } };
  const result = synthesizeBoundaryTail(skill, new Set());
  assert(result.tail === '', 'synthesizeBoundaryTail: Shape A bare slug produces no tail');
}

// synthesizeBoundaryTail — Shape B boundary with reason yields projected tail
{
  const skill = {
    fm: {
      name: 'fixture',
      relations: {
        boundary: [
          {
            skill: 'testing-strategy',
            reason: 'testing-strategy owns deterministic-software testing; this skill owns LLM evaluation.',
          },
        ],
      },
    },
  };
  const result = synthesizeBoundaryTail(skill, new Set());
  assert(
    result.tail === ' Do NOT use for deterministic-software testing (use testing-strategy).',
    `synthesizeBoundaryTail: Shape B tail composed; got ${JSON.stringify(result.tail)}`
  );
  assert(
    result.sources.length === 1 && result.sources[0] === 'boundary',
    `synthesizeBoundaryTail: sources includes boundary; got ${JSON.stringify(result.sources)}`
  );
}

// synthesizeBoundaryTail — dedupes Shape B against already-mentioned slug
{
  const skill = {
    fm: {
      name: 'fixture',
      relations: {
        boundary: [
          {
            skill: 'testing-strategy',
            reason: 'testing-strategy owns X; this skill owns Y.',
          },
        ],
      },
    },
  };
  const alreadyMentioned = new Set(['testing-strategy']);
  const result = synthesizeBoundaryTail(skill, alreadyMentioned);
  assert(result.tail === '', 'synthesizeBoundaryTail: dedupe skips already-mentioned slug');
}

// synthesizeBoundaryTail — anti_examples produce `Do NOT use for ...` entries
{
  const skill = {
    fm: {
      name: 'fixture',
      anti_examples: [
        'write unit tests for a deterministic transform (use testing-strategy)',
        'set up production alerting (use observability)',
      ],
    },
  };
  const result = synthesizeBoundaryTail(skill, new Set());
  assert(
    result.tail.includes('Do NOT use for write unit tests for a deterministic transform (use testing-strategy).'),
    `synthesizeBoundaryTail: anti_example 1 projected; got ${JSON.stringify(result.tail)}`
  );
  assert(
    result.tail.includes('Do NOT use for set up production alerting (use observability).'),
    `synthesizeBoundaryTail: anti_example 2 projected; got ${JSON.stringify(result.tail)}`
  );
  assert(
    result.sources.includes('anti_examples') && result.sources.length === 1,
    `synthesizeBoundaryTail: sources records anti_examples; got ${JSON.stringify(result.sources)}`
  );
}

// synthesizeBoundaryTail — anti_examples dedupe against already-mentioned slug
{
  const skill = {
    fm: {
      name: 'fixture',
      anti_examples: ['write unit tests (use testing-strategy)'],
    },
  };
  const alreadyMentioned = new Set(['testing-strategy']);
  const result = synthesizeBoundaryTail(skill, alreadyMentioned);
  assert(result.tail === '', 'synthesizeBoundaryTail: anti_example dedupe against canonical mention');
}

// synthesizeBoundaryTail — mixed sources (boundary + anti_examples), cross-dedupe
{
  const skill = {
    fm: {
      name: 'fixture',
      anti_examples: ['write deterministic unit tests (use testing-strategy)'],
      relations: {
        boundary: [
          {
            skill: 'testing-strategy',
            reason: 'testing-strategy owns deterministic-software testing; this skill owns LLM evaluation.',
          },
          {
            skill: 'observability',
            reason: 'observability owns runtime telemetry; this skill owns build-time analysis.',
          },
        ],
      },
    },
  };
  const result = synthesizeBoundaryTail(skill, new Set());
  // testing-strategy appears in anti_examples; the boundary entry for it should be skipped via cross-dedupe.
  const testingStrategyMentions = (result.tail.match(/use testing-strategy/g) || []).length;
  assert(
    testingStrategyMentions === 1,
    `synthesizeBoundaryTail: cross-source dedupe — testing-strategy mentioned once; got ${testingStrategyMentions}`
  );
  // observability only appears in boundary → should be projected.
  assert(
    result.tail.includes('(use observability)'),
    `synthesizeBoundaryTail: observability boundary entry projected; got ${JSON.stringify(result.tail)}`
  );
  assert(
    result.sources.includes('anti_examples') && result.sources.includes('boundary'),
    `synthesizeBoundaryTail: both sources recorded; got ${JSON.stringify(result.sources)}`
  );
}

// applyExportProjection — empty fields return base unchanged with projection: 'none'
{
  const result = applyExportProjection('Base description.', { fm: { name: 'fixture' } });
  assert(result.description === 'Base description.', 'applyExportProjection: empty fields preserve base');
  assert(result.projection === 'none', 'applyExportProjection: empty fields → projection: none');
  assert(result.projectionTruncated === false, 'applyExportProjection: empty fields → not truncated');
}

// applyExportProjection — base + projected tail composes
{
  const skill = {
    fm: {
      name: 'fixture',
      relations: {
        boundary: [
          {
            skill: 'observability',
            reason: 'observability owns runtime telemetry; this skill owns static analysis.',
          },
        ],
      },
    },
  };
  const result = applyExportProjection('Base description.', skill);
  assert(
    result.description === 'Base description. Do NOT use for runtime telemetry (use observability).',
    `applyExportProjection: tail composes; got ${JSON.stringify(result.description)}`
  );
  assert(result.projection === 'boundary', 'applyExportProjection: projection: boundary');
}

// applyExportProjection — combined sources stamp 'anti_examples+boundary'
{
  const skill = {
    fm: {
      name: 'fixture',
      anti_examples: ['log API errors (use observability)'],
      relations: {
        boundary: [
          {
            skill: 'documentation',
            reason: 'documentation owns user-facing docs; this skill owns code-level docs.',
          },
        ],
      },
    },
  };
  const result = applyExportProjection('Base.', skill);
  assert(
    result.projection === 'anti_examples+boundary',
    `applyExportProjection: combined sources stamp; got ${JSON.stringify(result.projection)}`
  );
}

// applyExportProjection — dedupes against slugs already named in base
{
  const skill = {
    fm: {
      name: 'fixture',
      relations: {
        boundary: [
          {
            skill: 'observability',
            reason: 'observability owns telemetry; this skill owns X.',
          },
        ],
      },
    },
  };
  const result = applyExportProjection('Base. Do NOT use for logging (use observability).', skill);
  assert(
    result.description === 'Base. Do NOT use for logging (use observability).',
    `applyExportProjection: already-mentioned slug skipped; got ${JSON.stringify(result.description)}`
  );
  assert(result.projection === 'none', 'applyExportProjection: all-deduped → projection: none');
}

// applyExportProjection — truncates at sentence boundary when over 1024
{
  const longTail = Array.from({ length: 20 }, (_v, i) => ({
    skill: `target-${i}`,
    reason: `target-${i} owns a domain numbered ${i}; this skill owns nothing.`,
  }));
  const baseLen = 900;
  const base = 'X'.repeat(baseLen) + '.';
  const skill = { fm: { name: 'fixture', relations: { boundary: longTail } } };
  const result = applyExportProjection(base, skill);
  assert(result.description.length <= MARKETPLACE_DESCRIPTION_LIMIT, 'applyExportProjection: respects 1024 ceiling');
  assert(/\.$/.test(result.description), 'applyExportProjection: truncated at sentence boundary (ends with `.`)');
  assert(result.description.startsWith(base), 'applyExportProjection: base description preserved (no truncation of base)');
  assert(result.projectionTruncated === true, 'applyExportProjection: projectionTruncated flag set');
}

// applyExportProjection — skips entirely when base is at the ceiling
{
  const base = 'X'.repeat(MARKETPLACE_DESCRIPTION_LIMIT - 2) + '.';
  const skill = {
    fm: {
      name: 'fixture',
      relations: {
        boundary: [{ skill: 'foo', reason: 'foo owns bar; this skill owns baz.' }],
      },
    },
  };
  const result = applyExportProjection(base, skill);
  assert(result.description === base, 'applyExportProjection: base preserved when no room for tail');
  assert(result.projection === 'none', 'applyExportProjection: no-room → projection: none');
  assert(result.projectionTruncated === true, 'applyExportProjection: no-room records truncated state');
}

// Idempotence — same input twice yields same output
{
  const skill = {
    fm: {
      name: 'fixture',
      anti_examples: ['do X (use other-skill)'],
      relations: {
        boundary: [{ skill: 'something', reason: 'something owns the X domain; this skill owns Y.' }],
      },
    },
  };
  const r1 = applyExportProjection('Base.', skill);
  const r2 = applyExportProjection('Base.', skill);
  assert(r1.description === r2.description, 'applyExportProjection: pure function (same input → same output)');
  assert(r1.projection === r2.projection, 'applyExportProjection: pure function for projection field');
}

// Corpus-wide invariant: every exported description ≤ 1024 (re-asserted post-projection)
for (const skill of skills) {
  const result = exportDescriptionForSkill(skill);
  assert(
    result.description.length <= MARKETPLACE_DESCRIPTION_LIMIT,
    `${skill.fm.name} exported description (post-projection) is ${result.description.length} chars; exceeds ${MARKETPLACE_DESCRIPTION_LIMIT}`
  );
}

// Live corpus: at least one skill should produce a projection (sanity check that
// the corpus has projectable substrate). If this ever fails, either every skill
// already names every boundary in canonical (good problem) or the projector is
// broken (the kind of regression this assertion exists to catch).
const projectedCount = skills.reduce((n, s) => {
  const r = exportDescriptionForSkill(s);
  return n + (r.projection !== 'none' ? 1 : 0);
}, 0);
assert(
  projectedCount > 0,
  `corpus sanity: at least one skill should produce a projection; got ${projectedCount} of ${skills.length}`
);

// Provenance stamp: when projection runs, marketplace export carries the projection
// kind in metadata.
{
  const projectedSkill = skills.find(s => exportDescriptionForSkill(s).projection !== 'none');
  if (projectedSkill) {
    const exportedText = buildMarketplaceSkillText(projectedSkill);
    const exportedFm = parseFrontmatter(exportedText);
    assert(
      exportedFm.metadata && typeof exportedFm.metadata.skill_graph_export_description_projection === 'string',
      `provenance: projected skill should carry skill_graph_export_description_projection; got ${JSON.stringify(exportedFm.metadata)}`
    );
  }
}

// ---------------------------------------------------------------------------
// Export-time body projection tests — "Skill Graph context" section (added 2026-05-29)
// ---------------------------------------------------------------------------
// renderSkillGraphContext projects the meaningful Skill Metadata Protocol fields
// into a generated, readable Markdown section appended to the exported body.
// The metadata: map is preserved unchanged for round-trip; this section is the
// human/agent-readable view that vendor auto-loaders actually read on activation.
// ---------------------------------------------------------------------------

// relationSlugs — handles Shape A (bare strings) and Shape B (objects), dedupes
{
  assert(relationSlugs(null, 'related').length === 0, 'relationSlugs: null relations → empty');
  assert(relationSlugs({}, 'related').length === 0, 'relationSlugs: missing key → empty');
  const mixed = relationSlugs({ related: ['a', { skill: 'b' }, 'a', { skill: 'b' }] }, 'related');
  assert(JSON.stringify(mixed) === JSON.stringify(['a', 'b']), `relationSlugs: mixed shapes deduped in order; got ${JSON.stringify(mixed)}`);
}

// renderSkillGraphContext — empty frontmatter yields empty section
{
  assert(renderSkillGraphContext(null) === '', 'renderSkillGraphContext: null → empty');
  assert(renderSkillGraphContext({}) === '', 'renderSkillGraphContext: no meaningful fields → empty');
}

// renderSkillGraphContext — classification block renders subject/public/domain/scope
{
  const out = renderSkillGraphContext({
    subject: 'quality-assurance',
    subjects: ['quality-assurance', 'frontend-engineering'],
    public: true,
    taxonomy_domain: 'quality/accessibility',
    scope: 'Teaches accessible interaction patterns.',
  });
  assert(out.startsWith('## Skill Graph context'), 'renderSkillGraphContext: starts with heading');
  assert(out.includes('**Classification**'), 'renderSkillGraphContext: has Classification block');
  assert(out.includes('- Subject: `quality-assurance` (also: `frontend-engineering`)'), `renderSkillGraphContext: subject + secondary; got\n${out}`);
  assert(out.includes('- Public: `true`'), 'renderSkillGraphContext: public rendered');
  assert(out.includes('- Domain: `quality/accessibility`'), 'renderSkillGraphContext: domain rendered');
  assert(out.includes('- Scope: Teaches accessible interaction patterns.'), 'renderSkillGraphContext: scope rendered');
}

// renderSkillGraphContext — relations render with correct labels
{
  const out = renderSkillGraphContext({
    subject: 'backend-engineering',
    relations: {
      depends_on: ['testing-strategy'],
      verify_with: [{ skill: 'debugging' }],
      related: ['refactor'],
      broader: ['quality'],
      narrower: ['unit-testing'],
      disjoint_with: ['observability'],
    },
  });
  assert(out.includes('**Related skills**'), 'renderSkillGraphContext: Related skills block present');
  assert(out.includes('- Depends on: `testing-strategy`'), 'renderSkillGraphContext: depends_on labeled');
  assert(out.includes('- Verify with: `debugging`'), 'renderSkillGraphContext: verify_with labeled (Shape B)');
  assert(out.includes('- Related: `refactor`'), 'renderSkillGraphContext: related labeled');
  assert(out.includes('- Broader: `quality`'), 'renderSkillGraphContext: broader labeled');
  assert(out.includes('- Narrower: `unit-testing`'), 'renderSkillGraphContext: narrower labeled');
  assert(out.includes('- Distinct from: `observability`'), 'renderSkillGraphContext: disjoint_with labeled');
}

// renderSkillGraphContext — Understanding fields render in the Concept block
{
  const out = renderSkillGraphContext({
    subject: 'reasoning-strategy',
    mental_model: 'A skill is a typed knowledge object.',
    purpose: 'Make relevance explicit.',
    boundary: 'Not a runtime.',
    analogy: 'A type system for skills.',
    misconception: 'That metadata is always read.',
  });
  assert(out.includes('**Concept**'), 'renderSkillGraphContext: Concept block present');
  assert(out.includes('- Mental model: A skill is a typed knowledge object.'), 'renderSkillGraphContext: mental_model rendered');
  assert(out.includes('- Common misconception: That metadata is always read.'), 'renderSkillGraphContext: misconception rendered');
}

// renderSkillGraphContext — maintenance state is NEVER projected into the body.
// Audit verdicts, eval status, lifecycle, and provenance are bookkeeping for the
// audit loop, not guidance for an agent USING the skill, and a vendor loader
// feeds this body straight to the model. Keywords (an activation signal) ARE kept.
{
  const out = renderSkillGraphContext({
    subject: 'agent-ops',
    stability: 'experimental',
    eval_state: 'passing',
    eval_score: 4,
    routing_eval: 'present',
    structural_verdict: 'PASS',
    truth_verdict: 'PASS',
    comprehension_verdict: 'UNVERIFIED',
    application_verdict: 'UNVERIFIED',
    freshness: '2026-05-29',
    last_audited: '2026-05-29',
    version: '1.0.0',
    schema_version: '8',
    owner: 'skill-graph-maintainer',
    keywords: ['routing', 'graph'],
  });
  // maintenance / provenance must NOT reach the agent-facing body
  assert(!out.includes('Eval state'), 'renderSkillGraphContext: eval state omitted');
  assert(!out.includes('Audit status'), 'renderSkillGraphContext: audit verdicts omitted');
  assert(!out.includes('Lifecycle'), 'renderSkillGraphContext: lifecycle omitted');
  assert(!out.includes('Provenance'), 'renderSkillGraphContext: provenance omitted');
  assert(!out.includes('schema v8'), 'renderSkillGraphContext: schema/version provenance omitted');
  assert(!out.includes('Last audited'), 'renderSkillGraphContext: last_audited omitted');
  assert(!out.includes('Routing eval'), 'renderSkillGraphContext: routing_eval omitted');
  // keywords (an activation signal) ARE kept, under their own heading
  assert(out.includes('**Keywords**'), 'renderSkillGraphContext: keywords heading present');
  assert(out.includes('- `routing`, `graph`'), 'renderSkillGraphContext: keywords rendered');
}

// renderSkillGraphContext — output contains NO markdown links (would create dangling-link findings)
{
  const out = renderSkillGraphContext({
    subject: 'backend-engineering',
    scope: 'x',
    relations: { related: ['a', 'b'], depends_on: ['c'] },
    keywords: ['k1', 'k2'],
  });
  assert(!/\]\(/.test(out), 'renderSkillGraphContext: emits no markdown links (slugs are code spans)');
}

// renderSkillGraphContext — deterministic (pure function)
{
  const fm = {
    subject: 'data-engineering',
    deployment_target: 'portable',
    scope: 'one\ntwo  three',
    relations: { related: ['x'] },
    keywords: ['a'],
  };
  assert(renderSkillGraphContext(fm) === renderSkillGraphContext(fm), 'renderSkillGraphContext: same input → same output');
  // free-text newlines collapse to single spaces
  assert(renderSkillGraphContext(fm).includes('- Scope: one two three'), 'renderSkillGraphContext: multiline scope collapsed to one line');
}

// Live corpus: every exported skill body carries the generated section, and no
// generated section introduces a markdown link.
{
  const sectionCount = skills.reduce((n, s) => {
    const exported = buildMarketplaceSkillText(s);
    const hasSection = exported.includes('## Skill Graph context');
    return n + (hasSection ? 1 : 0);
  }, 0);
  assert(
    sectionCount === skills.length,
    `corpus: every exported skill should carry a Skill Graph context section; got ${sectionCount} of ${skills.length}`
  );
}

process.stdout.write('PASS test-marketplace-export: marketplace export gates covered\n');
