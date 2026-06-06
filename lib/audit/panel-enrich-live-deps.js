'use strict';

// ─── Live production deps for the multi-agent PANEL ENRICH orchestrator ───────
//
// run-panel-enrich.js is pure orchestration. THIS module is its production `deps`,
// SELF-CONTAINED in skill-graph (no workspace dispatch-solver dependency — Skill Graph
// SYSTEM work lives in skill-graph/). It COMPOSES the proven 2-frontier live deps
// (enrich-live-deps.js) for the mandatory claim/propose/curate/eval/apply path and adds
// the panel operations for ALL tiers, dispatching each model's CLI directly.
//
// PROPOSAL DELIVERY:
//   - frontier (opus/codex): base.researchAndPropose — the model WRITES the proposal file
//     (claude/codex, OS-fenced); verified for existence + non-empty.
//   - advisory (gemini/opencode): dispatched under the SAME kernel Seatbelt fence
//     (advisoryOsFence — public skill-graph repo + skills tree + web visible; every private tree
//     EPERM), tools ON, told to RESEARCH (repo + web) then EMIT the enriched SKILL.md as its
//     final text answer — captured from stdout (extractEnrichedDoc) and written by us, with a
//     model-written file as fallback. opencode --dir = workspace root WHEN the fence is active
//     (skill internal to its agent gate; kernel denies private), else the narrow run-dir
//     (degraded but safe); gemini → --yolo. Advisory models are full RESEARCHERS — "advisory" is
//     their DECISION role (the frontier pair curates + decides), never a capability limit. The
//     old "inline it, don't read" workaround DEMOTED advisory to inline-reasoner and violated the
//     research mandate (docs/audit-loop-enrich-philosophy.md line 35/97) — it was removed.
//
// CROSS-REVIEW feedback is ephemeral structured signal (keep/wrong/missing), not skill
// content — it is captured from stdout and JSON-parsed; a malformed block just drops that
// reviewer's feedback for the round (never corrupts a skill).
//
// Dry-run replaces all dispatch with deterministic offline stubs so the WHOLE panel path
// runs in CI. Private-content fence (public skill-graph + skills tree + web) on every path.

