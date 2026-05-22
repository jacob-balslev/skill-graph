'use strict';

/**
 * Minimal frontmatter parser for the repo's SKILL.md files.
 *
 * Agents read SKILL.md frontmatter directly when routing, indexing, and
 * validating skills, so this parser intentionally supports the small YAML
 * subset our skills use instead of depending on a full YAML package.
 *
 * Supported structures:
 * - optional leading HTML comments before the frontmatter block
 * - top-level scalars
 * - block scalars using > or |
 * - inline lists: [a, b]
 * - block lists
 * - nested objects made of scalar values or block lists (used by relations)
 */

function matchFrontmatterBlock(content) {
  const normalized = content.replace(/^\uFEFF/, '');
  return normalized.match(/^((?:\s*<!--[\s\S]*?-->\s*)*)(---\r?\n)([\s\S]*?)(\r?\n---)/);
}

function extractFrontmatter(content) {
  const match = matchFrontmatterBlock(content);
  return match ? match[3] : null;
}

function countIndent(line) {
  const match = line.match(/^\s*/);
  return match ? match[0].length : 0;
}

function stripQuotes(value) {
  return value.replace(/^["']|["']$/g, '');
}

function parseInlineList(value) {
  const match = value.match(/^\[(.*)\]$/);
  if (!match) return null;

  const inner = match[1].trim();
  if (!inner) return [];

  return inner
    .split(',')
    .map((item) => stripQuotes(item.trim()))
    .filter(Boolean);
}

function collectBracketList(lines, startIndex, parentIndent) {
  const items = [];
  let index = startIndex;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();
    const indent = countIndent(line);

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (indent < parentIndent) break;
    if (trimmed === '[') {
      index += 1;
      continue;
    }
    if (trimmed === ']') {
      return [items, index + 1];
    }

    const normalized = trimmed.endsWith(',') ? trimmed.slice(0, -1).trim() : trimmed;
    if (normalized) items.push(stripQuotes(normalized));
    index += 1;
  }

  return [items, index];
}

function parseScalar(value) {
  const trimmed = value.trim();
  if (trimmed === '[]') return [];
  if (trimmed === '{}') return {};

  const inlineList = parseInlineList(trimmed);
  if (inlineList) return inlineList;

  return stripQuotes(trimmed);
}

function skipIgnorable(lines, index) {
  let current = index;
  while (current < lines.length) {
    const trimmed = lines[current].trim();
    if (!trimmed || trimmed.startsWith('#')) {
      current += 1;
      continue;
    }
    break;
  }
  return current;
}

function collectBlockScalar(lines, startIndex, parentIndent) {
  const collected = [];
  let index = startIndex;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();
    const indent = countIndent(line);

    if (!trimmed) {
      collected.push('');
      index += 1;
      continue;
    }

    if (indent <= parentIndent) break;
    collected.push(line.slice(parentIndent + 2));
    index += 1;
  }

  return [collected.join(' ').trim(), index];
}

function parseNode(lines, startIndex, indent) {
  const index = skipIgnorable(lines, startIndex);
  if (index >= lines.length) return [{}, index];

  const line = lines[index];
  const trimmed = line.trim();

  if (trimmed.startsWith('- ')) {
    return parseArray(lines, index, indent);
  }

  return parseObject(lines, index, indent);
}

function parseArray(lines, startIndex, indent) {
  const items = [];
  let index = startIndex;

  while (index < lines.length) {
    index = skipIgnorable(lines, index);
    if (index >= lines.length) break;

    const line = lines[index];
    const trimmed = line.trim();
    const lineIndent = countIndent(line);

    if (lineIndent < indent || lineIndent !== indent || !trimmed.startsWith('- ')) {
      break;
    }

    const remainder = trimmed.slice(2).trim();
    if (!remainder) {
      const nestedIndex = skipIgnorable(lines, index + 1);
      if (nestedIndex < lines.length && countIndent(lines[nestedIndex]) > indent) {
        const [value, nextIndex] = parseNode(lines, nestedIndex, countIndent(lines[nestedIndex]));
        items.push(value);
        index = nextIndex;
      } else {
        items.push('');
        index += 1;
      }
      continue;
    }

    items.push(parseScalar(remainder));
    index += 1;
  }

  return [items, index];
}

