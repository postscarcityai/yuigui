"use client";

// The model on the phone (spec/ON-DEVICE.md, YUI-41 step 1): a mock of the four
// small jobs Apple's on-device model does in Yui. The lines in the editor are
// Coach's last reply. Suggested replies are drawn under it, a group ask gets a
// route pill, a push gets a summed-up line and a typed ask gets a draft screen
// while offline. Everything it adds says "on this phone". In the playground a
// few plain rules stand in for the model, so the mock runs anywhere.

import { useMemo, useState } from "react";
import { apply, initialState, parse } from "../../lib/yl/yl.mjs";
import { Render } from "./presets";
import "./ondevice.css";

export const ONDEVICE_VIEWS = [
  ["replies", "Suggested replies"],
  ["route", "Route in a group"],
  ["push", "Push line"],
  ["offline", "Offline draft"],
];

const LOOK = { Coach: "#ff6b3d", Sage: "#4fae8c", Quill: "#8b7cff" };
const GROUP = { title: "Race week", lead: "Coach", members: ["Coach", "Sage", "Quill"] };
// What each member is for, as the person described them. On a phone the model
// reads these lines, not keywords (spec section 3).
const ABOUT = {
  Coach: { what: "training and races", words: ["run", "10k", "race", "train", "pace", "workout", "legs", "stretch", "miles"] },
  Sage: { what: "sleep and calm", words: ["sleep", "wake", "waking", "tired", "stress", "calm", "breath", "bed", "3am", "night"] },
  Quill: { what: "study and flash cards", words: ["learn", "study", "quiz", "cards", "flash", "remember", "exam"] },
};

function nodesOf(text) {
  let s = initialState();
  try { for (const op of parse(text)) s = apply(s, op); } catch { return []; }
  return s.screens["1"] || [];
}
const words = (n) => [n.props.text, n.props.title, n.props.label, n.props.body].filter(Boolean).join(" ");

// Stand-in for the model: short replies to the last screen. Only when the
// screen asks in words; a screen with its own buttons gets none (spec section 2).
function suggest(nodes) {
  if (nodes.some((n) => ["choose", "pick", "ask", "form", "slide"].includes(n.preset))) return [];
  const q = [...nodes].reverse().find((n) => n.preset === "say" && /\?\s*$/.test(n.props.text || ""));
  if (!q) return [];
  const t = q.props.text.replace(/\?\s*$/, "");
  const or = t.split(/\s+or\s+/i);
  const out = [];
  if (or.length === 2) {
    const a = or[0].split(/[:,]\s*/).pop().replace(/^(a|an|the)\s+/i, "");
    const b = or[1].replace(/^(a|an|the)\s+/i, "");
    out.push(a.charAt(0).toUpperCase() + a.slice(1), b.charAt(0).toUpperCase() + b.slice(1));
  } else {
    out.push("Yes", "Not today");
  }
  out.push("Why?");
  return out.slice(0, 3);
}

// Stand-in for the model: pick a member from what each is for. An @name always wins.
function route(text) {
  const t = text.toLowerCase();
  const named = GROUP.members.find((m) => t.includes(`@${m.toLowerCase()}`));
  if (named) return { to: named, why: "you named them", how: "named" };
  let best = null, hits = 0;
  for (const m of GROUP.members) {
    const h = ABOUT[m].words.filter((w) => t.includes(w)).length;
    if (h > hits) { best = m; hits = h; }
  }
  if (!best) return { to: GROUP.lead, why: "the lead", how: "lead" };
  return { to: best, why: ABOUT[best].what, how: "model" };
}

// Stand-in for the model: one line that says what the reply holds.
function summary(nodes) {
  const bits = [];
  for (const n of nodes) {
    if (n.preset === "stat" && typeof n.props.delta === "number") bits.push(`${n.props.label} ${n.props.delta < 0 ? "down" : "up"} ${Math.abs(n.props.delta)}${n.props.unit ? ` ${n.props.unit}` : ""}.`);
    else if (n.preset === "card" && n.props.title) bits.push(`${n.props.title}.`);
    else if (n.preset === "say" && /\?\s*$/.test(n.props.text || "")) bits.push(n.props.text);
  }
  return bits.join(" ") || words(nodes[0] || { props: {} });
}

