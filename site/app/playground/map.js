"use client";

// map (YUI-158): a small map that answers "where". Areas (countries by code
// or a drawn outline), pins and routes from `area`, `pin` and `route` lines,
// fitted and projected by lib/yl/map.mjs over a bundled Natural Earth 110m
// outline (offline, no tiles, no key), drawn as SVG in the agent's colors and
// stepped with requestAnimationFrame until the last part lands (a pulsing pin
// keeps breathing). Reduce Motion draws the final still. A tap plays it again.
// Sends nothing.
import { useEffect, useMemo, useRef, useState } from "react";
import { resolve } from "../../lib/yl/yl.mjs";
import { describe, frame, scene, wrap } from "../../lib/yl/map.mjs";
import { smooth } from "../../lib/yl/shapes.mjs";

const TONE = {
  accent: "var(--accent)", mint: "var(--yl-c3)", lavender: "var(--yl-c1)",
  butter: "var(--yl-c4)", ink: "var(--yl-ink)", mute: "var(--yl-ink2)",
};

const f2 = (n) => Math.round(n * 1000) / 1000;
const P = ([x, y]) => `${f2(x)} ${f2(y)}`;
const curve = (pts) => `M${P(pts[0])}` + smooth(pts, false).map(([a, b, c]) => `C${P(a)} ${P(b)} ${P(c)}`).join("");

function useReduceMotion() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setR(m.matches);
    const on = () => setR(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return r;
}

