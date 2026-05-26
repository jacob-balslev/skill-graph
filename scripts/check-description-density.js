#!/usr/bin/env node
/**
 * check-description-density — scores SKILL.md descriptions on the first-250-char
 * window per claude-code #40121 / #44780 (the silent auto-invocation cap).
 *
 * Why this exists
 * ---------------
 * Anthropic's Skill Metadata Protocol allows description up to 1024 chars. But
 * Claude Code v2.1.86+ imposed an undocumented 250-character display cap on
 * the `/skills` system reminder listing. Characters 251-1024 are silently
 * invisible to auto-invocation (verified: GH issue #40121, #44780). A skill
 * whose disambiguation ("Use when" / "Do NOT use") or trigger keywords land
 * past char 250 has invisible routing signal — it will not auto-fire even
 * when it should.
 *
 * This script does NOT shorten descriptions. It SURFACES which descriptions
 * have invisible signal so the human / loop can move the load-bearing phrases
 * into the first 250 chars.
 *
 * Output
 * ------
 *   {
 *     "skill": "...",
 *     "description_length": 850,
 *     "first_250_chars": "...",
 *     "density_score": 72,
 *     "signals": { ... boolean / counts ... },
 *     "past_window_findings": { ... arrays of phrases past 250 ... },
 *     "recommendations": [ ... actionable strings ... ]
 *   }
 *
 * Density score (0-100):
 *   +25 positive_trigger_in_window     ("Use when ..." in first 250)
 *   +25 negative_boundary_in_window    ("Do NOT use ..." in first 250)
 *   +30 keywords_in_window             (≥1 keyword from keywords[] in first 250; +6/kw up to +30)
 *   +10 gerund_form_name               (skill name ends in -ing or is action-verb form)
 *   +10 full_visibility                (description ≤ 250 chars — whole desc visible)
 *
 * Deductions (capped, never below 0):
 *   -10 per positive trigger phrase that landed past char 250
 *   -10 per negative boundary phrase that landed past char 250
 *   -3 per declared keyword that appears ONLY past char 250
 *
 * Usage
 *   node scripts/check-description-density.js                       # all skills, pretty
 *   node scripts/check-description-density.js --json                # all skills, JSON
 *   node scripts/check-description-density.js --skill methodical    # single skill
 *   node scripts/check-description-density.js --summary             # corpus-mean only
 *   node scripts/check-description-density.js --threshold 60        # exit 1 if any < 60
 *
 * Exit 0 if all skills meet threshold; 1 otherwise (or on usage/load error).
 */

'use strict';

const fs = require('fs');
const { parseFrontmatter, normalizeFrontmatter } = require('./lib/parse-frontmatter');
const { collectSkillFiles } = require('./lib/roots');

const WINDOW = 250;

// Trigger phrase patterns. Case-insensitive. The phrase must be SEPARATELY
// detectable from the surrounding prose — we look for a small set of canonical
// markers, not free-form prose interpretation.
const POSITIVE_TRIGGERS = [
  /\buse when\b/i,
  /\btrigger when\b/i,
  /\btrigger:/i,                // claude-api skill convention: "TRIGGER when ..."
  /\bactivate when\b/i,
  /\buse this skill\b/i,
  /\bapply when\b/i,
  /\bapplies to\b/i,
  /\binvoke when\b/i,
];

const NEGATIVE_BOUNDARIES = [
  /\bdo not use\b/i,
  /\bdon't use\b/i,
  /\bskip when\b/i,
  /\bskip:/i,                   // claude-api skill convention: "SKIP: ..."
  /\bdo not apply\b/i,
  /\bnot for\b/i,
  /\bexclude when\b/i,
  /\bdo not invoke\b/i,
  /\bnot:/i,                    // "Not: ..." disambiguation pattern
];

// Gerund detection: skill name ends with -ing (`processing-pdfs`, `analyzing-spreadsheets`)
// OR the name is a clearly action-verb form (verb + noun pattern). We accept both
// per Anthropic best-practices (gerund preferred, noun-phrase acceptable).
function isGerundForm(name) {
  if (!name) return false;
  const head = String(name).split('-')[0]; // head noun / head verb
  return /ing$/i.test(head);
}

function findMatches(text, patterns) {
  const hits = [];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) hits.push({ phrase: m[0], index: m.index });
  }
  return hits;
}

