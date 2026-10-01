// Settings and account on the web (YUI-247): the pure half. The browser twin of SettingsView.swift and what it
// holds: Appearance, Full screen (Stage first), Home actions, Look, Agent access, the key forms' words, Help,
// Account, About. Every function takes its storage and its clock, so the node tests drive them with stand-ins.
// Nothing here stores a key: a key is typed into a field, sent once over the session, and forgotten.
import { PAPERS, SETS, YUI, compile } from "../yl/look.mjs";

// ---------- Appearance (system, light, dark) ----------

export const APPEARANCE_KEY = "yui-web-appearance";
export const APPEARANCES = ["system", "light", "dark"];
export const APPEARANCE_LABEL = { system: "System", light: "Light", dark: "Dark" };

export function loadAppearance(storage = globalThis.localStorage) {
  try { const v = storage.getItem(APPEARANCE_KEY); return APPEARANCES.includes(v) ? v : "system"; } catch { return "system"; }
}
// The site's own `yui-theme` follows the choice, so the other pages of the site agree once a person picked one.
export function saveAppearance(pref, storage = globalThis.localStorage) {
  if (!APPEARANCES.includes(pref)) return "system";
  try {
    storage.setItem(APPEARANCE_KEY, pref);
    if (pref === "system") storage.removeItem("yui-theme"); else storage.setItem("yui-theme", pref);
  } catch { /* private mode */ }
  return pref;
}
export const resolveAppearance = (pref, prefersDark) => (pref === "dark" || (pref !== "light" && prefersDark) ? "dark" : "light");

// ---------- Full screen (Stage first: StageFirstModel, Settings > Full screen) ----------

export const STAGE_KEY = "yui-web-stage";
export const STAGE_DEFAULT = Object.freeze({ on: true, mic: true, type: true, attach: true });

export function loadStage(storage = globalThis.localStorage) {
  try {
    const v = JSON.parse(storage.getItem(STAGE_KEY) || "{}");
    return fixStage({ ...STAGE_DEFAULT, ...Object.fromEntries(Object.keys(STAGE_DEFAULT).filter((k) => typeof v[k] === "boolean").map((k) => [k, v[k]])) });
  } catch { return { ...STAGE_DEFAULT }; }
}
// One of the mic and T always stays: the bar is never empty.
export function fixStage(s) { return !s.mic && !s.type ? { ...s, mic: true } : s; }
export function setStage(s, key, value) {
  if (!(key in STAGE_DEFAULT)) return s;
  const next = { ...s, [key]: !!value };
  // Turning one of the pair off while the other is already off turns the other back on, as the app's binding does.
  if (key === "mic" && !value && !s.type) next.mic = true;
  if (key === "type" && !value && !s.mic) next.type = true;
  return next;
}
export function saveStage(s, storage = globalThis.localStorage) {
  try { storage.setItem(STAGE_KEY, JSON.stringify(s)); } catch { /* private mode */ }
  return s;
}

// ---------- Home actions (QuickActions.swift: up to four, chosen and ordered) ----------

export const PICKS_KEY = "yui-web-quick-picks";
export const PICKS_CAP = 4;

export function loadPicks(storage = globalThis.localStorage) {
  try { const v = JSON.parse(storage.getItem(PICKS_KEY) || "null"); return Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, PICKS_CAP) : null; } catch { return null; }
}
export function savePicks(picks, storage = globalThis.localStorage) {
  try { if (picks) storage.setItem(PICKS_KEY, JSON.stringify(picks.slice(0, PICKS_CAP))); else storage.removeItem(PICKS_KEY); } catch { /* private mode */ }
  return picks;
}
// Tap a row: on the list it comes off, off the list it goes on the end while there is room.
export function togglePick(picks, id, cap = PICKS_CAP) {
  const have = picks || [];
  if (have.includes(id)) return have.filter((x) => x !== id);
  return have.length >= cap ? have : [...have, id];
}
export function movePick(picks, id, by) {
  const i = (picks || []).indexOf(id), j = i + by;
  if (i < 0 || j < 0 || j >= picks.length) return picks;
  const out = [...picks];
  [out[i], out[j]] = [out[j], out[i]];
  return out;
}

// ---------- Look (AppLook, AppLookStore: the account's copy wins) ----------

const RECIPE_KEYS = ["preset", "accent", "bg", "radius", "font", "weight", "motion"];

