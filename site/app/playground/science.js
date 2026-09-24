"use client";

// Web renderers for the data and science presets: chart, stat, math, step,
// calc, and the sortable table with units. Charts are hand-drawn SVG and take
// their colors from the theme (--yl-c1..6 on .screen, stepped for light and
// dark), so they follow the per-agent look.
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import katex from "katex";
import { quantity } from "../../lib/yl/yl.mjs";
import { parseExpr, evalExpr, names as exprNames, splitFormula, toTeX } from "../../lib/yl/expr.mjs";

// The nodes on the current screen, so `chart data=<table>` can read a live
// table sent earlier in the reply (patch the table and the chart follows).
export const ScreenCtx = createContext({ nodes: [], tables: {} });

// ---------- units ----------

// ASCII units read the way a scientist writes them: m/s^2 -> m/s², degC ->
// °C, ohm -> Ω, * -> ·. Currency signs go in front of the number.
const SUP = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻" };
export function prettyUnit(u) {
  if (!u) return "";
  return String(u)
    .replace(/\^(-?\d+)/g, (_, n) => [...n].map((c) => SUP[c]).join(""))
    .replace(/degC\b/g, "°C").replace(/degF\b/g, "°F").replace(/\bdeg\b/g, "°")
    .replace(/\bohm\b/gi, "Ω").replace(/\bu(m|g|L|s|mol)\b/g, "µ$1").replace(/\*/g, "·");
}
const PREFIX = new Set(["$", "€", "£", "¥"]);
export function fmtNum(v, digits = 4) {
  if (typeof v !== "number" || !Number.isFinite(v)) return String(v ?? "");
  const a = Math.abs(v);
  if (a !== 0 && (a >= 1e6 || a < 1e-3)) {
    const [m, e] = v.toExponential(Math.max(0, digits - 1)).split("e");
    return `${m.replace(/\.?0+$/, "")}×10${[...String(Number(e))].map((c) => SUP[c]).join("")}`;
  }
  const s = a >= 1000 ? v.toLocaleString("en-US", { maximumFractionDigits: 2 }) : String(Number(v.toPrecision(digits)));
  return s;
}
export function withUnit(v, unit, digits) {
  const n = fmtNum(v, digits);
  if (!unit) return n;
  if (PREFIX.has(unit)) return n.startsWith("-") ? `-${unit}${n.slice(1)}` : `${unit}${n}`;
  const u = prettyUnit(unit);
  return /^[%°]/.test(u) && u !== "°C" && u !== "°F" ? `${n}${u}` : `${n} ${u}`;
}
// Display-only conversion, offered by tapping a unit. Events keep the original.
const CONV = {
  kg: ["lb", (x) => x * 2.20462], lb: ["kg", (x) => x / 2.20462],
  g: ["oz", (x) => x / 28.3495], oz: ["g", (x) => x * 28.3495],
  km: ["mi", (x) => x / 1.60934], mi: ["km", (x) => x * 1.60934],
  m: ["ft", (x) => x * 3.28084], ft: ["m", (x) => x / 3.28084],
  cm: ["in", (x) => x / 2.54], in: ["cm", (x) => x * 2.54],
  degC: ["degF", (x) => x * 9 / 5 + 32], degF: ["degC", (x) => (x - 32) * 5 / 9],
  L: ["gal", (x) => x / 3.78541], gal: ["L", (x) => x * 3.78541],
  kcal: ["kJ", (x) => x * 4.184], kJ: ["kcal", (x) => x / 4.184],
  "km/h": ["mph", (x) => x / 1.60934], mph: ["km/h", (x) => x * 1.60934],
};
function useUnit(unit) {
  const [alt, setAlt] = useState(false);
  const c = CONV[unit];
  return {
    can: !!c,
    unit: alt && c ? c[0] : unit,
    conv: (v) => (alt && c && typeof v === "number" ? c[1](v) : v),
    toggle: () => c && setAlt((a) => !a),
  };
}

// ---------- math ----------

export function TeX({ tex, block = true, className }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(tex || "", { displayMode: block, throwOnError: true, strict: "ignore", output: "html" });
    } catch {
      return null;
    }
  }, [tex, block]);
  if (html == null) return <code className="yl-texerr" title="TeX did not parse">{tex}</code>;
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function MathBlock({ p }) {
  return (
    <figure className={`yl-block yl-math ${p.size}`}>
      <div className="yl-mathscroll"><TeX tex={p.tex} /></div>
      {p.caption ? <figcaption className="yl-sub">{p.caption}</figcaption> : null}
    </figure>
  );
}

// ---------- scales ----------

