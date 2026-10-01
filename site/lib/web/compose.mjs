// What the composer sends (YUI-244): the wire formats of everything beyond plain words, pure, no DOM.
// Each block is the twin of one app file in Yui/Sources/Chat, byte for byte on the lines the agent reads:
// Reactions.swift, Reply.swift, Mentions.swift, Suggestions.swift (slash commands), Attachments.swift.
// Spec: spec/REACTIONS.md, spec/RELAY.md. The thread (thread.mjs) reads the same shapes back.

// ---------- reactions (Reactions.swift, spec/REACTIONS.md) ----------
export const REACTIONS = [
  { emoji: "👍", meaning: "build it" },
  { emoji: "👎", meaning: "no" },
  { emoji: "🤔", meaning: "not sure" },
  { emoji: "❤️", meaning: "love it" },
  { emoji: "⏳", meaning: "later" },
  { emoji: "🔥", meaning: "priority" },
];
export const reactionOf = (emoji) => REACTIONS.find((r) => r.emoji === emoji) || null;

// Up to 200 characters of the message, each line as `> `.
export function quoteMessage(text, limit = 200) {
  const flat = String(text || "").trim();
  if (!flat) return "";
  const chars = [...flat];
  let cut = chars.slice(0, limit).join("");
  if (chars.length > limit) cut = `${cut.trim()}…`;
  return cut.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => `> ${l}`).join("\n");
}

// `[yui] react msg=<row id> emoji=👍 meaning="build it"`, then the start of the message quoted.
export function reactionBody({ msg, reaction, changed = false, quoting = "" }) {
  let line = `[yui] react msg=${msg} emoji=${reaction ? reaction.emoji : "none"}`;
  if (reaction) line += ` meaning=${/\s/.test(reaction.meaning) ? `"${reaction.meaning}"` : reaction.meaning}`;
  if (changed) line += " changed=true";
  const q = quoteMessage(quoting);
  return q ? `${line}\n${q}` : line;
}

export const reactionMeta = ({ msg, reaction }) => ({ react: { msg, emoji: reaction ? reaction.emoji : null } });

// The reaction a thread row sets, when it is a react event: { msg, emoji|null }.
export function reactionFrom(meta) {
  const r = meta && typeof meta === "object" ? meta.react : null;
  if (!r || typeof r.msg !== "string") return null;
  return { msg: r.msg.toLowerCase(), emoji: typeof r.emoji === "string" ? r.emoji : null };
}

// A bubble id (`<row id>#<n>`) is a piece of one thread row; a reaction belongs to the row.
export const rowOf = (id) => String(id).split("#")[0].toLowerCase();

// ---------- reply (Reply.swift) ----------
export const REPLY_LIMIT = 120;
export const REPLY_ROWS = 3;
export const REPLY_ROW_CHARS = 60;

export function firstLine(text) {
  const line = String(text || "").split("\n").map((l) => l.trim()).find(Boolean) || "";
  const chars = [...line];
  return chars.length > REPLY_LIMIT ? `${chars.slice(0, REPLY_LIMIT).join("").trim()}…` : line;
}

const TITLE_KEYS = ["title", "label", "q", "prompt", "text", "body"];
const str = (v) => (typeof v === "string" ? v.trim() : "");

// A card's lines: the first thing each part says (title, question, words), then list items.
export function cardWords(state) {
  const out = [];
  for (const c of (state?.screens?.["1"] || [])) {
    for (const k of TITLE_KEYS) { const t = str(c.props?.[k]); if (t && !out.includes(t)) out.push(t); }
    if (c.preset === "list" && Array.isArray(c.props?.items)) for (const raw of c.props.items) { const t = str(raw); if (t && !out.includes(t)) out.push(t); }
  }
  return out;
}

export function cardTitle(state) {
  for (const c of (state?.screens?.["1"] || [])) for (const k of TITLE_KEYS) { const t = str(c.props?.[k]); if (t) return t; }
  const first = (state?.screens?.["1"] || [])[0];
  return first ? first.preset.charAt(0).toUpperCase() + first.preset.slice(1) : "";
}

