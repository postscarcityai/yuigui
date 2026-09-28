// The site chat answers with screens (SITE-65). A reply is text plus ```yui blocks, like the app's
// channel (spec/CHANNEL.md). This file splits a reply into parts, keeps only the Yui Lines a web
// visitor should get, and turns a tap into the message it sends back. Used by the page and the tests.

// Presets the chat may draw. No media, camera, mic or custom blocks (nothing loads from a URL the
// model picked), no drawer, tables, theme or pages of their own (the chat is one screen). A flow
// (SITE-68, spec/FLOWS.md) is a whole run of screens: by name (`flow onboarding`) or inline Mermaid.
export const ALLOWED = new Set([
  "say", "ask", "choose", "pick", "slide", "form", "list", "table", "card",
  "stat", "chart", "math", "step", "calc",
  "deck", "page", "plan", "flow", "end",
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

// Keeps the lines this chat can draw. Keeps `>full` (the stage), drops other screen switches (`>2`), media and anything
// with a link that is not Yui's own. A site path becomes a full yuigui.com link.
// A flow's body is Mermaid (or a variant's changes, `as=`), not YL: it is kept as it is, up to the
// flow's own `end` (a subgraph's `end` does not close it).
const MERMAID = /^(flowchart|graph)\b/i;
export function cleanLines(yl) {
  const keep = [];
  const lines = String(yl || "").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].replace(/\s+$/, "");
    const t = line.trim();
    if (head(t) === "flow") {
      let j = i + 1;
      while (j < lines.length && (!lines[j].trim() || lines[j].trim().startsWith("%%"))) j++;
      if (/\bas=/.test(t) || MERMAID.test((lines[j] || "").trim())) {
        keep.push(t);
        let depth = 0;
        for (i = i + 1; i < lines.length; i++) {
          const b = lines[i].replace(/\s+$/, ""), bt = b.trim();
          if (/^subgraph\b/i.test(bt)) depth++;
          if (bt === "end") { if (depth === 0) { keep.push("end"); break; } depth--; }
          if (bt) keep.push(b);
        }
        continue;
      }
    }
    if (t === ">full") { keep.push(t); continue; } // the stage over the chat, like the app
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

// A flow's or plan's answers as words: "Sam, 3, Get fit, Eat better".
const words = (v) => (Array.isArray(v) ? v.join(", ") : v && typeof v === "object" ? Object.values(v).filter((x) => x !== "" && x != null).map(words).join(", ") : String(v));
const answers = (o) => Object.values(o).map(words).filter(Boolean).join(", ");

// What the visitor sees in their own bubble for that tap: the words they tapped.
export function tapLabel(ev) {
  const e = ev || {};
  if (e.choice != null) return String(e.choice);
  if (e.answer != null) return String(e.answer);
  if (Array.isArray(e.picked)) return e.picked.join(", ") || "None";
  if (e.cta != null) return String(e.cta);
  if (e.value != null) return String(e.value);
  if (e.flow && typeof e.flow === "object") return answers(e.flow) || "Sent";
  if (e.plan && typeof e.plan === "object") return answers(e.plan);
  if (e.values && typeof e.values === "object") return Object.entries(e.values).map(([k, v]) => `${k} ${flat(v)}`).join(", ");
  if (e.preset === "game" && e.score != null) return `Score ${e.score}`;
  if (e.preset === "game" && e.move != null) return `Move ${e.move}`;
  if (e.done) return "Done";
  const rest = Object.entries(e).filter(([k]) => !["id", "preset", "changed"].includes(k));
  return rest.length ? rest.map(([k, v]) => `${k}: ${flat(v)}`).join(", ").slice(0, 120) : "Tapped";
}