// Stand-in for the model: a draft screen from a typed ask. Guided generation on
// a phone fills the same shapes (spec section 5).
const DRAFTS = [
  { words: ["stretch", "mobility"], yl: `list Stretch "Hamstrings 2 min" "Calves 2 min" "Hips 3 min" "Quads 2 min" "Lower back 3 min" +check
timer 12m Stretch` },
  { words: ["lunch", "dinner", "meal", "eat", "grocer"], yl: `list Groceries "Eggs" "Greek yogurt" "Rice" "Chicken thighs" "Spinach" +check` },
  { words: ["plan", "week", "schedule"], yl: `list "This week" "Mon" "Tue" "Wed" "Thu" "Fri" +check` },
];
function draft(ask) {
  const t = ask.toLowerCase();
  const d = DRAFTS.find((x) => x.words.some((w) => t.includes(w)));
  return d ? nodesOf(d.yl) : nodesOf(`card "${ask.replace(/"/g, "'")}" "A starting point. Coach answers properly when you're back online."`);
}

function Face({ name, size = 30 }) {
  return <span className="od-face" style={{ background: LOOK[name] || "var(--accent)", width: size, height: size }} aria-hidden="true">{name[0]}</span>;
}
const Tag = ({ children = "on this phone" }) => <span className="od-tag"><span aria-hidden="true">✦</span> {children}</span>;

function Head({ title, sub, faces }) {
  return (
    <div className="ahead od-head">
      <div className="od-faces">{faces.map((f) => <Face key={f} name={f} />)}</div>
      <div><div className="nm">{title}</div><div className="st">{sub}</div></div>
    </div>
  );
}

function Composer({ value, onChange, onSend, placeholder, label }) {
  return (
    <form className="od-comp" onSubmit={(e) => { e.preventDefault(); if (value.trim()) onSend(); }}>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={label || placeholder} />
      <button type="submit" disabled={!value.trim()} aria-label="Send">↑</button>
    </form>
  );
}

function Replies({ nodes, agent, on, onEvent }) {
  const chips = useMemo(() => (on ? suggest(nodes) : []), [nodes, on]);
  const [sent, setSent] = useState([]);
  const [draftText, setDraftText] = useState("");
  const send = (text, via) => {
    setSent((s) => [...s, text]);
    onEvent({ agent, text, ...(via ? { via } : {}) });
  };
  return (
    <>
      <Head title={agent} sub="screen 1" faces={[agent]} />
      <div className="od-msgs">
        <div className="yl-me">How did this week go?</div>
        {nodes.map((n) => <div key={n.key} className="pg-node"><Render node={n} emit={(v) => onEvent({ id: n.id, preset: n.preset, ...v })} /></div>)}
        {sent.map((t, i) => <div key={i} className="yl-me">{t}</div>)}
        {sent.length ? <div className="od-status">{agent} is answering...</div> : null}
      </div>
      {!sent.length && chips.length ? (
        <div className="od-chips" role="group" aria-label="Suggested replies, written on this phone">
          <Tag />
          <div className="od-chip-row">
            {chips.map((c) => <button key={c} className="od-chip" onClick={() => send(c, "suggested")}>{c}</button>)}
          </div>
        </div>
      ) : null}
      {!on && !sent.length ? <div className="od-note">No suggestions without Apple Intelligence. Type as usual.</div> : null}
      <Composer value={draftText} onChange={setDraftText} onSend={() => { send(draftText); setDraftText(""); }} placeholder={`Message ${agent}`} />
    </>
  );
}

function Route({ on, onEvent }) {
  const [text, setText] = useState("I keep waking up at 3am before race days. Ideas?");
  const [pick, setPick] = useState(null); // the person's own choice beats the model's
  const [sent, setSent] = useState([]);
  const auto = on ? route(text) : { ...route(text), ...(route(text).how === "model" ? { to: GROUP.lead, why: "the lead", how: "lead" } : {}) };
  const r = pick ? { to: pick, why: "you picked", how: "picked" } : auto;
  const cycle = () => {
    const i = GROUP.members.indexOf(r.to);
    setPick(GROUP.members[(i + 1) % GROUP.members.length]);
  };
  const send = () => {
    setSent((s) => [...s, { text, to: r.to }]);
    onEvent({ group: "send", to: [r.to.toLowerCase()], text, ...(r.how === "model" ? { routed: "on-device" } : {}) });
    setText(""); setPick(null);
  };
  return (
    <>
      <Head title={GROUP.title} sub={`${GROUP.members.length} agents · ${GROUP.lead} leads`} faces={GROUP.members} />
      <div className="od-msgs">
        <div className="yl-me">@Coach plan my week before Saturday&apos;s 10k</div>
        <div className="od-turn" style={{ "--od": LOOK.Coach }}>
          <div className="od-who"><Face name="Coach" size={20} /> Coach</div>
          <div className="yl-say">Five days, easy then sharp. Rest Friday.</div>
        </div>
        {sent.map((m, i) => (
          <div key={i} className="od-sent">
            <div className="yl-me">{m.text}</div>
            <div className="od-to">to {m.to}</div>
          </div>
        ))}
        {sent.length ? <div className="od-status">{sent[sent.length - 1].to} is answering...</div> : null}
      </div>
      {text.trim() ? (
        <div className="od-route" style={{ "--od": LOOK[r.to] }}>
          <Face name={r.to} size={28} />
          <span className="od-route-to"><b>To {r.to}</b><span className="od-why">{r.why}{r.how === "model" ? <> · <Tag /></> : null}</span></span>
          <button className="od-change" onClick={cycle} aria-label={`Send to someone else, now ${r.to}`}>Change</button>
        </div>
      ) : null}
      {!on ? <div className="od-note">Without the model, anything not named goes to {GROUP.lead}, the lead.</div> : null}
      <Composer value={text} onChange={(v) => { setText(v); setPick(null); }} onSend={send} placeholder="Message the group" />
    </>
  );
}

