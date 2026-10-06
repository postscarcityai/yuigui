// Decks that move on the web (YUI-307), the twin of the app's Yui/Sources/Presets/DeckMorph.swift
// (TestFlight feedback ANhbech_, AMt71OZy, AHdP_lC4, Oct 5: "a shitty PowerPoint deck, cards and cards").
// A full deck is one stage: every page's `shapes` picture becomes glyphs (outlines sampled as points),
// the glyphs of two pages are matched (an @id, else the same label, else the same family in line order),
// and `tween` draws the stage any share of the way between them, so a swipe scrubs the drawing from one
// page into the next. Pure functions, no DOM: app/components/MorphDeck.js draws what `tween` returns.
// The pairing order and the numbers are the Swift file's, line for line.
//   node site/lib/web/deckmorph.test.mjs
import { HAND, TICK, along, blobPoints, bracketPoints, control, handOutline, labelWidth, LABEL, rough, scene, smooth, wrap, frame } from "../yl/shapes.mjs";

/** Points round a closed outline, and along an open stroke (two strands make one ring, so a loop can fold into a line and back). */
export const RING = 72;
export const STRAND = 36;
/** The biggest a label gets on the stage, in px, however far the camera zooms in. */
export const MAX_FONT = 30;
const GLYPH = 0.56; // a glyph's width as a share of the font size (shapes.mjs)
const LINE = 1.15; // line height as a share of the font size

const CONNECTORS = new Set(["line", "arrow", "arc", "bracket"]);

// ---- geometry ----

export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const smooth3 = (t) => t * t * (3 - 2 * t);
const mixp = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

export function mid(pts) {
  if (!pts.length) return [0, 0];
  const x = pts.map((p) => p[0]), y = pts.map((p) => p[1]);
  return [(Math.min(...x) + Math.max(...x)) / 2, (Math.min(...y) + Math.max(...y)) / 2];
}

/** A closed shape's outline round (0, 0): an ellipse, a rounded box or a stadium, or the blob. */
export function outline(kind, sz, seed) {
  const x = sz[0] / 2, y = sz[1] / 2;
  if (kind === "circle" || kind === "dot") {
    return Array.from({ length: RING }, (_, k) => {
      const a = (2 * Math.PI * k) / RING - Math.PI / 2;
      return [Math.cos(a) * x, Math.sin(a) * y];
    });
  }
  if (kind === "blob") return densify(blobPoints(sz[0], sz[1], seed), true);
  const r = kind === "pill" ? y : Math.min(0.3, y / 2);
  const cx = Math.max(0, x - r), cy = Math.max(0, y - r);
  const arc = (ox, oy, a0) => Array.from({ length: 7 }, (_, j) => {
    const a = a0 + (Math.PI / 2) * (j / 6);
    return [ox + Math.cos(a) * r, oy + Math.sin(a) * r];
  });
  // From the top middle, clockwise on screen.
  return [[0, -y], ...arc(cx, -cy, -Math.PI / 2), ...arc(cx, cy, 0), ...arc(-cx, cy, Math.PI / 2), ...arc(-cx, -cy, Math.PI)];
}

/** Points through a Catmull-Rom curve, eight to a span. */
export function densify(pts, closed) {
  if (!(pts.length > 2 || (closed && pts.length > 1))) return pts;
  const out = [pts[0]];
  let p0 = pts[0];
  for (const [c1, c2, p] of smooth(pts, closed)) {
    for (let j = 1; j <= 8; j++) {
      const t = j / 8, u = 1 - t;
      out.push([u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p[0],
        u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p[1]]);
    }
    p0 = p;
  }
  if (closed) out.pop();
  return out;
}

