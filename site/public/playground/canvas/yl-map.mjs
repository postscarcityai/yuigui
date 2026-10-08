// YUI-336: maps on the living canvas. A `map` answer (areas, pins, routes; spec/YL.md under map) becomes marks drawn on the same canvas clock
// as a film: a light world outline first, then each `area` fills in, each `pin` drops and each `route` draws along its path, in line order
// (the reference clock, fit and label placement are site/lib/yl/map.mjs, copied next to the canvas). No tiles and no network: the outline is
// the Natural Earth data the site already ships. Every area, pin and route is a hit target named by its label, so tap, hold, drag (a pin) and
// the keyboard model of YUI-321/324 work unchanged: `map:<block id>:<area|pin|route>:<label slug>` is the mark id.
import { scene, frame, latlon } from "./yl/map.mjs";
import { COUNTRIES } from "./yl/world.mjs";

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const slug = (s) => String(s).trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 28);
const LEAD = 0.5;   // seconds the world outline takes before the first part starts

// "M1 2L3 4Z M..." (scene paths, drawing units) to rings of [x, y]
function ringsOf(path) {
  const out = [];
  for (const r of String(path || "").split("M")) {
    if (!r) continue;
    out.push(r.replace(/Z$/, "").split("L").map((p) => { const i = p.indexOf(" "); return [+p.slice(0, i), +p.slice(i + 1)]; }));
  }
  return out;
}
// Drop the points that fall within `gap` units of the last kept one: the world outline has far more points than a phone has pixels.
function thin(ring, gap) {
  const out = [ring[0]], g2 = gap * gap;
  let [lx, ly] = ring[0];
  for (let i = 1; i < ring.length - 1; i++) { const dx = ring[i][0] - lx, dy = ring[i][1] - ly; if (dx * dx + dy * dy >= g2) { out.push(ring[i]); lx = ring[i][0]; ly = ring[i][1]; } }
  if (ring.length > 1) out.push(ring[ring.length - 1]);
  return out;
}
const bbox = (r) => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of r) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } return [x0, y0, x1, y1]; };

// The part of an outline inside the frame [0, w] x [0, h], as open runs (Liang-Barsky per segment): the world outline stops at the edge of the map.
function clipRuns(ring, w, h) {
  const runs = [];
  let cur = null;
  for (let i = 0; i + 1 < ring.length; i++) {
    const [x0, y0] = ring[i], dx = ring[i + 1][0] - x0, dy = ring[i + 1][1] - y0;
    let t0 = 0, t1 = 1, ok = true;
    for (const [pp, qq] of [[-dx, x0], [dx, w - x0], [-dy, y0], [dy, h - y0]]) {
      if (pp === 0) { if (qq < 0) { ok = false; break; } continue; }
      const r = qq / pp;
      if (pp < 0) { if (r > t1) { ok = false; break; } if (r > t0) t0 = r; } else { if (r < t0) { ok = false; break; } if (r < t1) t1 = r; }
    }
    if (!ok) { cur = null; continue; }
    const a = [x0 + dx * t0, y0 + dy * t0], b = [x0 + dx * t1, y0 + dy * t1];
    if (!cur || t0 > 0) { cur = [a]; runs.push(cur); }
    cur.push(b);
    if (t1 < 1) cur = null;
  }
  return runs.filter((r) => r.length > 1);
}
// A filled region cut to the frame (Sutherland-Hodgman against its four sides).
function clipPoly(ring, w, h) {
  let pts = ring;
  const sides = [[0, 1, 0], [0, -1, w], [1, 1, 0], [1, -1, h]];   // axis, inside sign, edge
  for (const [ax, sg, e] of sides) {
    const out = [], inside = (p) => (p[ax] - e) * sg >= 0;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length], ia = inside(a), ib = inside(b);
      if (ia) out.push(a);
      if (ia !== ib) { const k = (e - a[ax]) / (b[ax] - a[ax]), q = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]; q[ax] = e; out.push(q); }
    }
    pts = out;
    if (!pts.length) break;
  }
  return pts.length > 2 ? pts : null;
}

// Which country holds a point (even-odd over the 0.1 degree rings), or null at sea. Only called when a pin is dropped.
export function whereIs(lat, lon) {
  for (const code of Object.keys(COUNTRIES)) for (const f of COUNTRIES[code].rings) {
    let inside = false;
    for (let i = 0, j = f.length - 2; i < f.length; i += 2) {
      const xi = f[i], yi = f[i + 1], xj = f[j], yj = f[j + 1];
      if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
      j = i;
    }
    if (inside) return COUNTRIES[code].name;
  }
  return null;
}
export const ll = (lat, lon) => `${Math.abs(lat)}°${lat < 0 ? "S" : "N"}, ${Math.abs(lon)}°${lon < 0 ? "W" : "E"}`;

