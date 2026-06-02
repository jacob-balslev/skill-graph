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
// WHY tools are ON (not OFF): research IS the curation mechanism. The audit loop
// exists to fold "the best solution we and the best models can assemble" into
// each skill; you cannot do that while forbidding the agent to look anything up.
// See docs/audit-loop-enrich-philosophy.md § "WHY two fully-tooled frontier
// models" and § "The lockstep parity invariant". Permission parity means EQUAL
// FULL ACCESS, never equal-zero — a different per-provider permission set would
// mean we measured "who got to peek," not the model.
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
const REPO_SCOPE_PUBLIC = 'skill-graph + skills ONLY';

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
 * @param {string} [opts.research]  Override the research allowance (default 'repo+web').
 * @param {string} [opts.repoScope] Override the repo scope (default public-only).
 * @returns {{ tools: string, research: string, repoScope: string, cwd: string }}
 */
function buildExecutionProfile({ cwd, tools, research, repoScope } = {}) {
  if (!cwd || typeof cwd !== 'string') {
    throw new Error('buildExecutionProfile: cwd is required (the skill-graph repo root — the public-content fence).');
  }
  return {
    tools: tools || TOOLS_FULL,
    research: research || RESEARCH_REPO_WEB,
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
      // Equal access: DROP --disallowed-tools so Read/Edit/Bash/Grep/Glob/WebSearch/
      // WebFetch are all available. permission-mode default; cwd = profile.cwd.
      return { cli, allowTools: true, sandbox: 'default', web, note: 'claude: drop --disallowed-tools (full tools), cwd=skill-graph' };
    case 'codex':
      // Equal access: Codex runs in its normal in-repo sandbox (filesystem + web as
      // configured). No special flags — the in-repo sandbox IS its full-access mode.
      return { cli, allowTools: true, sandbox: 'workspace-write', web, note: 'codex: in-repo normal sandbox (full tools), cwd=skill-graph' };
    case 'gemini':
      return { cli, allowTools: true, sandbox: 'yolo', web, note: 'gemini: --yolo / --sandbox (tools on), cwd=skill-graph' };
    case 'opencode':
      return { cli, allowTools: true, sandbox: 'default', web, note: 'opencode: tools on, cwd=skill-graph' };
    default:
      return { cli, allowTools: true, sandbox: 'default', web, note: `${cli}: tools on (default), cwd=skill-graph` };
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
 * docs/audit-loop-enrich-philosophy.md § "Permission parity = equal full tool
 * access". A `parity_ok:false` result means the run measured "who got to peek,"
 * not the model — it may never certify a skill.
 *
 * @param {object} profileA  Direction A's recorded execution profile.
 * @param {object} profileB  Direction B's recorded execution profile.
 * @returns {{ parity_ok: boolean, mismatches: Array<{field:string, a:*, b:*}>, reason: string }}
 */
function assertParity(profileA, profileB) {
  const mismatches = [];
  if (!profileA || typeof profileA !== 'object') {
    return { parity_ok: false, mismatches: [{ field: 'direction_a', a: null, b: profileB || null }], reason: 'direction A recorded no execution profile — cannot prove parity' };
  }
  if (!profileB || typeof profileB !== 'object') {
    return { parity_ok: false, mismatches: [{ field: 'direction_b', a: profileA || null, b: null }], reason: 'direction B recorded no execution profile — cannot prove parity' };
  }
  for (const field of PARITY_FIELDS) {
    if (profileA[field] !== profileB[field]) {
      mismatches.push({ field, a: profileA[field], b: profileB[field] });
    }
  }
  if (mismatches.length > 0) {
    const summary = mismatches.map((m) => `${m.field} (A=${JSON.stringify(m.a)} ≠ B=${JSON.stringify(m.b)})`).join('; ');
    return { parity_ok: false, mismatches, reason: `execution-profile mismatch across directions: ${summary} — INVALID run (measured permissions, not the model)` };
  }
  // Parity holds, but a non-full profile is still not a certifying configuration.
  if (profileA.tools !== TOOLS_FULL) {
    return { parity_ok: true, mismatches: [], reason: `profiles match but tools='${profileA.tools}' is not '${TOOLS_FULL}' — equal but not a tools-ON certifying configuration` };
  }
  return { parity_ok: true, mismatches: [], reason: `equal full tool access both directions (tools=${profileA.tools}, research=${profileA.research}, repoScope='${profileA.repoScope}')` };
}

module.exports = {
  TOOLS_FULL,
  RESEARCH_REPO_WEB,
  REPO_SCOPE_PUBLIC,
  PARITY_FIELDS,
  buildExecutionProfile,
  cliAccessForProfile,
  assertParity,
};
