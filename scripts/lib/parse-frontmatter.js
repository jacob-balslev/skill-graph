#!/usr/bin/env node
/**
 * Minimal YAML frontmatter parser for the subset used in Skill Graph SKILL.md
 * files. Handles: scalar keys, quoted strings, block sequences, nested objects,
 * and inline comments.
 *
 * Extracted from scripts/skill-lint.js so both skill-lint and export-skill
 * can share the same parser without duplication.
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
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const lines = m[1].split('\n');
  let i = 0;

  function parseValue(v) {
    v = v.trim();
    if (v === '') return null;
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      return v.slice(1, -1);
    }
    if (/^-?\d+$/.test(v)) return parseInt(v, 10);
    if (v === 'true') return true;
    if (v === 'false') return false;
    return v;
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
      const colonIdx = content.indexOf(':');
      if (colonIdx === -1) { i++; continue; }
      const key = content.slice(0, colonIdx).trim();
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
            const arr = [];
            while (i < lines.length) {
              const l = lines[i];
              if (l.trim() === '' || l.trim().startsWith('#')) { i++; continue; }
              const li = l.match(/^ */)[0].length;
              if (li <= indent) break;
              const lc = l.slice(li);
              if (lc.startsWith('- ')) {
                arr.push(parseValue(lc.slice(2)));
                i++;
              } else {
                break;
              }
            }
            result[key] = arr;
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

module.exports = { parseFrontmatter };
