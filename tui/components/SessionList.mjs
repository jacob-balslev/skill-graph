import React from "react";
import htm from "htm";
import {Box, Text, useFocus, useInput} from "ink";

const html = htm.bind((type, props, ...children) => React.createElement(
  {Box, Text}[type] || type,
  props,
  ...children,
));

export const SESSION_LIST_FOCUS_ID = "sessions";

const STATUS_GLYPHS = {
  open: "[O]",
  paused: "[P]",
  closed: "[X]",
};

function oneLine(value, max = 52) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.length > max ? `${text.slice(0, Math.max(0, max - 3))}...` : text;
}

function formatUpdatedAt(value) {
  if (!value) return "?";
  const time = Date.parse(value);
  if (Number.isNaN(time)) return oneLine(value, 18);
  return new Date(time).toISOString().replace(/:\d{2}\.\d{3}Z$/, "Z");
}

function sessionColor(session, active) {
  if (active) return "cyan";
  if (session.status === "closed") return "gray";
  if (session.status === "paused") return "yellow";
  return "white";
}

function clampIndex(index, count) {
  if (count <= 0) return 0;
  return Math.max(0, Math.min(index, count - 1));
}

function statusGlyph(session) {
  return STATUS_GLYPHS[session.status] || "[?]";
}

function SessionRow({active, selected, session}) {
  const marker = selected ? ">" : " ";
  const title = oneLine(session.title || session.sessionId, 34);
  const runs = Array.isArray(session.runRefs) ? session.runRefs.length : 0;
  const color = sessionColor(session, active);
  return html`
    <Text color=${selected ? "cyan" : color}>
      ${marker} ${statusGlyph(session)} ${active ? "*" : " "} ${title} | runs ${runs} | ${formatUpdatedAt(session.updatedAt)}
    </Text>
  `;
}

