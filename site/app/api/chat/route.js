// The site chat (SITE-64): Yui in the bubble at the bottom right. No account. The first few turns
// are free, then Cloudflare Turnstile checks for a person once, then the chat runs to MAX_TURNS.
// Every turn and every note is kept (lib/chat/store.mjs) so the team can read what visitors want.
//   POST { action: "say", text, path, title, history }  -> { reply, actions } | { verify: siteKey }
//   POST { action: "verify", token }                     -> { ok }
//   POST { action: "contact", first_name, last_name, email, phone } -> { ok }  (pages cached before the Yui form)
//   A tap on the contact form (form@contact) rides on "say" as { event }: saved here, never sent to the model.
//   A sent feedback flow (plan@feedback, SITE-67) rides the same way: its likes and dislikes are saved
//   as notes here, and its open line falls back to a feature note when the model does not note it.
import { brief } from "../../../lib/chat/brief.mjs";
import { chatOn, turnstileOn } from "../../../lib/chat/config.mjs";
import { MODEL, turn } from "../../../lib/chat/model.mjs";
import { COOKIE, FREE_TURNS, MAX_TURNS, hashIp, newSession, readSession, sessionCookie } from "../../../lib/chat/session.mjs";
import { markVerified, saveContact, saveNote, saveTurn } from "../../../lib/chat/store.mjs";
import { LINE_KIND, feedbackNotes } from "../../../lib/chat/feedback.mjs";
import { crewReply } from "../../../lib/yl/starter-flows.mjs";
import { clip, insertInvite, readContact } from "../../../lib/invite.mjs";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Per visitor, on this server instance: 20 turns in 10 minutes, 80 in a day. The hard ceiling
// on spend is the credit limit on the chat's own OpenRouter key.
const SHORT = [10 * 60 * 1000, 20], DAY = [24 * 60 * 60 * 1000, 80];
// With no Turnstile keys set there is no check for a person, so a chat ends sooner.
const NO_CHECK_TURNS = 100;
const hits = new Map();
function tooMany(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < DAY[0]);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.filter((t) => now - t < SHORT[0]).length > SHORT[1] || recent.length > DAY[1];
}

const say = (body, s, status = 200) => {
  const res = Response.json(body, { status });
  if (s) res.headers.append("Set-Cookie", sessionCookie(s));
  return res;
};
// The contact form Yui draws when she asks (ask_contact): a Yui form in the thread, not a web form.
// Its submit comes back as a form@contact tap, saved here, so the model never sees the details.
const CONTACT_FORM = `form@contact "Stay in touch" first_name:text! last_name:text! email:email! phone:phone submit="Send"`;