// The account's `look` (null: Yui's own, the default switch) as the screen reads it.
export function lookState(json) {
  const o = json && typeof json === "object" ? json : {};
  const flat = (v) => (v && typeof v === "object" ? Object.fromEntries(RECIPE_KEYS.filter((k) => v[k] != null && v[k] !== "").map((k) => [k, v[k]])) : null);
  const look = flat(o);
  return {
    look: look && Object.keys(look).length ? look : null,
    prev: o.prev && typeof o.prev === "object" ? flat(o.prev) : null,
    agentsKeep: typeof o.agents_keep_looks === "boolean" ? o.agents_keep_looks : true,
    via: typeof o.via === "string" ? o.via : null,
  };
}
// The body of `yui-account set_look`: null only for Yui's own look with the default switch.
export function lookBody(s) {
  if (!s.look && !s.prev && s.agentsKeep) return null;
  const out = { ...(s.look || {}) };
  if (s.prev) out.prev = { ...s.prev };
  out.agents_keep_looks = s.agentsKeep;
  if (s.via) out.via = s.via;
  return out;
}
// What a look is called in Settings (AppLook.name).
export function lookName(look) {
  if (!look) return "Yui's own";
  if (look.preset && !look.accent && !look.bg) return look.preset[0].toUpperCase() + look.preset.slice(1);
  return "Your own mix";
}
export const setAgentsKeep = (s, on) => ({ ...s, agentsKeep: !!on });
export const resetLook = (s) => (s.look ? { ...s, prev: s.look, look: null, via: null } : s);
// A `theme app` offer taken (RestyleCard Use): a named set starts fresh, keys change only what they say, reset is
// Yui's own. The look from before is kept as `prev` so Undo can put it back, and the agent's name rides as `via`.
export function takeOffer(s, props, via = null) {
  if (props.name === "reset") return resetLook(s);
  const base = props.name ? { preset: props.name } : { ...(s.look || { preset: "yui" }) };
  for (const k of RECIPE_KEYS) if (k !== "preset" && props[k]) base[k] = props[k];
  return { ...s, prev: s.look, look: base, via: via || null };
}
export const undoOffer = (s) => ({ ...s, look: s.prev || null, prev: null, via: null });

// The recipe a stored look compiles from: its set, then what it changes on top.
export function recipeOf(look) {
  if (!look) return null;
  const r = { ...(SETS[look.preset] || SETS.yui) };
  if (look.accent) r.accent = SETS[look.accent]?.accent || look.accent;
  if (look.bg) r.bg = PAPERS[look.bg] || look.bg;
  for (const k of ["radius", "font", "weight", "motion"]) if (look[k]) r[k] = look[k];
  return r;
}
export const compiled = (look) => (look ? compile(recipeOf(look), look.preset || "custom") : YUI);

// The site's tokens (app/globals.css) from a palette: the chrome of /web wears the look through these.
export function lookVars(look, dark) {
  if (!look) return {};
  const p = compiled(look)[dark ? "dark" : "light"];
  return {
    "--background": p.background, "--surface": p.surface, "--ink": p.ink, "--ink-soft": p.inkSoft, "--muted": p.inkSoft,
    "--outline": p.outline, "--brand": p.accent, "--on-brand": p.onAccent, "--link": p.accent,
    "--user-bubble": p.userBubble, "--user-ink": p.userInk, "--agent-bubble": p.agentBubble, "--agent-ink": p.agentInk,
  };
}

// ---------- Agent access (management tokens) ----------

export const tokenName = (count) => `Agent access ${count + 1}`;
export function usedWords(at, now = Date.now()) {
  const t = at ? Date.parse(at) : NaN;
  if (Number.isNaN(t)) return "Never used";
  const days = Math.floor((now - t) / 86_400_000);
  return days <= 0 ? "Used today" : days === 1 ? "Used yesterday" : `Used ${days} days ago`;
}

// ---------- Your model key and web search (yui-native: the key goes once, the server keeps it) ----------

export function modelLeft(t) { return `Yui and your crew have ${Math.max(t.limit - t.used, 0)} of ${t.limit} free turns left this month. Add your own key to keep going with no limit.`; }
export function searchLeft(s) {
  const left = Math.max(s.limit - s.used, 0);
  return left === 0
    ? `Your ${s.limit} free web searches are used up this month. Add your own Firecrawl key and searches have no limit.`
    : `Your crew has ${left} of ${s.limit} free web searches left this month. Add your own Firecrawl key for no limit.`;
}
export const KEY_LOCKED = "Your key goes to Yui's server once and is kept locked away there. This page never shows it again.";
export const OTHER_ROAD = "Have a Claude or ChatGPT plan? Add Yui inside Claude or ChatGPT and your plan pays. Yui draws the screens.";
export const OTHER_ROAD_URL = "/developers/mcp";
export const FIRECRAWL_KEYS = "https://www.firecrawl.dev/app/api-keys";

