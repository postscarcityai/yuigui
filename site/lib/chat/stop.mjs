// Stop a turn (SITE-84, the site's half of YUI-190): while Yui works, the send button (or the mic)
// is a stop square. Stop aborts the request, anything that lands after it is dropped, and the thread
// keeps one quiet "Stopped." row. The route sees the same abort (request.signal) and stops the model
// call, so a stopped turn is never stored.
export const STOPPED = "Stopped.";

// The page's side: one turn at a time. start() aborts any turn still running and hands out a fresh
// id and signal; stop() aborts the running one; live(id) says whether a reply may still land.
export function turns() {
  let n = 0, ctrl = null;
  return {
    start() {
      ctrl?.abort();
      ctrl = new AbortController();
      return { id: ++n, signal: ctrl.signal };
    },
    stop() {
      if (!ctrl) return false;
      ctrl.abort();
      ctrl = null;
      n += 1;
      return true;
    },
    done(id) { if (id === n) ctrl = null; },
    live(id) { return id === n && !!ctrl && !ctrl.signal.aborted; },
  };
}

// The thread row a stop leaves behind: drawn as one quiet line in the record, never sent to Yui.
export const stoppedRow = () => ({ card: "stopped" });

// The server's side: the person's abort and the model timeout, whichever comes first.
export function turnSignal(signal, ms) {
  const t = AbortSignal.timeout(ms);
  return signal ? AbortSignal.any([signal, t]) : t;
}

export const stopped = (signal) => Boolean(signal?.aborted);

export function stopError() {
  const e = new Error("stopped");
  e.name = "AbortError";
  return e;
}
