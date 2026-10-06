// YL scene (spec/MOTION.md, prototype B): a tiny motion layer for YL.
// One line per thing: `scene` sets the stage, `shape` makes a shape, `key`
// moves it, `cam` flies the camera, `say` times a caption. Nothing here draws
// pixels; evalScene(scene, t) returns plain numbers and path data, so the same
// scene plays in a browser (SVG) or a native renderer (SwiftUI Canvas).
//
//   scene "Title" dur=34 bg=#120d1c
//   shape@cup circle r=26 tone=butter fill=1
//   shape@e1 dot of=atom at=40,0 r=3 tone=mint
//   key cup t=0 dur=1 s=1 from=0.6          # pop in
//   key e1 t=0 dur=34 rot=720 ease=linear   # orbit
//   cam t=3 dur=5 at=0,0 zoom=50 ease=inout # dive (zoom eases in log space)
//   say "Tiny things." t=0.5 dur=2.5

const TONES = { ink: "#120d1c", paper: "#f6eef7", pink: "#ff6b8b", mint: "#5ef0c2", butter: "#ffd479", lilac: "#a99bff", sky: "#6fc3ff", mute: "#6b6580" };
const N = 120; // points per shape, so any two kinds can morph point to point

export function tokens(line) {
  const out = [];
  const re = /"((?:[^"\\]|\\.)*)"|(\S+)/g;
  let m;
  while ((m = re.exec(line))) out.push(m[1] !== undefined ? { q: m[1] } : { w: m[2] });
  return out;
}

const num = (s, d) => (s === undefined || s === "" || Number.isNaN(+s) ? d : +s);
const pair = (s, d) => (s ? s.split(",").map(Number) : d);

