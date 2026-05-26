#!/usr/bin/env node
/**
 * reorder-description-codemod — deterministic Phase 2 description sweep for the
 * Karpathy skill-organization loop (per docs/plans/skill-organization-karpathy-
 * loop-2026-05-26.md).
 *
 * Why this exists
 * ---------------
 * Baseline measurement showed 76% of skills have "Do NOT use" past the
 * claude-code 250-char silent cap (#40121, #44780). The fix for most of them
 * is *re-ordering* — the disambiguation phrases already exist in the
 * description, they just land past the cap. No LLM judgment is required to
 * cut a sentence and paste it at the front. Per `.claude/rules/
 * cost-aware-delegation.md`: deterministic and repeatable work goes to a
 * script, not a model.
 *
 * What it does
 * ------------
 * For each SKILL.md:
 *   1. Parse the YAML frontmatter description.
 *   2. Split into sentences (sentence-boundary heuristic on `.` / `?` / `!`
 *      followed by space + capital).
 *   3. Find the first sentence that contains a positive trigger ("Use when"
 *      / "Trigger when" / etc.) AND the first sentence that contains a
 *      negative boundary ("Do NOT use" / "Don't use" / etc.).
 *   4. If BOTH exist somewhere AND at least one lands past char 250, move
 *      both to the front (positive trigger first, then negative boundary,
 *      then the remaining sentences in original order).
 *   5. Re-emit the description in the same YAML shape (quoted string, no
 *      schema_version bump, no other field touched).
 *   6. Write back. Skip if no change.
 *
 * What it does NOT do
 * -------------------
 * - It does NOT shorten descriptions. Total content is preserved.
 * - It does NOT author phrases that don't exist. Skills with neither
 *   positive trigger nor negative boundary anywhere are listed in the
 *   `--list-unhandleable` output and need LLM authoring (Phase 2b).
 * - It does NOT touch other frontmatter fields or the body.
 * - It does NOT auto-commit. Run with `--apply`, inspect git diff, then
 *   commit. Default is `--dry-run` reporting changes only.
 *
 * Usage
 *   node scripts/reorder-description-codemod.js                       # dry-run, all skills
 *   node scripts/reorder-description-codemod.js --apply               # write changes
 *   node scripts/reorder-description-codemod.js --skill <name>        # single skill
 *   node scripts/reorder-description-codemod.js --list-unhandleable   # skills needing LLM rewrite
 *
 * Exit 0 always (this is an authoring tool, not a verification gate).
 */

'use strict';

const fs = require('fs');
const { parseFrontmatter, normalizeFrontmatter } = require('./lib/parse-frontmatter');
const { collectSkillFiles } = require('./lib/roots');

const WINDOW = 250;

const POSITIVE_TRIGGER_RE = /(Use when\b|Trigger when\b|Activate when\b|Use this skill\b|Apply when\b|Applies to\b|Invoke when\b)/i;
const NEGATIVE_BOUNDARY_RE = /(Do NOT use\b|Don't use\b|Skip when\b|Do not apply\b|Not for\b|Exclude when\b|Do not invoke\b|Skip:|SKIP:)/i;

// YAML quoted-string detection for the `description:` line. The description is
// typically a single quoted string. We support `"..."` and `'...'` styles.
// We do NOT support block-scalar (`|` / `>`) for description — those skills
// would need a different handler. If we see one, we skip and report.
const DESCRIPTION_LINE_RE = /^description:\s*("(?:[^"\\]|\\.)*"|'[^']*')\s*$/;

function parseArgs(argv) {
  const args = { apply: false, skill: null, listUnhandleable: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--apply') args.apply = true;
    else if (a === '--skill') args.skill = argv[++i];
    else if (a === '--list-unhandleable') args.listUnhandleable = true;
    else if (a === '--help' || a === '-h') args.help = true;
  }
  return args;
}

function printHelp() {
  process.stdout.write(`reorder-description-codemod — deterministic Phase 2 description sweep.

Usage:
  node scripts/reorder-description-codemod.js                       # dry-run, all
  node scripts/reorder-description-codemod.js --apply               # write changes
  node scripts/reorder-description-codemod.js --skill <name>        # single skill
  node scripts/reorder-description-codemod.js --list-unhandleable   # skills needing LLM rewrite

Moves "Use when" + "Do NOT use" sentences to the front of each description.
No content removed; no LLM judgment. Skills lacking either phrase are listed
for Phase 2b LLM authoring.
`);
}

