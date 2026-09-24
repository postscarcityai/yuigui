// Yui Lines (YL) v0 parser. Spec: ~/dev/yuigui/spec/YL.md
// Conformance: ~/dev/yuigui/spec/conformance (node run.mjs)
// Pure, dependency free. Used by the playground, the benchmark and the tests.
//
// One line in, one op out. Ops:
//   { op: "add",   screen, preset, id, props, line }
//   { op: "patch", screen, target, props, line }
//   { op: "save",  screen, name, line }       save the screen under a name
//   { op: "show",  screen, name, line }       restore a saved screen
//   { op: "forget", screen, name, line }      take a saved screen off the shelf
//   { op: "clear", screen, line }
//   { op: "focus", screen, line }             bare ">2": later lines go to screen 2
//   { op: "end",   screen, target, line }     close the open group (deck, plan, narrate)
//   { op: "theme", screen, props, line }      restyle this agent's look (props.name = a named set)
//   { op: "close", screen: "full", line }     `close` or bare ">chat": close the stage, back to screen 1
//   { op: "error", screen, message, line }
// `props` holds only what the line actually said. Defaults live in resolve().
// An add that joins an open group (a page under a deck) also carries `in`,
// the group's id.

export const PRESETS = [
  "timer", "ask", "choose", "pick", "slide", "form",
  "list", "table", "card", "image", "camera", "mic",
  "gallery", "video", "compare", "storyboard",
  "chart", "stat", "math", "step", "calc",
  "deck", "page", "plan", "project", "narrate",
];
// Not presets, but valid line heads.
export const CORE = ["say", "custom", "save", "show", "forget", "clear", "end", "theme", "close"];

// Groups: a group head collects the lines that follow it on the same screen,
// as long as each one is a member preset. Anything else ends the group, and
// so does `end`. Comments, blank lines and error lines do not. Only a
// narrate can hold another group (a deck).
export const GROUPS = {
  deck: ["page", "ask", "choose", "pick"],
  plan: ["page", "ask", "choose", "pick", "slide", "form", "mic", "camera"],
  narrate: ["page", "compare", "image", "video", "card", "stat", "chart", "math", "storyboard", "gallery", "deck"],
};

const IDENT = /^[a-z_][\w-]*$/i;

// ---------- tokenizer ----------

// Splits a line into tokens. A token is a run of non-space characters in
// which double-quoted segments may contain spaces. For each token we keep:
//   raw     the exact source text
//   text    the text with quotes removed
//   quoted  true when the whole token was one quoted string
//   parts   segments split on "|" outside quotes (null when there is no "|")
//   key     set when the token is key=value (key must be an identifier)
//   value   the unquoted text after "=", or its parts when it has "|"
//   vquoted per value part, true when that part held a quoted string
//           (quoted values stay text: cta="5" is the string "5")
export function tokenize(line) {
  const tokens = [];
  let i = 0;
  const n = line.length;
  while (i < n) {
    while (i < n && /\s/.test(line[i])) i++;
    if (i >= n) break;
    // Comment: a "#" that starts a token and is followed by space or EOL.
    if (line[i] === "#" && (i + 1 >= n || /\s/.test(line[i + 1]))) break;
    const start = i;
    let segs = [""];
    const segQ = [false]; // per segment: held a quoted string
    let anyQuote = false;
    let wholeQuoted = line[i] === '"';
    let eqAt = -1; // index into segs[0] text where "=" appeared, outside quotes
    while (i < n && !/\s/.test(line[i])) {
      const c = line[i];
      if (c === '"') {
        anyQuote = true;
        segQ[segQ.length - 1] = true;
        i++;
        while (i < n && line[i] !== '"') {
          if (line[i] === "\\" && i + 1 < n) { segs[segs.length - 1] += line[i + 1]; i += 2; continue; }
          segs[segs.length - 1] += line[i++];
        }
        i++; // closing quote (or EOL for an unterminated string)
        if (i < n && !/\s/.test(line[i])) wholeQuoted = false;
        continue;
      }
      if (c === "|") { segs.push(""); segQ.push(false); wholeQuoted = false; i++; continue; }
      if (c === "=" && eqAt < 0 && segs.length === 1 && !anyQuote && IDENT.test(segs[0])) {
        eqAt = segs[0].length;
      }
      segs[segs.length - 1] += c;
      i++;
    }
    const raw = line.slice(start, i);
    const t = { raw, text: segs.join("|"), quoted: wholeQuoted && segs.length === 1, parts: segs.length > 1 ? segs : null };
    if (eqAt >= 0) {
      t.key = segs[0].slice(0, eqAt);
      const first = segs[0].slice(eqAt + 1);
      const vparts = [first, ...segs.slice(1)];
      t.value = vparts.length > 1 ? vparts : first;
      t.vquoted = segQ;
      t.parts = null;
    }
    tokens.push(t);
  }
  return tokens;
}

