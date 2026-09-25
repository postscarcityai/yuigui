"use client";

// Restyle Yui by asking (spec/RESTYLE.md, YUI-43 step 1): a mock of the app
// when an agent sends `theme app ...`. The lines in the editor are the agent's
// reply; the preview card, the restyled chrome and Settings are the app's own
// screens, drawn from the look the line asks for (site/lib/yl/look.mjs, the
// same contrast guard as the app). Nothing changes until Apply is tapped.

import { useMemo, useState } from "react";
import { parse } from "../../lib/yl/yl.mjs";
import { SETS, YUI, appLook, checks } from "../../lib/yl/look.mjs";
import "./restyle.css";

export const RESTYLE_VIEWS = [
  ["ask", "Ask and preview"],
  ["applied", "Applied"],
  ["settings", "Settings, reset"],
];

// The person's other agents, each in its own look (agent looks keep theirs).
const AGENTS = [
  { name: "Coach", c: "#FF5A36", last: "Rest day. Walk 30 min if you feel like it." },
  { name: "Sage", c: "#4E9A6B", last: "Wind-down at 10. Lights low." },
  { name: "Quill", c: "#8E44C8", last: "Flash cards ready: 12 new." },
];
const RADIUS = { yui: 22, round: 24, soft: 18, square: 10 };
const FONT = { rounded: "ui-rounded, 'SF Pro Rounded', system-ui, sans-serif", default: "system-ui, sans-serif", serif: "ui-serif, Georgia, 'New York', serif", mono: "ui-monospace, Menlo, monospace" };
const WEIGHT = { regular: 500, bold: 700, heavy: 800 };
const title = (s) => s[0].toUpperCase() + s.slice(1);

// CSS variables for one look in one mode.
function vars(look, dark) {
  const p = dark ? look.dark : look.light;
  return {
    "--rs-bg": p.background, "--rs-surface": p.surface, "--rs-ink": p.ink, "--rs-soft": p.inkSoft,
    "--rs-line": p.outline, "--rs-acc": p.accent, "--rs-on": p.onAccent, "--rs-user": p.userBubble,
    "--rs-user-ink": p.userInk, "--rs-agent": p.agentBubble, "--rs-agent-ink": p.agentInk,
    "--rs-r": `${RADIUS[look.radius] || 18}px`, "--rs-font": FONT[look.font] || FONT.rounded, "--rs-w": WEIGHT[look.weight] || 800,
  };
}

// What the reply asks for: its say lines, its last `theme app` line, and any errors.
function readReply(text) {
  const ops = parse(text || "");
  const says = ops.filter((o) => o.op === "add" && o.preset === "say").map((o) => o.props.text);
  const offer = ops.filter((o) => o.op === "theme" && o.props.scope === "app").pop() || null;
  const errors = ops.filter((o) => o.op === "error").map((o) => o.message);
  return { says, offer, errors };
}

function lookName(props) {
  if (props.name === "reset") return "Yui's look";
  if (props.name) return title(props.name);
  return "this look";
}

// What the guard changed, in one plain line (nothing when nothing changed).
function guardLine(props, look) {
  if (look === YUI) return null;
  const moved = [...look.adjusted.light.map(() => "light"), ...look.adjusted.dark.map(() => "dark")];
  if (!moved.length) return null;
  const color = props.accent ? (SETS[props.accent] ? title(props.accent) : props.accent.toUpperCase()) : `${lookName(props)}'s accent`;
  const modes = moved.length === 2 ? "light and dark" : moved[0];
  return `${color} was adjusted in ${modes} mode so text on buttons stays readable.`;
}

// The app's home screen: wordmark, agent list, tab bar. `mini` draws it small, for the preview.
function Home({ look, dark, mini, note, onUndo, tab = "chats", onTab }) {
  return (
    <div className={`rs-app ${mini ? "rs-mini" : ""}`} style={vars(look, dark)}>
      <div className="rs-top">
        <span className="rs-word">yui</span>
        {mini ? null : <span className="rs-top-sub">{tab === "settings" ? "Settings" : "Chats"}</span>}
      </div>
      {note ? (
        <div className="rs-note">
          <span>{note}</span>
          {onUndo ? <button className="rs-link" onClick={onUndo}>Undo</button> : null}
        </div>
      ) : null}
      <div className="rs-list">
        {[{ name: "Yui", c: "var(--rs-acc)", last: "Yui is the app's own agent." }, ...AGENTS].slice(0, mini ? 2 : 4).map((a) => (
          <div key={a.name} className="rs-row">
            <span className="rs-face" style={{ background: a.c, color: a.name === "Yui" ? "var(--rs-on)" : "#fff" }}>{a.name[0]}</span>
            <span className="rs-txt"><span className="rs-nm">{a.name}</span><span className="rs-last">{a.last}</span></span>
          </div>
        ))}
      </div>
      <Tabs tab={tab} onTab={onTab} />
    </div>
  );
}

function Tabs({ tab, onTab }) {
  return (
    <div className="rs-tabs" role="tablist">
      {[["chats", "Chats"], ["settings", "Settings"]].map(([k, l]) => (
        <button key={k} role="tab" aria-selected={tab === k} className={`rs-tab ${tab === k ? "on" : ""}`} onClick={() => onTab && onTab(k)}>{l}</button>
      ))}
    </div>
  );
}