function scoreSkill(frontmatter) {
  const description = String(frontmatter.description || '');
  const name = String(frontmatter.name || '');
  const keywords = Array.isArray(frontmatter.keywords) ? frontmatter.keywords.map(String) : [];

  const descriptionLength = description.length;
  const firstWindow = description.slice(0, WINDOW);
  const restWindow = description.slice(WINDOW);

  const positiveInWindow = findMatches(firstWindow, POSITIVE_TRIGGERS);
  const positivePastWindow = findMatches(restWindow, POSITIVE_TRIGGERS);
  const negativeInWindow = findMatches(firstWindow, NEGATIVE_BOUNDARIES);
  const negativePastWindow = findMatches(restWindow, NEGATIVE_BOUNDARIES);

  // Keyword presence per window. A keyword is "in window" if it appears anywhere
  // in the first 250 chars; "only past window" if it appears in the rest but
  // not the first 250. We lowercase both sides for the comparison.
  const lowerFirst = firstWindow.toLowerCase();
  const lowerRest = restWindow.toLowerCase();
  const keywordsInWindow = [];
  const keywordsOnlyPastWindow = [];
  for (const kw of keywords) {
    const lowerKw = kw.toLowerCase();
    const inFirst = lowerFirst.includes(lowerKw);
    const inRest = lowerRest.includes(lowerKw);
    if (inFirst) keywordsInWindow.push(kw);
    else if (inRest) keywordsOnlyPastWindow.push(kw);
  }

  const gerundForm = isGerundForm(name);
  const fullVisibility = descriptionLength <= WINDOW;

  // Composite score
  let score = 0;
  if (positiveInWindow.length > 0) score += 25;
  if (negativeInWindow.length > 0) score += 25;
  // Keyword window credit: +6 per in-window keyword up to 5 (caps at +30).
  score += Math.min(keywordsInWindow.length * 6, 30);
  if (gerundForm) score += 10;
  if (fullVisibility) score += 10;

  // Deductions
  score -= positivePastWindow.length * 10;
  score -= negativePastWindow.length * 10;
  score -= keywordsOnlyPastWindow.length * 3;

  score = Math.max(0, Math.min(100, score));

  const recommendations = [];
  if (descriptionLength > WINDOW && positiveInWindow.length === 0 && positivePastWindow.length > 0) {
    recommendations.push(
      `description is ${descriptionLength} chars; positive trigger "${positivePastWindow[0].phrase}" lands past char ${WINDOW} — invisible to /skills auto-invocation (#40121). Move it into the first ${WINDOW} chars.`,
    );
  }
  if (descriptionLength > WINDOW && negativeInWindow.length === 0 && negativePastWindow.length > 0) {
    recommendations.push(
      `description is ${descriptionLength} chars; negative boundary "${negativePastWindow[0].phrase}" lands past char ${WINDOW} — invisible to /skills auto-invocation. Move it into the first ${WINDOW} chars.`,
    );
  }
  if (descriptionLength > WINDOW && positiveInWindow.length === 0 && positivePastWindow.length === 0) {
    recommendations.push(
      `description has no detectable "Use when" / "Trigger when" phrase. Add an explicit positive trigger in the first ${WINDOW} chars.`,
    );
  }
  if (descriptionLength > WINDOW && negativeInWindow.length === 0 && negativePastWindow.length === 0) {
    recommendations.push(
      `description has no detectable "Do NOT use" / "Skip" boundary. Add an explicit negative boundary in the first ${WINDOW} chars to disambiguate from sibling skills.`,
    );
  }
  for (const kw of keywordsOnlyPastWindow) {
    recommendations.push(
      `keyword "${kw}" appears only past char ${WINDOW} — invisible to auto-invocation. Move into first ${WINDOW} chars or drop from keywords[].`,
    );
  }
  if (!gerundForm && descriptionLength > 0) {
    recommendations.push(
      `name "${name}" is not in gerund form (per Anthropic best-practice). Consider verb-ing naming (e.g., "processing-pdfs" over "pdf-processor"). Non-blocking.`,
    );
  }

  return {
    description_length: descriptionLength,
    first_250_chars: firstWindow,
    density_score: score,
    signals: {
      positive_trigger_in_window: positiveInWindow.length > 0,
      negative_boundary_in_window: negativeInWindow.length > 0,
      keywords_in_window: keywordsInWindow.length,
      gerund_form_name: gerundForm,
      full_visibility: fullVisibility,
    },
    past_window_findings: {
      positive_triggers_past_250: positivePastWindow.map((m) => m.phrase),
      negative_boundaries_past_250: negativePastWindow.map((m) => m.phrase),
      keywords_past_250: keywordsOnlyPastWindow,
    },
    recommendations,
  };
}

function parseArgs(argv) {
  const args = { skill: null, json: false, summary: false, threshold: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--skill') args.skill = argv[++i];
    else if (a === '--json') args.json = true;
    else if (a === '--summary') args.summary = true;
    else if (a === '--threshold') args.threshold = Number(argv[++i]);
    else if (a === '--help' || a === '-h') args.help = true;
  }
  return args;
}

