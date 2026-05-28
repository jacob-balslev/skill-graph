#!/usr/bin/env node
/**
 * export-skill.js - SKILL.md export transform.
 *
 * Reads a Skill Graph SKILL.md, moves every Skill Graph extension field under
 * the plain `metadata:` key, and writes a SKILL.md-format export to the skill
 * directory (or to --output <path>).
 *
 * The resulting file has at most 6 top-level fields:
 *   name, description, license, compatibility, allowed-tools, metadata
 *
 * Plain SKILL.md metadata is a string-to-string map. Structured Skill Graph
 * extension values are therefore JSON-encoded as strings under metadata.
 *
 * Only the fields that are present in the source are included. Fields that are
 * absent (e.g. license is optional) are omitted from the output rather than
 * written as null.
 *
 * Usage:
 *   node scripts/export-skill.js <skill-dir>
 *   node scripts/export-skill.js skills/documentation
 *   node scripts/export-skill.js skills/documentation --output /tmp/doc.skill-md.md
 *
 * Exit 0 on success, 1 on error.
 *
 * Self-contained. Only uses Node built-ins - no external dependencies.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { normalizeFrontmatter, parseFrontmatter } = require('./lib/parse-frontmatter');

// Plain SKILL.md fields that stay at the top level of the output.
// Order matters for the generated YAML - base fields appear first.
const SKILL_MD_BASE_FIELDS = ['name', 'description', 'license', 'compatibility', 'allowed-tools'];

// Skill Graph extension fields that move under metadata:.
// Every known Skill Graph extension field is listed here so the set is
// explicit and auditable. Unknown fields that appear in the frontmatter but
// are not in either list are placed under metadata: too (fail-safe).
//
// Updated for schema_version 4: `category` is the flat browse shelf,
// `domain` is the hierarchical domain path, `workspace_tags` is authored
// relevance, and `routing_bundles` is the activation-bundle field. The
// legacy `family` remains in the set for back-compat with v2 skills during
// the migration window.
const SKILL_GRAPH_EXTENSION_FIELDS = new Set([
  'schema_version',
  'urn',
  'version',
  'type',
  'archetype',
  'category',
  'domain',
  'family',
  'scope',
  'subject',
  'subjects',
  'deployment_target',
  'taxonomy_domain',
  'owner',
  'freshness',
  'reviewed_at',
  'drift_check',
  'eval_artifacts',
  'eval_state',
  'routing_eval',
  'comprehension_state',
  'eval_last_run',
  'eval',
  'stability',
  'superseded_by',
  'relations',
  'grounding',
  'portability',
  'concept',
  'triggers',
  'keywords',
  'paths',
  'project',
  'repo',
  'routing_bundles',
  'lifecycle',
  'runtime_telemetry',
  'secondary_categories',
  'marketplace_tier',
  'last_audited',
  'last_changed',
  'structural_verdict',
  'truth_verdict',
  'comprehension_verdict',
  'application_verdict',
  // `audit_verdict` is the DEPRECATED v6 single-aggregate field, replaced by the
  // four discrete verdicts above in v7 (ADR-0011). Kept in this list for
  // back-compat reads of skills that haven't been run through the v6→v7 codemod
  // yet. Schema-level removal is tracked in SH-6557; this entry retires when that
  // ticket lands. See lib/audit/skill-status.js:38-46 for the canonical comment.
  'audit_verdict',
  'eval_score',
  'eval_failed_ids',
  'lint_verdict',
  'drift_status',
  'mental_model',
  'purpose',
  'boundary',
  'analogy',
  'misconception',
  'extends',
  'allowed_tools',
]);

/**
 * Flatten a v3 `compatibility` object to a single free-text string suitable
 * for the plain SKILL.md `compatibility` field.
 *
 * v3 shape:  { runtimes?: string[], node?: string, notes?: string }
 * v2 shape:  string (passed through unchanged)
 *
 * Concatenation order: runtimes, node, notes - joined with "; ".
 */
function flattenCompatibility(value) {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return null;
  const parts = [];
  const runtimes = Array.isArray(value.runtimes) && value.runtimes.length > 0
    ? value.runtimes
    : value.agent_runtimes;
  if (Array.isArray(runtimes) && runtimes.length > 0) {
    parts.push(runtimes.join(', '));
  }
  const nodeVersion = value.node || value.node_version;
  if (nodeVersion) parts.push(`node ${nodeVersion}`);
  if (value.notes) parts.push(value.notes);
  return parts.join('; ');
}

