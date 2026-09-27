// The Yui mark as numbers: six pieces cut from Chris's paper sketch.
// earL, earR and stem make the Y. u is the u. iBody and iDot make the i.
//
// markPieces({ rough, round, gap, pose, seed, tear }) gives each piece as a loop of points.
// rough 1 is the sketch as cut (traced from brand/sketch.jpg), rough 0 is the clean mark.
// Everything in between is a straight morph, point for point, so the dial is honest.
// markPaths() gives SVG path strings. Pure, no DOM, shared by /brand and videos/13-brand.
import TRACE from "./trace.mjs";

export const NAMES = ["earL", "earR", "stem", "u", "iBody", "iDot"];
export const ORDER = ["earL", "earR", "stem", "u", "iBody", "iDot"]; // the order pieces land in
const N = 160;

// The clean mark, in the trace's space (1000 wide, y down). One stroke width for all.
export const SPEC = {
  W: 110, // stroke
  stemX: 316, top: 300, base: 590, // the Y's stem
  xh: 395, // x-height: tops of u and i
  earLen: 290, earAngle: 44, // degrees from vertical
  uX: 482, uW: 322, uBar: 84, // u left edge, width, floor thickness
  iX: 862,
  dot: [[868, 238], [978, 158], [992, 282]], // the accent-like wedge over the i
};

// ---------- small geometry ----------
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const mul = (a, s) => [a[0] * s, a[1] * s];
const len = (a) => Math.hypot(a[0], a[1]);
const norm = (a) => mul(a, 1 / (len(a) || 1));

// A polygon with a fillet radius per corner, as a dense outline. Works for concave corners too.
function rounded(verts, radii) {
  const out = [];
  const n = verts.length;
  for (let i = 0; i < n; i++) {
    const v = verts[i], p = verts[(i - 1 + n) % n], q = verts[(i + 1) % n];
    const a = norm(sub(p, v)), b = norm(sub(q, v));
    const cos = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1]));
    const th = Math.acos(cos) / 2;
    let r = radii[i] || 0;
    let t = th > 1e-4 ? r / Math.tan(th) : 0;
    const tmax = Math.min(len(sub(p, v)), len(sub(q, v))) / 2;
    if (t > tmax) { t = tmax; r = t * Math.tan(th); }
    if (r < 0.5) { out.push(v); continue; }
    const t1 = add(v, mul(a, t)), t2 = add(v, mul(b, t));
    const c = add(v, mul(norm(add(a, b)), r / Math.sin(th)));
    let a1 = Math.atan2(t1[1] - c[1], t1[0] - c[0]);
    let a2 = Math.atan2(t2[1] - c[1], t2[0] - c[0]);
    let d = a2 - a1;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    const steps = Math.max(4, Math.ceil(Math.abs(d) * r / 3));
    for (let k = 0; k <= steps; k++) {
      const ang = a1 + (d * k) / steps;
      out.push([c[0] + r * Math.cos(ang), c[1] + r * Math.sin(ang)]);
    }
  }
  return out;
}

const area = (pts) => pts.reduce((s, p, i) => { const q = pts[(i + 1) % pts.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0) / 2;

// Same convention as the trace: N points by arc length, clockwise on screen, starting at the top.
function canon(pts, n = N) {
  if (area(pts) < 0) pts = pts.slice().reverse();
  const L = [0];
  for (let i = 1; i <= pts.length; i++) L.push(L[i - 1] + len(sub(pts[i % pts.length], pts[i - 1])));
  const total = L[L.length - 1];
  const out = [];
  let j = 0;
  for (let k = 0; k < n; k++) {
    const s = (total * k) / n;
    while (L[j + 1] < s) j++;
    const u = (s - L[j]) / (L[j + 1] - L[j] || 1);
    const a = pts[j], b = pts[(j + 1) % pts.length];
    out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]);
  }
  let top = 0;
  out.forEach((p, i) => { if (p[1] + p[0] * 1e-3 < out[top][1] + out[top][0] * 1e-3) top = i; });
  return out.slice(top).concat(out.slice(0, top));
}

