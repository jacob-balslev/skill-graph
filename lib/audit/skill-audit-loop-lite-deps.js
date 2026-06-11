'use strict';

// ─── Live production deps for the bidirectional Skill Audit Loop runner ──────
//
// run-skill-audit-loop-lite.js is pure orchestration (sequencing + anti-loss +
// keep-or-revert) and takes its live operations via dependency injection so the
// logic stays unit-testable and the curation step stays an editorial frontier-model
// act, not a deterministic script. THIS module is the production `deps` object: it
// shells the workspace claim system (scripts/skill/skill-audit-claim.js) and the
// claude/codex CLIs to actually claim slots, dispatch each frontier model's curate
// pass (research repo+web, tools ON, privacy-scoped), run the union-curate merge, and
// revert.
//
// Design contract:
//   - The pure seams (arg builders, claim-output parser, prompt assembly, proposal
//     path resolution) are exported and unit-tested.
//   - Every shell-out goes through ONE injectable `dispatch` indirection. The default
//     is the real CLI; a stub lets `--dry-run` exercise the WHOLE orchestrator path
//     (claim → propose → curate → anti-loss → eval-skip → keep) offline, without
//     burning tokens or mutating a real SKILL.md. That is how the wiring is verified
//     in CI; the live multi-model pilot verifies the actual LLM dispatch.
//   - Private-content boundary (HARD): the curate pass prompt + claim filter fence
//     research to the public skill-graph + skills tree + web. See
//     docs/skill-audit-loop-philosophy.md and memory skill-graph-private-content-boundary.

const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const { resolveModelDescriptor } = require('../audit-shared/model-provider');

const { buildResearchBrief } = require('./skill-improvement-helpers');
const { assertPublicScope, defaultPublicRoots, assertSkillPublishableForExternalLane } = require('./public-content-fence');
const { prepareOsFence, resolveOsFenceEnabled } = require('./isolated-checkout');
const { envForCli } = require('./model-cli-home');

// ── Workspace + script resolution (standalone-safe) ───────────────────────────
//
// skill-audit-claim.js lives in the workspace orchestration tree (~/Development/
// scripts/skill/), a sibling of the skill-graph repo. Resolve it via env override
// first, then the default sibling path, so a developer who clones elsewhere can point
// it without editing code. We never assume the monorepo exists silently — a missing
// claim script is surfaced when claimSlot actually runs (not at module load).
function resolveWorkspaceRoot({ skillGraphRoot, workspaceRoot } = {}) {
  if (workspaceRoot) return path.resolve(workspaceRoot);
  if (process.env.SKILL_AUDIT_WORKSPACE) return path.resolve(process.env.SKILL_AUDIT_WORKSPACE);
  const sgRoot = skillGraphRoot ? path.resolve(skillGraphRoot) : process.cwd();
  // skill-graph repo root → its parent is the Development workspace root.
  return path.resolve(sgRoot, '..');
}

function claimScriptPath(workspaceRoot) {
  return path.join(workspaceRoot, 'scripts', 'skill', 'skill-audit-claim.js');
}

// ── Claim args + output parsing ───────────────────────────────────────────────
// These return the claim-script SUBCOMMAND args (no script path) — the caller runs
// them as `node <skill-audit-claim.js> <args...>`.
//
// SH-6687: per-model curate PROPOSE slots claim an AUDIT op (each model independently
// proposes, like an audit pass) — NOT merge. The single curator MERGE lock (`--op merge`)
// is claimed separately by the curate step. Claiming both propose slots as `merge` (the
// old default) made them contend for the one curator lock.
function buildClaimArgs({ skill, model, op = 'audit', lane }) {
  if (!skill) throw new Error('buildClaimArgs: skill is required');
  const args = ['claim', skill, '--op', op, '--json'];
  if (model) { args.push('--model', model); }
  if (lane) { args.push('--lane', lane); }
  return args;
}

function buildReleaseArgs({ skill, model, status = 'completed' }) {
  if (!skill) throw new Error('buildReleaseArgs: skill is required');
  const args = ['release', skill, '--status', status];
  if (model) { args.push('--model', model); }
  return args;
}

/**
 * Parse the JSON line emitted by `skill-audit-claim.js claim ... --json`.
 * Shape: { claimed, by, lane, op, run_id, model, audit_run_dir }.
 * @returns {{ run_id: string|null, artifactsDir: string|null }}
 */
function parseClaimOutput(stdout) {
  if (!stdout || typeof stdout !== 'string') {
    throw new Error('parseClaimOutput: empty claim output (slot not claimed)');
  }
  // The claim CLI may print a leading non-JSON line in some shells; take the last
  // JSON object on stdout.
  const line = stdout.trim().split('\n').reverse().find((l) => l.trim().startsWith('{'));
  if (!line) throw new Error(`parseClaimOutput: no JSON object in claim output: ${stdout.slice(0, 200)}`);
  let obj;
  try { obj = JSON.parse(line); } catch (e) { throw new Error(`parseClaimOutput: invalid JSON: ${e.message}`); }
  if (obj.claimed === false || obj.error) {
    throw new Error(`parseClaimOutput: claim refused: ${obj.reason || obj.error || JSON.stringify(obj)}`);
  }
  return { run_id: obj.run_id || null, artifactsDir: obj.audit_run_dir || null };
}

