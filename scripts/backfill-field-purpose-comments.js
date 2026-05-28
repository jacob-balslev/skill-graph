#!/usr/bin/env node
/**
 * backfill-field-purpose-comments.js
 *
 * One-shot codemod that adds inline field-purpose comment blocks above each
 * frontmatter field in SKILL.md files, per the convention established in
 * skill-graph/SKILL_METADATA_PROTOCOL.md § "Inline field comments — the
 * authoring convention" (commit d9fe52f) and demonstrated on
 * skills/meta-methods/first-principles-thinking/SKILL.md (commit d6c13e4).
 *
 * What it does
 * ------------
 * For each SKILL.md the codemod processes:
 *   1. Reads the frontmatter (between the leading `---` and the closing `---`).
 *   2. Walks the metadata block line by line.
 *   3. For every line matching `^  <fieldname>:` (an authored field at the
 *      metadata-indent), checks whether the IMMEDIATELY PRECEDING non-blank
 *      line already begins with `#` (a comment). If so, skip (idempotent).
 *      If not, prepend the field's canonical comment block from the in-file
 *      FIELD_COMMENTS map.
 *   4. Inserts section dividers (`# === Section Name ===`) at the documented
 *      transition points (v8 classification, eval-health, Understanding fields,
 *      export provenance, Health Block) when those sections appear.
 *
 * What it does NOT do
 * -------------------
 *   - Modify any field VALUE.
 *   - Modify the body (anything after the closing `---`).
 *   - Touch fields whose names are not in FIELD_COMMENTS (unknown fields pass
 *     through unchanged so the codemod stays safe across schema evolution).
 *   - Commit. The caller is responsible for one-skill-per-commit discipline
 *     per skill-graph/AGENTS.md § Work Modes (CONTENT mode rule).
 *   - Handle Agent-Skills-compatible JSON-stringified nested encoding
 *     differently — the comment goes above the field's declaration line
 *     regardless of whether the value is structured YAML or a JSON string.
 *
 * Idempotency
 * -----------
 * Running the codemod multiple times on the same file produces the same
 * result. The "skip if line above is already a comment" check is the gate.
 *
 * Usage
 * -----
 *   # Dry-run on one file (prints diff to stdout, no write):
 *   node scripts/backfill-field-purpose-comments.js \
 *     ../skills/skills/meta-methods/inversion/SKILL.md --dry-run
 *
 *   # Apply to one file:
 *   node scripts/backfill-field-purpose-comments.js \
 *     ../skills/skills/meta-methods/inversion/SKILL.md
 *
 *   # Dry-run on multiple files (one diff per file):
 *   node scripts/backfill-field-purpose-comments.js \
 *     path/to/a/SKILL.md path/to/b/SKILL.md --dry-run
 *
 *   # Apply to all skills under a root (one-skill-per-commit is the
 *   # caller's responsibility — this script does NOT commit):
 *   find ~/Development/skills/skills -name SKILL.md \
 *     -exec node scripts/backfill-field-purpose-comments.js {} \;
 */

'use strict';

const fs = require('fs');
const path = require('path');

