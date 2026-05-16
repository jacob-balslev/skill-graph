#!/usr/bin/env node
/**
 * Minimal YAML frontmatter parser for the subset used in Skill Graph SKILL.md
 * files. Handles: scalar keys, quoted strings, block sequences, nested objects,
 * block sequences of objects (v3 boundary/depends_on `- skill: ... reason: ...`
 * form), inline comments, and inline maps (`key: { a: 1, b: 2 }`) at leaf level.
 *
 * Extracted from scripts/skill-lint.js so skill-lint, generate-manifest,
 * export-skill, skill-graph-route, and skill-graph-drift can share the same
 * parser without duplication.
 *
 * Usage:
 *   const { parseFrontmatter } = require('./lib/parse-frontmatter');
 *   const fm = parseFrontmatter(markdownText);  // returns object or null
 */

'use strict';

/**
 * Parse the YAML frontmatter block from a Markdown string.
 *
 * @param {string} text - Full contents of the Markdown file.
 * @returns {object|null} Parsed frontmatter as a plain object, or null if no
 *   frontmatter block is found.
 */
function parseFrontmatter(text) {
  const m = text.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!m) return null;
  const lines = m[1].split(/\r?\n/);
  let i = 0;

  /**
   * Strip a trailing YAML inline comment from a scalar value.
   *
   * Rules (YAML 1.2): an inline comment starts at a `#` preceded by
   * whitespace and runs to end-of-line. A `#` inside a quoted string does
   * NOT start a comment. This matters for `examples` / `anti_examples`
   * arrays where authors annotate hard-negative prompts with `# reason`
   * tails — the intent is documentation, not part of the routing signal.
   *
   * Handles three cases:
   *   1. Value starts with a quote — find the matching close quote, then
   *      everything after it up to an optional `  #` tail is stripped.
   *   2. Unquoted value — the first ` #` sequence begins the comment.
   *   3. Value contains no `#` — return unchanged.
   */
  function stripInlineComment(raw) {
    if (raw.length === 0) return raw;
    const first = raw[0];
    if (first === '"' || first === "'") {
      // Scan for the matching close quote.
      for (let idx = 1; idx < raw.length; idx++) {
        if (raw[idx] === '\\') { idx++; continue; }
        if (raw[idx] === first) {
          // Found close quote. Trim everything after it if it matches ` #...`.
          const tail = raw.slice(idx + 1);
          const commentMatch = tail.match(/^\s+#/);
          if (commentMatch) return raw.slice(0, idx + 1);
          return raw;
        }
      }
      // Unterminated quote — leave the author's text alone.
      return raw;
    }
    // Unquoted: find ` #` (space-hash).
    const m = raw.match(/\s+#/);
    if (m) return raw.slice(0, m.index);
    return raw;
  }

  function splitTopLevel(value, separator) {
    const parts = [];
    let start = 0;
    let depth = 0;
    let quote = null;
    for (let idx = 0; idx < value.length; idx++) {
      const ch = value[idx];
      if (quote) {
        if (ch === '\\') { idx++; continue; }
        if (ch === quote) quote = null;
        continue;
      }
      if (ch === '"' || ch === "'") {
        quote = ch;
        continue;
      }
      if (ch === '[' || ch === '{') {
        depth++;
        continue;
      }
      if (ch === ']' || ch === '}') {
        depth--;
        continue;
      }
      if (ch === separator && depth === 0) {
        parts.push(value.slice(start, idx).trim());
        start = idx + 1;
      }
    }
    parts.push(value.slice(start).trim());
    return parts.filter(Boolean);
  }

  function findTopLevelColon(value) {
    let depth = 0;
    let quote = null;
    for (let idx = 0; idx < value.length; idx++) {
      const ch = value[idx];
      if (quote) {
        if (ch === '\\') { idx++; continue; }
        if (ch === quote) quote = null;
        continue;
      }
      if (ch === '"' || ch === "'") {
        quote = ch;
        continue;
      }
      if (ch === '[' || ch === '{') {
        depth++;
        continue;
      }
      if (ch === ']' || ch === '}') {
        depth--;
        continue;
      }
      if (ch === ':' && depth === 0) return idx;
    }
    return -1;
  }

  function parseInlineArray(v) {
    const body = v.slice(1, -1).trim();
    if (body === '') return [];
    return splitTopLevel(body, ',').map(parseValue);
  }

  function parseInlineMap(v) {
    const body = v.slice(1, -1).trim();
    if (body === '') return {};
    const obj = {};
    for (const part of splitTopLevel(body, ',')) {
      const colonIdx = findTopLevelColon(part);
      if (colonIdx <= 0) return v;
      const key = extractKey(part.slice(0, colonIdx));
      const rawValue = part.slice(colonIdx + 1).trim();
      obj[key] = parseValue(rawValue);
    }
    return obj;
  }

  function parseValue(v) {
    v = stripInlineComment(v).trim();
    if (v === '') return null;
    if (v.startsWith('[') && v.endsWith(']')) return parseInlineArray(v);
    if (v.startsWith('{') && v.endsWith('}')) return parseInlineMap(v);
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      return v.slice(1, -1);
    }
    if (/^-?\d+$/.test(v)) return parseInt(v, 10);
    if (/^-?\d+\.\d+$/.test(v)) return parseFloat(v);
    if (v === 'true') return true;
    if (v === 'false') return false;
    if (v === 'null' || v === '~') return null;
    return v;
  }

  /**
   * Find the index of the key-separator colon in a YAML line. Handles quoted
   * keys — a key like `"schemas/foo.json":` has a colon inside the quoted
   * string that is NOT the separator. Returns the index of the separating
   * colon or -1 when none is found.
   */
  function findKeyColon(content) {
    if (content.startsWith('"') || content.startsWith("'")) {
      const quote = content[0];
      let i = 1;
      while (i < content.length) {
        if (content[i] === '\\') { i += 2; continue; }
        if (content[i] === quote) break;
        i++;
      }
      // i is at the closing quote; look for `:` after it
      const afterQuote = content.indexOf(':', i + 1);
      return afterQuote;
    }
    return content.indexOf(':');
  }

  /**
   * Extract the key portion from a "key: value" line, unquoting if the key
   * was wrapped in quotes.
   */
  function extractKey(raw) {
    const trimmed = raw.trim();
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
        (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
      return trimmed.slice(1, -1);
    }
    return trimmed;
  }

  /**
   * Parse a block sequence (array). Supports:
   *   - scalar items:        "- string"
   *   - inline objects:      "- { key: value }"
   *   - block-mapping items: "- key: value\n  nextKey: value"
   *
   * The sequence ends when a line's indent drops to or below `indent`, or
   * when the block is exhausted.
   */
  function parseBlockSequence(indent) {
    const arr = [];
    while (i < lines.length) {
      const l = lines[i];
      if (l.trim() === '' || l.trim().startsWith('#')) { i++; continue; }
      const li = l.match(/^ */)[0].length;
      if (li <= indent) break;
      const lc = l.slice(li);
      if (!lc.startsWith('- ')) break;

      const inline = lc.slice(2).trim();

      if ((inline.startsWith('{') && inline.endsWith('}')) ||
          (inline.startsWith('[') && inline.endsWith(']'))) {
        arr.push(parseValue(inline));
        i++;
        continue;
      }

      // Block mapping as an item: "- key: value" optionally followed by
      // more keys at indent (li + 2). Distinguish from scalar items like
      // "- http://example.com" (no space after colon) or `- "a:b"` (quoted).
      const isQuoted = inline.startsWith('"') || inline.startsWith("'");
      const colonIdx = isQuoted ? -1 : inline.indexOf(': ');
      const endsWithColon = !isQuoted && inline.endsWith(':');

      if (!isQuoted && (colonIdx > 0 || endsWithColon)) {
        // Parse as object item.
        const obj = {};
        const itemIndent = li + 2;

        // First key on the dash line.
        if (endsWithColon) {
          const k = inline.slice(0, -1).trim();
          i++;
          // The value of the first key is whatever follows at deeper indent.
          // Leave it for the subsequent-key loop to handle — we just record
          // the key as null so downstream code sees it as present.
          obj[k] = null;
        } else {
          const k = inline.slice(0, colonIdx).trim();
          const v = inline.slice(colonIdx + 1).trim();
          obj[k] = parseValue(v);
          i++;
        }

        // Subsequent keys at itemIndent belong to this object.
        while (i < lines.length) {
          const nl = lines[i];
          if (nl.trim() === '' || nl.trim().startsWith('#')) { i++; continue; }
          const nli = nl.match(/^ */)[0].length;
          if (nli < itemIndent) break;
          if (nli === itemIndent) {
            const nlc = nl.slice(nli);
            if (nlc.startsWith('- ')) break;  // next item in the outer sequence
            const ci = nlc.indexOf(':');
            if (ci <= 0) break;
            const k = nlc.slice(0, ci).trim();
            const v = nlc.slice(ci + 1).trim();
            i++;
            if (v === '') {
              // Nested block — parse recursively at deeper indent.
              let peek = i;
              while (peek < lines.length && (lines[peek].trim() === '' || lines[peek].trim().startsWith('#'))) peek++;
              if (peek < lines.length) {
                const peekIndent = lines[peek].match(/^ */)[0].length;
                const peekContent = lines[peek].slice(peekIndent);
                if (peekIndent > itemIndent && peekContent.startsWith('- ')) {
                  obj[k] = parseBlockSequence(itemIndent);
                } else if (peekIndent > itemIndent) {
                  obj[k] = parseBlock(peekIndent);
                } else {
                  obj[k] = null;
                }
              }
            } else {
              obj[k] = parseValue(v);
            }
          } else {
            // Deeper indent without a matching itemIndent sibling — skip
            // gracefully; authors using exotic indent should fall back to
            // single-line scalars.
            i++;
          }
        }

        arr.push(obj);
      } else {
        arr.push(parseValue(inline));
        i++;
      }
    }
    return arr;
  }

  function parseBlock(indent) {
    const result = {};
    while (i < lines.length) {
      const line = lines[i];
      if (line.trim() === '' || line.trim().startsWith('#')) { i++; continue; }
      const currentIndent = line.match(/^ */)[0].length;
      if (currentIndent < indent) return result;
      if (currentIndent > indent) { i++; continue; }
      const content = line.slice(indent);
      const colonIdx = findKeyColon(content);
      if (colonIdx === -1) { i++; continue; }
      const key = extractKey(content.slice(0, colonIdx));
      const rest = content.slice(colonIdx + 1).trim();
      i++;
      if (rest === '') {
        let peek = i;
        while (peek < lines.length && (lines[peek].trim() === '' || lines[peek].trim().startsWith('#'))) peek++;
        if (peek < lines.length) {
          const peekLine = lines[peek];
          const peekIndent = peekLine.match(/^ */)[0].length;
          const peekContent = peekLine.slice(peekIndent);
          if (peekIndent > indent && peekContent.startsWith('- ')) {
            result[key] = parseBlockSequence(indent);
          } else if (peekIndent > indent) {
            result[key] = parseBlock(peekIndent);
          } else {
            result[key] = null;
          }
        }
      } else {
        result[key] = parseValue(rest);
      }
    }
    return result;
  }

  return parseBlock(0);
}

