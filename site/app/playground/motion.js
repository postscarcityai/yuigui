"use client";

// Motion explainers (spec/MOTION.md, t_0e5a8838): the same ask, "ELI5 string theory", three ways.
//   free:   the model writes a whole HTML page; it plays in a sandboxed iframe, no YL.
//   yl:     a small `scene` layer of YL (lib/motion/scene.mjs), drawn by our own SVG renderer.
//   hybrid: YL frames the turn (say, choose stay native); the model writes only the motion piece,
//           which a fixed harness plays on a canvas and relays taps back as events.
// Every class is mo-, so no site chrome leaks in.

import { useCallback, useEffect, useRef, useState } from "react";
import { evalScene, parseScene } from "../../lib/motion/scene.mjs";
import { useReduced } from "./stagemotion";
import MotionFilm from "../components/MotionFilm";
import gallery from "../../lib/motion/gallery.json";
import "./motion.css";

const BASE = "/demo/motion";
const CSP = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline' 'unsafe-eval'; img-src data:">`;
const withCsp = (html) => (/<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, (m) => m + CSP) : CSP + html);

// ?v=run2 plays the second run of the same prompt (a different piece each time).
function variant() {
  if (typeof window === "undefined") return "";
  const v = new URLSearchParams(window.location.search).get("v");
  return v && /^[a-z0-9]{1,8}$/.test(v) ? `.${v}` : "";
}

function useText(path) {
  const [text, setText] = useState(null);
  useEffect(() => {
    let live = true;
    fetch(`${BASE}/${path}`).then((r) => r.text()).then((t) => live && setText(t)).catch(() => live && setText(""));
    return () => { live = false; };
  }, [path]);
  return text;
}

// A (v1): a whole page the model wrote, sandboxed. No same-origin, no network (CSP), scripts only.
// Kept at ?v=old: it shows why A had to be streamed (8 minutes before one frame).
export function FreePiece({ full = true }) {
  const html = useText("free.html");
  const [run, setRun] = useState(0);
  return (
    <div className={`mo-piece ${full ? "mo-full" : ""}`}>
      {html ? <iframe key={run} className="mo-frame" title="Free-code motion explainer" sandbox="allow-scripts" srcDoc={withCsp(html)} onLoad={() => { window.__moFirst = performance.now(); }} /> : <div className="mo-wait">Loading</div>}
      <button className="mo-replay" onClick={() => setRun((x) => x + 1)} aria-label="Replay">Replay</button>
    </div>
  );
}

// A (v2): the default explainer. The model writes the film scene by scene; each scene is posted into a
// full-bleed sandboxed player the moment it is complete, so scene 1 plays while the rest is written.
// A recorded run (scripts/motion/stream.py) is replayed on its own clock: scene i is posted at its `at`
// second, so what plays is what a live stream would do. ?v=opus plays the Opus run, default is Sonnet 5.5.
const STREAMS = { sonnet: "stream-sonnet.json", opus: "stream.json" };
export function StreamPiece() {
  const harness = useText("harness-stream.html");
  const [vq] = useState(() => (variant() || ".sonnet").slice(1));
  const file = STREAMS[vq] || STREAMS.sonnet;
  const [film, setFilm] = useState(null);
  const frame = useRef(null);
  const [run, setRun] = useState(0);
  const [info, setInfo] = useState(null);
  const [err, setErr] = useState(null);
  useEffect(() => {
    let live = true;
    fetch(`${BASE}/${file}`).then((r) => r.json()).then((j) => live && setFilm(j)).catch(() => live && setErr("film missing"));
    return () => { live = false; };
  }, [file]);
  useEffect(() => {
    if (!film || !harness) return undefined;
    const timers = [];
    let t0 = 0;
    const on = (e) => {
      const w = frame.current?.contentWindow;
      if (e.source !== w || !e.data || !e.data.motion) return;
      const m = e.data.motion;
      if (m === "ready") {
        t0 = performance.now();
        window.__moReady = t0;
        // the model's clock starts at the ask; the page's clock starts now, so scene i lands at `at` seconds
        film.scenes.forEach((s) => timers.push(setTimeout(() => w.postMessage({ scene: { name: s.name, dur: s.dur, code: s.code } }, "*"), s.at * 1000)));
        timers.push(setTimeout(() => w.postMessage({ end: true }, "*"), film.stats.total_s * 1000));
      }
      if (m === "first-frame") {
        window.__moFirst = performance.now();
        // time to first frame from the ask = the first scene's write time + the player's boot
        setInfo({ first: ((performance.now() - t0) / 1000), written: film.scenes[0].at, scenes: film.scenes.length, total: film.stats.total_s, model: film.stats.model });
      }
      if (m === "error") setErr(`${e.data.scene}: ${e.data.message}`);
    };
    window.addEventListener("message", on);
    return () => { window.removeEventListener("message", on); timers.forEach(clearTimeout); };
  }, [film, harness, run]);
  return (
    <div className="mo-piece mo-full mo-bleed">
      {film && harness ? <iframe key={run} ref={frame} className="mo-frame" title="Motion explainer" sandbox="allow-scripts" srcDoc={withCsp(harness)} /> : <div className="mo-wait">{err || "Loading"}</div>}
      <button className="mo-replay" onClick={() => { setErr(null); setInfo(null); setRun((x) => x + 1); }} aria-label="Replay">Replay</button>
      {info ? <div className="mo-ttff" data-first={info.first.toFixed(2)}>First scene written in {info.written} s. Whole film {info.total} s. Recorded run, replayed on its own clock.</div> : null}
      {err && film ? <div className="mo-error">{err}</div> : null}
    </div>
  );
}

