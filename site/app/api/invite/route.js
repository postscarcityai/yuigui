// Invite requests (SITE-26). Writes a row to yui_invites in the PostScarcity AI Supabase project (PROOF)
// with the service role key; the table has RLS on and no grants, so anon can never read or write it.
// The row starts as status=requested. Approving it (supabase/scripts/invite.py in the app repo) is Chris's call.
// The checks and the insert live in lib/invite.mjs, shared with the chat (SITE-64).
import { insertInvite, inviteEnv, readContact } from "../../../lib/invite.mjs";

// Spam guard, two layers. Per visitor: 5 tries per 10 minutes on this server instance.
// Site-wide: if more than 40 requests landed in the last 10 minutes, new ones wait.
const WINDOW = 10 * 60 * 1000, PER_IP = 5, SITE_WIDE = 40;
const hits = new Map();
function tooMany(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > PER_IP;
}

const slow = () => Response.json({ ok: false, error: "Lots of requests right now. Try again in a few minutes." }, { status: 429 });

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return Response.json({ ok: false, error: "Bad request." }, { status: 400 }); }

  // Honeypot: bots fill every field. Pretend it worked.
  if (body.website) return Response.json({ ok: true });

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  if (tooMany(ip)) return slow();

  const contact = readContact(body, { needName: body.first_name !== undefined });
  if (contact.error) return Response.json({ ok: false, error: contact.error }, { status: 400 });

  const env = inviteEnv();
  if (!env) return Response.json({ ok: false, error: "Invites are offline. Try again soon." }, { status: 503 });
  const since = new Date(Date.now() - WINDOW).toISOString();
  const count = await fetch(`${env.url}/rest/v1/yui_invites?select=id&status=eq.requested&created_at=gte.${since}`, {
    method: "HEAD", headers: { ...env.headers, Prefer: "count=exact" },
  });
  const total = Number((count.headers.get("content-range") || "").split("/")[1]);
  if (total > SITE_WIDE) return slow();

  const r = await insertInvite(contact, { source: body.source, utm: body.utm, req });
  return Response.json(r.ok ? { ok: true } : { ok: false, error: r.error }, { status: r.ok ? 200 : r.status });
}
