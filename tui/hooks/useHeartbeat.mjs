import fs from "node:fs";
import path from "node:path";
import {createRequire} from "node:module";
import React from "react";

const require = createRequire(import.meta.url);
const {classifyLiveness, pidAlive} = require("../../lib/audit/panel-liveness.js");

export const DEFAULT_STALE_MS = 2700 * 1000;
export const DEFAULT_DEBOUNCE_MS = 150;
const DEFAULT_STALE_REPROBE_MS = 1000;

function nowFrom(opts = {}) {
  return typeof opts.now === "function" ? opts.now() : Date.now();
}

function readHeartbeat(file) {
  if (!file) return {heartbeat: null, error: null};
  try {
    return {heartbeat: JSON.parse(fs.readFileSync(file, "utf8")), error: null};
  } catch (err) {
    return {heartbeat: null, error: err};
  }
}

function ageFromHeartbeat(heartbeat, nowMs) {
  const tsMs = heartbeat && heartbeat.ts ? Date.parse(heartbeat.ts) : NaN;
  if (Number.isNaN(tsMs)) return 0;
  return Math.max(0, nowMs - tsMs);
}

export function heartbeatSnapshot(statusFile, opts = {}) {
  const abs = statusFile ? path.resolve(statusFile) : null;
  const staleMs = Number.isFinite(opts.staleMs) ? opts.staleMs : DEFAULT_STALE_MS;
  const nowMs = nowFrom(opts);
  const {heartbeat, error} = readHeartbeat(abs);

  if (!heartbeat) {
    return {
      heartbeat: null,
      liveness: {state: "missing"},
      ageMs: null,
      error,
      statusFile: abs,
    };
  }

  const ageMs = ageFromHeartbeat(heartbeat, nowMs);
  const shouldProbePid = !heartbeat.complete && ageMs >= staleMs;
  const liveness = classifyLiveness({
    complete: Boolean(heartbeat.complete),
    frozenMs: ageMs,
    staleMs,
    pid: heartbeat.pid,
    pidAliveResult: shouldProbePid ? pidAlive(heartbeat.pid) : null,
  });

  return {heartbeat, liveness, ageMs, error: null, statusFile: abs};
}

export default function useHeartbeat(statusFile, opts = {}) {
  const watch = opts.watch !== false;
  const staleMs = Number.isFinite(opts.staleMs) ? opts.staleMs : DEFAULT_STALE_MS;
  const debounceMs = Number.isFinite(opts.debounceMs) ? opts.debounceMs : DEFAULT_DEBOUNCE_MS;
  const staleReprobeMs = Number.isFinite(opts.staleReprobeMs)
    ? opts.staleReprobeMs
    : DEFAULT_STALE_REPROBE_MS;
  const now = opts.now;
  const abs = statusFile ? path.resolve(statusFile) : null;

  const buildSnapshot = React.useCallback(() => (
    heartbeatSnapshot(abs, {staleMs, now})
  ), [abs, now, staleMs]);

  const [state, setState] = React.useState(() => buildSnapshot());

  React.useEffect(() => {
    let disposed = false;
    let watcher = null;
    let debounceTimer = null;
    let staleTimer = null;

    const clearDebounce = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = null;
    };

    const clearStale = () => {
      if (staleTimer) clearTimeout(staleTimer);
      staleTimer = null;
    };

    const armStaleProbe = (snapshot) => {
      clearStale();
      if (!watch || !snapshot || !snapshot.heartbeat || snapshot.heartbeat.complete) return;
      const ageMs = Number.isFinite(snapshot.ageMs) ? snapshot.ageMs : 0;
      const delay = ageMs >= staleMs
        ? staleReprobeMs
        : Math.max(25, staleMs - ageMs + 25);
      staleTimer = setTimeout(() => refresh(), delay);
      if (typeof staleTimer.unref === "function") staleTimer.unref();
    };

    const publish = (snapshot) => {
      if (disposed) return;
      setState(snapshot);
      armStaleProbe(snapshot);
    };

    function refresh() {
      publish(buildSnapshot());
    }

    const scheduleRefresh = () => {
      clearDebounce();
      debounceTimer = setTimeout(refresh, debounceMs);
      if (typeof debounceTimer.unref === "function") debounceTimer.unref();
    };

    refresh();
    if (!abs || !watch) {
      return () => {
        disposed = true;
        clearDebounce();
        clearStale();
      };
    }

    const dir = path.dirname(abs);
    const base = path.basename(abs);
    try {
      watcher = fs.watch(dir, (eventType, filename) => {
        if (!filename || String(filename) === base) scheduleRefresh();
      });
      watcher.on("error", scheduleRefresh);
    } catch (_) {
      armStaleProbe(buildSnapshot());
    }

    return () => {
      disposed = true;
      clearDebounce();
      clearStale();
      if (watcher) watcher.close();
    };
  }, [abs, buildSnapshot, debounceMs, staleMs, staleReprobeMs, watch]);

  return state;
}
