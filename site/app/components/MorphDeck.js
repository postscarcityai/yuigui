"use client";
// A deck on the stage (YUI-307), the web twin of the app's MorphStage. No card, no border, no dots, no
// arrows: the drawing fills the stage edge to edge and the words are one big line under it. A swipe scrubs
// the drawing from this page's shapes into the next page's (lib/web/deckmorph.mjs): the same shape slides,
// grows, recolours and changes outline as the finger moves, and springs to the page on release; new shapes
// draw on, old ones dissolve, labels retype. At rest the drawing breathes. Reduce Motion cross-fades.
// Two clear zones turn the page: the left third goes back (YUI-288), the rest goes on. Pages whose picture
// is not `shapes` (a chart, a calc, a sketch) ride the same swipe with their own renderer.
import { useCallback, useEffect, useRef, useState } from "react";
import { clamp, drawing, scrubTo, settle } from "../../lib/web/deckmorph.mjs";
import { wrap } from "../../lib/yl/shapes.mjs";
import { RichText } from "../playground/richtext";
import "./morphdeck.css";

const PAD = 22;
const ENTRANCE = 1.4; // seconds the first page takes to draw itself on
const OWN = "input, textarea, select, [role=slider], canvas, .yl-map, .yl-keys, .yl-drums, .yl-pad, .yl-loop, .yl-game, [data-own-drag]";
const TONE = { accent: "var(--accent)", mint: "var(--md-mint)", lavender: "var(--md-lavender)", butter: "var(--md-butter)", ink: "var(--md-ink)", mute: "var(--md-mute)" };
const f2 = (n) => Math.round(n * 100) / 100;

function useReduced() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setR(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return r;
}

const colorOf = (i) => (i.mix <= 0 ? TONE[i.toneA] : i.mix >= 1 ? TONE[i.toneB] : `color-mix(in srgb, ${TONE[i.toneA]} ${f2((1 - i.mix) * 100)}%, ${TONE[i.toneB]} ${f2(i.mix * 100)}%)`);

function Ink({ i }) {
  const color = colorOf(i);
  const lw = Math.max(1.5, i.lw * 1.35);
  const d = i.pts.length > 1 ? `M${i.pts.map((p) => `${f2(p[0])} ${f2(p[1])}`).join("L")}${i.closed ? "Z" : ""}` : "";
  let head = null;
  if (i.head > 0.05 && !i.closed && i.trim > 0.05 && i.pts.length > 2) {
    const n = i.pts.length;
    const k = Math.max(1, Math.min(n - 1, Math.round((n - 1) * i.trim)));
    const tip = i.pts[k], back = i.pts[Math.max(0, k - 2)];
    const dx = tip[0] - back[0], dy = tip[1] - back[1];
    const len = Math.max(Math.hypot(dx, dy), 1e-9), ux = dx / len, uy = dy / len;
    const hk = lw * 4.2, sn = Math.sin(0.5), cs = Math.cos(0.5);
    head = `M${f2(tip[0] - hk * (ux * cs - uy * sn))} ${f2(tip[1] - hk * (uy * cs + ux * sn))}L${f2(tip[0])} ${f2(tip[1])}L${f2(tip[0] - hk * (ux * cs + uy * sn))} ${f2(tip[1] - hk * (uy * cs - ux * sn))}`;
  }
  const lines = i.label && i.labelOpacity > 0.001 && i.fs > 1 ? wrap(i.label, Math.max(i.labelWidth, i.fs * 3), i.fs) : [];
  const lh = i.fs * 1.15;
  const y0 = i.labelAt[1] - ((lines.length - 1) * lh) / 2;
  return (
    <g opacity={i.opacity} data-ink={i.key}>
      {d ? (
        <path d={d} pathLength={i.dash ? undefined : 1} fill={i.closed && i.fill > 0.001 ? color : "none"} fillOpacity={i.fill}
          stroke={i.dot ? "none" : color} strokeWidth={f2(lw)} strokeLinecap="round" strokeLinejoin="round" style={{ stroke: i.dot ? "none" : color, fill: i.closed && i.fill > 0.001 ? color : "none" }}
          strokeDasharray={i.dash ? `${f2(lw * 3)} ${f2(lw * 2.5)}` : i.trim < 0.999 ? `${f2(i.trim * 1000) / 1000} 1` : undefined} />
      ) : null}
      {head ? <path d={head} fill="none" strokeWidth={f2(lw)} strokeLinecap="round" strokeLinejoin="round" opacity={i.head} style={{ stroke: color }} /> : null}
      {lines.length ? (
        <text fontSize={f2(i.fs)} textAnchor="middle" dominantBaseline="central" opacity={i.labelOpacity}
          className={`md-label${i.inside || !i.pts.length ? " heavy" : ""}`} style={i.pts.length ? undefined : { fill: color }}>
          {lines.map((l, k) => <tspan key={k} x={f2(i.labelAt[0])} y={f2(y0 + k * lh)}>{l}</tspan>)}
        </text>
      ) : null}
    </g>
  );
}

