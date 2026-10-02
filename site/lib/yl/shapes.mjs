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

// Closed shapes sit somewhere; connectors join two places. Traced kinds go
// through points: an open curve, a closed outline, a hand-drawn stroke (YUI-276).
export const CLOSED = ["circle", "box", "pill", "dot", "blob", "text", "venn", "contour", "tap"];
export const CONNECTORS = ["line", "arrow", "swipe"];
export const TRACED = ["path", "region", "doodle"];
export const KINDS = [...CLOSED, ...CONNECTORS, ...TRACED];
export const TONES = ["accent", "mint", "lavender", "butter", "ink", "mute"];

// Default sizes in canvas units, [width, height].
const SIZE = { circle: [2, 2], box: [3, 2], pill: [3, 1.2], dot: [0.5, 0.5], blob: [2.6, 2.2], text: [3, 0.9],
  venn: [5.2, 3.2], contour: [3.2, 2.4], doodle: [2.4, 1.6], tap: [0.9, 0.9] };
// Short labels the new kinds draw are capped: at most three words and 18 characters,
// whole words while they fit, then "…" (YUI-276).
export const CAP = { words: 3, chars: 18 };
const CAPPED = ["venn", "contour", "region", "doodle", "tap", "swipe"];
// A swipe with dir= and no to= runs this far that way.
export const SWIPE = 3;
const DIRS = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] };
// A Venn of three sets is rounder than one of two.
const VENN3 = [4.8, 4.56];
// Kinds whose height keeps their proportions when size= is one number.
const KEEPS = ["pill", "box", "text", "venn", "contour", "doodle"];

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

// A list prop as the parser gives it (a list), or one written as a|b.
const list = (v) => (Array.isArray(v) ? v : v === undefined || v === null || v === true ? [] : String(v).split("|")).map(String).filter(Boolean);
// A Venn's sets: at most three.
const setsOf = (p) => list(p.sets).slice(0, 3);
// A kind's default size; a Venn's depends on how many sets it has.
const sizeOf = (kind, p) => (kind === "venn" && setsOf(p).length >= 3 ? VENN3 : SIZE[kind] || SIZE.box);

// size=2 is 2 by 2 (a circle's diameter); size=3,2 is 3 wide, 2 tall.
function size(v, kind, p = {}) {
  const d = sizeOf(kind, p);
  if (v === undefined) return null;
  const one = num(v);
  if (one !== null) return KEEPS.includes(kind) ? [one, one * d[1] / d[0]] : [one, one];
  const pt = point(v);
  return pt ? pt : null;
}

// Kinds that trace themselves on unless told otherwise.
const TRACES = ["line", "arrow", "path", "region", "doodle", "contour", "swipe"];
function motion(p, kind) {
  if (p.draw) return "draw";
  if (p.grow) return "grow";
  if (TRACES.includes(kind)) return "draw";
  // A tap lands: it springs up.
  if (kind === "tap") return "grow";
  return "fade";
}