// -----------------------------------------------------------------------------
// FIELD_COMMENTS — keyed by field name (the bare key, no indent, no colon).
// Each value is an array of comment lines that will be inserted at the
// metadata indent (2 spaces) immediately above the field's declaration line.
//
// Source of truth for the content of these blocks: the canonical specimen at
// skill-graph/examples/skill-metadata-template.md (commit 7faadf9) and the
// pilot at skills/meta-methods/first-principles-thinking/SKILL.md
// (commit d6c13e4). When `docs/field-reference.md` and these blocks disagree,
// the reference doc wins and these blocks get corrected (per the convention
// established in d9fe52f).
// -----------------------------------------------------------------------------
const FIELD_COMMENTS = {
  schema_version: [
    '# schema_version: protocol contract version this skill conforms to.',
    '# Integer 8. Prior contract retrievable via `git show schema-v7:schemas/skill.schema.json`.',
  ],
  version: [
    '# version: skill content version (semver). Bumped when the instructional content changes.',
  ],
  subject: [
    '# subject: primary browse shelf — what the skill teaches. One of nine closed values:',
    '# code-engineering / quality-assurance / frontend-ui / design-craft / agent-ops /',
    '# product-domain / knowledge-organization / meta-methods / data-analytics.',
  ],
  deployment_target: [
    '# deployment_target: where this skill applies. One of two closed values:',
    '# portable (any project, repo-agnostic) /',
    '# project (one or more specific projects; requires populated `grounding` and `project[]`).',
  ],
  scope: [
    '# scope: PRD-style free-text statement of what the skill teaches and what it',
    '# doesn\'t. Optional.— no enum constraint. Mirrors `## Coverage`',
    '# plus `## Do NOT Use When` at the frontmatter level for fast scanning.',
  ],
  taxonomy_domain: [
    '# taxonomy_domain: optional hierarchical sub-path within `subject`. Slash-delimited',
    '# lowercase kebab-case segments. rename of the original v8 `domain`. Remove when the flat',
    '# `subject` is sufficient.',
  ],
  project: [
    '# project: projects this skill is linked to. Array of {handle, role} objects.',
    '# Required pattern when `deployment_target: project`. Role values: source-of-truth,',
    '# consumer, mirror. replaces the original v8 `workspace_tags`.',
  ],
  repo: [
    '# repo: repos this skill is linked to. Array of {handle, url} objects. Plural even',
    '# when most skills have one source repo (federation-ready). replaces the implicit',
    '# URN repo-slug + stripped `skill_graph_source_repo` export-provenance.',
  ],
  owner: [
    '# owner: team handle, GitHub username, or tool name responsible for keeping this skill current.',
  ],
  freshness: [
    '# freshness: ISO date the skill body was last reviewed or updated.',
  ],
  drift_check: [
    '# drift_check: truth-source verification record. Object with required `last_verified`',
    '# (ISO date) and optional `truth_source_hashes`. Record hashes with:',
    '# `node scripts/skill-graph-drift.js --record --apply <skill-dir>`.',
  ],
  eval_artifacts: [
    '# eval_artifacts: disk-truth — does an eval file exist on disk?',
    '# none (no intent) / planned (intent declared, no file yet) / present (file exists).',
  ],
  eval_state: [
    '# eval_state: runtime-truth — has the eval been run and passed?',
    '# unverified (no run yet, or no file) / passing (one-shot green) / monitored (cadenced green).',
    '# `monitored` is strictly stronger than `passing` — a forward state for continuous runs.',
  ],
  routing_eval: [
    '# routing_eval: routing-coverage — is the skill\'s activation verified by the harness?',
    '# absent (not verified) / present (gated by lint check 12; harness must exit 0).',
  ],
  comprehension_state: [
    '# comprehension_state: marker that this skill has populated v6+ Understanding fields',
    '# (mental_model, purpose, boundary, analogy, misconception). Value: `present` or absent.',
  ],
  stability: [
    '# stability: lifecycle marker. One of:',
    '# experimental (active development) / stable (production-ready) /',
    '# frozen (no further changes expected) / deprecated.',
    '# When `deprecated`, schema\'s allOf REQUIRES `superseded_by: <real-skill-name>`.',
  ],
  license: [
    '# license: SPDX license identifier (e.g., MIT, Apache-2.0).',
  ],
  compatibility: [
    '# compatibility: runtime compatibility object. Prefer structured fields',
    '# (`runtimes`, `node`) over free-text `notes`.',
  ],
  keywords: [
    '# keywords: semantic phrases for fuzzy router activation. v8 cap: max 10.',
    '# Keep terms a user would actually type when starting a task in this skill\'s domain.',
  ],
  triggers: [
    '# triggers: explicit-match activation phrases the router fires on literally.',
    '# Use when label-based routing is intended; usually keywords + examples are enough.',
  ],
  paths: [
    '# paths: glob array of code surfaces this skill governs. Supports gitignore-style',
    '# negation. Each glob should map to ONE canonical skill. Omit if purely conceptual.',
  ],
  examples: [
    '# examples: 2-5 realistic user prompts the skill SHOULD activate for.',
    '# Written in the user\'s voice. Improves retrieval recall beyond keywords alone.',
  ],
  anti_examples: [
    '# anti_examples: near-miss prompts that should route ELSEWHERE.',
    '# Pair with relations.boundary to indicate the confusable territory\'s owner.',
  ],
  routing_bundles: [
    '# routing_bundles: batch-activation group memberships. Router fires the whole bundle',
    '# when the bundle label matches. Distinct from workspace_tags (per-project filter).',
  ],
  relations: [
    '# relations: typed graph edges to sibling skills. Six edge types:',
    '# related (adjacency for browse / co-routing expansion) /',
    '# boundary (exclude listed skills from co-routing when THIS skill wins — name is inverse',
    '#           to mechanic; write reason as "I own this exclusively over X", not "use X instead";',
    '#           rename to `suppresses` pending ADR-0018) /',
    '# verify_with (cross-check; co-loaded as one-hop expansion) /',
    '# depends_on (composition; transitive — A→B→C loads all three) /',
    '# broader / narrower (SKOS-style generalization; broader drives co-load, narrower does not).',
  ],
  grounding: [
    '# grounding: required when `deployment_target: project`. Declares the truth sources',
    '# the skill anchors to and the failure modes those sources prevent. Omit when the',
    '# skill is universal-knowledge. `subject_matter` replaces v8 `domain_object`.',
  ],
  portability: [
    '# portability: external-runtime export claims. Object with:',
    '# readiness — declared (claim only) / scripted (export tooling exists) /',
    '#             verified (proven with a receipt artifact).',
    '# targets — array; currently only `skill-md` is in the enum.',
  ],
  lifecycle: [
    '# lifecycle: maintenance policy for the drift sentinel.',
    '# stale_after_days — skill flagged STALE when N days past `drift_check.last_verified`.',
    '# review_cadence — process commitment (quarterly / monthly / annual), not a calendar fact.',
  ],
  runtime_telemetry: [
    '# runtime_telemetry: optional JSONL feed of real-world success/failure receipts',
    '# so consumers can corroborate `eval_state`. Omit when no feedback pipeline exists.',
  ],
  mental_model: [
    '# mental_model: the primitives of the concept and how they relate. One paragraph.',
  ],
  purpose: [
    '# purpose: the problem this concept solves and why the field exists. One paragraph.',
  ],
  boundary: [
    '# boundary: what this concept is NOT. Distinguishes from adjacent skills by naming the',
    '# MECHANISM that differs, not just the label. Universal terms only — no repo-specific nouns.',
  ],
  analogy: [
    '# analogy: one-sentence metaphor preserving the core mechanism.',
  ],
  misconception: [
    '# misconception: the wrong mental model people bring; corrected explicitly.',
  ],
  concept: [
    '# concept: legacy v5 nested Understanding block. DEPRECATED — flat fields above',
    '# (mental_model, purpose, boundary, analogy, misconception) win when both are present.',
  ],
  skill_graph_source_repo: [
    '# === Export provenance (set by the export pipeline; do not hand-author) ===',
    '# skill_graph_protocol is a content-label claim distinct from `schema_version` semantics.',
    '# See AGENTS.md § Version Labels Are Earned, Not Bumped.',
  ],
  structural_verdict: [
    '# === Health Block (written by the audit loop, not hand-authored) ===',
    '# See SKILL_AUDIT_LOOP.md § The Health Block. UNVERIFIED is the honest default.',
    '#',
    '# structural_verdict: form/export shape (gates 1-2, 7 — external mandates only).',
    '# PASS / PASS_WITH_FIXES / FAIL / UNVERIFIED.',
  ],
  truth_verdict: [
    '# truth_verdict: truth sources vs declared hashes (gates 3-6).',
    '# PASS / DRIFT / BROKEN / UNVERIFIED.',
  ],
  comprehension_verdict: [
    '# comprehension_verdict: gate 8 — cheap recitation smoke test. Never alone certifies.',
    '# PASS / SHALLOW / REDUNDANT / UNVERIFIED / PROVISIONAL / SKIPPED_BASELINE_HIGH / NA.',
  ],
  application_verdict: [
    '# application_verdict: gate 9 — the primary quality signal. APPLICABLE is the only verdict',
    '# that certifies the skill is USEFUL (grader-confirmed). PROVISIONAL = one model self-assessed.',
    '# APPLICABLE / REDUNDANT / HARMFUL / MIXED / FALSE_POSITIVE / PROVISIONAL / UNVERIFIED.',
  ],
  eval_score: [
    '# eval_score: 0.0–5.0 aggregate from the eval runner. Written by `evaluate`.',
  ],
  eval_failed_ids: [
    '# eval_failed_ids: array of failing eval IDs from the last run; empty when clean.',
  ],
  lint_verdict: [
    '# lint_verdict: per-script signal from skill-lint.js. Rolls up into structural_verdict.',
    '# PASS / FAIL / UNKNOWN.',
  ],
  drift_status: [
    '# drift_status: per-script signal from skill-graph-drift.js. Rolls up into truth_verdict.',
    '# OK / DRIFT / BROKEN / STALE / NO_BASELINE / EXTERNAL_UNHASHED / UNKNOWN.',
  ],
  last_audited: [
    '# last_audited: ISO date `audit` last ran against this skill.',
  ],
  last_changed: [
    '# last_changed: ISO date the skill body or frontmatter was last edited.',
  ],
};

