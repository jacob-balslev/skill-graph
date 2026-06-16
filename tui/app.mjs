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

const html = htm.bind((type, props, ...children) => React.createElement(
  {Box}[type] || type,
  props,
  ...children,
));
const {createBreadcrumb} = breadcrumbLib;

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
    help: false,
    noInput: false,
    once: false,
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
    }
  }

  return options;
}

export function usage() {
  return `Usage: skill-graph tui [options]

Open the Skill Audit Loop terminal UI.

Options:
  --audit-root <path>  Read sessions from an alternate audit progress root.
  --once              Render one frame and exit; intended for smoke tests.
  --no-input          Alias for --once with keyboard input disabled.
  --help              Show this help.
`;
}

export function App({auditRoot, cursor = DEFAULT_CURSOR, noInput = false}) {
  const navRef = React.useRef(null);
  if (navRef.current === null) navRef.current = createNavigation(cursor);

  const [breadcrumb, setBreadcrumb] = React.useState(() => navigationSnapshot(navRef.current));
  const [focusId, setFocusId] = React.useState(SESSION_LIST_FOCUS_ID);
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
  }, {isActive: !noInput});

  return html`
    <Box flexDirection="column" gap=${1}>
      <${Breadcrumb} segments=${breadcrumb.segments} activeIndex=${breadcrumb.activeIndex} />
      <Box flexDirection="row" gap=${1}>
        <${SessionList} auditRoot=${auditRoot} onFocusChange=${setFocusId} />
        <${RunPanel} onFocusChange=${setFocusId} />
      </Box>
      <${FindingsReview} onFocusChange=${setFocusId} />
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

  const instance = render(html`<${App} auditRoot=${options.auditRoot} noInput=${options.noInput} />`, {
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

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  run().then((code) => {
    process.exitCode = code;
  }).catch((err) => {
    process.stderr.write(`${err.stack || err.message}\n`);
    process.exitCode = 1;
  });
}