function validateName(name) {
  return typeof name === 'string' && name.length > 0
    ? { ok: true }
    : { ok: false };
}

function normalizeExportName(name) {
  return String(name || '')
    .replace(/[/:]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
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
 * Convert a Skill Graph extension value into a plain SKILL.md metadata string.
 * Metadata exports use string keys to string values, so objects and arrays are
 * preserved as compact JSON strings.
 *
 * @param {*} value - Parsed Skill Graph frontmatter value.
 * @returns {string|null} Metadata-safe string value.
 */
function metadataStringValue(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return JSON.stringify(value);
  } catch (e) {
    return String(value);
  }
}

/**
 * Build the output YAML frontmatter from the parsed frontmatter object.
 * Only includes fields that are actually present in the source.
 *
 * @param {object} fm - Parsed frontmatter.
 * @returns {string}  - Full frontmatter block including --- delimiters.
 */
function buildFrontmatter(fm, options = {}) {
  const lines = ['---'];

  // 1. Top-level plain SKILL.md fields (in canonical order).
  for (const field of SKILL_MD_BASE_FIELDS) {
    if (!(field in fm) || fm[field] === null || fm[field] === undefined) {
      if (field !== 'allowed-tools' || fm.allowed_tools === null || fm.allowed_tools === undefined) continue;
    }
    // v3: compatibility is an object; plain SKILL.md wants a string. Flatten.
    let value = field === 'allowed-tools' && !(field in fm) ? fm.allowed_tools : fm[field];
    if (field === 'name') {
      value = normalizeExportName(value);
    }
    if (field === 'compatibility' && typeof value === 'object' && value !== null) {
      value = flattenCompatibility(value);
      if (!value) continue;
    }
    const serialized = serializeValue(value, 1);
    if (serialized.startsWith('\n')) {
      lines.push(`${field}:${serialized}`);
    } else {
      lines.push(`${field}: ${serialized}`);
    }
  }

  // 2. Gather all fields that belong under metadata:.
  //    Metadata export values are strings, so structured extension values
  //    are JSON-encoded rather than emitted as nested YAML objects.
  const metadataEntries = {};
  for (const [key, value] of Object.entries(fm)) {
    if (SKILL_MD_BASE_FIELDS.includes(key)) continue;
    if (key === 'allowed_tools') continue;
    if (value === null || value === undefined) continue;
    const metadataValue = metadataStringValue(value);
    if (metadataValue !== null) metadataEntries[key] = metadataValue;
  }

  if (options.metadata && typeof options.metadata === 'object') {
    for (const [key, value] of Object.entries(options.metadata)) {
      const metadataValue = metadataStringValue(value);
      if (metadataValue !== null) metadataEntries[key] = metadataValue;
    }
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
  const m = text.match(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)([\s\S]*)$/);
  return m ? m[1] : '';
}

function buildExportedSkill(text, options = {}) {
  const fm = normalizeFrontmatter(parseFrontmatter(text));
  if (!fm) return null;
  const exportFm = { ...fm };
  if (options.description) exportFm.description = options.description;
  const frontmatter = buildFrontmatter(exportFm, options);
  const body = extractBody(text);
  return body.trimEnd()
    ? `${frontmatter}\n${body}`
    : `${frontmatter}\n`;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`Usage: node scripts/export-skill.js <skill-dir> [--output <path>]

Exports a Skill Graph SKILL.md as a plain SKILL.md-format file.

Arguments:
  <skill-dir>         Path to the skill directory (must contain SKILL.md)
  --output <path>     Write output to this path instead of
                      <skill-dir>/SKILL.skill-md.md

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

  // Validate required identity field.
  if (!fm.name) {
    console.error('Error: frontmatter is missing the required "name" field.');
    process.exit(1);
  }
  const nameCheck = validateName(fm.name);
  if (!nameCheck.ok) {
    console.error('Error: frontmatter field "name" must be a non-empty string.');
    process.exit(1);
  }

  const output = buildExportedSkill(text);

  const dest = outputPath || path.join(skillDirAbs, 'SKILL.skill-md.md');
  fs.writeFileSync(dest, output, 'utf8');
  console.log(`Exported: ${dest}`);
  process.exit(0);
}

module.exports = {
  SKILL_MD_BASE_FIELDS,
  SKILL_GRAPH_EXTENSION_FIELDS,
  buildFrontmatter,
  buildExportedSkill,
  extractBody,
  flattenCompatibility,
  metadataStringValue,
  normalizeExportName,
  serializeValue,
  validateName,
};

if (require.main === module) main();