export function parseScene(src) {
  const sc = { title: "", dur: 30, bg: TONES.ink, shapes: [], byId: {}, keys: [], cams: [], says: [] };
  for (const raw of src.split("\n")) {
    const line = raw.replace(/\s#\s.*$/, "").trim(); // trailing comment: a # with spaces around it (colors keep theirs)
    if (!line || line.startsWith("#")) continue;
    const tk = tokens(line);
    const head = tk[0].w;
    const base = head.split("@")[0];
    const id = head.includes("@") ? head.split("@")[1] : null;
    const kv = {};
    const flags = new Set();
    const pos = [];
    for (const t of tk.slice(1)) {
      if (t.q !== undefined) pos.push(t.q);
      else if (t.w.startsWith("+")) flags.add(t.w.slice(1));
      else if (t.w.includes("=")) { const i = t.w.indexOf("="); kv[t.w.slice(0, i)] = t.w.slice(i + 1); }
      else pos.push(t.w);
    }
    if (base === "scene") {
      sc.title = pos[0] || "";
      sc.dur = num(kv.dur, 30);
      sc.bg = TONES[kv.bg] || kv.bg || sc.bg;
    } else if (base === "shape") {
      const kind = pos[0];
      const at = pair(kv.at, [0, 0]);
      const s = {
        id, kind, into: kv.into || null, of: kv.of || null, text: kind === "text" ? pos[1] || "" : null,
        glow: flags.has("glow"),
        p: { x: at[0], y: at[1], r: num(kv.r, 10), s: num(kv.s, 1), rot: num(kv.rot, 0), op: num(kv.op, 1), morph: num(kv.morph, 0), amp: num(kv.amp, 0), n: num(kv.n, 2), m2: num(kv.m2, 0), m3: num(kv.m3, 0), m4: num(kv.m4, 0), hz: num(kv.hz, 1.2), sw: num(kv.sw, 1.4), fill: num(kv.fill, kind === "dot" ? 1 : 0), tone: TONES[kv.tone] || kv.tone || TONES.paper },
      };
      if (!id) throw new Error(`shape needs an id: ${line}`);
      sc.shapes.push(s);
      sc.byId[id] = s;
    } else if (base === "key") {
      const target = pos[0];
      const props = {};
      for (const k of ["x", "y", "r", "s", "rot", "op", "morph", "amp", "n", "m2", "m3", "m4", "hz", "sw", "fill"]) if (kv[k] !== undefined) props[k] = +kv[k];
      if (kv.at) { const a = pair(kv.at); props.x = a[0]; props.y = a[1]; }
      if (kv.tone) props.tone = TONES[kv.tone] || kv.tone;
      sc.keys.push({ target, t: num(kv.t, 0), dur: num(kv.dur, 1), ease: kv.ease || "inout", from: kv.from !== undefined ? +kv.from : undefined, props });
    } else if (base === "cam") {
      const atRef = kv.at && kv.at.startsWith("@") ? kv.at.slice(1) : null; // at=@id: fly to a shape, however deep it is nested
      const zRef = kv.zoom && kv.zoom.startsWith("@") ? kv.zoom.slice(1) : null; // zoom=@id: fill the screen with that shape's frame
      const a = atRef ? null : pair(kv.at, null);
      sc.cams.push({ t: num(kv.t, 0), dur: num(kv.dur, 1), ease: kv.ease || "inout", x: a ? a[0] : undefined, y: a ? a[1] : undefined, atRef, zRef, zoom: kv.zoom !== undefined && !zRef ? +kv.zoom : undefined, roll: kv.roll !== undefined ? +kv.roll : undefined });
    } else if (base === "say") {
      sc.says.push({ text: pos[0] || "", t: num(kv.t, 0), dur: num(kv.dur, 2.5), big: flags.has("big") });
    } else throw new Error(`unknown scene line: ${line}`);
  }
  for (const s of sc.shapes) if (s.of && !sc.byId[s.of]) throw new Error(`${s.id}: no parent ${s.of}`);
  for (const k of sc.keys) if (!sc.byId[k.target]) throw new Error(`key: no shape ${k.target}`);
  for (const c of sc.cams) for (const r of [c.atRef, c.zRef]) if (r && !sc.byId[r]) throw new Error(`cam: no shape ${r}`);
  return sc;
}

export const EASE = {
  linear: (x) => x,
  in: (x) => x * x * x,
  out: (x) => 1 - (1 - x) ** 3,
  inout: (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2),
  pop: (x) => 1 + 2.70158 * (x - 1) ** 3 + 1.70158 * (x - 1) ** 2, // overshoot, settles on 1
};
const ease = (name, x) => (EASE[name] || EASE.inout)(Math.min(1, Math.max(0, x)));

const hex = (c) => { const v = parseInt(c.slice(1), 16); return [(v >> 16) & 255, (v >> 8) & 255, v & 255]; };
const mix = (a, b, k) => { const x = hex(a), y = hex(b); return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * k).toString(16).padStart(2, "0")).join(""); };

// A property's value at t: its starting value, then each key that touches it in time order.
function valueAt(shape, scene, prop, t) {
  let v = shape.p[prop];
  const list = scene.keys.filter((k) => k.target === shape.id && prop in k.props).sort((a, b) => a.t - b.t);
  for (const k of list) {
    if (t < k.t) break;
    const from = k.from !== undefined && prop !== "tone" ? k.from : v;
    const to = k.props[prop];
    const e = ease(k.ease, (t - k.t) / Math.max(1e-6, k.dur));
    v = prop === "tone" ? mix(from, to, e) : from + (to - from) * e;
  }
  return v;
}

// Where a shape's origin sits in the world, and the scale of its frame: walk up its parents.
function placeOf(scene, P, id) {
  let pt = [0, 0], S = 1, cur = id;
  while (cur) {
    const p = P[cur];
    const a = (p.rot * Math.PI) / 180, c = Math.cos(a), si = Math.sin(a);
    pt = [p.x + (c * pt[0] - si * pt[1]) * p.s, p.y + (si * pt[0] + c * pt[1]) * p.s];
    S *= p.s;
    cur = scene.byId[cur].of;
  }
  return { x: pt[0], y: pt[1], S };
}

