import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import React from "react";
import findingReview from "../../lib/audit/finding-review.js";
import classifyModule from "../../scripts/classify-findings.js";

const {
  GROUP_BY,
  SORT_BY,
  applyFindingDecision,
  decisionCounts,
  decisionFor,
  extractFindings,
  filterFindings,
  loadFindingsFile,
  loadReviewState,
  loadReviewViews,
  mergeFindings,
  normalizeGroupBy,
  normalizeSort,
  sortFindings,
  writeReviewState,
} = findingReview;
const {classifyFindings} = classifyModule;

const HOOK_FILE = fileURLToPath(import.meta.url);
const HOOK_DIR = path.dirname(HOOK_FILE);
const DEFAULT_REVIEW_VIEWS = path.resolve(HOOK_DIR, "..", "..", "skill-audit-loop", "review-views.json");
const HIGH_STAKES_SEVERITY = /^(p0|p1|critical|high)$/i;
const FLAG_TEXT = /\b(privacy|gdpr|pii\b|secret|credential|token|api[- ]?key|leak|rls\b|auth|tenant|org[- ]?id|orgquery|client props|cross-org|gross|net|refund|revenue|profit|tax|payment|stripe|delete|deletion|drop table|truncate|rm -rf|force-push|destructive|ambiguous|human decision|breaking change)\b/i;

function absOrNull(value) {
  return value ? path.resolve(value) : null;
}

export function defaultReviewFile({statusFile, findingsFile, reviewFile} = {}) {
  if (reviewFile) return path.resolve(reviewFile);
  if (statusFile) return `${path.resolve(statusFile)}.findings-review.json`;
  if (findingsFile) return `${path.resolve(findingsFile)}.review.json`;
  return null;
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (_) {
    return null;
  }
}

function sourceFor({statusFile, findingsFile} = {}) {
  const source = {};
  if (statusFile) source.status_file = path.resolve(statusFile);
  if (findingsFile) source.findings_file = path.resolve(findingsFile);
  return source;
}

function firstText(...values) {
  for (const value of values) {
    if (Array.isArray(value)) {
      const nested = firstText(...value);
      if (nested) return nested;
    } else if (value != null) {
      const text = String(value).replace(/\s+/g, " ").trim();
      if (text) return text;
    }
  }
  return null;
}

function findingBlob(finding) {
  const raw = finding && finding.raw && typeof finding.raw === "object" ? finding.raw : {};
  return [
    finding && finding.title,
    finding && finding.detail,
    finding && finding.severity,
    finding && finding.category,
    finding && finding.skill,
    finding && finding.model,
    finding && finding.verdict,
    raw.evidence,
    raw.requiredAction,
    raw.required_action,
    raw.sourceRef,
    ...(finding && Array.isArray(finding.peek) ? finding.peek.map((p) => p.text) : []),
  ].filter(Boolean).join(" ");
}

export function isFlaggedFinding(finding) {
  if (!finding) return false;
  if (finding.triage === "review") return true;
  if (HIGH_STAKES_SEVERITY.test(String(finding.severity || ""))) return true;
  if ((finding.triage_reasons || []).some((reason) => FLAG_TEXT.test(String(reason || "")))) return true;
  return FLAG_TEXT.test(findingBlob(finding));
}

export function enrichFinding(finding) {
  const raw = finding && finding.raw && typeof finding.raw === "object" ? finding.raw : {};
  const category = firstText(
    finding && finding.category,
    raw.category,
    raw.claimType,
    raw.claim_type,
    raw.surface,
  );
  const evidence = firstText(raw.evidence, raw.evidence_strength, finding && finding.detail);
  const requiredAction = firstText(raw.requiredAction, raw.required_action, raw.action, raw.status);
  const modelProvenance = firstText(
    finding && finding.model,
    finding && finding.source,
    raw.surfaced_by,
    raw.corroborated_by,
    raw.accepted_by,
    raw.sourceRef,
    raw.source_ref,
  );
  const next = {
    ...finding,
    category: category || "(none)",
    evidence,
    requiredAction,
    modelProvenance,
  };
  next.flagged = isFlaggedFinding(next);
  return next;
}

export function classifyAndEnrichFindings(findings, {repoRoot = process.cwd()} = {}) {
  const result = classifyFindings(Array.isArray(findings) ? findings : [], {repoRoot});
  const enriched = result.findings.map(enrichFinding);
  return {...result, findings: enriched};
}

