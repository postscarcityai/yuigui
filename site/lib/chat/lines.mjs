// The site chat answers with screens (SITE-65). A reply is text plus ```yui blocks, like the app's
// channel (spec/CHANNEL.md). This file splits a reply into parts, keeps only the Yui Lines a web
// visitor should get, and turns a tap into the message it sends back. Used by the page and the tests.

// Presets the chat may draw. No media, camera, mic or custom blocks (nothing loads from a URL the
// model picked), no drawer, tables, theme or pages of their own (the chat is one screen).
export const ALLOWED = new Set([
  "say", "ask", "choose", "pick", "slide", "form", "list", "table", "card",
  "stat", "chart", "math", "step", "calc",
  "deck", "page", "plan", "end",
  "timer", "timeline", "done", "now", "next",
  "map", "area", "pin", "route", "shapes", "shape", "sketch", "row", "after",
  "game", "loop", "drums", "keys", "chords", "metronome",
]);

// Outside links only to places Yui lives.
export const SAFE_URL = /^https:\/\/(www\.)?(yuigui\.com|postscarcity\.ai|testflight\.apple\.com|github\.com\/postscarcityai)(\/|$)/;

const FENCE = /```(?:yui|yl)[^\n]*\n([\s\S]*?)(?:```|$)/g;

// "Hi.\n```yui\nask ...\n```\nMore." -> [{ text: "Hi." }, { yl: "ask ..." }, { text: "More." }]
export function splitReply(reply) {
  const out = [];
  const s = String(reply || "");
  let at = 0, m;
  FENCE.lastIndex = 0;
  while ((m = FENCE.exec(s))) {
    const before = s.slice(at, m.index).trim();
    if (before) out.push({ text: before });
    const yl = cleanLines(m[1]);
    if (yl) out.push({ yl });
    at = FENCE.lastIndex;
  }
  const rest = s.slice(at).replace(/```\w*\s*$/, "").trim();
  if (rest) out.push({ text: rest });
  return out;
}

// One line's head: `choose@x "Q?" A|B` -> choose, `~loop bpm=110` -> loop.
function head(line) {
  const w = line.trim().split(/\s+/)[0] || "";
  return w.replace(/^~/, "").replace(/@.*$/, "").toLowerCase();
}

// Keeps the lines this chat can draw. Drops screen switches (`>2`), media and anything
// with a link that is not Yui's own. A site path becomes a full yuigui.com link.
export function cleanLines(yl) {
  const keep = [];
  for (const raw of String(yl || "").split("\n")) {
    const line = raw.replace(/\s+$/, "");
    const t = line.trim();
    if (!t || t.startsWith("#") || t.startsWith(">")) continue;
    if (!ALLOWED.has(head(t))) continue;
    let bad = false;
    const fixed = line.replace(/\burl=("([^"]*)"|(\S+))/g, (all, _q, quoted, bare) => {
      const u = quoted ?? bare;
      if (/^\/(?!\/)/.test(u)) return `url=https://www.yuigui.com${u}`;
      if (SAFE_URL.test(u)) return all;
      bad = true;
      return "";
    });
    keep.push(bad ? fixed.replace(/\s+/g, " ").trim() : fixed);
  }
  return keep.join("\n").trim();
}

const q = (v) => {
  const s = String(v);
  return s === "" || /^[\w.:/+-]+$/.test(s) ? s : `"${s.replace(/"/g, "'")}"`;
};
const flat = (v) => (Array.isArray(v) ? v.join("|") : v && typeof v === "object" ? JSON.stringify(v) : v);

// A tap, as the channel sends it: `[yui] n1 choose choice=Legs` (spec/CHANNEL.md, Taps come back).
export function tapLine(ev) {
  const { id, preset, ...rest } = ev || {};
  const kv = Object.entries(rest)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}=${q(flat(v))}`);
  return [`[yui] ${id || "n1"} ${preset || "tap"}`, ...kv].join(" ").slice(0, 900);
}

// What the visitor sees in their own bubble for that tap: the words they tapped.
export function tapLabel(ev) {
  const e = ev || {};
  if (e.choice != null) return String(e.choice);
  if (e.answer != null) return String(e.answer);
  if (Array.isArray(e.picked)) return e.picked.join(", ") || "None";
  if (e.cta != null) return String(e.cta);
  if (e.value != null) return String(e.value);
  if (e.plan && typeof e.plan === "object") return Object.values(e.plan).map(flat).join(", ");
  if (e.values && typeof e.values === "object") return Object.entries(e.values).map(([k, v]) => `${k} ${flat(v)}`).join(", ");
  if (e.preset === "game" && e.score != null) return `Score ${e.score}`;
  if (e.preset === "game" && e.move != null) return `Move ${e.move}`;
  if (e.done) return "Done";
  const rest = Object.entries(e).filter(([k]) => !["id", "preset", "changed"].includes(k));
  return rest.length ? rest.map(([k, v]) => `${k}: ${flat(v)}`).join(", ").slice(0, 120) : "Tapped";
}