// Field declaration lines that should be preceded by a section divider when
// they first appear. Map: fieldName -> divider line.
// The divider is inserted BEFORE the field-purpose comment block.
const SECTION_DIVIDERS = {
  subject: '# === v8 Classification (subject + scope; polyhierarchy via subjects[]) — see ADR-0017 ===',
  eval_artifacts: '# === Evaluation Status: three orthogonal axes ===',
  mental_model: '# === Understanding fields (when comprehension_state: present) ===',
};

// Two indentations are supported (two physical encodings, one logical contract
// per SKILL_METADATA_PROTOCOL.md § Two physical encodings):
//   - Nested encoding (Agent-Skills-compatible): every field under `metadata:`
//     at 2-space indent. The canonical library uses this.
//   - Flat top-level encoding (protocol-native illustrative form): every field
//     at root level (indent 0). A small number of skills still use this.
// The codemod auto-detects which encoding the file uses and picks the right
// indent for both matching field declarations and inserting comment lines.
const NESTED_INDENT = '  ';
const FLAT_INDENT = '';

// Returns the field name from a line if it's a field declaration at the given
// indent, otherwise null. Builds the regex from the indent so it works for both
// encodings.
function fieldNameOf(line, indent) {
  const re = new RegExp('^' + indent + '([a-z_][a-z0-9_-]*):');
  const m = line.match(re);
  if (!m) return null;
  return m[1];
}

