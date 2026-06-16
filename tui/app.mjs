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

function createNavigation(cursorSegments) {
  return createBreadcrumb(cursorSegments);
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

  const effectiveStatusFile = React.useMemo(
    () => statusFile || discoverLatestHeartbeat({auditRoot}),
    [auditRoot, statusFile],
  );
  const heartbeatState = useHeartbeat(effectiveStatusFile, {watch: !noInput});
  const reviewStatusFile = statusFile || !findingsFile ? effectiveStatusFile : undefined;
  const reviewState = useReviewState({
    heartbeat: reviewStatusFile ? heartbeatState.heartbeat : null,
    statusFile: reviewStatusFile,
    findingsFile,
    reviewFile,
    viewsFile,
    filters: reviewFilters,
    groupBy,
    sortBy,
    watch: !noInput,
  });
  const [breadcrumb, setBreadcrumb] = React.useState(() => navigationSnapshot(navRef.current));
  const [focusId, setFocusId] = React.useState(SESSION_LIST_FOCUS_ID);
  const [inputLocked, setInputLocked] = React.useState(false);
  const didInitFocus = React.useRef(false);
  const app = useApp();
  const focusManager = useFocusManager();

  React.useEffect(() => {
    if (didInitFocus.current) return;
    didInitFocus.current = true;
    focusManager.focus(SESSION_LIST_FOCUS_ID);
  }, [focusManager]);

  const updateBreadcrumb = React.useCallback(() => {
    setBreadcrumb(navigationSnapshot(navRef.current));
  }, []);

  const saveFocusCursor = React.useCallback(() => ({focusId}), [focusId]);

  const pushFindingBreadcrumb = React.useCallback((finding) => {
    if (!finding) return;
    const current = navRef.current.current();
    if (current && current.id === "finding") navRef.current.pop(saveFocusCursor());
    navRef.current.push({
      id: "finding",
      label: `Finding ${finding.id || "selected"}`,
      focusCursor: {findingId: finding.id || null},
    }, saveFocusCursor());
    updateBreadcrumb();
  }, [saveFocusCursor, updateBreadcrumb]);

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
      navRef.current.jumpTo(nextIndex, saveFocusCursor());
      updateBreadcrumb();
      return;
    }

    if (key.rightArrow) {
      const nextIndex = Math.min(breadcrumb.segments.length - 1, breadcrumb.activeIndex + 1);
      navRef.current.jumpTo(nextIndex, saveFocusCursor());
      updateBreadcrumb();
      return;
    }

    if (input === "[") {
      navRef.current.back(saveFocusCursor());
      updateBreadcrumb();
      return;
    }

    if (input === "]") {
      navRef.current.forward(saveFocusCursor());
      updateBreadcrumb();
      return;
    }

    if ((key.escape || key.backspace) && breadcrumb.segments.length > 1) {
      navRef.current.pop(saveFocusCursor());
      updateBreadcrumb();
    }
  }, {isActive: !noInput && !inputLocked});

  return html`
    <Box flexDirection="column" gap=${1}>
      <${Breadcrumb} segments=${breadcrumb.segments} activeIndex=${breadcrumb.activeIndex} />
      <Box flexDirection="row" gap=${1}>
        <${SessionList} auditRoot=${auditRoot} onFocusChange=${setFocusId} />
        <${RunPanel} heartbeatState=${heartbeatState} statusFile=${effectiveStatusFile} onFocusChange=${setFocusId} />
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
