#!/usr/bin/env node
'use strict';

// ─── Findings Filter (Human in the Loop) — the firewall brain ──────────────────────────────
//
// Triages findings BEFORE they reach human review, so the developer only ever sees the small set
// that needs THEIR judgment. Everything else is dropped (machine-trash) or routed to a non-human
// path. Design (GPT-5.5-reviewed):
//
//   • Regex is a first-pass REJECTOR only: it may confidently DROP obvious garbage; it must NEVER
//     confidently route anything risky to automatic handling. If unsure → REVIEW.
//   • Classification ≠ execution permission. Buckets: DROP / VERIFY / AUTO-FILE / REVIEW. No AUTO-FIX.
//   • Provenance routes: only AUTO-detected telemetry may DROP; a human/audit-emitted finding never
//     drops (at least VERIFY/REVIEW).
//   • Context matters: security/privacy/financial findings often have NO obvious keyword
//     ("uses query instead of orgQuery", "email in client props", "double counts refunds") — the
//     REVIEW triggers include those context signals, and the conservative default catches the rest.
//   • Clusters near-duplicates (one representative + occurrence count).
//   • Explainable: every finding records WHY it landed in its bucket.
//
// Usage:
//   node scripts/classify-findings.js --findings-file <ledger.json|.md> [--status-file <hb.json>]
//     [--out <classified.json>] [--repo-root <dir>] [--calibrate]

const fs = require('fs');
const path = require('path');
const fr = require('../lib/audit/finding-review');

const TRIAGE = ['drop', 'verify', 'auto-file', 'review'];

