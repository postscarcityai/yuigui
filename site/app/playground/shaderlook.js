"use client";

// The shader blob (spec/SHADER.md, YUI-232): the app's line blob retires and
// the shader behind the stage draws the agent. Chris, Sep 30: one blob in the
// middle that changes SHAPE with what the agent does (a perfect circle, a
// football, and so on). The blob is the default look; Currents, Type and Dots
// stay as alternates to try. The big stage runs one look, one agent and one
// action; under the blob, a row holds every shape at once; the line blob is
// struck out. The doing words are the real rule (actionOf).

import { useEffect, useRef, useState } from "react";
import { ACTIONS, ACTION_INFO, KNOBS, LOOKS_BY_AGENT, actionOf, easeWeights, followVoice, startWeights } from "../../lib/visual/action.mjs";
import { ACTION_FRAGMENT, DIRECTIONS, DIRECTION_IDS, VERTEX, vec3 } from "../../lib/visual/directions.mjs";
import { visualColors } from "../../lib/yl/visual.mjs";
import { SETS } from "../../lib/yl/look.mjs";
import { useReduced } from "./stagemotion";
import "./shaderlook.css";

const AGENT_IDS = Object.keys(LOOKS_BY_AGENT);
const DIRS = ["blob", ...DIRECTION_IDS];
const DIR_NAME = (d) => (d === "blob" ? "Blob" : DIRECTIONS[d].name);
const fragmentOf = (d) => (d === "blob" ? ACTION_FRAGMENT : DIRECTIONS[d].fragment);
const SAMPLES = ["Pondering", "Reading your calendar", "Running the tests", "Searching the web", "Looking up flights"];

// A voice for the mock: phrases of syllables with pauses between, as a raw 0..1
// level. The app feeds the real one; both go through followVoice.
const fakeVoice = (s) => (Math.sin(s * 0.9) > -0.35 ? 0.35 + 0.55 * Math.abs(Math.sin(s * 7.3) * Math.sin(s * 2.9 + 1)) : 0.02);

