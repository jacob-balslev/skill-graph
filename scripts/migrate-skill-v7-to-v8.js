#!/usr/bin/env node
/**
 * v7 → v8 Skill Migration Codemod
 *
 * Proposes (dry-run default) or applies (with --apply) the v7→v8 frontmatter
 * migration: category → subject (9-value enum), type → operation (4-value
 * Bloom enum), scope rename (codebase→project, reference→workspace),
 * keywords cap at 10.
 *
 * Driven by the v7→v8 restructure plan (compatibility-mode landing):
 *   /Users/jacobbalslev/.claude-profiles/jacobbalslev01/plans/we-should-clearly-look-wondrous-firefly.md
 *
 * Architectural rule (per the plan's Phase 3 HITL gate): in dry-run mode,
 * write ONLY the per-skill mapping artifact (migration-mapping-v7-to-v8.json).
 * The artifact is reviewed by the user; ambiguous rows (confidence: low) are
 * flipped manually; then `--apply` runs per-batch in Phase 4.
 *
 * Per GPT-5.5 critique (2026-05-25): mapping is NOT 1:1 — `category:
 * engineering` may map to `code-engineering`, `frontend-ui`, `data-analytics`,
 * or `product-domain` depending on content. Heuristics drive the proposal;
 * the artifact's `confidence` column tells the user which rows to scrutinize.
 *
 * Usage:
 *   node scripts/migrate-skill-v7-to-v8.js                  # dry-run, write artifact only
 *   node scripts/migrate-skill-v7-to-v8.js --apply          # apply (intentionally not impl yet)
 *   node scripts/migrate-skill-v7-to-v8.js --skill <name>   # single-skill dry-run
 *   node scripts/migrate-skill-v7-to-v8.js --batch <subject>  # filter summary to one subject
 *
 * Output:
 *   audits/migration-mapping-v7-to-v8.json  — per-skill mapping artifact
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { parseFrontmatter, normalizeFrontmatter } = require('./lib/parse-frontmatter');
const { collectSkillFilesFromRoots, resolveSkillRoots, workspaceRoot } = require('./lib/roots');

const REPO_ROOT = workspaceRoot();
const ARTIFACT_PATH = path.join(REPO_ROOT, 'audits', 'migration-mapping-v7-to-v8.json');

// ---------------------------------------------------------------------------
// v7 → v8 mapping heuristics
// ---------------------------------------------------------------------------

const WORKFLOW_KEYWORDS = [
  'workflow', 'process', 'procedure', 'step-by-step', 'sequence', 'checklist',
  'protocol', 'pipeline', 'lifecycle', 'guide', 'how to', 'how-to', 'walkthrough',
  'audit', 'execute', 'perform', 'apply', 'implement', 'configure', 'set up',
];

const PRODUCT_DOMAIN_KEYWORDS = [
  'shopify', 'printify', 'stripe', 'amazon', 'etsy', 'paypal', 'fulfillment',
  'invoice', 'payment', 'ledger', 'webhook', 'banking', 'aftership',
];

const KNOWLEDGE_ORG_KEYWORDS = [
  'taxonomy', 'semantics', 'ontology', 'classification', 'glossary',
  'naming', 'linguistics', 'category', 'categorization',
];

const FRONTEND_KEYWORDS = [
  'frontend', 'react', 'next', 'ui', 'component', 'layout', 'css', 'scss',
  'tailwind', 'radix', 'shadcn', 'tsx', 'jsx', 'interaction', 'a11y', 'browser',
];

const DATA_ANALYTICS_KEYWORDS = [
  'data viz', 'dataviz', 'analytics', 'kpi', 'metric', 'chart', 'dashboard',
  'observability', 'log', 'telemetry', 'financial', 'report',
];

function inferOperation(currentType, description, name) {
  if (currentType === 'workflow') return { value: 'do', confidence: 'high', reason: 'type: workflow → do (direct mapping per plan)' };
  if (currentType === 'router') return { value: 'decide', confidence: 'high', reason: 'type: router → decide (direct mapping per plan)' };
  if (currentType === 'overlay') return { value: 'modify', confidence: 'high', reason: 'type: overlay → modify (direct mapping per plan)' };

  if (currentType === 'capability') {
    const haystack = `${name} ${description || ''}`.toLowerCase();
    const matchedKeywords = WORKFLOW_KEYWORDS.filter(kw => haystack.includes(kw));
    if (matchedKeywords.length >= 2) {
      return {
        value: 'do',
        confidence: 'medium',
        reason: `type: capability + workflow-keyword presence (${matchedKeywords.slice(0, 3).join(', ')}) → do`,
      };
    }
    return {
      value: 'know',
      confidence: 'medium',
      reason: 'type: capability + no strong workflow signal → know (default for capability)',
    };
  }

  return { value: 'know', confidence: 'low', reason: `unknown type: ${currentType} → know (fallback)` };
}

function inferSubject(currentCategory, currentDomain, description, name) {
  const haystack = `${name} ${description || ''} ${currentDomain || ''}`.toLowerCase();

  if (currentCategory === 'agent') {
    return { value: 'agent-ops', confidence: 'high', reason: 'category: agent → agent-ops (direct mapping)' };
  }
  if (currentCategory === 'quality') {
    if (DATA_ANALYTICS_KEYWORDS.some(kw => haystack.includes(kw))) {
      return { value: 'data-analytics', confidence: 'medium', reason: 'category: quality + data-analytics keyword → data-analytics' };
    }
    return { value: 'quality-assurance', confidence: 'high', reason: 'category: quality → quality-assurance (direct mapping)' };
  }
  if (currentCategory === 'product') {
    return { value: 'product-domain', confidence: 'high', reason: 'category: product → product-domain (direct mapping)' };
  }

  if (currentCategory === 'design') {
    const frontendHits = FRONTEND_KEYWORDS.filter(kw => haystack.includes(kw));
    if (frontendHits.length >= 1) {
      return { value: 'frontend-ui', confidence: 'medium', reason: `category: design + frontend keyword (${frontendHits.slice(0, 2).join(', ')}) → frontend-ui` };
    }
    return { value: 'design-craft', confidence: 'medium', reason: 'category: design + no frontend tilt → design-craft' };
  }

  if (currentCategory === 'foundations') {
    const koHits = KNOWLEDGE_ORG_KEYWORDS.filter(kw => haystack.includes(kw));
    if (koHits.length >= 1) {
      return { value: 'knowledge-organization', confidence: 'medium', reason: `category: foundations + KO keyword (${koHits.slice(0, 2).join(', ')}) → knowledge-organization` };
    }
    return { value: 'meta-methods', confidence: 'medium', reason: 'category: foundations + no KO keyword → meta-methods (default)' };
  }

  if (currentCategory === 'engineering') {
    const pdHits = PRODUCT_DOMAIN_KEYWORDS.filter(kw => haystack.includes(kw));
    if (pdHits.length >= 1) {
      return { value: 'product-domain', confidence: 'medium', reason: `category: engineering + vendor-integration (${pdHits.slice(0, 2).join(', ')}) → product-domain` };
    }
    const feHits = FRONTEND_KEYWORDS.filter(kw => haystack.includes(kw));
    if (feHits.length >= 2) {
      return { value: 'frontend-ui', confidence: 'medium', reason: `category: engineering + frontend (${feHits.slice(0, 2).join(', ')}) → frontend-ui` };
    }
    const daHits = DATA_ANALYTICS_KEYWORDS.filter(kw => haystack.includes(kw));
    if (daHits.length >= 1) {
      return { value: 'data-analytics', confidence: 'medium', reason: `category: engineering + data-analytics (${daHits.slice(0, 2).join(', ')}) → data-analytics` };
    }
    return { value: 'code-engineering', confidence: 'medium', reason: 'category: engineering + no specialization → code-engineering (default)' };
  }

  return { value: 'code-engineering', confidence: 'low', reason: `unknown category: ${currentCategory} → code-engineering (fallback)` };
}

function inferScope(currentScope) {
  if (currentScope === 'codebase') return { value: 'project', confidence: 'high', reason: 'scope: codebase → project (v8 rename)' };
  if (currentScope === 'reference') return { value: 'workspace', confidence: 'high', reason: 'scope: reference → workspace (v8 rename)' };
  if (currentScope === 'portable') return { value: 'portable', confidence: 'high', reason: 'scope: portable (unchanged)' };
  return { value: currentScope, confidence: 'low', reason: `unknown scope: ${currentScope} → kept as-is` };
}

function inferKeywordsCap(currentKeywords) {
  const arr = Array.isArray(currentKeywords) ? currentKeywords : [];
  if (arr.length <= 10) {
    return { value: arr, confidence: 'high', reason: `${arr.length} keywords ≤ 10, no cap` };
  }
  return { value: arr.slice(0, 10), confidence: 'medium', reason: `${arr.length} keywords > 10, capped to first 10` };
}

function proposeForSkill(skillPath) {
  const raw = fs.readFileSync(skillPath, 'utf8');
  const parsed = parseFrontmatter(raw);
  if (!parsed || typeof parsed !== 'object') {
    return { skill: path.relative(REPO_ROOT, skillPath), error: 'no frontmatter parsed' };
  }
  const fm = normalizeFrontmatter(parsed);
  if (!fm) {
    return { skill: path.relative(REPO_ROOT, skillPath), error: 'normalize returned null' };
  }

  const name = fm.name || path.basename(path.dirname(skillPath));
  const description = fm.description || '';

  const current = {
    schema_version: fm.schema_version,
    category: fm.category,
    type: fm.type,
    scope: fm.scope,
    domain: fm.domain,
    keywords_count: Array.isArray(fm.keywords) ? fm.keywords.length : 0,
  };

  const subjectInf = inferSubject(fm.category, fm.domain, description, name);
  const operationInf = inferOperation(fm.type, description, name);
  const scopeInf = inferScope(fm.scope);
  const keywordsInf = inferKeywordsCap(fm.keywords);

  const proposed = {
    schema_version: 8,
    subject: subjectInf.value,
    operation: operationInf.value,
    scope: scopeInf.value,
    keywords_count_post: keywordsInf.value.length,
  };

  const ranks = { high: 3, medium: 2, low: 1 };
  const overall = Math.min(
    ranks[subjectInf.confidence],
    ranks[operationInf.confidence],
    ranks[scopeInf.confidence],
    ranks[keywordsInf.confidence],
  );
  const confidence = Object.keys(ranks).find(k => ranks[k] === overall);

  return {
    skill: name,
    path: path.relative(REPO_ROOT, skillPath),
    current,
    proposed,
    confidence,
    reasoning: {
      subject: subjectInf.reason,
      operation: operationInf.reason,
      scope: scopeInf.reason,
      keywords: keywordsInf.reason,
    },
  };
}

function main() {
  const argv = process.argv.slice(2);
  const apply = argv.includes('--apply');
  const skillIdx = argv.indexOf('--skill');
  const skillArg = skillIdx >= 0 ? argv[skillIdx + 1] : null;
  const batchIdx = argv.indexOf('--batch');
  const batchArg = batchIdx >= 0 ? argv[batchIdx + 1] : null;

  if (apply) {
    console.error('FATAL: --apply mode is intentionally not yet implemented.');
    console.error('       Phase 3 of the v7→v8 plan ships ONLY the dry-run mapping artifact.');
    console.error('       The user reviews the artifact, flips ambiguous rows, and AUTHORIZES');
    console.error('       per-batch application in Phase 4. Re-run without --apply.');
    process.exit(2);
  }

  const skillRoots = resolveSkillRoots();
  let skillFiles = collectSkillFilesFromRoots(skillRoots).map(f => f.filePath);

  if (skillArg) {
    skillFiles = skillFiles.filter(f => f.includes(`/${skillArg}/SKILL.md`));
    if (skillFiles.length === 0) {
      console.error(`No SKILL.md found matching --skill ${skillArg}`);
      process.exit(1);
    }
  }

  const proposals = [];
  for (const skillPath of skillFiles) {
    try {
      proposals.push(proposeForSkill(skillPath));
    } catch (err) {
      proposals.push({ skill: path.relative(REPO_ROOT, skillPath), error: err.message });
    }
  }

  const total = proposals.length;
  const errors = proposals.filter(p => p.error).length;
  const ok = total - errors;
  const byConfidence = { high: 0, medium: 0, low: 0 };
  const bySubject = {};
  const byOperation = {};
  for (const p of proposals) {
    if (p.error) continue;
    byConfidence[p.confidence]++;
    bySubject[p.proposed.subject] = (bySubject[p.proposed.subject] || 0) + 1;
    byOperation[p.proposed.operation] = (byOperation[p.proposed.operation] || 0) + 1;
  }

  if (batchArg) {
    const filtered = proposals.filter(p => !p.error && p.proposed && p.proposed.subject === batchArg);
    console.log(`Batch '${batchArg}': ${filtered.length} skill(s) proposed for this subject`);
  }

  const artifact = {
    generated_at: new Date().toISOString(),
    generator: 'scripts/migrate-skill-v7-to-v8.js',
    plan: '/Users/jacobbalslev/.claude-profiles/jacobbalslev01/plans/we-should-clearly-look-wondrous-firefly.md',
    summary: {
      total,
      successful: ok,
      errors,
      by_confidence: byConfidence,
      by_proposed_subject: Object.entries(bySubject).sort((a, b) => b[1] - a[1]).reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {}),
      by_proposed_operation: Object.entries(byOperation).sort((a, b) => b[1] - a[1]).reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {}),
    },
    proposals: proposals.sort((a, b) => (a.skill || '').localeCompare(b.skill || '')),
  };

  fs.mkdirSync(path.dirname(ARTIFACT_PATH), { recursive: true });
  fs.writeFileSync(ARTIFACT_PATH, JSON.stringify(artifact, null, 2));

  console.log(`Wrote ${ARTIFACT_PATH}`);
  console.log(`Summary: ${ok}/${total} skills proposed, ${errors} errors`);
  console.log(`Confidence: ${byConfidence.high} high, ${byConfidence.medium} medium, ${byConfidence.low} low`);
  console.log('Subject distribution (proposed):');
  for (const [k, v] of Object.entries(artifact.summary.by_proposed_subject)) {
    console.log(`  ${k}: ${v}`);
  }
  console.log('Operation distribution (proposed):');
  for (const [k, v] of Object.entries(artifact.summary.by_proposed_operation)) {
    console.log(`  ${k}: ${v}`);
  }
  console.log(`\nNext: user reviews ${path.relative(REPO_ROOT, ARTIFACT_PATH)}, flips low-confidence rows, then Phase 4 applies per-batch.`);
}

main();
