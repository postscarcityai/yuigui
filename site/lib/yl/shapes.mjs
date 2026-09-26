// shapes (YUI-104): the scene model behind `shapes` and `shape` lines. Pure
// functions, no DOM, so the playground, the MCP App and the tests share one
// layout and one clock. The app's SwiftUI renderer (ShapesPreset.swift) ports
// this file line for line; spec/shapes/scenes.json holds the numbers both
// must give.
//
// scene(head, members) lays the shapes out once: positions, sizes, which
// shapes a connector joins, and when each part comes on. frame(scene, t)
// says where everything is `t` seconds in. t = Infinity is the final still
// (Reduce Motion, a printout, the Telegram picture).

import { resolve } from "./yl.mjs";

// Closed shapes sit somewhere; connectors join two places.
export const CLOSED = ["circle", "box", "pill", "dot", "blob", "text"];
export const CONNECTORS = ["line", "arrow"];
export const KINDS = [...CLOSED, ...CONNECTORS, "path"];
export const TONES = ["accent", "mint", "lavender", "butter", "ink", "mute"];

// Default sizes in canvas units, [width, height].
const SIZE = { circle: [2, 2], box: [3, 2], pill: [3, 1.2], dot: [0.5, 0.5], blob: [2.6, 2.2], text: [3, 0.9] };

// The clock, in seconds.
export const STEP = 0.35; // one part to the next
export const DUR = { fade: 0.35, grow: 0.5, draw: 0.7 };
export const MOVE = 0.8;
export const PULSE = 1.6; // one breath
// Label size as a share of the drawing's width, so text reads the same at any w.
export const LABEL = 0.042;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : typeof v === "string" && /^-?\d+(\.\d+)?$/.test(v.trim()) ? Number(v) : null);

// "2,3" (or 2,3 as numbers) to [2, 3]; anything else is null.
export function point(v) {
  if (v === undefined || v === null || v === true) return null;
  const parts = String(v).split(",").map((x) => x.trim());
  if (parts.length !== 2) return null;
  const [x, y] = parts.map(num);
  return x === null || y === null ? null : [x, y];
}

// size=2 is 2 by 2 (a circle's diameter); size=3,2 is 3 wide, 2 tall.
function size(v, kind) {
  const d = SIZE[kind] || SIZE.box;
  if (v === undefined) return null;
  const one = num(v);
  if (one !== null) return kind === "pill" || kind === "box" || kind === "text" ? [one, one * d[1] / d[0]] : [one, one];
  const p = point(v);
  return p ? p : null;
}

function motion(p, kind) {
  if (p.draw) return "draw";
  if (p.grow) return "grow";
  // Lines, arrows and paths trace themselves on unless told otherwise.
  if (kind === "line" || kind === "arrow" || kind === "path") return "draw";
  return "fade";
}

