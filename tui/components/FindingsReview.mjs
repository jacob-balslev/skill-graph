import React from "react";
import htm from "htm";
import {Box, Text, useFocus, useInput} from "ink";
import findingReview from "../../lib/audit/finding-review.js";

const html = htm.bind((type, props, ...children) => React.createElement(
  {Box, Text}[type] || type,
  props,
  ...children,
));
const {
  decisionRecord,
  groupingEntries,
  nextPendingIndex,
} = findingReview;

export const FINDINGS_REVIEW_FOCUS_ID = "findings";

const TABLE_LIMIT = 18;
const SEVERITY_COLOR = {
  P0: "red",
  P1: "red",
  P2: "yellow",
  P3: "cyan",
  P4: "gray",
  CRITICAL: "red",
  HIGH: "red",
  MEDIUM: "yellow",
  LOW: "cyan",
  INFO: "gray",
};

function oneLine(value, max = 120) {
  if (value == null) return "";
  const text = String(value).replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.length > max ? `${text.slice(0, Math.max(0, max - 3))}...` : text;
}

function pad(value, width) {
  const text = oneLine(value, width);
  if (text.length >= width) return text.slice(0, width);
  return text + " ".repeat(width - text.length);
}

function severityColor(severity) {
  return SEVERITY_COLOR[String(severity || "").toUpperCase()] || "gray";
}

function decisionColor(decision) {
  if (decision === "approved") return "green";
  if (decision === "disapproved") return "red";
  return "yellow";
}

function raw(finding) {
  return finding && finding.raw && typeof finding.raw === "object" ? finding.raw : {};
}

function fieldText(finding, ...keys) {
  const source = raw(finding);
  for (const key of keys) {
    if (finding && finding[key] != null) {
      const text = oneLine(finding[key], 2000);
      if (text) return text;
    }
    if (source[key] != null) {
      const text = oneLine(source[key], 2000);
      if (text) return text;
    }
  }
  return "";
}

