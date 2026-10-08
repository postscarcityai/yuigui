// YUI-331: drag a mark and the agent sees where you put it. A move is a change to the answer's own Yui Lines text, the way a hold's
// patch is (yl-patch.mjs): a list row, a timeline queue row or a bar changes place, a shape gets a new `at=`. The page builds a fresh
// film from the new text, so scrub, replay and the keyboard see the move as part of the drawing. Reset puts the first text back.
//   describe(film, text, id)   what a mark is as a mover, or null when it cannot move
//   plan(film, text, id, input, geo)   the new text, the line the app would send (`to=`), the new place, or null (nothing moved)
//   moveReplyFor(replies, sample, id, plan)   the canned agent answer for this drop, or null
//   settleGroups / settleFilm   the short ease where the mark lands and its neighbours reflow
// Movable: list rows, the `next` rows of a timeline (the queue), the bars of a bar chart (a bar and its goal bar move together), and
// the closed shapes of a `shapes` drawing that were placed with at=.
import { parse, tokenize } from "./yl/yl.mjs";

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const quote = (s) => '"' + String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
const bare = (s) => /^[^\s"|#]+$/.test(s);

let memo = { text: null, ops: null, idx: null };
function read(text) {
  if (memo.text !== text) {
    const r = parse(text), ops = (Array.isArray(r) ? r : r.ops || []).filter((o) => o.op === "add");
    const lines = text.split("\n"), at = new Map();
    let cur = 0;
    for (const o of ops) {
      if (typeof o.line !== "string") continue;
      const want = o.line.trim();
      for (let i = cur; i < lines.length; i++) if (lines[i].trim() === want) { at.set(o, i); cur = i + 1; break; }
    }
    memo = { text, ops, idx: { lines, at } };
  }
  return memo;
}

// ---- reading the text -----------------------------------------------------------------------------------------------------

// `list [title] "a" "b" | c +check`: the title token, the items, and the tokens that are not items. Null when it does not round-trip.
function listParts(op) {
  const toks = tokenize(op.line), pos = [], other = [];
  for (const t of toks.slice(1)) (t.key !== undefined || (!t.quoted && /^\+\w/.test(t.text)) ? other : pos).push(t);
  let title = null;
  if (pos.length && !pos[0].quoted && !pos[0].parts) title = pos.shift();
  const items = pos.flatMap((t) => (t.parts ? t.parts : [t.text]));
  if (JSON.stringify(items) !== JSON.stringify(op.props.items || [])) return null;
  return { head: toks[0].raw, title, items, other };
}
const listLine = (lp, items) => [lp.head, lp.title && lp.title.raw, ...items.map(quote), ...lp.other.map((t) => t.raw)].filter(Boolean).join(" ");

// `chart bar ... x=a|b y=1|2 y2=...`: every per-point value list is permuted together. Null when x is not written on the line.
function chartLine(op, perm) {
  const n = (op.props.x || []).length, toks = tokenize(op.line);
  if (!toks.some((t) => t.key === "x" && Array.isArray(t.value) && t.value.length === n)) return null;
  return toks.map((t) => {
    if (t.key === undefined || !Array.isArray(t.value) || t.value.length !== n) return t.raw;
    return t.key + "=" + perm.map((i) => (bare(t.value[i]) && !(t.vquoted && t.vquoted[i]) ? t.value[i] : quote(t.value[i]))).join("|");
  }).join(" ");
}

const stepsOf = (ops, fig) => ops.filter((o) => o.in === fig && ["done", "now", "next"].includes(o.preset));
const shapesFilmOf = (film) => (film && film.sc ? film : film && film.films ? film.films.find((f) => f.sc) : null);
const figOf = (film, fig) => {
  const fs = film.figs ? [film] : film.films || [];
  for (const f of fs) for (const g of f.figs || []) if (g.id === fig) return g;
  return null;
};

// What a mark is as a mover: { kind: "list" | "tl" | "bars" | "shape", fig, index, count, allowed?, item?, at?, label }
export function describe(film, text, id) {
  if (!film || !id || !text) return null;
  const { ops } = read(text);
  let m;
  if ((m = /^list:([^:]+):(\d+)$/.exec(id))) {
    const op = ops.find((o) => o.preset === "list" && o.id === m[1]), lp = op && listParts(op), i = +m[2];
    if (!lp || lp.items.length < 2 || i >= lp.items.length) return null;
    return { kind: "list", fig: m[1], index: i, count: lp.items.length, allowed: lp.items.map((_, k) => k) };
  }
  if ((m = /^tl:([^:]+):(\d+)$/.exec(id))) {
    const steps = stepsOf(ops, m[1]), i = +m[2];
    const allowed = steps.map((s, k) => (s.preset === "next" ? k : -1)).filter((k) => k >= 0);
    if (!steps[i] || steps[i].preset !== "next" || allowed.length < 2) return null;
    return { kind: "tl", fig: m[1], index: i, count: steps.length, allowed };
  }
  if ((m = /^chart:([^:]+):s(\d+):(\d+)$/.exec(id))) {
    const op = ops.find((o) => o.preset === "chart" && o.id === m[1]), i = +m[3];
    if (!op || op.props.type !== "bar" || !Array.isArray(op.props.x) || op.props.x.length < 2 || i >= op.props.x.length) return null;
    if (chartLine(op, op.props.x.map((_, k) => k)) === null) return null;
    return { kind: "bars", fig: m[1], index: i, series: +m[2], count: op.props.x.length, allowed: op.props.x.map((_, k) => k) };
  }
  const sf = shapesFilmOf(film);
  if (sf && sf.marks) {
    const mk = sf.marks.find((x) => x.id === id && x.item !== undefined), it = mk && sf.sc.items.find((x) => x.i === mk.item);
    if (!it || !it.at || it.mark || it.from || it.leader) return null;
    const head = ops.find((o) => o.preset === "shapes"), sh = head && ops.filter((o) => o.preset === "shape" && o.in === head.id)[mk.item];
    const tok = sh && tokenize(sh.line).find((t) => t.key === "at" && typeof t.value === "string" && /^-?[\d.]+,-?[\d.]+$/.test(t.value));
    if (!tok) return null;
    return { kind: "shape", item: mk.item, at: tok.value.split(",").map(Number), label: mk.label };
  }
  return null;
}

// The box that is lifted while a mark is carried, when the mark's own hit circle is the wrong shape: a bar lifts as its whole column
// (both bars of the day, the value and the day under it), a boxed shape as its box. null keeps the hit's own box.
export function liftBox(film, text, id, hit) {
  const d = describe(film, text, id);
  if (!d) return null;
  if (d.kind === "bars") {
    const g = (figOf(film, d.fig) || {}).geo; if (!g) return null;
    const sw = (g.px1 - g.px0) / d.count, y0 = g.py0 - 28 + g.dy, y1 = g.py1 + 26 + g.dy;
    return { x: g.px0 + (d.index + 0.5) * sw, y: (y0 + y1) / 2, w: sw - 6, h: y1 - y0 - 8, auto: true };
  }
  if (d.kind === "shape") {
    const sf = shapesFilmOf(film), it = sf.sc.items.find((x) => x.i === d.item);
    if (!hit || !sf.xf || !["box", "pill"].includes(it.kind)) return null;
    return { x: hit.x, y: hit.y, w: it.size[0] * sf.xf.s + 10, h: it.size[1] * sf.xf.s + 10, auto: true };
  }
  return null;
}

// ---- planning a drop --------------------------------------------------------------------------------------------------------

const idOf = (d, i, series) => (d.kind === "list" ? `list:${d.fig}:${i}` : d.kind === "tl" ? `tl:${d.fig}:${i}` : `chart:${d.fig}:s${series || 0}:${i}`);
const groupRe = (d) => (d.kind === "list" ? new RegExp(`^list:${d.fig}:(\\d+)$`) : d.kind === "tl" ? new RegExp(`^tl:${d.fig}:(\\d+)$`) : new RegExp(`^chart:${d.fig}:s\\d+:(\\d+)$`));
// where each index sits on the screen now: the middle of its hits along the axis the group runs on (y for rows, x for bars)
export function centres(d, hits) {
  const re = groupRe(d), out = new Map();
  for (const h of hits) { const m = re.exec(h.id); if (!m) continue; const k = +m[1], e = out.get(k) || { x: 0, y: 0, n: 0 }; e.x += h.x; e.y += h.y; e.n++; out.set(k, e); }
  for (const [k, e] of out) out.set(k, { x: e.x / e.n, y: e.y / e.n });
  return out;
}

// input: { cx, cy } the middle of the lifted mark where it was dropped, or { dx, dy } a key step (-1, 0, 1). geo: { hits, shift? }.
// Returns { text, kind, fig, index, to, perm, line, place, newId, toKey, near } or null when the mark stays where it was.
export function plan(film, text, id, input, geo) {
  const d = describe(film, text, id);
  if (!d) return null;
  const { ops, idx } = read(text);
  if (d.kind === "shape") return planShape(film, ops, idx, d, id, input);
  const c = centres(d, geo.hits || []), axis = d.kind === "bars" ? "x" : "y";
  let to = d.index;
  const at = d.allowed.indexOf(d.index);
  if (input.dx !== undefined || input.dy !== undefined) {
    const step = d.kind === "bars" ? (input.dx || input.dy) : (input.dy || input.dx);
    to = d.allowed[clamp(at + Math.sign(step), 0, d.allowed.length - 1)];
  } else {
    const want = axis === "x" ? input.cx : input.cy;
    let best = 1e9;
    for (const k of d.allowed) { const p = c.get(k); if (!p) continue; const dist = Math.abs(p[axis] - want); if (dist < best) { best = dist; to = k; } }
  }
  if (to === d.index) return null;
  // the new order of the movable positions
  const order = d.allowed.slice();
  order.splice(at, 1); order.splice(d.allowed.indexOf(to), 0, d.index);
  const perm = Array.from({ length: d.kind === "tl" ? d.count : d.count }, (_, k) => k);
  d.allowed.forEach((k, j) => { perm[k] = order[j]; });
  let out = null;
  if (d.kind === "list") {
    const op = ops.find((o) => o.preset === "list" && o.id === d.fig), lp = listParts(op), at0 = idx.at.get(op);
    if (at0 === undefined) return null;
    const lines = idx.lines.slice(); lines[at0] = listLine(lp, perm.map((i) => lp.items[i])); out = lines.join("\n");
  } else if (d.kind === "bars") {
    const op = ops.find((o) => o.preset === "chart" && o.id === d.fig), at0 = idx.at.get(op), nl = chartLine(op, perm);
    if (at0 === undefined || nl === null) return null;
    const lines = idx.lines.slice(); lines[at0] = nl; out = lines.join("\n");
  } else {
    const steps = stepsOf(ops, d.fig), at0 = steps.map((s) => idx.at.get(s));
    if (at0.some((k) => k === undefined)) return null;
    const lines = idx.lines.slice();
    d.allowed.forEach((k) => { lines[at0[k]] = idx.lines[at0[perm[k]]]; });
    out = lines.join("\n");
  }
  if (out === text) return null;
  return { text: out, kind: d.kind, fig: d.fig, index: d.index, to, count: d.count, perm, line: `to=${to + 1}`, toKey: to + 1, place: `moved to ${to + 1} of ${d.count}`, newId: idOf(d, to, d.series), near: null };
}

function planShape(film, ops, idx, d, id, input) {
  const sf = shapesFilmOf(film), xf = sf.xf, sc = sf.sc;
  if (!xf) return null;
  let x, y;
  if (input.dx !== undefined || input.dy !== undefined) { x = d.at[0] + 0.5 * (input.dx || 0); y = d.at[1] + 0.5 * (input.dy || 0); }
  else { x = (input.cx - xf.ox) / xf.s; y = (input.cy - (xf.dy || 0) - xf.oy) / xf.s; }
  x = Math.round(clamp(x, 0.2, sc.w - 0.2) * 10) / 10; y = Math.round(clamp(y, 0.2, sc.h - 0.2) * 10) / 10;
  if (x === d.at[0] && y === d.at[1]) return null;
  const head = ops.find((o) => o.preset === "shapes"), op = ops.filter((o) => o.preset === "shape" && o.in === head.id)[d.item], at0 = idx.at.get(op);
  if (at0 === undefined) return null;
  const tok = tokenize(op.line).find((t) => t.key === "at"), lines = idx.lines.slice();
  lines[at0] = idx.lines[at0].replace(tok.raw, () => `at=${x},${y}`);
  // the nearest other closed shape, when this one now sits next to it
  const me = sc.items.find((it) => it.i === d.item), rad = (it) => Math.max(it.size[0], it.size[1]) / 2;
  let near = null, best = 1e9;
  for (const it of sc.items) {
    if (it.i === d.item || !it.at || it.mark || it.from || it.leader || it.kind === "text") continue;
    const dist = Math.hypot(it.at[0] - x, it.at[1] - y), gap = dist - rad(it) - rad(me);
    if (gap < 0.9 && dist < best) { best = dist; near = (sf.marks.find((m) => m.item === it.i) || {}).id || null; }
  }
  return { text: lines.join("\n"), kind: "shape", index: d.item, to: `${x},${y}`, count: 1, perm: null, line: `to=${x},${y}`, toKey: null, place: `moved to ${x}, ${y}`, newId: id, near };
}

// The canned answer for a drop. replies[sample]["move:" + markId] is a reply or a list of them; a reply may say `to` (the 1-based place the
// mark must land on) and `near` (the mark it must land next to). The first one that fits wins.
export function moveReplyFor(replies, sample, id, pl) {
  const r = replies && replies[sample] && replies[sample]["move:" + id];
  if (!r) return null;
  return (Array.isArray(r) ? r : [r]).find((x) => (x.to === undefined || x.to === pl.toKey) && (x.near === undefined || x.near === pl.near)) || null;
}

// ---- the ease where the mark lands -----------------------------------------------------------------------------------------

// Boxes (css px, in the NEW picture) that slide from where they were to where they are, and the offset each starts at.
// A, B: the hits before and after the move. from: where the lifted mark was let go, { cx, cy }.
export function settleGroups(film, pl, A, B, from, W) {
  if (pl.kind === "shape") {
    const h = B.find((x) => x.id === pl.newId); if (!h) return [];
    const r = (h.w ? Math.max(h.w, h.h) / 2 : 40) + 22;
    return [{ x0: h.x - r, y0: h.y - r, x1: h.x + r, y1: h.y + r, dx: from.cx - h.x, dy: from.cy - h.y, s0: 1.07 }];
  }
  const d = { kind: pl.kind, fig: pl.fig }, a = centres(d, A), b = centres(d, B), groups = [];
  const all = Array.from({ length: pl.count }, (_, k) => k);
  if (all.some((k) => !a.has(k) || !b.has(k))) return [];
  if (pl.kind === "bars") {
    const g = (figOf(film, pl.fig) || {}).geo;
    if (!g) return [];
    const sw = (g.px1 - g.px0) / pl.count;
    all.forEach((j) => {
      if (pl.perm[j] === j) return;
      const moved = pl.perm[j] === pl.index;
      groups.push({ x0: g.px0 + j * sw, x1: g.px0 + (j + 1) * sw, y0: g.py0 - 28 + g.dy, y1: g.py1 + 26 + g.dy, dx: (moved ? from.cx : a.get(pl.perm[j]).x) - b.get(j).x, dy: 0 });
    });
    return groups;
  }
  const rows = new Map(B.map((h) => [h.id, h]));
  const edge = (k, s) => { const h = rows.get(idOf(d, k)); return h ? h.y + s * (h.h || 0) / 2 : b.get(k).y + s * 20; };
  all.forEach((j) => {
    if (pl.perm[j] === j) return;
    const top = j === 0 ? edge(0, -1) - 2 : (edge(j - 1, 1) + edge(j, -1)) / 2, bot = j === pl.count - 1 ? edge(j, 1) + 2 : (edge(j, 1) + edge(j + 1, -1)) / 2;
    const moved = pl.perm[j] === pl.index;
    groups.push({ x0: 0, x1: W, y0: top, y1: bot, dx: 0, dy: (moved ? from.cy : a.get(pl.perm[j]).y) - b.get(j).y });
  });
  return groups;
}

// The new picture drawn in place, except the boxes that are still sliding home: each is the same picture clipped to its box and shifted.
export function settleFilm(now, ctx, o) {
  const { groups, W, H, dur = 380 } = o;
  let t0 = null;
  return {
    done: false,
    draw(t, api) {
      if (t0 === null) t0 = performance.now();
      const p = clamp((performance.now() - t0) / dur, 0, 1), k = Math.pow(1 - p, 3);
      api.frame(); ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H);
      groups.forEach((g) => ctx.rect(g.x0, g.y0, g.x1 - g.x0, g.y1 - g.y0));
      ctx.clip("evenodd"); now.draw(t, api); ctx.restore();
      groups.forEach((g) => {
        api.frame(); ctx.save();
        ctx.translate(g.dx * k, g.dy * k);
        if (g.s0) { const cx = (g.x0 + g.x1) / 2, cy = (g.y0 + g.y1) / 2, s = 1 + (g.s0 - 1) * k; ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy); }
        ctx.beginPath(); ctx.rect(g.x0, g.y0, g.x1 - g.x0, g.y1 - g.y0); ctx.clip(); now.draw(t, api); ctx.restore();
      });
      api.frame(); ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 0, 0); ctx.clip(); now.draw(t, api); ctx.restore();   // draws nothing: it owns the hits and the captions
      if (p >= 1) this.done = true;
    },
  };
}
