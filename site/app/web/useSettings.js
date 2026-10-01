"use client";
// What Settings changes and the rest of the app reads (YUI-247): the appearance, the Full screen bar, the picks for
// Home actions and Yui's look. They live here so the thread, the stage and the palette follow a change at once,
// and so a second tab of the same browser agrees (a `storage` event). The look lives in the account.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  STAGE_DEFAULT, loadAppearance, loadPicks, loadStage, lookBody, lookState, lookVars, resolveAppearance, saveAppearance, savePicks, saveStage,
} from "../../lib/web/settings.mjs";

export const PrefsContext = createContext({ stage: STAGE_DEFAULT, picks: null, look: lookState(null), agentsKeep: true });
export const usePrefs = () => useContext(PrefsContext);

const stores = () => { try { return globalThis.localStorage; } catch { return null; } };

// system, light or dark. `forced` is the ?theme= of a link, which wins and is never saved.
export function useAppearance(forced) {
  const [pref, setPref] = useState("system");
  const touched = useRef(false);
  const [tick, setTick] = useState(0);
  useEffect(() => { setPref(loadAppearance(stores())); }, []);
  useEffect(() => {
    const root = document.documentElement;
    // A link's ?theme= wins until the person picks one themselves.
    if ((forced === "light" || forced === "dark") && !touched.current) { root.dataset.theme = forced; return undefined; }
    const mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
    const apply = () => { root.dataset.theme = resolveAppearance(pref, !!mq?.matches); };
    apply();
    if (pref !== "system" || !mq) return undefined;
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, [pref, forced, tick]);
  const set = useCallback((next) => { touched.current = true; setPref(saveAppearance(next, stores())); setTick((n) => n + 1); }, []);
  return [pref, set];
}

// The theme as the page wears it right now: "light" or "dark", following the <html> attribute (the moon button,
// ?theme=, Settings and the system all end there).
export function useDark() {
  const [dark, setDark] = useState(() => typeof document !== "undefined" && document.documentElement.dataset.theme === "dark");
  useEffect(() => {
    const root = document.documentElement;
    const read = () => setDark(root.dataset.theme === "dark");
    read();
    const mo = new MutationObserver(read);
    mo.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);
  return dark;
}

// One value kept in localStorage that Settings sets and other parts read.
function useKept(key, load, save, initial) {
  const [v, setV] = useState(initial);
  useEffect(() => {
    setV(load(stores()));
    const on = (e) => { if (!e.key || e.key === key) setV(load(stores())); };
    window.addEventListener("storage", on);
    window.addEventListener("yui-web-prefs", on);
    return () => { window.removeEventListener("storage", on); window.removeEventListener("yui-web-prefs", on); };
  }, [key, load]);
  const set = useCallback((next) => { save(next, stores()); setV(next); window.dispatchEvent(new Event("yui-web-prefs")); }, [save]);
  return [v, set];
}
export const useStagePrefs = () => useKept("yui-web-stage", loadStage, saveStage, STAGE_DEFAULT);
export const usePicks = () => useKept("yui-web-quick-picks", loadPicks, savePicks, null);

// Yui's look: the account's copy (yui-account), applied to the chrome through the site's tokens, written on the
// person's tap only. `call` is the relay's edge function call.
export function useAppLook(call, dark) {
  const [state, setState] = useState(lookState(null));
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const live = useRef(true);
  useEffect(() => { live.current = true; return () => { live.current = false; }; }, []);
  useEffect(() => {
    if (!call) return undefined;
    let ok = true;
    call("yui-account", { action: "get" }).then((r) => { if (ok) { setState(lookState(r.look)); setLoaded(true); } }).catch(() => ok && setLoaded(true));
    return () => { ok = false; };
  }, [call]);
  // The chrome wears the look: the site's tokens on the app's root, light or dark.
  useEffect(() => {
    const root = document.querySelector(".web-root");
    if (!root) return undefined;
    const vars = lookVars(state.look, dark);
    for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
    return () => { for (const k of Object.keys(vars)) root.style.removeProperty(k); };
  }, [state.look, dark, loaded]);
  const save = useCallback(async (next) => {
    const before = state;
    setState(next); setError("");
    try { await call("yui-account", { action: "set_look", look: lookBody(next) }); }
    catch { if (live.current) { setState(before); setError("Could not save the look. Try again."); } }
  }, [call, state]);
  return useMemo(() => ({ state, loaded, error, save }), [state, loaded, error, save]);
}