// A point along a line that no pin sits on (the middle of a three-stop route is a pin): the first of the usual spots at least 28 px from every pin, else the farthest.
function clearSpot(pts, pins) {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const L = cum[cum.length - 1] || 1;
  let best = null, bd = -1;
  for (const u of [0.5, 0.4, 0.6, 0.3, 0.7, 0.2, 0.8]) {
    let j = 1; while (j < pts.length - 1 && cum[j] < u * L) j++;
    const k = clamp((u * L - cum[j - 1]) / ((cum[j] - cum[j - 1]) || 1), 0, 1), p = [pts[j - 1][0] + (pts[j][0] - pts[j - 1][0]) * k, pts[j - 1][1] + (pts[j][1] - pts[j - 1][1]) * k];
    const d = pins.reduce((a, q) => Math.min(a, Math.hypot(q[0] - p[0], q[1] - p[1])), 1e9);
    if (d >= 28) return p;
    if (d > bd) { bd = d; best = p; }
  }
  return best;
}

// d: { id, head, items } (the map line and its area / pin / route rows). host: { chooseBlock, HOLD, AUTO_ID, TONE, sample }.
export function mapFilm(d, read0, host) {
  const { AUTO_ID, TONE, HOLD } = host;
  const members = d.items.map((o) => ({ id: AUTO_ID.test(o.id) ? null : o.id, preset: o.preset, props: o.props }));
  const sc = scene(d.head, members);
  if (!sc.items.length && !sc.title) return null;
  const land = ringsOf(sc.land).map((r) => ({ r, b: bbox(r) }));
  const used = new Set(), items = sc.items.map((it) => {
    const mem = d.items[it.i], props = (mem && mem.props) || {};
    const via = (it.names || []).filter(Boolean);
    const label = it.label || (it.kind === "area" ? (it.names || []).join(", ") : it.kind === "route" ? via.join(" to ") : "") || (it.kind === "area" ? "Area" : it.kind === "pin" ? "Pin" : "Route");
    let id = `map:${d.id}:${it.kind}:${slug(label) || it.kind + it.i}`;
    for (let n = 2; used.has(id); n++) id = `map:${d.id}:${it.kind}:${slug(label) || it.kind}_${n}`;
    used.add(id);
    let words;
    if (it.kind === "area") {
      const names = it.names || [];
      words = `${it.label && names.length ? `${it.label} covers ${names.join(", ")}.` : `${label}.`}${it.dash ? " Dashed: not quite there." : ""}`;
    } else if (it.kind === "pin") {
      const at = latlon(props.at);
      words = `${label}.${it.pulse ? " The one to look at." : ""}${at ? ` ${ll(at[0], at[1])}.` : ""}`;
    } else words = `${label}${via.length >= 2 && it.label ? `, ${via.join(" to ")}` : ""}.${it.arrow ? " It runs one way." : ""}${it.dash ? " Dashed: not a sure route." : ""}`;
    const o = { it, id, label, words, mem: it.i, line: null, rings: null, r: 0 };
    if (it.kind === "area") {
      o.rings = ringsOf(it.path).map((r) => ({ r, b: bbox(r) }));
      const big = o.rings.reduce((a, q) => Math.max(a, Math.max(q.b[2] - q.b[0], q.b[3] - q.b[1])), 0);
      o.r = big / 2;
    } else if (it.kind === "route") o.line = host.sample(it.pts, false);
    return o;
  });
  const marks = items.map((o) => ({ id: o.id, label: o.label, words: o.words, item: o.mem, appear: o.it.start + LEAD }));
  if (sc.title) marks.push({ id: "mark:text:" + slug(sc.title), label: sc.title, words: "What this map is about.", appear: 0 });
  const total = sc.total + LEAD + (read0.choose ? 1.2 : 0) + HOLD;

  // thinned rings per scale, so a frame only walks the points a pixel can show
  const cache = new Map();
  const thinned = (key, rings, s, minPx, filled) => {
    const k = key + "@" + s.toFixed(2);
    if (!cache.has(k)) {
      const t = rings.filter((q) => Math.max(q.b[2] - q.b[0], q.b[3] - q.b[1]) * s >= minPx).map((q) => thin(q.r, 1.1 / s));
      cache.set(k, filled ? t.map((r) => clipPoly(r, sc.w, sc.h)).filter(Boolean) : t.flatMap((r) => clipRuns(r, sc.w, sc.h)));
    }
    return cache.get(k);
  };

  const film = {
    kind: "map", total, marks, sc, items, choose: read0.choose, chosen: null, onShapes: false,
    says: read0.says, title: sc.title, caption: sc.caption,
    // YUI-329: the picture's size in a slot S tall (what draw() will use), so a mixed answer can lay it out and pin it to the slot top
    fit(W, S) {
      const aH = Math.max(120, S - (sc.title ? 24 : 0) - 6), s = Math.min((W - 28) / sc.w, aH / sc.h, 84);
      return { drawH: sc.h * s, shift: (aH - sc.h * s) / 2, head: (sc.title ? 24 : 0) + 6 };
    },
    draw(t, api) {
      const W = api.w, H = api.h, top = 120, areaB = H - 196;
      const cH = film.choose ? host.chooseBlock(api, film, t, 0, 0, 0, W - 40, true) : 0;
      if (sc.title) api.text(sc.title, W / 2, top - 8, { size: 24, weight: 800, k: seg(t, 0, 0.5), maxw: W - 40 });
      const aT = top + (sc.title ? 24 : 0), aH = Math.max(120, areaB - aT - cH - 6);
      const s = Math.min((W - 28) / sc.w, aH / sc.h, 84), ox = (W - sc.w * s) / 2, oy = aT + (areaB - aT - (sc.h * s + cH + 6)) / 2;
      film.xf = { ox, oy, s, dy: api.dy || 0 };   // YUI-331: screen px <-> degrees, so a dropped pin gets its new place
      const P = (p) => [ox + p[0] * s, oy + p[1] * s];
      // the world outline writes in first
      const kl = seg(t, 0, LEAD + 0.2);
      if (kl > 0) thinned("land", land, s, 3, false).forEach((r) => api.stroke(r.map(P), { c: "dim", w: 1.1, a: 0.42 * kl, rough: 0 }));
      const tt = t - LEAD, fs = sc.fs * s, fz = Math.max(11, fs);
      const frames = frame(sc, tt < 0 ? 0 : tt);
      const labels = [], pinsPx = items.filter((o) => o.it.kind === "pin").map((o) => P(o.it.c));
      frames.forEach((f, idx) => {
        const o = items[idx], it = o.it;
        if (tt < 0 || f.o <= 0) return;
        const col = TONE[it.tone] || "accent", on = api.marked === o.id;
        let hx, hy, hr;
        if (it.kind === "area") {
          const rs = thinned(o.id, o.rings, s, 1.5, true);
          rs.forEach((r) => {
            const pts = r.map(P);
            api.stroke(pts, { c: col, w: it.dash ? 2.2 : 2.5, a: f.o, fill: col, fa: (it.dash ? 0.16 : 0.34) * f.d, close: true, dash: it.dash ? [7, 6] : undefined, rough: 0 });
            if (on) api.stroke(pts, { c: "warn", w: 5, a: 0.9, close: true, rough: 0 });
          });
          const c = P(it.c); hx = c[0]; hy = c[1]; hr = clamp(o.r * s * 0.5, 22, 70);
        } else if (it.kind === "route") {
          const pts = o.line.map(P);
          if (on) api.stroke(pts, { c: "warn", w: 8, a: 0.55, rough: 0 });
          api.stroke(pts, { c: col, w: 3.5, k: f.d, head: it.arrow ? 11 : false, dash: it.dash ? [8, 7] : undefined, rough: 0 });
          const m = clearSpot(pts, pinsPx); hx = m[0]; hy = m[1]; hr = 22;
        } else {
          const c = P(it.c); hx = c[0]; hy = c[1]; hr = 18;
          if (on) api.dot(hx, hy, 15, { c: "warn", a: 0.55 });
          api.dot(hx, hy, 6.5 * f.s, { c: col, a: f.o });
          api.circle(hx, hy, 9.5 * f.s, { c: "fg", w: 1.5, a: 0.5 * f.o, rough: 0 });
          if (f.p > 0) api.circle(hx, hy, 9.5 + 14 * f.p, { c: col, w: 2, a: 0.7 * (1 - f.p), rough: 0 });
        }
        if (it.text) labels.push([it, f]);
        if (f.d > (it.kind === "pin" ? 0.3 : 0.5)) api.hit(o.id, hx, hy, hr, o.label);
      });
      labels.forEach(([it, f]) => api.text(it.text, ox + it.lx * s, oy + it.ly * s, { size: fz, c: "fg", weight: 700, k: f.o, free: true, noHit: true, align: it.anchor === "start" ? "left" : it.anchor === "end" ? "right" : "center", maxw: 30 * s }));
      if (film.choose) host.chooseBlock(api, film, t, sc.total + LEAD - 0.1, 20, oy + sc.h * s + 6, W - 40, false);
      film.says.slice(0, 1).forEach((s0) => api.say(s0, 0.3, Math.min(total - 0.5, 3.6), { y: "bottom", size: 20 }));
      if (sc.caption) api.say(sc.caption, film.says.length ? 3.8 : 0.3, total + 1, { y: "bottom", size: 20 });
    },
  };
  return film;
}
