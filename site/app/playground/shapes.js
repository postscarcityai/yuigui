"use client";

// shapes (YUI-104): a small diagram that moves. Circles, boxes, pills, dots,
// blobs, labels, lines, arrows and paths from `shape` lines, laid out and
// timed by lib/yl/shapes.mjs, drawn as SVG and stepped with
// requestAnimationFrame until the last part lands (a pulse keeps breathing).
// Reduce Motion draws the final still. A tap on the drawing plays it again.
// Sends nothing.
import { useEffect, useMemo, useRef, useState } from "react";
import { resolve } from "../../lib/yl/yl.mjs";
import { LABEL, blobPoints, describe, frame, labelWidth, scene, smooth, wrap } from "../../lib/yl/shapes.mjs";

const TONE = {
  accent: "var(--accent)", mint: "var(--yl-c3)", lavender: "var(--yl-c1)",
  butter: "var(--yl-c4)", ink: "var(--yl-ink)", mute: "var(--yl-ink2)",
};

const f2 = (n) => Math.round(n * 1000) / 1000;
const P = ([x, y]) => `${f2(x)} ${f2(y)}`;
const curve = (pts, closed) => `M${P(pts[0])}` + smooth(pts, closed).map(([a, b, c]) => `C${P(a)} ${P(b)} ${P(c)}`).join("") + (closed ? "Z" : "");

// A closed shape's outline around (0, 0).
function outline(kind, [w, h], seed) {
  if (kind === "circle" || kind === "dot") {
    const a = w / 2, b = h / 2;
    return `M0 ${f2(-b)}A${f2(a)} ${f2(b)} 0 1 1 0 ${f2(b)}A${f2(a)} ${f2(b)} 0 1 1 0 ${f2(-b)}Z`;
  }
  if (kind === "blob") return curve(blobPoints(w, h, seed), true);
  const r = kind === "pill" ? h / 2 : Math.min(0.3, h / 4);
  const x = w / 2, y = h / 2;
  return `M${f2(-x + r)} ${f2(-y)}H${f2(x - r)}A${f2(r)} ${f2(r)} 0 0 1 ${f2(x)} ${f2(-y + r)}V${f2(y - r)}A${f2(r)} ${f2(r)} 0 0 1 ${f2(x - r)} ${f2(y)}H${f2(-x + r)}A${f2(r)} ${f2(r)} 0 0 1 ${f2(-x)} ${f2(y - r)}V${f2(-y + r)}A${f2(r)} ${f2(r)} 0 0 1 ${f2(-x + r)} ${f2(-y)}Z`;
}

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

// Seconds since the drawing started, ticking while anything still moves.
// A new line arriving (streaming) keeps the clock; a tap (run) restarts it.
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

// A label as centred lines; `y` is where the middle of the block sits
// (top: where its first line's top sits).
function Label({ text, x, y, fs, width, top, className, style, opacity }) {
  const lines = wrap(text, width, fs);
  const lh = fs * 1.15;
  const y0 = top ? y + fs * 0.8 : y - ((lines.length - 1) * lh) / 2 + fs * 0.35;
  return (
    <text x={f2(x)} y={f2(y0)} fontSize={f2(fs)} textAnchor="middle" className={className} style={style} opacity={opacity}>
      {lines.map((l, k) => <tspan key={k} x={f2(x)} dy={k ? f2(lh) : 0}>{l}</tspan>)}
    </text>
  );
}

