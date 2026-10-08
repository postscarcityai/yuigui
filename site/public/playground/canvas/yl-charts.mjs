// YUI-326: charts and stats on the living canvas. A `chart` (line, bar, area, scatter, pie, donut) or a `stat` answer becomes marks
// drawn on the same canvas clock as a film: axes first, then the line or bars grow in order, the stat number counts up, the spark draws.
// Every bar, point, slice and the stat itself is a hit target named by its value ('Wed: 178.5'), so tap, hold, drag-to-scrub and the
// keyboard model of YUI-321/324 work unchanged (each data point is one named hidden button, in order). A `choose` under the picture is
// drawn into it by yl-canvas.mjs (chooseBlock, passed in).
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const eout = (k) => 1 - Math.pow(1 - k, 3);
const SERIES = ["accent", "a2", "a3", "good", "warn", "bad"];
const TAU = Math.PI * 2;
const slug = (s) => String(s).trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 28);

const num = (v) => (typeof v === "number" && isFinite(v) ? v : Number(v));
// YUI-335: one formatter for every frame; toLocaleString built a new one on each call, the top cost of a chart frame on a phone
const nf2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
export const fmt = (v) => (isFinite(v) ? nf2.format(Number(v)) : String(v));
const decimals = (v) => { const s = String(v), i = s.indexOf("."); return i < 0 ? 0 : Math.min(3, s.length - i - 1); };
const withUnit = (v, unit) => (unit ? (unit.length <= 1 && !/[a-z]/i.test(unit) ? unit + fmt(v) : fmt(v) + " " + unit) : fmt(v));

// ---- reading -------------------------------------------------------------------------------------------------------------

// A parsed `chart` op as the picture needs it: series with values, labels, errors and a scale.
function readChart(o) {
  const p = o.props, type = String(p.type || "line");
  const xs = Array.isArray(p.x) ? p.x : null;
  const keys = Object.keys(p).filter((k) => /^y\d*$/.test(k)).sort((a, b) => (Number(a.slice(1)) || 1) - (Number(b.slice(1)) || 1));
  const names = Array.isArray(p.names) ? p.names.map(String) : [];
  const series = keys.map((k, i) => {
    const ys = (Array.isArray(p[k]) ? p[k] : [p[k]]).map(num);
    const ek = "err" + k.slice(1), er = Array.isArray(p[ek]) ? p[ek].map(num) : null;
    return { name: names[i] || "", ys, errs: ys.map((_, j) => (er ? er[er.length === 1 ? 0 : j] || 0 : 0)), tone: SERIES[i % SERIES.length] };
  }).filter((s) => s.ys.length);
  const n = Math.max(0, ...series.map((s) => s.ys.length));
  const labels = Array.from({ length: n }, (_, i) => (xs && xs[i] !== undefined ? xs[i] : i + 1));
  const numericX = type !== "bar" && type !== "pie" && type !== "donut" && !!xs && xs.length === n && xs.every((v) => typeof v === "number") && (type === "scatter" || type === "line" || type === "area");
  return { kind: "chart", id: o.id, type, title: String(p.title || ""), unit: String(p.unit || ""), xlabel: String(p.xlabel || ""), labels, series, n, numericX, stack: !!p.stack, min: p.min, max: p.max, note: p.note === undefined ? "" : String(p.note), noteAt: p.noteat === undefined ? -1 : labels.findIndex((l) => String(l) === String(p.noteat)) };
}

function readStat(o) {
  const p = o.props;
  return { kind: "stat", id: o.id, value: num(p.value), text: typeof p.value === "string" && !isFinite(Number(p.value)) ? p.value : null, unit: String(p.unit || ""), label: String(p.label || ""), delta: p.delta === undefined ? null : num(p.delta), spark: Array.isArray(p.spark) ? p.spark.map(num).filter(isFinite) : [], good: String(p.good || "up"), sub: String(p.sub || "") };
}

// ---- scales --------------------------------------------------------------------------------------------------------------

