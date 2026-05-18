#!/usr/bin/env node
'use strict';

/**
 * research-feedback.js — Close the loop between research artifacts and the skill system.
 *
 * Reads .research/ artifacts (fingerprint store, session scores, decision registries,
 * audits) and correlates them with the 412-skill system to produce actionable improvement
 * suggestions. No changes are made without explicit approval.
 *
 * Subcommands:
 *   analyze              — scan all artifacts, output a report of suggested improvements
 *   analyze --skill X    — scope analysis to one skill
 *   analyze --source Y   — scope to one source type (fingerprints|scores|decisions|audits)
 *   apply --skill X      — apply approved suggestions to a specific skill (interactive)
 *
 * Sources:
 *   1. Fingerprint store → recurring errors → skill anti-pattern entries
 *   2. Session scores + skill injection logs → per-skill quality correlation
 *   3. Decision registries → architectural decisions → skill Key Files enrichment
 *   4. Audit findings → UI/UX findings → design/UX skill content
 *
 * Output: JSON report mapping N findings to M skills with suggested content additions.
 */

// SH-4568 Connect .research/ artifacts to skill improvement pipeline
// https://linear.app/sales-hub/issue/SH-4568
// Claude Opus 4.6 via Anthropic in Claude Code 02.04.2026.08:00

const fs = require('fs');
const path = require('path');

// ── Paths ──────────────────────────────────────────────────────────

const ROOT = path.resolve(__dirname, '..', '..');
const RESEARCH_DIR = path.join(ROOT, '.research');
const FINGERPRINT_STORE = path.join(RESEARCH_DIR, 'session-logs', '.fingerprint-store.json');
const SCORES_DIR = path.join(RESEARCH_DIR, 'session-scores');
const DECISIONS_DIR = path.join(RESEARCH_DIR, 'decision-registries');
const AUDITS_DIR = path.join(RESEARCH_DIR, 'audits');
const SKILL_GRAPH_PATH = path.join(ROOT, 'scripts', 'discovery', 'skill-graph.json');
const INJECTION_LOG_PATH = path.join(RESEARCH_DIR, 'skill-injection-log.jsonl');
const SKILLS_DIR = path.join(ROOT, 'skills');
const SH_SKILLS_DIR = path.join(ROOT, 'skills', 'sales-hub');

// ── Skill Graph Loader ─────────────────────────────────────────────

let _graphNodes = [];
let _graphEdges = [];
let _adjacencyMap = {};  // skill → [{ target, weight, type }]
let _layerMap = {};      // skill → layer
let _skillKeywords = {}; // skill → [keywords from frontmatter]

function loadSkillGraph() {
  try {
    const data = JSON.parse(fs.readFileSync(SKILL_GRAPH_PATH, 'utf8'));
    _graphNodes = data.nodes || [];
    _graphEdges = data.edges || [];

    for (const node of _graphNodes) {
      _layerMap[node.id] = node.layer || 'meta';
    }

    for (const edge of _graphEdges) {
      if (!_adjacencyMap[edge.source]) _adjacencyMap[edge.source] = [];
      _adjacencyMap[edge.source].push({ target: edge.target, weight: edge.weight || 1, type: edge.type });
      if (edge.type !== 'verify_with') {
        if (!_adjacencyMap[edge.target]) _adjacencyMap[edge.target] = [];
        _adjacencyMap[edge.target].push({ target: edge.source, weight: edge.weight || 1, type: edge.type });
      }
    }
  } catch (e) {
    console.error(`[research-feedback] WARNING: Failed to load skill graph: ${e.message}`);
  }
}

function loadSkillKeywords() {
  // Load frontmatter keywords from each skill for matching
  const dirs = [SKILLS_DIR, SH_SKILLS_DIR];
  for (const base of dirs) {
    if (!fs.existsSync(base)) continue;
    for (const entry of fs.readdirSync(base)) {
      const skillFile = path.join(base, entry, 'SKILL.md');
      if (!fs.existsSync(skillFile)) continue;
      try {
        const content = fs.readFileSync(skillFile, 'utf8');
        const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (!fmMatch) continue;
        const fm = fmMatch[1];
        // Extract keywords array
        const kwMatch = fm.match(/keywords:\s*\n((?:\s+-\s+.+\n)*)/);
        if (kwMatch) {
          const kws = kwMatch[1].match(/- (.+)/g);
          if (kws) {
            const skillId = base === SH_SKILLS_DIR ? entry : entry;
            _skillKeywords[skillId] = kws.map(k => k.replace(/^- /, '').trim().toLowerCase());
          }
        }
        // Also extract from triggers
        const trigMatch = fm.match(/triggers:\s*\n((?:\s+-\s+.+\n)*)/);
        if (trigMatch) {
          const triggers = trigMatch[1].match(/- (.+)/g);
          if (triggers) {
            const skillId = entry;
            if (!_skillKeywords[skillId]) _skillKeywords[skillId] = [];
            _skillKeywords[skillId].push(...triggers.map(t => t.replace(/^- /, '').trim().toLowerCase()));
          }
        }
      } catch { /* skip unreadable */ }
    }
  }
}

