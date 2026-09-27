"use client";
// The vector side of the lab: the rough-to-clean dial with its construction grid, the size
// ladder, the one-color test, the home screen, the napkin cat, and the live loops.
import { useEffect, useMemo, useRef, useState } from "react";
import { markPaths, markPieces, loopPath, VIEWBOX, YBOX, SPEC, ORDER, ease } from "../../lib/brand/mark.mjs";
import { posesAt, EAR_L, EAR_R, TAIL } from "../../lib/brand/motion.mjs";
import s from "./brand.module.css";

const Y = ["earL", "earR", "stem"];
const YVB = `${YBOX.x} ${YBOX.y} ${YBOX.w} ${YBOX.h}`;

export function Mark({ fill = "currentColor", only, opts = {}, className, title, style }) {
  const paths = useMemo(() => markPaths({ ...opts, only }), [JSON.stringify(opts), only && only.join()]);
  return (
    <svg viewBox={only ? YVB : VIEWBOX} className={className} style={style} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <g fill={fill}>{paths.map((p) => <path key={p.name} d={p.d} />)}</g>
    </svg>
  );
}

// ---------- the dial ----------
function Grid({ show }) {
  const { W, stemX, top, base, xh, earAngle, uX, uW, iX } = SPEC;
  const phi = (earAngle * Math.PI) / 180;
  const V = [stemX, top + W * 0.3];
  const ray = (side) => [V[0] + side * Math.sin(phi) * 520, V[1] - Math.cos(phi) * 520];
  const cap = (x, y) => <circle cx={x} cy={y} r={W / 2} />;
  return (
    <g className={s.grid} style={{ opacity: show }} aria-hidden="true">
      {[base, xh, top].map((y) => <line key={y} x1={-40} x2={1040} y1={y} y2={y} />)}
      {[ -1, 1 ].map((d) => { const e = ray(d); return <line key={d} x1={V[0]} y1={V[1]} x2={e[0]} y2={e[1]} strokeDasharray="6 8" />; })}
      <line x1={stemX} x2={stemX} y1={-40} y2={640} strokeDasharray="6 8" />
      {cap(stemX, top + W / 2)}
      {cap(uX + W / 2, xh + W / 2)}
      {cap(uX + uW - W / 2, xh + W / 2)}
      {cap(iX + W / 2, xh + W / 2)}
      <text x={-30} y={base - 8}>baseline</text>
      <text x={-30} y={xh - 8}>x-height</text>
      <text x={stemX + 70} y={top - 12}>{earAngle}°</text>
      <g className={s.gridW}>
        <line x1={stemX - W / 2} x2={stemX + W / 2} y1={base + 26} y2={base + 26} />
        <text x={stemX - 34} y={base + 48}>one stroke</text>
      </g>
    </g>
  );
}

export function MarkDial() {
  const [rough, setRough] = useState(1);
  const [grid, setGrid] = useState(true);
  const [round, setRound] = useState(0.5);
  const [playing, setPlaying] = useState(true);
  const raf = useRef(0);
  // On first view, the dial walks itself from the sketch to the clean cut once.
  useEffect(() => {
    if (!playing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setRough(0); setPlaying(false); return; }
    const t0 = performance.now();
    const step = (now) => {
      const u = Math.min(1, (now - t0) / 2600);
      setRough(1 - ease.inOut(u));
      if (u < 1) raf.current = requestAnimationFrame(step); else setPlaying(false);
    };
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { raf.current = requestAnimationFrame(step); io.disconnect(); } });
    io.observe(document.getElementById("dial"));
    return () => { io.disconnect(); cancelAnimationFrame(raf.current); };
  }, [playing]);
  const paths = markPaths({ rough, round });
  return (
    <div className={s.dial} id="dial">
      <svg viewBox={VIEWBOX} className={s.dialSvg} role="img" aria-label={`The Yui mark, ${Math.round(rough * 100)} percent sketch`}>
        <Grid show={grid ? Math.max(0, 1 - rough * 2) : 0} />
        <g className={s.dialInk}>{paths.map((p) => <path key={p.name} d={p.d} />)}</g>
      </svg>
      <div className={s.controls}>
        <label>
          <span>Sketch</span>
          <input type="range" min="0" max="1" step="0.01" value={1 - rough} onChange={(e) => { cancelAnimationFrame(raf.current); setPlaying(false); setRough(1 - Number(e.target.value)); }} aria-label="From the sketch to the clean mark" />
          <span>Clean</span>
        </label>
        <label>
          <span>Crisp</span>
          <input type="range" min="0" max="1" step="0.01" value={round} onChange={(e) => setRound(Number(e.target.value))} aria-label="Corner softness" />
          <span>Soft</span>
        </label>
        <label className={s.check}><input type="checkbox" checked={grid} onChange={(e) => setGrid(e.target.checked)} /> Show the grid</label>
      </div>
    </div>
  );
}

// ---------- sizes, one color, the icon ----------
export function Icon({ size, bg = "#1D1B20", fill = "#FFFFFF", opts = { rough: 0, round: 0.5 } }) {
  return (
    <span className={s.icon} style={{ width: size, height: size, background: bg, borderRadius: size * 0.225 }}>
      <Mark only={Y} fill={fill} opts={opts} style={{ width: "72%", height: "72%" }} />
    </span>
  );
}

