import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import {fileURLToPath} from "node:url";
import React from "react";
import htm from "htm";
import {Box, render, useApp, useFocusManager, useInput} from "ink";
import breadcrumbLib from "./lib/breadcrumb.js";
import Breadcrumb from "./components/Breadcrumb.mjs";
import FindingsReview, {FINDINGS_REVIEW_FOCUS_ID} from "./components/FindingsReview.mjs";
import RunPanel, {RUN_PANEL_FOCUS_ID} from "./components/RunPanel.mjs";
import SessionList, {SESSION_LIST_FOCUS_ID} from "./components/SessionList.mjs";
import StatusBar from "./components/StatusBar.mjs";
import useHeartbeat from "./hooks/useHeartbeat.mjs";
import useReviewState from "./hooks/useReviewState.mjs";
import useSessions from "./hooks/useSessions.mjs";

const html = htm.bind((type, props, ...children) => React.createElement(
  {Box}[type] || type,
  props,
  ...children,
));
const {createBreadcrumb} = breadcrumbLib;
const APP_FILE = fileURLToPath(import.meta.url);
const APP_DIR = path.dirname(APP_FILE);
const DEFAULT_AUDIT_ROOT = path.join(APP_DIR, "..", "skill-audit-loop", "progress", "skill-audits");

const DEFAULT_CURSOR = [
  {id: "session", label: "Session"},
  {id: "skill", label: "Skill"},
  {id: "run", label: "Run"},
  {id: "phase", label: "Phase"},
  {id: "finding", label: "Finding"},
];

const FOCUS_ORDER = [
  SESSION_LIST_FOCUS_ID,
  RUN_PANEL_FOCUS_ID,
  FINDINGS_REVIEW_FOCUS_ID,
];

function createNavigation(cursorSegments, activeIndex = null) {
  const nav = createBreadcrumb(cursorSegments);
  if (Number.isInteger(activeIndex) && cursorSegments.length) {
    nav.jumpTo(Math.max(0, Math.min(activeIndex, cursorSegments.length - 1)));
  }
  return nav;
}

function navigationSnapshot(nav) {
  const segments = nav.segments();
  const current = nav.current();
  const activeIndex = current
    ? segments.findIndex((segment) => segment.id === current.id)
    : -1;
  return {
    segments,
    activeIndex: activeIndex >= 0 ? activeIndex : 0,
  };
}

function parseArgs(args) {
  const options = {
    auditRoot: undefined,
    filters: {},
    findingsFile: undefined,
    groupBy: "none",
    help: false,
    noInput: false,
    once: false,
    reviewFile: undefined,
    sortBy: "disposition-priority",
    statusFile: undefined,
    viewsFile: undefined,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--once") {
      options.once = true;
      options.noInput = true;
    } else if (arg === "--no-input") {
      options.once = true;
      options.noInput = true;
    } else if (arg === "--audit-root" && args[i + 1]) {
      options.auditRoot = args[i + 1];
      i += 1;
    } else if ((arg === "--status-file" || arg === "--heartbeat") && args[i + 1]) {
      options.statusFile = args[i + 1];
      i += 1;
    } else if (arg === "--findings-file" && args[i + 1]) {
      options.findingsFile = args[i + 1];
      i += 1;
    } else if (arg === "--review-file" && args[i + 1]) {
      options.reviewFile = args[i + 1];
      i += 1;
    } else if (arg === "--views-file" && args[i + 1]) {
      options.viewsFile = args[i + 1];
      i += 1;
    } else if (arg === "--sort" && args[i + 1]) {
      options.sortBy = args[i + 1];
      i += 1;
    } else if (arg === "--group-by" && args[i + 1]) {
      options.groupBy = args[i + 1];
      i += 1;
    } else if ((arg === "--filter" || arg === "--text") && args[i + 1]) {
      options.filters.text = args[i + 1];
      i += 1;
    } else if (arg === "--severity" && args[i + 1]) {
      options.filters.severity = args[i + 1];
      i += 1;
    } else if (arg === "--category" && args[i + 1]) {
      options.filters.category = args[i + 1];
      i += 1;
    } else if ((arg === "--disposition" || arg === "--verdict") && args[i + 1]) {
      options.filters.disposition = args[i + 1];
      i += 1;
    } else if (arg === "--skill" && args[i + 1]) {
      options.filters.skill = args[i + 1];
      i += 1;
    } else if (arg === "--model" && args[i + 1]) {
      options.filters.model = args[i + 1];
      i += 1;
    }
  }

  return options;
}