// ── Domain Matching ────────────────────────────────────────────────

/**
 * Domain keywords extracted from error patterns and text.
 * Maps domain terms to skill names via the graph and keyword indices.
 */
const DOMAIN_SKILL_MAP = {
  // Auth domain
  'auth': ['nextauth-patterns', 'authorization-gates', 'auth-account-recovery'],
  'session': ['nextauth-patterns'],
  'nextauth': ['nextauth-patterns'],
  'login': ['nextauth-patterns', 'auth-account-recovery'],
  'oauth': ['nextauth-patterns'],
  // Database domain
  'database': ['data-architect', 'database-migration'],
  'sql': ['data-architect', 'sql-ledger-patterns'],
  'query': ['data-architect'],
  'migration': ['database-migration'],
  'postgres': ['data-architect'],
  'rls': ['postgres-rls'],
  'org_id': ['postgres-rls', 'data-architect'],
  // Webhook/integration domain
  'webhook': ['webhook-integration'],
  'shopify': ['shopify', 'webhook-integration'],
  'printify': ['printify', 'webhook-integration'],
  'stripe': ['stripe-sales-hub', 'webhook-integration'],
  'paypal': ['webhook-integration'],
  'fulfillment': ['fulfillment'],
  // Frontend domain
  'component': ['visual-design'],
  'react': ['visual-design'],
  'scss': ['scss-expert'],
  'css': ['scss-expert'],
  'layout': ['scss-expert', 'responsive'],
  'chart': ['data-viz', 'chart-engineering'],
  'dashboard': ['data-viz'],
  // Design domain
  'a11y': ['a11y'],
  'accessibility': ['a11y'],
  'color': ['color-science'],
  'typography': ['typography'],
  'animation': ['motion-design'],
  'responsive': ['responsive'],
  // Agent domain
  'skill': ['skill-scaffold'],
  'agent': ['ai-coding-agents'],
  'orchestration': ['ai-coding-agents'],
  'linear': ['linear'],
  // Security domain
  'security': ['security-scanning'],
  'xss': ['security-scanning'],
  'injection': ['security-scanning'],
};

function matchTextToSkills(text) {
  const lower = text.toLowerCase();
  const matched = new Set();

  // Direct domain keyword matching
  for (const [keyword, skills] of Object.entries(DOMAIN_SKILL_MAP)) {
    if (lower.includes(keyword)) {
      skills.forEach(s => matched.add(s));
    }
  }

  // Skill frontmatter keyword matching
  for (const [skillId, keywords] of Object.entries(_skillKeywords)) {
    for (const kw of keywords) {
      if (kw.length >= 4 && lower.includes(kw)) {
        matched.add(skillId);
        break;
      }
    }
  }

  return [...matched];
}

function matchFilePathsToSkills(filePaths) {
  const matched = new Set();
  for (const fp of filePaths) {
    const lower = fp.toLowerCase();
    // Match by file path patterns
    if (lower.includes('/webhook') || lower.includes('webhook')) matched.add('webhook-integration');
    if (lower.includes('/auth') || lower.includes('nextauth')) matched.add('nextauth-patterns');
    if (lower.includes('/migration') || lower.includes('.sql')) matched.add('database-migration');
    if (lower.includes('/api/')) matched.add('api-error-contracts');
    if (lower.includes('.scss')) matched.add('scss-expert');
    if (lower.includes('/components/')) matched.add('visual-design');
    if (lower.includes('/chart') || lower.includes('chart')) matched.add('chart-engineering');
    if (lower.includes('/dashboard')) matched.add('data-viz');
    if (lower.includes('/shopify')) matched.add('shopify');
    if (lower.includes('/printify')) matched.add('printify');
    if (lower.includes('/stripe')) matched.add('stripe-sales-hub');
    if (lower.includes('/fulfillment')) matched.add('fulfillment');
    if (lower.includes('/onboarding')) matched.add('onboarding');
    if (lower.includes('skill-injector') || lower.includes('skill-router')) matched.add('skill-scaffold');
    if (lower.includes('/linear')) matched.add('linear');
  }
  return [...matched];
}

