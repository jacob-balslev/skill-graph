#!/usr/bin/env node
/**
 * Routing-eval integrity check for SKILL.md files (lint check 12).
 *
 * **R3 — routing_eval: present must be executable (ERROR)**
 *   A skill that declares `routing_eval: present` is claiming its routing
 *   coverage has been evaluated. The authored fields `examples` and
 *   `anti_examples` (schema_version 3, v0.5.0) are what the evaluation runs
 *   against. This check enforces two things:
 *
 *     1. If `routing_eval: present`, the skill MUST declare both `examples`
 *        and `anti_examples` (non-empty). No input — no evaluation possible.
 *
 *     2. If `routing_eval: present`, running the harness
 *        (`scripts/skill-graph-routing-eval.js`) against this skill MUST
 *        return verdict=PASS. Every FAIL case surfaces as a lint error with
 *        the failing prompt.
 *
 *   This is the gate that turns `routing_eval` from self-assertion into a
 *   verifiable claim. Before this check, authors could set `present` without
 *   any executable evidence; after it, `present` is lint-rejected until the
 *   harness agrees.
 *
 * @module lint/check-routing-eval
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { evaluateSkill } = require('../skill-graph-routing-eval');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const DEFAULT_MANIFEST = path.join(REPO_ROOT, 'skills.manifest.json');
const SAMPLE_MANIFEST = path.join(REPO_ROOT, 'examples', 'skills.manifest.sample.json');

/**
 * Run routing-eval checks on one SKILL.md file.
 *
 * @param {object} opts
 * @param {string}  opts.filePath    - Path to the file (used in messages only).
 * @param {string}  opts.sourceText  - Full file content.
 * @param {object}  opts.fm          - Parsed frontmatter object.
 * @param {object}  [opts.manifest]  - Optional pre-loaded manifest (performance).
 *
 * @returns {{
 *   errors:   Array<{message: string, line: number, column: number, help: string}>,
 *   warnings: Array<{message: string, line: number, column: number, help: string}>
 * }}
 */
function checkRoutingEval(opts) {
  const { sourceText, fm } = opts;
  const errors = [];
  if (!fm) return { errors, warnings: [] };
  if (fm.routing_eval !== 'present') return { errors, warnings: [] };

  const keyLine = locateKey(sourceText, 'routing_eval') || { line: 1, column: 1 };

  // Guard 1: examples + anti_examples must exist.
  const hasExamples = Array.isArray(fm.examples) && fm.examples.length > 0;
  const hasAnti = Array.isArray(fm.anti_examples) && fm.anti_examples.length > 0;
  if (!hasExamples || !hasAnti) {
    errors.push({
      message: `routing_eval: present without populated examples + anti_examples — the harness has no prompts to evaluate`,
      line: keyLine.line,
      column: keyLine.column,
      help: 'Either populate examples and anti_examples (see docs/field-reference.md § examples and § anti_examples) or set routing_eval to "absent".',
    });
    return { errors, warnings: [] };
  }

  // Guard 2: harness must pass.
  const manifest = opts.manifest || loadManifest();
  if (!manifest) {
    errors.push({
      message: `routing_eval: present but no manifest is available for the harness — run generate-manifest.js first`,
      line: keyLine.line,
      column: keyLine.column,
      help: 'Run `node scripts/generate-manifest.js --output skills.manifest.json` to produce the manifest the harness evaluates against.',
    });
    return { errors, warnings: [] };
  }

  const skillEntry = (manifest.skills || []).find(s => s.name === fm.name);
  if (!skillEntry) {
    errors.push({
      message: `routing_eval: present but skill "${fm.name}" is not in the manifest — regenerate the manifest`,
      line: keyLine.line,
      column: keyLine.column,
      help: 'The skill must appear in the manifest so the harness can resolve its activation.examples / anti_examples.',
    });
    return { errors, warnings: [] };
  }

  const todayISO = new Date().toISOString().slice(0, 10);
  const report = evaluateSkill(manifest, skillEntry, todayISO);

  if (report.verdict === 'FAIL') {
    for (const c of report.cases) {
      if (c.verdict !== 'FAIL') continue;
      errors.push({
        message: `routing_eval: present but [${c.kind}] "${truncate(c.prompt, 72)}" fails — ${c.reason}`,
        line: keyLine.line,
        column: keyLine.column,
        help: 'Either fix the routing signal (keywords / boundary / anti_example) until the harness passes, or set routing_eval to "absent" until you do. Run `node scripts/skill-graph-routing-eval.js --skill ' + fm.name + '` for full diagnostics.',
      });
    }
  }

  return { errors, warnings: [] };
}

function loadManifest() {
  const p = fs.existsSync(DEFAULT_MANIFEST) ? DEFAULT_MANIFEST : SAMPLE_MANIFEST;
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch { return null; }
}

function locateKey(sourceText, key) {
  const lines = sourceText.split('\n');
  let dashCount = 0;
  let inside = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      dashCount++;
      if (dashCount === 1) { inside = true; continue; }
      if (dashCount === 2) break;
    }
    if (!inside) continue;
    const m = lines[i].match(new RegExp(`^(\\s*)${key}\\s*:`));
    if (m) return { line: i + 1, column: m[1].length + 1 };
  }
  return null;
}

function truncate(s, n) {
  return s.length <= n ? s : s.slice(0, n - 1) + '\u2026';
}

module.exports = { checkRoutingEval };
