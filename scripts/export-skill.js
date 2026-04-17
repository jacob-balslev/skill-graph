#!/usr/bin/env node
/**
 * export-skill.js — Agent Skills export transform.
 *
 * Reads a Skill Graph SKILL.md, moves every Skill Graph extension field under
 * the Agent Skills `metadata:` key, and writes an Agent Skills-compatible
 * SKILL.agent-skills.md to the skill directory (or to --output <path>).
 *
 * The resulting file has exactly 6 top-level fields:
 *   name, description, license, compatibility, allowed-tools, metadata
 *
 * Only the fields that are present in the source are included. Fields that are
 * absent (e.g. license is optional) are omitted from the output rather than
 * written as null.
 *
 * Usage:
 *   node scripts/export-skill.js <skill-dir>
 *   node scripts/export-skill.js skills/documentation
 *   node scripts/export-skill.js skills/documentation --output /tmp/doc.agent-skills.md
 *
 * Exit 0 on success, 1 on error.
 *
 * Self-contained. Only uses Node built-ins — no external dependencies.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { parseFrontmatter } = require('./lib/parse-frontmatter');

// Agent Skills base fields that stay at the top level of the output.
// Order matters for the generated YAML — base fields appear first.
const AGENT_SKILLS_BASE_FIELDS = ['name', 'description', 'license', 'compatibility', 'allowed-tools'];

// Skill Graph extension fields that move under metadata:.
// Every known Skill Graph extension field is listed here so the set is
// explicit and auditable. Unknown fields that appear in the frontmatter but
// are not in either list are placed under metadata: too (fail-safe).
const SKILL_GRAPH_EXTENSION_FIELDS = new Set([
  'schema_version',
  'version',
  'type',
  'family',
  'scope',
  'owner',
  'freshness',
  'drift_check',
  'eval_status',
  'stability',
  'relations',
  'grounding',
  'portability',
  'triggers',
  'keywords',
  'paths',
  'route_groups',
  'extends',
]);

/**
 * Validate that a skill name is safe for Agent Skills. The Agent Skills
 * specification does not allow `/` (which would look like a path) or `:`
 * (which would break YAML parsing). If the name contains these characters,
 * emit a clear error and a suggested normalized form.
 *
 * @param {string} name
 * @returns {{ ok: boolean, suggestion?: string }}
 */
