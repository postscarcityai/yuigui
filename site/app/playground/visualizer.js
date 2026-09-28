"use client";

// The visual (spec/VISUAL.md, YL.md section 5, YUI-124 step 1): a live shader
// behind the stage, in the agent's colors and motion look, listening to a
// voice, music or the room. The editor's `visual` line picks the look (the
// real parser, visualOf); the chips change it and show the line that would
// say so. The sound is designed here too: a sample voice and a sample beat
// made with Web Audio, or this browser's mic. Behind words it dims and lays a
// scrim so the words keep AA contrast; Reduce Motion and Low Power get one
// still frame. With no `visual` line in the editor each agent shows its own
// quiet default (YUI-180): the crew's picks, and the soft orb for a connected
// Hermes agent. A chip or a line of its own takes over, `visual off` sticks.

import { useEffect, useMemo, useRef, useState } from "react";
import { parse, visualOf } from "../../lib/yl/yl.mjs";
import { CREW_VISUALS, FALLBACK_VISUAL, LOOKS, VISUAL_LOOKS, follow, levelOf, shown as stepped, stageVisual, visualPlan } from "../../lib/yl/visual.mjs";
import { SETS } from "../../lib/yl/look.mjs";
import { VERTEX, fragment, vec3 } from "../../lib/visual/shaders.mjs";
import { useReduced } from "./stagemotion";
import "./visualizer.css";

// The crew in the app's colors (brand, butter, mint, lavender), a connected
// Hermes agent with no pick, and the two the older samples use.
const AGENTS = {
  Yui: { name: "Yui", theme: { name: "yui", motion: "bouncy" }, c: SETS.yui.accent, crew: "yui" },
  Arnold: { name: "Arnold", theme: { name: "honey", motion: "snappy" }, c: SETS.honey.accent, crew: "arnold" },
  Basil: { name: "Basil", theme: { name: "mint", motion: "calm" }, c: SETS.mint.accent, crew: "basil" },
  Gouda: { name: "Gouda", theme: { name: "lavender", motion: "bouncy" }, c: SETS.lavender.accent, crew: "gouda" },
  Penny: { name: "Penny", theme: { name: "honey", motion: "calm" }, c: SETS.honey.accent, crew: "penny" },
  Quill: { name: "Quill", theme: { name: "lavender", motion: "calm" }, c: SETS.lavender.accent, crew: "quill" },
  Hermes: { name: "Hermes", theme: { name: "sky" }, c: SETS.sky.accent },
  Sage: { name: "Sage", theme: { name: "mint", motion: "calm" }, c: SETS.mint.accent },
  Coach: { name: "Coach", theme: { name: "coach", motion: "snappy" }, c: SETS.coach.accent },
};
const CREW = ["Yui", "Arnold", "Basil", "Gouda", "Penny", "Quill", "Hermes"];
const pickOf = (a) => CREW_VISUALS[a.crew] || FALLBACK_VISUAL;
const TONES = ["accent", "mint", "sky", "lavender", "sunset", "lemon"];
const SOUNDS = [["voice", "Sample voice"], ["beat", "Sample beat"], ["mic", "Your mic"], [null, "Quiet"]];
const REACTS = ["voice", "music", "mic", "off"];
// Which sound a look's react= hears: the room hears everything.
const HEARS = { voice: ["voice", "mic"], music: ["beat"], mic: ["voice", "beat", "mic"], off: [] };
const SOUND_REACT = { voice: "voice", beat: "music", mic: "mic" };

function readText(text) {
  const ops = parse(text || "");
  const say = ops.find((o) => o.op === "add" && o.preset === "say");
  return { props: visualOf(ops), line: ops.some((o) => o.op === "visual"), words: say?.props?.text || "" };
}

// ---------- sound ----------