/** `n` points evenly spaced along a polyline (round a loop when `closed`). */
export function resample(pts, n, closed) {
  if (!(pts.length > 1 && n > 1)) return Array.from({ length: Math.max(n, 1) }, () => pts[0] || [0, 0]);
  const path = closed ? [...pts, pts[0]] : pts;
  const acc = [0];
  for (let k = 1; k < path.length; k++) acc.push(acc[k - 1] + Math.hypot(path[k][0] - path[k - 1][0], path[k][1] - path[k - 1][1]));
  const total = acc[acc.length - 1];
  if (!(total > 1e-9)) return Array.from({ length: n }, () => pts[0]);
  const out = [];
  let seg = 1;
  for (let k = 0; k < n; k++) {
    const d = (total * k) / (closed ? n : n - 1);
    while (seg < path.length - 1 && acc[seg] < d) seg++;
    const span = Math.max(acc[seg] - acc[seg - 1], 1e-9);
    const t = clamp((d - acc[seg - 1]) / span, 0, 1);
    out.push([lerp(path[seg - 1][0], path[seg][0], t), lerp(path[seg - 1][1], path[seg][1], t)]);
  }
  return out;
}

/** A loop of RING points, clockwise on screen, starting at its top: two loops line up point for point, so one can turn into the other without twisting. */
export function loop(pts) {
  const p = resample(pts, RING, true);
  let area = 0;
  for (let k = 0; k < p.length; k++) { const q = p[(k + 1) % p.length]; area += p[k][0] * q[1] - q[0] * p[k][1]; }
  if (area < 0) p.reverse();
  const c = mid(p);
  const score = (a) => { const d = [p[a][0] - c[0], p[a][1] - c[1]]; return -d[1] / Math.max(Math.hypot(d[0], d[1]), 1e-9); };
  let top = 0;
  for (let a = 1; a < p.length; a++) if (score(a) >= score(top)) top = a; // Swift's max(by:) keeps the last of equals
  return [...p.slice(top), ...p.slice(0, top)];
}

/** Points as a loop of RING: a loop stays one, a stroke runs out and back, so it can open into a loop. */
export function asLoop(pts, closed) {
  if (closed) return pts.length === RING ? pts : loop(pts);
  const half = resample(pts, RING / 2, false);
  return [...half, ...[...half].reverse()];
}

// ---- pages ----

/** The id a person wrote (`shape@string`), not one the parser made up (n12, c3). */
export const explicit = (id) => (typeof id === "string" && id && !/^[nc]\d+$/.test(id) ? id : null);

/** The family of a glyph, for matching shapes that have no name: a closed shape 0, a connector 1, a stroke 2. */
export const familyOf = (g) => (CONNECTORS.has(g.kind) ? 1 : g.closed || !g.pts.length ? 0 : 2);

const newGlyph = (f, over) => ({
  key: explicit(f.id), kind: f.kind, label: f.label || "", tone: f.tone, fill: !!f.fill, dash: !!f.dash, pulse: !!f.pulse,
  closed: false, head: false, pts: [], center: [0, 0], labelAt: [0, 0], labelWidth: 0, inside: false, weight: 1, ...over,
});

/**
 * A `shapes` picture as glyphs; null when it holds a part only the full drawing can draw (a contour):
 * that page cross-fades instead. head: the `shapes` props, members: [{ id, props }] in line order.
 */
