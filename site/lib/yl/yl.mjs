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
//                                             `theme app ...`: props.scope "app", a restyle of Yui's own
//                                             chrome the person previews and applies (never silent)
//   { op: "close", screen: "full", line }     `close` or bare ">chat": close the stage, back to screen 1
//   { op: "talk",  screen, props: { on }, line }  `>2 talk`: page 2 keeps the composer (`talk off` takes it away)
//   { op: "menu",  screen, id, props: { bucket, label, sub?, say?, show?, url? }, line }
//                                             an item in the agent's drawer (`menu done id`: props { done: true })
//   { op: "table", screen, name, cols: [{ name, type, unit? }], line }  `table create`: an agent table on the phone (spec/TABLES.md)
//   { op: "put",   screen, table, key?, values, delete?, line }  upsert one row of an agent table by key
//   { op: "error", screen, message, line }
// A `flow` head is an add; the Mermaid lines after it are buffered and its
// `end` (or the end of the input) gives one patch on the flow with the graph
// (spec/FLOWS.md). Call finish() after the last line (parse and flush do).
// `props` holds only what the line actually said. Defaults live in resolve().
// An add that joins an open group (a page under a deck) also carries `in`,
// the group's id.

import { emptyStore, write as writeTable } from "./tables.mjs";
import { FONTS, MOTIONS, PAPERS, RADII, SETS, WEIGHTS } from "./look.mjs";

export const PRESETS = [
  "timer", "ask", "choose", "pick", "slide", "form",
  "list", "table", "card", "image", "camera", "mic",
  "gallery", "video", "compare", "storyboard",
  "chart", "stat", "math", "step", "calc",
  "deck", "page", "plan", "project", "narrate",
  "timeline", "done", "now", "next",
  "sketch", "row", "after",
  "shapes", "shape",
  "game", "flow",
  "query",
];
// Not presets, but valid line heads.
export const CORE = ["say", "custom", "save", "show", "forget", "clear", "end", "theme", "close", "talk", "menu", "put"];

// Groups: a group head collects the lines that follow it on the same screen,
// as long as each one is a member preset. Anything else ends the group, and
// so does `end`. Comments, blank lines and error lines do not. A narrate
// can hold another group (a deck), a deck or plan a sketch (a page's picture).
export const GROUPS = {
  deck: ["page", "ask", "choose", "pick", "sketch"],
  plan: ["page", "ask", "choose", "pick", "slide", "form", "mic", "camera", "sketch"],
  narrate: ["page", "compare", "image", "video", "card", "stat", "chart", "math", "storyboard", "gallery", "deck"],
  timeline: ["done", "now", "next"],
  sketch: ["row", "after"],
  shapes: ["shape"],
};

// A timeline's rows. A patch's `kind=` moves one to another of these.
export const ROWS = GROUPS.timeline;

// Where the now marker sits in a timeline's rows (in line order): before the
// first row that is not done, or after the last row when all are done.
export function markAt(rows) {
  const at = rows.findIndex((r) => r.preset !== "done");
  return at < 0 ? rows.length : at;
}

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
  // query <table> [as table|list|chart|stat|send] [chart type] [title...]
  // (spec/TABLES.md). The first bare word is the table, `as` picks the view.
  query(pos) {
    const o = {};
    const rest = [];
    const bare = (t) => t && !t.quoted && !t.parts;
    for (let i = 0; i < pos.length; i++) {
      const t = pos[i];
      if (o.table === undefined && bare(t)) { o.table = t.text; continue; }
      if (bare(t) && t.text === "as" && bare(pos[i + 1]) && QUERY_VIEWS.includes(pos[i + 1].text)) {
        o.as = pos[++i].text;
        if (o.as === "chart" && bare(pos[i + 1]) && CHART_TYPES.includes(pos[i + 1].text)) o.type = pos[++i].text;
        continue;
      }
      rest.push(t);
    }
    if (rest.length) o.title = joinText(rest);
    return o;
  },

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
  flow(pos) { return P.calc(pos); },
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

  // timeline [title...], then one row per line: done / now / next text...
  // [https://link]. The first https token is the row's url, the rest its text.
  timeline(pos) { return P.calc(pos); },
  done(pos) {
    const o = {};
    const text = [];
    for (const t of pos) {
      if (o.url === undefined && !t.parts && !t.quoted && /^https:\/\//.test(t.text)) o.url = t.text;
      else text.push(t);
    }
    if (text.length) o.text = joinText(text);
    return o;
  },
  now(pos) { return P.done(pos); },
  next(pos) { return P.done(pos); },

  // sketch [title...], then row text... lines (+x +hi +dim +button note=),
  // and at most one `after [label...]` that splits it into a before|after pair.
  sketch(pos) { return P.calc(pos); },
  row(pos) { return pos.length ? { text: joinText(pos) } : {}; },
  after(pos) { return pos.length ? { label: joinText(pos) } : {}; },

  // shapes [title...] (caption= w= h=), then `shape KIND [label...]` lines:
  // the first bare word is the kind, wherever it sits (as in game), the rest
  // is the label. Positions stay as written (at=2,3); the renderer reads them.
  shapes(pos) { return P.calc(pos); },
  shape(pos) {
    const o = {};
    const text = [];
    for (const t of pos) {
      if (o.kind === undefined && !t.parts && !t.quoted && GAME_WORD.test(t.text)) o.kind = t.text;
      else text.push(t);
    }
    if (text.length) o.label = joinText(text);
    return o;
  },

  // game KIND [title...]: the first bare word (not quoted, not options) is
  // the kind, wherever it sits; the rest is the title.
  game(pos) {
    const o = {};
    const text = [];
    for (const t of pos) {
      if (o.kind === undefined && !t.parts && !t.quoted && GAME_WORD.test(t.text)) o.kind = t.text;
      else text.push(t);
    }
    if (text.length) o.title = joinText(text);
    return o;
  },
};