function printHelp() {
  process.stdout.write(`check-description-density — scores SKILL.md descriptions on the 250-char window.

Usage:
  node scripts/check-description-density.js                       # all skills, pretty
  node scripts/check-description-density.js --json                # all skills, JSON
  node scripts/check-description-density.js --skill <name>        # single skill
  node scripts/check-description-density.js --summary             # corpus-mean only
  node scripts/check-description-density.js --threshold <N>       # exit 1 if any < N

Per claude-code #40121 / #44780: descriptions beyond char 250 are silently invisible
to the /skills auto-invocation listing. This tool surfaces which signal is past the cap.
`);
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    printHelp();
    process.exit(0);
  }

  const files = collectSkillFiles();
  if (files.length === 0) {
    process.stderr.write('check-description-density: no SKILL.md files found under configured skill_roots\n');
    process.exit(1);
  }

  const results = [];
  for (const { filePath } of files) {
    let text;
    try {
      text = fs.readFileSync(filePath, 'utf8');
    } catch (e) {
      process.stderr.write(`check-description-density: cannot read ${filePath}: ${e.message}\n`);
      continue;
    }
    const fm = normalizeFrontmatter(parseFrontmatter(text));
    if (!fm) continue;
    if (args.skill && fm.name !== args.skill) continue;

    const score = scoreSkill(fm);
    results.push({ skill: fm.name, path: filePath, ...score });
  }

  if (results.length === 0 && args.skill) {
    process.stderr.write(`check-description-density: no skill named "${args.skill}" found\n`);
    process.exit(1);
  }

  // Summary stats
  const scores = results.map((r) => r.density_score);
  const mean = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const below250 = results.filter((r) => r.description_length <= WINDOW).length;
  const missingPositive = results.filter((r) => !r.signals.positive_trigger_in_window).length;
  const missingNegative = results.filter((r) => !r.signals.negative_boundary_in_window).length;
  const signalPastWindow = results.filter(
    (r) =>
      r.past_window_findings.positive_triggers_past_250.length > 0 ||
      r.past_window_findings.negative_boundaries_past_250.length > 0 ||
      r.past_window_findings.keywords_past_250.length > 0,
  ).length;

  const summary = {
    total_skills: results.length,
    mean_density_score: Math.round(mean * 10) / 10,
    skills_below_250_chars: below250,
    skills_missing_positive_trigger_in_window: missingPositive,
    skills_missing_negative_boundary_in_window: missingNegative,
    skills_with_signal_past_window: signalPastWindow,
  };

  if (args.json) {
    process.stdout.write(JSON.stringify({ summary, results }, null, 2) + '\n');
  } else if (args.summary) {
    process.stdout.write('Description Density Summary\n');
    process.stdout.write('===========================\n');
    for (const [k, v] of Object.entries(summary)) {
      process.stdout.write(`  ${k}: ${v}\n`);
    }
  } else {
    process.stdout.write('Skill                                  Score  Len   Pos  Neg  KW   Past?  Recs\n');
    process.stdout.write('-------------------------------------- -----  ----  ---  ---  ---  -----  ----\n');
    for (const r of results.sort((a, b) => a.density_score - b.density_score)) {
      const past =
        r.past_window_findings.positive_triggers_past_250.length +
        r.past_window_findings.negative_boundaries_past_250.length +
        r.past_window_findings.keywords_past_250.length;
      process.stdout.write(
        `${(r.skill || '').padEnd(38).slice(0, 38)} ${String(r.density_score).padStart(5)}  ${String(r.description_length).padStart(4)}  ${r.signals.positive_trigger_in_window ? ' Y ' : ' . '}  ${r.signals.negative_boundary_in_window ? ' Y ' : ' . '}  ${String(r.signals.keywords_in_window).padStart(3)}  ${String(past).padStart(5)}  ${r.recommendations.length}\n`,
      );
    }
    process.stdout.write('\n');
    for (const [k, v] of Object.entries(summary)) {
      process.stdout.write(`${k}: ${v}\n`);
    }
  }

  if (args.threshold !== null) {
    const failed = results.filter((r) => r.density_score < args.threshold);
    if (failed.length > 0) {
      process.stderr.write(
        `\ncheck-description-density: ${failed.length} skills below threshold ${args.threshold}\n`,
      );
      process.exit(1);
    }
  }
  process.exit(0);
}

if (require.main === module) main();

module.exports = { scoreSkill, WINDOW, POSITIVE_TRIGGERS, NEGATIVE_BOUNDARIES };