// C: the harness is a fixed page; the model's scene function is posted in as text.
export function HybridPiece({ onTap }) {
  const harness = useText("harness.html");
  const [v] = useState(variant);
  const code = useText(`hybrid${v}.js`);
  const frame = useRef(null);
  const [run, setRun] = useState(0);
  const [msg, setMsg] = useState(null);
  const [tapped, setTapped] = useState(null);
  useEffect(() => {
    const on = (e) => {
      if (e.source !== frame.current?.contentWindow || !e.data || !e.data.motion) return;
      if (e.data.motion === "ready" && code) frame.current.contentWindow.postMessage({ code }, "*");
      if (e.data.motion === "first-frame") window.__moFirst = performance.now();
      if (e.data.motion === "error") setMsg(e.data.message);
      if (e.data.motion === "tap") { setTapped(e.data.id); onTap?.(e.data.id); }
    };
    window.addEventListener("message", on);
    return () => window.removeEventListener("message", on);
  }, [code, onTap]);
  return (
    <div className="mo-piece mo-inline">
      {harness && code ? <iframe key={run} ref={frame} className="mo-frame" title="Hybrid motion piece" sandbox="allow-scripts" srcDoc={withCsp(harness)} /> : <div className="mo-wait">Loading</div>}
      {msg ? <div className="mo-error">Scene failed: {msg}</div> : null}
      <button className="mo-replay" onClick={() => { setMsg(null); setTapped(null); setRun((x) => x + 1); }} aria-label="Replay">Replay</button>
      {tapped ? <span className="mo-tap">tap: {tapped}</span> : null}
    </div>
  );
}

const SVGNS = "http://www.w3.org/2000/svg";
const el = (name, attrs = {}) => { const e = document.createElementNS(SVGNS, name); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };

