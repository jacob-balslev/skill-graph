#!/usr/bin/env node
/**
 * Test: the audit-state sidecar read boundary (ADR-0019 Phase 4 — confirm-only guards).
 *
 * The sidecar is SYSTEM/audit output. Three consumers must NEVER read it:
 *   - scripts/export-marketplace-skills.js — exports plain Agent-Skills frontmatter; the
 *     sidecar is never exported.
 *   - scripts/lib/render-skill-context.js  — renders the agent-facing context from
 *     frontmatter only.
 *   - scripts/skill-graph-route.js         — reads verdicts / eval_state / lifecycle ONLY
 *     via the compiled manifest (where generate-manifest.js already joined the sidecar),
 *     never from SKILL.md or audit-state.json directly.
 *
 * These guards lock that contract: a source-level check that none of the three imports or
 * reads the sidecar, plus behavioral checks that render is a pure function of frontmatter
 * and the router gates on manifest `health` entries (not disk).
 */

'use strict';

const fs = require('fs');
const path = require('path');

const { renderSkillGraphContext } = require('../lib/render-skill-context');
const { routeSkills } = require('../skill-graph-route');

let failures = 0;
function assert(condition, msg) {
  if (condition) process.stdout.write(`  PASS  ${msg}\n`);
  else { process.stderr.write(`  FAIL  ${msg}\n`); failures += 1; }
}

const REPO = path.resolve(__dirname, '..', '..');

// ---------------------------------------------------------------------------
// 1. Source-level lock: none of the three consumers reads the sidecar.
// ---------------------------------------------------------------------------
const SIDECAR_READ_PATTERNS = [/audit-state\.json/, /readSidecar/, /audit-state-sidecar/];
for (const rel of [
  'scripts/export-marketplace-skills.js',
  'scripts/lib/render-skill-context.js',
  'scripts/skill-graph-route.js',
]) {
  const src = fs.readFileSync(path.join(REPO, rel), 'utf8');
  const hit = SIDECAR_READ_PATTERNS.find((re) => re.test(src));
  assert(!hit, `${rel} does not read the audit-state sidecar${hit ? ` (found ${hit})` : ''}`);
}

// ---------------------------------------------------------------------------
// 2. render-skill-context is a PURE function of frontmatter (no sidecar, no IO).
// ---------------------------------------------------------------------------
{
  const fm = {
    relations: { related: ['sibling-skill'], boundary: [{ skill: 'other-skill', reason: 'I own X over other-skill' }] },
    grounding: { truth_sources: [{ path: 'docs/x.md' }] },
  };
  const out1 = renderSkillGraphContext(fm);
  const out2 = renderSkillGraphContext(fm);
  assert(typeof out1 === 'string' && out1 === out2, 'render: deterministic pure function of its frontmatter arg');
  assert(renderSkillGraphContext(null) === '' && renderSkillGraphContext(undefined) === '',
    'render: returns empty for a missing frontmatter (no disk/sidecar fallback)');

  // Audit-state fields injected into the frontmatter object are NOT surfaced — render reads
  // relations/grounding/understanding, not the moved audit verdicts.
  const withAudit = { ...fm, structural_verdict: 'PASS', comprehension_verdict: 'SHALLOW', eval_state: 'passing' };
  const outAudit = renderSkillGraphContext(withAudit);
  assert(!/SHALLOW/.test(outAudit) && !/structural_verdict/.test(outAudit),
    'render: never surfaces audit-state verdict values even if present on the object');
}

// ---------------------------------------------------------------------------
// 3. skill-graph-route gates on the MANIFEST `health` block, not the sidecar/SKILL.md.
//    Synthetic in-memory manifest with NO files on disk — if the router read SKILL.md or
//    the sidecar it could not produce these decisions.
// ---------------------------------------------------------------------------
function synthSkill(name, structuralVerdict) {
  return {
    name,
    description: `alpha routing fixture ${name}`,
    subject: 'backend-engineering',
    deployment_target: 'portable',
    // Manifest entries nest activation signals under `activation` (what scoreSkill reads).
    activation: { triggers: ['alpha'], keywords: ['alpha'] },
    health: {
      structural_verdict: structuralVerdict,
      truth_verdict: 'PASS',
      comprehension_verdict: 'UNVERIFIED',
      eval_state: 'unverified',
    },
  };
}

const opts = { query: 'alpha', project: undefined, maxResults: 10, minEvalState: undefined, pathArg: null, todayISO: '2026-06-01' };

{
  const manifestFail = { skills: [synthSkill('alpha-good', 'PASS'), synthSkill('alpha-broken', 'FAIL')] };
  const r = routeSkills(manifestFail, opts);
  const brokenExcluded = r.excluded.find((e) => e.skill.name === 'alpha-broken');
  assert(brokenExcluded && brokenExcluded.role === 'integrity_excluded' && /structural_verdict=FAIL/.test(brokenExcluded.reason),
    'route: a manifest health.structural_verdict=FAIL is integrity-excluded (gate reads the manifest)');
  const goodRouted = [...r.selected, ...r.coLoaded].some((e) => e.skill.name === 'alpha-good');
  assert(goodRouted, 'route: the PASS skill from the same manifest is routed');
}

{
  // Flip the verdict in the MANIFEST → the same skill is no longer excluded. Proves the
  // manifest entry is the verdict source of truth (the sidecar join landed here).
  const manifestPass = { skills: [synthSkill('alpha-broken', 'PASS')] };
  const r = routeSkills(manifestPass, opts);
  const excluded = r.excluded.find((e) => e.skill.name === 'alpha-broken');
  assert(!excluded, 'route: flipping the manifest verdict to PASS removes the exclusion (manifest is the source)');
}

if (failures > 0) {
  process.stderr.write(`\ntest-sidecar-read-boundary: ${failures} assertion(s) FAILED\n`);
  process.exit(1);
}
process.stdout.write('\nPASS test-sidecar-read-boundary: export/render read frontmatter only, router gates on the manifest — none read the sidecar\n');