function normalizeFilters(filters = {}) {
  return {
    text: firstText(filters.text, filters.filter) || null,
    severity: firstText(filters.severity) || null,
    category: firstText(filters.category) || null,
    disposition: firstText(filters.disposition, filters.verdict) || null,
    skill: firstText(filters.skill) || null,
    model: firstText(filters.model) || null,
  };
}

export function applyReviewFilters(findings, filters = {}) {
  const normalized = normalizeFilters(filters);
  const base = filterFindings(findings, {
    text: normalized.text,
    skill: normalized.skill,
    model: normalized.model,
    verdict: normalized.disposition,
  });
  return base.filter((finding) => {
    if (normalized.severity && !String(finding.severity || "").toLowerCase().includes(normalized.severity.toLowerCase())) {
      return false;
    }
    if (normalized.category && !String(finding.category || "").toLowerCase().includes(normalized.category.toLowerCase())) {
      return false;
    }
    if (normalized.disposition && !String(finding.verdict || "").toLowerCase().includes(normalized.disposition.toLowerCase())) {
      return false;
    }
    return true;
  });
}

export function sortFlaggedFindings(findings, sortBy = "disposition-priority", reviewState = {}) {
  const sorted = sortFindings(findings, sortBy, reviewState);
  const rank = new Map(sorted.map((finding, index) => [finding.id, index]));
  return sorted.slice().sort((a, b) => {
    const fa = a && a.flagged ? 0 : 1;
    const fb = b && b.flagged ? 0 : 1;
    return fa - fb || (rank.get(a.id) || 0) - (rank.get(b.id) || 0);
  });
}

export function loadFindingsSources({heartbeat, statusFile, findingsFile} = {}) {
  const statusHeartbeat = heartbeat || (statusFile ? readJson(path.resolve(statusFile)) : null);
  const fromHeartbeat = statusHeartbeat ? extractFindings(statusHeartbeat) : [];
  const fromFile = findingsFile ? loadFindingsFile(path.resolve(findingsFile)) : [];
  return mergeFindings(fromHeartbeat, fromFile);
}

export function loadReviewSnapshot({
  heartbeat,
  statusFile,
  findingsFile,
  reviewFile,
  viewsFile,
  filters,
  groupBy = "none",
  sortBy = "disposition-priority",
  repoRoot = process.cwd(),
} = {}) {
  const absStatusFile = absOrNull(statusFile);
  const absFindingsFile = absOrNull(findingsFile);
  const absReviewFile = defaultReviewFile({statusFile: absStatusFile, findingsFile: absFindingsFile, reviewFile});
  const source = sourceFor({statusFile: absStatusFile, findingsFile: absFindingsFile});
  const rawFindings = loadFindingsSources({heartbeat, statusFile: absStatusFile, findingsFile: absFindingsFile});
  const classified = classifyAndEnrichFindings(rawFindings, {repoRoot});
  const reviewState = loadReviewState(absReviewFile, source);
  const normalizedFilters = normalizeFilters(filters);
  const normalizedSort = normalizeSort(sortBy);
  const normalizedGroup = normalizeGroupBy(groupBy);
  const filtered = applyReviewFilters(classified.findings, normalizedFilters);
  const visibleFindings = sortFlaggedFindings(filtered, normalizedSort, reviewState);
  const allCounts = decisionCounts(classified.findings, reviewState);
  const visibleCounts = decisionCounts(visibleFindings, reviewState);
  const views = loadReviewViews(viewsFile || DEFAULT_REVIEW_VIEWS);

  return {
    allCounts,
    allFindings: classified.findings,
    classified,
    filters: normalizedFilters,
    groupBy: normalizedGroup,
    isComplete: allCounts.total > 0 && allCounts.pending === 0,
    reviewFile: absReviewFile,
    reviewState,
    sortBy: normalizedSort,
    source,
    visibleCounts,
    visibleFindings,
    views,
    viewsFile: viewsFile || DEFAULT_REVIEW_VIEWS,
  };
}

export function writeFindingDecision({
  findingId,
  decision,
  note,
  reviewFile,
  source,
} = {}) {
  if (!findingId) throw new Error("findingId is required");
  if (!reviewFile) throw new Error("reviewFile is required before a finding decision can be saved");
  const latest = loadReviewState(reviewFile, source || {});
  const next = applyFindingDecision(latest, findingId, decision, undefined, note);
  next.source = {...(source || {}), ...(next.source || {})};
  writeReviewState(reviewFile, next);
  return next;
}

