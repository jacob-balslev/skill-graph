'use strict';

const fs = require('fs');
const path = require('path');
const {
  resolveModelDescriptor,
  REGISTRY_VERSION,
  isLatestResolvingModel,
  LATEST_ALIAS_SENTINEL,
} = require('../audit-shared/model-provider');
// Standalone-safe path resolution. log-paths.js resolves WORKSPACE + the log
// ledger via env-var → monorepo → standalone fallback (never assumes the parent
// Development monorepo exists); roots.js resolves the configured skill library
// (nested-aware) from .skill-graph/config.json. Using these instead of a local
// `path.resolve(__dirname, '../..')` is what keeps lib/audit/ package-portable.
const { resolveSkillRoots, walkSkillFiles } = require('./roots');
const { WORKSPACE, HEALTH_LEDGER_PATH } = require('./log-paths');

// ─── Shared Model → CLI Routing ─────────────────────────────────────
const OPENCODE_CLI = 'opencode';

function isClaudeModel(model) {
  // SKI-180: match the bare CLI aliases (opus/sonnet/haiku — `claude --model <alias>`
  // resolves the newest installed model) AND a full Claude model id (the
  // `claude-<family>-<version>` shape Anthropic ships). The prefix branch mirrors
  // model-provider.js inferBackend()'s `^claude-` → 'claude' rule. Without it, a
  // full Claude name fell through resolveModelExecutor to resolveModelDescriptor's
  // gpt-5.4 OpenCode default, so the grader/generator silently ran on GPT-5.4
  // instead of the requested Claude model.
  if (typeof model !== 'string') return false;
  return ['sonnet', 'opus', 'haiku'].includes(model) || /^claude-/.test(model);
}

function resolveModelExecutor(model) {
  // Model aliases (see ../audit-shared/model-provider.js § Model Identity).
  // `opus` (Opus 4.8, Anthropic) resolves through isClaudeModel below to the
  // newest Opus via the bare CLI alias.
  // `gpt-5.5` (GPT-5.5, OpenAI) = newest GPT the Codex/GPT app currently serves. The model
  // flag is omitted so the app picks its own current model (omitModelFlag).
  // The in-repo runner shells claude/opencode/gemini, not `codex exec`; this
  // route is honored when the audit is invoked THROUGH Codex/OpenCode directly.
  // omitModelFlag tells the arg builder to leave out `--model` entirely.
  if (model === 'gpt-5.5') {
    return { cli: 'codex', model: null, omitModelFlag: true };
  }
  if (isClaudeModel(model)) {
    return { cli: 'claude', model };
  }
  // Free OpenCode Zen models (minimax, nemotron, big-pickle, deepseek-flash, mimo)
  // are resolved through the registry by the generic opencode fallback below — the
  // registry (model-provider.js OPENCODE_LATEST) is the single source of the concrete
  // id, so a retired id (e.g. minimax-m2.5-free → minimax-m3-free) can never be
  // hardcoded-stale here. Do NOT re-add explicit per-model id literals.
  if (model === 'gemini' || model === 'gemini-pro') {
    return { cli: 'gemini', model: 'gemini-3.1-pro-preview' };
  }
  if (model === 'gemini-flash') {
    return { cli: 'gemini', model: 'gemini-3-flash-preview' };
  }
  if (model === 'codex') {
    const resolvedDefaultGpt = resolveModelDescriptor('gpt-5.4');
    return { cli: OPENCODE_CLI, model: resolvedDefaultGpt.modelId };
  }
  if (model === 'gpt-5.4' || model === 'copilot-gpt-5.4' || model === 'openai-gpt-5.4') {
    const resolvedGpt = resolveModelDescriptor(model, { defaultToken: 'gpt-5.4' });
    return { cli: OPENCODE_CLI, model: resolvedGpt.modelId };
  }
  if (model.includes('/')) {
    const resolvedDirect = resolveModelDescriptor(model);
    return { cli: OPENCODE_CLI, model: resolvedDirect.modelId };
  }
  const resolved = resolveModelDescriptor(model, { defaultToken: 'gpt-5.4' });
  if (resolved.backend === 'gemini') {
    return { cli: 'gemini', model: resolved.modelId };
  }
  return { cli: OPENCODE_CLI, model: resolved.modelId };
}

/**
 * Resolve a grader/generator alias to the concrete model id to record in an eval
 * receipt — or the honest `latest-alias-unresolved` sentinel when the id only
 * resolves to "newest at run time" (a bare claude alias like `opus`, or codex
 * app-current). (SKI-41.)
 *
 * Recording the bare alias is dishonest: a receipt with grader_model:"opus" is
 * byte-identical across Opus 4.8 and 4.9, and REGISTRY_VERSION only moves on a
 * registry edit, never on CLI resolution — so cross-date score comparability is
 * silently false. The sentinel blocks that comparison honestly. A concrete pinned
 * id (gemini-3.1-pro-preview, gpt-5.4) is recorded as-is; a codex run can supply
 * the model captured from codex's output header via `capturedCodexModel`.
 *
 * @param {string} modelAlias - the grader/generator alias from the receipt layer.
 * @param {object} [opts]
 * @param {string|null} [opts.capturedCodexModel] - concrete id captured from a codex run, if any.
 * @returns {string} concrete model id, or LATEST_ALIAS_SENTINEL.
 */
function resolveReceiptModelId(modelAlias, { capturedCodexModel = null } = {}) {
  let cli = null;
  let model = modelAlias;
  try {
    ({ cli, model } = resolveModelExecutor(modelAlias));
  } catch {
    model = modelAlias; // unknown alias — treat the input string as the id
  }
  if (model && !isLatestResolvingModel(model)) return model; // concrete pinned id
  if (cli === 'codex' && capturedCodexModel) return capturedCodexModel; // captured from output
  return LATEST_ALIAS_SENTINEL;
}