const cookieOf = (req) => (req.headers.get("cookie") || "").split(/;\s*/).find((c) => c.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
const ipOf = (req) => (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";

// The visible conversation as the page holds it, cleaned. The server keeps its own copy in the store.
function historyOf(h) {
  if (!Array.isArray(h)) return [];
  return h.slice(-16)
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
}

export async function GET() {
  return Response.json({ on: chatOn() });
}

export async function POST(req) {
  if (!chatOn()) return Response.json({ error: "Yui is resting. Try again soon." }, { status: 503 });
  let body;
  try { body = await req.json(); } catch { return Response.json({ error: "Bad request." }, { status: 400 }); }
  const s = readSession(cookieOf(req)) || newSession();
  const ip = ipOf(req);

  if (body.action === "verify") {
    if (!turnstileOn()) { s.verified = true; return say({ ok: true }, s); }
    const form = new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY, response: String(body.token || "").slice(0, 2048), remoteip: ip });
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form }).then((x) => x.json()).catch(() => ({}));
    if (!r.success) return say({ ok: false, error: "That check did not go through. Try once more." }, null, 400);
    s.verified = true;
    await markVerified(s);
    return say({ ok: true }, s);
  }

  // New chat: a fresh id and turn count. The per-visitor limits above still count every turn.
  if (body.action === "new") {
    const n = newSession();
    Object.assign(n, { verified: s.verified, contact: s.contact, asked: s.asked });
    return say({ ok: true }, n);
  }

  if (body.action === "contact") {
    if (body.website) return say({ ok: true }, s); // honeypot
    if (s.contact) return say({ ok: true }, s);
    const c = readContact(body);
    if (c.error) return say({ ok: false, error: c.error }, null, 400);
    await saveContact(s, c);
    const r = await insertInvite(c, { source: "chat", utm: body.utm, req });
    if (!r.ok && r.status !== 503) return say({ ok: false, error: r.error }, null, r.status);
    s.contact = true;
    return say({ ok: true }, s);
  }

  // A turn.
  let text = clip(body.text, 1000);
  const ev = body.event && typeof body.event === "object" ? body.event : null;
  if (ev?.id === "contact" && ev.preset === "form" && ev.form && typeof ev.form === "object") {
    const c = readContact(ev.form);
    if (c.error) return say({ error: c.error }, null, 400);
    if (!s.contact) {
      await saveContact(s, c).catch(() => {});
      const r = await insertInvite(c, { source: "chat", utm: body.utm, req });
      if (!r.ok && r.status !== 503) return say({ error: r.error }, null, r.status);
      s.contact = true;
    }
    text = "[yui] contact form sent";
  }
  if (!text) return say({ error: "Say something first." }, null, 400);
  if (tooMany(ip)) return say({ error: "That is a lot of messages. Take a breather and try again in a few minutes." }, null, 429);
  if (s.turns >= FREE_TURNS && !s.verified && turnstileOn()) return say({ verify: process.env.TURNSTILE_SITE_KEY }, s);
  if (s.turns >= (turnstileOn() ? MAX_TURNS : NO_CHECK_TURNS)) {
    return say({ reply: "This chat has run long. Tap New chat to start a fresh one, or pick Yui up on your iPhone from [Get Yui](/start).", actions: [], done: true }, s);
  }

  const path = clip(body.path, 300) || "/";
  // The crew's flows are answered with no model turn: the trainer's session and timer (SITE-70),
  // the nutritionist's saved meal and today's totals (SITE-71), the musician's loop and chords (SITE-72),
  // the planner's week and checklist (SITE-73), the study buddy's calc and review cards (SITE-74).
  const session = crewReply(ev);
  let out;
  if (session) out = { reply: `${session.text}\n\n\`\`\`yui\n${session.lines.join("\n")}\n\`\`\``, actions: [], notes: [], tools: [] };
  else try {
    out = await turn({ system: brief({ path, title: clip(body.title, 120) }), history: historyOf(body.history), text, canAsk: s.turns >= 2 && !s.asked && !s.contact });
  } catch (e) {
    console.error("chat turn failed", MODEL(), e.message);
    return say({ error: "Yui can't answer right now. Try again in a minute." }, null, 502);
  }
  let reply = out.reply || "Sorry, I lost my words there. Could you say that again?";
  if (out.actions.some((a) => a.type === "contact")) reply += `\n\n\`\`\`yui\n${CONTACT_FORM}\n\`\`\``;
  const first = s.turns === 0;
  s.turns += 1;
  if (out.actions.some((a) => a.type === "contact")) s.asked = true;

  const fb = feedbackNotes(ev);
  const notes = fb ? [...fb.notes, ...out.notes] : out.notes;
  if (fb?.line && !out.notes.length) notes.push({ kind: LINE_KIND, text: fb.line, quote: fb.line });

  const meta = { ipHash: hashIp(ip), userAgent: req.headers.get("user-agent"), referrer: req.headers.get("referer"), utm: body.utm };
  try {
    await saveTurn(s, { first, path, userText: text, reply, tools: out.tools, meta });
    await Promise.all(notes.map((n) => saveNote(s, n, path)));
  } catch (e) { console.error("chat store failed", e.message); }

  return say({ reply, actions: out.actions.filter((a) => a.type !== "contact") }, s);
}