// The card a `theme app` line draws in the thread: Now beside the new look.
function Preview({ now, next, props, dark, state, onApply, onKeep }) {
  const [mode, setMode] = useState(dark ? "dark" : "light");
  const d = mode === "dark";
  const g = guardLine(props, next);
  const worst = next === YUI ? null : Math.min(...checks(next[mode]).filter((c) => c.min > 4).map((c) => c.ratio));
  if (state === "kept") return <div className="rs-card rs-done">Kept your look.</div>;
  return (
    <div className="rs-card">
      <div className="rs-card-head">
        <span>Restyle Yui?</span>
        <span className="rs-seg" role="group" aria-label="Preview mode">
          <button className={mode === "light" ? "on" : ""} onClick={() => setMode("light")}>Light</button>
          <button className={mode === "dark" ? "on" : ""} onClick={() => setMode("dark")}>Dark</button>
        </span>
      </div>
      <div className="rs-pair">
        <figure><Home look={now} dark={d} mini /><figcaption>Now</figcaption></figure>
        <figure><Home look={next} dark={d} mini /><figcaption>{title(lookName(props))}</figcaption></figure>
      </div>
      {g ? <div className="rs-guard">{g}</div> : null}
      {worst ? <div className="rs-guard">Text reads at {worst}:1 or better in {mode} mode.</div> : null}
      <div className="rs-btns">
        <button className="rs-go" onClick={onApply}>{props.name && props.name !== "reset" ? `Use ${props.name}` : props.name === "reset" ? "Use Yui's look" : "Use this look"}</button>
        <button className="rs-keep" onClick={onKeep}>Keep mine</button>
      </div>
    </div>
  );
}

function Settings({ look, dark, name, onReset, note, onTab }) {
  const [keep, setKeep] = useState(true);
  return (
    <div className="rs-app" style={vars(look, dark)}>
      <div className="rs-top"><span className="rs-word">yui</span><span className="rs-top-sub">Settings</span></div>
      {note ? <div className="rs-note"><span>{note}</span></div> : null}
      <div className="rs-list">
        <div className="rs-sec">Look</div>
        <div className="rs-set">
          <span className="rs-sw" style={{ background: "var(--rs-acc)" }} />
          <span className="rs-txt"><span className="rs-nm">{name}</span><span className="rs-last">{name === "Yui" ? "Yui's own look" : "Applied from Yui's thread"}</span></span>
        </div>
        <button className="rs-set rs-toggle" role="switch" aria-checked={keep} onClick={() => setKeep(!keep)}>
          <span className="rs-txt"><span className="rs-nm">Agents keep their own looks</span><span className="rs-last">{keep ? "Each thread wears its agent's colors." : `Every thread wears ${name === "Yui" ? "Yui's look" : name}.`}</span></span>
          <span className={`rs-knob ${keep ? "on" : ""}`} aria-hidden="true" />
        </button>
        {name === "Yui" ? null : <button className="rs-set rs-reset" onClick={onReset}>Back to Yui&apos;s look</button>}
        <div className="rs-sec">Appearance</div>
        <div className="rs-set"><span className="rs-txt"><span className="rs-nm">Light, dark or system</span><span className="rs-last">{dark ? "Dark" : "Light"}</span></span></div>
      </div>
      <Tabs tab="settings" onTab={onTab} />
    </div>
  );
}

export function RestyleDemo({ text, dark, view, setView, onEvent }) {
  const { says, offer, errors } = useMemo(() => readReply(text), [text]);
  const props = offer ? offer.props : null;
  const next = useMemo(() => (props ? appLook(props) : null), [props]);
  const [card, setCard] = useState("open");
  const [resetNote, setResetNote] = useState(null);
  const ev = (choice) => onEvent({ id: "restyle", event: "theme", scope: "app", choice, ...(props && props.name ? { name: props.name } : {}) });

  if (view === "applied" && next) {
    return (
      <Home look={next} dark={dark} note={`Yui is ${props.name && props.name !== "reset" ? props.name : props.name === "reset" ? "back to its own look" : "in its new look"} now.`}
        onUndo={() => { ev("undo"); setCard("open"); setView("ask"); }} onTab={(k) => k === "settings" && setView("settings")} />
    );
  }
  if (view === "settings") {
    const on = next && !resetNote ? next : YUI;
    return <Settings key={resetNote ? "r" : "s"} look={on} dark={dark} name={on === YUI ? "Yui" : title(lookName(props))} note={resetNote}
      onTab={(k) => { if (k === "chats") { setResetNote(null); setCard("open"); setView(on === YUI ? "ask" : "applied"); } }}
      onReset={() => { onEvent({ id: "restyle", event: "theme", scope: "app", choice: "reset", via: "settings" }); setResetNote("Back to Yui's look."); }} />;
  }
  return (
    <div className="rs-app rs-thread" style={vars(YUI, dark)}>
      <div className="rs-top"><span className="rs-face" style={{ background: "var(--rs-acc)", color: "var(--rs-on)" }}>Y</span><span className="rs-top-sub">Yui</span></div>
      <div className="rs-msgs">
        <div className="rs-me">make Yui feel like autumn</div>
        {says.map((s, i) => <div key={i} className="rs-say">{s}</div>)}
        {errors.map((e, i) => <div key={`e${i}`} className="rs-err">{e}</div>)}
        {next ? (
          <Preview key={offer.line} now={YUI} next={next} props={props} dark={dark} state={card}
            onApply={() => { ev("apply"); setView("applied"); }}
            onKeep={() => { ev("keep"); setCard("kept"); }} />
        ) : errors.length ? null : <div className="rs-err">No theme app line in the reply yet.</div>}
      </div>
    </div>
  );
}