// ── Proposal artifact paths ───────────────────────────────────────────────────
//
// Per the curate-pass prompt: each model writes to
//   <run-dir>/<slug>.<model>.proposed-SKILL.md
//   <run-dir>/<slug>.<model>.novelty-memo.md
// and the curator writes the merged SKILL.md + merge-ledger v2 JSON.
function sanitizeModelForFilename(model) {
  return String(model || 'model').replace(/[^A-Za-z0-9._-]/g, '-');
}
function proposalPaths(runDirAbs, skill, model) {
  const m = sanitizeModelForFilename(model);
  return {
    proposalPath: path.join(runDirAbs, `${skill}.${m}.proposed-SKILL.md`),
    noveltyMemoPath: path.join(runDirAbs, `${skill}.${m}.novelty-memo.md`),
  };
}
function mergePaths(runDirAbs, skill) {
  return {
    mergedSkillPath: path.join(runDirAbs, `${skill}.merged-SKILL.md`),
    mergeLedgerPath: path.join(runDirAbs, `${skill}.merge-ledger.json`),
  };
}

// ── Improve-pass prompt assembly ───────────────────────────────────────────────
//
// Load the per-model curate-pass runner prompt (the fenced block) and append the
// run-specific brief + explicit output paths. The template is byte-identical across
// models (lockstep) — only the brief/paths differ per run, never per provider.
function loadEnrichPromptTemplate(skillGraphRoot) {
  const file = path.join(skillGraphRoot, 'prompts', 'skill-audit-loop-improve-pass.md');
  const raw = fs.readFileSync(file, 'utf8');
  // Extract the first fenced ``` ... ``` block (the actual operator prompt).
  const m = raw.match(/```[^\n]*\n([\s\S]*?)\n```/);
  return m ? m[1].trim() : raw;
}

function buildEnrichPrompt({ template, skill, skillDir, model, brief, skillBody, proposalPath, noveltyMemoPath }) {
  const parts = [
    template,
    '',
    '─── THIS RUN ───',
    `Skill: ${skill}`,
    `Skill directory: ${skillDir}`,
    `Your model role: ${model}`,
    '',
    'RESEARCH BRIEF (related-skill context, reference URLs, prior feedback):',
    brief && brief.trim() ? brief : '(no brief produced — research the repo + web from scratch)',
  ];
  // Embed the current SKILL.md so a model whose write-sandbox is scoped to the public
  // skill-graph repo (e.g. codex --sandbox workspace-write, cwd = skill-graph) can
  // curate WITHOUT filesystem access to the sibling skills tree — and so the codex
  // sandbox never needs to widen to reach (and risk) the private workspace.
  if (skillBody && skillBody.trim()) {
    parts.push(
      '',
      'CURRENT CANONICAL SKILL.md (embedded — you do NOT need filesystem access to it; this IS the skill to curate):',
      '```markdown',
      skillBody,
      '```',
    );
  }
  parts.push(
    '',
    'WRITE YOUR OUTPUT TO EXACTLY THESE PATHS (do NOT edit the canonical SKILL.md):',
    `  - Proposed curated skill / changeset: ${proposalPath}`,
    `  - Novelty memo + dissent + completeness: ${noveltyMemoPath}`,
  );
  return parts.join('\n');
}