function useClock(sc, still, run) {
  const [t, setT] = useState(still ? Infinity : 0);
  const t0 = useRef(null);
  const pulses = sc.items.some((it) => it.pulse);
  useEffect(() => { t0.current = null; }, [run]);
  useEffect(() => {
    if (still) { setT(Infinity); return; }
    let raf;
    const tick = (now) => {
      if (t0.current === null) t0.current = now;
      const s = (now - t0.current) / 1000;
      setT(s);
      if (s < sc.total + 0.05 || pulses) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [sc, still, run, pulses]);
  return t;
}

// A label with a soft halo in the paper color, so it reads over land and lines.
function Label({ text, x, y, fs, anchor = "middle", opacity, width = 30 }) {
  const lines = wrap(text, width, fs);
  const lh = fs * 1.15;
  const y0 = y - ((lines.length - 1) * lh) / 2 + fs * 0.35;
  return (
    <text x={f2(x)} y={f2(y0)} fontSize={f2(fs)} textAnchor={anchor} className="yl-maplabel" opacity={opacity}>
      {lines.map((l, k) => <tspan key={k} x={f2(x)} dy={k ? f2(lh) : 0}>{l}</tspan>)}
    </text>
  );
}

function Part({ f, fs, sw }) {
  const color = TONE[f.tone];
  if (f.o <= 0) return null;
  if (f.kind === "area") {
    return (
      <g opacity={f.o}>
        <path d={f.path} fill={color} fillOpacity={f.dash ? 0.12 : 0.32} stroke={color} strokeWidth={sw * 1.2} strokeLinejoin="round"
          strokeDasharray={f.dash ? `${sw * 3} ${sw * 2.5}` : undefined} />
        {f.label ? <Label text={f.label} x={f.lx} y={f.ly} fs={fs} anchor={f.anchor} /> : null}
      </g>
    );
  }
  if (f.kind === "pin") {
    const r = fs * 0.42;
    const [x, y] = f.c;
    return (
      <g opacity={f.o}>
        {f.p ? <circle cx={f2(x)} cy={f2(y)} r={f2(r * (1.4 + 1.6 * f.p))} fill={color} opacity={f2(0.35 * (1 - f.p))} /> : null}
        <g transform={`translate(${f2(x)} ${f2(y)}) scale(${f2(f.s)})`}>
          <circle r={f2(r)} fill={color} stroke="var(--screen-bg)" strokeWidth={sw} />
        </g>
        {f.label ? <Label text={f.label} x={f.lx} y={f.ly} fs={fs} anchor={f.anchor} opacity={f.d} /> : null}
      </g>
    );
  }
  // route: traced on along a smooth curve through its stops.
  const d = curve(f.pts);
  const end = f.pts[f.pts.length - 1], before = f.pts[f.pts.length - 2];
  const len = Math.hypot(end[0] - before[0], end[1] - before[1]) || 1;
  const ux = (end[0] - before[0]) / len, uy = (end[1] - before[1]) / len;
  const k = fs * 0.55, s = Math.sin(0.5), c = Math.cos(0.5);
  const head = f.arrow && f.d >= 0.98
    ? `M${P([end[0] - k * (ux * c - uy * s), end[1] - k * (uy * c + ux * s)])}L${P(end)}L${P([end[0] - k * (ux * c + uy * s), end[1] - k * (uy * c - ux * s)])}`
    : null;
  return (
    <g>
      <path d={d} pathLength={f.dash ? undefined : "1"} stroke={color} strokeWidth={sw * 1.6} strokeLinecap="round" fill="none"
        strokeDasharray={f.dash ? `${sw * 3} ${sw * 3}` : `${f2(f.d)} 1`} opacity={f.dash ? f.d : 1} />
      {head ? <path d={head} stroke={color} strokeWidth={sw * 1.6} strokeLinecap="round" strokeLinejoin="round" fill="none" /> : null}
      {f.label ? <Label text={f.label} x={f.lx} y={f.ly} fs={fs * 0.92} anchor={f.anchor} opacity={f.d} /> : null}
    </g>
  );
}

function Drawing({ head, members }) {
  const hk = JSON.stringify(head);
  const sc = useMemo(() => scene(head, members), [hk, members]); // eslint-disable-line react-hooks/exhaustive-deps
  const reduce = useReduceMotion();
  const [run, setRun] = useState(0);
  const t = useClock(sc, reduce, run);
  const parts = frame(sc, t);
  const sw = 0.28;
  const text = describe(sc);
  return (
    <div className="yl-block yl-map">
      {sc.title ? <div className="yl-shtitle">{sc.title}</div> : null}
      <svg viewBox={`0 0 ${sc.w} ${sc.h}`} role="img" aria-label={text} className="yl-mapsvg"
        onClick={() => !reduce && setRun((n) => n + 1)}>
        <defs><clipPath id={`mapclip-${sc.w}-${sc.h}`}><rect width={sc.w} height={sc.h} rx="3" /></clipPath></defs>
        <g clipPath={`url(#mapclip-${sc.w}-${sc.h})`}>
          <rect width={sc.w} height={sc.h} className="yl-mapsea" />
          <path d={sc.land} className="yl-mapland" strokeWidth={sw * 0.6} strokeLinejoin="round" />
          {parts.map((f) => <Part key={f.i} f={f} fs={sc.fs} sw={sw} />)}
        </g>
      </svg>
      {sc.caption ? <p className="yl-shcap">{sc.caption}</p> : null}
    </div>
  );
}

const MEMBERS = ["area", "pin", "route"];

export function MapView({ g }) {
  const members = useMemo(() => g.members.filter((m) => !m.group && MEMBERS.includes(m.preset)).map((m) => ({ id: m.id, preset: m.preset, props: m.props })),
    // Redraw when a member arrives (streaming) or changes (a patch).
    [JSON.stringify(g.members.map((m) => [m.id, m.preset, m.props]))]); // eslint-disable-line react-hooks/exhaustive-deps
  return <Drawing head={g.group.props} members={members} />;
}

// An area, pin or route outside a map is a map of just that part.
export function LoneMapPart({ p, id, preset }) {
  const members = useMemo(() => [{ id, preset, props: p }], [id, preset, JSON.stringify(p)]); // eslint-disable-line react-hooks/exhaustive-deps
  return <Drawing head={resolve("map", {})} members={members} />;
}
