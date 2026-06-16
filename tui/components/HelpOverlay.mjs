import React from "react";
import htm from "htm";
import {Box, Text} from "ink";

const html = htm.bind((type, props, ...children) => React.createElement(
  {Box, Text}[type] || type,
  props,
  ...children,
));

export const HELP_KEY_GROUPS = [
  {
    title: "Global Focus And Quit",
    rows: [
      ["?", "toggle this help overlay"],
      ["Esc", "close help; close launch/note input when those modes are active"],
      ["q", "quit"],
      ["Tab / Shift+Tab", "cycle pane focus"],
      ["N", "open the audit run launcher"],
    ],
  },
  {
    title: "Breadcrumb Navigation",
    rows: [
      ["Left / Right", "move to previous or next breadcrumb segment"],
      ["[ / ]", "move backward or forward through breadcrumb history"],
      ["Esc / Backspace", "pop the active breadcrumb segment"],
    ],
  },
  {
    title: "SessionList",
    rows: [
      ["j/k or Up/Down", "move between sessions"],
      ["Enter / r", "select or resume the highlighted session"],
      ["c", "create a session"],
      ["e", "rename the selected session"],
      ["p", "pause an open session"],
      ["x", "close the selected session"],
      ["Enter / Esc", "commit or cancel create/rename input"],
    ],
  },
  {
    title: "RunPanel",
    rows: [
      ["j/k or Up/Down", "move between attached runs"],
      ["Enter", "watch the highlighted run"],
    ],
  },
  {
    title: "FindingsReview",
    rows: [
      ["j/k or Up/Down", "move between findings"],
      ["Enter", "expand detail and push the finding into the breadcrumb"],
      ["a", "approve the selected finding in review.json"],
      ["d / r", "disapprove the selected finding in review.json"],
      ["u", "reset the selected finding to pending in review.json"],
      ["f", "records a to-file disposition in review.json"],
      ["c", "edit the note for the selected finding"],
      ["n / N", "jump to next or previous pending finding"],
      ["s", "cycle sort order"],
      ["v", "cycle saved review views"],
      ["g", "cycle grouping"],
    ],
  },
  {
    title: "Launch Prompt",
    rows: [
      ["type", "enter a skill name"],
      ["Enter", "launch an audit run for that skill"],
      ["Backspace", "delete one character"],
      ["Esc", "cancel the launcher"],
    ],
  },
];

function overlayWidth(size = {}) {
  const columns = Number.isFinite(size.columns) ? size.columns : 100;
  return Math.max(36, Math.min(100, columns - 4));
}

function KeyRow({keys, label}) {
  return html`
    <Box>
      <Box width=${18}><Text color="cyan">${keys}</Text></Box>
      <Text color="white">${label}</Text>
    </Box>
  `;
}

export default function HelpOverlay({isOpen = false, terminalSize = {}}) {
  if (!isOpen) return null;
  const width = overlayWidth(terminalSize);

  return html`
    <Box
      borderStyle="double"
      borderColor="cyan"
      flexDirection="column"
      paddingX=${1}
      width=${width}
      alignSelf="center"
    >
      <Text bold color="cyan">Help</Text>
      <Text color="gray">Press ? to toggle; Esc closes. Decisions and file actions write only the review sidecar.</Text>
      ${HELP_KEY_GROUPS.map((group) => html`
        <Box key=${group.title} flexDirection="column" marginTop=${1}>
          <Text bold>${group.title}</Text>
          ${group.rows.map((row) => html`
            <${KeyRow} key=${`${group.title}-${row[0]}`} keys=${row[0]} label=${row[1]} />
          `)}
        </Box>
      `)}
    </Box>
  `;
}