// A refusal from yui-native in plain words. The server's own `message` (the provider's reason) leads when it has one.
export function nativeError(e) {
  const code = e?.code || "";
  if (e?.message && code === "key_check_failed" && !/^key_check_failed$/.test(e.message)) return e.message;
  return ({
    invalid_key: "That does not look like a key. Paste the whole key, with no spaces.",
    key_check_failed: "The provider did not accept that key.",
    unknown_provider: "Yui does not know that provider.",
    invalid_base_url: "That server address needs to start with https:// and be on the internet.",
    model_required: "This provider needs a model name too.",
    network: "Could not reach Yui. Check your connection and try again.",
    unauthorized: "Your session ended. Sign in again.",
  })[code] || "Could not save that. Try again in a moment.";
}
export const keyShapeOk = (k) => typeof k === "string" && k.trim().length >= 8 && !/\s/.test(k.trim());

// ---------- Help and feedback ----------

export const HELP = "/help";
export const START = "/start";
export const PRIVACY = "/privacy";
export const FEEDBACK_EMAIL = "chris@postscarcity.ai";
// A mail draft that already names the build (YuiBackend.feedbackMail), plus what the person typed.
export function feedbackMail(build = {}, text = "") {
  const v = build.commit ? `web ${build.commit}` : "web";
  const body = [String(text || "").trim(), "", "---", buildSummary(build)].join("\n").trim();
  return `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(`Yui feedback, ${v}`)}&body=${encodeURIComponent(body)}`;
}

// ---------- Account ----------

export function accountLine(user, review = false) {
  return { title: review ? "Demo account" : "Signed in with Apple", email: user?.email || "" };
}
export const DELETE_WORDS = {
  title: "Delete your Yui account?",
  note: "This permanently removes your account, your paired agents and devices, and every message stored on Yui's servers. Yui is also removed from your Apple ID. It can't be undone.",
  confirm: "Delete my account", keep: "Keep my account",
};
export function deleteError(code) {
  return code === "network" ? "Could not reach Yui, so nothing was deleted. Check your connection and try again." : "Could not delete the account. Nothing was removed. Try again in a moment.";
}

// ---------- About this build (BuildInfo.summary) ----------

export function buildSummary(b = {}) {
  const lines = [`Yui on the web${b.commit ? "" : ", local build"}`];
  if (b.commit) lines.push(`Commit ${b.commit}${b.built ? `, built ${b.built}` : ""}`);
  if (b.guide) lines.push(`Channel guide ${b.guide}`);
  if (b.browser) lines.push(b.browser);
  return lines.join("\n");
}
export const guideOf = (md) => /^# Yui channel guide (v\d+)/m.exec(md || "")?.[1] || "";
export function browserLine(ua = "") {
  const m = /(Edg|Chrome|CriOS|Firefox|FxiOS|Version)\/(\d+)/.exec(ua);
  const safari = /Safari\//.test(ua) && m?.[1] === "Version";
  const name = !m ? "" : m[1] === "Edg" ? "Edge" : m[1] === "CriOS" || m[1] === "Chrome" ? "Chrome" : m[1] === "FxiOS" || m[1] === "Firefox" ? "Firefox" : safari ? "Safari" : "";
  return name ? `${name} ${m[2]}` : "";
}

// ---------- Speed (Perf/*: a dev switch, never visible to a person) ----------

export const PERF_KEY = "yui-web-perf";
export function perfOn(search = "", storage = globalThis.localStorage) {
  try {
    const q = new URLSearchParams(search).get("perf");
    if (q === "1") { storage.setItem(PERF_KEY, "1"); return true; }
    if (q === "0") { storage.removeItem(PERF_KEY); return false; }
    return storage.getItem(PERF_KEY) === "1";
  } catch { return false; }
}

// ---------- Where a section lives (yui://settings/<section>) ----------

export const SECTIONS = ["search", "key", "keys"];
export const sectionOf = (v) => (SECTIONS.includes(v) ? v : null);
