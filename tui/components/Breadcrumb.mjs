import React from "react";
import htm from "htm";
import {Box, Text} from "ink";

const html = htm.bind((type, props, ...children) => React.createElement(
  {Box, Text}[type] || type,
  props,
  ...children,
));

function segmentLabel(segment) {
  if (segment == null) return "";
  if (typeof segment === "string" || typeof segment === "number") return String(segment);
  return String(segment.label || segment.id || "");
}

export default function Breadcrumb({segments = [], activeIndex = 0}) {
  const safeIndex = Math.max(0, Math.min(activeIndex, Math.max(segments.length - 1, 0)));

  return html`
    <Box borderStyle="single" borderColor="gray" paddingX=${1}>
      <Text bold color="cyan">Audit TUI</Text>
      <Text>  </Text>
      ${segments.map((segment, index) => html`
        <Box key=${`${segmentLabel(segment)}-${index}`}>
          ${index > 0 ? html`<Text color="gray">${" > "}</Text>` : null}
          <Text
            bold=${index === safeIndex}
            inverse=${index === safeIndex}
            color=${index === safeIndex ? "black" : "white"}
            backgroundColor=${index === safeIndex ? "cyan" : undefined}
          >
            ${segmentLabel(segment)}
          </Text>
        </Box>
      `)}
    </Box>
  `;
}