function nextItem(values, current) {
  const index = values.indexOf(current);
  return values[(index >= 0 ? index + 1 : 0) % values.length];
}

export default function useReviewState({
  heartbeat,
  statusFile,
  findingsFile,
  reviewFile,
  viewsFile,
  filters: initialFilters,
  groupBy: initialGroupBy = "none",
  sortBy: initialSortBy = "disposition-priority",
  repoRoot = process.cwd(),
  watch = true,
} = {}) {
  const [filters, setFilters] = React.useState(() => normalizeFilters(initialFilters));
  const [groupBy, setGroupBy] = React.useState(() => normalizeGroupBy(initialGroupBy));
  const [sortBy, setSortBy] = React.useState(() => normalizeSort(initialSortBy));
  const [viewIndex, setViewIndex] = React.useState(-1);
  const [refreshToken, setRefreshToken] = React.useState(0);

  React.useEffect(() => setFilters(normalizeFilters(initialFilters)), [JSON.stringify(normalizeFilters(initialFilters))]);
  React.useEffect(() => setGroupBy(normalizeGroupBy(initialGroupBy)), [initialGroupBy]);
  React.useEffect(() => setSortBy(normalizeSort(initialSortBy)), [initialSortBy]);

  const snapshot = React.useMemo(() => loadReviewSnapshot({
    heartbeat,
    statusFile,
    findingsFile,
    reviewFile,
    viewsFile,
    filters,
    groupBy,
    sortBy,
    repoRoot,
  }), [
    heartbeat,
    statusFile,
    findingsFile,
    reviewFile,
    viewsFile,
    JSON.stringify(filters),
    groupBy,
    sortBy,
    repoRoot,
    refreshToken,
  ]);

  React.useEffect(() => {
    if (!watch) return undefined;
    const files = [findingsFile, snapshot.reviewFile].filter(Boolean).map((file) => path.resolve(file));
    const watchers = [];
    let timer = null;
    const refresh = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setRefreshToken((value) => value + 1), 75);
      if (typeof timer.unref === "function") timer.unref();
    };
    for (const file of files) {
      try {
        const watcher = fs.watch(path.dirname(file), (eventType, filename) => {
          if (!filename || String(filename) === path.basename(file)) refresh();
        });
        watcher.on("error", refresh);
        watchers.push(watcher);
      } catch (_) {
        // Missing files are normal before the first review decision.
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
      watchers.forEach((watcher) => watcher.close());
    };
  }, [findingsFile, snapshot.reviewFile, watch]);

  const decide = React.useCallback((findingId, decision, note) => {
    const nextState = writeFindingDecision({
      findingId,
      decision,
      note,
      reviewFile: snapshot.reviewFile,
      source: snapshot.source,
    });
    setRefreshToken((value) => value + 1);
    return nextState;
  }, [snapshot.reviewFile, JSON.stringify(snapshot.source)]);

  const cycleSort = React.useCallback(() => {
    setSortBy((current) => nextItem(SORT_BY, current));
    setViewIndex(-1);
  }, []);

  const cycleGroupBy = React.useCallback(() => {
    setGroupBy((current) => nextItem(GROUP_BY, current));
    setViewIndex(-1);
  }, []);

  const cycleView = React.useCallback(() => {
    const views = snapshot.views || [];
    if (!views.length) return null;
    const nextIndex = (viewIndex + 1) % views.length;
    const view = views[nextIndex];
    setViewIndex(nextIndex);
    setFilters(normalizeFilters({
      text: view.filter,
      skill: view.skill,
      model: view.model,
      disposition: view.verdict,
      severity: view.severity,
      category: view.category,
    }));
    setGroupBy(normalizeGroupBy(view.group_by));
    setSortBy(normalizeSort(view.sort));
    return view;
  }, [snapshot.views, viewIndex]);

  return {
    ...snapshot,
    cycleGroupBy,
    cycleSort,
    cycleView,
    decide,
    decisionFor: (finding) => decisionFor(finding, snapshot.reviewState),
    refresh: () => setRefreshToken((value) => value + 1),
    setFilters,
    setGroupBy,
    setSortBy,
    viewIndex,
    viewName: viewIndex >= 0 && snapshot.views[viewIndex] ? snapshot.views[viewIndex].name : null,
  };
}
