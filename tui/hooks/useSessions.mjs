import fs from "node:fs";
import path from "node:path";
import React from "react";
import sessionsLib from "../lib/sessions.js";

const DEFAULT_DEBOUNCE_MS = 250;

function cloneJson(value) {
  if (value === undefined || value === null) return value;
  return JSON.parse(JSON.stringify(value));
}

function readSessionList(auditRoot) {
  return sessionsLib.listSessions({auditRoot});
}

function selectSession(sessions, sessionId) {
  if (!sessionId) return null;
  return (Array.isArray(sessions) ? sessions : []).find((session) => session.sessionId === sessionId) || null;
}

function sortedSessions(sessions) {
  return Array.isArray(sessions) ? sessions.slice() : [];
}

export function createSessionsController({
  auditRoot,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  onChange,
  onError,
} = {}) {
  let disposed = false;
  let pendingCursor = null;
  let cursorTimer = null;

  const notify = (payload) => {
    if (!disposed && onChange) onChange(payload);
  };

  const fail = (err) => {
    if (!disposed && onError) onError(err);
    throw err;
  };

  const refresh = (activeSessionId) => {
    try {
      const sessions = sortedSessions(readSessionList(auditRoot));
      notify({
        activeSession: selectSession(sessions, activeSessionId),
        sessions,
      });
      return sessions;
    } catch (err) {
      if (!disposed && onError) onError(err);
      return [];
    }
  };

  const getSession = (sessionId) => {
    try {
      const session = sessionsLib.getSession({sessionId, auditRoot});
      refresh(sessionId);
      return session;
    } catch (err) {
      return fail(err);
    }
  };

  const createSession = (opts = {}) => {
    try {
      const session = sessionsLib.createSession({...opts, auditRoot});
      refresh(session.sessionId);
      return session;
    } catch (err) {
      return fail(err);
    }
  };

  const resumeSession = (sessionId) => getSession(sessionId);

  const appendEvent = (event = {}) => {
    try {
      const written = sessionsLib.appendEvent({...event, auditRoot});
      refresh(written.sessionId);
      return written;
    } catch (err) {
      return fail(err);
    }
  };

  const renameSession = ({sessionId, title, ts, now} = {}) => {
    const event = appendEvent({
      sessionId,
      type: "session.renamed",
      ts,
      now,
      payload: {title},
    });
    return sessionsLib.getSession({sessionId: event.sessionId, auditRoot});
  };

  const attachRun = (opts = {}) => {
    try {
      const session = sessionsLib.attachRun({...opts, auditRoot});
      refresh(session.sessionId);
      return session;
    } catch (err) {
      return fail(err);
    }
  };

  const flushCursor = () => {
    if (cursorTimer) clearTimeout(cursorTimer);
    cursorTimer = null;
    const next = pendingCursor;
    pendingCursor = null;
    if (!next || disposed) return null;
    try {
      const session = sessionsLib.updateCursor({...next, auditRoot});
      refresh(session.sessionId);
      return session;
    } catch (err) {
      return fail(err);
    }
  };

  const updateCursor = ({debounce = true, ...opts} = {}) => {
    pendingCursor = {
      ...opts,
      currentCursor: cloneJson(opts.currentCursor || {}),
    };
    if (!debounce || debounceMs <= 0) return flushCursor();
    if (cursorTimer) clearTimeout(cursorTimer);
    cursorTimer = setTimeout(flushCursor, debounceMs);
    if (typeof cursorTimer.unref === "function") cursorTimer.unref();
    return null;
  };

  const setStatus = (opts = {}) => {
    try {
      const session = sessionsLib.setStatus({...opts, auditRoot});
      refresh(session.sessionId);
      return session;
    } catch (err) {
      return fail(err);
    }
  };

  const materialize = (opts = {}) => {
    try {
      const result = sessionsLib.materialize({...opts, auditRoot});
      refresh(opts.sessionId);
      return result;
    } catch (err) {
      return fail(err);
    }
  };

  const dispose = () => {
    flushCursor();
    disposed = true;
    if (cursorTimer) clearTimeout(cursorTimer);
    cursorTimer = null;
  };

  return {
    appendEvent,
    attachRun,
    createSession,
    dispose,
    flushCursor,
    getSession,
    listSessions: refresh,
    materialize,
    renameSession,
    resumeSession,
    setStatus,
    updateCursor,
  };
}