// Strips a trailing comment and returns the JSON text after "custom".
function afterHead(line, head) {
  const at = line.indexOf(head);
  return line.slice(at + head.length).trim();
}

// ---------- value helpers ----------

const NUM = /^-?\d+(\.\d+)?$/;
const RANGE = /^(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)$/;
const DUR = "(\\d+(?::\\d{1,2})?(?:\\.\\d+)?[smh]?)";
const TIMESPEC = new RegExp(`^${DUR}(?:\\/${DUR})?(?:x(\\d+))?$`);

export function seconds(s) {
  if (s == null) return undefined;
  const m = String(s).match(/^(\d+)(?::(\d{1,2}))?(\.\d+)?([smh]?)$/);
  if (!m) return undefined;
  if (m[2] != null) return Number(m[1]) * 60 + Number(m[2]);
  const v = Number(m[1] + (m[3] || ""));
  return m[4] === "m" ? v * 60 : m[4] === "h" ? v * 3600 : v;
}

function coerce(v) {
  if (Array.isArray(v)) return v.map(coerce);
  if (NUM.test(v)) return Number(v);
  if (v === "on" || v === "true") return true;
  if (v === "off" || v === "false") return false;
  return v;
}

// Keys whose values are never typed: a quiz answer is compared with option
// text, so answer=4 and answer=on stay "4" and "on".
const TEXT_KEYS = new Set(["answer"]);

// Splits tokens into key/values, +flags and positionals.
function split(tokens) {
  const kv = {};
  const flags = {};
  const pos = [];
  for (const t of tokens) {
    if (t.key && TEXT_KEYS.has(t.key)) kv[t.key] = t.value;
    else if (t.key) kv[t.key] = Array.isArray(t.value)
      ? t.value.map((v, i) => (t.vquoted[i] ? v : coerce(v)))
      : t.vquoted[0] ? t.value : coerce(t.value);
    else if (!t.quoted && !t.parts && /^\+[a-z][\w-]*$/i.test(t.raw)) flags[t.raw.slice(1)] = true;
    else pos.push(t);
  }
  return { kv, flags, pos };
}

const joinText = (toks) => toks.map((t) => t.text).join(" ");
// Media: a URL is a token starting http://, https://, / or data:.
const URL_RE = /^(https?:\/\/|\/|data:)/;
const isURL = (s) => URL_RE.test(s);
// A media token is a URL with an optional caption after the first "|":
// /a.jpg, /a.jpg|Caption, "/a.jpg|Two words" or /a.jpg|"Two words".
function mediaToken(t) {
  const segs = t.parts || [t.text];
  if (!isURL(segs[0])) return null;
  const i = segs[0].indexOf("|");
  if (i > 0) return { src: segs[0].slice(0, i), caption: segs[0].slice(i + 1) };
  return { src: segs[0], caption: segs.length > 1 ? segs.slice(1).join("|") : "" };
}
// Positionals of a media set: URLs become items, any other text is the title.
function mediaSet(pos, itemsKey, capsKey) {
  const o = {};
  const items = [];
  const caps = [];
  const title = [];
  for (const t of pos) {
    const m = mediaToken(t);
    if (m) { items.push(m.src); caps.push(m.caption); } else title.push(t);
  }
  if (title.length) o.title = joinText(title);
  if (items.length) o[itemsKey] = items;
  if (caps.some(Boolean)) o[capsKey] = caps;
  return o;
}
const clean = (o) => { for (const k of Object.keys(o)) if (o[k] === undefined || (Array.isArray(o[k]) && !o[k].length)) delete o[k]; return o; };

// ---------- presets ----------
// Each takes positionals and returns explicit props. Key/values and flags are
// merged on top by parseArgs, so any prop can also be set as key=value.