function buildCuratePrompt({ skill, proposals, advisoryProposals = [], crossReview = [], currentSkillPath, mergedSkillPath, mergeLedgerPath, mergeProtocolRef }) {
  const proposalLines = proposals.map((p) => `  - ${p.model} [MANDATORY]: ${p.proposalPath}  (novelty: ${p.noveltyMemoPath})`).join('\n');
  const advisoryLines = advisoryProposals.length
    ? advisoryProposals.map((p) => `  - ${p.model} [ADVISORY]: ${p.proposalPath}  (novelty: ${p.noveltyMemoPath})`).join('\n')
    : '  - (none)';
  const crossReviewText = crossReview && crossReview.length ? JSON.stringify(crossReview, null, 2) : '[]';
  return [
    'You are the CURATOR for a multi-model Skill Audit Loop merge. Read the union-curate merge',
    `protocol: ${mergeProtocolRef}. The objective is CURATION — the UNION of valuable`,
    'knowledge from BOTH mandatory proposals, EVERY advisory proposal, cross-review feedback,',
    'and the current skill. Anti-loss: every contribution is',
    'KEPT, or dropped ONLY with a recorded reason (wrong / redundant / harmful). NEVER',
    'drop knowledge because "it did not move a score" — that reason is forbidden.',
    '',
    'Coverage requirement:',
    '- Every MANDATORY proposal model MUST appear in the merge-ledger as surfaced_by,',
    '  corroborated_by, or accepted_by on at least one contribution.',
    '- Every ADVISORY proposal model MUST also appear in the merge-ledger. Advisory content',
    '  is discretionary, but silence is not allowed: if nothing from an advisor is useful,',
    '  write a dropped contribution with surfaced_by:<that model> and drop_reason naming',
    '  why it is wrong, redundant, or harmful.',
    '- Every cross-review keep/wrong/missing signal you rely on must be represented or',
    '  rejected with a reason in the ledger.',
    '',
    `Skill: ${skill}`,
    `Current canonical SKILL.md: ${currentSkillPath}`,
    'MANDATORY proposals to union (read each, plus its novelty memo):',
    proposalLines,
    '',
    'ADVISORY proposals to consider and disposition (read each, plus its novelty memo):',
    advisoryLines,
    '',
    'Cross-review feedback to consider and disposition:',
    crossReviewText,
    '',
    'WRITE EXACTLY:',
    `  - The curated, unioned SKILL.md: ${mergedSkillPath}`,
    `  - The merge-ledger v2 (JSON): ${mergeLedgerPath}`,
    '',
    'merge-ledger v2 JSON shape: { "contributions": [ { "id": <string>, "surfaced_by":',
    '<model>, "corroborated_by": [<model>...], "evidence_strength": "direct-file-line"|',
    '"command-output"|"external-source"|"inference", "disposition": "kept"|"dropped",',
    '"drop_reason": <string when dropped>, "format_loss": <bool> } ], "curator": <model> }',
  ].join('\n');
}

// ── CLI arg builders for the model dispatch ───────────────────────────────────
//
// Curate dispatch needs WRITE-capable tools (the model writes the proposal /
// merged file). claude: bypass interactive permission prompts in -p mode so Write/
// Bash/WebSearch run unattended. codex: workspace-write sandbox (repo read + skills
// write + network research), --skip-git-repo-check for sparse worktrees.
function buildClaudeEnrichArgs(prompt, { model = 'opus' } = {}) {
  return [
    '-p', prompt,
    '--model', model,
    '--output-format', 'text',
    '--permission-mode', 'bypassPermissions',
    '--no-session-persistence',
  ];
}
function buildCodexEnrichArgs(prompt, { model, writableRoots, osFenceActive } = {}) {
  // SKI-169 (Fix B): under the outer OS fence (macOS Seatbelt), codex must NOT start its
  // OWN Seatbelt sandbox (`-s workspace-write`). Nesting Seatbelt inside Seatbelt is
  // denied by the kernel (`sandbox-exec: sandbox_apply: Operation not permitted`), so a
  // self-sandboxing codex writes nothing and the run aborts. The outer fence already
  // confines BOTH reads and writes to the public roots — a strictly STRONGER boundary
  // than codex's own workspace-write (which restricts writes only, not reads) — so we
  // disable codex's inner sandbox and let the single outer Seatbelt be the boundary.
  if (osFenceActive) {
    const args = ['exec', '--skip-git-repo-check', '--dangerously-bypass-approvals-and-sandbox'];
    if (model) args.push('-m', model);
    args.push(prompt);
    return args;
  }
  // No outer fence (e.g. non-macOS): codex's own workspace-write sandbox IS the boundary.
  const args = ['exec', '--skip-git-repo-check', '-s', 'workspace-write'];
  // codex's workspace-write sandbox writes only under its cwd. The audit run dir lives
  // under the WORKSPACE audit-artifacts root (a sibling of cwd=skill-graph), so grant
  // it as an EXPLICIT extra writable root — narrowly, so the sandbox never widens to
  // the whole workspace (sibling private trees like sales-hub stay unwritable).
  if (Array.isArray(writableRoots) && writableRoots.length) {
    const roots = writableRoots.map((r) => JSON.stringify(r)).join(',');
    args.push('-c', `sandbox_workspace_write={writable_roots=[${roots}]}`);
  }
  if (model) args.push('-m', model);
  args.push(prompt);
  return args;
}
function cliForModel(model) {
  try {
    const descriptor = resolveModelDescriptor(model);
    if (descriptor && descriptor.backend) return descriptor.backend;
  } catch (_) {
    // Fall back to the historic routing heuristic below.
  }
  if (model === 'codex-current' || model === 'codex' || /gpt/i.test(model)) return 'codex';
  return 'claude'; // opus/sonnet/haiku + role aliases route to the claude CLI
}

