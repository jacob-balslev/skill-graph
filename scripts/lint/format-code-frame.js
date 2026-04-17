#!/usr/bin/env node
/**
 * Code-frame formatter for skill-lint error messages.
 *
 * Renders a diagnostic in the style popularised by Babel and Rust:
 *
 *   skills/a11y/SKILL.md:3:1
 *
 *   1 | ---
 *   2 | schema_version: 2
 * > 3 | nme: a11y
 *     | ^ unknown field: nme
 *   4 | description: "..."
 *   5 | version: 1.0.0
 *
 *   help: Remove or rename 'nme' to a known field. See docs/field-reference.md.
 *
 * Zero external dependencies. Uses only Node.js built-ins.
 *
 * @module lint/format-code-frame
 */

'use strict';

// ANSI colour codes. Disabled when noColor === true.
const COLORS = {
  red:    '\x1b[31m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  reset:  '\x1b[0m',
};

/**
 * Return a colour-escaped string, or the plain string if colour is disabled.
 *
 * @param {string} text
 * @param {string} colorCode - Key from the COLORS map.
 * @param {boolean} noColor  - When true, no ANSI codes are emitted.
 * @returns {string}
 */
function colorize(text, colorCode, noColor) {
  if (noColor) return text;
  return `${COLORS[colorCode] || ''}${text}${COLORS.reset}`;
}

/**
 * Format a diagnostic message with a code frame.
 *
 * @param {object} opts
 * @param {string}   opts.filePath    - Path to the file, relative to repo root.
 * @param {number}   opts.line        - 1-based line number of the error.
 * @param {number}   [opts.column=1]  - 1-based column number of the error.
 * @param {string}   opts.message     - Short error description (no trailing period needed).
 * @param {string}   [opts.help]      - Optional help/fix hint shown after the frame.
 * @param {string}   opts.sourceText  - Full text of the file (used to extract the frame).
 * @param {'error'|'warn'} [opts.severity='error'] - Controls caret colour.
 * @param {boolean}  [opts.noColor=false] - Suppress ANSI codes (CI / --no-color).
 * @param {number}   [opts.context=2]    - Lines of context above and below the target line.
 * @returns {string} Multi-line formatted diagnostic string.
 */
function formatCodeFrame(opts) {
  const {
    filePath,
    line,
    column = 1,
    message,
    help,
    sourceText,
    severity = 'error',
    noColor = false,
    context = 2,
  } = opts;

  const lines = sourceText.split('\n');
  const targetIdx = line - 1; // 0-based

  // Guard against out-of-range line numbers.
  if (targetIdx < 0 || targetIdx >= lines.length) {
    return formatSimple({ filePath, line, column, message, help, severity, noColor });
  }

  const firstLine = Math.max(0, targetIdx - context);
  const lastLine  = Math.min(lines.length - 1, targetIdx + context);

  // Width of the line-number gutter (right-aligned).
  const gutterWidth = String(lastLine + 1).length;

  const caretColor = severity === 'warn' ? 'yellow' : 'red';
  const labelColor = severity === 'warn' ? 'yellow' : 'red';
  const label      = severity === 'warn' ? 'warn' : 'error';

  // Header: file:line:col
  const header = colorize(
    `${filePath}:${line}:${column}`,
    'cyan',
    noColor
  );

  // Severity prefix
  const severityLabel = colorize(`[${label}]`, labelColor, noColor);

  const frameLines = [];

  for (let i = firstLine; i <= lastLine; i++) {
    const lineNum   = i + 1;
    const gutter    = String(lineNum).padStart(gutterWidth);
    const isTarget  = i === targetIdx;
    const indicator = isTarget ? colorize('>', 'bold', noColor) : ' ';
    const gutterStr = colorize(`${gutter} |`, 'dim', noColor);

    if (isTarget) {
      frameLines.push(`${indicator} ${gutterStr} ${lines[i]}`);
      // Caret line
      const caretPad = ' '.repeat(gutterWidth + 4 + (column - 1));
      const caret    = colorize('^', caretColor, noColor);
      const caretMsg = colorize(message, caretColor, noColor);
      frameLines.push(`${caretPad}${caret} ${caretMsg}`);
    } else {
      frameLines.push(`  ${gutterStr} ${lines[i]}`);
    }
  }

  const parts = [
    '',
    `${severityLabel} ${header}`,
    '',
    ...frameLines,
    '',
  ];

  if (help) {
    parts.push(colorize(`  help: ${help}`, 'dim', noColor));
    parts.push('');
  }

  return parts.join('\n');
}

/**
 * Fallback when line number is out of range — plain file:line:col + message.
 * @private
 */
function formatSimple({ filePath, line, column, message, help, severity, noColor }) {
  const labelColor = severity === 'warn' ? 'yellow' : 'red';
  const label      = severity === 'warn' ? 'warn' : 'error';
  const parts = [
    `${colorize(`[${label}]`, labelColor, noColor)} ${colorize(`${filePath}:${line}:${column}`, 'cyan', noColor)} ${message}`,
  ];
  if (help) parts.push(colorize(`  help: ${help}`, 'dim', noColor));
  return parts.join('\n');
}

/**
 * Locate the line and column of the first occurrence of a YAML key in the
 * frontmatter block of a SKILL.md file.
 *
 * Returns { line: 1-based, column: 1-based } or { line: 1, column: 1 } as a
 * fallback if the key is not found.
 *
 * @param {string} sourceText - Full file text.
 * @param {string} key        - YAML key to find (exact match, at the start of a line after optional spaces).
 * @returns {{ line: number, column: number }}
 */
function locateYamlKey(sourceText, key) {
  const lines = sourceText.split('\n');
  const pattern = new RegExp(`^(\\s*)${escapeRegex(key)}\\s*:`);
  for (let i = 0; i < lines.length; i++) {
    const m = pattern.exec(lines[i]);
    if (m) {
      return { line: i + 1, column: m[1].length + 1 };
    }
  }
  return { line: 1, column: 1 };
}

/**
 * Locate the line and column of the first occurrence of an H2 section header
 * in the body of a SKILL.md file.
 *
 * @param {string} sourceText - Full file text.
 * @param {string} heading    - Heading text without '## ' prefix (e.g. 'Verification').
 * @returns {{ line: number, column: number }}
 */
function locateH2Section(sourceText, heading) {
  const lines = sourceText.split('\n');
  const target = `## ${heading}`;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trimEnd() === target) {
      return { line: i + 1, column: 1 };
    }
  }
  return { line: 1, column: 1 };
}

/**
 * Escape special regex characters in a string.
 * @param {string} s
 * @returns {string}
 */
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { formatCodeFrame, locateYamlKey, locateH2Section };
