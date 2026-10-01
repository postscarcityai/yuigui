// Your $U on the web (SITE-161): the browser's twin of Earn/EarnStore.swift. The same two reads the app makes
// with the person's own session (the `yui_my_u` function and their `yui_ledger` rows, both behind RLS, no service
// key anywhere near the browser), the same plain words, and the same count: opening the drawer after the number
// grew counts it up once from what the person last saw. Only the new $U moves, so nothing counts twice.
// Every effect is injected (`request`, `storage`, the clock), so the tests drive it with stand-ins.

export const SOFT_CAP = 150;
export const NOTE = "No cash value. Not a token yet.";
// The kinds of row that say "you helped build Yui" (EarnStore.fetch).
export const BUILT_KINDS = ["feedback_shipped", "issue_accepted", "issue_shipped", "pr_merged"];

// How it adds up: the app's YourU.swift tables, word for word (the formula is at /earn#formula).
export const HOW_IT_ADDS_UP = [
  [["A message", "1"], ["A screen you answer", "2"], ["A job finished", "5"], ["First visit of a day", "10"]],
  [["3 days in a row", "x1.1"], ["7 days in a row", "x1.25 and +50"], ["30 days in a row", "x1.5 and +300"]],
  [["Feedback sent", "10"], ["Feedback shipped", "500"], ["Idea accepted", "200"], ["Idea shipped", "500"], ["Code added, small", "1,000"], ["medium", "3,000"], ["large", "10,000"]],
];

const BUILT_WORDS = {
  feedback_shipped: "Your feedback shipped",
  issue_accepted: "Your idea was accepted",
  issue_shipped: "Your idea shipped",
  pr_merged: "Your code was added",
};
export const builtWords = (kind) => BUILT_WORDS[kind] || null;

const int = (v, fallback = 0) => (Number.isFinite(Number(v)) && v !== null && v !== "" ? Math.trunc(Number(v)) : fallback);

/** The `yui_my_u` reply and the built rows as one summary (EarnSummary.init). Null when the reply is not an object. */
export function parseSummary(json, rows = null) {
  if (!json || typeof json !== "object" || Array.isArray(json)) return null;
  const days = (Array.isArray(json.history) ? json.history : [])
    .filter((h) => h && typeof h.day === "string")
    .map((h) => ({ day: h.day, messages: int(h.messages), screens: int(h.screens), jobs: int(h.jobs), earned: int(h.earned) }));
  const built = (Array.isArray(rows) ? rows : [])
    .map((r) => (r && typeof r.day === "string" && builtWords(r.kind) ? { day: r.day, words: builtWords(r.kind) } : null))
    .filter(Boolean);
  const mult = Number(json.mult);
  return {
    total: Math.max(0, int(json.total)),
    today: int(json.today),
    softCap: int(json.soft_cap, SOFT_CAP) || SOFT_CAP,
    streak: int(json.streak),
    mult: Number.isFinite(mult) && mult > 0 ? mult : 1,
    days, built, sample: false,
  };
}

/** What the demo and a signed out look shows: a stable story, marked as a sample, never a balance. */
export function sampleSummary() {
  return {
    total: 1284, today: 82, softCap: SOFT_CAP, streak: 6, mult: 1.1,
    days: [
      { day: "2026-09-30", messages: 34, screens: 9, jobs: 4, earned: 82 },
      { day: "2026-09-29", messages: 21, screens: 6, jobs: 2, earned: 61 },
      { day: "2026-09-28", messages: 12, screens: 3, jobs: 0, earned: 38 },
    ],
    built: [{ day: "2026-09-27", words: "Your feedback shipped" }],
    sample: true,
  };
}

/** 1284 -> "1,284". */
export const formatU = (n) => Math.max(0, Math.trunc(Number(n) || 0)).toLocaleString("en-US");

/** "2026-09-29" -> "Sep 29" (EarnSummary.shortDay). */
export function shortDay(day) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(day || "");
  if (!m) return String(day || "");
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], 12));
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

export const streakWords = (n) => (n <= 0 ? "None yet" : n === 1 ? "1 day" : `${n} days`);
export const speedWords = (mult) => `x${(Math.round(mult * 100) / 100).toString()}`;
export const dayWords = (d) => `${d.messages} messages, ${d.screens} screens, ${d.jobs} jobs, +${d.earned}`;

/** The first name from the account's email, else "You": Apple's private relay names nobody (AgentDrawer.name). */
export function firstName(email) {
  const local = String(email || "").split("@")[0] || "";
  if (!local || !/^\p{L}+$/u.test(local)) return "You";
  return local[0].toUpperCase() + local.slice(1);
}
export const initialOf = (email) => firstName(email)[0];

// ---------- the count ----------

// The same easing and the same length as the app: about half a second for a few, never over 1.6 s.
export const countMs = (from, to) => Math.min(1600, 500 + Math.log10(Math.max(0, to - from) + 1) * 350);
/** The number on screen `elapsed` ms into a count from `from` to `to` (easeOutCubic). */
export function valueAt(from, to, elapsed) {
  const k = Math.min(1, Math.max(0, elapsed) / countMs(from, to));
  return from + Math.floor((to - from) * (1 - Math.pow(1 - k, 3)));
}
// The drawer takes about half a second to settle; the count starts once it is in.
export const COUNT_DELAY_MS = 450;

/**
 * What to do with a fresh total. `seen` is the total the person last saw (or null: never). Count up only when the
 * drawer was just opened and the number grew; otherwise the number just changes.
 */
export function plan({ seen, total, animate, reduceMotion }) {
  const grew = Number.isFinite(seen) && seen !== null && seen < total;
  if (!animate || !grew) return { mode: "set", from: total, to: total };
  if (reduceMotion) return { mode: "set", from: total, to: total };
  return { mode: "count", from: seen, to: total };
}

// ---------- what the person last saw (localStorage) ----------

export const seenKey = (user) => `yuiUSeen.${user}`;
export function readSeen(storage, user) {
  try {
    const v = storage?.getItem(seenKey(user));
    if (v === null || v === undefined || v === "") return null;
    const n = Number(v);
    return Number.isInteger(n) && n >= 0 ? n : null;
  } catch { return null; }
}
export function writeSeen(storage, user, total) {
  try { storage?.setItem(seenKey(user), String(total)); } catch { /* private mode: it just counts again next time */ }
}

// ---------- the two reads ----------

/**
 * The signed in person's $U: `yui_my_u` (30 days) and their newest built rows, through the relay's
 * authenticated REST call (`request(path, init)` -> a fetch Response). Null when the first read fails;
 * a failed second read only leaves "You helped build" out.
 */
export async function fetchSummary(request) {
  let json;
  try {
    const res = await request("rest/v1/rpc/yui_my_u", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ p_days: 30 }) });
    json = await res.json();
  } catch { return null; }
  let rows = null;
  try {
    const q = new URLSearchParams([["select", "kind,day"], ["kind", `in.(${BUILT_KINDS.join(",")})`], ["order", "day.desc"], ["limit", "20"]]);
    rows = await (await request(`rest/v1/yui_ledger?${q}`)).json();
  } catch { /* the rest still shows */ }
  return parseSummary(json, rows);
}
