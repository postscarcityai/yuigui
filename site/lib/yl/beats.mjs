// Beats (DLG-2, docs/plans/dialogue-stage.md section 4): how a reply plays as a dialogue. A reply (plain text, Yui
// Lines, or text with ```yui blocks) comes in; a run of beats and the anchors they pin come out:
//
//   beats(reply, { prev, known, yl }) -> {
//     beats:   [{ line, anchor?, pic?, patch?, wait?, cues? }],
//     anchors: [{ text, sub?, to?, marked, beat }],   the ledger after this reply, carried ones first (beat -1)
//     plan, questions, ids, marks, errors }
//
// line: the words the voice speaks (null when the beat only shows). anchor: the main point it pins. pic: the add that
// draws (a group head; its members carry `in`). patch: the ~patches that play when the line is spoken. wait: a
// waypoint, { id, q, options, into, bare?, auto?, marks?, chips? }. cues: a film's api.say lines (section 4 rule 4).
// plan and questions: a plan, and forms, mic and camera, still gather to one screen at the end (rule 3).
// ids and marks (label -> id) last into follow-ups: pass the result back as `prev` so a later reply can patch ~ra,
// draw a wait into a mark from an earlier reply, and never pin an anchor twice.
//
// The rules, in order of the plan:
//  1. Plain text: each sentence is a spoken line, and two pair into one beat when the second is under 12 words. A
//     `Label: value` line is an anchor. A `say` of 8 words or fewer is an anchor (one sentence, not a question). A paragraph of 2 or more sentences
//     pins its first sentence's first clause. A `page` (or a heading) title is an anchor, its body the spoken lines.
//  2. A picture attaches to the beat before it, when that beat has none. A ~patch attaches to the beat before it.
//  3. choose, pick, ask and slide are waypoints where they stand. A plan still gathers to one screen.
//  4. A motion film is a beat whose picture runs on the film clock; its api.say cues are the spoken lines.
// Marked: a reply with any `anchor` line pins only what it marks, so its says are spoken lines only (DLG-1 note 1).
// `anchor` and `wait` are read here until the parser learns them (DLG-4). The app mirrors this in StageChunks (DLG-7).

import { Parser, pageOf, tokenize } from "./yl.mjs";
import { splitSentences } from "./chunks.mjs";
import { lead, plainText, readInline, readText } from "./readtext.mjs";

export const ANCHOR_WORDS = 8;   // an anchor is four to eight words; longer is a sentence, not a point
export const PAIR_UNDER = 12;    // a second sentence this short rides in the first one's beat
export const MAX_ANCHORS = 8;    // on screen at once; past it the oldest fold into a count (the renderer's job)
export const AUTO_WAIT = 12;     // beats in a row with no waypoint before a bare wait is put in
export const WAIT_AFTER = 6;     // seconds a bare wait holds before the flow goes on (Chris 2026-10-25)
// Waypoints where they stand (rule 3). Forms, the mic and the camera are not a dialogue: they gather with a plan.
export const WAYPOINTS = new Set(["choose", "pick", "ask", "slide"]);
const GATHER = new Set(["form", "mic", "camera"]);
// Groups whose members are their own beats (a deck's pages) or gather (a plan's questions); every other group is a
// drawing, and its members are its marks.
const FLOWS = new Set(["deck", "plan"]);
const DIALOGUE = /^(anchor|wait)(@[\w-]+)?(\s|$)/;
const FENCE = /```(?:yui|yl)[^\n]*\n([\s\S]*?)(?:```|$)/g;

const words = (s) => String(s || "").trim().split(/\s+/).filter(Boolean).length;
const flat = (s) => readInline(String(s)).map((x) => x.text).join("");
const bare = (s) => flat(s).trim().replace(/[.!?…]+$/, "").trim();
const same = (a, b) => String(a).trim().toLowerCase() === String(b).trim().toLowerCase();