// ─── Shared JSON Extraction (handles ANSI + markdown fences) ────────
function extractJsonObject(text) {
  let input = String(text || '');
  input = input.replace(/\x1b\[[0-9;]*m/g, '');
  input = input.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
  const start = input.indexOf('{');
  if (start === -1) {
    throw new Error('No JSON object found in grader output');
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < input.length; i += 1) {
    const char = input[i];
    if (inString) {
      if (escaped) { escaped = false; }
      else if (char === '\\') { escaped = true; }
      else if (char === '"') { inString = false; }
      continue;
    }
    if (char === '"') { inString = true; continue; }
    if (char === '{') { depth += 1; }
    else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return JSON.parse(input.slice(start, i + 1));
      }
    }
  }
  throw new Error('Unterminated JSON object in grader output');
}

// ─── Status Taxonomy ────────────────────────────────────────────────
const STATUS = Object.freeze({
  KEPT: 'kept',
  DISCARDED_BY_GATE: 'discarded',
  BLOCKED_INFRA: 'blocked_infra',
  SKIPPED_NO_EVALS: 'skipped',
});

const PRE_GEMINI_SKILL_SEEDS = Object.freeze({
  'skills/sales-hub/financial-engine': {
    commit: '91b4bad4',
    replacedBy: '85439e15',
  },
  'skills/sales-hub/order-data-rules': {
    commit: '91b4bad4',
    replacedBy: '764c3ae4',
  },
  'skills/sales-hub/reconciliation-and-provenance': {
    commit: '91b4bad4',
    replacedBy: '19601932',
  },
  'skills/sales-hub/dashboard': {
    commit: '91b4bad4',
    replacedBy: '64bc40ca',
  },
});

function normalizeSkillDir(skillDir) {
  const normalized = String(skillDir || '').replace(/\\/g, '/').replace(/\/+$/, '');

  // Legacy path: sales-hub/.claude/skills/X → skills/sales-hub/X
  const legacyMarker = '/sales-hub/.claude/skills/';
  const legacyIndex = normalized.indexOf(legacyMarker);
  if (legacyIndex >= 0) {
    return `skills/sales-hub/${normalized.slice(legacyIndex + legacyMarker.length)}`;
  }
  if (normalized.startsWith('sales-hub/.claude/skills/')) {
    return `skills/sales-hub/${normalized.slice('sales-hub/.claude/skills/'.length)}`;
  }

  // Current path: skills/sales-hub/X or skills/X
  if (normalized.startsWith('skills/')) {
    return normalized;
  }

  return normalized;
}

function getPreGeminiSeed(skillDir) {
  const normalized = normalizeSkillDir(skillDir);
  return PRE_GEMINI_SKILL_SEEDS[normalized] || null;
}

function buildSkillInvocationPrompt(skillName, taskPrompt, options = {}) {
  // SH-6628 / SKI-5: the grounding instruction must match the run's tool access.
  // Comprehension (single-direction default) and the tools-OFF Application
  // run disable Read/Glob/Grep/Bash, so telling the model to "inspect repository
  // files" is incoherent — it cannot. Only the tools-ON profile (e.g. the
  // bidirectional enrich generator, which runs with full tools) can actually inspect
  // files. Pass `toolsAvailable` from the caller's resolved allowTools value.
  const { toolsAvailable = false } = options;
  const groundingLine = toolsAvailable
    ? 'Ground every claim in repository files you actually inspect.'
    : 'Ground every claim in the skill content and task details provided here — no file-access tools are available in this run, so do not claim to have inspected repository files you cannot see.';
  return [
    `Use the \`${skillName}\` skill for this task if it is relevant.`,
    groundingLine,
    'If the skill conflicts with the codebase, say so explicitly instead of repeating the skill blindly.',
    '',
    'Task:',
    String(taskPrompt || '').trim(),
  ].join('\n');
}

function countLines(text) {
  if (!text) return 0;
  return String(text).split(/\r?\n/).length;
}

function checkReferencesIntegrity(backupDir, currentDir) {
  const backupRefsDir = path.join(backupDir, 'references');
  const currentRefsDir = path.join(currentDir, 'references');

  const result = { modified: false, deleted: [], changed: [], added: [] };

  function collectFiles(dir) {
    const files = new Map();
    if (!fs.existsSync(dir)) return files;
    const stack = [dir];
    while (stack.length > 0) {
      const current = stack.pop();
      for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
        const fullPath = path.join(current, entry.name);
        if (entry.isDirectory()) {
          stack.push(fullPath);
        } else {
          const relative = path.relative(dir, fullPath);
          files.set(relative, fs.readFileSync(fullPath, 'utf8'));
        }
      }
    }
    return files;
  }

  const backupFiles = collectFiles(backupRefsDir);
  const currentFiles = collectFiles(currentRefsDir);

  for (const [relativePath, backupContent] of backupFiles) {
    if (!currentFiles.has(relativePath)) {
      result.deleted.push(relativePath);
      result.modified = true;
    } else if (currentFiles.get(relativePath) !== backupContent) {
      result.changed.push(relativePath);
      result.modified = true;
    }
  }

  for (const relativePath of currentFiles.keys()) {
    if (!backupFiles.has(relativePath)) {
      result.added.push(relativePath);
      result.modified = true;
    }
  }

  return result;
}

// ─── Domain Anchor Extraction ────────────────────────────────────
// Extracts specific, non-generic terms from skill content that represent
// domain knowledge: file paths, function names, SQL tables, CSS tokens,
// config keys, API routes, etc. If these disappear after "improvement",
// the model deleted knowledge instead of enriching it.
function extractDomainAnchors(content) {
  if (!content) return new Set();
  const anchors = new Set();

  // File paths (src/lib/foo.ts, apps/web/src/..., etc.)
  for (const m of content.matchAll(/(?:^|\s|`)((?:src|apps|lib|scripts|sales-hub|skills)\/[\w/.@-]+)/gm)) {
    anchors.add(m[1]);
  }
  // Function/method names (camelCase with parens: getOrgCurrency(), requireAuth())
  for (const m of content.matchAll(/\b([a-z][a-zA-Z0-9]{3,})\(\)/g)) {
    anchors.add(m[1] + '()');
  }
  // SQL table/view names (mat_*, v_*, public.*, org_*)
  for (const m of content.matchAll(/\b((?:mat|v|public|org)_[a-z_]{3,})\b/g)) {
    anchors.add(m[1]);
  }
  // CSS custom properties (--shadow-*, --heading-*, --text-*)
  for (const m of content.matchAll(/(--[a-z][\w-]{3,})/g)) {
    anchors.add(m[1]);
  }
  // API routes (/api/foo/bar)
  for (const m of content.matchAll(/(?:^|\s|`)(\/api\/[\w/[\]-]+)/gm)) {
    anchors.add(m[1]);
  }
  // Environment variables (NEXT_PUBLIC_*, LINEAR_API_*, etc.)
  for (const m of content.matchAll(/\b([A-Z][A-Z0-9_]{4,})\b/g)) {
    // Skip generic words (TODO, NOTE, NEVER, etc.)
    if (!/^(TODO|NOTE|NEVER|ALWAYS|MUST|SHALL|SKILL|IMPORTANT|WARNING|ERROR|DEBUG|INFO)$/.test(m[1])) {
      anchors.add(m[1]);
    }
  }
  // Backtick-quoted code identifiers (at least 4 chars to skip noise)
  for (const m of content.matchAll(/`([a-zA-Z][\w./:@-]{3,})`/g)) {
    anchors.add(m[1]);
  }

  return anchors;
}

