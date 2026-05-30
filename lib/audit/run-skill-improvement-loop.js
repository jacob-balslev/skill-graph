'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const {
  readRegistry,
  OWNERSHIP_MODE_TEMPLATE,
  OWNERSHIP_MODE_AUTHORED,
} = require('../audit-shared/auto-improve');

const { runEval } = require('./evaluate-skill');
const {
  countLines,
  evaluateCandidateGate,
  generateSkillGapSuggestions,
  getPreGeminiSeed,
  resolveModelExecutor,
  STATUS,
  checkReferencesIntegrity,
  renderCycleReport,
  skillNameFromDir,
  // Priority 1: Health Ledger
  writeHealthLedgerEntry,
  // Priority 2: Research Brief
  buildResearchBrief,
  // Priority 4: Cross-Skill Conflict Detection
  checkImperativeConflicts,
} = require('./skill-improvement-helpers');

function parseArgs(argv) {
  const args = {};
  const positional = [];

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      positional.push(token);
      continue;
    }

    const key = token.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    i += 1;
  }

  return { args, positional };
}

function collectSkillDirs(skillsRoot) {
  // SH-6640 fix: walk RECURSIVELY via the canonical walkSkillFiles. The original
  // one-level readdir assumed a FLAT root (<root>/<name>/SKILL.md, as in
  // .claude/skills), but the canonical library is NESTED by subject
  // (<root>/<subject>/<name>/SKILL.md) — so a one-level scan found ZERO skills
  // even after the root was resolved correctly, silently processing nothing.
  // walkSkillFiles handles both layouts (it stops descending at the first
  // SKILL.md) and skips _archived/ and dot-dirs.
  try {
    const { walkSkillFiles } = require('./roots');
    const files = walkSkillFiles(skillsRoot);
    if (Array.isArray(files) && files.length > 0) {
      return files.map((skillMd) => path.dirname(skillMd));
    }
  } catch (walkErr) {
    console.warn(`  ⚠ walkSkillFiles failed for ${skillsRoot} (${walkErr.message}); falling back to one-level scan`);
  }
  // Fallback: original one-level scan (a bare flat root with no nesting).
  if (!fs.existsSync(skillsRoot)) return [];
  return fs
    .readdirSync(skillsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(skillsRoot, entry.name))
    .filter((dir) => fs.existsSync(path.join(dir, 'SKILL.md')));
}

function buildBranchName(workspaceName, stamp) {
  const slug = String(workspaceName || 'workspace').replace(/[^a-zA-Z0-9-]+/g, '-').replace(/-+/g, '-');
  return `automation/skill-loop-${slug}-${stamp}`;
}

// The git repository that OWNS a path (its toplevel), or null when the path is
// not inside a git repo. Apply-mode worktree isolation (SH-6640 Break #4) must
// target the repo that owns the SKILLS, which post-monorepo-split is the sibling
// `~/Development/skills` repo — NOT the skill-graph workspace. A worktree of the
// workspace contains no skill files, so the loop found 0 skills in apply mode.
function gitToplevel(dir) {
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], {
      cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    }).trim() || null;
  } catch {
    return null;
  }
}

function resolveSkillAssetMetadata(skillDir, repoRootForPaths, registry) {
  const skillFile = path.join(skillDir, 'SKILL.md');
  const templateFile = path.join(skillDir, 'SKILL.md.tmpl');
  const relativeSkillFile = normalizeRelPath(path.relative(repoRootForPaths, skillFile));
  const relativeTemplate = normalizeRelPath(path.relative(repoRootForPaths, templateFile));
  const matchedAsset = (registry.assets || []).find((asset) => asset.path === relativeSkillFile || asset.path === relativeTemplate);

  return {
    assetId: matchedAsset?.id || `skill:${skillNameFromDir(skillDir)}`,
    ownershipMode: matchedAsset?.ownership_mode || (fs.existsSync(templateFile) ? OWNERSHIP_MODE_TEMPLATE : OWNERSHIP_MODE_AUTHORED),
    pilotTrack: matchedAsset?.pilot_track || null,
    skillFile,
    templateFile,
  };
}

// v6 Understanding fields — the flat frontmatter fields that describe what
// the agent learns from the skill. When --field is one of these, the loop
// enforces a HARD SCOPE: the improver may edit only that field, and the gate
// rejects any candidate that touches another Understanding field. This lets
// the walker (skill-evolution-loop) drive single-axis Karpathy iterations.
const UNDERSTANDING_FIELDS = Object.freeze([
  'description',
  'mental_model',
  'purpose',
  'boundary',
  'analogy',
  'misconception',
]);

// Evaluation-mode-specific verification instructions injected into the prompt.
// Varies the verification strategy based on the skill's domain_frame.evaluation_mode.
const EVAL_MODE_INSTRUCTIONS = {
  external_api_plus_repo: [
    'VERIFICATION STRATEGY (external API + repo):',
    '- Fetch vendor API docs (via WebFetch or Context7) to verify external claims BEFORE editing.',
    '- Cross-check webhook payload shapes, API endpoints, and plan-gated features against vendor docs.',
    '- Verify repo connector code matches the vendor API behavior it claims to handle.',
    '- Do NOT trust general knowledge about the API — verify against the current docs.',
  ],
  repo_implementation: [
    'VERIFICATION STRATEGY (repo implementation):',
    '- All claims must be verified by reading source files directly.',
    '- Check function signatures, return types, and line numbers against the live codebase.',
    '- Pay special attention to security mechanisms — verify the exact enforcement chain.',
  ],
  design_reference_plus_repo_override: [
    'VERIFICATION STRATEGY (design + repo override):',
    '- Verify general design principles against industry standards.',
    '- Then check repo-specific token values, CSS variables, and component APIs against _tokens.scss, globals.css, DESIGN_GUIDE.md.',
    '- Design tokens in the repo override general principles — repo truth wins.',
    '- Do NOT check line numbers for design skills — check token names and values.',
  ],
  conceptual_correctness_plus_repo_application: [
    'VERIFICATION STRATEGY (conceptual + repo application):',
    '- Verify framework/theory principles against published methodology sources.',
    '- Then verify that repo-specific examples and applications match the current schema and code.',
    '- Focus on whether the guidance produces correct decisions, not exact code signatures.',
  ],
  decision_quality: [
    'VERIFICATION STRATEGY (decision quality):',
    '- Verify strategic framework principles against the original methodology source.',
    '- Verify Sales Hub component placement against current architectural reality.',
    '- Do NOT test code signatures — test whether strategic recommendations are consistent.',
    '- Check board meeting decisions for any reversals or updates.',
  ],
  process_correctness: [
    'VERIFICATION STRATEGY (process correctness):',
    '- Verify command syntax by reading the actual command files and scripts.',
    '- Verify gate logic, phase ordering, and failure modes against the orchestration contract.',
    '- Check that process descriptions match the actual execution flow in scripts.',
  ],
  infrastructure_correctness: [
    'VERIFICATION STRATEGY (infrastructure):',
    '- Verify script APIs, command flags, and routing rules against live source.',
    '- Infrastructure skills drift fast — check file modification dates.',
    '- Verify model routing claims against the current model roster and routing tables.',
  ],
};