export default function useSessions({
  auditRoot,
  activeSessionId: controlledActiveSessionId,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  watch = true,
} = {}) {
  const [sessions, setSessions] = React.useState(() => {
    try {
      return sortedSessions(readSessionList(auditRoot));
    } catch (_) {
      return [];
    }
  });
  const [activeSessionId, setActiveSessionId] = React.useState(controlledActiveSessionId || null);
  const [error, setError] = React.useState(null);
  const activeSessionIdRef = React.useRef(activeSessionId);
  const controllerRef = React.useRef(null);

  React.useEffect(() => {
    if (controlledActiveSessionId !== undefined) {
      setActiveSessionId(controlledActiveSessionId || null);
    }
  }, [controlledActiveSessionId]);

  React.useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  React.useEffect(() => {
    const controller = createSessionsController({
      auditRoot,
      debounceMs,
      onChange: ({sessions: nextSessions}) => {
        setSessions(nextSessions);
        setError(null);
      },
      onError: (err) => setError(err),
    });
    controllerRef.current = controller;
    controller.listSessions(activeSessionIdRef.current);
    return () => {
      controller.dispose();
      if (controllerRef.current === controller) controllerRef.current = null;
    };
  }, [auditRoot, debounceMs]);

  React.useEffect(() => {
    if (!watch) return undefined;
    const root = path.resolve(auditRoot || path.join(path.dirname(new URL(import.meta.url).pathname), "..", "..", "skill-audit-loop", "progress", "skill-audits"));
    const ledger = path.join(root, "_sessions.jsonl");
    let watcher = null;
    let timer = null;
    const refresh = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        if (controllerRef.current) controllerRef.current.listSessions(activeSessionIdRef.current);
      }, 75);
      if (typeof timer.unref === "function") timer.unref();
    };
    try {
      watcher = fs.watch(path.dirname(ledger), (eventType, filename) => {
        if (!filename || String(filename) === path.basename(ledger)) refresh();
      });
      watcher.on("error", refresh);
    } catch (_) {
      // Missing audit roots are normal before the first session is created.
    }
    return () => {
      if (timer) clearTimeout(timer);
      if (watcher) watcher.close();
    };
  }, [auditRoot, watch]);

  const activeSession = React.useMemo(
    () => selectSession(sessions, activeSessionId),
    [sessions, activeSessionId],
  );

  const withController = React.useCallback((fn) => {
    if (!controllerRef.current) throw new Error("session controller is not ready");
    return fn(controllerRef.current);
  }, []);

  const refresh = React.useCallback(() => (
    withController((controller) => controller.listSessions(activeSessionIdRef.current))
  ), [withController]);

  const createSession = React.useCallback((opts = {}) => {
    const session = withController((controller) => controller.createSession(opts));
    setActiveSessionId(session.sessionId);
    return session;
  }, [withController]);

  const getSession = React.useCallback((sessionId) => (
    withController((controller) => controller.getSession(sessionId))
  ), [withController]);

  const resumeSession = React.useCallback((sessionId) => {
    const session = withController((controller) => controller.resumeSession(sessionId));
    if (session) setActiveSessionId(session.sessionId);
    return session;
  }, [withController]);

  const appendEvent = React.useCallback((event = {}) => (
    withController((controller) => controller.appendEvent(event))
  ), [withController]);

  const renameSession = React.useCallback((opts = {}) => (
    withController((controller) => controller.renameSession(opts))
  ), [withController]);

  const attachRun = React.useCallback((opts = {}) => (
    withController((controller) => controller.attachRun(opts))
  ), [withController]);

  const updateCursor = React.useCallback((opts = {}) => (
    withController((controller) => controller.updateCursor(opts))
  ), [withController]);

  const flushCursor = React.useCallback(() => (
    withController((controller) => controller.flushCursor())
  ), [withController]);

  const setStatus = React.useCallback((opts = {}) => (
    withController((controller) => controller.setStatus(opts))
  ), [withController]);

  const materialize = React.useCallback((opts = {}) => (
    withController((controller) => controller.materialize(opts))
  ), [withController]);

  return {
    activeSession,
    activeSessionId,
    appendEvent,
    attachRun,
    createSession,
    error,
    flushCursor,
    getSession,
    materialize,
    refresh,
    renameSession,
    resumeSession,
    sessions,
    setActiveSessionId,
    setStatus,
    updateCursor,
  };
}
