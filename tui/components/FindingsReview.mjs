import React from "react";
import htm from "htm";
import {Box, Text, useFocus} from "ink";

const html = htm.bind((type, props, ...children) => React.createElement(
  {Box, Text}[type] || type,
  props,
  ...children,
));

export const FINDINGS_REVIEW_FOCUS_ID = "findings";

export default function FindingsReview({onFocusChange}) {
  const {isFocused} = useFocus({id: FINDINGS_REVIEW_FOCUS_ID});

  React.useEffect(() => {
    if (isFocused && onFocusChange) onFocusChange(FINDINGS_REVIEW_FOCUS_ID);
  }, [isFocused, onFocusChange]);

  return html`
    <Box
      borderStyle="single"
      borderColor=${isFocused ? "cyan" : "gray"}
      flexDirection="column"
      paddingX=${1}
      minHeight=${7}
    >
      <Text bold color=${isFocused ? "cyan" : "white"}>FindingsReview</Text>
      <Text color="gray">Finding review content is stubbed for Step 2.</Text>
    </Box>
  `;
}
