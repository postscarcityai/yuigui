// Where the chat keeps what it hears (SITE-64): three server-only tables in Yui's Supabase project,
// written with the service key through PostgREST, like the invite route. The schema is
// site/lib/chat/schema.sql. Without the Supabase env (local dev) rows go to the console instead.
const url = () => process.env.YUI_SUPABASE_URL;
const key = () => process.env.YUI_SUPABASE_SERVICE_ROLE_KEY;
export const stored = () => Boolean(url() && key());

async function rest(pathAndQuery, { method = "POST", body, prefer = "return=minimal" } = {}) {
  if (!stored()) { console.log(`[chat store] ${method} ${pathAndQuery}`, JSON.stringify(body).slice(0, 400)); return true; }
  const res = await fetch(`${url()}/rest/v1/${pathAndQuery}`, {
    method,
    headers: { apikey: key(), Authorization: `Bearer ${key()}`, "Content-Type": "application/json", Prefer: prefer },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) console.error(`chat store: ${method} ${pathAndQuery.split("?")[0]} failed`, res.status, (await res.text()).slice(0, 300));
  return res.ok;
}

const clip = (v, n) => (typeof v === "string" ? v.trim().slice(0, n) : null) || null;

// One turn: the chat row (created on its first turn, counts kept current after) and both messages.
export async function saveTurn(s, { first, path, userText, reply, tools, meta }) {
  const chat = { id: s.id, turns: s.turns, last_path: clip(path, 300), updated_at: new Date().toISOString() };
  if (first) Object.assign(chat, { first_path: clip(path, 300), ip_hash: meta.ipHash, user_agent: clip(meta.userAgent, 500), referrer: clip(meta.referrer, 500), utm: clip(meta.utm, 500) });
  await rest("yui_site_chats?on_conflict=id", { body: chat, prefer: "resolution=merge-duplicates,return=minimal" });
  await rest("yui_site_chat_messages", {
    body: [
      { chat_id: s.id, role: "user", content: clip(userText, 4000), path: clip(path, 300) },
      { chat_id: s.id, role: "assistant", content: clip(reply, 8000), path: clip(path, 300), tools: tools?.length ? tools : null },
    ],
  });
}

export const NOTE_KINDS = ["need", "feature", "bug", "question", "confusion", "praise", "other"];
export async function saveNote(s, note, path) {
  return rest("yui_site_chat_notes", {
    body: { chat_id: s.id, kind: NOTE_KINDS.includes(note.kind) ? note.kind : "other", text: clip(note.text, 1000), quote: clip(note.quote, 500), path: clip(path, 300) },
  });
}

export async function markVerified(s) {
  return rest(`yui_site_chats?id=eq.${s.id}`, { method: "PATCH", body: { verified_at: new Date().toISOString() } });
}

export async function saveContact(s, c) {
  return rest(`yui_site_chats?id=eq.${s.id}`, { method: "PATCH", body: { first_name: c.first_name, last_name: c.last_name, email: c.email, phone: c.phone, contact_at: new Date().toISOString() } });
}