export function discoverLatestHeartbeat({auditRoot} = {}) {
  const root = path.resolve(auditRoot || DEFAULT_AUDIT_ROOT);
  const names = ["panel-status.json", "status.json"];
  const candidates = [];
  let entries = [];
  try {
    entries = fs.readdirSync(root, {withFileTypes: true});
  } catch (_) {
    return null;
  }

  for (const entry of entries) {
    const parent = entry.isDirectory() ? path.join(root, entry.name) : root;
    if (!entry.isDirectory() && !names.includes(entry.name)) continue;
    for (const name of entry.isDirectory() ? names : [entry.name]) {
      const file = path.join(parent, name);
      try {
        const stat = fs.statSync(file);
        if (stat.isFile()) candidates.push({file, mtimeMs: stat.mtimeMs});
      } catch (_) {
        // Ignore disappearing files; active heartbeat writers may rename atomically.
      }
    }
  }

  candidates.sort((a, b) => b.mtimeMs - a.mtimeMs || b.file.localeCompare(a.file));
  return candidates.length ? candidates[0].file : null;
}

function oneLine(value, max = 34) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.length > max ? `${text.slice(0, Math.max(0, max - 3))}...` : text;
}

function runLabel(runRef) {
  if (!runRef) return "Run";
  const id = String(runRef.runId || "?");
  return `Run: ${oneLine(id, 18)}`;
}

function sessionLabel(session) {
  if (!session) return "Session";
  return `Session: ${oneLine(session.title || session.sessionId, 28)}`;
}

function buildCursorSegments({finding, heartbeat, runRef, session} = {}) {
  return [
    {
      id: "session",
      label: sessionLabel(session),
      focusCursor: {focusId: SESSION_LIST_FOCUS_ID, sessionId: session ? session.sessionId : null},
    },
    {
      id: "skill",
      label: runRef && runRef.skill ? `Skill: ${oneLine(runRef.skill, 26)}` : heartbeat && heartbeat.skill ? `Skill: ${oneLine(heartbeat.skill, 26)}` : "Skill",
      focusCursor: {focusId: RUN_PANEL_FOCUS_ID, runId: runRef ? runRef.runId : null},
    },
    {
      id: "run",
      label: runLabel(runRef),
      focusCursor: {focusId: RUN_PANEL_FOCUS_ID, runId: runRef ? runRef.runId : null},
    },
    {
      id: "phase",
      label: heartbeat && heartbeat.phase ? `Phase: ${oneLine(heartbeat.phase, 22)}` : "Phase",
      focusCursor: {focusId: RUN_PANEL_FOCUS_ID, runId: runRef ? runRef.runId : null},
    },
    {
      id: "finding",
      label: finding ? `Finding: ${oneLine(finding.id || "selected", 20)}` : "Finding",
      focusCursor: {focusId: FINDINGS_REVIEW_FOCUS_ID, findingId: finding ? finding.id || null : null},
    },
  ];
}

function findRunFindingsFile(runRef) {
  if (!runRef) return null;
  const candidates = [];
  if (runRef.ledgerRef && !String(runRef.ledgerRef).includes(":")) candidates.push(runRef.ledgerRef);
  if (runRef.runDir) {
    candidates.push(
      path.join(runRef.runDir, "merge-ledger.json"),
      path.join(runRef.runDir, "merge-ledger.md"),
      path.join(runRef.runDir, "findings.json"),
      path.join(runRef.runDir, "findings.md"),
    );
  }
  for (const candidate of candidates) {
    const abs = path.resolve(candidate);
    try {
      if (fs.statSync(abs).isFile()) return abs;
    } catch (_) {
      // Missing historical artifacts are normal while a run is still starting.
    }
  }
  return null;
}

function focusForSegment(segment) {
  if (segment && segment.focusCursor && segment.focusCursor.focusId) return segment.focusCursor.focusId;
  if (!segment || segment.id === "session") return SESSION_LIST_FOCUS_ID;
  if (segment.id === "finding") return FINDINGS_REVIEW_FOCUS_ID;
  return RUN_PANEL_FOCUS_ID;
}

