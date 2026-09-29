// The small markdown reader for say, page, card and stage text (SITE-97, spec/YL.md "Body text").
// Pure: text in, blocks out, so the site renders it in React and the Swift app (YUI-196) copies the
// same rules. Never returns a raw ** or #.
//
//   blocks: { t: "h", level, inline } | { t: "p", inline } | { t: "ul"|"ol", items: [inline] }
//         | { t: "kv", mark, label, value: inline }
//   inline: [{ t: "text"|"b"|"i"|"code"|"a", text, href? }]
//
// `Label: value` (a short label, then a colon and the value) is a lead-in: the label takes the accent
// colour, the value stays body. `**Label:** value` and a leading ✅ or ❌ read the same way.

const MARK = /^(✅|❌|⚠️|➡️|•)\s*/u;
const KV = /^(?:\*\*([^*:]{1,40}):\*\*|([A-Z][\w '’/&+-]{0,36}):)\s+(\S.*)$/u;

export function readInline(s) {
  const out = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|__([^_]+)__|(?<![\w*])\*([^*\s][^*]*?)\*(?![\w*])|(?<![\w_])_([^_\s][^_]*?)_(?![\w_])/gu;
  let at = 0, m;
  while ((m = re.exec(s))) {
    if (m.index > at) out.push({ t: "text", text: s.slice(at, m.index) });
    if (m[1] != null) out.push({ t: "a", text: m[1], href: m[2] });
    else if (m[3] != null) out.push({ t: "code", text: m[3] });
    else if (m[4] != null || m[5] != null) out.push({ t: "b", text: m[4] ?? m[5] });
    else out.push({ t: "i", text: m[6] ?? m[7] });
    at = re.lastIndex;
  }
  if (at < s.length) out.push({ t: "text", text: s.slice(at) });
  return out;
}

// A label is a lead-in only when it is short and not a sentence, so "Note that: x" and times ("Meet at 9:30")
// stay prose.
function lead(line) {
  const mark = MARK.exec(line);
  const rest = mark ? line.slice(mark[0].length) : line;
  const m = KV.exec(rest);
  if (!m) return null;
  const label = (m[1] ?? m[2]).trim();
  if (m[2] != null && label.split(/\s+/).length > 4) return null;
  return { t: "kv", mark: mark ? mark[1] : "", label, value: readInline(m[3]) };
}

export function readText(text) {
  const blocks = [];
  let list = null;
  for (const raw of String(text ?? "").replace(/\r/g, "").split("\n")) {
    const line = raw.trim();
    if (!line) { list = null; const p = blocks[blocks.length - 1]; if (p) p.open = false; continue; }
    const h = /^(#{1,6})\s+(.*?)\s*#*$/.exec(line);
    const ul = /^[-*•]\s+(.*)$/.exec(line);
    const ol = /^\d+[.)]\s+(.*)$/.exec(line);
    if (h) { list = null; blocks.push({ t: "h", level: Math.min(h[1].length, 3), inline: readInline(h[2]) }); continue; }
    if (ul || ol) {
      const t = ul ? "ul" : "ol";
      if (!list || list.t !== t) { list = { t, items: [] }; blocks.push(list); }
      list.items.push(readInline((ul || ol)[1]));
      continue;
    }
    list = null;
    const kv = lead(line);
    if (kv) { blocks.push(kv); continue; }
    const last = blocks[blocks.length - 1];
    // Lines of one paragraph stay together as one thought.
    if (last?.t === "p" && last.open) { last.inline.push({ t: "text", text: " " }, ...readInline(line)); continue; }
    blocks.push({ t: "p", inline: readInline(line), open: true });
  }
  for (const b of blocks) delete b.open;
  return blocks;
}

// Display type is for words that fit on a line or two: at most 60 characters, no list, no second
// paragraph. Anything longer, or with structure, reads as body, regular weight.
export const DISPLAY_MAX = 60;
export function textRole(text) {
  const t = String(text ?? "").trim();
  if (t.length > DISPLAY_MAX || /\n/.test(t)) return "body";
  const b = readText(t);
  return b.length === 1 && b[0].t === "p" ? "display" : "body";
}

// Plain words for a place that cannot style (a notification, a caption, a tab title): no **, no #.
export function plainText(text) {
  const flat = (inl) => inl.map((x) => x.text).join("");
  return readText(text).map((b) => (b.items ? b.items.map(flat).join(", ") : b.t === "kv" ? `${b.label}: ${flat(b.value)}` : flat(b.inline))).join(" ");
}
