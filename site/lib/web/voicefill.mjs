// Speak to fill a form (YUI-283): the browser's twin of Yui/Sources/Presets/VoiceFill.swift (t_0ab09ee7, TestFlight
// feedback AKNFDrNVFCY4IO44-4fjAnc). The words come from the stage's mic; this maps them onto the form's fields in the
// page, so nothing leaves it before Send. Say a field's name and then its answer ("business name is Acme Bakery, what you
// do is we bake sourdough") and each answer lands in its field. Words before the first field name go to the first empty
// field; with no field name at all, the first empty text field takes the lot. A choice is found by its option's words,
// a yes by yes or no. The person checks the filled fields before Next, so a wrong guess is one tap away from fixed.
// The rules are the app's rule for rule; change them there and here together.

const SKIPPED = new Set(["photo", "date", "time"]);
const LINKERS = new Set(["is", "are", "was", "equals", "be", "would", "should", "colon"]);
const OPENERS = new Set(["ok", "okay", "so", "um", "uh", "yeah", "hi", "well", "and"]);
const TAILS = new Set(["and", "then", "next", "also", "um", "uh"]);
const NO_WORDS = ["no", "not", "nope", "without", "none", "dont", "never"];
const SMALL = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, fifteen: 15, twenty: 20 };

const human = (k) => String(k).replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
const clean = (s) => [...s].filter((c) => /[\p{L}\p{N}]/u.test(c)).join("");
const upFirst = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const trimChars = (s, chars) => {
  let a = 0, b = s.length;
  while (a < b && chars.includes(s[a])) a++;
  while (b > a && chars.includes(s[b - 1])) b--;
  return s.slice(a, b);
};

// What a voice can fill. A photo, a date and a time are not.
export const canFill = (fields) => (fields || []).some((f) => !SKIPPED.has(f.type || "text"));

// "it's" is two tokens, `it` and `is`, so a field named "Who it is for" hears "who it's for".
// `raw` is as said, with its punctuation (empty for the second half of a contraction); `norm` is lowercase letters and digits.
export function tokens(s) {
  const out = [];
  for (const raw of String(s || "").split(/\s+/).filter(Boolean)) {
    const low = raw.toLowerCase().replace(/’/g, "'");
    if (low.endsWith("'s") || low.endsWith("'re")) {
      const stem = clean(low.slice(0, low.indexOf("'")));
      if (stem) { out.push({ raw, norm: stem }, { raw: "", norm: low.endsWith("'s") ? "is" : "are" }); continue; }
    }
    const n = clean(low);
    if (n) out.push({ raw, norm: n });
  }
  return out;
}

// The names a field answers to: its label, then its key when that reads differently.
function cues(f) {
  const a = tokens(f.label || human(f.key)).map((t) => t.norm);
  const b = tokens(String(f.key).replace(/_/g, " ")).map((t) => t.norm);
  return [a, b].filter((c) => c.length).reduce((acc, c) => (acc.some((x) => x.join(" ") === c.join(" ")) ? acc : [...acc, c]), []);
}
const cue = (f) => cues(f)[0] || [];

function find(c, toks, taken) {
  if (!c.length || toks.length < c.length) return -1;
  for (let i = 0; i <= toks.length - c.length; i++) {
    if (!c.every((w, j) => toks[i + j].norm === w)) continue;
    if (taken.some(([a, b]) => i < b && i + c.length > a)) continue;
    return i;
  }
  return -1;
}

const isText = (f) => !["choice", "yes", "range", "number"].includes(f.type || "text");
const isEmpty = (v) => v == null || (typeof v === "string" && v.trim() === "");

// Drops a run of filler words off the front, and "and"-like ones off the back.
function trimmed(t, fillers) {
  let a = 0, b = t.length;
  while (a < b && fillers.has(t[a].norm)) a++;
  while (b > a && TAILS.has(t[b - 1].norm)) b--;
  return t.slice(a, b);
}

// "ann at acme dot com" is ann@acme.com.
function spoken(s) {
  let t = ` ${s} `;
  for (const [said, mark] of [[" at ", "@"], [" dot ", "."], [" slash ", "/"], [" dash ", "-"], [" underscore ", "_"]]) t = t.split(said).join(mark);
  return t.replace(/ /g, "");
}