export function usage() {
  return `Usage: skill-graph tui [options]

Open the Skill Audit Loop terminal UI.

Options:
  --audit-root <path>  Read sessions from an alternate audit progress root.
  --status-file <path> Read a heartbeat status JSON file.
  --heartbeat <path>   Alias for --status-file.
  --findings-file <p>  Read findings from a merge-ledger JSON/Markdown file.
  --review-file <p>    Write per-finding decisions to this review sidecar.
  --views-file <p>     Read saved findings-review views from JSON.
  --filter <text>      Filter findings by text.
  --severity <text>    Filter findings by severity.
  --category <text>    Filter findings by category.
  --disposition <text> Filter findings by disposition/verdict.
  --skill <text>       Filter findings by skill.
  --model <text>       Filter findings by model/source.
  --sort <name>        Findings sort: disposition-priority, original, decision-status.
  --group-by <name>    Group findings: none, skill, model, verdict, decision.
  --once              Render one frame and exit; intended for smoke tests.
  --no-input          Alias for --once with keyboard input disabled.
  --help              Show this help.
`;
}

export function App({
  auditRoot,
  cursor = DEFAULT_CURSOR,
  findingsFile,
  groupBy = "none",
  noInput = false,
  reviewFile,
  reviewFilters = {},
  sortBy = "disposition-priority",
  statusFile,
  viewsFile,
}) {
  const navRef = React.useRef(null);
  if (navRef.current === null) navRef.current = createNavigation(cursor);

  const sessionsState = useSessions({auditRoot, watch: !noInput});
  const [breadcrumb, setBreadcrumb] = React.useState(() => navigationSnapshot(navRef.current));
  const [focusId, setFocusId] = React.useState(SESSION_LIST_FOCUS_ID);
  const [inputLocked, setInputLocked] = React.useState(false);
  const [activeRunId, setActiveRunId] = React.useState(null);
  const [selectedFinding, setSelectedFinding] = React.useState(null);
  const [restoredFocusCursor, setRestoredFocusCursor] = React.useState(null);
  const [focusCursors, setFocusCursors] = React.useState({});
  const focusCursorsRef = React.useRef(focusCursors);
  const didInitFocus = React.useRef(false);
  const restoredSessionRef = React.useRef(null);
  const app = useApp();
  const focusManager = useFocusManager();
  const activeSession = sessionsState.activeSession;
  const activeRunRef = React.useMemo(() => {
    const refs = activeSession && Array.isArray(activeSession.runRefs) ? activeSession.runRefs : [];
    if (!refs.length) return null;
    return refs.find((ref) => ref.runId === activeRunId) || refs[0] || null;
  }, [activeRunId, activeSession]);
  const runFindingsFile = React.useMemo(() => findRunFindingsFile(activeRunRef), [activeRunRef]);
  const effectiveStatusFile = React.useMemo(
    () => statusFile || (activeRunRef ? activeRunRef.heartbeatPath : null) || discoverLatestHeartbeat({auditRoot}),
    [activeRunRef, auditRoot, statusFile],
  );
  const heartbeatState = useHeartbeat(effectiveStatusFile, {watch: !noInput});
  const effectiveFindingsFile = findingsFile || runFindingsFile;
  const effectiveReviewFile = reviewFile || (activeRunRef ? activeRunRef.reviewPath : undefined);
  const reviewStatusFile = (statusFile || !effectiveFindingsFile || activeRunRef) ? effectiveStatusFile : undefined;
  const reviewState = useReviewState({
    heartbeat: reviewStatusFile ? heartbeatState.heartbeat : null,
    statusFile: reviewStatusFile,
    findingsFile: effectiveFindingsFile,
    reviewFile: effectiveReviewFile,
    viewsFile,
    filters: reviewFilters,
    groupBy,
    sortBy,
    watch: !noInput,
  });

  React.useEffect(() => {
    focusCursorsRef.current = focusCursors;
  }, [focusCursors]);

  React.useEffect(() => {
    if (didInitFocus.current) return;
    didInitFocus.current = true;
    focusManager.focus(SESSION_LIST_FOCUS_ID);
  }, [focusManager]);

  const updateBreadcrumb = React.useCallback(() => {
    setBreadcrumb(navigationSnapshot(navRef.current));
  }, []);

  const applySegmentFocus = React.useCallback((segment) => {
    const nextFocus = focusForSegment(segment);
    const nextCursor = segment && segment.focusCursor ? segment.focusCursor : {focusId: nextFocus};
    focusManager.focus(nextFocus);
    setFocusId(nextFocus);
    setRestoredFocusCursor(nextCursor);
  }, [focusManager]);

  const replaceBreadcrumb = React.useCallback(({
    activeIndex = 0,
    finding = selectedFinding,
    heartbeat = heartbeatState.heartbeat,
    runRef = activeRunRef,
    session = activeSession,
  } = {}) => {
    navRef.current = createNavigation(buildCursorSegments({finding, heartbeat, runRef, session}), activeIndex);
    updateBreadcrumb();
  }, [activeRunRef, activeSession, heartbeatState.heartbeat, selectedFinding, updateBreadcrumb]);

  const recordPaneCursor = React.useCallback((cursorState) => {
    if (!cursorState || !cursorState.focusId) return;
    setFocusCursors((current) => {
      const previous = current[cursorState.focusId];
      if (JSON.stringify(previous || {}) === JSON.stringify(cursorState)) return current;
      return {...current, [cursorState.focusId]: cursorState};
    });
  }, []);

  const saveFocusCursor = React.useCallback(() => {
    const saved = focusCursorsRef.current[focusId] || {};
    return {
      ...saved,
      activeRunId,
      focusId,
      sessionId: sessionsState.activeSessionId || null,
    };
  }, [activeRunId, focusId, sessionsState.activeSessionId]);

  React.useEffect(() => {
    if (!activeSession || restoredSessionRef.current === activeSession.sessionId) return;
    restoredSessionRef.current = activeSession.sessionId;
    const saved = activeSession.currentCursor && typeof activeSession.currentCursor === "object"
      ? activeSession.currentCursor
      : {};
    if (saved.focusCursors && typeof saved.focusCursors === "object") {
      setFocusCursors(saved.focusCursors);
    }
    const refs = Array.isArray(activeSession.runRefs) ? activeSession.runRefs : [];
    const restoredRunId = saved.activeRunId || saved.runId;
    const nextRun = refs.find((ref) => ref.runId === restoredRunId) || refs[0] || null;
    setActiveRunId(nextRun ? nextRun.runId : null);
    if (saved.focusId) {
      focusManager.focus(saved.focusId);
      setFocusId(saved.focusId);
      setRestoredFocusCursor(saved.focusCursors && saved.focusCursors[saved.focusId]
        ? saved.focusCursors[saved.focusId]
        : {focusId: saved.focusId});
    }
  }, [activeSession, focusManager]);

  React.useEffect(() => {
    if (!activeSession) return;
    const refs = Array.isArray(activeSession.runRefs) ? activeSession.runRefs : [];
    if (!refs.length) {
      if (activeRunId !== null) setActiveRunId(null);
      return;
    }
    if (!refs.some((ref) => ref.runId === activeRunId)) {
      setActiveRunId(refs[0].runId);
    }
  }, [activeRunId, activeSession]);

  React.useEffect(() => {
    replaceBreadcrumb({
      activeIndex: Math.min(breadcrumb.activeIndex, 4),
      finding: selectedFinding,
    });
  }, [activeRunRef ? activeRunRef.runId : null, activeSession ? activeSession.sessionId : null]);

  const persistedCursor = React.useMemo(() => ({
    activeRunId,
    breadcrumb,
    focusCursors,
    focusId,
    sessionId: sessionsState.activeSessionId || null,
  }), [activeRunId, breadcrumb, focusCursors, focusId, sessionsState.activeSessionId]);

  React.useEffect(() => {
    if (!sessionsState.activeSessionId) return;
    sessionsState.updateCursor({
      sessionId: sessionsState.activeSessionId,
      currentCursor: persistedCursor,
    });
  }, [JSON.stringify(persistedCursor), sessionsState.activeSessionId, sessionsState.updateCursor]);

  const pushFindingBreadcrumb = React.useCallback((finding) => {
    if (!finding) return;
    setSelectedFinding(finding);
    navRef.current = createNavigation(buildCursorSegments({
      finding,
      heartbeat: heartbeatState.heartbeat,
      runRef: activeRunRef,
      session: activeSession,
    }), 4);
    focusManager.focus(FINDINGS_REVIEW_FOCUS_ID);
    setFocusId(FINDINGS_REVIEW_FOCUS_ID);
    setRestoredFocusCursor({focusId: FINDINGS_REVIEW_FOCUS_ID, findingId: finding.id || null});
    updateBreadcrumb();
  }, [activeRunRef, activeSession, focusManager, heartbeatState.heartbeat, updateBreadcrumb]);

  const handleCreateSession = React.useCallback(({title}) => {
    const session = sessionsState.createSession({
      title,
      currentCursor: {focusId: SESSION_LIST_FOCUS_ID},
    });
    setSelectedFinding(null);
    setActiveRunId(null);
    navRef.current = createNavigation(buildCursorSegments({session}), 0);
    setRestoredFocusCursor({focusId: SESSION_LIST_FOCUS_ID, sessionId: session.sessionId});
    updateBreadcrumb();
    return session;
  }, [sessionsState.createSession, updateBreadcrumb]);

  const handleSelectSession = React.useCallback((sessionId) => {
    const session = sessionsState.resumeSession(sessionId);
    const refs = session && Array.isArray(session.runRefs) ? session.runRefs : [];
    const saved = session && session.currentCursor && typeof session.currentCursor === "object"
      ? session.currentCursor
      : {};
    const runRef = refs.find((ref) => ref.runId === (saved.activeRunId || saved.runId)) || refs[0] || null;
    setSelectedFinding(null);
    setActiveRunId(runRef ? runRef.runId : null);
    navRef.current = createNavigation(buildCursorSegments({runRef, session}), 0);
    setRestoredFocusCursor({focusId: SESSION_LIST_FOCUS_ID, sessionId});
    updateBreadcrumb();
    return session;
  }, [sessionsState.resumeSession, updateBreadcrumb]);

  const handleRenameSession = React.useCallback(({sessionId, title}) => (
    sessionsState.renameSession({sessionId, title})
  ), [sessionsState.renameSession]);

  const handlePauseSession = React.useCallback((sessionId) => (
    sessionsState.setStatus({sessionId, status: "paused"})
  ), [sessionsState.setStatus]);

  const handleCloseSession = React.useCallback((sessionId) => (
    sessionsState.setStatus({sessionId, status: "closed"})
  ), [sessionsState.setStatus]);

  const handleSelectRun = React.useCallback((runRef) => {
    if (!runRef) return;
    setActiveRunId(runRef.runId);
    setSelectedFinding(null);
    navRef.current = createNavigation(buildCursorSegments({
      heartbeat: heartbeatState.heartbeat,
      runRef,
      session: activeSession,
    }), 2);
    setRestoredFocusCursor({focusId: RUN_PANEL_FOCUS_ID, runId: runRef.runId});
    updateBreadcrumb();
  }, [activeSession, heartbeatState.heartbeat, updateBreadcrumb]);

  const cycleFocus = React.useCallback((delta) => {
    const index = FOCUS_ORDER.indexOf(focusId);
    const currentIndex = index >= 0 ? index : 0;
    const nextIndex = (currentIndex + delta + FOCUS_ORDER.length) % FOCUS_ORDER.length;
    const nextFocus = FOCUS_ORDER[nextIndex];
    focusManager.focus(nextFocus);
    setFocusId(nextFocus);
  }, [focusId, focusManager]);

  useInput((input, key) => {
    if (input === "q") {
      app.exit();
      return;
    }

    if (key.tab) {
      cycleFocus(key.shift ? -1 : 1);
      return;
    }

    if (key.leftArrow) {
      const nextIndex = Math.max(0, breadcrumb.activeIndex - 1);
      const segment = navRef.current.jumpTo(nextIndex, saveFocusCursor());
      applySegmentFocus(segment);
      updateBreadcrumb();
      return;
    }

    if (key.rightArrow) {
      const nextIndex = Math.min(breadcrumb.segments.length - 1, breadcrumb.activeIndex + 1);
      const segment = navRef.current.jumpTo(nextIndex, saveFocusCursor());
      applySegmentFocus(segment);
      updateBreadcrumb();
      return;
    }

    if (input === "[") {
      const segment = navRef.current.back(saveFocusCursor());
      applySegmentFocus(segment);
      updateBreadcrumb();
      return;
    }

    if (input === "]") {
      const segment = navRef.current.forward(saveFocusCursor());
      applySegmentFocus(segment);
      updateBreadcrumb();
      return;
    }

    if ((key.escape || key.backspace) && breadcrumb.segments.length > 1) {
      const segment = navRef.current.pop(saveFocusCursor());
      applySegmentFocus(segment);
      updateBreadcrumb();
    }
  }, {isActive: !noInput && !inputLocked});

  return html`
    <Box flexDirection="column" gap=${1}>
      <${Breadcrumb} segments=${breadcrumb.segments} activeIndex=${breadcrumb.activeIndex} />
      <Box flexDirection=${noInput ? "column" : "row"} gap=${1}>
        <${SessionList}
          activeSessionId=${sessionsState.activeSessionId}
          focusCursor=${restoredFocusCursor && restoredFocusCursor.focusId === SESSION_LIST_FOCUS_ID ? restoredFocusCursor : focusCursors[SESSION_LIST_FOCUS_ID]}
          noInput=${noInput}
          onCloseSession=${handleCloseSession}
          onCreateSession=${handleCreateSession}
          onCursorChange=${recordPaneCursor}
          onFocusChange=${setFocusId}
          onInputModeChange=${setInputLocked}
          onPauseSession=${handlePauseSession}
          onRenameSession=${handleRenameSession}
          onSelectSession=${handleSelectSession}
          sessions=${sessionsState.sessions}
        />
        <${RunPanel}
          activeRunId=${activeRunRef ? activeRunRef.runId : activeRunId}
          focusCursor=${restoredFocusCursor && restoredFocusCursor.focusId === RUN_PANEL_FOCUS_ID ? restoredFocusCursor : focusCursors[RUN_PANEL_FOCUS_ID]}
          heartbeatState=${heartbeatState}
          noInput=${noInput}
          onCursorChange=${recordPaneCursor}
          onFocusChange=${setFocusId}
          onSelectRun=${handleSelectRun}
          runRefs=${activeSession && Array.isArray(activeSession.runRefs) ? activeSession.runRefs : []}
          statusFile=${effectiveStatusFile}
        />
      </Box>
      <${FindingsReview}
        noInput=${noInput}
        onFocusChange=${setFocusId}
        onInputModeChange=${setInputLocked}
        onSelectFinding=${pushFindingBreadcrumb}
        review=${reviewState}
      />
      <${StatusBar} focusId=${focusId} noInput=${noInput} />
    </Box>
  `;
}