// head: the `shapes` props; members: [{ id, props }] in line order (a lone
// `shape` is a one-member scene with head {}).
export function scene(head, members) {
  const h0 = resolve("shapes", head || {});
  const W = clamp(num(h0.w) ?? 10, 4, 24);
  const parts = members.map((m, i) => {
    const p = resolve("shape", m.props || {});
    const kind = KINDS.includes(p.kind) ? p.kind : "box";
    return { i, id: m.id ?? null, kind, p, closed: CLOSED.includes(kind) };
  });

  // Closed shapes with no at= share one row across the middle, in line
  // order, each sized to hold its label (rowLayout). A crowded row scales
  // down as a whole, labels too, never below ROW_MIN.
  const loose = parts.filter((s) => s.closed && !point(s.p.at));
  const joined = parts.some((s) => CONNECTORS.includes(s.kind));
  const row = rowLayout(loose, W, LABEL * W, joined, parts);
  const k = row.k;
  // A diagram that is only a row, with no h= written, is as tall as the row
  // plus room for labels, not the full 6.
  const onlyRow = loose.length > 0 && loose.length === parts.filter((s) => s.closed).length && !parts.some((s) => s.kind === "path" || point(s.p.from) || point(s.p.to));
  const H = clamp(num((head || {}).h) ?? (onlyRow ? row.h + 1.4 * k : 6), 2, 16);
  const items = [];
  let t = 0;
  for (const s of parts) {
    const { p, kind } = s;
    const tone = TONES.includes(p.tone) ? p.tone : kind === "text" ? "ink" : "accent";
    const item = {
      i: s.i, id: s.id, kind, label: p.label ? String(p.label) : "", tone,
      fill: !!p.fill || kind === "dot", dash: !!p.dash, motion: motion(p, kind), pulse: !!p.pulse,
      start: t,
    };
    if (s.closed) {
      let at = point(p.at);
      let sz = (size(p.size, kind) || SIZE[kind]).map((v) => v * k);
      if (!at) {
        const r = row.places[loose.indexOf(s)];
        at = [r.x, H / 2];
        sz = r.size;
      }
      item.at = inside(at, sz, W, H);
      item.size = sz;
      const mv = point(p.move);
      if (mv) item.move = inside(mv, sz, W, H);
    } else if (kind === "path") {
      const pts = (Array.isArray(p.pts) ? p.pts : []).map(point).filter(Boolean);
      if (pts.length < 2) continue;
      item.pts = pts;
    } else {
      // A connector: from= and to= are a shape's id or a point. With neither,
      // it joins the closed shape before it to the one after it.
      item.from = end(p.from, p.at, parts, s.i, -1);
      item.to = end(p.to, null, parts, s.i, 1);
      if (!item.from || !item.to) continue;
    }
    item.dur = DUR[item.motion];
    items.push(item);
    t += STEP;
  }
  const last = items.reduce((m, it) => Math.max(m, it.start + it.dur + (it.move ? MOVE : 0)), 0);
  return { w: W, h: H, fs: LABEL * W * k, title: h0.title ? String(h0.title) : "", caption: h0.caption ? String(h0.caption) : "", items, total: last };
}

// How much of a closed shape's width its label may use.
const SHARE = { circle: 0.78, blob: 0.74, box: 0.88, pill: 0.8 };
export const ROW_MIN = 0.7;
const GLYPH = 0.56; // a glyph's width as a share of the font size
const LINE = 1.15; // line height as a share of the font size

// The auto row: a size for each loose shape that holds its label at font
// size fs, even gaps (room for an arrow when the diagram has connectors),
// and one scale k for the row and every label when it would not fit in W.
// Returns { k, h (the row's height), places: [{ x, size }] }.
function rowLayout(loose, W, fs, joined, parts) {
  const wordW = (label) => Math.max(0, ...String(label || "").split(/\s+/).filter(Boolean).map((w) => w.length * GLYPH * fs));
  const lines = (label, width) => wrap(label, width, fs).length;
  const own = loose.map((s) => {
    const { p, kind } = s;
    const given = size(p.size, kind);
    const widest = wordW(p.label);
    let sz;
    if (given) sz = given;
    else if (kind === "box") { const w = Math.max(2.25, widest / SHARE.box + 0.3); sz = [w, Math.max(1.5, lines(p.label, w * SHARE.box) * LINE * fs + 0.5)]; }
    else if (kind === "pill") { const w = Math.max(2.25, widest / SHARE.pill + 0.4); sz = [w, Math.max(0.9, lines(p.label, w * SHARE.pill) * LINE * fs + 0.35)]; }
    else if (kind === "circle") { let d = Math.max(1.5, widest / SHARE.circle + 0.2); d = Math.max(d, lines(p.label, d * SHARE.circle) * LINE * fs + 0.5); sz = [d, d]; }
    else if (kind === "blob") { const w = Math.max(1.95, widest / SHARE.blob + 0.3); sz = [w, Math.max(w * 0.85, lines(p.label, w * SHARE.blob) * LINE * fs + 0.6)]; }
    else if (kind === "text") { const w = Math.min(3.4, Math.max(widest, String(p.label || "").length * GLYPH * fs)); sz = [Math.max(w, 0.5), Math.max(1, lines(p.label, 3.4)) * LINE * fs]; }
    else sz = SIZE.dot;
    // A dot's label hangs under it, so the dot takes the label's width in the row.
    const span = kind === "dot" ? Math.max(sz[0], Math.min(3.4, String(p.label || "").length * GLYPH * fs)) : sz[0];
    return { sz, span };
  });
  // The gap after each shape: room for an arrow, wider when the connector
  // written between it and the next one carries a label.
  const margin = 0.2;
  const gaps = loose.slice(0, -1).map((s, j) => {
    const between = parts.slice(s.i + 1, loose[j + 1].i).find((c) => CONNECTORS.includes(c.kind) && c.p.label);
    const text = between ? String(between.p.label).length * GLYPH * fs * 0.9 + 0.3 : 0;
    return Math.max(joined ? 1 : 0.5, text);
  });
  const need = own.reduce((a, o) => a + o.span, 0) + gaps.reduce((a, g) => a + g, 0) + 2 * margin;
  const k = need > W ? Math.max(ROW_MIN, W / need) : 1;
  let x = (W - (need - 2 * margin) * k) / 2;
  const places = own.map((o, j) => {
    const c = x + (o.span * k) / 2;
    x += (o.span + (gaps[j] || 0)) * k;
    return { x: c, size: o.sz.map((v) => v * k) };
  });
  return { k, places, h: Math.max(0, ...places.map((pl) => pl.size[1])) };
}