const P = {
  timer(pos) {
    const o = {};
    const rest = [];
    for (const t of pos) {
      const m = !t.quoted && o.work === undefined && t.text.match(TIMESPEC);
      if (m) {
        o.work = seconds(m[1]);
        if (m[2]) o.rest = seconds(m[2]);
        if (m[3]) o.rounds = Number(m[3]);
      } else rest.push(t);
    }
    if (rest.length) o.label = joinText(rest);
    return o;
  },

  ask(pos) {
    const o = {};
    const q = [];
    for (const t of pos) {
      if (t.parts && !o.options) o.options = t.parts;
      else q.push(t);
    }
    // Loose options (section 4, ask): with no options token, two or more
    // quoted tokens at the end, after at least one question token, are the options.
    if (!o.options) {
      let k = q.length;
      while (k > 1 && q[k - 1].quoted) k--;
      if (q.length - k >= 2) o.options = q.splice(k).map((t) => t.text);
    }
    if (q.length) o.q = joinText(q);
    return o;
  },

  choose(pos) { return P.ask(pos); },
  pick(pos) { return P.ask(pos); },

  slide(pos) {
    const o = {};
    const label = [];
    for (const t of pos) {
      const m = !t.quoted && o.min === undefined && t.text.match(RANGE);
      if (m) { o.min = Number(m[1]); o.max = Number(m[2]); }
      else if (t.parts && t.parts.length === 2 && !o.lo) { o.lo = t.parts[0]; o.hi = t.parts[1]; }
      else label.push(t);
    }
    if (label.length) o.label = joinText(label);
    return o;
  },

  form(pos) {
    const o = { fields: [] };
    const title = [];
    for (const t of pos) {
      const f = field(t);
      if (f) o.fields.push(f);
      else title.push(t);
    }
    if (title.length) o.title = joinText(title);
    return o;
  },

  list(pos) {
    const o = { items: [] };
    for (const t of pos) {
      if (o.title === undefined && !o.items.length && !t.quoted && !t.parts) { o.title = t.text; continue; }
      if (t.parts) o.items.push(...t.parts);
      else o.items.push(t.text);
    }
    return o;
  },

  table(pos) {
    const o = { rows: [] };
    for (const t of pos) {
      if (o.name === undefined && !o.cols && !t.parts && !t.quoted) { o.name = t.text; continue; }
      const cells = t.parts || (t.text.includes("|") ? t.text.split("|") : [t.text]);
      if (!o.cols) o.cols = cells;
      else o.rows.push(cells.map(coerce));
    }
    return o;
  },

  card(pos) {
    const o = {};
    if (pos[0]) o.title = pos[0].text;
    if (pos.length > 1) o.body = joinText(pos.slice(1));
    return o;
  },

  image(pos) {
    const o = {};
    const cap = [];
    for (const t of pos) {
      if (!o.src && /^(https?:\/\/|\/|data:)/.test(t.text)) o.src = t.text;
      else cap.push(t);
    }
    if (cap.length) o[o.src ? "caption" : "prompt"] = joinText(cap);
    return o;
  },

  camera(pos) {
    const o = {};
    const q = [];
    for (const t of pos) {
      if (!t.quoted && (t.text === "front" || t.text === "back")) o.facing = t.text;
      else q.push(t);
    }
    if (q.length) o.prompt = joinText(q);
    return o;
  },

  mic(pos) {
    const o = {};
    if (pos.length) o.prompt = joinText(pos);
    return o;
  },

  say(pos) { return { text: joinText(pos) }; },
  // theme [named set] key=value...: the positional text is the set's name.
  theme(pos) { return pos.length ? { name: joinText(pos) } : {}; },

  gallery(pos) { return mediaSet(pos, "items", "caps"); },

  video(pos) { return P.image(pos); },

  compare(pos) {
    const o = {};
    const title = [];
    for (const t of pos) {
      if (o.after === undefined && !t.parts && isURL(t.text)) o[o.before === undefined ? "before" : "after"] = t.text;
      else title.push(t);
    }
    if (title.length) o.title = joinText(title);
    return o;
  },

  storyboard(pos) { return mediaSet(pos, "frames", "notes"); },

  // chart [type] [title...]: the first bare chart type is the type, other
  // text is the title. Data rides on x=, y=, y2= ... or data=<table>.
  chart(pos) {
    const o = {};
    const title = [];
    for (const t of pos) {
      if (o.type === undefined && !t.quoted && !t.parts && CHART_TYPES.includes(t.text)) o.type = t.text;
      else title.push(t);
    }
    if (title.length) o.title = joinText(title);
    return o;
  },

  // stat VALUE [label...]: the first quantity (72.5kg, 12%, $40, -3) is the
  // value and its unit; with no quantity the first token is the value as text.
  stat(pos) {
    const o = {};
    const label = [];
    for (const t of pos) {
      const q = o.value === undefined && !t.quoted && !t.parts && quantity(t.text);
      if (q) { o.value = q.value; if (q.unit) o.unit = q.unit; } else label.push(t);
    }
    if (o.value === undefined && label.length) o.value = label.shift().text;
    if (label.length) o.label = joinText(label);
    return o;
  },

  // step text... [$ TEX]: the TeX part is split off raw in Parser.line.
  step(pos) {
    const o = {};
    const text = [];
    for (const t of pos) {
      if (o.img === undefined && !t.parts && isURL(t.text)) o.img = t.text;
      else text.push(t);
    }
    if (text.length) o.text = joinText(text);
    return o;
  },

  calc(pos) {
    const o = {};
    if (pos.length) o.title = joinText(pos);
    return o;
  },

  deck(pos) { return P.calc(pos); },
  plan(pos) { return P.calc(pos); },
  narrate(pos) { return P.calc(pos); },

  // page title [body...] [URL]: the first URL is img, the first text token
  // the title, the rest the body (as in card).
  page(pos) {
    const o = {};
    const text = [];
    for (const t of pos) {
      if (o.img === undefined && !t.parts && isURL(t.text)) o.img = t.text;
      else text.push(t);
    }
    if (text[0]) o.title = text[0].text;
    if (text.length > 1) o.body = joinText(text.slice(1));
    return o;
  },

  project(pos) { return P.card(pos); },
};

