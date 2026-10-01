"use client";
// What a running timer or workout asks of the tab (YUI-246): the browser's twin of the Live Activity and the idle timer
// (Presets/LiveTimer.swift). While it runs the tab title shows the time left, and a screen Wake Lock keeps the phone
// from dimming mid-set where the browser has one (it lets go when the tab is hidden, so it is asked again on return).
// A closed tab stops the timer; there is no lock-screen pill. Both do nothing on the server.
import { useEffect, useRef } from "react";

// `make(base)` is the title to show while on, from the page's own title (null restores it). `key` is what changes it.
export function useTabTitle(make, key) {
  const base = useRef(null);
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (make == null) {
      if (base.current != null) { document.title = base.current; base.current = null; }
      return;
    }
    if (base.current == null) base.current = document.title;
    document.title = make(base.current);
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { if (base.current != null && typeof document !== "undefined") { document.title = base.current; base.current = null; } }, []);
}

export function useWakeLock(on) {
  useEffect(() => {
    if (!on || typeof navigator === "undefined" || !navigator.wakeLock) return undefined;
    let lock = null; let gone = false;
    const get = () => navigator.wakeLock.request("screen").then((l) => { if (gone) l.release().catch(() => {}); else lock = l; }).catch(() => {});
    const back = () => { if (document.visibilityState === "visible" && (!lock || lock.released)) get(); };
    get();
    document.addEventListener("visibilitychange", back);
    return () => { gone = true; document.removeEventListener("visibilitychange", back); lock?.release().catch(() => {}); };
  }, [on]);
}