function niceStep(span, count) {
  const raw = span / Math.max(1, count);
  const mag = 10 ** Math.floor(Math.log10(raw || 1));
  const n = raw / mag;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag;
}
function niceScale(lo, hi, count = 4, zero = false) {
  if (zero) { lo = Math.min(0, lo); hi = Math.max(0, hi); }
  if (lo === hi) { lo -= 1; hi += 1; }
  const step = niceStep(hi - lo, count);
  const a = Math.floor(lo / step) * step;
  const b = Math.ceil(hi / step) * step;
  const ticks = [];
  for (let v = a; v <= b + step / 2; v += step) ticks.push(Number(v.toPrecision(12)));
  return { lo: a, hi: b, ticks };
}

// ---------- chart ----------

const THEME = { accent: "var(--accent)", accent2: "var(--accent2)", arnold: "var(--arnold)" };
const slot = (i) => `var(--yl-c${(i % 6) + 1})`;
const colorOf = (p, i) => {
  const c = p.color && p.color[i];
  if (!c) return slot(i);
  if (THEME[c]) return THEME[c];
  if (/^c[1-6]$/.test(c)) return `var(--yl-${c})`;
  return String(c);
};

// Turns chart props (inline or data=<table>) into { x, series: [{name, y, err}] }.
function chartData(p, ctx) {
  const ykeys = Object.keys(p).filter((k) => /^y\d*$/.test(k)).sort((a, b) => Number(a.slice(1) || 1) - Number(b.slice(1) || 1));
  if (p.data !== undefined) {
    const id = String(p.data);
    const node = [...ctx.nodes].reverse().find((n) => n.preset === "table" && (n.id === id || n.props.name === id) && n.props.cols);
    const t = node ? { cols: node.props.cols, rows: node.props.rows || [], units: node.props.units || [] } : ctx.tables[id];
    if (!t) return { missing: id, x: [], series: [] };
    const col = (name) => t.cols.findIndex((c) => String(c).toLowerCase() === String(name).toLowerCase());
    const xi = p.x && p.x.length ? col(p.x[0]) : 0;
    const yCols = (p.y || []).length ? p.y.map(col).filter((i) => i >= 0) : t.cols.map((_, i) => i).filter((i) => i !== xi && t.rows.every((r) => typeof r[i] === "number"));
    return {
      bound: id,
      x: t.rows.map((r) => r[xi]),
      xname: t.cols[xi],
      unit: p.unit || (yCols.length === 1 ? (t.units || [])[yCols[0]] : "") || "",
      series: yCols.map((i, s) => ({ name: (p.names || [])[s] || t.cols[i], y: t.rows.map((r) => Number(r[i])), err: [] })),
    };
  }
  const series = ykeys.map((k, s) => {
    const y = (Array.isArray(p[k]) ? p[k] : [p[k]]).map(Number);
    const e = p[`err${k.slice(1)}`];
    return { name: (p.names || [])[s] || (ykeys.length > 1 ? `Series ${s + 1}` : p.title || "Value"), y, err: e ? (Array.isArray(e) ? e : [e]).map(Number) : [] };
  });
  const n = Math.max(0, ...series.map((s) => s.y.length));
  const x = p.x && p.x.length ? p.x : Array.from({ length: n }, (_, i) => i + 1);
  return { x, series, unit: p.unit };
}
const errAt = (s, i) => (s.err.length === 1 ? s.err[0] : s.err[i] || 0);

const W = 320, H = 190, PAD = { l: 38, r: 12, t: 12, b: 26 };