function validateName(name) {
  const forbidden = /[/:]/.test(name);
  if (!forbidden) return { ok: true };

  const suggestion = name
    .replace(/\//g, '-')
    .replace(/:/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return { ok: false, suggestion };
}

/**
 * Serialize a JavaScript value to YAML-compatible text at the given
 * indentation depth. Handles strings, numbers, booleans, null, arrays,
 * and plain objects. Does not handle multi-line strings or anchors.
 *
 * @param {*}      value  - Value to serialize.
 * @param {number} depth  - Current indent depth (2 spaces per level).
 * @returns {string}       YAML fragment (no trailing newline).
 */
function serializeValue(value, depth) {
  const indent = '  '.repeat(depth);

  if (value === null || value === undefined) {
    return 'null';
  }
  if (typeof value === 'boolean' || typeof value === 'number') {
    return String(value);
  }
  if (typeof value === 'string') {
    // Quote strings that contain special YAML characters or that look
    // like numbers/booleans, to avoid silent type coercion on re-parse.
    const needsQuote = /[:#\[\]{}&*!|>'"%@`,]/.test(value)
      || /^\s/.test(value)
      || /\s$/.test(value)
      || value === ''
      || /^(true|false|null|~|\d.*)$/i.test(value);
    if (needsQuote) {
      return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    }
    return value;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return '\n' + value
      .map(item => `${indent}- ${serializeValue(item, depth + 1)}`)
      .join('\n');
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) return '{}';
    return '\n' + keys
      .map(k => {
        const v = value[k];
        const serialized = serializeValue(v, depth + 1);
        // If the serialized value starts with a newline, the key goes on its
        // own line (block mapping); otherwise it is an inline scalar.
        if (serialized.startsWith('\n')) {
          return `${indent}${k}:${serialized}`;
        }
        return `${indent}${k}: ${serialized}`;
      })
      .join('\n');
  }
  return String(value);
}

/**
 * Build the output YAML frontmatter from the parsed frontmatter object.
 * Only includes fields that are actually present in the source.
 *
 * @param {object} fm - Parsed frontmatter.
 * @returns {string}  - Full frontmatter block including --- delimiters.
 */
function buildFrontmatter(fm) {
  const lines = ['---'];

  // 1. Top-level Agent Skills base fields (in canonical order).
  for (const field of AGENT_SKILLS_BASE_FIELDS) {
    if (!(field in fm) || fm[field] === null || fm[field] === undefined) continue;
    const serialized = serializeValue(fm[field], 1);
    if (serialized.startsWith('\n')) {
      lines.push(`${field}:${serialized}`);
    } else {
      lines.push(`${field}: ${serialized}`);
    }
  }

  // 2. Gather all fields that belong under metadata:.
  //    - Known Skill Graph extension fields
  //    - Any unknown fields not in the base set (fail-safe catch-all)
  const metadataEntries = {};
  for (const [key, value] of Object.entries(fm)) {
    if (AGENT_SKILLS_BASE_FIELDS.includes(key)) continue;
    if (value === null || value === undefined) continue;
    metadataEntries[key] = value;
  }

  if (Object.keys(metadataEntries).length > 0) {
    lines.push('metadata:');
    for (const [key, value] of Object.entries(metadataEntries)) {
      const serialized = serializeValue(value, 2);
      if (serialized.startsWith('\n')) {
        lines.push(`  ${key}:${serialized}`);
      } else {
        lines.push(`  ${key}: ${serialized}`);
      }
    }
  }

  lines.push('---');
  return lines.join('\n');
}

/**
 * Extract the Markdown body (everything after the closing ---).
 *
 * @param {string} text - Full file contents.
 * @returns {string}    - Body text (may be empty string).
 */
function extractBody(text) {
  const m = text.match(/^---\n[\s\S]*?\n---\n?([\s\S]*)$/);
  return m ? m[1] : '';
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`Usage: node scripts/export-skill.js <skill-dir> [--output <path>]

Exports a Skill Graph SKILL.md as an Agent Skills-compatible file.

Arguments:
  <skill-dir>         Path to the skill directory (must contain SKILL.md)
  --output <path>     Write output to this path instead of
                      <skill-dir>/SKILL.agent-skills.md

Exit 0 on success, 1 on error.`);
    process.exit(0);
  }

  // Parse --output flag
  let outputPath = null;
  const outputIdx = args.indexOf('--output');
  if (outputIdx !== -1) {
    if (!args[outputIdx + 1]) {
      console.error('Error: --output requires a path argument.');
      process.exit(1);
    }
    outputPath = path.resolve(args[outputIdx + 1]);
    args.splice(outputIdx, 2);
  }

  // First remaining non-flag arg is the skill directory
  const skillDir = args.find(a => !a.startsWith('--'));
  if (!skillDir) {
    console.error('Error: no skill directory specified.');
    process.exit(1);
  }

  const skillDirAbs = path.resolve(skillDir);
  const skillMd = path.join(skillDirAbs, 'SKILL.md');

  if (!fs.existsSync(skillMd)) {
    console.error(`Error: ${skillMd} not found.`);
    process.exit(1);
  }

  const text = fs.readFileSync(skillMd, 'utf8');
  const fm = parseFrontmatter(text);

  if (!fm) {
    console.error(`Error: no YAML frontmatter found in ${skillMd}.`);
    process.exit(1);
  }

  // Validate name
  if (!fm.name) {
    console.error('Error: frontmatter is missing the required "name" field.');
    process.exit(1);
  }
  const nameCheck = validateName(fm.name);
  if (!nameCheck.ok) {
    console.error(
      `Error: skill name "${fm.name}" contains characters not allowed by Agent Skills (/ or :).\n` +
      `Suggested safe name: "${nameCheck.suggestion}"\n` +
      `Update the "name" field in SKILL.md before exporting.`
    );
    process.exit(1);
  }

  const frontmatter = buildFrontmatter(fm);
  const body = extractBody(text);
  const output = body.trimEnd()
    ? `${frontmatter}\n${body}`
    : `${frontmatter}\n`;

  const dest = outputPath || path.join(skillDirAbs, 'SKILL.agent-skills.md');
  fs.writeFileSync(dest, output, 'utf8');
  console.log(`Exported: ${dest}`);
  process.exit(0);
}

main();
