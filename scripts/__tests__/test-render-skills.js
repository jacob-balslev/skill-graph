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

// --- shared renderer: profile behavior (no library needed) -------------------
{
  const fm = {
    subject: 'agent-ops',
    deployment_target: 'portable',
    scope: 'x',
    relations: { depends_on: ['a'], boundary: [{ skill: 'b', reason: 'b owns the X domain; this owns Y.' }] },
    application_verdict: 'UNVERIFIED',
    stability: 'experimental',
    keywords: ['k1'],
  };
  const full = renderSkillGraphContext(fm, { profile: 'full' });
  const runtime = renderSkillGraphContext(fm, { profile: 'runtime' });
  assert(full.includes('Audit status'), 'full profile includes audit status');
  assert(!runtime.includes('Audit status'), 'runtime profile omits audit status');
  assert(!runtime.includes('Lifecycle'), 'runtime profile omits lifecycle block');
  assert(runtime.includes('Depends on: `a`'), 'runtime profile keeps behavioral relations');
  assert(full.includes('skill-graph-context:start') && full.includes('skill-graph-context:end'), 'paired fence markers present');
  // determinism
  assert(renderSkillGraphContext(fm, { profile: 'full' }) === full, 'renderSkillGraphContext is pure (full)');
}

// --- render includes EVERY skill, including project-scoped (no publication gate) ---
{
  const skills = collectAllSkills();
  assert(skills.length > 0, 'collectAllSkills discovers skills');

  // The marketplace export gates out deployment_target: project skills; render must NOT.
  const projectScoped = skills.filter(s => s.fm.deployment_target === 'project');
  // If the corpus has any project-scoped skills, they must appear in render output.
  const { files } = expectedFiles(path.join(_root, 'dist', 'skills'), 'full');
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
    buildRenderedSkillText(sample, 'full') === buildRenderedSkillText(sample, 'full'),
    'buildRenderedSkillText is deterministic'
  );
}

process.stdout.write('PASS test-render-skills: render command + shared renderer covered\n');
