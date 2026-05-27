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
}) {
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
        '- Read SKILL_METADATA_PROTOCOL.md and examples/skill-metadata-template.md (schema v7 — authoritative contract plus authoring scaffold). The output MUST conform to the current protocol.',
        '- Read docs/field-reference.md for field-level semantics before changing frontmatter.',
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
        '- Read SKILL_METADATA_PROTOCOL.md and examples/skill-metadata-template.md (schema v7 — authoritative contract plus authoring scaffold). The output MUST conform to the current protocol.',
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
    ...researchChecklist,
    ...modeInstructions,
    `Audit target: ${targetFile}`,
    `Ownership mode: ${ownershipMode}${pilotTrack ? ` | pilot: ${pilotTrack}` : ''}`,
    '- Apply the current Skill Metadata Protocol contract (SKILL_METADATA_PROTOCOL.md + examples/skill-metadata-template.md):',
    '  - Core frontmatter MUST include: schema_version (8), name, description, version, subject (closed 9-enum browse shelf), deployment_target (closed 2-enum portable|project), scope (free-text PRD-style label), owner, freshness, drift_check, eval_artifacts, eval_state, routing_eval.',
    '  - Recommended routing and audit fields include keywords (<=10), subjects[] for polyhierarchy (max 2, primary first), taxonomy_domain (slash-delimited sub-classification), triggers, relations (related/boundary/verify_with/depends_on/broader/narrower/disjoint_with), grounding.subject_matter + project[] (required when deployment_target is project), comprehension_state with the five flat Understanding fields, and the Audit Status verdict fields when written by tooling.',
    '  - Do not resurrect deprecated fields. The v7 -> v8 clean cut removed: type, category, categories, secondary_categories, primaryCategory, layerPrimary, routingRole, family, layer, archetype, operation, eval_status, workspace_tags. These fail schema validation in the live tree (their authoring history is in git tag schema-v7).',
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
  --grader TYPE            Grader CLI: opencode|claude|gemini (default: opencode)
  --ownership-mode MODE    Filter to template or authored skills
  --pilot-track NAME       Filter to a named pilot track (e.g. template-owned-meta)
  --research-first         Use the research-first prompt contract
  --skills-root DIR        Skills directory (default: .claude/skills)
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
  const skillsRoot = path.resolve(args['skills-root'] || path.join(workspace, '.claude', 'skills'));
  const includeFilters = String(args.include || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  const maxSkills = args['max-skills'] ? Number(args['max-skills']) : Number.POSITIVE_INFINITY;
  const apply = Boolean(args.apply);
  const seedPreGemini = Boolean(args['seed-pre-gemini']);
  const auditTier = args['audit-tier'] || 'standard';
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
    branchName = buildBranchName(path.basename(workspace), stamp);
    worktreePath = path.join(workspace, '.claude', 'worktrees', `skill-loop-${stamp}`);
    runCommand('git', ['worktree', 'add', '-b', branchName, worktreePath, 'HEAD'], workspace);
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
      execFileSync('git', ['worktree', 'remove', '--force', worktreePath], {
        cwd: workspace, encoding: 'utf8', stdio: 'pipe',
      });
      console.log(`Cleaned up worktree: ${worktreePath}`);
    } catch (e) {
      console.warn(`Warning: failed to clean up worktree ${worktreePath}: ${e.message}`);
    }
    // Also clean up the branch if no changes were kept
    if (branchName) {
      try {
        execFileSync('git', ['branch', '-D', branchName], {
          cwd: workspace, encoding: 'utf8', stdio: 'pipe',
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

  // Use skillsRoot (respects --skills-root flag), adjusted for worktree if in apply mode
  const effectiveSkillsRoot = apply
    ? path.join(activeWorkspace, path.relative(workspace, skillsRoot))
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

  if (apply && summary.counts.kept > 0) {
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
};
