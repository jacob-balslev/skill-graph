import React from "react";
import htm from "htm";
import {Box, Text} from "ink";

const html = htm.bind((type, props, ...children) => React.createElement(
  {Box, Text}[type] || type,
  props,
  ...children,
));

function launchLabel(status = {}) {
  if (!status || status.state === "idle") return "launcher: idle";
  const skill = status.skill ? ` ${status.skill}` : "";
  const pid = status.pid ? ` pid ${status.pid}` : "";
  const detail = status.detail ? ` ${status.detail}` : "";
  if (status.state === "launching") return `launcher: launching${skill}`;
  if (status.state === "spawned") return `launcher: spawned${skill}${pid}`;
  if (status.state === "exited") return `launcher: exited${skill}${pid}${detail}`;
  if (status.state === "failed") return `launcher: failed${skill}${detail}`;
  return `launcher: ${status.state}${skill}${pid}${detail}`;
}

function launchColor(status = {}) {
  if (!status || status.state === "idle") return "gray";
  if (status.state === "failed") return "red";
  if (status.state === "exited") return "yellow";
  return "green";
}

export default function StatusBar({focusId = "sessions", launchStatus = {}, noInput = false}) {
  const keys = noInput
    ? "no-input smoke mode"
    : "Tab/Shift-Tab focus | <-/-> segment | [/ ] history | N launch | Esc/Backspace pop | q quit";

  return html`
    <Box borderStyle="single" borderColor="gray" paddingX=${1} justifyContent="space-between">
      <Text color="gray">${keys}</Text>
      <Text color="yellow">focus: ${focusId}</Text>
      <Text color=${launchColor(launchStatus)}>${launchLabel(launchStatus)}</Text>
    </Box>
  `;
}