// head: the `shapes` props; members: [{ id, props }] in line order (a lone
// `shape` is a one-member scene with head {}). opts.ratio: the picture's width
// over its height once it has loaded, so a drawing with img= and no h= takes
// the picture's shape. opts.free: no cap on h (marks over a mock, marksOver).
export function scene(head, members, opts = {}) {
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
  const onlyRow = loose.length > 0 && loose.length === parts.filter((s) => s.closed).length && !parts.some((s) => TRACED.includes(s.kind) || point(s.p.from) || point(s.p.to));
  const hp = head || {};
  const pictured = hp.img && num(hp.h) === null && opts.ratio > 0 ? W / opts.ratio : null;
  const hRaw = num(hp.h) ?? pictured ?? (onlyRow ? row.h + 1.4 * k : 6);
  const H = opts.free ? Math.max(2, hRaw) : clamp(hRaw, 2, 16);
  const items = [];
  let t = 0;
  for (const s of parts) {
    const { p, kind } = s;
    const tone = TONES.includes(p.tone) ? p.tone : kind === "text" ? "ink" : "accent";
    const item = {
      i: s.i, id: s.id, kind, label: p.label ? (CAPPED.includes(kind) ? cap(p.label) : String(p.label)) : "", tone,
      fill: !!p.fill || kind === "dot" || kind === "venn", dash: !!p.dash, motion: motion(p, kind), pulse: !!p.pulse,
      start: t,
    };
    if (s.closed) {
      let at = point(p.at);
      let sz = (size(p.size, kind, p) || sizeOf(kind, p)).map((v) => v * k);
      if (!at) {
        const r = row.places[loose.indexOf(s)];
        at = [r.x, H / 2];
        sz = r.size;
      }
      item.at = inside(at, sz, W, H);
      item.size = sz;
      const mv = point(p.move);
      if (mv) item.move = inside(mv, sz, W, H);
      if (kind === "venn") {
        item.sets = setsOf(p).map(cap);
        const pairs = list(p.pairs).slice(0, 3).map(cap);
        if (pairs.length) item.pairs = pairs;
      }
      if (kind === "contour") item.rings = clamp(Math.round(num(p.rings) ?? 4), 2, 8);
    } else if (TRACED.includes(kind)) {
      let pts = (Array.isArray(p.pts) ? p.pts : []).map(point).filter(Boolean);
      // A doodle with no points but a place is a ring scribbled round it.
      if (kind === "doodle" && pts.length < 2 && point(p.at)) {
        const sz = (size(p.size, kind) || SIZE.doodle).map((v) => v * k);
        pts = ring(inside(point(p.at), sz, W, H), sz, s.i);
      }
      // A region is a closed outline, so it needs three points.
      if (pts.length < (kind === "region" ? 3 : 2)) continue;
      item.pts = pts;
    } else {
      // A connector: from= and to= are a shape's id or a point. With neither,
      // it joins the closed shape before it to the one after it.
      item.from = end(p.from, p.at, parts, s.i, -1);
      // A swipe with dir= and no to= runs SWIPE that way from where it starts.
      const dir = kind === "swipe" && p.to === undefined ? DIRS[p.dir] : null;
      const from = dir ? point(p.from) || point(p.at) : null;
      item.to = from ? { pt: [from[0] + SWIPE * dir[0], from[1] + SWIPE * dir[1]] } : end(p.to, null, parts, s.i, 1);
      if (!item.from || !item.to) continue;
      // bend= bows it: the share of its length its middle stands off, + to the left of the way it goes.
      const bend = num(p.bend);
      if (bend) item.bend = clamp(bend, -1, 1);
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
    const given = size(p.size, kind, p);
    const widest = wordW(p.label);
    let sz;
    if (given) sz = given;
    else if (kind === "box") { const w = Math.max(2.25, widest / SHARE.box + 0.3); sz = [w, Math.max(1.5, lines(p.label, w * SHARE.box) * LINE * fs + 0.5)]; }
    else if (kind === "pill") { const w = Math.max(2.25, widest / SHARE.pill + 0.4); sz = [w, Math.max(0.9, lines(p.label, w * SHARE.pill) * LINE * fs + 0.35)]; }
    else if (kind === "circle") { let d = Math.max(1.5, widest / SHARE.circle + 0.2); d = Math.max(d, lines(p.label, d * SHARE.circle) * LINE * fs + 0.5); sz = [d, d]; }
    else if (kind === "blob") { const w = Math.max(1.95, widest / SHARE.blob + 0.3); sz = [w, Math.max(w * 0.85, lines(p.label, w * SHARE.blob) * LINE * fs + 0.6)]; }
    else if (kind === "text") { const w = Math.min(3.4, Math.max(widest, String(p.label || "").length * GLYPH * fs)); sz = [Math.max(w, 0.5), Math.max(1, lines(p.label, 3.4)) * LINE * fs]; }
    else if (kind === "venn" || kind === "contour" || kind === "tap") sz = sizeOf(kind, p);
    else sz = SIZE.dot;
    // A dot's label hangs under it, so the dot takes the label's width in the row.
    const span = kind === "dot" || kind === "tap" ? Math.max(sz[0], Math.min(3.4, String(p.label || "").length * GLYPH * fs)) : sz[0];
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
  // A Venn's label sits where every set overlaps; a contour's on its peak.
  if (it.kind === "venn" && it.size) return vennRadius(it) * ((it.sets || []).length >= 3 ? 0.5 : 0.7);
  if (it.kind === "contour" && it.size) return w * 0.5;
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
    if (f.bend) {
      // A curve through q, its control point: its middle stands off bend times its length.
      const dx = b0[0] - a0[0], dy = b0[1] - a0[1];
      f.q = [(a0[0] + b0[0]) / 2 + 2 * f.bend * dy, (a0[1] + b0[1]) / 2 - 2 * f.bend * dx];
      f.a = A ? edge(A, f.q) : a0;
      f.b = B ? edge(B, f.q) : b0;
    } else {
      f.a = A ? edge(A, b0) : a0;
      f.b = B ? edge(B, a0) : b0;
    }
  }
  return out;
}

// A point on a curved connector, t from 0 (a) to 1 (b), and the way it heads there.
export function bent(a, q, b, t) {
  const u = 1 - t;
  return {
    p: [u * u * a[0] + 2 * u * t * q[0] + t * t * b[0], u * u * a[1] + 2 * u * t * q[1] + t * t * b[1]],
    dir: [2 * u * (q[0] - a[0]) + 2 * t * (b[0] - q[0]), 2 * u * (q[1] - a[1]) + 2 * t * (b[1] - q[1])],
  };
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
  if (["circle", "dot", "blob", "venn", "contour", "tap"].includes(f.kind)) {
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

// A doodle ring: a loop scribbled round [cx, cy] for a w by h box, a little
// more than one turn so its ends overlap, as guide points for doodle().
export function ring([cx, cy], [w, h], seed) {
  const n = 10, turn = 2 * Math.PI * 1.12, a0 = -Math.PI * 0.62;
  const out = [];
  for (let k = 0; k < n; k++) {
    const t = k / (n - 1);
    const r = (0.96 + 0.1 * t) * (1 + 0.05 * Math.sin((seed + 1) * 12.9898 + k * 78.233));
    out.push([cx + Math.cos(a0 + turn * t) * (w / 2) * r, cy + Math.sin(a0 + turn * t) * (h / 2) * r]);
  }
  return out;
}

// A hand-drawn stroke through guide points: the smooth curve sampled about
// every 0.035 w, each inner sample nudged off the line by up to 0.007 w (w is
// the canvas width), seeded so the same line wobbles the same way. Join the
// result with smooth(pts, false).
export function doodle(pts, seed, w) {
  const gap = 0.035 * w, amp = 0.007 * w;
  const q = [pts[0]];
  smooth(pts, false).forEach(([c1, c2, p3], k) => {
    const p0 = pts[k];
    const m = Math.max(2, Math.ceil(Math.hypot(p3[0] - p0[0], p3[1] - p0[1]) / gap));
    for (let j = 1; j <= m; j++) {
      const t = j / m, u = 1 - t;
      const b = (i) => u * u * u * p0[i] + 3 * u * u * t * c1[i] + 3 * u * t * t * c2[i] + t * t * t * p3[i];
      q.push([b(0), b(1)]);
    }
  });
  return q.map((p, j) => {
    if (j === 0 || j === q.length - 1) return p;
    const tx = q[j + 1][0] - q[j - 1][0], ty = q[j + 1][1] - q[j - 1][1];
    const len = Math.hypot(tx, ty) || 1;
    const off = amp * Math.sin((seed + 1) * 12.9898 + j * 78.233);
    return [p[0] - (ty / len) * off, p[1] + (tx / len) * off];
  });
}

// A Venn's circle radius for its box: two sets side by side, three in a triangle.
export function vennRadius(it, s = 1) {
  const [w, h] = it.size.map((v) => v * s);
  return (it.sets || []).length >= 3 ? Math.min(w / 3.2, h / 3.0392) : Math.min(w / 3.2, h / 2);
}

// A Venn centred on c: its circles (each with a tone, from the shape's own
// on through accent, mint, lavender and butter) and its labels. Each label sits
// in the widest part of its own region (widest), at most two lines, shrunk to
// fit down to 0.7 of its size (fit): { at, text, width, lines, fs, middle? }.
// fs is the scene's label size; set and pair names draw at 0.85 of it. Two
// circles when it has fewer than three sets.
const CYCLE = ["accent", "mint", "lavender", "butter"];
export function venn(it, c, s = 1, fs = LABEL * 10) {
  const sets = it.sets || [];
  const r = vennRadius(it, s);
  const three = sets.length >= 3;
  const y = 0.5196 * r;
  const at = three ? [[-0.6 * r, -y], [0.6 * r, -y], [0, y]] : [[-0.6 * r, 0], [0.6 * r, 0]];
  const start = CYCLE.indexOf(it.tone);
  const circles = at.map(([x, yy], k) => ({ c: [c[0] + x, c[1] + yy], r, tone: start < 0 ? it.tone : CYCLE[(start + k) % CYCLE.length] }));
  const all = circles.map((_, k) => k);
  const labels = [];
  const place = (inside, text, size, middle) => {
    const outside = all.filter((k) => !inside.includes(k));
    const y0 = Math.max(...inside.map((k) => circles[k].c[1] - r)), y1 = Math.min(...inside.map((k) => circles[k].c[1] + r));
    const spot = widest(vennRuns(circles, inside, outside), y0, y1, size * LINE);
    const width = spot ? spot.width * 0.9 : r * 0.5;
    const f = fit(text, width, size);
    const mid = [inside.reduce((a, k) => a + circles[k].c[0], 0) / inside.length, inside.reduce((a, k) => a + circles[k].c[1], 0) / inside.length];
    labels.push({ at: spot ? spot.at : mid, text, width, lines: f.lines, fs: f.fs, ...(middle ? { middle: true } : {}) });
  };
  sets.slice(0, circles.length).forEach((t, k) => { if (t) place([k], t, 0.85 * fs * s, false); });
  if (it.label) place(all, it.label, fs * s, true);
  if (three) [[0, 1], [0, 2], [1, 2]].forEach((pair, k) => { const t = (it.pairs || [])[k]; if (t) place(pair, t, 0.85 * fs * s, false); });
  return { circles, labels };
}

// A circle's chord at height y, or null.
const chord = (q, y) => {
  const d = y - q.c[1];
  if (Math.abs(d) >= q.r) return null;
  const h = Math.sqrt(q.r * q.r - d * d);
  return [q.c[0] - h, q.c[0] + h];
};
// Runs with one interval cut out of them.
function minus(runs, cut) {
  if (!cut) return runs;
  const out = [];
  for (const [lo, hi] of runs) {
    if (cut[1] <= lo || cut[0] >= hi) { out.push([lo, hi]); continue; }
    if (cut[0] > lo) out.push([lo, cut[0]]);
    if (cut[1] < hi) out.push([cut[1], hi]);
  }
  return out;
}
// A Venn region's runs at height y: inside every circle in `inside`, outside the rest.
const vennRuns = (circles, inside, outside) => (y) => {
  let lo = -Infinity, hi = Infinity;
  for (const k of inside) {
    const ch = chord(circles[k], y);
    if (!ch) return [];
    lo = Math.max(lo, ch[0]);
    hi = Math.min(hi, ch[1]);
  }
  if (hi <= lo) return [];
  let runs = [[lo, hi]];
  for (const k of outside) runs = minus(runs, chord(circles[k], y));
  return runs;
};

// The widest place for a label in a region, given its runs at a height y
// (runs(y): [[lo, hi], ...]) between y0 and y1: 25 heights (an odd count, so the middle is one), at each the
// longest run, narrowed to what the region still holds half a line (th / 2)
// above and below. Returns { at, width } or null when nothing fits.
export function widest(runs, y0, y1, th) {
  const N = 25;
  let best = null;
  for (let j = 0; j < N; j++) {
    const y = y0 + ((y1 - y0) * (j + 0.5)) / N;
    const here = runs(y);
    if (!here.length) continue;
    let [lo, hi] = here.reduce((a, b) => (b[1] - b[0] > a[1] - a[0] ? b : a));
    for (const dy of [-th / 2, th / 2]) {
      let most = 0, pick = null;
      for (const q of runs(y + dy)) {
        const o = Math.min(hi, q[1]) - Math.max(lo, q[0]);
        if (o > most) { most = o; pick = q; }
      }
      if (!pick) { hi = lo; break; }
      lo = Math.max(lo, pick[0]);
      hi = Math.min(hi, pick[1]);
    }
    if (hi - lo > (best ? best.width : 0)) best = { at: [(lo + hi) / 2, y], width: hi - lo };
  }
  return best;
}

// A short label capped at CAP.words words and CAP.chars characters: whole
// words while they fit, then "…"; a first word longer than that is cut.
export function cap(text) {
  const words = String(text ?? "").split(/\s+/).filter(Boolean);
  const out = [];
  for (const w of words) {
    const next = out.length ? out.join(" ") + " " + w : w;
    if (out.length >= CAP.words || next.length > CAP.chars) break;
    out.push(w);
  }
  if (out.length === words.length) return words.join(" ");
  if (!out.length) return words[0].slice(0, CAP.chars - 1) + "…";
  return out.join(" ") + "…";
}

// A short label as at most two lines that fit `width`, at fs or a step smaller
// (0.05 fs a step) down to 0.7 fs. What still does not fit at the floor runs a
// little wide rather than lose letters (cap keeps it short). Returns { lines, fs }.
export function fit(text, width, fs) {
  const words = String(text ?? "").split(/\s+/).filter(Boolean);
  if (!words.length) return { lines: [], fs };
  const two = (f) => {
    const most = Math.max(1, Math.floor(width / (f * GLYPH)));
    const out = [];
    for (const w of words) {
      const last = out[out.length - 1];
      if (last !== undefined && (last + " " + w).length <= most) out[out.length - 1] = last + " " + w;
      else out.push(w);
    }
    if (out.length > 2) out.splice(1, out.length - 1, out.slice(1).join(" "));
    return { out, most };
  };
  for (let i = 0; i <= 6; i++) {
    const f = fs * (1 - 0.05 * i);
    const { out, most } = two(f);
    if (out.every((l) => l.length <= most)) return { lines: out, fs: f };
  }
  const f = fs * (1 - 0.05 * 6);
  return { lines: two(f).out, fs: f };
}

// A region's outline as a polygon: its smooth curve, eight points a segment.
function outlinePoints(pts) {
  const out = [];
  smooth(pts, true).forEach(([c1, c2, p3], k) => {
    const p0 = pts[k];
    for (let j = 1; j <= 8; j++) {
      const t = j / 8, u = 1 - t;
      const b = (i) => u * u * u * p0[i] + 3 * u * u * t * c1[i] + 3 * u * t * t * c2[i] + t * t * t * p3[i];
      out.push([b(0), b(1)]);
    }
  });
  return out;
}
// A polygon's runs at height y (even-odd).
const polyRuns = (poly) => (y) => {
  const xs = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    if ((a[1] <= y) !== (b[1] <= y)) xs.push(a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1]));
  }
  xs.sort((p, q) => p - q);
  const runs = [];
  for (let i = 0; i + 1 < xs.length; i += 2) runs.push([xs[i], xs[i + 1]]);
  return runs;
};