function parseObject(lines, startIndex, indent) {
  const object = {};
  let index = startIndex;

  while (index < lines.length) {
    index = skipIgnorable(lines, index);
    if (index >= lines.length) break;

    const line = lines[index];
    const trimmed = line.trim();
    const lineIndent = countIndent(line);

    if (lineIndent < indent || lineIndent !== indent) break;

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) {
      index += 1;
      continue;
    }

    const key = trimmed.slice(0, colonIndex).trim();
    const remainder = trimmed.slice(colonIndex + 1).trim();

    if (remainder === '>' || remainder === '|') {
      const [value, nextIndex] = collectBlockScalar(lines, index + 1, lineIndent);
      object[key] = value;
      index = nextIndex;
      continue;
    }

    if (!remainder) {
      const nestedIndex = skipIgnorable(lines, index + 1);
      if (nestedIndex < lines.length && countIndent(lines[nestedIndex]) > lineIndent) {
        const nestedLine = lines[nestedIndex].trim();
        const [value, nextIndex] = nestedLine === '['
          ? collectBracketList(lines, nestedIndex, countIndent(lines[nestedIndex]))
          : parseNode(lines, nestedIndex, countIndent(lines[nestedIndex]));
        object[key] = value;
        index = nextIndex;
      } else {
        object[key] = '';
        index += 1;
      }
      continue;
    }

    object[key] = parseScalar(remainder);
    index += 1;
  }

  return [object, index];
}

function parseFrontmatter(content) {
  const frontmatter = extractFrontmatter(content);
  if (!frontmatter) return {};

  const lines = frontmatter.split('\n').map((line) => line.replace(/\r$/, ''));
  const [parsed] = parseObject(lines, 0, 0);
  return parsed;
}

function parseYamlList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value !== 'string') return [];

  const inlineList = parseInlineList(value.trim());
  if (inlineList) return inlineList;

  if (value.includes(',')) {
    return value
      .split(',')
      .map((item) => stripQuotes(item.trim()))
      .filter(Boolean);
  }

  return [stripQuotes(value.trim())].filter(Boolean);
}

// ─── Serialization ──────────────────────────────────────────────

/**
 * Returns true if a scalar string needs YAML quoting.
 */
function needsQuoting(str) {
  if (!str || typeof str !== 'string') return false;
  if (/^[\d.]+$/.test(str)) return false; // pure numbers are fine
  if (/[:{}\[\],&*?|><=!%@`\n\r]/.test(str)) return true;
  if (str !== str.trim()) return true; // leading/trailing whitespace
  if (str === 'true' || str === 'false' || str === 'null') return true;
  return false;
}

/**
 * Serialize a single YAML scalar value.
 */
function serializeScalar(value) {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  if (needsQuoting(str)) return `"${str.replace(/"/g, '\\"')}"`;
  return str;
}

/**
 * Serialize a JS value to YAML lines at the given indent depth.
 * Returns an array of lines (without trailing newline).
 */
function serializeValue(value, indent) {
  const prefix = '  '.repeat(indent);

  if (value === null || value === undefined) {
    return ['""'];
  }

  if (typeof value === 'string') {
    return [serializeScalar(value)];
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return ['[]'];

    // Short inline lists for simple string arrays (≤5 items, all short)
    const allSimple = value.every((v) => typeof v === 'string' && v.length < 40 && !needsQuoting(v));
    if (allSimple && value.length <= 5) {
      return [`[${value.join(', ')}]`];
    }

    // Block list
    const lines = [];
    for (const item of value) {
      if (typeof item === 'string') {
        lines.push(`${prefix}- ${serializeScalar(item)}`);
      } else {
        // Nested object/array under list item
        const nested = serializeObject(item, indent + 1);
        lines.push(`${prefix}-`);
        lines.push(...nested);
      }
    }
    return ['\n' + lines.join('\n')];
  }

  if (typeof value === 'object') {
    if (Object.keys(value).length === 0) return ['{}'];

    const lines = serializeObject(value, indent);
    return ['\n' + lines.join('\n')];
  }

  return [String(value)];
}

/**
 * Serialize a JS object to YAML lines at the given indent depth.
 */
function serializeObject(obj, indent) {
  const prefix = '  '.repeat(indent);
  const lines = [];

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;

    const serialized = serializeValue(value, indent + 1);

    if (serialized.length === 1 && !serialized[0].startsWith('\n')) {
      lines.push(`${prefix}${key}: ${serialized[0]}`);
    } else {
      // Multi-line value — key on its own line, value indented below
      lines.push(`${prefix}${key}:${serialized[0]}`);
    }
  }

  return lines;
}

/**
 * Serialize a full frontmatter object to YAML string (without --- markers).
 */
function serializeFrontmatter(obj) {
  const lines = serializeObject(obj, 0);
  return lines.join('\n');
}

/**
 * Serialize a relations object to YAML block.
 * Output format:
 *   relations:
 *     adjacent:
 *       - skill-a
 *     boundary:
 *       - skill-b
 *     verify_with:
 *       - skill-c
 */
function serializeRelations(relations) {
  if (!relations || typeof relations !== 'object') return 'relations: {}';

  const hasContent = Object.values(relations).some(
    (v) => Array.isArray(v) && v.length > 0,
  );
  if (!hasContent) return 'relations: {}';

  const lines = ['relations:'];
  for (const [key, value] of Object.entries(relations)) {
    if (!Array.isArray(value) || value.length === 0) continue;
    lines.push(`  ${key}:`);
    for (const item of value) {
      lines.push(`    - ${item}`);
    }
  }
  return lines.join('\n');
}