function collectMissingDocumentationSections(content, { ownershipMode = 'authored' } = {}) {
  const requiredHeadings = [
    '## Coverage',
    '## Philosophy',
    '## Verification',
    '## Do NOT Use When',
  ];

  if (ownershipMode === 'template') {
    requiredHeadings.push('## Generated Metadata', '## Key Files');
  }

  return requiredHeadings.filter((heading) => !String(content || '').includes(heading));
}

function evaluateCandidateGate({
  baselinePassed,
  candidatePassed,
  total,
  baselineMetrics = null,
  candidateMetrics = null,
  skillName = '',
  tier = 2,
  beforeLines,
  afterLines,
  beforeContent = '',
  afterContent = '',
  referencesModified = false,
  ownershipMode = 'authored',
}) {
  const reasons = [];
  const safeBaselinePassed = Number.isFinite(baselinePassed) ? baselinePassed : 0;
  const safeCandidatePassed = Number.isFinite(candidatePassed) ? candidatePassed : 0;
  const safeTotal = Number.isFinite(total) ? total : 0;
  const safeBeforeLines = Number.isFinite(beforeLines) ? beforeLines : 0;
  const safeAfterLines = Number.isFinite(afterLines) ? afterLines : 0;
  const safeBaselineMetrics = baselineMetrics || {
    completed_evals: safeTotal,
    error_count: 0,
    passed_evals: safeBaselinePassed,
    pass_rate: safeTotal > 0 ? safeBaselinePassed / safeTotal : 0,
    weighted_quality_score: safeTotal > 0 ? safeBaselinePassed / safeTotal : 0,
    wilson_lower_bound: safeTotal > 0 ? safeBaselinePassed / safeTotal : 0,
    critical_total: 0,
    critical_passed: 0,
    failure_categories: {},
    median_score_delta: 0,
    p10_score_delta: 0,
  };
  const safeCandidateMetrics = candidateMetrics || {
    completed_evals: safeTotal,
    error_count: 0,
    passed_evals: safeCandidatePassed,
    pass_rate: safeTotal > 0 ? safeCandidatePassed / safeTotal : 0,
    weighted_quality_score: safeTotal > 0 ? safeCandidatePassed / safeTotal : 0,
    wilson_lower_bound: safeTotal > 0 ? safeCandidatePassed / safeTotal : 0,
    critical_total: 0,
    critical_passed: 0,
    failure_categories: {},
    median_score_delta: 0,
    p10_score_delta: 0,
  };
  const loweredSkillName = String(skillName || '').toLowerCase();
  const isHighRiskSkill = /(auth|security|payment|billing|credential|encryption|api-key|nextauth|gdpr|webhook|rls|tenant|financial-engine|data-integrity)/.test(loweredSkillName);
  const qualitySlack = tier === 1 ? 0 : 0.01;

  // Gate 1: Eval regression — candidate must not score worse
  if (safeCandidatePassed < safeBaselinePassed) {
    reasons.push(
      `candidate regressed evals (${safeCandidatePassed}/${safeTotal} < ${safeBaselinePassed}/${safeTotal})`,
    );
  }

  // Gate 1b: Incomplete or unstable candidate runs do not count as acceptable
  // improvements. If the candidate finished fewer evals than the baseline or
  // introduced more command errors/timeouts, the loop must fail closed instead
  // of treating partial evidence as a valid win.
  if (safeCandidateMetrics.completed_evals < safeBaselineMetrics.completed_evals) {
    reasons.push(
      `candidate completed fewer evals (${safeCandidateMetrics.completed_evals} < ${safeBaselineMetrics.completed_evals})`,
    );
  }
  if (safeCandidateMetrics.error_count > safeBaselineMetrics.error_count) {
    reasons.push(
      `candidate introduced more eval execution errors (${safeCandidateMetrics.error_count} > ${safeBaselineMetrics.error_count})`,
    );
  }

  // Gate 1c: Critical evals and high-risk skills get stricter failure-category
  // guards than ordinary skills. A candidate that starts hallucinating paths or
  // producing wrong answers in auth/security/payments/data-integrity domains is
  // worse even if the aggregate pass count looks similar.
  if (safeCandidateMetrics.critical_total > 0 && safeCandidateMetrics.critical_passed < safeBaselineMetrics.critical_passed) {
    reasons.push(
      `candidate regressed critical evals (${safeCandidateMetrics.critical_passed}/${safeCandidateMetrics.critical_total} < ${safeBaselineMetrics.critical_passed}/${safeBaselineMetrics.critical_total})`,
    );
  }
  const baselineHallucinatedPathCount = Number(safeBaselineMetrics.failure_categories?.hallucinated_path || 0);
  const hallucinatedPathCount = Number(safeCandidateMetrics.failure_categories?.hallucinated_path || 0);
  if (tier === 1 && hallucinatedPathCount > baselineHallucinatedPathCount) {
    reasons.push(`candidate introduced hallucinated_path failures on tier-1 skill (${hallucinatedPathCount})`);
  }
  const baselineWrongAnswerCount = Number(safeBaselineMetrics.failure_categories?.wrong_answer || 0);
  const wrongAnswerCount = Number(safeCandidateMetrics.failure_categories?.wrong_answer || 0);
  if (isHighRiskSkill && wrongAnswerCount > baselineWrongAnswerCount) {
    reasons.push(`candidate produced wrong_answer failures on high-risk skill (${wrongAnswerCount})`);
  }

  // Gate 1d: Weighted quality and confidence checks. Pass count remains a coarse
  // veto, but the real acceptance contract also requires non-regression on the
  // graded quality score, the Wilson lower bound for small-N suites, and the
  // score distribution tails so one collapsed eval cluster cannot hide inside an
  // acceptable average.
  const baselineQuality = Number(safeBaselineMetrics.weighted_quality_score || 0);
  const candidateQuality = Number(safeCandidateMetrics.weighted_quality_score || 0);
  if (candidateQuality + qualitySlack < baselineQuality) {
    reasons.push(
      `candidate regressed weighted quality (${candidateQuality.toFixed(4)} < ${(baselineQuality - qualitySlack).toFixed(4)} threshold)`,
    );
  }

  const baselineWilson = Number(safeBaselineMetrics.wilson_lower_bound || 0);
  const candidateWilson = Number(safeCandidateMetrics.wilson_lower_bound || 0);
  if (safeCandidateMetrics.completed_evals > 0 && safeCandidateMetrics.completed_evals < 30 && candidateWilson + qualitySlack < baselineWilson) {
    reasons.push(
      `candidate regressed Wilson lower bound (${candidateWilson.toFixed(4)} < ${(baselineWilson - qualitySlack).toFixed(4)} threshold)`,
    );
  }

  if (Number(safeCandidateMetrics.median_score_delta || 0) < -0.02) {
    reasons.push(
      `candidate regressed median score delta (${Number(safeCandidateMetrics.median_score_delta).toFixed(4)} < -0.0200)`,
    );
  }
  if (Number(safeCandidateMetrics.p10_score_delta || 0) < -0.15) {
    reasons.push(
      `candidate regressed p10 score delta (${Number(safeCandidateMetrics.p10_score_delta).toFixed(4)} < -0.1500)`,
    );
  }

  // Gate 2: Line count — "improve" means enrich, never shrink. The pilot and the
  // current guarded improvement lane both treat references/ as read-only, so there
  // is no longer a valid autonomous exception for shrinking because "content moved".
  if (safeBeforeLines > 0 && safeAfterLines > 0) {
    if (safeAfterLines < safeBeforeLines) {
      reasons.push(
        `candidate shrunk the skill (${safeAfterLines} lines < ${safeBeforeLines} lines) — "improve" must enrich, not trim`,
      );
    }
  }

  // Gate 3: Domain anchor preservation — specific knowledge must survive
  // [Opus 2026-03-27] New gate. Catches the case where a model rewrites domain-specific
  // rules (file paths, function names, SQL tables, CSS tokens) into generic filler of
  // equal line count. The line gate wouldn't catch this, but anchor tracking does.
  if (beforeContent && afterContent) {
    const beforeAnchors = extractDomainAnchors(beforeContent);
    const afterAnchors = extractDomainAnchors(afterContent);

    if (beforeAnchors.size >= 3) {
      const lost = [];
      for (const anchor of beforeAnchors) {
        if (!afterAnchors.has(anchor) && !afterContent.includes(anchor)) {
          lost.push(anchor);
        }
      }

      const lostRatio = lost.length / beforeAnchors.size;
      // Reject if more than 20% of domain anchors disappeared
      if (lostRatio > 0.2) {
        const examples = lost.slice(0, 5).map((a) => `\`${a}\``).join(', ');
        reasons.push(
          `candidate removed ${lost.length}/${beforeAnchors.size} domain anchors (${(lostRatio * 100).toFixed(0)}% knowledge loss) — examples: ${examples}`,
        );
      }
    }
  }

  // Gate 5: Documentation-first structure. The pilot template-owned lane exists to
  // make skills richer, easier to audit, and easier to route. If core narrative
  // sections disappear, the candidate may still pass evals while becoming harder
  // for humans and agents to understand.
  // Only enforce documentation structure on files that look like skill documents
  const isSkillDocument = afterContent && afterContent.startsWith('---');
  const missingDocumentationSections = isSkillDocument
    ? collectMissingDocumentationSections(afterContent, { ownershipMode })
    : [];
  if (missingDocumentationSections.length > 0) {
    reasons.push(
      `candidate is missing required documentation sections: ${missingDocumentationSections.join(', ')}`,
    );
  }

  // Gate 6: references/ files must not be modified by the autonomous loop
  if (referencesModified) {
    reasons.push(
      'candidate modified references/ files (human-curated knowledge — autonomous loop must not touch these)',
    );
  }

  return {
    accepted: reasons.length === 0,
    reasons,
    metrics: {
      baseline: safeBaselineMetrics,
      candidate: safeCandidateMetrics,
    },
  };
}