const GAME_WORD = /^[a-z][a-z0-9_-]*$/i;
// Game kinds this renderer can play. Any other kind still parses; the
// renderer says the game is not in this version (spec section 4, game).
export const GAMES = ["tictactoe", "snake", "memory"];

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
  query: ["where", "sort", "cols", "y", "sum", "avg", "min", "max", "names", "color"],
  page: ["points"],
  project: ["facts", "next"],
  pick: ["answer"],
  game: ["items"],
  shape: ["pts"],
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
// Tic-tac-toe cells: x=5|1 o=9. Always a list of numbers; a part that is
// not a number is dropped, so x=5 is [5] and x= is dropped (empty lists are).
function cellList(v) {
  return (Array.isArray(v) ? v : [v]).filter((c) => typeof c === "number" || (typeof c === "string" && NUM.test(c))).map(Number);
}
function normalize(preset, o) {
  for (const k of LISTS[preset] || []) if (o[k] !== undefined && o[k] !== true) o[k] = asList(o[k]);
  if (preset === "compare" && o.hl !== undefined) o.hl = boxes(o.hl);
  if (preset === "game") for (const k of ["x", "o"]) if (o[k] !== undefined) o[k] = cellList(o[k]);
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

// ---------- flows (spec/FLOWS.md) ----------
// A flow is a Mermaid flowchart between `flow` and `end`. Each node can carry
// one step (a YL line), in a `%% node: <line>` comment or as its label; edge
// labels are conditions on earlier answers. Only the subset below is read;
// any other Mermaid line (style, classDef, click...) is kept in `source` and
// otherwise ignored, so the chart still renders anywhere Mermaid does.

// Presets a flow step can be.
export const FLOW_STEPS = ["page", "ask", "choose", "pick", "slide", "form", "mic", "camera"];
const FLOW_HEADER = /^(flowchart|graph)(\s|$)/;
const FLOW_SKIP = /^(classDef|class|style|linkStyle|click|direction|accTitle|accDescr)(\s|:|$)/;
const STEP_LINE = new RegExp(`^(${FLOW_STEPS.join("|")})(?=\\s|$)`);
const NODE_ID = /^\w+/;
// Node shapes, longest opener first. Each opener lists its closers.
const SHAPES = [
  ["(((", [")))"]], ["([", ["])"]], ["[[", ["]]"]], ["[(", [")]"]], ["((", ["))"]], ["{{", ["}}"]],
  ["[/", ["/]", "\\]"]], ["[\\", ["\\]", "/]"]], ["[", ["]"]], ["(", [")"]], ["{", ["}"]], [">", ["]"]],
];
// Links: `-- text -->` first, then plain arrows with an optional |label|.
const TEXT_LINK = /^\s*<?(?:--|==|-\.)(?![->=.])\s*(.*?)\s*(?:-{2,}>|={2,}>|\.-+>|-{3,}|={3,}|\.-+)(?=[\s\w])/;
const LINK = /^\s*(<?)(-{2,}>|-{3,}|={2,}>|={3,}|-\.+->|-\.+-|--[ox]|==[ox]|~{3,})/;
const PIPE = /^\s*\|([^|]*)\|/;

function newFlow(head, header) {
  return { id: head.id, screen: head.screen, src: [...head.pre, header], depth: 0, dir: (header.trim().split(/\s+/)[1] || "TD").toUpperCase(), nodes: new Map(), edges: [], steps: new Map() };
}

// Mermaid label text: quotes, markdown backticks, entity codes and <br> undone.
function unlabel(s) {
  let t = s.trim();
  if (/^".*"$/s.test(t)) t = t.slice(1, -1);
  if (/^`.*`$/s.test(t)) t = t.slice(1, -1);
  return t.replace(/<br\s*\/?>/gi, " ")
    .replace(/#(quot|amp|lt|gt|nbsp|35);/g, (_, k) => ({ quot: '"', amp: "&", lt: "<", gt: ">", nbsp: " ", 35: "#" })[k])
    .replace(/#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .trim();
}

// A step from a YL line, or null when the line is not a flow step.
function stepOf(text) {
  const m = text.match(STEP_LINE);
  if (!m) return null;
  return { preset: m[1], props: parseArgs(m[1], tokenize(text.slice(m[0].length))) };
}

// Splits a Mermaid line on ";" outside quotes and brackets.
function statements(line) {
  const out = [];
  let cur = "", q = false, depth = 0;
  for (const c of line) {
    if (c === '"') q = !q;
    else if (!q && "[({".includes(c)) depth++;
    else if (!q && "])}".includes(c)) depth = Math.max(0, depth - 1);
    if (c === ";" && !q && !depth) { out.push(cur); cur = ""; } else cur += c;
  }
  out.push(cur);
  return out.map((x) => x.trim()).filter(Boolean);
}

// Reads one node at the start of `s`: id, then an optional shape with a label.
// Returns { id, label?, rest } or null.
function readNode(s) {
  const m = s.match(NODE_ID);
  if (!m) return null;
  let rest = s.slice(m[0].length);
  const node = { id: m[0] };
  const shape = SHAPES.find(([open]) => rest.startsWith(open));
  if (shape) {
    const [open, closers] = shape;
    let body = rest.slice(open.length);
    let end = -1, len = 0;
    const from = body.trimStart().startsWith('"') ? body.indexOf('"', body.indexOf('"') + 1) + 1 : 0;
    for (const c of closers) {
      const i = body.indexOf(c, Math.max(0, from));
      if (i >= 0 && (end < 0 || i < end)) { end = i; len = c.length; }
    }
    if (end < 0) return null;
    node.label = unlabel(body.slice(0, end));
    rest = body.slice(end + len);
  }
  rest = rest.replace(/^:::\w+/, "");
  return { ...node, rest };
}

// A node, or several joined with "&".
function readNodes(s) {
  const out = [];
  let rest = s.trimStart();
  for (;;) {
    const n = readNode(rest);
    if (!n) return out.length ? { nodes: out, rest } : null;
    out.push(n);
    rest = n.rest;
    const amp = rest.match(/^\s*&\s*/);
    if (!amp) return { nodes: out, rest };
    rest = rest.slice(amp[0].length);
  }
}

function addNode(f, n) {
  const had = f.nodes.get(n.id);
  if (!had) f.nodes.set(n.id, { id: n.id, ...(n.label !== undefined ? { label: n.label } : {}), order: f.nodes.size });
  else if (n.label !== undefined) had.label = n.label;
}

// One Mermaid line of an open flow. Returns an error message or null.
function flowStatement(f, t) {
  if (!t) return null;
  if (t.startsWith("%%")) {
    if (t.startsWith("%%{")) return null; // a directive
    const m = t.match(/^%%\s*(\w+)\s*:\s*(.*)$/);
    if (!m) return null;
    const head = m[2].match(/^([a-z]+)(?=\s|$)/);
    if (head && PRESETS.includes(head[1]) && !FLOW_STEPS.includes(head[1])) return `flow: a ${head[1]} cannot be a step (${FLOW_STEPS.join(", ")})`;
    const step = stepOf(m[2]);
    if (step) f.steps.set(m[1], step);
    return null;
  }
  if (/^subgraph(\s|$)/.test(t)) { f.depth++; return null; }
  if (FLOW_SKIP.test(t) || FLOW_HEADER.test(t)) return null;
  for (const st of statements(t)) {
    let g = readNodes(st);
    if (!g) continue;
    g.nodes.forEach((n) => addNode(f, n));
    for (;;) {
      let rest = g.rest, label, hidden = false;
      const tl = rest.match(TEXT_LINK);
      if (tl) { label = tl[1]; rest = rest.slice(tl[0].length); }
      else {
        const l = rest.match(LINK);
        if (!l) break;
        hidden = l[2].startsWith("~");
        rest = rest.slice(l[0].length);
        const p = rest.match(PIPE);
        if (p) { label = p[1]; rest = rest.slice(p[0].length); }
      }
      const to = readNodes(rest);
      if (!to) break;
      to.nodes.forEach((n) => addNode(f, n));
      if (!hidden) {
        for (const a of g.nodes) for (const b of to.nodes) {
          const e = { from: a.id, to: b.id };
          const text = label === undefined ? "" : unlabel(label);
          if (text) e.label = text;
          f.edges.push(e);
        }
      }
      g = to;
    }
  }
  return null;
}

// Splits on a word (" or ") outside double quotes.
function splitWord(t, word) {
  const out = [];
  const re = new RegExp(`^\\s+${word}\\s+`, "i");
  let cur = "", q = false;
  for (let i = 0; i < t.length; i++) {
    if (t[i] === '"') q = !q;
    const m = !q && /\s/.test(t[i]) && t.slice(i).match(re);
    if (m) { out.push(cur); cur = ""; i += m[0].length - 1; continue; }
    cur += t[i];
  }
  out.push(cur);
  return out;
}

// Edge label -> condition: a list of alternatives ("or"), each a list of
// clauses that must all hold ("and"). null for a default edge.
const CLAUSE = /^([A-Za-z_]\w*(?:\.[\w-]+)*)\s*(>=|<=|!=|=|>|<|~)\s*(.*)$/;
export function flowWhen(label, from) {
  const t = (label || "").trim();
  if (!t || /^(else|default|otherwise)$/i.test(t)) return null;
  return splitWord(t, "or").map((alt) => splitWord(alt, "and").map((c) => {
    const m = c.trim().match(CLAUSE);
    const raw = m ? m[3].trim() : c.trim();
    const v = /^".*"$/.test(raw) ? raw.slice(1, -1) : NUM.test(raw) ? Number(raw) : raw;
    if (m) return { path: m[1], op: m[2], value: v };
    // A bare label ("Shop", "yes") is the answer of the step it leaves.
    return from ? { path: from, op: "=", value: v } : { op: "=", value: v };
  }));
}

// The graph a flow's end patches onto it.
function flowGraph(f) {
  const nodes = [...f.nodes.values()].map(({ order, ...n }) => {
    const said = f.steps.get(n.id);
    const step = said || (n.label !== undefined ? stepOf(n.label) : null);
    if (!step) return n;
    // A label that is the step's own line is not kept twice.
    const { label, ...rest } = n;
    return { ...(said ? n : rest), preset: step.preset, props: step.props };
  });
  const isStep = new Set(nodes.filter((n) => n.preset).map((n) => n.id));
  const into = new Set(f.edges.map((e) => e.to));
  const start = (nodes.find((n) => !into.has(n.id)) || nodes[0] || {}).id;
  const edges = f.edges.map((e) => {
    const when = flowWhen(e.label, isStep.has(e.from) ? e.from : null);
    return when ? { ...e, when } : e;
  });
  return clean({ dir: f.dir, start, nodes, edges, source: f.src.join("\n") });
}

// ---------- flow runtime ----------
// Pure helpers the renderers share: where Next goes, the path taken, and
// what goes in the event. `g` is a flow's props (resolve("flow", props)).

const isQuestion = (n) => n && n.preset && n.preset !== "page";
const low = (v) => (typeof v === "boolean" ? (v ? "yes" : "no") : String(v).trim().toLowerCase());
function num(v) {
  if (typeof v === "number") return v;
  if (typeof v === "string" && NUM.test(v.trim())) return Number(v.trim());
  return null;
}

// One clause against the answers. `last` is the question answered before a
// step-less node, for bare labels on its edges.
function clauseHolds(c, answers, last) {
  const parts = c.path ? c.path.split(".") : [last];
  let v = answers[parts[0]];
  for (const k of parts.slice(1)) v = v && typeof v === "object" ? v[k] : undefined;
  if (v === undefined || v === null || parts[0] == null) return c.op === "!=";
  const want = c.value;
  if (Array.isArray(v)) {
    const has = v.some((x) => low(x) === low(want));
    if (c.op === "=" || c.op === "~") return has;
    if (c.op === "!=") return !has;
    v = v.length;
  }
  const a = num(v), b = num(want);
  switch (c.op) {
    case "=": return a !== null && b !== null ? a === b : low(v) === low(want);
    case "!=": return a !== null && b !== null ? a !== b : low(v) !== low(want);
    case "~": return low(v).includes(low(want));
    default:
      if (a === null || b === null) return false;
      return c.op === ">" ? a > b : c.op === ">=" ? a >= b : c.op === "<" ? a < b : a <= b;
  }
}
export function flowTest(when, answers, last) {
  return !when || when.some((alt) => alt.every((c) => clauseHolds(c, answers, last)));
}

const nodeOf = (g, id) => (g.nodes || []).find((n) => n.id === id);

// The edge taken out of `from`: the first labelled edge that holds, else the
// first default edge. With `guess`, a question with no answer yet still takes
// a labelled edge that earlier answers already decide, else the default (or
// its first edge), to estimate what is left.
function edgeOut(g, answers, from, last, guess) {
  const out = (g.edges || []).filter((e) => e.from === from);
  const unknown = guess && isQuestion(nodeOf(g, from)) && answers[from] === undefined;
  const hit = out.find((e) => e.when && flowTest(e.when, answers, last));
  if (hit) return hit;
  return out.find((e) => !e.when) || (unknown ? out[0] : null) || null;
}

// The next step after `from`, passing through nodes with no step. null: the
// flow ends (the review comes next).
export function flowNext(g, answers, from, guess = false) {
  const seen = new Set([from]);
  let last = isQuestion(nodeOf(g, from)) ? from : null;
  let at = from;
  for (;;) {
    const e = edgeOut(g, answers, at, last, guess);
    if (!e || seen.has(e.to)) return null;
    const n = nodeOf(g, e.to);
    if (!n) return null;
    if (n.preset) return n.id;
    seen.add(n.id);
    at = n.id;
  }
}

// The first step: the start node, or the first step after it.
export function flowFirst(g) {
  const s = nodeOf(g, g.start);
  if (!s) return null;
  return s.preset ? s.id : flowNext(g, {}, s.id);
}

// The path the answers take from the start: step ids in order. It stops at
// the first question with no answer (`open`, not in the path) or at the end
// (`open` null). A step already on the path ends it: flows do not loop.
export function flowPath(g, answers) {
  const path = [];
  let at = flowFirst(g);
  while (at && !path.includes(at)) {
    if (isQuestion(nodeOf(g, at)) && answers[at] === undefined) return { path, open: at };
    path.push(at);
    at = flowNext(g, answers, at);
  }
  return { path, open: null };
}

// The steps still ahead of `from` (not counting it), guessing at branches
// not answered yet. For the progress bar.
export function flowAhead(g, answers, from) {
  const out = [];
  let at = from && flowNext(g, answers, from, true);
  while (at && !out.includes(at) && at !== from) { out.push(at); at = flowNext(g, answers, at, true); }
  return out;
}

// What a flow sends at submit: the answers of the questions on the path,
// keyed by step id, and the path itself (pages included).
export function flowEvent(g, answers) {
  const { path } = flowPath(g, answers);
  const flow = {};
  for (const id of path) if (isQuestion(nodeOf(g, id)) && answers[id] !== undefined) flow[id] = answers[id];
  return { flow, path };
}

// ---------- line parser ----------

// Stateful: remembers the focused screen and which preset each id belongs to,
// so "~hiit rounds=10" knows to parse its args as a timer. `known` is the ids
// that last from earlier replies (spec section 5, Ids that last), id -> preset,
// as `lastingIds(state)` gives them; this reply's own ids shadow them.
export class Parser {
  constructor(known = {}) {
    this.screen = "1";
    this.ids = new Map(known instanceof Map ? known : Object.entries(known || {})); // id -> preset
    this.auto = 0;
    this.open = []; // open groups, innermost last: { id, preset, screen }
    this.flowHead = null; // a flow head just added: { id, screen }
    this.flow = null; // an open flow's Mermaid, being read
  }

  // Group bookkeeping for one parsed op. Errors (and null) leave groups open.
  group(op) {
    // A theme line restyles the app, a menu line fills the drawer and a data
    // line (table create, put) writes to the phone, not the screen: they
    // leave groups alone.
    if (!op || op.op === "error" || op.op === "theme" || op.op === "menu" || op.op === "table" || op.op === "put") return op;
    // Closing the stage ends whatever group was open on it, like `>2` would.
    if (op.op === "close") { this.open = []; return op; }
    if (op.op === "end") {
      const g = this.open.pop();
      if (!g) return { op: "error", screen: op.screen, message: "end: no open deck, plan, narrate, timeline or sketch", line: op.line };
      return { ...op, target: g.id };
    }
    const joins = (g) => op.op === "add" && op.screen === g.screen && GROUPS[g.preset].includes(op.preset);
    while (this.open.length && !joins(this.open[this.open.length - 1])) this.open.pop();
    const g = this.open[this.open.length - 1];
    const out = g ? { op: op.op, screen: op.screen, preset: op.preset, id: op.id, in: g.id, props: op.props, line: op.line } : op;
    if (op.op === "add" && GROUPS[op.preset]) this.open.push({ id: op.id, preset: op.preset, screen: op.screen });
    return out;
  }

  line(src) {
    if (this.flow) return this.flowLine(src);
    if (this.flowHead) {
      // The line after a flow head decides: a Mermaid header starts the
      // chart (inline flow), anything else leaves it a saved flow by name.
      const t = src.trim();
      if (!t || /^#(\s|$)/.test(t)) return null;
      // Mermaid comments may come before the header.
      if (t.startsWith("%%")) { this.flowHead.pre.push(src.replace(/\r$/, "")); return null; }
      const h = this.flowHead;
      this.flowHead = null;
      if (FLOW_HEADER.test(t)) { this.flow = newFlow(h, src.replace(/\r$/, "")); return null; }
    }
    const op = this.group(this.parseLine(src));
    if (op && op.op === "add" && op.preset === "flow") this.flowHead = { id: op.id, screen: op.screen, pre: [] };
    return op;
  }

  // Ends the input: an open flow gives its graph now.
  finish() {
    this.flowHead = null;
    return this.flow ? this.flowDone("") : null;
  }

  // One line of an open flow: Mermaid, not YL. `end` closes a subgraph
  // first, then the flow.
  flowLine(src) {
    const f = this.flow;
    const line = src.replace(/\r$/, "");
    const t = line.trim();
    if (/^end\s*;?$/.test(t)) {
      if (f.depth > 0) { f.depth--; f.src.push(line); return null; }
      return this.flowDone(line);
    }
    f.src.push(line);
    const err = flowStatement(f, t);
    return err ? { op: "error", screen: f.screen, message: err, line } : null;
  }

  flowDone(line) {
    const f = this.flow;
    this.flow = null;
    return { op: "patch", screen: f.screen, target: f.id, props: flowGraph(f), line };
  }

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
      // ~preset@id (section 5): the id when this reply made it or it lasts, else the preset name.
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
      // A timeline row moves with `kind=` (YUI-111): done, now or next. The
      // row keeps its id and place; from here on the id is that preset.
      if (ROWS.includes(preset) && props.kind !== undefined) {
        if (!ROWS.includes(props.kind)) return { op: "error", screen, message: "patch: kind= is done, now or next", line };
        if (!ROWS.includes(target)) this.ids.set(target, props.kind);
      }
      return { op: "patch", screen, target, props, line };
    }

    if (head === "save" || head === "show" || head === "forget") {
      // The name is the rest of the line: `save leg day` is "leg day".
      const name = tokens.map((t) => t.text).filter(Boolean).join(" ");
      if (!name) return { op: "error", screen, message: `${head}: needs a name`, line };
      return { op: head, screen, name, line };
    }
    if (head === "menu") return menuLine(screen, tokens, line);
    if (head === "clear") return { op: "clear", screen, line };
    if (head === "end") return { op: "end", screen, line };
    if (head === "close") {
      if (tokens.length) return { op: "error", screen, message: "close: takes nothing else", line };
      this.screen = "1";
      return { op: "close", screen: "full", line };
    }
    if (head === "theme") {
      const t0 = tokens[0];
      if (t0 && !t0.key && !t0.quoted && !t0.parts && t0.text === "app") return appTheme(screen, tokens.slice(1), line);
      return { op: "theme", screen, props: parseArgs("theme", tokens), line };
    }
    if (head === "talk") {
      // `talk` or `talk on` turns the composer on for this page, `talk off` takes it away.
      const word = tokens.length === 0 ? "on" : tokens.length === 1 ? tokens[0].text : null;
      if (word !== "on" && word !== "off") return { op: "error", screen, message: "talk: takes nothing, on or off", line };
      return { op: "talk", screen, props: { on: word === "on" }, line };
    }

    // Agent tables (spec/TABLES.md): `table create` and `put` write to the phone.
    if (head === "put") return putLine(screen, tokens, line);
    if (/^table(@|$)/.test(head) && tokens.length && !tokens[0].quoted && !tokens[0].key && tokens[0].raw === "create") {
      if (head !== "table") return { op: "error", screen, message: "table create: takes no @id", line };
      return tableCreate(screen, tokens.slice(1), line);
    }

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

// ---------- menu (spec section 5, The drawer) ----------
// `menu review@dana "Invite Dana?" sub="requested yesterday"` puts an item in
// one of three drawer sections; `menu done dana` takes it out. No @id counter,
// no screen routing, no event of its own.
export const MENU_BUCKETS = ["review", "backlog", "shortcut"];
export const MENU_KEYS = ["sub", "say", "show", "url"];
export const MENU_MAX = 20;
export const MENU_LABEL = 60;

// An item with no @id is known by its label, lowercased, with every run of
// other characters as one "-": "Start today's workout" is start-today-s-workout.
export function menuId(label) {
  return String(label).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "item";
}

// `theme app [set] key=value...` (spec/YL.md, theme app): a restyle of Yui's
// own chrome, not the agent's look. Stricter than an agent's theme: the app
// shows the person exactly what will change before anything does, so an
// unknown set, key or value is an error line, never quietly dropped. Style
// profile keys belong to one agent, and there is no flag that skips the preview.
const APP_KEYS = {
  accent: (v) => /^#[0-9a-f]{6}$/i.test(v) || Object.hasOwn(SETS, v),
  bg: (v) => /^#[0-9a-f]{6}$/i.test(v) || Object.hasOwn(PAPERS, v),
  radius: (v) => RADII.includes(v),
  font: (v) => FONTS.includes(v),
  weight: (v) => WEIGHTS.includes(v),
  motion: (v) => MOTIONS.includes(v),
};
const STYLE_KEYS = ["screen", "gallery", "chart", "buttons"];
function appTheme(screen, tokens, line) {
  const bad = (message) => ({ op: "error", screen, message: `theme app: ${message}`, line });
  const props = { scope: "app" };
  const words = [];
  for (const t of tokens) {
    if (t.key) {
      const v = Array.isArray(t.value) ? t.value.join("|") : t.value;
      if (STYLE_KEYS.includes(t.key)) return bad(`${t.key}= is one agent's style, not the app's`);
      if (!APP_KEYS[t.key]) return bad(`unknown key ${t.key}=`);
      if (!APP_KEYS[t.key](v)) return bad(`${t.key}=${v} is not a value the app takes`);
      props[t.key] = v;
    } else if (!t.quoted && !t.parts && /^\+[a-z][\w-]*$/i.test(t.raw)) {
      return bad(`${t.raw} is not a flag here; the person always sees a preview first`);
    } else words.push(t.text);
  }
  if (words.length > 1) return bad(`one set name, not "${words.join(" ")}"`);
  if (words.length) {
    const name = words[0];
    if (name === "reset") {
      if (Object.keys(props).length > 1) return bad("reset takes nothing else");
    } else if (!Object.hasOwn(SETS, name)) return bad(`no set named ${name}`);
    props.name = name;
  }
  if (Object.keys(props).length === 1) return bad("needs a set name, reset or keys");
  return { op: "theme", screen, props, line };
}

function menuLine(screen, tokens, line) {
  const bad = (message) => ({ op: "error", screen, message, line });
  if (!tokens.length) return bad("menu: needs review, backlog, shortcut or done");
  const hm = tokens[0].raw.match(/^([a-z]+)(?:@([\w-]+))?$/);
  if (!hm || !(MENU_BUCKETS.includes(hm[1]) || (hm[1] === "done" && !hm[2]))) {
    return bad(`menu: "${tokens[0].raw}" is not review, backlog, shortcut or done`);
  }
  const rest = tokens.slice(1);
  if (hm[1] === "done") {
    // Same as a saved screen's name: the rest of the line. An id, or the label.
    const name = rest.map((t) => t.text).filter(Boolean).join(" ");
    if (!name) return bad("menu done: needs an id");
    return { op: "menu", screen, id: /^[\w-]+$/.test(name) ? name : menuId(name), props: { done: true }, line };
  }
  const props = { bucket: hm[1] };
  const words = [];
  for (const t of rest) {
    if (t.key) {
      if (MENU_KEYS.includes(t.key)) props[t.key] = Array.isArray(t.value) ? t.value.join("|") : t.value;
    } else if (!(!t.quoted && !t.parts && /^\+[a-z][\w-]*$/i.test(t.raw))) words.push(t.text);
  }
  const label = words.filter(Boolean).join(" ");
  if (!label) return bad("menu: needs a label");
  return { op: "menu", screen, id: hm[2] || menuId(label), props: { bucket: props.bucket, label, ...props }, line };
}

// The drawer's items after these ops, newest first in each section. A later
// item with the same id replaces it wherever it was; `menu done` removes it.
// Labels are cut at MENU_LABEL characters, and a section keeps MENU_MAX items.
export function menuOf(ops, menu = { review: [], backlog: [], shortcut: [] }) {
  let m = { review: [...menu.review], backlog: [...menu.backlog], shortcut: [...menu.shortcut] };
  for (const o of ops) {
    if (o.op !== "menu") continue;
    for (const b of MENU_BUCKETS) m[b] = m[b].filter((it) => it.id !== o.id);
    if (o.props.done) continue;
    const { bucket, label, ...rest } = o.props;
    const chars = [...label];
    const cut = chars.length > MENU_LABEL ? chars.slice(0, MENU_LABEL - 1).join("").trimEnd() + "\u2026" : label;
    m[bucket] = [{ id: o.id, label: cut, ...rest }, ...m[bucket]].slice(0, MENU_MAX);
  }
  return m;
}

// ---------- agent tables (spec/TABLES.md) ----------

export const TABLE_TYPES = ["text", "number", "date", "bool"];
export const QUERY_VIEWS = ["table", "list", "chart", "stat", "send"];
const TABLE_NAME = /^[A-Za-z][\w-]*$/;
const COL_DEF = /^([A-Za-z_][\w-]*):([a-z]+)(?::(\S+))?$/;

// table create <name> col:type ... (number columns may carry a unit: Cal:number:kcal)
function tableCreate(screen, tokens, line) {
  const bad = (message) => ({ op: "error", screen, message: `table create: ${message}`, line });
  const [nameTok, ...rest] = tokens;
  if (!nameTok || nameTok.quoted || nameTok.parts || nameTok.key || !TABLE_NAME.test(nameTok.raw)) return bad("needs a name, then col:type ...");
  if (!rest.length) return bad("needs at least one col:type");
  const cols = [];
  for (const t of rest) {
    const m = t.quoted || t.key ? null : t.raw.match(COL_DEF);
    if (!m) return bad(`"${t.raw}" is not col:type`);
    if (!TABLE_TYPES.includes(m[2])) return bad(`"${m[2]}" is not text, number, date or bool`);
    if (m[3] && m[2] !== "number") return bad(`only number columns take a unit ("${t.raw}")`);
    cols.push({ name: m[1], type: m[2], ...(m[3] ? { unit: m[3] } : {}) });
  }
  return { op: "table", screen, name: nameTok.raw, cols, line };
}

// put <table> [key] col=value ... [+delete]. Other flags set a bool column: +Done is Done=on.
function putLine(screen, tokens, line) {
  const { kv, flags, pos } = split(tokens);
  const bad = (message) => ({ op: "error", screen, message: `put: ${message}`, line });
  const [tableTok, keyTok, ...extra] = pos;
  if (!tableTok || tableTok.quoted || tableTok.parts || !TABLE_NAME.test(tableTok.raw)) return bad("needs a table name");
  if (extra.length) return bad("one key, then col=value ...");
  if (keyTok && keyTok.parts) return bad("a key has no |");
  const { delete: del, ...on } = flags;
  const values = { ...on, ...kv };
  const op = { op: "put", screen, table: tableTok.raw };
  if (keyTok) op.key = keyTok.text;
  if (del) {
    if (!keyTok) return bad("+delete needs a key");
    if (Object.keys(values).length) return bad("+delete takes no values");
    return { ...op, values: {}, delete: true, line };
  }
  if (!Object.keys(values).length) return bad("needs at least one col=value");
  return { ...op, values, line };
}

// Parse a whole document at once. `known`: ids that last (Parser above).
export function parse(text, known = {}) {
  const p = new Parser(known);
  const ops = text.split("\n").map((l) => p.line(l));
  ops.push(p.finish());
  return ops.filter(Boolean);
}

// Streaming: feed chunks as they arrive, get ops for every completed line.
// Lines render the moment their newline lands; flush() finishes the tail.
export class StreamParser {
  constructor(known = {}) { this.buf = ""; this.p = new Parser(known); }
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
    return [op, this.p.finish()].filter(Boolean);
  }
}

// ---------- the stage ----------
// The stage is a full-screen layer over the chat (spec section 5, The stage).
// These presets open there unless they say +inline.
export const STAGE = ["timer", "camera", "mic", "deck", "plan", "game", "flow"];

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
// The app shows the chat, then a page for each screen 2 to 12 with something
// on it (spec section 5, Pages). Every other screen name renders in the chat.
export const MAX_PAGE = 12;

export function pageOf(screen) {
  const n = Number(screen);
  return Number.isInteger(n) && String(n) === screen && n >= 2 && n <= MAX_PAGE ? n : 1;
}

// Ids that last (spec section 5): explicit ids on a page (2 to 12) or on a
// component that came back from a saved screen, id -> preset, newest last.
// Hand them to the next reply's parser so `~need-t_x +lock` can reach one
// component among many. Auto ids (n1, c2) restart every reply and never last.
export const AUTO_ID = /^[nc]\d+$/;

export function lastingIds(state) {
  const out = {};
  const all = Object.entries(state.screens || {}).flatMap(([k, list]) => list.map((c) => ({ k, c })));
  all.sort((a, b) => (a.c.seq || 0) - (b.c.seq || 0));
  for (const { k, c } of all) {
    if (AUTO_ID.test(c.id) || c.preset === "custom") continue;
    if (pageOf(k) !== 1 || c.saved) out[c.id] = c.preset;
  }
  return out;
}

// Chat with a screen (spec section 5, Pages): the pages whose composer is on
// after these ops, in number order. `talk` turns it on, `talk off` and `clear`
// take it away; only pages 2 to 12 have one to turn on.
export function talking(ops) {
  const on = new Set();
  for (const o of ops) {
    const n = pageOf(o.screen);
    if (n === 1) continue;
    if (o.op === "talk" && o.props.on) on.add(n);
    else if (o.op === "clear" || o.op === "talk") on.delete(n);
  }
  return [...on].sort((a, b) => a - b);
}

// What the person typed on a page, as the agent reads it (spec section 7):
// a `[yui] screen=2` line, then the words. Anywhere else the words go as they are.
export function typedBody(screen, words) {
  return pageOf(screen) === 1 ? words : `[yui] screen=${screen}\n${words}`;
}

// The other way: `{ screen, words }` for a message typed on a page, else null.
export function readTyped(body) {
  const m = /^\[yui\] screen=(\S+)\r?\n/.exec(body);
  if (!m || pageOf(m[1]) === 1) return null;
  return { screen: m[1], words: body.slice(m[0].length) };
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
    case "flow":
      return { title: "", submit: "Send", review: true, ...p };
    case "project":
      return { title: "", body: "", facts: [], next: [], status: "", ...p, cta: p.cta ?? (p.open ? "Open" : "") };
    case "narrate":
      return { title: "", voice: "agent", rate: 1, auto: false, captions: true, ...p };
    case "timeline":
      return { title: "", mark: "Now", fold: 5, reorder: false, ...p };
    case "done":
    case "now":
    case "next":
      return { text: "", ...p };
    case "sketch":
      return { title: "", frame: "window", before: "Before", ...p };
    case "row":
      return { text: "", ...p };
    case "query":
      return { table: "", as: "table", title: "", where: [], sort: [], ...p };
    case "after":
      return { label: "After", ...p };
    case "shapes":
      return { title: "", caption: "", w: 10, h: 6, ...p };
    case "shape": {
      const r = { label: "", ...p };
      r.kind = String(p.kind ?? "box").toLowerCase();
      return r;
    }
    case "game": {
      // Cells outside 1-9 are ignored, and a cell both marks claim is x's.
      const cells = (v) => [...new Set((v || []).filter((n) => Number.isInteger(n) && n >= 1 && n <= 9))];
      const r = { title: "", you: "x", first: "you", speed: 2, size: 15, pairs: 6, items: [], ...p };
      r.kind = String(p.kind ?? "").toLowerCase();
      r.x = cells(p.x);
      r.o = cells(p.o).filter((n) => !r.x.includes(n));
      return r;
    }
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
  return { focus: "1", screens: { "1": [] }, saved: {}, errors: [], customs: [], stage: false, talk: {}, menu: { review: [], backlog: [], shortcut: [] }, data: emptyStore() };
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
        // `kind=` on a row re-kinds it in place: same key and place, so the
        // now marker moves and nothing else does (YUI-111).
        const { kind, ...rest } = op.props;
        if (ROWS.includes(hit.c.preset) && ROWS.includes(kind)) next[hit.i] = { ...hit.c, preset: kind, props: { ...hit.c.props, ...rest } };
        else next[hit.i] = { ...hit.c, props: { ...hit.c.props, ...op.props } };
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
    case "clear": {
      s.screens[op.screen] = [];
      // An emptied page is gone, and its composer with it.
      const { [op.screen]: _, ...rest } = s.talk || {};
      s.talk = rest;
      break;
    }
    case "talk": {
      // Only pages (2 to 12) take it: the chat has its composer already.
      if (pageOf(op.screen) === 1) break;
      const { [op.screen]: _, ...rest } = s.talk || {};
      s.talk = op.props.on ? { ...rest, [op.screen]: true } : rest;
      break;
    }
    case "menu":
      s.menu = menuOf([op], s.menu || undefined); break;
    case "theme":
      // An app restyle is only a proposal until the person taps Apply: it
      // waits in `restyle` and leaves the agent's own look alone.
      if (op.props.scope === "app") { const { scope, ...rest } = op.props; s.restyle = rest; break; }
      s.theme = op.props.name ? { ...op.props } : { ...(s.theme || {}), ...op.props }; break;
    // Agent tables (spec/TABLES.md) live in the agent's store, not on a screen.
    // Every query on screen reads it, so a put redraws them. `style.today`
    // pins the date words for tests; otherwise it is this device's date.
    case "table":
    case "put": {
      const r = writeTable(s.data || emptyStore(), op, { today: style.today, now: style.now });
      s.data = r.store;
      if (r.error) s.errors = [...s.errors, `${r.error}: ${op.line.trim()}`];
      break;
    }
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
      case "talk": return { talk: o.props.on, ...scr };
      case "menu": return { menu: o.id, ...o.props };
      case "table": return { table: o.name, cols: o.cols };
      case "put": return { put: o.table, ...(o.key !== undefined ? { key: o.key } : {}), ...o.values, ...(o.delete ? { delete: true } : {}) };
      default: return { error: o.message };
    }
  });
}