export const CHART_TYPES = ["line", "bar", "area", "scatter", "pie", "donut"];

// Quantity: a number with an optional unit stuck to it. 72.5kg, 9.81m/s^2,
// 37.2degC, 12%, 3e8m/s, $40. A unit starts with a non-digit. The currency
// signs $ € £ ¥ may lead instead. Returns { value, unit } or null.
const QTY = /^([$€£¥])?(-?\d+(?:\.\d+)?(?:[eE]-?\d+)?)\s*([^\d\s.,+\-|=][^\s]*)?$/;
export function quantity(s) {
  if (typeof s === "number") return { value: s };
  const m = String(s).match(QTY);
  if (!m || (m[1] && m[3])) return null;
  const q = { value: Number(m[2]) };
  if (m[1] || m[3]) q.unit = m[1] || m[3];
  return q;
}

// calc variable: min-max[@value][unit] is a slider, a quantity is a constant.
const VAR_RANGE = /^(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)(?:@(-?\d+(?:\.\d+)?))?\s*([^\d\s][^\s]*)?$/;
export function calcVar(v) {
  if (typeof v === "number") return { value: v };
  if (typeof v !== "string") return null;
  const r = v.trim().match(VAR_RANGE);
  if (r) {
    const min = Number(r[1]), max = Number(r[2]);
    const o = { min, max, value: r[3] != null ? Number(r[3]) : (min + max) / 2 };
    if (r[4]) o.unit = r[4];
    return o;
  }
  return quantity(v.trim());
}
const CALC_PROPS = new Set(["title", "f", "plot", "unit", "digits"]);
// A y value with an error: 12.5±0.4 or 12.5+-0.4.
const PM = /^(-?\d+(?:\.\d+)?)(?:±|\+-)(\d+(?:\.\d+)?)$/;

// Props that are always lists. A plain value, quoted or not, is split on "|",
// so notes="Hook|Problem|CTA" and notes=Hook|Problem|CTA are the same.
const LISTS = {
  gallery: ["items", "caps"],
  storyboard: ["frames", "notes"],
  compare: ["notes", "labels"],
  chart: ["names", "color"],
  table: ["units"],
  page: ["points"],
  project: ["facts", "next"],
  pick: ["answer"],
};
const asList = (v) => (Array.isArray(v) ? v : String(v).split("|")).map((x) => (typeof x === "string" ? x : String(x)));
// Highlight boxes: hl=x,y,w,h|x,y,w,h in percent of the image. A box that is
// not four numbers is dropped.
function boxes(v) {
  const out = [];
  for (const b of Array.isArray(v) ? v : String(v).split("|")) {
    const n = String(b).split(",").map((x) => x.trim());
    if (n.length === 4 && n.every((x) => NUM.test(x))) out.push(n.map(Number));
  }
  return out;
}
function normalize(preset, o) {
  for (const k of LISTS[preset] || []) if (o[k] !== undefined && o[k] !== true) o[k] = asList(o[k]);
  if (preset === "compare" && o.hl !== undefined) o.hl = boxes(o.hl);
  if (preset === "chart") chartSeries(o);
  if (preset === "stat" && o.spark !== undefined && !Array.isArray(o.spark)) o.spark = [o.spark];
  if (preset === "step" && o.time !== undefined) o.time = seconds(o.time) ?? o.time;
  if (preset === "calc") {
    for (const k of Object.keys(o)) {
      if (CALC_PROPS.has(k)) continue;
      const v = calcVar(o[k]);
      if (v) o[k] = v;
    }
  }
  return o;
}

