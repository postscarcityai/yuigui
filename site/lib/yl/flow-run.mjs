// A flow run that survives a reload (SITE-144, web twin of YUI-115): where the
// person is, their answers, and whether it was sent, kept in sessionStorage
// under the message key and the flow id. Plus the way on for an unknown name.
import { FLOW_VARIANTS, STARTER_FLOWS } from "./starter-flows.mjs";

export const LIBRARY_HREF = "/developers/library";

export const runKey = (messageKey, flowId) => `yui-flow-run:${messageKey}:${flowId}`;

// The saved run, or null. Anything that no longer fits the graph (a step that
// is gone, a stale shape) is dropped, so a changed flow starts clean.
export function loadRun(store, key, stepIds) {
  let r;
  try { r = JSON.parse(store?.getItem(key) || "null"); } catch { return null; }
  if (!r || typeof r !== "object") return null;
  const ids = new Set(stepIds);
  const at = r.at === "review" || ids.has(r.at) ? r.at : null;
  const ans = {};
  if (r.ans && typeof r.ans === "object") for (const [k, v] of Object.entries(r.ans)) if (ids.has(k)) ans[k] = v;
  return { at, ans, fromReview: !!r.fromReview, done: !!r.done };
}

export function saveRun(store, key, run) {
  try { store?.setItem(key, JSON.stringify({ at: run.at, ans: run.ans, fromReview: !!run.fromReview, done: !!run.done })); } catch { /* private mode: the run just does not last */ }
}

const slug = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function dist(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

// Saved flow names nearest to what was asked for, best first (at most `n`).
// A shared word or a substring counts, then edit distance on the whole name.
export function closestFlows(name, n = 3, names = [...STARTER_FLOWS, ...FLOW_VARIANTS].map((f) => f.name)) {
  const q = slug(name);
  if (!q) return names.slice(0, n);
  const words = q.split("-");
  const score = (nm) => {
    const w = nm.split("-");
    const shared = words.filter((x) => w.includes(x) || (x.length > 2 && w.some((y) => y.startsWith(x) || x.startsWith(y)))).length;
    const sub = nm.includes(q) || q.includes(nm) ? 2 : 0;
    return shared * 3 + sub - dist(q, nm) / Math.max(q.length, nm.length);
  };
  return [...names].sort((a, b) => score(b) - score(a)).slice(0, n);
}

// What the unknown-name card shows: the short note, the library, the near names.
export function missingFlow(name) {
  return {
    title: name || "Flow",
    note: "No saved flow by that name on this phone yet.",
    library: { label: "Saved flows", href: LIBRARY_HREF },
    near: closestFlows(name),
  };
}
