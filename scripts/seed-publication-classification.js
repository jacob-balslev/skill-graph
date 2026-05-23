#!/usr/bin/env node
'use strict';

/**
 * seed-publication-classification.js
 *
 * One-off seeder: parses skill-graph/docs/_archived/marketplace-publication-priority-2026-05-18.md
 * (the hand-curated priority doc, now archived) and emits skill-graph/data/publication-classification.json.
 *
 * After this runs once the ledger is hand-edited going forward. Re-running is safe (overwrites with
 * the same content unless the source doc changes).
 *
 * Output is consumed by scripts/skill/build-skill-audit-worklist.js (Development root) to build
 * the publicationQueue array in the unified worklist JSON.
 *
 * Usage:
 *   node skill-graph/scripts/seed-publication-classification.js
 *   node skill-graph/scripts/seed-publication-classification.js --src <path> --dst <path>
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../..');

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

function normSanitize(cell) {
  if (!cell) return null;
  const c = cell.toLowerCase().trim();
  if (c === 'no') return 'no';
  if (c === 'minor') return 'minor';
  if (c === 'light') return 'minor';
  if (c === 'yes' || c.startsWith('yes')) return 'yes';
  if (c === '—' || c === '-' || c === '') return null;
  return c;
}

function normSource(cell) {
  if (!cell) return null;
  const c = cell.toLowerCase().trim();
  if (c.startsWith('port+sanitize')) return 'port+sanitize';
  if (c.startsWith('port')) return 'port';
  if (c.startsWith('rewrite')) return 'rewrite';
  if (c.startsWith('author')) return 'author';
  if (c === '—' || c === '-' || c === '') return null;
  return c;
}

function normDemand(cell, tier) {
  if (cell) {
    const c = cell.toLowerCase();
    if (c.includes('anthropic') && c.includes('official')) return 'anthropic-official';
    if (c.includes('skills.sh') || c.includes('leaderboard') || c.includes('installs')) return 'skills.sh-leaderboard';
    if (c.includes('demand') || c.includes('topic') || c.includes('cluster')) return 'demand-cluster';
  }
  if (tier === 'S') return 'skills.sh-leaderboard';
  if (tier === 'A') return 'demand-cluster';
  return 'niche';
}

function extractSkill(cell) {
  const m = cell.match(/`([a-z0-9][a-z0-9._-]*)`/i);
  return m ? m[1] : null;
}

function extractRename(cell) {
  const m = cell.match(/→\s*([a-z0-9][a-z0-9._-]*)/i);
  return m ? m[1] : null;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const src = args.src
    ? path.resolve(args.src)
    : path.join(REPO_ROOT, 'skill-graph/docs/_archived/marketplace-publication-priority-2026-05-18.md');
  const fallbackSrc = path.join(REPO_ROOT, 'skill-graph/docs/marketplace-publication-priority-2026-05-18.md');
  const dst = args.dst
    ? path.resolve(args.dst)
    : path.join(REPO_ROOT, 'skill-graph/data/publication-classification.json');

  let srcPath = src;
  if (!fs.existsSync(srcPath) && fs.existsSync(fallbackSrc)) {
    srcPath = fallbackSrc;
  }
  if (!fs.existsSync(srcPath)) {
    console.error(`Source not found: tried ${src} and ${fallbackSrc}`);
    process.exit(1);
  }

  const md = fs.readFileSync(srcPath, 'utf8');

  const ledger = {
    schema_version: '1.0.0',
    last_updated: new Date().toISOString(),
    source_of_classifications: path.relative(REPO_ROOT, srcPath),
    description: 'Per-skill publication classification + market-state attributes for the OSS marketplace surface. Seeded once from the 2026-05-18 priority doc; hand-edited going forward. Consumed by scripts/skill/build-skill-audit-worklist.js (Development root) to build publicationQueue in the unified worklist JSON.',
    classifications: {
      publishable: 'Generic / portable; recommended for jacob-balslev/skills publication.',
      'sales-hub-bound': 'References internal schemas, Printify shop IDs, order_events, customer data, etc. Not publishable.',
      'personal-infra': "Specific to ~/Development monorepo orchestration; no audience outside this repo.",
    },
    skills: {},
  };

  const lines = md.split('\n');
  let currentTier = null;
  let inTable = false;
  let colIdx = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const tierMatch = line.match(/^##\s+Tier\s+([SABC])\b/);
    if (tierMatch) {
      currentTier = tierMatch[1];
      inTable = false;
      colIdx = {};
      continue;
    }

    if (/^##\s+Excluded/.test(line) || /^##\s+Recommended/.test(line) || /^##\s+Completeness/.test(line)) {
      currentTier = null;
      inTable = false;
      continue;
    }

    if (!currentTier) continue;

    if (/^\|\s*#\s*\|\s*Skill\s*\|/i.test(line)) {
      const headerCols = line.split('|').map((c) => c.trim()).filter(Boolean);
      colIdx = {};
      headerCols.forEach((c, idx) => {
        const k = c.toLowerCase().replace(/\?.*$/, '').replace(/[^a-z]/g, '');
        colIdx[k] = idx;
      });
      inTable = true;
      continue;
    }

    if (inTable && /^\|\s*-+/.test(line)) continue;

    if (inTable && line.startsWith('|') && !/^\|\s*$/.test(line)) {
      const cells = line.split('|').map((c) => c.trim());
      const data = cells.slice(1, -1);
      if (data.length < 3) continue;

      const skillCell = data[colIdx['skill']];
      if (!skillCell) continue;
      const skill = extractSkill(skillCell);
      if (!skill) continue;

      const popCell = data[colIdx['pop']];
      const popMatch = popCell && popCell.match(/^\s*(\d+)/);
      const pop_score = popMatch ? parseInt(popMatch[1], 10) : null;

      const source = normSource(data[colIdx['source']]);

      const sanitizeKey = colIdx['sanitize'] !== undefined ? 'sanitize' : null;
      const needs_sanitization = sanitizeKey ? normSanitize(data[colIdx[sanitizeKey]]) : null;

      const demandKey = colIdx['demandsignal'] !== undefined
        ? 'demandsignal'
        : (colIdx['notes'] !== undefined ? 'notes' : null);
      const demand_signal = demandKey
        ? normDemand(data[colIdx[demandKey]], currentTier)
        : normDemand(null, currentTier);

      const notes = (colIdx['notes'] !== undefined ? data[colIdx['notes']] : '') || '';
      const rename = extractRename(skillCell);

      if (notes && /counted as Tier/i.test(notes) && (!popCell || !popCell.match(/\d/))) continue;
      if (popCell === '—' || popCell === '-' || popCell === '' || pop_score === null) continue;

      if (!ledger.skills[skill]) {
        const entry = {
          classification: 'publishable',
          tier: currentTier,
          pop_score,
        };
        if (source) entry.source = source;
        if (needs_sanitization) entry.needs_sanitization = needs_sanitization;
        if (demand_signal) entry.demand_signal = demand_signal;
        if (rename) entry.rename_to = rename;
        if (notes) entry.notes = notes;
        ledger.skills[skill] = entry;
      }
    }
  }

  // Inline backtick tokens that appear in the SH-bound paragraph but are NOT skills —
  // they're schema/column names referenced as exclusion reasons.
  const NON_SKILL_BACKTICK_DENYLIST = new Set([
    'order_events',
    'orgQuery',
    'org_id',
    'requireOrgAuth',
    'app_role',
    'orgScopedQuery',
    'printify_shop_id',
    'shop_id',
  ]);

  const shBoundMatch = md.match(/##\s+Excluded\s+—\s+Sales-Hub-bound[^\n]*\n([\s\S]*?)(?=^##\s)/m);
  if (shBoundMatch) {
    const text = shBoundMatch[1];
    const regex = /`([a-z0-9][a-z0-9._-]*)`(?:\s*\(([^)]+)\))?/gi;
    let m;
    while ((m = regex.exec(text)) !== null) {
      const [, skill, reason] = m;
      if (NON_SKILL_BACKTICK_DENYLIST.has(skill)) continue;
      if (!ledger.skills[skill]) {
        ledger.skills[skill] = {
          classification: 'sales-hub-bound',
          tier: null,
          pop_score: null,
          notes: reason || 'References Sales-Hub-internal schemas/flows',
        };
      }
    }
  }

  const piMatch = md.match(/##\s+Excluded\s+—\s+Personal-infra[^\n]*\n([\s\S]*?)(?=^##\s|^---)/m);
  if (piMatch) {
    const text = piMatch[1];
    const regex = /`([a-z0-9][a-z0-9._-]*)`(?:\s*\(([^)]+)\))?/gi;
    let m;
    while ((m = regex.exec(text)) !== null) {
      const [, skill, reason] = m;
      if (!ledger.skills[skill]) {
        ledger.skills[skill] = {
          classification: 'personal-infra',
          tier: null,
          pop_score: null,
          notes: reason || 'Internal to ~/Development monorepo orchestration',
        };
      }
    }
  }

  const tierCounts = { S: 0, A: 0, B: 0, C: 0 };
  const classCounts = { publishable: 0, 'sales-hub-bound': 0, 'personal-infra': 0 };
  for (const entry of Object.values(ledger.skills)) {
    if (entry.tier) tierCounts[entry.tier]++;
    classCounts[entry.classification] = (classCounts[entry.classification] || 0) + 1;
  }

  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.writeFileSync(dst, JSON.stringify(ledger, null, 2) + '\n');

  console.log(`Wrote ${path.relative(REPO_ROOT, dst)}`);
  console.log(`  Total skills: ${Object.keys(ledger.skills).length}`);
  console.log(`  Tier counts: S=${tierCounts.S} A=${tierCounts.A} B=${tierCounts.B} C=${tierCounts.C}`);
  console.log(`  Class counts:`, classCounts);
}

if (require.main === module) {
  try {
    main();
  } catch (e) {
    console.error(e.stack || e.message);
    process.exit(1);
  }
}

module.exports = { main };