// One AudioContext for the demo. Sources: a sample voice (a sawtooth through
// two moving formants, in syllables and pauses), a sample beat (kick, snare,
// hats at 96 bpm) and the mic. read() is the raw level, 0..1.
function useSound() {
  const ref = useRef({ ctx: null, an: null, buf: null, stop: null });
  const [source, setSource] = useState(null);
  const [note, setNote] = useState(null);

  const ensure = () => {
    const r = ref.current;
    if (!r.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      r.ctx = new AC();
      r.an = r.ctx.createAnalyser();
      r.an.fftSize = 1024;
      r.buf = new Float32Array(r.an.fftSize);
    }
    if (r.ctx.state === "suspended") r.ctx.resume();
    return r;
  };

  const stop = () => {
    const r = ref.current;
    if (r.stop) r.stop();
    r.stop = null;
    setSource(null);
  };

  const start = async (kind) => {
    stop();
    setNote(null);
    if (!kind) return;
    const r = ensure();
    if (!r) { setNote("This browser has no Web Audio."); return; }
    const { ctx, an } = r;
    if (kind === "mic") {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const src = ctx.createMediaStreamSource(stream);
        src.connect(an);
        r.stop = () => { src.disconnect(); stream.getTracks().forEach((t) => t.stop()); };
        setSource("mic");
      } catch {
        setNote("The mic is off for this page. The samples still work.");
      }
      return;
    }
    const out = ctx.createGain();
    out.gain.value = 0.5;
    out.connect(an);
    out.connect(ctx.destination);
    const timers = [];
    if (kind === "voice") {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = 150;
      const f1 = ctx.createBiquadFilter(), f2 = ctx.createBiquadFilter();
      f1.type = f2.type = "bandpass";
      f1.Q.value = 6; f2.Q.value = 9;
      const amp = ctx.createGain();
      amp.gain.value = 0;
      osc.connect(f1); osc.connect(f2); f1.connect(amp); f2.connect(amp); amp.connect(out);
      osc.start();
      let syl = 0, phrase = 6 + Math.floor(Math.random() * 5);
      const vowels = [[700, 1200], [400, 2200], [300, 900], [600, 1700], [500, 1000]];
      const tick = () => {
        const t = ctx.currentTime;
        if (syl++ >= phrase) {
          amp.gain.setTargetAtTime(0, t, 0.05);
          syl = 0; phrase = 5 + Math.floor(Math.random() * 7);
          timers.push(setTimeout(tick, 450 + Math.random() * 350));
          return;
        }
        const [a, b] = vowels[Math.floor(Math.random() * vowels.length)];
        f1.frequency.setTargetAtTime(a, t, 0.03);
        f2.frequency.setTargetAtTime(b, t, 0.03);
        osc.frequency.setTargetAtTime(130 + Math.random() * 60, t, 0.08);
        amp.gain.setTargetAtTime(0.5 + Math.random() * 0.6, t, 0.02);
        amp.gain.setTargetAtTime(0.08, t + 0.11, 0.04);
        timers.push(setTimeout(tick, 150 + Math.random() * 90));
      };
      tick();
      r.stop = () => { timers.forEach(clearTimeout); amp.gain.setTargetAtTime(0, ctx.currentTime, 0.03); osc.stop(ctx.currentTime + 0.2); setTimeout(() => out.disconnect(), 300); };
    } else {
      const noise = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const hit = (t, what) => {
        if (what === "kick") {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.14);
          g.gain.setValueAtTime(1, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
          o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.34);
        } else {
          const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
          s.buffer = noise;
          f.type = what === "hat" ? "highpass" : "bandpass";
          f.frequency.value = what === "hat" ? 7000 : 1800;
          const len = what === "hat" ? 0.05 : 0.18;
          g.gain.setValueAtTime(what === "hat" ? 0.25 : 0.7, t); g.gain.exponentialRampToValueAtTime(0.001, t + len);
          s.connect(f); f.connect(g); g.connect(out); s.start(t); s.stop(t + len + 0.02);
        }
      };
      const step = 60 / 96 / 2;
      let next = ctx.currentTime + 0.05, n = 0;
      const PAT = { kick: [0, 3, 4], snare: [2, 6] };
      const iv = setInterval(() => {
        while (next < ctx.currentTime + 0.12) {
          const i = n % 8;
          if (PAT.kick.includes(i)) hit(next, "kick");
          if (PAT.snare.includes(i)) hit(next, "snare");
          hit(next, "hat");
          next += step; n++;
        }
      }, 25);
      r.stop = () => { clearInterval(iv); setTimeout(() => out.disconnect(), 400); };
    }
    setSource(kind);
  };

  useEffect(() => () => { const r = ref.current; if (r.stop) r.stop(); if (r.ctx) r.ctx.close(); }, []);

  const read = () => {
    const r = ref.current;
    if (!r.an || !source) return 0;
    r.an.getFloatTimeDomainData(r.buf);
    return levelOf(r.buf);
  };
  return { source, start, stop, read, note };
}

