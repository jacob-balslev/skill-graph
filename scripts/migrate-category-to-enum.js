#!/usr/bin/env node
/**
 * Migrate skill `category` field to the 6-value canonical set.
 *
 * Target enum: foundations | engineering | design | quality | agent | product
 *
 * The current schema (v4) keeps `category` as an open string. This script
 * standardises every skill in skill-graph/skills/ onto the canonical 6.
 * Schema closure (enum constraint, v5 bump) is a follow-up step that is
 * only safe AFTER every skill has been migrated by this script.
 *
 * Per-skill mapping is explicit (no heuristics). Skills already in the
 * canonical set are left untouched. Domain is updated to the target
 * sub-path; existing domain values are preserved when they already match
 * the new category's sub-tree.
 *
 * Usage:
 *   node scripts/migrate-category-to-enum.js --dry-run    # show diff only
 *   node scripts/migrate-category-to-enum.js              # apply changes
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(REPO_ROOT, 'skills');
const DRY_RUN = process.argv.includes('--dry-run');

// Per-skill mapping. Skills not listed retain their current category.
// Format: skillName: { category, domain }
const MAPPING = {
  // === From knowledge (29) ===
  'ai-native-development':        { category: 'agent',       domain: 'agent/concepts' },
  'conceptual-modeling':          { category: 'engineering', domain: 'engineering/modeling' },
  'constraint-awareness':         { category: 'foundations', domain: 'foundations/strategy' },
  'context-engineering':          { category: 'agent',       domain: 'agent/context' },
  'context-graph':                { category: 'agent',       domain: 'agent/context' },
  'context-management':           { category: 'agent',       domain: 'agent/context' },
  'context-window':               { category: 'agent',       domain: 'agent/context' },
  'diagnosis':                    { category: 'engineering', domain: 'engineering/debugging' },
  'documentation':                { category: 'engineering', domain: 'engineering/documentation' },
  'graph-audit':                  { category: 'quality',     domain: 'quality/audit' },
  'information-architecture':     { category: 'design',      domain: 'design/information-architecture' },
  'knowledge-modeling':           { category: 'foundations', domain: 'foundations/knowledge' },
  'linguistics':                  { category: 'foundations', domain: 'foundations/language' },
  'microcopy':                    { category: 'design',      domain: 'design/ux' },
  'ontology-modeling':            { category: 'foundations', domain: 'foundations/ontology' },
  'pattern-recognition':          { category: 'foundations', domain: 'foundations/cognition' },
  'problem-locating-solving':     { category: 'engineering', domain: 'engineering/debugging' },
  'project-knowledge-extraction': { category: 'agent',       domain: 'agent/knowledge' },
  'prompt-craft':                 { category: 'agent',       domain: 'agent/prompts' },
  'semantic-center':              { category: 'foundations', domain: 'foundations/semantics' },
  'semantic-relations':           { category: 'foundations', domain: 'foundations/semantics' },
  'semantics':                    { category: 'foundations', domain: 'foundations/semantics' },
  'semiotics':                    { category: 'foundations', domain: 'foundations/semantics' },
  'skill-infrastructure':         { category: 'agent',       domain: 'agent/skill-system' },
  'skill-router':                 { category: 'agent',       domain: 'agent/skill-system' },
  'skill-scaffold':               { category: 'agent',       domain: 'agent/skill-system' },
  'task-analysis':                { category: 'foundations', domain: 'foundations/analysis' },
  'taxonomy-design':              { category: 'foundations', domain: 'foundations/classification' },
  'writing-humanizer':            { category: 'design',      domain: 'design/content' },

  // === From frontend (9) — most are design, a11y is quality ===
  'a11y':                         { category: 'quality',     domain: 'quality/accessibility' },
  'dark-mode-implementation':     { category: 'design',      domain: 'design/visual' },
  'design-system-architecture':   { category: 'design',      domain: 'design/system' },
  'form-ux-architecture':         { category: 'design',      domain: 'design/ux' },
  'frontend-architecture':        { category: 'engineering', domain: 'engineering/frontend' },
  'interaction-feedback':         { category: 'design',      domain: 'design/interaction' },
  'interaction-patterns':         { category: 'design',      domain: 'design/interaction' },
  'layout-composition':           { category: 'design',      domain: 'design/layout' },
  'visual-design-foundations':    { category: 'design',      domain: 'design/visual' },

  // === From ai-engineering (9) ===
  'command-palette':              { category: 'design',      domain: 'design/ui' },
  'content-monitor':              { category: 'agent',       domain: 'agent/ops' },
  'governance':                   { category: 'quality',     domain: 'quality/governance' },
  'guardrails':                   { category: 'quality',     domain: 'quality/safety' },
  'merge-queue':                  { category: 'engineering', domain: 'engineering/git' },
  'methodology':                  { category: 'quality',     domain: 'quality/method' },
  'reasoning':                    { category: 'foundations', domain: 'foundations/cognition' },
  'spec-driven-development':      { category: 'engineering', domain: 'engineering/methodology' },
  'summarization':                { category: 'agent',       domain: 'agent/cognition' },

  // === From data (2) ===
  'compression':                  { category: 'engineering', domain: 'engineering/data' },
  'entity-relationship-modeling': { category: 'engineering', domain: 'engineering/modeling' },

  // === From workflow (1) ===
  'background-jobs':              { category: 'engineering', domain: 'engineering/async' },

  // === From security (1) ===
  'owasp-security':               { category: 'quality',     domain: 'quality/security' },

  // === From integration (4) — all engineering with sub-domain ===
  'cron-scheduling':              { category: 'engineering', domain: 'engineering/scheduling' },
  'printify':                     { category: 'engineering', domain: 'engineering/integrations' },
  'real-time-updates':            { category: 'engineering', domain: 'engineering/realtime' },
  'shopify':                      { category: 'engineering', domain: 'engineering/integrations' },
};

function updateFrontmatter(content, skillName) {
  if (!MAPPING[skillName]) return null; // not in mapping, skip

  const target = MAPPING[skillName];
  let updated = content;

  // Update category line (works for both YAML scalar forms)
  updated = updated.replace(
    /^category:\s*.+$/m,
    `category: ${target.category}`
  );

  // Update or insert domain line
  if (/^domain:\s*.*$/m.test(updated)) {
    updated = updated.replace(
      /^domain:\s*.*$/m,
      `domain: ${target.domain}`
    );
  } else {
    // Insert domain after category line
    updated = updated.replace(
      /^(category:\s*.+)$/m,
      `$1\ndomain: ${target.domain}`
    );
  }

  return updated;
}

function main() {
  const skills = fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  let changed = 0;
  let skipped = 0;

  for (const skill of skills) {
    const skillPath = path.join(SKILLS_DIR, skill, 'SKILL.md');
    if (!fs.existsSync(skillPath)) continue;

    const content = fs.readFileSync(skillPath, 'utf8');
    const updated = updateFrontmatter(content, skill);

    if (updated === null) {
      skipped++;
      continue;
    }

    if (updated === content) {
      // mapping exists but content unchanged (already correct)
      continue;
    }

    if (DRY_RUN) {
      const oldCat = (content.match(/^category:\s*(.+)$/m) || [])[1];
      const oldDom = (content.match(/^domain:\s*(.+)$/m) || [])[1] || '(none)';
      console.log(`${skill.padEnd(40)} ${oldCat} → ${MAPPING[skill].category}  | domain ${oldDom} → ${MAPPING[skill].domain}`);
    } else {
      fs.writeFileSync(skillPath, updated);
    }
    changed++;
  }

  console.log(`\n${DRY_RUN ? '[DRY-RUN] would change' : 'Changed'}: ${changed}, skipped (no mapping): ${skipped}, total: ${skills.length}`);
}

main();