function niceScale(lo, hi, want) {
  if (!isFinite(lo) || !isFinite(hi)) { lo = 0; hi = 1; }
  if (lo === hi) { const d = Math.abs(lo) || 1; lo -= d / 2; hi += d / 2; }
  const span = hi - lo, raw = span / Math.max(1, want), mag = Math.pow(10, Math.floor(Math.log10(raw))), r = raw / mag;
  const step = (r <= 1 ? 1 : r <= 2 ? 2 : r <= 5 ? 5 : 10) * mag;
  const a = Math.floor(lo / step + 1e-9) * step, b = Math.ceil(hi / step - 1e-9) * step, ticks = [];
  for (let v = a; v <= b + step / 2; v += step) ticks.push(Math.abs(v) < step * 1e-9 ? 0 : Number(v.toPrecision(12)));
  return { lo: a, hi: b, ticks };
}

function yScale(c) {
  const stackTot = c.stack && c.type !== "line" && c.type !== "scatter" ? Array.from({ length: c.n }, (_, i) => c.series.reduce((a, s) => a + (s.ys[i] || 0), 0)) : null;
  const all = [];
  c.series.forEach((s) => s.ys.forEach((v, i) => { all.push(v + (s.errs[i] || 0)); all.push(v - (s.errs[i] || 0)); }));
  if (stackTot) all.push(...stackTot);
  let lo = Math.min(...all), hi = Math.max(...all);
  if (c.type === "bar" || c.type === "area") { lo = Math.min(0, lo); hi = Math.max(0, hi); }
  else { const pad = (hi - lo) * 0.12 || 1; lo -= pad; hi += pad; }
  if (isFinite(num(c.min))) lo = num(c.min);
  if (isFinite(num(c.max))) hi = num(c.max);
  return niceScale(lo, hi, 4);
}

// ---- marks (names and the words a touch says) ---------------------------------------------------------------------------

function chartMarks(c) {
  const out = [], multi = c.series.length > 1;
  if (c.type === "pie" || c.type === "donut") {
    const s = c.series[0], tot = s.ys.reduce((a, b) => a + Math.max(0, b), 0) || 1;
    s.ys.forEach((v, i) => {
      const pct = Math.round(100 * Math.max(0, v) / tot);
      out.push({ id: `chart:${c.id}:s0:${i}`, label: `${c.labels[i]}: ${withUnit(v, c.unit)}`, words: `${c.labels[i]} is ${pct}% of the ${withUnit(tot, c.unit)} total.${v === Math.max(...s.ys) ? " The biggest slice." : ""}`, fig: c.id, series: 0, index: i });
    });
    return out;
  }
  for (let i = 0; i < c.n; i++) c.series.forEach((s, si) => {
    if (s.ys[i] === undefined) return;
    const v = s.ys[i], x = c.labels[i], lead = multi ? (s.name || "Series " + (si + 1)) + " " : "";
    const bits = [];
    if (s.errs[i]) bits.push(`Give or take ${fmt(s.errs[i])}.`);
    if (i > 0 && s.ys[i - 1] !== undefined) {
      const d = v - s.ys[i - 1];
      bits.push(d === 0 ? `Same as ${c.labels[i - 1]}.` : `${d > 0 ? "Up" : "Down"} ${fmt(Math.abs(d))} from ${c.labels[i - 1]}.`);
    }
    if (v === Math.max(...s.ys)) bits.push("The highest.");
    else if (v === Math.min(...s.ys)) bits.push("The lowest.");
    out.push({ id: `chart:${c.id}:s${si}:${i}`, label: `${lead}${x}: ${withUnit(v, c.unit)}`, words: `${lead}${x} is ${withUnit(v, c.unit)}. ${bits.join(" ")}`.trim(), fig: c.id, series: si, index: i });
  });
  return out;
}