export function page(head, members) {
  const sc = scene(head, members);
  if (!sc.items.length) return null;
  const fs = sc.fs, lw = 0.0075 * sc.w, k = sc.fs / (LABEL * sc.w);
  const out = [];
  for (const f of frame(sc, Infinity)) {
    if (f.kind === "contour") return null;
    const g = newGlyph(f, { labelWidth: labelWidth(f, k) });
    if (f.mark && f.pts) {
      g.pts = resample(f.mark === "check" || (f.mark === "scribble" && f.fill) ? f.pts : densify(f.pts, false), STRAND, false);
      g.weight = 1.3;
      g.fill = false;
      g.center = mid(g.pts);
      g.labelAt = g.center;
    } else if (f.a && f.b && !f.c) {
      let path;
      if (f.kind === "bracket") path = bracketPoints(f.a, f.b, f.side ?? 1, TICK * (lw / 0.075)).pts;
      else if (f.bend !== undefined) {
        const q = control(f.a, f.b, f.bend);
        path = Array.from({ length: 25 }, (_, j) => along(f.a, q, f.b, j / 24).tip);
      } else path = [f.a, f.b];
      if (f.hand) path = rough(path, f.i, HAND * sc.w, false);
      g.pts = resample(f.hand ? densify(path, false) : path, STRAND, false);
      g.head = f.kind === "arrow" || f.kind === "arc";
      g.fill = false;
      const m = g.pts[Math.floor(g.pts.length / 2)];
      g.center = m;
      g.labelAt = [m[0], m[1] - fs * 0.75];
    } else if (f.pts) {
      const line = f.hand ? rough(f.pts, f.i, HAND * sc.w, !!f.close) : f.pts;
      const dense = f.sharp ? (f.close ? [...line, line[0]] : line) : densify(line, !!f.close);
      if (f.close) { g.closed = true; g.pts = loop(dense); } else g.pts = resample(dense, STRAND, false);
      const m = f.pts[Math.floor(f.pts.length / 2)];
      g.labelAt = [m[0], m[1] - fs * 0.85];
      g.center = mid(g.pts);
    } else if (f.c && f.size) {
      g.center = f.c;
      g.labelAt = f.c;
      if (f.kind === "text") g.pts = [];
      else {
        g.closed = true;
        const rel = f.hand ? densify(handOutline(f.kind, f.size, f.i, HAND * sc.w).pts, true) : outline(f.kind, f.size, f.i);
        g.pts = loop(rel.map((p) => [p[0] + f.c[0], p[1] + f.c[1]]));
        g.inside = f.kind !== "dot";
        if (f.kind === "dot") {
          g.fill = true;
          g.labelAt = [f.c[0], f.c[1] + f.size[1] / 2 + fs * 0.85];
        }
      }
      if (f.leader && f.a && f.b) {
        // A callout's leader is a line of its own, so it can come and go with the box.
        out.push(newGlyph({ id: g.key ? `${g.key}.leader` : null, kind: "line", label: "", tone: f.tone, dash: f.dash },
          { pts: resample([f.a, f.b], STRAND, false), center: mid([f.a, f.b]), labelAt: f.b }));
      }
    } else continue;
    out.push(g);
  }
  if (!out.length) return null;
  return { glyphs: out, bounds: bounds(out, fs), fs, lw };
}

/** What the glyphs cover, labels included, with a little air round it. */
export function bounds(gs, fs) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const take = (p) => { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); };
  for (const g of gs) {
    g.pts.forEach(take);
    if (g.label) {
      const lines = wrap(g.label, Math.max(g.labelWidth, 1), fs);
      const w = (Math.max(0, ...lines.map((l) => l.length)) * GLYPH * fs) / 2;
      const h = (lines.length * LINE * fs) / 2;
      take([g.labelAt[0] - w, g.labelAt[1] - h]); take([g.labelAt[0] + w, g.labelAt[1] + h]);
    }
  }
  if (!Number.isFinite(x0)) return [0, 0, 1, 1];
  const pad = fs * 0.8;
  return [x0 - pad, y0 - pad, x1 + pad, y1 + pad];
}

/** The camera that frames a page's drawing in a `w` by `h` stage, as big as it fits, never so close that a label passes MAX_FONT or a lone dot fills the screen. */
export function camera(p, w, h) {
  const b = p.bounds;
  const bw = Math.max(b[2] - b[0], 0.5), bh = Math.max(b[3] - b[1], 0.5);
  let s = Math.min(w / bw, h / bh);
  s = Math.min(s, MAX_FONT / Math.max(p.fs, 1e-6), w / 3.2);
  return { s, o: [w / 2 - ((b[0] + b[2]) / 2) * s, h / 2 - ((b[1] + b[3]) / 2) * s] };
}
const at = (cam, p) => [p[0] * cam.s + cam.o[0], p[1] * cam.s + cam.o[1]];
const mixCam = (a, b, t) => ({ s: lerp(a.s, b.s, t), o: [lerp(a.o[0], b.o[0], t), lerp(a.o[1], b.o[1], t)] });

// ---- matching ----

/**
 * Which glyph on page a becomes which on page b: the same @id first, then the same label, then unlabelled
 * glyphs of one family in line order. The rest leave (a only) or arrive (b only). Leaving glyphs come first
 * so they draw under the page coming in. Returns [{ a, b }] of indexes, null for nothing there.
 */
