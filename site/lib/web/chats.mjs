// Several chats with one agent on the web (YUI-245): the app's Chat/Chats.swift as pure words and one thin
// client over PostgREST (`yui_chat_list`, `yui_chats`, `yui_messages`). The drawer draws it.
export const PAGE_SIZE = 30;
export const SEARCH_AFTER = 10;
export const TITLE_MAX = 60;

// What Yui's server refuses a chat with (PostgREST `message`), in the app's plain words.
const REFUSALS = {
  update_needed: ["updateNeeded", "New chats need the latest Yui. Update the app to start one."],
  limit_reached: ["limitReached", "This agent's chat list is full. Delete one to start another."],
  last_chat: ["lastChat", "That is the only chat with this agent, so it can only be cleared."],
  chat_not_found: ["notFound", "That chat is gone."],
};
export function chatError(message) {
  const hit = REFUSALS[message];
  return hit ? { kind: hit[0], spoken: hit[1] } : { kind: "other", spoken: "Couldn't do that right now. Try again in a moment." };
}
// A RelayError body is PostgREST JSON: {"message": "limit_reached", ...}.
export function chatErrorOf(e) {
  let msg = "";
  try { msg = JSON.parse(e?.detail || "{}").message || ""; } catch { /* not JSON */ }
  return chatError(msg);
}

// The row's title: what it is called, "Earlier" for the first chat with no title once there are other chats
// (everything said before chats were many, YUI-254), "Hi <agent>" while it is the only one, "New chat" for any other.
export function title(chat, agent, among = 1) {
  const t = (chat.title || "").trim();
  if (t) return t;
  if (!chat.is_first) return "New chat";
  return among > 1 ? "Earlier" : `Hi ${agent}`;
}

// A body as one quiet line: no screens, no line breaks.
export function words(body) {
  const out = [];
  let fence = false;
  for (const line of String(body || "").split("\n")) {
    const t = line.trim();
    if (t.startsWith("```")) { fence = !fence; continue; }
    if (!fence && t) out.push(t);
  }
  return out.join(" ");
}

// "You: how much protein on rest days". A screen or a tapped answer becomes plain words.
export function lastLine(chat) {
  if (!chat.last_body) return "";
  let said = words(chat.last_body);
  const mine = chat.last_sender === "user";
  if (!said) return mine ? "" : "Sent a screen";
  if (said.startsWith("[yui]")) said = "Tapped an answer";
  if (said.length > 120) said = said.slice(0, 120);
  return mine ? `You: ${said}` : said;
}

// now, 20m, 2h, 3d, 2w, 4mo
export function when(iso, now = Date.now()) {
  const t = Date.parse(iso || "");
  if (!t) return "";
  const s = Math.max(0, (now - t) / 1000);
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 7 * 86400) return `${Math.floor(s / 86400)}d`;
  if (s < 60 * 86400) return `${Math.floor(s / (7 * 86400))}w`;
  return `${Math.floor(s / (30 * 86400))}mo`;
}
export const whenOf = (chat, now) => when(chat.last_message_at || chat.last_at, now);

// A title someone typed: trimmed, at most 60 characters, null when empty.
export function validTitle(raw) {
  const t = String(raw ?? "").trim();
  return t ? t.slice(0, TITLE_MAX).trim() : null;
}

// Newest activity first.
export function ordered(chats) {
  return [...chats].sort((a, b) => {
    const x = Date.parse(a.last_at), y = Date.parse(b.last_at);
    if (x !== y && !Number.isNaN(x) && !Number.isNaN(y)) return y - x;
    return a.last_at !== b.last_at ? (a.last_at < b.last_at ? 1 : -1) : (a.id < b.id ? -1 : 1);
  });
}

// The next page, older chats, added under the list without doubles.
export function append(current, older) {
  const have = new Set(current.map((c) => c.id));
  return ordered([...current, ...older.filter((c) => !have.has(c.id))]);
}

// The list after a fresh first page: a short page is the whole list; a full one keeps the older chats
// already loaded; anything newer than its last row that it lacks was deleted elsewhere (Chats.merge).
export function merge(current, page, pageSize = PAGE_SIZE) {
  const oldest = page[page.length - 1];
  if (page.length < pageSize || !oldest) return ordered(page);
  const cut = Date.parse(oldest.last_at);
  const ids = new Set(page.map((c) => c.id));
  return ordered([...page, ...current.filter((c) => !ids.has(c.id) && Date.parse(c.last_at) < cut)]);
}

// The list narrowed by the search field: title or last line contains the words.
export function filter(chats, agent, query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return chats;
  return chats.filter((c) => title(c, agent, chats.length).toLowerCase().includes(q) || lastLine(c).toLowerCase().includes(q));
}

// A delete among this many saved chats: the only chat is cleared, not deleted.
export const deletePlan = (saved) => (saved <= 1 ? "clear" : "delete");

// The chat to open after `id` goes: the open one stays, unless it is the one deleted; then the next newest.
export function openAfterDeleting(id, open, list) {
  if (open !== id) return open;
  return ordered(list).find((c) => c.id !== id)?.id ?? null;
}

export function deleteWords(plan, chatTitle, agent) {
  const note = `Its messages go. ${agent} still remembers what it learned.`;
  return plan === "clear" ? { question: "Clear this chat?", note, confirm: "Clear" } : { question: `Delete "${chatTitle}"?`, note, confirm: "Delete" };
}

// A chat made in this tab: a new id, nothing on the server until something is said.
export const draft = (now = Date.now(), uuid = () => crypto.randomUUID()) => ({ id: uuid(), last_at: new Date(now).toISOString(), saved: false });

// ---------------------------------------------------------------- the client

// request(path, init) -> Response (relay.request), so a refusal's body is readable.
export function createChatsClient(request) {
  const json = { "Content-Type": "application/json", Prefer: "return=minimal" };
  const q = (pairs) => new URLSearchParams(pairs).toString().replace(/\+/g, "%2B");
  return {
    async list(agentId, { limit = PAGE_SIZE, offset = 0 } = {}) {
      const res = await request(`rest/v1/yui_chat_list?${q([["select", "*"], ["agent_id", `eq.${agentId}`], ["order", "last_at.desc,id.asc"], ["limit", String(limit)], ["offset", String(offset)]])}`);
      return (await res.json()).map((c) => ({ ...c, id: String(c.id).toLowerCase(), saved: true }));
    },
    // Makes the chat. One that is already there (409) counts as made.
    async insert({ id, userId, agentId }) {
      try { await request("rest/v1/yui_chats", { method: "POST", headers: json, body: JSON.stringify({ id, user_id: userId, agent_id: agentId }) }); }
      catch (e) { if (e?.status !== 409) throw e; }
    },
    rename: (id, titleText) => request(`rest/v1/yui_chats?${q([["id", `eq.${id}`]])}`, { method: "PATCH", headers: json, body: JSON.stringify({ title: titleText }) }),
    // The person has read to the end, here or on any other device.
    seen: (id, at) => request(`rest/v1/yui_chats?${q([["id", `eq.${id}`]])}`, { method: "PATCH", headers: json, body: JSON.stringify({ seen_at: at }) }),
    remove: (id) => request(`rest/v1/yui_chats?${q([["id", `eq.${id}`]])}`, { method: "DELETE" }),
    // Clear: the chat's messages go, the chat stays.
    clear: (id) => request(`rest/v1/yui_messages?${q([["chat_id", `eq.${id}`]])}`, { method: "DELETE" }),
  };
}