// ── Source 1: Fingerprint Store → Anti-Patterns ────────────────────

function analyzeFingerprints() {
  const suggestions = [];

  if (!fs.existsSync(FINGERPRINT_STORE)) {
    return { source: 'fingerprints', count: 0, suggestions };
  }

  const store = JSON.parse(fs.readFileSync(FINGERPRINT_STORE, 'utf8'));
  const entries = Object.entries(store);

  // Group unresolved recurring errors (3+ occurrences)
  const recurring = entries.filter(([, meta]) =>
    !meta.resolved && meta.occurrenceCount >= 3
  );

  // Also include resolved high-frequency errors (6+) as they indicate pattern problems
  const highFreqResolved = entries.filter(([, meta]) =>
    meta.resolved && meta.occurrenceCount >= 6
  );

  const allRelevant = [...recurring, ...highFreqResolved];

  for (const [errorKey, meta] of allRelevant) {
    const skills = matchTextToSkills(errorKey);
    if (skills.length === 0) continue;

    // Extract error type prefix
    const typeMatch = errorKey.match(/^(runtime|ts|npm|stall|test|lint):/);
    const errorType = typeMatch ? typeMatch[1] : 'unknown';

    suggestions.push({
      type: 'anti-pattern',
      source: 'fingerprint-store',
      errorKey: errorKey.slice(0, 120),
      errorType,
      occurrences: meta.occurrenceCount,
      resolved: meta.resolved || false,
      firstSeen: meta.firstSeenAt,
      lastSeen: meta.lastSeenAt,
      targetSkills: skills,
      suggestion: `Add anti-pattern entry: "${errorKey.slice(0, 80)}..." (seen ${meta.occurrenceCount}x)`,
      content: `### Anti-Pattern: ${errorType} error (${meta.occurrenceCount} occurrences)\n` +
        `**Pattern:** \`${errorKey.slice(0, 100)}\`\n` +
        `**First seen:** ${meta.firstSeenAt}\n` +
        `**Status:** ${meta.resolved ? 'Resolved' : 'Active'}\n` +
        `**Mitigation:** [Needs human review — describe how to avoid this error]\n`,
    });
  }

  return {
    source: 'fingerprints',
    count: entries.length,
    recurring: recurring.length,
    highFreqResolved: highFreqResolved.length,
    suggestions,
  };
}

// ── Source 2: Session Scores → Skill Quality Correlation ───────────

function analyzeSessionScores() {
  const suggestions = [];

  if (!fs.existsSync(SCORES_DIR)) {
    return { source: 'session-scores', count: 0, suggestions };
  }

  const scoreFiles = fs.readdirSync(SCORES_DIR).filter(f => f.endsWith('.json')).sort();
  const scores = [];

  for (const file of scoreFiles) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(SCORES_DIR, file), 'utf8'));
      scores.push(data);
    } catch { /* skip */ }
  }

  // Check for skillsLoaded field (added by this feature's scorecard enhancement)
  const scoreccardsWithSkills = scores.filter(s => Array.isArray(s.skillsLoaded) && s.skillsLoaded.length > 0);

  if (scoreccardsWithSkills.length >= 3) {
    // Compute per-skill average composite score
    const skillScores = {};
    for (const sc of scoreccardsWithSkills) {
      for (const skill of sc.skillsLoaded) {
        if (!skillScores[skill]) skillScores[skill] = [];
        skillScores[skill].push(sc.composite);
      }
    }

    // Flag skills with low average scores (below B- = 2.5)
    for (const [skill, composites] of Object.entries(skillScores)) {
      if (composites.length < 2) continue; // need multiple data points
      const avg = composites.reduce((a, b) => a + b, 0) / composites.length;
      if (avg < 2.5) {
        suggestions.push({
          type: 'quality-signal',
          source: 'session-scores',
          targetSkills: [skill],
          avgScore: Math.round(avg * 10) / 10,
          sessionCount: composites.length,
          suggestion: `Skill "${skill}" correlates with low session scores (avg ${avg.toFixed(1)}/5.0 across ${composites.length} sessions)`,
          content: `## Quality Signal\nSessions loading this skill average **${avg.toFixed(1)}/5.0** (${composites.length} sessions). Review skill content for accuracy and completeness.\n`,
        });
      }
    }
  }

  // Even without skillsLoaded, report score distribution for context
  const composites = scores.map(s => s.composite).filter(Boolean);
  const avgComposite = composites.length > 0
    ? (composites.reduce((a, b) => a + b, 0) / composites.length).toFixed(1)
    : 'N/A';

  return {
    source: 'session-scores',
    count: scores.length,
    withSkillData: scoreccardsWithSkills.length,
    avgComposite,
    suggestions,
  };
}