// The first clause of a sentence, up to its first comma, colon, semicolon or dash, when it is a point (8 words or
// fewer). "The heart is two pumps, side by side." -> "The heart is two pumps".
export function firstClause(sentence) {
  const s = bare(sentence);
  const c = s.split(/\s*(?:[,;:]|\s[-–—]\s|[–—])\s*/)[0].trim();
  return c && words(c) <= ANCHOR_WORDS ? c : null;
}

// A reply's parts in order: { text } and { yl }. A reply with no fence is Yui Lines when every line of it reads as
// Yui Lines (or `opts.yl`), else plain text.
export function replyParts(reply, yl, known = {}) {
  const s = String(reply || "");
  FENCE.lastIndex = 0;
  if (!FENCE.test(s)) return !s.trim() ? [] : (yl === true || (yl !== false && isLines(s, known))) ? [{ yl: s }] : [{ text: s }];
  const out = [];
  let at = 0, m;
  FENCE.lastIndex = 0;
  while ((m = FENCE.exec(s))) {
    const before = s.slice(at, m.index).trim();
    if (before) out.push({ text: before });
    if (m[1].trim()) out.push({ yl: m[1] });
    at = FENCE.lastIndex;
  }
  const rest = s.slice(at).replace(/```\w*\s*$/, "").trim();
  if (rest) out.push({ text: rest });
  return out;
}

function isLines(s, known) {
  const p = new Parser(known);
  let any = false;
  for (const src of s.split("\n")) {
    const t = src.trim();
    if (!t || /^#(\s|$)/.test(t)) continue;
    if (DIALOGUE.test(t) && !p.mot && !p.dgm && !p.flow) { any = true; continue; }
    const op = p.line(src);
    if (op && op.op === "error") return false;
    if (op) any = true;
  }
  return any;
}

function anchorLine(t) {
  const a = { text: "", marked: true };
  for (const k of t.slice(1)) {
    if (k.key === "sub" || k.key === "to") a[k.key] = Array.isArray(k.value) ? k.value.join("|") : k.value;
    else if (!a.text && k.quoted) a.text = k.text;
    else if (!a.text && !k.key) a.text = k.text;
  }
  return a;
}

function waitLine(t) {
  const w = { id: t[0].raw.split("@")[1] || null, q: null, options: [], into: false, marked: true };
  for (const k of t.slice(1)) {
    if (k.raw === "+in") w.into = true;
    else if (k.parts) w.options = k.parts;
    else if (k.quoted && w.q === null) w.q = k.text;
  }
  if (!w.q && !w.options.length) { w.bare = true; w.after = WAIT_AFTER; }
  return w;
}

// api.say("...") cues in a film's source, in order.
export function filmCues(source) {
  const out = [];
  const re = /api\.say\(\s*(["'`])((?:\\.|(?!\1).)*)\1/g;
  let m;
  while ((m = re.exec(String(source || "")))) out.push(m[2].replace(/\\(.)/g, "$1"));
  return out;
}

