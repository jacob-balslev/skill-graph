#!/usr/bin/env node
/**
 * Skill Graph lint tool.
 *
 * Validates every `skills/<name>/SKILL.md` (and optionally
 * `examples/skill-template.md`) against the frontmatter contract. Runs:
 *
 *   1. Schema validation against `schemas/skill.schema.json`
 *   2. Parent-directory-matches-name check (Agent Skills compatibility)
 *   3. Relation target existence check (adjacent, boundary, verify_with,
 *      depends_on targets must be real sibling skills in the repo)
 *   4. Eval artifact coherence check (eval_status: evals requires at
 *      least one eval file targeting the skill)
 *   5. scope: operational → require domain_frame (conditional from schema)
 *
 * Self-contained. Only uses Node built-ins — no external dependencies.
 * Exit 0 on success, 1 on any failure.
 *
 * Usage:
 *   node scripts/skill-lint.js                 # lint all skills
 *   node scripts/skill-lint.js skills/a11y     # lint one skill
 *   node scripts/skill-lint.js --include-template  # also lint the example template
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(REPO_ROOT, 'skills');
const TEMPLATE_PATH = path.join(REPO_ROOT, 'examples', 'skill-template.md');
const SCHEMA_PATH = path.join(REPO_ROOT, 'schemas', 'skill.schema.json');
const EVALS_DIR = path.join(REPO_ROOT, 'examples', 'evals');

function loadSchema() {
  return JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
}

// Minimal YAML frontmatter parser for the subset used in Skill Graph
// SKILL.md files. Handles: scalar keys, quoted strings, block sequences,
// nested objects, and inline comments.
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

// Minimal schema validator covering the subset used by skill.schema.json:
// required fields, type checks, enum constraints, pattern constraints,
// and the two conditional rules (overlay → extends, operational → domain_frame).
function validateAgainstSchema(fm, schema) {
  const errors = [];
  const props = schema.properties || {};

  for (const req of schema.required || []) {
    if (!(req in fm)) errors.push(`missing required field: ${req}`);
  }
  for (const key of Object.keys(fm)) {
    if (!(key in props)) errors.push(`unknown field: ${key}`);
  }

  function checkField(key, value, spec) {
    if (value === null || value === undefined) return;
    if (spec.enum && !spec.enum.includes(value)) {
      errors.push(`${key}: value ${JSON.stringify(value)} not in enum ${JSON.stringify(spec.enum)}`);
    }
    if (spec.pattern && typeof value === 'string' && !new RegExp(spec.pattern).test(value)) {
      errors.push(`${key}: value "${value}" does not match pattern ${spec.pattern}`);
    }
    if (spec.minLength && typeof value === 'string' && value.length < spec.minLength) {
      errors.push(`${key}: length ${value.length} < minLength ${spec.minLength}`);
    }
    if (spec.type === 'array' && !Array.isArray(value)) {
      errors.push(`${key}: expected array, got ${typeof value}`);
    }
    if (spec.type === 'object' && typeof value === 'object' && !Array.isArray(value)) {
      if (spec.required) {
        for (const r of spec.required) {
          if (!(r in (value || {}))) errors.push(`${key}.${r}: missing required sub-field`);
        }
      }
      if (spec.properties) {
        for (const sk of Object.keys(value || {})) {
          if (!(sk in spec.properties)) errors.push(`${key}.${sk}: unknown sub-field`);
        }
      }
    }
    if (spec.oneOf) {
      // schema_version uses oneOf — accept any match
      const anyMatch = spec.oneOf.some(variant => {
        if (variant.const !== undefined && value === variant.const) return true;
        if (variant.type === 'integer' && Number.isInteger(value)) return true;
        if (variant.type === 'string' && typeof value === 'string' && (!variant.pattern || new RegExp(variant.pattern).test(value))) return true;
        return false;
      });
      if (!anyMatch) errors.push(`${key}: value does not match any oneOf variant`);
    }
  }

  for (const [key, value] of Object.entries(fm)) {
    if (props[key]) checkField(key, value, props[key]);
  }

  // Conditional rules from allOf
  if (fm.type === 'overlay' && !fm.extends) {
    errors.push(`type: overlay requires extends field`);
  }
  if (fm.scope === 'operational' && !fm.domain_frame) {
    errors.push(`scope: operational requires domain_frame field`);
  }

  return errors;
}

function checkParentDirMatchesName(filePath, fm) {
  // Only applies to skills/<name>/SKILL.md, not the example template
  if (!filePath.startsWith(SKILLS_DIR)) return [];
  const parentDir = path.basename(path.dirname(filePath));
  if (parentDir !== fm.name) {
    return [`parent directory "${parentDir}" does not match name "${fm.name}" (Agent Skills compatibility rule)`];
  }
  return [];
}

function checkRelationTargets(fm, knownSkillNames) {
  const errors = [];
  const rel = fm.relations || {};
  for (const kind of ['adjacent', 'boundary', 'verify_with', 'depends_on']) {
    const targets = rel[kind] || [];
    for (const t of targets) {
      if (!knownSkillNames.has(t)) {
        errors.push(`relations.${kind}: "${t}" does not match any known skill in ${SKILLS_DIR}`);
      }
    }
  }
  return errors;
}

function checkEvalCoherence(filePath, fm) {
  if (fm.eval_status !== 'evals') return [];
  if (!fs.existsSync(EVALS_DIR)) {
    return [`eval_status: evals declared but ${EVALS_DIR} does not exist`];
  }
  const evalFiles = fs.readdirSync(EVALS_DIR).filter(f => f.endsWith('.json'));
  for (const evalFile of evalFiles) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(EVALS_DIR, evalFile), 'utf8'));
      if (data.skill_name === fm.name) return [];
    } catch (e) {
      // ignore malformed eval files here; they are out of scope for this check
    }
  }
  return [`eval_status: evals declared but no file in ${EVALS_DIR} has skill_name: "${fm.name}"`];
}

function collectSkillFiles(args) {
  const files = [];
  const includeTemplate = args.includes('--include-template');
  const explicit = args.filter(a => !a.startsWith('--'));

  if (explicit.length > 0) {
    for (const arg of explicit) {
      const abs = path.resolve(arg);
      if (fs.statSync(abs).isDirectory()) {
        const skillMd = path.join(abs, 'SKILL.md');
        if (fs.existsSync(skillMd)) files.push(skillMd);
      } else if (abs.endsWith('SKILL.md') || abs.endsWith('.md')) {
        files.push(abs);
      }
    }
  } else {
    if (fs.existsSync(SKILLS_DIR)) {
      for (const name of fs.readdirSync(SKILLS_DIR)) {
        const skillMd = path.join(SKILLS_DIR, name, 'SKILL.md');
        if (fs.existsSync(skillMd)) files.push(skillMd);
      }
    }
    if (includeTemplate && fs.existsSync(TEMPLATE_PATH)) files.push(TEMPLATE_PATH);
  }

  return files;
}

function main() {
  const args = process.argv.slice(2);
  const schema = loadSchema();
  const files = collectSkillFiles(args);

  if (files.length === 0) {
    console.error('No skill files found to lint.');
    process.exit(1);
  }

  // Build the known-skill set from skills/ for relation target checks
  const knownSkillNames = new Set();
  if (fs.existsSync(SKILLS_DIR)) {
    for (const name of fs.readdirSync(SKILLS_DIR)) {
      const skillMd = path.join(SKILLS_DIR, name, 'SKILL.md');
      if (fs.existsSync(skillMd)) {
        const fm = parseFrontmatter(fs.readFileSync(skillMd, 'utf8'));
        if (fm && fm.name) knownSkillNames.add(fm.name);
      }
    }
  }

  let totalErrors = 0;
  for (const file of files) {
    const relPath = path.relative(REPO_ROOT, file);
    const text = fs.readFileSync(file, 'utf8');
    const fm = parseFrontmatter(text);
    if (!fm) {
      console.error(`FAIL ${relPath}: no frontmatter found`);
      totalErrors++;
      continue;
    }
    const errors = [
      ...validateAgainstSchema(fm, schema),
      ...checkParentDirMatchesName(file, fm),
      ...checkRelationTargets(fm, knownSkillNames),
      ...checkEvalCoherence(file, fm),
    ];
    if (errors.length === 0) {
      console.log(`OK   ${relPath}`);
    } else {
      console.error(`FAIL ${relPath}`);
      for (const e of errors) console.error(`     - ${e}`);
      totalErrors += errors.length;
    }
  }

  console.log(`\n${files.length} file(s) checked, ${totalErrors} error(s).`);
  process.exit(totalErrors > 0 ? 1 : 0);
}

main();