function number(seg) {
  // The raw word first: "3.5" and "1,200" lose their marks in `norm` and would read as 35 and 1200 (the app reads norm
  // first, so it hears 3.5 as 35; the web does not copy that).
  for (const t of seg) {
    const r = trimChars(t.raw.replace(/,/g, ""), ".!?;:$");
    if (r !== "" && Number.isFinite(Number(r))) return Number(r);
    if (Object.hasOwn(SMALL, t.norm)) return SMALL[t.norm];
  }
  return null;
}

// The option said in these words: the longest option wins, so "landing page" beats "page".
function pick(f, toks) {
  let best = null;
  for (const o of f.options || []) {
    const words = tokens(o).map((t) => t.norm);
    if (!words.length || find(words, toks, []) < 0) continue;
    if (!best || words.length > best[1]) best = [o, words.length];
  }
  return best ? best[0] : null;
}

function value(seg, f, before) {
  let body = seg;
  let lead = 0;
  while (lead < 2 && body.length && LINKERS.has(body[0].norm)) { body = body.slice(1); lead++; }
  body = trimmed(body, new Set());
  const text = body.map((t) => t.raw).filter(Boolean).join(" ");
  const type = f.type || "text";
  switch (type) {
    case "yes": {
      const words = new Set(body.map((t) => t.norm));
      if (NO_WORDS.some((w) => words.has(w))) return false;
      if (!body.length) return !["no", "not", "without", "nope"].includes(before);
      return true;
    }
    case "range": {
      const n = number(body);
      return n == null ? null : Math.min(Math.max(Math.round(n), f.min), f.max);
    }
    case "number": return number(body);
    case "choice": return pick(f, body);
    case "email":
    case "url": return text ? spoken(body.map((t) => t.norm).join(" ")) : null;
    case "phone": {
      const d = trimChars([...text].filter((c) => /\d/.test(c) || "+-() ".includes(c)).join(""), " ");
      return /\d/.test(d) ? d : null;
    }
    default: {
      if (!text) return null;
      let s = trimChars(text, ",;:");
      if (type !== "long" && type !== "voice") s = trimChars(s, ".!?,;:");
      return upFirst(s);
    }
  }
}

// What the words fill, by field key: only the fields the words reached.
// `current` is what the fields hold now, so words with no field name go to an empty one.
export function fill(words, fields, current = {}) {
  const toks = tokens(words);
  if (!toks.length) return {};
  const live = (fields || []).filter((f) => !SKIPPED.has(f.type || "text"));

  // Where each field's name is said. Longest names first so "business name" wins over "name".
  const claimed = [];
  for (const f of [...live].sort((a, b) => cue(b).length - cue(a).length)) {
    for (const c of cues(f)) {
      const at = find(c, toks, claimed.map((h) => [h.start, h.end]));
      if (at < 0) continue;
      claimed.push({ field: f, start: at, end: at + c.length });
      break;
    }
  }
  claimed.sort((a, b) => a.start - b.start);

  const out = {};
  claimed.forEach((hit, i) => {
    const stop = i + 1 < claimed.length ? claimed[i + 1].start : toks.length;
    const before = hit.start > 0 ? toks[hit.start - 1].norm : "";
    const v = value(toks.slice(hit.end, stop), hit.field, before);
    if (v != null) out[hit.field.key] = v;
  });

  // Words ahead of the first field name, or all of them when no field was named.
  const lead = toks.slice(0, claimed.length ? claimed[0].start : toks.length);
  const named = new Set(claimed.map((h) => h.field.key));
  const open = live.filter((f) => !named.has(f.key));
  const first = open.find((f) => isText(f) && isEmpty(current[f.key]));
  if (first) {
    const body = trimmed(lead, OPENERS);
    if (body.length && !(claimed.length === 0 && open.some((f) => f.type === "choice" && pick(f, body) != null))) {
      const v = value(body, first, "");
      if (v != null) out[first.key] = v;
    }
  }
  // A choice is heard by its option's words anywhere in what was said.
  for (const f of open) {
    if (f.type !== "choice" || out[f.key] !== undefined) continue;
    const v = pick(f, toks);
    if (v != null) out[f.key] = v;
  }
  return out;
}
