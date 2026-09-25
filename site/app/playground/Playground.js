"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Parser, StreamParser, apply, initialState, parse } from "../../lib/yl/yl.mjs";
import { SCREENS, DEMOS, MEDIA, SCIENCE, FLOWS, DATA } from "../../lib/yl/samples.mjs";
import { boundTables } from "../../lib/yl/tables.mjs";
import { Render, StepGroup, TABLES } from "./presets";
import { demoReply } from "./games";
import { Group, groupNodes } from "./flows";
import { ScreenCtx } from "./science";
import { LiveSlot, PlanRecord, Stage, StagePill } from "./stage";
import { encodeYL, readYL } from "../../lib/share-code.mjs";
import "./flows.css";

const ALL = [...SCREENS, ...DEMOS, ...MEDIA, ...SCIENCE, ...FLOWS, ...DATA];
// Agent names a share link may carry (?as=), so a shared screen reopens with the same header.
const AGENTS = new Set(ALL.map((s) => s.agent));
const COLORS = { Coach: "var(--arnold)", Scout: "linear-gradient(135deg,#8b7cff,#4fd1c5)", Yui: "linear-gradient(135deg,#4fd1c5,#8b7cff)" };

// `log`: data lines sent after the reply (the agent line, a tapped checkbox),
// replayed on top so agent tables keep them (spec/TABLES.md).
function build(text, log = []) {
  let s = initialState();
  for (const op of parse(text)) s = apply(s, op);
  return replayLog(s, log);
}
const isData = (op) => op.op === "table" || op.op === "put";
function replayLog(s, log) {
  if (log.length) for (const op of parse(log.join("\n"))) if (isData(op)) s = apply(s, op);
  return s;
}

// The playground's agent tables live in this browser: rows added on top of a
// sample stay until Reset data, one log per sample.
const logKey = (i, shared) => `yui-playground-tables:${shared ? "shared" : ALL[i].slug || ALL[i].name}`;
function readLog(key) {
  try { const v = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(v) ? v.filter((x) => typeof x === "string") : []; } catch { return []; }
}
function writeLog(key, log) {
  try { if (log.length) localStorage.setItem(key, JSON.stringify(log.slice(-500))); else localStorage.removeItem(key); } catch { /* private mode: the rows just do not last */ }
}

