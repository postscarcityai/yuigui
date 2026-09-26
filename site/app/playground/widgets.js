"use client";

// Widgets and Siri (spec/WIDGETS.md, YUI-40 step 1): a mock of Yui outside the
// app. The lines in the editor are the agent's reply: three pages, each saved.
// A widget is a pinned saved screen, so the home screen, the lock screen and
// Siri's sheet are drawn from those saved screens with the playground's own
// preset renderers. "Coach patches weight" sends a patch to a lasting id, the
// way an agent keeps a pinned screen current; the widget follows.

import { useEffect, useMemo, useState } from "react";
import { apply, initialState, parse } from "../../lib/yl/yl.mjs";
import { Render } from "./presets";
import "./widgets.css";

export const WIDGET_VIEWS = [
  ["home", "Home screen"],
  ["lock", "Lock screen"],
  ["siri", "Siri"],
];

// What the agent sends later, one patch at a time (spec section 3).
const PATCHES = [
  `~weight 178.4lb delta=-2.8 spark=181.2|180.6|179.8|178.9|178.4 sub="since Monday"`,
  `~weight 178.1lb delta=-3.1 spark=181.2|180.6|179.8|178.9|178.4|178.1 sub="since Monday"`,
];

// Saved screens as they are now: the nodes saved under each name, each one
// replaced by its newest version, since a patch to a lasting id reaches the
// saved screens that hold it (spec/YL.md section 5).
function shelf(text, patches) {
  let s = initialState();
  for (const op of parse([text, ...patches].join("\n"))) s = apply(s, op);
  const live = new Map();
  for (const list of Object.values(s.screens)) for (const n of list) if (n.id && (!live.has(n.id) || n.seq > live.get(n.id).seq)) live.set(n.id, n);
  const out = {};
  for (const [name, shot] of Object.entries(s.saved)) out[name] = shot.nodes.map((n) => (n.id && live.get(n.id)) || n);
  return out;
}
const first = (nodes, preset) => (nodes || []).find((n) => n.preset === preset) || null;
const secs = (t) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;

// A widget's frame: the size, the agent's name, and a tap that opens the saved screen.
function Widget({ size, name, agent, flash, onOpen, children }) {
  return (
    <section className={`wg-w wg-${size} ${flash ? "wg-flash" : ""}`} aria-label={`${agent} widget, ${name}`}>
      <header className="wg-head">
        <button className="wg-open" onClick={onOpen} aria-label={`Open ${name} in Yui`}>
          <span className="wg-face">{agent[0]}</span>{agent} · {name}
        </button>
        {flash ? <span className="wg-fresh">updated</span> : null}
      </header>
      <div className="wg-body">{children}</div>
    </section>
  );
}

// The timer as a widget: its label, the time, and Start or Pause (a LiveActivityIntent).
function useTimer(node) {
  const total = node ? Number(node.props.work) || 60 : 60;
  const [left, setLeft] = useState(total);
  const [running, setRunning] = useState(false);
  useEffect(() => setLeft(total), [total]);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setLeft((x) => (x > 1 ? x - 1 : (setRunning(false), 0))), 1000);
    return () => clearInterval(t);
  }, [running]);
  return { total, left, running, setRunning, label: node ? node.props.label || "Timer" : "Timer" };
}

function Ring({ frac, children }) {
  const r = 26, c = 2 * Math.PI * r;
  return (
    <div className="wg-ring">
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r={r} className="wg-ring-bg" />
        <circle cx="32" cy="32" r={r} className="wg-ring-fg" strokeDasharray={c} strokeDashoffset={c * (1 - frac)} transform="rotate(-90 32 32)" />
      </svg>
      <span>{children}</span>
    </div>
  );
}