// Chart series: x is a list of labels or numbers. y, y2, y3 ... are lists;
// a part written 12.5±0.4 (or 12.5+-0.4) becomes 12.5 with an error of 0.4,
// collected into err, err2, ... unless the line set that err list itself.
// err lists hold numbers; one value applies to every point.
function chartSeries(o) {
  // Values were already typed by the tokenizer (a quoted "2024" stays text),
  // so a lone value is only wrapped, never re-read.
  if (o.x !== undefined && !Array.isArray(o.x)) o.x = [o.x];
  for (const k of Object.keys(o)) {
    const m = k.match(/^(y|err)(\d*)$/);
    if (!m) continue;
    const list = Array.isArray(o[k]) ? o[k] : [o[k]];
    if (m[1] === "err") { o[k] = list; continue; }
    const errs = [];
    o[k] = list.map((v) => {
      const pm = typeof v === "string" && v.match(PM);
      if (!pm) { errs.push(0); return v; }
      errs.push(Number(pm[2]));
      return Number(pm[1]);
    });
    const ek = `err${m[2]}`;
    if (errs.some(Boolean) && o[ek] === undefined) o[ek] = errs;
  }
}

// Raw-TeX presets. math: the rest of the line is TeX, verbatim, after any
// leading caption= / size= props; one wrapping pair of quotes is dropped.
// step: a lone "$" token starts the TeX part, which runs to the end of the
// line. Backslashes, quotes and "#" in TeX are never escapes or comments.
const MATH_PROP = /^(caption|size)=("(?:[^"\\]|\\.)*"|\S*)(?:\s+|$)/;
function mathArgs(rest) {
  const o = {};
  let r = rest.trim();
  for (let m; (m = r.match(MATH_PROP)); r = r.slice(m[0].length)) {
    o[m[1]] = m[2].startsWith('"') ? m[2].slice(1, -1).replace(/\\(.)/g, "$1") : m[2];
  }
  r = r.trim();
  if (/^"[^"]*"$/.test(r)) r = r.slice(1, -1);
  if (r) o.tex = r;
  return o;
}
function stepArgs(rest) {
  const m = rest.match(/(^|\s)\$(\s|$)/);
  const head = m ? rest.slice(0, m.index) : rest;
  const o = parseArgs("step", tokenize(head));
  if (m) {
    const tex = rest.slice(m.index + m[0].length).trim();
    if (tex) o.tex = tex;
  }
  return o;
}
const rawArgs = (preset, rest) => (preset === "math" ? mathArgs(rest) : stepArgs(rest));
const RAW = new Set(["math", "step"]);

// Form field token: key:type, "Label":type, optional trailing "!" = required.
// A bare identifier is a text field.
const FIELD = /^(?:"((?:[^"\\]|\\.)*)"|([a-z_][\w-]*))(?::(.+?))?(!)?$/i;
// Known field types. Any other type is kept as written and renders as text,
// so a newer agent's field type degrades on an older app.
export const FIELD_TYPES = new Set(["text", "long", "voice", "number", "email", "phone", "date", "time", "yes", "photo", "url"]);

function field(t) {
  if (t.quoted) return null; // a quoted token alone is the form title
  const m = t.raw.match(FIELD);
  if (!m) return null;
  const label = m[1] != null ? m[1].replace(/\\(.)/g, "$1") : null;
  const key = m[2] || slug(label);
  let type = m[3];
  if (type === undefined && label !== null) return null; // "Title" without a type
  const f = { key };
  if (label) f.label = label;
  if (type) {
    const r = type.match(RANGE);
    if (r) { f.type = "range"; f.min = Number(r[1]); f.max = Number(r[2]); }
    else if (type.includes("|")) { f.type = "choice"; f.options = type.split("|").map((s) => s.replace(/^"|"$/g, "")); }
    else f.type = type;
  }
  if (m[4]) f.required = true;
  return f;
}

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

export function parseArgs(preset, tokens) {
  const { kv, flags, pos } = split(tokens);
  const fn = P[preset];
  const base = fn ? fn(pos) : {};
  return clean(normalize(preset, { ...base, ...flags, ...kv }));
}

// ---------- line parser ----------

// Stateful: remembers the focused screen and which preset each id belongs to,
// so "~hiit rounds=10" knows to parse its args as a timer.
export class Parser {
  constructor() {
    this.screen = "1";
    this.ids = new Map(); // id -> preset
    this.auto = 0;
    this.open = []; // open groups, innermost last: { id, preset, screen }
  }

  // Group bookkeeping for one parsed op. Errors (and null) leave groups open.
  group(op) {
    // A theme line restyles the app, not the screen: it leaves groups alone.
    if (!op || op.op === "error" || op.op === "theme") return op;
    // Closing the stage ends whatever group was open on it, like `>2` would.
    if (op.op === "close") { this.open = []; return op; }
    if (op.op === "end") {
      const g = this.open.pop();
      if (!g) return { op: "error", screen: op.screen, message: "end: no open deck, plan or narrate", line: op.line };
      return { ...op, target: g.id };
    }
    const joins = (g) => op.op === "add" && op.screen === g.screen && GROUPS[g.preset].includes(op.preset);
    while (this.open.length && !joins(this.open[this.open.length - 1])) this.open.pop();
    const g = this.open[this.open.length - 1];
    const out = g ? { op: op.op, screen: op.screen, preset: op.preset, id: op.id, in: g.id, props: op.props, line: op.line } : op;
    if (op.op === "add" && GROUPS[op.preset]) this.open.push({ id: op.id, preset: op.preset, screen: op.screen });
    return out;
  }

