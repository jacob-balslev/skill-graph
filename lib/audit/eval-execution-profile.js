'use strict';

// ─── Tools-ON parity execution profile (the lockstep-parity invariant) ────────
//
// The two-frontier bidirectional eval (Opus 4.8 ⇄ GPT-5.5) only measures the
// MODEL when both directions run under IDENTICAL conditions. The single allowed
// variable is which model answers/grades. Everything else — tool access, repo
// scope, web allowance, working directory — must be byte-identical across the
// two directions. This module is the single source of truth for that profile and
// for the assertion that a run actually honored it.
//
// WHY repo/exec tools are ON (not OFF): the eval generator must be able to read
// the repo for grounding. Permission parity means EQUAL ACCESS across the two
// directions, never equal-zero — a different per-provider permission set would
// mean we measured "who got to peek," not the model.
//
// WHY WEB is a DELIBERATE PARAMETER, default OFF (2026-06-11, owner directive):
// the eval measures a skill's DEPLOYMENT value — search-elimination + curation
// (the skill delivers the one vetted approach instantly so the deployed agent
// need not run an extended websearch), NOT "is the answer findable on the web."
// A web-enabled BASELINE can search its way to a passable answer and hide that
// value, mislabeling a genuinely useful skill `not_discriminated_ceiling`. So the
// generator's `research` allowance defaults to repo-only (no web) for BOTH arms
// (baseline AND with-skill) — only the skill differs, parity preserved. Set
// SKILL_EVAL_WEB=on to restore the web-enabled baseline (the "is this un-googleable"
// filter). NOTE: this is the EVAL generator's web access; the skill AUTHORING /
// curation step (a separate path — run-skill-audit-loop.js) keeps full web research,
// because there "research IS the curation mechanism." See
// docs/skill-audit-loop-philosophy.md § "The eval baseline's web access" and
// § "The lockstep parity invariant".
//
// `parity_ok: false` ⇒ the run is INVALID and may NEVER certify a skill
// (APPLICABLE / PASS unreachable). The synthesizer and the verdict-stamper must
// treat a parity failure as a hard stop, not a soft warning.
//
// SCOPE — generators vs graders (GPT-5.5 review F3, 2026-06-03). The tools-ON
// profile applies to the two GENERATORS (the measured agents that research +
// answer the eval task). The GRADERS receive an IDENTICAL CLOSED evidence packet
// (the prompt + the fixed candidate response) and run WITHOUT tools — a judge that
// browses mid-grade is non-deterministic and gradeable-from-the-prompt-alone is
// the reliability contract. Grader parity is therefore "both graders closed and
// identical", which is the default; this module's per-CLI access (cliAccessForProfile)
// is the GENERATOR access map. Do not thread this profile into the grader CLIs.
//
// The private-content boundary (HARD): repo scope is the PUBLIC skill-graph repo
// + the skills tree + the open web — never the private workspace (Sales Hub /
// Printify / Shopify / customer / bank / personal data). `repoScope:
// 'skill-graph + skills ONLY'` + `cwd: <skill-graph>` declare the INTENDED scope;
// the operative fences today are (1) the prompt instruction and (2) the
// skill-audit-claim `next`/`claim` private-skill filter. NOTE (GPT-5.5 review F5):
// process cwd is NOT an OS-level read fence — an agent can still path-traverse to
// `../sales-hub`. True enforcement (an isolated temp checkout containing only the
// public trees, or a read whitelist) is a tracked follow-up; until then the
// boundary is prompt + claim-filter, not sandboxed. See memory
// `skill-graph-private-content-boundary`.

const path = require('path');

// The canonical profile values. These are the contract: any two directions whose
// recorded profiles differ on `tools`, `research`, or `repoScope` are NOT a
// parity run.
const TOOLS_FULL = 'full';
const RESEARCH_REPO_WEB = 'repo+web';
// Repo/exec tools ON, web OFF — the default eval-generator research allowance.
// A skill is measured against a baseline that cannot websearch (see header).
const RESEARCH_REPO_ONLY = 'repo';
const REPO_SCOPE_PUBLIC = 'skill-graph + skills ONLY';