// The camera at t. Zoom eases in log space, so a dive from 1x to 100000x feels even; position follows
// the screen-space path, so the target stays put on screen while the zoom runs (a dolly, not a drift).
export function camAt(scene, t, P) {
  let x = 0, y = 0, z = 1, roll = 0;
  for (const c of [...scene.cams].sort((a, b) => a.t - b.t)) {
    if (t < c.t) break;
    const e = ease(c.ease, (t - c.t) / Math.max(1e-6, c.dur));
    let tx = c.x, ty = c.y, tz = c.zoom;
    if (c.atRef) { const w = placeOf(scene, P, c.atRef); tx = w.x; ty = w.y; }
    if (c.zRef) tz = 1 / placeOf(scene, P, c.zRef).S;
    const z0 = z, x0 = x, y0 = y;
    if (tz !== undefined) z = Math.exp(Math.log(z0) + (Math.log(tz) - Math.log(z0)) * e);
    const kp = tz !== undefined && Math.abs(1 / tz - 1 / z0) > 1e-12 ? (1 / z - 1 / z0) / (1 / tz - 1 / z0) : e;
    if (tx !== undefined) x = x0 + (tx - x0) * kp;
    if (ty !== undefined) y = y0 + (ty - y0) * kp;
    if (c.roll !== undefined) roll += (c.roll - roll) * e;
  }
  return { x, y, z, roll };
}

// Unit-radius outline of a kind at time t, N points.
function outline(kind, p, t) {
  const pts = [];
  const w = Math.sin(t * p.hz * 2 * Math.PI);
  for (let i = 0; i < N; i++) {
    const u = i / N;
    const th = u * 2 * Math.PI;
    if (kind === "wave") {
      const x = -1 + 2 * (i / (N - 1));
      pts.push([x * 1.6, -p.amp * Math.sin(p.n * Math.PI * (x + 1) / 2) * w]);
    } else if (kind === "box") {
      const k = 4 * u, side = Math.floor(k), f = k - side;
      const q = [[-1, -1, 1, -1], [1, -1, 1, 1], [1, 1, -1, 1], [-1, 1, -1, -1]][side % 4];
      pts.push([(q[0] + (q[2] - q[0]) * f) * 0.9, (q[1] + (q[3] - q[1]) * f) * 0.9]);
    } else { // circle, ring, dot, loop: a closed string whose radius carries the note
      const f = p.hz * 2 * Math.PI; // a closed string hums in modes: each mode has its own lobes and its own pitch
      const r = 1 + p.m2 * Math.sin(2 * th) * Math.sin(t * f) + p.m3 * Math.sin(3 * th + 1) * Math.sin(t * f * 1.5) + p.m4 * Math.sin(4 * th + 2) * Math.sin(t * f * 2);
      pts.push([Math.cos(th) * r, Math.sin(th) * r]);
    }
  }
  return pts;
}
const KIND = (k) => (k === "dot" || k === "ring" || k === "loop" ? "circle" : k);

// Everything on screen at t, as data. Parents come first in `shapes`, so a renderer can nest in order.
export function evalScene(scene, t) {
  const P = {};
  for (const s of scene.shapes) { P[s.id] = {}; for (const k of Object.keys(s.p)) P[s.id][k] = valueAt(s, scene, k, t); }
  const shapes = scene.shapes.map((s) => {
    const p = P[s.id];
    let d = "";
    if (s.kind !== "text" && s.kind !== "frame") {
      const a = outline(KIND(s.kind), p, t);
      const b = s.into ? outline(KIND(s.into), p, t) : null;
      const m = b ? Math.min(1, Math.max(0, p.morph)) : 0;
      const open = (b ? m > 0.5 ? s.into : s.kind : s.kind) === "wave";
      d = a.map((pt, i) => {
        const q = b ? [pt[0] + (b[i][0] - pt[0]) * m, pt[1] + (b[i][1] - pt[1]) * m] : pt;
        return `${i ? "L" : "M"}${(q[0] * p.r).toFixed(3)} ${(q[1] * p.r).toFixed(3)}`;
      }).join("") + (open ? "" : "Z");
    }
    return { id: s.id, kind: s.kind, of: s.of, text: s.text, glow: s.glow, d, ...p };
  });
  const say = scene.says.find((c) => t >= c.t && t <= c.t + c.dur);
  let a = 0;
  if (say) { const f = 0.35; a = Math.min(1, (t - say.t) / f, (say.t + say.dur - t) / f); a = Math.max(0, a); }
  return { cam: camAt(scene, t, P), shapes, say: say ? { text: say.text, big: say.big, a } : null };
}
