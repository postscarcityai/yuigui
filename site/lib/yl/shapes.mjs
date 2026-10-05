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
export const CLOSED = ["circle", "box", "pill", "dot", "blob", "text", "callout", "contour"];
// `arc` is an arrow that bends; `bracket` spans two places with a label beyond it.
export const CONNECTORS = ["line", "arrow", "arc", "bracket"];
// Marks (YUI-298) are drawn on top of the picture, hand drawn and animated on:
// a scribble fills or rings a spot, an underline sits under a shape, a check is a tick.
export const MARKS = ["scribble", "underline", "check"];
export const KINDS = [...CLOSED, ...CONNECTORS, "path", ...MARKS];
export const TONES = ["accent", "mint", "lavender", "butter", "ink", "mute"];

// Default sizes in canvas units, [width, height].
const SIZE = { circle: [2, 2], box: [3, 2], pill: [3, 1.2], dot: [0.5, 0.5], blob: [2.6, 2.2], text: [3, 0.9], callout: [2.6, 1], contour: [4.4, 3.4] };

// The drawing kit: how far an arc bends by default (a share of its length,
// the side is the sign), how deep a bracket's ticks run, how many rings a
// contour has by default, and how strongly an overlapping fill shows.
export const BEND = 0.35;
export const TICK = 0.3;
export const RINGS = 4;
export const OVERLAP = 0.3;

// The clock, in seconds.
export const STEP = 0.35; // one part to the next
export const DUR = { fade: 0.35, grow: 0.5, draw: 0.7, mark: 0.5 };
export const MOVE = 0.8;
export const PULSE = 1.6; // one breath
// The hand: how far a hand drawn stroke strays from its true line, as a share
// of the drawing's width, and how far apart its wobble points sit (canvas units).
export const HAND = 0.009;
export const HAND_STEP = 0.35;
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
  if (CONNECTORS.includes(kind) || kind === "path" || kind === "contour" || MARKS.includes(kind)) return "draw";
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
  const loose = parts.filter((s) => s.closed && s.kind !== "contour" && !point(s.p.at));
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
    // +hand: a seeded roughened stroke (the seed is the part's place in the scene).
    if (p.hand && !MARKS.includes(kind) && !["text", "dot", "contour", "bracket", "callout"].includes(kind)) item.hand = true;
    if (s.closed) {
      // A contour is placed, never in the row: with no at= it sits in the middle.
      let at = point(p.at) || (kind === "contour" ? [W / 2, H / 2] : null);
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
      if (kind === "contour") item.rings = clamp(Math.round(num(p.rings) ?? RINGS), 2, 8);
      // A callout points at where `to=` says (a shape's id or a point).
      if (kind === "callout" && p.to !== undefined && p.to !== true) {
        const to = end(p.to, null, parts, s.i, 1);
        if (to) { item.from = { ref: s.i }; item.to = to; item.leader = true; }
      }
    } else if (MARKS.includes(kind)) {
      // A mark sits on a shape written before it (to=id) or at a place (at=).
      const pts = markPoints(kind, p, items, parts, W, H, s.i);
      if (!pts) continue;
      item.mark = kind;
      item.pts = pts;
      item.tone = TONES.includes(p.tone) ? p.tone : kind === "check" ? "mint" : "accent";
      item.fill = kind === "scribble" && !!p.fill;
      item.motion = "draw";
    } else if (kind === "path") {
      const pts = (Array.isArray(p.pts) ? p.pts : []).map(point).filter(Boolean);
      if (pts.length < 2) continue;
      item.pts = pts;
      // +close joins the last point back to the first (a zone, a contour);
      // +sharp keeps straight sides instead of the smooth curve.
      if (p.close && pts.length >= 3) { item.close = true; item.fill = !!p.fill; }
      if (p.sharp) item.sharp = true;
    } else {
      // A connector: from= and to= are a shape's id or a point. With neither,
      // it joins the closed shape before it to the one after it.
      item.from = end(p.from, p.at, parts, s.i, -1);
      item.to = end(p.to, null, parts, s.i, 1);
      if (!item.from || !item.to) continue;
      if (kind === "bracket") item.side = (num(p.bend) ?? 1) < 0 ? -1 : 1;
      else if (kind === "arc" || p.bend !== undefined) item.bend = clamp(num(p.bend) ?? BEND, -2, 2);
    }
    item.dur = item.mark ? DUR.mark : DUR[item.motion];
    items.push(item);
    t += STEP;
  }
  blend(items);
  const last = items.reduce((m, it) => Math.max(m, it.start + it.dur + (it.move ? MOVE : 0)), 0);
  return { w: W, h: H, fs: LABEL * W * k, title: h0.title ? String(h0.title) : "", caption: h0.caption ? String(h0.caption) : "", items, total: last };
}

