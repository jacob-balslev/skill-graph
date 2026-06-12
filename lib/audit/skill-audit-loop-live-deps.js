'use strict';

// ─── Live production deps for the multi-agent PANEL ENRICH orchestrator ───────
//
// run-skill-audit-loop.js is pure orchestration. THIS module is its production `deps`,
// SELF-CONTAINED in skill-graph (no workspace dispatch-solver dependency — Skill Graph
// SYSTEM work lives in skill-graph/). It COMPOSES the proven 2-frontier live deps
// (skill-audit-loop-lite-deps.js) for the mandatory claim/propose/curate/eval/apply path and adds
// the panel operations for ALL tiers, dispatching each model's CLI directly.
//
// PROPOSAL DELIVERY:
//   - frontier (opus/codex): base.researchAndPropose — the model WRITES the proposal file
//     (claude/codex, OS-fenced); verified for existence + non-empty.
//   - advisory (gemini/opencode): dispatched under the SAME kernel Seatbelt fence
//     (advisoryOsFence — public skill-graph repo + skills tree + web visible; every private tree
//     EPERM), tools ON, told to RESEARCH (repo + web) then EMIT the curated SKILL.md as its
//     final text answer — captured from stdout (extractEnrichedDoc) and written by us, with a
//     model-written file as fallback. opencode --dir = workspace root WHEN the fence is active
//     (skill internal to its agent gate; kernel denies private), else the narrow run-dir
//     (degraded but safe); gemini → --yolo. Advisory models are full RESEARCHERS — "advisory" is
//     their DECISION role (the frontier pair curates + decides), never a capability limit. The
//     old "inline it, don't read" workaround DEMOTED advisory to inline-reasoner and violated the
//     research mandate (docs/skill-audit-loop-philosophy.md line 35/97) — it was removed.
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
  createSkillAuditLoopLiteDeps,
  sanitizeModelForFilename,
  proposalPaths,
  loadEnrichPromptTemplate,
  buildClaudeEnrichArgs,
  buildCodexEnrichArgs,
  buildGeminiEnrichArgs,
  buildOpencodeEnrichArgs,
  cliForModel,
} = require('./skill-audit-loop-lite-deps');
const { runCommandWithTimeoutSync } = require('./run-command-with-timeout');
const { assertPublicScope, defaultPublicRoots, assertSkillPublishableForExternalLane } = require('./public-content-fence');
const { prepareOsFence, resolveOsFenceEnabled } = require('./isolated-checkout');
const { assertBudgetAvailable } = require('./panel-budget');
const { advisoryAuthPreflight } = require('./advisory-preflight');
const { parseFrontmatter } = require('./parse-frontmatter');
const { envForCli } = require('./model-cli-home');
const { copySkillsCorpus } = require('./public-workspace-fallback');

// Default advisory auth probe (F5): confirm the backend CLI is on PATH. A missing CLI is
// a definite "not ready" (loud, actionable warning); a present CLI is optimistically
// treated as ready (a full login check would require a real, slow model call — the
// dispatch-time failure_reason from F4 catches a present-but-unauthed CLI). Injectable, so
// a more thorough probe can be supplied. Never throws (a throw ⇒ not-authed, fail-loud).
function defaultAuthProbe(backend) {
  const cli = backend === 'gemini' ? 'gemini'
    : backend === 'opencode' ? 'opencode'
      : backend === 'codex' ? 'codex' : 'claude';
  try {
    const r = spawnSync('which', [cli], { encoding: 'utf8', timeout: 5000 });
    if (r.status === 0 && String(r.stdout || '').trim()) return { authed: true };
    return { authed: false, detail: `${cli} not found on PATH` };
  } catch (e) { return { authed: false, detail: e && e.message }; }
}

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
// SKI-252: find the LAST balanced `{...}` substring that actually parses as JSON.
// Replaces a naive `text.lastIndexOf('{')` slice that broke on nested objects
// (it grabbed the innermost `{`, e.g. `{"a":{"b":1}}` -> `{"b":1}}` -> parse
// fail -> silent null) and on stray prose braces. Scans each `{`, tracks brace
// depth to its matching close, and keeps the last span that JSON.parses.
function lastBalancedJson(text) {
  let result = null;
  let start = text.indexOf('{');
  while (start !== -1) {
    let depth = 0;
    let end = -1;
    for (let i = start; i < text.length; i += 1) {
      const c = text[i];
      if (c === '{') depth += 1;
      else if (c === '}') {
        depth -= 1;
        if (depth === 0) { end = i; break; }
      }
    }
    if (end === -1) break; // no balanced close from here — stop scanning
    try { result = JSON.parse(text.slice(start, end + 1)); } catch (_) { /* not a JSON object */ }
    // Skip past this object's interior so nested braces aren't re-scanned as
    // their own starts — we want the last TOP-LEVEL object, not the last inner one.
    start = text.indexOf('{', end + 1);
  }
  return result;
}

function parseLastJsonBlock(text) {
  if (!text) return null;
  const re = /```json\s*([\s\S]*?)```/g;
  let m; let last = null;
  while ((m = re.exec(text)) !== null) last = m[1];
  if (last != null) {
    try { return JSON.parse(last.trim()); } catch (_) { /* fall through to a balanced scan */ }
  }
  // No parseable fenced block — salvage the last balanced JSON object from the
  // reply (handles a bare or prose-prefixed JSON object; returns null on genuine
  // prose so malformed feedback is surfaced, not masked by a garbage fragment).
  return lastBalancedJson(text);
}

