import React from "react";
import htm from "htm";
import {Box, Text, useFocus} from "ink";

const html = htm.bind((type, props, ...children) => React.createElement(
  {Box, Text}[type] || type,
  props,
  ...children,
));

export const RUN_PANEL_FOCUS_ID = "run";

export default function RunPanel({onFocusChange}) {
  const {isFocused} = useFocus({id: RUN_PANEL_FOCUS_ID});

  React.useEffect(() => {
    if (isFocused && onFocusChange) onFocusChange(RUN_PANEL_FOCUS_ID);
  }, [isFocused, onFocusChange]);

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
      <Text color="gray">Run details are stubbed for Step 2.</Text>
    </Box>
  `;
}