// One blob. `action` is a state name; it eases in, and `done` restarts its ring each time it is picked.
function Blob({ dir, agent, action, dark, mini = false, still = false }) {
  const canvas = useRef(null);
  const live = useRef({});
  live.current = { agent, action, dark, still };
  const [gl, setGl] = useState(true);

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
      g.attachShader(prog, compile(g.FRAGMENT_SHADER, fragmentOf(dir)));
      g.linkProgram(prog);
      if (!g.getProgramParameter(prog, g.LINK_STATUS)) throw new Error(g.getProgramInfoLog(prog));
    } catch (e) {
      console.warn("shader look:", e.message);
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
    const U = {};
    for (const n of ["res", "time", "since", "think", "read", "run", "search", "talk", "done", "size", "wobble", "grain", "glow", "voice", "dim", "a", "b", "c", "ground"]) U[n] = g.getUniformLocation(prog, `u_${n}`);

    let raf = 0, last = 0, clock = 0, w = startWeights(), was = null, since = 0, voice = 0;
    const draw = (now) => {
      raf = requestAnimationFrame(draw);
      const { agent: id, action: act, dark: dk, still: st } = live.current;
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0.016;
      if (last && now - last < (mini ? 33 : 16) - 2) return;
      last = now;
      const look = LOOKS_BY_AGENT[id];
      const colors = visualColors(SETS[look.set].accent, dk);
      if (act !== was) { was = act; since = 0; }
      const target = st ? "idle" : act;
      w = easeWeights(w, target, dt);
      if (!st) { clock += dt * look.pace; since += dt; } else { clock = 8; since = 9; }
      voice = st ? 0 : followVoice(voice, act === "talking" ? fakeVoice(now / 1000) : 0, dt * 1000);
      const scale = Math.min(2, window.devicePixelRatio || 1) * (mini ? 0.75 : 0.6) * (dir === "type" ? 1.5 : 1);
      const cw = Math.max(1, Math.round(cv.clientWidth * scale)), ch = Math.max(1, Math.round(cv.clientHeight * scale));
      if (cv.width !== cw || cv.height !== ch) { cv.width = cw; cv.height = ch; }
      g.viewport(0, 0, cw, ch);
      g.uniform2f(U.res, cw, ch);
      g.uniform1f(U.time, clock);
      g.uniform1f(U.since, since);
      g.uniform1f(U.think, w.thinking);
      g.uniform1f(U.read, w.reading);
      g.uniform1f(U.run, w.running);
      g.uniform1f(U.search, w.searching);
      g.uniform1f(U.talk, w.talking);
      // done holds its weight only while the ring plays; the ring fades by itself.
      g.uniform1f(U.done, w.done);
      g.uniform1f(U.size, look.size * (mini ? 1.05 : 1));
      g.uniform1f(U.wobble, look.wobble);
      g.uniform1f(U.grain, look.grain);
      g.uniform1f(U.glow, look.glow);
      g.uniform1f(U.voice, voice);
      g.uniform1f(U.dim, 1);
      g.uniform3fv(U.a, vec3(colors.a));
      g.uniform3fv(U.b, vec3(colors.b));
      g.uniform3fv(U.c, vec3(colors.c));
      g.uniform3fv(U.ground, vec3(colors.ground));
      g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); g.deleteProgram(prog); g.deleteBuffer(buf); };
  }, [mini, dir]);

  const c = visualColors(SETS[LOOKS_BY_AGENT[agent].set].accent, dark);
  return gl ? <canvas ref={canvas} className="sl-canvas" aria-hidden="true" data-agent={agent} data-action={action} data-dir={dir} /> : (
    <div className="sl-canvas" aria-hidden="true" style={{ background: `radial-gradient(40% 30% at 50% 45%, ${c.a}, ${c.b} 55%, transparent 75%), ${c.ground}` }} />
  );
}

// Today's mark in the app: three layers of one color, struck out.
function LineBlob({ color }) {
  return (
    <div className="sl-old" role="img" aria-label="Today's line blob, retired">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r="52" fill={color} opacity=".3" />
        <circle cx="60" cy="60" r="40" fill={color} opacity=".45" />
        <circle cx="60" cy="60" r="26" fill={color} />
        <line x1="14" y1="106" x2="106" y2="14" stroke="var(--sl-ink)" strokeWidth="6" strokeLinecap="round" />
      </svg>
      <b>Line blob</b>
      <span>retired</span>
    </div>
  );
}

