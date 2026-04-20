#!/usr/bin/env node
/**
 * gen-field-reference.js — Schema → field-reference.generated.md
 *
 * Reads schemas/skill.v3.schema.json and emits docs/field-reference.generated.md
 * with one section per top-level field. The prose is taken from the schema's
 * `description` attributes; cross-links to the full reference + glossary are
 * inserted automatically.
 *
 * Purpose: provide a drift-free field reference that is guaranteed in sync
 * with the schema. The hand-authored `docs/field-reference.md` stays as the
 * canonical prose (richer examples, when-to-use guidance, lint notes). This
 * generator produces a thinner companion doc for consumers that want a
 * machine-guaranteed index of every field.
 *
 * Usage:
 *   node scripts/gen-field-reference.js                     # writes default path
 *   node scripts/gen-field-reference.js --output <path>     # custom path
 *   node scripts/gen-field-reference.js --check             # exit 1 if regeneration would differ
 *
 * No external dependencies.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SCHEMA_PATH = path.join(ROOT, 'schemas', 'skill.v3.schema.json');
const DEFAULT_OUTPUT = path.join(ROOT, 'docs', 'field-reference.generated.md');

function parseArgs(argv) {
  const args = { output: DEFAULT_OUTPUT, check: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--output' || a === '-o') args.output = path.resolve(argv[++i]);
    else if (a === '--check') args.check = true;
    else if (a === '--help' || a === '-h') {
      console.log('Usage: gen-field-reference.js [--output <path>] [--check]');
      process.exit(0);
    } else {
      console.error(`Unknown arg: ${a}`);
      process.exit(2);
    }
  }
  return args;
}

function loadSchema() {
  const raw = fs.readFileSync(SCHEMA_PATH, 'utf8');
  return JSON.parse(raw);
}

function renderObjectShape(prop, indent = 0) {
  if (prop.type === 'object' && prop.properties) {
    const pad = '  '.repeat(indent);
    const sub = Object.entries(prop.properties).map(([k, v]) => {
      const req = (prop.required || []).includes(k);
      const marker = req ? '*required*' : '*optional*';
      const desc = v.description ? ` — ${v.description.split('.')[0]}.` : '';
      const enumHint = v.enum ? ` (${v.enum.map(e => `\`${e}\``).join(' | ')})` : '';
      return `${pad}- \`${k}\` ${marker}${enumHint}${desc}`;
    });
    return sub.join('\n');
  }
  return '';
}

function typeLabel(prop) {
  if (prop.enum) return prop.enum.map(v => `\`${v}\``).join(' | ');
  if (prop.oneOf) return 'multiple — see schema';
  if (prop.type === 'array') {
    const itemType = prop.items ? (prop.items.type || (prop.items.oneOf ? 'string | object' : 'string')) : 'any';
    return `array of ${itemType}`;
  }
  if (prop.type) return prop.type;
  return 'any';
}

function renderField(name, prop, requiredSet) {
  const isRequired = requiredSet.has(name);
  const requiredLabel = isRequired ? ' *(required)*' : ' *(optional)*';
  const typeStr = typeLabel(prop);
  const desc = prop.description || '_No description in schema._';

  const parts = [
    `### \`${name}\`${requiredLabel}`,
    '',
    `**Type:** ${typeStr}`,
    '',
    desc.trim(),
    ''
  ];

  if (prop.pattern) parts.push('', `**Pattern:** \`${prop.pattern}\``, '');
  if (prop.format) parts.push('', `**Format:** ${prop.format}`, '');
  if (prop.minLength !== undefined) parts.push('', `**Min length:** ${prop.minLength}`, '');
  if (prop.maxLength !== undefined) parts.push('', `**Max length:** ${prop.maxLength}`, '');

  if (prop.type === 'object' && prop.properties) {
    parts.push('', '**Sub-fields:**', '', renderObjectShape(prop), '');
  }

  if (prop.items && prop.items.type === 'object' && prop.items.properties) {
    parts.push('', '**Item shape (object form):**', '', renderObjectShape(prop.items), '');
  }

  parts.push('', `**Full reference:** [\`docs/field-reference.md#${name}\`](field-reference.md#${name})`, '');

  return parts.join('\n').replace(/\n{3,}/g, '\n\n');
}

function render(schema) {
  const requiredSet = new Set(schema.required || []);
  const now = new Date().toISOString().slice(0, 10);
  const lines = [
    '# Skill Graph Field Reference (Generated)',
    '',
    `> **Generated from** \`schemas/skill.v3.schema.json\` on ${now} by \`scripts/gen-field-reference.js\`.`,
    '> **Do not edit by hand.** The canonical prose reference is [\`docs/field-reference.md\`](field-reference.md).',
    '> **Predicate glossary:** [\`docs/glossary.md\`](glossary.md).',
    '> **JSON-LD @context:** [\`schemas/skill.context.jsonld\`](../schemas/skill.context.jsonld).',
    '',
    `Schema version: **${schema.properties.schema_version?.oneOf?.[0]?.const ?? 'unknown'}** · Field count: **${Object.keys(schema.properties).length}** · Required: **${requiredSet.size}**`,
    '',
    '---',
    ''
  ];

  for (const [name, prop] of Object.entries(schema.properties)) {
    lines.push(renderField(name, prop, requiredSet));
    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}

function main() {
  const args = parseArgs(process.argv);
  const schema = loadSchema();
  const output = render(schema);

  if (args.check) {
    let existing = '';
    try { existing = fs.readFileSync(args.output, 'utf8'); } catch {}
    if (existing !== output) {
      console.error(`[check] ${args.output} is out of date. Regenerate with: node scripts/gen-field-reference.js`);
      process.exit(1);
    }
    console.log(`[check] ${args.output} is up to date.`);
    return;
  }

  fs.mkdirSync(path.dirname(args.output), { recursive: true });
  fs.writeFileSync(args.output, output, 'utf8');
  console.log(`Wrote ${args.output} (${output.length} bytes, ${Object.keys(schema.properties).length} fields)`);
}

main();