// Salvage the curated SKILL.md from a model's TEXT reply (the interview-confirmed advisory
// delivery: weak free models reliably EMIT the document as text but won't drive an agentic
// file-write). Unwraps a whole-document code fence, then starts at the YAML frontmatter (a line
// that is exactly `---`) or, failing that, the first markdown heading — discarding any "Here is…"
// preamble. Returns '' when nothing document-like is present.
function extractEnrichedDoc(raw) {
  let t = String(raw || '').replace(/\r/g, '').trim();
  if (!t) return '';
  const fence = t.match(/^```(?:markdown|md)?\s*\n([\s\S]*?)\n```$/);
  if (fence) t = fence[1].trim();
  if (!fence) {
    const embeddedFence = Array.from(t.matchAll(/```(?:markdown|md)?\s*\n([\s\S]*?)\n```/g))
      .map((m) => String(m[1] || '').trim())
      .find((body) => /^---\n[\s\S]*?\n---\n/.test(body));
    if (embeddedFence) t = embeddedFence;
  }
  const lines = t.split('\n');
  const fmIdx = lines.findIndex((l) => l.trim() === '---');
  if (fmIdx >= 0) return lines.slice(fmIdx).join('\n').trim();
  const hIdx = lines.findIndex((l) => /^#{1,3}\s/.test(l));
  if (hIdx >= 0) return lines.slice(hIdx).join('\n').trim();
  return t;
}

// Is the captured text actually a SKILL.md document, not a plan/summary? Real curated skills are
// tens of KB with frontmatter and many headings; a "here's my plan" reply is short prose with
// neither. Require substance AND structure so a plan can never pass as a proposal.
function looksLikeSkillDoc(doc, expectedName) {
  if (!doc) return false;
  const hasFrontmatter = /^---\n[\s\S]*?\n---\n/.test(doc);
  const headingCount = (doc.match(/^#{1,3}\s/gm) || []).length;
  // A real SKILL.md always opens with YAML frontmatter; a plan/summary never does — so
  // frontmatter + a real body is the primary signal. Fallback: a heavily-structured, substantial
  // doc with no frontmatter still counts. A short prose plan passes neither.
  if (hasFrontmatter && doc.length >= 500) {
    // SKI-251: structural length alone is NOT enough to write untrusted model text to the
    // canonical proposal path — a plan/summary can be wrapped in stray `---` blocks and slip
    // through. Require the captured frontmatter to actually PARSE and carry a non-empty `name`
    // (the minimal SKILL.md identity contract; a plan reply never has a kebab `name:`). This is
    // a write-path safety gate over advisory text-capture; the eval is downstream and skippable.
    try {
      const fm = parseFrontmatter(doc);
      const nameOk = Boolean(fm && typeof fm.name === 'string' && fm.name.trim().length > 0);
      if (!nameOk) return false;
      // B7: when the expected skill name is known, a captured doc whose frontmatter `name`
      // does NOT match must be rejected — a valid-but-off-topic SKILL.md (right shape, wrong
      // skill) must never be written as THIS skill's proposal and poison the curate step.
      if (expectedName && fm.name.trim() !== String(expectedName).trim()) return false;
      return true;
    } catch (_) {
      return false; // unparseable frontmatter — not a skill doc
    }
  }
  return headingCount >= 4 && doc.length >= 2000;
}

// Reconstruct an opencode-backed model's TEXT reply from its `--format json` event stream
// (SKI-403 follow-up, 2026-06-11). opencode dispatched with `--format json` emits one JSON
// object per line; the assistant's reply lives in `type:"text"` parts (`part.text`), interleaved
// with non-text events (step_start/step_finish, tool_use, reasoning) we ignore. We concatenate
// every text part in stream order to rebuild the full reply — exactly what default-format stdout
// SHOULD have shown but didn't on opencode 1.16.2 (the text part was dropped from the rendered
// stream → 0-byte capture). The existing text parsers (extractEnrichedDoc for propose/revise,
// parseLastJsonBlock for cross-review) then run on this reconstructed text unchanged.
//
// Returns { text, sawEvent }. `sawEvent` is true when at least one JSON event line parsed — the
// caller uses it to decide whether to trust the reconstruction: an event stream with NO text
// parts (a tool-call-only turn) yields text:'' and sawEvent:true, which is an HONEST "the model
// produced no document text" (the no-document failure path fires). A stdout that is NOT an event
// stream (sawEvent:false — e.g. an early CLI error printed as plain text) is left untouched so
// the real error is not blanked.
function reconstructOpencodeText(stdout) {
  const clean = String(stdout || '').replace(/\x1b\[[0-9;]*m/g, '');
  let sawEvent = false;
  const parts = [];
  for (const line of clean.split('\n')) {
    const s = line.trim();
    if (!s || s[0] !== '{') continue;
    let ev;
    try { ev = JSON.parse(s); } catch (_) { continue; }
    sawEvent = true;
    const p = (ev && ev.part) ? ev.part : ev;
    if (p && (p.type === 'text' || p.type === 'text-delta')) {
      const t = typeof p.text === 'string' ? p.text
        : typeof p.delta === 'string' ? p.delta
        : '';
      if (t) parts.push(t);
    }
  }
  return { text: parts.join(''), sawEvent };
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
 * @param {Function}[options.dispatch]   shell-out override for the FRONTIER claude/codex path (skill-audit-loop-lite-deps).
 * @param {Function}[options.advisoryDispatch]  override for advisory CLI dispatch: ({backend, cli, args, cwd, exploreDir, mode}) => {ok, stdout}. Tests inject this.
 * @param {number} [options.advisoryTimeoutMs]  per-advisory dispatch timeout (default 20m).
 */
function createSkillAuditLoopDeps(options = {}) {
  const skillGraphRoot = options.skillGraphRoot ? path.resolve(options.skillGraphRoot) : process.cwd();
  const dryRun = Boolean(options.dryRun);
  const advisoryTimeoutMs = Number(options.advisoryTimeoutMs || 20 * 60 * 1000);
  const modelEnv = options.modelEnv || {};
  const modelCwd = options.modelCwd ? path.resolve(options.modelCwd) : null;
  const publicWorkspaceSkillsRoot = options.publicWorkspaceSkillsRoot ? path.resolve(options.publicWorkspaceSkillsRoot) : null;
  const roots = defaultPublicRoots({ skillGraphRoot });
  const fence = (p, label) => assertPublicScope(p, { roots, label });

  const base = createSkillAuditLoopLiteDeps({
    skillGraphRoot, curatorModel: options.curatorModel, dryRun, dispatch: options.dispatch,
    modelEnv, modelCwd,
  });

  // Advisory CLIs (opencode/gemini) get the SAME kernel Seatbelt fence the frontier path
  // already applies to claude/codex (skill-audit-loop-lite-deps dispatchModel). Without it the advisory
  // models could not be given real file access safely, so an earlier workaround scoped
  // opencode --dir to an empty run dir + told the model "don't read, it's inline" — which
  // DEMOTED advisory from researcher to inline-reasoner, violating the research mandate
  // (docs/skill-audit-loop-philosophy.md line 35/97: "Research IS the curation mechanism";
  // "❌ Disabling the agents' tools or forbidding research"). The fence makes the public roots
  // visible to the model process; every private sibling is kernel-DENIED — so advisory models
  // research the repo + web exactly like the frontier pair. This is the POLICY-equivalent
  // isolated checkout (isolated-checkout.js § "Why a policy and not a physical checkout").
  //
  // TWO GRADES of public root (the source-mutation fix, 2026-06-06): the skill SOURCE trees
  // (skill-graph repo + skills library) are READ-ONLY — the model researches them but a write
  // EPERMs, so a write-capable advisory model physically CANNOT mutate a canonical SKILL.md
  // (the incident: a model wrote its proposal straight into skills/.../SKILL.md). The ONLY
  // writable workspace targets are the audit run-dir trees: the run-root
  // <skill-graph>/skill-audit-loop/progress/skill-audits (the loop's claim run dirs — RELOCATED
  // 2026-06-07T from <ws>/.opencode/progress/skill-audits per the ADR-0016 surface #3
  // supersession) and <skill-graph>/.opencode/progress (the Agent-tool primitives' run dirs).
  // BOTH are now nested inside the read-only skill-graph root and re-allowed for write by SBPL
  // last-match. Propose delivers via stdout text-capture (the model writes nothing); revise
  // writes its own proposal into the run dir. Source is never a writable target on either path.
  const workspaceRoot = path.resolve(skillGraphRoot, '..');
  const advisorySourceRoots = [skillGraphRoot, path.join(workspaceRoot, 'skills')];
  const advisoryWritableRoots = [
    path.join(skillGraphRoot, 'skill-audit-loop', 'progress', 'skill-audits'),
    path.join(skillGraphRoot, '.opencode', 'progress'),
  ];
  const advisoryOsFence = prepareOsFence({
    workspaceRoot,
    readOnlyRoots: advisorySourceRoots,
    publicRoots: advisoryWritableRoots,
    enabled: resolveOsFenceEnabled(options.osFence) && !dryRun && !options.advisoryDispatch,
  });
  let ownedPublicSkillsRoot = null;
  let ownedPublicSkillsTmp = null;
  let ownedPublicSkillsError = null;
  function cleanupOwnedPublicSkillsRoot() {
    if (!ownedPublicSkillsTmp) return;
    try { fs.rmSync(ownedPublicSkillsTmp, { recursive: true, force: true }); } catch (_) { /* best-effort */ }
  }
  function ensurePublicSkillsCopy() {
    if (publicWorkspaceSkillsRoot) return publicWorkspaceSkillsRoot;
    if (ownedPublicSkillsRoot || ownedPublicSkillsError) return ownedPublicSkillsRoot;
    try {
      ownedPublicSkillsTmp = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-audit-opencode-skills-'));
      try { fs.chmodSync(ownedPublicSkillsTmp, 0o700); } catch (_) { /* best-effort */ }
      copySkillsCorpus(path.join(workspaceRoot, 'skills'), ownedPublicSkillsTmp);
      ownedPublicSkillsRoot = path.join(ownedPublicSkillsTmp, 'skills');
      process.once('exit', cleanupOwnedPublicSkillsRoot);
    } catch (e) {
      ownedPublicSkillsError = e.message;
      cleanupOwnedPublicSkillsRoot();
      ownedPublicSkillsTmp = null;
      ownedPublicSkillsRoot = null;
    }
    return ownedPublicSkillsRoot;
  }
  if (advisoryOsFence.active) {
    process.once('exit', () => { try { advisoryOsFence.cleanup(); } catch (_) { /* best-effort */ } });
    // SKI-254: `exit` does not fire on a signal kill. Clean up the fence temp dir
    // on SIGINT/SIGTERM too, then re-raise so the process still terminates.
    for (const sig of ['SIGINT', 'SIGTERM']) {
      process.once(sig, () => {
        try { advisoryOsFence.cleanup(); } catch (_) { /* best-effort */ }
        process.kill(process.pid, sig);
      });
    }
  }

  let enrichTemplate = null;
  const getEnrichTemplate = () => {
    if (enrichTemplate == null) enrichTemplate = loadEnrichPromptTemplate(skillGraphRoot);
    return enrichTemplate;
  };

  function hashProposal(p) { try { return hashFile(p); } catch (_) { return `missing:${p}`; } }

  function advisoryRunDir({ skill, model, artifactsDir }) {
    return artifactsDir || path.join(skillGraphRoot, 'skill-audit-loop', 'progress', 'skill-audits', skill, 'runs', `advisory--${sanitizeModelForFilename(model)}`);
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
    // All advisory CLIs go through the same hard-timeout wrapper. It owns the
    // subprocess group, so a spawned model CLI cannot keep the panel blocked
    // after the per-cell timeout. This replaces spawnSync/execFileSync timeout
    // handling, which can return late when descendants keep pipes open.
    const r = runCommandWithTimeoutSync({
      cli: fcli,
      args: fargs,
      cwd: modelCwd || cwd,
      env: envForCli(cli, process.env, modelEnv),
      timeoutMs: advisoryTimeoutMs,
      maxBuffer: 32 * 1024 * 1024,
    });
    let stdout = r.stdout || '';
    // opencode is dispatched with `--format json` (buildOpencodeEnrichArgs): stdout is the JSONL
    // EVENT STREAM, not rendered text. Reconstruct the assistant's text reply from the `type:text`
    // parts so every caller (propose/cross-review/revise) transparently receives plain text and the
    // existing parsers work unchanged (SKI-403 follow-up). Only replace when we actually parsed an
    // event stream — a non-event stdout (early CLI error as plain text) is left intact so the real
    // failure surfaces; a parsed event stream with no text part yields '' (honest no-document).
    if (backend === 'opencode') {
      const rec = reconstructOpencodeText(stdout);
      if (rec.sawEvent) stdout = rec.text;
      r.dispatchDiagnostics = {
        opencode_json_stream_seen: rec.sawEvent,
        opencode_raw_stdout_bytes: String(r.stdout || '').length,
        opencode_reconstructed_text_bytes: String(stdout || '').length,
      };
    }
    const ok = r.ok === true;
    const failure_reason = ok ? null : r.timedOut ? 'timeout' : 'error';
    return { ok, stdout, stderr: r.stderr || '', failure_reason, error: r.error || null, diagnostics: r.dispatchDiagnostics || null };
  });

  // SKI-404: the opencode `--dir` (Option A). Under the OS fence, point it at the public skills COPY
  // built OUTSIDE ws (so opencode 1.16.2's project walk-up reaches the tmp root, not the denied ws);
  // without the fence, the public copy if present else the run dir. Shared by buildArgsFor (the
  // dispatch) and dispatchWriteProposal (which derives build's write-output path under the same dir).
  function opencodeExploreDirFor(runDirAbs) {
    const skillsRoot = path.join(workspaceRoot, 'skills');
    return advisoryOsFence.active
      ? (ensurePublicSkillsCopy() || skillsRoot)
      : (publicWorkspaceSkillsRoot || runDirAbs);
  }

  // Build CLI args for ANY tier's model. Returns { cli, args, backend, exploreCleanup, exploreDir }.
  function buildArgsFor(model, prompt, { runDirAbs } = {}) {
    const desc = resolveBackend(model);
    const backend = desc.backend;
    if (backend === 'gemini') {
      return { backend, cli: 'gemini', args: buildGeminiEnrichArgs(prompt, { modelId: desc.modelId }) };
    }
    if (backend === 'opencode') {
      // SKI-404 opencode advisory dispatch — two coupled decisions:
      //   --dir (Option A): point at the public skills COPY built OUTSIDE ws (opencodeExploreDirFor).
      //     opencode 1.16.2 resolves its project by walking --dir UP to the project root; with --dir
      //     inside ws the walk hits the fence-denied workspace root → cold-start EPERM. The public
      //     copy lives under the OS tmp dir, so the walk-up reaches tmp, never the denied ws. The copy
      //     mirrors the corpus, so research breadth is preserved; the skill is INTERNAL to --dir so
      //     build's external-dir read-guard does not trip. Real skillsRoot only as a no-copy fallback.
      //   AGENT = build, NOT plan: the `plan` agent is READ-ONLY and structurally REFUSES to produce
      //     the artifact ("I'm in Plan Mode (read-only), so I cannot execute the enrichment" — verified
      //     live 2026-06-11), so it can never deliver a curated SKILL.md. `build` is the implementer:
      //     it researches AND writes the document. With --dir = the WRITABLE public copy (outside ws),
      //     build's file-write succeeds (no EPERM). Delivery is dual: build WRITES the doc to a file
      //     under --dir (captured by dispatchWriteProposal's build-file path) AND may also emit it as
      //     text (captured via reconstructOpencodeText). See dispatchWriteProposal § build-delivery.
      const exploreDir = opencodeExploreDirFor(runDirAbs);
      return { backend, cli: 'opencode', exploreDir, args: buildOpencodeEnrichArgs(prompt, { modelId: desc.modelId, exploreDir, agent: 'build' }) };
    }
    if (backend === 'codex' || cliForModel(model) === 'codex') {
      // osFenceActive MUST track the live advisory fence: when our Seatbelt is active, codex must
      // NOT start its OWN Seatbelt (`-s workspace-write`) — nesting sandbox-exec is kernel-denied
      // (`sandbox_apply: Operation not permitted`), so a self-sandboxing codex writes NOTHING and
      // its revision is silently lost (the GPT-5.5 mandatory-frontier write-block, 2026-06-06).
      // buildCodexEnrichArgs already branches correctly (SKI-169 Fix B); the panel just has to
      // pass the real fence state instead of a hardcoded false.
      return { backend: 'codex', cli: 'codex', args: buildCodexEnrichArgs(prompt, { model: desc.modelId, writableRoots: runDirAbs ? [runDirAbs] : [], osFenceActive: advisoryOsFence.active }) };
    }
    return { backend: 'claude', cli: 'claude', args: buildClaudeEnrichArgs(prompt, { model }) };
  }

  // Build the advisory prompt. Delivery is TEXT-OUTPUT (not file-write) — interview-settled
  // 2026-06-05: weak free models CAN write files but often reply with a plan and never write, so
  // capturing the document from the model's final text answer is the more reliable delivery.
  // The model RESEARCHES (tools ON; the public skill-graph repo + skills tree + web are readable,
  // the kernel Seatbelt — advisoryOsFence — denies every private tree) and emits the curated
  // SKILL.md as its final answer, which we capture from stdout and write. The skill body + brief
  // are inlined as a STARTING POINT so a model can begin immediately — NOT as a substitute for
  // research. Advisory models research like the frontier pair; "advisory" is their DECISION role
  // (the frontier pair curates + decides), never a capability limit. See
  // docs/skill-audit-loop-philosophy.md (research IS the curation mechanism).
  function buildAdvisoryPrompt({ skill, model, brief, skillBody, buildOutputPath }) {
    // SKI-312: the DELIVERY contract leads (primacy) AND closes (recency),
    // bracketing the methodology template. Previously the template (with its
    // numbered novelty-memo / dissent / completeness-claim steps) came first
    // and DELIVERY came last, so weak free models followed those steps and
    // emitted PROSE instead of the curated SKILL.md (the observed 0-byte /
    // prose-only advisory failures). The research mandate is preserved; only
    // the OUTPUT is constrained to the document.
    return `DELIVERY — READ THIS FIRST. It OVERRIDES any conflicting instruction in the methodology below.
Your ENTIRE reply must be the COMPLETE curated SKILL.md and nothing else — start at the opening \`---\` frontmatter line and stop at the file's last character. Do NOT output a novelty memo, a dissent/abstain section, a completeness claim, a plan, a preamble, "Here is…", a summary of changes, a code-fence wrapper, or any commentary. Those numbered methodology steps are for the FRONTIER proposal pass, NOT this advisory pass — DO the research they describe, but your reply is ONLY the document.
${buildOutputPath ? `
BUILD-AGENT DELIVERY (you are the opencode \`build\` agent — you HAVE write tools; this OVERRIDES the text-only framing for THIS run). Your PRIMARY deliverable is to WRITE the COMPLETE curated SKILL.md, using your write tool, to EXACTLY this path (create it — it does not exist yet):
  ${buildOutputPath}
That written file IS the delivery and is what will be read back. Do NOT stop until that file is written with the full document. Write ONLY that file — do not modify the skill's own SKILL.md or any other file. You MAY also reply with the document as text (a useful fallback), but the FILE is authoritative. Do the same research first; only the OUTPUT location changes.
` : ''}
${getEnrichTemplate()}

---
SKILL: ${skill}
MODEL: ${model} (advisory)

RESEARCH BRIEF (a starting point — research further):
${brief || '(none)'}

CURRENT SKILL.md (curate THIS — inlined so you can start immediately):

${skillBody}

DELIVERY REMINDER — RESEARCH, THEN OUTPUT ONLY THE DOCUMENT:
Reply with the COMPLETE curated SKILL.md as your ENTIRE reply. Start at the first \`---\` and stop at the last character. The reply IS the document text and nothing else — no novelty memo, no dissent, no completeness claim, no plan, no preamble, no code-fence wrapper, no trailing commentary.
- RESEARCH with tools ON, exactly like the frontier models: read the current SKILL.md + related sibling skills (the PUBLIC skill-graph repo + skills tree are readable) and search the web for current best practices, tools, and vendor/library changes (the upstream-displacement check — has a newer release solved this topic better?). Private workspace data is kernel-blocked — do not attempt it. The inlined brief + body are a starting point, not the limit of what you may consult.
- ENRICH the skill: add capability, precision, grounding, edge cases. NEVER strip or shorten existing content.
Reply with ONLY the complete curated SKILL.md. Nothing else.`;
  }

  function iterationSuggestionsPath(runDirAbs, skill, model) {
    return path.join(runDirAbs, `${skill}.${sanitizeModelForFilename(model)}.iteration-suggestions.json`);
  }

  function buildAdvisorySuggestionsPrompt({ skill, model, brief, skillBody, proposedSkillBody }) {
    return `You are an advisory reviewer in the Skill Audit Loop.

Return JSON only. Do NOT rewrite the skill. Do NOT use markdown fences. Do NOT write files.

Your job is to give concrete suggestions for the NEXT iteration of this skill after reading:
1. The current canonical SKILL.md.
2. The advisory proposal you just produced.
3. The research brief.

Focus on improvements a later audit-loop pass can act on: missing examples, eval cases, references, metadata/routing issues, unsafe assumptions, stale vendor/library claims, unclear boundaries, or places where another agent should verify evidence.

Schema:
{
  "skill": "${skill}",
  "model": "${model}",
  "suggestions": [
    {
      "priority": "high|medium|low",
      "type": "content|eval|metadata|routing|tooling|reference|deprecation|evidence",
      "suggestion": "specific change to consider",
      "evidence": "what in the current/proposed skill or research brief supports this",
      "next_step": "smallest concrete follow-up"
    }
  ],
  "limits": ["brief note about uncertainty or missing research, if any"]
}

Rules:
- Maximum 8 suggestions.
- Only include suggestions that are NOT already fully implemented in the proposed skill.
- If you have no useful suggestions, return {"skill":"${skill}","model":"${model}","suggestions":[],"limits":[]}.

RESEARCH BRIEF:
${brief || '(none)'}

CURRENT CANONICAL SKILL.md:
${skillBody || '(missing)'}

ADVISORY PROPOSAL:
${proposedSkillBody || '(missing)'}`;
  }

  function normalizeIterationSuggestions(parsed, { skill, model, ok = true, parseOk = true, error = null, rawPath = null } = {}) {
    const rawSuggestions = parsed && Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
    const suggestions = rawSuggestions.slice(0, 8).map((item) => {
      const priority = ['high', 'medium', 'low'].includes(item && item.priority) ? item.priority : 'medium';
      const type = ['content', 'eval', 'metadata', 'routing', 'tooling', 'reference', 'deprecation', 'evidence'].includes(item && item.type) ? item.type : 'content';
      return {
        priority,
        type,
        suggestion: String((item && item.suggestion) || '').trim(),
        evidence: String((item && item.evidence) || '').trim(),
        next_step: String((item && item.next_step) || '').trim(),
      };
    }).filter((item) => item.suggestion);
    const rawLimits = parsed && Array.isArray(parsed.limits) ? parsed.limits : [];
    return {
      skill,
      model,
      ok: ok === true,
      parse_ok: parseOk === true,
      error: error || null,
      raw_path: rawPath || null,
      suggestions,
      limits: rawLimits.slice(0, 8).map((v) => String(v || '').trim()).filter(Boolean),
    };
  }

  function collectAdvisoryIterationSuggestions({ skill, model, brief, skillBody, proposalPath, runDirAbs }) {
    const outPath = iterationSuggestionsPath(runDirAbs, skill, model);
    if (process.env.SKILL_AUDIT_ADVISORY_SUGGESTIONS === '0') return null;
    try {
      const proposedSkillBody = fs.existsSync(proposalPath) ? fs.readFileSync(proposalPath, 'utf8') : '';
      const prompt = buildAdvisorySuggestionsPrompt({ skill, model, brief, skillBody, proposedSkillBody });
      const { cli, args, backend, exploreCleanup } = buildArgsFor(model, prompt, { runDirAbs });
      const res = advisoryDispatch({ backend, cli, args, cwd: modelCwd || skillGraphRoot, mode: 'text' });
      if (exploreCleanup) exploreCleanup();
      const rawPath = path.join(runDirAbs, `${skill}.${sanitizeModelForFilename(model)}.iteration-suggestions.raw.md`);
      try { fs.writeFileSync(rawPath, `${res.stdout || ''}\n--- stderr ---\n${res.stderr || ''}`); } catch (_) { /* best-effort */ }
      if (!res.ok) {
        const payload = normalizeIterationSuggestions(null, {
          skill,
          model,
          ok: false,
          parseOk: false,
          error: res.error || `suggestions dispatch failed (${res.failure_reason || 'error'})`,
          rawPath,
        });
        fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);
        return outPath;
      }
      const parsed = parseLastJsonBlock(res.stdout);
      const payload = parsed
        ? normalizeIterationSuggestions(parsed, { skill, model, ok: true, parseOk: true, rawPath })
        : normalizeIterationSuggestions(null, {
          skill,
          model,
          ok: false,
          parseOk: false,
          error: 'no parseable suggestions JSON in advisory output',
          rawPath,
        });
      fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);
      return outPath;
    } catch (e) {
      const payload = normalizeIterationSuggestions(null, { skill, model, ok: false, parseOk: false, error: e.message });
      try { fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`); } catch (_) { /* best-effort */ }
      return outPath;
    }
  }

  // Dispatch an ADVISORY model and CAPTURE the curated SKILL.md from its TEXT reply, then write
  // it to proposalPath ourselves (the interview-confirmed reliable path). Falls back to a
  // model-written file if one appeared anyway. Never throws.
  function dispatchWriteProposal({ skill, skillDir, model, brief, runDirAbs, proposalPath, noveltyMemoPath }) {
    try {
      fence(skillDir, `panel skillDir for ${skill}`);
      fence(runDirAbs, `panel run dir for ${skill}/${model}`);
      fs.mkdirSync(runDirAbs, { recursive: true });
      const canonicalSkillPath = fence(path.join(skillDir, 'SKILL.md'), `panel read SKILL.md for ${skill}`);
      const skillBody = fs.existsSync(canonicalSkillPath) ? fs.readFileSync(canonicalSkillPath, 'utf8') : '';
      // SKI-404 § build-delivery: the opencode advisory agent is `build` (the implementer), which
      // delivers by WRITING the curated SKILL.md to a file under its --dir (the public copy). Compute
      // that path so we can (a) instruct build where to write and (b) read it back. Non-opencode
      // backends (gemini) keep pure text delivery → buildOutputPath null, prompt unchanged for them.
      const advisoryBackend = resolveBackend(model).backend;
      const buildOutputPath = advisoryBackend === 'opencode'
        ? path.join(opencodeExploreDirFor(runDirAbs), `${sanitizeModelForFilename(model)}.build-proposed-SKILL.md`)
        : null;
      const prompt = buildAdvisoryPrompt({ skill, model, brief, skillBody, buildOutputPath });
      const cwd = modelCwd || skillGraphRoot;
      const diagnosticsPath = path.join(runDirAbs, `${skill}.${sanitizeModelForFilename(model)}.advisory-propose-diagnostics.json`);
      const attempts = [];
      const writeDiagnostics = (final) => {
        const payload = {
          skill,
          model,
          backend: advisoryBackend,
          run_dir: runDirAbs,
          proposal_path: proposalPath,
          novelty_memo_path: noveltyMemoPath,
          build_output_path: buildOutputPath,
          attempts,
          final,
        };
        try { fs.writeFileSync(diagnosticsPath, `${JSON.stringify(payload, null, 2)}\n`); } catch (_) { /* best-effort */ }
      };
      const finishSuccess = (result) => {
        writeDiagnostics({ ok: true, via: result.via, failure_reason: null });
        const suggestionPath = collectAdvisoryIterationSuggestions({ skill, model, brief, skillBody, proposalPath, runDirAbs });
        return { ...result, diagnosticsPath, iterationSuggestionsPath: suggestionPath || null };
      };
      const runAttempt = (promptText, suffix) => {
        // Clear any prior-attempt build output so a stale file from attempt 1 can't false-positive on retry.
        if (buildOutputPath) { try { fs.rmSync(buildOutputPath, { force: true }); } catch (_) { /* best-effort */ } }
        const { cli, args, backend, exploreCleanup } = buildArgsFor(model, promptText, { runDirAbs });
        // We capture stdout now, so cwd is immaterial for delivery — keep the prior values
        // (gemini=runDir, opencode/others=skill-graph) for back-compat with --dir scoping.
        // All advisory propose runs at the skill-graph public root under the Seatbelt — the
        // model researches the repo + skills tree (kernel-allowed public roots) + web, and emits
        // the curated document as its final text answer (we capture stdout).
        const res = advisoryDispatch({ backend, cli, args, cwd, mode: 'text' });
        if (exploreCleanup) exploreCleanup();
        try { fs.writeFileSync(path.join(runDirAbs, `${skill}.${sanitizeModelForFilename(model)}.dispatch${suffix}.log`), `${res.stdout || ''}\n--- stderr ---\n${res.stderr || ''}`); } catch (_) {}
        const attempt = {
          attempt: suffix ? 'retry' : 'initial',
          backend,
          cli,
          cwd,
          explore_dir: opencodeExploreDirFor(runDirAbs),
          dispatch_ok: res.ok === true,
          dispatch_failure_reason: res.failure_reason || null,
          stdout_bytes: String(res.stdout || '').length,
          stderr_bytes: String(res.stderr || '').length,
          dispatch_diagnostics: res.diagnostics || null,
          opencode_public_skills_root: advisoryBackend === 'opencode' ? opencodeExploreDirFor(runDirAbs) : null,
          opencode_public_skills_copy_error: advisoryBackend === 'opencode' ? ownedPublicSkillsError : null,
          build_file_exists: false,
          build_file_bytes: 0,
          build_doc_chars: 0,
          build_doc_looks_like_skill: false,
          stdout_doc_chars: 0,
          stdout_doc_looks_like_skill: false,
          proposal_exists: fs.existsSync(proposalPath),
          proposal_bytes: fs.existsSync(proposalPath) ? fs.statSync(proposalPath).size : 0,
          accepted_via: null,
        };
        // SKI-404 § build-delivery: the opencode `build` agent writes the doc to buildOutputPath under
        // its --dir. Capture that FIRST (build's primary, most-reliable delivery — it implements the
        // artifact rather than refusing like the `plan` agent did), then fall back to text-capture (a
        // build that emitted the doc as text instead) and finally any model-written run-dir file.
        if (buildOutputPath && fs.existsSync(buildOutputPath)) {
          let fileDoc = '';
          try { fileDoc = fs.readFileSync(buildOutputPath, 'utf8'); } catch (_) { /* best-effort */ }
          const builtDoc = extractEnrichedDoc(fileDoc);
          attempt.build_file_exists = true;
          attempt.build_file_bytes = Buffer.byteLength(fileDoc);
          attempt.build_doc_chars = builtDoc.length;
          attempt.build_doc_looks_like_skill = looksLikeSkillDoc(builtDoc, skill);
          if (looksLikeSkillDoc(builtDoc, skill)) {
            fs.writeFileSync(proposalPath, builtDoc.endsWith('\n') ? builtDoc : `${builtDoc}\n`);
            attempt.accepted_via = suffix ? 'build-file-write-retry' : 'build-file-write';
            attempt.proposal_exists = true;
            attempt.proposal_bytes = fs.statSync(proposalPath).size;
            attempts.push(attempt);
            return finishSuccess({ ok: true, proposalPath, noveltyMemoPath, via: attempt.accepted_via });
          }
        }
        const doc = extractEnrichedDoc(res.stdout);
        attempt.stdout_doc_chars = doc.length;
        attempt.stdout_doc_looks_like_skill = looksLikeSkillDoc(doc, skill);
        if (looksLikeSkillDoc(doc, skill)) {
          fs.writeFileSync(proposalPath, doc.endsWith('\n') ? doc : `${doc}\n`);
          attempt.accepted_via = suffix ? 'stdout-capture-retry' : 'stdout-capture';
          attempt.proposal_exists = true;
          attempt.proposal_bytes = fs.statSync(proposalPath).size;
          attempts.push(attempt);
          return finishSuccess({ ok: true, proposalPath, noveltyMemoPath, via: attempt.accepted_via });
        }
        const wrote = fs.existsSync(proposalPath) && fs.statSync(proposalPath).size > 0;
        if (wrote) {
          attempt.accepted_via = suffix ? 'file-write-retry' : 'file-write';
          attempt.proposal_exists = true;
          attempt.proposal_bytes = fs.statSync(proposalPath).size;
          attempts.push(attempt);
          return finishSuccess({ ok: true, proposalPath, noveltyMemoPath, via: attempt.accepted_via });
        }
        const failure_reason = res.failure_reason || (res.ok ? 'no-document' : 'error');
        attempt.failure_reason = failure_reason;
        attempts.push(attempt);
        writeDiagnostics({ ok: false, failure_reason, error: `${model}: captured ${(res.stdout || '').length}b of text (not document-shaped) and no file written; dispatch ok=${res.ok}; reason=${failure_reason}` });
        return {
          ok: false,
          error: `${model}: captured ${(res.stdout || '').length}b of text (not document-shaped) and no file written; dispatch ok=${res.ok}; reason=${failure_reason}`,
          failure_reason,
          diagnosticsPath,
        };
      };

      const first = runAttempt(prompt, '');
      if (first.ok) return first;
      if (first.failure_reason === 'no-document') {
        const retryPrompt = `${prompt}\n\nFINAL DELIVERY RETRY:\nYour previous reply was not accepted because it did not contain a complete SKILL.md document. Output ONLY the complete SKILL.md now. Start with the opening --- frontmatter line, include the whole document, and stop after the final document character. No preamble, no analysis, no code fence, no JSON, no trailing commentary.`;
        const retry = runAttempt(retryPrompt, '.retry');
        if (retry.ok) return retry;
        return { ...retry, error: `${retry.error}; first attempt: ${first.error}` };
      }
      return first;
    } catch (e) { return { ok: false, error: e.message, failure_reason: 'error' }; }
  }

  // Dispatch a model for TEXT (cross-review). Capture stdout. Never throws.
  function dispatchTextOnly({ model, prompt, runDirAbs }) {
    try {
      const { cli, args, backend, exploreCleanup } = buildArgsFor(model, prompt, { runDirAbs });
      const res = advisoryDispatch({ backend, cli, args, cwd: modelCwd || skillGraphRoot, mode: 'text' });
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
        const suggestionPath = iterationSuggestionsPath(runDirAbs, skill, model);
        fs.writeFileSync(suggestionPath, `${JSON.stringify(normalizeIterationSuggestions({
          suggestions: [{ priority: 'low', type: 'content', suggestion: 'Dry-run placeholder: run live advisory agents for real iteration suggestions.', evidence: 'dry-run mode', next_step: 'Run without --dry-run.' }],
          limits: ['dry-run did not dispatch an advisory model'],
        }, { skill, model }), null, 2)}\n`);
        return { ok: true, proposalPath, noveltyMemoPath, iterationSuggestionsPath: suggestionPath };
      } catch (e) { return { ok: false, error: e.message }; }
    }
    // D2 HARD GATE: an advisory model is an external free provider (Gemini / OpenCode Zen).
    // Refuse a private (non-publishable) skill before dispatch — covers `propose-one --tier
    // advisory` invoked directly on a private skill (which would not hit the mandatory gate).
    // Fail-closed; dry-run is exempt (returned above).
    assertSkillPublishableForExternalLane(skillDir, { label: `propose advisory ${model}` });
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
      // parse_ok disambiguates "reviewed and found nothing" (parse_ok:true, empty items)
      // from "output malformed and silently dropped" (parse_ok:false) — without it the
      // merge-ledger can never disposition feedback that evaporated (2026-06-10T finding).
      const parse_ok = Boolean(parsed && Array.isArray(parsed.reviews));
      return { ok: true, feedback, parse_ok, reviewedTargets: (otherProposals || []).map((o) => o.model) };
    } catch (e) { return { ok: false, error: e.message }; }
  }

  // ── revise (verified; reports changed via hash) ──
  // Delivery splits by tier, MIRRORING the propose path exactly (so the read-only source fence
  // is safe for both):
  //   - sandboxed advisory (gemini/opencode): TEXT-CAPTURE. The model researches under the
  //     read-only fence (it CANNOT write the read-only source — opencode's --dir/CWD write path
  //     EPERMs — and we no longer ask it to write a file at all) and EMITS the complete revised
  //     SKILL.md as its final text answer, which WE capture from stdout (extractEnrichedDoc /
  //     looksLikeSkillDoc) and write to ownProposalPath. Same reliable delivery the propose path
  //     (dispatchWriteProposal) uses for advisory models. The old relative/CWD file-write
  //     delivery silently misdelivered under the all-RW fence and EPERMs under the read-only
  //     fence; text-capture removes the file-write requirement entirely. If the model emits no
  //     usable document, the proposal is left byte-identical (honest no-change).
  //   - frontier (claude/codex): native absolute-path overwrite into the read-write run dir
  //     (they reliably drive agentic file writes; codex via writableRoots). Unchanged.
  // Convergence stays HASH-AUTHORITATIVE (after !== before). NOTE: a text-capture reviser tends
  // to re-emit a non-byte-identical document each round, so sandboxed tiers rarely report
  // "unchanged" — the maxRounds budget is the designed backstop, identical to the propose path.
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
      // The run dir holding ownProposalPath (read-write fence root) — frontier writes its
      // absolute path; sandboxed args (opencode --dir / codex writableRoots) bind here too.
      const writeDirAbs = path.dirname(ownProposalPath);
      const logRevise = (out) => { try { fs.writeFileSync(path.join(runDirAbs, `${skill}.${sanitizeModelForFilename(reviserModel)}.revise-r${round}.log`), out); } catch (_) {} };

      if (sandboxed) {
        // TEXT-CAPTURE delivery — OVERRIDES the template's "write the file + emit JSON block"
        // output for this run (a trailing JSON block would be swept into the captured document
        // by extractEnrichedDoc, so we demand the document and NOTHING else).
        const prompt = `${template}\n\n---\nSKILL: ${skill}\nREVISER: ${reviserModel} (${reviserTier})\nROUND: ${round}\n\nYOUR CURRENT PROPOSAL:\n\n${own}\n\nFEEDBACK ADDRESSED TO YOU:\n\n${fb}\n\nDELIVERY — OVERRIDES the template's file-write + JSON-block output for THIS run (follow EXACTLY):\nReason about the feedback, then output the COMPLETE revised SKILL.md as your ENTIRE reply. Start at the file's first character (the opening \`---\` frontmatter line) and stop at its last. The reply IS the document and nothing else:\n- No plan, no preamble, no "Here is…", no summary, no code-fence wrapper, no trailing JSON block or commentary.\n- Research with tools ON (the PUBLIC skill-graph repo + skills tree are readable; private data is kernel-blocked) only where a wrong/missing item needs a fresh source.\n- ENRICH per the assignment; NEVER strip curated content to "agree" or to shrink.\n- If after honest consideration NOTHING should change, re-emit your current proposal UNCHANGED.\nReply with ONLY the complete revised SKILL.md. Nothing else.`;
        const { cli, args, backend: b, exploreCleanup } = buildArgsFor(reviserModel, prompt, { runDirAbs: writeDirAbs });
        // cwd is immaterial for text delivery; keep skill-graph root for --dir scoping back-compat.
        const res = advisoryDispatch({ backend: b, cli, args, cwd: modelCwd || skillGraphRoot, mode: 'text' });
        if (exploreCleanup) exploreCleanup();
        logRevise(`${res.stdout || ''}\n--- stderr ---\n${res.stderr || ''}`);
        const doc = extractEnrichedDoc(res.stdout);
        if (looksLikeSkillDoc(doc)) fs.writeFileSync(ownProposalPath, doc.endsWith('\n') ? doc : `${doc}\n`);
        // else: no usable document → leave the proposal as-is (honest no-change).
        const after = hashProposal(ownProposalPath);
        return { ok: true, proposalPath: ownProposalPath, contentHash: after, changed: after !== before };
      }

      // FRONTIER (claude/codex): native absolute-path overwrite into the read-write run dir.
      const prompt = `${template}\n\n---\nSKILL: ${skill}\nREVISER: ${reviserModel} (${reviserTier})\nROUND: ${round}\n\nYOUR CURRENT PROPOSAL:\n\n${own}\n\nFEEDBACK ADDRESSED TO YOU:\n\n${fb}\n\nDELIVERY (REQUIRED):\n- OVERWRITE the proposal file at ${ownProposalPath} with your revision (leave it byte-identical if nothing should change).\n- After writing the file, emit the revise JSON block.\n\n(reference current canonical SKILL.md:)\n${skillBody}`;
      const { cli, args, exploreCleanup } = buildArgsFor(reviserModel, prompt, { runDirAbs: writeDirAbs });
      const res = advisoryDispatch({ backend, cli, args, cwd: modelCwd || skillGraphRoot, mode: 'write' });
      if (exploreCleanup) exploreCleanup();
      logRevise(String(res.stdout || ''));
      const after = hashProposal(ownProposalPath);
      const meta = parseLastJsonBlock(res.stdout) || {};
      return { ok: true, proposalPath: ownProposalPath, contentHash: after, changed: after !== before || meta.changed === true };
    } catch (e) { return { ok: false, error: e.message }; }
  }

  // ── Phase 3.1 verify (mandatory frontier verify-then-decide gate, 2026-06-10T) ──
  // Each mandatory frontier independently verifies the curated merge BEFORE eval: own-
  // contribution coverage, advisory-disposition honesty, and evidence on load-bearing
  // claims. Text-only dispatch; the LAST fenced JSON block carries { approved, gaps[] }.
  // B10 (intentional, not a fence bug): verify routes a MANDATORY frontier through the same
  // text-only dispatch advisory uses, so it inherits the source-read-only fence. That is
  // CORRECT here — verification produces only a JSON verdict and writes NO file, so the
  // frontier needs no write scope during 3.1; a read-only fence is exactly sufficient and
  // is stricter than the frontier's propose/curate write path (which is fenced separately).
  function verifyMerge({ skill, verifierModel, mergedSkillPath, mergeLedgerPath, ownProposalPath, artifactsDir, round }) {
    try {
      const runDirAbs = artifactsDir || advisoryRunDir({ skill, model: verifierModel });
      if (dryRun) return { ok: true, approved: true, gaps: [], parse_ok: true };
      const merged = (mergedSkillPath && fs.existsSync(mergedSkillPath)) ? fs.readFileSync(mergedSkillPath, 'utf8') : '';
      if (!merged) return { ok: false, error: `verifyMerge: merged skill missing/empty at ${mergedSkillPath}` };
      const ledger = (mergeLedgerPath && fs.existsSync(mergeLedgerPath)) ? fs.readFileSync(mergeLedgerPath, 'utf8') : '';
      const own = (ownProposalPath && fs.existsSync(ownProposalPath)) ? fs.readFileSync(ownProposalPath, 'utf8') : '';
      const template = loadPromptTemplate(skillGraphRoot, 'skill-audit-loop-verify-pass.md');
      const prompt = `${template}\n\n---\nSKILL: ${skill}\nVERIFIER: ${verifierModel} (mandatory)\nVERIFY ROUND: ${round || 1}\n\nMERGED SKILL.md:\n\n${merged}\n\nMERGE-LEDGER:\n\n${ledger}\n\nYOUR OWN PROPOSAL (for the coverage check):\n\n${own}\n`;
      const res = dispatchTextOnly({ model: verifierModel, prompt, runDirAbs });
      if (!res.ok) return { ok: false, error: res.error || 'verify dispatch failed' };
      try { fs.writeFileSync(path.join(runDirAbs, `${skill}.${sanitizeModelForFilename(verifierModel)}.verify-r${round || 1}.md`), res.stdout); } catch (_) { /* best-effort transcript */ }
      const parsed = parseLastJsonBlock(res.stdout);
      const parse_ok = Boolean(parsed && typeof parsed.approved === 'boolean');
      if (!parse_ok) return { ok: false, error: 'verifyMerge: no parseable { approved, gaps } JSON block in verifier output' };
      const gaps = Array.isArray(parsed.gaps) ? parsed.gaps : [];
      return { ok: true, approved: parsed.approved === true && gaps.length === 0, gaps, parse_ok };
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
    // F1: pre-dispatch budget gate (skill-graph-local exhausted-lock; no workspace dep).
    // Throws a recoverable BudgetExhaustedError so the panel can checkpoint + retry-after-reset.
    assertBudget: ({ model }) => assertBudgetAvailable({ model }),
    // F5: advisory auth preflight — emits a LOUD, actionable warning for any advisory model
    // whose CLI is not ready; NEVER drops a model (maximize free-advisory participation).
    // Skipped in dry-run (no CLIs to check).
    advisoryAuthPreflight: (models) => (dryRun
      ? { models: (models || []).slice(), warnings: [], ready: (models || []).slice() }
      : advisoryAuthPreflight({ models, resolveBackend, probe: defaultAuthProbe })),
    claimAdvisorySlot,
    researchAndProposeAdvisory,
    crossReview,
    reviseProposal,
    verifyMerge,
  };
}

module.exports = {
  createSkillAuditLoopDeps,
  parseLastJsonBlock,
  extractEnrichedDoc,
  looksLikeSkillDoc,
  hashFile,
  resolveBackend,
};