export default function SessionList({
  activeSessionId,
  focusCursor,
  noInput = false,
  onCloseSession,
  onCreateSession,
  onCursorChange,
  onFocusChange,
  onInputModeChange,
  onPauseSession,
  onRenameSession,
  onSelectSession,
  sessions = [],
}) {
  const {isFocused} = useFocus({id: SESSION_LIST_FOCUS_ID, autoFocus: true});
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [mode, setMode] = React.useState("list");
  const [buffer, setBuffer] = React.useState("");
  const [message, setMessage] = React.useState("");
  const list = Array.isArray(sessions) ? sessions : [];
  const selectedSession = list[clampIndex(selectedIndex, list.length)] || null;
  const inputMode = mode !== "list";

  React.useEffect(() => {
    if (isFocused && onFocusChange) onFocusChange(SESSION_LIST_FOCUS_ID);
  }, [isFocused, onFocusChange]);

  React.useEffect(() => {
    if (onInputModeChange) onInputModeChange(inputMode);
  }, [inputMode, onInputModeChange]);

  React.useEffect(() => {
    setSelectedIndex((index) => clampIndex(index, list.length));
  }, [list.length]);

  React.useEffect(() => {
    if (!focusCursor) return;
    const targetId = focusCursor.sessionId;
    if (targetId) {
      const idx = list.findIndex((session) => session.sessionId === targetId);
      if (idx >= 0) setSelectedIndex(idx);
      return;
    }
    if (Number.isInteger(focusCursor.selectedIndex)) {
      setSelectedIndex(clampIndex(focusCursor.selectedIndex, list.length));
    }
  }, [focusCursor, list]);

  React.useEffect(() => {
    if (!onCursorChange) return;
    onCursorChange({
      focusId: SESSION_LIST_FOCUS_ID,
      selectedIndex,
      sessionId: selectedSession ? selectedSession.sessionId : null,
    });
  }, [onCursorChange, selectedIndex, selectedSession]);

  const startCreate = React.useCallback(() => {
    setMode("create");
    setBuffer("");
    setMessage("");
  }, []);

  const startRename = React.useCallback(() => {
    if (!selectedSession) {
      setMessage("No session selected.");
      return;
    }
    setMode("rename");
    setBuffer(selectedSession.title || "");
    setMessage("");
  }, [selectedSession]);

  const cancelInput = React.useCallback(() => {
    setMode("list");
    setBuffer("");
  }, []);

  const commitInput = React.useCallback(() => {
    const title = buffer.trim();
    if (!title) {
      setMessage("Title is required.");
      return;
    }
    try {
      if (mode === "create") {
        const session = onCreateSession ? onCreateSession({title}) : null;
        setMessage(session ? `Created ${session.title}.` : "Session created.");
      } else if (mode === "rename" && selectedSession) {
        onRenameSession({sessionId: selectedSession.sessionId, title});
        setMessage("Session renamed.");
      }
      setMode("list");
      setBuffer("");
    } catch (err) {
      setMessage(`ERROR: ${err.message}`);
    }
  }, [buffer, mode, onCreateSession, onRenameSession, selectedSession]);

  const selectCurrent = React.useCallback(() => {
    if (!selectedSession || !onSelectSession) return;
    try {
      onSelectSession(selectedSession.sessionId);
      setMessage(`Selected ${selectedSession.title || selectedSession.sessionId}.`);
    } catch (err) {
      setMessage(`ERROR: ${err.message}`);
    }
  }, [onSelectSession, selectedSession]);

  const pauseCurrent = React.useCallback(() => {
    if (!selectedSession || !onPauseSession) return;
    if (selectedSession.status !== "open") {
      setMessage("Only open sessions can be paused.");
      return;
    }
    try {
      onPauseSession(selectedSession.sessionId);
      setMessage("Session paused.");
    } catch (err) {
      setMessage(`ERROR: ${err.message}`);
    }
  }, [onPauseSession, selectedSession]);

  const closeCurrent = React.useCallback(() => {
    if (!selectedSession || !onCloseSession) return;
    if (selectedSession.status === "closed") {
      setMessage("Session is already closed.");
      return;
    }
    try {
      onCloseSession(selectedSession.sessionId);
      setMessage("Session closed.");
    } catch (err) {
      setMessage(`ERROR: ${err.message}`);
    }
  }, [onCloseSession, selectedSession]);

  useInput((input, key) => {
    if (inputMode) {
      if (key.return) {
        commitInput();
        return;
      }
      if (key.escape) {
        cancelInput();
        return;
      }
      if (key.backspace || key.delete) {
        setBuffer((value) => value.slice(0, -1));
        return;
      }
      if (input && input >= " ") setBuffer((value) => `${value}${input}`);
      return;
    }

    if (key.upArrow || input === "k") {
      setSelectedIndex((index) => clampIndex(index - 1, list.length));
      return;
    }
    if (key.downArrow || input === "j") {
      setSelectedIndex((index) => clampIndex(index + 1, list.length));
      return;
    }
    if (key.return || input === "r") {
      selectCurrent();
      return;
    }
    if (input === "c") {
      startCreate();
      return;
    }
    if (input === "e") {
      startRename();
      return;
    }
    if (input === "p") {
      pauseCurrent();
      return;
    }
    if (input === "x") {
      closeCurrent();
    }
  }, {isActive: isFocused && !noInput});

  return html`
    <Box
      borderStyle="single"
      borderColor=${isFocused ? "cyan" : "gray"}
      flexGrow=${1}
      flexDirection="column"
      paddingX=${1}
      minHeight=${9}
    >
      <Text bold color=${isFocused ? "cyan" : "white"}>SessionList</Text>
      <Text color="gray">sessions: ${list.length} · Enter/r select · c create · e rename · p pause · x close</Text>
      ${message ? html`<Text color=${message.startsWith("ERROR") ? "red" : "yellow"}>${message}</Text>` : null}
      ${inputMode ? html`
        <Text color="yellow">${mode === "create" ? "new title" : "rename title"}: ${buffer}_</Text>
      ` : null}
      ${list.length
        ? list.map((session, index) => html`
          <${SessionRow}
            key=${session.sessionId}
            active=${session.sessionId === activeSessionId}
            selected=${index === clampIndex(selectedIndex, list.length)}
            session=${session}
          />
        `)
        : html`<Text color="gray">No sessions yet. Press c to create one; then N launches an audit run.</Text>`}
    </Box>
  `;
}
