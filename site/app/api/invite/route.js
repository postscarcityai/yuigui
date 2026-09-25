// Invite requests (SITE-26). Writes a row to yui_invites in the PostScarcity AI Supabase project (PROOF)
// with the service role key; the table has RLS on and no grants, so anon can never read or write it.
// The row starts as status=requested. Approving it (supabase/scripts/invite.py in the app repo) is Chris's call.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[0-9 ().-]{7,25}$/;
const clip = (v, n) => (typeof v === "string" ? v.trim().slice(0, n) : null) || null;

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

  // Older pages sent one "name" field; it becomes the first name.
  const first = clip(body.first_name ?? body.name, 80);
  const last = clip(body.last_name, 80);
  const email = clip(body.email, 254)?.toLowerCase();
  const phone = clip(body.phone, 32);
  if (!email || !EMAIL.test(email)) return Response.json({ ok: false, error: "That email does not look right." }, { status: 400 });
  if (body.first_name !== undefined && (!first || !last)) return Response.json({ ok: false, error: "We need your first and last name." }, { status: 400 });
  if (phone && !PHONE.test(phone)) return Response.json({ ok: false, error: "That phone number does not look right." }, { status: 400 });

  const url = process.env.YUI_SUPABASE_URL, key = process.env.YUI_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return Response.json({ ok: false, error: "Invites are offline. Try again soon." }, { status: 503 });
  const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

  const since = new Date(Date.now() - WINDOW).toISOString();
  const count = await fetch(`${url}/rest/v1/yui_invites?select=id&status=eq.requested&created_at=gte.${since}`, {
    method: "HEAD", headers: { ...headers, Prefer: "count=exact" },
  });
  const total = Number((count.headers.get("content-range") || "").split("/")[1]);
  if (total > SITE_WIDE) return slow();

  const utm = clip(body.utm, 500);
  const row = {
    first_name: first,
    last_name: last,
    email,
    phone,
    source: clip(body.source, 60),
    utm: utm && /utm_/.test(utm) ? utm : null,
    referrer: clip(req.headers.get("referer"), 500),
    user_agent: clip(req.headers.get("user-agent"), 500),
  };
  const res = await fetch(`${url}/rest/v1/yui_invites`, {
    method: "POST",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify(row),
  });
  // 409 = that email already asked (or was invited). From the visitor's side that is a success.
  if (res.ok || res.status === 409) return Response.json({ ok: true });
  console.error("invite insert failed", res.status, await res.text());
  return Response.json({ ok: false, error: "Something broke on our side. Try again soon." }, { status: 502 });
}
