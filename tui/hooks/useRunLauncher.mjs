import React from "react";
import launcher from "../lib/run-launcher.js";

function summarizeExit(code, signal) {
  if (signal) return `signal ${signal}`;
  if (code == null) return "exited";
  return `exit ${code}`;
}

export default function useRunLauncher() {
  const launchesRef = React.useRef(new Map());
  const [status, setStatus] = React.useState({state: "idle"});

  React.useEffect(() => () => {
    for (const launch of launchesRef.current.values()) {
      if (launch && typeof launch.detach === "function") launch.detach();
    }
    launchesRef.current.clear();
  }, []);

  const launchRun = React.useCallback((opts = {}) => {
    setStatus({
      state: "launching",
      skill: opts.skill || "",
    });
    try {
      const launch = launcher.launchRun(opts);
      launchesRef.current.set(launch.runId, launch);
      if (launch.child && typeof launch.child.once === "function") {
        launch.child.once("exit", (code, signal) => {
          launchesRef.current.delete(launch.runId);
          setStatus((current) => {
            if (current.runId && current.runId !== launch.runId) return current;
            return {
              state: "exited",
              skill: launch.skill,
              runId: launch.runId,
              pid: launch.pid,
              detail: summarizeExit(code, signal),
            };
          });
        });
        launch.child.once("error", (err) => {
          launchesRef.current.delete(launch.runId);
          setStatus({
            state: "failed",
            skill: launch.skill,
            runId: launch.runId,
            pid: launch.pid,
            detail: err.message,
          });
        });
      }
      setStatus({
        state: "spawned",
        skill: launch.skill,
        runId: launch.runId,
        pid: launch.pid,
        heartbeatPath: launch.heartbeatPath,
      });
      return launch;
    } catch (err) {
      setStatus({
        state: "failed",
        skill: opts.skill || "",
        detail: err.message,
      });
      throw err;
    }
  }, []);

  const detachAll = React.useCallback(() => {
    for (const launch of launchesRef.current.values()) {
      if (launch && typeof launch.detach === "function") launch.detach();
    }
    launchesRef.current.clear();
  }, []);

  return {
    detachAll,
    launchRun,
    launchStatus: status,
  };
}