function wrapText(value, width = 72, maxLines = 4) {
  const text = oneLine(value, 4000);
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    if (!line) line = word;
    else if (line.length + word.length + 1 <= width) line += ` ${word}`;
    else {
      lines.push(line);
      line = word;
      if (lines.length >= maxLines) break;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  const consumed = lines.join(" ").length;
  if (text.length > consumed && lines.length) lines[lines.length - 1] = oneLine(`${lines[lines.length - 1]} ...`, width);
  return lines;
}

function sourceLabel(review = {}) {
  if (review.reviewFile) return review.reviewFile;
  return "review-state sidecar";
}

function sideEffectLine(decision, review = {}) {
  return `${decision} writes ${sourceLabel(review)} only; findings source remains read-only.`;
}

function TableRow({entry, isSelected, review}) {
  if (entry.type === "group") {
    return html`<Text color="gray">-- ${entry.label} (${entry.count}) --</Text>`;
  }
  const finding = entry.finding;
  const decision = review.decisionFor(finding);
  const severity = oneLine(finding.severity || "?", 4);
  const category = oneLine(finding.category || "(none)", 14);
  const flag = finding.flagged ? "⚑" : " ";
  const marker = isSelected ? ">" : " ";
  const summary = oneLine(finding.title || finding.summary || finding.id, 76);

  return html`
    <Box>
      <Box width=${2}><Text color=${isSelected ? "cyan" : "white"}>${marker}</Text></Box>
      <Box width=${2}><Text color=${finding.flagged ? "yellow" : "gray"}>${flag}</Text></Box>
      <Box width=${5}><Text color=${severityColor(severity)}>${severity}</Text></Box>
      <Box width=${15}><Text color="white">${category}</Text></Box>
      <Box width=${13}><Text color=${decisionColor(decision)}>${decision}</Text></Box>
      <Text color=${isSelected ? "cyan" : "white"}>${summary}</Text>
    </Box>
  `;
}

function visibleWindow(entries, selectedIndex) {
  const findingEntries = entries.filter((entry) => entry.type === "finding");
  if (findingEntries.length <= TABLE_LIMIT) return entries;
  const half = Math.floor(TABLE_LIMIT / 2);
  const startFinding = Math.max(0, Math.min(selectedIndex - half, findingEntries.length - TABLE_LIMIT));
  const endFinding = startFinding + TABLE_LIMIT;
  const keep = new Set(findingEntries.slice(startFinding, endFinding).map((entry) => entry.index));
  return entries.filter((entry) => entry.type === "group" || keep.has(entry.index));
}

function DetailPane({finding, expanded, review}) {
  if (!finding) {
    return html`
      <Box flexDirection="column">
        <Text bold>Finding Detail</Text>
        <Text color="gray">No finding selected.</Text>
      </Box>
    `;
  }

  const record = decisionRecord(finding, review.reviewState);
  const evidence = fieldText(finding, "evidence", "detail", "description", "rationale", "reason");
  const requiredAction = fieldText(finding, "requiredAction", "required_action", "action", "status") || "(none)";
  const provenance = fieldText(
    finding,
    "modelProvenance",
    "model",
    "source",
    "surfaced_by",
    "corroborated_by",
    "accepted_by",
    "sourceRef",
    "source_ref",
  ) || "(unknown)";
  const evidenceLines = wrapText(evidence || "(none)", 72, expanded ? 10 : 3);
  const triageWhy = (finding.triage_reasons || []).join("; ");
  const note = record.note ? ` · note: ${record.note}` : "";

  return html`
    <Box flexDirection="column">
      <Text bold color="white">Finding ${finding.id}</Text>
      <Text color=${finding.flagged ? "yellow" : "gray"}>${finding.flagged ? "⚑ flagged" : "not flagged"} · triage: ${finding.triage || "unclassified"}${triageWhy ? ` (${triageWhy})` : ""}</Text>
      <Text color=${decisionColor(record.decision)}>prior decision: ${record.decision}${record.decided_at ? ` at ${record.decided_at}` : ""}${note}</Text>
      <Text color="gray">side effect: ${sideEffectLine(record.decision === "pending" ? "approve/disapprove/pending" : record.decision, review)}</Text>
      <Text>summary: ${oneLine(finding.title, 160)}</Text>
      <Text>required action: ${oneLine(requiredAction, 120)}</Text>
      <Text>model provenance: ${oneLine(provenance, 140)}</Text>
      <Text>evidence${expanded ? "" : " (folded)"}:</Text>
      ${evidenceLines.map((line, index) => html`<Text key=${`e-${finding.id}-${index}`} color="gray">  ${line}</Text>`)}
      <Text color="gray">${expanded ? "Enter collapses detail." : "Enter expands the selected finding."}</Text>
    </Box>
  `;
}

function CompletenessBanner({review}) {
  const counts = review.allCounts || {approved: 0, disapproved: 0, pending: 0, total: 0};
  const decided = (counts.approved || 0) + (counts.disapproved || 0);
  if (!counts.total) {
    return html`<Text color="gray">No findings are present in the heartbeat or findings file yet.</Text>`;
  }
  if (counts.pending > 0) {
    return html`<Text bold color="yellow">REVIEW INCOMPLETE - ${decided} of ${counts.total} decided; ${counts.pending} pending. Decide each finding individually.</Text>`;
  }
  return html`<Text bold color="green">ALL ${counts.total} REVIEWED - ${counts.approved} approved; ${counts.disapproved} disapproved.</Text>`;
}

export default function FindingsReview({
  noInput = false,
  onFocusChange,
  onInputModeChange,
  onSelectFinding,
  review,
}) {
  const {isFocused} = useFocus({id: FINDINGS_REVIEW_FOCUS_ID});
  const visibleFindings = review && Array.isArray(review.visibleFindings) ? review.visibleFindings : [];
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [expandedIds, setExpandedIds] = React.useState(() => new Set());
  const [noteMode, setNoteMode] = React.useState(false);
  const [noteBuffer, setNoteBuffer] = React.useState("");
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    if (isFocused && onFocusChange) onFocusChange(FINDINGS_REVIEW_FOCUS_ID);
  }, [isFocused, onFocusChange]);

  React.useEffect(() => {
    if (onInputModeChange) onInputModeChange(noteMode);
  }, [noteMode, onInputModeChange]);

  React.useEffect(() => {
    setSelectedIndex((index) => Math.max(0, Math.min(index, Math.max(visibleFindings.length - 1, 0))));
  }, [visibleFindings.length]);

  const selectedFinding = visibleFindings[selectedIndex] || null;
  const expanded = Boolean(selectedFinding && expandedIds.has(selectedFinding.id));

  const commitDecision = React.useCallback((decision) => {
    if (!selectedFinding || !review || !review.decide) return;
    setMessage(sideEffectLine(decision, review));
    try {
      review.decide(selectedFinding.id, decision);
    } catch (err) {
      setMessage(`ERROR: ${err.message}`);
    }
  }, [review, selectedFinding]);

  const commitNote = React.useCallback(() => {
    if (!selectedFinding || !review || !review.decide) {
      setNoteMode(false);
      setNoteBuffer("");
      return;
    }
    const currentDecision = review.decisionFor(selectedFinding);
    setMessage(sideEffectLine("note", review));
    try {
      review.decide(selectedFinding.id, currentDecision, noteBuffer);
    } catch (err) {
      setMessage(`ERROR: ${err.message}`);
    }
    setNoteMode(false);
    setNoteBuffer("");
  }, [noteBuffer, review, selectedFinding]);

  useInput((input, key) => {
    if (noteMode) {
      if (key.return) {
        commitNote();
        return;
      }
      if (key.escape) {
        setNoteMode(false);
        setNoteBuffer("");
        return;
      }
      if (key.backspace || key.delete) {
        setNoteBuffer((value) => value.slice(0, -1));
        return;
      }
      if (input && input >= " ") setNoteBuffer((value) => `${value}${input}`);
      return;
    }

    if (!visibleFindings.length) return;
    if (key.upArrow || input === "k") {
      setSelectedIndex((index) => Math.max(0, index - 1));
      return;
    }
    if (key.downArrow || input === "j") {
      setSelectedIndex((index) => Math.min(visibleFindings.length - 1, index + 1));
      return;
    }
    if (key.return) {
      if (selectedFinding && onSelectFinding) onSelectFinding(selectedFinding);
      if (selectedFinding) {
        setExpandedIds((current) => {
          const next = new Set(current);
          if (next.has(selectedFinding.id)) next.delete(selectedFinding.id);
          else next.add(selectedFinding.id);
          return next;
        });
      }
      return;
    }
    if (input === "a") {
      commitDecision("approved");
      return;
    }
    if (input === "d" || input === "r") {
      commitDecision("disapproved");
      return;
    }
    if (input === "u") {
      commitDecision("pending");
      return;
    }
    if (input === "n" || input === "N") {
      const idx = nextPendingIndex(visibleFindings, review.reviewState, selectedIndex, input === "N" ? -1 : 1);
      if (idx >= 0) setSelectedIndex(idx);
      else setMessage("No pending findings in the current view.");
      return;
    }
    if (input === "s" && review.cycleSort) {
      review.cycleSort();
      setMessage("Sort changed.");
      return;
    }
    if (input === "v" && review.cycleView) {
      const view = review.cycleView();
      setSelectedIndex(0);
      setMessage(view ? `View: ${view.name}` : "No saved views.");
      return;
    }
    if (input === "g" && review.cycleGroupBy) {
      review.cycleGroupBy();
      setMessage("Grouping changed.");
      return;
    }
    if (input === "c") {
      const record = selectedFinding ? decisionRecord(selectedFinding, review.reviewState) : {};
      setNoteBuffer(record.note || "");
      setNoteMode(true);
    }
  }, {isActive: isFocused && !noInput});

  const entries = visibleWindow(groupingEntries(visibleFindings, review ? review.reviewState : {}, review ? review.groupBy : "none"), selectedIndex);
  const shown = review && review.visibleCounts ? review.visibleCounts.total : visibleFindings.length;
  const total = review && review.allCounts ? review.allCounts.total : visibleFindings.length;

  return html`
    <Box
      borderStyle="single"
      borderColor=${isFocused ? "cyan" : "gray"}
      flexDirection="column"
      paddingX=${1}
      minHeight=${10}
    >
      <Text bold color=${isFocused ? "cyan" : "white"}>FindingsReview</Text>
      <${CompletenessBanner} review=${review || {}} />
      <Text color="gray">shown: ${shown}/${total} · sort: ${review ? review.sortBy : "disposition-priority"} · group: ${review ? review.groupBy : "none"}${review && review.viewName ? ` · view: ${review.viewName}` : ""}</Text>
      <Text color="gray">keys: j/k or arrows nav · Enter expand · a approve · d/r disapprove · u pending · c note · n/N pending · s sort · v view · g group</Text>
      <Text color="gray">side effect preview: ${sideEffectLine("approve", review || {})}</Text>
      ${message ? html`<Text color=${message.startsWith("ERROR") ? "red" : "yellow"}>${message}</Text>` : null}
      ${noteMode ? html`<Text color="yellow">note for ${selectedFinding ? selectedFinding.id : "(none)"}: ${noteBuffer}_</Text>` : null}
      <Box flexDirection="column">
        <Box flexDirection="column" flexGrow=${2}>
          <Text color="gray">  F Sev  Category       Decision     Summary</Text>
          ${entries.length
            ? entries.map((entry, index) => html`
              <${TableRow}
                key=${entry.type === "group" ? `g-${entry.label}-${index}` : `f-${entry.finding.id}`}
                entry=${entry}
                isSelected=${entry.type === "finding" && entry.index === selectedIndex}
                review=${review || {}}
              />
            `)
            : html`<Text color="gray">No findings match the active filters.</Text>`}
        </Box>
        <Box flexDirection="column" marginTop=${1}>
          <${DetailPane} finding=${selectedFinding} expanded=${expanded} review=${review || {}} />
        </Box>
      </Box>
    </Box>
  `;
}