export function ShaderLookDemo({ dark = true }) {
  const [dir, setDir] = useState("blob");
  const [agent, setAgent] = useState("gouda");
  const [action, setAction] = useState("thinking");
  const [word, setWord] = useState("");
  const [still, setStill] = useState(false);
  const reducedOS = useReduced();
  const off = still || reducedOS;

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (DIRS.includes(q.get("dir"))) setDir(q.get("dir"));
    if (LOOKS_BY_AGENT[q.get("agent")]) setAgent(q.get("agent"));
    if (ACTIONS.includes(q.get("action"))) setAction(q.get("action"));
    if (q.get("still") === "on") setStill(true);
  }, []);

  const info = ACTION_INFO[action];
  const motion = dir === "blob" ? info.motion : DIRECTIONS[dir].states[action];
  const look = LOOKS_BY_AGENT[agent];
  const say = (text) => { setWord(text); setAction(actionOf(text)); };
  const accent = visualColors(SETS[look.set].accent, dark).a;

  return (
    <div className={`sl-app ${dark ? "" : "sl-light"}`} style={{ "--sl-c": accent }}>
      <div className="sl-stage" data-still={off ? "on" : undefined}>
        <Blob dir={dir} agent={agent} action={action} dark={dark} still={off} />
        <div className="sl-bar">
          <b>{DIR_NAME(dir)} · {look.name}</b>
          <span className="sl-tag">{off ? "Reduce Motion: still" : `${info.name}${dir === "blob" ? `: ${info.shape.toLowerCase()}` : ""}${word && actionOf(word) === action ? ` · ${word}` : ""}`}</span>
        </div>
        <LineBlob color={accent} />
      </div>
      <div className="sl-panel">
        <div className="sl-row">
          <span className="sl-label">Look</span>
          <div className="sl-chips">
            {DIRS.map((d) => <button key={d} className={`sl-chip ${d === dir ? "on" : ""}`} onClick={() => setDir(d)}>{DIR_NAME(d)}</button>)}
          </div>
        </div>
        {dir === "blob" ? null : <p className="sl-note"><b>{DIRECTIONS[dir].name}.</b> {DIRECTIONS[dir].idea} Phone cost: {DIRECTIONS[dir].cost}</p>}
        <div className="sl-row">
          <span className="sl-label">Doing</span>
          <div className="sl-chips">
            {ACTIONS.map((a) => (
              <button key={a} className={`sl-chip ${a === action ? "on" : ""}`} onClick={() => { setWord(""); setAction(a); }}>{ACTION_INFO[a].name}</button>
            ))}
          </div>
        </div>
        <div className="sl-row">
          <span className="sl-label">Words</span>
          <div className="sl-chips">
            {SAMPLES.map((s) => <button key={s} className={`sl-chip ${word === s ? "on" : ""}`} onClick={() => say(s)}>{s}</button>)}
          </div>
        </div>
        <p className="sl-note"><b>{info.name}{dir === "blob" ? `: ${info.shape.toLowerCase()}` : ""}.</b> {motion} Picked by: {info.when}{/\.$/.test(info.when) ? "" : "."}</p>
        <div className="sl-row">
          <span className="sl-label">Agent</span>
          <div className="sl-chips">
            {AGENT_IDS.map((id) => <button key={id} className={`sl-chip ${id === agent ? "on" : ""}`} style={{ "--sl-dot": visualColors(SETS[LOOKS_BY_AGENT[id].set].accent, dark).a }} onClick={() => setAgent(id)}>{LOOKS_BY_AGENT[id].name}</button>)}
          </div>
        </div>
        {dir === "blob" ? (
          <div className="sl-grid sl-shapes" aria-label="Every shape, one per action">
            {ACTIONS.map((a) => (
              <button key={a} className={`sl-mini ${a === action ? "on" : ""}`} onClick={() => { setWord(""); setAction(a); }} aria-label={`${ACTION_INFO[a].name}: ${ACTION_INFO[a].shape}`}>
                <Blob dir={dir} agent={agent} action={a} dark={dark} mini still={off} />
                <span>{ACTION_INFO[a].name}</span>
              </button>
            ))}
          </div>
        ) : null}
        <div className="sl-grid" aria-label="Every agent, same look, same action">
          {AGENT_IDS.map((id) => (
            <button key={id} className={`sl-mini ${id === agent ? "on" : ""}`} onClick={() => setAgent(id)} aria-label={`${LOOKS_BY_AGENT[id].name}'s look`}>
              <Blob dir={dir} agent={id} action={action} dark={dark} mini still={off} />
              <span>{LOOKS_BY_AGENT[id].name}</span>
            </button>
          ))}
        </div>
        <div className="sl-knobs">
          {Object.keys(KNOBS).map((k) => <span key={k}><i>{k}</i> {look[k]}</span>)}
        </div>
        <div className="sl-row">
          <span className="sl-label">Stage</span>
          <div className="sl-chips">
            <button className={`sl-chip ${off ? "on" : ""}`} onClick={() => setStill(!still)} disabled={reducedOS}>Reduce Motion</button>
          </div>
        </div>
      </div>
    </div>
  );
}