// ---------- the canvas ----------

// One WebGL canvas. It recompiles when the look changes, draws at the plan's
// fps (0: one still frame) and half resolution, and follows the level with
// the look's envelope. With no WebGL it draws a soft gradient in the colors.
function VisualCanvas({ plan, read }) {
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
      if (now - shown > 120) { shown = now; setMeter(level); }
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
      <span className="vz-meter" aria-hidden="true"><i style={{ transform: `scaleY(${Math.max(0.04, meter)})` }} /></span>
    </>
  );
}

// ---------- the demo ----------

function Chips({ label, items, value, onPick, color }) {
  return (
    <div className="vz-row">
      <span className="vz-label">{label}</span>
      <div className="vz-chips" style={{ "--vz-c": color }}>
        {items.map(([k, name, style]) => (
          <button key={String(k)} className={`vz-chip ${k === value ? "on" : ""}`} onClick={() => onPick(k)} style={style}>{name}</button>
        ))}
      </div>
    </div>
  );
}

function lineOf(v) {
  if (!v || v.off) return "visual off";
  return ["visual", v.look, v.tone && v.tone !== "accent" ? `tone=${v.tone}` : null, v.react && v.react !== "voice" ? `react=${v.react}` : null].filter(Boolean).join(" ");
}

export function VisualizerDemo({ text, dark = true, agent: start = "Sage" }) {
  const first = useMemo(() => readText(text), [text]);
  const [v, setV] = useState(() => ({ look: "orb", tone: "accent", react: "voice", ...(first.props || {}) }));
  // "default": the agent's own quiet pick (no line yet); "line": the agent sent one.
  const [mode, setMode] = useState(first.line ? "line" : "default");
  const [on, setOn] = useState(true); // the person's Visualizer switch (Settings, per agent)
  const [who, setWho] = useState(AGENTS[start] ? start : "Sage");
  const [words, setWords] = useState(true);
  const [still, setStill] = useState(false);
  const [lowPower, setLowPower] = useState(false);
  const reducedOS = useReduced();
  const sound = useSound();

  // The editor's line wins when it changes; ?look= opens a look (library links).
  useEffect(() => {
    if (first.props) setV((x) => ({ ...x, tone: "accent", react: "voice", ...first.props }));
    if (first.line) setMode(first.props ? "line" : "off");
  }, [first]);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const look = q.get("look");
    if (VISUAL_LOOKS.includes(look)) { setV((x) => ({ ...x, look })); setMode("line"); }
    if (q.get("words") === "off") setWords(false);
    if (q.get("still") === "on") setStill(true);
    if (AGENTS[q.get("agent")]) setWho(q.get("agent"));
  }, []);

  const agent = AGENTS[who];
  const own = mode === "line" ? [{ op: "visual", props: v }] : mode === "off" ? [{ op: "visual", props: { off: true } }] : [];
  const props = stageVisual(pickOf(agent), own, !on);
  const plan = visualPlan(props || v, { theme: agent.theme, dark, words, reduced: reducedOS || still, lowPower });
  const shows = !!props;
  const hears = HEARS[plan.react].includes(sound.source);
  const read = () => (hears ? sound.read() : 0);
  // A chip is the agent sending a line of its own: it wins over the default.
  const pick = (k) => (x) => { setV((o) => ({ ...(mode === "line" ? o : fromDefault()), [k]: x })); setMode("line"); };
  const fromDefault = () => { const d = pickOf(agent); return { look: d.look, tone: "accent", react: d.hears }; };
  const play = (kind) => {
    sound.start(kind);
    if (kind && !HEARS[plan.react].includes(kind) && mode === "line") setV((o) => ({ ...o, react: SOUND_REACT[kind] }));
  };
  const choose = (name) => { setWho(name); if (CREW.includes(name)) setMode("default"); };
  const d = pickOf(agent);
  const line = mode === "default" ? `${lineOf({ look: d.look, react: d.hears })}  // ${agent.name}'s default, ${d.strength}` : lineOf(mode === "off" ? null : v);

  return (
    <div className={`vz-app ${dark ? "" : "vz-light"}`} style={{ "--vz-c": agent.c }}>
      <div className="vz-stage" data-still={plan.still ? plan.why : undefined}>
        {shows ? <VisualCanvas plan={plan} read={read} /> : <div className="vz-canvas vz-none" aria-hidden="true" />}
        <div className="vz-bar">
          <span className="vz-gear" aria-hidden="true">≡</span>
          <span className="vz-face" style={{ background: agent.c }}>{agent.name[0]}</span>
          <b>{agent.name}</b>
          <span className="vz-rec" aria-hidden="true">💬</span>
        </div>
        {words && first.words ? (
          <div className="vz-chunk">
            <div className="vz-segs"><i className="on" /><i /></div>
            <div className="vz-line">{first.words}</div>
          </div>
        ) : <div className="vz-chunk" />}
        <div className="vz-foot">
          <span className="vz-tag">{!shows ? "Visualizer off" : plan.still ? (plan.why === "low-power" ? "Low Power: still" : "Reduce Motion: still") : plan.quiet ? `${plan.label}, quiet` : plan.label}</span>
          <span className="vz-t" aria-hidden="true">T</span>
          <button className={`vz-mic ${sound.source === "mic" ? "live" : ""}`} aria-label={sound.source === "mic" ? "Stop the mic" : "Use your mic"} onClick={() => play(sound.source === "mic" ? null : "mic")}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8.5" y="3" width="7" height="12" rx="3.5" /><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" fill="none" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>
      </div>
      <div className="vz-panel">
        <code className="vz-code">{line}</code>
        <Chips label="Look" items={VISUAL_LOOKS.map((k) => [k, LOOKS[k].name])} value={shows ? plan.look : null} onPick={pick("look")} />
        <Chips label="Agent" items={CREW.concat(CREW.includes(who) ? [] : [who]).map((n) => [n, n, { "--vz-dot": AGENTS[n].c }])} value={who} onPick={choose} />
        <Chips label="Shows" items={[["default", `${who}'s default`], ["line", "Its own line"], ["off", "visual off"]]} value={mode} onPick={setMode} />
        <Chips label="Tone" items={TONES.map((t) => [t, t === "accent" ? `${who}'s` : t, { "--vz-dot": t === "accent" ? agent.c : SETS[t].accent }])} value={mode === "line" ? v.tone : "accent"} onPick={pick("tone")} />
        <Chips label="Sound" items={SOUNDS} value={sound.source} onPick={play} />
        <Chips label="Hears" items={REACTS.map((r) => [r, r])} value={shows ? plan.react : null} onPick={pick("react")} />
        <div className="vz-row">
          <span className="vz-label">Stage</span>
          <div className="vz-chips">
            <button className={`vz-chip ${on ? "on" : ""}`} onClick={() => setOn(!on)} aria-pressed={on}>Visualizer</button>
            <button className={`vz-chip ${words ? "on" : ""}`} onClick={() => setWords(!words)}>Words on top</button>
            <button className={`vz-chip ${still || reducedOS ? "on" : ""}`} onClick={() => setStill(!still)} disabled={reducedOS}>Reduce Motion</button>
            <button className={`vz-chip ${lowPower ? "on" : ""}`} onClick={() => setLowPower(!lowPower)}>Low Power</button>
          </div>
        </div>
        <div className="vz-note">
          {sound.note ? <b>{sound.note} </b> : null}
          {!shows ? (on ? "The agent said visual off. It stays off until it sends another visual line. " : `You switched ${who}'s visualizer off. Nothing draws, whatever it sends. `) : null}
          {shows && mode === "default" ? `${who}'s own: ${CREW.includes(who) && who !== "Hermes" ? d.why || "" : "no pick, so the soft orb"}. ` : null}
          {!shows ? null : plan.still ? "One still frame, nothing moves. " : plan.quiet ? `${plan.fps} fps, ${plan.idleFps} while nothing is heard, ${plan.pace} pace. ` : `${plan.fps} fps, ${plan.scale === 0.5 ? "half" : "three quarter"} resolution. `}
          {!shows ? null : words ? `Behind words: ${Math.round(plan.dim * 100)}% strength${plan.scrim ? `, scrim ${plan.scrim}` : ""}, so the words stay AA.` : plan.quiet ? `Alone on the stage: ${Math.round(plan.dim * 100)}% strength.` : "Alone on the stage: full strength."}
          {sound.source && !hears && plan.react !== "off" ? ` This look hears ${plan.react}, so it moves on its own clock.` : ""}
        </div>
      </div>
    </div>
  );
}
