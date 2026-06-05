'use strict';

// ─── Live production deps for the multi-agent PANEL ENRICH orchestrator ───────
//
// run-panel-enrich.js is pure orchestration. THIS module is its production `deps`,
// SELF-CONTAINED in skill-graph (no workspace dispatch-solver dependency — Skill Graph
// SYSTEM work lives in skill-graph/). It COMPOSES the proven 2-frontier live deps
// (enrich-live-deps.js) for the mandatory claim/propose/curate/eval/apply path and adds
// the panel operations for ALL tiers, dispatching each model's CLI directly.
//
// PROPOSAL DELIVERY (the part that must be robust): every tier — mandatory AND advisory —
// delivers its proposal the SAME way: the model WRITES the proposal file to a known
// artifact path, and we VERIFY the file exists + is non-empty (exactly the frontier
// contract in enrich-live-deps.researchAndPropose). There is NO stdout-extraction of skill
// content — an agent that doesn't write the file is a recorded failure, never a silent
// empty/malformed skill. (This is the gap the pilot exposed and the user flagged.)
//   - frontier (opus/codex): reuse base.researchAndPropose (claude/codex, OS-fenced).
//   - advisory (gemini/opencode): dispatch the model's CLI WRITE-capable, instruct it to
//     write proposalPath, verify. gemini → --yolo; opencode → spawnSync (stdin ignored,
//     empty --dir outside the repo per the documented hang gotcha), agent `build`.
//
// CROSS-REVIEW feedback is ephemeral structured signal (keep/wrong/missing), not skill
// content — it is captured from stdout and JSON-parsed; a malformed block just drops that
// reviewer's feedback for the round (never corrupts a skill).
//
// Dry-run replaces all dispatch with deterministic offline stubs so the WHOLE panel path
// runs in CI. Private-content fence (public skill-graph + skills tree + web) on every path.

const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const { execFileSync, spawnSync } = require('child_process');

const {
  createLiveEnrichDeps,
  sanitizeModelForFilename,
  proposalPaths,
  loadEnrichPromptTemplate,
  buildClaudeEnrichArgs,
  buildCodexEnrichArgs,
  buildGeminiEnrichArgs,
  buildOpencodeEnrichArgs,
  cliForModel,
} = require('./enrich-live-deps');
const { assertPublicScope, defaultPublicRoots } = require('./public-content-fence');

let _modelProvider = null;
function modelProvider() {
  if (!_modelProvider) _modelProvider = require('../audit-shared/model-provider');
  return _modelProvider;
}

function resolveBackend(model) {
  try { return modelProvider().resolveModelDescriptor(model); }
  catch (_) { return { backend: cliForModel(model) === 'codex' ? 'codex' : 'claude', modelId: undefined }; }
}

