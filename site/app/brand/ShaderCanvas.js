"use client";
// One live material from lib/brand/shaders.mjs, drawn only while it is on screen.
// scene(t, mouse) returns { mark, place, pieceColors, p, q, colors } for time t in seconds.
// Reduced motion draws one settled frame (scene at `still`). No WebGL: the static SVG mark.
import { useEffect, useRef, useState } from "react";
import { brandStage } from "../../lib/brand/gl.mjs";
import { markSvg } from "../../lib/brand/mark.mjs";
import s from "./brand.module.css";

export default function ShaderCanvas({ shader, scene, still = 6, aspect = "16 / 9", label, restartKey = 0, fallback }) {
  const box = useRef(null);
  const cv = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = box.current, canvas = cv.current;
    if (!el || !canvas) return;
    let st;
    try { st = brandStage(canvas, shader); } catch (e) { console.warn(e); }
    if (!st) { setFailed(true); return; }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, visible = false, t0 = performance.now(), markKey = "";
    const mouse = [0.5, 0.5];
    let mouseAt = 0;
    const size = () => {
      const r = el.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      if (st.resize(Math.round(r.width * dpr), Math.round(r.height * dpr))) markKey = "";
    };
    const frame = (now) => {
      const t = reduce ? still : (now - t0) / 1000;
      const sc = scene(t, now - mouseAt < 2500 ? mouse : null);
      const k = JSON.stringify([sc.mark, sc.place, sc.pieceColors]);
      if (k !== markKey) { st.setMark(sc.mark, sc.place, sc.pieceColors); markKey = k; }
      st.draw(t, { p: sc.p, q: sc.q, mouse: sc.mouse || mouse, colors: sc.colors });
      if (visible && !reduce) raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([e]) => {
      const was = visible;
      visible = e.isIntersecting;
      if (visible && !was) { size(); cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); }
      if (!visible) cancelAnimationFrame(raf);
    }, { rootMargin: "100px" });
    io.observe(el);
    const ro = new ResizeObserver(() => { size(); if (!visible || reduce) requestAnimationFrame(frame); });
    ro.observe(el);
    const move = (e) => {
      const r = el.getBoundingClientRect();
      mouse[0] = (e.clientX - r.left) / r.width;
      mouse[1] = 1 - (e.clientY - r.top) / r.height;
      mouseAt = performance.now();
      if (reduce) requestAnimationFrame(frame);
    };
    el.addEventListener("pointermove", move);
    return () => { io.disconnect(); ro.disconnect(); cancelAnimationFrame(raf); el.removeEventListener("pointermove", move); st.destroy(); };
  }, [shader, scene, still, restartKey]);

  return (
    <div ref={box} className={s.stage} style={{ aspectRatio: aspect }} role="img" aria-label={label}>
      {failed ? (
        <div className={s.stageFallback} dangerouslySetInnerHTML={{ __html: fallback || markSvg({ rough: 0 }) }} />
      ) : (
        <canvas ref={cv} className={s.canvas} />
      )}
    </div>
  );
}