// Where a region's label goes: the widest part of its outline, fitted to it at
// 0.9 of fs. Returns { at, width, lines, fs }.
export function regionLabel(it, fs) {
  const poly = outlinePoints(it.pts);
  const ys = poly.map((p) => p[1]);
  const size = fs * 0.9;
  const spot = widest(polyRuns(poly), Math.min(...ys), Math.max(...ys), size * LINE);
  const n = it.pts.length;
  const width = spot ? spot.width * 0.9 : 3.4;
  const f = fit(it.label, width, size);
  const mid = [it.pts.reduce((a, p) => a + p[0], 0) / n, it.pts.reduce((a, p) => a + p[1], 0) / n];
  return { at: spot ? spot.at : mid, width, lines: f.lines, fs: f.fs };
}

// A contour's rings around c, outermost first: one outline scaled in steps,
// each step's middle drifting toward the peak, and its label there, fitted to
// half its width. Returns { rings, peak, label: { lines, fs } }.
export function contour(it, c, s = 1, fs = LABEL * 10) {
  const n = it.rings || 4;
  const [w, h] = it.size.map((v) => v * s);
  const dx = 0.08 * w * Math.sin((it.i + 1) * 3.1), dy = -0.07 * h * Math.abs(Math.cos((it.i + 1) * 3.1));
  const rings = [];
  for (let k = 0; k < n; k++) {
    const f = (n - k) / n, m = k / n;
    rings.push(blobPoints(w * f, h * f, it.i).map(([x, y]) => [x + c[0] + dx * m, y + c[1] + dy * m]));
  }
  return { rings, peak: [c[0] + (dx * (n - 1)) / n, c[1] + (dy * (n - 1)) / n], label: fit(it.label, w * 0.5, fs * s) };
}