// ── Source 3: Decision Registries → Skill Enrichment ───────────────

function analyzeDecisionRegistries() {
  const suggestions = [];

  if (!fs.existsSync(DECISIONS_DIR)) {
    return { source: 'decision-registries', count: 0, suggestions };
  }

  const files = fs.readdirSync(DECISIONS_DIR).filter(f => f.endsWith('.json'));
  const registries = [];

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(DECISIONS_DIR, file), 'utf8'));
      registries.push(data);
    } catch { /* skip */ }
  }

  for (const reg of registries) {
    const decisions = reg.decisions_made || [];
    const filesModified = reg.files_modified || [];
    const openQuestions = reg.open_questions || [];
    const taskId = reg.task_id || 'unknown';

    // Match files to skills
    const fileSkills = matchFilePathsToSkills(filesModified);

    // Match decisions text to skills
    for (const decision of decisions) {
      const text = typeof decision === 'string' ? decision : JSON.stringify(decision);
      const textSkills = matchTextToSkills(text);
      const combinedSkills = [...new Set([...fileSkills, ...textSkills])];

      if (combinedSkills.length > 0) {
        suggestions.push({
          type: 'decision-enrichment',
          source: 'decision-registry',
          taskId,
          targetSkills: combinedSkills,
          decision: text.slice(0, 200),
          suggestion: `Decision from ${taskId}: "${text.slice(0, 100)}..." → enrich ${combinedSkills.join(', ')}`,
          content: `### Decision (${taskId})\n${text.slice(0, 300)}\n**Files:** ${filesModified.slice(0, 5).map(f => path.basename(f)).join(', ')}\n`,
        });
      }
    }

    // Stall signals can indicate skill gaps
    const stalls = reg.stall_signals || [];
    for (const stall of stalls) {
      const stallText = typeof stall === 'string' ? stall : '';
      const stallSkills = matchTextToSkills(stallText);
      if (stallSkills.length > 0) {
        suggestions.push({
          type: 'stall-signal',
          source: 'decision-registry',
          taskId,
          targetSkills: stallSkills,
          stall: stallText.slice(0, 150),
          suggestion: `Stall signal in ${taskId}: "${stallText.slice(0, 80)}" → review ${stallSkills.join(', ')} for missing guidance`,
        });
      }
    }
  }

  return {
    source: 'decision-registries',
    count: registries.length,
    suggestions,
  };
}

// ── Source 4: Audit Findings → Design/UX Skill Content ─────────────

function analyzeAudits() {
  const suggestions = [];

  if (!fs.existsSync(AUDITS_DIR)) {
    return { source: 'audits', count: 0, suggestions };
  }

  const files = fs.readdirSync(AUDITS_DIR).filter(f => f.endsWith('.json'));
  const audits = [];

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(AUDITS_DIR, file), 'utf8'));
      data._filename = file;
      audits.push(data);
    } catch { /* skip */ }
  }

  for (const audit of audits) {
    const findings = audit.findings || [];
    const auditType = audit._filename.replace(/-\d{4}-\d{2}-\d{2}.*\.json$/, '');

    for (const finding of findings) {
      const title = finding.title || '';
      const evidence = finding.evidence || '';
      const recommendation = finding.recommendation || '';
      const severity = finding.severity || 'P3';
      const text = `${title} ${evidence} ${recommendation}`;

      const skills = matchTextToSkills(text);

      // Also match by audit type
      if (auditType.includes('visual') || auditType.includes('design')) {
        skills.push('visual-design', 'design-guide');
      }
      if (auditType.includes('interaction')) {
        skills.push('interaction-feedback', 'a11y');
      }
      if (auditType.includes('wrap')) {
        skills.push('doc-updater');
      }
      if (auditType.includes('pm') || auditType.includes('health')) {
        skills.push('linear');
      }

      const uniqueSkills = [...new Set(skills)];
      if (uniqueSkills.length === 0) continue;

      suggestions.push({
        type: 'audit-finding',
        source: 'audit',
        auditFile: audit._filename,
        auditType,
        severity,
        findingType: finding.type || 'QUALITY',
        targetSkills: uniqueSkills,
        title,
        suggestion: `[${severity}] ${title} → enrich ${uniqueSkills.slice(0, 3).join(', ')}`,
        content: `### Audit Finding: ${title}\n` +
          `**Severity:** ${severity} | **Type:** ${finding.type || 'QUALITY'}\n` +
          `**Evidence:** ${evidence.slice(0, 200)}\n` +
          `**Recommendation:** ${recommendation.slice(0, 200)}\n`,
      });
    }
  }

  return {
    source: 'audits',
    count: audits.length,
    totalFindings: audits.reduce((sum, a) => sum + (a.findings || []).length, 0),
    suggestions,
  };
}

