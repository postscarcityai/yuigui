// The two things a link in Yui's email does: confirm an address, or stop mail.
// The token is the whole proof; yui-mail checks it and rate-limits by address.
import { yuiMailPublic } from "../../../lib/mail.mjs";

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return Response.json({ ok: false }, { status: 400 }); }
  const token = typeof body.token === "string" ? body.token.slice(0, 80) : "";
  if (!token || !["confirm", "unsubscribe"].includes(body.action)) return Response.json({ ok: false }, { status: 400 });
  const { status, data } = await yuiMailPublic({ action: body.action, token, ...(body.action === "unsubscribe" ? { all: body.all === true } : {}) });
  return Response.json({ ok: !!data.ok }, { status: status === 200 ? 200 : status >= 500 ? 502 : 400 });
}
