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

// Salvage the enriched SKILL.md from a model's TEXT reply (the interview-confirmed advisory
// delivery: weak free models reliably EMIT the document as text but won't drive an agentic
// file-write). Unwraps a whole-document code fence, then starts at the YAML frontmatter (a line
// that is exactly `---`) or, failing that, the first markdown heading — discarding any "Here is…"
// preamble. Returns '' when nothing document-like is present.
function extractEnrichedDoc(raw) {
  let t = String(raw || '').replace(/\r/g, '').trim();
  if (!t) return '';
  const fence = t.match(/^```(?:markdown|md)?\s*\n([\s\S]*?)\n```$/);
  if (fence) t = fence[1].trim();
  const lines = t.split('\n');
  const fmIdx = lines.findIndex((l) => l.trim() === '---');
  if (fmIdx >= 0) return lines.slice(fmIdx).join('\n').trim();
  const hIdx = lines.findIndex((l) => /^#{1,3}\s/.test(l));
  if (hIdx >= 0) return lines.slice(hIdx).join('\n').trim();
  return t;
}

// Is the captured text actually a SKILL.md document, not a plan/summary? Real enriched skills are
// tens of KB with frontmatter and many headings; a "here's my plan" reply is short prose with
// neither. Require substance AND structure so a plan can never pass as a proposal.
function looksLikeSkillDoc(doc) {
  if (!doc) return false;
  const hasFrontmatter = /^---\n[\s\S]*?\n---\n/.test(doc);
  const headingCount = (doc.match(/^#{1,3}\s/gm) || []).length;
  // A real SKILL.md always opens with YAML frontmatter; a plan/summary never does — so
  // frontmatter + a real body is the primary signal. Fallback: a heavily-structured, substantial
  // doc with no frontmatter still counts. A short prose plan passes neither.
  if (hasFrontmatter && doc.length >= 500) return true;
  return headingCount >= 4 && doc.length >= 2000;
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
  const advisoryDispatch = options.advisoryDispatch || (({ backend, cli, args, cwd }) => {
    if (backend === 'opencode') {
      // opencode run blocks on stdin w/o a TTY → spawnSync with stdin IGNORED (memory:
      // opencode-run-from-node). Return CLEAN stdout (the model's reply text) SEPARATELY from
      // stderr (opencode banners/logs), so the caller can capture the document the model EMITS
      // as text — the interview-confirmed reliable advisory delivery (2026-06-05).
      const r = spawnSync(cli, args, {
        cwd, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8',
        maxBuffer: 32 * 1024 * 1024, timeout: advisoryTimeoutMs,
      });
      return { ok: r.status === 0 || (r.status == null && !r.error), stdout: r.stdout || '', stderr: r.stderr || '' };
    }
    // gemini / claude / codex: execFileSync is fine (prompt is in args; no stdin block).
    try {
      const out = execFileSync(cli, args, { cwd, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, timeout: advisoryTimeoutMs }).toString();
      return { ok: true, stdout: out, stderr: '' };
    } catch (e) {
      return { ok: false, stdout: (e && e.stdout) ? String(e.stdout) : '', stderr: (e && e.stderr) ? String(e.stderr) : '' };
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

  // Build the advisory prompt. The delivery contract is TEXT-OUTPUT, not file-write — settled by
  // interviewing the models 2026-06-05: weak free models (minimax/mimo) CAN write files but CHOOSE
  // to reply with a plan and never write, so an agentic file-write yields nothing. MiniMax's own
  // guidance: "outputting the full document as my text answer is more reliable than a file write…
  // use imperative wording with no softeners." So we (1) inline the skill body + brief so NO
  // external read is needed (opencode auto-rejects external_directory reads), and (2) force the
  // model to EMIT the complete enriched SKILL.md as its entire reply, which the caller captures
  // from stdout and writes itself.
  function buildAdvisoryPrompt({ skill, model, brief, skillBody }) {
    return `${getEnrichTemplate()}

---
SKILL: ${skill}
MODEL: ${model} (advisory)

RESEARCH BRIEF (inline — everything you need is here):
${brief || '(none)'}

CURRENT SKILL.md (enrich THIS — the full body is inline below):

${skillBody}

DELIVERY — OUTPUT CONTRACT (follow EXACTLY; confirmed with the model 2026-06-05):
Output the COMPLETE enriched SKILL.md as your ENTIRE reply. Start at the file's first character (the opening \`---\` frontmatter line) and stop at its last. The reply IS the document text and nothing else:
- No plan, no preamble, no "Here is…", no summary of changes, no code-fence wrapper, no trailing commentary.
- Do NOT call any tools. Do NOT write or edit files. Do NOT read, glob, or fetch any external file — everything you need is inline above.
- ENRICH the skill: add capability, precision, grounding, edge cases. NEVER strip or shorten existing content.
Reply with ONLY the complete enriched SKILL.md. Nothing else.`;
  }

  // Dispatch an ADVISORY model and CAPTURE the enriched SKILL.md from its TEXT reply, then write
  // it to proposalPath ourselves (the interview-confirmed reliable path). Falls back to a
  // model-written file if one appeared anyway. Never throws.
  function dispatchWriteProposal({ skill, skillDir, model, brief, runDirAbs, proposalPath, noveltyMemoPath }) {
    try {
      fence(skillDir, `panel skillDir for ${skill}`);
      fence(runDirAbs, `panel run dir for ${skill}/${model}`);
      fs.mkdirSync(runDirAbs, { recursive: true });
      const canonicalSkillPath = fence(path.join(skillDir, 'SKILL.md'), `panel read SKILL.md for ${skill}`);
      const skillBody = fs.existsSync(canonicalSkillPath) ? fs.readFileSync(canonicalSkillPath, 'utf8') : '';
      const prompt = buildAdvisoryPrompt({ skill, model, brief, skillBody });
      const { cli, args, backend, exploreCleanup } = buildArgsFor(model, prompt, { runDirAbs });
      // We capture stdout now, so cwd is immaterial for delivery — keep the prior values
      // (gemini=runDir, opencode/others=skill-graph) for back-compat with --dir scoping.
      const cwd = backend === 'gemini' ? runDirAbs : skillGraphRoot;
      const res = advisoryDispatch({ backend, cli, args, cwd, mode: 'text' });
      if (exploreCleanup) exploreCleanup();
      try { fs.writeFileSync(path.join(runDirAbs, `${skill}.${sanitizeModelForFilename(model)}.dispatch.log`), `${res.stdout || ''}\n--- stderr ---\n${res.stderr || ''}`); } catch (_) {}
      // PRIMARY: capture the document the model EMITTED AS TEXT and write it ourselves.
      const doc = extractEnrichedDoc(res.stdout);
      if (looksLikeSkillDoc(doc)) {
        fs.writeFileSync(proposalPath, doc.endsWith('\n') ? doc : `${doc}\n`);
        return { ok: true, proposalPath, noveltyMemoPath, via: 'stdout-capture' };
      }
      // FALLBACK: a capable model may have written the file itself.
      const wrote = fs.existsSync(proposalPath) && fs.statSync(proposalPath).size > 0;
      if (wrote) return { ok: true, proposalPath, noveltyMemoPath, via: 'file-write' };
      return { ok: false, error: `${model}: captured ${(res.stdout || '').length}b of text (not document-shaped) and no file written; dispatch ok=${res.ok}` };
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
  // Mirrors dispatchWriteProposal's delivery contract so revise is sandbox-correct for EVERY
  // tier: sandboxed advisory CLIs (gemini writes relative to cwd; opencode scopes writes to
  // --dir) get a RELATIVE-filename overwrite into the dir holding their own proposal, with the
  // current proposal + canonical body INLINED (no external read — opencode auto-rejects those);
  // frontier claude/codex keep the absolute-path overwrite they handle natively (codex via
  // writableRoots). Previously this always instructed an absolute write + cwd=skillGraphRoot,
  // which silently misdelivered for gemini (wrote into skill-graph root, not the run dir) and
  // risked opencode external_directory rejection. (Fix 2026-06-05T13:30Z — user Step 3.)
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
      // canonical body inlined so sandboxed advisory models need no external read
      const canonicalSkillPath = fence(path.join(skillDir, 'SKILL.md'), `revise read SKILL.md for ${skill}`);
      const skillBody = fs.existsSync(canonicalSkillPath) ? fs.readFileSync(canonicalSkillPath, 'utf8') : '';

      const backend = resolveBackend(reviserModel).backend;
      const sandboxed = backend === 'gemini' || backend === 'opencode';
      // The dir the relative write must land in = the dir that already holds ownProposalPath,
      // so a relative-filename overwrite lands EXACTLY on it regardless of how artifactsDir
      // was derived.
      const writeDirAbs = path.dirname(ownProposalPath);
      const relativeFilename = path.basename(ownProposalPath);

      const deliveryInstr = sandboxed
        ? `OVERWRITE the file named \`${relativeFilename}\` in your CURRENT WORKING DIRECTORY (a RELATIVE path — never an absolute path, never a directory outside your working dir). The current proposal, feedback, and canonical body above/below are everything you need: do NOT read, glob, or fetch any external file. Leave the file byte-identical if nothing should change.`
        : `OVERWRITE the proposal file at ${ownProposalPath} with your revision (leave it byte-identical if nothing should change).`;

      const prompt = `${template}\n\n---\nSKILL: ${skill}\nREVISER: ${reviserModel} (${reviserTier})\nROUND: ${round}\n\nYOUR CURRENT PROPOSAL:\n\n${own}\n\nFEEDBACK ADDRESSED TO YOU:\n\n${fb}\n\nDELIVERY (REQUIRED):\n- ${deliveryInstr}\n- After writing the file, emit the revise JSON block.\n\n(reference current canonical SKILL.md:)\n${skillBody}`;

      // Revise WRITES the proposal file (write-to-path). Verify + hash for convergence.
      // buildArgsFor wires opencode --dir / codex writableRoots to writeDirAbs.
      const { cli, args, exploreCleanup } = buildArgsFor(reviserModel, prompt, { runDirAbs: writeDirAbs });
      // gemini writes relative to cwd → cwd MUST be the write dir; everyone else stays at the
      // skill-graph root (opencode write scope is --dir; frontier writes the absolute path).
      const cwd = backend === 'gemini' ? writeDirAbs : skillGraphRoot;
      const res = advisoryDispatch({ backend, cli, args, cwd, mode: 'write' });
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
  extractEnrichedDoc,
  looksLikeSkillDoc,
  hashFile,
  resolveBackend,
};