// Keeps a closed shape on the canvas: its centre moves in until the whole
// shape fits (a shape bigger than the canvas stays centred on that axis).
function inside([x, y], [w, h], W, H) {
  const fit = (v, half, max) => (half * 2 >= max ? max / 2 : clamp(v, half, max - half));
  return [fit(x, w / 2, W), fit(y, h / 2, H)];
}

// A label as lines that fit `width` (canvas units) at font size `fs`:
// words wrap at spaces, at most three lines; a word longer than the width
// stays whole. Glyphs are taken as 0.56 of the font size wide, which is
// about right for the rounded bold labels both renderers use.
export function wrap(label, width, fs) {
  const words = String(label || "").split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const max = Math.max(1, Math.floor(width / (fs * 0.56)));
  const out = [];
  for (const w of words) {
    const last = out[out.length - 1];
    if (last !== undefined && (last + " " + w).length <= max) out[out.length - 1] = last + " " + w;
    else out.push(w);
  }
  if (out.length > 3) out.splice(2, out.length - 2, out.slice(2).join(" "));
  return out;
}

// How wide a part's label may run before it wraps, in canvas units: inside
// a closed shape, the part of it text fits in; under a dot, on a line or a
// path, or as a text shape, a third of the canvas (or the text shape's size).
export function labelWidth(it, k = 1) {
  const [w] = it.size || [0];
  const share = SHARE[it.kind];
  if (share) return w * share;
  if (it.kind === "text" && it.size) return Math.max(w, 1);
  return 3.4 * k;
}

// A connector end: an id of a shape in this scene, a point, or (neither
// written) the nearest closed shape before (dir -1) or after (dir 1).
function end(v, fallback, parts, i, dir) {
  const byId = typeof v === "string" && parts.find((s) => s.closed && s.id === v);
  if (byId) return { ref: byId.i };
  const pt = point(v) || point(fallback);
  if (pt) return { pt };
  if (v !== undefined && v !== null) return null; // named something that is not here
  for (let k = i + dir; k >= 0 && k < parts.length; k += dir) if (parts[k].closed) return { ref: parts[k].i };
  return null;
}

const easeOut = (x) => 1 - Math.pow(1 - x, 3);
// A little overshoot for grow, like a spring.
const easeBack = (x) => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2);
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

// Where every item is t seconds in. Returns [{ ...item, o (opacity), s
// (scale), d (0-1 of the outline drawn), c ([x, y] now) , a, b (connector
// ends now) }], connector ends clipped to the outlines they touch.
export function frame(sc, t) {
  const still = !Number.isFinite(t);
  const now = new Map();
  const out = [];
  for (const it of sc.items) {
    const k = still ? 1 : clamp((t - it.start) / it.dur, 0, 1);
    const f = { ...it, o: 1, s: 1, d: 1 };
    if (it.motion === "fade") f.o = easeOut(k);
    if (it.motion === "grow") { f.s = k <= 0 ? 0 : easeBack(k); f.o = k > 0 ? 1 : 0; }
    if (it.motion === "draw") { f.d = easeOut(k); f.o = k > 0 ? 1 : 0; }
    if (it.at) {
      let c = it.at;
      if (it.move) {
        const m = still ? 1 : clamp((t - it.start - it.dur) / MOVE, 0, 1);
        const e = easeInOut(m);
        c = [it.at[0] + (it.move[0] - it.at[0]) * e, it.at[1] + (it.move[1] - it.at[1]) * e];
      }
      f.c = c;
      if (it.pulse && !still && t > it.start + it.dur) f.s *= 1 + 0.06 * Math.sin((2 * Math.PI * (t - it.start - it.dur)) / PULSE);
      now.set(it.i, f);
    }
    out.push(f);
  }
  for (const f of out) {
    if (!f.from) continue;
    const A = f.from.ref !== undefined ? now.get(f.from.ref) : null;
    const B = f.to.ref !== undefined ? now.get(f.to.ref) : null;
    const a0 = A ? A.c : f.from.pt;
    const b0 = B ? B.c : f.to.pt;
    f.a = A ? edge(A, b0) : a0;
    f.b = B ? edge(B, a0) : b0;
  }
  return out;
}

