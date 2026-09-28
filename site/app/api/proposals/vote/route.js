// Votes on proposals (SITE-89). POST casts or changes a vote, GET reads counts.
//   POST { proposal: "PROP-1", voter: <uuid from localStorage>, vote: "yes" | "not_yet", why?: "one line" }
//   GET  ?id=PROP-1&voter=<uuid>   counts, this browser's vote and the whys, newest first
//   GET  (no id)                   counts for every proposal
// No login and no email. Spam guard, two layers: per address, a hashed IP may only vote from so many
// different browsers per hour (recorded in the table) and so many requests per 10 minutes on this server.
import { proposals } from "../../../../lib/proposals.mjs";
import { hashIp } from "../../../../lib/chat/session.mjs";
import { CHOICES, ID_RE, castVote, cleanWhy, forProposal, okVoter, recentFromIp, tallies, whyLeak } from "../../../../lib/chat/votes.mjs";

const WINDOW = 10 * 60 * 1000, PER_IP = 30, BROWSERS_PER_HOUR = 20;
const hits = new Map();
function tooMany(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > PER_IP;
}

const noStore = { "Cache-Control": "no-store" };
const fail = (error, status) => Response.json({ ok: false, error }, { status, headers: noStore });
const known = (id) => ID_RE.test(id || "") && proposals().some((p) => p.id === id);
const ipOf = (req) => (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";

export async function POST(req) {
  let b;
  try { b = await req.json(); } catch { return fail("Bad request.", 400); }
  if (b.website) return Response.json({ ok: true }, { headers: noStore }); // honeypot
  if (!known(b.proposal)) return fail("No such proposal.", 404);
  if (!okVoter(b.voter)) return fail("Bad request.", 400);
  if (!CHOICES.includes(b.vote)) return fail("Pick Yes, build it or Not yet.", 400);
  const why = cleanWhy(b.why);
  if (why && whyLeak(why)) return fail("Keep it to plain words about the idea: no emails, phone numbers, prices or names of other people.", 400);

  const ip = ipOf(req);
  if (tooMany(ip)) return fail("Lots of votes right now. Try again in a few minutes.", 429);
  const ipHash = hashIp(ip);
  const before = await forProposal(b.proposal, b.voter);
  if (!before?.me && (await recentFromIp(ipHash)) >= BROWSERS_PER_HOUR) return fail("Lots of votes from here. Try again later.", 429);

  const ok = await castVote({ proposal: b.proposal, voter: b.voter, vote: b.vote, why, ipHash });
  if (!ok) return fail("Votes are offline. Try again soon.", 503);
  return Response.json({ ok: true, ...(await forProposal(b.proposal, b.voter)) }, { headers: noStore });
}

export async function GET(req) {
  const u = new URL(req.url), id = u.searchParams.get("id"), voter = u.searchParams.get("voter");
  if (id) {
    if (!known(id)) return fail("No such proposal.", 404);
    const r = await forProposal(id, okVoter(voter) ? voter : null);
    return r ? Response.json({ ok: true, ...r }, { headers: noStore }) : fail("Votes are offline.", 503);
  }
  const t = await tallies();
  return t ? Response.json({ ok: true, tallies: t }, { headers: noStore }) : fail("Votes are offline.", 503);
}
