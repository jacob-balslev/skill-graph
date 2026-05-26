#!/usr/bin/env node
/**
 * check-triggerability — binary pre-gate per SkillReducer (arxiv 2603.29919):
 * "10.7% of skills in production don't trigger on their own ground-truth
 * scenarios at all."
 *
 * Why this exists
 * ---------------
 * A skill's `description` is a routing contract. If the router doesn't activate
 * the skill on its OWN positive examples, scoring that skill on any other
 * dimension is noise — it's not certifiable until it can fire at all. This
 * check is binary: triggerable (≥1 of N examples routes to the skill at top-1)
 * or not.
 *
 * Per ChatGPT-proposed loop / SkillReducer empirical finding: skills that
 * fail this gate should go to "fix description or retire," never into the
 * weighted score.
 *
 * Method
 * ------
 * For each skill in the manifest:
 *   1. Take up to 3 examples from `activation.examples` (the skill's authored
 *      positive scenarios).
 *   2. If 0 examples authored, the skill is `triggerable: UNKNOWN` (cannot
 *      score; recommend authoring examples).
 *   3. For each example, call `routeSkills()` with default options and check
 *      whether `selected[0].skill.name === this.skill.name`.
 *   4. Report hit-rate, top-1 hits, top-3 hits.
 *
 * Output JSON shape:
 *   {
 *     "skill": "...",
 *     "triggerable": true | false | null,    // null = UNKNOWN (no examples)
 *     "total_scenarios": 3,
 *     "top1_hits": 2,
 *     "top3_hits": 3,
 *     "hit_rate_top1": 0.67,
 *     "failures": [{ scenario, top1, top3 }, ...]
 *   }
 *
 * Usage
 *   node scripts/check-triggerability.js                       # all skills, pretty
 *   node scripts/check-triggerability.js --json                # all skills, JSON
 *   node scripts/check-triggerability.js --skill <name>        # single skill
 *   node scripts/check-triggerability.js --summary             # corpus-mean only
 *   node scripts/check-triggerability.js --max-scenarios 3     # cap per skill (default 3)
 *
 * Exit 0 on success; 1 if any FAIL outcome exists (or on usage/load error).
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { workspaceRoot } = require('./lib/roots');
const { routeSkills } = require('./skill-graph-route');

const DEFAULT_MAX_SCENARIOS = 3;
const DEFAULT_MAX_ROUTE_RESULTS = 5;

function parseArgs(argv) {
  const args = {
    skill: null,
    json: false,
    summary: false,
    maxScenarios: DEFAULT_MAX_SCENARIOS,
    manifest: null,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--skill') args.skill = argv[++i];
    else if (a === '--json') args.json = true;
    else if (a === '--summary') args.summary = true;
    else if (a === '--max-scenarios') args.maxScenarios = parseInt(argv[++i], 10);
    else if (a === '--manifest') args.manifest = argv[++i];
    else if (a === '--help' || a === '-h') args.help = true;
  }
  return args;
}

function printHelp() {
  process.stdout.write(`check-triggerability — binary pre-gate: does each skill fire on its own positives?

Usage:
  node scripts/check-triggerability.js                       # all skills, pretty
  node scripts/check-triggerability.js --json                # all skills, JSON
  node scripts/check-triggerability.js --skill <name>        # single skill
  node scripts/check-triggerability.js --summary             # corpus-mean only
  node scripts/check-triggerability.js --max-scenarios <N>   # default 3
  node scripts/check-triggerability.js --manifest <path>     # custom manifest

Per SkillReducer (arxiv 2603.29919): 10.7% of skills don't trigger on their own
authored examples. Skills that fail this gate are uncertifiable until their
description or keywords are fixed — they should be excluded from weighted scoring.
`);
}

function loadManifest(explicitPath) {
  const root = workspaceRoot();
  const candidates = [];
  if (explicitPath) candidates.push(path.resolve(explicitPath));
  candidates.push(path.join(root, 'skills.manifest.json'));
  candidates.push(path.join(root, '.skill-graph', '_routing-eval.manifest.json'));
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      try {
        return { manifest: JSON.parse(fs.readFileSync(p, 'utf8')), path: p };
      } catch (e) {
        process.stderr.write(`check-triggerability: cannot parse ${p}: ${e.message}\n`);
      }
    }
  }
  return null;
}

function checkSkill(skill, manifest, maxScenarios) {
  const examples = (skill.activation && Array.isArray(skill.activation.examples))
    ? skill.activation.examples.slice(0, maxScenarios)
    : [];

  if (examples.length === 0) {
    return {
      skill: skill.name,
      triggerable: null,
      total_scenarios: 0,
      top1_hits: 0,
      top3_hits: 0,
      hit_rate_top1: null,
      hit_rate_top3: null,
      failures: [],
      note: 'no activation.examples authored — UNKNOWN triggerability',
    };
  }

  const failures = [];
  let top1Hits = 0;
  let top3Hits = 0;

  for (const scenario of examples) {
    const result = routeSkills(manifest, {
      query: String(scenario),
      maxResults: DEFAULT_MAX_ROUTE_RESULTS,
    });
    const top = (result.selected || []).slice(0, 3).map((s) => s.skill.name);
    const top1 = top[0] || null;
    const top3 = top.includes(skill.name);
    if (top1 === skill.name) top1Hits++;
    if (top3) top3Hits++;
    if (top1 !== skill.name) {
      failures.push({ scenario, top1, top3_winners: top });
    }
  }

  return {
    skill: skill.name,
    triggerable: top1Hits > 0,
    total_scenarios: examples.length,
    top1_hits: top1Hits,
    top3_hits: top3Hits,
    hit_rate_top1: top1Hits / examples.length,
    hit_rate_top3: top3Hits / examples.length,
    failures,
  };
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    printHelp();
    process.exit(0);
  }

  const loaded = loadManifest(args.manifest);
  if (!loaded) {
    process.stderr.write('check-triggerability: no manifest found. Run `npm run manifest:validate` first.\n');
    process.exit(1);
  }
  const { manifest, path: manifestPath } = loaded;
  const skills = Array.isArray(manifest.skills) ? manifest.skills : [];
  if (skills.length === 0) {
    process.stderr.write(`check-triggerability: manifest at ${manifestPath} contains no skills\n`);
    process.exit(1);
  }

  const results = [];
  for (const skill of skills) {
    if (args.skill && skill.name !== args.skill) continue;
    results.push(checkSkill(skill, manifest, args.maxScenarios));
  }

  if (results.length === 0 && args.skill) {
    process.stderr.write(`check-triggerability: no skill named "${args.skill}" in manifest\n`);
    process.exit(1);
  }

  const totalScored = results.filter((r) => r.triggerable !== null).length;
  const totalFails = results.filter((r) => r.triggerable === false).length;
  const totalUnknown = results.filter((r) => r.triggerable === null).length;
  const totalPass = results.filter((r) => r.triggerable === true).length;
  const summary = {
    manifest_path: manifestPath,
    total_skills: results.length,
    triggerable: totalPass,
    not_triggerable: totalFails,
    unknown_no_examples: totalUnknown,
    fail_rate: totalScored > 0 ? Math.round((totalFails / totalScored) * 1000) / 1000 : null,
    notes: totalUnknown > 0
      ? `${totalUnknown} skills cannot be scored — author activation.examples to enable triggerability check`
      : null,
  };

  if (args.json) {
    process.stdout.write(JSON.stringify({ summary, results }, null, 2) + '\n');
  } else if (args.summary) {
    process.stdout.write('Triggerability Summary\n');
    process.stdout.write('======================\n');
    for (const [k, v] of Object.entries(summary)) {
      if (v !== null) process.stdout.write(`  ${k}: ${v}\n`);
    }
  } else {
    process.stdout.write('Skill                                  Verdict  Scenarios  Top-1  Top-3\n');
    process.stdout.write('-------------------------------------- -------  ---------  -----  -----\n');
    const sorted = results.slice().sort((a, b) => {
      const av = a.triggerable === null ? 2 : a.triggerable ? 0 : 1;
      const bv = b.triggerable === null ? 2 : b.triggerable ? 0 : 1;
      return av - bv || (a.hit_rate_top1 || 0) - (b.hit_rate_top1 || 0);
    });
    for (const r of sorted) {
      const verdict =
        r.triggerable === null ? 'UNKNOWN' : r.triggerable ? '  PASS ' : '  FAIL ';
      process.stdout.write(
        `${(r.skill || '').padEnd(38).slice(0, 38)} ${verdict}  ${String(r.total_scenarios).padStart(9)}  ${String(r.top1_hits).padStart(5)}  ${String(r.top3_hits).padStart(5)}\n`,
      );
    }
    process.stdout.write('\n');
    for (const [k, v] of Object.entries(summary)) {
      if (v !== null) process.stdout.write(`${k}: ${v}\n`);
    }
  }

  process.exit(totalFails > 0 ? 1 : 0);
}

if (require.main === module) main();

module.exports = { checkSkill, loadManifest };