// ---------- the clean pieces ----------
function ear(side, s, round, gap) {
  const { W, stemX, top, earLen, earAngle } = s;
  const phi = (earAngle * Math.PI) / 180;
  const dir = [side * Math.sin(phi), -Math.cos(phi)];
  const perp = [-dir[1], dir[0]];
  const V = [stemX, top + W * 0.3];
  const cap = [stemX, top + W / 2]; // center of the stem's round top
  const rc = 6 + round * 22;
  const build = (d0) => {
    const d1 = d0 + earLen;
    const P = (d, w) => add(add(V, mul(dir, d)), mul(perp, w));
    return rounded([P(d0, -W / 2), P(d1, -W / 2), P(d1, W / 2), P(d0, W / 2)], [rc, W / 2, W / 2, rc]);
  };
  // slide the ear out along its axis until it clears the stem's cap by the gap
  let d0 = 0;
  for (; d0 < 400; d0 += 1) {
    const pts = build(d0);
    if (Math.min(...pts.map((p) => len(sub(p, cap)))) >= W / 2 + gap) break;
  }
  return build(d0);
}

function cleanPieces(opts = {}) {
  const s = { ...SPEC, ...(opts.spec || {}) };
  const round = opts.round ?? 0.5;
  const gap = opts.gap ?? 34;
  const { W, stemX, top, base, xh, uX, uW, uBar, iX } = s;
  const rc = 6 + round * 22; // flat-end corner
  const cap = W / 2;
  const x0 = uX, x1 = uX + uW, cb = base - uBar;
  const ro = 18 + round * 44; // u outer bottom corners
  const ri = 8 + round * 18; // u counter corners
  return {
    earL: ear(-1, s, round, gap),
    earR: ear(1, s, round, gap),
    stem: rounded([[stemX - W / 2, top], [stemX + W / 2, top], [stemX + W / 2, base], [stemX - W / 2, base]], [cap, cap, rc, rc]),
    u: rounded(
      [[x0, xh], [x0 + W, xh], [x0 + W, cb], [x1 - W, cb], [x1 - W, xh], [x1, xh], [x1, base], [x0, base]],
      [cap, cap, ri, ri, cap, cap, ro, ro],
    ),
    iBody: rounded([[iX, xh], [iX + W, xh], [iX + W, base], [iX, base]], [cap, cap, rc, rc]),
    iDot: rounded(s.dot, [26 + round * 10, 14 + round * 10, 10 + round * 10]),
  };
}

// ---------- noise for torn edges ----------
function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function vnoise(x, seed) {
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return hash(i + seed * 97.3) * (1 - u) + hash(i + 1 + seed * 97.3) * u;
}
function fbm(x, seed) { let v = 0, a = 0.5, f = 1; for (let o = 0; o < 4; o++) { v += a * (vnoise(x * f, seed + o) - 0.5); a *= 0.5; f *= 2.1; } return v; }

let cleanCache = null;
const sketchLoops = Object.fromEntries(NAMES.map((k) => [k, canon(TRACE.sketch.pieces[k])]));
const firstLoops = Object.fromEntries(NAMES.map((k) => [k, canon(TRACE.first.pieces[k])]));

const centroid = (pts) => mul(pts.reduce((s, p) => add(s, p), [0, 0]), 1 / pts.length);