// B: our own renderer. The scene is parsed once; each frame is evalScene(t) written onto an SVG tree
// that mirrors the shapes' parents, so a frame's scale, move and spin carry its children.
export function SceneView({ full = true }) {
  const [v] = useState(variant);
  const src = useText(`eli5-string${v}.scene`);
  const stage = useRef(null);
  const svg = useRef(null);
  const bar = useRef(null);
  const cap = useRef(null);
  const clock = useRef({ t: 0, playing: true });
  const [state, setState] = useState({ ended: false, paused: false });
  const [show, setShow] = useState(false);
  const [error, setError] = useState(null);
  const [run, setRun] = useState(0);
  const reduced = useReduced();

  useEffect(() => {
    if (!src) return undefined;
    let scene;
    try { scene = parseScene(src); } catch (e) { setError(e.message); return undefined; }
    const root = svg.current;
    root.textContent = "";
    root.appendChild(Object.assign(el("rect"), {}));
    const cam = el("g");
    root.appendChild(cam);
    const nodes = {};
    for (const s of scene.shapes) {
      const g = el("g");
      const o = { g };
      if (s.kind === "text") { o.text = el("text", { "text-anchor": "middle", "font-family": "system-ui,-apple-system,sans-serif", "font-weight": "700" }); o.text.textContent = s.text; g.appendChild(o.text); }
      else if (s.kind !== "frame") {
        if (s.glow) { o.halo = el("path", { "vector-effect": "non-scaling-stroke", fill: "none", "stroke-linejoin": "round" }); g.appendChild(o.halo); }
        o.path = el("path", { "vector-effect": "non-scaling-stroke", "stroke-linejoin": "round" });
        g.appendChild(o.path);
      }
      nodes[s.id] = o;
      (s.of ? nodes[s.of].g : cam).appendChild(g);
    }
    const fit = () => {
      const r = stage.current.getBoundingClientRect();
      const h = (100 * r.height) / Math.max(1, r.width);
      root.setAttribute("viewBox", `-50 ${-h / 2} 100 ${h}`);
      root.firstChild.setAttribute("x", -50); root.firstChild.setAttribute("y", -h / 2);
      root.firstChild.setAttribute("width", 100); root.firstChild.setAttribute("height", h);
      root.firstChild.setAttribute("fill", "transparent");
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(stage.current);

    const draw = (t) => {
      const f = evalScene(scene, t);
      cam.setAttribute("transform", `rotate(${f.cam.roll}) scale(${f.cam.z}) translate(${-f.cam.x} ${-f.cam.y})`);
      for (const s of f.shapes) {
        const o = nodes[s.id];
        o.g.style.display = s.op <= 0.004 ? "none" : "";
        if (s.op <= 0.004) continue;
        o.g.setAttribute("transform", `translate(${s.x} ${s.y}) rotate(${s.rot}) scale(${s.s})`);
        o.g.setAttribute("opacity", s.op.toFixed(3));
        if (o.text) { o.text.setAttribute("font-size", s.r); o.text.setAttribute("fill", s.tone); }
        if (o.path) {
          o.path.setAttribute("d", s.d);
          o.path.setAttribute("fill", s.tone);
          o.path.setAttribute("fill-opacity", s.fill);
          o.path.setAttribute("stroke", s.tone);
          o.path.setAttribute("stroke-width", s.sw);
        }
        if (o.halo) { o.halo.setAttribute("d", s.d); o.halo.setAttribute("stroke", s.tone); o.halo.setAttribute("stroke-width", s.sw * 7); o.halo.setAttribute("stroke-opacity", 0.16); }
      }
      const c = cap.current;
      if (f.say) { c.textContent = f.say.text; c.className = `mo-cap ${f.say.big ? "big" : ""}`; c.style.opacity = f.say.a; c.style.transform = `translateY(${(1 - f.say.a) * 10}px)`; }
      else c.style.opacity = 0;
      bar.current.style.transform = `scaleX(${Math.min(1, t / scene.dur)})`;
    };

    const ck = clock.current;
    ck.t = reduced ? scene.dur : 0;
    ck.playing = !reduced;
    setState({ ended: reduced, paused: false });
    let last = performance.now(), raf;
    const loop = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      if (ck.playing) {
        ck.t += dt;
        if (ck.t >= scene.dur) { ck.t = scene.dur; ck.playing = false; setState({ ended: true, paused: false }); }
      }
      draw(ck.t);
      if (!window.__moFirst) window.__moFirst = performance.now();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.__moScene = { scene, draw, clock: ck }; // lets a test drive time (recordings)
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [src, run, reduced]);

  const toggle = useCallback(() => {
    const ck = clock.current;
    if (state.ended) { ck.t = 0; ck.playing = true; setState({ ended: false, paused: false }); return; }
    ck.playing = !ck.playing;
    setState((s) => ({ ...s, paused: !ck.playing }));
  }, [state.ended]);

  return (
    <div className={`mo-piece ${full ? "mo-full" : ""}`}>
      <div className="mo-stage" ref={stage} onClick={toggle} role="img" aria-label="Animated explainer: ELI5 string theory">
        <svg ref={svg} className="mo-svg" preserveAspectRatio="xMidYMid meet" />
        <div className="mo-bar"><i ref={bar} /></div>
        <div ref={cap} className="mo-cap" />
        {state.paused ? <div className="mo-pause">Paused</div> : null}
      </div>
      {error ? <div className="mo-error">Scene error: {error}</div> : null}
      <div className="mo-tools">
        <button onClick={() => { setRun((x) => x + 1); }} aria-label="Replay">Replay</button>
        <button onClick={() => setShow(!show)} aria-pressed={show}>{show ? "Hide scene" : "Show scene"}</button>
      </div>
      {show ? <pre className="mo-src">{src}</pre> : null}
    </div>
  );
}

// The motion kit (MOTION-1): any of the 20 test asks, either run, streamed on the recorded clock.
// ?film=heart-r2 picks one; the picker below changes it.
function KitPiece() {
  const films = gallery.asks.flatMap((a) => a.runs.map((r) => ({ id: `${a.id}-r${r.run}`, label: `${a.ask.replace(/\.$/, "")} (run ${r.run})` })));
  const [film, setFilm] = useState(() => {
    const q = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("film");
    return films.some((f) => f.id === q) ? q : "heart-r1";
  });
  return (
    <div className="mo-piece mo-full mo-bleed">
      <MotionFilm film={film} stream fill label="Motion film" />
      <select className="mo-pick" aria-label="Pick a film" value={film} onChange={(e) => setFilm(e.target.value)}>
        {films.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
      </select>
    </div>
  );
}

export function MotionDemo({ kind }) {
  if (kind === "kit") return <KitPiece />;
  if (kind !== "free") return <SceneView />;
  return variant() === ".old" ? <FreePiece /> : <StreamPiece />;
}