const TELEMETRY_RE = /\bstall\b|\bidle\b|\[progress\]|read \d+\+? times|consecutive empty|no-?writes|no-?commit|sequence-repeats|multi-signal stall|turns since/i;
const TRANSIENT_RE = /\bbuild failed\b|\bcommand failed\b|\bexit code \d+\b|\bexit \d+\b|module_not_found|permission denied|\benoent\b|timed? ?out|command not found/i;
const GROUNDED = /(`[^`]+`|\b[\w./-]+\.(js|ts|tsx|jsx|md|json|sh|py|scss|css|sql|ya?ml)\b|\b(SH|SKI|JB)-\d+\b|:\d+\b|\bline \d+\b)/i;
const HEDGE = /\b(should|might|maybe|consider|possibly|appears?|seems?|likely|could|perhaps|probably|in theory)\b/i;

// STRONG_RISK / DECISION are the ONLY signals that pull a finding to REVIEW. They are narrow on purpose
// (broad regex over-matched and ballooned REVIEW to 778/980). The context signals GPT-5.5 flagged for the
// keyword-less security/privacy/financial cases (orgId, query-vs-orgQuery, client props, gross/net, refund)
// are included here so those still reach the human despite having no obvious keyword.
const STRONG_RISK = /\b(privacy|gdpr|pii\b|secret|credential|token|api[- ]?key|leak(ed|s|age)?|\brls\b|auth(n|z|entication|orization)?|tenant|org[- ]?id|orgquery|raw row|client props|cross-org|\bgross\b|\bnet\b|refund|revenue|profit|\btax\b|payment|stripe|financial invariant|webhook (sig|verif)|\bcsp\b|customer data|delete[ds]?\b|deletion|drop table|truncate|rm -rf|git rm|force-push|destructive|data migration|backfill|retention policy)\b/i;
const DECISION = /\b(deprecat\w+|\brestore\b|repoint|architect\w*|trade-?off|needs? (a )?human|human decision|decide between|ambiguous|or whether|multiple (options|outcomes|ways)|breaking change|relax\w* (the )?(validator|assertion|test)|ts-ignore|eslint-disable|weaken\w* (the )?(test|assertion))\b/i;

function blob(f) {
  return [f.title, f.detail, f.severity, f.skill, f.model, f.verdict, f.source, f.note, ...(f.peek || []).map((p) => p.text)]
    .filter(Boolean).join(' ');
}

// Provenance: deliberately-emitted (human or audit agent) vs auto-detected telemetry. Only AUTO may DROP.
function provenance(f) {
  const t = (f.skill || '').toLowerCase();
  if (t === 'manual' || t === 'feedback' || t === 'insight') return 'emitted';
  if (/manual|human|audit|reviewer/i.test(f.source || '')) return 'emitted';
  return 'auto';
}

function isHighStakesSeverity(sev) {
  return /^(critical|p0|p1|high)$/i.test(String(sev || '').trim());
}

// Cheap freshness: does the first cited file path still exist in the repo? Best-effort; missing path
// does NOT prove the issue is gone (conceptual findings survive refactors) — it only downgrades trust.
function freshnessOf(f, repoRoot) {
  const text = blob(f);
  const m = text.match(/\b([\w][\w./-]*\.(?:js|ts|tsx|jsx|md|json|sh|py|scss|css|sql|ya?ml))\b/);
  if (!m) return { checked: false, stale: false, path: null };
  const rel = m[1].replace(/^\.?\//, '');
  const candidates = [path.join(repoRoot, rel), path.join(repoRoot, 'skill-graph', rel), path.resolve(rel)];
  const exists = candidates.some((p) => { try { return fs.existsSync(p); } catch (_) { return false; } });
  return { checked: true, stale: !exists, path: rel };
}

function classifyOne(f, repoRoot) {
  const text = blob(f);
  const prov = provenance(f);
  const grounded = GROUNDED.test(text);
  const risk = STRONG_RISK.test(text);
  const decision = DECISION.test(text);
  const reviewReasons = [];
  if (risk) reviewReasons.push('security/privacy/financial/destructive');
  if (decision) reviewReasons.push('multiple-outcome / decision');

  if (prov === 'auto') {
    // Auto-detected machine output: drop trash aggressively; only a STRONG signal earns the human.
    if (TELEMETRY_RE.test(text)) return { triage: 'drop', triage_reasons: ['telemetry / progress noise'], provenance: prov };
    if (TRANSIENT_RE.test(text) && !grounded) return { triage: 'drop', triage_reasons: ['transient ops error, no concrete target'], provenance: prov };
    if ((risk || decision) && grounded) return { triage: 'review', triage_reasons: reviewReasons, provenance: prov };
    if (HEDGE.test(text) && !grounded) return { triage: 'drop', triage_reasons: ['vague + ungroundable'], provenance: prov };
    if (grounded) {
      const fresh = freshnessOf(f, repoRoot);
      if (fresh.checked && fresh.stale) return { triage: 'drop', triage_reasons: [`auto-detected, cited path ${fresh.path} gone from HEAD`], provenance: prov, freshness: fresh };
      return { triage: 'auto-file', triage_reasons: ['concrete auto-detected — file candidate'], provenance: prov, freshness: fresh };
    }
    return { triage: 'drop', triage_reasons: ['auto-detected churn, no concrete target or risk'], provenance: prov };
  }

  // Emitted (deliberate human/audit finding): REVIEW only on a genuine risk/decision signal — a high
  // severity alone is NOT a decision (most emitted high-stakes are concrete bugs to just fix, or already
  // fixed). Those route to AUTO-FILE so the agent acts on them, never silently dropped (GPT-5.5: emitted
  // high-stakes is never auto-FIXED blind, but recording it as a file-candidate is safe). Freshness tags
  // a high-stakes emitted finding whose cited path is gone so triage can confirm it's already resolved.
  if (risk || decision) return { triage: 'review', triage_reasons: reviewReasons, provenance: prov };
  const fresh = freshnessOf(f, repoRoot);
  const hs = isHighStakesSeverity(f.severity);
  return {
    triage: 'auto-file',
    triage_reasons: [hs ? 'emitted high-stakes — file candidate (agent acts; not a human decision)' : 'emitted observation — recorded, no decision needed'],
    provenance: prov,
    freshness: fresh,
  };
}

function clusterKey(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/[`"']/g, '')
    .replace(/\b[\w./-]+\.\w+\b/g, '<path>')
    .replace(/\b(sh|ski|jb)-\d+\b/gi, '<id>')
    .replace(/\d+/g, 'N')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