// ── Advisory-tier arg builders (panel curate) ─────────────────────────────────
//
// Advisory free models deliver their proposal the SAME robust way frontier models do:
// they WRITE the proposal file to a known path (verified by existence), never via stdout
// extraction. These builders enable WRITE-capable tools so the model can write that file.
//
// gemini CLI: `-m <modelId> --yolo -p <prompt>` — --yolo auto-approves tool calls
// (incl. file writes) so the run is unattended. modelId is the concrete preview id.
function buildGeminiEnrichArgs(prompt, { modelId } = {}) {
  const args = [];
  if (modelId) args.push('-m', modelId);
  args.push('--yolo', '-p', prompt);
  return args;
}
// opencode CLI: `run --model <modelId> --agent plan <prompt>`. Advisory delivery is
// TEXT-CAPTURE: the model researches, then EMITS the curated SKILL.md as its final reply
// (captured from stdout via extractEnrichedDoc). We dispatch with the `plan` agent, NOT
// `build`, ON PURPOSE:
//   The `build` agent is write-capable, so its flow is research → WRITE the file. In the
//   live panel `--dir` is the skills tree made READ-ONLY by the kernel Seatbelt fence, so
//   that write EPERMs and the model returns no parseable text → failure_reason='no-document'
//   (verified 2026-06-08 on big-pickle: under `build` it produced nothing usable). The `plan`
//   agent has READ + WEB-SEARCH but NO write/edit tools, so the model CANNOT attempt the
//   doomed write — its only delivery is the final text, which is exactly what we capture.
//   Verified 2026-06-08: `opencode run --agent plan --model opencode/big-pickle` → a full
//   19 KB curated SKILL.md as text, 8 web searches (research intact), ZERO file writes. This
//   also removes the side-effect risk of a free model mutating a canonical SKILL.md.
// NOTE: opencode run blocks on stdin with no TTY and explores a real --dir, so the live
// dispatch MUST use spawnSync with stdin ignored. The --dir is appended by the caller. Do
// NOT add --pure (it strips external plugins incl. web search, demoting advisory to a
// non-researcher — violates the research mandate, docs/skill-audit-loop-philosophy.md).
// A model that web-search-loops past the timeout is a best-effort NON-BLOCKING advisory
// failure (result.json), never a reason to disable research corpus-wide.
//
// `--format json` (SKI-403 follow-up, 2026-06-11): capture the JSONL EVENT STREAM, not the
// rendered default-format stdout. Verified on opencode 1.16.2: the model's final `type:text`
// part does NOT reliably reach default-format stdout (the model researches via tool_use, then
// its text part is dropped from the rendered stream → we captured 0 bytes — the deepseek/mimo
// "captured 0b of text" advisory failures). The json event stream DOES carry the `type:text`
// parts; the dispatcher (skill-audit-loop-live-deps `advisoryDispatch`) reconstructs the
// assistant's text reply from those events (reconstructOpencodeText) so the existing text
// parsers (extractEnrichedDoc / parseLastJsonBlock) work unchanged. This is the authoritative
// delivery channel for opencode-backed advisory; default-format stdout is no longer trusted.
function buildOpencodeEnrichArgs(prompt, { modelId, agent = 'build', exploreDir } = {}) {
  // `--dangerously-skip-permissions` (SKI-404): the `build` agent's tools (read/bash/write) are
  // permission-gated, and `opencode run` is non-interactive with no TTY → it AUTO-DENIES every tool
  // call ("The user rejected permission to use this specific tool call"), so build does nothing and
  // delivers no document (verified live 2026-06-11). This flag auto-approves opencode's own tool
  // gating. It is SAFE here because the real boundary is the kernel Seatbelt fence + the public-copy
  // `--dir` (outside ws) — opencode's in-app permission prompt is redundant under that fence, and
  // private trees stay kernel-DENIED regardless. (The `plan` agent did not need this because its
  // read-only tools are pre-approved — but `plan` structurally refuses to produce the artifact.)
  const args = ['run', '--agent', agent, '--format', 'json', '--dangerously-skip-permissions'];
  if (modelId) args.push('--model', modelId);
  if (exploreDir) args.push('--dir', exploreDir);
  args.push(prompt); // positional prompt (opencode reads it as the message)
  return args;
}

/**
 * Build the production `deps` object for runSkillAuditLoopLite.
 *
 * @param {object}  options
 * @param {string}  options.skillGraphRoot      Absolute skill-graph repo root.
 * @param {string} [options.workspaceRoot]      Workspace root (defaults to the sibling of skillGraphRoot or $SKILL_AUDIT_WORKSPACE).
 * @param {string} [options.curatorModel='opus'] The curator frontier model (rotate to differ from the convener).
 * @param {string} [options.mergeProtocolRef]   Path/ref to the merge protocol for the curate prompt.
 * @param {boolean}[options.dryRun=false]       Stub the LLM dispatch (write deterministic artifacts) so the
 *                                              whole orchestrator path runs offline. Used by CI; never certifies a skill.
 * @param {Function}[options.dispatch]          Override the shell-out: ({ cli, args, cwd }) => stdout. Default = execFileSync.
 * @param {Function}[options.runEvalDirection]  The live eval direction runner (default: evaluate-skill.runEvalDirection). Omit to skip the eval guardrail.
 * @returns {object} deps for runSkillAuditLoopLite.
 */