/**
 * Replace or insert the relations block in a SKILL.md file's content.
 * Preserves all other frontmatter formatting exactly.
 *
 * @param {string} content  Full file content
 * @param {object} relations  { adjacent: [], boundary: [], verify_with: [] }
 * @returns {string} Updated file content
 */
function updateFrontmatterRelations(content, relations) {
  const fmMatch = matchFrontmatterBlock(content);
  if (!fmMatch) return content;

  const prefix = fmMatch[1];
  const before = fmMatch[2]; // "---\n"
  let yaml = fmMatch[3];
  const after = fmMatch[4]; // "\n---"
  const rest = content.slice(fmMatch[0].length);

  const relBlock = serializeRelations(relations);

  // Try to find and replace existing relations block.
  // The block starts with "relations:" at indent 0 and continues until
  // the next top-level key or end of frontmatter.
  // `[^\n]` instead of `.` and `\r?\n` instead of `\n` keep this CRLF-safe;
  // JS regex `.` does NOT match `\r`, so the prior pattern terminated the
  // match at the first `\r` on Windows files and the replace dropped only
  // "relations:" itself — leaving every child key behind to collide with
  // the newly inserted block.
  const relPattern = /^relations:[^\n]*(?:\r?\n(?:  |\t)[^\n]*)*/m;
  if (relPattern.test(yaml)) {
    yaml = yaml.replace(relPattern, relBlock);
  } else {
    // No relations block exists — append before end
    yaml = yaml.trimEnd() + '\n' + relBlock;
  }

  return prefix + before + yaml + after + rest;
}

/**
 * Insert or update a single scalar field in SKILL.md frontmatter.
 * Places new fields before the `relations:` block or at the end.
 *
 * @param {string} content  Full file content
 * @param {string} key      Field name (e.g., 'layer')
 * @param {string} value    Scalar value
 * @returns {string} Updated file content
 */
function serializeFieldValue(value) {
  // Single-line scalar form. Arrays render as YAML inline lists when short and
  // simple; longer arrays would need block format (not supported here — caller
  // should split into multiple fields or pre-trim).
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const items = value.map((v) => serializeScalar(String(v)));
    return `[${items.join(', ')}]`;
  }
  return serializeScalar(value);
}

function updateFrontmatterField(content, key, value) {
  const fmMatch = matchFrontmatterBlock(content);
  if (!fmMatch) return content;

  const prefix = fmMatch[1];
  const before = fmMatch[2];
  let yaml = fmMatch[3];
  const after = fmMatch[4];
  const rest = content.slice(fmMatch[0].length);

  const fieldLine = `${key}: ${serializeFieldValue(value)}`;

  // Replace existing single-line scalar field. Multi-line block forms (block
  // scalars `>` / `|`, block lists, nested objects) need a different replace
  // strategy; the caller should use updateFrontmatterRelations for relations
  // or extend this helper before reusing it on those shapes.
  //
  // Allow up to 4 spaces of leading indent so fields nested under a `metadata:`
  // block (e.g. `  application_verdict: UNVERIFIED`) are matched and replaced
  // in-place rather than leaving the indented field intact and appending a
  // duplicate top-level field. The replacement preserves the original indent so
  // the YAML structure stays valid. (Bug fix SH-6302 — 2026-05-22)
  const fieldPattern = new RegExp(`^([ \\t]{0,4})${key}:.*$`, 'm');
  const existingMatch = yaml.match(fieldPattern);
  if (existingMatch) {
    const existingIndent = existingMatch[1];
    yaml = yaml.replace(fieldPattern, `${existingIndent}${fieldLine}`);
  } else {
    // Insert before relations: block, or at end of frontmatter
    const relIndex = yaml.indexOf('\nrelations:');
    if (relIndex !== -1) {
      yaml = yaml.slice(0, relIndex) + '\n' + fieldLine + yaml.slice(relIndex);
    } else {
      yaml = yaml.trimEnd() + '\n' + fieldLine;
    }
  }

  return prefix + before + yaml + after + rest;
}

/**
 * Insert or update multiple scalar fields in SKILL.md frontmatter.
 * Applies fields in object iteration order using updateFrontmatterField().
 *
 * @param {string} content  Full file content
 * @param {object} fields   Key/value map of scalar fields to set
 * @returns {string} Updated file content
 */
function updateFrontmatterFields(content, fields) {
  let nextContent = content;
  for (const [key, value] of Object.entries(fields || {})) {
    nextContent = updateFrontmatterField(nextContent, key, value);
  }
  return nextContent;
}

module.exports = {
  extractFrontmatter,
  parseFrontmatter,
  parseYamlList,
  serializeFrontmatter,
  serializeRelations,
  updateFrontmatterRelations,
  updateFrontmatterField,
  updateFrontmatterFields,
};