function classifyFindings(findings, opts = {}) {
  const repoRoot = opts.repoRoot || process.cwd();
  const tagged = (Array.isArray(findings) ? findings : []).map((f) => {
    const c = classifyOne(f, repoRoot);
    return { ...f, ...c };
  });
  // Cluster near-duplicates by normalized title; representative = first (highest severity wins ties).
  const sevRank = { critical: 0, high: 1, medium: 2, low: 3 };
  const groups = new Map();
  tagged.forEach((f) => { const k = clusterKey(f.title); (groups.get(k) || groups.set(k, []).get(k)).push(f); });
  const clusters = [];
  for (const [key, members] of groups) {
    members.sort((a, b) => (sevRank[a.severity] == null ? 9 : sevRank[a.severity]) - (sevRank[b.severity] == null ? 9 : sevRank[b.severity]));
    const repId = members[0].id;
    members.forEach((m) => { m.cluster_id = key; m.cluster_size = members.length; m.is_representative = (m.id === repId); });
    clusters.push({ key, size: members.length, representative: repId, triage: members[0].triage });
  }
  const counts = { total: tagged.length, clusters: clusters.length };
  for (const t of TRIAGE) counts[t] = tagged.filter((f) => f.triage === t).length;
  counts.review_clusters = clusters.filter((c) => c.triage === 'review').length;
  return { findings: tagged, clusters, counts };
}

// ── CLI ──
function parseArgs(argv) {
  const v = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i]; if (!a.startsWith('--')) continue;
    const k = a.slice(2); const n = argv[i + 1];
    if (n === undefined || n.startsWith('--')) v[k] = true; else { v[k] = n; i += 1; }
  }
  return v;
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  const findingsFile = args['findings-file'] && path.resolve(args['findings-file']);
  const statusFile = args['status-file'] && path.resolve(args['status-file']);
  const repoRoot = args['repo-root'] ? path.resolve(args['repo-root']) : path.resolve(__dirname, '..', '..');
  if (!findingsFile && !statusFile) { process.stderr.write('Usage: node scripts/classify-findings.js --findings-file <file> [--status-file <hb>] [--out <file>] [--repo-root <dir>] [--calibrate]\n'); process.exit(2); }
  const readJson = (p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (_) { return null; } };
  const fromHb = statusFile ? fr.extractFindings(readJson(statusFile) || {}) : [];
  const fromFile = findingsFile ? fr.loadFindingsFile(findingsFile) : [];
  const findings = fr.mergeFindings(fromHb, fromFile);
  const result = classifyFindings(findings, { repoRoot });
  const out = args.out ? path.resolve(args.out) : `${findingsFile || statusFile}.classified.json`;
  fs.writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`);
  const c = result.counts;
  process.stdout.write(`Findings Filter — classified ${c.total} findings into ${c.clusters} clusters\n`);
  process.stdout.write(`  DROP ${c.drop} · VERIFY ${c.verify} · AUTO-FILE ${c['auto-file']} · REVIEW ${c.review} (${c.review_clusters} clusters)\n`);
  process.stdout.write(`  → ${out}\n`);
  if (args.calibrate) {
    const sample = (t, n) => result.findings.filter((f) => f.triage === t && f.is_representative).sort(() => 0.5).slice(0, n);
    for (const t of TRIAGE) {
      process.stdout.write(`\n=== ${t.toUpperCase()} sample (representatives) ===\n`);
      sample(t, 20).forEach((f, i) => process.stdout.write(`  ${i + 1}. [${f.severity || '?'}] ${(f.title || '').slice(0, 80)}  «${(f.triage_reasons || []).join('; ')}»${f.cluster_size > 1 ? ` (+${f.cluster_size - 1} dupes)` : ''}\n`));
    }
  }
}

module.exports = { classifyFindings, classifyOne, clusterKey, TRIAGE };