export function SizeLadder() {
  const sizes = [180, 120, 76, 60, 40, 29, 16];
  return (
    <div className={s.ladder}>
      <div className={s.ladderRow}>
        {sizes.map((n) => (
          <figure key={n}><Icon size={n} /><figcaption>{n}</figcaption></figure>
        ))}
      </div>
      <div className={s.ladderRow}>
        {[96, 48, 24, 16].map((h) => (
          <figure key={h}><Mark fill="var(--ink)" opts={{ rough: 0 }} style={{ height: h, width: "auto" }} /><figcaption>{h} px tall</figcaption></figure>
        ))}
      </div>
    </div>
  );
}

export function OneColor() {
  const tiles = [["#FFFFFF", "#1D1B20"], ["#1D1B20", "#FFFFFF"], ["#FFF9F0", "#FF7E8A"], ["#E5DED4", "#9E6153"], ["#2D4E8A", "#F3EDE1"], ["#EDE6DA", "#9A6E58"]];
  return (
    <div className={s.oneColor}>
      {tiles.map(([bg, fg]) => (
        <div key={bg + fg} style={{ background: bg }}><Mark fill={fg} opts={{ rough: 0 }} /></div>
      ))}
    </div>
  );
}

const APPS = ["#FFB4A2", "#B5E2FA", "#FDE68A", "#C4B5FD", "#A7F3D0", "#FBCFE8", "#FCA5A5", "#BAE6FD", "#D9F99D", "#E9D5FF", "#FED7AA", "#99F6E4", "#F5D0FE", "#BFDBFE", "#FEF08A", "#DDD6FE", "#FECACA", "#C7D2FE", "#BBF7D0", "#FDE68A"];
export function HomeScreen({ bg = "#1D1B20" }) {
  return (
    <div className={s.home} aria-label="The Yui icon on a phone's home screen" role="img">
      <div className={s.homeGrid}>
        {APPS.map((c, i) => i === 9 ? (
          <span key={i} className={s.homeApp}><Icon size={52} bg={bg} /><i>Yui</i></span>
        ) : (
          <span key={i} className={s.homeApp}><span className={s.fake} style={{ background: c }}><b style={{ borderRadius: i % 3 === 0 ? "50%" : i % 3 === 1 ? "4px" : "0 50% 50% 50%" }} /></span><i>&nbsp;</i></span>
        ))}
      </div>
    </div>
  );
}

// ---------- live loops (splash, loading, idle) ----------
export function Loop({ kind, fill = "#1D1B20", bg = "#FFFFFF", label }) {
  const ref = useRef(null);
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const paths = [...svg.querySelectorAll("path")];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, on = false;
    const t0 = performance.now();
    const draw = (now) => {
      const t = reduce ? 0 : (now - t0) / 1000;
      const { pose, fade } = posesAt(kind, reduce ? 10 : t);
      const pcs = markPieces({ rough: 0, round: 0.5, pose: reduce ? undefined : pose });
      ORDER.forEach((n, i) => paths[i].setAttribute("d", loopPath(pcs[n].pts)));
      svg.style.opacity = fade;
      if (on && !reduce) raf = requestAnimationFrame(draw);
    };
    const io = new IntersectionObserver(([e]) => { on = e.isIntersecting; cancelAnimationFrame(raf); if (on || reduce) raf = requestAnimationFrame(draw); });
    io.observe(svg);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [kind]);
  return (
    <figure className={s.loop} style={{ background: bg }}>
      <svg ref={ref} viewBox={VIEWBOX} role="img" aria-label={label}>
        <g fill={fill}>{ORDER.map((n) => <path key={n} />)}</g>
      </svg>
      <figcaption>{label}</figcaption>
    </figure>
  );
}

// ---------- the napkin ----------
export function Napkin() {
  const [wink, setWink] = useState(0);
  const pose = wink ? { earL: { rot: -10, origin: EAR_L }, earR: { rot: 7, origin: EAR_R }, iBody: { rot: 9, origin: TAIL }, iDot: { rot: 9, origin: TAIL } } : {};
  return (
    <button type="button" className={s.napkin} onPointerEnter={() => setWink(1)} onPointerLeave={() => setWink(0)} onClick={() => setWink((w) => 1 - w)} aria-label="A napkin sketch: the Y as a cat's face, the u its body, the i its tail">
      <svg viewBox={VIEWBOX} aria-hidden="true">
        <g className={s.napkinInk}>{markPaths({ rough: 0.55, tear: 0.5, seed: 9, pose }).map((p) => <path key={p.name} d={p.d} />)}</g>
        <g className={s.napkinPen}>
          <path d="M226 384 l-96 -16 M226 404 l-98 4 M406 384 l68 -12 M406 404 l70 2" />
          <circle cx="272" cy="352" r="9" /><circle cx="360" cy="352" r="9" />
        </g>
      </svg>
      <span>napkin idea: ears, body, tail</span>
    </button>
  );
}
