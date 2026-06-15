#!/usr/bin/env node
/**
 * Regression tests for `skill-graph render` (scripts/render-skills.js).
 *
 * Requires the canonical skills library (sibling ../skills/skills or configured
 * via .skill-graph/config.json). Skips gracefully when absent (CI checking out
 * only the tooling repo).
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { workspaceRoot, loadWorkspaceConfig, resolveSkillRoots } = require('../lib/roots');
const { collectAllSkills, expectedFiles, buildRenderedSkillText } = require('../render-skills');
const { renderSkillGraphContext } = require('../lib/render-skill-context');
const { parseFrontmatter } = require('../lib/parse-frontmatter');

function fail(msg) { process.stderr.write(`FAIL test-render-skills: ${msg}\n`); process.exit(1); }
function assert(c, msg) { if (!c) fail(msg); }

const _root = workspaceRoot();
const _skillRoots = resolveSkillRoots(_root, loadWorkspaceConfig(_root));
const _sourceDir = _skillRoots[0] && _skillRoots[0].absPath;
if (!_sourceDir || !fs.existsSync(_sourceDir)) {
  process.stdout.write(`SKIP test-render-skills: canonical skills library not found — skipping\n`);
  process.exit(0);
}

// --- shared renderer: guidance-only body, never maintenance state ------------
// There is ONE render shape. The body carries agent-facing guidance only;
// maintenance state (audit verdicts, eval status, lifecycle, provenance) is
// never projected, because a vendor loader feeds this body straight to the model.
{
  const fm = {
    subject: 'agent-ops',
    deployment_target: 'portable',
    scope: 'x',
    relations: { depends_on: ['a'], boundary: [{ skill: 'b', reason: 'b owns the X domain; this owns Y.' }] },
    keywords: ['k1'],
    comprehension_verdict: 'SHALLOW',
    structural_verdict: 'PASS',
    eval_state: 'passing',
    eval_score: 4,
    stability: 'experimental',
    freshness: '2026-05-29',
    last_audited: '2026-05-29',
    version: '1.0.0',
    schema_version: 8,
    owner: 'x',
  };
  const out = renderSkillGraphContext(fm);
  // behavioral guidance IS projected
  assert(out.includes('Depends on: `a`'), 'keeps behavioral relations');
  assert(out.includes('**Keywords**'), 'keeps keywords (activation signal)');

  // Concept/Understanding: the canonical `concept_boundary` field MUST reach the body.
  // Regression guard for the projector reading the deprecated `boundary` (ADR-0018 rename);
  // since the normalizer deletes top-level `boundary`, reading it projected nothing.
  {
    const canon = renderSkillGraphContext({ concept_boundary: 'NOT a CB lookup table' });
    assert(canon.includes('Boundary: NOT a CB lookup table'),
      'render: canonical `concept_boundary` Understanding field is projected into the Concept block');
    // The deprecated top-level `boundary` alias still projects for a non-normalized caller.
    const legacy = renderSkillGraphContext({ boundary: 'legacy boundary prose' });
    assert(legacy.includes('Boundary: legacy boundary prose'),
      'render: deprecated `boundary` alias still projects (back-compat for non-normalized input)');
  }
  // maintenance state is NEVER projected into the agent-facing body
  assert(!out.includes('Audit status'), 'omits audit verdicts');
  assert(!out.includes('Lifecycle'), 'omits lifecycle block');
  assert(!out.includes('Eval state'), 'omits eval state');
  assert(!out.includes('Provenance'), 'omits provenance block');
  assert(!out.includes('SHALLOW'), 'no verdict value leaks into the body');
  assert(out.includes('skill-graph-context:start') && out.includes('skill-graph-context:end'), 'paired fence markers present');
  // determinism
  assert(renderSkillGraphContext(fm) === out, 'renderSkillGraphContext is pure');
}

// --- render includes EVERY skill, including project-scoped (no publication gate) ---
{
  const skills = collectAllSkills();
  assert(skills.length > 0, 'collectAllSkills discovers skills');

  // The marketplace export gates out private/project-anchored skills; render must NOT.
  const projectScoped = skills.filter(s =>
    s.fm.public === false ||
    (Array.isArray(s.fm.project) && s.fm.project.length > 0) ||
    s.fm.deployment_target === 'project'
  );
  // If the corpus has any project-scoped skills, they must appear in render output.
  const { files } = expectedFiles(path.join(_root, 'dist', 'skills'));
  for (const s of projectScoped) {
    const present = [...files.keys()].some(f => f.endsWith(`/${s.fm.name}/SKILL.md`) || f.includes(`/${s.fm.name}/`));
    assert(present, `render must include project-scoped skill ${s.fm.name} (marketplace excludes it)`);
  }

  // Every rendered file carries the context section and introduces no markdown links in it.
  let withSection = 0;
  for (const [, text] of files) {
    if (text.includes('## Skill Graph context')) withSection++;
    const ctx = text.split('## Skill Graph context')[1] || '';
    assert(!/\]\(/.test(ctx), 'rendered Skill Graph context section emits no markdown links');
    const fm = parseFrontmatter(text);
    assert(fm && typeof fm.name === 'string' && fm.name.length > 0, 'rendered skill has a name');
  }
  assert(withSection === files.size, `every rendered skill carries the context section (${withSection}/${files.size})`);

  // buildRenderedSkillText is deterministic for a given skill.
  const sample = skills[0];
  assert(
    buildRenderedSkillText(sample) === buildRenderedSkillText(sample),
    'buildRenderedSkillText is deterministic'
  );
}

process.stdout.write('PASS test-render-skills: render command + shared renderer covered\n');
