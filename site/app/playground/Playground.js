"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Parser, StreamParser, apply, initialState, parse } from "../../lib/yl/yl.mjs";
import { SCREENS, DEMOS, MEDIA } from "../../lib/yl/samples.mjs";
import { Render } from "./presets";

const ALL = [...SCREENS, ...DEMOS, ...MEDIA];
const COLORS = { Arnold: "var(--arnold)", Urza: "linear-gradient(135deg,#8b7cff,#4fd1c5)", Yui: "linear-gradient(135deg,#4fd1c5,#8b7cff)" };

function build(text) {
  let s = initialState();
  for (const op of parse(text)) s = apply(s, op);
  return s;
}

export default function Playground() {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState(ALL[0].yl);
  const [state, setState] = useState(() => build(ALL[0].yl));
  const [view, setView] = useState(null); // screen tab the user picked; null = follow focus
  const [events, setEvents] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [streamed, setStreamed] = useState(null);
  const [speed, setSpeed] = useState(40);
  const [cmd, setCmd] = useState("");
  const [epoch, setEpoch] = useState(0); // bumps on load/stream so components start fresh
  const agentParser = useRef(null);
  const timer = useRef(null);
  const emits = useRef(new Map());

  const agent = ALL[idx].agent;

  // Live mode: every edit re-renders the whole document. Keys are stable, so
  // components that did not change keep their state.
  useEffect(() => {
    if (streaming) return;
    const t = setTimeout(() => { setState(build(text)); agentParser.current = null; }, 150);
    return () => clearTimeout(t);
  }, [text, streaming]);

  // /playground?demo=<slug> opens a media demo directly.
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("demo");
    const i = slug ? ALL.findIndex((s) => s.slug === slug) : -1;
    if (i > 0) load(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pick = (i) => {
    load(i);
    const url = new URL(window.location.href);
    if (ALL[i].slug) url.searchParams.set("demo", ALL[i].slug); else url.searchParams.delete("demo");
    window.history.replaceState(null, "", url);
  };

  const load = (i) => {
    stopStream();
    setCmd(ALL[i].next || "");
    setEpoch((x) => x + 1);
    setIdx(i);
    setText(ALL[i].yl);
    setState(build(ALL[i].yl));
    setView(null);
    setEvents([]);
    setStreamed(null);
  };

  const stopStream = () => { clearInterval(timer.current); setStreaming(false); };

  // Simulated model output: a few characters at a time, like tokens arriving.
  // A component appears the moment its line's newline lands.
  const stream = () => {
    stopStream();
    const sp = new StreamParser();
    let s = initialState();
    setEpoch((x) => x + 1);
    setState(s);
    setView(null);
    setStreaming(true);
    setStreamed("");
    let i = 0;
    const src = text;
    timer.current = setInterval(() => {
      const n = 2 + Math.floor(Math.random() * 4);
      const chunk = src.slice(i, i + n);
      i += n;
      setStreamed(src.slice(0, i));
      const ops = chunk ? sp.push(chunk) : [];
      if (i >= src.length) ops.push(...sp.flush());
      if (ops.length) { for (const op of ops) s = apply(s, op); setState(s); }
      if (i >= src.length) { clearInterval(timer.current); setStreaming(false); }
    }, speed);
  };
  useEffect(() => () => clearInterval(timer.current), []);

  // Agent console: one YL line applied on top of what is on screen, the way a
  // running agent would send a follow-up (~patch, >screen, show ...).
  const send = (e) => {
    e.preventDefault();
    const line = cmd.trim();
    if (!line) return;
    if (!agentParser.current) {
      // Replay the document through a parser so ids and focus carry over.
      const p = new Parser();
      text.split("\n").forEach((l) => p.line(l));
      agentParser.current = p;
    }
    const op = agentParser.current.line(line);
    if (op) setState((s) => apply(s, op));
    setEvents((ev) => [{ dir: "agent", t: new Date(), line }, ...ev].slice(0, 40));
    setCmd("");
  };

  const emitFor = useCallback((node) => {
    const k = `${node.key}:${node.preset}:${node.seq}`;
    if (!emits.current.has(k)) {
      emits.current.set(k, (value) =>
        setEvents((ev) => [{ dir: "user", t: new Date(), ev: { id: node.id, preset: node.preset, ...value } }, ...ev].slice(0, 40)));
    }
    return emits.current.get(k);
  }, []);

  const screens = Object.keys(state.screens);
  const shown = view && state.screens[view] ? view : state.focus;
  const nodes = state.screens[shown] || [];
  const lines = useMemo(() => text.split("\n").filter((l) => l.trim() && !l.trim().startsWith("# ")).length, [text]);

  return (
    <div className="pg">
      <div className="pg-left">
        <div className="pg-row">
          <select value={idx} onChange={(e) => pick(Number(e.target.value))}>
            <optgroup label="Benchmark screens">
              {SCREENS.map((s, i) => <option key={s.name} value={i}>{i + 1}. {s.name}</option>)}
            </optgroup>
            <optgroup label="Line types">
              {DEMOS.map((s, i) => <option key={s.name} value={SCREENS.length + i}>{s.name}</option>)}
            </optgroup>
            <optgroup label="Media">
              {MEDIA.map((s, i) => <option key={s.name} value={SCREENS.length + DEMOS.length + i}>{s.name}</option>)}
            </optgroup>
          </select>
          <button className="pg-btn" onClick={streaming ? stopStream : stream}>{streaming ? "Stop" : "▶ Stream it"}</button>
        </div>
        <label className="pg-hint">
          YL the agent sends ({lines} line{lines === 1 ? "" : "s"}, {text.length} chars). Edit it, the phone updates live.
        </label>
        {streaming || streamed ? (
          <pre className="pg-stream" onClick={() => !streaming && setStreamed(null)}>
            {streamed}{streaming ? <span className="pg-caret">▍</span> : <span className="pg-hint"> (click to edit again)</span>}
          </pre>
        ) : (
          <textarea className="pg-code" value={text} spellCheck={false} onChange={(e) => setText(e.target.value)} rows={9} />
        )}
        <div className="pg-row pg-hint">
          Stream speed
          <input type="range" min={10} max={150} value={160 - speed} onChange={(e) => setSpeed(160 - Number(e.target.value))} />
        </div>

        <form className="pg-agent" onSubmit={send}>
          <span className="pg-hint">Agent line (applied on top, no re-render):</span>
          <div className="pg-row">
            <input value={cmd} onChange={(e) => setCmd(e.target.value)} placeholder="~timer rounds=10   >2 ask Ready?   show warmup" spellCheck={false} />
            <button className="pg-btn">Send</button>
          </div>
        </form>

        <div className="pg-log">
          <div className="lbl">Wire log (what the agent receives back)</div>
          {!events.length ? <div className="pg-hint">Tap something on the phone.</div> : null}
          {events.map((e, i) => (
            <div key={i} className={`pg-ev ${e.dir}`}>
              <span>{e.dir === "user" ? "→ agent" : "agent →"}</span>
              <code>{e.dir === "user" ? JSON.stringify(e.ev) : e.line}</code>
            </div>
          ))}
          {state.errors.length ? (
            <>
              <div className="lbl" style={{ marginTop: 12, color: "#ff8a8a" }}>Parse errors (line skipped, rest renders)</div>
              {state.errors.map((e, i) => <div key={i} className="pg-ev err"><code>{e}</code></div>)}
            </>
          ) : null}
          {state.customs.length ? (
            <>
              <div className="lbl" style={{ marginTop: 12 }}>custom uses logged for promotion</div>
              {state.customs.map((c, i) => <div key={i} className="pg-ev"><code>{c.slice(0, 90)}{c.length > 90 ? "..." : ""}</code></div>)}
            </>
          ) : null}
        </div>
      </div>

      <div className="pg-right">
        <div className="pg-tabs">
          {screens.map((k) => (
            <button key={k} className={`pg-tab ${k === shown ? "on" : ""}`} onClick={() => setView(k)}>
              Screen {k}{state.screens[k].length ? ` · ${state.screens[k].length}` : ""}
            </button>
          ))}
        </div>
        <div className="phone pg-phone">
          <div className="screen">
            <div className="notch" />
            <div className="sbar" />
            <div className="ahead">
              <div className="avatar" style={{ background: COLORS[agent] || "var(--accent)" }}>{agent[0]}</div>
              <div><div className="nm">{agent}</div><div className="st">{streaming ? "generating..." : `screen ${shown}`}</div></div>
            </div>
            <div className="pg-screen">
              {nodes.map((n) => (
                <div key={`${epoch}:${n.key}:${n.preset}`} className="pg-node"><Render node={n} emit={emitFor(n)} /></div>
              ))}
              {!nodes.length ? <div className="pg-hint" style={{ textAlign: "center", marginTop: 40 }}>Empty screen</div> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
