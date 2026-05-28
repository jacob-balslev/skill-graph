#!/usr/bin/env node

/**
 * skill-evolution-loop.js — Karpathy-style continuous skill improvement loop.
 *
 * Reads the evolution analyzer output and executes improvements one at a time
 * with checkpoint-based resumability. Re-analyzes after each batch to create
 * a feedback loop: improve → measure → re-prioritize → improve.
 *
 * Loop phases:
 *   ANALYZE  → Run skill-evolution-analyzer.js (deterministic)
 *   TRIAGE   → Take top N items from prioritized queue
 *   EXECUTE  → Process one item at a time (AI-assisted for improvements)
 *   VERIFY   → Check that no regressions occurred
 *   CHECKPOINT → Persist state, emit telemetry
 *
 * Usage:
 *   node scripts/skill/skill-evolution-loop.js                     # Single cycle (original)
 *   node scripts/skill/skill-evolution-loop.js --continuous        # Auto re-analyze + repeat
 *   node scripts/skill/skill-evolution-loop.js --continuous --max-cycles 20  # Cap cycles
 *   node scripts/skill/skill-evolution-loop.js --continuous --min-priority 5 # Skip low-priority
 *   node scripts/skill/skill-evolution-loop.js --pilot template-owned-meta --top 2  # Bounded safe lane
 *   node scripts/skill/skill-evolution-loop.js --continuous --cooldown 60    # Seconds between cycles
 *   node scripts/skill/skill-evolution-loop.js --auto-improve --top 10 --max-iterations 5  # Karpathy spine
 *   node scripts/skill/skill-evolution-loop.js --auto-improve --max-cycles 3 --failure-budget 5  # Bounded auto-improve
 *   node scripts/skill/skill-evolution-loop.js --analyze-only      # Just produce analysis
 *   node scripts/skill/skill-evolution-loop.js --top 5             # Process top 5 items
 *   node scripts/skill/skill-evolution-loop.js --resume            # Resume from checkpoint
 *   node scripts/skill/skill-evolution-loop.js --max-iterations 10 # Safety cap per cycle
 *   node scripts/skill/skill-evolution-loop.js --actions improve,scaffold  # Filter action types
 *   node scripts/skill/skill-evolution-loop.js --continue-after-failures    # Run the full batch even after repeated failures
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// SH-2923: shared findings bus — imported directly to avoid subprocess overhead.
// appendJsonl is append-only and synchronous, matching the loop's own checkpoint semantics.
const {
  appendJsonl,
  AUTO_IMPROVE_FINDINGS_LOG,
  readRegistry,
  TEMPLATE_OWNED_META_PILOT,
  OWNERSHIP_MODE_TEMPLATE,
} = require('../audit-shared/auto-improve');

// Priority 1: Health Ledger — persist per-skill upgrade stats across runs
const {
  writeHealthLedgerEntry,
} = require('./skill-improvement-helpers');

// Workspace root and progress directory resolved via log-paths.js. The _WORKSPACE
// value equals workspaceRoot() — respects SKILL_GRAPH_WORKSPACE env var so
// standalone installs point at the user's working directory, not ~/Development.
const { PROGRESS_BASE_DIR: _PROGRESS_BASE, WORKSPACE: _WORKSPACE } = require('./log-paths');
const PROGRESS_DIR = path.join(_PROGRESS_BASE, 'skill-evolution');
const LOOP_NAME = 'skill-evolution';
const SCAFFOLD_EXTENSION_REDIRECTS = [
  { target: 'information-architecture', terms: ['information-architecture', 'navigation', 'search', 'filters', 'progressive-disclosure', 'empty-state'] },
  { target: 'ui-ux', terms: ['product-ux', 'ux', 'user-experience', 'user-flow', 'top-task', 'journey', 'usability'] },
  { target: 'composition-theory', terms: ['visual-hierarchy', 'layout', 'page-layout', 'composition', 'scan-pattern', 'focal-point'] },
  { target: 'adr', terms: ['architecture', 'system-design', 'c4', 'trade-off', 'architecture-decision', 'adr'] },
];

function isMetaSkillName(skillName) {
  const lowered = String(skillName || '').toLowerCase();
  return /skill|prompt-evolution|meta|routing|taxonomy|registry|eval/.test(lowered);
}

function applyMetaSkillFreeze(queue, options = {}) {
  if (options.pilot === TEMPLATE_OWNED_META_PILOT) return queue;
  return queue.filter((item) => !isMetaSkillName(item.skill));
}

// ─── CLI args ────────────────────────────────────────────────────

const { parseArgs } = require('../audit-shared/parse-args');
const { parseFrontmatter, normalizeFrontmatter } = require('./parse-frontmatter');

// ─── Skill directory resolution ─────────────────────────────────

function findSkillDir(skillName) {
  const candidates = [
    path.join(_WORKSPACE, 'skills', skillName),
    path.join(_WORKSPACE, 'skills', 'sales-hub', skillName),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'SKILL.md'))) return dir;
  }
  return null;
}

function pickScaffoldRedirect(skillName) {
  const lowered = String(skillName || '').toLowerCase();
  const match = SCAFFOLD_EXTENSION_REDIRECTS.find((rule) => rule.terms.some((term) => lowered.includes(term)));
  return match ? match.target : null;
}

function resolveTemplateOwnedPilotQueue(queue, registry, { allowFallback = true } = {}) {
  const promptEvolutionSkills = new Map();
  for (const asset of registry.assets || []) {
    if (asset.type !== 'skill') continue;
    if (asset.owner_loop !== 'prompt-evolution') continue;
    if (asset.ownership_mode !== OWNERSHIP_MODE_TEMPLATE) continue;
    if (asset.pilot_track !== TEMPLATE_OWNED_META_PILOT) continue;
    const skillName = String(asset.id || '').replace(/^skill:/, '');
    if (!skillName) continue;
    promptEvolutionSkills.set(skillName, asset);
  }

  if (promptEvolutionSkills.size === 0) {
    return [];
  }

  const prioritized = [];
  const seen = new Set();
  for (const item of queue || []) {
    if (!promptEvolutionSkills.has(item.skill)) continue;
    if (!['improve_skill', 'fix_semantics'].includes(item.action)) continue;
    prioritized.push(item);
    seen.add(item.skill);
  }

  if (allowFallback) {
    for (const [skillName, asset] of promptEvolutionSkills.entries()) {
      if (seen.has(skillName)) continue;
      prioritized.push({
        skill: skillName,
        action: 'improve_skill',
        priority: Number(asset.tier || 1),
        findings: ['Pilot fallback candidate — template-owned meta skill seeded in registry'],
        source: 'prompt-evolution-registry',
      });
    }
  }

  return prioritized;
}

function validateGeneratedEvalsBundle(filePath) {
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const evals = Array.isArray(parsed) ? parsed : parsed.evals;
  if (!Array.isArray(evals)) {
    return { valid: false, reason: 'evals.json must contain an array or an { evals: [] } object' };
  }
  if (evals.length < 7) {
    return { valid: false, reason: `expected at least 7 evals, got ${evals.length}` };
  }

  const seenIds = new Set();
  for (const entry of evals) {
    if (!Number.isFinite(Number(entry.id))) {
      return { valid: false, reason: 'each eval requires a numeric id' };
    }
    if (seenIds.has(Number(entry.id))) {
      return { valid: false, reason: `duplicate eval id ${entry.id}` };
    }
    seenIds.add(Number(entry.id));

    if (typeof entry.prompt !== 'string' || !entry.prompt.trim()) {
      return { valid: false, reason: `eval ${entry.id} is missing a prompt` };
    }
    if (typeof entry.expected_output !== 'string' || !entry.expected_output.trim()) {
      return { valid: false, reason: `eval ${entry.id} is missing expected_output` };
    }
    if (!Array.isArray(entry.expectations) || entry.expectations.length < 3) {
      return { valid: false, reason: `eval ${entry.id} needs at least 3 expectations` };
    }
    if (!entry.expectations.some((expectation) => /does not/i.test(String(expectation)))) {
      return { valid: false, reason: `eval ${entry.id} is missing a negative expectation` };
    }
  }

  return { valid: true, count: evals.length };
}

function summarizeDetail(detail, maxLength = 200) {
  const normalized = String(detail || '').trim();
  if (!normalized) return 'unknown failure';
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1)}…`;
}

function buildCommandFailureDetails(result) {
  const parts = [];
  if (result.status !== null && result.status !== undefined) {
    parts.push(`exit ${result.status}`);
  }
  if (result.stderr && String(result.stderr).trim()) {
    parts.push(String(result.stderr).trim());
  }
  if (result.stdout && String(result.stdout).trim()) {
    parts.push(String(result.stdout).trim());
  }
  return parts.join('\n\n').trim() || 'subprocess failed without diagnostics';
}

// ─── Checkpoint helpers ──────────────────────────────────────────

function checkpoint(cmd, extraArgs = []) {
  const result = spawnSync('node', [
    path.join(_WORKSPACE, 'scripts', 'loop-checkpoint.js'),
    cmd,
    '--loop', LOOP_NAME,
    ...extraArgs,
  ], { encoding: 'utf8', timeout: 10000, cwd: _WORKSPACE });

  if (cmd === 'read') {
    try { return JSON.parse(result.stdout || '{}'); } catch { return {}; }
  }
  return result.status === 0;
}

function emitEvent(type, data = {}) {
  try {
    const args = ['emit', type];
    for (const [k, v] of Object.entries(data)) {
      args.push('--' + k, String(v));
    }
    spawnSync('node', [
      path.join(_WORKSPACE, 'scripts', 'agent-events.js'),
      ...args,
    ], { encoding: 'utf8', timeout: 5000, cwd: _WORKSPACE });
  } catch {}
}

function daysSince(dateStr) {
  if (!dateStr) return Infinity;
  const then = new Date(dateStr);
  if (Number.isNaN(then.getTime())) return Infinity;
  return Math.floor((Date.now() - then.getTime()) / (1000 * 60 * 60 * 24));
}

// ─── Phase: Analyze ─────────────────────────────────────────────

function walkSkillFiles(rootDir) {
  const files = [];
  if (!rootDir || !fs.existsSync(rootDir)) return files;

  const stack = [rootDir];
  while (stack.length > 0) {
    const current = stack.pop();
    let entries = [];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (['node_modules', '.git', '.skill-graph'].includes(entry.name)) continue;
        stack.push(entryPath);
      } else if (entry.name === 'SKILL.md') {
        files.push(entryPath);
      }
    }
  }
  return files.sort();
}

// Read .skill-graph/config.json workspace.skill_roots so the fallback analyzer
// finds the canonical skill library even when launched from skill-graph (which
// has no local skills/ — it points at the sibling skills repo via the config).
// Returns absolute paths; empty list means "no config; use default <root>/skills".
function resolveConfiguredSkillRoots(workspaceRoot) {
  const configPath = path.join(workspaceRoot, '.skill-graph', 'config.json');
  if (!fs.existsSync(configPath)) return [];
  try {
    const raw = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    // skill_roots is top-level since the 2026-05-27 config flatten; fall back to
    // the legacy `workspace.skill_roots` wrapper for un-migrated clones.
    const roots = (raw && raw.skill_roots) || (raw && raw.workspace && raw.workspace.skill_roots);
    if (!Array.isArray(roots)) return [];
    return roots
      .map(entry => typeof entry === 'string' ? entry : (entry && entry.path))
      .filter(Boolean)
      .map(p => path.resolve(workspaceRoot, p));
  } catch {
    return [];
  }
}

function buildFallbackAnalysis(args, analysisPath) {
  const workspaceRoot = args['workspace-root']
    ? path.resolve(args['workspace-root'])
    : _WORKSPACE;
  // Skill directory resolution order (first match wins):
  //   1. Explicit --skills-dir flag (caller knows best).
  //   2. .skill-graph/config.json workspace.skill_roots[0] (the canonical
  //      configured root; skill-graph repo uses this to point at the sibling
  //      skills/ repo, since it has no local skills/).
  //   3. Default <workspaceRoot>/skills (works when launched from a workspace
  //      that has a colocated skills/ directory).
  let skillsDir;
  if (args['skills-dir']) {
    skillsDir = path.resolve(args['skills-dir']);
  } else {
    const configured = resolveConfiguredSkillRoots(workspaceRoot);
    skillsDir = configured.length > 0 ? configured[0] : path.join(workspaceRoot, 'skills');
  }

  const skillFiles = walkSkillFiles(skillsDir);
  const queue = [];
  for (const filePath of skillFiles) {
    let fm;
    try {
      fm = normalizeFrontmatter(parseFrontmatter(fs.readFileSync(filePath, 'utf8')));
    } catch {
      fm = null;
    }
    if (!fm || !fm.name) continue;

    const applicationVerdict = fm.application_verdict || 'UNVERIFIED';
    const structuralVerdict = fm.structural_verdict || 'UNVERIFIED';
    const lastAudited = fm.last_audited || null;
    const score = Number.isFinite(Number(fm.eval_score)) ? Number(fm.eval_score) : null;
    const staleness = Number.isFinite(daysSince(lastAudited)) ? daysSince(lastAudited) : 365;
    const needsBehavior = ['UNVERIFIED', 'REDUNDANT', 'HARMFUL', 'MIXED', 'FALSE_POSITIVE'].includes(applicationVerdict);
    const needsStructure = structuralVerdict === 'FAIL' || structuralVerdict === 'UNVERIFIED';
    const priority = (needsBehavior ? 70 : 0) + (needsStructure ? 20 : 0) + Math.min(staleness, 30) + (score === null ? 5 : Math.max(0, 5 - score));

    queue.push({
      skill: fm.name,
      action: needsStructure ? 'fix_semantics' : 'improve_skill',
      priority,
      auditTier: priority >= 90 ? 'deep-audit' : priority >= 50 ? 'standard' : 'light',
      findings: [
        `application_verdict=${applicationVerdict}`,
        `structural_verdict=${structuralVerdict}`,
        lastAudited ? `last_audited=${lastAudited}` : 'last_audited absent',
      ],
      source: 'fallback-analyzer',
      path: path.relative(workspaceRoot, filePath),
    });
  }

  queue.sort((left, right) => right.priority - left.priority || left.skill.localeCompare(right.skill));

  const analysis = {
    queue,
    data_quality: skillFiles.length > 0 ? 'fallback-analyzer' : 'fallback-analyzer-empty',
    files_checked: skillFiles.length,
    error: skillFiles.length > 0 ? null : `No SKILL.md files found under resolved skills_dir: ${skillsDir}`,
    semantic_audit: {
      perfect_score: queue.filter(item => item.priority < 50).length,
      needs_work: queue.filter(item => item.priority >= 50).length,
    },
    workspace_root: workspaceRoot,
    skills_dir: skillsDir,
  };

  fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2) + '\n');
  return analysis;
}

function analyzerCandidates(args) {
  const workspaceRoot = args['workspace-root']
    ? path.resolve(args['workspace-root'])
    : _WORKSPACE;
  return [
    path.join(workspaceRoot, 'scripts', 'skill-evolution-analyzer.js'),
    path.join(workspaceRoot, 'scripts', 'skill', 'skill-evolution-analyzer.js'),
    path.join(workspaceRoot, '..', 'scripts', 'skill-evolution-analyzer.js'),
    path.join(workspaceRoot, '..', 'scripts', 'skill', 'skill-evolution-analyzer.js'),
    path.join(__dirname, '..', '..', 'scripts', 'skill-evolution-analyzer.js'),
    path.join(__dirname, '..', '..', 'scripts', 'skill', 'skill-evolution-analyzer.js'),
  ];
}

function phaseAnalyze(args = {}) {
  console.log('\n--- Phase: ANALYZE ---');
  checkpoint('update', ['--item', 'analyze', '--phase', 'processing']);

  if (!fs.existsSync(PROGRESS_DIR)) fs.mkdirSync(PROGRESS_DIR, { recursive: true });

  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const analysisPath = path.join(PROGRESS_DIR, `analysis-${ts}.json`);

  const analyzerPath = analyzerCandidates(args).find(candidate => fs.existsSync(candidate));
  let analysis = null;

  if (analyzerPath) {
    const workspaceRoot = args['workspace-root']
      ? path.resolve(args['workspace-root'])
      : _WORKSPACE;
    const result = spawnSync('node', [
      analyzerPath,
      '--json',
      '--out', analysisPath,
    ], { encoding: 'utf8', timeout: 120000, cwd: workspaceRoot });

    if (result.status === 0) {
      analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
    } else {
      console.warn(`  Analyzer failed (${path.relative(_WORKSPACE, analyzerPath)}); falling back to frontmatter scan.`);
      if (result.stderr) console.warn(result.stderr.trim().split('\n').slice(-1)[0]);
    }
  } else {
    console.warn('  Analyzer script not found; falling back to frontmatter scan.');
  }

  if (!analysis) analysis = buildFallbackAnalysis(args, analysisPath);

  if (analysis.error) {
    console.error(`  ${analysis.error}`);
    checkpoint('update', ['--item', 'analyze', '--phase', 'failed']);
    return null;
  }

  console.log(`  Queue size: ${analysis.queue.length}`);
  console.log(`  Data quality: ${analysis.data_quality}`);
  console.log(`  Semantic health: ${analysis.semantic_audit.perfect_score} perfect, ${analysis.semantic_audit.needs_work} need work`);

  checkpoint('advance', ['--phase', 'committed']);

  emitEvent('skill_evolution_analysis', {
    queue_size: analysis.queue.length,
    data_quality: analysis.data_quality,
    analysis_path: analysisPath,
  });

  return analysis;
}

// ─── Phase: Triage ──────────────────────────────────────────────

function phaseTriage(analysis, topN, actionFilter) {
  console.log('\n--- Phase: TRIAGE ---');

  let queue = analysis.queue;

  // Filter by action type if specified
  if (actionFilter) {
    const allowed = actionFilter.split(',');
    queue = queue.filter(item => allowed.includes(item.action));
  }

  queue = applyMetaSkillFreeze(queue);

  // Filter out skip-tier items — they don't need improvement now
  const skipped = queue.filter(item => item.auditTier === 'skip');
  if (skipped.length > 0) {
    console.log(`  Filtered ${skipped.length} skip-tier skills: ${skipped.map(s => s.skill).join(', ')}`);
  }
  queue = queue.filter(item => item.auditTier !== 'skip');

  // Take top N
  const triaged = queue.slice(0, topN);

  console.log(`  Total queue: ${queue.length}`);
  console.log(`  Processing: ${triaged.length} items`);
  for (const item of triaged.slice(0, 10)) {
    const tag = { improve_skill: 'IMPROVE', scaffold_skill: 'CREATE', fix_semantics: 'SEMANTIC', archive_skill: 'ARCHIVE' }[item.action] || item.action;
    const tier = item.auditTier ? ` [${item.auditTier}]` : '';
    console.log(`    [${tag}] ${item.skill} (priority: ${item.priority})${tier}`);
  }

  return triaged;
}

// ─── Phase: Execute ─────────────────────────────────────────────

function summarizeChildSkillRun(artifactsDir) {
  const summaryPath = path.join(artifactsDir, 'summary.json');
  if (!fs.existsSync(summaryPath)) {
    return null;
  }

  try {
    const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
    const firstSkill = Array.isArray(summary.skills) ? summary.skills[0] : null;
    if (!firstSkill) {
      return null;
    }

    const reasons = Array.isArray(firstSkill.gate?.reasons) ? firstSkill.gate.reasons : [];
    const detailParts = [];
    if (firstSkill.status) detailParts.push(`status=${firstSkill.status}`);
    if (firstSkill.kept === false && reasons.length > 0) {
      detailParts.push(reasons.join('; '));
    }
    if (firstSkill.error) detailParts.push(firstSkill.error);
    return detailParts.join(' | ') || null;
  } catch {
    return null;
  }
}

function buildImprovementLoopArgs(skillName, childArtifactsDir, options = {}) {
  const skillDir = findSkillDir(skillName);
  if (!skillDir) {
    throw new Error(`skill directory not found for "${skillName}"`);
  }

  const args = [
    path.join(_WORKSPACE, 'scripts', 'run-skill-improvement-loop.js'),
    '--skills-root', path.dirname(skillDir),
    '--include', path.basename(skillDir),
    '--apply',
    '--require-kept',
    '--artifacts-root', childArtifactsDir,
  ];

  if (options.pilot === TEMPLATE_OWNED_META_PILOT) {
    args.push('--ownership-mode', 'template', '--pilot-track', TEMPLATE_OWNED_META_PILOT, '--research-first');
  }

  // Pass audit tier to the improvement loop so it can adjust protocol depth.
  // deep-audit → forces research-first; light → minimal verification; skip → filtered out before this point.
  if (options.auditTier) {
    args.push('--audit-tier', options.auditTier);
  }

  return args;
}

function executeItem(item, options = {}) {
  console.log(`\n  Executing: [${item.action}] ${item.skill}...`);
  checkpoint('update', ['--item', item.skill, '--phase', 'processing']);

  let success = false;
  let details = '';

  switch (item.action) {
    case 'improve_skill': {
      // Run the skill improvement loop for this single skill.
      // No timeout — let the subprocess run to completion or fail loud.
      // The improvement loop has its own signal handlers and worktree cleanup.
      // stdio: 'inherit' streams progress to terminal so the operator can see eval results.
      const childArtifactsDir = path.join(PROGRESS_DIR, 'child-runs', `${item.skill}-${Date.now()}`);
      const itemOptions = { ...options, auditTier: item.auditTier || 'standard' };
      const args = buildImprovementLoopArgs(item.skill, childArtifactsDir, itemOptions);
      const result = spawnSync('node', args, { stdio: 'inherit', cwd: _WORKSPACE });

      success = result.status === 0;
      details = success ? 'improved' : summarizeChildSkillRun(childArtifactsDir) || `exit ${result.status}`;
      break;
    }

    case 'scaffold_skill': {
      const redirectTarget = pickScaffoldRedirect(item.skill);
      if (redirectTarget) {
        const result = spawnSync('node', [
          path.join(_WORKSPACE, 'scripts', 'run-skill-improvement-loop.js'),
          '--skills-root', path.join(_WORKSPACE, 'skills'),
          '--include', redirectTarget,
          '--apply',
          '--require-kept',
        ], { stdio: 'inherit', cwd: _WORKSPACE });

        success = result.status === 0;
        details = success
          ? `redirected scaffold into existing skill improvement: ${redirectTarget}`
          : `exit ${result.status}`;
        break;
      }

      // Run auto-create for this candidate
      // Note: eval is always skipped in evolution loop context — A/B eval adds ~10min per skill
      // which is too slow for batch processing. Use /skill-discovery for eval-gated creation.
      const result = spawnSync('node', [
        path.join(_WORKSPACE, 'scripts', 'skill-auto-create.js'),
        '--candidate', item.skill,
        '--skip-eval',
      ], { encoding: 'utf8', cwd: _WORKSPACE });

      success = result.status === 0;
      details = success ? 'created' : buildCommandFailureDetails(result);
      break;
    }

    case 'fix_semantics': {
      // This needs AI to rewrite the description — dispatch as an improvement
      const childArtifactsDir = path.join(PROGRESS_DIR, 'child-runs', `${item.skill}-${Date.now()}`);
      const itemOptions = { ...options, auditTier: item.auditTier || 'standard' };
      const args = buildImprovementLoopArgs(item.skill, childArtifactsDir, itemOptions);
      const result = spawnSync('node', args, { stdio: 'inherit', cwd: _WORKSPACE });

      success = result.status === 0;
      details = success ? 'semantics fixed' : summarizeChildSkillRun(childArtifactsDir) || `exit ${result.status}`;
      break;
    }

    case 'generate_evals': {
      // Skill exists but has no evals — generate them so the skill can be improved and evaluated.
      // Uses the improvement loop which handles eval generation as part of its pipeline.
      const skillDir = findSkillDir(item.skill);
      if (!skillDir) {
        success = false;
        details = `skill directory not found for "${item.skill}"`;
        break;
      }

      const evalsDir = path.join(skillDir, 'evals');
      if (!fs.existsSync(evalsDir)) fs.mkdirSync(evalsDir, { recursive: true });

      // Dispatch Sonnet to generate evals grounded in the skill's content
      const promptFile = path.join(PROGRESS_DIR, `eval-gen-${item.skill}.txt`);
      const skillContent = fs.readFileSync(path.join(skillDir, 'SKILL.md'), 'utf8');
      const evalPrompt = [
        `Generate an evals/evals.json file for the "${item.skill}" skill.`,
        '',
        'Read the skill content below and create >= 7 eval scenarios that test:',
        '- The skill\'s key differentiators (rules the base model wouldn\'t know)',
        '- Project-specific knowledge (not generic advice)',
        '- At least 1 negative expectation per eval ("Does NOT...")',
        '- Each eval needs: id, prompt (realistic task), expected_output, expectations (3+ items)',
        '',
        `Write the output to: ${path.join(evalsDir, 'evals.json')}`,
        '',
        '## Skill Content',
        skillContent.slice(0, 6000),
      ].join('\n');
      fs.writeFileSync(promptFile, evalPrompt);

      const result = spawnSync('node', [
        path.join(_WORKSPACE, 'scripts', 'dispatch-solver.js'),
        'launch', '--model', 'sonnet', '--prompt-file', promptFile, '--timeout', '180',
      ], { encoding: 'utf8', cwd: _WORKSPACE });

      try { fs.unlinkSync(promptFile); } catch {}

      // Check if evals were generated
      const evalsFile = path.join(evalsDir, 'evals.json');
      if (fs.existsSync(evalsFile)) {
        try {
          const validation = validateGeneratedEvalsBundle(evalsFile);
          success = validation.valid;
          details = success ? `generated ${validation.count} evals` : validation.reason;
          if (!success) {
            try { fs.unlinkSync(evalsFile); } catch {}
          }
        } catch {
          success = false;
          details = 'evals.json parse error after generation';
          try { fs.unlinkSync(evalsFile); } catch {}
        }
      } else {
        success = result.status === 0;
        details = success ? 'dispatch completed but no evals file found' : 'dispatch failed';
      }
      break;
    }

    case 'archive_skill': {
      // Move to _archived — but only log the suggestion, don't auto-archive
      console.log(`    SUGGESTION: archive ${item.skill} (zero injections, low eval scores)`);
      success = true;
      details = 'suggested for archive (not auto-executed)';
      break;
    }

    default:
      console.log(`    Unknown action: ${item.action}`);
      success = false;
      details = 'unknown action';
  }

  if (success) {
    console.log(`    Done: ${details}`);
  } else {
    console.log(`    Failed: ${summarizeDetail(details)}`);
  }

  checkpoint('advance', ['--phase', 'committed']);

  emitEvent('skill_evolution_completed', {
    skill: item.skill,
    action: item.action,
    outcome: success ? 'kept' : 'failed',
  });

  return { skill: item.skill, action: item.action, success, details };
}

function phaseExecute(triaged, maxIterations, options = {}) {
  console.log('\n--- Phase: EXECUTE ---');

  const results = [];
  let globalConsecutiveFailures = 0;
  let stoppedEarly = false;
  let stopReason = null;
  const failureBudget = options.failureBudget || (options.continueAfterFailures ? Number.POSITIVE_INFINITY : 5);
  const perSkillFailureLimit = options.perSkillFailureLimit || 2;
  const perSkillFailures = new Map();
  const limit = Math.min(triaged.length, maxIterations);
  const execute = options.executeItem || executeItem;

  for (let i = 0; i < limit; i++) {
    const item = triaged[i];

    // Skip skills that have hit their per-skill failure limit
    const skillFails = perSkillFailures.get(item.skill) || 0;
    if (skillFails >= perSkillFailureLimit) {
      console.log(`  Skipping ${item.skill} — ${skillFails} consecutive failures for this skill`);
      results.push({ skill: item.skill, action: item.action, success: false, details: 'skipped: per-skill failure limit', skipped: true });
      continue;
    }

    const result = execute(item, options);
    results.push(result);

    if (result.success) {
      globalConsecutiveFailures = 0;
      perSkillFailures.delete(item.skill);
    } else {
      perSkillFailures.set(item.skill, skillFails + 1);
      globalConsecutiveFailures++;
      if (globalConsecutiveFailures >= failureBudget) {
        console.error(`  ${failureBudget} global consecutive failures — stopping execution.`);
        stoppedEarly = true;
        stopReason = 'consecutive_failures';
        break;
      }
    }
  }

  return {
    results,
    stoppedEarly,
    stopReason,
    skipped: limit - results.length,
  };
}

// ─── Phase: Verify & Report ─────────────────────────────────────

function phaseVerifyAndReport(execution) {
  console.log('\n--- Phase: VERIFY & REPORT ---');

  const results = execution.results;

  const succeeded = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`  Processed: ${results.length}`);
  console.log(`  Succeeded: ${succeeded}`);
  console.log(`  Failed: ${failed}`);
  if (execution.stoppedEarly) {
    console.log(`  Stopped early: yes (${execution.stopReason}, skipped ${execution.skipped})`);
  }

  // Log findings to the loop-local resumability log (used by --resume and loop-supervisor).
  // This is separate from the shared bus below — the local log is for internal loop state;
  // the shared bus is the cross-loop evidence record used by propagation and rankers.
  if (!fs.existsSync(PROGRESS_DIR)) fs.mkdirSync(PROGRESS_DIR, { recursive: true });
  const findingsPath = path.join(PROGRESS_DIR, 'findings.jsonl');
  for (const result of results) {
    const entry = {
      timestamp: new Date().toISOString(),
      ...result,
    };
    fs.appendFileSync(findingsPath, JSON.stringify(entry) + '\n');
  }

  // Priority 1: Write to skill health ledger for persistent tracking
  for (const result of results) {
    try {
      writeHealthLedgerEntry({
        skill: result.skill,
        action: result.action,
        kept: result.success,
        score: null, // Score populated when A/B eval data is available
        baselineScore: null,
        details: result.details || '',
      });
    } catch (err) {
      console.warn(`  [warn] health ledger write failed for ${result.skill}: ${err.message}`);
    }
  }

  // SH-2923: emit each outcome to the shared Auto-Improve findings bus so this loop
  // becomes a client of the spine instead of a parallel logger.
  // Finding fields follow the schema enforced by emit-auto-improve-finding.js:buildFinding().
  for (const result of results) {
    try {
      appendJsonl(AUTO_IMPROVE_FINDINGS_LOG, {
        timestamp: new Date().toISOString(),
        loop: LOOP_NAME,                          // 'skill-evolution'
        asset_id: `skill:${result.skill}`,        // matches registry id format
        asset_type: 'skill',
        finding_type: result.action,              // 'improve_skill', 'scaffold_skill', etc.
        severity: 'medium',
        metric_before: null,
        metric_after: null,
        kept: result.success,
        hard_regression: false,
        evidence: [],
        affected_paths: [],
        propagation_targets: [],
        notes: result.details || '',
      });
    } catch (err) {
      // Non-fatal: a failed bus write should not abort the loop or mask the real outcome.
      // The loop-local log above still has the finding for resumability purposes.
      console.warn(`  [warn] shared findings bus write failed for ${result.skill}: ${err.message}`);
    }
  }

  // Final checkpoint
  checkpoint('update', ['--item', 'complete', '--phase', 'done']);
  checkpoint('stats', ['--set', `items_completed=${results.length}`]);

  emitEvent('skill_evolution_cycle', {
    items_processed: results.length,
    items_succeeded: succeeded,
    items_failed: failed,
    stopped_early: execution.stoppedEarly,
  });

  return { succeeded, failed, total: results.length, stoppedEarly: execution.stoppedEarly, skipped: execution.skipped };
}

function determineLoopExitCode(summary) {
  if (!summary) return 1;  // No summary = failure (was: 0, causing false-green)
  if (summary.stoppedEarly) return 2;  // Ralph Wiggum stop
  if (summary.failed > 0) return 1;  // Any failures = partial failure (was: only when succeeded===0)
  return 0;  // All succeeded
}

// ─── Auto-Improve: Karpathy spine ──────────────────────────────
// Implements the full Karpathy pattern: SELECT → BASELINE → IMPROVE → EVALUATE → GATE → PROPAGATE → RECORD
// Wires existing infrastructure that was previously disconnected.

const {
  writeRegistry,
  updateRegistryScore,
  markPropagationPending,
  buildFallbackRegistry,
} = require('../audit-shared/auto-improve');

const { findPropagationTargets, createContext: createPropagationContext } = require('../../docs/find-propagation-targets');

function bootstrapRegistry(registry) {
  // If registry has fewer than 20 assets, merge in the full census from manifest
  if ((registry.assets || []).length >= 20) return registry;

  console.log('  Registry has < 20 assets — bootstrapping from manifest...');
  const fallback = buildFallbackRegistry();
  const existingIds = new Set((registry.assets || []).map(a => a.id));

  let added = 0;
  for (const asset of fallback.assets || []) {
    if (!existingIds.has(asset.id)) {
      registry.assets.push({
        ...asset,
        last_score: null,
        last_eval_at: null,
        quality_history: [],
        consecutive_failures: 0,
        propagation_pending: false,
      });
      added++;
    }
  }

  console.log(`  Bootstrapped ${added} assets from manifest (total: ${registry.assets.length})`);
  return registry;
}

function selectAutoImproveQueue(registry, topN) {
  const skills = (registry.assets || []).filter(a => a.type === 'skill');

  // Prioritize: propagation_pending first, then lowest score, then never-evaluated
  const sorted = skills.sort((a, b) => {
    // Propagation-pending skills come first
    if (a.propagation_pending && !b.propagation_pending) return -1;
    if (!a.propagation_pending && b.propagation_pending) return 1;

    // Never-evaluated skills come before evaluated ones (need baseline)
    const aScore = a.last_score ?? -1;
    const bScore = b.last_score ?? -1;
    if (aScore === -1 && bScore !== -1) return -1;
    if (aScore !== -1 && bScore === -1) return 1;

    // Lower scores come first (most room for improvement)
    return aScore - bScore;
  });

  return sorted.slice(0, topN).map(asset => ({
    skill: String(asset.id || '').replace(/^skill:/, ''),
    action: 'improve_skill',
    priority: asset.tier || 3,
    findings: asset.propagation_pending
      ? ['Propagation pending from improved related skill']
      : [`Current score: ${asset.last_score ?? 'not evaluated'}`],
    source: 'auto-improve',
    _asset: asset,
  }));
}

function checkConvergence(registry, window = 3, threshold = 0.005) {
  const skills = (registry.assets || []).filter(a => a.type === 'skill' && Array.isArray(a.quality_history) && a.quality_history.length >= window);
  if (skills.length === 0) return false;

  // Check if all skills with enough history have converged (delta below threshold)
  const converged = skills.every(asset => {
    const history = asset.quality_history.slice(-window);
    if (history.length < window) return false;
    const deltas = [];
    for (let i = 1; i < history.length; i++) {
      deltas.push(Math.abs(history[i].score - history[i - 1].score));
    }
    return deltas.every(d => d < threshold);
  });

  return converged;
}

function checkQualityCeiling(registry, ceiling = 0.90) {
  const skills = (registry.assets || []).filter(a => a.type === 'skill' && a.last_score !== null && a.last_score !== undefined);
  if (skills.length === 0) return false;
  return skills.every(a => a.last_score >= ceiling);
}

function runAutoImproveCycle(args) {
  const topN = args.top || 10;
  const maxIterations = args['max-iterations'] || 5;
  const runId = `auto-improve-${Date.now()}`;

  console.log('\n--- AUTO-IMPROVE: Karpathy Spine ---');
  console.log(`  Run ID: ${runId}`);
  console.log(`  Top: ${topN} | Max iterations: ${maxIterations}`);

  // Step 1: Load and bootstrap registry
  let registry = readRegistry();
  registry = bootstrapRegistry(registry);
  if (!registry.meta) {
    registry.meta = { last_run_at: null, total_runs: 0, total_improvements: 0, total_regressions_blocked: 0 };
  }

  // Step 2: SELECT — pick lowest-scoring + propagation-pending skills
  const queue = selectAutoImproveQueue(registry, topN);
  if (queue.length === 0) {
    console.log('  No skills to improve. All skills healthy or registry empty.');
    return null;
  }

  console.log(`\n  Selected ${queue.length} skills for improvement:`);
  for (const item of queue) {
    const tag = item._asset.propagation_pending ? 'PROPAGATE' : 'IMPROVE';
    const score = (item._asset.last_score === null || item._asset.last_score === undefined) ? 'n/a' : item._asset.last_score.toFixed(3);
    console.log(`    [${tag}] ${item.skill} (score: ${score})`);
  }

  // Clear propagation_pending for selected skills
  for (const item of queue) {
    if (item._asset.propagation_pending) {
      item._asset.propagation_pending = false;
    }
  }

  // Step 3: EXECUTE with multi-model judging
  const triaged = queue.map(({ _asset, ...rest }) => rest);
  const execution = phaseExecute(triaged, maxIterations, {
    continueAfterFailures: true,
    failureBudget: args['failure-budget'] ? Number(args['failure-budget']) : 5,
  });

  // Step 4: VERIFY & REPORT (reuse existing phase)
  const summary = phaseVerifyAndReport(execution);

  // Step 5: Update registry scores for each result
  let propagationContext;
  try {
    propagationContext = createPropagationContext({ registry });
  } catch {
    propagationContext = null;
  }

  let improvementsThisCycle = 0;
  let regressionsBlocked = 0;

  for (const result of execution.results) {
    const assetId = `skill:${result.skill}`;
    if (result.success) {
      // Read child summary for score if available
      const childDir = path.join(PROGRESS_DIR, 'child-runs');
      let score = null;
      try {
        const childDirs = fs.readdirSync(childDir).filter(d => d.startsWith(result.skill + '-')).sort().reverse();
        if (childDirs.length > 0) {
          const summaryPath = path.join(childDir, childDirs[0], 'summary.json');
          if (fs.existsSync(summaryPath)) {
            const childSummary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
            const firstSkill = Array.isArray(childSummary.skills) ? childSummary.skills[0] : null;
            if (firstSkill && typeof firstSkill.score === 'number') {
              score = firstSkill.score;
            }
          }
        }
      } catch {}

      if (score !== null) {
        updateRegistryScore(registry, assetId, score, new Date().toISOString());
        improvementsThisCycle++;
      }

      // Step 6: PROPAGATE — find related skills and queue for re-eval
      if (propagationContext) {
        try {
          const finding = {
            asset_id: assetId,
            affected_paths: [],
          };
          const targets = findPropagationTargets(finding, propagationContext, { maxTargets: 5 });
          // Filter out self
          const otherTargets = targets.filter(t => t.id !== result.skill);
          if (otherTargets.length > 0) {
            const targetIds = otherTargets.map(t => `skill:${t.id}`);
            markPropagationPending(registry, targetIds);
            console.log(`  Propagation queued: ${otherTargets.length} related skills for ${result.skill}`);

            // Emit structured finding with propagation targets
            try {
              appendJsonl(AUTO_IMPROVE_FINDINGS_LOG, {
                timestamp: new Date().toISOString(),
                loop: LOOP_NAME,
                asset_id: assetId,
                asset_type: 'skill',
                finding_type: 'auto_improve_propagation',
                severity: 'low',
                metric_before: null,
                metric_after: score,
                kept: true,
                hard_regression: false,
                evidence: [],
                affected_paths: [],
                propagation_targets: targetIds,
                notes: `Propagating improvement to ${otherTargets.length} related skills`,
                run_id: runId,
              });
            } catch {}
          }
        } catch (err) {
          console.warn(`  [warn] propagation failed for ${result.skill}: ${err.message}`);
        }
      }
    } else {
      // Track consecutive failures in registry
      const asset = registry.assets.find(a => a.id === assetId);
      if (asset) {
        asset.consecutive_failures = (asset.consecutive_failures || 0) + 1;
      }
      if (!result.skipped) regressionsBlocked++;
    }
  }

  // Step 7: Update registry meta and persist
  registry.meta.last_run_at = new Date().toISOString();
  registry.meta.total_runs = (registry.meta.total_runs || 0) + 1;
  registry.meta.total_improvements = (registry.meta.total_improvements || 0) + improvementsThisCycle;
  registry.meta.total_regressions_blocked = (registry.meta.total_regressions_blocked || 0) + regressionsBlocked;

  try {
    writeRegistry(registry);
    console.log('  Registry updated.');
  } catch (err) {
    console.error(`  [error] Failed to write registry: ${err.message}`);
  }

  // Step 8: Check convergence
  if (checkConvergence(registry)) {
    console.log('\n  CONVERGED — all recent deltas below threshold. Auto-improve complete.');
    summary.converged = true;
  }
  if (checkQualityCeiling(registry)) {
    console.log('\n  QUALITY CEILING — all evaluated skills score >= 0.90. Auto-improve complete.');
    summary.converged = true;
  }

  console.log(`\n  Auto-improve cycle: +${improvementsThisCycle} improvements, ${regressionsBlocked} regressions blocked`);
  return summary;
}

// ─── Main ────────────────────────────────────────────────────────

function runCycle(args) {
  const analyzeOnly = Boolean(args['analyze-only']);
  const topN = args.top || 5;
  const maxIterations = args['max-iterations'] || 20;
  const actionFilter = args.actions || null;
  const minPriority = args['min-priority'] || 0;
  const pilot = args.pilot || null;

  // Phase 1: Analyze
  const analysis = phaseAnalyze(args);
  if (!analysis) {
    console.error('Analysis failed. Aborting cycle.');
    return null;
  }

  if (analyzeOnly) {
    console.log(`\nAnalysis complete${pilot ? ` for pilot ${pilot}` : ''}. Use --top N to process items.`);
    return { succeeded: 0, failed: 0, total: 0, analyzeOnly: true };
  }

  // Filter by minimum priority threshold
  let queue = analysis.queue;
  if (minPriority > 0) {
    queue = queue.filter(item => item.priority >= minPriority);
  }

  if (pilot === TEMPLATE_OWNED_META_PILOT) {
    const registry = readRegistry();
    queue = resolveTemplateOwnedPilotQueue(queue, registry, {
      allowFallback: !Boolean(args.continuous),
    });
  }

  if (queue.length === 0) {
    console.log(pilot === TEMPLATE_OWNED_META_PILOT
      ? '\nNo template-owned meta pilot skills are queued right now.'
      : '\nNo items above priority threshold. All skills are healthy!');
    return null;
  }

  // Phase 2: Triage
  const triaged = phaseTriage({ ...analysis, queue }, topN, actionFilter);

  if (triaged.length === 0) {
    console.log('\nNo items matched the filter.');
    return null;
  }

  // Phase 3: Execute
  const execution = phaseExecute(triaged, maxIterations, {
    pilot,
    continueAfterFailures: Boolean(args['continue-after-failures']),
    failureBudget: args['failure-budget'] ? Number(args['failure-budget']) : undefined,
  });

  // Phase 4: Verify & Report
  const summary = phaseVerifyAndReport(execution);

  console.log(`\n  Cycle result: Succeeded: ${summary.succeeded} | Failed: ${summary.failed} | Total: ${summary.total}`);
  return summary;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const continuous = Boolean(args.continuous);
  const autoImprove = Boolean(args['auto-improve']);
  const maxCycles = args['max-cycles'] || 10;
  const cooldownSec = args.cooldown || 30;
  const resume = Boolean(args.resume);

  console.log('=== Skill Evolution Loop ===');
  console.log(`Top: ${args.top || 5} | Max iterations: ${args['max-iterations'] || 20} | Actions: ${args.actions || 'all'}`);
  if (args.pilot) {
    console.log(`Pilot: ${args.pilot}`);
  }
  if (args['continue-after-failures']) {
    console.log('Mode: continue-after-failures');
  }
  if (autoImprove) {
    console.log(`Mode: AUTO-IMPROVE (Karpathy spine, max ${maxCycles} cycles, failure-budget: ${args['failure-budget'] || 5})`);
  }
  if (continuous) {
    console.log(`Mode: CONTINUOUS (max ${maxCycles} cycles, ${cooldownSec}s cooldown, min-priority: ${args['min-priority'] || 0})`);
  }

  // Check/resume checkpoint
  if (resume) {
    const state = checkpoint('read');
    if (state.current_phase && state.current_phase !== 'idle' && state.current_phase !== 'done') {
      console.log(`  Resuming from: ${state.current_item} (${state.current_phase})`);
    }
  }

  // Auto-improve mode: Karpathy spine (SELECT → IMPROVE → EVALUATE → GATE → PROPAGATE → RECORD)
  if (autoImprove) {
    let totalSucceeded = 0;
    let totalFailed = 0;

    for (let cycle = 1; cycle <= maxCycles; cycle++) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`=== Auto-Improve Cycle ${cycle}/${maxCycles} ===`);
      console.log(`${'='.repeat(60)}`);

      const summary = runAutoImproveCycle(args);

      if (!summary) {
        console.log('\nNo skills to improve. Auto-improve complete.');
        break;
      }

      totalSucceeded += summary.succeeded;
      totalFailed += summary.failed;

      // Stop on convergence
      if (summary.converged) break;

      // Stop if nothing succeeded (all items are failing)
      if (summary.succeeded === 0 && summary.failed > 0) {
        console.log('\nNo successes — stopping to avoid waste.');
        break;
      }

      // Cooldown before next cycle
      if (cycle < maxCycles) {
        console.log(`\nCooldown ${cooldownSec}s before next cycle...`);
        const waitUntil = Date.now() + cooldownSec * 1000;
        while (Date.now() < waitUntil) {
          const remaining = Math.ceil((waitUntil - Date.now()) / 1000);
          if (remaining > 0 && remaining % 10 === 0) {
            process.stdout.write(`  ${remaining}s remaining...\r`);
          }
          require('child_process').spawnSync('sleep', ['1']);
        }
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('=== Auto-Improve Complete ===');
    console.log(`Total succeeded: ${totalSucceeded} | Total failed: ${totalFailed}`);
    console.log(`${'='.repeat(60)}`);
    process.exit(determineLoopExitCode({ succeeded: totalSucceeded, failed: totalFailed }));
  }

  if (!continuous) {
    // Single-shot mode (original behavior)
    const summary = runCycle(args);
    if (summary) {
      console.log('\n=== Evolution Loop Complete ===');
      console.log(`Succeeded: ${summary.succeeded} | Failed: ${summary.failed} | Total: ${summary.total}`);
      if (summary.succeeded > 0) {
        console.log('\nRe-run with --continuous to auto-reprioritize after improvements.');
      }
    }
    process.exit(determineLoopExitCode(summary));
  }

  // Continuous mode: analyze → execute → re-analyze → repeat
  let totalSucceeded = 0;
  let totalFailed = 0;
  let consecutiveEmptyCycles = 0;

  for (let cycle = 1; cycle <= maxCycles; cycle++) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`=== Cycle ${cycle}/${maxCycles} ===`);
    console.log(`${'='.repeat(60)}`);

    const summary = runCycle(args);

    if (!summary) {
      consecutiveEmptyCycles++;
      if (consecutiveEmptyCycles >= 2) {
        console.log('\n2 consecutive empty cycles — queue exhausted. Stopping.');
        break;
      }
      console.log('Empty cycle. Will re-analyze once more to confirm.');
      continue;
    }

    consecutiveEmptyCycles = 0;
    totalSucceeded += summary.succeeded;
    totalFailed += summary.failed;

    // Stop if nothing succeeded (all items are failing)
    if (summary.succeeded === 0 && summary.failed > 0) {
      console.log('\nNo successes in this cycle — stopping to avoid waste.');
      break;
    }

    // Cooldown before re-analysis (let file writes settle)
    if (cycle < maxCycles) {
      console.log(`\nCooldown ${cooldownSec}s before re-analysis...`);
      const waitUntil = Date.now() + cooldownSec * 1000;
      while (Date.now() < waitUntil) {
        // Busy-wait in small increments (Node has no native sleep)
        const remaining = Math.ceil((waitUntil - Date.now()) / 1000);
        if (remaining > 0 && remaining % 10 === 0) {
          process.stdout.write(`  ${remaining}s remaining...\r`);
        }
        require('child_process').spawnSync('sleep', ['1']);
      }
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('=== Continuous Evolution Complete ===');
  console.log(`Total succeeded: ${totalSucceeded} | Total failed: ${totalFailed}`);
  console.log(`${'='.repeat(60)}`);
  process.exit(determineLoopExitCode({ succeeded: totalSucceeded, failed: totalFailed }));
}

if (require.main === module) {
  main();
} else {
  module.exports = {
    main,
    determineLoopExitCode,
    buildImprovementLoopArgs,
    pickScaffoldRedirect,
    summarizeDetail,
    validateGeneratedEvalsBundle,
    buildCommandFailureDetails,
    phaseExecute,
    runAutoImproveCycle,
    bootstrapRegistry,
    selectAutoImproveQueue,
    checkConvergence,
    checkQualityCeiling,
  };
}