export function match(a, b) {
  const toA = new Map();
  const used = new Set();
  const link = (i, j) => { toA.set(j, i); used.add(i); };
  const free = (pred) => a.findIndex((g, i) => !used.has(i) && pred(g));
  b.forEach((g, j) => {
    if (g.key == null) return;
    const i = free((x) => x.key === g.key);
    if (i >= 0) link(i, j);
  });
  const norm = (s) => String(s).trim().toLowerCase();
  b.forEach((g, j) => {
    if (toA.has(j) || !norm(g.label)) return;
    // A named glyph never takes one that has a name of its own elsewhere on page b.
    const i = free((x) => (x.key == null || !b.some((y) => y.key === x.key)) && norm(x.label) === norm(g.label));
    if (i >= 0) link(i, j);
  });
  b.forEach((g, j) => {
    if (toA.has(j) || g.label || g.key != null) return;
    const i = free((x) => !x.label && x.key == null && familyOf(x) === familyOf(g));
    if (i >= 0) link(i, j);
  });
  const out = a.map((_, i) => i).filter((i) => !used.has(i)).map((i) => ({ a: i, b: null }));
  b.forEach((_, j) => out.push({ a: toA.has(j) ? toA.get(j) : null, b: j }));
  return out;
}

// ---- the tween ----

const fillOf = (g) => (g.kind === "dot" ? 1 : g.fill ? 0.18 : 0);

function ink(g, cam, label, opacity, pg, key) {
  return {
    key, pts: g.pts.map((p) => at(cam, p)), closed: g.closed, head: g.head ? 1 : 0, fill: fillOf(g), dash: g.dash, toneA: g.tone,
    toneB: g.tone, mix: 0, opacity, trim: 1, label, labelOpacity: opacity, labelAt: at(cam, g.labelAt),
    labelWidth: g.labelWidth * cam.s, fs: pg.fs * cam.s, lw: pg.lw * cam.s * g.weight, inside: g.inside,
    center: at(cam, g.center), pulse: g.pulse, dot: g.kind === "dot",
  };
}

/** A label on its way from `a` to `b`: the old one backs out letter by letter, the new one types itself in. */
export function retype(a, b, t) {
  if (a === b) return { text: a, opacity: a ? 1 : 0 };
  if (t < 0.5) {
    const n = Math.ceil(a.length * (1 - t * 2));
    return { text: a.slice(0, n), opacity: n > 0 ? 1 : 0 };
  }
  const n = Math.ceil(b.length * (t * 2 - 1));
  return { text: b.slice(0, n), opacity: n > 0 ? 1 : 0 };
}

/**
 * The stage `t` of the way from page a to page b (either may be null: nothing there), in px on a `w` by `h`
 * stage. `still` is Reduce Motion: no shape moves, a cross-fade only. Every ink has a `key`: an @id carries
 * the same key on both sides, so the renderer keeps one DOM node for a shape that goes from page to page.
 */
