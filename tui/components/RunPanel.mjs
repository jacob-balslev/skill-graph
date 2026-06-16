import React from "react";
import htm from "htm";
import {createRequire} from "node:module";
import {Box, Text, useFocus, useInput} from "ink";

const html = htm.bind((type, props, ...children) => React.createElement(
  {Box, Text}[type] || type,
  props,
  ...children,
));
const require = createRequire(import.meta.url);
const {
  agentGlyph,
  fmtElapsed,
  isActiveAgentState,
} = require("../../lib/audit/panel-progress.js");
const {resolveDisplayName} = require("../../lib/audit-shared/model-provider.js");

export const RUN_PANEL_FOCUS_ID = "run";

function tierTag(tier) {
  return tier === "mandatory" || tier === "quality" ? "[Q]" : "";
}

function livenessBanner(liveness = {}) {
  if (liveness.state === "complete") return {label: "DONE", marker: "✓", color: "green"};
  if (liveness.state === "dead") return {label: "CRASHED", marker: "×", color: "red"};
  if (liveness.state === "hung" || liveness.state === "stale") {
    return {label: "STALL", marker: "!", color: "yellow"};
  }
  if (liveness.state === "missing") return {label: "NO HEARTBEAT", marker: "!", color: "gray"};
  return {label: "LIVE", marker: "⟳", color: "cyan"};
}

function liveExtraMs(heartbeat, ageMs) {
  if (!heartbeat || heartbeat.complete || !Number.isFinite(ageMs)) return 0;
  return Math.max(0, ageMs);
}

function elapsedForAgent(agent, heartbeat, ageMs) {
  const baseMs = (agent.elapsed_s || 0) * 1000;
  if (!isActiveAgentState(agent.state)) return baseMs;
  return baseMs + liveExtraMs(heartbeat, ageMs);
}

function livenessMark(agent, liveness = {}) {
  if (liveness.state === "dead") return "×";
  if ((liveness.state === "hung" || liveness.state === "stale") && isActiveAgentState(agent.state)) {
    return "!";
  }
  return "";
}

function oneLine(value, max = 42) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.length > max ? `${text.slice(0, Math.max(0, max - 3))}...` : text;
}

function shortRunId(runRef) {
  const id = runRef && runRef.runId ? String(runRef.runId) : "";
  return id.length > 10 ? id.slice(0, 10) : id || "?";
}

function clampIndex(index, count) {
  if (count <= 0) return 0;
  return Math.max(0, Math.min(index, count - 1));
}

function RunRefRow({active, runRef, selected}) {
  const marker = selected ? ">" : " ";
  const role = runRef.role ? `/${runRef.role}` : "";
  return html`
    <Text color=${selected ? "cyan" : active ? "green" : "gray"}>
      ${marker} ${active ? "*" : " "} ${oneLine(runRef.skill, 20)} ${shortRunId(runRef)}${role}
    </Text>
  `;
}