function Part({ f, sw, fs, k }) {
  const color = TONE[f.tone];
  if (f.o <= 0) return null;
  if (f.a) {
    // line or arrow
    const [ax, ay] = f.a, [bx, by] = f.b;
    const len = Math.hypot(bx - ax, by - ay) || 1;
    const ux = (bx - ax) / len, uy = (by - ay) / len;
    const hx = ax + (bx - ax) * f.d, hy = ay + (by - ay) * f.d;
    const k = 0.34 * (sw / 0.07), s = Math.sin(0.5), c = Math.cos(0.5);
    const head = f.kind === "arrow" && f.d > 0.05
      ? `M${P([hx - k * (ux * c - uy * s), hy - k * (uy * c + ux * s)])}L${P([hx, hy])}L${P([hx - k * (ux * c + uy * s), hy - k * (uy * c - ux * s)])}`
      : null;
    const mid = [(ax + bx) / 2, (ay + by) / 2];
    return (
      <g opacity={f.o}>
        <path d={`M${P(f.a)}L${P([hx, hy])}`} stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" strokeDasharray={f.dash ? `${sw * 3} ${sw * 2.5}` : undefined} />
        {head ? <path d={head} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none" /> : null}
        {f.label ? <Label text={f.label} x={mid[0]} y={mid[1] - fs * 0.75} fs={fs * 0.9} width={labelWidth(f, k)} className="yl-shlabel" opacity={f.d} /> : null}
      </g>
    );
  }
  if (f.pts) {
    const mid = f.pts[Math.floor(f.pts.length / 2)];
    return (
      <g opacity={f.o}>
        <path d={curve(f.pts, false)} pathLength={f.dash ? undefined : "1"} stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none"
          strokeDasharray={f.dash ? `${sw * 3} ${sw * 2.5}` : `${f2(f.d)} 1`} />
        {f.label ? <Label text={f.label} x={mid[0]} y={mid[1] - fs * 0.85} fs={fs * 0.9} width={labelWidth(f, k)} className="yl-shlabel" opacity={f.d} /> : null}
      </g>
    );
  }
  const [cx, cy] = f.c;
  const [w, h] = f.size;
  const inside = f.kind !== "dot" && f.kind !== "text";
  return (
    <g opacity={f.o} transform={`translate(${f2(cx)} ${f2(cy)}) scale(${f2(f.s)})`}>
      {f.kind !== "text" ? (
        <path d={outline(f.kind, f.size, f.i)} pathLength={f.dash ? undefined : "1"} stroke={color} strokeWidth={sw} strokeLinejoin="round"
          fill={f.fill ? color : "none"} fillOpacity={f.kind === "dot" ? f.d : 0.18 * f.d}
          strokeDasharray={f.dash ? `${sw * 3} ${sw * 2.5}` : f.d < 1 ? `${f2(f.d)} 1` : undefined} />
      ) : null}
      {f.label ? (
        <Label text={f.label} x={0} y={f.kind === "dot" ? h / 2 + fs * 0.25 : 0} top={f.kind === "dot"} fs={fs} width={labelWidth(f, k)}
          className={`yl-shlabel ${inside ? "sh-in" : ""}`} style={f.kind === "text" ? { fill: color } : undefined} />
      ) : null}
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
  const sw = 0.0075 * sc.w;
  const fs = sc.fs;
  const k = sc.fs / (LABEL * sc.w);
  const text = describe(sc);
  return (
    <div className="yl-block yl-shapes">
      {sc.title ? <div className="yl-shtitle">{sc.title}</div> : null}
      <svg viewBox={`0 0 ${sc.w} ${sc.h}`} role="img" aria-label={text} className="yl-shsvg"
        onClick={() => !reduce && setRun((n) => n + 1)}>
        {parts.map((f) => <Part key={f.i} f={f} sw={sw} fs={fs} k={k} />)}
      </svg>
      {sc.caption ? <p className="yl-shcap">{sc.caption}</p> : null}
    </div>
  );
}

export function Shapes({ g }) {
  const members = useMemo(() => g.members.filter((m) => !m.group && m.preset === "shape").map((m) => ({ id: m.id, props: m.props })),
    // Redraw when a member arrives (streaming) or changes (a patch).
    [JSON.stringify(g.members.map((m) => [m.id, m.props]))]); // eslint-disable-line react-hooks/exhaustive-deps
  return <Drawing head={g.group.props} members={members} />;
}

// A shape outside a shapes group is a one-part drawing.
export function LoneShape({ p, id }) {
  const members = useMemo(() => [{ id, props: p }], [id, JSON.stringify(p)]); // eslint-disable-line react-hooks/exhaustive-deps
  return <Drawing head={resolve("shapes", {})} members={members} />;
}