function isCommentLine(line) {
  return /^\s*#/.test(line);
}

function isBlankLine(line) {
  return /^\s*$/.test(line);
}

function findLastNonBlankAbove(lines, i) {
  for (let j = i - 1; j >= 0; j--) {
    if (!isBlankLine(lines[j])) return lines[j];
  }
  return null;
}

function processFile(filePath, options) {
  const src = fs.readFileSync(filePath, 'utf8');
  const lines = src.split('\n');

  // Locate frontmatter bounds.
  // Frontmatter starts at the leading `---` (line 0 by convention) and ends at
  // the next `---` line.
  if (lines[0] !== '---') {
    return { changed: false, reason: 'no leading frontmatter ---', output: src };
  }
  let endIdx = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') { endIdx = i; break; }
  }
  if (endIdx === -1) {
    return { changed: false, reason: 'no closing frontmatter ---', output: src };
  }

  // Detect encoding: nested (with `metadata:` block) or flat top-level.
  // Walk position starts AFTER the encoding-defining line: metadataLine+1 for
  // nested, or 1 (right after the opening ---) for flat.
  let metadataLine = -1;
  for (let i = 1; i < endIdx; i++) {
    if (lines[i] === 'metadata:') { metadataLine = i; break; }
  }
  const isNested = metadataLine !== -1;
  const indent = isNested ? NESTED_INDENT : FLAT_INDENT;
  const startIdx = isNested ? metadataLine + 1 : 1;

  // Walk lines [startIdx, endIdx) and insert comment blocks.
  const out = lines.slice(0, startIdx);
  const seenSections = new Set();

  let i = startIdx;
  while (i < endIdx) {
    const line = lines[i];
    const fieldName = fieldNameOf(line, indent);

    if (fieldName && FIELD_COMMENTS[fieldName]) {
      // Check whether the line ABOVE (in already-emitted output) is already a comment.
      const lastEmitted = out.length > 0 ? out[out.length - 1] : '';
      const alreadyHasComment = isCommentLine(lastEmitted);

      if (!alreadyHasComment) {
        // Section divider, if applicable and not yet seen.
        if (SECTION_DIVIDERS[fieldName] && !seenSections.has(fieldName)) {
          // Add a blank line before the divider for visual breathing room,
          // unless we're already at a blank.
          if (out.length > 0 && !isBlankLine(out[out.length - 1])) {
            out.push('');
          }
          out.push(indent + SECTION_DIVIDERS[fieldName]);
          seenSections.add(fieldName);
        }

        // Insert the field's comment block at the encoding's indent.
        for (const c of FIELD_COMMENTS[fieldName]) {
          out.push(indent + c);
        }
      }
    }

    out.push(line);
    i++;
  }

  // Emit the rest of the file unchanged.
  for (let j = endIdx; j < lines.length; j++) {
    out.push(lines[j]);
  }

  const updated = out.join('\n');
  return { changed: updated !== src, reason: null, output: updated };
}