// Set of base SKILL.md fields that stay at the top level in the marketplace
// export shape. Anything else found under `metadata:` is a Skill Graph
// extension field that the export pipeline relocated to satisfy Anthropic
// Claude Code's frontmatter contract. The normalizer lifts those back to
// top-level so downstream consumers (lint, manifest, route, drift) can read
// the canonical shape regardless of which format the file is in.
const SKILL_MD_BASE_FIELDS = new Set([
  'name',
  'description',
  'license',
  'compatibility',
  'allowed-tools',
]);

// Provenance fields added by the export pipeline (see
// scripts/export-marketplace-skills.js § PROVENANCE_KEYS and the related
// description-length book-keeping fields). These are export-only metadata
// describing where the marketplace file came from; they are not authoring
// fields and the canonical schema does not declare them. The normalizer
// strips them so lint and manifest tooling see only the authored shape.
const EXPORT_PROVENANCE_FIELDS = new Set([
  'skill_graph_source_repo',
  'skill_graph_protocol',
  'skill_graph_project',
  'skill_graph_canonical_skill',
  'skill_graph_export_description',
  'skill_graph_canonical_description_length',
]);

/**
 * Convert a parsed frontmatter object from the marketplace export shape
 * (Skill Graph extension fields nested under `metadata:`, complex values
 * JSON-stringified) back to the canonical Skill Graph shape (all fields at
 * top-level, complex values as native arrays/objects).
 *
 * Idempotent: a canonical-shape input returns unchanged (modulo a defensive
 * copy). Top-level fields take precedence over `metadata.*` if both are
 * present — the explicit author signal wins.
 *
 * @param {object|null} fm - Parsed frontmatter (output of parseFrontmatter).
 * @returns {object|null} Canonicalized frontmatter, or null/undefined passthrough.
 */