// The quote for a bubble or a card: { msg, fromUser, quote, rows }. null when there is nothing to quote.
export function replyQuote(m) {
  const msg = rowOf(m.id);
  const fromUser = m.role === "user";
  if (m.yl != null || m.state) {
    const quote = firstLine(cardTitle(m.state));
    if (!quote) return null;
    const rows = cardWords(m.state).filter((l) => firstLine(l) !== quote).slice(0, REPLY_ROWS)
      .map((l) => ([...l].length > REPLY_ROW_CHARS ? `${[...l].slice(0, REPLY_ROW_CHARS).join("").trim()}…` : l));
    return { msg, fromUser, quote, rows };
  }
  const quote = firstLine(m.text) || (m.photos?.length ? placeholder(m.photos.length) : "");
  return quote ? { msg, fromUser, quote, rows: [] } : null;
}

const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');

// `[yui] reply to=<row id> from=agent quote="..."` (+ rows="a | b").
export function replyLine(q) {
  let out = `[yui] reply to=${q.msg} from=${q.fromUser ? "user" : "agent"} quote="${esc(q.quote)}"`;
  if (q.rows?.length) out += ` rows="${esc(q.rows.join(" | "))}"`;
  return out;
}
export const replyBody = (words, q) => (q ? `${replyLine(q)}\n${words}` : words);
export function replyMeta(base, q) {
  if (!q) return base || null;
  const r = { msg: q.msg, from: q.fromUser ? "user" : "agent", quote: q.quote };
  if (q.rows?.length) r.rows = q.rows;
  return { ...(base || {}), reply_to: r };
}

// ---------- @mentions (Mentions.swift) ----------
// The name being typed after an @ at the end of the draft, lowercased; null when the draft doesn't end in one.
export function mentionQuery(draft) {
  const at = String(draft || "").lastIndexOf("@");
  if (at < 0) return null;
  if (at > 0 && !/\s/.test(draft[at - 1])) return null; // me@example.com
  const word = draft.slice(at + 1);
  return /[\s@]/.test(word) ? null : word.toLowerCase();
}

// The person's other agents that fit: names that start with it first, then ones that contain it. Never the open one.
export function mentionMatches(draft, agents, current) {
  const q = mentionQuery(draft);
  if (q === null) return [];
  const others = (agents || []).filter((a) => a.id !== current);
  if (!q) return others;
  const handle = (a) => String(a.handle || "").toLowerCase();
  const starts = (a) => a.name.toLowerCase().startsWith(q) || handle(a).startsWith(q);
  const inside = (a) => a.name.toLowerCase().includes(q) || handle(a).includes(q);
  const all = [...others.filter(starts), ...others.filter((a) => !starts(a) && inside(a))];
  if (all.length === 1 && all[0].name.toLowerCase() === q) return []; // already typed in full
  return all;
}

export function mentionFill(draft, a) {
  const at = draft.lastIndexOf("@");
  return at < 0 ? `${draft}@${a.name} ` : `${draft.slice(0, at)}@${a.name} `;
}

// The agent a draft mentions: the first `@Name` or `@handle` in it that is one of the other agents. One per message.
export function mentionTarget(text, agents, current) {
  const lower = String(text || "").toLowerCase();
  let best = null;
  for (const a of agents || []) {
    if (a.id === current) continue;
    for (const word of new Set([a.name.toLowerCase(), String(a.handle || "").toLowerCase()])) {
      if (!word) continue;
      let from = 0;
      for (;;) {
        const i = lower.indexOf(`@${word}`, from);
        if (i < 0) break;
        const end = i + 1 + word.length;
        const before = i === 0 || /\s/.test(lower[i - 1]);
        const after = end >= lower.length || !/[\p{L}\p{N}]/u.test(lower[end]);
        if (before && after) { if (!best || i < best.at) best = { at: i, agent: a }; break; }
        from = end;
      }
    }
  }
  return best ? best.agent : null;
}

export const mentionBody = (words, a) => `[yui] mention to=${a.handle}\n${words}`;
export const mentionMeta = (base, a) => ({ ...(base || {}), mention: { to: a.id, handle: a.handle, name: a.name } });

export function mentionPresence(a) {
  switch (a.presence) {
    case "online": return a.push_muted ? "Online, muted" : "Online";
    case "asleep": return "Asleep";
    case "offline": return "Offline";
    case "pending": return "Not connected yet";
    case "not_listening": return "Not listening yet";
    case "paused": return "Paused by its owner";
    default: return a.status === "connected" ? "Online" : a.status === "pending" ? "Not connected yet" : "Offline";
  }
}