/** pages: deckOf()'s pages. renderPic(page): the page's own picture when it is not `shapes`. */
export default function MorphDeck({ pages, title, active = true, onPage, onEdge, renderPic }) {
  const n = pages.length;
  const reduced = useReduced();
  const box = useRef(null);
  const art = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [frame, setFrame] = useState({ pos: 0, time: 0 });
  const [page, setPage] = useState(0);
  const st = useRef({ pos: 0, target: 0, drag: null, opened: 0, swipedAt: 0, raf: 0 }).current;
  const loop = useRef(null);

  useEffect(() => {
    if (!art.current || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(art.current);
    return () => ro.disconnect();
  }, []);

  // One animation loop: the spring toward the target page, and the breathing. Reduce Motion runs it only while moving.
  const kick = useCallback(() => { if (!st.raf) st.raf = requestAnimationFrame(loop.current); }, [st]);
  useEffect(() => {
    st.opened = performance.now();
    let last = st.opened;
    loop.current = (now) => {
      st.raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!st.drag) {
        const d = st.target - st.pos;
        st.pos = Math.abs(d) > 0.0005 ? st.pos + d * (1 - Math.exp(-dt * (reduced ? 14 : 7))) : st.target;
      }
      setFrame({ pos: st.pos, time: (now - st.opened) / 1000 });
      if (!reduced || st.drag || st.pos !== st.target) st.raf = requestAnimationFrame(loop.current);
    };
    kick();
    return () => { cancelAnimationFrame(st.raf); st.raf = 0; };
  }, [reduced, kick, st]);

  const go = useCallback((to) => {
    const i = clamp(to, 0, n - 1);
    st.target = i;
    setPage(i);
    onPage?.(i);
    kick();
  }, [n, st, kick, onPage]);

  const onDown = (e) => {
    if (e.button || e.target.closest?.(OWN)) return;
    st.drag = { x: e.clientX, p: st.pos, moved: false, hist: [[e.clientX, performance.now()]] };
  };
  const onMove = (e) => {
    const d = st.drag;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 8) { d.moved = true; try { box.current.setPointerCapture(e.pointerId); } catch {} }
    if (!d.moved) return;
    st.pos = scrubTo(d.p, dx, box.current.clientWidth, n);
    d.hist.push([e.clientX, performance.now()]);
    kick();
  };
  const onUp = () => {
    const d = st.drag;
    st.drag = null;
    if (!d?.moved) return;
    st.swipedAt = performance.now();
    const now = performance.now();
    const old = d.hist.find(([, t]) => now - t < 120) || d.hist[d.hist.length - 1];
    const last = d.hist[d.hist.length - 1];
    const v = last[1] > old[1] ? ((last[0] - old[0]) / (last[1] - old[1])) * 1000 : 0;
    go(settle(st.pos, v, box.current.clientWidth, n));
  };
  const turn = (to) => { if (performance.now() - st.swipedAt > 80) go(to); };

  // The arrow keys turn pages when nobody is typing; past the last page, right goes on to the chat's pages.
  useEffect(() => {
    if (!active) return undefined;
    const onKey = (e) => {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName || "") || e.target?.isContentEditable) return;
      if (e.key === "ArrowRight") { if (page >= n - 1) onEdge?.(1); else go(page + 1); }
      else if (e.key === "ArrowLeft") go(page - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, page, n, go, onEdge]);

  const w = Math.max(0, size.w - 2 * PAD), h = Math.max(0, size.h - 2 * PAD);
  const enter = reduced ? 1 : clamp(frame.time / ENTRANCE, 0, 1);
  const inks = drawing(pages, frame.pos, w, h, { time: frame.time, still: reduced, enter });
  const here = Math.round(frame.pos);
  return (
    <div className="md-deck" ref={box} data-testid="deck-stage" data-own-drag aria-roledescription="deck" aria-label={title || "Deck"}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
      <div className="md-art" ref={art}>
        <svg className="md-svg" width={size.w} height={size.h} viewBox={`0 0 ${size.w || 1} ${size.h || 1}`} aria-hidden="true" data-testid="deck-drawing">
          <g transform={`translate(${PAD} ${PAD})`}>{inks.map((i) => <Ink key={i.key} i={i} />)}</g>
        </svg>
        {pages.map((p, i) => (p.pic ? (
          <div key={p.key} className="md-pic" data-on={i === here ? "1" : undefined} inert={i !== here || undefined} aria-hidden={i !== here}
            style={{ opacity: clamp(1 - Math.abs(frame.pos - i) * 1.7, 0, 1) }}>{renderPic?.(p)}</div>
        ) : null))}
      </div>
      <div className="md-words">
        {pages.map((p, i) => {
          const off = i - frame.pos, dist = Math.min(Math.abs(off), 1);
          return (
            <div key={p.key} className="md-page" data-on={i === here ? "1" : undefined} aria-hidden={i !== here} inert={i !== here || undefined}
              style={{ opacity: 1 - Math.min(dist * 1.7, 1), transform: `translateX(${f2(off * 45)}%)`, filter: dist > 0.02 ? `blur(${f2(dist * 8)}px)` : undefined }}>
              {p.title ? <div className="ys-line md-title" data-testid={i === here ? "deck-title" : undefined}><RichText text={p.title} /></div> : null}
              {p.body ? <div className="ys-body"><RichText text={p.body} /></div> : null}
              {p.points.length ? <ul className="ys-points">{p.points.map((t, k) => <li key={k}>{t}</li>)}</ul> : null}
            </div>
          );
        })}
      </div>
      <div className="md-turn" aria-hidden={false}>
        <button type="button" className="md-turn-back" aria-label="Previous page" title="Previous page" disabled={page <= 0} onClick={() => turn(page - 1)} />
        <button type="button" className="md-turn-next" aria-label="Next page" title="Next page" disabled={page >= n - 1} onClick={() => turn(page + 1)} />
      </div>
      <span className="yl-sr" role="status">Page {here + 1} of {n}</span>
    </div>
  );
}