const path = require('path');
const fs = require('fs');
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
const { prepareOsFence, resolveOsFenceEnabled } = require('./isolated-checkout');

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

  // Advisory CLIs (opencode/gemini) get the SAME kernel Seatbelt fence the frontier path
  // already applies to claude/codex (enrich-live-deps dispatchModel). Without it the advisory
  // models could not be given real file access safely, so an earlier workaround scoped
  // opencode --dir to an empty run dir + told the model "don't read, it's inline" — which
  // DEMOTED advisory from researcher to inline-reasoner, violating the research mandate
  // (docs/audit-loop-enrich-philosophy.md line 35/97: "Research IS the curation mechanism";
  // "❌ Disabling the agents' tools or forbidding research"). The fence makes the public roots
  // visible to the model process; every private sibling is kernel-DENIED — so advisory models
  // research the repo + web exactly like the frontier pair. This is the POLICY-equivalent
  // isolated checkout (isolated-checkout.js § "Why a policy and not a physical checkout").
  //
  // TWO GRADES of public root (the source-mutation fix, 2026-06-06): the skill SOURCE trees
  // (skill-graph repo + skills library) are READ-ONLY — the model researches them but a write
  // EPERMs, so a write-capable advisory model physically CANNOT mutate a canonical SKILL.md
  // (the incident: a model wrote its proposal straight into skills/.../SKILL.md). The ONLY
  // writable workspace targets are the audit run-dir trees: <ws>/.opencode/progress/skill-audits
  // (the loop's claim run dirs) and <skill-graph>/.opencode/progress (the Agent-tool primitives'
  // run dirs — nested inside the read-only skill-graph root, re-allowed for write by SBPL
  // last-match). Propose delivers via stdout text-capture (the model writes nothing); revise
  // writes its own proposal into the run dir. Source is never a writable target on either path.
  const workspaceRoot = path.resolve(skillGraphRoot, '..');
  const advisorySourceRoots = [skillGraphRoot, path.join(workspaceRoot, 'skills')];
  const advisoryWritableRoots = [
    path.join(workspaceRoot, '.opencode', 'progress', 'skill-audits'),
    path.join(skillGraphRoot, '.opencode', 'progress'),
  ];
  const advisoryOsFence = prepareOsFence({
    workspaceRoot,
    readOnlyRoots: advisorySourceRoots,
    publicRoots: advisoryWritableRoots,
    enabled: resolveOsFenceEnabled(options.osFence) && !dryRun && !options.advisoryDispatch,
  });
  if (advisoryOsFence.active) {
    process.once('exit', () => { try { advisoryOsFence.cleanup(); } catch (_) { /* best-effort */ } });
  }

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
    // Kernel-fence the model process: only the public roots are readable; private trees EPERM.
    // No-op when the fence is inactive (non-macOS / opted out) — degrades to the in-process
    // path guard, same as the frontier path.
    const w = advisoryOsFence.wrap(cli, args);
    const fcli = w.cli;
    const fargs = w.args;
    if (backend === 'opencode') {
      // opencode run blocks on stdin w/o a TTY → spawnSync with stdin IGNORED (memory:
      // opencode-run-from-node). Return CLEAN stdout (the model's reply text) SEPARATELY from
      // stderr (opencode banners/logs/tool traces), so the caller captures the document the
      // model EMITS as its final text answer.
      const r = spawnSync(fcli, fargs, {
        cwd, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8',
        maxBuffer: 32 * 1024 * 1024, timeout: advisoryTimeoutMs,
      });
      return { ok: r.status === 0 || (r.status == null && !r.error), stdout: r.stdout || '', stderr: r.stderr || '' };
    }
    // gemini / claude / codex: execFileSync is fine (prompt is in args; no stdin block).
    try {
      const out = execFileSync(fcli, fargs, { cwd, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, timeout: advisoryTimeoutMs }).toString();
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
      // opencode's `build` agent AUTO-REJECTS reads of any "external directory" outside its
      // --dir (probe 2026-06-05: it rejected reading the skills tree, which lives outside an
      // empty run-dir --dir). The fix is NOT "don't read" — it is to make the skill INTERNAL:
      // set --dir to the WORKSPACE ROOT so the skills tree (skills/...) and the skill-graph repo
      // are both inside the agent's scope, then let the kernel Seatbelt (advisoryOsFence) deny
      // every PRIVATE sibling (sales-hub/...) by EPERM. opencode reads/researches the public
      // tree freely; private data is invisible to the process. (Public-scoped research, the
      // research mandate — not the old inline-only workaround.)
      //
      // --dir MUST be a Seatbelt-ALLOWED path: the fence denies the workspace root itself (its
      // deny anchor) and allows back only the public-root CHILDREN, so --dir = workspace root
      // makes opencode EPERM at startup trying to lstat its own --dir (verified 2026-06-06).
      // opencode lstats its --dir exactly (not the parent chain), so point it at the SKILLS TREE
      // public root: the skill being enriched (skills/<...>) is INTERNAL to it (no external_dir
      // reject), the model researches the whole skills library + the web (Seatbelt allows network),
      // and every private tree stays kernel-DENIED. (The skill-graph repo is a sibling root and is
      // NOT reachable through opencode's single-dir gate — that grounding comes from the inlined
      // body + the frontier pair, which has full scope; see follow-up note.)
      //
      // SAFETY GATE: widen --dir to the public skills root ONLY when the kernel Seatbelt is ACTIVE
      // to deny the private trees. If the fence is inactive (non-macOS / nested sandbox), fall back
      // to the NARROW run-dir scope — a degraded run is acceptable; exposing private data without
      // the kernel fence is NOT. The private-content boundary is HARD.
      const skillsRoot = path.join(workspaceRoot, 'skills');
      const exploreDir = advisoryOsFence.active ? skillsRoot : runDirAbs;
      return { backend, cli: 'opencode', args: buildOpencodeEnrichArgs(prompt, { modelId: desc.modelId, exploreDir }) };
    }
    if (backend === 'codex' || cliForModel(model) === 'codex') {
      return { backend: 'codex', cli: 'codex', args: buildCodexEnrichArgs(prompt, { model: desc.modelId, writableRoots: runDirAbs ? [runDirAbs] : [], osFenceActive: false }) };
    }
    return { backend: 'claude', cli: 'claude', args: buildClaudeEnrichArgs(prompt, { model }) };
  }

  // Build the advisory prompt. Delivery is TEXT-OUTPUT (not file-write) — interview-settled
  // 2026-06-05: weak free models CAN write files but often reply with a plan and never write, so
  // capturing the document from the model's final text answer is the more reliable delivery.
  // The model RESEARCHES (tools ON; the public skill-graph repo + skills tree + web are readable,
  // the kernel Seatbelt — advisoryOsFence — denies every private tree) and emits the enriched
  // SKILL.md as its final answer, which we capture from stdout and write. The skill body + brief
  // are inlined as a STARTING POINT so a model can begin immediately — NOT as a substitute for
  // research. Advisory models research like the frontier pair; "advisory" is their DECISION role
  // (the frontier pair curates + decides), never a capability limit. See
  // docs/audit-loop-enrich-philosophy.md (research IS the curation mechanism).
  function buildAdvisoryPrompt({ skill, model, brief, skillBody }) {
    return `${getEnrichTemplate()}

---
SKILL: ${skill}
MODEL: ${model} (advisory)

RESEARCH BRIEF (a starting point — research further):
${brief || '(none)'}

CURRENT SKILL.md (enrich THIS — inlined so you can start immediately):

${skillBody}

DELIVERY — RESEARCH, THEN OUTPUT THE DOCUMENT (follow EXACTLY):
Output the COMPLETE enriched SKILL.md as your ENTIRE reply. Start at the file's first character (the opening \`---\` frontmatter line) and stop at its last. The reply IS the document text and nothing else:
- No plan, no preamble, no "Here is…", no summary of changes, no code-fence wrapper, no trailing commentary.
- RESEARCH with tools ON, exactly like the frontier models: read the current SKILL.md + related sibling skills (the PUBLIC skill-graph repo + skills tree are readable) and search the web for current best practices, tools, and vendor/library changes (the upstream-displacement check — has a newer release solved this topic better?). Private workspace data is kernel-blocked — do not attempt it. The inlined brief + body are a starting point, not the limit of what you may consult.
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
      // All advisory propose runs at the skill-graph public root under the Seatbelt — the
      // model researches the repo + skills tree (kernel-allowed public roots) + web, and emits
      // the enriched document as its final text answer (we capture stdout).
      const cwd = skillGraphRoot;
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