function hashFile(p) { return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'); }

// Extract the LAST fenced ```json block (tolerant). Returns null if none parses.
function parseLastJsonBlock(text) {
  if (!text) return null;
  const re = /```json\s*([\s\S]*?)```/g;
  let m; let last = null;
  while ((m = re.exec(text)) !== null) last = m[1];
  if (last == null) {
    const i = text.lastIndexOf('{');
    if (i === -1) return null;
    last = text.slice(i);
  }
  try { return JSON.parse(last.trim()); } catch (_) { return null; }
}

function loadPromptTemplate(skillGraphRoot, name) {
  return fs.readFileSync(path.join(skillGraphRoot, 'prompts', name), 'utf8');
}

/**
 * Build the panel live deps. See module header.
 * @param {object} options
 * @param {string} options.skillGraphRoot
 * @param {string} [options.curatorModel]
 * @param {boolean}[options.dryRun]
 * @param {Function}[options.dispatch]   shell-out override for the FRONTIER claude/codex path (enrich-live-deps).
 * @param {Function}[options.advisoryDispatch]  override for advisory CLI dispatch: ({backend, cli, args, cwd, exploreDir, mode}) => {ok, stdout}. Tests inject this.
 * @param {number} [options.advisoryTimeoutMs]  per-advisory dispatch timeout (default 20m).
 */
function createPanelEnrichDeps(options = {}) {
  const skillGraphRoot = options.skillGraphRoot ? path.resolve(options.skillGraphRoot) : process.cwd();
  const dryRun = Boolean(options.dryRun);
  const advisoryTimeoutMs = Number(options.advisoryTimeoutMs || 20 * 60 * 1000);
  const roots = defaultPublicRoots({ skillGraphRoot });
  const fence = (p, label) => assertPublicScope(p, { roots, label });

  const base = createLiveEnrichDeps({
    skillGraphRoot, curatorModel: options.curatorModel, dryRun, dispatch: options.dispatch,
  });

  let enrichTemplate = null;
  const getEnrichTemplate = () => {
    if (enrichTemplate == null) enrichTemplate = loadEnrichPromptTemplate(skillGraphRoot);
    return enrichTemplate;
  };

  function hashProposal(p) { try { return hashFile(p); } catch (_) { return `missing:${p}`; } }

  function advisoryRunDir({ skill, model, artifactsDir }) {
    return artifactsDir || path.join(skillGraphRoot, '.opencode', 'progress', 'skill-audits', skill, 'runs', `advisory--${sanitizeModelForFilename(model)}`);
  }

  // The single advisory shell-out indirection (tests inject options.advisoryDispatch).
  // mode 'write' = the model writes a file (we verify after); mode 'text' = capture stdout.
  // Returns { ok, stdout }. Never throws here — callers wrap.
  const advisoryDispatch = options.advisoryDispatch || (({ backend, cli, args, cwd, exploreDir }) => {
    if (backend === 'opencode') {
      // opencode run blocks on stdin w/o a TTY and explores a real --dir → spawnSync with
      // stdin IGNORED and an empty --dir OUTSIDE the repo (memory: opencode-run-from-node).
      const r = spawnSync(cli, args, {
        cwd, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8',
        maxBuffer: 32 * 1024 * 1024, timeout: advisoryTimeoutMs,
      });
      const stdout = (r.stdout || '') + (r.stderr ? `\n--- stderr ---\n${r.stderr}` : '');
      return { ok: r.status === 0 || (r.status == null && !r.error), stdout };
    }
    // gemini / claude / codex: execFileSync is fine (prompt is in args; no stdin block).
    try {
      const out = execFileSync(cli, args, { cwd, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, timeout: advisoryTimeoutMs }).toString();
      return { ok: true, stdout: out };
    } catch (e) {
      return { ok: false, stdout: `${(e && e.stdout) || ''}\n${(e && e.stderr) || ''}` };
    }
  });

  // Build CLI args for ANY tier's model. Returns { cli, args, backend, exploreCleanup }.
  function buildArgsFor(model, prompt, { runDirAbs } = {}) {
    const desc = resolveBackend(model);
    const backend = desc.backend;
    if (backend === 'gemini') {
      return { backend, cli: 'gemini', args: buildGeminiEnrichArgs(prompt, { modelId: desc.modelId }) };
    }
    if (backend === 'opencode') {
      // opencode AUTO-REJECTS access to any "external directory" outside its --dir/cwd
      // (probe 2026-06-05: minimax rejected reading the skills tree AND could not write the
      // run-dir proposal because both were external). So --dir MUST be the run dir itself —
      // then writing the proposal into it is INTERNAL and allowed. The skill body is embedded
      // inline in the prompt, so no external read is needed. (No fresh temp dir to clean up.)
      const exploreDir = runDirAbs || fs.mkdtempSync(path.join(os.tmpdir(), 'oc-explore-'));
      return { backend, cli: 'opencode', args: buildOpencodeEnrichArgs(prompt, { modelId: desc.modelId, exploreDir }) };
    }
    if (backend === 'codex' || cliForModel(model) === 'codex') {
      return { backend: 'codex', cli: 'codex', args: buildCodexEnrichArgs(prompt, { model: desc.modelId, writableRoots: runDirAbs ? [runDirAbs] : [], osFenceActive: false }) };
    }
    return { backend: 'claude', cli: 'claude', args: buildClaudeEnrichArgs(prompt, { model }) };
  }

  // Build a SANDBOX-CORRECT advisory prompt (verified by interviewing minimax 2026-06-05T11:08):
  // (1) inline the skill body + brief so NO external file read is needed (opencode auto-rejects
  // external_directory reads); (2) instruct a RELATIVE-filename write into the working dir
  // (--dir for opencode / cwd for gemini = the run dir), so it lands exactly at proposalPath
  // (absolute paths outside --dir trigger external_directory rejection); (3) forbid external
  // access explicitly. This is why we do NOT use buildEnrichPrompt for advisory (that one
  // instructs an absolute write + a "read the skill files" SETUP step).
  function buildAdvisoryPrompt({ skill, model, brief, skillBody, relativeFilename }) {
    return `${getEnrichTemplate()}

---
SKILL: ${skill}
MODEL: ${model} (advisory)

RESEARCH BRIEF (inline — everything you need is here):
${brief || '(none)'}

CURRENT SKILL.md (enrich THIS — the full body is inline below):

${skillBody}

DELIVERY — sandbox rules (REQUIRED):
- Write your FULL enriched proposed SKILL.md to a file named \`${relativeFilename}\` in your CURRENT WORKING DIRECTORY (a RELATIVE path — never an absolute path, never a directory outside your working dir).
- The current SKILL.md body and brief above are everything you need: do NOT read, glob, or fetch any external file. This is a pure text-transformation + (optional, if your tools allow it) web-research task.
- After writing the file, you are done.`;
  }

  // Dispatch an ADVISORY model to WRITE proposalPath (via a relative filename in its working
  // dir); verify it exists + non-empty. Never throws.
  function dispatchWriteProposal({ skill, skillDir, model, brief, runDirAbs, proposalPath, noveltyMemoPath }) {
    try {
      fence(skillDir, `panel skillDir for ${skill}`);
      fence(runDirAbs, `panel run dir for ${skill}/${model}`);
      fs.mkdirSync(runDirAbs, { recursive: true });
      const canonicalSkillPath = fence(path.join(skillDir, 'SKILL.md'), `panel read SKILL.md for ${skill}`);
      const skillBody = fs.existsSync(canonicalSkillPath) ? fs.readFileSync(canonicalSkillPath, 'utf8') : '';
      const relativeFilename = path.basename(proposalPath); // lands at runDirAbs/<basename> = proposalPath
      const prompt = buildAdvisoryPrompt({ skill, model, brief, skillBody, relativeFilename });
      const { cli, args, backend, exploreCleanup } = buildArgsFor(model, prompt, { runDirAbs });
      // opencode: --dir=runDirAbs controls the write scope (cwd stays skill-graph). gemini:
      // it writes relative to cwd, so cwd MUST be the run dir.
      const cwd = backend === 'gemini' ? runDirAbs : skillGraphRoot;
      const res = advisoryDispatch({ backend, cli, args, cwd, mode: 'write' });
      if (exploreCleanup) exploreCleanup();
      try { fs.writeFileSync(path.join(runDirAbs, `${skill}.${sanitizeModelForFilename(model)}.dispatch.log`), String(res.stdout || '')); } catch (_) {}
      const wrote = fs.existsSync(proposalPath) && fs.statSync(proposalPath).size > 0;
      if (!wrote) return { ok: false, error: `${model} did not write a non-empty proposal at ${proposalPath} (relative target '${relativeFilename}' in working dir; dispatch ok=${res.ok})` };
      return { ok: true, proposalPath, noveltyMemoPath };
    } catch (e) { return { ok: false, error: e.message }; }
  }

  // Dispatch a model for TEXT (cross-review). Capture stdout. Never throws.
  function dispatchTextOnly({ model, prompt, runDirAbs }) {
    try {
      const { cli, args, backend, exploreCleanup } = buildArgsFor(model, prompt, { runDirAbs });
      const res = advisoryDispatch({ backend, cli, args, cwd: skillGraphRoot, mode: 'text' });
      if (exploreCleanup) exploreCleanup();
      return { ok: res.ok, stdout: res.stdout || '' };
    } catch (e) { return { ok: false, stdout: '', error: e.message }; }
  }

  // ── advisory slot (best-effort) ──
  function claimAdvisorySlot({ skill, model }) {
    try { return { ...base.claimSlot({ skill, model }), ok: true }; }
    catch (e) {
      const runDirAbs = advisoryRunDir({ skill, model });
      try { fs.mkdirSync(runDirAbs, { recursive: true }); return { run_id: null, artifactsDir: runDirAbs, ok: true }; }
      catch (e2) { return { ok: false, error: `${e.message}; ${e2.message}` }; }
    }
  }

  // ── advisory research + propose (write-to-path, verified) ──
  function researchAndProposeAdvisory({ skill, skillDir, model, brief, artifactsDir }) {
    const runDirAbs = advisoryRunDir({ skill, model, artifactsDir });
    const { proposalPath, noveltyMemoPath } = proposalPaths(runDirAbs, skill, model);
    if (dryRun) {
      try {
        fs.mkdirSync(runDirAbs, { recursive: true });
        fs.writeFileSync(proposalPath, `# DRY-RUN advisory proposal for ${skill} (${model})\n`);
        fs.writeFileSync(noveltyMemoPath, `# DRY-RUN advisory memo (${model})\n`);
        return { ok: true, proposalPath, noveltyMemoPath };
      } catch (e) { return { ok: false, error: e.message }; }
    }
    return dispatchWriteProposal({ skill, skillDir, model, brief, runDirAbs, proposalPath, noveltyMemoPath });
  }

  // ── cross-review (text → feedback split by target) ──
  function crossReview({ skill, reviewerModel, reviewerTier, ownProposalPath, otherProposals, round, artifactsDir }) {
    try {
      const runDirAbs = artifactsDir || advisoryRunDir({ skill, model: reviewerModel });
      if (dryRun) return { ok: true, feedback: [] };
      const own = fs.existsSync(ownProposalPath) ? fs.readFileSync(ownProposalPath, 'utf8') : '';
      const others = (otherProposals || []).map((o) => {
        const b = (o.proposalPath && fs.existsSync(o.proposalPath)) ? fs.readFileSync(o.proposalPath, 'utf8') : '';
        return `### proposal by ${o.model} (${o.tier})\n\n${b}`;
      }).join('\n\n');
      const template = loadPromptTemplate(skillGraphRoot, 'skill-audit-loop-cross-review-pass.md');
      const prompt = `${template}\n\n---\nSKILL: ${skill}\nREVIEWER: ${reviewerModel} (${reviewerTier})\nROUND: ${round}\n\nYOUR OWN PROPOSAL:\n\n${own}\n\nOTHER PROPOSALS TO REVIEW:\n\n${others}\n`;
      const res = dispatchTextOnly({ model: reviewerModel, prompt, runDirAbs });
      if (!res.ok) return { ok: false, error: res.error || 'cross-review dispatch failed' };
      try { fs.writeFileSync(path.join(runDirAbs, `${skill}.${sanitizeModelForFilename(reviewerModel)}.review-r${round}.md`), res.stdout); } catch (_) {}
      const parsed = parseLastJsonBlock(res.stdout);
      const reviews = (parsed && Array.isArray(parsed.reviews)) ? parsed.reviews : [];
      const feedback = reviews.map((rv) => ({ reviewerModel, reviewerTier, targetModel: rv.targetModel, round, items: Array.isArray(rv.items) ? rv.items : [] }));
      return { ok: true, feedback };
    } catch (e) { return { ok: false, error: e.message }; }
  }

  // ── revise (write-to-path, verified; reports changed via hash) ──
  function reviseProposal({ skill, skillDir, reviserModel, reviserTier, ownProposalPath, feedbackForMe, round, artifactsDir }) {
    try {
      const runDirAbs = artifactsDir || advisoryRunDir({ skill, model: reviserModel });
      const before = hashProposal(ownProposalPath);
      if (dryRun || !feedbackForMe || feedbackForMe.length === 0) {
        return { ok: true, proposalPath: ownProposalPath, contentHash: before, changed: false };
      }
      const own = fs.existsSync(ownProposalPath) ? fs.readFileSync(ownProposalPath, 'utf8') : '';
      const fb = JSON.stringify(feedbackForMe, null, 2);
      const template = loadPromptTemplate(skillGraphRoot, 'skill-audit-loop-revise-pass.md');
      const prompt = `${template}\n\n---\nSKILL: ${skill}\nREVISER: ${reviserModel} (${reviserTier})\nROUND: ${round}\n\nYOUR CURRENT PROPOSAL (at ${ownProposalPath}):\n\n${own}\n\nFEEDBACK ADDRESSED TO YOU:\n\n${fb}\n\nOVERWRITE the proposal file at ${ownProposalPath} with your revision (leave it byte-identical if nothing should change), then emit the revise JSON block.\n`;
      // Revise WRITES the proposal file (write-to-path). Verify + hash for convergence.
      const canonicalSkillPath = fence(path.join(skillDir, 'SKILL.md'), `revise read SKILL.md for ${skill}`);
      const skillBody = fs.existsSync(canonicalSkillPath) ? fs.readFileSync(canonicalSkillPath, 'utf8') : '';
      const fullPrompt = `${prompt}\n\n(reference current canonical SKILL.md:)\n${skillBody}`;
      const { cli, args, backend, exploreCleanup } = buildArgsFor(reviserModel, fullPrompt, { runDirAbs });
      const res = advisoryDispatch({ backend, cli, args, cwd: skillGraphRoot, mode: 'write' });
      if (exploreCleanup) exploreCleanup();
      try { fs.writeFileSync(path.join(runDirAbs, `${skill}.${sanitizeModelForFilename(reviserModel)}.revise-r${round}.log`), String(res.stdout || '')); } catch (_) {}
      const after = hashProposal(ownProposalPath);
      const meta = parseLastJsonBlock(res.stdout) || {};
      return { ok: true, proposalPath: ownProposalPath, contentHash: after, changed: after !== before || meta.changed === true };
    } catch (e) { return { ok: false, error: e.message }; }
  }

  return {
    buildResearchBrief: base.buildResearchBrief,
    claimSlot: base.claimSlot,
    releaseSlot: base.releaseSlot,
    researchAndPropose: base.researchAndPropose,
    curate: base.curate,
    prepareEnrichedEval: base.prepareEnrichedEval,
    applyMerge: base.applyMerge,
    evalArtifactExists: base.evalArtifactExists,
    hashProposal,
    claimAdvisorySlot,
    researchAndProposeAdvisory,
    crossReview,
    reviseProposal,
  };
}

module.exports = {
  createPanelEnrichDeps,
  parseLastJsonBlock,
  hashFile,
  resolveBackend,
};