// ---------- slash commands (Suggestions.swift SlashCommands) ----------
export function slashQuery(draft) {
  if (!String(draft || "").startsWith("/")) return null;
  const word = draft.slice(1);
  return /\s/.test(word) || word.includes("/") ? null : word.toLowerCase();
}
export function slashMatches(draft, commands) {
  const q = slashQuery(draft);
  if (!commands?.length || q === null) return [];
  if (!q) return commands;
  const starts = commands.filter((c) => c.name.startsWith(q));
  const inside = commands.filter((c) => !c.name.startsWith(q) && c.name.includes(q));
  const all = [...starts, ...inside];
  if (all.length === 1 && all[0].name === q) return [];
  return all;
}
export const slashFill = (c) => `/${c.name}${c.args ? " " : ""}`;

// One list for the popover: an @ in the last word suggests agents, a leading / suggests commands.
export function suggestions(draft, { agents, current, commands, mentions = true }) {
  const lastWord = String(draft || "").split(/\s/).pop() || "";
  if (mentions && lastWord.startsWith("@")) {
    const found = mentionMatches(draft, agents, current);
    if (found.length) return found.map((a) => ({ id: a.handle || a.id, kind: "mention", title: a.name, hint: `@${a.handle}`, detail: mentionPresence(a), fill: mentionFill(draft, a), agent: a }));
  }
  if (draft.startsWith("/")) return slashMatches(draft, commands).map((c) => ({ id: c.name, kind: "slash", title: `/${c.name}`, hint: c.args || null, detail: c.description || "", fill: slashFill(c) }));
  return [];
}

// ---------- photos (Attachments.swift) ----------
export const MAX_PHOTOS = 12;      // most photos one message carries
export const MAX_SIDE = 2048;      // the longest side of a photo we send (YuiMedia.maxSide)
export const MAX_BYTES = 50 * 1024 * 1024; // the bucket's cap
export const placeholder = (n) => (n === 1 ? "Photo" : `${n} photos`);
export function photoBody(text, n) {
  const t = String(text || "").trim();
  return t || n === 0 ? t : placeholder(n);
}
export const photoMeta = (paths) => (paths.length ? { photos: paths } : null);
// The app's check is two uuids; the demo's ids are words (demo-penny), so a segment is letters, digits and dashes.
export const isUserPath = (p) => /^[0-9A-Za-z-]{1,64}\/[0-9A-Za-z-]{1,64}\/user\/[A-Za-z0-9._-]{1,80}$/.test(String(p));
export const photoPaths = (meta) => (Array.isArray(meta?.photos) ? meta.photos.filter((p) => typeof p === "string" && isUserPath(p)) : []);
// The words on the bubble: the stand-in body draws as the photos alone.
export const photoCaption = (body, n) => (n > 0 && body === placeholder(n) ? "" : body);
// `<user>/<agent>/user/<uuid>.<ext>` in the one private bucket (spec/RELAY.md, Media).
export const mediaPath = (user, agent, id, ext = "jpg") => `${String(user).toLowerCase()}/${String(agent).toLowerCase()}/user/${String(id).toLowerCase()}.${ext}`;

// What the bucket takes (the migration's allowed list): a picture we re-encode, or a video as sent.
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];
export const isPhotoFile = (f) => IMAGE_TYPES.includes(String(f?.type || "").toLowerCase()) || /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(f?.name || "");

// The size a photo is drawn at so its longest side is MAX_SIDE at most; null when it is small enough.
export function fitSize(w, h, max = MAX_SIDE) {
  const side = Math.max(w, h);
  if (side <= max) return null;
  const k = max / side;
  return { w: Math.round(w * k), h: Math.round(h * k) };
}

// ---------- the draft a thread keeps (Composer.swift Drafts) ----------
// A key pasted into the composer is never kept (YUI-34).
const SECRET = /\b(?:sk-[A-Za-z0-9_-]{16,}|gh[pousr]_[A-Za-z0-9]{20,}|xox[abprs]-[A-Za-z0-9-]{10,}|AKIA[0-9A-Z]{12,}|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\.)/;
export const keepable = (words) => !!words && !SECRET.test(words);
export const draftKey = (agentId) => `yui.draft.${agentId}`;