export function WidgetsDemo({ text, view, setView, agent, onEvent }) {
  const [patches, setPatches] = useState([]);
  const [flash, setFlash] = useState(false);
  const [opened, setOpened] = useState(null);
  const [siri, setSiri] = useState("show");
  const [asked, setAsked] = useState(false);
  const saved = useMemo(() => shelf(text, patches), [text, patches]);
  const names = Object.keys(saved);
  const statName = names.find((k) => first(saved[k], "stat"));
  const listName = names.find((k) => first(saved[k], "list"));
  const timerName = names.find((k) => first(saved[k], "timer"));
  const stat = first(saved[statName], "stat");
  const list = first(saved[listName], "list");
  const tnode = first(saved[timerName], "timer");
  const timer = useTimer(tnode);
  const [checked, setChecked] = useState({});

  // Every widget event is the thread's event plus saved and via (spec section 5).
  const emitFor = (n, name) => (value) => onEvent({ id: n.id, preset: n.preset, ...value, saved: name, via: "widget" });
  const listEmit = list ? (value) => { setChecked((c) => ({ ...c, [value.item]: value.checked })); emitFor(list, listName)(value); } : null;
  const toggleTimer = (via) => {
    const start = !timer.running;
    timer.setRunning(start);
    onEvent({ id: tnode.id, preset: "timer", ...(start ? { started: true } : { paused: true }), saved: timerName, via });
  };
  const patch = () => {
    const next = PATCHES[patches.length % PATCHES.length];
    setPatches((p) => (p.length >= PATCHES.length ? [next] : [...p, next]));
    setFlash(true);
    setTimeout(() => setFlash(false), 1600);
  };
  const open = (name) => setOpened(name);

  if (!stat || !list || !tnode) {
    return <div className="wg-home"><div className="wg-err">The reply needs a saved stat, a saved checklist and a saved timer to pin.</div></div>;
  }
  const nextItem = list.props.items.find((it) => !checked[it]);
  const dq = stat.props.delta;

  if (opened) {
    return (
      <div className="wg-home wg-opened">
        <div className="wg-sheet">
          <div className="wg-sheet-top"><span className="wg-face">{agent[0]}</span><b>{agent}</b><span className="wg-sub">{opened}, from the shelf</span></div>
          <div className="wg-stage">
            {saved[opened].map((n) => <div key={n.key} className="pg-node"><Render node={n} emit={emitFor(n, opened)} /></div>)}
          </div>
          <button className="wg-btn" onClick={() => setOpened(null)}>Back to the home screen</button>
        </div>
      </div>
    );
  }

  if (view === "lock") {
    return (
      <div className="wg-lock">
        <div className="wg-inline">{stat.props.label} {stat.props.value}{stat.props.unit ? ` ${stat.props.unit}` : ""} {typeof dq === "number" ? `${dq < 0 ? "▼" : "▲"}${Math.abs(dq)}` : ""}</div>
        <div className="wg-time">9:41</div>
        <div className="wg-date">Saturday, September 26</div>
        <div className="wg-acc">
          <button className="wg-circ" onClick={() => toggleTimer("lock-screen")} aria-label={`${timer.running ? "Pause" : "Start"} ${timer.label}`}>
            <Ring frac={timer.left / timer.total}>{timer.running ? secs(timer.left) : "▶"}</Ring>
          </button>
          <div className="wg-rect">
            <div className="wg-rect-lbl">{stat.props.label}</div>
            <div className="wg-rect-val">{stat.props.value}<small>{stat.props.unit || ""}</small></div>
            <div className="wg-rect-sub">{typeof dq === "number" ? `${dq < 0 ? "▼" : "▲"} ${Math.abs(dq)} ${stat.props.sub || ""}` : stat.props.sub}</div>
          </div>
          <div className="wg-rect">
            <div className="wg-rect-lbl">{list.props.title || listName}</div>
            <div className="wg-rect-val wg-rect-item">{nextItem || "All done"}</div>
            {nextItem ? <button className="wg-tick" onClick={() => listEmit({ item: nextItem, checked: true })}>Done</button> : null}
          </div>
        </div>
        {timer.running ? (
          <div className="wg-live" aria-label="Live Activity">
            <Ring frac={timer.left / timer.total}>{""}</Ring>
            <div><div className="wg-rect-lbl">{agent} · {timer.label}</div><div className="wg-live-t">{secs(timer.left)}</div></div>
            <button className="wg-tick" onClick={() => toggleTimer("live-activity")}>Pause</button>
          </div>
        ) : null}
        <div className="wg-hint">Buttons here wait for Face ID on a real phone.</div>
      </div>
    );
  }

  if (view === "siri") {
    const SAY = {
      show: `Show ${statName} in Yui`,
      start: `Start ${timer.label.toLowerCase()} in Yui`,
      ask: `Ask ${agent} in Yui`,
    };
    return (
      <div className="wg-home wg-dim">
        <div className="wg-siri">
          <div className="wg-orb" aria-hidden="true" />
          <div className="wg-said">&ldquo;{SAY[siri]}&rdquo;</div>
          {siri === "show" ? (
            <>
              <div className="wg-snip"><Render node={stat} emit={emitFor(stat, statName)} /></div>
              <button className="wg-btn" onClick={() => open(statName)}>Open in Yui</button>
            </>
          ) : siri === "start" ? (
            <>
              <div className="wg-snip wg-snip-row">
                <Ring frac={timer.left / timer.total}>{secs(timer.left)}</Ring>
                <div><b>{timer.label}</b><div className="wg-sub">{timer.running ? "running on your lock screen" : "paused"}</div></div>
              </div>
              <button className="wg-btn" onClick={() => toggleTimer("siri")}>{timer.running ? "Pause" : "Start again"}</button>
            </>
          ) : asked ? (
            <div className="wg-snip"><b>Sent to {agent}.</b><div className="wg-sub">The answer comes as a notification, screens and all.</div></div>
          ) : (
            <>
              <div className="wg-snip"><b>What do you want to ask?</b><div className="wg-sub">&ldquo;Can I swap today&apos;s walk for a swim?&rdquo;</div></div>
              <button className="wg-btn" onClick={() => { setAsked(true); onEvent({ agent, text: "Can I swap today's walk for a swim?", via: "siri" }); }}>Send to {agent}</button>
            </>
          )}
          <div className="wg-phrases" role="group" aria-label="Try another phrase">
            {Object.entries(SAY).map(([k, s]) => (
              <button key={k} className={k === siri ? "on" : ""} onClick={() => {
                setSiri(k); setAsked(false);
                if (k === "start" && !timer.running) toggleTimer("siri");
              }}>{s}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wg-home">
      <div className="wg-grid">
        <Widget size="small" name={timerName} agent={agent} onOpen={() => open(timerName)}>
          <div className="wg-timer">
            <Ring frac={timer.left / timer.total}>{secs(timer.left)}</Ring>
            <div className="wg-timer-lbl">{timer.label}</div>
            <button className="wg-go" onClick={() => toggleTimer("widget")}>{timer.running ? "Pause" : "Start"}</button>
          </div>
        </Widget>
        <div className="wg-icons" aria-hidden="true">
          {["#ff7a6b", "#4fd1c5", "#8b7cff", "#ffc857"].map((c) => <span key={c} style={{ background: c }} />)}
        </div>
        <Widget size="medium" name={statName} agent={agent} flash={flash} onOpen={() => open(statName)}>
          <Render key={stat.props.value} node={stat} emit={emitFor(stat, statName)} />
        </Widget>
        <Widget size="large" name={listName} agent={agent} onOpen={() => open(listName)}>
          <Render node={list} emit={listEmit} />
        </Widget>
      </div>
      <div className="wg-agentbar">
        <button className="wg-btn" onClick={patch}>{agent} patches {statName}</button>
        <button className="wg-btn wg-ghost" onClick={() => setView("lock")}>Lock the phone</button>
      </div>
    </div>
  );
}
