"use client";

// A crew member's own quiet visualizer on /crew (SITE-101, parity for YUI-180). The same shader, plan and
// colors the playground and the app draw (lib/visual/shaders.mjs, lib/yl/visual.mjs), at the member's
// default from CREW_VISUALS: dimmed, slow, idle motion only. No mic is ever asked; `hears` is a label.
// It draws only while on screen (IntersectionObserver), Reduce Motion gets one still frame, and with no
// WebGL the card keeps the CSS pattern it had (the .look-* band underneath).

import { useEffect, useRef, useState } from "react";
import { CREW_VISUALS, follow, shown as stepped, stageVisual, visualPlan } from "../../lib/yl/visual.mjs";
import { VERTEX, fragment, vec3 } from "../../lib/visual/shaders.mjs";

const THEMES = { yui: { name: "yui" }, arnold: { name: "honey" }, basil: { name: "mint" }, gouda: { name: "lavender" }, penny: { name: "honey" }, quill: { name: "lavender" } };
function useFlag(query, attr) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (query) {
      const m = window.matchMedia(query);
      const f = () => setOn(m.matches);
      f();
      m.addEventListener("change", f);
      return () => m.removeEventListener("change", f);
    }
    const el = document.documentElement;
    const f = () => setOn(el.getAttribute(attr) === "dark");
    f();
    const mo = new MutationObserver(f);
    mo.observe(el, { attributes: true, attributeFilter: [attr] });
    return () => mo.disconnect();
  }, [query, attr]);
  return on;
}

export default function CrewVisual({ handle }) {
  const wrap = useRef(null);
  const canvas = useRef(null);
  const dark = useFlag(null, "data-theme");
  const reduced = useFlag("(prefers-reduced-motion: reduce)");
  const [ok, setOk] = useState(true);
  const def = CREW_VISUALS[handle];
  const plan = def ? visualPlan(stageVisual(def), { theme: THEMES[handle] || {}, dark, reduced }) : null;
  const live = useRef(plan);
  live.current = plan;
  const look = plan?.look;

  useEffect(() => {
    const cv = canvas.current;
    if (!look || !cv) return undefined;
    const g = cv.getContext("webgl", { antialias: false, preserveDrawingBuffer: true }) || cv.getContext("experimental-webgl");
    if (!g) { setOk(false); return undefined; }
    let prog;
    try {
      const compile = (type, src) => {
        const s = g.createShader(type);
        g.shaderSource(s, src);
        g.compileShader(s);
        if (!g.getShaderParameter(s, g.COMPILE_STATUS)) throw new Error(g.getShaderInfoLog(s));
        return s;
      };
      prog = g.createProgram();
      g.attachShader(prog, compile(g.VERTEX_SHADER, VERTEX));
      g.attachShader(prog, compile(g.FRAGMENT_SHADER, fragment(look)));
      g.linkProgram(prog);
      if (!g.getProgramParameter(prog, g.LINK_STATUS)) throw new Error(g.getProgramInfoLog(prog));
    } catch {
      setOk(false);
      return undefined;
    }
    g.useProgram(prog);
    const buf = g.createBuffer();
    g.bindBuffer(g.ARRAY_BUFFER, buf);
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), g.STATIC_DRAW);
    const loc = g.getAttribLocation(prog, "p");
    g.enableVertexAttribArray(loc);
    g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
    const U = Object.fromEntries(["res", "time", "level", "dim", "scrim", "zone", "a", "b", "c", "ground"].map((n) => [n, g.getUniformLocation(prog, `u_${n}`)]));

    let raf = 0, last = 0, clock = 3 + Math.random() * 20, level = 0, seen = "";
    const frame = (now) => {
      raf = 0;
      const p = live.current;
      const key = p.still ? JSON.stringify([p.colors, p.dim]) : "";
      const dt = last ? now - last : 16;
      if (p.still && seen === key) return;
      if (!p.still) {
        raf = requestAnimationFrame(frame);
        if (last && dt < 1000 / p.idleFps - 2) return;
      }
      last = now;
      const dpr = Math.min(2, window.devicePixelRatio || 1) * p.scale;
      const w = Math.max(1, Math.round(cv.clientWidth * dpr)), h = Math.max(1, Math.round(cv.clientHeight * dpr));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      g.viewport(0, 0, w, h);
      if (p.still) { clock = 8; level = 0; } else { clock += (Math.min(dt, 100) / 1000) * p.speed; level = follow(level, 0, dt, p.env); }
      g.uniform2f(U.res, w, h);
      g.uniform1f(U.time, clock);
      g.uniform1f(U.level, stepped(level, p.env));
      g.uniform1f(U.dim, p.dim);
      g.uniform1f(U.scrim, 0);
      g.uniform2f(U.zone, p.zone[0], p.zone[1]);
      g.uniform3fv(U.a, vec3(p.colors.a));
      g.uniform3fv(U.b, vec3(p.colors.b));
      g.uniform3fv(U.c, vec3(p.colors.c));
      g.uniform3fv(U.ground, vec3(p.colors.ground));
      g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
      seen = key;
    };
    const start = () => { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } };
    const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };
    const io = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { rootMargin: "80px" });
    if (io) io.observe(wrap.current); else start();
    // Reduce Motion and the theme flip redraw the still frame.
    const redraw = () => { seen = ""; if (!raf) start(); };
    cv.addEventListener("yui-redraw", redraw);
    return () => { stop(); io?.disconnect(); cv.removeEventListener("yui-redraw", redraw); g.deleteProgram(prog); g.deleteBuffer(buf); };
  }, [look]);

  // A changed appearance or Reduce Motion needs one more still frame.
  useEffect(() => { canvas.current?.dispatchEvent(new Event("yui-redraw")); }, [dark, reduced]);

  if (!plan) return null;
  return (
    <div ref={wrap} className="crew-viz" data-look={plan.look} data-still={plan.still ? "on" : undefined} aria-hidden="true">
      {ok ? <canvas ref={canvas} /> : null}
    </div>
  );
}
