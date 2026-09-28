// One invite request (SITE-26), shared by the invite form (/api/invite) and the chat (SITE-64).
// Checks the fields, then writes a yui_invites row with the service role key; the table has RLS on
// and no grants, so anon can never read or write it. Returns { ok } or { ok: false, error, status }.
// Then Yui emails a link to confirm the address (yui-mail in the app repo). A ticked "news" box
// (promo) only counts once they confirm, and lives with the mail contact, not the invite.
import { yuiMail } from "./mail.mjs";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[0-9 ().-]{7,25}$/;
export const clip = (v, n) => (typeof v === "string" ? v.trim().slice(0, n) : null) || null;

// The fields as they will be stored, or { error } in words a person can act on.
export function readContact(body, { needName = true } = {}) {
  // Older pages sent one "name" field; it becomes the first name.
  const first_name = clip(body.first_name ?? body.name, 80);
  const last_name = clip(body.last_name, 80);
  const email = clip(body.email, 254)?.toLowerCase();
  const phone = clip(body.phone, 32);
  if (!email || !EMAIL.test(email)) return { error: "That email does not look right." };
  if (needName && (!first_name || !last_name)) return { error: "We need your first and last name." };
  if (phone && !PHONE.test(phone)) return { error: "That phone number does not look right." };
  return { first_name, last_name, email, phone };
}

export function inviteEnv() {
  const url = process.env.YUI_SUPABASE_URL, key = process.env.YUI_SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" } } : null;
}

export async function insertInvite(contact, { source, utm, req, promo = false }) {
  const env = inviteEnv();
  if (!env) return { ok: false, error: "Invites are offline. Try again soon.", status: 503 };
  const u = clip(utm, 500);
  const row = {
    ...contact,
    source: clip(source, 60),
    utm: u && /utm_/.test(u) ? u : null,
    referrer: clip(req.headers.get("referer"), 500),
    user_agent: clip(req.headers.get("user-agent"), 500),
  };
  const res = await fetch(`${env.url}/rest/v1/yui_invites`, { method: "POST", headers: { ...env.headers, Prefer: "return=minimal" }, body: JSON.stringify(row) });
  // 409 = that email already asked (or was invited). From the visitor's side that is a success,
  // and a fresh confirmation link goes out either way (yui-mail sends one a minute at most).
  // A failed email never fails the request: the row is what matters.
  if (res.ok || res.status === 409) {
    const mail = await yuiMail({ action: "request", template: "invite_request", email: contact.email,
                                 first_name: contact.first_name, promo: promo === true, source: row.source || "site" });
    if (mail.status !== 200) console.error("invite confirmation email", mail.status, mail.data?.error);
    return { ok: true };
  }
  console.error("invite insert failed", res.status, await res.text());
  return { ok: false, error: "Something broke on our side. Try again soon.", status: 502 };
}