function statLabel(s) { return `${s.label || "Value"}: ${s.text !== null ? s.text : withUnit(s.value, s.unit)}`; }
function statMarks(s) {
  const out = [], now = s.text !== null ? s.text : withUnit(s.value, s.unit);
  const bits = [];
  if (s.delta !== null && s.delta !== 0) {
    const up = s.delta > 0, good = (s.good === "down") !== up;
    bits.push(`${up ? "Up" : "Down"} ${fmt(Math.abs(s.delta))}${s.unit && s.unit.length > 1 ? " " + s.unit : ""}${s.sub ? " " + s.sub : ""}, which is ${good ? "good" : "not what you want"}.`);
  } else if (s.sub) bits.push(s.sub + ".");
  out.push({ id: `stat:${s.id}`, label: statLabel(s), words: `${s.label || "This"} is ${now}. ${bits.join(" ")}`.trim(), fig: s.id });
  s.spark.forEach((v, i) => {
    const prev = i > 0 ? s.spark[i - 1] : null, n = s.spark.length;
    out.push({ id: `spark:${s.id}:${i}`, label: `${s.label || "Value"} ${i + 1} of ${n}: ${withUnit(v, s.unit)}`, words: `Reading ${i + 1} of ${n} is ${withUnit(v, s.unit)}.${prev === null ? "" : prev === v ? " No change." : ` ${v > prev ? "Up" : "Down"} ${fmt(Math.abs(v - prev))} from the one before.`}${i === n - 1 ? " The latest." : ""}`, fig: s.id, index: i });
  });
  return out;
}

// ---- timing --------------------------------------------------------------------------------------------------------------

const AXES = 0.9;      // seconds the axes take before the data starts
const STEP = 0.2;      // seconds per point or bar
function figDur(f) {
  if (f.kind === "stat") return 2.0;
  if (f.type === "pie" || f.type === "donut") return 0.7 + f.n * 0.4 + 0.4;
  return AXES + (f.type === "bar" ? f.n * 0.18 + 0.5 : f.n * STEP + 0.6);
}

// ---- drawing: stat -------------------------------------------------------------------------------------------------------

function drawStat(api, s, t, x, y, w, h, mk, marked) {
  const k0 = seg(t, 0, 0.4);
  if (k0 <= 0) return;
  const on = marked === mk[0].id;
  api.rect(x, y, w, h, { r: 20, c: on ? "warn" : "line", w: on ? 5 : 2.5, k: k0, fill: "panel", fa: 0.9, rough: 0 });
  const pad = 18, hasSpark = s.spark.length > 1, left = x + pad;
  if (s.label) api.text(s.label, left, y + pad + 4, { size: 15, c: "dim", weight: 700, align: "left", k: seg(t, 0.1, 0.5), free: true, noHit: true, maxw: w - pad * 2, base: "middle" });
  // the number counts up
  const kc = eout(seg(t, 0.2, 1.2)), dec = decimals(s.value);
  const shown = s.text !== null ? s.text : (s.unit && s.unit.length <= 1 && !/[a-z]/i.test(s.unit) ? s.unit : "") + (s.value * kc).toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const vy = y + pad + 4 + 26 + 18;
  const big = api.text(shown, left, vy, { size: 52, weight: 800, align: "left", k: seg(t, 0.15, 0.5), free: true, noHit: true, rise: 0 });
  if (s.unit && !(s.unit.length <= 1 && !/[a-z]/i.test(s.unit)) && s.text === null && big) api.text(s.unit.replace(/^deg/, "°"), big.x + big.w + 6, vy + 12, { size: 20, c: "dim", weight: 700, align: "left", k: seg(t, 0.4, 0.8), free: true, noHit: true });
  // the delta
  if (s.delta !== null) {
    const kd = seg(t, 1.2, 1.6), up = s.delta > 0, good = s.delta === 0 ? null : (s.good === "down") !== up;
    const col = good === null ? "dim" : good ? "good" : "bad";
    api.text(`${s.delta === 0 ? "–" : up ? "▲" : "▼"} ${fmt(Math.abs(s.delta))}${s.unit && s.unit.length > 1 ? " " + s.unit.replace(/^deg/, "°") : ""}`, left, y + h - pad - 6, { size: 18, c: col, weight: 800, align: "left", k: kd, free: true, noHit: true });
    if (s.sub) api.text(s.sub, left + 96, y + h - pad - 6, { size: 14, c: "dim", weight: 600, align: "left", k: kd, free: true, noHit: true, maxw: w * 0.35 });
  } else if (s.sub) api.text(s.sub, left, y + h - pad - 6, { size: 14, c: "dim", weight: 600, align: "left", k: seg(t, 1.2, 1.6), free: true, noHit: true });
  // the spark draws
  const hitsOut = [];
  if (hasSpark) {
    const sx0 = x + w * 0.6, sx1 = x + w - pad, sy0 = y + pad + 10, sy1 = y + h - pad - 6;
    const lo = Math.min(...s.spark), hi = Math.max(...s.spark), span = hi - lo || 1;
    const pts = s.spark.map((v, i) => [sx0 + (i / (s.spark.length - 1)) * (sx1 - sx0), sy1 - ((v - lo) / span) * (sy1 - sy0)]);
    const ks = seg(t, 0.8, 1.8), col = s.delta === null || s.delta === 0 ? "accent" : ((s.good === "down") !== (s.delta > 0) ? "good" : "bad");
    api.stroke(pts, { c: col, w: 3.5, k: ks, rough: 0 });
    const e = pts[pts.length - 1], sp = (sx1 - sx0) / (s.spark.length - 1);
    api.dot(e[0], e[1], 5, { c: col, a: seg(ks, 0.9, 1) });
    pts.forEach((p, i) => {
      const m = mk[i + 1], pk = i / (pts.length - 1) <= ks ? 1 : 0;
      if (marked === m.id) { api.dot(p[0], p[1], 11, { c: "warn", a: 0.55 }); api.dot(p[0], p[1], 5, { c: col }); }
      if (pk && (i === 0 ? ks > 0.02 : ks >= i / (pts.length - 1))) hitsOut.push({ id: m.id, x: p[0], y: p[1], r: clamp(sp / 2, 9, 18), label: m.label });
    });
  }
  if (t > 0.5) api.hit(mk[0].id, left + 60, y + h / 2 - (hasSpark ? 0 : 0), hasSpark ? 56 : Math.min(120, w / 3), mk[0].label);
  hitsOut.forEach((h0) => api.hit(h0.id, h0.x, h0.y, h0.r, h0.label));
}