function readSkillEvalMode(skillDir) {
  const skillFile = path.join(skillDir, 'SKILL.md');
  try {
    const content = fs.readFileSync(skillFile, 'utf8');
    const { parseFrontmatter } = require('../audit-shared/skill-frontmatter');
    const fm = parseFrontmatter(content);
    if (fm.domain_frame && fm.domain_frame.evaluation_mode) {
      return fm.domain_frame.evaluation_mode;
    }
  } catch { /* ignore */ }
  return null;
}

function renderPrompt({
  skillName,
  skillDir,
  evalFile,
  targetFile,
  ownershipMode,
  pilotTrack,
  researchFirst,
  researchBrief = '',
  fieldScope = null,
}) {
  // HARD SCOPE — when fieldScope is set to a v6 Understanding field, the
  // model is told to edit only that frontmatter field. Anything else it
  // changes will be rejected by the post-edit gate in main(), so the model
  // is told that up front to avoid wasting the improvement attempt.
  const fieldScopeBlock = fieldScope && UNDERSTANDING_FIELDS.includes(fieldScope)
    ? [
        '',
        '=== HARD CONSTRAINT — SINGLE-FIELD SCOPE ===',
        `You may only edit the \`${fieldScope}\` frontmatter field on this skill.`,
        '',
        'Specifically:',
        `- Edit ONLY the \`${fieldScope}:\` line/value in SKILL.md frontmatter.`,
        '- Do NOT modify any other frontmatter field.',
        '- Do NOT modify the SKILL.md body content below the frontmatter.',
        '- Do NOT modify evals/evals.json or evals/eval-set.json.',
        '- Do NOT modify any file in the references/ directory.',
        '',
        'The post-edit gate verifies that no other frontmatter field changed.',
        'Multi-field edits will be discarded automatically — your work will be lost.',
        '=== END HARD CONSTRAINT ===',
        '',
      ]
    : [];


  const researchChecklist = researchFirst
    ? [
        'Research-first checklist (complete before editing):',
        '',
        'PHASE 0 — Domain Context (read FIRST, before anything else):',
        '- Read the target skill\'s ## Domain Context section (if present). This tells you what KIND of knowledge the skill represents and how to evaluate correctness.',
        '- If the skill has domain_frame frontmatter, use its evaluation_mode and truth_sources to determine which evidence sources to prioritize.',
        '- If neither exists, derive the domain type from the skill\'s name and description before proceeding.',
        '',
        'PHASE 1 — Domain verification (do this BEFORE reading the template):',
        '- Read the target skill\'s Key Files table. For each file listed, read the actual source file and catalog its exports, signatures, and key behaviors.',
        '- If Key Files table is empty or placeholder, grep the codebase for the skill\'s domain (imports, route groups, key functions) to build a source inventory.',
        '- Audit the skill against real repo truth: source files, command docs, generated contract outputs, routing metadata, and current eval behavior.',
        '- When the skill depends on external APIs, standards, or current vendor behavior, verify those claims against current docs or Context7 before editing.',
        '- Do not start rewriting until you can explain: what is wrong, what evidence proved it, and which gaps remain unresolved.',
        '',
        'PHASE 2 — Template and context (read AFTER domain verification):',
        '- Read docs/guides/skill-creation-template.md (v3.0 — the AUTHORITATIVE skill format spec). The output MUST conform to this template.',
        '- Read docs/guides/skill-improvement-guide.md for the improvement methodology.',
        '- Read AGENTS.md, CLAUDE.md, SKILL-INDEX.md.',
        '- Read skills/_meta/SKILL_IMPROVEMENT_PLAN.md to understand the current pilot architecture, ownership rules, and gating contract.',
        '- Read the target skill/template, its evals, and any local references/ files.',
        '',
      ]
    : [
        'Research checklist:',
        '',
        'PHASE 0 — Domain Context (read FIRST):',
        '- Read the target skill\'s ## Domain Context section (if present) to understand the domain type and evaluation lens.',
        '- If domain_frame frontmatter exists, use evaluation_mode and truth_sources to prioritize evidence.',
        '',
        'PHASE 1 — Domain verification (do this BEFORE reading the template):',
        '- Read the target skill\'s Key Files table and verify each listed file against the live codebase.',
        '- Read the code/docs that the skill makes claims about before editing those claims.',
        '',
        'PHASE 2 — Template and context:',
        '- Read docs/guides/skill-creation-template.md (v3.0 — the AUTHORITATIVE skill format spec). The output MUST conform to this template.',
        '- Read AGENTS.md, CLAUDE.md, SKILL-INDEX.md, and skills/_meta/EVAL_GUIDE.md.',
        '- Read skills/_meta/SKILL_IMPROVEMENT_PLAN.md and use its external best-practice synthesis while editing.',
        '- Read the target skill, its local evals, and any supporting files already in the skill directory.',
        '',
      ];

  const ownershipRules = ownershipMode === OWNERSHIP_MODE_TEMPLATE
    ? [
        '- This is a template-owned pilot skill. Edit `SKILL.md.tmpl`, not the generated `SKILL.md` body directly.',
        '- Treat the generated metadata block, template-source marker, and regenerated `SKILL.md` as contract artifacts that must remain valid after generation.',
        '- Never modify existing files in `references/`. During this pilot, record missing long-form knowledge in your findings output instead of rewriting human-curated references.',
      ]
    : [
        '- Edit `SKILL.md` directly for authored skills.',
        '- Never modify existing files in `references/`. Record missing long-form knowledge in your findings output for a future manual pass.',
      ];

  // Inject evaluation-mode-specific verification strategy
  const evalMode = readSkillEvalMode(skillDir);
  const modeInstructions = evalMode && EVAL_MODE_INSTRUCTIONS[evalMode]
    ? [...EVAL_MODE_INSTRUCTIONS[evalMode], '']
    : [];

  return [
    `Improve the \`${skillName}\` skill in place.`,
    '',
    ...fieldScopeBlock,
    ...researchChecklist,
    ...modeInstructions,
    `Audit target: ${targetFile}`,
    `Ownership mode: ${ownershipMode}${pilotTrack ? ` | pilot: ${pilotTrack}` : ''}`,
    '- Apply the current skill template contract (docs/guides/skill-creation-template.md):',
    '  - Core frontmatter MUST include: schema_version (8), name, description, version, subject (closed 9-enum browse shelf), deployment_target (closed 2-enum portable|project), scope (free-text PRD-style label), owner, freshness, drift_check, eval_artifacts, eval_state, routing_eval, relations.',
    '  - Recommended: keywords (<=10), subjects[] for polyhierarchy (max 2, primary first), taxonomy_domain for hierarchical sub-classification (slash-delimited, e.g. ecommerce/integrations/shopify).',
    '  - For deployment_target: project, grounding.subject_matter and project[] belonging-entity references are required.',
    '  - Do NOT author retired v7 fields: type, category, categories, secondary_categories, primaryCategory, layerPrimary, routingRole, family, layer, archetype, operation, eval_status, workspace_tags. These were removed in the v7 -> v8 clean cut and fail schema validation.',
    '  - Specialized lifecycle fields such as created, stability, governance_tier, and injection_priority are optional unless they clearly add governance or loading value.',
    '  - Body MUST include sections: Coverage, Philosophy, Verification, and Do NOT Use When.',
    '  - Follow the correct skill-shape contract for the body: capability, workflow, router, or overlay. Do NOT force stale family-specific headings if they do not fit the real behavior of the skill.',
    '  - Description: 3rd person, about-statement (not a routing contract), trigger phrases, negative bounds, <=300 words.',
    '',
    'Editing rules:',
    `- Target skill directory: ${skillDir}`,
    `- Primary editable file: ${targetFile}`,
    `- Target eval file: ${evalFile}`,
    '- Only edit files inside the target skill directory unless you must fix an obvious local cross-reference inside that same skill.',
    ...ownershipRules,
    '- Never optimize by deleting domain knowledge. The goal is stronger structure, better examples, more relevant knowledge, and better eval coverage.',
    '- Prefer extending the skill\'s existing ownership instead of turning it into a duplicate of a neighboring umbrella skill.',
    '- Favor documentation-first skill improvements: Coverage, Philosophy, Key Files, Verification, and Do NOT Use When should become clearer, better grounded, and easier to audit.',
    '- Strengthen evals as part of the same cycle. Better trigger precision, sharper negative cases, and more repo-specific expectations are part of a successful improvement.',
    '- Do not invent APIs, formulas, or file paths. Verify every claim against the repository.',
    '- If the skill has a Key Files section, verify every path exists on disk. Remove or update any that are stale.',
    '- If the skill is in skills/sales-hub/, cross-reference against sales-hub/ARCHITECTURE_MAP.md and sales-hub/DATAFLOW.md for accuracy.',
    '- If the skill describes page behavior, verify against the matching page contract in sales-hub/docs/design/page-contracts/.',
    '- Do not claim benchmark wins, rubric improvements, or pass rates inside the skill files.',
    '- Keep the skill useful for Claude Code specifically, not generic prompt advice.',
    '- For UX/product skills, preserve top-task framing, progressive disclosure, and trustworthy empty/loading/error state guidance.',
    '- For layout/composition skills, preserve one focal point per zone and hierarchy guidance based on position, size, grouping, and spacing.',
    '- For architecture skills, improve C4-level framing and trade-off clarity; ADR guidance should record the decision, not blur into low-level implementation notes.',
    '',
    'Required deliverables:',
    ownershipMode === OWNERSHIP_MODE_TEMPLATE
      ? '- Improve `SKILL.md.tmpl` so the regenerated `SKILL.md` becomes more accurate, more explanatory, and easier to audit.'
      : '- Improve `SKILL.md` for accuracy, triggers, bounds, and task guidance.',
    '- Improve evals/evals.json so it targets real failure modes, anti-goals, and grounded expectations.',
    '- If trigger precision is weak or missing, add or strengthen evals/eval-set.json for realistic should-trigger and should-not-trigger coverage.',
    '- If the current eval suite is too thin, add more evals for uncovered failure modes.',
    '',
    '- If the skill has `references.urls` in frontmatter, WebFetch them for current truth before editing.',
    '- If the skill is an integration/security/framework family and has NO `references.urls`, flag that gap in your report.',
    '',
    'When done, output a short structured report with these headings:',
    '- Audit Findings',
    '- Key File Verification (list any paths that were stale and what you did)',
    '- References Updated (list any URLs added/removed/verified)',
    '- Cross-Skill Conflicts (any imperative contradictions with related skills)',
    '- New Knowledge Verified',
    '- Applied Improvements',
    '- Eval Improvements',
    '- Remaining Gaps',
    researchBrief ? `\n${researchBrief}` : '',
  ].join('\n');
}

