// map (YUI-158): the scene model behind `map`, `area`, `pin` and `route`
// lines. Pure functions, no DOM, so the playground, the MCP App and the tests
// share one fit, one projection and one clock. Offline: the world outline is
// Natural Earth 110m (world.mjs), no tiles, no key, no network.
//
// scene(head, members) fits the view once and projects everything into a
// drawing 100 units wide. frame(scene, t) says how far each part has come on
// `t` seconds in; t = Infinity is the final still (Reduce Motion, a
// printout, the Telegram picture). describe(scene) is the same map in words.

import { resolve } from "./yl.mjs";
import { A3, COUNTRIES } from "./world.mjs";

export const TONES = ["accent", "mint", "lavender", "butter", "ink", "mute"];
export const W = 100;
// The clock, in seconds: one part to the next, then how long each takes.
export const STEP = 0.35;
export const DUR = { area: 0.6, pin: 0.5, route: 0.9 };
export const PULSE = 1.6;
// Label size as a share of the width.
export const LABEL = 0.034;
// The whole world, as drawn by fit=world (no Antarctica).
export const WORLD = { lon: [-180, 180], lat: [-56, 83] };

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : typeof v === "string" && /^-?\d+(\.\d+)?$/.test(v.trim()) ? Number(v) : null);
const r3 = (n) => Math.round(n * 1000) / 1000;