function collectMissingExpectations(runSummary) {
  const counts = new Map();
  if (!runSummary || !Array.isArray(runSummary.results)) {
    return [];
  }

  for (const result of runSummary.results) {
    const missing = result?.candidate?.missing_expectations || [];
    for (const expectation of missing) {
      counts.set(expectation, (counts.get(expectation) || 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([expectation]) => expectation);
}

function generateSkillGapSuggestions(skillSummary) {
  const suggestions = [];
  const baselineRun = skillSummary.candidate || skillSummary.baseline || null;
  const evalTotal = baselineRun?.total || skillSummary.declaredEvalCount || 0;
  const missingExpectations = collectMissingExpectations(baselineRun);
  const beforeLines = Number.isFinite(skillSummary.beforeLines) ? skillSummary.beforeLines : 0;
  const afterLines = Number.isFinite(skillSummary.afterLines) ? skillSummary.afterLines : beforeLines;
  const referenceFileCount = Number.isFinite(skillSummary.referenceFileCount)
    ? skillSummary.referenceFileCount
    : 0;

  if (skillSummary.error) {
    suggestions.push(`Fix the blocked cycle issue first: ${skillSummary.error}`);
    return suggestions;
  }

  if (!baselineRun) {
    suggestions.push(
      'No empirical eval data was captured in this cycle. Run the evaluator to surface concrete output-quality gaps before the next apply run.',
    );
  }

  if (evalTotal > 0 && evalTotal < 6) {
    suggestions.push(
      `Add more eval coverage (currently ${evalTotal} evals). Target anti-patterns and edge cases beyond the current suite.`,
    );
  }

  if (missingExpectations.length > 0) {
    suggestions.push(
      `Add or strengthen skill knowledge for: ${missingExpectations.slice(0, 3).join('; ')}.`,
    );
  }

  if (skillSummary.baseline && skillSummary.candidate) {
    const lift = skillSummary.candidate.candidatePassed - skillSummary.baseline.candidatePassed;
    if (lift <= 0) {
      suggestions.push(
        'The cycle did not produce a measurable output-quality gain. Add more repository-specific knowledge, stronger examples, or sharper trigger/bounds language before another apply run.',
      );
    }
  }

  if (beforeLines >= 250 && referenceFileCount === 0) {
    suggestions.push(
      'Improve structure by moving stable deep detail into `references/` files while preserving the skill\'s domain knowledge.',
    );
  }

  if (beforeLines > 0 && afterLines > 0 && afterLines < beforeLines * 0.9) {
    suggestions.push(
      'Avoid further trimming. Focus the next cycle on stronger structure, richer examples, and additional evals instead of reducing size.',
    );
  }

  if (suggestions.length === 0) {
    suggestions.push(
      'No major gaps surfaced in this cycle. Add at least one new eval covering a fresh real-world failure mode before the next run.',
    );
  }

  return suggestions;
}

function renderCycleReport(summary) {
  const lines = [
    '# Skill Improvement Cycle Report',
    '',
    `- Workspace: \`${summary.workspace}\``,
    `- Active workspace: \`${summary.activeWorkspace || summary.workspace}\``,
    `- Mode: \`${summary.apply ? 'apply' : 'dry-run'}\``,
  ];

  if (summary.branchName) {
    lines.push(`- Branch: \`${summary.branchName}\``);
  }

  lines.push('', '## Skill Results', '');

  for (const skill of summary.skills || []) {
    const status = skill.error ? 'failed' : skill.kept ? 'kept' : summary.apply ? 'reverted' : 'analyzed';
    lines.push(`### ${skill.skillName}`);
    lines.push('');
    lines.push(`- Status: \`${status}\``);

    if (Number.isFinite(skill.declaredEvalCount) && skill.declaredEvalCount > 0) {
      lines.push(`- Declared eval count: ${skill.declaredEvalCount}`);
    }

    if (skill.baseline) {
      lines.push(
        `- Current skill score before cycle: ${skill.baseline.candidatePassed}/${skill.baseline.total} (no-skill control: ${skill.baseline.baselinePassed}/${skill.baseline.total})`,
      );
    }

    if (skill.candidate) {
      lines.push(
        `- Current skill score after cycle: ${skill.candidate.candidatePassed}/${skill.candidate.total} (no-skill control: ${skill.candidate.baselinePassed}/${skill.candidate.total})`,
      );
    }

    if (skill.updatedEvalRun) {
      lines.push(
        `- Updated eval bundle score: ${skill.updatedEvalRun.candidatePassed}/${skill.updatedEvalRun.total} (no-skill control: ${skill.updatedEvalRun.baselinePassed}/${skill.updatedEvalRun.total})`,
      );
    }

    if (skill.seed?.commit) {
      lines.push(`- Seed baseline: pre-Gemini commit \`${skill.seed.commit}\``);
    }

    if (skill.error) {
      lines.push(`- Error: ${skill.error}`);
    }

    if (skill.gate?.reasons?.length) {
      lines.push(`- Gate findings: ${skill.gate.reasons.join('; ')}`);
    }

    lines.push('', '#### Gaps To Address Next', '');
    for (const gap of skill.gapSuggestions || []) {
      lines.push(`- ${gap}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

function skillNameFromDir(skillDir) {
  return path.basename(String(skillDir || '').replace(/\/+$/, ''));
}

function skillHistoryKeyFromDir(skillDir) {
  const normalized = normalizeSkillDir(skillDir).replace(/^skills\//, '');
  return normalized || skillNameFromDir(skillDir);
}

// ─── Priority 1: Skill Health Ledger ────────────────────────────────
// Persistent per-skill tracking: upgrade count, score trends, kept/discarded rate.
// HEALTH_LEDGER_PATH is imported from ./log-paths (standalone-safe resolution).

/**
 * Read the entire health ledger and return per-skill aggregates.
 * Returns Map<skillName, { upgrade_count, kept_count, discarded_count, last_score, score_trend, last_improved }>
 */
function readHealthLedger() {
  const ledger = new Map();
  if (!fs.existsSync(HEALTH_LEDGER_PATH)) return ledger;

  const content = fs.readFileSync(HEALTH_LEDGER_PATH, 'utf8').trim();
  if (!content) return ledger;

  for (const line of content.split('\n')) {
    if (!line.trim()) continue;
    try {
      const entry = JSON.parse(line);
      const skill = entry.skill;
      if (!skill) continue;

      if (!ledger.has(skill)) {
        ledger.set(skill, {
          upgrade_count: 0,
          kept_count: 0,
          discarded_count: 0,
          scores: [],
          last_score: null,
          score_trend: 'unknown',
          last_improved: null,
        });
      }

      const record = ledger.get(skill);
      record.upgrade_count += 1;
      if (entry.kept) {
        record.kept_count += 1;
        record.last_improved = entry.timestamp || null;
      } else {
        record.discarded_count += 1;
      }
      if (typeof entry.score === 'number') {
        record.scores.push(entry.score);
        record.last_score = entry.score;
      }
    } catch {
      // Skip malformed lines
    }
  }

  // Compute score trends
  for (const [, record] of ledger) {
    if (record.scores.length >= 3) {
      const recent = record.scores.slice(-3);
      const older = record.scores.slice(-6, -3);
      if (older.length > 0) {
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
        if (recentAvg > olderAvg + 0.05) record.score_trend = 'improving';
        else if (recentAvg < olderAvg - 0.05) record.score_trend = 'declining';
        else record.score_trend = 'flat';
      }
    }
  }

  return ledger;
}

/**
 * Append a single entry to the health ledger.
 * Called after each improvement attempt (kept or discarded).
 */
function writeHealthLedgerEntry({
  skill,
  action,
  kept,
  score = null,
  baselineScore = null,
  details = '',
}) {
  const entry = {
    timestamp: new Date().toISOString(),
    skill,
    action,
    kept,
    score,
    baseline_score: baselineScore,
    details: String(details || '').slice(0, 300),
  };

  const dir = path.dirname(HEALTH_LEDGER_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.appendFileSync(HEALTH_LEDGER_PATH, JSON.stringify(entry) + '\n');
}

/**
 * Compute upgrade effectiveness for a skill from ledger data.
 * Returns a number 0-1 representing the ratio of kept improvements.
 */
function computeUpgradeEffectiveness(ledgerRecord) {
  if (!ledgerRecord || ledgerRecord.upgrade_count === 0) return null;
  return ledgerRecord.kept_count / ledgerRecord.upgrade_count;
}

// ─── Priority 2: Research Brief Builder ─────────────────────────────
// Builds a structured research brief for a skill by reading related skills,
// app source files, ARCHITECTURE_MAP, DATAFLOW, and page contracts.

// Sales-Hub research-brief sources. These are workspace-coupled (the Sales Hub
// docs only exist in the monorepo); in a standalone install WORKSPACE/sales-hub
// does not exist, so the `fs.existsSync` guards at every use site below skip
// these sections gracefully.
const ARCHITECTURE_MAP_PATH = path.join(WORKSPACE, 'sales-hub', 'ARCHITECTURE_MAP.md');
const DATAFLOW_PATH = path.join(WORKSPACE, 'sales-hub', 'DATAFLOW.md');
const PAGE_CONTRACTS_DIR = path.join(WORKSPACE, 'sales-hub', 'docs', 'design', 'page-contracts');

// Lazily-built, nested-aware index of skill-name → directory across every
// configured skill root. Built once per process (the corpus does not change
// mid-run) so the per-relation loop callers below stay O(1) per lookup.
let _skillDirIndex = null;
function buildSkillDirIndex() {
  const index = new Map();
  for (const { absPath } of resolveSkillRoots(WORKSPACE)) {
    for (const skillFile of walkSkillFiles(absPath)) {
      const dir = path.dirname(skillFile);
      const name = path.basename(dir);
      if (!index.has(name)) index.set(name, dir); // first match wins
    }
  }
  return index;
}

/**
 * Find a skill directory by name across the configured skill library.
 *
 * Resolves via the configured skill roots (.skill-graph/config.json) and is
 * nested-aware (the canonical library is `skills/<subject>/<name>/`), so it
 * finds skills the previous flat `skills/<name>` lookup silently missed. Falls
 * back to the legacy flat monorepo layout (shared + sales-hub) for back-compat.
 */
function findSkillDirByName(skillName) {
  if (!_skillDirIndex) _skillDirIndex = buildSkillDirIndex();
  const hit = _skillDirIndex.get(skillName);
  if (hit) return hit;
  for (const dir of [
    path.join(WORKSPACE, 'skills', skillName),
    path.join(WORKSPACE, 'skills', 'sales-hub', skillName),
  ]) {
    if (fs.existsSync(path.join(dir, 'SKILL.md'))) return dir;
  }
  return null;
}

/**
 * Extract a brief summary (first 80 lines) from a skill's SKILL.md.
 * Used for injecting related skill context without blowing up the prompt.
 */
function extractSkillSummary(skillDir, maxLines = 80) {
  const skillFile = path.join(skillDir, 'SKILL.md');
  if (!fs.existsSync(skillFile)) return null;
  const content = fs.readFileSync(skillFile, 'utf8');
  const lines = content.split('\n');
  return lines.slice(0, maxLines).join('\n');
}

/**
 * Build a research brief for a skill by gathering context from the app and related skills.
 * Returns a structured string that gets injected into the improvement prompt.
 */
function buildResearchBrief(skillDir, skillName) {
  const sections = [];
  const skillFile = path.join(skillDir, 'SKILL.md');
  if (!fs.existsSync(skillFile)) return '';

  const content = fs.readFileSync(skillFile, 'utf8');
  const { parseFrontmatter } = require('../audit-shared/skill-frontmatter');
  const frontmatter = parseFrontmatter(content);
  const relations = frontmatter.relations || {};
  const isSalesHubSkill = skillDir.includes('sales-hub');

  // 1. Load related skills (adjacent + boundary + verify_with)
  const relatedNames = new Set();
  for (const relType of ['adjacent', 'boundary', 'verify_with']) {
    const list = relations[relType];
    if (Array.isArray(list)) {
      list.forEach((name) => relatedNames.add(name));
    }
  }

  if (relatedNames.size > 0) {
    const relatedSummaries = [];
    for (const relName of relatedNames) {
      const relDir = findSkillDirByName(relName);
      if (!relDir) continue;
      const summary = extractSkillSummary(relDir, 60);
      if (summary) {
        relatedSummaries.push(`### ${relName}\n${summary}`);
      }
    }
    if (relatedSummaries.length > 0) {
      sections.push('## Related Skills Context\n\n' + relatedSummaries.join('\n\n---\n\n'));
    }
  }

  // 2. For SH skills: inject relevant sections of ARCHITECTURE_MAP.md
  if (isSalesHubSkill && fs.existsSync(ARCHITECTURE_MAP_PATH)) {
    const archContent = fs.readFileSync(ARCHITECTURE_MAP_PATH, 'utf8');
    // Find sections mentioning the skill name or its likely domain
    const skillDomain = skillName.replace(/^sales-hub[/\\]?/, '').replace(/-/g, '[ -]');
    const domainRegex = new RegExp(`## [^\\n]*${skillDomain}[^\\n]*\\n[\\s\\S]*?(?=\\n## |$)`, 'i');
    const archMatch = archContent.match(domainRegex);
    if (archMatch) {
      sections.push('## ARCHITECTURE_MAP.md (relevant section)\n\n' + archMatch[0].slice(0, 3000));
    }
  }

  // 3. For SH skills: inject relevant sections of DATAFLOW.md
  if (isSalesHubSkill && fs.existsSync(DATAFLOW_PATH)) {
    const dataflowContent = fs.readFileSync(DATAFLOW_PATH, 'utf8');
    const skillDomain = skillName.replace(/^sales-hub[/\\]?/, '').replace(/-/g, '[ -]');
    const dfRegex = new RegExp(`## [^\\n]*${skillDomain}[^\\n]*\\n[\\s\\S]*?(?=\\n## |$)`, 'i');
    const dfMatch = dataflowContent.match(dfRegex);
    if (dfMatch) {
      sections.push('## DATAFLOW.md (relevant section)\n\n' + dfMatch[0].slice(0, 3000));
    }
  }

  // 4. For SH skills: inject matching page contract
  if (isSalesHubSkill && fs.existsSync(PAGE_CONTRACTS_DIR)) {
    const contractName = skillName.replace(/^sales-hub[/\\]?/, '');
    const contractCandidates = [
      path.join(PAGE_CONTRACTS_DIR, `${contractName}.md`),
      path.join(PAGE_CONTRACTS_DIR, `${contractName}-page.md`),
    ];
    for (const contractPath of contractCandidates) {
      if (fs.existsSync(contractPath)) {
        const contractContent = fs.readFileSync(contractPath, 'utf8');
        sections.push('## Page Contract\n\n' + contractContent.slice(0, 4000));
        break;
      }
    }
  }

  // 5. Extract reference URLs from frontmatter for the agent to verify
  const refs = frontmatter.references || {};
  const urls = Array.isArray(refs.urls) ? refs.urls : [];
  const files = Array.isArray(refs.files) ? refs.files : [];
  if (urls.length > 0 || files.length > 0) {
    const refLines = ['## Skill References (from frontmatter)'];
    if (files.length > 0) refLines.push('\nReference files: ' + files.join(', '));
    if (urls.length > 0) refLines.push('\nReference URLs (WebFetch these for current truth): ' + urls.join(', '));
    sections.push(refLines.join('\n'));
  }

  // 6. Research artifact feedback — inject findings from .research/ that map to this skill
  try {
    const { analyzeFingerprints, analyzeAudits, aggregateBySkill } = require('./research-feedback');
    const sources = [analyzeFingerprints(), analyzeAudits()];
    const allSuggestions = sources.flatMap(s => s.suggestions);
    const bySkill = aggregateBySkill(allSuggestions);
    const skillEntry = bySkill.find(e => e.skill === skillName);
    if (skillEntry && skillEntry.suggestions.length > 0) {
      const feedbackLines = ['## Research Artifact Findings\n'];
      feedbackLines.push(`${skillEntry.suggestions.length} findings from .research/ artifacts reference this skill domain:\n`);
      for (const sug of skillEntry.suggestions.slice(0, 8)) {
        feedbackLines.push(`- **[${sug.type}]** ${sug.suggestion.slice(0, 150)}`);
      }
      if (skillEntry.suggestions.length > 8) {
        feedbackLines.push(`\n... and ${skillEntry.suggestions.length - 8} more. Run: node scripts/skill/research-feedback.js apply --skill ${skillName}`);
      }
      sections.push(feedbackLines.join('\n'));
    }
  } catch { /* research-feedback.js not available or failed — skip gracefully */ }

  // 7. Inject methodology skills — these teach the agent HOW to improve skills
  // Loaded once per improvement cycle, providing the quality backbone
  const methodologySkills = buildMethodologySkillsContext(skillDir);
  if (methodologySkills) {
    sections.push(methodologySkills);
  }

  if (sections.length === 0) return '';
  return '\n\n# Research Brief (auto-generated context)\n\n' + sections.join('\n\n---\n\n') + '\n';
}

// ─── Methodology Skills Loader ──────────────────────────────────────
// These skills teach the improver agent HOW to do skill improvement well.
// Loaded into every improvement prompt so the agent has the quality backbone.

const IMPROVER_METHODOLOGY_SKILLS = [
  'skill-scaffold',      // Template v3.0 mastery — structure, sizing, required sections
  'quality-doctrine',    // "Improve = enrich never trim", artifact quality standards
  'prompt-craft',        // How to write effective prompt/skill content
  'evaluation',          // Eval design: Bloom's taxonomy, failure categories, expectations
  'semantics',           // Naming precision, description quality, trigger accuracy
  'best-practice',       // Cross-cutting quality enforcement
  'taxonomy',            // Skill family classification, MECE design
  'self-evaluation',     // Generate-critique-revise, convergence detection
];

// Skills that provide deeper knowledge modeling context when available
const IMPROVER_EXTENDED_SKILLS = [
  'ontology',            // Formal ontology patterns, class hierarchies
  'semantic-relations',  // Adjacent/verify_with/boundary edge typing
  'knowledge-modeling',  // Knowledge patterns, acquisition, lifecycle
  'context-engineering', // Context efficiency, failure modes, dense writing
];

function buildMethodologySkillsContext(skillDir) {
  const summaries = [];
  const allSkills = [...IMPROVER_METHODOLOGY_SKILLS, ...IMPROVER_EXTENDED_SKILLS];
  let loadedCount = 0;
  const maxTokenBudget = 12000; // ~48KB — keep methodology context bounded
  let estimatedTokens = 0;

  for (const name of allSkills) {
    const dir = findSkillDirByName(name);
    if (!dir) continue;

    // Don't inject a skill that IS the target being improved
    if (path.resolve(dir) === path.resolve(skillDir)) continue;

    const skillFile = path.join(dir, 'SKILL.md');
    if (!fs.existsSync(skillFile)) continue;

    const content = fs.readFileSync(skillFile, 'utf8');

    // Extract the most relevant sections: Philosophy, Coverage, Anti-Patterns
    // Skip frontmatter and boilerplate; extract the judgment-dense parts
    const extracted = extractMethodologySections(content, name);
    if (!extracted) continue;

    const tokenEstimate = Math.ceil(extracted.length / 4);
    if (estimatedTokens + tokenEstimate > maxTokenBudget) break;

    summaries.push(extracted);
    estimatedTokens += tokenEstimate;
    loadedCount++;
  }

  if (summaries.length === 0) return null;

  return [
    '## Methodology Skills (auto-loaded quality backbone)',
    '',
    `${loadedCount} skills loaded (~${estimatedTokens} tokens) to guide improvement quality.`,
    'Apply these principles when editing the target skill.',
    '',
    ...summaries,
  ].join('\n');
}

function extractMethodologySections(skillContent, skillName) {
  // Strip frontmatter
  const fmEnd = skillContent.indexOf('---', skillContent.indexOf('---') + 3);
  const body = fmEnd > 0 ? skillContent.slice(fmEnd + 3).trim() : skillContent;

  // Extract key sections by heading
  const sections = [];
  const headingPattern = /^##\s+(.+)$/gm;
  const matches = [...body.matchAll(headingPattern)];

  // Target the most judgment-dense sections
  const targetHeadings = ['philosophy', 'coverage', 'anti-patterns', 'rules', 'principles', 'core', 'when to use', 'do not use when', 'verification'];

  for (let i = 0; i < matches.length; i++) {
    const heading = matches[i][1].toLowerCase().trim();
    if (!targetHeadings.some(t => heading.includes(t))) continue;

    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i + 1].index : body.length;
    const sectionContent = body.slice(start, end).trim();

    // Cap individual section at 600 chars to stay bounded
    if (sectionContent.length > 600) {
      sections.push(sectionContent.slice(0, 597) + '...');
    } else {
      sections.push(sectionContent);
    }
  }

  if (sections.length === 0) {
    // Fallback: take first 400 chars of body for skills without standard headings
    if (body.length > 50) {
      sections.push(body.slice(0, 400) + (body.length > 400 ? '...' : ''));
    } else {
      return null;
    }
  }

  return `### ${skillName}\n\n${sections.join('\n\n')}`;
}

// ─── Priority 4: Cross-Skill Conflict Detection ────────────────────
// After improvement, check if the skill's imperatives conflict with its related skills.

/**
 * Extract imperative statements from skill content (MUST, NEVER, ALWAYS, etc.)
 * Returns an array of { line, statement } objects.
 */
function extractImperatives(content) {
  const imperatives = [];
  const lines = String(content || '').split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/\b(MUST|NEVER|ALWAYS|DO NOT|REQUIRED|FORBIDDEN|MANDATORY)\b/.test(line)) {
      imperatives.push({ lineNum: i + 1, statement: line.trim() });
    }
  }
  return imperatives;
}