// Gesture marks over a mock (YUI-276): its `shape` lines drawn over its screen.
// members: [{ id, props }]; cells: { partId: [x, y, w, h] } in points from the
// screen's top left; box: [w, h], the screen in points. A place is a part's id
// (its middle) or x,y with 0,0 the screen's top left and 10,10 its bottom
// right; a size is in tenths of the screen's width. A doodle round a part with
// no size rings the whole part; an arrow or a line to a part stops at its
// edge. The scene is 10 wide and as tall as the screen; draw it over the screen.
export function marksOver(members, cells, box) {
  const unit = box[0] / 10, H = box[1] / unit;
  const own = new Set(members.map((m) => m.id).filter(Boolean));
  const cell = (v) => (typeof v === "string" && !own.has(v) && cells[v] ? cells[v].map((x) => x / unit) : null);
  const fmt = (q) => `${Math.round(q[0] * 1e4) / 1e4},${Math.round(q[1] * 1e4) / 1e4}`;
  const down = (v) => { const q = point(v); return q ? fmt([q[0], (q[1] * H) / 10]) : v; };
  const out = members.map((m) => {
    const p = { ...(m.props || {}) };
    const kind = String(p.kind ?? "box").toLowerCase();
    const rect = {};
    for (const key of ["at", "from", "to", "move"]) {
      const r = cell(p[key]);
      if (r) { rect[key] = r; p[key] = fmt([r[0] + r[2] / 2, r[1] + r[3] / 2]); }
      else if (p[key] !== undefined) p[key] = down(p[key]);
    }
    if (Array.isArray(p.pts)) p.pts = p.pts.map(down);
    const traced = Array.isArray(p.pts) && p.pts.length >= 2;
    if (kind === "doodle" && rect.at && p.size === undefined && !traced) p.size = fmt([rect.at[2] + 0.8, rect.at[3] + 0.8]);
    if (kind === "arrow" || kind === "line") {
      const startRect = rect.from || (p.from === undefined ? rect.at : null);
      const a = point(p.from ?? p.at), b = point(p.to);
      if (a && b) {
        if (startRect) p.from = fmt(edgeOf(startRect, b));
        if (rect.to) p.to = fmt(edgeOf(rect.to, a));
      }
    }
    return { id: m.id, props: p };
  });
  return scene({ w: 10, h: H }, out, { free: true });
}