export function tween(a, b, raw, w, h, still = false) {
  const t = clamp(raw, 0, 1);
  if (!a && !b) return [];
  const camA = camera(a || b, w, h), camB = camera(b || a, w, h);
  const uniq = new Set();
  const keyed = (base) => { let k = base, n = 1; while (uniq.has(k)) k = `${base}~${n++}`; uniq.add(k); return k; };
  const idKey = (g, side, i) => (g.key != null ? `@${g.key}` : `${side}${i}`);
  if (still) {
    const fade = [
      ...(a ? a.glyphs.map((g, i) => ink(g, camA, g.label, 1 - t, a, keyed(idKey(g, "a", i)))) : []),
      ...(b ? b.glyphs.map((g, i) => ink(g, camB, g.label, t, b, keyed(idKey(g, "b", i)))) : []),
    ];
    return fade.filter((i) => i.opacity > 0.001);
  }
  const e = smooth3(t);
  const cam = mixCam(camA, camB, e);
  const fsA = (a || b).fs, fsB = (b || a).fs, lwA = (a || b).lw, lwB = (b || a).lw;
  const fs = lerp(fsA, fsB, e), lw = lerp(lwA, lwB, e);
  const out = [];
  for (const p of match(a ? a.glyphs : [], b ? b.glyphs : [])) {
    const ga = p.a != null ? a.glyphs[p.a] : null, gb = p.b != null ? b.glyphs[p.b] : null;
    if (ga && gb) {
      let pa = ga.pts, pb = gb.pts;
      if (!pa.length) pa = Array.from({ length: Math.max(pb.length, 1) }, () => ga.center);
      if (!pb.length) pb = Array.from({ length: Math.max(pa.length, 1) }, () => gb.center);
      if (pa.length !== pb.length || ga.closed !== gb.closed) {
        const loops = ga.closed || gb.closed;
        pa = loops ? asLoop(pa, ga.closed) : resample(pa, STRAND, false);
        pb = loops ? asLoop(pb, gb.closed) : resample(pb, STRAND, false);
      }
      const pts = pa.map((q, i) => at(cam, [lerp(q[0], pb[i][0], e), lerp(q[1], pb[i][1], e)]));
      const label = retype(ga.label, gb.label, t);
      const lo = e < 0.5 ? ga : gb;
      out.push({
        key: keyed(ga.key != null ? `@${ga.key}` : gb.key != null ? `@${gb.key}` : `m${p.a}`),
        pts: !ga.pts.length && !gb.pts.length ? [] : pts, closed: lo.closed, head: lerp(ga.head ? 1 : 0, gb.head ? 1 : 0, e),
        fill: lerp(fillOf(ga), fillOf(gb), e), dash: lo.dash, toneA: ga.tone, toneB: gb.tone, mix: e, opacity: 1, trim: 1,
        label: label.text, labelOpacity: label.opacity, labelAt: at(cam, mixp(ga.labelAt, gb.labelAt, e)),
        labelWidth: lerp(ga.labelWidth, gb.labelWidth, e) * cam.s, fs: fs * cam.s, lw: lw * cam.s * lerp(ga.weight, gb.weight, e),
        inside: lo.inside, center: at(cam, mixp(ga.center, gb.center, e)), pulse: lo.pulse, dot: lo.kind === "dot",
      });
    } else if (ga) {
      // Leaving: it shrinks toward its own middle and dissolves in the first part of the swipe.
      const k = 1 - 0.3 * e;
      const g = { ...ga, pts: ga.pts.map((q) => [ga.center[0] + (q[0] - ga.center[0]) * k, ga.center[1] + (q[1] - ga.center[1]) * k]) };
      const i = ink(g, cam, ga.label, clamp(1 - t * 1.8, 0, 1), a, keyed(idKey(ga, "a", p.a)));
      i.fs = fs * cam.s * k;
      out.push(i);
    } else if (gb) {
      // Arriving: its outline draws on, its fill washes in, its label types itself out.
      const d = smooth3(clamp((t - 0.15) / 0.85, 0, 1));
      const i = ink(gb, cam, gb.label, d > 0 ? 1 : 0, b, keyed(idKey(gb, "b", p.b)));
      i.trim = d;
      i.fill *= d;
      i.head *= d > 0.85 ? 1 : 0;
      const typed = Math.ceil(gb.label.length * clamp((t - 0.35) / 0.6, 0, 1));
      i.label = gb.label.slice(0, typed);
      i.labelOpacity = typed > 0 ? 1 : 0;
      i.fs = fs * cam.s;
      out.push(i);
    }
  }
  return out;
}

// ---- life ----

/**
 * A page at rest still breathes: the drawing floats a little, each shape swells and settles on its own beat,
 * a +pulse shape beats harder, and a +pulse stroke ripples like a plucked string. `time` in seconds.
 */