  line(src) { return this.group(this.parseLine(src)); }

  parseLine(src) {
    const line = src.replace(/\r$/, "");
    let body = line.trim();
    if (!body || /^#(\s|$)/.test(body)) return null;

    let screen = this.screen;
    const route = body.match(/^>([\w-]+)(?:\s+|$)/);
    if (route) {
      // `chat` is screen 1 (spec section 1); a bare ">chat" closes the stage.
      screen = route[1] === "chat" ? "1" : route[1];
      body = body.slice(route[0].length);
      if (!body || /^#(\s|$)/.test(body)) {
        this.screen = screen;
        return route[1] === "chat" ? { op: "close", screen: "full", line } : { op: "focus", screen, line };
      }
    }

    // custom {json}: the rest of the line is JSON, not YL tokens.
    const cm = body.match(/^custom(?:@([\w-]+))?\s+(.*)$/);
    if (cm) {
      try {
        const spec = JSON.parse(cm[2]);
        const id = cm[1] || `c${++this.auto}`;
        this.ids.set(id, "custom");
        return { op: "add", screen, preset: "custom", id, props: { spec }, line };
      } catch (e) {
        return { op: "error", screen, message: `custom: bad JSON (${e.message})`, line };
      }
    }

    const tokens = tokenize(body);
    if (!tokens.length) return null;
    const head = tokens.shift().raw;

    if (head.startsWith("~")) {
      let target = head.slice(1);
      // ~preset@id (section 5): the id when this reply made it, else the preset name.
      const pm = target.match(/^([a-z]+)@([\w-]+)$/);
      if (pm) {
        if (!PRESETS.includes(pm[1]) && pm[1] !== "say" && pm[1] !== "custom") return { op: "error", screen, message: `patch: unknown preset "${pm[1]}"`, line };
        const known = this.ids.get(pm[2]);
        if (known && known !== pm[1]) return { op: "error", screen, message: `patch: "${pm[2]}" is a ${known}, not a ${pm[1]}`, line };
        target = known ? pm[2] : pm[1];
      }
      const preset = PRESETS.includes(target) || target === "say" ? target : this.ids.get(target);
      if (!preset) return { op: "error", screen, message: `patch: nothing called "${target}"`, line };
      if (preset === "custom") return { op: "error", screen, message: "patch: custom blocks are replaced, not patched", line };
      const props = RAW.has(preset) ? rawArgs(preset, body.slice(head.length)) : parseArgs(preset, tokens);
      return { op: "patch", screen, target, props, line };
    }

    if (head === "save" || head === "show" || head === "forget") {
      // The name is the rest of the line: `save leg day` is "leg day".
      const name = tokens.map((t) => t.text).filter(Boolean).join(" ");
      if (!name) return { op: "error", screen, message: `${head}: needs a name`, line };
      return { op: head, screen, name, line };
    }
    if (head === "clear") return { op: "clear", screen, line };
    if (head === "end") return { op: "end", screen, line };
    if (head === "close") {
      if (tokens.length) return { op: "error", screen, message: "close: takes nothing else", line };
      this.screen = "1";
      return { op: "close", screen: "full", line };
    }
    if (head === "theme") return { op: "theme", screen, props: parseArgs("theme", tokens), line };

    const hm = head.match(/^([a-z]+)(?:@([\w-]+))?$/);
    if (!hm || !(PRESETS.includes(hm[1]) || hm[1] === "say")) {
      return { op: "error", screen, message: `unknown preset "${head}"`, line };
    }
    const preset = hm[1];
    const id = hm[2] || `n${++this.auto}`;
    this.ids.set(id, preset);
    const props = RAW.has(preset) ? rawArgs(preset, body.slice(head.length)) : parseArgs(preset, tokens);
    return { op: "add", screen, preset, id, props, line };
  }
}

// Parse a whole document at once.
export function parse(text) {
  const p = new Parser();
  return text.split("\n").map((l) => p.line(l)).filter(Boolean);
}

// Streaming: feed chunks as they arrive, get ops for every completed line.
// Lines render the moment their newline lands; flush() finishes the tail.
export class StreamParser {
  constructor() { this.buf = ""; this.p = new Parser(); }
  push(chunk) {
    this.buf += chunk;
    const out = [];
    let nl;
    while ((nl = this.buf.indexOf("\n")) >= 0) {
      const op = this.p.line(this.buf.slice(0, nl));
      this.buf = this.buf.slice(nl + 1);
      if (op) out.push(op);
    }
    return out;
  }
  flush() {
    const rest = this.buf;
    this.buf = "";
    const op = rest.trim() ? this.p.line(rest) : null;
    return op ? [op] : [];
  }
}

// ---------- the stage ----------
// The stage is a full-screen layer over the chat (spec section 5, The stage).
// These presets open there unless they say +inline.
export const STAGE = ["timer", "camera", "mic", "deck", "plan"];

// A timer with rounds or rest. Workouts always open on the stage.
export function isWorkout(preset, props = {}) {
  return preset === "timer" && props.up !== true && ((props.rounds ?? 1) > 1 || (props.rest ?? 0) > 0);
}

// Whether an add op opens on the stage. `style` is the agent's style profile
// (theme style: screen=chat|full, gallery=...). Group members follow their
// head; screen state handles that (apply), since the op alone cannot know.
export function onStage(op, style = {}) {
  if (!op || op.op !== "add") return false;
  if (op.screen === "full") return true;
  const p = op.props || {};
  if (isWorkout(op.preset, p)) return true;
  if (pageOf(op.screen) !== 1) return false;
  if (p.inline === true) return false;
  if (style.screen === "chat") return false;
  if (style.screen === "full") return true;
  if (STAGE.includes(op.preset)) return true;
  return op.preset === "gallery" && (p.layout ?? style.gallery) === "row3d";
}

// ---------- pages ----------
// The app shows three screens per agent side by side (spec section 5, Pages):
// the chat, then screens 2 and 3. Every other screen name renders in the chat.
export function pageOf(screen) {
  return screen === "2" ? 2 : screen === "3" ? 3 : 1;
}

// ---------- defaults ----------

export function resolve(preset, props) {
  const p = { ...props };
  switch (preset) {
    case "timer":
      return { work: 60, rest: 0, rounds: 1, label: "", up: false, auto: false, sound: true, ...p };
    case "ask":
      return { q: "Continue?", options: ["Yes", "No"], ...p };
    case "choose":
    case "pick":
      return { q: "", options: [], other: false, ...(preset === "pick" ? { submit: "Done" } : {}), ...p };
    case "slide": {
      const r = { label: "", min: 1, max: 5, step: 1, ...p };
      if (r.value === undefined) r.value = Math.round((r.min + r.max) / 2);
      return r;
    }
    case "form":
      return { title: "", fields: [], submit: "Submit", ...p };
    case "list":
      return { title: "", items: [], check: false, num: false, ...p };
    case "table":
      return { name: "", cols: null, rows: [], units: [], sort: false, ...p };
    case "card":
      return { title: "", body: "", ...p };
    case "image":
      return { fit: "cover", edit: false, ...p };
    case "camera":
      return { prompt: "Take a photo", facing: "back", scan: false, ...p };
    case "mic":
      return { prompt: "Tap and talk", auto: false, ...p };
    case "gallery":
      return { title: "", items: [], caps: [], layout: "row", pick: false, submit: "Done", ...p };
    case "video":
      return { loop: false, auto: false, mute: false, ...p };
    case "compare":
      return { title: "", mode: "slider", labels: ["Before", "After"], notes: [], hl: [], pick: false, ...p };
    case "storyboard":
      return { title: "", frames: [], notes: [], reorder: false, comment: true, ...p };
    case "chart":
      return { type: "line", title: "", x: [], names: [], unit: "", stack: false, ...p };
    case "stat":
      return { label: "", unit: "", good: "up", ...p };
    case "math":
      return { tex: "", size: "md", ...p };
    case "step":
      return { text: "", all: false, ...p };
    case "calc":
      return { title: "", digits: 3, ...p };
    case "deck":
      return { title: "", layout: "slides", full: false, notes: false, ...p };
    case "page":
      return { title: "", body: "", points: [], notes: "", ...p };
    case "plan":
      return { title: "", submit: "Send", review: true, ...p };
    case "project":
      return { title: "", body: "", facts: [], next: [], status: "", ...p, cta: p.cta ?? (p.open ? "Open" : "") };
    case "narrate":
      return { title: "", voice: "agent", rate: 1, auto: false, captions: true, ...p };
    default:
      return p;
  }
}

// ---------- screen state ----------
// Reduces ops into screens. Components keep their key across patches so a
// live timer keeps ticking when "~timer rounds=10" lands.

// `stage` is true while the stage is open over the chat. Staged components
// stay on their own screen with `stage: true`; renderers draw them on the stage.
export function initialState() {
  return { focus: "1", screens: { "1": [] }, saved: {}, errors: [], customs: [], stage: false };
}

export function apply(state, op, style = {}) {
  const s = { ...state, screens: { ...state.screens } };
  const scr = (k) => (s.screens[k] = s.screens[k] ? [...s.screens[k]] : []);
  switch (op.op) {
    case "focus":
      s.focus = op.screen; scr(op.screen);
      if (op.screen === "full") s.stage = true;
      break;
    case "close":
      s.stage = false; s.focus = "1"; scr("1"); break;
    case "add": {
      s.seq = (s.seq || 0) + 1;
      const head = op.in && Object.values(s.screens).flat().find((c) => c.id === op.in);
      // A theme line earlier in the reply wins over the stored style profile.
      const stage = head ? !!head.stage : onStage(op, { ...style, ...(s.theme || {}) });
      if (stage) s.stage = true;
      scr(op.screen).push({ key: `${op.id}`, id: op.id, preset: op.preset, props: op.props, seq: s.seq, ...(op.in ? { in: op.in } : {}), ...(stage ? { stage } : {}) });
      if (op.preset === "custom") s.customs = [...s.customs, op.line.trim()];
      s.focus = op.screen;
      break;
    }
    case "patch": {
      // Newest matching component on any screen wins.
      let hit = null;
      for (const [k, list] of Object.entries(s.screens)) {
        list.forEach((c, i) => {
          if ((c.id === op.target || c.preset === op.target) && (!hit || c.seq > hit.c.seq)) hit = { k, i, c };
        });
      }
      if (hit) {
        const next = [...s.screens[hit.k]];
        next[hit.i] = { ...hit.c, props: { ...hit.c.props, ...op.props } };
        s.screens[hit.k] = next;
      } else s.errors = [...s.errors, `patch: no live "${op.target}" on screen`];
      break;
    }
    case "save": {
      // The shelf: newest save wins, and a screen saved from the stage remembers it.
      s.seq = (s.seq || 0) + 1;
      s.saved = { ...s.saved, [op.name]: { nodes: s.screens[op.screen] || [], stage: op.screen === "full", at: s.seq } };
      break;
    }
    case "show": {
      const shot = s.saved[op.name];
      if (!shot) { s.errors = [...s.errors, `show: no saved screen "${op.name}"`]; break; }
      // Back fresh: new keys (timers start over, nothing answered), tagged with
      // the name so their events carry `saved`. Saved from the stage, back on it.
      const to = shot.stage ? "full" : op.screen;
      s.screens[to] = shot.nodes.map((n) => {
        s.seq = (s.seq || 0) + 1;
        const stage = to === "full" || !!n.stage;
        const { stage: _, ...rest } = n;
        return { ...rest, key: `${n.id}~${op.name}~${s.seq}`, seq: s.seq, saved: op.name, ...(stage ? { stage } : {}) };
      });
      if (s.screens[to].some((n) => n.stage)) s.stage = true;
      s.focus = to;
      break;
    }
    case "forget": {
      const { [op.name]: _, ...rest } = s.saved;
      s.saved = rest;
      break;
    }
    case "clear":
      s.screens[op.screen] = []; break;
    case "theme":
      s.theme = op.props.name ? { ...op.props } : { ...(s.theme || {}), ...op.props }; break;
    case "error":
      s.errors = [...s.errors, `${op.message}: ${op.line.trim()}`]; break;
  }
  return s;
}

// ---------- JSON equivalent (for the benchmark) ----------
// The same information as the YL, as the JSON an agent would otherwise emit.
// Only explicit props, so JSON gets the same defaults YL does.
export function toJSON(ops) {
  return ops.map((o) => {
    const scr = o.screen !== "1" ? { screen: isNaN(o.screen) ? o.screen : Number(o.screen) } : {};
    switch (o.op) {
      case "add":
        if (o.preset === "custom") return { type: "custom", ...scr, spec: o.props.spec };
        return { type: o.preset, ...(/^n\d+$/.test(o.id) ? {} : { id: o.id }), ...scr, ...(o.in ? { in: o.in } : {}), ...o.props };
      case "patch": return { patch: o.target, ...scr, ...o.props };
      case "save": return { save: o.name, ...scr };
      case "show": return { show: o.name, ...scr };
      case "forget": return { forget: o.name, ...scr };
      case "clear": return { clear: true, ...scr };
      case "end": return { end: o.target };
      case "theme": return { theme: o.props };
      case "focus": return { focus: Number(o.screen) || o.screen };
      case "close": return { close: true };
      default: return { error: o.message };
    }
  });
}