/**
 * Sentence-split a description. Heuristic: split on `[.!?]` followed by
 * whitespace + uppercase letter. Preserves the terminator on the sentence.
 * Keeps the em-dash + parenthetical phrases intact.
 */
function splitSentences(text) {
  // Don't split inside parentheses or after abbreviations. Conservative split.
  const sentences = [];
  let buffer = '';
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    buffer += ch;
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') depth--;
    else if ((ch === '.' || ch === '!' || ch === '?') && depth === 0) {
      // Look ahead: must be followed by whitespace and an uppercase letter or end-of-string
      const next = text.slice(i + 1);
      if (next === '' || /^\s+[A-Z]/.test(next) || /^\s*$/.test(next)) {
        sentences.push(buffer);
        buffer = '';
      }
    }
  }
  if (buffer.length > 0) sentences.push(buffer);
  return sentences.map((s) => s.trim()).filter(Boolean);
}

/**
 * Try to reorder. Returns { changed, newDescription, reason }.
 *   - changed: boolean
 *   - newDescription: string (only valid when changed: true)
 *   - reason: explanation if not changed
 */
function tryReorder(description) {
  if (description.length <= WINDOW) {
    return { changed: false, reason: 'description ≤ 250 chars — already fully visible' };
  }

  const sentences = splitSentences(description);
  if (sentences.length < 2) {
    return { changed: false, reason: 'fewer than 2 sentences — cannot reorder' };
  }

  // Find the first sentence containing a positive trigger and the first
  // containing a negative boundary.
  const posIdx = sentences.findIndex((s) => POSITIVE_TRIGGER_RE.test(s));
  const negIdx = sentences.findIndex((s) => NEGATIVE_BOUNDARY_RE.test(s));

  if (posIdx === -1 && negIdx === -1) {
    return { changed: false, reason: 'no Use-when AND no Do-NOT-use anywhere — needs LLM authoring (Phase 2b)' };
  }
  if (posIdx === -1) {
    return { changed: false, reason: 'no Use-when sentence anywhere — needs LLM authoring (Phase 2b)' };
  }
  if (negIdx === -1) {
    return { changed: false, reason: 'no Do-NOT-use sentence anywhere — needs LLM authoring (Phase 2b)' };
  }

  // Check whether either is past the 250-char cap currently. If both are
  // already in the first 250, skip — the reorder would just shuffle without
  // benefit.
  let cumulativeLen = 0;
  let posInWindow = false;
  let negInWindow = false;
  for (let i = 0; i < sentences.length; i++) {
    if (i === posIdx && cumulativeLen < WINDOW) posInWindow = true;
    if (i === negIdx && cumulativeLen < WINDOW) negInWindow = true;
    cumulativeLen += sentences[i].length + 1; // +1 for joining space
  }
  if (posInWindow && negInWindow) {
    return { changed: false, reason: 'Use-when and Do-NOT-use both already in first 250 chars — no reorder needed' };
  }

  // Build the new sentence order: pos, neg, then everything else in original
  // order. If posIdx === negIdx (same sentence has both — unlikely but
  // possible), just move that one sentence to the front.
  const newOrder = [];
  if (posIdx === negIdx) {
    newOrder.push(sentences[posIdx]);
    for (let i = 0; i < sentences.length; i++) {
      if (i !== posIdx) newOrder.push(sentences[i]);
    }
  } else {
    newOrder.push(sentences[posIdx]);
    newOrder.push(sentences[negIdx]);
    for (let i = 0; i < sentences.length; i++) {
      if (i !== posIdx && i !== negIdx) newOrder.push(sentences[i]);
    }
  }

  const newDescription = newOrder.join(' ');
  if (newDescription === description) {
    return { changed: false, reason: 'reorder produces identical text — no change' };
  }

  return {
    changed: true,
    newDescription,
    reason: `moved ${posIdx === negIdx ? '1 sentence' : '2 sentences'} to front (pos@${posIdx}, neg@${negIdx} → 0, 1)`,
  };
}

/**
 * Locate the description line in the raw SKILL.md text and replace its
 * quoted value with the new description. Preserves quote style and original
 * key formatting.
 */