export function Chart({ p, emit }) {
  const ctx = useContext(ScreenCtx);
  const d = chartData(p, ctx);
  const [hover, setHover] = useState(null);
  const [tab, setTab] = useState("chart");
  const svg = useRef(null);

  if (d.missing) return <div className="yl-block"><div className="yl-q">{p.title || "Chart"}</div><div className="yl-sub">No table called "{d.missing}" on this screen yet.</div></div>;
  const { x, series } = d;
  const n = x.length;
  const unit = d.unit || "";
  const legend = series.length > 1 && p.type !== "pie" && p.type !== "donut";
  const head = (
    <div className="yl-charthead">
      <div className="yl-q">{p.title || (d.bound ? `${series.map((s) => s.name).join(", ")} by ${d.xname}` : "")}{d.bound ? <span className="yl-bound">data: {d.bound}</span> : null}</div>
      <div className="yl-seg sm yl-charttabs">
        <button className={tab === "chart" ? "on" : ""} onClick={() => setTab("chart")}>Chart</button>
        <button className={tab === "table" ? "on" : ""} onClick={() => setTab("table")}>Table</button>
      </div>
    </div>
  );
  const legendEl = legend ? (
    <div className="yl-legend">{series.map((s, i) => <span key={i}><i style={{ background: colorOf(p, i) }} />{s.name}</span>)}</div>
  ) : null;

  if (tab === "table") {
    return (
      <div className="yl-block yl-chart">
        {head}
        <div className="yl-tablewrap">
          <table className="yl-table">
            <thead><tr><th>{d.xname || p.xlabel || ""}</th>{series.map((s, i) => <th key={i} className="num">{s.name}{unit ? ` (${prettyUnit(unit)})` : ""}</th>)}</tr></thead>
            <tbody>{x.map((xv, i) => (
              <tr key={i}><td>{String(xv)}</td>{series.map((s, j) => <td key={j} className="num">{fmtNum(s.y[i])}{errAt(s, i) ? ` ± ${fmtNum(errAt(s, i))}` : ""}</td>)}</tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    );
  }

  if (p.type === "pie" || p.type === "donut") return <Pie p={p} d={d} head={head} emit={emit} />;

  // Scales. Scatter, and line/area with all-numeric x, use a linear x axis.
  const numericX = x.length > 0 && x.every((v) => typeof v === "number");
  const linearX = p.type === "scatter" || ((p.type === "line" || p.type === "area") && numericX && p.x && p.x.length);
  const xs = linearX ? x.map((v, i) => (typeof v === "number" ? v : i)) : null;
  const iw = W - PAD.l - PAD.r, ih = H - PAD.t - PAD.b;
  const stack = p.stack && (p.type === "bar" || p.type === "area");
  const sums = stack ? x.map((_, i) => series.reduce((a, s) => a + (s.y[i] || 0), 0)) : null;
  const vals = stack ? sums : series.flatMap((s) => s.y.map((v, i) => [v - errAt(s, i), v + errAt(s, i)]).flat()).filter(Number.isFinite);
  const zero = p.type === "bar" || p.type === "area";
  const ys = niceScale(p.min ?? Math.min(...vals, stack ? 0 : Infinity), p.max ?? Math.max(...vals), 4, zero);
  if (p.min !== undefined) ys.lo = p.min;
  if (p.max !== undefined) ys.hi = p.max;
  const Y = (v) => PAD.t + ih - ((v - ys.lo) / (ys.hi - ys.lo || 1)) * ih;
  let X, band = 0;
  if (linearX) {
    const xsc = niceScale(Math.min(...xs), Math.max(...xs), 5);
    X = (i) => PAD.l + ((xs[i] - xsc.lo) / (xsc.hi - xsc.lo || 1)) * iw;
    X.ticks = xsc.ticks.map((t) => ({ at: PAD.l + ((t - xsc.lo) / (xsc.hi - xsc.lo || 1)) * iw, label: fmtNum(t, 3) }));
  } else {
    band = iw / Math.max(1, n);
    X = (i) => PAD.l + band * (i + 0.5);
    const every = Math.ceil(n / 7);
    X.ticks = x.map((v, i) => ({ at: X(i), label: String(v) })).filter((_, i) => i % every === 0);
  }

  const pick = (e) => {
    const r = svg.current.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const py = ((e.clientY - r.top) / r.height) * H;
    let i = 0, best = Infinity;
    for (let k = 0; k < n; k++) { const dd = Math.abs(X(k) - px); if (dd < best) { best = dd; i = k; } }
    let s = 0;
    if (p.type === "bar" && !stack && series.length > 1) {
      const gw = band * 0.72, bw = gw / series.length;
      s = Math.max(0, Math.min(series.length - 1, Math.floor((px - (X(i) - gw / 2)) / bw)));
    } else {
      let bd = Infinity;
      series.forEach((sr, k) => { const yv = stack ? series.slice(0, k + 1).reduce((a, q) => a + (q.y[i] || 0), 0) : sr.y[i]; const dd = Math.abs(Y(yv) - py); if (dd < bd) { bd = dd; s = k; } });
    }
    return { i, s };
  };
  const tap = (e) => {
    const h = pick(e);
    setHover(h);
    const sr = series[h.s];
    const point = { series: h.s, index: h.i, x: x[h.i], y: sr.y[h.i] };
    if (series.length > 1) point.name = sr.name;
    emit({ point });
  };

  const marks = [];
  const lastStack = new Array(n).fill(0);
  series.forEach((s, k) => {
    const col = colorOf(p, k);
    if (p.type === "bar") {
      const gw = band * 0.72;
      const bw = stack ? gw : gw / series.length;
      s.y.forEach((v, i) => {
        if (!Number.isFinite(v)) return;
        const base = stack ? lastStack[i] : 0;
        const top = base + v;
        const x0 = X(i) - gw / 2 + (stack ? 0 : bw * k);
        const y0 = Y(Math.max(base, top)), y1 = Y(Math.min(base, top));
        const w = Math.max(1, bw - 2);
        const h = Math.max(1, y1 - y0 - (stack && k > 0 ? 2 : 0));
        const r = Math.min(4, w / 2, h);
        const cap = !stack || k === series.length - 1;
        const up = top >= base;
        marks.push(
          <path key={`b${k}-${i}`} className={`yl-bar ${hover && hover.i === i ? "hot" : ""}`} fill={col} style={{ animationDelay: `${i * 30}ms` }}
            d={cap ? roundTop(x0 + 1, y0, w, h, r, up) : `M${x0 + 1},${y0}h${w}v${h}h${-w}z`} />,
        );
        if (stack) lastStack[i] = top;
      });
    } else if (p.type === "line" || p.type === "area") {
      const pts = s.y.map((v, i) => [X(i), Y(stack ? lastStack[i] + v : v)]).filter((q) => Number.isFinite(q[1]));
      if (p.type === "area") {
        const base = s.y.map((_, i) => [X(i), Y(stack ? lastStack[i] : Math.max(ys.lo, 0))]).reverse();
        marks.push(<path key={`a${k}`} className="yl-area" fill={col} d={`M${[...pts, ...base].map((q) => q.join(",")).join("L")}Z`} />);
      }
      marks.push(<path key={`l${k}`} className="yl-line" stroke={col} d={`M${pts.map((q) => q.join(",")).join("L")}`} pathLength="1" />);
      if (n <= 24 || p.dots) pts.forEach((q, i) => marks.push(<circle key={`d${k}-${i}`} className="yl-dot" cx={q[0]} cy={q[1]} r={hover && hover.i === i ? 4.5 : 3} fill={col} />));
      if (stack) s.y.forEach((v, i) => { lastStack[i] += v || 0; });
    } else if (p.type === "scatter") {
      s.y.forEach((v, i) => marks.push(<circle key={`s${k}-${i}`} className="yl-dot sc" cx={X(i)} cy={Y(v)} r={hover && hover.i === i && hover.s === k ? 6 : 4.5} fill={col} />));
    }
    // Error bars: a thin whisker with caps, in the series color.
    if (!stack && s.err.length) {
      s.y.forEach((v, i) => {
        const e = errAt(s, i);
        if (!e || !Number.isFinite(v)) return;
        let cx = X(i);
        if (p.type === "bar") { const gw = band * 0.72; cx = X(i) - gw / 2 + (gw / series.length) * (k + 0.5); }
        marks.push(
          <g key={`e${k}-${i}`} className="yl-err" stroke={p.type === "bar" ? "var(--yl-ink)" : col}>
            <line x1={cx} x2={cx} y1={Y(v - e)} y2={Y(v + e)} />
            <line x1={cx - 4} x2={cx + 4} y1={Y(v - e)} y2={Y(v - e)} />
            <line x1={cx - 4} x2={cx + 4} y1={Y(v + e)} y2={Y(v + e)} />
          </g>,
        );
      });
    }
  });

  const tip = hover ? (() => {
    const i = hover.i;
    const left = (X(i) / W) * 100;
    return (
      <div className="yl-tip" style={{ left: `${Math.min(78, Math.max(22, left))}%` }}>
        <b>{String(x[i])}</b>
        {series.map((s, k) => (
          <div key={k} className={k === hover.s ? "on" : ""}>
            {series.length > 1 ? <><i style={{ background: colorOf(p, k) }} />{s.name} </> : null}
            <span>{withUnit(s.y[i], unit)}{errAt(s, i) ? ` ± ${fmtNum(errAt(s, i))}` : ""}</span>
          </div>
        ))}
      </div>
    );
  })() : null;

  return (
    <div className="yl-block yl-chart">
      {head}
      {legendEl}
      <div className="yl-plot">
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} className={`yl-svg t-${p.type}`} onPointerMove={(e) => e.pointerType === "mouse" && setHover(pick(e))} onPointerLeave={() => setHover(null)} onClick={tap} role="img" aria-label={p.title || "chart"}>
          {ys.ticks.map((t) => (
            <g key={t}>
              <line className={`yl-grid ${t === 0 ? "zero" : ""}`} x1={PAD.l} x2={W - PAD.r} y1={Y(t)} y2={Y(t)} />
              <text className="yl-tick" x={PAD.l - 6} y={Y(t) + 3.5} textAnchor="end">{fmtNum(t, 3)}</text>
            </g>
          ))}
          {X.ticks.map((t, i) => <text key={i} className="yl-tick" x={t.at} y={H - 8} textAnchor="middle">{t.label}</text>)}
          {hover && p.type !== "bar" ? <line className="yl-cross" x1={X(hover.i)} x2={X(hover.i)} y1={PAD.t} y2={PAD.t + ih} /> : null}
          {marks}
        </svg>
        {tip}
      </div>
      {unit || p.xlabel ? <div className="yl-axisnote">{unit ? prettyUnit(unit) : ""}{p.xlabel ? <span>{p.xlabel}</span> : null}</div> : null}
    </div>
  );
}

// Bar with rounded data end (top for positive, bottom for negative).
function roundTop(x, y, w, h, r, up) {
  if (up) return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
  return `M${x},${y}V${y + h - r}Q${x},${y + h} ${x + r},${y + h}H${x + w - r}Q${x + w},${y + h} ${x + w},${y + h - r}V${y}Z`;
}

function Pie({ p, d, head, emit }) {
  const [hot, setHot] = useState(null);
  const s = d.series[0] || { y: [] };
  const vals = s.y.map((v) => Math.max(0, v || 0));
  const total = vals.reduce((a, b) => a + b, 0) || 1;
  const R = 70, r = p.type === "donut" ? 44 : 0, cx = 80, cy = 80;
  let a0 = -Math.PI / 2;
  const arcs = vals.map((v, i) => {
    const a1 = a0 + (v / total) * Math.PI * 2;
    const pt = (rad, a) => [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
    const big = a1 - a0 > Math.PI ? 1 : 0;
    const [x0, y0] = pt(R, a0), [x1, y1] = pt(R, a1), [x2, y2] = pt(r, a1), [x3, y3] = pt(r, a0);
    const path = vals.length === 1
      ? `M${cx - R},${cy}a${R},${R} 0 1,0 ${2 * R},0a${R},${R} 0 1,0 ${-2 * R},0` + (r ? `M${cx - r},${cy}a${r},${r} 0 1,1 ${2 * r},0a${r},${r} 0 1,1 ${-2 * r},0` : "")
      : `M${x0},${y0}A${R},${R} 0 ${big},1 ${x1},${y1}` + (r ? `L${x2},${y2}A${r},${r} 0 ${big},0 ${x3},${y3}Z` : `L${cx},${cy}Z`);
    const mid = (a0 + a1) / 2;
    a0 = a1;
    return { path, mid, i };
  });
  const tap = (i) => { setHot(i); emit({ point: { series: 0, index: i, x: d.x[i], y: s.y[i] } }); };
  const focus = hot ?? null;
  return (
    <div className="yl-block yl-chart">
      {head}
      <div className="yl-pie">
        <svg viewBox="0 0 160 160" className="yl-svg" role="img" aria-label={p.title || "pie chart"}>
          {arcs.map((a) => (
            <path key={a.i} d={a.path} fill={colorOf(p, a.i)} className={`yl-slice ${focus === a.i ? "hot" : ""}`} fillRule="evenodd"
              style={focus === a.i ? { transform: `translate(${Math.cos(a.mid) * 4}px, ${Math.sin(a.mid) * 4}px)` } : null}
              onClick={() => tap(a.i)} />
          ))}
          {r ? (
            <text x={cx} y={cy} textAnchor="middle" className="yl-pietotal">
              <tspan x={cx} dy="-2">{focus != null ? `${Math.round((vals[focus] / total) * 100)}%` : withUnit(total, d.unit)}</tspan>
              <tspan x={cx} dy="16" className="lbl">{focus != null ? String(d.x[focus]) : "total"}</tspan>
            </text>
          ) : null}
        </svg>
        <ul className="yl-pielegend">
          {vals.map((v, i) => (
            <li key={i} className={focus === i ? "on" : ""} onClick={() => tap(i)}>
              <i style={{ background: colorOf(p, i) }} /><span>{String(d.x[i] ?? i + 1)}</span>
              <b>{withUnit(s.y[i], d.unit)}</b><em>{Math.round((v / total) * 100)}%</em>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ---------- stat ----------

function Spark({ data, good }) {
  const pts = data.filter(Number.isFinite);
  if (pts.length < 2) return null;
  const lo = Math.min(...pts), hi = Math.max(...pts);
  const w = 96, h = 32;
  const xy = pts.map((v, i) => [(i / (pts.length - 1)) * (w - 6) + 3, h - 4 - ((v - lo) / (hi - lo || 1)) * (h - 8)]);
  const d = `M${xy.map((q) => q.map((c) => c.toFixed(1)).join(",")).join("L")}`;
  const last = xy[xy.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="yl-spark" aria-hidden>
      <path d={`${d}L${last[0]},${h}L3,${h}Z`} className="fill" />
      <path d={d} className="line" pathLength="1" />
      <circle cx={last[0]} cy={last[1]} r="3" className={good} />
    </svg>
  );
}

export function Stat({ p, emit }) {
  const u = useUnit(p.unit);
  const num = typeof p.value === "number";
  const dq = p.delta !== undefined ? quantity(p.delta) : null;
  const dv = dq ? dq.value : null;
  const dUnit = dq && dq.unit ? dq.unit : p.unit;
  const better = dv == null || dv === 0 ? "flat" : (dv > 0) === (p.good !== "down") ? "good" : "bad";
  const val = num ? u.conv(p.value) : p.value;
  const shown = num ? withUnit(val, u.unit) : String(p.value ?? "");
  // Split the number from its unit so the unit can sit smaller.
  const unitText = num && u.unit && !PREFIX.has(u.unit) ? prettyUnit(u.unit) : "";
  const numText = unitText ? shown.slice(0, shown.length - unitText.length).trim() : shown;
  return (
    <div className="yl-block yl-stat" onClick={p.cta ? () => emit({ cta: p.cta }) : undefined}>
      <div className="yl-statrow">
        <div>
          {p.label ? <div className="yl-statlbl">{p.label}</div> : null}
          <div className="yl-statval">
            <b>{numText}</b>
            {unitText ? <button className={`yl-unit ${u.can ? "tap" : ""}`} onClick={(e) => { e.stopPropagation(); u.toggle(); }} title={u.can ? "Tap to convert" : ""}>{unitText}</button> : null}
          </div>
          {dv != null ? (
            <div className={`yl-delta ${better}`}>
              <span>{dv > 0 ? "▲" : dv < 0 ? "▼" : "■"}</span>
              {withUnit(Math.abs(u.can && dUnit === p.unit ? u.conv(dv) - u.conv(0) : dv), u.can && dUnit === p.unit ? u.unit : dUnit, 3)}
              {p.sub ? <em>{p.sub}</em> : null}
            </div>
          ) : p.sub ? <div className="yl-sub">{p.sub}</div> : null}
        </div>
        {p.spark ? <Spark data={p.spark.map((v) => (typeof v === "number" ? u.conv(v) : Number(v)))} good={better} /> : null}
      </div>
    </div>
  );
}

// ---------- table (sortable, units) ----------

export function DataTable({ p, emit, bound, human }) {
  const cols = p.cols || (bound && bound.cols);
  const rows = p.cols ? p.rows : bound ? bound.rows : [];
  const units = p.units && p.units.length ? p.units : (bound && bound.units) || [];
  const [sort, setSort] = useState(null);
  const numCol = (j) => rows.length && rows.every((r) => typeof r[j] === "number" || r[j] === "" || r[j] == null);
  const shown = useMemo(() => {
    if (!sort) return rows;
    const j = sort.col;
    const k = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => (typeof a[j] === "number" && typeof b[j] === "number" ? (a[j] - b[j]) * k : String(a[j]).localeCompare(String(b[j])) * k));
  }, [rows, sort]);
  const click = (j) => {
    if (!p.sort) return;
    const dir = sort && sort.col === j && sort.dir === "asc" ? "desc" : "asc";
    setSort({ col: j, dir });
    emit({ sort: cols[j], dir });
  };
  return (
    <div className="yl-block">
      <div className="yl-q">{p.name ? human(p.name) : "Table"}{bound ? <span className="yl-bound">bound: {p.name}</span> : null}</div>
      {cols ? (
        <div className="yl-tablewrap">
          <table className={`yl-table ${p.sort ? "sortable" : ""}`}>
            <thead><tr>{cols.map((c, j) => (
              <th key={j} className={numCol(j) ? "num" : ""} onClick={() => click(j)} aria-sort={sort && sort.col === j ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}>
                {c}
                {p.sort ? <span className="yl-sortic">{sort && sort.col === j ? (sort.dir === "asc" ? "▲" : "▼") : "↕"}</span> : null}
                {units[j] ? <span className="yl-thunit">{prettyUnit(units[j])}</span> : null}
              </th>
            ))}</tr></thead>
            <tbody>{shown.map((r, i) => <tr key={i}>{cols.map((_, j) => <td key={j} className={numCol(j) ? "num" : ""}>{typeof r[j] === "number" ? fmtNum(r[j], 6) : r[j]}</td>)}</tr>)}</tbody>
          </table>
        </div>
      ) : <div className="yl-sub">No rows in "{p.name}" yet.</div>}
    </div>
  );
}

// ---------- steps ----------
// Consecutive `step` lines on a screen render as one stepper. Each step is its
// own node with its own id, so each emits its own event.

function StepTimer({ secs }) {
  const [left, setLeft] = useState(secs);
  const [run, setRun] = useState(false);
  useEffect(() => { setLeft(secs); setRun(false); }, [secs]);
  useEffect(() => {
    if (!run) return;
    const t = setInterval(() => setLeft((l) => { if (l <= 1) { setRun(false); return 0; } return l - 1; }), 1000);
    return () => clearInterval(t);
  }, [run]);
  const m = Math.floor(left / 60), s = left % 60;
  return (
    <button className={`yl-steptimer ${run ? "on" : ""} ${left === 0 ? "done" : ""}`} onClick={(e) => { e.stopPropagation(); if (left === 0) setLeft(secs); setRun(!run); }}>
      {left === 0 ? "✓ Time" : run ? "❚❚" : "▶"} {m}:{String(s).padStart(2, "0")}
    </button>
  );
}

export function Steps({ nodes, emitFor, resolveProps }) {
  const steps = nodes.map((n) => ({ n, p: resolveProps(n) }));
  const all = steps[0].p.all;
  const title = steps.find((s) => s.p.title)?.p.title;
  const [cur, setCur] = useState(0);
  const [done, setDone] = useState({});
  const total = steps.length;
  const at = Math.min(cur, total - 1);
  const finish = (i) => {
    setDone((d) => ({ ...d, [i]: true }));
    emitFor(steps[i].n)({ done: true, index: i, ...(i === total - 1 ? { last: true } : {}) });
  };
  const next = () => { finish(at); if (at < total - 1) setCur(at + 1); else setCur(total); };
  const finished = cur >= total;
  const visible = all ? steps : steps.slice(0, at + 1);
  return (
    <div className="yl-block yl-steps">
      <div className="yl-stephead">
        {title ? <div className="yl-q">{title}</div> : null}
        <div className="yl-sub">{finished ? `All ${total} steps done` : all ? `${total} steps` : `Step ${at + 1} of ${total}`}</div>
        <div className="yl-stepbar"><span style={{ width: `${((finished ? total : all ? Object.keys(done).length : at + 1) / total) * 100}%` }} /></div>
      </div>
      <ol className="yl-steplist">
        {visible.map(({ n, p }, i) => {
          const state = done[i] ? "done" : !all && i === at && !finished ? "now" : all ? "open" : "done";
          return (
            <li key={n.key} className={`yl-step ${state}`} onClick={all && !done[i] ? () => finish(i) : undefined}>
              <span className="yl-stepnum">{done[i] ? "✓" : i + 1}</span>
              <div className="yl-stepbody">
                {p.text ? <div className="yl-steptext">{p.text}</div> : null}
                {p.tex ? <div className="yl-steptex"><TeX tex={p.tex} /></div> : null}
                {p.img ? <img src={p.img} alt="" className="yl-stepimg" /> : null}
                {typeof p.time === "number" && p.time > 0 ? <StepTimer secs={p.time} /> : null}
              </div>
            </li>
          );
        })}
      </ol>
      {!all && !finished ? (
        <div className="bigbtns">
          <button className="bigbtn s" disabled={at === 0} onClick={() => setCur(Math.max(0, at - 1))}>Back</button>
          <button className="bigbtn p acc" onClick={next}>{at === total - 1 ? "Done" : "Next"}</button>
        </div>
      ) : null}
      {!all && total > at + 1 && !finished ? <div className="yl-sub yl-stepmore">{total - at - 1} more step{total - at - 1 === 1 ? "" : "s"}</div> : null}
    </div>
  );
}

// ---------- calc ----------
// A formula with slider inputs that live-update a result and a chart of the
// result against one input.

const isDeg = (u) => u === "deg" || u === "°";
// About 200 slider positions across the range, on a round step.
const stepFor = (v) => niceStep(v.max - v.min, 200);

export function Calc({ p, emit }) {
  const known = new Set(["title", "f", "plot", "unit", "digits", "color"]);
  const defs = Object.entries(p).filter(([k, v]) => !known.has(k) && v && typeof v === "object" && !Array.isArray(v) && "value" in v);
  const sliders = defs.filter(([, v]) => v.min !== undefined);
  const [vals, setVals] = useState(() => Object.fromEntries(defs.map(([k, v]) => [k, v.value])));
  const sig = JSON.stringify(defs);
  useEffect(() => { setVals(Object.fromEntries(defs.map(([k, v]) => [k, v.value]))); }, [sig]); // eslint-disable-line react-hooks/exhaustive-deps

  const parsed = useMemo(() => {
    try {
      const { out, expr } = splitFormula(p.f || "");
      const ast = parseExpr(expr);
      return { out, ast, tex: `${out ? `${toTeX({ v: out })} = ` : ""}${toTeX(ast)}` };
    } catch (e) { return { err: e.message }; }
  }, [p.f]);
  const unitOf = Object.fromEntries(defs.map(([k, v]) => [k, v.unit]));
  const env = (over = {}) => {
    const o = {};
    for (const [k] of defs) { const v = over[k] ?? vals[k]; o[k] = isDeg(unitOf[k]) ? (v * Math.PI) / 180 : v; }
    return o;
  };
  const calc = (over) => { try { const r = evalExpr(parsed.ast, env(over)); return Number.isFinite(r) ? r : NaN; } catch { return NaN; } };
  const missing = parsed.ast ? [...exprNames(parsed.ast)].filter((n) => vals[n] === undefined && n !== "pi" && n !== "e") : [];
  const result = parsed.ast && !missing.length ? calc() : NaN;
  const plotKey = p.plot === false ? null : (p.plot && sliders.find(([k]) => k === p.plot)) ? p.plot : sliders[0] && sliders[0][0];
  const curve = useMemo(() => {
    if (!plotKey || !parsed.ast || missing.length) return null;
    const v = p[plotKey];
    const N = 60;
    const xs = Array.from({ length: N + 1 }, (_, i) => v.min + ((v.max - v.min) * i) / N);
    return { xs, ys: xs.map((x) => calc({ [plotKey]: x })) };
  }, [plotKey, parsed, JSON.stringify(vals), sig]); // eslint-disable-line react-hooks/exhaustive-deps
  const send = () => emit({ values: { ...vals }, result: Number.isFinite(result) ? Number(result.toPrecision(6)) : null });
  const outName = parsed.out || "result";

  return (
    <div className="yl-block yl-calc">
      {p.title ? <div className="yl-q">{p.title}</div> : null}
      {parsed.err ? <div className="yl-err">Formula: {parsed.err}</div> : <div className="yl-calcf"><TeX tex={parsed.tex} /></div>}
      <div className="yl-calcres">
        <span className="lbl"><TeX tex={parsed.out ? toTeX({ v: parsed.out }) : "\\text{result}"} block={false} /> =</span>
        <b>{Number.isFinite(result) ? withUnit(result, p.unit, p.digits) : missing.length ? `needs ${missing.join(", ")}` : "undefined"}</b>
      </div>
      {curve ? <CalcPlot curve={curve} at={vals[plotKey]} res={result} xname={plotKey} xunit={unitOf[plotKey]} yunit={p.unit} yname={outName} /> : null}
      {sliders.map(([k, v]) => (
        <label key={k} className="yl-calcvar">
          <span className="nm"><TeX tex={toTeX({ v: k })} block={false} /></span>
          <input type="range" className="yl-range" min={v.min} max={v.max} step={stepFor(v)} value={vals[k]}
            onChange={(e) => setVals((o) => ({ ...o, [k]: Number(e.target.value) }))} onPointerUp={send} onKeyUp={send} />
          <b>{withUnit(vals[k], v.unit, 4)}</b>
        </label>
      ))}
      {defs.some(([, v]) => v.min === undefined) ? (
        <div className="yl-calcconst">
          {defs.filter(([, v]) => v.min === undefined).map(([k, v]) => <span key={k}><TeX tex={toTeX({ v: k })} block={false} /> = {withUnit(v.value, v.unit, 6)}</span>)}
        </div>
      ) : null}
    </div>
  );
}

function CalcPlot({ curve, at, res, xname, xunit, yunit, yname }) {
  const w = 320, h = 150, l = 38, r = 12, t = 10, b = 24;
  const fin = curve.ys.filter(Number.isFinite);
  if (!fin.length) return null;
  const xsc = niceScale(curve.xs[0], curve.xs[curve.xs.length - 1], 5);
  xsc.lo = curve.xs[0]; xsc.hi = curve.xs[curve.xs.length - 1];
  const ysc = niceScale(Math.min(...fin), Math.max(...fin), 4);
  const X = (v) => l + ((v - xsc.lo) / (xsc.hi - xsc.lo || 1)) * (w - l - r);
  const Y = (v) => t + (h - t - b) - ((v - ysc.lo) / (ysc.hi - ysc.lo || 1)) * (h - t - b);
  let d = "", pen = false;
  curve.xs.forEach((x, i) => { const y = curve.ys[i]; if (!Number.isFinite(y)) { pen = false; return; } d += `${pen ? "L" : "M"}${X(x).toFixed(1)},${Y(y).toFixed(1)}`; pen = true; });
  const xt = xsc.ticks.filter((v) => v >= xsc.lo - 1e-9 && v <= xsc.hi + 1e-9);
  return (
    <div className="yl-plot">
      <svg viewBox={`0 0 ${w} ${h}`} className="yl-svg" role="img" aria-label={`${yname} against ${xname}`}>
        {ysc.ticks.map((v) => <g key={v}><line className={`yl-grid ${v === 0 ? "zero" : ""}`} x1={l} x2={w - r} y1={Y(v)} y2={Y(v)} /><text className="yl-tick" x={l - 6} y={Y(v) + 3.5} textAnchor="end">{fmtNum(v, 3)}</text></g>)}
        {xt.map((v) => <text key={v} className="yl-tick" x={X(v)} y={h - 7} textAnchor="middle">{fmtNum(v, 3)}</text>)}
        <path d={d} className="yl-line static" stroke="var(--yl-c1)" />
        {Number.isFinite(res) ? (
          <>
            <line className="yl-cross" x1={X(at)} x2={X(at)} y1={t} y2={h - b} />
            <circle cx={X(at)} cy={Y(res)} r="5" className="yl-dot now" fill="var(--yl-c1)" />
          </>
        ) : null}
      </svg>
      <div className="yl-axisnote">{yname}{yunit ? ` (${prettyUnit(yunit)})` : ""}<span>{xname}{xunit ? ` (${prettyUnit(xunit)})` : ""}</span></div>
    </div>
  );
}