// The point on a part's box [x, y, w, h] on the way to `toward`, with a small gap.
function edgeOf([x, y, w, h], toward) {
  const cx = x + w / 2, cy = y + h / 2;
  const dx = toward[0] - cx, dy = toward[1] - cy;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const rx = Math.abs(ux) > 1e-9 ? w / 2 / Math.abs(ux) : Infinity;
  const ry = Math.abs(uy) > 1e-9 ? h / 2 / Math.abs(uy) : Infinity;
  const r = Math.min(Math.min(rx, ry) + 0.15, len);
  return [cx + ux * r, cy + uy * r];
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
      if (!a || !b) {
        const words = it.kind === "swipe" ? ["swipe", it.label].filter(Boolean).join(", ") : it.label;
        if (words) bits.push(words);
        tail = null;
        continue;
      }
      const sign = `${it.kind === "arrow" ? " → " : " – "}${b}${it.label ? ` (${it.label})` : ""}`;
      if (tail !== null && tail === it.from.ref) bits[bits.length - 1] += sign;
      else bits.push(a + sign);
      tail = it.to.ref;
    } else if (it.kind === "venn" && (it.sets || []).length && !joined.has(it.i)) {
      const s = it.sets;
      bits.push(`${s.length > 1 ? `${s.slice(0, -1).join(", ")} and ${s[s.length - 1]} overlap` : s[0]}${it.label ? `: ${it.label}` : ""}`);
      tail = null;
    } else if (it.kind === "tap" && !joined.has(it.i)) {
      bits.push(["tap", it.label].filter(Boolean).join(", "));
      tail = null;
    } else if (it.label && !joined.has(it.i)) { bits.push(it.label); tail = null; }
  }
  return [sc.title, bits.join(", "), sc.caption].filter(Boolean).join(". ");
}
