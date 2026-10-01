"use client";
// Notifications on the web (YUI-248): the page's half. One controller (lib/web/push.mjs) for the signed-in
// session, the state the settings switch shows, and the two things the app does with a thread: tell yui-push it
// is open (so a reply doesn't buzz twice) and clear that agent's notification and badge when it is read.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PRESENCE_EVERY, createPush, onWorkerMessage } from "../../lib/web/push.mjs";

const SPOKEN = {
  blocked: "Your browser said no. Allow notifications for this site in its settings, then try again.",
  dismissed: "Not turned on. Tap the switch to try again.",
  install: "On iPhone, add Yui to your Home Screen first, then open it from there.",
  unsupported: "This browser can't show notifications.",
};

function browserEnv() {
  return {
    storage: window.localStorage,
    ua: navigator.userAgent,
    serviceWorker: "serviceWorker" in navigator ? navigator.serviceWorker : null,
    hasPush: "PushManager" in window,
    Notification: "Notification" in window ? window.Notification : null,
    standalone: window.matchMedia?.("(display-mode: standalone)").matches || navigator.standalone === true,
    navigator,
  };
}

export function usePush({ relay, ready, openId, onList }) {
  const push = useMemo(() => (relay && ready ? createPush({ call: (fn, body) => relay.call(fn, body), env: browserEnv() }) : null), [relay, ready]);
  const [state, setState] = useState(null);
  const [error, setError] = useState("");
  const listRef = useRef(onList);
  listRef.current = onList;

  // Each launch: the worker is current, a rotated subscription is told again, and the switch shows the truth.
  useEffect(() => {
    if (!push) return undefined;
    let live = true;
    push.install().catch(() => {}).then(() => push.sync()).catch(() => {}).then(() => push.state()).then((s) => live && setState(s)).catch(() => {});
    return () => { live = false; };
  }, [push]);

  // The worker says an agent left the list.
  useEffect(() => {
    if (!push || !navigator.serviceWorker) return undefined;
    const on = (e) => { if (onWorkerMessage(e.data).refreshList) listRef.current?.(); };
    navigator.serviceWorker.addEventListener("message", on);
    return () => navigator.serviceWorker.removeEventListener("message", on);
  }, [push]);

  // The open thread is in front of the person: yui-push skips this browser for it, and its notification and badge go.
  useEffect(() => {
    if (!push || state !== "on" || !openId) return undefined;
    let timer = null;
    const tell = (active) => push.presence(openId, active).catch(() => {});
    const show = () => {
      if (document.hidden) return;
      tell(true);
      push.clear(openId).catch(() => {});
    };
    const change = () => { if (document.hidden) tell(false); else show(); };
    show();
    timer = setInterval(() => { if (!document.hidden) tell(true); }, PRESENCE_EVERY);
    document.addEventListener("visibilitychange", change);
    window.addEventListener("focus", show);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", change); window.removeEventListener("focus", show); tell(false); };
  }, [push, state, openId]);

  const enable = useCallback(async () => {
    setError("");
    try { setState(await push.enable()); } catch (e) { setError(SPOKEN[e?.code] || "Couldn't turn notifications on just now. Check your connection and try again."); setState(await push.state().catch(() => "off")); }
  }, [push]);
  const disable = useCallback(async () => {
    setError("");
    try { setState(await push.disable()); } catch { setError("Couldn't turn them off just now. Try again."); }
  }, [push]);

  return { state, error, enable, disable, forget: useCallback(() => push?.forget() ?? Promise.resolve(), [push]) };
}