/**
 * Check for potential imperative conflicts between a skill and its related skills.
 * Returns an array of { skill, conflict_type, details } findings.
 */
function checkImperativeConflicts(skillDir, skillName) {
  const skillFile = path.join(skillDir, 'SKILL.md');
  if (!fs.existsSync(skillFile)) return [];

  const content = fs.readFileSync(skillFile, 'utf8');
  const { parseFrontmatter } = require('../audit-shared/skill-frontmatter');
  const frontmatter = parseFrontmatter(content);
  const relations = frontmatter.relations || {};

  const skillImperatives = extractImperatives(content);
  if (skillImperatives.length === 0) return [];

  const conflicts = [];
  const relatedNames = new Set();
  for (const relType of ['adjacent', 'boundary']) {
    const list = relations[relType];
    if (Array.isArray(list)) list.forEach((name) => relatedNames.add(name));
  }

  for (const relName of relatedNames) {
    const relDir = findSkillDirByName(relName);
    if (!relDir) continue;

    const relFile = path.join(relDir, 'SKILL.md');
    if (!fs.existsSync(relFile)) continue;

    const relContent = fs.readFileSync(relFile, 'utf8');
    const relImperatives = extractImperatives(relContent);

    // Check for contradicting NEVER/MUST pairs
    for (const si of skillImperatives) {
      for (const ri of relImperatives) {
        // Simple heuristic: NEVER in one skill + MUST/ALWAYS about the same topic in another
        const siNever = /\bNEVER\b/.test(si.statement);
        const riMust = /\b(MUST|ALWAYS)\b/.test(ri.statement);
        const siMust = /\b(MUST|ALWAYS)\b/.test(si.statement);
        const riNever = /\bNEVER\b/.test(ri.statement);

        if ((siNever && riMust) || (siMust && riNever)) {
          // Extract key terms to check topical overlap (3+ word match)
          const siWords = new Set(si.statement.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3));
          const riWords = new Set(ri.statement.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3));
          const overlap = [...siWords].filter(w => riWords.has(w));
          if (overlap.length >= 2) {
            conflicts.push({
              skill: relName,
              conflict_type: 'contradicting_imperatives',
              details: `"${si.statement.slice(0, 100)}" vs "${ri.statement.slice(0, 100)}" (shared terms: ${overlap.join(', ')})`,
            });
          }
        }
      }
    }
  }

  return conflicts;
}

module.exports = {
  PRE_GEMINI_SKILL_SEEDS,
  normalizeSkillDir,
  getPreGeminiSeed,
  buildSkillInvocationPrompt,
  countLines,
  checkReferencesIntegrity,
  evaluateCandidateGate,
  collectMissingDocumentationSections,
  extractDomainAnchors,
  generateSkillGapSuggestions,
  renderCycleReport,
  skillNameFromDir,
  skillHistoryKeyFromDir,
  // Shared model routing
  OPENCODE_CLI,
  isClaudeModel,
  resolveModelExecutor,
  resolveReceiptModelId,
  LATEST_ALIAS_SENTINEL,
  isLatestResolvingModel,
  REGISTRY_VERSION,
  extractJsonObject,
  STATUS,
  // Priority 1: Health Ledger
  HEALTH_LEDGER_PATH,
  readHealthLedger,
  writeHealthLedgerEntry,
  computeUpgradeEffectiveness,
  // Priority 2: Research Brief
  buildResearchBrief,
  findSkillDirByName,
  extractSkillSummary,
  // Priority 4: Cross-Skill Context
  extractImperatives,
  checkImperativeConflicts,
};