// The point on a shape's outline on the way to `toward`, with a small gap.
export function edge(f, toward) {
  const [cx, cy] = f.c;
  const dx = toward[0] - cx, dy = toward[1] - cy;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const [w, h] = f.size;
  const gap = 0.15;
  let r;
  if (f.kind === "circle" || f.kind === "dot" || f.kind === "blob") {
    // An ellipse of the shape's box.
    const a = w / 2, b = h / 2;
    r = (a * b) / Math.hypot(b * ux, a * uy);
  } else {
    // A box (a pill and a text label too): where the ray leaves the rectangle.
    const rx = Math.abs(ux) > 1e-9 ? w / 2 / Math.abs(ux) : Infinity;
    const ry = Math.abs(uy) > 1e-9 ? h / 2 / Math.abs(uy) : Infinity;
    r = Math.min(rx, ry);
  }
  r = Math.min(r + gap, len);
  return [cx + ux * r, cy + uy * r];
}

// A blob: a closed, organic outline around (0, 0) for a w by h box, as
// points to join with a smooth curve. Seeded by the shape's place in the
// scene, so the same line always draws the same blob.
export function blobPoints(w, h, seed) {
  const n = 7;
  const pts = [];
  for (let k = 0; k < n; k++) {
    const ang = (2 * Math.PI * k) / n - Math.PI / 2;
    const r = 1 + 0.13 * Math.sin((seed + 1) * 12.9898 + k * 78.233);
    pts.push([Math.cos(ang) * (w / 2) * r * 0.94, Math.sin(ang) * (h / 2) * r * 0.94]);
  }
  return pts;
}

// Catmull-Rom through points, as cubic Bezier segments [c1, c2, p]. Closed
// joins the last point back to the first.
export function smooth(pts, closed) {
  const n = pts.length;
  const at = (k) => (closed ? pts[(k + n) % n] : pts[clamp(k, 0, n - 1)]);
  const segs = [];
  const count = closed ? n : n - 1;
  for (let k = 0; k < count; k++) {
    const p0 = at(k - 1), p1 = at(k), p2 = at(k + 1), p3 = at(k + 2);
    segs.push([
      [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6],
      [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6],
      p2,
    ]);
  }
  return segs;
}

// Plain text of a drawing, for Telegram, screen readers and a printout:
// the title, the labels in line order with connectors as arrows between
// their ends (A → B → C when they chain), then the caption.
export function describe(sc) {
  const name = (e) => {
    const it = e && e.ref !== undefined ? sc.items.find((x) => x.i === e.ref) : null;
    return it ? it.label || it.kind : null;
  };
  const joined = new Set();
  for (const it of sc.items) if (it.from && name(it.from) && name(it.to)) { joined.add(it.from.ref); joined.add(it.to.ref); }
  const bits = [];
  let tail = null; // the ref the last chain ended on
  for (const it of sc.items) {
    if (it.from) {
      const a = name(it.from), b = name(it.to);
      if (!a || !b) { if (it.label) bits.push(it.label); tail = null; continue; }
      const sign = `${it.kind === "arrow" ? " → " : " – "}${b}${it.label ? ` (${it.label})` : ""}`;
      if (tail !== null && tail === it.from.ref) bits[bits.length - 1] += sign;
      else bits.push(a + sign);
      tail = it.to.ref;
    } else if (it.label && !joined.has(it.i)) { bits.push(it.label); tail = null; }
  }
  return [sc.title, bits.join(", "), sc.caption].filter(Boolean).join(". ");
}
