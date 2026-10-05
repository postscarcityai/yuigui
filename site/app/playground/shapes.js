"use client";

// shapes (YUI-104): a small diagram that moves. Circles, boxes, pills, dots,
// blobs, labels, lines, arrows and paths from `shape` lines, laid out and
// timed by lib/yl/shapes.mjs, drawn as SVG and stepped with
// requestAnimationFrame until the last part lands (a pulse keeps breathing).
// Reduce Motion draws the final still. A tap on the drawing plays it again.
// Sends nothing.
import { useEffect, useMemo, useRef, useState } from "react";
import { resolve } from "../../lib/yl/yl.mjs";
import { HAND, LABEL, OVERLAP, TICK, along, blobPoints, bracketPoints, control, describe, frame, handOutline, labelWidth, ringPoints, rough, scene, smooth, wrap } from "../../lib/yl/shapes.mjs";

const TONE = {
  accent: "var(--accent)", mint: "var(--yl-c3)", lavender: "var(--yl-c1)",
  butter: "var(--yl-c4)", ink: "var(--yl-ink)", mute: "var(--yl-ink2)",
};

const f2 = (n) => Math.round(n * 1000) / 1000;
const P = ([x, y]) => `${f2(x)} ${f2(y)}`;
const poly = (pts, closed) => `M${P(pts[0])}` + pts.slice(1).map((q) => `L${P(q)}`).join("") + (closed ? "Z" : "");
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

