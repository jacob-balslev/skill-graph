#!/usr/bin/env node
/**
 * mock-grader.js — deterministic stand-in for an external grader CLI.
 *
 * Use this to smoke-test `scripts/skill-audit.js --graded` without an API
 * key. It reads the composed prompt from stdin, pattern-matches the
 * dimension id, and prints a canned <verdict>…</verdict> block on stdout
 * that the audit runner can parse and merge into the artifact files.
 *
 * Usage (from the repo root):
 *   node scripts/skill-audit.js documentation \
 *        --graded \
 *        --grader-cli "node scripts/lib/mock-grader.js" \
 *        --force
 *
 * Self-contained — only Node built-ins. Exit 0 on success, 1 on error.
 */

'use strict';

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end',  () => resolve(data));
    process.stdin.on('error', reject);
  });
}

function extractDimensionId(prompt) {
  const m = prompt.match(/<dimension id="([a-z]+)"/);
  return m ? m[1] : 'unknown';
}

// Canned per-dimension verdicts. Intentionally varied so the merged artifacts
// show all four verdict states (PASS, PASS WITH FIXES, FAIL, N/A) and all five
// severity levels. These are NOT real audit judgments — they exist to prove
// the contract end-to-end.
const CANNED = {
  metadata: {
    score: 5,
    verdict: 'PASS',
    justification: 'All thirteen required v2 frontmatter fields are present and well-typed; schema_version is 2.',
    findings: [],
  },
  activation: {
    score: 4,
    verdict: 'PASS WITH FIXES',
    justification: 'Description names real trigger scenarios and keywords are specific, but the skill has no explicit `triggers` array for label-based routing.',
    findings: [
      {
        severity: 'P3',
        surface: 'frontmatter: triggers',
        problem: 'No triggers array is declared; the skill is only discoverable via keyword matching.',
        evidence: 'triggers: (absent from frontmatter)',
        required_action: 'Add a `triggers: [documentation-skill]` entry so label-based routers can activate the skill deterministically.',
      },
    ],
  },
  relation: {
    score: 5,
    verdict: 'PASS',
    justification: 'adjacent and boundary relations are concise and point at real sibling skills; no dangling targets.',
    findings: [],
  },
  grounding: {
    score: 'N/A',
    verdict: 'N/A',
    justification: 'scope: portable — grounding dimension does not apply.',
    findings: [],
  },
  content: {
    score: 4,
    verdict: 'PASS WITH FIXES',
    justification: 'Coverage, Philosophy, and Verification sections are present and concrete, but "Do NOT Use When" boundaries are implicit rather than an explicit named section.',
    findings: [
      {
        severity: 'P2',
        surface: 'skill body',
        problem: 'No explicit `## Do NOT Use When` section; negative routing is only implied.',
        evidence: 'Section headings observed: `# Documentation`, `## Coverage`, `## Philosophy`, `## Verification` — no explicit negative-bounds section.',
        required_action: 'Add a `## Do NOT Use When` section listing at least two cases where the skill must not activate (e.g. UI accessibility behavior, runtime debugging).',
      },
    ],
  },
  eval: {
    score: 4,
    verdict: 'PASS WITH FIXES',
    justification: 'Eval artifact ships with seven grounded prompts; boundary coverage is good, but failure-mode prompts are missing.',
    findings: [
      {
        severity: 'P3',
        surface: 'examples/evals/comprehension.json',
        problem: 'Eval covers happy-path and boundary prompts but has no explicit failure-mode eval.',
        evidence: 'Seven prompts, all affirmative; no prompt tests what the skill should refuse.',
        required_action: 'Add one failure-mode prompt per skills/evaluation SKILL.md guidance (≥ 1 negative expectation per skill).',
      },
    ],
  },
  portability: {
    score: 5,
    verdict: 'PASS',
    justification: 'Skill is generic, portable, and the skill-md export via scripts/export-skill.js round-trips cleanly.',
    findings: [],
  },
};

(async function main() {
  try {
    const prompt = await readStdin();
    const dimId  = extractDimensionId(prompt);
    const payload = CANNED[dimId] || {
      score: 'N/A',
      verdict: 'N/A',
      justification: `mock-grader has no canned verdict for dimension "${dimId}".`,
      findings: [],
    };

    const body = {
      dimension: dimId,
      score: payload.score,
      verdict: payload.verdict,
      justification: payload.justification,
      findings: payload.findings,
    };

    process.stdout.write('<verdict>\n' + JSON.stringify(body, null, 2) + '\n</verdict>\n');
    process.exit(0);
  } catch (err) {
    process.stderr.write(`mock-grader error: ${err.message}\n`);
    process.exit(1);
  }
})();