// The hand drawn look. wobble(seed, k) is a smooth noise in [-1, 1] along a
// stroke, so a line drifts like a hand instead of buzzing; the same seed gives
// the same stroke on every renderer.
export const wobble = (seed, k) => 0.6 * Math.sin((seed + 1) * 12.9898 + k * 0.9) + 0.4 * Math.sin((seed + 1) * 78.233 + k * 2.1);
const r3 = (v) => Math.round(v * 1000) / 1000;

// A polyline roughened: every segment is cut into steps of about HAND_STEP and
// each point is pushed `amp` times wobble sideways. Open strokes end where they
// started (the last point is pushed too); closed ones join up. step=Infinity
// keeps the points you gave it.
export function rough(pts, seed, amp, closed = false, step = HAND_STEP) {
  const out = [];
  const n = pts.length;
  const segs = closed ? n : n - 1;
  let k = 0;
  for (let s = 0; s < segs; s++) {
    const a = pts[s], b = pts[(s + 1) % n];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const m = Number.isFinite(step) ? Math.max(1, Math.ceil(len / step)) : 1;
    for (let j = 0; j < m; j++) {
      const t = j / m, o = amp * wobble(seed, k++);
      out.push([r3(a[0] + dx * t - (dy / len) * o), r3(a[1] + dy * t + (dx / len) * o)]);
    }
  }
  if (!closed) {
    const a = pts[n - 2] || pts[0], b = pts[n - 1];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const o = amp * wobble(seed, k);
    out.push([r3(b[0] - ((b[1] - a[1]) / len) * o), r3(b[1] + ((b[0] - a[0]) / len) * o)]);
  }
  return out;
}

// A closed shape's true outline as points around (0, 0), for rough(): a
// circle as an ellipse, a box and a pill as their rectangle and stadium.
export function handOutline(kind, [w, h], seed, amp) {
  const x = w / 2, y = h / 2;
  if (kind === "blob") return { pts: rough(blobPoints(w, h, seed), seed, amp, true, Infinity), closed: true };
  if (kind === "circle") {
    const n = 20;
    return { pts: rough(Array.from({ length: n }, (_, j) => [Math.cos((2 * Math.PI * j) / n - Math.PI / 2) * x, Math.sin((2 * Math.PI * j) / n - Math.PI / 2) * y]), seed, amp, true, Infinity), closed: true };
  }
  if (kind === "pill") {
    const r = y, cx = Math.max(0, x - r);
    const arc = (c, a0) => Array.from({ length: 7 }, (_, j) => [c + Math.cos(a0 + (Math.PI * j) / 6) * r, Math.sin(a0 + (Math.PI * j) / 6) * r]);
    return { pts: rough([...arc(cx, -Math.PI / 2), ...arc(-cx, Math.PI / 2)], seed, amp, true), closed: true };
  }
  return { pts: rough([[-x, -y], [x, -y], [x, y], [-x, y]], seed, amp, true), closed: true };
}

// A mark's points in canvas units, already roughened (the numbers are in
// spec/shapes/scenes.json). `target` is the closed shape written before it
// that to= names; with no to=, at= (and size=) place it.
function markPoints(kind, p, items, parts, W, H, i) {
  const byId = typeof p.to === "string" && parts.find((s) => s.closed && s.id === p.to && s.i < i);
  const tgt = byId ? items.find((it) => it.i === byId.i && it.at) : null;
  if (typeof p.to === "string" && !tgt) return null;
  const at = point(p.at);
  const amp = HAND * W;
  const seed = i;
  const sz = size(p.size, "box");
  if (kind === "scribble") {
    const box = tgt ? [tgt.at[0], tgt.at[1], tgt.size[0] + 0.5, tgt.size[1] + 0.5] : at ? [at[0], at[1], ...(sz || [2, 1.2])] : null;
    if (!box) return null;
    const [cx, cy, bw, bh] = box;
    if (p.fill) {
      // Back and forth strokes down the box.
      const rows = clamp(Math.round(bh / 0.2), 3, 14);
      const pts = [];
      for (let r = 0; r <= rows; r++) {
        const y = cy - bh / 2 + (bh * r) / rows;
        pts.push(r % 2 ? [cx + bw / 2, y] : [cx - bw / 2, y]);
        pts.push(r % 2 ? [cx - bw / 2, y] : [cx + bw / 2, y]);
      }
      return rough(pts, seed, amp * 0.5);
    }
    // Two loops round the spot, the second a little wider, ending open.
    const n = 44;
    const pts = Array.from({ length: n + 1 }, (_, j) => {
      const a = -Math.PI / 2 + (2.15 * 2 * Math.PI * j) / n;
      const g = 1 + 0.08 * (j / n) * 2;
      return [cx + Math.cos(a) * (bw / 2) * g, cy + Math.sin(a) * (bh / 2) * g];
    });
    return rough(pts, seed, amp * 0.6, false, Infinity);
  }
  if (kind === "underline") {
    const c = tgt ? [tgt.at[0], tgt.at[1] + tgt.size[1] / 2 + 0.2, tgt.size[0] * 0.95] : at ? [at[0], at[1], sz ? sz[0] : 2] : null;
    if (!c) return null;
    return rough([[c[0] - c[2] / 2, c[1] + 0.03], [c[0] + c[2] / 2, c[1] - 0.04]], seed, amp * 0.7);
  }
  // check: a short stroke down, a long one up.
  const s = num(p.size) ?? 1;
  const c = tgt ? [tgt.at[0] + tgt.size[0] / 2 + 0.6 * s, tgt.at[1]] : at;
  if (!c) return null;
  return rough([[c[0] - 0.4 * s, c[1] + 0.02 * s], [c[0] - 0.12 * s, c[1] + 0.34 * s], [c[0] + 0.42 * s, c[1] - 0.36 * s]], seed, amp * 0.4, false, 0.18);
}