function diff(a, b) {
  // Minimal unified-diff-like printer for stdout review. Not a full diff,
  // just enough to scan for sanity. Use `git diff` for the authoritative view.
  const aLines = a.split('\n');
  const bLines = b.split('\n');
  return `--- before (${aLines.length} lines)\n+++ after  (${bLines.length} lines)\n` +
    `  net change: +${bLines.length - aLines.length} lines\n`;
}

function main(argv) {
  const args = argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const files = args.filter(a => !a.startsWith('--'));

  if (files.length === 0) {
    console.error('Usage: backfill-field-purpose-comments.js <SKILL.md> [<SKILL.md> ...] [--dry-run]');
    process.exit(2);
  }

  let touched = 0;
  let skipped = 0;
  for (const f of files) {
    const abs = path.resolve(f);
    if (!fs.existsSync(abs)) {
      console.error(`[skip] ${f} — file not found`);
      skipped++;
      continue;
    }
    const result = processFile(abs, { dryRun });
    if (!result.changed) {
      const why = result.reason ? ` (${result.reason})` : ' — no changes needed (already commented or unchanged)';
      console.log(`[skip] ${path.relative(process.cwd(), abs)}${why}`);
      skipped++;
      continue;
    }

    if (dryRun) {
      console.log(`[diff] ${path.relative(process.cwd(), abs)}`);
      process.stdout.write(diff(fs.readFileSync(abs, 'utf8'), result.output));
    } else {
      fs.writeFileSync(abs, result.output, 'utf8');
      console.log(`[write] ${path.relative(process.cwd(), abs)}`);
      touched++;
    }
  }

  console.log(`---`);
  console.log(`${dryRun ? 'dry-run' : 'applied'}: ${touched} files would change; ${skipped} files skipped`);
}

if (require.main === module) {
  main(process.argv);
}

module.exports = { processFile, FIELD_COMMENTS, SECTION_DIVIDERS };