export function alive(inks, time, amp) {
  const fx = Math.sin(time * 0.43) * amp, fy = Math.sin(time * 0.31 + 1.7) * amp * 0.8;
  return inks.map((i, k) => {
    const beat = (i.pulse ? 0.05 : 0.014) * Math.sin(time * (i.pulse ? 3.9 : 1.1) + k * 1.37);
    const s = 1 + beat;
    const move = (p) => [i.center[0] + (p[0] - i.center[0]) * s + fx, i.center[1] + (p[1] - i.center[1]) * s + fy];
    let pts;
    if (i.pulse && !i.closed && i.pts.length > 2) {
      // A standing wave along the stroke, its ends held.
      const n = i.pts.length - 1;
      pts = i.pts.map((p, j) => {
        const prev = i.pts[Math.max(0, j - 1)], next = i.pts[Math.min(n, j + 1)];
        const dx = next[0] - prev[0], dy = next[1] - prev[1];
        const len = Math.max(Math.hypot(dx, dy), 1e-9);
        const u = j / n;
        const wave = Math.sin(u * Math.PI * 3 - time * 6) * Math.sin(u * Math.PI) * amp * 2.2;
        return [p[0] - (dy / len) * wave + fx, p[1] + (dx / len) * wave + fy];
      });
    } else pts = i.pts.map(move);
    return { ...i, pts, center: [i.center[0] + fx, i.center[1] + fy], labelAt: move(i.labelAt), fs: i.fs * (i.inside ? s : 1) };
  });
}

// ---- the deck on the stage ----

/**
 * The deck an answer is, when it is only a deck: every chunk a page of one deck, a shapes picture on at least one,
 * no questions waiting at the end (a quiz keeps the stage's own page-by-page player). Returns
 * [{ title, body, points, shapes: { head, members } | null, pic: node | null, page: Page | null }] or null.
 */
export function deckOf(answer) {
  if (!answer || answer.parts.length !== 1 || answer.questions.length || answer.plan || answer.chunks.length < 2) return null;
  const part = answer.parts[0];
  if (!part.nodes.some((n) => n.preset === "deck")) return null;
  const pages = [];
  for (const c of answer.chunks) {
    if (c.text != null || c.part !== 0) return null;
    const pic = c.pic;
    let shapes = null;
    if (pic?.preset === "shapes") shapes = { head: pic.props || {}, members: part.nodes.filter((n) => n.in === pic.id && n.preset === "shape").map((n) => ({ id: n.id, props: n.props })) };
    else if (pic?.preset === "shape") shapes = { head: {}, members: [{ id: pic.id, props: pic.props }] };
    pages.push({
      key: c.key, title: c.page?.title || c.line || "", body: c.page?.body || "", points: c.page?.points ? [].concat(c.page.points) : [],
      shapes, pic: shapes ? null : pic || null, page: shapes ? page(shapes.head, shapes.members) : null,
    });
  }
  return pages.some((p) => p.shapes) ? pages : null;
}

/** Where a swipe of `dx` px from `from` (in pages) lands: pos is in pages, `width` the stage's width. */
export const scrubTo = (from, dx, width, n) => clamp(from - dx / Math.max(width, 1), 0, n - 1);

/** Where a released swipe settles: the nearest page, a flick (px per second) carries it one more. */
export function settle(pos, velocity, width, n) {
  const flick = clamp((-velocity / Math.max(width, 1)) * 0.18, -0.5, 0.5);
  return clamp(Math.round(pos + flick), 0, n - 1);
}

/** A tap on the stage: the left third turns back, the rest turns on (YUI-288). Null at an end. */
export function turnFor(x, left, width, at, n) {
  if (!(width > 0) || n < 2) return null;
  const back = (x - left) / width < 1 / 3;
  const to = at + (back ? -1 : 1);
  return to < 0 || to > n - 1 ? null : to;
}

/**
 * What the drawing shows at `pos` (in pages) on a `w` by `h` stage: the tween between the pages either side,
 * and at rest on a page (or a page with no shapes) just that page. `time` breathes it when not `still`.
 * `enter` (0 to 1) draws the page that was just opened on from nothing.
 */
export function drawing(pages, pos, w, h, { time = 0, still = false, enter = 1 } = {}) {
  if (!pages.length || w < 2 || h < 2) return [];
  const p = clamp(pos, 0, pages.length - 1);
  const i = Math.floor(p), t = p - i;
  let inks;
  if (t < 0.0005) inks = tween(null, pages[i].page, enter, w, h, still);
  else inks = tween(pages[i].page, i + 1 < pages.length ? pages[i + 1].page : null, t, w, h, still);
  return still ? inks : alive(inks, time, 2.2);
}