function sanitizedEnv() {
  const env = { ...process.env };
  delete env.CLAUDECODE;
  delete env.CLAUDE_CODE_ENTRYPOINT;
  return env;
}

function summarizeExecError(error) {
  const candidates = [error?.stderr, error?.stdout, error?.message]
    .map((value) => String(value || '').trim())
    .filter(Boolean);

  const preferred =
    candidates.find((value) => !value.startsWith('Command failed:')) || candidates[0] || 'Command failed';

  return preferred
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 4)
    .join(' ')
    .slice(0, 600);
}

function runCommand(command, args, cwd) {
  try {
    return execFileSync(command, args, {
      cwd,
      encoding: 'utf8',
      env: sanitizedEnv(),
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 10 * 1024 * 1024,
    }).trim();
  } catch (error) {
    throw new Error(summarizeExecError(error));
  }
}

function timestamp() {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function copyDirectory(sourceDir, targetDir) {
  fs.rmSync(targetDir, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(targetDir), { recursive: true });
  fs.cpSync(sourceDir, targetDir, { recursive: true });
}

// Frontmatter-field-scope verification: returns the list of frontmatter keys
// that differ between the backup SKILL.md and the post-edit SKILL.md. Used by
// the gate when --field is a v6 Understanding field to enforce single-axis
// edits — the gate rejects any candidate that changed a frontmatter key other
// than the one named in --field.
function diffFrontmatterKeys(beforeSkillPath, afterSkillPath) {
  const { parseFrontmatter } = require('../audit-shared/skill-frontmatter');
  const safeParse = (p) => {
    try {
      return parseFrontmatter(fs.readFileSync(p, 'utf8')) || {};
    } catch {
      return {};
    }
  };
  const before = safeParse(beforeSkillPath);
  const after = safeParse(afterSkillPath);
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const changed = [];
  for (const key of allKeys) {
    const a = JSON.stringify(before[key] ?? null);
    const b = JSON.stringify(after[key] ?? null);
    if (a !== b) changed.push(key);
  }
  return changed;
}

// Atomic worktree-merge: when the gate accepts a candidate AND --commit is
// set, stage just the skill directory inside the worktree, commit there,
// then fast-forward the worktree branch into the main workspace. This puts
// exactly ONE commit on main per kept improvement — which is what makes the
// walker's preImproveCommit / gitRevertHead safety net work correctly.
function commitWorktreeChange({ worktreePath, mainWorkspace, branchName, skillName, fieldScope, skillDirRel }) {
  // 1. Stage and commit inside the worktree.
  execFileSync('git', ['add', '--', skillDirRel], {
    cwd: worktreePath, encoding: 'utf8', stdio: 'pipe',
  });
  const msgScope = fieldScope || 'content';
  const message = `improve(${skillName}): ${msgScope}\n\nAutomated single-field improvement via run-skill-improvement-loop --commit.`;
  execFileSync('git', ['commit', '-m', message, '--only', '--', skillDirRel], {
    cwd: worktreePath, encoding: 'utf8', stdio: 'pipe',
  });
  // 2. Fast-forward merge the worktree branch into main. --ff-only refuses
  //    if main has moved during the improver run (parallel session, etc.)
  //    so we never silently produce a merge commit.
  execFileSync('git', ['merge', '--ff-only', branchName], {
    cwd: mainWorkspace, encoding: 'utf8', stdio: 'pipe',
  });
}

function countReferenceFiles(skillDir) {
  const referencesDir = path.join(skillDir, 'references');
  if (!fs.existsSync(referencesDir)) {
    return 0;
  }

  let count = 0;
  const stack = [referencesDir];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const nextPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(nextPath);
      } else {
        count += 1;
      }
    }
  }
  return count;
}