export function beats(reply, opts = {}) {
  const prev = opts.prev || null;
  const known = new Map(prev ? Object.entries(prev.ids || {}) : []);
  for (const [k, v] of Object.entries(opts.known || {})) known.set(k, v);
  const marks = new Map(prev ? Object.entries(prev.marks || {}) : []);
  const carried = prev ? prev.anchors.map((a) => ({ ...a, beat: -1 })) : [];
  const parts = replyParts(reply, opts.yl, known);
  const marked = parts.some((p) => p.yl && p.yl.split("\n").some((l) => /^anchor(\s|$)/.test(l.trim())));

  const out = [], fresh = [], errors = [], questions = [];
  const heads = new Map(); // id -> add, this reply's
  const films = new Map(); // motion id -> its beat
  let plan = null, pending = [];
  const cur = () => out[out.length - 1] || null;
  const start = (line) => {
    const b = { line: line || null };
    out.push(b);
    if (pending.length) { const a = pending.shift(); pinTo(b, a); }
    return b;
  };
  // An anchor goes on the beat; a beat pins one, so a second gets a beat of its own that shows it with no line.
  const pinTo = (b, a) => {
    if (!a || !a.text) return;
    if (carried.concat(fresh).some((x) => same(x.text, a.text))) return; // a continuation never resends an anchor
    if (words(a.text) > ANCHOR_WORDS) errors.push(`anchor "${a.text}": ${words(a.text)} words, ${ANCHOR_WORDS} at most`);
    if (b.anchor) { if (!a.marked) return; b = start(null); } // an inferred point never makes a beat of its own
    b.anchor = a;
    fresh.push({ ...a, beat: out.indexOf(b) });
  };
  const infer = (text) => (!marked && text && words(text) <= ANCHOR_WORDS ? { text, marked: false } : null);
  const waypoint = (w) => { let b = cur(); if (!b || b.wait) b = start(null); b.wait = w; };
  const lines = (text, anchor) => {
    // Sentences, two to a beat when the second is short; the first beat pins `anchor`.
    const s = splitSentences(text).map((x) => x.trim()).filter(Boolean);
    for (let i = 0; i < s.length; i++) {
      let line = s[i];
      if (i + 1 < s.length && words(s[i + 1]) < PAIR_UNDER) line += " " + s[++i];
      const b = start(line);
      if (anchor) { pinTo(b, anchor); anchor = null; }
    }
  };

  const prose = (text) => {
    for (const blk of readText(text)) {
      if (blk.t === "h") { const a = infer(bare(plainOf(blk.inline))); if (a) pending.push(a); else lines(plainOf(blk.inline)); continue; }
      if (blk.t === "kv") { const line = `${blk.label}: ${plainOf(blk.value)}`; pinTo(start(line), labelAnchor(blk.label, line)); continue; }
      if (blk.items) {
        for (const it of blk.items) {
          const line = plainOf(it), kv = lead(line);
          const b = start(line);
          if (kv) pinTo(b, labelAnchor(kv.label, line));
        }
        continue;
      }
      const para = plainOf(blk.inline);
      const n = splitSentences(para).filter((x) => x.trim()).length;
      lines(para, n >= 2 ? infer(firstClause(splitSentences(para)[0])) : null);
    }
  };
  // A short say is a point when it is one sentence and not a question ("Thursday works. Which slot?" is not).
  const point = (t) => (splitSentences(t.trim()).length === 1 && !/\?\s*$/.test(t) ? infer(bare(t)) : null);
  const labelAnchor = (label, line) => infer(bare(line)) || infer(bare(label));

  const op1 = (op) => {
    if (op.op === "error") { errors.push(op.message); return; }
    if (op.screen && pageOf(op.screen) !== 1) return; // the agent's own pages are not the turn's story
    if (op.op === "patch") {
      const film = films.get(op.target);
      if (film && op.props.source !== undefined) { film.cues = filmCues(op.props.source); if (film.cues.length) film.line = film.cues.join(" "); return; }
      let b = cur(); if (!b) b = start(null);
      (b.patch = b.patch || []).push(op);
      return;
    }
    if (op.op !== "add") return;
    heads.set(op.id, op);
    const h = op.in ? heads.get(op.in) : null;
    const hp = h ? h.preset : op.in ? known.get(op.in) : null;
    if (op.in && !FLOWS.has(hp)) { const l = op.props.label || op.props.text || op.props.title; if (l) marks.set(String(l), op.id); return; }
    if (hp === "plan") { if (WAYPOINTS.has(op.preset) || GATHER.has(op.preset)) { plan.questions.push(op); questions.push(op); return; } }
    if (op.preset === "deck") return;
    if (op.preset === "plan") { plan = { id: op.id, title: op.props.title || null, questions: [] }; return; }
    if (op.preset === "say") { const t = op.props.text || ""; pinTo(start(t), point(t)); return; }
    if (op.preset === "page") {
      const title = op.props.title || "", body = op.props.body ? plainText(op.props.body) : "";
      const a = !marked && title ? { text: bare(title), marked: false } : null;
      if (body) lines(body, a); else pinTo(start(title || null), a);
      return;
    }
    if (WAYPOINTS.has(op.preset)) {
      waypoint({ id: op.id, q: op.props.q || op.props.label || op.props.title || null, options: op.props.options || [], into: false, marked: false });
      return;
    }
    if (GATHER.has(op.preset)) { questions.push(op); return; }
    if (op.preset === "motion") { const b = start(null); b.pic = op; films.set(op.id, b); return; }
    // A picture, or anything else that shows (a timer, a game): the beat before takes it when it has none.
    const b = cur();
    if (b && !b.pic && !b.wait) b.pic = op; else start(null).pic = op;
  };

  for (const part of parts) {
    if (part.text) { prose(part.text); continue; }
    const p = new Parser(known);
    for (const src of part.yl.split("\n")) {
      const t = src.trim();
      if (DIALOGUE.test(t) && !p.mot && !p.dgm && !p.flow) {
        const tok = tokenize(t);
        if (tok[0].raw.startsWith("anchor")) { const a = anchorLine(tok); const b = cur(); if (b) pinTo(b, a); else pending.push(a); }
        else waypoint(waitLine(tok));
        continue;
      }
      const op = p.line(src);
      if (op) op1(op);
    }
    const tail = p.finish();
    if (tail) op1(tail);
    for (const [id, preset] of p.ids) known.set(id, preset);
  }
  while (pending.length) pinTo(start(null), pending.shift());

  // A long run with nothing to answer gets a bare wait, so a text bomb does not talk for a minute (section 10).
  let run = 0;
  for (const b of out) {
    run = b.wait ? 0 : run + 1;
    if (run === AUTO_WAIT) { b.wait = { id: null, q: null, options: [], into: false, bare: true, after: WAIT_AFTER, auto: true, marked: false }; run = 0; }
  }
  // +in: the options that name a mark (this reply's or an earlier one's) are drawn into the picture; the rest are chips.
  for (const b of out) {
    const w = b.wait;
    if (!w || !w.into) continue;
    w.marks = {}; w.chips = [];
    for (const o of w.options) {
      const hit = [...marks].find(([l]) => same(l, o));
      if (hit) w.marks[o] = hit[1]; else w.chips.push(o);
    }
  }
  return {
    beats: out,
    anchors: carried.concat(fresh),
    plan, questions,
    ids: Object.fromEntries(known),
    marks: Object.fromEntries(marks),
    errors,
  };
}