// The key of the last non-staged node before `n` on its screen (null: none),
// which is where the pill for `n` goes. Group members count as their group.
function lastInline(list, n) {
  let key = null;
  for (const x of list) {
    if (x === n) return key;
    if (!x.stage && !x.in) key = x.key;
  }
  return key;
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
  const [light, setLight] = useState(false); // phone theme: charts and presets in light or dark
  const [editing, setEditing] = useState(false); // phones pin the output above the keyboard while typing
  // Sent plans, by group key: the chat shows a summary chip and the answers as the person's message.
  const [folds, setFolds] = useState({});
  // Share (SITE-19): a link that carries the lines themselves. shared = opened from such a link.
  const [shared, setShared] = useState(null); // the agent name a shared link opened with
  const [link, setLink] = useState(null);
  const agentParser = useRef(null);
  const [log, setLog] = useState([]); // data lines on top of the sample (agent tables)
  const logRef = useRef({ key: logKey(0, false), lines: [] });
  const timer = useRef(null);
  const emits = useRef(new Map());

  const agent = shared || ALL[idx].agent;

  // Live mode: every edit re-renders the whole document. Keys are stable, so
  // components that did not change keep their state.
  useEffect(() => {
    if (streaming) return;
    const t = setTimeout(() => {
      // Editing keeps the stage the way the person left it, unless what is on it changed.
      const stagedKeys = (st) => Object.values(st.screens).flat().filter((n) => n.stage).map((n) => n.key).join();
      setState((prev) => {
        const next = build(text, logRef.current.lines);
        return stagedKeys(prev) === stagedKeys(next) ? { ...next, stage: prev.stage } : next;
      });
      agentParser.current = null;
    }, 150);
    return () => clearTimeout(t);
  }, [text, streaming]);

  // /playground?demo=<slug> opens a media demo directly; ?yl=<lines> opens any lines (the community gallery links here).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const slug = q.get("demo");
    const yl = q.get("yl");
    if (q.get("theme") === "light") setLight(true);
    const i = slug ? ALL.findIndex((s) => s.slug === slug) : -1;
    if (i > 0) load(i);
    // ?yl= holds a Share code (SITE-19) or plain lines (the community gallery); readYL takes both.
    else if (yl) readYL(yl).then((t) => { if (t) openShared(t, AGENTS.has(q.get("as")) ? q.get("as") : "Yui"); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pick = (i) => {
    load(i);
    setShared(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("yl");
    url.searchParams.delete("as");
    if (ALL[i].slug) url.searchParams.set("demo", ALL[i].slug); else url.searchParams.delete("demo");
    window.history.replaceState(null, "", url);
  };

  const load = (i, shared = false) => {
    stopStream();
    const key = logKey(i, shared);
    const lines = readLog(key);
    logRef.current = { key, lines };
    setLog(lines);
    setCmd(ALL[i].next || "");
    setEpoch((x) => x + 1);
    setIdx(i);
    setText(ALL[i].yl);
    setState(build(ALL[i].yl, lines));
    setView(null);
    setEvents([]);
    setFolds({});
    setStreamed(null);
  };

  const openShared = (yl, as) => {
    load(0, true);
    setCmd("");
    setShared(as);
    setText(yl);
    setState(build(yl, logRef.current.lines));
  };

  // A data line on top of the reply: written to the store and kept in this browser.
  const addData = useCallback((op) => {
    const lines = [...logRef.current.lines, op.line.trim()];
    logRef.current = { ...logRef.current, lines };
    writeLog(logRef.current.key, lines);
    setLog(lines);
    setState((s) => apply(s, op));
  }, []);
  const resetData = () => {
    logRef.current = { ...logRef.current, lines: [] };
    writeLog(logRef.current.key, []);
    setLog([]);
    setState(build(text));
  };

  // Share: pack the lines into the URL, copy it, and show it so it can be copied by hand too.
  const share = async () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("demo");
    url.searchParams.set("yl", await encodeYL(text));
    url.searchParams.set("as", agent);
    window.history.replaceState(null, "", url);
    setLink(url.toString());
    try { await navigator.clipboard.writeText(url.toString()); } catch { /* the box below still has it */ }
    try { window.gtag?.("event", "cta_click", { cta: "share:playground", where: "/playground" }); } catch {}
  };
  useEffect(() => { setLink(null); }, [text]);

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
      for (const op of ops) s = apply(s, op);
      // Rows added on top of the sample come back once the reply is in.
      if (i >= src.length) s = replayLog(s, logRef.current.lines);
      if (ops.length || i >= src.length) setState(s);
      if (i >= src.length) { clearInterval(timer.current); setStreaming(false); }
    }, speed);
  };
  useEffect(() => () => clearInterval(timer.current), []);

  // Agent console: one YL line applied on top of what is on screen, the way a
  // running agent would send a follow-up (~patch, >screen, show ...).
  const send = (e) => {
    e.preventDefault();
    agentLine(cmd.trim());
    setCmd("");
  };
  const agentLine = (line) => {
    if (!line) return;
    if (!agentParser.current) {
      // Replay the document through a parser so ids and focus carry over.
      const p = new Parser();
      text.split("\n").forEach((l) => p.line(l));
      agentParser.current = p;
    }
    const op = agentParser.current.line(line);
    if (op && isData(op)) addData(op);
    else if (op) setState((s) => apply(s, op));
    setEvents((ev) => [{ dir: "agent", t: new Date(), line }, ...ev].slice(0, 40));
  };

  // The playground has no agent, so a tic-tac-toe move gets a stand-in
  // reply: the patch a real agent would send, through the agent console.
  const agentRef = useRef(null);
  agentRef.current = agentLine;
  const emitFor = useCallback((node) => {
    const k = `${node.key}:${node.preset}:${node.seq}`;
    if (!emits.current.has(k)) {
      emits.current.set(k, (value) => {
        const ev = { id: node.id, preset: node.preset, ...value, ...(node.saved ? { saved: node.saved } : {}) };
        setEvents((evs) => [{ dir: "user", t: new Date(), ev }, ...evs].slice(0, 40));
        const reply = demoReply(ev);
        if (reply) setTimeout(() => agentRef.current(reply), 700);
      });
    }
    return emits.current.get(k);
  }, []);

  // Lets a preset act on the screen itself, e.g. a project card reopening a
  // saved screen (show name) without a round trip to the agent.
  const dispatch = useCallback((op) => setState((s) => apply(s, op)), []);

  // The shelf (YL.md section 5): the agent's saved screens, newest first. A tap
  // reopens one on the stage with no turn and no tokens; x takes it off.
  const shelf = Object.entries(state.saved).sort((a, b) => b[1].at - a[1].at).map(([name]) => name);
  const reopen = (name) => dispatch({ op: "show", screen: "full", name, line: `show ${name}` });

  // The stage (YL.md section 5): staged components from every screen, drawn
  // over the phone. The chat keeps a pill where they were.
  const [live, setLive] = useState({});
  const onLive = useCallback((k, t) => setLive((l) => (l[k] === t ? l : { ...l, [k]: t })), []);
  const closeStage = useCallback(() => setState((s) => ({ ...s, stage: false })), []);
  const openStage = () => setState((s) => ({ ...s, stage: true }));
  const fold = useCallback((key, rec) => setFolds((f) => ({ ...f, [key]: rec })), []);

  const screens = Object.keys(state.screens).filter((k) => k !== "full");
  const focus = state.focus === "full" ? "1" : state.focus;
  const shown = view && state.screens[view] && view !== "full" ? view : focus;
  const nodes = (state.screens[shown] || []).filter((n) => !n.stage);
  const staged = Object.values(state.screens).flat().filter((n) => n.stage).sort((a, b) => a.seq - b.seq);
  // Where staged nodes sat on this screen: one pill per run of them.
  const pills = [];
  for (const n of state.screens[shown] || []) {
    if (!n.stage) continue;
    const prev = pills[pills.length - 1];
    if (prev && prev.after === lastInline(state.screens[shown], n)) prev.nodes.push(n);
    else pills.push({ after: lastInline(state.screens[shown], n), nodes: [n] });
  }
  if ((state.screens.full || []).length && shown === "1") pills.push({ after: null, nodes: state.screens.full, end: true });
  const pillAt = (key) => pills.filter((p) => !p.end && p.after === key);
  const renderNode = (n) => n.steps ? (
    <div key={`${epoch}:${n.key}:steps`} className="pg-node"><StepGroup nodes={n.steps} emitFor={emitFor} /></div>
  ) : n.group ? (
    <div key={`${epoch}:${n.key}:${n.group.preset}`} className="pg-node"><Group g={n} emitFor={emitFor} Render={Render} /></div>
  ) : (
    <div key={`${epoch}:${n.key}:${n.preset}`} className="pg-node"><Render node={n} emit={emitFor(n)} /></div>
  );
  // A sent plan leaves its record where its pill was: the chip, then the person's answers.
  const pill = (p, i) => {
    const rec = folds[p.nodes[0].key];
    if (!rec) return <StagePill key={`pill:${p.nodes[0].key}:${i}`} nodes={p.nodes} live={live} onOpen={openStage} />;
    return [
      <PlanRecord key={`rec:${p.nodes[0].key}`} rec={rec} onOpen={openStage} />,
      <div key={`me:${p.nodes[0].key}`} className="yl-me">{rec.text}</div>,
    ];
  };
  const lines = useMemo(() => text.split("\n").filter((l) => l.trim() && !l.trim().startsWith("# ")).length, [text]);

  return (
    <div className={editing ? "pg editing" : "pg"} onFocus={(e) => setEditing(e.target.matches(".pg-code, .pg-agent input"))} onBlur={() => setEditing(false)}>
      <div className="pg-left">
        <div className="pg-row">
          <select aria-label="Screen" value={shared ? "shared" : idx} onChange={(e) => pick(Number(e.target.value))}>
            {shared ? <option value="shared" disabled>Shared with you</option> : null}
            <optgroup label="Benchmark screens">
              {SCREENS.map((s, i) => <option key={s.name} value={i}>{i + 1}. {s.name}</option>)}
            </optgroup>
            <optgroup label="Line types">
              {DEMOS.map((s, i) => <option key={s.name} value={SCREENS.length + i}>{s.name}</option>)}
            </optgroup>
            <optgroup label="Media">
              {MEDIA.map((s, i) => <option key={s.name} value={SCREENS.length + DEMOS.length + i}>{s.name}</option>)}
            </optgroup>
            <optgroup label="Data and science">
              {SCIENCE.map((s, i) => <option key={s.name} value={SCREENS.length + DEMOS.length + MEDIA.length + i}>{s.name}</option>)}
            </optgroup>
            <optgroup label="Decks, plans, flows and walkthroughs">
              {FLOWS.map((s, i) => <option key={s.name} value={SCREENS.length + DEMOS.length + MEDIA.length + SCIENCE.length + i}>{s.name}</option>)}
            </optgroup>
            <optgroup label="Agent tables">
              {DATA.map((s, i) => <option key={s.name} value={SCREENS.length + DEMOS.length + MEDIA.length + SCIENCE.length + FLOWS.length + i}>{s.name}</option>)}
            </optgroup>
          </select>
          <button className="pg-btn" onClick={streaming ? stopStream : stream}>{streaming ? "Stop" : "▶ Stream it"}</button>
          <button className="pg-btn" onClick={share} disabled={!text.trim()}>Share</button>
        </div>
        {link ? (
          <div className="pg-share">
            <input readOnly value={link} aria-label="Share link" onFocus={(e) => e.target.select()} />
            <span className="share-said" role="status">Link copied. It opens this exact screen.</span>
          </div>
        ) : null}
        <label className="pg-hint">
          YL the agent sends ({lines} line{lines === 1 ? "" : "s"}, {text.length} chars). Edit it, the phone updates live.
        </label>
        {streaming || streamed ? (
          <pre className="pg-stream" onClick={() => !streaming && setStreamed(null)}>
            {streamed}{streaming ? <span className="pg-caret">▍</span> : <span className="pg-hint"> (click to edit again)</span>}
          </pre>
        ) : (
          <textarea className="pg-code" aria-label="YL source" value={text} spellCheck={false} onChange={(e) => setText(e.target.value)} rows={9} />
        )}
        <div className="pg-row pg-hint">
          Stream speed
          <input type="range" aria-label="Stream speed" min={10} max={150} value={160 - speed} onChange={(e) => setSpeed(160 - Number(e.target.value))} />
        </div>

        <form className="pg-agent" onSubmit={send}>
          <span className="pg-hint">Agent line (applied on top, no re-render):</span>
          <div className="pg-row">
            <input value={cmd} onChange={(e) => setCmd(e.target.value)} placeholder="~timer rounds=10   >2 ask Ready?   show warmup" spellCheck={false} />
            <button className="pg-btn">Send</button>
          </div>
          {log.length ? (
            <div className="pg-row pg-hint">
              {log.length} data line{log.length === 1 ? "" : "s"} kept in this browser, on top of the sample.
              <button type="button" className="pg-btn" onClick={resetData}>Reset data</button>
            </div>
          ) : null}
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
          {staged.length ? (
            <button className={`pg-tab ${state.stage ? "on" : ""}`} onClick={state.stage ? closeStage : openStage}>
              ⤢ Full screen · {staged.length}
            </button>
          ) : null}
          <button className="pg-tab" onClick={() => {
            const url = new URL(window.location.href);
            if (light) url.searchParams.delete("theme"); else url.searchParams.set("theme", "light");
            window.history.replaceState(null, "", url);
            setLight(!light);
          }}>{light ? "☾ Dark" : "☀ Light"}</button>
        </div>
        <div className="phone pg-phone">
          <div className={`screen ${light ? "light" : ""}`}>
            <div className="notch" />
            <div className="sbar" />
            <div className="ahead">
              <div className="avatar" style={{ background: COLORS[agent] || "var(--accent)" }}>{agent[0]}</div>
              <div><div className="nm">{agent}</div><div className="st">{streaming ? "generating..." : `screen ${shown}`}</div></div>
            </div>
            {shelf.length ? (
              <div className="yl-shelf" role="list" aria-label="Saved screens">
                {shelf.map((name) => (
                  <span key={name} className="yl-shelf-chip" role="listitem">
                    <button onClick={() => reopen(name)}>{name}</button>
                    <button className="x" aria-label={`Remove ${name}`} onClick={() => dispatch({ op: "forget", screen: "1", name, line: `forget ${name}` })}>×</button>
                  </span>
                ))}
              </div>
            ) : null}
            <div className="pg-screen">
              <ScreenCtx.Provider value={{ nodes, tables: { ...TABLES, ...boundTables(state.data) }, data: state.data, write: addData, agent, screen: shown, dispatch, fold, closeStage }}>
                {pillAt(null).map(pill)}
                {groupNodes(nodes).flatMap((n) => [renderNode(n), ...pillAt(n.key).map(pill)])}
                {pills.filter((p) => p.end).map(pill)}
              </ScreenCtx.Provider>
              {!nodes.length && !pills.length ? <div className="pg-hint" style={{ textAlign: "center", marginTop: 40 }}>Empty screen</div> : null}
            </div>
            <Stage open={state.stage && staged.length > 0} onClose={closeStage} agent={agent}>
              <ScreenCtx.Provider value={{ nodes: staged, tables: { ...TABLES, ...boundTables(state.data) }, data: state.data, write: addData, agent, screen: "full", dispatch, fold, closeStage }}>
                {groupNodes(staged).map((n) => <LiveSlot key={`${epoch}:${n.key}:slot`} id={n.key} onLive={onLive}>{renderNode(n)}</LiveSlot>)}
              </ScreenCtx.Provider>
            </Stage>
          </div>
        </div>
      </div>
    </div>
  );
}
