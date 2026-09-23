// Waitlist signups. Writes to yui_waitlist in the PostScarcity AI Supabase project (PROOF)
// with the service role key, so the table needs no anon policies.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clip = (v, n) => (typeof v === "string" ? v.trim().slice(0, n) : null) || null;

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return Response.json({ ok: false, error: "Bad request." }, { status: 400 }); }

  // Honeypot: bots fill every field. Pretend it worked.
  if (body.website) return Response.json({ ok: true });

  const email = clip(body.email, 254)?.toLowerCase();
  if (!email || !EMAIL.test(email)) return Response.json({ ok: false, error: "That email does not look right." }, { status: 400 });

  const url = process.env.YUI_SUPABASE_URL, key = process.env.YUI_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return Response.json({ ok: false, error: "Waitlist is offline. Try again soon." }, { status: 503 });

  const row = {
    email,
    name: clip(body.name, 120),
    note: clip(body.note, 1000),
    source: clip(body.source, 60),
    referrer: clip(req.headers.get("referer"), 500),
    user_agent: clip(req.headers.get("user-agent"), 500),
  };
  const res = await fetch(`${url}/rest/v1/yui_waitlist`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(row),
  });
  // 409 = already on the list, which is a success from the visitor's side.
  if (res.ok || res.status === 409) return Response.json({ ok: true });
  console.error("waitlist insert failed", res.status, await res.text());
  return Response.json({ ok: false, error: "Something broke on our side. Try again soon." }, { status: 502 });
}