function createSkillAuditLoopLiteDeps(options = {}) {
  const {
    skillGraphRoot,
    curatorModel = 'opus',
    mergeProtocolRef = 'skill-graph/audits/merge-protocol.md',
    dryRun = false,
    // SKI-230: run-scoped token appended to claim AGENT_IDs so a KILLED run's orphaned
    // per-model slot (and the curator merge lock) cannot block every LATER skill via the
    // one-skill-per-agent guard — each process gets a DISTINCT owner. Default = the node
    // pid (Date.now()/Math.random() are banned in these scripts and would break resume);
    // SKILL_AUDIT_RUN_TOKEN / options.runToken override for a more meaningful run id.
    runToken = process.env.SKILL_AUDIT_RUN_TOKEN || String(process.pid),
  } = options;
  if (!skillGraphRoot) throw new Error('createSkillAuditLoopLiteDeps: skillGraphRoot is required.');
  const workspaceRoot = resolveWorkspaceRoot(options);
  const modelEnv = options.modelEnv || {};
  const modelCwd = options.modelCwd ? path.resolve(options.modelCwd) : null;
  const claimScript = claimScriptPath(workspaceRoot);
  // SH-6681: the public-content fence. Every artifact path we resolve/write and every
  // skillDir we operate on must be within the public roots (skill-graph repo + skills
  // tree) — a private path (e.g. ../sales-hub) is refused IN PROCESS, before any
  // shell-out. Defense-in-depth over the prompt + claim-filter; not yet a full OS
  // sandbox of the model process (the isolated-checkout follow-up).
  const publicRoots = options.publicRoots
    || defaultPublicRoots({ skillGraphRoot, workspaceRoot, skillsRoot: options.skillsRoot });
  const fence = (p, label) => assertPublicScope(p, { roots: publicRoots, label });

  // SH-6681 (remainder): the FULL OS fence. The in-process `fence` above refuses any
  // path the orchestrator resolves; this kernel-level fence stops the spawned MODEL
  // process from reading a private workspace tree by absolute path (claude bypass-perms
  // has no sandbox; codex workspace-write restricts only writes). Default ON when the
  // OS supports it (SKILL_ENRICH_OS_FENCE=0 opts out); degrades to the in-process guard
  // on non-macOS. It engages ONLY for the real (default) dispatch: a dry-run dispatches
  // no real CLI, and an injected `dispatch` (the test/offline seam) has taken over
  // execution — the fence constrains the real execFileSync CLI, which is the live path.
  const osFence = prepareOsFence({
    workspaceRoot,
    publicRoots,
    enabled: resolveOsFenceEnabled(options.osFence) && !dryRun && !options.dispatch,
  });
  if (osFence.active) {
    // The profile file lives in a temp dir; clear it when the process exits. Guarded so
    // a process that builds many deps objects (tests) does not leak handlers — each
    // handle's cleanup is idempotent.
    process.once('exit', () => osFence.cleanup());
    // SKI-254: `exit` does not fire on a signal kill. Clean up the fence temp dir
    // on SIGINT/SIGTERM too, then re-raise so the process still terminates.
    for (const sig of ['SIGINT', 'SIGTERM']) {
      process.once(sig, () => {
        try { osFence.cleanup(); } catch (_) { /* best-effort */ }
        process.kill(process.pid, sig);
      });
    }
  }
  // Every model CLI dispatch (claude/codex) goes through the OS fence; the node claim
  // calls (runClaim) stay UNfenced — they legitimately read/write the workspace claim
  // ledger and the claim script under <ws>/scripts, which the fence denies to models.
  const dispatchModel = ({ cli, args, cwd, env }) => {
    const w = osFence.wrap(cli, args);
    return dispatch({ cli: w.cli, args: w.args, cwd: modelCwd || cwd, env: envForCli(cli, env || process.env, modelEnv) });
  };
  // Lazy: the curate-pass template is only needed for LIVE dispatch. A dry-run (CI
  // wiring path, possibly in a temp dir with no prompts/) must not require the file.
  let enrichTemplate = null;
  const getEnrichTemplate = () => {
    if (enrichTemplate == null) enrichTemplate = loadEnrichPromptTemplate(skillGraphRoot);
    return enrichTemplate;
  };

  // The single shell-out indirection. Default = real CLI; dry-run replaces it.
  const dispatch = options.dispatch || (({ cli, args, cwd, env }) => execFileSync(cli, args, {
    cwd, encoding: 'utf8', env: env || process.env, maxBuffer: 32 * 1024 * 1024,
    timeout: Number(process.env.SKILL_ENRICH_CLI_TIMEOUT_MS || 30 * 60 * 1000),
    shell: process.platform === 'win32',
  }).toString());

  // Run the claim CLI with per-slot identity. The claim script is a node script; run
  // it via `node <script> <subcommand-args...>`. AGENT_ID makes the slot owner unique
  // per slot so the per-model audit slots and the curator merge lock are distinct
  // owners (claim + release must use the SAME AGENT_ID — the lock is identity-bound).
  function runClaim(subcommandArgs, { model, agentId } = {}) {
    // SKI-230: run-scoped default owner. claim + release within ONE run share this factory
    // (same runToken) so the lock stays identity-paired; a new run gets a new owner.
    const id = agentId || `curate-${sanitizeModelForFilename(model || 'slot')}-${runToken}`;
    const env = { ...process.env, MODEL: model || '', AGENT_ID: id };
    return dispatch({ cli: 'node', args: [claimScript, ...subcommandArgs], cwd: skillGraphRoot, env });
  }

  function claimSlot({ skill, model }) {
    if (dryRun) {
      // Deterministic offline run dir so the orchestrator path is exercised end-to-end.
      const runDirAbs = path.join(skillGraphRoot, 'skill-audit-loop', 'progress', 'skill-audits', skill, 'runs', `dryrun--${sanitizeModelForFilename(model)}`);
      fs.mkdirSync(runDirAbs, { recursive: true });
      return { run_id: `dryrun-${sanitizeModelForFilename(model)}`, artifactsDir: runDirAbs };
    }
    // SH-6687: per-model PROPOSE slot = an AUDIT op (one per model), not merge.
    const out = runClaim(buildClaimArgs({ skill, model, op: 'audit' }), { model });
    const parsed = parseClaimOutput(out);
    // audit_run_dir is relative to the workspace root; make it absolute.
    const artifactsDir = parsed.artifactsDir
      ? path.resolve(workspaceRoot, parsed.artifactsDir)
      : null;
    return { run_id: parsed.run_id, artifactsDir };
  }

  function releaseSlot({ skill, model, status }) {
    if (dryRun) return;
    try { runClaim(buildReleaseArgs({ skill, model, status }), { model }); } catch (_) { /* best-effort */ }
  }

  function researchAndPropose({ skill, skillDir, model, brief, artifactsDir }) {
    const runDirAbs = artifactsDir || path.join(skillGraphRoot, 'skill-audit-loop', 'progress', 'skill-audits', skill, 'runs', sanitizeModelForFilename(model));
    // SH-6681: refuse any artifact/skill path outside the public scope before writing.
    fence(skillDir, `curate skillDir for ${skill}`);
    fence(runDirAbs, `curate run dir for ${skill}/${model}`);
    fs.mkdirSync(runDirAbs, { recursive: true });
    const { proposalPath, noveltyMemoPath } = proposalPaths(runDirAbs, skill, model);
    if (dryRun) {
      // Synthetic proposal so curate has inputs to union; never a real curation.
      fs.writeFileSync(proposalPath, `# DRY-RUN proposal for ${skill} (${model})\n\n(no LLM dispatched)\n`);
      fs.writeFileSync(noveltyMemoPath, `# DRY-RUN novelty memo (${model})\n\nAbstain — dry run.\n`);
      return { proposalPath, noveltyMemoPath };
    }
    // D2 HARD GATE: refuse a private (non-publishable) skill BEFORE any real external
    // dispatch — the mandatory propose is the panel/two-frontier lane's first external
    // call, and a thrown error here aborts the whole run (fail-closed). Dry-run is exempt
    // (it returned above without dispatching). Private skills audit only via the
    // single-model lane (prompts/skill-audit-loop-single-model.md).
    assertSkillPublishableForExternalLane(skillDir, { label: `propose mandatory ${model}` });
    // Embed the current SKILL.md so the model can curate without cross-tree filesystem
    // access (the skill lives in the sibling skills tree; codex's sandbox is scoped to
    // the public skill-graph repo). Read is fenced to the public scope.
    const canonicalSkillPath = fence(path.join(skillDir, 'SKILL.md'), `curate read SKILL.md for ${skill}`);
    const skillBody = fs.existsSync(canonicalSkillPath) ? fs.readFileSync(canonicalSkillPath, 'utf8') : '';
    const prompt = buildEnrichPrompt({ template: getEnrichTemplate(), skill, skillDir, model, brief, skillBody, proposalPath, noveltyMemoPath });
    const cli = cliForModel(model);
    const args = cli === 'codex'
      ? buildCodexEnrichArgs(prompt, { model: undefined, writableRoots: [runDirAbs], osFenceActive: osFence.active })
      : buildClaudeEnrichArgs(prompt, { model });
    // SKI-169 observability: persist the model's raw stdout/stderr to the run dir BEFORE
    // the existence check, so a leg that writes no artifact is diagnosable (previously the
    // output was captured by execFileSync and discarded, hiding the real failure).
    const dispatchLogPath = path.join(runDirAbs, `${skill}.${sanitizeModelForFilename(model)}.dispatch.log`);
    let dispatchOut = '';
    try {
      dispatchOut = dispatchModel({ cli, args, cwd: skillGraphRoot }) || '';
    } catch (e) {
      dispatchOut = `[dispatch threw] ${e.message}\n--- stdout ---\n${e.stdout || ''}\n--- stderr ---\n${e.stderr || ''}`;
    }
    try { fs.writeFileSync(dispatchLogPath, String(dispatchOut)); } catch (_) { /* best-effort log */ }
    if (!fs.existsSync(proposalPath)) {
      // Attach the dispatch output to the error so the orchestrator's rate-limit parser
      // (panel-budget.parseRateLimit) can see a 429 / usage-limit / retry-after signal that
      // lives in the model's output, not in this message string (F1).
      const e = new Error(`researchAndPropose(${model}): proposal not written at ${proposalPath} — the model did not produce the artifact. Dispatch log: ${dispatchLogPath}`);
      e.dispatchOutput = String(dispatchOut);
      throw e;
    }
    return { proposalPath, noveltyMemoPath };
  }

  function curate({ skill, skillDir, proposals, advisoryProposals = [], crossReview = [], currentSkillPath }) {
    if (currentSkillPath) fence(currentSkillPath, `curate canonical SKILL.md for ${skill}`);

    if (dryRun) {
      // Offline: write to the proposal run dir, no claim (single sequential process).
      const runDirAbs = path.dirname((proposals[0] && proposals[0].proposalPath) || path.join(skillGraphRoot, skill));
      fence(runDirAbs, `curate run dir for ${skill}`);
      const { mergedSkillPath, mergeLedgerPath } = mergePaths(runDirAbs, skill);
      // Union = current skill body + a marker; ledger keeps both proposals (anti-loss clean).
      const current = fs.existsSync(currentSkillPath) ? fs.readFileSync(currentSkillPath, 'utf8') : '';
      fs.writeFileSync(mergedSkillPath, `${current}\n<!-- DRY-RUN curated (no real merge) -->\n`);
      const ledger = {
        curator: curatorModel,
        contributions: proposals.concat(advisoryProposals).map((p, i) => ({
          id: `dryrun-${i}`, surfaced_by: p.model, corroborated_by: [],
          evidence_strength: 'inference', disposition: 'kept', format_loss: false,
        })),
      };
      fs.writeFileSync(mergeLedgerPath, JSON.stringify(ledger, null, 2));
      return { mergedSkillPath, mergeLedger: ledger, mergeLedgerPath };
    }

    // SH-6687: the curator holds the single `--merge` lock (a DISTINCT owner from the
    // per-model audit slots). Claim it, write the merged output to the merge run dir,
    // release it after. By now the per-model propose slots are already released, so the
    // merge claim has no contention.
    const curatorAgentId = `skill-audit-loop-curator-${runToken}`; // SKI-230: run-scoped
    let curatorRunDir;
    try {
      const claimOut = runClaim(buildClaimArgs({ skill, model: curatorModel, op: 'merge' }), { model: curatorModel, agentId: curatorAgentId });
      const parsed = parseClaimOutput(claimOut);
      curatorRunDir = parsed.artifactsDir
        ? path.resolve(workspaceRoot, parsed.artifactsDir)
        : path.dirname((proposals[0] && proposals[0].proposalPath) || path.join(skillGraphRoot, skill));
    } catch (e) {
      throw new Error(`curate: could not claim the curator --merge lock for ${skill}: ${e.message}`);
    }
    fence(curatorRunDir, `curate merge run dir for ${skill}`);
    fs.mkdirSync(curatorRunDir, { recursive: true }); // the real claim creates it; be robust if not
    const { mergedSkillPath, mergeLedgerPath } = mergePaths(curatorRunDir, skill);
    try {
      const prompt = buildCuratePrompt({ skill, skillDir, proposals, advisoryProposals, crossReview, currentSkillPath, mergedSkillPath, mergeLedgerPath, mergeProtocolRef });
      const cli = cliForModel(curatorModel);
      const args = cli === 'codex'
        ? buildCodexEnrichArgs(prompt, { model: undefined, writableRoots: [curatorRunDir], osFenceActive: osFence.active })
        : buildClaudeEnrichArgs(prompt, { model: curatorModel });
      dispatchModel({ cli, args, cwd: skillGraphRoot });
      if (!fs.existsSync(mergeLedgerPath)) {
        throw new Error(`curate: merge-ledger not written at ${mergeLedgerPath} — the curator did not produce the ledger.`);
      }
      const mergeLedger = JSON.parse(fs.readFileSync(mergeLedgerPath, 'utf8'));
      return { mergedSkillPath, mergeLedger, mergeLedgerPath };
    } finally {
      // Always release the curator lock, even if the merge threw.
      try { runClaim(buildReleaseArgs({ skill, model: curatorModel, status: 'completed' }), { model: curatorModel, agentId: curatorAgentId }); } catch (_) { /* best-effort */ }
    }
  }

  // SH-6686: the guardrail must grade the curated skill, not the canonical
  // pre-curation version. Build a temp skill dir whose SKILL.md is the curator's merged
  // output — the canonical skill is NOT touched here. The eval reads this temp dir.
  function prepareEnrichedEval({ skill, skillDir, mergedSkillPath }) {
    fence(skillDir, `curated-eval source skillDir for ${skill}`);
    fence(mergedSkillPath, `curated-eval merged source for ${skill}`);
    const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), `curated-${sanitizeModelForFilename(skill)}-`));
    const evalSkillDir = path.join(tmpRoot, skill);
    fs.cpSync(skillDir, evalSkillDir, { recursive: true });
    fs.copyFileSync(mergedSkillPath, path.join(evalSkillDir, 'SKILL.md'));

    // SKILL-AUDIT eval baseline fence: produce a skill-ABSENT twin of the eval dir for
    // the baseline arm. It is byte-identical to evalSkillDir (same references/, evals/)
    // EXCEPT the candidate SKILL.md is removed — so a tools-ON baseline agent cannot
    // read the answer key while keeping the rest of its research surface. The with-skill
    // arm gets the curated skill via in-prompt injection; the baseline arm must not get
    // it from disk. (See baseline-fence.js.)
    const baselineEvalSkillDir = path.join(tmpRoot, `${skill}.baseline`);
    fs.cpSync(skillDir, baselineEvalSkillDir, { recursive: true });
    const baselineSkillFile = path.join(baselineEvalSkillDir, 'SKILL.md');
    if (fs.existsSync(baselineSkillFile)) fs.rmSync(baselineSkillFile, { force: true });
    // Assertion (plan E): the baseline dir must NOT contain the candidate SKILL.md.
    if (fs.existsSync(baselineSkillFile)) {
      throw new Error(`prepareEnrichedEval: baseline eval dir still contains SKILL.md for ${skill} (${baselineSkillFile}) — fence failed.`);
    }

    return {
      evalSkillDir,
      baselineEvalSkillDir,
      cleanup: () => { try { fs.rmSync(tmpRoot, { recursive: true, force: true }); } catch (_) { /* best-effort */ } },
    };
  }

  // SH-6686: KEEP decided — apply the curated skill to the canonical working tree.
  // This is the SINGLE point the canonical skill is mutated. We never auto-commit or
  // push a public skill — the caller (CLI/operator) reviews the diff and commits. A
  // REVERT never calls this, so the canonical skill stays original (no git-revert-HEAD).
  function applyMerge({ skill, skillDir, mergedSkillPath }) {
    // Dry-run NEVER mutates a real canonical skill — report not-applied.
    if (dryRun) return { applied: null };
    const canonical = fence(path.join(skillDir, 'SKILL.md'), `applyMerge canonical SKILL.md for ${skill}`);
    fence(mergedSkillPath, `applyMerge merged source for ${skill}`);
    fs.copyFileSync(mergedSkillPath, canonical);
    return { applied: canonical };
  }

  // The eval guardrail can only grade a skill that HAS an eval artifact for the mode.
  // This predicate lets the orchestrator skip (→ keep) instead of crashing deep in
  // runApplicationEval on a missing evals/<mode>.json. (Pilot best-practice 2026-06-05:
  // 31/33 target skills have no application.json; the unconditional readFileSync threw
  // ENOENT and discarded a successful curation.) Absence of an eval is NEVER a
  // regression — the eval is a guardrail, and an ungradeable skill is KEPT.
  function evalArtifactExists({ skillDir, evalMode }) {
    const name = evalMode === 'comprehension' ? 'comprehension.json' : 'application.json';
    try { return fs.existsSync(path.join(skillDir, 'evals', name)); } catch (_) { return false; }
  }

  // hashProposal — sha256 of a file's bytes (missing file → a stable sentinel). Used by
  // the no-op curation guard (validateCurationChanged) to compare pre/post-curation SKILL.md.
  function hashProposal(p) {
    try { return `sha256:${crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')}`; }
    catch (_) { return `missing:${p}`; }
  }

  return { buildResearchBrief, claimSlot, releaseSlot, researchAndPropose, curate, prepareEnrichedEval, applyMerge, evalArtifactExists, hashProposal };
}

module.exports = {
  resolveWorkspaceRoot,
  claimScriptPath,
  buildClaimArgs,
  buildReleaseArgs,
  parseClaimOutput,
  proposalPaths,
  mergePaths,
  sanitizeModelForFilename,
  loadEnrichPromptTemplate,
  buildEnrichPrompt,
  buildCuratePrompt,
  buildClaudeEnrichArgs,
  buildCodexEnrichArgs,
  buildGeminiEnrichArgs,
  buildOpencodeEnrichArgs,
  cliForModel,
  createSkillAuditLoopLiteDeps,
};

// NOTE: `revert` (git-revert-HEAD) was removed in SH-6686. The curated skill is now
// applied to the canonical working tree ONLY on KEEP (applyMerge); a REVERT applies
// nothing, so the canonical skill is never in a state that needs reverting.