// ---- drawing: cartesian chart --------------------------------------------------------------------------------------------

function drawCartesian(api, c, t, x, y, w, h, mk, marked) {
  const multi = c.series.length > 1, legendH = multi ? 22 : 0, titleH = c.title ? 30 : 4, xlabH = c.xlabel ? 18 : 0;
  const L = 44, R = 14, B = 26 + xlabH, top = y + titleH + legendH + 8;
  const px0 = x + L, px1 = x + w - R, py0 = top, py1 = y + h - B;
  if (py1 - py0 < 60) return;
  c.geo = { px0, px1, py0, py1, dy: api.dy || 0 };   // YUI-331: where the plot sits, so a moved bar's column can slide
  const sc = yScale(c);
  const Y = (v) => py1 - ((v - sc.lo) / (sc.hi - sc.lo)) * (py1 - py0);
  let xmin = 0, xmax = 1;
  if (c.numericX) { xmin = Math.min(...c.labels); xmax = Math.max(...c.labels); if (xmin === xmax) { xmin -= 1; xmax += 1; } const pad = (xmax - xmin) * 0.06; xmin -= pad; xmax += pad; }
  const X = (i) => (c.numericX ? px0 + ((c.labels[i] - xmin) / (xmax - xmin)) * (px1 - px0) : px0 + ((i + 0.5) / c.n) * (px1 - px0));
  if (c.title) api.text(c.title, x + w / 2, y + 12, { size: 20, weight: 800, k: seg(t, 0, 0.4), maxw: w - 20 });
  if (multi) {
    let lx = px0;
    c.series.forEach((s, i) => { const nm = s.name || "Series " + (i + 1), m = api.measure(nm, { size: 13, weight: 700 }); api.dot(lx + 5, y + titleH + 12, 5, { c: s.tone, a: seg(t, 0.3, 0.7) }); api.text(nm, lx + 14, y + titleH + 12, { size: 13, c: "dim", weight: 700, align: "left", k: seg(t, 0.3, 0.7), free: true, noHit: true }); lx += m.w + 34; });
  }
  // axes first: the left and bottom lines draw, the gridlines and tick labels come in
  const ka = seg(t, 0.2, 0.9);
  api.line(px0, py1, px0 + (px1 - px0) * ka, py1, { c: "dim", w: 2.5, rough: 0 });
  api.line(px0, py1, px0, py1 - (py1 - py0) * ka, { c: "dim", w: 2.5, rough: 0 });
  sc.ticks.forEach((v) => {
    const yy = Y(v), kt = seg(t, 0.4, 0.9);
    if (v !== sc.lo) api.line(px0, yy, px1, yy, { c: "line", w: 1.5, a: 0.8 * kt, rough: 0 });
    api.text(fmt(v), px0 - 8, yy, { size: 12, c: "dim", weight: 600, align: "right", k: kt, free: true, noHit: true });
  });
  const everyX = Math.max(1, Math.ceil(c.n / 8));
  if (c.numericX) {
    niceScale(xmin, xmax, 5).ticks.filter((v) => v >= xmin && v <= xmax).forEach((v) => api.text(fmt(v), px0 + ((v - xmin) / (xmax - xmin)) * (px1 - px0), py1 + 14, { size: 12, c: "dim", weight: 600, k: seg(t, 0.5, 0.9), free: true, noHit: true }));
  } else for (let i = 0; i < c.n; i += everyX) api.text(String(c.labels[i]), X(i), py1 + 14, { size: 12, c: "dim", weight: 600, k: seg(t, 0.5, 0.9), free: true, noHit: true, maxw: ((px1 - px0) / c.n) * everyX });
  if (c.xlabel) api.text(c.xlabel, (px0 + px1) / 2, py1 + 34, { size: 12, c: "dim", weight: 600, k: seg(t, 0.6, 1), free: true, noHit: true });
  // the data
  const d0 = AXES, byId = new Map(mk.map((m) => [m.id, m]));
  const baseY = Y(clamp(0, sc.lo, sc.hi));
  const slotW = (px1 - px0) / Math.max(1, c.n), groups = c.series.length, bw = Math.max(6, Math.min(54, (slotW * 0.72) / groups));
  const stacked = c.stack && c.type === "bar";
  const hitList = [];
  if (c.type === "bar") {
    for (let i = 0; i < c.n; i++) {
      let acc = 0;
      c.series.forEach((s, si) => {
        const v = s.ys[i]; if (v === undefined) return;
        const kb = eout(seg(t, d0 + i * 0.18, d0 + i * 0.18 + 0.5)); if (kb <= 0) return;
        const bx = stacked ? X(i) - bw / 2 : X(i) - (groups * bw) / 2 + si * bw + 1;
        const top0 = stacked ? Y(acc + v) : Y(v), bot = stacked ? Y(acc) : baseY;
        const hh = (bot - top0) * kb, yy = v >= 0 ? bot - hh : bot;
        const m = byId.get(`chart:${c.id}:s${si}:${i}`), on = marked === m.id;
        api.rect(bx, v >= 0 ? bot - hh : bot, bw - 2, Math.max(1, Math.abs(hh)), { c: s.tone, w: 2, fill: s.tone, fa: 0.75, r: 4, rough: 0 });
        if (on) api.rect(bx - 4, (v >= 0 ? bot - hh : bot) - 4, bw + 6, Math.abs(hh) + 8, { c: "warn", w: 5, r: 8, rough: 0 });
        if (s.errs[i] && kb > 0.9) { const cx = bx + (bw - 2) / 2; api.line(cx, Y(v - s.errs[i]), cx, Y(v + s.errs[i]), { c: "fg", w: 2, rough: 0 }); api.line(cx - 4, Y(v + s.errs[i]), cx + 4, Y(v + s.errs[i]), { c: "fg", w: 2, rough: 0 }); api.line(cx - 4, Y(v - s.errs[i]), cx + 4, Y(v - s.errs[i]), { c: "fg", w: 2, rough: 0 }); }
        if (c.n * groups <= 10 && kb > 0.85) api.text(fmt(v), bx + (bw - 2) / 2, top0 - 10, { size: 12, c: "fg", weight: 700, k: seg(kb, 0.85, 1), free: true, noHit: true });
        if (c.note && c.noteAt === i && si === 0 && kb > 0.95) {   // YUI-332: the agent's note on one bar, a leader up from the value to the words
          const ky = seg(t, d0 + i * 0.18 + 0.55, d0 + i * 0.18 + 1.05), nx = bx + (bw - 2) / 2, ny = py0 - 10;
          api.line(nx, top0 - 24, nx, ny + 8, { c: "warn", w: 2, k: ky, rough: 0 });
          api.text(c.note, Math.min(px1 + 6, nx + 40), ny, { size: 14, c: "warn", weight: 800, k: ky, free: true, noHit: true, align: "right", maxw: Math.min(220, px1 - px0) });
        }
        if (stacked) acc += v;
        if (kb > 0.5) hitList.push({ i, si, id: m.id, label: m.label, x: bx + (bw - 2) / 2, y: (top0 + bot) / 2, r: Math.max((bw - 2) / 2 + 8, Math.min(Math.abs(bot - top0) / 2, 90)) });
      });
    }
  } else {
    c.series.forEach((s, si) => {
      const pts = s.ys.map((v, i) => [X(i), Y(v)]);
      if (!pts.length) return;
      const total = c.n * STEP + 0.4, k = seg(t, d0, d0 + total);
      // cumulative length fraction of each point, so a dot lands as the pen reaches it
      let cum = [0], L0 = 0;
      for (let i = 1; i < pts.length; i++) { L0 += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); cum.push(L0); }
      const frac = cum.map((v) => (L0 ? v / L0 : 0));
      if (c.type === "scatter") { /* dots only, popping in order */ }
      else {
        if (c.type === "area" && k > 0) {
          const kk = Math.max(k, 0.0001), upto = pts.filter((_, i) => frac[i] <= kk);
          const last = upto[upto.length - 1] || pts[0];
          if (upto.length) api.stroke([...upto, [last[0], baseY], [upto[0][0], baseY]], { close: true, c: s.tone, w: 0, fill: s.tone, fa: 0.28, k: 1, a: 1, rough: 0 });
        }
        api.stroke(pts, { c: s.tone, w: 3.5, k, rough: 0 });
      }
      pts.forEach((p, i) => {
        const pk = c.type === "scatter" ? seg(t, d0 + i * STEP * 0.8, d0 + i * STEP * 0.8 + 0.3) : k > 0 ? seg(k, frac[i] - 0.08, frac[i]) : 0;
        if (pk <= 0) return;
        const m = byId.get(`chart:${c.id}:s${si}:${i}`), on = marked === m.id;
        if (s.errs[i]) { api.line(p[0], Y(s.ys[i] - s.errs[i]), p[0], Y(s.ys[i] + s.errs[i]), { c: s.tone, w: 2, a: pk, rough: 0 }); api.line(p[0] - 4, Y(s.ys[i] + s.errs[i]), p[0] + 4, Y(s.ys[i] + s.errs[i]), { c: s.tone, w: 2, a: pk, rough: 0 }); api.line(p[0] - 4, Y(s.ys[i] - s.errs[i]), p[0] + 4, Y(s.ys[i] - s.errs[i]), { c: s.tone, w: 2, a: pk, rough: 0 }); }
        if (c.n <= 24 || c.type === "scatter") api.dot(p[0], p[1], 5.5 * (0.5 + 0.5 * pk), { c: s.tone, a: pk });
        if (on) { api.dot(p[0], p[1], 12, { c: "warn", a: 0.55 }); api.dot(p[0], p[1], 6, { c: s.tone }); }
        if (c.n <= 8 && c.type !== "scatter" && pk > 0.9 && !multi) { const below = i > 0 && i < pts.length - 1 ? s.ys[i] < (s.ys[i - 1] + s.ys[i + 1]) / 2 : i > 0 ? s.ys[i] < s.ys[i - 1] : s.ys[i] < s.ys[i + 1]; api.text(fmt(s.ys[i]), p[0], p[1] + (below ? 18 : -16), { size: 12, c: "fg", weight: 700, k: seg(pk, 0.9, 1), free: true, noHit: true }); }
        if (pk > 0.5) hitList.push({ i, si, id: m.id, label: m.label, x: p[0], y: p[1], r: Math.max(16, Math.min(26, slotW / 2)) });
      });
    });
  }
  hitList.sort((a, b) => a.i - b.i || a.si - b.si).forEach((hh) => api.hit(hh.id, hh.x, hh.y, hh.r, hh.label));
}