// Filled shapes that cross read as an overlap (a Venn): each of two filled
// parts whose boxes meet takes the blend, so the CSS multiply (screen in the
// dark look) shows where they cross and the wash is a little stronger.
function box(it) {
  if (it.at) return [it.at[0] - it.size[0] / 2, it.at[1] - it.size[1] / 2, it.at[0] + it.size[0] / 2, it.at[1] + it.size[1] / 2];
  if (it.pts && it.close) {
    const xs = it.pts.map((q) => q[0]), ys = it.pts.map((q) => q[1]);
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  }
  return null;
}
function blend(items) {
  const filled = items.filter((it) => it.fill && it.kind !== "dot" && it.kind !== "text" && box(it));
  for (const a of filled) {
    for (const b of filled) {
      if (a === b) continue;
      const [x0, y0, x1, y1] = box(a), [u0, v0, u1, v1] = box(b);
      if (x0 < u1 && u0 < x1 && y0 < v1 && v0 < y1) { a.blend = true; break; }
    }
  }
}

// How much of a closed shape's width its label may use.
const SHARE = { circle: 0.78, blob: 0.74, box: 0.88, pill: 0.8, callout: 0.88, contour: 0.4 };
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
    else if (kind === "box" || kind === "callout") { const w = Math.max(2.25, widest / SHARE.box + 0.3); sz = [w, Math.max(1.5, lines(p.label, w * SHARE.box) * LINE * fs + 0.5)]; }
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

// A contour's rings around (0, 0), inner to outer: `n` closed outlines of
// the w by h box, each a coherent wobble of the same noise so they nest
// like the lines of a map. Points to join with the smooth curve.
export function ringPoints(w, h, seed, ring, n) {
  const m = 9;
  const scale = (ring + 1) / n;
  const pts = [];
  for (let j = 0; j < m; j++) {
    const ang = (2 * Math.PI * j) / m - Math.PI / 2;
    const r = 1 + 0.1 * Math.sin((seed + 1) * 12.9898 + j * 78.233 + ring * 0.5);
    pts.push([Math.cos(ang) * (w / 2) * r * scale * 0.94, Math.sin(ang) * (h / 2) * r * scale * 0.94]);
  }
  return pts;
}

// A bent connector as a quadratic: its control point. The middle of the curve
// is pushed `bend` times the connector's length to the left of a to b (up,
// when it runs left to right; a negative bend pushes the other way), so the
// control sits twice as far.
export function control(a, b, bend) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  return [(a[0] + b[0]) / 2 + 2 * bend * dy, (a[1] + b[1]) / 2 - 2 * bend * dx];
}

// The quadratic a to b through c, cut at t: the point and the direction there.
export function along(a, c, b, t) {
  const q0 = [a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t];
  const q1 = [c[0] + (b[0] - c[0]) * t, c[1] + (b[1] - c[1]) * t];
  return { q0, tip: [q0[0] + (q1[0] - q0[0]) * t, q0[1] + (q1[1] - q0[1]) * t], dir: [q1[0] - q0[0], q1[1] - q0[1]] };
}

// A bracket from a to b: tick, spine, tick, ticks to the side `side`
// (1: up when a to b runs left to right). Returns the three corner points
// and the unit direction the ticks point, so the label sits on the other side.
export function bracketPoints(a, b, side, depth) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const n = [(dy / len) * side, (-dx / len) * side];
  return { pts: [[a[0] + n[0] * depth, a[1] + n[1] * depth], a, b, [b[0] + n[0] * depth, b[1] + n[1] * depth]], n };
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
  for (const it of sc.items) if (it.from && !it.leader && name(it.from) && name(it.to)) { joined.add(it.from.ref); joined.add(it.to.ref); }
  const bits = [];
  let tail = null; // the ref the last chain ended on
  for (const it of sc.items) {
    if (it.from && !it.leader) {
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