export default function RunPanel({
  activeRunId,
  focusCursor,
  heartbeatState,
  noInput = false,
  onCursorChange,
  onFocusChange,
  onSelectRun,
  runRefs = [],
  statusFile,
}) {
  const {isFocused} = useFocus({id: RUN_PANEL_FOCUS_ID});
  const refs = Array.isArray(runRefs) ? runRefs : [];
  const [selectedRunIndex, setSelectedRunIndex] = React.useState(0);
  const heartbeat = heartbeatState && heartbeatState.heartbeat;
  const liveness = heartbeatState && heartbeatState.liveness;
  const ageMs = heartbeatState ? heartbeatState.ageMs : null;
  const agents = heartbeat && Array.isArray(heartbeat.agents) ? heartbeat.agents : [];
  const done = heartbeat ? heartbeat.done || 0 : 0;
  const total = heartbeat ? (heartbeat.total != null ? heartbeat.total : agents.length) : 0;
  const failed = heartbeat ? heartbeat.failed || 0 : 0;
  const elapsedMs = heartbeat && heartbeat.elapsed_s != null
    ? (heartbeat.elapsed_s * 1000) + liveExtraMs(heartbeat, ageMs)
    : null;
  const banner = livenessBanner(liveness);
  const header = heartbeat
    ? `${heartbeat.skill || "?"} / ${heartbeat.phase || "starting"} / ${done}/${total} done / failed ${failed} / elapsed ${elapsedMs == null ? "?" : fmtElapsed(elapsedMs)} / hb-age ${ageMs == null ? "?" : fmtElapsed(ageMs)}`
    : `No heartbeat selected${statusFile ? `: ${statusFile}` : ""}`;

  React.useEffect(() => {
    if (isFocused && onFocusChange) onFocusChange(RUN_PANEL_FOCUS_ID);
  }, [isFocused, onFocusChange]);

  React.useEffect(() => {
    setSelectedRunIndex((index) => clampIndex(index, refs.length));
  }, [refs.length]);

  React.useEffect(() => {
    if (activeRunId) {
      const idx = refs.findIndex((ref) => ref.runId === activeRunId);
      if (idx >= 0) setSelectedRunIndex(idx);
    }
  }, [activeRunId, refs]);

  React.useEffect(() => {
    if (!focusCursor) return;
    if (focusCursor.runId) {
      const idx = refs.findIndex((ref) => ref.runId === focusCursor.runId);
      if (idx >= 0) setSelectedRunIndex(idx);
      return;
    }
    if (Number.isInteger(focusCursor.selectedRunIndex)) {
      setSelectedRunIndex(clampIndex(focusCursor.selectedRunIndex, refs.length));
    }
  }, [focusCursor, refs]);

  React.useEffect(() => {
    if (!onCursorChange) return;
    const selected = refs[clampIndex(selectedRunIndex, refs.length)] || null;
    onCursorChange({
      focusId: RUN_PANEL_FOCUS_ID,
      runId: selected ? selected.runId : activeRunId || null,
      selectedRunIndex,
    });
  }, [activeRunId, onCursorChange, refs, selectedRunIndex]);

  useInput((input, key) => {
    if (!refs.length) return;
    if (key.upArrow || input === "k") {
      setSelectedRunIndex((index) => clampIndex(index - 1, refs.length));
      return;
    }
    if (key.downArrow || input === "j") {
      setSelectedRunIndex((index) => clampIndex(index + 1, refs.length));
      return;
    }
    if (key.return) {
      const selected = refs[clampIndex(selectedRunIndex, refs.length)] || null;
      if (selected && onSelectRun) onSelectRun(selected);
    }
  }, {isActive: isFocused && !noInput});

  return html`
    <Box
      borderStyle="single"
      borderColor=${isFocused ? "cyan" : "gray"}
      flexGrow=${2}
      flexDirection="column"
      paddingX=${1}
      minHeight=${9}
    >
      <Text bold color=${isFocused ? "cyan" : "white"}>RunPanel</Text>
      ${refs.length ? html`
        <Text color="gray">attached runs: ${refs.length} · j/k select · Enter watch</Text>
      ` : null}
      ${refs.length
        ? refs.map((runRef, index) => html`
          <${RunRefRow}
            key=${runRef.runId}
            active=${runRef.runId === activeRunId}
            selected=${index === clampIndex(selectedRunIndex, refs.length)}
            runRef=${runRef}
          />
        `)
        : null}
      <Text color=${banner.color}>${banner.marker} ${banner.label}</Text>
      <Text color="white">${header}</Text>
      ${heartbeatState && heartbeatState.error && statusFile
        ? html`<Text color="red">Unable to read heartbeat: ${heartbeatState.error.message}</Text>`
        : null}
      ${agents.length
        ? agents.map((agent, index) => {
          const mark = livenessMark(agent, liveness);
          const phase = agent.phase || "queued";
          const reason = (agent.failure_reason && (agent.state === "failed" || agent.state === "skipped" || agent.state === "timeout"))
            ? ` (${agent.failure_reason}${agent.failure_detail ? `: ${agent.failure_detail}` : ""})`
            : "";
          return html`
            <Text key=${`${agent.model || "agent"}-${index}`} color=${mark === "×" ? "red" : mark === "!" ? "yellow" : "white"}>
              ${agentGlyph(agent.state)}${mark} ${resolveDisplayName(agent.model)}${tierTag(agent.tier)} / ${phase} / ${agent.state || "queued"} / ${fmtElapsed(elapsedForAgent(agent, heartbeat, ageMs))}${reason}
            </Text>
          `;
        })
        : html`<Text color="gray">No agent rows in heartbeat.</Text>`}
    </Box>
  `;
}
