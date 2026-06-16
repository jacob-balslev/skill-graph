import process from "node:process";
import React from "react";
import {useStdout} from "ink";

const DEFAULT_COLUMNS = 100;
const DEFAULT_ROWS = 32;

function sizeFromStream(stream) {
  return {
    columns: Number.isFinite(stream && stream.columns) ? stream.columns : DEFAULT_COLUMNS,
    rows: Number.isFinite(stream && stream.rows) ? stream.rows : DEFAULT_ROWS,
  };
}

export default function useTerminalSize({watch = true} = {}) {
  const {stdout} = useStdout();
  const stream = stdout || process.stdout;
  const [size, setSize] = React.useState(() => sizeFromStream(stream));

  React.useEffect(() => {
    const refresh = () => setSize(sizeFromStream(stream));
    refresh();
    if (!watch) return undefined;

    if (stream && typeof stream.on === "function") stream.on("resize", refresh);
    process.on("SIGWINCH", refresh);

    return () => {
      if (stream && typeof stream.off === "function") stream.off("resize", refresh);
      else if (stream && typeof stream.removeListener === "function") stream.removeListener("resize", refresh);
      process.off("SIGWINCH", refresh);
    };
  }, [stream, watch]);

  return size;
}
