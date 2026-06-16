import React from "react";
import htm from "htm";
import {Box, Text} from "ink";

const html = htm.bind((type, props, ...children) => React.createElement(
  {Box, Text}[type] || type,
  props,
  ...children,
));

export default function StatusBar({focusId = "sessions", noInput = false}) {
  const completeness = "Step 2 shell: panes mounted; run and finding details pending.";
  const keys = noInput
    ? "no-input smoke mode"
    : "Tab/Shift-Tab focus | <-/-> segment | [/ ] history | Esc/Backspace pop | q quit";

  return html`
    <Box borderStyle="single" borderColor="gray" paddingX=${1} justifyContent="space-between">
      <Text color="gray">${keys}</Text>
      <Text color="yellow">focus: ${focusId}</Text>
      <Text color="green">${completeness}</Text>
    </Box>
  `;
}
