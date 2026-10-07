/* Yui motion kit v1 (MOTION-1). Loaded by the player; a scene is `function (t, c, api)` and draws only
   with these helpers (plus plain canvas calls on c). Everything is stateless: a frame is a pure function
   of t, so a film can be scrubbed, replayed and sampled headless. Pixels are CSS px, screen about 390 x 844.
   Options go last, always an object. Common options: c colour (palette key or CSS), w line width, k draw-on
   progress 0..1 (default 1), a alpha, fill, dash [a,b], glow, rough (hand-drawn wobble). Palette keys:
   ink panel fg dim line accent a2 a3 good bad warn. */
(function (g) {
  "use strict";
  var TAU = 6.283185307179586;
  var clamp = function (x, a, b) { a = a == null ? 0 : a; b = b == null ? 1 : b; return x < a ? a : x > b ? b : x; };
  var lerp = function (a, b, k) { return a + (b - a) * k; };
  var hash = function (n) { var s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };
  var noise = function (x) { var i = Math.floor(x), f = x - i; return hash(i) + (hash(i + 1) - hash(i)) * (f * f * (3 - 2 * f)); };
  var ease = function (x) { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  var eout = function (x) { return 1 - Math.pow(1 - clamp(x), 3); };
  var ein = function (x) { x = clamp(x); return x * x * x; };
  var back = function (x) { x = clamp(x); var s = 1.70158; return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };
  var bounce = function (x) { x = clamp(x); var n = 7.5625, d = 2.75; if (x < 1 / d) return n * x * x; if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75; if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375; return n * (x -= 2.625 / d) * x + 0.984375; };
  var seg = function (t, a, b) { return clamp((t - a) / (b - a)); };

  var PAL0 = { ink: "#0b0813", panel: "#18132b", fg: "#f6eef7", dim: "#a095b8", line: "#3d3460", accent: "#ff6b4a", a2: "#5fd3e0", a3: "#8a7dff", good: "#5fe0a0", bad: "#ff5d73", warn: "#ffc857" };
  var FONTS = {
    sans: 'ui-rounded, "SF Pro Rounded", system-ui, -apple-system, "Segoe UI", sans-serif',
    hand: '"Bradley Hand", "Marker Felt", "Chalkboard SE", "Segoe Print", "Comic Sans MS", cursive',
    mono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
    serif: '"New York", "Iowan Old Style", Georgia, serif'
  };

  // ---- SVG path -> polylines (cached) ----------------------------------------------------------------
  var pathCache = {};
  function arcPts(x1, y1, rx, ry, phi, fa, fs, x2, y2) {
    if (!rx || !ry) return [[x2, y2]];
    rx = Math.abs(rx); ry = Math.abs(ry);
    var cp = Math.cos(phi), sp = Math.sin(phi);
    var dx = (x1 - x2) / 2, dy = (y1 - y2) / 2;
    var x1p = cp * dx + sp * dy, y1p = -sp * dx + cp * dy;
    var lam = x1p * x1p / (rx * rx) + y1p * y1p / (ry * ry);
    if (lam > 1) { var s = Math.sqrt(lam); rx *= s; ry *= s; }
    var sign = fa === fs ? -1 : 1;
    var num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p;
    var den = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
    var co = sign * Math.sqrt(Math.max(0, num / den));
    var cxp = co * rx * y1p / ry, cyp = -co * ry * x1p / rx;
    var cx = cp * cxp - sp * cyp + (x1 + x2) / 2, cy = sp * cxp + cp * cyp + (y1 + y2) / 2;
    var ang = function (ux, uy, vx, vy) { var a = Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy); return a; };
    var th1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
    var dth = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
    if (!fs && dth > 0) dth -= TAU; else if (fs && dth < 0) dth += TAU;
    var n = Math.max(6, Math.ceil(Math.abs(dth) * Math.max(rx, ry) / 5)), out = [];
    for (var i = 1; i <= n; i++) {
      var a = th1 + dth * i / n, ex = rx * Math.cos(a), ey = ry * Math.sin(a);
      out.push([cp * ex - sp * ey + cx, sp * ex + cp * ey + cy]);
    }
    return out;
  }
  function parsePath(d) {
    if (pathCache[d]) return pathCache[d];
    var toks = d.match(/[MmLlHhVvCcSsQqTtAaZz]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g) || [];
    var subs = [], cur = null, x = 0, y = 0, sx = 0, sy = 0, i = 0, cmd = "", lc = null, lq = null;
    var num = function () { return parseFloat(toks[i++]); };
    var start = function (px, py) { cur = [[px, py]]; subs.push({ pts: cur, closed: false }); };
    var bez = function (p0, p1, p2, p3) {
      var L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) + Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) + Math.hypot(p3[0] - p2[0], p3[1] - p2[1]);
      var n = clamp(Math.ceil(L / 5), 6, 48);
      for (var j = 1; j <= n; j++) { var u = j / n, v = 1 - u; cur.push([v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0], v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1]]); }
    };
    while (i < toks.length) {
      if (/[A-Za-z]/.test(toks[i])) cmd = toks[i++];
      var rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase(), ox = rel ? x : 0, oy = rel ? y : 0;
      if (C === "Z") { if (cur) { subs[subs.length - 1].closed = true; } x = sx; y = sy; cur = null; lc = lq = null; continue; }
      if (!cur && C !== "M") start(x, y);
      if (C === "M") { x = num() + ox; y = num() + oy; sx = x; sy = y; start(x, y); cmd = rel ? "l" : "L"; lc = lq = null; }
      else if (C === "L") { x = num() + ox; y = num() + oy; cur.push([x, y]); lc = lq = null; }
      else if (C === "H") { x = num() + ox; cur.push([x, y]); lc = lq = null; }
      else if (C === "V") { y = num() + oy; cur.push([x, y]); lc = lq = null; }
      else if (C === "C") { var a1 = [num() + ox, num() + oy], a2 = [num() + ox, num() + oy], a3 = [num() + ox, num() + oy]; bez([x, y], a1, a2, a3); x = a3[0]; y = a3[1]; lc = a2; lq = null; }
      else if (C === "S") { var b2 = [num() + ox, num() + oy], b3 = [num() + ox, num() + oy], b1 = lc ? [2 * x - lc[0], 2 * y - lc[1]] : [x, y]; bez([x, y], b1, b2, b3); x = b3[0]; y = b3[1]; lc = b2; lq = null; }
      else if (C === "Q") { var q1 = [num() + ox, num() + oy], q2 = [num() + ox, num() + oy]; bez([x, y], [x + 2 / 3 * (q1[0] - x), y + 2 / 3 * (q1[1] - y)], [q2[0] + 2 / 3 * (q1[0] - q2[0]), q2[1] + 2 / 3 * (q1[1] - q2[1])], q2); x = q2[0]; y = q2[1]; lq = q1; lc = null; }
      else if (C === "T") { var t2 = [num() + ox, num() + oy], t1 = lq ? [2 * x - lq[0], 2 * y - lq[1]] : [x, y]; bez([x, y], [x + 2 / 3 * (t1[0] - x), y + 2 / 3 * (t1[1] - y)], [t2[0] + 2 / 3 * (t1[0] - t2[0]), t2[1] + 2 / 3 * (t1[1] - t2[1])], t2); x = t2[0]; y = t2[1]; lq = t1; lc = null; }
      else if (C === "A") { var rx = num(), ry = num(), ph = num() * Math.PI / 180, fa = num(), fs = num(), ex2 = num() + ox, ey2 = num() + oy; var ap = arcPts(x, y, rx, ry, ph, fa, fs, ex2, ey2); for (var j = 0; j < ap.length; j++) cur.push(ap[j]); x = ex2; y = ey2; lc = lq = null; }
      else { i++; }
    }
    return (pathCache[d] = subs);
  }
  var SHAPES = {
    heart: "M0 38 C-52 -2 -34 -44 -4 -26 C-1 -24 0 -22 0 -20 C0 -22 1 -24 4 -26 C34 -44 52 -2 0 38Z",
    star: "M0 -46 L13 -16 L45 -14 L20 7 L28 38 L0 21 L-28 38 L-20 7 L-45 -14 L-13 -16Z",
    drop: "M0 -46 C20 -18 34 -2 34 14 C34 34 18 46 0 46 C-18 46 -34 34 -34 14 C-34 -2 -20 -18 0 -46Z",
    bolt: "M10 -48 L-26 6 L-4 6 L-12 48 L28 -10 L4 -10Z",
    check: "M-38 2 L-12 28 L38 -26",
    cross: "M-30 -30 L30 30 M30 -30 L-30 30",
    plus: "M0 -34 L0 34 M-34 0 L34 0",
    arrow: "M-40 0 L36 0 M14 -22 L38 0 L14 22",
    cloud: "M-30 26 C-48 26 -48 -2 -28 -4 C-28 -26 6 -34 14 -14 C34 -22 52 -4 42 12 C48 24 40 26 34 26Z",
    sun: "M0 -16 A16 16 0 1 1 0 16 A16 16 0 1 1 0 -16Z M0 -26 L0 -42 M0 26 L0 42 M-26 0 L-42 0 M26 0 L42 0 M-18 -18 L-30 -30 M18 -18 L30 -30 M-18 18 L-30 30 M18 18 L30 30",
    moon: "M14 -42 C-14 -36 -34 -14 -30 14 C-26 38 -2 50 22 40 C-8 34 -16 6 -6 -16 C-2 -26 6 -36 14 -42Z",
    leaf: "M-36 36 C-40 -10 -8 -40 38 -38 C42 8 12 40 -30 34 M-36 36 L10 -10",
    person: "M0 -44 A12 12 0 1 1 0 -20 A12 12 0 1 1 0 -44Z M0 -18 L0 12 M-24 -6 L0 -12 L24 -6 M0 12 L-18 44 M0 12 L18 44",
    house: "M-40 0 L0 -38 L40 0 M-30 -8 L-30 38 L30 38 L30 -8 M-8 38 L-8 14 L8 14 L8 38",
    bell: "M-30 24 C-22 12 -22 -6 -20 -18 C-18 -36 18 -36 20 -18 C22 -6 22 12 30 24Z M-8 32 C-6 40 6 40 8 32",
    lock: "M-24 -4 L24 -4 L24 40 L-24 40Z M-14 -4 L-14 -18 C-14 -42 14 -42 14 -18 L14 -4",
    magnifier: "M-6 -6 A28 28 0 1 1 -6 -5.9Z M14 14 L42 42",
    speech: "M-38 -30 L38 -30 L38 14 L0 14 L-20 36 L-18 14 L-38 14Z",
    doc: "M-26 -42 L12 -42 L28 -26 L28 42 L-26 42Z M12 -42 L12 -26 L28 -26 M-14 -8 L16 -8 M-14 6 L16 6 M-14 20 L6 20",
    cup: "M-26 -22 L22 -22 L18 30 C16 38 -22 38 -24 30Z M22 -12 C42 -14 42 14 20 12 M-12 -34 C-18 -40 -6 -44 -12 -50 M4 -34 C-2 -40 10 -44 4 -50",
    flask: "M-10 -42 L10 -42 M-8 -42 L-8 -12 L-34 34 C-38 42 -32 44 -26 44 L26 44 C32 44 38 42 34 34 L8 -12 L8 -42",
    bulb: "M0 -40 C-26 -40 -34 -8 -16 10 C-10 18 -10 22 -10 26 L10 26 C10 22 10 18 16 10 C34 -8 26 -40 0 -40Z M-8 34 L8 34 M-5 42 L5 42",
    pin: "M0 44 C-20 18 -30 6 -30 -10 C-30 -34 30 -34 30 -10 C30 6 20 18 0 44Z M0 -22 A10 10 0 1 1 0 -2 A10 10 0 1 1 0 -22Z",
    phone: "M-20 -42 L20 -42 L20 42 L-20 42Z M-8 34 L8 34 M-20 -32 L20 -32 M-20 28 L20 28",
    battery: "M-38 -18 L30 -18 L30 18 L-38 18Z M30 -8 L40 -8 L40 8 L30 8 M-30 -10 L-8 -10 L-8 10 L-30 10Z",
    eye: "M-44 0 C-22 -30 22 -30 44 0 C22 30 -22 30 -44 0Z M0 -12 A12 12 0 1 1 0 12 A12 12 0 1 1 0 -12Z",
    dumbbell: "M-34 -18 L-34 18 M-24 -26 L-24 26 M24 -26 L24 26 M34 -18 L34 18 M-24 0 L24 0 M-44 -8 L-44 8 M44 -8 L44 8",
    tree: "M0 44 L0 8 M0 -42 L-26 -6 L-12 -6 L-30 20 L30 20 L12 -6 L26 -6Z",
    wifi: "M-40 -10 C-20 -32 20 -32 40 -10 M-26 4 C-12 -10 12 -10 26 4 M-12 18 C-6 12 6 12 12 18 M0 30 L0 30.1",
    gear: null
  };
  function gearPts(r, teeth) {
    var out = [], n = teeth * 4;
    for (var i = 0; i < n; i++) { var a = i / n * TAU, p = i % 4, rr = (p === 0 || p === 1) ? r : r * 0.78; out.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
    return out;
  }

  // ---- the kit ---------------------------------------------------------------------------------------
  function makeKit(c, host) {
    host = host || {};
    var W = 390, H = 844, DPR = 1;
    var api = {}, S = {};
    var base = null, pal = null, st = null, camS = null, caps = null, placed = [], hits = [], cues = [], cueSeen = {};
    api.S = S; api.cues = cues;
    function reset() {
      pal = {}; for (var k in PAL0) pal[k] = (base && base[k]) || PAL0[k];
      st = { rough: 0, lw: 3, font: "sans" };
      camS = { cx: 0, cy: 0, z: 1, roll: 0 };
      caps = []; hits = []; placed = [];
      api.pal = pal;
    }
    api.theme = function (t) { base = Object.assign({}, PAL0, t || {}); reset(); api.light = lum(base.ink) > 0.55; };
    function lum(col) { var m = /^#?([0-9a-f]{6})$/i.exec(col || ""); if (!m) return 0; var n = parseInt(m[1], 16); return ((n >> 16) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114) / 255; }
    api.light = false;
    api.size = function (w, h, dpr) { W = w; H = h; DPR = dpr || 1; };
    api.frame = function () { reset(); caps.length = 0; c.setTransform(DPR, 0, 0, DPR, 0, 0); };
    api.takeCaps = function () { var x = caps; caps = []; return x; };
    api.takeHits = function () { var x = hits; hits = []; return x; };
    api.hit = function (id, x, y, r) { hits.push({ id: String(id), x: x, y: y, r: r || 30 }); };
    Object.defineProperty(api, "w", { get: function () { return W; } });
    Object.defineProperty(api, "h", { get: function () { return H; } });
    Object.defineProperty(api, "u", { get: function () { return W / 390; } });
    var C = function (x) { if (x == null) return pal.fg; return pal[x] || x; };
    api.col = C;
    api.rgba = function (col, a) {
      col = C(col); var m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(col);
      if (m) { var h = m[1]; if (h.length === 3) h = h.replace(/./g, "$&$&"); var n = parseInt(h, 16); return "rgba(" + (n >> 16) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")"; }
      var r = /^rgba?\(([^)]+)\)/.exec(col); if (r) { var p = r[1].split(","); return "rgba(" + p[0] + "," + p[1] + "," + p[2] + "," + a + ")"; }
      return col;
    };

    // time and easing
    api.clamp = clamp; api.lerp = lerp; api.ease = ease; api.eout = eout; api.ein = ein; api.back = back; api.bounce = bounce; api.seg = seg;
    api.rand = hash; api.noise = noise; api.TAU = TAU;
    api.stag = function (t, i, o) { o = o || {}; var gap = o.gap == null ? 0.25 : o.gap, dur = o.dur == null ? 0.6 : o.dur, from = o.from || 0; return seg(t, from + i * gap, from + i * gap + dur); };
    api.pulse = function (t, hz) { return (Math.sin(t * TAU * (hz || 1)) + 1) / 2; };
    api.spring = function (t, o) { o = o || {}; var k = o.k || 170, d = o.d || 13, w0 = Math.sqrt(k), z = d / (2 * w0); if (t <= 0) return 0; if (z >= 1) return 1 - Math.exp(-w0 * t) * (1 + w0 * t); var wd = w0 * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + z * w0 / wd * Math.sin(wd * t)); };
    api.orbit = function (t, cx, cy, rx, ry, period, phase) { var a = (t / (period || 4)) * TAU + (phase || 0); return [cx + Math.cos(a) * rx, cy + Math.sin(a) * (ry == null ? rx : ry)]; };
    api.wave = function (x, t, wl, sp, amp) { return Math.sin((x / wl - t * sp) * TAU) * amp; };
    api.sim = function (key, init, step, t, dt) {
      dt = dt || 1 / 60; var m = S.__sim || (S.__sim = {}), s = m[key];
      if (!s || t < s.t - 1e-9) s = m[key] = { t: 0, st: init() };
      var n = 0; while (s.t + dt <= t + 1e-9 && n++ < 6000) { step(s.st, dt); s.t += dt; }
      return s.st;
    };

    // camera
    var applyCam = function (cx, cy, z, roll) { c.setTransform(DPR, 0, 0, DPR, 0, 0); c.translate(W / 2, H / 2); c.rotate(roll || 0); c.scale(z || 1, z || 1); c.translate(-(W / 2 + (cx || 0)), -(H / 2 + (cy || 0))); };
    api.cam = function (cx, cy, z, roll) { camS = { cx: cx || 0, cy: cy || 0, z: z || 1, roll: roll || 0 }; applyCam(cx, cy, z, roll); };
    api.cam0 = function () { api.cam(0, 0, 1, 0); };
    api.focus = function (x, y, z, roll) { api.cam(x - W / 2, y - H / 2, z, roll); };
    api.layer = function (depth, fn) {
      c.save(); applyCam(camS.cx * depth, camS.cy * depth, 1 + (camS.z - 1) * depth, camS.roll * depth); fn(); c.restore();
      applyCam(camS.cx, camS.cy, camS.z, camS.roll);
    };
    api.shake = function (t, amp) { return [(noise(t * 25) - 0.5) * 2 * amp, (noise(t * 25 + 50) - 0.5) * 2 * amp]; };

    // style
    api.style = function (o) { if (o) for (var k in o) st[k] = o[k]; return st; };
    api.look = function (name, o) {
      o = o || {}; var sets = {
        sketch: { bg: "#fbf6ea", fg: "#2b2a33", dim: "#8a8576", panel: "#f1e9d4", line: "#cfc6ad", accent: "#e8553d", a2: "#2f7fd1", a3: "#7a4fc2", good: "#2f9e62", bad: "#d6334a", warn: "#e0a21b", rough: 1.6, font: "hand" },
        paper: { bg: "#f7f3ee", fg: "#26232d", dim: "#8a8497", panel: "#ffffff", line: "#ddd5ca", accent: "#ff5a3c", a2: "#1d8fb3", a3: "#6a56d6", good: "#23996a", bad: "#d33a52", warn: "#d99a14", rough: 0, font: "sans" },
        blueprint: { bg: "#0f3a66", fg: "#e9f4ff", dim: "#9cc3e6", panel: "#14497d", line: "#2f6aa3", accent: "#ffd166", a2: "#7fe3ff", a3: "#b8d7ff", good: "#8af0b5", bad: "#ff9aa8", warn: "#ffd166", rough: 0.4, font: "mono", grid: true },
        chalk: { bg: "#1f3a2e", fg: "#f4f1e6", dim: "#a9bfb2", panel: "#27483a", line: "#3d6552", accent: "#ffd27a", a2: "#9be3ff", a3: "#ffb3c7", good: "#b4f08d", bad: "#ff9a8a", warn: "#ffd27a", rough: 1.4, font: "hand" },
        neon: { bg: "#07060f", fg: "#f2f0ff", dim: "#8e8aa8", panel: "#120f24", line: "#2a2450", accent: "#ff3d9a", a2: "#27e0ff", a3: "#a56bff", good: "#4dffb4", bad: "#ff5470", warn: "#ffe14d", rough: 0, font: "sans", glow: 10 },
        noir: { bg: "#0d0d0f", fg: "#ececec", dim: "#8a8a92", panel: "#17171b", line: "#33333b", accent: "#e8e8e8", a2: "#b4b4bd", a3: "#7e7e8a", good: "#cfcfcf", bad: "#9a9aa4", warn: "#dcdcdc", rough: 0, font: "serif" },
        agent: { rough: 0 }
      }, s = sets[name] || sets.paper;
      if (name === "agent") { api.light = lum(pal.ink) > 0.55; c.save(); c.setTransform(DPR, 0, 0, DPR, 0, 0); c.fillStyle = pal.ink; c.fillRect(0, 0, W, H); c.restore(); return; }
      for (var k in s) { if (k === "bg") pal.ink = s.bg; else if (k === "rough" || k === "font" || k === "glow") st[k] = s[k]; else if (pal[k] !== undefined) pal[k] = s[k]; }
      if (o.accent) pal.accent = C(o.accent);
      api.light = lum(pal.ink) > 0.55;
      c.save(); c.setTransform(DPR, 0, 0, DPR, 0, 0); c.fillStyle = pal.ink; c.fillRect(0, 0, W, H); c.restore();
      if (s.grid) api.bg("grid", { c: "line" });
      if (name === "paper" || name === "sketch") api.bg("dots", { c: "line", a: 0.6 });
    };
    api.bg = function (kind, o) {
      o = o || {}; c.save(); c.setTransform(DPR, 0, 0, DPR, 0, 0); var col = C(o.c || "line"), sp = (o.size || 32);
      var ox = ((camS.cx || 0) * (o.par == null ? 0.5 : o.par)) % sp, oy = ((camS.cy || 0) * (o.par == null ? 0.5 : o.par)) % sp;
      c.globalAlpha = o.a == null ? 0.6 : o.a;
      if (kind === "grid") { c.strokeStyle = col; c.lineWidth = 1; c.beginPath(); for (var x = -ox; x < W + sp; x += sp) { c.moveTo(x, 0); c.lineTo(x, H); } for (var y = -oy; y < H + sp; y += sp) { c.moveTo(0, y); c.lineTo(W, y); } c.stroke(); }
      else if (kind === "dots") { c.fillStyle = col; for (var x2 = -ox; x2 < W + sp; x2 += sp) for (var y2 = -oy; y2 < H + sp; y2 += sp) { c.beginPath(); c.arc(x2, y2, 1.3, 0, TAU); c.fill(); } }
      else if (kind === "gradient") { var gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, C(o.from || "panel")); gr.addColorStop(1, C(o.to || "ink")); c.globalAlpha = 1; c.fillStyle = gr; c.fillRect(0, 0, W, H); }
      else if (kind === "glow") { var gg = c.createRadialGradient(W / 2, H * (o.y == null ? 0.5 : o.y), 0, W / 2, H * (o.y == null ? 0.5 : o.y), Math.max(W, H) * 0.7); gg.addColorStop(0, api.rgba(o.c || "a3", 0.35)); gg.addColorStop(1, api.rgba(o.c || "a3", 0)); c.globalAlpha = 1; c.fillStyle = gg; c.fillRect(0, 0, W, H); }
      c.restore();
    };
    api.fill = function (col) { c.save(); c.setTransform(DPR, 0, 0, DPR, 0, 0); c.fillStyle = C(col); c.fillRect(0, 0, W, H); c.restore(); };

    // ---- polylines: the one stroke routine ------------------------------------------------------------
    function jitter(P, o) {
      var r = o.rough != null ? o.rough : st.rough; if (!r) return P;
      var sd = o.seed != null ? o.seed : (P[0][0] * 0.37 + P[0][1] * 0.71), out = [], arc = 0;
      for (var i = 0; i < P.length - 1; i++) {
        var a = P[i], b = P[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, n = Math.max(1, Math.ceil(L / 14)), nx = -dy / L, ny = dx / L;
        for (var s = 0; s < n; s++) { var u = s / n, w = (noise(sd + (arc + L * u) / 38) - 0.5) * 2 * r * 1.7; out.push([a[0] + dx * u + nx * w, a[1] + dy * u + ny * w]); }
        arc += L;
      }
      var last = P[P.length - 1]; out.push([last[0], last[1]]); return out;
    }
    function cutPts(P, k) {
      var tot = 0, i; for (i = 0; i < P.length - 1; i++) tot += Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]);
      var goal = tot * k, acc = 0, out = [P[0]];
      for (i = 0; i < P.length - 1; i++) {
        var L = Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]);
        if (acc + L >= goal) { var u = L ? (goal - acc) / L : 0; out.push([P[i][0] + (P[i + 1][0] - P[i][0]) * u, P[i][1] + (P[i + 1][1] - P[i][1]) * u]); return out; }
        out.push(P[i + 1]); acc += L;
      }
      return out;
    }
    function polyLen(P) { var t = 0; for (var i = 0; i < P.length - 1; i++) t += Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]); return t; }
    function traceP(P, close) { c.beginPath(); c.moveTo(P[0][0], P[0][1]); for (var i = 1; i < P.length; i++) c.lineTo(P[i][0], P[i][1]); if (close) c.closePath(); }
    function headAt(Q, col, size, a) {
      var n = Q.length; if (n < 2) return; var p = Q[n - 1], q = Q[Math.max(0, n - 2)], j = n - 2; while (j > 0 && Math.hypot(p[0] - q[0], p[1] - q[1]) < 3) { j--; q = Q[j]; }
      var ang = Math.atan2(p[1] - q[1], p[0] - q[0]); c.save(); c.globalAlpha *= a; c.fillStyle = col; c.translate(p[0], p[1]); c.rotate(ang);
      c.beginPath(); c.moveTo(0, 0); c.lineTo(-size, -size * 0.55); c.lineTo(-size * 0.7, 0); c.lineTo(-size, size * 0.55); c.closePath(); c.fill(); c.restore();
    }
    function stroke(pts, o, closed) {
      o = o || {}; if (!pts || pts.length < 1) return;
      var k = o.k == null ? 1 : o.k; if (k <= 0) return;
      var P = pts.length > 1 ? jitter(pts, o) : pts;
      if (closed) P = P.concat([P[0]]);
      var col = C(o.c), lw = o.w == null ? st.lw : o.w, A = o.a == null ? 1 : o.a;
      if (o.fill && P.length > 2) {
        c.save(); c.globalAlpha *= A * (o.fa == null ? 1 : o.fa) * (closed ? seg(k, 0.45, 1) : eout(k)); c.fillStyle = C(o.fill); traceP(P, true); c.fill(); c.restore();
      }
      var Q = k >= 1 ? P : cutPts(P, k);
      if (lw > 0 && Q.length > 1) {
        c.save(); c.globalAlpha *= A; c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = "round"; c.lineCap = "round";
        var gl = o.glow != null ? o.glow : st.glow; if (gl) { c.shadowColor = o.glowc ? C(o.glowc) : col; c.shadowBlur = gl; }
        if (o.dash) { c.setLineDash(o.dash); c.lineDashOffset = -(o.dashOff || 0); }
        traceP(Q, false); c.stroke(); c.restore();
        if (o.head) { var hs = (typeof o.head === "number" ? o.head : 10 + lw * 1.5); headAt(Q, col, hs, A * seg(k, 0.82, 1)); }
        if (o.tail) { var R = Q.slice().reverse(); headAt(R, col, typeof o.tail === "number" ? o.tail : 10 + lw * 1.5, A * seg(k, 0.82, 1)); }
      }
      if (o.pen && k < 1 && Q.length) { var e = Q[Q.length - 1]; c.save(); c.fillStyle = C(o.pen === true ? "accent" : o.pen); c.beginPath(); c.arc(e[0], e[1], lw + 2, 0, TAU); c.fill(); c.restore(); }
    }
    api.stroke = function (pts, o) { stroke(pts, o, o && o.close); };

    // ---- shapes -----------------------------------------------------------------------------------------
    api.line = function (x1, y1, x2, y2, o) { stroke([[x1, y1], [x2, y2]], o); };
    api.arrow = function (x1, y1, x2, y2, o) {
      o = Object.assign({ head: true }, o || {});
      if (o.bend) { var mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, cx = mx - dy / L * o.bend, cy = my + dx / L * o.bend; return api.curve(x1, y1, cx, cy, x2, y2, o); }
      stroke([[x1, y1], [x2, y2]], o);
    };
    api.curve = function (x1, y1, cx, cy, x2, y2, o) {
      var n = 36, P = []; for (var i = 0; i <= n; i++) { var u = i / n, v = 1 - u; P.push([v * v * x1 + 2 * v * u * cx + u * u * x2, v * v * y1 + 2 * v * u * cy + u * u * y2]); }
      stroke(P, o);
    };
    api.poly = function (pts, o) { o = o || {}; stroke(pts, o, o.close !== false); };
    function rrPts(x, y, w, h, r) {
      r = Math.min(r || 0, w / 2, h / 2); if (r < 0.5) return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
      var P = [], n = 6, corners = [[x + w - r, y + r, -Math.PI / 2], [x + w - r, y + h - r, 0], [x + r, y + h - r, Math.PI / 2], [x + r, y + r, Math.PI]];
      for (var q = 0; q < 4; q++) for (var i = 0; i <= n; i++) { var a = corners[q][2] + i / n * Math.PI / 2; P.push([corners[q][0] + Math.cos(a) * r, corners[q][1] + Math.sin(a) * r]); }
      return P;
    }
    api.rect = function (x, y, w, h, o) { o = o || {}; stroke(rrPts(x, y, w, h, o.r), o, true); };
    api.box = function (cx, cy, w, h, o) { o = o || {}; var s = o.s == null ? 1 : o.s; api.rect(cx - w * s / 2, cy - h * s / 2, w * s, h * s, o); };
    function arcP(cx, cy, rx, ry, a0, a1, rot) {
      var n = clamp(Math.ceil(Math.max(rx, ry) * Math.abs(a1 - a0) / 6), 12, 120), P = [], cr = Math.cos(rot || 0), sr = Math.sin(rot || 0);
      for (var i = 0; i <= n; i++) { var a = a0 + (a1 - a0) * i / n, ex = Math.cos(a) * rx, ey = Math.sin(a) * ry; P.push([cx + ex * cr - ey * sr, cy + ex * sr + ey * cr]); }
      return P;
    }
    api.circle = function (x, y, r, o) { o = o || {}; var P = arcP(x, y, r, r, -Math.PI / 2, -Math.PI / 2 + TAU * (o.k == null ? 1 : 1), 0); P.pop(); stroke(P, o, true); };
    api.ellipse = function (x, y, rx, ry, o) { o = o || {}; var P = arcP(x, y, rx, ry, -Math.PI / 2, TAU - Math.PI / 2, o.rot || 0); P.pop(); stroke(P, o, true); };
    api.arc = function (x, y, r, a0, a1, o) { stroke(arcP(x, y, r, r, a0, a1, 0), o); };
    api.dot = function (x, y, r, o) {
      o = o || {}; var k = o.k == null ? 1 : o.k; if (k <= 0) return; var col = C(o.c || "accent"), rr = r * (o.back ? back(k) : eout(k)); c.save(); c.globalAlpha *= o.a == null ? 1 : o.a;
      var gl = o.glow != null ? o.glow : st.glow; if (gl) { c.shadowColor = o.glowc ? C(o.glowc) : col; c.shadowBlur = gl; }
      c.fillStyle = col; c.beginPath(); c.arc(x, y, Math.max(0, rr), 0, TAU); c.fill(); c.restore();
    };
    api.glow = function (x, y, r, o) {
      o = o || {}; var gr = c.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, api.rgba(o.c || "accent", o.a == null ? 0.7 : o.a)); gr.addColorStop(1, api.rgba(o.c || "accent", 0));
      c.save(); c.fillStyle = gr; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.restore();
    };
    api.ring = function (n, cx, cy, r, a0) { var P = []; for (var i = 0; i < n; i++) { var a = (a0 || -Math.PI / 2) + i / n * TAU; P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return P; };
    // svg path string, in its own units, placed with x, y (origin), s scale, rot
    api.path = function (d, o) {
      // the spike's form, kept so older films play: api.path(points, close) builds a smooth path on c and leaves stroking to the caller
      if (Array.isArray(d)) { var pts0 = d, close0 = o; c.beginPath(); var n0 = pts0.length; if (n0 < 2) return; if (close0) { var mid = function (i) { return [(pts0[i % n0][0] + pts0[(i + 1) % n0][0]) / 2, (pts0[i % n0][1] + pts0[(i + 1) % n0][1]) / 2]; }; var m0 = mid(n0 - 1); c.moveTo(m0[0], m0[1]); for (var i0 = 0; i0 < n0; i0++) { var e0 = mid(i0); c.quadraticCurveTo(pts0[i0][0], pts0[i0][1], e0[0], e0[1]); } c.closePath(); } else { c.moveTo(pts0[0][0], pts0[0][1]); for (var j0 = 1; j0 < n0 - 1; j0++) c.quadraticCurveTo(pts0[j0][0], pts0[j0][1], (pts0[j0][0] + pts0[j0 + 1][0]) / 2, (pts0[j0][1] + pts0[j0 + 1][1]) / 2); c.lineTo(pts0[n0 - 1][0], pts0[n0 - 1][1]); } return; }
      o = o || {}; var subs = parsePath(d), s = o.s == null ? 1 : o.s, sx = o.sx == null ? s : o.sx, sy = o.sy == null ? s : o.sy, x0 = o.x || 0, y0 = o.y || 0, cr = Math.cos(o.rot || 0), sr = Math.sin(o.rot || 0);
      var tf = function (p) { var X = p[0] * sx, Y = p[1] * sy; return [x0 + X * cr - Y * sr, y0 + X * sr + Y * cr]; };
      var all = subs.map(function (sb) { return { P: sb.pts.map(tf), closed: sb.closed }; });
      var total = 0; all.forEach(function (a) { a.L = polyLen(a.P) + (a.closed ? Math.hypot(a.P[0][0] - a.P[a.P.length - 1][0], a.P[0][1] - a.P[a.P.length - 1][1]) : 0); total += a.L; });
      var k = o.k == null ? 1 : o.k, acc = 0;
      all.forEach(function (a) { var kk = clamp((k * total - acc) / (a.L || 1)); acc += a.L; var oo = Object.assign({}, o); oo.k = kk; if (!a.closed) oo.fill = o.fill && o.fillOpen ? o.fill : null; stroke(a.P, oo, a.closed); });
    };
    api.pathPts = function (d, o) { o = o || {}; var s = o.s == null ? 1 : o.s; var subs = parsePath(d); return subs.map(function (sb) { return sb.pts.map(function (p) { return [(o.x || 0) + p[0] * s, (o.y || 0) + p[1] * s]; }); }); };
    api.shape = function (name, x, y, size, o) {
      o = o || {}; var s = size / 100;
      if (name === "gear") { stroke(gearPts(size * 0.46, o.teeth || 8).map(function (p) { return [x + p[0], y + p[1]]; }), Object.assign({}, o, { rot: 0 }), true); api.circle(x, y, size * 0.16, Object.assign({}, o, { fill: null })); return; }
      var d = SHAPES[name]; if (!d) return;
      api.path(d, Object.assign({}, o, { x: x, y: y, s: s, w: o.w == null ? Math.max(2, size / 22) : o.w }));
    };
    api.shapes = Object.keys(SHAPES);

    // ---- text -------------------------------------------------------------------------------------------
    function fontOf(o) { var size = o.size || 24, wt = o.weight || (o.font === "mono" ? 600 : 700), fam = FONTS[o.font || st.font] || FONTS.sans; return (o.italic ? "italic " : "") + wt + " " + size + "px " + fam; }
    function wrap(str, o) {
      var parts = String(str).split("\n"), lines = [];
      for (var q = 0; q < parts.length; q++) {
        if (!o.maxw) { lines.push(parts[q]); continue; }
        var words = parts[q].split(" "), ln = "";
        for (var i = 0; i < words.length; i++) { var test = ln ? ln + " " + words[i] : words[i]; if (c.measureText(test).width > o.maxw && ln) { lines.push(ln); ln = words[i]; } else ln = test; }
        lines.push(ln);
      }
      return lines;
    }
    api.measure = function (str, o) {
      o = o || {}; c.save(); c.font = fontOf(o); var ls = wrap(str, o), w = 0; ls.forEach(function (l) { w = Math.max(w, c.measureText(l).width); }); c.restore();
      var lh = (o.size || 24) * (o.lh || 1.22); return { w: w, h: lh * ls.length, lines: ls.length };
    };
    api.text = function (str, x, y, o) {
      o = o || {}; str = String(str); var k = o.k == null ? 1 : o.k; if (k <= 0) return null;
      var still = camS.z === 1 && !camS.cx && !camS.cy && !camS.roll;
      if (!o.maxw && still && !o.nowrap) o = Object.assign({}, o, { maxw: W - 28 });
      c.save(); c.font = fontOf(o); var size = o.size || 24, lh = size * (o.lh || 1.22), al = o.align || "center";
      var lines = wrap(str, o), w = 0; lines.forEach(function (l) { w = Math.max(w, c.measureText(l).width); });
      var pad0 = o.bg ? (o.pad == null ? size * 0.4 : o.pad) : 0;
      var tm = c.getTransform && c.getTransform(); if (!tm || typeof tm.a !== "number") tm = { a: DPR, b: 0, c: 0, d: DPR, e: 0, f: 0 };
      var flat = still;  // a still camera: the caption band and the screen edge apply
      if (flat && !o.free) { if (al === "center") x = Math.min(W - 8 - pad0 - w / 2, Math.max(8 + pad0 + w / 2, x)); else if (al === "left") x = Math.max(8 + pad0, Math.min(x, W - 8 - pad0 - w)); else x = Math.min(W - 8 - pad0, Math.max(x, 8 + pad0 + w)); }
      var h = lh * lines.length, left = al === "left" ? x : al === "right" ? x - w : x - w / 2, top = o.base === "top" ? y : y - h / 2;
      if (!o.free && !tm.b && !tm.c) {  // look pass (MOTION-2, MOTION-8): a text never lands on another text, judged in screen pixels whatever the camera does, and never in the caption band
        var sx = tm.a / DPR, sy = tm.d / DPR, pv = (o.bg ? (o.pad == null ? size * 0.4 : o.pad) * 0.6 : 0) * sy, lim = H - 168, tries = 0, hit;
        var X = function () { return (tm.a * left + tm.e) / DPR; }, Y = function () { return (tm.d * top + tm.f) / DPR; }, sw = w * sx, sh = h * sy;
        do {
          var x0 = X(), y0 = Y(), y1;
          if (flat && y0 + sh + pv > lim) { top += (lim - sh - pv - y0) / sy; y0 = Y(); }  // keep out of the caption band first, then settle any overlap by going the other way
          hit = null;
          for (var pi = 0; pi < placed.length; pi++) {
            var q = placed[pi];
            if (q.s !== str && x0 < q.x + q.w + 2 && x0 + sw > q.x - 2 && y0 - pv < q.y + q.h + 2 && y0 + sh + pv > q.y - 2) { hit = q; break; }
          }
          if (hit) { var below = hit.y + hit.h + 6 + pv; y1 = !flat || below + sh + pv <= lim ? below : hit.y - 6 - pv - sh; top += (y1 - y0) / sy; }
        } while (hit && ++tries < 4);
        placed.push({ x: X(), y: Y(), w: sw, h: sh, s: str });
      }
      var box = { x: left, y: top, w: w, h: h, cx: left + w / 2, cy: top + h / 2 };
      var vis = o.type ? Math.floor(str.length * k) : str.length, A = (o.type ? 1 : eout(k)) * (o.a == null ? 1 : o.a);
      if (o.bg) { var pad = o.pad == null ? size * 0.4 : o.pad; c.globalAlpha *= A; c.fillStyle = C(o.bg); var pp = rrPts(left - pad, top - pad * 0.6, w + pad * 2, h + pad * 1.2, o.r == null ? 10 : o.r); traceP(pp, true); c.fill(); if (o.border) { c.strokeStyle = C(o.border); c.lineWidth = 2; c.stroke(); } c.globalAlpha /= A || 1; }
      c.globalAlpha *= A; c.textAlign = al; c.textBaseline = "middle"; c.fillStyle = C(o.c);
      if (o.shadow) { c.shadowColor = "rgba(0,0,0,.55)"; c.shadowBlur = o.shadow === true ? 10 : o.shadow; }
      var dy = (o.type ? 0 : (1 - eout(k)) * (o.rise == null ? 8 : o.rise)), seen = 0;
      lines.forEach(function (l, i) {
        var s2 = l; if (o.type) { var rem = vis - seen; s2 = rem <= 0 ? "" : l.slice(0, rem); seen += l.length; }
        var yy = top + lh * i + lh / 2 + dy, xx = al === "left" ? x : al === "right" ? x : x;
        if (o.outline) { c.lineWidth = o.outline; c.strokeStyle = C(o.outlinec || "ink"); c.lineJoin = "round"; c.strokeText(s2, xx, yy); }
        c.fillText(s2, xx, yy);
      });
      c.restore(); return box;
    };
    api.label = function (str, x, y, o) {
      o = o || {}; var k = o.k == null ? 1 : o.k; if (k <= 0) return null;
      c.save(); var s = o.back === false ? eout(k) : back(k); c.translate(x, y); c.scale(s, s); c.translate(-x, -y);
      var b = api.text(str, x, y, Object.assign({ size: 16, bg: o.bg || "panel", border: o.border === undefined ? "line" : o.border, r: 99, pad: (o.size || 16) * 0.55, k: 1 }, o, { k: 1 }));
      c.restore(); return b;
    };
    api.kinetic = function (str, x, y, o) {
      o = o || {}; var k = o.k == null ? 1 : o.k, mode = o.mode || "rise", size = o.size || 44; if (k <= 0) return null;
      c.save(); c.font = fontOf(Object.assign({}, o, { size: size, weight: o.weight || 800 }));
      var chars = mode === "scatter" || mode === "wave" || mode === "type" || o.chars, units = [], words = String(str).split(" "), lhh = size * (o.lh || 1.15), maxw = o.maxw || (W - 40), sp = c.measureText(" ").width;
      var lines = [], ln = [], lw = 0;
      words.forEach(function (wd) { var ww = c.measureText(wd).width; if (ln.length && lw + sp + ww > maxw) { lines.push({ ws: ln, w: lw }); ln = []; lw = 0; } ln.push({ s: wd, w: ww }); lw += (ln.length > 1 ? sp : 0) + ww; });
      if (ln.length) lines.push({ ws: ln, w: lw });
      var top = y - lhh * lines.length / 2 + lhh / 2, idx = 0;
      lines.forEach(function (L, li) {
        var cx = x - L.w / 2;
        L.ws.forEach(function (wd) {
          if (chars) { var px = cx; for (var q = 0; q < wd.s.length; q++) { var chw = c.measureText(wd.s[q]).width; units.push({ s: wd.s[q], x: px + chw / 2, y: top + lhh * li, i: idx++ }); px += chw; } }
          else units.push({ s: wd.s, x: cx + wd.w / 2, y: top + lhh * li, i: idx++ });
          cx += wd.w + sp; if (chars) idx++;
        });
      });
      var n = Math.max(1, idx), t = o.t || 0, col = C(o.c); c.textAlign = "center"; c.textBaseline = "middle";
      if (o.shadow !== false) { c.shadowColor = "rgba(0,0,0,.45)"; c.shadowBlur = 12; }
      units.forEach(function (u) {
        var kk = seg(k, u.i / n * 0.7, u.i / n * 0.7 + 0.3 + 0.0001), px = u.x, py = u.y, sc = 1, al = 1, rot = 0;
        if (mode === "rise") { py += (1 - eout(kk)) * size * 0.8; al = kk; }
        else if (mode === "drop") { py -= (1 - bounce(kk)) * size * 2; al = clamp(kk * 4); }
        else if (mode === "pop") { sc = back(kk); al = clamp(kk * 3); }
        else if (mode === "wave") { py += Math.sin(t * 5 + u.i * 0.6) * size * 0.14 * seg(k, 0, 0.2); al = kk; }
        else if (mode === "scatter") { var e = eout(kk); px = lerp(x + (hash(u.i * 3.1) - 0.5) * W * 1.6, u.x, e); py = lerp(y + (hash(u.i * 7.7) - 0.5) * H, u.y, e); rot = (1 - e) * (hash(u.i) - 0.5) * 3; al = clamp(kk * 3); }
        else if (mode === "type") { al = kk > 0 ? 1 : 0; }
        else if (mode === "slide") { px += (1 - eout(kk)) * -size * 3; al = kk; }
        c.save(); c.globalAlpha *= al * (o.a == null ? 1 : o.a); c.translate(px, py); c.rotate(rot); c.scale(sc, sc); c.fillStyle = (o.hot != null && u.i === o.hot) ? C("accent") : col; c.fillText(u.s, 0, 0); c.restore();
      });
      c.restore(); return { x: x - maxw / 2, y: top - lhh / 2, h: lhh * lines.length };
    };
    api.say = function (text, from, to, o) {
      caps.push({ text: text, from: from, to: to, o: o || {} });
      var key = text + "|" + from; if (!cueSeen[key]) { cueSeen[key] = 1; cues.push({ text: text, from: from, to: to }); }
    };

    // ---- diagram bits -----------------------------------------------------------------------------------
    api.callout = function (str, tx, ty, lx, ly, o) {
      o = o || {}; var k = o.k == null ? 1 : o.k; if (k <= 0) return null; var col = o.c || "accent";
      var m = api.measure(str, { size: o.size || 16, maxw: o.maxw || 150 }), pad = (o.size || 16) * 0.55;
      var hw = m.w / 2 + pad, hh = m.h / 2 + pad * 0.6, dx = tx - lx, dy = ty - ly, sc = Math.min(hw / Math.max(Math.abs(dx), 0.001), hh / Math.max(Math.abs(dy), 0.001)), ex = lx + dx * Math.min(1, sc), ey = ly + dy * Math.min(1, sc);
      var kd = seg(k, 0, 0.3), kl = seg(k, 0.2, 0.6), kt = seg(k, 0.45, 1);
      api.dot(tx, ty, o.dot || 5, { c: col, k: kd, back: true });
      if (kd > 0 && kd < 1.0001) api.circle(tx, ty, (o.dot || 5) + 10 * (1 - kd) + 4, { c: col, w: 1.5, a: (1 - kd) * 0.8 });
      api.circle(tx, ty, (o.dot || 5) + 7, { c: col, w: 2, k: kd, a: 0.9, rough: 0 });
      api.line(tx, ty, ex, ey, { c: col, w: o.w || 2, k: kl, rough: o.rough });
      return api.label(str, lx, ly, { size: o.size || 16, maxw: o.maxw || 150, k: kt, border: col, bg: o.bg || "panel", c: o.tc || "fg", r: 12, back: false });
    };
    api.pin = function (n, x, y, o) { o = o || {}; var k = o.k == null ? 1 : o.k; if (k <= 0) return; var r = o.r || 13; c.save(); c.translate(x, y); var s = back(k); c.scale(s, s); api.dot(0, 0, r, { c: o.c || "accent" }); api.text(String(n), 0, 1, { size: r * 1.15, c: "ink", weight: 800, free: 1 }); c.restore(); };
    api.brace = function (x1, y1, x2, y2, o) {
      o = o || {}; var dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, sg = o.side || 1, nx = -dy / L * sg, ny = dx / L * sg, d = o.depth || 14, P = [];
      var at = function (u, v) { return [x1 + dx * u + nx * v, y1 + dy * u + ny * v]; };
      var q = function (u0, v0, cu, cv, u1, v1) { for (var i = P.length ? 1 : 0; i <= 10; i++) { var f = i / 10, g = 1 - f; P.push(at(g * g * u0 + 2 * g * f * cu + f * f * u1, g * g * v0 + 2 * g * f * cv + f * f * v1)); } };
      q(0, 0, 0, d * 0.5, 0.2, d * 0.5); q(0.2, d * 0.5, 0.45, d * 0.5, 0.5, d); q(0.5, d, 0.55, d * 0.5, 0.8, d * 0.5); q(0.8, d * 0.5, 1, d * 0.5, 1, 0);
      stroke(P, o);
    };
    api.dim = function (x1, y1, x2, y2, str, o) {
      o = o || {}; var k = o.k == null ? 1 : o.k; if (k <= 0) return; var dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, t = 7;
      var col = o.c || "dim"; api.line(x1, y1, x2, y2, { c: col, w: o.w || 2, k: k, head: true, tail: true });
      api.line(x1 + nx * t, y1 + ny * t, x1 - nx * t, y1 - ny * t, { c: col, w: o.w || 2, k: k }); api.line(x2 + nx * t, y2 + ny * t, x2 - nx * t, y2 - ny * t, { c: col, w: o.w || 2, k: k });
      if (str != null) api.label(String(str), (x1 + x2) / 2 + nx * (o.off == null ? 0 : o.off), (y1 + y2) / 2 + ny * (o.off == null ? 0 : o.off), { size: o.size || 15, k: seg(k, 0.5, 1), c: o.tc || "fg" });
    };
    api.scribble = function (x, y, rx, ry, o) {
      o = o || {}; var P = [], n = 70, ph = hash((o.seed || 1) * 11) * 6; for (var i = 0; i <= n; i++) { var a = ph + i / n * TAU * 1.12, r = 1 + 0.05 * Math.sin(i * 1.3) + i / n * 0.12; P.push([x + Math.cos(a) * rx * r, y + Math.sin(a) * ry * r]); }
      stroke(P, Object.assign({ c: "accent", w: 3, rough: 0 }, o));
    };
    api.underline = function (x, y, w, o) { o = o || {}; var P = []; for (var i = 0; i <= 12; i++) P.push([x + w * i / 12, y + Math.sin(i * 1.7 + (o.seed || 0)) * 1.6 + i / 12 * 2]); stroke(P, Object.assign({ c: "accent", w: 4 }, o)); };
    api.highlight = function (x, y, w, h, o) { o = o || {}; var k = o.k == null ? 1 : o.k; if (k <= 0) return; c.save(); c.globalAlpha *= o.a == null ? 0.35 : o.a; c.fillStyle = C(o.c || "warn"); c.fillRect(x, y, w * ease(k), h); c.restore(); };
    api.node = function (x, y, w, h, str, o) {
      o = o || {}; var k = o.k == null ? 1 : o.k, A = { x: x, y: y, w: w, h: h, cx: x, cy: y, l: [x - w / 2, y], r: [x + w / 2, y], t: [x, y - h / 2], b: [x, y + h / 2] };
      if (k <= 0) return A; c.save(); var s = o.pop ? back(k) : 1; c.translate(x, y); c.scale(s, s); c.translate(-x, -y); c.globalAlpha *= o.pop ? clamp(k * 3) : 1;
      api.rect(x - w / 2, y - h / 2, w, h, { c: o.c || "line", w: o.w == null ? 2.5 : o.w, fill: o.fill || "panel", r: o.r == null ? 14 : o.r, k: o.pop ? 1 : k, glow: o.glow, rough: o.rough });
      var tk = o.pop ? 1 : seg(k, 0.5, 1), ic = o.icon, tx = x;
      if (ic) { api.shape(ic, x - w / 2 + 24, y, Math.min(30, h * 0.55), { c: o.ic || o.c || "accent", k: tk }); tx = x + 16; }
      if (str != null) api.text(str, tx, y, { size: o.size || 16, maxw: w - (ic ? 64 : 24), k: tk, c: o.tc || "fg", font: o.font });
      c.restore(); return A;
    };
    function side(a, b, mode) { var dx = b.cx - a.cx, dy = b.cy - a.cy; if (mode === "h" || (mode !== "v" && Math.abs(dx) * a.h > Math.abs(dy) * a.w)) return dx > 0 ? [a.r, b.l] : [a.l, b.r]; return dy > 0 ? [a.b, b.t] : [a.t, b.b]; }
    api.link = function (a, b, o) {
      o = o || {}; var k = o.k == null ? 1 : o.k; if (k <= 0) return; var s = side(a, b, o.dir), p = s[0], q = s[1], gap = o.gap == null ? 4 : o.gap;
      var dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1, p2 = [p[0] + dx / L * gap, p[1] + dy / L * gap], q2 = [q[0] - dx / L * gap, q[1] - dy / L * gap];
      var col = o.c || "dim";
      if (o.bend) api.arrow(p2[0], p2[1], q2[0], q2[1], { c: col, w: o.w || 2.5, k: k, bend: o.bend, head: o.head !== false, dash: o.dash });
      else api.arrow(p2[0], p2[1], q2[0], q2[1], { c: col, w: o.w || 2.5, k: k, head: o.head !== false, dash: o.dash });
      if (o.label) api.label(o.label, (p2[0] + q2[0]) / 2, (p2[1] + q2[1]) / 2, { size: 13, k: seg(k, 0.6, 1), c: "dim" });
      if (o.flow != null && k >= 1) { var n = o.n || 4, t = o.flow; for (var i = 0; i < n; i++) { var u = ((t * (o.speed || 0.5) + i / n) % 1); api.dot(p2[0] + (q2[0] - p2[0]) * u, p2[1] + (q2[1] - p2[1]) * u, o.r || 4, { c: o.fc || "accent", a: Math.sin(u * Math.PI) }); } }
    };
    api.grid = function (n, o) {
      o = o || {}; var x = o.x == null ? 0 : o.x, y = o.y == null ? 0 : o.y, w = o.w == null ? W : o.w, h = o.h == null ? H : o.h, cols = o.cols || Math.ceil(Math.sqrt(n)), rows = Math.ceil(n / cols), g = o.gap == null ? 12 : o.gap, cw = (w - g * (cols - 1)) / cols, ch = (h - g * (rows - 1)) / rows, out = [];
      for (var i = 0; i < n; i++) { var cx = i % cols, cy = Math.floor(i / cols); out.push({ x: x + cx * (cw + g), y: y + cy * (ch + g), w: cw, h: ch, cx: x + cx * (cw + g) + cw / 2, cy: y + cy * (ch + g) + ch / 2, i: i }); }
      return out;
    };
    api.row = function (n, x, y, w, gap) { var out = []; for (var i = 0; i < n; i++) out.push([x + (n === 1 ? w / 2 : w * i / (n - 1)), y]); return out; };
    api.col = function (n, x, y, h) { var out = []; for (var i = 0; i < n; i++) out.push([x, y + (n === 1 ? h / 2 : h * i / (n - 1))]); return out; };

    // ---- data -------------------------------------------------------------------------------------------
    var fmtNum = function (v, o) { var d = o.d == null ? 0 : o.d, s = Math.abs(v).toFixed(d), parts = s.split("."); if (o.sep !== false) parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ","); return (v < 0 ? "-" : "") + (o.pre || "") + parts.join(".") + (o.suf || ""); };
    api.fmt = fmtNum;
    api.counter = function (v, x, y, o) { o = o || {}; var k = o.k == null ? 1 : o.k, val = lerp(o.from || 0, v, ease(k)); return api.text(fmtNum(val, o), x, y, Object.assign({ size: 56, weight: 800, c: "fg" }, o, { k: 1 })); };
    api.bars = function (data, x, y, w, h, o) {
      o = o || {}; var k = o.k == null ? 1 : o.k, n = data.length, vs = data.map(function (d) { return typeof d === "number" ? d : d.v; }), mx = o.max || Math.max.apply(null, vs.concat([0.0001])), gw = w / n, bw = gw * (o.bar || 0.62), cols = ["accent", "a2", "a3", "good", "warn"];
      api.line(x, y + h, x + w, y + h, { c: "line", w: 2, k: seg(k, 0, 0.2) });
      for (var i = 0; i < n; i++) {
        var d = data[i], kk = seg(k, 0.1 + i * 0.07, 0.1 + i * 0.07 + 0.45), bh = h * vs[i] / mx * eout(kk), bx = x + gw * i + (gw - bw) / 2, col = (d && d.c) || o.c || cols[i % cols.length];
        if (kk > 0) { api.rect(bx, y + h - bh, bw, bh, { fill: col, c: col, w: 0, r: Math.min(8, bw / 3), a: 1 }); }
        if (o.vals !== false && kk > 0.2) api.text(fmtNum(vs[i] * eout(kk), o), bx + bw / 2, y + h - bh - 14, { size: o.vs || 14, c: "fg", k: seg(kk, 0.2, 0.8) });
        if (d && d.label) api.text(d.label, bx + bw / 2, y + h + 16, { size: o.ls || 13, c: "dim", k: seg(k, 0.15, 0.5), maxw: gw });
      }
    };
    api.lineChart = function (series, x, y, w, h, o) {
      o = o || {}; var k = o.k == null ? 1 : o.k, ss = series.length && typeof series[0] === "number" ? [{ v: series }] : series, all = []; ss.forEach(function (s) { all = all.concat(s.v); });
      var mn = o.min != null ? o.min : Math.min.apply(null, all), mxv = o.max != null ? o.max : Math.max.apply(null, all), rng = (mxv - mn) || 1, cols = ["accent", "a2", "a3", "good"], tipPts = [];
      if (o.axis !== false) { api.line(x, y + h, x + w, y + h, { c: "line", w: 2, k: seg(k, 0, 0.15) }); api.line(x, y, x, y + h, { c: "line", w: 2, k: seg(k, 0, 0.15) }); }
      ss.forEach(function (s, si) {
        var P = s.v.map(function (v, i) { return [x + w * i / Math.max(1, s.v.length - 1), y + h - (v - mn) / rng * h]; }), col = s.c || cols[si % cols.length];
        var kk = seg(k, 0.12, 1); api.stroke(P, { c: col, w: o.w || 4, k: kk, glow: o.glow, pen: true });
        if (o.area && kk > 0) { var Q = cutPts(P, kk); c.save(); var gr = c.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, api.rgba(col, 0.35)); gr.addColorStop(1, api.rgba(col, 0)); c.fillStyle = gr; c.beginPath(); c.moveTo(Q[0][0], y + h); Q.forEach(function (p) { c.lineTo(p[0], p[1]); }); c.lineTo(Q[Q.length - 1][0], y + h); c.closePath(); c.fill(); c.restore(); }
        if (o.dots) P.forEach(function (p, i) { api.dot(p[0], p[1], 4, { c: col, k: seg(kk, i / P.length, i / P.length + 0.08) }); });
        if (s.label && kk > 0.9) api.text(s.label, P[P.length - 1][0] - 6, P[P.length - 1][1] - 16, { size: 13, c: col, align: "right" });
        tipPts.push(P);
      });
      return tipPts;
    };
    api.donut = function (data, cx, cy, r, o) {
      o = o || {}; var k = o.k == null ? 1 : o.k, tot = 0, cols = ["accent", "a2", "a3", "good", "warn", "bad"]; data.forEach(function (d) { tot += (typeof d === "number" ? d : d.v); });
      var a = -Math.PI / 2, th = o.th || r * 0.34, goal = TAU * ease(k), used = 0;
      data.forEach(function (d, i) { var v = typeof d === "number" ? d : d.v, span = v / tot * TAU, take = clamp(goal - used, 0, span); used += span; if (take > 0.001) api.arc(cx, cy, r - th / 2, a, a + take - 0.012, { c: (d && d.c) || cols[i % cols.length], w: th, k: 1, rough: 0 }); a += span; });
      return { cx: cx, cy: cy };
    };
    api.progress = function (x, y, w, h, v, o) { o = o || {}; var k = o.k == null ? 1 : o.k; api.rect(x, y, w, h, { c: "line", w: 0, fill: "panel", r: h / 2 }); var ww = Math.max(h, w * clamp(v) * ease(k)); if (k > 0) api.rect(x, y, ww, h, { c: o.c || "accent", w: 0, fill: o.c || "accent", r: h / 2 }); };
    api.timeline = function (items, x, y, w, o) {
      o = o || {}; var k = o.k == null ? 1 : o.k, n = items.length, vert = !!o.vert, len = o.len || (vert ? 360 : w);
      if (vert) api.line(x, y, x, y + len, { c: "line", w: 3, k: seg(k, 0, 0.3) }); else api.line(x, y, x + w, y, { c: "line", w: 3, k: seg(k, 0, 0.3) });
      for (var i = 0; i < n; i++) {
        var it = typeof items[i] === "string" ? { t: items[i] } : items[i], u = n === 1 ? 0.5 : i / (n - 1), kk = seg(k, 0.1 + i * 0.12, 0.1 + i * 0.12 + 0.35), up = i % 2 === 0;
        var px = vert ? x : x + w * (0.05 + u * 0.9), py = vert ? y + len * (0.05 + u * 0.9) : y;
        api.dot(px, py, 7, { c: it.c || "accent", k: kk, back: true });
        if (vert) { api.text(it.t, px + 18, py - (it.s ? 10 : 0), { size: 17, align: "left", c: "fg", k: kk, maxw: w - 30 }); if (it.s) api.text(it.s, px + 18, py + 12, { size: 13, align: "left", c: "dim", k: kk, maxw: w - 30 }); }
        else { var ty = py + (up ? -34 : 34); api.line(px, py, px, ty + (up ? 14 : -14), { c: "line", w: 2, k: kk }); api.text(it.t, px, ty, { size: 16, c: "fg", k: kk, maxw: w / n * 1.4 }); if (it.s) api.text(it.s, px, ty + (up ? -20 : 20), { size: 12, c: "dim", k: kk, maxw: w / n * 1.4 }); }
      }
    };

    // ---- compare, lens, clip ---------------------------------------------------------------------------
    api.clipRect = function (x, y, w, h, fn) { c.save(); c.beginPath(); c.rect(x, y, Math.max(0, w), Math.max(0, h)); c.clip(); fn(); c.restore(); };
    api.clipCircle = function (x, y, r, fn) { c.save(); c.beginPath(); c.arc(x, y, Math.max(0, r), 0, TAU); c.clip(); fn(); c.restore(); };
    api.compare = function (k, before, after, o) {
      o = o || {}; var vert = !!o.vert, pos = lerp(0.04, 0.96, ease(k)), edge = (vert ? H : W) * pos;
      before(); c.save(); c.beginPath(); if (vert) c.rect(0, 0, W, edge); else c.rect(0, 0, edge, H); c.clip(); c.fillStyle = C("ink"); if (o.opaque !== false) c.fillRect(0, 0, W, H); after(); c.restore();
      c.save(); c.strokeStyle = C("fg"); c.lineWidth = 3; c.beginPath(); if (vert) { c.moveTo(0, edge); c.lineTo(W, edge); } else { c.moveTo(edge, 0); c.lineTo(edge, H); } c.stroke();
      var gx = vert ? W / 2 : edge, gy = vert ? edge : H / 2; c.fillStyle = C("fg"); c.beginPath(); c.arc(gx, gy, 14, 0, TAU); c.fill(); c.fillStyle = C("ink"); c.font = "700 14px system-ui"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(vert ? "↕" : "↔", gx, gy + 1); c.restore();
      if (o.labels) { api.label(o.labels[1], vert ? W / 2 : Math.max(52, edge / 2), vert ? Math.max(30, edge / 2) : 40, { size: 14 }); api.label(o.labels[0], vert ? W / 2 : Math.min(W - 52, (edge + W) / 2), vert ? Math.min(H - 30, (edge + H) / 2) : 40, { size: 14 }); }
    };
    api.lens = function (x, y, r, zoom, fn, o) {
      o = o || {}; var k = o.k == null ? 1 : o.k; if (k <= 0) return; var rr = r * eout(k), z = lerp(1, zoom, ease(seg(k, 0.2, 1)));
      c.save(); c.beginPath(); c.arc(x, y, rr, 0, TAU); c.clip(); c.fillStyle = C("ink"); c.fillRect(x - rr, y - rr, rr * 2, rr * 2);
      c.translate(x, y); c.scale(z, z); c.translate(-(o.fx == null ? x : o.fx), -(o.fy == null ? y : o.fy)); fn(); c.restore();
      c.save(); c.strokeStyle = C(o.c || "fg"); c.lineWidth = o.w || 5; c.beginPath(); c.arc(x, y, rr, 0, TAU); c.stroke();
      if (o.handle !== false) { var a = o.ha == null ? 0.78 : o.ha; c.lineWidth = 9; c.lineCap = "round"; c.beginPath(); c.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); c.lineTo(x + Math.cos(a) * (rr + 34), y + Math.sin(a) * (rr + 34)); c.stroke(); } c.restore();
    };

    // ---- particles (stateless) -------------------------------------------------------------------------
    api.swarm = function (n, t, o) {
      o = o || {}; var cx = o.cx == null ? W / 2 : o.cx, cy = o.cy == null ? H / 2 : o.cy, rx = o.rx == null ? W * 0.4 : o.rx, ry = o.ry == null ? rx : o.ry, mode = o.mode || "drift", sd = (o.seed || 0) * 17.3, sp = o.speed == null ? 1 : o.speed, k = o.k == null ? 1 : o.k, cols = o.colors || [o.c || "a2"];
      c.save(); var gl = o.glow; if (gl) c.shadowBlur = gl;
      for (var i = 0; i < n; i++) {
        var r1 = hash(i + sd), r2 = hash(i * 1.7 + 9 + sd), r3 = hash(i * 2.3 + 4 + sd), x, y, a = 1, sz = (o.size || 3) * (0.5 + r3);
        if (mode === "drift") { x = cx + (r1 - 0.5) * 2 * rx + (noise(t * 0.5 * sp + i * 3.1) - 0.5) * 60; y = cy + (r2 - 0.5) * 2 * ry + (noise(t * 0.5 * sp + i * 5.3 + 40) - 0.5) * 60; }
        else if (mode === "rise" || mode === "fall") { var u = (t * sp * (0.05 + r3 * 0.12) + r1) % 1; x = cx + (r2 - 0.5) * 2 * rx + Math.sin(t + i) * 10; y = mode === "rise" ? cy + ry - u * ry * 2 : cy - ry + u * ry * 2; a = Math.sin(u * Math.PI); }
        else if (mode === "orbit") { var ang = t * sp * (0.4 + r1 * 0.9) * (i % 2 ? 1 : -1) + r2 * TAU, rr = 0.25 + r3 * 0.75; x = cx + Math.cos(ang) * rx * rr; y = cy + Math.sin(ang) * ry * rr; }
        else if (mode === "burst") { var life = clamp(k), ang2 = r1 * TAU, d = eout(life) * (0.3 + r2 * 0.7); x = cx + Math.cos(ang2) * rx * d; y = cy + Math.sin(ang2) * ry * d; a = 1 - life; }
        else if (mode === "flock") { var f = t * sp * 0.5 + r1 * 6; x = cx + Math.sin(f * 1.3 + i) * rx * (0.4 + r2 * 0.6); y = cy + Math.cos(f * 0.9 + i * 0.7) * ry * (0.4 + r3 * 0.6); }
        else if (mode === "suck") { var uu = (t * sp * 0.25 + r1) % 1, a3 = r2 * TAU + uu * 3; x = cx + Math.cos(a3) * rx * (1 - uu); y = cy + Math.sin(a3) * ry * (1 - uu); a = Math.sin(uu * Math.PI); }
        c.globalAlpha = (o.a == null ? 1 : o.a) * a; var col = C(cols[i % cols.length]); c.fillStyle = col; if (gl) c.shadowColor = col; c.beginPath(); c.arc(x, y, sz, 0, TAU); c.fill();
      }
      c.restore();
    };
    api.along = function (pts, n, t, o) {
      o = o || {}; var L = polyLen(pts), cum = [0]; for (var i = 0; i < pts.length - 1; i++) cum.push(cum[i] + Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]));
      var at = function (u) { var d = u * L, j = 1; while (j < cum.length - 1 && cum[j] < d) j++; var s = cum[j] - cum[j - 1] || 1, f = (d - cum[j - 1]) / s; return [lerp(pts[j - 1][0], pts[j][0], f), lerp(pts[j - 1][1], pts[j][1], f)]; };
      for (var q = 0; q < n; q++) { var u = (t * (o.speed || 0.3) + q / n) % 1, p = at(u); api.dot(p[0], p[1], o.r || 4, { c: o.c || "accent", a: (o.fade === false ? 1 : Math.sin(u * Math.PI)) * (o.a == null ? 1 : o.a), glow: o.glow }); }
      return at;
    };
    api.stars = function (n, t, o) { o = o || {}; for (var i = 0; i < n; i++) { var d = 0.15 + hash(i * 3.3) * 0.85; api.layer(d * (o.par == null ? 0.6 : o.par), function () { var x = hash(i) * W * 1.4 - W * 0.2, y = hash(i + 55) * H * 1.4 - H * 0.2; c.globalAlpha = 0.35 + 0.65 * hash(i + 9) * (0.6 + 0.4 * Math.sin(t * 2 + i)); c.fillStyle = C(o.c || "fg"); c.beginPath(); c.arc(x, y, 0.6 + d * 1.5, 0, TAU); c.fill(); c.globalAlpha = 1; }); } };

    // ---- 3D (small software renderer) -----------------------------------------------------------------
    var d3 = api.d3 = {};
    d3.cam = function (o) {
      o = o || {}; var yaw = o.yaw || 0, pitch = o.pitch == null ? 0.35 : o.pitch, dist = o.dist || 4, sc = o.scale || Math.min(W, H) * 0.42, cx = o.cx == null ? W / 2 : o.cx, cy = o.cy == null ? H / 2 : o.cy, cyw = Math.cos(yaw), syw = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      var P = function (x, y, z) { var X = x * cyw + z * syw, Z = -x * syw + z * cyw, Y = y * cp - Z * sp, Z2 = y * sp + Z * cp, f = dist / (dist - Z2); return [cx + X * f * sc, cy - Y * f * sc, Z2, f]; };
      P.yaw = yaw; return P;
    };
    d3.xf = function (m, o) {
      o = o || {}; var cx = Math.cos(o.rx || 0), sx = Math.sin(o.rx || 0), cy = Math.cos(o.ry || 0), sy = Math.sin(o.ry || 0), cz = Math.cos(o.rz || 0), sz = Math.sin(o.rz || 0), s = o.s == null ? 1 : o.s;
      return { v: m.v.map(function (p) { var x = p[0] * s, y = p[1] * s, z = p[2] * s, y1 = y * cx - z * sx, z1 = y * sx + z * cx, x2 = x * cy + z1 * sy, z2 = -x * sy + z1 * cy, x3 = x2 * cz - y1 * sz, y3 = x2 * sz + y1 * cz; return [x3 + (o.x || 0), y3 + (o.y || 0), z2 + (o.z || 0)]; }), e: m.e, f: m.f };
    };
    d3.box = function (w, h, dd) { w = (w || 1) / 2; h = (h == null ? w * 2 : h) / 2; dd = (dd == null ? w * 2 : dd) / 2; var v = [[-w, -h, -dd], [w, -h, -dd], [w, h, -dd], [-w, h, -dd], [-w, -h, dd], [w, -h, dd], [w, h, dd], [-w, h, dd]]; return { v: v, e: [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]], f: [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [2, 3, 7, 6], [1, 2, 6, 5], [0, 4, 7, 3]] }; };
    d3.sphere = function (r, n) { r = r || 1; n = n || 12; var v = [], e = [], f = [], m = n * 2; for (var i = 0; i <= n; i++) for (var j = 0; j < m; j++) { var a = Math.PI * i / n, b = TAU * j / m; v.push([r * Math.sin(a) * Math.cos(b), r * Math.cos(a), r * Math.sin(a) * Math.sin(b)]); } for (var i2 = 0; i2 < n; i2++) for (var j2 = 0; j2 < m; j2++) { var p = i2 * m + j2, q = i2 * m + (j2 + 1) % m, p2 = (i2 + 1) * m + j2, q2 = (i2 + 1) * m + (j2 + 1) % m; e.push([p, q], [p, p2]); f.push([p, p2, q2, q]); } return { v: v, e: e, f: f }; };
    d3.torus = function (R, r, n, m) { R = R || 1; r = r || 0.35; n = n || 24; m = m || 12; var v = [], e = [], f = []; for (var i = 0; i < n; i++) for (var j = 0; j < m; j++) { var a = TAU * i / n, b = TAU * j / m; v.push([(R + r * Math.cos(b)) * Math.cos(a), r * Math.sin(b), (R + r * Math.cos(b)) * Math.sin(a)]); } for (var i2 = 0; i2 < n; i2++) for (var j2 = 0; j2 < m; j2++) { var p = i2 * m + j2, q = ((i2 + 1) % n) * m + j2, p2 = i2 * m + (j2 + 1) % m, q2 = ((i2 + 1) % n) * m + (j2 + 1) % m; e.push([p, q], [p, p2]); f.push([p, q, q2, p2]); } return { v: v, e: e, f: f }; };
    d3.cyl = function (r, h, n) { r = r || 0.6; h = h || 1.6; n = n || 20; var v = [], e = [], f = [], top = []; for (var i = 0; i < n; i++) { var a = TAU * i / n; v.push([r * Math.cos(a), -h / 2, r * Math.sin(a)]); v.push([r * Math.cos(a), h / 2, r * Math.sin(a)]); } for (var j = 0; j < n; j++) { var a0 = 2 * j, a1 = 2 * ((j + 1) % n); e.push([a0, a1], [a0 + 1, a1 + 1], [a0, a0 + 1]); f.push([a0, a1, a1 + 1, a0 + 1]); } return { v: v, e: e, f: f }; };
    d3.cone = function (r, h, n) { r = r || 0.7; h = h || 1.6; n = n || 20; var v = [[0, h / 2, 0]], e = [], f = []; for (var i = 0; i < n; i++) { var a = TAU * i / n; v.push([r * Math.cos(a), -h / 2, r * Math.sin(a)]); } for (var j = 1; j <= n; j++) { var q = j % n + 1; e.push([0, j], [j, q]); f.push([0, j, q]); } return { v: v, e: e, f: f }; };
    d3.helix = function (r, h, turns, n) { r = r || 0.5; h = h || 2; turns = turns || 3; n = n || 90; var v = [], e = []; for (var i = 0; i < n; i++) { var u = i / (n - 1), a = u * turns * TAU; v.push([r * Math.cos(a), (u - 0.5) * h, r * Math.sin(a)]); if (i) e.push([i - 1, i]); } return { v: v, e: e, f: [] }; };
    d3.plane = function (w, n) { w = w || 3; n = n || 8; var v = [], e = []; for (var i = 0; i <= n; i++) { var u = (i / n - 0.5) * w; v.push([u, 0, -w / 2], [u, 0, w / 2], [-w / 2, 0, u], [w / 2, 0, u]); var b = i * 4; e.push([b, b + 1], [b + 2, b + 3]); } return { v: v, e: e, f: [] }; };
    d3.wire = function (m, P, o) { o = o || {}; var pts = m.v.map(function (p) { return P(p[0], p[1], p[2]); }), col = C(o.c || "a2"), lw = o.w || 2; c.save(); c.strokeStyle = col; c.lineWidth = lw; c.lineCap = "round"; c.globalAlpha *= o.a == null ? 1 : o.a; if (o.glow) { c.shadowColor = col; c.shadowBlur = o.glow; } var k = o.k == null ? 1 : o.k, lim = Math.floor(m.e.length * k); c.beginPath(); for (var i = 0; i < lim; i++) { var a = pts[m.e[i][0]], b = pts[m.e[i][1]]; c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); } c.stroke(); c.restore(); };
    d3.solid = function (m, P, o) {
      o = o || {}; var pts = m.v.map(function (p) { return P(p[0], p[1], p[2]); }), L = o.light || [0.4, 0.8, 0.5], ln = Math.hypot(L[0], L[1], L[2]), col = C(o.c || "a3"), items = [];
      m.f.forEach(function (f) { var A = m.v[f[0]], B = m.v[f[1]], Cc = m.v[f[2]], ux = B[0] - A[0], uy = B[1] - A[1], uz = B[2] - A[2], vx = Cc[0] - A[0], vy = Cc[1] - A[1], vz = Cc[2] - A[2], nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, nl = Math.hypot(nx, ny, nz) || 1, d = (nx * L[0] + ny * L[1] + nz * L[2]) / (nl * ln); var z = 0; f.forEach(function (i) { z += pts[i][2]; }); items.push({ f: f, z: z / f.length, d: Math.abs(d) }); });
      items.sort(function (a, b) { return a.z - b.z; });
      c.save(); c.globalAlpha *= o.a == null ? 1 : o.a; c.lineJoin = "round";
      items.forEach(function (it) { var sh = 0.35 + 0.65 * it.d; c.fillStyle = shade(col, sh); c.strokeStyle = o.edge ? C(o.edge) : shade(col, sh * 0.8); c.lineWidth = o.edge ? 1.5 : 1; c.beginPath(); it.f.forEach(function (i, q) { q ? c.lineTo(pts[i][0], pts[i][1]) : c.moveTo(pts[i][0], pts[i][1]); }); c.closePath(); c.fill(); c.stroke(); });
      c.restore();
    };
    function shade(col, k) { var m = /^#([0-9a-f]{6})$/i.exec(col); if (!m) return col; var n = parseInt(m[1], 16), r = Math.round((n >> 16) * k), g2 = Math.round(((n >> 8) & 255) * k), b = Math.round((n & 255) * k); return "rgb(" + r + "," + g2 + "," + b + ")"; }
    d3.dot = function (p, P, r, o) { var q = P(p[0], p[1], p[2]); api.dot(q[0], q[1], (r || 5) * q[3], o); return q; };
    d3.line = function (a, b, P, o) { var p = P(a[0], a[1], a[2]), q = P(b[0], b[1], b[2]); api.line(p[0], p[1], q[0], q[1], o); };
    d3.text = function (str, p, P, o) { var q = P(p[0], p[1], p[2]); return api.text(str, q[0], q[1], o); };

    // ---- maps -------------------------------------------------------------------------------------------
    var geo = api.geo = {};
    function countries() { return (g.__GEO && g.__GEO.c) || {}; }
    geo.proj = function (o) {
      o = o || {}; var type = o.type || "equi", lon0 = (o.lon || 0) * Math.PI / 180, lat0 = (o.lat || 0) * Math.PI / 180, cx = o.cx == null ? W / 2 : o.cx, cy = o.cy == null ? H / 2 : o.cy, r = o.r || Math.min(W, H) * 0.45, zoom = o.zoom || 1;
      var f = function (lon, lat) {
        var l = lon * Math.PI / 180, p = lat * Math.PI / 180;
        if (type === "ortho") { var cc = Math.sin(lat0) * Math.sin(p) + Math.cos(lat0) * Math.cos(p) * Math.cos(l - lon0), x = Math.cos(p) * Math.sin(l - lon0), y = Math.cos(lat0) * Math.sin(p) - Math.sin(lat0) * Math.cos(p) * Math.cos(l - lon0); var X = x, Y = y; if (cc < 0) { var m = Math.hypot(x, y) || 1; X = x / m; Y = y / m; } return [cx + X * r * zoom, cy - Y * r * zoom, cc >= 0]; }
        var dl = l - lon0; while (dl > Math.PI) dl -= TAU; while (dl < -Math.PI) dl += TAU; return [cx + dl / Math.PI * r * zoom * (o.xs || 1.0), cy - (p - lat0) / (Math.PI / 2) * r * 0.5 * zoom * (o.xs || 1.0) * 1.0, true];
      };
      f.type = type; f.cx = cx; f.cy = cy; f.r = r * zoom; return f;
    };
    geo.land = function (P, o) {
      o = o || {}; var cs = countries(), want = o.only ? (Array.isArray(o.only) ? o.only : [o.only]) : null, k = o.k == null ? 1 : o.k;
      c.save(); if (P.type === "ortho") { c.beginPath(); c.arc(P.cx, P.cy, P.r, 0, TAU); c.clip(); if (o.sea !== false) { c.fillStyle = C(o.seac || "panel"); c.fill(); } }
      for (var code in cs) { var hit = want && want.indexOf(code) >= 0; if (want && !hit && !o.dim) continue; c.beginPath(); cs[code].forEach(function (ring) { for (var i = 0; i < ring.length; i += 2) { var p = P(ring[i], ring[i + 1]); i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); } c.closePath(); }); c.globalAlpha = (hit || !want ? 1 : 0.5) * k; c.fillStyle = C(hit ? (o.hit || "accent") : (o.c || "line")); c.fill(); if (o.edge !== false) { c.strokeStyle = C(o.edgec || "ink"); c.lineWidth = o.ew || 0.6; c.stroke(); } }
      c.restore(); if (P.type === "ortho" && o.rim !== false) api.circle(P.cx, P.cy, P.r, { c: o.rimc || "line", w: 2, rough: 0 });
    };
    geo.pin = function (lon, lat, P, o) { var p = P(lon, lat); if (!p[2]) return null; api.dot(p[0], p[1], (o && o.r) || 5, Object.assign({ c: "accent" }, o || {})); return p; };
    geo.route = function (lon1, lat1, lon2, lat2, P, o) {
      o = o || {}; var a = [lon1 * Math.PI / 180, lat1 * Math.PI / 180], b = [lon2 * Math.PI / 180, lat2 * Math.PI / 180], d = Math.acos(clamp(Math.sin(a[1]) * Math.sin(b[1]) + Math.cos(a[1]) * Math.cos(b[1]) * Math.cos(a[0] - b[0]), -1, 1)) || 1e-6, pts = [], n = 48;
      for (var i = 0; i <= n; i++) { var f = i / n, A = Math.sin((1 - f) * d) / Math.sin(d), B = Math.sin(f * d) / Math.sin(d), x = A * Math.cos(a[1]) * Math.cos(a[0]) + B * Math.cos(b[1]) * Math.cos(b[0]), y = A * Math.cos(a[1]) * Math.sin(a[0]) + B * Math.cos(b[1]) * Math.sin(b[0]), z = A * Math.sin(a[1]) + B * Math.sin(b[1]), p = P(Math.atan2(y, x) * 180 / Math.PI, Math.atan2(z, Math.hypot(x, y)) * 180 / Math.PI); if (p[2]) pts.push([p[0], p[1] - (o.lift || 0) * Math.sin(f * Math.PI)]); }
      stroke(pts, Object.assign({ c: "accent", w: 3 }, o));
    };
    geo.grat = function (P, o) { o = o || {}; for (var lat = -60; lat <= 60; lat += 30) { var pts = []; for (var lon = -180; lon <= 180; lon += 10) { var p = P(lon, lat); if (p[2]) pts.push([p[0], p[1]]); else if (pts.length > 1) { stroke(pts, { c: "line", w: 1, a: 0.6 }); pts = []; } } if (pts.length > 1) stroke(pts, { c: "line", w: 1, a: 0.6 }); } for (var lon2 = -180; lon2 < 180; lon2 += 30) { var q = []; for (var lat2 = -85; lat2 <= 85; lat2 += 5) { var pp = P(lon2, lat2); if (pp[2]) q.push([pp[0], pp[1]]); else if (q.length > 1) { stroke(q, { c: "line", w: 1, a: 0.6 }); q = []; } } if (q.length > 1) stroke(q, { c: "line", w: 1, a: 0.6 }); } };
    geo.codes = function () { return Object.keys(countries()); };

    api.helpers = null;
    // morph / points (kept from the spike): same-length point lists blend into each other
    api.pts = {
      circle: function (n, r) { return Array.from({ length: n }, function (_, i) { return [Math.cos(i / n * TAU) * r, Math.sin(i / n * TAU) * r]; }); },
      wave: function (n, w, amp, ph) { return Array.from({ length: n }, function (_, i) { return [(i / (n - 1) - 0.5) * w, Math.sin(i / (n - 1) * TAU * 2 + (ph || 0)) * amp]; }); },
      poly: function (n, sides, r) { return Array.from({ length: n }, function (_, i) { var a = i / n * TAU, s = TAU / sides, m = (a % s) / s, k = Math.cos(Math.PI / sides) / Math.cos((m - 0.5) * s); return [Math.cos(a) * r * k, Math.sin(a) * r * k]; }); },
      star: function (n, spikes, r, inner) { return Array.from({ length: n }, function (_, i) { var a = i / n * TAU - Math.PI / 2, s = TAU / spikes, m = (a + Math.PI / 2) % s / s, k = m < 0.5 ? lerp(1, inner || 0.45, m * 2) : lerp(inner || 0.45, 1, (m - 0.5) * 2); return [Math.cos(a) * r * k, Math.sin(a) * r * k]; }); },
      from: function (pts, n) { var cum = [0]; for (var i = 0; i < pts.length - 1; i++) cum.push(cum[i] + Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1])); var L = cum[cum.length - 1] || 1; return Array.from({ length: n }, function (_, q) { var d = q / (n - 1) * L, j = 1; while (j < cum.length - 1 && cum[j] < d) j++; var s = cum[j] - cum[j - 1] || 1, f = (d - cum[j - 1]) / s; return [lerp(pts[j - 1][0], pts[j][0], f), lerp(pts[j - 1][1], pts[j][1], f)]; }); }
    };
    api.morph = function (a, b, k) { return a.map(function (p, i) { return [p[0] + (b[i % b.length][0] - p[0]) * k, p[1] + (b[i % b.length][1] - p[1]) * k]; }); };
    api.move = function (pts, x, y, s, rot) { var cr = Math.cos(rot || 0), sr = Math.sin(rot || 0); s = s == null ? 1 : s; return pts.map(function (p) { return [x + (p[0] * cr - p[1] * sr) * s, y + (p[0] * sr + p[1] * cr) * s]; }); };
    api.smooth = function (pts, close) {
      var n = pts.length, out = []; if (n < 3) return pts;
      var M = function (i) { return [(pts[i % n][0] + pts[(i + 1) % n][0]) / 2, (pts[i % n][1] + pts[(i + 1) % n][1]) / 2]; };
      var start = close ? M(n - 1) : pts[0]; out.push(start);
      for (var i = close ? 0 : 1; i < (close ? n : n - 1); i++) { var e = close || i < n - 2 ? M(i) : pts[n - 1], p = out[out.length - 1]; for (var s = 1; s <= 8; s++) { var u = s / 8, v = 1 - u; out.push([v * v * p[0] + 2 * v * u * pts[i][0] + u * u * e[0], v * v * p[1] + 2 * v * u * pts[i][1] + u * u * e[1]]); } }
      return out;
    };
    api.blob = function (pts, o) { o = o || {}; stroke(api.smooth(pts, true), o, true); };

    api.theme(null);
    return api;
  }
  g.makeMotionKit = makeKit;
})(typeof window !== "undefined" ? window : globalThis);