// ---- drawing: pie and donut ----------------------------------------------------------------------------------------------

function wedge(cx, cy, r0, r1, a0, a1) {
  const n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 0.12)), pts = [];
  for (let i = 0; i <= n; i++) { const a = a0 + ((a1 - a0) * i) / n; pts.push([cx + Math.cos(a) * r1, cy + Math.sin(a) * r1]); }
  if (r0 > 0) for (let i = n; i >= 0; i--) { const a = a0 + ((a1 - a0) * i) / n; pts.push([cx + Math.cos(a) * r0, cy + Math.sin(a) * r0]); }
  else pts.push([cx, cy]);
  return pts;
}

function drawPie(api, c, t, x, y, w, h, mk, marked) {
  const s = c.series[0], tot = s.ys.reduce((a, b) => a + Math.max(0, b), 0) || 1, donut = c.type === "donut";
  const titleH = c.title ? 30 : 4;
  if (c.title) api.text(c.title, x + w / 2, y + 12, { size: 20, weight: 800, k: seg(t, 0, 0.4), maxw: w - 20 });
  const r = Math.max(30, Math.min(w / 2 - 92, (h - titleH) / 2 - 24)), cx = x + w / 2, cy = y + titleH + (h - titleH) / 2;
  // the ring first, then the slices sweep in order
  api.circle(cx, cy, r, { c: "line", w: 2, a: 0.8 * seg(t, 0.15, 0.6), rough: 0 });
  if (donut) api.circle(cx, cy, r * 0.58, { c: "line", w: 2, a: 0.8 * seg(t, 0.15, 0.6), rough: 0 });
  let a = -Math.PI / 2;
  const hl = [];
  s.ys.forEach((v, i) => {
    const sweep = (Math.max(0, v) / tot) * TAU, a0 = a, a1 = a + sweep * eout(seg(t, 0.7 + i * 0.4, 0.7 + i * 0.4 + 0.55));
    a += sweep;
    if (a1 - a0 < 0.002) return;
    const m = mk[i], on = marked === m.id, mid = a0 + sweep / 2, off = on ? 7 : 0, col = SERIES[i % SERIES.length];
    const ox = Math.cos(mid) * off, oy = Math.sin(mid) * off;
    api.stroke(wedge(cx + ox, cy + oy, donut ? r * 0.58 : 0, r, a0, a1), { close: true, c: on ? "warn" : "ink", w: on ? 5 : 2, fill: col, fa: 0.88, k: 1, rough: 0 });
    const kk = seg(t, 0.7 + i * 0.4 + 0.45, 0.7 + i * 0.4 + 0.8);
    if (sweep > 0.28) { const cs = Math.cos(mid); api.text(String(c.labels[i]), cx + cs * (r + 12) + (Math.abs(cs) < 0.3 ? 0 : cs > 0 ? 6 : -6), cy + Math.sin(mid) * (r + 16), { size: 13, c: "fg", weight: 700, k: kk, free: true, noHit: true, maxw: 100, align: Math.abs(cs) < 0.3 ? "center" : cs > 0 ? "left" : "right" }); }
    if (sweep > 0.28) api.text(`${Math.round((100 * v) / tot)}%`, cx + Math.cos(mid) * r * (donut ? 0.79 : 0.62), cy + Math.sin(mid) * r * (donut ? 0.79 : 0.62), { size: 14, c: "ink", weight: 800, k: kk, free: true, noHit: true });
    if (kk > 0.3) hl.push({ id: m.id, x: cx + Math.cos(mid) * r * (donut ? 0.79 : 0.6), y: cy + Math.sin(mid) * r * (donut ? 0.79 : 0.6), r: clamp(r * Math.sin(Math.min(sweep, Math.PI) / 2) * 0.6, 18, 60), label: m.label });
  });
  if (donut) {
    const kt = seg(t, 0.7 + s.ys.length * 0.4, 0.7 + s.ys.length * 0.4 + 0.5), cnt = eout(seg(t, 0.8, 0.8 + s.ys.length * 0.4));
    api.text(fmt(tot * cnt), cx, cy - 6, { size: 28, weight: 800, k: Math.max(kt, cnt > 0.02 ? 1 : 0), free: true, noHit: true });
    api.text(c.unit || "total", cx, cy + 16, { size: 13, c: "dim", weight: 700, k: Math.max(kt, cnt > 0.02 ? 1 : 0), free: true, noHit: true });
  }
  hl.forEach((q) => api.hit(q.id, q.x, q.y, q.r, q.label));
}