// ── Aggregation ────────────────────────────────────────────────────

function aggregateBySkill(allSuggestions) {
  const bySkill = {};

  for (const suggestion of allSuggestions) {
    for (const skill of suggestion.targetSkills || []) {
      if (!bySkill[skill]) {
        bySkill[skill] = {
          skill,
          layer: _layerMap[skill] || 'unknown',
          suggestions: [],
          sources: new Set(),
          types: new Set(),
        };
      }
      bySkill[skill].suggestions.push(suggestion);
      bySkill[skill].sources.add(suggestion.source);
      bySkill[skill].types.add(suggestion.type);
    }
  }

  // Convert sets to arrays and sort by suggestion count (most impacted first)
  return Object.values(bySkill)
    .map(entry => ({
      ...entry,
      sources: [...entry.sources],
      types: [...entry.types],
      count: entry.suggestions.length,
    }))
    .sort((a, b) => b.count - a.count);
}

// ── CLI ────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    command: args[0] || 'analyze',
    skill: null,
    source: null,
    json: false,
    limit: 50,
  };

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--skill' && args[i + 1]) { opts.skill = args[++i]; }
    else if (args[i] === '--source' && args[i + 1]) { opts.source = args[++i]; }
    else if (args[i] === '--json') { opts.json = true; }
    else if (args[i] === '--limit' && args[i + 1]) { opts.limit = parseInt(args[++i], 10); }
  }

  return opts;
}

