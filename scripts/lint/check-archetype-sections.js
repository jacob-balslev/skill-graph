#!/usr/bin/env node
/**
 * Archetype-aware section validator for SKILL.md files.
 *
 * Each archetype has a minimum required set of H2 body sections defined in
 * `docs/metadata-contract.md § Archetype Section Map`. This check:
 *
 *   - Errors on any required H2 section that is missing from the body.
 *   - Warns on any H2 section that exists but whose content is empty
 *     (< 50 non-whitespace characters between consecutive H2 headers).
 *
 * The warning threshold (50 chars) catches placeholder sections like
 * `## Verification\n\n(todo)\n` without tripping on intentionally terse
 * but real sections such as a two-bullet `## Do NOT Use When` list.
 *
 * @module lint/check-archetype-sections
 */

'use strict';

/**
 * Required H2 sections per archetype, sourced from
 * `docs/metadata-contract.md § Archetype Section Map`.
 *
 * @type {Record<string, string[]>}
 */
const REQUIRED_SECTIONS = {
  capability: ['Coverage', 'Philosophy', 'Verification', 'Do NOT Use When'],
  workflow:   ['Coverage', 'Philosophy', 'Workflow', 'Verification', 'Do NOT Use When'],
  router:     ['Coverage', 'Routing Rules', 'Do NOT Use When'],
  overlay:    ['Coverage', 'Overlay Rules', 'Extends', 'Do NOT Use When'],
};

/**
 * Extract all top-level H2 section headers from the markdown body (the part
 * after the closing `---` of the frontmatter block).
 *
 * @param {string} sourceText - Full SKILL.md content.
 * @returns {Array<{heading: string, line: number, contentLength: number}>}
 *   Each entry has the heading text (without `## `), the 1-based line number
 *   of the `## …` line, and the number of non-whitespace characters in the
 *   section body (i.e. between this H2 and the next one or end-of-file).
 */
function extractH2Sections(sourceText) {
  const lines = sourceText.split('\n');

  // Find the end of the frontmatter block (second `---`).
  let bodyStart = 0;
  let dashCount = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      dashCount++;
      if (dashCount === 2) { bodyStart = i + 1; break; }
    }
  }

  // Collect H2 positions in body.
  const h2s = [];
  for (let i = bodyStart; i < lines.length; i++) {
    const m = lines[i].match(/^## (.+)$/);
    if (m) {
      h2s.push({ heading: m[1].trim(), lineIdx: i });
    }
  }

  // For each H2, measure how many non-whitespace characters are in its body.
  const sections = [];
  for (let j = 0; j < h2s.length; j++) {
    const start = h2s[j].lineIdx + 1;
    const end   = j + 1 < h2s.length ? h2s[j + 1].lineIdx : lines.length;
    const body  = lines.slice(start, end).join('\n');
    sections.push({
      heading:       h2s[j].heading,
      line:          h2s[j].lineIdx + 1, // 1-based
      contentLength: body.replace(/\s/g, '').length,
    });
  }

  return sections;
}

/**
 * Run archetype-aware section validation on one SKILL.md file.
 *
 * @param {object} opts
 * @param {string} opts.filePath   - Path to the file (used in messages).
 * @param {string} opts.sourceText - Full file content.
 * @param {object} opts.fm         - Parsed frontmatter object.
 * @param {number} [opts.emptyThreshold=50] - Minimum non-whitespace characters for
 *   a section to be considered non-empty.
 *
 * @returns {{
 *   errors: Array<{message: string, line: number, column: number, help: string}>,
 *   warnings: Array<{message: string, line: number, column: number, help: string}>
 * }}
 */
function checkArchetypeSections(opts) {
  const {
    filePath,
    sourceText,
    fm,
    emptyThreshold = 50,
  } = opts;

  const errors   = [];
  const warnings = [];

  if (!fm || !fm.type) {
    // Cannot validate without a type — schema check handles missing type.
    return { errors, warnings };
  }

  const archetype = fm.type;
  const required  = REQUIRED_SECTIONS[archetype];

  if (!required) {
    // Unknown archetype — schema check handles this.
    return { errors, warnings };
  }

  const sections = extractH2Sections(sourceText);
  const presentHeadings = new Set(sections.map(s => s.heading));

  // Error: missing required sections.
  for (const req of required) {
    if (!presentHeadings.has(req)) {
      // Point at line 1 col 1 (frontmatter type: field would be ideal but
      // locateYamlKey is in the parent; use line 1 as a safe fallback — the
      // formatter still shows the file reference clearly).
      errors.push({
        message: `missing required section "## ${req}" for archetype "${archetype}"`,
        line:    1,
        column:  1,
        help:    `Add a "## ${req}" section. Required sections for ${archetype}: ${required.map(r => `"## ${r}"`).join(', ')}. See docs/metadata-contract.md § Archetype Section Map.`,
      });
    }
  }

  // Warn: sections present but empty.
  for (const section of sections) {
    if (section.contentLength < emptyThreshold) {
      warnings.push({
        message: `section "## ${section.heading}" exists but appears empty (${section.contentLength} non-whitespace chars, threshold ${emptyThreshold})`,
        line:    section.line,
        column:  1,
        help:    `Fill in the "## ${section.heading}" section or remove it if it is not needed for this archetype.`,
      });
    }
  }

  return { errors, warnings };
}

module.exports = { checkArchetypeSections, REQUIRED_SECTIONS };
