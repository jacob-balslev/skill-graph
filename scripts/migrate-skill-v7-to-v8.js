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
 *   workspace-local plan: we-should-clearly-look-wondrous-firefly.md
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
  // Tightened 2026-05-25 v2: dropped 'classification', 'category',
  // 'categorization' (too generic — matched many engineering/quality skills).
  // Retained only domain-of-knowledge-organization terms.
  'taxonomy', 'semantics', 'ontology', 'glossary',
  'naming-conventions', 'linguistics', 'controlled vocabulary',
];

const FRONTEND_KEYWORDS = [
  'frontend', 'react', 'next.js', 'next js', 'nextjs', 'ui component',
  'layout', 'css', 'scss', 'tailwind', 'radix', 'shadcn',
  'tsx', 'jsx', 'interaction design', 'browser automation',
  // Tightened 2026-05-25 v2: dropped bare 'ui', 'component', 'browser', 'next', 'interaction', 'a11y'
  // (too generic — matched many backend/quality/methodology skills).
];

const DATA_ANALYTICS_KEYWORDS = [
  // Tightened 2026-05-25 v2: dropped 'log', 'report' (too generic —
  // matched skills like blameless-postmortem, cap-theorem-tradeoffs,
  // background-jobs, best-practice that aren't analytics).
  'data viz', 'dataviz', 'analytics', 'kpi card', 'kpi formula',
  'chart widget', 'dashboard', 'observability', 'telemetry',
  'financial display', 'financial allocation', 'data-table',
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
    // Tightened 2026-05-25 v2: require ≥2 data-analytics hits to defect from
    // quality-assurance. The first pass routed `best-practice` and
    // `cognitive-load-theory` to data-analytics on weak single-keyword
    // matches; both are clearly quality/meta concerns.
    const daHits = DATA_ANALYTICS_KEYWORDS.filter(kw => haystack.includes(kw));
    if (daHits.length >= 2) {
      return { value: 'data-analytics', confidence: 'medium', reason: `category: quality + strong data-analytics signal (${daHits.slice(0, 2).join(', ')}) → data-analytics` };
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
    if (feHits.length >= 1) {
      return { value: 'frontend-ui', confidence: 'medium', reason: `category: engineering + frontend (${feHits.slice(0, 2).join(', ')}) → frontend-ui` };
    }
    const daHits = DATA_ANALYTICS_KEYWORDS.filter(kw => haystack.includes(kw));
    // Tightened 2026-05-25 v2: require ≥2 hits for engineering→data-analytics
    // (was ≥1, which produced 17 false positives in the first pass).
    if (daHits.length >= 2) {
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

// ---------------------------------------------------------------------------
// Phase 4: apply a single batch (one subject at a time)
// ---------------------------------------------------------------------------

function loadArtifactSummary() {
  if (!fs.existsSync(ARTIFACT_PATH)) {
    throw new Error(`Artifact missing: ${ARTIFACT_PATH}. Run dry-run first.`);
  }
  const artifact = JSON.parse(fs.readFileSync(ARTIFACT_PATH, 'utf8'));
  return artifact.summary.by_proposed_subject;
}

/**
 * Apply v7→v8 frontmatter edits to one SKILL.md file in place.
 *
 * Edits applied (per the per-skill proposal in the artifact):
 *   1. `schema_version: 7` → `schema_version: 8`
 *   2. INSERT `subject: <value>` immediately after `category: ...` line
 *   3. INSERT `operation: <value>` immediately after `type: ...` line
 *   4. Update `scope: codebase` → `scope: project`, `scope: reference` → `scope: workspace`
 *   5. Cap keywords[] if it exceeds 10 (truncate from end)
 *
 * The file uses either Agent-Skills-compatible encoding (everything nested
 * under `metadata:`) or protocol-native (top-level fields). This function
 * detects which by checking for the `metadata:` line, and uses the appropriate
 * indentation.
 *
 * Compatibility mode: existing v7 fields (category, type, codebase/reference)
 * are PRESERVED. New v8 fields are ADDED. This is per the plan's compatibility-
 * mode landing rule: v8 skills carry both v7 and v8 fields during the
 * migration window.
 */
function applyV8EditsToFile(skillPath, proposal) {
  const raw = fs.readFileSync(skillPath, 'utf8');
  const lines = raw.split('\n');
  const isAgentSkillsEncoding = lines.some(l => /^metadata:\s*$/.test(l));
  const indent = isAgentSkillsEncoding ? '  ' : '';

  let changedFields = [];

  // 1. schema_version bump.
  for (let i = 0; i < lines.length; i++) {
    if (new RegExp(`^${indent}schema_version: 7$`).test(lines[i])) {
      lines[i] = `${indent}schema_version: 8`;
      changedFields.push('schema_version: 7→8');
      break;
    }
  }

  // 2. Insert subject after category line (only if not already present).
  const subjectAlreadyPresent = lines.some(l => new RegExp(`^${indent}subject:`).test(l));
  if (!subjectAlreadyPresent) {
    for (let i = 0; i < lines.length; i++) {
      if (new RegExp(`^${indent}category:`).test(lines[i])) {
        lines.splice(i + 1, 0, `${indent}subject: ${proposal.proposed.subject}`);
        changedFields.push(`+subject: ${proposal.proposed.subject}`);
        break;
      }
    }
  }

  // 3. Insert operation after type line (only if not already present).
  const operationAlreadyPresent = lines.some(l => new RegExp(`^${indent}operation:`).test(l));
  if (!operationAlreadyPresent) {
    for (let i = 0; i < lines.length; i++) {
      if (new RegExp(`^${indent}type:`).test(lines[i])) {
        lines.splice(i + 1, 0, `${indent}operation: ${proposal.proposed.operation}`);
        changedFields.push(`+operation: ${proposal.proposed.operation}`);
        break;
      }
    }
  }

  // 4. Scope rename (codebase → project, reference → workspace).
  if (proposal.current.scope !== proposal.proposed.scope) {
    for (let i = 0; i < lines.length; i++) {
      if (new RegExp(`^${indent}scope: ${proposal.current.scope}$`).test(lines[i])) {
        lines[i] = `${indent}scope: ${proposal.proposed.scope}`;
        changedFields.push(`scope: ${proposal.current.scope}→${proposal.proposed.scope}`);
        break;
      }
    }
  }

  // 5. Keyword cap (truncate to 10).
  if (proposal.current.keywords_count > proposal.proposed.keywords_count_post) {
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(new RegExp(`^${indent}keywords: "(\\[.+\\])"$`));
      if (m) {
        try {
          const arr = JSON.parse(m[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\'));
          if (Array.isArray(arr) && arr.length > 10) {
            const capped = arr.slice(0, 10);
            const reJsonString = JSON.stringify(capped).replace(/"/g, '\\"');
            lines[i] = `${indent}keywords: "${reJsonString}"`;
            changedFields.push(`keywords: ${arr.length}→10`);
          }
        } catch (_err) { /* leave unchanged */ }
        break;
      }
      // Plain YAML array form (protocol-native).
      const m2 = lines[i].match(new RegExp(`^${indent}keywords:\\s*\\[(.+)\\]$`));
      if (m2 && i === 0) {
        // Skip — too risky to handle inline-flow arrays at top level.
      }
    }
  }

  const newContent = lines.join('\n');
  if (newContent === raw) return { changed: false, fields: [] };

  fs.writeFileSync(skillPath, newContent);
  return { changed: true, fields: changedFields };
}

function applyBatch(subject) {
  if (!fs.existsSync(ARTIFACT_PATH)) {
    console.error(`FATAL: Artifact missing: ${ARTIFACT_PATH}. Run dry-run first.`);
    process.exit(2);
  }
  const artifact = JSON.parse(fs.readFileSync(ARTIFACT_PATH, 'utf8'));
  const batch = artifact.proposals.filter(p => !p.error && p.proposed.subject === subject);
  if (batch.length === 0) {
    console.error(`No skills in batch '${subject}'.`);
    process.exit(1);
  }

  console.log(`Applying batch '${subject}' (${batch.length} skill(s)) ...`);
  const results = [];
  for (const proposal of batch) {
    const fullPath = path.resolve(REPO_ROOT, proposal.path);
    if (!fs.existsSync(fullPath)) {
      console.error(`  SKIP ${proposal.skill}: file not found at ${proposal.path}`);
      results.push({ skill: proposal.skill, status: 'skip', reason: 'file not found' });
      continue;
    }
    try {
      const res = applyV8EditsToFile(fullPath, proposal);
      if (res.changed) {
        console.log(`  ✓ ${proposal.skill}: ${res.fields.join(', ')}`);
        results.push({ skill: proposal.skill, status: 'ok', fields: res.fields });
      } else {
        console.log(`  · ${proposal.skill}: no changes (already v8?)`);
        results.push({ skill: proposal.skill, status: 'noop' });
      }
    } catch (err) {
      console.error(`  ✗ ${proposal.skill}: ${err.message}`);
      results.push({ skill: proposal.skill, status: 'error', error: err.message });
    }
  }

  const ok = results.filter(r => r.status === 'ok').length;
  const noop = results.filter(r => r.status === 'noop').length;
  const err = results.filter(r => r.status === 'error').length;
  const skip = results.filter(r => r.status === 'skip').length;
  console.log(`\nBatch '${subject}' complete: ${ok} updated, ${noop} no-op, ${skip} skipped, ${err} errors`);
  console.log(`Next: review the diff with 'git diff -- skills/' in ~/Development/skills/, then path-limited commit.`);
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
    // Phase 4 apply mode: reads the existing artifact and applies the proposed
    // changes to one batch. REQUIRES --batch <subject> to scope the apply;
    // refuses to mutate all 147 skills in one call.
    if (!batchArg) {
      console.error('FATAL: --apply requires --batch <subject> to scope the migration.');
      console.error('       Apply one subject at a time so each batch is a separate, reviewable commit.');
      console.error(`       Available subjects: ${Object.keys(loadArtifactSummary()).join(', ')}`);
      process.exit(2);
    }
    return applyBatch(batchArg);
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
    plan: 'workspace-local plan: we-should-clearly-look-wondrous-firefly.md',
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