// Error classification for structured failure handling
const INFRA_ERROR_CLASS = {
  TRANSIENT: 'transient',    // timeout, rate-limit → retry with backoff
  STRUCTURAL: 'structural',  // worktree incompatibility → abort and report
  UNAVAILABLE: 'unavailable', // model/CLI not found → switch model or abort
};

function classifyInfraError(error) {
  const msg = String(error.message || error).toLowerCase();
  if (msg.includes('session not found') || msg.includes('worktree')) return INFRA_ERROR_CLASS.STRUCTURAL;
  if (msg.includes('rate limit') || msg.includes('timeout') || msg.includes('econnreset')) return INFRA_ERROR_CLASS.TRANSIENT;
  if (msg.includes('not found') || msg.includes('enoent') || msg.includes('command failed')) return INFRA_ERROR_CLASS.UNAVAILABLE;
  return INFRA_ERROR_CLASS.TRANSIENT; // default to transient (retryable)
}

function runImprover(prompt, { workspace, generatorModel, apply }) {
  const { cli, model } = resolveModelExecutor(generatorModel);
  if (cli === 'claude') {
    const args = ['-p', prompt, '--model', model, '--output-format', 'text'];
    if (apply) {
      args.push('--permission-mode', 'acceptEdits', '--dangerously-skip-permissions');
    } else {
      args.push('--permission-mode', 'plan');
    }
    return runCommand(cli, args, workspace);
  }
  if (cli === 'gemini') {
    const args = ['--yolo', '-m', model, '-p', prompt];
    return runCommand(cli, args, workspace);
  }
  // OpenCode CLI: fails with "Session not found" in git worktree contexts.
  // Attempt OpenCode first, fall back to Claude sonnet if structural failure.
  try {
    return runCommand(cli, ['run', '-m', model, '--format', 'default', prompt], workspace);
  } catch (error) {
    const errorClass = classifyInfraError(error);
    if (errorClass === INFRA_ERROR_CLASS.STRUCTURAL) {
      console.warn(`  ⚠ OpenCode structural failure (${error.message.slice(0, 80)}). Falling back to Claude sonnet.`);
      const fallbackArgs = ['-p', prompt, '--model', 'sonnet', '--output-format', 'text'];
      if (apply) {
        fallbackArgs.push('--permission-mode', 'acceptEdits', '--dangerously-skip-permissions');
      } else {
        fallbackArgs.push('--permission-mode', 'plan');
      }
      return runCommand('claude', fallbackArgs, workspace);
    }
    throw error; // Re-throw transient/unavailable errors for normal error handling
  }
}

function maybeRestorePreGeminiSeed(skillDir, workspace) {
  const seed = getPreGeminiSeed(skillDir);
  if (!seed) return null;

  const relativeDir = path.relative(workspace, skillDir);
  runCommand('git', ['checkout', seed.commit, '--', relativeDir], workspace);
  return seed;
}

function normalizeRelPath(filePath) {
  return String(filePath || '').replace(/\\/g, '/');
}

function resolveSkillTier(skillDir, repoRootForPaths, registry) {
  const { skillFile, templateFile } = resolveSkillAssetMetadata(skillDir, repoRootForPaths, registry);
  const relativeSkillFile = normalizeRelPath(path.relative(repoRootForPaths, skillFile));
  const relativeTemplate = normalizeRelPath(path.relative(repoRootForPaths, templateFile));

  for (const asset of registry.assets || []) {
    if (asset.path === relativeSkillFile || asset.path === relativeTemplate) {
      return Number(asset.tier || 2);
    }
  }

  return 2;
}

function determineLoopExitCode(summary, { requireKept = false } = {}) {
  if (summary.abortReason || summary.counts.blocked_infra > 0) {
    return 1;
  }

  if (requireKept && summary.apply && summary.counts.kept === 0) {
    // The caller asked for a real kept result, not just a completed run. This
    // lets parent loops distinguish "candidate was evaluated then discarded"
    // from an actual improvement that survived the gate.
    return 2;
  }

  return 0;
}

