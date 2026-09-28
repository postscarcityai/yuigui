// Votes on proposals (SITE-89): one server-only table in Yui's Supabase project, written with the service
// key through PostgREST, like the chat store. Schema: site/lib/chat/proposal_votes.sql. Without the Supabase
// env (local dev) votes live in memory, so the page still works while you build it.
import { findLeak } from "../public-guard.mjs";

const url = () => process.env.YUI_SUPABASE_URL;
const key = () => process.env.YUI_SUPABASE_SERVICE_ROLE_KEY;
export const stored = () => Boolean(url() && key());

export const CHOICES = ["yes", "not_yet"];
export const WHY_MAX = 200;
export const ID_RE = /^PROP-\d{1,4}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const okVoter = (v) => typeof v === "string" && UUID_RE.test(v);

const headers = (prefer) => ({ apikey: key(), Authorization: `Bearer ${key()}`, "Content-Type": "application/json", ...(prefer ? { Prefer: prefer } : {}) });
const local = new Map(); // `${proposal}:${voter}` -> row, local dev only

// A why is one line of plain words: control characters go, spaces collapse, 200 characters at most.
export function cleanWhy(v) {
  if (v === undefined) return undefined;
  if (v === null) return null;
  if (typeof v !== "string") return undefined;
  return v.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, WHY_MAX) || null;
}

// Public guard on a why: null when fine, else what leaked. Runs on the way in and again on the way out.
export const whyLeak = (why) => (why ? findLeak(why)?.[0] || null : null);

export async function castVote({ proposal, voter, vote, why, ipHash }) {
  const row = { proposal_id: proposal, voter_id: voter, vote, ip_hash: ipHash };
  if (why !== undefined) row.why = why;
  if (!stored()) {
    const k = `${proposal}:${voter}`, old = local.get(k);
    local.set(k, { ...(old || { created_at: new Date().toISOString() }), ...row, updated_at: new Date().toISOString() });
    return true;
  }
  const res = await fetch(`${url()}/rest/v1/yui_proposal_votes?on_conflict=proposal_id,voter_id`, {
    method: "POST", headers: headers("resolution=merge-duplicates,return=minimal"), body: JSON.stringify(row),
  });
  if (!res.ok) console.error("votes: upsert failed", res.status, (await res.text()).slice(0, 300));
  return res.ok;
}

// How many different browsers this address has voted from in the last hour (a new vote counts once).
export async function recentFromIp(ipHash) {
  const since = new Date(Date.now() - 3600_000).toISOString();
  if (!stored()) return [...local.values()].filter((r) => r.ip_hash === ipHash && r.updated_at >= since).length;
  const res = await fetch(`${url()}/rest/v1/yui_proposal_votes?select=proposal_id&ip_hash=eq.${ipHash}&updated_at=gte.${since}`, {
    method: "HEAD", headers: headers("count=exact"),
  });
  return Number((res.headers.get("content-range") || "").split("/")[1]) || 0;
}

async function rows(query) {
  if (!stored()) return [...local.values()];
  const res = await fetch(`${url()}/rest/v1/yui_proposal_votes?${query}`, { headers: headers(), cache: "no-store" });
  if (!res.ok) { console.error("votes: read failed", res.status); return null; }
  return res.json();
}

// { PROP-1: { yes, not_yet } } for the list page and the cards.
export async function tallies() {
  const all = await rows("select=proposal_id,vote&limit=50000");
  if (!all) return null;
  const out = {};
  for (const r of all) (out[r.proposal_id] ||= { yes: 0, not_yet: 0 })[r.vote]++;
  return out;
}

// One proposal: counts, this browser's own vote, and the whys (newest first) that pass the public guard.
export async function forProposal(proposal, voter) {
  const all = await rows(`select=voter_id,vote,why,updated_at&proposal_id=eq.${proposal}&limit=50000`);
  if (!all) return null;
  const mine = all.filter((r) => (r.proposal_id || proposal) === proposal);
  const counts = { yes: 0, not_yet: 0 };
  let me = null;
  for (const r of mine) {
    counts[r.vote]++;
    if (voter && r.voter_id === voter) me = { vote: r.vote, why: r.why || "" };
  }
  const whys = mine
    .filter((r) => r.why && !whyLeak(r.why))
    .sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1))
    .slice(0, 30)
    .map((r) => ({ vote: r.vote, why: r.why, at: r.updated_at }));
  return { counts, me, whys };
}
