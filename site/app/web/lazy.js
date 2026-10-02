"use client";
// YUI-271: the sheets and panels a person opens by a tap are their own chunks, so the first screen of /web
// ships without them. preloadPanels() fetches them when the browser is idle, so the first tap still answers at once.
import dynamic from "next/dynamic";

const load = (fn) => dynamic(fn, { ssr: false, loading: () => null });
const loaders = [
  () => import("./GroupThread"), () => import("./Groups"), () => import("./AddAgent"), () => import("./EditAgent"),
  () => import("./ControlsPanel"), () => import("./ConnectApproval"), () => import("./Palette"),
  () => import("./SettingsPanel"), () => import("./SettingsKeys"), () => import("./PerfHud"),
];

export const GroupThread = load(() => import("./GroupThread"));
export const NewGroupSheet = load(() => import("./Groups").then((m) => m.NewGroupSheet));
export const AddAgent = load(() => import("./AddAgent"));
export const EditAgent = load(() => import("./EditAgent"));
export const ControlsPanel = load(() => import("./ControlsPanel"));
export const ConnectApproval = load(() => import("./ConnectApproval"));
export const Palette = load(() => import("./Palette"));
export const SettingsPanel = load(() => import("./SettingsPanel"));
export const KeyAskSheet = load(() => import("./SettingsKeys").then((m) => m.KeyAskSheet));
export const PerfHud = load(() => import("./PerfHud"));

/** Warm every lazy chunk once the page has settled. Returns the cleanup for a useEffect. */
export function preloadPanels() {
  if (typeof window === "undefined") return undefined;
  const run = () => loaders.forEach((l) => { l().catch(() => {}); });
  if (window.requestIdleCallback) { const id = window.requestIdleCallback(run, { timeout: 4000 }); return () => window.cancelIdleCallback(id); }
  const t = setTimeout(run, 2000);
  return () => clearTimeout(t);
}