function Part({ f, sw, fs, k, W }) {
  const color = TONE[f.tone];
  if (f.o <= 0) return null;
  if (f.mark) {
    // A hand drawn mark: the points come from the scene, the stroke draws on.
    const sharp = f.mark === "check" || f.fill;
    return (
      <g opacity={f.o} className="sh-mark">
        <path d={sharp ? poly(f.pts, false) : curve(f.pts, false)} pathLength="1" stroke={color} strokeWidth={sw * (f.fill ? 1.1 : 1.3)}
          strokeLinecap="round" strokeLinejoin="round" fill="none" strokeOpacity={f.fill ? 0.55 : 1} strokeDasharray={`${f2(f.d)} 1`} />
      </g>
    );
  }
  if (f.a && !f.c) {
    // line, arrow, arc or bracket
    const dash = f.dash ? `${sw * 3} ${sw * 2.5}` : undefined;
    if (f.kind === "bracket") {
      const { pts, n } = bracketPoints(f.a, f.b, f.side, TICK * (sw / 0.075) * 1.0);
      // The label sits beyond the spine, clear of it by half its own width when the bracket runs up and down.
      const off = fs * 0.9 + Math.abs(n[0]) * (String(f.label || "").length * 0.56 * fs * 0.9) / 2;
      const mid = [(f.a[0] + f.b[0]) / 2 - n[0] * off, (f.a[1] + f.b[1]) / 2 - n[1] * off];
      return (
        <g opacity={f.o}>
          <path d={poly(pts, false)} pathLength="1" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray={f.dash ? dash : `${f2(f.d)} 1`} />
          {f.label ? <Label text={f.label} x={mid[0]} y={mid[1]} fs={fs * 0.9} width={labelWidth(f, k)} className="yl-shlabel" opacity={f.d} /> : null}
        </g>
      );
    }
    const [ax, ay] = f.a, [bx, by] = f.b;
    const c = control(f.a, f.b, f.bend || 0);
    // Cut the curve at the part drawn so far: the arrowhead rides the tip.
    const cut = along(f.a, c, f.b, f.d);
    const dl = Math.hypot(cut.dir[0], cut.dir[1]) || 1;
    const ux = cut.dir[0] / dl, uy = cut.dir[1] / dl;
    const [hx, hy] = cut.tip;
    const hk = 0.34 * (sw / 0.07), s = Math.sin(0.5), co = Math.cos(0.5);
    const head = (f.kind === "arrow" || f.kind === "arc") && f.d > 0.05
      ? `M${P([hx - hk * (ux * co - uy * s), hy - hk * (uy * co + ux * s)])}L${P([hx, hy])}L${P([hx - hk * (ux * co + uy * s), hy - hk * (uy * co - ux * s)])}`
      : null;
    const mid = along(f.a, c, f.b, 0.5).tip;
    return (
      <g opacity={f.o}>
        {f.hand ? (
          <path d={curve(rough(Array.from({ length: 13 }, (_, j) => along(f.a, c, f.b, j / 12).tip), f.i, HAND * W, false, Infinity), false)} pathLength={f.dash ? undefined : "1"} stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" strokeDasharray={f.dash ? dash : `${f2(f.d)} 1`} />
        ) : (
          <path d={`M${P(f.a)}Q${P(cut.q0)} ${P(cut.tip)}`} stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" strokeDasharray={dash} />
        )}
        {head ? <path d={head} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none" /> : null}
        {f.label ? <Label text={f.label} x={mid[0]} y={mid[1] - fs * 0.75} fs={fs * 0.9} width={labelWidth(f, k)} className="yl-shlabel" opacity={f.d} /> : null}
      </g>
    );
  }
  if (f.pts) {
    const mid = f.pts[Math.floor(f.pts.length / 2)];
    const pts = f.hand ? rough(f.pts, f.i, HAND * W, !!f.close) : f.pts;
    const d = f.close ? (f.sharp ? poly(pts, true) : curve(pts, true)) : f.sharp ? poly(pts, false) : curve(pts, false);
    return (
      <g opacity={f.o} className={f.blend ? "sh-blend" : undefined}>
        <path d={d} pathLength={f.dash ? undefined : "1"} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
          fill={f.close && f.fill ? color : "none"} fillOpacity={(f.blend ? OVERLAP : 0.18) * f.d}
          strokeDasharray={f.dash ? `${sw * 3} ${sw * 2.5}` : `${f2(f.d)} 1`} />
        {f.label ? <Label text={f.label} x={mid[0]} y={mid[1] - fs * 0.85} fs={fs * 0.9} width={labelWidth(f, k)} className="yl-shlabel" opacity={f.d} /> : null}
      </g>
    );
  }
  const [cx, cy] = f.c;
  const [w, h] = f.size;
  const inside = f.kind !== "dot" && f.kind !== "text" && f.kind !== "contour";
  const leader = f.leader && f.a && f.b ? (
    <g opacity={f.o}>
      <path d={`M${P(f.a)}L${P(f.b)}`} stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" strokeDasharray={f.dash ? `${sw * 3} ${sw * 2.5}` : undefined} />
      <circle cx={f2(f.b[0])} cy={f2(f.b[1])} r={f2(sw * 1.6)} fill={color} />
    </g>
  ) : null;
  if (f.kind === "contour") {
    // Nested closed rings from the centre out; each draws on in turn.
    const n = f.rings;
    return (
      <g opacity={f.o} transform={`translate(${f2(cx)} ${f2(cy)}) scale(${f2(f.s)})`} className={f.blend ? "sh-blend" : undefined}>
        {Array.from({ length: n }, (_, r) => {
          const k2 = Math.min(1, Math.max(0, f.d * n - r));
          return k2 > 0 ? (
            <path key={r} d={curve(ringPoints(w, h, f.i, r, n), true)} pathLength="1" stroke={color} strokeWidth={sw} strokeLinejoin="round"
              strokeOpacity={0.45 + 0.55 * ((r + 1) / n)} fill={f.fill ? color : "none"} fillOpacity={0.1 * k2}
              strokeDasharray={f.dash ? `${sw * 3} ${sw * 2.5}` : k2 < 1 ? `${f2(k2)} 1` : undefined} />
          ) : null;
        })}
        {f.label ? <Label text={f.label} x={0} y={0} fs={fs} width={labelWidth(f, k)} className="yl-shlabel" opacity={f.d} /> : null}
      </g>
    );
  }
  return (
    <>
    {leader}
    <g opacity={f.o} transform={`translate(${f2(cx)} ${f2(cy)}) scale(${f2(f.s)})`} className={f.blend ? "sh-blend" : undefined}>
      {f.kind !== "text" ? (
        <path d={f.hand ? curve(handOutline(f.kind, f.size, f.i, HAND * W).pts, true) : outline(f.kind, f.size, f.i)} pathLength={f.dash ? undefined : "1"} stroke={color} strokeWidth={sw} strokeLinejoin="round"
          fill={f.fill ? color : "none"} fillOpacity={f.kind === "dot" ? f.d : (f.blend ? OVERLAP : 0.18) * f.d}
          strokeDasharray={f.dash ? `${sw * 3} ${sw * 2.5}` : f.d < 1 ? `${f2(f.d)} 1` : undefined} />
      ) : null}
      {f.label ? (
        <Label text={f.label} x={0} y={f.kind === "dot" ? h / 2 + fs * 0.25 : 0} top={f.kind === "dot"} fs={fs} width={labelWidth(f, k)}
          className={`yl-shlabel ${inside ? "sh-in" : ""}`} style={f.kind === "text" ? { fill: color } : undefined} />
      ) : null}
    </g>
    </>
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
        {parts.map((f) => <Part key={f.i} f={f} sw={sw} fs={fs} k={k} W={sc.w} />)}
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
