import React from "react";
import htm from "htm";
import {Box, Text, useFocus} from "ink";
import sessionsLib from "../lib/sessions.js";

const html = htm.bind((type, props, ...children) => React.createElement(
  {Box, Text}[type] || type,
  props,
  ...children,
));

export const SESSION_LIST_FOCUS_ID = "sessions";

function readSessions(auditRoot) {
  try {
    return sessionsLib.listSessions({auditRoot});
  } catch (err) {
    return {error: err.message};
  }
}

export default function SessionList({auditRoot, onFocusChange}) {
  const {isFocused} = useFocus({id: SESSION_LIST_FOCUS_ID, autoFocus: true});
  const result = readSessions(auditRoot);
  const sessionCount = Array.isArray(result) ? result.length : 0;

  React.useEffect(() => {
    if (isFocused && onFocusChange) onFocusChange(SESSION_LIST_FOCUS_ID);
  }, [isFocused, onFocusChange]);

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
      <Text color="gray">Audit sessions: ${sessionCount}</Text>
      ${result.error
        ? html`<Text color="red">Unable to read sessions: ${result.error}</Text>`
        : html`<Text color="gray">No session rows rendered yet.</Text>`}
    </Box>
  `;
}