// pose: { earL: { rot, dx, dy, s }, ... } degrees and trace units, about each piece's center.
export function markPieces(opts = {}) {
  const rough = opts.rough ?? 0;
  const tear = opts.tear ?? 0;
  const seed = opts.seed ?? 1;
  const from = opts.from === "first" ? firstLoops : sketchLoops;
  const key = JSON.stringify([opts.round, opts.gap, opts.spec]);
  if (!cleanCache || cleanCache.key !== key) {
    const c = cleanPieces(opts);
    cleanCache = { key, loops: Object.fromEntries(NAMES.map((k) => [k, canon(c[k])])) };
  }
  const out = {};
  for (const k of NAMES) {
    const a = cleanCache.loops[k], b = from[k];
    let pts = a.map((p, i) => [p[0] + (b[i][0] - p[0]) * rough, p[1] + (b[i][1] - p[1]) * rough]);
    if (tear > 0) {
      const si = NAMES.indexOf(k) * 13 + seed;
      pts = pts.map((p, i) => {
        const q = pts[(i + 1) % N], r = pts[(i - 1 + N) % N];
        const nrm = norm([q[1] - r[1], -(q[0] - r[0])]);
        const d = tear * (fbm(i * 0.35, si) * 14 + fbm(i * 1.7, si + 5) * 5);
        return add(p, mul(nrm, d));
      });
    }
    const c = centroid(pts);
    const ps = opts.pose && opts.pose[k];
    if (ps) {
      const th = ((ps.rot || 0) * Math.PI) / 180, cs = Math.cos(th), sn = Math.sin(th), sc = ps.s ?? 1;
      const o = ps.origin ? [ps.origin[0], ps.origin[1]] : c;
      pts = pts.map((p) => {
        const d = sub(p, o);
        return [o[0] + (d[0] * cs - d[1] * sn) * sc + (ps.dx || 0), o[1] + (d[0] * sn + d[1] * cs) * sc + (ps.dy || 0)];
      });
    }
    out[k] = { pts, c: centroid(pts) };
  }
  return out;
}

// A closed Catmull-Rom spline through the loop, as cubic Beziers.
export function loopPath(pts, scale = 1, dx = 0, dy = 0) {
  const n = pts.length;
  const P = (i) => pts[(i + n) % n];
  const f = (v) => (Math.round(v * 10) / 10).toString();
  const X = (p) => f(p[0] * scale + dx), Y = (p) => f(p[1] * scale + dy);
  let d = `M${X(P(0))} ${Y(P(0))}`;
  for (let i = 0; i < n; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${X(c1)} ${Y(c1)} ${X(c2)} ${Y(c2)} ${X(p2)} ${Y(p2)}`;
  }
  return d + "Z";
}

// The box every state of the mark fits in, so the dial never jumps.
export const BOX = { x: -40, y: -40, w: 1080, h: 680 };
export const VIEWBOX = `${BOX.x} ${BOX.y} ${BOX.w} ${BOX.h}`;
// The Y alone (the avatar and the app icon).
export const YBOX = { x: 6, y: 14, w: 620, h: 620 };

export function markPaths(opts = {}) {
  const pieces = markPieces(opts);
  const only = opts.only || NAMES;
  return only.map((k) => ({ name: k, d: loopPath(pieces[k].pts), c: pieces[k].c }));
}

// One path string for the whole mark (for Path2D, masks, favicons).
export function markD(opts = {}) {
  return markPaths(opts).map((p) => p.d).join("");
}

export function markSvg({ fill = "#3A3340", bg = null, only, pad = 0, ...opts } = {}) {
  const box = only && only.length === 3 && only.includes("stem") ? YBOX : BOX;
  const vb = `${box.x - pad} ${box.y - pad} ${box.w + pad * 2} ${box.h + pad * 2}`;
  const paths = markPaths({ ...opts, only }).map((p) => `<path d="${p.d}"/>`).join("");
  const rect = bg ? `<rect x="${box.x - pad}" y="${box.y - pad}" width="${box.w + pad * 2}" height="${box.h + pad * 2}" fill="${bg}"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${rect}<g fill="${fill}">${paths}</g></svg>`;
}

// Easing for the landing motif, shared with the films.
export const ease = {
  out: (t) => 1 - Math.pow(1 - t, 3),
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  back: (t, s = 1.4) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
  spring: (t, k = 7, z = 0.32) => 1 - Math.exp(-z * k * t) * Math.cos(k * Math.sqrt(1 - z * z) * t),
};
const clamp = (x) => Math.max(0, Math.min(1, x));

// The landing motif: pieces drop in one by one and settle. t in seconds from start.
// Returns a pose to pass to markPieces.
export function landPose(t, { step = 0.16, dur = 0.7, drop = 120, spin = 14 } = {}) {
  const pose = {};
  ORDER.forEach((k, i) => {
    const u = clamp((t - i * step) / dur);
    const e = ease.back(u, 1.6);
    pose[k] = { dy: -(1 - e) * drop, rot: (1 - e) * (i % 2 ? spin : -spin), s: 0.6 + 0.4 * ease.out(u) };
    if (u <= 0) pose[k].s = 0.001;
  });
  return pose;
}