function runAnalyze(opts) {
  loadSkillGraph();
  loadSkillKeywords();

  const sources = [];
  if (!opts.source || opts.source === 'fingerprints') sources.push(analyzeFingerprints());
  if (!opts.source || opts.source === 'scores') sources.push(analyzeSessionScores());
  if (!opts.source || opts.source === 'decisions') sources.push(analyzeDecisionRegistries());
  if (!opts.source || opts.source === 'audits') sources.push(analyzeAudits());

  const allSuggestions = sources.flatMap(s => s.suggestions);
  let bySkill = aggregateBySkill(allSuggestions);

  // Filter to specific skill if requested
  if (opts.skill) {
    bySkill = bySkill.filter(entry => entry.skill === opts.skill);
  }

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalArtifacts: sources.reduce((sum, s) => sum + (s.count || 0), 0),
      totalSuggestions: allSuggestions.length,
      skillsImpacted: bySkill.length,
      sources: sources.map(s => ({
        name: s.source,
        artifacts: s.count || 0,
        suggestions: s.suggestions.length,
      })),
    },
    bySkill: bySkill.slice(0, opts.limit),
  };

  if (opts.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  // Human-readable output
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║  RESEARCH → SKILL FEEDBACK ANALYSIS                     ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║  Artifacts scanned: ${report.summary.totalArtifacts}`);
  console.log(`║  Suggestions found: ${report.summary.totalSuggestions}`);
  console.log(`║  Skills impacted:   ${report.summary.skillsImpacted}`);
  console.log('╠══════════════════════════════════════════════════════════╣');

  console.log('║  Sources:');
  for (const src of report.summary.sources) {
    console.log(`║    ${src.name}: ${src.artifacts} artifacts → ${src.suggestions} suggestions`);
  }
  console.log('╠══════════════════════════════════════════════════════════╣');

  if (bySkill.length === 0) {
    console.log('║  No suggestions found matching criteria.');
    console.log('╚══════════════════════════════════════════════════════════╝\n');
    return;
  }

  console.log('║  Top impacted skills:');
  console.log('║');

  for (const entry of bySkill.slice(0, 20)) {
    console.log(`║  ${entry.skill} (${entry.layer}) — ${entry.count} suggestions`);
    console.log(`║    Sources: ${entry.sources.join(', ')}`);
    console.log(`║    Types: ${entry.types.join(', ')}`);

    // Show top 3 suggestions per skill
    for (const sug of entry.suggestions.slice(0, 3)) {
      console.log(`║      → ${sug.suggestion.slice(0, 90)}`);
    }
    if (entry.suggestions.length > 3) {
      console.log(`║      ... and ${entry.suggestions.length - 3} more`);
    }
    console.log('║');
  }

  if (bySkill.length > 20) {
    console.log(`║  ... and ${bySkill.length - 20} more skills with suggestions`);
    console.log('║');
  }

  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('\nRun with --json for machine-readable output.');
  console.log('Run with --skill <name> to focus on a specific skill.');
  console.log('Run with --source <type> to filter by source (fingerprints|scores|decisions|audits).\n');
}

function main() {
  const opts = parseArgs();

  if (opts.command === 'analyze') {
    runAnalyze(opts);
  } else if (opts.command === 'apply') {
    if (!opts.skill) {
      console.error('Error: --skill <name> is required for the apply command.');
      console.error('Usage: node scripts/skill/research-feedback.js apply --skill <name>');
      process.exit(1);
    }
    // Apply runs analyze first, then outputs the suggested content additions
    loadSkillGraph();
    loadSkillKeywords();

    const sources = [analyzeFingerprints(), analyzeSessionScores(), analyzeDecisionRegistries(), analyzeAudits()];
    const allSuggestions = sources.flatMap(s => s.suggestions);
    const bySkill = aggregateBySkill(allSuggestions);
    const skillEntry = bySkill.find(e => e.skill === opts.skill);

    if (!skillEntry || skillEntry.suggestions.length === 0) {
      console.log(`No suggestions found for skill "${opts.skill}".`);
      process.exit(0);
    }

    console.log(`\n## Suggested additions for: ${opts.skill}\n`);
    console.log(`Layer: ${skillEntry.layer}`);
    console.log(`Sources: ${skillEntry.sources.join(', ')}`);
    console.log(`Total suggestions: ${skillEntry.count}\n`);

    // Group by type
    const byType = {};
    for (const sug of skillEntry.suggestions) {
      if (!byType[sug.type]) byType[sug.type] = [];
      byType[sug.type].push(sug);
    }

    // Output structured content for each type
    if (byType['anti-pattern']) {
      console.log('### Anti-Patterns (from recurring errors)\n');
      for (const sug of byType['anti-pattern']) {
        console.log(sug.content);
      }
    }

    if (byType['quality-signal']) {
      console.log('### Quality Signals (from session scores)\n');
      for (const sug of byType['quality-signal']) {
        console.log(sug.content);
      }
    }

    if (byType['decision-enrichment']) {
      console.log('### Architectural Decisions\n');
      for (const sug of byType['decision-enrichment']) {
        console.log(sug.content);
      }
    }

    if (byType['audit-finding']) {
      console.log('### Audit Findings\n');
      for (const sug of byType['audit-finding']) {
        console.log(sug.content);
      }
    }

    if (byType['stall-signal']) {
      console.log('### Stall Signals (possible guidance gaps)\n');
      for (const sug of byType['stall-signal']) {
        console.log(`- ${sug.stall} (task: ${sug.taskId})`);
      }
    }

    console.log('\n---');
    console.log('Review and selectively add relevant items to the skill\'s SKILL.md.');
    console.log('Add anti-patterns to a "## Known Failure Patterns" section.');
    console.log('Add audit findings to the relevant rule sections.');
  } else {
    console.error(`Unknown command: ${opts.command}`);
    console.error('Usage: node scripts/skill/research-feedback.js <analyze|apply> [options]');
    process.exit(1);
  }
}

// ── Exports (for programmatic use by buildResearchBrief) ───────────

module.exports = {
  analyzeFingerprints,
  analyzeSessionScores,
  analyzeDecisionRegistries,
  analyzeAudits,
  aggregateBySkill,
  matchTextToSkills,
  matchFilePathsToSkills,
};

if (require.main === module) {
  main();
}