const plainOf = (inline) => inline.map((x) => x.text).join("").trim();

// A compact, JSON-stable view of a result for tests and the conformance vectors (spec/conformance/beats.json).
export function beatsView(r) {
  const v = {
    beats: r.beats.map((b) => {
      const o = {};
      if (b.line) o.line = b.line;
      if (b.anchor) o.anchor = b.anchor.sub || b.anchor.to ? { text: b.anchor.text, ...(b.anchor.sub && { sub: b.anchor.sub }), ...(b.anchor.to && { to: b.anchor.to }) } : b.anchor.text;
      if (b.pic) o.pic = `${b.pic.preset}@${b.pic.id}`;
      if (b.patch) o.patch = b.patch.map((p) => p.target);
      if (b.wait) {
        const w = b.wait, x = {};
        for (const k of ["id", "q"]) if (w[k]) x[k] = w[k];
        if (w.options.length) x.options = w.options;
        for (const k of ["into", "bare", "auto"]) if (w[k]) x[k] = true;
        if (w.marks) { x.marks = w.marks; x.chips = w.chips; }
        o.wait = x;
      }
      return o;
    }),
    anchors: r.anchors.map((a) => a.text),
  };
  if (r.plan) v.plan = { id: r.plan.id, questions: r.plan.questions.map((q) => q.id) };
  const loose = r.questions.filter((q) => !r.plan || !r.plan.questions.includes(q));
  if (loose.length) v.questions = loose.map((q) => q.id);
  if (r.errors.length) v.errors = r.errors.length;
  return v;
}