// "47.9,106.9" to [lat, lon]; out of range or anything else is null.
export function latlon(v) {
  if (v === undefined || v === null || v === true) return null;
  const parts = String(v).split(",").map((x) => x.trim());
  if (parts.length !== 2) return null;
  const [lat, lon] = parts.map(num);
  if (lat === null || lon === null || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  return [lat, lon];
}

// A country by ISO alpha-2 or alpha-3 code, any case: { code, name, rings }.
export function country(code) {
  const c = String(code || "").trim().toUpperCase();
  const k = COUNTRIES[c] ? c : A3[c];
  return k ? { code: k, name: COUNTRIES[k].name, rings: COUNTRIES[k].rings } : null;
}

// Flat lon, lat rings to lists of [lon, lat].
const pairs = (flat) => { const o = []; for (let i = 0; i < flat.length; i += 2) o.push([flat[i], flat[i + 1]]); return o; };

// The smallest run of longitudes that holds every one given, as [from, to]
// with to - from <= 360 (to may pass 180 when the run crosses the date line).
export function lonSpan(lons) {
  const xs = [...new Set(lons.map((x) => ((x + 540) % 360) - 180))].sort((a, b) => a - b);
  if (!xs.length) return null;
  if (xs.length === 1) return [xs[0], xs[0]];
  let gap = xs[0] + 360 - xs[xs.length - 1];
  let span = [xs[0], xs[xs.length - 1]];
  for (let i = 1; i < xs.length; i++) {
    const g = xs[i] - xs[i - 1];
    if (g > gap) { gap = g; span = [xs[i], xs[i - 1] + 360]; }
  }
  return span;
}

// Every part, resolved: its kind, what it holds on the globe, its look.
function parts(members) {
  const pins = {};
  for (const m of members) {
    if (m.preset !== "pin") continue;
    const at = latlon(resolve("pin", m.props || {}).at);
    if (at && m.id) pins[m.id] = at;
  }
  const out = [];
  const missing = [];
  members.forEach((m, i) => {
    const p = resolve(m.preset, m.props || {});
    const tone = TONES.includes(p.tone) ? p.tone : m.preset === "area" && p.dash ? "mute" : "accent";
    const base = { i, id: m.id, kind: m.preset, label: String(p.label || ""), tone, dash: !!p.dash, pulse: !!p.pulse };
    if (m.preset === "area") {
      const rings = [];
      const names = [];
      for (const code of p.codes || []) {
        const c = country(code);
        if (!c) { missing.push(String(code)); continue; }
        names.push(c.name);
        for (const r of c.rings) rings.push(pairs(r));
      }
      const drawn = (p.pts || []).map(latlon).filter(Boolean).map(([lat, lon]) => [lon, lat]);
      if (drawn.length >= 3) rings.push(drawn);
      if (rings.length) out.push({ ...base, rings, names });
    } else if (m.preset === "pin") {
      const at = latlon(p.at);
      if (at) out.push({ ...base, at: [at[1], at[0]], grow: !p.pulse || !!p.grow });
    } else if (m.preset === "route") {
      const stops = [];
      const names = [];
      for (const s of p.pts || []) {
        const at = latlon(s) || pins[String(s)];
        if (!at) continue;
        stops.push([at[1], at[0]]);
        const pin = members.find((x) => x.preset === "pin" && x.id === String(s));
        names.push(pin ? String(resolve("pin", pin.props || {}).label || s) : null);
      }
      if (stops.length >= 2) out.push({ ...base, stops, names, arrow: !!p.arrow });
    }
  });
  return { list: out, missing };
}

// The view: which longitudes and latitudes the drawing covers.
function view(head, list) {
  const c = latlon(head.center);
  const z = num(head.zoom);
  if (c && z !== null) {
    const span = 360 / 2 ** (clamp(z, 1, 12) - 1);
    return { lon: [c[1] - span / 2, c[1] + span / 2], lat: [c[0] - span / 4, c[0] + span / 4], fixed: true };
  }
  const lons = [], lats = [];
  for (const it of list) {
    const pts = it.rings ? it.rings.flat() : it.stops || [it.at];
    for (const [lon, lat] of pts) { lons.push(lon); lats.push(lat); }
  }
  if (head.fit === "world" || !lons.length) return { lon: [...WORLD.lon], lat: [...WORLD.lat], fixed: true };
  const lon = lonSpan(lons);
  const lat = [Math.min(...lats), Math.max(...lats)];
  // Pad a tenth each way, and never closer than 8 degrees across.
  const pad = (a) => { const d = Math.max(a[1] - a[0], 8); const mid = (a[0] + a[1]) / 2; return [mid - d * 0.6, mid + d * 0.6]; };
  return { lon: pad(lon), lat: pad(lat), fixed: false };
}

// Fits and projects the whole map. Equirectangular, squeezed by the cosine of
// the middle latitude so the region keeps its shape; the drawing stays
// between square and twice as wide as tall (the short side grows to fit).
export function scene(head, members = []) {
  const h0 = resolve("map", head || {});
  const { list, missing } = parts(members);
  const v = view(h0, list);
  let [lon0, lon1] = v.lon;
  let [lat0, lat1] = [clamp(v.lat[0], -85, 85), clamp(v.lat[1], -85, 85)];
  const k = clamp(Math.cos((((lat0 + lat1) / 2) * Math.PI) / 180), 0.35, 1);
  let sx = (lon1 - lon0) * k, sy = lat1 - lat0;
  if (sx / sy > 2) {
    const need = sx / 2 - sy;
    lat0 -= need / 2; lat1 += need / 2;
    if (lat1 > 85) { lat0 -= lat1 - 85; lat1 = 85; }
    if (lat0 < -85) { lat1 += -85 - lat0; lat0 = -85; }
    sy = lat1 - lat0;
  } else if (sx / sy < 1) {
    const need = (sy - sx) / k;
    lon0 -= need / 2; lon1 += need / 2;
    sx = sy;
  }
  const s = W / sx;
  const H = r3(sy * s);
  const mid = (lon0 + lon1) / 2;
  // A longitude moved by whole turns to sit nearest the middle of the view.
  const near = (lon) => lon + 360 * Math.round((mid - lon) / 360);
  const P = (lon, lat, shift = null) => [r3(((shift === null ? near(lon) : lon + shift) - lon0) * k * s), r3((lat1 - lat) * s)];
  // A ring keeps one shift for all its points, so it never tears.
  const ring = (pts) => {
    const avg = pts.reduce((a, [x]) => a + x, 0) / pts.length;
    const shift = near(avg) - avg;
    return pts.map(([lon, lat]) => P(lon, lat, shift));
  };
  const inView = (pp) => pp.some(([x, y]) => x > -W * 0.2 && x < W * 1.2 && y > -H * 0.2 && y < H * 1.2);
  const d = (rings) => rings.map((r) => `M${r.map(([x, y]) => `${x} ${y}`).join("L")}Z`).join("");

  // The land: every country with a point near the view, one path.
  const land = [];
  for (const code of Object.keys(COUNTRIES)) {
    for (const r of COUNTRIES[code].rings) {
      const pp = ring(pairs(r));
      if (inView(pp)) land.push(pp);
    }
  }

  const fs = r3(W * LABEL);
  let at = 0;
  const items = list.map((it) => {
    const start = r3(at * STEP);
    at++;
    const out = { i: it.i, id: it.id, kind: it.kind, label: it.label, tone: it.tone, dash: it.dash, pulse: it.pulse, start, dur: DUR[it.kind] };
    if (it.kind === "area") {
      const rings = it.rings.map(ring).filter(inView);
      out.path = d(rings);
      out.names = it.names;
      // The label sits on the biggest piece's middle.
      let best = null, bestA = -1;
      for (const r of rings) {
        let a = 0, cx = 0, cy = 0;
        for (let j = 0; j < r.length; j++) {
          const [x1, y1] = r[j], [x2, y2] = r[(j + 1) % r.length];
          const c = x1 * y2 - x2 * y1;
          a += c; cx += (x1 + x2) * c; cy += (y1 + y2) * c;
        }
        if (Math.abs(a) > bestA && a !== 0) { bestA = Math.abs(a); best = [r3(cx / (3 * a)), r3(cy / (3 * a))]; }
      }
      out.c = best || (rings[0] ? rings[0][0] : [W / 2, H / 2]);
    } else if (it.kind === "pin") {
      out.c = P(it.at[0], it.at[1]);
      out.grow = it.grow;
    } else {
      const pts = it.stops.map(([lon, lat]) => P(lon, lat));
      out.pts = pts;
      out.names = it.names;
      out.arrow = it.arrow;
      // Two stops bow a little, like a road over the curve of the earth.
      if (pts.length === 2) {
        const [[ax, ay], [bx, by]] = pts;
        const len = Math.hypot(bx - ax, by - ay) || 1;
        const bend = 0.12 * len;
        out.pts = [pts[0], [r3((ax + bx) / 2 + ((by - ay) / len) * bend), r3((ay + by) / 2 - ((bx - ax) / len) * bend * Math.sign(bx - ax || 1))], pts[1]];
      }
      out.c = out.pts[Math.floor(out.pts.length / 2)];
    }
    return out;
  });
  place(items, fs, W, H);
  const total = items.length ? Math.max(...items.map((x) => x.start + x.dur)) : 0;
  return {
    title: String(h0.title || ""), caption: String(h0.caption || ""),
    w: W, h: H, fs, land: d(land), items, total: r3(total), missing,
    view: { lon: [r3(lon0), r3(lon1)], lat: [r3(lat0), r3(lat1)] },
  };
}

// Where each label goes: the first of a few spots that clears the labels
// and pins already placed and stays on the drawing. A pin's label sits
// beside it, a route's past its last stop (an arrow's tip) or over its
// middle, an area's on its biggest piece. Sets lx, ly and anchor.
function place(items, fs, w, h) {
  const taken = items.filter((it) => it.kind === "pin").map((it) => box(it.c[0], it.c[1], fs * 0.9, fs * 0.9, "middle"));
  for (const it of items) {
    if (!it.label) continue;
    const tw = Math.min(it.label.length, 18) * fs * 0.56;
    const lines = it.label.length > 18 ? 2 : 1;
    const th = fs * 1.2 * lines;
    const spots = [];
    const [cx, cy] = it.c;
    if (it.kind === "pin") {
      const g = fs * 0.8;
      spots.push([cx + g, cy, "start"], [cx - g, cy, "end"], [cx, cy - fs * 1.1, "middle"], [cx, cy + fs * 1.2, "middle"]);
    } else if (it.kind === "route") {
      const [a, b] = it.pts.slice(-2);
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      const ux = (b[0] - a[0]) / len, uy = (b[1] - a[1]) / len;
      const tip = [b[0] + ux * fs * 0.9, b[1] + uy * fs * 0.9 + (Math.abs(ux) < 0.4 ? uy * fs * 0.4 : 0)];
      spots.push([tip[0], tip[1], ux > 0.4 ? "start" : ux < -0.4 ? "end" : "middle"]);
      spots.push([cx, cy - fs * 0.9, "middle"], [cx, cy + fs * 1.1, "middle"]);
    } else {
      spots.push([cx, cy, "middle"], [cx, cy + fs * 1.6, "middle"], [cx, cy - fs * 1.6, "middle"]);
    }
    let pick = null;
    for (const [x, y, a] of spots) {
      const bx = box(x, y, tw, th, a);
      const inside = bx[0] >= 0 && bx[2] <= w && bx[1] >= 0 && bx[3] <= h;
      if (inside && !taken.some((t) => hits(t, bx))) { pick = [x, y, a, bx]; break; }
    }
    if (!pick) { const [x, y, a] = spots[0]; pick = [x, y, a, box(x, y, tw, th, a)]; }
    // Nudge back onto the drawing when it runs off an edge.
    let [x, y, a, bx] = pick;
    if (bx[0] < 0) x -= bx[0]; if (bx[2] > w) x -= bx[2] - w;
    if (bx[1] < 0) y -= bx[1]; if (bx[3] > h) y -= bx[3] - h;
    it.lx = r3(x); it.ly = r3(y); it.anchor = a;
    taken.push(box(x, y, tw, th, a));
  }
}
const box = (x, y, tw, th, a) => {
  const x0 = a === "start" ? x : a === "end" ? x - tw : x - tw / 2;
  return [x0, y - th / 2, x0 + tw, y + th / 2];
};
const hits = (p, q) => p[0] < q[2] && q[0] < p[2] && p[1] < q[3] && q[1] < p[3];

const ease = (x) => 1 - (1 - x) ** 3;
// A spring for pins: up past full size, then settles.
const spring = (x) => (x >= 1 ? 1 : 1 - Math.cos(x * Math.PI * 1.5) * (1 - x) ** 2);

// Where each part stands `t` seconds in: o (opacity), d (how much is drawn,
// 0 to 1), s (scale), p (a pulse, 0 to 1, for +pulse pins once landed).
export function frame(sc, t) {
  return sc.items.map((it) => {
    const x = t === Infinity ? 1 : clamp((t - it.start) / it.dur, 0, 1);
    const e = ease(x);
    const f = { ...it, o: it.kind === "route" ? (x > 0 ? 1 : 0) : e, d: e, s: it.kind === "pin" && it.grow ? spring(x) : 1, p: 0 };
    if (it.pulse && t !== Infinity && x >= 1) f.p = 0.5 - 0.5 * Math.cos(((t - it.start - it.dur) / PULSE) * 2 * Math.PI);
    return f;
  });
}

// The label width a part may take before it wraps, in drawing units.
export function wrap(label, width, fs) {
  const per = Math.max(4, Math.floor(width / (fs * 0.55)));
  const words = String(label).split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = "";
  for (const w of words) {
    if (cur && (cur + " " + w).length > per) { lines.push(cur); cur = w; } else cur = cur ? cur + " " + w : w;
  }
  if (cur) lines.push(cur);
  return lines;
}

// The map in words, part by part in line order: for VoiceOver, the Telegram
// fallback (with the drawn picture) and anywhere that cannot draw.
export function describe(sc) {
  const bits = [];
  for (const it of sc.items) {
    if (it.kind === "area") {
      const what = it.label || it.names.join(", ") || "An area";
      bits.push(it.label && it.names.length ? `${what}: ${it.names.join(", ")}` : what);
    } else if (it.kind === "pin") bits.push(it.label || "A pin");
    else {
      const via = it.names.filter(Boolean);
      bits.push(`${it.label || "A route"}${via.length >= 2 ? `, ${via.join(" to ")}` : ""}`);
    }
  }
  const head = sc.title ? `${sc.title}. ` : "";
  const tail = sc.caption ? ` ${sc.caption}` : "";
  return `${head}Map: ${bits.join("; ") || "the world"}.${tail}`;
}
