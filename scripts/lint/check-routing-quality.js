#!/usr/bin/env node
/**
 * Routing quality checks for SKILL.md files (A2 narrow).
 *
 * Only "defensible" heuristics are implemented here — checks with low false-
 * positive risk and clear remediation paths. Length-threshold heuristics for
 * description or coverage are intentionally omitted (high false-positive risk
 * on legitimately terse skills).
 *
 * **Check R1 — empty keywords in operational scope (ERROR)**
 *   A skill with `scope: codebase` or any `routing_groups` entry is meant to
 *   be surfaced by a router. An empty `keywords: []` (or no keywords field)
 *   means the skill cannot be discovered by keyword-based routers. This is
 *   almost always an authoring mistake.
 *
 *   Note: the task spec text says "operational scope" but after SH-5784 the
 *   v2 scope value is `codebase`. This check targets `scope: codebase` OR
 *   skills that have a non-empty `routing_groups` array, matching the intent
 *   of the original proposal.
 *
 * **Check R2 — description verbatim in Coverage section (WARN)**
 *   The description field is a routing contract (≤3 sentences) and `## Coverage`
 *   is a scope map (a bulleted topic list). When the description text appears
 *   verbatim inside `## Coverage`, the two layers have collapsed into one and
 *   the Coverage section adds no information for a reader who already read the
 *   frontmatter. This is always a copy-paste mistake.
 *
 * @module lint/check-routing-quality
 */

'use strict';

/**
 * Run routing-quality checks on one SKILL.md file.
 *
 * @param {object} opts
 * @param {string}  opts.filePath    - Path to the file (used in messages only).
 * @param {string}  opts.sourceText  - Full file content.
 * @param {object}  opts.fm          - Parsed frontmatter object.
 *
 * @returns {{
 *   errors:   Array<{message: string, line: number, column: number, help: string}>,
 *   warnings: Array<{message: string, line: number, column: number, help: string}>
 * }}
 */
function checkRoutingQuality(opts) {
  const { filePath, sourceText, fm } = opts;

  const errors   = [];
  const warnings = [];

  if (!fm) return { errors, warnings };

  // ------------------------------------------------------------------ R1
  // Error: empty keywords for scope: codebase or routing_groups-having skills.
  const isCodebaseScope   = fm.scope === 'codebase';
  const hasRoutingGroups  = Array.isArray(fm.routing_groups) && fm.routing_groups.length > 0;
  // The custom frontmatter parser represents `keywords: []` as the string "[]"
  // (inline YAML array syntax). Treat that as empty as well.
  const keywordsEmpty     = !fm.keywords
    || fm.keywords === '[]'
    || (Array.isArray(fm.keywords) && fm.keywords.length === 0);

  if ((isCodebaseScope || hasRoutingGroups) && keywordsEmpty) {
    // Locate the `keywords` key in the frontmatter if it exists, else point at
    // the `scope` key.
    const keyLine = locateKeyInFrontmatter(sourceText, 'keywords')
      || locateKeyInFrontmatter(sourceText, 'scope')
      || { line: 1, column: 1 };

    const scopeReason = isCodebaseScope
      ? 'scope: codebase'
      : `routing_groups: [${fm.routing_groups.join(', ')}]`;

    errors.push({
      message: `keywords: [] for a skill with ${scopeReason} — router cannot discover this skill`,
      line:    keyLine.line,
      column:  keyLine.column,
      help:    'Add at least one keyword to the keywords list. Skills with scope: codebase or routing_groups must be discoverable by keyword routers. See docs/field-reference.md § keywords.',
    });
  }

  // ------------------------------------------------------------------ R2
  // Warn: description text appears verbatim inside ## Coverage section.
  const description = typeof fm.description === 'string' ? fm.description.trim() : '';
  if (description.length > 20) {
    const coverageContent = extractSectionContent(sourceText, 'Coverage');
    if (coverageContent !== null && coverageContent.includes(description)) {
      const sectionLine = locateH2InBody(sourceText, 'Coverage');
      warnings.push({
        message: 'description text appears verbatim in ## Coverage — the two layers have collapsed into one',
        line:    sectionLine ? sectionLine.line : 1,
        column:  1,
        help:    'The description is the routing contract (≤3 sentences). ## Coverage is a bulleted scope map. Rewrite ## Coverage as a topic list, removing the copied description sentence. See docs/skill-metadata-protocol.md § Semantic layer discipline.',
      });
    }
  }

  return { errors, warnings };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Locate a YAML key inside the frontmatter block.
 * Returns { line, column } (1-based) or null if not found.
 *
 * @param {string} sourceText
 * @param {string} key
 * @returns {{ line: number, column: number }|null}
 */
function locateKeyInFrontmatter(sourceText, key) {
  const lines = sourceText.split('\n');
  // Only search inside the frontmatter block (between the two `---` markers).
  let inFrontmatter = false;
  let dashCount = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      dashCount++;
      if (dashCount === 1) { inFrontmatter = true; continue; }
      if (dashCount === 2) break; // end of frontmatter
    }
    if (!inFrontmatter) continue;
    const m = lines[i].match(new RegExp(`^(\\s*)${escapeRegex(key)}\\s*:`));
    if (m) {
      return { line: i + 1, column: m[1].length + 1 };
    }
  }
  return null;
}

/**
 * Extract the text content of a named H2 section from the markdown body
 * (after the closing `---`).
 *
 * @param {string} sourceText
 * @param {string} heading - Heading text without `## ` prefix.
 * @returns {string|null} Section content, or null if section not found.
 */
function extractSectionContent(sourceText, heading) {
  const lines = sourceText.split('\n');

  // Skip past frontmatter.
  let bodyStart = 0;
  let dashCount = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      dashCount++;
      if (dashCount === 2) { bodyStart = i + 1; break; }
    }
  }

  const target = `## ${heading}`;
  let collecting = false;
  let content = [];

  for (let i = bodyStart; i < lines.length; i++) {
    if (lines[i].trimEnd() === target) {
      collecting = true;
      continue;
    }
    if (collecting) {
      // Stop at the next H2.
      if (/^## /.test(lines[i])) break;
      content.push(lines[i]);
    }
  }

  return collecting ? content.join('\n') : null;
}

/**
 * Locate an H2 heading in the body (after frontmatter).
 * Returns { line } (1-based) or null.
 *
 * @param {string} sourceText
 * @param {string} heading
 * @returns {{ line: number }|null}
 */
function locateH2InBody(sourceText, heading) {
  const lines = sourceText.split('\n');
  let dashCount = 0;
  let pastFrontmatter = false;
  const target = `## ${heading}`;
  for (let i = 0; i < lines.length; i++) {
    if (!pastFrontmatter) {
      if (lines[i].trim() === '---') {
        dashCount++;
        if (dashCount === 2) pastFrontmatter = true;
      }
      continue;
    }
    if (lines[i].trimEnd() === target) {
      return { line: i + 1 };
    }
  }
  return null;
}

/**
 * Escape special regex characters.
 * @param {string} s
 * @returns {string}
 */
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { checkRoutingQuality };