function normalizeFrontmatter(fm) {
  if (!fm || typeof fm !== 'object') return fm;
  const metadata = fm.metadata;
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return fm;
  }

  const normalized = { ...fm };
  delete normalized.metadata;

  for (const [key, rawValue] of Object.entries(metadata)) {
    if (EXPORT_PROVENANCE_FIELDS.has(key)) continue;
    // Top-level wins. Authors who explicitly set both forms get the
    // top-level version preserved without surprise.
    if (key in normalized && !SKILL_MD_BASE_FIELDS.has(key)) continue;

    // Marketplace export JSON-stringifies arrays and objects so the resulting
    // YAML stays a flat string-to-string map. Restore native shape here.
    //
    // Two unescape passes are needed in order: our parseFrontmatter does not
    // currently decode YAML double-quote escape sequences (`\"` → `"`,
    // `\\` → `\`), so the raw value still contains literal backslashes from
    // the on-disk representation. Strip those before JSON.parse.
    if (typeof rawValue === 'string') {
      const trimmed = rawValue.trim();
      if ((trimmed.startsWith('[') && trimmed.endsWith(']')) ||
          (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
        const yamlUnescaped = trimmed.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        try {
          normalized[key] = JSON.parse(yamlUnescaped);
          continue;
        } catch (_err) {
          // Not valid JSON — fall through and keep the raw string.
        }
      }
    }
    normalized[key] = rawValue;
  }

  return normalized;
}

module.exports = { parseFrontmatter, normalizeFrontmatter };