/**
 * The default `research` allowance for an eval generator profile when the caller
 * does not pass one explicitly. Defaults to repo-only (NO web) per the owner
 * directive (2026-06-11): the eval baseline measures deployment value, not web
 * findability. `SKILL_EVAL_WEB=on` (or 1/true/yes) restores the web-enabled
 * baseline. An explicit `research` arg to buildExecutionProfile always wins.
 */
function resolveDefaultEvalResearch() {
  const env = (process.env.SKILL_EVAL_WEB || '').trim().toLowerCase();
  return ['1', 'on', 'true', 'yes'].includes(env) ? RESEARCH_REPO_WEB : RESEARCH_REPO_ONLY;
}

// The fields that MUST match across the two directions for parity to hold. cwd is
// included: both directions must run from the same working directory (the
// skill-graph repo) so neither can reach a wider/narrower file surface than the
// other.
const PARITY_FIELDS = ['tools', 'research', 'repoScope', 'cwd'];

/**
 * Build the canonical tools-ON eval execution profile.
 *
 * The profile is model-AGNOSTIC by design — it is handed to BOTH directions
 * unchanged, and only the per-CLI translation (cliAccessForProfile) differs so
 * each CLI reaches the SAME effective access. The model identity is NOT part of
 * the profile; it is the one variable the eval is allowed to change.
 *
 * @param {object}  opts
 * @param {string}  opts.cwd        Working directory for every CLI call — MUST be the
 *                                  skill-graph repo root (the public-content fence).
 * @param {string} [opts.tools]     Override the tools level (default 'full'). Lowering
 *                                  this defeats the assignment; only do so in a test.
 * @param {string} [opts.research]  Override the research allowance. Default is
 *                                  repo-only (NO web) via resolveDefaultEvalResearch();
 *                                  SKILL_EVAL_WEB=on restores 'repo+web'.
 * @param {string} [opts.repoScope] Override the repo scope (default public-only).
 * @returns {{ tools: string, research: string, repoScope: string, cwd: string }}
 */
function buildExecutionProfile({ cwd, tools, research, repoScope } = {}) {
  if (!cwd || typeof cwd !== 'string') {
    throw new Error('buildExecutionProfile: cwd is required (the skill-graph repo root — the public-content fence).');
  }
  return {
    tools: tools || TOOLS_FULL,
    research: research || resolveDefaultEvalResearch(),
    repoScope: repoScope || REPO_SCOPE_PUBLIC,
    cwd: path.resolve(cwd),
  };
}

/**
 * Translate the model-agnostic profile into the per-CLI access settings that give
 * EACH CLI the SAME effective access. Parity is "equal access," not "equal flags"
 * — each CLI reaches full tools differently (Claude must DROP --disallowed-tools;
 * Codex runs in its in-repo normal sandbox; Gemini turns tools on with --yolo /
 * --sandbox). Returns the access descriptor; callers thread it into the CLI shell.
 *
 * @param {string} cli      One of 'claude' | 'codex' | 'gemini' | 'opencode'.
 * @param {object} profile  The profile from buildExecutionProfile.
 * @returns {{ cli: string, allowTools: boolean, sandbox: string, web: boolean, note: string }}
 */