function main() {
  const { args } = parseArgs(process.argv.slice(2));

  for (const removedFlag of ['generator-model', 'grader-model']) {
    if (Object.prototype.hasOwnProperty.call(args, removedFlag)) {
      console.error(`--${removedFlag} has been removed. Model selection is owned by the script, not by callers.`);
      process.exit(1);
    }
  }

  if (args.help || args.h) {
    console.log(`Usage: node scripts/skill/run-skill-improvement-loop.js [options]

Options:
  --apply                  Apply improvements (creates worktree branch)
  --commit                 On gate accept, commit in the worktree and
                           fast-forward into main (use with --apply). Required
                           for the walker's Karpathy revert path to activate.
  --field NAME             Hard single-field scope (one of: ${UNDERSTANDING_FIELDS.join(', ')}).
                           Prompt is constrained and the gate rejects any
                           candidate that modified a different frontmatter
                           field. Unknown values are treated as a no-op hint.
  --grader TYPE            Grader CLI: opencode|claude|gemini (default: opencode)
  --ownership-mode MODE    Filter to template or authored skills
  --pilot-track NAME       Filter to a named pilot track (e.g. template-owned-meta)
  --research-first         Use the research-first prompt contract
  --skills-root DIR        Skills directory (default: configured skill_roots[0] from
                           .skill-graph/config.json; falls back to .claude/skills)
  --skills-dir DIR         Alias for --skills-root
  --include FILTER         Comma-separated skill name filters
  --max-skills N           Max skills to process
  --workspace DIR          Workspace root (default: cwd)
  --artifacts-root DIR     Where to save artifacts
  --seed-pre-gemini        Restore pre-Gemini skill versions as baseline
  --require-kept           Exit non-zero if no candidate survives the gate in apply mode
  --audit-tier TIER        Audit depth: deep-audit, standard, light, skip (default: standard)
  --smoke-test             Run preflight checks only, then exit

`);
    process.exit(0);
  }

  const workspace = path.resolve(args.workspace || process.cwd());
  // Skills root resolution (SH-6640 fix): default to the canonical configured
  // skill root from .skill-graph/config.json (resolveSkillRoots — the SAME
  // resolver audit/evaluate/lint/drift use), NOT a hardcoded <cwd>/.claude/skills
  // that does not exist in this repo. Explicit --skills-root / --skills-dir still
  // win; the .claude/skills literal remains only as a last-resort fallback when no
  // config and no flag are present (back-compat for a bare workspace).
  const explicitSkillsRoot = args['skills-root'] || args['skills-dir'];
  let resolvedDefaultSkillsRoot = path.join(workspace, '.claude', 'skills');
  if (!explicitSkillsRoot) {
    try {
      const { resolveSkillRoots } = require('./roots');
      const roots = resolveSkillRoots();
      if (Array.isArray(roots) && roots.length > 0 && roots[0] && roots[0].absPath) {
        resolvedDefaultSkillsRoot = roots[0].absPath;
      }
    } catch (rootsErr) {
      console.warn(`  ⚠ could not resolve configured skill roots (${rootsErr.message}); falling back to ${resolvedDefaultSkillsRoot}`);
    }
  }
  const skillsRoot = path.resolve(explicitSkillsRoot || resolvedDefaultSkillsRoot);
  // SH-6640 Break #4: apply-mode worktree isolation must target the repo that
  // OWNS the skills, not the workspace. Post-split, skillsRoot lives in the
  // sibling skills repo (outside skill-graph), so a worktree of `workspace`
  // contains no skill files (effectiveSkillsRoot resolved to a nonexistent
  // `<worktree>/../skills/skills`, and 0 skills were processed). Resolve the
  // skills-owning repo here; everything apply-mode touches (worktree add,
  // cleanup, fast-forward target) keys off this, not `workspace`. Falls back to
  // `workspace` when skillsRoot is not in its own git repo (bare-workspace
  // back-compat where skills live under <workspace>/.claude/skills).
  const skillsRepoRoot = gitToplevel(skillsRoot) || workspace;
  // SH-6640 fix: accept --skill (the flag the public CLI `skill-graph improve`
  // documents) as an alias for --include. Without this, `improve --skill okrs`
  // silently ignored the name and processed the ENTIRE library (no filter →
  // process-all), the opposite of the documented "improve a single named skill".
  const includeFilters = String(args.include || args.skill || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  const maxSkills = args['max-skills'] ? Number(args['max-skills']) : Number.POSITIVE_INFINITY;
  const apply = Boolean(args.apply);
  const seedPreGemini = Boolean(args['seed-pre-gemini']);
  const auditTier = args['audit-tier'] || 'standard';
  // --field: when set to a v6 Understanding field, the prompt carries a hard
  //   single-axis scope and the gate rejects multi-field edits. Unknown values
  //   are accepted as a no-op hint (graceful degradation for legacy callers
  //   that pass Health Block date fields like last_audited).
  // --commit: when set AND the gate accepts, the loop commits the kept change
  //   inside the worktree and fast-forwards into main, so the walker's
  //   pre/post-HEAD Karpathy safety net activates. Without --commit, the
  //   existing preserve-worktree-for-manual-review path is unchanged.
  const fieldScope = typeof args.field === 'string' ? args.field : null;
  const fieldScopeIsHard = fieldScope && UNDERSTANDING_FIELDS.includes(fieldScope);
  const autoCommit = Boolean(args.commit);
  const generatorModel = 'sonnet';
  const grader = args.grader || 'opencode';
  const stamp = timestamp();
  // Default artifacts to repo-persisted location (not /tmp/) so findings survive sessions.
  // Previous default was os.tmpdir() which lost all results after session end (SH-2639).
  const defaultArtifactsRoot = path.join(workspace, '.opencode', 'progress', 'skill-upgrades', stamp);
  const artifactsRoot = path.resolve(args['artifacts-root'] || defaultArtifactsRoot);
  fs.mkdirSync(artifactsRoot, { recursive: true });

  let activeWorkspace = workspace;
  let worktreePath = null;
  let branchName = null;
  let shouldCleanupWorktree = true;

  if (apply) {
    branchName = buildBranchName(path.basename(skillsRepoRoot), stamp);
    // The worktree DIR lives under skill-graph's gitignored .claude/worktrees/,
    // but it is a checkout of the SKILLS repo (skillsRepoRoot) — git tracks the
    // worktree via skillsRepoRoot/.git, the location is just a directory.
    worktreePath = path.join(workspace, '.claude', 'worktrees', `skill-loop-${stamp}`);
    runCommand('git', ['worktree', 'add', '-b', branchName, worktreePath, 'HEAD'], skillsRepoRoot);
    activeWorkspace = worktreePath;
  }

  // ─── Worktree cleanup helper ──────────────────────────────────────
  // Every run that creates a worktree MUST clean it up, even on failure.
  // Without this, stale worktrees accumulate (20+ found on 2026-03-28).
  function cleanupWorktree() {
    if (!worktreePath) return;
    if (!shouldCleanupWorktree) {
      console.log(`Preserving worktree for kept changes: ${worktreePath}`);
      return;
    }
    try {
      // cwd is the skills-owning repo (SH-6640 Break #4) — the worktree is
      // registered there, not in the workspace.
      execFileSync('git', ['worktree', 'remove', '--force', worktreePath], {
        cwd: skillsRepoRoot, encoding: 'utf8', stdio: 'pipe',
      });
      console.log(`Cleaned up worktree: ${worktreePath}`);
    } catch (e) {
      console.warn(`Warning: failed to clean up worktree ${worktreePath}: ${e.message}`);
    }
    // Also clean up the branch if no changes were kept
    if (branchName) {
      try {
        execFileSync('git', ['branch', '-D', branchName], {
          cwd: skillsRepoRoot, encoding: 'utf8', stdio: 'pipe',
        });
      } catch {
        // Branch may already be gone or have been merged — ignore
      }
    }
  }

  // Register cleanup for unexpected termination (SIGTERM from parent timeout, etc.)
  if (worktreePath) {
    const handleSignal = (signal) => {
      console.error(`\nReceived ${signal} — cleaning up worktree before exit.`);
      cleanupWorktree();
      process.exit(1);
    };
    process.on('SIGTERM', handleSignal);
    process.on('SIGINT', handleSignal);
  }

  try { // ← Guarantees worktree cleanup via finally block

  // ─── Preflight: verify executors before processing skills ───────
  console.log('\n--- Preflight Check ---');
  const { cli: genCli, model: genModel } = resolveModelExecutor(generatorModel);
  for (const [name, cliPath] of [['generator', genCli]]) {
    try {
      execFileSync(cliPath, ['--version'], { stdio: 'pipe', timeout: 10000, encoding: 'utf8' });
      console.log(`  ✓ ${name} CLI (${path.basename(cliPath)}) available`);
    } catch (e) {
      throw new Error(`Preflight failed: ${name} CLI not available at ${cliPath}: ${e.message}`);
    }
  }

  // Grader CLI fail-fast. Without this, a missing `opencode` (the default
  // grader) used to silently turn every eval case into a spawnSync ENOENT,
  // which the improver gate then surfaced as "updated eval bundle introduced
  // execution errors (N)" and auto-rejected the candidate — so every walker
  // pass through this script logged a clean "gate-rejected" without ever
  // explaining that the rejection cause was an uninstalled CLI. We now
  // verify the grader binary up front and either fail fast with a useful
  // hint, or pass cleanly through to the eval loop. claude is always
  // bundled so it's exempt; gemini and opencode are external installs.
  if (grader !== 'claude') {
    try {
      execFileSync(grader, ['--version'], { stdio: 'pipe', timeout: 10000, encoding: 'utf8' });
      console.log(`  ✓ grader CLI (${grader}) available`);
    } catch (e) {
      throw new Error(
        `Preflight failed: grader CLI '${grader}' not available on PATH (${e.code || e.message}). ` +
        `Install ${grader} or pass --grader claude.`,
      );
    }
  } else {
    console.log(`  ✓ grader CLI (claude) — bundled, skipping --version probe`);
  }

  // Smoke test: verify the generator can actually run in the target workspace.
  // This catches the "Session not found" worktree error in <10 seconds instead
  // of after attempting all skills.
  if (apply && genCli !== 'claude' && genCli !== 'gemini') {
    console.log(`  Smoke test: running ${path.basename(genCli)} in worktree context...`);
    try {
      runCommand(genCli, ['run', '-m', genModel, '--format', 'default', 'Say OK'], activeWorkspace);
      console.log(`  ✓ ${path.basename(genCli)} works in worktree context`);
    } catch (e) {
      const errorClass = classifyInfraError(e);
      if (errorClass === INFRA_ERROR_CLASS.STRUCTURAL) {
        console.warn(`  ⚠ ${path.basename(genCli)} cannot run in worktree (${e.message.slice(0, 80)})`);
        console.warn(`  → Generator will auto-fallback to Claude sonnet when this occurs.`);
      } else {
        console.warn(`  ⚠ Smoke test failed (${errorClass}): ${e.message.slice(0, 120)}`);
      }
    }
  }
  console.log('--- Preflight OK ---\n');

  // ─── --smoke-test: exit after preflight ─────────────────────────
  if (args['smoke-test']) {
    console.log('Smoke test passed. Exiting (--smoke-test mode).');
    process.exit(0);
  }

  // Use skillsRoot (respects --skills-root flag), adjusted for worktree if in
  // apply mode. SH-6640 Break #4: the worktree is a checkout of skillsRepoRoot,
  // so map skillsRoot's position WITHIN that repo onto the worktree — NOT via
  // path.relative(workspace, skillsRoot), which produced an escaping
  // `<worktree>/../skills/skills` that did not exist (→ 0 skills processed).
  const effectiveSkillsRoot = apply
    ? path.join(activeWorkspace, path.relative(skillsRepoRoot, skillsRoot))
    : skillsRoot;
  const discoveredSkills = collectSkillDirs(effectiveSkillsRoot);
  const registry = readRegistry();
  const selectedSkills = discoveredSkills
    .filter((skillDir) => {
      if (includeFilters.length === 0) return true;
      return includeFilters.some((filter) => skillDir.includes(filter));
    })
    .slice(0, maxSkills);

  const summary = {
    workspace,
    skillsRepoRoot,
    activeWorkspace,
    branchName,
    worktreePath,
    apply,
    seedPreGemini,
    generatorModel,
    grader,
    ownershipMode: args['ownership-mode'] || null,
    pilotTrack: args['pilot-track'] || null,
    auditTier,
    researchFirst: Boolean(args['research-first']) || auditTier === 'deep-audit',
    artifactsRoot,
    executors: {
      generator: { model: generatorModel, cli: resolveModelExecutor(generatorModel).cli },
      grader: { cli: grader },
    },
    skills: [],
  };

  console.log(`Skill loop workspace: ${activeWorkspace}`);
  console.log(`Audit tier: ${auditTier}${auditTier === 'deep-audit' ? ' (research-first forced)' : ''}`);
  console.log(`Artifacts: ${artifactsRoot}`);
  if (branchName) {
    console.log(`Recovery/apply branch: ${branchName}`);
  }

  const FAIL_FAST_THRESHOLD = 3;
  let consecutiveErrors = 0;

  for (const skillDir of selectedSkills) {
    const skillName = skillNameFromDir(skillDir);
    const evalFile = path.join(skillDir, 'evals', 'evals.json');
    const skillArtifactsDir = path.join(artifactsRoot, skillName);
    fs.mkdirSync(skillArtifactsDir, { recursive: true });
    const assetMetadata = resolveSkillAssetMetadata(skillDir, activeWorkspace, registry);

    if (args['ownership-mode'] && args['ownership-mode'] !== assetMetadata.ownershipMode) {
      console.log(`Skipping ${skillName}: ownership mode ${assetMetadata.ownershipMode} does not match --ownership-mode ${args['ownership-mode']}`);
      continue;
    }
    if (args['pilot-track'] && args['pilot-track'] !== assetMetadata.pilotTrack) {
      console.log(`Skipping ${skillName}: pilot track ${assetMetadata.pilotTrack || 'none'} does not match --pilot-track ${args['pilot-track']}`);
      continue;
    }

    // ── Tier: skip ─────────────────────────────────────────────
    // Skip tier means "flag for periodic review, don't audit now"
    if (auditTier === 'skip') {
      summary.skills.push({ skillName, status: STATUS.SKIPPED_NO_EVALS, tier: 'skip', reason: 'Audit tier is skip — flagged for periodic review only' });
      console.log(`Skipping ${skillName}: audit tier is 'skip' (no action)`);
      continue;
    }

    if (!fs.existsSync(evalFile)) {
      summary.skills.push({ skillName, status: STATUS.SKIPPED_NO_EVALS });
      console.log(`Skipping ${skillName}: missing evals.json`);
      continue;
    }

    let declaredEvalCount = 0;
    try {
      const parsedEvalFile = JSON.parse(fs.readFileSync(evalFile, 'utf8'));
      declaredEvalCount = Array.isArray(parsedEvalFile.evals) ? parsedEvalFile.evals.length : 0;
    } catch {
      declaredEvalCount = 0;
    }

    try {
      const seed = seedPreGemini ? maybeRestorePreGeminiSeed(skillDir, activeWorkspace) : null;
      const beforeSkill = fs.readFileSync(assetMetadata.skillFile, 'utf8');
      const beforeEval = fs.readFileSync(evalFile, 'utf8');
      const evalSetFile = path.join(skillDir, 'evals', 'eval-set.json');
      const beforeEvalSet = fs.existsSync(evalSetFile) ? fs.readFileSync(evalSetFile, 'utf8') : null;
      const beforeLines = countLines(beforeSkill);
      const backupDir = path.join(skillArtifactsDir, 'backup');
      const frozenEvalFile = path.join(skillArtifactsDir, 'frozen-evals.json');
      fs.writeFileSync(frozenEvalFile, beforeEval);
      if (apply) {
        copyDirectory(skillDir, backupDir);
      }

      console.log(`\n=== ${skillName} [${auditTier}] ===`);

      // ── Tier: light ────────────────────────────────────────────
      // Light tier: verify Key Files + relations only, skip full improvement + eval.
      if (auditTier === 'light') {
        const lightPrompt = [
          `Light audit of the \`${skillName}\` skill.`,
          '',
          'Scope: Key Files verification + relations check only. Do NOT rewrite the skill or evals.',
          '',
          '1. Read the skill\'s Key Files table. For each path, verify it exists on disk.',
          '2. Check the skill\'s relations (adjacent, boundary) are still accurate.',
          '3. Verify the skill\'s ## Domain Context section is still correct (if present).',
          '4. Output a short report: which Key Files are valid/broken, which relations are stale.',
          '5. If all Key Files are valid and relations are current, output "LIGHT AUDIT PASS".',
          '6. If any Key Files are broken or relations are stale, output "LIGHT AUDIT: N issues found" with details.',
        ].join('\n');
        fs.writeFileSync(path.join(skillArtifactsDir, 'prompt.md'), `${lightPrompt}\n`);
        try {
          const lightOutput = runImprover(lightPrompt, { workspace: activeWorkspace, generatorModel, apply: false });
          fs.writeFileSync(path.join(skillArtifactsDir, 'light-audit-output.md'), `${lightOutput}\n`);
          summary.skills.push({ skillName, status: 'light_audit', tier: 'light', output: lightOutput.slice(0, 500) });
          console.log(`  Light audit complete`);
        } catch (err) {
          summary.skills.push({ skillName, status: 'error', tier: 'light', error: err.message });
          console.error(`  Light audit failed: ${err.message}`);
        }
        continue;
      }

      // ── Tiers: standard and deep-audit continue with full protocol ─

      const baseline = apply
        ? runEval(frozenEvalFile, {
            workspace: activeWorkspace,
            grader,
            artifactsDir: path.join(skillArtifactsDir, 'baseline'),
          })
        : null;

      const targetFile = assetMetadata.ownershipMode === OWNERSHIP_MODE_TEMPLATE
        ? assetMetadata.templateFile
        : assetMetadata.skillFile;

      // Priority 2: Build research brief with related skills, app truth, page contracts
      let researchBrief = '';
      // Deep-audit always builds research brief; standard skips it to save time
      if (auditTier === 'deep-audit' || Boolean(args['research-first'])) {
        try {
          researchBrief = buildResearchBrief(skillDir, skillName);
          if (researchBrief) {
            console.log(`  Research brief: ${researchBrief.split('\n').length} lines of context injected`);
          }
        } catch (err) {
          console.warn(`  [warn] research brief build failed: ${err.message}`);
        }
      }

      const prompt = renderPrompt({
        skillName,
        skillDir,
        evalFile,
        targetFile,
        ownershipMode: assetMetadata.ownershipMode,
        pilotTrack: assetMetadata.pilotTrack,
        researchFirst: Boolean(args['research-first']) || auditTier === 'deep-audit',
        researchBrief,
        fieldScope: fieldScopeIsHard ? fieldScope : null,
      });
      fs.writeFileSync(path.join(skillArtifactsDir, 'prompt.md'), `${prompt}\n`);
      const modelOutput = runImprover(prompt, {
        workspace: activeWorkspace,
        generatorModel,
        apply,
      });
      fs.writeFileSync(path.join(skillArtifactsDir, apply ? 'apply-output.md' : 'plan-output.md'), `${modelOutput}\n`);

      if (apply && assetMetadata.ownershipMode === OWNERSHIP_MODE_TEMPLATE) {
        runCommand('node', [path.join(activeWorkspace, 'scripts', 'generate-skill-docs.js'), '--skill', skillName], activeWorkspace);
        runCommand('node', [path.join(activeWorkspace, 'scripts', 'generate-skill-docs.js'), '--skill', skillName, '--check'], activeWorkspace);
      }

      let kept = false;
      let candidate = null;
      let updatedEvalRun = null;
      let gate = { accepted: false, reasons: ['dry-run mode does not apply changes'] };
      let afterLines = beforeLines;
      const tier = resolveSkillTier(skillDir, activeWorkspace, registry);

      if (apply) {
        candidate = runEval(frozenEvalFile, {
          workspace: activeWorkspace,
          grader,
          artifactsDir: path.join(skillArtifactsDir, 'candidate'),
        });
        updatedEvalRun = runEval(evalFile, {
          workspace: activeWorkspace,
          grader,
          artifactsDir: path.join(skillArtifactsDir, 'candidate-updated-evals'),
        });

        const afterSkill = fs.readFileSync(assetMetadata.skillFile, 'utf8');
        const afterEval = fs.readFileSync(evalFile, 'utf8');
        const afterEvalSet = fs.existsSync(evalSetFile) ? fs.readFileSync(evalSetFile, 'utf8') : null;
        afterLines = countLines(afterSkill);

        // Check references/ integrity before gate evaluation
        const referencesCheck = checkReferencesIntegrity(backupDir, skillDir);

        gate = evaluateCandidateGate({
          baselinePassed: baseline ? baseline.candidatePassed : 0,
          candidatePassed: candidate.candidatePassed,
          total: candidate.total,
          baselineMetrics: baseline ? baseline.candidateMetrics : null,
          candidateMetrics: candidate.candidateMetrics,
          skillName,
          tier,
          beforeLines,
          afterLines,
          beforeContent: beforeSkill,
          afterContent: afterSkill,
          referencesModified: referencesCheck.modified,
          ownershipMode: assetMetadata.ownershipMode,
        });

        if (assetMetadata.pilotTrack === 'template-owned-meta' && beforeEval === afterEval && beforeEvalSet === afterEvalSet) {
          gate.accepted = false;
          gate.reasons.push('candidate did not improve eval artifacts (`evals.json` or `eval-set.json`) for the template-owned meta pilot');
        }
        if (updatedEvalRun && updatedEvalRun.candidateMetrics.error_count > 0) {
          gate.accepted = false;
          gate.reasons.push(`updated eval bundle introduced execution errors (${updatedEvalRun.candidateMetrics.error_count})`);
        }
        if (updatedEvalRun && updatedEvalRun.candidatePassed <= updatedEvalRun.baselinePassed) {
          gate.accepted = false;
          gate.reasons.push(`updated eval bundle did not improve skill signal (${updatedEvalRun.candidatePassed}/${updatedEvalRun.total} <= no-skill ${updatedEvalRun.baselinePassed}/${updatedEvalRun.total})`);
        }

        // --field hard scope: when fieldScopeIsHard, reject any candidate that
        // changed a frontmatter field other than the one named in --field.
        // This is what makes the walker's preImproveCommit / gitRevertHead
        // safety net deterministic — one field changes, one commit lands, one
        // commit reverts on regression.
        if (fieldScopeIsHard) {
          const backupSkillFile = path.join(backupDir, 'SKILL.md');
          const changedKeys = diffFrontmatterKeys(backupSkillFile, assetMetadata.skillFile);
          // Permit Health Block side effects that auto-update on a kept change
          // (version semver bump and last_changed stamp are written by callers
          // after the gate accepts, but the model itself might also touch
          // these; allowing them avoids spurious gate rejections).
          const allowed = new Set([fieldScope, 'version', 'last_changed']);
          const stray = changedKeys.filter((k) => !allowed.has(k));
          if (stray.length > 0) {
            gate.accepted = false;
            gate.reasons.push(`--field ${fieldScope} hard scope violated: also modified [${stray.join(', ')}]`);
          }
        }

        // Priority 4: Check for imperative conflicts with related skills
        if (gate.accepted) {
          try {
            const conflicts = checkImperativeConflicts(skillDir, skillName);
            if (conflicts.length > 0) {
              console.log(`  [warn] ${conflicts.length} imperative conflict(s) detected with related skills`);
              for (const c of conflicts.slice(0, 3)) {
                console.log(`    ${c.skill}: ${c.details.slice(0, 120)}`);
              }
              // Log but don't block — conflicts are informational, not a gate
            }
          } catch (err) {
            console.warn(`  [warn] conflict check failed: ${err.message}`);
          }
        }

        if (!gate.accepted) {
          copyDirectory(backupDir, skillDir);
        } else {
          kept = true;
        }

        // --commit: when the gate accepts AND --commit is set, atomically
        // promote the worktree change to main via fast-forward merge. This
        // gives the walker (skill-evolution-loop) a single revertable commit
        // for the Karpathy keep-or-revert safety net. Without --commit, the
        // legacy preserve-worktree-for-manual-review path is unchanged.
        if (kept && autoCommit && worktreePath && branchName) {
          const skillDirRel = path.relative(activeWorkspace, skillDir);
          try {
            commitWorktreeChange({
              worktreePath,
              // SH-6640 Break #4: fast-forward target is the skills-owning repo,
              // not the workspace — the kept skill commit belongs in the repo
              // that holds the skill files.
              mainWorkspace: skillsRepoRoot,
              branchName,
              skillName,
              fieldScope,
              skillDirRel,
            });
            // The worktree branch is now merged into main; we can drop the
            // worktree (and its branch) instead of preserving it for review.
            shouldCleanupWorktree = true;
            console.log(`  [commit] ${skillName} ${fieldScope || 'content'} → fast-forwarded to main on ${branchName}`);
          } catch (err) {
            // Surface the error but don't poison the loop — the change is
            // still kept in the worktree, just not auto-merged.
            console.warn(`  [commit] auto-commit failed for ${skillName}: ${err.message}`);
            console.warn(`  [commit] worktree preserved for manual review: ${worktreePath}`);
          }
        }

        // Priority 1: Write to health ledger
        try {
          writeHealthLedgerEntry({
            skill: skillName,
            action: 'improve_skill',
            kept,
            score: candidate ? candidate.candidatePassed / Math.max(1, candidate.total) : null,
            baselineScore: baseline ? baseline.candidatePassed / Math.max(1, baseline.total) : null,
            details: gate.reasons.join('; ').slice(0, 300),
          });
        } catch (err) {
          console.warn(`  [warn] health ledger write failed: ${err.message}`);
        }
      }

      const skillSummary = {
        skillName,
        skillDir,
        evalFile,
        seed,
        declaredEvalCount,
        beforeLines,
        afterLines,
        referenceFileCount: countReferenceFiles(skillDir),
        assetId: assetMetadata.assetId,
        ownershipMode: assetMetadata.ownershipMode,
        pilotTrack: assetMetadata.pilotTrack,
        baseline,
        candidate,
        updatedEvalRun,
        kept,
        gate,
        status: kept ? STATUS.KEPT : STATUS.DISCARDED_BY_GATE,
      };
      skillSummary.gapSuggestions = generateSkillGapSuggestions(skillSummary);
      summary.skills.push(skillSummary);
      consecutiveErrors = 0;
    } catch (error) {
      consecutiveErrors += 1;
      const errorClass = classifyInfraError(error);
      const failureSummary = {
        skillName,
        skillDir,
        evalFile,
        declaredEvalCount,
        beforeLines: 0,
        afterLines: 0,
        referenceFileCount: 0,
        kept: false,
        status: STATUS.BLOCKED_INFRA,
        error: error.message,
        error_class: errorClass,
      };
      failureSummary.gapSuggestions = generateSkillGapSuggestions(failureSummary);
      summary.skills.push(failureSummary);
      fs.writeFileSync(path.join(skillArtifactsDir, 'error.txt'), `${error.stack || error.message}\n`);
      console.error(`Skill loop failed for ${skillName} [${errorClass}]: ${error.message}`);

      // Structural errors abort immediately — all subsequent skills will fail the same way
      if (errorClass === INFRA_ERROR_CLASS.STRUCTURAL) {
        console.error(`\n⛔ Structural infra failure — aborting loop (all skills would fail identically).`);
        summary.abortReason = `Structural failure: ${error.message}`;
        break;
      }

      if (consecutiveErrors >= FAIL_FAST_THRESHOLD) {
        console.error(`\n⛔ ${FAIL_FAST_THRESHOLD} consecutive failures — stopping to prevent waste.`);
        summary.abortReason = `${FAIL_FAST_THRESHOLD} consecutive failures [${errorClass}]: ${error.message}`;
        break;
      }
    }
  }

  // Add counts by status for quick reporting
  summary.counts = {
    kept: summary.skills.filter((s) => s.status === STATUS.KEPT).length,
    discarded: summary.skills.filter((s) => s.status === STATUS.DISCARDED_BY_GATE).length,
    blocked_infra: summary.skills.filter((s) => s.status === STATUS.BLOCKED_INFRA).length,
    skipped: summary.skills.filter((s) => s.status === STATUS.SKIPPED_NO_EVALS).length,
  };

  // Preserve the worktree for manual review when there is unmerged kept work.
  // With --commit, the kept changes have already been fast-forwarded onto
  // main per skill, so the worktree is redundant and gets cleaned up.
  if (apply && summary.counts.kept > 0 && !autoCommit) {
    shouldCleanupWorktree = false;
  }

  const summaryFile = path.join(artifactsRoot, 'summary.json');
  fs.writeFileSync(summaryFile, `${JSON.stringify(summary, null, 2)}\n`);
  const reportFile = path.join(artifactsRoot, 'report.md');
  fs.writeFileSync(reportFile, `${renderCycleReport(summary)}\n`);
  console.log(`\nSummary saved to ${summaryFile}`);
  console.log(`Report saved to ${reportFile}`);

  // Store exit code — do NOT call process.exit() inside try block.
  // process.exit() bypasses finally blocks in Node.js, which would
  // skip worktree cleanup and leak worktrees on every failed skill.
  return determineLoopExitCode(summary, {
    requireKept: Boolean(args['require-kept']),
  });

  } finally {
    cleanupWorktree();
  }
}

if (require.main === module) {
  const exitCode = main();
  if (exitCode) {
    process.exit(exitCode);
  }
}

module.exports = {
  parseArgs,
  collectSkillDirs,
  buildBranchName,
  renderPrompt,
  determineLoopExitCode,
  resolveSkillTier,
  // Exposed for unit-testability of the --field hard-scope gate.
  diffFrontmatterKeys,
  UNDERSTANDING_FIELDS,
};