function rewriteDescriptionInText(text, newDescription) {
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(DESCRIPTION_LINE_RE);
    if (!m) continue;
    const oldQuoted = m[1];
    const quote = oldQuoted[0];
    // Escape the new description for the chosen quote style. For double quotes:
    // backslash-escape `"` and `\`. For single quotes: YAML single-quote
    // escaping is `''` for a literal apostrophe (we keep it simple and avoid
    // touching skills with `'` in the description if quote is `'`).
    let escaped;
    if (quote === '"') {
      escaped = newDescription.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    } else {
      // For single-quote, YAML uses `''` to represent a literal `'`. We avoid
      // changing skills where the new description contains a `'` if the old
      // quote was `'` — those should round-trip cleanly via re-quoting.
      escaped = newDescription.replace(/'/g, "''");
    }
    lines[i] = `description: ${quote}${escaped}${quote}`;
    return { changed: true, text: lines.join('\n') };
  }
  return { changed: false, text };
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    printHelp();
    process.exit(0);
  }

  const files = collectSkillFiles();
  const stats = {
    total: 0,
    changed: 0,
    skipped: 0,
    unhandleable: 0,
    unhandleable_reasons: {},
  };
  const changedFiles = [];
  const unhandleable = [];

  for (const { filePath } of files) {
    let text;
    try {
      text = fs.readFileSync(filePath, 'utf8');
    } catch (e) {
      process.stderr.write(`cannot read ${filePath}: ${e.message}\n`);
      continue;
    }
    const fm = normalizeFrontmatter(parseFrontmatter(text));
    if (!fm || !fm.description) continue;
    if (args.skill && fm.name !== args.skill) continue;

    stats.total++;
    const description = String(fm.description);
    const result = tryReorder(description);

    if (!result.changed) {
      stats.skipped++;
      if (result.reason.includes('Phase 2b') || result.reason.includes('LLM authoring')) {
        stats.unhandleable++;
        unhandleable.push({ skill: fm.name, reason: result.reason });
        const key = result.reason.split('—')[0].trim();
        stats.unhandleable_reasons[key] = (stats.unhandleable_reasons[key] || 0) + 1;
      }
      continue;
    }

    stats.changed++;
    changedFiles.push({ skill: fm.name, path: filePath, reason: result.reason });

    if (args.apply) {
      const rewrite = rewriteDescriptionInText(text, result.newDescription);
      if (rewrite.changed) {
        fs.writeFileSync(filePath, rewrite.text, 'utf8');
      } else {
        process.stderr.write(`could not rewrite description in ${filePath} (block-scalar or unusual shape) — skipping\n`);
        stats.changed--;
        stats.skipped++;
      }
    }
  }

  if (args.listUnhandleable) {
    process.stdout.write(`Skills needing Phase 2b LLM authoring (${unhandleable.length}):\n`);
    for (const u of unhandleable) {
      process.stdout.write(`  ${u.skill.padEnd(38)}  ${u.reason}\n`);
    }
    process.exit(0);
  }

  process.stdout.write(`reorder-description-codemod ${args.apply ? '(APPLIED)' : '(dry-run)'}\n`);
  process.stdout.write(`========================================\n`);
  process.stdout.write(`Total skills scanned:           ${stats.total}\n`);
  process.stdout.write(`Reorderable (changed):          ${stats.changed}\n`);
  process.stdout.write(`Skipped — already OK:           ${stats.skipped - stats.unhandleable}\n`);
  process.stdout.write(`Skipped — unhandleable (LLM):   ${stats.unhandleable}\n`);
  process.stdout.write(`\nUnhandleable breakdown:\n`);
  for (const [reason, count] of Object.entries(stats.unhandleable_reasons)) {
    process.stdout.write(`  ${count.toString().padStart(3)}  ${reason}\n`);
  }
  if (!args.apply && stats.changed > 0) {
    process.stdout.write(`\nFirst 10 reorderable skills:\n`);
    for (const f of changedFiles.slice(0, 10)) {
      process.stdout.write(`  ${f.skill.padEnd(38)}  ${f.reason}\n`);
    }
    process.stdout.write(`\nRe-run with --apply to write changes.\n`);
  }

  process.exit(0);
}

if (require.main === module) main();

module.exports = { tryReorder, splitSentences, POSITIVE_TRIGGER_RE, NEGATIVE_BOUNDARY_RE };