function cliAccessForProfile(cli, profile) {
  if (!profile || profile.tools !== TOOLS_FULL) {
    // A non-full profile is only valid in a test harness; never in a certifying run.
    return { cli, allowTools: false, sandbox: 'none', web: false, note: 'tools not full — NOT a parity/certifying configuration' };
  }
  const web = profile.research === RESEARCH_REPO_WEB;
  switch (cli) {
    case 'claude':
      // Repo/exec tools ON (Read/Edit/Bash/Grep/Glob). WebSearch/WebFetch are gated
      // by `web`: when web is OFF the caller appends --disallowed-tools
      // WebSearch,WebFetch. permission-mode default; cwd = profile.cwd.
      return { cli, allowTools: true, sandbox: 'default', web, note: `claude: repo/exec tools ON, web ${web ? 'ON' : 'OFF (--disallowed-tools WebSearch,WebFetch)'}, cwd=skill-graph` };
    case 'codex':
      // Codex runs in its in-repo sandbox (filesystem). Web is gated by `web` via
      // Codex's own config/search flag; OFF means no web-search enabled.
      return { cli, allowTools: true, sandbox: 'workspace-write', web, note: `codex: in-repo sandbox, web ${web ? 'ON' : 'OFF'}, cwd=skill-graph` };
    case 'gemini':
      // gemini --yolo has NO clean per-tool web disable; web OFF is best-effort
      // (prompt-level "do not web-search" instruction). Documented limitation.
      return { cli, allowTools: true, sandbox: 'yolo', web, note: `gemini: --yolo tools ON, web ${web ? 'ON' : 'OFF (best-effort)'}, cwd=skill-graph` };
    case 'opencode':
      return { cli, allowTools: true, sandbox: 'default', web, note: `opencode: tools ON, web ${web ? 'ON' : 'OFF'}, cwd=skill-graph` };
    default:
      return { cli, allowTools: true, sandbox: 'default', web, note: `${cli}: tools ON, web ${web ? 'ON' : 'OFF'}, cwd=skill-graph` };
  }
}

/**
 * Assert that the two bidirectional directions ran under the SAME profile.
 *
 * Compares the PARITY_FIELDS (tools / research / repoScope / cwd) of the two
 * recorded profiles. Any mismatch ⇒ parity_ok:false with the offending fields
 * listed. A missing profile on either side is itself a parity failure — an
 * unrecorded profile cannot be proven equal.
 *
 * This is the in-code form of the HARD invariant in
 * docs/skill-audit-loop-philosophy.md § "Permission parity = equal full tool
 * access". A `parity_ok:false` result means the run measured "who got to peek,"
 * not the model — it may never certify a skill.
 *
 * @param {object} profileClaude  The Claude direction's recorded execution profile (first arg).
 * @param {object} profileCodex   The Codex direction's recorded execution profile (second arg).
 * @returns {{ parity_ok: boolean, mismatches: Array<{field:string, a:*, b:*}>, reason: string }}
 */
function assertParity(profileClaude, profileCodex) {
  const mismatches = [];
  if (!profileClaude || typeof profileClaude !== 'object') {
    return { parity_ok: false, mismatches: [{ field: 'direction_claude', a: null, b: profileCodex || null }], reason: 'Claude direction recorded no execution profile — cannot prove parity' };
  }
  if (!profileCodex || typeof profileCodex !== 'object') {
    return { parity_ok: false, mismatches: [{ field: 'direction_codex', a: profileClaude || null, b: null }], reason: 'Codex direction recorded no execution profile — cannot prove parity' };
  }
  for (const field of PARITY_FIELDS) {
    if (profileClaude[field] !== profileCodex[field]) {
      mismatches.push({ field, a: profileClaude[field], b: profileCodex[field] });
    }
  }
  if (mismatches.length > 0) {
    const summary = mismatches.map((m) => `${m.field} (Claude=${JSON.stringify(m.a)} ≠ Codex=${JSON.stringify(m.b)})`).join('; ');
    return { parity_ok: false, mismatches, reason: `execution-profile mismatch across directions: ${summary} — INVALID run (measured permissions, not the model)` };
  }
  // Parity holds, but a non-full profile is still not a certifying configuration.
  if (profileClaude.tools !== TOOLS_FULL) {
    return { parity_ok: true, mismatches: [], reason: `profiles match but tools='${profileClaude.tools}' is not '${TOOLS_FULL}' — equal but not a tools-ON certifying configuration` };
  }
  return { parity_ok: true, mismatches: [], reason: `equal full tool access both directions (tools=${profileClaude.tools}, research=${profileClaude.research}, repoScope='${profileClaude.repoScope}')` };
}

module.exports = {
  TOOLS_FULL,
  RESEARCH_REPO_WEB,
  RESEARCH_REPO_ONLY,
  REPO_SCOPE_PUBLIC,
  PARITY_FIELDS,
  resolveDefaultEvalResearch,
  buildExecutionProfile,
  cliAccessForProfile,
  assertParity,
};