// ---- the film for the page -----------------------------------------------------------------------------------------------

// figs: parsed chart and stat ops in line order. host: { chooseBlock, HOLD } from yl-canvas.mjs.
export function chartFilm(ops, read0, host) {
  const figs = ops.map((o) => (o.preset === "stat" ? readStat(o) : readChart(o))).filter((f) => f.kind === "stat" ? f.text !== null || isFinite(f.value) : f.n > 0);
  if (!figs.length) return null;
  const starts = figs.map((_, i) => i * 1.4), durs = figs.map(figDur);
  const figEnd = Math.max(...figs.map((_, i) => starts[i] + durs[i]));
  const total = figEnd + (read0.choose ? 1.2 : 0) + host.HOLD;
  const marks = [];
  figs.forEach((f, i) => {
    f.marks = f.kind === "stat" ? statMarks(f) : chartMarks(f);
    if (f.kind === "chart" && f.title) marks.push({ id: "mark:text:" + slug(f.title), label: f.title, words: "What this chart is about.", appear: starts[i] });
    f.marks.forEach((m, j) => marks.push({ ...m, appear: starts[i] + (f.kind === "stat" ? 0.6 + j : AXES + (f.type === "pie" || f.type === "donut" ? -0.2 : 0) + (m.index || 0) * STEP) }));
  });
  const film = {
    kind: "chart", total, marks, choose: read0.choose, chosen: null, onShapes: false, says: read0.says, title: figs.find((f) => f.title)?.title || "", figs,
    // YUI-329: the height the figures want, so a mixed answer can give them a slot (a chart takes what it is given, 180 to 380)
    height(avail) {
      const fixed = figs.reduce((a, f) => a + (f.kind === "stat" ? (f.spark.length > 1 || f.delta !== null ? 132 : 104) : 0), 0) + 10 * (figs.length - 1), n = figs.filter((f) => f.kind === "chart").length;
      return fixed + (n ? Math.min(380, Math.max(180, (avail - fixed) / n)) * n : 0);
    },
    draw(t, api) {
      const W = api.w, H = api.h, top = 112, areaB = H - 196, fx = 14, fw = W - 28;
      const cH = film.choose ? host.chooseBlock(api, film, t, 0, 0, 0, W - 40, true) : 0;
      const avail = Math.max(160, areaB - top - cH - 4);
      const statH = (f) => (f.spark.length > 1 || f.delta !== null ? 132 : 104), gap = 10;
      const fixed = figs.reduce((a, f) => a + (f.kind === "stat" ? statH(f) : 0), 0) + gap * (figs.length - 1);
      const nCharts = figs.filter((f) => f.kind === "chart").length;
      const chartH = nCharts ? Math.min(380, Math.max(180, (avail - fixed) / nCharts)) : 0;
      const used = fixed + chartH * nCharts;
      let yy = top + Math.max(0, (avail - used) / 2);
      figs.forEach((f, i) => {
        const tt = t - starts[i], h = f.kind === "stat" ? statH(f) : chartH;
        if (tt >= 0) {
          if (f.kind === "stat") drawStat(api, f, tt, fx + 6, yy, fw - 12, h, f.marks, api.marked);
          else if (f.type === "pie" || f.type === "donut") drawPie(api, f, tt, fx, yy, fw, h, f.marks, api.marked);
          else drawCartesian(api, f, tt, fx, yy, fw, h, f.marks, api.marked);
        }
        yy += h + gap;
      });
      if (film.choose) host.chooseBlock(api, film, t, figEnd - 0.1, 20, areaB - cH, W - 40, false);
      film.says.slice(0, 1).forEach((s0) => api.say(s0, 0.3, Math.min(total - 0.5, 3.6), { y: "bottom", size: 20 }));
    },
  };
  return film;
}
