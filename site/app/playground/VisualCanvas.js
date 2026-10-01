"use client";

// The shader canvas (YUI-124 step 1), shared by the playground's visual demo and the web stage
// (YUI-257): one WebGL canvas that follows a visualPlan and a level reader.

import { useEffect, useRef, useState } from "react";
import { follow, shown as stepped } from "../../lib/yl/visual.mjs";
import { VERTEX, fragment, vec3 } from "../../lib/visual/shaders.mjs";
import "./visualizer.css";

// ---------- the canvas ----------

// One WebGL canvas. It recompiles when the look changes, draws at the plan's
// fps (0: one still frame) and half resolution, and follows the level with
// the look's envelope. With no WebGL it draws a soft gradient in the colors.
export function VisualCanvas({ plan, read, meter: showMeter = true }) {
  const canvas = useRef(null);
  const live = useRef({ plan, read });
  live.current = { plan, read };
  const [gl, setGl] = useState(true);
  const [meter, setMeter] = useState(0);

  useEffect(() => {
    const cv = canvas.current;
    const g = cv && (cv.getContext("webgl", { antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: true }) || cv.getContext("experimental-webgl"));
    if (!g) { setGl(false); return undefined; }
    const compile = (type, src) => {
      const s = g.createShader(type);
      g.shaderSource(s, src);
      g.compileShader(s);
      if (!g.getShaderParameter(s, g.COMPILE_STATUS)) throw new Error(g.getShaderInfoLog(s));
      return s;
    };
    let prog;
    try {
      prog = g.createProgram();
      g.attachShader(prog, compile(g.VERTEX_SHADER, VERTEX));
      g.attachShader(prog, compile(g.FRAGMENT_SHADER, fragment(plan.look)));
      g.linkProgram(prog);
      if (!g.getProgramParameter(prog, g.LINK_STATUS)) throw new Error(g.getProgramInfoLog(prog));
    } catch (e) {
      console.warn("visual shader:", e.message);
      setGl(false);
      return undefined;
    }
    g.useProgram(prog);
    const buf = g.createBuffer();
    g.bindBuffer(g.ARRAY_BUFFER, buf);
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), g.STATIC_DRAW);
    const loc = g.getAttribLocation(prog, "p");
    g.enableVertexAttribArray(loc);
    g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
    const u = (n) => g.getUniformLocation(prog, n);
    const U = { res: u("u_res"), time: u("u_time"), level: u("u_level"), dim: u("u_dim"), scrim: u("u_scrim"), zone: u("u_zone"), a: u("u_a"), b: u("u_b"), c: u("u_c"), ground: u("u_ground") };

    let raf = 0, last = 0, clock = 0, level = 0, shown = 0, drewStill = "";
    const draw = (now) => {
      raf = requestAnimationFrame(draw);
      const { plan: p, read: rd } = live.current;
      const stillKey = p.still ? JSON.stringify([p.colors, p.scrim, p.dim]) : "";
      if (p.still && drewStill === stillKey) return;
      const dt = last ? now - last : 16;
      const fps = p.quiet && level < 0.02 ? p.idleFps : p.fps; // a default idles at 15
      if (!p.still && fps && last && dt < 1000 / fps - 2) return;
      last = now;
      const dpr = Math.min(2, window.devicePixelRatio || 1) * p.scale;
      const w = Math.max(1, Math.round(cv.clientWidth * dpr)), h = Math.max(1, Math.round(cv.clientHeight * dpr));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      g.viewport(0, 0, w, h);
      if (p.still) { clock = 8; level = 0; } else { clock += (Math.min(dt, 100) / 1000) * p.speed; level = follow(level, rd(), dt, p.env); }
      g.uniform2f(U.res, w, h);
      g.uniform1f(U.time, clock);
      g.uniform1f(U.level, stepped(level, p.env));
      g.uniform1f(U.dim, p.dim);
      g.uniform1f(U.scrim, p.scrim);
      g.uniform2f(U.zone, p.zone[0], p.zone[1]);
      g.uniform3fv(U.a, vec3(p.colors.a));
      g.uniform3fv(U.b, vec3(p.colors.b));
      g.uniform3fv(U.c, vec3(p.colors.c));
      g.uniform3fv(U.ground, vec3(p.colors.ground));
      g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
      drewStill = stillKey;
      if (showMeter && now - shown > 120) { shown = now; setMeter(level); }
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); g.deleteProgram(prog); g.deleteBuffer(buf); };
  }, [plan.look]);

  const { a, b, c, ground } = plan.colors;
  return (
    <>
      {gl ? <canvas ref={canvas} className="vz-canvas" data-look={plan.look} aria-hidden="true" /> : (
        <div className="vz-canvas vz-fallback" aria-hidden="true"
          style={{ background: `radial-gradient(60% 40% at 50% 40%, ${a}, transparent 70%), radial-gradient(50% 40% at 20% 80%, ${c}, transparent 70%), radial-gradient(40% 30% at 80% 20%, ${b}, transparent 70%), ${ground}`, opacity: plan.dim }} />
      )}
      {showMeter ? <span className="vz-meter" aria-hidden="true"><i style={{ transform: `scaleY(${Math.max(0.04, meter)})` }} /></span> : null}
    </>
  );
}