export async function run(args = process.argv.slice(2), streams = {}) {
  const options = parseArgs(args);
  const stdout = streams.stdout || process.stdout;

  if (options.help) {
    stdout.write(usage());
    return 0;
  }

  const instance = render(html`
    <${App}
      auditRoot=${options.auditRoot}
      findingsFile=${options.findingsFile}
      groupBy=${options.groupBy}
      noInput=${options.noInput}
      reviewFile=${options.reviewFile}
      reviewFilters=${options.filters}
      sortBy=${options.sortBy}
      statusFile=${options.statusFile}
      viewsFile=${options.viewsFile}
    />
  `, {
    stdout,
    stdin: streams.stdin || process.stdin,
    stderr: streams.stderr || process.stderr,
    exitOnCtrlC: true,
    patchConsole: true,
  });

  if (options.once || options.noInput) {
    await new Promise((resolve) => setTimeout(resolve, 25));
    instance.unmount();
    instance.cleanup();
    return 0;
  }

  await instance.waitUntilExit();
  instance.cleanup();
  return 0;
}

if (process.argv[1] && APP_FILE === process.argv[1]) {
  run().then((code) => {
    process.exitCode = code;
  }).catch((err) => {
    process.stderr.write(`${err.stack || err.message}\n`);
    process.exitCode = 1;
  });
}
