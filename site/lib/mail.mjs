// Yui's mailbox (yui-mail in the app repo). Every email yuigui.com sends goes
// through that one function; the site never holds a SendGrid key. Server only:
// it uses the service role key the invite route already has.
export async function yuiMail(body) {
  const url = process.env.YUI_SUPABASE_URL, key = process.env.YUI_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { status: 503, data: { error: "mail_offline" } };
  try {
    const res = await fetch(`${url}/functions/v1/yui-mail`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ sent_by: "site", ...body }),
      signal: AbortSignal.timeout(15000),
    });
    return { status: res.status, data: await res.json().catch(() => ({})) };
  } catch (e) {
    return { status: 502, data: { error: String(e?.message || e) } };
  }
}

// The public half: a confirmation link or an unsubscribe, by token. No key sent.
export async function yuiMailPublic(body) {
  const url = process.env.YUI_SUPABASE_URL;
  if (!url) return { status: 503, data: { error: "mail_offline" } };
  try {
    const res = await fetch(`${url}/functions/v1/yui-mail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
    return { status: res.status, data: await res.json().catch(() => ({})) };
  } catch (e) {
    return { status: 502, data: { error: String(e?.message || e) } };
  }
}