function Push({ nodes, agent, on }) {
  const line = summary(nodes);
  return (
    <div className="od-lock">
      <div className="od-time">9:41</div>
      <div className="od-date">Saturday, September 26</div>
      <div className="od-notes">
        <div className="od-n">
          <Face name={agent} size={34} />
          <div className="od-n-txt">
            <div className="od-n-top"><b>{agent}</b><span>now</span></div>
            <div className="od-n-body">{on ? line : `${agent} has something for you in Yui`}</div>
            {on ? <Tag>summed up on this phone</Tag> : <div className="od-n-sub">Without the model: the plain line the relay sends.</div>}
          </div>
        </div>
        <div className="od-n od-n-old">
          <Face name="Sage" size={34} />
          <div className="od-n-txt">
            <div className="od-n-top"><b>Sage</b><span>1h ago</span></div>
            <div className="od-n-body">Sage has something for you in Yui</div>
          </div>
        </div>
      </div>
      <div className="od-hint">Only the notification&apos;s text changes. The screen itself is {agent}&apos;s own, and opens as sent.</div>
    </div>
  );
}

function Offline({ agent, on, onEvent }) {
  const [ask, setAsk] = useState("12 minute stretch after my run");
  const [made, setMade] = useState(null);
  const [queued, setQueued] = useState(false);
  const go = () => {
    setMade(on ? draft(ask) : []);
    setQueued(false);
  };
  return (
    <>
      <Head title={agent} sub="offline, messages wait" faces={[agent]} />
      <div className="od-offline" role="status"><span aria-hidden="true">✈</span> No connection</div>
      <div className="od-msgs">
        {made ? <div className="yl-me">{ask}</div> : <div className="od-empty">Type what you need. The phone drafts a screen now; {agent} answers when you&apos;re back online.</div>}
        {made && made.length ? (
          <div className="od-draft">
            <div className="od-draft-top"><Tag>draft on this phone, not from {agent}</Tag></div>
            {made.map((n) => <div key={n.key} className="pg-node"><Render node={n} emit={(v) => onEvent({ id: n.id, preset: n.preset, ...v, draft: true })} /></div>)}
          </div>
        ) : null}
        {made && !made.length ? <div className="od-status">Saved. It goes to {agent} when you&apos;re back online.</div> : null}
        {made && made.length && !queued ? (
          <div className="od-acts">
            <button className="od-btn" onClick={() => { setQueued(true); onEvent({ agent, text: ask, queued: true, drafted: "on-device" }); }}>Ask {agent} when online</button>
            <button className="od-btn od-ghost" onClick={() => setMade(null)}>Discard</button>
          </div>
        ) : null}
        {queued ? <div className="od-status">Waiting for a connection. {agent}&apos;s answer replaces the draft.</div> : null}
      </div>
      {!made ? <Composer value={ask} onChange={setAsk} onSend={go} placeholder={`Message ${agent}`} /> : null}
    </>
  );
}

export function OnDeviceDemo({ text, agent, view, onEvent }) {
  const [on, setOn] = useState(true);
  const nodes = useMemo(() => nodesOf(text), [text]);
  return (
    <div className="od-app">
      {view === "route" ? <Route key="r" on={on} onEvent={onEvent} />
        : view === "push" ? <Push nodes={nodes} agent={agent} on={on} />
        : view === "offline" ? <Offline key={`o${on}`} agent={agent} on={on} onEvent={onEvent} />
        : <Replies key={`s${on}`} nodes={nodes} agent={agent} on={on} onEvent={onEvent} />}
      <div className="od-bar">
        <button className="od-switch" role="switch" aria-checked={on} onClick={() => setOn(!on)}>
          <span className={`od-knob ${on ? "on" : ""}`} aria-hidden="true" />
          {on ? "Model on this phone: ready" : "Model off (Apple Intelligence off or no model)"}
        </button>
        <div className="od-fine">In the playground a few plain rules stand in for the model.</div>
      </div>
    </div>
  );
}
